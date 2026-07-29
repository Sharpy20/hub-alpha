import {
  WardTask,
  PatientTask,
  Appointment,
  DiaryTask,
  Patient,
  PatientStatus,
  AuditType,
} from "@/lib/types";
import { WARDS, STAFF_NAMES, getLeadsAndManagers, getWardProfessionalCandidates } from "../staff";
import { toLocalDateStr } from "@/lib/utils/date";

// Re-export WARDS for convenience
export { WARDS };

// Helper to get date strings
const today = new Date();
const formatDate = toLocalDateStr;

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const todayStr = formatDate(today);
const yesterdayStr = formatDate(addDays(today, -1));
const twoDaysAgoStr = formatDate(addDays(today, -2));
const tomorrowStr = formatDate(addDays(today, 1));
const dayAfterStr = formatDate(addDays(today, 2));
const threeDaysStr = formatDate(addDays(today, 3));
const fourDaysStr = formatDate(addDays(today, 4));
const fiveDaysStr = formatDate(addDays(today, 5));

// Staff names - use imported STAFF_NAMES
const WARD_STAFF = STAFF_NAMES;

// Real (fictional) patient names - 5 per ward for now (Mike: 5 max per ward).
// Demo patients are characters from classic novels - the Brontes, George Eliot,
// Elizabeth Gaskell, Thomas Hardy and Dickens. Staff are Jane Austen characters
// (src/lib/data/staff/index.ts) and the wards are poets, so the whole demo cast
// reads as fiction at a glance and cannot be mistaken for a real patient list.
// Deliberately avoided: villains, anyone whose story is about madness or an
// asylum, and Dickens' joke names. Keep new names inside the theme.
const PATIENT_NAMES: Record<string, string[]> = {
  Byron: ["Dorothea Brooke", "Gabriel Oak", "Margaret Hale", "Arthur Clennam", "Esther Summerson"],
  Shelley: ["Silas Marner", "Agnes Wickfield", "Adam Bede", "Amy Dorrit", "John Thornton"],
  Keats: ["Jane Eyre", "Nicholas Nickleby", "Ada Clare", "Tom Pinch", "Bathsheba Everdene"],
  Wordsworth: ["Caroline Helstone", "Herbert Pocket", "Maggie Tulliver", "Daniel Doyce", "Molly Gibson"],
  Dickinson: ["Sydney Carton", "Bella Wilfer", "Caleb Garth", "Diggory Venn", "Thomasin Yeobright"],
};
const getPatientName = (ward: string, index: number): string =>
  PATIENT_NAMES[ward]?.[index] || `Patient ${index + 1}`;

// Consultant psychiatrist per ward (kept out of the ward staff list so the staff
// list stays nurses/leadership; used for patient.consultant + appointments).
// Doctors from novels, to complete the literary theme.
const CONSULTANTS: Record<string, string> = {
  Byron: "Dr. Tertius Lydgate",      // Middlemarch
  Shelley: "Dr. Thomas Thorne",      // Doctor Thorne
  Keats: "Dr. Martin Arrowsmith",    // Arrowsmith
  Wordsworth: "Dr. Allan Woodcourt", // Bleak House
  Dickinson: "Dr. Aziz Ahmed",       // A Passage to India
};

// Patient statuses distribution. NOTE: with only 5 patients per ward the
// round-robin (i % 10) never reaches the non-active slots, so every generated
// patient currently ends up "active". To see pending_discharge / on_leave /
// discharged patients in the demo, either grow PATIENT_NAMES past 7 per ward
// or reorder this list - Mike's call.
const PATIENT_STATUSES: PatientStatus[] = [
  "active", "active", "active", "active", "active", "active", "active", // 70% active
  "pending_discharge", // 10%
  "on_leave", // 10%
  "discharged", // 10%
];

// Generate admission dates (spread over past 3 months)
const generateAdmissionDate = (index: number): string => {
  const daysAgo = Math.floor((index * 5) % 90) + 1;
  return formatDate(addDays(today, -daysAgo));
};

