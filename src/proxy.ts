import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COLLAPSED_FOR_DEMO } from "@/lib/config/build";
import { V3_PREFIX, V3_PRIVACY, isV3Route } from "@/lib/config/editions";

// Next 16.2 renamed the "middleware" file convention to "proxy" (same behaviour,
// runs on the Node.js runtime). Function renamed middleware -> proxy, file
// renamed middleware.ts -> proxy.ts. The config.matcher export is unchanged.
//
// THE SPLIT (inverted 8 Sept 2026): the FULL build is the DEFAULT site at the
// root domain, and the stripped / PII-free build lives under the /v2 prefix.
//
// These are the full-build / PII routes. At the root they are fully accessible.
// Under /v2 they are blocked and redirect to /v2. Keep this list in sync with
// the features hidden via `useIsV2()`.
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
// so it stays accessible under /v2.

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
  //
  // The dot rule lets static files through, and /3.0 has a dot in it, so the
  // guides-only edition is ruled out of it explicitly. Without this every 3.0
  // page would skip the password.
  const inV3 = pathname === V3_PREFIX || pathname.startsWith(V3_PREFIX + "/");
  const gateOpen =
    pathname === "/password" ||
    pathname === "/api/auth/verify-password" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    (pathname.includes(".") && !inV3);

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

  // /v3 and /3 are what people will type. Send them to the real address.
  if (pathname === "/v3" || pathname === "/3") {
    const url = request.nextUrl.clone();
    url.pathname = V3_PREFIX;
    return NextResponse.redirect(url);
  }

  // 3.0, THE GUIDES-ONLY EDITION (see src/lib/config/editions.ts). An allowlist,
  // not a blocklist: only the routes listed there are served, and anything else
  // goes back to the 3.0 home. Independent of the demo collapse below.
  if (inV3) {
    const subpath = pathname === V3_PREFIX ? "/" : pathname.slice(V3_PREFIX.length);

    const legacy = legacyTarget(subpath);
    if (legacy) {
      const url = request.nextUrl.clone();
      url.pathname = V3_PREFIX + legacy;
      return NextResponse.redirect(url);
    }

    if (subpath === "/gdpr") {
      const url = request.nextUrl.clone();
      const [pathPart, hash] = V3_PRIVACY.split("#");
      url.pathname = V3_PREFIX + pathPart;
      url.hash = hash ?? "";
      return NextResponse.redirect(url);
    }

    if (!isV3Route(subpath)) {
      const url = request.nextUrl.clone();
      // A tool that is not in 3.0 lands on the guides list, not the home page,
      // which is where the reader was heading.
      url.pathname = subpath.startsWith("/guides/") ? V3_PREFIX + "/guides" : V3_PREFIX;
      url.search = "";
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = subpath;
    return NextResponse.rewrite(url);
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

  // LIMITED experience under /v2 - rewrite to the real route, minus the PII routes.
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

    // Block the full-build / PII routes and send the user back to the /v2 home
    // rather than the root, so they stay inside the stripped build.
    if (isFullOnly(subpath)) {
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

  // FULL build at the root - nothing blocked.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
