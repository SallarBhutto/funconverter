import type { QpdfModeOptions } from "./modes";

/**
 * Lossless rewrite shared by every qpdf mode:
 * recompress all streams with maximum deflate and pack objects into object
 * streams. Equivalent to the `--compress` preset plus the extras qpdf's
 * documentation recommends for smallest lossless output.
 */
export const QPDF_BASE_ARGS: readonly string[] = [
  "--compress-streams=y",
  "--decode-level=generalized",
  "--recompress-flate",
  "--compression-level=9",
  "--object-streams=generate",
];

/**
 * Re-encodes suitable embedded images as JPEG when that makes them smaller.
 * qpdf 11's WebAssembly build has no --jpeg-quality option; it uses its
 * built-in libjpeg default, and skips images that would not shrink.
 */
export const QPDF_IMAGE_ARGS: readonly string[] = ["--optimize-images"];

export const QPDF_INPUT_NAME = "input.pdf";
export const QPDF_OUTPUT_NAME = "output.pdf";

/** Builds the full qpdf command line for a mode. Filenames follow the `--` separator. */
export function buildQpdfArgs(
  options: QpdfModeOptions,
  inputName = QPDF_INPUT_NAME,
  outputName = QPDF_OUTPUT_NAME,
): string[] {
  return [
    ...QPDF_BASE_ARGS,
    ...(options.optimizeImages ? QPDF_IMAGE_ARGS : []),
    "--",
    inputName,
    outputName,
  ];
}
