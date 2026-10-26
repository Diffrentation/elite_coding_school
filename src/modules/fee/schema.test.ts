import { describe, expect, it } from "vitest";
import { paymentSchema } from "./schema";

describe("payment input validation", () => {
  it("accepts a positive idempotent UPI payment", () => {
    expect(
      paymentSchema.parse({
        invoiceId: "507f1f77bcf86cd799439011",
        amount: 2000,
        method: "upi",
        idempotencyKey: "7a2b08e5-a64c-45b2-8fb2-e6b97832ae06",
      }).amount,
    ).toBe(2000);
  });
  it("rejects negative or zero payments", () => {
    expect(() =>
      paymentSchema.parse({
        invoiceId: "invoice",
        amount: 0,
        method: "cash",
        idempotencyKey: "7a2b08e5-a64c-45b2-8fb2-e6b97832ae06",
      }),
    ).toThrow();
  });
});
