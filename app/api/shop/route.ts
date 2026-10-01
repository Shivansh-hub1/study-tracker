import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSettings } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { bustUser } from "@/lib/api-cache";
import { computeStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

const SHOP_ITEMS = [
  { key: "freeze1", name: "Streak Freeze +1", desc: "Bank one extra day off without losing your streak (max 3 stocked).", icon: "❄️", cost: 100, repeatable: true },
  { key: "theme_aurora", name: "Aurora Theme", desc: "Northern-lights premium color scheme for the whole app.", icon: "🌌", cost: 250, repeatable: false },
  { key: "theme_sunset", name: "Sunset Theme", desc: "Warm golden-dusk premium color scheme.", icon: "🌇", cost: 250, repeatable: false },
  { key: "theme_ocean", name: "Ocean Theme", desc: "Deep-sea blues and teals premium color scheme.", icon: "🌊", cost: 250, repeatable: false },
  { key: "theme_forest", name: "Forest Theme", desc: "Calm woodland greens premium color scheme.", icon: "🌲", cost: 250, repeatable: false },
  { key: "confetti", name: "Celebration Confetti", desc: "A confetti burst every time you save a study session.", icon: "🎉", cost: 150, repeatable: false },
  { key: "flame", name: "Golden Streak Flame", desc: "Your dashboard streak card turns golden forever.", icon: "👑", cost: 150, repeatable: false },
];

async function wallet(db: any, userId: number) {
  const [sessions, frozenRows, revD, revW] = await Promise.all([
    db.all(
      `SELECT se.subject_id, se.type, se.started_at, se.duration_sec, s.name as subject_name, s.color as subject_color
       FROM sessions se LEFT JOIN subjects s ON s.id = se.subject_id WHERE se.user_id = ? ORDER BY se.started_at ASC`,
      userId
    ),
    db.all("SELECT day FROM freeze_days WHERE user_id = ?", userId),
    db.get("SELECT COUNT(*) as c FROM dsa_progress WHERE user_id = ? AND revised_at IS NOT NULL", userId),
    db.get("SELECT COUNT(*) as c FROM web_progress WHERE user_id = ? AND revised_at IS NOT NULL", userId),
  ]);
  const spentRow = (await db.get("SELECT COALESCE(SUM(cost),0) as c FROM xp_purchases WHERE user_id = ?", userId)) as any;
  const stats = computeStats(sessions as any[], frozenRows as any[], revD, revW, 0, Number(spentRow?.c || 0));
  return { earned: stats.xp, spent: Number(spentRow?.c || 0), available: stats.xp - Number(spentRow?.c || 0) };
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const w = await wallet(db, user.id);
  const owned = (await db.all("SELECT item FROM xp_purchases WHERE user_id = ?", user.id)) as any[];
  const ownedSet = new Set(owned.map((o: any) => o.item));
  return NextResponse.json({
    xp: w.earned,
    spent: w.spent,
    xpAvailable: w.available,
    items: SHOP_ITEMS.map((i) => ({ ...i, owned: !i.repeatable && ownedSet.has(i.key) })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  bustUser(user.id);
  const { item } = await req.json().catch(() => ({}));
  const def = SHOP_ITEMS.find((i) => i.key === item);
  if (!def) return NextResponse.json({ error: "Unknown item" }, { status: 400 });

  const db = await getDb();
  await ensureSettings(db, user.id);

  const owned = (await db.get("SELECT id FROM xp_purchases WHERE user_id = ? AND item = ?", user.id, def.key)) as any;
  if (owned && !def.repeatable) {
    return NextResponse.json({ error: "You already own this" }, { status: 400 });
  }

  if (def.key === "freeze1") {
    const s = (await db.get("SELECT freeze_stock FROM settings WHERE user_id = ?", user.id)) as any;
    if (Number(s?.freeze_stock ?? 0) >= 3) {
      return NextResponse.json({ error: "Freeze stock is full (3/3)" }, { status: 400 });
    }
  }

  const w = await wallet(db, user.id);
  if (w.available < def.cost) {
    return NextResponse.json({ error: `Not enough XP — you need ${def.cost - w.available} more` }, { status: 400 });
  }

  await db.run("INSERT INTO xp_purchases (user_id, item, cost, created_at) VALUES (?,?,?,?)", user.id, def.key, def.cost, new Date().toISOString());
  if (def.key === "freeze1") {
    await db.run("UPDATE settings SET freeze_stock = freeze_stock + 1 WHERE user_id = ?", user.id);
  }

  const after = await wallet(db, user.id);
  return NextResponse.json({ ok: true, xpAvailable: after.available, item: def.key });
}
