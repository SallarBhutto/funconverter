import { describe, expect, it } from "vitest";

import {
  DEFAULT_PAGE_SETTINGS,
  MAX_PAGE_SIDE_PT,
  MARGIN_OPTIONS,
  ORIENTATION_OPTIONS,
  PAGE_SIZE_OPTIONS,
  computeFitToImagePage,
  computePageLayout,
  containFit,
  marginInPoints,
  resolveOrientation,
} from "./layout";

const A4 = { width: 595.28, height: 841.89 };
const LETTER = { width: 612, height: 792 };

describe("options and defaults", () => {
  it("defaults to A4, Auto, Small", () => {
    expect(DEFAULT_PAGE_SETTINGS).toEqual({ pageSize: "a4", orientation: "auto", margin: "small" });
  });

  it("exposes exactly the documented options", () => {
    expect(PAGE_SIZE_OPTIONS.map((o) => o.id)).toEqual(["a4", "letter", "fit"]);
    expect(ORIENTATION_OPTIONS.map((o) => o.id)).toEqual(["auto", "portrait", "landscape"]);
    expect(MARGIN_OPTIONS.map((o) => o.id)).toEqual(["none", "small", "medium"]);
  });
});

describe("marginInPoints", () => {
  it("maps margins to 0, 10 and 20 mm", () => {
    expect(marginInPoints("none")).toBe(0);
    expect(marginInPoints("small")).toBeCloseTo(28.35, 2);
    expect(marginInPoints("medium")).toBeCloseTo(56.69, 2);
  });
});

describe("resolveOrientation", () => {
  it("follows the image when Auto", () => {
    expect(resolveOrientation("auto", 4000, 3000)).toBe("landscape");
    expect(resolveOrientation("auto", 3000, 4000)).toBe("portrait");
    expect(resolveOrientation("auto", 500, 500)).toBe("portrait");
  });

  it("honours an explicit choice regardless of the image", () => {
    expect(resolveOrientation("portrait", 4000, 3000)).toBe("portrait");
    expect(resolveOrientation("landscape", 3000, 4000)).toBe("landscape");
  });
});

describe("containFit", () => {
  it("fits a wide image by width and centres it vertically", () => {
    const box = containFit(500, 700, 2000, 1000);
    expect(box.width).toBe(500);
    expect(box.height).toBe(250);
    expect(box.x).toBe(0);
    expect(box.y).toBe(225);
  });

  it("fits a tall image by height and centres it horizontally", () => {
    const box = containFit(500, 700, 1000, 2000);
    expect(box.height).toBe(700);
    expect(box.width).toBe(350);
    expect(box.x).toBe(75);
    expect(box.y).toBe(0);
  });

  it("preserves aspect ratio and upscales small images", () => {
    const box = containFit(500, 700, 100, 50);
    expect(box.width / box.height).toBeCloseTo(2, 6);
    expect(box.width).toBe(500);
  });

  it("never divides by zero", () => {
    const box = containFit(500, 700, 0, 0);
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });
});

