import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserEmailContext } from "@/lib/email-ctx";
import { sendDaily } from "@/lib/mailer";
import { sendPushToUser } from "@/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/*
 * Daily email — runs 19:00 IST (13:30 UTC) via Vercel cron.
 * For every recently-active user (excluding admin opt-outs):
 *   - studied today  → progress email (streak safe)
 *   - streak > 0, nothing today → "streak breaks tonight" warning
 *   - no streak & nothing today → skipped (no spam)
 * Protect with CRON_SECRET env — Vercel sends it automatically.
 */

export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = await getDb();
  const now = new Date();
  const activeCutoff = new Date(now.getTime() - 14 * 86400000).toISOString();

  // recently active users only (logged in within 14 days), emails not disabled
  const users = (await db.all(
    `SELECT id FROM users
     WHERE emails_opt_out = 0
       AND last_active_at IS NOT NULL AND last_active_at >= ?
     ORDER BY id`,
    activeCutoff
  )) as Array<{ id: number }>;

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];
  const atRisk: Array<{ id: number; streak: number }> = [];

  // one pass: fetch each user's stats once, reuse for email + push decision
  for (const { id } of users) {
    try {
      const ctx = await getUserEmailContext(db, id);
      if (!ctx) { skipped++; continue; }

      if (ctx.studiedMin === 0 && ctx.streak === 0) {
        skipped++; // inactive, nothing to say
        continue;
      }

      if (ctx.studiedMin === 0 && ctx.streak > 0) atRisk.push({ id, streak: ctx.streak });

      const ok = await sendDaily({
        to: ctx.email,
        name: ctx.name,
        studiedMin: ctx.studiedMin,
        streak: ctx.streak,
        atRisk: ctx.studiedMin === 0,
        frozenToday: ctx.frozenToday,
        freezeStock: ctx.freezeStock,
      });
      if (ok) sent++;
      else skipped++;
    } catch (e: any) {
      errors.push(`user ${id}: ${e?.message || "failed"}`);
    }
  }

  // Web push: only the at-risk users (email already covers the recap).
  // Skips users with no subscription / push not configured.
  let pushed = 0;
  for (const r of atRisk) {
    try {
      pushed += await sendPushToUser(db, r.id, {
        title: `⚠️ ${r.streak}-day streak breaks tonight`,
        body: "One 15-minute session saves it — tap to start one.",
        url: "/timer",
      });
    } catch { /* push must never fail the cron */ }
  }

  return NextResponse.json({ ok: true, users: users.length, sent, skipped, pushed, errors: errors.slice(0, 5) });
}
