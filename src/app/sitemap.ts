import type { MetadataRoute } from "next";
import { absoluteUrl, indexableRoutes } from "@/src/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static marketing pages, so the build time is an honest lastModified.
  const lastModified = new Date();

  return indexableRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
