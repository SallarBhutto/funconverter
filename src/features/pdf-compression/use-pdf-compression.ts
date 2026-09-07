"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { validatePdfFile } from "@/lib/files/validation";
import { toPdfProcessingError } from "@/lib/pdf/errors";
import { openPdfDocument, type PdfDocument } from "@/lib/pdf/loader";

import { compressPdf } from "./compress-pdf";
import { buildCompressedPdfFilename } from "./filenames";
import {
  DEFAULT_PDF_COMPRESSION_MODE,
  getPdfCompressionMode,
  type PdfCompressionMode,
} from "./modes";
import type { CompressedPdfResult, CompressorState, SelectedPdf } from "./types";

/**
 * Everything that belongs to one selected file. Disposing a session aborts
 * any work, destroys the PDF.js document, and revokes the result URL, so
 * there is exactly one cleanup path for replacement, reset, and unmount.
 */
interface Session {
  file: SelectedPdf;
  lifetime: AbortController;
  document: PdfDocument | null;
  result: CompressedPdfResult | null;
  /** Controller for the compression currently running, if any. */
  run: AbortController | null;
}

function toSelectedPdf(file: File): SelectedPdf {
  return { file, name: file.name, size: file.size };
}

function revokeResult(session: Session): void {
  if (session.result) URL.revokeObjectURL(session.result.objectUrl);
  session.result = null;
}

function disposeSession(session: Session | null): void {
  if (!session) return;
  session.run?.abort();
  session.run = null;
  session.lifetime.abort();
  revokeResult(session);
  void session.document?.destroy();
  session.document = null;
}

export function usePdfCompression() {
  const [state, setState] = useState<CompressorState>({ status: "idle" });
  const [mode, setMode] = useState<PdfCompressionMode>(DEFAULT_PDF_COMPRESSION_MODE);
  const sessionRef = useRef<Session | null>(null);

  const replaceSession = useCallback((next: Session | null) => {
    disposeSession(sessionRef.current);
    sessionRef.current = next;
  }, []);

  useEffect(() => {
    return () => {
      disposeSession(sessionRef.current);
      sessionRef.current = null;
    };
  }, []);

  const selectFile = useCallback(
    async (file: File) => {
      const validation = validatePdfFile(file);
      if (!validation.ok) {
        replaceSession(null);
        setState({
          status: "error",
          file: null,
          pageCount: null,
          code: "invalid",
          message: validation.message,
        });
        return;
      }

      const session: Session = {
        file: toSelectedPdf(file),
        lifetime: new AbortController(),
        document: null,
        result: null,
        run: null,
      };
      replaceSession(session);
      setState({ status: "loading-document", file: session.file });

      try {
        // Opening with PDF.js validates the file, rejects encrypted documents,
        // and yields the page count; Maximum mode renders through it later.
        const pdf = await openPdfDocument(file, session.lifetime.signal);
        if (sessionRef.current !== session) {
          void pdf.destroy();
          return;
        }
        session.document = pdf;
        setState({ status: "ready", file: session.file, pageCount: pdf.pageCount });
      } catch (error) {
        if (sessionRef.current !== session) return;
        const failure = toPdfProcessingError(error);
        if (failure.code === "cancelled") return;
        setState({
          status: "error",
          file: session.file,
          pageCount: null,
          code: failure.code,
          message: failure.message,
        });
      }
    },
    [replaceSession],
  );

  const compress = useCallback(async () => {
    const session = sessionRef.current;
    const pdf = session?.document;
    if (!session || !pdf || session.run) return;

    revokeResult(session);
    const run = new AbortController();
    session.run = run;
    const config = getPdfCompressionMode(mode);
    const pageCount = pdf.pageCount;
    const isCurrent = () =>
      sessionRef.current === session && session.run === run && !run.signal.aborted;

    setState({
      status: "compressing",
      file: session.file,
      pageCount,
      mode: config.id,
      progress: null,
    });

    try {
      const compressed = await compressPdf(session.file.file, {
        mode: config,
        document: pdf,
        signal: run.signal,
        onProgress: (progress) => {
          if (!isCurrent()) return;
          setState((previous) =>
            previous.status === "compressing" ? { ...previous, progress } : previous,
          );
        },
      });
      if (!isCurrent()) return;
      session.run = null;
      session.result = {
        ...compressed,
        objectUrl: URL.createObjectURL(compressed.blob),
        filename: buildCompressedPdfFilename(session.file.name),
        mode: config.id,
      };
      setState({ status: "complete", file: session.file, pageCount, result: session.result });
    } catch (error) {
      if (!isCurrent()) return;
      session.run = null;
      const failure = toPdfProcessingError(error);
      setState({
        status: "error",
        file: session.file,
        pageCount,
        code: failure.code,
        message: failure.message,
      });
    }
  }, [mode]);

  const cancel = useCallback(() => {
    const session = sessionRef.current;
    if (!session?.run) return;
    session.run.abort();
    session.run = null;
    setState(
      session.document
        ? { status: "ready", file: session.file, pageCount: session.document.pageCount }
        : { status: "idle" },
    );
  }, []);

  const reset = useCallback(() => {
    replaceSession(null);
    setState({ status: "idle" });
  }, [replaceSession]);

  const selectMode = useCallback((next: PdfCompressionMode) => {
    setMode(next);
    // A finished result belongs to the mode it was made with; changing the
    // mode returns to ready so the user compresses again deliberately.
    const session = sessionRef.current;
    if (session?.result && session.document) {
      revokeResult(session);
      setState({ status: "ready", file: session.file, pageCount: session.document.pageCount });
    }
  }, []);

  return { state, mode, selectMode, selectFile, compress, cancel, reset } as const;
}
