"use client";

// Breaks a long guide step into collapsible sections. Mike's pattern (27 Jul
// 2026): "truncate each paragraph under its header until clicked".
//
// Sections are derived from the text, NOT from new data fields, because the
// guides already write headers as a short line ending in a colon with bullets
// underneath. That makes the sweep across the other text-heavy guides (BACKLOG
// Section N item 3.5) a one-flag change per step rather than a rewrite of the
// content. Anything before the first header stays visible as an intro - it is
// usually the "why you are reading this" paragraph and hiding it would be daft.

import { useState, useMemo, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Section {
  header: string;
  /** Header without the trailing colon - what a walk matches on. */
  key: string;
  body: string[];
}

// A header is a short line ending in ":" that is not a bullet and not a
// sentence. The length cap stops a long paragraph that happens to end in a
// colon from being mistaken for a heading.
const isHeader = (line: string) =>
  line.trim().endsWith(":") &&
  !line.trim().startsWith("•") &&
  !line.trim().startsWith("-") &&
  line.trim().length <= 70;

// Referral workflows bullet with "•", how-to guides with "- ". Both indent.
const isBullet = (line: string) => line.startsWith("•") || line.startsWith("- ");

export function splitIntoSections(content: string): {
  intro: string[];
  sections: Section[];
  outro: string[];
} {
  const lines = content.split("\n");
  const intro: string[] = [];
  const sections: Section[] = [];

  for (const line of lines) {
    if (isHeader(line)) {
      const header = line.trim();
      sections.push({ header, key: header.replace(/:$/, "").trim(), body: [] });
    } else if (sections.length === 0) {
      intro.push(line);
    } else {
      sections[sections.length - 1].body.push(line);
    }
  }

  // Drop trailing blank lines so a collapsed section does not measure its
  // preview against an empty string.
  sections.forEach((s) => {
    while (s.body.length && s.body[s.body.length - 1].trim() === "") s.body.pop();
  });

  // Guides often close with a standalone line that belongs to the whole step,
  // not to the last header - "If a child is in immediate danger, call 999."
  // sitting under "Key resources". Naively it lands inside the final section and
  // gets hidden behind a click, which for a 999 line is exactly wrong. So peel
  // any trailing prose off the last section and render it in the open.
  const outro: string[] = [];
  const last = sections[sections.length - 1];
  if (last && last.body.some(isBullet)) {
    while (last.body.length) {
      const line = last.body[last.body.length - 1];
      if (isBullet(line)) break;
      outro.unshift(last.body.pop() as string);
    }
    while (outro.length && outro[0].trim() === "") outro.shift();
  }

  return { intro, sections, outro };
}

// First real line of the body, trimmed of its bullet, as the teaser.
const previewOf = (body: string[]) => {
  const first = body.find((l) => l.trim() !== "");
  if (!first) return "";
  return first.trim().replace(/^[•-]\s*/, "");
};

export function ProgressiveContent({
  content,
  renderLine,
  extras,
  size = "lg",
}: {
  content: string;
  /** Reuse the viewer's link/contact renderer so behaviour does not diverge. */
  renderLine: (line: string) => ReactNode;
  /** Extra UI to drop at the end of a named section, keyed by header text. */
  extras?: Record<string, ReactNode>;
  /** Referral steps run at text-lg; how-to guides at the body size. */
  size?: "lg" | "base";
}) {
  const { intro, sections, outro } = useMemo(() => splitIntoSections(content), [content]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const bodyClass = size === "lg" ? "text-gray-600 text-lg" : "text-gray-700 leading-relaxed";

  const allOpen = sections.length > 0 && sections.every((s) => open[s.key]);
  const toggleAll = () => {
    if (allOpen) setOpen({});
    else setOpen(Object.fromEntries(sections.map((s) => [s.key, true])));
  };

  // Nothing to collapse - render it the way the viewer always did.
  if (sections.length === 0) {
    return (
      <div>
        {content.split("\n").map((line, i) => (
          <p
            key={i}
            className={`${bodyClass} ${isBullet(line) ? "ml-4" : ""} ${line === "" ? "h-3" : "mb-1.5"}`}
          >
            {renderLine(line)}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div>
      {intro.length > 0 && (
        <div className="mb-5">
          {intro.map((line, i) => (
            <p
              key={i}
              className={`${bodyClass} ${isBullet(line) ? "ml-4" : ""} ${line === "" ? "h-3" : "mb-1.5"}`}
            >
              {renderLine(line)}
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-end mb-2">
        <button
          onClick={toggleAll}
          className="text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((s) => {
          const isOpen = !!open[s.key];
          const preview = previewOf(s.body);
          return (
            <div
              key={s.key}
              className={`rounded-xl border-2 overflow-hidden transition-colors ${
                isOpen ? "border-purple-300 bg-purple-50/40" : "border-gray-200 bg-white"
              }`}
            >
              <button
                onClick={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}
                aria-expanded={isOpen}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-purple-50 transition-colors"
              >
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-gray-900">{s.key}</span>
                  {!isOpen && preview && (
                    <span className="block text-sm text-gray-500 truncate mt-0.5">{preview}</span>
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pl-12">
                  {s.body.map((line, i) => (
                    <p
                      key={i}
                      className={`text-gray-700 ${isBullet(line) ? "ml-4" : ""} ${line === "" ? "h-3" : "mb-1.5"}`}
                    >
                      {renderLine(line)}
                    </p>
                  ))}
                  {extras?.[s.key] && <div className="mt-4">{extras[s.key]}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {outro.length > 0 && (
        <div className="mt-4">
          {outro.map((line, i) => (
            <p
              key={i}
              className={`${bodyClass} ${isBullet(line) ? "ml-4" : ""} ${line === "" ? "h-3" : "mb-1.5"}`}
            >
              {renderLine(line)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
