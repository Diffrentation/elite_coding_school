import { z } from "zod";
export const enrollmentSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  batch: z.string().trim().min(2).max(100),
  joiningDate: z.string().date(),
  agreedMonthlyFee: z.number().int().min(0).optional(),
});
