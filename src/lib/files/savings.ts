export type CompressionStatus = "compressed" | "already-optimized";

export interface Savings {
  originalSize: number;
  outputSize: number;
  /** Bytes saved, never negative. */
  savedBytes: number;
  /** Percentage saved, rounded to one decimal place, in [0, 100]. */
  savedPercent: number;
  status: CompressionStatus;
}

/**
 * Describes the outcome of a compression given the sizes of the original and
 * the delivered output. The percentage is the true ratio rounded to one
 * decimal place: 0.4 % stays 0.4 %, 99.6 % stays 99.6 %. Zero savings and
 * zero-size originals report 0 % and "already optimized".
 */
export function computeSavings(originalSize: number, outputSize: number): Savings {
  const safeOriginal = Math.max(0, originalSize);
  const safeOutput = Math.max(0, outputSize);
  const savedBytes = Math.max(0, safeOriginal - safeOutput);

  const savedPercent =
    safeOriginal > 0 && savedBytes > 0
      ? Math.round((savedBytes / safeOriginal) * 1000) / 10
      : 0;

  return {
    originalSize: safeOriginal,
    outputSize: safeOutput,
    savedBytes,
    savedPercent,
    status: savedBytes > 0 ? "compressed" : "already-optimized",
  };
}

/**
 * Presents the percentage for display: whole numbers without a decimal
 * ("50%"), fractions with one ("0.4%", "99.6%"), and a real saving that
 * rounds to 0.0 as "<0.1%" rather than a misleading "0%".
 */
export function formatSavedPercent(savings: Pick<Savings, "savedBytes" | "savedPercent">): string {
  if (savings.savedBytes > 0 && savings.savedPercent === 0) return "<0.1%";
  return `${savings.savedPercent}%`;
}

export interface ChosenOutput<T> {
  output: T;
  status: CompressionStatus;
}

/**
 * Never hands back a larger file. When the re-encoded candidate is not
 * strictly smaller than the original, the original is delivered unchanged
 * and the result is flagged as already optimized.
 */
export function chooseSmaller<T extends { size: number }>(original: T, candidate: T): ChosenOutput<T> {
  if (candidate.size < original.size) return { output: candidate, status: "compressed" };
  return { output: original, status: "already-optimized" };
}
