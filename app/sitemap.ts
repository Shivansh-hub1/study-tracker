import type { MetadataRoute } from "next";
import { siteBaseUrlHttps } from "@/lib/seo";

// Only public pages belong here — everything else needs a login, so crawlers can't see it.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteBaseUrlHttps();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
