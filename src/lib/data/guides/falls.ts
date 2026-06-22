// Falls multifactorial assessment helper.
//
// SOURCE-ALIGNED with the Trust Prevention and Management of Falls policy (the
// multifactorial assessment should identify both what raises risk and the
// strategies to reduce it) and NICE NG249 (use a comprehensive, multifactorial
// assessment and tailored interventions - do not rely on a falls-prediction
// score alone). Trust-listed contributory factors are reflected in the chips.
//
// Guidance / prompt aid only. It does not calculate a score and does not replace
// the SystmOne falls assessment.

import type { BuilderConfig } from "./builder";

export const FALLS_BUILDER: BuilderConfig = {
  id: "falls",
  title: "Falls Assessment Helper",
  icon: "🦯",
  gradient: "from-amber-600 to-orange-700",
  subtitle: "Think through the factors that raise this person's falls risk - and the plan to reduce it.",
  breadcrumb: "Falls Assessment Helper",
  docHeading: "FALLS - MULTIFACTORIAL ASSESSMENT",
  outputLabel: "Your falls assessment notes",
  emptyHint: "Work through the factors to build the assessment notes, then copy them into the record.",
  dateLine: true,
  notice:
    "Guidance / prompt aid only - it does not calculate a score. NICE NG249: use a multifactorial assessment and tailored interventions, not a prediction score alone. Complete the SystmOne falls assessment for the record.",
  principles: [
    "Identify what specifically raises THIS person's risk, here, on this ward.",
    "For every risk factor, name a reduction strategy - the assessment is only useful if it leads to action.",
    "Reassess after every fall and after any change in condition or medication.",
  ],
  sections: [
    {
      id: "history",
      heading: "Falls history",
      hint: "Previous falls, recent injuries, and any fear of falling.",
      gap: "Has this person fallen before, and what happened?",
      groups: [
        {
          words: [
            "fall(s) in the last 12 months",
            "fall since admission",
            "injury sustained in a previous fall",
            "fear of falling affecting mobility",
            "no known history of falls",
          ],
        },
      ],
      placeholder: "Previous falls, circumstances, injuries, and fear of falling...",
      naLabel: "No history",
    },
    {
      id: "mobility",
      heading: "Mobility & balance",
      hint: "Gait, balance, transfers and the use of aids.",
      gap: "What makes movement or transfers risky for this person?",
      groups: [
        {
          words: [
            "unsteady gait",
            "poor balance",
            "needs aid (frame / stick)",
            "needs assistance to transfer",
            "deconditioned / reduced strength",
            "independently mobile and steady",
          ],
        },
      ],
      placeholder: "Mobility, balance, transfers and aids...",
      naLabel: "Independent and steady",
    },
    {
      id: "cognition",
      heading: "Cognition & impulsivity",
      hint: "Confusion, disorientation or impulsivity that means they may not call for help or recognise hazards.",
      gap: "Could confusion or impulsivity mean they act before staff can help?",
      groups: [
        {
          words: [
            "confusion / disorientation",
            "impulsive - does not wait for help",
            "does not recognise own limitations",
            "delirium screen considered",
            "cognitively intact",
          ],
        },
      ],
      placeholder: "Cognitive or impulsivity factors affecting falls risk...",
      naLabel: "No concerns",
    },
    {
      id: "continence",
      heading: "Continence & urgency",
      hint: "Urgency or frequency, especially at night, that leads to rushed unsupervised trips to the toilet.",
      gap: "Could needing the toilet urgently lead to a rushed, unsupervised trip?",
      groups: [
        {
          words: [
            "urgency / frequency",
            "nocturia - night-time toilet trips",
            "needs assistance to toilet",
            "continence aids in use",
            "no concerns",
          ],
        },
      ],
      placeholder: "Continence and urgency factors...",
      naLabel: "No concerns",
    },
    {
      id: "medication",
      heading: "Medication contributors",
      hint: "Medicines that increase falls risk - sedation, hypotension, polypharmacy, recent changes.",
      gap: "Is any medication adding to the risk - sedation, dizziness, blood pressure?",
      groups: [
        {
          words: [
            "sedating medication",
            "psychotropic / antipsychotic",
            "antihypertensives",
            "recent dose change",
            "polypharmacy",
            "medication review requested",
          ],
        },
      ],
      placeholder: "Medicines contributing to risk and any review needed...",
      naLabel: "No contributors identified",
    },
    {
      id: "postural",
      heading: "Postural symptoms / syncope",
      hint: "Dizziness on standing, postural drop, or blackouts.",
      gap: "Any dizziness on standing, postural blood-pressure drop, or blackouts?",
      groups: [
        {
          words: [
            "dizziness on standing",
            "lying / standing BP to be checked",
            "history of syncope / blackouts",
            "no postural symptoms",
          ],
        },
      ],
      placeholder: "Postural symptoms, lying/standing BP, syncope history...",
      naLabel: "No symptoms",
    },
    {
      id: "vision-env",
      heading: "Vision, footwear & environment",
      hint: "Sensory impairment, unsuitable or missing footwear, and ward hazards.",
      gap: "What about their vision, footwear or the environment makes a fall more likely?",
      groups: [
        {
          words: [
            "visual impairment / glasses needed",
            "hearing impairment",
            "unsuitable or missing footwear",
            "bed / chair height",
            "clutter / wet floors / poor lighting",
            "bed rails consideration",
          ],
        },
      ],
      placeholder: "Vision, footwear and environmental hazards...",
      naLabel: "No concerns",
    },
    {
      id: "strategies",
      heading: "Reduction strategies in place",
      hint: "The plan - what is actually being done to reduce the risk. Match a strategy to each factor above.",
      gap: "What change would reduce this person's falls risk the most?",
      groups: [
        {
          words: [
            "supervised mobility / transfers",
            "call bell in reach and prompted",
            "appropriate footwear provided",
            "night-time toileting plan",
            "medication review",
            "low bed / crash mat",
            "increased observation",
            "environment de-cluttered",
          ],
        },
      ],
      placeholder: "The specific reduction strategies in place, matched to the risks above...",
      naLabel: "Not yet agreed",
    },
    {
      id: "referral",
      heading: "Referral / review needed",
      hint: "Who needs to review, and when to reassess.",
      gap: "What referral or review is needed, and when do we reassess?",
      groups: [
        {
          words: [
            "physiotherapy referral",
            "occupational therapy referral",
            "medical / medication review",
            "optician / vision review",
            "reassess after any fall or change in condition",
          ],
        },
      ],
      placeholder: "Referrals, reviews and reassessment timing...",
      naLabel: "None needed currently",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "Every risk factor has a matching reduction strategy - risks and actions line up.",
        "It is specific to this person and this ward, not a generic list.",
        "It names who reviews and when to reassess.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "Relying on a numeric score instead of a multifactorial assessment (NICE NG249 advises against scores alone).",
        "Listing risks with no plan to reduce them.",
        "Not reassessing after a fall or a medication change.",
      ],
    },
  ],
  example: {
    topic: "Reduction strategies in place",
    weak: "Patient at risk of falls. Staff to monitor and assist as needed.",
    strong:
      "He gets up urgently for the toilet several times a night and his quetiapine makes him drowsy. Plan: low bed with a crash mat, call bell placed in reach and prompted at each round, a supported toileting plan overnight with two-hourly prompts, slip-resistant slippers provided, and a medication review requested to look at the timing of his night-time dose.",
  },
  footer:
    "Guidance / prompt aid only - no score is calculated. Source-aligned with the Trust falls policy and NICE NG249. Complete the SystmOne falls assessment and review wording before saving.",
};
