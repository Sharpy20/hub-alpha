"use client";

import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// THE SWAP (21 Jun 2026, Session 23)
// The two experiences traded URLs. The STRIPPED / PII-FREE demo is now the
// DEFAULT site served at the root domain (e.g. wardhub.live). The FULL build
// (Team Diary, Patients, Reports, My Jobs, Staff) now lives under the /v2 prefix.
//
// `useIsV2()` has always meant "am I in the stripped / limited experience?" and
// every component still uses it that way - hide a feature or rewrite copy when
// it is true. To keep all of that logic untouched, we ONLY flip WHERE it is true:
//   - root and every non-/v2 path  -> isV2 = true   (stripped / limited demo)
//   - /v2 and /v2/* paths          -> isV2 = false  (full build)
// The boolean therefore reads a little oddly (it is true when NOT under /v2),
// but its MEANING - "is this the limited public experience" - is unchanged, so
// no component logic had to move. Think of "v2" as the name of the stripped
// variant, which now happens to be the default.
//
// The link helper (useV2Href / v2Href) keeps the user inside their current
// experience: under /v2 it prefixes internal links with /v2; at root it leaves
// them alone. That prefixing is driven by the URL prefix, NOT by isV2.
// ---------------------------------------------------------------------------

const V2_PREFIX = "/v2";

// Are we currently under the /v2 URL prefix (the full build)?
function underV2Prefix(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === V2_PREFIX || pathname.startsWith(V2_PREFIX + "/");
}

// True for the stripped / PII-free experience (now the default site at root).
export function useIsV2(): boolean {
  const pathname = usePathname();
  // Default to the limited experience when the path is unknown (safer: hides PII).
  return !underV2Prefix(pathname);
}

// Prefix internal links with /v2 when the user is inside the full (/v2) build so
// navigation stays in that build. `inFull` = "are we under the /v2 prefix".
export function v2Href(href: string, inFull: boolean): string {
  if (!inFull) return href;
  if (!href) return href;
  // Leave external URLs, anchors and absolute-non-app paths alone.
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return href;
  }
  if (href === "/") return V2_PREFIX;
  if (href === V2_PREFIX || href.startsWith(V2_PREFIX + "/")) return href;
  if (!href.startsWith("/")) return href;
  return `${V2_PREFIX}${href}`;
}

export function useV2Href() {
  const pathname = usePathname();
  const inFull = underV2Prefix(pathname);
  return (href: string) => v2Href(href, inFull);
}
