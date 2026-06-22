"use client";

// Generic interactive "prompt builder" used by the clinical documentation tools
// (seclusion support plan, debrief, safety plan, restraint monitoring, falls, etc).
//
// Pass it a BuilderConfig and it renders the full page: principles callout,
// teaching, a live copyable output panel, and a list of chip + free-text + quote
// section editors. Mirrors the proven /guides/care-plan pattern so all tools
// behave identically. No PII, no backend - everything is in-memory + clipboard.

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import { useV2Href } from "@/lib/hooks/useV2";
import type { BuilderConfig, BuilderSection } from "@/lib/data/guides/builder";
import {
  ArrowLeft, Copy, Check, RotateCcw, ChevronDown, ChevronRight, Info,
  Lightbulb, GraduationCap, Sparkles, Quote, AlertTriangle,
} from "lucide-react";

interface SecState { quote: string; text: string; chips: string[]; na: boolean }
type AllState = Record<string, SecState>;
const EMPTY: SecState = { quote: "", text: "", chips: [], na: false };

function naturalList(items: string[]): string {
  const a = items.filter(Boolean);
  if (a.length === 0) return "";
  if (a.length === 1) return a[0];
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
}
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const ensureStop = (s: string) => (!s ? s : /[.!?"]$/.test(s.trim()) ? s.trim() : s.trim() + ".");

function buildSection(section: BuilderSection, st: SecState | undefined): string {
  if (!st) return "";
  if (st.na) return section.naOutput || "Not yet established.";
  const parts: string[] = [];
  if (st.quote.trim()) parts.push(`Patient says: "${st.quote.trim().replace(/"/g, "")}"`);
  if (st.chips.length) parts.push(cap(naturalList(st.chips)));
  if (st.text.trim()) parts.push(cap(st.text.trim()));
  if (!parts.length) return "";
  return parts.map(ensureStop).join(" ");
}

function SectionEditor({
  section, state, onChange,
}: {
  section: BuilderSection;
  state: SecState;
  onChange: (next: SecState) => void;
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
              {section.gapLabel || "Prompt yourself:"} {section.gap}
            </p>
          )}

          {section.patientVoice && (
            <div>
              <p className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-purple-500 mb-1">
                <Quote className="w-3 h-3" /> Patient&apos;s own words
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
            placeholder={section.placeholder || "Add patient-specific detail..."}
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
              {section.naLabel || "Not yet established"}
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

export function PromptBuilder({ config }: { config: BuilderConfig }) {
  const v2Href = useV2Href();
  const [state, setState] = useState<AllState>({});
  const get = (id: string): SecState => state[id] || EMPTY;
  const set = (id: string, next: SecState) => setState((s) => ({ ...s, [id]: next }));
  const reset = () => setState({});

  const output = useMemo(() => {
    const lines: string[] = [];
    for (const sec of config.sections) {
      const content = buildSection(sec, state[sec.id]);
      if (content) lines.push(`${sec.heading.toUpperCase()}\n${content}`);
    }
    if (!lines.length) return "";
    let head = config.docHeading;
    if (config.dateLine) {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      head += `\nDate: ${dd}/${mm}/${d.getFullYear()}`;
    }
    return `${head}\n\n${lines.join("\n\n")}`;
  }, [state, config]);

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
          <Breadcrumb items={[{ label: "Guides", href: v2Href("/guides") }, { label: config.breadcrumb }]} />
        </div>

        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">{config.icon}</div>
              <div>
                <h1 className="text-3xl font-bold">{config.title}</h1>
                <p className="text-white/80 mt-1">{config.subtitle}</p>
              </div>
            </div>
            <Link href={v2Href("/guides")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
        </div>

        {/* Notice banner */}
        {config.notice && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{config.notice}</span>
          </div>
        )}

        {/* Principles + reset */}
        {(config.principles?.length || true) && (
          <div className="flex flex-wrap items-start gap-3">
            {config.principles?.length ? (
              <div className="flex-1 min-w-[260px] bg-sky-50 border border-sky-100 rounded-xl p-3">
                <ul className="space-y-1">
                  {config.principles.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-sky-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : <div className="flex-1" />}
            <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        )}

        {/* Teaching */}
        {config.teaching?.length ? (
          <Collapse icon={GraduationCap} title={config.teachingTitle || "Learn: writing this well"}>
            <div className="space-y-4">
              {config.teaching.map((blk) => (
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
        ) : null}

        {/* Output */}
        <div className="rounded-2xl bg-slate-900 text-slate-100 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">{config.outputLabel}</span>
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
            <div className={`rounded-lg bg-slate-800 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap min-h-[64px] max-h-80 overflow-y-auto ${output ? "text-slate-100" : "text-slate-500 italic"}`}>
              {output || config.emptyHint}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {config.sections.map((sec) => (
            <SectionEditor key={sec.id} section={sec} state={get(sec.id)} onChange={(n) => set(sec.id, n)} />
          ))}
        </div>

        {/* Example */}
        {config.example && (
          <Collapse icon={Lightbulb} title="Example: weak vs strong">
            <p className="text-xs text-amber-600 italic mb-3">Draft example - to be verified against trust guidance.</p>
            <p className="font-bold text-gray-800 text-sm mb-2">{config.example.topic}</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                <p className="text-xs font-bold text-red-700 mb-1.5">Weak (generic, vague)</p>
                <p className="text-xs text-gray-600">{config.example.weak}</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-3">
                <p className="text-xs font-bold text-green-700 mb-1.5">Strong (specific, observable, individual)</p>
                <p className="text-xs text-gray-600">{config.example.strong}</p>
              </div>
            </div>
          </Collapse>
        )}

        <p className="text-xs text-gray-400 text-center">
          {config.footer || "Drafting aid only. Always review wording before it goes in the record."}
        </p>
      </div>
    </MainLayout>
  );
}
