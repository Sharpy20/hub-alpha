"use client";

// Risk Screen, Formulation & Management Plan tool.
//
// Reworked (2 Jul 2026, v2) after Mike's feedback that one long 7-domain page was
// daunting and the WHY/WHAT split felt duplicated. Two changes:
//
// 1. STEP-BY-STEP WIZARD. The SystmOne risk screen is worked one domain at a time
//    (like a step-by-step guide), with a progress bar that ticks green as each
//    domain is done, plus a final "Review" step. Much less on screen at once.
//
// 2. ONE QUESTION SET (not WHY vs WHAT). For each identified risk the nurse
//    answers ONE ordered run of plain questions - they don't need to know they're
//    building two documents. Each question maps behind the scenes to a formulation
//    section OR an RMP section (see UNIFIED_QUESTIONS). "Generate" then splits the
//    answers into the Risk Screen, the Formulation and the Management Plan. No
//    chip is shown twice.
//
// Still the approved SystmOne WAA Risk Screening Tool wording (never paraphrased);
// only "the person" is personalised on screen with the linked patient's name.
// Nothing is saved - all state is in memory.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb, Modal } from "@/components/ui";
import {
  RMP_SECTIONS,
  RISK_TEACHING, RISK_EXAMPLES,
  type RiskSection, type RiskChipGroup,
} from "@/lib/data/guides/risk";
import {
  RMP_QUESTIONS, questionsForDomain, type RmpQuestion,
} from "@/lib/data/guides/risk-questions";
import { whatIsTheRiskFor, DOMAIN_RMP_CHIPS } from "@/lib/data/guides/rmp-chips";
import {
  RISK_DOMAINS, SUBTYPE_RISK, CLINICAL_INDICATORS, SCREEN_TAIL, indicatorRoute,
  buildFormulationSummary, formulationSummaryLines,
  FORMULATION_SUMMARY_NOTE, FORMULATION_NOT_COMPLETED,
} from "@/lib/data/welcome/risk-screen";
import {
  SectionEditor, buildOneRmp,
  rmpSectionForRisk, naturalList, cap, ensureStop, applySec,
  type AllState, type SecState, type SecUpdate, type DatedExample, EMPTY,
} from "@/components/guides/risk-capture";
import { useV2Href } from "@/lib/hooks/useV2";
import { FocusLinks } from "@/components/guides/FocusLinks";
import { PatientLink } from "@/components/guides/PatientLink";
import { Patient } from "@/lib/types";
import { loadTracker, saveTracker, seedPatient } from "@/lib/data/care-review";
import { toLocalDateStr } from "@/lib/utils/date";
import { printClinicalDoc } from "@/lib/utils/printDoc";
import { printRiskProofreadPack } from "@/lib/utils/riskProofreadPack";
import {
  ArrowLeft, Copy, Check, CheckCircle2, RotateCcw, ChevronDown,
  ChevronRight, Info, Lightbulb, AlertTriangle, GraduationCap, ListChecks,
  Sparkles, ShieldAlert, ClipboardCheck, Plus, X, Star, Printer, Clock, History as HistoryIcon, UserPen,
} from "lucide-react";

type YN = "" | "yes" | "no";

interface DomainState {
  indicators: YN; indicatorList: string[]; safety: YN; current: string; historical: string;
  noEvidence: boolean; risks: string[]; // selected sub-domain labels
  customSubs: string[];                 // nurse-named extra sub-domains for this domain
  customIndicators: string[];           // nurse-named extra clinical indicators
  ownRmp: string[];                     // sub-domains / indicators flagged "Requires own RMP"
  currentExamples: DatedExample[];
  historicalExamples: DatedExample[];
}
const emptyDomain = (): DomainState => ({
  indicators: "", indicatorList: [], safety: "", current: "", historical: "",
  noEvidence: false, risks: [], customSubs: [], customIndicators: [], ownRmp: [], currentExamples: [], historicalExamples: [],
});

interface RiskRef { key: string; label: string; chipRisk: string; domainId: string }

// One captured event, as it currently sits in the domains. Derived from state
// rather than tracked alongside it, so removing an example inside a domain can
// never leave a stale row in the captured list.
interface CapturedRow {
  id: string;
  text: string;
  day: string; month: string; year: string;
  places: { domainId: string; when: "current" | "historical" }[];
}

// Ids for captured events. A plain counter - no dates or randomness, so it cannot
// differ between server and client render.
let captureSeq = 0;

const R_SECTION = (id: string) => RMP_SECTIONS.find((s) => s.id === id)!;

// Narrow a section's chips to one labelled group. Used by the two halves of HOW
// TO PREVENT / REDUCE so each question shows only its own words. Falls back to
// everything if a risk's bank does not use the labels.
function pickGroup(groups: RiskChipGroup[], label?: string): RiskChipGroup[] {
  if (!label) return groups;
  const hit = groups.filter((g) => g.label === label);
  return hit.length ? hit : groups;
}

// ---- Chip resolution for the six plan questions ---------------------------
//
// Mike, 22 Aug: "the questions have the same chips regardless of domain, they are
// not customised to that domain or that domain's clinical indicators - this
// generates repetitive RMPs."
//
// Three tiers now, in this order:
//   1. the ticked CLINICAL INDICATORS that belong on this question. These are the
//      only Trust-sourced words on the page, so they come first and are marked as
//      such. They are OFFERED, never inserted - an indicator says why the domain
//      was relevant, not what is true of this person.
//   2. the ticked SUB-DOMAINS' own banks, labelled with the sub-domain when more
//      than one contributed, so two sub-domains never blur into one list.
//   3. the universal library, folded behind "show all options".
// Plus the honest-gap option where the question has one.

// Suggested chips drawn from the sub-domains actually ticked. Question 1 is served
// by WHAT_IS_THE_RISK (keyed by sub-domain); the rest by that sub-domain's RMP bank.
//
// ⛔ THERE IS NO FALLBACK TO RMP_SECTIONS' OWN CHIPS, and that is deliberate.
// Those were written for self-harm, so borrowing them offered "reduced incidents
// of self-harm" as a sign the plan was working on a fire-setting risk (Mike,
// 22 Aug). If nothing ticked has a bank of its own, this returns nothing and the
// general library below carries the question - it is domain-neutral, which the
// old generic bank never was.
function suggestedGroups(q: RmpQuestion, domainId: string, subs: { label: string; risk: string }[]): RiskChipGroup[] {
  if (q.suggest.section === "what") {
    return whatIsTheRiskFor(domainId, subs.map((s) => s.label));
  }
  const out: RiskChipGroup[] = [];
  const seen = new Set<string>();

  // The domain's own bank, written for this domain and covering all its
  // sub-domains. This is the reviewed content and it carries the question.
  const domainWords = q.suggest.bank ? DOMAIN_RMP_CHIPS[domainId]?.[q.suggest.bank] : undefined;
  for (const w of domainWords || []) seen.add(w);

  // Anything the ticked sub-domain's older wardHub bank adds on top - fire
  // setting's "requests for lighters / matches", say, which the domain bank
  // covers only as "preoccupation with fire". Deduped, so nothing shows twice.
  const base = R_SECTION(q.suggest.section);
  const seenRisk = new Set<string>();
  for (const { label, risk } of subs) {
    if (!risk || seenRisk.has(risk)) continue;
    seenRisk.add(risk);
    const resolved = rmpSectionForRisk(base, risk);
    if (resolved === base) continue;                           // no tailored bank
    const extra: string[] = [];
    for (const g of pickGroup(resolved.groups, q.suggest.group)) {
      for (const w of g.words) if (!seen.has(w)) { seen.add(w); extra.push(w); }
    }
    if (extra.length) out.push({ label: `For ${label.toLowerCase()}`, words: extra });
  }

  if (domainWords?.length) out.push({ label: "For this domain", words: domainWords });
  return out;
}

// Assemble one question's display section.
function buildQuestionSection(
  q: RmpQuestion,
  domainId: string,
  subs: { label: string; risk: string }[],
  indicatorWords: string[],
): RiskSection {
  const groups: RiskChipGroup[] = [];
  if (indicatorWords.length) {
    groups.push({ label: "From the clinical indicators you ticked", words: indicatorWords, source: "trust" });
  }
  const tailored = suggestedGroups(q, domainId, subs);
  groups.push(...tailored);
  if (q.universal.length) {
    groups.push({ label: "General options", words: q.universal, tier: "all" });
  }
  if (q.incomplete) groups.push({ words: [q.incomplete], tier: "incomplete" });
  // Say why there are no tailored words rather than quietly showing none. This
  // happens when no sub-domain is ticked yet, or when the nurse named their own.
  let hint = tailored.length || indicatorWords.length ? q.hint
    : `${q.hint} (Tick a sub-domain above and this question will suggest words for it.)`;
  // Two domains carry a standing instruction from the design: domain 5 because
  // its sub-domains are broad enough that the indicators have to steer, and
  // domain 6 because it must stay conservative and safeguarding-led.
  const note = q.suggest.bank ? DOMAIN_RMP_CHIPS[domainId]?.note : undefined;
  if (note) hint = `${hint} ${note}`;
  return {
    id: q.id, heading: `${q.n}. ${q.question}`, hint, gap: q.gap,
    groups, examples: q.examples,
  };
}

// One risk's six answers, keyed by the RMP section they fill. Questions 3 and 4
// both feed HOW TO PREVENT / REDUCE, so they are kept apart here and printed as
// two labelled lines by buildOneRmp.
function deriveRmp(cap: AllState | undefined): AllState {
  const out: AllState = {};
  for (const q of RMP_QUESTIONS) {
    out[q.writes.part ? `${q.writes.id}__${q.writes.part}` : q.writes.id] = cap?.[q.id] || EMPTY;
  }
  return out;
}
// The combined formulation + RMP documents are built inside the component now
// (buildFormulationText / buildRmpText) because they fold in the domain's ticked
// clinical indicators and honour the per-item "Requires own RMP" toggles.
const answered = (st?: SecState) => !!st && (st.chips.length > 0 || st.text.trim() !== "" || st.na || (st.examples || []).some((e) => e.text.trim()));

