import { failure, success } from "@/lib/api";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";
import { HeroBanner } from "@/models/HeroBanner";
import { bannerSchema } from "@/modules/banner/schema";
import { requireAdminSession } from "@/modules/identity/session";

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    return success({ banners: await HeroBanner.find().sort({ order: 1, updatedAt: -1 }).lean() });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = bannerSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Please correct the banner details.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const banner = await HeroBanner.create(parsed.data);
    await audit("banner.created", "banner", String(banner._id), admin.userId, { title: banner.title });
    return success({ banner }, { status: 201 });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
