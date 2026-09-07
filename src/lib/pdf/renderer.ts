import type { PDFPageProxy } from "pdfjs-dist";

import { planCanvasBackground } from "./background";
import { computePreviewDimensions, computeRenderDimensions } from "./canvas-limits";
import { PdfProcessingError, throwIfAborted, toPdfProcessingError } from "./errors";
import type { PreviewOptions, RenderPageOptions, RenderedPage, RenderedPreview } from "./types";

export {
  DEFAULT_TARGET_DPI,
  MAX_CANVAS_PIXELS,
  MAX_CANVAS_SIDE,
  computeRenderDimensions,
} from "./canvas-limits";

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: RenderPageOptions["format"],
  quality: number | undefined,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new PdfProcessingError("resources"));
          return;
        }
        // Browsers silently fall back to PNG for encoders they lack (older
        // Safari and WebP, for example). Refuse rather than mislabel a file.
        if (blob.type !== format) {
          reject(new PdfProcessingError("unsupported"));
          return;
        }
        resolve(blob);
      },
      format,
      quality,
    );
  });
}

/** Frees the canvas backing store without removing the element. */
export function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Downscales the freshly rendered page into the small preview canvas and
 * encodes it as JPEG. Drawing from the render canvas while it is still
 * populated avoids a second full-size render or decode. Previews are always
 * opaque; a transparent page would be composited onto white here.
 */
async function renderPreview(
  source: HTMLCanvasElement,
  { canvas, maxSide, quality }: PreviewOptions,
): Promise<RenderedPreview> {
  const { width, height } = computePreviewDimensions(source.width, source.height, maxSide);
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new PdfProcessingError("resources");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, "image/jpeg", quality);
  return { width, height, blob };
}

/**
 * Renders one page into `canvas` and encodes it as a Blob in the requested
 * format, optionally with a downscaled JPEG preview. The same canvases are
 * reused across pages: their backing stores are resized per page and the
 * caller releases them after the last page. The page proxy is cleaned up
 * before returning so PDF.js does not cache page resources on the main
 * thread.
 */
export async function renderPageToBlob(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  options: RenderPageOptions,
): Promise<RenderedPage> {
  const { format, quality, targetDpi, preview, signal } = options;
  const background = planCanvasBackground(options.background ?? "white");
  throwIfAborted(signal);

  const baseViewport = page.getViewport({ scale: 1 });
  const { scale, width, height } = computeRenderDimensions(
    baseViewport.width,
    baseViewport.height,
    targetDpi,
  );
  const viewport = page.getViewport({ scale });

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: background.contextAlpha });
  if (!context) throw new PdfProcessingError("resources");
  if (background.fillStyle) {
    context.fillStyle = background.fillStyle;
    context.fillRect(0, 0, width, height);
  }

  const renderTask = page.render({
    canvas,
    viewport,
    intent: "print",
    background: background.pdfjsBackground,
  });
  const onAbort = () => renderTask.cancel();
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    await renderTask.promise;
    throwIfAborted(signal);
    const blob = await canvasToBlob(canvas, format, quality);
    throwIfAborted(signal);
    const renderedPreview = preview ? await renderPreview(canvas, preview) : null;
    throwIfAborted(signal);
    return { pageNumber: page.pageNumber, width, height, blob, preview: renderedPreview };
  } catch (error) {
    if (signal?.aborted) throw new PdfProcessingError("cancelled");
    const mapped = toPdfProcessingError(error);
    throw mapped.code === "unknown" ? new PdfProcessingError("render", error) : mapped;
  } finally {
    signal?.removeEventListener("abort", onAbort);
    page.cleanup();
  }
}
