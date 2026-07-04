// Restraint & rapid tranquillisation monitoring - pure-guidance thinking tool.
//
// Source-aligned with the Trust Management of Violence & Aggression / Positive &
// Safe workflow. A guide to writing a defensible monitoring narrative - it does
// not replace the monitoring chart, the Datix, or the Drug Management of Violence
// & Aggression policy.

import type { GuidePromptConfig } from "./guideprompt";

export const RESTRAINT_BUILDER: GuidePromptConfig = {
  id: "restraint-monitoring",
  title: "Restraint & Rapid Tranq Monitoring",
  icon: "🩺",
  gradient: "from-orange-600 to-red-700",
  subtitle: "A guide to writing a defensible monitoring narrative for restraint or rapid tranquillisation.",
  breadcrumb: "Restraint & RT Monitoring",
  intro:
    "Think through each of these before you write the monitoring record. The reviewer's questions are always the same: why was it necessary, what was tried first, exactly what was done, and how was the person kept physically safe?",
  notice:
    "Guide only - it does not replace the monitoring chart, the Datix, or the Drug Management of Violence & Aggression policy. Physical obs are required at least every 15 minutes for the first hour, with NEWS2.",
  principles: [
    "Force must be the least restrictive option, proportionate, and for no longer than necessary.",
    "Oral medication should be offered before any other route.",
    "The 'additional risk factors' detail must never be left blank.",
  ],
  focus: [
    { label: "Physical Restraint (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/12795/2454" },
    { label: "Rapid Tranquilisation", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/8105/2454" },
    { label: "Violence & Aggression / RT (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1944/2454" },
    { label: "Rapid Tranquilisation SOP", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/3494/2456" },
  ],
  sections: [
    {
      id: "necessary",
      heading: "Why was it necessary & proportionate?",
      why: "The justification a reviewer looks for - why this, why then, why nothing less would do.",
      think: [
        "What was the immediate risk at that moment?",
        "Why was this proportionate, and why would nothing less have worked?",
        "Did it end as soon as it was safe?",
      ],
      examples: [
        "Imminent serious harm to others - an assault in progress",
        "Lower-level options had already failed",
        "Intervention matched the level of risk and stopped when safe",
      ],
      tip: "Proportionality must be shown, not asserted - tie it to the specific risk.",
    },
    {
      id: "deescalation",
      heading: "What was attempted to de-escalate first?",
      why: "What was genuinely tried before the intervention, including offering oral medication first.",
      think: [
        "What did we actually try first?",
        "Was oral medication offered before any other route?",
        "What worked, even briefly?",
      ],
      examples: [
        "Verbal de-escalation",
        "Oral medication offered first",
        "Space / reduced stimulation; staff stepped back",
        "Followed the PBS plan",
      ],
      tip: "'Least restrictive' means nothing without the list of what was tried first.",
    },
    {
      id: "detail",
      heading: "Exactly what was done",
      why: "For restraint: holds, position, duration, lead communicator. For RT: drug, dose, route, time, site, and any second medication.",
      think: [
        "What holds and position were used, and for how long?",
        "Who was the lead communicator?",
        "For RT: what drug, dose, route, time and site - and was a second medication needed?",
      ],
      examples: [
        "Seated guide for under two minutes; no pressure to neck or chest",
        "Prone position avoided where possible",
        "RT: drug, dose, route, time and injection site recorded",
        "Emergency equipment and pulse oximeter to hand",
      ],
      tip: "Specific enough to scrutinise: holds, position, duration, or drug/dose/route/time/site.",
    },
    {
      id: "risk-factors",
      heading: "Additional risk factors",
      why: "The factors that raise the danger of restraint or sedation. This must never be left blank - if none, say so and why you checked.",
      think: [
        "What about this person makes restraint or sedation more dangerous?",
        "Have they recently had sedation or rapid tranquillisation?",
      ],
      examples: [
        "Intoxication / substance use; recent sedation",
        "Respiratory or cardiac condition; epilepsy",
        "Autism / learning disability; obesity; frailty; pregnancy",
        "Recent injury; prone-position avoidance needed",
      ],
      tip: "If none apply, write that explicitly - never leave the box empty.",
    },
    {
      id: "monitoring",
      heading: "Intervention monitoring",
      why: "What was actually observed. Physical obs every 15 minutes for at least an hour, with NEWS2. If obs were refused, record it and what you could still observe.",
      think: [
        "What was recorded objectively, and how often?",
        "If full obs were not possible, what could you still observe?",
        "Did the patient remain within sight and sound?",
      ],
      examples: [
        "Physical obs every 15 minutes; NEWS2 recorded",
        "Pulse oximetry and level of consciousness monitored",
        "Obs refused - respirations / breathing still observed and recorded",
      ],
      tip: "Record refusal honestly, with whatever you could still observe.",
    },
    {
      id: "ceased",
      heading: "Monitoring ceased",
      why: "Why it is clinically safe to stop. An RN can cease if there are no additional risk factors and the patient is ambulatory after an hour; otherwise a doctor reviews.",
      think: [
        "Why is it clinically safe to stop now?",
        "Who confirmed it - RN or doctor?",
        "Any outstanding actions?",
      ],
      examples: [
        "No additional risk factors and ambulatory after one hour - RN ceased monitoring",
        "Additional risk factors present - doctor review completed",
        "Physically reviewed and stable; follow-up actions noted",
      ],
      tip: "Name who confirmed it was safe to stop, and any actions still open.",
    },
  ],
  footer:
    "Guide only, source-aligned with the Trust Management of Violence & Aggression workflow. Complete the monitoring chart, Datix and policy steps. Draft - to be verified.",
};
