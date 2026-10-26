import { Schema, model, models } from "mongoose";
const studentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    studentId: { type: String, unique: true, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
    admissionStatus: { type: String, default: "not_enrolled" },
    dateOfBirth: Date,
    address: { line1: String, line2: String, city: String, state: String, postalCode: String },
    profileImageUrl: { type: String, default: null },
    profileImagePublicId: { type: String, default: null },
  },
  { timestamps: true, versionKey: "version" },
);
export const Student = models.Student || model("Student", studentSchema);
