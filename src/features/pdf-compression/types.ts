import type { Savings } from "@/lib/files/savings";
import type { PdfErrorCode } from "@/lib/pdf/errors";

import type { PdfCompressionMode } from "./modes";

/** The accepted input file. */
export interface SelectedPdf {
  file: File;
  name: string;
  size: number;
}

/** Page progress for the rasterising mode; qpdf modes report no page progress. */
export interface CompressionProgress {
  currentPage: number;
  totalPages: number;
}

/** The delivered PDF: re-encoded bytes, or the original when that was smaller. Owns one object URL. */
export interface CompressedPdfResult extends Savings {
  blob: Blob;
  objectUrl: string;
  filename: string;
  mode: PdfCompressionMode;
}

export type CompressorState =
  | { status: "idle" }
  | { status: "loading-document"; file: SelectedPdf }
  | { status: "ready"; file: SelectedPdf; pageCount: number }
  | {
      status: "compressing";
      file: SelectedPdf;
      pageCount: number;
      mode: PdfCompressionMode;
      /** Null while a qpdf command runs; qpdf exposes no page progress. */
      progress: CompressionProgress | null;
    }
  | { status: "complete"; file: SelectedPdf; pageCount: number; result: CompressedPdfResult }
  | {
      status: "error";
      /** Null when the file was rejected before it was accepted. */
      file: SelectedPdf | null;
      /** Non-null when the document is still open and compression can be retried. */
      pageCount: number | null;
      code: PdfErrorCode;
      message: string;
    };
