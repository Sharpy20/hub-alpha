// ---------------------------------------------------------------------------
// TRAINING QUIZ - question bank
// ---------------------------------------------------------------------------
// A just-for-fun revision quiz for inpatient mental health staff. NO SCORING is
// stored anywhere and nothing is tracked - this is a private learning aid, not
// an assessment. See /quiz.
//
// Every question carries a difficulty (Easy / Medium / Hard), a plain-English
// rationale, and its source so it can be checked and kept current. Facts are
// cross-referenced against national guidance (NICE, BNF, NMC, RCN, Resus Council
// UK, gov.uk / legislation) and Trust policy where relevant.
//
// DIFFICULTY RUBRIC (keep it consistent when adding questions):
//   Easy   - a single recall fact any ward staff should know.
//   Medium - applies a fact, or recognises a scenario.
//   Hard   - multi-step reasoning, a specific threshold/timing, or less
//            commonly known detail.
//
// Acronyms are expanded in full on first use inside each question so the quiz
// stands on its own.
// ---------------------------------------------------------------------------

export type QuizDifficulty = "Easy" | "Medium" | "Hard";

export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: QuizDifficulty;
  /** Optional short clinical scenario shown above the question. */
  scenario?: string;
  question: string;
  /** Exactly four answer options. */
  options: string[];
  /** Index (0-3) of the correct option in `options`. */
  correctIndex: number;
  /** Why the correct answer is correct - shown after answering. */
  rationale: string;
  /** Human-readable source, e.g. "NICE NG10 (2015)". */
  source: string;
  /** Optional URL the fact was checked against. */
  sourceUrl?: string;
  /** Optional publication / last-reviewed date of the source. */
  sourceDate?: string;
  /** Set when the source document's own review date has passed, e.g. "review date passed". */
  reviewFlag?: string;
}

// ---------------------------------------------------------------------------
// SEED BANK - hand-verified clinical questions.
// (Web-verified NICE / BNF / NMC / MHA questions are appended below from the
//  research pass; keep this seed block for the core ward-safety staples.)
// ---------------------------------------------------------------------------

