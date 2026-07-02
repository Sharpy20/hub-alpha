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

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import {
  FORMULATION_SECTIONS, RMP_SECTIONS,
  RISK_TEACHING, RISK_EXAMPLES, S1_STEPS,
  type RiskSection,
} from "@/lib/data/guides";
import {
  RISK_DOMAINS, SUBTYPE_RISK, CLINICAL_INDICATORS,
} from "@/lib/data/welcome/risk-screen";
import {
  SectionEditor, buildOneRmp, formulationSectionForRisk,
  rmpSectionForRisk, buildContent, naturalList, cap, ensureStop,
  type AllState, type SecState, type DatedExample, EMPTY,
} from "@/components/guides/risk-capture";
import { useV2Href } from "@/lib/hooks/useV2";
import { FocusLinks } from "@/components/guides/FocusLinks";
import { PatientLink } from "@/components/guides/PatientLink";
import { Patient } from "@/lib/types";
import {
  ArrowLeft, ArrowRight, Copy, Check, CheckCircle2, RotateCcw, ChevronDown,
  ChevronRight, Info, Lightbulb, AlertTriangle, GraduationCap, ListChecks,
  Sparkles, ShieldAlert, ClipboardCheck, Plus, X,
} from "lucide-react";

type YN = "" | "yes" | "no";

interface DomainState {
  indicators: YN; indicatorList: string[]; safety: YN; current: string; historical: string;
  noEvidence: boolean; risks: string[]; // selected sub-domain labels
  currentExamples: DatedExample[];
  historicalExamples: DatedExample[];
}
const emptyDomain = (): DomainState => ({
  indicators: "", indicatorList: [], safety: "", current: "", historical: "",
  noEvidence: false, risks: [], currentExamples: [], historicalExamples: [],
});

interface RiskRef { key: string; label: string; chipRisk: string }

// ---- The one ordered question set (per risk) --------------------------------
// The nurse answers these in order; each maps to ONE output section so the answer
// flows straight into the Formulation (doc "f") or the Management Plan (doc "r").
// `chip` says where the suggestion chips come from: "generic" = the section's own
// chips; "f"/"r" = that risk's tailored formulation / RMP chips. No section's
// chips appear under more than one question, so nothing is duplicated.
interface UnifiedQuestion {
  id: string;
  question: string;
  hint: string;
  gap?: string;
  examples?: boolean;
  chip: { doc: "generic" | "f" | "r"; id: string };
  writes: { doc: "f" | "r"; id: string };
}
const UNIFIED_QUESTIONS: UnifiedQuestion[] = [
  { id: "q_seen", question: "What is the risk, and what have you seen or heard recently?", hint: "The events that bring this risk to attention now.", gap: "What has happened recently?", chip: { doc: "generic", id: "presenting" }, writes: { doc: "f", id: "presenting" } },
  { id: "q_signs", question: "What are the early warning signs it is building or happening?", hint: "The specific, observable signs to watch for in THIS patient.", gap: "What are the early warning signs?", examples: true, chip: { doc: "r", id: "present" }, writes: { doc: "r", id: "present" } },
  { id: "q_history", question: "What in their history makes this more likely?", hint: "Longer-term background - trauma, diagnosis, past attempts, admissions.", gap: "What raises the baseline risk?", chip: { doc: "f", id: "predisposing" }, writes: { doc: "f", id: "predisposing" } },
  { id: "q_trigger", question: "What has happened recently to trigger it?", hint: "Recent events or stressors that set it off.", gap: "What triggers the risk?", chip: { doc: "f", id: "precipitating" }, writes: { doc: "f", id: "precipitating" } },
  { id: "q_keeps", question: "What is keeping it going?", hint: "What sustains the risk once it has started.", gap: "What keeps it going?", chip: { doc: "f", id: "perpetuating" }, writes: { doc: "f", id: "perpetuating" } },
  { id: "q_pattern", question: "Is it escalating, repeating, or new?", hint: "How it has changed over days, weeks or admissions.", gap: "What is the pattern over time?", chip: { doc: "f", id: "pattern" }, writes: { doc: "f", id: "pattern" } },
  { id: "q_when", question: "When and where is the risk highest?", hint: "Times, situations or people that make the risk rise.", gap: "When is the risk highest?", chip: { doc: "f", id: "dynamic" }, writes: { doc: "f", id: "dynamic" } },
  { id: "q_helps", question: "What helps - their strengths and what keeps them safe?", hint: "Protective factors, and how stable or fragile they are right now.", gap: "What is protective, and how robust is it?", chip: { doc: "f", id: "protective" }, writes: { doc: "f", id: "protective" } },
  { id: "q_engage", question: "How engaged are they, and do they recognise the risk?", hint: "Engagement and insight.", gap: "What helps them engage?", chip: { doc: "f", id: "engagement" }, writes: { doc: "f", id: "engagement" } },
  { id: "q_do", question: "What will we do to manage, prevent or reduce the risk?", hint: "What to do when it happens, and what prevents or reduces it. Say why where it helps.", gap: "What specifically helps this patient?", chip: { doc: "r", id: "prevent" }, writes: { doc: "r", id: "prevent" } },
  { id: "q_working", question: "How will we know it is working?", hint: "Measurable change - avoid vague. How will you KNOW the risk is reducing?", gap: "What measurable change shows the risk is reducing?", chip: { doc: "r", id: "evaluate" }, writes: { doc: "r", id: "evaluate" } },
  { id: "q_escalate", question: "What if the plan is not working - when and how do we escalate?", hint: "Escalation thresholds. The mandatory MDT line is added for you.", gap: "When and how do you escalate?", chip: { doc: "r", id: "next" }, writes: { doc: "r", id: "next" } },
  { id: "q_judgement", question: "Overall, what is your clinical judgement of the risk?", hint: "Short and medium term. Pull the threads together.", gap: "What is your overall judgement?", chip: { doc: "f", id: "judgement" }, writes: { doc: "f", id: "judgement" } },
];

