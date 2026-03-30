"use client";

import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent, Badge, Breadcrumb } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Lightbulb, BookOpen, Pencil, UserPlus } from "lucide-react";
import { useCanEdit } from "@/lib/hooks/useCanEdit";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import { PatientPickerModal } from "@/components/modals";
import { Patient } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

// Guide configurations with colors
const GUIDE_CONFIG: Record<string, { icon: string; gradient: string; category: string }> = {
  news2: { icon: "💪", gradient: "from-red-500 to-red-700", category: "Physical Health" },
  "blood-glucose": { icon: "🩸", gradient: "from-rose-500 to-rose-700", category: "Physical Health" },
  ecg: { icon: "💓", gradient: "from-pink-500 to-pink-700", category: "Physical Health" },
  "neuro-obs": { icon: "🧠", gradient: "from-purple-500 to-purple-700", category: "Observations" },
  "fluid-balance": { icon: "💧", gradient: "from-blue-500 to-blue-700", category: "Observations" },
  "pain-assessment": { icon: "📊", gradient: "from-orange-500 to-orange-700", category: "Observations" },
  choking: { icon: "🚨", gradient: "from-red-600 to-red-800", category: "Emergency Response" },
  "cardiac-arrest": { icon: "❤️‍🔥", gradient: "from-rose-600 to-rose-800", category: "Emergency Response" },
  "rapid-tranq": { icon: "💉", gradient: "from-amber-500 to-amber-700", category: "Emergency Response" },
  "section-17": { icon: "📋", gradient: "from-indigo-500 to-indigo-700", category: "MHA & Legal" },
  "capacity-assessment": { icon: "⚖️", gradient: "from-violet-500 to-violet-700", category: "MHA & Legal" },
  restraint: { icon: "🤝", gradient: "from-slate-500 to-slate-700", category: "MHA & Legal" },
  "admission-checklist": { icon: "✅", gradient: "from-emerald-500 to-emerald-700", category: "Admin" },
  "fridge-temps": { icon: "🌡️", gradient: "from-cyan-500 to-cyan-700", category: "Ward Procedures" },
  "safeguarding-adults-referral": { icon: "🛡️", gradient: "from-red-600 to-red-800", category: "Safeguarding" },
  "safeguarding-children-referral": { icon: "👶", gradient: "from-pink-600 to-pink-800", category: "Safeguarding" },
  "domestic-abuse-guide": { icon: "🏠", gradient: "from-purple-600 to-purple-800", category: "Safeguarding" },
  "peer-conflict-guide": { icon: "⚠️", gradient: "from-amber-600 to-amber-800", category: "Safeguarding" },
};

