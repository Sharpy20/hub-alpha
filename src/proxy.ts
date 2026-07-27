import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COLLAPSED_FOR_DEMO } from "@/lib/config/build";

// Next 16.2 renamed the "middleware" file convention to "proxy" (same behaviour,
// runs on the Node.js runtime). Function renamed middleware -> proxy, file
// renamed middleware.ts -> proxy.ts. The config.matcher export is unchanged.
//
// THE SWAP (21 Jun 2026): the stripped / PII-free demo is now the DEFAULT site
// at the root domain, and the FULL build (Team Diary, Patients, Reports, etc.)
// lives under the /v2 prefix.
//
// These are the full-build / PII routes. In the LIMITED experience (root) they
// are blocked and redirect home. Under the FULL build (/v2) they are fully
// accessible. Keep this list in sync with the features hidden via `useIsV2()`.
const FULL_ONLY_PREFIXES = [
  "/diary",
  "/tasks",
  "/my-diary",
  "/my-tasks",
  "/patients",
  "/overview",
  "/reports",
  "/data-sources",
  "/staff",
];
// Note: /patient-guides is PII-free (MH educational leaflets for patients),
// so it stays accessible in the limited experience.

function isFullOnly(subpath: string): boolean {
  return FULL_ONLY_PREFIXES.some(
    (p) => subpath === p || subpath.startsWith(p + "/")
  );
}

// Old route names that the v1 pages redirect to new homes. Resolved here so the
// /v2 prefix survives the redirect. Returns null if not a legacy path.
function legacyTarget(subpath: string): string | null {
  if (subpath === "/bookmarks") return "/links";
  if (subpath === "/referrals" || subpath === "/how-to") return "/guides";
  // The chase log was retired 27 Jul (BACKLOG Section M item 6). Without this,
  // an old bookmark falls through the rule below to /guides/log and renders a
  // blank default guide, which looks like a broken page rather than a gone one.
  if (subpath === "/referrals/log") return "/guides";
  if (subpath.startsWith("/referrals/")) return "/guides/" + subpath.slice("/referrals/".length);
  if (subpath.startsWith("/how-to/")) return "/guides/" + subpath.slice("/how-to/".length);
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Site-wide password gate for early testing. One shared password, no user
  // accounts. Verified server-side by /api/auth/verify-password, which sets the
  // `site_access=granted` cookie. To change or lift the password, edit
  // SITE_PASSWORD (env) or the fallback in that route. Allow the gate page,
  // its verify API, and static assets straight through; everything else needs
  // the cookie.
  const gateOpen =
    pathname === "/password" ||
    pathname === "/api/auth/verify-password" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (!gateOpen) {
    const authCookie = request.cookies.get("site_access");
    if (!authCookie || authCookie.value !== "granted") {
      const url = request.nextUrl.clone();
      url.pathname = "/password";
      return NextResponse.redirect(url);
    }
  }

  // PARKED: the Welcome admission tool is removed from the live product (the code
  // stays in the repo - src/app/welcome, src/lib/data/welcome, components/guides/
  // risk-capture - and the nav tab is removed). It needs a lot more work and we
  // don't want it holding up launch. To bring it back: delete this block and
  // re-add the nav links in header.tsx. Any attempt to reach it redirects home.
  if (pathname === "/welcome" || pathname.startsWith("/welcome/") ||
      pathname === "/v2/welcome" || pathname.startsWith("/v2/welcome/")) {
    const url = request.nextUrl.clone();
    url.pathname = (!COLLAPSED_FOR_DEMO && pathname.startsWith("/v2")) ? "/v2" : "/";
    return NextResponse.redirect(url);
  }

  // DEMO COLLAPSE (see src/lib/config/build.ts): the whole product lives at the
  // root. Redirect any old /v2 link to the same page at the root, and do NOT
  // block the full-build routes. Set COLLAPSED_FOR_DEMO=false to restore the split.
  if (COLLAPSED_FOR_DEMO) {
    if (pathname === "/v2" || pathname.startsWith("/v2/")) {
      const subpath = pathname === "/v2" ? "/" : pathname.slice("/v2".length);
      const legacy = legacyTarget(subpath);
      const url = request.nextUrl.clone();
      url.pathname = legacy || subpath || "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // FULL build under /v2 - rewrite to the real route, full access (no blocking).
  if (pathname === "/v2" || pathname.startsWith("/v2/")) {
    const subpath = pathname === "/v2" ? "/" : pathname.slice("/v2".length);

    // Keep legacy aliases inside the /v2 prefix (/v2/bookmarks -> /v2/links,
    // /v2/referrals/[id] -> /v2/guides/[id]). Their v1 pages would otherwise
    // redirect and silently drop the /v2 prefix.
    const legacy = legacyTarget(subpath);
    if (legacy) {
      const url = request.nextUrl.clone();
      url.pathname = "/v2" + legacy;
      return NextResponse.redirect(url);
    }

    // Rewrite to the existing route so a single codebase serves both.
    // usePathname() still returns /v2/... so client code can detect mode.
    const url = request.nextUrl.clone();
    url.pathname = subpath === "" ? "/" : subpath;
    return NextResponse.rewrite(url);
  }

  // LIMITED experience at the root - block the full-build / PII routes.
  if (isFullOnly(pathname)) {
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
