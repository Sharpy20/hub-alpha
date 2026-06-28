"use client";

// Welcome - the admission co-production tool (Phase 1).
//
// A nurse works through this WITH the patient: a patient banner, then the seven
// SystmOne risk-screen domains (each with sub-types, a clinical-indicators
// Yes/No, a current-concerns narrative and a historical narrative). Pressing
// "Generate" produces three copy-out blocks - Risk Screen, Formulation and a
// Risk Management Plan starter - each with a "pasted into SystmOne" tick so the
// nurse can track what has gone across.
//
// NOTHING IS STORED. Everything lives in this component's memory and is wiped
// when the tab closes. The patient banner is held in memory only (no
// localStorage, no network) so real details can be typed in to personalise the
// output, then disappear on close. autoComplete is off on those inputs.
//
// Later phases: care plan, safety plan, physical-health prompts, leave/discharge
// plans, the referrals + printables checklist, the advocate/rights step, and (in
// the full build) auto-generated named tasks.

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { useV2Href } from "@/lib/hooks/useV2";
import {
  RISK_DOMAINS, RMP_HEADINGS, RMP_MDT_LINE, OBS_LEVELS, LEGAL_STATUSES,
  WELCOME_INTROS, type RiskDomain,
} from "@/lib/data/welcome/risk-screen";
import {
  ChevronDown, ChevronRight, Copy, Check, RotateCcw, Sparkles, Info,
  ShieldAlert, ArrowRight, ClipboardCheck, Lock, AlertTriangle, HeartHandshake,
} from "lucide-react";

