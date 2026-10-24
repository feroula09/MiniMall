import type { OrderStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { canTransition, nextStatus, transitionUpdate, type OrderAction, type OrderActor } from "../order-status";

const ALL: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

// 完整的允許轉換表，其餘組合一律禁止
const allowed: [OrderStatus, OrderAction, OrderActor, OrderStatus][] = [
  ["PENDING", "pay", "user", "PAID"],
  ["PAID", "ship", "admin", "SHIPPED"],
  ["SHIPPED", "confirm", "user", "COMPLETED"],
  ["PENDING", "cancel", "user", "CANCELLED"],
  ["PENDING", "cancel", "admin", "CANCELLED"],
  ["PAID", "cancel", "user", "CANCELLED"],
  ["PAID", "cancel", "admin", "CANCELLED"],
];

describe("order state machine", () => {
  it.each(allowed)("%s --%s(%s)--> %s", (from, action, actor, to) => {
    expect(nextStatus(from, action, actor)).toBe(to);
  });

  it("rejects every other combination", () => {
    const actions: OrderAction[] = ["pay", "ship", "confirm", "cancel"];
    const actors: OrderActor[] = ["user", "admin"];
    for (const from of ALL)
      for (const action of actions)
        for (const actor of actors) {
          const isAllowed = allowed.some(([f, a, r]) => f === from && a === action && r === actor);
          expect(canTransition(from, action, actor), `${from} ${action} ${actor}`).toBe(isAllowed);
        }
  });

  it("does not let users ship or admins pay/confirm", () => {
    expect(canTransition("PAID", "ship", "user")).toBe(false);
    expect(canTransition("PENDING", "pay", "admin")).toBe(false);
    expect(canTransition("SHIPPED", "confirm", "admin")).toBe(false);
  });

  it("does not allow cancelling after shipment", () => {
    expect(canTransition("SHIPPED", "cancel", "user")).toBe(false);
    expect(canTransition("SHIPPED", "cancel", "admin")).toBe(false);
  });
});

describe("transitionUpdate", () => {
  const now = new Date("2026-10-25T00:00:00Z");

  it("builds a conditional update with the right timestamp", () => {
    expect(transitionUpdate("pay", "user", now)).toEqual({
      where: { status: { in: ["PENDING"] } },
      data: { status: "PAID", paidAt: now },
    });
    expect(transitionUpdate("cancel", "admin", now)).toEqual({
      where: { status: { in: ["PENDING", "PAID"] } },
      data: { status: "CANCELLED", cancelledAt: now },
    });
  });

  it.each([
    ["ship", "user"],
    ["pay", "admin"],
    ["confirm", "admin"],
  ] as const)("throws when %s is attempted by %s", (action, actor) => {
    expect(() => transitionUpdate(action, actor, now)).toThrow();
  });
});
