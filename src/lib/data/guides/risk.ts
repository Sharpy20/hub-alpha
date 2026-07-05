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

// ---- The 7 SystmOne risk-screen domains ----
// The WAA Inpatient Risk Screening Tool groups risk under 7 domains. The 28
// RISK_TYPES above are bucketed here so the picker mirrors SystmOne. Every risk
// appears in exactly one domain; "other (unlisted risk)" covers the rest
// (including domain 6, for which none of the 28 map directly).
export interface RiskDomain {
  title: string;
  risks: string[];
}
export const RISK_DOMAINS: RiskDomain[] = [
  {
    title: "1. Self-harm or suicide",
    risks: ["self-harm", "suicide"],
  },
  {
    title: "2. Risk to self (self-neglect, ADLs, life skills)",
    risks: [
      "self-neglect / ADLs", "diet and nutrition", "medication non-concordance",
      "substance misuse", "refusal to engage", "observations / refusal of obs",
      "sleep disturbance", "hoarding", "AWOL / absconsion", "discharge risk",
    ],
  },
  {
    title: "3. Harm or neglect to others",
    risks: [
      "violence and aggression", "risk to others", "risk to family", "fire risk",
      "sexual disinhibition", "weapon access", "boundary violations",
      "paranoia / persecutory beliefs", "mania / impulsivity",
    ],
  },
  {
    title: "4. Harm or neglect by others",
    risks: ["vulnerability / exploitation", "financial exploitation"],
  },
  {
    title: "5. Physical health and frailty",
    risks: [
      "physical health deterioration", "falls", "infection / delirium",
      "cognitive impairment / confusion",
    ],
  },
  {
    title: "6. Risk to a foetus, infant or child under 18",
    risks: [],
  },
  {
    title: "7. Environmental and external factors",
    risks: ["homelessness / housing instability"],
  },
];

// ---- "Other / unlisted risk" catch-all ----
// A free-text risk the nurse names themselves, so they can cover anything the
// 28 predefined risks miss. When picked, the builder shows EVERY prompt from
// EVERY risk as chips (the full palette) in both the formulation and the RMP.
export const BLANK_RISK = "other (unlisted risk)";

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
    placeholder: "What is protective, and how steady is it...",
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

// ---- Risk-specific chip word-banks for the RMP -----------------------------
// Mike's feedback: the "how does this present / prevent / evaluate / next steps"
// suggestions were identical for every risk, so diet-and-nutrition got the same
// "ligature / pacing" chips as self-harm. These give each risk its OWN starting
// chips. They are a STARTING POINT, not the whole answer - the gap prompt, free
// text and "add patient-specific detail" nudge still push staff to individualise.
// Editors can change these on the builder (saved per device).
//
// Keyed by risk name (must match RISK_TYPES) -> RMP section id -> chip groups.
// Sections not listed for a risk fall back to the generic RMP_SECTIONS chips.
export type RmpSectionId = "present" | "prevent" | "evaluate" | "next";

const MANAGE = "When it happens (manage)";
const REDUCE = "Prevent / reduce";

