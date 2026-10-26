import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { Course } from "@/models/Course";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connectDb();
  const { slug } = await params;
  const course = await Course.findOne({ slug, status: "published" }).lean();
  return course ? success({ course }) : failure("NOT_FOUND", "Course not found.", 404);
}
