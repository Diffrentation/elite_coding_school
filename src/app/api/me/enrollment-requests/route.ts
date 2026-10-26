import { audit } from "@/lib/audit";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Course } from "@/models/Course";
import { EnrollmentRequest } from "@/models/EnrollmentRequest";
import { Student } from "@/models/Student";
import { requireStudentSession } from "@/modules/identity/session";
import { z } from "zod";

const schema = z.object({ courseId: z.string().min(1) });

export async function GET() {
  await connectDb();
  try {
    const session = await requireStudentSession();
    const student = await Student.findOne({ userId: session.userId });
    if (!student) return failure("NOT_FOUND", "Student profile not found.", 404);
    const requests = await EnrollmentRequest.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .populate("courseId", "title slug durationMonths monthlyFee")
      .lean();
    return success({ requests });
  } catch {
    return failure("UNAUTHORIZED", "Log in as a student to continue.", 401);
  }
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Choose a valid course.", 422);
  await connectDb();
  try {
    const session = await requireStudentSession();
    const student = await Student.findOne({ userId: session.userId });
    const course = await Course.findOne({ _id: parsed.data.courseId, status: "published" });
    if (!student || !course) return failure("NOT_FOUND", "Published course not found.", 404);
    const existing = await EnrollmentRequest.findOne({
      studentId: student._id,
      courseId: course._id,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) return failure("CONFLICT", "You already have an enrollment request for this course.", 409);
    const enrollmentRequest = await EnrollmentRequest.create({
      studentId: student._id,
      courseId: course._id,
    });
    await Student.updateOne(
      { _id: student._id, admissionStatus: "not_enrolled" },
      { $set: { admissionStatus: "pending" } },
    );
    await audit("enrollment.requested", "enrollment_request", String(enrollmentRequest._id), session.userId, {
      courseId: String(course._id),
    });
    return success({ enrollmentRequest }, { status: 201 });
  } catch {
    return failure("UNAUTHORIZED", "Log in as a student to continue.", 401);
  }
}
