"use client";

import { useId, useRef, useState, type DragEvent, type MouseEvent } from "react";

import { buttonClassName } from "@/components/ui/button";

interface FileDropzoneProps {
  /** Value for the file input's `accept` attribute. */
  accept: string;
  /** Text on the visible picker button, e.g. "Choose PDF". */
  buttonLabel: string;
  /** Short line under the button, e.g. "or drag and drop a PDF here". */
  hint: string;
  /** Small print, e.g. accepted formats. */
  details?: string;
  /** Allow selecting or dropping several files at once. */
  multiple?: boolean;
  /** Tighter padding for an "add more" zone under an existing list. */
  compact?: boolean;
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
}

/**
 * File picker. The real `<input type="file">` is visually hidden but stays
 * in the tab order, so keyboard users activate it like any control and the
 * visible label shows its focus ring. Clicking anywhere in the zone opens
 * the picker; desktop users can also drop files onto it.
 */
export function FileDropzone({
  accept,
  buttonLabel,
  hint,
  details,
  multiple = false,
  compact = false,
  disabled = false,
  onFilesSelected,
}: FileDropzoneProps) {
  const inputId = useId();
  const detailsId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const acceptFiles = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    onFilesSelected(multiple ? files : files.slice(0, 1));
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setDragActive(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (!disabled) acceptFiles(event.dataTransfer.files);
  };

  const handleZoneClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    // The label already opens the picker natively; avoid opening it twice.
    if ((event.target as HTMLElement).closest("label, input")) return;
    inputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 text-center transition-colors ${
        compact ? "py-6" : "py-12"
      } ${
        dragActive
          ? "border-accent bg-accent-soft"
          : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-describedby={details ? detailsId : undefined}
        className="peer sr-only"
        onChange={(event) => {
          acceptFiles(event.target.files);
          // Allow selecting the same file again after a reset.
          event.target.value = "";
        }}
      />
      <label
        htmlFor={inputId}
        className={buttonClassName(
          compact ? "secondary" : "primary",
          "cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
        )}
      >
        {buttonLabel}
      </label>
      <p className={`text-sm text-zinc-600 ${compact ? "mt-2" : "mt-4"}`}>{hint}</p>
      {details ? (
        <p id={detailsId} className="mt-1 text-xs text-zinc-500">
          {details}
        </p>
      ) : null}
    </div>
  );
}
