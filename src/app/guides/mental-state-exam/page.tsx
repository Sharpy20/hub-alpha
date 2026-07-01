"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import { MSE_DOMAINS } from "@/lib/data/guides";
import { useV2Href } from "@/lib/hooks/useV2";
import { toLocalDateStr } from "@/lib/utils/date";
import { PatientLink } from "@/components/guides/PatientLink";
import { Patient } from "@/lib/types";
import {
  ArrowLeft, Copy, Check, RotateCcw, ChevronDown, ChevronRight, Info, Lightbulb,
} from "lucide-react";

// "a, b and c"
function naturalList(items: string[]): string {
  const arr = items.filter(Boolean);
  if (arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
}
function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default function MseBuilderPage() {
  const v2Href = useV2Href();
  // domainId -> selected words (array keeps insertion order for the output)
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({ appearance: true });
  // domainId -> free-text the nurse adds beyond the chips
  const [freeText, setFreeText] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  const today = useMemo(() => toLocalDateStr(), []);

  const toggleWord = (domainId: string, word: string) => {
    setSelected((prev) => {
      const cur = prev[domainId] || [];
      const next = cur.includes(word) ? cur.filter((w) => w !== word) : [...cur, word];
      return { ...prev, [domainId]: next };
    });
  };

  const totalSelected = Object.values(selected).reduce((n, arr) => n + arr.length, 0);
  const hasContent = totalSelected > 0 || Object.values(freeText).some((v) => v.trim() !== "");

  // Build the written MSE (plain text, headed lines).
  const output = useMemo(() => {
    const lines: string[] = [];
    for (const d of MSE_DOMAINS) {
      const picks = selected[d.id] || [];
      const extra = (freeText[d.id] || "").trim();
      if (!picks.length && !extra) continue;
      const segs: string[] = [];
      if (picks.length) {
        const body = naturalList(picks);
        segs.push(d.prefix ? `${d.prefix} ${body}` : cap(body));
      }
      if (extra) segs.push(cap(extra));
      lines.push(`${d.title}: ${segs.join(". ")}.`);
    }
    if (!lines.length) return "";
    const header = patient ? `Patient: ${patient.name}\nMental State Examination (${today})` : `Mental State Examination (${today})`;
    return `${header}\n\n${lines.join("\n")}`;
  }, [selected, freeText, today, patient]);

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const reset = () => { setSelected({}); setFreeText({}); };
  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;

  return (
    <MainLayout>
      <div className="space-y-5">
        <div className="print:hidden">
          <Breadcrumb
            items={[
              { label: "Guides", href: v2Href("/guides") },
              { label: "Mental State Examination" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">
                🧠
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mental State Examination</h1>
                <p className="text-white/80 mt-1">
                  Tick what fits in each domain. Your MSE builds at the top - copy it into the notes.
                </p>
              </div>
            </div>
            <Link
              href={v2Href("/guides")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              All guides
            </Link>
          </div>
        </div>

        <PatientLink patient={patient} onChange={setPatient} guideTitle="Mental State Examination" />

        {/* Sticky output panel */}
        <div className="sticky top-2 z-20 rounded-2xl bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Your MSE
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {hasContent ? `${wordCount} words` : "empty"}
            </span>
          </div>
          <div className="px-4 pb-4">
            <div
              tabIndex={0}
              role="region"
              aria-label="Assembled output preview"
              className={`rounded-lg bg-slate-800 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap min-h-[64px] max-h-60 overflow-y-auto ${
                output ? "text-slate-100" : "text-slate-500 italic"
              }`}
            >
              {output || "Tick options below to build the MSE."}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={copy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={reset}
                disabled={!hasContent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Teaching note */}
        <div className="flex items-start gap-2 bg-purple-50 border border-purple-100 rounded-xl p-3 text-sm text-purple-800">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            New to the MSE? Each card explains what that domain captures. This is the UK structure - pick the words
            that match what you saw, then read it back to check it sounds right. It is a drafting aid, not a record:
            you stay responsible for the final note.
          </p>
        </div>

        {/* Domain cards */}
        <div className="space-y-3">
          {MSE_DOMAINS.map((domain, i) => {
            const picks = selected[domain.id] || [];
            const isOpen = !!openDomains[domain.id];
            return (
              <div key={domain.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenDomains((o) => ({ ...o, [domain.id]: !o[domain.id] }))}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-xs font-mono text-gray-400 w-5">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-bold text-gray-800 flex-1">{domain.title}</span>
                  {(picks.length > 0 || (freeText[domain.id] || "").trim() !== "") && (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      {picks.length || "•"}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="flex items-start gap-1.5 text-sm text-gray-500 mb-3">
                      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                      {domain.hint}
                    </p>
                    <div className="space-y-3">
                      {domain.groups.map((group, gi) => (
                        <div key={gi}>
                          {group.label && (
                            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                              {group.label}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {group.words.map((word) => {
                              const on = picks.includes(word);
                              return (
                                <button
                                  key={word}
                                  onClick={() => toggleWord(domain.id, word)}
                                  aria-pressed={on}
                                  className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all ${
                                    on
                                      ? "bg-purple-600 border-purple-600 text-white font-medium"
                                      : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50"
                                  }`}
                                >
                                  {word}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                        Free text (anything the chips do not cover)
                      </label>
                      <textarea
                        value={freeText[domain.id] || ""}
                        onChange={(e) => setFreeText((f) => ({ ...f, [domain.id]: e.target.value }))}
                        rows={2}
                        placeholder={`Add your own ${domain.title.toLowerCase()} detail...`}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-y"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center">
          UK Mental State Examination structure. A drafting aid only - always review the wording before it goes in the record.
        </p>
      </div>
    </MainLayout>
  );
}
