import { z } from "zod";
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/, "Use a valid Indian mobile number"),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
    acceptedTerms: z.literal(true),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export const otpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().regex(/^\d{6}$/),
});
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});
export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export const resetPasswordSchema = otpSchema
  .extend({ password: z.string().min(8).max(128), confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
