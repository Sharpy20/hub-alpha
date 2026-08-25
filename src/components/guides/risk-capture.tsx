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
  ChevronDown, ChevronRight, Info, Sparkles, AlertTriangle, Plus, X, UserPen, Pencil, Check,
} from "lucide-react";

// ---- state ----
// `id` is set only on examples added through the risk tool's quick capture, so
// one event can be traced across every domain it was filed under and pulled back
// out again. Examples typed straight into a domain have no id.
export interface DatedExample {
  day: string; month: string; year: string; text: string; id?: string;
  /** Set on events captured against a domain: true = "before", false = "now". */
  historic?: boolean;
}

// ---- when did it happen -----------------------------------------------------
//
// Mike, 25 Aug 2026: ask the three real answers up front - today, a date, or
// simply "historic" - rather than asking for a date and then asking again which
// half of the screen it belongs to. Picking a date sorts it on its own.
//
// A source dropdown used to sit alongside this. It went on the same day: "it
// doesn't read well and adds a layer of effort for the user which slows people
// down too much." Where an account came from is now said in the words of the
// event itself ("police reported that..."), which is how it is written on
// SystmOne anyway. Do not put the field back without asking.
export type WhenChoice = "" | "today" | "date" | "historic";

/** Older than this and it is history, not a current concern. */
export const HISTORIC_MONTHS = 3;

/** Is a dated event old enough to belong under "before"? Undated events are not. */
export function isHistoricDate(d: { day: string; month: string; year: string }, today: Date): boolean {
  const y = Number(d.year);
  if (!y) return false;
  const cut = new Date(today.getFullYear(), today.getMonth() - HISTORIC_MONTHS, today.getDate());
  return new Date(y, (Number(d.month) || 1) - 1, Number(d.day) || 1) < cut;
}

/**
 * Today's date, filled after mount. Never read at render time - the server and
 * the browser can be on different days, and the mismatch shows up as a hydration
 * error rather than as anything obvious.
 */
export function useToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => { setToday(new Date()); }, []);
  return today;
}
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
/** "25 August 2026" - what the Today button shows. Client-side only, see useToday. */
export function formatLongDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
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
    const fmt = exs.map((e) => {
      const d = formatPartialDate(e);
      return `${d ? d + " - " : ""}${e.text.trim()}`;
    }).join("\n");
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

// A plan header - who was involved, who reviews it, when, and what brings the
// review forward - was built on 22 Aug and taken back out on 25 Aug after Mike
// used it. Four more controls per domain lost to the thing everything else here
// loses to: a nurse writing this at 3am. The five Trust headings are all the
// plan prints.
export function buildOneRmp(
  risk: string, secs: AllState, displayName?: string, patientName?: string,
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
    TXT_BAR,
  ];
  RMP_SECTIONS.forEach((sec, i) => {
    blocks.push(sec.heading.toUpperCase());
    blocks.push(body(sec.id));
    if (i < RMP_SECTIONS.length - 1) blocks.push(TXT_DIV);
  });
  return blocks.join("\n");
}

/**
 * An EMPTY plan - the five Trust headings in order, the two halves of the
 * prevent / reduce heading, and the mandatory MDT line, with nothing filled in.
 *
 * Mike, 25 Aug 2026: offered at the end alongside the finished plans, for
 * someone writing one by hand or covering a risk this tool did not. It is a
 * blank form, not a draft - the only words in it are the Trust's own.
 */
