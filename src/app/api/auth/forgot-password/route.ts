import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { forgotPasswordSchema } from "@/modules/identity/schema";
import { User } from "@/models/User";
import { issueOtp } from "@/modules/identity/otp";
import { isEmailDeliveryConfigured, sendOtpEmail } from "@/modules/identity/mailer";
import { enforceRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    name: "password-reset-request",
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;
  if (!isEmailDeliveryConfigured())
    return failure(
      "EMAIL_UNAVAILABLE",
      "Password reset email is temporarily unavailable. Please try again shortly.",
      503,
    );
  const parsed = forgotPasswordSchema.safeParse(await request.json());
  if (!parsed.success)
    return success({ message: "If an eligible account exists, a reset code will be sent." });
  await connectDb();
  const user = await User.findOne({ email: parsed.data.email, accountStatus: "active" });
  if (user) {
    const code = await issueOtp(String(user._id), user.email, "password_reset");
    try {
      await sendOtpEmail(user.email, code, "reset");
    } catch {
      return failure(
        "EMAIL_UNAVAILABLE",
        "Password reset email is temporarily unavailable. Please try again shortly.",
        503,
      );
    }
  }
  return success({ message: "If an eligible account exists, a reset code will be sent." });
}
