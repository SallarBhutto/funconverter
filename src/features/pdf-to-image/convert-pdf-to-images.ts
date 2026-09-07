import { throwIfAborted } from "@/lib/pdf/errors";
import type { PdfDocument } from "@/lib/pdf/loader";
import { releaseCanvas, renderPageToBlob } from "@/lib/pdf/renderer";
import type { RenderedPage } from "@/lib/pdf/types";

import type { RasterFormatConfig } from "./formats";
import type { ConversionProgress } from "./progress";

/**
 * Longest side of an on-screen preview in pixels. Result cards are at most
 * about 400 CSS px wide, so 480 px stays sharp on 1× displays and acceptable
 * on 2× while keeping each decoded preview under 1 MB of bitmap memory.
 */
export const PREVIEW_MAX_SIDE = 480;

/** Previews are display-only, so a lower JPEG quality than any download preset. */
export const PREVIEW_JPEG_QUALITY = 0.7;

export interface ConvertPdfToImagesOptions {
  format: RasterFormatConfig;
  /** Encoder quality in [0, 1]; undefined for formats without presets. */
  quality: number | undefined;
  signal: AbortSignal;
  onProgress: (progress: ConversionProgress) => void;
  onPage: (page: RenderedPage) => void;
}

/**
 * Renders every page of an open document to the requested raster format,
 * strictly one page at a time. One full-size render canvas and one small
 * preview canvas are reused for the whole run and released at the end, so
 * peak main-thread memory is a single page's bitmap plus the encoded Blobs
 * the caller chooses to keep. Stops at the first abort or error.
 */
export async function convertPdfToImages(
  pdf: PdfDocument,
  { format, quality, signal, onProgress, onPage }: ConvertPdfToImagesOptions,
): Promise<void> {
  const totalPages = pdf.pageCount;
  const renderCanvas = document.createElement("canvas");
  const previewCanvas = document.createElement("canvas");

  try {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      throwIfAborted(signal);
      onProgress({ currentPage: pageNumber, totalPages, completedPages: pageNumber - 1 });

      const page = await pdf.getPage(pageNumber);
      const rendered = await renderPageToBlob(page, renderCanvas, {
        format: format.mimeType,
        quality,
        background: format.background,
        preview: {
          canvas: previewCanvas,
          maxSide: PREVIEW_MAX_SIDE,
          quality: PREVIEW_JPEG_QUALITY,
        },
        signal,
      });

      onPage(rendered);
      onProgress({ currentPage: pageNumber, totalPages, completedPages: pageNumber });
    }
  } finally {
    releaseCanvas(renderCanvas);
    releaseCanvas(previewCanvas);
  }
}
