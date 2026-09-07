import { describe, expect, it } from "vitest";

import {
  DEFAULT_TARGET_DPI,
  MAX_CANVAS_PIXELS,
  MAX_CANVAS_SIDE,
  computePreviewDimensions,
  computeRenderDimensions,
} from "./canvas-limits";

const TARGET_SCALE = DEFAULT_TARGET_DPI / 72;

function expectWithinLimits({ width, height }: { width: number; height: number }) {
  expect(width).toBeGreaterThanOrEqual(1);
  expect(height).toBeGreaterThanOrEqual(1);
  expect(width).toBeLessThanOrEqual(MAX_CANVAS_SIDE);
  expect(height).toBeLessThanOrEqual(MAX_CANVAS_SIDE);
  expect(width * height).toBeLessThanOrEqual(MAX_CANVAS_PIXELS);
}

describe("computeRenderDimensions", () => {
  it("renders ordinary portrait pages at the full target density", () => {
    const letter = computeRenderDimensions(612, 792);
    expect(letter.scale).toBeCloseTo(TARGET_SCALE, 6);
    expect(letter).toMatchObject({ width: 1275, height: 1650 });

    const a4 = computeRenderDimensions(595.28, 841.89);
    expect(a4.scale).toBeCloseTo(TARGET_SCALE, 6);
    expect(a4).toMatchObject({ width: 1240, height: 1753 });
  });

  it("renders ordinary landscape pages at the full target density", () => {
    const landscape = computeRenderDimensions(792, 612);
    expect(landscape.scale).toBeCloseTo(TARGET_SCALE, 6);
    expect(landscape).toMatchObject({ width: 1650, height: 1275 });
  });

  it("honours a custom density", () => {
    expect(computeRenderDimensions(612, 792, 72)).toMatchObject({ width: 612, height: 792 });
    expect(computeRenderDimensions(612, 792, 300)).toMatchObject({ width: 2550, height: 3300 });
  });

  it("scales an oversized portrait page down to the pixel-area cap, keeping aspect ratio", () => {
    const a0 = computeRenderDimensions(2384, 3370);
    expectWithinLimits(a0);
    expect(a0.scale).toBeLessThan(TARGET_SCALE);
    // Lands on the cap: within one row of pixels of the maximum area.
    expect(a0.width * a0.height).toBeGreaterThan(MAX_CANVAS_PIXELS - a0.width - a0.height);
    expect(a0.width / a0.height).toBeCloseTo(2384 / 3370, 3);
    expect(a0).toMatchObject({ width: 3445, height: 4869 });
  });

  it("scales an oversized landscape page the same way", () => {
    const a0Landscape = computeRenderDimensions(3370, 2384);
    expectWithinLimits(a0Landscape);
    expect(a0Landscape).toMatchObject({ width: 4869, height: 3445 });
  });

  it("applies the side cap to very elongated pages after the area cap", () => {
    const strip = computeRenderDimensions(200, 20000);
    expectWithinLimits(strip);
    expect(strip.height).toBe(MAX_CANVAS_SIDE);
    expect(strip.width).toBe(Math.floor(200 * (MAX_CANVAS_SIDE / 20000)));

    const wideStrip = computeRenderDimensions(20000, 200);
    expectWithinLimits(wideStrip);
    expect(wideStrip.width).toBe(MAX_CANVAS_SIDE);
  });

  it("never exceeds either limit across a range of shapes", () => {
    const shapes: Array<[number, number]> = [
      [1, 1],
      [10, 10000],
      [10000, 10],
      [5000, 5000],
      [14400, 14400],
      [612, 792],
      [3370, 2384],
    ];
    for (const [w, h] of shapes) {
      expectWithinLimits(computeRenderDimensions(w, h));
    }
  });

  it("never produces zero-sized output", () => {
    expect(computeRenderDimensions(0, 0)).toMatchObject({ width: 2, height: 2 });
  });
});

describe("computePreviewDimensions", () => {
  it("leaves images that already fit untouched", () => {
    expect(computePreviewDimensions(300, 400, 480)).toEqual({ width: 300, height: 400 });
    expect(computePreviewDimensions(480, 100, 480)).toEqual({ width: 480, height: 100 });
  });

  it("fits portrait and landscape images inside the square, preserving aspect ratio", () => {
    expect(computePreviewDimensions(1275, 1650, 480)).toEqual({ width: 371, height: 480 });
    expect(computePreviewDimensions(1650, 1275, 480)).toEqual({ width: 480, height: 371 });
    expect(computePreviewDimensions(3445, 4869, 480)).toEqual({ width: 340, height: 480 });
  });

  it("never produces zero-sized output", () => {
    expect(computePreviewDimensions(1, 100000, 480)).toEqual({ width: 1, height: 480 });
    expect(computePreviewDimensions(0, 0, 480)).toEqual({ width: 1, height: 1 });
  });
});
