import { Schema, model, models } from "mongoose";
const studentSchema = new Schema(
  {
    // Omit absent values (rather than writing null) so the sparse unique index
    // supports many manually added students without portal accounts.
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    studentId: { type: String, unique: true, required: true },
    fullName: { type: String, required: true },
    // Kept on the private student record so administrators can manage
    // walk-in students who do not yet have a portal account. Public APIs
    // intentionally never select or return this value.
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    phone: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
    admissionStatus: { type: String, default: "not_enrolled" },
    dateOfBirth: Date,
    address: { line1: String, line2: String, city: String, state: String, postalCode: String },
    profileImageUrl: { type: String, default: null },
    profileImagePublicId: { type: String, default: null },
    completionDate: { type: Date, default: null },
    publicProfile: { type: Boolean, default: false, index: true },
    publicPhotoConsent: { type: Boolean, default: false },
    additionalInfo: { type: String, default: "", maxlength: 2000 },
  },
  { timestamps: true, versionKey: "version" },
);
export const Student = models.Student || model("Student", studentSchema);