describe("computePageLayout with fixed page sizes", () => {
  it("places a portrait photo on an A4 portrait page inside small margins", () => {
    const layout = computePageLayout(DEFAULT_PAGE_SETTINGS, 3000, 4000);
    expect(layout.orientation).toBe("portrait");
    expect(layout.pageWidth).toBeCloseTo(A4.width, 1);
    expect(layout.pageHeight).toBeCloseTo(A4.height, 1);
    const margin = marginInPoints("small");
    expect(layout.image.x).toBeGreaterThanOrEqual(margin - 1e-6);
    expect(layout.image.y).toBeGreaterThanOrEqual(margin - 1e-6);
    expect(layout.image.x + layout.image.width).toBeLessThanOrEqual(A4.width - margin + 1e-6);
    expect(layout.image.y + layout.image.height).toBeLessThanOrEqual(A4.height - margin + 1e-6);
    expect(layout.image.width / layout.image.height).toBeCloseTo(3 / 4, 6);
  });

  it("rotates the page for a landscape photo when orientation is Auto", () => {
    const layout = computePageLayout(DEFAULT_PAGE_SETTINGS, 4000, 3000);
    expect(layout.orientation).toBe("landscape");
    expect(layout.pageWidth).toBeCloseTo(A4.height, 1);
    expect(layout.pageHeight).toBeCloseTo(A4.width, 1);
  });

  it("keeps a portrait page for a landscape photo when Portrait is forced", () => {
    const layout = computePageLayout(
      { pageSize: "letter", orientation: "portrait", margin: "none" },
      4000,
      3000,
    );
    expect(layout.pageWidth).toBe(LETTER.width);
    expect(layout.pageHeight).toBe(LETTER.height);
    expect(layout.image.width).toBe(LETTER.width);
    expect(layout.image.x).toBe(0);
    expect(layout.image.y).toBeGreaterThan(0);
  });

  it("uses the full page with no margin", () => {
    const layout = computePageLayout(
      { pageSize: "a4", orientation: "auto", margin: "none" },
      2100,
      2970,
    );
    expect(layout.image.x).toBeCloseTo(0, 6);
    expect(layout.image.y).toBeCloseTo(0, 6);
    expect(layout.image.width).toBeCloseTo(A4.width, 1);
  });

  it("centres the image inside medium margins", () => {
    const layout = computePageLayout(
      { pageSize: "a4", orientation: "portrait", margin: "medium" },
      1000,
      1000,
    );
    const margin = marginInPoints("medium");
    const available = A4.width - 2 * margin;
    expect(layout.image.width).toBeCloseTo(available, 1);
    expect(layout.image.x).toBeCloseTo(margin, 1);
    expect(layout.image.y).toBeCloseTo((A4.height - available) / 2, 1);
  });
});

describe("computeFitToImagePage", () => {
  it("maps pixels to points at 96 px/in and adds the margin", () => {
    const layout = computeFitToImagePage(1920, 1080, "none");
    expect(layout.pageWidth).toBe(1440);
    expect(layout.pageHeight).toBe(810);
    expect(layout.orientation).toBe("landscape");
    expect(layout.image).toEqual({ x: 0, y: 0, width: 1440, height: 810 });

    const withMargin = computeFitToImagePage(960, 1280, "small");
    const margin = marginInPoints("small");
    expect(withMargin.pageWidth).toBeCloseTo(720 + 2 * margin, 6);
    expect(withMargin.pageHeight).toBeCloseTo(960 + 2 * margin, 6);
    expect(withMargin.image.x).toBeCloseTo(margin, 6);
    expect(withMargin.orientation).toBe("portrait");
  });

  it("caps giant images at the PDF page limit while preserving aspect ratio", () => {
    const layout = computeFitToImagePage(40000, 20000, "medium");
    expect(layout.pageWidth).toBeCloseTo(MAX_PAGE_SIDE_PT, 6);
    expect(layout.pageHeight).toBeLessThan(MAX_PAGE_SIDE_PT);
    expect(layout.image.width / layout.image.height).toBeCloseTo(2, 6);
    expect(layout.image.x + layout.image.width).toBeLessThanOrEqual(layout.pageWidth + 1e-6);
  });

  it("emits a valid page for a tiny image", () => {
    const layout = computeFitToImagePage(1, 1, "none");
    expect(layout.pageWidth).toBeGreaterThanOrEqual(3);
    expect(layout.pageHeight).toBeGreaterThanOrEqual(3);
  });

  it("is used by computePageLayout and ignores the orientation setting", () => {
    const layout = computePageLayout(
      { pageSize: "fit", orientation: "portrait", margin: "none" },
      1920,
      1080,
    );
    expect(layout.orientation).toBe("landscape");
    expect(layout.pageWidth).toBe(1440);
  });
});
