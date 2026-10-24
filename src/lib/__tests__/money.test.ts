import { describe, expect, it } from "vitest";
import { centsToYuan, formatPrice, yuanToCents } from "../money";

describe("formatPrice", () => {
  it("formats whole amounts without decimals", () => {
    expect(formatPrice(12900)).toBe("$129");
  });

  it("keeps cents when present", () => {
    expect(formatPrice(12950)).toBe("$129.5");
  });

  it("adds thousands separators", () => {
    expect(formatPrice(249000)).toBe("$2,490");
  });
});

describe("yuanToCents", () => {
  it.each([
    ["129", 12900],
    ["129.5", 12950],
    ["129.05", 12905],
    ["0", 0],
    [" 10 ", 1000],
  ])("converts %j to %d", (input, expected) => {
    expect(yuanToCents(input)).toBe(expected);
  });

  it.each(["", "abc", "-1", "1.234", "1e3", "1.", ".5"])("rejects %j", (input) => {
    expect(yuanToCents(input)).toBeNull();
  });

  it("avoids floating point errors", () => {
    expect(yuanToCents("0.29")).toBe(29);
    expect(yuanToCents("1.13")).toBe(113);
  });
});

describe("centsToYuan", () => {
  it("round-trips with yuanToCents", () => {
    for (const cents of [0, 29, 12950, 249000]) {
      expect(yuanToCents(centsToYuan(cents))).toBe(cents);
    }
  });
});
