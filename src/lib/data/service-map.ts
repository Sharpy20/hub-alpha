// Service "town map" - PROTOTYPE data + eligibility engine (v2).
//
// Mike's idea: from a patient's profile facts, visually show which services are
// potentially open to them. Type CLUSTERS radiate from the centre; within a
// cluster, services branch off each other (node-off-node) where you reach one
// via another. Paths go grey -> green as inclusion criteria are met, and close
// off (red) on an exclusion or outside the catchment. A child branch is also
// cut off if its parent is closed (you can't reach it).
//
// Service list widened from the Derbyshire 24/7 MH Helpline signposting pack
// plus the trust referral directory. STILL ILLUSTRATIVE DEMO DATA - real
// admission/exclusion/catchment criteria come from the research session. No PII.

export type Area = "city" | "county" | "out";

export interface Facts {
  area: Area;
  age: number;
  diagnoses: string[];
  substance: "none" | "using" | "recovery";
  housing: "settled" | "at-risk" | "homeless";
  pip: "none" | "applied" | "awarded";
  risk: "low" | "elevated" | "acute";
  flags: string[]; // veteran, carer, domestic-abuse, dependent-children, bereaved, gambling
}

export const DIAGNOSIS_OPTIONS = [
  "Depression / anxiety", "Psychosis", "Bipolar", "Personality disorder",
  "PTSD / trauma", "OCD", "Eating disorder", "Learning disability",
  "Autism (ASD)", "Dementia",
];

export const FLAG_OPTIONS = [
  { v: "veteran", label: "Veteran" },
  { v: "carer", label: "Carer" },
  { v: "domestic-abuse", label: "Domestic abuse" },
  { v: "dependent-children", label: "Has children" },
  { v: "bereaved", label: "Recently bereaved" },
  { v: "gambling", label: "Gambling concern" },
];

export const AREA_LABEL: Record<Area, string> = {
  city: "Derby City", county: "Derbyshire County", out: "Out of area",
};

export const EMPTY_FACTS: Facts = {
  area: "county", age: 40, diagnoses: [], substance: "none",
  housing: "settled", pip: "none", risk: "low", flags: [],
};

export interface Cluster { id: string; label: string; color: string; }

export const CLUSTERS: Cluster[] = [
  { id: "crisis", label: "Crisis & Urgent", color: "#dc2626" },
  { id: "community", label: "Community MH", color: "#005EB8" },
  { id: "talking", label: "Talking Therapies", color: "#0ea5e9" },
  { id: "substance", label: "Substance & Addiction", color: "#b45309" },
  { id: "practical", label: "Housing, Benefits & Practical", color: "#ca8a04" },
  { id: "advocacy", label: "Advocacy", color: "#7c3aed" },
  { id: "condition", label: "Condition-specific Charities", color: "#16a34a" },
  { id: "life", label: "Life Events & Relationships", color: "#db2777" },
  { id: "cyp", label: "Children, YP & Family", color: "#0d9488" },
  { id: "vets", label: "Veterans & Dementia", color: "#475569" },
];

export interface Criterion { label: string; test: (f: Facts) => boolean; }

export interface Service {
  id: string;
  name: string;
  cluster: string;
  parent?: string;        // node-off-node: reached via this service
  areas: Area[];
  include: Criterion[];
  exclude: Criterion[];
  note?: string;
}

const dx = (f: Facts, d: string) => f.diagnoses.includes(d);
const severe = (f: Facts) => dx(f, "Psychosis") || dx(f, "Bipolar") || dx(f, "Personality disorder");
const anyDx = (f: Facts) => f.diagnoses.length > 0;
const flag = (f: Facts, x: string) => f.flags.includes(x);
const ageBetween = (f: Facts, lo: number, hi: number) => f.age >= lo && f.age <= hi;
const CITY_COUNTY: Area[] = ["city", "county"];
const ANY: Area[] = ["city", "county", "out"];

