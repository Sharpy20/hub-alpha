"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent, Modal } from "@/components/ui";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import {
  DEMO_PATIENTS,
  getTasksForPatient,
  getPatientsByWard,
} from "@/lib/data/tasks";
import { WARDS, Patient, DiaryTask, TaskPriority, PRIORITY_CONFIG } from "@/lib/types";
import { TaskDetailModal, AddTaskModal } from "@/components/modals";
import { toLocalDateStr } from "@/lib/utils/date";
import { daysBlocked, barrierAgeDays } from "@/lib/utils/barriers";
import { BarrierBand } from "@/components/overview/BarrierBand";
import { BarrierCategoryChip } from "@/components/tasks/BarrierCategoryPicker";
import { BARRIER_CATEGORIES, type BarrierCategory } from "@/lib/data/barrier-categories";
import { printBedMeetingSheet } from "@/lib/utils/bedMeetingSheet";
import {
  STAMP_ITEMS,
  StampKind,
  StampStore,
  loadStamps,
  saveStamps,
  applyStamp,
  clearStamp,
  stampAge,
  ageLabel,
} from "@/lib/data/patient-review";
import {
  ClipboardCheck,
  Users,
  Building2,
  UserCheck,
  Printer,
  Clock,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Check,
  Home,
  User,
  ListTodo,
  LayoutGrid,
  Table as TableIcon,
  Search,
  ArrowUpDown,
  X,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Undo2,
  Flame,
  Construction,
  Circle,
  Maximize2,
  Plus,
} from "lucide-react";

// Priority ranking + colours, shared by tiles and table so priority is visible
// everywhere (Mike: priority colour was not carrying across).
const PRIORITY_RANK: Record<TaskPriority, number> = { urgent: 3, important: 2, routine: 1 };
const PRIORITY_DOT: Record<TaskPriority, string> = {
  urgent: "bg-red-500",
  important: "bg-amber-500",
  routine: "bg-emerald-400",
};
const PRIORITY_ROW: Record<TaskPriority, string> = {
  urgent: "bg-red-50 border-red-200",
  important: "bg-amber-50 border-amber-200",
  routine: "bg-slate-50 border-slate-200",
};

// Due date from any task type
const taskDueDate = (task: DiaryTask): string =>
  task.type === "appointment" ? task.appointmentDate : task.dueDate;

const isOutstanding = (t: DiaryTask) => t.status !== "completed" && t.status !== "cancelled";

// Which counter on a patient tile is being used as a filter. Clicking a counter
// narrows that patient's job list to just those jobs (Mike, 27 Jul).
type TaskLens = "all" | "outstanding" | "overdue" | "done" | "barriers" | "waiting";

const lensMatches = (lens: TaskLens, t: DiaryTask): boolean => {
  switch (lens) {
    case "outstanding": return isOutstanding(t);
    case "overdue": return t.status === "overdue";
    case "done": return t.status === "completed";
    // A cleared barrier stays in the barriers view showing its tick. In a bed
    // meeting "that one is now done" is the useful answer; having it vanish the
    // moment you complete it just loses your place (Mike, 27 Jul).
    case "barriers": return !!t.blocksDischarge;
    // Waiting carries the same weight as a barrier (BACKLOG Section M): these
    // are the jobs nobody is working on because someone else owes us something,
    // which is exactly the list a ward round wants to chase.
    case "waiting": return t.handback?.state === "waiting" && isOutstanding(t);
    default: return true;
  }
};

const LENS_LABEL: Record<Exclude<TaskLens, "all">, string> = {
  outstanding: "outstanding",
  overdue: "overdue",
  done: "completed",
  barriers: "blocking discharge",
  waiting: "waiting on someone",
};

interface PatientSummary {
  patient: Patient;
  tasks: DiaryTask[];
  total: number;
  completed: number;
  outstanding: number;
  overdue: number;
  barriers: number;
  waiting: number;
  topPriority: TaskPriority | null;
  /**
   * How long this patient has been blocked, from the OLDEST open barrier.
   * null when nothing is blocking. Derived - nobody types this.
   */
  blockedDays: number | null;
}

function buildSummary(patient: Patient, tasks: DiaryTask[]): PatientSummary {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const outstandingTasks = tasks.filter(isOutstanding);
  const overdue = tasks.filter((t) => t.status === "overdue").length;
  const barriers = outstandingTasks.filter((t) => t.blocksDischarge).length;
  const waiting = outstandingTasks.filter((t) => t.handback?.state === "waiting").length;
  let topPriority: TaskPriority | null = null;
  for (const t of outstandingTasks) {
    if (!topPriority || PRIORITY_RANK[t.priority] > PRIORITY_RANK[topPriority]) {
      topPriority = t.priority;
    }
  }
  return {
    patient,
    tasks,
    total: tasks.length,
    completed,
    outstanding: outstandingTasks.length,
    overdue,
    barriers,
    waiting,
    topPriority,
    blockedDays: daysBlocked(tasks),
  };
}

type ReportScope = "all_wards" | "single_ward" | "selected_patients";

// Types use lowercase ward id ("byron"); patient/task data uses capitalised ("Byron").
const getWardDataName = (wardId: string): string =>
  wardId.charAt(0).toUpperCase() + wardId.slice(1);

// Actions available on a job, shared by tile and table view. Deliberately one
// tap each: ward round is fast and someone is already typing into SystmOne.
interface JobActions {
  onComplete: (task: DiaryTask) => void;
  onReopen: (task: DiaryTask) => void;
  onRedo: (task: DiaryTask, newDate: string) => void;
  onToggleBarrier: (task: DiaryTask) => void;
}

interface StickyCtl {
  has: (id: string) => boolean;
  clear: () => void;
}

// Wraps the job actions so anything you act on is pinned into view, even once
// it stops matching the active filter. Without this, ticking off the job you
// are looking at makes it vanish and you lose your place in the list.
function useStickyActions(actions: JobActions): [StickyCtl, JobActions] {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const keep = useCallback((id: string) => setIds((prev) => new Set(prev).add(id)), []);

  const wrapped = useMemo<JobActions>(
    () => ({
      onComplete: (t) => { keep(t.id); actions.onComplete(t); },
      onReopen: (t) => { keep(t.id); actions.onReopen(t); },
      onRedo: (t, d) => { keep(t.id); actions.onRedo(t, d); },
      onToggleBarrier: (t) => { keep(t.id); actions.onToggleBarrier(t); },
    }),
    [actions, keep]
  );

  const ctl = useMemo<StickyCtl>(
    () => ({ has: (id) => ids.has(id), clear: () => setIds(new Set()) }),
    [ids]
  );

  return [ctl, wrapped];
}

