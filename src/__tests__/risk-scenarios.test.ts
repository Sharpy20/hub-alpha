// Copilot's "deliberately difficult test set", 22 Aug 2026.
//
// His point was that one worked example proves very little - the interesting
// behaviour is at the edges. Each describe() below is one of his scenarios,
// named as he wrote it. Where a scenario turned up a real fault the fix is
// noted on the test.
//
// Scenarios that are purely visual (very long chips wrapping, the indicator
// list collapsing) were driven in the browser instead and are noted in the
// backlog rather than faked here.

import {
  RISK_DOMAINS, buildFormulationSummary, formulationSummaryLines,
  FORMULATION_NOT_COMPLETED, SUBTYPE_RISK,
} from "@/lib/data/welcome/risk-screen";
import { whatIsTheRiskFor, UNIVERSAL_WHAT_IS_THE_RISK, INCOMPLETE_OPTIONS } from "@/lib/data/guides/rmp-chips";
import { checkDomain } from "@/lib/utils/riskChecks";
import {
  buildOneRmp, buildContent, EMPTY, isHistoricDate, resolveWhen, HISTORIC_MONTHS,
  type AllState, type DatedExample,
} from "@/components/guides/risk-capture";
import { loadUserChips } from "@/lib/data/guides/user-chips";

const sec = (patch: Partial<typeof EMPTY> = {}) => ({ ...EMPTY, ...patch });
const blank = () => RISK_DOMAINS.map((d) => ({ domainId: d.id, subs: [] as string[], noEvidence: false, indicators: [] as string[] }));
/** The six answers as the page derives them, keyed by RMP section. */
const plan = (patch: AllState = {}): AllState => ({ ...patch });

// ---------------------------------------------------------------------------

describe("1. No evidence in all domains", () => {
  const input = blank().map((d) => ({ ...d, noEvidence: true }));

  it("gives seven no-evidence lines and never says 'not yet completed'", () => {
    const text = buildFormulationSummary(input);
    expect(text).not.toContain(FORMULATION_NOT_COMPLETED);
    for (const dm of RISK_DOMAINS) expect(text).toContain(dm.noEvidence);
  });

  it("raises no consistency warnings at all", () => {
    for (const dm of RISK_DOMAINS) {
      expect(checkDomain({ title: dm.short, answers: {}, subs: [] })).toEqual([]);
    }
  });
});

describe("2. One simple risk only", () => {
  const input = blank().map((d) =>
    d.domainId === "self-harm"
      ? { ...d, subs: ["Current thoughts of self-harm"] }
      : { ...d, noEvidence: true });

  it("names the one risk and confirms the other six nil", () => {
    const rows = formulationSummaryLines(input);
    expect(rows[0].value).toBe("Current thoughts of self-harm.");
    expect(rows.slice(1).every((r) => r.value.startsWith("No evidence"))).toBe(true);
  });
});

describe("3. Multiple risks in all seven domains", () => {
  const input = blank().map((d) => ({ ...d, subs: RISK_DOMAINS.find((x) => x.id === d.domainId)!.subtypes.slice(0, 2) }));

  it("keeps every domain, in SystmOne order, with nothing dropped", () => {
    const rows = formulationSummaryLines(input);
    expect(rows).toHaveLength(7);
    rows.forEach((r, i) => {
      const dm = RISK_DOMAINS[i];
      for (const s of dm.subtypes.slice(0, 2)) expect(r.value).toContain(s);
    });
  });

  it("offers question-1 outcomes for all seven", () => {
    for (const dm of RISK_DOMAINS) {
      const groups = whatIsTheRiskFor(dm.id, dm.subtypes.slice(0, 2));
      expect({ id: dm.id, n: groups[0]?.words.length || 0 }).not.toEqual({ id: dm.id, n: 0 });
    }
  });
});

describe("4. Several sub-domains within the same domain", () => {
  it("merges the outcomes and never repeats one", () => {
    const words = whatIsTheRiskFor("harm-to-others", [
      "Violence and Aggression", "Damage to Property", "Associated with Mental Ill Health",
    ])[0].words;
    expect(new Set(words).size).toBe(words.length);
    expect(words).toContain("Risk of assault");
    expect(words).toContain("Risk of damaging property");
  });

  it("lists them all in the formulation, semicolon separated", () => {
    const input = blank().map((d) =>
      d.domainId === "harm-by-others" ? { ...d, subs: ["Sexual abuse", "Financial abuse", "Modern slavery"] } : d);
    const row = formulationSummaryLines(input).find((r) => r.domainId === "harm-by-others")!;
    expect(row.value).toBe("Sexual abuse; Financial abuse; Modern slavery.");
  });
});