export const SERVICES: Service[] = [
  // ---- Crisis & Urgent ----
  { id: "mh-helpline", name: "MH Helpline (111 opt 2)", cluster: "crisis", areas: CITY_COUNTY, include: [], exclude: [], note: "24/7 Derbyshire crisis line - the front door to urgent help." },
  { id: "crisis", name: "Crisis / Home Treatment", cluster: "crisis", parent: "mh-helpline", areas: CITY_COUNTY, include: [{ label: "Elevated or acute risk", test: (f) => f.risk !== "low" }], exclude: [] },
  { id: "safe-haven", name: "Safe Haven", cluster: "crisis", parent: "mh-helpline", areas: ["city"], include: [{ label: "In distress / elevated risk", test: (f) => f.risk !== "low" }], exclude: [], note: "Out-of-hours safe space, accessed via the helpline." },
  { id: "samaritans", name: "Samaritans (116 123)", cluster: "crisis", areas: ANY, include: [], exclude: [], note: "Open to anyone, any time." },
  { id: "shout", name: "SHOUT (text 85258)", cluster: "crisis", parent: "samaritans", areas: ANY, include: [], exclude: [], note: "24/7 crisis text line, all ages." },
  { id: "papyrus", name: "Papyrus HOPELINE (u35)", cluster: "crisis", areas: ANY, include: [{ label: "Under 35", test: (f) => f.age < 35 }, { label: "Thoughts of suicide", test: (f) => f.risk !== "low" }], exclude: [], note: "Suicide-prevention line for under-35s." },
  { id: "picu", name: "PICU (Kingfisher)", cluster: "crisis", areas: ANY, include: [{ label: "Acute risk needing intensive care", test: (f) => f.risk === "acute" }, { label: "Mental health diagnosis", test: anyDx }], exclude: [] },

  // ---- Community MH ----
  { id: "cmht", name: "Community MH Team", cluster: "community", areas: CITY_COUNTY, include: [{ label: "Severe / enduring mental illness", test: severe }], exclude: [] },
  { id: "eip", name: "Early Intervention (Psychosis)", cluster: "community", parent: "cmht", areas: CITY_COUNTY, include: [{ label: "Psychosis", test: (f) => dx(f, "Psychosis") }, { label: "Aged 14-65", test: (f) => ageBetween(f, 14, 65) }], exclude: [] },
  { id: "older-adult", name: "Older Adult MH", cluster: "community", areas: CITY_COUNTY, include: [{ label: "Aged 65+", test: (f) => f.age >= 65 }, { label: "Mental health need", test: anyDx }], exclude: [] },
  { id: "ist", name: "Intensive Support (LD / Autism)", cluster: "community", areas: CITY_COUNTY, include: [{ label: "Learning disability or autism", test: (f) => dx(f, "Learning disability") || dx(f, "Autism (ASD)") }], exclude: [] },
  { id: "life-links", name: "Life Links (Derby City)", cluster: "community", areas: ["city"], include: [{ label: "Any mental health need", test: anyDx }], exclude: [], note: "Primary-care MH support, Derby City." },

  // ---- Talking Therapies ----
  { id: "talking-therapies", name: "NHS Talking Therapies", cluster: "talking", areas: CITY_COUNTY, include: [{ label: "Depression / anxiety", test: (f) => dx(f, "Depression / anxiety") }], exclude: [{ label: "Active psychosis - needs secondary care", test: (f) => dx(f, "Psychosis") }, { label: "Acute risk - needs crisis care", test: (f) => f.risk === "acute" }] },
  { id: "trent-pts", name: "Trent PTS", cluster: "talking", parent: "talking-therapies", areas: CITY_COUNTY, include: [], exclude: [], note: "IAPT provider." },
  { id: "insight", name: "Insight Healthcare", cluster: "talking", parent: "talking-therapies", areas: CITY_COUNTY, include: [], exclude: [], note: "IAPT provider." },
  { id: "drcs", name: "DRCS Counselling", cluster: "talking", parent: "talking-therapies", areas: CITY_COUNTY, include: [], exclude: [] },

  // ---- Substance & Addiction ----
  { id: "drp", name: "Derbyshire Recovery Partnership", cluster: "substance", areas: CITY_COUNTY, include: [{ label: "Current use or in recovery", test: (f) => f.substance !== "none" }], exclude: [] },
  { id: "aa", name: "Alcoholics Anonymous", cluster: "substance", parent: "drp", areas: ANY, include: [], exclude: [] },
  { id: "na", name: "Narcotics Anonymous", cluster: "substance", parent: "drp", areas: ANY, include: [], exclude: [] },
  { id: "gamcare", name: "National Gambling Helpline", cluster: "substance", areas: ANY, include: [{ label: "Gambling concern", test: (f) => flag(f, "gambling") }], exclude: [] },

  // ---- Housing, Benefits & Practical ----
  { id: "social-care", name: "Social Care (Care Act)", cluster: "practical", areas: CITY_COUNTY, include: [{ label: "Care & support need (housing, LD or older adult)", test: (f) => f.housing !== "settled" || dx(f, "Learning disability") || f.age >= 65 }], exclude: [] },
  { id: "housing", name: "Housing / Duty to Refer", cluster: "practical", areas: CITY_COUNTY, include: [{ label: "At risk of, or experiencing, homelessness", test: (f) => f.housing !== "settled" }], exclude: [] },
  { id: "accommodation", name: "Supported Accommodation", cluster: "practical", parent: "housing", areas: CITY_COUNTY, include: [{ label: "Currently homeless", test: (f) => f.housing === "homeless" }], exclude: [] },
  { id: "welfare", name: "Welfare Rights / PIP", cluster: "practical", areas: ANY, include: [{ label: "Not yet receiving PIP", test: (f) => f.pip !== "awarded" }], exclude: [] },
  { id: "citizens-advice", name: "Citizens Advice", cluster: "practical", parent: "welfare", areas: ANY, include: [], exclude: [] },

  // ---- Advocacy ----
  { id: "advocacy", name: "Advocacy (IMHA)", cluster: "advocacy", areas: CITY_COUNTY, include: [], exclude: [], note: "Independent Mental Health Advocacy." },
  { id: "advocacy-city", name: "Disability Direct (City)", cluster: "advocacy", parent: "advocacy", areas: ["city"], include: [], exclude: [] },
  { id: "advocacy-county", name: "Cloverleaf (County)", cluster: "advocacy", parent: "advocacy", areas: ["county"], include: [], exclude: [] },

  // ---- Condition-specific charities ----
  { id: "mind", name: "Mind (Derby/Derbyshire)", cluster: "condition", areas: CITY_COUNTY, include: [{ label: "Any mental health need", test: anyDx }], exclude: [] },
  { id: "rethink", name: "Rethink (Derby recovery)", cluster: "condition", areas: ["city"], include: [{ label: "Severe mental illness, or a carer", test: (f) => severe(f) || flag(f, "carer") }], exclude: [] },
  { id: "anxiety-uk", name: "Anxiety UK", cluster: "condition", areas: ANY, include: [{ label: "Anxiety difficulty", test: (f) => dx(f, "Depression / anxiety") }], exclude: [] },
  { id: "bipolar-uk", name: "Bipolar UK", cluster: "condition", areas: ANY, include: [{ label: "Bipolar", test: (f) => dx(f, "Bipolar") }], exclude: [] },
  { id: "ocd-uk", name: "OCD Action / OCD-UK", cluster: "condition", areas: ANY, include: [{ label: "OCD", test: (f) => dx(f, "OCD") }], exclude: [] },
  { id: "beat", name: "Beat (Eating Disorders)", cluster: "condition", areas: ANY, include: [{ label: "Eating disorder", test: (f) => dx(f, "Eating disorder") }], exclude: [] },
  { id: "mencap", name: "Mencap (Learning Disability)", cluster: "condition", areas: ANY, include: [{ label: "Learning disability", test: (f) => dx(f, "Learning disability") }], exclude: [] },

  // ---- Life events & relationships ----
  { id: "cruse", name: "Cruse (Bereavement)", cluster: "life", areas: ANY, include: [{ label: "Recently bereaved", test: (f) => flag(f, "bereaved") }], exclude: [] },
  { id: "sobs", name: "SOBS (Bereaved by Suicide)", cluster: "life", parent: "cruse", areas: ANY, include: [{ label: "Recently bereaved", test: (f) => flag(f, "bereaved") }], exclude: [] },
  { id: "refuge", name: "Refuge / Nat. DA Helpline", cluster: "life", areas: ANY, include: [{ label: "Domestic abuse concern", test: (f) => flag(f, "domestic-abuse") }], exclude: [] },
  { id: "relate", name: "Relate (Relationships)", cluster: "life", areas: CITY_COUNTY, include: [], exclude: [] },
  { id: "silverline", name: "Silverline (Older People)", cluster: "life", areas: ANY, include: [{ label: "Aged 55+", test: (f) => f.age >= 55 }], exclude: [] },
  { id: "carers-support", name: "Carers Support", cluster: "life", areas: CITY_COUNTY, include: [{ label: "Is a carer", test: (f) => flag(f, "carer") }], exclude: [] },

  // ---- Children, YP & Family ----
  { id: "young-minds", name: "Young Minds (Parents/YP)", cluster: "cyp", areas: ANY, include: [{ label: "Has children, or is under 18", test: (f) => flag(f, "dependent-children") || f.age < 18 }], exclude: [] },
  { id: "kooth", name: "Kooth (11-25)", cluster: "cyp", areas: ANY, include: [{ label: "Aged 11-25", test: (f) => ageBetween(f, 11, 25) }], exclude: [] },
  { id: "nspcc", name: "NSPCC / Childline", cluster: "cyp", areas: ANY, include: [{ label: "Has children (concern for a child)", test: (f) => flag(f, "dependent-children") }], exclude: [] },
  { id: "chat-health", name: "Chat Health (Derby 11-19)", cluster: "cyp", areas: ["city"], include: [{ label: "Aged 11-19", test: (f) => ageBetween(f, 11, 19) }], exclude: [] },

  // ---- Veterans & Dementia ----
  { id: "op-courage", name: "Op Courage (Veterans)", cluster: "vets", areas: ANY, include: [{ label: "Armed-forces veteran", test: (f) => flag(f, "veteran") }], exclude: [] },
  { id: "help-heroes", name: "Help for Heroes", cluster: "vets", parent: "op-courage", areas: ANY, include: [{ label: "Armed-forces veteran", test: (f) => flag(f, "veteran") }], exclude: [] },
  { id: "alzheimers", name: "Alzheimer's Society", cluster: "vets", areas: CITY_COUNTY, include: [{ label: "Dementia", test: (f) => dx(f, "Dementia") }], exclude: [] },
  { id: "dementia-uk", name: "Dementia UK (Admiral Nurses)", cluster: "vets", parent: "alzheimers", areas: ANY, include: [{ label: "Dementia", test: (f) => dx(f, "Dementia") }], exclude: [] },
];

