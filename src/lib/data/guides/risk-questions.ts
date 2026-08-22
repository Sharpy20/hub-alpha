// The six questions the risk tool asks for each domain that has a risk in it.
//
// ⚠ THESE ARE WARDHUB'S QUESTIONS, NOT THE TRUST FORM'S. The SystmOne risk screen
// asks only a/b/c per domain (indicators Yes/No, current narrative, historical
// narrative) plus questions 8 and 9 at the end. These six exist to build the Risk
// Management Plan, which the Trust mandates within 24 hours of admission and for
// which its guidance (RISK MANAGEMENT PLANS 18/04/24) gives five fixed headings.
//
// ---------------------------------------------------------------------------
// 22 Aug 2026 REBUILD - why this file shrank from thirteen questions to six.
//
// The old run mixed two jobs. Six questions built the mandated plan; the other
// seven built the SystmOne Risk Formulation field, for which the Trust has no
// template at all, so wardHub had invented a formulation framework and asked
// staff to fill it in. Mike's verdict, 22 Aug: it had grown to twelve prompts,
// it took ages, and the answers came out repetitive.
//
// The formulation questions are gone. The Risk Formulation field is now built
// straight from the sub-domains the nurse ticked - see buildFormulationSummary()
// in welcome/risk-screen.ts. That is a transcription of their own selections,
// not an interpretation, which is both faster and considerably easier to defend:
// the tool no longer proposes causes, triggers, protective factors or an overall
// judgement of the risk.
//
// What is left is exactly the plan: one question per thing the Trust guidance
// says a plan must contain.
// ---------------------------------------------------------------------------

import {
  UNIVERSAL_IMMEDIATE, UNIVERSAL_PREVENTION, UNIVERSAL_REDUCTION_SIGNS,
  UNIVERSAL_ESCALATION, INCOMPLETE_OPTIONS,
  type DomainRmpBank,
} from "./rmp-chips";

// The RMP section a question's answer lands in. "what" is the plan's opening
// heading; the rest match RMP_SECTIONS ids.
export type RmpTarget = "what" | "present" | "prevent" | "evaluate" | "next";

/** The four per-domain banks in DOMAIN_RMP_CHIPS. */
export type DomainBankKey = Exclude<keyof DomainRmpBank, "note">;

export interface RmpQuestion {
  id: string;
  n: number;                 // 1-6, the order the plan is built in
  question: string;
  hint: string;
  gap?: string;
  // The Trust RMP heading this answer fills, shown on the question so staff can
  // see where their words end up.
  populates: string;
  writes: { id: RmpTarget; part?: "manage" | "reduce" };
  // Which of the ticked sub-domain's tailored banks supplies the SUGGESTED chips.
  // "what" is served by WHAT_IS_THE_RISK, the rest by RMP_RISK_CHIPS.
  // `bank` names the per-domain bank in DOMAIN_RMP_CHIPS; `section`/`group` still
  // reach the older per-sub-domain banks for anything they add on top.
  // `bank` names the per-domain bank in DOMAIN_RMP_CHIPS. Omitted on q1 (served by
  // WHAT_IS_THE_RISK) and on q6 - the design gives NO per-domain escalation bank,
  // because escalation is the universal list plus the mandatory MDT line.
  suggest: { section: RmpTarget; group?: string; bank?: DomainBankKey };
  // The universal library shown under "all options". Empty for question 2 on
  // purpose - a generic list of what a risk looks like is the exact fault this
  // rebuild is fixing.
  universal: string[];
  // A deliberate, visible record that the patient-specific detail is not known
  // yet. Not reassurance - see INCOMPLETE_OPTIONS.
  incomplete?: string;
  examples?: boolean;
}

// The two group labels inside HOW TO PREVENT / REDUCE. Must match risk.ts.
export const MANAGE_GROUP = "When it happens (manage)";
export const REDUCE_GROUP = "Prevent / reduce";

