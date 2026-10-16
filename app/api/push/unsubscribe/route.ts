import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { deleteSubscription } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { endpoint } = await req.json().catch(() => ({}));
  if (!endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  const db = await getDb();
  await deleteSubscription(db, String(endpoint));
  return NextResponse.json({ ok: true });
}
