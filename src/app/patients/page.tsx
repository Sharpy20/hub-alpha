"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useV2Href } from "@/lib/hooks/useV2";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import { useWardSettings } from "@/app/ward-settings-provider";
import { toLocalDateStr } from "@/lib/utils/date";
import { MainLayout } from "@/components/layout";
import { Card } from "@/components/ui";
import { PatientTransferModal, DischargeAuditModal, PatientTasksModal, TaskDetailModal, BulkPatientTasksModal, CareReviewModal } from "@/components/modals";
import {
  CareTracker, PatientTracker, REVIEW_ITEMS, loadTracker, saveTracker, seedPatient,
  admissionProgress, daysUntilDue, reviewStatus,
} from "@/lib/data/care-review";
import {
  User,
  Search,
  Filter,
  ClipboardList,
  AlertTriangle,
  Calendar,
  ArrowRight,
  UserCheck,
  Clock,
  Home,
  Clipboard,
  CheckCircle2,
  XCircle,
  FileText,
  LogOut,
  BarChart3,
  Plus,
  X,
} from "lucide-react";
import {
  DEMO_PATIENTS,
  getTasksForPatient,
  ALL_DEMO_TASKS,
  ALERTS_POOL,
} from "@/lib/data/tasks";
import { getWardProfessionalCandidates } from "@/lib/data/staff";
import { Patient, DiaryTask, PatientStatus, LegalStatus, FieldVisibility } from "@/lib/types";

const LEGAL_STATUS_CONFIG: Record<LegalStatus, { label: string; color: string; bgColor: string }> = {
  informal: { label: "Informal (Voluntary)", color: "text-green-700", bgColor: "bg-green-100" },
  section_2: { label: "Section 2", color: "text-amber-700", bgColor: "bg-amber-100" },
  section_3: { label: "Section 3", color: "text-orange-700", bgColor: "bg-orange-100" },
  section_4: { label: "Section 4", color: "text-rose-700", bgColor: "bg-rose-100" },
  section_5_2: { label: "Section 5(2)", color: "text-red-600", bgColor: "bg-red-50" },
  section_5_4: { label: "Section 5(4)", color: "text-red-500", bgColor: "bg-red-50" },
  cto: { label: "CTO (S17A)", color: "text-purple-700", bgColor: "bg-purple-100" },
  section_37: { label: "Section 37", color: "text-red-700", bgColor: "bg-red-100" },
  section_37_41: { label: "Section 37/41", color: "text-red-800", bgColor: "bg-red-200" },
  section_47_49: { label: "Section 47/49", color: "text-red-900", bgColor: "bg-red-200" },
};

const PATIENT_STATUS_CONFIG: Record<PatientStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  active: { label: "Active", color: "text-green-700", bgColor: "bg-green-100", icon: <UserCheck className="w-4 h-4" /> },
  pending_discharge: { label: "Pending Discharge", color: "text-amber-700", bgColor: "bg-amber-100", icon: <Home className="w-4 h-4" /> },
  on_leave: { label: "On Leave", color: "text-blue-700", bgColor: "bg-blue-100", icon: <Calendar className="w-4 h-4" /> },
  discharged: { label: "Discharged", color: "text-gray-500", bgColor: "bg-gray-100", icon: <Clock className="w-4 h-4" /> },
};

type StatusFilter = "all" | PatientStatus;

