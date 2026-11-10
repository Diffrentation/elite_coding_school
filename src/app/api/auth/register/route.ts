import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { registerSchema } from "@/modules/identity/schema";
import { User } from "@/models/User";
import { issueOtp } from "@/modules/identity/otp";
import { isEmailDeliveryConfigured, sendOtpEmail } from "@/modules/identity/mailer";
import { enforceRateLimit } from "@/lib/security";
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { name: "registration", limit: 5, windowMs: 15 * 60_000 });
  if (limited) return limited;
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Please correct the highlighted fields.", 422);
  if (!isEmailDeliveryConfigured())
    return failure(
      "EMAIL_UNAVAILABLE",
      "Email verification is temporarily unavailable. Please try again shortly.",
      503,
    );
  await connectDb();
  const input = parsed.data;
  const existing = await User.findOne({ email: input.email });
  if (existing?.accountStatus === "active")
    return success({ message: "If the account can be registered, a verification code will be sent." });
  const user =
    existing ??
    (await User.create({
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      pendingName: input.fullName,
      pendingPhone: input.phone,
    }));
  const code = await issueOtp(String(user._id), input.email, "email_verify");
  try {
    await sendOtpEmail(input.email, code, "verify");
  } catch {
    return failure(
      "EMAIL_UNAVAILABLE",
      "We could not send the verification code. Please try again shortly.",
      503,
    );
  }
  return success({ message: "Verification code sent." }, { status: 201 });
}
