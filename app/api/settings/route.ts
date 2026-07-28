import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSettings } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  await ensureSettings(db, user.id);
  const s = await db.get("SELECT * FROM settings WHERE user_id = ?", user.id);
  return NextResponse.json({ settings: s });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  await ensureSettings(db, user.id);
  const b = await req.json().catch(() => ({}));
  const clamp = (v: any, lo: number, hi: number, dflt: number) => {
    const n = Number(v);
    return isNaN(n) ? dflt : Math.min(hi, Math.max(lo, Math.round(n)));
  };
  await db.run(
    "UPDATE settings SET pomo_work = ?, pomo_short = ?, pomo_long = ?, pomo_rounds = ?, auto_next = ?, week_start = ? WHERE user_id = ?",
    clamp(b.pomo_work, 5, 180, 25),
    clamp(b.pomo_short, 1, 60, 5),
    clamp(b.pomo_long, 5, 120, 15),
    clamp(b.pomo_rounds, 1, 12, 4),
    b.auto_next ? 1 : 0,
    b.week_start === 0 ? 0 : 1,
    user.id
  );
  return NextResponse.json({ settings: await db.get("SELECT * FROM settings WHERE user_id = ?", user.id) });
}
