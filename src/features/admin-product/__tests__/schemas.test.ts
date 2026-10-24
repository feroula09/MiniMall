import { describe, expect, it } from "vitest";
import { z } from "zod";
import { productSchema } from "../schemas";

const valid = {
  name: " 手沖壺 ",
  description: " 不鏽鋼 ",
  price: "1299.5",
  stock: "12",
  categoryId: "cm1abc",
  isActive: true,
};

const errorsOf = (override: Partial<Record<keyof typeof valid, unknown>>) => {
  const r = productSchema.safeParse({ ...valid, ...override });
  return r.success ? {} : z.flattenError(r.error).fieldErrors;
};

describe("productSchema", () => {
  it("normalizes input and converts the price to cents", () => {
    expect(productSchema.parse(valid)).toEqual({
      name: "手沖壺",
      description: "不鏽鋼",
      price: 129950,
      stock: 12,
      categoryId: "cm1abc",
      isActive: true,
    });
  });

  it("allows an empty description and zero stock", () => {
    expect(productSchema.parse({ ...valid, description: "", stock: "0" })).toMatchObject({ description: "", stock: 0 });
  });

  it.each(["", "0", "0.00", "-1", "1.234", "abc", "1e3", "1000000.01"])("rejects price %j", (price) => {
    expect(errorsOf({ price })).toHaveProperty("price");
  });

  it("accepts the maximum price", () => {
    expect(productSchema.parse({ ...valid, price: "1000000" }).price).toBe(100_000_000);
  });

  it.each(["", "-1", "1.5", "1e3", "0x10", "100000", "abc"])("rejects stock %j", (stock) => {
    expect(errorsOf({ stock })).toHaveProperty("stock");
  });

  it.each(["", "../x", "a b"])("rejects categoryId %j", (categoryId) => {
    expect(errorsOf({ categoryId })).toHaveProperty("categoryId");
  });

  it("limits name and description length", () => {
    expect(errorsOf({ name: " " })).toHaveProperty("name");
    expect(errorsOf({ name: "名".repeat(101) })).toHaveProperty("name");
    expect(errorsOf({ description: "字".repeat(2001) })).toHaveProperty("description");
  });
});
