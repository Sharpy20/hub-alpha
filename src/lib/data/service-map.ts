// Service "town map" - PROTOTYPE data + eligibility engine (v3, big build).
//
// Mike's idea: from a patient's profile facts, visually show which services are
// potentially open to them. Type CLUSTERS radiate from the centre; within a
// cluster, services branch off each other (node-off-node) where you reach one via
// another (e.g. Childline via NSPCC, IAPT providers via Talking Therapies). Paths
// go grey -> green as inclusion criteria are met, close off (red) on an exclusion
// or outside the catchment, and a child branch is cut off if its parent is closed.
//
// SOURCES: Derbyshire 24/7 MH Helpline signposting pack, the trust referral
// directory + prior FOCUS captures, and public/national service info. Contacts are
// PUBLIC helpline / service numbers only. Criteria are BEST-EFFORT and marked to
// verify - the definitive admission/exclusion/catchment work is the research
// session. No PII: profile facts are set live in the prototype page.

export type Area = "city" | "county" | "out";

export type Gender = "unspecified" | "female" | "male" | "nonbinary";

export interface Facts {
  area: Area;
  age: number;
  gender: Gender;
  diagnoses: string[];
  substance: "none" | "using" | "recovery";
  housing: "settled" | "at-risk" | "homeless";
  pip: "none" | "applied" | "awarded";
  risk: "low" | "elevated" | "acute";
  flags: string[]; // veteran, carer, domestic-abuse, dependent-children, bereaved, gambling, lgbtq, isolated
}

export const GENDER_OPTIONS: { v: Gender; label: string }[] = [
  { v: "unspecified", label: "Any" },
  { v: "female", label: "Female" },
  { v: "male", label: "Male" },
  { v: "nonbinary", label: "Non-binary" },
];

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
  { v: "perinatal", label: "Pregnant / <24m postpartum" },
  { v: "bereaved", label: "Recently bereaved" },
  { v: "gambling", label: "Gambling concern" },
  { v: "lgbtq", label: "LGBT+" },
  { v: "isolated", label: "Socially isolated / lonely" },
];

export const AREA_LABEL: Record<Area, string> = {
  city: "Derby City", county: "Derbyshire County", out: "Out of area",
};

export const EMPTY_FACTS: Facts = {
  area: "county", age: 40, gender: "unspecified", diagnoses: [], substance: "none",
  housing: "settled", pip: "none", risk: "low", flags: [],
};

export interface Cluster { id: string; label: string; color: string; }

// These colours carry WHITE text on the category headers, so each one has to
// clear 4.5:1 against white. Four did not (axe, 29 Jul) and were darkened by a
// step or two, keeping the same hue: sky 500->700 (2.77), yellow 600->800
// (2.93), green 600->700 (3.29), teal 600->700 (3.74). Check any new colour the
// same way before adding it.
export const CLUSTERS: Cluster[] = [
  { id: "crisis", label: "Crisis & Urgent", color: "#dc2626" },
  { id: "community", label: "Community & Secondary MH", color: "#005EB8" },
  { id: "talking", label: "Talking Therapies", color: "#0369a1" },
  { id: "substance", label: "Substance & Addiction", color: "#b45309" },
  { id: "practical", label: "Housing, Money & Practical", color: "#854d0e" },
  { id: "advocacy", label: "Advocacy & Rights", color: "#7c3aed" },
  { id: "condition", label: "Condition Charities", color: "#15803d" },
  { id: "life", label: "Life Events & Relationships", color: "#db2777" },
  { id: "cyp", label: "Children, YP & Family", color: "#0f766e" },
  { id: "ld-autism", label: "Learning Disability & Autism", color: "#9333ea" },
  { id: "vets", label: "Veterans", color: "#166534" },
  { id: "dementia", label: "Dementia & Later Life", color: "#475569" },
];

export interface Criterion { label: string; test: (f: Facts) => boolean; }

export interface Service {
  id: string;
  name: string;
  cluster: string;
  /**
   * A REAL dependency: you get to this service THROUGH that one, so if the
   * parent is closed this is genuinely out of reach (Crisis via the Helpline).
   * Only `parent` cuts a child off.
   */
  parent?: string;
  /**
   * Layout only: "draw me next to that one". Never gates access.
   *
   * Added 27 Jul after an audit found six national services unreachable out of
   * area because they hung off a Derbyshire-only parent - you do not need a
   * Duty to Refer to phone Shelter. `parent` was doing two jobs; this is the
   * other one.
   */
  near?: string;
  // areas = the areas of RESIDENCE the service accepts (where the PERSON LIVES),
  // NOT where the service building is. A service based in Derby can still accept
  // county residents, and vice versa. For most Derbyshire services catchment is
  // set by the person's home address or their registered GP - see catchmentNote.
  areas: Area[];
  include: Criterion[];
  exclude: Criterion[];
  contact?: string;       // public phone and/or website
  note?: string;
  catchmentNote?: string; // how catchment is decided (home address vs registered GP)
}

