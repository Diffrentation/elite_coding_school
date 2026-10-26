import { z } from "zod";
import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { getSession } from "@/modules/identity/session";
import { User } from "@/models/User";
import { issueOtp, consumeOtp } from "@/modules/identity/otp";
import { sendOtpEmail } from "@/modules/identity/mailer";
const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});
export async function POST(request: Request) {
  const parsed = emailSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Enter a valid email address.", 422);
  await connectDb();
  const session = await getSession();
  if (!session || session.role !== "student")
    return failure("UNAUTHORIZED", "Log in as a student to continue.", 401);
  const user = await User.findById(session.userId);
  if (!user) return failure("UNAUTHORIZED", "Log in to continue.", 401);
  if (!parsed.data.code) {
    if (await User.exists({ email: parsed.data.email, _id: { $ne: user._id } }))
      return failure("CONFLICT", "This email is already in use.", 409);
    const code = await issueOtp(String(user._id), parsed.data.email, "email_change");
    await sendOtpEmail(parsed.data.email, code, "verify").catch(() => undefined);
    return success({ message: "A verification code has been sent to your new email." });
  }
  const verified = await consumeOtp(parsed.data.email, "email_change", parsed.data.code);
  if (!verified.ok || verified.userId !== String(user._id))
    return failure("OTP_INVALID", "This code is invalid, expired, or already used.", 400);
  try {
    await User.updateOne(
      { _id: user._id },
      { $set: { email: parsed.data.email, emailVerifiedAt: new Date() } },
    );
    return success({ message: "Email address updated." });
  } catch {
    return failure("CONFLICT", "This email is already in use.", 409);
  }
}
