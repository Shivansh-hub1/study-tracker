import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function shortName(name: string) {
  const parts = String(name || "Student").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 12);
  return `${parts[0].slice(0, 12)} ${parts[1][0]}.`;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  // Same XP formula as personal stats: 1 XP/min + 5 per revised topic.
  const rows = (await db.all(
    `SELECT u.id, u.name,
       COALESCE((SELECT ROUND(SUM(duration_sec) / 60) FROM sessions WHERE user_id = u.id), 0)
       + 5 * COALESCE((SELECT COUNT(*) FROM dsa_progress WHERE user_id = u.id AND revised_at IS NOT NULL), 0)
       + 5 * COALESCE((SELECT COUNT(*) FROM web_progress WHERE user_id = u.id AND revised_at IS NOT NULL), 0) AS xp,
       COALESCE((SELECT COUNT(*) FROM sessions WHERE user_id = u.id), 0) AS sessions,
       COALESCE((SELECT ROUND(SUM(duration_sec) / 3600, 1) FROM sessions WHERE user_id = u.id), 0) AS hours
     FROM users u WHERE u.role = 'user' ORDER BY xp DESC LIMIT 20`
  )) as any[];
  const board = rows.map((r) => ({
    id: r.id,
    name: shortName(r.name),
    xp: Number(r.xp) || 0,
    level: Math.floor(Math.sqrt((Number(r.xp) || 0) / 50)) + 1,
    sessions: Number(r.sessions) || 0,
    hours: Number(r.hours) || 0,
    me: r.id === user.id,
  }));
  return NextResponse.json({ board, myId: user.id });
}
