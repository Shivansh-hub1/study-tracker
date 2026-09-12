import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const offsetMin = Number(new URL(req.url).searchParams.get("offset")) || 0;
  const nowLocal = new Date(Date.now() + offsetMin * 60000);
  const db = await getDb();
  const habits = (await db.all("SELECT * FROM habits WHERE user_id = ? ORDER BY id ASC", user.id)) as any[];
  const logs = (await db.all("SELECT habit_id, day FROM habit_logs WHERE user_id = ?", user.id)) as any[];
  const byHabit: Record<number, Set<string>> = {};
  for (const l of logs) (byHabit[l.habit_id] ??= new Set()).add(l.day);
  const todayK = dateKey(nowLocal);
  const out = habits.map((h) => {
    const set = byHabit[h.id] || new Set<string>();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(nowLocal);
      d.setDate(d.getDate() - i);
      if (set.has(dateKey(d))) streak++;
      else if (i === 0) continue;
      else break;
    }
    const last7: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowLocal);
      d.setDate(d.getDate() - i);
      last7.push(set.has(dateKey(d)));
    }
    return { ...h, streak, doneToday: set.has(todayK), last7, total: set.size };
  });
  return NextResponse.json({ habits: out });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, color } = await req.json().catch(() => ({}));
  if (!name?.trim()) return NextResponse.json({ error: "Habit name is required" }, { status: 400 });
  const db = await getDb();
  const info = await db.run(
    "INSERT INTO habits (user_id, name, color, created_at) VALUES (?,?,?,?)",
    user.id, String(name).trim().slice(0, 60), String(color || "#10b981").slice(0, 20), new Date().toISOString()
  );
  const row = await db.get("SELECT * FROM habits WHERE id = ?", info.lastInsertRowid);
  return NextResponse.json({ habit: row }, { status: 201 });
}

// Toggle a day (default today, user-local YYYY-MM-DD from client).
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, day } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const k = /^\d{4}-\d{2}-\d{2}$/.test(String(day || "")) ? String(day) : dateKey(new Date());
  const db = await getDb();
  const own = await db.get("SELECT id FROM habits WHERE id = ? AND user_id = ?", Number(id), user.id);
  if (!own) return NextResponse.json({ error: "Invalid habit" }, { status: 400 });
  const has = await db.get("SELECT day FROM habit_logs WHERE user_id = ? AND habit_id = ? AND day = ?", user.id, Number(id), k);
  if (has) await db.run("DELETE FROM habit_logs WHERE user_id = ? AND habit_id = ? AND day = ?", user.id, Number(id), k);
  else await db.run("INSERT OR IGNORE INTO habit_logs (user_id, habit_id, day) VALUES (?,?,?)", user.id, Number(id), k);
  return NextResponse.json({ ok: true, done: !has });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDb();
  await db.run("DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?", id, user.id);
  await db.run("DELETE FROM habits WHERE id = ? AND user_id = ?", id, user.id);
  return NextResponse.json({ ok: true });
}
