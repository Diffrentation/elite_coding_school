import { z } from "zod";
import { failure, success } from "@/lib/api";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { CertificateSequence } from "@/models/CertificateSequence";
import { CertificateTemplate } from "@/models/CertificateTemplate";
import { Enrollment } from "@/models/Enrollment";
import { requireAdminSession } from "@/modules/identity/session";

const issueSchema = z.object({ enrollmentId: z.string().min(1), issueDate: z.coerce.date() });

async function nextCertificateId(issueDate: Date) {
  const year = issueDate.getUTCFullYear();
  const sequence = await CertificateSequence.findOneAndUpdate(
    { year },
    { $inc: { value: 1 }, $setOnInsert: { year } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return `ECS-${year}-${String(sequence.value).padStart(5, "0")}`;
}

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const certificates = await Certificate.find()
      .sort({ issueDate: -1 })
      .populate("studentId", "fullName studentId profileImageUrl")
      .lean();
    return success({ certificates });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = issueSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Select a completed enrollment and a valid issue date.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const [enrollment, template] = await Promise.all([
      Enrollment.findOne({ _id: parsed.data.enrollmentId, status: "completed" }).populate("studentId").populate("courseId"),
      CertificateTemplate.findOne({ active: true }).sort({ updatedAt: -1 }),
    ]);
    if (!enrollment) return failure("NOT_ELIGIBLE", "Only completed course enrollments can receive a certificate.", 422);
    if (!template) return failure("TEMPLATE_REQUIRED", "Upload and activate the original certificate template before issuing.", 422);
    const existing = await Certificate.findOne({ enrollmentId: enrollment._id });
    if (existing) return failure("CONFLICT", "This completed enrollment already has a certificate record.", 409);
    const student = enrollment.studentId as unknown as { _id: unknown; fullName: string };
    const course = enrollment.courseId as unknown as { _id: unknown; title: string };
    const certificateId = await nextCertificateId(parsed.data.issueDate);
    const certificate = await Certificate.create({
      certificateId,
      studentId: student._id,
      enrollmentId: enrollment._id,
      courseId: course._id,
      studentNameSnapshot: student.fullName,
      courseNameSnapshot: enrollment.courseTitleSnapshot,
      batchSnapshot: enrollment.batch,
      joiningDateSnapshot: enrollment.joiningDate,
      completionDate: enrollment.updatedAt,
      issueDate: parsed.data.issueDate,
      verificationPath: `/verify/${certificateId}`,
      templateUrl: template.imageUrl,
      issuedBy: admin.userId,
    });
    await audit("certificate.issued", "certificate", String(certificate._id), admin.userId, { certificateId, enrollmentId: String(enrollment._id) });
    return success({ certificate }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && /duplicate key/i.test(error.message))
      return failure("CONFLICT", "A certificate already exists for this enrollment. Refresh the list.", 409);
    return failure("ISSUE_FAILED", "The certificate could not be issued.", 500);
  }
}
