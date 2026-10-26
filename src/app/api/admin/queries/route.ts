import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { StudentQuery } from "@/models/Query";
import { requireAdminSession } from "@/modules/identity/session";

export async function GET(request: Request) {
  await connectDb();
  try {
    await requireAdminSession();
    const status = new URL(request.url).searchParams.get("status");
    return success({
      queries: await StudentQuery.find(status ? { status } : {})
        .sort({ updatedAt: -1 })
        .populate("userId", "email pendingName")
        .lean(),
    });
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
