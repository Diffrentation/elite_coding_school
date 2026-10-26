import { describe, expect, it } from "vitest";
import { inquirySchema, inquiryStatusSchema } from "./schema";

describe("inquiry schema", () => {
  it("normalizes a valid public inquiry", () => {
    const parsed = inquirySchema.parse({
      fullName: "  Ada Lovelace ",
      email: " ADA@EXAMPLE.COM ",
      phone: "9876543210",
      interestedCourse: " Full Stack Development ",
      message: " Please contact me. ",
      type: "admission",
    });

    expect(parsed).toMatchObject({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      interestedCourse: "Full Stack Development",
      message: "Please contact me.",
    });
  });

  it("allows only defined lead-management states", () => {
    expect(inquiryStatusSchema.safeParse({ status: "contacted" }).success).toBe(true);
    expect(inquiryStatusSchema.safeParse({ status: "archived" }).success).toBe(false);
  });
});
