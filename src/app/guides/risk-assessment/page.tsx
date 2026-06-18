"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import {
  FORMULATION_SECTIONS, RMP_SECTIONS, MANDATORY_MDT_LINE,
  RISK_TEACHING, RISK_EXAMPLES, S1_STEPS,
  type RiskSection,
} from "@/lib/data/guides";
import { useV2Href } from "@/lib/hooks/useV2";
import {
  ArrowLeft, Copy, Check, RotateCcw, ChevronDown, ChevronRight, Info,
  Lightbulb, AlertTriangle, GraduationCap, ListChecks, Sparkles,
} from "lucide-react";

interface SecState { chips: string[]; text: string; na: boolean }
type AllState = Record<string, SecState>;

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
  const count = state.chips.length + (state.text.trim() ? 1 : 0) + (state.na ? 1 : 0);
  const chipsOnlyNoDetail = state.chips.length > 0 && !state.text.trim() && !state.na;

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
        <div className={`rounded-lg bg-slate-800 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap min-h-[60px] max-h-72 overflow-y-auto ${text ? "text-slate-100" : "text-slate-500 italic"}`}>
          {text || "Fill the sections below to build this."}
        </div>
      </div>
    </div>
  );
}

export default function RiskAssessmentPage() {
  const v2Href = useV2Href();
  const [state, setState] = useState<AllState>({});

  const get = (id: string): SecState => state[id] || { chips: [], text: "", na: false };
  const set = (id: string, next: SecState) => setState((s) => ({ ...s, [id]: next }));
  const reset = () => setState({});

  // Formulation output (best-practice framework).
  const formulationText = useMemo(() => {
    const lines: string[] = [];
    for (const sec of FORMULATION_SECTIONS) {
      const content = buildContent(state[sec.id]);
      if (content) lines.push(`${sec.heading}: ${content}`);
    }
    return lines.length ? `RISK FORMULATION\n\n${lines.join("\n")}` : "";
  }, [state]);

  // RMP output - the exact trust template, all 5 headings, mandatory line locked on.
  const rmpText = useMemo(() => {
    const anyContent = RMP_SECTIONS.some((s) => buildContent(state[s.id]));
    if (!anyContent) return "";
    const lines = RMP_SECTIONS.map((sec) => {
      let content = buildContent(state[sec.id]);
      if (sec.id === "next") {
        content = content ? `${ensureStop(content)} ${MANDATORY_MDT_LINE}` : MANDATORY_MDT_LINE;
      }
      return `${sec.heading} - ${content}`;
    });
    return `RISK MANAGEMENT PLAN\n\n${lines.join("\n")}`;
  }, [state]);

  return (
    <MainLayout>
      <div className="space-y-5">
        <div>
          <Breadcrumb items={[{ label: "Guides", href: v2Href("/guides") }, { label: "Risk Assessment" }]} />
        </div>

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

        {/* Stage 1: Formulation */}
        <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="font-bold text-gray-800">Risk Formulation - the WHY</h2>
          </div>
          <p className="text-xs text-gray-500">
            Explains why the risk exists, linking history, current presentation and future risk. (Best-practice
            framework - not a specific trust form.)
          </p>
          <OutputBox text={formulationText} label="Your risk formulation" />
          <div className="space-y-2">
            {FORMULATION_SECTIONS.map((sec) => (
              <SectionEditor key={sec.id} section={sec} state={get(sec.id)} onChange={(n) => set(sec.id, n)} />
            ))}
          </div>
        </div>

        {/* Stage 2: RMP */}
        <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="font-bold text-gray-800">Risk Management Plan - the WHAT</h2>
          </div>
          <p className="text-xs text-gray-500">
            The exact trust template. The mandatory MDT line is added to the last section automatically.
          </p>
          <OutputBox text={rmpText} label="Your risk management plan" />
          <div className="space-y-2">
            {RMP_SECTIONS.map((sec) => (
              <SectionEditor key={sec.id} section={sec} state={get(sec.id)} onChange={(n) => set(sec.id, n)} />
            ))}
          </div>
        </div>

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
