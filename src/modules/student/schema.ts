import { z } from "zod";
export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/),
  dateOfBirth: z.string().date().optional().nullable(),
  address: z
    .object({
      line1: z.string().max(120).optional(),
      line2: z.string().max(120).optional(),
      city: z.string().max(60).optional(),
      state: z.string().max(60).optional(),
      postalCode: z.string().max(12).optional(),
    })
    .optional(),
  version: z.number().int().nonnegative(),
});
