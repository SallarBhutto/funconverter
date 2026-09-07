import { describe, expect, it } from "vitest";

import { planCanvasBackground } from "./background";

describe("planCanvasBackground", () => {
  it("prepares an opaque white canvas and tells PDF.js to paint white", () => {
    expect(planCanvasBackground("white")).toEqual({
      contextAlpha: false,
      fillStyle: "#ffffff",
      pdfjsBackground: "rgb(255,255,255)",
    });
  });

  it("prepares an alpha canvas with no fill and a transparent PDF.js background", () => {
    expect(planCanvasBackground("transparent")).toEqual({
      contextAlpha: true,
      fillStyle: null,
      pdfjsBackground: "rgba(0,0,0,0)",
    });
  });
});