// Questions 3 and 4 stay separate on screen and are printed under the one Trust
// heading as two labelled lines. The Trust guidance lists managing the risk when
// it occurs and preventing it as two content requirements; the manage half was
// the one people kept missing.
export const RMP_QUESTIONS: RmpQuestion[] = [
  {
    id: "q1_what", n: 1,
    question: "Which specific outcome are you trying to prevent?",
    hint: "Name the outcome, not the diagnosis or the behaviour in general. The plan is titled with the sub-domains you ticked; this says what you are trying to stop happening.",
    gap: "What exactly are you trying to prevent, and to whom?",
    populates: "WHAT IS THE RISK",
    writes: { id: "what" },
    suggest: { section: "what" },
    universal: [],
  },
  {
    id: "q2_present", n: 2,
    question: "What does this look like for this person, and what would staff notice when the risk is increasing?",
    hint: "The specific, observable signs in THIS person - what a colleague coming on shift would actually see or hear.",
    gap: "What are the early warning signs for this person?",
    populates: "HOW DOES THIS PRESENT",
    writes: { id: "present" },
    suggest: { section: "present", bank: "present" },
    universal: [],
    incomplete: INCOMPLETE_OPTIONS.q2_present,
    examples: true,
  },
  {
    id: "q3_manage", n: 3,
    question: "What should staff do when the risk is present or increasing?",
    hint: "The response at the time. The Trust guidance gives 1:1 time, the person handing over risk items with a full search, PRN offered, time off the ward, a medical review, and arranging a risk strategy meeting.",
    gap: "What happens in the moment?",
    populates: "HOW TO PREVENT / REDUCE (when it happens)",
    writes: { id: "prevent", part: "manage" },
    suggest: { section: "prevent", group: MANAGE_GROUP, bank: "manage" },
    universal: UNIVERSAL_IMMEDIATE,
  },
  {
    id: "q4_prevent", n: 4,
    question: "What can staff and the patient do to reduce the likelihood of the risk occurring?",
    hint: "The day-to-day things that stop it building. The Trust guidance gives de-escalation techniques and structured activity.",
    gap: "What reduces the risk for this person?",
    populates: "HOW TO PREVENT / REDUCE (to prevent or reduce)",
    writes: { id: "prevent", part: "reduce" },
    suggest: { section: "prevent", group: REDUCE_GROUP, bank: "prevent" },
    universal: UNIVERSAL_PREVENTION,
    incomplete: INCOMPLETE_OPTIONS.q4_prevent,
  },
  {
    id: "q5_evaluate", n: 5,
    question: "What observable changes would show that the plan is working?",
    hint: "Something a colleague could see or the person could tell you. Say over what period - an absence of incidents is not proof the risk has gone.",
    gap: "What measurable change shows the risk is reducing?",
    populates: "EVALUATE SIGNS OF RISK REDUCTION",
    writes: { id: "evaluate" },
    suggest: { section: "evaluate", bank: "evaluate" },
    universal: UNIVERSAL_REDUCTION_SIGNS,
    incomplete: INCOMPLETE_OPTIONS.q5_evaluate,
  },
  {
    id: "q6_next", n: 6,
    question: "What further action should be taken, and when should the plan be escalated?",
    hint: "Escalation thresholds. An MDT review and a risk strategy meeting are two different processes, so say which one you mean and what would trigger it. The mandatory MDT line is added for you.",
    gap: "When and how do you escalate?",
    populates: "NEXT STEPS IF RISK MANAGEMENT PLAN UNSUCCESSFUL",
    writes: { id: "next" },
    suggest: { section: "next" },
    universal: UNIVERSAL_ESCALATION,
    incomplete: INCOMPLETE_OPTIONS.q6_next,
  },
];

// Per-domain HINTS only. The six questions keep their exact wording everywhere -
// they are short and neutral enough to read correctly in all seven domains, and
// changing the question text per domain was part of what made the old run long.
//
// The hints do the domain work, because three domains change who is at risk:
// in domain 4 the patient is the person being harmed, in domain 6 the person at
// risk is a child, and in domain 7 the risk is a situation rather than anyone's
// behaviour. Getting that wrong is the difference between a usable plan and one
// that reads as though the patient caused everything.
type HintOverride = Partial<Pick<RmpQuestion, "hint" | "gap">>;

