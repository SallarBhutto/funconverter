"use client";

import { FileDropzone } from "@/components/tool/file-dropzone";
import { PrivacyNote } from "@/components/tool/privacy-note";
import { ProgressBar } from "@/components/tool/progress-bar";
import { SegmentedRadioGroup } from "@/components/tool/segmented-radio-group";
import { SelectedFileCard } from "@/components/tool/selected-file-card";
import { Button, buttonClassName } from "@/components/ui/button";
import { formatFileSize } from "@/lib/files/formatting";
import { formatSavedPercent } from "@/lib/files/savings";

import {
  PDF_COMPRESSION_MODES,
  PDF_COMPRESSION_MODE_ORDER,
  getPdfCompressionMode,
} from "../modes";
import { usePdfCompression } from "../use-pdf-compression";

const MODE_OPTIONS = PDF_COMPRESSION_MODE_ORDER.map((id) => ({
  id,
  label: PDF_COMPRESSION_MODES[id].label,
  description: PDF_COMPRESSION_MODES[id].description,
}));

function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      {message}
    </div>
  );
}

/**
 * The interactive island for /compress-pdf. Everything around it is
 * server-rendered; this component only owns the file, the mode, progress,
 * and the result. qpdf, PDF.js's renderer and jsPDF load only when needed.
 */
export function PdfCompressionConverter() {
  const { state, mode, selectMode, selectFile, compress, cancel, reset } = usePdfCompression();
  const modeConfig = getPdfCompressionMode(mode);

  if (state.status === "idle" || (state.status === "error" && state.file === null)) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        {state.status === "error" ? (
          <div className="mb-4">
            <ErrorMessage message={state.message} />
          </div>
        ) : null}
        <FileDropzone
          accept="application/pdf,.pdf"
          buttonLabel="Choose PDF"
          hint="or drag and drop a PDF here"
          details="One PDF at a time. Pages, size and orientation are kept."
          onFilesSelected={(files) => selectFile(files[0])}
        />
        <PrivacyNote className="mt-4 justify-center" />
      </div>
    );
  }

  // Every remaining state carries an accepted file; the guard above handles the
  // only member whose file can be null, but the union cannot express that.
  const file = state.file;
  if (!file) return null;

  const pageCount = "pageCount" in state ? state.pageCount : null;
  const canRetry = state.status === "error" && state.pageCount !== null;
  const compressing = state.status === "compressing";
  const showOptions =
    state.status === "ready" || compressing || state.status === "complete" || canRetry;

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
      <SelectedFileCard
        file={file}
        badge="PDF"
        pageCount={pageCount}
        statusText={state.status === "loading-document" ? "Reading PDF…" : undefined}
        onRemove={reset}
        removeDisabled={compressing}
      />

      {state.status === "error" ? <ErrorMessage message={state.message} /> : null}

      {state.status === "complete" ? (
        <section
          aria-labelledby="result-heading"
          className="rounded-lg border border-accent bg-accent-soft p-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 id="result-heading" className="text-base font-semibold text-zinc-900">
                {state.result.status === "compressed" ? "Your PDF is ready" : "Already optimized"}
              </h2>
              <p className="mt-1 truncate text-sm text-zinc-700" title={state.result.filename}>
                {state.result.filename}
              </p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-zinc-700">
                <dt>Original</dt>
                <dd className="tabular-nums text-zinc-900">{formatFileSize(state.result.originalSize)}</dd>
                <dt>{state.result.status === "compressed" ? "Compressed" : "Result"}</dt>
                <dd className="tabular-nums text-zinc-900">{formatFileSize(state.result.outputSize)}</dd>
                {state.result.status === "compressed" ? (
                  <>
                    <dt>Saved</dt>
                    <dd className="tabular-nums font-medium text-accent">
                      {formatFileSize(state.result.savedBytes)} ({formatSavedPercent(state.result)})
                    </dd>
                  </>
                ) : null}
                <dt>Mode</dt>
                <dd>{getPdfCompressionMode(state.result.mode).label}</dd>
              </dl>
              {state.result.status === "already-optimized" ? (
                <p className="mt-2 text-sm text-zinc-600">
                  {getPdfCompressionMode(state.result.mode).label} could not make this file smaller, so the
                  original is offered unchanged.
                </p>
              ) : null}
            </div>
            <a
              href={state.result.objectUrl}
              download={state.result.filename}
              className={buttonClassName("primary", "shrink-0")}
            >
              Download PDF
            </a>
          </div>
        </section>
      ) : null}

      {showOptions ? (
        <div>
          <SegmentedRadioGroup
            legend="Compression mode"
            options={MODE_OPTIONS}
            value={mode}
            onChange={selectMode}
            disabled={compressing}
          />
          {modeConfig.caution ? (
            <p className="mt-2 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
              {modeConfig.caution}
            </p>
          ) : null}
        </div>
      ) : null}

      {compressing ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          {state.progress ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <p aria-live="polite" aria-atomic="true" className="text-sm font-medium text-zinc-900">
                  Compressing page {state.progress.currentPage} of {state.progress.totalPages}
                </p>
                <span className="text-sm tabular-nums text-zinc-600">
                  {Math.round(((state.progress.currentPage - 1) / state.progress.totalPages) * 100)}%
                </span>
              </div>
              <ProgressBar
                value={((state.progress.currentPage - 1) / state.progress.totalPages) * 100}
                label={`Compressing page ${state.progress.currentPage} of ${state.progress.totalPages}`}
                className="mt-3"
              />
            </>
          ) : (
            <p role="status" className="text-sm font-medium text-zinc-900">
              Optimizing PDF…
            </p>
          )}
          <Button variant="secondary" onClick={cancel} className="mt-4">
            Cancel
          </Button>
        </div>
      ) : null}

      {state.status === "ready" || canRetry ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button onClick={compress}>{canRetry ? "Try again" : "Compress PDF"}</Button>
          <PrivacyNote />
        </div>
      ) : null}

      {state.status === "complete" ? (
        <div className="flex flex-wrap gap-3 border-t border-zinc-200 pt-6">
          <Button variant="secondary" onClick={compress}>
            Compress again
          </Button>
          <Button variant="ghost" onClick={reset}>
            Compress another PDF
          </Button>
        </div>
      ) : null}
    </div>
  );
}
