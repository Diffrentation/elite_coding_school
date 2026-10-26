import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { requireAdminSession } from "@/modules/identity/session";
export async function GET(request: Request) {
  await connectDb();
  try {
    await requireAdminSession();
    const status = new URL(request.url).searchParams.get("status");
    return success({
      inquiries: await Inquiry.find(status ? { status } : {})
        .sort({ createdAt: -1 })
        .lean(),
    });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
