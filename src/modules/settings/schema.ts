import { z } from "zod";

export const siteSettingsSchema = z.object({
  instituteName: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(160),
  about: z.string().trim().max(3000),
  email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().max(30),
  address: z.string().trim().max(500),
  openingHours: z.string().trim().max(200),
  socialLinks: z
    .object({
      instagram: z.string().max(250).default(""),
      linkedin: z.string().max(250).default(""),
      youtube: z.string().max(250).default(""),
    })
    .default({ instagram: "", linkedin: "", youtube: "" }),
  version: z.number().int().nonnegative().optional(),
});
