import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { computeStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const offsetMin = Number(new URL(req.url).searchParams.get("offset")) || 0; // minutes ahead of UTC (e.g. 330 IST)
  const db = await getDb();

  // All 4 reads in parallel: 1 round trip instead of 4 sequential.
  const [sessions, frozenRows, revD, revW] = await Promise.all([
    db.all(
      `SELECT se.subject_id, se.type, se.started_at, se.duration_sec, s.name as subject_name, s.color as subject_color
       FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id WHERE se.user_id = ? ORDER BY se.started_at ASC`,
      user.id
    ),
    db.all("SELECT day FROM freeze_days WHERE user_id = ?", user.id),
    db.get("SELECT COUNT(*) as c FROM dsa_progress WHERE user_id = ? AND revised_at IS NOT NULL", user.id),
    db.get("SELECT COUNT(*) as c FROM web_progress WHERE user_id = ? AND revised_at IS NOT NULL", user.id),
  ]);

  return NextResponse.json({
    stats: computeStats(sessions as any[], frozenRows as any[], revD, revW, offsetMin),
  });
}
