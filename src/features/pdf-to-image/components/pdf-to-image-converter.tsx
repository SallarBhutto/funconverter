"use client";

import { FileDropzone } from "@/components/tool/file-dropzone";
import { PrivacyNote } from "@/components/tool/privacy-note";
import { SelectedFileCard } from "@/components/tool/selected-file-card";
import { Button } from "@/components/ui/button";

import { getRasterFormat, type RasterOutputFormat } from "../formats";
import { usePdfToImage } from "../use-pdf-to-image";
import { ConversionProgressPanel } from "./conversion-progress";
import { QualitySelector } from "./quality-selector";
import { ResultsList } from "./results-list";

function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      {message}
    </div>
  );
}

interface PdfToImageConverterProps {
  /** Output format for this tool page. Resolved to its config on the client. */
  format: RasterOutputFormat;
}

/**
 * The interactive island shared by every PDF-to-image tool page. Everything
 * around it is server-rendered; this component only owns the file, options,
 * progress, and results. PDF.js is not loaded until a file is accepted.
 */
export function PdfToImageConverter({ format }: PdfToImageConverterProps) {
  const config = getRasterFormat(format);
  const { state, preset, setPreset, archiveStatus, selectFile, convert, cancel, reset, downloadAll } =
    usePdfToImage(config);

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
          details={`One PDF at a time. Every page becomes a ${config.label}.`}
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
  const showOptions =
    config.qualityPresets !== null &&
    (state.status === "ready" ||
      state.status === "converting" ||
      state.status === "complete" ||
      canRetry);
  const results =
    state.status === "converting" || state.status === "complete" ? state.results : [];

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
      <SelectedFileCard
        file={file}
        badge="PDF"
        pageCount={pageCount}
        statusText={state.status === "loading-document" ? "Reading PDF…" : undefined}
        onRemove={reset}
        removeDisabled={state.status === "converting"}
      />

      {state.status === "error" ? <ErrorMessage message={state.message} /> : null}

      {showOptions && config.qualityPresets ? (
        <QualitySelector
          presets={config.qualityPresets}
          formatLabel={config.label}
          value={preset}
          onChange={setPreset}
          disabled={state.status === "converting"}
        />
      ) : null}

      {state.status === "ready" ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button onClick={convert}>Convert to {config.label}</Button>
          <PrivacyNote />
        </div>
      ) : null}

      {canRetry ? <Button onClick={convert}>Try again</Button> : null}

      {state.status === "converting" ? (
        <ConversionProgressPanel progress={state.progress} onCancel={cancel} />
      ) : null}

      {results.length > 0 ? (
        <ResultsList
          results={results}
          sourceName={file.name}
          formatLabel={config.label}
          complete={state.status === "complete"}
          archiveStatus={archiveStatus}
          onDownloadAll={downloadAll}
        />
      ) : null}

      {state.status === "complete" ? (
        <div className="flex flex-wrap gap-3 border-t border-zinc-200 pt-6">
          {config.qualityPresets ? (
            <Button variant="secondary" onClick={convert}>
              Convert again
            </Button>
          ) : null}
          <Button variant="ghost" onClick={reset}>
            Convert another PDF
          </Button>
        </div>
      ) : null}
    </div>
  );
}
