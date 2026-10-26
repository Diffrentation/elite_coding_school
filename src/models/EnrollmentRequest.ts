import { model, models, Schema } from "mongoose";

const enrollmentRequestSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: "version" },
);

enrollmentRequestSchema.index({ studentId: 1, courseId: 1, status: 1 });

export const EnrollmentRequest =
  models.EnrollmentRequest || model("EnrollmentRequest", enrollmentRequestSchema);
