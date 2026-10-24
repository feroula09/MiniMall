import { describe, expect, it } from "vitest";
import { z } from "zod";
import { categorySchema } from "../schemas";

const errorsOf = (input: unknown) => {
  const r = categorySchema.safeParse(input);
  return r.success ? {} : z.flattenError(r.error).fieldErrors;
};

describe("categorySchema", () => {
  it("normalizes input", () => {
    expect(categorySchema.parse({ name: " 戶外用品 ", slug: " Outdoor-Gear ", sortOrder: "6" })).toEqual({
      name: "戶外用品",
      slug: "outdoor-gear",
      sortOrder: 6,
    });
  });

  it.each(["", "with space", "中文", "-lead", "trail-", "double--dash", "under_score"])("rejects slug %j", (slug) => {
    expect(errorsOf({ name: "x", slug, sortOrder: 0 })).toHaveProperty("slug");
  });

  it.each(["abc", "-1", "1.5", "10000", "0x10", "0b11", "1e3", "Infinity"])("rejects sortOrder %j", (sortOrder) => {
    expect(errorsOf({ name: "x", slug: "x", sortOrder })).toHaveProperty("sortOrder");
  });

  it("treats an empty sortOrder as 0", () => {
    expect(categorySchema.parse({ name: "x", slug: "x", sortOrder: " " }).sortOrder).toBe(0);
  });

  it("limits the name length", () => {
    expect(errorsOf({ name: "名".repeat(21), slug: "x", sortOrder: 0 })).toHaveProperty("name");
  });
});
