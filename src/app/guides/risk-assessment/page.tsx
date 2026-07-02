"use client";

// Risk Formulation & Management Plan tool.
//
// Reworked (2 Jul 2026) to mirror the SystmOne WAA Inpatient Risk Screening Tool.
// Mike's steer: the risk screen, formulation and RMP are "the one same document"
// in S1 - the screen identifies the risks, and those same risks flow into the
// formulation (the WHY) and the management plan (the WHAT). So we gather once,
// against the approved S1 domains + sub-domains, then generate all three outputs.
//
// Flow:
//   1. Work through the 7 approved S1 domains (progressive disclosure): tick the
//      sub-domains that apply (or "no evidence"), answer the S1 follow-ups
//      (safety / clinical indicators Y/N + list / current narrative / historical
//      narrative), and for each ticked sub-domain fill its WHY (formulation) and
//      WHAT (management plan).
//   2. Concerns question + an auto-built overall formulation summary.
//   3. Generate -> three copy-out tabs (Risk Screen, Formulation, Management Plan),
//      each block with a "pasted into SystmOne" tick.
//
// Nothing is saved. All state is in memory. The approved S1 wording is never
// paraphrased - only "the person" is personalised on screen with the linked
// patient's name (display only; the copied wording keeps the approved terms).

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import {
  FORMULATION_SECTIONS, RMP_SECTIONS,
  RISK_TEACHING, RISK_EXAMPLES, S1_STEPS,
} from "@/lib/data/guides";
import {
  RISK_DOMAINS, SUBTYPE_RISK, CLINICAL_INDICATORS,
} from "@/lib/data/welcome/risk-screen";
import {
  SectionEditor, buildFormulation, buildOneRmp, formulationSectionForRisk,
  rmpSectionForRisk, buildContent, naturalList, cap, ensureStop,
  type AllState, type SecState, EMPTY,
} from "@/components/guides/risk-capture";
import { useV2Href } from "@/lib/hooks/useV2";
import { FocusLinks } from "@/components/guides/FocusLinks";
import { PatientLink } from "@/components/guides/PatientLink";
import { Patient } from "@/lib/types";
import {
  ArrowLeft, Copy, Check, RotateCcw, ChevronDown, ChevronRight, Info,
  Lightbulb, AlertTriangle, GraduationCap, ListChecks, Sparkles, ShieldAlert,
  Brain, ClipboardCheck,
} from "lucide-react";

type YN = "" | "yes" | "no";

interface DomainState {
  indicators: YN; indicatorList: string[]; safety: YN; current: string; historical: string;
  noEvidence: boolean; risks: string[]; // selected sub-domain labels
}
const emptyDomain = (): DomainState => ({
  indicators: "", indicatorList: [], safety: "", current: "", historical: "",
  noEvidence: false, risks: [],
});

interface RiskRef { key: string; label: string; chipRisk: string }

const TXT_BAR = "========================================";
const TXT_DIV = "----------------------------------------";

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
  }
}

