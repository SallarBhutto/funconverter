import type { SelectedImage } from "@/lib/image/selected-image";

import type { PageSettings } from "./layout";

export type { SelectedImage };

/** The finished PDF. Owns one object URL. */
export interface GeneratedPdf {
  blob: Blob;
  objectUrl: string;
  filename: string;
  size: number;
  pageCount: number;
}

export interface GenerationProgress {
  current: number;
  total: number;
}

export type ConverterPhase = "idle" | "ready" | "generating" | "complete" | "error";

export interface ImageToPdfState {
  phase: ConverterPhase;
  images: readonly SelectedImage[];
  settings: PageSettings;
  /** Number of files still being decoded after a selection. */
  pendingCount: number;
  /** Messages for files that were skipped during selection. */
  notices: readonly string[];
  progress: GenerationProgress | null;
  result: GeneratedPdf | null;
  error: string | null;
}
