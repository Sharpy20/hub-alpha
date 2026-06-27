// Admission checklist + MHA detention-papers data.
//
// Source of truth: Mike's "Admission checklist with help links.docx" (DHCFT),
// cross-checked against the national MHA 1983 framework:
//  - RDaSH "Receipt and Scrutiny of Detention Papers (MHA 1983)" policy
//  - Mental Health (Hospital, Guardianship and Treatment) (England) Regulations 2008 (statutory forms)
//  - Mental Health Law Online statutory forms reference
//
// The statutory process is the same across England, so this content is trust-agnostic
// except for the FOCUS (DHCFT intranet) how-to links, which only work on a Trust network.

// A link shown against a checklist item or MHA pathway.
export interface GuideLink {
  label: string;
  // Omit url (or leave empty) to render a disabled "Link to confirm" chip.
  url?: string;
  // Trust intranet link - shows the FOCUS-login warning before opening.
  requiresFocus?: boolean;
  // A blank statutory / referral form. Badged "Form" with a "verify" hint.
  isForm?: boolean;
}

// ---------------------------------------------------------------------------
// ADMISSION CHECKLIST
// ---------------------------------------------------------------------------

export interface ChecklistItem {
  id: string;
  text: string;
  // "Document this" tasks get a small badge.
  documentThis?: boolean;
  // Nested essential sub-points (e.g. the physical health minimum standard).
  subItems?: string[];
  links?: GuideLink[];
  note?: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
}

// FOCUS how-to guide URLs (DHCFT intranet - Trust network only).
const FOCUS = {
  nursesChecklist:
    "https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Ffocus.derbyshirehealthcareft.nhs.uk%2Fapplication%2Ffiles%2F4615%2F7348%2F5204%2FNurses_checklist.docx&wdOrigin=BROWSELINK",
  coreAssessment:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/9217/0418/4033/SystmOne_-_Core_Assessment_V1.0.pdf",
  capacity:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/5016/0490/6429/OnEPR_Capacity_to_Consent_v2.pdf",
  riskScreening:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/3617/3029/0573/OnEPR_-_Risk_Screening_Assessment_V1.4.pdf",
  safetyPlan:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/6316/5182/3079/OnEPR_Mental_Health_Safety_Plan_v1.1.pdf",
  physicalHealth:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/9916/2393/3974/OnEPR_-_Physical_Health_Assessment_Minimum_Standard_Adults_V1.0.pdf",
  scheduleNews2:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/2716/4450/2581/OnEPR_-_Inpatient_-_Schedule_News2_v1.1.pdf",
  saveBaselineNews2:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/8916/5182/3080/OnEPR_Physical_Health_Assessment_-_NEWS_2.pdf",
  engagementObs:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/2716/4450/1817/OnEPR_-_Inpatient_-_Engagement_Obs_-_Scheduling_including_Setting_and_Ending_Levels_v4.pdf",
  carePlan:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/2216/9219/1274/OnEPR_-_Care_Plans_1_-__Creating_a_New_Care_Plan_v2.1.pdf",
  honos:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/4217/3633/9115/SystmOne_-_Honos_and_Clustering_v1.1.pdf",
  section132:
    "https://focus.derbyshirehealthcareft.nhs.uk/application/files/6117/3140/9909/SystmOne_-_Recording_Section_132_Rights_Conversation_V1.2.pdf",
};

// Personal NHS OneDrive shares from the source doc. Wired up at Mike's request
// (Session 21). These open Mike's personal OneDrive and rely on its share
// permissions - swap for Trust-controlled URLs if those permissions change.
const PERSONAL = {
  blankH3:
    "https://nhs-my.sharepoint.com/:b:/g/personal/michael_sharpe4_nhs_net/EV0nPiy9p7hOmSeSVGvDLc0BmVi6Fs9L8G1gvzPfATlazQ?e=JUiABs",
  riskManagementPlan:
    "https://nhs-my.sharepoint.com/:w:/r/personal/michael_sharpe4_nhs_net/Documents/Fav%20Shares/Resources%20-%20save%20a%20copy%20DONT%20EDIT/4.%20Named%20Nurse%20help/Risk%20Tools/Risk%20Management%20Plans%2018.04.24.docx?d=w7e91a31c42664e20bd2fe84c1255eea8&csf=1&web=1&e=J4ZM7J",
  carePlanHelp:
    "https://nhs-my.sharepoint.com/:f:/g/personal/michael_sharpe4_nhs_net/Ek7Wf0cK-fBEpQxwxdbcKkQBmNYIt_xFXqy8ygM98DSfsA?e=ftJ7Fy",
};

