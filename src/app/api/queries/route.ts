import { failure, success } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { StudentQuery } from "@/models/Query";
import { requireStudentSession } from "@/modules/identity/session";
import { createQuerySchema } from "@/modules/query/schema";

export async function POST(request: Request) {
  const parsed = createQuerySchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Please complete your query details.", 422);
  await connectDb();
  try {
    const session = await requireStudentSession();
    const query = await StudentQuery.create({
      userId: session.userId,
      category: parsed.data.category,
      subject: parsed.data.subject,
      messages: [{ authorRole: "student", body: parsed.data.message }],
    });
    return success({ query }, { status: 201 });
  } catch {
    return failure("UNAUTHORIZED", "Log in as a verified student to ask a query.", 401);
  }
}