const SEED: QuizQuestion[] = [
  // ---- Infection Prevention & Control -------------------------------------
  {
    id: "ipc-1",
    category: "Infection Prevention & Control",
    difficulty: "Easy",
    scenario: "You are about to start a physical examination on a patient.",
    question:
      "Which of the World Health Organization (WHO) Five Moments for Hand Hygiene applies at this point?",
    options: [
      "After touching patient surroundings",
      "Before touching a patient",
      "After body fluid exposure risk",
      "Before leaving the ward",
    ],
    correctIndex: 1,
    rationale:
      "'Before touching a patient' is Moment 1 of the WHO Five Moments. It protects the patient from germs carried on your hands.",
    source: "WHO Five Moments for Hand Hygiene",
    sourceUrl: "https://www.who.int/teams/integrated-health-services/infection-prevention-control/hand-hygiene",
    sourceDate: "2009 (current)",
  },
  {
    id: "ipc-2",
    category: "Infection Prevention & Control",
    difficulty: "Medium",
    scenario: "You are caring for a patient with suspected Clostridioides difficile (C. difficile) infection.",
    question: "What is the correct approach to hand hygiene?",
    options: [
      "Alcohol-based hand rub alone is sufficient",
      "No hand hygiene needed if gloves were worn",
      "Wash with liquid soap and water",
      "Use hand cream from the communal ward tub first",
    ],
    correctIndex: 2,
    rationale:
      "Alcohol hand rub does not kill C. difficile spores. Hands must be washed with soap and water for these patients (and for norovirus / diarrhoea and vomiting).",
    source: "Trust Hand Hygiene Policy; UK Health Security Agency guidance",
    sourceDate: "2025",
  },
  {
    id: "ipc-3",
    category: "Infection Prevention & Control",
    difficulty: "Easy",
    question: "A colleague says wearing disposable gloves removes the need for hand hygiene. Are they right?",
    options: [
      "Yes, gloves replace hand washing",
      "No, hand hygiene is still needed after removing gloves",
      "Only if the gloves were sterile",
      "Only for high-risk patients",
    ],
    correctIndex: 1,
    rationale:
      "Gloves are not a substitute for hand hygiene. Hands can be contaminated during glove removal, so you must decontaminate hands after taking gloves off.",
    source: "Trust Standard Infection Control Principles Policy",
    sourceDate: "2025",
  },
  {
    id: "ipc-4",
    category: "Infection Prevention & Control",
    difficulty: "Easy",
    question: "What does the 'bare below the elbows' principle support during direct patient care?",
    options: [
      "A smarter uniform appearance",
      "Effective hand and wrist decontamination",
      "Staying cooler on the ward",
      "Easier blood pressure recording",
    ],
    correctIndex: 1,
    rationale:
      "Short or rolled-up sleeves and no wrist jewellery/watches allow hands and wrists to be cleaned properly, reducing the spread of infection.",
    source: "Trust Standard Infection Control Principles Policy",
    sourceDate: "2025",
  },

  // ---- Sharps & Inoculation Incidents -------------------------------------
  {
    id: "sharps-1",
    category: "Sharps & Inoculation Incidents",
    difficulty: "Easy",
    scenario: "You sustain a needlestick injury from a used sharp.",
    question: "What is the correct immediate first aid?",
    options: [
      "Suck the wound to draw out contamination",
      "Encourage bleeding, wash with soap and water, cover with a waterproof dressing",
      "Scrub the wound hard with a nail brush",
      "Apply alcohol gel and carry on",
    ],
    correctIndex: 1,
    rationale:
      "Encourage the wound to bleed, wash liberally with soap and running water (do not scrub), dry and cover with a waterproof dressing. Do NOT suck the wound.",
    source: "Trust Inoculation Incidents Policy",
    sourceDate: "2025",
  },
  {
    id: "sharps-2",
    category: "Sharps & Inoculation Incidents",
    difficulty: "Hard",
    scenario: "A high-risk exposure to blood-borne virus has occurred and Human Immunodeficiency Virus (HIV) exposure is possible.",
    question: "What is the timeframe for post-exposure prophylaxis (PEP)?",
    options: [
      "Ideally within 1 hour; not started beyond 72 hours after exposure",
      "Any time within the first month",
      "Within 24 hours only",
      "Only after the source patient's status is confirmed",
    ],
    correctIndex: 0,
    rationale:
      "HIV post-exposure prophylaxis is most effective started as soon as possible (ideally within 1 hour) and is not recommended more than 72 hours after exposure.",
    source: "Trust Inoculation Incidents Policy; UK PEP guidance",
    sourceDate: "2025",
  },
  {
    id: "sharps-3",
    category: "Sharps & Inoculation Incidents",
    difficulty: "Medium",
    question: "When should a sharps container be closed and disposed of?",
    options: [
      "Only when completely full",
      "When three-quarters full (or at the fill line), or after 3 months",
      "Once a year",
      "Whenever the ward is quiet",
    ],
    correctIndex: 1,
    rationale:
      "Sharps bins are closed and replaced when filled to the marked line (about three-quarters full) or after a maximum of three months in use, whichever comes first.",
    source: "Trust Inoculation Incidents Policy; Health and Safety (Sharp Instruments) Regulations 2013",
    sourceDate: "2025",
  },

  // ---- Physical Health & Deterioration ------------------------------------
  {
    id: "deteriorate-1",
    category: "Physical Health & Deterioration",
    difficulty: "Easy",
    question: "How should sepsis be regarded when a deteriorating patient is suspected of having an infection?",
    options: [
      "A routine issue to review at the next ward round",
      "A time-critical medical emergency",
      "Only relevant in general hospitals",
      "Something for the GP to follow up",
    ],
    correctIndex: 1,
    rationale:
      "Sepsis is a life-threatening, time-critical medical emergency. Early recognition and escalation save lives.",
    source: "Trust Sepsis Policy; NICE NG51 / QS161",
    sourceDate: "2025",
  },
  {
    id: "deteriorate-2",
    category: "Physical Health & Deterioration",
    difficulty: "Medium",
    question:
      "Which tool is used to track physical observations and trigger escalation for a deteriorating adult?",
    options: [
      "Malnutrition Universal Screening Tool (MUST)",
      "National Early Warning Score 2 (NEWS2)",
      "Glasgow Coma Scale only",
      "Waterlow Score",
    ],
    correctIndex: 1,
    rationale:
      "The National Early Warning Score 2 (NEWS2) aggregates vital signs into a score that triggers a graded escalation response for physical deterioration.",
    source: "Royal College of Physicians - NEWS2",
    sourceUrl: "https://www.rcp.ac.uk/improving-care/resources/national-early-warning-score-news-2/",
    sourceDate: "2017 (current)",
  },

  // ---- Nutrition & Hydration ----------------------------------------------
  {
    id: "nutrition-1",
    category: "Nutrition & Hydration",
    difficulty: "Easy",
    question: "Which screening tool is used to identify adults at risk of malnutrition?",
    options: [
      "Malnutrition Universal Screening Tool (MUST)",
      "National Early Warning Score 2 (NEWS2)",
      "Glasgow Coma Scale",
      "Abbreviated Mental Test Score",
    ],
    correctIndex: 0,
    rationale:
      "The Malnutrition Universal Screening Tool (MUST) is the recognised tool for screening adults for malnutrition risk.",
    source: "BAPEN - MUST; NICE CG32",
    sourceDate: "current",
  },

  // ---- Safeguarding --------------------------------------------------------
  {
    id: "safeguard-1",
    category: "Safeguarding",
    difficulty: "Medium",
    question:
      "'Making Safeguarding Personal' in adult safeguarding is best described as an approach that is:",
    options: [
      "Process-led and paperwork-focused",
      "Person-led and outcome-focused",
      "Led entirely by the police",
      "Decided by the ward manager alone",
    ],
    correctIndex: 1,
    rationale:
      "Making Safeguarding Personal means working WITH the adult about the outcomes they want - it is person-led and outcome-focused, not a tick-box process.",
    source: "Care Act 2014; Making Safeguarding Personal (LGA/ADASS)",
    sourceDate: "current",
  },
  {
    id: "safeguard-2",
    category: "Safeguarding",
    difficulty: "Easy",
    question: "Who is responsible for safeguarding children and vulnerable adults?",
    options: [
      "Only the safeguarding lead",
      "Only senior clinicians",
      "Everyone who comes into contact with them",
      "Only social services",
    ],
    correctIndex: 2,
    rationale:
      "Safeguarding is everyone's responsibility. All staff have a role in recognising and responding to concerns.",
    source: "Care Act 2014; Working Together to Safeguard Children",
    sourceDate: "current",
  },

  // ---- Consent & Capacity (bedside) ---------------------------------------
  {
    id: "consent-1",
    category: "Consent, Capacity & Chaperones",
    difficulty: "Easy",
    scenario: "An adult patient is about to have an intimate examination.",
    question: "What is the standard regarding a chaperone?",
    options: [
      "A chaperone is optional",
      "A formal chaperone should be offered and is expected for intimate examinations",
      "Only needed if the patient asks",
      "A family member must act as chaperone",
    ],
    correctIndex: 1,
    rationale:
      "A trained, formal chaperone should be offered for intimate examinations to protect both patient and clinician. It should be documented.",
    source: "Trust Chaperone Policy; NMC / GMC guidance",
    sourceDate: "current",
  },
  {
    id: "consent-2",
    category: "Consent, Capacity & Chaperones",
    difficulty: "Medium",
    scenario: "A patient needs an interpreter for an intimate procedure and their friend offers to interpret.",
    question: "Is it acceptable to use the friend as interpreter?",
    options: [
      "Yes, if the patient agrees",
      "No, a professional interpreter should be used, not family or friends",
      "Yes, family always know best",
      "Only if no professional interpreter exists anywhere",
    ],
    correctIndex: 1,
    rationale:
      "Family or friends should not be used as interpreters for clinical matters - use a professional interpreter to protect accuracy, confidentiality and consent.",
    source: "Trust Chaperone / Interpreting guidance; NHS England",
    sourceDate: "current",
  },
  {
    id: "consent-3",
    category: "Consent, Capacity & Chaperones",
    difficulty: "Medium",
    scenario: "A person who has taken an overdose has capacity and is refusing transfer to the Emergency Department.",
    question: "What is the first clinical/legal step?",
    options: [
      "Physically restrain them for transfer",
      "Carry out a mental capacity assessment for this decision",
      "Let them leave with no further action",
      "Wait until they become unconscious",
    ],
    correctIndex: 1,
    rationale:
      "A decision-specific mental capacity assessment is required. If the person lacks capacity, act in their best interests; if they have capacity, consider a Mental Health Act assessment and safeguarding.",
    source: "Mental Capacity Act 2005; Trust Overdose Policy",
    sourceDate: "current",
  },
  {
    id: "consent-4",
    category: "Consent, Capacity & Chaperones",
    difficulty: "Hard",
    scenario: "A young person under 18 has taken an overdose, appears to have capacity, and is refusing treatment.",
    question: "How should this be framed?",
    options: [
      "Simply respect the refusal and take no further action",
      "As a safeguarding issue, even where the young person has capacity",
      "Ignore it as they are nearly an adult",
      "Only involve parents and nobody else",
    ],
    correctIndex: 1,
    rationale:
      "Refusal of potentially life-saving treatment by a young person is a safeguarding concern. Treatment refusal by under-18s can be overridden through the appropriate legal routes, and safeguarding must be considered.",
    source: "Trust Overdose Policy; safeguarding children guidance",
    sourceDate: "current",
  },
];

