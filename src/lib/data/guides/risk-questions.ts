// The questions the risk tool asks for each domain, and how each answer routes.
//
// ⚠ THESE ARE WARDHUB'S QUESTIONS, NOT THE TRUST FORM'S. The SystmOne risk screen
// asks only a/b/c per domain (indicators Yes/No, current narrative, historical
// narrative) plus questions 8 and 9 at the end. Everything here is written for
// wardHub to build a formulation and a management plan out of one pass, and needs
// clinical sign-off in its own right - do not present it as form wording.
//
// Each question maps to ONE output section so the answer flows straight into the
// Formulation (doc "f") or the Management Plan (doc "r"). `chip` says where its
// suggestion words come from: "generic" = the section's own chips, "f"/"r" = that
// risk's tailored bank. No section's chips appear under more than one question.

export interface UnifiedQuestion {
  id: string;
  question: string;
  hint: string;
  gap?: string;
  examples?: boolean;
  // `group` narrows the chips to one labelled group of the section, so the two
  // halves of HOW TO PREVENT / REDUCE each show only their own words.
  chip: { doc: "generic" | "f" | "r"; id: string; group?: string };
  // `part` lets two questions feed one output section without overwriting each
  // other - used for the manage / prevent split.
  writes: { doc: "f" | "r"; id: string; part?: "manage" | "reduce" };
}

// The two group labels inside HOW TO PREVENT / REDUCE. Must match risk.ts.
export const MANAGE_GROUP = "When it happens (manage)";
export const REDUCE_GROUP = "Prevent / reduce";

// The generic run, used where a domain has nothing more specific to say.
export const UNIFIED_QUESTIONS: UnifiedQuestion[] = [
  { id: "q_seen", question: "What is the risk, and what have you seen or heard recently?", hint: "The events that bring this risk to attention now.", gap: "What has happened recently?", chip: { doc: "generic", id: "presenting" }, writes: { doc: "f", id: "presenting" } },
  { id: "q_signs", question: "What are the early warning signs it is building or happening?", hint: "The specific, observable signs to watch for in THIS patient.", gap: "What are the early warning signs?", examples: true, chip: { doc: "r", id: "present" }, writes: { doc: "r", id: "present" } },
  { id: "q_history", question: "What in their history makes this more likely?", hint: "Longer-term background - trauma, diagnosis, past attempts, admissions.", gap: "What raises the baseline risk?", chip: { doc: "f", id: "predisposing" }, writes: { doc: "f", id: "predisposing" } },
  { id: "q_trigger", question: "What has happened recently to trigger it?", hint: "Recent events or stressors that set it off.", gap: "What triggers the risk?", chip: { doc: "f", id: "precipitating" }, writes: { doc: "f", id: "precipitating" } },
  { id: "q_keeps", question: "What is keeping it going?", hint: "What sustains the risk once it has started.", gap: "What keeps it going?", chip: { doc: "f", id: "perpetuating" }, writes: { doc: "f", id: "perpetuating" } },
  { id: "q_pattern", question: "Is it escalating, repeating, or new?", hint: "How it has changed over days, weeks or admissions.", gap: "What is the pattern over time?", chip: { doc: "f", id: "pattern" }, writes: { doc: "f", id: "pattern" } },
  { id: "q_when", question: "When and where is the risk highest?", hint: "Times, situations or people that make the risk rise.", gap: "When is the risk highest?", chip: { doc: "f", id: "dynamic" }, writes: { doc: "f", id: "dynamic" } },
  { id: "q_helps", question: "What helps - their strengths and what keeps them safe?", hint: "Protective factors, and how stable or fragile they are right now.", gap: "What is protective, and how steady is it?", chip: { doc: "f", id: "protective" }, writes: { doc: "f", id: "protective" } },
  { id: "q_engage", question: "How engaged are they, and do they recognise the risk?", hint: "Engagement and insight.", gap: "What helps them engage?", chip: { doc: "f", id: "engagement" }, writes: { doc: "f", id: "engagement" } },
  // The trust guide lists managing it when it happens and preventing it as two
  // separate content requirements, under one template heading. Asked separately,
  // printed together - the "manage" half was the one people kept missing.
  { id: "q_manage", question: "What do we do when it happens?", hint: "The response at the time. The trust guide gives 1:1 time, the patient handing over risk items with a full search, PRN offered, time off the ward, a medical review, and arranging a risk strategy meeting - the same meeting you can also call as escalation.", gap: "What happens in the moment?", chip: { doc: "r", id: "prevent", group: MANAGE_GROUP }, writes: { doc: "r", id: "prevent", part: "manage" } },
  { id: "q_prevent", question: "What prevents it, or reduces how often it happens?", hint: "The day-to-day things that stop it building. The trust guide gives de-escalation techniques and structured activity.", gap: "What reduces the risk for this patient?", chip: { doc: "r", id: "prevent", group: REDUCE_GROUP }, writes: { doc: "r", id: "prevent", part: "reduce" } },
  { id: "q_working", question: "How will we know it is working?", hint: "Measurable change - avoid vague. How will you KNOW the risk is reducing?", gap: "What measurable change shows the risk is reducing?", chip: { doc: "r", id: "evaluate" }, writes: { doc: "r", id: "evaluate" } },
  { id: "q_escalate", question: "What if the plan is not working - when and how do we escalate?", hint: "Escalation thresholds. An MDT review and a risk strategy meeting are two different processes, so say which one you mean and what would trigger it. The mandatory MDT line is added for you, so you do not need to write it.", gap: "When and how do you escalate?", chip: { doc: "r", id: "next" }, writes: { doc: "r", id: "next" } },
  { id: "q_judgement", question: "Overall, what is your clinical judgement of the risk?", hint: "Short and medium term. Pull the threads together.", gap: "What is your overall judgement?", chip: { doc: "f", id: "judgement" }, writes: { doc: "f", id: "judgement" } },
];

