import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { endpoint } = await req.json().catch(() => ({}));
  if (!endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  const db = await getDb();
  // only your own subscription — never someone else's endpoint
  await db.run("DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?", String(endpoint), me.id);
  return NextResponse.json({ ok: true });
}
