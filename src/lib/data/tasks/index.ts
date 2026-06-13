import {
  WardTask,
  PatientTask,
  Appointment,
  DiaryTask,
  Patient,
  PatientStatus,
  LegalStatus,
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

// Patient naming function - generates Patient_1 through Patient_20 for each ward
// Ward prefix added for uniqueness across wards
const getPatientName = (ward: string, index: number): string => {
  const wardPrefixes: Record<string, string> = {
    Byron: "BY",
    Shelley: "SH",
    Keats: "KE",
    Wordsworth: "WO",
    Dickinson: "DI",
  };
  return `Patient_${wardPrefixes[ward]}_${index + 1}`;
};

// Legal statuses distribution (weighted for realistic ward mix)
const LEGAL_STATUSES: LegalStatus[] = [
  "informal", "informal", "informal",     // 30% informal/voluntary
  "section_2", "section_2",               // 20% S2 (assessment)
  "section_3", "section_3", "section_3",  // 30% S3 (treatment)
  "cto",                                  // 10% CTO (S17A)
  "section_37",                           // 5% Hospital Order
  "section_5_2",                          // 5% Doctor's Holding Power
];

// Patient statuses distribution
const PATIENT_STATUSES: PatientStatus[] = [
  "active", "active", "active", "active", "active", "active", "active", // 70% active
  "pending_discharge", // 10%
  "on_leave", // 10%
  "discharged", // 10%
];

// Alerts pool - exported for use in Add Patient modal
export const ALERTS_POOL = [
  "Falls risk",
  "DOLS in place",
  "Diabetes - BMs QDS",
  "Allergen: Penicillin",
  "Allergen: Latex",
  "Ligature risk",
  "Absconding risk",
  "Violence history",
  "Self-harm risk",
  "1:1 observations",
  "Nil by mouth",
  "Dysphagia - thickened fluids",
  "Epilepsy",
  "VTE prophylaxis",
  "Pressure ulcer care",
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

// Generate all patients for all wards (20 per ward = 100 total)
const generateAllPatients = (): Patient[] => {
  const patients: Patient[] = [];
  let idCounter = 1;

  for (const ward of WARDS) {
    const staff = WARD_STAFF[ward];
    const doctors = staff.filter(s => s.startsWith("Dr."));
    const nurses = staff.filter(s => !s.startsWith("Dr."));
    // Get eligible ward professionals (staff, lead, manager - not ward_admin/senior_admin)
    const wpCandidates = getWardProfessionalCandidates(ward);
    const wardProfessionals = wpCandidates.length > 0
      ? wpCandidates.map(s => s.name)
      : nurses.slice(0, 4); // Fallback to first 4 nurses

    for (let i = 0; i < 20; i++) {
      const patientName = getPatientName(ward, i);
      const status = PATIENT_STATUSES[i % PATIENT_STATUSES.length];
      const legalStatus = LEGAL_STATUSES[i % LEGAL_STATUSES.length];

      // Assign alerts (some patients have none, some have multiple)
      const alertCount = i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
      const alerts: string[] = [];
      for (let a = 0; a < alertCount; a++) {
        alerts.push(ALERTS_POOL[(i + a) % ALERTS_POOL.length]);
      }

      // Assign ward professional from leads/managers (round-robin)
      const wardProfessional = wardProfessionals[i % wardProfessionals.length];

      const patient: Patient = {
        id: `p${idCounter}`,
        name: patientName,
        room: `Room ${i + 1}`,
        bed: i % 2 === 0 ? "A" : "B",
        ward,
        status,
        legalStatus,
        admissionDate: generateAdmissionDate(i),
        admissionTime: generateAdmissionTime(i),
        namedNurse: nurses[i % nurses.length],
        consultant: doctors[i % doctors.length],
        wardProfessional,
        ...(alerts.length > 0 && { alerts }),
        ...(status === "pending_discharge" && { expectedDischargeDate: tomorrowStr }),
        ...(status === "discharged" && { dischargeDate: yesterdayStr }),
      };

      patients.push(patient);
      idCounter++;
    }
  }

  return patients;
};

// All patients across all wards (100 total: 20 × 5 wards)
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
  { title: "Night observation round", description: "Complete observation checks", priority: "important" as const, shift: "night" as const },
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

// Generate ward tasks - 6 per ward (includes audit tasks)
const generateWardTasks = (ward: string, startId: number): WardTask[] => {
  const staff = WARD_STAFF[ward];
  const tasks: WardTask[] = [];
  let id = startId;

  // Generate 6 ward tasks (reduced for cleaner demo)
  for (let i = 0; i < 6; i++) {
    const template = WARD_TASK_TEMPLATES[i % WARD_TASK_TEMPLATES.length];
    const staffMember = staff[i % staff.length];

    // Determine status: first 3 completed, next 3 in_progress/claimed, rest pending
    let status: "pending" | "in_progress" | "completed" | "overdue" = "pending";
    let claimedBy: string | undefined;
    let claimedAt: string | undefined;
    let completedBy: string | undefined;
    let completedAt: string | undefined;

    if (i < 3) {
      // Completed tasks
      status = "completed";
      completedBy = staffMember;
      completedAt = todayStr;
    } else if (i < 6) {
      // In progress / claimed tasks
      status = "in_progress";
      claimedBy = staffMember;
      claimedAt = todayStr;
    }
    // Rest are pending (unclaimed)

    // Build assurance dashboard URL for audit tasks
    const assuranceDashboardUrl = template.isAuditTask && template.auditType
      ? `${ASSURANCE_DASHBOARD_URL}/audits/${template.auditType.replace(/_/g, "-")}`
      : undefined;

    tasks.push({
      id: `wt${id++}`,
      type: "ward",
      title: template.title,
      description: template.description,
      status,
      priority: template.priority,
      shift: template.shift,
      dueDate: todayStr,
      isRecurring: true,
      recurringDays: template.recurringDays || [0, 1, 2, 3, 4, 5, 6],
      carryOver: false,
      ward,
      createdAt: todayStr,
      createdBy: "System",
      ...(claimedBy && { claimedBy, claimedAt }),
      ...(completedBy && { completedBy, completedAt }),
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
const PATIENT_TASK_TEMPLATES = [
  { title: "IMHA Referral", description: "Refer to advocacy service", category: "referral" as const, priority: "important" as const, linkedReferralId: "imha-advocacy" },
  { title: "Call family", description: "Update family about care plan", category: "family_contact" as const, priority: "routine" as const },
  { title: "Dietitian Referral", description: "Refer for nutritional assessment", category: "referral" as const, priority: "routine" as const, linkedReferralId: "dietitian" },
  { title: "Capacity assessment", description: "Complete capacity to consent assessment", category: "documentation" as const, priority: "urgent" as const, linkedGuideId: "capacity-assessment" },
  { title: "Phone GP surgery", description: "Request medication history", category: "phone_call" as const, priority: "routine" as const },
  { title: "Section 17 leave form", description: "Complete S17 paperwork", category: "documentation" as const, priority: "important" as const, linkedGuideId: "section-17" },
  { title: "Discharge planning meeting", description: "MDT meeting for discharge", category: "discharge_planning" as const, priority: "important" as const },
  { title: "CPA Review preparation", description: "Prepare documentation for CPA", category: "documentation" as const, priority: "routine" as const },
  { title: "Update risk assessment", description: "Review and update risk assessment", category: "documentation" as const, priority: "important" as const, linkedGuideId: "risk-assessment" },
  { title: "Chase blood results", description: "Follow up on blood test results", category: "phone_call" as const, priority: "routine" as const },
  { title: "Care plan review", description: "Review and update care plan", category: "documentation" as const, priority: "routine" as const },
  { title: "Social worker referral", description: "Refer for social care assessment", category: "referral" as const, priority: "important" as const },
  { title: "OT assessment", description: "Arrange occupational therapy assessment", category: "referral" as const, priority: "routine" as const },
  { title: "1:1 nursing notes", description: "Complete 1:1 engagement documentation", category: "documentation" as const, priority: "routine" as const },
  { title: "Medication review", description: "Arrange medication review with doctor", category: "documentation" as const, priority: "important" as const },
  { title: "Weekly weight check", description: "Record weekly weight", category: "documentation" as const, priority: "routine" as const, repeatIntervalDays: 7 },
  { title: "Psychology referral", description: "Refer for psychological assessment", category: "referral" as const, priority: "routine" as const },
  { title: "Section paperwork check", description: "Verify MHA paperwork is in order", category: "documentation" as const, priority: "important" as const },
  { title: "Physical health review", description: "Complete physical health assessment", category: "documentation" as const, priority: "routine" as const, repeatIntervalDays: 14 },
  { title: "Contact CMHT", description: "Liaise with community team", category: "phone_call" as const, priority: "routine" as const },
];

// Generate patient tasks - at least one per patient
const generatePatientTasks = (ward: string, startId: number): PatientTask[] => {
  const wardPatients = DEMO_PATIENTS.filter(p => p.ward === ward && p.status !== "discharged");
  const staff = WARD_STAFF[ward];
  const tasks: PatientTask[] = [];
  let id = startId;

  // Generate tasks for half the patients (cleaner demo)
  const taskPatients = wardPatients.filter((_, idx) => idx % 2 === 0);
  for (let i = 0; i < taskPatients.length; i++) {
    const patient = taskPatients[i];
    const template = PATIENT_TASK_TEMPLATES[i % PATIENT_TASK_TEMPLATES.length];
    const staffMember = staff[i % staff.length];

    // Determine status and dates based on index
    let status: "pending" | "in_progress" | "completed" | "overdue" = "pending";
    let dueDate = todayStr;
    let claimedBy: string | undefined;
    let claimedAt: string | undefined;
    let completedBy: string | undefined;
    let completedAt: string | undefined;

    if (i < 3) {
      // Overdue tasks
      status = "overdue";
      dueDate = i === 0 ? twoDaysAgoStr : yesterdayStr;
    } else if (i < 6) {
      // Completed tasks
      status = "completed";
      completedBy = staffMember;
      completedAt = todayStr;
    } else if (i < 9) {
      // In progress / claimed tasks
      status = "in_progress";
      claimedBy = staffMember;
      claimedAt = todayStr;
    } else if (i < 14) {
      // Pending for today
      status = "pending";
      dueDate = todayStr;
    } else {
      // Future tasks
      status = "pending";
      const futureDays = [tomorrowStr, dayAfterStr, threeDaysStr, fourDaysStr, fiveDaysStr];
      dueDate = futureDays[(i - 14) % futureDays.length];
    }

    tasks.push({
      id: `pt${id++}`,
      type: "patient",
      title: template.title,
      description: `${template.description} for ${patient.name}`,
      status,
      priority: template.priority,
      category: template.category,
      patientId: patient.id,
      patientName: patient.name,
      dueDate,
      carryOver: true,
      ward,
      createdAt: todayStr,
      createdBy: staff[(i + 3) % staff.length], // Different creator
      ...(template.linkedReferralId && { linkedReferralId: template.linkedReferralId }),
      ...(template.linkedGuideId && { linkedGuideId: template.linkedGuideId }),
      ...((template as any).repeatIntervalDays && { repeatIntervalDays: (template as any).repeatIntervalDays }),
      ...(claimedBy && { claimedBy, claimedAt }),
      ...(completedBy && { completedBy, completedAt }),
    });
  }

  return tasks;
};

// Generate appointments for a ward
const generateAppointments = (ward: string, startId: number): Appointment[] => {
  const wardPatients = DEMO_PATIENTS.filter(p => p.ward === ward && p.status !== "discharged");
  const staff = WARD_STAFF[ward];
  const doctors = staff.filter(s => s.startsWith("Dr."));
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
    attendees: [doctors[0], staff[0], "OT"],
    ward,
    createdAt: twoDaysAgoStr,
    createdBy: "System",
    completedAt: yesterdayStr,
    completedBy: doctors[0],
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
    attendees: [doctors[0], "IMHA", "Social Worker", "Legal Rep"],
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
    attendees: [doctors[1] || doctors[0], "Social Worker", "Family"],
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
    attendees: [doctors[0], staff[0], "Social Worker", "OT", "Psychology"],
    ward,
    createdAt: todayStr,
    createdBy: doctors[0],
  });

  return appointments;
};

// Generate all ward tasks (12 per ward × 5 wards = 60 total, includes audit tasks)
const generateAllWardTasks = (): WardTask[] => {
  const tasks: WardTask[] = [];
  let startId = 1;

  for (const ward of WARDS) {
    tasks.push(...generateWardTasks(ward, startId));
    startId += 12;
  }

  return tasks;
};

// Generate all patient tasks (~18 per ward × 5 wards = ~90 total, excludes discharged patients)
const generateAllPatientTasks = (): PatientTask[] => {
  const tasks: PatientTask[] = [];
  let startId = 1;

  for (const ward of WARDS) {
    tasks.push(...generatePatientTasks(ward, startId));
    startId += 20;
  }

  return tasks;
};

// Generate all appointments (7 per ward × 5 wards = 35 total)
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

    // Generate for every other patient (cleaner demo)
    const auditPatients = wardPatients.filter((_, idx) => idx % 2 === 0);
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
