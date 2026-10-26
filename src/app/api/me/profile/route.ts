import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { requireStudentSession } from "@/modules/identity/session";
import { Student } from "@/models/Student";
import { User } from "@/models/User";
import { profileSchema } from "@/modules/student/schema";
export async function GET() {
  await connectDb();
  try {
    const session = await requireStudentSession();
    const [student, user] = await Promise.all([
      Student.findOne({ userId: session.userId }),
      User.findById(session.userId).select("email"),
    ]);
    return student
      ? success({ profile: { ...student.toObject(), email: user?.email } })
      : failure("NOT_FOUND", "Student profile not found.", 404);
  } catch {
    return failure("UNAUTHORIZED", "Log in as a student to continue.", 401);
  }
}
export async function PATCH(request: Request) {
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Please correct the profile fields.", 422);
  await connectDb();
  try {
    const session = await requireStudentSession();
    const { version, ...fields } = parsed.data;
    const profile = await Student.findOneAndUpdate(
      { userId: session.userId, version },
      { $set: fields, $inc: { version: 1 } },
      { new: true },
    );
    if (!profile) return failure("CONFLICT", "Your profile changed elsewhere. Reload and try again.", 409);
    return success({ profile });
  } catch (error) {
    return error instanceof Error && error.message === "UNAUTHORIZED"
      ? failure("UNAUTHORIZED", "Log in as a student to continue.", 401)
      : failure("INTERNAL_ERROR", "Unable to update your profile.", 500);
  }
}
