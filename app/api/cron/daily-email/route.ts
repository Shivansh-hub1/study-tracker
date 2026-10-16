import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendDaily } from "@/lib/mailer";

export const dynamic = "force-dynamic";

/*
 * Daily email — runs 19:00 IST (13:30 UTC) via Vercel cron.
 * For every recently-active user:
 *   - studied today  → progress email (streak safe)
 *   - streak > 0, nothing today → "streak breaks tonight" warning
 *   - no streak & nothing today → skipped (no spam)
 * Protect with CRON_SECRET env — Vercel sends it automatically.
 */

const IST_OFFSET_MIN = 330; // app audience is IST; per-user tz is a future refinement

function pad(n: number) { return String(n).padStart(2, "0"); }
function istDateKey(d: Date): string {
  const ist = new Date(d.getTime() + IST_OFFSET_MIN * 60000);
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}`;
}
function istMidnightUtc(now: Date): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MIN * 60000);
  const dayStartIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return new Date(dayStartIst - IST_OFFSET_MIN * 60000);
}

export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = await getDb();
  const now = new Date();
  const todayK = istDateKey(now);
  const todayStartUtc = istMidnightUtc(now).toISOString();
  const cutoff90 = new Date(now.getTime() - 90 * 86400000).toISOString();
  const activeCutoff = new Date(now.getTime() - 14 * 86400000).toISOString();

  // recently active users only (logged in within 14 days)
  const users = (await db.all(
    `SELECT id, name, email FROM users
     WHERE last_active_at IS NOT NULL AND last_active_at >= ?
     ORDER BY id`,
    activeCutoff
  )) as Array<{ id: number; name: string; email: string }>;

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const u of users) {
    try {
      const [todayRow, sessRows, frozenRows, setRow] = await Promise.all([
        db.get("SELECT COALESCE(SUM(duration_sec),0) as t FROM sessions WHERE user_id = ? AND started_at >= ?", u.id, todayStartUtc),
        db.all("SELECT started_at, duration_sec FROM sessions WHERE user_id = ? AND started_at >= ?", u.id, cutoff90),
        db.all("SELECT day FROM freeze_days WHERE user_id = ?", u.id),
        db.get("SELECT freeze_stock FROM settings WHERE user_id = ?", u.id),
      ]);

      const studiedMin = Math.round((Number((todayRow as any)?.t) || 0) / 60);
      const frozen = new Set((frozenRows as any[]).map((r) => r.day));

      // per-day minutes map (IST) for streak walk
      const days = new Map<string, number>();
      for (const s of sessRows as any[]) {
        const k = istDateKey(new Date(s.started_at));
        days.set(k, (days.get(k) || 0) + s.duration_sec / 60);
      }

      // streak: consecutive days ending today/yesterday (today optional, like the app)
      let streak = 0;
      for (let i = 0; i < 90; i++) {
        const d = new Date(now.getTime() - i * 86400000);
        const k = istDateKey(d);
        const has = (days.get(k) || 0) > 0 || frozen.has(k);
        if (has) streak++;
        else if (i === 0) continue;
        else break;
      }

      if (studiedMin === 0 && streak === 0) {
        skipped++; // inactive, nothing to say
        continue;
      }

      const ok = await sendDaily({
        to: u.email,
        name: u.name,
        studiedMin,
        streak,
        atRisk: studiedMin === 0,
        frozenToday: frozen.has(todayK),
        freezeStock: Number((setRow as any)?.freeze_stock ?? 0),
      });
      if (ok) sent++;
      else skipped++;
    } catch (e: any) {
      errors.push(`user ${u.id}: ${e?.message || "failed"}`);
    }
  }

  return NextResponse.json({ ok: true, users: users.length, sent, skipped, errors: errors.slice(0, 5) });
}
