import { success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

export async function GET() {
  await connectDb();
  const settings = await SiteSettings.findOneAndUpdate(
    { key: "singleton" },
    { $setOnInsert: { key: "singleton" } },
    { new: true, upsert: true },
  ).lean();
  return success({ settings });
}
