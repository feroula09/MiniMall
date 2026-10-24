import { describe, expect, it } from "vitest";
import { detectImageType, imageFileError, MAX_IMAGE_BYTES } from "../image-type";

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

describe("detectImageType", () => {
  it("detects JPEG", () => {
    expect(detectImageType(bytes([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]))).toBe("jpg");
  });

  it("detects PNG", () => {
    expect(detectImageType(bytes([0x89], "PNG", [0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("png");
  });

  it("detects WebP", () => {
    expect(detectImageType(bytes("RIFF", [0x24, 0, 0, 0], "WEBPVP8 "))).toBe("webp");
  });

  it.each([
    ["empty", bytes()],
    ["truncated JPEG", bytes([0xff, 0xd8])],
    ["RIFF but not WebP (WAV)", bytes("RIFF", [0, 0, 0, 0], "WAVEfmt ")],
    ["GIF", bytes("GIF89a")],
    ["SVG", bytes("<svg xmlns")],
    ["HTML", bytes("<!doctype html>")],
  ])("rejects %s", (_, input) => {
    expect(detectImageType(input)).toBeNull();
  });
});

describe("imageFileError", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (type) => {
    expect(imageFileError({ type, size: 1000 })).toBeNull();
  });

  it("accepts exactly 2MB", () => {
    expect(imageFileError({ type: "image/png", size: MAX_IMAGE_BYTES })).toBeNull();
  });

  it.each([
    ["GIF", { type: "image/gif", size: 1000 }],
    ["SVG", { type: "image/svg+xml", size: 1000 }],
    ["unknown type", { type: "", size: 1000 }],
    ["empty file", { type: "image/png", size: 0 }],
    ["over 2MB", { type: "image/png", size: MAX_IMAGE_BYTES + 1 }],
  ])("rejects %s", (_, file) => {
    expect(imageFileError(file)).toEqual(expect.any(String));
  });
});
