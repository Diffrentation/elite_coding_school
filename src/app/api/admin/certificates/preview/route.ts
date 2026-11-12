import { z } from "zod";
import { connectDb } from "@/lib/db";
import { Enrollment } from "@/models/Enrollment";
import { certificatePdf } from "@/modules/certificate/pdf";
import { getActiveCertificateTemplate } from "@/modules/certificate/template";
import { requireAdminSession } from "@/modules/identity/session";

const previewSchema = z.object({ enrollmentId: z.string().min(1), issueDate: z.coerce.date() });

/**
 * Produces the exact issue layout without creating a database record or
 * reserving a sequence number. Preview IDs are deliberately non-verifiable.
 */
export async function POST(request: Request) {
  const parsed = previewSchema.safeParse(await request.json());
  if (!parsed.success) return new Response("Select a completed enrollment and issue date.", { status: 422 });

  await connectDb();
  try {
    const admin = await requireAdminSession();
    const enrollment = await Enrollment.findOne({ _id: parsed.data.enrollmentId, status: "completed" })
      .populate("studentId")
      .lean();
    if (!enrollment)
      return new Response("Only completed course enrollments can be previewed.", { status: 422 });

    const template = await getActiveCertificateTemplate(admin.userId);
    const student = enrollment.studentId as unknown as { fullName?: string };
    const year = parsed.data.issueDate.getUTCFullYear();
    const pdf = await certificatePdf({
      certificateId: `ECS-${year}-PREVIEW`,
      studentName: student?.fullName ?? "Student Name",
      courseName: enrollment.courseTitleSnapshot,
      issueDate: parsed.data.issueDate,
      verificationUrl: new URL("/verify/preview", request.url).toString(),
      templateUrl: template.imageUrl,
    });

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="certificate-preview.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Could not generate the certificate preview.", { status: 500 });
  }
}
