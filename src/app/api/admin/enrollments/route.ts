import mongoose from "mongoose";
import { audit } from "@/lib/audit";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { Student } from "@/models/Student";
import { requireAdminSession } from "@/modules/identity/session";
import { enrollmentSchema } from "@/modules/enrollment/schema";

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const enrollments = await Enrollment.find()
      .sort({ joiningDate: -1 })
      .populate("studentId", "fullName studentId")
      .populate("courseId", "title")
      .lean();
    return success({ enrollments });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = enrollmentSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Please provide valid admission details.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const session = await mongoose.startSession();
    let enrollmentId = "";
    try {
      await session.withTransaction(async () => {
        const student = await Student.findById(parsed.data.studentId).session(session);
        const course = await Course.findOne({ _id: parsed.data.courseId, status: "published" }).session(
          session,
        );
        if (!student || !course) throw new Error("NOT_FOUND");
        const existing = await Enrollment.exists({
          studentId: student._id,
          courseId: course._id,
          status: "active",
        }).session(session);
        if (existing) throw new Error("ALREADY_ENROLLED");
        const [enrollment] = await Enrollment.create(
          [
            {
              studentId: student._id,
              courseId: course._id,
              courseTitleSnapshot: course.title,
              agreedMonthlyFee: parsed.data.agreedMonthlyFee ?? course.monthlyFee,
              batch: parsed.data.batch,
              joiningDate: new Date(parsed.data.joiningDate),
            },
          ],
          { session },
        );
        enrollmentId = String(enrollment._id);
        await Student.updateOne({ _id: student._id }, { $set: { admissionStatus: "enrolled" } }, { session });
      });
    } finally {
      await session.endSession();
    }
    if (!enrollmentId) throw new Error("ENROLLMENT_NOT_CREATED");
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) throw new Error("ENROLLMENT_NOT_CREATED");
    await audit("enrollment.created", "enrollment", enrollmentId, admin.userId, {
      studentId: parsed.data.studentId,
      courseId: parsed.data.courseId,
    });
    return success({ enrollment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND")
      return failure("NOT_FOUND", "Student or published course not found.", 404);
    if (error instanceof Error && error.message === "ALREADY_ENROLLED")
      return failure("CONFLICT", "This student is already actively enrolled in that course.", 409);
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
