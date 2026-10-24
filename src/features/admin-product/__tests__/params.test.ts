import { describe, expect, it } from "vitest";
import { buildAdminProductsHref, parseAdminProductParams } from "../params";

describe("parseAdminProductParams", () => {
  it("parses valid params", () => {
    expect(parseAdminProductParams({ q: " 壺 ", category: "home", active: "false", page: "3" })).toEqual({
      q: "壺",
      category: "home",
      active: "false",
      page: 3,
    });
  });

  it("falls back to defaults for invalid or empty values", () => {
    expect(parseAdminProductParams({ q: " ", category: "Bad Slug", active: "yes", page: "-2" })).toEqual({
      q: undefined,
      category: undefined,
      active: undefined,
      page: 1,
    });
  });

  it("takes the first of repeated params", () => {
    expect(parseAdminProductParams({ active: ["true", "false"] }).active).toBe("true");
  });
});

describe("buildAdminProductsHref", () => {
  it("omits defaults", () => {
    expect(buildAdminProductsHref({ page: 1 })).toBe("/admin/products");
  });

  it("keeps filters and overrides the page", () => {
    expect(buildAdminProductsHref({ q: "壺", category: "home", active: "true", page: 1 }, { page: 2 })).toBe(
      "/admin/products?q=%E5%A3%BA&category=home&active=true&page=2",
    );
  });
});
