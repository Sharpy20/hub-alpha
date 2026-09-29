import { GUIDES } from "@/lib/data/guides/howto-guides";
import { WORKFLOWS } from "@/lib/data/guides/referral-workflows";
import { visibleSteps, enumerateRoutes } from "@/lib/data/guides/branching";
import { isStoredGuide, type StoredGuide } from "@/lib/data/guides/guide-store";
import {
  EDITOR_COVERAGE, DEFAULT_LOOK, blankGuide, referralTemplate, copyOfBuiltIn, newStep,
  addBlock, removeBlock, hasBlock, addBranch, addChoice, updateChoice, removeChoice,
  addCondition, setConditionBranch, toggleConditionChoice, removeCondition, questionsBefore,
  dependantsOf, applyQuestionPreset, moveStep, duplicateStep, nextId, uniqueGuideId, checkGuide, errorsOf,
  type EditorStep,
} from "@/lib/data/guides/editor-model";

const keysOf = (objs: object[]) => new Set(objs.flatMap((o) => Object.keys(o)));
const covered = (used: Set<string>, c: { editable: readonly string[]; keptAsIs: readonly string[] }) =>
  [...used].filter((k) => !c.editable.includes(k) && !c.keptAsIs.includes(k));

describe("the editor covers every field the built-in guides use", () => {
  const guides = Object.values(GUIDES);
  const workflows = Object.values(WORKFLOWS);
  const wfSteps = workflows.flatMap((w) => w.steps);
  const gSteps = guides.flatMap((g) => g.steps);

  it("guide level", () => expect(covered(keysOf(guides), EDITOR_COVERAGE.guide)).toEqual([]));
  it("guide steps", () => expect(covered(keysOf(gSteps), EDITOR_COVERAGE.guideStep)).toEqual([]));
  it("workflow level", () => expect(covered(keysOf(workflows), EDITOR_COVERAGE.workflow)).toEqual([]));
  it("workflow steps", () => expect(covered(keysOf(wfSteps), EDITOR_COVERAGE.workflowStep)).toEqual([]));
  it("forms and their entries", () => {
    const forms = wfSteps.flatMap((s) => (s.forms ? [s.forms] : []));
    expect(covered(keysOf(forms), EDITOR_COVERAGE.forms)).toEqual([]);
    const entries = forms.flatMap((f) => [...f.blank, ...f.wagoll, ...f.otherGuides]);
    expect(covered(keysOf(entries), EDITOR_COVERAGE.formEntry)).toEqual([]);
  });
  it("submission methods", () => {
    expect(covered(keysOf(wfSteps.flatMap((s) => s.methods ?? [])), EDITOR_COVERAGE.method)).toEqual([]);
  });
  it("diary jobs, FOCUS links, related guides and sources", () => {
    expect(covered(keysOf(gSteps.flatMap((s) => s.commitTasks ?? [])), EDITOR_COVERAGE.commitTask)).toEqual([]);
    expect(covered(keysOf(guides.flatMap((g) => g.focus ?? [])), EDITOR_COVERAGE.focus)).toEqual([]);
    expect(covered(keysOf(guides.flatMap((g) => g.related ?? [])), EDITOR_COVERAGE.related)).toEqual([]);
    expect(covered(keysOf(guides.flatMap((g) => g.sources ?? [])), EDITOR_COVERAGE.source)).toEqual([]);
  });
});

describe("opening a built-in guide in the editor", () => {
  const look = { icon: "x", gradient: "g", category: "c" };

  it("gives a deep copy, so editing never reaches the built-in", () => {
    const copy = copyOfBuiltIn("guide", GUIDES.news2, look);
    (copy.data as typeof GUIDES.news2).steps[0].title = "Changed";
    expect(GUIDES.news2.steps[0].title).not.toBe("Changed");
    expect(copy.basedOn).toBe("news2");
  });

  it("produces something the store accepts, for every built-in guide", () => {
    const all: StoredGuide[] = [
      ...Object.values(GUIDES).map((g) => copyOfBuiltIn("guide", g, look)),
      ...Object.values(WORKFLOWS).map((w) => copyOfBuiltIn("workflow", w, look)),
    ];
    expect(all.length).toBeGreaterThan(50);
    all.forEach((g) => expect(isStoredGuide(g)).toBe(true));
  });

  it("keeps fields it has no control for, through a JSON save", () => {
    const payslip = copyOfBuiltIn("guide", GUIDES.payslip, look);
    const back = JSON.parse(JSON.stringify(payslip)) as StoredGuide;
    const widgets = (back.data.steps as { widget?: string }[]).filter((s) => s.widget).length;
    expect(widgets).toBeGreaterThan(0);
  });

  it("raises no errors on any built-in guide", () => {
    const all: StoredGuide[] = [
      ...Object.values(GUIDES).map((g) => copyOfBuiltIn("guide", g, look)),
      ...Object.values(WORKFLOWS).map((w) => copyOfBuiltIn("workflow", w, look)),
    ];
    const bad = all.map((g) => ({ id: g.id, errors: errorsOf(checkGuide(g)).map((e) => e.text) })).filter((x) => x.errors.length);
    expect(bad).toEqual([]);
  });

  it("every built-in guide has exactly one route, as it did before branching", () => {
    Object.values(GUIDES).forEach((g) => expect(enumerateRoutes(g.steps).routes).toHaveLength(1));
    Object.values(WORKFLOWS).forEach((w) => expect(enumerateRoutes(w.steps).routes).toHaveLength(1));
  });
});