export const RMP_RISK_CHIPS: Record<string, Partial<Record<RmpSectionId, RiskChipGroup[]>>> = {
  "self-harm": {
    present: [{ words: ["fresh cuts or scratches", "sourcing sharps or blades", "concealing items in room or clothing", "isolating in bedroom or bathroom", "covering arms / long sleeves in heat", "sudden calm after distress", "asking about ligature points", "declining to hand items over"] }],
    prevent: [
      { label: MANAGE, words: ["offer 1:1 time", "patient to hand over items", "complete a room and personal search", "offer PRN", "wound care / first aid", "request a medical review", "increase observation level"] },
      { label: REDUCE, words: ["agree a safety / coping plan", "harm-minimisation discussion", "distraction / sensory box", "named-nurse 1:1s at difficult times", "remove access to sharps and ligature points", "structured activity to reduce idle time"] },
    ],
    evaluate: [{ words: ["reduced frequency / severity of self-harm", "using coping strategies instead of harming", "handing items over voluntarily", "voicing urges before acting", "engaging with named nurse", "wounds healing, no new injuries"] }],
    next: [{ words: ["increase observation level", "urgent medical review of injuries", "arrange a risk strategy meeting", "review medication", "consider 1:1 nursing", "safeguarding referral if indicated"] }],
  },
  "suicide": {
    present: [{ words: ["expressing hopelessness / no future", "giving belongings away / saying goodbye", "researching or asking about methods", "sudden calm after distress", "writing notes or messages", "withdrawing from staff and peers", "declining food, fluids or medication", "seeking ligature points or heights"] }],
    prevent: [
      { label: MANAGE, words: ["offer 1:1 / constant engagement", "remove access to means", "increase observation level", "complete a search", "offer PRN", "urgent psychiatric review", "stay with the patient"] },
      { label: REDUCE, words: ["collaborative safety planning", "reduce access to means", "named-nurse 1:1s", "build hope / future-focused talk", "involve family / supports", "predictable routine and check-ins"] },
    ],
    evaluate: [{ words: ["voicing they feel safer", "reduction in suicidal ideation", "future-oriented talk / plans", "accepting support and PRN", "improved engagement", "eating, drinking and taking medication"] }],
    next: [{ words: ["increase to 1:1 / eyesight obs", "urgent psychiatric review", "review medication", "risk strategy / MDT review", "consider PICU", "review leave status"] }],
  },
  "violence and aggression": {
    present: [{ words: ["raised voice / shouting", "clenched fists / pacing", "invading personal space", "verbal threats to staff or peers", "throwing or banging objects", "refusing boundaries", "targeting a specific person", "escalating irritability"] }],
    prevent: [
      { label: MANAGE, words: ["de-escalate / lower stimulation", "offer PRN", "create space / move others away", "set clear boundaries calmly", "offer time off the ward / quiet area", "request urgent staff support", "follow PMVA policy as a last resort"] },
      { label: REDUCE, words: ["identify and avoid known triggers", "structured, meaningful activity", "consistent calm non-confrontational approach", "reduce noise and crowding", "early PRN before escalation", "de-escalation preferences / advance statement", "separate from specific peer"] },
    ],
    evaluate: [{ words: ["fewer aggressive incidents", "responding to de-escalation", "using time-out voluntarily", "fewer threats / settled interactions", "accepting PRN early", "stable mental state"] }],
    next: [{ words: ["increase observation level", "urgent medical review", "review medication / regular PRN", "risk strategy / MDT review", "Datix and review triggers", "consider transfer / PICU"] }],
  },
  "risk to others": {
    present: [{ words: ["threats or intimidation towards others", "fixation on a particular person", "boundary-testing behaviour", "concealing items usable as weapons", "agitation around specific individuals", "verbal hostility", "predatory / targeting behaviour"] }],
    prevent: [
      { label: MANAGE, words: ["maintain safe staffing and observation", "separate from the person at risk", "remove potential weapons / items", "de-escalate", "offer PRN", "clear consistent boundaries", "request urgent staff support"] },
      { label: REDUCE, words: ["risk-aware care plan shared with MDT", "supervised contact where needed", "address underlying drivers (psychosis, etc.)", "structured supervised activity", "consistent staff approach", "safeguarding awareness for the person at risk"] },
    ],
    evaluate: [{ words: ["no incidents towards others", "reduced hostility / threats", "appropriate boundaries maintained", "engaging safely with peers", "stable presentation"] }],
    next: [{ words: ["increase observation level", "urgent MDT / risk strategy review", "safeguarding referral", "review medication", "consider transfer / PICU", "police involvement if a crime occurs"] }],
  },
  "AWOL / absconsion": {
    present: [{ words: ["loitering near exits / doors", "asking about leave or discharge repeatedly", "watching staff and door routines", "expressing intent to leave", "agitation / restlessness", "trying to follow others through doors", "dressed to leave / gathering belongings"] }],
    prevent: [
      { label: MANAGE, words: ["confirm legal status and leave", "increase observation level", "alert the team and door security", "engage and de-escalate", "offer escorted time off the ward", "inform nurse in charge", "follow AWOL policy if missing"] },
      { label: REDUCE, words: ["address reasons for wanting to leave", "agree structured escorted leave", "meaningful activity on the ward", "regular orientation and reassurance", "named-nurse 1:1s", "involve family / supports"] },
    ],
    evaluate: [{ words: ["no absconsion attempts", "using leave appropriately and returning", "voicing intent rather than acting", "settled on the ward", "engaging with the leave plan"] }],
    next: [{ words: ["review and tighten observation level", "review leave / legal status with MDT", "complete AWOL paperwork / inform police if missing", "risk strategy meeting", "consider locked-door / PICU review"] }],
  },
  "medication non-concordance": {
    present: [{ words: ["refusing or cheeking medication", "spitting out or hiding tablets", "questioning the need for medication", "refusing depot / IM", "voicing distrust of medication", "deteriorating mental state off medication", "declining at specific times"] }],
    prevent: [
      { label: MANAGE, words: ["explore reasons for refusal", "offer alternative formulation (liquid / orodispersible)", "education on benefits and side effects", "involve prescriber / pharmacist", "check for and manage side effects", "offer at a preferred time", "mouth checks where indicated"] },
      { label: REDUCE, words: ["build trust and rapport around medication", "shared decision-making / advance statement", "consistent prescriber and routine", "side-effect monitoring and treatment", "consider depot if appropriate", "family / advocate involvement"] },
    ],
    evaluate: [{ words: ["accepting medication consistently", "fewer refusals", "engaging in discussion about medication", "stable / improving mental state", "reporting side effects rather than stopping"] }],
    next: [{ words: ["prescriber / medical review", "review formulation or regime", "capacity review / consider T2-T3 (MHA)", "MDT review", "pharmacy input"] }],
  },
  "substance misuse": {
    present: [{ words: ["appearing intoxicated or withdrawn", "smell of substances", "paraphernalia found", "secretive behaviour / unexplained absences", "requests for frequent leave", "physical signs (pupils, tremor)", "mood change after leave or visits", "associating with supplying peers"] }],
    prevent: [
      { label: MANAGE, words: ["physical observations (NEWS2)", "manage withdrawal as prescribed", "search per policy if indicated", "medical review", "drug screen where appropriate", "remove substances / paraphernalia", "review leave and visitors"] },
      { label: REDUCE, words: ["substance-misuse care plan / brief intervention", "refer to / liaise with drug and alcohol services", "psychoeducation on risks", "structured activity to reduce boredom", "risk-assess and review leave", "relapse-prevention planning"] },
    ],
    evaluate: [{ words: ["negative drug screens", "no signs of intoxication", "engaging with substance services", "using leave without use", "stable physical observations"] }],
    next: [{ words: ["medical review (intoxication / withdrawal)", "review leave and visitor arrangements", "MDT / risk strategy review", "refer to substance-misuse service", "physical health escalation if unwell"] }],
  },
  "paranoia / persecutory beliefs": {
    present: [{ words: ["suspicion / mistrust of staff or peers", "accusing others of plotting or poisoning", "guarded, hypervigilant behaviour", "refusing food, drink or medication", "barricading or hiding", "hostility linked to beliefs", "misreading neutral actions as threats"] }],
    prevent: [
      { label: MANAGE, words: ["calm non-confrontational approach", "neither collude with nor directly challenge beliefs", "offer reassurance and space", "offer PRN", "consistent trusted staff", "reduce perceived threats / stimulation", "medical review"] },
      { label: REDUCE, words: ["build trust with consistent named staff", "validate the feeling not the belief", "antipsychotic review / optimisation", "predictable routine and clear communication", "reduce stimulation and crowding", "grounding / occupational activity"] },
    ],
    evaluate: [{ words: ["reduced suspiciousness", "accepting food, drink and medication", "engaging with trusted staff", "less hostility linked to beliefs", "improved reality testing"] }],
    next: [{ words: ["psychiatric / medication review", "increase observation if acting on beliefs", "MDT / risk strategy review", "consider PICU if unmanageable", "review leave"] }],
  },
  "mania / impulsivity": {
    present: [{ words: ["pressured speech / flight of ideas", "reduced need for sleep", "overactive / unable to settle", "disinhibited or reckless behaviour", "grandiosity", "irritable when thwarted", "overspending / giving items away", "intrusive with peers"] }],
    prevent: [
      { label: MANAGE, words: ["reduce stimulation / low-stimulus area", "offer PRN", "clear simple boundaries", "limit access to means of harm / overspending", "redirect energy to safe activity", "protect sleep", "medical review"] },
      { label: REDUCE, words: ["mood-stabiliser / medication optimisation", "structured low-stimulus routine", "sleep-hygiene support", "consistent limit-setting across the team", "safeguard finances and valuables", "monitor for exhaustion / dehydration"] },
    ],
    evaluate: [{ words: ["improved sleep", "less pressured / settled speech", "fewer impulsive incidents", "accepting boundaries", "stable mood", "eating and drinking adequately"] }],
    next: [{ words: ["psychiatric / medication review", "increase observation level", "physical health monitoring (exhaustion, dehydration)", "MDT / risk strategy review", "review leave / finances"] }],
  },
  "self-neglect / ADLs": {
    present: [{ words: ["declining personal hygiene / not washing", "soiled or inappropriate clothing", "not eating or drinking adequately", "not maintaining their environment", "declining to change clothes", "poor oral / foot care", "not seeking help when unwell"] }],
    prevent: [
      { label: MANAGE, words: ["prompt and support with personal care", "offer and support meals and fluids", "assist with laundry / clean clothing", "monitor food and fluid intake", "physical health check", "support room / environment cleaning"] },
      { label: REDUCE, words: ["personalised ADL support plan", "build routine with prompts", "OT / functional assessment", "address underlying mood or motivation", "regular hygiene and nutrition monitoring", "involve family / supports"] },
    ],
    evaluate: [{ words: ["improved self-care / hygiene", "eating and drinking adequately", "maintaining clothing and environment", "accepting or initiating care", "stable physical health"] }],
    next: [{ words: ["physical / medical review", "OT or dietitian referral", "MDT review", "capacity assessment if refusing essential care", "safeguarding if neglect-related risk"] }],
  },
  "diet and nutrition": {
    present: [{ words: ["declining meals and snacks", "restricting or skipping food", "minimal fluid intake / signs of dehydration", "weight loss", "hiding or disposing of food", "rules or rituals around eating", "avoiding the dining room", "low energy / physical signs of poor intake"] }],
    prevent: [
      { label: MANAGE, words: ["monitor and record food and fluid intake", "offer preferred foods and supplements", "supportive mealtime presence / supervision", "regular weights and physical observations", "dietitian and medical review", "offer fortified drinks / snacks", "manage refeeding risk as prescribed"] },
      { label: REDUCE, words: ["individualised nutrition / eating care plan", "dietitian-led plan and supplements", "post-meal support where needed", "address underlying cause (mood, psychosis, eating disorder)", "structured mealtimes and routine", "involve family / supports", "MEED / refeeding monitoring where indicated"] },
    ],
    evaluate: [{ words: ["improved oral intake", "stable or improving weight", "adequate hydration / bloods", "eating in the dining room", "less food avoidance or restriction", "stable physical observations"] }],
    next: [{ words: ["urgent medical review / bloods", "dietitian referral or review", "consider MEED guidance and physical risk", "MDT / risk strategy review", "capacity / MHA if refusing essential intake", "physical health escalation (NEWS2)"] }],
  },
  "falls": {
    present: [{ words: ["unsteady gait / poor balance", "recent falls or near-misses", "dizziness on standing", "weakness or reduced mobility", "confusion / disorientation", "rushing or not using aids", "sedation from medication", "getting up unaided at night"] }],
    prevent: [
      { label: MANAGE, words: ["complete a falls risk assessment", "call bell and aids within reach", "clear hazards / non-slip footwear", "assist with mobility and transfers", "physical / medical review", "review sedating medication", "post-fall checks and observations"] },
      { label: REDUCE, words: ["falls care plan with MDT input", "physiotherapy / mobility support", "medication review (sedation, postural BP)", "lying and standing BP", "adequate lighting and clear environment", "regular toileting / night-time support", "bed and chair at a safe height"] },
    ],
    evaluate: [{ words: ["no further falls", "improved steadiness / mobility", "using aids and call bell", "stable lying / standing BP", "reduced sedation"] }],
    next: [{ words: ["medical review post-fall", "physiotherapy / OT referral", "review medication", "MDT review", "enhanced support at night", "investigate cause (infection, postural BP)"] }],
  },
  "vulnerability / exploitation": {
    present: [{ words: ["easily led by others", "giving away money, items or food", "befriended by predatory peers", "isolation or mood change after contact", "unexplained loss of belongings", "difficulty saying no", "naive about others' intentions"] }],
    prevent: [
      { label: MANAGE, words: ["supervise peer interactions", "safeguard money and valuables", "separate from the exploiting peer", "1:1 support and reassurance", "remove access to the person exploiting them", "raise a safeguarding concern"] },
      { label: REDUCE, words: ["risk-aware care plan", "assertiveness / boundaries work", "supervised, structured social activity", "safeguard finances and property", "consistent protective staffing", "education about healthy relationships"] },
    ],
    evaluate: [{ words: ["no exploitation incidents", "retaining belongings and money", "setting boundaries with peers", "appropriate peer relationships", "voicing concerns to staff"] }],
    next: [{ words: ["safeguarding referral", "increase observation / supervision", "MDT / risk strategy review", "separate or transfer if needed", "police if a crime occurs"] }],
  },
  "sexual disinhibition": {
    present: [{ words: ["sexually inappropriate comments or gestures", "exposing / undressing in public areas", "intrusive approaches to peers or staff", "inappropriate touching", "misreading social cues", "fixation on a particular person", "disinhibition linked to mania or illness"] }],
    prevent: [
      { label: MANAGE, words: ["calm clear boundaries and redirection", "maintain personal space / protect others", "same-gender care where appropriate", "remove from the situation / offer privacy", "offer PRN if agitated", "document and Datix incidents"] },
      { label: REDUCE, words: ["address underlying cause (mania, dementia, illness)", "consistent boundary-setting across the team", "structured supervised activity", "protect vulnerable peers", "care plan covering dignity and others' safety", "medication review where illness-driven"] },
    ],
    evaluate: [{ words: ["fewer disinhibited incidents", "maintaining appropriate boundaries", "responding to redirection", "peers feeling safe", "stable mental state"] }],
    next: [{ words: ["psychiatric / medication review", "increase observation / supervision", "safeguarding referral if a peer is affected", "MDT / risk strategy review", "review environment / placement"] }],
  },
  "refusal to engage": {
    present: [{ words: ["declining to talk to staff", "staying in room / avoiding contact", "not attending reviews or activities", "monosyllabic or guarded responses", "refusing assessments or care", "turning away / non-verbal withdrawal"] }],
    prevent: [
      { label: MANAGE, words: ["gentle persistent low-key engagement", "offer choice of staff member / time", "short frequent contacts", "meet on their terms / in their space", "non-verbal presence and patience", "document attempts and any change"] },
      { label: REDUCE, words: ["build trust with a consistent named nurse", "activity-based engagement / shared interests", "reduce pressure and demands", "advance statement / preferences", "involve trusted family or advocate", "flexible approach to reviews"] },
    ],
    evaluate: [{ words: ["increasing contact with staff", "attending some activities or reviews", "accepting care or assessment", "initiating conversation", "improved rapport with named nurse"] }],
    next: [{ words: ["MDT review of the engagement plan", "consider advocacy / IMHA", "capacity assessment if refusing essential care", "psychiatric review", "review for unrecognised deterioration"] }],
  },
  "physical health deterioration": {
    present: [{ words: ["abnormal NEWS2 / observations", "drowsiness or reduced consciousness", "breathlessness or chest pain", "new confusion / delirium", "not eating, drinking or mobilising", "new pain or physical symptoms", "signs of infection (fever)"] }],
    prevent: [
      { label: MANAGE, words: ["full physical observations (NEWS2)", "escalate per NEWS2 / sepsis pathway", "urgent medical review", "ABCDE assessment", "monitor food and fluid intake", "ECG / bloods as indicated", "call 999 if critical"] },
      { label: REDUCE, words: ["regular physical health monitoring", "physical health care plan", "manage long-term conditions / medication", "encourage diet, fluids and mobility", "infection prevention measures", "GP / acute liaison as needed"] },
    ],
    evaluate: [{ words: ["observations within normal range", "improving symptoms", "eating, drinking and mobilising", "no signs of infection", "stable NEWS2"] }],
    next: [{ words: ["escalate per NEWS2 / sepsis protocol", "urgent medical review or 999", "transfer to acute care if needed", "MDT / duty doctor review", "increase observation level"] }],
  },
  "fire risk": {
    present: [{ words: ["requests for lighters / matches", "concealing igniters or flammables", "talk of setting fires", "previous fire-setting history", "hoarding flammable materials", "smoking in unauthorised areas", "fascination with fire"] }],
    prevent: [
      { label: MANAGE, words: ["remove lighters, matches and flammables", "search per policy", "supervise any sanctioned smoking", "alert the team and document", "increase observation level", "keep fire exits and alarms clear"] },
      { label: REDUCE, words: ["fire-risk care plan shared with the team", "remove access to ignition sources", "address underlying drivers", "supervised structured activity", "environmental fire-safety checks", "liaise with the fire-safety lead"] },
    ],
    evaluate: [{ words: ["no fire-setting behaviour", "not seeking ignition sources", "handing items over", "engaging with the safety plan", "stable presentation"] }],
    next: [{ words: ["increase observation level", "remove all ignition sources / search", "MDT / risk strategy review", "alert fire safety and security", "police / safeguarding if intent to harm", "review environment / placement"] }],
  },
  "hoarding": {
    present: [{ words: ["accumulating items in room / bed area", "reluctance to discard anything", "blocking access or exits with belongings", "food or rubbish stored in room", "distress when items are moved", "fire / infection risk from clutter"] }],
    prevent: [
      { label: MANAGE, words: ["agree limits collaboratively", "remove perishable / hazardous items with consent", "keep exits and walkways clear", "infection prevention checks", "support, not force, decluttering", "document and monitor"] },
      { label: REDUCE, words: ["hoarding care plan / graded approach", "OT and psychology input", "address underlying anxiety / meaning", "regular supportive room reviews", "fire and infection safety checks", "respectful collaborative approach"] },
    ],
    evaluate: [{ words: ["room safe and accessible", "exits clear", "accepting support to declutter", "less distress around items", "no fire or infection hazard"] }],
    next: [{ words: ["OT / psychology referral", "MDT review", "infection prevention / estates input", "fire-safety review", "capacity assessment if safety is at risk"] }],
  },
  "financial exploitation": {
    present: [{ words: ["giving money or PIN to others", "unexplained spending or withdrawals", "pressured for money by peers or contacts", "loss of bank cards or cash", "distress about money", "new 'friends' interested in finances"] }],
    prevent: [
      { label: MANAGE, words: ["safeguard cards, cash and valuables", "supervise / limit access to finances", "separate from the person exploiting them", "raise a safeguarding concern", "document concerns", "involve appointee / family where appropriate"] },
      { label: REDUCE, words: ["financial safeguarding care plan", "support with money management / appointee", "education on financial safety", "supervised peer interactions", "consistent protective staffing", "liaise with safeguarding / social care"] },
    ],
    evaluate: [{ words: ["no further financial loss", "finances secured", "setting boundaries about money", "voicing concerns to staff", "appropriate peer relationships"] }],
    next: [{ words: ["safeguarding referral", "involve social care / appointee", "MDT / risk strategy review", "police if a crime occurs", "review supervision level"] }],
  },
  "homelessness / housing instability": {
    present: [{ words: ["no fixed address or notice to quit", "anxiety about discharge / where to go", "rent arrears or tenancy at risk", "previous rough sleeping", "no support network", "reluctance to discharge due to housing"] }],
    prevent: [
      { label: MANAGE, words: ["early housing assessment", "refer to housing / Duty to Refer", "involve social worker and care coordinator", "document housing status", "do not discharge to the street", "liaise with the local authority"] },
      { label: REDUCE, words: ["discharge planning from admission", "housing and benefits support", "involve family / supports", "Duty to Refer (Homelessness Reduction Act)", "secure accommodation before discharge", "link to community / third-sector support"] },
    ],
    evaluate: [{ words: ["housing plan in place", "accommodation secured for discharge", "reduced anxiety about discharge", "engaging with housing support", "benefits / finances arranged"] }],
    next: [{ words: ["escalate to social work / housing team", "Duty to Refer if not already done", "MDT / discharge planning review", "delay discharge until housing is safe", "involve local authority / commissioners"] }],
  },
  "cognitive impairment / confusion": {
    present: [{ words: ["disorientation to time, place or person", "memory difficulties / repetitive questions", "wandering or getting lost on the ward", "fluctuating confusion (?delirium)", "difficulty following routines", "agitation when confused", "not recognising hazards"] }],
    prevent: [
      { label: MANAGE, words: ["reorientate calmly and regularly", "screen for and treat delirium causes", "physical observations and bloods", "clear signage and a visible clock / calendar", "supervise to prevent wandering / falls", "medical review"] },
      { label: REDUCE, words: ["consistent routine and environment", "cognitive screening and care plan", "manage reversible causes (infection, constipation, medication)", "familiar objects and orientation aids", "adequate hydration and nutrition", "involve family for reassurance"] },
    ],
    evaluate: [{ words: ["improved orientation", "less confusion / agitation", "delirium resolving", "safe on the ward", "following routine with support"] }],
    next: [{ words: ["medical review / delirium workup", "investigate reversible causes", "OT / memory assessment referral", "MDT review", "increase supervision if unsafe", "review environment / placement"] }],
  },
  "discharge risk": {
    present: [{ words: ["anxiety or distress about leaving", "symptoms increasing near discharge", "lack of community support in place", "reluctance to engage with the discharge plan", "previous early readmission", "no clear crisis plan"] }],
    prevent: [
      { label: MANAGE, words: ["review readiness for discharge with MDT", "ensure community follow-up is in place", "complete a crisis / safety plan", "involve care coordinator and family", "phased / supported discharge", "do not discharge without a plan"] },
      { label: REDUCE, words: ["discharge planning from admission", "CPA / follow-up within 72 hours", "relapse and crisis planning", "medication and appointments arranged", "involve community team and supports", "graded leave before discharge"] },
    ],
    evaluate: [{ words: ["discharge plan agreed and in place", "community follow-up confirmed", "crisis plan completed", "reduced anxiety about discharge", "using leave successfully"] }],
    next: [{ words: ["MDT / discharge planning review", "delay discharge if unsafe", "escalate to the community team", "ensure 72-hour follow-up", "review the crisis plan"] }],
  },
  "sleep disturbance": {
    present: [{ words: ["not sleeping / awake through the night", "disturbing peers at night", "daytime exhaustion", "more agitated when tired", "reversed sleep pattern", "early waking linked to low mood"] }],
    prevent: [
      { label: MANAGE, words: ["support sleep hygiene", "quiet low-stimulus environment at night", "warm drink / settling routine", "review and offer night-time PRN as prescribed", "limit daytime napping", "address worries before bed"] },
      { label: REDUCE, words: ["sleep-hygiene care plan", "consistent routine and daytime activity", "reduce caffeine and stimulation", "treat underlying cause (mania, anxiety, pain)", "medication review", "comfortable sleep environment"] },
    ],
    evaluate: [{ words: ["improved sleep duration / pattern", "settled at night", "less daytime fatigue", "reduced agitation", "not disturbing peers"] }],
    next: [{ words: ["medical / medication review", "MDT review", "investigate underlying cause", "review night-time observations"] }],
  },
  "infection / delirium": {
    present: [{ words: ["new or worsening confusion", "fever or abnormal observations", "reduced intake / lethargy", "urinary or respiratory symptoms", "fluctuating awareness", "agitation or drowsiness", "signs of sepsis"] }],
    prevent: [
      { label: MANAGE, words: ["full physical observations (NEWS2)", "screen for the source of infection", "urgent medical review", "bloods, cultures, urinalysis as indicated", "fluids and monitoring", "escalate per sepsis pathway", "infection prevention precautions"] },
      { label: REDUCE, words: ["infection prevention measures", "treat infection promptly as prescribed", "maintain hydration and nutrition", "delirium-aware care plan", "regular physical monitoring", "reorientation and consistent staff"] },
    ],
    evaluate: [{ words: ["observations normalising", "confusion resolving", "infection markers improving", "eating, drinking and mobilising", "stable NEWS2"] }],
    next: [{ words: ["escalate per NEWS2 / sepsis protocol", "urgent medical review or 999", "transfer to acute care if needed", "MDT / duty doctor review", "isolate / IPC measures if required"] }],
  },
  "risk to family": {
    present: [{ words: ["hostility or threats towards a family member", "fixation or blame towards family", "distress or escalation after family contact", "history of harm to family", "intent to harm a relative", "agitation around visits or leave"] }],
    prevent: [
      { label: MANAGE, words: ["risk-assess and review leave and visits", "supervised or restricted contact where needed", "safety planning with the family", "de-escalate around contact", "inform and involve safeguarding", "document and share risk"] },
      { label: REDUCE, words: ["care plan covering leave and visits", "address underlying drivers (psychosis, conflict)", "family work / mediated contact", "safeguarding (adults and children) input", "review leave collaboratively with the MDT", "support the family with a safety plan"] },
    ],
    evaluate: [{ words: ["no incidents towards family", "safe, settled contact / visits", "reduced hostility towards family", "using leave safely", "stable mental state"] }],
    next: [{ words: ["review and restrict leave / visits", "safeguarding referral (adults and children)", "MDT / risk strategy review", "police involvement if a crime occurs", "psychiatric / medication review"] }],
  },
  "weapon access": {
    present: [{ words: ["concealing sharp or makeshift weapons", "making or adapting items into weapons", "talk of using a weapon", "history of weapon use", "guarding a hidden item", "searching for items usable as weapons"] }],
    prevent: [
      { label: MANAGE, words: ["remove the item and any weapons", "complete a personal and environmental search", "increase observation level", "maintain safe distance and staffing", "de-escalate", "document and Datix", "police if a serious weapon / offence"] },
      { label: REDUCE, words: ["search and environmental safety checks", "remove access to potential weapons", "risk-aware care plan shared with the team", "address underlying intent / drivers", "structured supervised activity", "consistent staffing and boundaries"] },
    ],
    evaluate: [{ words: ["no weapons found or made", "handing items over", "no threats involving weapons", "engaging with the safety plan", "stable presentation"] }],
    next: [{ words: ["search and remove items", "increase observation level", "police involvement if indicated", "MDT / risk strategy review", "consider transfer / PICU", "safeguarding if others are at risk"] }],
  },
  "boundary violations": {
    present: [{ words: ["entering others' rooms or staff areas", "not respecting personal space", "over-familiarity with staff or peers", "ignoring ward rules", "intrusive or controlling behaviour", "testing or pushing limits"] }],
    prevent: [
      { label: MANAGE, words: ["clear consistent boundaries and redirection", "calmly explain expectations", "protect peers' space and privacy", "document patterns", "consistent team response", "offer alternative structured activity"] },
      { label: REDUCE, words: ["behavioural care plan with clear limits", "whole-team consistency", "reinforce appropriate behaviour positively", "address underlying cause (illness, attachment)", "meaningful occupation", "regular review of boundaries"] },
    ],
    evaluate: [{ words: ["respecting others' space and rules", "fewer boundary incidents", "responding to redirection", "appropriate interactions", "peers feeling safe and respected"] }],
    next: [{ words: ["MDT / behavioural review", "consistent team approach / care plan update", "psychology input", "review for underlying illness", "safeguarding if a peer is affected"] }],
  },
  "observations / refusal of obs": {
    present: [{ words: ["declining physical health observations", "resisting or avoiding enhanced obs", "hostility when observed", "hiding from observing staff", "refusing to be in line of sight", "distress about being watched"] }],
    prevent: [
      { label: MANAGE, words: ["explain the reason for observations", "least-restrictive, dignified approach", "offer a choice of observing staff", "minimum safe physical checks", "de-escalate and reassure", "document refusals and any change"] },
      { label: REDUCE, words: ["build trust and rapport around observations", "explain and involve the patient in the level", "review the least-restrictive option with the MDT", "consistent, respectful observing staff", "advance preferences where possible", "regular review of observation level"] },
    ],
    evaluate: [{ words: ["accepting observations", "allowing physical health checks", "less distress about being observed", "engaging with observing staff", "stable mental and physical state"] }],
    next: [{ words: ["MDT review of observation level", "medical review if refusing physical obs", "capacity assessment if refusing essential checks", "least-restrictive review", "psychiatric review"] }],
  },
};

