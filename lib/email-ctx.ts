import type { DB } from "@/lib/db";

/*
 * Shared per-user email context (IST day bucketing, streak walk, freeze stock).
 * Used by the daily cron AND the admin "send email" tool so both compute
 * the exact same numbers.
 */

const IST_OFFSET_MIN = 330; // app audience is IST; per-user tz is a future refinement

function pad(n: number) { return String(n).padStart(2, "0"); }
export function istDateKey(d: Date): string {
  const ist = new Date(d.getTime() + IST_OFFSET_MIN * 60000);
  return `${ist.getUTCFullYear()}-${pad(ist.getUTCMonth() + 1)}-${pad(ist.getUTCDate())}`;
}
export function istMidnightUtc(now: Date): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MIN * 60000);
  const dayStartIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return new Date(dayStartIst - IST_OFFSET_MIN * 60000);
}

export interface UserEmailContext {
  id: number;
  name: string;
  email: string;
  emailsOptOut: boolean;
  studiedMin: number;       // minutes logged today (IST)
  streak: number;           // consecutive days incl. today if logged (today optional, like the app)
  frozenToday: boolean;
  freezeStock: number;
  lastActiveDaysAgo: number | null;
}

export async function getUserEmailContext(db: DB, userId: number): Promise<UserEmailContext | null> {
  const u = (await db.get(
    "SELECT id, name, email, emails_opt_out, last_active_at FROM users WHERE id = ?",
    userId
  )) as any;
  if (!u) return null;

  const now = new Date();
  const todayK = istDateKey(now);
  const todayStartUtc = istMidnightUtc(now).toISOString();
  const cutoff90 = new Date(now.getTime() - 90 * 86400000).toISOString();

  const [todayRow, sessRows, frozenRows, setRow] = await Promise.all([
    db.get("SELECT COALESCE(SUM(duration_sec),0) as t FROM sessions WHERE user_id = ? AND started_at >= ?", userId, todayStartUtc),
    db.all("SELECT started_at, duration_sec FROM sessions WHERE user_id = ? AND started_at >= ?", userId, cutoff90),
    db.all("SELECT day FROM freeze_days WHERE user_id = ?", userId),
    db.get("SELECT freeze_stock FROM settings WHERE user_id = ?", userId),
  ]);

  const studiedMin = Math.round((Number((todayRow as any)?.t) || 0) / 60);
  const frozen = new Set((frozenRows as any[]).map((r) => r.day));

  const days = new Map<string, number>();
  for (const s of sessRows as any[]) {
    const k = istDateKey(new Date(s.started_at));
    days.set(k, (days.get(k) || 0) + s.duration_sec / 60);
  }

  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    const k = istDateKey(d);
    const has = (days.get(k) || 0) > 0 || frozen.has(k);
    if (has) streak++;
    else if (i === 0) continue;
    else break;
  }

  const lastActiveDaysAgo = u.last_active_at
    ? Math.floor((now.getTime() - new Date(u.last_active_at).getTime()) / 86400000)
    : null;

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    emailsOptOut: !!u.emails_opt_out,
    studiedMin,
    streak,
    frozenToday: frozen.has(todayK),
    freezeStock: Number((setRow as any)?.freeze_stock ?? 0),
    lastActiveDaysAgo,
  };
}
