const UNITS = ["B", "KB", "MB", "GB"] as const;

/**
 * Formats a byte count for display: whole bytes below 1 KB, otherwise one
 * decimal place with a trailing ".0" removed (1536 → "1.5 KB", 2097152 → "2 MB").
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;

  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} ${UNITS[unitIndex]}`;
}
