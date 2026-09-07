import { describe, expect, it } from "vitest";

import { validateImageFile } from "@/lib/files/validation";

import { IMAGE_INPUT_FORMATS, getImageInputFormat } from "./formats";

describe("image input formats", () => {
  it("defines the three input formats with their embed strategies", () => {
    expect(Object.keys(IMAGE_INPUT_FORMATS)).toEqual(["jpeg", "png", "webp"]);
    expect(getImageInputFormat("jpeg").embed).toBe("jpeg");
    expect(getImageInputFormat("png").embed).toBe("png");
    expect(getImageInputFormat("webp").embed).toBe("reencode-jpeg");
  });

  it("accepts the documented MIME types and extensions", () => {
    expect(getImageInputFormat("jpeg").accept).toBe("image/jpeg,.jpg,.jpeg");
    expect(getImageInputFormat("png").accept).toBe("image/png,.png");
    expect(getImageInputFormat("webp").accept).toBe("image/webp,.webp");
  });
});

describe("validateImageFile per format", () => {
  const jpeg = getImageInputFormat("jpeg");
  const png = getImageInputFormat("png");
  const webp = getImageInputFormat("webp");

  it("accepts matching MIME types", () => {
    expect(validateImageFile({ name: "a.jpg", type: "image/jpeg", size: 10 }, jpeg).ok).toBe(true);
    expect(validateImageFile({ name: "a.png", type: "image/png", size: 10 }, png).ok).toBe(true);
    expect(validateImageFile({ name: "a.webp", type: "image/webp", size: 10 }, webp).ok).toBe(true);
  });

  it("accepts a matching extension when the MIME type is missing or generic", () => {
    expect(validateImageFile({ name: "photo.JPEG", type: "", size: 10 }, jpeg).ok).toBe(true);
    expect(
      validateImageFile({ name: "photo.png", type: "application/octet-stream", size: 10 }, png).ok,
    ).toBe(true);
  });

  it("rejects the wrong format with the file name in the message", () => {
    const result = validateImageFile({ name: "photo.png", type: "image/png", size: 10 }, jpeg);
    expect(result).toEqual({
      ok: false,
      reason: "wrong-format",
      message: "photo.png is not a JPG image.",
    });
    expect(validateImageFile({ name: "doc.pdf", type: "application/pdf", size: 10 }, webp).ok).toBe(false);
  });

  it("does not let an extension override a contradicting MIME type", () => {
    expect(validateImageFile({ name: "photo.jpg", type: "image/png", size: 10 }, jpeg).ok).toBe(false);
  });

  it("rejects empty files", () => {
    expect(validateImageFile({ name: "a.png", type: "image/png", size: 0 }, png)).toMatchObject({
      reason: "empty",
    });
  });
});
