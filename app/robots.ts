import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/about",
          "/blog",
          "/blog/*",
          "/privacy",
          "/terms",
          "/login",
          "/signup",
        ],
        disallow: [
          "/api/",
          "/dashboard",
          "/admin",
          "/settings",
          "/sessions",
          "/subjects",
          "/planner",
        ],
      },
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/blog",
          "/blog/*",
          "/privacy",
          "/terms",
          "/login",
          "/signup",
        ],
        disallow: [
          "/api/",
          "/dashboard",
          "/admin",
          "/settings",
          "/sessions",
          "/subjects",
          "/planner",
        ],
      },
    ],
    sitemap: `${CANONICAL_SITE_URL}/sitemap.xml`,
    host: CANONICAL_SITE_URL,
  };
}
