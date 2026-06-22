// Post-incident debrief builder (after restraint, rapid tranquillisation or seclusion).
//
// The exact "Debriefing Form and Checklist" wording on SystmOne was not available,
// so the questions below are SOURCE-ALIGNED with what Trust and national policy
// require a debrief to cover: the patient's own account, the antecedents, what
// was tried, physical and emotional impact, what could be done differently, the
// impact on witnesses, the staff debrief, and the learning that should feed back
// into the care plan / RMP / safety plan / PBS.
//
// Policy anchors: debrief the patient within 72 hours of seclusion ending; if
// they cannot or decline to engage, record this in the care plan and re-attempt
// weekly; staff must also be offered a debrief.

import type { BuilderConfig } from "./builder";

export const DEBRIEF_BUILDER: BuilderConfig = {
  id: "debrief",
  title: "Post-Incident Debrief",
  icon: "💬",
  gradient: "from-teal-600 to-cyan-800",
  subtitle: "Capture the patient's account, the learning, and what to change - after restraint, rapid tranquillisation or seclusion.",
  breadcrumb: "Post-Incident Debrief",
  docHeading: "POST-INCIDENT DEBRIEF",
  outputLabel: "Your debrief record",
  emptyHint: "Work through the prompts to record the debrief, then copy it into the patient's record.",
  dateLine: true,
  notice:
    "A debrief with the patient should happen within 72 hours of seclusion ending. If they cannot or decline to engage, record this and re-attempt weekly. Staff must also be offered a debrief.",
  principles: [
    "Two purposes: support the person, and learn something that changes practice.",
    "Use the patient's own words - their account matters as much as the staff account.",
    "Even 'declined' or 'unable to engage' is meaningful if you record why and the plan to revisit.",
    "End by updating the documents the incident affects - care plan, RMP, safety plan, PBS.",
  ],
  sections: [
    {
      id: "patient-account",
      heading: "Patient's account",
      hint: "What happened from the patient's point of view, in their words. Do not lead or correct - record what they say.",
      gap: "Tell me what happened, from your point of view?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      placeholder: "The patient's own account of the incident...",
      naLabel: "Unable / declined to engage - revisit",
    },
    {
      id: "patient-buildup",
      heading: "What the patient felt building up",
      hint: "What they were feeling or noticing just beforehand, and what they think led to it.",
      gap: "What were you feeling or noticing just before it happened? What set it off?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      groups: [
        {
          words: [
            "felt unheard / dismissed",
            "felt frightened or threatened",
            "overwhelmed by noise / people",
            "responding to voices",
            "frustrated by a 'no' / a delay",
            "a specific person or trigger",
          ],
        },
      ],
      placeholder: "What the patient identifies as the build-up and triggers...",
      naLabel: "Not established",
    },
    {
      id: "patient-helpful",
      heading: "What helped / what made it worse (patient view)",
      hint: "What the patient felt staff did that helped, and what felt unhelpful or escalated things. Gold for changing practice.",
      gap: "Was there anything staff did that helped? Anything that made it worse?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      groups: [
        {
          label: "Helped",
          words: ["one calm staff member", "being given space", "PRN early", "being listened to"],
        },
        {
          label: "Made it worse",
          words: ["too many staff at once", "raised voices", "feeling cornered", "being told to calm down"],
        },
      ],
      placeholder: "What the patient says helped and what escalated things...",
      naLabel: "Not established",
    },
    {
      id: "impact",
      heading: "Impact on the patient (physical & emotional)",
      hint: "Any injury, and the emotional impact. Check and record both - injuries trigger separate processes.",
      gap: "Were you hurt physically or emotionally?",
      gapLabel: "Ask the patient:",
      groups: [
        {
          words: [
            "no injury reported or observed",
            "minor injury - body map / Datix completed",
            "physical health check completed",
            "distressed / tearful afterwards",
            "feels embarrassed or ashamed",
            "ongoing support offered",
          ],
        },
      ],
      placeholder: "Physical and emotional impact, and any injury process followed...",
      naLabel: "No impact reported",
    },
    {
      id: "antecedents",
      heading: "Antecedents & early signs (staff view)",
      hint: "Objectively, what built up to this and what early signs were present? Be honest - this is for learning.",
      gap: "What were the antecedents, and what early signs were there that we could act on next time?",
      groups: [
        {
          words: [
            "early signs were present but missed",
            "escalation was rapid / unpredictable",
            "environmental trigger (noise, crowding, another patient)",
            "unmet need (pain, hunger, leave, phone call)",
            "change in routine / staff",
            "known pattern from previous incidents",
          ],
        },
      ],
      placeholder: "The antecedents and earliest warning signs, viewed objectively...",
      naLabel: "Not established",
    },
    {
      id: "what-tried",
      heading: "What was tried & what worked",
      hint: "What was attempted before the intervention, what worked, what did not. Avoid 'all options exhausted' without saying which.",
      gap: "What did we try before the intervention, and what actually worked or did not?",
      groups: [
        {
          words: [
            "de-escalation attempted",
            "PRN offered / given",
            "environment changed",
            "staff changed / stepped back",
            "less restrictive options did not hold",
            "intervention was proportionate to the risk",
          ],
        },
      ],
      placeholder: "What was tried, in what order, and how effective each was...",
      naLabel: "Not established",
    },
    {
      id: "others",
      heading: "Impact on witnesses / other patients",
      hint: "Who saw it, the impact on them, and whether they need reassurance, support or an explanation.",
      gap: "What did others see, and do they need support or reassurance?",
      groups: [
        {
          words: [
            "other patients witnessed the incident",
            "reassurance / explanation offered to those affected",
            "a witness was distressed - support offered",
            "no other patients present",
          ],
        },
      ],
      placeholder: "Who was affected and what support was offered...",
      naLabel: "No witnesses / not applicable",
    },
    {
      id: "staff",
      heading: "Staff debrief & wellbeing",
      hint: "Staff must be offered a debrief. Note any injury / near miss and the support offered.",
      gap: "How are the staff involved, and what support has been offered?",
      groups: [
        {
          words: [
            "staff debrief offered",
            "team debrief held",
            "staff injury / near miss recorded",
            "support via supervision / Occupational Health signposted",
            "Positive & Safe team involved",
          ],
        },
      ],
      placeholder: "Staff debrief offered/held, any injury, and support arrangements...",
      naLabel: "Not yet done",
    },
    {
      id: "learning",
      heading: "Learning & what to update",
      hint: "The whole point of the debrief: what did we learn about this person, and which documents now need changing?",
      gap: "What has this taught us, and what needs to change in the records?",
      groups: [
        {
          label: "What to update",
          words: [
            "update the care plan",
            "update the RMP",
            "update the safety plan",
            "develop / update the PBS plan",
            "review observation level",
            "review medication",
            "add a new trigger / early sign",
            "agree a different staff approach next time",
          ],
        },
      ],
      placeholder: "The learning, and the specific documents and changes that follow from it...",
      naLabel: "No changes identified",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "The patient's voice is genuinely present - not paraphrased into clinical language.",
        "It names at least one concrete thing to do differently, not just 'lessons learned'.",
        "It closes the loop by naming which document to update and what to add.",
        "It is honest about early signs that were missed - that is where the learning is.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "Recording only the staff version of events.",
        "Writing 'patient declined debrief' with no plan to re-attempt.",
        "'All de-escalation attempted' with no detail of what or in what order.",
        "Finishing without updating the care plan / RMP / safety plan.",
      ],
    },
  ],
  example: {
    topic: "Learning & what to update",
    weak: "Lessons learned. Will continue to monitor and use de-escalation in future.",
    strong:
      "She told us the incident started when her leave was cancelled at short notice and no one explained why. Learning: cancellations need explaining face to face, early. Actions: add 'sudden changes to leave / plans' as an early trigger in her RMP; agree in the care plan that her named nurse explains any leave change in person; safety plan to note that a quiet 1:1 and a phone call to her mum usually settle her.",
  },
  footer:
    "Drafting aid for the post-incident debrief. Source-aligned with Trust and national policy on debriefs. Always record in the correct SystmOne section and review wording before saving.",
};
