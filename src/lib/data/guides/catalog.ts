import { WORKFLOWS } from "./referral-workflows";

export interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  category: string;
  viewerPath: string;
}

// Guide TYPE label (Mike): make it obvious how a guide works. Most guides are
// read-through "How-to"; referral workflows are "Step-by-step"; a few are
// fill-and-copy "Builder"s, tick-list "Checklist"s, or "Tips" thinking guides.
export const GUIDE_TYPE: Record<string, string> = {
  "care-plan": "Builder", "risk-assessment": "Builder", "mental-state-exam": "Builder", "abc-chart": "Builder",
  "mha-checker": "Checklist", "admission-checklist": "Checklist", "leave-discharge-transfer": "Checklist", "fridge-temps": "Checklist",
  "seclusion-support-plan": "Tips", "debrief": "Tips", "safety-plan": "Tips", "restraint-monitoring": "Tips", "observation-engagement": "Tips",
};
export const TYPE_STYLE: Record<string, string> = {
  "Builder": "bg-violet-100 text-violet-700",
  "Checklist": "bg-emerald-100 text-emerald-700",
  "Tips": "bg-amber-100 text-amber-700",
  "Step-by-step": "bg-blue-100 text-blue-700",
  "How-to": "bg-slate-100 text-slate-600",
};
export function guideType(id: string): string {
  return GUIDE_TYPE[id] || (WORKFLOWS[id] ? "Step-by-step" : "How-to");
}

