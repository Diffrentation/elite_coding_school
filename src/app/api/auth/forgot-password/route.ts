import { connectDb } from "@/lib/db";
import { success } from "@/lib/api";
import { forgotPasswordSchema } from "@/modules/identity/schema";
import { User } from "@/models/User";
import { issueOtp } from "@/modules/identity/otp";
import { sendOtpEmail } from "@/modules/identity/mailer";
import { enforceRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    name: "password-reset-request",
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;
  const parsed = forgotPasswordSchema.safeParse(await request.json());
  if (!parsed.success)
    return success({ message: "If an eligible account exists, a reset code will be sent." });
  await connectDb();
  const user = await User.findOne({ email: parsed.data.email, accountStatus: "active" });
  if (user) {
    const code = await issueOtp(String(user._id), user.email, "password_reset");
    await sendOtpEmail(user.email, code, "reset").catch(() => undefined);
  }
  return success({ message: "If an eligible account exists, a reset code will be sent." });
}
