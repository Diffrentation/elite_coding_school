import { Schema, model, models } from "mongoose";
const otpSchema = new Schema(
  {
    purpose: { type: String, required: true },
    destination: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    codeHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ purpose: 1, destination: 1, consumedAt: 1 });
export const Otp = models.Otp || model("Otp", otpSchema);