describe("5. Custom sub-domain only", () => {
  const custom = "Risk from an unregistered carer";

  it("carries the nurse's own wording into the formulation untouched", () => {
    const input = blank().map((d) => (d.domainId === "environmental" ? { ...d, subs: [custom] } : d));
    const row = formulationSummaryLines(input).find((r) => r.domainId === "environmental")!;
    expect(row.value).toBe(`${custom}.`);
  });

  it("offers no invented outcome for it, and leans on the general library instead", () => {
    // A sub-domain nobody has written a bank for must not borrow another one's
    // words - the general list is domain-neutral and is what covers this.
    expect(whatIsTheRiskFor("environmental", [custom])).toEqual([]);
    expect(UNIVERSAL_WHAT_IS_THE_RISK.length).toBeGreaterThan(0);
  });

  it("has no chip-bank mapping, so nothing tailored leaks in", () => {
    expect(SUBTYPE_RISK[`environmental::${custom}`]).toBeUndefined();
  });
});

describe("6. Indicators selected but no sub-domain selected", () => {
  const input = blank().map((d) =>
    d.domainId === "harm-to-others" ? { ...d, indicators: ["Arson", "Accidental fire setting"] } : d);

  it("says the domain is not completed and still names the indicators", () => {
    const row = formulationSummaryLines(input).find((r) => r.domainId === "harm-to-others")!;
    expect(row.value).toBe(FORMULATION_NOT_COMPLETED);
    expect(row.indicators).toContain("Arson");
  });

  it("offers no question-1 outcomes, because nothing has been named yet", () => {
    expect(whatIsTheRiskFor("harm-to-others", [])).toEqual([]);
  });
});

describe("7. Sub-domain selected but indicators hidden", () => {
  it("carries the sub-domain and no indicator line", () => {
    const input = blank().map((d) =>
      d.domainId === "physical-health" ? { ...d, subs: ["Falls"], indicators: [] } : d);
    const row = formulationSummaryLines(input).find((r) => r.domainId === "physical-health")!;
    expect(row.value).toBe("Falls.");
    expect(row.indicators).toBe("");
  });
});

describe("8. Historical risk with no current presentation", () => {
  it("prints the history and says plainly that the rest is not completed", () => {
    const secs = plan({ what: sec({ chips: ["Risk of a further incident of the same kind"] }) });
    const text = buildOneRmp("", secs, "Fire Setting");
    expect(text).toContain("Risk of a further incident of the same kind.");
    expect(text).toContain("This section has not yet been completed.");
    // The mandatory line survives an otherwise empty plan.
    expect(text).toContain("must be reviewed by the MDT");
  });
});

describe("9. Current risk with no known history", () => {
  it("is a perfectly ordinary plan and raises nothing", () => {
    const answers: AllState = {
      q1_what: sec({ chips: ["Risk of falling"] }),
      q2_present: sec({ chips: ["Unsteadiness"], text: "Reaches for furniture crossing the bay." }),
      q3_manage: sec({ chips: ["Inform the nurse in charge"] }),
    };
    expect(checkDomain({ title: "5. Physical health", answers, subs: ["Falls"] })).toEqual([]);
  });
});

describe("10. Conflicting current and historical information", () => {
  it("records both without deciding between them", () => {
    // Two accounts of the same event. The tool keeps both, word for word, in the
    // order they were entered; it must never merge or adjudicate them.
    //
    // A source dropdown answered this on 22 Aug and was removed on 25 Aug - it
    // slowed the nurse down for something they can say in the sentence itself,
    // which is what these two entries do.
    const events: DatedExample[] = [
      { day: "4", month: "7", year: "2026", text: "Reports the fire was an accident" },
      { day: "4", month: "7", year: "2026", text: "Previous assessment records it as deliberate" },
    ];
    const body = buildContent(sec({ examples: events }));
    expect(body).toContain("Reports the fire was an accident");
    expect(body).toContain("Previous assessment records it as deliberate");
    const found = checkDomain({ title: "3. Harm to others", answers: {}, subs: [] });
    // Nothing is flagged, because neither entry is wrong - they are two accounts.
    expect(found).toEqual([]);
  });
});

