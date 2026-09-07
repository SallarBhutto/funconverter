import { buildZipArchive } from "@/lib/files/zip";

import type { PageResult } from "./types";

/** Packs the page results into a ZIP using the shared lazy fflate archive builder. */
export function buildImageArchive(results: readonly PageResult[]): Promise<Blob> {
  return buildZipArchive(
    results.map((result) => ({ filename: result.download.filename, blob: result.download.blob })),
  );
}
