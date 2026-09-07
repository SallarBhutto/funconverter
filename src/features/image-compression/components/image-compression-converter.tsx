"use client";

import { FileDropzone } from "@/components/tool/file-dropzone";
import { PrivacyNote } from "@/components/tool/privacy-note";
import { ProgressBar } from "@/components/tool/progress-bar";
import { SegmentedRadioGroup } from "@/components/tool/segmented-radio-group";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/files/formatting";

import { getCompressibleFormat, type CompressibleFormat } from "../formats";
import { computeSavings, formatSavedPercent } from "../savings";
import { useImageCompression } from "../use-image-compression";
import { CompressionList } from "./compression-list";

interface ImageCompressionConverterProps {
  /** Input format for this tool page. Resolved to its config on the client. */
  format: CompressibleFormat;
}

/**
 * The interactive island shared by every compression tool page. It owns the
 * image list, the quality preset where the format has one, progress, and
 * per-image results. Codecs load only when compression starts.
 */
export function ImageCompressionConverter({ format }: ImageCompressionConverterProps) {
  const config = getCompressibleFormat(format);
  const { state, archiveStatus, addFiles, removeImage, setPreset, dismissNotices, compress, cancel, reset, downloadAll } =
    useImageCompression(config);

  const compressing = state.phase === "compressing";
  const hasImages = state.images.length > 0;
  const completedResults = state.images
    .map((image) => state.results[image.id])
    .filter((result) => result !== undefined);
  const totals = computeSavings(
    completedResults.reduce((sum, result) => sum + result.originalSize, 0),
    completedResults.reduce((sum, result) => sum + result.outputSize, 0),
  );

  const notices =
    state.notices.length > 0 ? (
      <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">
          {state.notices.length === 1 ? "One file was skipped" : `${state.notices.length} files were skipped`}
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {state.notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
        <Button variant="ghost" className="mt-2 min-h-9 px-2" onClick={dismissNotices}>
          Dismiss
        </Button>
      </div>
    ) : null;

  const pending =
    state.pendingCount > 0 ? (
      <p className="text-sm text-zinc-600" aria-live="polite">
        Reading {state.pendingCount} {state.pendingCount === 1 ? "image" : "images"}…
      </p>
    ) : null;

  if (!hasImages) {
    return (
      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        {notices}
        <FileDropzone
          accept={config.accept}
          buttonLabel={`Choose ${config.label} images`}
          hint={`or drag and drop ${config.label} files here`}
          details="Select one or many. Dimensions stay the same; only the file size changes."
          multiple
          onFilesSelected={addFiles}
        />
        {pending}
        <PrivacyNote className="justify-center" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
      {state.error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      {notices}

      {state.phase === "complete" ? (
        <section
          aria-labelledby="summary-heading"
          className="flex flex-col gap-4 rounded-lg border border-accent bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 id="summary-heading" className="text-base font-semibold text-zinc-900">
              {completedResults.length === 1 ? "Your image is ready" : "Your images are ready"}
            </h2>
            <p className="mt-1 text-sm text-zinc-700" aria-live="polite">
              {totals.status === "compressed"
                ? `${formatFileSize(totals.originalSize)} → ${formatFileSize(totals.outputSize)}, saved ${formatFileSize(totals.savedBytes)} (${formatSavedPercent(totals)})`
                : `${formatFileSize(totals.originalSize)} total. Already optimized; the originals were kept.`}
            </p>
            {archiveStatus === "error" ? (
              <p role="alert" className="mt-1 text-sm text-red-700">
                The ZIP could not be created. You can still download each image individually.
              </p>
            ) : null}
          </div>
          {completedResults.length > 1 ? (
            <Button onClick={downloadAll} disabled={archiveStatus === "building"} className="shrink-0">
              {archiveStatus === "building" ? "Preparing ZIP…" : "Download All (ZIP)"}
            </Button>
          ) : null}
        </section>
      ) : null}

      <section aria-labelledby="images-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="images-heading" className="text-base font-semibold text-zinc-900">
            {state.images.length} {state.images.length === 1 ? "image" : "images"}
          </h2>
          <Button variant="ghost" onClick={reset} disabled={compressing}>
            Remove all
          </Button>
        </div>
        <div className="mt-3">
          <CompressionList
            images={state.images}
            results={state.results}
            disabled={compressing}
            onRemove={removeImage}
          />
        </div>
        {pending}
        <div className="mt-3">
          <FileDropzone
            accept={config.accept}
            buttonLabel={`Add more ${config.label} images`}
            hint="or drop them here"
            multiple
            compact
            disabled={compressing}
            onFilesSelected={addFiles}
          />
        </div>
      </section>

      {config.qualityPresets ? (
        <SegmentedRadioGroup
          legend={`${config.label} quality`}
          options={config.qualityPresets}
          value={state.preset}
          onChange={setPreset}
          disabled={compressing}
        />
      ) : (
        <p className="text-sm text-zinc-600">
          PNG uses lossless compression, so savings may be smaller than JPG or WebP. Pixels and
          transparency are left exactly as they are.
        </p>
      )}

      {compressing && state.progress ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <p aria-live="polite" aria-atomic="true" className="text-sm font-medium text-zinc-900">
              Compressing image {state.progress.current} of {state.progress.total}
            </p>
            <span className="text-sm tabular-nums text-zinc-600">
              {Math.round(((state.progress.current - 1) / state.progress.total) * 100)}%
            </span>
          </div>
          <ProgressBar
            value={((state.progress.current - 1) / state.progress.total) * 100}
            label={`Compressing image ${state.progress.current} of ${state.progress.total}`}
            className="mt-3"
          />
          <Button variant="secondary" onClick={cancel} className="mt-4">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button onClick={compress} disabled={state.pendingCount > 0}>
            {state.phase === "complete" ? "Compress again" : `Compress ${config.label}`}
          </Button>
          <PrivacyNote />
        </div>
      )}
    </div>
  );
}
