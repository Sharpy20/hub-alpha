// The Trust's SystmOne risk screen inventory is fixed: 7 domains, 36 sub-domains
// and 125 clinical indicators, transcribed verbatim from the live screens.
//
// These are the counts Mike verified against SystmOne on 20 Aug 2026. If a test
// here fails, either the transcription drifted or the Trust changed the form -
// both need checking against the screen before the numbers are edited. Do NOT
// "fix" a failure by changing the expected number.
//
// Custom "add another sub-domain / indicator" entries are a wardHub feature and
// deliberately not part of these totals.

import {
  RISK_DOMAINS, CLINICAL_INDICATORS, INDICATOR_BACKGROUND, SUBTYPE_RISK,
  buildFormulationSummary, formulationSummaryLines,
  FORMULATION_NOT_COMPLETED, FORMULATION_SUMMARY_TITLE, FORMULATION_INDICATOR_LABEL,
} from "@/lib/data/welcome/risk-screen";
import { RMP_RISK_CHIPS, FORMULATION_RISK_CHIPS } from "@/lib/data/guides/risk";
import {
  DOMAIN_RMP_CHIPS, WHAT_IS_THE_RISK, WHAT_IS_THE_RISK_CHILD, whatIsTheRiskFor,
  UNIVERSAL_IMMEDIATE, UNIVERSAL_PREVENTION, UNIVERSAL_REDUCTION_SIGNS, UNIVERSAL_ESCALATION,
} from "@/lib/data/guides/rmp-chips";

const EXPECTED = {
  "self-harm": { number: 1, subtypes: 3, indicators: 19 },
  "self-neglect": { number: 2, subtypes: 2, indicators: 17 },
  "harm-to-others": { number: 3, subtypes: 6, indicators: 27 },
  "harm-by-others": { number: 4, subtypes: 8, indicators: 9 },
  "physical-health": { number: 5, subtypes: 5, indicators: 27 },
  "children": { number: 6, subtypes: 9, indicators: 14 },
  "environmental": { number: 7, subtypes: 3, indicators: 12 },
} as const;

