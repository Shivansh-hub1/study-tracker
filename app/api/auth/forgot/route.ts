import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";
import { sendPasswordReset, mailConfigured } from "@/lib/mailer";
import { CANONICAL_SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

/*
 * Request a password reset link. Always returns ok:true (never reveals
 * whether an email is registered). One active token per user, 60-min expiry,
 * max 3 requests per email per hour.
 */
export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  const em = String(email || "").toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  const db = await getDb();
  const user = (await db.get("SELECT id, name FROM users WHERE email = ?", em)) as any;
  if (user) {
    // throttle: max 3 requests/hour per email
    const recent = await db.get(
      "SELECT COUNT(*) as n FROM password_resets WHERE email = ? AND created_at >= ?",
      em, new Date(Date.now() - 3600_000).toISOString()
    );
    if (Number((recent as any)?.n || 0) < 3) {
      // invalidate previous tokens, then create a fresh one
      await db.run("UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0", user.id);
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await db.run(
        "INSERT INTO password_resets (token_hash, user_id, email, expires_at, used, created_at) VALUES (?, ?, ?, ?, 0, ?)",
        tokenHash, user.id, em, expiresAt, new Date().toISOString()
      );
      if (mailConfigured()) {
        const base = process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_SITE_URL;
        try { await sendPasswordReset(em, user.name, `${base}/reset?token=${token}`); } catch (e) { console.error("reset email failed", e); }
      } else {
        console.log(`[auth] SMTP not configured — reset link for ${em}: /reset?token=${token}`);
      }
    }
  }
  return NextResponse.json({ ok: true });
}
