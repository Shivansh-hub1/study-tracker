import { headers } from "next/headers";

export const SITE_NAME = "FocusFlow";
export const SITE_ALIASES = [
  "FocusFlow",
  "Focus Flow",
  "FocusFlow Tracker",
  "Focus Flow Tracker",
  "Your Study Tracker",
  "YourStudyTracker",
  "DSA Tracker",
  "DSA Study Tracker",
  "Web Dev Tracker",
  "WebDev Tracker",
  "Web Development Tracker",
  "Study Tracker",
  "StudyTracker",
];

export const SITE_DESCRIPTION =
  "Created by Shivansh, FocusFlow (Your Study Tracker) is a fast, free study operating system with a focus timer, session logging, structured DSA and WebDev roadmaps, SM-2 revision queues, habits, and progress analytics.";

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
  // Target keywords & spacing permutations (spaces and without spaces)
  "dsa tracker",
  "DSA tracker",
  "DSA sheet tracker",
  "dsa study tracker",
  "dsa practice tracker",
  "dsa progress tracker",
  "data structures and algorithms tracker",
  "web dev tracker",
  "webdev tracker",
  "web development tracker",
  "web development study tracker",
  "web dev roadmap tracker",
  "focus flow",
  "focusflow",
  "focus flow tracker",
  "focusflow tracker",
  "focusflow webdev tracker",
  "focusflow dsa tracker",
  "your study tracker",
  "yourstudytracker",
  "study tracker",
  "studytracker",
  "free study tracker",
  "online study tracker",
  "developer study tracker",
  "focus timer",
  "pomodoro timer",
  "spaced repetition SM-2",
  "revision planner",
  "study planner",
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
