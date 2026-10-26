import { z } from "zod";
export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().int().positive(),
  method: z.enum(["cash", "upi", "bank"]),
  idempotencyKey: z.string().uuid(),
});
