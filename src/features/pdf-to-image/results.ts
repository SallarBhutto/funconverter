import { buildPageImageFilename } from "@/lib/files/filenames";
import type { RenderedPage } from "@/lib/pdf/types";

import type { PageResult } from "./types";

/**
 * Wraps a rendered page in a result that owns two object URLs: one for the
 * full-size download and one for the small preview shown on screen. The
 * full-size image is never used as an <img> source.
 */
export function createPageResult(
  rendered: RenderedPage,
  stem: string,
  extension: string,
): PageResult {
  if (!rendered.preview) {
    throw new Error("createPageResult requires a rendered preview");
  }

  return {
    id: `${stem}-${rendered.pageNumber}`,
    pageNumber: rendered.pageNumber,
    width: rendered.width,
    height: rendered.height,
    download: {
      blob: rendered.blob,
      objectUrl: URL.createObjectURL(rendered.blob),
      filename: buildPageImageFilename(stem, rendered.pageNumber, extension),
      size: rendered.blob.size,
    },
    preview: {
      objectUrl: URL.createObjectURL(rendered.preview.blob),
      width: rendered.preview.width,
      height: rendered.preview.height,
    },
  };
}

/** The single cleanup path for result object URLs: both download and preview. */
export function revokePageResults(results: readonly PageResult[]): void {
  for (const result of results) {
    URL.revokeObjectURL(result.download.objectUrl);
    URL.revokeObjectURL(result.preview.objectUrl);
  }
}
