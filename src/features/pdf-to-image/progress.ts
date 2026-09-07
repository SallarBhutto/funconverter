export interface ConversionProgress {
  /** 1-based page currently being rendered. */
  currentPage: number;
  totalPages: number;
  /** Pages already encoded. */
  completedPages: number;
}

/** Whole-number percentage of completed pages, clamped to [0, 100]. */
export function progressPercent(progress: ConversionProgress): number {
  if (progress.totalPages <= 0) return 0;
  const ratio = progress.completedPages / progress.totalPages;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

/** "Converting page 7 of 32" */
export function progressLabel(progress: ConversionProgress): string {
  return `Converting page ${progress.currentPage} of ${progress.totalPages}`;
}
