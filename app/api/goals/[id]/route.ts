import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const id = Number(params.id);
  if (!(await db.get("SELECT id FROM goals WHERE id = ? AND user_id = ?", id, user.id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { title, kind, target } = await req.json().catch(() => ({}));
  await db.run(
    "UPDATE goals SET title = COALESCE(?, title), kind = COALESCE(?, kind), target = COALESCE(?, target) WHERE id = ?",
    title?.trim() || null,
    kind || null,
    target != null ? Math.max(1, Math.round(Number(target))) : null,
    id
  );
  return NextResponse.json({ goal: await db.get("SELECT * FROM goals WHERE id = ?", id) });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const info = await db.run("DELETE FROM goals WHERE id = ? AND user_id = ?", Number(params.id), user.id);
  if (!info.changes) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