// Generate admission time (spread across the day)
const generateAdmissionTime = (index: number): string => {
  const hours = (8 + (index * 3) % 16).toString().padStart(2, "0");
  const mins = ((index * 17) % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

// Generate all patients for all wards (currently 5 per ward = 25 total, driven by PATIENT_NAMES)
const generateAllPatients = (): Patient[] => {
  const patients: Patient[] = [];
  let idCounter = 1;

  for (const ward of WARDS) {
    const staff = WARD_STAFF[ward];
    const nurses = staff; // all ward staff are nurses/leadership now (consultants are separate)
    // Get eligible ward professionals (staff, lead, manager - not ward_admin/senior_admin)
    const wpCandidates = getWardProfessionalCandidates(ward);
    const wardProfessionals = wpCandidates.length > 0
      ? wpCandidates.map(s => s.name)
      : nurses.slice(0, 4); // Fallback to first 4 nurses

    for (let i = 0; i < (PATIENT_NAMES[ward]?.length || 0); i++) {
      const patientName = getPatientName(ward, i);
      const status = PATIENT_STATUSES[i % PATIENT_STATUSES.length];
      // Assign ward professional from leads/managers (round-robin)
      const wardProfessional = wardProfessionals[i % wardProfessionals.length];

      const patient: Patient = {
        id: `p${idCounter}`,
        name: patientName,
        ward,
        status,
        admissionDate: generateAdmissionDate(i),
        admissionTime: generateAdmissionTime(i),
        namedNurse: nurses[i % nurses.length],
        consultant: CONSULTANTS[ward],
        wardProfessional,
        ...(status === "pending_discharge" && { expectedDischargeDate: tomorrowStr }),
        ...(status === "discharged" && { dischargeDate: yesterdayStr }),
      };

      patients.push(patient);
      idCounter++;
    }
  }

  return patients;
};

// All patients across all wards (currently 25 total: 5 per ward x 5 wards)
export const DEMO_PATIENTS: Patient[] = generateAllPatients();

// Assurance Dashboard base URL (FOCUS internal)
const ASSURANCE_DASHBOARD_URL = "https://focus.derbyshirehealthcareft.nhs.uk/assurance-dashboard";

// Ward task templates for variety (reduced set)
// Tasks marked with isAuditTask: true will show links to Assurance Dashboard
const WARD_TASK_TEMPLATES: Array<{
  title: string;
  description: string;
  priority: "routine" | "important" | "urgent";
  shift: "early" | "late" | "night";
  isAuditTask?: boolean;
  auditType?: AuditType;
  linkedGuideId?: string;
  isNexusLinked?: boolean;
  recurringDays?: number[];
}> = [
  {
    title: "Fridge temperature check",
    description: "Check and record medication fridge temperature on Assurance Dashboard",
    priority: "routine" as const,
    shift: "early" as const,
    isAuditTask: true,
    auditType: "fridge_temps",
    linkedGuideId: "fridge-temps",
    isNexusLinked: true,
  },
  {
    title: "Controlled drugs check",
    description: "Count and verify CD stock with another RN - record on Assurance Dashboard",
    priority: "important" as const,
    shift: "early" as const,
    isAuditTask: true,
    auditType: "controlled_drugs",
    isNexusLinked: true,
  },
  { title: "Daily clinic checks", description: "Complete daily clinical environment checks – documentation, equipment, patient safety board", priority: "important" as const, shift: "early" as const },
  { title: "Safety huddle", description: "Brief team meeting - risks, staffing, priorities", priority: "routine" as const, shift: "early" as const },
  {
    title: "Water temperature check",
    description: "Check hot water outlets and record on Assurance Dashboard",
    priority: "routine" as const,
    shift: "late" as const,
    isAuditTask: true,
    auditType: "water_temps",
    isNexusLinked: true,
    recurringDays: [0],
  },
  { title: "Medication round (PM)", description: "Afternoon medication round", priority: "important" as const, shift: "late" as const },
  { title: "Handover preparation", description: "Prepare handover notes for night staff", priority: "routine" as const, shift: "late" as const },
  {
    title: "Shift change walkaround",
    description: "Complete environmental walkaround and record on Assurance Dashboard",
    priority: "routine" as const,
    shift: "late" as const,
    isAuditTask: true,
    auditType: "walkaround",
    isNexusLinked: true,
  },
  { title: "Night observation round", description: "Complete observation checks", priority: "important" as const, shift: "night" as const, linkedGuideId: "observation-engagement" },
  { title: "Night medication round", description: "Overnight medication round", priority: "important" as const, shift: "night" as const },
  {
    title: "Resus equipment check",
    description: "Daily check of emergency equipment - record on Assurance Dashboard",
    priority: "urgent" as const,
    shift: "early" as const,
    isAuditTask: true,
    auditType: "resus_check",
    isNexusLinked: true,
  },
  {
    title: "Ligature point check",
    description: "Complete ligature point audit and record on Assurance Dashboard",
    priority: "important" as const,
    shift: "night" as const,
    isAuditTask: true,
    auditType: "ligature_check",
    isNexusLinked: true,
  },
];

// Generate ward tasks - currently 1 recurring task per ward (kept light for a cleaner demo)
// Indices into WARD_TASK_TEMPLATES. Fridge temps stays first because the demo
// script opens on it. Water temps (index 4) is deliberately out: it recurs on
// Sundays only, so it would be absent on most days and read as a bug.
const SEEDED_WARD_TEMPLATES = [
  0, // Fridge temperature check - early, routine, audit, guide: fridge-temps
  10, // Resus equipment check - early, urgent, audit
  1, // Controlled drugs check - early, important, audit
  7, // Shift change walkaround - late, routine, audit
  8, // Night observation round - night, important, guide: observation-engagement
];

const generateWardTasks = (ward: string, startId: number): WardTask[] => {
  const tasks: WardTask[] = [];
  let id = startId;

  // A hand-picked few rather than all 12, so the team column reads as a real
  // shift without burying the patient jobs beside it. Chosen to cover all three
  // shifts, all three priorities, and both templates that carry a linked guide -
  // the Night observation round is the only route to observation-engagement, so
  // leaving it out made that link unreachable.
  // All of them stay pending and UNCLAIMED: the demo script's Team Diary stop
  // claims one live (docs/nhs-ready/10b-demo-script.md), and seeding a task
  // already claimed by someone else would change what My Diary filters out.
  for (const i of SEEDED_WARD_TEMPLATES) {
    const template = WARD_TASK_TEMPLATES[i];

    // Build assurance dashboard URL for audit tasks
    const assuranceDashboardUrl = template.isAuditTask && template.auditType
      ? `${ASSURANCE_DASHBOARD_URL}/audits/${template.auditType.replace(/_/g, "-")}`
      : undefined;

    tasks.push({
      id: `wt${id++}`,
      type: "ward",
      title: template.title,
      description: template.description,
      status: "pending",
      priority: template.priority,
      shift: template.shift,
      dueDate: todayStr,
      isRecurring: true,
      recurringDays: template.recurringDays || [0, 1, 2, 3, 4, 5, 6],
      carryOver: false,
      ward,
      createdAt: todayStr,
      createdBy: "System",
      // Audit task fields
      ...(template.isAuditTask && { isAuditTask: true }),
      ...(template.auditType && { auditType: template.auditType }),
      ...(assuranceDashboardUrl && { assuranceDashboardUrl }),
      ...(template.linkedGuideId && { linkedGuideId: template.linkedGuideId }),
      ...(template.isNexusLinked && { isNexusLinked: true }),
    });
  }

  return tasks;
};

// Patient task templates for variety
const PATIENT_TASK_TEMPLATES: {
  title: string;
  description: string;
  category: PatientTask["category"];
  priority: PatientTask["priority"];
  linkedReferralId?: string;
  linkedGuideId?: string;
  repeatIntervalDays?: number;
  // No blocksDischarge here on purpose - every barrier comes from BARRIER_PLAN
  // below, so what /overview shows is exactly what that plan says.
}[] = [
  { title: "IMHA Referral", description: "Refer to advocacy service", category: "referral" as const, priority: "important" as const, linkedReferralId: "imha-advocacy" },
  { title: "Call family", description: "Update family about care plan", category: "family_contact" as const, priority: "routine" as const },
  { title: "Dietitian Referral", description: "Refer for nutritional assessment", category: "referral" as const, priority: "routine" as const, linkedReferralId: "dietitian" },
  { title: "Capacity assessment", description: "Complete capacity to consent assessment", category: "documentation" as const, priority: "urgent" as const, linkedGuideId: "capacity-assessment" },
  { title: "Phone GP surgery", description: "Request medication history", category: "phone_call" as const, priority: "routine" as const },
  { title: "Section 17 leave form", description: "Complete S17 paperwork", category: "documentation" as const, priority: "important" as const, linkedGuideId: "section-17" },
  { title: "Discharge planning meeting", description: "MDT meeting for discharge", category: "discharge_planning" as const, priority: "important" as const, linkedGuideId: "leave-discharge-transfer" },
  { title: "CPA Review preparation", description: "Prepare documentation for CPA", category: "documentation" as const, priority: "routine" as const },
  { title: "Update risk assessment", description: "Review and update risk assessment", category: "documentation" as const, priority: "important" as const, linkedGuideId: "risk-assessment" },
  { title: "Chase blood results", description: "Follow up on blood test results", category: "phone_call" as const, priority: "routine" as const },
  { title: "Care plan review", description: "Review and update care plan", category: "documentation" as const, priority: "routine" as const, linkedGuideId: "care-plan" },
  { title: "Social worker referral", description: "Refer for social care assessment", category: "referral" as const, priority: "important" as const, linkedGuideId: "social-care" },
  { title: "OT assessment", description: "Arrange occupational therapy assessment", category: "referral" as const, priority: "routine" as const, linkedGuideId: "ot" },
  { title: "1:1 nursing notes", description: "Complete 1:1 engagement documentation", category: "documentation" as const, priority: "routine" as const },
  { title: "Medication review", description: "Arrange medication review with doctor", category: "documentation" as const, priority: "important" as const },
  { title: "Weekly weight check", description: "Record weekly weight", category: "documentation" as const, priority: "routine" as const, repeatIntervalDays: 7 },
  { title: "Psychology referral", description: "Refer for psychological assessment", category: "referral" as const, priority: "routine" as const },
  { title: "Section paperwork check", description: "Verify MHA paperwork is in order", category: "documentation" as const, priority: "important" as const, linkedGuideId: "mha-checker" },
  { title: "Physical health review", description: "Complete physical health assessment", category: "documentation" as const, priority: "routine" as const, repeatIntervalDays: 14 },
  { title: "Contact CMHT", description: "Liaise with community team", category: "phone_call" as const, priority: "routine" as const },
];

// ---------------------------------------------------------------------------
// BARRIERS TO DISCHARGE - the data behind /overview
//
// These are deliberately shaped, not random. The trust-wide roll-up only says
// something if the wards look DIFFERENT to each other, so one ward is clearly
// the worst (Dickinson 9) and one is nearly clear (Byron 2). Barriers stack on
// a few patients rather than spreading one each, because that is how it really
// goes - a stuck patient is usually waiting on funding AND a placement AND
// transport, and it keeps the blocked-patient count meaningfully different from
// the barrier count.
//
// Titles are reused across wards on purpose: /overview groups barriers by title
// to show the most common ones trust-wide, and that list is useless if every
// barrier is unique.
//
// To change the spread, edit BARRIER_PLAN below - nothing else generates a
// blocksDischarge task, so what is here is exactly what the screen shows.
// ---------------------------------------------------------------------------

// `guide` links a barrier to the guide that tells you how to shift it. The
// guide then offers to tick the job off, so someone who reaches the guide from
// anywhere still closes the loop in the diary. Only set where a guide genuinely
// covers that job - a wrong link wastes more time than none.
const BARRIER_TYPES = {
  housing: { title: "Housing referral - awaiting decision", description: "Duty to Refer sent, nothing back from the local authority yet", priority: "important", category: "referral", guide: "homeless-discharge" },
  placement: { title: "Supported accommodation - placement search", description: "No placement identified yet", priority: "urgent", category: "discharge_planning" },
  funding: { title: "Funding panel decision", description: "Waiting on the continuing healthcare funding decision", priority: "urgent", category: "discharge_planning" },
  socialCare: { title: "Social care assessment", description: "Care Act assessment requested, not yet allocated", priority: "important", category: "referral", guide: "social-care" },
  careHome: { title: "Care home assessment visit", description: "The home wants to assess before they will offer a bed", priority: "important", category: "discharge_planning" },
  transport: { title: "Discharge transport", description: "Transport not yet booked", priority: "routine", category: "discharge_planning" },
  s117: { title: "S117 aftercare meeting", description: "Aftercare package not yet agreed", priority: "important", category: "discharge_planning", guide: "s117-meeting" },
  cmht: { title: "CMHT allocation", description: "No care coordinator allocated yet", priority: "important", category: "referral" },
  packageOfCare: { title: "Package of care - restart", description: "Restart of the home care package not confirmed", priority: "important", category: "referral" },
} as const;

type BarrierKey = keyof typeof BARRIER_TYPES;

// [patient index on the ward, barrier, days until due (negative = overdue), days since it was raised]
// Ages run back several weeks so the screen can show how long things have been
// stuck without anyone having to regenerate the data.
const BARRIER_PLAN: Record<string, [number, BarrierKey, number, number][]> = {
  // Worst ward - 9 barriers over 3 patients, 2 of them already overdue.
  Dickinson: [
    [0, "funding", -4, 26], [0, "placement", -1, 24], [0, "s117", 5, 12], [0, "transport", 9, 5],
    [1, "housing", 3, 19], [1, "socialCare", 7, 14], [1, "cmht", 12, 9],
    [2, "careHome", 6, 11], [2, "placement", 14, 7],
  ],
  Keats: [
    [0, "housing", -2, 21], [0, "placement", 4, 16], [0, "funding", 8, 16],
    [1, "socialCare", 6, 10], [1, "transport", 11, 4],
    [2, "s117", 5, 13], [2, "packageOfCare", 13, 6],
  ],
  Shelley: [
    [0, "housing", 4, 12], [0, "cmht", 9, 8],
    [1, "careHome", 7, 9], [1, "transport", 13, 3],
  ],
  Wordsworth: [
    [0, "funding", 3, 17], [0, "socialCare", 10, 6],
    [1, "housing", 12, 4],
  ],
  // Nearly clear - the contrast with Dickinson is the point of the screen.
  Byron: [
    [0, "transport", 5, 3],
    [1, "placement", 14, 2],
  ],
};

// Generate patient tasks - at least one per patient
const generatePatientTasks = (ward: string, startId: number): PatientTask[] => {
  const wardPatients = DEMO_PATIENTS.filter(p => p.ward === ward && p.status !== "discharged");
  const staff = WARD_STAFF[ward];
  const tasks: PatientTask[] = [];
  let id = startId;

  // One patient task per day across a short window - keeps the diary to about
  // one item a day for a cleaner demo.
  const spread: { date: string; status: "pending" | "in_progress" | "completed" | "overdue"; claim?: boolean }[] = [
    { date: twoDaysAgoStr, status: "overdue" },
    { date: yesterdayStr, status: "overdue" },
    { date: todayStr, status: "in_progress", claim: true },
    { date: tomorrowStr, status: "pending" },
    { date: dayAfterStr, status: "pending" },
    { date: threeDaysStr, status: "pending" },
    { date: fourDaysStr, status: "pending" },
    { date: fiveDaysStr, status: "pending" },
  ];

  for (let i = 0; i < spread.length && i < wardPatients.length; i++) {
    const patient = wardPatients[i];
    const template = PATIENT_TASK_TEMPLATES[i % PATIENT_TASK_TEMPLATES.length];
    const staffMember = staff[i % staff.length];
    const slot = spread[i];

    tasks.push({
      id: `pt${id++}`,
      type: "patient",
      title: template.title,
      description: `${template.description} for ${patient.name}`,
      status: slot.status,
      priority: template.priority,
      category: template.category,
      patientId: patient.id,
      patientName: patient.name,
      dueDate: slot.date,
      carryOver: true,
      ward,
      createdAt: todayStr,
      createdBy: staff[(i + 3) % staff.length], // Different creator
      ...(template.linkedReferralId && { linkedReferralId: template.linkedReferralId }),
      ...(template.linkedGuideId && { linkedGuideId: template.linkedGuideId }),
      ...(template.repeatIntervalDays && { repeatIntervalDays: template.repeatIntervalDays }),
      ...(slot.claim && { claimedBy: staffMember, claimedAt: todayStr }),
    });
  }

  // Barriers to discharge - see BARRIER_PLAN above.
  (BARRIER_PLAN[ward] || []).forEach(([patientIndex, key, dueIn, raisedDaysAgo], n) => {
    const patient = wardPatients[patientIndex];
    if (!patient) return;
    const barrier = BARRIER_TYPES[key];

    tasks.push({
      id: `pt${id++}`,
      type: "patient",
      title: barrier.title,
      description: `${barrier.description} - ${patient.name}`,
      status: dueIn < 0 ? "overdue" : "pending",
      priority: barrier.priority,
      category: barrier.category,
      patientId: patient.id,
      patientName: patient.name,
      dueDate: formatDate(addDays(today, dueIn)),
      carryOver: true,
      ward,
      createdAt: formatDate(addDays(today, -raisedDaysAgo)),
      createdBy: staff[n % staff.length],
      blocksDischarge: true,
      ...("guide" in barrier && barrier.guide ? { linkedGuideId: barrier.guide } : {}),
    });
  });

  return tasks;
};

// Generate appointments for a ward
const generateAppointments = (ward: string, startId: number): Appointment[] => {
  const wardPatients = DEMO_PATIENTS.filter(p => p.ward === ward && p.status !== "discharged");
  const staff = WARD_STAFF[ward];
  const consultant = CONSULTANTS[ward];
  const appointments: Appointment[] = [];
  let id = startId;

  if (wardPatients.length < 5) return appointments;

  // Past appointment
  appointments.push({
    id: `apt${id++}`,
    type: "appointment",
    title: "Ward Round",
    description: "Weekly consultant ward round",
    status: "completed",
    priority: "important",
    patientId: wardPatients[0].id,
    patientName: wardPatients[0].name,
    appointmentDate: yesterdayStr,
    appointmentTime: "10:00",
    location: "Ward Office",
    attendees: [consultant, staff[0], "OT"],
    ward,
    createdAt: twoDaysAgoStr,
    createdBy: "System",
    completedAt: yesterdayStr,
    completedBy: consultant,
  });

  // Today's appointments
  appointments.push({
    id: `apt${id++}`,
    type: "appointment",
    title: "Tribunal Hearing",
    description: `Mental Health Tribunal for ${wardPatients[0].name}`,
    status: "pending",
    priority: "urgent",
    patientId: wardPatients[0].id,
    patientName: wardPatients[0].name,
    appointmentDate: todayStr,
    appointmentTime: "14:00",
    location: "Conference Room A",
    attendees: [consultant, "IMHA", "Social Worker", "Legal Rep"],
    ward,
    createdAt: "2025-01-10",
    createdBy: "MHA Office",
  });

  // Future appointments
  appointments.push({
    id: `apt${id++}`,
    type: "appointment",
    title: "Discharge Meeting",
    description: "Final discharge planning with family",
    status: "pending",
    priority: "important",
    patientId: wardPatients[2].id,
    patientName: wardPatients[2].name,
    appointmentDate: tomorrowStr,
    appointmentTime: "14:30",
    location: "Family Room",
    attendees: [consultant, "Social Worker", "Family"],
    ward,
    createdAt: todayStr,
    createdBy: staff[1],
  });

  appointments.push({
    id: `apt${id++}`,
    type: "appointment",
    title: "CPA Review",
    description: "Care Programme Approach review meeting",
    status: "pending",
    priority: "important",
    patientId: wardPatients[3].id,
    patientName: wardPatients[3].name,
    appointmentDate: threeDaysStr,
    appointmentTime: "10:00",
    location: "MDT Room",
    attendees: [consultant, staff[0], "Social Worker", "OT", "Psychology"],
    ward,
    createdAt: todayStr,
    createdBy: consultant,
  });

  return appointments;
};

// Generate all ward tasks (currently 1 per ward = 5 total; the startId stride of
// 12 just leaves id gaps, which is harmless)
const generateAllWardTasks = (): WardTask[] => {
  const tasks: WardTask[] = [];
  let startId = 1;

  for (const ward of WARDS) {
    tasks.push(...generateWardTasks(ward, startId));
    startId += 12;
  }

  return tasks;
};

// Generate all patient tasks (up to 8 per ward but capped by patient count, so
// currently 5 per ward = 25 total; excludes discharged patients)
const generateAllPatientTasks = (): PatientTask[] => {
  const tasks: PatientTask[] = [];
  let startId = 1;

  for (const ward of WARDS) {
    tasks.push(...generatePatientTasks(ward, startId));
    startId += 20;
  }

  return tasks;
};

// Generate all appointments (4 per ward x 5 wards = 20 total)
const generateAllAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  let startId = 1;

  for (const ward of WARDS) {
    appointments.push(...generateAppointments(ward, startId));
    startId += 4;
  }

  return appointments;
};

// Generate 72-hour admission audit tasks for active patients
// These are linked to leads/managers and appear under "My Patients" for senior staff
const generateAdmissionAuditTasks = (): PatientTask[] => {
  const tasks: PatientTask[] = [];
  let id = 1;

  for (const ward of WARDS) {
    const wardPatients = DEMO_PATIENTS.filter(p => p.ward === ward && p.status !== "discharged");
    const leadsManagers = getLeadsAndManagers(ward);
    const creatorName = leadsManagers.length > 0 ? leadsManagers[0].name : "System";

    // Just the first couple of patients (kept light - overdue ones carry to today)
    const auditPatients = wardPatients.slice(0, 2);
    for (const patient of auditPatients) {
      // Calculate 72hr deadline from admission
      const admissionDate = new Date(patient.admissionDate);
      const deadline = addDays(admissionDate, 3);
      const deadlineStr = formatDate(deadline);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      // Determine status based on deadline
      let status: "pending" | "completed" | "overdue" = "pending";
      if (deadline < todayDate) {
        // Past deadline - 70% completed, 30% overdue
        status = id % 10 < 7 ? "completed" : "overdue";
      }

      tasks.push({
        id: `audit72-${id++}`,
        type: "patient",
        title: "72-Hour Admission Audit",
        description: `Complete 72-hour post-admission audit for ${patient.name}. Must be completed by senior staff (Lead/Manager) within 72 hours of admission on ${patient.admissionDate} at ${patient.admissionTime || "N/A"}.`,
        status,
        priority: "urgent",
        category: "assessment",
        patientId: patient.id,
        patientName: patient.name,
        dueDate: deadlineStr,
        carryOver: true,
        ward,
        createdAt: patient.admissionDate,
        createdBy: "System",
        ...(status === "completed" && {
          completedBy: creatorName,
          completedAt: formatDate(addDays(admissionDate, 2)),
        }),
      });
    }
  }

  return tasks;
};

// Exported data
export const DEMO_WARD_TASKS: WardTask[] = generateAllWardTasks();
export const DEMO_PATIENT_TASKS: PatientTask[] = generateAllPatientTasks();
export const DEMO_APPOINTMENTS: Appointment[] = generateAllAppointments();
export const DEMO_AUDIT_72HR_TASKS: PatientTask[] = generateAdmissionAuditTasks();

// Combined tasks
export const ALL_DEMO_TASKS: DiaryTask[] = [
  ...DEMO_WARD_TASKS,
  ...DEMO_PATIENT_TASKS,
  ...DEMO_APPOINTMENTS,
  ...DEMO_AUDIT_72HR_TASKS,
];

// Helper functions
export function getTasksForDate(date: string, tasks: DiaryTask[]): DiaryTask[] {
  return tasks.filter((task) => {
    if (task.type === "ward") {
      return task.dueDate === date;
    } else if (task.type === "patient") {
      // Include overdue tasks that haven't been completed (carry over to today)
      if (task.carryOver && task.status !== "completed" && task.status !== "cancelled") {
        const taskDate = new Date(task.dueDate);
        const targetDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If viewing today, include all past incomplete tasks
        if (targetDate.getTime() === today.getTime() && taskDate <= today) {
          return true;
        }
      }
      return task.dueDate === date;
    } else if (task.type === "appointment") {
      return task.appointmentDate === date;
    }
    return false;
  });
}

export function getTasksForWard(ward: string, tasks: DiaryTask[]): DiaryTask[] {
  return tasks.filter((task) => task.ward === ward);
}

export function getPatientById(id: string): Patient | undefined {
  return DEMO_PATIENTS.find((p) => p.id === id);
}

export function getPatientsByWard(ward: string): Patient[] {
  return DEMO_PATIENTS.filter((p) => p.ward === ward);
}

export function getActivePatientsByWard(ward: string): Patient[] {
  return DEMO_PATIENTS.filter((p) => p.ward === ward && p.status !== "discharged");
}

export function getDischargedPatientsByWard(ward: string): Patient[] {
  return DEMO_PATIENTS.filter((p) => p.ward === ward && p.status === "discharged");
}

// Get tasks claimed by a specific staff member
export function getTasksClaimedBy(staffName: string, tasks: DiaryTask[]): DiaryTask[] {
  return tasks.filter((task) => task.claimedBy === staffName);
}

// Get all outstanding tasks for a staff member (claimed and incomplete)
export function getOutstandingTasksFor(staffName: string, tasks: DiaryTask[]): DiaryTask[] {
  return tasks.filter(
    (task) =>
      task.claimedBy === staffName &&
      task.status !== "completed" &&
      task.status !== "cancelled"
  );
}

// Get tasks for a specific patient
export function getTasksForPatient(patientId: string, tasks: DiaryTask[]): DiaryTask[] {
  return tasks.filter(
    (task) =>
      (task.type === "patient" && task.patientId === patientId) ||
      (task.type === "appointment" && task.patientId === patientId)
  );
}
