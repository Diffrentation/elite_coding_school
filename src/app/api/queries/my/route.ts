import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { StudentQuery } from "@/models/Query";
import { requireStudentSession } from "@/modules/identity/session";

export async function GET() {
  await connectDb();
  try {
    const session = await requireStudentSession();
    return success({
      queries: await StudentQuery.find({ userId: session.userId }).sort({ updatedAt: -1 }).lean(),
    });
  } catch {
    return failure("UNAUTHORIZED", "Log in as a student to continue.", 401);
  }
}
