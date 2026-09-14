import { headers } from "next/headers";

export const SITE_NAME = "FocusFlow";
export const SITE_DESCRIPTION =
  "FocusFlow is a free study tracker with a focus timer, session logging, DSA and WebDev roadmaps, revision planner, habits and progress analytics.";
export const SITE_KEYWORDS = [
  "study tracker",
  "focus timer",
  "pomodoro timer",
  "DSA practice tracker",
  "web development roadmap",
  "revision planner",
  "study planner",
  "exam countdown",
  "study streak",
];

/** Absolute base URL of the current request (correct on localhost and production, no config needed). */
export function siteBaseUrl() {
  try {
    const h = headers();
    const host = h.get("host") || "localhost:3000";
    const proto =
      h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  }
}

/** Same, but always https (used for sitemap/robots — crawlers should only see https). */
export function siteBaseUrlHttps() {
  const base = siteBaseUrl();
  return base.startsWith("http://localhost") ? base : base.replace(/^http:\/\//, "https://");
}
