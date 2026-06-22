// Personal (moving & handling) risk assessment helper.
//
// SOURCE-ALIGNED with the Trust Moving and Handling Policy, which requires the
// personal handling risk assessment to cover: the person being assisted, the
// environment, the person carrying out the task, the assistance required, the
// number of staff, the equipment to be used, and how to support the individual
// in an emergency.
//
// Prompt aid only. Complete the SystmOne personal handling risk assessment for
// the record.

import type { BuilderConfig } from "./builder";

export const HANDLING_BUILDER: BuilderConfig = {
  id: "personal-handling",
  title: "Personal Handling Helper",
  icon: "🤝",
  gradient: "from-cyan-600 to-blue-700",
  subtitle: "Plan the safest way to assist this person to move - and what to do if it goes wrong.",
  breadcrumb: "Personal Handling Helper",
  docHeading: "PERSONAL HANDLING PLAN",
  outputLabel: "Your handling plan",
  emptyHint: "Work through the prompts to build the handling plan, then copy it into the record.",
  dateLine: true,
  notice:
    "Prompt aid only - it does not replace the SystmOne personal handling risk assessment or moving & handling training.",
  principles: [
    "Cover the person, the environment, the staff, the assistance, the numbers, the equipment - and the emergency.",
    "Be specific enough that staff who do not know the patient could assist safely.",
    "Say what changes if the patient is distressed, in pain, weak or impulsive.",
  ],
  sections: [
    {
      id: "task",
      heading: "Movement / task needed",
      hint: "What movement or transfer this plan is for - and how often.",
      gap: "What movement or transfer does this person need help with?",
      groups: [
        {
          words: [
            "bed mobility / repositioning",
            "sit-to-stand",
            "bed-to-chair transfer",
            "walking / mobilising",
            "toileting transfer",
            "falls recovery from the floor",
          ],
        },
      ],
      placeholder: "The specific task(s) this plan covers...",
      naLabel: "Not specified",
    },
    {
      id: "independence",
      heading: "What they can do independently",
      hint: "Their current ability - what they can manage themselves and what they cannot.",
      gap: "What can this person do for themselves, and where does it break down?",
      groups: [
        {
          words: [
            "weight-bears reliably",
            "weight-bears unpredictably",
            "can follow instructions",
            "cannot reliably follow instructions",
            "fatigues quickly",
            "independent with supervision only",
          ],
        },
      ],
      placeholder: "Current ability and where assistance is needed...",
      naLabel: "Not established",
    },
    {
      id: "assistance",
      heading: "Assistance required",
      hint: "The type and level of help - supervision, prompting, hands-on assistance, or full assistance.",
      gap: "What kind of help is needed - supervision, prompting, or hands-on?",
      groups: [
        {
          words: [
            "supervision only",
            "verbal prompting",
            "stand-by assistance",
            "assistance of one",
            "assistance of two",
            "full assistance",
          ],
        },
      ],
      placeholder: "The type and level of assistance required...",
      naLabel: "Not established",
    },
    {
      id: "staff-equipment",
      heading: "Staff numbers & equipment",
      hint: "How many staff, and what equipment is to be used (and any that must NOT be used).",
      gap: "How many staff and what equipment - and is anything contraindicated?",
      groups: [
        {
          words: [
            "one staff member",
            "two staff members",
            "hoist + correct sling size",
            "slide sheet",
            "transfer board",
            "walking aid (frame / stick)",
            "no equipment required",
          ],
        },
      ],
      placeholder: "Staff numbers, equipment to use, and anything contraindicated...",
      naLabel: "Not established",
    },
    {
      id: "environment",
      heading: "Environment",
      hint: "Space, floor surface, bed / chair height and any hazards that affect safe handling.",
      gap: "What about the environment affects safe handling here?",
      groups: [
        {
          words: [
            "adequate space to manoeuvre",
            "restricted space",
            "bed / chair at correct height",
            "wet or cluttered floor",
            "good lighting",
          ],
        },
      ],
      placeholder: "Environmental factors and how they are managed...",
      naLabel: "No concerns",
    },
    {
      id: "behaviour",
      heading: "If distressed, in pain or resistant",
      hint: "How the plan changes if the patient becomes distressed, is in pain, is weak, or resists mid-task.",
      gap: "What changes if the patient is distressed, in pain, weak or impulsive during the task?",
      groups: [
        {
          words: [
            "stop and reassure if distressed",
            "pain relief before the task",
            "approach calmly, one person leading",
            "abandon and reattempt later if unsafe",
            "best time of day for the patient",
          ],
        },
      ],
      placeholder: "How to adapt if the patient is distressed, in pain or resistant...",
      naLabel: "No specific adaptation",
    },
    {
      id: "emergency",
      heading: "Emergency plan",
      hint: "What to do if the patient deteriorates, collapses or becomes unsafe mid-task. Required by policy.",
      gap: "If they collapse or deteriorate mid-task, what do staff do?",
      groups: [
        {
          words: [
            "lower safely to the floor, do not catch",
            "summon help / emergency buzzer",
            "place in recovery position if appropriate",
            "call for medical assistance / 2222",
            "do not move alone if injury suspected",
          ],
        },
      ],
      placeholder: "The emergency plan if the patient deteriorates or collapses during handling...",
      naLabel: "Standard emergency response",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "Specific enough that a bank or agency colleague could assist safely first time.",
        "States staff numbers and the exact equipment (including sling size).",
        "Includes the emergency plan - not just the routine transfer.",
        "Adapts for distress, pain and the best time of day.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "'Assist as required' with no detail of numbers or equipment.",
        "No emergency plan for a collapse mid-task.",
        "Ignoring how distress or pain changes the safest approach.",
      ],
    },
  ],
  example: {
    topic: "Assistance required & emergency plan",
    weak: "Patient needs help to mobilise. Staff to assist.",
    strong:
      "Needs the assistance of two with a frame for short distances; weight-bears unpredictably when drowsy after his night sedation, so transfers are best mid-morning. If he starts to go down, lower him gently to the floor rather than trying to hold him up, put out an emergency call, and do not move him until he has been checked for injury.",
  },
  footer:
    "Prompt aid only. Source-aligned with the Trust Moving and Handling Policy. Complete the SystmOne personal handling risk assessment and review wording before saving.",
};
