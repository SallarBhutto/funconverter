import { decodeImage, encodeBitmap } from "@/lib/image/decode";
import { ImageProcessingError, throwIfAborted, toImageProcessingError } from "@/lib/image/errors";
import { needsOrientationFix } from "@/lib/image/exif-orientation";

import { REENCODE_JPEG_QUALITY, type ImageInputFormatConfig } from "./formats";
import { computePageLayout, type PageSettings } from "./layout";
import type { GenerationProgress, SelectedImage } from "./types";

type JsPdfModule = typeof import("jspdf");
type JsPdf = InstanceType<JsPdfModule["jsPDF"]>;

interface EmbeddableImage {
  bytes: Uint8Array;
  format: "JPEG" | "PNG";
  width: number;
  height: number;
}

async function fileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * Re-encodes an image through the browser's decoder. Used when the original
 * bytes cannot be embedded as-is: EXIF-rotated JPEGs (jsPDF ignores EXIF),
 * WebP (PDF has no WebP codec), and PNGs jsPDF fails to parse.
 */
async function reencode(
  image: SelectedImage,
  type: "image/jpeg" | "image/png",
  signal: AbortSignal,
): Promise<EmbeddableImage> {
  const bitmap = await decodeImage(image.file, signal);
  try {
    const encoded = await encodeBitmap(bitmap, {
      type,
      quality: type === "image/jpeg" ? REENCODE_JPEG_QUALITY : undefined,
    });
    return {
      bytes: new Uint8Array(await encoded.blob.arrayBuffer()),
      format: type === "image/jpeg" ? "JPEG" : "PNG",
      width: encoded.width,
      height: encoded.height,
    };
  } finally {
    bitmap.close();
  }
}

/** Chooses between embedding original bytes and normalising through a canvas. */
async function prepareEmbeddable(
  image: SelectedImage,
  format: ImageInputFormatConfig,
  signal: AbortSignal,
): Promise<EmbeddableImage> {
  switch (format.embed) {
    case "jpeg":
      if (needsOrientationFix(image.exifOrientation)) {
        return reencode(image, "image/jpeg", signal);
      }
      return { bytes: await fileBytes(image.file), format: "JPEG", width: image.width, height: image.height };
    case "png":
      return { bytes: await fileBytes(image.file), format: "PNG", width: image.width, height: image.height };
    case "reencode-jpeg":
      return reencode(image, "image/jpeg", signal);
  }
}

function addImagePage(doc: JsPdf | null, embed: EmbeddableImage, settings: PageSettings, jspdf: JsPdfModule): JsPdf {
  const layout = computePageLayout(settings, embed.width, embed.height);
  const pageFormat = [layout.pageWidth, layout.pageHeight];

  const target =
    doc ??
    new jspdf.jsPDF({
      unit: "pt",
      format: pageFormat,
      orientation: layout.orientation,
      compress: true,
      putOnlyUsedFonts: true,
    });
  if (doc) target.addPage(pageFormat, layout.orientation);

  target.addImage({
    imageData: embed.bytes,
    format: embed.format,
    x: layout.image.x,
    y: layout.image.y,
    width: layout.image.width,
    height: layout.image.height,
    compression: "FAST",
  });
  return target;
}

export interface GeneratePdfOptions {
  format: ImageInputFormatConfig;
  settings: PageSettings;
  signal: AbortSignal;
  onProgress: (progress: GenerationProgress) => void;
}

export interface GeneratedDocument {
  blob: Blob;
  pageCount: number;
}

/**
 * Builds the PDF one image at a time: decode or read, place on its own
 * page, release, next. jsPDF is imported here so it only loads when someone
 * actually clicks Create PDF. Cancellation is honoured between images; the
 * final serialisation cannot be interrupted.
 */
export async function generatePdf(
  images: readonly SelectedImage[],
  { format, settings, signal, onProgress }: GeneratePdfOptions,
): Promise<GeneratedDocument> {
  if (images.length === 0) throw new ImageProcessingError("unknown");
  throwIfAborted(signal);
  const jspdf = await import("jspdf");
  throwIfAborted(signal);

  let doc: JsPdf | null = null;
  const total = images.length;

  for (let index = 0; index < total; index += 1) {
    const image = images[index];
    throwIfAborted(signal);
    onProgress({ current: index + 1, total });

    let embed = await prepareEmbeddable(image, format, signal);
    throwIfAborted(signal);

    try {
      doc = addImagePage(doc, embed, settings, jspdf);
    } catch (error) {
      // jsPDF's own PNG parser rejects some valid files (16-bit, exotic
      // colour types). The browser can decode them, so normalise and retry.
      if (embed.format !== "PNG") throw toImageProcessingError(error);
      embed = await reencode(image, "image/png", signal);
      throwIfAborted(signal);
      doc = addImagePage(doc, embed, settings, jspdf);
    }

    // Let React paint the progress update before the next decode.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  throwIfAborted(signal);
  const finished = doc as JsPdf;
  return { blob: finished.output("blob"), pageCount: finished.getNumberOfPages() };
}
