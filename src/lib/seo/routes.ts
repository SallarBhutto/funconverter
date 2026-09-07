import { sitePages } from "@/lib/site-pages";
import { tools } from "@/lib/tools";

/**
 * Registry of public, indexable routes. sitemap.xml is generated from this
 * list. Tool routes come from the tool registry and the privacy, terms and
 * contact routes from the trust-page registry, so a route is only listed
 * once the page genuinely exists.
 */
export interface SiteRoute {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

export const siteRoutes: readonly SiteRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  ...tools.map<SiteRoute>((tool) => ({
    path: tool.path,
    changeFrequency: "monthly",
    priority: 0.9,
  })),
  // Trust pages are indexable but rank below the tools: they support the
  // product rather than serving a search intent of their own.
  ...sitePages.map<SiteRoute>((page) => ({
    path: page.path,
    changeFrequency: "yearly",
    priority: 0.3,
  })),
];
