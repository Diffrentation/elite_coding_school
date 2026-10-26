import mongoose from "mongoose";
import { failure, success } from "@/lib/api";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";
import { FeeInvoice } from "@/models/FeeInvoice";
import { Payment } from "@/models/Payment";
import { requireAdminSession } from "@/modules/identity/session";
import { paymentSchema } from "@/modules/fee/schema";

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const payments = await Payment.find()
      .sort({ paidAt: -1 })
      .populate({ path: "enrollmentId", populate: { path: "studentId", select: "fullName studentId" } })
      .lean();
    return success({ payments });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = paymentSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Provide a valid payment.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const prior = await Payment.findOne({ idempotencyKey: parsed.data.idempotencyKey });
    if (prior) return success({ payment: prior, replayed: true });
    const session = await mongoose.startSession();
    let paymentId = "";
    try {
      await session.withTransaction(async () => {
        const invoice = await FeeInvoice.findOneAndUpdate(
          { _id: parsed.data.invoiceId, remainingAmount: { $gte: parsed.data.amount } },
          [
            {
              $set: {
                paidAmount: { $add: ["$paidAmount", parsed.data.amount] },
                remainingAmount: { $subtract: ["$remainingAmount", parsed.data.amount] },
              },
            },
            { $set: { status: { $cond: [{ $eq: ["$remainingAmount", 0] }, "paid", "partial"] } } },
          ],
          { new: true, session },
        );
        if (!invoice) throw new Error("BALANCE_CHANGED");
        const [payment] = await Payment.create(
          [
            {
              invoiceId: invoice._id,
              enrollmentId: invoice.enrollmentId,
              amount: parsed.data.amount,
              method: parsed.data.method,
              idempotencyKey: parsed.data.idempotencyKey,
            },
          ],
          { session },
        );
        paymentId = String(payment._id);
      });
    } finally {
      await session.endSession();
    }
    if (!paymentId) throw new Error("PAYMENT_NOT_CREATED");
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("PAYMENT_NOT_CREATED");
    await audit("payment.recorded", "payment", String(payment._id), admin.userId, {
      invoiceId: parsed.data.invoiceId,
      amount: parsed.data.amount,
      method: parsed.data.method,
    });
    return success({ payment }, { status: 201 });
  } catch (error) {
    return error instanceof Error && error.message === "BALANCE_CHANGED"
      ? failure("CONFLICT", "Fee balance changed. Refresh and try again.", 409)
      : failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