export const ADMISSION_CHECKLIST: ChecklistGroup[] = [
  {
    id: "arrival",
    title: "When the patient arrives",
    icon: "🚪", // door
    items: [
      { id: "orientation", text: "Orientation to the ward", documentThis: true },
      {
        id: "description",
        text: "Check the description of the patient, and check address, contact details and next of kin",
        documentThis: true,
      },
      { id: "cpn", text: "Alert CPN (if allocated) to the patient being admitted" },
      { id: "bed", text: "Allocate a bed - on the fireboard and on SystemOne" },
      {
        id: "mha-paperwork",
        text: "Accept MHA paperwork (if applicable)",
        links: [
          { label: "How to accept MHA paperwork", url: FOCUS.nursesChecklist, requiresFocus: true },
          { label: "Section papers checker", url: "/guides/mha-checker" },
          { label: "Blank H3", url: PERSONAL.blankH3, isForm: true },
        ],
      },
      { id: "property", text: "Property list completed and placed in the scanning file" },
      { id: "prohibited", text: "Prohibited items placed in a safe place" },
      { id: "named-nurse", text: "Allocate a named nurse" },
      {
        id: "nok",
        text: "Inform next of kin / carer if applicable and consenting",
        documentThis: true,
      },
      {
        id: "ward-round",
        text: "Booked in for review in ward round, within 24 hours if possible",
      },
    ],
  },
  {
    id: "assessments",
    title: "Assessments & care planning",
    icon: "📋", // clipboard
    items: [
      {
        id: "core-assessment",
        text: "Core assessment",
        note: "A joint questionnaire completed by the nurse and the clerking-in doctor.",
        links: [{ label: "Core assessment", url: FOCUS.coreAssessment, requiresFocus: true }],
      },
      {
        id: "capacity-admission",
        text: "Relevant capacity assessment for admission / assessment",
        links: [{ label: "Capacity to consent", url: FOCUS.capacity, requiresFocus: true }],
      },
      {
        id: "capacity-treatment",
        text: "Relevant capacity assessment for treatment",
        links: [{ label: "Capacity to consent", url: FOCUS.capacity, requiresFocus: true }],
      },
      {
        id: "risk-screening",
        text: "Risk screening tool",
        links: [{ label: "Risk screening tool", url: FOCUS.riskScreening, requiresFocus: true }],
      },
      {
        id: "risk-management",
        text: "Risk management plan",
        links: [{ label: "Risk management plan", url: PERSONAL.riskManagementPlan, isForm: true }],
      },
      {
        id: "safety-plan",
        text: "Safety plan",
        links: [{ label: "Safety plan", url: FOCUS.safetyPlan, requiresFocus: true }],
      },
      {
        id: "physical-health",
        text: "Physical health assessment",
        note: "All pages should be completed. These sections are essential to meet national targets:",
        subItems: [
          "Baseline observations - weight, height, blood pressure and pulse",
          "Drinking status including AUDIT C (alert the medical team if the score is 11 or above)",
          "Smoking status for all patients, including Fagerstrom if a smoker",
          "Serum total cholesterol level (on the lipids and blood glucose page)",
          "Personal handling (if required)",
          "Falls (if required)",
          "PEEPS (if required)",
        ],
        links: [
          { label: "Physical health minimum standard", url: FOCUS.physicalHealth, requiresFocus: true },
        ],
      },
      {
        id: "news2",
        text: "Schedule NEWS2 and save a baseline NEWS2",
        links: [
          { label: "Schedule NEWS2", url: FOCUS.scheduleNews2, requiresFocus: true },
          { label: "Save baseline NEWS2", url: FOCUS.saveBaselineNews2, requiresFocus: true },
        ],
      },
      {
        id: "must",
        text: "MUST (malnutrition screening)",
        links: [{ label: "Physical health minimum standard", url: FOCUS.physicalHealth, requiresFocus: true }],
      },
      {
        id: "waterlow",
        text: "Waterlow (pressure ulcer risk)",
        links: [{ label: "Physical health minimum standard", url: FOCUS.physicalHealth, requiresFocus: true }],
      },
      {
        id: "engagement-obs",
        text: "Scheduled engagement observations, with the rationale documented",
        documentThis: true,
        links: [{ label: "Engagement observations", url: FOCUS.engagementObs, requiresFocus: true }],
      },
      {
        id: "care-plan",
        text: "Complete the care plan - 'my care plan'",
        links: [
          { label: "Creating a care plan", url: FOCUS.carePlan, requiresFocus: true },
          { label: "Help guides", url: PERSONAL.carePlanHelp },
        ],
      },
      {
        id: "honos",
        text: "HoNOS",
        links: [
          { label: "HoNOS on SystmOne", url: FOCUS.honos, requiresFocus: true },
          { label: "About HoNOS (RCPsych)", url: "https://www.rcpsych.ac.uk/improving-care/ccqi/health-of-nation-outcome-scales" },
        ],
      },
      {
        id: "read-rights",
        text: "Read rights - if detained, and if informal",
        documentThis: true,
        links: [{ label: "Recording Section 132 rights", url: FOCUS.section132, requiresFocus: true }],
      },
      {
        id: "advocacy",
        text: "Refer to advocacy",
        documentThis: true,
        // Project rule: advocacy is handled by the IMHA guide (city/county branching there).
        links: [{ label: "IMHA / advocacy guide", url: "/guides/imha-advocacy" }],
      },
      {
        id: "online-forms",
        text: "Online MHA forms",
        links: [
          { label: "MHA 1983 statutory forms", url: "https://www.mentalhealthlaw.co.uk/Mental_Health_Act_1983_Statutory_Forms" },
          { label: "Section papers checker", url: "/guides/mha-checker" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// MHA DETENTION PAPERS - RECEIPT & SCRUTINY
// ---------------------------------------------------------------------------

// A single statutory form tile.
export interface MhaForm {
  code: string;       // e.g. "A2", "H3"
  name: string;       // what it is
  who: string;        // who completes it
  url?: string;       // link to the blank statutory form (optional)
}

// One requirement block. `options` is OR-of-AND: each inner array is a set of
// forms that together satisfy the requirement; the outer array lists the
// alternative sets. e.g. medical recommendation = [[A3]] OR [[A4, A4]].
export interface MhaRequirement {
  label: string;
  options: MhaForm[][];
  note?: string;
}

export interface MhaPathway {
  id: string;
  label: string;       // short pathway name
  detail: string;      // one-line description
  icon: string;
  // The forms the AMHP/doctors must have provided.
  requirements: MhaRequirement[];
  // The form the receiving nurse completes (H3 / H4 / CTO4). Some pathways
  // (5(2), 5(4)) ARE the receiving form, so this is optional.
  nurseCompletes?: MhaForm;
  // Section-specific reminders (132 rights, AMHP report, recall meds etc.).
  notes?: string[];
  // Which scrutiny criteria sets apply.
  scrutiny: string[];
  // Pathways not taken straight from Mike's doc - shown with a "confirm" hint.
  verify?: boolean;
}

// Blank statutory forms.
// NOTE (Session 28b): Mental Health Law Online restructured its site mid-2026 and
// the per-form /media/Form_<code>_fillable.pdf deep links no longer resolve (the
// pages render empty). Until we re-source stable blank-form URLs (trust FOCUS,
// gov.uk, or a confirmed provider), every form points at the MHLO statutory-forms
// INDEX, where the current blanks can be found. The AMHP report is a free
// narrative document, so has no blank form.
// TODO: replace with verified per-form links once a stable source is confirmed.
const MHLO_FORMS = "https://www.mentalhealthlaw.co.uk/Mental_Health_Act_1983_Statutory_Forms";
const FORM_BLANK: Record<string, string> = {
  A2: MHLO_FORMS, A3: MHLO_FORMS, A4: MHLO_FORMS, A6: MHLO_FORMS, A7: MHLO_FORMS,
  A8: MHLO_FORMS, A9: MHLO_FORMS, A10: MHLO_FORMS, A11: MHLO_FORMS, H1: MHLO_FORMS, H2: MHLO_FORMS,
  H3: MHLO_FORMS, H4: MHLO_FORMS, CTO3: MHLO_FORMS, CTO4: MHLO_FORMS,
};

const FORMS = {
  A2: { code: "A2", name: "AMHP application for admission for assessment", who: "AMHP", url: FORM_BLANK.A2 },
  A3: { code: "A3", name: "Joint medical recommendation (assessment)", who: "Two doctors, one form", url: FORM_BLANK.A3 },
  A4: { code: "A4", name: "Single medical recommendation (assessment)", who: "One doctor", url: FORM_BLANK.A4 },
  A6: { code: "A6", name: "AMHP application for admission for treatment", who: "AMHP", url: FORM_BLANK.A6 },
  A7: { code: "A7", name: "Joint medical recommendation (treatment)", who: "Two doctors, one form", url: FORM_BLANK.A7 },
  A8: { code: "A8", name: "Single medical recommendation (treatment)", who: "One doctor", url: FORM_BLANK.A8 },
  A9: { code: "A9", name: "Emergency application by nearest relative (assessment)", who: "Nearest relative (rarely used)", url: FORM_BLANK.A9 },
  A10: { code: "A10", name: "AMHP emergency application for assessment", who: "AMHP", url: FORM_BLANK.A10 },
  A11: { code: "A11", name: "Medical recommendation for emergency admission", who: "One doctor", url: FORM_BLANK.A11 },
  H1: { code: "H1", name: "Doctor's holding power report - Section 5(2)", who: "Doctor (Part 2 by nurse)", url: FORM_BLANK.H1 },
  H2: { code: "H2", name: "Nurse's holding power record - Section 5(4)", who: "Nurse on shift", url: FORM_BLANK.H2 },
  H3: { code: "H3", name: "Record of detention - receipt of admission papers", who: "Nurse on shift", url: FORM_BLANK.H3 },
  H4: { code: "H4", name: "Record of detention on transfer", who: "Nurse on shift", url: FORM_BLANK.H4 },
  AMHP: { code: "AMHP", name: "AMHP report", who: "AMHP (supporting document)" },
  CTO3: { code: "CTO3", name: "Notice of recall to hospital", who: "Served in the community", url: FORM_BLANK.CTO3 },
  CTO4: { code: "CTO4", name: "Record of detention after recall", who: "Nurse on shift", url: FORM_BLANK.CTO4 },
} satisfies Record<string, MhaForm>;

// Scrutiny criteria, reused across pathways.
const SCRUTINY_GENERAL = "general";
const SCRUTINY_S2S3 = "s2s3";
const SCRUTINY_S4 = "s4";

export const MHA_SCRUTINY: Record<string, { title: string; items: string[] }> = {
  [SCRUTINY_GENERAL]: {
    title: "Every detention - always check",
    items: [
      "Only original section papers are accepted (or a valid electronic form / court-approved document).",
      "Papers are on the correct statutory forms for the section the patient is being detained under.",
      "Every section of every form is fully completed - no blanks.",
      "The patient's name and address are exactly the same on all documents.",
      "All documents are signed, dated and timed where required.",
      "There is an explanation on the form as to why informal admission is not appropriate.",
    ],
  },
  [SCRUTINY_S2S3]: {
    title: "Section 2 & 3 - also check",
    items: [
      "The AMHP saw the patient within 14 days of the date of the application.",
      "The two medical examinations were no more than 5 clear days apart.",
      "Neither medical recommendation is signed later than the date of the application.",
      "The patient is received within 14 days beginning with the date of the later examination.",
      "At least one doctor is Section 12 approved.",
      "At least one doctor had previous acquaintance with the patient (or an explanation is given).",
      "No more than one recommendation comes from a doctor at the admitting hospital.",
      "(Section 3 only) The doctors have stated where appropriate treatment can be provided.",
    ],
  },
  [SCRUTINY_S4]: {
    title: "Section 4 - also check",
    items: [
      "The applicant last saw the patient within 24 hours ending with the time of the application.",
      "Admission is within 24 hours starting with the medical examination or the application, whichever is earlier.",
      "Urgent necessity is stated, and there is only one medical recommendation.",
      "If converting to Section 2, the second medical recommendation is made within 72 hours of admission.",
    ],
  },
};

// Note shown under every scrutiny list.
export const MHA_RECTIFY_NOTE =
  "Minor errors can be rectified within 14 days of admission (Section 15). Fundamental defects - a missing recommendation, or a doctor who was not qualified to give one - cannot be rectified. Escalate anything you are unsure about to the MHA office straight away.";

export const MHA_PATHWAYS: MhaPathway[] = [
  {
    id: "s2",
    label: "Section 2",
    detail: "Admission for assessment (up to 28 days)",
    icon: "⚖️",
    requirements: [
      { label: "AMHP application", options: [[FORMS.A2]] },
      {
        label: "Medical recommendation",
        options: [[FORMS.A3], [FORMS.A4, FORMS.A4]],
        note: "One joint recommendation (A3) OR two single recommendations (2 x A4).",
      },
      {
        label: "AMHP report",
        options: [[FORMS.AMHP]],
        note: "Does not need to be seen immediately. Send to the ward email, then forward to the MHA office.",
      },
    ],
    nurseCompletes: FORMS.H3,
    notes: [
      "Complete the H3 once the patient is on the ward and all paperwork has been checked.",
      "Read the patient their Section 132 rights and send the form to the MHA office via the red bag. If their presentation prevents this, still complete a form and hand it over as an ongoing task.",
    ],
    scrutiny: [SCRUTINY_GENERAL, SCRUTINY_S2S3],
  },
  {
    id: "s3",
    label: "Section 3",
    detail: "Admission for treatment (up to 6 months)",
    icon: "⚖️",
    requirements: [
      { label: "AMHP application", options: [[FORMS.A6]] },
      {
        label: "Medical recommendation",
        options: [[FORMS.A7], [FORMS.A8, FORMS.A8]],
        note: "One joint recommendation (A7) OR two single recommendations (2 x A8).",
      },
      {
        label: "AMHP report",
        options: [[FORMS.AMHP]],
        note: "Does not need to be seen immediately. Send to the ward email, then forward to the MHA office.",
      },
    ],
    nurseCompletes: FORMS.H3,
    notes: [
      "Complete the H3 once the patient is on the ward and all paperwork has been checked.",
      "Read the patient their Section 132 rights and send the form to the MHA office via the red bag.",
    ],
    scrutiny: [SCRUTINY_GENERAL, SCRUTINY_S2S3],
  },
  {
    id: "s4",
    label: "Section 4",
    detail: "Emergency admission for assessment (up to 72 hours)",
    icon: "🚨",
    requirements: [
      {
        label: "Application",
        options: [[FORMS.A10], [FORMS.A9]],
        note: "AMHP application (A10), or rarely the nearest relative (A9).",
      },
      {
        label: "Medical recommendation",
        options: [[FORMS.A11]],
        note: "Only one medical recommendation is needed in an emergency.",
      },
    ],
    nurseCompletes: FORMS.H3,
    notes: [
      "Section 4 is for urgent necessity only - used when waiting for a second doctor would cause undesirable delay. Maximum 72 hours.",
      "Complete H3 Part 1 to accept the papers on admission. If a second medical recommendation is obtained within the 72 hours (one doctor Section 12 approved), it converts to Section 2 - complete H3 Part 2.",
      "Applicant must have seen the patient within the previous 24 hours; admission must be within 24 hours of the medical examination or the application, whichever is earlier.",
      "Read Section 132 rights within 24 hours of admission and send the papers to the MHA office without delay.",
    ],
    scrutiny: [SCRUTINY_GENERAL, SCRUTINY_S4],
  },
  {
    id: "transfer",
    label: "Transfer in / out",
    detail: "Patient detained at another hospital",
    icon: "🔁",
    requirements: [
      {
        label: "Transfer record",
        options: [[FORMS.H4]],
        note: "Signed H4 - Part 1 for a transfer in, Part 2 for a transfer out.",
      },
    ],
    notes: [
      "Obtain the original section papers from the transferring hospital, plus any tribunal reports if applicable.",
    ],
    scrutiny: [SCRUTINY_GENERAL],
  },
  {
    id: "cto-recall",
    label: "CTO recall",
    detail: "Community Treatment Order patient recalled to the ward",
    icon: "🏥",
    requirements: [
      {
        label: "Recall notice",
        options: [[FORMS.CTO3]],
        note: "Served in the community. The patient must initially be conveyed to the hospital named on the recall notice - check it has been completed correctly. Transfer to another hospital within the 72 hours is allowed (CTO6 if a different organisation).",
      },
      {
        label: "Record of detention",
        options: [[FORMS.CTO4]],
        note: "Completed by the nurse in charge on arrival. The 72-hour recall period runs from the time recorded on the CTO4 - record it accurately, it is the legal start point.",
      },
    ],
    notes: [
      "The 72 hours run from the CTO4 time, not the CTO3. The patient must be allowed to leave at 72 hours unless the CTO is revoked (CTO5, which must be done within the 72 hours).",
      "During the 72-hour recall the patient can be treated without consent under the recall power itself - a Section 62 is NOT needed at this stage. Section 62 only becomes relevant after revocation, when the patient is back on their original section.",
      "Medication during recall is governed by the existing CTO12 (has capacity and consents) or CTO11 (lacks capacity / SOAD authorisation).",
      "Call for an MHA assessment within 72 hours. The RC then revokes the CTO (CTO5) or ends the recall - the CTO continues, or the patient stays informally / returns to the community. On revocation, explain Section 132A rights immediately.",
    ],
    scrutiny: [SCRUTINY_GENERAL],
  },
  {
    id: "s5-2",
    label: "Section 5(2) - doctor's holding power",
    detail: "Holds an informal in-patient for up to 72 hours",
    icon: "⏱️",
    requirements: [
      {
        label: "Holding power report",
        options: [[FORMS.H1]],
        note: "All parts completed by the doctor on shift, with signature, date and time. Part 2 is completed by the nurse with signature, date and time. NOT VALID if Part 2 is not completed.",
      },
    ],
    notes: [
      "Detention legally begins the moment the completed H1 (Part 1) is handed to the nurse in charge. The nurse checks it and completes Part 2 to accept it - the section is not valid until Part 2 is signed.",
      "The patient must be reviewed by the RC / approved clinician the same day if possible, and no later than the next day. On a weekend or bank holiday the Duty Consultant attends - never leave it until Monday.",
      "If re-graded from Section 5(4), the 72 hours run from the start of the 5(4).",
      "Section 5(2) gives no power to treat without consent (Part 4 does not apply) - treat an incapacitous patient under the MCA if needed.",
      "Section 5(2) cannot be renewed. It must be converted to Section 2 or 3 if detention needs to continue.",
    ],
    scrutiny: [SCRUTINY_GENERAL],
  },
  {
    id: "s5-4",
    label: "Section 5(4) - nurse's holding power",
    detail: "Holds an informal in-patient for up to 6 hours",
    icon: "⏱️",
    requirements: [
      {
        label: "Holding power record",
        options: [[FORMS.H2]],
        note: "All parts completed by the nurse on shift, with signature, date and time.",
      },
    ],
    notes: ["A doctor able to use Section 5(2) must attend as soon as possible. The 6 hours runs from the moment the record is made."],
    scrutiny: [SCRUTINY_GENERAL],
  },
];
