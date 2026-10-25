import { describe, expect, it } from "vitest";
import { buildAdminOrderDetailHref, buildAdminOrdersHref, parseAdminOrderParams } from "../params";

describe("parseAdminOrderParams", () => {
  it("parses status, a normalized order number and page", () => {
    expect(parseAdminOrderParams({ status: "PAID", q: " mm2026 1025 ", page: "2" })).toEqual({
      status: "PAID",
      q: "MM20261025",
      page: 2,
    });
  });

  it("falls back to defaults for invalid values", () => {
    expect(parseAdminOrderParams({ status: "paid", q: "  ", page: "x" })).toEqual({
      status: undefined,
      q: undefined,
      page: 1,
    });
  });

  it("drops characters that are not part of an order number (LIKE wildcards included)", () => {
    expect(parseAdminOrderParams({ q: "mm_2026%" }).q).toBe("MM2026");
    expect(parseAdminOrderParams({ q: "%_" }).q).toBeUndefined();
  });

  it("limits the search length", () => {
    expect(parseAdminOrderParams({ q: "M".repeat(100) }).q).toHaveLength(30);
  });
});

describe("buildAdminOrdersHref", () => {
  it("omits defaults", () => {
    expect(buildAdminOrdersHref({ page: 1 })).toBe("/admin/orders");
  });

  it("keeps filters and applies overrides", () => {
    expect(buildAdminOrdersHref({ status: "PAID", q: "MM2026", page: 3 }, { status: undefined, page: 1 })).toBe(
      "/admin/orders?q=MM2026",
    );
  });

  it("builds a detail link that carries the list filters", () => {
    expect(buildAdminOrderDetailHref("cm1", { status: "PAID", page: 2 })).toBe("/admin/orders/cm1?status=PAID&page=2");
    expect(buildAdminOrderDetailHref("cm1", { page: 1 })).toBe("/admin/orders/cm1");
  });
});
