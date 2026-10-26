import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { getSession } from "@/modules/identity/session";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
export async function GET() {
  await connectDb();
  const session = await getSession();
  if (!session) return failure("UNAUTHORIZED", "Log in to continue.", 401);
  const user = await User.findById(session.userId).select("email role accountStatus");
  const student =
    session.role === "student"
      ? await Student.findOne({ userId: session.userId }).select("studentId fullName admissionStatus")
      : null;
  return success({
    user: {
      email: user?.email,
      role: user?.role,
      accountStatus: user?.accountStatus,
      studentId: student?.studentId,
      fullName: student?.fullName,
      admissionStatus: student?.admissionStatus,
    },
  });
}