const TXT_BAR = "========================================";
const TXT_DIV = "----------------------------------------";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
function formatPartialDate(d: { day: string; month: string; year: string }): string {
  const monthName = d.month ? MONTHS[Number(d.month) - 1] : "";
  const parts: string[] = [];
  if (d.day && monthName) parts.push(d.day);
  if (monthName) parts.push(monthName);
  if (d.year) parts.push(d.year);
  return parts.join(" ");
}
// Sort key for a dated example - higher is more recent. Missing parts count as 0,
// so undated examples sink to the bottom.
const exampleKey = (e: { day: string; month: string; year: string }) =>
  (Number(e.year) || 0) * 10000 + (Number(e.month) || 0) * 100 + (Number(e.day) || 0);

function withExamples(text: string, examples: DatedExample[] = []): string {
  const base = text.trim();
  const exs = examples.filter((e) => e.text.trim()).sort((a, b) => exampleKey(b) - exampleKey(a));
  if (!exs.length) return base;
  // Most recent first, each on its own line, straight into the dates (no label).
  const fmt = exs.map((e) => { const d = formatPartialDate(e); return `${d ? d + " - " : ""}${e.text.trim()}`; }).join("\n");
  return `${base ? base + "\n" : ""}${fmt}`;
}

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
  }
}

function YNToggle({ value, onChange }: { value: YN; onChange: (v: YN) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      {(["yes", "no"] as const).map((v) => (
        <button key={v} type="button" onClick={() => onChange(value === v ? "" : v)} aria-pressed={value === v}
          className={`px-3 py-1.5 text-sm font-semibold transition-colors ${value === v ? (v === "yes" ? "bg-sky-700 text-white" : "bg-emerald-600 text-white") : "bg-white text-gray-500 hover:bg-gray-50"}`}>
          {v === "yes" ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

// Dated specific-examples list under a narrative field (date optional).
// `tone` keeps the two narrative boxes visually apart: rose for what is happening
// now, slate for what happened before. `title` names what the examples are for.
function DatedExamples({ examples, onChange, tone = "rose", title }: {
  examples?: DatedExample[];
  onChange: (next: DatedExample[]) => void;
  tone?: "rose" | "slate";
  title?: string;
}) {
  const list = examples || [];
  const upd = (i: number, patch: Partial<DatedExample>) => onChange(list.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const T = tone === "slate"
    ? { box: "border-slate-200 bg-slate-50/60", head: "text-slate-500", ring: "focus:ring-slate-400 focus:border-slate-400", link: "text-slate-700 hover:text-slate-900" }
    : { box: "border-sky-200 bg-sky-50/60", head: "text-sky-800", ring: "focus:ring-sky-500 focus:border-sky-500", link: "text-sky-800 hover:text-sky-900" };
  const selCls = `text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white ${T.ring}`;
  // Only rendered after the user adds an example (client-side), so new Date() here
  // is safe from hydration mismatch.
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 71 }, (_, i) => thisYear - i);
  return (
    <div className={`mt-2 rounded-lg border ${T.box} p-2.5 space-y-2`}>
      <p className={`text-[10px] font-mono uppercase tracking-wider ${T.head}`}>
        {title || "Give dated examples"} (date optional - just the year, the month and year, or the full date)
      </p>
      {list.map((ex, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <select value={ex.day} onChange={(e) => upd(i, { day: e.target.value })} aria-label="Day" className={selCls}>
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, d) => <option key={d + 1} value={String(d + 1)}>{d + 1}</option>)}
            </select>
            <select value={ex.month} onChange={(e) => upd(i, { month: e.target.value })} aria-label="Month" className={selCls}>
              <option value="">Month</option>
              {MONTHS.map((m, mi) => <option key={m} value={String(mi + 1)}>{m}</option>)}
            </select>
            <select value={ex.year} onChange={(e) => upd(i, { year: e.target.value })} aria-label="Year" className={selCls}>
              <option value="">Year</option>
              {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </select>
            <button onClick={() => onChange(list.filter((_, idx) => idx !== i))} aria-label="Remove example" className="ml-auto text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
          </div>
          <input type="text" value={ex.text} placeholder="what happened" aria-label="What happened" onChange={(e) => upd(i, { text: e.target.value })} className={`w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 ${T.ring}`} />
        </div>
      ))}
      <button onClick={() => onChange([...list, { day: "", month: "", year: "", text: "" }])} className={`inline-flex items-center gap-1 text-xs font-semibold ${T.link} transition-colors`}>
        <Plus className="w-3.5 h-3.5" /> Add example
      </button>
    </div>
  );
}

function CopyField({ id, label, text, done, onToggle }: {
  id: string; label: string; text: string; done: boolean; onToggle: (id: string, copied: boolean) => void;
}) {
  const [flash, setFlash] = useState(false);
  if (!text.trim()) return null;
  const doCopy = async () => { await copyText(text); onToggle(id, true); setFlash(true); setTimeout(() => setFlash(false), 1400); };
  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${done ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex-1">{label}</span>
        <button onClick={doCopy} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors">
          {flash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{flash ? "Copied" : "Copy"}
        </button>
        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
          <input type="checkbox" checked={done} onChange={(e) => onToggle(id, e.target.checked)} className="rounded border-gray-300 text-emerald-600 w-4 h-4" />Pasted in
        </label>
      </div>
      <pre className="px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-700 max-h-72 overflow-y-auto">{text}</pre>
    </div>
  );
}

// A large star "Tips" badge; hover or click shows a short usage note.
function TipBadge() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Tip: when to use this tool"
        className="flex flex-col items-center text-amber-300 hover:text-amber-200 transition-transform hover:scale-105"
      >
        <Star className="w-11 h-11 drop-shadow" fill="currentColor" strokeWidth={1} />
        <span className="text-[11px] font-bold -mt-1.5 text-white">Tips</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 z-40 w-72 rounded-xl bg-white text-gray-700 text-sm leading-relaxed p-3 shadow-xl border border-amber-200">
          This tool is great for a <strong>new admission</strong>, but a lot of work for a weekly review. If you only need to
          update one domain, copy that section from SystmOne and tidy it up with this tool.
        </div>
      )}
    </div>
  );
}

// "Add another sub-domain" - name it, and it becomes a selected risk with its
// own question set. Own state so typing doesn't disturb the domain.
function AddSubDomain({ onAdd, placeholder = "add another sub-domain..." }: { onAdd: (name: string) => void; placeholder?: string }) {
  const [val, setVal] = useState("");
  const submit = () => { const v = val.trim(); if (v) { onAdd(v); setVal(""); } };
  return (
    <div className="flex items-center gap-1.5">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
        placeholder={placeholder}
        className="flex-1 min-w-0 text-sm border border-dashed border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      />
      <button
        onClick={submit}
        disabled={!val.trim()}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 px-2 py-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  );
}

// The pasteable output for ONE S1 narrative field (current or historical),
// merging the typed narrative with its dated examples. The ticks above are done
// by hand on S1; only these narrative fields are pasted. Green "copy into S1"
// prompt bottom-right. Hidden until there is something to copy.
function S1CopyBox({ text }: { text: string }) {
  const [flash, setFlash] = useState(false);
  if (!text.trim()) return null;
  const doCopy = async () => { await copyText(text); setFlash(true); setTimeout(() => setFlash(false), 1600); };
  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <pre className="px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-700 max-h-48 overflow-y-auto">{text}</pre>
      <div className="flex justify-end px-2 pb-1.5">
        <button onClick={doCopy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors">
          {flash ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy into S1 when completed</>}
        </button>
      </div>
    </div>
  );
}

