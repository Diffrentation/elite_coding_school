import { z } from "zod";
import { failure, success } from "@/lib/api";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";
import { CertificateTemplate } from "@/models/CertificateTemplate";
import { requireAdminSession } from "@/modules/identity/session";
import { getActiveCertificateTemplate } from "@/modules/certificate/template";

const schema = z.object({ name: z.string().trim().min(3).max(120), imageUrl: z.string().url() });

export async function GET() {
  await connectDb();
  let admin;
  try {
    admin = await requireAdminSession();
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }

  try {
    const template = await getActiveCertificateTemplate(admin.userId);
    return success({ template: template.toObject() });
  } catch (error) {
    console.error("Unable to initialize the official certificate template.", error);
    return failure(
      "TEMPLATE_UNAVAILABLE",
      "The official certificate template could not be initialized. Please retry.",
      500,
    );
  }
}

export async function PUT(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return failure("VALIDATION_ERROR", "Provide a valid template name and image URL.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    await CertificateTemplate.updateMany({ active: true }, { $set: { active: false } });
    const template = await CertificateTemplate.create({
      ...parsed.data,
      active: true,
      updatedBy: admin.userId,
    });
    await audit("certificate.template_updated", "certificate_template", String(template._id), admin.userId);
    return success({ template }, { status: 201 });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
