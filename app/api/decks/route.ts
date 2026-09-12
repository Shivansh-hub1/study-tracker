import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const decks = await db.all(
    `SELECT d.*, (SELECT COUNT(*) FROM cards c WHERE c.deck_id = d.id) as cards,
       (SELECT COALESCE(SUM(correct),0) FROM cards c WHERE c.deck_id = d.id) as got,
       (SELECT COALESCE(SUM(correct+wrong),0) FROM cards c WHERE c.deck_id = d.id) as tried
     FROM decks d WHERE d.user_id = ? ORDER BY d.id DESC`,
    user.id
  );
  return NextResponse.json({ decks });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, subject } = await req.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "Deck name is required" }, { status: 400 });
  const db = await getDb();
  const info = await db.run(
    "INSERT INTO decks (user_id, name, subject, created_at) VALUES (?,?,?,?)",
    user.id, String(name).trim().slice(0, 80), String(subject || "").trim().slice(0, 40), new Date().toISOString()
  );
  const row = await db.get("SELECT * FROM decks WHERE id = ?", info.lastInsertRowid);
  return NextResponse.json({ deck: { ...(row as any), cards: 0, got: 0, tried: 0 } }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDb();
  await db.run("DELETE FROM cards WHERE deck_id = ? AND user_id = ?", id, user.id);
  await db.run("DELETE FROM decks WHERE id = ? AND user_id = ?", id, user.id);
  return NextResponse.json({ ok: true });
}
