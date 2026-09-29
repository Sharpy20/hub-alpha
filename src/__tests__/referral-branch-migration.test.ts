import legacy from "./fixtures/referrals-before-branch-migration.json";
import golden from "./fixtures/referral-casenotes.golden.json";
import { WORKFLOWS, type WorkflowData, type WorkflowStep } from "@/lib/data/guides/referral-workflows";
import { hasLegacyQuestions, isLegacyQuestionStep, migrateWorkflow } from "@/lib/data/guides/legacy-steps";
import { buildReferralCaseNote, type FixedAnswers } from "@/lib/data/guides/case-note";
import { branchAnswered, branchesOf, validateBranching, visibleSteps, type BranchAnswers } from "@/lib/data/guides/branching";

// The six referrals that were built on the fixed consent / section / S117 / area
// steps, exactly as they were before the move to Question blocks.
const before = legacy as unknown as Record<string, WorkflowData>;
const ids = Object.keys(before);

describe("the built-in referrals now use Question blocks", () => {
  it.each(ids)("%s no longer carries a fixed question step", (id) => {
    expect(hasLegacyQuestions(WORKFLOWS[id].steps)).toBe(false);
  });

  it.each(ids)("%s is what migrating the old version produces", (id) => {
    expect(WORKFLOWS[id]).toEqual(migrateWorkflow(before[id]));
  });

  it.each(ids)("%s keeps the same steps in the same order", (id) => {
    expect(WORKFLOWS[id].steps.map((s) => [s.id, s.type])).toEqual(before[id].steps.map((s) => [s.id, s.type]));
  });

  it.each(ids)("%s passes the branching checks", (id) => {
    expect(validateBranching(WORKFLOWS[id].steps)).toEqual([]);
  });

  it.each(ids)("%s shows every step whatever is answered, as before", (id) => {
    const all = WORKFLOWS[id].steps;
    expect(visibleSteps(all, {})).toEqual(all);
  });
});

describe("migrating is safe to run twice", () => {
  it.each(ids)("%s is unchanged by a second migration", (id) => {
    const once = migrateWorkflow(before[id]);
    expect(migrateWorkflow(once)).toEqual(once);
  });

  it("recognises an unconverted step and a converted one", () => {
    const old = before["safeguarding"].steps.find((s) => s.type === "consent") as WorkflowStep;
    expect(isLegacyQuestionStep(old)).toBe(true);
    const now = WORKFLOWS["safeguarding"].steps.find((s) => s.type === "consent") as WorkflowStep;
    expect(isLegacyQuestionStep(now)).toBe(false);
  });
});

describe("the reader is asked exactly what they were asked before", () => {
  const answersFor = (f: FixedAnswers): BranchAnswers => {
    const out: BranchAnswers = {};
    if (f.area) out.area = f.area;
    if (f.consent) out.consent = f.consent;
    if (f.informed) out.informed = f.informed;
    if (f.section) out.section = f.section;
    if (f.s117) out.s117 = f.s117;
    return out;
  };

  // What the old viewer required before Next would go forward.
  const oldCanProceed = (step: WorkflowStep, f: FixedAnswers) => {
    if (step.type === "consent") return f.consent !== null && (!step.informedQuestion || f.informed !== null);
    if (step.type === "section") return f.section !== "";
    if (step.type === "s117") return f.s117 !== "";
    if (step.type === "area") return f.area !== null;
    return true;
  };

  const combos: FixedAnswers[] = [];
  for (const area of [null, "city", "county"] as const)
    for (const consent of [null, "yes", "no"] as const)
      for (const informed of [null, "yes", "no"] as const)
        for (const section of ["", "informal", "section_3"])
          for (const s117 of ["", "current", "none"]) combos.push({ area, consent, informed, section, s117 });

  it.each(ids)("%s holds the reader on a step until the same answers are given", (id) => {
    const oldSteps = before[id].steps;
    const newSteps = WORKFLOWS[id].steps;
    oldSteps.forEach((oldStep, i) => {
      combos.forEach((f) => {
        expect(branchAnswered(newSteps[i], answersFor(f))).toBe(oldCanProceed(oldStep, f));
      });
    });
  });

  it.each(ids)("%s asks the same number of questions on each step", (id) => {
    WORKFLOWS[id].steps.forEach((s, i) => {
      const old = before[id].steps[i];
      const expected = old.type === "consent" ? (old.informedQuestion ? 2 : 1) : ["section", "s117", "area"].includes(old.type) ? 1 : 0;
      expect(branchesOf(s)).toHaveLength(expected);
    });
  });
});

describe("the case note reads word for word as it did", () => {
  const entries = Object.entries(golden as Record<string, string>);

  it("has a good spread of cases to check", () => {
    expect(entries.length).toBeGreaterThan(500);
  });

  it("matches every recorded note", () => {
    const mismatches: string[] = [];
    let compared = 0;
    for (const [key, expected] of entries) {
      const [id, area, consent, informed, section, s117, name, by] = JSON.parse(key) as [string, "city" | "county" | null, "yes" | "no" | null, "yes" | "no" | null, string, string, string | null, string | null];
      // The old IMHA note skipped the sign-off line when nobody was signed in. The
      // new one always places it. A signed-in user is always present in the app.
      if (id === "imha-advocacy" && by === null) continue;
      // Notes for a question the reader never answered (impossible in the app,
      // where every question is required) show a placeholder, and the placeholder
      // text is now [BRANCH:id] rather than the old bracketed word.
      const oldSteps = before[id].steps;
      const asks = (type: string) => oldSteps.some((s) => s.type === type);
      if (asks("area") && !area) continue;
      if (asks("consent") && !consent) continue;
      if (oldSteps.some((s) => s.informedQuestion) && !informed) continue;
      if (asks("section") && !section) continue;
      if (asks("s117") && !s117) continue;
      const w = WORKFLOWS[id];
      const step = w.steps.find((s) => s.type === "casenote")!;
      const answers: BranchAnswers = {};
      if (area) answers.area = area;
      if (consent) answers.consent = consent;
      if (informed) answers.informed = informed;
      if (section) answers.section = section;
      if (s117) answers.s117 = s117;
      const actual = buildReferralCaseNote({
        guideId: id,
        steps: w.steps,
        step,
        fixed: { area: null, consent: null, informed: null, section: "", s117: "" },
        branch: answers,
        today: "29/09/2026",
        patientName: name ?? undefined,
        by: by ?? undefined,
      });
      compared += 1;
      if (actual !== expected) mismatches.push(`${key}\n  expected: ${expected}\n  actual:   ${actual}`);
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
    expect(compared).toBeGreaterThan(150);
  });
});
