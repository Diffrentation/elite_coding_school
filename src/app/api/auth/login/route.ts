import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { failure, success } from "@/lib/api";
import { loginSchema } from "@/modules/identity/schema";
import { User } from "@/models/User";
import { createSession, sessionCookie } from "@/modules/identity/session";
import { enforceRateLimit } from "@/lib/security";
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { name: "login", limit: 10, windowMs: 15 * 60_000 });
  if (limited) return limited;
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return failure("VALIDATION_ERROR", "Enter your email and password.", 422);
  await connectDb();
  const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
  if (
    !user ||
    !user.passwordHash ||
    !(await bcrypt.compare(parsed.data.password, user.passwordHash)) ||
    user.accountStatus !== "active"
  )
    return failure("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  const { token } = await createSession(String(user._id), user.role);
  const response = success({ role: user.role, redirectTo: user.role === "admin" ? "/admin" : "/student" });
  response.cookies.set(sessionCookie(token));
  return response;
}
