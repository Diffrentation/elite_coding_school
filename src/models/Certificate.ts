import { model, models, Schema } from "mongoose";

const certificateSchema = new Schema(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true, unique: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    studentNameSnapshot: { type: String, required: true, trim: true },
    courseNameSnapshot: { type: String, required: true, trim: true },
    batchSnapshot: { type: String, required: true, trim: true },
    joiningDateSnapshot: { type: Date, required: true },
    completionDate: { type: Date, required: true },
    issueDate: { type: Date, required: true },
    verificationPath: { type: String, required: true, unique: true },
    templateUrl: { type: String, required: true },
    status: { type: String, enum: ["active", "revoked"], default: "active", index: true },
    revokedAt: { type: Date, default: null },
    revokedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    revocationReason: { type: String, default: null, maxlength: 500 },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: "version" },
);

certificateSchema.index({ status: 1, issueDate: -1 });
export const Certificate = models.Certificate || model("Certificate", certificateSchema);
