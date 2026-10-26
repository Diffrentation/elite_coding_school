import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { getSession } from "@/modules/identity/session";
import { User } from "@/models/User";
import { Session } from "@/models/Session";
const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(128) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Use a password of at least 8 characters.", 422);
  await connectDb();
  const session = await getSession();
  if (!session) return failure("UNAUTHORIZED", "Log in to continue.", 401);
  const user = await User.findById(session.userId).select("+passwordHash");
  if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)))
    return failure("INVALID_CREDENTIALS", "Your current password is incorrect.", 401);
  await User.updateOne(
    { _id: user._id },
    { $set: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) } },
  );
  await Session.updateMany(
    { userId: user._id, sessionId: { $ne: session.sessionId }, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
  return success({ message: "Password updated." });
}
