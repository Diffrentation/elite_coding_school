import { isValidObjectId } from "mongoose";
import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { StudentQuery } from "@/models/Query";
import { requireAdminSession } from "@/modules/identity/session";
import { replySchema } from "@/modules/query/schema";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = replySchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Enter a reply.", 422);
  const { id } = await params;
  if (!isValidObjectId(id)) return failure("NOT_FOUND", "Query not found.", 404);
  await connectDb();
  try {
    await requireAdminSession();
    const query = await StudentQuery.findByIdAndUpdate(
      id,
      {
        $push: { messages: { authorRole: "admin", body: parsed.data.message } },
        $set: { status: parsed.data.status ?? "answered" },
      },
      { new: true },
    );
    return query ? success({ query }) : failure("NOT_FOUND", "Query not found.", 404);
  } catch {
    return failure("FORBIDDEN", "Administrator access is required.", 403);
  }
}
