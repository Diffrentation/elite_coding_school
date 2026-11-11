import { z } from "zod";
import { failure, success } from "@/lib/api";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";
import { Certificate } from "@/models/Certificate";
import { requireAdminSession } from "@/modules/identity/session";

const schema = z.object({ reason: z.string().trim().min(3).max(500) });
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Provide a revocation reason.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const { id } = await params;
    const certificate = await Certificate.findOneAndUpdate(
      { _id: id, status: "active" },
      { $set: { status: "revoked", revokedAt: new Date(), revokedBy: admin.userId, revocationReason: parsed.data.reason } },
      { new: true },
    );
    if (!certificate) return failure("NOT_FOUND", "Active certificate not found.", 404);
    await audit("certificate.revoked", "certificate", id, admin.userId, { certificateId: certificate.certificateId });
    return success({ certificate });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
