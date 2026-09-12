import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const offsetMin = Number(new URL(req.url).searchParams.get("offset")) || 0; // minutes ahead of UTC (e.g. 330 IST)
  const db = await getDb();

  const sessions = (await db.all(
    `SELECT se.subject_id, se.type, se.started_at, se.duration_sec, s.name as subject_name, s.color as subject_color
     FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id WHERE se.user_id = ? ORDER BY se.started_at ASC`,
    user.id
  )) as any[];

  const toLocal = (iso: string) => new Date(new Date(iso).getTime() + offsetMin * 60000);
  const nowLocal = new Date(Date.now() + offsetMin * 60000);
  const todayK = dateKey(nowLocal);
  const frozenRows = (await db.all("SELECT day FROM freeze_days WHERE user_id = ?", user.id)) as any[];
  const frozen = new Set(frozenRows.map((r) => r.day));

  // per-day buckets (last 140 days)
  const days: Record<string, { minutes: number; sessions: number }> = {};
  for (let i = 0; i < 140; i++) {
    const d = new Date(nowLocal);
    d.setDate(d.getDate() - i);
    days[dateKey(d)] = { minutes: 0, sessions: 0 };
  }
  // by-subject totals (last 30d) + overall + hourly + weekday + type
  const bySubject: Record<string, { name: string; color: string; minutes: number; sessions: number }> = {};
  const bySubjectAll: Record<string, { name: string; color: string; minutes: number; sessions: number }> = {};
  const hourly = new Array(24).fill(0);
  const byType: Record<string, number> = { pomodoro: 0, timer: 0, stopwatch: 0, manual: 0 };
  const cutoff30 = new Date(nowLocal); cutoff30.setDate(cutoff30.getDate() - 30);
  const cutoff7 = new Date(nowLocal); cutoff7.setDate(cutoff7.getDate() - 7);

  let todayMin = 0, weekMin = 0, monthMin = 0, weekSessions = 0, totalSec = 0;
  const sundayOffset = (nowLocal.getDay() + 6) % 7; // days since Monday
  const weekStart = new Date(nowLocal); weekStart.setDate(weekStart.getDate() - sundayOffset); weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), 1);

  for (const se of sessions) {
    const local = toLocal(se.started_at);
    const k = dateKey(local);
    const min = se.duration_sec / 60;
    totalSec += se.duration_sec;
    byType[se.type] = (byType[se.type] || 0) + se.duration_sec;
    if (days[k]) { days[k].minutes += min; days[k].sessions += 1; }
    hourly[local.getHours()] += min;
    const sName = se.subject_name || "Unassigned";
    const sColor = se.subject_color || "#64748b";
    (bySubjectAll[sName] ??= { name: sName, color: sColor, minutes: 0, sessions: 0 });
    bySubjectAll[sName].minutes += min; bySubjectAll[sName].sessions += 1;
    if (local >= cutoff30) {
      (bySubject[sName] ??= { name: sName, color: sColor, minutes: 0, sessions: 0 });
      bySubject[sName].minutes += min; bySubject[sName].sessions += 1;
    }
    if (k === todayK) todayMin += min;
    if (local >= weekStart) { weekMin += min; weekSessions += 1; }
    if (local >= monthStart) monthMin += min;
  }

  // streak (consecutive days with any session, today not required to be finished)
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(nowLocal); d.setDate(d.getDate() - i);
    const k = dateKey(d);
    const has = (days[k] && days[k].sessions > 0) || frozen.has(k);
    if (has) streak++;
    else if (i === 0) continue; // today may not be logged yet
    else break;
  }

  // weekly series: last 12 weeks (Mon-Sun)
  const weekly: Array<{ week: string; minutes: number; sessions: number }> = [];
  for (let w = 11; w >= 0; w--) {
    const start = new Date(weekStart); start.setDate(start.getDate() - w * 7);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    let m = 0, c = 0;
    for (const se of sessions) {
      const local = toLocal(se.started_at);
      if (local >= start && local < end) { m += se.duration_sec / 60; c++; }
    }
    weekly.push({ week: `${start.getMonth() + 1}/${start.getDate()}`, minutes: Math.round(m), sessions: c });
  }

  // daily series last 30 days (chronological)
  const daily: Array<{ date: string; minutes: number; sessions: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(nowLocal); d.setDate(d.getDate() - i);
    const k = dateKey(d);
    daily.push({ date: k, minutes: Math.round(days[k]?.minutes || 0), sessions: days[k]?.sessions || 0 });
  }

  // heatmap last 140 days
  const heat = Object.entries(days)
    .map(([date, v]) => ({ date, minutes: Math.round(v.minutes), sessions: v.sessions, frozen: frozen.has(date) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // monthly series: last 6 months
  const monthly: Array<{ month: string; minutes: number; sessions: number }> = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(nowLocal.getFullYear(), nowLocal.getMonth() - m, 1);
    const end = new Date(nowLocal.getFullYear(), nowLocal.getMonth() - m + 1, 1);
    let mm = 0, c = 0;
    for (const se of sessions) {
      const local = toLocal(se.started_at);
      if (local >= d && local < end) { mm += se.duration_sec / 60; c++; }
    }
    monthly.push({ month: d.toLocaleString("en", { month: "short" }), minutes: Math.round(mm), sessions: c });
  }

  // XP + level: 1 XP per focus minute, +5 per revised topic
  const revD = (await db.get("SELECT COUNT(*) as c FROM dsa_progress WHERE user_id = ? AND revised_at IS NOT NULL", user.id)) as any;
  const revW = (await db.get("SELECT COUNT(*) as c FROM web_progress WHERE user_id = ? AND revised_at IS NOT NULL", user.id)) as any;
  const xp = Math.round(totalSec / 60) + (((revD?.c ?? 0) + (revW?.c ?? 0)) as number) * 5;
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpCur = 50 * (level - 1) * (level - 1);
  const xpNext = 50 * level * level;

  return NextResponse.json({
    stats: {
      todayMin: Math.round(todayMin),
      weekMin: Math.round(weekMin),
      monthMin: Math.round(monthMin),
      weekSessions,
      streak,
      xp,
      level,
      xpInto: xp - xpCur,
      xpNeed: xpNext - xpCur,
      totalHours: Math.round((totalSec / 3600) * 10) / 10,
      totalSessions: sessions.length,
      daily,
      weekly,
      monthly,
      heat,
      hourly: hourly.map(Math.round),
      bySubject: Object.values(bySubject).map((s) => ({ ...s, minutes: Math.round(s.minutes) })),
      bySubjectAll: Object.values(bySubjectAll).map((s) => ({ ...s, minutes: Math.round(s.minutes) })),
      byType: Object.entries(byType).map(([type, sec]) => ({ type, minutes: Math.round(sec / 60) })),
    },
  });
}
