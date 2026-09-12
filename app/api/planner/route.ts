import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function mondayKey(d: Date) {
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  m.setUTCDate(m.getUTCDate() - ((m.getUTCDay() + 6) % 7));
  return m.toISOString().slice(0, 10);
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const blocks = await db.all(
    `SELECT b.*, s.name as subject_name, s.color as subject_color FROM planner_blocks b
     LEFT JOIN subjects s ON s.id = b.subject_id WHERE b.user_id = ? ORDER BY b.day ASC, b.id ASC`,
    user.id
  );
  return NextResponse.json({ blocks, weekKey: mondayKey(new Date()) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { day, subject_id, title, minutes } = await req.json().catch(() => ({}));
  const d = Number(day);
  if (!Number.isInteger(d) || d < 0 || d > 6) return NextResponse.json({ error: "day must be 0 (Mon)–6 (Sun)" }, { status: 400 });
  const db = await getDb();
  let sid: number | null = subject_id ? Number(subject_id) : null;
  if (sid) {
    const ok = await db.get("SELECT id FROM subjects WHERE id = ? AND user_id = ?", sid, user.id);
    if (!ok) return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }
  const info = await db.run(
    "INSERT INTO planner_blocks (user_id, day, subject_id, title, minutes, created_at) VALUES (?,?,?,?,?,?)",
    user.id, d, sid, String(title || "").trim().slice(0, 80), Math.max(5, Math.min(600, Number(minutes) || 60)), new Date().toISOString()
  );
  const row = await db.get("SELECT * FROM planner_blocks WHERE id = ?", info.lastInsertRowid);
  return NextResponse.json({ block: row }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, done } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDb();
  await db.run("UPDATE planner_blocks SET done_week = ? WHERE id = ? AND user_id = ?",
    done ? mondayKey(new Date()) : "", Number(id), user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDb();
  await db.run("DELETE FROM planner_blocks WHERE id = ? AND user_id = ?", id, user.id);
  return NextResponse.json({ ok: true });
}
