// Service "town map" - PROTOTYPE data + eligibility engine.
//
// Mike's idea (3 Jul 2026): from a patient's profile facts, visually show which
// services are potentially open to them. Central = primary/statutory services,
// outer ring = charities / third sector. Paths go grey -> green as inclusion
// criteria are met, and close off (red) on an exclusion criterion or when the
// patient is outside the service's catchment (postcode/area).
//
// EVERYTHING HERE IS ILLUSTRATIVE DEMO DATA. The real criteria (admission +
// exclusion + catchment per service) come from the service-directory research
// session. No PII - facts are edited live in the prototype page.

export type Area = "city" | "county" | "out";

export interface Facts {
  area: Area;              // derived from postcode in the real thing
  age: number;
  diagnoses: string[];     // multi-select
  substance: "none" | "using" | "recovery";
  housing: "settled" | "at-risk" | "homeless";
  pip: "none" | "applied" | "awarded";
  risk: "low" | "elevated" | "acute";
  veteran: boolean;
  carer: boolean;
}

export const DIAGNOSIS_OPTIONS = [
  "Depression / anxiety",
  "Psychosis",
  "Bipolar",
  "Personality disorder",
  "PTSD / trauma",
  "Eating disorder",
  "Learning disability",
  "Dementia",
];

export const AREA_LABEL: Record<Area, string> = {
  city: "Derby City",
  county: "Derbyshire County",
  out: "Out of area",
};

export const EMPTY_FACTS: Facts = {
  area: "county",
  age: 40,
  diagnoses: [],
  substance: "none",
  housing: "settled",
  pip: "none",
  risk: "low",
  veteran: false,
  carer: false,
};

export type Ring = "primary" | "charity";

export interface Criterion {
  label: string;
  test: (f: Facts) => boolean;
}

export interface Service {
  id: string;
  name: string;
  ring: Ring;
  areas: Area[];          // catchment - which areas it serves
  include: Criterion[];   // ALL true = fully open; the proportion drives greening
  exclude: Criterion[];   // ANY true = path closed off
  note?: string;
}

const has = (f: Facts, d: string) => f.diagnoses.includes(d);
const severe = (f: Facts) =>
  has(f, "Psychosis") || has(f, "Bipolar") || has(f, "Personality disorder");
const anyDx = (f: Facts) => f.diagnoses.length > 0;

