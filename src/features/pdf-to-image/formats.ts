import type { CanvasBackground } from "@/lib/pdf/background";
import type { RasterFormat } from "@/lib/pdf/types";

export type RasterOutputFormat = "jpeg" | "png" | "webp";

export type QualityPreset = "smaller" | "balanced" | "best";

export interface QualityPresetDefinition {
  id: QualityPreset;
  label: string;
  description: string;
  /** Encoder quality passed to canvas.toBlob, in [0, 1]. */
  quality: number;
}

/**
 * Everything that differs between the PDF-to-image tools. The renderer,
 * page loop, session handling, downloads, and UI are shared; only these
 * values change per format.
 */
export interface RasterFormatConfig {
  id: RasterOutputFormat;
  /** Short label used in UI copy and headings: "JPG", "PNG", "WebP". */
  label: string;
  mimeType: RasterFormat;
  /** File extension without the dot. Also used in the ZIP name. */
  extension: string;
  /** Lossy formats expose three presets. Lossless formats have none. */
  qualityPresets: readonly QualityPresetDefinition[] | null;
  defaultPreset: QualityPreset | null;
  /**
   * Page background. PDF pages are opaque paper: PDF.js itself paints white
   * behind every page by default, and content rarely paints its own
   * background, so a transparent PNG would show black text on nothing.
   * All formats therefore render on white. See docs/architecture.md.
   */
  background: CanvasBackground;
}

interface LossyQualities {
  smaller: number;
  balanced: number;
  best: number;
}

/** Shared copy for the three lossy presets; only the encoder values differ per format. */
function lossyPresets(qualities: LossyQualities): readonly QualityPresetDefinition[] {
  return [
    {
      id: "smaller",
      label: "Smaller File",
      description: "Noticeably smaller files. Fine for sharing, previews, and email.",
      quality: qualities.smaller,
    },
    {
      id: "balanced",
      label: "Balanced",
      description: "Sharp images at a sensible size. The right choice for most documents.",
      quality: qualities.balanced,
    },
    {
      id: "best",
      label: "Best Quality",
      description: "Maximum detail with larger files. Use for print or fine artwork.",
      quality: qualities.best,
    },
  ];
}

export const RASTER_FORMATS: Record<RasterOutputFormat, RasterFormatConfig> = {
  jpeg: {
    id: "jpeg",
    label: "JPG",
    mimeType: "image/jpeg",
    extension: "jpg",
    qualityPresets: lossyPresets({ smaller: 0.6, balanced: 0.8, best: 0.92 }),
    defaultPreset: "balanced",
    background: "white",
  },
  png: {
    id: "png",
    label: "PNG",
    mimeType: "image/png",
    extension: "png",
    // PNG is lossless; canvas.toBlob ignores any quality argument.
    qualityPresets: null,
    defaultPreset: null,
    background: "white",
  },
  webp: {
    id: "webp",
    label: "WebP",
    mimeType: "image/webp",
    extension: "webp",
    // WebP's scale is calibrated differently from JPEG: 75 is libwebp's own
    // default and reads as "balanced", 90 is close to visually lossless, and
    // 55 is still clean for documents while clearly smaller.
    qualityPresets: lossyPresets({ smaller: 0.55, balanced: 0.75, best: 0.9 }),
    defaultPreset: "balanced",
    background: "white",
  },
};

export function isRasterOutputFormat(value: string): value is RasterOutputFormat {
  return value in RASTER_FORMATS;
}

export function getRasterFormat(id: RasterOutputFormat): RasterFormatConfig {
  return RASTER_FORMATS[id];
}

export function isQualityPreset(value: string): value is QualityPreset {
  return value === "smaller" || value === "balanced" || value === "best";
}

export function getQualityPreset(
  format: RasterFormatConfig,
  preset: QualityPreset,
): QualityPresetDefinition {
  const definition = format.qualityPresets?.find((candidate) => candidate.id === preset);
  if (!definition) {
    throw new Error(`${format.label} has no "${preset}" quality preset`);
  }
  return definition;
}

/** Encoder quality for a preset, or undefined for formats without presets. */
export function getPresetQuality(
  format: RasterFormatConfig,
  preset: QualityPreset,
): number | undefined {
  if (!format.qualityPresets) return undefined;
  return getQualityPreset(format, preset).quality;
}
