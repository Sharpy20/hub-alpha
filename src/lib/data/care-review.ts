// Per-patient "care review" tracker: which admission tasks are done, and when
// each recurring item was last reviewed - so the patient tile can show an
// Admission badge (green when complete) and a countdown to each review's due
// date. Demo-only: state lives in localStorage, seeded from the patient's
// admission date so the board looks alive without real data.

import { toLocalDateStr } from "@/lib/utils/date";
import { ADMISSION_CHECKLIST } from "./guides/admission";

export interface ReviewItem {
  id: string;
  label: string;
  short: string;
  intervalDays: number;
  guideId?: string; // the relevant guide (/guides/<id>), if there is one
}

// The recurring items the weekly ward audit checks (from the named-nurse cadence).
export const REVIEW_ITEMS: ReviewItem[] = [
  { id: "care-plan", label: "Care plan updated (with patient)", short: "Care plan", intervalDays: 7, guideId: "care-plan" },
  { id: "care-plan-offered", label: "Care plan offered", short: "Offered", intervalDays: 7, guideId: "care-plan" },
  { id: "risk", label: "Risk assessment", short: "Risk ax", intervalDays: 7, guideId: "risk-assessment" },
  { id: "consent", label: "Consent to share (re-ask)", short: "Consent", intervalDays: 7, guideId: "information-sharing" },
  { id: "honos", label: "HONOS", short: "HONOS", intervalDays: 30, guideId: "honos" },
  { id: "safety-plan", label: "Safety plan", short: "Safety plan", intervalDays: 30, guideId: "safety-plan" },
];

// The admission tasks ARE the Admission Checklist items (same ids), so the
// patient's Admission badge only goes green when the whole checklist is done and
// ticking either place keeps both in sync. A few items link to a relevant guide.
const ADMISSION_GUIDE_MAP: Record<string, string> = {
  "risk-screening": "risk-assessment",
  "risk-management": "risk-assessment",
  "capacity-admission": "capacity-assessment",
  "capacity-treatment": "capacity-assessment",
  "safety-plan": "safety-plan",
  "care-plan": "care-plan",
  "read-rights": "section-132",
  "advocacy": "imha-advocacy",
  "news2": "news2",
  "honos": "honos",
};

export interface AdmissionItem {
  id: string;
  label: string;
  group: string;
  guideId?: string;
}

export const ADMISSION_ITEMS: AdmissionItem[] = ADMISSION_CHECKLIST.flatMap((g) =>
  g.items.map((i) => ({ id: i.id, label: i.text, group: g.title, guideId: ADMISSION_GUIDE_MAP[i.id] }))
);

export interface PatientTracker {
  admission: Record<string, string>; // itemId -> date completed (YYYY-MM-DD)
  reviews: Record<string, string>; // itemId -> date last reviewed (YYYY-MM-DD)
}
export type CareTracker = Record<string, PatientTracker>;

// v2: admission items now derive from the full Admission Checklist (new ids), so
// bump the key to discard any old-shaped tracker and re-seed cleanly.
const KEY = "wardhub_care_tracker_v2";

export function loadTracker(): CareTracker {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveTracker(t: CareTracker): void {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(t));
}

// Whole days from date string `from` to date string `to` (to - from).
export function daysBetween(from: string, to: string): number {
  const a = new Date(from + "T00:00:00").getTime();
  const b = new Date(to + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

// Days until an item is next due (negative = overdue). null if never reviewed.
export function daysUntilDue(lastDone: string | undefined, intervalDays: number, today: string): number | null {
  if (!lastDone) return null;
  return intervalDays - daysBetween(lastDone, today);
}

export type ReviewStatus = "ok" | "due" | "overdue" | "none";

export function reviewStatus(daysUntil: number | null, intervalDays: number): ReviewStatus {
  if (daysUntil === null) return "none";
  if (daysUntil < 0) return "overdue";
  if (daysUntil <= Math.max(2, Math.ceil(intervalDays * 0.2))) return "due";
  return "ok";
}

// Deterministic small integer from a string (so demo seeding is stable, no RNG).
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Seed a patient's tracker from their admission date. Recent admissions (< 7
// days) are left partly done (still being worked through); established patients
// get a realistic spread of in-date / due-soon / overdue items.
export function seedPatient(patientId: string, admissionDate: string, today: string): PatientTracker {
  const daysAdmitted = daysBetween(admissionDate.slice(0, 10), today);
  const h = hash(patientId);
  const admission: Record<string, string> = {};
  const reviews: Record<string, string> = {};

  if (daysAdmitted < 7) {
    // New admission: still working through the checklist - mark a majority done.
    const done = Math.floor(ADMISSION_ITEMS.length * 0.6) + (h % 4);
    ADMISSION_ITEMS.forEach((it, i) => {
      if (i < done) admission[it.id] = admissionDate.slice(0, 10);
    });
    REVIEW_ITEMS.forEach((it) => {
      // only the started items have a baseline review date
      if (admission["care-plan"] && it.id.startsWith("care-plan")) reviews[it.id] = admissionDate.slice(0, 10);
      if (admission["safety-plan"] && it.id === "safety-plan") reviews[it.id] = admissionDate.slice(0, 10);
    });
  } else {
    // Established patient: all admission tasks done.
    ADMISSION_ITEMS.forEach((it) => { admission[it.id] = admissionDate.slice(0, 10); });
    // Spread review dates so some are green, some amber, some overdue.
    REVIEW_ITEMS.forEach((it, i) => {
      const offset = (h >> (i * 2)) % (it.intervalDays + 5); // 0 .. interval+4 days ago
      const d = new Date(today + "T00:00:00");
      d.setDate(d.getDate() - offset);
      reviews[it.id] = toLocalDateStr(d);
    });
  }
  return { admission, reviews };
}

export function admissionProgress(t: PatientTracker | undefined): { done: number; total: number; complete: boolean } {
  const total = ADMISSION_ITEMS.length;
  const done = t ? ADMISSION_ITEMS.filter((it) => t.admission[it.id]).length : 0;
  return { done, total, complete: done === total };
}
