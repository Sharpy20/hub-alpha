import {
  visibleSteps, branchAnswered, applyBranchTokens, validateBranching,
  describeConditions, unusedBranches, enumerateRoutes, type BranchableStep,
} from "@/lib/data/guides/branching";

const area = {
  id: "area",
  question: "Which area?",
  choices: [
    { id: "city", label: "Derby City", note: "Derby City" },
    { id: "county", label: "Derbyshire County" },
  ],
};

// intro, ask area, city only, county only, everyone
const steps: BranchableStep[] = [
  { id: "intro", title: "Intro" },
  { id: "ask", title: "Ask", branch: area },
  { id: "city-step", title: "City", showIf: [{ branch: "area", is: ["city"] }] },
  { id: "county-step", title: "County", showIf: [{ branch: "area", is: ["county"] }] },
  { id: "everyone", title: "Everyone" },
];

const ids = (list: BranchableStep[]) => list.map((s) => s.id);
const yesNo = [{ id: "y", label: "Yes" }, { id: "n", label: "No" }];

describe("visibleSteps", () => {
  it("shows every unconditional step and hides conditional ones before an answer", () => {
    expect(ids(visibleSteps(steps, {}))).toEqual(["intro", "ask", "everyone"]);
  });

  it("follows the chosen route and rejoins afterwards", () => {
    expect(ids(visibleSteps(steps, { area: "city" }))).toEqual(["intro", "ask", "city-step", "everyone"]);
    expect(ids(visibleSteps(steps, { area: "county" }))).toEqual(["intro", "ask", "county-step", "everyone"]);
  });

  it("leaves a guide with no branching exactly as it was", () => {
    const plain: BranchableStep[] = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(visibleSteps(plain, {})).toEqual(plain);
  });

  it("keeps step positions before the branch stable whatever is answered", () => {
    const before = ids(visibleSteps(steps, {})).slice(0, 2);
    expect(ids(visibleSteps(steps, { area: "city" })).slice(0, 2)).toEqual(before);
    expect(ids(visibleSteps(steps, { area: "county" })).slice(0, 2)).toEqual(before);
  });

  it("ignores a stale answer when the question's own step is hidden", () => {
    const nested: BranchableStep[] = [
      { id: "q1", branch: { id: "adult", question: "Adult?", choices: yesNo } },
      { id: "q2", showIf: [{ branch: "adult", is: ["y"] }], branch: { id: "carer", question: "Carer?", choices: yesNo } },
      { id: "carer-step", showIf: [{ branch: "carer", is: ["y"] }] },
    ];
    // Reader once said adult and carer, then went back and changed adult to no.
    expect(ids(visibleSteps(nested, { adult: "n", carer: "y" }))).toEqual(["q1"]);
    expect(ids(visibleSteps(nested, { adult: "y", carer: "y" }))).toEqual(["q1", "q2", "carer-step"]);
  });

  it("needs every condition on a step to hold", () => {
    const both: BranchableStep[] = [
      { id: "a", branch: { id: "x", question: "X?", choices: yesNo } },
      { id: "b", branch: { id: "y", question: "Y?", choices: yesNo } },
      { id: "c", showIf: [{ branch: "x", is: ["y"] }, { branch: "y", is: ["n"] }] },
    ];
    expect(ids(visibleSteps(both, { x: "y", y: "n" }))).toContain("c");
    expect(ids(visibleSteps(both, { x: "y", y: "y" }))).not.toContain("c");
  });
});

describe("branchAnswered", () => {
  it("blocks progress until a required question is answered", () => {
    expect(branchAnswered(steps[1], {})).toBe(false);
    expect(branchAnswered(steps[1], { area: "city" })).toBe(true);
  });
  it("rejects an answer that is not one of the choices", () => {
    expect(branchAnswered(steps[1], { area: "nowhere" })).toBe(false);
  });
  it("lets an optional question be skipped", () => {
    const optional = { id: "o", branch: { ...area, required: false } };
    expect(branchAnswered(optional, {})).toBe(true);
  });
  it("is always true for a step without a question", () => {
    expect(branchAnswered(steps[0], {})).toBe(true);
  });
});

describe("applyBranchTokens", () => {
  it("uses the note where there is one and the label where there is not", () => {
    expect(applyBranchTokens("Sent to [BRANCH:area].", steps, { area: "city" })).toBe("Sent to Derby City.");
    expect(applyBranchTokens("Sent to [BRANCH:area].", steps, { area: "county" })).toBe("Sent to Derbyshire County.");
  });
  it("leaves the token showing when the question is unanswered", () => {
    expect(applyBranchTokens("Sent to [BRANCH:area].", steps, {})).toBe("Sent to [BRANCH:area].");
  });
  it("leaves an unknown token alone", () => {
    expect(applyBranchTokens("[BRANCH:nope]", steps, { nope: "x" })).toBe("[BRANCH:nope]");
  });
});

