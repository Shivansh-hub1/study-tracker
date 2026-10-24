import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL } from "@/lib/seo";

const DISALLOWED_ROUTES = [
  "/api/",
  "/dashboard",
  "/admin",
  "/settings",
  "/sessions",
  "/subjects",

  "/shop",
  "/dsa",
  "/webdev",
  "/revision",
  "/progress",
  "/achievements",
  "/offline",
  "/forgot",
  "/reset",
  "/_next/",
];

const ALLOWED_ROUTES = [
  "/",
  "/timer",
  "/dsa-tracker",
  "/webdev-tracker",
  "/study-tracker",
  "/about",
  "/blog",
  "/blog/*",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Google-Extended", "GPTBot", "PerplexityBot", "ClaudeBot", "Applebot"],
        allow: ALLOWED_ROUTES,
        disallow: DISALLOWED_ROUTES,
      },
      {
        userAgent: "*",
        allow: ALLOWED_ROUTES,
        disallow: DISALLOWED_ROUTES,
      },
    ],
    sitemap: `${CANONICAL_SITE_URL}/sitemap.xml`,
    host: CANONICAL_SITE_URL,
  };
}
