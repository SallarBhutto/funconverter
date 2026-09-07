import { describe, expect, it } from "vitest";

import { buildArchiveFilename, buildPageImageFilename, deriveFileStem } from "./filenames";

describe("deriveFileStem", () => {
  it("strips the extension", () => {
    expect(deriveFileStem("report.pdf")).toBe("report");
    expect(deriveFileStem("REPORT.PDF")).toBe("REPORT");
  });

  it("keeps inner dots and removes only the final extension", () => {
    expect(deriveFileStem("report.final.pdf")).toBe("report.final");
    expect(deriveFileStem("v1.2.3.pdf")).toBe("v1.2.3");
  });

  it("keeps spaces and unicode but replaces unsafe characters", () => {
    expect(deriveFileStem("Annual Report 2026.pdf")).toBe("Annual Report 2026");
    expect(deriveFileStem("Rapport d'été — mars.pdf")).toBe("Rapport d'été — mars");
    expect(deriveFileStem('inv:oice*<2026>/"q?|1.pdf')).toBe("inv-oice-2026-q-1");
  });

  it("collapses whitespace and repeated hyphens", () => {
    expect(deriveFileStem("  my   file --- name  .pdf")).toBe("my file - name");
  });

  it("falls back for empty or degenerate stems", () => {
    expect(deriveFileStem(".pdf")).toBe("document");
    expect(deriveFileStem("")).toBe("document");
    expect(deriveFileStem("   ")).toBe("document");
    expect(deriveFileStem("///.pdf")).toBe("document");
    expect(deriveFileStem("...pdf", "scan")).toBe("scan");
  });

  it("handles names without an extension", () => {
    expect(deriveFileStem("scanned document")).toBe("scanned document");
  });

  it("truncates very long names without leaving a trailing separator", () => {
    const long = `${"a".repeat(79)} ${"b".repeat(40)}.pdf`;
    const stem = deriveFileStem(long);
    expect(stem.length).toBeLessThanOrEqual(80);
    expect(stem).toBe("a".repeat(79));
  });
});

describe("buildPageImageFilename", () => {
  it("builds JPG page names", () => {
    expect(buildPageImageFilename("document", 1, "jpg")).toBe("document-page-1.jpg");
  });

  it("builds PNG page names", () => {
    expect(buildPageImageFilename("document", 1, "png")).toBe("document-page-1.png");
    expect(buildPageImageFilename("document", 12, "png")).toBe("document-page-12.png");
  });

  it("builds WebP page names", () => {
    expect(buildPageImageFilename("document", 2, "webp")).toBe("document-page-2.webp");
  });
});

describe("buildArchiveFilename", () => {
  it("names the archive after the stem and format", () => {
    expect(buildArchiveFilename("document", "jpg")).toBe("document-jpg.zip");
    expect(buildArchiveFilename("document", "png")).toBe("document-png.zip");
    expect(buildArchiveFilename("document", "webp")).toBe("document-webp.zip");
  });
});
