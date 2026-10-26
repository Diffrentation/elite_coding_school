import { failure, success } from "@/lib/api";
import { audit } from "@/lib/audit";
import { connectDb } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { requireAdminSession } from "@/modules/identity/session";
import { siteSettingsSchema } from "@/modules/settings/schema";

export async function GET() {
  await connectDb();
  try {
    await requireAdminSession();
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "singleton" },
      { $setOnInsert: { key: "singleton" } },
      { new: true, upsert: true },
    ).lean();
    return success({ settings });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}

export async function PATCH(request: Request) {
  const parsed = siteSettingsSchema.safeParse(await request.json());
  if (!parsed.success || parsed.data.version === undefined)
    return failure("VALIDATION_ERROR", "Valid settings and a version are required.", 422);
  await connectDb();
  try {
    const admin = await requireAdminSession();
    const { version, ...data } = parsed.data;
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "singleton", version },
      { $set: data, $inc: { version: 1 } },
      { new: true },
    );
    if (!settings) return failure("CONFLICT", "Settings changed elsewhere. Reload and try again.", 409);
    await audit("settings.updated", "site-settings", String(settings._id), admin.userId);
    return success({ settings });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
