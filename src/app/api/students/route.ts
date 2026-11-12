import { NextRequest } from "next/server";
import { success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { Student } from "@/models/Student";

export async function GET(request: NextRequest) {
  await connectDb();
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const course = request.nextUrl.searchParams.get("course")?.trim();
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(24, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 12));
  const studentFilter: Record<string, unknown> = { publicProfile: true };
  if (search) studentFilter.fullName = new RegExp(search, "i");
  const certificateFilter: Record<string, unknown> = { status: "active" };
  if (course) certificateFilter.courseNameSnapshot = course;
  const certificates = await Certificate.find(certificateFilter)
    .select("studentId courseNameSnapshot batchSnapshot completionDate")
    .lean();
  const certificateByStudent = new Map(certificates.map((entry) => [String(entry.studentId), entry]));
  studentFilter._id = { $in: [...certificateByStudent.keys()] };
  const [students, total] = await Promise.all([
    Student.find(studentFilter)
      .select("studentId fullName profileImageUrl publicPhotoConsent")
      .sort({ fullName: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Student.countDocuments(studentFilter),
  ]);
  const courses = [...new Set(certificates.map((entry) => entry.courseNameSnapshot))].sort();
  return success({
    students: students.map((student) => {
      const certificate = certificateByStudent.get(String(student._id));
      return {
        studentId: student.studentId,
        fullName: student.fullName,
        profileImageUrl: student.publicPhotoConsent ? student.profileImageUrl : null,
        courseName: certificate?.courseNameSnapshot,
        batch: certificate?.batchSnapshot,
        completionDate: certificate?.completionDate,
      };
    }),
    courses,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
