import { NextResponse } from "next/server";
import { getDb, featureOn } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// Public feature flags (read by AppShell to show/hide nav links).
export async function GET() {
  const db = await getDb();
  const [habits, planner, smartPlan] = await Promise.all([
    featureOn(db, "habits"),
    featureOn(db, "planner"),
    featureOn(db, "smart_plan"),
  ]);
  return NextResponse.json(
    { habits, planner, smartPlan },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Vercel-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    }
  );
}
