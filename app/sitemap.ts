import type { MetadataRoute } from "next";
import { siteBaseUrlHttps } from "@/lib/seo";

const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/dsa", changeFrequency: "weekly", priority: 0.9 },
  { path: "/webdev", changeFrequency: "weekly", priority: 0.9 },
  { path: "/revision", changeFrequency: "weekly", priority: 0.8 },
  { path: "/habits", changeFrequency: "weekly", priority: 0.8 },
  { path: "/progress", changeFrequency: "weekly", priority: 0.8 },
  { path: "/achievements", changeFrequency: "weekly", priority: 0.8 },
  { path: "/timer", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/blog", changeFrequency: "daily", priority: 0.7 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.5 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteBaseUrlHttps();
  const now = new Date();
  return PUBLIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}