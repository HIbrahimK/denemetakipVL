import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";

const PROTECTED_PATHS = ["/super-admin"];
const LOGIN_PATH = "/giris";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Super Admin Protection ──────────────────────────────────
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid/expired token — clear cookie and redirect
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // Only SUPER_ADMIN can access the super-admin panel
  if (payload.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Inject user info into request headers for downstream use
  const response = NextResponse.next();
  response.headers.set("x-user-id", payload.sub);
  response.headers.set("x-user-email", payload.email);
  response.headers.set("x-user-role", payload.role);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals:
     * - _next/static (static assets)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
