// Seclusion Support Plan builder.
//
// Field list is taken from the DHCFT "Seclusion Support Plan" (SystmOne) as set
// out in the Seclusion and Long-Term Segregation - Psychiatric Emergency Policy
// (Nov 2024, v9). The per-field "prompt yourself" questions are Mike's, written
// to push past clone-y wording and keep the plan focused on getting the person
// OUT of seclusion safely. Chips are starting points, not the answer.
//
// Policy requirements baked in: start the plan as soon as seclusion commences;
// it must cover physical health, items allowed in the room, events leading to
// seclusion, steps towards ending it, nutrition/hydration, communication,
// personal hygiene, advance statement / PBS, family information and the
// patient's views; a PEEP must be recorded; the patient must never be deprived
// of clothing; give the patient a copy unless not clinically safe (record why).

import type { BuilderConfig } from "./builder";

export const SECLUSION_BUILDER: BuilderConfig = {
  id: "seclusion-support-plan",
  title: "Seclusion Support Plan",
  icon: "🚪", // door
  gradient: "from-rose-600 to-red-800",
  subtitle: "Build the plan for keeping the person safe - and getting them out of seclusion sooner.",
  breadcrumb: "Seclusion Support Plan",
  docHeading: "SECLUSION SUPPORT PLAN",
  outputLabel: "Your seclusion support plan",
  emptyHint: "Work through the prompts below to build the support plan, then copy it into SystmOne.",
  dateLine: true,
  notice:
    "Drafting aid for the SystmOne Seclusion Support Plan - it does not replace the Seclusion Care Pathway, reviews or Datix. If you cannot answer a prompt clearly, the plan probably needs more thought - that is the point.",
  principles: [
    "This is not extra paperwork - it is the plan for getting the person out of seclusion safely, sooner.",
    "Start it as soon as seclusion commences and update it at every review.",
    "Involve the patient at the earliest opportunity; if they cannot engage, explain the plan and record why.",
    "Give the patient a copy unless it is not clinically safe - and record the reason if not.",
    "A patient in seclusion must never be deprived of their clothing.",
    "Do not duplicate the incident report or the general care plan - keep this operational.",
  ],
  sections: [
    {
      id: "risk",
      heading: "What is the risk?",
      hint: "Why this person cannot safely be on the ward with others right now. Keep it to the current risk that requires containment - not the whole incident.",
      gap: "What is happening right now that means this patient cannot safely be on the ward with others?",
      groups: [
        {
          label: "Immediate risk to others",
          words: [
            "sustained physical aggression towards others",
            "unpredictable, unprovoked assault",
            "targeted threats towards a named person",
            "use of an improvised weapon",
            "severe, intrusive behaviour others cannot be protected from",
            "sexually disinhibited behaviour towards others",
          ],
        },
      ],
      placeholder: "What is presenting immediate risk to others, who is at risk, and whether it is escalating...",
      naLabel: "Not applicable",
    },
    {
      id: "attempted",
      heading: "What was attempted to prevent seclusion?",
      hint: "Your least-restrictive evidence. What was genuinely tried first, in what order, and how it failed - this is what justifies seclusion at CQC or tribunal.",
      gap: "If I had to justify this to CQC or tribunal, what would I say we genuinely tried first?",
      groups: [
        {
          label: "Tried first",
          words: [
            "verbal de-escalation and reassurance",
            "increased / 1:1 observation",
            "moved to a quieter, lower-stimulus area",
            "redirection to own space",
            "PRN medication offered",
            "PRN medication accepted",
            "oral medication offered before any other route",
            "sensory / distraction strategies",
            "followed the PBS plan",
            "change in staff / gender of staff approaching",
          ],
        },
      ],
      placeholder: "What was tried, in what order, what almost worked even briefly, and why each step was not enough...",
      naLabel: "Nothing recorded yet",
    },
    {
      id: "ceasing",
      heading: "Steps when considering ceasing seclusion",
      hint: "The most important section. What you would need to SEE to feel safe opening the door. Make it observable and specific - avoid 'settled'.",
      gap: "What would I physically observe, and what would the patient be doing differently, before I felt safe ending seclusion?",
      groups: [
        {
          label: "Observable exit signs",
          words: [
            "accepting oral medication",
            "engaging with staff without hostility",
            "able to follow simple instructions",
            "no longer attempting to approach / target others",
            "reduction in pacing, banging or shouting",
            "able to talk about what led to seclusion",
            "showing some insight into the incident",
            "settled to rest without escalation",
          ],
        },
      ],
      placeholder: "Describe what 'safe enough to reintegrate' actually looks like for this person, and the plan for a graded return to the ward...",
      naLabel: "Not yet established",
    },
    {
      id: "peep",
      heading: "Patient Emergency Evacuation Plan (PEEP)",
      hint: "How staff would safely evacuate this patient from seclusion in an emergency (e.g. fire). Practical, not theoretical - every patient in seclusion must have one.",
      gap: "If the fire alarm went off right now, how do we get them out safely?",
      groups: [
        {
          label: "Evacuation plan",
          words: [
            "likely to follow staff instruction if calm",
            "likely to resist - escorted removal under Positive & Safe",
            "minimum 3 Positive & Safe trained staff required",
            "consider absconding risk during evacuation",
            "mobility aid / wheelchair required",
            "use the nearest external exit and muster point",
            "summon help via SAS alarm",
          ],
        },
      ],
      placeholder: "Who does what, how many staff, the route, equipment, and the risks that remain during evacuation...",
      naLabel: "Not yet recorded",
    },
    {
      id: "communication",
      heading: "Communication needs",
      hint: "What helps this person understand and not escalate - tone, pace, clarity, consistency.",
      gap: "What helps this patient understand and not escalate?",
      groups: [
        {
          words: [
            "clear, short, simple language",
            "allow extra time to process",
            "one staff member speaks at a time",
            "calm, low tone and non-confrontational stance",
            "easily overwhelmed - minimise stimulation",
            "interpreter required",
            "hearing / visual impairment - adjust accordingly",
          ],
        },
      ],
      placeholder: "How best to communicate with this patient, and what to avoid...",
      naLabel: "No specific needs identified",
    },
    {
      id: "clothing",
      heading: "Clothing / bedding needs",
      hint: "What the patient can safely have while maintaining dignity. Balance dignity against risk - and remember clothing must never be removed entirely.",
      gap: "What can they safely have that maintains dignity?",
      groups: [
        {
          words: [
            "own clothing - no current need to restrict",
            "anti-ligature / tear-proof clothing (individual MDT risk assessment)",
            "anti-ligature blanket provided",
            "ensure warmth and comfort for room temperature",
            "review need to restrict at each review",
          ],
        },
      ],
      placeholder: "What is provided and why, plus any ligature / tearing risk and the MDT rationale for restriction...",
      naLabel: "Standard - own clothing and bedding",
    },
    {
      id: "medication",
      heading: "Medication reviews needed",
      hint: "Is medication helping, not helping, or making things worse? Flag what the medic needs to review.",
      gap: "Is medication helping, not helping, or making things worse?",
      groups: [
        {
          words: [
            "review effectiveness of PRN",
            "regular psychotropic medication review needed",
            "monitor for over-sedation",
            "monitor for under-treatment",
            "rapid tranquillisation given - follow monitoring policy",
            "urgent medical / physical review required",
          ],
        },
      ],
      placeholder: "What medication question the team needs to answer, and when...",
      naLabel: "No review outstanding",
    },
    {
      id: "hygiene",
      heading: "Personal hygiene / toilet needs",
      hint: "Can they meet their own needs safely? Prompting, supervision, dignity and same-gender support.",
      gap: "Can they meet their own needs safely?",
      groups: [
        {
          words: [
            "able to use facilities independently",
            "needs prompting",
            "needs supervision (same gender)",
            "continence needs to support",
            "preserve privacy and dignity at all times",
          ],
        },
      ],
      placeholder: "What support is needed for hygiene and toileting, and how dignity is preserved...",
      naLabel: "Independent - no support needed",
    },
    {
      id: "utensils",
      heading: "Access to appropriate eating utensils",
      hint: "What they can safely eat and with what. Restrict only what the risk requires.",
      gap: "What can they safely eat and with what?",
      groups: [
        {
          words: [
            "standard utensils - low risk",
            "safer / adapted utensils only",
            "finger foods provided",
            "supervision required during eating",
            "remove utensils after each meal",
          ],
        },
      ],
      placeholder: "What utensils are appropriate and why, and any supervision needed...",
      naLabel: "Standard utensils",
    },
    {
      id: "reading",
      heading: "Restrictions to reading / sensory material",
      hint: "What could help regulate them without increasing risk. Are we restricting more than necessary?",
      gap: "What could help regulate them without increasing risk?",
      groups: [
        {
          words: [
            "access to reading material where safe",
            "religious / spiritual text requested",
            "no hardback items (ligature / weapon risk)",
            "access to radio / sensory items where safe",
            "review restriction at each review",
          ],
        },
      ],
      placeholder: "What is allowed, what is restricted and why...",
      naLabel: "No specific restriction",
    },
    {
      id: "diet",
      heading: "Dietary & fluid requirements",
      hint: "How we keep them physically safe during seclusion. Intake, prompting and any cultural / religious needs.",
      gap: "How do we keep them physically safe with food and fluid during seclusion?",
      groups: [
        {
          words: [
            "offer fluids regularly (record on F&F chart)",
            "encourage / prompt intake",
            "monitor food and fluid intake closely",
            "halal / kosher / vegetarian / vegan",
            "high-calorie options if poor intake",
          ],
        },
      ],
      placeholder: "Intake plan, prompting needed, and any cultural / religious requirements...",
      naLabel: "No specific requirement",
    },
    {
      id: "dysphagia",
      heading: "Dysphagia assessment",
      hint: "Any risk they could choke or struggle swallowing - increased if sedated.",
      gap: "Is there any risk they could choke or struggle to swallow, especially if sedated?",
      groups: [
        {
          words: [
            "no known swallowing concerns",
            "known SALT input - follow guidance",
            "modified diet / thickened fluids",
            "increased risk due to sedation - monitor",
          ],
        },
      ],
      placeholder: "Swallowing risk, any SALT plan, and how it is managed during seclusion...",
      naLabel: "No known concerns",
    },
    {
      id: "trauma",
      heading: "Consideration of past history of trauma",
      hint: "Could anything we are doing make this worse? This is about not re-traumatising while keeping people safe.",
      gap: "Could anything we are doing re-traumatise this person?",
      groups: [
        {
          words: [
            "known trauma history - approach with care",
            "restraint may be a trigger - minimise where safe",
            "confinement / locked-door trigger",
            "gender of staff sensitivity",
            "avoid sudden entry / loud approaches",
          ],
        },
      ],
      placeholder: "Known triggers and what staff should avoid where it is safe to do so...",
      naLabel: "None known",
    },
    {
      id: "pbs",
      heading: "PBS plan / advance statement considered",
      hint: "Do we already know what works for this person? Reduces confusion with the separate care plan.",
      gap: "Do we already know what works for this person - and have we followed it?",
      groups: [
        {
          words: [
            "existing PBS plan reviewed and followed",
            "advance statement reviewed",
            "no current plan - to be developed",
            "plan not followed - reason recorded",
          ],
        },
      ],
      placeholder: "Which plan exists, whether it was followed, and if not, why...",
      naLabel: "N/A - none in place",
    },
    {
      id: "gender",
      heading: "Gender-based considerations",
      hint: "Does the gender of staff affect safety, dignity or distress - for personal care, trauma or risk behaviours?",
      gap: "Does the gender of staff impact safety or distress for this person?",
      groups: [
        {
          words: [
            "same-gender staff for personal care",
            "gender preference linked to trauma",
            "balance preference against risk management",
          ],
        },
      ],
      placeholder: "Any gender-based considerations and how they are balanced with risk...",
      naLabel: "None identified",
    },
    {
      id: "views",
      heading: "Patient involvement & views",
      hint: "What have we told the patient, and what have they said back? Even 'unable to engage' is meaningful if justified.",
      gap: "Have we explained why they are here, and what did they say?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      groups: [
        {
          words: [
            "explained reason for seclusion",
            "explained how seclusion will end",
            "patient disagrees with need for seclusion",
            "too distressed / disorganised to engage now - revisit",
            "patient able to say what would help them settle",
          ],
        },
      ],
      placeholder: "What was explained, the patient's response, and whether they could engage...",
      naLabel: "Unable to engage at present",
    },
    {
      id: "copy",
      heading: "Copy given to patient",
      hint: "Would giving them a copy help, or confuse / escalate them right now? Give it unless not clinically safe - record the reason if withheld.",
      gap: "Would giving them this help, or confuse / escalate them right now?",
      groups: [
        {
          words: [
            "copy given to patient",
            "to be offered when settled enough",
            "not given - would escalate at present (reason recorded)",
          ],
        },
      ],
      placeholder: "Whether a copy was given, and if not, the clinical reason...",
      naLabel: "Not yet offered",
    },
    {
      id: "family",
      heading: "Family / carer informed",
      hint: "What is helpful and appropriate at this stage? Check consent and whether it supports care.",
      gap: "What would be helpful and appropriate to share with family or carers at this stage?",
      groups: [
        {
          words: [
            "consent to share confirmed",
            "family / carer informed",
            "no consent to share - not informed",
            "not appropriate at this time",
          ],
        },
      ],
      placeholder: "Who was informed, consent position, and timing...",
      naLabel: "Not applicable",
    },
    {
      id: "presentation",
      heading: "Appearance, mood & level of awareness",
      hint: "A snapshot of how the patient is right now - not a full MSE. What you would see through the window.",
      gap: "If I glanced through the window, what would I see?",
      groups: [
        {
          label: "Appearance / behaviour",
          words: ["agitated", "pacing", "withdrawn", "lying still", "responding to unseen stimuli"],
        },
        {
          label: "Mood",
          words: ["distressed", "irritable", "labile", "calm", "tearful"],
        },
        {
          label: "Level of awareness",
          words: ["alert", "drowsy / sedated", "disorientated", "reduced awareness of surroundings"],
        },
      ],
      placeholder: "A brief snapshot of presentation right now...",
      naLabel: "Not yet recorded",
    },
    {
      id: "physical",
      heading: "Physical health, frailty & mobility",
      hint: "Anything physical that makes this riskier - sedation, falls, mobility, chronic conditions, deterioration to watch for.",
      gap: "Is there anything physically that makes this more risky?",
      groups: [
        {
          words: [
            "baseline NEWS2 recorded",
            "monitor closely post rapid tranquillisation",
            "falls risk",
            "mobility / frailty concern",
            "chronic condition (e.g. diabetes, cardiac, respiratory)",
            "intoxication / substances - monitor",
          ],
        },
      ],
      placeholder: "Physical health considerations and what needs monitoring...",
      naLabel: "No concerns identified",
    },
    {
      id: "cultural",
      heading: "Cultural & spiritual needs",
      hint: "What matters to this person beyond the immediate crisis - food, prayer, modesty, practices.",
      gap: "What matters to this person beyond the immediate crisis?",
      groups: [
        {
          words: [
            "prayer times / space respected where safe",
            "access to religious text where safe",
            "modesty / dress requirements",
            "dietary requirements linked to faith",
            "interpreter / cultural liaison",
          ],
        },
      ],
      placeholder: "Cultural or spiritual needs and how they are met where safe...",
      naLabel: "None identified",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "Reads as an operational plan, not a copy of the incident report or the care plan.",
        "The exit criteria are observable - another nurse could read them and know when the door can open.",
        "Least-restrictive options are shown as a sequence: what was tried, in what order, and why each was not enough.",
        "Restrictions (clothing, utensils, reading) are justified by the current risk and reviewed each time.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "Using 'settled' or 'improved' with no description of what changed.",
        "Restricting more than the risk requires (the patient must never be deprived of clothing).",
        "Leaving the patient's views blank instead of recording 'unable to engage - revisit'.",
        "Treating it as a tick-box rather than the plan to end seclusion.",
      ],
    },
    {
      title: "The prompt method",
      points: [
        "Each section has a 'prompt yourself' question - answer that, in this person's specifics, before reaching for a chip.",
        "If you cannot answer the prompt clearly, the plan needs more thought - that is the signal, not a failure.",
        "Chips are a starting point to save typing, not the finished entry.",
      ],
    },
  ],
  example: {
    topic: "Steps when considering ceasing seclusion",
    weak: "Patient to be reviewed when settled. Cease seclusion when no longer a risk to others.",
    strong:
      "Consider ending seclusion when he is accepting oral lorazepam when offered, talking to staff through the hatch without threats, no longer trying to reach the door when staff approach, and able to say what happened earlier. Plan a graded return: door opened with two staff present first, then escorted to his room, observing for 30 minutes before stepping observation down.",
  },
  footer:
    "Drafting aid for the SystmOne Seclusion Support Plan. Grounded in the DHCFT Seclusion & Long-Term Segregation Policy (Nov 2024). Always review wording against the live policy and the patient before it goes in the record.",
};
