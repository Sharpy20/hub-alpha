// How-to guide data - extracted from how-to/[id]/page.tsx

export interface GuideStep {
  id: string;
  title: string;
  content: string;
  tip?: string;
}

export interface GuideData {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
}

export const GUIDE_CONFIG: Record<string, { icon: string; gradient: string; category: string }> = {
  news2: { icon: "💪", gradient: "from-red-500 to-red-700", category: "Physical Health" },
  "blood-glucose": { icon: "🩸", gradient: "from-rose-500 to-rose-700", category: "Physical Health" },
  ecg: { icon: "💓", gradient: "from-pink-500 to-pink-700", category: "Physical Health" },
  "neuro-obs": { icon: "🧠", gradient: "from-purple-500 to-purple-700", category: "Observations" },
  "fluid-balance": { icon: "💧", gradient: "from-blue-500 to-blue-700", category: "Observations" },
  "pain-assessment": { icon: "📊", gradient: "from-orange-500 to-orange-700", category: "Observations" },
  choking: { icon: "🚨", gradient: "from-red-600 to-red-800", category: "Emergency Response" },
  "cardiac-arrest": { icon: "❤️‍🔥", gradient: "from-rose-600 to-rose-800", category: "Emergency Response" },
  "mha-statuses": { icon: "⚖️", gradient: "from-indigo-600 to-purple-800", category: "MHA & Legal" },
  "section-17": { icon: "📋", gradient: "from-indigo-500 to-indigo-700", category: "MHA & Legal" },
  "capacity-assessment": { icon: "⚖️", gradient: "from-violet-500 to-violet-700", category: "MHA & Legal" },
  restraint: { icon: "🤝", gradient: "from-slate-500 to-slate-700", category: "MHA & Legal" },
  "admission-checklist": { icon: "✅", gradient: "from-emerald-500 to-emerald-700", category: "Admin" },
  "fridge-temps": { icon: "🌡️", gradient: "from-cyan-500 to-cyan-700", category: "Ward Procedures" },
  "safeguarding-adults-referral": { icon: "🛡️", gradient: "from-red-600 to-red-800", category: "Safeguarding" },
  "safeguarding-children-referral": { icon: "👶", gradient: "from-pink-600 to-pink-800", category: "Safeguarding" },
  "domestic-abuse-guide": { icon: "🏠", gradient: "from-purple-600 to-purple-800", category: "Safeguarding" },
  "peer-conflict-guide": { icon: "⚠️", gradient: "from-amber-600 to-amber-800", category: "Safeguarding" },
  "information-sharing": { icon: "🔗", gradient: "from-blue-600 to-blue-800", category: "Safeguarding" },
  "escalation-pathway": { icon: "📈", gradient: "from-orange-600 to-orange-800", category: "Safeguarding" },
  "online-safety-children": { icon: "🌐", gradient: "from-cyan-600 to-cyan-800", category: "Safeguarding" },
  "honour-based-abuse": { icon: "🛡️", gradient: "from-rose-700 to-rose-900", category: "Safeguarding" },
  "modern-slavery-radicalisation": { icon: "⛓️", gradient: "from-gray-600 to-gray-800", category: "Safeguarding" },
  "faith-belief-abuse": { icon: "🙏", gradient: "from-violet-600 to-violet-800", category: "Safeguarding" },
  "send-safeguarding": { icon: "📚", gradient: "from-teal-600 to-teal-800", category: "Safeguarding" },
  "non-recent-abuse": { icon: "🕰️", gradient: "from-slate-600 to-slate-800", category: "Safeguarding" },
  "special-guardianship": { icon: "👨‍👧", gradient: "from-emerald-600 to-emerald-800", category: "Safeguarding" },
  "child-in-need": { icon: "🤲", gradient: "from-sky-600 to-sky-800", category: "Safeguarding" },
  "abc-chart": { icon: "📋", gradient: "from-amber-500 to-orange-700", category: "Clinical Assessment" },
};

// WAGOLL links for guides that have completed examples
export const GUIDE_WAGOLLS: Record<string, { label: string; url: string }[]> = {
  "abc-chart": [
    { label: "Completed ABC Chart Example", url: "/abc-wagoll.html" },
  ],
};