const F_SECTION = (id: string) => FORMULATION_SECTIONS.find((s) => s.id === id)!;
const R_SECTION = (id: string) => RMP_SECTIONS.find((s) => s.id === id)!;

// Build the display section for one question against a given risk's chip bank.
function questionSectionFor(q: UnifiedQuestion, risk: string): RiskSection {
  let src: RiskSection;
  if (q.chip.doc === "generic") src = F_SECTION(q.chip.id);
  else if (q.chip.doc === "f") src = formulationSectionForRisk(F_SECTION(q.chip.id), risk);
  else src = rmpSectionForRisk(R_SECTION(q.chip.id), risk);
  return { id: q.id, heading: q.question, hint: q.hint, gap: q.gap, groups: src.groups, examples: q.examples };
}
// Split one risk's unified answers into formulation-section and RMP-section states.
function deriveForm(cap: AllState | undefined): AllState {
  const out: AllState = {};
  for (const q of UNIFIED_QUESTIONS) if (q.writes.doc === "f") out[q.writes.id] = cap?.[q.id] || EMPTY;
  return out;
}
function deriveRmp(cap: AllState | undefined): AllState {
  const out: AllState = {};
  for (const q of UNIFIED_QUESTIONS) if (q.writes.doc === "r") out[q.writes.id] = cap?.[q.id] || EMPTY;
  return out;
}
// ONE formulation covering all risks (SystmOne has a single formulation field),
// with each risk as a sub-heading. Kept as one block so the nurse copies once.
// (The RMPs stay separate per risk - trust rule.)
function buildCombinedFormulation(risks: RiskRef[], caps: Record<string, AllState>, patientName?: string): string {
  const perRisk: string[] = [];
  for (const r of risks) {
    const secs = deriveForm(caps[r.key]);
    const filled = FORMULATION_SECTIONS
      .map((sec) => ({ heading: sec.heading, body: buildContent(secs[sec.id]) }))
      .filter((s) => s.body);
    if (!filled.length) continue;
    const sub: string[] = [`### ${r.label} ###`];
    filled.forEach((s, i) => { sub.push(s.heading.toUpperCase()); sub.push(s.body); if (i < filled.length - 1) sub.push(TXT_DIV); });
    perRisk.push(sub.join("\n"));
  }
  if (!perRisk.length) return "";
  const head = [TXT_BAR, "RISK FORMULATION", ...(patientName ? [`Patient: ${patientName}`] : []), TXT_BAR];
  return head.join("\n") + "\n" + perRisk.join("\n" + TXT_BAR + "\n");
}
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
function withExamples(text: string, examples: DatedExample[] = []): string {
  const base = text.trim();
  const exs = examples.filter((e) => e.text.trim());
  if (!exs.length) return base;
  const fmt = exs.map((e) => { const d = formatPartialDate(e); return `${d ? d + " - " : ""}${e.text.trim()}`; }).join("; ");
  return `${base ? base + " " : ""}Specific examples: ${fmt}`;
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
          className={`px-3 py-1.5 text-sm font-semibold transition-colors ${value === v ? (v === "yes" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white") : "bg-white text-gray-500 hover:bg-gray-50"}`}>
          {v === "yes" ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

// Dated specific-examples list under a narrative field (date optional).
function DatedExamples({ examples, onChange }: { examples?: DatedExample[]; onChange: (next: DatedExample[]) => void }) {
  const list = examples || [];
  const upd = (i: number, patch: Partial<DatedExample>) => onChange(list.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const selCls = "text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-rose-400 focus:border-rose-400";
  // Only rendered after the user adds an example (client-side), so new Date() here
  // is safe from hydration mismatch.
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 71 }, (_, i) => thisYear - i);
  return (
    <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50/40 p-2.5 space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-wider text-rose-500">
        Give dated examples (date optional - just the year, the month and year, or the full date)
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
            <button onClick={() => onChange(list.filter((_, idx) => idx !== i))} aria-label="Remove example" className="ml-auto text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>
          </div>
          <input type="text" value={ex.text} placeholder="what happened" onChange={(e) => upd(i, { text: e.target.value })} className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-rose-400 focus:border-rose-400" />
        </div>
      ))}
      <button onClick={() => onChange([...list, { day: "", month: "", year: "", text: "" }])} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 transition-colors">
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

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-400 focus:border-rose-400";

