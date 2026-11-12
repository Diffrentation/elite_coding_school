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
  let admin: Awaited<ReturnType<typeof requireAdminSession>>;
  try {
    admin = await requireAdminSession();
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
  try {
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
          // Mongoose 9 requires this explicit flag for aggregation-pipeline
          // updates. The pipeline keeps the balance check and decrement atomic.
          { new: true, session, updatePipeline: true },
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
    console.error("Payment recording failed", error);
    if (error instanceof Error && error.message === "BALANCE_CHANGED")
      return failure("CONFLICT", "Fee balance changed. Refresh and try again.", 409);
    if (error instanceof Error && /duplicate key/i.test(error.message))
      return failure("CONFLICT", "This payment was already submitted. Refresh the payment list before trying again.", 409);
    return failure("PAYMENT_FAILED", "The payment could not be recorded. Please retry; if it continues, check the deployment logs.", 500);
  }
}
