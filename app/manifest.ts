import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Study Tracker`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#14121f",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icon-192.webp", sizes: "192x192", type: "image/webp", purpose: "maskable" },
      { src: "/icon-512.webp", sizes: "512x512", type: "image/webp", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    categories: ["education", "productivity", "utilities"],
    shortcuts: [
      { name: "Start Timer", short_name: "Timer", url: "/timer", description: "Open focus timer" },
      { name: "DSA Roadmap", short_name: "DSA", url: "/dsa", description: "Open DSA journey" },
      { name: "WebDev Roadmap", short_name: "WebDev", url: "/webdev", description: "Open WebDev journey" },
    ],
  };
}
