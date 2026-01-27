// Ward definitions
export interface Ward {
  id: string;
  name: string;
  poet: string;
}

export const WARDS: Ward[] = [
  { id: "byron", name: "Byron Ward", poet: "Lord Byron" },
  { id: "shelley", name: "Shelley Ward", poet: "Percy Bysshe Shelley" },
  { id: "keats", name: "Keats Ward", poet: "John Keats" },
  { id: "wordsworth", name: "Wordsworth Ward", poet: "William Wordsworth" },
  { id: "dickinson", name: "Dickinson Ward", poet: "Emily Dickinson" },
];

// Bookmark types
export interface Bookmark {
  id: string;
  title: string;
  icon: string;
  url: string;
  category: string;
  requiresFocus: boolean;
  description?: string;
  phone?: string;
}

export const BOOKMARK_CATEGORIES = [
  "Crisis Support",
  "Clinical Systems",
  "HR & Pay",
  "Training & Learning",
  "Policies & Guidance",
  "Communication",
  "External Services",
] as const;

export type BookmarkCategory = (typeof BOOKMARK_CATEGORIES)[number];

// Workflow types
export type WorkflowStepType =
  | "criteria"
  | "form"
  | "wagoll"
  | "guides"
  | "submission"
  | "casenote"
  | "reminder"
  | "gdpr"
  | "complete";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  title: string;
  content: string;
  linkUrl?: string;
  linkText?: string;
  clipboardText?: string;
  options?: { label: string; nextStepId: string }[];
}

export interface Workflow {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  steps: WorkflowStep[];
  blankFormUrl?: string;
  wagollUrl?: string;
  criteriaUrl?: string;
  relatedGuides?: string[];
  relatedBookmarks?: string[];
  submissionMethod: "email" | "phone" | "portal" | "systemon" | "mixed";
  submissionDetails: {
    email?: string;
    phone?: string;
    portalUrl?: string;
    instructions?: string;
  };
  caseNoteTemplate: string;
}

// Guide types
export interface GuideStep {
  id: string;
  content: string;
  imageUrl?: string;
  tip?: string;
}

export interface Guide {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  steps: GuideStep[];
  relatedWorkflows?: string[];
  relatedBookmarks?: string[];
}

// ============================================
// DIARY / TASK TYPES (Medium+ features)
// ============================================

export type ShiftType = "early" | "late" | "night";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled" | "overdue";
export type TaskPriority = "routine" | "important" | "urgent";
export type TaskType = "ward" | "patient" | "appointment";

// Audit task types for Assurance Dashboard integration
export type AuditType =
  | "fridge_temps"
  | "water_temps"
  | "walkaround"
  | "controlled_drugs"
  | "resus_check"
  | "fire_safety"
  | "ligature_check"
  | "other_audit";

// Task category for patient tasks
export type PatientTaskCategory =
  | "referral"
  | "assessment"
  | "phone_call"
  | "documentation"
  | "family_contact"
  | "discharge_planning"
  | "medical_review"
  | "other";

// Base task interface
interface BaseTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  createdBy: string;
  ward: string;
  completedAt?: string;
  completedBy?: string;
  // Task claiming fields
  claimedBy?: string;    // Staff name who claimed this task
  claimedAt?: string;    // Timestamp when claimed
}

// Ward Task - recurring shift tasks
export interface WardTask extends BaseTask {
  type: "ward";
  shift: ShiftType;
  dueDate: string; // The date it's due
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 for days of week
  linkedGuideId?: string;
  carryOver: boolean; // If not done, carry to next shift
  // Audit task fields (for Assurance Dashboard integration)
  isAuditTask?: boolean;
  auditType?: AuditType;
  assuranceDashboardUrl?: string; // FOCUS link to complete audit on dashboard
}

// Patient Task - one-off tasks for specific patients
export interface PatientTask extends BaseTask {
  type: "patient";
  category: PatientTaskCategory;
  patientId?: string;
  patientName?: string;
  dueDate: string;
  linkedReferralId?: string; // Links to referral workflow
  linkedGuideId?: string;
  carryOver: boolean; // If outstanding, moves to today
}

// Appointment - scheduled events
export interface Appointment extends BaseTask {
  type: "appointment";
  patientId?: string;
  patientName?: string;
  appointmentDate: string;
  appointmentTime: string; // "AM", "PM", or specific time like "14:30"
  location?: string;
  attendees?: string[];
  linkedReferralId?: string; // Links to referral workflow (e.g., "For Tribunal, see IMHA workflow")
  linkedGuideId?: string;    // Links to how-to guide (e.g., "Tribunal Preparation guide")
}

// Union type for all tasks
export type DiaryTask = WardTask | PatientTask | Appointment;

