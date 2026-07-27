// Hand-back options and the case-note wording they generate.
// BACKLOG Section M. Every label here is a fixed choice: the whole feature is
// defensible because there is nothing to type, so keep it that way.

import type {
  HandbackState,
  HandbackNext,
  HandbackDestination,
  TaskHandback,
} from "@/lib/types";

export const HANDBACK_STATES: {
  value: HandbackState;
  label: string;
  hint: string;
  /** Tailwind accent for the badge on the card. */
  tone: "slate" | "amber" | "sky" | "rose" | "violet";
}[] = [
  { value: "not_started", label: "Not started", hint: "Claimed it but never got to it", tone: "slate" },
  { value: "part_done", label: "Part done", hint: "Started, more to do", tone: "amber" },
  { value: "waiting", label: "Waiting on someone", hint: "Nothing more you can do until they come back", tone: "sky" },
  { value: "blocked", label: "Blocked", hint: "Cannot go further without a decision", tone: "rose" },
  { value: "needs_check", label: "Done but needs checking", hint: "Finished, wants a second pair of eyes", tone: "violet" },
];

export const HANDBACK_NEXT: { value: HandbackNext; label: string }[] = [
  { value: "chase", label: "Chase it" },
  { value: "send_form", label: "Send the form" },
  { value: "make_call", label: "Make the call" },
  { value: "needs_decision", label: "Needs a decision" },
  { value: "carry_on", label: "Just carry on" },
];

/**
 * Who ends up holding the job. Two options, the same two every time.
 *
 * Earlier versions had three ("on a later day") and hid one of them depending
 * on the state answer - so the question changed shape as you moved through it,
 * which reads as a bug rather than as help (Mike, 27 Jul). WHO holds it and
 * WHEN it comes back are separate questions, so the date is its own field and
 * is always offered - including a future date on a job you keep, which is how
 * you put something in your own diary.
 */
export const HANDBACK_DESTINATIONS: {
  value: HandbackDestination;
  label: string;
  hint: string;
}[] = [
  {
    value: "pool",
    label: "Back to the ward",
    hint: "Unclaimed - anyone on shift can pick it up",
  },
  {
    value: "keep",
    label: "Keep it with me",
    hint: "Stays claimed by you, nobody else picks it up",
  },
];

/**
 * Who we might be waiting on. Grouped for the picker; the six most-used are
 * pinned at the top. Wards can add their own the same way ward settings already
 * handles custom alerts. Forensic/probation deliberately excluded (Mike).
 */
export const WAITING_ON_PINNED = [
  "Doctor / consultant",
  "Social care / MASH",
  "Housing",
  "Pharmacy",
  "OT",
  "Family / next of kin",
];

export const WAITING_ON_GROUPS: { group: string; options: string[] }[] = [
  {
    group: "Ward and trust",
    options: [
      "Doctor / consultant",
      "Named nurse",
      "MDT / ward round",
      "Pharmacy",
      "Bed management",
      "MHA office",
      "Safeguarding team",
      "Estates",
      "IT",
    ],
  },
  {
    group: "Therapies and physical health",
    options: [
      "OT",
      "Physiotherapy",
      "Dietitian",
      "SALT",
      "Psychology / DBT",
      "Tissue viability",
      "Dental",
      "GP or acute hospital",
    ],
  },
  {
    group: "Community and social",
    options: [
      "Social care / MASH",
      "Housing",
      "CPN / care coordinator",
      "CMHT",
      "Early Discharge Team",
      "Placement or care home",
      "Funding panel / CHC",
      "Benefits / DWP",
    ],
  },
  {
    group: "People and logistics",
    options: [
      "Family / next of kin",
      "The patient",
      "Advocacy (IMHA)",
      "Transport",
      "Interpreter",
      "Police",
    ],
  },
  { group: "Other", options: ["Other"] },
];

export const stateLabel = (s: HandbackState) =>
  HANDBACK_STATES.find((x) => x.value === s)?.label ?? s;

export const nextLabel = (n: HandbackNext) =>
  HANDBACK_NEXT.find((x) => x.value === n)?.label ?? n;

export const stateTone = (s: HandbackState) =>
  HANDBACK_STATES.find((x) => x.value === s)?.tone ?? "slate";

/** Badge classes per state, kept next to the tones so they cannot drift. */
export const TONE_CLASSES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-300",
  amber: "bg-amber-100 text-amber-800 border-amber-300",
  sky: "bg-sky-100 text-sky-800 border-sky-300",
  rose: "bg-rose-100 text-rose-800 border-rose-300",
  violet: "bg-violet-100 text-violet-800 border-violet-300",
};

const ukDate = (iso?: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

/**
 * The case note the structured answers generate. Mike's requirement: a progress
 * update reaches the clinical record even when the job is NOT done, and nobody
 * types anything to make that happen.
 *
 * "Other" is the one waiting-on choice that cannot produce a specific line, so
 * it hands the writing back to the person instead of inventing detail.
 */
export function handbackCaseNote(
  handback: TaskHandback,
  opts: { taskTitle: string; patientName?: string; staffName?: string }
): string {
  const { taskTitle, patientName, staffName } = opts;
  const today = ukDate(handback.at);
  const who = staffName ? ` ${staffName}.` : "";
  const patient = patientName ? `${patientName}: ` : "";

  // `dated` marks the branches that already state the date in the body, so the
  // trailing stamp is not added twice.
  let body: string;
  let dated = false;
  switch (handback.state) {
    case "not_started":
      body = `${taskTitle}: not started. Returned to the ward jobs list.`;
      break;
    case "part_done":
      body = `${taskTitle}: started, not yet complete. Returned to the ward jobs list for completion.`;
      break;
    case "waiting": {
      const target = handback.waitingOn && handback.waitingOn !== "Other" ? handback.waitingOn : null;
      const chase = handback.chaseDate ? ` To chase ${ukDate(handback.chaseDate)}.` : "";
      dated = true;
      body = target
        ? `${taskTitle}: awaiting response from ${target}. Contacted ${today}.${chase}`
        : `${taskTitle}: awaiting a response. Contacted ${today}.${chase} [ADD WHO YOU ARE WAITING ON]`;
      break;
    }
    case "blocked":
      body = `${taskTitle}: cannot proceed, needs a decision. Escalated to the MDT.`;
      break;
    case "needs_check":
      body = `${taskTitle}: completed, awaiting checking by a second member of staff.`;
      break;
    default:
      body = `${taskTitle}: handed back.`;
  }

  return `${patient}${body}${dated ? "" : ` ${today}.`}${who}`.replace(/\s+/g, " ").trim();
}

/** One-line summary for the append-only history. Structured choices only. */
export function handbackHistoryDetail(handback: TaskHandback): string {
  const parts = [stateLabel(handback.state)];
  if (handback.state === "waiting" && handback.waitingOn) parts.push(`on ${handback.waitingOn}`);
  parts.push(`next: ${nextLabel(handback.next).toLowerCase()}`);
  parts.push(handback.destination === "keep" ? "kept with them" : "back to the ward");
  if (handback.chaseDate) parts.push(`for ${ukDate(handback.chaseDate)}`);
  return parts.join(", ");
}