// Demo guide content - multiple guides
const GUIDES: Record<string, GuideData> = {
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
        content: "Best practice is to get consent before referring. However:\n\n• Don't let consent stop you if you're genuinely worried\n• You can override consent if there's immediate risk of harm or risk to your own safety\n• If you can't get consent, explain why in the referral\n• Always try to inform the person you're making a referral, even if consent wasn't obtained\n• Consider whether the person has capacity to consent – if not, refer for advocacy",
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
    title: "Safeguarding Children – Starting Point Referral",
    description: "When you're worried about a child (under 18)",
    steps: [
      {
        id: "1",
        title: "When to Refer",
        content: "You should refer when you have concerns about a child (under 18) who may be at risk of:\n\n• Physical abuse or harm\n• Emotional abuse or neglect\n• Sexual abuse or exploitation\n• Neglect (basic needs not met)\n\nThis includes children of your patients where parenting capacity may be affected by mental illness, substance use, or domestic abuse.",
        tip: "Think Family – always consider whether your adult patient has dependent children. Their mental health can directly affect those children's safety.",
      },
      {
        id: "2",
        title: "Think Family",
        content: "On a mental health ward, children's safeguarding often starts with the adult patient:\n\n• Does your patient have children or regular contact with children?\n• Is their mental health affecting their ability to parent safely?\n• Is there domestic abuse in the home?\n• Are there substance misuse concerns?\n• Is there a partner or family member who can keep the children safe?\n\nYou don't need to be certain harm is happening. Professional concern is enough to refer.",
      },
      {
        id: "3",
        title: "Contact Starting Point",
        content: "Starting Point is Derby and Derbyshire's contact and referral service for children's safeguarding.\n\n• 24 hours: Hidden in demo mode\n• Non-urgent email: starting.point@derbyshire.gov.uk\n• Online: ddscp.org.uk/worried-about-child/\n\nIn an emergency, always call 999 first.",
      },
      {
        id: "4",
        title: "What to Include",
        content: "When making your referral:\n\n• Child's name, date of birth, address, school\n• Parent/carer details\n• Nature of your concern – be specific\n• How long have concerns been present?\n• What have you observed directly?\n• What has the parent/child told you?\n• Was the parent informed of the referral?\n• Are there other agencies involved?\n• Your details and how to contact you",
      },
      {
        id: "5",
        title: "After the Referral",
        content: "• Document the referral in the patient's notes (the parent is your patient)\n• Note the child's details separately if needed\n• Add a follow-up to your diary\n• Be prepared for Starting Point to contact you for more information\n• If concerns escalate before you hear back, call Starting Point again",
        tip: "Safeguarding children overrides normal patient confidentiality. You do not need the parent's consent to refer if a child may be at risk.",
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
};

// Default guide for unmapped IDs
const DEFAULT_GUIDE: GuideData = {
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

interface GuideStep {
  id: string;
  title: string;
  content: string;
  tip?: string;
}

interface GuideData {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
}

export default function GuidePage() {
  const params = useParams();
  const router = useRouter();
  const { canEdit } = useCanEdit();
  const { user } = useApp();
  const { addTask } = useTasks();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Patient linking state
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [linkedPatient, setLinkedPatient] = useState<Patient | null>(null);

  const guideId = params.id as string;
  const guide = GUIDES[guideId] || DEFAULT_GUIDE;
  const config = GUIDE_CONFIG[guideId] || { icon: "📖", gradient: "from-blue-500 to-blue-700", category: "Guide" };
  const step = guide.steps[currentStep];

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setLinkedPatient(patient);

    // Create a task in the job diary
    const today = new Date().toISOString().split("T")[0];
    addTask({
      id: `task-guide-${Date.now()}`,
      type: "patient",
      title: `${guide.title} - ${patient.name}`,
      category: "other",
      patientName: patient.name,
      ward: patient.ward,
      priority: "routine",
      status: "pending",
      dueDate: today,
      createdAt: today,
      createdBy: user?.name || "Unknown",
      carryOver: true,
      linkedGuideId: guideId,
    });

    // Audit log - production would use backend audit trail
  };

  const handleNext = () => {
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id]);
    }
    if (currentStep < guide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isComplete = currentStep === guide.steps.length - 1;
  const progress = ((currentStep + 1) / guide.steps.length) * 100;

  return (
    <MainLayout>
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: "How-To Guides", href: "/how-to" },
          { label: guide.title },
        ]} />
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/how-to")}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Guides</span>
            </button>
            {canEdit && (
              <Link
                href="/admin/guides"
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors no-underline"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{config.icon}</span>
            </div>
            <div className="flex-1">
              <Badge className="bg-white/20 text-white border-0 mb-1">{config.category}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold">{guide.title}</h1>
              <p className="text-white/80 text-lg">{guide.description}</p>
            </div>
          </div>

          {/* Link to Patient button */}
          <div className="mt-4 pt-4 border-t border-white/20">
            {linkedPatient ? (
              <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{linkedPatient.name}</p>
                    <p className="text-white/70 text-sm">{linkedPatient.ward} Ward - Room {linkedPatient.room}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPatientPicker(true)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPatientPicker(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Link to Patient
              </button>
            )}
            <p className="text-white/80 text-sm text-center mt-2 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Linking creates a job diary task and audit log entry
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {guide.steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step navigation pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {guide.steps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                index === currentStep
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                  : completedSteps.includes(s.id)
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {completedSteps.includes(s.id) ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
              )}
              {s.title}
            </button>
          ))}
        </div>

        {/* Step content */}
        <Card className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
          <CardContent className="py-8 px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                {currentStep + 1}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {step.title}
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              {step.content.split("\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 text-lg mb-4 leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>

            {step.tip && (
              <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl flex items-start gap-4 border border-amber-200">
                <Lightbulb className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 mb-1">Tip</p>
                  <p className="text-amber-700">{step.tip}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side navigation buttons - fixed to viewport edges */}
        {currentStep > 0 && (
          <button
            onClick={handlePrev}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 w-14 h-48 bg-nhs-blue/80 hover:bg-nhs-blue backdrop-blur-sm rounded-r-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:w-16"
            aria-label="Previous step"
          >
            <ArrowLeft className="w-7 h-7 text-white" />
          </button>
        )}
        {!isComplete && (
          <button
            onClick={handleNext}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-14 h-48 bg-nhs-blue/80 hover:bg-nhs-blue backdrop-blur-sm rounded-l-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:w-16"
            aria-label="Next step"
          >
            <ArrowRight className="w-7 h-7 text-white" />
          </button>
        )}

        {/* Completion actions (final step only) */}
        {isComplete && (
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setCompletedSteps([...completedSteps, step.id]);
                router.push("/guides");
              }}
              className="py-4 px-8 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Check className="w-5 h-5 mr-2" />
              Complete Guide
            </Button>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Related Resources
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GUIDE_CONFIG)
              .filter(([id]) => id !== guideId && GUIDE_CONFIG[id]?.category === config.category)
              .slice(0, 3)
              .map(([id, cfg]) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentStep(0);
                    setCompletedSteps([]);
                    router.push(`/how-to/${id}`);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gradient-to-r hover:${cfg.gradient} hover:text-white transition-all border border-gray-200`}
                >
                  {cfg.icon} {id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Patient Picker Modal */}
      <PatientPickerModal
        isOpen={showPatientPicker}
        onClose={() => setShowPatientPicker(false)}
        onSelect={handlePatientSelect}
        title={guide.title}
        type="guide"
      />
    </MainLayout>
  );
}
