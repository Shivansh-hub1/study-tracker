import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const id = Number(params.id);
  const existing = (await db.get("SELECT * FROM sessions WHERE id = ? AND user_id = ?", id, user.id)) as any;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const dur = body.duration_sec != null ? Math.max(1, Math.round(Number(body.duration_sec))) : existing.duration_sec;
  const started = body.started_at ? new Date(body.started_at) : new Date(existing.started_at);
  const ended = body.ended_at ? new Date(body.ended_at) : new Date(started.getTime() + dur * 1000);
  if (isNaN(started.getTime()) || isNaN(ended.getTime())) return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  let subjectId = body.subject_id !== undefined ? body.subject_id : existing.subject_id;
  if (subjectId) {
    const ok = await db.get("SELECT id FROM subjects WHERE id = ? AND user_id = ?", Number(subjectId), user.id);
    if (!ok) subjectId = existing.subject_id;
  }
  await db.run(
    "UPDATE sessions SET subject_id = ?, type = ?, started_at = ?, ended_at = ?, duration_sec = ?, notes = ? WHERE id = ?",
    subjectId ?? null,
    body.type || existing.type,
    started.toISOString(),
    ended.toISOString(),
    dur,
    body.notes !== undefined ? String(body.notes) : existing.notes,
    id
  );
  const row = await db.get(
    `SELECT se.*, s.name as subject_name, s.color as subject_color FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id WHERE se.id = ?`,
    id
  );
  return NextResponse.json({ session: row });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const info = await db.run("DELETE FROM sessions WHERE id = ? AND user_id = ?", Number(params.id), user.id);
  if (!info.changes) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
