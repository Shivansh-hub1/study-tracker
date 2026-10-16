import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { saveSubscription } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sub = await req.json().catch(() => null);
  const db = await getDb();
  const ok = await saveSubscription(db, me.id, sub);
  if (!ok) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
