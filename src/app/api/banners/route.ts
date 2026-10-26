import { success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { HeroBanner } from "@/models/HeroBanner";

export async function GET() {
  await connectDb();
  const banners = await HeroBanner.find({ status: "published" }).sort({ order: 1, createdAt: -1 }).lean();
  return success({ banners });
}
