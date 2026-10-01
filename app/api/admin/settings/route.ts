import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const m = (await db.get("SELECT value FROM _meta WHERE key = 'smart_plan'")) as any;
  return NextResponse.json({ smartPlan: !m || m.value !== "0" });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { smartPlan } = await req.json().catch(() => ({}));
  if (typeof smartPlan !== "boolean") return NextResponse.json({ error: "smartPlan boolean required" }, { status: 400 });
  const db = await getDb();
  await db.run("INSERT OR REPLACE INTO _meta (key, value) VALUES ('smart_plan', ?)", smartPlan ? "1" : "0");
  return NextResponse.json({ ok: true, smartPlan });
}
