import { model, models, Schema } from "mongoose";
const inquirySchema = new Schema(
  {
    fullName: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    interestedCourse: { type: String, default: "" },
    message: { type: String, default: "", maxlength: 2000 },
    type: { type: String, enum: ["admission", "demo"], required: true },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true },
);
inquirySchema.index({ status: 1, createdAt: -1 });
export const Inquiry = models.Inquiry || model("Inquiry", inquirySchema);
