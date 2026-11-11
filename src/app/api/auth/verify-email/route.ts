import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { otpSchema } from "@/modules/identity/schema";
import { consumeOtp } from "@/modules/identity/otp";
import { User } from "@/models/User";
import { Counter } from "@/models/Counter";
import { Student } from "@/models/Student";
import { createSession, sessionCookie } from "@/modules/identity/session";
import mongoose from "mongoose";
import { enforceRateLimit } from "@/lib/security";
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { name: "email-verification", limit: 10, windowMs: 15 * 60_000 });
  if (limited) return limited;
  const parsed = otpSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Enter the six-digit code.", 422);
  await connectDb();
  const check = await consumeOtp(parsed.data.email, "email_verify", parsed.data.code);
  if (!check.ok) return failure("OTP_INVALID", "This code is invalid, expired, or already used.", 400);
  const tx = await mongoose.startSession();
  let userId = check.userId;
  try {
    await tx.withTransaction(async () => {
      const user = await User.findOneAndUpdate(
        { _id: check.userId, accountStatus: "pending" },
        { $set: { accountStatus: "active", emailVerifiedAt: new Date() } },
        { new: true, session: tx },
      );
      if (!user) return;
      const existing = await Student.findOne({ userId: user._id }).session(tx);
      if (!existing) {
        const counter = await Counter.findOneAndUpdate(
          { _id: "studentId" },
          { $inc: { seq: 1 } },
          { upsert: true, new: true, session: tx },
        );
        await Student.create(
          [
            {
              userId: user._id,
              studentId: `ECS${String(counter.seq).padStart(6, "0")}`,
              fullName: user.pendingName,
              email: user.email,
              phone: user.pendingPhone,
            },
          ],
          { session: tx },
        );
      }
      userId = String(user._id);
    });
  } finally {
    await tx.endSession();
  }
  const { token } = await createSession(userId, "student");
  const response = success({ message: "Email verified successfully." });
  response.cookies.set(sessionCookie(token));
  return response;
}
