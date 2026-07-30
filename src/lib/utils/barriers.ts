// ---------------------------------------------------------------------------
// BARRIER MATHS
//
// Everything here is DERIVED. Nothing below asks anyone to enter anything new -
// that is the whole pitch of the barriers work: the numbers a bed meeting wants
// fall out of jobs people are already doing in the diary. If a calculation here
// ever needs a new field on a task, that is the signal to stop and think again.
// ---------------------------------------------------------------------------

import type { DiaryTask } from "@/lib/types";
import { isCompleteOn } from "@/lib/utils/task-completion";
import { toLocalDateStr } from "@/lib/utils/date";
import {
  BARRIER_CATEGORIES,
  BARRIER_CATEGORY_ORDER,
  type BarrierCategory,
} from "@/lib/data/barrier-categories";

/**
 * An OPEN barrier: flagged as blocking discharge, not completed, not in error.
 *
 * Completion is asked per date via `isCompleteOn` because a recurring job is
 * one record shown on many days (see BaseTask.completedDates). A barrier is
 * almost never recurring, but asking the question the same way everywhere else
 * does keeps this honest if one ever is.
 */
export function isOpenBarrier(task: DiaryTask, today?: string): boolean {
  if (!task.blocksDischarge) return false;
  if (task.inError) return false;
  return !isCompleteOn(task, today);
}

export function openBarriers(tasks: DiaryTask[], today?: string): DiaryTask[] {
  return tasks.filter((t) => isOpenBarrier(t, today));
}

/**
 * Whole days between two YYYY-MM-DD strings.
 *
 * Parsed as UTC midnight on both sides deliberately: the strings are already
 * local dates (everything goes through `toLocalDateStr`), so treating them as
 * UTC gives a clean day count with no DST edge on either end. Using `new Date`
 * on a bare date string would do this anyway, but doing it explicitly stops
 * someone "fixing" it later.
 */
function daysBetween(fromDateStr: string, toDateStr: string): number {
  const from = Date.parse(`${fromDateStr}T00:00:00Z`);
  const to = Date.parse(`${toDateStr}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / 86_400_000));
}

/**
 * How long this patient has had at least one barrier open, in days.
 *
 * Taken from the OLDEST open barrier's `createdAt` - the day the first thing
 * that is still unresolved was raised. Not the newest, which would reset the
 * clock every time somebody flagged something else and make a long-stuck
 * patient look fresh.
 *
 * Returns null when there are no open barriers, so callers can tell "not
 * blocked" apart from "blocked today".
 */
export function daysBlocked(tasks: DiaryTask[], today?: string): number | null {
  const todayStr = today || toLocalDateStr();
  const open = openBarriers(tasks, todayStr);
  if (open.length === 0) return null;
  const oldest = open.reduce(
    (acc, t) => (t.createdAt < acc ? t.createdAt : acc),
    open[0].createdAt
  );
  return daysBetween(oldest.slice(0, 10), todayStr);
}

/** Age of a single barrier, in days since it was raised. */
export function barrierAgeDays(task: DiaryTask, today?: string): number {
  return daysBetween((task.createdAt || "").slice(0, 10), today || toLocalDateStr());
}

export interface BarrierCategoryCount {
  category: BarrierCategory | null;
  label: string;
  count: number;
}

export interface BarrierSummary {
  total: number;
  /** Waiting on someone outside the ward. */
  external: number;
  /** Ours to shift. */
  ward: number;
  /** Flagged but never categorised - counted in neither of the two above. */
  uncategorised: number;
  /** Ranked, biggest first. Uncategorised always sorts last. */
  byCategory: BarrierCategoryCount[];
}

/**
 * The headline split. `external` + `ward` + `uncategorised` === `total`, so the
 * numbers on screen always reconcile - a stat that does not add up is worse
 * than no stat at all in front of a sponsor.
 */
export function summariseBarriers(tasks: DiaryTask[], today?: string): BarrierSummary {
  const open = openBarriers(tasks, today);
  const counts = new Map<BarrierCategory | null, number>();
  let external = 0;
  let ward = 0;
  let uncategorised = 0;

  for (const task of open) {
    const category = task.barrierCategory ?? null;
    counts.set(category, (counts.get(category) ?? 0) + 1);
    if (!category) {
      uncategorised++;
    } else if (BARRIER_CATEGORIES[category].owner === "external") {
      external++;
    } else {
      ward++;
    }
  }

  const byCategory: BarrierCategoryCount[] = [];
  for (const category of BARRIER_CATEGORY_ORDER) {
    const count = counts.get(category) ?? 0;
    if (count > 0) {
      byCategory.push({ category, label: BARRIER_CATEGORIES[category].short, count });
    }
  }
  byCategory.sort((a, b) => b.count - a.count);
  const none = counts.get(null) ?? 0;
  if (none > 0) byCategory.push({ category: null, label: "Not categorised", count: none });

  return { total: open.length, external, ward, uncategorised, byCategory };
}

/**
 * Fourteen days of barrier counts, ending today.
 *
 * DEMO DATA, and honestly so. There is no persistence anywhere in wardHub
 * (`tasks-provider.tsx` is `useState`), so a real trend cannot exist yet - the
 * live answer is a nightly tally once there is a datastore. What this does
 * instead is REPLAY the barriers that exist now: for each of the last 14 days
 * it counts how many of today's open barriers had already been raised by then,
 * which is real data read backwards rather than an invented curve. It rises
 * towards today, which is the true shape, and it needs no randomness - so it is
 * stable across renders and identical for everyone in the room.
 */
export function barrierTrend(
  tasks: DiaryTask[],
  days = 14,
  today?: string
): { date: string; count: number }[] {
  const todayStr = today || toLocalDateStr();
  const open = openBarriers(tasks, todayStr);
  const todayMs = Date.parse(`${todayStr}T00:00:00Z`);
  if (Number.isNaN(todayMs)) return [];

  const points: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateStr = new Date(todayMs - i * 86_400_000).toISOString().slice(0, 10);
    const count = open.filter((t) => (t.createdAt || "").slice(0, 10) <= dateStr).length;
    points.push({ date: dateStr, count });
  }
  return points;
}
