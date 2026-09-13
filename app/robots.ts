import type { MetadataRoute } from "next";
import { siteBaseUrlHttps } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrlHttps();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup"],
        disallow: [
          "/api/",
          "/dashboard",
          "/admin",
          "/timer",
          "/sessions",
          "/subjects",
          "/dsa",
          "/webdev",
          "/revision",
          "/planner",
          "/exams",
          "/flashcards",
          "/habits",
          "/leaderboard",
          "/achievements",
          "/progress",
          "/settings",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
