import { describe, expect, it } from "vitest";
import { checkAddQuantity, issueMessage, lineIssue, summarizeCart } from "../summary";

const line = (quantity: number, product: Partial<{ price: number; stock: number; isActive: boolean }> = {}) => ({
  quantity,
  product: { price: 10000, stock: 10, isActive: true, ...product },
});

describe("lineIssue", () => {
  it("returns null for a valid line", () => {
    expect(lineIssue(line(3))).toBeNull();
    expect(lineIssue(line(10))).toBeNull();
  });

  it("flags inactive before stock problems", () => {
    expect(lineIssue(line(1, { isActive: false, stock: 0 }))).toEqual({ kind: "inactive" });
  });

  it("flags sold out and insufficient stock", () => {
    expect(lineIssue(line(1, { stock: 0 }))).toEqual({ kind: "soldOut" });
    expect(lineIssue(line(5, { stock: 3 }))).toEqual({ kind: "insufficient", available: 3 });
  });

  it("describes issues in zh-Hant", () => {
    expect(issueMessage({ kind: "insufficient", available: 3 })).toBe("庫存不足，目前剩 3 件");
  });
});

describe("summarizeCart", () => {
  it("is not checkout-able when empty", () => {
    expect(summarizeCart([])).toEqual({ itemCount: 0, subtotal: 0, hasIssues: false, canCheckout: false });
  });

  it("sums quantity and price in cents", () => {
    expect(summarizeCart([line(2, { price: 12900 }), line(1, { price: 290 })])).toEqual({
      itemCount: 3,
      subtotal: 26090,
      hasIssues: false,
      canCheckout: true,
    });
  });

  it("excludes problem lines from count and subtotal, and blocks checkout", () => {
    const summary = summarizeCart([line(1, { price: 100 }), line(3, { price: 500, isActive: false })]);
    expect(summary).toMatchObject({ itemCount: 1, subtotal: 100, hasIssues: true, canCheckout: false });
  });
});

describe("checkAddQuantity", () => {
  it("allows adding within stock", () => {
    expect(checkAddQuantity(0, 3, 10)).toBeNull();
    expect(checkAddQuantity(7, 3, 10)).toBeNull();
  });

  it("explains how many more can be added", () => {
    expect(checkAddQuantity(8, 3, 10)).toBe("購物車內已有 8 件，最多還能加入 2 件");
  });

  it("does not mention the cart when it has none of the product", () => {
    expect(checkAddQuantity(0, 13, 12)).toBe("庫存不足，最多可購買 12 件");
  });

  it("reports when the cart already holds the maximum", () => {
    expect(checkAddQuantity(10, 1, 10)).toBe("購物車內已有 10 件，已達可購買上限");
  });

  it("reports sold out", () => {
    expect(checkAddQuantity(0, 1, 0)).toBe("已售完");
  });

  it("caps at the per-item maximum even with large stock", () => {
    expect(checkAddQuantity(98, 2, 500)).toBe("購物車內已有 98 件，最多還能加入 1 件");
  });
});
