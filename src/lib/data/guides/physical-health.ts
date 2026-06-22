// Physical health assessment helper.
//
// The field areas below mirror the Trust admission Physical Health Assessment
// (conditions, pain, medication, allergies, smoking, alcohol/substances, diet
// and weight, activity, falls, dental, sexual/urinary prompts, home/social,
// referrals). The point of this tool is NOT to reproduce the questionnaire -
// SystmOne already does that - but to help write a short, person-centred summary
// from the answers, instead of a clone-y "nil of note" entry.
//
// Prompt aid only. Complete the full SystmOne physical health assessment for the
// record. Alcohol prompts are AUDIT-C aligned; this tool does not score.

import type { BuilderConfig } from "./builder";

export const PHYSICAL_HEALTH_BUILDER: BuilderConfig = {
  id: "physical-health-assessment",
  title: "Physical Health Assessment Helper",
  icon: "❤️‍🩹",
  gradient: "from-rose-600 to-pink-700",
  subtitle: "Turn the physical health questions into a short, person-centred summary - not a clone-y 'nil of note'.",
  breadcrumb: "Physical Health Helper",
  docHeading: "PHYSICAL HEALTH SUMMARY",
  outputLabel: "Your physical health summary",
  emptyHint: "Work through the areas to build a person-centred summary, then copy it into the record.",
  dateLine: true,
  notice:
    "Prompt aid only - it does not score and does not replace the SystmOne Physical Health Assessment. Keep the summary factual and non-judgemental.",
  principles: [
    "Summarise what matters for THIS person - not every question, every time.",
    "Capture the patient's own words on their health and what they want help with.",
    "Record what was offered and declined, not just what was accepted.",
    "Flag anything that needs action - a referral, monitoring, or follow-up.",
  ],
  sections: [
    {
      id: "conditions",
      heading: "Conditions, pain & family history",
      hint: "Existing physical health problems, regular pain, and relevant family history.",
      gap: "What ongoing physical health problems does this person live with, and are they in regular pain?",
      groups: [
        {
          words: [
            "diabetes", "hypertension", "asthma / COPD", "cardiac condition",
            "epilepsy", "thyroid disorder", "chronic pain", "no known conditions",
            "relevant family history",
          ],
        },
      ],
      placeholder: "Conditions, any regular pain, relevant family history...",
      naLabel: "None reported",
    },
    {
      id: "medication",
      heading: "Medication & allergies",
      hint: "Current physical-health medication, adherence, and any allergies / adverse reactions.",
      gap: "What are they taking, do they take it as prescribed, and any allergies?",
      groups: [
        {
          words: [
            "takes medication as prescribed",
            "adherence concerns",
            "no current physical-health medication",
            "drug allergy recorded",
            "no known allergies",
          ],
        },
      ],
      placeholder: "Medication, adherence, allergies and reactions...",
      naLabel: "None reported",
    },
    {
      id: "smoking",
      heading: "Smoking & vaping",
      hint: "Smoking / vaping status and whether brief advice or NRT was offered.",
      gap: "Do they smoke or vape, and was NRT / stop-smoking support offered?",
      groups: [
        {
          words: [
            "current smoker", "ex-smoker", "non-smoker", "vapes",
            "NRT offered", "stop-smoking referral offered", "declined",
          ],
        },
      ],
      placeholder: "Smoking / vaping status and support offered...",
      naLabel: "Non-smoker",
    },
    {
      id: "alcohol-substances",
      heading: "Alcohol & substances",
      hint: "Alcohol use (AUDIT-C aligned: frequency, typical amount, binge frequency) and any substance use. Factual and non-judgemental.",
      gap: "What does their drinking / substance use actually look like, and was support offered?",
      groups: [
        {
          words: [
            "alcohol within lower-risk levels",
            "increasing / higher-risk drinking",
            "binge pattern",
            "withdrawal risk - monitor",
            "current substance use",
            "none reported",
            "substance / alcohol service referral offered",
            "declined",
          ],
        },
      ],
      placeholder: "Alcohol pattern (frequency/amount/binge), substances, withdrawal risk, support offered...",
      naLabel: "None reported",
    },
    {
      id: "diet-weight",
      heading: "Diet, weight & nutrition",
      hint: "Weight concerns, recent unintentional change, and any nutrition / hydration needs. Consider a MUST screen.",
      gap: "Any concern about diet or weight, or recent unintentional weight change?",
      groups: [
        {
          words: [
            "no concerns about diet / weight",
            "unintentional weight loss",
            "unintentional weight gain",
            "poor intake",
            "specific dietary need / preference",
            "MUST screen indicated",
          ],
        },
      ],
      placeholder: "Diet, weight concerns, recent change, nutrition / hydration needs...",
      naLabel: "No concerns",
    },
    {
      id: "activity-falls",
      heading: "Activity & falls",
      hint: "Exercise tolerance and any fall in the last year.",
      gap: "How active are they, and have they fallen in the last year?",
      groups: [
        {
          words: [
            "active / good exercise tolerance",
            "largely sedentary",
            "fall in the last year",
            "falls assessment indicated",
          ],
        },
      ],
      placeholder: "Activity level and any falls...",
      naLabel: "No concerns",
    },
    {
      id: "dental",
      heading: "Dental health",
      hint: "Dentist registration, recent check, and any current dental pain or problems.",
      gap: "Are they registered with a dentist, and any current dental pain?",
      groups: [
        {
          words: [
            "registered with a dentist",
            "not registered with a dentist",
            "current dental pain / problem",
            "dental referral needed",
            "no dental concerns",
          ],
        },
      ],
      placeholder: "Dental registration, recent check, current problems...",
      naLabel: "No concerns",
    },
    {
      id: "sensitive",
      heading: "Sexual, urinary & menopause prompts",
      hint: "Sensitive screening prompts - ask with privacy and only what is appropriate. Record concisely and respectfully.",
      gap: "Are there any urinary, menstrual, breast or sexual-health concerns to follow up?",
      groups: [
        {
          words: [
            "urinary symptoms to follow up",
            "post-menopausal bleeding - GP referral",
            "intermenstrual / post-coital bleeding - GP referral",
            "breast change to follow up",
            "no concerns raised",
          ],
        },
      ],
      placeholder: "Any concerns raised and the follow-up planned...",
      naLabel: "No concerns raised",
    },
    {
      id: "home",
      heading: "Home & social",
      hint: "Home conditions that affect health - warmth, repairs, hazards - and anything needing social support.",
      gap: "Are there problems at home - keeping warm, repairs, hazards - that affect their health?",
      groups: [
        {
          words: [
            "no home concerns",
            "difficulty keeping warm",
            "home hazards / disrepair",
            "social support needs identified",
          ],
        },
      ],
      placeholder: "Home conditions and any social support needs...",
      naLabel: "No concerns",
    },
    {
      id: "referrals",
      heading: "Referrals & actions",
      hint: "What was actioned, offered, declined, or judged not appropriate. Close the loop.",
      gap: "What referrals or actions follow from this assessment?",
      groups: [
        {
          words: [
            "GP follow-up",
            "dietitian referral",
            "dental referral",
            "physical activity / weight management",
            "smoking / alcohol / substance service",
            "patient declined further referral",
            "no referral indicated",
          ],
        },
      ],
      placeholder: "Referrals made, offered, declined, or not indicated...",
      naLabel: "None needed",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "A short, readable summary that flags what actually needs action - not a copy of the questionnaire.",
        "The patient's own words on their health and what they want help with.",
        "Records what was offered and declined, not only what was accepted.",
        "Non-judgemental on smoking, alcohol and substances.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "'Nil of note' that hides a real issue.",
        "Listing every answer with no summary of what matters.",
        "Recording 'declined' with no offer noted.",
        "Moralistic wording on lifestyle questions.",
      ],
    },
  ],
  example: {
    topic: "Alcohol & substances",
    weak: "Patient drinks too much and should cut down. Advised accordingly.",
    strong:
      "Reports drinking around 6 cans of strong lager most evenings, more at weekends, and says mornings are shaky if he has not had a drink - withdrawal risk flagged to the medic for a CIWA review. He was open about wanting help and has accepted a referral to the community alcohol service. No other substances reported.",
  },
  footer:
    "Prompt aid only - no scoring. Field areas mirror the Trust Physical Health Assessment. Complete the full SystmOne assessment and review wording before saving.",
};
