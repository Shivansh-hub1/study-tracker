import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const id = Number(params.id);
  const row = (await db.get("SELECT * FROM timetables WHERE id = ? AND user_id = ?", id, user.id)) as any;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  await db.run(
    "UPDATE timetables SET name = COALESCE(?, name), slots = COALESCE(?, slots) WHERE id = ?",
    body.name?.trim() || null,
    body.slots ? JSON.stringify(body.slots) : null,
    id
  );
  const updated = (await db.get("SELECT * FROM timetables WHERE id = ?", id)) as any;
  return NextResponse.json({ timetable: { ...updated, config: JSON.parse(updated.config), slots: JSON.parse(updated.slots) } });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const info = await db.run("DELETE FROM timetables WHERE id = ? AND user_id = ?", Number(params.id), user.id);
  if (!info.changes) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
