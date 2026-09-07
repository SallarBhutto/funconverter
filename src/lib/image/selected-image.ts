import { validateImageFile, type ImageFormatRule } from "@/lib/files/validation";

import { decodeImage, encodeBitmap } from "./decode";
import { ImageProcessingError, throwIfAborted } from "./errors";
import { EXIF_SCAN_BYTES, readJpegOrientation, type ExifOrientation } from "./exif-orientation";

/** Longest side of a list thumbnail in pixels. */
export const THUMBNAIL_MAX_SIDE = 320;
const THUMBNAIL_QUALITY = 0.75;

/** One accepted image. The original File is kept for processing. */
export interface SelectedImage {
  id: string;
  file: File;
  name: string;
  size: number;
  /** Displayed (orientation-corrected) pixel dimensions. */
  width: number;
  height: number;
  /** EXIF orientation for JPEGs; null when absent or not a JPEG. */
  exifOrientation: ExifOrientation | null;
  /** Small JPEG used only for on-screen display. Owns one object URL. */
  preview: { objectUrl: string; width: number; height: number };
}

let nextImageId = 1;

/**
 * Validates one file against the format rule, decodes it once to learn its
 * displayed dimensions and draw a bounded thumbnail, then releases the
 * bitmap. Throws an ImageProcessingError with a user-safe message on any
 * failure. Shared by every tool that takes images as input.
 */
export async function loadSelectedImage(
  file: File,
  rule: ImageFormatRule,
  signal?: AbortSignal,
): Promise<SelectedImage> {
  const validation = validateImageFile(file, rule);
  if (!validation.ok) {
    throw new ImageProcessingError("wrong-format", validation.message);
  }

  const exifOrientation = rule.mimeTypes.includes("image/jpeg")
    ? readJpegOrientation(new Uint8Array(await file.slice(0, EXIF_SCAN_BYTES).arrayBuffer()))
    : null;
  throwIfAborted(signal);

  const bitmap = await decodeImage(file, signal);
  try {
    const thumbnail = await encodeBitmap(bitmap, {
      type: "image/jpeg",
      quality: THUMBNAIL_QUALITY,
      maxSide: THUMBNAIL_MAX_SIDE,
    });
    throwIfAborted(signal);
    return {
      id: `image-${nextImageId++}`,
      file,
      name: file.name,
      size: file.size,
      width: bitmap.width,
      height: bitmap.height,
      exifOrientation,
      preview: {
        objectUrl: URL.createObjectURL(thumbnail.blob),
        width: thumbnail.width,
        height: thumbnail.height,
      },
    };
  } finally {
    bitmap.close();
  }
}

/** The single cleanup path for image preview URLs. */
export function revokeSelectedImages(images: readonly SelectedImage[]): void {
  for (const image of images) {
    URL.revokeObjectURL(image.preview.objectUrl);
  }
}
