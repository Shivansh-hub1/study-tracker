import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, ensureSettings } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json().catch(() => ({}));
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (String(password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  const db = await getDb();
  const exists = await db.get("SELECT id FROM users WHERE email = ?", String(email).toLowerCase().trim());
  if (exists) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  const info = await db.run(
    "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?,?,?,?,?)",
    String(name).trim(),
    String(email).toLowerCase().trim(),
    bcrypt.hashSync(String(password), 10),
    "user",
    new Date().toISOString()
  );
  await ensureSettings(db, info.lastInsertRowid);
  setAuthCookie(await signToken(info.lastInsertRowid));
  return NextResponse.json({ ok: true });
}
