// Personal (moving & handling) risk assessment - pure-guidance thinking tool.
//
// Source-aligned with the Trust Moving and Handling Policy: cover the person, the
// environment, the staff, the assistance required, the numbers, the equipment,
// and how to support the individual in an emergency.

import type { GuidePromptConfig } from "./guideprompt";

export const HANDLING_BUILDER: GuidePromptConfig = {
  id: "personal-handling",
  title: "Personal Handling Helper",
  icon: "🤝",
  gradient: "from-cyan-600 to-blue-700",
  subtitle: "A guide to planning the safest way to assist this person to move - and what to do if it goes wrong.",
  breadcrumb: "Personal Handling Helper",
  intro:
    "Think these through, then complete the SystmOne personal handling risk assessment. Be specific enough that a colleague who has never met the patient could assist safely first time - and always plan for the emergency, not just the routine transfer.",
  notice:
    "Guidance only - it does not replace the SystmOne personal handling risk assessment or moving & handling training.",
  principles: [
    "Cover the person, the environment, the staff, the assistance, the numbers, the equipment - and the emergency.",
    "Say what changes if the patient is distressed, in pain, weak or impulsive.",
  ],
  sections: [
    {
      id: "task-ability",
      heading: "The task & what they can do themselves",
      why: "What movement this plan is for, and their current ability.",
      think: [
        "What movement or transfer does this person need help with?",
        "What can they do for themselves, and where does it break down?",
      ],
      examples: [
        "Bed-to-chair transfer; sit-to-stand; mobilising short distances",
        "Weight-bears reliably / unpredictably",
        "Can / cannot reliably follow instructions",
      ],
      tip: "Note where independence breaks down - that is where the risk is.",
    },
    {
      id: "assistance",
      heading: "Assistance, staff numbers & equipment",
      why: "Type and level of help, how many staff, and exactly what equipment (and anything contraindicated).",
      think: [
        "Supervision, prompting, or hands-on?",
        "How many staff, and what equipment (e.g. hoist + correct sling size)?",
        "Is anything contraindicated?",
      ],
      examples: [
        "Assistance of two with a frame",
        "Hoist with correct sling size; slide sheet",
        "Supervision and verbal prompting only",
      ],
      tip: "State the sling size and exact numbers - 'assist as required' is not a plan.",
    },
    {
      id: "environment",
      heading: "Environment",
      why: "Space, floor surface, bed / chair height and hazards that affect safe handling.",
      think: [
        "Is there adequate space to manoeuvre?",
        "Bed / chair at the right height? Wet or cluttered floor? Lighting?",
      ],
      examples: [
        "Adequate space; bed at correct working height",
        "Restricted space - move chair before transfer",
        "Ensure floor is dry and well lit",
      ],
      tip: "A safe technique in the wrong space is no longer safe - check it.",
    },
    {
      id: "behaviour",
      heading: "If distressed, in pain or resistant",
      why: "How the plan changes if the patient becomes distressed, is in pain, weak, or resists mid-task.",
      think: [
        "What changes if they are distressed or in pain?",
        "When is the best time of day for this person?",
      ],
      examples: [
        "Stop and reassure if distressed",
        "Offer pain relief before the task",
        "Best mid-morning, before the afternoon slump / after night sedation wears off",
      ],
      tip: "Timing matters - say when this person handles transfers best.",
    },
    {
      id: "emergency",
      heading: "Emergency plan",
      why: "What to do if the patient deteriorates, collapses or becomes unsafe mid-task. Required by policy.",
      think: [
        "If they collapse or deteriorate mid-task, what do staff do?",
        "Who do they call, and what must they not do?",
      ],
      examples: [
        "Lower safely to the floor - do not try to hold them up",
        "Summon help / emergency buzzer; call 2222 if needed",
        "Do not move alone if injury is suspected",
      ],
      tip: "The emergency plan is the bit people forget - never catch a falling patient.",
    },
  ],
  footer:
    "Guidance only, source-aligned with the Trust Moving and Handling Policy. Complete the SystmOne personal handling risk assessment. Draft - to be verified.",
};
