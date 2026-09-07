import { Button, buttonClassName } from "@/components/ui/button";
import { formatFileSize } from "@/lib/files/formatting";
import type { SelectedImage } from "@/lib/image/selected-image";

import { formatSavedPercent } from "../savings";
import type { CompressionResult } from "../types";

interface CompressionListProps {
  images: readonly SelectedImage[];
  results: Readonly<Record<string, CompressionResult>>;
  disabled?: boolean;
  onRemove: (id: string) => void;
}

/**
 * One row per selected image. Before a run it shows the original; after a
 * run the same row gains the compressed size, savings, status, and download
 * link. Thumbnails are the bounded selection previews, never full images.
 */
export function CompressionList({ images, results, disabled = false, onRemove }: CompressionListProps) {
  return (
    <ul aria-label="Selected images" className="space-y-2">
      {images.map((image) => {
        const result = results[image.id];
        return (
          <li
            key={image.id}
            className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-100"
                aria-hidden="true"
              >
                {/* Bounded in-memory thumbnails; next/image cannot optimise object URLs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.preview.objectUrl}
                  alt=""
                  width={image.preview.width}
                  height={image.preview.height}
                  decoding="async"
                  className="size-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900" title={image.name}>
                  {image.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  {image.width} × {image.height} px
                </p>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-xs text-zinc-600">
                  <dt>Original</dt>
                  <dd className="tabular-nums text-zinc-900">{formatFileSize(image.size)}</dd>
                  {result ? (
                    <>
                      <dt>Compressed</dt>
                      <dd className="tabular-nums text-zinc-900">{formatFileSize(result.outputSize)}</dd>
                      <dt>Saved</dt>
                      <dd className="tabular-nums">
                        {result.status === "compressed" ? (
                          <span className="font-medium text-accent">
                            {formatFileSize(result.savedBytes)} ({formatSavedPercent(result)})
                          </span>
                        ) : (
                          <span className="font-medium text-zinc-700">Already optimized</span>
                        )}
                      </dd>
                    </>
                  ) : null}
                </dl>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:justify-end">
              {result ? (
                <a
                  href={result.objectUrl}
                  download={result.filename}
                  className={buttonClassName("secondary", "px-3")}
                >
                  Download
                </a>
              ) : null}
              <Button
                variant="ghost"
                className="px-2"
                disabled={disabled}
                onClick={() => onRemove(image.id)}
                aria-label={`Remove ${image.name}`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-5"
                >
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
