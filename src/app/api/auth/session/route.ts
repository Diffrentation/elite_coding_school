import { connectDb } from "@/lib/db";
import { success } from "@/lib/api";
import { getSession } from "@/modules/identity/session";
import { User } from "@/models/User";
import { Student } from "@/models/Student";

export async function GET() {
  await connectDb();
  const session = await getSession();
  if (!session) return success({ authenticated: false });
  const user = await User.findById(session.userId).select("email role accountStatus");
  const student =
    session.role === "student"
      ? await Student.findOne({ userId: session.userId }).select("studentId fullName")
      : null;
  return success({
    authenticated: Boolean(user),
    user: user
      ? {
          email: user.email,
          role: user.role,
          studentId: student?.studentId ?? null,
          fullName: student?.fullName ?? null,
        }
      : null,
  });
}
