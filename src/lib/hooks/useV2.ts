"use client";

import { usePathname } from "next/navigation";
import { COLLAPSED_FOR_DEMO } from "@/lib/config/build";

// ---------------------------------------------------------------------------
// THE SPLIT (inverted 8 Sept 2026, Mike's call)
// The FULL product (Team Diary, Patients, Reports, My Jobs, Staff) is the
// DEFAULT site at the root domain. The STRIPPED / PII-FREE build lives under
// the /v2 prefix, so it can be handed to people who should not see patient
// data without taking the full build away from anyone.
//
// `useIsV2()` means "am I in the stripped / limited experience?" and every
// component uses it that way - hide a feature or rewrite copy when it is true:
//   - /v2 and /v2/* paths          -> isV2 = true   (stripped / limited)
//   - root and every non-/v2 path  -> isV2 = false  (full build)
// "v2" is the name of the stripped variant, and it now lives at the URL of the
// same name, which is the least confusing arrangement we have had.
//
// Before 8 Sept this was the other way round, and between 2 Jul and 8 Sept the
// demo collapse put the full build at the root with /v2 redirecting home. If
// something looks wrong, check which era a comment was written in.
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

// True for the stripped / PII-free experience (served under /v2).
export function useIsV2(): boolean {
  const pathname = usePathname();
  // Demo collapse: the whole product is the full build - never the limited variant.
  if (COLLAPSED_FOR_DEMO) return false;
  return underV2Prefix(pathname);
}

// Prefix internal links with /v2 when the user is inside the stripped (/v2)
// build so navigation stays in it. `underPrefix` = "are we under the /v2 prefix".
export function v2Href(href: string, underPrefix: boolean): string {
  // Demo collapse: everything lives at the root, so never add the /v2 prefix.
  if (COLLAPSED_FOR_DEMO) return href;
  if (!underPrefix) return href;
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
  const underPrefix = underV2Prefix(pathname);
  return (href: string) => v2Href(href, underPrefix);
}