// 16 illustrative services - 8 primary (inner ring), 8 charity/third-sector (outer).
export const SERVICES: Service[] = [
  // --- Primary / statutory (inner ring) ---
  {
    id: "talking-therapies", name: "NHS Talking Therapies", ring: "primary", areas: ["city", "county"],
    include: [{ label: "Common mental health difficulty (depression / anxiety)", test: (f) => has(f, "Depression / anxiety") }],
    exclude: [
      { label: "Active psychosis - needs secondary care", test: (f) => has(f, "Psychosis") },
      { label: "Acute risk - needs crisis care first", test: (f) => f.risk === "acute" },
    ],
    note: "Primary-care talking therapies for mild-to-moderate difficulties.",
  },
  {
    id: "cmht", name: "Community Mental Health Team", ring: "primary", areas: ["city", "county"],
    include: [{ label: "Severe / enduring mental illness", test: severe }],
    exclude: [],
    note: "Secondary care for severe and enduring mental illness.",
  },
  {
    id: "crisis", name: "Crisis / Home Treatment", ring: "primary", areas: ["city", "county"],
    include: [{ label: "Elevated or acute risk", test: (f) => f.risk !== "low" }],
    exclude: [],
    note: "Short-term intensive support as an alternative to admission.",
  },
  {
    id: "substance", name: "Substance Misuse Service", ring: "primary", areas: ["city", "county"],
    include: [{ label: "Current use or in recovery", test: (f) => f.substance !== "none" }],
    exclude: [],
    note: "Drug and alcohol treatment and recovery (e.g. DRP).",
  },
  {
    id: "social-care", name: "Social Care (Care Act)", ring: "primary", areas: ["city", "county"],
    include: [{ label: "Care & support need (housing, LD, or older adult)", test: (f) => f.housing !== "settled" || has(f, "Learning disability") || f.age >= 65 }],
    exclude: [],
    note: "Care Act assessment and support planning.",
  },
  {
    id: "housing", name: "Housing / Duty to Refer", ring: "primary", areas: ["city", "county", "out"],
    include: [{ label: "At risk of, or experiencing, homelessness", test: (f) => f.housing !== "settled" }],
    exclude: [],
    note: "Duty to Refer to the local housing authority.",
  },
  {
    id: "picu", name: "PICU (Kingfisher)", ring: "primary", areas: ["city", "county", "out"],
    include: [
      { label: "Acute risk needing intensive care", test: (f) => f.risk === "acute" },
      { label: "Mental health diagnosis present", test: anyDx },
    ],
    exclude: [],
    note: "Psychiatric Intensive Care - regional, both areas.",
  },
  {
    id: "older-adult", name: "Older Adult Mental Health", ring: "primary", areas: ["city", "county"],
    include: [
      { label: "Aged 65+", test: (f) => f.age >= 65 },
      { label: "Mental health need", test: anyDx },
    ],
    exclude: [],
    note: "Specialist older-adult MH team.",
  },

  // --- Charity / third sector (outer ring) ---
  {
    id: "samaritans", name: "Samaritans", ring: "charity", areas: ["city", "county", "out"],
    include: [],
    exclude: [],
    note: "Open to anyone, any time - 116 123.",
  },
  {
    id: "mind", name: "Mind (Derby / Derbyshire)", ring: "charity", areas: ["city", "county"],
    include: [{ label: "Any mental health need", test: anyDx }],
    exclude: [],
    note: "Local Mind - peer support, groups, information.",
  },
  {
    id: "rethink", name: "Rethink (Derby)", ring: "charity", areas: ["city"],
    include: [{ label: "Severe mental illness, or a carer", test: (f) => severe(f) || f.carer }],
    exclude: [],
    note: "Support for people affected by severe mental illness.",
  },
  {
    id: "advocacy-city", name: "Advocacy - Disability Direct (City)", ring: "charity", areas: ["city"],
    include: [],
    exclude: [],
    note: "IMHA / advocacy for Derby City residents.",
  },
  {
    id: "advocacy-county", name: "Advocacy - Cloverleaf (County)", ring: "charity", areas: ["county"],
    include: [],
    exclude: [],
    note: "IMHA / advocacy for Derbyshire County residents.",
  },
  {
    id: "op-courage", name: "Op Courage (Veterans)", ring: "charity", areas: ["city", "county", "out"],
    include: [{ label: "Armed-forces veteran", test: (f) => f.veteran }],
    exclude: [],
    note: "NHS veterans' mental health service.",
  },
  {
    id: "carers", name: "Carers Support", ring: "charity", areas: ["city", "county"],
    include: [{ label: "Is a carer", test: (f) => f.carer }],
    exclude: [],
    note: "Support and a carer's assessment for unpaid carers.",
  },
  {
    id: "welfare", name: "Welfare Rights / PIP support", ring: "charity", areas: ["city", "county", "out"],
    include: [{ label: "Not yet receiving PIP (help to claim)", test: (f) => f.pip !== "awarded" }],
    exclude: [],
    note: "Benefits advice and help to claim PIP.",
  },
];

export type ServiceState = "open" | "partial" | "unknown" | "blocked";

export interface Evaluation {
  state: ServiceState;
  score: number;            // 0..1 fraction of inclusion criteria met (drives greening)
  blockedReason?: string;   // exclusion label or catchment message
  met: string[];
  unmet: string[];
}

export function evaluate(svc: Service, f: Facts): Evaluation {
  if (!svc.areas.includes(f.area)) {
    return { state: "blocked", score: 0, blockedReason: `Outside catchment - serves ${svc.areas.map((a) => AREA_LABEL[a]).join(" / ")}`, met: [], unmet: [] };
  }
  const exHit = svc.exclude.find((c) => c.test(f));
  if (exHit) {
    return { state: "blocked", score: 0, blockedReason: exHit.label, met: [], unmet: [] };
  }
  const met = svc.include.filter((c) => c.test(f));
  const unmet = svc.include.filter((c) => !c.test(f));
  const score = svc.include.length ? met.length / svc.include.length : 1;
  const state: ServiceState = score >= 1 ? "open" : score > 0 ? "partial" : "unknown";
  return { state, score, met: met.map((c) => c.label), unmet: unmet.map((c) => c.label) };
}

// Two contrasting fictional patients to load with one click.
export const SAMPLE_PATIENTS: { name: string; blurb: string; facts: Facts }[] = [
  {
    name: "Jordan, 34 (County)",
    blurb: "Psychosis + trauma, using substances, housing at risk, no PIP, elevated risk.",
    facts: { area: "county", age: 34, diagnoses: ["Psychosis", "PTSD / trauma"], substance: "using", housing: "at-risk", pip: "none", risk: "elevated", veteran: false, carer: false },
  },
  {
    name: "Pat, 71 (City)",
    blurb: "Depression, settled housing, veteran and a carer, PIP awarded, low risk.",
    facts: { area: "city", age: 71, diagnoses: ["Depression / anxiety"], substance: "none", housing: "settled", pip: "awarded", risk: "low", veteran: true, carer: true },
  },
];
