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
} from "@/lib/data/welcome/risk-screen";
import { RMP_RISK_CHIPS, FORMULATION_RISK_CHIPS } from "@/lib/data/guides/risk";

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
