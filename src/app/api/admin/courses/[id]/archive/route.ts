import { isValidObjectId } from "mongoose";
import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { requireAdminSession } from "@/modules/identity/session";
import { Course } from "@/models/Course";
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return failure("NOT_FOUND", "Course not found.", 404);
  await connectDb();
  try {
    await requireAdminSession();
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: { status: "archived" }, $inc: { version: 1 } },
      { new: true },
    );
    return course ? success({ course }) : failure("NOT_FOUND", "Course not found.", 404);
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
