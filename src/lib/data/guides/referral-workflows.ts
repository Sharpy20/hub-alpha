// Referral workflow data - extracted from referrals/[id]/page.tsx

export interface WorkflowForm {
  label: string;
  url: string;
  icon?: string;
  note?: string;
  area?: "city" | "county"; // For area-filtered forms
}

export interface WorkflowForms {
  blank: WorkflowForm[];
  wagoll: WorkflowForm[];
  otherGuides: WorkflowForm[];
}

export interface SubmissionMethod {
  type: "email" | "phone" | "portal";
  label: string;
  value: string;
  area?: "city" | "county"; // For area-filtered methods
}

export interface WorkflowStep {
  id: string;
  type: "criteria" | "consent" | "section" | "area" | "forms" | "submission" | "casenote" | "reminder" | "gdpr";
  title: string;
  content: string;
  checkboxLabel?: string;
  forms?: WorkflowForms;
  methods?: SubmissionMethod[];
  clipboardText?: string;
  isDynamic?: boolean; // For dynamically generated content
}

export interface WorkflowData {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  steps: WorkflowStep[];
}

// Section options for MHA status
// Informal is voluntary (not detained). All others are forms of detention.
export const SECTION_OPTIONS = [
  { value: "informal", label: "Informal (Voluntary)", detained: false },
  { value: "section_2", label: "Section 2 (Assessment)", detained: true },
  { value: "section_3", label: "Section 3 (Treatment)", detained: true },
  { value: "section_4", label: "Section 4 (Emergency)", detained: true },
  { value: "section_5_2", label: "Section 5(2) (Doctor's Holding Power)", detained: true },
  { value: "section_5_4", label: "Section 5(4) (Nurse's Holding Power)", detained: true },
  { value: "cto", label: "CTO / Section 17A (Community Treatment Order)", detained: true },
  { value: "section_37", label: "Section 37 (Hospital Order)", detained: true },
  { value: "section_37_41", label: "Section 37/41 (Restricted Order)", detained: true },
  { value: "section_47_49", label: "Section 47/49 (Transfer Direction)", detained: true },
];

// Area options
export const AREA_OPTIONS = [
  { value: "city", label: "Derby City", description: "POhWER Advocacy Service" },
  { value: "county", label: "Derbyshire County", description: "Cloverleaf Advocacy Service" },
];

