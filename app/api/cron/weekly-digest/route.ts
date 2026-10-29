import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserEmailContext, istDateKey } from "@/lib/email-ctx";
import { renderTemplate, sendRaw, mailConfigured } from "@/lib/mailer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/*
 * Weekly digest — Sunday 20:00 IST (14:30 UTC) via Vercel cron.
 * Rolling last-7-days stats for every recently-active user with emails on.
 * Quiet week → gentle comeback nudge instead of stats.
 */

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 401 });
  }

  const db = await getDb();
  const now = new Date();
  const activeCutoff = new Date(now.getTime() - 14 * 86400000).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
  const prevWeekStart = new Date(now.getTime() - 14 * 86400000).toISOString();

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

  for (const { id } of users) {
    try {
      const [rows, prevRow, ctx] = await Promise.all([
        db.all(
          `SELECT se.started_at, se.duration_sec, s.name as subject_name
           FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id
           WHERE se.user_id = ? AND se.started_at >= ?`,
          id, weekStart
        ),
        db.get("SELECT COALESCE(SUM(duration_sec),0) as t FROM sessions WHERE user_id = ? AND started_at >= ? AND started_at < ?", id, prevWeekStart, weekStart),
        getUserEmailContext(db, id),
      ]);
      if (!ctx) { skipped++; continue; }

      const sessRows = rows as any[];
      const weekSec = sessRows.reduce((a, r) => a + Number(r.duration_sec || 0), 0);
      const prevSec = Number((prevRow as any)?.t || 0);
      if (weekSec === 0 && prevSec === 0 && ctx.streak === 0) {
        skipped++; // fully inactive, nothing to say
        continue;
      }

      // best day + top subject (IST buckets)
      const byDay = new Map<string, number>();
      const bySubject = new Map<string, number>();
      for (const r of sessRows) {
        const k = istDateKey(new Date(r.started_at));
        byDay.set(k, (byDay.get(k) || 0) + r.duration_sec / 60);
        const sk = r.subject_name || "Unassigned";
        bySubject.set(sk, (bySubject.get(sk) || 0) + r.duration_sec / 60);
      }
      let bestDay = "", bestDayMin = 0;
      for (const [k, m] of Array.from(byDay)) if (m > bestDayMin) { bestDayMin = m; bestDay = DAYS[new Date(k + "T12:00:00Z").getUTCDay()] || k; }
      let topSubject = "", topSubjectMin = 0;
      for (const [k, m] of Array.from(bySubject)) if (m > topSubjectMin) { topSubjectMin = m; topSubject = k; }

      const r = renderTemplate("digest", {
        name: ctx.name,
        weekMin: Math.round(weekSec / 60),
        prevWeekMin: Math.round(prevSec / 60),
        sessions: sessRows.length,
        bestDay,
        bestDayMin: Math.round(bestDayMin),
        topSubject,
        topSubjectMin: Math.round(topSubjectMin),
        streak: ctx.streak,
      });

      if (!mailConfigured()) { skipped++; continue; }
      await sendRaw(ctx.email, r.subject, r.html, r.text);
      sent++;
    } catch (e: any) {
      errors.push(`user ${id}: ${e?.message || "failed"}`);
    }
  }

  return NextResponse.json({ ok: true, users: users.length, sent, skipped, errors: errors.slice(0, 5) });
}
