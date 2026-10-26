import crypto from "node:crypto";
import { NextResponse } from "next/server";
const stateCookie = "ecs_google_state";
const config = () => ({
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID?.trim(),
  redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim(),
});
export function GET(request: Request) {
  const { clientId, redirectUri } = config();
  if (!clientId || !redirectUri)
    return NextResponse.redirect(new URL("/login?google_error=configuration", request.url));
  const state = crypto.randomUUID();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set(stateCookie, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google/callback",
    maxAge: 600,
  });
  return response;
}
