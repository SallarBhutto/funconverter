import { describe, expect, it } from "vitest";

import { validateImageFile } from "@/lib/files/validation";

import {
  COMPRESSIBLE_FORMATS,
  getCompressibleFormat,
  getPresetQuality,
  isExpectedEncoding,
  isQualityPreset,
} from "./formats";

describe("compressible format configuration", () => {
  it("defines the three formats with their encoders", () => {
    expect(Object.keys(COMPRESSIBLE_FORMATS)).toEqual(["jpeg", "png", "webp"]);
    expect(getCompressibleFormat("jpeg")).toMatchObject({
      mimeType: "image/jpeg",
      extension: "jpg",
      encoder: "canvas-jpeg",
      preservesTransparency: false,
    });
    expect(getCompressibleFormat("png")).toMatchObject({
      mimeType: "image/png",
      extension: "png",
      encoder: "oxipng",
      preservesTransparency: true,
    });
    expect(getCompressibleFormat("webp")).toMatchObject({
      mimeType: "image/webp",
      extension: "webp",
      encoder: "canvas-webp",
      preservesTransparency: true,
    });
  });

  it("accepts each format's own files and rejects the others", () => {
    const jpeg = getCompressibleFormat("jpeg");
    const png = getCompressibleFormat("png");
    expect(validateImageFile({ name: "a.jpeg", type: "image/jpeg", size: 1 }, jpeg).ok).toBe(true);
    expect(validateImageFile({ name: "a.JPG", type: "", size: 1 }, jpeg).ok).toBe(true);
    expect(validateImageFile({ name: "a.png", type: "image/png", size: 1 }, jpeg).ok).toBe(false);
    expect(validateImageFile({ name: "a.webp", type: "image/webp", size: 1 }, png).ok).toBe(false);
  });
});

describe("JPG quality presets", () => {
  it("map to a JPEG-specific scale with Balanced as default", () => {
    const jpeg = getCompressibleFormat("jpeg");
    expect(jpeg.defaultPreset).toBe("balanced");
    expect(jpeg.qualityPresets?.map((preset) => preset.id)).toEqual(["smaller", "balanced", "best"]);
    expect(getPresetQuality(jpeg, "smaller")).toBe(0.55);
    expect(getPresetQuality(jpeg, "balanced")).toBe(0.72);
    expect(getPresetQuality(jpeg, "best")).toBe(0.85);
  });
});

describe("WebP quality presets", () => {
  it("map to a WebP-specific scale with Balanced as default", () => {
    const webp = getCompressibleFormat("webp");
    expect(webp.defaultPreset).toBe("balanced");
    expect(getPresetQuality(webp, "smaller")).toBe(0.5);
    expect(getPresetQuality(webp, "balanced")).toBe(0.7);
    expect(getPresetQuality(webp, "best")).toBe(0.85);
  });

  it("differ from the JPG scale", () => {
    expect(getPresetQuality(getCompressibleFormat("webp"), "balanced")).not.toBe(
      getPresetQuality(getCompressibleFormat("jpeg"), "balanced"),
    );
  });
});

describe("PNG", () => {
  it("has no quality presets and no default preset", () => {
    const png = getCompressibleFormat("png");
    expect(png.qualityPresets).toBeNull();
    expect(png.defaultPreset).toBeNull();
    expect(getPresetQuality(png, "balanced")).toBeUndefined();
  });
});

describe("isExpectedEncoding", () => {
  it("detects the browser's silent PNG fallback", () => {
    expect(isExpectedEncoding({ type: "image/webp" }, "image/webp")).toBe(true);
    expect(isExpectedEncoding({ type: "image/png" }, "image/webp")).toBe(false);
    expect(isExpectedEncoding({ type: "" }, "image/jpeg")).toBe(false);
    expect(isExpectedEncoding({ type: "IMAGE/JPEG" }, "image/jpeg")).toBe(true);
  });
});

describe("isQualityPreset", () => {
  it("recognises only the three preset ids", () => {
    expect(isQualityPreset("smaller")).toBe(true);
    expect(isQualityPreset("lossless")).toBe(false);
  });
});
