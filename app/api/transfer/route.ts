import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { bustUser } from "@/lib/api-cache";

export const dynamic = "force-dynamic";

/*
 * Time transfer: move half of a 6h+ day's study time to an earlier day.
 * - does not create/remove XP (totals unchanged, only the day distribution)
 * - one outgoing transfer per source day
 * - both days must be within the last 139 days and in the user's local timezone
 */

const THRESHOLD = 360; // minutes — more than 6 hours

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offsetMin = Number(new URL(req.url).searchParams.get("offset")) || 0;
  const body = await req.json().catch(() => ({}));
  const fromDay = String(body.fromDay || "");
  const toDay = String(body.toDay || "");

  if (!DAY_RE.test(fromDay) || !DAY_RE.test(toDay)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }
  const fd = new Date(fromDay + "T00:00:00");
  const td = new Date(toDay + "T00:00:00");
  if (isNaN(fd.getTime()) || isNaN(td.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (toDay >= fromDay) {
    return NextResponse.json({ error: "You can only move time to an earlier day" }, { status: 400 });
  }

  const nowLocal = new Date(Date.now() + offsetMin * 60000);
  const todayK = dateKey(nowLocal);
  const earliest = new Date(nowLocal); earliest.setDate(earliest.getDate() - 139);
  if (fd > nowLocal || fd < earliest || td < earliest) {
    return NextResponse.json({ error: "Dates out of range" }, { status: 400 });
  }
  if (fromDay !== todayK && fd > nowLocal) {
    return NextResponse.json({ error: "Cannot transfer from a future day" }, { status: 400 });
  }

  const db = await getDb();

  const existing = await db.get(
    "SELECT id FROM time_transfers WHERE user_id = ? AND from_day = ?",
    user.id, fromDay
  );
  if (existing) {
    return NextResponse.json({ error: "You already moved time from this day" }, { status: 400 });
  }

  // net minutes for fromDay in the user's local timezone (sessions ± existing transfers)
  const [sessions, transfers] = await Promise.all([
    db.all("SELECT started_at, duration_sec FROM sessions WHERE user_id = ?", user.id),
    db.all("SELECT from_day, to_day, minutes FROM time_transfers WHERE user_id = ?", user.id),
  ]);
  const toLocal = (iso: string) => new Date(new Date(iso).getTime() + offsetMin * 60000);
  let net = 0;
  for (const se of sessions as any[]) {
    if (dateKey(toLocal(se.started_at)) === fromDay) net += se.duration_sec / 60;
  }
  for (const t of transfers as any[]) {
    if (t.from_day === fromDay) net -= t.minutes;
    if (t.to_day === fromDay) net += t.minutes;
  }
  if (net <= THRESHOLD) {
    return NextResponse.json({ error: "That day doesn't have more than 6 hours of study time" }, { status: 400 });
  }

  const minutes = Math.floor(net / 2);
  const now = new Date().toISOString();
  await db.run(
    "INSERT INTO time_transfers (user_id, from_day, to_day, minutes, created_at) VALUES (?,?,?,?,?)",
    user.id, fromDay, toDay, minutes, now
  );
  bustUser(user.id);

  return NextResponse.json({ ok: true, fromDay, toDay, minutes });
}
