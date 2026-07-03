// Observation & engagement plan - pure-guidance thinking tool.
//
// Source-aligned with the Trust Observation of Patients policy: observation is
// therapeutic engagement, not just surveillance; the level needs a clear
// rationale tied to the current risk; staff need to know what it means in
// practice and what to watch for; and the plan should say what would change it.
// Aligned to the DHCFT Inpatient Therapeutic Observations & Engagement Policy
// (Feb 2025, v10): four levels, L1 within arm's length (most restrictive) to
// L4 general (least restrictive).

import type { GuidePromptConfig } from "./guideprompt";

export const OBSERVATION_BUILDER: GuidePromptConfig = {
  id: "observation-engagement",
  title: "Observation & Engagement Plan",
  icon: "👁️",
  gradient: "from-blue-600 to-indigo-800",
  subtitle: "A guide to writing a clear rationale for the observation level - and how staff should engage.",
  breadcrumb: "Observation & Engagement",
  intro:
    "Think these through before you write the observation plan. A bank or new staff member should be able to read it and know exactly what to do - and observation is engagement, not just watching. The four Derbyshire levels are summarised below.",
  notice:
    "Derbyshire levels (Inpatient Therapeutic Observations & Engagement Policy, Feb 2025): Level 1 = within arm's length (most restrictive), Level 4 = general (least restrictive).",
  principles: [
    "Level 4 - General: know each patient's whereabouts and wellbeing; check at least hourly by day and half-hourly at night. The minimum for all inpatients; reviewed weekly at MDT.",
    "Level 3 - Intermittent: visual checks at varying times within a 15-minute period (never exactly every 15 minutes). Not automatically reduced at night; reviewed at least every 72 hours.",
    "Level 2 - Within eyesight: kept in clear sight at all times, day and night (including bathroom and while asleep); reviewed at least every 24 hours.",
    "Level 1 - Within arm's length: one or more staff within arm's length at all times - the highest level; reviewed at least every 24 hours. Students must not undertake Level 1.",
    "Patients on Level 1 or 2 rarely leave the ward. Any leave off the ward for a patient on enhanced observations must be agreed by the MDT first, with the observation arrangements for that leave made explicit (verify the exact wording against the current policy).",
    "Every level still needs a rationale tied to the current risk, genuine engagement (not just watching), and a clear step-up / step-down trigger.",
  ],
  focus: [
    { label: "Viewing Observations - Obs Chart (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/8682/2454" },
    { label: "Food Observation", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/3417/2454" },
    { label: "Therapeutic Observations & Engagement (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1840/2454" },
  ],
  sections: [
    {
      id: "rationale",
      heading: "Why this level (the risk it manages)?",
      why: "The specific risk or presentation this level is intended to manage - the justification, not just the number.",
      think: [
        "What risk or presentation is this level intended to manage?",
        "Why this level and not a lower one?",
      ],
      examples: [
        "Level 2 (within eyesight) for active suicidal intent with a disclosed plan",
        "Level 1 (within arm's length) for immediate, serious risk to self",
        "Level 3 (intermittent) as a step-down from Level 1/2 towards general obs",
        "Level 4 (general) - the baseline for all inpatients",
      ],
      tip: "Name the specific risk - 'on Level 2 due to risk' is not a rationale.",
    },
    {
      id: "practice",
      heading: "What it means in practice",
      why: "Exactly what staff should do - proximity and supervision at meals, the bathroom, the bedroom, communal areas and on leave.",
      think: [
        "What should a new or bank staff member actually do, in each setting?",
        "What proximity is required at meals, the bathroom, at night, in communal areas?",
        "How closely should staff observe during intimate care - showering, using the toilet - balancing safety with privacy and dignity? Put the specifics in the care plan so it is not left to interpretation.",
      ],
      examples: [
        "Maintain the required proximity at all times",
        "Supervision at meals; same-gender support at the bathroom",
        "Intimate care (shower / toilet): state exactly how much observation is needed - e.g. same-gender staff, door ajar, or within eyesight - balancing safety against dignity",
        "Night checks without disturbing sleep where safe",
        "Handover of the level at every shift change",
      ],
      tip: "Concrete enough that someone who has never met the patient could follow it. Spell out intimate-care observation (shower, toilet) in the care plan rather than leaving it to the individual member of staff.",
    },
    {
      id: "watching",
      heading: "What staff are watching for",
      why: "The specific signs to be alert to for this person - not a generic 'monitor mental state'.",
      think: [
        "What, specifically, should staff watch for with this patient?",
        "What would be the first sign things are deteriorating?",
      ],
      examples: [
        "Attempts to access means of harm",
        "Trying to reach exits; concealing items",
        "Responding to unseen stimuli",
        "Rising agitation / their specific early signs",
      ],
      tip: "Be specific to this person - replace 'monitor mental state' with what to look for.",
    },
    {
      id: "engagement",
      heading: "Engagement (not just watching)",
      why: "How staff should interact - the therapeutic side. What this person responds to.",
      think: [
        "How should staff engage this person, not just observe them?",
        "What do they respond to best?",
      ],
      examples: [
        "Regular, brief check-ins",
        "Offer activity / distraction",
        "Responds best to one familiar member of staff",
        "Give space but stay present; use their safety plan",
      ],
      tip: "Observation without engagement is just surveillance - say how to connect.",
    },
    {
      id: "change",
      heading: "When to step up or down",
      why: "What would indicate the level is no longer proportionate, or needs increasing. Keeps it under active review.",
      think: [
        "What would tell us this level can reduce?",
        "What would mean it needs to increase?",
      ],
      examples: [
        "Step down: sustained reduction in ideation, engaging openly, no attempts to access means",
        "Step up: renewed intent or attempts, increasing agitation, concealing items",
      ],
      tip: "Without a step-down trigger, enhanced obs drifts on for weeks by inertia. Reviews: Level 1/2 at least every 24 hours (and discussed every handover), Level 3 at least every 72 hours, Level 4 weekly - plus immediately after any incident or change in mental state.",
    },
  ],
  footer:
    "Guide only, aligned to the DHCFT Inpatient Therapeutic Observations & Engagement Policy (Feb 2025, v10). Levels recorded on SystmOne / the Brigid app. Draft - to be verified.",
};
