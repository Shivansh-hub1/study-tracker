import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSettings, DB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function mondayKey(nowLocal: Date) {
  const d = new Date(nowLocal);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dateKey(d);
}

// Lazy weekly grant: +1 freeze every Monday, max 2 in stock.
async function weekGrant(db: DB, userId: number, week: string) {
  await ensureSettings(db, userId);
  const s = (await db.get("SELECT freeze_stock, freeze_week FROM settings WHERE user_id = ?", userId)) as any;
  let stock = Number(s?.freeze_stock ?? 1);
  if ((s?.freeze_week || "") !== week) {
    stock = Math.min(2, stock + 1);
    await db.run("UPDATE settings SET freeze_stock = ?, freeze_week = ? WHERE user_id = ?", stock, week, userId);
  }
  return stock;
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const offsetMin = Number(new URL(req.url).searchParams.get("offset")) || 0;
  const db = await getDb();
  const nowLocal = new Date(Date.now() + offsetMin * 60000);
  const stock = await weekGrant(db, user.id, mondayKey(nowLocal));
  const f = await db.get("SELECT day FROM freeze_days WHERE user_id = ? AND day = ?", user.id, dateKey(nowLocal));
  return NextResponse.json({ stock, frozenToday: !!f });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const offsetMin = Number(new URL(req.url).searchParams.get("offset")) || 0;
  const body = await req.json().catch(() => ({}));
  if (body.action !== "freeze" && body.action !== "unfreeze") return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  const db = await getDb();
  const nowLocal = new Date(Date.now() + offsetMin * 60000);
  const todayK = dateKey(nowLocal);
  const stock = await weekGrant(db, user.id, mondayKey(nowLocal));
  if (body.action === "unfreeze") {
    const f = await db.get("SELECT day FROM freeze_days WHERE user_id = ? AND day = ?", user.id, todayK);
    if (!f) return NextResponse.json({ error: "Today isn't frozen" }, { status: 400 });
    await db.run("DELETE FROM freeze_days WHERE user_id = ? AND day = ?", user.id, todayK);
    const back = Math.min(2, stock + 1);
    await db.run("UPDATE settings SET freeze_stock = ? WHERE user_id = ?", back, user.id);
    return NextResponse.json({ ok: true, stock: back, frozenToday: false });
  }
  if (stock <= 0) return NextResponse.json({ error: "No freezes left — you earn one every Monday" }, { status: 400 });
  const f = await db.get("SELECT day FROM freeze_days WHERE user_id = ? AND day = ?", user.id, todayK);
  if (f) return NextResponse.json({ error: "Today is already frozen" }, { status: 400 });
  // Freeze only counts when today has zero sessions (UTC range of the local day).
  const startLocal = new Date(nowLocal);
  startLocal.setHours(0, 0, 0, 0);
  const startUTC = new Date(startLocal.getTime() - offsetMin * 60000).toISOString();
  const endUTC = new Date(startLocal.getTime() - offsetMin * 60000 + 86400000).toISOString();
  const c = (await db.get(
    "SELECT COUNT(*) as c FROM sessions WHERE user_id = ? AND started_at >= ? AND started_at < ?",
    user.id, startUTC, endUTC
  )) as any;
  if ((c?.c ?? 0) > 0) return NextResponse.json({ error: "You already studied today — no freeze needed" }, { status: 400 });
  await db.run("INSERT OR IGNORE INTO freeze_days (user_id, day) VALUES (?, ?)", user.id, todayK);
  await db.run("UPDATE settings SET freeze_stock = ? WHERE user_id = ?", stock - 1, user.id);
  return NextResponse.json({ ok: true, stock: stock - 1, frozenToday: true });
}
