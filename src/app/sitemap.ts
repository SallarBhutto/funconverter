import type { MetadataRoute } from "next";

import { siteRoutes } from "@/lib/seo/routes";
import { absoluteUrl } from "@/lib/seo/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return siteRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
