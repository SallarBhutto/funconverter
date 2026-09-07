import { describe, expect, it } from "vitest";

import {
  DEFAULT_PDF_COMPRESSION_MODE,
  MAXIMUM_RASTER_OPTIONS,
  PDF_COMPRESSION_MODES,
  PDF_COMPRESSION_MODE_ORDER,
  getPdfCompressionMode,
  isPdfCompressionMode,
} from "./modes";

describe("PDF compression modes", () => {
  it("defines the three modes in order with Balanced as default", () => {
    expect(PDF_COMPRESSION_MODE_ORDER).toEqual(["preserve", "balanced", "maximum"]);
    expect(Object.keys(PDF_COMPRESSION_MODES)).toEqual(["preserve", "balanced", "maximum"]);
    expect(DEFAULT_PDF_COMPRESSION_MODE).toBe("balanced");
    expect(isPdfCompressionMode("maximum")).toBe(true);
    expect(isPdfCompressionMode("extreme")).toBe(false);
  });

  it("routes Preserve and Balanced through qpdf and Maximum through rasterising", () => {
    expect(getPdfCompressionMode("preserve").engine).toBe("qpdf");
    expect(getPdfCompressionMode("balanced").engine).toBe("qpdf");
    expect(getPdfCompressionMode("maximum").engine).toBe("raster");
  });

  it("only Balanced optimises images among the qpdf modes", () => {
    expect(getPdfCompressionMode("preserve").qpdf).toEqual({ optimizeImages: false });
    expect(getPdfCompressionMode("balanced").qpdf).toEqual({ optimizeImages: true });
    expect(getPdfCompressionMode("maximum").qpdf).toBeUndefined();
  });

  it("keeps text, vectors, links and forms in the qpdf modes and none of them in Maximum", () => {
    for (const id of ["preserve", "balanced"] as const) {
      expect(getPdfCompressionMode(id).preserves).toEqual({
        selectableText: true,
        vectorGraphics: true,
        links: true,
        formsAndAnnotations: true,
      });
    }
    expect(getPdfCompressionMode("maximum").preserves).toEqual({
      selectableText: false,
      vectorGraphics: false,
      links: false,
      formsAndAnnotations: false,
    });
  });

  it("renders Maximum below the PDF-to-JPG download settings and carries a caution", () => {
    const maximum = getPdfCompressionMode("maximum");
    expect(maximum.raster).toBe(MAXIMUM_RASTER_OPTIONS);
    expect(MAXIMUM_RASTER_OPTIONS.targetDpi).toBeLessThan(150);
    expect(MAXIMUM_RASTER_OPTIONS.targetDpi).toBeGreaterThanOrEqual(120);
    expect(MAXIMUM_RASTER_OPTIONS.jpegQuality).toBeLessThan(0.8);
    expect(MAXIMUM_RASTER_OPTIONS.jpegQuality).toBeGreaterThanOrEqual(0.65);
    expect(maximum.caution).toMatch(/text selection, links and forms/);
    expect(getPdfCompressionMode("preserve").caution).toBeUndefined();
  });
});
