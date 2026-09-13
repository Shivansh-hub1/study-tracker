import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const url = new URL(req.url);
  const limit = Math.min(500, Number(url.searchParams.get("limit")) || 100);
  const subjectId = url.searchParams.get("subject_id");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let sql = `SELECT se.*, s.name as subject_name, s.color as subject_color
             FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id
             WHERE se.user_id = ?`;
  const args: any[] = [user.id];
  if (subjectId) { sql += " AND se.subject_id = ?"; args.push(Number(subjectId)); }
  if (from) { sql += " AND se.started_at >= ?"; args.push(from); }
  if (to) { sql += " AND se.started_at <= ?"; args.push(to); }
  sql += " ORDER BY se.started_at DESC LIMIT ?";
  args.push(limit);
  return NextResponse.json({ sessions: await db.all(sql, ...args) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { subject_id, type, started_at, ended_at, duration_sec, notes, topic } = body;
  const dur = Math.max(1, Math.round(Number(duration_sec) || 0));
  if (!dur) return NextResponse.json({ error: "duration_sec must be positive" }, { status: 400 });
  const started = started_at ? new Date(started_at) : new Date(Date.now() - dur * 1000);
  const ended = ended_at ? new Date(ended_at) : new Date(started.getTime() + dur * 1000);
  if (isNaN(started.getTime()) || isNaN(ended.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }
  const db = await getDb();
  let subj: any = null;
  if (subject_id) {
    subj = await db.get("SELECT id, name, color FROM subjects WHERE id = ? AND user_id = ?", Number(subject_id), user.id);
    if (!subj) return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const info = await db.run(
    "INSERT INTO sessions (user_id, subject_id, type, started_at, ended_at, duration_sec, notes, topic, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    user.id, subject_id ? Number(subject_id) : null, type || "manual", started.toISOString(), ended.toISOString(), dur, String(notes || ""), String(topic || "").slice(0, 80), now
  );
  // No re-SELECT: build the row from what we already know (1 round trip saved).
  const row = {
    id: info.lastInsertRowid, user_id: user.id, subject_id: subject_id ? Number(subject_id) : null,
    type: type || "manual", started_at: started.toISOString(), ended_at: ended.toISOString(),
    duration_sec: dur, notes: String(notes || ""), topic: String(topic || "").slice(0, 80), created_at: now,
    subject_name: subj?.name ?? null, subject_color: subj?.color ?? null,
  };
  return NextResponse.json({ session: row }, { status: 201 });
}
