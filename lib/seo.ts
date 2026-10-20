import { headers } from "next/headers";

export const SITE_NAME = "FocusFlow";
export const SITE_DESCRIPTION =
  "FocusFlow is a fast, free study tracker with a focus timer, session logging, DSA and WebDev roadmaps, smart revision queues, habits, and progress analytics.";

export const CANONICAL_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://yourstudytracker.vercel.app";

export const AUTHOR_INFO = {
  name: "Shivansh",
  role: "Full-Stack Developer & Creator of FocusFlow",
  bio: "Full-stack software developer and student. Built FocusFlow to give learners a powerful, 100% free study ecosystem with Pomodoro timers, structured DSA & WebDev roadmaps, SM-2 spaced repetition, and real-time habit tracking.",
  url: "https://github.com/Shivansh-hub1",
  avatar: "/icon-192.webp",
};

export const SITE_KEYWORDS = [
  "study tracker",
  "focus timer",
  "pomodoro timer",
  "DSA practice tracker",
  "web development roadmap",
  "spaced repetition SM-2",
  "revision planner",
  "study planner",
  "exam countdown",
  "study streak",
  "habit tracker",
  "developer productivity",
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
