import { describe, expect, it } from "vitest";
import { registerSchema } from "./schema";

describe("student registration validation", () => {
  const valid = {
    fullName: "Rahul Sharma",
    email: "RAHUL@example.com ",
    phone: "9876543210",
    password: "secure-password",
    confirmPassword: "secure-password",
    acceptedTerms: true as const,
  };
  it("normalizes email and accepts a valid Indian mobile number", () => {
    const result = registerSchema.parse(valid);
    expect(result.email).toBe("rahul@example.com");
  });
  it("rejects a password confirmation mismatch", () => {
    expect(() => registerSchema.parse({ ...valid, confirmPassword: "different-password" })).toThrow();
  });
  it("rejects registration without terms acceptance", () => {
    expect(() => registerSchema.parse({ ...valid, acceptedTerms: false })).toThrow();
  });
});