// ---------------------------------------------------------------------------
// RESEARCH BANK - web-verified questions harvested from national guidance.
// Each JSON file is one research batch (raw shape has no id). We normalise:
// generate a stable id, drop a null/empty scenario, and drop a "not stated"
// source date. Categories are already stored with a real "&" in the JSON.
// ---------------------------------------------------------------------------
import researchMha from "./research-mha.json";
import researchNice from "./research-nice.json";
import researchBnf from "./research-bnf.json";
import researchPractice from "./research-practice.json";
import researchCamhs from "./research-camhs.json";
import researchOlder from "./research-olderadult.json";
import researchInfogov from "./research-infogov.json";
import researchSuicide from "./research-suicide.json";
import researchSubstance from "./research-substance.json";
import researchRights from "./research-rights.json";
import researchEmerg from "./research-emergencies.json";
import researchLd from "./research-ldautism.json";
import researchRestrict from "./research-restrictive.json";
import researchPerinatal from "./research-perinatal.json";
// Derbyshire Healthcare trust policies and SOPs (mined from the offline policy library,
// 117 distinct documents). These are the local-detail questions: trust timings, who
// authorises what, named trust forms and SystmOne nodes, local thresholds.
import trustObs from "./research-trust-observations.json";
import trustSearching from "./research-trust-searching.json";
import trustCto from "./research-trust-cto-s117.json";
import trustPhys from "./research-trust-physhealth.json";
import trustLigature from "./research-trust-ligature.json";
import trustSubstance from "./research-trust-substance.json";
import trustRestrict from "./research-trust-restrictive.json";
import trustDignity from "./research-trust-dignity.json";
import trustIpc from "./research-trust-ipc.json";
import trustSafeguarding from "./research-trust-safeguarding.json";
import trustMha from "./research-trust-mha.json";
import trustCapacity from "./research-trust-capacity.json";
import trustAdt from "./research-trust-adt.json";
import trustMeds from "./research-trust-medicines.json";
import trustSeclusion from "./research-trust-seclusion.json";
import trustRapidTranq from "./research-trust-rapidtranq.json";
import trustRecords from "./research-trust-records.json";