describe("11. No patient-specific early warning signs established", () => {
  it("prints the nurse's own words, not the empty-section wording", () => {
    const secs = plan({ present: sec({ chips: [INCOMPLETE_OPTIONS.q2_present] }) });
    const text = buildOneRmp("", secs, "Fire Setting");
    expect(text).toContain(INCOMPLETE_OPTIONS.q2_present);
    // The HOW DOES THIS PRESENT block must not also claim nobody completed it.
    const block = text.split("HOW DOES THIS PRESENT")[1].split("---")[0];
    expect(block).not.toContain("has not yet been completed");
  });

  it("raises nothing when it stands alone", () => {
    expect(checkDomain({
      title: "3. Harm to others", answers: { q2_present: sec({ chips: [INCOMPLETE_OPTIONS.q2_present] }) },
      subs: ["Fire Setting"],
    })).toEqual([]);
  });
});

describe("12. Data saved before the update", () => {
  afterEach(() => window.localStorage.clear());

  it("survives a chip store whose values are not arrays", () => {
    // The shape changed when the questions did. A stored string where an array
    // is expected used to reach .map() in the editor and take the page down.
    window.localStorage.setItem("wardhub_user_chips", JSON.stringify({ "self-harm::q_seen": "a single word" }));
    expect(() => loadUserChips()).not.toThrow();
    expect(loadUserChips()["self-harm::q_seen"]).toEqual([]);
  });

  it("survives corrupt JSON and a non-object payload", () => {
    window.localStorage.setItem("wardhub_user_chips", "{not json");
    expect(loadUserChips()).toEqual({});
    window.localStorage.setItem("wardhub_user_chips", JSON.stringify(["a", "b"]));
    expect(loadUserChips()).toEqual({});
  });

  it("drops non-string entries rather than rendering them", () => {
    window.localStorage.setItem("wardhub_user_chips", JSON.stringify({ "x::q1_what": ["ok", 42, null, "fine"] }));
    expect(loadUserChips()["x::q1_what"]).toEqual(["ok", "fine"]);
  });

  it("ignores chips saved against the old question ids", () => {
    // q_seen / q_judgement no longer exist. They are orphaned, not broken: the
    // key never matches a live bank, so they simply never appear.
    window.localStorage.setItem("wardhub_user_chips", JSON.stringify({ "self-harm::q_judgement": ["low risk"] }));
    const store = loadUserChips();
    expect(store["self-harm::q1_what"]).toBeUndefined();
    expect(store["self-harm::q_judgement"]).toEqual(["low risk"]);
  });
});

describe("13. Very long custom chips", () => {
  const long = "Risk of ".concat("a very specific and unusually wordy circumstance ".repeat(12)).trim();

  it("is carried through the output whole, not truncated", () => {
    const secs = plan({ what: sec({ chips: [long] }) });
    const text = buildOneRmp("", secs, "Fire Setting");
    expect(text).toContain(long);
    expect(text).not.toContain("...");
  });

  it("still joins naturally with a second chip", () => {
    const body = buildContent(sec({ chips: [long, "Risk of falling"] }));
    expect(body).toContain(`${long} and Risk of falling.`);
  });
});

describe("14. Repeated dates and duplicate events", () => {
  it("keeps two events on the same date, in the order they were entered", () => {
    const events: DatedExample[] = [
      { day: "4", month: "7", year: "2026", text: "First incident" },
      { day: "4", month: "7", year: "2026", text: "Second incident" },
    ];
    const body = buildContent(sec({ examples: events }));
    expect(body.indexOf("First incident")).toBeLessThan(body.indexOf("Second incident"));
  });

  it("keeps a genuine duplicate rather than silently deduping it", () => {
    // Two identical entries are far more likely to be two real incidents than a
    // mistake, and removing one would be the tool editing the record.
    const events: DatedExample[] = [
      { day: "4", month: "7", year: "2026", text: "Verbal threat to staff" },
      { day: "4", month: "7", year: "2026", text: "Verbal threat to staff" },
    ];
    const body = buildContent(sec({ examples: events }));
    expect(body.match(/Verbal threat to staff/g)).toHaveLength(2);
  });

  it("sorts most recent first and sinks undated events to the bottom", () => {
    const events: DatedExample[] = [
      { day: "", month: "", year: "", text: "Undated" },
      { day: "1", month: "1", year: "2020", text: "Old" },
      { day: "1", month: "8", year: "2026", text: "Recent" },
    ];
    const body = buildContent(sec({ examples: events }));
    expect(body.indexOf("Recent")).toBeLessThan(body.indexOf("Old"));
    expect(body.indexOf("Old")).toBeLessThan(body.indexOf("Undated"));
  });
});

