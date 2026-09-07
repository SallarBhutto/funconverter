import { describe, expect, it } from "vitest";

import { validatePdfFile } from "./validation";

describe("validatePdfFile", () => {
  it("accepts a file with a PDF MIME type", () => {
    expect(validatePdfFile({ name: "report.pdf", type: "application/pdf", size: 10 })).toEqual({
      ok: true,
    });
  });

  it("accepts the legacy x-pdf MIME type", () => {
    expect(
      validatePdfFile({ name: "scan", type: "application/x-pdf", size: 10 }).ok,
    ).toBe(true);
  });

  it("accepts a .pdf filename when the browser reports no MIME type", () => {
    expect(validatePdfFile({ name: "report.PDF", type: "", size: 10 }).ok).toBe(true);
  });

  it("accepts a .pdf filename when the MIME type is generic", () => {
    expect(
      validatePdfFile({ name: "report.pdf", type: "application/octet-stream", size: 10 }).ok,
    ).toBe(true);
  });

  it("rejects an obviously wrong file", () => {
    const result = validatePdfFile({ name: "photo.png", type: "image/png", size: 10 });
    expect(result).toEqual({
      ok: false,
      reason: "wrong-format",
      message: "Please choose a PDF file.",
    });
  });

  it("rejects an empty file", () => {
    const result = validatePdfFile({ name: "report.pdf", type: "application/pdf", size: 0 });
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ reason: "empty" });
  });
});