export const WORKFLOWS: Record<string, WorkflowData> = {
  "imha-advocacy": {
    id: "imha-advocacy",
    title: "IMHA / Advocacy Referral",
    description: "Independent Mental Health Advocate for all patients (informal and detained)",
    icon: "🗣️",
    gradient: "from-indigo-500 to-indigo-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "All patients have the right to access an Independent Mental Health Advocate (IMHA), whether informal (voluntary) or detained under the Mental Health Act. Detained patients include those under Section 2, Section 3, Section 4, Section 5(2)/5(4), CTO (Section 17A), Section 37, Section 37/41, or Section 47/49. Informal patients are not detained but still have access to advocacy services.",
        checkboxLabel: "I confirm the patient meets criteria for IMHA referral",
      },
      {
        id: "consent",
        type: "consent",
        title: "Patient Consent",
        content: "Have you asked the patient if they consent to an IMHA referral? (This is asked on the referral form - select as a reminder before proceeding)",
      },
      {
        id: "section",
        type: "section",
        title: "Legal Status",
        content: "What is the patient's current legal status under the Mental Health Act?",
      },
      {
        id: "area",
        type: "area",
        title: "Select Area",
        content: "Which area is the patient from? This determines which advocacy service to use.",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate form for your selected area.",
        forms: {
          blank: [
            { label: "Derby City IMHA Form 2025 (POhWER)", url: "#", icon: "📄", area: "city" },
            { label: "Derbyshire County IMHA Form (Cloverleaf)", url: "#", icon: "📄", area: "county" },
          ],
          wagoll: [
            { label: "IMHA Referral Example (WAGOLL)", url: "#", note: "Example only - do not submit" },
          ],
          otherGuides: [
            { label: "IMHA Service Information", url: "#" },
            { label: "POhWER Advocacy Leaflet", url: "#", area: "city" },
            { label: "Cloverleaf Advocacy Leaflet", url: "#", area: "county" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Send the completed referral to the advocacy service:",
        methods: [
          { type: "email", label: "Derby City Advocacy (POhWER)", value: "derbyadvocacy@pohwer.net", area: "city" },
          { type: "phone", label: "POhWER Helpline", value: "0300 456 2370", area: "city" },
          { type: "email", label: "Derbyshire County (Cloverleaf)", value: "referrals@cloverleaf-advocacy.co.uk", area: "county" },
          { type: "phone", label: "Cloverleaf Helpline", value: "0300 012 4563", area: "county" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Copy this text to add to the patient's case notes:",
        clipboardText: "", // Will be generated dynamically
        isDynamic: true,
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Would you like to schedule a follow-up task for this referral?",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Data protection best practice: Delete the completed referral form from your computer if it is no longer needed. Do not store patient data locally.",
      },
    ],
  },
  "picu": {
    id: "picu",
    title: "PICU Referral",
    description: "Psychiatric Intensive Care Unit transfer request",
    icon: "🏥",
    gradient: "from-rose-500 to-rose-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "The patient presents a significant risk that cannot be safely managed on an open/acute ward. Consider: severe aggression, absconding risk, self-harm requiring enhanced observation.",
        checkboxLabel: "I confirm the patient meets PICU referral criteria",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate forms and guides for your referral.",
        forms: {
          blank: [
            { label: "PICU Bed Request Form", url: "#", icon: "📄" },
            { label: "DHCFT PICU Referral", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "PICU Referral Example (WAGOLL)", url: "#", note: "Example - shows required detail level" },
          ],
          otherGuides: [
            { label: "PICU Admission Criteria", url: "#" },
            { label: "Transfer Checklist", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact the PICU team for bed availability and submit referral:",
        methods: [
          { type: "phone", label: "PICU Direct Line", value: "01234 567890" },
          { type: "email", label: "PICU Coordinator", value: "picu.referrals@nhs.net" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Copy this text to add to the patient's case notes:",
        clipboardText: "PICU referral submitted on [DATE]. Patient requires transfer due to [CLINICAL REASONS]. Referral sent to [PICU NAME] via [METHOD]. Awaiting bed availability.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add PICU follow-up to your job diary.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Ensure all patient identifiable information is handled securely during transfer.",
      },
    ],
  },
  "safeguarding": {
    id: "safeguarding",
    title: "Safeguarding Adults - Making a Referral",
    description: "S.42 Care Act 2014 - when and how to refer",
    icon: "🛡️",
    gradient: "from-red-600 to-red-800",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Check the Criteria (S.42)",
        content: "Section 42 of the Care Act 2014 - all three must apply:\n\n1. The adult has care and support needs\n2. They are experiencing, or at risk of, abuse or neglect\n3. Because of those needs, they cannot protect themselves\n\nNo 'significant harm' threshold. If in doubt, refer.",
        checkboxLabel: "I confirm this meets adult safeguarding criteria (S.42)",
      },
      {
        id: "consent",
        type: "consent",
        title: "Consent",
        content: "Best practice is to get consent before referring. However:\n\n- Don't let consent stop you if you're genuinely worried\n- You can override consent if there's immediate risk of harm or risk to your own safety\n- If you can't get consent, explain why in the referral\n- Always try to inform the person you're making a referral, even if consent wasn't obtained\n- Consider whether the person has capacity to consent\n\nHaving consent is ideal but not essential. A referral without consent is better than no referral at all.",
      },
      {
        id: "area",
        type: "area",
        title: "Select Area",
        content: "Which local authority area is the patient from? This determines where to send the safeguarding referral.",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate referral form for your area. Read the form questions carefully and answer as fully as possible.\n\nInclude: What have you seen/heard? When, where, who from? Basic info about the adult and the person causing harm. Why are you worried? What type of abuse? What is the impact now? What have you tried already? Separate facts from opinions. What does the adult want to happen?\n\nAvoid: using 'Unknown' or leaving blanks, sanitising language (use actual words), vague descriptions ('chaotic lifestyle'), victim-blaming language, and delays.",
        forms: {
          blank: [
            { label: "Derby City SAR Form", url: "#", icon: "📄", area: "city" },
            { label: "Derbyshire County SAR Form", url: "#", icon: "📄", area: "county" },
          ],
          wagoll: [
            { label: "Safeguarding Referral Example", url: "#", note: "Example - note the level of detail required" },
          ],
          otherGuides: [
            { label: "Types of Abuse Guide", url: "#" },
            { label: "DHCFT Safeguarding Policy", url: "#" },
            { label: "Making Safeguarding Personal", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Ring and discuss the case first, then submit the form.",
        methods: [
          { type: "phone", label: "Derbyshire County (Mon-Fri 8am-8pm, Sat 9:30-4pm)", value: "Hidden in demo mode", area: "county" },
          { type: "phone", label: "Derbyshire Out of Hours", value: "Hidden in demo mode", area: "county" },
          { type: "phone", label: "Derby City MASH (Mon-Fri 9am-5pm)", value: "Hidden in demo mode", area: "city" },
          { type: "phone", label: "Derby City Out of Hours (Careline)", value: "Hidden in demo mode", area: "city" },
          { type: "email", label: "Derby City Email", value: "AdultsMASH@derby.gov.uk", area: "city" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Copy this text to add to the patient's case notes:",
        clipboardText: "Adult Safeguarding concern raised to [DERBY CITY/DERBYSHIRE COUNTY] on [DATE]. Concern relates to suspected [TYPE OF ABUSE]. Referral sent via [METHOD]. Reference number: [IF GIVEN]. Patient [WAS/WAS NOT] informed of referral.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Safeguarding is everybody's responsibility - submitting the referral is not the finish line.\n\nDocument the referral in patient notes. Log on Datix if required. The S.42 enquiry may task your team with further actions. If the same concerns keep being raised without resolution, escalate to the Assistant Director of Safeguarding.\n\n39% of Derby City and 54% of Derbyshire County referrals become S.42 enquiries. That means many referrals don't meet threshold - but it's always better to refer than to stay silent.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Safeguarding overrides normal confidentiality - ensure senior staff are aware of the referral. Delete any downloaded referral forms containing patient data once submitted.",
      },
    ],
  },
  "dietitian": {
    id: "dietitian",
    title: "Dietitian Referral",
    description: "Nutritional assessment and support",
    icon: "🥗",
    gradient: "from-green-500 to-green-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient requires nutritional assessment - consider: poor appetite, significant weight change, swallowing difficulties, specific dietary requirements, or eating disorder concerns.",
        checkboxLabel: "I confirm the patient would benefit from dietitian input",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the appropriate forms and guides for your referral.",
        forms: {
          blank: [
            { label: "DHCFT Dietitian Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Dietitian Referral Example", url: "#", note: "Include MUST score and weight history" },
          ],
          otherGuides: [
            { label: "MUST Assessment Guide", url: "#" },
            { label: "Nutrition Screening Tool", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the dietetics team:",
        methods: [
          { type: "email", label: "Dietetics Team", value: "dietetics.referrals@nhs.net" },
          { type: "phone", label: "Dietetics Dept", value: "01234 567891" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Copy this text to add to the patient's case notes:",
        clipboardText: "Dietitian referral submitted on [DATE]. Patient referred due to [REASON]. Current MUST score: [SCORE]. Weight on admission: [WEIGHT]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add dietitian review follow-up to your diary.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete the completed referral form from your downloads folder.",
      },
    ],
  },
  "safeguarding-children": {
    id: "safeguarding-children",
    title: "Safeguarding Children - Making a Referral",
    description: "When you're worried about a child (under 18)",
    icon: "👶",
    gradient: "from-pink-500 to-pink-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "When to Refer",
        content: "You should refer when you have concerns about a child (under 18) who may be at risk of:\n\n- Physical abuse or harm\n- Emotional abuse or neglect\n- Sexual abuse or exploitation\n- Neglect (basic needs not met)\n- Domestic abuse in the household\n- Online harm, exploitation or grooming\n- Honour-based abuse, FGM or forced marriage\n- Radicalisation or extremism\n- Modern slavery or trafficking\n\nThis includes children of your patients where parenting capacity may be affected by mental illness, substance use, or domestic abuse.\n\nThink Family - does your patient have children or regular contact with children? Is their mental health affecting their ability to parent safely? Is there domestic abuse in the home?\n\nIf there is immediate risk of harm, call 999 first.",
        checkboxLabel: "I confirm there are child safeguarding concerns that require referral",
      },
      {
        id: "consent",
        type: "consent",
        title: "Discuss with Family",
        content: "Best practice is to discuss concerns with the family and gain consent before referring.\n\nHowever, do NOT seek consent if:\n- Doing so would put the child at greater risk\n- Doing so would put you or others at risk\n- It would compromise a police investigation\n- The alleged perpetrator is a family member and may destroy evidence\n\nIf you refer without consent, record your reasons clearly in the referral.",
      },
      {
        id: "area",
        type: "area",
        title: "Select Area",
        content: "Which area is the child from? This determines which referral form and phone number to use.",
      },
      {
        id: "forms",
        type: "forms",
        title: "Referral Forms & Advice",
        content: "Not sure if the threshold is met? Use the consultation lines before making a formal referral:\n\n- DHCFT Safeguarding Unit: Hidden in demo mode (Option 1)\n- Derbyshire Starting Point Consultation: Hidden in demo mode (Mon-Fri 10am-4pm)\n- Derby City Professional Consultation Line: Hidden in demo mode (Mon-Fri 10am-4pm)\n\nRefer to the Threshold Document for guidance on levels of need. Assessment tools (EHA, GCP, DVRIM) are available on the DDSCP Documents Library.",
        forms: {
          blank: [
            { label: "Derby City Children's Referral Form (online)", url: "https://myaccount.derby.gov.uk/en/service/report_concerns_about_a_child", icon: "📄", area: "city" },
            { label: "Derbyshire Starting Point Referral Form (online)", url: "https://www.derbyshire.gov.uk/social-health/children-and-families/support-for-families/starting-point-referral-form/starting-point-request-for-support-form.aspx", icon: "📄", area: "county" },
          ],
          wagoll: [
            { label: "Children's Safeguarding Example", url: "#", note: "Note the level of detail required" },
          ],
          otherGuides: [
            { label: "DDSCP Threshold Document", url: "#" },
            { label: "DDSCP Assessment Tools Library", url: "https://derbyshirescp.trixonline.co.uk/resources/documents-library" },
            { label: "DHCFT Think Family Policy", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "For urgent referrals, telephone first then follow up in writing within 48 hours. Save a copy of the referral in the child's health record.\n\nInclude: child's name, DOB, address, school. Parent/carer details. Nature of concern - be specific. How long concerns have been present. Any assessment tools used. Whether the family were informed. Other agencies involved. Your details and contact number.",
        methods: [
          { type: "phone", label: "Derby City (office hours)", value: "Hidden in demo mode", area: "city" },
          { type: "phone", label: "Derby City (out of hours)", value: "Hidden in demo mode", area: "city" },
          { type: "phone", label: "Derbyshire Starting Point (office hours)", value: "Hidden in demo mode", area: "county" },
          { type: "phone", label: "Derbyshire (out of hours)", value: "Hidden in demo mode", area: "county" },
          { type: "email", label: "Non-urgent (Derbyshire)", value: "starting.point@derbyshire.gov.uk" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the safeguarding referral in the patient's notes (the parent is your patient):",
        clipboardText: "Child safeguarding concern referred to [DERBY CITY/DERBYSHIRE COUNTY] on [DATE]. Concern relates to [CHILD NAME/DOB]. Nature of concern: [DETAILS]. Referral made via [PHONE/EMAIL]. Reference: [IF GIVEN]. Parent [WAS/WAS NOT] informed.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Children's Social Care should respond within 24 hours of receiving your referral.\n\n- Chase up any outstanding referrals after three working days\n- Document the outcome and update relevant agencies\n- Be prepared for Social Care to contact you for more information\n- If concerns escalate before you hear back, call again\n\nIf you disagree with the decision made by Social Care, use the multi-agency dispute resolution escalation protocol to challenge it. Escalation is your professional responsibility.\n\nSafeguarding children overrides normal patient confidentiality. You do not need the parent's consent to refer if a child may be at risk.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Safeguarding children overrides normal confidentiality rules. Ensure senior staff and safeguarding lead are aware.",
      },
    ],
  },
  "homeless-discharge": {
    id: "homeless-discharge",
    title: "Housing / Duty to Refer",
    description: "Homeless discharge and accommodation support",
    icon: "🏠",
    gradient: "from-orange-500 to-orange-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient is homeless or at risk of homelessness within 56 days and consents to referral. This is a statutory Duty to Refer requirement for NHS bodies.",
        checkboxLabel: "I confirm the patient meets homeless referral criteria and consents",
      },
      {
        id: "area",
        type: "area",
        title: "Select Area",
        content: "Which local authority area does the patient need housing support from?",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the Duty to Refer forms.",
        forms: {
          blank: [
            { label: "Derby City Duty to Refer", url: "#", icon: "📄", area: "city" },
            { label: "Derbyshire County Duty to Refer", url: "#", icon: "📄", area: "county" },
          ],
          wagoll: [
            { label: "Housing Referral Example", url: "#", note: "Include discharge date and needs" },
          ],
          otherGuides: [
            { label: "Duty to Refer Guidance", url: "#" },
            { label: "Housing Options Leaflet", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the local authority housing team:",
        methods: [
          { type: "email", label: "Derby City Housing", value: "housing.options@derby.gov.uk", area: "city" },
          { type: "phone", label: "Derby Housing Line", value: "01332 640000", area: "city" },
          { type: "email", label: "County Housing", value: "housing@derbyshire.gov.uk", area: "county" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the housing referral:",
        clipboardText: "Duty to Refer (housing) referral submitted on [DATE] to [DERBY/COUNTY]. Patient consent obtained. Expected discharge: [DATE]. Current accommodation status: [DETAILS]. Reference: [IF GIVEN].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up for housing assessment outcome.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Patient consent is required for Duty to Refer. Document consent in notes.",
      },
    ],
  },
  "social-care": {
    id: "social-care",
    title: "Social Care (Derby City)",
    description: "Care Act assessment, S117 referrals & Enablement – Derby City Council Mental Health Social Care",
    icon: "👥",
    gradient: "from-amber-500 to-amber-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has potential Care Act needs, requires Enablement input, or requires Adult Social Care attendance for S117 meetings.\n\nBefore referral, confirm:\n• Patient is a Derby City resident (check usual address / funding authority)\n• If S117 – confirm who has S117 aftercare responsibility\n• What was the patient's address when they were made subject to Section 3?\n\nMHA Office number to check if Derby City are S117 responsible: 01332 623700 ext 33333",
        checkboxLabel: "I confirm the patient is a Derby City resident and meets criteria for this referral",
      },
      {
        id: "section",
        type: "section",
        title: "S117 Status",
        content: "Is the patient under Section 3, or have they been on a Section 3 in this or a previous admission?\n\nThis determines the referral pathway:\n• S117 patients – require both a Care Act/S117 referral AND a S117 meeting before discharge\n• Non-S117 patients – follow the standard Care Act referral process\n\n⚠️ IMPORTANT: S117 discharge meetings MUST take place regardless of whether the patient was admitted informally, under Section 2, or Section 3. This is essential to ensure the discharge plan remains robust and prevents re-admission.",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download the relevant referral forms. The Enablement referral form is embedded within the social care referral form – you do not need to complete the full referral form if your request is solely for Enablement input.",
        forms: {
          blank: [
            { label: "Derby City Social Care / S117 Referral Form", url: "#", icon: "📄", note: "Includes embedded Enablement referral section" },
            { label: "S117 Meeting Request Form (7 days notice)", url: "#", icon: "📋", note: "Updated: Now requires 7 days notice (reduced from 14)" },
            { label: "Derbyshire County ASC Referral", url: "#", icon: "📄", area: "county" },
          ],
          wagoll: [
            { label: "Social Care Referral Example", url: "#", note: "Include care plan, risk assessment & OT assessments (if completed)" },
          ],
          otherGuides: [
            { label: "Care Act Eligibility Guide", url: "#" },
            { label: "S117 Aftercare Flowchart (S117 patients)", url: "#", note: "Print in colour and display on ward" },
            { label: "Care Act Flowchart (Non-S117 patients)", url: "#", note: "Print in colour and display on ward" },
            { label: "Carers Assessment Info", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "All referrals MUST go through duty. Send referral form + supporting documents (care plan, risk assessment, OT assessments if completed). Nursing assessment required if funding may be needed.\n\n⚠️ Missing information or documents? Referral may be closed if relevant information has not been obtained – the ward will be required to resubmit, which may cause delays.\n\nFor S117 meeting requests: Send the meeting request form to the same email (7 days notice required).\n\nNote: If the patient has housing needs (regardless of S117 status), 'Duty to Refer' is the correct process – see the Housing / Duty to Refer workflow.",
        methods: [
          { type: "email", label: "Derby City MH Social Care (All referrals & S117 meeting requests)", value: "MHSOCIALCARE@DERBY.GOV.UK" },
          { type: "phone", label: "Derby City MH Social Care Team", value: "01332 640777" },
          { type: "phone", label: "MHA Office (S117 responsibility check)", value: "01332 623700 ext 33333" },
          { type: "phone", label: "Derbyshire County ASC", value: "01629 533190", area: "county" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the referral. The referral will be triaged by duty and the outcome shared with the ward/referrer via telephone and email.",
        clipboardText: "Care Act / S117 referral submitted on [DATE] to Derby City Mental Health Social Care (MHSOCIALCARE@DERBY.GOV.UK). Supporting documents sent: care plan, risk assessment [and OT assessment if applicable]. Nursing assessment: [INCLUDED/NOT REQUIRED]. Referral type: [CARE ACT ASSESSMENT / S117 MEETING REQUEST / ENABLEMENT]. Awaiting triage outcome from duty team. Contact: 01332 640777.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up for social care assessment. If S117 patient, ensure S117 meeting is booked (7 days notice required) – a S117 meeting MUST take place before discharge.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Ensure patient is aware of and consents to social care referral where possible. Delete completed referral forms from your computer if no longer needed – do not store patient data locally.",
      },
    ],
  },
  "s117-meeting": {
    id: "s117-meeting",
    title: "S117 Meeting Request",
    description: "Request Mental Health Social Care attendance at S117 aftercare meeting – Derby City (7 days notice)",
    icon: "⚖️",
    gradient: "from-purple-600 to-purple-800",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "The patient is or has been subject to Section 117 aftercare and requires a S117 discharge meeting.\n\n⚠️ CRITICAL: A S117 discharge meeting MUST take place regardless of whether the patient was admitted informally, under Section 2, or under Section 3. This is essential to ensure the discharge plan remains robust and continues to prevent re-admission – which is the core purpose of S117 aftercare.\n\nThis meeting requires Mental Health Social Care attendance. Please ensure you give at least 7 days' notice (reduced from the previous 14-day requirement, approved by Karamjit Chhoker, Head of Service).\n\nIf your request is more urgent than 7 days, contact the team directly on 01332 640 777.",
        checkboxLabel: "I confirm this patient requires a S117 meeting and I understand this is mandatory before discharge",
      },
      {
        id: "forms",
        type: "forms",
        title: "Meeting Request Form",
        content: "Complete the S117 Meeting Request Form with all required details:\n\n• Patient's Name\n• Date of Birth\n• NHS Number\n• Date and Time of Review\n• Review Type\n• Review Method (face to face / virtual)\n• Nurse attending\n• Review location (include any known risks to worker)\n• Contact number for location",
        forms: {
          blank: [
            { label: "DCC Mental Health Meeting Attendance Request Form", url: "#", icon: "📋", note: "Updated: 7 days notice required (reduced from 14)" },
          ],
          wagoll: [
            { label: "Meeting Request Example", url: "#", note: "Ensure all fields completed – incomplete forms cause delays" },
          ],

          otherGuides: [
            { label: "S117 Aftercare Flowchart", url: "#", note: "Print in colour and display on ward" },
            { label: "Care Act & S117 Referral Process", url: "#" },
            { label: "Social Care Referral Workflow", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Meeting Request",
        content: "Send the completed meeting request form to Derby City Mental Health Social Care duty team.\n\nReminder: 7 days' notice is required. For urgent requests, phone the team directly.\n\nThe allocated Mental Health Social Worker will confirm attendance by email, providing their name, email address, and contact number.",
        methods: [
          { type: "email", label: "Derby City MH Social Care (Meeting Requests)", value: "MHSOCIALCARE@DERBY.GOV.UK" },
          { type: "phone", label: "Derby City MH Social Care Team (Urgent)", value: "01332 640 777" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the S117 meeting request in the patient's notes:",
        clipboardText: "S117 discharge meeting requested on [DATE]. Meeting request form sent to Derby City Mental Health Social Care (MHSOCIALCARE@DERBY.GOV.UK). Proposed meeting date: [MEETING DATE]. Review type: [S117 REVIEW]. Method: [FACE TO FACE / VIRTUAL]. Nurse attending: [NAME]. Awaiting Social Worker confirmation of attendance. Contact: 01332 640 777.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up to confirm Social Worker attendance. The S117 meeting MUST take place before discharge – do not proceed with discharge until confirmed.\n\nIf you have any questions, speak with a member of the leadership team or contact Katie from Social Care directly.",
        checkboxLabel: "I have added the S117 meeting to my job diary and will follow up on Social Worker confirmation",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete completed meeting request forms from your computer if no longer needed. Do not store patient data locally.",
      },
    ],
  },
  "tissue-viability": {
    id: "tissue-viability",
    title: "Tissue Viability",
    description: "Wound care and pressure ulcer concerns",
    icon: "🩹",
    gradient: "from-teal-500 to-teal-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has a wound requiring specialist assessment, pressure damage (category 2+), or is at high risk of pressure injury (Waterlow 15+).",
        checkboxLabel: "I confirm tissue viability referral criteria are met",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download tissue viability referral forms.",
        forms: {
          blank: [
            { label: "TV Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "TV Referral Example", url: "#", note: "Include wound measurements and photos" },
          ],
          otherGuides: [
            { label: "Pressure Ulcer Classification", url: "#" },
            { label: "Waterlow Assessment Guide", url: "#" },
            { label: "Wound Photography Policy", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact the Tissue Viability service:",
        methods: [
          { type: "email", label: "TV Team", value: "tissueviability@nhs.net" },
          { type: "phone", label: "TV Nurse Ext", value: "Ext. 5678" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the TV referral:",
        clipboardText: "Tissue Viability referral submitted on [DATE]. Wound location: [SITE]. Category: [GRADE]. Waterlow score: [SCORE]. Photos attached: [YES/NO]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up for TV review.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Wound photos should be taken with trust equipment and stored appropriately.",
      },
    ],
  },
  "dental": {
    id: "dental",
    title: "Dental Referral",
    description: "Dental care access for inpatients",
    icon: "🦷",
    gradient: "from-cyan-500 to-cyan-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has dental pain, dental infection, or requires dental assessment for care planning purposes.",
        checkboxLabel: "I confirm the patient requires dental referral",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download dental referral information.",
        forms: {
          blank: [
            { label: "Special Care Dentistry Referral", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Dental Referral Example", url: "#", note: "Include MH history and capacity" },
          ],
          otherGuides: [
            { label: "Emergency Dental Access", url: "#" },
            { label: "Oral Health Assessment Guide", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to dental services:",
        methods: [
          { type: "phone", label: "Special Care Dental", value: "01234 567892" },
          { type: "email", label: "Dental Referrals", value: "dental.referrals@nhs.net" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the dental referral:",
        clipboardText: "Dental referral submitted on [DATE]. Reason for referral: [SYMPTOMS]. Capacity for consent: [YES/NO]. Referral sent to Special Care Dentistry via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up for dental appointment.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral form from downloads after submission.",
      },
    ],
  },
  "physio": {
    id: "physio",
    title: "Physiotherapy",
    description: "Physical therapy and mobility assessment",
    icon: "🏃",
    gradient: "from-emerald-500 to-emerald-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has mobility concerns, falls history, physical deconditioning, or requires mobility assessment for discharge planning.",
        checkboxLabel: "I confirm the patient would benefit from physiotherapy input",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download physiotherapy referral forms.",
        forms: {
          blank: [
            { label: "Physio Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "Physio Referral Example", url: "#", note: "Include falls history and mobility level" },
          ],
          otherGuides: [
            { label: "Falls Risk Assessment", url: "#" },
            { label: "Mobility Assessment Guide", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to physiotherapy:",
        methods: [
          { type: "email", label: "Physio Team", value: "physio.referrals@nhs.net" },
          { type: "phone", label: "Physio Dept", value: "Ext. 4567" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the physio referral:",
        clipboardText: "Physiotherapy referral submitted on [DATE]. Reason: [MOBILITY CONCERNS]. Falls in last 12 months: [NUMBER]. Current mobility: [LEVEL]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up for physio assessment.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral form from downloads after submission.",
      },
    ],
  },
  "ot": {
    id: "ot",
    title: "Occupational Therapy",
    description: "OT assessment and functional review",
    icon: "🧩",
    gradient: "from-violet-500 to-violet-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient requires functional assessment, ADL support, equipment needs, or OT input for discharge planning and community living skills.",
        checkboxLabel: "I confirm the patient would benefit from OT assessment",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download OT referral forms.",
        forms: {
          blank: [
            { label: "OT Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "OT Referral Example", url: "#", note: "Include current functional level" },
          ],
          otherGuides: [
            { label: "Functional Assessment Guide", url: "#" },
            { label: "OT Services Overview", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to OT team:",
        methods: [
          { type: "email", label: "OT Team", value: "ot.referrals@nhs.net" },
          { type: "phone", label: "Ward OT", value: "Ext. 3456" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the OT referral:",
        clipboardText: "Occupational Therapy referral submitted on [DATE]. Reason: [FUNCTIONAL CONCERNS]. Goals: [DISCHARGE PLANNING/ADL SUPPORT/EQUIPMENT]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up for OT assessment.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral form from downloads after submission.",
      },
    ],
  },
  "speech-therapy": {
    id: "speech-therapy",
    title: "Speech & Language",
    description: "SALT assessment and swallowing review",
    icon: "💬",
    gradient: "from-purple-500 to-purple-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient has swallowing difficulties (dysphagia), communication difficulties, or requires SALT assessment for safe oral intake.",
        checkboxLabel: "I confirm the patient requires SALT assessment",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download SALT referral forms.",
        forms: {
          blank: [
            { label: "SALT Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "SALT Referral Example", url: "#", note: "Include swallowing observations" },
          ],
          otherGuides: [
            { label: "Dysphagia Screening Guide", url: "#" },
            { label: "Modified Diet Textures", url: "#" },
            { label: "Choking Risk Signs", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to SALT team:",
        methods: [
          { type: "email", label: "SALT Team", value: "salt.referrals@nhs.net" },
          { type: "phone", label: "SALT Urgent", value: "Ext. 2345" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the SALT referral:",
        clipboardText: "Speech and Language Therapy referral submitted on [DATE]. Reason: [SWALLOWING/COMMUNICATION CONCERNS]. Current diet: [TEXTURE]. Concerns observed: [DETAILS]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up for SALT assessment.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral form from downloads after submission.",
      },
    ],
  },
  "edt": {
    id: "edt",
    title: "Early Discharge Team",
    description: "EDT referral for discharge planning support",
    icon: "🚪",
    gradient: "from-sky-500 to-sky-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient is approaching discharge and requires coordination support. EDT can help with complex discharges involving housing, social care, or multi-agency coordination.",
        checkboxLabel: "I confirm the patient would benefit from EDT involvement",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download EDT referral documentation.",
        forms: {
          blank: [
            { label: "EDT Referral Prompt", url: "#", icon: "📄" },
          ],
          wagoll: [],
          otherGuides: [
            { label: "EDT Flow Chart", url: "#" },
            { label: "Discharge Planning Checklist", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact the Early Discharge Team:",
        methods: [
          { type: "email", label: "EDT Referrals", value: "edt.referrals@example.nhs.net" },
          { type: "phone", label: "EDT Office", value: "01onal 234 5678" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the EDT referral:",
        clipboardText: "Early Discharge Team referral submitted on [DATE]. Patient requires EDT support for [HOUSING/SOCIAL CARE/MULTI-AGENCY COORDINATION]. Estimated discharge date: [DATE]. Referral sent via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add EDT follow-up to your job diary.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete referral documentation when no longer needed.",
      },
    ],
  },
  "erp": {
    id: "erp",
    title: "Emotional Regulation (ERP/DBT)",
    description: "DBT skills and emotional regulation pathway",
    icon: "🧠",
    gradient: "from-fuchsia-500 to-fuchsia-700",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient would benefit from Dialectical Behaviour Therapy (DBT) skills training or Structured Clinical Management (SCM). Consider for patients with emotional dysregulation, self-harm, or personality disorder presentations.",
        checkboxLabel: "I confirm the patient meets criteria for ERP/DBT pathway",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download ERP referral forms and patient information.",
        forms: {
          blank: [
            { label: "ERP Referral Form v5", url: "#", icon: "📄" },
            { label: "SV2 Referral Form", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "ERP Referral Example", url: "#", note: "Include history and current presentation" },
          ],

          otherGuides: [
            { label: "DBT Patient Leaflet", url: "#" },
            { label: "SCM Patient Leaflet", url: "#" },
            { label: "Coping with Emotions Leaflet", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the ERP team:",
        methods: [
          { type: "email", label: "ERP Referrals", value: "erp.referrals@example.nhs.net" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the ERP referral:",
        clipboardText: "Emotional Regulation Programme (ERP) referral submitted on [DATE]. Patient referred for [DBT/SCM] pathway. Presentation: [EMOTIONAL DYSREGULATION/SELF-HARM/OTHER]. Referral sent via email.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add ERP follow-up to track assessment date.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Delete completed referral form from your computer.",
      },
    ],
  },
  "ctr-dsp": {
    id: "ctr-dsp",
    title: "CTR / DSP Review",
    description: "Care Treatment Review and Dynamic Support Plan for ASD/LD patients",
    icon: "📋",
    gradient: "from-lime-600 to-lime-800",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "MANDATORY for all patients with Autism Spectrum Disorder (ASD) or Learning Disability (LD). Care Treatment Reviews (CTR) and Dynamic Support Plans (DSP) are required to ensure appropriate care and reduce length of stay.",
        checkboxLabel: "I confirm the patient has ASD or LD and requires CTR/DSP",
      },
      {
        id: "consent",
        type: "consent",
        title: "Patient/Carer Consent",
        content: "Complete the DSP consent form with the patient or their carer/representative. An Easy Read version is available.",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download CTR/DSP referral forms and consent documentation.",
        forms: {
          blank: [
            { label: "JUCD CTR/DSP Referral Form", url: "#", icon: "📄" },
            { label: "DSP Consent Form", url: "#", icon: "📄" },
            { label: "DSP Consent Form (Easy Read)", url: "#", icon: "📄" },
          ],
          wagoll: [
            { label: "DSP Example", url: "#", note: "Shows required level of detail" },
          ],

          otherGuides: [
            { label: "DSP Consent Form Guidance", url: "#" },
            { label: "CTR Process Overview", url: "#" },
            { label: "Keyworking Guidance", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Submit to the JUCD Keyworking Team:",
        methods: [
          { type: "email", label: "JUCD Keyworking", value: "keyworking@example.nhs.net" },
          { type: "phone", label: "Keyworking Team", value: "01onal 234 5678" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the CTR/DSP referral:",
        clipboardText: "CTR/DSP referral submitted to JUCD Keyworking Team on [DATE]. Patient has [AUTISM/LEARNING DISABILITY]. DSP consent [OBTAINED/PENDING]. Referral form completed and sent via [METHOD]. Awaiting keyworker allocation.",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "CTR reviews have specific timescales - add diary entries for follow-up.",
        checkboxLabel: "I have added/updated my job diary for CTR timescales",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Consent forms contain sensitive data - store securely and delete local copies after upload to clinical system.",
      },
    ],
  },
  "benefits-review": {
    id: "benefits-review",
    title: "Benefits Review",
    description: "DWP benefits review and welfare rights support",
    icon: "💷",
    gradient: "from-yellow-600 to-yellow-800",
    steps: [
      {
        id: "criteria",
        type: "criteria",
        title: "Confirm Criteria",
        content: "Patient may need support with benefits claims, DWP assessments, or welfare rights advice. Consider for patients with changes in circumstances, approaching discharge, or financial concerns.",
        checkboxLabel: "I confirm the patient would benefit from welfare rights support",
      },
      {
        id: "forms",
        type: "forms",
        title: "Download Forms & Guides",
        content: "Download benefits review referral information.",
        forms: {
          blank: [
            { label: "Benefits Review Referral", url: "#", icon: "📄" },
          ],
          wagoll: [],

          otherGuides: [
            { label: "Welfare Rights Contact List", url: "#" },
            { label: "Benefits During Hospital Stay", url: "#" },
          ],
        },
      },
      {
        id: "submission",
        type: "submission",
        title: "Submit Referral",
        content: "Contact welfare rights services:",
        methods: [
          { type: "phone", label: "Citizens Advice", value: "0800 144 8848" },
          { type: "email", label: "Trust Welfare Rights", value: "welfare.rights@example.nhs.net" },
        ],
      },
      {
        id: "casenote",
        type: "casenote",
        title: "Case Note Entry",
        content: "Document the benefits review referral:",
        clipboardText: "Benefits review referral made on [DATE]. Patient requires support with [PIP/ESA/UC/OTHER]. Referred to [CITIZENS ADVICE/WELFARE RIGHTS]. Contact made via [METHOD].",
      },
      {
        id: "reminder",
        type: "reminder",
        title: "Follow-up Task",
        content: "Add follow-up for benefits review outcome.",
        checkboxLabel: "",
      },
      {
        id: "gdpr",
        type: "gdpr",
        title: "GDPR Reminder",
        content: "Benefits information is sensitive - handle securely.",
      },
    ],
  },
};

export const STEP_GRADIENTS: Record<string, string> = {
  criteria: "from-emerald-500 to-emerald-700",
  consent: "from-teal-500 to-teal-700",
  section: "from-indigo-500 to-indigo-700",
  area: "from-violet-500 to-violet-700",
  forms: "from-blue-500 to-blue-700",
  submission: "from-purple-500 to-purple-700",
  casenote: "from-amber-500 to-amber-700",
  reminder: "from-orange-500 to-orange-700",
  gdpr: "from-slate-500 to-slate-700",
};

// Default workflow for unmapped referrals
export const DEFAULT_WORKFLOW: WorkflowData = {
  id: "default",
  title: "Referral Workflow",
  description: "Step-by-step referral guidance",
  icon: "📋",
  gradient: "from-slate-500 to-slate-700",
  steps: [
    {
      id: "criteria",
      type: "criteria",
      title: "Confirm Criteria",
      content: "Review the referral criteria and confirm the patient meets the requirements.",
      checkboxLabel: "I confirm the patient meets referral criteria",
    },
    {
      id: "forms",
      type: "forms",
      title: "Download Forms & Guides",
      content: "Download the appropriate forms and guides for your referral.",
      forms: {
        blank: [
          { label: "Blank Referral Form", url: "#", icon: "📄" },
        ],
        wagoll: [
          { label: "Example Referral (WAGOLL)", url: "#", note: "Example only - do not submit" },
        ],
        otherGuides: [
          { label: "Additional Guidance", url: "#" },
        ],
      },
    },
    {
      id: "submission",
      type: "submission",
      title: "Submit Referral",
      content: "Send the completed referral to the appropriate service.",
      methods: [
        { type: "email", label: "Referral Email", value: "referrals@example.nhs.net" },
      ],
    },
    {
      id: "casenote",
      type: "casenote",
      title: "Case Note Entry",
      content: "Copy this text to add to the patient's case notes:",
      clipboardText: "Referral submitted on [DATE] to [SERVICE] via [METHOD]. Reason for referral: [DETAILS]. Reference: [IF GIVEN].",
    },
    {
      id: "reminder",
      type: "reminder",
      title: "Follow-up Task",
      content: "Don't forget to update your job diary.",
      checkboxLabel: "",
    },
    {
      id: "gdpr",
      type: "gdpr",
      title: "GDPR Reminder",
      content: "Delete the completed referral form from your computer. Do not store patient data locally.",
    },
  ],
};

