"use client";

// Shared rich risk-capture editor + builders.
//
// Extracted so BOTH the Risk Assessment builder (/guides/risk-assessment) and the
// Welcome admission tool (/welcome) can capture a risk the same rich way: chip
// word-banks (risk-specific where available) + free text + "not yet established"
// + optional dated examples, then assemble the SystmOne-ready text.
//
// (The risk-assessment page still has its own in-file copy for now; this module
// is the de-duplicated home going forward - wire that page to it in a later pass.)

import { useState } from "react";
import {
  FORMULATION_SECTIONS, RMP_SECTIONS, MANDATORY_MDT_LINE,
  RMP_RISK_CHIPS, FORMULATION_RISK_CHIPS,
  type RiskSection, type RiskChipGroup, type RmpSectionId, type FormulationSectionId,
} from "@/lib/data/guides/risk";
import {
  ChevronDown, ChevronRight, Info, Sparkles, AlertTriangle, Plus, X,
} from "lucide-react";

// ---- state ----
export interface DatedExample { day: string; month: string; year: string; text: string }
export interface SecState { chips: string[]; text: string; na: boolean; examples?: DatedExample[] }
export type AllState = Record<string, SecState>;
export const EMPTY: SecState = { chips: [], text: "", na: false };

// ---- text helpers ----
export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const ensureStop = (s: string) => (!s ? s : /[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + ".");
export function naturalList(items: string[]): string {
  const a = items.filter(Boolean);
  if (a.length === 0) return "";
  if (a.length === 1) return a[0];
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function formatPartialDate(d: { day: string; month: string; year: string }): string {
  const monthName = d.month ? MONTHS[Number(d.month) - 1] : "";
  const parts: string[] = [];
  if (d.day && monthName) parts.push(d.day);
  if (monthName) parts.push(monthName);
  if (d.year) parts.push(d.year);
  return parts.join(" ");
}
// Sort key for a dated example - higher is more recent; missing parts count as 0.
const exampleKey = (e: { day: string; month: string; year: string }) =>
  (Number(e.year) || 0) * 10000 + (Number(e.month) || 0) * 100 + (Number(e.day) || 0);

export function buildContent(st: SecState | undefined): string {
  if (!st) return "";
  if (st.na) return "Not yet established.";
  const parts: string[] = [];
  if (st.chips.length) parts.push(cap(naturalList(st.chips)));
  if (st.text.trim()) parts.push(cap(st.text.trim()));
  let out = parts.length ? ensureStop(parts.map(ensureStop).join(" ")) : "";
  const exs = (st.examples || []).filter((e) => e.text.trim())
    .sort((a, b) => exampleKey(b) - exampleKey(a));
  if (exs.length) {
    // Most recent first, each on its own line, straight into the dates (no label).
    const fmt = exs.map((e) => { const d = formatPartialDate(e); return `${d ? d + " - " : ""}${e.text.trim()}`; }).join("\n");
    out = `${out ? out + "\n" : ""}${fmt}`;
  }
  return out;
}

// ---- plain-text format (SystmOne risk screen strips blank rows) ----
const TXT_BAR = "========================================";
const TXT_DIV = "----------------------------------------";

export function buildFormulation(state: AllState, title = "RISK FORMULATION", patientName?: string): string {
  const filled = FORMULATION_SECTIONS
    .map((sec) => ({ heading: sec.heading, body: buildContent(state[sec.id]) }))
    .filter((s) => s.body);
  if (!filled.length) return "";
  const blocks: string[] = [TXT_BAR, title, ...(patientName ? [`Patient: ${patientName}`] : []), TXT_BAR];
  filled.forEach((s, i) => {
    blocks.push(s.heading.toUpperCase());
    blocks.push(s.body);
    if (i < filled.length - 1) blocks.push(TXT_DIV);
  });
  return blocks.join("\n");
}

export function buildOneRmp(risk: string, secs: AllState, displayName?: string, patientName?: string): string {
  const name = (displayName && displayName.trim()) || risk;
  const body = (id: string): string => {
    if (id === "what") {
      const ctx = buildContent(secs["what"]);
      return ctx ? `${ensureStop(cap(name))} ${ctx}` : ensureStop(cap(name));
    }
    if (id === "next") {
      const n = buildContent(secs["next"]);
      return n ? `${ensureStop(n)} ${MANDATORY_MDT_LINE}` : MANDATORY_MDT_LINE;
    }
    return buildContent(secs[id]) || "Not yet established.";
  };
  const blocks: string[] = [TXT_BAR, name.toUpperCase(), ...(patientName ? [`Patient: ${patientName}`] : []), TXT_BAR];
  RMP_SECTIONS.forEach((sec, i) => {
    blocks.push(sec.heading.toUpperCase());
    blocks.push(body(sec.id));
    if (i < RMP_SECTIONS.length - 1) blocks.push(TXT_DIV);
  });
  return blocks.join("\n");
}

// ---- per-risk chip resolution (single risk) ----
// Swap a formulation section's generic chips for this risk's chips where we have
// them. "presenting" reuses the risk's RMP "present" chips (the observable signs
// ARE the presentation). Falls back to the section's generic chips.
export function formulationSectionForRisk(sec: RiskSection, risk: string): RiskSection {
  const groups: RiskChipGroup[] | undefined =
    sec.id === "presenting"
      ? RMP_RISK_CHIPS[risk]?.present
      : FORMULATION_RISK_CHIPS[risk]?.[sec.id as FormulationSectionId];
  return groups && groups.length ? { ...sec, groups, trustExamples: undefined } : sec;
}
export function rmpSectionForRisk(sec: RiskSection, risk: string): RiskSection {
  const groups = RMP_RISK_CHIPS[risk]?.[sec.id as RmpSectionId];
  return groups && groups.length ? { ...sec, groups, trustExamples: undefined } : sec;
}

// ---- the editor (chips + free text + na + optional dated examples) ----
export function SectionEditor({
  section, state, onChange, accent = "rose",
}: {
  section: RiskSection;
  state: SecState;
  onChange: (next: SecState) => void;
  accent?: "rose" | "violet";
}) {
  const [open, setOpen] = useState(false);
  const A = accent === "violet"
    ? { on: "bg-violet-600 border-violet-600", hover: "hover:border-violet-300 hover:bg-violet-50", ring: "focus:ring-violet-400 focus:border-violet-400", badge: "text-violet-700 bg-violet-100", spark: "text-violet-700/80", chipText: "text-violet-800", chipBg: "bg-violet-50 border-violet-200" }
    : { on: "bg-rose-600 border-rose-600", hover: "hover:border-rose-300 hover:bg-rose-50", ring: "focus:ring-rose-400 focus:border-rose-400", badge: "text-rose-700 bg-rose-100", spark: "text-rose-700/80", chipText: "text-rose-800", chipBg: "bg-rose-50 border-rose-200" };

  const toggleChip = (w: string) => {
    const has = state.chips.includes(w);
    onChange({ ...state, na: false, chips: has ? state.chips.filter((c) => c !== w) : [...state.chips, w] });
  };
  const examples = state.examples || [];
  const setExamples = (next: DatedExample[]) => onChange({ ...state, na: false, examples: next });
  const exampleCount = examples.filter((e) => e.text.trim()).length;
  const count = state.chips.length + (state.text.trim() ? 1 : 0) + exampleCount + (state.na ? 1 : 0);
  const chipsOnlyNoDetail = state.chips.length > 0 && !state.text.trim() && !state.na && exampleCount === 0;
  // Only rendered once a section is opened (interaction), so new Date() is safe.
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 71 }, (_, i) => thisYear - i);

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-gray-50 transition-colors text-left">
        <span className="font-semibold text-gray-800 text-sm flex-1">{section.heading}</span>
        {count > 0 && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${A.badge}`}>{state.na ? "n/a" : count}</span>}
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-start gap-1.5 text-xs text-gray-500 flex-1"><Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />{section.hint}</p>
            <button onClick={() => onChange({ chips: [], text: "", na: !state.na })} aria-pressed={state.na}
              className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${state.na ? "bg-gray-700 text-white border-gray-700" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800"}`}>
              Not yet established
            </button>
          </div>

          {section.groups.map((g, gi) => (
            <div key={gi}>
              {g.label && <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">{g.label}</p>}
              <div className="flex flex-wrap gap-1.5">
                {g.words.map((w) => {
                  const on = state.chips.includes(w);
                  return (
                    <button key={w} onClick={() => toggleChip(w)} aria-pressed={on}
                      className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all ${on ? `${A.on} text-white font-medium` : `bg-white border-gray-200 text-gray-600 ${A.hover}`}`}>
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {section.gap && <p className={`flex items-start gap-1.5 text-xs ${A.spark}`}><Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Gap prompt: {section.gap}</p>}

          <textarea value={state.text} onChange={(e) => onChange({ ...state, na: false, text: e.target.value })}
            placeholder={section.placeholder || "Add patient-specific detail..."} rows={2}
            className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 ${A.ring} resize-y`} />

          {section.examples && (
            <div className={`rounded-lg border ${A.chipBg} p-2.5 space-y-2`}>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Specific examples (date optional)</p>
              {examples.map((ex, i) => {
                const upd = (patch: Partial<DatedExample>) => setExamples(examples.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <select value={ex.day} onChange={(e) => upd({ day: e.target.value })} aria-label="Day" className={`text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white ${A.ring}`}>
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, d) => <option key={d + 1} value={String(d + 1)}>{d + 1}</option>)}
                      </select>
                      <select value={ex.month} onChange={(e) => upd({ month: e.target.value })} aria-label="Month" className={`text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white ${A.ring}`}>
                        <option value="">Month</option>
                        {MONTHS.map((m, mi) => <option key={m} value={String(mi + 1)}>{m}</option>)}
                      </select>
                      <select value={ex.year} onChange={(e) => upd({ year: e.target.value })} aria-label="Year" className={`text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white ${A.ring}`}>
                        <option value="">Year</option>
                        {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                      </select>
                      <button onClick={() => setExamples(examples.filter((_, idx) => idx !== i))} aria-label="Remove example" className="ml-auto text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                    <input type="text" value={ex.text} placeholder="what happened" onChange={(e) => upd({ text: e.target.value })} className={`w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 ${A.ring}`} />
                  </div>
                );
              })}
              <button onClick={() => setExamples([...examples, { day: "", month: "", year: "", text: "" }])} className={`inline-flex items-center gap-1 text-xs font-semibold ${A.chipText} hover:opacity-80 transition-opacity`}>
                <Plus className="w-3.5 h-3.5" /> Add example
              </button>
            </div>
          )}

          {chipsOnlyNoDetail && <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Add patient-specific detail</span>}
        </div>
      )}
    </div>
  );
}
