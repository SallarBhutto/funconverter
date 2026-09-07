import { describe, expect, it } from "vitest";

import { sitePages } from "./site-pages";
import { tools } from "./tools";

describe("sitePages", () => {
  it("lists the three public trust pages", () => {
    expect(sitePages.map((page) => page.path)).toEqual(["/privacy", "/terms", "/contact"]);
  });

  it("gives every page a unique slug and a rooted path matching it", () => {
    const slugs = sitePages.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const page of sitePages) {
      expect(page.path).toBe(`/${page.slug}`);
    }
  });

  it("gives every page a name and a short footer label", () => {
    for (const page of sitePages) {
      expect(page.name.length).toBeGreaterThan(0);
      expect(page.shortName.length).toBeGreaterThan(0);
    }
  });

  it("does not overlap with the tool registry", () => {
    const toolPaths = new Set<string>(tools.map((tool) => tool.path));
    for (const page of sitePages) {
      expect(toolPaths.has(page.path)).toBe(false);
    }
  });
});
