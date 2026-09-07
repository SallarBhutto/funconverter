import { describe, expect, it } from "vitest";

import { buildPdfFilename } from "./filenames";

describe("buildPdfFilename", () => {
  it("names a single-image PDF after the image", () => {
    expect(buildPdfFilename(["holiday.jpg"])).toBe("holiday.pdf");
    expect(buildPdfFilename(["scan.final.png"])).toBe("scan.final.pdf");
    expect(buildPdfFilename(["IMG_0042.JPEG"])).toBe("IMG_0042.pdf");
  });

  it("sanitises unusual single-image names and falls back for degenerate ones", () => {
    expect(buildPdfFilename(['photo:one*<two>?.webp'])).toBe("photo-one-two.pdf");
    expect(buildPdfFilename([".jpg"])).toBe("document.pdf");
  });

  it("uses the generic name for several images", () => {
    expect(buildPdfFilename(["a.jpg", "b.jpg"])).toBe("images.pdf");
    expect(buildPdfFilename(["holiday.jpg", "holiday.jpg", "holiday.jpg"])).toBe("images.pdf");
  });
});
