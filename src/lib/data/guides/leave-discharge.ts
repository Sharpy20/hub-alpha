// Leave / Discharge / Transfer checklist.
//
// One checklist, three pathways. Each item lists the pathways it applies to
// (all three = "core"). The page shows only items for the selected pathway.
// High-risk, incident-prevention (SIRI-informed) items are flagged.
//
// Source-aligned with NHS mental health discharge + leave standards and the
// Trust's leave / discharge / transfer workflow. Tick-list aid - it does not
// replace the SystmOne records, the S17 form, or the discharge summary.

export type LdtPathway = "leave" | "discharge" | "transfer";

export interface LdtItem {
  id: string;
  label: string;
  pathways: LdtPathway[]; // which pathways this item shows for
  highRisk?: boolean; // safety-critical - flagged red
  guidance?: string; // optional "why this matters / what to do"
}

export interface LdtSection {
  id: string;
  title: string;
  icon: string;
  items: LdtItem[];
}

export const LDT_PATHWAYS: { id: LdtPathway; label: string; icon: string; blurb: string }[] = [
  { id: "leave", label: "Leave", icon: "🚶", blurb: "Section 17 or informal leave from the ward." },
  { id: "discharge", label: "Discharge", icon: "🏠", blurb: "Discharge from the ward to home or community." },
  { id: "transfer", label: "Transfer", icon: "🚑", blurb: "Transfer to another ward or unit, internal or external." },
];

const ALL: LdtPathway[] = ["leave", "discharge", "transfer"];

