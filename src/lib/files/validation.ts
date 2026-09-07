export type FileValidation =
  | { ok: true }
  | { ok: false; reason: "empty" | "wrong-format"; message: string };

/** @deprecated alias kept for the PDF tools' existing imports. */
export type PdfFileValidation = FileValidation;

const PDF_MIME_TYPES = new Set(["application/pdf", "application/x-pdf"]);

function extensionOf(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name.trim());
  return match ? match[1].toLowerCase() : "";
}

/**
 * Cheap pre-check before handing a file to PDF.js. It rejects obviously wrong
 * files but deliberately trusts a `.pdf` extension when the browser reports
 * no MIME type or a generic one, because PDF.js performs the real validation
 * when it parses the document.
 */
export function validatePdfFile(file: Pick<File, "name" | "type" | "size">): FileValidation {
  if (file.size === 0) {
    return { ok: false, reason: "empty", message: "This file is empty." };
  }

  const mime = file.type.trim().toLowerCase();
  if (PDF_MIME_TYPES.has(mime)) return { ok: true };
  if (extensionOf(file.name) === "pdf") return { ok: true };

  return { ok: false, reason: "wrong-format", message: "Please choose a PDF file." };
}

export interface ImageFormatRule {
  /** Accepted MIME types, lower-case. */
  mimeTypes: readonly string[];
  /** Accepted extensions without the dot, lower-case. */
  extensions: readonly string[];
  /** Human label used in the rejection message, e.g. "PNG". */
  label: string;
}

/**
 * Pre-check for image inputs. A matching MIME type is accepted outright; a
 * matching extension is accepted when the MIME type is missing or generic.
 * The browser's decoder performs the real validation afterwards.
 */
export function validateImageFile(
  file: Pick<File, "name" | "type" | "size">,
  rule: ImageFormatRule,
): FileValidation {
  if (file.size === 0) {
    return { ok: false, reason: "empty", message: `${file.name} is empty.` };
  }

  const mime = file.type.trim().toLowerCase();
  if (rule.mimeTypes.includes(mime)) return { ok: true };

  const genericMime = mime === "" || mime === "application/octet-stream";
  if (genericMime && rule.extensions.includes(extensionOf(file.name))) return { ok: true };

  return {
    ok: false,
    reason: "wrong-format",
    message: `${file.name} is not a ${rule.label} image.`,
  };
}
