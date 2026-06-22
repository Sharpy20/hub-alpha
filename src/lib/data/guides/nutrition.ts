// Nutrition (MUST) care-planning helper - GUIDANCE ONLY, NO SCORING.
//
// MUST (BAPEN Malnutrition Universal Screening Tool) is a five-step screen:
// 1) BMI score, 2) unplanned weight loss in 3-6 months, 3) acute disease effect,
// 4) add for overall risk (0 low / 1 medium / 2+ high), 5) act on the management
// guidance. This tool deliberately does NOT calculate the score - it helps the
// nurse turn a completed MUST screen into a clear, person-centred nutrition plan.
// Always run the validated MUST screen on SystmOne for the actual score.

import type { BuilderConfig } from "./builder";

export const NUTRITION_BUILDER: BuilderConfig = {
  id: "nutrition-screening",
  title: "Nutrition (MUST) Care Plan Helper",
  icon: "🥗",
  gradient: "from-lime-600 to-green-700",
  subtitle: "Turn a MUST screen into a clear nutrition plan - what is driving the risk, and what we will do.",
  breadcrumb: "Nutrition (MUST) Helper",
  docHeading: "NUTRITION CARE PLAN",
  outputLabel: "Your nutrition plan",
  emptyHint: "Run the MUST screen first, then use the prompts here to build the care plan.",
  dateLine: true,
  notice:
    "Guidance only - this tool does NOT calculate a MUST score. Run the validated MUST screen on SystmOne for the score (0 low, 1 medium, 2+ high), then use this to write the plan.",
  principles: [
    "MUST gives the score - this gives the plan. Always screen first.",
    "Say what is driving the concern: intake, unplanned weight loss, acute illness, or a mix.",
    "Translate the score into ward actions and monitoring - a number on its own changes nothing.",
  ],
  sections: [
    {
      id: "driver",
      heading: "What is driving the risk",
      hint: "From the MUST screen - is the concern low BMI, unplanned weight loss, the acute-illness effect, or a combination?",
      gap: "Is the concern intake, weight loss, acute illness, or more than one?",
      groups: [
        {
          words: [
            "low BMI",
            "unplanned weight loss (3-6 months)",
            "acute illness / no intake likely > 5 days",
            "poor oral intake on the ward",
            "combination of factors",
          ],
        },
      ],
      placeholder: "What the MUST screen is flagging, in this person's case...",
      naLabel: "Not established",
    },
    {
      id: "intake",
      heading: "Eating & drinking now",
      hint: "What their intake actually looks like on the ward, and their preferences.",
      gap: "What is this person actually eating and drinking, and what do they prefer?",
      groups: [
        {
          words: [
            "eating most meals",
            "poor / erratic intake",
            "needs encouragement / prompting",
            "fortified / high-calorie options",
            "snacks between meals",
            "specific food / fluid preferences",
          ],
        },
      ],
      placeholder: "Current intake and preferences...",
      naLabel: "Not established",
    },
    {
      id: "barriers",
      heading: "Barriers to eating",
      hint: "What gets in the way - swallowing, dental, mental state, side effects, culture or religion.",
      gap: "What is getting in the way of this person eating and drinking?",
      groups: [
        {
          words: [
            "swallowing concern - consider SALT",
            "dental pain / poorly fitting dentures",
            "appetite affected by mental state",
            "medication side effects",
            "cultural / religious requirements",
            "does not like ward food",
          ],
        },
      ],
      placeholder: "Barriers and how they are being addressed...",
      naLabel: "None identified",
    },
    {
      id: "plan",
      heading: "Ward plan",
      hint: "The practical actions on the ward that follow from the score and the barriers.",
      gap: "What practical action is needed on the ward for this person?",
      groups: [
        {
          words: [
            "food & fluid chart",
            "weekly weight",
            "fortified diet / supplements",
            "mealtime support / supervision",
            "protected mealtimes",
            "modified-texture diet (per SALT)",
          ],
        },
      ],
      placeholder: "The ward actions in place...",
      naLabel: "Not yet agreed",
    },
    {
      id: "referral",
      heading: "Referral & review",
      hint: "Dietitian / SALT referral and when to re-screen.",
      gap: "Who needs to review, and when do we re-screen with MUST?",
      groups: [
        {
          words: [
            "dietitian referral",
            "SALT referral",
            "GP / medical review",
            "re-screen weekly with MUST",
            "re-screen on any change",
          ],
        },
      ],
      placeholder: "Referrals and re-screening plan...",
      naLabel: "None needed currently",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "Names what is driving the risk, not just the score.",
        "Turns the score into concrete ward actions and monitoring.",
        "Addresses the barriers - swallowing, dental, mental state, preferences.",
        "Says when to re-screen.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "Recording a MUST score with no plan attached.",
        "Ignoring a swallowing or dental barrier.",
        "Not re-screening when things change.",
      ],
    },
  ],
  example: {
    topic: "What is driving the risk + plan",
    weak: "MUST score high. Monitor intake.",
    strong:
      "High risk on MUST, driven by 8% unplanned weight loss over two months and poor appetite linked to low mood. Plan: food and fluid chart, weekly weight, fortified diet with mid-morning and evening supplements, mealtime support from staff, and a dietitian referral. Re-screen with MUST weekly.",
  },
  footer:
    "Guidance only - no score is calculated here. MUST is a BAPEN tool; run the validated screen on SystmOne. Review wording before saving.",
};
