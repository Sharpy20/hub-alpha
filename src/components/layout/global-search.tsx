"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Link2, ExternalLink, Lock, CornerDownLeft } from "lucide-react";
import { useV2Href } from "@/lib/hooks/useV2";
import { useModalA11y } from "@/lib/hooks/useModalA11y";

type Result =
  | { kind: "guide"; id: string; title: string; sub: string; icon: string; type: string; path: string }
  | { kind: "link"; id: string; title: string; sub: string; icon: string; url: string; focus: boolean };

// PERFORMANCE: the search index (guide catalog + every bookmark, which drags
// in the referral-workflows data behind guideType) used to be imported at
// module scope. The header renders on every page, so ~120 kB of data shipped
// in every route's first load. It is now dynamic-imported the first time the
// palette opens - the header button and Ctrl+K stay instant.
type SearchIndex = {
  guides: (typeof import("@/lib/data/guides/catalog"))["ALL_GUIDES"];
  guideType: (typeof import("@/lib/data/guides/catalog"))["guideType"];
  links: (typeof import("@/lib/data/bookmarks"))["bookmarks"];
};

// Rank a match: 2 = title starts with query, 1 = title contains, 0 = other field
function score(query: string, title: string, extra: string): number {
  const q = query.toLowerCase();
  const t = title.toLowerCase();
  if (t.startsWith(q)) return 2;
  if (t.includes(q)) return 1;
  if (extra.toLowerCase().includes(q)) return 0;
  return -1;
}

export function GlobalSearch() {
  const router = useRouter();
  const link = useV2Href();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load the search index the first time the palette opens
  useEffect(() => {
    if (!open || index) return;
    let alive = true;
    Promise.all([
      import("@/lib/data/guides/catalog"),
      import("@/lib/data/bookmarks"),
    ]).then(([catalog, links]) => {
      if (alive) {
        setIndex({ guides: catalog.ALL_GUIDES, guideType: catalog.guideType, links: links.bookmarks });
      }
    });
    return () => { alive = false; };
  }, [open, index]);

  // Focus trap + Escape + focus return while the palette is open
  useModalA11y(panelRef, () => setOpen(false), open);

  // Ctrl/Cmd+K toggles the palette from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // focus after the panel mounts
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim();
    if (q.length < 2 || !index) return [];

    const guides = index.guides
      .map((g) => ({ g, s: score(q, g.title, `${g.description} ${g.category}`) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map<Result>(({ g }) => ({
        kind: "guide", id: g.id, title: g.title, sub: g.category,
        icon: g.icon, type: index.guideType(g.id), path: g.viewerPath,
      }));

    const links = index.links
      .map((b) => ({ b, s: score(q, b.title, `${b.description || ""} ${b.category} ${b.phone || ""}`) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map<Result>(({ b }) => ({
        kind: "link", id: b.id, title: b.title, sub: b.phone || b.category,
        icon: b.icon, url: b.url, focus: !!b.requiresFocus,
      }));

    return [...guides, ...links];
  }, [query, index]);

  useEffect(() => { setActive(0); }, [query]);

  const choose = useCallback((r: Result) => {
    setOpen(false);
    if (r.kind === "guide") {
      router.push(link(r.path));
    } else if (r.focus) {
      // FOCUS links need the styled network warning that lives on the Links page
      router.push(link("/links"));
    } else {
      window.open(r.url, "_blank", "noopener,noreferrer");
    }
  }, [router, link]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && results[active]) { e.preventDefault(); choose(results[active]); }
  };

  return (
    <>
      {/* Trigger - compact icon button that sits in the header */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search guides and links"
        title="Search (Ctrl+K)"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline text-sm font-medium">Search</span>
        <kbd className="hidden lg:inline text-[10px] font-mono bg-white border border-slate-300 rounded px-1 py-0.5 text-slate-500">Ctrl K</kbd>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input - pt keeps the input's focus outline from being clipped
                by the panel's rounded overflow-hidden top edge */}
            <div className="flex items-center gap-3 px-4 pt-1.5 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Search guides and links"
                placeholder="Search guides and links..."
                className="flex-1 py-4 text-base outline-none placeholder:text-gray-400"
              />
              <kbd className="text-[10px] font-mono bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-gray-600">Esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim().length < 2 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Type to search across every guide and link.
                </p>
              ) : !index ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading&hellip;
                </p>
              ) : results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  No matches for &quot;{query.trim()}&quot;.
                </p>
              ) : (
                <ul className="py-2">
                  {results.map((r, i) => (
                    <li key={`${r.kind}-${r.id}`}>
                      <button
                        onMouseEnter={() => setActive(i)}
                        onClick={() => choose(r)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          i === active ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-xl w-7 text-center flex-shrink-0">{r.icon}</span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 truncate">{r.title}</span>
                            {r.kind === "link" && r.focus && (
                              <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" aria-label="FOCUS login needed" />
                            )}
                          </span>
                          <span className="block text-xs text-gray-500 truncate">{r.sub}</span>
                        </span>
                        <span className="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide">
                          {r.kind === "guide" ? (
                            <span className="flex items-center gap-1 text-rose-500"><FileText className="w-3 h-3" />{r.type}</span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600"><Link2 className="w-3 h-3" />Link</span>
                          )}
                          {i === active && <CornerDownLeft className="w-3.5 h-3.5 text-indigo-400" />}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-600">
              <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Links open in a new tab</span>
              <span>&uarr; &darr; to move &middot; &crarr; to open</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