// All guides grouped by category - this order drives the page (when no custom
// editor order is saved). Categories render in first-seen order.
export const ALL_GUIDES: GuideItem[] = [
  // Legal & Advocacy
  { id: "mha-statuses", title: "MHA Statuses Explained", description: "All Mental Health Act sections and patient rights", icon: "⚖️", gradient: "from-indigo-600 to-purple-800", category: "Legal & Advocacy", viewerPath: "/guides/mha-statuses" },
  { id: "mha-checker", title: "Section Papers - Receipt & Scrutiny", description: "Interactive checker - which MHA forms you need and how to scrutinise them", icon: "⚖️", gradient: "from-indigo-600 to-purple-700", category: "Legal & Advocacy", viewerPath: "/guides/mha-checker" },
  { id: "imha-advocacy", title: "IMHA / Advocacy", description: "Independent Mental Health Advocate for all patients (informal and detained)", icon: "🗣️", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy", viewerPath: "/guides/imha-advocacy" },
  { id: "s117-meeting", title: "S117 Meeting Request", description: "Request Social Care attendance at S117 discharge meeting", icon: "⚖️", gradient: "from-purple-600 to-purple-800", category: "Legal & Advocacy", viewerPath: "/guides/s117-meeting" },
  { id: "capacity-assessment", title: "Capacity Assessment", description: "Two-stage test and documentation requirements", icon: "⚖️", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy", viewerPath: "/guides/capacity-assessment" },
  { id: "dols", title: "DoLS Ward Guidance", description: "Deprivation of Liberty Safeguards - when to apply", icon: "🔒", gradient: "from-violet-500 to-violet-700", category: "Legal & Advocacy", viewerPath: "/guides/dols" },
  { id: "section-17", title: "Section 17 Leave", description: "Leave arrangements for detained patients", icon: "🚪", gradient: "from-blue-500 to-blue-700", category: "Legal & Advocacy", viewerPath: "/guides/section-17" },
  { id: "arrange-mha-assessment", title: "Arranging an MHA Assessment", description: "Set up an MHA assessment when the medics request one (City/County AMHP)", icon: "⚖️", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy", viewerPath: "/guides/arrange-mha-assessment" },
  { id: "section-132", title: "Section 132 - Reading Patient Rights", description: "When and how to read detained and informal patients their rights", icon: "📋", gradient: "from-indigo-600 to-purple-800", category: "Legal & Advocacy", viewerPath: "/guides/section-132" },
  { id: "section-136", title: "Section 136 - Place of Safety", description: "Receiving a person brought in by police under Section 136", icon: "🚓", gradient: "from-indigo-600 to-blue-800", category: "Legal & Advocacy", viewerPath: "/guides/section-136" },
  { id: "tribunal-report", title: "Mental Health Tribunal - Nursing Report", description: "Writing the nursing report and attending the hearing", icon: "⚖️", gradient: "from-indigo-600 to-purple-800", category: "Legal & Advocacy", viewerPath: "/guides/tribunal-report" },
  // Nurse Tools
  { id: "mh-talking-points", title: "Named Nurse Talking Points", description: "23 patient-facing mental health guides - print as leaflets for patients and families", icon: "🧠", gradient: "from-gray-800 to-gray-900", category: "Nurse Tools", viewerPath: "/patient-guides" },
  { id: "risk-assessment", title: "Risk Formulation & Management Plan", description: "Interactive builder - write a personalised formulation and RMP for SystemOne", icon: "⚠️", gradient: "from-rose-500 to-red-700", category: "Nurse Tools", viewerPath: "/guides/risk-assessment" },
  { id: "abc-chart", title: "ABC Charts", description: "Recording and analysing challenging behaviour - antecedent, behaviour, consequence", icon: "📋", gradient: "from-amber-500 to-orange-700", category: "Nurse Tools", viewerPath: "/guides/abc-chart" },
  { id: "care-plan", title: "My Care Plan", description: "Interactive builder - write a personalised, patient-voice care plan for SystemOne", icon: "📝", gradient: "from-sky-500 to-blue-700", category: "Nurse Tools", viewerPath: "/guides/care-plan" },
  { id: "safety-plan", title: "Safety Plan", description: "Think-it-through guide for a collaborative, patient-voice safety plan", icon: "🛟", gradient: "from-emerald-500 to-green-700", category: "Nurse Tools", viewerPath: "/guides/safety-plan" },
  { id: "honos", title: "HoNOS & Clustering explained", description: "What HoNOS is, how to score the 12 scales, and how clustering works - guidance, not the tool", icon: "📊", gradient: "from-cyan-600 to-teal-800", category: "Nurse Tools", viewerPath: "/guides/honos" },
  { id: "named-nurse", title: "Named Nurse Checklist", description: "Weekly and monthly tasks for named nurses", icon: "📋", gradient: "from-emerald-500 to-emerald-700", category: "Nurse Tools", viewerPath: "/guides/named-nurse" },
  { id: "admission-checklist", title: "Admission Checklist", description: "Interactive tick-list of every admission task, with help links", icon: "✅", gradient: "from-green-500 to-green-700", category: "Nurse Tools", viewerPath: "/guides/admission-checklist" },
  { id: "admission-note", title: "Admission Note Template", description: "The nine points to cover when you write up an admission - copy into SystmOne", icon: "📝", gradient: "from-sky-500 to-blue-700", category: "Nurse Tools", viewerPath: "/guides/admission-note" },
  { id: "leave-discharge-transfer", title: "Leave, Discharge & Transfer", description: "Safety checklist with a Leave / Discharge / Transfer toggle and high-risk flags", icon: "🚪", gradient: "from-teal-500 to-emerald-700", category: "Nurse Tools", viewerPath: "/guides/leave-discharge-transfer" },
  { id: "dama", title: "Discharge Against Medical Advice", description: "The process and form when a patient self-discharges against advice", icon: "🚪", gradient: "from-orange-500 to-red-700", category: "Nurse Tools", viewerPath: "/guides/dama" },
  { id: "fridge-temps", title: "Fridge Temperature Recording", description: "Medication fridge monitoring and Assurance Dashboard recording", icon: "🌡️", gradient: "from-cyan-500 to-cyan-700", category: "Nurse Tools", viewerPath: "/guides/fridge-temps" },
  // Medics Tools (new group - build up over time; OT Tools appears once it has a guide)
  { id: "mental-state-exam", title: "Mental State Examination", description: "Interactive MSE builder - pick words per domain, copy to notes", icon: "🧠", gradient: "from-purple-500 to-purple-700", category: "Medics Tools", viewerPath: "/guides/mental-state-exam" },
  // Restrictive Practice
  { id: "seclusion-support-plan", title: "Seclusion Support Plan", description: "Think-it-through guide for the seclusion support plan - safer, sooner out of seclusion", icon: "🚪", gradient: "from-rose-600 to-red-800", category: "Restrictive Practice", viewerPath: "/guides/seclusion-support-plan" },
  { id: "restraint-monitoring", title: "Restraint & Rapid Tranq Monitoring", description: "Draft a defensible monitoring narrative for restraint or rapid tranquillisation", icon: "🩺", gradient: "from-orange-600 to-red-700", category: "Restrictive Practice", viewerPath: "/guides/restraint-monitoring" },
  { id: "observation-engagement", title: "Observation & Engagement Plan", description: "Write a clear rationale for the observation level and how staff engage", icon: "👁️", gradient: "from-blue-600 to-indigo-800", category: "Restrictive Practice", viewerPath: "/guides/observation-engagement" },
  { id: "debrief", title: "Post-Incident Debrief", description: "Capture the patient's account and the learning after restraint, RT or seclusion", icon: "💬", gradient: "from-teal-600 to-cyan-800", category: "Restrictive Practice", viewerPath: "/guides/debrief" },
  { id: "blanket-restrictions", title: "Blanket Restrictions & Restrictive Practice", description: "What counts as a blanket restriction, which are allowed, and how to justify and review one", icon: "⛔", gradient: "from-orange-600 to-red-700", category: "Restrictive Practice", viewerPath: "/guides/blanket-restrictions" },
  // Safeguarding - referrals, then adult, then children, then general
  { id: "safeguarding", title: "Safeguarding Adults - Making a Referral", description: "S.42 referral - report concerns, Derby City or County", icon: "🛡️", gradient: "from-red-600 to-red-800", category: "Safeguarding", viewerPath: "/guides/safeguarding" },
  { id: "safeguarding-children", title: "Safeguarding Children - Making a Referral", description: "Starting Point referral for child concerns", icon: "👶", gradient: "from-pink-500 to-pink-700", category: "Safeguarding", viewerPath: "/guides/safeguarding-children" },
  { id: "domestic-abuse-guide", title: "Domestic Abuse", description: "Recognising and responding to domestic abuse", icon: "🏠", gradient: "from-purple-600 to-purple-800", category: "Safeguarding", viewerPath: "/guides/domestic-abuse-guide" },
  { id: "peer-conflict-guide", title: "Peer-on-Peer Conflict", description: "When to escalate patient conflict to safeguarding", icon: "⚠️", gradient: "from-amber-600 to-amber-800", category: "Safeguarding", viewerPath: "/guides/peer-conflict-guide" },
  { id: "non-recent-abuse", title: "Non-Recent Abuse Disclosures", description: "Responding when adults disclose childhood abuse", icon: "🕰️", gradient: "from-slate-600 to-slate-800", category: "Safeguarding", viewerPath: "/guides/non-recent-abuse" },
  { id: "escalation-pathway", title: "Escalation Pathway (Children)", description: "Bronze, Silver and Gold levels for complex YP cases", icon: "📈", gradient: "from-orange-600 to-orange-800", category: "Safeguarding", viewerPath: "/guides/escalation-pathway" },
  { id: "online-safety-children", title: "Online Safety and Children", description: "Nudes, cyberbullying, sextortion and screen time", icon: "🌐", gradient: "from-cyan-600 to-cyan-800", category: "Safeguarding", viewerPath: "/guides/online-safety-children" },
  { id: "honour-based-abuse", title: "HBA, FGM and Forced Marriage", description: "Honour-based abuse, female genital mutilation and forced marriage", icon: "🛡️", gradient: "from-rose-700 to-rose-900", category: "Safeguarding", viewerPath: "/guides/honour-based-abuse" },
  { id: "modern-slavery-radicalisation", title: "Modern Slavery and Radicalisation", description: "Spotting the signs and making Prevent referrals", icon: "⛓️", gradient: "from-gray-600 to-gray-800", category: "Safeguarding", viewerPath: "/guides/modern-slavery-radicalisation" },
  { id: "faith-belief-abuse", title: "Abuse Linked to Faith or Belief", description: "Recognising abuse linked to spirit possession, witchcraft or cultural practices", icon: "🙏", gradient: "from-violet-600 to-violet-800", category: "Safeguarding", viewerPath: "/guides/faith-belief-abuse" },
  { id: "send-safeguarding", title: "SEND and Safeguarding", description: "Safeguarding children with special educational needs and disabilities", icon: "📚", gradient: "from-teal-600 to-teal-800", category: "Safeguarding", viewerPath: "/guides/send-safeguarding" },
  { id: "special-guardianship", title: "Special Guardianship Orders", description: "Permanence through SGOs - best practice guidance", icon: "👨‍👧", gradient: "from-emerald-600 to-emerald-800", category: "Safeguarding", viewerPath: "/guides/special-guardianship" },
  { id: "child-in-need", title: "Child in Need", description: "Multi-agency CIN arrangements and best practice", icon: "🤲", gradient: "from-sky-600 to-sky-800", category: "Safeguarding", viewerPath: "/guides/child-in-need" },
  { id: "information-sharing", title: "Information Sharing", description: "Seven golden rules and GDPR guidance for safeguarding", icon: "🔗", gradient: "from-blue-600 to-blue-800", category: "Safeguarding", viewerPath: "/guides/information-sharing" },
  // Urgent Care
  { id: "picu", title: "PICU Kingfisher Referral", description: "Psychiatric Intensive Care Unit transfers", icon: "🏥", gradient: "from-rose-500 to-rose-700", category: "Urgent Care", viewerPath: "/guides/picu" },
  { id: "awol", title: "Absent & Missing Patients (AWOL)", description: "When a patient is absent or missing - Right Care Right Person process", icon: "🏃", gradient: "from-red-600 to-orange-700", category: "Urgent Care", viewerPath: "/guides/awol" },
  // Social & Housing
  { id: "homeless-discharge", title: "Housing / Duty to Refer", description: "Homeless discharge and accommodation support", icon: "🏠", gradient: "from-orange-500 to-orange-700", category: "Social & Housing", viewerPath: "/guides/homeless-discharge" },
  { id: "social-care", title: "Social Care (Derby City)", description: "Care Act assessment, S117 referrals & Enablement", icon: "👥", gradient: "from-amber-500 to-amber-700", category: "Social & Housing", viewerPath: "/guides/social-care" },
  { id: "benefits-review", title: "Benefits Review", description: "DWP benefits review and welfare rights support", icon: "💷", gradient: "from-yellow-600 to-yellow-800", category: "Social & Housing", viewerPath: "/guides/benefits-review" },
  // Allied Health
  { id: "dietitian", title: "Dietitian Referral", description: "Nutritional assessment and support", icon: "🥗", gradient: "from-green-500 to-green-700", category: "Allied Health", viewerPath: "/guides/dietitian" },
  { id: "physio", title: "Physiotherapy", description: "Physical therapy and mobility assessment", icon: "🏃", gradient: "from-emerald-500 to-emerald-700", category: "Allied Health", viewerPath: "/guides/physio" },
  { id: "ot", title: "Occupational Therapy", description: "OT assessment and functional review", icon: "🧩", gradient: "from-violet-500 to-violet-700", category: "Allied Health", viewerPath: "/guides/ot" },
  { id: "speech-therapy", title: "Speech & Language", description: "SALT assessment and swallowing review", icon: "💬", gradient: "from-purple-500 to-purple-700", category: "Allied Health", viewerPath: "/guides/speech-therapy" },
  // Physical Health
  { id: "news2", title: "NEWS2 Observations", description: "National Early Warning Score - recognising deterioration", icon: "📊", gradient: "from-rose-500 to-rose-700", category: "Physical Health", viewerPath: "/guides/news2" },
  { id: "prenoxad", title: "Prenoxad (take-home naloxone)", description: "Nurse-led take-home naloxone under the PGD for opioid-overdose risk", icon: "💉", gradient: "from-teal-500 to-emerald-700", category: "Physical Health", viewerPath: "/guides/prenoxad" },
  { id: "transfer-in", title: "Accepting a Transfer from a General Ward", description: "Pre-transfer checklist for a patient coming back after physical treatment", icon: "🔄", gradient: "from-cyan-500 to-blue-700", category: "Physical Health", viewerPath: "/guides/transfer-in" },
  { id: "tissue-viability", title: "Tissue Viability", description: "Wound care and pressure ulcer concerns", icon: "🩹", gradient: "from-teal-500 to-teal-700", category: "Physical Health", viewerPath: "/guides/tissue-viability" },
  { id: "dental", title: "Dental Referral", description: "Dental care access for inpatients", icon: "🦷", gradient: "from-cyan-500 to-cyan-700", category: "Physical Health", viewerPath: "/guides/dental" },
  // Specialist Pathways
  { id: "edt", title: "Early Discharge Team", description: "EDT referral for discharge planning support", icon: "🚪", gradient: "from-sky-500 to-sky-700", category: "Specialist Pathways", viewerPath: "/guides/edt" },
  { id: "erp", title: "Emotional Regulation (ERP/DBT)", description: "DBT skills and emotional regulation pathway", icon: "🧠", gradient: "from-fuchsia-500 to-fuchsia-700", category: "Specialist Pathways", viewerPath: "/guides/erp" },
  { id: "ctr-dsp", title: "CTR / DSP Review", description: "Care Treatment Review for ASD/LD patients (mandatory)", icon: "📋", gradient: "from-lime-600 to-lime-800", category: "Specialist Pathways", viewerPath: "/guides/ctr-dsp" },
];
