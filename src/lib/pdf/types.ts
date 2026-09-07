import type { CanvasBackground } from "./background";

/** Raster formats the shared renderer can encode. */
export type RasterFormat = "image/jpeg" | "image/png" | "image/webp";

export interface PreviewOptions {
  /**
   * Small canvas owned by the caller and reused across pages. It is resized
   * per page and never holds more than `maxSide × maxSide` pixels.
   */
  canvas: HTMLCanvasElement;
  /** Longest side of the preview in pixels. */
  maxSide: number;
  /** JPEG quality for the preview in [0, 1]. Previews are always JPEG. */
  quality: number;
}

export interface RenderPageOptions {
  format: RasterFormat;
  /** Encoder quality in [0, 1]; ignored by lossless formats. */
  quality?: number;
  /** Page background. Defaults to "white"; see background.ts. */
  background?: CanvasBackground;
  /** Rendering density relative to the PDF's 72 pt/inch. Defaults to 150. */
  targetDpi?: number;
  /** When set, a downscaled JPEG preview is produced from the same render. */
  preview?: PreviewOptions;
  signal?: AbortSignal;
}

export interface RenderedPreview {
  /** Preview dimensions in pixels. */
  width: number;
  height: number;
  blob: Blob;
}

export interface RenderedPage {
  pageNumber: number;
  /** Full-size output image dimensions in pixels. */
  width: number;
  height: number;
  /** Full-size encoded image, intended for download. */
  blob: Blob;
  /** Present when `RenderPageOptions.preview` was supplied. */
  preview: RenderedPreview | null;
}
