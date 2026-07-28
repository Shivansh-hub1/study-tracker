import { NextRequest, NextResponse } from "next/server";
import { getDb, DB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function own(db: DB, userId: number, id: number) {
  return db.get("SELECT * FROM subjects WHERE id = ? AND user_id = ?", id, userId);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const id = Number(params.id);
  if (!(await own(db, user.id, id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { name, color, target_minutes } = await req.json().catch(() => ({}));
  await db.run(
    "UPDATE subjects SET name = COALESCE(?, name), color = COALESCE(?, color), target_minutes = COALESCE(?, target_minutes) WHERE id = ?",
    name?.trim() || null,
    color || null,
    target_minutes != null ? Math.max(0, Number(target_minutes)) : null,
    id
  );
  return NextResponse.json({ subject: await db.get("SELECT * FROM subjects WHERE id = ?", id) });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const id = Number(params.id);
  if (!(await own(db, user.id, id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.run("UPDATE sessions SET subject_id = NULL WHERE subject_id = ?", id);
  await db.run("DELETE FROM subjects WHERE id = ?", id);
  return NextResponse.json({ ok: true });
}
