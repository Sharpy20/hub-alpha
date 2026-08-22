// Chip banks for the six Risk Management Plan questions (22 Aug 2026 rebuild).
//
// ⚠ EVERYTHING IN THIS FILE IS WARDHUB AUTHORING, NOT TRUST WORDING. None of it
// appears on the SystmOne risk screen or in the Trust's RMP guidance. It is
// clinical vocabulary offered to save typing; it carries the purple ring in the
// UI and needs sign-off in its own right. The only Trust-sourced words that ever
// reach these questions are the clinical indicators the nurse has ticked, which
// the page passes in separately and marks `source: "trust"`.
//
// Three banks per question:
//   1. SUGGESTED - the ticked sub-domain's own words (from RMP_RISK_CHIPS, plus
//      WHAT_IS_THE_RISK below for question 1). Shown first, never preselected.
//   2. ALL OPTIONS - the universal library here, behind a "show all" toggle so
//      the screen stays short.
//   3. INCOMPLETE - a deliberate, visible "we have not established this yet"
//      choice, so a gap is recorded honestly rather than papered over.
//
// "Add another action / preventative action / sign of reduction / escalation
// action" from the brief are NOT chips - the editor already has an "add your
// own" box that saves the word for next time, which is the same affordance done
// properly.

import type { RiskChipGroup } from "./risk";

// ---- The universal library (one bank per question) -------------------------
// Applies across domains. Deliberately not shown by default: the sub-domain's
// own suggestions come first, and this opens underneath them.

export const UNIVERSAL_IMMEDIATE: string[] = [
  "Offer 1:1 time",
  "Listen to the person's concerns",
  "Use the person's preferred communication approach",
  "Provide reassurance and emotional support",
  "Reduce environmental stimulation",
  "Offer a quieter area",
  "Support the person away from the immediate situation",
  "Inform the nurse in charge",
  "Review current mental state",
  "Review current physical health",
  "Offer prescribed PRN medication where clinically indicated",
  "Seek medical review",
  "Seek psychiatric review",
  "Follow the relevant emergency procedure",
  "Follow the relevant safeguarding procedure",
];

export const UNIVERSAL_PREVENTION: string[] = [
  "Agree an individual safety plan",
  "Identify known triggers",
  "Identify early warning signs",
  "Agree preferred de-escalation strategies",
  "Provide regular 1:1 engagement",
  "Maintain a predictable daily routine",
  "Encourage meaningful activity",
  "Support medication concordance",
  "Review medication effectiveness and adverse effects",
  "Involve family or carers with appropriate consent",
  "Support contact with relevant professionals",
  "Address communication needs",
  "Review leave arrangements",
  "Review environmental safety",
  "Review access to potential risk items",
  "Review substance use",
  "Arrange MDT review",
  "Update relevant care plans",
];

export const UNIVERSAL_REDUCTION_SIGNS: string[] = [
  "Reports feeling safer",
  "Requests support appropriately",
  "Engages with staff",
  "Accepts agreed support",
  "Uses agreed coping strategies",
  "Reduced distress",
  "Reduced agitation",
  "Improved communication",
  "Improved sleep",
  "Improved daily routine",
  "Participates in meaningful activity",
  "Demonstrates future planning",
  "No further incidents during the agreed review period",
];

export const UNIVERSAL_ESCALATION: string[] = [
  "Inform the nurse in charge",
  "Increase therapeutic engagement",
  "Review observation level",
  "Arrange urgent physical health assessment",
  "Arrange urgent medical review",
  "Arrange urgent psychiatric review",
  "Arrange MDT review",
  "Arrange a risk strategy meeting",
  "Review leave",
  "Review environmental safety",
  "Review access to potential risk items",
  "Initiate or review safeguarding procedures",
  "Consider whether a higher level of care is required",
  "Follow emergency procedures",
  "Update risk assessment and care plan",
];

// No universal bank for question 2 (how does this present): what staff would
// notice is specific to the person and the risk, so a generic list would be the
// exact fault Mike reported - the same chips under every domain. The suggested
// bank plus the ticked clinical indicators carry that question instead.

