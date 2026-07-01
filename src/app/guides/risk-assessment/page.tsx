"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import {
  FORMULATION_SECTIONS, RMP_SECTIONS, MANDATORY_MDT_LINE,
  RISK_TEACHING, RISK_EXAMPLES, S1_STEPS, RISK_TYPES, SEPARATE_PLANS_NOTE,
  RMP_RISK_CHIPS, FORMULATION_RISK_CHIPS, BLANK_RISK,
  type RiskSection, type RiskChipGroup, type RmpSectionId, type FormulationSectionId,
} from "@/lib/data/guides";
import { useApp } from "@/app/providers";
import { useV2Href } from "@/lib/hooks/useV2";
import { FocusLinks } from "@/components/guides/FocusLinks";
import { PatientLink } from "@/components/guides/PatientLink";
import { Patient } from "@/lib/types";
import {
  ArrowLeft, Copy, Check, RotateCcw, ChevronDown, ChevronRight, Info,
  Lightbulb, AlertTriangle, GraduationCap, ListChecks, Sparkles, Plus, X, Pencil,
} from "lucide-react";

// localStorage key holding editor overrides for the RMP suggestion chips.
// Shape: { [risk]: { [sectionId]: RiskChipGroup[] } }. Only edited risk/sections
// are stored; everything else falls back to the RMP_RISK_CHIPS defaults.
const CHIP_OVERRIDE_KEY = "wardhub_rmp_chips";
type ChipOverrides = Record<string, Partial<Record<string, RiskChipGroup[]>>>;

// The RMP sections that actually carry suggestion chips (everything except WHAT).
const RMP_CHIP_SECTIONS = RMP_SECTIONS.filter((s) => s.id !== "what");

interface DatedExample { day: string; month: string; year: string; text: string }
interface SecState { chips: string[]; text: string; na: boolean; examples?: DatedExample[] }
type AllState = Record<string, SecState>;

// Build a natural date from any combination of day / month / year. Often we only
// know the month or the year of an incident, so every part is optional.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
function formatPartialDate(d: { day: string; month: string; year: string }): string {
  const monthName = d.month ? MONTHS[Number(d.month) - 1] : "";
  const parts: string[] = [];
  if (d.day && monthName) parts.push(d.day); // a day only makes sense with a month
  if (monthName) parts.push(monthName);
  if (d.year) parts.push(d.year);
  return parts.join(" ");
}

