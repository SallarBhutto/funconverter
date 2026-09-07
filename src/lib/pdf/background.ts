/**
 * How the page canvas is prepared before PDF.js draws onto it.
 *
 * "white" matches PDF.js's own default (it paints rgb(255,255,255) behind
 * every page) and the PDF imaging model, where a page is opaque paper.
 * "transparent" leaves unpainted areas clear; it exists so a future option
 * can offer it deliberately, not because PDF pages are transparent.
 */
export type CanvasBackground = "white" | "transparent";

export interface CanvasBackgroundPlan {
  /** Whether the 2D context needs an alpha channel. */
  contextAlpha: boolean;
  /** Fill applied to the whole canvas before rendering, or null for none. */
  fillStyle: string | null;
  /** Value passed to PDF.js's `background` render parameter. */
  pdfjsBackground: string;
}

export function planCanvasBackground(background: CanvasBackground): CanvasBackgroundPlan {
  if (background === "transparent") {
    return { contextAlpha: true, fillStyle: null, pdfjsBackground: "rgba(0,0,0,0)" };
  }
  return { contextAlpha: false, fillStyle: "#ffffff", pdfjsBackground: "rgb(255,255,255)" };
}
