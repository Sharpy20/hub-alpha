// Safety Plan builder.
//
// Structure follows the widely-used Stanley & Brown safety planning steps
// (warning signs -> own coping -> distraction through people/places -> people to
// ask for help -> professional/crisis support -> making the environment safer),
// plus a collaborative "what helps you feel safe" step and a contingency step.
//
// This is SOURCE-ALIGNED: the Trust requires the safety plan to relate to the
// risk screen / formulation, to be collaborative where possible, and to be built
// on the patient's own strategies and support needs. National guidance (NHS
// England "Staying safe from suicide") favours a collaborative safety plan over
// static low/medium/high prediction. The formulation itself lives in the Risk
// Formulation & RMP builder - this plan should sit alongside it.

import type { BuilderConfig } from "./builder";

export const SAFETY_PLAN_BUILDER: BuilderConfig = {
  id: "safety-plan",
  title: "Safety Plan",
  icon: "🛟",
  gradient: "from-emerald-600 to-green-800",
  subtitle: "Build a collaborative safety plan in the patient's own words - their warning signs, their coping, their support.",
  breadcrumb: "Safety Plan",
  docHeading: "SAFETY PLAN",
  outputLabel: "Your safety plan",
  emptyHint: "Work through the steps with the patient to build the safety plan, then copy it into the record.",
  dateLine: true,
  notice:
    "A safety plan should be built WITH the patient, not for them, and should relate to the risk formulation. Build the formulation in the Risk Formulation & RMP builder - this plan sits alongside it, it does not replace it.",
  principles: [
    "Collaborative: written with the patient, in their words, wherever possible.",
    "Built on what already works for this person - not a generic template.",
    "Move from what the patient can do alone, to who they can turn to, to professional help.",
    "A safety plan supports a formulation - it is not a substitute for understanding the risk.",
  ],
  sections: [
    {
      id: "warning-signs",
      heading: "My warning signs",
      hint: "The thoughts, feelings, situations or behaviours that tell this person a difficult period is starting. Personal and specific.",
      gap: "What are the first signs, for you, that things are starting to get worse?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      groups: [
        {
          words: [
            "feeling hopeless / trapped",
            "not sleeping",
            "withdrawing from others",
            "stronger urges to self-harm",
            "drinking / using more",
            "racing or intrusive thoughts",
            "stopping eating",
          ],
        },
      ],
      placeholder: "The patient's own early warning signs...",
      naLabel: "Not established",
    },
    {
      id: "own-coping",
      heading: "What I can do on my own",
      hint: "Internal coping strategies the patient can use without anyone else - things that have helped before.",
      gap: "What helps you cope when things start to feel difficult, that you can do by yourself?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      groups: [
        {
          words: [
            "music / a specific playlist",
            "going for a walk",
            "grounding / breathing exercises",
            "a hot drink and quiet time",
            "writing things down",
            "a comfort item",
            "distraction with TV / a game",
          ],
        },
      ],
      placeholder: "The patient's own coping strategies that work for them...",
      naLabel: "Not established",
    },
    {
      id: "distraction",
      heading: "People & places that help me settle",
      hint: "People or settings that provide distraction and a sense of calm - even without talking about how they feel.",
      gap: "Who or where helps take your mind off things and settle you, even without talking about it?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      groups: [
        {
          words: [
            "the ward quiet room / sensory room",
            "a particular member of staff",
            "sitting with another patient they trust",
            "the garden / outside space",
            "phoning a friend or family member",
          ],
        },
      ],
      placeholder: "People and places that distract and calm this patient...",
      naLabel: "Not established",
    },
    {
      id: "ask-help",
      heading: "People I can ask for help",
      hint: "The people the patient would actually turn to and tell when they are struggling - named where possible.",
      gap: "Who could you tell, and ask for help, when you are really struggling?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      groups: [
        {
          words: [
            "named nurse",
            "a specific family member",
            "a close friend",
            "any staff member on shift",
            "their advocate (IMHA)",
          ],
        },
      ],
      placeholder: "Named people the patient would turn to and how to reach them...",
      naLabel: "Not established",
    },
    {
      id: "professional",
      heading: "Professional & crisis support",
      hint: "Who staff and services should contact, and how to get urgent help on the ward and after discharge.",
      gap: "Who should we contact, and how do you get urgent help if you need it?",
      groups: [
        {
          words: [
            "tell staff on the ward immediately",
            "named nurse / nurse in charge",
            "Derbyshire Mental Health Helpline 0800 028 0077",
            "Samaritans 116 123",
            "NHS 111 (option 2) / 999 if life at risk",
            "crisis team (after discharge)",
          ],
        },
      ],
      placeholder: "Ward escalation and crisis contacts relevant to this patient...",
      naLabel: "Standard ward escalation",
    },
    {
      id: "environment",
      heading: "Making things safer",
      hint: "Reducing access to means and making the environment safer - on the ward now, and at home for leave / discharge.",
      gap: "What can we do, together, to make things safer right now and on leave?",
      groups: [
        {
          words: [
            "agreed items kept by staff",
            "observation level agreed and explained",
            "search / removal of risk items (with explanation)",
            "leave / home environment made safer before leave",
            "medication held / dispensed in agreed amounts",
          ],
        },
      ],
      placeholder: "Specific, agreed steps to reduce access to means and make the environment safer...",
      naLabel: "Not yet agreed",
    },
    {
      id: "feel-safe",
      heading: "What helps me feel safe",
      hint: "The patient's own words on what makes them feel safer or less restricted - the heart of a collaborative plan.",
      gap: "What helps you feel safe here?",
      gapLabel: "Ask the patient:",
      patientVoice: true,
      placeholder: "Word for word, what the patient says helps them feel safe...",
      naLabel: "Unable to establish",
    },
    {
      id: "contingency",
      heading: "If the plan is not enough",
      hint: "The contingency / crisis step - what should happen if the rest of the plan does not hold.",
      gap: "Is there any other way to reduce risks and make you or others feel safer if this is not enough?",
      groups: [
        {
          words: [
            "increase observation level",
            "urgent medical review",
            "review medication",
            "move to a quieter area",
            "involve the crisis team / on-call",
            "agreed in advance with the patient",
          ],
        },
      ],
      placeholder: "The agreed contingency if the plan does not hold...",
      naLabel: "Not yet agreed",
    },
  ],
  teaching: [
    {
      title: "What good looks like",
      points: [
        "It sounds like the patient, not the ward - their words, their strategies, their people.",
        "It moves from self-help, to informal support, to professional help, in that order.",
        "It is specific: named people, named places, real coping strategies that have worked.",
        "It connects to the formulation - the warning signs match the risk you have formulated.",
      ],
    },
    {
      title: "Common mistakes",
      points: [
        "A generic plan that would fit any patient.",
        "Skipping the patient's own coping and jumping straight to 'tell staff'.",
        "No means-reduction step.",
        "Writing it for the patient instead of with them.",
      ],
    },
  ],
  example: {
    topic: "What I can do on my own",
    weak: "Patient to use coping strategies and distraction techniques when distressed.",
    strong:
      "Patient says: \"If I put my headphones on and listen to drum and bass and pace the corridor for a bit, the urges pass.\" She has agreed to try this first, and to come and find her named nurse if it has not helped within about twenty minutes rather than going to her room alone.",
  },
  footer:
    "Drafting aid for a collaborative safety plan. Structure aligned with Stanley & Brown safety planning and NHS England suicide-prevention guidance. Build the formulation in the Risk builder and review wording before saving.",
};
