import { deriveFileStem } from "@/lib/files/filenames";

export const MULTI_IMAGE_PDF_NAME = "images.pdf";

/**
 * One image keeps its own name ("holiday.jpg" → "holiday.pdf"); a batch gets
 * a predictable generic name, since naming a 12-photo PDF after whichever
 * photo happens to be first is rarely what people expect.
 */
export function buildPdfFilename(imageNames: readonly string[]): string {
  if (imageNames.length === 1) return `${deriveFileStem(imageNames[0])}.pdf`;
  return MULTI_IMAGE_PDF_NAME;
}
