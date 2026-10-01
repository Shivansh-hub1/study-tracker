import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const FEATURES: Record<string, string> = { smartPlan: "smart_plan", habits: "habits", planner: "planner" };

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const rows = (await db.all("SELECT key, value FROM _meta WHERE key IN ('smart_plan','habits','planner')")) as any[];
  const m: Record<string, string> = {};
  for (const r of rows) m[r.key] = r.value;
  return NextResponse.json({
    smartPlan: m.smart_plan !== "0",
    habits: m.habits !== "0",
    planner: m.planner !== "0",
  });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { feature, value } = await req.json().catch(() => ({}));
  const key = FEATURES[feature];
  if (!key || typeof value !== "boolean") {
    return NextResponse.json({ error: "feature (smartPlan|habits|planner) + value boolean required" }, { status: 400 });
  }
  const db = await getDb();
  await db.run("INSERT OR REPLACE INTO _meta (key, value) VALUES (?, ?)", key, value ? "1" : "0");
  return NextResponse.json({ ok: true, feature, value });
}
