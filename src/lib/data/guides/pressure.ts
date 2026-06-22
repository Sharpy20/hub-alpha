// Pressure area (Waterlow) care-planning helper - GUIDANCE ONLY, NO SCORING.
//
// The Waterlow chart scores domains: sex/age, build/weight for height,
// continence, skin type, mobility, nutrition, tissue malnutrition, neurological
// deficit, surgery/trauma, and medication (10-14 at risk, 15-19 high, 20+ very
// high). This tool does NOT calculate the score - it helps turn a completed
// Waterlow into a clear, modifiable pressure-area prevention plan. Always run the
// validated Waterlow assessment on SystmOne for the actual score.

import type { BuilderConfig } from "./builder";

export const PRESSURE_BUILDER: BuilderConfig = {
  id: "pressure-areas",
  title: "Pressure Area (Waterlow) Helper",
  icon: "🩹",
  gradient: "from-teal-600 to-emerald-800",
  subtitle: "Turn a Waterlow assessment into a focused prevention plan - the modifiable risks and what we will do.",
  breadcrumb: "Pressure Area Helper",
  docHeading: "PRESSURE AREA PREVENTION PLAN",
  outputLabel: "Your prevention plan",
  emptyHint: "Run the Waterlow assessment first, then use the prompts here to build the prevention plan.",
  dateLine: true,
  notice:
    "Guidance only - this tool does NOT calculate a Waterlow score. Run the validated Waterlow assessment on SystmOne (10-14 at risk, 15-19 high, 20+ very high), then use this to write the plan.",
  principles: [
    "Waterlow gives the score - this gives the prevention plan. Always assess first.",
    "Focus on the modifiable risks: skin, mobility, moisture/continence and nutrition.",
    "Match a prevention action to each risk, and say how often skin is checked.",
  ],
  sections: [
    {
      id: "drivers",
      heading: "What is raising the risk",
      hint: "From the Waterlow - which domains are driving the score for this person?",
      gap: "Is this mainly a mobility, skin, continence/moisture or nutrition issue - or a combination?",
      groups: [
        {
          words: [
            "reduced mobility",
            "incontinence / moisture",
            "fragile / broken skin",
            "poor nutrition / hydration",
            "low or high body weight",
            "neurological deficit / reduced sensation",
            "combination of factors",
          ],
        },
      ],
      placeholder: "Which Waterlow domains are driving the risk for this person...",
      naLabel: "Not established",
    },
    {
      id: "skin",
      heading: "Skin status",
      hint: "Current skin condition and any existing damage, with sites.",
      gap: "What does their skin look like now, and is there any existing damage?",
      groups: [
        {
          words: [
            "skin intact",
            "redness / non-blanching at a pressure site",
            "existing pressure damage (categorise + body map)",
            "fragile / papery skin",
            "dry skin",
          ],
        },
      ],
      placeholder: "Skin condition, sites of concern, any existing damage...",
      naLabel: "Intact",
    },
    {
      id: "mobility",
      heading: "Mobility & repositioning",
      hint: "How much they move independently, and the repositioning plan.",
      gap: "How much does this person move themselves, and what repositioning do they need?",
      groups: [
        {
          words: [
            "repositions independently",
            "needs assistance to reposition",
            "repositioning schedule agreed",
            "spends long periods seated",
            "encourage movement / mobilising",
          ],
        },
      ],
      placeholder: "Mobility and the repositioning plan...",
      naLabel: "Independent",
    },
    {
      id: "moisture",
      heading: "Moisture & continence",
      hint: "Continence and any moisture at the skin, plus skin-care plan.",
      gap: "Is moisture or incontinence adding to the risk, and how is it managed?",
      groups: [
        {
          words: [
            "continent",
            "incontinence - skin care plan",
            "barrier cream",
            "regular continence checks",
            "moisture from perspiration",
          ],
        },
      ],
      placeholder: "Continence, moisture and skin-care actions...",
      naLabel: "No concerns",
    },
    {
      id: "prevention",
      heading: "Prevention plan & equipment",
      hint: "The actions and equipment in place - link nutrition to the MUST plan rather than repeating it.",
      gap: "What prevention and equipment is in place, and how often is skin checked?",
      groups: [
        {
          words: [
            "pressure-relieving mattress / cushion",
            "repositioning schedule",
            "skin inspection at each reposition",
            "keep skin clean and dry",
            "heels offloaded",
            "nutrition / hydration optimised (see MUST plan)",
          ],
        },
      ],
      placeholder: "Prevention actions, equipment, and skin-check frequency...",
      naLabel: "Not yet agreed",
    },
    {
      id: "review",
      heading: "Referral & review",
      hint: "Tissue viability referral and when to reassess.",
      gap: "Does tissue viability need to review, and when do we reassess?",
      groups: [
        {
          words: [
            "tissue viability referral",
            "reassess Waterlow weekly",
            "reassess on any change in condition",
            "Datix if pressure damage develops",
          ],
        },
      ],
      placeholder: "Referrals and reassessment plan...",
      naLabel: "None needed currently",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "Focuses on the modifiable risks driving the score, not the number alone.",
        "Matches a prevention action to each risk and names a skin-check frequency.",
        "Links to the nutrition (MUST) plan rather than repeating it.",
        "Says when to reassess and when to escalate to tissue viability.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "A Waterlow score with no prevention plan attached.",
        "No repositioning schedule or skin-check frequency.",
        "Not reassessing after a change in mobility or condition.",
      ],
    },
  ],
  example: {
    topic: "What is raising the risk + prevention",
    weak: "High Waterlow score. Pressure care in place.",
    strong:
      "High risk on Waterlow, driven by reduced mobility after a recent chest infection and intermittent incontinence. Plan: pressure-relieving mattress, four-hourly repositioning with a skin inspection each time, barrier cream and prompt continence care to keep skin dry, heels offloaded, and nutrition optimised per her MUST plan. Reassess Waterlow weekly and Datix immediately if any skin damage develops.",
  },
  footer:
    "Guidance only - no score is calculated here. Run the validated Waterlow assessment on SystmOne. Review wording before saving.",
};
