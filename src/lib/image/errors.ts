export type ImageErrorCode =
  | "wrong-format"
  | "unreadable"
  | "unsupported"
  | "resources"
  | "cancelled"
  | "unknown";

const MESSAGES: Record<ImageErrorCode, string> = {
  "wrong-format": "This file is not in the expected image format.",
  unreadable: "This image could not be read. It may be damaged or not a real image file.",
  unsupported: "Your browser can't decode this image. Try a current version of Chrome, Firefox, Safari, or Edge.",
  resources:
    "Your browser ran out of resources while processing this image. Try fewer or smaller images, or close other tabs.",
  cancelled: "PDF creation was cancelled.",
  unknown: "Something went wrong while processing this image.",
};

/** Product-level error with a user-safe message and a stable code. */
export class ImageProcessingError extends Error {
  readonly code: ImageErrorCode;

  constructor(code: ImageErrorCode, message = MESSAGES[code], cause?: unknown) {
    super(message, { cause });
    this.name = "ImageProcessingError";
    this.code = code;
  }
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
 * Maps browser decoding and canvas errors onto product errors. Decoding
 * failures surface as InvalidStateError from createImageBitmap; memory
 * failures as RangeError or allocation messages.
 */
export function toImageProcessingError(error: unknown): ImageProcessingError {
  if (error instanceof ImageProcessingError) return error;

  const name = errorName(error);
  if (name === "AbortError") return new ImageProcessingError("cancelled", undefined, error);
  if (name === "InvalidStateError" || name === "EncodingError") {
    return new ImageProcessingError("unreadable", undefined, error);
  }

  const message = errorMessage(error).toLowerCase();
  if (
    name === "RangeError" ||
    message.includes("out of memory") ||
    message.includes("allocation failed") ||
    message.includes("too large")
  ) {
    return new ImageProcessingError("resources", undefined, error);
  }

  return new ImageProcessingError("unknown", undefined, error);
}

export function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw new ImageProcessingError("cancelled");
}
