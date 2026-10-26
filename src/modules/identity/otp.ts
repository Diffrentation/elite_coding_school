import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Otp } from "@/models/Otp";
export async function issueOtp(userId: string, destination: string, purpose: string) {
  await Otp.deleteMany({ purpose, destination, consumedAt: null });
  const code = String(crypto.randomInt(100000, 1000000));
  await Otp.create({
    purpose,
    destination,
    userId,
    codeHash: await bcrypt.hash(code, 12),
    expiresAt: new Date(Date.now() + (Number(process.env.OTP_EXPIRY_MINUTES) || 10) * 60_000),
  });
  return code;
}
export async function consumeOtp(destination: string, purpose: string, code: string) {
  const record = await Otp.findOne({ destination, purpose, consumedAt: null })
    .sort({ createdAt: -1 })
    .select("+codeHash");
  if (!record || record.expiresAt < new Date()) return { ok: false as const, reason: "invalid" };
  if (record.attempts >= record.maxAttempts) return { ok: false as const, reason: "locked" };
  if (!(await bcrypt.compare(code, record.codeHash))) {
    await Otp.updateOne({ _id: record._id, consumedAt: null }, { $inc: { attempts: 1 } });
    return { ok: false as const, reason: "invalid" };
  }
  const consumed = await Otp.updateOne(
    { _id: record._id, consumedAt: null },
    { $set: { consumedAt: new Date() } },
  );
  return consumed.modifiedCount === 1
    ? { ok: true as const, userId: String(record.userId) }
    : { ok: false as const, reason: "used" };
}
