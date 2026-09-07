/**
 * EXIF orientation values 1–8 as defined by TIFF 6.0. Only 1 means the
 * stored pixels are already upright.
 */
export type ExifOrientation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const SOI = 0xffd8;
const APP1 = 0xffe1;
const SOS = 0xffda;
const ORIENTATION_TAG = 0x0112;

/** How many leading bytes of a JPEG are worth scanning for the APP1 segment. */
export const EXIF_SCAN_BYTES = 128 * 1024;

/**
 * Reads the EXIF orientation tag from the start of a JPEG file. Returns null
 * for non-JPEG data, JPEGs without EXIF, or malformed segments. Never throws.
 */
export function readJpegOrientation(bytes: Uint8Array): ExifOrientation | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.byteLength < 4 || view.getUint16(0) !== SOI) return null;

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) return null;
    if (marker === SOS) return null;

    const segmentLength = view.getUint16(offset + 2);
    if (segmentLength < 2) return null;
    const segmentStart = offset + 4;
    const segmentEnd = offset + 2 + segmentLength;

    if (marker === APP1 && segmentEnd <= view.byteLength) {
      const orientation = readOrientationFromApp1(view, segmentStart, segmentEnd);
      if (orientation !== null) return orientation;
    }

    offset = segmentEnd;
  }
  return null;
}

function readOrientationFromApp1(
  view: DataView,
  start: number,
  end: number,
): ExifOrientation | null {
  // "Exif\0\0" header followed by a TIFF header.
  if (end - start < 14) return null;
  if (
    view.getUint8(start) !== 0x45 ||
    view.getUint8(start + 1) !== 0x78 ||
    view.getUint8(start + 2) !== 0x69 ||
    view.getUint8(start + 3) !== 0x66
  ) {
    return null;
  }

  const tiff = start + 6;
  const byteOrder = view.getUint16(tiff);
  const littleEndian = byteOrder === 0x4949;
  if (!littleEndian && byteOrder !== 0x4d4d) return null;
  if (view.getUint16(tiff + 2, littleEndian) !== 0x002a) return null;

  const ifdOffset = view.getUint32(tiff + 4, littleEndian);
  const ifd = tiff + ifdOffset;
  if (ifd + 2 > end) return null;

  const entryCount = view.getUint16(ifd, littleEndian);
  for (let i = 0; i < entryCount; i += 1) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > end) return null;
    if (view.getUint16(entry, littleEndian) !== ORIENTATION_TAG) continue;

    const value = view.getUint16(entry + 8, littleEndian);
    return value >= 1 && value <= 8 ? (value as ExifOrientation) : null;
  }
  return null;
}

/** True when the stored pixels need rotating or flipping to appear upright. */
export function needsOrientationFix(orientation: ExifOrientation | null): boolean {
  return orientation !== null && orientation !== 1;
}