export type ServiceState = "open" | "partial" | "unknown" | "blocked";

export interface Evaluation {
  state: ServiceState;
  score: number;
  blockedReason?: string;
  met: string[];
  unmet: string[];
}

export function evaluate(svc: Service, f: Facts): Evaluation {
  if (!svc.areas.includes(f.area)) {
    return { state: "blocked", score: 0, blockedReason: `Outside catchment - serves ${svc.areas.map((a) => AREA_LABEL[a]).join(" / ")}`, met: [], unmet: [] };
  }
  const exHit = svc.exclude.find((c) => c.test(f));
  if (exHit) return { state: "blocked", score: 0, blockedReason: exHit.label, met: [], unmet: [] };
  const met = svc.include.filter((c) => c.test(f));
  const unmet = svc.include.filter((c) => !c.test(f));
  const score = svc.include.length ? met.length / svc.include.length : 1;
  const state: ServiceState = score >= 1 ? "open" : score > 0 ? "partial" : "unknown";
  return { state, score, met: met.map((c) => c.label), unmet: unmet.map((c) => c.label) };
}

export const SAMPLE_PATIENTS: { name: string; blurb: string; facts: Facts }[] = [
  { name: "Jordan, 34 (County)", blurb: "Psychosis + trauma, using substances, housing at risk, elevated risk.", facts: { area: "county", age: 34, diagnoses: ["Psychosis", "PTSD / trauma"], substance: "using", housing: "at-risk", pip: "none", risk: "elevated", flags: [] } },
  { name: "Pat, 71 (City)", blurb: "Depression, settled, veteran + carer, recently bereaved, PIP awarded.", facts: { area: "city", age: 71, diagnoses: ["Depression / anxiety"], substance: "none", housing: "settled", pip: "awarded", risk: "low", flags: ["veteran", "carer", "bereaved"] } },
  { name: "Sam, 19 (City)", blurb: "Depression/anxiety, elevated risk, no other needs.", facts: { area: "city", age: 19, diagnoses: ["Depression / anxiety"], substance: "none", housing: "settled", pip: "none", risk: "elevated", flags: [] } },
];
