import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, deleteUserCascade } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const db = await getDb();
  const id = Number(params.id);
  const user = (await db.get(
    "SELECT id, name, email, role, created_at, last_active_at FROM users WHERE id = ?",
    id
  )) as any;
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const subjects = await db.all("SELECT id, name, color, target_minutes FROM subjects WHERE user_id = ?", id);
  const goals = await db.all("SELECT id, title, kind, target FROM goals WHERE user_id = ?", id);
  const recent = await db.all(
    `SELECT se.id, se.type, se.started_at, se.duration_sec, s.name as subject_name, s.color as subject_color
     FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id
     WHERE se.user_id = ? ORDER BY se.started_at DESC LIMIT 8`,
    id
  );
  const totals = (await db.get(
    "SELECT COUNT(*) as sessions, COALESCE(SUM(duration_sec),0) as total_sec, MAX(started_at) as last_session FROM sessions WHERE user_id = ?",
    id
  )) as any;
  return NextResponse.json({ user, subjects, goals, recent, totals });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const db = await getDb();
  const id = Number(params.id);
  const target = (await db.get("SELECT id, role FROM users WHERE id = ?", id)) as any;
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, role, password } = await req.json().catch(() => ({}));
  if (role && role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Role must be 'user' or 'admin'" }, { status: 400 });
  }
  // Never let an admin lock themselves out
  if (id === admin.id && role === "user") {
    return NextResponse.json({ error: "You can't remove your own admin role" }, { status: 400 });
  }
  if (name?.trim()) await db.run("UPDATE users SET name = ? WHERE id = ?", String(name).trim(), id);
  if (role) await db.run("UPDATE users SET role = ? WHERE id = ?", role, id);
  if (password) {
    if (String(password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    await db.run("UPDATE users SET password_hash = ? WHERE id = ?", bcrypt.hashSync(String(password), 10), id);
  }
  const updated = await db.get("SELECT id, name, email, role, created_at, last_active_at FROM users WHERE id = ?", id);
  return NextResponse.json({ user: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const id = Number(params.id);
  if (id === admin.id) return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
  const db = await getDb();
  const target = await db.get("SELECT id FROM users WHERE id = ?", id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteUserCascade(db, id);
  return NextResponse.json({ ok: true });
}
