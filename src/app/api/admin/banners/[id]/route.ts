import { isValidObjectId } from "mongoose";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { HeroBanner } from "@/models/HeroBanner";
import { requireAdminSession } from "@/modules/identity/session";
import { bannerUpdateSchema } from "@/modules/banner/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return failure("NOT_FOUND", "Banner not found.", 404);
  const parsed = bannerUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Please correct the banner details.", 422);

  await connectDb();
  try {
    await requireAdminSession();
    const { version, ...fields } = parsed.data;
    const banner = await HeroBanner.findOneAndUpdate(
      { _id: id, version },
      { $set: fields, $inc: { version: 1 } },
      { new: true },
    );
    if (!banner) return failure("CONFLICT", "This banner was changed elsewhere. Reload and try again.", 409);
    return success({ banner });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