describe("SystmOne risk screen inventory", () => {
  it("has the seven Trust domains, numbered 1-7 in order", () => {
    expect(RISK_DOMAINS).toHaveLength(7);
    expect(RISK_DOMAINS.map((d) => d.id)).toEqual(Object.keys(EXPECTED));
    expect(RISK_DOMAINS.map((d) => d.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("has 36 approved sub-domains in total", () => {
    const total = RISK_DOMAINS.reduce((n, d) => n + d.subtypes.length, 0);
    expect(total).toBe(36);
  });

  it("has 125 approved clinical indicators in total", () => {
    const total = RISK_DOMAINS.reduce((n, d) => n + (CLINICAL_INDICATORS[d.id] || []).length, 0);
    expect(total).toBe(125);
  });

  describe.each(RISK_DOMAINS)("domain $number ($id)", (dm) => {
    const want = EXPECTED[dm.id as keyof typeof EXPECTED];

    it(`has ${want.subtypes} sub-domains`, () => {
      expect(dm.subtypes).toHaveLength(want.subtypes);
    });

    it(`has ${want.indicators} clinical indicators`, () => {
      expect(CLINICAL_INDICATORS[dm.id] || []).toHaveLength(want.indicators);
    });

    it("has no duplicate sub-domains or indicators", () => {
      expect(new Set(dm.subtypes).size).toBe(dm.subtypes.length);
      const inds = CLINICAL_INDICATORS[dm.id] || [];
      expect(new Set(inds).size).toBe(inds.length);
    });

    it("carries the exact no-evidence option and the three follow-up prompts", () => {
      expect(dm.noEvidence).toMatch(/^No evidence /);
      expect(dm.indicatorsPrompt).toMatch(/^Display clinical indicators /);
      expect(dm.currentPrompt.trim()).not.toBe("");
      expect(dm.historicalPrompt.trim()).not.toBe("");
    });
  });
});

describe("Trust wording is preserved exactly", () => {
  // Rule 7 (see CLAUDE.md / trust-form-exact-wording): the form's own typos and
  // its open-ended BMI entry are kept. If someone "tidies" these, the transcription
  // no longer matches the screen the nurse is looking at.
  it("keeps the form's own typo in the physical health indicators", () => {
    expect(CLINICAL_INDICATORS["physical-health"]).toContain("Crital meds (warfarin, Parkinson's)");
  });

  it("keeps the open-ended High BMI entry rather than guessing a threshold", () => {
    expect(CLINICAL_INDICATORS["physical-health"]).toContain("High BMI >");
    expect(CLINICAL_INDICATORS["physical-health"].join("|")).not.toMatch(/High BMI > ?\d/);
  });
});

describe("indicator routing and chip mapping", () => {
  it("only routes indicators that actually exist on their domain", () => {
    for (const [domainId, background] of Object.entries(INDICATOR_BACKGROUND)) {
      const known = CLINICAL_INDICATORS[domainId] || [];
      for (const ind of background) {
        expect({ domainId, ind, known: known.includes(ind) }).toEqual({ domainId, ind, known: true });
      }
    }
  });

  it("maps every sub-domain to a chip bank, and every key names a real sub-domain", () => {
    const real = new Set(RISK_DOMAINS.flatMap((d) => d.subtypes.map((s) => `${d.id}::${s}`)));
    for (const key of Object.keys(SUBTYPE_RISK)) {
      expect({ key, real: real.has(key) }).toEqual({ key, real: true });
    }
    for (const key of real) {
      expect({ key, mapped: !!SUBTYPE_RISK[key] }).toEqual({ key, mapped: true });
    }
  });

  it("points every sub-domain at a chip bank that has chips in it", () => {
    for (const risk of new Set(Object.values(SUBTYPE_RISK))) {
      const hasRmp = !!RMP_RISK_CHIPS[risk];
      const hasForm = !!FORMULATION_RISK_CHIPS[risk];
      expect({ risk, hasRmp, hasForm }).toEqual({ risk, hasRmp: true, hasForm: true });
    }
  });
});

// ---------------------------------------------------------------------------
// The Risk Formulation summary (field 9), rebuilt 22 Aug 2026.
//
// This is the one place the tool assembles text without the nurse selecting each
// part, so it is the one place worth pinning down hard. The whole argument for it
// being safe is that every word is either the trust's own wording or something
// the nurse ticked - these tests are what keeps that true.
// ---------------------------------------------------------------------------

const blank = () => RISK_DOMAINS.map((d) => ({ domainId: d.id, subs: [] as string[], noEvidence: false, indicators: [] as string[] }));

describe("Risk Formulation summary", () => {
  it("always carries all seven domains, in SystmOne order", () => {
    const rows = formulationSummaryLines([]);
    expect(rows).toHaveLength(7);
    expect(rows.map((r) => r.domainId)).toEqual(RISK_DOMAINS.map((d) => d.id));
    expect(rows.map((r) => r.title)).toEqual(RISK_DOMAINS.map((d) => d.title));
  });

  it("does not let an unworked domain read as a negative finding", () => {
    // "Not yet completed" is a gap. It must never be the domain's "no evidence"
    // line, which is a statement that the assessment found nothing.
    for (const row of formulationSummaryLines(blank())) {
      expect(row.value).toBe(FORMULATION_NOT_COMPLETED);
      expect(row.value).not.toMatch(/No evidence/);
    }
  });

  it("uses the domain's own exact no-evidence wording, not a generated one", () => {
    const input = blank().map((d) => ({ ...d, noEvidence: true }));
    const rows = formulationSummaryLines(input);
    RISK_DOMAINS.forEach((dm, i) => {
      expect(rows[i].value).toBe(`${dm.noEvidence}.`);
    });
  });

  it("lists the ticked sub-domains verbatim, semicolon separated", () => {
    const input = blank().map((d) =>
      d.domainId === "harm-to-others" ? { ...d, subs: ["Fire Setting", "Damage to Property"] } : d);
    const row = formulationSummaryLines(input).find((r) => r.domainId === "harm-to-others")!;
    expect(row.value).toBe("Fire Setting; Damage to Property.");
  });

  it("includes a sub-domain the nurse named themselves", () => {
    const input = blank().map((d) =>
      d.domainId === "environmental" ? { ...d, subs: ["Housing issues", "No safe route home"] } : d);
    const row = formulationSummaryLines(input).find((r) => r.domainId === "environmental")!;
    expect(row.value).toContain("No safe route home");
  });

  it("names the ticked clinical indicators", () => {
    const input = blank().map((d) =>
      d.domainId === "harm-to-others"
        ? { ...d, subs: ["Violence and Aggression"], indicators: ["Male gender, under 35 years", "Incidents of violence"] }
        : d);
    const row = formulationSummaryLines(input).find((r) => r.domainId === "harm-to-others")!;
    expect(row.indicators).toBe(`${FORMULATION_INDICATOR_LABEL}: Male gender, under 35 years; Incidents of violence.`);
  });

  it("carries no indicators on a domain confirmed nil", () => {
    const input = blank().map((d) =>
      d.domainId === "self-harm" ? { ...d, noEvidence: true, indicators: ["Trauma"] } : d);
    const row = formulationSummaryLines(input).find((r) => r.domainId === "self-harm")!;
    expect(row.indicators).toBe("");
  });

  it("puts nothing in the text that the nurse did not tick", () => {
    // The safety argument for generating this at all. The only words allowed are
    // the domain titles, the trust's no-evidence lines, the ticked sub-domains,
    // the ticked indicators and the fixed labels.
    const input = blank().map((d) =>
      d.domainId === "self-harm"
        ? { ...d, subs: ["Current thoughts of self-harm"], indicators: ["Trauma"] }
        : { ...d, noEvidence: true });
    const text = buildFormulationSummary(input);
    const allowed = [
      FORMULATION_SUMMARY_TITLE, FORMULATION_INDICATOR_LABEL,
      ...RISK_DOMAINS.map((d) => d.title), ...RISK_DOMAINS.map((d) => d.noEvidence),
      "Current thoughts of self-harm", "Trauma",
    ];
    let residue = text;
    for (const a of allowed) residue = residue.split(a).join("");
    // What is left should be punctuation and whitespace only - no prose crept in.
    expect(residue.replace(/[-:;.\s]/g, "")).toBe("");
  });

  it("puts the patient name in only when one is linked", () => {
    expect(buildFormulationSummary(blank())).not.toMatch(/Patient:/);
    expect(buildFormulationSummary(blank(), "Anne Elliot")).toContain("Patient: Anne Elliot");
  });
});

// ---------------------------------------------------------------------------
// The RMP chip libraries, transcribed from the design Mike settled 22 Aug 2026.
// ---------------------------------------------------------------------------

describe("RMP chip libraries", () => {
  it("gives every domain a bank for questions 2 to 5", () => {
    for (const dm of RISK_DOMAINS) {
      const bank = DOMAIN_RMP_CHIPS[dm.id];
      expect({ id: dm.id, has: !!bank }).toEqual({ id: dm.id, has: true });
      for (const key of ["present", "manage", "prevent", "evaluate"] as const) {
        expect({ id: dm.id, key, n: bank[key].length > 0 }).toEqual({ id: dm.id, key, n: true });
      }
    }
  });

  it("has no duplicates inside any bank", () => {
    for (const [id, bank] of Object.entries(DOMAIN_RMP_CHIPS)) {
      for (const key of ["present", "manage", "prevent", "evaluate"] as const) {
        const words = bank[key];
        expect({ id, key, unique: new Set(words).size }).toEqual({ id, key, unique: words.length });
      }
    }
  });

  it("keys every question-1 bank to a real sub-domain, and covers all six per-sub-domain domains", () => {
    const real = new Set(RISK_DOMAINS.flatMap((d) => d.subtypes.map((s) => `${d.id}::${s}`)));
    for (const key of Object.keys(WHAT_IS_THE_RISK)) {
      expect({ key, real: real.has(key) }).toEqual({ key, real: true });
    }
    // Domain 6 is deliberately served by one flat high-level bank instead.
    for (const dm of RISK_DOMAINS) {
      if (dm.id === "children") continue;
      for (const s of dm.subtypes) {
        const k = `${dm.id}::${s}`;
        expect({ k, n: (WHAT_IS_THE_RISK[k] || []).length > 0 }).toEqual({ k, n: true });
      }
    }
  });

  it("names an outcome to prevent, never a risk level", () => {
    // The MHRA line: the tool offers vocabulary, it never rates or stratifies.
    const all = [...Object.values(WHAT_IS_THE_RISK).flat(), ...WHAT_IS_THE_RISK_CHILD];
    for (const w of all) {
      expect({ w, ok: /^(Risk|Child protection concern|Reported ideas)/.test(w) }).toEqual({ w, ok: true });
      expect({ w, rated: /\b(low|moderate|high|severe|significant|minimal)\b/i.test(w) }).toEqual({ w, rated: false });
    }
  });

  it("keeps domain 6 conservative - one high-level bank for every sub-domain", () => {
    // The design: "conservative and safeguarding-led ... populate the relevant
    // high-level concern". Splitting this per sub-domain would name what was
    // done to a child, which is exactly what it must not do.
    for (const s of RISK_DOMAINS.find((d) => d.id === "children")!.subtypes) {
      expect(WHAT_IS_THE_RISK[`children::${s}`]).toBeUndefined();
    }
    expect(whatIsTheRiskFor("children", ["Child Protection"])[0].words).toEqual(WHAT_IS_THE_RISK_CHILD);
    expect(whatIsTheRiskFor("children", ["Sexual abuse"])[0].words).toEqual(WHAT_IS_THE_RISK_CHILD);
    expect(whatIsTheRiskFor("children", [])).toEqual([]);
  });

  it("keeps the sexual offences outcomes high-level and non-graphic", () => {
    expect(WHAT_IS_THE_RISK["harm-to-others::Sexual Offenses"]).toEqual([
      "Risk of sexually inappropriate behaviour",
      "Risk of harmful sexual behaviour",
      "Risk requiring specialist assessment and safeguarding management",
    ]);
  });

  it("merges and dedupes the outcomes for several ticked sub-domains", () => {
    const words = whatIsTheRiskFor("harm-to-others", ["Fire Setting", "Damage to Property"])[0].words;
    expect(words).toContain("Risk of deliberate fire setting");
    expect(words).toContain("Risk of damaging property");
    expect(new Set(words).size).toBe(words.length);
  });

  it("carries the two standing instructions from the design", () => {
    expect(DOMAIN_RMP_CHIPS["children"].note).toMatch(/safeguarding-led/);
    expect(DOMAIN_RMP_CHIPS["physical-health"].note).toMatch(/clinical indicators/);
  });

  it("leaves the add-your-own affordance out of the chip data", () => {
    const all = [
      ...Object.values(DOMAIN_RMP_CHIPS).flatMap((b) => [...b.present, ...b.manage, ...b.prevent, ...b.evaluate]),
      ...Object.values(WHAT_IS_THE_RISK).flat(), ...WHAT_IS_THE_RISK_CHILD,
      ...UNIVERSAL_IMMEDIATE, ...UNIVERSAL_PREVENTION, ...UNIVERSAL_REDUCTION_SIGNS, ...UNIVERSAL_ESCALATION,
    ];
    for (const w of all) expect({ w, add: /^Add another/i.test(w) }).toEqual({ w, add: false });
  });
});

// ---------------------------------------------------------------------------
// Conditional actions must stay conditional.
//
// Some actions are only safe when qualified. "Complete a search" is an order;
// "complete a search in line with policy and the individual plan" is a prompt to
// follow the process. Same for observations - the tool may ask staff to REVIEW
// an observation level, never to raise one, because that is a clinical decision
// with its own policy and its own authoriser.
// ---------------------------------------------------------------------------

describe("conditional actions keep their qualifiers", () => {
  const actionWords = () => {
    const fromDomains = Object.values(DOMAIN_RMP_CHIPS)
      .flatMap((b) => [...b.manage, ...b.prevent]);
    const fromRisks = Object.values(RMP_RISK_CHIPS)
      .flatMap((r) => [...(r.prevent || []), ...(r.next || [])])
      .flatMap((g) => g.words);
    return [...fromDomains, ...fromRisks, ...UNIVERSAL_IMMEDIATE, ...UNIVERSAL_PREVENTION, ...UNIVERSAL_ESCALATION];
  };

  it("never instructs staff to raise an observation level", () => {
    for (const w of actionWords()) {
      expect({ w, raises: /\bincrease\b[^.]*\bobservation/i.test(w) }).toEqual({ w, raises: false });
    }
  });

  it("never instructs a search without pointing at the policy", () => {
    for (const w of actionWords()) {
      if (!/\bsearch\b/i.test(w)) continue;
      expect({ w, qualified: /(policy|individual plan)/i.test(w) }).toEqual({ w, qualified: true });
    }
  });

  it("never instructs staff to restrict or cancel leave", () => {
    for (const w of actionWords()) {
      expect({ w, restricts: /\b(restrict|cancel|suspend|stop)\b[^.]*\bleave\b/i.test(w) }).toEqual({ w, restricts: false });
    }
  });

  it("keeps PRN conditional wherever it is offered", () => {
    for (const w of actionWords()) {
      if (!/\bPRN\b/i.test(w)) continue;
      expect({ w, qualified: /(where clinically indicated|prescribed|offer)/i.test(w) }).toEqual({ w, qualified: true });
    }
  });
});
