import { z } from "zod";
import { failure, success } from "@/lib/api";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";
import { Enrollment } from "@/models/Enrollment";
import { Student } from "@/models/Student";
import { requireAdminSession } from "@/modules/identity/session";

const schema = z.object({ status: z.enum(["active", "completed", "cancelled"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Choose a valid enrollment status.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const { id } = await params;
    const enrollment = await Enrollment.findByIdAndUpdate(id, { $set: { status: parsed.data.status } }, { new: true });
    if (!enrollment) return failure("NOT_FOUND", "Enrollment not found.", 404);
    if (parsed.data.status === "completed") await Student.updateOne({ _id: enrollment.studentId }, { $set: { completionDate: new Date(), admissionStatus: "completed" } });
    await audit("enrollment.status_updated", "enrollment", id, admin.userId, { status: parsed.data.status });
    return success({ enrollment });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
