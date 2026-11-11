import { model, models, Schema } from "mongoose";

const sequenceSchema = new Schema(
  { year: { type: Number, required: true, unique: true }, value: { type: Number, required: true, default: 0 } },
  { timestamps: true },
);

export const CertificateSequence = models.CertificateSequence || model("CertificateSequence", sequenceSchema);
