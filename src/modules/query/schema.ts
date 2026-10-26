import { z } from "zod";

export const createQuerySchema = z.object({
  category: z.string().trim().min(2).max(60),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(5).max(4000),
});
export const replySchema = z.object({
  message: z.string().trim().min(1).max(4000),
  status: z.enum(["new", "answered", "closed"]).optional(),
});
