// Observation & Engagement plan builder.
//
// SOURCE-ALIGNED with the Trust Observation of Patients policy and good practice:
// observation is therapeutic engagement, not just surveillance; the level must
// have a clear rationale tied to the current risk; staff need to know what the
// level means in practice and what they are watching for; and the plan should
// say what would justify stepping the level up or down. Exact level names vary
// by ward, so the chips offer common labels - use your ward's terminology.

import type { BuilderConfig } from "./builder";

export const OBSERVATION_BUILDER: BuilderConfig = {
  id: "observation-engagement",
  title: "Observation & Engagement Plan",
  icon: "👁️",
  gradient: "from-blue-600 to-indigo-800",
  subtitle: "Write a clear rationale for the observation level - what it manages, what it means in practice, and when it changes.",
  breadcrumb: "Observation & Engagement",
  docHeading: "OBSERVATION & ENGAGEMENT PLAN",
  outputLabel: "Your observation plan",
  emptyHint: "Work through the prompts to write the observation rationale, then copy it into the record.",
  dateLine: true,
  notice:
    "Observation is therapeutic engagement, not just surveillance. Level names vary by ward - use your local terminology. This is a drafting aid, not the observation chart.",
  principles: [
    "Every level needs a rationale tied to the current risk - not a habit or a default.",
    "A bank or new staff member should be able to read it and know exactly what to do.",
    "Engagement matters as much as observation - say how staff should interact, not just watch.",
    "Say what would step the level up or down, so it does not drift unreviewed.",
  ],
  sections: [
    {
      id: "level",
      heading: "Observation level",
      hint: "The level in place. Use your ward's terminology.",
      gap: "What level is in place, and since when?",
      groups: [
        {
          words: [
            "general / Level 1",
            "intermittent (timed) observation",
            "within eyesight / Level 2",
            "within arm's length / Level 3",
            "multi-staff / Level 4",
          ],
        },
      ],
      placeholder: "The exact level and when it started...",
      naLabel: "Not set",
    },
    {
      id: "rationale",
      heading: "Why this level (the risk it manages)",
      hint: "The specific risk or presentation this level is intended to manage - the justification.",
      gap: "What risk or presentation is this observation level intended to manage?",
      groups: [
        {
          words: [
            "active suicidal ideation / intent",
            "recent serious self-harm",
            "risk of absconding",
            "risk to others",
            "vulnerability / exploitation risk",
            "disorientation / falls risk",
            "post-seclusion step-down",
          ],
        },
      ],
      placeholder: "The specific risk this level manages, for this person, right now...",
      naLabel: "Not established",
    },
    {
      id: "practice",
      heading: "What it means in practice",
      hint: "Exactly what staff should do - proximity and supervision at meals, the bathroom, the bedroom, communal areas and on leave.",
      gap: "What should a new or bank staff member actually do, in each setting?",
      groups: [
        {
          words: [
            "maintain the required proximity at all times",
            "supervision at meals",
            "supervision / same-gender support at the bathroom",
            "checks at night without disturbing sleep where safe",
            "remain with patient in communal areas",
            "leave / garden access arrangements",
            "handover of the level at every shift change",
          ],
        },
      ],
      placeholder: "What the level requires in each setting (meals, bathroom, bedroom, communal, leave)...",
      naLabel: "Standard for the level",
    },
    {
      id: "watching",
      heading: "What staff are watching for",
      hint: "The specific signs staff should be alert to for this person - not a generic 'monitor mental state'.",
      gap: "What, specifically, should staff be watching for with this patient?",
      groups: [
        {
          words: [
            "attempts to access means of harm",
            "trying to reach exits",
            "concealing items",
            "responding to unseen stimuli",
            "rising agitation / specific early signs",
            "physical deterioration",
          ],
        },
      ],
      placeholder: "The specific things to watch for with this patient...",
      naLabel: "Not established",
    },
    {
      id: "engagement",
      heading: "Engagement (not just watching)",
      hint: "How staff should interact - the therapeutic side. What this person responds to.",
      gap: "How should staff engage this person, not just observe them?",
      groups: [
        {
          words: [
            "regular, brief check-ins",
            "offer activity / distraction",
            "responds best to one familiar staff member",
            "give space but stay present",
            "use their safety plan / coping strategies",
          ],
        },
      ],
      placeholder: "How staff should engage this patient therapeutically during observation...",
      naLabel: "Not established",
    },
    {
      id: "change",
      heading: "When to step up or down",
      hint: "What would indicate the level is no longer proportionate, or needs increasing. Keeps the level under active review.",
      gap: "What would tell us this level can reduce, or needs to increase?",
      groups: [
        {
          label: "Step down when",
          words: ["sustained reduction in ideation", "engaging openly with staff", "no attempts to access means"],
        },
        {
          label: "Step up if",
          words: ["renewed intent or attempts", "increasing agitation", "concealing items / behaviour change"],
        },
      ],
      placeholder: "The observable triggers for reducing or increasing the level, and review timing...",
      naLabel: "Reviewed each shift / MDT",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "The rationale names the specific risk, not just the level.",
        "It is concrete enough that a bank nurse could follow it on their first shift.",
        "It covers engagement, not just surveillance.",
        "It states what would change the level, so it does not stay high by inertia.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "'On Level 2 obs' with no reason recorded.",
        "'Monitor mental state' with no detail of what to watch for.",
        "No plan for stepping the level down - so it drifts on for weeks.",
        "Surveillance with no therapeutic engagement.",
      ],
    },
  ],
  example: {
    topic: "Why this level (the risk it manages)",
    weak: "Patient on enhanced obs due to risk. To be reviewed.",
    strong:
      "Within-eyesight observation to manage acute suicidal intent - she described a specific plan on admission and was found with a ligature yesterday. Staff to stay within eyesight including at the bathroom (door ajar), check her belongings remain with staff, and engage in brief check-ins at least every 30 minutes using the coping strategies in her safety plan. Step down to intermittent once she has gone 48 hours without expressing intent and is seeking out staff when struggling.",
  },
  footer:
    "Drafting aid for the observation rationale. Source-aligned with the Trust Observation of Patients policy. Use your ward's level terminology and review wording before saving.",
};
