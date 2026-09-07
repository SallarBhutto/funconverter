"use client";

import { useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/files/formatting";

import type { SelectedImage } from "../types";

interface ImageListProps {
  images: readonly SelectedImage[];
  disabled?: boolean;
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
}

/**
 * Ordered list of selected images. Reordering works three ways: native drag
 * and drop between cards, Move earlier / Move later buttons for keyboard and
 * touch, and Remove. Thumbnails are bounded previews, never the originals.
 */
export function ImageList({ images, disabled = false, onMove, onRemove }: ImageListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const endDrag = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragStart = (index: number) => (event: DragEvent<HTMLLIElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (index: number) => (event: DragEvent<HTMLLIElement>) => {
    if (dragIndex === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropIndex !== index) setDropIndex(index);
  };

  const handleDrop = (index: number) => (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    if (dragIndex !== null && dragIndex !== index) onMove(dragIndex, index);
    endDrag();
  };

  return (
    <ol aria-label="Selected images, in page order" className="space-y-2">
      {images.map((image, index) => {
        const isDropTarget = dropIndex === index && dragIndex !== null && dragIndex !== index;
        return (
          <li
            key={image.id}
            draggable={!disabled}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDragLeave={() => dropIndex === index && setDropIndex(null)}
            onDrop={handleDrop(index)}
            onDragEnd={endDrag}
            className={`flex items-center gap-3 rounded-lg border bg-white p-3 transition-colors ${
              isDropTarget ? "border-accent bg-accent-soft" : "border-zinc-200"
            } ${dragIndex === index ? "opacity-50" : ""} ${disabled ? "" : "cursor-grab"}`}
          >
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold tabular-nums text-zinc-700"
            >
              {index + 1}
            </span>
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
                <span className="sr-only">Page {index + 1}: </span>
                {image.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">
                {image.width} × {image.height} px · {formatFileSize(image.size)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                className="px-2"
                disabled={disabled || index === 0}
                onClick={() => onMove(index, index - 1)}
                aria-label={`Move ${image.name} earlier`}
              >
                <ArrowIcon direction="up" />
              </Button>
              <Button
                variant="ghost"
                className="px-2"
                disabled={disabled || index === images.length - 1}
                onClick={() => onMove(index, index + 1)}
                aria-label={`Move ${image.name} later`}
              >
                <ArrowIcon direction="down" />
              </Button>
              <Button
                variant="ghost"
                className="px-2"
                disabled={disabled}
                onClick={() => onRemove(image.id)}
                aria-label={`Remove ${image.name}`}
              >
                <CloseIcon />
              </Button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ArrowIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 ${direction === "down" ? "rotate-180" : ""}`}
    >
      <path d="M10 16V4M5 9l5-5 5 5" />
    </svg>
  );
}

function CloseIcon() {
  return (
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
  );
}
