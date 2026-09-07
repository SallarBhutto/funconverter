import type { ImageFormatRule } from "@/lib/files/validation";

export type ImageInputFormat = "jpeg" | "png" | "webp";

/**
 * How an accepted image ends up inside the PDF.
 *
 * - "jpeg": original bytes are embedded as DCT-encoded data, no re-encoding,
 *   unless EXIF orientation requires normalising through a canvas first.
 * - "png": original bytes are embedded as PNG; alpha becomes a soft mask
 *   over the white page.
 * - "reencode-jpeg": PDF has no codec for the format (WebP), so the image is
 *   decoded by the browser and re-encoded as JPEG on a white background.
 */
export type EmbedStrategy = "jpeg" | "png" | "reencode-jpeg";

export interface ImageInputFormatConfig extends ImageFormatRule {
  id: ImageInputFormat;
  /** Value for the file input's `accept` attribute. */
  accept: string;
  embed: EmbedStrategy;
}

export const IMAGE_INPUT_FORMATS: Record<ImageInputFormat, ImageInputFormatConfig> = {
  jpeg: {
    id: "jpeg",
    label: "JPG",
    mimeTypes: ["image/jpeg", "image/pjpeg"],
    extensions: ["jpg", "jpeg"],
    accept: "image/jpeg,.jpg,.jpeg",
    embed: "jpeg",
  },
  png: {
    id: "png",
    label: "PNG",
    mimeTypes: ["image/png"],
    extensions: ["png"],
    accept: "image/png,.png",
    embed: "png",
  },
  webp: {
    id: "webp",
    label: "WebP",
    mimeTypes: ["image/webp"],
    extensions: ["webp"],
    accept: "image/webp,.webp",
    embed: "reencode-jpeg",
  },
};

/** JPEG quality used whenever an image must be re-encoded before embedding. */
export const REENCODE_JPEG_QUALITY = 0.92;

export function getImageInputFormat(id: ImageInputFormat): ImageInputFormatConfig {
  return IMAGE_INPUT_FORMATS[id];
}
