// The consistency checks that run before a plan is copied into SystmOne.
//
// The important property, and what these tests are really protecting: a check
// POINTS AT two things that sit oddly together. It never says which is right.
// If a future change makes one of these resolve a contradiction, the tool has
// started making a clinical judgement and that is a different product.

import { checkDomain, CHECK_PREAMBLE } from "@/lib/utils/riskChecks";
import {
  NOT_ASSESSED, NOT_APPLICABLE, INCOMPLETE_OPTIONS, WHAT_HELPS,
} from "@/lib/data/guides/rmp-chips";
import { EMPTY, type AllState } from "@/components/guides/risk-capture";

const sec = (patch: Partial<typeof EMPTY> = {}) => ({ ...EMPTY, ...patch });
// A review arrangement by default, so the other tests are testing one thing.
const REVIEWED = { by: "The named nurse", when: "At the next MDT", triggers: ["Any relevant incident"] };
const base = (answers: AllState = {}, subs = ["Fire Setting"], events: never[] = []) =>
  checkDomain({ title: "3. Harm to others", answers, subs, events, review: REVIEWED });

describe("risk plan consistency checks", () => {
  it("is quiet when there is nothing odd", () => {
    const answers: AllState = {
      q1_what: sec({ chips: ["Risk of deliberate fire setting"] }),
      q2_present: sec({ chips: ["Talk of setting fires"], text: "Asks for lighters at handover." }),
      q3_manage: sec({ chips: ["Inform the nurse in charge"] }),
    };
    expect(base(answers)).toEqual([]);
  });

  it("flags a section that says it could not be established and then establishes something", () => {
    const answers: AllState = {
      q2_present: sec({ chips: [INCOMPLETE_OPTIONS.q2_present, "Talk of setting fires"] }),
    };
    const found = base(answers);
    expect(found).toHaveLength(1);
    expect(found[0].where).toBe("3. Harm to others, question 2");
    expect(found[0].message).toContain(INCOMPLETE_OPTIONS.q2_present);
  });

  it("flags free text sitting under a not-established option", () => {
    const answers: AllState = { q2_present: sec({ chips: [NOT_ASSESSED], text: "Paces the corridor at night." }) };
    expect(base(answers)).toHaveLength(1);
  });

  it("flags two different reasons for the same section being empty", () => {
    // "Not assessed" and "not applicable" mean different things - both at once
    // says the section is empty for two incompatible reasons.
    const answers: AllState = { q4_prevent: sec({ chips: [NOT_ASSESSED, NOT_APPLICABLE] }) };
    const found = base(answers);
    expect(found).toHaveLength(1);
    expect(found[0].message).toMatch(/More than one reason/);
  });

  it("flags an absence claim with no period attached", () => {
    const answers: AllState = { q5_evaluate: sec({ chips: ["No further incidents"] }) };
    const found = base(answers);
    expect(found).toHaveLength(1);
    expect(found[0].message).toMatch(/does not say over what period/);
    expect(found[0].message).toMatch(/not by itself proof/);
  });

  it("accepts an absence claim once a period is given, by chip or by text", () => {
    expect(base({ q5_evaluate: sec({ chips: ["No further incidents", "during the agreed review period"] }) })).toEqual([]);
    expect(base({ q5_evaluate: sec({ chips: ["No further incidents"], text: "None in the last 7 days." }) })).toEqual([]);
  });

  it("flags saying nothing helps has been identified next to an identified preference", () => {
    const answers: AllState = {
      q3_manage: sec({ chips: ["Has not yet identified what helps", WHAT_HELPS[0]] }),
    };
    const found = base(answers);
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("Has not yet identified what helps");
  });

  it("flags sub-domains ticked with the whole plan left empty", () => {
    const found = base({}, ["Fire Setting", "Damage to Property"]);
    expect(found).toHaveLength(1);
    expect(found[0].message).toMatch(/2 sub-domains are ticked/);
    expect(found[0].where).toBe("3. Harm to others");
  });

  it("says nothing about an empty plan when no sub-domain is ticked", () => {
    expect(checkDomain({ title: "x", answers: {}, subs: [], events: [] })).toEqual([]);
  });

  it("flags events with no source recorded", () => {
    const found = checkDomain({
      title: "3. Harm to others", answers: { q1_what: sec({ chips: ["Risk of assault"] }) }, subs: ["Fire Setting"], review: REVIEWED,
      events: [
        { day: "", month: "", year: "", text: "Set fire to a bin", source: "Observed by staff" },
        { day: "", month: "", year: "", text: "Reported by a neighbour" },
        { day: "", month: "", year: "", text: "" },
      ],
    });
    expect(found).toHaveLength(1);
    expect(found[0].message).toMatch(/^1 event has no source/);
  });

  it("never tells the nurse which entry is correct", () => {
    const answers: AllState = {
      q2_present: sec({ chips: [INCOMPLETE_OPTIONS.q2_present, "Talk of setting fires"] }),
      q5_evaluate: sec({ chips: ["No further incidents"] }),
    };
    const found = base(answers);
    expect(found.length).toBeGreaterThan(0);
    for (const c of found) {
      expect(c.message).not.toMatch(/\b(remove|delete|should be|must be|is wrong|incorrect|instead)\b/i);
    }
    expect(CHECK_PREAMBLE).toMatch(/the tool cannot tell which entry is right/);
  });
});

describe("keeping the plan current", () => {
  const answered: AllState = { q1_what: sec({ chips: ["Risk of deliberate fire setting"] }) };
  const run = (review?: { by?: string; when?: string; triggers?: string[] }) =>
    checkDomain({ title: "3. Harm to others", answers: answered, subs: ["Fire Setting"], events: [], review });

  it("flags a plan with no review arrangement at all", () => {
    const found = run(undefined);
    expect(found).toHaveLength(1);
    expect(found[0].message).toMatch(/No review arrangement is recorded/);
  });

  it("accepts any one of the three - who, when, or what brings it forward", () => {
    // An event usually makes a plan stale rather than the calendar, so triggers
    // on their own are a real arrangement, not half of one.
    expect(run({ by: "The MDT" })).toEqual([]);
    expect(run({ when: "Weekly" })).toEqual([]);
    expect(run({ triggers: ["Any relevant incident"] })).toEqual([]);
  });

  it("says nothing about review on a plan nobody has started", () => {
    expect(checkDomain({ title: "x", answers: {}, subs: [], events: [] })).toEqual([]);
  });
});
