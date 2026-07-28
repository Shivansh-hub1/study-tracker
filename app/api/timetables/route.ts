import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateTimetable, TTConfig } from "@/lib/timetable";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const rows = (await db.all("SELECT * FROM timetables WHERE user_id = ? ORDER BY created_at DESC", user.id)) as any[];
  return NextResponse.json({
    timetables: rows.map((r) => ({ ...r, config: JSON.parse(r.config), slots: JSON.parse(r.slots) })),
  });
}

// POST { name?, config } -> runs generator server-side; saves when save=true
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const cfg = body.config as TTConfig;
  if (!cfg?.days || !cfg?.subjects) return NextResponse.json({ error: "Invalid config" }, { status: 400 });
  const { slots, warnings } = generateTimetable(cfg);
  const db = await getDb();
  if (body.save) {
    const info = await db.run(
      "INSERT INTO timetables (user_id, name, config, slots, created_at) VALUES (?,?,?,?,?)",
      user.id, String(body.name || "Weekly plan"), JSON.stringify(cfg), JSON.stringify(slots), new Date().toISOString()
    );
    const row = (await db.get("SELECT * FROM timetables WHERE id = ?", info.lastInsertRowid)) as any;
    return NextResponse.json({ timetable: { ...row, config: cfg, slots }, warnings }, { status: 201 });
  }
  return NextResponse.json({ slots, warnings });
}
