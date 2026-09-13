import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FocusFlow — Study Tracker",
    short_name: "FocusFlow",
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#14121f",
    theme_color: "#7c3aed",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
