// The editor's logic, kept apart from its screens so it can be tested.
//
// The editor edits the same objects the viewer reads (GuideData, WorkflowData),
// so nothing is converted on the way in or out. Every function here returns a
// new value and leaves its input alone; fields the editor does not know about
// (a payslip widget, a criteria walk) ride through untouched because steps are
// changed by spreading, never rebuilt.

import type { GuideData, GuideStep } from "./howto-guides";
import { DEFAULT_WORKFLOW, type WorkflowData, type WorkflowStep } from "./referral-workflows";
import {
  validateBranching, unusedBranches,
  type BranchBlock, type BranchChoice, type BranchableStep, type StepCondition,
} from "./branching";
import type { GuideLook, StoredGuide } from "./guide-store";

export type EditorStep = GuideStep | WorkflowStep;

export const DEFAULT_LOOK: GuideLook = {
  icon: "📖",
  gradient: "from-blue-500 to-blue-700",
  category: "Nurse Tools",
};

// Whatever id-shaped thing is needed next: q1, q2, s3. Never reuses a taken one.
export function nextId(prefix: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  let n = 1;
  while (used.has(`${prefix}${n}`)) n += 1;
  return `${prefix}${n}`;
}

// A guide id nobody else is using. Falls back to "guide" when the title has no
// letters in it, and numbers on a clash.
export function uniqueGuideId(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const root = base || "guide";
  if (!used.has(root)) return root;
  let n = 2;
  while (used.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

export function blankGuide(id: string, title: string, look: GuideLook = DEFAULT_LOOK): StoredGuide {
  return {
    kind: "guide",
    id,
    look,
    updatedAt: new Date().toISOString(),
    data: {
      id,
      title,
      description: "",
      steps: [{ id: "s1", title: "First step", content: "" }],
    },
  };
}

// The standard eight-step referral shape (criteria, forms, submission, case
// note, diary reminder, GDPR). Copied from the built-in default so a new
// referral starts the way every other one does.
export function referralTemplate(id: string, title: string, look: GuideLook = DEFAULT_LOOK): StoredGuide {
  const steps = JSON.parse(JSON.stringify(DEFAULT_WORKFLOW.steps)) as WorkflowStep[];
  return {
    kind: "workflow",
    id,
    look,
    updatedAt: new Date().toISOString(),
    data: {
      id,
      title,
      description: "",
      icon: look.icon,
      gradient: look.gradient,
      steps,
    },
  };
}

// Editing a built-in guide means saving a copy under the same id. The copy is
// deep so later edits never reach the shared built-in object.
export function copyOfBuiltIn(
  kind: "guide" | "workflow",
  data: GuideData | WorkflowData,
  look: GuideLook
): StoredGuide {
  const copy = JSON.parse(JSON.stringify(data)) as GuideData & WorkflowData;
  return {
    kind,
    id: data.id,
    look,
    basedOn: data.id,
    updatedAt: new Date().toISOString(),
    data: copy,
  } as StoredGuide;
}

export function newStep(kind: "guide" | "workflow", steps: EditorStep[]): EditorStep {
  const id = nextId("s", steps.map((s) => s.id));
  return kind === "workflow"
    ? ({ id, type: "info", title: "New step", content: "" } as WorkflowStep)
    : ({ id, title: "New step", content: "" } as GuideStep);
}

export function moveStep<T>(steps: T[], from: number, to: number): T[] {
  if (to < 0 || to >= steps.length || from === to) return steps;
  const next = steps.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// A copy of a step for "duplicate". A question is left behind because question
// ids have to stay unique across the guide; conditions are kept.
export function duplicateStep<T extends EditorStep>(step: T, steps: EditorStep[]): T {
  const copy = JSON.parse(JSON.stringify(step)) as T;
  copy.id = nextId("s", steps.map((s) => s.id));
  copy.title = `${step.title} (copy)`;
  delete copy.branch;
  return copy;
}

// ---- The optional blocks a step can switch on -----------------------------

export type BlockName = "tip" | "tldr" | "branch" | "showIf" | "progressive" | "commitTasks";

export function hasBlock(step: EditorStep, block: BlockName): boolean {
  switch (block) {
    case "tip": return typeof (step as GuideStep).tip === "string";
    case "tldr": return typeof (step as GuideStep).tldr === "string";
    case "branch": return !!step.branch;
    case "showIf": return !!step.showIf && step.showIf.length > 0;
    case "progressive": return step.progressive === true;
    case "commitTasks": return !!(step as GuideStep).commitTasks;
  }
}

export function addBranch(step: EditorStep, steps: EditorStep[]): EditorStep {
  const taken = steps.flatMap((s) => (s.branch ? [s.branch.id] : []));
  const branch: BranchBlock = {
    id: nextId("q", taken),
    question: "",
    choices: [
      { id: "c1", label: "" },
      { id: "c2", label: "" },
    ],
  };
  return { ...step, branch };
}

export function addChoice(branch: BranchBlock): BranchBlock {
  return { ...branch, choices: [...branch.choices, { id: nextId("c", branch.choices.map((c) => c.id)), label: "" }] };
}

export function updateChoice(branch: BranchBlock, id: string, patch: Partial<BranchChoice>): BranchBlock {
  return { ...branch, choices: branch.choices.map((c) => (c.id === id ? { ...c, ...patch } : c)) };
}

export function removeChoice(branch: BranchBlock, id: string): BranchBlock {
  return { ...branch, choices: branch.choices.filter((c) => c.id !== id) };
}

// Steps that hang off a question. The editor warns before the question is
// removed, because those steps would be left waiting on something that is gone.
export function dependantsOf(steps: EditorStep[], branchId: string): EditorStep[] {
  return steps.filter((s) => (s.showIf ?? []).some((c) => c.branch === branchId));
}

// Questions a step is allowed to depend on: those on earlier steps only.
export function questionsBefore(steps: EditorStep[], index: number): { stepTitle: string; branch: BranchBlock }[] {
  return steps
    .slice(0, index)
    .flatMap((s) => (s.branch ? [{ stepTitle: s.title, branch: s.branch }] : []));
}

export function addCondition(step: EditorStep, steps: EditorStep[]): EditorStep {
  const index = steps.findIndex((s) => s.id === step.id);
  const options = questionsBefore(steps, index < 0 ? steps.length : index);
  if (options.length === 0) return step;
  const first = options[0].branch;
  const cond: StepCondition = { branch: first.id, is: first.choices[0] ? [first.choices[0].id] : [] };
  return { ...step, showIf: [...(step.showIf ?? []), cond] };
}

export function setConditionBranch(step: EditorStep, at: number, branch: BranchBlock): EditorStep {
  const showIf = (step.showIf ?? []).map((c, i) =>
    i === at ? { branch: branch.id, is: branch.choices[0] ? [branch.choices[0].id] : [] } : c
  );
  return { ...step, showIf };
}

export function toggleConditionChoice(step: EditorStep, at: number, choiceId: string): EditorStep {
  const showIf = (step.showIf ?? []).map((c, i) => {
    if (i !== at) return c;
    const is = c.is.includes(choiceId) ? c.is.filter((x) => x !== choiceId) : [...c.is, choiceId];
    return { ...c, is };
  });
  return { ...step, showIf };
}

export function removeCondition(step: EditorStep, at: number): EditorStep {
  const showIf = (step.showIf ?? []).filter((_, i) => i !== at);
  return showIf.length === 0 ? removeBlock(step, "showIf") : { ...step, showIf };
}

// Turning a block off removes its field entirely, so a switched-off block leaves
// no trace in the saved guide.
export function removeBlock(step: EditorStep, block: BlockName): EditorStep {
  const next = { ...step } as Record<string, unknown>;
  delete next[block];
  return next as unknown as EditorStep;
}

export function addBlock(step: EditorStep, block: BlockName, steps: EditorStep[]): EditorStep {
  switch (block) {
    case "tip": return { ...step, tip: "" } as EditorStep;
    case "tldr": return { ...step, tldr: "" } as EditorStep;
    case "branch": return addBranch(step, steps);
    case "showIf": return addCondition(step, steps);
    case "progressive": return { ...step, progressive: true };
    case "commitTasks": return { ...step, commitTasks: [] } as EditorStep;
  }
}

// ---- Checking a guide before it is trusted --------------------------------

export interface Finding {
  level: "error" | "warning";
  text: string;
}

const BRANCH_TOKEN = /\[BRANCH:([\w-]+)\]/g;

export function checkGuide(g: StoredGuide): Finding[] {
  const out: Finding[] = [];
  const err = (text: string) => out.push({ level: "error", text });
  const warn = (text: string) => out.push({ level: "warning", text });
  const steps = g.data.steps as EditorStep[];

  if (!g.data.title.trim()) err("The guide needs a title.");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(g.id)) err("The web address can only use lower case letters, numbers and hyphens.");
  if (steps.length === 0) err("The guide has no steps.");

  const ids = new Set<string>();
  steps.forEach((s, i) => {
    const name = s.title.trim() || `Step ${i + 1}`;
    if (ids.has(s.id)) err(`Two steps share the id "${s.id}".`);
    ids.add(s.id);
    if (!s.title.trim()) err(`Step ${i + 1} has no title.`);
    if (!s.content.trim()) warn(`"${name}" has no text.`);
  });

  validateBranching(steps as BranchableStep[]).forEach(err);

  const caseText = g.kind === "guide" ? (g.data.caseNote ?? "") : "";
  unusedBranches(steps as BranchableStep[], caseText).forEach((id) => {
    const owner = steps.find((s) => s.branch?.id === id);
    warn(`Nothing changes with the answer to "${owner?.branch?.question || id}". Fine if it is only there for the case note.`);
  });

  const known = new Set(steps.flatMap((s) => (s.branch ? [s.branch.id] : [])));
  const texts = [
    caseText,
    ...steps.map((s) => (s as WorkflowStep).clipboardText ?? ""),
  ];
  texts.forEach((text) => {
    for (const m of text.matchAll(BRANCH_TOKEN)) {
      if (!known.has(m[1])) err(`The case note uses [BRANCH:${m[1]}], but no question has that id.`);
    }
  });

  return out;
}

export const errorsOf = (findings: Finding[]) => findings.filter((f) => f.level === "error");

// What the editor can do with each field the built-in guides use. `editable`
// fields have a control on screen. `keptAsIs` fields have no control but are
// carried through a save untouched, so opening a built-in guide in the editor
// and saving it never drops them. A test walks every built-in guide and fails if
// one of them uses a field that is in neither list.
export const EDITOR_COVERAGE = {
  guide: {
    editable: ["id", "title", "description", "steps", "caseNote", "noCaseNote", "related", "downloads", "focus", "sources"],
    keptAsIs: [] as string[],
  },
  guideStep: {
    editable: ["id", "title", "content", "tip", "tldr", "progressive", "commitTasks", "branch", "showIf"],
    keptAsIs: ["widget"],
  },
  workflow: {
    editable: ["id", "title", "description", "icon", "gradient", "steps"],
    keptAsIs: [] as string[],
  },
  workflowStep: {
    editable: [
      "id", "type", "title", "content", "progressive", "branch", "showIf",
      "checkboxLabel", "clipboardText", "forms", "methods",
      "consentYesLabel", "consentYesDesc", "consentYesNote", "consentNoLabel", "consentNoDesc", "consentNoNote",
      "informedQuestion", "informedYesLabel", "informedYesNote", "informedNoLabel", "informedNoNote",
    ],
    keptAsIs: ["walk", "isDynamic"],
  },
  forms: { editable: ["blank", "wagoll", "otherGuides"], keptAsIs: [] as string[] },
  formEntry: { editable: ["label", "url", "icon", "note", "area"], keptAsIs: [] as string[] },
  method: { editable: ["type", "label", "value", "area"], keptAsIs: [] as string[] },
  commitTask: { editable: ["id", "title", "day", "when", "category", "priority", "optional"], keptAsIs: [] as string[] },
  focus: { editable: ["label", "url"], keptAsIs: [] as string[] },
  related: { editable: ["label", "guideId"], keptAsIs: [] as string[] },
  source: { editable: ["n", "label", "url"], keptAsIs: [] as string[] },
} as const;
