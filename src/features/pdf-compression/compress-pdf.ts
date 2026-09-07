import { chooseSmaller, computeSavings, type Savings } from "@/lib/files/savings";
import { PdfProcessingError, throwIfAborted, toPdfProcessingError } from "@/lib/pdf/errors";
import type { PdfDocument } from "@/lib/pdf/loader";
import { runQpdf } from "@/lib/pdf/qpdf";
import { releaseCanvas, renderPageToBlob } from "@/lib/pdf/renderer";

import type { PdfCompressionModeConfig, RasterModeOptions } from "./modes";
import { QPDF_INPUT_NAME, QPDF_OUTPUT_NAME, buildQpdfArgs } from "./qpdf-args";
import type { CompressionProgress } from "./types";

export interface CompressPdfOptions {
  mode: PdfCompressionModeConfig;
  /** Required for Maximum mode, which renders through the open document. */
  document: PdfDocument | null;
  signal: AbortSignal;
  onProgress: (progress: CompressionProgress) => void;
}

export interface CompressedPdf extends Savings {
  /** The delivered bytes: the re-encoded Blob, or the original when that was smaller. */
  blob: Blob;
}

/**
 * Preserve and Balanced: hand the bytes to qpdf in its worker and read the
 * rewritten file back. The input copy is transferred to the worker and the
 * output is returned as a fresh buffer, so the original File plus one output
 * is all that lives on this side.
 */
async function optimiseWithQpdf(
  file: File,
  mode: PdfCompressionModeConfig,
  signal: AbortSignal,
): Promise<Blob> {
  if (!mode.qpdf) throw new PdfProcessingError("unknown");
  const input = new Uint8Array(await file.arrayBuffer());
  throwIfAborted(signal);
  const output = await runQpdf(
    input,
    buildQpdfArgs(mode.qpdf, QPDF_INPUT_NAME, QPDF_OUTPUT_NAME),
    QPDF_INPUT_NAME,
    QPDF_OUTPUT_NAME,
    signal,
  );
  return new Blob([output as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
}

type JsPdfModule = typeof import("jspdf");
type JsPdf = InstanceType<JsPdfModule["jsPDF"]>;

/**
 * Maximum: render every page to a JPEG at the compression density and
 * rebuild the document with jsPDF, page by page. Each new page keeps the
 * original page's size in points and therefore its aspect ratio and
 * orientation. One canvas is reused; each page's JPEG is dropped as soon as
 * it has been embedded. No preview images are produced.
 */
async function rasteriseWithJsPdf(
  pdf: PdfDocument,
  raster: RasterModeOptions,
  signal: AbortSignal,
  onProgress: (progress: CompressionProgress) => void,
): Promise<Blob> {
  const jspdf = await import("jspdf");
  throwIfAborted(signal);

  const totalPages = pdf.pageCount;
  const canvas = document.createElement("canvas");
  let doc: JsPdf | null = null;

  try {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      throwIfAborted(signal);
      onProgress({ currentPage: pageNumber, totalPages });

      const page = await pdf.getPage(pageNumber);
      // Points at scale 1, with the page's /Rotate already applied, so the
      // rebuilt page matches what a viewer shows.
      const { width, height } = page.getViewport({ scale: 1 });
      const rendered = await renderPageToBlob(page, canvas, {
        format: "image/jpeg",
        quality: raster.jpegQuality,
        targetDpi: raster.targetDpi,
        background: "white",
        signal,
      });
      throwIfAborted(signal);

      const bytes = new Uint8Array(await rendered.blob.arrayBuffer());
      const orientation = width > height ? "landscape" : "portrait";
      if (!doc) {
        doc = new jspdf.jsPDF({
          unit: "pt",
          format: [width, height],
          orientation,
          compress: true,
          putOnlyUsedFonts: true,
        });
      } else {
        doc.addPage([width, height], orientation);
      }
      doc.addImage({
        imageData: bytes,
        format: "JPEG",
        x: 0,
        y: 0,
        width,
        height,
        compression: "FAST",
      });

      // Let React paint the progress update before the next render.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    releaseCanvas(canvas);
  }

  throwIfAborted(signal);
  if (!doc) throw new PdfProcessingError("invalid");
  return doc.output("blob");
}

/**
 * Compresses one PDF in the chosen mode and never returns something larger
 * than the input: if the rewrite does not shrink the file, the original
 * bytes are delivered and the result is flagged "already optimized".
 */
export async function compressPdf(
  file: File,
  { mode, document, signal, onProgress }: CompressPdfOptions,
): Promise<CompressedPdf> {
  throwIfAborted(signal);
  let candidate: Blob;
  try {
    if (mode.engine === "raster") {
      if (!document || !mode.raster) throw new PdfProcessingError("invalid");
      candidate = await rasteriseWithJsPdf(document, mode.raster, signal, onProgress);
    } else {
      candidate = await optimiseWithQpdf(file, mode, signal);
    }
  } catch (error) {
    if (signal.aborted) throw new PdfProcessingError("cancelled");
    throw toPdfProcessingError(error);
  }
  throwIfAborted(signal);

  const { output } = chooseSmaller(file, candidate);
  return { blob: output, ...computeSavings(file.size, output.size) };
}