// Per-domain wording. Only `question`, `hint` and `gap` can be overridden - the
// routing never changes, so an answer always lands in the same output section
// whichever domain asked for it.
//
// The generic run reads as though the patient is the source of every risk, which
// is wrong for half the domains: in domain 4 the patient is the one being harmed,
// in domain 6 the person at risk is a child, and in domain 7 the risk is a
// situation rather than a behaviour. Those three are reworded throughout; the
// rest are sharpened so the question names the actual risk.
type QuestionOverride = Partial<Pick<UnifiedQuestion, "question" | "hint" | "gap">>;

export const DOMAIN_QUESTIONS: Record<string, Record<string, QuestionOverride>> = {
  "self-harm": {
    q_seen: { question: "What has happened, and what have you seen or heard recently?" },
    q_signs: { question: "What are the early warning signs they are moving towards self-harm or suicide?" },
    q_history: { question: "What in their history makes self-harm or suicide more likely?", hint: "Past attempts and methods, trauma, losses, previous admissions." },
    q_trigger: { question: "What has happened recently to bring this on?" },
    q_keeps: { question: "What is keeping the thoughts or the behaviour going?" },
    q_pattern: { question: "Is the self-harm or suicidal thinking escalating, repeating, or new?" },
    q_when: { question: "When is the risk highest - times of day, places, or after certain contact?" },
    q_helps: { question: "What helps them stay safe, and how steady is it right now?" },
    q_engage: { question: "How engaged are they, and can they tell you when they feel unsafe?", hint: "Whether they will seek help before acting is the part that matters most here." },
    q_manage: { question: "What do we do when they self-harm, or are about to?" },
    q_prevent: { question: "What reduces the risk day to day?" },
    q_working: { question: "How will we know they are safer?" },
    q_escalate: { question: "What if they are not getting safer - when and how do we escalate?" },
    q_judgement: { question: "Overall, what is your clinical judgement of the risk of self harm or suicide?" },
  },
  "self-neglect": {
    q_seen: { question: "What is the self-neglect, and what have you seen recently?" },
    q_signs: { question: "What are the early warning signs they are struggling to look after themselves?" },
    q_history: { question: "What in their history makes self-neglect more likely?" },
    q_trigger: { question: "What has happened recently to make it worse?" },
    q_keeps: { question: "What is stopping them getting back on top of it?" },
    q_pattern: { question: "Is it getting worse, is it long-standing, or is it new?" },
    q_when: { question: "Which parts of daily life are hardest, and when?", hint: "Eating, hygiene, money, medication, keeping the home safe." },
    q_helps: { question: "What can they still manage well, and who helps?" },
    q_engage: { question: "How engaged are they, and do they see it as a problem?" },
    q_manage: { question: "What do we do when we find they are not managing?" },
    q_prevent: { question: "What support stops it getting worse?" },
    q_working: { question: "How will we know they are managing better?" },
    q_escalate: { question: "What if they are not managing - when and how do we escalate?" },
    q_judgement: { question: "Overall, what is your clinical judgement of the risk to self?" },
  },
  "harm-to-others": {
    q_seen: { question: "What is the risk to others, and what have you seen or heard recently?" },
    q_signs: { question: "What are the early warning signs they are becoming unsafe to others?" },
    q_history: { question: "What in their history makes harm to others more likely?", hint: "Previous incidents, weapons, convictions, secure admissions." },
    q_keeps: { question: "What is keeping it going?" },
    q_when: { question: "When, where, and towards whom is the risk highest?", hint: "Named people, times, and situations that make it rise." },
    q_helps: { question: "What calms them, and what are their strengths?" },
    q_engage: { question: "How engaged are they, and do they recognise the effect on others?" },
    q_manage: { question: "What do we do when they become aggressive or unsafe?" },
    q_prevent: { question: "What stops it escalating in the first place?" },
    q_judgement: { question: "Overall, what is your clinical judgement of the risk to others?" },
  },
  "harm-by-others": {
    q_seen: { question: "What is the risk to them from other people, and what have you seen or heard?", hint: "This domain is about harm coming TO the patient - they are the person at risk." },
    q_signs: { question: "What are the signs they are being harmed, exploited or neglected?", hint: "Injuries, money going missing, fear of visitors, changes after contact." },
    q_history: { question: "What in their history makes them more vulnerable to this?" },
    q_trigger: { question: "What has happened recently to raise the concern?" },
    q_keeps: { question: "What is keeping them in this situation?", hint: "Dependence, fear, loyalty, housing, money, isolation." },
    q_pattern: { question: "Is this escalating, long-standing, or new?" },
    q_when: { question: "Who is the risk from, and when is it highest?", hint: "Visits, phone contact, leave, and discharge home." },
    q_helps: { question: "Who is safe around them, and what protects them?" },
    q_engage: { question: "How do they see the relationship, and what do they want to happen?", hint: "Making Safeguarding Personal - their wishes come first, and are recorded even if we must act anyway." },
    q_manage: { question: "What do we do when we find they have been harmed?", hint: "Include consent, and what we must share regardless of what they want." },
    q_prevent: { question: "What reduces their exposure to it?" },
    q_working: { question: "How will we know they are safer?" },
    q_escalate: { question: "What if they are not safer - when do we escalate, and does this need a safeguarding referral?" },
    q_judgement: { question: "Overall, what is your clinical judgement of the risk of harm by others?" },
  },
  "physical-health": {
    q_seen: { question: "What is the physical health risk, and what have you seen recently?" },
    q_signs: { question: "What are the early warning signs their physical health is deteriorating?", hint: "Observable changes - eating, mobility, confusion, breathing, skin, pain." },
    q_history: { question: "What in their physical health history makes this more likely?", hint: "Long-term conditions, frailty, previous admissions, medication." },
    q_trigger: { question: "What has changed recently - illness, medication, or a fall?" },
    q_keeps: { question: "What is keeping it going, or getting in the way of treating it?" },
    q_pattern: { question: "Is it getting worse, stable, or new?" },
    q_when: { question: "When is the risk highest - at night, on the move, after medication?" },
    q_helps: { question: "What are they managing well, and what support is already in place?" },
    q_engage: { question: "How engaged are they with physical health care and medication?" },
    q_manage: { question: "What do we do when their physical health deteriorates?", hint: "Say who does what. Scored tools such as NEWS2, MUST and Waterlow stay on SystmOne." },
    q_prevent: { question: "What keeps their physical health stable?" },
    q_working: { question: "How will we know it is improving?" },
    q_escalate: { question: "What if it is not improving - when do we escalate, and to whom?" },
    q_judgement: { question: "Overall, what is your clinical judgement of the physical health risk?" },
  },
  "children": {
    q_seen: { question: "What is the risk to the child or unborn baby, and what have you seen or heard?", hint: "The person at risk here is the child, not the patient." },
    q_signs: { question: "What are the signs the risk is present or increasing?" },
    q_history: { question: "What in the history makes this more likely?", hint: "Previous involvement of children's social care, court orders, past harm." },
    q_trigger: { question: "What has happened recently to raise the concern?" },
    q_keeps: { question: "What is keeping the risk in place?" },
    q_pattern: { question: "Is it escalating, long-standing, or new?" },
    q_when: { question: "When is the risk highest - contact, leave, or discharge home?" },
    q_helps: { question: "Who is protective around the child, and what is working?" },
    q_engage: { question: "How does the patient see it, and what support do they want?" },
    q_manage: { question: "What do we do when a concern is raised?", hint: "Children's social care and Starting Point sit outside the ward - name who refers and when." },
    q_prevent: { question: "What reduces the risk to the child?" },
    q_working: { question: "How will we know the child is safer?" },
    q_escalate: { question: "What if the risk continues - when do we escalate, and has a referral been made?" },
    q_judgement: { question: "Overall, what is your clinical judgement of the risk to the child or unborn baby?" },
  },
  "environmental": {
    q_seen: { question: "What is the environmental or external risk, and what have you seen or been told?", hint: "This is the situation around the person - housing, money, who they live with." },
    q_signs: { question: "What are the signs this is causing harm or getting worse?" },
    q_history: { question: "What in the background led to this?" },
    q_trigger: { question: "What has changed recently - housing, money, or who they live with?" },
    q_keeps: { question: "What is keeping the situation as it is?" },
    q_pattern: { question: "Is it getting worse, long-standing, or new?" },
    q_when: { question: "When does it matter most - on leave, at discharge, or at home?" },
    q_helps: { question: "What is stable, and who is helping?" },
    q_engage: { question: "How does the patient see it, and what do they want to change?" },
    q_manage: { question: "What do we do when it becomes a problem?", hint: "Housing, social care and benefits sit outside the ward - name who is doing what." },
    q_prevent: { question: "What stops the situation getting worse?" },
    q_working: { question: "How will we know the situation is improving?" },
    q_escalate: { question: "What if it is not resolved - when do we escalate, and does it hold up discharge?" },
    q_judgement: { question: "Overall, what is your clinical judgement of the environmental risk?" },
  },
};

// The question run for one domain, with that domain's wording applied.
export function questionsForDomain(domainId: string): UnifiedQuestion[] {
  const overrides = DOMAIN_QUESTIONS[domainId];
  if (!overrides) return UNIFIED_QUESTIONS;
  return UNIFIED_QUESTIONS.map((q) => (overrides[q.id] ? { ...q, ...overrides[q.id] } : q));
}
