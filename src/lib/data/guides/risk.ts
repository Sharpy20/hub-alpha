// Risk Formulation + Risk Management Plan (RMP) builder data.
//
// Source of truth (DHCFT, in repo under docs/.../Named Nurse Help/):
//   - "Risk Management Plans 18.04.24.docx"  -> the EXACT S1 template, content
//      rules, the mandatory MDT line, the 24h rule and where it goes in S1.
//   - "A Guide to Care Planning and Risk Management.docx" -> 24h rule, the
//      "document 'unable to establish' rather than leave blank" rule.
//
// The Risk FORMULATION framework (presenting / pattern / the P's / engagement /
// dynamic / judgement) is standard best practice, not a specific trust document.
// It matches the brief Mike supplied. Labelled as such in the UI.

export interface RiskChipGroup {
  label?: string;
  words: string[];
}

export interface RiskSection {
  id: string;
  // Heading shown in the UI and (for the RMP) used in the generated template.
  heading: string;
  hint: string;
  // The "GAP PROMPT" question that nudges for the personalised detail.
  gap?: string;
  // Trust examples quoted from the RMP guide, shown as a help line.
  trustExamples?: string;
  groups: RiskChipGroup[];
  placeholder?: string;
  // Adds a "specific examples (with dates)" sub-section to this editor.
  examples?: boolean;
}

// ---- Exact mandatory final line (generic version of the RMP guide wording) ----
export const MANDATORY_MDT_LINE =
  "If this risk management plan is unsuccessful and the risk continues to increase, this must be reviewed by the MDT.";

// ---- Trust rule: ONE plan per risk ----
export const SEPARATE_PLANS_NOTE =
  "Write a SEPARATE risk management plan for every current and historical risk - do not combine them into one big plan. Add each risk below.";

// ---- Risk types ----
// Core three are from the RMP guide; the rest are from Mike's "RMP Mega Pack"
// (the full list of risks staff are expected to plan for).
export const RISK_TYPES: string[] = [
  "self-harm",
  "suicide",
  "violence and aggression",
  "risk to others",
  "AWOL / absconsion",
  "medication non-concordance",
  "substance misuse",
  "paranoia / persecutory beliefs",
  "mania / impulsivity",
  "self-neglect / ADLs",
  "diet and nutrition",
  "falls",
  "vulnerability / exploitation",
  "sexual disinhibition",
  "refusal to engage",
  "physical health deterioration",
  "fire risk",
  "hoarding",
  "financial exploitation",
  "homelessness / housing instability",
  "cognitive impairment / confusion",
  "discharge risk",
  "sleep disturbance",
  "infection / delirium",
  "risk to family",
  "weapon access",
  "boundary violations",
  "observations / refusal of obs",
];

// ---- Where it goes in System One (from the RMP guide) ----
export const S1_STEPS: string[] = [
  "Retrieve the patient and click the launch pad.",
  "Open a new 'Safety Plan / Crisis Plan'.",
  "Complete all questions.",
  "On Question 8 ('Is there any other way to reduce risks and make you / others feel safer? Contingency / crisis plan:') write the patient's answer.",
  "Click the black arrows next to the green speech button to the right of this box.",
  "Click 'Assessor'.",
  "Paste the completed template (follow the content guide).",
  "Save as the final version.",
];

