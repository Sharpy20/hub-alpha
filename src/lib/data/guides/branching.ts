// Branching for guides and workflows.
//
// A guide stays ONE flat list of steps. A step can carry a Branch (a question
// with choices), and any LATER step can carry showIf conditions on those
// answers. Paths rejoin by default: a step with no showIf always shows, so two
// routes that diverge and meet again share the steps after the split instead of
// copying them. This is the same shape as the `Choice` column in the guide
// manuscript format.
//
// Conditions may only look BACKWARDS (at a branch on an earlier step). That is
// what keeps step positions stable: answering a branch can only add or remove
// steps after it, never before, so "step 3 of 7" never shuffles under the
// reader's feet.

export interface BranchChoice {
  id: string;
  label: string;
  // One line under the label on the choice card.
  hint?: string;
  // What this answer says in the case note. Falls back to the label.
  note?: string;
}

export interface BranchBlock {
  // Unique across the whole guide, not just the step.
  id: string;
  question: string;
  choices: BranchChoice[];
  // Default true. Set false to let the reader carry on without choosing.
  required?: boolean;
}

export interface StepCondition {
  branch: string;
  // Show the step when the answer is any of these choice ids.
  is: string[];
}

export interface BranchableStep {
  id: string;
  title?: string;
  branch?: BranchBlock;
  showIf?: StepCondition[];
}

export type BranchAnswers = Record<string, string>;

// Walks the steps in order and keeps only those whose conditions hold. An
// answer only counts if the step that asked the question is itself showing, so
// a stale answer from a route the reader has since left cannot leak through.
export function visibleSteps<T extends BranchableStep>(steps: T[], answers: BranchAnswers): T[] {
  const live: BranchAnswers = {};
  const out: T[] = [];
  for (const step of steps) {
    const showing = (step.showIf ?? []).every((c) => {
      const given = live[c.branch];
      return given !== undefined && c.is.includes(given);
    });
    if (!showing) continue;
    out.push(step);
    if (step.branch && answers[step.branch.id] !== undefined) {
      live[step.branch.id] = answers[step.branch.id];
    }
  }
  return out;
}

export function branchAnswered(step: BranchableStep, answers: BranchAnswers): boolean {
  if (!step.branch) return true;
  if (step.branch.required === false) return true;
  const given = answers[step.branch.id];
  return given !== undefined && step.branch.choices.some((c) => c.id === given);
}

export function findBranch(steps: BranchableStep[], branchId: string): BranchBlock | undefined {
  return steps.find((s) => s.branch?.id === branchId)?.branch;
}

// Reads a condition back as words, for the print sheet and the editor:
// "Area is City or County".
export function describeCondition(cond: StepCondition, steps: BranchableStep[]): string {
  const branch = findBranch(steps, cond.branch);
  if (!branch) return `${cond.branch} is ${cond.is.join(" or ")}`;
  const labels = cond.is.map((id) => branch.choices.find((c) => c.id === id)?.label ?? id);
  return `${branch.question} ${labels.join(" or ")}`;
}

export function describeConditions(step: BranchableStep, steps: BranchableStep[]): string {
  return (step.showIf ?? []).map((c) => describeCondition(c, steps)).join(", and ");
}

// Swaps [BRANCH:id] tokens for the chosen answer's case-note wording. An
// unanswered branch leaves its token showing - a visible gap is safer than a
// guess written into a patient record.
export function applyBranchTokens(text: string, steps: BranchableStep[], answers: BranchAnswers): string {
  return text.replace(/\[BRANCH:([\w-]+)\]/g, (whole, id: string) => {
    const branch = findBranch(steps, id);
    const given = answers[id];
    const choice = branch?.choices.find((c) => c.id === given);
    if (!choice) return whole;
    return choice.note ?? choice.label;
  });
}

