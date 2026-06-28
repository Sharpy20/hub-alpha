// Welcome admission tool - the non-risk sections (rights/legal, contacts,
// safeguarding, needs/referrals, forms to open). v1: each drops ready to open
// with usable copy-paste data. v2 (later): each can be set as a named diary task.
// All hrefs are real guide ids (verified against referral-workflows + static
// guide routes). Nothing here is stored.

export interface RightsItem { id: string; label: string; note: string; href: string }

// Tick what's done -> builds a rights/legal case note + links the guide.
// {name} / {date} are filled from the patient banner.
export const RIGHTS_ITEMS: RightsItem[] = [
  { id: "s132", label: "Section 132 rights read & explained", note: "Section 132 rights read and explained to {name} on {date}.", href: "/guides/section-132" },
  { id: "papers", label: "MHA papers received & scrutinised", note: "MHA detention papers received and scrutinised on admission ({date}).", href: "/guides/mha-checker" },
  { id: "imha", label: "IMHA / advocacy offered", note: "Independent Mental Health Advocate (IMHA) offered to {name} on {date}.", href: "/guides/imha-advocacy" },
  { id: "capadm", label: "Capacity to consent to admission assessed", note: "Capacity to consent to admission assessed for {name} on {date}.", href: "/guides/capacity-assessment" },
  { id: "captrt", label: "Capacity to consent to treatment assessed", note: "Capacity to consent to treatment assessed for {name} on {date}.", href: "/guides/capacity-assessment" },
];

export interface NeedItem { id: string; label: string; href: string }

// Needs to detect early + the referral/guide for each. Tick -> follow-up list.
export const NEED_ITEMS: NeedItem[] = [
  { id: "social-care", label: "Social care assessment", href: "/guides/social-care" },
  { id: "homeless-discharge", label: "Housing / homelessness (Duty to Refer)", href: "/guides/homeless-discharge" },
  { id: "benefits-review", label: "Benefits review", href: "/guides/benefits-review" },
  { id: "ot", label: "Occupational therapy (OT)", href: "/guides/ot" },
  { id: "physio", label: "Physiotherapy", href: "/guides/physio" },
  { id: "dietitian", label: "Dietitian", href: "/guides/dietitian" },
  { id: "speech-therapy", label: "Speech & language (SALT)", href: "/guides/speech-therapy" },
  { id: "tissue-viability", label: "Tissue viability", href: "/guides/tissue-viability" },
  { id: "dental", label: "Dental", href: "/guides/dental" },
  { id: "erp", label: "ERP pathway", href: "/guides/erp" },
  { id: "ctr-dsp", label: "CTR / DSP review", href: "/guides/ctr-dsp" },
  { id: "s117-meeting", label: "Section 117 aftercare", href: "/guides/s117-meeting" },
];

export interface LaunchForm { id: string; label: string; href: string; note: string }

// Other admission forms to open / hand over.
export const LAUNCH_FORMS: LaunchForm[] = [
  { id: "care-plan", label: "My Care Plan", href: "/guides/care-plan", note: "Build the working-age care plan" },
  { id: "safety-plan", label: "Safety Plan", href: "/guides/safety-plan", note: "Stanley-Brown safety plan" },
  { id: "leave-discharge-transfer", label: "Leave / Discharge care plan", href: "/guides/leave-discharge-transfer", note: "Discharge planning from admission" },
  { id: "admission-checklist", label: "Admission checklist", href: "/guides/admission-checklist", note: "Work through the admission tasks" },
  { id: "observation-engagement", label: "Observation & engagement", href: "/guides/observation-engagement", note: "Rationale + what staff actually do" },
  { id: "patient-guides", label: "Patient info leaflets", href: "/patient-guides", note: "Tick sheet to print for the patient" },
];

// Fixed duty-to-share wording for the safeguarding step (Making Safeguarding
// Personal - consent-led but honest about the duty to share).
export const SAFEGUARDING_DUTY =
  "Consent and information-sharing were discussed. The person was asked what they would like us to do with this information, and it was explained that where there is a risk of serious harm we have a duty to share information to keep people safe, with or without consent.";
