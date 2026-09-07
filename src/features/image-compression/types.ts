import type { SelectedImage } from "@/lib/image/selected-image";

import type { QualityPreset } from "./formats";
import type { Savings } from "./savings";

export type { SelectedImage };

/** The delivered file for one image: either the re-encoded Blob or the original. */
export interface CompressionResult extends Savings {
  imageId: string;
  blob: Blob;
  /** Object URL for the download link. Revoked with the result. */
  objectUrl: string;
  filename: string;
}

export interface CompressionProgress {
  current: number;
  total: number;
}

export type CompressorPhase = "idle" | "ready" | "compressing" | "complete" | "error";

export interface ImageCompressionState {
  phase: CompressorPhase;
  images: readonly SelectedImage[];
  /** Results keyed by image id; empty until a run completes for that image. */
  results: Readonly<Record<string, CompressionResult>>;
  preset: QualityPreset;
  /** Number of files still being decoded after a selection. */
  pendingCount: number;
  /** Messages for files that were skipped during selection. */
  notices: readonly string[];
  progress: CompressionProgress | null;
  error: string | null;
}

export type ArchiveStatus = "idle" | "building" | "error";
