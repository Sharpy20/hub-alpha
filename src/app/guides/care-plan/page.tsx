"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import { FocusLinks } from "@/components/guides/FocusLinks";
import { PatientLink } from "@/components/guides/PatientLink";
import { Patient } from "@/lib/types";
import {
  CAREPLAN_SECTIONS, CAREPLAN_PRINCIPLES, CAREPLAN_TEACHING, CAREPLAN_EXAMPLE,
  type CareSection,
} from "@/lib/data/guides";
import { useV2Href } from "@/lib/hooks/useV2";
import {
  ArrowLeft, Copy, Check, RotateCcw, ChevronDown, ChevronRight, Info,
  Lightbulb, GraduationCap, Sparkles, Quote, ShieldAlert,
} from "lucide-react";

interface CareState { quote: string; text: string; chips: string[]; na: boolean }
type AllState = Record<string, CareState>;
const EMPTY: CareState = { quote: "", text: "", chips: [], na: false };

function naturalList(items: string[]): string {
  const a = items.filter(Boolean);
  if (a.length === 0) return "";
  if (a.length === 1) return a[0];
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
}
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const ensureStop = (s: string) => (!s ? s : /[.!?"]$/.test(s.trim()) ? s.trim() : s.trim() + ".");

function buildSection(st: CareState | undefined): string {
  if (!st) return "";
  if (st.na) return "Unable to establish on admission.";
  const parts: string[] = [];
  if (st.quote.trim()) parts.push(`Patient says: "${st.quote.trim().replace(/"/g, "")}"`);
  if (st.chips.length) parts.push(cap(naturalList(st.chips)));
  if (st.text.trim()) parts.push(cap(st.text.trim()));
  if (!parts.length) return "";
  return parts.map(ensureStop).join(" ");
}

function SectionEditor({
  section, state, onChange, link,
}: {
  section: CareSection;
  state: CareState;
  onChange: (next: CareState) => void;
  link: (h: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const toggleChip = (w: string) => {
    const has = state.chips.includes(w);
    onChange({ ...state, na: false, chips: has ? state.chips.filter((c) => c !== w) : [...state.chips, w] });
  };
  const count =
    state.chips.length + (state.text.trim() ? 1 : 0) + (state.quote.trim() ? 1 : 0) + (state.na ? 1 : 0);

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-800 text-sm flex-1">{section.heading}</span>
        {count > 0 && (
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
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

          {section.gap && (
            <p className="flex items-start gap-1.5 text-xs text-sky-700/80">
              <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              Ask the patient: {section.gap}
            </p>
          )}

          {section.patientVoice && (
            <div>
              <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-purple-500 mb-1">
                <Quote className="w-3 h-3" /> Patient's own words
              </p>
              <textarea
                value={state.quote}
                onChange={(e) => onChange({ ...state, na: false, quote: e.target.value })}
                placeholder="Write word for word what the patient says..."
                rows={2}
                className="w-full text-sm border border-purple-200 bg-purple-50/40 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-y"
              />
            </div>
          )}

          {section.linkRmp && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-xs text-rose-800">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Reference the patient's RMP here - do not duplicate it.{" "}
                <Link href={link("/guides/risk-assessment")} className="font-semibold underline">
                  Open the Risk / RMP builder
                </Link>
                .
              </span>
            </div>
          )}

          {section.groups?.map((g, gi) => (
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
                          ? "bg-sky-600 border-sky-600 text-white font-medium"
                          : "bg-white border-gray-200 text-gray-600 hover:border-sky-300 hover:bg-sky-50"
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <textarea
            value={state.text}
            onChange={(e) => onChange({ ...state, na: false, text: e.target.value })}
            placeholder={section.placeholder || "Add detail..."}
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-y"
          />

          <div className="flex justify-end">
            <button
              onClick={() => onChange({ quote: "", text: "", chips: [], na: !state.na })}
              className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                state.na ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Unable to establish on admission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Collapse({ icon: Icon, title, children }: { icon: typeof Info; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
        <Icon className="w-4 h-4 text-sky-500" />
        <span className="font-bold text-gray-800 flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function CarePlanPage() {
  const v2Href = useV2Href();
  const [state, setState] = useState<AllState>({});
  const [patient, setPatient] = useState<Patient | null>(null);
  const get = (id: string): CareState => state[id] || EMPTY;
  const set = (id: string, next: CareState) => setState((s) => ({ ...s, [id]: next }));
  const reset = () => setState({});

  const output = useMemo(() => {
    const lines: string[] = [];
    for (const sec of CAREPLAN_SECTIONS) {
      const content = buildSection(state[sec.id]);
      if (content) lines.push(`${sec.heading.toUpperCase()}\n${content}`);
    }
    if (!lines.length) return "";
    const header = patient ? `MY CARE PLAN - ${patient.name}` : "MY CARE PLAN";
    return `${header}\n\n${lines.join("\n\n")}`;
  }, [state, patient]);

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = output; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        <div>
          <Breadcrumb items={[{ label: "Guides", href: v2Href("/guides") }, { label: "Care Plan" }]} />
        </div>
        <FocusLinks links={[
          { label: "Creating a Care Plan (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/7498/2454" },
          { label: "Review / Update a Care Plan", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/5322/2454" },
          { label: "Viewing MH Care Plans", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/12869/2454" },
        ]} />

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">📝</div>
              <div>
                <h1 className="text-3xl font-bold">My Care Plan</h1>
                <p className="text-white/80 mt-1">
                  Build a personalised, patient-voice care plan - then copy it into SystemOne.
                </p>
              </div>
            </div>
            <Link href={v2Href("/guides")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
          <PatientLink patient={patient} onChange={setPatient} guideTitle="Care Plan" note="Adds the patient's name to the care plan" />
        </div>

        {/* Principles + reset */}
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[260px] bg-sky-50 border border-sky-100 rounded-xl p-3">
            <ul className="space-y-1">
              {CAREPLAN_PRINCIPLES.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-sky-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Teaching */}
        <div className="space-y-2">
          <Collapse icon={GraduationCap} title="Learn: writing a good care plan">
            <div className="space-y-4">
              {[CAREPLAN_TEACHING.whatItIs, CAREPLAN_TEACHING.commonMistakes, CAREPLAN_TEACHING.whatGoodLooks, CAREPLAN_TEACHING.gapMethod].map((blk) => (
                <div key={blk.title}>
                  <h4 className="font-bold text-gray-700 text-sm mb-1">{blk.title}</h4>
                  <ul className="space-y-1">
                    {blk.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-300 mt-1.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Collapse>
        </div>

        {/* Output */}
        <div className="rounded-2xl bg-slate-900 text-slate-100 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Your care plan</span>
            <button
              onClick={copy}
              disabled={!output}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="px-4 pb-4">
            <div tabIndex={0} role="region" aria-label="Assembled output preview" className={`rounded-lg bg-slate-800 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap min-h-[64px] max-h-80 overflow-y-auto ${output ? "text-slate-100" : "text-slate-500 italic"}`}>
              {output || "Fill the sections below to build the care plan."}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {CAREPLAN_SECTIONS.map((sec) => (
            <SectionEditor key={sec.id} section={sec} state={get(sec.id)} onChange={(n) => set(sec.id, n)} link={v2Href} />
          ))}
        </div>

        {/* Example */}
        <Collapse icon={Lightbulb} title="Example: weak vs strong">
          <p className="text-xs text-amber-600 italic mb-3">Draft example - to be verified against trust guidance.</p>
          <p className="font-bold text-gray-800 text-sm mb-2">{CAREPLAN_EXAMPLE.topic}</p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
              <p className="text-xs font-bold text-red-700 mb-1.5">Weak (generic, vague)</p>
              <p className="text-xs text-gray-600">{CAREPLAN_EXAMPLE.weak}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-3">
              <p className="text-xs font-bold text-green-700 mb-1.5">Strong (patient-voice, specific, who/when/why)</p>
              <p className="text-xs text-gray-600">{CAREPLAN_EXAMPLE.strong}</p>
            </div>
          </div>
        </Collapse>

        <p className="text-xs text-gray-400 text-center">
          Drafting aid only. Grounded in the DHCFT My Care Plan guidance. Always review wording before it goes in the record.
        </p>
      </div>
    </MainLayout>
  );
}
