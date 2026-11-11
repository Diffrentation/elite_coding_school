import { Schema, model, models } from "mongoose";
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    emailVerifiedAt: { type: Date, default: null },
    accountStatus: { type: String, enum: ["pending", "active", "disabled"], default: "pending" },
    pendingName: { type: String, required: true },
    pendingPhone: { type: String, required: true },
    // Password accounts omit this optional field; sparse unique indexes do not
    // treat absent values as duplicates, unlike explicit null values.
    googleSubject: { type: String, unique: true, sparse: true },
  },
  { timestamps: true, versionKey: "version" },
);
export const User = models.User || model("User", userSchema);
