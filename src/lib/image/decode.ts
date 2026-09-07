import { ImageProcessingError, throwIfAborted, toImageProcessingError } from "./errors";

/**
 * Decodes an image file with its EXIF orientation applied, so the bitmap's
 * dimensions and pixels match what the user sees in any viewer. The caller
 * owns the bitmap and must call `close()` when done.
 */
export async function decodeImage(file: Blob, signal?: AbortSignal): Promise<ImageBitmap> {
  throwIfAborted(signal);
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (error) {
    throw toImageProcessingError(error);
  }
}

export type EncodableType = "image/jpeg" | "image/png" | "image/webp";

export interface EncodeOptions {
  type: EncodableType;
  /** Encoder quality in [0, 1]; ignored for PNG. */
  quality?: number;
  /** Longest side of the output; the bitmap is downscaled to fit, never upscaled. */
  maxSide?: number;
}

export interface EncodedImage {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Draws a bitmap onto a temporary canvas and encodes it. JPEG output is
 * composited onto white because JPEG has no alpha channel; PNG and WebP keep
 * transparency. Browsers silently fall back to PNG for encoders they lack,
 * so a Blob whose type differs from the request is rejected as
 * "unsupported" rather than returned mislabelled. The canvas backing store
 * is released before returning.
 */
export async function encodeBitmap(
  bitmap: ImageBitmap,
  { type, quality, maxSide }: EncodeOptions,
): Promise<EncodedImage> {
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = maxSide && longest > maxSide ? maxSide / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  try {
    const opaque = type === "image/jpeg";
    const context = canvas.getContext("2d", { alpha: !opaque });
    if (!context) throw new ImageProcessingError("resources");
    if (opaque) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) reject(new ImageProcessingError("resources"));
          else if (result.type !== type) reject(new ImageProcessingError("unsupported"));
          else resolve(result);
        },
        type,
        quality,
      );
    });
    return { blob, width, height };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
