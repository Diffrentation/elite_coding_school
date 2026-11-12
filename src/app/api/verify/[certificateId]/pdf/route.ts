import { connectDb } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { certificatePdf } from "@/modules/certificate/pdf";
import { enforceRateLimit } from "@/lib/security";
import { publicUrl } from "@/lib/public-url";

export async function GET(request: Request, { params }: { params: Promise<{ certificateId: string }> }) {
  const limited = enforceRateLimit(request, { name: "certificate-pdf", limit: 20, windowMs: 60_000 });
  if (limited) return limited;
  await connectDb();
  const { certificateId } = await params;
  const certificate = await Certificate.findOne({
    certificateId: certificateId.toUpperCase(),
    status: "active",
  }).lean();
  if (!certificate) return new Response("Active certificate not found", { status: 404 });
  const pdf = await certificatePdf({
    certificateId: certificate.certificateId,
    studentName: certificate.studentNameSnapshot,
    courseName: certificate.courseNameSnapshot,
    issueDate: certificate.issueDate,
    verificationUrl: publicUrl(certificate.verificationPath, request),
    templateUrl: certificate.templateUrl,
  });
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${certificate.certificateId}.pdf"`,
    },
  });
}