// Task icons and colors by category
export const TASK_CATEGORY_CONFIG: Record<PatientTaskCategory, { icon: string; gradient: string; label: string }> = {
  referral: { icon: "📋", gradient: "from-indigo-500 to-indigo-700", label: "Referral" },
  assessment: { icon: "📊", gradient: "from-violet-500 to-violet-700", label: "Assessment" },
  phone_call: { icon: "📞", gradient: "from-green-500 to-green-700", label: "Phone Call" },
  documentation: { icon: "📝", gradient: "from-amber-500 to-amber-700", label: "Documentation" },
  family_contact: { icon: "👨‍👩‍👧", gradient: "from-pink-500 to-pink-700", label: "Family Contact" },
  discharge_planning: { icon: "🏠", gradient: "from-teal-500 to-teal-700", label: "Discharge Planning" },
  medical_review: { icon: "👨‍⚕️", gradient: "from-purple-500 to-purple-700", label: "Medical Review" },
  other: { icon: "📌", gradient: "from-gray-500 to-gray-700", label: "Other" },
};

// Audit type configuration for Assurance Dashboard tasks
export const AUDIT_TYPE_CONFIG: Record<AuditType, { icon: string; gradient: string; label: string; dashboardPath?: string }> = {
  fridge_temps: { icon: "🌡️", gradient: "from-cyan-500 to-cyan-700", label: "Fridge Temps", dashboardPath: "/audits/fridge-temperature" },
  water_temps: { icon: "💧", gradient: "from-blue-500 to-blue-700", label: "Water Temps", dashboardPath: "/audits/water-temperature" },
  walkaround: { icon: "🚶", gradient: "from-emerald-500 to-emerald-700", label: "Walkaround", dashboardPath: "/audits/shift-walkaround" },
  controlled_drugs: { icon: "💊", gradient: "from-rose-500 to-rose-700", label: "Controlled Drugs", dashboardPath: "/audits/controlled-drugs" },
  resus_check: { icon: "❤️‍🩹", gradient: "from-red-500 to-red-700", label: "Resus Check", dashboardPath: "/audits/resus-equipment" },
  fire_safety: { icon: "🔥", gradient: "from-orange-500 to-orange-700", label: "Fire Safety", dashboardPath: "/audits/fire-safety" },
  ligature_check: { icon: "🔍", gradient: "from-slate-500 to-slate-700", label: "Ligature Check", dashboardPath: "/audits/ligature-points" },
  other_audit: { icon: "📋", gradient: "from-gray-500 to-gray-700", label: "Other Audit" },
};

export const SHIFT_CONFIG: Record<ShiftType, { label: string; icon: string; time: string; gradient: string }> = {
  early: { label: "Early", icon: "🌅", time: "07:00 - 14:30", gradient: "from-amber-400 to-orange-500" },
  late: { label: "Late", icon: "🌇", time: "14:00 - 21:30", gradient: "from-orange-500 to-red-500" },
  night: { label: "Night", icon: "🌙", time: "21:00 - 07:30", gradient: "from-indigo-600 to-purple-700" },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; icon: string; color: string }> = {
  routine: { label: "Routine", icon: "🟢", color: "text-green-600" },
  important: { label: "Important", icon: "🟡", color: "text-amber-600" },
  urgent: { label: "Urgent", icon: "🔴", color: "text-red-600" },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: string; bgColor: string }> = {
  pending: { label: "Pending", icon: "⏳", bgColor: "bg-gray-100" },
  in_progress: { label: "In Progress", icon: "🔄", bgColor: "bg-blue-100" },
  completed: { label: "Completed", icon: "✅", bgColor: "bg-green-100" },
  cancelled: { label: "Cancelled", icon: "❌", bgColor: "bg-gray-200" },
  overdue: { label: "Overdue", icon: "⚠️", bgColor: "bg-red-100" },
};

// ============================================
// PATIENT TYPES (Max+ features)
// ============================================

export type PatientStatus = "active" | "pending_discharge" | "discharged" | "on_leave";
export type LegalStatus = "informal" | "section_2" | "section_3" | "section_37" | "section_17_leave" | "cto";

export interface Patient {
  id: string;
  name: string;
  preferredName?: string;
  room: string;
  bed?: string;
  ward: string;
  status: PatientStatus;
  legalStatus: LegalStatus;
  admissionDate: string;
  expectedDischargeDate?: string;
  dischargeDate?: string;
  dischargeConfirmed?: boolean;
  dischargeConfirmedBy?: string;
  dischargeConfirmedAt?: string;
  namedNurse?: string;
  consultant?: string;
  diagnoses?: string[];
  alerts?: string[]; // e.g., "Falls risk", "Allergen: Penicillin"
}

// ============================================
// USER TYPES
// ============================================

export type UserRole = "normal" | "ward_admin" | "contributor" | "senior_admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  ward: string;
}

// Demo data for users
export const DEMO_USERS: Omit<User, "id">[] = [
  { name: "Sarah Johnson", role: "normal", ward: "Byron" },
  { name: "Mike Chen", role: "ward_admin", ward: "Byron" },
  { name: "Emma Wilson", role: "contributor", ward: "Byron" },
  { name: "Dr. James Patel", role: "senior_admin", ward: "Byron" },
];

// Staff member for ward management
export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  ward: string;
  isActive: boolean;
}
