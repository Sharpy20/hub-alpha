// "My Care Plan" writing builder data.
//
// Source of truth (DHCFT, in repo under docs/.../Named Nurse Help/):
//   - "Care Planning Guidance.docx"
//   - "MY CARE PLAN - Patient prompt sheet final version.docx" (patient-facing questions)
//   - "My Care Plan Template- System One Final Version.docx" (the S1 template + sections)
//
// It scaffolds a personalised, patient-voice care plan that links to the RMP
// (built in the Risk tool) rather than duplicating it. Drafting aid only.

export interface CareChipGroup {
  label?: string;
  words: string[];
}

export interface CareSection {
  id: string;
  heading: string;   // used in the generated plan
  hint: string;      // what this section is for
  gap?: string;      // patient-prompt-sheet question (the "GAP PROMPT")
  patientVoice?: boolean; // show a "patient's own words" quote field
  groups?: CareChipGroup[];
  placeholder?: string;
  linkRmp?: boolean; // show the "reference the RMP, don't duplicate" note + cross-link
}

// Trust rules shown as a callout.
export const CAREPLAN_PRINCIPLES: string[] = [
  "Started on admission and developed within 72 hours (monitored by the 72-hour audits).",
  "The named nurse holds overall responsibility - but it is an MDT document (nursing, OT and psychology all input).",
  "The patient's voice runs throughout - write word for word what they say. Use the patient prompt sheet.",
  "If something is not known, write 'unable to establish on admission' - never leave a section blank.",
  "It links to the Risk Management Plan - reference the RMP, do not duplicate it.",
];

export const CAREPLAN_SECTIONS: CareSection[] = [
  {
    id: "matters",
    heading: "What matters to me",
    hint: "The patient's goals, hopes and what they want from this admission. Their priorities, in their words.",
    gap: "What matters to you? What do you hope for or want to achieve with your care? Any advance directives?",
    patientVoice: true,
    groups: [
      {
        label: "Common goals (write them in the patient's words)",
        words: [
          "get home", "see / rebuild contact with family", "be a better parent",
          "sleep better", "manage my mood / anxiety", "feel safe",
          "understand my diagnosis", "get back to work or study",
          "sort out money / benefits", "reduce or stop substances",
          "rebuild a daily routine", "get out and about again",
        ],
      },
    ],
    placeholder: "Goals agreed with the patient / OT, advance directives, what they want from admission...",
  },
  {
    id: "involved",
    heading: "Who I want involved",
    hint: "Who the patient wants involved, and what can be shared with them. Record consent.",
    gap: "Who do you want involved in your care? Can they have a copy? Can we discuss your care with them?",
    patientVoice: true,
    groups: [
      {
        label: "Staff actions",
        words: [
          "obtain consent to share information and review weekly",
          "offer family / carers access to support",
          "provide the carer with a carer's pack",
          "maintain regular contact with family / carers (with consent)",
        ],
      },
    ],
    placeholder: "Who they want involved, what can be shared, red folder contents...",
  },
  {
    id: "keepingwell",
    heading: "Keeping well - strengths & routine",
    hint: "Protective factors: strengths, skills, hobbies, how they fill their time, coping strategies.",
    gap: "What keeps you well? Your strengths and skills, hobbies, and what you do to cope?",
    patientVoice: true,
    groups: [
      {
        label: "Strengths, interests & coping (prompts)",
        words: [
          "family and friends", "faith / community", "exercise / walking",
          "being outdoors", "music", "art / creative activities", "pets",
          "work or study", "a daily routine", "medication",
          "talking to someone I trust", "grounding / breathing techniques",
        ],
      },
    ],
    placeholder: "Strengths, interests, coping strategies, OT / rec activities...",
  },
  {
    id: "treatment",
    heading: "Treatment & what helps me get better",
    hint: "The core section. Treatment, and what helps recovery - say WHO does it, WHEN, and WHY.",
    gap: "What treatment do you have? What helps you get better, and who will help you with this?",
    patientVoice: true,
    groups: [
      {
        label: "Interventions (who / when / why)",
        words: [
          "named nurse 1:1s", "weekly MDM", "psychology input", "OT goals",
          "monitor response to treatment and side effects",
          "provide information on prescribed medication",
          "physical health monitoring for medications",
          "referrals to appropriate services", "explain T2 / T3 if in place",
        ],
      },
    ],
    placeholder: "Currently prescribed... the team and their roles... what the patient says helps...",
  },
  {
    id: "earlysigns",
    heading: "Early warning signs & relapse",
    hint: "How the patient or staff would know they need more help. Behavioural, observable, specific - their relapse signature.",
    gap: "How will you or people around you know if you need more help? What changes?",
    patientVoice: true,
    groups: [
      {
        label: "Relapse signatures",
        words: [
          "withdrawal", "reduced engagement", "disturbed sleep", "agitation",
          "not eating or drinking", "expressing hopelessness", "stopping medication",
          "responding to unseen stimuli", "increased substance use",
        ],
      },
    ],
    placeholder: "The patient's specific early signs / relapse signature...",
  },
  {
    id: "risks",
    heading: "Risks & safety",
    hint: "Identify the key risks and how they affect care. Reference the RMP - do not duplicate it here.",
    gap: "What helps you feel safe? (Document word for word.)",
    patientVoice: true,
    linkRmp: true,
    groups: [
      {
        label: "What to cover (reference the RMP, do not duplicate it)",
        words: [
          "the key risks that shape day-to-day care",
          "current observation level and why",
          "what the patient says helps them feel safe",
          "agreed practical safety measures",
          "cross-reference the relevant RMP(s)",
        ],
      },
    ],
    placeholder: "Key risks and how they shape care. Point to the relevant RMP(s)...",
  },
  {
    id: "mha",
    heading: "MHA status & restrictions",
    hint: "Legal status, observation level, leave, rights, advocacy and capacity - in plain terms the patient understands.",
    gap: "If you wish to leave the ward... what helps you manage your safety?",
    patientVoice: true,
    groups: [
      {
        label: "To cover",
        words: [
          "observation level and what it means", "frequency of checks",
          "leaving the ward / leave arrangements", "MHA status and rights",
          "refer for an advocate", "wish to appeal (record their response)",
          "capacity assessment completed",
        ],
      },
    ],
    placeholder: "Obs level in plain terms, rights, advocacy, leave...",
  },
  {
    id: "physical",
    heading: "Physical health",
    hint: "Physical health checks - what, who completes them and how often. Only where relevant.",
    gap: "What will be done to support your physical health, who does it and how often?",
    groups: [
      {
        words: [
          "physical observations", "weekly weight", "falls assessment",
          "ADL assessment", "medication-related monitoring", "sensory impairment",
          "PEEP", "additional health needs",
        ],
      },
    ],
    placeholder: "Checks, frequency, who completes them...",
  },
  {
    id: "needs",
    heading: "What I need - social, cultural & communication",
    hint: "Spiritual and cultural needs, social care, communication and sensory needs, accommodation and money.",
    gap: "Spiritual or cultural needs? Help with accommodation or money? Communication needs?",
    patientVoice: true,
    groups: [
      {
        words: [
          "identify social care needs", "spiritual / cultural needs",
          "communication needs", "sensory needs", "help with accommodation",
          "help with money", "identify and report safeguarding concerns",
          "identify barriers to discharge",
        ],
      },
    ],
    placeholder: "Word for word patient response on cultural / spiritual needs, social care...",
  },
  {
    id: "review",
    heading: "Review & escalation",
    hint: "How we know the plan is working, when it is reviewed, and what happens if it is not helping.",
    gap: "How will you know this plan is working? If it doesn't help, what would you like to happen?",
    patientVoice: true,
    groups: [
      {
        label: "How we'll know it's working (prompts)",
        words: [
          "agreed goals being met", "improved mood / sleep / engagement",
          "using coping strategies", "reduced incidents",
          "patient and family feedback", "reviewed at the weekly MDM",
          "what to do if not improving (escalate / consider RESPECT)",
        ],
      },
    ],
    placeholder: "Signs the plan is working, review timing, escalation if not improving (consider RESPECT)...",
  },
];

