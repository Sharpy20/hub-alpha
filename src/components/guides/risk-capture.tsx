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

import { useEffect, useState } from "react";
import {
  FORMULATION_SECTIONS, RMP_SECTIONS, MANDATORY_MDT_LINE,
  RMP_RISK_CHIPS, FORMULATION_RISK_CHIPS,
  type RiskSection, type RiskChipGroup, type ChipSource, type RmpSectionId, type FormulationSectionId,
} from "@/lib/data/guides/risk";
import {
  loadUserChips, addUserChip, removeUserChip, bankKey as bankKeyFor,
} from "@/lib/data/guides/user-chips";
import {
  ChevronDown, ChevronRight, Info, Sparkles, AlertTriangle, Plus, X, UserPen,
} from "lucide-react";

// ---- state ----
// `id` is set only on examples added through the risk tool's quick capture, so
// one event can be traced across every domain it was filed under and pulled back
// out again. Examples typed straight into a domain have no id.
export interface DatedExample { day: string; month: string; year: string; text: string; id?: string; source?: string }

// Where an event came from. A risk screen mixes what staff saw with what the
// person said, what a relative said and what is written in an old assessment,
// and the four are not the same weight of evidence. Recording the source is what
// stops "recorded allegation of assault" being read later as "assaulted a care
// worker" - the tool must never quietly promote a report into a finding.
export const EVENT_SOURCES: string[] = [
  "Observed by staff",
  "Reported by the person",
  "Reported by family or carer",
  "Reported by police or criminal justice service",
  "Recorded in a previous assessment",
  "Source not established",
];
export interface SecState { chips: string[]; text: string; na: boolean; examples?: DatedExample[] }
export type AllState = Record<string, SecState>;
export const EMPTY: SecState = { chips: [], text: "", na: false };

// What SectionEditor hands back. It passes an UPDATER for anything that toggles -
// chips, examples, "not yet established" - because building the next value from
// the `state` prop reads whatever the last render captured, so two clicks landing
// in the same tick lose one. That fault has already been found twice on the risk
// page (the capture panel and every domain handler); this is the third place.
// Free text still passes a plain value: it comes from a controlled input, one
// keystroke at a time.
export type SecUpdate = SecState | ((prev: SecState) => SecState);
/** Resolve an updater against the state the parent currently holds. */
export const applySec = (prev: SecState | undefined, next: SecUpdate): SecState =>
  typeof next === "function" ? next(prev || EMPTY) : next;

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

// An empty section and a section the nurse deliberately marked "not yet
// established" are different things and must not print the same (Section 11 of
// the 22 Aug brief). buildContent() emits "Not yet established." for the second;
// this is what the first says.
export const NOT_COMPLETED = "This section has not yet been completed.";

