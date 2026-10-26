import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Course } from "@/models/Course";
import { StudentQuery } from "@/models/Query";
import { Student } from "@/models/Student";
import { requireAdminSession } from "@/modules/identity/session";

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const [students, activeCourses, openQueries, recentStudents, recentQueries] = await Promise.all([
      Student.countDocuments(),
      Course.countDocuments({ status: "published" }),
      StudentQuery.countDocuments({ status: { $in: ["new", "answered"] } }),
      Student.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("studentId fullName admissionStatus registrationDate")
        .lean(),
      StudentQuery.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("userId", "pendingName")
        .select("subject category status createdAt userId")
        .lean(),
    ]);
    return success({ metrics: { students, activeCourses, openQueries }, recentStudents, recentQueries });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