export const CAREPLAN_TEACHING = {
  whatItIs: {
    title: "What a care plan is (and isn't)",
    points: [
      "A live, working document - a plan of WHAT we will do and WHY, not a form-filling exercise.",
      "Not a narrative summary, and not a repeat of the assessment.",
      "Not the RMP - but it must link to it. The care plan covers overall needs and interventions; the RMP covers specific risk management. They reference each other and align.",
    ],
  },
  commonMistakes: {
    title: "Common mistakes",
    points: [
      "Writing descriptions instead of a plan.",
      "Leaving out the patient's voice.",
      "Copying generic text from another patient.",
      "Not linking to the RMP.",
      "Leaving sections blank instead of 'unable to establish on admission'.",
      "Vague interventions like 'support patient' - say who, when and why.",
    ],
  },
  whatGoodLooks: {
    title: "What good looks like",
    points: [
      "Clear, specific and actionable - any staff member could follow it.",
      "Patient-centred language and the patient's own words.",
      "Linked to the formulation and the RMP.",
      "MDT-relevant, kept up to date at the weekly MDM.",
    ],
  },
  gapMethod: {
    title: "The GAP PROMPT method",
    points: [
      "If you're stuck, use the patient prompt sheet: What matters to you right now? What makes things worse? What helps when things are difficult? What should staff notice early? What should we do if things get worse? Who helps you most?",
      "If something genuinely isn't known yet, write 'unable to establish on admission' - never leave it blank.",
    ],
  },
};

// Draft good-vs-weak example (verify against trust guidance).
export const CAREPLAN_EXAMPLE = {
  topic: "Depression - 'What helps me get better'",
  weak: "Patient is depressed. Staff to support patient and monitor mood. Encourage engagement.",
  strong:
    "Patient says: \"I do better when I'm not on my own and I've got something to do in the day.\" Named nurse to offer daily 1:1s (mornings, when she is most low) to check in and plan her day. OT to support a daily activity timetable from day 2 to rebuild routine. Reviewed weekly at MDM. She has agreed her goal is to be sleeping better and back to walking her dog by discharge.",
};
