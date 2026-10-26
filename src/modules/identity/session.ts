import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Session } from "@/models/Session";
const name = "ecs_session";
const secret = () => {
  const configuredSecret = process.env.JWT_SECRET?.trim();
  if (!configuredSecret && process.env.NODE_ENV === "production")
    throw new Error("JWT_SECRET must be configured in production.");
  return new TextEncoder().encode(configuredSecret || "development-only-change-this-secret");
};
export async function createSession(userId: string, role: string) {
  const sessionId = crypto.randomUUID();
  const expiry = new Date(Date.now() + 7 * 24 * 60 * 60_000);
  await Session.create({ sessionId, userId, expiresAt: expiry });
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(sessionId)
    .setExpirationTime("7d")
    .sign(secret());
  return { token, expiry };
}
export async function getSession() {
  const token = (await cookies()).get(name)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const session = await Session.findOne({
      sessionId: payload.jti,
      userId: payload.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    return session
      ? { userId: String(payload.sub), role: String(payload.role), sessionId: String(payload.jti) }
      : null;
  } catch {
    return null;
  }
}
export async function requireStudentSession() {
  const session = await getSession();
  if (!session || session.role !== "student") throw new Error("UNAUTHORIZED");
  return session;
}
export async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("FORBIDDEN");
  return session;
}
export const sessionCookie = (token: string) => ({
  name,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
});
