import { connectDb } from "@/lib/db";
import { success } from "@/lib/api";
import { getSession } from "@/modules/identity/session";
import { Session } from "@/models/Session";
export async function POST() {
  try {
    await connectDb();
    const session = await getSession();
    if (session)
      await Session.updateOne({ sessionId: session.sessionId }, { $set: { revokedAt: new Date() } });
  } catch {
    // Always clear the browser cookie, even when server-side session revocation is temporarily unavailable.
  }
  const response = success({ message: "Logged out." });
  response.cookies.set({
    name: "ecs_session",
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });
  return response;
}
