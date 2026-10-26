import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { EnrollmentRequest } from "@/models/EnrollmentRequest";
import { requireAdminSession } from "@/modules/identity/session";

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const requests = await EnrollmentRequest.find()
      .sort({ createdAt: -1 })
      .populate("studentId", "fullName studentId")
      .populate("courseId", "title monthlyFee")
      .lean();
    return success({ requests });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
