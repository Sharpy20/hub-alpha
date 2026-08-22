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

// ---- The deliberate "not established" options ------------------------------
// Section 11: an empty section must not be filled with generic text, but staff
// must be able to record that the patient-specific detail is not known yet.
// These are NOT reassurance - "no early warning signs established" is a gap in
// the plan, not a finding that there are none.
export const INCOMPLETE_OPTIONS: Record<string, string> = {
  q2_present: "No patient-specific early warning signs established",
  q4_prevent: "No patient-specific preventative strategies established",
  q5_evaluate: "No patient-specific signs of reduction established",
  q6_next: "Escalation actions require MDT agreement",
};

// ---- Question 1: which specific outcome are you trying to prevent? ---------
// Keyed `${domainId}::${subtype}` against the approved SystmOne sub-domains, so
// the outcome named is the one the nurse actually ticked.
//
// Domains 1 and 2 are Mike's own wording, supplied 22 Aug 2026. Domains 3-7 were
// written here from the sub-domain names and the existing chip banks, and have
// NOT been through him - they are flagged for sign-off in the proofreading pack.
//
// These name an OUTCOME TO PREVENT. They never carry a likelihood, a severity or
// a risk level: the tool offers vocabulary, it does not rate risk.
export const WHAT_IS_THE_RISK: Record<string, string[]> = {
  // --- Domain 1: self-harm or suicide ---
  "self-harm::Current thoughts of self-harm": [
    "Risk of intentional self-injury",
    "Risk of acting on current thoughts of self-harm",
    "Risk of accessing or concealing items for self-harm",
    "Risk of further self-harm",
  ],
  "self-harm::Current thoughts of suicide or that life is not worth living": [
    "Risk of acting on suicidal thoughts",
    "Risk of attempting suicide",
    "Risk associated with a considered or planned method",
    "Risk of accessing means to attempt suicide",
  ],
  "self-harm::Currently experiencing high levels of distress and/or hopelessness": [
    "Risk of self-harm during periods of acute distress",
    "Risk of suicidal behaviour during periods of hopelessness",
    "Risk increasing when the person feels trapped or unable to cope",
    "Risk of deterioration associated with increasing distress",
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
    "Risk of reduced ability to complete essential daily activities",
  ],
  "self-neglect::Associated with Domestic ADL's and life skills": [
    "Risk of being unable to manage shopping or essential supplies",
    "Risk associated with poor accommodation",
    "Risk of losing accommodation",
    "Risk associated with financial difficulties",
    "Risk of being unable to manage medication",
    "Risk associated with overestimating current abilities",
    "Risk of being unable to manage domestic tasks safely",
  ],

  // --- Domain 3: harm or neglect to others ---
  "harm-to-others::Violence and Aggression": [
    "Risk of physical assault on staff",
    "Risk of physical assault on other patients",
    "Risk of verbal threats and intimidation",
    "Risk of harm to others during periods of agitation",
    "Risk of injury to another person requiring intervention",
  ],
  "harm-to-others::Fire Setting": [
    "Risk of deliberate fire setting",
    "Risk of accidental fire",
    "Risk of harm to others from fire",
    "Risk associated with access to lighters, matches or accelerants",
  ],
  "harm-to-others::Sexual Offenses": [
    "Risk of sexually harmful behaviour towards another person",
    "Risk of sexually inappropriate approaches to patients or staff",
    "Risk associated with contact with people who may be vulnerable",
  ],
  "harm-to-others::Abuse, harassment and or exploitation": [
    "Risk of exploiting another person",
    "Risk of harassment or stalking of another person",
    "Risk of coercive or controlling behaviour towards another person",
    "Risk of taking money or possessions from another person",
  ],
  "harm-to-others::Damage to Property": [
    "Risk of damage to ward property",
    "Risk of damage that creates a hazard to others",
    "Risk of damage to another person's belongings",
  ],
  "harm-to-others::Associated with Mental Ill Health": [
    "Risk of harm to others driven by paranoid or persecutory beliefs",
    "Risk of harm to others in response to command hallucinations",
    "Risk of harm to others through misidentification",
    "Risk of harm to others linked to disinhibition",
  ],

  // --- Domain 4: harm or neglect BY others (the patient is the person at risk) ---
  "harm-by-others::Sexual abuse": [
    "Risk of sexual abuse by another person",
    "Risk of sexual exploitation",
    "Risk associated with contact with a named person",
  ],
  "harm-by-others::Physical abuse": [
    "Risk of physical assault by another person",
    "Risk of injury caused by another person",
    "Risk associated with contact with a named person",
  ],
  "harm-by-others::Organisational abuse (including care provided in own home)": [
    "Risk of abuse or neglect within a care setting",
    "Risk of care needs not being met by a provider",
    "Risk associated with poor-quality care in their own home",
  ],
  "harm-by-others::Psychological abuse": [
    "Risk of psychological or emotional abuse by another person",
    "Risk of intimidation or humiliation by another person",
    "Risk of isolation imposed by another person",
  ],
  "harm-by-others::Domestic abuse": [
    "Risk of domestic abuse by a partner or family member",
    "Risk of coercive control",
    "Risk of escalation on leave or at discharge",
  ],
  "harm-by-others::Financial abuse": [
    "Risk of money or possessions being taken by another person",
    "Risk of being pressured into financial decisions",
    "Risk of income or benefits being controlled by another person",
  ],
  "harm-by-others::Modern slavery": [
    "Risk of forced labour or servitude",
    "Risk of being controlled or trafficked by another person",
    "Risk associated with debt bondage",
  ],
  "harm-by-others::Neglect / acts of omission": [
    "Risk of essential care needs not being met by others",
    "Risk of food, medication or personal care not being provided",
    "Risk associated with a carer being unable to meet their needs",
  ],

  // --- Domain 5: physical health including frailty ---
  "physical-health::Short term health condition": [
    "Risk of deterioration from an acute condition",
    "Risk of an untreated infection",
    "Risk of delayed recognition of physical illness",
  ],
  "physical-health::Long term health condition": [
    "Risk of deterioration of a long-term condition",
    "Risk associated with poor concordance with treatment",
    "Risk of complications from an untreated condition",
  ],
  "physical-health::Physical Injury": [
    "Risk of a further injury",
    "Risk of a wound or injury deteriorating",
    "Risk of an injury going unnoticed",
  ],
  "physical-health::Sensory difficulties": [
    "Risk of harm from unrecognised sensory impairment",
    "Risk of not receiving information in a form they can understand",
    "Risk of accidents linked to reduced sight or hearing",
  ],
  "physical-health::Falls": [
    "Risk of falling",
    "Risk of injury from a fall",
    "Risk of a fall going unwitnessed",
    "Risk of a further fall at night or on transfer",
  ],

  // --- Domain 6: foetus, infant or child under 18 (the CHILD is at risk) ---
  "children::Looked after children (Child in care of local authority)": [
    "Risk to a child currently in the care of the local authority",
    "Risk associated with contact arrangements",
    "Risk of contact taking place outside the agreed plan",
  ],
  "children::Child Protection": [
    "Risk to a child subject to a child protection plan",
    "Risk of the child protection plan not being followed",
    "Risk associated with unsupervised contact",
  ],
  "children::Sexual abuse": [
    "Risk of sexual abuse of a child",
    "Risk of a child being exposed to sexually harmful behaviour",
    "Risk associated with unsupervised contact with a child",
  ],
  "children::Physical abuse": [
    "Risk of physical harm to a child",
    "Risk of injury to a child during periods of distress or anger",
    "Risk associated with unsupervised contact with a child",
  ],
  "children::Organisational abuse (including care provided in own home)": [
    "Risk of a child being harmed or neglected within a care setting",
    "Risk of a child's needs not being met by a provider",
  ],
  "children::Psychological abuse": [
    "Risk of emotional harm to a child",
    "Risk of a child being frightened or intimidated",
    "Risk of a child being drawn into adult conflict",
  ],
  "children::Domestic abuse": [
    "Risk of a child witnessing domestic abuse",
    "Risk of a child being harmed during a domestic incident",
    "Risk of a child taking on a protective role",
  ],
  "children::Financial abuse": [
    "Risk of a child's money or entitlements being misused",
    "Risk of a child going without essentials",
  ],
  "children::Neglect / acts of omission": [
    "Risk of a child's basic needs not being met",
    "Risk of a child being left unsupervised",
    "Risk of a child's health or education needs being neglected",
  ],

  // --- Domain 7: environmental / external factors ---
  "environmental::Domestic appliance issues": [
    "Risk of fire from an unsafe appliance",
    "Risk of injury from faulty equipment",
    "Risk of harm from an unsafe or unmaintained home",
  ],
  "environmental::Housing issues": [
    "Risk of homelessness",
    "Risk of losing their tenancy",
    "Risk of returning to unsafe accommodation",
    "Risk of discharge being delayed by housing",
  ],
  "environmental::Lack of social stimulation/activities": [
    "Risk of deterioration linked to isolation",
    "Risk of disengagement from services",
    "Risk of relapse linked to a lack of routine or purpose",
  ],
};

// Shown when the nurse names their own sub-domain, which by definition has no
// bank. Deliberately thin - their own words are the point.
export const WHAT_IS_THE_RISK_FALLBACK: string[] = [
  "Risk of harm to the person",
  "Risk of harm to others",
  "Risk of the situation deteriorating",
  "Risk of an unmet need going unrecognised",
];

// Helper: the suggested outcomes for a set of ticked sub-domains, deduped and in
// the order they were ticked.
export function whatIsTheRiskFor(domainId: string, subtypes: string[]): RiskChipGroup[] {
  const words: string[] = [];
  let sawUnmapped = false;
  for (const s of subtypes) {
    const bank = WHAT_IS_THE_RISK[`${domainId}::${s}`];
    if (!bank) { sawUnmapped = true; continue; }
    for (const w of bank) if (!words.includes(w)) words.push(w);
  }
  if (sawUnmapped) for (const w of WHAT_IS_THE_RISK_FALLBACK) if (!words.includes(w)) words.push(w);
  return words.length ? [{ words }] : [];
}
