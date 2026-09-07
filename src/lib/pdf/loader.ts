import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

import { PdfProcessingError, throwIfAborted, toPdfProcessingError } from "./errors";

/**
 * Static files copied from node_modules/pdfjs-dist by
 * scripts/copy-vendor-assets.mjs and served by Next.js from public/pdfjs.
 * Nothing is fetched from a CDN.
 */
const PDFJS_ASSET_BASE = "/pdfjs";

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfjsModule> | null = null;

/**
 * Loads PDF.js on first use. The library is only reachable through this
 * dynamic import, so it lives in its own chunk and is never part of the
 * initial JavaScript of any route.
 */
function loadPdfjs(): Promise<PdfjsModule> {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS_ASSET_BASE}/pdf.worker.min.mjs`;
    return pdfjs;
  });
  return pdfjsPromise;
}

/** Thin wrapper so feature code never depends on PDF.js document types. */
export class PdfDocument {
  #loadingTask: PDFDocumentLoadingTask;
  #proxy: PDFDocumentProxy;
  #destroyed = false;

  constructor(loadingTask: PDFDocumentLoadingTask, proxy: PDFDocumentProxy) {
    this.#loadingTask = loadingTask;
    this.#proxy = proxy;
  }

  get pageCount(): number {
    return this.#proxy.numPages;
  }

  async getPage(pageNumber: number): Promise<PDFPageProxy> {
    try {
      return await this.#proxy.getPage(pageNumber);
    } catch (error) {
      throw toPdfProcessingError(error);
    }
  }

  /**
   * Releases the document on both the main thread and the worker. Safe to
   * call more than once.
   */
  async destroy(): Promise<void> {
    if (this.#destroyed) return;
    this.#destroyed = true;
    await this.#loadingTask.destroy().catch(() => undefined);
  }
}

/**
 * Reads the file once and parses it with PDF.js. The bytes are handed to the
 * worker; the caller never keeps its own copy.
 */
export async function openPdfDocument(
  file: File,
  signal?: AbortSignal,
): Promise<PdfDocument> {
  throwIfAborted(signal);
  const pdfjs = await loadPdfjs();
  throwIfAborted(signal);

  const data = await file.arrayBuffer();
  throwIfAborted(signal);

  // Every support directory below is produced by scripts/copy-vendor-assets.mjs.
  // The worker fetches from these URLs on demand (useWorkerFetch defaults to
  // true in browsers); trailing slashes are required by the API.
  const loadingTask = pdfjs.getDocument({
    data,
    cMapUrl: `${PDFJS_ASSET_BASE}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDFJS_ASSET_BASE}/standard_fonts/`,
    iccUrl: `${PDFJS_ASSET_BASE}/iccs/`,
    wasmUrl: `${PDFJS_ASSET_BASE}/wasm/`,
    verbosity: pdfjs.VerbosityLevel.ERRORS,
  });

  const onAbort = () => {
    loadingTask.destroy().catch(() => undefined);
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const proxy = await loadingTask.promise;
    if (signal?.aborted) {
      await loadingTask.destroy().catch(() => undefined);
      throw new PdfProcessingError("cancelled");
    }
    return new PdfDocument(loadingTask, proxy);
  } catch (error) {
    throw signal?.aborted
      ? new PdfProcessingError("cancelled")
      : toPdfProcessingError(error);
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}