function Collapse({ icon: Icon, title, children, tone = "gray" }: {
  icon: typeof Info; title: string; children: React.ReactNode; tone?: "gray" | "rose";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
        <Icon className={`w-4 h-4 ${tone === "rose" ? "text-slate-400" : "text-gray-500"}`} />
        <span className="font-bold text-gray-800 flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500";

// Height of the app header, which is sticky - anything scrolled to the top of the
// window has to clear it.
const STICKY_TOP = 72;

// Opening or closing a panel changes the height of the page around where you are
// looking. The browser keeps its scroll offset, so the thing you just clicked
// walks off the screen - Mike, 22 Aug 2026: "the screen jumps and I lose my place".
//
// Two fixes, both here:
//   keepInPlace(id) - measure an element BEFORE a state change; after the next
//     paint the page is scrolled by however far it moved, so it stays put.
//   scrollToTop(id) - park an element just under the sticky header. Used when a
//     panel collapses and the content you were reading no longer exists.
function useScrollKeeper() {
  const pending = useRef<{ id: string; top: number } | null>(null);
  const parkTo = useRef<string | null>(null);

  useLayoutEffect(() => {
    const hold = pending.current;
    if (hold) {
      pending.current = null;
      const el = document.getElementById(hold.id);
      if (el) {
        const delta = el.getBoundingClientRect().top - hold.top;
        if (delta) window.scrollBy(0, delta);
      }
    }
    const park = parkTo.current;
    if (park) {
      parkTo.current = null;
      const el = document.getElementById(park);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - STICKY_TOP;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    }
  });

  return {
    keepInPlace: (id: string) => {
      const el = document.getElementById(id);
      if (el) pending.current = { id, top: el.getBoundingClientRect().top };
    },
    scrollToTop: (id: string) => { parkTo.current = id; },
  };
}

export default function RiskAssessmentPage() {
  const v2Href = useV2Href();
  const { keepInPlace, scrollToTop } = useScrollKeeper();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [domains, setDomains] = useState<Record<string, DomainState>>({});
  const [capByRisk, setCapByRisk] = useState<Record<string, AllState>>({});
  const [openRisks, setOpenRisks] = useState<Set<string>>(new Set());
  // Accordion: one domain open at a time, jump in and out in any order.
  const [openDomain, setOpenDomain] = useState<string | null>(null);
  const [guardOpen, setGuardOpen] = useState(false);
  // One spotted event can belong to more than one domain (rare, but a fire-setting
  // incident that is also domestic abuse is exactly the case), so the picker is
  // multi-select and the same entry is filed under each.
  const [capture, setCapture] = useState<{ text: string; domains: string[]; day: string; month: string; year: string }>(
    { text: "", domains: [], day: "", month: "", year: "" }
  );
  const [captureWhen, setCaptureWhen] = useState<"current" | "historical" | "">("");
  const [captureNote, setCaptureNote] = useState("");
  const [removing, setRemoving] = useState<CapturedRow | null>(null);
  const [removeSel, setRemoveSel] = useState<string[]>([]);
  const [introOpen, setIntroOpen] = useState(true);
  // Filled after mount so the year list never differs between server and client.
  const [captureYears, setCaptureYears] = useState<number[]>([]);
  useEffect(() => {
    const thisYear = new Date().getFullYear();
    setCaptureYears(Array.from({ length: 71 }, (_, i) => thisYear - i));
  }, []);
  const [q8, setQ8] = useState<YN>("");
  const [q8note, setQ8note] = useState("");
  // Field 9. Generated from the ticked sub-domains, but the nurse can edit it -
  // once they have, their version is what is copied and regenerating warns first.
  const [q9, setQ9] = useState("");
  const [formulationEdited, setFormulationEdited] = useState(false);
  const [regenAsk, setRegenAsk] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [tab, setTab] = useState<"screen" | "formulation" | "rmp">("screen");
  const [copied, setCopied] = useState<Set<string>>(new Set());
  const [riskMarked, setRiskMarked] = useState(false);

  const patientName = patient?.name;

  // Merge over a fresh empty domain so every field is always present (guards
  // against any partially-shaped state, e.g. after a field is added).
  const getDomain = (id: string): DomainState => (domains[id] ? { ...emptyDomain(), ...domains[id] } : emptyDomain());
  // Read-then-write against `domains` loses an update when two clicks land in the
  // same tick - ticking two sub-domains quickly dropped one. Everything that
  // changes a domain goes through this instead, so the update always sees the
  // latest state. Merging over emptyDomain() keeps every field defined.
  const updateDomain = (id: string, fn: (d: DomainState) => DomainState) =>
    setDomains((s) => ({ ...s, [id]: fn({ ...emptyDomain(), ...(s[id] || {}) }) }));
  const cGet = (key: string, qid: string): SecState => capByRisk[key]?.[qid] || EMPTY;
  // Takes an updater as well as a value - SectionEditor sends updaters for every
  // toggle so two fast clicks cannot lose one. See SecUpdate.
  const cSet = (key: string, qid: string, v: SecUpdate) =>
    setCapByRisk((s) => ({ ...s, [key]: { ...s[key], [qid]: applySec(s[key]?.[qid], v) } }));
  const toggleCopied = (id: string, on: boolean) => setCopied((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });

  const toggleSub = (domainId: string, label: string) => {
    const has = getDomain(domainId).risks.includes(label);
    updateDomain(domainId, (d) => ({
      ...d, noEvidence: false,
      risks: d.risks.includes(label) ? d.risks.filter((r) => r !== label) : [...d.risks, label],
      ownRmp: d.risks.includes(label) ? d.ownRmp.filter((x) => x !== label) : d.ownRmp, // dropping a sub-domain drops its own-plan flag
    }));
    if (!has) setOpenRisks((s) => new Set(s).add(domainId)); // open the domain question set
  };
  const toggleOpenRisk = (key: string) => setOpenRisks((s) => { const n = new Set(s); if (n.has(key)) n.delete(key); else n.add(key); return n; });

  // "Requires own RMP" - flag a selected sub-domain or clinical indicator so it
  // spins off its OWN management plan (formulation stays one-per-domain).
  const toggleOwnRmp = (domainId: string, label: string) => {
    const has = getDomain(domainId).ownRmp.includes(label);
    updateDomain(domainId, (d) => ({ ...d, ownRmp: d.ownRmp.includes(label) ? d.ownRmp.filter((x) => x !== label) : [...d.ownRmp, label] }));
    if (!has) setOpenRisks((s) => new Set(s).add(`${domainId}::own::${label}`));
  };

  // Add a nurse-named sub-domain to a domain: it becomes a selected risk with its
  // own (generic-chip) question set. Deduped against existing subs.
  const addCustomSub = (domainId: string, rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    if (getDomain(domainId).customSubs.includes(name) || getDomain(domainId).risks.includes(name)) return;
    updateDomain(domainId, (d) => ({ ...d, noEvidence: false, customSubs: [...d.customSubs, name], risks: [...d.risks, name] }));
    setOpenRisks((s) => new Set(s).add(domainId));
  };
  const removeCustomSub = (domainId: string, name: string) => {
    updateDomain(domainId, (d) => ({ ...d, customSubs: d.customSubs.filter((x) => x !== name), risks: d.risks.filter((x) => x !== name), ownRmp: d.ownRmp.filter((x) => x !== name) }));
  };

  // Add a nurse-named clinical indicator (added to the domain's chip set + selected).
  const addCustomIndicator = (domainId: string, rawName: string) => {
    const name = rawName.trim();
    if (!name) return;
    if (getDomain(domainId).customIndicators.includes(name) || (CLINICAL_INDICATORS[domainId] || []).includes(name)) return;
    updateDomain(domainId, (d) => ({ ...d, customIndicators: [...d.customIndicators, name], indicatorList: [...d.indicatorList, name] }));
  };
  const removeCustomIndicator = (domainId: string, name: string) => {
    updateDomain(domainId, (d) => ({ ...d, customIndicators: d.customIndicators.filter((x) => x !== name), indicatorList: d.indicatorList.filter((x) => x !== name), ownRmp: d.ownRmp.filter((x) => x !== name) }));
  };

  const reset = () => {
    setDomains({}); setCapByRisk({}); setQ8(""); setQ8note(""); setQ9("");
    setGenerated(false); setCopied(new Set()); setOpenRisks(new Set()); setTab("screen"); setRiskMarked(false);
    setOpenDomain(null); setGuardOpen(false); setCaptureNote("");
  };

  const isEngaged = (d: DomainState) =>
    d.risks.length > 0 || d.noEvidence || d.current.trim() !== "" || d.historical.trim() !== "" || d.indicators !== "" || d.safety !== "" ||
    (d.currentExamples || []).some((e) => e.text.trim()) || (d.historicalExamples || []).some((e) => e.text.trim());

  // How many of the domain's questions carry an answer (domain plan only - spun-off
  // plans are counted on their own row).
  const answeredCount = (key: string) => RMP_QUESTIONS.reduce((n, q) => n + (answered(capByRisk[key]?.[q.id]) ? 1 : 0), 0);

  type DomainStatus = "untouched" | "nil" | "started" | "answered";
  const domainStatus = (dm: typeof RISK_DOMAINS[number]): DomainStatus => {
    const st = getDomain(dm.id);
    if (st.noEvidence) return "nil";
    if (!isEngaged(st)) return "untouched";
    return answeredCount(dm.id) > 0 ? "answered" : "started";
  };

  // Drop a spotted risk straight into a domain. Dates are optional; undated lines
  // sink to the bottom, everything else sorts most recent first when it's copied.
  const addCapture = () => {
    const text = capture.text.trim();
    const picked = RISK_DOMAINS.filter((d) => capture.domains.includes(d.id));
    if (!text || !picked.length) return;
    const yr = Number(capture.year);
    // Nothing older than last year belongs under "current concerns" by default.
    const when = captureWhen || (yr && yr < new Date().getFullYear() ? "historical" : "current");
    const entry: DatedExample = { day: capture.day, month: capture.month, year: capture.year, text, id: `cap-${++captureSeq}` };
    // One setDomains pass so filing under several domains is a single update.
    setDomains((all) => {
      const next = { ...all };
      for (const dm of picked) {
        const st = { ...emptyDomain(), ...(next[dm.id] || {}) };
        next[dm.id] = {
          ...st,
          noEvidence: false, // something was found, so the domain is no longer nil
          currentExamples: when === "current" ? [...(st.currentExamples || []), entry] : st.currentExamples,
          historicalExamples: when === "historical" ? [...(st.historicalExamples || []), entry] : st.historicalExamples,
        };
      }
      return next;
    });
    setCapture((c) => ({ ...c, text: "", day: "", month: "", year: "" }));
    setCaptureWhen("");
    setCaptureNote(`Added to ${naturalList(picked.map((d) => `${d.number}. ${d.short}`))} (${when === "current" ? "current concerns" : "historical"}).`);
  };

  // Every captured event still present in the domains, oldest first.
  const capturedRows = useMemo<CapturedRow[]>(() => {
    const byId = new Map<string, CapturedRow>();
    for (const dm of RISK_DOMAINS) {
      const st = domains[dm.id];
      if (!st) continue;
      for (const when of ["current", "historical"] as const) {
        const list = (when === "current" ? st.currentExamples : st.historicalExamples) || [];
        for (const ex of list) {
          if (!ex.id) continue; // typed straight into the domain, not a capture
          const row = byId.get(ex.id);
          if (row) row.places.push({ domainId: dm.id, when });
          else byId.set(ex.id, { id: ex.id, text: ex.text, day: ex.day, month: ex.month, year: ex.year, places: [{ domainId: dm.id, when }] });
        }
      }
    }
    return [...byId.values()].sort((a, b) => Number(a.id.slice(4)) - Number(b.id.slice(4)));
  }, [domains]);

  // Pull a captured event out of the domains the user picked. Anywhere it was
  // filed but not picked keeps its copy.
  const removeCapture = (id: string, domainIds: string[]) => {
    setDomains((all) => {
      const next = { ...all };
      for (const domainId of domainIds) {
        const st = next[domainId];
        if (!st) continue;
        next[domainId] = {
          ...st,
          currentExamples: (st.currentExamples || []).filter((e) => e.id !== id),
          historicalExamples: (st.historicalExamples || []).filter((e) => e.id !== id),
        };
      }
      return next;
    });
    setRemoving(null);
    setCaptureNote("");
  };

  // Domains the nurse never touched - the generate guard asks about these.
  const untouchedDomains = RISK_DOMAINS.filter((dm) => domainStatus(dm) === "untouched");
  // "Display clinical indicators ...?" is on the form for every domain and has to
  // be answered on any domain being worked. The guard collects the ones still blank.
  const missingIndicators = RISK_DOMAINS.filter((dm) => {
    const st = getDomain(dm.id);
    return !st.noEvidence && isEngaged(st) && st.indicators === "";
  });
  // Ticking the confirmation writes the exact S1 "No evidence ..." line for that domain.
  const confirmNil = (domainId: string, on: boolean) =>
    updateDomain(domainId, (d) => ({ ...d, noEvidence: on, risks: on ? [] : d.risks }));

  const personalise = (s: string) => {
    const nm = patientName;
    return nm ? s.replace(/the person's/g, `${nm}'s`).replace(/the person/g, nm) : s;
  };

  const allRisks = useMemo<RiskRef[]>(() => {
    const out: RiskRef[] = [];
    for (const dm of RISK_DOMAINS) for (const label of getDomain(dm.id).risks) {
      const key = `${dm.id}::${label}`;
      out.push({ key, label, chipRisk: SUBTYPE_RISK[key] || "", domainId: dm.id });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains]);

  // ---- The Risk Formulation summary (field 9) ------------------------------
  // Generated from the ticked sub-domains and nothing else. See
  // buildFormulationSummary() for why the old question-driven formulation went.
  const formulationInput = useMemo(
    () => RISK_DOMAINS.map((dm) => {
      const st = getDomain(dm.id);
      return { domainId: dm.id, subs: st.risks, noEvidence: st.noEvidence, indicators: st.indicatorList };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [domains],
  );
  const generatedFormulation = useMemo(
    () => buildFormulationSummary(formulationInput, patientName),
    [formulationInput, patientName],
  );
  const summaryRows = useMemo(() => formulationSummaryLines(formulationInput), [formulationInput]);
  // What actually gets copied: the nurse's edited version if they touched it.
  const finalSummary = formulationEdited ? q9 : generatedFormulation;

  const domainScreenText = (dm: typeof RISK_DOMAINS[number]): string => {
    const st = getDomain(dm.id);
    if (!isEngaged(st)) return "";
    const parts: string[] = [`${dm.number}. ${dm.title}`];
    if (st.noEvidence) parts.push(dm.noEvidence);
    else if (st.risks.length) st.risks.forEach((r) => parts.push(`- ${r}`));
    if (dm.safetyPrompt && st.safety) parts.push(`Concerns about safety: ${st.safety === "yes" ? "Yes" : "No"}`);
    if (st.indicators) parts.push(`Clinical indicators: ${st.indicators === "yes" ? "Yes" : "No"}`);
    if (st.indicatorList.length) parts.push(`Indicators present: ${st.indicatorList.join("; ")}`);
    const curText = withExamples(st.current, st.currentExamples);
    if (curText) parts.push(`Current concerns: ${ensureStop(cap(curText))}`);
    const histText = withExamples(st.historical, st.historicalExamples);
    if (histText) parts.push(`Historical: ${ensureStop(cap(histText))}`);
    return parts.join("\n");
  };

  const engagedDomains = RISK_DOMAINS.filter((dm) => isEngaged(getDomain(dm.id)));
  // Domains that get a plan: engaged, and not signed off "no evidence".
  const planDomains = engagedDomains.filter((dm) => !getDomain(dm.id).noEvidence);

  // The ticked sub-domains that feed the DOMAIN plan (i.e. not spun off to their
  // own RMP), mapped to their chip bank and deduped by risk.
  const domainChipRisks = (dm: typeof RISK_DOMAINS[number]): { label: string; risk: string }[] => {
    const st = getDomain(dm.id);
    const out: { label: string; risk: string }[] = [];
    const seen = new Set<string>();
    for (const label of st.risks) {
      if (st.ownRmp.includes(label)) continue;               // has its own plan
      const risk = SUBTYPE_RISK[`${dm.id}::${label}`] || "";
      if (!risk || seen.has(risk)) continue;
      seen.add(risk);
      out.push({ label, risk });
    }
    return out;
  };
  // Fallback chip bank for a spun-off clinical indicator (which has no mapping of
  // its own) - use the domain's first mapped sub-domain.
  const domainDefaultRisk = (dm: typeof RISK_DOMAINS[number]): string => {
    for (const label of getDomain(dm.id).risks) {
      const r = SUBTYPE_RISK[`${dm.id}::${label}`];
      if (r) return r;
    }
    return "";
  };
  // Ticked indicators (not spun off) routed to a given destination.
  const routedIndicators = (dm: typeof RISK_DOMAINS[number], route: "present" | "formulation"): string[] => {
    const st = getDomain(dm.id);
    return (st.indicatorList || []).filter((ind) => !st.ownRmp.includes(ind) && indicatorRoute(dm.id, ind) === route);
  };
  // Sub-domains / indicators the nurse flagged for their own separate RMP.
  const spinUnitsFor = (dm: typeof RISK_DOMAINS[number]): RiskRef[] =>
    getDomain(dm.id).ownRmp.map((label) => ({
      key: `${dm.id}::own::${label}`,
      domainId: dm.id,
      label,
      chipRisk: SUBTYPE_RISK[`${dm.id}::${label}`] || domainDefaultRisk(dm) || "",
    }));

  // What the plan is called. The trust guide's own examples name the risk itself
  // ("self harm / risk to others / violence and aggression"), not the SystmOne
  // domain heading, so the plan is titled by the sub-domains actually ticked and
  // falls back to the domain title only when nothing is ticked.
  const planTitle = (dm: typeof RISK_DOMAINS[number]): string => {
    const st = getDomain(dm.id);
    const named = st.risks.filter((r) => !st.ownRmp.includes(r)); // spun-off ones head their own plan
    return named.length ? named.join(", ") : dm.title;
  };

  // ONE management-plan document: the domain plan first, then any spun-off plans,
  // in S1 domain order. Format reuses buildOneRmp (== bars, unchanged).
  //
  // ⚠ 22 Aug 2026: ticked clinical indicators are NO LONGER folded into the plan.
  // They are offered as suggested chips on the matching question and only appear
  // in the output if the nurse picked them. Nothing reaches a plan that was not
  // selected, typed or approved by the person writing it.
  const buildRmpText = (): string => {
    const plans: string[] = [];
    for (const dm of planDomains) {
      const secs = deriveRmp(capByRisk[dm.id]);
      plans.push(buildOneRmp("", secs, planTitle(dm)));       // one plan per domain, named by the risks ticked
      for (const u of spinUnitsFor(dm)) plans.push(buildOneRmp(u.chipRisk, deriveRmp(capByRisk[u.key]), u.label));
    }
    if (!plans.length) return "";
    const head = patientName ? `Patient: ${patientName}\n\n` : "";
    return head + plans.join("\n\n");
  };

  const fullScreenText = useMemo(() => {
    if (!engagedDomains.length && q8 === "") return "";
    const parts: string[] = [TXT_BAR, "RISK SCREENING TOOL", ...(patientName ? [`Patient: ${patientName}`] : []), TXT_BAR];
    engagedDomains.forEach((dm, i) => {
      parts.push(domainScreenText(dm));
      if (i < engagedDomains.length - 1) parts.push(TXT_DIV);
    });
    if (q8) parts.push(TXT_DIV, `${SCREEN_TAIL.q8} ${q8 === "yes" ? "Yes" : "No"}${q8note.trim() ? ` - ${q8note.trim()}` : ""}`);
    if (finalSummary) parts.push(TXT_DIV, `${SCREEN_TAIL.q9Label}: ${finalSummary}`);
    return parts.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains, q8, q8note, finalSummary, patientName]);

  const anyIntake = allRisks.length > 0 || engagedDomains.length > 0 || q8 !== "" || q9.trim() !== "";

  // Stamp this patient's Care Review: the weekly "Risk assessment" review item +
  // the two admission checklist items go done today, so the patient tile / Care
  // Review shows it complete. Seeds a missing tracker first so the admission badge
  // isn't left blank (the patients page only seeds if no entry exists). /v2 only
  // (patient is null at root, so no-op there).
  const markRiskDone = () => {
    if (!patient) return;
    const today = toLocalDateStr();
    const t = loadTracker();
    const pt = t[patient.id] || seedPatient(patient.id, patient.admissionDate, today);
    t[patient.id] = {
      admission: { ...pt.admission, "risk-screening": today, "risk-management": today },
      reviews: { ...pt.reviews, risk: today },
    };
    saveTracker(t);
    setRiskMarked(true);
  };

  const runGenerate = () => {
    setGuardOpen(false);
    setGenerated(true);
    markRiskDone(); // no-op unless a patient is linked (/v2)
    setTimeout(() => document.getElementById("risk-output")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // A domain you never opened is not the same as a domain with no risks in it.
  // Anything untouched has to be confirmed nil before the documents are built.
  const doGenerate = () => {
    if (untouchedDomains.length || missingIndicators.length) { setGuardOpen(true); return; }
    runGenerate();
  };

  // One risk's unified question run. Plain render function (NOT a nested
  // component) so editing a field doesn't remount and drop textarea focus.
  const renderRiskCapture = (r: RiskRef) => {
    const open = openRisks.has(r.key);
    const done = RMP_QUESTIONS.reduce((n, q) => n + (answered(capByRisk[r.key]?.[q.id]) ? 1 : 0), 0);
    const subs = [{ label: r.label, risk: r.chipRisk }];
    return (
      <div key={r.key} className="rounded-xl border border-slate-200 bg-white">
        {/* Header styled like a selected chip; sticks below the app header (top-16)
            so you always see which risk you're on while scrolling its questions. */}
        <button
          id={`plan-head-${r.key}`}
          onClick={() => { scrollToTop(`plan-head-${r.key}`); toggleOpenRisk(r.key); }}
          className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-left transition-colors rounded-t-xl sticky top-16 z-20 ${
            open ? "bg-slate-700 text-white shadow-sm" : "bg-slate-100 text-slate-800 hover:bg-slate-200"
          }`}
        >
          <span className="font-bold text-sm flex-1">{r.label}</span>
          <span className={`text-[10px] ${open ? "text-slate-200" : "text-slate-500"}`}>{done}/{RMP_QUESTIONS.length} answered</span>
          {open ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>
        {open && (
          <div className="p-3 space-y-2">
            <p className="text-xs text-gray-500">
              Six questions, in your own words - they build the risk management plan for {r.label}. The trust headings
              are added when you generate.
            </p>
            {questionsForDomain(r.domainId).map((q) => (
              <SectionEditor
                key={q.id}
                section={buildQuestionSection(q, r.domainId, subs, indicatorSuggestions(r.domainId, q))}
                state={cGet(r.key, q.id)}
                onChange={(n) => cSet(r.key, q.id, n)}
                bank={{ risk: r.chipRisk, questionId: q.id }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // The ticked clinical indicators offered as suggested chips on a question.
  //
  // Only question 2 ("what would staff notice") takes them, and only the ones
  // that describe something observable - INDICATOR_BACKGROUND holds the rest,
  // which are history and context. An indicator like "Male gender, under 35
  // years" or "Major Psychiatric Diagnosis" tells staff nothing about what to
  // watch for, so it is never offered as a warning sign.
  //
  // They are suggestions. Nothing here reaches the plan unless the nurse picks it.
  const indicatorSuggestions = (domainId: string, q: RmpQuestion): string[] => {
    if (q.id !== "q2_present") return [];
    const st = getDomain(domainId);
    return (st.indicatorList || []).filter((ind) => !st.ownRmp.includes(ind) && indicatorRoute(domainId, ind) === "present");
  };

  // A small transparency note about what the ticked indicators do.
  const renderFoldNote = (dm: typeof RISK_DOMAINS[number]) => {
    const pres = routedIndicators(dm, "present");
    const bg = routedIndicators(dm, "formulation");
    if (!pres.length && !bg.length) return null;
    return (
      <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-2.5 text-xs text-sky-800 space-y-1">
        <p className="flex items-center gap-1.5 font-semibold"><Info className="w-3.5 h-3.5 flex-shrink-0" /> The clinical indicators you ticked are offered as suggestions, not added for you:</p>
        {pres.length > 0 && <p><strong>Offered on question 2:</strong> {naturalList(pres)}.</p>}
        {bg.length > 0 && <p><strong>Not offered</strong> (these are history or context, not something staff would notice): {naturalList(bg)}.</p>}
        <p className="text-sky-700/80">They only reach the plan if you select them.</p>
      </div>
    );
  };

  // The ONE question set for a whole domain - chips merged across its ticked
  // sub-domains. Plain render function (not a nested component) to keep focus.
  const renderDomainCapture = (dm: typeof RISK_DOMAINS[number]) => {
    const key = dm.id;
    const chipRisks = domainChipRisks(dm);
    const open = openRisks.has(key);
    const done = RMP_QUESTIONS.reduce((n, q) => n + (answered(capByRisk[key]?.[q.id]) ? 1 : 0), 0);
    return (
      <div key={key} className="rounded-xl border border-slate-200 bg-white">
        <button
          id={`plan-head-${key}`}
          onClick={() => { scrollToTop(`plan-head-${key}`); toggleOpenRisk(key); }}
          className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-left transition-colors rounded-t-xl sticky top-16 z-20 ${open ? "bg-slate-700 text-white shadow-sm" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`}
        >
          <span className="font-bold text-sm flex-1">Build the plan for: {planTitle(dm)}</span>
          <span className={`text-[10px] ${open ? "text-slate-200" : "text-slate-500"}`}>{done}/{RMP_QUESTIONS.length} answered</span>
          {open ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>
        {open && (
          <div className="p-3 space-y-2">
            {/* Six questions, one document. The formulation used to be built from
                another seven here; it now comes straight from the sub-domains you
                ticked, which is why this is short. */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs text-gray-700">
              <p className="font-bold text-gray-800">Why you are answering these</p>
              <p>
                These six build the <strong>Risk Management Plan</strong> for {planTitle(dm)}. Every patient must have one
                within 24 hours of admission, and the trust guidance sets its five headings - one question per heading,
                with &quot;how to prevent / reduce&quot; asked as two, because the trust lists managing it when it happens and
                preventing it as two different things.
              </p>
              <p className="text-gray-500">
                The <strong>Risk Formulation</strong> (field 9) is built for you from the sub-domains you ticked - there is
                nothing to answer for it. Headings are added when you generate.
              </p>
            </div>
            {questionsForDomain(dm.id).map((q) => (
              <SectionEditor
                key={q.id}
                section={buildQuestionSection(q, dm.id, chipRisks, indicatorSuggestions(dm.id, q))}
                state={cGet(key, q.id)}
                onChange={(n) => cSet(key, q.id, n)}
                bank={{ risk: chipRisks[0]?.risk || dm.id, questionId: q.id }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // One domain's full progressive-disclosure page.
  const renderDomain = (dm: typeof RISK_DOMAINS[number]) => {
    const st = getDomain(dm.id);
    return (
      <div className="space-y-3">
        {/* Ticking a sub-domain opens the plan questions further down, which moves
            everything below this row - hold the row itself still. */}
        <div id={`subs-${dm.id}`} className="flex flex-wrap gap-1.5">
          {dm.subtypes.map((label) => {
            const on = st.risks.includes(label);
            return (
              <button key={label} onClick={() => { keepInPlace(`subs-${dm.id}`); toggleSub(dm.id, label); }} aria-pressed={on}
                className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all text-left ${on ? "bg-sky-700 border-sky-700 text-white font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-slate-400 hover:bg-slate-50"}`}>
                {label}
              </button>
            );
          })}
          {st.customSubs.map((label) => {
            const on = st.risks.includes(label);
            return (
              <span key={label} className={`inline-flex items-center rounded-lg border text-sm transition-all ${on ? "bg-sky-700 border-sky-700 text-white" : "bg-white border-gray-200 text-gray-600"}`}>
                <button onClick={() => toggleSub(dm.id, label)} aria-pressed={on} className="pl-2.5 pr-1 py-1.5 font-medium text-left">{label}</button>
                <button onClick={() => removeCustomSub(dm.id, label)} aria-label={`Remove ${label}`} className={`pr-2 pl-0.5 py-1.5 ${on ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-red-600"}`}><X className="w-3.5 h-3.5" /></button>
              </span>
            );
          })}
        </div>
        <AddSubDomain onAdd={(name) => addCustomSub(dm.id, name)} />

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={st.noEvidence} onChange={(e) => updateDomain(dm.id, (d) => ({ ...d, noEvidence: e.target.checked, risks: e.target.checked ? [] : d.risks }))} className="rounded border-gray-300 text-emerald-600 w-4 h-4" />
          {dm.noEvidence}
        </label>

        {st.noEvidence && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Signed off - no evidence in this domain. Nothing further to add here.
          </p>
        )}

        {!st.noEvidence && (
          <div className="space-y-3">
            {/* 1a - domain 1 only. A required answer, so it sits out in the open. */}
            {dm.safetyPrompt && (
              <div className={`rounded-xl border-2 p-3 ${st.safety === "" ? "border-amber-400 bg-amber-50/60" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <ShieldAlert className={`w-5 h-5 flex-shrink-0 ${st.safety === "" ? "text-amber-600" : "text-slate-500"}`} />
                  <span className="text-sm font-bold text-gray-800 flex-1 min-w-[200px]">{personalise(dm.safetyPrompt)}</span>
                  {st.safety === "" && <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Needs an answer</span>}
                  <YNToggle value={st.safety} onChange={(v) => updateDomain(dm.id, (d) => ({ ...d, safety: v }))} />
                </div>
              </div>
            )}

            {/* Xa - "Display clinical indicators ...?" This is a required field on
                SystmOne, so it gets its own bordered card rather than sitting in
                with the narratives. Amber until it is answered. The chip list only
                appears on Yes. */}
            {dm.indicatorsPrompt && (
              <div id={`ind-card-${dm.id}`} className={`rounded-xl border-2 p-3 space-y-3 ${st.indicators === "" ? "border-amber-400 bg-amber-50/60" : "border-slate-300 bg-white"}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <ListChecks className={`w-5 h-5 flex-shrink-0 ${st.indicators === "" ? "text-amber-600" : "text-slate-500"}`} />
                  <span className="text-base font-bold text-gray-800 flex-1 min-w-[220px]">{personalise(dm.indicatorsPrompt)}</span>
                  {st.indicators === "" && <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Needs an answer</span>}
                  {/* Yes opens a list of up to 27 indicators. Hold the card still so
                      the list appears below where you are looking, not somewhere else. */}
                  <YNToggle value={st.indicators} onChange={(v) => { keepInPlace(`ind-card-${dm.id}`); updateDomain(dm.id, (d) => ({ ...d, indicators: v })); }} />
                </div>
                {st.indicators === "" && (
                  <p className="text-xs text-amber-800">Answer this before you generate. It is on the form for every domain, and Yes opens the indicator list.</p>
                )}
                {st.indicators === "yes" && (
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
                      Clinical indicators {CLINICAL_INDICATORS[dm.id]?.length ? `(${CLINICAL_INDICATORS[dm.id].length} on the form)` : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(CLINICAL_INDICATORS[dm.id] || []).map((ind) => {
                        const on = st.indicatorList.includes(ind);
                        return (
                          <button key={ind} type="button" aria-pressed={on}
                            onClick={() => updateDomain(dm.id, (d) => ({ ...d, indicatorList: d.indicatorList.includes(ind) ? d.indicatorList.filter((x) => x !== ind) : [...d.indicatorList, ind] }))}
                            className={`px-2 py-1 rounded-lg text-xs border transition-all text-left ${on ? "bg-sky-700 border-sky-700 text-white font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-slate-400 hover:bg-slate-50"}`}>
                            {ind}
                          </button>
                        );
                      })}
                      {st.customIndicators.map((ind) => {
                        const on = st.indicatorList.includes(ind);
                        return (
                          <span key={ind} className={`inline-flex items-center rounded-lg border text-xs transition-all ring-1 ring-purple-400 ${on ? "bg-sky-700 border-sky-700 text-white font-medium" : "bg-white border-gray-200 text-gray-600"}`}>
                            <button type="button" aria-pressed={on}
                              onClick={() => updateDomain(dm.id, (d) => ({ ...d, indicatorList: d.indicatorList.includes(ind) ? d.indicatorList.filter((x) => x !== ind) : [...d.indicatorList, ind] }))}
                              className="pl-2 pr-1 py-1 text-left">{ind}</button>
                            <button type="button" onClick={() => removeCustomIndicator(dm.id, ind)} aria-label={`Remove ${ind}`} className={`pr-1.5 pl-0.5 py-1 ${on ? "text-white/80 hover:text-white" : "text-gray-500 hover:text-red-600"}`}><X className="w-3 h-3" /></button>
                          </span>
                        );
                      })}
                    </div>
                    <AddSubDomain placeholder="add another indicator..." onAdd={(name) => addCustomIndicator(dm.id, name)} />
                  </div>
                )}
              </div>
            )}

            {/* The two narratives. They are different questions and used to look
                identical, so each gets its own colour, heading and wording: rose
                for what is happening now, slate for what happened before. */}
            <div className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 bg-sky-700 px-3 py-2">
                <Clock className="w-4 h-4 text-white flex-shrink-0" />
                <span className="text-sm font-bold text-white">Now - current concerns</span>
                <span className="ml-auto text-[11px] text-slate-200">What is happening at the moment</span>
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">{personalise(dm.currentPrompt)}</label>
                <p className="flex items-start gap-1.5 text-xs text-slate-600 mb-1"><Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Gap prompt: what is going on now, and what has happened in the last few days or weeks.</p>
                <textarea value={st.current} onChange={(e) => updateDomain(dm.id, (d) => ({ ...d, current: e.target.value }))} rows={2} aria-label={personalise(dm.currentPrompt)} className={inputCls} />
                <DatedExamples tone="rose" title="Recent examples" examples={st.currentExamples} onChange={(next) => updateDomain(dm.id, (d) => ({ ...d, currentExamples: next }))} />
                <S1CopyBox text={withExamples(st.current, st.currentExamples)} />
              </div>
            </div>

            <div className="rounded-xl border-2 border-slate-300 bg-white overflow-hidden">
              <div className="flex items-center gap-2 bg-slate-500 px-3 py-2">
                <HistoryIcon className="w-4 h-4 text-white flex-shrink-0" />
                <span className="text-sm font-bold text-white">Before - historical risk</span>
                <span className="ml-auto text-[11px] text-slate-200">What has happened in the past</span>
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">{personalise(dm.historicalPrompt)}</label>
                {dm.historicalSubPrompts && (
                  <ul className="mb-1.5 ml-1 space-y-0.5">
                    {dm.historicalSubPrompts.map((sp) => <li key={sp} className="text-xs text-gray-600">- {personalise(sp)}</li>)}
                  </ul>
                )}
                <p className="flex items-start gap-1.5 text-xs text-slate-600 mb-1"><Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Gap prompt: what happened before this admission, and how long it has been going on.</p>
                <textarea value={st.historical} onChange={(e) => updateDomain(dm.id, (d) => ({ ...d, historical: e.target.value }))} rows={2} aria-label={personalise(dm.historicalPrompt)} className={inputCls} />
                <DatedExamples tone="slate" title="Past events" examples={st.historicalExamples} onChange={(next) => updateDomain(dm.id, (d) => ({ ...d, historicalExamples: next }))} />
                <S1CopyBox text={withExamples(st.historical, st.historicalExamples)} />
              </div>
            </div>
          </div>
        )}

        {/* "Requires own RMP" - selected sub-domains + indicators fold into the one
            domain plan by default; tick any that need their OWN separate plan. */}
        {!st.noEvidence && (st.risks.length > 0 || st.indicatorList.length > 0) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700">Separate plans (optional)</p>
            <p className="text-xs text-gray-600">
              Everything folds into this domain&apos;s <strong>single</strong> risk management plan. Tick anything that needs its <strong>own</strong> separate plan.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...st.risks, ...st.indicatorList].map((label) => {
                const on = st.ownRmp.includes(label);
                return (
                  <button key={label} onClick={() => toggleOwnRmp(dm.id, label)} aria-pressed={on}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-all text-left ${on ? "bg-amber-600 border-amber-600 text-white font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50"}`}>
                    {on ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <Plus className="w-3.5 h-3.5 flex-shrink-0" />}{label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* The ONE domain question set. */}
        {!st.noEvidence && (st.risks.length > 0 || st.indicatorList.length > 0 || st.current.trim() !== "" || st.historical.trim() !== "") && (
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-600">Answer the questions for this domain</p>
            {renderFoldNote(dm)}
            {renderDomainCapture(dm)}
          </div>
        )}

        {/* Any spun-off separate plans get their own question set. */}
        {spinUnitsFor(dm).length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700">Separate plans - answer each on its own</p>
            {spinUnitsFor(dm).map((u) => renderRiskCapture(u))}
          </div>
        )}
      </div>
    );
  };

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
                <h1 className="text-3xl font-bold">Risk Screen, Formulation & Management Plan</h1>
                <p className="text-white/80 mt-1">
                  Work through the risk screen one area at a time. Answer the questions for each domain - it builds all three documents to copy across.
                </p>
              </div>
            </div>
            <Link href={v2Href("/guides")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
          <div className="mt-3">
            <TipBadge />
          </div>
          <PatientLink patient={patient} onChange={setPatient} guideTitle="Risk Assessment" note="Adds the patient's name to the risk screen, formulation and RMP" />
        </div>

        {/* Mike's tip - the first thing anyone should read before starting */}
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-4 flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-700" />
          </span>
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-bold text-gray-800">Before you start</p>
            <p>
              Only use this tool if there is no current, up to date risk tool in place. It builds from scratch and
              takes time. It is great for merging lots of existing risk tools together, or for a brand new one if
              there is nothing usable already.
            </p>
            <p>
              While you go through the old one, AMHP reports, section papers and case notes, when you spot a risk you
              can copy it in here and tell the guide which domain. It will date sort for you.
            </p>
            <p>
              Each domain has extra questions so it takes a little longer, but fill these in as they form your
              formulation and risk management plan for you, so it saves time overall.
            </p>
          </div>
        </div>

        {/* Intro / explainer */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <button onClick={() => setIntroOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="font-bold text-gray-800 flex-1">New to this? How the tool works</span>
            {introOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          </button>
          {introOpen && (
            <div className="px-4 pb-4 space-y-4">
              <p className="text-sm text-gray-600">
                Use this tool to build the framework for a patient&apos;s <strong>risk screening tool</strong> - it helps you
                generate a quality <strong>formulation</strong> and <strong>risk management plans</strong>. Each step matches a
                risk domain from the Risk Screening Tool on SystmOne.
              </p>

              {/* Flow visual */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { n: 1, icon: ShieldAlert, title: "Screen with the patient", body: "Work the seven SystmOne risk domains together, ticking what applies." },
                    { n: 2, icon: ListChecks, title: "Answer the questions", body: "For each domain, answer a short set of plain questions in the patient's words." },
                    { n: 3, icon: Sparkles, title: "Generate", body: "One click turns your answers into three documents to copy across." },
                  ].map((s) => (
                    <div key={s.n} className="rounded-lg bg-white border border-slate-200 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{s.n}</span>
                        <s.icon className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.body}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center flex-wrap gap-1.5 mt-3">
                  <span className="text-xs font-semibold text-gray-500">Generates</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  {["Risk Screen", "Formulation", "Risk Management Plan"].map((d) => (
                    <span key={d} className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{d}</span>
                  ))}
                </div>
                <p className="text-center text-[11px] text-gray-500 mt-2">Copy each one into SystmOne and tick it off as you go.</p>
              </div>

              {/* Before you start */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">Before you start</p>
                <ul className="space-y-1.5">
                  {[
                    "If a risk screen already exists in the patient's record, open it and use that information.",
                    "Check the questionnaire section of SystmOne carefully first. If there isn't one, build it here, then copy it into a new one.",
                    "Complete it with the patient. It must be done in their best interests and, where possible, in their own voice.",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-gray-600">
                Good practice: a person-centred risk <em>formulation</em> is preferred over predictive risk-stratification tools
                (NICE NG225, Self-harm, 2022; Department of Health, Best Practice in Managing Risk, 2007). Decisions for a patient who
                lacks capacity must be in their best interests (Mental Capacity Act 2005), and care is planned <em>with</em> the patient,
                not just for them. Headings follow the DHCFT Risk Management Plans guidance.
              </p>
            </div>
          )}
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
          <button
            onClick={printRiskProofreadPack}
            title="Every domain, question, chip and template in one printable document, split into trust wording and wardHub wording"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-purple-50 border border-purple-300 text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <Printer className="w-4 h-4" /> Proofreading pack
          </button>
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
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Collapse>
        </div>

        {/* Quick capture - drop a risk you spotted straight into a domain */}
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="font-bold text-gray-800">Spotted a risk? Drop it here</h2>
              <p className="text-xs text-gray-500">Reading an old risk tool, an AMHP report, section papers or case notes? Paste what you found, say which domain it belongs to, and it lands there. Dates are optional and it sorts them for you.</p>
            </div>
          </div>
          <textarea
            value={capture.text}
            onChange={(e) => { setCapture((c) => ({ ...c, text: e.target.value })); setCaptureNote(""); }}
            rows={2}
            placeholder="Paste or type what you spotted..."
            aria-label="What you spotted"
            autoComplete="off"
            className={inputCls}
          />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600 mb-1.5">Which domain? Pick as many as it fits</p>
            <div className="flex flex-wrap gap-1.5">
              {RISK_DOMAINS.map((dm) => {
                const on = capture.domains.includes(dm.id);
                return (
                  <button key={dm.id} type="button" aria-pressed={on}
                    onClick={() => setCapture((c) => ({ ...c, domains: on ? c.domains.filter((x) => x !== dm.id) : [...c.domains, dm.id] }))}
                    className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all ${on ? "bg-sky-700 border-sky-700 text-white font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-slate-400 hover:bg-slate-50"}`}>
                    {dm.number}. {dm.short}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={capture.day} onChange={(e) => setCapture((c) => ({ ...c, day: e.target.value }))} aria-label="Day" className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:ring-2 focus:ring-sky-500">
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, d) => <option key={d + 1} value={String(d + 1)}>{d + 1}</option>)}
            </select>
            <select value={capture.month} onChange={(e) => setCapture((c) => ({ ...c, month: e.target.value }))} aria-label="Month" className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:ring-2 focus:ring-sky-500">
              <option value="">Month</option>
              {MONTHS.map((m, mi) => <option key={m} value={String(mi + 1)}>{m}</option>)}
            </select>
            <select value={capture.year} onChange={(e) => setCapture((c) => ({ ...c, year: e.target.value }))} aria-label="Year" className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:ring-2 focus:ring-sky-500">
              <option value="">Year</option>
              {captureYears.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </select>
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              {([["current", "Current"], ["historical", "Historical"]] as const).map(([v, label]) => (
                <button key={v} type="button" onClick={() => setCaptureWhen(captureWhen === v ? "" : v)} aria-pressed={captureWhen === v}
                  className={`px-3 py-2 text-sm font-semibold transition-colors ${captureWhen === v ? "bg-sky-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={addCapture}
              disabled={!capture.text.trim() || !capture.domains.length}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" /> Add{capture.domains.length > 1 ? ` to ${capture.domains.length} domains` : " to domain"}
            </button>
          </div>
          {captureNote && (
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> {captureNote}
            </p>
          )}

          {/* What has been captured so far, so it can be found and taken back out
              without hunting through the domains for it. */}
          {capturedRows.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
                Captured so far ({capturedRows.length})
              </p>
              {capturedRows.map((row) => {
                const dated = formatPartialDate(row);
                return (
                  <div key={row.id} className="flex items-start gap-2 border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-gray-800">
                        {dated && <span className="font-semibold text-gray-500">{dated} - </span>}{row.text}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {naturalList(row.places.map((p) => {
                          const dm = RISK_DOMAINS.find((d) => d.id === p.domainId);
                          return `${dm?.number}. ${dm?.short} (${p.when === "current" ? "now" : "before"})`;
                        }))}
                      </span>
                    </span>
                    <button
                      onClick={() => { setRemoving(row); setRemoveSel(row.places.map((p) => p.domainId)); }}
                      aria-label={`Remove "${row.text}"`}
                      className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                    ><X className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Removing a captured event - it may sit in more than one domain, so ask
            which ones to take it out of rather than guessing. */}
        {/* Regenerating throws away whatever the nurse typed, so it asks first. */}
        <Modal isOpen={regenAsk} onClose={() => setRegenAsk(false)} title="Regenerate the formulation summary?" size="sm">
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              This replaces the summary with a fresh one built from the sub-domains currently ticked.
              <strong> Anything you have typed or changed will be lost.</strong>
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRegenAsk(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Keep my version</button>
              <button
                onClick={() => { setQ9(""); setFormulationEdited(false); setRegenAsk(false); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors"
              >Replace it</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!removing} onClose={() => setRemoving(null)} title="Remove this event" size="sm">
          {removing && (
            <div className="space-y-4">
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {formatPartialDate(removing) && <span className="font-semibold text-gray-500">{formatPartialDate(removing)} - </span>}
                {removing.text}
              </p>
              <p className="text-sm text-gray-600">
                {removing.places.length > 1
                  ? "This event is filed under more than one domain. Take it out of the ones you tick."
                  : "Take this event out of:"}
              </p>
              <div className="space-y-2">
                {removing.places.map((p) => {
                  const dm = RISK_DOMAINS.find((d) => d.id === p.domainId);
                  const on = removeSel.includes(p.domainId);
                  return (
                    <label key={p.domainId} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 cursor-pointer hover:border-slate-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setRemoveSel(on ? removeSel.filter((x) => x !== p.domainId) : [...removeSel, p.domainId])}
                        className="rounded border-gray-300 text-slate-500 w-4 h-4 flex-shrink-0"
                      />
                      <span className="text-sm font-semibold text-gray-800">
                        {dm?.number}. {dm?.title}
                        <span className="block text-xs font-normal text-gray-500">{p.when === "current" ? "Current concerns" : "Historical"}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button onClick={() => setRemoving(null)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  Keep it
                </button>
                <button
                  onClick={() => removeCapture(removing.id, removeSel)}
                  disabled={!removeSel.length}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="w-4 h-4" /> Remove from {removeSel.length === removing.places.length && removing.places.length > 1 ? "all" : removeSel.length === 1 ? "1 domain" : `${removeSel.length} domains`}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* The seven domains, top down. Click one to open it, others close. */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-slate-500" /> The seven risk domains</h2>
            <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
              {RISK_DOMAINS.map((dm) => {
                const s = domainStatus(dm);
                return (
                  <span key={dm.id} aria-hidden
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      s === "answered" ? "bg-emerald-500" : s === "nil" ? "bg-emerald-200" : s === "started" ? "bg-amber-400" : "bg-gray-200"
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {RISK_DOMAINS.filter((dm) => domainStatus(dm) !== "untouched").length} of {RISK_DOMAINS.length} done
            </span>
          </div>

          {RISK_DOMAINS.map((dm) => {
            const st = getDomain(dm.id);
            const status = domainStatus(dm);
            const open = openDomain === dm.id;
            const ans = answeredCount(dm.id);
            const tone =
              status === "answered" ? "border-emerald-300" :
              status === "nil" ? "border-emerald-200" :
              status === "started" ? "border-amber-300" : "border-gray-200";
            const dot =
              status === "answered" ? "bg-emerald-500" :
              status === "nil" ? "bg-emerald-300" :
              status === "started" ? "bg-amber-400" : "bg-gray-300";
            const summary =
              status === "nil" ? "No evidence confirmed" :
              status === "untouched" ? "Not started" :
              [
                st.risks.length ? `${st.risks.length} ${st.risks.length === 1 ? "risk" : "risks"}` : "",
                st.indicatorList.length ? `${st.indicatorList.length} indicators` : "",
                `${ans}/${RMP_QUESTIONS.length} answered`,
              ].filter(Boolean).join("  ·  ");
            return (
              <div key={dm.id} className={`rounded-2xl border-2 bg-white transition-all ${tone} ${open ? "shadow-lg" : "hover:border-slate-400"}`}>
                <button
                  id={`dom-head-${dm.id}`}
                  // Opening one domain collapses another, which can be anywhere on
                  // the page - park the header you just clicked instead of letting
                  // the browser keep a now-meaningless scroll offset.
                  onClick={() => { scrollToTop(`dom-head-${dm.id}`); setOpenDomain(open ? null : dm.id); }}
                  aria-expanded={open}
                  className={`w-full flex items-center gap-3 p-4 text-left rounded-2xl transition-colors ${open ? "bg-slate-700 text-white rounded-b-none" : "hover:bg-slate-50"}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${open ? "bg-white/20 text-white" : "bg-slate-50 text-slate-600"}`}>
                    {dm.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block font-bold ${open ? "text-white" : "text-gray-800"}`}>{dm.title}</span>
                    <span className={`flex items-center gap-1.5 text-xs mt-0.5 ${open ? "text-white/80" : "text-gray-500"}`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${open ? "bg-white/70" : dot}`} />
                      {summary}
                    </span>
                  </span>
                  {status === "answered" && !open && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                  {open ? <ChevronDown className="w-5 h-5 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {open && (
                  <div className="p-4 space-y-3 border-t border-slate-200">
                    <p className="text-xs text-gray-500">
                      This section is the SystmOne risk screen for this domain. Tick the sub-domains and clinical
                      indicators on SystmOne as you go (or tick &quot;no evidence&quot; and move on), type the two narratives,
                      and use their green <strong>Copy into S1</strong> boxes to paste each across. Then answer the
                      questions for the domain - that is what builds the formulation and the management plan.
                    </p>
                    {renderDomain(dm)}
                    <div className="flex justify-end pt-1">
                      <button onClick={() => { scrollToTop(`dom-head-${dm.id}`); setOpenDomain(null); }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> Done with this domain
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Questions 8 and 9 - the tail of the S1 form, after the seven domains */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-600">Questions 8 and 9</p>
              <h2 className="font-bold text-gray-800">The last part of the risk screen</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-700 flex-1 min-w-[200px]">{SCREEN_TAIL.q8}</span>
            <YNToggle value={q8} onChange={setQ8} />
          </div>
          {q8 === "yes" && <input autoComplete="off" value={q8note} onChange={(e) => setQ8note(e.target.value)} className={inputCls} placeholder="Briefly, what are the concerns?" />}
          {/* Field 9. Assembled from the ticked sub-domains and nothing else -
              no indicators, no narratives, no dated events, no inferred causes.
              Editable, and the nurse's version wins until they regenerate. */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{SCREEN_TAIL.q9Label}</label>
            <p className="text-xs text-gray-500 mb-2">{FORMULATION_SUMMARY_NOTE}</p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 divide-y divide-slate-200 mb-2">
              {summaryRows.map((row) => (
                <div key={row.domainId} className="px-3 py-2 text-sm">
                  <span className="font-semibold text-gray-800">{row.title}: </span>
                  <span className={row.value === FORMULATION_NOT_COMPLETED ? "text-amber-700 font-medium" : "text-gray-700"}>{row.value}</span>
                  {row.indicators && <span className="block text-xs text-gray-600 mt-0.5">{row.indicators}</span>}
                </div>
              ))}
            </div>

            {formulationEdited ? (
              <>
                <textarea
                  value={q9} onChange={(e) => setQ9(e.target.value)} rows={10}
                  aria-label="Risk Formulation summary"
                  className={`${inputCls} font-mono text-xs`}
                />
                <p className="text-[11px] text-purple-700 mt-1">You have edited this. It will not be overwritten unless you regenerate.</p>
              </>
            ) : (
              <pre className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">{generatedFormulation}</pre>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {!formulationEdited && (
                <button
                  onClick={() => { setQ9(generatedFormulation); setFormulationEdited(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserPen className="w-3.5 h-3.5" /> Edit the summary
                </button>
              )}
              <button
                onClick={() => { if (formulationEdited) setRegenAsk(true); }}
                disabled={!formulationEdited}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Regenerate from selected sub-domains
              </button>
            </div>
            <S1CopyBox text={finalSummary} />
          </div>
          <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{SCREEN_TAIL.rmpGate} The plans built here go in the <strong>{SCREEN_TAIL.rmpLabel}</strong> field.</span>
          </p>
        </div>

        {/* Generate */}
        <div className="rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-rose-50 to-white p-5 text-center space-y-3">
          <p className="text-sm text-gray-600">
            {planDomains.length} {planDomains.length === 1 ? "domain has" : "domains have"} risks to plan for, and you have identified{" "}
            {allRisks.length} {allRisks.length === 1 ? "risk" : "risks"}.
          </p>
          <button
            onClick={doGenerate}
            disabled={!anyIntake}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          >
            <Sparkles className="w-5 h-5" /> Generate the risk documents
          </button>
          {!anyIntake && <p className="text-xs text-gray-600">Identify at least one risk first.</p>}
          {generated && <p className="text-xs text-emerald-700 font-semibold">Generated - see below.</p>}
          {patient && (
            <div className="pt-1">
              {riskMarked ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Risk assessment marked done for {patient.name} today - shows on their Care Review.
                </p>
              ) : (
                <button onClick={markRiskDone} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors">
                  <CheckCircle2 className="w-4 h-4" /> Mark risk assessment done for {patient.name}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Generate guard - confirm the domains that were never opened */}
        <Modal isOpen={guardOpen} onClose={() => setGuardOpen(false)} title="Before the documents are built" size="md">
          <div className="space-y-4">
            {missingIndicators.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Still to answer.</strong>{" "}&quot;Display clinical indicators&quot; is on the form for every
                  domain, so it needs a Yes or No on any domain you have worked.
                </p>
                {missingIndicators.map((dm) => (
                  <div key={dm.id} className="flex items-center gap-3 flex-wrap rounded-xl border-2 border-amber-300 bg-amber-50/60 p-3">
                    <span className="flex-1 min-w-[200px]">
                      <span className="block text-sm font-bold text-gray-800">{dm.number}. {dm.title}</span>
                      <span className="block text-xs text-gray-600 mt-0.5">{personalise(dm.indicatorsPrompt)}</span>
                    </span>
                    <YNToggle value={getDomain(dm.id).indicators} onChange={(v) => updateDomain(dm.id, (d) => ({ ...d, indicators: v }))} />
                  </div>
                ))}
              </div>
            )}
            {untouchedDomains.length > 0 && (
            <div className="space-y-2">
            <p className="text-sm text-gray-600">
              These domains have nothing in them. Confirm there are no known risks in each one and the exact
              &quot;no evidence&quot; wording goes into the risk screen for you.
            </p>
            <div className="space-y-2">
              {untouchedDomains.map((dm) => (
                <label key={dm.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 cursor-pointer hover:border-slate-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={getDomain(dm.id).noEvidence}
                    onChange={(e) => confirmNil(dm.id, e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    <span className="block text-sm font-bold text-gray-800">{dm.number}. {dm.title}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Confirm no risks known in this domain</span>
                  </span>
                </label>
              ))}
            </div>
            </div>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button onClick={() => setGuardOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                Go back and fill them in
              </button>
              <button
                onClick={runGenerate}
                disabled={untouchedDomains.length > 0 || missingIndicators.length > 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Confirm and generate
              </button>
            </div>
          </div>
        </Modal>

        {/* Outputs */}
        {generated && (
          <div id="risk-output" className="rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-rose-50 to-white p-4 space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-slate-500" /><h2 className="font-bold text-gray-800 flex-1">Copy into SystmOne</h2>
              <button
                onClick={() => printClinicalDoc({ title: patient ? `Risk Assessment - ${patient.name}` : "Risk Assessment", sections: [
                  { heading: "Risk screen summary", text: fullScreenText },
                  { heading: "Risk formulation summary (field 9)", text: finalSummary },
                  { heading: "Management plans (RMP)", text: buildRmpText() },
                ] })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-700 text-white hover:bg-slate-500 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print all
              </button>
            </div>
            <p className="text-xs text-gray-500">Tick each block as you paste it across, so you know what&apos;s done. Or use <strong>Print all</strong> to print the screen, formulation and plans together.</p>
            <div className="inline-flex bg-slate-100 rounded-full p-1 flex-wrap">
              {([{ k: "screen", label: "Risk Screen" }, { k: "formulation", label: "Formulation" }, { k: "rmp", label: "Management Plan" }] as const).map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === t.k ? "bg-sky-700 text-white shadow" : "text-slate-600 hover:bg-white/60"}`}>{t.label}</button>
              ))}
            </div>

            {tab === "screen" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm text-sky-800">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>The risk screen is completed <strong>on SystmOne as you go</strong> - tick the sub-domains and clinical indicators there, and paste each narrative using the green <strong>Copy into S1</strong> boxes in each domain step. The block below is a full text summary you can drop into a case note or handover.</p>
                </div>
                {!engagedDomains.length && q8 === "" && <p className="text-sm text-gray-600 text-center py-4">Nothing entered on the risk screen yet.</p>}
                <CopyField id="screen-all" label="Risk screen summary (for a case note / handover)" text={fullScreenText} done={copied.has("screen-all")} onToggle={toggleCopied} />
                {engagedDomains.length > 1 && engagedDomains.map((dm) => (
                  <CopyField key={dm.id} id={`screen-${dm.id}`} label={`${dm.number}. ${dm.short} (summary)`} text={domainScreenText(dm)} done={copied.has(`screen-${dm.id}`)} onToggle={toggleCopied} />
                ))}
              </div>
            )}

            {tab === "formulation" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  One bullet per domain, naming the sub-domains you ticked or the domain&apos;s own &quot;no evidence&quot; wording.
                  It goes in the single SystmOne formulation field (field 9). {FORMULATION_SUMMARY_NOTE}
                </p>
                <CopyField id="form-summary" label={`${SCREEN_TAIL.q9Label} (field 9)`} text={finalSummary} done={copied.has("form-summary")} onToggle={toggleCopied} />
              </div>
            )}

            {tab === "rmp" && (
              <div className="space-y-3">
                {!planDomains.length && <p className="text-sm text-gray-600 text-center py-4">Identify at least one risk to build a management plan.</p>}
                <p className="text-xs text-gray-500">One plan per domain, in domain order. Anything you flagged &quot;requires own RMP&quot; follows its domain as a separate plan.</p>
                <CopyField id="rmp-all" label="Management plans" text={buildRmpText()} done={copied.has("rmp-all")} onToggle={toggleCopied} />
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

        <p className="text-xs text-gray-600 text-center">
          Drafting aid only. Domains and sub-domains match the SystmOne WAA Inpatient Risk Screening Tool; the formulation and
          management-plan headings follow the DHCFT Risk Management Plans guidance. Nothing is saved. Always review wording before it goes in the record.
        </p>
      </div>
    </MainLayout>
  );
}
