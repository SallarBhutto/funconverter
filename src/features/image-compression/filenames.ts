import { deriveFileStem } from "@/lib/files/filenames";

/** "holiday.jpeg" → "holiday-compressed.jpg" */
export function buildCompressedFilename(originalName: string, extension: string): string {
  return `${deriveFileStem(originalName, "image")}-compressed.${extension}`;
}

/** "jpg" → "compressed-jpg.zip" */
export function buildCompressedArchiveName(extension: string): string {
  return `compressed-${extension}.zip`;
}
