import { z } from "zod";

export const bannerSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(400).default(""),
  desktopImageUrl: z.url().nullable().optional(),
  mobileImageUrl: z.url().nullable().optional(),
  ctaLabel: z.string().trim().min(2).max(50).default("Explore courses"),
  ctaUrl: z.string().trim().min(1).max(250).default("/courses"),
  order: z.number().int().min(0).default(0),
  version: z.number().int().nonnegative().optional(),
});

export const bannerUpdateSchema = bannerSchema.extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
  version: z.number().int().nonnegative(),
});
