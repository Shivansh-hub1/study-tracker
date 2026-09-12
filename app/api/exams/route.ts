import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const exams = (await db.all("SELECT * FROM exams WHERE user_id = ? ORDER BY exam_date ASC", user.id)) as any[];
  return NextResponse.json({
    exams: exams.map((e) => ({ ...e, checklist: JSON.parse(e.checklist || "[]") as Array<{ t: string; done: boolean }> })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, subject, exam_date, notes } = await req.json().catch(() => ({}));
  if (!title?.trim() || !exam_date) return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
  const db = await getDb();
  const info = await db.run(
    "INSERT INTO exams (user_id, title, subject, exam_date, notes, checklist, created_at) VALUES (?,?,?,?,?,?,?)",
    user.id, String(title).trim(), String(subject || "").trim(), String(exam_date), String(notes || ""), "[]", new Date().toISOString()
  );
  const row = await db.get("SELECT * FROM exams WHERE id = ?", info.lastInsertRowid);
  return NextResponse.json({ exam: { ...(row as any), checklist: [] } }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, title, subject, exam_date, notes, checklist } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const sets: string[] = [];
  const args: any[] = [];
  if (title !== undefined) { sets.push("title = ?"); args.push(String(title)); }
  if (subject !== undefined) { sets.push("subject = ?"); args.push(String(subject)); }
  if (exam_date !== undefined) { sets.push("exam_date = ?"); args.push(String(exam_date)); }
  if (notes !== undefined) { sets.push("notes = ?"); args.push(String(notes)); }
  if (checklist !== undefined) { sets.push("checklist = ?"); args.push(JSON.stringify(checklist).slice(0, 8000)); }
  if (sets.length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const db = await getDb();
  await db.run(`UPDATE exams SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`, ...args, Number(id), user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDb();
  await db.run("DELETE FROM exams WHERE id = ? AND user_id = ?", id, user.id);
  return NextResponse.json({ ok: true });
}
