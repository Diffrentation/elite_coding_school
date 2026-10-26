import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { resetPasswordSchema } from "@/modules/identity/schema";
import { consumeOtp } from "@/modules/identity/otp";
import { User } from "@/models/User";
import { Session } from "@/models/Session";
import { enforceRateLimit } from "@/lib/security";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { name: "password-reset", limit: 10, windowMs: 15 * 60_000 });
  if (limited) return limited;
  const parsed = resetPasswordSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Please correct the password details.", 422);
  await connectDb();
  const verified = await consumeOtp(parsed.data.email, "password_reset", parsed.data.code);
  if (!verified.ok) return failure("OTP_INVALID", "This code is invalid, expired, or already used.", 400);
  const user = await User.findOneAndUpdate(
    { _id: verified.userId, email: parsed.data.email, accountStatus: "active" },
    { $set: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } },
  );
  if (!user) return failure("INVALID_REQUEST", "Unable to reset this password.", 400);
  await Session.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  return success({ message: "Password reset. Please log in again." });
}
