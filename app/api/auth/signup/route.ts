import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, ensureSettings } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { sendWelcome } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json().catch(() => ({}));
  const nm = String(name || "").trim();
  const em = String(email || "").toLowerCase().trim();
  const pw = String(password || "");
  if (!nm || !em || !pw) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (nm.length > 60) {
    return NextResponse.json({ error: "Name must be 1–60 characters" }, { status: 400 });
  }
  if (em.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (pw.length < 6 || pw.length > 128) {
    return NextResponse.json({ error: "Password must be 6–128 characters" }, { status: 400 });
  }
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
  // welcome email (no-op when SMTP not configured; never blocks signup on failure)
  try {
    await sendWelcome(String(email).toLowerCase().trim(), String(name).trim());
  } catch (e) {
    console.error("welcome email failed", e);
  }
  return NextResponse.json({ ok: true });
}
