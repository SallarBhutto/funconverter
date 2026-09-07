import { describe, expect, it } from "vitest";

import { sitePages } from "@/lib/site-pages";
import { tools } from "@/lib/tools";

import { siteRoutes } from "./routes";

const paths = siteRoutes.map((route) => route.path);

function priorityOf(path: string): number {
  const route = siteRoutes.find((candidate) => candidate.path === path);
  if (!route) throw new Error(`No sitemap route for ${path}`);
  return route.priority;
}

describe("siteRoutes", () => {
  it("includes the homepage and every tool", () => {
    expect(paths).toContain("/");
    for (const tool of tools) {
      expect(paths).toContain(tool.path);
    }
  });

  it("includes the privacy, terms and contact pages", () => {
    for (const page of sitePages) {
      expect(paths).toContain(page.path);
    }
  });

  it("lists every route exactly once", () => {
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("ranks trust pages below the homepage and the tools", () => {
    const toolPriority = Math.min(...tools.map((tool) => priorityOf(tool.path)));
    for (const page of sitePages) {
      expect(priorityOf(page.path)).toBeLessThan(toolPriority);
      expect(priorityOf(page.path)).toBeLessThan(priorityOf("/"));
    }
  });

  it("keeps every priority within the sitemap range", () => {
    for (const route of siteRoutes) {
      expect(route.priority).toBeGreaterThan(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });
});
