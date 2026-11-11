import { z } from "zod";
import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { enforceRateLimit } from "@/lib/security";
import { User } from "@/models/User";
import { issueOtp } from "@/modules/identity/otp";
import { isEmailDeliveryConfigured, sendOtpEmail } from "@/modules/identity/mailer";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { name: "verification-resend", limit: 3, windowMs: 15 * 60_000 });
  if (limited) return limited;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Enter a valid email address.", 422);
  if (!isEmailDeliveryConfigured())
    return failure("EMAIL_UNAVAILABLE", "Email verification is temporarily unavailable. Please try again shortly.", 503);

  await connectDb();
  const user = await User.findOne({ email: parsed.data.email, accountStatus: "pending" });
  // Keep this response non-enumerating while still allowing a real pending account
  // to receive a fresh single-use code.
  if (!user) return success({ message: "If a pending account exists, a new verification code has been sent." });
  try {
    const code = await issueOtp(String(user._id), user.email, "email_verify");
    await sendOtpEmail(user.email, code, "verify");
    return success({ message: "A new verification code has been sent. Previous codes no longer work." });
  } catch {
    return failure("EMAIL_UNAVAILABLE", "We could not send a verification code. Please try again shortly.", 503);
  }
}
