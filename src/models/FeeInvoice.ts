import { model, models, Schema } from "mongoose";
const feeInvoiceSchema = new Schema(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true, index: true },
    month: { type: String, required: true },
    dueAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "partial", "paid"], default: "pending" },
  },
  { timestamps: true, versionKey: "version" },
);
feeInvoiceSchema.index({ enrollmentId: 1, month: 1 }, { unique: true });
export const FeeInvoice = models.FeeInvoice || model("FeeInvoice", feeInvoiceSchema);
