import { describe, expect, it } from "vitest";

import { formatFileSize } from "./formatting";

describe("formatFileSize", () => {
  it("formats bytes as whole numbers", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats kilobytes with one decimal", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(245 * 1024 + 300)).toBe("245.3 KB");
  });

  it("formats megabytes and drops a trailing .0", () => {
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2 MB");
    expect(formatFileSize(2.25 * 1024 * 1024)).toBe("2.3 MB");
    expect(formatFileSize(1.04 * 1024 * 1024)).toBe("1 MB");
  });

  it("rounds sensibly at unit boundaries", () => {
    expect(formatFileSize(1024 * 1024 - 1)).toBe("1024 KB");
    expect(formatFileSize(1023.96 * 1024)).toBe("1024 KB");
  });

  it("formats gigabytes and caps at that unit", () => {
    expect(formatFileSize(3 * 1024 ** 3)).toBe("3 GB");
    expect(formatFileSize(2048 * 1024 ** 3)).toBe("2048 GB");
  });

  it("treats invalid input as zero", () => {
    expect(formatFileSize(-5)).toBe("0 B");
    expect(formatFileSize(Number.NaN)).toBe("0 B");
  });
});