interface RawQuizQuestion {
  category: string;
  difficulty: string;
  scenario?: string | null;
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  source: string;
  sourceUrl?: string;
  sourceDate?: string;
  reviewFlag?: string;
}

function normalise(raw: RawQuizQuestion[], prefix: string): QuizQuestion[] {
  return raw.map((q, i) => {
    const out: QuizQuestion = {
      id: `${prefix}-${i + 1}`,
      category: q.category,
      difficulty: q.difficulty as QuizDifficulty,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      rationale: q.rationale,
      source: q.source,
    };
    if (q.scenario) out.scenario = q.scenario;
    if (q.sourceUrl) out.sourceUrl = q.sourceUrl;
    if (q.sourceDate && q.sourceDate !== "not stated") out.sourceDate = q.sourceDate;
    if (q.reviewFlag) out.reviewFlag = q.reviewFlag;
    return out;
  });
}

/** Derbyshire Healthcare trust policies and SOPs. Listed first so trust topics lead the picker. */
const TRUST: QuizQuestion[] = [
  ...normalise(trustObs as RawQuizQuestion[], "t-obs"),
  ...normalise(trustSearching as RawQuizQuestion[], "t-search"),
  ...normalise(trustCto as RawQuizQuestion[], "t-cto"),
  ...normalise(trustPhys as RawQuizQuestion[], "t-phys"),
  ...normalise(trustLigature as RawQuizQuestion[], "t-lig"),
  ...normalise(trustSubstance as RawQuizQuestion[], "t-subst"),
  ...normalise(trustRestrict as RawQuizQuestion[], "t-restrict"),
  ...normalise(trustDignity as RawQuizQuestion[], "t-dignity"),
  ...normalise(trustIpc as RawQuizQuestion[], "t-ipc"),
  ...normalise(trustSafeguarding as RawQuizQuestion[], "t-safeg"),
  ...normalise(trustMha as RawQuizQuestion[], "t-mha"),
  ...normalise(trustCapacity as RawQuizQuestion[], "t-cap"),
  ...normalise(trustAdt as RawQuizQuestion[], "t-adt"),
  ...normalise(trustMeds as RawQuizQuestion[], "t-meds"),
  ...normalise(trustSeclusion as RawQuizQuestion[], "t-secl"),
  ...normalise(trustRapidTranq as RawQuizQuestion[], "t-rt"),
  ...normalise(trustRecords as RawQuizQuestion[], "t-rec"),
];