describe("new guides", () => {
  it("starts a blank guide with one step and no errors", () => {
    const g = blankGuide("my-guide", "My guide");
    expect(g.data.steps).toHaveLength(1);
    expect(errorsOf(checkGuide(g))).toEqual([]);
  });

  it("starts a referral from the standard template, as its own copy", () => {
    const g = referralTemplate("my-referral", "My referral");
    expect(g.kind).toBe("workflow");
    expect(g.data.steps.map((s) => (s as { type: string }).type)).toEqual([
      "criteria", "forms", "submission", "casenote", "reminder", "gdpr",
    ]);
    (g.data.steps[0] as { title: string }).title = "Changed";
    expect(WORKFLOWS["imha-advocacy"].steps[0].title).not.toBe("Changed");
  });

  it("picks ids that do not clash", () => {
    expect(nextId("s", ["s1", "s2", "s4"])).toBe("s3");
    expect(uniqueGuideId("news2", ["news2"])).toBe("news2-2");
    expect(uniqueGuideId("", [])).toBe("guide");
  });
});

describe("blocks", () => {
  const base = blankGuide("g", "G");
  const steps = base.data.steps as EditorStep[];

  it("adds and removes a tip without leaving a trace", () => {
    const on = addBlock(steps[0], "tip", steps);
    expect(hasBlock(on, "tip")).toBe(true);
    const off = removeBlock(on, "tip");
    expect(hasBlock(off, "tip")).toBe(false);
    expect("tip" in off).toBe(false);
  });

  it("adds a question with two empty choices and a fresh id", () => {
    const q = addBranch(steps[0], steps);
    expect(q.branch?.id).toBe("q1");
    expect(q.branch?.choices).toHaveLength(2);
    const second = addBranch(newStep("guide", steps), [q, ...steps]);
    expect(second.branch?.id).toBe("q2");
  });

  it("adds, edits and removes choices", () => {
    let b = addBranch(steps[0], steps).branch!;
    b = addChoice(b);
    expect(b.choices.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
    b = updateChoice(b, "c2", { label: "Two", note: "note two" });
    expect(b.choices[1]).toMatchObject({ label: "Two", note: "note two" });
    b = removeChoice(b, "c1");
    expect(b.choices.map((c) => c.id)).toEqual(["c2", "c3"]);
  });
});

describe("conditions", () => {
  const withQuestion = (): EditorStep[] => {
    const q = addBranch({ id: "s1", title: "Ask", content: "x" } as EditorStep, []);
    const b = { ...q.branch!, question: "Area?", choices: [{ id: "c1", label: "City" }, { id: "c2", label: "County" }] };
    return [{ ...q, branch: b }, { id: "s2", title: "After", content: "y" } as EditorStep];
  };

  it("cannot add a condition when no earlier question exists", () => {
    const steps: EditorStep[] = [{ id: "s1", title: "A", content: "" } as EditorStep];
    expect(addCondition(steps[0], steps)).toBe(steps[0]);
  });

  it("only offers earlier questions", () => {
    const steps = withQuestion();
    expect(questionsBefore(steps, 0)).toHaveLength(0);
    expect(questionsBefore(steps, 1)).toHaveLength(1);
  });

  it("adds a condition on the nearest question with its first choice ticked", () => {
    const steps = withQuestion();
    const step = addCondition(steps[1], steps);
    expect(step.showIf).toEqual([{ branch: "q1", is: ["c1"] }]);
    expect(visibleSteps([steps[0], step], { q1: "c1" })).toHaveLength(2);
    expect(visibleSteps([steps[0], step], { q1: "c2" })).toHaveLength(1);
  });

  it("ticks and unticks choices, and removes the whole condition", () => {
    const steps = withQuestion();
    let step = addCondition(steps[1], steps);
    step = toggleConditionChoice(step, 0, "c2");
    expect(step.showIf?.[0].is).toEqual(["c1", "c2"]);
    step = toggleConditionChoice(step, 0, "c1");
    expect(step.showIf?.[0].is).toEqual(["c2"]);
    step = removeCondition(step, 0);
    expect(hasBlock(step, "showIf")).toBe(false);
    expect("showIf" in step).toBe(false);
  });

  it("re-points a condition at another question and resets its choices", () => {
    const steps = withQuestion();
    const step = addCondition(steps[1], steps);
    const other = { id: "q9", question: "Other?", choices: [{ id: "z1", label: "Z" }, { id: "z2", label: "Y" }] };
    expect(setConditionBranch(step, 0, other).showIf).toEqual([{ branch: "q9", is: ["z1"] }]);
  });

  it("names the steps that depend on a question", () => {
    const steps = withQuestion();
    const dependent = addCondition(steps[1], steps);
    expect(dependantsOf([steps[0], dependent], "q1").map((s) => s.id)).toEqual(["s2"]);
    expect(dependantsOf(steps, "q1")).toEqual([]);
  });
});

describe("moving and duplicating steps", () => {
  it("moves a step and ignores an impossible move", () => {
    expect(moveStep(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveStep(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveStep(["a", "b"], 1, 5)).toEqual(["a", "b"]);
  });

  it("duplicates a step with a new id and without its question", () => {
    const base = blankGuide("g", "G").data.steps as EditorStep[];
    const q = addBranch(base[0], base);
    const copy = duplicateStep(q, [q]);
    expect(copy.id).not.toBe(q.id);
    expect(copy.branch).toBeUndefined();
    expect(copy.title).toBe("First step (copy)");
  });

  it("checkGuide flags a question moved below the step that depends on it", () => {
    const g = blankGuide("g", "G");
    const q = addBranch(g.data.steps[0] as EditorStep, g.data.steps as EditorStep[]);
    const b = { ...q.branch!, question: "Q?", choices: [{ id: "c1", label: "A" }, { id: "c2", label: "B" }] };
    const asks = { ...q, branch: b };
    const dep = { ...addCondition({ id: "s2", title: "Dep", content: "t" } as EditorStep, [asks]), title: "Dep", content: "t" };
    g.data.steps = [asks, dep] as never;
    expect(errorsOf(checkGuide(g))).toEqual([]);
    g.data.steps = [dep, asks] as never;
    expect(errorsOf(checkGuide(g)).map((e) => e.text).join(" ")).toMatch(/comes after it/);
  });
});

describe("checkGuide", () => {
  it("rejects a bad web address and an empty title", () => {
    const g = blankGuide("Bad Id!", "");
    const text = errorsOf(checkGuide(g)).map((e) => e.text).join(" ");
    expect(text).toMatch(/web address/);
    expect(text).toMatch(/needs a title/);
  });

  it("warns, but does not error, on a step with no text", () => {
    const findings = checkGuide(blankGuide("g", "G"));
    expect(findings.some((f) => f.level === "warning" && /no text/.test(f.text))).toBe(true);
    expect(errorsOf(findings)).toEqual([]);
  });

  it("errors on a case note token for a question that does not exist", () => {
    const g = blankGuide("g", "G");
    g.data.steps[0].content = "text";
    (g.data as { caseNote?: string }).caseNote = "Sent to [BRANCH:nope].";
    expect(errorsOf(checkGuide(g)).map((e) => e.text).join(" ")).toMatch(/BRANCH:nope/);
  });

  it("does not warn about a question the case note uses", () => {
    const g = blankGuide("g", "G");
    const steps = g.data.steps as EditorStep[];
    const q = addBranch(steps[0], steps);
    g.data.steps = [{ ...q, content: "t", branch: { ...q.branch!, question: "Q?", choices: [{ id: "c1", label: "A" }, { id: "c2", label: "B" }] } }] as never;
    (g.data as { caseNote?: string }).caseNote = "Via [BRANCH:q1].";
    expect(checkGuide(g).filter((f) => /Nothing changes/.test(f.text))).toEqual([]);
  });
});

describe("look", () => {
  it("has a default look for a new guide", () => {
    expect(blankGuide("g", "G").look).toEqual(DEFAULT_LOOK);
  });
});

describe("question presets", () => {
  const blank = () => {
    const steps = blankGuide("g", "G").data.steps as EditorStep[];
    return addBranch(steps[0], steps).branch!;
  };

  it("fills yes or no and keeps the choice ids", () => {
    const b = applyQuestionPreset(blank(), "yesno");
    expect(b.choices.map((c) => [c.id, c.label])).toEqual([["c1", "Yes"], ["c2", "No"]]);
  });

  it("fills the two council areas with case note wording", () => {
    const b = applyQuestionPreset(blank(), "area");
    expect(b.choices.map((c) => c.note)).toEqual(["Derby City", "Derbyshire County"]);
  });

  it("ignores an unknown preset", () => {
    const b = blank();
    expect(applyQuestionPreset(b, "nope")).toBe(b);
  });
});