export const GUIDES: Record<string, GuideData> = {
  news2: {
    id: "news2",
    title: "NEWS2 Observations",
    description: "National Early Warning Score - recognising patient deterioration",
    steps: [
      {
        id: "1",
        title: "Introduction",
        content: "NEWS2 (National Early Warning Score 2) is a standardised approach to assessing acute illness severity. It tracks six physiological parameters to identify patients at risk of deterioration.",
        tip: "NEWS2 should be recorded at least every 12 hours for stable patients, or more frequently if clinically indicated.",
      },
      {
        id: "2",
        title: "The Six Parameters",
        content: "1. Respiration rate (breaths per minute)\n2. Oxygen saturation (%)\n3. Systolic blood pressure (mmHg)\n4. Pulse rate (beats per minute)\n5. Level of consciousness (ACVPU)\n6. Temperature (°C)",
        tip: "For patients on supplemental oxygen, there's an additional 2-point weighting for SpO2.",
      },
      {
        id: "3",
        title: "Scoring Thresholds",
        content: "Each parameter is scored 0-3 based on how far from normal the value is. The scores are then added together.\n\n• 0 = Normal range\n• 1-2 = Mild deviation\n• 3 = Severe deviation",
      },
      {
        id: "4",
        title: "Clinical Response",
        content: "• Score 0-4: Routine monitoring\n• Score 5-6 or single parameter 3: Urgent response\n• Score 7+: Emergency response - immediate clinical review",
        tip: "A score of 3 in any single parameter should trigger an urgent assessment, regardless of total score.",
      },
      {
        id: "5",
        title: "Documentation",
        content: "Record all observations on the NEWS2 chart. Document:\n• Time of observations\n• All six parameters\n• Total NEWS2 score\n• Actions taken if escalating\n• Name and signature",
      },
    ],
  },
  "mha-statuses": {
    id: "mha-statuses",
    title: "Mental Health Act Statuses Explained",
    description: "Understanding the legal framework for patient care under the MHA",
    steps: [
      {
        id: "1",
        title: "Overview",
        content: "The Mental Health Act (MHA) defines the legal framework for a patient's care, classifying them as either informal (voluntary) or formally detained for compulsory assessment or treatment.\n\nKey points:\n\n- A person cannot be detained simply for drug or alcohol addiction, but can be for drug-induced psychosis\n- All patients (informal and detained) have rights to access an Independent Mental Health Advocate (IMHA)\n- Detained patients have additional rights to appeal their detention and have it reviewed by a tribunal\n- 'Mental disorder' under the Act covers conditions including schizophrenia, depression, bipolar disorder, and severe personality disorders",
        tip: "Informal patients are not detained under the MHA. They have voluntarily consented to hospital treatment and can leave at any time (unless a holding power is applied).",
      },
      {
        id: "2",
        title: "Informal (Voluntary)",
        content: "Not formally detained under the MHA. The patient has voluntarily consented to hospital treatment.\n\nKey rights:\n- Free to leave the hospital at any time\n- Can refuse treatment (subject to capacity)\n- Entitled to IMHA support\n- Should be informed of their rights on admission\n\nImportant: informal does not mean 'no rights' or 'no concerns'. Informal patients still have access to advocacy and complaints processes. If an informal patient tries to leave and there are concerns, a Section 5 holding power may be considered.",
        tip: "Informal/voluntary is not a type of detention. These patients have their own set of rights and access to advocacy services.",
      },
      {
        id: "3",
        title: "Section 2 - Assessment",
        content: "Allows detention for up to 28 days for assessment (and treatment during assessment). Usually for a first-time assessment where the diagnosis or treatment plan is not yet clear.\n\nRequirements:\n- Two medical recommendations (one from a Section 12 approved doctor)\n- Application by an Approved Mental Health Professional (AMHP) or nearest relative\n- Patient must have a mental disorder warranting assessment\n- Detention must be in the interests of the patient's health/safety or the protection of others\n\nDuration: Up to 28 days. Cannot be renewed - if further detention is needed, a Section 3 application must be made.\n\nAppeals: Patient can appeal to the Mental Health Tribunal within the first 14 days.",
      },
      {
        id: "4",
        title: "Section 3 - Treatment",
        content: "Allows detention for treatment. Typically used when assessment has already occurred and a treatment plan is in place.\n\nRequirements:\n- Two medical recommendations (one from a Section 12 approved doctor)\n- Application by an AMHP or nearest relative\n- Appropriate treatment must be available\n- Treatment must be necessary for the patient's health/safety or protection of others\n\nDuration: Up to 6 months initially. Can be renewed for a further 6 months, then annually.\n\nAppeals: Patient can appeal to the Mental Health Tribunal once in each detention period. The hospital must also refer to the tribunal if no appeal is made within 6 months.",
      },
      {
        id: "5",
        title: "Section 4 - Emergency Admission",
        content: "An emergency, one-doctor assessment section. Used when there is urgent necessity and waiting for a second medical recommendation would cause undesirable delay.\n\nRequirements:\n- One medical recommendation (ideally from a doctor who knows the patient)\n- Application by an AMHP or nearest relative\n- Urgent necessity for admission\n\nDuration: Up to 72 hours. During this time, a second medical recommendation should be obtained to convert to a Section 2.\n\nNote: Section 4 should only be used in genuine emergencies. If possible, a Section 2 with two doctors is always preferred.",
        tip: "Section 4 is relatively rare. If used, the second medical recommendation should be arranged as soon as possible to convert to Section 2.",
      },
      {
        id: "6",
        title: "Section 5(2) and 5(4) - Holding Powers",
        content: "Allow staff to detain a voluntary patient already in hospital for a short period.\n\nSection 5(2) - Doctor's Holding Power:\n- Applied by the doctor in charge of the patient's treatment (or their nominated deputy)\n- Lasts up to 72 hours\n- Used when a voluntary inpatient needs to be prevented from leaving\n- During this time, an AMHP assessment should be arranged\n\nSection 5(4) - Nurse's Holding Power:\n- Applied by a registered mental health nurse or learning disability nurse\n- Lasts up to 6 hours\n- Used when a doctor is not immediately available\n- The doctor must be contacted immediately to attend\n\nThese holding powers can only be used for patients already receiving inpatient treatment - not for patients in A&E or outpatient settings.",
        tip: "Section 5 cannot be renewed. If further detention is needed, a full MHA assessment under Section 2 or 3 must be arranged during the holding period.",
      },
      {
        id: "7",
        title: "Section 17A - Community Treatment Order (CTO)",
        content: "A patient is discharged from hospital but remains subject to conditions and can be recalled if they stop treatment or their health deteriorates.\n\nRequirements:\n- Patient must be detained under Section 3 (or equivalent)\n- Responsible Clinician and AMHP must agree the CTO is appropriate\n- Treatment must be available in the community\n\nConditions may include:\n- Attending appointments\n- Taking medication\n- Living at a specified address\n- Allowing access to clinical staff\n\nRecall: The Responsible Clinician can recall the patient to hospital if conditions are breached or there is a deterioration.\n\nDuration: Initially 6 months, renewable for 6 months then annually.\n\nAppeals: Patient can appeal to the tribunal once per CTO period.",
      },
      {
        id: "8",
        title: "Forensic Sections (37, 37/41, 47/49)",
        content: "Section 37 - Hospital Order:\nA court orders detention for treatment instead of a prison sentence. Requirements are similar to Section 3 but the order comes from the court.\n\nSection 37/41 - Restricted Hospital Order:\nA Section 37 with restrictions imposed by the Crown Court for public safety. The patient cannot be given leave, transferred, or discharged without the consent of the Secretary of State (via the Ministry of Justice). These patients require enhanced security oversight.\n\nSection 47/49 - Transfer Direction:\nTransfer from prison to hospital with restrictions. The Secretary of State directs that a prisoner be transferred to hospital for treatment. Section 49 adds restrictions similar to Section 41.\n\nNote: Patients under restricted orders have additional governance requirements. Always check with the MHA Office before making any changes to their care plan, leave arrangements, or ward moves.",
        tip: "Forensic sections involve the Ministry of Justice. Never arrange leave or transfer for patients under Section 41 or 49 restrictions without MHA Office approval.",
      },
      {
        id: "9",
        title: "Patient Rights Summary",
        content: "All patients (informal and detained) are entitled to:\n- Access to an Independent Mental Health Advocate (IMHA)\n- Information about their rights (in a language they understand)\n- Access to complaints procedures\n- Respect for dignity and privacy\n\nDetained patients additionally have:\n- Right to appeal to the Mental Health Tribunal\n- Right to have their detention reviewed\n- Right to a second opinion on treatment (SOAD)\n- Right to have their nearest relative informed\n- Right to receive written information about their section\n\nNursing responsibilities:\n- Ensure patients are informed of their rights on admission and at regular intervals\n- Document that rights have been explained\n- Refer to IMHA if the patient requests or would benefit from advocacy\n- Ensure Section papers are correctly completed and filed",
        tip: "Rights must be re-explained at each renewal or change of section. Use the trust's rights leaflets and document that the discussion took place.",
      },
    ],
  },
  "capacity-assessment": {
    id: "capacity-assessment",
    title: "Capacity Assessment",
    description: "Mental Capacity Act 2005 - Assessing decision-making capacity",
    steps: [
      {
        id: "1",
        title: "The Two-Stage Test",
        content: "Stage 1: Is there an impairment of, or disturbance in, the functioning of the person's mind or brain?\n\nStage 2: Does that impairment or disturbance mean the person is unable to make the specific decision at the specific time?",
        tip: "Capacity is decision-specific and time-specific. A person may have capacity for some decisions but not others.",
      },
      {
        id: "2",
        title: "The Functional Test",
        content: "A person is unable to make a decision if they cannot:\n\n1. Understand information relevant to the decision\n2. Retain that information long enough to make the decision\n3. Use or weigh that information as part of decision-making\n4. Communicate their decision",
        tip: "Use all practicable steps to help the person make their own decision before concluding they lack capacity.",
      },
      {
        id: "3",
        title: "Best Interests",
        content: "If a person lacks capacity, any decision made on their behalf must be in their best interests. Consider:\n\n• Past and present wishes\n• Beliefs and values\n• Consultation with family/carers\n• Least restrictive option",
      },
      {
        id: "4",
        title: "Documentation",
        content: "Document your assessment including:\n\n• What decision is being assessed\n• Evidence of impairment/disturbance\n• How you applied the functional test\n• Steps taken to help the person decide\n• Your conclusion and reasoning",
        tip: "A clear, contemporaneous record protects both the patient and the assessor.",
      },
    ],
  },
  "section-17": {
    id: "section-17",
    title: "Section 17 Leave",
    description: "Mental Health Act - Leave of absence from hospital",
    steps: [
      {
        id: "1",
        title: "Who Can Grant Leave?",
        content: "Section 17 leave can only be granted by the Responsible Clinician (RC). The RC may grant leave:\n\n• For a specific period\n• For specific or indefinite occasions\n• Subject to conditions",
        tip: "Leave cannot be granted by anyone other than the RC, including covering consultants without proper handover.",
      },
      {
        id: "2",
        title: "Types of Leave",
        content: "Common leave types include:\n\n• Escorted (staff or family)\n• Unescorted\n• Ground leave\n• Community leave\n• Overnight leave\n• Extended leave (often pre-discharge)",
      },
      {
        id: "3",
        title: "Conditions & Risk Assessment",
        content: "The RC should specify:\n\n• Duration and destination\n• Escort arrangements\n• Contact requirements\n• Recall conditions\n\nA current risk assessment must support the leave decision.",
        tip: "Conditions must be reasonable and proportionate. The patient should understand and agree to them where possible.",
      },
      {
        id: "4",
        title: "Documentation",
        content: "Document in the patient's notes:\n\n• S17 leave form completed and signed by RC\n• Dates/times of leave\n• Any conditions\n• Risk assessment reviewed\n• Patient informed of conditions\n• Copy given to patient",
      },
    ],
  },
  "fridge-temps": {
    id: "fridge-temps",
    title: "Fridge Temperature Recording",
    description: "Daily medication fridge monitoring and Assurance Dashboard recording",
    steps: [
      {
        id: "1",
        title: "When to Check",
        content: "Medication fridge temperatures must be checked and recorded:\n\n• Once daily (Early shift)\n• At approximately the same time each day\n• Before the first medication round if possible\n\nThis is a regulatory requirement for safe medication storage.",
        tip: "Set a reminder or include this as a standing item in your early shift handover.",
      },
      {
        id: "2",
        title: "Acceptable Range",
        content: "The medication fridge must be maintained between:\n\n• Minimum: 2°C\n• Maximum: 8°C\n• Target: 4-5°C\n\nMost medications requiring refrigeration (e.g., insulin, some antibiotics, vaccines) require this range to remain effective.",
        tip: "If the fridge has a min/max thermometer, check both current AND min/max readings since last reset.",
      },
      {
        id: "3",
        title: "Recording on Assurance Dashboard",
        content: "1. Log into FOCUS and navigate to Assurance Dashboard\n2. Select 'Fridge Temperature' audit\n3. Select your ward\n4. Enter the current temperature reading\n5. If min/max available, enter those too\n6. Add any notes if temperature was out of range\n7. Submit the audit\n\nThe dashboard will flag any out-of-range readings automatically.",
        tip: "In Max+ version, completing on the dashboard will auto-complete this task in the Team Diary.",
      },
      {
        id: "4",
        title: "Out of Range - Immediate Actions",
        content: "If temperature is outside 2-8°C:\n\n• Do NOT use medications until resolved\n• Check fridge door seal and closure\n• Check fridge is plugged in and running\n• Check nothing is blocking the vents\n• Do not overcrowd the fridge\n\nIf still out of range after 30 minutes, escalate.",
        tip: "Never store medications in the fridge door compartments - temperature is less stable there.",
      },
      {
        id: "5",
        title: "Escalation",
        content: "If temperature remains out of range:\n\n1. Inform the Nurse in Charge immediately\n2. Contact Pharmacy for medication assessment\n3. Log an incident on Datix if medications may be compromised\n4. Estates may need to repair/replace the fridge\n5. Document all actions in the ward communication book\n\nPharmacy will advise whether affected medications can still be used.",
      },
      {
        id: "6",
        title: "Documentation Summary",
        content: "For each check, record:\n\n• Date and time\n• Current temperature\n• Min/Max readings (if available)\n• Your name/signature\n• Any actions taken if out of range\n\nThe Assurance Dashboard maintains an audit trail for CQC inspections and Trust governance.",
        tip: "Keep a backup paper log on the fridge as well - useful if dashboard is temporarily unavailable.",
      },
    ],
  },
  "safeguarding-adults-referral": {
    id: "safeguarding-adults-referral",
    title: "Making a Good Safeguarding Adults Referral",
    description: "Section 42 Care Act 2014 – when and how to refer",
    steps: [
      {
        id: "1",
        title: "Check the Criteria",
        content: "Section 42 of the Care Act 2014 sets out three conditions – all must apply:\n\n1. The adult has care and support needs (whether or not met by the Local Authority)\n2. The adult is experiencing, or at risk of, abuse or neglect\n3. As a result of those needs, is unable to protect themselves\n\nThere is no 'significant harm' threshold. Action should be proportionate to the risk and wherever possible in line with the person's wishes.",
        tip: "If unsure, ring the DHCFT Safeguarding Advice Line to talk it through. You won't be judged for asking.",
      },
      {
        id: "2",
        title: "10 Categories of Abuse",
        content: "The Care Act recognises these categories:\n\n1. Physical abuse\n2. Emotional/psychological abuse\n3. Sexual abuse\n4. Neglect and acts of omission\n5. Financial or material abuse\n6. Discriminatory abuse\n7. Organisational abuse\n8. Self-neglect\n9. Domestic abuse\n10. Modern slavery\n\nNeglect is the most commonly reported category. Remember: pressure ulcers can be a safeguarding concern.",
      },
      {
        id: "3",
        title: "What to Include",
        content: "Read the referral form questions carefully and answer as fully as possible:\n\n• What have you seen? Where, when?\n• What have you heard? When, who from?\n• Basic info about the adult – what care needs do they have? Why can't they protect themselves?\n• Basic info about the person causing harm – do they have care needs? Position of trust?\n• Why are you worried? What type of abuse?\n• What is the impact now? What if agencies don't get involved?\n• What have you tried already? What protective factors are in place?\n• Separate facts from opinions – state your professional opinion clearly with evidence\n• Does the adult have capacity for this decision?\n• What does the adult want to happen?",
        tip: "You're not telling a story – you're sharing concerns about an adult at risk. Keep them at the centre: what is a day in their life?",
      },
      {
        id: "4",
        title: "Common Pitfalls",
        content: "Avoid these mistakes:\n\nUsing 'Unknown' or leaving answers blank – explain why you don't know.\n\nSanitising language – when quoting someone, use their actual words including swearing. This could become court evidence.\n\nNot enough detail – don't write 'chaotic lifestyle'. Instead: missed last 4 appointments, homeless (sleeping rough? with friends?), 1 litre vodka per day, witnessed X threatening Y.\n\nVictim-blaming language – never imply the adult is responsible for the abuse. Reflect coercion and lack of control.\n\nDelays – if you're worried, refer now. Timely referrals save lives.",
      },
      {
        id: "5",
        title: "Consent",
        content: "Best practice is to get consent before referring. However:\n\n• Don't let consent stop you if you're genuinely worried\n• You can override consent if there's immediate risk of harm or risk to your own safety\n• If you can't get consent, explain why in the referral\n• Always try to inform the person you're making a referral, even if consent wasn't obtained\n• Consider whether the person has capacity to consent",
        tip: "Having consent is ideal but not essential. A referral without consent is better than no referral at all.",
      },
      {
        id: "6",
        title: "Submit the Referral",
        content: "Ring and discuss the case first, then submit the form.\n\nDerbyshire County:\n• Office hours (Mon-Fri 8am-8pm, Sat 9:30am-4pm): Hidden in demo mode\n• Out of hours: Hidden in demo mode\n• Online form: derbyshiresab.org.uk/professionals/safeguarding-adult-referrals\n\nDerby City:\n• MASH (Mon-Fri 9am-5pm): Hidden in demo mode\n• Out of hours (Careline): Hidden in demo mode\n• Email: AdultsMASH@derby.gov.uk\n• Online form: secure.derby.gov.uk/forms/?formid=345",
      },
      {
        id: "7",
        title: "After the Referral",
        content: "Safeguarding is everybody's responsibility – submitting the referral is not the finish line.\n\n• Document the referral in patient notes\n• Log on Datix if required (see criteria in guide)\n• Add a follow-up task to your diary\n• The S.42 enquiry may task your team with further actions\n• If the same concerns keep being raised without resolution, escalate to the Assistant Director of Safeguarding",
        tip: "39% of Derby City and 54% of Derbyshire County referrals become S.42 enquiries. That means many referrals don't meet threshold – but it's always better to refer than to stay silent.",
      },
    ],
  },
  "safeguarding-children-referral": {
    id: "safeguarding-children-referral",
    title: "Safeguarding Children - Starting Point Referral",
    description: "When you're worried about a child (under 18)",
    steps: [
      {
        id: "1",
        title: "When to Refer",
        content: "You should refer when you have concerns about a child (under 18) who may be at risk of:\n\n- Physical abuse or harm\n- Emotional abuse or neglect\n- Sexual abuse or exploitation\n- Neglect (basic needs not met)\n- Domestic abuse in the household\n- Online harm, exploitation or grooming\n- Honour-based abuse, FGM or forced marriage\n- Radicalisation or extremism\n- Modern slavery or trafficking\n\nThis includes children of your patients where parenting capacity may be affected by mental illness, substance use, or domestic abuse.\n\nIf there is immediate risk of harm, call 999 first. If the child is already open to Children's Social Care, contact the allocated worker directly.",
        tip: "Think Family - always consider whether your adult patient has dependent children. Their mental health can directly affect those children's safety.",
      },
      {
        id: "2",
        title: "Think Family",
        content: "On a mental health ward, children's safeguarding often starts with the adult patient:\n\n- Does your patient have children or regular contact with children?\n- Is their mental health affecting their ability to parent safely?\n- Is there domestic abuse in the home?\n- Are there substance misuse concerns?\n- Is there a partner or family member who can keep the children safe?\n- Could the child be a young carer?\n\nYou don't need to be certain harm is happening. Professional concern is enough to refer.\n\nFor children with complexity of need (including mental health, neurodiversity, physical disability and intellectual disability), consider the escalation pathway for additional multi-agency support.",
      },
      {
        id: "3",
        title: "Get Advice First",
        content: "Not sure if the threshold is met? Use the consultation lines before making a formal referral:\n\nDHCFT Safeguarding Unit: Hidden in demo mode\n- Option 1 - Safeguarding Team / Advice Line\n- Option 2 - Child Protection Medicals\n- Option 3 - Child Death Overview Panel\n\nChildren's Social Care consultation:\n- Derbyshire - Starting Point Consultation: Hidden in demo mode (Mon-Fri 10am-4pm)\n- Derby City - Professional Consultation Line: Hidden in demo mode (Mon-Fri 10am-4pm)\n\nRefer to the Threshold Document for guidance on levels of need and when social care involvement is appropriate. Assessment tools (EHA, GCP, DVRIM) are available on the DDSCP Documents Library.",
        tip: "The Threshold Document helps you understand levels of need: universal services, early help, child in need, or child protection. Available on the DDSCP website.",
      },
      {
        id: "4",
        title: "Discuss with Family",
        content: "Best practice is to discuss concerns with the family and gain consent before referring.\n\nHowever, do NOT seek consent if:\n- Doing so would put the child at greater risk\n- Doing so would put you or others at risk\n- It would compromise a police investigation\n- The alleged perpetrator is a family member and may destroy evidence\n\nIf you refer without consent, record your reasons clearly in the referral.\n\nSee 'Making a Referral to Social Care' guidance on the DDSCP website for detailed advice on when consent is and isn't appropriate.",
      },
      {
        id: "5",
        title: "Make the Referral - Urgent",
        content: "For urgent referrals, telephone first then follow up in writing within 48 hours.\n\nDerby City - Initial Response Team (Mon-Fri 9am-5pm): Hidden in demo mode\nDerby City - Out of Hours (Careline): Hidden in demo mode\n\nDerbyshire - Starting Point (Mon-Fri 9am-5pm): Hidden in demo mode\nDerbyshire - Out of Hours: Hidden in demo mode\n\nSave a copy of the referral in the child's health record.\n\nIn your referral include:\n- Child's name, DOB, address, school\n- Parent/carer details\n- Nature of concern - be specific about what you have seen, heard and observed\n- How long concerns have been present\n- Any assessment tools used (EHA, GCP, DVRIM)\n- Whether the family were informed\n- Other agencies involved\n- Your details and contact number\n\nRemember to follow up all telephone referrals within 48 hours using the online referral form. Ensure it is recorded on the clinical system (in Comms & Letters).",
        tip: "Tick 'Referral to Social Services department duty team' on the clinical system when making the referral.",
      },
      {
        id: "6",
        title: "Make the Referral - Written",
        content: "For non-urgent referrals (or as follow-up to a phone call), submit written referrals:\n\nDerby City:\nmyaccount.derby.gov.uk/en/service/report_concerns_about_a_child\n\nDerbyshire:\nDerbyshire Starting Point Referral Form (online)\n\nCases closed within the last three months should also be referred through these links.\n\nDocument in the patient's records and inform relevant agencies. Include all essential information and any assessments that may support the quality of the referral.",
      },
      {
        id: "7",
        title: "After the Referral",
        content: "Children's Social Care should respond within 24 hours of receiving your referral.\n\n- Chase up any outstanding referrals after three working days\n- Document the outcome and update relevant agencies\n- Add a follow-up task to your diary\n- Be prepared for Social Care to contact you for more information\n- If concerns escalate before you hear back, call again\n\nIf you disagree with the decision made by Social Care, use the multi-agency dispute resolution escalation protocol to challenge it. Don't let it go - escalation is your professional responsibility.\n\nRemember: safeguarding children overrides normal patient confidentiality. You do not need the parent's consent to refer if a child may be at risk.",
        tip: "The escalation protocol is available on the DDSCP website. If the same concerns keep being raised without resolution, escalate formally.",
      },
    ],
  },
  "domestic-abuse-guide": {
    id: "domestic-abuse-guide",
    title: "Recognising and Responding to Domestic Abuse",
    description: "Guidance for identifying and supporting patients affected by domestic abuse",
    steps: [
      {
        id: "1",
        title: "What is Domestic Abuse?",
        content: "The Domestic Abuse Act 2021 defines it as behaviour by a person aged 16+ towards someone they are personally connected to, that is:\n\n• Physical or sexual abuse\n• Violent or threatening behaviour\n• Controlling or coercive behaviour\n• Economic abuse\n• Psychological, emotional or other abuse\n\nIt includes behaviour between current or former partners, and between family members. It is not limited to physical violence.",
        tip: "In the year ending March 2019, an estimated 2.4 million people experienced domestic abuse – 1.6 million women and 786,000 men.",
      },
      {
        id: "2",
        title: "Professional Curiosity",
        content: "Professional curiosity means actively trying to understand what's happening, rather than accepting things at face value.\n\n• Test your assumptions about families\n• Consider information from multiple sources\n• See past the obvious\n• Question what you observe and hear\n• Look, listen, ask direct questions, check, and reflect on ALL information\n\nSafeguarding reviews repeatedly highlight failures of professional curiosity. If something doesn't feel right, dig deeper.",
        tip: "Every patient contact is an opportunity to consider domestic abuse – face to face, virtual or phone. The type of contact should not define whether you ask.",
      },
      {
        id: "3",
        title: "Signs to Look For",
        content: "Physical signs:\n• Unexplained injuries or injuries inconsistent with explanation\n• Multiple injuries at different stages of healing\n• Injuries during pregnancy\n\nBehavioural signs:\n• Low self-confidence, withdrawn, submissive\n• Always checking with partner, letting partner speak for them\n• Frequent missed or cancelled appointments\n\nTelephone indicators:\n• Short one-word responses\n• Sense someone is listening on speakerphone\n• Tense discussion of home environment\n\nIn older people:\n• May not identify abuse as abuse\n• Rely on perpetrator for care\n• Injuries attributed to age rather than abuse",
      },
      {
        id: "4",
        title: "Questions You Can Ask",
        content: "These are starting points, not a script – use professional judgement:\n\n• What's life like for you at home?\n• Are there times when you've felt unsafe?\n• Does your partner/family member ever frighten or threaten you?\n• Have you been hurt?\n• All couples argue – how do you resolve conflict?\n• You seem worried about your partner. Can you tell me more?\n• Do you have support from family or friends?\n• Do you have access to money for food, clothes, bills?\n\nIf on the phone: first check if anyone is present or within earshot. Use closed yes/no questions if the patient isn't safe to talk freely.",
        tip: "Concerns that asking about DA may increase risk should never prevent the conversation. Not asking prevents identification of risk entirely.",
      },
      {
        id: "5",
        title: "Responding to Disclosure",
        content: "It can be extremely difficult for someone to disclose. Your response matters.\n\nDO:\n• Be sensitive, non-judgemental, practical, supportive, discreet\n• Prioritise safety over work efficiency\n• Allocate private time and space to listen\n• Recognise that hearing disclosures can be traumatic – seek support yourself\n\nDO NOT:\n• Seek proof of abuse\n• Contact the abuser\n• Promise you can fix it\n• Judge their choices",
      },
      {
        id: "6",
        title: "DASH Risk Assessment",
        content: "If domestic abuse is suspected or disclosed, consider using the CAADA-DASH risk assessment – even when the victim may not recognise it as abuse.\n\nThe DASH helps identify high-risk cases that may need MARAC (Multi-Agency Risk Assessment Conference) referral.\n\nForms available in multiple languages at:\nsaferderbyshire.gov.uk/what-we-do/domestic-abuse/marac/\n\nFor general domestic abuse information and support:\nsaferderbyshire.gov.uk/what-we-do/domestic-abuse/",
      },
      {
        id: "7",
        title: "Where to Get Help",
        content: "For the patient:\n• National DA Helpline: 0808 2000 247 (24hr, free)\n• Safer Derbyshire website for local services\n\nFor professional advice:\n• DHCFT Safeguarding Team: Hidden in demo mode\n• MASH Health Advisors: Hidden in demo mode\n\nIf children are in the household:\n• Always consider a children's safeguarding referral\n• Starting Point: Hidden in demo mode\n\nIn immediate danger: call 999",
        tip: "Document your concerns and actions in the patient's notes. If you suspect DA but the patient doesn't disclose, record your professional concerns and revisit at future contacts.",
      },
    ],
  },
  "peer-conflict-guide": {
    id: "peer-conflict-guide",
    title: "Peer-on-Peer Conflict – When to Escalate",
    description: "Managing patient conflict on the ward and knowing when to make a safeguarding referral",
    steps: [
      {
        id: "1",
        title: "Levels of Conflict",
        content: "Not all conflict is safeguarding. Consider the level:\n\nLow level:\nArguments, irritability, verbal disputes – manage therapeutically through de-escalation and the ward environment.\n\nEscalating:\nThreats, intimidation, persistent bullying – impacting wellbeing and safety. Keep records. Ask yourself: what am I doing to protect this patient?\n\nHigh risk:\nPhysical assault, coercion, sexualised behaviours, targeting of vulnerable patients – these are safeguarding and/or criminal matters.",
        tip: "Rule of thumb: ward-level conflict = manage therapeutically. Conflict causing risk of serious harm = escalate via safeguarding.",
      },
      {
        id: "2",
        title: "When to Make a Referral",
        content: "Escalate to safeguarding when:\n\n• There is risk of significant harm – a patient has been, or is at risk of being, seriously harmed by another patient\n• Power imbalance – a patient lacking capacity is being targeted or exploited (consider a capacity assessment)\n• Repeated incidents – conflict persists despite staff interventions, suggesting a pattern of abuse\n• Sexual safety concerns – any sexual activity on a ward needs careful scrutiny around capacity, consent and risk\n• Neglect – if staff response has been inadequate, raise internally and consider safeguarding\n• Systematic failure – raise internally but consider safeguarding for external scrutiny",
      },
      {
        id: "3",
        title: "Immediate Steps",
        content: "Before or alongside a safeguarding referral:\n\n• Separate the patients immediately\n• Medical review if required\n• Review bed spaces – move patients if necessary\n• Consider observation levels\n• Update risk plans\n• Document the incident factually in EPR and Datix\n• Bring to MDT, ward round, and handover\n• Involve HoN, medics, and Safeguarding Team as needed\n• Open and transparent conversation with family/carers (with consent or best interests)\n• Does the patient have an advocate?\n• Do Police need to be informed?",
        tip: "A risk strategy meeting can be helpful for complex situations before deciding on the referral.",
      },
      {
        id: "4",
        title: "Staff Responsibilities",
        content: "Nursing staff:\n• Immediate response, documentation, de-escalation\n\nWard Manager / Lead Nurse:\n• Lead the review, ensure MDT discussion, coordinate safeguarding referral\n\nSafeguarding Link Nurse/Practitioner:\n• Liaise with Safeguarding Team, support staff with the referral\n\nMedical staff:\n• Review patients, assess capacity, amend risk plans",
      },
      {
        id: "5",
        title: "Making the Referral",
        content: "When making a peer-on-peer safeguarding referral:\n\n• Use patients' full names - not initials\n• Include Police incident number if Police have been informed\n• If consent was not obtained, justify why it was overridden\n• If stating the patient lacks capacity, ensure a referral to advocacy is also made\n• Include what immediate measures have been put in place to prevent further harm\n\nContact:\n• DHCFT Safeguarding Team: Hidden in demo mode\n• MASH Health Advisors: Hidden in demo mode",
      },
    ],
  },
  "information-sharing": {
    id: "information-sharing",
    title: "Information Sharing in Safeguarding",
    description: "Seven golden rules and GDPR guidance for sharing information to protect children and adults",
    steps: [
      {
        id: "1",
        title: "Why Information Sharing Matters",
        content: "Information sharing is essential for effective safeguarding. Poor or absent information sharing is a factor repeatedly identified in Serious Case Reviews where children or adults have been harmed.\n\nFears about sharing information must not stand in the way of safeguarding. Every practitioner must take responsibility for sharing the information they hold - you cannot assume someone else will pass it on.\n\nSharing information can be the difference between life and death.",
        tip: "The GDPR and Data Protection Act 2018 are not barriers to sharing information for safeguarding purposes. They provide a framework to ensure personal information is shared appropriately.",
      },
      {
        id: "2",
        title: "The Seven Golden Rules",
        content: "1. GDPR is not a barrier - it provides a framework for appropriate sharing, not a reason to withhold\n\n2. Be open and honest - tell the individual from the outset why, what, how and with whom information will be shared (unless unsafe to do so)\n\n3. Seek advice - if in doubt, ask your information governance lead or another practitioner without identifying the individual\n\n4. Share with consent where possible - but you may share without consent if there is a lawful basis, such as where safety is at risk\n\n5. Consider safety and wellbeing - base your decisions on the safety of the individual and others affected\n\n6. Necessary, proportionate, relevant, adequate, accurate, timely and secure - only share what is needed, with people who need it\n\n7. Record your decision - whether you share or not, record what you decided and why",
      },
      {
        id: "3",
        title: "When You Can Share Without Consent",
        content: "Under the Data Protection Act 2018, you may share information without consent when:\n\n- There is a lawful basis (e.g. safety may be at risk)\n- You cannot reasonably be expected to gain consent\n- Gaining consent could place a child or adult at risk\n- Safeguarding of children and individuals at risk is a specific condition that allows sharing without consent\n\nRelevant personal information can be shared lawfully if it is to keep a child or individual at risk safe from neglect or physical, emotional or mental harm, or to protect their wellbeing.",
        tip: "If you are sharing without consent, be mindful that the individual may not expect their information to be shared. Record your reasoning clearly.",
      },
      {
        id: "4",
        title: "The Principles in Practice",
        content: "When deciding what to share, apply these principles:\n\nNecessary - only share what is needed, no more\nProportionate - match the level of sharing to the level of risk\nRelevant - only share with people who need the information to act\nAdequate - share enough for the recipient to do their job\nAccurate - clearly distinguish fact from opinion; flag historical information\nTimely - don't delay, especially in emergencies where seeking consent could increase risk\nSecure - follow your organisation's policy on handling personal information",
      },
      {
        id: "5",
        title: "Recording Your Decisions",
        content: "Always record:\n\n- Whether you decided to share or not\n- Your reasons for the decision\n- What information was shared (if sharing)\n- Who it was shared with\n- The purpose of sharing\n\nIf you decided not to share, record why and discuss with the requester.\n\nKeep records in line with your organisation's retention policy. In some rare circumstances information may need to be kept indefinitely, but schedule regular reviews.",
        tip: "A clear record protects you professionally and helps others understand the reasoning if concerns resurface later.",
      },
    ],
  },
  "escalation-pathway": {
    id: "escalation-pathway",
    title: "Escalation Pathway - Complex Children's Cases",
    description: "Bronze, Silver and Gold escalation levels for young people with complex needs",
    steps: [
      {
        id: "1",
        title: "What is the Escalation Pathway?",
        content: "The Derby and Derbyshire Escalation Pathway enables community teams from Social Care, Health and Education to access additional support when formulating care packages for young people with complex histories or presentations.\n\nUse this pathway when:\n- A young person is at risk of admission to Tier 4 services\n- There is severe deterioration of mental health\n- There are frequent attendances at the Children's Emergency Department\n- There are complexities within the care package requiring a joined-up, creative approach\n\nThis pathway works alongside existing CETR (Care, Education and Treatment Review) and LAEP processes - it does not replace them.",
        tip: "Open assessments from community teams should be completed before requesting escalation, where possible.",
      },
      {
        id: "2",
        title: "How to Refer",
        content: "Submit a referral to the Escalation Pathway team via email.\n\nEmail: Hidden in demo mode\nWorking hours: Monday to Friday, 09:00-17:00\n\nThe team will check referrals daily and respond:\n- If appropriate: the team will contact you and allocate an escalation level\n- If not appropriate or incomplete: you will be contacted with a decision or request for further information\n\nConsultation will be booked within 2 weeks of referral received.",
      },
      {
        id: "3",
        title: "Bronze Level",
        content: "Bronze is the initial escalation level for community-referred cases.\n\nWhat happens:\n- Daily discussion with CAMHS Leads and Discharge Coordinators for Acute Hospitals\n- Weekly attendance at CAP for Tier 4 Collaborative\n- Management of referrals by community teams\n- Monitoring of frequent attendance at CED\n- Joint working clarified with agreed action log\n- Enhanced MDMs chaired by Escalation Manager\n\nTimeline: MDM established within 5 working days\nEscalation: To Silver as needed\nAcute referrals: Via discharge coordinator (UHDB/CRH/Tier 4 Collaborative)",
      },
      {
        id: "4",
        title: "Silver Level",
        content: "Silver is for cases requiring strategic facilitation and cross-system coordination.\n\nWhat happens:\n- Cases supported by Complex Case Strategic Facilitator (EMDM)\n- Actions escalated to Head of Service, Area Service Manager CAMHS, General Manager, Commissioner, NHS case manager as required\n- Weekly Silver system meeting\n- Clinical Escalations Group representation for Tier 4 Collaborative\n- Head of Service meetings within local authority as needed\n\nTimeline: EMDM convened within 2 working days\nStep down: To Bronze when stabilised\nEscalation: To Gold as needed",
      },
      {
        id: "5",
        title: "Gold Level",
        content: "Gold is the highest escalation - executive-level oversight.\n\nWhat happens:\n- Weekly (or as-required) Executive Escalation meeting\n- Actions escalated to Directors, General Manager, Collaborative Directors, COO, CEO, Chief Nurse across the system\n- Shadow invitations to partnership agencies from neighbouring localities as needed\n- Email updates given to Executive team across the system for any complex young person\n- Clarification of current system gaps and pressures reported to ICB\n\nDischarge: Informed by Escalation Manager / Complex Case Strategic Facilitator",
        tip: "The escalation pathway team are there to help you navigate the system. Don't hesitate to contact them early - consultation is available before formal escalation.",
      },
    ],
  },
  "online-safety-children": {
    id: "online-safety-children",
    title: "Online Safety and Children",
    description: "Recognising online harms including nudes/semi-nudes, cyberbullying, sextortion and screen time",
    steps: [
      {
        id: "1",
        title: "Online Harms Overview",
        content: "Online harms are a priority area for the Derby and Derbyshire Safeguarding Children Partnership (DDSCP). Key concerns include:\n\n- Sharing of nudes and semi-nude images\n- Online bullying and harassment\n- Sexual exploitation and sextortion\n- Grooming by adults\n- Exposure to harmful or extremist content\n- Excessive screen time affecting development\n- Gaming-related risks\n\nAs a mental health professional, you may be the first person a young person or parent discloses to. Be alert to signs of online harm during every contact with families.",
        tip: "The online landscape changes rapidly. The types of platforms, apps and risks evolve constantly - stay curious about what young people are telling you.",
      },
      {
        id: "2",
        title: "Nudes and Semi-Nudes",
        content: "Sharing nudes or semi-nudes (previously called 'sexting') is when someone shares sexual or naked images of themselves or others electronically.\n\nKey points for practitioners:\n- It is illegal for anyone to possess, share or create indecent images of under-18s, even if the young person consented or created the image themselves\n- Young people may not understand the legal implications\n- Coercion, pressure or manipulation may be involved\n- Images shared once can be re-shared without control\n- The impact on mental health can be severe and long-lasting\n\nIf a young person discloses:\n- Do not view, copy or share the image\n- Do not ask to see it\n- Record what the young person tells you\n- Follow your safeguarding reporting process\n- Consider whether police involvement is needed",
      },
      {
        id: "3",
        title: "Online Bullying",
        content: "Online bullying can include:\n- Sending threatening or abusive messages\n- Deliberately excluding someone from online groups\n- Sharing embarrassing photos or information\n- Creating fake profiles to humiliate someone\n- Persistent negative comments\n- 'Doxxing' (publishing private information)\n\nImpact on young people:\n- Anxiety, depression and self-harm\n- Social withdrawal and school avoidance\n- Sleep disturbance\n- Loss of confidence and self-esteem\n- In severe cases, suicidal thoughts\n\nUnlike face-to-face bullying, online bullying can happen 24/7, can reach a wide audience instantly, and content can be permanent. Always take it seriously.",
        tip: "Ask young people about their online experiences as part of routine mental health assessments. Many won't volunteer this information unless directly asked.",
      },
      {
        id: "4",
        title: "Sextortion",
        content: "Sextortion is when someone threatens to share sexual images or information unless the victim complies with demands - often for money, more images, or sexual acts.\n\nWarning signs:\n- Sudden anxiety or distress, especially when using devices\n- Withdrawal from family and friends\n- Unexplained requests for money\n- Secretive behaviour around devices\n- Signs of distress after using social media\n\nIf a young person is being sextorted:\n- Reassure them it is not their fault\n- Advise them not to pay or send further images\n- Report to the police (101 or 999 if immediate risk)\n- Report to CEOP (ceop.police.uk)\n- Support their mental health - this is traumatic\n- Contact the platform to request removal of content",
      },
      {
        id: "5",
        title: "Screen Time and Development",
        content: "There are clear links between excessive screen time and development problems:\n\n- Delayed speech and language development\n- Communication difficulties\n- Reduced concentration spans\n- Poor sleep\n- Poor mental health\n\nAge-appropriate guidance:\n- Ages 0-5: Limit screen time significantly; prioritise face-to-face interaction\n- Ages 6-10: Set clear boundaries; no screens in bedrooms; screen-free mealtimes\n- Ages 11-17: Agree boundaries together; encourage balance with offline activities\n\nFor parents and carers, the key message is quality over quantity - what children are doing on screens matters as much as how long they spend on them.",
        tip: "Use the 'Top Tips for a Healthier Screen Time' infographic from NHS Leicester Children's Hospital - it is split by age group with practical tips for families.",
      },
      {
        id: "6",
        title: "Resources and Support",
        content: "Key resources for online safety:\n\n- UK Safer Internet Centre (saferinternet.org.uk) - advice for professionals and families\n- CEOP (ceop.police.uk) - report online child sexual exploitation\n- NSPCC (nspcc.org.uk) - guidance on all forms of online abuse\n- Childnet International - resources for young people\n- Internet Watch Foundation - reporting illegal content\n- DDSCP Online Safety resources (ddscp.org.uk)\n\nFor professional advice:\n- DHCFT Safeguarding Unit: Hidden in demo mode\n\nIf a child is in immediate danger, call 999.",
      },
    ],
  },
  "honour-based-abuse": {
    id: "honour-based-abuse",
    title: "Honour-Based Abuse, FGM and Forced Marriage",
    description: "Recognising and responding to honour-based abuse, female genital mutilation and forced marriage",
    steps: [
      {
        id: "1",
        title: "Honour-Based Abuse (HBA)",
        content: "Honour-based abuse is a collection of practices used to control behaviour within families or communities to protect perceived cultural or religious honour.\n\nIt can include:\n- Physical violence (assault, kidnapping, murder)\n- Emotional abuse (threats, isolation, disownment)\n- Forced marriage\n- Female genital mutilation (FGM)\n- Forced abortion or forced pregnancy\n- Restrictions on movement, education or employment\n- Being taken abroad against their will\n\nHBA can affect people of any gender, though women and girls are disproportionately affected. It may involve multiple family members or community figures acting together.\n\nKarma Nirvana (karmanirvana.org.uk) provides specialist support for victims of HBA.",
        tip: "HBA is not a 'cultural issue' to be handled sensitively - it is abuse. Do not attempt family mediation or inform the family of disclosures, as this can increase risk significantly.",
      },
      {
        id: "2",
        title: "Female Genital Mutilation (FGM)",
        content: "FGM involves the partial or total removal of external female genitalia for non-medical reasons. It is illegal in the UK.\n\nKey points:\n- FGM is a criminal offence under the Female Genital Mutilation Act 2003\n- There is a mandatory duty to report FGM in under-18s to the police (since 2015)\n- It is often carried out on girls aged 0-15, frequently before puberty\n- It may be performed abroad during school holidays\n- There is no medical justification for FGM\n\nSigns to look for:\n- Prolonged absence from school or services\n- Behavioural changes - withdrawal, anxiety\n- Difficulty walking, sitting or standing\n- Reluctance to undergo medical examinations\n- Talk of a 'special procedure' or holiday\n\nIf you suspect FGM has occurred or is planned, this is a safeguarding referral and must be reported to the police.",
        tip: "The mandatory reporting duty means you MUST report to the police if you discover FGM has been carried out on a girl under 18. This is a legal requirement, not optional.",
      },
      {
        id: "3",
        title: "Forced Marriage",
        content: "A forced marriage is one where one or both parties do not (or cannot) consent. It is different from an arranged marriage, where both parties freely agree.\n\nForced marriage is illegal in the UK under the Anti-social Behaviour, Crime and Policing Act 2014.\n\nSigns to look for:\n- Absence from services or education\n- Family-related depression, anxiety or self-harm\n- Feeling they are under surveillance by family\n- Talk of an upcoming 'celebration' or 'holiday' abroad\n- Fear of an upcoming school holiday\n- Sudden engagement to a stranger\n- Decline in behaviour or achievement\n\nForced marriage can happen to anyone regardless of gender, age, disability, ethnicity or sexuality. People with learning disabilities are particularly vulnerable.",
      },
      {
        id: "4",
        title: "How to Respond",
        content: "If someone discloses HBA, FGM or forced marriage:\n\nDO:\n- See them alone in a safe, private space\n- Take the disclosure seriously\n- Record their exact words\n- Explain you will need to share this information\n- Make a safeguarding referral\n- Contact the police if there is immediate risk\n\nDO NOT:\n- Contact or inform the family\n- Attempt mediation or family counselling\n- Share information with community members\n- Send the person away to 'think about it'\n- Assume it is a cultural practice to be respected\n- Wait - delays can be dangerous\n\nKey contacts:\n- Karma Nirvana helpline: 0800 5999 247\n- Forced Marriage Unit: 020 7008 0151\n- National FGM Centre: nationalfgmcentre.org.uk\n- Police: 999 (emergency) or 101 (non-emergency)",
        tip: "In HBA cases, the risk often increases after disclosure. Act quickly and do not inform family members under any circumstances.",
      },
    ],
  },
  "modern-slavery-radicalisation": {
    id: "modern-slavery-radicalisation",
    title: "Modern Slavery and Radicalisation",
    description: "Spotting the signs and making referrals for modern slavery and extremism concerns",
    steps: [
      {
        id: "1",
        title: "Modern Slavery",
        content: "Modern slavery includes human trafficking, forced labour, domestic servitude and sexual exploitation. It affects both adults and children in the UK.\n\nSigns to look for:\n- Appears malnourished, unkempt or withdrawn\n- Has injuries that appear to be from assault or restraint\n- Shows signs of being controlled by another person\n- Is not in possession of their own passport, ID or documents\n- Has few or no personal possessions\n- Is not free to come and go\n- Appears frightened or unable to speak for themselves\n- Is collected and dropped off at work by the same person\n- Lives and works at the same address\n- Is reluctant to seek help or disclose information\n\nModern slavery affects people of all ages, nationalities and backgrounds. Mental health patients may be particularly vulnerable.",
        tip: "People who have been trafficked or enslaved may not identify themselves as victims. Approach with professional curiosity and compassion.",
      },
      {
        id: "2",
        title: "Referring Modern Slavery Concerns",
        content: "If you suspect modern slavery:\n\n1. Ensure the person's immediate safety\n2. Make a safeguarding referral (adults or children as appropriate)\n3. Contact the police if there is immediate risk (999) or non-emergency (101)\n4. Consider referring to the National Referral Mechanism (NRM) - the UK framework for identifying and supporting victims\n\nThe NRM referral is made by a 'First Responder' organisation. The Safeguarding Team can support you with this.\n\nLocal guidance: Derby and Derbyshire Modern Slavery Guidance (available on the Safer Derbyshire website)\n\nModern Slavery Helpline: 08000 121 700 (24hr)",
      },
      {
        id: "3",
        title: "Radicalisation and Prevent",
        content: "Radicalisation is the process by which a person comes to support extremism and potentially terrorism. It can happen to anyone regardless of age, gender, ethnicity or background.\n\nSigns to look for:\n- Expressing sympathy for extremist causes or ideologies\n- Glorifying violence\n- Becoming increasingly isolated from friends, family or community\n- Accessing extremist material online\n- Using language or symbols associated with extremist groups\n- Sudden changes in behaviour, friendship groups or appearance\n- Secretive behaviour, especially online\n\nPrevent is the government's strategy to stop people becoming terrorists or supporting terrorism. It is a safeguarding duty, not a surveillance or intelligence function.",
        tip: "Prevent is a pre-criminal space - you are trying to protect someone from being drawn into harm, not report them as a criminal. Approach it like any other safeguarding concern.",
      },
      {
        id: "4",
        title: "Making a Prevent Referral",
        content: "If you have concerns about radicalisation:\n\n1. Discuss with your line manager or safeguarding lead\n2. Contact the DHCFT Safeguarding Team for advice: Hidden in demo mode\n3. If appropriate, make a Prevent referral to the local authority\n4. In an emergency, call 999\n\nA Prevent referral will be reviewed by a multi-agency Channel panel who will assess the level of risk and decide what support is needed.\n\nRemember: you do not need to be certain that someone is being radicalised. If you have concerns, share them. Early intervention is key.\n\nFor more information, see the DDSCP guidance on safeguarding children and young people against radicalisation and violent extremism.",
      },
    ],
  },
  "faith-belief-abuse": {
    id: "faith-belief-abuse",
    title: "Child Abuse Linked to Faith or Belief",
    description: "Recognising abuse linked to faith, belief, spirit possession or witchcraft",
    steps: [
      {
        id: "1",
        title: "What is CALFB?",
        content: "Child Abuse Linked to Faith or Belief (CALFB) is when a belief in concepts like spirit possession, witchcraft, black magic, the evil eye or juju is used to harm a child.\n\nIt can include:\n- Physical abuse (beating, burning, cutting, starvation)\n- Emotional abuse (isolation, blaming the child for misfortune)\n- Neglect (withholding food, medical treatment or education)\n- Sexual abuse\n- Attempts to 'exorcise' the child\n\nThis is not about any one religion, faith or culture. It occurs across many different backgrounds and communities.\n\nChildren may be singled out because of a disability, behavioural difference, illness, bed-wetting, nightmares, or disobedience. A child who is 'different' in any way may be labelled as possessed.",
        tip: "A child will not necessarily recognise that what is happening to them is abuse. They may believe the label given to them and feel responsible for family problems.",
      },
      {
        id: "2",
        title: "Signs to Look For",
        content: "Warning signs that a child may be experiencing CALFB:\n\n- A child described as being 'possessed' or 'evil'\n- The family blaming a child for problems like illness, financial difficulty or relationship breakdown\n- A child being isolated from the rest of the family or community\n- Changes in behaviour following involvement with faith groups or healers\n- Unexplained injuries, particularly burns or marks\n- A child appearing frightened of a parent, carer or religious/community leader\n- Reports of deliverance or exorcism rituals\n- Sudden changes in the child's demeanour or wellbeing\n\nBe professionally curious: if a family talks about a child being cursed or possessed, explore what this means in practice for the child's daily life.",
      },
      {
        id: "3",
        title: "How to Respond",
        content: "If you suspect CALFB:\n\n1. Follow your normal safeguarding procedures - this is child abuse\n2. Record your concerns clearly, including the language used by the family\n3. Contact the DHCFT Safeguarding Team for advice: Hidden in demo mode\n4. Make a referral to Children's Social Care\n5. Do not attempt to challenge or debate the belief directly\n6. Do not dismiss concerns as 'cultural' or 'religious'\n\nChildren's Social Care will work with specialist agencies if needed.\n\nFor more information:\n- National FGM Centre (nationalfgmcentre.org.uk) covers CALFB\n- DDSCP chapter on CALFB (available on the DDSCP website)\n\nIf a child is in immediate danger, call 999.",
        tip: "You do not need to understand or agree with a family's belief system to recognise that a child is being harmed. Focus on the impact on the child.",
      },
    ],
  },
  "send-safeguarding": {
    id: "send-safeguarding",
    title: "SEND and Safeguarding",
    description: "Special Educational Needs and Disability - safeguarding considerations and local resources",
    steps: [
      {
        id: "1",
        title: "Why SEND Matters for Safeguarding",
        content: "Children and young people with special educational needs and disabilities (SEND) are disproportionately vulnerable to abuse and neglect.\n\nThey may:\n- Have difficulty communicating what is happening to them\n- Not recognise abuse or understand it is wrong\n- Be more dependent on caregivers, increasing vulnerability to abuse within the care relationship\n- Have behaviours that mask or are attributed to their disability rather than abuse\n- Be isolated from peers who might otherwise notice and report concerns\n- Be subject to bullying, discrimination or hate crime\n\nSEND covers conditions affecting a child's ability to learn, including learning difficulties, physical disabilities, sensory impairments, communication needs, autism, ADHD, and mental health conditions.",
        tip: "Never attribute signs of abuse to a child's disability without considering whether there could be another explanation. Professional curiosity applies here too.",
      },
      {
        id: "2",
        title: "Trust SEND Policy",
        content: "DHCFT has a SEND policy available on FOCUS that outlines the Trust's responsibilities.\n\nKey principles:\n- All staff should be aware that children with SEND may face additional safeguarding risks\n- Reasonable adjustments should be made when communicating with children and families\n- Consider the child's communication needs when assessing risk or taking disclosures\n- Work collaboratively with education, social care and health services\n- Ensure the child's voice is heard - use appropriate communication methods\n\nThe policy covers the Trust's duties under the Children and Families Act 2014, which reformed the SEND system to give families greater choice and control.",
      },
      {
        id: "3",
        title: "Local SEND Offers",
        content: "Derby and Derbyshire both publish a 'Local Offer' setting out the support available for children and young people with SEND:\n\nDerby City:\n- Derby's SEND Local Offer (derby.gov.uk)\n- Information on education, health and social care services\n\nDerbyshire County:\n- SEND Service Contact Details (localoffer.derbyshire.gov.uk)\n- Derbyshire Information, Advice and Support Service for SEND (derbyshireiass.co.uk)\n\nNational guidance:\n- GOV.UK overview of SEND (gov.uk/children-with-special-educational-needs)\n- NHS England SEND pages (england.nhs.uk)",
      },
      {
        id: "4",
        title: "Making Safeguarding Referrals for Children with SEND",
        content: "When making a safeguarding referral for a child with SEND:\n\n- Clearly describe the child's needs and how they communicate\n- Explain what adaptations may be needed for any assessment or interview\n- Include information about the child's EHCP (Education, Health and Care Plan) if known\n- Note any professionals already involved (SENCO, Educational Psychologist, specialist health services)\n- Describe the child's daily experience - what does life look like for them?\n- Consider whether the child's behaviour changes are related to abuse, not just their condition\n\nUse the standard safeguarding referral pathways. The Safeguarding Team can advise on any additional considerations.",
        tip: "Children with SEND often have multiple professionals involved. Information sharing between agencies is especially important - see the Information Sharing guide.",
      },
    ],
  },
  "non-recent-abuse": {
    id: "non-recent-abuse",
    title: "Non-Recent Abuse Disclosures",
    description: "Responding when adults disclose abuse that happened in childhood",
    steps: [
      {
        id: "1",
        title: "What is Non-Recent Abuse?",
        content: "Non-recent abuse (previously called 'historical abuse') refers to abuse that was experienced in the past, often during childhood. Adults may disclose for the first time during mental health treatment.\n\nImportant principles:\n- There is no time limit for reporting abuse to the police\n- A disclosure of non-recent abuse should be treated with the same seriousness as current abuse\n- The perpetrator may still pose a risk to children or adults now\n- The disclosure may be the first time the person has ever spoken about their experience\n\nA young person under 18 who discloses non-recent abuse should be treated under children's safeguarding procedures.",
        tip: "Many survivors of non-recent abuse have carried their experience for decades. Receiving a disclosure with sensitivity and belief is crucial.",
      },
      {
        id: "2",
        title: "Responding to a Disclosure",
        content: "When an adult discloses non-recent abuse:\n\n- Listen without judgement\n- Believe them - false disclosures are extremely rare\n- Thank them for telling you\n- Do not press for details beyond what they choose to share\n- Explain what will happen next (you may need to share the information)\n- Record their words accurately\n- Consider their current mental health and safety\n\nAsk yourself:\n- Is the alleged perpetrator still alive and potentially in contact with children or vulnerable adults?\n- Are there current safeguarding concerns?\n- Does the person need mental health support for the impact of the abuse?",
      },
      {
        id: "3",
        title: "When to Refer",
        content: "You must consider a safeguarding referral if:\n\n- The alleged perpetrator may still pose a risk to children or vulnerable adults\n- The abuse occurred in an institutional setting (care home, school, hospital)\n- The person wishes to report to the police\n- There are current children in contact with the alleged perpetrator\n\nRefer to the DDSCP guidance: 'Adults who Disclose Non-Recent Abuse' (available on the DDSCP website).\n\nThe Derby and Derbyshire Strategy for Survivors of Non-Recent Abuse in Childhood provides a multi-agency framework for supporting survivors.\n\nFor advice: DHCFT Safeguarding Team - Hidden in demo mode",
        tip: "Even if the perpetrator is deceased, consider whether there may be other victims who could benefit from support, or institutional failures that need addressing.",
      },
      {
        id: "4",
        title: "Supporting the Survivor",
        content: "After a disclosure:\n\n- Offer follow-up support and ensure continuity of care\n- Consider referral to specialist trauma services\n- Share the 'Talking About Non-Recent Abuse' leaflet (available on DDSCP website)\n- Provide information about reporting options - the person should feel in control\n- Document the disclosure and any actions taken\n- Consider your own wellbeing - hearing disclosures can be distressing\n\nPractitioner wellbeing support:\n- Staff Wellbeing and Recognition Team\n- Health Assured (EAP): 0800 028 0199 (24/7)\n- Resolve counselling: Hidden in demo mode\n- Samaritans: 116 123 (24/7)",
      },
    ],
  },
  "special-guardianship": {
    id: "special-guardianship",
    title: "Special Guardianship Orders",
    description: "Best practice guide for achieving permanence through Special Guardianship Orders",
    steps: [
      {
        id: "1",
        title: "What is a Special Guardianship Order?",
        content: "A Special Guardianship Order (SGO) is a legal order that gives a person (the 'special guardian') parental responsibility for a child until they turn 18. It provides permanence without fully severing the legal relationship with the birth parents.\n\nSGOs are typically used when:\n- A child cannot safely live with their birth parents\n- Adoption is not appropriate or desired\n- The child has a strong connection with a relative or family friend\n- Stability and permanence are needed outside the care system\n\nFollowing serious case reviews in Derby and Derbyshire (2023), the DDSCP produced best practice guidance to strengthen SGO assessment and support.",
        tip: "SGOs give the special guardian day-to-day decision-making power, but birth parents retain some parental responsibility. This shared responsibility can create complexity.",
      },
      {
        id: "2",
        title: "Why This Matters on the Ward",
        content: "You may encounter SGOs when:\n- A patient's child is subject to an SGO (the child lives with a special guardian)\n- A patient IS a special guardian and their mental health is affecting their ability to care\n- Family dynamics around an SGO are contributing to a patient's distress\n- A young person under an SGO is admitted or known to services\n\nAs a mental health practitioner, consider:\n- Does the child's placement remain safe and stable?\n- Is the special guardian receiving adequate support?\n- Are there emerging concerns about the child's wellbeing?\n- Should Children's Social Care be informed of changes?",
      },
      {
        id: "3",
        title: "Best Practice Principles",
        content: "The DDSCP best practice guide (October 2024) emphasises:\n\n- Thorough assessment of the prospective special guardian's suitability, capacity and support network\n- Financial support plans should be clear and agreed before the order is made\n- Support should not end when the order is granted - ongoing access to advice and services is essential\n- Regular reviews of the child's welfare\n- Clear contingency planning if the SGO breaks down\n- Multi-agency collaboration between health, education and social care\n\nIf you have concerns about a child under an SGO, follow the standard safeguarding referral process.",
      },
    ],
  },
  "child-in-need": {
    id: "child-in-need",
    title: "Child in Need",
    description: "Multi-agency best practice for meeting the needs of children through CIN arrangements",
    steps: [
      {
        id: "1",
        title: "What is Child in Need?",
        content: "Under Section 17 of the Children Act 1989, a child is 'in need' if:\n- They are unlikely to achieve or maintain a reasonable standard of health or development without provision of services\n- Their health or development is likely to be significantly impaired without services\n- They are disabled\n\nA Child in Need (CIN) plan is a voluntary arrangement - it requires family engagement. It sits below child protection on the continuum of need but still requires active multi-agency involvement.\n\nFollowing serious case reviews in Derby and Derbyshire (2023), the DDSCP produced best practice guidance to strengthen CIN planning and review.",
        tip: "CIN is not 'lower risk' child protection - it is a different framework. Children on CIN plans can still be at significant risk if the plan is not implemented effectively.",
      },
      {
        id: "2",
        title: "Your Role in CIN",
        content: "As a mental health practitioner, you play a key role in CIN arrangements when your patient is a parent or carer.\n\nYour responsibilities:\n- Attend CIN meetings when invited - your input on the parent's mental health is essential\n- Share relevant information about parenting capacity, risk and protective factors\n- Contribute to the CIN plan with clear, measurable actions\n- Provide updates to the allocated social worker on progress or deterioration\n- Alert social care immediately if concerns escalate\n\nConsider:\n- How does the parent's mental health affect their day-to-day parenting?\n- What does life look like for the child when the parent is unwell?\n- What support would help the parent maintain safe parenting?",
      },
      {
        id: "3",
        title: "Best Practice",
        content: "The DDSCP best practice guide (October 2024) highlights:\n\n- CIN plans must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)\n- Reviews should happen at least every 6 weeks\n- The child's voice must be captured - use age-appropriate methods\n- All agencies must be clear about their specific contributions\n- Step-up to child protection or step-down to early help should be timely and evidence-based\n- Drift and delay are the biggest risks in CIN work\n\nIf a CIN plan is not reducing risk effectively, escalate your concerns. Use the DDSCP multi-agency dispute resolution protocol if you disagree with decisions.",
      },
      {
        id: "4",
        title: "Resources",
        content: "Key resources:\n\n- DDSCP Threshold Document - guidance on levels of need\n- DDSCP Assessment Tools Library (Early Help Assessment, GCP, DVRIM, CRE)\n- DDSCP Best Practice Guide: Child in Need (October 2024)\n- DHCFT Safeguarding Team for advice: Hidden in demo mode\n\nConsultation lines:\n- Derbyshire Starting Point: Hidden in demo mode (Mon-Fri 10am-4pm)\n- Derby City Professional Consultation Line: Hidden in demo mode (Mon-Fri 10am-4pm)\n\nEscalation:\n- Multi-agency dispute resolution protocol available on DDSCP website",
        tip: "If you feel a CIN plan is drifting or not reducing risk, you have a professional duty to escalate. The child's wellbeing is everyone's responsibility.",
      },
    ],
  },
  "abc-chart": {
    id: "abc-chart",
    title: "ABC Charts - Antecedent, Behaviour, Consequence",
    description: "Recording and analysing challenging behaviour to identify triggers, patterns and functions",
    steps: [
      {
        id: "1",
        title: "What is an ABC Chart?",
        content: "An ABC chart is a structured observation tool for recording incidents of behaviour that challenges. It captures three elements:\n\nA - Antecedent: what was happening before the behaviour - determines triggers and setting conditions\nB - Behaviour: an exact description of the behaviour itself\nC - Consequence: what happened after - gives an indicator of possible reinforcers\n\nABC charts should be completed for:\n- Verbal aggression\n- Violence or physical aggression\n- Self-harm\n- Agitation or behaviour that challenges\n\nComplete them alongside the session note and Datix. They are frequently requested at panel as supportive evidence to accompany the NPA, so it is crucial they are completed as required.",
        tip: "ABC charts support care planning, risk assessment, future placement decisions and funding applications. Good quality charts make a real difference at panel.\n\nSee a completed example: open the WAGOLL from the link below the guide steps.",
      },
      {
        id: "2",
        title: "Why Do We Use Them?",
        content: "ABC charts help the team to:\n\n- Monitor patterns of behaviour to understand triggers\n- Identify times when behaviour is absent vs present\n- Distinguish fast triggers (immediate provocation) from slow triggers (building over time - sleep, pain, medication, family events)\n- Identify factors that increase and decrease behaviour\n- Understand the possible function of the behaviour\n- Review how staff respond and what works\n\nExample: Barry is noticeably more irritable when supported by male staff compared to female staff when getting up in the morning.\n\nExample: Mary often seeks 1:1 time from staff and when she doesn't feel this need is being met, she begins to express that she wants to harm herself.\n\nExample: Bill de-escalates better with one familiar staff member. He is very sensitive to noise and crowding.",
        tip: "Look for what is different on good days vs bad days. The absence of behaviour is just as important as the behaviour itself.",
      },
      {
        id: "3",
        title: "A - Antecedent (Before)",
        content: "Record what was happening before the incident. On Datix this maps to the Description field.\n\nEnter facts only, not opinions. Include:\n- Where the person was and what they were doing\n- Who else was present\n- What had just happened or been asked of them\n- Any environmental factors (noise, crowding, time of day)\n- The person's apparent mood or state beforehand\n\nExample:\n\"Dale was sitting in the lounge with peer Greg. They appeared to be chatting. Greg's family arrived to visit him, and Dale turned away from him.\"\n\nAlso consider slow triggers:\n- Changes in medication or routine\n- Poor sleep the night before\n- Family visit (or cancelled visit)\n- Staffing changes\n- Pain or physical discomfort",
        tip: "Stick to facts. 'Dale turned away' is observable. 'Dale was jealous' is an interpretation. Record what you saw and heard, not what you think it meant.",
      },
      {
        id: "4",
        title: "B - Behaviour (During)",
        content: "Record exactly what the person did. On Datix this maps to the Immediate Action field.\n\nBe specific and observable - avoid labels or judgements:\n\nGood: \"Dale turned away from Greg and crossed his arms. After a few minutes he got up and started banging on the lounge doors shouting 'it's not fair'\"\n\nNot helpful: \"Dale kicked off\" or \"Dale was aggressive\"\n\nInclude:\n- What the person said (use their actual words)\n- What they physically did, step by step\n- How long the behaviour lasted\n- The intensity (volume, force)\n- Whether it escalated or de-escalated\n- Whether anyone else was affected",
        tip: "Write it so someone who wasn't there can picture exactly what happened. If this ends up as evidence at panel or in court, precision matters.",
      },
      {
        id: "5",
        title: "C - Consequence (After)",
        content: "Record what happened after the behaviour. On Datix this maps to the Contributing Factors field.\n\nInclude:\n- How staff responded and what approach was used\n- De-escalation techniques tried\n- Whether PRN medication was offered or given\n- How the person reacted to the response\n- What the outcome was\n\nExample:\n\"Staff member RN Bean calmly approached Dale and asked if he could help. RN Bean spoke softly and asked if something had upset him. He then made him a cup of tea and sat calmly talking about the Wimbledon final. Dale appeared to relax and spoke about the tennis. He appeared to appreciate the company.\"\n\nAsk yourself: did the behaviour result in the person gaining attention, escaping a task, accessing something they wanted, or sensory stimulation? This helps identify the function.",
        tip: "It's OK to add a reflective thought at the end - e.g. 'I wonder if Dale was feeling left out?' - but clearly separate observation from interpretation.",
      },
      {
        id: "6",
        title: "Functions of Behaviour (SEAT)",
        content: "When analysing ABC data, consider the four common functions of behaviour:\n\nS - Sensory: the behaviour feels good or provides sensory input (rocking, head-banging, skin-picking)\n\nE - Escape: the behaviour helps avoid or escape something unpleasant (a task, a person, a noisy environment)\n\nA - Attention: the behaviour gets a response from others (staff attention, peer reaction, 1:1 time)\n\nT - Tangible: the behaviour results in access to something desired (food, items, activities, a preferred location)\n\nA single behaviour can serve more than one function, and the function may differ depending on the context. Look across multiple ABC records for patterns - the same consequence following the same behaviour often points to the function.",
      },
      {
        id: "7",
        title: "The Datix to S1 Workflow",
        content: "How ABC charts get from Datix into the patient record:\n\n1. Complete the Datix as normal after an incident\n2. Ensure the Description, Immediate Action and Contributing Factors fields are completed with ABC-quality detail\n3. Ward leadership brings the Datix to handover and discusses with staff to ensure all contributing factors are documented\n4. Ward leadership converts the Datix into an ABC chart via the Datix system\n5. The ABC chart is attached to the patient record on the clinical system under Attached Documents\n\nWhat happens with this information:\n- Analysed by the team, looking for patterns\n- Formulating the underlying need that drives the behaviour\n- Meeting that need in other ways to reduce frequency and intensity\n- Trialling more helpful ways of responding\n- Used as evidence at panel for placement and funding decisions",
        tip: "If you're unsure about completing the ABC detail on Datix, raise it in group or individual supervision. Ward leadership can support you.",
      },
    ],
  },
};

export const DEFAULT_GUIDE: GuideData = {
  id: "default",
  title: "Guide",
  description: "Step-by-step guidance",
  steps: [
    {
      id: "1",
      title: "Introduction",
      content: "This guide will walk you through the process step by step.",
    },
    {
      id: "2",
      title: "Step 2",
      content: "Follow the instructions carefully.",
    },
    {
      id: "3",
      title: "Summary",
      content: "You have completed this guide. Remember to document your actions.",
    },
  ],
};
