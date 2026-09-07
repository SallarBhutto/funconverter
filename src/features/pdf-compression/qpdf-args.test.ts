import { describe, expect, it } from "vitest";

import { getPdfCompressionMode } from "./modes";
import { QPDF_BASE_ARGS, QPDF_IMAGE_ARGS, buildQpdfArgs } from "./qpdf-args";

describe("buildQpdfArgs", () => {
  it("builds the lossless Preserve command", () => {
    const preserve = getPdfCompressionMode("preserve").qpdf!;
    expect(buildQpdfArgs(preserve)).toEqual([
      "--compress-streams=y",
      "--decode-level=generalized",
      "--recompress-flate",
      "--compression-level=9",
      "--object-streams=generate",
      "--",
      "input.pdf",
      "output.pdf",
    ]);
  });

  it("adds image optimisation for Balanced and nothing else", () => {
    const balanced = getPdfCompressionMode("balanced").qpdf!;
    const args = buildQpdfArgs(balanced);
    expect(args).toEqual([...QPDF_BASE_ARGS, ...QPDF_IMAGE_ARGS, "--", "input.pdf", "output.pdf"]);
    expect(args).toContain("--optimize-images");
  });

  it("never asks Preserve to touch images", () => {
    const preserve = getPdfCompressionMode("preserve").qpdf!;
    expect(buildQpdfArgs(preserve)).not.toContain("--optimize-images");
  });

  it("does not use --jpeg-quality, which this qpdf build rejects", () => {
    const balanced = getPdfCompressionMode("balanced").qpdf!;
    expect(buildQpdfArgs(balanced).some((arg) => arg.startsWith("--jpeg-quality"))).toBe(false);
  });

  it("places custom filenames after the -- separator", () => {
    const args = buildQpdfArgs({ optimizeImages: false }, "a.pdf", "b.pdf");
    expect(args.slice(-3)).toEqual(["--", "a.pdf", "b.pdf"]);
  });
});
