import { isValidObjectId } from "mongoose";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { requireAdminSession } from "@/modules/identity/session";
import { inquiryStatusSchema } from "@/modules/inquiry/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = inquiryStatusSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Choose a valid inquiry status.", 422);
  if (!isValidObjectId(id)) return failure("NOT_FOUND", "Inquiry not found.", 404);

  await connectDb();
  try {
    await requireAdminSession();
    const inquiry = await Inquiry.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
    if (!inquiry) return failure("NOT_FOUND", "Inquiry not found.", 404);
    return success({ inquiry });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
