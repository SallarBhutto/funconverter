import { describe, expect, it } from "vitest";

import { needsOrientationFix, readJpegOrientation } from "./exif-orientation";

/** Builds a minimal JPEG prefix: SOI, an APP1 EXIF segment with one orientation entry, then SOS. */
function jpegWithOrientation(orientation: number, littleEndian = false): Uint8Array {
  const tiffEntries = 1;
  const tiff = new Uint8Array(8 + 2 + tiffEntries * 12 + 4);
  const view = new DataView(tiff.buffer);
  view.setUint16(0, littleEndian ? 0x4949 : 0x4d4d);
  view.setUint16(2, 0x002a, littleEndian);
  view.setUint32(4, 8, littleEndian);
  view.setUint16(8, tiffEntries, littleEndian);
  view.setUint16(10, 0x0112, littleEndian); // tag
  view.setUint16(12, 3, littleEndian); // SHORT
  view.setUint32(14, 1, littleEndian); // count
  view.setUint16(18, orientation, littleEndian); // value
  view.setUint32(22, 0, littleEndian); // next IFD

  const exifHeader = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00];
  const segmentLength = 2 + exifHeader.length + tiff.length;
  return new Uint8Array([
    0xff, 0xd8,
    0xff, 0xe1, segmentLength >> 8, segmentLength & 0xff,
    ...exifHeader,
    ...tiff,
    0xff, 0xda, 0x00, 0x02,
  ]);
}

describe("readJpegOrientation", () => {
  it("reads a big-endian orientation tag", () => {
    expect(readJpegOrientation(jpegWithOrientation(6))).toBe(6);
  });

  it("reads a little-endian orientation tag", () => {
    expect(readJpegOrientation(jpegWithOrientation(8, true))).toBe(8);
  });

  it("returns null for JPEGs without EXIF", () => {
    const plain = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x4a, 0x46, 0xff, 0xda, 0x00, 0x02]);
    expect(readJpegOrientation(plain)).toBeNull();
  });

  it("returns null for non-JPEG data and truncated input", () => {
    expect(readJpegOrientation(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
    expect(readJpegOrientation(new Uint8Array([0xff, 0xd8]))).toBeNull();
    expect(readJpegOrientation(jpegWithOrientation(6).slice(0, 20))).toBeNull();
  });

  it("rejects out-of-range orientation values", () => {
    expect(readJpegOrientation(jpegWithOrientation(9))).toBeNull();
  });
});

describe("needsOrientationFix", () => {
  it("is false only for upright or missing orientation", () => {
    expect(needsOrientationFix(null)).toBe(false);
    expect(needsOrientationFix(1)).toBe(false);
    expect(needsOrientationFix(3)).toBe(true);
    expect(needsOrientationFix(6)).toBe(true);
  });
});
