import { deriveFileStem } from "@/lib/files/filenames";

/** "report.pdf" → "report-compressed.pdf" */
export function buildCompressedPdfFilename(originalName: string): string {
  return `${deriveFileStem(originalName)}-compressed.pdf`;
}
