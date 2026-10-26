import { z } from "zod";
export const inquirySchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/),
  interestedCourse: z.string().trim().max(100).default(""),
  message: z.string().trim().max(2000).default(""),
  type: z.enum(["admission", "demo"]),
});

export const inquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});
