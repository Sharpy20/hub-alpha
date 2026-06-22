// Physical restraint & rapid tranquillisation monitoring builder.
//
// SOURCE-ALIGNED with the Trust workflow (Management of Violence & Aggression /
// Positive & Safe). The clinical monitoring record needs: the reason for and
// proportionality of the intervention, what was tried first, the detail of the
// restraint (holds, position, duration) or medication (drug, dose, route, time,
// site), the Datix number, additional risk factors and supporting detail, the
// intervention monitoring (physical obs every 15 minutes for at least an hour +
// NEWS2), and a monitoring-ceased rationale (RN can cease if no additional risk
// factors and ambulatory after >= 1 hour; otherwise a doctor reviews).
//
// This is a drafting / scrutiny aid. It does NOT replace the monitoring chart,
// the Datix, or the Drug Management of Violence & Aggression policy.

import type { BuilderConfig } from "./builder";

export const RESTRAINT_BUILDER: BuilderConfig = {
  id: "restraint-monitoring",
  title: "Restraint & Rapid Tranq Monitoring",
  icon: "🩺",
  gradient: "from-orange-600 to-red-700",
  subtitle: "Draft a defensible monitoring narrative for physical restraint or rapid tranquillisation.",
  breadcrumb: "Restraint & RT Monitoring",
  docHeading: "RESTRAINT / RAPID TRANQUILLISATION MONITORING",
  outputLabel: "Your monitoring narrative",
  emptyHint: "Work through the prompts to draft the monitoring narrative, then copy it into the record.",
  dateLine: true,
  notice:
    "Drafting / scrutiny aid only. It does not replace the monitoring chart, the Datix, or the Drug Management of Violence & Aggression policy. Physical observations are required at least every 15 minutes for the first hour, with NEWS2.",
  principles: [
    "Force must be the least restrictive option, proportionate, and for no longer than necessary.",
    "Oral medication should be offered before any other route.",
    "Record what was tried first - 'least restrictive option' means nothing without it.",
    "The 'additional risk factors' and supporting detail must never be left blank.",
  ],
  sections: [
    {
      id: "type",
      heading: "Reason for monitoring",
      hint: "Which intervention is being monitored, and the immediate risk that made it necessary.",
      gap: "What was the immediate risk that made this necessary at that moment?",
      groups: [
        {
          label: "Intervention",
          words: ["physical restraint", "rapid tranquillisation", "both"],
        },
        {
          label: "Immediate risk",
          words: [
            "imminent serious harm to others",
            "imminent serious harm to self",
            "ongoing assault in progress",
            "no safe less-restrictive option remained",
          ],
        },
      ],
      placeholder: "Intervention type and the specific immediate risk at the time...",
      naLabel: "Not recorded",
    },
    {
      id: "proportionate",
      heading: "Why it was necessary & proportionate",
      hint: "The justification a reviewer will look for - why this, why then, why nothing less would do.",
      gap: "Why was this proportionate at that point, and why would nothing less have worked?",
      groups: [
        {
          words: [
            "lower-level options had failed",
            "risk was immediate and serious",
            "intervention matched the level of risk",
            "ended as soon as it was safe",
          ],
        },
      ],
      placeholder: "The proportionality rationale in this patient's specific circumstances...",
      naLabel: "Not recorded",
    },
    {
      id: "deescalation",
      heading: "What was attempted to de-escalate first",
      hint: "What was genuinely tried before the intervention, including offering oral medication first.",
      gap: "What did we actually try first, and was oral medication offered before any other route?",
      groups: [
        {
          words: [
            "verbal de-escalation",
            "oral medication offered first",
            "space / reduced stimulation",
            "staff changed / stepped back",
            "distraction / sensory strategies",
            "followed the PBS plan",
          ],
        },
      ],
      placeholder: "The de-escalation attempted, in order, before restraint / RT...",
      naLabel: "Not recorded",
    },
    {
      id: "detail",
      heading: "Detail of restraint / medication",
      hint: "For restraint: holds used, position, duration, lead communicator. For RT: drug, dose, route, time, site, and any second medication.",
      gap: "What exactly was done - holds, position and duration, or drug, dose, route, time and site?",
      groups: [
        {
          label: "Restraint",
          words: [
            "standing / seated guide",
            "supine / prone restraint avoided where possible",
            "duration kept to minimum",
            "named lead communicator",
            "no pressure to neck / chest",
          ],
        },
        {
          label: "Rapid tranquillisation",
          words: [
            "drug, dose, route and time recorded",
            "injection site recorded",
            "second medication required",
            "emergency equipment / pulse oximeter to hand",
          ],
        },
      ],
      placeholder: "The specific detail of what was used (holds/position/duration or drug/dose/route/time/site)...",
      naLabel: "Not recorded",
    },
    {
      id: "datix",
      heading: "Datix number",
      hint: "Record the Datix reference for this incident so the records cross-reference.",
      gap: "What is the Datix reference for this incident?",
      placeholder: "Datix number...",
      naLabel: "To follow",
    },
    {
      id: "risk-factors",
      heading: "Additional risk factors",
      hint: "The risk factors that raise the danger of restraint / RT. This box must not be left blank - tick what applies and add detail.",
      gap: "What about this person makes restraint or sedation more dangerous?",
      groups: [
        {
          words: [
            "intoxication / substance use",
            "recent rapid tranquillisation / sedation",
            "respiratory condition",
            "cardiac condition",
            "epilepsy",
            "autism / learning disability",
            "obesity",
            "frailty / older adult",
            "pregnancy",
            "recent injury",
            "prone-position avoidance needed",
          ],
        },
      ],
      placeholder: "Which risk factors apply, and the supporting detail for each...",
      naLabel: "None identified (state explicitly)",
    },
    {
      id: "monitoring",
      heading: "Intervention monitoring",
      hint: "What was actually observed. Physical obs every 15 minutes for at least an hour, with NEWS2. If obs were refused, record it and what you could still observe.",
      gap: "What was recorded objectively - and if full obs were not possible, what did you still observe?",
      groups: [
        {
          words: [
            "physical obs every 15 minutes",
            "NEWS2 recorded",
            "pulse oximetry monitored",
            "level of consciousness monitored",
            "obs refused - respirations / breathing still observed",
            "patient remained within sight and sound",
          ],
        },
      ],
      placeholder: "What was monitored and how, including any refusal and what was still observed...",
      naLabel: "Not yet recorded",
    },
    {
      id: "ceased",
      heading: "Monitoring ceased",
      hint: "Why it is clinically safe to stop. An RN can cease if there are no additional risk factors and the patient is ambulatory after an hour; otherwise a doctor reviews.",
      gap: "Why is it clinically safe to stop monitoring now - and who confirmed it?",
      groups: [
        {
          words: [
            "no additional risk factors and ambulatory after 1 hour",
            "RN ceased monitoring",
            "additional risk factors present - doctor review completed",
            "physically reviewed and stable",
            "follow-up / outstanding actions noted",
          ],
        },
      ],
      placeholder: "The rationale for ceasing, who confirmed it, and any outstanding actions...",
      naLabel: "Ongoing",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "It says what was tried first - the proportionality is shown, not just asserted.",
        "The detail is specific enough to scrutinise: holds, position, duration, or drug/dose/route/time/site.",
        "Additional risk factors are addressed, even if only to say none apply and why that was checked.",
        "Refused observations are recorded honestly, with whatever could still be observed.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "'Restraint used as a least restrictive intervention' with no context.",
        "Leaving the additional-risk-factors box blank.",
        "No record of oral medication being offered before another route.",
        "Vague monitoring ('obs done') instead of the actual frequency and NEWS2.",
      ],
    },
  ],
  example: {
    topic: "Why it was necessary & proportionate",
    weak: "Patient restrained as a last resort using least restrictive techniques. All de-escalation attempted.",
    strong:
      "Two staff guided him to a seated hold for under two minutes after he picked up a chair and advanced on another patient, having already declined oral lorazepam and continued to advance when staff stepped back and offered space. The hold was released as soon as he sat down and accepted the medication orally. No pressure was applied to his neck or chest.",
  },
  footer:
    "Drafting / scrutiny aid only. Source-aligned with the Trust Management of Violence & Aggression workflow. Always complete the monitoring chart, Datix and policy steps, and review wording before saving.",
};
