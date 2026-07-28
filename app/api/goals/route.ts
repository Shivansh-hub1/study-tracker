import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const KINDS = ["daily_minutes", "weekly_minutes", "monthly_minutes", "weekly_sessions"];

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  return NextResponse.json({ goals: await db.all("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC", user.id) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, kind, target } = await req.json().catch(() => ({}));
  if (!title?.trim()) return NextResponse.json({ error: "Goal title is required" }, { status: 400 });
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Invalid goal kind" }, { status: 400 });
  if (!Number(target) || Number(target) <= 0) return NextResponse.json({ error: "Target must be positive" }, { status: 400 });
  const db = await getDb();
  const info = await db.run(
    "INSERT INTO goals (user_id, title, kind, target, created_at) VALUES (?,?,?,?,?)",
    user.id, String(title).trim(), kind, Math.round(Number(target)), new Date().toISOString()
  );
  return NextResponse.json({ goal: await db.get("SELECT * FROM goals WHERE id = ?", info.lastInsertRowid) }, { status: 201 });
}