export default function RiskAssessmentPage() {
  const v2Href = useV2Href();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [domains, setDomains] = useState<Record<string, DomainState>>({});
  const [capByRisk, setCapByRisk] = useState<Record<string, AllState>>({});
  const [openRisks, setOpenRisks] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(0); // 0..RISK_DOMAINS.length-1 = domains, last = Review
  const [introOpen, setIntroOpen] = useState(true);
  const [q8, setQ8] = useState<YN>("");
  const [q8note, setQ8note] = useState("");
  const [q9, setQ9] = useState("");
  const [generated, setGenerated] = useState(false);
  const [tab, setTab] = useState<"screen" | "formulation" | "rmp">("screen");
  const [copied, setCopied] = useState<Set<string>>(new Set());

  const patientName = patient?.name;
  const REVIEW_STEP = RISK_DOMAINS.length;       // concerns / summary step
  const GENERATE_STEP = RISK_DOMAINS.length + 1; // final step - holds the Generate button
  const TOTAL_STEPS = RISK_DOMAINS.length + 2;

  const getDomain = (id: string): DomainState => domains[id] || emptyDomain();
  const setDomain = (id: string, next: DomainState) => setDomains((s) => ({ ...s, [id]: next }));
  const cGet = (key: string, qid: string): SecState => capByRisk[key]?.[qid] || EMPTY;
  const cSet = (key: string, qid: string, v: SecState) => setCapByRisk((s) => ({ ...s, [key]: { ...s[key], [qid]: v } }));
  const toggleCopied = (id: string, on: boolean) => setCopied((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });

  const toggleSub = (domainId: string, label: string) => {
    const d = getDomain(domainId);
    const has = d.risks.includes(label);
    setDomain(domainId, { ...d, noEvidence: false, risks: has ? d.risks.filter((r) => r !== label) : [...d.risks, label] });
    if (!has) setOpenRisks((s) => new Set(s).add(`${domainId}::${label}`));
  };
  const toggleOpenRisk = (key: string) => setOpenRisks((s) => { const n = new Set(s); if (n.has(key)) n.delete(key); else n.add(key); return n; });

  const reset = () => {
    setDomains({}); setCapByRisk({}); setQ8(""); setQ8note(""); setQ9("");
    setGenerated(false); setCopied(new Set()); setOpenRisks(new Set()); setTab("screen"); setStep(0);
  };

  const isEngaged = (d: DomainState) =>
    d.risks.length > 0 || d.noEvidence || d.current.trim() !== "" || d.historical.trim() !== "" || d.indicators !== "" || d.safety !== "" ||
    (d.currentExamples || []).some((e) => e.text.trim()) || (d.historicalExamples || []).some((e) => e.text.trim());

  const stepComplete = (i: number): boolean => {
    if (i === GENERATE_STEP) return generated;
    if (i === REVIEW_STEP) return q8 !== "" || q9.trim() !== "";
    return isEngaged(getDomain(RISK_DOMAINS[i].id));
  };

  const personalise = (s: string) => {
    const nm = patientName;
    return nm ? s.replace(/the person's/g, `${nm}'s`).replace(/the person/g, nm) : s;
  };

  const allRisks = useMemo<RiskRef[]>(() => {
    const out: RiskRef[] = [];
    for (const dm of RISK_DOMAINS) for (const label of getDomain(dm.id).risks) {
      const key = `${dm.id}::${label}`;
      out.push({ key, label, chipRisk: SUBTYPE_RISK[key] || "" });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains]);

  const overallSummary = useMemo(() => {
    if (!allRisks.length) return "";
    const lines: string[] = [`Risks identified on screening: ${naturalList(allRisks.map((r) => r.label))}.`];
    for (const r of allRisks) {
      const present = buildContent(capByRisk[r.key]?.["q_seen"]);
      const judge = buildContent(capByRisk[r.key]?.["q_judgement"]);
      const bits = [present, judge].filter((x) => x && x !== "Not yet established.");
      if (bits.length) lines.push(`${cap(r.label)}: ${ensureStop(bits.join(" "))}`);
    }
    const inds = [...new Set(RISK_DOMAINS.flatMap((dm) => getDomain(dm.id).indicatorList))];
    if (inds.length) lines.push(`Clinical indicators noted: ${naturalList(inds)}.`);
    return lines.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains, capByRisk]);
  const finalSummary = [overallSummary, q9.trim()].filter(Boolean).join(" ");

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

  const fullScreenText = useMemo(() => {
    if (!engagedDomains.length && q8 === "") return "";
    const parts: string[] = [TXT_BAR, "RISK SCREENING TOOL", ...(patientName ? [`Patient: ${patientName}`] : []), TXT_BAR];
    engagedDomains.forEach((dm, i) => {
      parts.push(domainScreenText(dm));
      if (i < engagedDomains.length - 1) parts.push(TXT_DIV);
    });
    if (q8) parts.push(TXT_DIV, `Do you, or has anyone else, expressed concerns: ${q8 === "yes" ? "Yes" : "No"}${q8note.trim() ? ` - ${q8note.trim()}` : ""}`);
    if (finalSummary) parts.push(TXT_DIV, `Overall risk formulation summary: ${finalSummary}`);
    return parts.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains, q8, q8note, finalSummary, patientName]);

  const anyIntake = allRisks.length > 0 || engagedDomains.length > 0 || q8 !== "" || q9.trim() !== "";

  const doGenerate = () => { setGenerated(true); setTimeout(() => document.getElementById("risk-output")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };

  // One risk's unified question run. Plain render function (NOT a nested
  // component) so editing a field doesn't remount and drop textarea focus.
  const renderRiskCapture = (r: RiskRef) => {
    const open = openRisks.has(r.key);
    const done = UNIFIED_QUESTIONS.reduce((n, q) => n + (answered(capByRisk[r.key]?.[q.id]) ? 1 : 0), 0);
    return (
      <div key={r.key} className="rounded-xl border border-rose-200 bg-white overflow-hidden">
        <button onClick={() => toggleOpenRisk(r.key)} className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-rose-50/60 hover:bg-rose-50 transition-colors text-left">
          <span className="font-bold text-rose-900 text-sm flex-1">{r.label}</span>
          <span className="text-[10px] text-rose-600">{done}/{UNIFIED_QUESTIONS.length} answered</span>
          {open ? <ChevronDown className="w-4 h-4 text-rose-400" /> : <ChevronRight className="w-4 h-4 text-rose-400" />}
        </button>
        {open && (
          <div className="p-3 space-y-2">
            <p className="text-xs text-gray-500">
              Answer these in your own words - it builds this risk&apos;s formulation and management plan for you. The
              headings are added when you generate.
            </p>
            {UNIFIED_QUESTIONS.map((q) => (
              <SectionEditor key={q.id} section={questionSectionFor(q, r.chipRisk)} state={cGet(r.key, q.id)} onChange={(n) => cSet(r.key, q.id, n)} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // One domain's full progressive-disclosure page.
  const renderDomain = (dm: typeof RISK_DOMAINS[number]) => {
    const st = getDomain(dm.id);
    const engaged = isEngaged(st);
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {dm.subtypes.map((label) => {
            const on = st.risks.includes(label);
            return (
              <button key={label} onClick={() => toggleSub(dm.id, label)} aria-pressed={on}
                className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all text-left ${on ? "bg-rose-600 border-rose-600 text-white font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50"}`}>
                {label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={st.noEvidence} onChange={(e) => setDomain(dm.id, { ...st, noEvidence: e.target.checked, risks: e.target.checked ? [] : st.risks })} className="rounded border-gray-300 text-emerald-600 w-4 h-4" />
          {dm.noEvidence}
        </label>

        {engaged && (
          <div className="space-y-3 rounded-lg bg-gray-50 p-3">
            {dm.safetyPrompt && (
              <div className="flex items-center gap-3 flex-wrap"><span className="text-sm text-gray-600 flex-1 min-w-[180px]">{personalise(dm.safetyPrompt)}</span><YNToggle value={st.safety} onChange={(v) => setDomain(dm.id, { ...st, safety: v })} /></div>
            )}
            {CLINICAL_INDICATORS[dm.id] && (
              <div>
                <div className="flex items-center gap-3 flex-wrap"><span className="text-sm text-gray-600 flex-1 min-w-[180px]">{personalise(dm.indicatorsPrompt)}</span><YNToggle value={st.indicators} onChange={(v) => setDomain(dm.id, { ...st, indicators: v })} /></div>
                {st.indicators === "yes" && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {CLINICAL_INDICATORS[dm.id].map((ind) => {
                      const on = st.indicatorList.includes(ind);
                      return (
                        <button key={ind} type="button" aria-pressed={on}
                          onClick={() => setDomain(dm.id, { ...st, indicatorList: on ? st.indicatorList.filter((x) => x !== ind) : [...st.indicatorList, ind] })}
                          className={`px-2 py-1 rounded-lg text-xs border transition-all text-left ${on ? "bg-rose-600 border-rose-600 text-white font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50"}`}>
                          {ind}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{personalise(dm.currentPrompt)}</label>
              <p className="flex items-start gap-1.5 text-xs text-rose-700/80 mb-1"><Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Gap prompt: add any other indicators, or what has happened recently.</p>
              <textarea value={st.current} onChange={(e) => setDomain(dm.id, { ...st, current: e.target.value })} rows={2} className={inputCls} />
              <DatedExamples examples={st.currentExamples} onChange={(next) => setDomain(dm.id, { ...st, currentExamples: next })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{personalise(dm.historicalPrompt)}</label>
              {dm.historicalSubPrompts && (
                <ul className="mb-1.5 ml-1 space-y-0.5">
                  {dm.historicalSubPrompts.map((sp) => <li key={sp} className="text-xs text-gray-400">- {personalise(sp)}</li>)}
                </ul>
              )}
              <textarea value={st.historical} onChange={(e) => setDomain(dm.id, { ...st, historical: e.target.value })} rows={2} className={inputCls} />
              <DatedExamples examples={st.historicalExamples} onChange={(next) => setDomain(dm.id, { ...st, historicalExamples: next })} />
            </div>
          </div>
        )}

        {st.risks.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-rose-500">Answer the questions for each risk</p>
            {st.risks.map((label) => renderRiskCapture({ key: `${dm.id}::${label}`, label, chipRisk: SUBTYPE_RISK[`${dm.id}::${label}`] || "" }))}
          </div>
        )}
      </div>
    );
  };

  const onDomainStep = step < REVIEW_STEP;
  const currentDomain = onDomainStep ? RISK_DOMAINS[step] : null;

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
                  Work through the risk screen one area at a time. Answer the questions for each risk - it builds all three documents to copy across.
                </p>
              </div>
            </div>
            <Link href={v2Href("/guides")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
          <PatientLink patient={patient} onChange={setPatient} guideTitle="Risk Assessment" note="Adds the patient's name to the risk screen, formulation and RMP" />
        </div>

        {/* Intro / explainer */}
        <div className="rounded-2xl border border-rose-100 bg-white overflow-hidden">
          <button onClick={() => setIntroOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
            <Info className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="font-bold text-gray-800 flex-1">New to this? How the tool works</span>
            {introOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {introOpen && (
            <div className="px-4 pb-4 space-y-4">
              <p className="text-sm text-gray-600">
                Use this tool to build the framework for a patient&apos;s <strong>risk screening tool</strong> - it helps you
                generate a quality <strong>formulation</strong> and <strong>risk management plans</strong>. Each step matches a
                risk domain from the Risk Screening Tool on SystmOne.
              </p>

              {/* Flow visual */}
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { n: 1, icon: ShieldAlert, title: "Screen with the patient", body: "Work the seven SystmOne risk domains together, ticking what applies." },
                    { n: 2, icon: ListChecks, title: "Answer the questions", body: "For each risk identified, answer a short set of plain questions in the patient's words." },
                    { n: 3, icon: Sparkles, title: "Generate", body: "One click turns your answers into three documents to copy across." },
                  ].map((s) => (
                    <div key={s.n} className="rounded-lg bg-white border border-rose-100 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{s.n}</span>
                        <s.icon className="w-4 h-4 text-rose-500" />
                      </div>
                      <p className="text-sm font-bold text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.body}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center flex-wrap gap-1.5 mt-3">
                  <span className="text-xs font-semibold text-gray-500">Generates</span>
                  <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                  {["Risk Screen", "Formulation", "Risk Management Plan"].map((d) => (
                    <span key={d} className="text-xs font-semibold text-rose-700 bg-rose-100 px-2 py-1 rounded-full">{d}</span>
                  ))}
                </div>
                <p className="text-center text-[11px] text-gray-500 mt-2">Copy each one into SystmOne and tick it off as you go.</p>
              </div>

              {/* Before you start */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-rose-500 mb-1.5">Before you start</p>
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

              <p className="text-xs text-gray-400">
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

        {/* Progress bar - one dot per domain + Review */}
        <div className="bg-white rounded-2xl border border-rose-100 p-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const isReview = i === REVIEW_STEP;
              const isGenerate = i === GENERATE_STEP;
              const label = isGenerate ? "Generate" : isReview ? "Review" : String(RISK_DOMAINS[i].number);
              const aria = isGenerate ? "Generate step" : isReview ? "Review step" : `Domain ${RISK_DOMAINS[i].number}: ${RISK_DOMAINS[i].title}`;
              const done = stepComplete(i);
              const current = step === i;
              return (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-current={current}
                  aria-label={aria}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-bold flex-shrink-0 border transition-all ${
                    current ? "bg-rose-600 border-rose-600 text-white"
                      : done ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-rose-300"
                  }`}
                >
                  {done && !current ? <CheckCircle2 className="w-4 h-4" /> : null}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current step card */}
        <div className="bg-white rounded-2xl border-2 border-rose-300 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <div className="flex-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-rose-500">
                {onDomainStep ? `Domain ${currentDomain!.number} of ${RISK_DOMAINS.length}` : step === REVIEW_STEP ? "Review" : "Final step"}
              </p>
              <h2 className="font-bold text-gray-800">{onDomainStep ? currentDomain!.title : step === REVIEW_STEP ? "Review & concerns" : "Generate the documents"}</h2>
            </div>
            {stepComplete(step) && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> Done</span>}
          </div>

          {onDomainStep ? (
            <>
              <p className="text-xs text-gray-500">
                Tick the sub-domains that apply (or &quot;no evidence&quot;), add the screen narrative, then answer the
                questions for each risk. If nothing applies here, tick &quot;no evidence&quot; and move on.
              </p>
              {renderDomain(currentDomain!)}
            </>
          ) : step === REVIEW_STEP ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap"><span className="text-sm font-semibold text-gray-700 flex-1 min-w-[200px]">Do you, or has anyone else, expressed concerns?</span><YNToggle value={q8} onChange={setQ8} /></div>
              {q8 === "yes" && <input autoComplete="off" value={q8note} onChange={(e) => setQ8note(e.target.value)} className={inputCls} placeholder="Briefly, what are the concerns?" />}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Overall risk formulation summary</label>
                <p className="text-xs text-gray-500 mb-1.5">Auto-built from the risks and their answers (each risk&apos;s recent events + overall judgement, plus any clinical indicators). Add anything else below.</p>
                {overallSummary ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap mb-2">{overallSummary}</div>
                ) : (
                  <p className="text-xs text-gray-400 italic mb-2">Work through the domains and answer the risk questions - the summary builds itself here.</p>
                )}
                <textarea value={q9} onChange={(e) => setQ9(e.target.value)} rows={2} className={inputCls} placeholder="Add anything else to the summary (optional)..." />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center py-2">
              <p className="text-sm text-gray-600">
                You&apos;ve worked through {engagedDomains.length} {engagedDomains.length === 1 ? "domain" : "domains"} and identified{" "}
                {allRisks.length} {allRisks.length === 1 ? "risk" : "risks"}. When you&apos;re ready, generate the documents to copy into SystmOne.
              </p>
              <button
                onClick={doGenerate}
                disabled={!anyIntake}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
              >
                <Sparkles className="w-5 h-5" /> Generate the risk documents
              </button>
              {!anyIntake && <p className="text-xs text-gray-400">Identify at least one risk first.</p>}
              {generated && <p className="text-xs text-emerald-700 font-semibold">Generated - see below.</p>}
            </div>
          )}

          {/* Wizard nav */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < GENERATE_STEP ? (
              <button
                onClick={() => setStep((s) => Math.min(GENERATE_STEP, s + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs text-gray-400">Last step</span>
            )}
          </div>
        </div>

        {/* Outputs */}
        {generated && (
          <div id="risk-output" className="rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-white p-4 space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-rose-600" /><h2 className="font-bold text-gray-800 flex-1">Copy into SystmOne</h2></div>
            <p className="text-xs text-gray-500">Tick each block as you paste it across, so you know what&apos;s done.</p>
            <div className="inline-flex bg-rose-100 rounded-full p-1 flex-wrap">
              {([{ k: "screen", label: "Risk Screen" }, { k: "formulation", label: "Formulation" }, { k: "rmp", label: "Management Plan" }] as const).map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === t.k ? "bg-rose-600 text-white shadow" : "text-rose-700 hover:bg-white/60"}`}>{t.label}</button>
              ))}
            </div>

            {tab === "screen" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm text-sky-800">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>First, in the SystmOne risk screen, <strong>tick these options if you haven&apos;t already</strong> (the domains, sub-domains and clinical indicators below). Then paste the narrative blocks into the matching notes fields.</p>
                </div>
                {!engagedDomains.length && q8 === "" && <p className="text-sm text-gray-400 text-center py-4">Nothing entered on the risk screen yet.</p>}
                <CopyField id="screen-all" label="Whole risk screen (one block)" text={fullScreenText} done={copied.has("screen-all")} onToggle={toggleCopied} />
                {engagedDomains.length > 1 && engagedDomains.map((dm) => (
                  <CopyField key={dm.id} id={`screen-${dm.id}`} label={`${dm.number}. ${dm.short}`} text={domainScreenText(dm)} done={copied.has(`screen-${dm.id}`)} onToggle={toggleCopied} />
                ))}
              </div>
            )}

            {tab === "formulation" && (
              <div className="space-y-3">
                {allRisks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Identify at least one risk to build a formulation.</p>}
                <p className="text-xs text-gray-500">One formulation covering all risks (SystmOne has a single formulation field), with each risk as a sub-heading. The management plans stay separate per risk (next tab).</p>
                <CopyField id="form-all" label="Risk formulation (all risks)" text={buildCombinedFormulation(allRisks, capByRisk, patientName)} done={copied.has("form-all")} onToggle={toggleCopied} />
                {finalSummary && <CopyField id="form-summary" label="Overall formulation summary" text={finalSummary} done={copied.has("form-summary")} onToggle={toggleCopied} />}
              </div>
            )}

            {tab === "rmp" && (
              <div className="space-y-3">
                {allRisks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Identify at least one risk to build a management plan.</p>}
                {allRisks.map((r) => (
                  <CopyField key={r.key} id={`rmp-${r.key}`} label={`RMP - ${r.label}`} text={buildOneRmp(r.key, deriveRmp(capByRisk[r.key]), r.label, patientName)} done={copied.has(`rmp-${r.key}`)} onToggle={toggleCopied} />
                ))}
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
          Drafting aid only. Domains and sub-domains match the SystmOne WAA Inpatient Risk Screening Tool; the formulation and
          management-plan headings follow the DHCFT Risk Management Plans guidance. Nothing is saved. Always review wording before it goes in the record.
        </p>
      </div>
    </MainLayout>
  );
}
