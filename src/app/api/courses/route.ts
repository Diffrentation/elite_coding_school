import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { success } from "@/lib/api";
import { Course } from "@/models/Course";
export async function GET(request: NextRequest) {
  await connectDb();
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();
  const level = searchParams.get("level")?.trim();
  const duration = searchParams.get("duration")?.trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
  const filter: Record<string, unknown> = { status: "published" };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (duration === "short") filter.durationMonths = { $lte: 3 };
  if (duration === "medium") filter.durationMonths = { $gte: 4, $lte: 6 };
  if (duration === "long") filter.durationMonths = { $gte: 7 };
  if (search)
    filter.$or = [{ title: new RegExp(search, "i") }, { shortDescription: new RegExp(search, "i") }];
  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);
  return success({ courses, pagination: { page, limit, total } });
}
