"use client";

// Welcome - the admission co-production tool (Phase 1).
//
// A nurse works through this WITH the patient. ONE page captures everything the
// downstream forms need:
//   - a patient banner (pulls through every output),
//   - the 7 SystmOne risk-screen domains and their APPROVED sub-domains (the exact
//     ones inputted into S1). The nurse ticks the sub-domains that apply,
//   - each ticked sub-domain becomes a risk to mention: it opens its full WHY
//     (formulation, 9 sections) AND WHAT (risk management plan, 5 sections), with
//     chips tailored to that risk (each sub-domain maps to a chip bank). The
//     labels shown/copied are always the approved S1 ones,
//   - the per-domain screen narrative (indicators / current / historical),
//   - an auto-generated overall risk formulation summary.
//
// Generate -> three copy-out tabs (Risk Screen, Formulation, Management Plan),
// each block with a "pasted into SystmOne" tick.
//
// NOTHING IS STORED. All state is in memory, wiped on close. The banner is held in
// memory only (no localStorage, no network); autoComplete off on those inputs.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { useV2Href } from "@/lib/hooks/useV2";
import {
  RISK_DOMAINS, SUBTYPE_RISK, OBS_LEVELS, LEGAL_STATUSES, WELCOME_INTROS,
} from "@/lib/data/welcome/risk-screen";
import {
  RIGHTS_ITEMS, NEED_ITEMS, LAUNCH_FORMS, SAFEGUARDING_DUTY,
} from "@/lib/data/welcome/admission";
import { FORMULATION_SECTIONS, RMP_SECTIONS } from "@/lib/data/guides";
import {
  SectionEditor, buildFormulation, buildOneRmp, formulationSectionForRisk,
  rmpSectionForRisk, buildContent, naturalList, cap, ensureStop,
  type AllState, type SecState, EMPTY,
} from "@/components/guides/risk-capture";
import {
  ChevronDown, ChevronRight, Copy, Check, RotateCcw, Sparkles, Info,
  ShieldAlert, Lock, AlertTriangle, HeartHandshake, ClipboardCheck, Brain, ListChecks,
  Scale, Phone, FileText, ExternalLink,
} from "lucide-react";

type YN = "" | "yes" | "no";

interface DomainState {
  indicators: YN; safety: YN; current: string; historical: string;
  noEvidence: boolean; risks: string[]; // selected sub-domain labels
}
const emptyDomain = (): DomainState => ({ indicators: "", safety: "", current: "", historical: "", noEvidence: false, risks: [] });

interface Banner { name: string; nok: string; address: string; ward: string; section: string; obs: string; description: string }
const emptyBanner = (): Banner => ({ name: "", nok: "", address: "", ward: "", section: "", obs: "", description: "" });

interface RiskRef { key: string; label: string; chipRisk: string }

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); }
  catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
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

function CopyField({ id, label, text, done, onToggle }: { id: string; label: string; text: string; done: boolean; onToggle: (id: string, copied: boolean) => void }) {
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

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-400 focus:border-violet-400";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-semibold text-gray-500 mb-1">{label}</span>{children}</label>;
}