function naturalList(items: string[]): string {
  const a = items.filter(Boolean);
  if (a.length === 0) return "";
  if (a.length === 1) return a[0];
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
}
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const ensureStop = (s: string) => (!s ? s : /[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + ".");

function buildContent(st: SecState | undefined): string {
  if (!st) return "";
  if (st.na) return "Not yet established.";
  const parts: string[] = [];
  if (st.chips.length) parts.push(cap(naturalList(st.chips)));
  if (st.text.trim()) parts.push(cap(st.text.trim()));
  const exs = (st.examples || []).filter((e) => e.text.trim());
  if (exs.length) {
    const fmt = exs.map((e) => { const d = formatPartialDate(e); return `${d ? d + " - " : ""}${e.text.trim()}`; }).join("; ");
    parts.push(`Specific examples: ${fmt}`);
  }
  if (!parts.length) return "";
  return ensureStop(parts.map(ensureStop).join(" "));
}

// One editable section: chips (optionally grouped) + free text + "not yet established".
function SectionEditor({
  section, state, onChange,
}: {
  section: RiskSection;
  state: SecState;
  onChange: (next: SecState) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggleChip = (w: string) => {
    const has = state.chips.includes(w);
    onChange({ ...state, na: false, chips: has ? state.chips.filter((c) => c !== w) : [...state.chips, w] });
  };
  const examples = state.examples || [];
  const setExamples = (next: DatedExample[]) => onChange({ ...state, na: false, examples: next });
  const exampleCount = examples.filter((e) => e.text.trim()).length;
  const count =
    state.chips.length + (state.text.trim() ? 1 : 0) + exampleCount + (state.na ? 1 : 0);
  const chipsOnlyNoDetail =
    state.chips.length > 0 && !state.text.trim() && !state.na && exampleCount === 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-800 text-sm flex-1">{section.heading}</span>
        {count > 0 && (
          <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
            {state.na ? "n/a" : count}
          </span>
        )}
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 space-y-3">
          <p className="flex items-start gap-1.5 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
            {section.hint}
          </p>
          {section.trustExamples && (
            <p className="text-xs text-gray-400 italic">Trust guide: {section.trustExamples}</p>
          )}

          {section.groups.map((g, gi) => (
            <div key={gi}>
              {g.label && (
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">{g.label}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {g.words.map((w) => {
                  const on = state.chips.includes(w);
                  return (
                    <button
                      key={w}
                      onClick={() => toggleChip(w)}
                      aria-pressed={on}
                      className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all ${
                        on
                          ? "bg-rose-600 border-rose-600 text-white font-medium"
                          : "bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50"
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {section.gap && (
            <p className="flex items-start gap-1.5 text-xs text-rose-700/80">
              <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Gap prompt: {section.gap}
            </p>
          )}

          <textarea
            value={state.text}
            onChange={(e) => onChange({ ...state, na: false, text: e.target.value })}
            placeholder={section.placeholder || "Add patient-specific detail..."}
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 resize-y"
          />

          {section.examples && (
            <div className="rounded-lg border border-rose-100 bg-rose-50/40 p-2.5 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-rose-500">
                Specific examples (date optional - just the year, the month and year, or the full date)
              </p>
              {examples.map((ex, i) => {
                const upd = (patch: Partial<DatedExample>) =>
                  setExamples(examples.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={ex.day}
                        onChange={(e) => upd({ day: e.target.value })}
                        aria-label="Day"
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, d) => (
                          <option key={d + 1} value={String(d + 1)}>{d + 1}</option>
                        ))}
                      </select>
                      <select
                        value={ex.month}
                        onChange={(e) => upd({ month: e.target.value })}
                        aria-label="Month"
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                      >
                        <option value="">Month</option>
                        {MONTHS.map((m, mi) => (
                          <option key={m} value={String(mi + 1)}>{m}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={ex.year}
                        placeholder="Year"
                        onChange={(e) => upd({ year: e.target.value })}
                        aria-label="Year"
                        className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                      />
                      <button
                        onClick={() => setExamples(examples.filter((_, idx) => idx !== i))}
                        aria-label="Remove example"
                        className="ml-auto text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ex.text}
                      placeholder="what happened"
                      onChange={(e) => upd({ text: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                    />
                  </div>
                );
              })}
              <button
                onClick={() => setExamples([...examples, { day: "", month: "", year: "", text: "" }])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add example
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            {chipsOnlyNoDetail ? (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Add patient-specific detail
              </span>
            ) : <span />}
            <button
              onClick={() => onChange({ chips: [], text: "", na: !state.na })}
              className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                state.na ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Not yet established
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Collapsible teaching/help block.
function Collapse({ icon: Icon, title, children, tone = "gray" }: {
  icon: typeof Info; title: string; children: React.ReactNode; tone?: "gray" | "rose";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
        <Icon className={`w-4 h-4 ${tone === "rose" ? "text-rose-500" : "text-gray-400"}`} />
        <span className="font-bold text-gray-800 flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function OutputBox({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="rounded-2xl bg-slate-900 text-slate-100 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">{label}</span>
        <button
          onClick={copy}
          disabled={!text}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="px-4 pb-4">
        <div tabIndex={0} role="region" aria-label="Assembled output preview" className={`rounded-lg bg-slate-800 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap min-h-[60px] max-h-72 overflow-y-auto ${text ? "text-slate-100" : "text-slate-500 italic"}`}>
          {text || "Fill the sections below to build this."}
        </div>
      </div>
    </div>
  );
}

const EMPTY: SecState = { chips: [], text: "", na: false };

// Plain-text separators. SystemOne's risk screen is a basic notepad: it strips
// blank rows and keeps no formatting, so we separate sections with visible
// symbol lines (these survive) and head each plan with its risk name, so a nurse
// can still scan the entry once it is pasted in.
const TXT_BAR = "========================================";
const TXT_DIV = "----------------------------------------";

// Build one RMP block (trust template) for a single named risk. `displayName`
// overrides the title for the free-text "other" risk.
function buildOneRmp(risk: string, secs: Record<string, SecState>, displayName?: string, patientName?: string): string {
  const name = (displayName && displayName.trim()) || risk;
  const body = (id: string): string => {
    if (id === "what") {
      const ctx = buildContent(secs["what"]);
      return ctx || ensureStop(cap(name));
    }
    if (id === "next") {
      const n = buildContent(secs["next"]);
      return n ? `${ensureStop(n)} ${MANDATORY_MDT_LINE}` : MANDATORY_MDT_LINE;
    }
    return buildContent(secs[id]) || "Not yet established.";
  };
  const blocks: string[] = [
    TXT_BAR,
    `RISK MANAGEMENT PLAN: ${name.toUpperCase()}`,
    ...(patientName ? [`Patient: ${patientName}`] : []),
    TXT_BAR,
  ];
  RMP_SECTIONS.forEach((sec, i) => {
    blocks.push(sec.heading.toUpperCase());
    blocks.push(body(sec.id));
    if (i < RMP_SECTIONS.length - 1) blocks.push(TXT_DIV);
  });
  return blocks.join("\n");
}

// Merge every risk's RMP chips for one section - the palette for the "other"
// (unlisted) risk. Labels (manage / reduce) are preserved and de-duplicated.
function unionRmpGroups(sectionId: RmpSectionId): RiskChipGroup[] {
  const byLabel = new Map<string, string[]>();
  for (const r of RISK_TYPES) {
    const groups = RMP_RISK_CHIPS[r]?.[sectionId];
    if (!groups) continue;
    for (const g of groups) {
      const key = g.label || "";
      if (!byLabel.has(key)) byLabel.set(key, []);
      const arr = byLabel.get(key)!;
      for (const w of g.words) if (!arr.includes(w)) arr.push(w);
    }
  }
  return [...byLabel.entries()].map(([label, words]) => (label ? { label, words } : { words }));
}

// Formulation chips for a section, merged across the selected risks. "presenting"
// reuses each risk's RMP "present" chips (the observable signs ARE the
// presentation). The "other" risk pulls from every risk. Returns null to fall
// back to the section's generic chips (pattern / protective / engagement /
// judgement, which stay risk-neutral).
function formulationGroupsForRisks(sectionId: string, selected: string[]): RiskChipGroup[] | null {
  if (!selected.length) return null;
  const useAll = selected.includes(BLANK_RISK);
  const source = useAll ? RISK_TYPES : selected.filter((r) => r !== BLANK_RISK);
  // One group per risk (labelled with the risk name) so staff can spot the chips
  // that belong to each risk, rather than one merged blob.
  const groups: RiskChipGroup[] = [];
  for (const r of source) {
    const src = sectionId === "presenting"
      ? RMP_RISK_CHIPS[r]?.present
      : FORMULATION_RISK_CHIPS[r]?.[sectionId as FormulationSectionId];
    if (!src) continue;
    const words: string[] = [];
    for (const g of src) for (const w of g.words) if (!words.includes(w)) words.push(w);
    if (words.length) groups.push({ label: r, words });
  }
  return groups.length ? groups : null;
}

// Small inline "add a chip" input used in the chip editor.
function AddChip({ onAdd }: { onAdd: (word: string) => void }) {
  const [val, setVal] = useState("");
  const submit = () => { const w = val.trim(); if (w) { onAdd(w); setVal(""); } };
  return (
    <span className="inline-flex items-center gap-1">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
        placeholder="add chip"
        className="w-28 text-sm border border-dashed border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
      />
      <button
        onClick={submit}
        disabled={!val.trim()}
        aria-label="Add chip"
        className="text-rose-600 hover:text-rose-800 disabled:opacity-30 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </span>
  );
}

// Editor-only: edit the suggestion chips for ONE risk across its RMP sections.
function ChipBankEditor({
  risk, groupsFor, onAdd, onRemove, onReset,
}: {
  risk: string;
  groupsFor: (sectionId: string) => RiskChipGroup[];
  onAdd: (sectionId: string, groupIndex: number, word: string) => void;
  onRemove: (sectionId: string, groupIndex: number, word: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-rose-700/80 flex items-center gap-1.5">
          <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
          Editing the suggestion chips for <span className="font-semibold capitalize">{risk}</span>. Saved on this device.
        </p>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to default
        </button>
      </div>

      {RMP_CHIP_SECTIONS.map((sec) => {
        const groups = groupsFor(sec.id);
        return (
          <div key={sec.id} className="rounded-xl border border-gray-100 bg-white p-3 space-y-2">
            <p className="font-semibold text-gray-800 text-sm">{sec.heading}</p>
            {groups.map((g, gi) => (
              <div key={gi}>
                {g.label && (
                  <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">{g.label}</p>
                )}
                <div className="flex flex-wrap gap-1.5 items-center">
                  {g.words.map((w) => (
                    <span
                      key={w}
                      className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1.5 rounded-lg text-sm bg-rose-50 border border-rose-200 text-rose-800"
                    >
                      {w}
                      <button
                        onClick={() => onRemove(sec.id, gi, w)}
                        aria-label={`Remove ${w}`}
                        className="text-rose-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <AddChip onAdd={(word) => onAdd(sec.id, gi, word)} />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function RiskAssessmentPage() {
  const v2Href = useV2Href();
  const { user } = useApp();
  // Only editors (contributor flag) can change the suggestion chips.
  const canEditChips = !!user?.isContributor;
  const [editChips, setEditChips] = useState(false);
  // Which part the nurse is working on - starts null (neutral) so the page asks
  // them to choose first; only one part shows at a time (less on screen).
  const [stage, setStage] = useState<"formulation" | "rmp" | null>(null);

  const [patient, setPatient] = useState<Patient | null>(null);
  // Formulation (one integrated formulation per patient).
  const [fState, setFState] = useState<AllState>({});
  // RMP: one separate plan per selected risk -> risk name -> section -> state.
  const [risks, setRisks] = useState<string[]>([]);
  const [rmp, setRmp] = useState<Record<string, Record<string, SecState>>>({});
  // Name the nurse gives the free-text "other" risk (used as its plan title).
  const [blankName, setBlankName] = useState("");

  // Editor overrides for the suggestion chips, loaded from localStorage.
  const [chipOverrides, setChipOverrides] = useState<ChipOverrides>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHIP_OVERRIDE_KEY);
      if (raw) setChipOverrides(JSON.parse(raw));
    } catch { /* ignore corrupt value */ }
  }, []);
  const persistOverrides = (next: ChipOverrides) => {
    setChipOverrides(next);
    try { localStorage.setItem(CHIP_OVERRIDE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  // Effective suggestion chips for a risk+section: editor override, else the
  // risk-specific default, else null (caller falls back to the generic groups).
  const riskGroups = (risk: string, sectionId: string): RiskChipGroup[] | null =>
    chipOverrides[risk]?.[sectionId] ?? RMP_RISK_CHIPS[risk]?.[sectionId as RmpSectionId] ?? null;

  // A copy of an RMP section with its chips swapped for the risk-specific set.
  // The "other" risk gets the full palette merged from every risk.
  const sectionForRisk = (sec: RiskSection, risk: string): RiskSection => {
    if (risk === BLANK_RISK) {
      if (sec.id === "what") return sec;
      const merged = unionRmpGroups(sec.id as RmpSectionId);
      return merged.length ? { ...sec, groups: merged, trustExamples: undefined } : sec;
    }
    const specific = riskGroups(risk, sec.id);
    return specific ? { ...sec, groups: specific, trustExamples: undefined } : sec;
  };

  // A copy of a FORMULATION section with its chips tailored to the selected
  // risks (merged). Falls back to the generic chips when nothing matches.
  const formulationSectionFor = (sec: RiskSection): RiskSection => {
    const merged = formulationGroupsForRisks(sec.id, risks);
    return merged ? { ...sec, groups: merged } : sec;
  };

  // ---- Chip editing (editors only) ----
  // Start from the current override, or a deep copy of the default to edit.
  const baseGroups = (risk: string, sectionId: string): RiskChipGroup[] => {
    const cur = chipOverrides[risk]?.[sectionId];
    if (cur) return cur;
    const def = RMP_RISK_CHIPS[risk]?.[sectionId as RmpSectionId];
    return def ? def.map((g) => ({ ...g, words: [...g.words] })) : [];
  };
  const writeGroups = (risk: string, sectionId: string, groups: RiskChipGroup[]) =>
    persistOverrides({ ...chipOverrides, [risk]: { ...chipOverrides[risk], [sectionId]: groups } });
  const addChip = (risk: string, sectionId: string, gi: number, word: string) => {
    const w = word.trim();
    if (!w) return;
    writeGroups(risk, sectionId, baseGroups(risk, sectionId).map((g, i) =>
      i === gi && !g.words.includes(w) ? { ...g, words: [...g.words, w] } : g));
  };
  const removeChip = (risk: string, sectionId: string, gi: number, word: string) =>
    writeGroups(risk, sectionId, baseGroups(risk, sectionId).map((g, i) =>
      i === gi ? { ...g, words: g.words.filter((x) => x !== word) } : g));
  const resetRiskChips = (risk: string) => {
    const next = { ...chipOverrides };
    delete next[risk];
    persistOverrides(next);
  };

  const fGet = (id: string): SecState => fState[id] || EMPTY;
  const fSet = (id: string, next: SecState) => setFState((s) => ({ ...s, [id]: next }));

  const rGet = (risk: string, id: string): SecState => rmp[risk]?.[id] || EMPTY;
  const rSet = (risk: string, id: string, next: SecState) =>
    setRmp((s) => ({ ...s, [risk]: { ...s[risk], [id]: next } }));

  const toggleRisk = (risk: string) =>
    setRisks((rs) => (rs.includes(risk) ? rs.filter((r) => r !== risk) : [...rs, risk]));

  const reset = () => { setFState({}); setRisks([]); setRmp({}); setBlankName(""); };

  // Title used for a risk's RMP (the free-text "other" risk uses its given name).
  const rmpTitleFor = (risk: string) => (risk === BLANK_RISK ? blankName : undefined);

  // Formulation output (best-practice framework).
  const formulationText = useMemo(() => {
    const filled = FORMULATION_SECTIONS
      .map((sec) => ({ heading: sec.heading, body: buildContent(fState[sec.id]) }))
      .filter((s) => s.body);
    if (!filled.length) return "";
    const blocks: string[] = [
      TXT_BAR,
      "RISK FORMULATION",
      ...(patient ? [`Patient: ${patient.name}`] : []),
      TXT_BAR,
    ];
    filled.forEach((s, i) => {
      blocks.push(s.heading.toUpperCase());
      blocks.push(s.body);
      if (i < filled.length - 1) blocks.push(TXT_DIV);
    });
    return blocks.join("\n");
  }, [fState, patient]);

  // One RMP per selected risk, plus a combined "copy all".
  const allRmpsText = useMemo(
    () => risks.map((r) => buildOneRmp(r, rmp[r] || {}, r === BLANK_RISK ? blankName : undefined, patient?.name)).join("\n\n"),
    [risks, rmp, blankName, patient]
  );

  return (
    <MainLayout>
      <div className="space-y-5">
        <div>
          <Breadcrumb items={[{ label: "Guides", href: v2Href("/guides") }, { label: "Risk Assessment" }]} />
        </div>
        <FocusLinks links={[
          { label: "Risk Screening Assessment (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/10368/2454" },
          { label: "Risk Node", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/5321/2454" },
        ]} />

        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">⚠️</div>
              <div>
                <h1 className="text-3xl font-bold">Risk Formulation & Management Plan</h1>
                <p className="text-white/80 mt-1">
                  Build a good, personalised one - then copy it into the SystemOne Risk Screen.
                </p>
              </div>
            </div>
            <Link href={v2Href("/guides")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
          <PatientLink patient={patient} onChange={setPatient} guideTitle="Risk Assessment" note="Adds the patient's name to the formulation and RMP" />
        </div>

        {/* Context + reset */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex-1 min-w-[260px]">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Every patient needs a Risk Management Plan <strong>within 24 hours of admission</strong>. This is a drafting
              aid - the words are yours and you stay responsible for the final entry. Nothing is saved.
            </p>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Teaching */}
        <div className="space-y-2">
          <Collapse icon={GraduationCap} title="Learn: what good looks like" tone="rose">
            <div className="space-y-4">
              {[RISK_TEACHING.formulationVsPlan, RISK_TEACHING.ideationVsAction, RISK_TEACHING.commonMistakes, RISK_TEACHING.whatGoodLooks, RISK_TEACHING.gapMethod].map((blk) => (
                <div key={blk.title}>
                  <h4 className="font-bold text-gray-700 text-sm mb-1">{blk.title}</h4>
                  <ul className="space-y-1">
                    {blk.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-300 mt-1.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Collapse>
          <Collapse icon={ListChecks} title="Where this goes in SystemOne">
            <ol className="space-y-1.5">
              {S1_STEPS.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-xs font-mono text-gray-400 mt-0.5">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </Collapse>
        </div>

        {/* Which risks - drives the prompts in BOTH stages below */}
        <div className="bg-white rounded-2xl border-2 border-rose-300 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white bg-rose-600 px-2 py-0.5 rounded-full flex-shrink-0">Start here</span>
            <h2 className="font-bold text-gray-800 flex-1">Which risks have you identified?</h2>
            {canEditChips && (
              <button
                onClick={() => setEditChips((e) => !e)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  editChips
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-white border border-rose-200 text-rose-700 hover:bg-rose-50"
                }`}
              >
                {editChips ? <><Check className="w-3.5 h-3.5" /> Done</> : <><Pencil className="w-3.5 h-3.5" /> Edit chips</>}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Pick the patient&apos;s risks. The prompts in both stages below tailor to what you choose. Use
            {" "}<strong>other (unlisted risk)</strong> for anything the list misses - it brings up every prompt so
            you can cover it.
          </p>

          {editChips && (
            <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm text-indigo-800">
              <Pencil className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Editor mode: change the suggestion chips staff see for each risk (Stage 2). Pick a risk below,
                then edit it. Changes are saved on this device. Click <strong>Done</strong> to go back.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {RISK_TYPES.map((rt) => {
              const on = risks.includes(rt);
              return (
                <button
                  key={rt}
                  onClick={() => toggleRisk(rt)}
                  aria-pressed={on}
                  className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all ${
                    on
                      ? "bg-rose-600 border-rose-600 text-white font-medium"
                      : "bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50"
                  }`}
                >
                  {rt}
                </button>
              );
            })}
            <button
              onClick={() => toggleRisk(BLANK_RISK)}
              aria-pressed={risks.includes(BLANK_RISK)}
              className={`px-2.5 py-1.5 rounded-lg text-sm border border-dashed transition-all ${
                risks.includes(BLANK_RISK)
                  ? "bg-amber-500 border-amber-500 text-white font-medium"
                  : "bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
              }`}
            >
              + other (unlisted risk)
            </button>
          </div>

          {risks.includes(BLANK_RISK) && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Name the &quot;other&quot; risk
              </label>
              <input
                value={blankName}
                onChange={(e) => setBlankName(e.target.value)}
                placeholder="e.g. risk of ligature from specific item, gambling relapse..."
                className="w-full text-sm border border-amber-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* Neutral start: ask the user which part to tackle first */}
        {!editChips && stage === null && (
          <div className="bg-white rounded-2xl border-2 border-rose-300 p-5 text-center space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">What do you want to tackle first?</h2>
              <p className="text-sm text-gray-500 mt-1">
                A good risk entry has two parts. Pick one to focus on - you can switch between them any time.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setStage("formulation")}
                className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 hover:border-rose-500 hover:bg-rose-50 p-4 text-left transition-all"
              >
                <span className="block text-[11px] font-mono uppercase tracking-wider text-rose-500">Part 1</span>
                <span className="block text-lg font-bold text-gray-800">Formulation</span>
                <span className="block text-sm text-gray-500">the WHY - why the risk exists</span>
                <span className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-rose-700">Work on this <ChevronRight className="w-4 h-4" /></span>
              </button>
              <button
                onClick={() => setStage("rmp")}
                className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 hover:border-rose-500 hover:bg-rose-50 p-4 text-left transition-all"
              >
                <span className="block text-[11px] font-mono uppercase tracking-wider text-rose-500">Part 2</span>
                <span className="block text-lg font-bold text-gray-800">Management Plan (RMP)</span>
                <span className="block text-sm text-gray-500">the WHAT - what we do about it</span>
                <span className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-rose-700">Work on this <ChevronRight className="w-4 h-4" /></span>
              </button>
            </div>
          </div>
        )}

        {/* Segmented slider once a part is chosen - clearly switch between the two */}
        {!editChips && stage !== null && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-sm font-semibold text-gray-500">Working on:</span>
            <div className="inline-flex bg-rose-100 rounded-full p-1">
              <button
                onClick={() => setStage("formulation")}
                aria-pressed={stage === "formulation"}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${stage === "formulation" ? "bg-rose-600 text-white shadow" : "text-rose-700 hover:bg-white/60"}`}
              >
                Part 1 · Formulation
              </button>
              <button
                onClick={() => setStage("rmp")}
                aria-pressed={stage === "rmp"}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${stage === "rmp" ? "bg-rose-600 text-white shadow" : "text-rose-700 hover:bg-white/60"}`}
              >
                Part 2 · RMP
              </button>
            </div>
          </div>
        )}

        {/* Part 1: Formulation */}
        {!editChips && stage === "formulation" && (
          <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="font-bold text-gray-800">Risk Formulation - the WHY</h2>
            </div>
            <p className="text-xs text-gray-500">
              Explains why the risk exists, linking history, current presentation and future risk. (Best-practice
              framework - not a specific trust form.)
              {risks.length > 0 && (
                <span className="text-rose-600"> Prompts below are grouped by the risk{risks.length > 1 ? "s" : ""} you picked.</span>
              )}
            </p>
            <div className="space-y-2">
              {FORMULATION_SECTIONS.map((sec) => (
                <SectionEditor key={sec.id} section={formulationSectionFor(sec)} state={fGet(sec.id)} onChange={(n) => fSet(sec.id, n)} />
              ))}
            </div>
            <OutputBox text={formulationText} label="Your risk formulation - copy into SystmOne" />
            <div className="rounded-2xl border-2 border-dashed border-rose-200 p-4 text-center space-y-2">
              <p className="text-sm text-gray-600">Done the formulation? The management plan is the other half.</p>
              <button
                onClick={() => setStage("rmp")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
              >
                Now tackle Part 2 - the Management Plan <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Part 2: RMP - one separate plan per risk (chip editor shares this section) */}
        {(editChips || stage === "rmp") && (
          <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="font-bold text-gray-800 flex-1">Risk Management Plans - the WHAT</h2>
            </div>

            {!editChips && (
              <div className="flex items-start gap-2 bg-rose-100/70 border border-rose-200 rounded-xl p-3 text-sm text-rose-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{SEPARATE_PLANS_NOTE}</p>
              </div>
            )}

            {risks.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                {editChips
                  ? "Pick one or more risks above to edit their suggestion chips."
                  : "Pick one or more risks in Start Here (top of the page) to build a plan for each."}
              </p>
            )}

            {/* One plan (or chip editor) per selected risk */}
            <div className="space-y-4">
              {risks.map((risk) => (
                <div key={risk} className="rounded-2xl border border-rose-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border-b border-rose-100">
                    <h3 className="font-bold text-rose-900 flex-1 capitalize">
                      {risk === BLANK_RISK ? (blankName.trim() || "Other (unlisted risk)") : risk}
                    </h3>
                    <button
                      onClick={() => toggleRisk(risk)}
                      className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    {editChips ? (
                      risk === BLANK_RISK ? (
                        <p className="text-sm text-gray-500 p-2">
                          The &quot;other&quot; risk always shows every prompt from every risk, so there are no chips to
                          edit here. Edit a specific risk instead.
                        </p>
                      ) : (
                        <ChipBankEditor
                          risk={risk}
                          groupsFor={(sectionId) =>
                            chipOverrides[risk]?.[sectionId] ?? RMP_RISK_CHIPS[risk]?.[sectionId as RmpSectionId]
                              ?? RMP_SECTIONS.find((s) => s.id === sectionId)?.groups ?? []}
                          onAdd={(sectionId, gi, word) => addChip(risk, sectionId, gi, word)}
                          onRemove={(sectionId, gi, word) => removeChip(risk, sectionId, gi, word)}
                          onReset={() => resetRiskChips(risk)}
                        />
                      )
                    ) : (
                      <>
                        {RMP_SECTIONS.map((sec) => (
                          <SectionEditor
                            key={sec.id}
                            section={sectionForRisk(sec, risk)}
                            state={rGet(risk, sec.id)}
                            onChange={(n) => rSet(risk, sec.id, n)}
                          />
                        ))}
                        <OutputBox
                          text={buildOneRmp(risk, rmp[risk] || {}, rmpTitleFor(risk), patient?.name)}
                          label={`RMP - ${risk === BLANK_RISK ? (blankName.trim() || "other") : risk} - copy into SystmOne`}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!editChips && risks.length > 1 && (
              <OutputBox text={allRmpsText} label={`All ${risks.length} plans - copy all`} />
            )}
            {!editChips && (
              <div className="rounded-2xl border-2 border-dashed border-rose-200 p-4 text-center space-y-2">
                <p className="text-sm text-gray-600">Want to revisit the why behind these plans?</p>
                <button
                  onClick={() => setStage("formulation")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-rose-300 text-rose-700 font-semibold hover:bg-rose-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Part 1 - the Formulation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Examples */}
        <Collapse icon={Lightbulb} title="Examples: weak vs strong" tone="rose">
          <p className="text-xs text-amber-600 italic mb-3 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Draft examples - to be verified against trust guidance.
          </p>
          <div className="space-y-4">
            {RISK_EXAMPLES.map((ex) => (
              <div key={ex.id}>
                <h4 className="font-bold text-gray-800 text-sm mb-2">{ex.risk}</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                    <p className="text-xs font-bold text-red-700 mb-1.5">{ex.weak.label}</p>
                    <p className="text-xs text-gray-600 mb-2"><strong>Formulation:</strong> {ex.weak.formulation}</p>
                    <pre className="text-[11px] text-gray-600 whitespace-pre-wrap font-sans">{ex.weak.rmp}</pre>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50/50 p-3">
                    <p className="text-xs font-bold text-green-700 mb-1.5">{ex.strong.label}</p>
                    <p className="text-xs text-gray-600 mb-2"><strong>Formulation:</strong> {ex.strong.formulation}</p>
                    <pre className="text-[11px] text-gray-600 whitespace-pre-wrap font-sans">{ex.strong.rmp}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Collapse>

        <p className="text-xs text-gray-400 text-center">
          Drafting aid only. Grounded in the DHCFT Risk Management Plans guidance. Always review wording before it goes in the record.
        </p>
      </div>
    </MainLayout>
  );
}