// ---- small text helpers ----
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const ensureStop = (s: string) => (!s ? s : /[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + ".");
function naturalList(items: string[]): string {
  const a = items.filter(Boolean);
  if (a.length === 0) return "";
  if (a.length === 1) return a[0];
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
}
const TXT_BAR = "========================================";
const TXT_DIV = "----------------------------------------";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

// ---- state shapes (all in memory only) ----
type YN = "" | "yes" | "no";

interface DomainState {
  subtypes: string[];
  noEvidence: boolean;
  safety: YN;       // domain 1 only ("concerns about safety?")
  indicators: YN;   // "clinical indicators present?"
  current: string;  // current-concerns narrative
  historical: string;
}
const emptyDomain = (): DomainState => ({
  subtypes: [], noEvidence: false, safety: "", indicators: "", current: "", historical: "",
});

interface Banner {
  name: string; nok: string; address: string;
  ward: string; section: string; obs: string; description: string;
}
const emptyBanner = (): Banner => ({
  name: "", nok: "", address: "", ward: "", section: "", obs: "", description: "",
});

interface RmpExtra { prevent: string; evaluate: string; next: string }
const emptyRmp = (): RmpExtra => ({ prevent: "", evaluate: "", next: "" });

// ---- Yes / No toggle ----
function YNToggle({ value, onChange }: { value: YN; onChange: (v: YN) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
      {(["yes", "no"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(value === v ? "" : v)}
          aria-pressed={value === v}
          className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
            value === v
              ? v === "yes" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {v === "yes" ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

// ---- a single copy-out block with a "pasted into S1" tick ----
function CopyField({
  id, label, text, done, onToggle,
}: {
  id: string; label: string; text: string; done: boolean; onToggle: (id: string, copied: boolean) => void;
}) {
  const [flash, setFlash] = useState(false);
  if (!text.trim()) return null;
  const doCopy = async () => {
    await copyText(text);
    onToggle(id, true);
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  };
  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${done ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex-1">{label}</span>
        <button
          onClick={doCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors"
        >
          {flash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {flash ? "Copied" : "Copy"}
        </button>
        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => onToggle(id, e.target.checked)}
            className="rounded border-gray-300 text-emerald-600 w-4 h-4"
          />
          Pasted in
        </label>
      </div>
      <pre className="px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-700 max-h-60 overflow-y-auto">{text}</pre>
    </div>
  );
}

// ---- one risk-domain accordion in the intake ----
function DomainCard({
  domain, state, open, onOpen, onChange,
}: {
  domain: RiskDomain;
  state: DomainState;
  open: boolean;
  onOpen: () => void;
  onChange: (next: DomainState) => void;
}) {
  const engaged =
    state.subtypes.length > 0 || state.noEvidence ||
    state.current.trim() !== "" || state.historical.trim() !== "" ||
    state.indicators !== "" || state.safety !== "";

  const toggleSub = (s: string) => {
    const has = state.subtypes.includes(s);
    onChange({
      ...state,
      noEvidence: false,
      subtypes: has ? state.subtypes.filter((x) => x !== s) : [...state.subtypes, s],
    });
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${engaged ? "border-violet-300" : "border-gray-200"}`}>
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${engaged ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500"}`}>
          {domain.number}
        </span>
        <span className="font-semibold text-gray-800 text-sm flex-1">{domain.title}</span>
        {engaged && (
          <span className="text-[11px] font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
            {state.noEvidence ? "none" : state.subtypes.length || "•"}
          </span>
        )}
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* sub-types */}
          <div className="flex flex-wrap gap-1.5">
            {domain.subtypes.map((s) => {
              const on = state.subtypes.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSub(s)}
                  aria-pressed={on}
                  className={`px-2.5 py-1.5 rounded-lg text-sm border transition-all text-left ${
                    on
                      ? "bg-violet-600 border-violet-600 text-white font-medium"
                      : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* no evidence */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={state.noEvidence}
              onChange={(e) => onChange({ ...state, noEvidence: e.target.checked, subtypes: e.target.checked ? [] : state.subtypes })}
              className="rounded border-gray-300 text-emerald-600 w-4 h-4"
            />
            {domain.noEvidence}
          </label>

          {/* follow-ups - shown once the domain is engaged */}
          {engaged && (
            <div className="space-y-3 rounded-lg bg-gray-50 p-3">
              {domain.hasSafetyConcern && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600 flex-1 min-w-[180px]">Concerns about the person&apos;s safety?</span>
                  <YNToggle value={state.safety} onChange={(v) => onChange({ ...state, safety: v })} />
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-600 flex-1 min-w-[180px]">Clinical indicators present?</span>
                <YNToggle value={state.indicators} onChange={(v) => onChange({ ...state, indicators: v })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Current concerns (in their words where you can)</label>
                <textarea
                  value={state.current}
                  onChange={(e) => onChange({ ...state, current: e.target.value })}
                  rows={2}
                  placeholder="What's happening now, based on this assessment..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 resize-y"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Historical risk</label>
                <textarea
                  value={state.historical}
                  onChange={(e) => onChange({ ...state, historical: e.target.value })}
                  rows={2}
                  placeholder="Relevant history - previous incidents, dates if known..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 resize-y"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WelcomePage() {
  const v2Href = useV2Href();

  const [banner, setBanner] = useState<Banner>(emptyBanner());
  const [domains, setDomains] = useState<Record<string, DomainState>>({});
  const [openDomain, setOpenDomain] = useState<string | null>(RISK_DOMAINS[0].id);
  const [q8, setQ8] = useState<YN>("");
  const [q8note, setQ8note] = useState("");
  const [q9, setQ9] = useState("");
  const [rmpExtra, setRmpExtra] = useState<Record<string, RmpExtra>>({});
  const [generated, setGenerated] = useState(false);
  const [tab, setTab] = useState<"screen" | "formulation" | "rmp">("screen");
  const [copied, setCopied] = useState<Set<string>>(new Set());
  const [introsOpen, setIntrosOpen] = useState(false);

  const getDomain = (id: string): DomainState => domains[id] || emptyDomain();
  const setDomain = (id: string, next: DomainState) => setDomains((s) => ({ ...s, [id]: next }));
  const getRmp = (id: string): RmpExtra => rmpExtra[id] || emptyRmp();
  const setRmp = (id: string, next: RmpExtra) => setRmpExtra((s) => ({ ...s, [id]: next }));

  const toggleCopied = (id: string, on: boolean) =>
    setCopied((s) => {
      const next = new Set(s);
      if (on) next.add(id); else next.delete(id);
      return next;
    });

  const reset = () => {
    setBanner(emptyBanner());
    setDomains({});
    setQ8(""); setQ8note(""); setQ9("");
    setRmpExtra({});
    setGenerated(false);
    setCopied(new Set());
    setTab("screen");
    setOpenDomain(RISK_DOMAINS[0].id);
  };

  const isEngaged = (d: DomainState) =>
    d.subtypes.length > 0 || d.noEvidence || d.current.trim() !== "" || d.historical.trim() !== "" || d.indicators !== "" || d.safety !== "";
  const hasRisk = (d: DomainState) => d.subtypes.length > 0; // an actual identified risk (not "no evidence")

  const name = banner.name.trim() || "the patient";
  const contextLine = useMemo(() => {
    const bits: string[] = [];
    if (banner.ward.trim()) bits.push(`admitted to ${banner.ward.trim()}`);
    if (banner.section.trim()) bits.push(`under ${banner.section.trim()}`);
    if (banner.obs.trim()) bits.push(`on ${banner.obs.trim()} observations`);
    return bits.length ? cap(bits.join(", ")) + "." : "";
  }, [banner.ward, banner.section, banner.obs]);

  // ---- Risk screen output (per engaged domain) ----
  const screenBlocks = useMemo(() => {
    return RISK_DOMAINS.filter((dm) => isEngaged(getDomain(dm.id))).map((dm) => {
      const st = getDomain(dm.id);
      const head: string[] = [`${dm.number}. ${dm.title}`];
      if (st.noEvidence) head.push(dm.noEvidence);
      else if (st.subtypes.length) head.push(`Selected: ${st.subtypes.join("; ")}`);
      if (dm.hasSafetyConcern && st.safety) head.push(`Concerns about safety: ${st.safety === "yes" ? "Yes" : "No"}`);
      if (st.indicators) head.push(`Clinical indicators: ${st.indicators === "yes" ? "Yes" : "No"}`);
      return {
        domain: dm,
        head: head.join("\n"),
        current: st.current.trim() ? cap(st.current.trim()) : "",
        historical: st.historical.trim() ? cap(st.historical.trim()) : "",
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains]);

  const fullScreenText = useMemo(() => {
    if (!screenBlocks.length) return "";
    const parts: string[] = [TXT_BAR, "RISK SCREENING TOOL", TXT_BAR];
    if (contextLine) parts.push(contextLine, TXT_DIV);
    screenBlocks.forEach((b, i) => {
      parts.push(b.head);
      if (b.current) parts.push(`Current concerns: ${b.current}`);
      if (b.historical) parts.push(`Historical: ${b.historical}`);
      if (i < screenBlocks.length - 1) parts.push(TXT_DIV);
    });
    if (q8) {
      parts.push(TXT_DIV, `Anyone expressed concerns: ${q8 === "yes" ? "Yes" : "No"}${q8note.trim() ? ` - ${q8note.trim()}` : ""}`);
    }
    return parts.join("\n");
  }, [screenBlocks, contextLine, q8, q8note]);

  // ---- Formulation output ----
  const formulationText = useMemo(() => {
    const identified = RISK_DOMAINS.filter((dm) => hasRisk(getDomain(dm.id)));
    const noneFound = RISK_DOMAINS.filter((dm) => getDomain(dm.id).noEvidence);
    if (!identified.length && !noneFound.length && !q9.trim()) return "";
    const parts: string[] = [TXT_BAR, "RISK FORMULATION", TXT_BAR];
    const headerBits = [name, banner.ward.trim(), banner.section.trim()].filter(Boolean);
    if (headerBits.length > 1) parts.push(headerBits.join(", "), TXT_DIV);

    if (identified.length) {
      parts.push(`Risks identified on screening: ${naturalList(identified.map((d) => d.short.toLowerCase()))}.`);
    }
    identified.forEach((dm) => {
      const st = getDomain(dm.id);
      if (st.current.trim()) parts.push(`${dm.short}: ${ensureStop(cap(st.current.trim()))}`);
    });
    const hist = identified
      .map((dm) => ({ dm, h: getDomain(dm.id).historical.trim() }))
      .filter((x) => x.h);
    if (hist.length) {
      parts.push(TXT_DIV, "History:");
      hist.forEach((x) => parts.push(`${x.dm.short}: ${ensureStop(cap(x.h))}`));
    }
    if (noneFound.length) {
      parts.push(TXT_DIV, `No concerns reported during assessment for: ${naturalList(noneFound.map((d) => d.short.toLowerCase()))}.`);
    }
    if (q9.trim()) parts.push(TXT_DIV, "Formulation:", ensureStop(cap(q9.trim())));
    return parts.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains, q9, name, banner.ward, banner.section]);

  // ---- RMP output (one per identified domain) ----
  const identifiedDomains = RISK_DOMAINS.filter((dm) => hasRisk(getDomain(dm.id)));

  const buildRmp = (dm: RiskDomain): string => {
    const st = getDomain(dm.id);
    const ex = getRmp(dm.id);
    const body: Record<string, string> = {
      what: `${dm.title} (${st.subtypes.join("; ")})`,
      present: st.current.trim() ? ensureStop(cap(st.current.trim())) : "Not yet established.",
      prevent: ex.prevent.trim() ? ensureStop(cap(ex.prevent.trim())) : "Not yet established.",
      evaluate: ex.evaluate.trim() ? ensureStop(cap(ex.evaluate.trim())) : "Not yet established.",
      next: ex.next.trim() ? `${ensureStop(cap(ex.next.trim()))} ${RMP_MDT_LINE}` : RMP_MDT_LINE,
    };
    const out: string[] = [TXT_BAR, `RISK MANAGEMENT PLAN: ${dm.short.toUpperCase()}`, TXT_BAR];
    RMP_HEADINGS.forEach((h, i) => {
      out.push(h.heading);
      out.push(body[h.id]);
      if (i < RMP_HEADINGS.length - 1) out.push(TXT_DIV);
    });
    return out.join("\n");
  };

  const anyIntake =
    RISK_DOMAINS.some((dm) => isEngaged(getDomain(dm.id))) || q8 !== "" || q9.trim() !== "";

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">New admission - let&apos;s set this up together</h1>
              <p className="text-white/80 mt-1">
                Work through it with the patient, then copy each part into SystmOne.
              </p>
            </div>
          </div>
        </div>

        {/* In development */}
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p><strong>In development.</strong> Draft tool for review - not for clinical use yet. Phase 1 covers the risk screen, formulation and a management-plan starter; care plan, safety plan, physical-health checks, referrals and printables come next.</p>
        </div>

        {/* Nothing saved */}
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p><strong>Nothing is saved.</strong> Type freely - details stay on this screen only, are never stored or sent anywhere, and disappear the moment you close or reset. Build it here, copy it into SystmOne, done.</p>
        </div>

        {/* Intro messages */}
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

        {/* Risk domains intake */}
        <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-violet-600" />
            <h2 className="font-bold text-gray-800 flex-1">Risk screen - work through each area together</h2>
          </div>
          <p className="text-xs text-gray-500">
            Open each area, tick what applies (or &quot;no evidence&quot;), then note current and historical detail. Areas you touch turn purple.
          </p>
          <div className="space-y-2">
            {RISK_DOMAINS.map((dm) => (
              <DomainCard
                key={dm.id}
                domain={dm}
                state={getDomain(dm.id)}
                open={openDomain === dm.id}
                onOpen={() => setOpenDomain((o) => (o === dm.id ? null : dm.id))}
                onChange={(next) => setDomain(dm.id, next)}
              />
            ))}
          </div>

          {/* Q8 + Q9 */}
          <div className="rounded-xl bg-gray-50 p-3 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 flex-1 min-w-[200px]">Do you, or has anyone else, expressed concerns?</span>
              <YNToggle value={q8} onChange={setQ8} />
            </div>
            {q8 === "yes" && (
              <input autoComplete="off" value={q8note} onChange={(e) => setQ8note(e.target.value)} className={inputCls} placeholder="Briefly, what are the concerns?" />
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Risk formulation (the overall picture, in a few lines)</label>
              <textarea value={q9} onChange={(e) => setQ9(e.target.value)} rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 resize-y" placeholder="Pull it together: what's the risk picture now, what's driving it, what helps..." />
            </div>
          </div>
        </div>

        {/* Generate */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => { setGenerated(true); setTimeout(() => { document.getElementById("welcome-output")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50); }}
            disabled={!anyIntake}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          >
            <Sparkles className="w-5 h-5" /> Generate the paperwork
          </button>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-4 h-4" /> Clear / new patient
          </button>
        </div>

        {/* Outputs */}
        {generated && (
          <div id="welcome-output" className="rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-white p-4 space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-violet-600" />
              <h2 className="font-bold text-gray-800 flex-1">Copy into SystmOne</h2>
            </div>
            <p className="text-xs text-gray-500">Tick each block as you paste it across, so you know what&apos;s done.</p>

            {/* tabs */}
            <div className="inline-flex bg-violet-100 rounded-full p-1 flex-wrap">
              {([
                { k: "screen", label: "Risk Screen" },
                { k: "formulation", label: "Formulation" },
                { k: "rmp", label: "Management Plan" },
              ] as const).map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === t.k ? "bg-violet-600 text-white shadow" : "text-violet-700 hover:bg-white/60"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Risk screen tab */}
            {tab === "screen" && (
              <div className="space-y-3">
                <CopyField id="screen-all" label="Whole risk screen (one block)" text={fullScreenText} done={copied.has("screen-all")} onToggle={toggleCopied} />
                {screenBlocks.length > 0 && <p className="text-xs text-gray-400">…or copy field by field as you move down the SystmOne screen:</p>}
                {screenBlocks.map((b) => (
                  <div key={b.domain.id} className="rounded-xl border border-violet-100 bg-white p-3 space-y-2">
                    <p className="text-sm font-bold text-violet-800">{b.domain.number}. {b.domain.title}</p>
                    <CopyField id={`screen-${b.domain.id}-head`} label="Selections + indicators" text={b.head} done={copied.has(`screen-${b.domain.id}-head`)} onToggle={toggleCopied} />
                    <CopyField id={`screen-${b.domain.id}-cur`} label="Current concerns" text={b.current} done={copied.has(`screen-${b.domain.id}-cur`)} onToggle={toggleCopied} />
                    <CopyField id={`screen-${b.domain.id}-his`} label="Historical" text={b.historical} done={copied.has(`screen-${b.domain.id}-his`)} onToggle={toggleCopied} />
                  </div>
                ))}
                {!screenBlocks.length && <p className="text-sm text-gray-400 text-center py-4">Nothing entered on the risk screen yet.</p>}
              </div>
            )}

            {/* Formulation tab */}
            {tab === "formulation" && (
              <div className="space-y-3">
                <CopyField id="form-all" label="Risk formulation" text={formulationText} done={copied.has("form-all")} onToggle={toggleCopied} />
                {!formulationText && <p className="text-sm text-gray-400 text-center py-4">Identify some risks above to build a formulation.</p>}
              </div>
            )}

            {/* RMP tab */}
            {tab === "rmp" && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>A separate plan per identified risk. Presentation is carried over from the screen; add how you&apos;ll prevent/reduce it, how you&apos;ll know it&apos;s working, and the next steps if not. For deeper, risk-specific prompts use the <Link href={v2Href("/guides/risk-assessment")} className="font-semibold underline">full Risk Assessment builder</Link>.</p>
                </div>
                {!identifiedDomains.length && <p className="text-sm text-gray-400 text-center py-4">Tick at least one risk sub-type above to build a management plan.</p>}
                {identifiedDomains.map((dm) => {
                  const ex = getRmp(dm.id);
                  return (
                    <div key={dm.id} className="rounded-xl border border-violet-100 bg-white p-3 space-y-2">
                      <p className="text-sm font-bold text-violet-800">{dm.short}</p>
                      <div className="grid sm:grid-cols-3 gap-2">
                        <textarea value={ex.prevent} onChange={(e) => setRmp(dm.id, { ...ex, prevent: e.target.value })} rows={2} placeholder="How to prevent / reduce" className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 resize-y" />
                        <textarea value={ex.evaluate} onChange={(e) => setRmp(dm.id, { ...ex, evaluate: e.target.value })} rows={2} placeholder="Signs it's reducing" className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 resize-y" />
                        <textarea value={ex.next} onChange={(e) => setRmp(dm.id, { ...ex, next: e.target.value })} rows={2} placeholder="Next steps if unsuccessful" className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-violet-400 focus:border-violet-400 resize-y" />
                      </div>
                      <CopyField id={`rmp-${dm.id}`} label={`RMP - ${dm.short}`} text={buildRmp(dm)} done={copied.has(`rmp-${dm.id}`)} onToggle={toggleCopied} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* what's next */}
            <div className="rounded-xl border border-dashed border-violet-200 p-3 text-center text-sm text-gray-500">
              Next phases will add the care plan, safety plan, physical-health checks, referrals and the patient&apos;s
              {" "}<Link href={v2Href("/patient-guides")} className="font-semibold text-violet-700 underline">printable guides</Link> - all from this one session.
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Drafting aid only - the clinical judgement and final wording stay yours. Nothing is stored. Aligned to the DHCFT WAA Inpatient Risk Screening Tool.
        </p>
      </div>
    </MainLayout>
  );
}

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-400 focus:border-violet-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
