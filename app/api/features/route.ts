import { NextResponse } from "next/server";
import { getDb, featureOn } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public feature flags (read by AppShell to show/hide nav links).
export async function GET() {
  const db = await getDb();
  const [habits, planner, smartPlan] = await Promise.all([
    featureOn(db, "habits"),
    featureOn(db, "planner"),
    featureOn(db, "smart_plan"),
  ]);
  return NextResponse.json({ habits, planner, smartPlan });
}
