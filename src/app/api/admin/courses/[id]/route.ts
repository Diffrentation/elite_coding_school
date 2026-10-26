import { connectDb } from "@/lib/db";
import { audit } from "@/lib/audit";
import { isValidObjectId } from "mongoose";
import { failure, success } from "@/lib/api";
import { requireAdminSession } from "@/modules/identity/session";
import { courseSchema } from "@/modules/course/schema";
import { Course } from "@/models/Course";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return failure("NOT_FOUND", "Course not found.", 404);
  const parsed = courseSchema.safeParse(await request.json());
  if (!parsed.success)
    return failure("VALIDATION_ERROR", "Please correct the highlighted course details.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    });
  if (parsed.data.version === undefined)
    return failure("VALIDATION_ERROR", "A valid course version is required.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const { version, ...data } = parsed.data;
    const course = await Course.findOneAndUpdate(
      { _id: id, version },
      { $set: data, $inc: { version: 1 } },
      { new: true },
    );
    if (!course)
      return failure("CONFLICT", "This course was changed by someone else. Reload and try again.", 409);
    await audit("course.updated", "course", String(course._id), admin.userId, { slug: course.slug });
    return success({ course });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
