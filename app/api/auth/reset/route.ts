import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!token || !password) return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
  if (String(password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const db = await getDb();
  const row = (await db.get("SELECT * FROM password_resets WHERE token_hash = ?", tokenHash)) as any;
  if (!row || row.used || new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired — request a new one" }, { status: 400 });
  }
  await db.run("UPDATE users SET password_hash = ? WHERE id = ?", bcrypt.hashSync(String(password), 10), row.user_id);
  // single use + kill any other pending tokens for this user
  await db.run("UPDATE password_resets SET used = 1 WHERE user_id = ?", row.user_id);
  return NextResponse.json({ ok: true });
}
