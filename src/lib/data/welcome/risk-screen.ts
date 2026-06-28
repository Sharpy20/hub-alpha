// Data for the Welcome admission tool - Phase 1: the SystmOne risk screen,
// gathered once with the patient.
//
// Mirrors the DHCFT WAA Inpatient Risk Screening Tool: seven starred risk
// domains, each with its sub-types, a clinical-indicators Yes/No, a current-
// concerns narrative and a historical narrative (the form's a/b/c follow-ups).
// Nothing here is stored - the page holds everything in memory and the nurse
// copies it out into SystmOne. Phase 1 is the risk screen + formulation + a
// risk-management-plan starter; care plan / safety plan / physical health /
// referrals / printables are later phases.

export interface RiskDomain {
  /** stable key for state */
  id: string;
  /** the form's question number (1-7) */
  number: number;
  /** exact S1 question wording */
  title: string;
  /** short label for tabs / summaries */
  short: string;
  /** the tickable sub-types under this domain */
  subtypes: string[];
  /** the "No evidence ... during assessment" option */
  noEvidence: string;
  /** domain 1 also asks "concerns about the person's safety?" */
  hasSafetyConcern?: boolean;
}

export const RISK_DOMAINS: RiskDomain[] = [
  {
    id: "self-harm",
    number: 1,
    title: "Risk of self-harm or suicide",
    short: "Self-harm / suicide",
    subtypes: [
      "Current thoughts of self-harm",
      "Current thoughts of suicide or that life is not worth living",
      "Currently experiencing high levels of distress and/or hopelessness",
    ],
    noEvidence: "No evidence of self-harm or suicide reported during assessment",
    hasSafetyConcern: true,
  },
  {
    id: "self-neglect",
    number: 2,
    title: "Risk to self, including self-neglect",
    short: "Risk to self / self-neglect",
    subtypes: [
      "Associated with Activities of Daily Living (ADLs)",
      "Associated with Domestic ADLs and life skills",
    ],
    noEvidence: "No evidence of risk to self, including self-neglect reported during assessment",
  },
  {
    id: "harm-to-others",
    number: 3,
    title: "Risk of harm or neglect to others",
    short: "Harm to others",
    subtypes: [
      "Violence and aggression",
      "Fire setting",
      "Sexual offences",
      "Abuse, harassment and/or exploitation",
      "Damage to property",
      "Associated with mental ill health",
    ],
    noEvidence: "No evidence of risk of harm or neglect to others reported during assessment",
  },
  {
    id: "harm-by-others",
    number: 4,
    title: "Risk of harm or neglect by others",
    short: "Harm by others",
    subtypes: [
      "Sexual abuse",
      "Physical abuse",
      "Organisational abuse (including care provided in own home)",
      "Psychological abuse",
      "Domestic abuse",
      "Financial abuse",
      "Modern slavery",
      "Neglect / acts of omission",
    ],
    noEvidence: "No evidence of risk of harm or neglect by others reported during assessment",
  },
  {
    id: "physical-health",
    number: 5,
    title: "Risk to physical health including frailty",
    short: "Physical health / frailty",
    subtypes: [
      "Short-term health condition",
      "Long-term health condition",
      "Physical injury",
      "Sensory difficulties",
      "Falls",
    ],
    noEvidence: "No evidence of risk to physical health including frailty reported during assessment",
  },
  {
    id: "children",
    number: 6,
    title: "Risk of harm or neglect to foetus, infant or children (under 18)",
    short: "Foetus / infant / child (u18)",
    subtypes: [
      "Looked after children (child in care of local authority)",
      "Child protection",
      "Sexual abuse",
      "Physical abuse",
      "Organisational abuse (including care provided in own home)",
      "Psychological abuse",
      "Domestic abuse",
      "Financial abuse",
      "Neglect / acts of omission",
    ],
    noEvidence: "No evidence of risk of harm or neglect to foetus, infants, children (u18) reported during assessment",
  },
  {
    id: "environmental",
    number: 7,
    title: "Risk of environmental / external factors",
    short: "Environmental / external",
    subtypes: [
      "Domestic appliance issues",
      "Housing issues",
      "Lack of social stimulation / activities",
    ],
    noEvidence: "No evidence of environmental / external risk reported during assessment",
  },
];

// The five-heading risk-management-plan template (DHCFT, as it appears on the
// risk screen). The MDT line is appended to "next steps" automatically.
export const RMP_HEADINGS: { id: string; heading: string }[] = [
  { id: "what", heading: "WHAT IS THE RISK" },
  { id: "present", heading: "HOW DOES THIS PRESENT" },
  { id: "prevent", heading: "HOW TO PREVENT / REDUCE" },
  { id: "evaluate", heading: "EVALUATE SIGNS OF RISK REDUCTION" },
  { id: "next", heading: "NEXT STEPS IF RISK MANAGEMENT PLAN UNSUCCESSFUL" },
];

export const RMP_MDT_LINE = "Review in MDT.";

// Observation levels (DHCFT Inpatient Therapeutic Observations & Engagement
// Policy) - used in the patient banner dropdown.
export const OBS_LEVELS = [
  "Level 4 - General",
  "Level 3 - Intermittent",
  "Level 2 - Within eyesight",
  "Level 1 - Within arm's length",
];

// Common legal statuses for the banner dropdown (free text also allowed).
export const LEGAL_STATUSES = [
  "Informal",
  "Section 2",
  "Section 3",
  "Section 5(2)",
  "Section 4",
  "CTO",
  "CTO recall",
  "Section 17 leave",
  "Section 37",
  "Section 37/41",
];

// The three intro messages - one for each person who might be reading the
// screen during the session. Plain, warm, no jargon.
export const WELCOME_INTROS: { key: string; who: string; emoji: string; text: string }[] = [
  {
    key: "patient",
    who: "For the patient",
    emoji: "🫂",
    text:
      "Welcome. We know coming onto a ward can feel strange, and maybe frightening, so thank you for sitting with us. We're going to talk through a few things together: how you've been feeling, what worries you, and what helps when things are hard. There are no right or wrong answers, and this isn't a test. Take your time, pause whenever you need to, and don't worry if you can't answer everything today. The point is simple - we want to understand you, in your own words, so your care is planned with you, not just for you. Your voice matters most here.",
  },
  {
    key: "staff",
    who: "For staff",
    emoji: "🩺",
    text:
      "This takes you and the patient through the risk screen in one go. Work through it together - it's paced, so you're not firing questions at someone in distress. As you go, it builds the risk screen, a formulation and a management-plan starter from what you record. At the end you get clean blocks to copy straight into SystmOne, with a tick beside each so you can track what's gone across. Nothing is saved here - build it, copy it over, done. It's a drafting aid: the clinical judgement, and the final words, stay yours.",
  },
  {
    key: "carer",
    who: "For family / carer / advocate",
    emoji: "🤝",
    text:
      "If you're here as family, a friend, a carer or an advocate - welcome, and thank you for coming. You'll know things about the person that we don't, and that really helps. As we go, you'll have the chance to add what you've noticed, what helps, and what worries you, and we'll note your view alongside theirs and the team's. You're here to help their voice be heard, not to speak for them - so we'll always check what they're happy to share.",
  },
];
