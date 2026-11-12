import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { enforceRateLimit } from "@/lib/security";
import { Certificate } from "@/models/Certificate";

export async function GET(request: Request, { params }: { params: Promise<{ certificateId: string }> }) {
  const limited = enforceRateLimit(request, {
    name: "certificate-verification",
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;
  await connectDb();
  const { certificateId } = await params;
  const certificate = await Certificate.findOne({ certificateId: certificateId.toUpperCase() })
    .populate("studentId", "fullName studentId profileImageUrl publicProfile publicPhotoConsent")
    .lean();
  if (!certificate) return failure("NOT_FOUND", "Certificate not found.", 404);
  const student = certificate.studentId as unknown as {
    fullName: string;
    studentId: string;
    profileImageUrl?: string;
    publicProfile: boolean;
    publicPhotoConsent: boolean;
  };
  if (!student)
    return failure("INVALID_CERTIFICATE", "The certificate is not linked to an active student record.", 422);
  return success({
    certificate: {
      certificateId: certificate.certificateId,
      status: certificate.status,
      studentName: certificate.studentNameSnapshot,
      courseName: certificate.courseNameSnapshot,
      batch: certificate.batchSnapshot,
      joiningDate: certificate.joiningDateSnapshot,
      completionDate: certificate.completionDate,
      issueDate: certificate.issueDate,
      templateUrl: certificate.templateUrl,
      verificationPath: certificate.verificationPath,
      student: student.publicProfile
        ? {
            studentId: student.studentId,
            profileImageUrl: student.publicPhotoConsent ? (student.profileImageUrl ?? null) : null,
          }
        : null,
    },
  });
}
