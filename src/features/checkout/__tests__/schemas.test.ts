import { describe, expect, it } from "vitest";
import { z } from "zod";
import { checkoutSchema } from "../schemas";

const valid = { receiverName: " 王小明 ", phone: "0912-345 678", address: " 台北市信義區市府路 1 號 " };
const errorsOf = (input: unknown) => {
  const r = checkoutSchema.safeParse(input);
  return r.success ? {} : z.flattenError(r.error).fieldErrors;
};

describe("checkoutSchema", () => {
  it("trims and normalizes the phone number", () => {
    expect(checkoutSchema.parse(valid)).toEqual({
      receiverName: "王小明",
      phone: "0912345678",
      address: "台北市信義區市府路 1 號",
    });
  });

  it.each(["", "0812345678", "091234567", "09123456789", "+886912345678", "09-1234-567a"])(
    "rejects phone %j",
    (phone) => {
      expect(errorsOf({ ...valid, phone })).toHaveProperty("phone");
    },
  );

  it("requires a receiver and a reasonable address", () => {
    expect(errorsOf({ ...valid, receiverName: "  " })).toHaveProperty("receiverName");
    expect(errorsOf({ ...valid, address: "台北" })).toHaveProperty("address");
    expect(errorsOf({ ...valid, address: "a".repeat(201) })).toHaveProperty("address");
  });
});
