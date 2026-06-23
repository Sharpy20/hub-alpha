// Physical health assessment - pure-guidance thinking tool.
//
// Field areas mirror the Trust admission Physical Health Assessment. The point is
// NOT to reproduce the questionnaire (SystmOne does that) but to help write a
// short, person-centred summary instead of a clone-y "nil of note". Alcohol
// prompts are AUDIT-C aligned; this tool does not score.

import type { GuidePromptConfig } from "./guideprompt";

export const PHYSICAL_HEALTH_BUILDER: GuidePromptConfig = {
  id: "physical-health-assessment",
  title: "Physical Health Assessment Helper",
  icon: "❤️‍🩹",
  gradient: "from-rose-600 to-pink-700",
  subtitle: "A guide to turning the physical health questions into a short, person-centred summary.",
  breadcrumb: "Physical Health Helper",
  intro:
    "Complete the full assessment in SystmOne, then use these prompts to write a summary that flags what actually matters for this person - rather than 'nil of note' that hides a real issue.",
  notice:
    "Guidance only - it does not score and does not replace the SystmOne Physical Health Assessment. Keep the summary factual and non-judgemental.",
  principles: [
    "Summarise what matters for THIS person - not every question, every time.",
    "Capture the patient's own words on their health and what they want help with.",
    "Record what was offered and declined, not just what was accepted.",
  ],
  sections: [
    {
      id: "conditions",
      heading: "Conditions, pain & medication",
      why: "Existing physical health problems, regular pain, current medication and adherence.",
      think: [
        "What ongoing problems does this person live with?",
        "Are they in regular pain? Do they take their medication as prescribed?",
      ],
      examples: [
        "Lives with diabetes and hypertension; takes medication as prescribed",
        "Chronic back pain affecting sleep and mobility",
        "No known physical health conditions",
      ],
      tip: "Flag anything that needs monitoring on the ward, not just a diagnosis list.",
    },
    {
      id: "smoking-alcohol-substances",
      heading: "Smoking, alcohol & substances",
      why: "Status and pattern, plus what support was offered. Factual and non-judgemental (AUDIT-C aligned for alcohol).",
      think: [
        "Do they smoke or vape - and was NRT / support offered?",
        "What does their drinking actually look like - frequency, amount, binge pattern?",
        "Any substance use, or withdrawal risk to flag?",
      ],
      examples: [
        "Current smoker, ~20/day; NRT offered and accepted",
        "Drinks ~6 cans of strong lager most evenings; morning shakes - withdrawal risk flagged for CIWA review",
        "No substances reported; declined alcohol service referral",
      ],
      tip: "Describe the pattern; avoid moralistic wording like 'drinks too much'.",
    },
    {
      id: "diet-activity",
      heading: "Diet, weight, activity & falls",
      why: "Weight concerns, recent unintentional change, activity, and any fall in the last year.",
      think: [
        "Any concern about diet or weight, or recent unintentional change?",
        "How active are they? Have they fallen in the last year?",
      ],
      examples: [
        "Unintentional weight loss over two months - MUST screen indicated",
        "Largely sedentary; keen to be more active",
        "Fall in the last year - falls assessment indicated",
      ],
      tip: "Point to the next tool (MUST, falls) when a flag appears, rather than just noting it.",
    },
    {
      id: "dental-sensitive",
      heading: "Dental & sensitive screening",
      why: "Dental access, and the sensitive urinary / menstrual / breast / sexual-health prompts - asked with privacy, recorded respectfully.",
      think: [
        "Registered with a dentist? Any current dental pain?",
        "Any urinary, menstrual, breast or sexual-health concerns to follow up?",
      ],
      examples: [
        "Not registered with a dentist; current dental pain - referral needed",
        "Post-menopausal bleeding reported - GP referral",
        "No concerns raised",
      ],
      tip: "Record concisely and respectfully; only ask what is appropriate, with privacy.",
    },
    {
      id: "home-referrals",
      heading: "Home, social & referrals",
      why: "Home conditions affecting health, and what was actioned, offered or declined. Close the loop.",
      think: [
        "Are there problems at home - warmth, repairs, hazards?",
        "What referrals or actions follow from this assessment?",
      ],
      examples: [
        "Difficulty keeping the home warm; social support needs identified",
        "GP follow-up and dietitian referral made",
        "Patient declined further referral",
      ],
      tip: "Note what was offered and declined - not just what was accepted.",
    },
  ],
  footer:
    "Guidance only - no scoring. Field areas mirror the Trust Physical Health Assessment. Complete the full SystmOne assessment. Draft - to be verified.",
};
