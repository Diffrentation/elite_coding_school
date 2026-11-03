import { z } from "zod";
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");
export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Course title must contain at least 3 characters.")
    .max(100, "Course title must not exceed 100 characters."),
  icon: z.string().trim().min(1).max(40).default("Code2"),
  slug,
  shortDescription: z
    .string()
    .trim()
    .min(10, "Short description must contain at least 10 characters.")
    .max(280, "Short description must not exceed 280 characters."),
  description: z
    .string()
    .trim()
    .min(20, "Detailed description must contain at least 20 characters.")
    .max(10000, "Detailed description must not exceed 10,000 characters."),
  category: z
    .string()
    .trim()
    .min(2, "Category must contain at least 2 characters.")
    .max(60, "Category must not exceed 60 characters."),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  durationMonths: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 month.")
    .max(60, "Duration cannot exceed 60 months."),
  monthlyFee: z
    .number()
    .int("Monthly fee must be a whole number.")
    .min(0, "Monthly fee cannot be negative.")
    .max(1_999, "Monthly fee must be below ₹2,000."),
  prerequisites: z.array(z.string().max(120)).default([]),
  skills: z.array(z.string().max(120)).default([]),
  syllabus: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1).max(160),
        order: z.number().int().min(0),
        topics: z.array(z.string().min(1).max(200)).max(30),
      }),
    )
    .max(50)
    .default([]),
  thumbnailUrl: z.url().nullable().optional(),
  heroImageUrl: z.url().nullable().optional(),
  isFeatured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  version: z.number().int().nonnegative().optional(),
});
