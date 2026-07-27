// Optional "walk me through it" pop-ups for guides where a criteria section is
// really a decision, not a paragraph. Mike's pattern (27 Jul 2026): break the
// long prose into collapsible sections, then let the deciding section offer a
// short guided walk instead of asking staff to hold the rules in their head.
//
// Data-driven so the sweep across the other text-heavy guides (BACKLOG Section N
// item 3.5) can add a walk without new components.

export interface CriteriaAnswer {
  label: string;
  description?: string;
  /** Question id to go to next. Ignored if outcome is set. */
  next?: string;
  /** Outcome id to finish on. */
  outcome?: string;
}

export interface CriteriaQuestion {
  id: string;
  question: string;
  /** Optional smaller print under the question - examples, what counts. */
  help?: string;
  answers: CriteriaAnswer[];
}

export interface CriteriaOutcome {
  id: string;
  /** Drives the colour: yes = duty applies, no = it does not, unsure = go and check. */
  tone: "yes" | "no" | "unsure";
  title: string;
  detail: string;
  /** Optional bullets - what to do next. */
  actions?: string[];
}

export interface CriteriaWalk {
  /** Header of the section this belongs under, matched exactly. */
  section: string;
  /** Button label shown inside that section. */
  trigger: string;
  title: string;
  intro?: string;
  startId: string;
  questions: CriteriaQuestion[];
  outcomes: CriteriaOutcome[];
  /** Shown at the bottom of every outcome - the caveat that always applies. */
  footnote?: string;
}

// S117 entitlement. Two things staff get wrong, both handled here: entitlement
// can come from a PREVIOUS admission (it survives readmission), and the S117
// aftercare meeting is not the same thing as the discharge planning meeting.
// See the "two meetings" note on the criteria step of the s117-meeting workflow.
export const S117_QUALIFY_WALK: CriteriaWalk = {
  section: "Who qualifies",
  trigger: "Does my patient qualify?",
  title: "Does my patient qualify for S117 aftercare?",
  intro:
    "Three questions at most. This tells you whether a S117 aftercare meeting is needed before discharge - it does not replace a check with the MHA Office if you are unsure.",
  startId: "current",
  questions: [
    {
      id: "current",
      question:
        "In this admission, is the patient detained under Section 3, 37, 45A, 47 or 48?",
      help:
        "Include the restricted forms - 37/41 and 47/49 both count. Section 2, Section 4, a holding power (5(2) or 5(4)) and informal admission do NOT create the duty on their own.",
      answers: [
        { label: "Yes", description: "One of those sections applies now", outcome: "qualifies-current" },
        { label: "No", description: "Informal, Section 2, or another section", next: "previous" },
        { label: "I am not sure", description: "Check the legal status before you decide", outcome: "check-status" },
      ],
    },
    {
      id: "previous",
      question:
        "Has the patient EVER been detained under one of those sections, in any previous admission?",
      help:
        "S117 entitlement survives readmission. Someone discharged from a Section 3 years ago who comes back informally still holds it. It only ends when the ICB and the Local Authority jointly agree it should.",
      answers: [
        { label: "Yes", description: "There was a qualifying section in an earlier admission", outcome: "qualifies-previous" },
        { label: "No", description: "No qualifying section in any admission", outcome: "no-duty" },
        { label: "I am not sure", description: "The history needs checking", outcome: "check-history" },
      ],
    },
  ],
  outcomes: [
    {
      id: "qualifies-current",
      tone: "yes",
      title: "S117 aftercare applies",
      detail:
        "The current section creates the duty. Aftercare that meets a need arising from the mental disorder and reduces the risk of readmission must be provided free of charge.",
      actions: [
        "Book a S117 aftercare meeting before discharge - at least 7 days' notice to Mental Health Social Care.",
        "This is separate from the discharge planning meeting, though the two are often held together.",
        "Check ordinary residence early so you know which Local Authority is responsible.",
      ],
    },
    {
      id: "qualifies-previous",
      tone: "yes",
      title: "S117 aftercare still applies",
      detail:
        "This is the one that gets missed. Entitlement from an earlier qualifying section survives readmission, so it applies even though this admission is informal or under Section 2.",
      actions: [
        "Book a S117 aftercare meeting before discharge - at least 7 days' notice to Mental Health Social Care.",
        "This is separate from the discharge planning meeting, though the two are often held together.",
        "If anyone says S117 lapsed on the last discharge, it only ends when the ICB and the Local Authority jointly agree it has.",
      ],
    },
    {
      id: "no-duty",
      tone: "no",
      title: "No S117 duty",
      detail:
        "With no qualifying section in any admission, the S117 aftercare duty does not arise and aftercare is not free-of-charge under Section 117.",
      actions: [
        "The patient should still have a discharge planning meeting before they leave.",
        "A Care Act assessment may still be appropriate - that is a separate route.",
      ],
    },
    {
      id: "check-status",
      tone: "unsure",
      title: "Check the legal status first",
      detail:
        "The answer turns entirely on which section the patient is on, so confirm it before deciding anything.",
      actions: [
        "Check the detention papers, or ask the MHA Office.",
        "Come back to this once you know - do not assume there is no duty.",
      ],
    },
    {
      id: "check-history",
      tone: "unsure",
      title: "Check the admission history",
      detail:
        "A qualifying section in any previous admission is enough, so an unknown history cannot be treated as a no.",
      actions: [
        "Ask the MHA Office to check for previous detentions.",
        "Until you know, plan on the basis that a S117 meeting may be needed - it is easier to stand one down than to arrange one late.",
      ],
    },
  ],
  footnote:
    "If in doubt, the MHA Office can confirm both the current section and the detention history.",
};