export default function WelcomePage() {
  const v2Href = useV2Href();

  const [banner, setBanner] = useState<Banner>(emptyBanner());
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
  const [introsOpen, setIntrosOpen] = useState(false);

  // ---- admission sections (rights/legal, contacts, safeguarding, needs) ----
  const [rights, setRights] = useState<Set<string>>(new Set());
  const [family, setFamily] = useState("");
  const [emergency, setEmergency] = useState("");
  const [sgConcern, setSgConcern] = useState<YN>("");
  const [sgWho, setSgWho] = useState("");
  const [sgDetails, setSgDetails] = useState("");
  const [sgPeople, setSgPeople] = useState("");
  const [sgWishes, setSgWishes] = useState("");
  const [needs, setNeeds] = useState<Set<string>>(new Set());
  // today - set on mount only, so SSR/client markup matches (no hydration drift)
  const [today, setToday] = useState("");
  useEffect(() => { setToday(new Date().toLocaleDateString("en-GB")); }, []);
  const toggleInSet = (set: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) =>
    set((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

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
    setBanner(emptyBanner()); setDomains({}); setFormByRisk({}); setRmpByRisk({});
    setQ8(""); setQ8note(""); setQ9(""); setGenerated(false); setCopied(new Set()); setOpenRisks(new Set());
    setTab("screen"); setOpenDomain(RISK_DOMAINS[0].id);
    setRights(new Set()); setFamily(""); setEmergency(""); setNeeds(new Set());
    setSgConcern(""); setSgWho(""); setSgDetails(""); setSgPeople(""); setSgWishes("");
  };

  const isEngaged = (d: DomainState) => d.risks.length > 0 || d.noEvidence || d.current.trim() !== "" || d.historical.trim() !== "" || d.indicators !== "" || d.safety !== "";

  // every ticked sub-domain across all domains, in S1 order
  const allRisks = useMemo<RiskRef[]>(() => {
    const out: RiskRef[] = [];
    for (const dm of RISK_DOMAINS) for (const label of getDomain(dm.id).risks) {
      const key = `${dm.id}::${label}`;
      out.push({ key, label, chipRisk: SUBTYPE_RISK[key] || "" });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains]);

  const name = banner.name.trim() || "the patient";
  // Personalise the trust-approved prompts on screen with the patient's name
  // (display only - doesn't change what's copied into the form). Falls back to
  // the approved "the person" wording when no name is entered.
  const personalise = (s: string) => {
    const nm = banner.name.trim();
    return nm ? s.replace(/the person's/g, `${nm}'s`).replace(/the person/g, nm) : s;
  };

  // ---- admission case-note builders ----
  const fill = (s: string) => s.replace(/\{name\}/g, banner.name.trim() || "the patient").replace(/\{date\}/g, today || "[date]");
  const rightsNote = RIGHTS_ITEMS.filter((i) => rights.has(i.id)).map((i) => fill(i.note)).join("\n");
  const contactsNote = [
    banner.nok.trim() && `Next of kin: ${banner.nok.trim()}`,
    family.trim() && `Family / other contacts: ${family.trim()}`,
    emergency.trim() && `Emergency numbers: ${emergency.trim()}`,
  ].filter(Boolean).join("\n");
  const sgNote = sgConcern === "yes" ? [
    "Safeguarding concern raised during admission.",
    sgWho.trim() && `Concern relates to: ${ensureStop(sgWho.trim())}`,
    sgDetails.trim() && `Details: ${ensureStop(sgDetails.trim())}`,
    sgPeople.trim() && `People involved (names / addresses / phone / ages): ${ensureStop(sgPeople.trim())}`,
    sgWishes.trim() && `The person's wishes: ${ensureStop(sgWishes.trim())}`,
    SAFEGUARDING_DUTY,
  ].filter(Boolean).join("\n") : "";
  const needsNote = needs.size ? `Referrals / follow-up identified on admission for ${banner.name.trim() || "the patient"}: ${naturalList(NEED_ITEMS.filter((n) => needs.has(n.id)).map((n) => n.label))}.` : "";
  const contextLine = useMemo(() => {
    const bits: string[] = [];
    if (banner.ward.trim()) bits.push(`admitted to ${banner.ward.trim()}`);
    if (banner.section.trim()) bits.push(`under ${banner.section.trim()}`);
    if (banner.obs.trim()) bits.push(`on ${banner.obs.trim()} observations`);
    return bits.length ? cap(bits.join(", ")) + "." : "";
  }, [banner.ward, banner.section, banner.obs]);

  // ---- AUTO overall formulation summary (each risk's presenting + judgement) ----
  const overallSummary = useMemo(() => {
    if (!allRisks.length) return "";
    const lines: string[] = [`Risks identified on screening: ${naturalList(allRisks.map((r) => r.label))}.`];
    for (const r of allRisks) {
      const present = buildContent(formByRisk[r.key]?.["presenting"]);
      const judge = buildContent(formByRisk[r.key]?.["judgement"]);
      const bits = [present, judge].filter((x) => x && x !== "Not yet established.");
      if (bits.length) lines.push(`${cap(r.label)}: ${ensureStop(bits.join(" "))}`);
    }
    return lines.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains, formByRisk]);
  const finalSummary = [overallSummary, q9.trim()].filter(Boolean).join(" ");

  // ---- Risk screen output ----
  const fullScreenText = useMemo(() => {
    const engaged = RISK_DOMAINS.filter((dm) => isEngaged(getDomain(dm.id)));
    if (!engaged.length && q8 === "") return "";
    const parts: string[] = ["========================================", "RISK SCREENING TOOL", "========================================"];
    if (contextLine) parts.push(contextLine, "----------------------------------------");
    engaged.forEach((dm, i) => {
      const st = getDomain(dm.id);
      parts.push(`${dm.number}. ${dm.title}`);
      if (st.noEvidence) parts.push(dm.noEvidence);
      else if (st.risks.length) st.risks.forEach((r) => parts.push(r));
      if (dm.safetyPrompt && st.safety) parts.push(`Concerns about safety: ${st.safety === "yes" ? "Yes" : "No"}`);
      if (st.indicators) parts.push(`Clinical indicators: ${st.indicators === "yes" ? "Yes" : "No"}`);
      if (st.current.trim()) parts.push(`Current concerns: ${ensureStop(cap(st.current.trim()))}`);
      if (st.historical.trim()) parts.push(`Historical: ${ensureStop(cap(st.historical.trim()))}`);
      if (i < engaged.length - 1) parts.push("----------------------------------------");
    });
    if (q8) parts.push("----------------------------------------", `Anyone expressed concerns: ${q8 === "yes" ? "Yes" : "No"}${q8note.trim() ? ` - ${q8note.trim()}` : ""}`);
    if (finalSummary) parts.push("----------------------------------------", `Risk formulation: ${finalSummary}`);
    return parts.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains, contextLine, q8, q8note, finalSummary]);

  const screenDomains = RISK_DOMAINS.filter((dm) => isEngaged(getDomain(dm.id)));
  const anyIntake = allRisks.length > 0 || screenDomains.length > 0 || q8 !== "" || q9.trim() !== "";

  // ---- one risk's rich capture (WHY + WHAT). Plain render function (NOT a nested
  // component) so editing a field doesn't remount and drop textarea focus. ----
  const renderRiskCapture = (r: RiskRef) => {
    const open = openRisks.has(r.key);
    const view = riskTab[r.key] || "why";
    const fCount = FORMULATION_SECTIONS.reduce((n, s) => { const v = formByRisk[r.key]?.[s.id]; return n + (v && (v.chips.length || v.text.trim() || v.na) ? 1 : 0); }, 0);
    const wCount = RMP_SECTIONS.reduce((n, s) => { const v = rmpByRisk[r.key]?.[s.id]; return n + (v && (v.chips.length || v.text.trim() || v.na) ? 1 : 0); }, 0);
    return (
      <div key={r.key} className="rounded-xl border border-violet-200 bg-white overflow-hidden">
        <button onClick={() => toggleOpenRisk(r.key)} className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-violet-50/60 hover:bg-violet-50 transition-colors text-left">
          <span className="font-bold text-violet-900 text-sm flex-1">{r.label}</span>
          <span className="text-[10px] text-violet-600">why {fCount}/9 · what {wCount}/5</span>
          {open ? <ChevronDown className="w-4 h-4 text-violet-400" /> : <ChevronRight className="w-4 h-4 text-violet-400" />}
        </button>
        {open && (
          <div className="p-3 space-y-3">
            <div className="inline-flex bg-violet-100 rounded-full p-1">
              <button onClick={() => setRiskTab((s) => ({ ...s, [r.key]: "why" }))} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1 ${view === "why" ? "bg-violet-600 text-white shadow" : "text-violet-700"}`}><Brain className="w-3.5 h-3.5" /> The WHY (formulation)</button>
              <button onClick={() => setRiskTab((s) => ({ ...s, [r.key]: "what" }))} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1 ${view === "what" ? "bg-violet-600 text-white shadow" : "text-violet-700"}`}><ListChecks className="w-3.5 h-3.5" /> The WHAT (plan)</button>
            </div>
            {view === "why" ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Why the risk exists - links history, current presentation and future risk.</p>
                {FORMULATION_SECTIONS.map((sec) => (
                  <SectionEditor key={sec.id} accent="violet" section={formulationSectionForRisk(sec, r.chipRisk)} state={fGet(r.key, sec.id)} onChange={(n) => fSet(r.key, sec.id, n)} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">What you will do about it - the trust&apos;s 5-heading plan. The MDT line is added automatically.</p>
                {RMP_SECTIONS.map((sec) => (
                  <SectionEditor key={sec.id} accent="violet" section={rmpSectionForRisk(sec, r.chipRisk)} state={rGet(r.key, sec.id)} onChange={(n) => rSet(r.key, sec.id, n)} />
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
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"><HeartHandshake className="w-8 h-8" /></div>
            <div>
              <h1 className="text-3xl font-bold">New admission - let&apos;s set this up together</h1>
              <p className="text-white/80 mt-1">One conversation with the patient. It builds the risk screen, formulation and management plans for you to copy into SystmOne.</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p><strong>In development.</strong> Draft tool for review - not for clinical use yet. Phase 1 covers the risk screen, formulation and management plan; care plan, safety plan, physical-health checks, referrals and printables come next.</p>
        </div>
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p><strong>Nothing is saved.</strong> Type freely - details stay on this screen only, are never stored or sent anywhere, and disappear the moment you close or reset. Build it here, copy it into SystmOne, done.</p>
        </div>

        {/* Intros */}
        <div className="rounded-2xl border border-violet-100 bg-white overflow-hidden">
          <button onClick={() => setIntrosOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
            <Info className="w-4 h-4 text-violet-500" />
            <span className="font-bold text-gray-800 flex-1">A few words before you start (patient, staff, carer)</span>
            {introsOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
          {introsOpen && (
            <div className="px-4 pb-4 grid md:grid-cols-3 gap-3">
              {WELCOME_INTROS.map((intro) => (
                <div key={intro.key} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <p className="text-sm font-bold text-gray-700 mb-1">{intro.emoji} {intro.who}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{intro.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient banner */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white bg-violet-600 px-2 py-0.5 rounded-full">Patient</span>
            <h2 className="font-bold text-gray-800">Set once - pulls through every output</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Name"><input autoComplete="off" value={banner.name} onChange={(e) => setBanner({ ...banner, name: e.target.value })} className={inputCls} placeholder="Patient name" /></Field>
            <Field label="Ward"><input autoComplete="off" value={banner.ward} onChange={(e) => setBanner({ ...banner, ward: e.target.value })} className={inputCls} placeholder="e.g. Byron Ward" /></Field>
            <Field label="Legal status">
              <input autoComplete="off" list="legal-statuses" value={banner.section} onChange={(e) => setBanner({ ...banner, section: e.target.value })} className={inputCls} placeholder="e.g. Section 2" />
              <datalist id="legal-statuses">{LEGAL_STATUSES.map((s) => <option key={s} value={s} />)}</datalist>
            </Field>
            <Field label="Observation level">
              <input autoComplete="off" list="obs-levels" value={banner.obs} onChange={(e) => setBanner({ ...banner, obs: e.target.value })} className={inputCls} placeholder="e.g. Level 4 - General" />
              <datalist id="obs-levels">{OBS_LEVELS.map((s) => <option key={s} value={s} />)}</datalist>
            </Field>
            <Field label="Next of kin"><input autoComplete="off" value={banner.nok} onChange={(e) => setBanner({ ...banner, nok: e.target.value })} className={inputCls} placeholder="Name + contact" /></Field>
            <Field label="Address(es)"><input autoComplete="off" value={banner.address} onChange={(e) => setBanner({ ...banner, address: e.target.value })} className={inputCls} placeholder="Home / where staying" /></Field>
          </div>
          <Field label="Description (also doubles as a missing-person description)">
            <input autoComplete="off" value={banner.description} onChange={(e) => setBanner({ ...banner, description: e.target.value })} className={inputCls} placeholder="Build, hair, clothing on admission, distinguishing features" />
          </Field>
        </div>

        {/* Risk domains */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-violet-600" />
            <h2 className="font-bold text-gray-800 flex-1">Risk screen - work through each area together</h2>
          </div>
          <p className="text-xs text-gray-500">These are the approved SystmOne domains and sub-domains. Tick the ones that apply (or &quot;no evidence&quot;), add the screen narrative, then fill each ticked risk&apos;s WHY and WHAT below it.</p>
          <div className="space-y-2">
            {RISK_DOMAINS.map((dm) => {
              const st = getDomain(dm.id);
              const open = openDomain === dm.id;
              const engaged = isEngaged(st);
              return (
                <div key={dm.id} className={`rounded-xl border overflow-hidden ${engaged ? "border-violet-300" : "border-gray-200"}`}>
                  <button onClick={() => setOpenDomain((o) => (o === dm.id ? null : dm.id))} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${engaged ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500"}`}>{dm.number}</span>
                    <span className="font-semibold text-gray-800 text-sm flex-1">{dm.title}</span>
                    {engaged && <span className="text-[11px] font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">{st.noEvidence ? "none" : st.risks.length || "•"}</span>}
                    {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {dm.subtypes.map((label) => {
                          const on = st.risks.includes(label);
                          return (
                            <button key={label} onClick={() => toggleSub(dm.id, label)} aria-pressed={on}
                              className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all text-left ${on ? "bg-violet-600 border-violet-600 text-white font-medium" : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50"}`}>
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
                          <div className="flex items-center gap-3 flex-wrap"><span className="text-sm text-gray-600 flex-1 min-w-[180px]">{personalise(dm.indicatorsPrompt)}</span><YNToggle value={st.indicators} onChange={(v) => setDomain(dm.id, { ...st, indicators: v })} /></div>
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
                          <p className="text-[11px] font-mono uppercase tracking-wider text-violet-500">For each risk: the why &amp; the what</p>
                          {st.risks.map((label) => renderRiskCapture({ key: `${dm.id}::${label}`, label, chipRisk: SUBTYPE_RISK[`${dm.id}::${label}`] || "" }))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Q8 + Q9 */}
          <div className="rounded-xl bg-gray-50 p-3 space-y-3">
            <div className="flex items-center gap-3 flex-wrap"><span className="text-sm font-semibold text-gray-700 flex-1 min-w-[200px]">Do you, or has anyone else, expressed concerns?</span><YNToggle value={q8} onChange={setQ8} /></div>
            {q8 === "yes" && <input autoComplete="off" value={q8note} onChange={(e) => setQ8note(e.target.value)} className={inputCls} placeholder="Briefly, what are the concerns?" />}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Overall risk formulation summary</label>
              <p className="text-xs text-gray-500 mb-1.5">Auto-built from the risks and their formulations (each risk&apos;s presenting + overall judgement). Add anything else below if you want.</p>
              {overallSummary ? (
                <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap mb-2">{overallSummary}</div>
              ) : (
                <p className="text-xs text-gray-400 italic mb-2">Pick risks and fill their formulations - the summary builds itself here.</p>
              )}
              <textarea value={q9} onChange={(e) => setQ9(e.target.value)} rows={2} className={inputCls} placeholder="Add anything else to the summary (optional)..." />
            </div>
          </div>
        </div>

        {/* Generate */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => { setGenerated(true); setTimeout(() => document.getElementById("welcome-output")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}
            disabled={!anyIntake}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all">
            <Sparkles className="w-5 h-5" /> Generate the paperwork
          </button>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-4 h-4" /> Clear / new patient
          </button>
        </div>

        {/* Outputs */}
        {generated && (
          <div id="welcome-output" className="rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-white p-4 space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-violet-600" /><h2 className="font-bold text-gray-800 flex-1">Copy into SystmOne</h2></div>
            <p className="text-xs text-gray-500">Tick each block as you paste it across, so you know what&apos;s done.</p>
            <div className="inline-flex bg-violet-100 rounded-full p-1 flex-wrap">
              {([{ k: "screen", label: "Risk Screen" }, { k: "formulation", label: "Formulation" }, { k: "rmp", label: "Management Plan" }] as const).map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === t.k ? "bg-violet-600 text-white shadow" : "text-violet-700 hover:bg-white/60"}`}>{t.label}</button>
              ))}
            </div>

            {tab === "screen" && (
              <div className="space-y-3">
                <CopyField id="screen-all" label="Whole risk screen (one block)" text={fullScreenText} done={copied.has("screen-all")} onToggle={toggleCopied} />
                {!screenDomains.length && <p className="text-sm text-gray-400 text-center py-4">Nothing entered on the risk screen yet.</p>}
              </div>
            )}

            {tab === "formulation" && (
              <div className="space-y-3">
                {allRisks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Tick at least one risk above to build a formulation.</p>}
                {allRisks.map((r) => (
                  <CopyField key={r.key} id={`form-${r.key}`} label={`Formulation - ${r.label}`} text={buildFormulation(formByRisk[r.key] || {}, `RISK FORMULATION: ${r.label.toUpperCase()}`)} done={copied.has(`form-${r.key}`)} onToggle={toggleCopied} />
                ))}
                {finalSummary && <CopyField id="form-summary" label="Overall formulation summary" text={finalSummary} done={copied.has("form-summary")} onToggle={toggleCopied} />}
              </div>
            )}

            {tab === "rmp" && (
              <div className="space-y-3">
                {allRisks.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Tick at least one risk above to build a management plan.</p>}
                {allRisks.map((r) => (
                  <CopyField key={r.key} id={`rmp-${r.key}`} label={`RMP - ${r.label}`} text={buildOneRmp(r.key, rmpByRisk[r.key] || {}, r.label)} done={copied.has(`rmp-${r.key}`)} onToggle={toggleCopied} />
                ))}
              </div>
            )}

            <div className="rounded-xl border border-dashed border-violet-200 p-3 text-center text-sm text-gray-500">
              Next phases add the care plan, safety plan, physical-health checks, referrals and the patient&apos;s
              {" "}<Link href={v2Href("/patient-guides")} className="font-semibold text-violet-700 underline">printable guides</Link> - all from this one session.
            </div>
          </div>
        )}

        {/* ===== Rest of the admission ===== */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-px flex-1 bg-violet-200" />
          <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">Rest of the admission</span>
          <div className="h-px flex-1 bg-violet-200" />
        </div>
        <p className="text-xs text-gray-500 text-center -mt-2">v1: open each and copy the data across. v2 will let you set each as a diary task with the patient&apos;s name.</p>

        {/* Rights & legal */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2"><Scale className="w-5 h-5 text-violet-600" /><h2 className="font-bold text-gray-800">Rights &amp; legal</h2></div>
          <p className="text-xs text-gray-500">Tick what you&apos;ve done with {name} - it builds a case note. Open a guide if you need it.</p>
          <div className="space-y-1.5">
            {RIGHTS_ITEMS.map((i) => (
              <div key={i.id} className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer flex-1">
                  <input type="checkbox" checked={rights.has(i.id)} onChange={() => toggleInSet(setRights, i.id)} className="rounded border-gray-300 text-violet-600 w-4 h-4" />
                  {i.label}
                </label>
                <Link href={v2Href(i.href)} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900 no-underline flex-shrink-0"><ExternalLink className="w-3.5 h-3.5" />Open</Link>
              </div>
            ))}
          </div>
          <CopyField id="rights-note" label="Rights & legal - case note" text={rightsNote} done={copied.has("rights-note")} onToggle={toggleCopied} />
        </div>

        {/* Contacts */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2"><Phone className="w-5 h-5 text-violet-600" /><h2 className="font-bold text-gray-800">Contacts &amp; emergency numbers</h2></div>
          <p className="text-xs text-gray-500">For the care plan and discharge plan. Next of kin comes from the patient banner above.</p>
          <Field label="Family / other contacts"><textarea value={family} onChange={(e) => setFamily(e.target.value)} rows={2} className={inputCls} placeholder="Names, relationship, phone" /></Field>
          <Field label="Emergency numbers"><textarea value={emergency} onChange={(e) => setEmergency(e.target.value)} rows={2} className={inputCls} placeholder="Crisis team, GP, key contacts" /></Field>
          <CopyField id="contacts-note" label="Contacts" text={contactsNote} done={copied.has("contacts-note")} onToggle={toggleCopied} />
        </div>

        {/* The curious nurse - safeguarding */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-violet-600" /><h2 className="font-bold text-gray-800">The curious nurse - safeguarding</h2></div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-700 flex-1 min-w-[220px]">Are you worried for your own or anyone else&apos;s safety?</span>
            <YNToggle value={sgConcern} onChange={setSgConcern} />
          </div>
          {sgConcern === "yes" && (
            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Gently gather the detail, then use the safeguarding guides to refer.</p>
              <Field label="Who / what are you worried about?"><input autoComplete="off" value={sgWho} onChange={(e) => setSgWho(e.target.value)} className={inputCls} /></Field>
              <Field label="What's happened / the concern"><textarea value={sgDetails} onChange={(e) => setSgDetails(e.target.value)} rows={2} className={inputCls} /></Field>
              <Field label="People involved - full names, addresses, phone, ages"><textarea value={sgPeople} onChange={(e) => setSgPeople(e.target.value)} rows={2} className={inputCls} /></Field>
              <Field label="What does the person want us to do?"><textarea value={sgWishes} onChange={(e) => setSgWishes(e.target.value)} rows={2} className={inputCls} /></Field>
              <div className="flex flex-wrap gap-3 text-xs">
                <Link href={v2Href("/guides/safeguarding-adults-referral")} className="inline-flex items-center gap-1 font-semibold text-violet-700 no-underline"><ExternalLink className="w-3.5 h-3.5" />Safeguarding adults</Link>
                <Link href={v2Href("/guides/safeguarding-children-referral")} className="inline-flex items-center gap-1 font-semibold text-violet-700 no-underline"><ExternalLink className="w-3.5 h-3.5" />Safeguarding children</Link>
              </div>
              <CopyField id="sg-note" label="Safeguarding - case note" text={sgNote} done={copied.has("sg-note")} onToggle={toggleCopied} />
            </div>
          )}
        </div>

        {/* Needs & referrals */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-violet-600" /><h2 className="font-bold text-gray-800">Needs &amp; referrals to follow up</h2></div>
          <p className="text-xs text-gray-500">Tick what {name} needs - it builds a follow-up list. Open a referral guide to action it.</p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {NEED_ITEMS.map((n) => (
              <div key={n.id} className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer flex-1">
                  <input type="checkbox" checked={needs.has(n.id)} onChange={() => toggleInSet(setNeeds, n.id)} className="rounded border-gray-300 text-violet-600 w-4 h-4" />
                  {n.label}
                </label>
                <Link href={v2Href(n.href)} aria-label={`Open ${n.label} guide`} className="inline-flex items-center text-violet-700 hover:text-violet-900 no-underline flex-shrink-0"><ExternalLink className="w-3.5 h-3.5" /></Link>
              </div>
            ))}
          </div>
          <CopyField id="needs-note" label="Referrals / follow-up" text={needsNote} done={copied.has("needs-note")} onToggle={toggleCopied} />
        </div>

        {/* Other forms to open */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-violet-600" /><h2 className="font-bold text-gray-800">Other forms to open</h2></div>
          <p className="text-xs text-gray-500">The rest of the admission set - open each and build it. (v2 will set these as diary tasks.)</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {LAUNCH_FORMS.map((f) => (
              <Link key={f.id} href={v2Href(f.href)} className="rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 p-3 no-underline transition-colors">
                <span className="block text-sm font-semibold text-violet-800">{f.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{f.note}</span>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">Drafting aid only - the clinical judgement and final wording stay yours. Nothing is stored. Domains and sub-domains match the SystmOne WAA Inpatient Risk Screening Tool.</p>
      </div>
    </MainLayout>
  );
}
