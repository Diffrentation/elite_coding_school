import mongoose from "mongoose";
import { audit } from "@/lib/audit";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import { EnrollmentRequest } from "@/models/EnrollmentRequest";
import { Student } from "@/models/Student";
import { requireAdminSession } from "@/modules/identity/session";
import { z } from "zod";

const schema = z.object({ action: z.enum(["approve", "reject"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await request.json());
  const { id } = await params;
  if (!parsed.success || !mongoose.isValidObjectId(id))
    return failure("VALIDATION_ERROR", "Invalid request action.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const enrollmentRequest = await EnrollmentRequest.findById(id);
    if (!enrollmentRequest || enrollmentRequest.status !== "pending")
      return failure("CONFLICT", "This request is no longer pending.", 409);
    if (parsed.data.action === "reject") {
      enrollmentRequest.status = "rejected";
      enrollmentRequest.reviewedBy = admin.userId;
      enrollmentRequest.reviewedAt = new Date();
      await enrollmentRequest.save();
      return success({ enrollmentRequest });
    }
    const [student, course] = await Promise.all([
      Student.findById(enrollmentRequest.studentId),
      Course.findById(enrollmentRequest.courseId),
    ]);
    if (!student || !course || course.status !== "published")
      return failure("NOT_FOUND", "Student or published course not found.", 404);
    const existing = await Enrollment.exists({
      studentId: student._id,
      courseId: course._id,
      status: "active",
    });
    if (existing) return failure("CONFLICT", "Student is already enrolled in this course.", 409);
    const enrollment = await Enrollment.create({
      studentId: student._id,
      courseId: course._id,
      courseTitleSnapshot: course.title,
      agreedMonthlyFee: course.monthlyFee,
      batch: "Batch to be assigned",
      joiningDate: new Date(),
    });
    enrollmentRequest.status = "approved";
    enrollmentRequest.reviewedBy = admin.userId;
    enrollmentRequest.reviewedAt = new Date();
    await Promise.all([
      enrollmentRequest.save(),
      Student.updateOne({ _id: student._id }, { $set: { admissionStatus: "enrolled" } }),
    ]);
    await audit("enrollment.request_approved", "enrollment_request", id, admin.userId, {
      enrollmentId: String(enrollment._id),
    });
    return success({ enrollment });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