export const DOMAIN_HINTS: Record<string, Record<string, HintOverride>> = {
  "self-harm": {
    q2_present: { hint: "The signs THIS person is moving towards self-harm or suicide - and whether they will tell you before they act, which is the part that matters most." },
    q3_manage: { hint: "What staff do when they self-harm, or are about to. Include asking directly about intent, plans and access to means." },
  },
  "self-neglect": {
    q2_present: { hint: "The signs they are struggling to look after themselves - eating, hygiene, money, medication, keeping the home safe." },
    q5_evaluate: { hint: "What managing better actually looks like for this person. Be concrete: meals taken, medication taken, appointments attended." },
  },
  "harm-to-others": {
    // This domain covers violence, fire setting, sexual offences, exploitation,
    // damage to property and risk driven by mental ill health - so the hint has
    // to fit all six, not just aggression.
    q2_present: { hint: "What staff would notice before an incident - and who the risk is towards. Name people, times and situations where it rises." },
    q3_manage: { hint: "What staff do at the time, and in what order. Say who else needs to know straight away." },
  },
  "harm-by-others": {
    q1_what: { hint: "This domain is about harm coming TO the person - they are the one at risk. Name what you are protecting them from.", gap: "What are you protecting them from, and from whom?" },
    q2_present: { hint: "The signs they are being harmed, exploited or neglected: injuries, money going missing, fear of visitors, changes after contact or leave." },
    q3_manage: { hint: "What staff do when we find they have been harmed. Include consent, and what has to be shared regardless of what they want." },
    q4_prevent: { hint: "What reduces their exposure. Making Safeguarding Personal - their wishes come first and are recorded, even where we must act anyway." },
    q6_next: { hint: "When to escalate, and whether this needs a safeguarding referral. An MDT review and a safeguarding referral are different things." },
  },
  "physical-health": {
    q2_present: { hint: "Observable changes - eating, mobility, confusion, breathing, skin, pain. Scored tools such as NEWS2, MUST and Waterlow stay on SystmOne." },
    q3_manage: { hint: "What staff do when their physical health deteriorates. Say who does what." },
    q6_next: { hint: "When to escalate and to whom - this is usually medical escalation rather than a risk strategy meeting." },
  },
  "children": {
    q1_what: { hint: "The person at risk here is the child or unborn baby, not the patient. Name what you are trying to prevent happening to them.", gap: "What are you trying to prevent happening to the child?" },
    q2_present: { hint: "The signs the risk to the child is present or increasing - around contact, leave and discharge home." },
    q3_manage: { hint: "What staff do when a concern is raised. Children's social care and Starting Point sit outside the ward - name who refers and when." },
    q4_prevent: { hint: "What reduces the risk to the child, and who is protective around them." },
    q6_next: { hint: "When to escalate, and whether a referral has been made. A safeguarding strategy meeting under s47 is not the same as a risk strategy meeting." },
  },
  "environmental": {
    q1_what: { hint: "This is the situation around the person - housing, money, appliances, who they live with. Name the outcome you are trying to prevent.", gap: "What outcome are you trying to prevent?" },
    q2_present: { hint: "The signs this is causing harm or getting worse. It may only show on leave or at discharge." },
    q3_manage: { hint: "What staff do when it becomes a problem. Housing, social care and benefits sit outside the ward - name who is doing what." },
    q6_next: { hint: "When to escalate, and whether this holds up discharge." },
  },
};

// The question run for one domain, with that domain's hints applied. The routing
// and the question wording never change - only the hint and the gap prompt.
export function questionsForDomain(domainId: string): RmpQuestion[] {
  const overrides = DOMAIN_HINTS[domainId];
  if (!overrides) return RMP_QUESTIONS;
  return RMP_QUESTIONS.map((q) => (overrides[q.id] ? { ...q, ...overrides[q.id] } : q));
}
