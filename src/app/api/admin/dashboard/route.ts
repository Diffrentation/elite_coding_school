import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Course } from "@/models/Course";
import { Inquiry } from "@/models/Inquiry";
import { StudentQuery } from "@/models/Query";
import { Student } from "@/models/Student";
import { requireAdminSession } from "@/modules/identity/session";

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const [students, activeCourses, openQueries, newInquiries, recentStudents, recentQueries, recentInquiries] =
      await Promise.all([
        Student.countDocuments(),
        Course.countDocuments({ status: "published" }),
        StudentQuery.countDocuments({ status: { $in: ["new", "answered"] } }),
        Inquiry.countDocuments({ status: "new" }),
        Student.find()
          .sort({ createdAt: -1 })
          .limit(6)
          .select("studentId fullName admissionStatus registrationDate")
          .lean(),
        StudentQuery.find()
          .sort({ updatedAt: -1 })
          .limit(6)
          .populate("userId", "pendingName email")
          .select("subject category status createdAt userId")
          .lean(),
        Inquiry.find()
          .sort({ createdAt: -1 })
          .limit(4)
          .select("fullName phone type interestedCourse status createdAt")
          .lean(),
      ]);

    return success({
      metrics: {
        students,
        activeCourses,
        openQueries,
        newInquiries,
      },
      recentStudents,
      recentQueries,
      recentInquiries,
    });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
