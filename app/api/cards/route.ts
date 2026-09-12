import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function ownDeck(db: any, userId: number, deckId: number) {
  return db.get("SELECT id FROM decks WHERE id = ? AND user_id = ?", deckId, userId);
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deckId = Number(new URL(req.url).searchParams.get("deck"));
  if (!deckId) return NextResponse.json({ error: "deck required" }, { status: 400 });
  const db = await getDb();
  if (!(await ownDeck(db, user.id, deckId))) return NextResponse.json({ error: "Invalid deck" }, { status: 400 });
  const cards = await db.all("SELECT * FROM cards WHERE deck_id = ? AND user_id = ? ORDER BY id ASC", deckId, user.id);
  return NextResponse.json({ cards });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { deck_id, front, back } = await req.json().catch(() => ({}));
  if (!deck_id || !front?.trim() || !back?.trim()) {
    return NextResponse.json({ error: "Deck, front and back are required" }, { status: 400 });
  }
  const db = await getDb();
  if (!(await ownDeck(db, user.id, Number(deck_id)))) return NextResponse.json({ error: "Invalid deck" }, { status: 400 });
  const info = await db.run(
    "INSERT INTO cards (deck_id, user_id, front, back, created_at) VALUES (?,?,?,?,?)",
    Number(deck_id), user.id, String(front).trim().slice(0, 500), String(back).trim().slice(0, 1000), new Date().toISOString()
  );
  const row = await db.get("SELECT * FROM cards WHERE id = ?", info.lastInsertRowid);
  return NextResponse.json({ card: row }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, result } = await req.json().catch(() => ({}));
  if (!id || (result !== "correct" && result !== "wrong")) {
    return NextResponse.json({ error: "id and result (correct|wrong) required" }, { status: 400 });
  }
  const db = await getDb();
  await db.run(
    `UPDATE cards SET ${result === "correct" ? "correct = correct + 1" : "wrong = wrong + 1"} WHERE id = ? AND user_id = ?`,
    Number(id), user.id
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDb();
  await db.run("DELETE FROM cards WHERE id = ? AND user_id = ?", id, user.id);
  return NextResponse.json({ ok: true });
}
