// Data for the Welcome admission tool - the SystmOne risk screen, gathered once.
//
// THE DOMAINS AND SUB-DOMAINS BELOW ARE THE APPROVED ONES that appear on the
// SystmOne WAA Inpatient Risk Screening Tool and are inputted into S1 - they must
// match exactly. The nurse ticks the approved sub-domains; each ticked one
// becomes a risk to formulate and plan. Behind the scenes each sub-domain maps to
// one of our chip banks (SUBTYPE_RISK) so the formulation/RMP prompts are tailored
// - but the labels shown and copied out are the approved S1 ones.
//
// Nothing here is stored - the page holds everything in memory and the nurse
// copies it out into SystmOne.

export interface RiskDomain {
  id: string;
  number: number;        // S1 question number (1-7)
  title: string;         // exact S1 domain wording
  short: string;         // short label for outputs
  subtypes: string[];    // the approved S1 sub-domains (tickable)
  noEvidence: string;    // the exact "No evidence ..." option
  hasSafetyConcern?: boolean; // domain 1 also asks "concerns about safety?" (1a)
}

export const RISK_DOMAINS: RiskDomain[] = [
  {
    id: "self-harm", number: 1,
    title: "Risk of self harm or suicide", short: "Self harm / suicide",
    subtypes: [
      "Current thoughts of self-harm",
      "Current thoughts of suicide or that life is not worth living",
      "Currently experiencing high levels of distress and/or hopelessness",
    ],
    noEvidence: "No evidence of self harm or suicide reported during assessment",
    hasSafetyConcern: true,
  },
  {
    id: "self-neglect", number: 2,
    title: "Risk to self, including self-neglect", short: "Risk to self / self-neglect",
    subtypes: [
      "Associated with Activities of Daily Living (ADL's)",
      "Associated with Domestic ADL's and life skills",
    ],
    noEvidence: "No evidence of risk to self, including self-neglect reported during assessment",
  },
  {
    id: "harm-to-others", number: 3,
    title: "Risk of harm or neglect to others", short: "Harm to others",
    subtypes: [
      "Violence and Aggression",
      "Fire Setting",
      "Sexual Offenses",
      "Abuse, harassment and or exploitation",
      "Damage to Property",
      "Associated with Mental Ill Health",
    ],
    noEvidence: "No evidence of risk of harm or neglect to others reported during assessment",
  },
  {
    id: "harm-by-others", number: 4,
    title: "Risk of harm or neglect by others", short: "Harm by others",
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
    id: "physical-health", number: 5,
    title: "Risk to physical health including frailty", short: "Physical health / frailty",
    subtypes: [
      "Short term health condition",
      "Long term health condition",
      "Physical Injury",
      "Sensory difficulties",
      "Falls",
    ],
    noEvidence: "No evidence of risk to physical health including frailty reported during assessment",
  },
  {
    id: "children", number: 6,
    title: "Risk of harm or neglect to foetus, infant or children (under 18 years old)", short: "Foetus / infant / child (u18)",
    subtypes: [
      "Looked after children (Child in care of local authority)",
      "Child Protection",
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
    id: "environmental", number: 7,
    title: "Risk of environmental / external factors", short: "Environmental / external",
    subtypes: [
      "Domestic appliance issues",
      "Housing issues",
      "Lack of social stimulation/activities",
    ],
    noEvidence: "No evidence of environmental risk/external reported during assessment",
  },
];

// Maps an approved S1 sub-domain (keyed `${domainId}::${subtype}`) to one of our
// 28 chip-bank risks, so a ticked sub-domain gets tailored formulation/RMP
// prompts. Anything not mapped (e.g. the child-protection sub-domains) falls back
// to the generic section chips. Keys MUST match the subtypes above exactly.
export const SUBTYPE_RISK: Record<string, string> = {
  "self-harm::Current thoughts of self-harm": "self-harm",
  "self-harm::Current thoughts of suicide or that life is not worth living": "suicide",
  "self-harm::Currently experiencing high levels of distress and/or hopelessness": "suicide",

  "self-neglect::Associated with Activities of Daily Living (ADL's)": "self-neglect / ADLs",
  "self-neglect::Associated with Domestic ADL's and life skills": "self-neglect / ADLs",

  "harm-to-others::Violence and Aggression": "violence and aggression",
  "harm-to-others::Fire Setting": "fire risk",
  "harm-to-others::Sexual Offenses": "sexual disinhibition",
  "harm-to-others::Abuse, harassment and or exploitation": "risk to others",
  "harm-to-others::Damage to Property": "violence and aggression",
  "harm-to-others::Associated with Mental Ill Health": "risk to others",

  "harm-by-others::Sexual abuse": "vulnerability / exploitation",
  "harm-by-others::Physical abuse": "vulnerability / exploitation",
  "harm-by-others::Organisational abuse (including care provided in own home)": "vulnerability / exploitation",
  "harm-by-others::Psychological abuse": "vulnerability / exploitation",
  "harm-by-others::Domestic abuse": "vulnerability / exploitation",
  "harm-by-others::Financial abuse": "financial exploitation",
  "harm-by-others::Modern slavery": "vulnerability / exploitation",
  "harm-by-others::Neglect / acts of omission": "vulnerability / exploitation",

  "physical-health::Short term health condition": "physical health deterioration",
  "physical-health::Long term health condition": "physical health deterioration",
  "physical-health::Physical Injury": "physical health deterioration",
  "physical-health::Sensory difficulties": "physical health deterioration",
  "physical-health::Falls": "falls",

  "environmental::Housing issues": "homelessness / housing instability",
};

// Observation levels (DHCFT Inpatient Therapeutic Observations & Engagement
// Policy) - patient banner dropdown.
export const OBS_LEVELS = [
  "Level 4 - General",
  "Level 3 - Intermittent",
  "Level 2 - Within eyesight",
  "Level 1 - Within arm's length",
];

export const LEGAL_STATUSES = [
  "Informal", "Section 2", "Section 3", "Section 5(2)", "Section 4",
  "CTO", "CTO recall", "Section 17 leave", "Section 37", "Section 37/41",
];

// The three intro messages - one for each person who might be reading the screen.
export const WELCOME_INTROS: { key: string; who: string; emoji: string; text: string }[] = [
  {
    key: "patient", who: "For the patient", emoji: "🫂",
    text:
      "Welcome. We know coming onto a ward can feel strange, and maybe frightening, so thank you for sitting with us. We're going to talk through a few things together: how you've been feeling, what worries you, and what helps when things are hard. There are no right or wrong answers, and this isn't a test. Take your time, pause whenever you need to, and don't worry if you can't answer everything today. The point is simple - we want to understand you, in your own words, so your care is planned with you, not just for you. Your voice matters most here.",
  },
  {
    key: "staff", who: "For staff", emoji: "🩺",
    text:
      "This takes you and the patient through the risk screen in one go. Work through it together - it's paced, so you're not firing questions at someone in distress. As you go, it builds the risk screen, a formulation and management plans from what you record. At the end you get clean blocks to copy straight into SystmOne, with a tick beside each so you can track what's gone across. Nothing is saved here - build it, copy it over, done. It's a drafting aid: the clinical judgement, and the final words, stay yours.",
  },
  {
    key: "carer", who: "For family / carer / advocate", emoji: "🤝",
    text:
      "If you're here as family, a friend, a carer or an advocate - welcome, and thank you for coming. You'll know things about the person that we don't, and that really helps. As we go, you'll have the chance to add what you've noticed, what helps, and what worries you, and we'll note your view alongside theirs and the team's. You're here to help their voice be heard, not to speak for them - so we'll always check what they're happy to share.",
  },
];
