import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { HeroBanner } from "@/models/HeroBanner";
import { requireAdminSession } from "@/modules/identity/session";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDb();
  try {
    await requireAdminSession();
    const { id } = await params;
    const banner = await HeroBanner.findByIdAndUpdate(
      id,
      { $set: { status: "published" }, $inc: { version: 1 } },
      { new: true },
    );
    return banner ? success({ banner }) : failure("NOT_FOUND", "Banner not found.", 404);
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
