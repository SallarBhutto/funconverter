"use client";

import { FileDropzone } from "@/components/tool/file-dropzone";
import { PrivacyNote } from "@/components/tool/privacy-note";
import { ProgressBar } from "@/components/tool/progress-bar";
import { Button } from "@/components/ui/button";

import { getImageInputFormat, type ImageInputFormat } from "../formats";
import { useImageToPdf } from "../use-image-to-pdf";
import { ImageList } from "./image-list";
import { PageSettingsPanel } from "./page-settings";
import { PdfResult } from "./pdf-result";

interface ImageToPdfConverterProps {
  /** Input format for this tool page. Resolved to its config on the client. */
  format: ImageInputFormat;
}

/**
 * The interactive island shared by every image-to-PDF tool page. It owns the
 * image list, page settings, generation progress, and the finished PDF.
 * jsPDF is not loaded until Create PDF is pressed.
 */
export function ImageToPdfConverter({ format }: ImageToPdfConverterProps) {
  const config = getImageInputFormat(format);
  const { state, addFiles, removeImage, moveImage, updateSettings, dismissNotices, create, cancel, reset } =
    useImageToPdf(config);

  const generating = state.phase === "generating";
  const hasImages = state.images.length > 0;
  const plural = state.images.length === 1 ? "image" : "images";

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
          details="Select one or many. Each image becomes a page."
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
      {state.result ? <PdfResult result={state.result} /> : null}

      {state.error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      {notices}

      <section aria-labelledby="images-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="images-heading" className="text-base font-semibold text-zinc-900">
            {state.images.length} {plural}
            <span className="font-normal text-zinc-600"> · drag to reorder</span>
          </h2>
          <Button variant="ghost" onClick={reset} disabled={generating}>
            Remove all
          </Button>
        </div>
        <div className="mt-3">
          <ImageList images={state.images} disabled={generating} onMove={moveImage} onRemove={removeImage} />
        </div>
        {pending}
        <div className="mt-3">
          <FileDropzone
            accept={config.accept}
            buttonLabel={`Add more ${config.label} images`}
            hint="or drop them here"
            multiple
            compact
            disabled={generating}
            onFilesSelected={addFiles}
          />
        </div>
      </section>

      <PageSettingsPanel settings={state.settings} onChange={updateSettings} disabled={generating} />

      {generating && state.progress ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <p aria-live="polite" aria-atomic="true" className="text-sm font-medium text-zinc-900">
              Creating PDF — image {state.progress.current} of {state.progress.total}
            </p>
            <span className="text-sm tabular-nums text-zinc-600">
              {Math.round(((state.progress.current - 1) / state.progress.total) * 100)}%
            </span>
          </div>
          <ProgressBar
            value={((state.progress.current - 1) / state.progress.total) * 100}
            label={`Creating PDF, image ${state.progress.current} of ${state.progress.total}`}
            className="mt-3"
          />
          <Button variant="secondary" onClick={cancel} className="mt-4">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button onClick={create} disabled={state.pendingCount > 0}>
            {state.result ? "Create PDF again" : "Create PDF"}
          </Button>
          <PrivacyNote />
        </div>
      )}
    </div>
  );
}
