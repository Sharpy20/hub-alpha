// Per-patient review stamps: who attested that this patient's jobs list is
// current, and when. Three kinds, because three different rituals ask the
// question - the MDT/ward round, the daily rapid review, and the named nurse's
// own weekly check. One tap each, no free text anywhere (see BACKLOG Section M:
// structured only, so nothing clinical can land in the wrong record).
//
// The free by-product is the assurance metric: patients not seen by their named
// nurse in two weeks, or not through rapid review since Friday, fall straight
// out of this data without anyone entering anything extra.
//
// Demo-only: state lives in localStorage, same as the care-review tracker.

import { toLocalDateStr } from "@/lib/utils/date";

export type StampKind = "mdt" | "rapid" | "named_nurse";

export interface StampMeta {
  id: StampKind;
  label: string;
  short: string;
  /** Days after which this stamp reads as stale. */
  staleAfterDays: number;
  /** The line this stamp contributes to a case note. */
  caseNote: string;
}

export const STAMP_ITEMS: StampMeta[] = [
  {
    id: "mdt",
    label: "Reviewed by MDT",
    short: "MDT",
    staleAfterDays: 7,
    caseNote: "Jobs list reviewed and agreed as current at MDT.",
  },
  {
    id: "rapid",
    label: "Rapid review",
    short: "Rapid",
    staleAfterDays: 1,
    caseNote: "Jobs list reviewed and agreed as current at rapid review.",
  },
  {
    id: "named_nurse",
    label: "Named nurse review",
    short: "Named nurse",
    staleAfterDays: 14,
    caseNote: "Jobs list reviewed and agreed as current by named nurse.",
  },
];

export interface Stamp {
  /** YYYY-MM-DD */
  at: string;
  by: string;
}

export type PatientStamps = Partial<Record<StampKind, Stamp>>;
export type StampStore = Record<string, PatientStamps>;

const KEY = "wardhub_review_stamps_v1";

export function loadStamps(): StampStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveStamps(store: StampStore): void {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(store));
}

/** Stamp a patient, returning the updated store (does not save). */
export function applyStamp(
  store: StampStore,
  patientId: string,
  kind: StampKind,
  by: string,
  today = toLocalDateStr()
): StampStore {
  return {
    ...store,
    [patientId]: { ...(store[patientId] || {}), [kind]: { at: today, by } },
  };
}

/** Remove a stamp (mis-tap undo), returning the updated store. */
export function clearStamp(store: StampStore, patientId: string, kind: StampKind): StampStore {
  const current = { ...(store[patientId] || {}) };
  delete current[kind];
  return { ...store, [patientId]: current };
}

/** Whole days between two YYYY-MM-DD dates (to - from). */
export function daysSince(from: string, to: string): number {
  const a = new Date(from + "T00:00:00").getTime();
  const b = new Date(to + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

export type StampAge = "today" | "fresh" | "stale" | "never";

export function stampAge(stamp: Stamp | undefined, meta: StampMeta, today: string): StampAge {
  if (!stamp) return "never";
  const age = daysSince(stamp.at, today);
  if (age <= 0) return "today";
  return age > meta.staleAfterDays ? "stale" : "fresh";
}

/** "today" / "yesterday" / "4 days ago" - for the stamp chip. */
export function ageLabel(stamp: Stamp | undefined, today: string): string {
  if (!stamp) return "not yet";
  const age = daysSince(stamp.at, today);
  if (age <= 0) return "today";
  if (age === 1) return "yesterday";
  return `${age} days ago`;
}
