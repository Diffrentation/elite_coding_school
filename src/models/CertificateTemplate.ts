import { model, models, Schema } from "mongoose";

const certificateTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    imageUrl: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: "version" },
);

export const CertificateTemplate =
  models.CertificateTemplate || model("CertificateTemplate", certificateTemplateSchema);