const dx = (f: Facts, d: string) => f.diagnoses.includes(d);
const severe = (f: Facts) => dx(f, "Psychosis") || dx(f, "Bipolar") || dx(f, "Personality disorder");
const anyDx = (f: Facts) => f.diagnoses.length > 0;
const flag = (f: Facts, x: string) => f.flags.includes(x);
const between = (f: Facts, lo: number, hi: number) => f.age >= lo && f.age <= hi;
const CC: Area[] = ["city", "county"];
const NAT: Area[] = ["city", "county", "out"]; // national = serves everyone incl. out-of-area

// ~100 services. Criteria are best-effort and to be verified.
export const SERVICES: Service[] = [
  // ============ Crisis & Urgent ============
  { id: "mh-helpline", name: "Derbyshire MH Helpline", cluster: "crisis", areas: CC, include: [], exclude: [], contact: "111 (option 2), 24/7", note: "The front door to urgent Derbyshire mental-health help." },
  { id: "crisis-hht", name: "Crisis / Home Treatment", cluster: "crisis", parent: "mh-helpline", areas: CC, include: [{ label: "Elevated or acute risk", test: (f) => f.risk !== "low" }], exclude: [], contact: "Derby/South 01332 623900; Chesterfield 01246 293284 (24h)", note: "Intensive support as an alternative to admission." },
  { id: "safe-haven", name: "Safe Haven (Derby)", cluster: "crisis", parent: "mh-helpline", areas: ["city"], include: [{ label: "In distress / elevated risk", test: (f) => f.risk !== "low" }, { label: "Aged 18+", test: (f) => f.age >= 18 }], exclude: [], contact: "0330 008 3722, 4:30pm-12:30am (P3)", note: "Out-of-hours drop-in safe space, self-referral, no appointment. For Derby City residents 18+.", catchmentNote: "By home address (Derby City residents)." },
  { id: "safe-haven-ches", name: "Safe Haven (Chesterfield)", cluster: "crisis", parent: "mh-helpline", areas: ["county"], include: [{ label: "In distress / elevated risk", test: (f) => f.risk !== "low" }, { label: "Aged 18+", test: (f) => f.age >= 18 }], exclude: [], contact: "01246 949410, 4:30pm-12:30am (P3)", note: "North Derbyshire out-of-hours drop-in safe space, self-referral. 18+.", catchmentNote: "By home address (north Derbyshire)." },
  { id: "picu", name: "PICU (Kingfisher)", cluster: "crisis", areas: NAT, include: [{ label: "Acute risk needing intensive care", test: (f) => f.risk === "acute" }, { label: "Mental health diagnosis", test: anyDx }], exclude: [] },
  { id: "samaritans", name: "Samaritans", cluster: "crisis", areas: NAT, include: [], exclude: [], contact: "116 123 (free, 24/7)", note: "Open to anyone, any time." },
  { id: "shout", name: "SHOUT crisis text", cluster: "crisis", parent: "samaritans", areas: NAT, include: [], exclude: [], contact: "Text SHOUT to 85258", note: "24/7 crisis text line, all ages." },
  { id: "papyrus", name: "Papyrus HOPELINE247 (u35)", cluster: "crisis", areas: NAT, include: [{ label: "Under 35", test: (f) => f.age < 35 }, { label: "Thoughts of suicide", test: (f) => f.risk !== "low" }], exclude: [], contact: "0800 068 4141" },
  { id: "calm", name: "CALM", cluster: "crisis", areas: NAT, include: [], exclude: [], contact: "0800 58 58 58 (5pm-midnight)", note: "Especially for men, but open to all." },
  { id: "nspa-line", name: "National Suicide Prevention Line", cluster: "crisis", areas: NAT, include: [{ label: "Thoughts of suicide", test: (f) => f.risk !== "low" }], exclude: [], contact: "0800 689 5652" },
  { id: "stay-alive", name: "Stay Alive app / Staying Safe", cluster: "crisis", areas: NAT, include: [{ label: "Any suicidal ideation", test: (f) => f.risk !== "low" }], exclude: [], contact: "stayingsafe.net", note: "Self-help safety-planning tools." },

  // ============ Community & Secondary MH ============
  { id: "cmht", name: "Living Well / CMHT (Adults)", cluster: "community", areas: CC, include: [{ label: "18+ with significant MH needs not met by primary care / IAPT", test: (f) => f.age >= 18 && (severe(f) || (anyDx(f) && f.risk !== "low")) }], exclude: [], note: "Living Well - short-term (up to 12 weeks) for people too unwell for primary care but below the CMHT threshold. Working age 18-65 (will see 65+ where needs align). GP referral. Serious/complex MH incl. dual diagnosis, complex trauma, homelessness - SMI not an exclusion.", catchmentNote: "By registered GP surgery (each Living Well team covers set surgeries)." },
  { id: "eip", name: "Early Intervention (Psychosis)", cluster: "community", parent: "cmht", areas: CC, include: [{ label: "Psychosis", test: (f) => dx(f, "Psychosis") }, { label: "Aged 14-65", test: (f) => between(f, 14, 65) }], exclude: [] },
  { id: "rehab", name: "Rehabilitation & Recovery", cluster: "community", parent: "cmht", areas: CC, include: [{ label: "Severe / enduring mental illness", test: severe }], exclude: [], note: "Longer-term recovery support." },
  { id: "complex-needs", name: "Complex Emotional Needs pathway", cluster: "community", parent: "cmht", areas: CC, include: [{ label: "Personality disorder / complex emotional needs", test: (f) => dx(f, "Personality disorder") }], exclude: [] },
  { id: "older-adult", name: "Older Adult Mental Health", cluster: "community", areas: CC, include: [{ label: "Aged 65+", test: (f) => f.age >= 65 }, { label: "Mental health need", test: anyDx }], exclude: [] },
  { id: "perinatal", name: "Perinatal Mental Health", cluster: "community", areas: CC, include: [{ label: "Pregnant (12+ weeks) or up to 24 months postpartum", test: (f) => flag(f, "perinatal") }, { label: "Serious or significant perinatal MH need", test: (f) => severe(f) || dx(f, "Depression / anxiety") || dx(f, "OCD") || dx(f, "PTSD / trauma") }], exclude: [], contact: "Derby 01332 623911; Chesterfield 01246 216523", note: "From 12 weeks pregnant to 24 months postpartum. Serious mental illness, or significant difficulties beyond primary care (incl. severe depression/anxiety, OCD, at risk of/history of puerperal psychosis). Self- or professional referral.", catchmentNote: "Live in Derbyshire and registered with a listed Derbyshire GP." },
  { id: "liaison", name: "Liaison Psychiatry", cluster: "community", areas: CC, include: [], exclude: [], note: "MH support within the acute general hospital (Royal Derby / Chesterfield Royal)." },
  { id: "eating-disorder", name: "Derbyshire Eating Disorder Service", cluster: "community", areas: CC, include: [{ label: "Eating disorder", test: (f) => dx(f, "Eating disorder") }, { label: "Aged 18+", test: (f) => f.age >= 18 }], exclude: [], note: "Adult eating-disorder service. GP/professional referral (not self-referral). Referral criteria widened - no longer BMI/weight alone.", catchmentNote: "By registered GP (Derby, Chesterfield, NE Derbyshire, High Peak)." },
  { id: "erp", name: "Emotion Regulation Pathway (ERP)", cluster: "community", parent: "cmht", areas: CC, include: [{ label: "Borderline PD / significant traits, high distress + service use", test: (f) => dx(f, "Personality disorder") }], exclude: [{ label: "Active / untreated psychosis - stabilise first", test: (f) => dx(f, "Psychosis") }, { label: "Ongoing substance use - address first", test: (f) => f.substance === "using" }], note: "SCM / DBT. Needs 2+ of impulsivity, emotional instability, relationship problems. Professional referral via SystmOne." },
  { id: "day-services", name: "Specialist Day Services (Midway/Dovedale)", cluster: "community", parent: "cmht", areas: CC, include: [{ label: "Would benefit from structured day-service groups", test: anyDx }], exclude: [], note: "Groups: Living Well, Cognitive Stimulation Therapy, Lifestyle Matters, Coping with Emotions." },
  { id: "mh-physio", name: "Mental Health Physiotherapy", cluster: "community", areas: CC, include: [{ label: "Physical problem + complex MH, open to DHCFT", test: anyDx }], exclude: [], note: "Secondary-care physio for those who can't access mainstream physio (falls assessment first if a falls risk)." },
  { id: "life-links", name: "Derby City Life Links", cluster: "community", areas: ["city"], include: [{ label: "Any mental health need", test: anyDx }], exclude: [], contact: "derbycitylifelinks.org.uk", note: "Richmond Fellowship - primary MH support." },

  // ============ Talking Therapies ============
  { id: "talking-therapies", name: "Derby & Derbyshire NHS Talking Therapies", cluster: "talking", areas: CC, include: [{ label: "Depression / anxiety, aged 16+", test: (f) => dx(f, "Depression / anxiety") && f.age >= 16 }], exclude: [{ label: "Active psychosis - needs secondary care", test: (f) => dx(f, "Psychosis") }, { label: "Acute risk / recent suicide attempt - needs crisis care", test: (f) => f.risk === "acute" }], contact: "0333 041 7262 / derby-talk.co.uk", note: "Self-referral, 16+. Not accepted if a suicide attempt in the last 4 weeks. Already under a mental health service - needs a professional referral, not self-referral.", catchmentNote: "By registered GP (a Derby or Derbyshire GP)." },
  { id: "everyturn", name: "Everyturn (was Insight)", cluster: "talking", parent: "talking-therapies", areas: CC, include: [], exclude: [], contact: "via derby-talk.co.uk", note: "Talking Therapies delivery partner." },
  { id: "trent-pts", name: "Trent PTS (legacy)", cluster: "talking", parent: "talking-therapies", areas: CC, include: [], exclude: [], contact: "01332 265659", note: "Former IAPT provider - NHS referrals now via derby-talk.co.uk." },
  { id: "drcs", name: "Derwent Rural Counselling", cluster: "talking", parent: "talking-therapies", areas: ["county"], include: [], exclude: [], contact: "0800 047 6861", note: "DRCS - county provider." },
  { id: "relate-derby", name: "Relate Derby", cluster: "talking", areas: ["city"], include: [], exclude: [], contact: "01332 349177", note: "Counselling + couples counselling." },
  { id: "relate-chesterfield", name: "Relate Chesterfield", cluster: "talking", areas: ["county"], include: [], exclude: [], contact: "01246 231010" },

  // ============ Substance & Addiction ============
  { id: "drp", name: "Derbyshire Recovery Partnership", cluster: "substance", areas: ["county"], include: [{ label: "Current use or in recovery", test: (f) => f.substance !== "none" }, { label: "Aged 18+", test: (f) => f.age >= 18 }], exclude: [], contact: "01246 206514 (self-referral)", note: "County drug & alcohol service (DRP), 18+. Self-referral.", catchmentNote: "By home address - for people who live in Derbyshire county (not Derby City)." },
  { id: "derby-das", name: "Derby Drug & Alcohol Recovery (Cranstoun)", cluster: "substance", areas: ["city"], include: [{ label: "Current use or in recovery", test: (f) => f.substance !== "none" }, { label: "Aged 18+", test: (f) => f.age >= 18 }], exclude: [], contact: "0300 790 0265", note: "Derby City drug & alcohol service (Cranstoun), 18+. Self-referral.", catchmentNote: "By home address - for people who live in Derby City." },
  { id: "aa", name: "Alcoholics Anonymous", cluster: "substance", areas: NAT, include: [{ label: "Alcohol use", test: (f) => f.substance !== "none" }], exclude: [], contact: "0800 917 7650 (24/7)" },
  { id: "na", name: "Narcotics Anonymous", cluster: "substance", areas: NAT, include: [{ label: "Drug use", test: (f) => f.substance !== "none" }], exclude: [], contact: "0300 999 1212" },
  { id: "alanon", name: "Al-Anon (families)", cluster: "substance", areas: NAT, include: [], exclude: [], contact: "0800 0086 811", note: "For families affected by someone's drinking." },
  { id: "adfam", name: "Adfam (families)", cluster: "substance", areas: NAT, include: [], exclude: [], contact: "adfam.org.uk", note: "Families affected by drugs/alcohol." },
  { id: "gamcare", name: "National Gambling Helpline", cluster: "substance", areas: NAT, include: [{ label: "Gambling concern", test: (f) => flag(f, "gambling") }], exclude: [], contact: "0808 8020 133 (24/7)" },
  { id: "smokefree", name: "Live Life Better Derbyshire (stop smoking)", cluster: "substance", areas: ["county"], include: [], exclude: [], contact: "livelifebetterderbyshire.org.uk", note: "Stop-smoking + healthy lifestyle." },

  // ============ Housing, Money & Practical ============
  { id: "housing-dtr", name: "Housing / Duty to Refer", cluster: "practical", areas: CC, include: [{ label: "At risk of, or experiencing, homelessness", test: (f) => f.housing !== "settled" }], exclude: [] },
  { id: "derby-homes", name: "Derby Homes / Housing Options", cluster: "practical", parent: "housing-dtr", areas: ["city"], include: [{ label: "Housing need in Derby City", test: (f) => f.housing !== "settled" }], exclude: [] },
  { id: "shelter", name: "Shelter housing advice", cluster: "practical", near: "housing-dtr", areas: NAT, include: [{ label: "Housing need", test: (f) => f.housing !== "settled" }], exclude: [], contact: "0808 800 4444" },
  { id: "social-care", name: "Social Care (Care Act)", cluster: "practical", areas: CC, include: [{ label: "Care & support need (housing, LD, or older adult)", test: (f) => f.housing !== "settled" || dx(f, "Learning disability") || f.age >= 65 }], exclude: [] },
  { id: "careline-derby", name: "Derby City Careline", cluster: "practical", parent: "social-care", areas: ["city"], include: [{ label: "Adult social-care need (City)", test: (f) => f.housing !== "settled" || dx(f, "Learning disability") || f.age >= 65 }], exclude: [], contact: "01332 640777" },
  { id: "call-derbyshire", name: "Call Derbyshire", cluster: "practical", parent: "social-care", areas: ["county"], include: [{ label: "Adult social-care need (County)", test: (f) => f.housing !== "settled" || dx(f, "Learning disability") || f.age >= 65 }], exclude: [], contact: "01629 533190" },
  { id: "welfare", name: "Welfare Rights / Benefits", cluster: "practical", areas: CC, include: [{ label: "Not yet receiving PIP / benefits help", test: (f) => f.pip !== "awarded" }], exclude: [] },
  { id: "citizens-advice", name: "Citizens Advice", cluster: "practical", near: "welfare", areas: NAT, include: [], exclude: [], contact: "0800 144 8848", note: "Money, benefits, debt, housing advice." },
  { id: "turn2us", name: "Turn2us (grants/benefits)", cluster: "practical", near: "welfare", areas: NAT, include: [{ label: "Financial hardship", test: (f) => f.pip !== "awarded" }], exclude: [], contact: "turn2us.org.uk" },
  { id: "foodbank", name: "Food bank (Trussell Trust)", cluster: "practical", areas: NAT, include: [{ label: "Financial hardship / housing need", test: (f) => f.housing !== "settled" || f.pip !== "awarded" }], exclude: [], contact: "Find local: trusselltrust.org" },

  // ============ Advocacy & Rights ============
  { id: "advocacy", name: "Advocacy (IMHA)", cluster: "advocacy", areas: CC, include: [], exclude: [], note: "Independent Mental Health Advocacy for detained + informal patients." },
  { id: "dda", name: "Disability Direct (City IMHA)", cluster: "advocacy", parent: "advocacy", areas: ["city"], include: [], exclude: [], contact: "01332 299449", note: "Derby City IMHA provider." },
  { id: "cloverleaf", name: "Cloverleaf (County IMHA)", cluster: "advocacy", parent: "advocacy", areas: ["county"], include: [], exclude: [], contact: "01924 454875", note: "Derbyshire County IMHA provider." },
  { id: "imca", name: "IMCA (Capacity Advocate)", cluster: "advocacy", parent: "advocacy", areas: CC, include: [], exclude: [], note: "For those who lack capacity with no one to consult." },

  // ============ Condition Charities ============
  { id: "mind", name: "Mind (national)", cluster: "condition", areas: NAT, include: [{ label: "Any mental health need", test: anyDx }], exclude: [], contact: "0300 123 3393" },
  { id: "derbyshire-mind", name: "Derbyshire Mind", cluster: "condition", parent: "mind", areas: CC, include: [{ label: "Any mental health need", test: anyDx }], exclude: [], contact: "01332 623732", note: "Local Mind (Derby + county) - groups, peer support, drop-ins." },
  { id: "mind-befriending", name: "Derbyshire Mind befriending & enablement", cluster: "condition", parent: "derbyshire-mind", areas: CC, include: [{ label: "Socially isolated / lonely", test: (f) => flag(f, "isolated") }, { label: "Mental health need", test: anyDx }], exclude: [], contact: "01332 623732 / derbyshiremind.org.uk", note: "Enablement work: regular 1:1 befriending and practical support to rebuild confidence and reconnect with the community after a rough patch or admission. To verify: current capacity + referral route." },
  { id: "rethink", name: "Rethink Mental Illness", cluster: "condition", areas: NAT, include: [{ label: "Severe mental illness, or a carer", test: (f) => severe(f) || flag(f, "carer") }], exclude: [], contact: "0808 801 0525" },
  { id: "rethink-derby", name: "Rethink Derby recovery & peer support", cluster: "condition", parent: "rethink", areas: ["city"], include: [{ label: "Severe mental illness, or a carer", test: (f) => severe(f) || flag(f, "carer") }], exclude: [], contact: "01773 734989" },
  { id: "anxiety-uk", name: "Anxiety UK", cluster: "condition", areas: NAT, include: [{ label: "Anxiety difficulty", test: (f) => dx(f, "Depression / anxiety") }], exclude: [], contact: "03444 775 774" },
  { id: "bipolar-uk", name: "Bipolar UK", cluster: "condition", areas: NAT, include: [{ label: "Bipolar", test: (f) => dx(f, "Bipolar") }], exclude: [], contact: "0333 323 3880 (peer support line)" },
  { id: "ocd-action", name: "OCD Action", cluster: "condition", areas: NAT, include: [{ label: "OCD", test: (f) => dx(f, "OCD") }], exclude: [], contact: "0300 636 5478" },
  { id: "ocd-uk", name: "OCD-UK", cluster: "condition", parent: "ocd-action", areas: NAT, include: [{ label: "OCD", test: (f) => dx(f, "OCD") }], exclude: [], contact: "0333 212 7890" },
  { id: "no-panic", name: "No Panic", cluster: "condition", areas: NAT, include: [{ label: "Panic / anxiety / OCD", test: (f) => dx(f, "Depression / anxiety") || dx(f, "OCD") }], exclude: [], contact: "0300 772 9844" },
  { id: "beat", name: "Beat (Eating Disorders)", cluster: "condition", areas: NAT, include: [{ label: "Eating disorder", test: (f) => dx(f, "Eating disorder") }], exclude: [], contact: "0808 801 0677" },
  { id: "saneline", name: "SANEline", cluster: "condition", areas: NAT, include: [{ label: "Any mental health need", test: anyDx }], exclude: [], contact: "0300 304 7000 (4pm-10pm)" },
  { id: "mhf", name: "Mental Health Foundation", cluster: "condition", areas: NAT, include: [], exclude: [], contact: "mentalhealth.org.uk", note: "Information + self-help resources." },
  { id: "hub-of-hope", name: "Hub of Hope (directory)", cluster: "condition", areas: NAT, include: [], exclude: [], contact: "hubofhope.co.uk", note: "Finds local support near a postcode." },

  // ============ Life Events & Relationships ============
  { id: "refuge", name: "Refuge / National DA Helpline", cluster: "life", areas: NAT, include: [{ label: "Domestic abuse concern", test: (f) => flag(f, "domestic-abuse") }], exclude: [], contact: "0808 2000 247 (24/7)" },
  { id: "mens-advice", name: "Men's Advice Line", cluster: "life", parent: "refuge", areas: NAT, include: [{ label: "Domestic abuse concern", test: (f) => flag(f, "domestic-abuse") }, { label: "Male victim", test: (f) => f.gender === "male" }], exclude: [], contact: "0808 801 0327" },
  { id: "galop", name: "Galop (LGBT+ DA)", cluster: "life", parent: "refuge", areas: NAT, include: [{ label: "Domestic abuse (LGBT+)", test: (f) => flag(f, "domestic-abuse") }], exclude: [], contact: "0800 999 5428" },
  { id: "elm", name: "Derbyshire DA Helpline (Elm Foundation)", cluster: "life", parent: "refuge", areas: CC, include: [{ label: "Domestic abuse in Derbyshire", test: (f) => flag(f, "domestic-abuse") }], exclude: [], contact: "08000 198 668 (24/7)", note: "Local front door - routes to refuge, outreach, advocacy." },
  { id: "sv2", name: "SV2 (Sexual Violence, Derbyshire)", cluster: "life", areas: CC, include: [], exclude: [], contact: "01773 746115", note: "Supporting victims of sexual violence, all ages/genders." },
  { id: "rape-crisis", name: "Rape Crisis", cluster: "life", near: "sv2", areas: NAT, include: [], exclude: [], contact: "0808 500 2222 (24/7)" },
  { id: "victim-support", name: "Victim Support / Derbyshire Victim Services", cluster: "life", areas: NAT, include: [], exclude: [], contact: "Derbyshire 0800 612 6505; national 0808 168 9111 (24/7)", note: "Victims of any crime, reported or not." },
  { id: "cruse", name: "Cruse Bereavement", cluster: "life", areas: NAT, include: [{ label: "Recently bereaved", test: (f) => flag(f, "bereaved") }], exclude: [], contact: "0808 808 1677" },
  { id: "sobs", name: "SOBS (Bereaved by Suicide)", cluster: "life", parent: "cruse", areas: NAT, include: [{ label: "Recently bereaved", test: (f) => flag(f, "bereaved") }], exclude: [], contact: "0300 111 5065" },
  { id: "derbys-bereavement", name: "Derbyshire Bereavement Hub", cluster: "life", parent: "cruse", areas: ["county"], include: [{ label: "Recently bereaved", test: (f) => flag(f, "bereaved") }], exclude: [], contact: "derbyshirebereavementhub.co.uk" },
  { id: "silverline", name: "Silver Line (older people)", cluster: "life", areas: NAT, include: [{ label: "Aged 55+", test: (f) => f.age >= 55 }], exclude: [], contact: "0800 4 70 80 90 (24/7)", note: "Friendship line for older people - especially those feeling lonely or isolated." },
  { id: "re-engage", name: "Re-engage (75+ social groups)", cluster: "life", parent: "silverline", areas: NAT, include: [{ label: "Aged 75+", test: (f) => f.age >= 75 }, { label: "Socially isolated / lonely", test: (f) => flag(f, "isolated") }], exclude: [], contact: "0800 716543 / reengage.org.uk", note: "Free monthly tea parties and call companions for isolated older people." },
  { id: "age-uk", name: "Age UK Derby & Derbyshire", cluster: "life", areas: CC, include: [{ label: "Older adult (roughly 50+)", test: (f) => f.age >= 50 }], exclude: [], contact: "01773 768240", note: "Covers both Derby City and Derbyshire county.", catchmentNote: "By home address (Derby City + Derbyshire)." },
  { id: "carers-derbyshire", name: "Carers in Derbyshire", cluster: "life", areas: ["county"], include: [{ label: "Is a carer", test: (f) => flag(f, "carer") }], exclude: [], contact: "01773 833 833", note: "County carers - assessments, advice, peer groups (not Derby City)." },
  { id: "carers-direct", name: "NHS Carers Direct", cluster: "life", near: "carers-derbyshire", areas: NAT, include: [{ label: "Is a carer", test: (f) => flag(f, "carer") }], exclude: [], contact: "0300 123 1053" },
  { id: "derbyshire-lgbt", name: "Derbyshire LGBT+", cluster: "life", areas: CC, include: [{ label: "LGBT+ (support around identity, sexuality or gender)", test: (f) => flag(f, "lgbtq") }], exclude: [], contact: "01332 207704 / derbyshirelgbt.org.uk", note: "Local LGBT+ charity - 1:1 support, groups and advocacy across Derby and Derbyshire. To verify: current referral route.", catchmentNote: "By home address (Derby City + Derbyshire)." },
  { id: "switchboard-lgbt", name: "Switchboard LGBT+ Helpline", cluster: "life", near: "derbyshire-lgbt", areas: NAT, include: [{ label: "LGBT+ (support around identity, sexuality or gender)", test: (f) => flag(f, "lgbtq") }], exclude: [], contact: "0800 0119 100 (10am-10pm) / switchboard.lgbt", note: "National listening service run by LGBT+ volunteers - phone, chat and email." },
  { id: "andys-man-club", name: "Andy's Man Club", cluster: "life", areas: NAT, include: [{ label: "Man aged 18+", test: (f) => f.gender === "male" && f.age >= 18 }], exclude: [], contact: "andysmanclub.co.uk - Mondays 7pm, free, no referral", note: "Peer-support talking groups for men, including Derby and Chesterfield groups. Just turn up." },
  { id: "womens-work", name: "Women's Work Derbyshire", cluster: "life", areas: CC, include: [{ label: "Woman aged 18+", test: (f) => f.gender === "female" && f.age >= 18 }], exclude: [], contact: "womens-work.org.uk", note: "Derby-based charity supporting vulnerable women - outreach, groups, 1:1. To verify: referral route + current contact number." },

  // ============ Children, YP & Family ============
  { id: "camhs", name: "CAMHS (Derbyshire/Derby)", cluster: "cyp", areas: CC, include: [{ label: "Under 18", test: (f) => f.age < 18 }, { label: "Mental health need", test: anyDx }], exclude: [], contact: "SPOA 0300 790 0264; crisis 01332 623700", note: "Children & young people's MH service (referral via a professional)." },
  { id: "kooth", name: "Kooth (11-25)", cluster: "cyp", areas: NAT, include: [{ label: "Aged 11-25", test: (f) => between(f, 11, 25) }], exclude: [], contact: "kooth.com" },
  { id: "the-mix", name: "The Mix (under 25)", cluster: "cyp", areas: NAT, include: [{ label: "Under 25", test: (f) => f.age <= 25 }], exclude: [], contact: "0808 808 4994" },
  { id: "young-minds", name: "Young Minds (Parents Helpline)", cluster: "cyp", areas: NAT, include: [{ label: "Parent of a child", test: (f) => flag(f, "dependent-children") }], exclude: [], contact: "0808 802 5544" },
  { id: "ym-crisis", name: "Young Minds Crisis Messenger", cluster: "cyp", parent: "young-minds", areas: NAT, include: [{ label: "Young person, or parent of one", test: (f) => f.age < 18 || flag(f, "dependent-children") }], exclude: [], contact: "Text YM to 85258" },
  { id: "nspcc", name: "NSPCC (worried about a child)", cluster: "cyp", areas: NAT, include: [{ label: "Concern for a child", test: (f) => flag(f, "dependent-children") }], exclude: [], contact: "0808 800 5000" },
  { id: "childline", name: "Childline", cluster: "cyp", parent: "nspcc", areas: NAT, include: [{ label: "Under 18", test: (f) => f.age < 18 }], exclude: [], contact: "0800 1111" },
  { id: "family-lives", name: "Family Lives", cluster: "cyp", areas: NAT, include: [{ label: "Parent / family concern", test: (f) => flag(f, "dependent-children") }], exclude: [], contact: "0808 800 2222" },
  { id: "chat-health", name: "Chat Health (Derby 11-19)", cluster: "cyp", areas: ["city"], include: [{ label: "Aged 11-19", test: (f) => between(f, 11, 19) }], exclude: [], contact: "Text 07507 327104" },
  { id: "starting-point", name: "Starting Point (Derbyshire)", cluster: "cyp", areas: ["county"], include: [{ label: "Concern for a child (county)", test: (f) => flag(f, "dependent-children") }], exclude: [], contact: "01629 533190", note: "Children's safeguarding front door." },
  { id: "home-start", name: "Home-Start (family support)", cluster: "cyp", areas: CC, include: [{ label: "Family with young children", test: (f) => flag(f, "dependent-children") }], exclude: [] },

  // ============ Learning Disability & Autism ============
  { id: "ist", name: "Intensive Support Team (LD/Autism)", cluster: "ld-autism", areas: CC, include: [{ label: "Learning disability or autism", test: (f) => dx(f, "Learning disability") || dx(f, "Autism (ASD)") }], exclude: [], contact: "01332 268455", note: "Crisis/behaviour support, 16+." },
  { id: "ld-team", name: "Community LD Team (health)", cluster: "ld-autism", areas: CC, include: [{ label: "Learning disability", test: (f) => dx(f, "Learning disability") }], exclude: [] },
  { id: "neuro-assess", name: "Adult Autism Assessment", cluster: "ld-autism", areas: CC, include: [{ label: "Autism assessment, aged 18+", test: (f) => dx(f, "Autism (ASD)") && f.age >= 18 }], exclude: [{ label: "Learning disability - use LD services instead", test: (f) => dx(f, "Learning disability") }], contact: "0300 1234574; self-referral + AQ50", note: "Adult autism assessment (18+), self-referral with AQ50, where autism is suspected of affecting mental health or day-to-day functioning. Not for a pre-existing autism diagnosis. Adult ADHD is NOT assessed here - GP refers via Right to Choose.", catchmentNote: "By registered GP (a Derby or Derbyshire GP)." },
  { id: "mencap", name: "Mencap", cluster: "ld-autism", areas: NAT, include: [{ label: "Learning disability", test: (f) => dx(f, "Learning disability") }], exclude: [], contact: "0808 808 1111" },
  { id: "autism-derbyshire", name: "Derbyshire Autism Information Service", cluster: "ld-autism", areas: ["county"], include: [{ label: "Autism", test: (f) => dx(f, "Autism (ASD)") }], exclude: [], contact: "autisminformationservice.org.uk" },
  { id: "nas", name: "National Autistic Society", cluster: "ld-autism", areas: NAT, include: [{ label: "Autism", test: (f) => dx(f, "Autism (ASD)") }], exclude: [], contact: "0808 800 4104" },
  { id: "autistica", name: "Autistica", cluster: "ld-autism", parent: "nas", areas: NAT, include: [{ label: "Autism", test: (f) => dx(f, "Autism (ASD)") }], exclude: [], note: "Research + telephone-appointment tips." },

  // ============ Veterans ============
  { id: "op-courage", name: "Op COURAGE (NHS Veterans MH)", cluster: "vets", areas: NAT, include: [{ label: "Served 1+ day in the UK armed forces", test: (f) => flag(f, "veteran") }], exclude: [], contact: "0300 323 0137", note: "NHS veterans' mental health service. Any length of service, however long ago. Self-, family- or professional referral.", catchmentNote: "Resident in England + registered with (or willing to register with) an English GP." },
  { id: "combat-stress", name: "Combat Stress", cluster: "vets", parent: "op-courage", areas: NAT, include: [{ label: "Veteran with mental-health need", test: (f) => flag(f, "veteran") }], exclude: [], contact: "0800 138 1619 (24/7)" },
  { id: "help-heroes", name: "Help for Heroes", cluster: "vets", areas: NAT, include: [{ label: "Veteran / forces community", test: (f) => flag(f, "veteran") }], exclude: [], contact: "helpforheroes.org.uk" },
  { id: "ssafa", name: "SSAFA (Forces charity)", cluster: "vets", areas: NAT, include: [{ label: "Forces community", test: (f) => flag(f, "veteran") }], exclude: [], contact: "0800 731 4880" },
  { id: "rbl", name: "Royal British Legion", cluster: "vets", areas: NAT, include: [{ label: "Forces community", test: (f) => flag(f, "veteran") }], exclude: [], contact: "0808 802 8080" },
  { id: "vets-gateway", name: "Veterans' Gateway", cluster: "vets", areas: NAT, include: [{ label: "Veteran", test: (f) => flag(f, "veteran") }], exclude: [], contact: "0808 802 1212", note: "Single point of contact for veterans." },

  // ============ Dementia & Later Life ============
  { id: "memory-service", name: "Memory Assessment Service", cluster: "dementia", areas: CC, include: [{ label: "Memory concern / dementia", test: (f) => dx(f, "Dementia") || f.age >= 65 }], exclude: [], note: "Assessment + diagnosis." },
  { id: "dlt", name: "Discharge Liaison Team (Older Adults)", cluster: "dementia", areas: CC, include: [{ label: "65+ with a MH diagnosis, or any age with dementia", test: (f) => (f.age >= 65 && anyDx(f)) || dx(f, "Dementia") }], exclude: [], note: "Nursing placement assessments + CHC checklist / DST funding. Referral from CMHT, social care, or Dementia Rapid Response." },
  { id: "alzheimers", name: "Alzheimer's Society", cluster: "dementia", areas: NAT, include: [{ label: "Dementia", test: (f) => dx(f, "Dementia") }], exclude: [], contact: "0333 150 3456" },
  { id: "alzheimers-derbyshire", name: "Alzheimer's Society Derbyshire", cluster: "dementia", parent: "alzheimers", areas: ["county"], include: [{ label: "Dementia (local)", test: (f) => dx(f, "Dementia") }], exclude: [], contact: "01332 208845" },
  { id: "dementia-uk", name: "Dementia UK (Admiral Nurses)", cluster: "dementia", areas: NAT, include: [{ label: "Dementia (patient or carer)", test: (f) => dx(f, "Dementia") || flag(f, "carer") }], exclude: [], contact: "0800 888 6678" },
  { id: "tide", name: "Tide (dementia carers)", cluster: "dementia", parent: "dementia-uk", areas: NAT, include: [{ label: "Carer of someone with dementia", test: (f) => flag(f, "carer") }], exclude: [], contact: "tide.uk.net" },
  { id: "herbert", name: "Herbert Protocol (Police)", cluster: "dementia", areas: ["county"], include: [{ label: "Dementia (risk of going missing)", test: (f) => dx(f, "Dementia") }], exclude: [], note: "Pre-completed form to help find a missing vulnerable person." },
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
    return { state: "blocked", score: 0, blockedReason: `Outside catchment - accepts people living in ${svc.areas.map((a) => AREA_LABEL[a]).join(" / ")}`, met: [], unmet: [] };
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
  { name: "Jordan, 34 (County)", blurb: "Psychosis + trauma, using substances, housing at risk, elevated risk.", facts: { area: "county", age: 34, gender: "male", diagnoses: ["Psychosis", "PTSD / trauma"], substance: "using", housing: "at-risk", pip: "none", risk: "elevated", flags: [] } },
  { name: "Pat, 71 (City)", blurb: "Depression, veteran + carer, recently bereaved, socially isolated, PIP awarded.", facts: { area: "city", age: 71, gender: "female", diagnoses: ["Depression / anxiety"], substance: "none", housing: "settled", pip: "awarded", risk: "low", flags: ["veteran", "carer", "bereaved", "isolated"] } },
  { name: "Sam, 19 (City)", blurb: "Depression/anxiety, elevated risk, LGBT+.", facts: { area: "city", age: 19, gender: "nonbinary", diagnoses: ["Depression / anxiety"], substance: "none", housing: "settled", pip: "none", risk: "elevated", flags: ["lgbtq"] } },
  { name: "Chris, 48 (County)", blurb: "Domestic abuse, gambling debt, no diagnosis recorded.", facts: { area: "county", age: 48, gender: "female", diagnoses: [], substance: "none", housing: "at-risk", pip: "applied", risk: "elevated", flags: ["domestic-abuse", "gambling"] } },
];