// ---- Risk Formulation framework (the WHY) ----
export const FORMULATION_SECTIONS: RiskSection[] = [
  {
    id: "presenting",
    heading: "Presenting risk",
    hint: "What has actually happened recently? The events that bring the risk to attention now.",
    gap: "What has happened recently?",
    groups: [
      { words: ["recent self-harm", "expressed suicidal thoughts", "a suicide attempt", "aggression towards staff", "aggression towards peers", "attempts to leave the ward", "declining food and fluids", "found with concealed items"] },
    ],
    placeholder: "Describe what has happened for THIS patient...",
  },
  {
    id: "pattern",
    heading: "Pattern over time",
    hint: "Is this escalating, repeating, or new? Frequency and any change in severity.",
    gap: "What is the pattern over time?",
    groups: [
      { words: ["escalating in frequency", "escalating in severity", "a longstanding pattern", "a new presentation", "cyclical / linked to mood", "previously responded to support"] },
    ],
    placeholder: "How has this changed over days / weeks / admissions?",
  },
  {
    id: "predisposing",
    heading: "Predisposing factors",
    hint: "Longer-term background that makes risk more likely - history, trauma, diagnosis, past attempts.",
    gap: "What in their history raises the baseline risk?",
    groups: [
      { words: ["history of trauma", "previous suicide attempts", "history of self-harm", "diagnosis of [condition]", "previous admissions", "substance use history", "history of impulsivity", "adverse childhood experiences"] },
    ],
    placeholder: "Relevant history for this patient...",
  },
  {
    id: "precipitating",
    heading: "Precipitating factors",
    hint: "What triggered it now? Recent events or stressors.",
    gap: "What triggers the risk?",
    groups: [
      { words: ["a recent loss / bereavement", "relationship breakdown", "loss of accommodation", "an anniversary", "medication change", "a recent setback", "contact with a specific person", "ward incident"] },
    ],
    placeholder: "What set this off recently...",
  },
  {
    id: "perpetuating",
    heading: "Perpetuating factors",
    hint: "What keeps the risk going once it has started?",
    gap: "What makes things worse / keeps it going?",
    groups: [
      { words: ["ongoing low mood", "active psychosis", "hopelessness", "ongoing substance use", "social isolation", "unresolved stressor", "access to means", "high stimulation environment"] },
    ],
    placeholder: "What sustains the risk for this patient...",
  },
  {
    id: "protective",
    heading: "Protective factors",
    hint: "What reduces the risk - and how stable or fragile are they right now?",
    gap: "What are the protective factors, and how stable are they?",
    groups: [
      { words: ["engaging with staff", "future-oriented thinking", "supportive family", "children / dependents", "faith / cultural beliefs", "responds to 1:1 support", "no current access to means", "fragile and easily lost"] },
    ],
    placeholder: "What is protective, and how robust is it...",
  },
  {
    id: "engagement",
    heading: "Engagement & insight",
    hint: "How engaged are they, and do they recognise the risk?",
    gap: "What helps them engage?",
    groups: [
      { words: ["good engagement", "variable engagement", "hard to engage", "good insight into risk", "limited insight", "minimises the risk", "able to seek help", "reluctant to disclose"] },
    ],
    placeholder: "How they engage and what they understand about the risk...",
  },
  {
    id: "dynamic",
    heading: "Dynamic risk",
    hint: "How does the risk change - time of day, situations, who is around?",
    gap: "When is the risk highest?",
    groups: [
      { words: ["higher overnight", "higher around leave", "higher after visits", "higher when unsupervised", "fluctuates with mood", "linked to specific peers", "rises with intoxication / withdrawal"] },
    ],
    placeholder: "When and where the risk rises...",
  },
  {
    id: "judgement",
    heading: "Overall risk judgement",
    hint: "Your clinical judgement, short and medium term. Pull the threads together.",
    gap: "What is your overall judgement?",
    groups: [
      { label: "Short term", words: ["low in the short term", "moderate in the short term", "high in the short term"] },
      { label: "Medium term", words: ["low in the medium term", "moderate in the medium term", "high in the medium term"] },
    ],
    placeholder: "Your overall judgement and the reasoning...",
  },
];

