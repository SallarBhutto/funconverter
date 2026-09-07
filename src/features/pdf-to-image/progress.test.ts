import { describe, expect, it } from "vitest";

import { progressLabel, progressPercent } from "./progress";

describe("progressPercent", () => {
  it("reports completed pages as a whole percentage", () => {
    expect(progressPercent({ currentPage: 1, totalPages: 32, completedPages: 0 })).toBe(0);
    expect(progressPercent({ currentPage: 7, totalPages: 32, completedPages: 6 })).toBe(19);
    expect(progressPercent({ currentPage: 32, totalPages: 32, completedPages: 32 })).toBe(100);
  });

  it("clamps and guards against a zero total", () => {
    expect(progressPercent({ currentPage: 1, totalPages: 0, completedPages: 0 })).toBe(0);
    expect(progressPercent({ currentPage: 3, totalPages: 2, completedPages: 5 })).toBe(100);
  });
});

describe("progressLabel", () => {
  it("names the page being converted", () => {
    expect(progressLabel({ currentPage: 7, totalPages: 32, completedPages: 6 })).toBe(
      "Converting page 7 of 32",
    );
  });
});
