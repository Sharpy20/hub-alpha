"use client";

import { usePathname } from "next/navigation";
import { COLLAPSED_FOR_DEMO } from "@/lib/config/build";
import { V3_PREFIX } from "@/lib/config/editions";

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

// 3.0 (25 Oct 2026) is a third experience: guides only. It is stricter than
// /v2, so useIsV2() is true under /3.0 as well and every existing "limited"
// gate applies there for free. useIsV3() is for the extra things 3.0 drops.
// See src/lib/config/editions.ts.

// Which edition prefix is this path under, if any?
function editionPrefix(pathname: string | null): string | null {
  if (!pathname) return null;
  for (const p of [V3_PREFIX, V2_PREFIX]) {
    if (pathname === p || pathname.startsWith(p + "/")) return p;
  }
  return null;
}

// True for the stripped / PII-free experience (served under /v2 and /3.0).
export function useIsV2(): boolean {
  const pathname = usePathname();
  const prefix = editionPrefix(pathname);
  // 3.0 is always limited. The demo collapse only ever applied to /v2.
  if (prefix === V3_PREFIX) return true;
  // Demo collapse: the whole product is the full build - never the limited variant.
  if (COLLAPSED_FOR_DEMO) return false;
  return prefix === V2_PREFIX;
}

// True only inside the guides-only edition at /3.0.
export function useIsV3(): boolean {
  return editionPrefix(usePathname()) === V3_PREFIX;
}

// Prefix internal links with the edition the user is in (/v2 or /3.0) so
// navigation stays inside it. `prefix` is that edition's prefix, or null at
// the root.
export function v2Href(href: string, prefix: string | null): string {
  if (!prefix) return href;
  // Demo collapse: /v2 lives at the root, so never add the /v2 prefix.
  if (COLLAPSED_FOR_DEMO && prefix === V2_PREFIX) return href;
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
  if (href === "/") return prefix;
  if (editionPrefix(href)) return href;
  if (!href.startsWith("/")) return href;
  return `${prefix}${href}`;
}

export function useV2Href() {
  const prefix = editionPrefix(usePathname());
  return (href: string) => v2Href(href, prefix);
}
