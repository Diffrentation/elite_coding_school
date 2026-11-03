import { describe, expect, it } from "vitest";
import { courseSchema } from "./schema";

describe("course validation", () => {
  const input = {
    title: "Full Stack Development",
    slug: "full-stack-development",
    shortDescription: "Practical offline web development program.",
    description: "A practical program covering frontend, backend, databases, deployment, and projects.",
    category: "Web development",
    level: "beginner" as const,
    durationMonths: 12,
    monthlyFee: 1900,
    prerequisites: [],
    skills: [],
    syllabus: [],
    isFeatured: false,
    order: 0,
  };
  it("accepts a publishable course input", () => {
    expect(courseSchema.parse(input).slug).toBe("full-stack-development");
  });
  it("rejects unsafe slugs", () => {
    expect(() => courseSchema.parse({ ...input, slug: "Full Stack!" })).toThrow();
  });
});
