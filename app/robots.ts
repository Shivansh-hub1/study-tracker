import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL } from "@/lib/seo";

const DISALLOWED_ROUTES = [
  "/api/",
  "/dashboard",
  "/admin",
  "/settings",
  "/sessions",
  "/subjects",
  "/planner",
  "/habits",
  "/shop",
  "/dsa",
  "/webdev",
  "/revision",
  "/progress",
  "/achievements",
  "/timer",
  "/offline",
  "/forgot",
  "/reset",
  "/_next/",
];

const ALLOWED_ROUTES = [
  "/",
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
        userAgent: "Googlebot",
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
