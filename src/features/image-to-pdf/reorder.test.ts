import { describe, expect, it } from "vitest";

import { moveItem } from "./reorder";

describe("moveItem", () => {
  const items = ["a", "b", "c", "d"] as const;

  it("moves an item earlier", () => {
    expect(moveItem(items, 2, 0)).toEqual(["c", "a", "b", "d"]);
  });

  it("moves an item later", () => {
    expect(moveItem(items, 0, 2)).toEqual(["b", "c", "a", "d"]);
  });

  it("moves to the last position", () => {
    expect(moveItem(items, 1, 3)).toEqual(["a", "c", "d", "b"]);
  });

  it("returns the same array for no-op or out-of-range moves", () => {
    expect(moveItem(items, 1, 1)).toBe(items);
    expect(moveItem(items, -1, 0)).toBe(items);
    expect(moveItem(items, 0, 4)).toBe(items);
    expect(moveItem([], 0, 0)).toEqual([]);
  });

  it("does not mutate the input", () => {
    const input = ["x", "y", "z"];
    moveItem(input, 0, 2);
    expect(input).toEqual(["x", "y", "z"]);
  });
});
