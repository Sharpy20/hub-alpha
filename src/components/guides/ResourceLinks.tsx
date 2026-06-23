"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Lock, Shield, X, FileText, AlertCircle } from "lucide-react";
import { useV2Href } from "@/lib/hooks/useV2";
import type { GuideLink } from "@/lib/data/guides/admission";

// Renders a row of resource-link chips with the right behaviour per kind:
//  - in-app links ("/...")     -> Next <Link>, v2-aware
//  - FOCUS links               -> show the Trust-login warning, then open
//  - public links              -> open in a new tab
//  - links with no url          -> disabled "Link to confirm" chip
export function ResourceLinks({ links }: { links: GuideLink[] }) {
  const v2Href = useV2Href();
  const [focusUrl, setFocusUrl] = useState<string | null>(null);

  if (!links?.length) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {links.map((linkItem, i) => {
          const { label, url, requiresFocus, isForm } = linkItem;

          // No URL yet - render a disabled chip the user can see needs sorting.
          if (!url) {
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 border border-dashed border-gray-300 cursor-not-allowed"
                title="This link is not wired up yet"
              >
                <FileText className="w-3.5 h-3.5" />
                {label}
                <span className="text-[10px] uppercase tracking-wide text-gray-400">to confirm</span>
              </span>
            );
          }

          // In-app link.
          if (url.startsWith("/")) {
            return (
              <Link
                key={i}
                href={v2Href(url)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors no-underline border border-indigo-100"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          }

          // FOCUS (Trust intranet) link - confirm first.
          if (requiresFocus) {
            return (
              <button
                key={i}
                onClick={() => setFocusUrl(url)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors border border-amber-200"
              >
                <Lock className="w-3.5 h-3.5" />
                {label}
                <span className="text-[10px] uppercase tracking-wide bg-amber-200 text-amber-900 px-1 rounded">FOCUS</span>
              </button>
            );
          }

          // Public (or blank-form) external link.
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors no-underline border border-blue-100"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {label}
              {isForm && (
                <span className="text-[10px] uppercase tracking-wide bg-blue-200 text-blue-900 px-1 rounded">form</span>
              )}
            </a>
          );
        })}
      </div>

      {/* FOCUS login warning modal (matches the Links page pattern) */}
      {focusUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setFocusUrl(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="FOCUS login required"
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">FOCUS Login Required</h3>
              </div>
              <button onClick={() => setFocusUrl(null)} className="text-white/80 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Trust Network Access</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This link opens a FOCUS resource. You must be on the Trust network and logged in to FOCUS to view it.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setFocusUrl(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (focusUrl) window.open(focusUrl, "_blank", "noopener,noreferrer");
                    setFocusUrl(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Open anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
