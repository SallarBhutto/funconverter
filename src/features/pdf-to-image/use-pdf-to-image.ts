"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { downloadBlob } from "@/lib/files/download";
import { buildArchiveFilename, deriveFileStem } from "@/lib/files/filenames";
import { validatePdfFile } from "@/lib/files/validation";
import { toPdfProcessingError } from "@/lib/pdf/errors";
import { openPdfDocument, type PdfDocument } from "@/lib/pdf/loader";

import { convertPdfToImages } from "./convert-pdf-to-images";
import { buildImageArchive } from "./download-all";
import { getPresetQuality, type QualityPreset, type RasterFormatConfig } from "./formats";
import { createPageResult, revokePageResults } from "./results";
import type { ArchiveStatus, ConverterState, PageResult, SelectedPdf } from "./types";

/**
 * Everything that belongs to one selected file. Disposing a session aborts
 * any work, destroys the PDF.js document, and revokes every object URL, so
 * there is exactly one cleanup path for file replacement, reset, and unmount.
 */
interface Session {
  file: SelectedPdf;
  lifetime: AbortController;
  document: PdfDocument | null;
  results: PageResult[];
  /** Controller for the conversion currently running, if any. */
  run: AbortController | null;
}

function toSelectedPdf(file: File): SelectedPdf {
  return { file, name: file.name, size: file.size, stem: deriveFileStem(file.name) };
}

function disposeSession(session: Session | null): void {
  if (!session) return;
  session.run?.abort();
  session.run = null;
  session.lifetime.abort();
  revokePageResults(session.results);
  session.results = [];
  void session.document?.destroy();
  session.document = null;
}

/**
 * State and orchestration for one PDF-to-image tool. The output format is
 * fixed per tool; everything else (file, presets, progress, results) lives
 * here.
 */
export function usePdfToImage(format: RasterFormatConfig) {
  const [state, setState] = useState<ConverterState>({ status: "idle" });
  const [preset, setPreset] = useState<QualityPreset>(format.defaultPreset ?? "balanced");
  const [archiveStatus, setArchiveStatus] = useState<ArchiveStatus>("idle");
  const sessionRef = useRef<Session | null>(null);

  const replaceSession = useCallback((next: Session | null) => {
    disposeSession(sessionRef.current);
    sessionRef.current = next;
    setArchiveStatus("idle");
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
        results: [],
        run: null,
      };
      replaceSession(session);
      setState({ status: "loading-document", file: session.file });

      try {
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

  const convert = useCallback(async () => {
    const session = sessionRef.current;
    const pdf = session?.document;
    if (!session || !pdf) return;

    session.run?.abort();
    revokePageResults(session.results);
    session.results = [];
    setArchiveStatus("idle");

    const run = new AbortController();
    session.run = run;
    const pageCount = pdf.pageCount;
    const isCurrent = () =>
      sessionRef.current === session && session.run === run && !run.signal.aborted;

    setState({
      status: "converting",
      file: session.file,
      pageCount,
      progress: { currentPage: 1, totalPages: pageCount, completedPages: 0 },
      results: [],
    });

    try {
      await convertPdfToImages(pdf, {
        format,
        quality: getPresetQuality(format, preset),
        signal: run.signal,
        onProgress: (progress) => {
          if (!isCurrent()) return;
          setState((previous) =>
            previous.status === "converting" ? { ...previous, progress } : previous,
          );
        },
        onPage: (rendered) => {
          if (!isCurrent()) return;
          session.results = [
            ...session.results,
            createPageResult(rendered, session.file.stem, format.extension),
          ];
          const results = session.results;
          setState((previous) =>
            previous.status === "converting" ? { ...previous, results } : previous,
          );
        },
      });

      if (!isCurrent()) return;
      session.run = null;
      setState({ status: "complete", file: session.file, pageCount, results: session.results });
    } catch (error) {
      if (!isCurrent()) return;
      session.run = null;
      revokePageResults(session.results);
      session.results = [];
      const failure = toPdfProcessingError(error);
      setState({
        status: "error",
        file: session.file,
        pageCount,
        code: failure.code,
        message: failure.message,
      });
    }
  }, [format, preset]);

  const cancel = useCallback(() => {
    const session = sessionRef.current;
    if (!session?.run) return;
    session.run.abort();
    session.run = null;
    revokePageResults(session.results);
    session.results = [];
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

  const downloadAll = useCallback(async () => {
    const session = sessionRef.current;
    if (!session || session.results.length === 0) return;

    setArchiveStatus("building");
    try {
      const archive = await buildImageArchive(session.results);
      if (sessionRef.current !== session) return;
      downloadBlob(archive, buildArchiveFilename(session.file.stem, format.extension));
      setArchiveStatus("idle");
    } catch {
      if (sessionRef.current === session) setArchiveStatus("error");
    }
  }, [format.extension]);

  return {
    state,
    preset,
    setPreset,
    archiveStatus,
    selectFile,
    convert,
    cancel,
    reset,
    downloadAll,
  };
}
