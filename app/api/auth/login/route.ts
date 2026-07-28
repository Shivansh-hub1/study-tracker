import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  const db = await getDb();
  const user = (await db.get("SELECT id, password_hash FROM users WHERE email = ?", String(email).toLowerCase().trim())) as any;
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  db.run("UPDATE users SET last_active_at = ? WHERE id = ?", new Date().toISOString(), user.id).catch(() => {});
  setAuthCookie(await signToken(user.id));
  return NextResponse.json({ ok: true });
}