// ---- What the person says helps ---------------------------------------------
//
// Offered on questions 3 and 4. Every other bank in this file describes what
// STAFF do; this is the only one that carries the person's own account of what
// works, which is the half a plan most often misses. NICE's violence and
// aggression guidance asks for personal triggers, early warning signs and
// de-escalation preferences rather than one response for everyone.
//
// It is deliberately NOT a seventh question. Mike cut thirteen questions to six
// on 22 Aug because the run took too long; adding one back to hold six chips
// would undo that. It sits inside the two questions about what staff do.
//
// The unhelpful half matters as much as the helpful half - "finds being crowded
// by staff unhelpful" is the line that changes what a shift actually does.
export const WHAT_HELPS_LABEL = "What the person says helps, or does not help";
export const WHAT_HELPS: string[] = [
  "Prefers one staff member to speak at a time",
  "Prefers time and space before discussion",
  "Finds a quieter environment helpful",
  "Finds walking or physical activity helpful",
  "Finds music, television or another activity helpful",
  "Prefers support from a familiar member of staff",
  "Prefers concerns to be explained clearly and directly",
  "Finds repeated questioning unhelpful",
  "Finds being crowded by staff unhelpful",
  "Has not yet identified what helps",
];

// ---- Timeframes for the signs-of-reduction question -------------------------
//
// "No further incidents" on its own is not a measure - it does not say over what
// period, and an absence of incidents is not proof the underlying risk has gone.
// Offered as their own group on question 5 so a period can be attached to
// whichever absence chip was picked.
export const TIMEFRAME_LABEL = "Over what period";
export const REDUCTION_TIMEFRAMES: string[] = [
  "during the current shift",
  "since the plan was last reviewed",
  "during the agreed review period",
  "reduced frequency compared with the previous review period",
  "reduced severity compared with previous incidents",
];

// ---- The deliberate "not established" options ------------------------------
//
// An empty section must not be filled with generic text, but staff must be able
// to record WHY it is empty - and the reasons are not interchangeable:
//
//   not yet established - staff have not identified the patient-specific detail
//   not assessed        - it was not assessed, or the information was not available
//   not applicable      - it does not apply in the current circumstances
//
// None of the three is reassurance. "No early warning signs established" is a
// gap in the plan, not a finding that there are none. The domain's own
// "No evidence ... reported during assessment" line is a fourth and different
// thing again - that one IS a finding, and it lives on the risk screen.
export const INCOMPLETE_OPTIONS: Record<string, string> = {
  q1_what: "The specific outcome has not yet been established",
  q2_present: "No patient-specific early warning signs established",
  q3_manage: "No patient-specific response has yet been agreed",
  q4_prevent: "No patient-specific preventative strategies established",
  q5_evaluate: "No patient-specific signs of reduction established",
  q6_next: "Escalation actions require MDT agreement",
};

/** Offered on every question alongside its own named option above. */
export const NOT_ASSESSED = "Not assessed at this time";
export const NOT_APPLICABLE = "Not applicable to this risk";

// ---- Was the person involved in building this plan? -------------------------
//
// One dropdown beside the plan title, printed in the plan's header. It adds no
// heading to the Trust template and it is not a seventh question.
//
// ⛔ Deliberately NOT a tick saying "patient agreed". A plan the person disagreed
// with, or could not take part in, is a normal and recordable outcome; a binary
// tick makes the honest answers unsayable and the audit trail worthless.
export const PATIENT_INVOLVEMENT_LABEL = "Was the person involved in this plan?";
export const PATIENT_INVOLVEMENT: string[] = [
  "Involved and agreed",
  "Involved but did not agree with all elements",
  "Offered involvement but declined",
  "Unable to participate at this time",
  "Communication or capacity support required",
  "Not yet discussed",
];

// ---- Keeping the plan current ----------------------------------------------
//
// A plan can be sound when it is written and out of date within a shift. The
// Trust template has no review heading, so these print in the plan HEADER
// alongside involvement - metadata about the plan, never a heading of our own
// inside a mandated template.
//
// ⛔ WHO reviews it is a ROLE, not a name. wardHub holds no staff names in a
// plan and never will (see the no-special-category-data rule); a role also
// survives the person going on annual leave, which a name does not.
export const REVIEW_BY_LABEL = "Who will review this plan?";
export const REVIEW_BY: string[] = [
  "The named nurse",
  "The nurse in charge",
  "The MDT",
  "The responsible clinician",
  "The ward manager",
  "The safeguarding lead",
  "Not yet agreed",
];

