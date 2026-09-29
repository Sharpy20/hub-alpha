// Turns the older fixed question steps (consent, MHA section, S117 status,
// council area) into ordinary Question blocks.
//
// Those four step types each carried their own state and their own screen in
// the viewer. A Question block does the same job for any guide, so the fixed
// types are being retired. The step keeps its `type` for its colour and icon; it
// stops carrying behaviour.
//
// The ids and choice ids deliberately match what the fixed steps used
// ("area" with "city"/"county", "consent" with "yes"/"no"), so forms and
// submission methods that filter by area carry on working unchanged.

import {
  AREA_OPTIONS, S117_OPTIONS, SECTION_OPTIONS,
  type WorkflowData, type WorkflowStep,
} from "./referral-workflows";
import type { BranchBlock, BranchChoice } from "./branching";

const LEGACY_TYPES: WorkflowStep["type"][] = ["consent", "section", "s117", "area"];

// A fixed question step that has not been converted yet.
export function isLegacyQuestionStep(step: WorkflowStep): boolean {
  return LEGACY_TYPES.includes(step.type) && !step.branch;
}

export function hasLegacyQuestions(steps: WorkflowStep[]): boolean {
  return steps.some(isLegacyQuestionStep);
}

const LEGACY_FIELDS = [
  "consentYesLabel", "consentYesDesc", "consentYesNote",
  "consentNoLabel", "consentNoDesc", "consentNoNote",
  "informedQuestion", "informedYesLabel", "informedYesNote", "informedNoLabel", "informedNoNote",
] as const;

// Some referrals write their note in a form of words of their own. IMHA is the
// one: the area name and its email go into the sentence, and the legal status
// reads "Patient is informal" or "Patient is detained under ...".
interface NoteStyle {
  areaNote?: Record<string, string>;
  sectionNote?: (option: (typeof SECTION_OPTIONS)[number]) => string;
}

const IMHA_STYLE: NoteStyle = {
  areaNote: {
    city: "Derby City IMHA (Disability Direct) via email to info@disabilitydirect.com",
    county: "Derbyshire County IMHA (Cloverleaf) via email to referrals@cloverleaf-advocacy.co.uk",
  },
  sectionNote: (o) => (o.value === "informal" ? "Patient is informal (voluntary)" : `Patient is detained under ${o.label}`),
};

const IMHA_NOTE =
  "Referral for IMHA sent to [BRANCH:area] on [DATE]. [BRANCH:section] and would benefit from independent advocacy support. [BRANCH:consent] Referral completed by [NURSE].";

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function withKeys<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

function questionsFor(step: WorkflowStep, style: NoteStyle): BranchBlock[] {
  switch (step.type) {
    case "consent": {
      const consent: BranchBlock = {
        id: "consent",
        question: step.title,
        choices: [
          withKeys<BranchChoice>({
            id: "yes",
            label: step.consentYesLabel ?? "Consent Obtained",
            hint: step.consentYesDesc ?? "I have asked and consent has been given",
            note: step.consentYesNote,
          }),
          withKeys<BranchChoice>({
            id: "no",
            label: step.consentNoLabel ?? "No Consent",
            hint: step.consentNoDesc ?? "Consent declined or could not be obtained (referral can still proceed)",
            note: step.consentNoNote,
          }),
        ],
      };
      if (!step.informedQuestion) return [consent];
      const informed: BranchBlock = {
        id: "informed",
        question: step.informedQuestion,
        choices: [
          withKeys<BranchChoice>({ id: "yes", label: step.informedYesLabel ?? "Informed", note: step.informedYesNote }),
          withKeys<BranchChoice>({ id: "no", label: step.informedNoLabel ?? "Not informed", note: step.informedNoNote }),
        ],
      };
      return [consent, informed];
    }
    case "section":
      return [{
        id: "section",
        question: step.title,
        choices: SECTION_OPTIONS.map((o) => withKeys<BranchChoice>({ id: o.value, label: o.label, note: style.sectionNote?.(o) })),
      }];
    case "s117":
      return [{
        id: "s117",
        question: step.title,
        choices: S117_OPTIONS.map((o) => ({
          id: o.value,
          label: o.label,
          hint: o.description,
          note: o.entitled
            ? `Patient has S117 aftercare entitlement (${lowerFirst(o.label)}) - a S117 aftercare meeting is required before discharge.`
            : "Patient has no qualifying section, so no S117 aftercare entitlement; standard Care Act route.",
          explain: o.entitled
            ? "S117 pathway - a S117 aftercare meeting is required before discharge (7 days notice), as well as this referral.\nThis is separate from the discharge planning meeting every patient should have. The two are often held together."
            : "Standard Care Act pathway - no S117 aftercare meeting needed.\nThe patient should still have a discharge planning meeting before they leave.",
          explainTone: o.entitled ? ("caution" as const) : ("neutral" as const),
        })),
      }];
    case "area":
      return [{
        id: "area",
        question: step.title,
        choices: AREA_OPTIONS.map((o) => withKeys<BranchChoice>({ id: o.value, label: o.label, hint: o.description, note: style.areaNote?.[o.value] })),
      }];
    default:
      return [];
  }
}

// The placeholders the fixed steps filled in, and the question that fills each
// now. Only rewritten when the workflow has that question.
const TOKENS: [RegExp, string, string][] = [
  [/\[CONSENT\]/g, "consent", "[BRANCH:consent]"],
  [/\[INFORMED\]/g, "informed", "[BRANCH:informed]"],
  [/\[DERBY CITY\/DERBYSHIRE COUNTY\]/g, "area", "[BRANCH:area]"],
  [/\[DERBY\/COUNTY\]/g, "area", "[BRANCH:area]"],
  [/\[S117\]/g, "s117", "[BRANCH:s117]"],
  [/\[SECTION\]/g, "section", "[BRANCH:section]"],
];

export function migrateWorkflow(w: WorkflowData): WorkflowData {
  const style = w.id === "imha-advocacy" ? IMHA_STYLE : {};

  const asked = new Set<string>();
  const steps = w.steps.map((step) => {
    if (!isLegacyQuestionStep(step)) return step;
    const [first, ...rest] = questionsFor(step, style);
    if (!first) return step;
    [first, ...rest].forEach((b) => asked.add(b.id));
    const next = { ...step } as Record<string, unknown>;
    LEGACY_FIELDS.forEach((k) => delete next[k]);
    next.branch = first;
    if (rest.length > 0) next.alsoAsk = rest;
    return next as unknown as WorkflowStep;
  });

  const rewrite = (text: string) => TOKENS.reduce((acc, [pattern, id, to]) => (asked.has(id) ? acc.replace(pattern, to) : acc), text);

  const out = steps.map((step) => {
    let next = step;
    if (step.clipboardText) next = { ...next, clipboardText: rewrite(step.clipboardText) };
    if (step.content) next = { ...next, content: rewrite(step.content) };
    return next;
  });

  if (w.id === "imha-advocacy") {
    return {
      ...w,
      steps: out.map((s) => {
        if (s.type !== "casenote" || !s.isDynamic) return s;
        const rest = { ...s } as Record<string, unknown>;
        delete rest.isDynamic;
        return { ...(rest as unknown as WorkflowStep), clipboardText: IMHA_NOTE };
      }),
    };
  }
  return { ...w, steps: out };
}
