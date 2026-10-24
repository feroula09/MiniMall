import { describe, expect, it } from "vitest";
import { generateOrderNo } from "../order-no";

describe("generateOrderNo", () => {
  it("uses Taipei time and pads the random suffix", () => {
    // 2026-10-24 23:05:09 UTC = 2026-10-25 07:05:09 Asia/Taipei
    expect(generateOrderNo(new Date("2026-10-24T23:05:09Z"), () => 42)).toBe("MM202610250705090042");
  });

  it("has a fixed format", () => {
    expect(generateOrderNo()).toMatch(/^MM\d{18}$/);
  });
});
