import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Counter } from "@/models/Counter";
import { Enrollment } from "@/models/Enrollment";
import { Payment } from "@/models/Payment";
import { Student } from "@/models/Student";
import { requireStudentSession } from "@/modules/identity/session";
import { receiptPdf } from "@/modules/receipt/pdf";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return new NextResponse("Payment not found", { status: 404 });

  await connectDb();
  try {
    const session = await requireStudentSession();
    const payment = await Payment.findById(id);
    if (!payment) return new NextResponse("Payment not found", { status: 404 });
    const enrollment = await Enrollment.findById(payment.enrollmentId);
    const student = enrollment ? await Student.findById(enrollment.studentId) : null;
    if (!enrollment || !student || String(student.userId) !== session.userId)
      return new NextResponse("Payment not found", { status: 404 });

    if (!payment.receiptNumber) {
      const counter = await Counter.findOneAndUpdate(
        { _id: "receiptNumber" },
        { $inc: { seq: 1 } },
        { upsert: true, new: true },
      );
      const number = `ECS-R${String(counter.seq).padStart(6, "0")}`;
      await Payment.updateOne({ _id: payment._id, receiptNumber: null }, { $set: { receiptNumber: number } });
      payment.receiptNumber = (await Payment.findById(payment._id))!.receiptNumber;
    }

    const pdf = await receiptPdf({
      receiptNumber: payment.receiptNumber!,
      amount: payment.amount,
      method: payment.method,
      paidAt: payment.paidAt,
      studentName: student.fullName,
      studentId: student.studentId,
      course: enrollment.courseTitleSnapshot,
    });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${payment.receiptNumber}.pdf"`,
      },
    });
  } catch {
    return new NextResponse("Student access is required", { status: 403 });
  }
}
