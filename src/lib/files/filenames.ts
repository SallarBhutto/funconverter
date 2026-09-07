const MAX_STEM_LENGTH = 80;
const DEFAULT_STEM = "document";

/** Characters that are unsafe in filenames on common filesystems, plus control characters. */
const UNSAFE_CHARACTERS = /[\\/:*?"<>|\x00-\x1f]+/g;

/**
 * Derives a filesystem-safe stem from an uploaded filename. The final
 * extension is removed, unsafe characters become hyphens, whitespace is
 * collapsed, and degenerate results fall back to `fallback`.
 *
 * "annual report.final.pdf" → "annual report.final"
 */
export function deriveFileStem(filename: string, fallback = DEFAULT_STEM): string {
  const withoutExtension = filename.trim().replace(/\.[^.]+$/, "");

  const cleaned = withoutExtension
    .replace(UNSAFE_CHARACTERS, "-")
    .replace(/\s+/g, " ")
    .replace(/-{2,}/g, "-")
    .replace(/^[\s.-]+|[\s.-]+$/g, "")
    .slice(0, MAX_STEM_LENGTH)
    .replace(/[\s.-]+$/, "");

  return cleaned.length > 0 ? cleaned : fallback;
}

/** ("report", 3, "jpg") → "report-page-3.jpg" */
export function buildPageImageFilename(
  stem: string,
  pageNumber: number,
  extension: string,
): string {
  return `${stem}-page-${pageNumber}.${extension}`;
}

/** ("report", "jpg") → "report-jpg.zip" */
export function buildArchiveFilename(stem: string, extension: string): string {
  return `${stem}-${extension}.zip`;
}
