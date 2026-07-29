import type { DiaryTask } from "@/lib/types";

/**
 * Is this job done on this particular day?
 *
 * A recurring ward job is ONE record rendered on every day it falls due. Its
 * `status` therefore cannot answer the question - setting it marked the job
 * done on every day at once, so ticking today's fridge check struck the whole
 * week through (Mike, 29 Jul). Recurring jobs record completion per date in
 * `completedDates`; everything else still uses `status`.
 *
 * Pass the date of the column being rendered. Without one, a recurring job
 * falls back to "was it done today", which is the right answer for the places
 * that only ever mean today - the guide viewer, My Jobs, /overview.
 */
export function isCompleteOn(task: DiaryTask, date?: string): boolean {
  if (isPerDate(task)) {
    const day = date ?? todayStr();
    return (task.completedDates ?? []).includes(day);
  }
  return task.status === "completed";
}

/** A job whose completion is held per date rather than on `status`. */
export function isPerDate(task: DiaryTask): task is DiaryTask & { isRecurring: true } {
  return task.type === "ward" && task.isRecurring === true;
}

// Local, not UTC - see toLocalDateStr.
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
