export type PdfCompressionMode = "preserve" | "balanced" | "maximum";

/** Which document features a mode keeps. All false for the rasterising mode. */
export interface PreservedFeatures {
  selectableText: boolean;
  vectorGraphics: boolean;
  links: boolean;
  formsAndAnnotations: boolean;
}

export interface QpdfModeOptions {
  /** Adds qpdf's --optimize-images, which re-encodes suitable images as JPEG. */
  optimizeImages: boolean;
}

export interface RasterModeOptions {
  /** Render density for page images, relative to 72 pt/inch. */
  targetDpi: number;
  /** JPEG quality for page images, in [0, 1]. */
  jpegQuality: number;
}

export interface PdfCompressionModeConfig {
  id: PdfCompressionMode;
  label: string;
  /** One-line summary shown in the selector. */
  description: string;
  /** Longer explanation for the tool page. */
  explanation: string;
  /** Shown near the selector when the mode is chosen. */
  caution?: string;
  engine: "qpdf" | "raster";
  qpdf?: QpdfModeOptions;
  raster?: RasterModeOptions;
  preserves: PreservedFeatures;
}

const KEEPS_EVERYTHING: PreservedFeatures = {
  selectableText: true,
  vectorGraphics: true,
  links: true,
  formsAndAnnotations: true,
};

const KEEPS_NOTHING: PreservedFeatures = {
  selectableText: false,
  vectorGraphics: false,
  links: false,
  formsAndAnnotations: false,
};

/**
 * Rendering settings for Maximum mode: deliberately below the PDF → JPG
 * download tool (150 DPI, quality 0.8). 130 DPI keeps 10 pt body text
 * readable at normal zoom; quality 0.7 is where JPEG artefacts on text
 * start to become visible, so it is the floor rather than a midpoint.
 */
export const MAXIMUM_RASTER_OPTIONS: RasterModeOptions = { targetDpi: 130, jpegQuality: 0.7 };

export const PDF_COMPRESSION_MODES: Record<PdfCompressionMode, PdfCompressionModeConfig> = {
  preserve: {
    id: "preserve",
    label: "Preserve",
    description: "Keep text, links and document structure. Smaller savings.",
    explanation:
      "Rewrites the PDF with qpdf's lossless optimisations: streams are recompressed with maximum deflate, object streams are generated, and unused data is dropped. Nothing visible changes and every feature of the document survives.",
    engine: "qpdf",
    qpdf: { optimizeImages: false },
    preserves: KEEPS_EVERYTHING,
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    description: "Keep document structure while recompressing suitable images.",
    explanation:
      "Everything Preserve does, plus qpdf's image optimisation: embedded images may be recompressed to reduce file size, using JPEG where that is smaller. Text stays selectable and links, forms and vector graphics are untouched because the pages themselves are not rasterised.",
    engine: "qpdf",
    qpdf: { optimizeImages: true },
    preserves: KEEPS_EVERYTHING,
  },
  maximum: {
    id: "maximum",
    label: "Maximum",
    description: "Smallest files. Pages are flattened into images.",
    explanation:
      "Each page is rendered with PDF.js at 130 DPI, encoded as a JPEG and placed on a new page of the same size and orientation. This produces much smaller files for scans and image-heavy documents, at the cost of everything that is not pixels.",
    caution:
      "Maximum compression converts pages to images, so text selection, links and forms may be lost.",
    engine: "raster",
    raster: MAXIMUM_RASTER_OPTIONS,
    preserves: KEEPS_NOTHING,
  },
};

export const DEFAULT_PDF_COMPRESSION_MODE: PdfCompressionMode = "balanced";

export const PDF_COMPRESSION_MODE_ORDER: readonly PdfCompressionMode[] = [
  "preserve",
  "balanced",
  "maximum",
];

export function getPdfCompressionMode(id: PdfCompressionMode): PdfCompressionModeConfig {
  return PDF_COMPRESSION_MODES[id];
}

export function isPdfCompressionMode(value: string): value is PdfCompressionMode {
  return value in PDF_COMPRESSION_MODES;
}
