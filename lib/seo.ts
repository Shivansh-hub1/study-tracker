import { headers } from "next/headers";

export const SITE_NAME = "FocusFlow";
export const SITE_ALTERNATE_NAMES = [
  "Focus Flow",
  "Focus Flow Tracker",
  "FocusFlow Tracker",
  "Focus Flow DSA Tracker",
  "FocusFlow DSA Tracker",
  "DSA Tracker",
  "Web Dev Tracker",
  "Focus Flow Study Tracker",
];
export const SITE_DESCRIPTION =
  "FocusFlow (Focus Flow) is the free study tracker and focus timer for students and developers. Track DSA problem solving with our structured DSA tracker, follow full-stack web dev roadmaps, master SM-2 spaced revision, and build lasting study streaks.";

export const CANONICAL_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://tracker.devshivansh.in");

export const AUTHOR_INFO = {
  name: "Shivansh",
  role: "Full-Stack Developer & Creator of FocusFlow",
  bio: "Full-stack software developer and student. Built FocusFlow to give learners a powerful, 100% free study ecosystem with Pomodoro timers, structured DSA & WebDev roadmaps, SM-2 spaced repetition, and real-time habit tracking.",
  url: "https://github.com/Shivansh-hub1",
  avatar: "/icon-192.webp",
};

export const SITE_KEYWORDS = [
  "Focus Flow",
  "FocusFlow",
  "Focus Flow tracker",
  "FocusFlow tracker",
  "DSA tracker",
  "DSA practice tracker",
  "DSA roadmap",
  "web dev tracker",
  "web development tracker",
  "web development roadmap",
  "study tracker",
  "free study tracker",
  "focus timer",
  "pomodoro timer",
  "spaced repetition SM-2",
  "revision planner",
  "study planner",
  "exam countdown",
  "study streak",
  "habit tracker",
  "developer productivity",
  "LeetCode tracker",
  "coding tracker",
];

/** Absolute base URL of the current request (correct on localhost and production). */
export function siteBaseUrl() {
  try {
    const h = headers();
    const host = h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {}
  return CANONICAL_SITE_URL;
}

/** Same, but always https and guaranteed for sitemap/robots. */
export function siteBaseUrlHttps() {
  try {
    const base = siteBaseUrl();
    if (base.startsWith("http://localhost")) return base;
    return base.replace(/^http:\/\//, "https://");
  } catch {
    return CANONICAL_SITE_URL;
  }
}