// ---- Risk Management Plan - the exact S1 template (5 headings) ----
export const RMP_SECTIONS: RiskSection[] = [
  {
    id: "what",
    heading: "WHAT IS THE RISK",
    hint: "The risk name is added for you. Add context here and link it to your formulation.",
    gap: "What exactly is this risk, and to whom?",
    groups: [],
    placeholder: "Add context for this risk (optional)...",
  },
  {
    id: "present",
    heading: "HOW DOES THIS PRESENT",
    hint: "The specific, observable signs it is happening or building - the early warning signs.",
    trustExamples: "specifics on ligature / cutting / pacing",
    gap: "What are the early warning signs for THIS patient?",
    examples: true,
    groups: [
      {
        words: [
          "ligature use", "tying items around the neck", "cutting", "head-banging",
          "pacing", "agitation", "raised voice", "threats towards staff",
          "threats towards peers", "clenched fists", "withdrawal", "isolating in their room",
          "declining to engage", "concealing or hoarding items", "responding to unseen stimuli",
          "attempts to leave the ward",
        ],
      },
    ],
    placeholder: "The specific signs to watch for in this patient...",
  },
  {
    id: "prevent",
    heading: "HOW TO PREVENT / REDUCE",
    hint: "Two parts: how to MANAGE it when it happens, and how to PREVENT or reduce it. Say why where it helps.",
    trustExamples: "manage: 1:1 time, hand over risk items + full search, PRN, time off the ward, medical review, risk strategy meeting. prevent: de-escalation, structured activity.",
    gap: "What specifically helps this patient, and what makes it worse?",
    groups: [
      {
        label: "When it happens (manage)",
        words: [
          "offer 1:1 time", "patient to hand over risk items", "complete a full search",
          "offer PRN", "time off the ward", "request a medical review",
          "arrange a risk strategy meeting", "increase the observation level",
          "remove access to means", "de-escalate",
        ],
      },
      {
        label: "Prevent / reduce",
        words: [
          "de-escalation techniques", "structured activity", "reduce stimulation",
          "named-nurse 1:1s", "distraction techniques", "grounding techniques",
          "collaborative safety planning", "regular check-ins", "a predictable routine",
          "address known triggers", "consistent, calm, non-confrontational engagement",
          "reduce environmental triggers (noise, crowding)", "share and manage risk with the MDT",
          "escalate early when presentation changes",
        ],
      },
    ],
    placeholder: "Be specific about what works for this patient and why...",
  },
  {
    id: "evaluate",
    heading: "EVALUATE SIGNS OF RISK REDUCTION",
    hint: "Measurable change - how will you KNOW it is working? Avoid vague.",
    trustExamples: "e.g. reduced self-harm incidents, or the patient voicing they feel safer",
    gap: "What measurable change shows the risk is reducing?",
    groups: [
      {
        words: [
          "reduced incidents of self-harm", "fewer episodes of agitation",
          "patient voicing they feel safer", "improved engagement with staff",
          "improved emotional regulation", "accepting support / PRN",
          "settled on the ward", "no incidents over the agreed period",
          "using coping strategies independently", "increased stability in mental state",
          "able to communicate needs and accept support",
        ],
      },
    ],
    placeholder: "The measurable signs the plan is working...",
  },
  {
    id: "next",
    heading: "NEXT STEPS IF RISK MANAGEMENT PLAN UNSUCCESSFUL",
    hint: "Escalation thresholds - when and what. The mandatory MDT line is added automatically.",
    gap: "When and how do you escalate?",
    groups: [
      {
        words: [
          "increase the observation level", "request an urgent medical review",
          "request an urgent MDT review", "arrange a risk strategy meeting", "review medication",
          "consider 1:1 nursing", "consider transfer to PICU", "make a safeguarding referral if indicated",
          "consider alternative management strategies in line with trust policy",
        ],
      },
    ],
    placeholder: "Your escalation thresholds for this patient...",
  },
];

