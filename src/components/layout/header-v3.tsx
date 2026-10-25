"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Link2, BookHeart, Pencil, Info, MessageSquare, Sun, Moon, Monitor } from "lucide-react";
import { useApp, type ColorMode } from "@/app/providers";
import { useV2Href } from "@/lib/hooks/useV2";
import { GlobalSearch } from "./global-search";

// The header for 3.0, the guides-only edition. Nobody signs in to 3.0, so
// there is no profile, role, ward or demo selector, and nothing on the menu
// leads out of 3.0. Appearance is the one setting left, kept in this browser.

const NAV = [
  { href: "/guides", label: "Guides", icon: FileText, tone: "bg-rose-50 hover:bg-rose-100 text-rose-700" },
  { href: "/links", label: "Links", icon: Link2, tone: "bg-amber-50 hover:bg-amber-100 text-amber-700" },
  { href: "/patient-guides", label: "Leaflets", icon: BookHeart, tone: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700" },
  { href: "/admin/guides", label: "Editor", icon: Pencil, tone: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
];

const V3_TITLE = "wardHub 3.0 - Guides, Links & Leaflets";

const NEXT_MODE: Record<ColorMode, ColorMode> = { light: "dark", dark: "system", system: "light" };
const MODE_LABEL: Record<ColorMode, string> = { light: "Light", dark: "Dark", system: "Auto" };
const MODE_ICON = { light: Sun, dark: Moon, system: Monitor };

export function HeaderV3() {
  const link = useV2Href();
  const pathname = usePathname() || "";
  const { colorMode, setColorMode } = useApp();
  const ModeIcon = MODE_ICON[colorMode];

  // The site-wide title names the diary, which 3.0 does not have. Next streams
  // that title in after the page has loaded, so setting it once is not enough:
  // put the 3.0 title back whenever the head changes it.
  useEffect(() => {
    const apply = () => {
      if (document.title !== V3_TITLE) document.title = V3_TITLE;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  const isCurrent = (href: string) => {
    const full = link(href);
    return pathname === full || pathname.startsWith(full + "/");
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link href={link("/")} className="flex items-center gap-2 group" aria-label="wardHub 3.0 home">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-xl">&#x1F3E5;</span>
            </div>
            <div className="leading-none">
              <p className="text-xs font-bold text-gray-500 group-hover:text-indigo-500 transition-colors">ward</p>
              <p className="text-xl font-black text-gray-900 group-hover:text-indigo-700 transition-colors -mt-0.5">Hub</p>
            </div>
            <span className="ml-1 px-2 py-0.5 rounded-md bg-nhs-blue text-white text-xs font-bold tabular-nums">3.0</span>
          </Link>

          <GlobalSearch />

          <nav aria-label="Main" className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/50 rounded-xl border border-slate-200">
            {NAV.map(({ href, label, icon: Icon, tone }) => (
              <Link
                key={href}
                href={link(href)}
                aria-current={isCurrent(href) ? "page" : undefined}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors text-sm no-underline ${tone} ${isCurrent(href) ? "ring-2 ring-offset-1 ring-current" : ""}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 ml-auto">
            <Link href={link("/about")} className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1.5 transition-colors text-sm no-underline">
              <Info className="w-4 h-4" aria-hidden="true" />
              About 3.0
            </Link>
            <Link href={link("/feedback")} className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors text-sm no-underline">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              Feedback
            </Link>
            <button
              type="button"
              onClick={() => setColorMode(NEXT_MODE[colorMode])}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors text-sm"
              aria-label={`Appearance: ${MODE_LABEL[colorMode]}. Switch to ${MODE_LABEL[NEXT_MODE[colorMode]]}`}
            >
              <ModeIcon className="w-4 h-4" aria-hidden="true" />
              {MODE_LABEL[colorMode]}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
