/** PDF user space is 72 points per inch. */
const PDF_POINTS_PER_INCH = 72;

/** Default output density: crisp for screens and ordinary printing without huge files. */
export const DEFAULT_TARGET_DPI = 150;

/**
 * Maximum rendered pixels per page as an AREA: 16,777,216 px, the same as a
 * 4096 × 4096 square, but any shape is allowed as long as width × height
 * stays under it. Keeps a page's RGBA backing store at or below 64 MB and
 * inside the canvas limits of mobile Safari.
 */
export const MAX_CANVAS_PIXELS = 4096 * 4096;

/** Maximum length of either canvas side, independent of the area cap. */
export const MAX_CANVAS_SIDE = 8192;

export interface CanvasLimits {
  maxPixels: number;
  maxSide: number;
}

export const DEFAULT_CANVAS_LIMITS: CanvasLimits = {
  maxPixels: MAX_CANVAS_PIXELS,
  maxSide: MAX_CANVAS_SIDE,
};

export interface RenderDimensions {
  /** Scale to pass to PDF.js's getViewport. */
  scale: number;
  width: number;
  height: number;
}

/**
 * Chooses a render scale for a page measured in PDF points.
 *
 * 1. Start at `targetDpi / 72`.
 * 2. If width × height at that scale exceeds `maxPixels`, shrink the scale by
 *    sqrt(maxPixels / area) so the output lands exactly on the area cap.
 * 3. If the longer side still exceeds `maxSide`, shrink the scale again so
 *    that side lands exactly on the side cap.
 * 4. Floor both dimensions, never below 1 px.
 *
 * Both steps only ever reduce the scale uniformly, so aspect ratio is
 * preserved and ordinary pages (Letter, A4) are left at the target density.
 * Device pixel ratio is deliberately ignored: the output is a file.
 */
export function computeRenderDimensions(
  pointWidth: number,
  pointHeight: number,
  targetDpi = DEFAULT_TARGET_DPI,
  limits: CanvasLimits = DEFAULT_CANVAS_LIMITS,
): RenderDimensions {
  const safeWidth = Math.max(1, pointWidth);
  const safeHeight = Math.max(1, pointHeight);
  let scale = targetDpi / PDF_POINTS_PER_INCH;

  const area = safeWidth * safeHeight * scale * scale;
  if (area > limits.maxPixels) {
    scale = Math.sqrt(limits.maxPixels / (safeWidth * safeHeight));
  }

  const longerSide = Math.max(safeWidth, safeHeight);
  if (longerSide * scale > limits.maxSide) {
    scale = limits.maxSide / longerSide;
  }

  return {
    scale,
    width: Math.max(1, floorPixels(safeWidth * scale)),
    height: Math.max(1, floorPixels(safeHeight * scale)),
  };
}

/**
 * Floor that tolerates floating-point noise, so a side computed as exactly
 * the cap (e.g. 8191.9999999) still lands on the cap rather than one pixel
 * under it. The tolerance is far below one pixel, so limits are never exceeded.
 */
function floorPixels(value: number): number {
  return Math.floor(value + 1e-6);
}

export interface PreviewDimensions {
  width: number;
  height: number;
}

/**
 * Fits an image inside a square of `maxSide` pixels, preserving aspect ratio.
 * Images already within the square are returned unchanged; the result is
 * never upscaled.
 */
export function computePreviewDimensions(
  width: number,
  height: number,
  maxSide: number,
): PreviewDimensions {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const longerSide = Math.max(safeWidth, safeHeight);
  if (longerSide <= maxSide) return { width: safeWidth, height: safeHeight };

  const ratio = maxSide / longerSide;
  return {
    width: Math.max(1, Math.round(safeWidth * ratio)),
    height: Math.max(1, Math.round(safeHeight * ratio)),
  };
}
