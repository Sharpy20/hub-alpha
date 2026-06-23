// Post-incident debrief - pure-guidance thinking tool.
//
// Source-aligned with Trust and national policy on debriefs (exact SystmOne
// "Debriefing Form and Checklist" wording was not available). Debrief the patient
// within 72 hours of seclusion ending; if they cannot or decline, record it and
// re-attempt weekly; staff must also be offered a debrief.

import type { GuidePromptConfig } from "./guideprompt";

export const DEBRIEF_BUILDER: GuidePromptConfig = {
  id: "debrief",
  title: "Post-Incident Debrief",
  icon: "💬",
  gradient: "from-teal-600 to-cyan-800",
  subtitle: "A guide to a debrief that actually changes something - after restraint, rapid tranquillisation or seclusion.",
  breadcrumb: "Post-Incident Debrief",
  intro:
    "Use these prompts to debrief well, then record it in SystmOne. Two things matter: supporting the person, and learning something that changes practice. The patient's account matters as much as the staff one.",
  notice:
    "Debrief the patient within 72 hours of seclusion ending. If they cannot or decline, record it and re-attempt weekly. Staff must also be offered a debrief.",
  principles: [
    "Use the patient's own words - do not translate them into clinical language.",
    "Be honest about early signs that were missed - that is where the learning is.",
    "Finish by updating what the incident affects: care plan, RMP, safety plan, PBS.",
  ],
  sections: [
    {
      id: "patient-account",
      heading: "The patient's account",
      why: "Their version of events, in their words. Do not lead or correct - record what they say.",
      think: [
        "Tell me what happened, from your point of view?",
        "What do you think led up to it?",
        "What were you feeling or noticing just beforehand?",
      ],
      examples: [
        "\"They cancelled my leave and no one told me why.\"",
        "\"I felt like no one was listening so I lost it.\"",
        "\"The voices were really bad and the ward was too loud.\"",
      ],
      tip: "Quote them. \"Patient says...\" carries more weight than a paraphrase.",
    },
    {
      id: "helped-worse",
      heading: "What helped / what made it worse",
      why: "What the patient felt staff did that helped, and what escalated things. Gold for changing practice.",
      think: [
        "Was there anything staff did that helped?",
        "Was there anything that felt unhelpful or made it worse?",
      ],
      examples: [
        "Helped: one calm member of staff, being given space, PRN offered early, being listened to",
        "Made it worse: too many staff at once, raised voices, feeling cornered, being told to calm down",
      ],
      tip: "Capture both sides honestly - the 'made it worse' list is what you change next time.",
    },
    {
      id: "impact",
      heading: "Impact on the patient",
      why: "Physical and emotional impact. Check and record both - any injury triggers separate processes.",
      think: [
        "Were you hurt physically?",
        "How are you feeling now, emotionally?",
        "Is there anything you need from us right now?",
      ],
      examples: [
        "No injury reported or observed",
        "Minor injury - body map and Datix completed",
        "Tearful and embarrassed afterwards; reassurance and support offered",
      ],
      tip: "Record the emotional impact, not just whether there was a physical injury.",
    },
    {
      id: "antecedents",
      heading: "Antecedents & early signs (staff view)",
      why: "Objectively, what built up to this and what early signs were present? This is for learning, so be honest.",
      think: [
        "What were the antecedents?",
        "What early signs were there that we could act on next time?",
        "Is this a known pattern from previous incidents?",
      ],
      examples: [
        "Early signs were present (pacing, short answers) but not acted on",
        "Escalation was rapid and unpredictable",
        "Unmet need beforehand (pain, hunger, a delayed phone call)",
        "Environmental trigger - noise, crowding, another patient",
      ],
      tip: "Name the earliest sign someone could have responded to.",
    },
    {
      id: "what-tried",
      heading: "What was tried & what worked",
      why: "What was attempted before the intervention, what worked, what did not.",
      think: [
        "What did we try before the intervention?",
        "What worked, even briefly? What did not?",
        "Was the intervention proportionate to the risk?",
      ],
      examples: [
        "De-escalation attempted; PRN offered",
        "Environment changed / staff stepped back",
        "Less restrictive options did not hold",
      ],
      tip: "Avoid 'all options exhausted' - say which options, in what order.",
    },
    {
      id: "others",
      heading: "Impact on witnesses / other patients",
      why: "Who saw it, the impact on them, and whether they need reassurance or an explanation.",
      think: [
        "Which other patients witnessed it?",
        "What impact did it have on them?",
        "Do they need reassurance, support or an explanation?",
      ],
      examples: [
        "Two patients witnessed the incident - reassurance offered",
        "A witness was distressed; 1:1 support offered",
        "No other patients present",
      ],
      tip: "Do not forget the bystanders - a quiet word often prevents the next incident.",
    },
    {
      id: "staff",
      heading: "Staff debrief & wellbeing",
      why: "Staff must be offered a debrief. Note any injury or near miss and the support offered.",
      think: [
        "How are the staff involved?",
        "Was there any injury or near miss?",
        "What support has been offered?",
      ],
      examples: [
        "Staff debrief offered / team debrief held",
        "Staff injury or near miss recorded",
        "Support via supervision / Occupational Health signposted",
      ],
      tip: "A debrief that ignores the staff is only half done.",
    },
    {
      id: "learning",
      heading: "Learning & what to update",
      why: "The whole point: what did we learn about this person, and which documents now need changing?",
      think: [
        "What has this taught us about their triggers and what helps?",
        "What will we do differently next time?",
        "Which records need updating?",
      ],
      examples: [
        "Add a new trigger / early sign to the RMP",
        "Update the care plan with the agreed staff approach",
        "Update the safety plan with what settles them",
        "Develop / update the PBS plan; review observation level or medication",
      ],
      tip: "Name the document AND the specific change - 'lessons learned' on its own changes nothing.",
    },
  ],
  footer:
    "Guide only, source-aligned with Trust and national debrief policy. Record in the correct SystmOne section. Draft - to be verified.",
};
