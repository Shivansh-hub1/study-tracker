import { NextResponse } from "next/server";
import { CANONICAL_SITE_URL } from "@/lib/seo";

const INDEXNOW_KEY = "e3d7b892a0144f80927c3d182b8f411b";
const HOST = new URL(CANONICAL_SITE_URL).host;

const URLS = [
  `${CANONICAL_SITE_URL}/`,
  `${CANONICAL_SITE_URL}/dsa-tracker`,
  `${CANONICAL_SITE_URL}/webdev-tracker`,
  `${CANONICAL_SITE_URL}/study-tracker`,
  `${CANONICAL_SITE_URL}/about`,
  `${CANONICAL_SITE_URL}/blog`,
  `${CANONICAL_SITE_URL}/blog/spaced-repetition-guide`,
  `${CANONICAL_SITE_URL}/blog/pomodoro-vs-deep-work`,
  `${CANONICAL_SITE_URL}/blog/dsa-roadmap-self-taught`,
  `${CANONICAL_SITE_URL}/blog/webdev-roadmap-2026`,
  `${CANONICAL_SITE_URL}/blog/habit-stacking-students`,
  `${CANONICAL_SITE_URL}/blog/analytics-driven-study`,
];

export async function POST() {
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${CANONICAL_SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: URLS,
      }),
    });

    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
