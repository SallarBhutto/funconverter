import { describe, expect, it } from "vitest";

import { buildCompressedPdfFilename } from "./filenames";

describe("buildCompressedPdfFilename", () => {
  it("adds -compressed before the extension", () => {
    expect(buildCompressedPdfFilename("report.pdf")).toBe("report-compressed.pdf");
    expect(buildCompressedPdfFilename("REPORT.PDF")).toBe("REPORT-compressed.pdf");
  });

  it("keeps inner dots and strips only the final extension", () => {
    expect(buildCompressedPdfFilename("annual.report.v2.pdf")).toBe("annual.report.v2-compressed.pdf");
  });

  it("sanitises unusual names and falls back for empty stems", () => {
    expect(buildCompressedPdfFilename('q1:results*<final>?.pdf')).toBe("q1-results-final-compressed.pdf");
    expect(buildCompressedPdfFilename(".pdf")).toBe("document-compressed.pdf");
    expect(buildCompressedPdfFilename("")).toBe("document-compressed.pdf");
  });
});
