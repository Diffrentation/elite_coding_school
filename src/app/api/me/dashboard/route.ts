import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Enrollment } from "@/models/Enrollment";
import { FeeInvoice } from "@/models/FeeInvoice";
import { StudentQuery } from "@/models/Query";
import { Student } from "@/models/Student";
import { requireStudentSession } from "@/modules/identity/session";

export async function GET() {
  await connectDb();
  try {
    const session = await requireStudentSession();
    const student = await Student.findOne({ userId: session.userId })
      .select("fullName studentId admissionStatus")
      .lean();
    if (!student) return failure("NOT_FOUND", "Student profile not found.", 404);

    const enrollments = await Enrollment.find({ studentId: student._id, status: "active" })
      .sort({ joiningDate: -1 })
      .limit(3)
      .lean();
    const enrollmentIds = enrollments.map((enrollment) => enrollment._id);
    const [feeSummary, openQueries] = await Promise.all([
      FeeInvoice.aggregate([
        { $match: { enrollmentId: { $in: enrollmentIds } } },
        { $group: { _id: null, remainingAmount: { $sum: "$remainingAmount" } } },
      ]),
      StudentQuery.countDocuments({ userId: session.userId, status: { $in: ["new", "answered"] } }),
    ]);

    return success({
      student,
      enrollments,
      outstandingFee: feeSummary[0]?.remainingAmount ?? 0,
      openQueries,
    });
  } catch {
    return failure("UNAUTHORIZED", "Log in as a student to continue.", 401);
  }
}