describe("validateBranching", () => {
  it("passes a well-formed guide", () => {
    expect(validateBranching(steps)).toEqual([]);
  });
  it("passes a guide with no branching", () => {
    expect(validateBranching([{ id: "a" }, { id: "b" }])).toEqual([]);
  });
  it("rejects a condition on a question that comes later", () => {
    const bad = [steps[2], steps[1]];
    expect(validateBranching(bad).join(" ")).toMatch(/comes after it/);
  });
  it("rejects a condition on a question that does not exist", () => {
    const bad: BranchableStep[] = [{ id: "a", title: "A", showIf: [{ branch: "ghost", is: ["x"] }] }];
    expect(validateBranching(bad).join(" ")).toMatch(/does not exist/);
  });
  it("rejects a condition waiting for a choice that does not exist", () => {
    const bad: BranchableStep[] = [steps[1], { id: "z", title: "Z", showIf: [{ branch: "area", is: ["moon"] }] }];
    expect(validateBranching(bad).join(" ")).toMatch(/answer that does not exist: moon/);
  });
  it("rejects a condition with no answers ticked", () => {
    const bad: BranchableStep[] = [steps[1], { id: "z", title: "Z", showIf: [{ branch: "area", is: [] }] }];
    expect(validateBranching(bad).join(" ")).toMatch(/never show/);
  });
  it("rejects a question with fewer than two choices", () => {
    const bad: BranchableStep[] = [{ id: "q", title: "Q", branch: { id: "q", question: "Q?", choices: [{ id: "a", label: "A" }] } }];
    expect(validateBranching(bad).join(" ")).toMatch(/at least two/);
  });
  it("rejects duplicate question ids and duplicate choice ids", () => {
    const dupQ: BranchableStep[] = [steps[1], { ...steps[1], id: "ask2" }];
    expect(validateBranching(dupQ).join(" ")).toMatch(/share the id/);
    const dupC: BranchableStep[] = [{
      id: "q", title: "Q",
      branch: { id: "q", question: "Q?", choices: [{ id: "a", label: "A" }, { id: "a", label: "B" }] },
    }];
    expect(validateBranching(dupC).join(" ")).toMatch(/two choices with the id/);
  });
});

describe("describeConditions and unusedBranches", () => {
  it("reads a condition back in words", () => {
    expect(describeConditions(steps[2], steps)).toBe("Which area? Derby City");
  });
  it("flags a question nothing reacts to, unless a case note uses it", () => {
    const lonely: BranchableStep[] = [steps[1]];
    expect(unusedBranches(lonely)).toEqual(["area"]);
    expect(unusedBranches(lonely, "Sent to [BRANCH:area]")).toEqual([]);
    expect(unusedBranches(steps)).toEqual([]);
  });
});

describe("enumerateRoutes", () => {
  it("gives one route for a guide with no questions", () => {
    const { routes } = enumerateRoutes([{ id: "a" }, { id: "b" }]);
    expect(routes).toHaveLength(1);
    expect(routes[0].steps).toEqual(["a", "b"]);
    expect(routes[0].label).toBe("");
  });

  it("gives one route per answer to a single question", () => {
    const { routes } = enumerateRoutes(steps);
    expect(routes.map((r) => r.steps)).toEqual([
      ["intro", "ask", "city-step", "everyone"],
      ["intro", "ask", "county-step", "everyone"],
    ]);
    expect(routes[0].label).toBe("Which area? Derby City");
  });

  it("only multiplies questions the route actually reaches", () => {
    const nested: BranchableStep[] = [
      { id: "q1", branch: { id: "adult", question: "Adult?", choices: yesNo } },
      { id: "q2", showIf: [{ branch: "adult", is: ["y"] }], branch: { id: "carer", question: "Carer?", choices: yesNo } },
    ];
    // adult=n has no carer question, so three routes, not four.
    expect(enumerateRoutes(nested).routes).toHaveLength(3);
  });

  it("treats skipping an optional question as its own route", () => {
    const optional: BranchableStep[] = [
      { id: "q", branch: { id: "q", question: "Q?", choices: yesNo, required: false } },
      { id: "after", showIf: [{ branch: "q", is: ["y"] }] },
    ];
    const { routes } = enumerateRoutes(optional);
    expect(routes).toHaveLength(3);
    expect(routes.some((r) => r.steps.join() === "q")).toBe(true);
  });

  it("stops rather than freezing on a runaway number of routes", () => {
    const many: BranchableStep[] = Array.from({ length: 8 }, (_, i) => ({
      id: `q${i}`,
      branch: { id: `b${i}`, question: `Q${i}?`, choices: yesNo },
    }));
    const { routes, truncated } = enumerateRoutes(many);
    expect(routes.length).toBe(64);
    expect(truncated).toBe(true);
  });
});