// Completed jobs drop into a plain list at the foot of the tile. They used to
// stay in the main list turned green, which fought the red/amber/green priority
// language - green had to mean "routine" and "done" at the same time (Mike,
// 27 Jul). Title only: who completed it is in the job detail, and it is not
// what anyone is scanning for.
const DoneList = ({
  tasks,
  onOpen,
}: {
  tasks: DiaryTask[];
  onOpen: (task: DiaryTask) => void;
}) => {
  if (tasks.length === 0) return null;
  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/70 print-task-list">
      <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Done ({tasks.length})
      </p>
      <ul className="px-3 pb-2 space-y-0.5">
        {tasks.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => onOpen(t)}
              className="w-full text-left text-sm text-gray-500 hover:text-violet-700 flex items-baseline gap-1.5 py-0.5"
              title="Open the full job details"
            >
              <Check className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 self-center print-hide" />
              <span className="line-through decoration-gray-300 truncate">{t.title}</span>
              {t.blocksDischarge && (
                <span className="flex-shrink-0 text-[10px] font-semibold text-gray-500">
                  barrier cleared
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Job row - the actionable unit. Outstanding jobs offer Complete and the
// barrier flag; completed jobs offer Reopen and Redo (reopen with a new date).
// ---------------------------------------------------------------------------
const JobRow = ({
  task,
  actions,
  onOpen,
  compact = false,
}: {
  task: DiaryTask;
  actions: JobActions;
  onOpen: (task: DiaryTask) => void;
  compact?: boolean;
}) => {
  const done = task.status === "completed";
  const [redoOpen, setRedoOpen] = useState(false);
  const [redoDate, setRedoDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toLocalDateStr(d);
  });

  const btn =
    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-40";

  return (
    <div
      className={`rounded-lg border print-task-item ${
        done ? "bg-emerald-50 border-emerald-100" : PRIORITY_ROW[task.priority]
      } ${compact ? "p-2" : "p-3"}`}
    >
      <div className="flex items-center gap-3">
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 print-hide" />
        ) : (
          <span
            className={`w-3 h-3 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`}
            title={`${PRIORITY_CONFIG[task.priority].label} priority`}
          />
        )}
        {/* Click the job to open the full detail, same as the diary. Kept as a
            sibling of the action buttons rather than wrapping them, so we do
            not nest interactive elements (axe: nested-interactive). */}
        <button
          onClick={() => onOpen(task)}
          className="flex-1 min-w-0 text-left group"
          title="Open the full job details"
        >
          <p className="text-sm font-medium text-gray-800 group-hover:text-violet-700 group-hover:underline decoration-violet-300 underline-offset-2">
            {done ? "✓ " : "○ "}
            {task.title}
            {task.blocksDischarge && (
              <span
                className={`ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold align-middle ${
                  done ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {done ? "✓ barrier cleared" : "🚧 blocks discharge"}
              </span>
            )}
            {!done && task.blocksDischarge && (
              <BarrierCategoryChip category={task.barrierCategory} className="ml-1 align-middle" />
            )}
            {!done && task.blocksDischarge && (
              <span className="ml-1 text-[10px] text-gray-500 align-middle">
                {barrierAgeDays(task)}d
              </span>
            )}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {done ? (
              <>Done: {task.completedBy || "Unknown"}</>
            ) : (
              <>
                {PRIORITY_CONFIG[task.priority].label} · Due:{" "}
                {taskDueDate(task)
                  ? new Date(taskDueDate(task)).toLocaleDateString("en-GB")
                  : "No date"}
              </>
            )}
          </p>
        </button>

        {/* Inline actions - hidden on print, this is a working screen */}
        <div className="flex flex-wrap items-center gap-1 print-hide">
          {done ? (
            <>
              <button
                onClick={() => actions.onReopen(task)}
                className={`${btn} text-indigo-700 bg-indigo-50 hover:bg-indigo-100`}
                title="Put this job back on the list, keeping its original date"
              >
                <Undo2 className="w-3.5 h-3.5" /> Reopen
              </button>
              <button
                onClick={() => setRedoOpen((v) => !v)}
                aria-expanded={redoOpen}
                className={`${btn} text-violet-700 bg-violet-50 hover:bg-violet-100`}
                title="Reopen this job with a new date - it needs doing again"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Redo
              </button>
            </>
          ) : (
            <>
              {/* "Complete" with a filled green tick read as a STATUS - as if
                  the job were already done - rather than the thing to press
                  (Mike, 29 Jul). Hollow circle and an instruction now. */}
              <button
                onClick={() => actions.onComplete(task)}
                className={`${btn} text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50`}
                title="Mark this job complete"
              >
                <Circle className="w-3.5 h-3.5" /> Mark complete
              </button>
              <button
                onClick={() => actions.onToggleBarrier(task)}
                aria-pressed={!!task.blocksDischarge}
                className={`${btn} ${
                  task.blocksDischarge
                    ? "text-amber-800 bg-amber-100 hover:bg-amber-200"
                    // gray-600: 500 on a gray-100 chip is 4.39:1 (axe, 29 Jul)
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                title={
                  task.blocksDischarge
                    ? "Remove the barrier-to-discharge flag"
                    : "Flag this job as a barrier to discharge"
                }
              >
                <Construction className="w-3.5 h-3.5" />
                {task.blocksDischarge ? "Barrier" : "Flag barrier"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Redo expands in place - no modal, no confirmation */}
      {redoOpen && done && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-white/70 border border-violet-200 p-2 print-hide">
          <label className="text-xs font-medium text-gray-600" htmlFor={`redo-${task.id}`}>
            Do it again by
          </label>
          <input
            id={`redo-${task.id}`}
            type="date"
            value={redoDate}
            onChange={(e) => setRedoDate(e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={() => {
              actions.onRedo(task, redoDate);
              setRedoOpen(false);
            }}
            className={`${btn} text-white bg-violet-600 hover:bg-violet-700`}
          >
            Confirm
          </button>
          <button
            onClick={() => setRedoOpen(false)}
            className={`${btn} text-gray-500 hover:bg-gray-100`}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Review stamps - per patient, not per job. Worded as an attestation rather
// than a tick: one tap says "this jobs list is agreed as current".
// ---------------------------------------------------------------------------
const StampRow = ({
  patientId,
  stamps,
  today,
  onStamp,
  onClear,
}: {
  patientId: string;
  stamps: StampStore;
  today: string;
  onStamp: (patientId: string, kind: StampKind) => void;
  onClear: (patientId: string, kind: StampKind) => void;
}) => {
  const mine = stamps[patientId] || {};

  return (
    <div className="flex flex-wrap items-center gap-1.5 print-hide">
      {STAMP_ITEMS.map((meta) => {
        const stamp = mine[meta.id];
        const age = stampAge(stamp, meta, today);
        const tone =
          age === "today"
            ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
            : age === "fresh"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              : age === "stale"
                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50";
        return (
          <button
            key={meta.id}
            onClick={() => (age === "today" ? onClear(patientId, meta.id) : onStamp(patientId, meta.id))}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${tone}`}
            title={
              stamp
                ? `${meta.label} - ${ageLabel(stamp, today)} by ${stamp.by}${
                    age === "today" ? ". Tap again to undo." : ". Tap to stamp as reviewed today."
                  }`
                : `${meta.label} - tap to record that this jobs list is agreed as current`
            }
          >
            {age === "today" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <ClipboardCheck className="w-3.5 h-3.5" />
            )}
            {meta.short}
            <span className={age === "today" ? "text-white/90" : "text-gray-500"}>
              {ageLabel(stamp, today)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Counter button on a patient tile - clicking filters that patient's job list.
const CounterButton = ({
  value,
  label,
  lens,
  active,
  tone,
  icon,
  onClick,
}: {
  value: number;
  label: string;
  lens: TaskLens;
  active: boolean;
  tone: string;
  icon?: React.ReactNode;
  onClick: (lens: TaskLens) => void;
}) => (
  <button
    onClick={() => onClick(lens)}
    aria-pressed={active}
    title={active ? `Showing ${label.toLowerCase()} only - tap to show all` : `Show only ${label.toLowerCase()}`}
    className={`text-center rounded-lg py-1 transition-colors ${
      active ? "bg-violet-100 ring-2 ring-violet-400" : "hover:bg-gray-100"
    }`}
  >
    <div className={`flex items-center justify-center gap-1 ${tone}`}>
      {icon}
      <span className="text-xl font-bold">{value}</span>
    </div>
    {/* gray-600 not gray-500: these sit on a gray-50 strip, where 500 measures
        4.07:1 and fails AA (axe, 29 Jul). */}
    <p className="text-xs text-gray-600">{label}</p>
  </button>
);

// Standing Y/N switch for a filter. Deliberately a persistent control rather
// than a banner that only appears when filtered - from a glance at the tile you
// can always tell which state you are in (Mike, 27 Jul). Used for Barriers and
// for Waiting, which carries the same weight (BACKLOG Section M).
const SWITCH_TONES = {
  amber: { on: "bg-amber-100 border-amber-400 text-amber-900", pill: "bg-amber-500 text-white" },
  sky: { on: "bg-sky-100 border-sky-400 text-sky-900", pill: "bg-sky-500 text-white" },
} as const;

const FilterSwitch = ({
  on,
  count,
  onToggle,
  line1,
  line2,
  title,
  tone = "amber",
}: {
  on: boolean;
  count: number;
  onToggle: () => void;
  line1: string;
  line2: string;
  title: string;
  tone?: keyof typeof SWITCH_TONES;
}) => (
  <button
    onClick={onToggle}
    aria-pressed={on}
    title={title}
    className={`print-hide flex flex-col items-center justify-center rounded-lg border-2 px-2.5 transition-colors ${
      on ? SWITCH_TONES[tone].on : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
    }`}
  >
    <span className="text-[10px] font-semibold uppercase tracking-wide leading-tight text-center">
      {line1}
      <br />
      {line2}
    </span>
    <span
      className={`mt-1 rounded-full px-2 py-0.5 text-xs font-bold ${
        on ? SWITCH_TONES[tone].pill : "bg-gray-200 text-gray-600"
      }`}
    >
      {on ? "YES" : "NO"}
    </span>
    <span className="mt-0.5 text-[10px] text-gray-500">
      {count} open
    </span>
  </button>
);

// ---------------------------------------------------------------------------
// Patient focus panel - the full working view of one patient, shown inside the
// pop-out. The grid tile used to carry all of this, which meant about one and a
// half patients per screen. It is now split: the tile scans, this one works
// (Mike, 29 Jul). Everything that takes a decision lives here - due dates, the
// filters, the review stamps, and the job actions.
// ---------------------------------------------------------------------------
const PatientFocusPanel = ({
  summary,
  actions: rawActions,
  stamps,
  today,
  onStamp,
  onClearStamp,
  onOpenTask,
  pageLens,
}: {
  summary: PatientSummary;
  actions: JobActions;
  stamps: StampStore;
  today: string;
  onStamp: (patientId: string, kind: StampKind) => void;
  onClearStamp: (patientId: string, kind: StampKind) => void;
  onOpenTask: (task: DiaryTask) => void;
  pageLens: TaskLens;
}) => {
  const s = summary;
  const [lens, setLens] = useState<TaskLens>(pageLens);
  // Filtering the page to barriers (or waiting) now switches every patient to
  // that view too - the two controls used to disagree, so you could be filtered
  // at the top while each tile still showed everything (Mike, 27 Jul). Still
  // overridable per patient afterwards.
  useEffect(() => { setLens(pageLens); }, [pageLens]);
  // Jobs you have just acted on stay in view even if they no longer match the
  // filter, so ticking something off does not make it disappear from under you
  // (Mike, 27 Jul). Cleared whenever you change the filter.
  const [sticky, actions] = useStickyActions(rawActions);

  const toggleLens = (next: TaskLens) => {
    sticky.clear();
    setLens((cur) => (cur === next ? "all" : next));
  };

  const sortedTasks = useMemo(() => {
    const inLens = s.tasks.filter((t) => lensMatches(lens, t) || sticky.has(t.id));
    const out = inLens.filter(isOutstanding).sort((a, b) => {
      const p = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
      if (p !== 0) return p;
      return new Date(taskDueDate(a) || "").getTime() - new Date(taskDueDate(b) || "").getTime();
    });
    const done = inLens
      .filter((t) => t.status === "completed")
      .sort((a, b) => new Date(b.completedAt || "").getTime() - new Date(a.completedAt || "").getTime());
    return [...out, ...done];
  }, [s.tasks, lens]);

  const outstandingTasks = useMemo(
    () => sortedTasks.filter((t) => t.status !== "completed"),
    [sortedTasks]
  );
  const doneTasks = useMemo(
    () => sortedTasks.filter((t) => t.status === "completed"),
    [sortedTasks]
  );

  const statusColor =
    s.barriers > 0
      ? "from-amber-500 to-orange-600"
      : s.outstanding > 0
        ? "from-blue-500 to-indigo-600"
        : "from-emerald-500 to-green-600";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 print-patient-card">
      {/* Header - minimal PII: name and ward only */}
      <div className={`bg-gradient-to-r ${statusColor} p-4 text-white print-report-header`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center print-hide">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold">{s.patient.name}</h3>
            <p className="text-white/80 text-sm">{s.patient.ward} Ward</p>
          </div>
          {s.barriers > 0 && (
            <span className="flex-shrink-0 bg-white/25 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
              🚧 {s.barriers} barrier{s.barriers > 1 ? "s" : ""}
            </span>
          )}
          {s.blockedDays !== null && (
            <span className="flex-shrink-0 bg-white/25 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
              blocked {s.blockedDays}d
            </span>
          )}
          {s.waiting > 0 && (
            <span className="flex-shrink-0 bg-white/25 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
              ⏳ {s.waiting} waiting
            </span>
          )}
        </div>
      </div>

      {/* Clickable counters, with a standing Barriers-only switch on the right
          so it is always obvious whether you are filtered (Mike, 27 Jul). */}
      <div className="flex items-stretch gap-2 p-3 bg-gray-50 border-b border-gray-100 print-stats-row">
        <div className="grid grid-cols-4 gap-1 flex-1">
          <CounterButton
            value={s.total}
            label="Total"
            lens="all"
            active={lens === "all"}
            tone="text-gray-600"
            icon={<ListTodo className="w-4 h-4 print-hide" />}
            onClick={() => { sticky.clear(); setLens("all"); }}
          />
          <CounterButton
            value={s.outstanding}
            label="Outstanding"
            lens="outstanding"
            active={lens === "outstanding"}
            tone="text-amber-600"
            icon={<Clock className="w-4 h-4 print-hide" />}
            onClick={toggleLens}
          />
          <CounterButton
            value={s.overdue}
            label="Overdue"
            lens="overdue"
            active={lens === "overdue"}
            tone="text-red-600"
            onClick={toggleLens}
          />
          <CounterButton
            value={s.completed}
            label="Done"
            lens="done"
            active={lens === "done"}
            tone="text-emerald-600"
            icon={<CheckCircle2 className="w-4 h-4 print-hide" />}
            onClick={toggleLens}
          />
        </div>

        <div className="flex gap-1.5">
          <FilterSwitch
            on={lens === "barriers"}
            count={s.barriers}
            onToggle={() => toggleLens("barriers")}
            line1="Barriers"
            line2="only"
            tone="amber"
            title={
              lens === "barriers"
                ? "Showing only jobs flagged as blocking discharge - tap for all jobs"
                : "Show only jobs flagged as blocking discharge"
            }
          />
          <FilterSwitch
            on={lens === "waiting"}
            count={s.waiting}
            onToggle={() => toggleLens("waiting")}
            line1="Waiting"
            line2="only"
            tone="sky"
            title={
              lens === "waiting"
                ? "Showing only jobs waiting on someone else - tap for all jobs"
                : "Show only jobs waiting on someone else"
            }
          />
        </div>
      </div>

      {/* Review stamps */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-white">
        <StampRow
          patientId={s.patient.id}
          stamps={stamps}
          today={today}
          onStamp={onStamp}
          onClear={onClearStamp}
        />
      </div>

      {/* Job list */}
      <div className="p-3 print-task-list">
        {lens !== "all" && (
          <div
            className={`mb-2 flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 print-hide ${
              lens === "barriers" ? "bg-amber-50" : lens === "waiting" ? "bg-sky-50" : "bg-violet-50"
            }`}
          >
            <span
              className={`text-xs font-medium ${
                lens === "barriers" ? "text-amber-900" : lens === "waiting" ? "text-sky-900" : "text-violet-800"
              }`}
            >
              Showing {LENS_LABEL[lens]} only ({sortedTasks.length})
            </span>
            <button
              onClick={() => { sticky.clear(); setLens("all"); }}
              className={`text-xs font-medium inline-flex items-center gap-1 ${
                lens === "barriers"
                  ? "text-amber-700 hover:text-amber-900"
                  : lens === "waiting"
                  ? "text-sky-700 hover:text-sky-900"
                  : "text-violet-600 hover:text-violet-800"
              }`}
            >
              <X className="w-3 h-3" /> Show all
            </button>
          </div>
        )}

        {/* Outstanding and Done are each under their own heading, so a job's
            group says what state it is in and the row does not have to (Mike,
            29 Jul). */}
        <div className="space-y-2">
          {outstandingTasks.length > 0 && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Outstanding ({outstandingTasks.length})
            </p>
          )}
          {sortedTasks.length > 0 ? (
            outstandingTasks.map((task) => (
              <JobRow key={task.id} task={task} actions={actions} onOpen={onOpenTask} />
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {lens === "all" ? "No jobs recorded" : `No ${LENS_LABEL[lens]} jobs`}
            </p>
          )}
          {sortedTasks.length > 0 && outstandingTasks.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Nothing outstanding</p>
          )}
        </div>

        <DoneList tasks={doneTasks} onOpen={onOpenTask} />

        <div
          className={`mt-3 p-3 rounded-xl print-summary ${
            s.outstanding > 3
              ? "bg-amber-50 border border-amber-100"
              : s.outstanding > 0
                ? "bg-blue-50 border border-blue-100"
                : "bg-emerald-50 border border-emerald-100"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              s.outstanding > 3
                ? "text-amber-700"
                : s.outstanding > 0
                  ? "text-blue-700"
                  : "text-emerald-700"
            }`}
          >
            {s.outstanding > 0
              ? `${s.outstanding} job${s.outstanding > 1 ? "s" : ""} outstanding${
                  s.barriers > 0 ? ` · ${s.barriers} blocking discharge` : ""
                }`
              : "All jobs completed"}
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Compact tile - the scanning view. Job title, priority dot, barrier chip and a
// one-click tick, nothing else: a due date and three buttons per job is what
// pushed the grid down to about one and a half patients on screen. Everything
// else is one click away in the pop-out (Mike, 29 Jul).
// ---------------------------------------------------------------------------
const CompactJobRow = ({
  task,
  onOpen,
  onComplete,
}: {
  task: DiaryTask;
  onOpen: (task: DiaryTask) => void;
  onComplete: (task: DiaryTask) => void;
}) => (
  <li className="flex items-center gap-2 py-0.5">
    <span
      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`}
      title={`${PRIORITY_CONFIG[task.priority].label} priority`}
    />
    <button
      onClick={() => onOpen(task)}
      className="flex-1 min-w-0 text-left text-sm text-gray-800 hover:text-violet-700 hover:underline decoration-violet-300 underline-offset-2 truncate"
      title={task.title}
    >
      {task.title}
      {task.blocksDischarge && (
        <span className="ml-1.5 text-[10px] font-semibold text-amber-800" title="Blocks discharge">
          🚧
        </span>
      )}
      {/* On screen the priority dot and the pop-out carry this. On paper there
          is no pop-out to click into, so the printed sheet keeps the detail. */}
      <span className="hidden print:inline text-gray-600">
        {" "}
        - {PRIORITY_CONFIG[task.priority].label}
        {taskDueDate(task)
          ? `, due ${new Date(taskDueDate(task)).toLocaleDateString("en-GB")}`
          : ""}
      </span>
    </button>
    <button
      onClick={() => onComplete(task)}
      aria-label={`Mark "${task.title}" complete`}
      title="Mark complete"
      className="flex-shrink-0 p-1 rounded-md text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors print-hide"
    >
      <Circle className="w-4 h-4" />
    </button>
  </li>
);

const PatientCompactCard = ({
  summary,
  actions: rawActions,
  onOpenTask,
  onOpenPatient,
  pageLens,
}: {
  summary: PatientSummary;
  actions: JobActions;
  onOpenTask: (task: DiaryTask) => void;
  onOpenPatient: () => void;
  pageLens: TaskLens;
}) => {
  const s = summary;
  const [lens, setLens] = useState<TaskLens>(pageLens);
  useEffect(() => { setLens(pageLens); }, [pageLens]);
  const [sticky, actions] = useStickyActions(rawActions);

  const toggleLens = (next: TaskLens) => {
    sticky.clear();
    setLens((cur) => (cur === next ? "all" : next));
  };

  // The tile lists outstanding jobs. Filter to Done and it lists those instead,
  // so the counter still does something here rather than showing an empty tile.
  const shown = useMemo(() => {
    const inLens = s.tasks.filter((t) => lensMatches(lens, t) || sticky.has(t.id));
    const wantDone = lens === "done";
    return inLens
      .filter((t) => (wantDone ? t.status === "completed" : t.status !== "completed"))
      .sort((a, b) => {
        const p = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
        if (p !== 0) return p;
        return new Date(taskDueDate(a) || "").getTime() - new Date(taskDueDate(b) || "").getTime();
      });
  }, [s.tasks, lens, sticky]);

  const doneTasks = useMemo(
    () => s.tasks.filter((t) => t.status === "completed"),
    [s.tasks]
  );

  const statusColor =
    s.barriers > 0
      ? "from-amber-500 to-orange-600"
      : s.outstanding > 0
        ? "from-blue-500 to-indigo-600"
        : "from-emerald-500 to-green-600";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow print-patient-card">
      {/* The patient name opens the pop-out. Kept as its own button rather than
          wrapping the header, so the badges beside it stay plain text. */}
      <div className={`bg-gradient-to-r ${statusColor} p-3 text-white print-report-header`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPatient}
            className="flex-1 min-w-0 text-left group"
            title={`Open ${s.patient.name} - full jobs list, review stamps and actions`}
          >
            <h3 className="text-lg font-bold truncate group-hover:underline decoration-white/60 underline-offset-2">
              {s.patient.name}
            </h3>
            <p className="text-white/80 text-xs">{s.patient.ward} Ward</p>
          </button>
          {s.barriers > 0 && (
            <span className="flex-shrink-0 bg-white/25 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
              🚧 {s.barriers}
            </span>
          )}
          {/* How long they have been stuck. Derived from the oldest open
              barrier, so it costs nobody any typing - and it is the number a
              bed meeting asks for first. */}
          {s.blockedDays !== null && (
            <span
              className="flex-shrink-0 bg-white/25 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
              title={`Blocked for ${s.blockedDays} day${s.blockedDays === 1 ? "" : "s"}, from the oldest open barrier`}
            >
              {s.blockedDays}d
            </span>
          )}
          {s.waiting > 0 && (
            <span className="flex-shrink-0 bg-white/25 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
              ⏳ {s.waiting}
            </span>
          )}
          <button
            onClick={onOpenPatient}
            aria-label={`Open ${s.patient.name}`}
            title="Open this patient"
            className="flex-shrink-0 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors print-hide"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b border-gray-100 print-stats-row">
        <CounterButton
          value={s.total}
          label="Total"
          lens="all"
          active={lens === "all"}
          tone="text-gray-600"
          onClick={() => { sticky.clear(); setLens("all"); }}
        />
        <CounterButton
          value={s.outstanding}
          label="Outstanding"
          lens="outstanding"
          active={lens === "outstanding"}
          tone="text-amber-600"
          onClick={toggleLens}
        />
        <CounterButton
          value={s.overdue}
          label="Overdue"
          lens="overdue"
          active={lens === "overdue"}
          tone="text-red-600"
          onClick={toggleLens}
        />
        <CounterButton
          value={s.completed}
          label="Done"
          lens="done"
          active={lens === "done"}
          tone="text-emerald-600"
          onClick={toggleLens}
        />
      </div>

      <div className="p-3 print-task-list">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {lens === "done" ? "Done" : "Outstanding"} ({shown.length})
        </p>
        {shown.length > 0 ? (
          <ul className="space-y-0.5">
            {shown.map((task) => (
              <CompactJobRow
                key={task.id}
                task={task}
                onOpen={onOpenTask}
                onComplete={actions.onComplete}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 text-center py-3">
            {lens === "all" || lens === "outstanding"
              ? "Nothing outstanding"
              : `No ${LENS_LABEL[lens] || "matching"} jobs`}
          </p>
        )}

        {/* Completed jobs live in the pop-out on screen. A printed sheet has to
            stand alone, so they come back on paper. */}
        <div className="hidden print:block">
          <DoneList tasks={doneTasks} onOpen={onOpenTask} />
        </div>

        <button
          onClick={onOpenPatient}
          className={`mt-3 w-full text-left p-2.5 rounded-xl print-summary transition-colors ${
            s.outstanding > 3
              ? "bg-amber-50 border border-amber-100 hover:bg-amber-100"
              : s.outstanding > 0
                ? "bg-blue-50 border border-blue-100 hover:bg-blue-100"
                : "bg-emerald-50 border border-emerald-100 hover:bg-emerald-100"
          }`}
          title="Open this patient"
        >
          <span
            className={`text-sm font-medium ${
              s.outstanding > 3
                ? "text-amber-700"
                : s.outstanding > 0
                  ? "text-blue-700"
                  : "text-emerald-700"
            }`}
          >
            {s.outstanding > 0
              ? `${s.outstanding} job${s.outstanding > 1 ? "s" : ""} outstanding${
                  s.barriers > 0 ? ` · ${s.barriers} blocking discharge` : ""
                }`
              : "All jobs completed"}
          </span>
        </button>
      </div>
    </div>
  );
};

// Same standing switch, laid out inline for the expanded table row.
const BarriersSwitchInline = ({
  on,
  count,
  onToggle,
}: {
  on: boolean;
  count: number;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    aria-pressed={on}
    title={
      on
        ? "Showing only jobs flagged as blocking discharge - tap for all jobs"
        : "Show only jobs flagged as blocking discharge"
    }
    className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 text-xs font-medium transition-colors ${
      on
        ? "bg-amber-100 border-amber-400 text-amber-900"
        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
    }`}
  >
    <Construction className="w-3.5 h-3.5" />
    Barriers only
    <span
      className={`rounded-full px-1.5 py-0.5 font-bold ${
        on ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-600"
      }`}
    >
      {on ? "YES" : "NO"}
    </span>
    <span className="text-gray-500">({count} open)</span>
  </button>
);

// Same switch for the waiting lens. Waiting carries the same weight as a
// barrier, so it gets the same standing control (BACKLOG Section M).
const WaitingSwitchInline = ({
  on,
  count,
  onToggle,
}: {
  on: boolean;
  count: number;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    aria-pressed={on}
    title={
      on
        ? "Showing only jobs waiting on someone else - tap for all jobs"
        : "Show only jobs waiting on someone else"
    }
    className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 text-xs font-medium transition-colors ${
      on
        ? "bg-sky-100 border-sky-400 text-sky-900"
        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
    }`}
  >
    <Clock className="w-3.5 h-3.5" />
    Waiting only
    <span
      className={`rounded-full px-1.5 py-0.5 font-bold ${
        on ? "bg-sky-500 text-white" : "bg-gray-200 text-gray-600"
      }`}
    >
      {on ? "YES" : "NO"}
    </span>
    <span className="text-gray-500">({count} open)</span>
  </button>
);

// ---------------------------------------------------------------------------
// Table view
// ---------------------------------------------------------------------------
type SortKey = "name" | "ward" | "priority" | "total" | "outstanding" | "overdue" | "barriers" | "blocked" | "waiting" | "completed" | "reviewed";

const PatientTableRow = ({
  summary,
  expanded,
  onToggle,
  actions: rawActions,
  stamps,
  today,
  onStamp,
  onClearStamp,
  onOpenTask,
  pageLens,
}: {
  summary: PatientSummary;
  expanded: boolean;
  onToggle: () => void;
  actions: JobActions;
  stamps: StampStore;
  today: string;
  onStamp: (patientId: string, kind: StampKind) => void;
  onClearStamp: (patientId: string, kind: StampKind) => void;
  onOpenTask: (task: DiaryTask) => void;
  pageLens: TaskLens;
}) => {
  const s = summary;
  const [lens, setLens] = useState<TaskLens>(pageLens);
  useEffect(() => { setLens(pageLens); }, [pageLens]);
  const [sticky, actions] = useStickyActions(rawActions);
  const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;

  const sortedTasks = useMemo(() => {
    const inLens = s.tasks.filter((t) => lensMatches(lens, t) || sticky.has(t.id));
    const out = inLens.filter(isOutstanding).sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
    const done = inLens.filter((t) => t.status === "completed");
    return [...out, ...done];
  }, [s.tasks, lens, sticky]);

  // Clicking a count opens the row already filtered to those jobs.
  const openWith = (next: TaskLens) => {
    sticky.clear();
    setLens(next);
    if (!expanded) onToggle();
  };

  const countBtn = "w-full rounded px-1 py-0.5 hover:bg-violet-100 transition-colors";

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-violet-50/40">
        <td className="py-2.5 px-3">
          <button onClick={onToggle} className="flex items-center gap-2 text-left" aria-expanded={expanded}>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform print-hide ${expanded ? "rotate-180" : ""}`}
            />
            <span className="font-semibold text-gray-900">{s.patient.name}</span>
          </button>
        </td>
        <td className="py-2.5 px-3 text-gray-600">{s.patient.ward}</td>
        <td className="py-2.5 px-3">
          {s.topPriority ? (
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT[s.topPriority]}`} />
              <span className="text-gray-700">{PRIORITY_CONFIG[s.topPriority].label}</span>
            </span>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </td>
        <td className="py-2.5 px-3 text-center text-gray-700">
          <button className={countBtn} onClick={() => openWith("all")} title="Show all jobs">
            {s.total}
          </button>
        </td>
        <td className="py-2.5 px-3 text-center font-medium text-amber-700">
          <button className={countBtn} onClick={() => openWith("outstanding")} title="Show outstanding jobs only">
            {s.outstanding}
          </button>
        </td>
        <td className="py-2.5 px-3 text-center font-medium text-red-600">
          <button className={countBtn} onClick={() => openWith("overdue")} title="Show overdue jobs only">
            {s.overdue || <span className="text-gray-300">0</span>}
          </button>
        </td>
        <td className="py-2.5 px-3 text-center">
          <button className={countBtn} onClick={() => openWith("barriers")} title="Show jobs blocking discharge only">
            {s.barriers > 0 ? (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                🚧 {s.barriers}
              </span>
            ) : (
              <span className="text-gray-300">0</span>
            )}
          </button>
        </td>
        {/* Blocked for how long. Sortable, so "worst first" is one click. */}
        <td className="py-2.5 px-3 text-center">
          {s.blockedDays === null ? (
            <span className="text-gray-300">-</span>
          ) : (
            <span
              className={`text-sm font-semibold ${
                s.blockedDays >= 14 ? "text-red-700" : s.blockedDays >= 7 ? "text-amber-700" : "text-gray-700"
              }`}
              title={`Oldest open barrier raised ${s.blockedDays} day${s.blockedDays === 1 ? "" : "s"} ago`}
            >
              {s.blockedDays}d
            </span>
          )}
        </td>
        <td className="py-2.5 px-3 text-center">
          <button className={countBtn} onClick={() => openWith("waiting")} title="Show jobs waiting on someone only">
            {s.waiting > 0 ? (
              <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
                ⏳ {s.waiting}
              </span>
            ) : (
              <span className="text-gray-300">0</span>
            )}
          </button>
        </td>
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2 min-w-[90px]">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-9 text-right">{pct}%</span>
          </div>
        </td>
        <td className="py-2.5 px-3">
          <StampRow
            patientId={s.patient.id}
            stamps={stamps}
            today={today}
            onStamp={onStamp}
            onClear={onClearStamp}
          />
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/60">
          <td colSpan={10} className="px-3 pb-3 pt-1">
            <div className="mb-2 flex flex-wrap items-center gap-2 print-hide">
              <BarriersSwitchInline
                on={lens === "barriers"}
                count={s.barriers}
                onToggle={() => {
                  sticky.clear();
                  setLens((cur) => (cur === "barriers" ? "all" : "barriers"));
                }}
              />
              <WaitingSwitchInline
                on={lens === "waiting"}
                count={s.waiting}
                onToggle={() => {
                  sticky.clear();
                  setLens((cur) => (cur === "waiting" ? "all" : "waiting"));
                }}
              />
              {lens !== "all" && lens !== "barriers" && lens !== "waiting" && (
                <>
                  <span className="text-xs font-medium text-violet-800 bg-violet-50 rounded px-2 py-1">
                    Showing {LENS_LABEL[lens]} only ({sortedTasks.length})
                  </span>
                  <button
                    onClick={() => { sticky.clear(); setLens("all"); }}
                    className="text-xs font-medium text-violet-600 hover:text-violet-800"
                  >
                    Show all
                  </button>
                </>
              )}
            </div>
            <div className="space-y-1.5">
              {sortedTasks.length === 0 && (
                <p className="text-sm text-gray-400 py-1">
                  {lens === "all" ? "No jobs recorded" : `No ${LENS_LABEL[lens]} jobs`}
                </p>
              )}
              {sortedTasks
                .filter((t) => t.status !== "completed")
                .map((task) => (
                  <JobRow key={task.id} task={task} actions={actions} onOpen={onOpenTask} compact />
                ))}
              <DoneList
                tasks={sortedTasks.filter((t) => t.status === "completed")}
                onOpen={onOpenTask}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OverviewPage() {
  const { user, activeWard } = useApp();
  const { tasks, allTasks, addTask, updateTask, toggleComplete, claimTask, restoreFromError } = useTasks();
  const [showInError, setShowInError] = useState(false);
  const inErrorTasks = allTasks.filter((t) => t.inError);

  const userName = user?.name || "Staff";

  // Full job detail, same modal the diary uses - so anything you cannot do from
  // the inline actions (edit, claim, reassign, mark in error) is one tap away.
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailTask = useMemo(
    () => tasks.find((t) => t.id === detailTaskId) ?? null,
    [tasks, detailTaskId]
  );
  // setDetailTaskId is listed even though a state setter is already stable:
  // without it the React Compiler refuses to optimise this component at all
  // (react-hooks/preserve-manual-memoization).
  const openTaskDetail = useCallback((task: DiaryTask) => setDetailTaskId(task.id), [setDetailTaskId]);

  // Pop-out for one patient. Held by id, not by object, so the panel re-reads
  // live task state as jobs are ticked off underneath it.
  const [focusPatientId, setFocusPatientId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);

  // Same shape as the diary's. Random suffix keeps ids unique when several are
  // added in one tick.
  const handleAddTask = useCallback(
    (newTask: Partial<DiaryTask>) => {
      addTask({
        ...newTask,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      } as DiaryTask);
      setShowAddTask(false);
    },
    [addTask]
  );

  // Scope. Defaults to the ward the user works on when we know it; when we do
  // not, no ward is preselected and the screen asks for one (Mike, 27 Jul).
  const [scope, setScope] = useState<ReportScope>("single_ward");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [patientFilterWards, setPatientFilterWards] = useState<string[]>([]);
  const [showPatientPicker, setShowPatientPicker] = useState(false);

  // Resolve the user's ward once on mount. `user.ward` is the lowercase id;
  // `activeWard` is the capitalised display name, so normalise both.
  useEffect(() => {
    const candidate = (user?.ward || activeWard || "").toLowerCase();
    if (candidate && WARDS.some((w) => w.id === candidate)) setSelectedWard(candidate);
  }, [user?.ward, activeWard]);

  // Review stamps (localStorage, demo only)
  const [stamps, setStamps] = useState<StampStore>({});
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(toLocalDateStr());
    setStamps(loadStamps());
  }, []);

  const handleStamp = useCallback(
    (patientId: string, kind: StampKind) => {
      setStamps((prev) => {
        const next = applyStamp(prev, patientId, kind, userName);
        saveStamps(next);
        return next;
      });
    },
    [userName]
  );

  const handleClearStamp = useCallback((patientId: string, kind: StampKind) => {
    setStamps((prev) => {
      const next = clearStamp(prev, patientId, kind);
      saveStamps(next);
      return next;
    });
  }, []);

  // Job actions. Complete/reopen reuse the provider's toggle so the diary,
  // kanban and every count stay in step; redo additionally moves the date.
  const actions: JobActions = useMemo(
    () => ({
      onComplete: (task) => {
        if (task.status !== "completed") toggleComplete(task.id, userName);
      },
      onReopen: (task) => {
        if (task.status === "completed") toggleComplete(task.id, userName);
      },
      onRedo: (task, newDate) => {
        if (task.status === "completed") toggleComplete(task.id, userName);
        updateTask(
          task.id,
          task.type === "appointment" ? { appointmentDate: newDate } : { dueDate: newDate }
        );
      },
      onToggleBarrier: (task) => {
        updateTask(task.id, { blocksDischarge: !task.blocksDischarge });
      },
    }),
    [toggleComplete, updateTask, userName]
  );

  const reportPatients = useMemo(() => {
    if (scope === "all_wards") {
      return DEMO_PATIENTS.filter((p) => p.status !== "discharged");
    }
    if (scope === "single_ward") {
      if (!selectedWard) return [];
      return getPatientsByWard(getWardDataName(selectedWard)).filter((p) => p.status !== "discharged");
    }
    return DEMO_PATIENTS.filter((p) => selectedPatients.includes(p.id) && p.status !== "discharged");
  }, [scope, selectedWard, selectedPatients]);

  const allActivePatients = useMemo(
    () => DEMO_PATIENTS.filter((p) => p.status !== "discharged"),
    []
  );

  // View + filters
  const [viewMode, setViewMode] = useState<"tiles" | "table">("tiles");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "outstanding" | "done">("all");
  const [barriersOnly, setBarriersOnly] = useState(false);
  const [waitingOnly, setWaitingOnly] = useState(false);
  // Drill-down from the barriers band: show only patients with an open barrier
  // of this kind. Turning it on implies barriers-only, since a housing filter
  // that still lists everyone's other jobs is not a drill-down.
  const [categoryFilter, setCategoryFilter] = useState<BarrierCategory | null>(null);
  // What the page-level filters mean for each patient tile. Barriers wins if
  // both are on - it is the one people filter by in a bed meeting.
  const pageLens: TaskLens = barriersOnly ? "barriers" : waitingOnly ? "waiting" : "all";
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [unreviewedOnly, setUnreviewedOnly] = useState(false);
  const [wardFilter, setWardFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("outstanding");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const summaries = useMemo(
    () => reportPatients.map((p) => buildSummary(p, getTasksForPatient(p.id, tasks))),
    [reportPatients, tasks]
  );

  const scopeWards = useMemo(() => {
    const set = new Set(summaries.map((s) => s.patient.ward));
    return WARDS.filter((w) => set.has(getWardDataName(w.id)));
  }, [summaries]);

  // A patient counts as reviewed today if any of the three stamps landed today.
  const reviewedToday = useCallback(
    (patientId: string) => {
      const mine = stamps[patientId] || {};
      return STAMP_ITEMS.some((m) => mine[m.id]?.at === today);
    },
    [stamps, today]
  );

  const filtered = useMemo(() => {
    return summaries.filter((s) => {
      if (search && !s.patient.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (wardFilter.length > 0 && !wardFilter.includes(s.patient.ward.toLowerCase())) return false;
      if (barriersOnly && s.barriers === 0) return false;
      if (
        categoryFilter &&
        !s.tasks.some(
          (t) => isOutstanding(t) && t.blocksDischarge && t.barrierCategory === categoryFilter
        )
      )
        return false;
      if (waitingOnly && s.waiting === 0) return false;
      if (overdueOnly && s.overdue === 0) return false;
      if (unreviewedOnly && reviewedToday(s.patient.id)) return false;
      if (statusFilter === "outstanding" && s.outstanding === 0) return false;
      if (statusFilter === "done" && s.outstanding > 0) return false;
      if (
        priorityFilter !== "all" &&
        !s.tasks.some((t) => isOutstanding(t) && t.priority === priorityFilter)
      )
        return false;
      return true;
    });
  }, [
    summaries,
    search,
    wardFilter,
    barriersOnly,
    categoryFilter,
    waitingOnly,
    overdueOnly,
    unreviewedOnly,
    statusFilter,
    priorityFilter,
    reviewedToday,
  ]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const val = (s: PatientSummary): number | string => {
      switch (sortKey) {
        case "name": return s.patient.name.toLowerCase();
        case "ward": return s.patient.ward.toLowerCase();
        case "priority": return s.topPriority ? PRIORITY_RANK[s.topPriority] : 0;
        case "total": return s.total;
        case "outstanding": return s.outstanding;
        case "overdue": return s.overdue;
        case "barriers": return s.barriers;
        case "blocked": return s.blockedDays ?? 0;
        case "waiting": return s.waiting;
        case "completed": return s.completed;
        case "reviewed": return reviewedToday(s.patient.id) ? 1 : 0;
      }
    };
    return [...filtered].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [filtered, sortKey, sortDir, reviewedToday]);

  // Read off the live summaries, so ticking a job inside the pop-out updates its
  // counters immediately. Falls back to the unfiltered set: a filter that no
  // longer matches the open patient should not empty the pop-out under them.
  const focusSummary = useMemo(
    () =>
      focusPatientId
        ? summaries.find((s) => s.patient.id === focusPatientId) ?? null
        : null,
    [summaries, focusPatientId]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "ward" ? "asc" : "desc");
    }
  };

  const toggleRow = (id: string) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const activeFilterCount =
    (search ? 1 : 0) +
    wardFilter.length +
    (barriersOnly ? 1 : 0) +
    (categoryFilter ? 1 : 0) +
    (waitingOnly ? 1 : 0) +
    (overdueOnly ? 1 : 0) +
    (unreviewedOnly ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setWardFilter([]);
    setBarriersOnly(false);
    setCategoryFilter(null);
    setOverdueOnly(false);
    setUnreviewedOnly(false);
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  // The one-page bed-meeting printout. Built from the FILTERED set, so what
  // prints is what is on screen - printing a different set to the one you just
  // narrowed down is the kind of surprise that loses trust in a meeting.
  const handlePrintBedSheet = useCallback(() => {
    const scopeLabel =
      scope === "all_wards"
        ? "All wards"
        : scope === "single_ward"
          ? `${getWardDataName(selectedWard)} Ward`
          : `${filtered.length} selected patient${filtered.length === 1 ? "" : "s"}`;

    let total = 0;
    let external = 0;
    let ward = 0;
    let uncategorised = 0;

    const patients = filtered.map((s) => {
      const barriers = s.tasks
        .filter((t) => isOutstanding(t) && t.blocksDischarge)
        .map((t) => {
          total++;
          if (!t.barrierCategory) uncategorised++;
          else if (BARRIER_CATEGORIES[t.barrierCategory].owner === "external") external++;
          else ward++;
          return {
            title: t.title,
            category: t.barrierCategory,
            ageDays: barrierAgeDays(t, today || undefined),
            overdue: t.status === "overdue",
          };
        })
        .sort((a, b) => b.ageDays - a.ageDays);
      return {
        name: s.patient.name,
        ward: s.patient.ward,
        blockedDays: s.blockedDays,
        barriers,
      };
    });

    printBedMeetingSheet({
      scopeLabel,
      dateLabel: new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      patients,
      totals: { total, external, ward, uncategorised },
    });
  }, [filtered, scope, selectedWard, today]);

  const rollup = useMemo(() => {
    return filtered.reduce(
      (acc, s) => {
        acc.completed += s.completed;
        acc.outstanding += s.outstanding;
        acc.overdue += s.overdue;
        acc.barriers += s.barriers;
        acc.waiting += s.waiting;
        if (reviewedToday(s.patient.id)) acc.reviewed += 1;
        return acc;
      },
      { completed: 0, outstanding: 0, overdue: 0, barriers: 0, waiting: 0, reviewed: 0 }
    );
  }, [filtered, reviewedToday]);

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId]
    );
  };

  const scopeLabel =
    scope === "all_wards"
      ? "All wards"
      : scope === "single_ward"
        ? WARDS.find((w) => w.id === selectedWard)?.name || "No ward selected"
        : "Selected patients";

  // Stamp everything currently shown - the "rapid review, nothing changed" case.
  const stampAllShown = (kind: StampKind) => {
    setStamps((prev) => {
      let next = prev;
      sorted.forEach((s) => {
        next = applyStamp(next, s.patient.id, kind, userName);
      });
      saveStamps(next);
      return next;
    });
  };

  const needsWard = scope === "single_ward" && !selectedWard;
  const needsPatients = scope === "selected_patients" && selectedPatients.length === 0;

  return (
    <MainLayout>
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <ClipboardCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Overview</h1>
                <p className="text-white/80 mt-1">
                  Every patient&apos;s jobs list, ready to work through and sign off
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Two different printouts on purpose. "Print" is the whole screen
                  for a records copy; the bed-meeting sheet is the one-page
                  worst-first list you actually carry into the meeting. */}
              <Button
                variant="outline"
                onClick={handlePrintBedSheet}
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Printer className="w-4 h-4" />
                Bed meeting sheet
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>

          {/* Headline numbers for what is currently shown */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-5">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">{filtered.length}</p>
              <p className="text-white/70 text-sm">Patients</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">{rollup.outstanding}</p>
              <p className="text-white/70 text-sm">Outstanding</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold text-red-300">{rollup.overdue}</p>
              <p className="text-white/70 text-sm">Overdue</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold text-amber-300">🚧 {rollup.barriers}</p>
              <p className="text-white/70 text-sm">Barriers to discharge</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold text-sky-300">⏳ {rollup.waiting}</p>
              <p className="text-white/70 text-sm">Waiting on someone</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold text-emerald-300">
                {rollup.reviewed}/{filtered.length}
              </p>
              <p className="text-white/70 text-sm">Reviewed today</p>
            </div>
          </div>

          {/* Barriers band. Reads the FILTERED set, so it always describes what
              is actually on screen rather than a fixed trust-wide number. */}
          <div className="print-hide">
            <BarrierBand
              tasks={filtered.flatMap((s) => s.tasks)}
              categoryFilter={categoryFilter}
              onCategoryFilter={(next) => {
                setCategoryFilter(next);
                // A category drill-down only makes sense against barriers, so
                // turn barriers-only on with it and off again when cleared.
                setBarriersOnly(!!next);
              }}
              today={today || undefined}
            />
          </div>
        </div>

        {/* Scope bar - compact, because the list below is the point of the screen */}
        <Card className="print-hide">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Reviewing
              </span>

              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                {(
                  [
                    { key: "single_ward", label: "Single ward", icon: <Home className="w-4 h-4" /> },
                    { key: "all_wards", label: "All wards", icon: <Building2 className="w-4 h-4" /> },
                    { key: "selected_patients", label: "Select patients", icon: <UserCheck className="w-4 h-4" /> },
                  ] as { key: ReportScope; label: string; icon: React.ReactNode }[]
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setScope(opt.key);
                      if (opt.key === "selected_patients") setShowPatientPicker(true);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                      scope === opt.key
                        ? "bg-violet-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              {scope === "single_ward" && (
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  aria-label="Select ward"
                  className={`px-3 py-2 border-2 rounded-lg text-sm bg-white focus:outline-none focus:border-violet-500 ${
                    selectedWard ? "border-gray-200" : "border-amber-400"
                  }`}
                >
                  <option value="">Choose a ward...</option>
                  {WARDS.map((ward) => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              )}

              {scope === "all_wards" && (
                <span className="text-sm text-gray-500">{allActivePatients.length} patients</span>
              )}

              {scope === "selected_patients" && (
                <button
                  onClick={() => setShowPatientPicker((v) => !v)}
                  className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  {selectedPatients.length} selected · {showPatientPicker ? "Hide" : "Change"}
                </button>
              )}

              {/* Stamp everything shown - the rapid-review shortcut */}
              {sorted.length > 0 && (
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-600">Stamp all shown</span>
                  {STAMP_ITEMS.map((meta) => (
                    <button
                      key={meta.id}
                      onClick={() => stampAllShown(meta.id)}
                      title={`Record ${meta.label.toLowerCase()} against all ${sorted.length} patients shown`}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      {meta.short}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Patient picker - only when that scope is chosen */}
            {scope === "selected_patients" && showPatientPicker && (
              <div className="space-y-3 border-t border-gray-100 pt-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPatientFilterWards([])}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      patientFilterWards.length === 0
                        ? "bg-violet-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All Wards
                  </button>
                  {WARDS.map((ward) => (
                    <button
                      key={ward.id}
                      onClick={() =>
                        setPatientFilterWards((prev) =>
                          prev.includes(ward.id) ? prev.filter((id) => id !== ward.id) : [...prev, ward.id]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        patientFilterWards.includes(ward.id)
                          ? "bg-violet-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {ward.name}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const wardsToUse =
                        patientFilterWards.length === 0
                          ? WARDS
                          : WARDS.filter((w) => patientFilterWards.includes(w.id));
                      const patientsToAdd = wardsToUse
                        .flatMap((ward) =>
                          getPatientsByWard(getWardDataName(ward.id)).filter((p) => p.status !== "discharged")
                        )
                        .map((p) => p.id);
                      setSelectedPatients((prev) => [...new Set([...prev, ...patientsToAdd])]);
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                  >
                    Select All Shown
                  </button>
                  <button
                    onClick={() => {
                      if (patientFilterWards.length === 0) {
                        setSelectedPatients([]);
                      } else {
                        const patientsToRemove = patientFilterWards.flatMap((wardId) =>
                          getPatientsByWard(getWardDataName(wardId)).map((p) => p.id)
                        );
                        setSelectedPatients((prev) => prev.filter((id) => !patientsToRemove.includes(id)));
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Clear {patientFilterWards.length > 0 ? "Selected Wards" : "All"}
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                  {(patientFilterWards.length === 0
                    ? WARDS
                    : WARDS.filter((w) => patientFilterWards.includes(w.id))
                  ).map((ward) => {
                    const wardPatients = getPatientsByWard(getWardDataName(ward.id)).filter(
                      (p) => p.status !== "discharged"
                    );
                    return (
                      <div key={ward.id}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 bg-gray-50 rounded sticky top-0">
                          {ward.name} ({wardPatients.length} patients)
                        </p>
                        {wardPatients.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => togglePatientSelection(patient.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                              selectedPatients.includes(patient.id)
                                ? "bg-violet-100 text-violet-800"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                selectedPatients.includes(patient.id)
                                  ? "bg-violet-500 border-violet-500 text-white"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedPatients.includes(patient.id) && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className="text-sm">{patient.name}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty scope states */}
        {needsWard ? (
          <div className="bg-white rounded-xl border border-amber-200 p-10 text-center">
            <Home className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Choose a ward to review</p>
            <p className="text-sm text-gray-500 mt-1">
              We could not tell which ward you work on, so nothing is preselected.
            </p>
          </div>
        ) : needsPatients ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <UserCheck className="w-8 h-8 text-violet-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Pick the patients you want to review</p>
            <button
              onClick={() => setShowPatientPicker(true)}
              className="mt-2 text-sm font-medium text-violet-600 hover:underline"
            >
              Open the patient picker
            </button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3 print-hide">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setViewMode("tiles")}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === "tiles" ? "bg-violet-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" /> Tiles
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === "table" ? "bg-violet-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <TableIcon className="w-4 h-4" /> Table
                  </button>
                </div>

                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search patient..."
                    aria-label="Search patient"
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as "all" | TaskPriority)}
                  aria-label="Filter by priority"
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="all">Any priority</option>
                  <option value="urgent">🔴 Urgent</option>
                  <option value="important">🟡 Important</option>
                  <option value="routine">🟢 Routine</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "outstanding" | "done")}
                  aria-label="Filter by status"
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="all">All patients</option>
                  <option value="outstanding">Has outstanding</option>
                  <option value="done">All done</option>
                </select>

                <button
                  onClick={() => setBarriersOnly((v) => !v)}
                  aria-pressed={barriersOnly}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    barriersOnly
                      ? "bg-amber-50 border-amber-400 text-amber-800"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  🚧 Barriers only
                </button>
                <button
                  onClick={() => setWaitingOnly((v) => !v)}
                  aria-pressed={waitingOnly}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    waitingOnly
                      ? "bg-sky-50 border-sky-400 text-sky-800"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  ⏳ Waiting only
                </button>
                <button
                  onClick={() => setOverdueOnly((v) => !v)}
                  aria-pressed={overdueOnly}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    overdueOnly
                      ? "bg-red-50 border-red-400 text-red-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Flame className="w-4 h-4 inline mr-1" />
                  Overdue only
                </button>
                <button
                  onClick={() => setUnreviewedOnly((v) => !v)}
                  aria-pressed={unreviewedOnly}
                  title="Hide patients already stamped as reviewed today - work down to an empty list"
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    unreviewedOnly
                      ? "bg-violet-50 border-violet-400 text-violet-800"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 inline mr-1" />
                  Not reviewed today
                </button>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" /> Clear ({activeFilterCount})
                  </button>
                )}
              </div>

              {scopeWards.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Ward</span>
                  {scopeWards.map((w) => {
                    const on = wardFilter.includes(w.id);
                    return (
                      <button
                        key={w.id}
                        onClick={() =>
                          setWardFilter((prev) => (on ? prev.filter((x) => x !== w.id) : [...prev, w.id]))
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          on
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {w.name.replace(" Ward", "")}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                <span className="font-medium text-gray-600 uppercase tracking-wider">Priority</span>
                {(["urgent", "important", "routine"] as TaskPriority[]).map((p) => (
                  <span key={p} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT[p]}`} />
                    {PRIORITY_CONFIG[p].label}
                  </span>
                ))}
                <span className="flex items-center gap-1">🚧 Barrier to discharge</span>
                <span className="text-gray-500">
                  Tap any count to show just those jobs. Tap a stamp to record the review.
                </span>
              </div>
            </div>

            {/* Print-only header */}
            <div className="hidden print:block border-b border-gray-300 pb-2 mb-2">
              <h2 className="text-xl font-bold">Overview - {scopeLabel}</h2>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleString("en-GB")} · {filtered.length} patients
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
                No patients match the current filters.
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="ml-2 text-violet-600 font-medium hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : viewMode === "tiles" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 print:grid-cols-2">
                {sorted.map((s) => (
                  <PatientCompactCard
                    key={s.patient.id}
                    summary={s}
                    actions={actions}
                    onOpenTask={openTaskDetail}
                    onOpenPatient={() => setFocusPatientId(s.patient.id)}
                    pageLens={pageLens}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-end px-3 py-2 border-b border-gray-100 print-hide">
                  <button
                    onClick={() => {
                      const allExpanded =
                        sorted.length > 0 && sorted.every((s) => expandedRows.has(s.patient.id));
                      setExpandedRows(allExpanded ? new Set() : new Set(sorted.map((s) => s.patient.id)));
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        sorted.length > 0 && sorted.every((s) => expandedRows.has(s.patient.id))
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                    {sorted.length > 0 && sorted.every((s) => expandedRows.has(s.patient.id))
                      ? "Collapse all"
                      : "Expand all"}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-gray-400 border-b border-gray-200">
                        {(
                          [
                            { key: "name", label: "Patient", align: "left" },
                            { key: "ward", label: "Ward", align: "left" },
                            { key: "priority", label: "Top priority", align: "left" },
                            { key: "total", label: "Total", align: "center" },
                            { key: "outstanding", label: "Outstanding", align: "center" },
                            { key: "overdue", label: "Overdue", align: "center" },
                            { key: "barriers", label: "Barriers", align: "center" },
                            { key: "blocked", label: "Blocked", align: "center" },
                            { key: "waiting", label: "Waiting", align: "center" },
                            { key: "completed", label: "Progress", align: "left" },
                            { key: "reviewed", label: "Reviewed", align: "left" },
                          ] as { key: SortKey; label: string; align: string }[]
                        ).map((col) => (
                          <th
                            key={col.key}
                            className={`py-2.5 px-3 ${col.align === "center" ? "text-center" : "text-left"}`}
                          >
                            <button
                              onClick={() => toggleSort(col.key)}
                              className={`inline-flex items-center gap-1 hover:text-gray-700 ${
                                sortKey === col.key ? "text-violet-600" : ""
                              }`}
                            >
                              {col.label}
                              <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((s) => (
                        <PatientTableRow
                          key={s.patient.id}
                          summary={s}
                          expanded={expandedRows.has(s.patient.id)}
                          onToggle={() => toggleRow(s.patient.id)}
                          actions={actions}
                          stamps={stamps}
                          today={today}
                          onStamp={handleStamp}
                          onClearStamp={handleClearStamp}
                          onOpenTask={openTaskDetail}
                          pageLens={pageLens}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 py-4 print:py-2">
              <p>wardHub Overview - {scopeLabel} - {new Date().toLocaleString("en-GB")}</p>
              <p className="text-xs mt-1">
                Contains patient information - handle according to Trust data protection policies
              </p>
            </div>
          </>
        )}

        {/* Marked-in-error audit trail - tasks are never deleted; wrongly
            entered ones are flagged and land here, restorable in one click. */}
        {inErrorTasks.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden print:hidden mt-6">
            <button
              onClick={() => setShowInError(!showInError)}
              className="w-full px-4 py-3 flex items-center justify-between bg-red-50 hover:bg-red-100 transition-colors"
            >
              <span className="flex items-center gap-2 font-semibold text-red-800">
                <AlertTriangle className="w-4 h-4" />
                Jobs marked in error ({inErrorTasks.length})
              </span>
              {showInError ? (
                <ChevronUp className="w-4 h-4 text-red-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-red-600" />
              )}
            </button>
            {showInError && (
              <div className="divide-y divide-gray-100">
                <p className="px-4 py-2 text-xs text-gray-500">
                  Jobs are never deleted. These were marked as entered in error and are excluded from every
                  view and count. Restore one if it was flagged by mistake.
                </p>
                {inErrorTasks.map((t) => (
                  <div key={t.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{t.title}</p>
                      <p className="text-xs text-gray-500">
                        {t.type === "appointment"
                          ? "Appointment"
                          : t.type === "patient"
                            ? "Patient task"
                            : "Ward task"}{" "}
                        · {t.ward} · marked by {t.markedInErrorBy || "unknown"} on{" "}
                        {t.markedInErrorAt || "unknown date"}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreFromError(t.id)}
                      className="shrink-0 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Patient pop-out. Opening one patient full size is the point: the grid
          is for finding who needs attention, this is for working through them
          without the other tiles competing for the eye (Mike, 29 Jul). */}
      {focusSummary && (
        <Modal
          isOpen={true}
          onClose={() => setFocusPatientId(null)}
          title={`${focusSummary.patient.name} - jobs list`}
          size="xl"
        >
          <PatientFocusPanel
            summary={focusSummary}
            actions={actions}
            stamps={stamps}
            today={today}
            onStamp={handleStamp}
            onClearStamp={handleClearStamp}
            onOpenTask={openTaskDetail}
            pageLens={pageLens}
          />
          {/* Add a job without leaving the review (Mike, 30 Jul). Ward round
              throws up new jobs as you work down the list, and the alternative
              was to close the pop-out, go to the diary, add it and find your
              place again. Opens the SAME Add Task screen the diary uses,
              pre-filled with this patient. */}
          <div className="mt-4 pt-4 border-t border-gray-200 print-hide">
            <Button
              onClick={() => setShowAddTask(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add a job for {focusSummary.patient.name}
            </Button>
          </div>
        </Modal>
      )}

      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAdd={handleAddTask}
        activeWard={focusSummary?.patient.ward ?? getWardDataName(selectedWard)}
        currentUserName={userName}
        prefill={
          focusSummary
            ? { taskType: "patient", patientName: focusSummary.patient.name }
            : undefined
        }
      />

      {/* Full job detail - the same modal the Team Diary uses, so a job opened
          from a review looks and behaves exactly as it does everywhere else. */}
      <TaskDetailModal
        isOpen={!!detailTask}
        onClose={() => setDetailTaskId(null)}
        task={detailTask}
        currentUserName={userName}
        onClaim={(taskId) => claimTask(taskId, userName)}
        onSteal={(taskId) => claimTask(taskId, userName, true)}
        onToggleComplete={(taskId) => toggleComplete(taskId, userName)}
        onUpdate={updateTask}
      />
    </MainLayout>
  );
}
