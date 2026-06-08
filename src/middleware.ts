import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that should NOT exist under /v2 (PII-free demo).
// Any /v2 hit on these paths redirects to /v2 home.
const V2_BLOCKED_PREFIXES = [
  "/diary",
  "/tasks",
  "/my-diary",
  "/my-tasks",
  "/patients",
  "/reports",
  "/data-sources",
  "/referrals/log",
];
// Note: /patient-guides is PII-free (MH educational leaflets for patients),
// so we keep it accessible in v2.

function isBlockedInV2(subpath: string): boolean {
  return V2_BLOCKED_PREFIXES.some(
    (p) => subpath === p || subpath.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy redirect
  if (pathname === "/password") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // /v2 prefix handling
  if (pathname === "/v2" || pathname.startsWith("/v2/")) {
    const subpath = pathname === "/v2" ? "/" : pathname.slice("/v2".length);

    if (isBlockedInV2(subpath)) {
      const url = request.nextUrl.clone();
      url.pathname = "/v2";
      return NextResponse.redirect(url);
    }

    // Rewrite to the existing route so a single codebase serves both.
    // usePathname() still returns /v2/... so client code can detect mode.
    const url = request.nextUrl.clone();
    url.pathname = subpath === "" ? "/" : subpath;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
