import { connectDb } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { certificatePdf } from "@/modules/certificate/pdf";
import { requireAdminSession } from "@/modules/identity/session";
import { publicUrl } from "@/lib/public-url";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  await requireAdminSession();
  const { id } = await params;
  const certificate = await Certificate.findById(id).lean();
  if (!certificate) return new Response("Certificate not found", { status: 404 });
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
