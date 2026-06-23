// Pressure area (Waterlow) care planning - pure-guidance thinking tool. NO SCORING.
//
// The Waterlow chart scores several domains. This guide does NOT calculate the
// score - it helps turn a completed Waterlow into a focused, modifiable
// prevention plan. Always run the validated Waterlow assessment on SystmOne.

import type { GuidePromptConfig } from "./guideprompt";

export const PRESSURE_BUILDER: GuidePromptConfig = {
  id: "pressure-areas",
  title: "Pressure Area (Waterlow) Helper",
  icon: "🩹",
  gradient: "from-teal-600 to-emerald-800",
  subtitle: "A guide to turning a Waterlow assessment into a focused prevention plan - not a calculator.",
  breadcrumb: "Pressure Area Helper",
  intro:
    "Run the validated Waterlow assessment on SystmOne first (10-14 at risk, 15-19 high, 20+ very high). Then use these prompts to write a prevention plan focused on the modifiable risks.",
  notice:
    "Guidance only - this tool does NOT calculate a Waterlow score. Run the validated Waterlow assessment on SystmOne.",
  principles: [
    "Waterlow gives the score - this gives the prevention plan. Always assess first.",
    "Focus on the modifiable risks: skin, mobility, moisture / continence, nutrition.",
    "Match a prevention action to each risk, and name a skin-check frequency.",
  ],
  sections: [
    {
      id: "drivers-skin",
      heading: "What is raising the risk, and skin status",
      why: "Which Waterlow domains are driving the score, and what the skin looks like now.",
      think: [
        "Is this mainly mobility, skin, continence / moisture or nutrition - or a mix?",
        "What does the skin look like now, and is there any existing damage?",
      ],
      examples: [
        "Reduced mobility after a chest infection",
        "Intermittent incontinence adding moisture at the skin",
        "Redness / non-blanching at the sacrum (categorise + body map)",
        "Fragile, papery skin",
      ],
      tip: "Name the modifiable drivers - the score on its own does not guide care.",
    },
    {
      id: "mobility-moisture",
      heading: "Mobility, repositioning & moisture",
      why: "How much they move themselves, the repositioning plan, and continence / moisture management.",
      think: [
        "How much does this person move themselves, and what repositioning do they need?",
        "Is moisture or incontinence adding to the risk, and how is it managed?",
      ],
      examples: [
        "Repositions independently / needs assistance to reposition",
        "Repositioning schedule agreed; spends long periods seated",
        "Incontinence - skin care plan and barrier cream; regular checks",
      ],
      tip: "Keep skin clean and dry - moisture plus pressure is the fast route to damage.",
    },
    {
      id: "prevention",
      heading: "Prevention plan & equipment",
      why: "The actions and equipment in place. Link nutrition to the MUST plan rather than repeating it.",
      think: [
        "What prevention and equipment is in place?",
        "How often is the skin checked?",
      ],
      examples: [
        "Pressure-relieving mattress / cushion; heels offloaded",
        "Repositioning schedule with a skin inspection each time",
        "Nutrition / hydration optimised (see MUST plan)",
      ],
      tip: "State the skin-check frequency - 'pressure care in place' is not specific enough.",
    },
    {
      id: "review",
      heading: "Referral & review",
      why: "Tissue viability referral and when to reassess.",
      think: [
        "Does tissue viability need to review?",
        "When do we reassess, and what triggers a Datix?",
      ],
      examples: [
        "Tissue viability referral",
        "Reassess Waterlow weekly and on any change in condition",
        "Datix immediately if pressure damage develops",
      ],
      tip: "Reassess after any change in mobility or condition, not just weekly.",
    },
  ],
  footer:
    "Guidance only - no score is calculated here. Run the validated Waterlow assessment on SystmOne. Draft - to be verified.",
};
