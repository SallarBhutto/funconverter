export type PdfErrorCode =
  | "invalid"
  | "password"
  | "render"
  | "resources"
  | "unsupported"
  | "cancelled"
  | "unknown";

const MESSAGES: Record<PdfErrorCode, string> = {
  invalid: "This PDF could not be opened. It may be damaged or not a PDF file.",
  password:
    "This PDF appears to be password-protected. Remove the password and try again.",
  render: "We couldn't render one of the PDF pages.",
  resources:
    "Your browser ran out of resources while processing this file. Try a smaller PDF or close other tabs.",
  unsupported:
    "Your browser can't create images in this format. Try a current version of Chrome, Firefox, Safari, or Edge.",
  cancelled: "Conversion was cancelled.",
  unknown: "Something went wrong while processing this PDF.",
};

/** Product-level error with a user-safe message and a stable code. */
export class PdfProcessingError extends Error {
  readonly code: PdfErrorCode;

  constructor(code: PdfErrorCode, cause?: unknown) {
    super(MESSAGES[code], { cause });
    this.name = "PdfProcessingError";
    this.code = code;
  }
}

export function pdfErrorMessage(code: PdfErrorCode): string {
  return MESSAGES[code];
}

function errorName(error: unknown): string {
  return typeof error === "object" && error !== null && "name" in error
    ? String((error as { name: unknown }).name)
    : "";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "");
}

/**
 * Maps PDF.js and browser errors onto product errors. PDF.js exceptions are
 * matched by their `name` so this module never imports the library itself.
 */
export function toPdfProcessingError(error: unknown): PdfProcessingError {
  if (error instanceof PdfProcessingError) return error;

  const name = errorName(error);
  if (
    name === "AbortError" ||
    name === "AbortException" ||
    name === "RenderingCancelledException"
  ) {
    return new PdfProcessingError("cancelled", error);
  }
  if (name === "PasswordException") return new PdfProcessingError("password", error);
  if (
    name === "InvalidPDFException" ||
    name === "ResponseException" ||
    name === "FormatError"
  ) {
    return new PdfProcessingError("invalid", error);
  }

  const message = errorMessage(error).toLowerCase();
  if (
    name === "RangeError" ||
    message.includes("out of memory") ||
    message.includes("allocation failed") ||
    message.includes("too large")
  ) {
    return new PdfProcessingError("resources", error);
  }

  return new PdfProcessingError("unknown", error);
}

export function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw new PdfProcessingError("cancelled");
}
