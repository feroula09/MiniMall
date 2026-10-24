import { describe, expect, it } from "vitest";
import { orderListParamsSchema } from "../schemas";

describe("orderListParamsSchema", () => {
  it("defaults to all statuses, page 1", () => {
    expect(orderListParamsSchema.parse({})).toEqual({ status: undefined, page: 1 });
  });

  it("parses a valid status and page", () => {
    expect(orderListParamsSchema.parse({ status: "PAID", page: "2" })).toEqual({ status: "PAID", page: 2 });
  });

  it.each([{ status: "paid" }, { status: "DELETED" }, { page: "0" }, { page: "x" }])("falls back for %j", (raw) => {
    expect(orderListParamsSchema.parse(raw)).toEqual({ status: undefined, page: 1 });
  });
});
