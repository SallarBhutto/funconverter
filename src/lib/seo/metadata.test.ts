import { describe, expect, it } from "vitest";

import { buildPageMetadata, ogImage, twitterCard } from "./metadata";
import { siteConfig } from "./site-config";

describe("buildPageMetadata", () => {
  const metadata = buildPageMetadata({
    title: "Privacy Policy",
    description: "How FileHush handles your files and your visit.",
    path: "/privacy",
  });

  it("canonicalises the given path", () => {
    expect(metadata.alternates?.canonical).toBe("/privacy");
  });

  it("points Open Graph at the same path under the site name", () => {
    expect(metadata.openGraph).toMatchObject({
      url: "/privacy",
      siteName: siteConfig.name,
      title: "Privacy Policy",
    });
  });

  it("does not hard-code an origin, leaving metadataBase to resolve it", () => {
    expect(JSON.stringify(metadata)).not.toMatch(/https?:\/\//);
  });

  // Declaring `openGraph` on a page replaces the parent object, which drops
  // the image the opengraph-image file convention would contribute. Every
  // page built by this helper must therefore restate the shared card.
  it("attaches the shared Open Graph image", () => {
    expect(metadata.openGraph?.images).toEqual([ogImage]);
  });

  it("attaches the same image to the Twitter card", () => {
    expect(metadata.twitter?.images).toEqual([ogImage]);
    expect(metadata.twitter).toMatchObject({ card: twitterCard, title: "Privacy Policy" });
  });

  it("uses the shared image for every page it builds", () => {
    for (const path of ["/", "/compress-pdf", "/pdf-to-jpg", "/terms", "/contact"]) {
      const page = buildPageMetadata({ title: "T", description: "D", path });
      expect(page.openGraph?.images).toEqual([ogImage]);
      expect(page.twitter?.images).toEqual([ogImage]);
      expect(page.alternates?.canonical).toBe(path);
    }
  });
});

describe("ogImage", () => {
  it("is a site-relative URL so metadataBase resolves it per environment", () => {
    expect(ogImage.url).toBe("/opengraph-image?v=1");
    expect(ogImage.url).not.toMatch(/https?:\/\//);
  });

  it("carries a version query so social caches can be busted on redesign", () => {
    expect(ogImage.url).toMatch(/^\/opengraph-image\?v=\d+$/);
  });

  it("describes the 1200x630 PNG card that opengraph-image.tsx renders", () => {
    expect(ogImage).toMatchObject({ width: 1200, height: 630, type: "image/png" });
    expect(ogImage.alt).toContain(siteConfig.name);
  });
});
