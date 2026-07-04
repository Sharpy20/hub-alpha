// Safety Plan - pure-guidance thinking tool.
//
// Structure follows the Stanley & Brown safety-planning steps. Source-aligned:
// the Trust requires the safety plan to relate to the risk formulation, to be
// collaborative, and to be built on the patient's own strategies. Build the
// formulation in the Risk Formulation & RMP guide - this plan sits alongside it.

import type { GuidePromptConfig } from "./guideprompt";

export const SAFETY_PLAN_BUILDER: GuidePromptConfig = {
  id: "safety-plan",
  title: "Safety Plan",
  icon: "🛟",
  gradient: "from-emerald-600 to-green-800",
  subtitle: "A guide to building a safety plan WITH the patient - their warning signs, their coping, their support.",
  breadcrumb: "Safety Plan",
  intro:
    "Work through these steps with the patient, in their words. A safety plan is built with someone, not for them, and it should grow from what already works for this person. It supports the risk formulation - it does not replace it.",
  notice:
    "Build the formulation in the Risk Formulation & RMP guide - this plan sits alongside it.",
  principles: [
    "Collaborative: written with the patient, in their words, wherever possible.",
    "Built on what already works for this person - not a generic template.",
    "Move from what they can do alone, to who they can turn to, to professional help.",
  ],
  focus: [
    { label: "Mental Health Safety Plan (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/4831/2454" },
    { label: "Safety Planning SOP", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/2701/2456" },
  ],
  sections: [
    {
      id: "warning-signs",
      heading: "My warning signs",
      why: "The thoughts, feelings, situations or behaviours that tell this person a difficult period is starting. Personal and specific.",
      think: [
        "What are the first signs, for you, that things are starting to get worse?",
        "What do other people notice in you before you do?",
      ],
      examples: [
        "Feeling hopeless or trapped",
        "Not sleeping",
        "Withdrawing from others",
        "Stronger urges to self-harm",
        "Drinking or using more",
      ],
      tip: "Specific and personal beats a textbook list - use their words.",
    },
    {
      id: "own-coping",
      heading: "What I can do on my own",
      why: "Internal coping strategies the patient can use without anyone else - things that have actually helped before.",
      think: [
        "What helps you cope when things start to feel difficult, that you can do by yourself?",
        "What has worked for you in the past?",
      ],
      examples: [
        "Music / a specific playlist",
        "Going for a walk",
        "Grounding or breathing exercises",
        "A hot drink and quiet time",
        "Writing things down",
      ],
      tip: "Anchor to real strategies they have used, not generic 'distraction techniques'.",
    },
    {
      id: "distraction",
      heading: "People & places that help me settle",
      why: "People or settings that provide distraction and calm - even without talking about how they feel.",
      think: [
        "Who or where helps take your mind off things?",
        "Who settles you, even without talking about it?",
      ],
      examples: [
        "The ward quiet room or sensory room",
        "A particular member of staff",
        "Sitting with another patient they trust",
        "The garden or outside space",
      ],
      tip: "Name the actual places and people on this ward.",
    },
    {
      id: "ask-help",
      heading: "People I can ask for help",
      why: "The people the patient would actually turn to and tell when struggling - named where possible.",
      think: [
        "Who could you tell, and ask for help, when you are really struggling?",
        "Who would you want us to contact?",
      ],
      examples: [
        "Named nurse",
        "A specific family member",
        "A close friend",
        "Their advocate (IMHA)",
      ],
      tip: "Names, not roles - 'my sister Kelly' is more use than 'family'.",
    },
    {
      id: "professional",
      heading: "Professional & crisis support",
      why: "Who staff and services should contact, and how to get urgent help on the ward and after discharge.",
      think: [
        "Who should we contact if you need urgent help?",
        "What is the plan for after discharge?",
      ],
      examples: [
        "Tell staff on the ward immediately",
        "Derbyshire Mental Health Helpline - dial 111 and select option 2 (mental health)",
        "Samaritans 116 123",
        "NHS 111 (option 2), or 999 if life is at risk",
        "Crisis team (after discharge)",
      ],
      tip: "Include both the in-ward route now and the community route for discharge.",
    },
    {
      id: "environment",
      heading: "Making things safer",
      why: "Reducing access to means and making the environment safer - on the ward now, and at home for leave / discharge.",
      think: [
        "What can we do, together, to make things safer right now?",
        "What needs to change at home before leave?",
      ],
      examples: [
        "Agreed items kept by staff",
        "Observation level agreed and explained",
        "Medication held or dispensed in agreed amounts",
        "Home environment made safer before leave",
      ],
      tip: "Agree it together - means-reduction works best when the patient is part of it.",
    },
    {
      id: "feel-safe",
      heading: "What helps me feel safe",
      why: "The patient's own words on what makes them feel safer or less restricted - the heart of a collaborative plan.",
      think: [
        "What helps you feel safe here?",
        "What makes you feel less restricted?",
      ],
      examples: [
        "\"Knowing someone will check on me without making a fuss.\"",
        "\"Being able to phone my mum at night.\"",
        "\"Having my headphones.\"",
      ],
      tip: "Record it word for word.",
    },
    {
      id: "contingency",
      heading: "If the plan is not enough",
      why: "The contingency step - what should happen if the rest of the plan does not hold.",
      think: [
        "Is there any other way to reduce risks and make you or others feel safer?",
        "What would you want us to do if this is not enough?",
      ],
      examples: [
        "Increase observation level",
        "Urgent medical / medication review",
        "Move to a quieter area",
        "Involve the crisis team / on-call",
      ],
      tip: "Agree the escalation in advance so it is not a surprise in a crisis.",
    },
  ],
  footer:
    "Guide only. Structure aligned with Stanley & Brown safety planning and NHS England suicide-prevention guidance. Build the formulation in the Risk guide. Draft - to be verified.",
};
