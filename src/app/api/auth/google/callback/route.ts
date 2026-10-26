import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { User } from "@/models/User";
import { createSession, sessionCookie } from "@/modules/identity/session";
const stateCookie = "ecs_google_state";
const redirect = (request: Request, error?: string) =>
  NextResponse.redirect(new URL(error ? `/login?google_error=${error}` : "/student", request.url));
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
  const { searchParams } = new URL(request.url);
  if (
    !clientId ||
    !secret ||
    !redirectUri ||
    searchParams.get("state") !== request.cookies.get(stateCookie)?.value ||
    !searchParams.get("code")
  )
    return redirect(request, "state");
  try {
    const tokenResult = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: searchParams.get("code")!,
        client_id: clientId,
        client_secret: secret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    const token = (await tokenResult.json()).access_token;
    const profileResult = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const profile = await profileResult.json();
    const email = String(profile.email || "")
      .trim()
      .toLowerCase();
    if (!profileResult.ok || !email || profile.email_verified !== true) return redirect(request, "profile");
    await connectDb();
    const user = await User.findOne({ email, accountStatus: "active" });
    if (!user) return redirect(request, "account");
    await User.updateOne(
      { _id: user._id },
      { $set: { googleSubject: String(profile.sub), emailVerifiedAt: user.emailVerifiedAt || new Date() } },
    );
    const { token: sessionToken } = await createSession(String(user._id), user.role);
    const response = redirect(request, user.role === "admin" ? undefined : undefined);
    if (user.role === "admin") response.headers.set("Location", new URL("/admin", request.url).toString());
    response.cookies.set(sessionCookie(sessionToken));
    response.cookies.set(stateCookie, "", { path: "/api/auth/google/callback", maxAge: 0 });
    return response;
  } catch {
    return redirect(request, "failed");
  }
}
