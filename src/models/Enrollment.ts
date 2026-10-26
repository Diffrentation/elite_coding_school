import { model, models, Schema } from "mongoose";

const enrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    courseTitleSnapshot: { type: String, required: true },
    agreedMonthlyFee: { type: Number, required: true, min: 0 },
    batch: { type: String, required: true, maxlength: 100 },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
  },
  { timestamps: true, versionKey: "version" },
);

enrollmentSchema.index({ studentId: 1, courseId: 1, status: 1 });
export const Enrollment = models.Enrollment || model("Enrollment", enrollmentSchema);
