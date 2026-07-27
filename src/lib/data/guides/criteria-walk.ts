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
  /**
   * Keep this answer off the main flowchart spine - rendered as a small link
   * under the branches instead of a branch box. For the "I am not sure" escape
   * hatches, which matter but would clutter a yes/no diagram.
   */
  minor?: boolean;
}

export interface CriteriaQuestion {
  id: string;
  /** Short label for the flowchart box - keep it to a line. */
  question: string;
  /** Optional smaller print under the question - examples, what counts. */
  help?: string;
  answers: CriteriaAnswer[];
}

export interface CriteriaOutcome {
  id: string;
  /** Drives the colour: yes = duty applies, no = it does not, unsure = go and check. */
  tone: "yes" | "no" | "unsure";
  /** Short label shown in the flowchart box under its branch. */
  short: string;
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
    "Two questions. Follow the arrows - the whole thing is on one screen so you can see where your patient lands.",
  startId: "current",
  questions: [
    {
      id: "current",
      question: "Is the patient on Section 3 in THIS admission?",
      help:
        "Section 37, 45A, 47 or 48 count too, including the restricted forms 37/41 and 47/49. Section 2, Section 4 and the holding powers 5(2) and 5(4) do NOT create the duty on their own, and neither does an informal admission.",
      answers: [
        { label: "Yes", outcome: "qualifies-current" },
        { label: "No", next: "previous" },
        { label: "I am not sure", minor: true, outcome: "check-status" },
      ],
    },
    {
      id: "previous",
      question: "Was the patient on Section 3 in a PREVIOUS admission?",
      help:
        "Any earlier admission counts, however long ago. S117 entitlement survives readmission - it only ends when the ICB and the Local Authority jointly agree it should.",
      answers: [
        { label: "Yes", outcome: "qualifies-previous" },
        { label: "No", outcome: "no-duty" },
        { label: "I am not sure", minor: true, outcome: "check-history" },
      ],
    },
  ],
  outcomes: [
    {
      id: "qualifies-current",
      tone: "yes",
      short: "S117 applies",
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
      short: "S117 still applies",
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
      short: "No S117 duty",
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
      short: "Check the section",
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
      short: "Check the history",
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
