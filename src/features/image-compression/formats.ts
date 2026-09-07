import type { ImageFormatRule } from "@/lib/files/validation";

export type CompressibleFormat = "jpeg" | "png" | "webp";

export type QualityPreset = "smaller" | "balanced" | "best";

export interface QualityPresetDefinition {
  id: QualityPreset;
  label: string;
  description: string;
  /** Encoder quality passed to canvas.toBlob, in [0, 1]. */
  quality: number;
}

/**
 * How a format is compressed.
 *
 * - "canvas-jpeg": decode with orientation applied, draw to an opaque canvas,
 *   re-encode as JPEG at the preset quality. Metadata is not carried over.
 * - "canvas-webp": same through an alpha canvas, re-encoded as WebP. The
 *   encoder must actually produce WebP; a PNG fallback is rejected.
 * - "oxipng": lossless PNG optimisation of the original bytes with OxiPNG in
 *   WebAssembly. Pixels and transparency are untouched by construction.
 */
export type CompressionEncoder = "canvas-jpeg" | "canvas-webp" | "oxipng";

export interface CompressibleFormatConfig extends ImageFormatRule {
  id: CompressibleFormat;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  /** File extension without the dot, used for output and ZIP names. */
  extension: string;
  /** Value for the file input's `accept` attribute. */
  accept: string;
  encoder: CompressionEncoder;
  /** Whether the output keeps an alpha channel. */
  preservesTransparency: boolean;
  /** Lossy formats expose three presets; lossless PNG has none. */
  qualityPresets: readonly QualityPresetDefinition[] | null;
  defaultPreset: QualityPreset | null;
}

interface LossyQualities {
  smaller: number;
  balanced: number;
  best: number;
}

function lossyPresets(qualities: LossyQualities): readonly QualityPresetDefinition[] {
  return [
    {
      id: "smaller",
      label: "Smaller File",
      description: "The biggest savings. Fine for sharing, messaging, and web thumbnails.",
      quality: qualities.smaller,
    },
    {
      id: "balanced",
      label: "Balanced",
      description: "Clearly smaller files with detail that still looks right on screen.",
      quality: qualities.balanced,
    },
    {
      id: "best",
      label: "Best Quality",
      description: "Gentle compression that keeps fine detail. Savings are smaller.",
      quality: qualities.best,
    },
  ];
}

export const COMPRESSIBLE_FORMATS: Record<CompressibleFormat, CompressibleFormatConfig> = {
  jpeg: {
    id: "jpeg",
    label: "JPG",
    mimeType: "image/jpeg",
    extension: "jpg",
    mimeTypes: ["image/jpeg", "image/pjpeg"],
    extensions: ["jpg", "jpeg"],
    accept: "image/jpeg,.jpg,.jpeg",
    encoder: "canvas-jpeg",
    preservesTransparency: false,
    // Lower than the PDF-to-JPG presets on purpose: the input is already a
    // JPEG, so re-encoding near 0.9 rarely saves anything worth downloading.
    qualityPresets: lossyPresets({ smaller: 0.55, balanced: 0.72, best: 0.85 }),
    defaultPreset: "balanced",
  },
  png: {
    id: "png",
    label: "PNG",
    mimeType: "image/png",
    extension: "png",
    mimeTypes: ["image/png"],
    extensions: ["png"],
    accept: "image/png,.png",
    encoder: "oxipng",
    preservesTransparency: true,
    // Lossless: there is no quality to trade, so no presets are shown.
    qualityPresets: null,
    defaultPreset: null,
  },
  webp: {
    id: "webp",
    label: "WebP",
    mimeType: "image/webp",
    extension: "webp",
    mimeTypes: ["image/webp"],
    extensions: ["webp"],
    accept: "image/webp,.webp",
    encoder: "canvas-webp",
    preservesTransparency: true,
    // WebP's scale sits lower than JPEG's for similar appearance.
    qualityPresets: lossyPresets({ smaller: 0.5, balanced: 0.7, best: 0.85 }),
    defaultPreset: "balanced",
  },
};

/** OxiPNG effort level: 2 is the codec's default and a sensible speed trade-off. */
export const OXIPNG_LEVEL = 2;

export function getCompressibleFormat(id: CompressibleFormat): CompressibleFormatConfig {
  return COMPRESSIBLE_FORMATS[id];
}

export function isQualityPreset(value: string): value is QualityPreset {
  return value === "smaller" || value === "balanced" || value === "best";
}

/** Encoder quality for a preset, or undefined for formats without presets. */
export function getPresetQuality(
  format: CompressibleFormatConfig,
  preset: QualityPreset,
): number | undefined {
  return format.qualityPresets?.find((candidate) => candidate.id === preset)?.quality;
}

/**
 * True when the encoder produced the format that was requested. Browsers
 * fall back to PNG silently for encoders they lack, so a mismatch means the
 * result must not be presented under the requested name.
 */
export function isExpectedEncoding(blob: Pick<Blob, "type">, expected: string): boolean {
  return blob.type.toLowerCase() === expected.toLowerCase();
}
