// Falls multifactorial assessment - pure-guidance thinking tool.
//
// Source-aligned with the Trust Falls policy (identify what raises risk AND the
// plan to reduce it) and NICE NG249 (multifactorial assessment + tailored
// interventions, not a prediction score alone). It does not calculate a score.

import type { GuidePromptConfig } from "./guideprompt";

export const FALLS_BUILDER: GuidePromptConfig = {
  id: "falls",
  title: "Falls Assessment Helper",
  icon: "🦯",
  gradient: "from-amber-600 to-orange-700",
  subtitle: "A guide to thinking through what raises this person's falls risk - and the plan to reduce it.",
  breadcrumb: "Falls Assessment Helper",
  intro:
    "Work through the factors below, then complete the SystmOne falls assessment. The assessment is only useful if every risk you find has a matching action - and if you reassess after any fall or change.",
  notice:
    "Guidance only - it does not calculate a score. NICE NG249: use a multifactorial assessment and tailored interventions, not a prediction score alone.",
  principles: [
    "Identify what specifically raises THIS person's risk, here, on this ward.",
    "For every risk factor, name a reduction strategy.",
    "Reassess after every fall and after any change in condition or medication.",
  ],
  sections: [
    {
      id: "history",
      heading: "Falls history & fear of falling",
      why: "A previous fall is one of the strongest predictors of another.",
      think: [
        "Have they fallen in the last year, or since admission?",
        "Were they injured? Has it left them afraid of falling?",
      ],
      examples: [
        "Fall(s) in the last 12 months",
        "Injury sustained in a previous fall",
        "Fear of falling now affecting mobility",
      ],
      tip: "Fear of falling itself raises risk - it changes how someone moves.",
    },
    {
      id: "mobility",
      heading: "Mobility, balance & transfers",
      why: "Gait, balance, transfers and use of aids.",
      think: [
        "What makes movement or transfers risky for this person?",
        "Do they use an aid, and do they use it correctly?",
      ],
      examples: [
        "Unsteady gait / poor balance",
        "Needs an aid (frame / stick)",
        "Needs assistance to transfer",
        "Deconditioned / reduced strength",
      ],
      tip: "Note whether they actually use their aid - many leave it by the bed.",
    },
    {
      id: "cognition",
      heading: "Cognition & impulsivity",
      why: "Confusion or impulsivity means they may not call for help or recognise hazards.",
      think: [
        "Could confusion or impulsivity mean they act before staff can help?",
        "Do they recognise their own limitations?",
      ],
      examples: [
        "Confusion / disorientation",
        "Impulsive - does not wait for help",
        "Delirium screen considered",
      ],
      tip: "An impulsive patient who will not wait needs a different plan from a frail one who will.",
    },
    {
      id: "continence-meds",
      heading: "Continence & medication",
      why: "Urgency leads to rushed unsupervised trips; medicines add sedation and hypotension.",
      think: [
        "Could needing the toilet urgently, especially at night, lead to a rushed trip?",
        "Is any medication adding to the risk - sedation, dizziness, blood pressure?",
      ],
      examples: [
        "Urgency / frequency; nocturia",
        "Sedating or psychotropic medication",
        "Antihypertensives; recent dose change; polypharmacy",
      ],
      tip: "Night-time toileting plus night sedation is a classic falls combination - plan for it.",
    },
    {
      id: "postural-vision-env",
      heading: "Postural symptoms, vision & environment",
      why: "Dizziness on standing, sensory impairment, footwear and ward hazards.",
      think: [
        "Any dizziness on standing, postural BP drop, or blackouts?",
        "Vision, footwear, bed / chair height, clutter or lighting?",
      ],
      examples: [
        "Dizziness on standing; lying / standing BP to be checked",
        "Visual impairment / glasses needed",
        "Unsuitable or missing footwear",
        "Bed / chair height; clutter; poor lighting",
      ],
      tip: "Cheap wins live here - the right slippers and a tidy bed space.",
    },
    {
      id: "strategies",
      heading: "Reduction strategies & referral",
      why: "The plan. Match a strategy to each factor above, and say who reviews.",
      think: [
        "What change would reduce this person's falls risk the most?",
        "What referral or review is needed, and when do we reassess?",
      ],
      examples: [
        "Supervised mobility / transfers; call bell in reach and prompted",
        "Appropriate footwear; night-time toileting plan",
        "Medication review; low bed / crash mat",
        "Physio / OT referral; reassess after any fall",
      ],
      tip: "Every risk above should have a matching action here - line them up.",
    },
  ],
  footer:
    "Guidance only - no score is calculated. Source-aligned with the Trust falls policy and NICE NG249. Complete the SystmOne falls assessment. Draft - to be verified.",
};