const RESEARCH: QuizQuestion[] = [
  ...normalise(researchMha as RawQuizQuestion[], "mha"),
  ...normalise(researchNice as RawQuizQuestion[], "nice"),
  ...normalise(researchBnf as RawQuizQuestion[], "bnf"),
  ...normalise(researchPractice as RawQuizQuestion[], "prac"),
  ...normalise(researchCamhs as RawQuizQuestion[], "camhs"),
  ...normalise(researchOlder as RawQuizQuestion[], "older"),
  ...normalise(researchInfogov as RawQuizQuestion[], "infogov"),
  ...normalise(researchSuicide as RawQuizQuestion[], "suicide"),
  ...normalise(researchSubstance as RawQuizQuestion[], "subst"),
  ...normalise(researchRights as RawQuizQuestion[], "rights"),
  ...normalise(researchEmerg as RawQuizQuestion[], "emerg"),
  ...normalise(researchLd as RawQuizQuestion[], "ld"),
  ...normalise(researchRestrict as RawQuizQuestion[], "restrict"),
  ...normalise(researchPerinatal as RawQuizQuestion[], "perinatal"),
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [...TRUST, ...SEED, ...RESEARCH];

/** All categories present in the bank, in first-seen order. */
export const QUIZ_CATEGORIES: string[] = Array.from(
  new Set(QUIZ_QUESTIONS.map((q) => q.category))
);

export const QUIZ_DIFFICULTIES: QuizDifficulty[] = ["Easy", "Medium", "Hard"];

/** Count of questions per category (for the topic picker). */
export function quizCountByCategory(): Record<string, number> {
  return QUIZ_QUESTIONS.reduce<Record<string, number>>((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {});
}
