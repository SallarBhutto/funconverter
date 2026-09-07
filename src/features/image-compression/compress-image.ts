import { decodeImage, encodeBitmap } from "@/lib/image/decode";
import { ImageProcessingError, throwIfAborted, toImageProcessingError } from "@/lib/image/errors";
import type { SelectedImage } from "@/lib/image/selected-image";

import {
  OXIPNG_LEVEL,
  getPresetQuality,
  isExpectedEncoding,
  type CompressibleFormatConfig,
  type QualityPreset,
} from "./formats";
import { chooseSmaller, computeSavings, type Savings } from "./savings";

export interface CompressedImage extends Savings {
  /** The delivered bytes: the re-encoded Blob, or the original when that was smaller. */
  blob: Blob;
}

/**
 * Lossy path shared by JPG and WebP: decode with orientation applied, draw
 * to a canvas at the original pixel size, re-encode. EXIF and other
 * metadata are not carried over, which is why phone photos come out
 * upright: the rotation is baked into the pixels. The bitmap is closed
 * before returning.
 */
async function reencodeThroughCanvas(
  image: SelectedImage,
  format: CompressibleFormatConfig,
  quality: number | undefined,
  signal: AbortSignal,
): Promise<Blob> {
  const bitmap = await decodeImage(image.file, signal);
  try {
    throwIfAborted(signal);
    const encoded = await encodeBitmap(bitmap, { type: format.mimeType, quality });
    if (!isExpectedEncoding(encoded.blob, format.mimeType)) {
      throw new ImageProcessingError("unsupported");
    }
    return encoded.blob;
  } finally {
    bitmap.close();
  }
}

/**
 * Static files copied from node_modules/@jsquash/oxipng by
 * scripts/copy-vendor-assets.mjs and served by Next.js from public/oxipng.
 * The module is imported by URL at runtime, not bundled: the wasm-bindgen
 * glue assigns to `import.meta.url`, which bundlers cannot process.
 */
const OXIPNG_MODULE_URL = "/oxipng/squoosh_oxipng.js";
const OXIPNG_WASM_URL = "/oxipng/squoosh_oxipng_bg.wasm";

/** The subset of the wasm-bindgen module this code calls. */
interface OxipngModule {
  default: (input: string | URL) => Promise<unknown>;
  optimise: (
    data: Uint8Array,
    level: number,
    interlace: boolean,
    optimiseAlpha: boolean,
  ) => Uint8Array;
}

let oxipngPromise: Promise<OxipngModule> | null = null;

/** Loads and initialises OxiPNG once per page, on first use. */
function loadOxipng(): Promise<OxipngModule> {
  oxipngPromise ??= (async () => {
    const codec = (await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ OXIPNG_MODULE_URL
    )) as OxipngModule;
    await codec.default(OXIPNG_WASM_URL);
    return codec;
  })().catch((error) => {
    oxipngPromise = null;
    throw error;
  });
  return oxipngPromise;
}

/**
 * Lossless path for PNG: OxiPNG (WebAssembly) rewrites the original bytes
 * with better filters and deflate settings. Pixels and transparency are
 * untouched by construction. The codec loads only on the PNG route, and
 * only once compression actually starts.
 */
async function optimisePng(image: SelectedImage, signal: AbortSignal): Promise<Blob> {
  const oxipng = await loadOxipng();
  throwIfAborted(signal);
  const input = new Uint8Array(await image.file.arrayBuffer());
  throwIfAborted(signal);
  try {
    const output = oxipng.optimise(input, OXIPNG_LEVEL, false, false);
    return new Blob([output as Uint8Array<ArrayBuffer>], { type: "image/png" });
  } catch (error) {
    throw new ImageProcessingError("unreadable", undefined, error);
  }
}

/**
 * Compresses one image and never returns something larger than the input:
 * if re-encoding does not shrink the file, the original File is delivered
 * unchanged and the result is flagged "already optimized".
 */
export async function compressImage(
  image: SelectedImage,
  format: CompressibleFormatConfig,
  preset: QualityPreset,
  signal: AbortSignal,
): Promise<CompressedImage> {
  throwIfAborted(signal);
  let candidate: Blob;
  try {
    candidate =
      format.encoder === "oxipng"
        ? await optimisePng(image, signal)
        : await reencodeThroughCanvas(image, format, getPresetQuality(format, preset), signal);
  } catch (error) {
    if (signal.aborted) throw new ImageProcessingError("cancelled");
    throw toImageProcessingError(error);
  }
  throwIfAborted(signal);

  const { output } = chooseSmaller(image.file, candidate);
  return { blob: output, ...computeSavings(image.file.size, output.size) };
}
