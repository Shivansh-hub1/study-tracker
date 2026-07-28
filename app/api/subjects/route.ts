import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const rows = await db.all(
    `SELECT s.*, COALESCE(SUM(se.duration_sec),0) as total_sec, COUNT(se.id) as session_count
     FROM subjects s LEFT JOIN sessions se ON se.subject_id = s.id
     WHERE s.user_id = ? GROUP BY s.id ORDER BY s.created_at ASC`,
    user.id
  );
  return NextResponse.json({ subjects: rows });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, color, target_minutes } = await req.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
  const db = await getDb();
  const info = await db.run(
    "INSERT INTO subjects (user_id, name, color, target_minutes, created_at) VALUES (?,?,?,?,?)",
    user.id, String(name).trim(), color || "#6366f1", Math.max(0, Number(target_minutes) || 300), new Date().toISOString()
  );
  const row = await db.get("SELECT * FROM subjects WHERE id = ?", info.lastInsertRowid);
  return NextResponse.json({ subject: row }, { status: 201 });
}
