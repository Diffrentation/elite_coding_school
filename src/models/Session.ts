import { Schema, model, models } from "mongoose";
const sessionSchema = new Schema(
  {
    sessionId: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Session = models.Session || model("Session", sessionSchema);
