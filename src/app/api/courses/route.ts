import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { success } from "@/lib/api";
import { Course } from "@/models/Course";

export async function GET(request: NextRequest) {
  await connectDb();
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();
  const track = searchParams.get("track")?.trim();
  const level = searchParams.get("level")?.trim();
  const duration = searchParams.get("duration")?.trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));

  const filterConditions: any[] = [{ status: "published" }];

  // Track / Category filtering
  const targetCategory = category || track;
  if (targetCategory && targetCategory !== "all") {
    const catLower = targetCategory.toLowerCase();
    if (catLower === "mern" || catLower === "web") {
      filterConditions.push({
        $or: [
          { track: "web" },
          { track: "mern" },
          { category: /mern|web|full-stack/i },
          { trackLabel: /mern|web|full-stack/i },
        ],
      });
    } else if (catLower === "core" || catLower === "languages") {
      filterConditions.push({
        $or: [
          { track: "core" },
          { category: /language|foundation|core/i },
          { trackLabel: /c\+\+|java|python|core/i },
        ],
      });
    } else if (catLower === "dsa") {
      filterConditions.push({
        $or: [
          { track: "dsa" },
          { category: /dsa|logic|algorithm|system design/i },
          { trackLabel: /dsa|logic/i },
        ],
      });
    } else if (catLower === "systems") {
      filterConditions.push({
        $or: [
          { track: "systems" },
          { category: /network|system|operating|linux/i },
          { trackLabel: /network|system|linux/i },
        ],
      });
    } else {
      filterConditions.push({
        $or: [
          { category: new RegExp(`^${targetCategory}$`, "i") },
          { category: new RegExp(targetCategory, "i") },
          { trackLabel: new RegExp(targetCategory, "i") },
        ],
      });
    }
  }

  // Level filtering
  if (level) {
    filterConditions.push({ level: level.toLowerCase() });
  }

  // Duration filtering
  if (duration === "short") {
    filterConditions.push({ durationMonths: { $lte: 3 } });
  } else if (duration === "medium") {
    filterConditions.push({ durationMonths: { $gte: 4, $lte: 6 } });
  } else if (duration === "long") {
    filterConditions.push({ durationMonths: { $gte: 7 } });
  }

  // Search query
  if (search) {
    const sRegex = new RegExp(search, "i");
    filterConditions.push({
      $or: [
        { title: sRegex },
        { shortDescription: sRegex },
        { description: sRegex },
        { category: sRegex },
        { skills: sRegex },
        { trackLabel: sRegex },
      ],
    });
  }

  const finalFilter = filterConditions.length === 1 ? filterConditions[0] : { $and: filterConditions };

  const [courses, total] = await Promise.all([
    Course.find(finalFilter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Course.countDocuments(finalFilter),
  ]);

  return success({ courses, pagination: { page, limit, total } });
}
