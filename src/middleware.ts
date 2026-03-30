import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Password protection removed – site is open for testing
// Keeping middleware shell in case we need it later

export function middleware(request: NextRequest) {
  // If someone hits the old /password page, send them to home
  if (request.nextUrl.pathname === "/password") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