export function buildBlankRmp(): string {
  const blocks: string[] = [TXT_BAR, "[NAME THE RISK]", TXT_BAR];
  RMP_SECTIONS.forEach((sec, i) => {
    blocks.push(sec.heading.toUpperCase());
    if (sec.id === "prevent") {
      // The Trust asks two things under this one heading, so a blank template
      // that gave it one line would lose half of it.
      blocks.push("When it happens:");
      blocks.push("To prevent or reduce:");
    } else if (sec.id === "next") {
      // Always applies, whoever writes the plan.
      blocks.push(MANDATORY_MDT_LINE);
    } else {
      blocks.push("");
    }
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

// ---- when did it happen: today, a date, or simply "historic" ---------------
//
// Offered in that order, up front. Picking a date is what sorts the event -
// anything older than HISTORIC_MONTHS is history, everything else is a current
// concern - so the nurse is never asked the same thing twice.
export function WhenPicker({
  choice, onChoice, date, onDate, ring = "focus:ring-sky-500 focus:border-sky-500",
}: {
  choice: WhenChoice;
  onChoice: (c: WhenChoice) => void;
  date: { day: string; month: string; year: string };
  onDate: (fn: (d: { day: string; month: string; year: string }) => { day: string; month: string; year: string }) => void;
  ring?: string;
}) {
  const today = useToday();
  // Both lists are filled after mount, so neither can differ between the server
  // render and the browser.
  const years = today ? Array.from({ length: 71 }, (_, i) => today.getFullYear() - i) : [];
  const sel = `text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white ${ring}`;

  const opts: { v: WhenChoice; label: string }[] = [
    { v: "today", label: today ? `Today (${formatLongDate(today)})` : "Today" },
    { v: "date", label: "A date" },
    { v: "historic", label: "Historic" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
        {opts.map((o) => (
          <button
            key={o.v} type="button" aria-pressed={choice === o.v}
            onClick={() => onChoice(choice === o.v ? "" : o.v)}
            className={`px-3 py-1.5 text-sm font-semibold transition-colors ${choice === o.v ? "bg-sky-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {choice === "date" && (
        <>
          <select value={date.day} onChange={(e) => onDate((d) => ({ ...d, day: e.target.value }))} aria-label="Day" className={sel}>
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, d) => <option key={d + 1} value={String(d + 1)}>{d + 1}</option>)}
          </select>
          <select value={date.month} onChange={(e) => onDate((d) => ({ ...d, month: e.target.value }))} aria-label="Month" className={sel}>
            <option value="">Month</option>
            {MONTHS.map((m, mi) => <option key={m} value={String(mi + 1)}>{m}</option>)}
          </select>
          <select value={date.year} onChange={(e) => onDate((d) => ({ ...d, year: e.target.value }))} aria-label="Year" className={sel}>
            <option value="">Year</option>
            {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </>
      )}
      {choice === "historic" && (
        <span className="text-xs text-gray-500">Before this admission - no date needed.</span>
      )}
    </div>
  );
}

/** Where an event lands, once the nurse has told us when it was. */
export function resolveWhen(
  choice: WhenChoice, date: { day: string; month: string; year: string }, today: Date,
): DatedExample {
  if (choice === "today") {
    return {
      day: String(today.getDate()), month: String(today.getMonth() + 1), year: String(today.getFullYear()),
      text: "", historic: false,
    };
  }
  if (choice === "historic") return { day: "", month: "", year: "", text: "", historic: true };
  return { ...date, text: "", historic: isHistoricDate(date, today) };
}

/** The tag on a recorded event - which half of the S1 screen it will be copied into. */
export function whenLabel(e: DatedExample): string {
  return e.historic ? "Before" : "Now";
}

// ---- dated events: one compact add row, then a plain list -------------------
//
// Mike, 22 Aug: the in-domain version was "chunkier, with big blocks for each",
// one stacked form per event, and he wanted it like the quick-capture panel at
// the top - add it once, then a tidy line per event you can edit or remove.
//
// The difference matters more than it looks: with a block per event you scroll
// past four half-empty forms to reach the fifth, and you cannot see at a glance
// what you have already recorded.
//
// `when` turns it into the domain version (25 Aug): ONE box replacing the old
// Now / Before pair, with the three time choices deciding which half each event
// belongs to.
export function EventEditor({
  items, onChange, accent = "slate", title, when = false, placeholder = "what happened",
}: {
  items: DatedExample[];
  onChange: (fn: (prev: DatedExample[]) => DatedExample[]) => void;
  accent?: "rose" | "slate" | "violet";
  title?: string;
  /** Ask today / a date / historic, and tag each row with where it lands. */
  when?: boolean;
  placeholder?: string;
}) {
  const blank = { day: "", month: "", year: "", text: "" };
  const [draft, setDraft] = useState<DatedExample>({ ...blank });
  const [choice, setChoice] = useState<WhenChoice>("");
  // Which row is being edited, or null when adding a new one.
  const [editing, setEditing] = useState<number | null>(null);
  const today = useToday();
  // Filled after mount so the year list cannot differ between server and client.
  const [years, setYears] = useState<number[]>([]);
  useEffect(() => {
    const y = new Date().getFullYear();
    setYears(Array.from({ length: 71 }, (_, i) => y - i));
  }, []);

  const A = accent === "rose"
    ? { chip: "bg-rose-50 border-rose-200", ring: "focus:ring-rose-400 focus:border-rose-400", link: "text-rose-700 hover:text-rose-900" }
    : accent === "violet"
      ? { chip: "bg-violet-50 border-violet-200", ring: "focus:ring-violet-400 focus:border-violet-400", link: "text-violet-700 hover:text-violet-900" }
      : { chip: "bg-slate-50 border-slate-200", ring: "focus:ring-sky-500 focus:border-sky-500", link: "text-slate-700 hover:text-slate-900" };
  const sel = `text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white ${A.ring}`;

  const commit = () => {
    const text = draft.text.trim();
    if (!text) return;
    // In `when` mode the three choices set the date and which half it lands in;
    // everywhere else the draft's own date is the whole answer.
    const entry = when && today ? { ...draft, ...resolveWhen(choice, draft, today), text } : { ...draft, text };
    onChange((prev) => (editing === null ? [...prev, entry] : prev.map((x, i) => (i === editing ? { ...x, ...entry } : x))));
    setDraft({ ...blank });
    setChoice("");
    setEditing(null);
  };
  const canAdd = draft.text.trim() !== "" && (!when || choice !== "");

  // Editing a row puts its own answer back in the picker, so saving it again
  // cannot silently re-file it somewhere else.
  const startEdit = (ex: DatedExample, i: number) => {
    setDraft({ ...ex });
    setChoice(ex.year ? "date" : ex.historic ? "historic" : "today");
    setEditing(i);
  };

  return (
    <div className={`rounded-lg border ${A.chip} p-2.5 space-y-2`}>
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
        {title || "Events"} {items.filter((e) => e.text.trim()).length > 0 && `(${items.filter((e) => e.text.trim()).length})`}
      </p>

      {/* The list first, so what you have recorded is what you see. */}
      {items.map((ex, i) => {
        if (!ex.text.trim() && editing !== i) return null;
        const d = formatPartialDate(ex);
        return (
          <div key={i} className="flex items-start gap-2 border-b border-gray-200/70 last:border-0 pb-1.5 last:pb-0">
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-gray-800">
                {d && <span className="font-semibold text-gray-500">{d} - </span>}{ex.text}
              </span>
              {when && (
                <span className={`inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${ex.historic ? "bg-slate-200 text-slate-600" : "bg-sky-100 text-sky-800"}`}>
                  {whenLabel(ex)}
                </span>
              )}
            </span>
            <button
              onClick={() => startEdit(ex, i)}
              aria-label={`Edit "${ex.text}"`}
              className="text-gray-400 hover:text-sky-700 transition-colors flex-shrink-0 p-1"
            ><Pencil className="w-3.5 h-3.5" /></button>
            <button
              onClick={() => { onChange((prev) => prev.filter((_, idx) => idx !== i)); if (editing === i) { setDraft({ ...blank }); setChoice(""); setEditing(null); } }}
              aria-label={`Remove "${ex.text}"`}
              className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
            ><X className="w-4 h-4" /></button>
          </div>
        );
      })}

      {when ? (
        <WhenPicker
          choice={choice} onChoice={setChoice}
          date={draft} onDate={(fn) => setDraft((d) => ({ ...d, ...fn(d) }))}
          ring={A.ring}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <select value={draft.day} onChange={(e) => setDraft((d) => ({ ...d, day: e.target.value }))} aria-label="Day" className={sel}>
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, d) => <option key={d + 1} value={String(d + 1)}>{d + 1}</option>)}
          </select>
          <select value={draft.month} onChange={(e) => setDraft((d) => ({ ...d, month: e.target.value }))} aria-label="Month" className={sel}>
            <option value="">Month</option>
            {MONTHS.map((m, mi) => <option key={m} value={String(mi + 1)}>{m}</option>)}
          </select>
          <select value={draft.year} onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))} aria-label="Year" className={sel}>
            <option value="">Year</option>
            {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="text" value={draft.text}
          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
          placeholder={placeholder} aria-label="What happened"
          className={`flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 ${A.ring}`}
        />
        <button onClick={commit} disabled={!canAdd}
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${A.link} border-gray-300 bg-white hover:bg-gray-50`}>
          {editing === null ? <><Plus className="w-3.5 h-3.5" /> Add</> : <><Check className="w-3.5 h-3.5" /> Save</>}
        </button>
        {editing !== null && (
          <button onClick={() => { setDraft({ ...blank }); setChoice(""); setEditing(null); }}
            className="text-xs font-semibold px-2.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        )}
      </div>
      {when && draft.text.trim() !== "" && choice === "" && (
        <p className="text-xs text-amber-700">Say when it was - that is what files it under now or before.</p>
      )}
    </div>
  );
}

// ---- the editor (chips + free text + na + optional dated examples) ----
export function SectionEditor({
  section, state, onChange, accent = "rose", bank, startOpen = false,
}: {
  section: RiskSection;
  state: SecState;
  onChange: (next: SecUpdate) => void;
  accent?: "rose" | "violet";
  // Identifies this question's chip bank so words the user adds come back next
  // time they plan the same risk. Omit to hide "add your own".
  bank?: { risk: string; questionId: string };
  /** Render expanded. The risk tool opens its six questions; /welcome does not. */
  startOpen?: boolean;
}) {
  // Mike, 22 Aug: the six plan questions should not be truncated out of sight.
  // The Welcome tool still opens them collapsed - it has far more of them.
  const [open, setOpen] = useState(startOpen);
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
  // The year list moved into EventEditor, which fills it after mount.

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
            <EventEditor
              accent={accent === "violet" ? "violet" : "slate"}
              title="Specific examples (date optional)"
              items={examples}
              onChange={setExamples}
            />
          )}

          {chipsOnlyNoDetail && <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Add patient-specific detail</span>}
        </div>
      )}
    </div>
  );
}