export const LDT_SECTIONS: LdtSection[] = [
  {
    id: "mdt",
    title: "MDT planning & agreement",
    icon: "👥",
    items: [
      {
        id: "mdt-agreed",
        label: "Leave / discharge / transfer agreed by the MDT or authorised by the RC",
        pathways: ALL,
        highRisk: true,
        guidance: "It should be a planned MDT or RC decision, not an ad-hoc one. If it is happening out of hours, the on-call / duty doctor and nurse in charge agree it and the RC is informed.",
      },
      { id: "mdt-rationale", label: "Decision and the reasons for it documented", pathways: ALL },
      {
        id: "mdt-patient-view",
        label: "Patient involved in the decision and their views recorded",
        pathways: ALL,
        guidance: "Record what the patient wants and any disagreement. If they were unable to take part, note why.",
      },
      { id: "mdt-date", label: "Date and time agreed and realistic for the ward", pathways: ALL },
    ],
  },
  {
    id: "legal",
    title: "Legal / status checks",
    icon: "⚖️",
    items: [
      {
        id: "legal-status",
        label: "MHA status confirmed and still valid",
        pathways: ALL,
        highRisk: true,
        guidance: "Check the section is in date. A detained patient cannot simply leave - the right legal route must be used.",
      },
      {
        id: "legal-s17",
        label: "Section 17 leave authorised by the RC, with conditions documented",
        pathways: ["leave"],
        highRisk: true,
        guidance: "A detained patient can only take leave under a current S17 leave form signed by the RC. Check the conditions, whether an escort is required, and the duration.",
      },
      { id: "legal-conditions", label: "Leave conditions explained to the patient", pathways: ["leave"] },
      {
        id: "legal-capacity",
        label: "Capacity / best interests / DoLS considered where relevant",
        pathways: ["discharge", "transfer"],
        guidance: "For informal patients, especially those who lack capacity, consider whether leaving is in their best interests and whether DoLS applies.",
      },
      {
        id: "legal-papers-transfer",
        label: "Section and legal paperwork transferred with the patient",
        pathways: ["transfer"],
        highRisk: true,
        guidance: "Detention paperwork must travel with the patient so the receiving unit holds them lawfully. Confirm the receiving unit has what it needs.",
      },
    ],
  },
  {
    id: "risk",
    title: "Risk & safety (critical)",
    icon: "🛡️",
    items: [
      {
        id: "risk-updated",
        label: "Risk assessment reviewed and updated BEFORE the patient leaves",
        pathways: ALL,
        highRisk: true,
        guidance: "Risk changes. Review it on the day, not from an old entry - the leading cause of post-leave and post-discharge incidents is an out-of-date risk picture.",
      },
      {
        id: "risk-safety-plan",
        label: "Safety plan reviewed / co-produced with the patient",
        pathways: ALL,
        highRisk: true,
        guidance: "The patient should know their warning signs, what helps, and who to contact. Use the Safety Plan guide.",
      },
      {
        id: "risk-means",
        label: "Access to means reduced for home / leave (medication, ligatures, etc.)",
        pathways: ["leave", "discharge"],
        highRisk: true,
        guidance: "Consider what the patient could access at home and agree practical steps - e.g. limited quantities of medication, family holding items.",
      },
      {
        id: "risk-safeguarding",
        label: "Safeguarding checked - self, others, and anyone at the home address",
        pathways: ["leave", "discharge"],
        highRisk: true,
        guidance: "Consider children or vulnerable adults at the address, domestic abuse, and any safeguarding plan. Raise a concern if needed before they go.",
      },
      {
        id: "risk-substance",
        label: "Substance use / intoxication risk on return considered",
        pathways: ["leave"],
      },
    ],
  },
  {
    id: "support",
    title: "Support & follow-up",
    icon: "🤝",
    items: [
      {
        id: "support-48hr",
        label: "Follow-up within 48 hours arranged",
        pathways: ["discharge"],
        highRisk: true,
        guidance: "NHS standard: contact within 48 hours of discharge. Confirm the named team, the contact, and that the patient knows it is coming.",
      },
      {
        id: "support-named-team",
        label: "Named responsible team / person for follow-up identified",
        pathways: ALL,
        highRisk: true,
        guidance: "Be specific - which team, which worker, and how to reach them. 'Community team' is not enough.",
      },
      {
        id: "support-during-leave",
        label: "Support arranged during leave (who, and how to contact them)",
        pathways: ["leave"],
      },
      {
        id: "support-community",
        label: "Community services engaged (CMHT / CRHT / EIP, etc.)",
        pathways: ["leave", "discharge"],
      },
      {
        id: "support-receiving",
        label: "Receiving team identified and has accepted the patient",
        pathways: ["transfer"],
        highRisk: true,
        guidance: "Confirm the receiving unit has accepted and has a bed. Get a named contact and a verbal handover, not just paperwork.",
      },
      {
        id: "support-crisis",
        label: "Crisis contacts given to the patient and understood",
        pathways: ALL,
        highRisk: true,
        guidance: "The patient can say who to call out of hours (crisis line, 111 option 2, 999). Check understanding, do not just hand over a leaflet.",
      },
    ],
  },
  {
    id: "medication",
    title: "Medication",
    icon: "💊",
    items: [
      {
        id: "med-ttos",
        label: "TTO medication ordered AND physically in hand before the patient leaves",
        pathways: ["discharge"],
        highRisk: true,
        guidance: "Order early. A patient must not leave without their medication - a gap in supply is a common, preventable cause of relapse and readmission.",
      },
      {
        id: "med-leave",
        label: "Leave medication dispensed if needed for the time away",
        pathways: ["leave"],
      },
      {
        id: "med-continuity",
        label: "Medication continuity ensured with the receiving unit",
        pathways: ["transfer"],
        highRisk: true,
        guidance: "Send an up-to-date medication chart / TTO and confirm the receiving unit can continue treatment without a gap.",
      },
      {
        id: "med-understands",
        label: "Patient understands their medication - what, when and why",
        pathways: ["leave", "discharge"],
        highRisk: true,
      },
      {
        id: "med-aids",
        label: "Compliance aids / blister packs arranged if needed",
        pathways: ["discharge"],
      },
    ],
  },
  {
    id: "documentation",
    title: "Documentation",
    icon: "📄",
    items: [
      {
        id: "doc-summary",
        label: "Discharge summary completed or arranged",
        pathways: ["discharge"],
        highRisk: true,
        guidance: "The GP and community team need the summary to keep the patient safe. If it cannot be finished today, record who will complete it and when.",
      },
      {
        id: "doc-gp",
        label: "GP notified within 24 hours of discharge",
        pathways: ["discharge"],
        highRisk: true,
      },
      {
        id: "doc-transfer-pack",
        label: "Transfer documentation prepared and sent with the patient",
        pathways: ["transfer"],
        highRisk: true,
        guidance: "Risk assessment, care plan, medication, legal papers and a current summary travel with the patient.",
      },
      { id: "doc-leave-plan", label: "Leave plan documented in the notes", pathways: ["leave"] },
      { id: "doc-s1", label: "SystmOne entries up to date", pathways: ALL },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    icon: "📞",
    items: [
      {
        id: "comm-patient",
        label: "Patient understands the plan - follow-up, medication and crisis contacts",
        pathways: ALL,
        highRisk: true,
        guidance: "Ask them to tell you the plan back in their own words. Understanding is the safety net.",
      },
      {
        id: "comm-nok",
        label: "Next of kin / carer informed (with consent)",
        pathways: ALL,
        guidance: "Check consent to share. If the patient declines, record it. Carers often spot early relapse first.",
      },
      { id: "comm-gp-team", label: "GP and community team informed", pathways: ["discharge", "transfer"] },
      { id: "comm-family-transfer", label: "Family informed of the transfer (as appropriate)", pathways: ["transfer"] },
      { id: "comm-handover", label: "Ward team / nurse in charge aware and handover updated", pathways: ALL },
    ],
  },
  {
    id: "day-of",
    title: "Day-of tasks (nurse in charge)",
    icon: "✅",
    items: [
      {
        id: "day-final-risk",
        label: "Final risk check on the day, before the patient leaves",
        pathways: ALL,
        highRisk: true,
        guidance: "A quick last look: has anything changed today? Mental state, new information, a row on the phone? If in doubt, pause and review.",
      },
      {
        id: "day-transport",
        label: "Transport arranged and safe",
        pathways: ["discharge", "transfer"],
        highRisk: true,
        guidance: "Confirm how the patient is travelling, that it is appropriate to their risk, and (for transfer) any escort required.",
      },
      { id: "day-property", label: "Property and valuables returned and signed for", pathways: ["discharge", "transfer"] },
      { id: "day-means-home", label: "Patient has money / keys / a way to get home", pathways: ["leave", "discharge"] },
      { id: "day-ttos-handed", label: "TTOs handed to the patient with an explanation", pathways: ["discharge"] },
      { id: "day-leave-time", label: "Leave start time and expected return time recorded", pathways: ["leave"] },
      { id: "day-bed", label: "Bed management / capacity updated", pathways: ["discharge", "transfer"] },
    ],
  },
  {
    id: "escalation",
    title: "If things go wrong (escalation)",
    icon: "🚨",
    items: [
      {
        id: "esc-awol",
        label: "Plan if the patient does not return from leave (AWOL)",
        pathways: ["leave"],
        highRisk: true,
        guidance: "Know the AWOL steps: record the time, attempt contact, welfare check, inform NOK, RC and bleep holder, involve police where risk warrants, and complete a Datix. For detained patients act promptly.",
      },
      {
        id: "esc-not-contactable",
        label: "Plan if the patient is not contactable after discharge",
        pathways: ["discharge"],
        highRisk: true,
        guidance: "Agree in advance what the follow-up team does if they cannot reach the patient - repeat attempts, contact NOK, welfare check, escalate.",
      },
      {
        id: "esc-transfer-fails",
        label: "Plan if the transfer falls through",
        pathways: ["transfer"],
        guidance: "Escalate to the bleep holder / bed management and the RC; keep the patient safe on the ward until resolved.",
      },
      {
        id: "esc-new-risk",
        label: "If new risk emerges, pause the plan and review with the MDT / RC",
        pathways: ALL,
        highRisk: true,
        guidance: "Nobody is criticised for pausing a leave or discharge because something changed. It is always the safe option.",
      },
      { id: "esc-datix", label: "Complete a Datix if an incident occurs", pathways: ALL },
    ],
  },
];
