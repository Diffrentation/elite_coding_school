import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { Course } from "@/models/Course";
import { isValidObjectId } from "mongoose";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connectDb();
  const { slug: identifier } = await params;
  const course = await Course.findOne({
    status: "published",
    ...(isValidObjectId(identifier)
      ? { $or: [{ _id: identifier }, { slug: identifier }] }
      : { slug: identifier }),
  }).lean();
  return course ? success({ course }) : failure("NOT_FOUND", "Course not found.", 404);
}
