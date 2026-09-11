import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function csvEsc(v: any) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const format = new URL(req.url).searchParams.get("format") || "json";
  const db = await getDb();

  const sessions = (await db.all(
    `SELECT se.id, s.name as subject, se.topic as topic, se.type, se.started_at, se.ended_at, se.duration_sec, se.notes
     FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id WHERE se.user_id = ? ORDER BY se.started_at DESC`,
    user.id
  )) as any[];

  if (format === "csv") {
    const header = "id,subject,topic,type,started_at,ended_at,duration_minutes,notes\n";
    const body = sessions
      .map((r) => [r.id, r.subject || "Unassigned", r.topic || "", r.type, r.started_at, r.ended_at, Math.round(r.duration_sec / 60), r.notes].map(csvEsc).join(","))
      .join("\n");
    return new NextResponse(header + body, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="focusflow-sessions.csv"`,
      },
    });
  }

  const subjects = await db.all("SELECT id, name, color, target_minutes, created_at FROM subjects WHERE user_id = ?", user.id);
  const goals = await db.all("SELECT id, title, kind, target, created_at FROM goals WHERE user_id = ?", user.id);
  const timetablesRaw = (await db.all("SELECT id, name, config, slots, created_at FROM timetables WHERE user_id = ?", user.id)) as any[];
  const payload = {
    exported_at: new Date().toISOString(),
    user: { name: user.name, email: user.email },
    subjects,
    sessions,
    goals,
    timetables: timetablesRaw.map((t) => ({ ...t, config: JSON.parse(t.config), slots: JSON.parse(t.slots) })),
  };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="focusflow-export.json"`,
    },
  });
}