// ---- Teaching content ----
export const RISK_TEACHING = {
  formulationVsPlan: {
    title: "Formulation vs plan - what's the difference?",
    points: [
      "A risk FORMULATION explains WHY the risk exists. It links the patient's history, their current presentation, and the likely future risk. It is not a summary of events or a list of risks.",
      "A risk MANAGEMENT PLAN sets out WHAT you will do about it - the actions, who does them, and how you'll know they are working.",
      "The plan should flow from the formulation. If they don't connect, something is missing.",
    ],
  },
  ideationVsAction: {
    title: "Ideation vs action - why it matters",
    points: [
      "Thinking about harm (ideation) is different from acting on it. Movement from ideation towards action raises the risk.",
      "Repeated attempts raise risk. Access to means raises risk. Psychosocial stressors raise risk.",
      "Engagement matters - someone who can tell you how they feel and seek help is at lower immediate risk than someone who has withdrawn.",
    ],
  },
  commonMistakes: {
    title: "Common mistakes",
    points: [
      "Writing a description instead of a plan.",
      "Being too generic - copy-paste text with no patient relevance.",
      "Not linking the formulation to the management plan.",
      "Missing the early warning signs.",
      "Missing the escalation thresholds.",
    ],
  },
  whatGoodLooks: {
    title: "What good looks like",
    points: [
      "Specific and behavioural - real, observable signs.",
      "Action-based - it says what to do, not just what is happening.",
      "Individualised to this patient, but still reusable as a structure.",
      "Defensible in an audit or a tribunal.",
    ],
  },
  gapMethod: {
    title: "The GAP PROMPT method",
    points: [
      "If you're stuck, work through: What triggers the risk? What are the early warning signs? What helps? What makes it worse? What are the protective factors? What is the pattern over time?",
      "If you genuinely don't know something yet, write 'Not yet established' - never leave a section blank.",
    ],
  },
};

// ---- Good vs weak examples (DRAFT - for Mike to verify/replace) ----
export const RISK_EXAMPLES = [
  {
    id: "ligature",
    risk: "Self-harm by ligature",
    weak: {
      label: "Weak (generic - same wording for every patient)",
      formulation: "Patient is a risk of self-harm. Has done it before. Needs monitoring.",
      rmp: "WHAT IS THE RISK - Risk associated with self-harm, which may lead to harm to self or others if not managed.\nHOW DOES THIS PRESENT - Behavioural indicators such as agitation, withdrawal, poor insight or changes in engagement.\nHOW TO PREVENT / REDUCE - Consistent, calm engagement. Reduce environmental triggers. Offer 1:1 support. PRN where indicated.\nEVALUATE SIGNS OF RISK REDUCTION - Reduction in behaviours. Improved engagement.\nNEXT STEPS IF UNSUCCESSFUL - Increase observations. MDT review.",
    },
    strong: {
      label: "Strong (specific, individualised, actionable)",
      formulation:
        "Presenting: tied a ligature from a dressing gown cord in her room two nights ago. Pattern: third ligature this admission, escalating. Predisposing: childhood trauma, three previous admissions for self-harm. Precipitating: contact with her ex-partner by phone on the day of each attempt. Perpetuating: persistent hopelessness, isolating in her room. Protective: engages well with her named nurse, fragile and easily lost when low. Dynamic: risk highest overnight and after phone contact. Overall: high short-term, moderate medium-term risk.",
      rmp:
        "WHAT IS THE RISK - Self-harm by ligature, highest overnight and after contact with her ex-partner.\nHOW DOES THIS PRESENT - Isolating in her room, declining to engage, sourcing cords/items; early signs are withdrawing after phone calls.\nHOW TO PREVENT / REDUCE - When it happens: offer 1:1 time, patient to hand over items and complete a search, offer PRN, request medical review. To prevent: structured evening activity, named-nurse 1:1s after any phone contact, reduce access to ligature points, agree a safety plan. These target her known overnight/post-contact trigger.\nEVALUATE SIGNS OF RISK REDUCTION - Reduced ligature incidents, accepting 1:1 support after calls, voicing she feels safer.\nNEXT STEPS IF RISK MANAGEMENT PLAN UNSUCCESSFUL - Increase observation level, urgent medical review, arrange a risk strategy meeting. " +
        MANDATORY_MDT_LINE,
    },
  },
];
