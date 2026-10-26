import { model, models, Schema } from "mongoose";
const paymentSchema = new Schema(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "FeeInvoice", required: true, index: true },
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true },
    amount: { type: Number, required: true, min: 1 },
    method: { type: String, enum: ["cash", "upi", "bank"], required: true },
    paidAt: { type: Date, default: Date.now },
    idempotencyKey: { type: String, required: true, unique: true },
    receiptNumber: { type: String, unique: true, sparse: true, default: null },
  },
  { timestamps: true },
);
export const Payment = models.Payment || model("Payment", paymentSchema);
