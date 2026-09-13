import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSettings } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { computeStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

// Combined dashboard payload: 1 server call instead of 5, 1 auth check,
// all reads in parallel. Same shapes as the individual endpoints.
function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function mondayKey(nowLocal: Date) {
  const d = new Date(nowLocal);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dateKey(d);
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const offsetMin = Number(new URL(req.url).searchParams.get("offset")) || 0;
  const db = await getDb();
  const nowLocal = new Date(Date.now() + offsetMin * 60000);
  const todayK = dateKey(nowLocal);
  const week = mondayKey(nowLocal);

  await ensureSettings(db, user.id); // cached after first call per instance
  const [sessions, frozenRows, revD, revW, goals, recent, subjects, setRow, fRow] = await Promise.all([
    db.all(
      `SELECT se.subject_id, se.type, se.started_at, se.duration_sec, s.name as subject_name, s.color as subject_color
       FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id WHERE se.user_id = ? ORDER BY se.started_at ASC`,
      user.id
    ),
    db.all("SELECT day FROM freeze_days WHERE user_id = ?", user.id),
    db.get("SELECT COUNT(*) as c FROM dsa_progress WHERE user_id = ? AND revised_at IS NOT NULL", user.id),
    db.get("SELECT COUNT(*) as c FROM web_progress WHERE user_id = ? AND revised_at IS NOT NULL", user.id),
    db.all("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC", user.id),
    db.all(
      `SELECT se.*, s.name as subject_name, s.color as subject_color
       FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id
       WHERE se.user_id = ? ORDER BY se.started_at DESC LIMIT ?`,
      user.id, 6
    ),
    db.all(
      `SELECT s.*, COALESCE(SUM(se.duration_sec),0) as total_sec, COUNT(se.id) as session_count
       FROM subjects s LEFT JOIN sessions se ON se.subject_id = s.id
       WHERE s.user_id = ? GROUP BY s.id ORDER BY s.created_at ASC`,
      user.id
    ),
    db.get("SELECT freeze_stock, freeze_week FROM settings WHERE user_id = ?", user.id),
    db.get("SELECT day FROM freeze_days WHERE user_id = ? AND day = ?", user.id, todayK),
  ]);

  // Lazy weekly freeze grant (same logic as /api/streak).
  let stock = Number((setRow as any)?.freeze_stock ?? 1);
  if (((setRow as any)?.freeze_week || "") !== week) {
    stock = Math.min(2, stock + 1);
    await db.run("UPDATE settings SET freeze_stock = ?, freeze_week = ? WHERE user_id = ?", stock, week, user.id);
  }

  return NextResponse.json({
    stats: computeStats(sessions as any[], frozenRows as any[], revD, revW, offsetMin),
    goals,
    sessions: recent,
    subjects,
    stock,
    frozenToday: !!fRow,
  });
}
