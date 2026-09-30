import type { MetadataRoute } from "next";
import { siteBaseUrlHttps } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrlHttps();
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/dsa",
          "/webdev",
          "/revision",
          "/habits",
          "/progress",
          "/achievements",
          "/timer",
          "/about",
          "/privacy",
          "/terms",
          "/blog",
          "/login",
          "/signup",
        ],
        disallow: [
          "/api/",
          "/dashboard",
          "/admin",
          "/sessions",
          "/subjects",
          "/planner",
          "/settings",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}