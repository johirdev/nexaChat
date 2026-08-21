import type { MetadataRoute } from "next";
import { siteDescription, siteName, siteTagline } from "@/src/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — ${siteTagline}`,
    short_name: siteName,
    description: siteDescription,
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#070c1a",
    theme_color: "#070c1a",
    orientation: "portrait-primary",
    categories: ["social", "communication", "productivity"],
    icons: [
      {
        src: "/nexaChat.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