export function validateBranching(steps: BranchableStep[]): string[] {
  const errors: string[] = [];
  const seenBranch = new Map<string, number>();

  steps.forEach((step, index) => {
    const name = step.title || step.id;

    (step.showIf ?? []).forEach((cond) => {
      const at = seenBranch.get(cond.branch);
      if (at === undefined) {
        const exists = steps.some((s) => s.branch?.id === cond.branch);
        errors.push(
          exists
            ? `"${name}" depends on the question "${cond.branch}", which comes after it. A step can only depend on an earlier question.`
            : `"${name}" depends on a question that does not exist: ${cond.branch}.`
        );
        return;
      }
      if (cond.is.length === 0) {
        errors.push(`"${name}" has a condition with no answers ticked, so it would never show.`);
        return;
      }
      const branch = findBranch(steps, cond.branch);
      cond.is.forEach((id) => {
        if (!branch?.choices.some((c) => c.id === id)) {
          errors.push(`"${name}" waits for an answer that does not exist: ${id}.`);
        }
      });
    });

    if (step.branch) {
      const b = step.branch;
      if (seenBranch.has(b.id)) errors.push(`Two questions share the id "${b.id}".`);
      if (!b.question.trim()) errors.push(`The question on "${name}" is empty.`);
      if (b.choices.length < 2) errors.push(`"${name}" needs at least two choices.`);
      const ids = new Set<string>();
      b.choices.forEach((c) => {
        if (!c.label.trim()) errors.push(`A choice on "${name}" has no label.`);
        if (ids.has(c.id)) errors.push(`"${name}" has two choices with the id "${c.id}".`);
        ids.add(c.id);
      });
      seenBranch.set(b.id, index);
    }
  });

  return errors;
}

// Questions that no later step reacts to. Not an error - a question can exist
// only to feed the case note - but the editor flags it so it is deliberate.
// extraText is guide-level text (the case note) that can also use a token.
export function unusedBranches(steps: BranchableStep[], extraText = ""): string[] {
  const used = new Set<string>();
  steps.forEach((s) => (s.showIf ?? []).forEach((c) => used.add(c.branch)));
  const usedInText = (id: string) =>
    extraText.includes(`[BRANCH:${id}]`) || steps.some((s) => JSON.stringify(s).includes(`[BRANCH:${id}]`));
  return steps
    .filter((s) => s.branch && !used.has(s.branch.id) && !usedInText(s.branch.id))
    .map((s) => s.branch!.id);
}

export interface Route {
  // The answers that produce this route, as { questionId: choiceId }.
  answers: BranchAnswers;
  // Readable: "Which area? Derby City, Adult? Yes". Empty for a guide with no questions.
  label: string;
  steps: string[];
}

const MAX_ROUTES = 64;

// Every distinct route a reader can take, for the editor's route check. Only
// questions on steps that are actually showing multiply the routes, so a
// question inside a branch does not double-count the routes that never reach it.
// Stops at MAX_ROUTES and reports `truncated` rather than freezing the editor.
export function enumerateRoutes<T extends BranchableStep>(steps: T[]): { routes: Route[]; truncated: boolean } {
  const routes: Route[] = [];
  let truncated = false;

  const walk = (answers: BranchAnswers) => {
    if (routes.length >= MAX_ROUTES) {
      truncated = true;
      return;
    }
    const shown = visibleSteps(steps, answers);
    const open = shown.find((s) => s.branch && answers[s.branch.id] === undefined);
    if (!open || !open.branch) {
      routes.push({
        answers,
        label: shown
          .filter((s) => s.branch && answers[s.branch.id])
          .map((s) => {
            const b = s.branch!;
            return `${b.question} ${b.choices.find((c) => c.id === answers[b.id])?.label ?? answers[b.id]}`;
          })
          .join(", "),
        steps: shown.map((s) => s.id),
      });
      return;
    }
    for (const choice of open.branch.choices) walk({ ...answers, [open.branch.id]: choice.id });
    // Skipping an optional question is a route too. "" counts as answered but
    // matches no condition, exactly as the viewer treats an unanswered one.
    if (open.branch.required === false) walk({ ...answers, [open.branch.id]: "" });
  };

  walk({});
  return { routes, truncated };
}
