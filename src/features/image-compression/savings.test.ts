import { describe, expect, it } from "vitest";

import { chooseSmaller, computeSavings, formatSavedPercent } from "./savings";

describe("computeSavings", () => {
  it("reports an exact 50 % saving", () => {
    expect(computeSavings(2_000_000, 1_000_000)).toEqual({
      originalSize: 2_000_000,
      outputSize: 1_000_000,
      savedBytes: 1_000_000,
      savedPercent: 50,
      status: "compressed",
    });
  });

  it("rounds to one decimal place", () => {
    expect(computeSavings(4_200_000, 1_100_000).savedPercent).toBe(73.8);
  });

  it("keeps savings below 1 % honest", () => {
    const savings = computeSavings(1_000_000, 996_000);
    expect(savings.savedPercent).toBe(0.4);
    expect(savings.status).toBe("compressed");
    expect(formatSavedPercent(savings)).toBe("0.4%");
  });

  it("does not cap savings above 99 %", () => {
    const savings = computeSavings(1_000_000, 4_000);
    expect(savings.savedPercent).toBe(99.6);
    expect(formatSavedPercent(savings)).toBe("99.6%");
  });

  it("reports zero savings as already optimized with no percentage", () => {
    const savings = computeSavings(1_800_000, 1_800_000);
    expect(savings).toMatchObject({ savedBytes: 0, savedPercent: 0, status: "already-optimized" });
  });

  it("never reports negative savings when the output is larger", () => {
    expect(computeSavings(1000, 1500)).toMatchObject({
      savedBytes: 0,
      savedPercent: 0,
      status: "already-optimized",
    });
  });

  it("handles zero-byte input safely", () => {
    expect(computeSavings(0, 0)).toEqual({
      originalSize: 0,
      outputSize: 0,
      savedBytes: 0,
      savedPercent: 0,
      status: "already-optimized",
    });
  });
});

describe("formatSavedPercent", () => {
  it("shows whole numbers without a decimal and fractions with one", () => {
    expect(formatSavedPercent(computeSavings(200, 100))).toBe("50%");
    expect(formatSavedPercent(computeSavings(1000, 875))).toBe("12.5%");
  });

  it("never shows a real saving as 0 %", () => {
    expect(formatSavedPercent(computeSavings(10_000_000, 9_999_999))).toBe("<0.1%");
  });
});

describe("chooseSmaller", () => {
  const original = { size: 1000, name: "original" };

  it("delivers the candidate when it is strictly smaller", () => {
    const candidate = { size: 600, name: "candidate" };
    expect(chooseSmaller(original, candidate)).toEqual({ output: candidate, status: "compressed" });
  });

  it("delivers the original when the candidate is equal or larger", () => {
    expect(chooseSmaller(original, { size: 1000, name: "same" })).toEqual({
      output: original,
      status: "already-optimized",
    });
    expect(chooseSmaller(original, { size: 1400, name: "bigger" })).toEqual({
      output: original,
      status: "already-optimized",
    });
  });
});