export function buildOneRmp(
  risk: string, secs: AllState, displayName?: string, patientName?: string,
  // Printed in the plan's HEADER, above the bar - deliberately outside the five
  // Trust headings, because it is a fact about the plan rather than a section of
  // it. Adding a heading of our own to a mandated template is the thing not to do.
  involvement?: string,
): string {
  const name = (displayName && displayName.trim()) || risk;
  const body = (id: string): string => {
    if (id === "what") {
      // The plan is already headed with the risk name, so repeating it here read
      // as "Fire Setting. Risk of deliberate fire setting." Question 1 now names
      // the outcome directly; the risk name is only the fallback if it is blank.
      return buildContent(secs["what"]) || ensureStop(cap(name));
    }
    if (id === "next") {
      const n = buildContent(secs["next"]);
      return n ? `${ensureStop(n)} ${MANDATORY_MDT_LINE}` : MANDATORY_MDT_LINE;
    }
    // The trust guide asks for two things under this one heading - what we do
    // when it happens, and what prevents it. They are captured as two answers
    // and printed as two labelled lines so neither half can be lost.
    if (id === "prevent" && (secs["prevent__manage"] || secs["prevent__reduce"])) {
      const manage = buildContent(secs["prevent__manage"]);
      const reduce = buildContent(secs["prevent__reduce"]);
      const lines: string[] = [];
      if (manage) lines.push(`When it happens: ${manage}`);
      if (reduce) lines.push(`To prevent or reduce: ${reduce}`);
      return lines.length ? lines.join("\n") : NOT_COMPLETED;
    }
    return buildContent(secs[id]) || NOT_COMPLETED;
  };
  const blocks: string[] = [
    TXT_BAR, name.toUpperCase(),
    ...(patientName ? [`Patient: ${patientName}`] : []),
    ...(involvement ? [`Person involved in this plan: ${involvement}`] : []),
    TXT_BAR,
  ];
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
  section, state, onChange, accent = "rose", bank,
}: {
  section: RiskSection;
  state: SecState;
  onChange: (next: SecUpdate) => void;
  accent?: "rose" | "violet";
  // Identifies this question's chip bank so words the user adds come back next
  // time they plan the same risk. Omit to hide "add your own".
  bank?: { risk: string; questionId: string };
}) {
  const [open, setOpen] = useState(false);
  const [userChips, setUserChips] = useState<string[]>([]);
  const [newChip, setNewChip] = useState("");

  // Three tiers: what this risk points at, the general library, and the honest
  // "we have not worked this out yet" options. See RiskChipGroup.tier.
  const suggested = section.groups.filter((g) => (g.tier ?? "suggested") === "suggested" && g.words.length);
  const allGroups = section.groups.filter((g) => g.tier === "all" && g.words.length);
  const gapGroups = section.groups.filter((g) => g.tier === "incomplete" && g.words.length);

  // Read the user's own words for this bank once the section is opened.
  useEffect(() => {
    if (!open || !bank) return;
    setUserChips(loadUserChips()[bankKeyFor(bank.risk, bank.questionId)] || []);
  }, [open, bank?.risk, bank?.questionId]); // eslint-disable-line react-hooks/exhaustive-deps
  const A = accent === "violet"
    ? { on: "bg-violet-600 border-violet-600", hover: "hover:border-violet-300 hover:bg-violet-50", ring: "focus:ring-violet-400 focus:border-violet-400", badge: "text-violet-700 bg-violet-100", spark: "text-violet-700/80", chipText: "text-violet-800", chipBg: "bg-violet-50 border-violet-200" }
    // Calm by default. A selected chip is "chosen", not "urgent" - bright red here
    // made every picked word look like an alert (Mike, 20 Aug 2026).
    : { on: "bg-sky-700 border-sky-700", hover: "hover:border-slate-400 hover:bg-slate-50", ring: "focus:ring-sky-500 focus:border-sky-500", badge: "text-slate-600 bg-slate-100", spark: "text-slate-600", chipText: "text-slate-700", chipBg: "bg-slate-50 border-slate-200" };

  const toggleChip = (w: string) =>
    onChange((prev) => ({
      ...prev, na: false,
      chips: prev.chips.includes(w) ? prev.chips.filter((c) => c !== w) : [...prev.chips, w],
    }));

  // Trust wording is plain; anything wardHub wrote carries a purple ring so the
  // two layers are never mistaken for each other.
  const renderChip = (w: string, source: ChipSource) => {
    const on = state.chips.includes(w);
    const ring = source === "trust" ? "" : "ring-1 ring-purple-300";
    return (
      <button key={w} onClick={() => toggleChip(w)} aria-pressed={on}
        title={source === "trust" ? undefined : "wardHub prompt, not trust wording"}
        className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all ${ring} ${on ? `${A.on} text-white font-medium` : `bg-white border-gray-200 text-gray-600 ${A.hover}`}`}>
        {w}
      </button>
    );
  };
  const examples = state.examples || [];
  const setExamples = (fn: (prev: DatedExample[]) => DatedExample[]) =>
    onChange((prev) => ({ ...prev, na: false, examples: fn(prev.examples || []) }));
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
        {section.dest && (
          <span
            title={section.dest === "plan"
              ? "This answer goes into the risk management plan - the document the trust requires within 24 hours"
              : section.dest === "formulation"
                ? "This answer goes into the risk formulation, field 9 on SystmOne"
                : "This answer goes into both the formulation and the plan"}
            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${
              section.dest === "plan" ? "bg-rose-100 text-rose-700"
                : section.dest === "formulation" ? "bg-indigo-100 text-indigo-700"
                  : "bg-gradient-to-r from-indigo-100 to-rose-100 text-gray-700"
            }`}
          >
            {section.dest === "plan" ? "Plan" : section.dest === "formulation" ? "Formulation" : "Both"}
          </span>
        )}
        {count > 0
          ? <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${A.badge}`}>{state.na ? "n/a" : count}</span>
          // Section 11: an empty section is not hidden behind filler. Say so.
          : <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">Not completed</span>}
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-start gap-1.5 text-xs text-gray-500 flex-1"><Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />{section.hint}</p>
            {/* The generic "not yet established" only appears where the question
                has no named version of its own - otherwise the same idea sat on
                screen twice, in two places, worded differently. */}
            {gapGroups.length === 0 && (
              <button onClick={() => onChange((prev) => ({ chips: [], text: "", na: !prev.na }))} aria-pressed={state.na}
                className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${state.na ? "bg-gray-700 text-white border-gray-700" : "bg-white border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800"}`}>
                Not yet established
              </button>
            )}
          </div>

          {/* Suggested first, because the nurse's own sub-domain and indicator
              ticks point at them. Nothing here is ever preselected. */}
          {suggested.map((g, gi) => (
            <div key={`s${gi}`}>
              {g.label && <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">{g.label}</p>}
              <div className="flex flex-wrap gap-1.5">
                {g.words.map((w) => renderChip(w, g.source || "wardhub"))}
              </div>
            </div>
          ))}

          {/* The universal library. Shown, not hidden behind a toggle (Mike,
              22 Aug) - just set apart from the tailored words above it by a rule
              and its own heading, so you can see which is which at a glance. */}
          {allGroups.length > 0 && (
            <div className={suggested.length ? "pt-3 border-t border-dashed border-gray-200 space-y-2" : "space-y-2"}>
              {allGroups.map((g, gi) => (
                <div key={`a${gi}`}>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                    {g.label || "General options"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.words.map((w) => renderChip(w, g.source || "wardhub"))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* The user's own words for this bank, plus the box to add more. */}
          {bank && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">Your words</p>
              <div className="flex flex-wrap gap-1.5">
                {userChips.map((w) => (
                  <span key={w} className={`inline-flex items-center rounded-lg border text-sm transition-all ring-1 ring-purple-400 ${state.chips.includes(w) ? `${A.on} text-white` : "bg-white border-purple-200 text-gray-600"}`}>
                    <UserPen className={`w-3 h-3 ml-2 flex-shrink-0 ${state.chips.includes(w) ? "text-white/80" : "text-purple-500"}`} />
                    <button onClick={() => toggleChip(w)} aria-pressed={state.chips.includes(w)} className="pl-1.5 pr-1 py-1.5 font-medium text-left">{w}</button>
                    <button
                      onClick={() => { setUserChips((c) => c.filter((x) => x !== w)); removeUserChip(bank.risk, bank.questionId, w); if (state.chips.includes(w)) toggleChip(w); }}
                      aria-label={`Delete your word ${w}`}
                      className={`pr-2 pl-0.5 py-1.5 ${state.chips.includes(w) ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-red-600"}`}
                    ><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const w = newChip.trim();
                    if (!w || userChips.some((x) => x.toLowerCase() === w.toLowerCase())) { setNewChip(""); return; }
                    addUserChip(bank.risk, bank.questionId, w);
                    setUserChips((c) => [...c, w]);
                    onChange((prev) => ({ ...prev, na: false, chips: [...prev.chips, w] })); // added means you meant it
                    setNewChip("");
                  }}
                  className="inline-flex items-center gap-1"
                >
                  <input
                    value={newChip}
                    onChange={(e) => setNewChip(e.target.value)}
                    placeholder="add your own..."
                    aria-label="Add your own suggestion word"
                    autoComplete="off"
                    className={`text-sm border border-dashed border-purple-300 rounded-lg px-2.5 py-1.5 w-40 ${A.ring}`}
                  />
                  <button type="submit" aria-label="Add word" className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="inline-block w-3 h-3 rounded border border-gray-200 ring-1 ring-purple-400 flex-shrink-0" />
            Purple = a wardHub prompt or your own word, not wording from the trust form.
          </p>

          {section.gap && <p className={`flex items-start gap-1.5 text-xs ${A.spark}`}><Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Gap prompt: {section.gap}</p>}

          <textarea value={state.text} onChange={(e) => onChange((prev) => ({ ...prev, na: false, text: e.target.value }))}
            placeholder={section.placeholder || "Add patient-specific detail..."} rows={2}
            className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 ${A.ring} resize-y`} />

          {/* Recording a gap honestly. Kept apart from the suggestions and styled
              as a warning, because "no early warning signs established" is a hole
              in the plan and must never read as "there are none". */}
          {gapGroups.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-700">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" /> If you cannot establish this yet
              </p>
              <div className="flex flex-wrap gap-1.5">
                {gapGroups.flatMap((g) => g.words).map((w) => {
                  const on = state.chips.includes(w);
                  return (
                    <button key={w} onClick={() => toggleChip(w)} aria-pressed={on}
                      className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all ring-1 ring-purple-300 ${on ? "bg-amber-600 border-amber-600 text-white font-medium" : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50"}`}>
                      {w}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-amber-800">This records a gap for review. It does not say there is nothing to find.</p>
            </div>
          )}

          {section.examples && (
            <div className={`rounded-lg border ${A.chipBg} p-2.5 space-y-2`}>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Specific examples (date optional)</p>
              {examples.map((ex, i) => {
                const upd = (patch: Partial<DatedExample>) => setExamples((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
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
                      <button onClick={() => setExamples((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove example" className="ml-auto text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                    <input type="text" value={ex.text} placeholder="what happened" onChange={(e) => upd({ text: e.target.value })} className={`w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 ${A.ring}`} />
                    {/* Where it came from - see EVENT_SOURCES. */}
                    <select value={ex.source || ""} onChange={(e) => upd({ source: e.target.value })} aria-label="Where this came from"
                      className={`w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white ${A.ring}`}>
                      <option value="">Where did this come from?</option>
                      {EVENT_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                );
              })}
              <button onClick={() => setExamples((prev) => [...prev, { day: "", month: "", year: "", text: "" }])} className={`inline-flex items-center gap-1 text-xs font-semibold ${A.chipText} hover:opacity-80 transition-opacity`}>
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