// Yes / No pill toggle (Yes = rose, No = emerald), clears on re-click.
function YNToggle({ value, onChange }: { value: YN; onChange: (v: YN) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      {(["yes", "no"] as const).map((v) => (
        <button
          key={v} type="button" onClick={() => onChange(value === v ? "" : v)} aria-pressed={value === v}
          className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
            value === v
              ? (v === "yes" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white")
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {v === "yes" ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

// A copy-out block with a "pasted in" tick. Hidden when empty.
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

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-400 focus:border-rose-400";

export default function RiskAssessmentPage() {
  const v2Href = useV2Href();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [domains, setDomains] = useState<Record<string, DomainState>>({});
  const [formByRisk, setFormByRisk] = useState<Record<string, AllState>>({});
  const [rmpByRisk, setRmpByRisk] = useState<Record<string, AllState>>({});
  const [openDomain, setOpenDomain] = useState<string | null>(RISK_DOMAINS[0].id);
  const [openRisks, setOpenRisks] = useState<Set<string>>(new Set());
  const [riskTab, setRiskTab] = useState<Record<string, "why" | "what">>({});
  const [q8, setQ8] = useState<YN>("");
  const [q8note, setQ8note] = useState("");
  const [q9, setQ9] = useState("");
  const [generated, setGenerated] = useState(false);
  const [tab, setTab] = useState<"screen" | "formulation" | "rmp">("screen");
  const [copied, setCopied] = useState<Set<string>>(new Set());

  const patientName = patient?.name;

  const getDomain = (id: string): DomainState => domains[id] || emptyDomain();
  const setDomain = (id: string, next: DomainState) => setDomains((s) => ({ ...s, [id]: next }));
  const fGet = (key: string, sec: string): SecState => formByRisk[key]?.[sec] || EMPTY;
  const fSet = (key: string, sec: string, v: SecState) => setFormByRisk((s) => ({ ...s, [key]: { ...s[key], [sec]: v } }));
  const rGet = (key: string, sec: string): SecState => rmpByRisk[key]?.[sec] || EMPTY;
  const rSet = (key: string, sec: string, v: SecState) => setRmpByRisk((s) => ({ ...s, [key]: { ...s[key], [sec]: v } }));
  const toggleCopied = (id: string, on: boolean) => setCopied((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });

  const toggleSub = (domainId: string, label: string) => {
    const d = getDomain(domainId);
    const has = d.risks.includes(label);
    setDomain(domainId, { ...d, noEvidence: false, risks: has ? d.risks.filter((r) => r !== label) : [...d.risks, label] });
    if (!has) setOpenRisks((s) => new Set(s).add(`${domainId}::${label}`));
  };
  const toggleOpenRisk = (key: string) => setOpenRisks((s) => { const n = new Set(s); if (n.has(key)) n.delete(key); else n.add(key); return n; });

  const reset = () => {
    setDomains({}); setFormByRisk({}); setRmpByRisk({});
    setQ8(""); setQ8note(""); setQ9(""); setGenerated(false); setCopied(new Set());
    setOpenRisks(new Set()); setTab("screen"); setOpenDomain(RISK_DOMAINS[0].id);
  };

  const isEngaged = (d: DomainState) =>
    d.risks.length > 0 || d.noEvidence || d.current.trim() !== "" || d.historical.trim() !== "" || d.indicators !== "" || d.safety !== "";

  // Personalise the approved prompts on screen only (copied wording keeps the
  // approved "the person" terms).
  const personalise = (s: string) => {
    const nm = patientName;
    return nm ? s.replace(/the person's/g, `${nm}'s`).replace(/the person/g, nm) : s;
  };

  // Every ticked sub-domain across all domains, in S1 order.
  const allRisks = useMemo<RiskRef[]>(() => {
    const out: RiskRef[] = [];
    for (const dm of RISK_DOMAINS) for (const label of getDomain(dm.id).risks) {
      const key = `${dm.id}::${label}`;
      out.push({ key, label, chipRisk: SUBTYPE_RISK[key] || "" });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains]);

  // Auto overall formulation summary - each risk's presenting + judgement, plus
  // the clinical indicators (they pull through into the formulation).
  const overallSummary = useMemo(() => {
    if (!allRisks.length) return "";
    const lines: string[] = [`Risks identified on screening: ${naturalList(allRisks.map((r) => r.label))}.`];
    for (const r of allRisks) {
      const present = buildContent(formByRisk[r.key]?.["presenting"]);
      const judge = buildContent(formByRisk[r.key]?.["judgement"]);
      const bits = [present, judge].filter((x) => x && x !== "Not yet established.");
      if (bits.length) lines.push(`${cap(r.label)}: ${ensureStop(bits.join(" "))}`);
    }
    const inds = [...new Set(RISK_DOMAINS.flatMap((dm) => getDomain(dm.id).indicatorList))];
    if (inds.length) lines.push(`Clinical indicators noted: ${naturalList(inds)}.`);
    return lines.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains, formByRisk]);
  const finalSummary = [overallSummary, q9.trim()].filter(Boolean).join(" ");

  // One domain's risk-screen text (matches S1 field order).
  const domainScreenText = (dm: typeof RISK_DOMAINS[number]): string => {
    const st = getDomain(dm.id);
    if (!isEngaged(st)) return "";
    const parts: string[] = [`${dm.number}. ${dm.title}`];
    if (st.noEvidence) parts.push(dm.noEvidence);
    else if (st.risks.length) st.risks.forEach((r) => parts.push(`- ${r}`));
    if (dm.safetyPrompt && st.safety) parts.push(`Concerns about safety: ${st.safety === "yes" ? "Yes" : "No"}`);
    if (st.indicators) parts.push(`Clinical indicators: ${st.indicators === "yes" ? "Yes" : "No"}`);
    if (st.indicatorList.length) parts.push(`Indicators present: ${st.indicatorList.join("; ")}`);
    if (st.current.trim()) parts.push(`Current concerns: ${ensureStop(cap(st.current.trim()))}`);
    if (st.historical.trim()) parts.push(`Historical: ${ensureStop(cap(st.historical.trim()))}`);
    return parts.join("\n");
  };

  const engagedDomains = RISK_DOMAINS.filter((dm) => isEngaged(getDomain(dm.id)));

  // Whole risk screen (one block).
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

  // One risk's rich capture (WHY + WHAT). Plain render function (NOT a nested
  // component) so editing a field doesn't remount and drop textarea focus.
  const renderRiskCapture = (r: RiskRef) => {
    const open = openRisks.has(r.key);
    const view = riskTab[r.key] || "why";
    const fCount = FORMULATION_SECTIONS.reduce((n, s) => { const v = formByRisk[r.key]?.[s.id]; return n + (v && (v.chips.length || v.text.trim() || v.na) ? 1 : 0); }, 0);
    const wCount = RMP_SECTIONS.reduce((n, s) => { const v = rmpByRisk[r.key]?.[s.id]; return n + (v && (v.chips.length || v.text.trim() || v.na) ? 1 : 0); }, 0);
    return (
      <div key={r.key} className="rounded-xl border border-rose-200 bg-white overflow-hidden">
        <button onClick={() => toggleOpenRisk(r.key)} className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-rose-50/60 hover:bg-rose-50 transition-colors text-left">
          <span className="font-bold text-rose-900 text-sm flex-1">{r.label}</span>
          <span className="text-[10px] text-rose-600">why {fCount}/9 · what {wCount}/5</span>
          {open ? <ChevronDown className="w-4 h-4 text-rose-400" /> : <ChevronRight className="w-4 h-4 text-rose-400" />}
        </button>
        {open && (
          <div className="p-3 space-y-3">
            <div className="inline-flex bg-rose-100 rounded-full p-1">
              <button onClick={() => setRiskTab((s) => ({ ...s, [r.key]: "why" }))} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1 ${view === "why" ? "bg-rose-600 text-white shadow" : "text-rose-700"}`}><Brain className="w-3.5 h-3.5" /> The WHY (formulation)</button>
              <button onClick={() => setRiskTab((s) => ({ ...s, [r.key]: "what" }))} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1 ${view === "what" ? "bg-rose-600 text-white shadow" : "text-rose-700"}`}><ListChecks className="w-3.5 h-3.5" /> The WHAT (plan)</button>
            </div>
            {view === "why" ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Why the risk exists - links history, current presentation and future risk.</p>
                {FORMULATION_SECTIONS.map((sec) => (
                  <SectionEditor key={sec.id} section={formulationSectionForRisk(sec, r.chipRisk)} state={fGet(r.key, sec.id)} onChange={(n) => fSet(r.key, sec.id, n)} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">What you will do about it - the trust&apos;s 5-heading plan. The mandatory MDT line is added automatically.</p>
                {RMP_SECTIONS.map((sec) => (
                  <SectionEditor key={sec.id} section={rmpSectionForRisk(sec, r.chipRisk)} state={rGet(r.key, sec.id)} onChange={(n) => rSet(r.key, sec.id, n)} />
                ))}
              </div>
            )}
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
                  Work through the SystmOne risk screen once - it builds the screen, the formulation and a plan for each risk to copy across.
                </p>
              </div>
            </div>
            <Link href={v2Href("/guides")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
          <PatientLink patient={patient} onChange={setPatient} guideTitle="Risk Assessment" note="Adds the patient's name to the risk screen, formulation and RMP" />
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

        {/* The risk screen - the 7 approved S1 domains */}
        <div className="bg-white rounded-2xl border-2 border-rose-300 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="font-bold text-gray-800 flex-1">Risk screen - work through each area</h2>
          </div>
          <p className="text-xs text-gray-500">
            These are the approved SystmOne domains and sub-domains. Tick the ones that apply (or &quot;no evidence&quot;),
            add the screen narrative, then fill each ticked risk&apos;s WHY (formulation) and WHAT (plan) below it. The
            same risks flow into all three outputs.
          </p>

          <div className="space-y-2">
            {RISK_DOMAINS.map((dm) => {
              const st = getDomain(dm.id);
              const open = openDomain === dm.id;
              const engaged = isEngaged(st);
              return (
                <div key={dm.id} className={`rounded-xl border overflow-hidden ${engaged ? "border-rose-300" : "border-gray-200"}`}>
                  <button onClick={() => setOpenDomain((o) => (o === dm.id ? null : dm.id))} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${engaged ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-500"}`}>{dm.number}</span>
                    <span className="font-semibold text-gray-800 text-sm flex-1">{dm.title}</span>
                    {engaged && <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">{st.noEvidence ? "none" : st.risks.length || "•"}</span>}
                    {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
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
                          <div>
                            <div className="flex items-center gap-3 flex-wrap"><span className="text-sm text-gray-600 flex-1 min-w-[180px]">{personalise(dm.indicatorsPrompt)}</span><YNToggle value={st.indicators} onChange={(v) => setDomain(dm.id, { ...st, indicators: v })} /></div>
                            {st.indicators === "yes" && CLINICAL_INDICATORS[dm.id] && (
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
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{personalise(dm.currentPrompt)}</label>
                            <textarea value={st.current} onChange={(e) => setDomain(dm.id, { ...st, current: e.target.value })} rows={2} className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{personalise(dm.historicalPrompt)}</label>
                            {dm.historicalSubPrompts && (
                              <ul className="mb-1.5 ml-1 space-y-0.5">
                                {dm.historicalSubPrompts.map((sp) => <li key={sp} className="text-xs text-gray-400">- {personalise(sp)}</li>)}
                              </ul>
                            )}
                            <textarea value={st.historical} onChange={(e) => setDomain(dm.id, { ...st, historical: e.target.value })} rows={2} className={inputCls} />
                          </div>
                        </div>
                      )}

                      {st.risks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-mono uppercase tracking-wider text-rose-500">For each risk: the why &amp; the what</p>
                          {st.risks.map((label) => renderRiskCapture({ key: `${dm.id}::${label}`, label, chipRisk: SUBTYPE_RISK[`${dm.id}::${label}`] || "" }))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Concerns + auto summary */}
          <div className="rounded-xl bg-gray-50 p-3 space-y-3">
            <div className="flex items-center gap-3 flex-wrap"><span className="text-sm font-semibold text-gray-700 flex-1 min-w-[200px]">Do you, or has anyone else, expressed concerns?</span><YNToggle value={q8} onChange={setQ8} /></div>
            {q8 === "yes" && <input autoComplete="off" value={q8note} onChange={(e) => setQ8note(e.target.value)} className={inputCls} placeholder="Briefly, what are the concerns?" />}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Overall risk formulation summary</label>
              <p className="text-xs text-gray-500 mb-1.5">Auto-built from the risks and their formulations (each risk&apos;s presenting + overall judgement, plus any clinical indicators). Add anything else below.</p>
              {overallSummary ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap mb-2">{overallSummary}</div>
              ) : (
                <p className="text-xs text-gray-400 italic mb-2">Tick risks and fill their formulations - the summary builds itself here.</p>
              )}
              <textarea value={q9} onChange={(e) => setQ9(e.target.value)} rows={2} className={inputCls} placeholder="Add anything else to the summary (optional)..." />
            </div>
          </div>
        </div>

        {/* Generate */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => { setGenerated(true); setTimeout(() => document.getElementById("risk-output")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}
            disabled={!anyIntake}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          >
            <Sparkles className="w-5 h-5" /> Generate the risk documents
          </button>
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
                {!engagedDomains.length && q8 === "" && <p className="text-sm text-gray-400 text-center py-4">Nothing entered on the risk screen yet.</p>}
                <CopyField id="screen-all" label="Whole risk screen (one block)" text={fullScreenText} done={copied.has("screen-all")} onToggle={toggleCopied} />
                {engagedDomains.length > 1 && engagedDomains.map((dm) => (
                  <CopyField key={dm.id} id={`screen-${dm.id}`} label={`${dm.number}. ${dm.short}`} text={domainScreenText(dm)} done={copied.has(`screen-${dm.id}`)} onToggle={toggleCopied} />
                ))}
              </div>
            )}

            {tab === "formulation" && (
              <div className="space-y-3">
                {allRisks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Tick at least one risk above to build a formulation.</p>}
                {allRisks.map((r) => (
                  <CopyField key={r.key} id={`form-${r.key}`} label={`Formulation - ${r.label}`} text={buildFormulation(formByRisk[r.key] || {}, `RISK FORMULATION: ${r.label.toUpperCase()}`, patientName)} done={copied.has(`form-${r.key}`)} onToggle={toggleCopied} />
                ))}
                {finalSummary && <CopyField id="form-summary" label="Overall formulation summary" text={finalSummary} done={copied.has("form-summary")} onToggle={toggleCopied} />}
              </div>
            )}

            {tab === "rmp" && (
              <div className="space-y-3">
                {allRisks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Tick at least one risk above to build a management plan.</p>}
                {allRisks.map((r) => (
                  <CopyField key={r.key} id={`rmp-${r.key}`} label={`RMP - ${r.label}`} text={buildOneRmp(r.key, rmpByRisk[r.key] || {}, r.label, patientName)} done={copied.has(`rmp-${r.key}`)} onToggle={toggleCopied} />
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
