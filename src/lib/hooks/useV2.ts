"use client";

import { usePathname } from "next/navigation";

const V2_PREFIX = "/v2";

export function useIsV2(): boolean {
  const pathname = usePathname();
  if (!pathname) return false;
  return pathname === V2_PREFIX || pathname.startsWith(V2_PREFIX + "/");
}

export function v2Href(href: string, isV2: boolean): string {
  if (!isV2) return href;
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
  const isV2 = useIsV2();
  return (href: string) => v2Href(href, isV2);
}