describe("15. Unsafe or contradictory intervention selections", () => {
  it("flags a not-established option sitting next to real content", () => {
    const found = checkDomain({
      title: "3. Harm to others",
      answers: { q4_prevent: sec({ chips: [INCOMPLETE_OPTIONS.q4_prevent, "Maintain consistent boundaries"] }) },
      subs: ["Fire Setting"],
    });
    expect(found).toHaveLength(1);
  });

  it("flags an absence claim with no period", () => {
    const found = checkDomain({
      title: "3. Harm to others", answers: { q5_evaluate: sec({ chips: ["No property damage"] }) },
      subs: ["Fire Setting"],
    });
    expect(found[0].message).toMatch(/does not say over what period/);
  });

  it("never suppresses the mandatory MDT line, whatever else is selected", () => {
    const secs = plan({ next: sec({ chips: [INCOMPLETE_OPTIONS.q6_next] }) });
    expect(buildOneRmp("", secs, "Fire Setting")).toContain("must be reviewed by the MDT");
  });
});

// ---------------------------------------------------------------------------

describe("16. When did it happen - today, a date, or historic", () => {
  // Mike, 25 Aug 2026: three choices up front, and the date does the sorting.
  // The nurse is never asked "is this current or historical" as a second
  // question, because the answer is already in the date they gave.
  const today = new Date(2026, 7, 25);   // 25 August 2026

  it("counts anything older than three months as history", () => {
    expect(HISTORIC_MONTHS).toBe(3);
    expect(isHistoricDate({ day: "1", month: "1", year: "2020" }, today)).toBe(true);
    expect(isHistoricDate({ day: "1", month: "8", year: "2026" }, today)).toBe(false);
  });

  it("puts the boundary itself on the current side", () => {
    // Exactly three months ago is not yet history - only older than that is.
    expect(isHistoricDate({ day: "25", month: "5", year: "2026" }, today)).toBe(false);
    expect(isHistoricDate({ day: "24", month: "5", year: "2026" }, today)).toBe(true);
  });

  it("treats an undated event as current, never as history", () => {
    // A missing year is not evidence something happened long ago.
    expect(isHistoricDate({ day: "", month: "", year: "" }, today)).toBe(false);
  });

  it("stamps Today with today's date", () => {
    const e = resolveWhen("today", { day: "", month: "", year: "" }, today);
    expect(e).toMatchObject({ day: "25", month: "8", year: "2026", historic: false });
  });

  it("takes Historic without asking for a date", () => {
    const e = resolveWhen("historic", { day: "", month: "", year: "" }, today);
    expect(e).toMatchObject({ day: "", month: "", year: "", historic: true });
  });

  it("sorts a picked date on its own", () => {
    expect(resolveWhen("date", { day: "3", month: "2", year: "2019" }, today).historic).toBe(true);
    expect(resolveWhen("date", { day: "3", month: "8", year: "2026" }, today).historic).toBe(false);
  });

  it("prints an event as the event, with nothing appended to it", () => {
    // The source suffix ("(reported by the person)") went on 25 Aug. Where an
    // account came from is now said in the words of the entry itself.
    const events: DatedExample[] = [{ day: "4", month: "7", year: "2026", text: "Police reported a fire in the garden" }];
    expect(buildContent(sec({ examples: events }))).toBe("4 July 2026 - Police reported a fire in the garden");
  });
});

describe("17. The plan prints the five trust headings and nothing else", () => {
  it("carries no involvement or review lines in its header", () => {
    // Built 22 Aug, removed 25 Aug. If these come back, they come back as one
    // control rather than four - and this test should be the thing that fails.
    const text = buildOneRmp("", plan({ what: sec({ chips: ["Risk of deliberate fire setting"] }) }), "Fire Setting");
    expect(text).not.toMatch(/Person involved in this plan/);
    expect(text).not.toMatch(/^Review:/m);
    expect(text).not.toMatch(/Review sooner if/);
  });
});