// Intervals rather than a date picker: a date typed here would be stale the
// moment the plan is pasted, and the ward speaks in shifts and MDTs anyway.
export const REVIEW_WHEN_LABEL = "When will it be reviewed?";
export const REVIEW_WHEN: string[] = [
  "Every shift",
  "Daily",
  "Twice weekly",
  "Weekly",
  "At the next MDT",
  "Before any leave",
  "Before discharge",
  "Date to be agreed at the MDT",
];

// The important one. Most plans go stale between scheduled reviews, and it is
// an event that makes them stale rather than the calendar.
export const REVIEW_TRIGGER_LABEL = "What would mean reviewing it sooner?";
export const REVIEW_TRIGGERS: string[] = [
  "Any relevant incident",
  "A significant change in mental state",
  "A change in observation level",
  "Leave or discharge planning",
  "A legal or safeguarding development",
  "Physical health deterioration",
  "A change in medication",
  "New information from family, carers or another service",
  "The person asks for it to be reviewed",
];

// ---- Question 1: which specific outcome are you trying to prevent? ---------
//
// Keyed `${domainId}::${subtype}` against the approved SystmOne sub-domains, so
// the outcome named is the one the nurse actually ticked. Transcribed from the
// design Mike settled on 22 Aug 2026 - the earlier drafts for domains 3-7 that
// Claude invented have been REPLACED by this, which is the version he reviewed.
//
// These name an OUTCOME TO PREVENT. They never carry a likelihood, a severity or
// a risk level: the tool offers vocabulary, it does not rate risk.
export const WHAT_IS_THE_RISK: Record<string, string[]> = {
  // --- Domain 1: self-harm or suicide ---
  "self-harm::Current thoughts of self-harm": [
    "Risk of intentional self-injury",
    "Risk of acting on current thoughts of self-harm",
    "Risk of accessing or concealing items for self-harm",
  ],
  "self-harm::Current thoughts of suicide or that life is not worth living": [
    "Risk of acting on suicidal thoughts",
    "Risk of attempting suicide",
    "Risk associated with a planned or considered method",
    "Risk of accessing means to attempt suicide",
  ],
  "self-harm::Currently experiencing high levels of distress and/or hopelessness": [
    "Risk of self-harm during periods of acute distress",
    "Risk of suicidal behaviour during periods of hopelessness",
    "Risk increasing when the person feels trapped or unable to cope",
  ],

  // --- Domain 2: risk to self, including self-neglect ---
  "self-neglect::Associated with Activities of Daily Living (ADL's)": [
    "Risk of inadequate food or fluid intake",
    "Risk of poor personal hygiene",
    "Risk of unmet physical health needs",
    "Risk associated with inappropriate clothing",
    "Risk of being unable to communicate needs",
    "Risk of becoming lost, missing or absent",
    "Risk associated with reduced engagement in care",
  ],
  "self-neglect::Associated with Domestic ADL's and life skills": [
    "Risk of being unable to manage shopping or essential supplies",
    "Risk associated with poor accommodation",
    "Risk of losing accommodation",
    "Risk associated with financial difficulties",
    "Risk of being unable to manage medication",
    "Risk associated with overestimating current abilities",
  ],

  // --- Domain 3: harm or neglect to others ---
  "harm-to-others::Violence and Aggression": [
    "Risk of verbal aggression",
    "Risk of physical aggression",
    "Risk of assault",
    "Risk of threatening or intimidating behaviour",
    "Risk associated with the use of weapons",
  ],
  "harm-to-others::Fire Setting": [
    "Risk of deliberate fire setting",
    "Risk of accidental fire setting",
    "Risk associated with unsafe access to ignition sources",
    "Risk of harm to others through fire",
  ],
  // ⚠ Deliberately high-level and non-graphic. The design's own instruction:
  // "In view of the sensitivity of this sub-domain, use only high-level,
  // non-graphic documentation options." Do not add detail here.
  "harm-to-others::Sexual Offenses": [
    "Risk of sexually inappropriate behaviour",
    "Risk of harmful sexual behaviour",
    "Risk requiring specialist assessment and safeguarding management",
  ],
  "harm-to-others::Abuse, harassment and or exploitation": [
    "Risk of harassment or stalking",
    "Risk of coercive or controlling behaviour",
    "Risk of domestic abuse",
    "Risk of online harassment or harm",
    "Risk of exploiting another person",
  ],
  "harm-to-others::Damage to Property": [
    "Risk of damaging property",
    "Risk of throwing or breaking objects",
    "Risk of creating an unsafe environment through property damage",
  ],
  "harm-to-others::Associated with Mental Ill Health": [
    "Risk of harm during periods of paranoia",
    "Risk of harm associated with command hallucinations",
    "Risk associated with misidentification of others",
    "Risk associated with disinhibition",
    "Risk of impulsive harm during mental state deterioration",
  ],

  // --- Domain 4: harm or neglect BY others (the patient is the person at risk) ---
  "harm-by-others::Sexual abuse": ["Risk of sexual abuse"],
  "harm-by-others::Physical abuse": ["Risk of physical abuse"],
  "harm-by-others::Organisational abuse (including care provided in own home)": ["Risk of organisational abuse"],
  "harm-by-others::Psychological abuse": ["Risk of psychological abuse"],
  "harm-by-others::Domestic abuse": ["Risk of domestic abuse"],
  "harm-by-others::Financial abuse": ["Risk of financial abuse"],
  "harm-by-others::Modern slavery": ["Risk of modern slavery"],
  "harm-by-others::Neglect / acts of omission": ["Risk of neglect or acts of omission"],

  // --- Domain 5: physical health including frailty ---
  // The design's note: "Because the sub-domains are broad, the selected clinical
  // indicators should strongly influence which chips are prioritised."
  "physical-health::Short term health condition": [
    "Risk of deterioration in an acute health condition",
    "Risk of infection",
    "Risk associated with vomiting or dehydration",
    "Risk associated with delirium",
  ],
  "physical-health::Long term health condition": [
    "Risk of deterioration in a long-term health condition",
    "Risk associated with missed monitoring or treatment",
    "Risk associated with medication administration or concordance",
  ],
  "physical-health::Physical Injury": [
    "Risk of deterioration or complications following physical injury",
    "Risk associated with wounds or impaired tissue viability",
    "Risk of pain or reduced mobility following injury",
  ],
  "physical-health::Sensory difficulties": [
    "Risk arising from sensory impairment",
    "Risk of unmet communication needs",
    "Risk associated with sensory processing difficulties",
  ],
  "physical-health::Falls": [
    "Risk of falling",
    "Risk of injury following a fall",
    "Risk associated with reduced mobility or environmental hazards",
  ],

  // --- Domain 7: environmental / external factors ---
  "environmental::Domestic appliance issues": [
    "Risk arising from unsafe or unusable domestic appliances",
    "Risk of fire, injury or inability to meet basic needs",
    "Risk arising from unsafe use of appliances",
  ],
  "environmental::Housing issues": [
    "Risk associated with unsuitable accommodation",
    "Risk of homelessness or eviction",
    "Risk associated with an unsafe shared living environment",
    "Risk arising from missing adaptations or equipment",
  ],
  "environmental::Lack of social stimulation/activities": [
    "Risk arising from social isolation",
    "Risk associated with an absence of meaningful activity",
    "Risk of deterioration linked to an unstructured environment",
  ],
};

