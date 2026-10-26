import { describe, expect, it } from "vitest";
import { bannerUpdateSchema } from "./schema";

describe("banner update schema", () => {
  const validBanner = {
    title: "Full Stack Development",
    description: "Learn through projects.",
    desktopImageUrl: null,
    mobileImageUrl: null,
    ctaLabel: "Explore course",
    ctaUrl: "/courses/full-stack-development",
    order: 1,
    status: "draft",
    version: 2,
  };

  it("accepts an optimistic version and supported banner state", () => {
    expect(bannerUpdateSchema.safeParse(validBanner).success).toBe(true);
  });

  it("rejects unknown lifecycle states", () => {
    expect(bannerUpdateSchema.safeParse({ ...validBanner, status: "deleted" }).success).toBe(false);
  });
});
