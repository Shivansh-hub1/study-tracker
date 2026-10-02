import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSettings } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { bustUser } from "@/lib/api-cache";
import { computeStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

const SHOP_ITEMS = [
  { key: "freeze1", cat: "Utility", name: "Streak Freeze +1", desc: "Bank one extra day off without losing your streak (max 3 stocked, 5 with Deep Freeze, 7 with Cryo Chamber).", icon: "❄️", cost: 125, repeatable: true },
  { key: "deep_freeze", cat: "Utility", name: "Deep Freeze", desc: "Permanently raises your streak-freeze stock cap from 3 to 5.", icon: "🧊", cost: 450, repeatable: false },
  { key: "cryo", cat: "Utility", name: "Cryo Chamber", desc: "The ultimate freeze upgrade: raises your streak-freeze stock cap from 5 to 7 (stacks with Deep Freeze).", icon: "🌡️", cost: 900, repeatable: false },
  { key: "unlock_year", cat: "Unlocks", name: "Full-Year Heatmap", desc: "Unlocks the 53-week full-year heatmap on the Progress page (free view: last 20 weeks).", icon: "🗓️", cost: 350, repeatable: false },
  { key: "unlock_export", cat: "Unlocks", name: "Data Export", desc: "Unlocks CSV and full-JSON data export in Settings.", icon: "📦", cost: 175, repeatable: false },
  { key: "theme_aurora", cat: "Themes", name: "Aurora Theme", desc: "Northern-lights premium color scheme for the whole app.", icon: "🌌", cost: 300, repeatable: false },
  { key: "theme_sunset", cat: "Themes", name: "Sunset Theme", desc: "Warm golden-dusk premium color scheme.", icon: "🌇", cost: 300, repeatable: false },
  { key: "theme_ocean", cat: "Themes", name: "Ocean Theme", desc: "Deep-sea blues and teals premium color scheme.", icon: "🌊", cost: 300, repeatable: false },
  { key: "theme_forest", cat: "Themes", name: "Forest Theme", desc: "Calm woodland greens premium color scheme.", icon: "🌲", cost: 300, repeatable: false },
  { key: "theme_sakura", cat: "Themes", name: "Sakura Theme", desc: "Soft cherry-blossom pink light premium color scheme.", icon: "🌸", cost: 300, repeatable: false },
  { key: "theme_dracula", cat: "Themes", name: "Dracula Theme", desc: "Classic dark purple-and-red premium color scheme.", icon: "🧛", cost: 350, repeatable: false },
  { key: "theme_nord", cat: "Themes", name: "Nord Theme", desc: "Cool arctic blue-grey premium color scheme.", icon: "🏔️", cost: 350, repeatable: false },
  { key: "theme_vapor", cat: "Themes", name: "Vaporwave Theme", desc: "Retro purple-cyan neon premium color scheme.", icon: "🌆", cost: 350, repeatable: false },
  { key: "theme_coffee", cat: "Themes", name: "Coffee Theme", desc: "Warm roasted-brown premium color scheme.", icon: "☕", cost: 300, repeatable: false },
  { key: "theme_royal", cat: "Themes", name: "Royal Gold Theme", desc: "Regal dark-and-gold premium color scheme.", icon: "👑", cost: 450, repeatable: false },
  { key: "theme_glass", cat: "Themes", name: "Glassmorphism Theme", desc: "Frosted glass cards with real background blur over colorful light blobs.", icon: "🧊", cost: 500, repeatable: false },
  { key: "theme_matyou", cat: "Themes", name: "Material You Theme", desc: "Google-style tonal lavender palette with big rounded cards and pill buttons.", icon: "🎨", cost: 500, repeatable: false },
  { key: "theme_obsidian", cat: "Themes", name: "Obsidian OLED Theme", desc: "True pure-black theme for OLED screens — deep blacks, electric blue accents.", icon: "🖤", cost: 600, repeatable: false },
  { key: "theme_holo", cat: "Themes", name: "Holographic Theme", desc: "Iridescent shifting gradients — cyan, violet, pink and gold.", icon: "🪩", cost: 750, repeatable: false },
  { key: "avatar_cat", cat: "Profile", name: "Avatar: Cat", desc: "Show a cat emoji next to your name in the sidebar.", icon: "🐱", cost: 100, repeatable: false },
  { key: "avatar_fox", cat: "Profile", name: "Avatar: Fox", desc: "Show a fox emoji next to your name in the sidebar.", icon: "🦊", cost: 100, repeatable: false },
  { key: "avatar_tiger", cat: "Profile", name: "Avatar: Tiger", desc: "Show a tiger emoji next to your name in the sidebar.", icon: "🐯", cost: 100, repeatable: false },
  { key: "avatar_dragon", cat: "Profile", name: "Avatar: Dragon", desc: "Show a dragon emoji next to your name in the sidebar.", icon: "🐲", cost: 125, repeatable: false },
  { key: "avatar_rocket", cat: "Profile", name: "Avatar: Rocket", desc: "Show a rocket emoji next to your name in the sidebar.", icon: "🚀", cost: 125, repeatable: false },
  { key: "avatar_ninja", cat: "Profile", name: "Avatar: Ninja", desc: "Show a ninja emoji next to your name in the sidebar.", icon: "🥷", cost: 125, repeatable: false },
  { key: "avatar_diamond", cat: "Profile", name: "Avatar: Diamond", desc: "Show a diamond emoji next to your name in the sidebar.", icon: "💎", cost: 250, repeatable: false },
  { key: "avatar_crystal", cat: "Profile", name: "Avatar: Crystal", desc: "Show a crystal ball emoji next to your name in the sidebar.", icon: "🔮", cost: 350, repeatable: false },
  { key: "title_nightowl", cat: "Profile", name: "Title: Night Owl", desc: "Show the Night Owl title under your name in the sidebar.", icon: "🌙", cost: 125, repeatable: false },
  { key: "title_deepworker", cat: "Profile", name: "Title: Deep Worker", desc: "Show the Deep Worker title under your name in the sidebar.", icon: "🧘", cost: 125, repeatable: false },
  { key: "title_codemonkey", cat: "Profile", name: "Title: Code Monkey", desc: "Show the Code Monkey title under your name in the sidebar.", icon: "💻", cost: 125, repeatable: false },
  { key: "title_ironwill", cat: "Profile", name: "Title: Iron Will", desc: "Show the Iron Will title under your name in the sidebar.", icon: "⚔️", cost: 175, repeatable: false },
  { key: "title_grandmaster", cat: "Profile", name: "Title: Grandmaster", desc: "Show the Grandmaster title under your name in the sidebar.", icon: "♟️", cost: 400, repeatable: false },
  { key: "title_zenmaster", cat: "Profile", name: "Title: Zen Master", desc: "Show the Zen Master title under your name in the sidebar.", icon: "☯️", cost: 450, repeatable: false },
  { key: "title_legend", cat: "Profile", name: "Title: FocusFlow Legend", desc: "The most prestigious title — shown under your name in the sidebar.", icon: "🏆", cost: 750, repeatable: false },
  { key: "pet_chick", cat: "Pets", name: "Pet: Chick", desc: "A cheerful chick that sits in the corner, bobs along, and celebrates every session you save.", icon: "🐣", cost: 100, repeatable: false },
  { key: "pet_penguin", cat: "Pets", name: "Pet: Penguin", desc: "A cool penguin companion that wiggles when you poke it.", icon: "🐧", cost: 125, repeatable: false },
  { key: "pet_frog", cat: "Pets", name: "Pet: Frog", desc: "A calm frog that hops happily each time you log focus time.", icon: "🐸", cost: 125, repeatable: false },
  { key: "pet_owl", cat: "Pets", name: "Pet: Owl", desc: "A wise owl keeping watch over your study sessions.", icon: "🦉", cost: 150, repeatable: false },
  { key: "pet_turtle", cat: "Pets", name: "Pet: Turtle", desc: "Slow and steady — a patient little study buddy.", icon: "🐢", cost: 150, repeatable: false },
  { key: "pet_octopus", cat: "Pets", name: "Pet: Octopus", desc: "An octopus juggling all your subjects at once.", icon: "🐙", cost: 200, repeatable: false },
  { key: "pet_alien", cat: "Pets", name: "Pet: Alien", desc: "A tiny alien beeping encouragement from the corner.", icon: "👾", cost: 250, repeatable: false },
  { key: "pet_ghost", cat: "Pets", name: "Pet: Ghost", desc: "A friendly ghost haunting your study corner (in a good way).", icon: "👻", cost: 350, repeatable: false },
  { key: "pet_unicorn", cat: "Pets", name: "Pet: Unicorn", desc: "A magical unicorn that sparkles when you save sessions.", icon: "🦄", cost: 450, repeatable: false },
  { key: "pet_phoenix", cat: "Pets", name: "Pet: Phoenix", desc: "A blazing phoenix — for comebacks and streak revivals.", icon: "🐦‍🔥", cost: 600, repeatable: false },
  { key: "pet_wizard", cat: "Pets", name: "Pet: Wizard", desc: "A wise wizard casting deep-work spells from your corner.", icon: "🧙", cost: 800, repeatable: false },
  { key: "confetti", cat: "Cosmetics", name: "Celebration Confetti", desc: "A confetti burst every time you save a study session.", icon: "🎉", cost: 175, repeatable: false },
  { key: "flame", cat: "Cosmetics", name: "Golden Streak Flame", desc: "Your dashboard streak card turns golden forever.", icon: "🔥", cost: 175, repeatable: false },
  { key: "anim_title", cat: "Cosmetics", name: "Animated Title", desc: "The FocusFlow logo gets a flowing animated rainbow gradient.", icon: "✨", cost: 175, repeatable: false },
  { key: "rainbow_streak", cat: "Cosmetics", name: "Rainbow Streak", desc: "Your dashboard streak number gets an animated rainbow gradient.", icon: "🌈", cost: 175, repeatable: false },
  { key: "pfp_ring", cat: "Cosmetics", name: "Rainbow Avatar Ring", desc: "A spinning rainbow ring around your sidebar profile picture.", icon: "💫", cost: 400, repeatable: false },
  { key: "bg_anim", cat: "Cosmetics", name: "Living Background", desc: "Your whole background slowly shifts through colors, alive.", icon: "🌊", cost: 550, repeatable: false },
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
    const deep = (await db.get("SELECT id FROM xp_purchases WHERE user_id = ? AND item = 'deep_freeze'", user.id)) as any;
    const cryo = (await db.get("SELECT id FROM xp_purchases WHERE user_id = ? AND item = 'cryo'", user.id)) as any;
    const cap = cryo ? 7 : deep ? 5 : 3;
    const s = (await db.get("SELECT freeze_stock FROM settings WHERE user_id = ?", user.id)) as any;
    if (Number(s?.freeze_stock ?? 0) >= cap) {
      return NextResponse.json({ error: `Freeze stock is full (${cap}/${cap})` }, { status: 400 });
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