// Domain 6 is the one domain whose question-1 bank is NOT per sub-domain.
//
// ⛔ The design is explicit: "This section should be conservative and
// safeguarding-led. It must not attempt to resolve safeguarding concerns through
// routine ward interventions", and selections "populate the relevant high-level
// concern". So every sub-domain here offers the same high-level, non-graphic
// list rather than naming what was done to a child. Do not split this per
// sub-domain and do not make it more specific.
export const WHAT_IS_THE_RISK_CHILD: string[] = [
  "Risk involving a looked-after child",
  "Child protection concern",
  "Risk of abuse",
  "Risk associated with domestic abuse",
  "Risk associated with neglect or acts of omission",
  "Risk of deliberate harm",
  "Risk of accidental harm",
  "Reported ideas of harm",
  "Risk of exploitation",
];

// ---- Questions 2 to 5, per domain ------------------------------------------
//
// One bank per DOMAIN (not per sub-domain), transcribed from the 22 Aug design.
// These are what fix Mike's "the same chips regardless of domain" - each one is
// written for its own domain and covers all of that domain's sub-domains.
//
// There is deliberately NO per-domain escalation bank: question 6 is served by
// UNIVERSAL_ESCALATION plus the mandatory MDT line the trust guidance fixes.
export interface DomainRmpBank {
  /** Q2 - what staff would notice when the risk is increasing. */
  present: string[];
  /** Q3 - what staff do at the time. */
  manage: string[];
  /** Q4 - what reduces the likelihood. */
  prevent: string[];
  /** Q5 - observable change showing the plan is working. */
  evaluate: string[];
  /** A standing instruction the design attaches to the whole domain. */
  note?: string;
}

