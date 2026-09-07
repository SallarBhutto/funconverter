import type { PdfErrorCode } from "@/lib/pdf/errors";

import type { ConversionProgress } from "./progress";

/** The accepted input file plus the derived output stem. */
export interface SelectedPdf {
  file: File;
  name: string;
  size: number;
  /** Filesystem-safe base name used for every generated file. */
  stem: string;
}

/** Full-size JPEG kept for the individual download and the ZIP. */
export interface DownloadableImage {
  blob: Blob;
  /** Object URL for the download link. Revoked with the result. */
  objectUrl: string;
  filename: string;
  size: number;
}

/** Small JPEG used only for on-screen display. */
export interface PreviewImage {
  /** Object URL for the preview <img>. Revoked with the result. */
  objectUrl: string;
  width: number;
  height: number;
}

/** One converted page. Owns two object URLs that must be revoked together. */
export interface PageResult {
  id: string;
  pageNumber: number;
  /** Full-size image dimensions in pixels. */
  width: number;
  height: number;
  download: DownloadableImage;
  preview: PreviewImage;
}

export type ConverterState =
  | { status: "idle" }
  | { status: "loading-document"; file: SelectedPdf }
  | { status: "ready"; file: SelectedPdf; pageCount: number }
  | {
      status: "converting";
      file: SelectedPdf;
      pageCount: number;
      progress: ConversionProgress;
      results: readonly PageResult[];
    }
  | {
      status: "complete";
      file: SelectedPdf;
      pageCount: number;
      results: readonly PageResult[];
    }
  | {
      status: "error";
      /** Null when the file was rejected before it was accepted. */
      file: SelectedPdf | null;
      /** Non-null when the document is still open and conversion can be retried. */
      pageCount: number | null;
      code: PdfErrorCode;
      message: string;
    };

export type ArchiveStatus = "idle" | "building" | "error";
