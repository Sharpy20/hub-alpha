// Observation & engagement plan - pure-guidance thinking tool.
//
// Source-aligned with the Trust Observation of Patients policy: observation is
// therapeutic engagement, not just surveillance; the level needs a clear
// rationale tied to the current risk; staff need to know what it means in
// practice and what to watch for; and the plan should say what would change it.
// Level names vary by ward - use your local terminology.

import type { GuidePromptConfig } from "./guideprompt";

export const OBSERVATION_BUILDER: GuidePromptConfig = {
  id: "observation-engagement",
  title: "Observation & Engagement Plan",
  icon: "👁️",
  gradient: "from-blue-600 to-indigo-800",
  subtitle: "A guide to writing a clear rationale for the observation level - and how staff should engage.",
  breadcrumb: "Observation & Engagement",
  intro:
    "Think these through before you write the observation plan. A bank or new staff member should be able to read it and know exactly what to do - and observation should be engagement, not just watching.",
  notice:
    "Observation level names vary by ward - use your local terminology.",
  principles: [
    "Every level needs a rationale tied to the current risk - not a habit or a default.",
    "Engagement matters as much as observation - say how staff should interact.",
    "Say what would step the level up or down, so it does not drift unreviewed.",
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
        "Within-eyesight to manage active suicidal intent (specific plan disclosed)",
        "To manage risk of absconding from a detained patient",
        "Vulnerability / exploitation risk on the ward",
        "Post-seclusion step-down",
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
      ],
      examples: [
        "Maintain the required proximity at all times",
        "Supervision at meals; same-gender support at the bathroom",
        "Night checks without disturbing sleep where safe",
        "Handover of the level at every shift change",
      ],
      tip: "Concrete enough that someone who has never met the patient could follow it.",
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
      tip: "Without a step-down trigger, enhanced obs drifts on for weeks by inertia.",
    },
  ],
  footer:
    "Guide only, source-aligned with the Trust Observation of Patients policy. Use your ward's level terminology. Draft - to be verified.",
};