export const DOMAIN_RMP_CHIPS: Record<string, DomainRmpBank> = {
  "self-harm": {
    present: [
      "Expresses thoughts of self-harm", "Expresses suicidal thoughts",
      "States that life is not worth living", "Expresses hopelessness",
      "Expresses helplessness", "Reports feeling trapped or having no control",
      "Identifies a method or plan", "Seeks access to potential means",
      "Conceals or accumulates risk items", "Attempts to leave a safer environment",
      "Withdraws from staff or peers", "Isolates in their bedroom",
      "Reduced communication", "Appears tearful or distressed",
      "Increased anxiety or agitation",
      "Sudden change from distress to an unexpectedly calm presentation",
      "Reports voices associated with self-harm or suicide", "Increased substance use",
      "Reduced engagement with support",
      "Deterioration following bad news or significant events",
      "Risk increases around legal or criminal justice developments",
    ],
    manage: [
      "Stay with the person while immediate safety is assessed",
      "Offer supportive 1:1 engagement",
      "Ask directly about current thoughts, intent, plans and access to means",
      "Remove or secure identified risk items with the person's cooperation where possible",
      "Complete a search in accordance with local policy and the individual plan",
      "Review observation level", "Inform the nurse in charge",
      "Offer prescribed PRN medication where clinically indicated",
      "Seek urgent psychiatric review",
      "Arrange physical health assessment following injury, overdose or suspected ingestion",
      "Follow emergency procedures where immediate danger is present",
    ],
    prevent: [
      "Develop or review a collaborative safety plan", "Identify individual triggers",
      "Agree how the person will request help",
      "Support future-focused discussion and achievable goals",
      "Maintain regular therapeutic contact",
      "Review access to medication or other identified means",
      "Support safe medication storage and administration",
      "Monitor response to legal, family, housing or financial developments",
      "Address substance use", "Encourage meaningful activity and social connection",
      "Involve family or carers with appropriate consent",
    ],
    evaluate: [
      "Reports reduced thoughts of self-harm", "Reports reduced suicidal thoughts",
      "Reports feeling safer", "No current intent or plan reported",
      "No attempts to access identified means", "Seeks staff support before acting",
      "Uses the agreed safety plan", "Increased engagement", "Reduced hopelessness",
      "Identifies reasons for living", "Demonstrates future planning",
      "No further self-harm during the agreed review period",
    ],
  },

  "self-neglect": {
    present: [
      "Reduced food intake", "Reduced fluid intake", "Weight loss or nutritional concerns",
      "Difficulty maintaining hygiene", "Wearing unsuitable or insufficient clothing",
      "Difficulty managing medication", "Missed healthcare appointments",
      "Difficulty communicating needs", "Declines or avoids support",
      "Denies difficulties identified by others", "Unable to obtain food or essential items",
      "Difficulty managing finances", "Accommodation becoming unsafe or unsuitable",
      "Risk of eviction or loss of accommodation",
      "Leaves the ward or placement unexpectedly", "Becomes lost or disorientated",
      "Wandering", "Overestimates ability to manage independently",
    ],
    manage: [
      "Offer practical assistance with the identified need", "Assess food and fluid intake",
      "Assess immediate physical health concerns",
      "Support personal care while promoting independence", "Support access to medication",
      "Support communication of needs",
      "Establish the person's whereabouts and immediate safety",
      "Follow the missing-person procedure if required",
      "Contact relevant housing, social care or support services",
      "Review capacity for the specific decision where indicated",
    ],
    prevent: [
      "Agree an ADL support plan", "Use prompts or graded support",
      "Establish a predictable daily routine",
      "Monitor food and fluid intake where indicated",
      "Support access to shopping and essential supplies", "Review accommodation needs",
      "Review financial support", "Use accessible communication",
      "Support attendance at appointments", "Review medication support arrangements",
      "Involve occupational therapy",
      "Involve family, carers or support workers where appropriate",
    ],
    evaluate: [
      "Improved food and fluid intake", "Improved hygiene", "Wears appropriate clothing",
      "Communicates needs more consistently", "Accepts agreed support",
      "Attends healthcare appointments", "Manages medication with agreed support",
      "Improved living environment", "Essential supplies are available",
      "Reduced missing or wandering episodes", "Improved engagement",
      "Demonstrates safer awareness of current abilities",
    ],
  },

  "harm-to-others": {
    present: [
      "Raised voice or shouting", "Verbal hostility", "Threatening statements",
      "Expresses intent to harm someone", "Intimidating behaviour", "Pacing or restlessness",
      "Clenched fists or tense posture", "Invades personal space",
      "Throws or strikes objects", "Damages property", "Attempts to access a weapon",
      "Increased anger or frustration", "Difficulty accepting boundaries",
      "Focuses hostility on a particular person or group",
      "Follows or repeatedly contacts another person", "Increasing paranoia about others",
      "Believes others intend harm", "Reports violent command hallucinations",
      "Misidentifies other people", "Increased disinhibition",
      "Increased harmful or discriminatory language or behaviour",
      "Increased risk during substance use or withdrawal",
      "Preoccupation with fire or access to ignition sources",
      "Unsafe use of appliances or smoking materials",
    ],
    manage: [
      "Use calm verbal and non-verbal de-escalation", "Use one lead communicator",
      "Allow appropriate time and personal space",
      "Reduce noise, stimulation and numbers of staff present",
      "Move other patients or vulnerable people away where necessary",
      "Support the person to a quieter area",
      "Acknowledge distress without agreeing with harmful beliefs",
      "Set clear and respectful boundaries", "Offer agreed coping strategies",
      "Offer prescribed PRN medication where clinically indicated",
      "Summon additional assistance", "Inform the nurse in charge",
      "Remove access to identified weapons or ignition sources in accordance with policy",
      "Follow fire safety procedures", "Follow safeguarding procedures",
      "Seek urgent medical or psychiatric review",
      "Follow emergency or security procedures if immediate danger is present",
    ],
    prevent: [
      "Record individual triggers and early warning signs",
      "Agree preferred de-escalation strategies", "Maintain consistent boundaries",
      "Avoid unnecessary confrontation", "Explain decisions clearly",
      "Plan support around known high-risk situations",
      "Monitor paranoia, hallucinations, misidentification or disinhibition",
      "Support medication concordance", "Address substance use",
      "Review contact with identified individuals where necessary",
      "Review access to weapons or ignition sources",
      "Develop an individual fire safety plan where indicated",
      "Arrange relevant specialist or safeguarding assessment",
      "Arrange a risk strategy meeting",
    ],
    evaluate: [
      "Reduced agitation", "Communicates without threats",
      "No aggressive incidents during the review period", "No property damage",
      "No attempts to access weapons or ignition sources", "Accepts boundaries",
      "Moves away from conflict", "Uses agreed de-escalation strategies",
      "Requests staff support", "Reduced paranoid distress",
      "Reduced harmful command experiences", "Improved recognition of the effect on others",
      "Engages in review of incidents",
    ],
  },

  "harm-by-others": {
    present: [
      "Reports being harmed, threatened or controlled",
      "Appears fearful of a particular person",
      "Another person controls contact or communication",
      "Another person controls money, medication or personal belongings",
      "Unexplained loss of money or possessions",
      "Unexplained injuries or deterioration in wellbeing",
      "Basic care needs are not being met", "Appears reluctant to return home",
      "Receives repeated unwanted contact",
      "Reports online threats, pressure or exploitation",
      "Accommodation or care arrangements appear unsafe",
      "Carer appears overwhelmed or unable to meet needs",
      "The person is unable to speak privately",
    ],
    manage: [
      "Ensure immediate safety", "Speak with the person privately where safe to do so",
      "Listen and document the account accurately", "Inform the nurse in charge",
      "Follow adult safeguarding procedures",
      "Follow domestic abuse procedures where relevant",
      "Seek immediate physical health review where needed",
      "Preserve relevant evidence in accordance with policy",
      "Contact emergency services where immediate danger is present",
      "Consider advocacy or interpreting support",
    ],
    prevent: [
      "Develop an individual safeguarding plan",
      "Agree safe methods and times for communication",
      "Review contact or visiting arrangements", "Review accommodation safety",
      "Support access to advocacy", "Support financial safeguards",
      "Involve appropriate safeguarding professionals", "Review carer support needs",
      "Provide communication support", "Review online safety",
      "Arrange discharge planning with relevant agencies",
    ],
    evaluate: [
      "Reports feeling safer", "No further unwanted contact reported",
      "Can communicate privately and freely",
      "Agreed safeguarding actions have been completed",
      "Safe accommodation has been identified",
      "Safer financial arrangements are in place",
      "Required care is being provided consistently", "Accepts relevant support",
      "Improved emotional or physical wellbeing",
    ],
  },

  "physical-health": {
    note: "The sub-domains here are broad, so the clinical indicators you ticked should strongly influence which of these you use.",
    present: [
      "Change in consciousness or alertness", "New confusion or behaviour change",
      "Fever or signs of infection", "Pain or increased pain", "Reduced mobility",
      "Unsteadiness", "Recent fall or near miss", "Skin damage or pressure-area concerns",
      "Difficulty swallowing", "Reduced food or fluid intake", "Vomiting",
      "Rapid weight change", "Very low weight", "Incontinence", "Seizure activity",
      "Difficulty seeing, hearing or processing the environment",
      "Missed or delayed medication", "Refusal or difficulty taking medication",
      "Required monitoring is overdue", "Difficulty accessing screening or healthcare",
    ],
    manage: [
      "Complete physical observations",
      "Use the appropriate physical health assessment or early-warning tool",
      "Seek urgent medical review", "Provide first aid within competence",
      "Follow the falls pathway", "Follow the seizure care plan",
      "Follow swallowing guidance", "Monitor food and fluid intake",
      "Monitor weight where indicated", "Review wounds and tissue viability",
      "Check medication administration and timing",
      "Contact the relevant specialist service",
      "Transfer to emergency or acute care where clinically indicated",
    ],
    prevent: [
      "Maintain scheduled physical health monitoring",
      "Follow specialist medication-monitoring requirements",
      "Ensure critical medicines are administered at the correct time",
      "Use agreed medication support", "Review mobility and falls risks",
      "Ensure appropriate equipment is available",
      "Make reasonable environmental adaptations",
      "Follow nutrition and hydration plans", "Follow tissue-viability guidance",
      "Support access to screening", "Use accessible communication",
      "Involve dietetics, physiotherapy, occupational therapy, speech and language therapy or other relevant professionals",
    ],
    evaluate: [
      "Physical observations remain within the agreed range", "Reduced pain",
      "Improved mobility", "No further falls", "Improved food or fluid intake",
      "Weight stabilises within the agreed plan", "No further vomiting",
      "Skin integrity improves", "Medication is received at the required times",
      "Specialist monitoring is completed", "Improved alertness or orientation",
      "Accesses required screening or treatment",
    ],
  },

  "children": {
    note: "Conservative and safeguarding-led. This must not attempt to resolve safeguarding concerns through routine ward interventions, and the person at risk is the child, not the patient.",
    present: [
      "A child may be exposed to unsafe behaviour or circumstances",
      "Concerns regarding supervision or care",
      "Concerns regarding contact arrangements", "Concerns about the home environment",
      "Reported ideas of harming a foetus or child",
      "Previous deliberate or accidental harm reported",
      "Parental or carer mental-state deterioration affecting safe care",
      "Domestic abuse or coercive control affecting a child",
      "A child may be vulnerable to exploitation",
      "Concerns arise during admission or discharge planning",
    ],
    manage: [
      "Ensure immediate safety", "Inform the nurse in charge",
      "Follow child safeguarding procedures", "Contact the safeguarding team",
      "Seek urgent medical or psychiatric review where required",
      "Review contact or visiting arrangements", "Liaise with children's services",
      "Contact emergency services where immediate danger is present",
      "Document the source and wording of the concern accurately",
    ],
    prevent: [
      "Develop or update the safeguarding plan", "Agree safe contact arrangements",
      "Include the concern in admission and discharge planning",
      "Liaise with children's services and relevant professionals",
      "Review parental or carer support needs",
      "Monitor changes in mental state relevant to safe care",
      "Support adherence to agreed safeguarding arrangements",
      "Arrange a multi-agency or strategy discussion",
    ],
    evaluate: [
      "Safeguarding actions completed", "Safe contact arrangements established",
      "Relevant agencies confirm an agreed plan",
      "Improved engagement with safeguarding professionals",
      "No further reported incidents or concerns during the review period",
      "The child's immediate safety has been established",
    ],
  },

  "environmental": {
    present: [
      "Unsafe or faulty appliances",
      "Unable to cook, heat the home or maintain basic needs",
      "Dangerous or unsuitable living environment",
      "Hoarding affecting safe use of the property", "Risk arising from another resident",
      "Missing adaptations", "Required equipment is unavailable",
      "Risk of eviction or homelessness", "Inadequate care package",
      "Environment does not meet assessed needs",
      "Communication barriers prevent access to support",
      "Behaviour prevents or disrupts access to services", "Limited meaningful activity",
      "Social isolation",
    ],
    manage: [
      "Address immediate environmental danger", "Inform the nurse in charge",
      "Contact housing or accommodation provider",
      "Contact social care or the care coordinator",
      "Arrange emergency accommodation where indicated",
      "Request urgent repair or replacement of essential equipment",
      "Review risk from cohabitees", "Use interpreting or communication support",
      "Follow safeguarding procedures where relevant",
      "Contact emergency services where immediate danger is present",
    ],
    prevent: [
      "Develop a housing or environmental action plan", "Refer for housing support",
      "Request an occupational therapy assessment", "Arrange appropriate adaptations",
      "Review equipment needs", "Review the care package",
      "Develop a meaningful activity plan", "Support access to community resources",
      "Address communication barriers", "Coordinate discharge planning",
      "Arrange multi-agency review",
    ],
    evaluate: [
      "Environment is assessed as safer", "Essential appliances are working",
      "Required adaptations or equipment are in place",
      "Suitable accommodation is secured",
      "Eviction or homelessness concerns are being addressed", "Care package is in place",
      "Improved access to services", "Increased meaningful activity",
      "Reduced social isolation", "Improved engagement with housing or support services",
    ],
  },
};

// The suggested outcomes for a set of ticked sub-domains, deduped and in the
// order they were ticked. Domain 6 answers with its single high-level bank
// whatever is ticked - see WHAT_IS_THE_RISK_CHILD.
export function whatIsTheRiskFor(domainId: string, subtypes: string[]): RiskChipGroup[] {
  if (domainId === "children") {
    return subtypes.length ? [{ words: [...WHAT_IS_THE_RISK_CHILD] }] : [];
  }
  const words: string[] = [];
  for (const s of subtypes) {
    for (const w of WHAT_IS_THE_RISK[`${domainId}::${s}`] || []) {
      if (!words.includes(w)) words.push(w);
    }
  }
  return words.length ? [{ words }] : [];
}
