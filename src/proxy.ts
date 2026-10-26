import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = () => {
  const configuredSecret = process.env.JWT_SECRET?.trim();
  if (!configuredSecret && process.env.NODE_ENV === "production")
    throw new Error("JWT_SECRET must be configured in production.");
  return new TextEncoder().encode(configuredSecret || "development-only-change-this-secret");
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api") && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "ORIGIN_FORBIDDEN", message: "Cross-origin requests are not allowed." },
        },
        { status: 403 },
      );
    }
  }
  if (!path.startsWith("/student") && !path.startsWith("/admin")) return NextResponse.next();
  const token = request.cookies.get("ecs_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = String(payload.role);
    if (path.startsWith("/admin") && role !== "admin")
      return NextResponse.redirect(new URL("/student", request.url));
    if (path.startsWith("/student") && role !== "student")
      return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
export const config = { matcher: ["/student/:path*", "/admin/:path*", "/api/:path*"] };
