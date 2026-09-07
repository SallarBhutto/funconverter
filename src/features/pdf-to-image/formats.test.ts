import { describe, expect, it } from "vitest";

import {
  RASTER_FORMATS,
  getPresetQuality,
  getQualityPreset,
  getRasterFormat,
  isQualityPreset,
  isRasterOutputFormat,
} from "./formats";

describe("raster format configuration", () => {
  it("defines exactly the three PDF-to-image formats", () => {
    expect(Object.keys(RASTER_FORMATS)).toEqual(["jpeg", "png", "webp"]);
    expect(isRasterOutputFormat("png")).toBe(true);
    expect(isRasterOutputFormat("gif")).toBe(false);
  });

  it("maps each format to its MIME type and extension", () => {
    expect(getRasterFormat("jpeg")).toMatchObject({ mimeType: "image/jpeg", extension: "jpg", label: "JPG" });
    expect(getRasterFormat("png")).toMatchObject({ mimeType: "image/png", extension: "png", label: "PNG" });
    expect(getRasterFormat("webp")).toMatchObject({ mimeType: "image/webp", extension: "webp", label: "WebP" });
  });

  it("renders every format on an opaque white page background", () => {
    for (const format of Object.values(RASTER_FORMATS)) {
      expect(format.background).toBe("white");
    }
  });
});

describe("JPEG quality presets", () => {
  it("keeps the original mapping and default", () => {
    const jpeg = getRasterFormat("jpeg");
    expect(jpeg.defaultPreset).toBe("balanced");
    expect(getPresetQuality(jpeg, "smaller")).toBe(0.6);
    expect(getPresetQuality(jpeg, "balanced")).toBe(0.8);
    expect(getPresetQuality(jpeg, "best")).toBe(0.92);
  });
});

describe("WebP quality presets", () => {
  it("uses a WebP-specific mapping in ascending order with Balanced as default", () => {
    const webp = getRasterFormat("webp");
    expect(webp.defaultPreset).toBe("balanced");
    expect(webp.qualityPresets?.map((preset) => preset.id)).toEqual(["smaller", "balanced", "best"]);
    expect(getPresetQuality(webp, "smaller")).toBe(0.55);
    expect(getPresetQuality(webp, "balanced")).toBe(0.75);
    expect(getPresetQuality(webp, "best")).toBe(0.9);
  });

  it("differs from the JPEG mapping", () => {
    const jpeg = getRasterFormat("jpeg");
    const webp = getRasterFormat("webp");
    expect(getPresetQuality(webp, "balanced")).not.toBe(getPresetQuality(jpeg, "balanced"));
  });
});

describe("PNG", () => {
  it("has no lossy quality presets and no default preset", () => {
    const png = getRasterFormat("png");
    expect(png.qualityPresets).toBeNull();
    expect(png.defaultPreset).toBeNull();
    expect(getPresetQuality(png, "balanced")).toBeUndefined();
    expect(() => getQualityPreset(png, "balanced")).toThrow(/PNG has no/);
  });
});

describe("preset guards", () => {
  it("recognises only the three preset ids", () => {
    expect(isQualityPreset("balanced")).toBe(true);
    expect(isQualityPreset("ultra")).toBe(false);
  });
});
