import { describe, expect, it } from "vitest";
import { buildCatalogHref, parseCatalogParams } from "../params";

describe("parseCatalogParams", () => {
  it("returns defaults for empty params", () => {
    expect(parseCatalogParams({})).toEqual({ sort: "newest", page: 1 });
  });

  it("parses valid params", () => {
    expect(
      parseCatalogParams({ q: " 耳機 ", category: "electronics", sort: "price_asc", page: "3" }),
    ).toEqual({ q: "耳機", category: "electronics", sort: "price_asc", page: 3 });
  });

  it("takes the first value of repeated params", () => {
    expect(parseCatalogParams({ sort: ["price_desc", "newest"], page: ["2", "5"] })).toMatchObject({
      sort: "price_desc",
      page: 2,
    });
  });

  it.each([
    [{ sort: "random" }, { sort: "newest" }],
    [{ page: "0" }, { page: 1 }],
    [{ page: "-2" }, { page: 1 }],
    [{ page: "abc" }, { page: 1 }],
    [{ page: "1.5" }, { page: 1 }],
    [{ category: "Bad Slug!" }, { category: undefined }],
    [{ q: "   " }, { q: undefined }],
  ])("falls back to defaults for invalid input %j", (raw, expected) => {
    expect(parseCatalogParams(raw)).toMatchObject(expected);
  });

  it("truncates an overlong keyword instead of dropping it", () => {
    expect(parseCatalogParams({ q: "x".repeat(60) }).q).toBe("x".repeat(50));
  });
});

describe("buildCatalogHref", () => {
  const base = { sort: "newest", page: 1 } as const;

  it("omits default values", () => {
    expect(buildCatalogHref(base)).toBe("/");
  });

  it("keeps current filters and applies overrides", () => {
    const current = { ...base, q: "茶", category: "food", page: 2 };
    expect(buildCatalogHref(current, { page: 3 })).toBe("/?q=%E8%8C%B6&category=food&page=3");
  });

  it("can clear a filter", () => {
    const current = { ...base, category: "food", sort: "price_asc" as const };
    expect(buildCatalogHref(current, { category: undefined, page: 1 })).toBe("/?sort=price_asc");
  });
});
