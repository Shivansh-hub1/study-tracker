import { NextResponse } from "next/server";
import { vapidPublicKey } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = vapidPublicKey();
  if (!key) return NextResponse.json({ error: "Push not configured (set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)" }, { status: 400 });
  return NextResponse.json({ key });
}