export default function PatientsPage() {
  const link = useV2Href();
  const { user, activeWard } = useApp();
  const { addTask } = useTasks();
  const { getWardSettings } = useWardSettings();
  const wardSettings = getWardSettings(activeWard);

  // Bulk "add tasks for a patient" - shared modal, adds into the diary context
  const [isBulkTasksOpen, setIsBulkTasksOpen] = useState(false);
  const [bulkPatientName, setBulkPatientName] = useState<string | undefined>(undefined);
  const handleBulkAddTask = (t: Partial<DiaryTask>) => {
    addTask({ ...t, id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` } as DiaryTask);
  };

  // Care review tracker (admission tasks + recurring review countdowns)
  const [careTracker, setCareTracker] = useState<CareTracker>({});
  const [careReviewPatient, setCareReviewPatient] = useState<Patient | null>(null);
  const [isCareReviewOpen, setIsCareReviewOpen] = useState(false);
  const [today, setToday] = useState("");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState<DiaryTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isDischargeConfirmOpen, setIsDischargeConfirmOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DiaryTask | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isEditAlertsModalOpen, setIsEditAlertsModalOpen] = useState(false);
  const [editingPatientAlerts, setEditingPatientAlerts] = useState<string[]>([]);

  // Ward professional editing state
  const [editingWPPatientId, setEditingWPPatientId] = useState<string | null>(null);
  const [newPatientWP, setNewPatientWP] = useState("");

  // Get eligible WP candidates for current ward
  const wardName = activeWard.charAt(0).toUpperCase() + activeWard.slice(1);
  const wpCandidates = getWardProfessionalCandidates(wardName);

  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientRoom, setNewPatientRoom] = useState("");
  const [newPatientBed, setNewPatientBed] = useState("");
  const [newPatientLegalStatus, setNewPatientLegalStatus] = useState<LegalStatus>("informal");
  const [newPatientAlerts, setNewPatientAlerts] = useState<string[]>([]);
  const [newPatientAdmissionTime, setNewPatientAdmissionTime] = useState(
    () => {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    }
  );

  // Ward admin can set: "simple" (always simple), "advanced" (always advanced), "choice" (user chooses)
  const patientEntryMode = wardSettings.patientEntryMode;
  const patientFields = wardSettings.patientFields;

  // Determine effective mode based on ward settings
  const getDefaultMode = (): "simple" | "advanced" => {
    if (patientEntryMode === "simple") return "simple";
    if (patientEntryMode === "advanced") return "advanced";
    return "simple"; // Default for "choice"
  };
  const [addPatientMode, setAddPatientMode] = useState<"simple" | "advanced">(getDefaultMode);

  // Whether toggle is shown (only when "choice" mode)
  const showModeToggle = patientEntryMode === "choice";

  // Whether to show advanced fields (either mode is advanced, or user toggled to advanced)
  const showAdvancedFields = addPatientMode === "advanced";

  // Helper to check if a field should be shown
  const shouldShowField = (field: FieldVisibility): boolean => field !== "hidden";
  const isFieldRequired = (field: FieldVisibility): boolean => field === "mandatory";

  // Initialize patients and tasks from demo data
  useEffect(() => {
    setPatients([...DEMO_PATIENTS]);
    setTasks([...ALL_DEMO_TASKS]);
  }, []);

  // Load + seed the care-review tracker (client-only, so no hydration mismatch)
  useEffect(() => {
    const t = toLocalDateStr();
    setToday(t);
    const tracker = loadTracker();
    let changed = false;
    for (const p of DEMO_PATIENTS) {
      if (p.status === "discharged") continue;
      if (!tracker[p.id]) {
        tracker[p.id] = seedPatient(p.id, p.admissionDate, t);
        changed = true;
      }
    }
    if (changed) saveTracker(tracker);
    setCareTracker(tracker);
  }, []);

  const updatePatientTracker = (patientId: string, next: PatientTracker) => {
    setCareTracker((prev) => {
      const updated = { ...prev, [patientId]: next };
      saveTracker(updated);
      return updated;
    });
  };

  // Filter patients by ward and status
  const filteredPatients = patients.filter((patient) => {
    // Ward filter
    if (patient.ward !== activeWard) return false;

    // Status filter - show discharged only when explicitly filtering for discharged
    if (statusFilter === "all") {
      return patient.status !== "discharged";
    }

    return patient.status === statusFilter;
  }).filter((patient) => {
    // Search filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      (patient.preferredName?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleTransfer = (patientId: string, newWard: string, transferTasks: boolean) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, ward: newWard } : p
      )
    );

    if (transferTasks) {
      setTasks((prev) =>
        prev.map((t) =>
          (t.type === "patient" || t.type === "appointment") && t.patientId === patientId
            ? { ...t, ward: newWard }
            : t
        )
      );
    }
  };

  const openTransferModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsTransferModalOpen(true);
  };

  const openAuditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsAuditModalOpen(true);
  };

  const openTasksModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsTasksModalOpen(true);
  };

  const handleTaskClick = (task: DiaryTask) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<DiaryTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } as DiaryTask : t))
    );
  };

  const handleConfirmDischarge = (patientId: string) => {
    const now = toLocalDateStr();
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              dischargeConfirmed: true,
              dischargeConfirmedBy: user?.name || "Admin",
              dischargeConfirmedAt: now,
            }
          : p
      )
    );
  };

  // Initiate discharge (normal user) - marks as pending or discharged
  const handleInitiateDischarge = (patientId: string) => {
    const now = toLocalDateStr();
    const isAdmin = user?.role === "ward_admin" || user?.role === "senior_admin";

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: "discharged" as PatientStatus,
              dischargeDate: now,
              dischargedBy: user?.name || "Unknown",
              // If admin initiates, auto-confirm; otherwise pending confirmation
              dischargeConfirmed: isAdmin,
              dischargeConfirmedBy: isAdmin ? user?.name : undefined,
              dischargeConfirmedAt: isAdmin ? now : undefined,
            }
          : p
      )
    );
    setIsDischargeConfirmOpen(false);
    setSelectedPatient(null);
  };

  const openDischargeConfirm = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDischargeConfirmOpen(true);
  };

  const handleAddPatient = () => {
    if (!newPatientName.trim()) return;

    const wardPrefix = activeWard.substring(0, 2).toUpperCase();
    const nowDate = toLocalDateStr();
    const patientId = `p-${wardPrefix}-${Date.now()}`;

    const newPatient: Patient = {
      id: patientId,
      name: newPatientName.trim(),
      room: newPatientRoom.trim() || "TBA",
      bed: newPatientBed.trim() || undefined,
      ward: wardName,
      status: "active",
      legalStatus: newPatientLegalStatus,
      admissionDate: nowDate,
      admissionTime: newPatientAdmissionTime,
      wardProfessional: newPatientWP || undefined,
      alerts: newPatientAlerts.length > 0 ? newPatientAlerts : undefined,
    };

    setPatients((prev) => [...prev, newPatient]);

    // Auto-generate 72-hour admission audit task
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    const deadlineStr = toLocalDateStr(deadline);

    const auditTask: DiaryTask = {
      id: `audit72-new-${Date.now()}`,
      type: "patient",
      title: "72-Hour Admission Audit",
      description: `Complete 72-hour post-admission audit for ${newPatientName.trim()}. Must be completed by senior staff (Lead/Manager) within 72 hours of admission on ${nowDate} at ${newPatientAdmissionTime}. This task is visible to all Leads and Managers under "My Patients".`,
      status: "pending",
      priority: "urgent",
      category: "assessment",
      patientId: patientId,
      patientName: newPatientName.trim(),
      dueDate: deadlineStr,
      carryOver: true,
      ward: wardName,
      createdAt: nowDate,
      createdBy: user?.name || "System",
    } as DiaryTask;

    setTasks((prev) => [...prev, auditTask]);

    // Reset form
    setNewPatientName("");
    setNewPatientRoom("");
    setNewPatientBed("");
    setNewPatientLegalStatus("informal");
    setNewPatientAlerts([]);
    setNewPatientWP("");
    setNewPatientAdmissionTime(
      `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`
    );
    setIsAddPatientModalOpen(false);
  };

  const toggleAlert = (alert: string) => {
    setNewPatientAlerts((prev) =>
      prev.includes(alert)
        ? prev.filter((a) => a !== alert)
        : [...prev, alert]
    );
  };

  const handleChangeWP = (patientId: string, newWP: string) => {
    setPatients((prev) =>
      prev.map((p) => p.id === patientId ? { ...p, wardProfessional: newWP || undefined } : p)
    );
    setEditingWPPatientId(null);
  };

  const toggleEditingAlert = (alert: string) => {
    setEditingPatientAlerts((prev) =>
      prev.includes(alert)
        ? prev.filter((a) => a !== alert)
        : [...prev, alert]
    );
  };

  // NOTE: nothing currently opens the edit-alerts modal - the patient-card alerts
  // trigger was removed in Session 12. The modal below is kept so it can be
  // re-wired; an opener needs to set selectedPatient + editingPatientAlerts
  // before setIsEditAlertsModalOpen(true).
  const handleSaveAlerts = () => {
    if (!selectedPatient) return;
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? { ...p, alerts: editingPatientAlerts.length > 0 ? editingPatientAlerts : undefined }
          : p
      )
    );
    setIsEditAlertsModalOpen(false);
    setSelectedPatient(null);
    setEditingPatientAlerts([]);
  };

  const getPatientTasks = (patientId: string): DiaryTask[] => {
    return getTasksForPatient(patientId, tasks);
  };

  const getOutstandingTaskCount = (patientId: string): number => {
    return tasks.filter(
      (t) =>
        (t.type === "patient" || t.type === "appointment") &&
        t.patientId === patientId &&
        t.status !== "completed" &&
        t.status !== "cancelled"
    ).length;
  };

  // Auth gating
  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Login Required
          </h1>
          <p className="text-gray-600">
            Please log in to access the patient list.
          </p>
        </div>
      </MainLayout>
    );
  }

  const statusCounts = {
    all: patients.filter((p) => p.ward === activeWard && p.status !== "discharged").length,
    active: patients.filter((p) => p.ward === activeWard && p.status === "active").length,
    pending_discharge: patients.filter((p) => p.ward === activeWard && p.status === "pending_discharge").length,
    on_leave: patients.filter((p) => p.ward === activeWard && p.status === "on_leave").length,
    discharged: patients.filter((p) => p.ward === activeWard && p.status === "discharged").length,
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Patient List</h1>
                <p className="diary-muted">{activeWard} Ward</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setBulkPatientName(undefined); setIsBulkTasksOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <ClipboardList className="w-5 h-5" />
                Add Tasks
              </button>
              <button
                onClick={() => setIsAddPatientModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Patient
              </button>
              <Link
                href={link("/reports")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <BarChart3 className="w-5 h-5" />
                Reports
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                statusFilter === "all"
                  ? "bg-teal-100 text-teal-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              All Active ({statusCounts.all})
            </button>
            {(Object.entries(PATIENT_STATUS_CONFIG) as [PatientStatus, typeof PATIENT_STATUS_CONFIG[PatientStatus]][]).map(
              ([status, config]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    statusFilter === status
                      ? `${config.bgColor} ${config.color}`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {config.icon}
                  {config.label} ({statusCounts[status]})
                </button>
              )
            )}
          </div>
        </div>

        {/* Discharged patients banner */}
        {statusFilter === "discharged" && filteredPatients.length > 0 && (
          <Card className="mb-6 p-4 bg-gray-50 border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recent Discharges</h3>
                <p className="text-sm text-gray-600 mt-1">
                  These patients have been discharged but require admin confirmation to complete the discharge process.
                  Ward admins can review the audit log and confirm each discharge.
                </p>
                {user?.role !== "ward_admin" && (
                  <p className="text-sm text-amber-700 mt-2 font-medium">
                    Only ward admins can confirm discharges.
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Patient Cards */}
        {filteredPatients.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search query."
                : statusFilter === "discharged"
                ? "No recently discharged patients."
                : "No patients match the current filter."}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => {
              const statusConfig = PATIENT_STATUS_CONFIG[patient.status];
              const legalConfig = LEGAL_STATUS_CONFIG[patient.legalStatus];
              const outstandingTasks = getOutstandingTaskCount(patient.id);
              const pt = careTracker[patient.id];
              const adm = admissionProgress(pt);
              const showCare = patient.status !== "discharged" && !!pt && !!today;

              return (
                <Card
                  key={patient.id}
                  onClick={() => openTasksModal(patient)}
                  /* Deliberately NOT role="button": the card contains nested
                     interactive controls (WP dropdown, transfer/discharge),
                     and a button role may not contain them (axe
                     nested-interactive). Same pattern as the diary task
                     cards from the Session 26 audit. */
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openTasksModal(patient);
                    }
                  }}
                  aria-label={`View tasks for ${patient.name}`}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <button
                        onClick={() => openTasksModal(patient)}
                        className="text-lg font-bold text-gray-900 hover:text-indigo-700 transition-colors text-left"
                        title="View all tasks for this patient"
                      >
                        {patient.name}
                      </button>
                      {patient.preferredName && (
                        <p className="text-sm text-gray-500">
                          Prefers &quot;{patient.preferredName}&quot;
                        </p>
                      )}
                    </div>
                    <div className="text-right" />
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${legalConfig.bgColor} ${legalConfig.color}`}
                    >
                      {legalConfig.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      {patient.namedNurse || "No named nurse"}
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {patient.consultant || "No consultant"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Clipboard className="w-4 h-4 text-teal-500" />
                      {editingWPPatientId === patient.id ? (
                        <select
                          value={patient.wardProfessional || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleChangeWP(patient.id, e.target.value)}
                          onBlur={() => setEditingWPPatientId(null)}
                          autoFocus
                          className="text-sm border border-teal-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
                        >
                          <option value="">No WP assigned</option>
                          {wpCandidates.map((s) => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWPPatientId(patient.id);
                          }}
                          className="text-teal-700 font-medium hover:text-teal-900 hover:underline transition-colors cursor-pointer"
                          title="Click to change ward professional"
                        >
                          WP: {patient.wardProfessional || "Not assigned"}
                        </button>
                      )}
                    </div>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Admitted: {new Date(patient.admissionDate).toLocaleDateString("en-GB")}
                      {patient.admissionTime && ` at ${patient.admissionTime}`}
                    </p>
                    {patient.status !== "discharged" && patient.expectedDischargeDate && (
                      <p className="flex items-center gap-2 text-amber-700 font-medium">
                        <Home className="w-4 h-4" />
                        EDD: {new Date(patient.expectedDischargeDate).toLocaleDateString("en-GB")}
                      </p>
                    )}
                    {patient.status === "discharged" && patient.dischargeDate && (
                      <p className="flex items-center gap-2 text-gray-700 font-medium">
                        <LogOut className="w-4 h-4" />
                        Discharged: {new Date(patient.dischargeDate).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>

                  {/* Discharge confirmation status */}
                  {patient.status === "discharged" && (
                    <div className={`flex items-center gap-2 mb-4 p-2 rounded-lg text-sm ${
                      patient.dischargeConfirmed
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {patient.dischargeConfirmed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-medium">Discharge confirmed</span>
                          {patient.dischargeConfirmedBy && (
                            <span className="text-xs text-green-600">
                              by {patient.dischargeConfirmedBy}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span className="font-medium">Awaiting admin confirmation</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Tasks indicator - clickable */}
                  {outstandingTasks > 0 && (
                    <button
                      onClick={() => openTasksModal(patient)}
                      className="flex items-center gap-2 mb-4 text-sm text-amber-700 hover:text-amber-800 transition-colors"
                      title="View all tasks for this patient"
                    >
                      <Clipboard className="w-4 h-4" />
                      <span className="font-medium">
                        {outstandingTasks} outstanding task{outstandingTasks !== 1 ? "s" : ""}
                      </span>
                    </button>
                  )}

                  {/* Care review - admission badge + review countdowns */}
                  {showCare && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setCareReviewPatient(patient); setIsCareReviewOpen(true); }}
                      className="w-full text-left mb-4 p-2.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
                      title="Open care review"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${adm.complete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                          {adm.complete ? "✓ Admission complete" : `Admission ${adm.done}/${adm.total}`}
                        </span>
                        <span className="text-[11px] text-gray-600 ml-auto">Care review</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {REVIEW_ITEMS.map((it) => {
                          const days = daysUntilDue(pt.reviews[it.id], it.intervalDays, today);
                          const status = reviewStatus(days, it.intervalDays);
                          const chip =
                            status === "overdue" ? "bg-red-100 text-red-800"
                            : status === "due" ? "bg-amber-100 text-amber-800"
                            : status === "ok" ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600";
                          const label =
                            days === null ? "--"
                            : days < 0 ? `${Math.abs(days)}d over`
                            : days === 0 ? "today"
                            : `${days}d`;
                          return (
                            <span key={it.id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${chip}`} title={`${it.label}: ${status === "overdue" ? "overdue" : status === "none" ? "not started" : "due in " + days + " days"}`}>
                              {it.short} {label}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  )}

                  {/* Actions */}
                  {patient.status !== "discharged" && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); openTransferModal(patient); }}
                        className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Transfer
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDischargeConfirm(patient); }}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Discharge
                      </button>
                    </div>
                  )}

                  {/* Discharged patient actions */}
                  {patient.status === "discharged" && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); openAuditModal(patient); }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        View Audit Log
                      </button>
                      {!patient.dischargeConfirmed && user?.role === "ward_admin" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openAuditModal(patient); }}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      <PatientTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        patientTasks={selectedPatient ? getPatientTasks(selectedPatient.id) : []}
        onTransfer={handleTransfer}
      />

      {/* Discharge Audit Modal */}
      <DischargeAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => {
          setIsAuditModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        patientTasks={selectedPatient ? getPatientTasks(selectedPatient.id) : []}
        isWardAdmin={user?.role === "ward_admin" || user?.role === "senior_admin"}
        onConfirmDischarge={handleConfirmDischarge}
      />

      {/* Patient Tasks Modal */}
      <PatientTasksModal
        isOpen={isTasksModalOpen}
        onClose={() => {
          setIsTasksModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        tasks={selectedPatient ? getPatientTasks(selectedPatient.id) : []}
        onTaskClick={handleTaskClick}
        onAddTasks={selectedPatient ? () => {
          setBulkPatientName(selectedPatient.name);
          setIsTasksModalOpen(false);
          setIsBulkTasksOpen(true);
        } : undefined}
      />

      <BulkPatientTasksModal
        isOpen={isBulkTasksOpen}
        onClose={() => setIsBulkTasksOpen(false)}
        onAdd={handleBulkAddTask}
        activeWard={activeWard}
        currentUserName={user?.name}
        initialPatientName={bulkPatientName}
      />

      {careReviewPatient && careTracker[careReviewPatient.id] && (
        <CareReviewModal
          isOpen={isCareReviewOpen}
          onClose={() => { setIsCareReviewOpen(false); setCareReviewPatient(null); }}
          patient={careReviewPatient}
          tracker={careTracker[careReviewPatient.id]}
          onUpdate={(next) => updatePatientTracker(careReviewPatient.id, next)}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isTaskDetailModalOpen}
          onClose={() => {
            setIsTaskDetailModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          currentUserName={user?.name || "Unknown User"}
          onClaim={(taskId) => {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? { ...t, claimedBy: user?.name || "Unknown User", claimedAt: toLocalDateStr() }
                  : t
              ) as DiaryTask[]
            );
          }}
          onSteal={(taskId) => {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? { ...t, claimedBy: user?.name || "Unknown User", claimedAt: toLocalDateStr() }
                  : t
              ) as DiaryTask[]
            );
          }}
          onToggleComplete={(taskId) => {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
                  : t
              ) as DiaryTask[]
            );
          }}
          onUpdate={handleTaskUpdate}
        />
      )}

      {/* Discharge Confirmation Modal */}
      {isDischargeConfirmOpen && selectedPatient && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setIsDischargeConfirmOpen(false);
            setSelectedPatient(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Discharge patient"
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-700 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Discharge Patient</h2>
                  <p className="text-sm text-white/80">Confirm this action</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {selectedPatient.name}
                </p>
                <p className="text-gray-500">
                  {selectedPatient.ward} Ward
                </p>
              </div>

              {/* Outstanding tasks warning */}
              {getOutstandingTaskCount(selectedPatient.id) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">Outstanding tasks</p>
                    <p className="text-sm text-amber-700">
                      This patient has {getOutstandingTaskCount(selectedPatient.id)} incomplete task(s).
                      These should be reviewed before discharge.
                    </p>
                  </div>
                </div>
              )}

              {/* Role-based message */}
              {user?.role === "ward_admin" || user?.role === "senior_admin" ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Admin discharge:</strong> As a ward admin, the discharge will be
                    confirmed immediately. You&apos;ll be able to review the audit log after.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Pending confirmation:</strong> The patient will be marked as discharged
                    but will require ward admin confirmation. The admin will review the audit log
                    and complete the process.
                  </p>
                </div>
              )}

              <p className="text-center text-gray-600">
                Are you sure you want to discharge this patient?
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setIsDischargeConfirmOpen(false);
                  setSelectedPatient(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInitiateDischarge(selectedPatient.id)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Confirm Discharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddPatientModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsAddPatientModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add patient"
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Add New Patient</h2>
                    <p className="text-sm text-white/80">{activeWard} Ward</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Simple/Advanced Toggle - only show when ward allows choice */}
              {showModeToggle && (
                <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setAddPatientMode("simple")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      addPatientMode === "simple"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setAddPatientMode("advanced")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      addPatientMode === "advanced"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              )}

              {/* Mode indicator when fixed by admin */}
              {!showModeToggle && (
                <div className="text-xs text-gray-500 text-center py-1">
                  {patientEntryMode === "simple" ? "Simple mode (set by ward admin)" : "Advanced mode (set by ward admin)"}
                </div>
              )}

              {/* Patient Name - Always shown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="e.g., John Smith"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Admission Time - Always shown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Time *
                </label>
                <input
                  type="time"
                  value={newPatientAdmissionTime}
                  onChange={(e) => setNewPatientAdmissionTime(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A 72-hour admission audit task will be auto-generated for Leads and Managers.
                </p>
              </div>

              {/* Ward Professional - Always shown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward Professional
                </label>
                <select
                  value={newPatientWP}
                  onChange={(e) => setNewPatientWP(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                >
                  <option value="">None assigned</option>
                  {wpCandidates.map((s) => (
                    <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Staff, Lead, or Manager responsible for this patient.
                </p>
              </div>

              {/* Advanced Fields - shown when in advanced mode */}
              {showAdvancedFields && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Room field */}
                    {shouldShowField(patientFields.room) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room {isFieldRequired(patientFields.room) ? "*" : <span className="text-gray-400 font-normal">(optional)</span>}
                        </label>
                        <input
                          type="text"
                          value={newPatientRoom}
                          onChange={(e) => setNewPatientRoom(e.target.value)}
                          placeholder="e.g., 101"
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                        />
                      </div>
                    )}
                    {/* Bed field */}
                    {shouldShowField(patientFields.bed) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bed {isFieldRequired(patientFields.bed) ? "*" : <span className="text-gray-400 font-normal">(optional)</span>}
                        </label>
                        <input
                          type="text"
                          value={newPatientBed}
                          onChange={(e) => setNewPatientBed(e.target.value)}
                          placeholder="e.g., A"
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* MHA Status field */}
                  {shouldShowField(patientFields.legalStatus) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MHA Status {isFieldRequired(patientFields.legalStatus) ? "*" : <span className="text-gray-400 font-normal">(optional)</span>}
                      </label>
                      <select
                        value={newPatientLegalStatus}
                        onChange={(e) => setNewPatientLegalStatus(e.target.value as LegalStatus)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      >
                        {Object.entries(LEGAL_STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Alerts Selection */}
                  {shouldShowField(patientFields.alerts) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alerts {isFieldRequired(patientFields.alerts) ? "*" : <span className="text-gray-400 font-normal">(optional)</span>}
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 max-h-40 overflow-y-auto">
                        {ALERTS_POOL.map((alert) => (
                          <button
                            key={alert}
                            type="button"
                            onClick={() => toggleAlert(alert)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              newPatientAlerts.includes(alert)
                                ? "bg-red-100 text-red-700 border-2 border-red-300"
                                : "bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {newPatientAlerts.includes(alert) && "✓ "}
                            {alert}
                          </button>
                        ))}
                      </div>
                      {newPatientAlerts.length > 0 && (
                        <p className="mt-2 text-sm text-red-600">
                          {newPatientAlerts.length} alert{newPatientAlerts.length !== 1 ? "s" : ""} selected
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p>
                  <strong>Note:</strong> In a live deployment, patients would be managed via the Trust&apos;s clinical systems.
                  This manual entry is for demo purposes.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setIsAddPatientModalOpen(false);
                  setNewPatientName("");
                  setNewPatientRoom("");
                  setNewPatientBed("");
                  setNewPatientLegalStatus("informal");
                  setNewPatientAlerts([]);
                  setNewPatientWP("");
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPatient}
                disabled={!newPatientName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Alerts Modal */}
      {isEditAlertsModalOpen && selectedPatient && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setIsEditAlertsModalOpen(false);
            setSelectedPatient(null);
            setEditingPatientAlerts([]);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit patient alerts"
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Edit Alerts</h2>
                    <p className="text-sm text-white/80">{selectedPatient.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsEditAlertsModalOpen(false);
                    setSelectedPatient(null);
                    setEditingPatientAlerts([]);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Alert Selection */}
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Select all alerts that apply to this patient. Changes will be saved immediately.
              </p>
              <div className="flex flex-wrap gap-2">
                {ALERTS_POOL.map((alert) => (
                  <button
                    key={alert}
                    type="button"
                    onClick={() => toggleEditingAlert(alert)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      editingPatientAlerts.includes(alert)
                        ? "bg-red-100 text-red-700 border-2 border-red-300"
                        : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {editingPatientAlerts.includes(alert) && "✓ "}
                    {alert}
                  </button>
                ))}
              </div>
              {editingPatientAlerts.length > 0 && (
                <p className="mt-4 text-sm text-red-600 font-medium">
                  {editingPatientAlerts.length} alert{editingPatientAlerts.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setIsEditAlertsModalOpen(false);
                  setSelectedPatient(null);
                  setEditingPatientAlerts([]);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAlerts}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
