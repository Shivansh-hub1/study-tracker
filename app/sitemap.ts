import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

interface RouteItem {
  path: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

const PUBLIC_ROUTES: RouteItem[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/timer", changeFrequency: "weekly", priority: 0.95 },
  { path: "/dsa-tracker", changeFrequency: "weekly", priority: 0.95 },
  { path: "/webdev-tracker", changeFrequency: "weekly", priority: 0.95 },
  { path: "/study-tracker", changeFrequency: "weekly", priority: 0.95 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/blog/spaced-repetition-guide", changeFrequency: "monthly", priority: 0.85 },
  { path: "/blog/pomodoro-vs-deep-work", changeFrequency: "monthly", priority: 0.85 },
  { path: "/blog/dsa-roadmap-self-taught", changeFrequency: "monthly", priority: 0.85 },
  { path: "/blog/habit-stacking-students", changeFrequency: "monthly", priority: 0.85 },
  { path: "/blog/webdev-roadmap-2026", changeFrequency: "monthly", priority: 0.85 },
  { path: "/blog/analytics-driven-study", changeFrequency: "monthly", priority: 0.85 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.6 },
  { path: "/login", changeFrequency: "monthly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_ROUTES.map((route) => ({
    url: `${CANONICAL_SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
