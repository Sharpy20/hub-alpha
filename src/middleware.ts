import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple site-wide password protection for early testing
// Password is stored in environment variable SITE_PASSWORD

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the password page and API
  if (pathname === "/password" || pathname === "/api/auth/verify-password") {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("site_access");

  if (!authCookie || authCookie.value !== "granted") {
    // Redirect to password page
    const url = request.nextUrl.clone();
    url.pathname = "/password";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
