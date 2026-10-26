import { connectDb } from "@/lib/db";
import { audit } from "@/lib/audit";
import { failure, success } from "@/lib/api";
import { requireAdminSession } from "@/modules/identity/session";
import { courseSchema } from "@/modules/course/schema";
import { Course } from "@/models/Course";
export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    return success({ courses: await Course.find().sort({ updatedAt: -1 }).lean() });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
export async function POST(request: Request) {
  const parsed = courseSchema.safeParse(await request.json());
  if (!parsed.success)
    return failure("VALIDATION_ERROR", "Please correct the highlighted course details.", 422, {
      fields: parsed.error.flatten().fieldErrors,
    });
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const course = await Course.create(parsed.data);
    await audit("course.created", "course", String(course._id), admin.userId, { slug: course.slug });
    return success({ course }, { status: 201 });
  } catch (error) {
    return error instanceof Error && /duplicate key/i.test(error.message)
      ? failure("CONFLICT", "That course slug already exists.", 409)
      : failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
