import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSettings } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import { verifySupabaseToken } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Exchanges a verified Supabase token for the app's own session cookie.
 * Links by Supabase UID first, then by matching email (keeps old data),
 * otherwise creates a fresh account.
 */
export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "Login token missing" }, { status: 400 });
  const su = await verifySupabaseToken(String(token));
  if (!su) return NextResponse.json({ error: "Invalid login — please sign in again" }, { status: 401 });
  if (!su.verified) {
    return NextResponse.json({ error: "Please verify your email first — check your inbox", needVerify: true }, { status: 403 });
  }
  const db = await getDb();
  let user = (await db.get("SELECT id FROM users WHERE supabase_uid = ?", su.id)) as any;
  if (!user) {
    user = (await db.get("SELECT id FROM users WHERE email = ?", su.email)) as any;
    if (user) {
      await db.run("UPDATE users SET supabase_uid = ? WHERE id = ?", su.id, user.id);
    } else {
      const info = await db.run(
        "INSERT INTO users (name, email, password_hash, role, supabase_uid, created_at) VALUES (?,?,?,?,?,?)",
        su.name.slice(0, 60), su.email, "supabase", "user", su.id, new Date().toISOString()
      );
      user = { id: info.lastInsertRowid };
      await ensureSettings(db, user.id);
    }
  }
  setAuthCookie(await signToken(user.id));
  return NextResponse.json({ ok: true });
}
