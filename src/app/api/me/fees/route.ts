import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Enrollment } from "@/models/Enrollment";
import { FeeInvoice } from "@/models/FeeInvoice";
import { Payment } from "@/models/Payment";
import { Student } from "@/models/Student";
import { requireStudentSession } from "@/modules/identity/session";

export async function GET() {
  await connectDb();
  try {
    const session = await requireStudentSession();
    const student = await Student.findOne({ userId: session.userId }).select("_id").lean();
    if (!student) return failure("NOT_FOUND", "Student profile not found.", 404);

    const enrollments = await Enrollment.find({ studentId: student._id })
      .select("_id courseTitleSnapshot status")
      .lean();
    const enrollmentIds = enrollments.map((enrollment) => enrollment._id);
    const courseByEnrollment = new Map(
      enrollments.map((enrollment) => [String(enrollment._id), enrollment.courseTitleSnapshot]),
    );
    const [invoices, payments] = await Promise.all([
      FeeInvoice.find({ enrollmentId: { $in: enrollmentIds } })
        .sort({ month: -1 })
        .lean(),
      Payment.find({ enrollmentId: { $in: enrollmentIds } })
        .sort({ paidAt: -1 })
        .lean(),
    ]);

    return success({
      invoices: invoices.map((invoice) => ({
        ...invoice,
        courseTitle: courseByEnrollment.get(String(invoice.enrollmentId)) ?? "Course",
      })),
      payments: payments.map((payment) => ({
        ...payment,
        courseTitle: courseByEnrollment.get(String(payment.enrollmentId)) ?? "Course",
      })),
    });
  } catch {
    return failure("UNAUTHORIZED", "Log in as a student to continue.", 401);
  }
}
