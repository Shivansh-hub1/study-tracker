import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Study Tracker`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    // Open the installed PWA straight into the app; middleware sends
    // logged-out users to /login automatically.
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#14121f",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    screenshots: [
      { src: "/screenshot-wide.png", sizes: "1280x720", type: "image/png", form_factor: "wide", label: "FocusFlow dashboard" },
      { src: "/screenshot-narrow.png", sizes: "750x1334", type: "image/png", form_factor: "narrow", label: "FocusFlow mobile timer" },
    ],
    categories: ["education", "productivity", "utilities"],
    shortcuts: [
      { name: "Start Timer", short_name: "Timer", url: "/timer", description: "Open focus timer" },
      { name: "DSA Roadmap", short_name: "DSA", url: "/dsa", description: "Open DSA journey" },
      { name: "WebDev Roadmap", short_name: "WebDev", url: "/webdev", description: "Open WebDev journey" },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}