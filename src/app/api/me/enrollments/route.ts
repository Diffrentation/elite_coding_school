import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Enrollment } from "@/models/Enrollment";
import { Student } from "@/models/Student";
import { requireStudentSession } from "@/modules/identity/session";
export async function GET() {
  await connectDb();
  try {
    const session = await requireStudentSession();
    const student = await Student.findOne({ userId: session.userId });
    if (!student) return failure("NOT_FOUND", "Student profile not found.", 404);
    return success({
      enrollments: await Enrollment.find({ studentId: student._id }).sort({ joiningDate: -1 }).lean(),
    });
  } catch {
    return failure("UNAUTHORIZED", "Log in as a student to continue.", 401);
  }
}
