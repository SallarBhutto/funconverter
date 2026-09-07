import { describe, expect, it } from "vitest";

import { buildCompressedArchiveName, buildCompressedFilename } from "./filenames";

describe("buildCompressedFilename", () => {
  it("adds -compressed and normalises the extension", () => {
    expect(buildCompressedFilename("holiday.jpg", "jpg")).toBe("holiday-compressed.jpg");
    expect(buildCompressedFilename("holiday.jpeg", "jpg")).toBe("holiday-compressed.jpg");
    expect(buildCompressedFilename("logo.png", "png")).toBe("logo-compressed.png");
    expect(buildCompressedFilename("hero.webp", "webp")).toBe("hero-compressed.webp");
  });

  it("keeps inner dots and strips only the final extension", () => {
    expect(buildCompressedFilename("report.final.v2.jpg", "jpg")).toBe("report.final.v2-compressed.jpg");
  });

  it("sanitises unusual names and falls back for empty stems", () => {
    expect(buildCompressedFilename('a:b*c?"d.png', "png")).toBe("a-b-c-d-compressed.png");
    expect(buildCompressedFilename(".jpg", "jpg")).toBe("image-compressed.jpg");
    expect(buildCompressedFilename("", "webp")).toBe("image-compressed.webp");
  });
});

describe("buildCompressedArchiveName", () => {
  it("names the ZIP after the format", () => {
    expect(buildCompressedArchiveName("jpg")).toBe("compressed-jpg.zip");
    expect(buildCompressedArchiveName("png")).toBe("compressed-png.zip");
    expect(buildCompressedArchiveName("webp")).toBe("compressed-webp.zip");
  });
});
