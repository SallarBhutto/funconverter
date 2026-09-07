import { Button, buttonClassName } from "@/components/ui/button";
import { formatFileSize } from "@/lib/files/formatting";

import type { ArchiveStatus, PageResult } from "../types";

interface ResultsListProps {
  results: readonly PageResult[];
  /** Original PDF name, used for image alt text. */
  sourceName: string;
  /** Short format label for headings and buttons, e.g. "PNG". */
  formatLabel: string;
  /** True once every page has been rendered. */
  complete: boolean;
  archiveStatus: ArchiveStatus;
  onDownloadAll: () => void;
}

/**
 * Each card shows the small preview JPEG through a plain <img>; the full-size
 * image is only referenced by the download link, so the browser never decodes
 * a full-resolution page just to display a thumbnail. Preview boxes carry the
 * page's aspect ratio to avoid layout shift while images decode.
 */
export function ResultsList({
  results,
  sourceName,
  formatLabel,
  complete,
  archiveStatus,
  onDownloadAll,
}: ResultsListProps) {
  const count = results.length;
  const single = complete && count === 1;

  return (
    <section aria-labelledby="results-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="results-heading" className="text-lg font-semibold text-zinc-900">
            {complete ? `Your ${formatLabel} images` : "Converted so far"}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-600" aria-live="polite">
            {count} {count === 1 ? "image" : "images"}
            {complete ? " ready to download" : ""}
          </p>
        </div>
        {complete && count > 1 ? (
          <Button onClick={onDownloadAll} disabled={archiveStatus === "building"}>
            {archiveStatus === "building" ? "Preparing ZIP…" : "Download All (ZIP)"}
          </Button>
        ) : null}
      </div>
      {archiveStatus === "error" ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          The ZIP could not be created. You can still download each page individually.
        </p>
      ) : null}

      <ul
        className={`mt-5 grid gap-4 ${single ? "max-w-md" : "sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {results.map((result) => (
          <li key={result.id} className="rounded-lg border border-zinc-200 bg-white p-3">
            <figure>
              <div
                className="mx-auto max-h-80 w-full overflow-hidden rounded bg-zinc-100"
                style={{ aspectRatio: `${result.width} / ${result.height}` }}
              >
                {/* Previews are in-memory object URLs; next/image cannot optimise them. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.preview.objectUrl}
                  alt={`Page ${result.pageNumber} of ${sourceName} as ${formatLabel}`}
                  width={result.preview.width}
                  height={result.preview.height}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain"
                />
              </div>
              <figcaption className="mt-3 flex items-center justify-between gap-3">
                <span className="min-w-0 text-sm">
                  <span className="font-medium text-zinc-900">Page {result.pageNumber}</span>
                  <span className="text-zinc-500"> · {formatFileSize(result.download.size)}</span>
                </span>
                <a
                  href={result.download.objectUrl}
                  download={result.download.filename}
                  className={buttonClassName(single ? "primary" : "secondary", "shrink-0 px-3")}
                >
                  Download{single ? ` ${formatLabel}` : ""}
                </a>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
