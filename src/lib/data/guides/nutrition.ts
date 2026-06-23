// Nutrition (MUST) care planning - pure-guidance thinking tool. NO SCORING.
//
// MUST (BAPEN) is a five-step screen. This guide does NOT calculate the score -
// it helps turn a completed MUST screen into a clear, person-centred nutrition
// plan. Always run the validated MUST screen on SystmOne for the actual score.

import type { GuidePromptConfig } from "./guideprompt";

export const NUTRITION_BUILDER: GuidePromptConfig = {
  id: "nutrition-screening",
  title: "Nutrition (MUST) Care Plan Helper",
  icon: "🥗",
  gradient: "from-lime-600 to-green-700",
  subtitle: "A guide to turning a MUST screen into a clear nutrition plan - not a calculator.",
  breadcrumb: "Nutrition (MUST) Helper",
  intro:
    "Run the validated MUST screen on SystmOne first (0 low, 1 medium, 2+ high). Then use these prompts to write the plan - because a score on its own changes nothing.",
  notice:
    "Guidance only - this tool does NOT calculate a MUST score. Run the validated MUST screen on SystmOne for the score.",
  principles: [
    "MUST gives the score - this gives the plan. Always screen first.",
    "Say what is driving the concern: intake, unplanned weight loss, acute illness, or a mix.",
    "Translate the score into ward actions and monitoring.",
  ],
  sections: [
    {
      id: "driver",
      heading: "What is driving the risk?",
      why: "From the MUST screen - is the concern low BMI, unplanned weight loss, the acute-illness effect, or a combination?",
      think: [
        "Is the concern intake, weight loss, acute illness, or more than one?",
        "How much weight, over how long?",
      ],
      examples: [
        "8% unplanned weight loss over two months",
        "Poor oral intake on the ward, appetite affected by low mood",
        "Acutely unwell with little intake likely for >5 days",
      ],
      tip: "Name the driver - it shapes the whole plan.",
    },
    {
      id: "intake-barriers",
      heading: "Eating, drinking & barriers",
      why: "What their intake actually looks like, their preferences, and what gets in the way.",
      think: [
        "What is this person actually eating and drinking?",
        "What is getting in the way - swallowing, dental, mental state, side effects, culture?",
      ],
      examples: [
        "Eating about half of meals; prefers small, frequent portions",
        "Swallowing concern - consider SALT",
        "Dental pain / poorly fitting dentures",
        "Cultural or religious requirements",
      ],
      tip: "A barrier you miss (dental pain, swallowing) undoes the rest of the plan.",
    },
    {
      id: "plan",
      heading: "Ward plan",
      why: "The practical actions that follow from the score and the barriers.",
      think: [
        "What practical action is needed on the ward?",
        "What monitoring is needed?",
      ],
      examples: [
        "Food & fluid chart; weekly weight",
        "Fortified diet / supplements; snacks between meals",
        "Mealtime support / supervision; protected mealtimes",
        "Modified-texture diet (per SALT)",
      ],
      tip: "Make it concrete - 'monitor intake' means a food & fluid chart and a weigh day.",
    },
    {
      id: "referral",
      heading: "Referral & re-screen",
      why: "Dietitian / SALT referral and when to re-screen.",
      think: [
        "Who needs to review?",
        "When do we re-screen with MUST?",
      ],
      examples: [
        "Dietitian referral; SALT referral if swallowing concern",
        "GP / medical review",
        "Re-screen weekly, and on any change",
      ],
      tip: "Say when to re-screen - MUST is not a one-off.",
    },
  ],
  footer:
    "Guidance only - no score is calculated here. MUST is a BAPEN tool; run the validated screen on SystmOne. Draft - to be verified.",
};