// ---- Risk-specific chips for the FORMULATION (the WHY) ----------------------
// Same idea as RMP_RISK_CHIPS but for the formulation P-sections. Mike's ask:
// "do the same to the formulation tool so it too can be personalised." Each risk
// gets its own predisposing / precipitating / perpetuating / dynamic starting
// chips. The "presenting" section reuses RMP_RISK_CHIPS[risk].present (the
// observable signs ARE the presentation), so it is not repeated here. Sections
// not listed (pattern / protective / engagement / judgement) stay generic.
// Starting points only - the nurse still individualises with free text.
export type FormulationSectionId =
  | "predisposing" | "precipitating" | "perpetuating" | "dynamic";

export const FORMULATION_RISK_CHIPS: Record<string, Partial<Record<FormulationSectionId, RiskChipGroup[]>>> = {
  "self-harm": {
    predisposing: [{ words: ["history of self-harm from a young age", "previous suicide attempts", "childhood trauma or abuse", "diagnosis with emotionally unstable personality features", "previous admissions for self-harm", "history of adverse childhood experiences", "previous significant losses"] }],
    precipitating: [{ words: ["recent contact with abusive or distressing person", "relationship breakdown or loss", "anniversary of a traumatic event", "recent ward incident or conflict", "news from family or court", "increased hopelessness after a setback", "medication change affecting mood"] }],
    perpetuating: [{ words: ["persistent hopelessness and low mood", "ongoing access to potential means", "limited coping strategies", "continued social isolation", "unresolved trauma or grief", "poor distress tolerance", "active suicidal ideation alongside self-harm"] }],
    dynamic: [{ words: ["risk highest overnight", "escalates after phone calls or visits", "rises when unsupervised in room", "higher during low-activity periods", "linked to specific mood triggers", "more frequent in early morning", "rises with alcohol or substance use"] }],
  },
  "suicide": {
    predisposing: [{ words: ["previous suicide attempt(s)", "history of serious self-harm", "long-standing depression or hopelessness", "family history of suicide", "history of trauma or abuse", "diagnosis of a serious mental illness", "previous significant losses or bereavements"] }],
    precipitating: [{ words: ["recent bereavement or significant loss", "relationship breakdown", "legal proceedings or financial crisis", "anniversary of a previous attempt or loss", "recent deterioration in mental state", "discharge or change in care", "contact from an abusive relationship"] }],
    perpetuating: [{ words: ["persistent hopelessness - no future vision", "active suicidal ideation", "ongoing access to means", "social disconnection and isolation", "unresolved stressors", "withdrawal from support", "anhedonia and inability to experience pleasure"] }],
    dynamic: [{ words: ["higher overnight when thoughts intensify", "rises after phone calls or family visits", "peaks when alone and unsupervised", "linked to specific anniversaries", "higher on leave or away from the ward", "worsens with alcohol or substance use", "fluctuates with energy - lower energy may mask intent"] }],
  },
  "violence and aggression": {
    predisposing: [{ words: ["history of violence in the community", "previous assault convictions or cautions", "childhood exposure to violence", "history of trauma and adverse experiences", "previous PICU admissions for aggression", "pattern of anger dysregulation", "history of substance-related violence"] }],
    precipitating: [{ words: ["recent conflict with a peer or staff member", "perceived threat or provocation", "news from family or legal proceedings", "feeling unheard or disrespected", "change in medication or care", "high arousal psychotic state", "intoxication or substance use on the ward"] }],
    perpetuating: [{ words: ["active paranoia or persecutory beliefs", "poor frustration tolerance", "ongoing interpersonal conflict", "high-stimulation environment", "medication not yet therapeutic", "unresolved anger or grievance", "limited de-escalation insight"] }],
    dynamic: [{ words: ["higher in shared or busy communal spaces", "rises when specific peers are present", "escalates around mealtimes or shifts", "higher when feeling confined or restricted", "worsens with intoxication or withdrawal", "linked to specific staff interactions", "more volatile in the evenings"] }],
  },
  "risk to others": {
    predisposing: [{ words: ["history of harming or threatening others", "previous index offence involving harm to others", "history of predatory or targeting behaviour", "deep-seated grievance towards an individual", "diagnosis associated with persecutory ideation", "childhood exposure to domestic violence", "history of coercive or controlling relationships"] }],
    precipitating: [{ words: ["perceived threat or harm from a specific person", "active persecutory beliefs about that person", "recent contact with or about the person at risk", "breakdown of relationship with a family member", "custody or legal proceedings", "discharge planning putting them near the intended person", "recent triggering event linked to the person"] }],
    perpetuating: [{ words: ["fixed persecutory beliefs about the person", "ongoing access to the potential victim", "active psychosis not yet responding to treatment", "unresolved grievance or intent", "poor insight into the risk they pose", "limited protective factors around the intended person", "social isolation removing moderating influences"] }],
    dynamic: [{ words: ["risk highest around contact or visits", "rises when discussing the person", "elevated on planned or unplanned leave", "higher when arousal is elevated", "linked to specific triggering communications", "fluctuates with psychotic symptom severity", "higher when staff observe or restrict contact"] }],
  },
  "AWOL / absconsion": {
    predisposing: [{ words: ["previous absconsion episodes", "history of non-engagement with services", "repeated informal admissions and self-discharge", "distrust of inpatient settings", "history of rough sleeping or instability", "diagnosis associated with poor insight", "prior AWOL from secure or inpatient settings"] }],
    precipitating: [{ words: ["wanting to check on home, family or finances", "belief that admission is unnecessary", "wanting to use substances", "fear of the ward environment or specific people", "upcoming review or unwanted legal decision", "recent bad news from outside", "feeling trapped or controlled"] }],
    perpetuating: [{ words: ["poor insight into reasons for admission", "ongoing pull to leave for substances or relationships", "high anxiety or distress in the ward environment", "limited trust in or rapport with staff", "unresolved external responsibilities or worries", "continued wish to leave and ambivalence about treatment", "peer pressure from outside contacts"] }],
    dynamic: [{ words: ["higher around shift changes when doors are used", "rises when certain peers or visitors arrive", "higher after upsetting phone calls or visits", "more likely late evenings and nights", "rises after confrontation with staff or peers", "linked to leave refusals or restrictions", "higher when activity level is low"] }],
  },
  "medication non-concordance": {
    predisposing: [{ words: ["long history of refusing or stopping medication", "previous relapses directly linked to stopping", "strong personal or cultural beliefs about medication", "history of significant side effects", "diagnosis associated with poor insight (e.g. bipolar mania)", "previous covert or forced medication under MHA", "family history of refusing psychiatric treatment"] }],
    precipitating: [{ words: ["new or changed medication causing side effects", "recent deterioration causing distrust of treatment", "change in prescriber or care team", "peer or family influence against medication", "feeling better and believing medication no longer needed", "discharge planning activating fears about compliance", "conflict with the team about treatment decisions"] }],
    perpetuating: [{ words: ["ongoing side effects not yet addressed", "limited insight into the link between medication and wellbeing", "continued ambivalence about diagnosis", "mistrust of the medical team", "no clear experience of the benefit of treatment", "external voices (family or peers) discouraging medication", "absence of a shared decision-making plan"] }],
    dynamic: [{ words: ["refusal linked to specific staff or shifts", "more concordant with trusted named nurse", "resistance at depot clinic time", "higher when psychosis is most active", "variable depending on how information is given", "linked to specific side effect times (morning sedation, etc.)", "rises when discharge or leave feels uncertain"] }],
  },
  "substance misuse": {
    predisposing: [{ words: ["long history of alcohol or drug dependence", "co-occurring mental illness and substance use (dual diagnosis)", "childhood trauma linked to substance coping", "previous treatment episodes for addiction", "family history of substance dependence", "history of withdrawal complications", "previous substance-related criminal justice involvement"] }],
    precipitating: [{ words: ["admission stress reducing at the point of leave", "contact with using peers inside or outside the ward", "supply available via visitors or leave", "craving and withdrawal symptoms", "bad news or heightened anxiety", "boredom and low structured activity", "discharge anxiety causing relapse risk"] }],
    perpetuating: [{ words: ["physical dependence and withdrawal", "ongoing craving and poor relapse insight", "continued contact with supply networks", "untreated underlying distress driving use", "no substitute or prescribed management in place", "peers on the ward using or supplying", "poor engagement with substance-misuse services"] }],
    dynamic: [{ words: ["higher risk on unescorted leave", "risk rises during visitor contact", "evening and overnight when observation is lower", "linked to contact with specific peers or contacts", "higher at weekends when activity is lower", "worsens with concurrent low mood", "risk fluctuates with prescribed withdrawal management"] }],
  },
  "paranoia / persecutory beliefs": {
    predisposing: [{ words: ["diagnosis of schizophrenia or schizoaffective disorder", "long history of persecutory ideation", "previous traumatic experiences confirming mistrust", "history of poor response to antipsychotic treatment", "childhood trauma involving betrayal or abuse", "previous admissions driven by paranoid presentation", "family history of psychotic illness"] }],
    precipitating: [{ words: ["recent psychotic relapse or deterioration", "reduction or cessation of antipsychotic medication", "recent perceived threat or adverse event", "admission to an unfamiliar environment", "change in care team or ward", "heightened arousal from stress or substance use", "contact with a specific distrusted person"] }],
    perpetuating: [{ words: ["medication not yet therapeutic", "ongoing confirmation bias reinforcing beliefs", "social withdrawal limiting reality testing", "limited insight into paranoid nature of experiences", "high-stimulation environment worsening arousal", "continued mistrust preventing engagement", "persecutory beliefs deeply fixed and longstanding"] }],
    dynamic: [{ words: ["worse in busy communal areas", "higher around unfamiliar staff or night shifts", "rises with fatigue or sleep deprivation", "worsens with substance use", "fluctuates with antipsychotic plasma levels", "escalates when discussing beliefs directly", "higher in early morning and late evening"] }],
  },
  "mania / impulsivity": {
    predisposing: [{ words: ["diagnosis of bipolar affective disorder", "previous manic episodes requiring admission", "history of impulsive self-harm or risk-taking", "family history of bipolar disorder", "previous medication non-concordance triggering relapse", "history of financial or relationship harm during mania", "comorbid ADHD or personality features with impulsivity"] }],
    precipitating: [{ words: ["recent sleep deprivation triggering episode", "stopping or reducing mood stabiliser", "recent highly stimulating event or social context", "illicit stimulant use", "significant life change (new relationship, plans, stress)", "anniversary of a previous episode", "seasonal change in a seasonal pattern"] }],
    perpetuating: [{ words: ["ongoing reduced sleep maintaining elevated mood", "medication not yet stabilising presentation", "high-stimulation environment feeding energy", "continued grandiose beliefs driving behaviour", "limited insight that an episode is occurring", "social reinforcement of manic behaviour from peers", "financial or relationship consequences building"] }],
    dynamic: [{ words: ["worse overnight when ward is quieter", "escalates in stimulating communal spaces", "rises with caffeine or substance use", "linked to specific disinhibiting peers", "higher during activities involving risk or spending", "variable across the day (often worse evenings)", "linked to sleep duration the previous night"] }],
  },
  "self-neglect / ADLs": {
    predisposing: [{ words: ["longstanding pattern of self-neglect linked to diagnosis", "history of neglecting self during previous episodes", "chronic depression with persistent amotivation", "diagnosis associated with negative symptoms (schizophrenia)", "history of trauma impairing self-care", "previous safeguarding involvement for self-neglect", "learning disability affecting ADL independence"] }],
    precipitating: [{ words: ["acute deterioration in mental state reducing motivation", "significant depressive episode", "severe psychotic episode with withdrawal", "bereavement or acute loss", "current medication side effects (sedation, cognitive blunting)", "crisis precipitating complete shutdown", "recent discharge from care without adequate support"] }],
    perpetuating: [{ words: ["persistent low mood and amotivation", "negative symptoms of psychosis", "limited insight into the need for personal care", "absence of external prompts or support", "shame or embarrassment worsening avoidance", "inadequate physical health management", "no meaningful daily structure or occupation"] }],
    dynamic: [{ words: ["worse during low-activity periods", "declines after poor sleep or high distress nights", "more likely to accept support from specific trusted staff", "linked to time of day - often worse in the morning", "improves slightly with structured routine", "worse when depression is most severe", "varies with overall engagement with care"] }],
  },
  "diet and nutrition": {
    predisposing: [{ words: ["history of an eating disorder", "previous admissions for low weight or poor intake", "longstanding restrictive eating patterns", "diagnosis associated with refusal to eat (psychosis, depression)", "history of refeeding syndrome", "previous NG feeding or MEED", "trauma linked to eating or food"] }],
    precipitating: [{ words: ["acute deterioration in mental state reducing appetite", "paranoid beliefs about food being poisoned or contaminated", "severe depression with anhedonia and loss of appetite", "refusal linked to religious or cultural beliefs in crisis", "adverse reaction to a new medication", "ward dining environment causing significant distress", "acute bereavement removing motivation to eat"] }],
    perpetuating: [{ words: ["fixed delusional beliefs about food", "ongoing severe depression", "entrenched restrictive eating patterns", "physical consequences (low weight, weakness) reducing motivation", "food rituals or rules maintained even on the ward", "social anxiety around mealtimes preventing attendance", "poor engagement with dietitian or medical review"] }],
    dynamic: [{ words: ["intake worse at evening meals", "avoidance linked to specific foods or presentation", "better with one-to-one support at mealtimes", "worse when distress is high", "linked to specific mealtimes or days (visiting family)", "varies with psychotic symptom severity", "intake declines at weekends when routine changes"] }],
  },
  "falls": {
    predisposing: [{ words: ["age-related frailty and reduced balance", "previous falls with or without injury", "poor mobility or neurological condition", "polypharmacy including sedating medication", "chronic postural hypotension", "poor eyesight or hearing", "history of vitamin D deficiency or osteoporosis"] }],
    precipitating: [{ words: ["new or increased sedating medication", "acute infection or delirium", "postural hypotension from antipsychotics", "unfamiliar ward environment", "rushing to the toilet at night", "new footwear or loss of walking aid", "recent period of reduced mobility"] }],
    perpetuating: [{ words: ["ongoing sedation from current medication", "poor mobility not yet rehabilitated", "continued environmental hazards", "reluctance to use mobility aids", "inadequate hydration worsening postural drop", "no consistent falls care plan in place", "lack of physiotherapy input"] }],
    dynamic: [{ words: ["highest risk overnight and in early morning", "risk rises on standing from bed or chair", "higher in unfamiliar or poorly lit areas", "worse after PRN sedating medication", "risk rises during intercurrent illness", "higher when patient is confused or distressed", "lower when supported by a member of staff"] }],
  },
  "vulnerability / exploitation": {
    predisposing: [{ words: ["history of exploitation (financial, emotional or sexual)", "learning disability affecting judgement", "diagnosis with features of dependency or poor boundaries", "history of abusive relationships", "previous safeguarding concerns for exploitation", "childhood history of abuse or poor attachment", "chronic low self-esteem and difficulty refusing others"] }],
    precipitating: [{ words: ["contact from a known exploitative person", "new friendship with a peer showing predatory behaviour", "housing or financial crisis increasing dependence", "discharge approaching and fear of being alone", "recent bereavement or loss leaving them isolated", "active mental illness reducing critical judgement", "social media contact from an unknown or suspicious person"] }],
    perpetuating: [{ words: ["ongoing contact with the exploiting person", "low self-esteem maintaining compliance", "limited support network or social isolation", "active illness reducing protective insight", "no financial safeguard in place", "poor assertiveness and difficulty setting limits", "emotional dependence on the exploiting relationship"] }],
    dynamic: [{ words: ["higher risk on leave or off the ward", "rises with contact from specific people or contacts", "worse when mental state is most unwell", "higher when finances are accessible", "risk increases around discharge", "worse when staff oversight is lower (evenings)", "varies with whether they feel lonely or cared for"] }],
  },
  "sexual disinhibition": {
    predisposing: [{ words: ["previous admissions with sexual disinhibition", "history of sexually inappropriate behaviour in the community", "diagnosis with disinhibition as a feature (mania, dementia, frontal lobe)", "history of sexual abuse or exploitation", "previous safeguarding concerns relating to sexuality", "learning disability affecting sexual boundaries", "traumatic brain injury or neurological condition"] }],
    precipitating: [{ words: ["acute manic episode with disinhibition", "new or increasing antipsychotic reducing inhibition", "substance use on or off the ward", "presence of a specific peer or person", "arousal linked to psychotic content", "recent exposure to sexual content or contact", "change in mental state causing reduced insight"] }],
    perpetuating: [{ words: ["active manic or hypomanic episode", "medication not yet controlling disinhibition", "underlying neurological or dementia-related cause", "limited insight into the impact on others", "reinforcement from peer reactions", "continued access to the environment or person triggering behaviour", "limited structured alternative activity"] }],
    dynamic: [{ words: ["higher in shared communal areas", "rises when specific peers are present", "worse in evenings when observation may be lower", "linked to heightened mood or reduced sleep", "worsens with substance use", "higher in unstructured time", "improves when distracted by purposeful activity"] }],
  },
  "refusal to engage": {
    predisposing: [{ words: ["longstanding mistrust of mental health services", "history of traumatic admissions or coercion", "previous negative experiences with specific staff or settings", "diagnosis associated with withdrawal (depression, negative symptoms)", "history of disengagement from community services", "relational trauma impairing trust", "previous covert or involuntary treatment"] }],
    precipitating: [{ words: ["recent confrontation with staff or peers", "loss of trust following a perceived breach", "acute deterioration increasing withdrawal", "change in key worker or care team", "feeling unheard or dismissed in a review", "bad news or distressing communication", "legal or MHA dispute reducing co-operation"] }],
    perpetuating: [{ words: ["deep mistrust of staff or the system", "persistent depression and amotivation", "ongoing isolation in their room", "no perceived benefit from engaging", "shame or embarrassment reinforcing avoidance", "no therapeutic relationship established yet", "hopelessness about the value of treatment"] }],
    dynamic: [{ words: ["more engaged with specific trusted staff", "better at certain times of day (morning vs evening)", "more responsive with a choice of how to engage", "worse after distressing events or difficult conversations", "rises when they feel under observation or pressure", "lower when mental state is most unwell", "better with activity-based rather than verbal engagement"] }],
  },
  "physical health deterioration": {
    predisposing: [{ words: ["pre-existing long-term condition (diabetes, COPD, epilepsy, etc.)", "history of metabolic syndrome or cardiovascular risk", "antipsychotic-related physical health effects", "previous hospital admissions for physical illness", "limited physical health monitoring in the community", "smoking and sedentary lifestyle increasing risk", "history of ignoring physical symptoms"] }],
    precipitating: [{ words: ["acute infection or illness", "medication change causing physical side effects", "recent period of poor diet and fluid intake", "acute withdrawal from substance", "omitted or changed regular physical health medication", "new physical symptoms being minimised or overlooked", "increased mental health acuity diverting attention from physical health"] }],
    perpetuating: [{ words: ["ongoing refusal of physical observations", "untreated or under-treated long-term condition", "poor diet and fluid intake", "sedentary lifestyle and reduced mobility", "continued smoking", "delayed recognition of deterioration", "limited engagement with physical health care plan"] }],
    dynamic: [{ words: ["deterioration may be masked by mental health presentation", "physical signs more apparent at specific obs times", "risk higher when mental state prevents self-reporting", "worse during high-acuity periods on the ward", "physical health review gaps at weekends and nights", "delirium risk rises with dehydration and infection", "linked to time since last full physical check"] }],
  },
  "fire risk": {
    predisposing: [{ words: ["history of fire-setting", "previous conviction or caution for arson", "diagnosis associated with impulsivity or command hallucinations", "history of fire-setting in the context of psychosis", "previous fire-related incidents on the ward", "fascination with fire from an early age", "history of smoking-related fire incidents"] }],
    precipitating: [{ words: ["acute psychotic episode with command hallucinations", "current agitation and impulsivity", "access to an ignition source on the ward", "deliberate sourcing of lighters or flammables", "expressed intent to start a fire", "recent escalation in other risk behaviours", "anger or retaliation motivation after a conflict"] }],
    perpetuating: [{ words: ["continued psychosis driving intent or command experiences", "ongoing impulsivity without adequate medication management", "access to smoking materials", "limited insight into the danger of fire-setting", "continued motivation (retaliation, delusional belief)", "inadequate environmental safety checks", "history so entrenched it is seen as identity"] }],
    dynamic: [{ words: ["higher when acutely psychotic", "risk rises with access to ignition sources", "linked to specific triggers (conflict, command hallucinations)", "higher in unsupervised areas", "worse overnight when environmental checks are less frequent", "rises following incidents or confrontations", "linked to substance use disinhibiting impulse control"] }],
  },
  "hoarding": {
    predisposing: [{ words: ["long history of hoarding behaviour in the community", "diagnosis with compulsive features or OCD", "previous safeguarding involvement due to hoarding at home", "significant trauma or loss linked to attachment to objects", "poverty or deprivation history driving scarcity-based collecting", "previous admissions with hoarding identified", "cognitive impairment impairing decision-making about possessions"] }],
    precipitating: [{ words: ["acute anxiety on admission driving control through collecting", "distress about possessions at home during admission", "perceived threat of losing belongings", "change in ward or room triggering hoarding response", "previous items removed without consent", "increased anxiety related to any cause", "obsessional thoughts about needing items"] }],
    perpetuating: [{ words: ["anxiety and distress when items are removed", "compulsive need to acquire regardless of utility", "limited insight into safety risks posed by hoarding", "no agreed plan with the patient for managing this", "cognitive rigidity maintaining the behaviour", "staff reluctance to intervene due to distress caused", "accumulation normalised over time on the ward"] }],
    dynamic: [{ words: ["worse in the evenings when anxiety is higher", "accumulation increases around ward transitions", "distress peaks when staff attempt to remove items", "linked to overall anxiety level day to day", "better when distracted by structured activity", "worse when isolated and spending time in the room", "linked to contact with concerns about home"] }],
  },
  "financial exploitation": {
    predisposing: [{ words: ["history of financial exploitation by others", "learning disability or cognitive impairment affecting financial judgement", "long history of giving money away under pressure", "history of coercive relationships involving financial control", "previous appointee or deputyship for finances", "previous safeguarding concerns for financial abuse", "trusting personality easily led by others"] }],
    precipitating: [{ words: ["contact from a known exploiting person", "access to bank account or cash on leave", "new friendship with a person showing interest in their money", "discharge approaching with financial vulnerability", "significant payment (benefits, backdated money) received", "peer pressure on the ward to share money or items", "reduced mental capacity in the current episode"] }],
    perpetuating: [{ words: ["continued access to the exploiting person", "finances not yet secured or an appointee not in place", "ongoing cognitive impairment or reduced capacity", "shame preventing disclosure to staff", "emotional dependence on the person exploiting them", "limited assertiveness or ability to refuse requests", "no financial safeguard or support structure"] }],
    dynamic: [{ words: ["risk highest on leave when finances are accessible", "rises around benefit payment days", "linked to contact with specific people", "higher when mental state reduces capacity and judgement", "worse in evenings when staff oversight is lower", "risk spikes around discharge", "lower when finances are held safely by the ward"] }],
  },
  "homelessness / housing instability": {
    predisposing: [{ words: ["history of rough sleeping or homelessness", "previous tenancy failures linked to mental health", "history of eviction due to rent arrears or behaviour", "no fixed support network in the community", "history of sofa-surfing and unstable living arrangements", "previous releases from prison to no fixed abode", "long-term exclusion from social housing"] }],
    precipitating: [{ words: ["notice to quit received during this admission", "tenancy at risk due to rent arrears", "relationship breakdown removing housing", "discharge approaching with no housing plan", "hostel or temporary accommodation ended", "loss of income or benefits during admission", "recent fire or flood making home uninhabitable"] }],
    perpetuating: [{ words: ["no housing application yet made", "limited engagement with housing referrals", "insufficient community support to sustain accommodation", "ongoing mental health preventing independent living", "substance use complicating housing eligibility", "no income or benefits in place", "limited capacity to manage tenancy responsibilities"] }],
    dynamic: [{ words: ["risk crystallises as discharge approaches", "anxiety about housing rises around discharge planning meetings", "higher risk when community contacts are unavailable", "linked to time remaining on ward", "benefits issues are time-sensitive and worsen quickly", "varies with how actively housing is being pursued", "risk spikes if accommodation falls through at short notice"] }],
  },
  "cognitive impairment / confusion": {
    predisposing: [{ words: ["diagnosis of dementia or organic cognitive impairment", "acquired brain injury or neurological condition", "long-term history of heavy alcohol use (Korsakoff risk)", "learning disability", "previous episodes of delirium requiring admission", "age-related cognitive decline", "previous cognitive assessment showing impairment"] }],
    precipitating: [{ words: ["acute infection triggering delirium", "new or changed medication affecting cognition", "urinary tract or chest infection", "pain not yet recognised or treated", "recent surgery or acute physical illness", "dehydration and poor fluid intake", "unfamiliar ward environment and disrupted routine"] }],
    perpetuating: [{ words: ["untreated or ongoing infection", "dehydration and poor nutrition not yet resolved", "continued sedating or anticholinergic medication", "environmental disorientation without aids", "no consistent routine or familiar cues", "absence of family reassurance", "underlying dementia as the baseline"] }],
    dynamic: [{ words: ["confusion typically worse at night (sundowning)", "fluctuates with hydration and infection status", "better with consistent familiar staff", "worse in busy or noisy environments", "linked to sleep quality the previous night", "improves with reorientation and calm approach", "varies with time of day - often clearer in mornings"] }],
  },
  "discharge risk": {
    predisposing: [{ words: ["history of early readmission after discharge", "history of decompensation in the community without support", "previous discharge against medical advice", "limited insight into their illness and need for support", "no established community team or care coordinator", "previous discharges with inadequate aftercare planning", "history of disengaging from all services post-discharge"] }],
    precipitating: [{ words: ["discharge date announced without adequate preparation", "community support not yet confirmed", "crisis plan not yet completed", "anxiety or distress about leaving", "deterioration in mental state near discharge", "accommodation not confirmed", "loss of an expected support (carer, family, community team)"] }],
    perpetuating: [{ words: ["community team not yet adequately engaged", "ongoing instability in mental state", "no crisis plan or safety net in place", "patient's ambivalence about discharge", "unresolved housing or financial situation", "limited family or social support to bridge to community", "previous failed discharges reducing confidence in the plan"] }],
    dynamic: [{ words: ["risk rises as discharge date approaches", "anxiety escalates in the days before leaving", "worse if community follow-up date is far away", "linked to level of confidence in the community plan", "higher if discharge process feels rushed or imposed", "risk spikes if any element of the plan falls through", "varies with patient's engagement with the discharge process"] }],
  },
  "sleep disturbance": {
    predisposing: [{ words: ["longstanding sleep disorder predating the current admission", "history of trauma causing hyperarousal and poor sleep", "diagnosis of bipolar disorder with sleep as an early relapse marker", "history of medication side effects disrupting sleep", "chronic pain affecting sleep quality", "previous admissions with severely reversed sleep pattern", "substance dependence previously masking poor sleep"] }],
    precipitating: [{ words: ["acute manic or hypomanic episode", "heightened anxiety or rumination at night", "ward environment with noise and light disruption", "recent change in medication", "pain or physical discomfort", "recent distressing event or bad news", "withdrawal from sedating substance"] }],
    perpetuating: [{ words: ["ongoing mania or elevated mood", "anxiety and rumination at bedtime", "reversal of sleep-wake cycle once established", "daytime napping compensating for lost night sleep", "caffeine use in the afternoon or evening", "noisy or poorly regulated ward environment at night", "no consistent sleep hygiene plan in place"] }],
    dynamic: [{ words: ["worst in the early hours after midnight", "improves with consistent daytime activity and routine", "better on nights with PRN prescribed and accepted", "linked to daytime mood and arousal", "varies with ward noise and ambient light", "worsens during high-distress periods", "improves slightly with reduced caffeine"] }],
  },
  "infection / delirium": {
    predisposing: [{ words: ["advanced age and associated vulnerability", "known immunosuppression or chronic illness", "history of recurrent UTIs or chest infections", "previous delirium on the ward or in acute hospital", "poor baseline nutrition and hydration", "long-term antipsychotic use and metabolic effects", "indwelling catheter or other infection risk factor"] }],
    precipitating: [{ words: ["new symptoms of infection (dysuria, cough, fever)", "recent invasive procedure or wound", "prolonged period of poor fluid intake", "post-operative state", "new medication causing immunosuppression", "prolonged immobility", "contact with an infectious source or outbreak"] }],
    perpetuating: [{ words: ["infection not yet treated or responding to treatment", "ongoing poor fluid intake and dehydration", "delirium maintaining poor intake and mobility", "failure to identify the source of infection", "medication effects complicating management", "missed or delayed antibiotic doses", "environmental factors (heat, dehydration) not addressed"] }],
    dynamic: [{ words: ["confusion typically worse at night", "fluctuates with fluid balance and observations", "delirium can obscure mental health presentation", "rises rapidly with rising NEWS2 score", "better when treated early and hydration improves", "worsens with any additional stressor (pain, noise, disturbance)", "can deteriorate very quickly in frail patients"] }],
  },
  "risk to family": {
    predisposing: [{ words: ["history of violence towards a family member", "previous domestic abuse incidents", "long history of conflict with a specific relative", "previous child protection concerns in the family", "unresolved trauma linked to the family relationship", "previous restraining order or non-molestation order", "history of threatening or harassing communications to family"] }],
    precipitating: [{ words: ["distressing contact or news from family", "perceived betrayal or abandonment by family", "family involved in legal or financial dispute", "planned leave or home visit increasing proximity", "paranoid beliefs now directed at a family member", "anniversary of a family conflict or incident", "family member expressing intent to withdraw support"] }],
    perpetuating: [{ words: ["fixed grievance or belief about a family member", "ongoing contact maintaining distress or provocation", "limited insight into the risk to the family", "command hallucinations directing harm towards family", "unresolved anger not addressed in treatment", "family not aware of the level of risk", "limited family safety plan in place"] }],
    dynamic: [{ words: ["risk highest around leave, home visits or family contact", "rises when discussing specific family member", "worsens when psychosis is most active", "higher after phone calls or messages from family", "lower when staff mediate or supervise contact", "varies with overall arousal and distress level", "risk spikes if family contact is perceived as hostile"] }],
  },
  "weapon access": {
    predisposing: [{ words: ["history of carrying or using a weapon", "previous weapon-related conviction", "history of weapon use linked to psychosis", "peer group or gang association involving weapons", "previous admission with weapons concealed on the ward", "history of making improvised weapons", "previous threats made with weapons"] }],
    precipitating: [{ words: ["active persecutory beliefs driving need for protection", "current conflict with a specific peer or person", "command hallucinations directing weapon acquisition", "escalating threat or provocation from others", "return from leave with concealed items", "increased agitation and expressed intent to harm", "anger following a specific incident or dispute"] }],
    perpetuating: [{ words: ["ongoing persecutory beliefs driving the need for defence", "active conflict not resolved", "medication not yet therapeutic", "limited environmental safety checks on the ward", "concealment behaviour making detection difficult", "continued access to the environment or person perceived as threatening", "insufficient observation level to detect concealment"] }],
    dynamic: [{ words: ["risk highest when paranoia is most acute", "rises after specific incidents or confrontations", "linked to return from leave (bringing items in)", "worsens overnight when searches are less frequent", "varies with current conflict on the ward", "higher when feeling threatened or unsafe", "rises with medication non-concordance and psychotic relapse"] }],
  },
  "boundary violations": {
    predisposing: [{ words: ["history of boundary-violating behaviour on previous admissions", "diagnosis with features of disinhibition or poor social cognition", "history of over-familiarity and boundary issues in the community", "adverse childhood experiences affecting understanding of appropriate relationships", "learning disability affecting social-rule learning", "history of inappropriate relationships with professionals", "previous safeguarding concerns related to boundary violations"] }],
    precipitating: [{ words: ["acute manic or hypomanic episode with disinhibition", "active psychosis reducing social awareness", "new admission to an unfamiliar environment with unclear norms", "change in ward or staff group", "misinterpretation of staff warmth as personal relationship", "high anxiety driving need for contact and reassurance", "peer behaviour on the ward normalising rule-testing"] }],
    perpetuating: [{ words: ["active disinhibiting illness not yet managed", "inconsistent staff responses enabling boundary-testing", "limited insight into the impact on others", "underlying attachment difficulties driving behaviour", "no clear care plan addressing boundaries", "ongoing grandiosity or elevated mood", "reinforcement from peer or staff reactions"] }],
    dynamic: [{ words: ["higher in busy communal areas with peers", "worse in evenings when structure reduces", "rises when specific staff are on shift", "linked to mood state - worse when elevated", "worsens with substance use or medication non-concordance", "better with consistent and clear team responses", "varies with level of meaningful activity on the ward"] }],
  },
  "observations / refusal of obs": {
    predisposing: [{ words: ["history of refusing or actively avoiding observations", "previous trauma linked to surveillance or monitoring", "longstanding mistrust of mental health staff", "previous experience of coercive observation", "diagnosis associated with paranoia about being watched", "history of boundary issues around privacy", "previous admissions ending in observation-related incidents"] }],
    precipitating: [{ words: ["increase in observation level perceived as punitive", "acute paranoia that observation is a threat", "distress or anger following a specific incident or boundary", "change in observation level not explained or agreed", "unfamiliar staff carrying out observations", "refusal linked to wider disengagement from care", "religious or cultural concerns about observation"] }],
    perpetuating: [{ words: ["ongoing paranoia about the purpose of observation", "mistrust of staff not resolved", "no agreed approach or explanation given", "observation level not reviewed to the least restrictive option", "distress being maintained by the manner of observation", "no advance preference or agreement documented", "observation reinforcing a power imbalance in the relationship"] }],
    dynamic: [{ words: ["refusal higher at night when privacy feels most important", "more resistant with unfamiliar or less trusted staff", "worse when paranoia is at its highest", "linked to recent incidents or feeling controlled", "better when the same trusted staff do observations", "improves when the reason and review plan are clearly explained", "varies with overall therapeutic relationship quality"] }],
  },
};

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
