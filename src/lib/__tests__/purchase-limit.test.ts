import { describe, expect, it } from "vitest";
import { MAX_QUANTITY_PER_ITEM, purchaseLimit } from "../purchase-limit";

describe("purchaseLimit", () => {
  it("is bounded by stock", () => {
    expect(purchaseLimit(12)).toBe(12);
  });

  it("is bounded by the per-item maximum", () => {
    expect(purchaseLimit(500)).toBe(MAX_QUANTITY_PER_ITEM);
  });

  it("never goes below zero", () => {
    expect(purchaseLimit(0)).toBe(0);
    expect(purchaseLimit(-3)).toBe(0);
  });
});
