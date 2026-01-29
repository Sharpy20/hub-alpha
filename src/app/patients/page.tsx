"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/app/providers";
import { useWardSettings } from "@/app/ward-settings-provider";
import { MainLayout } from "@/components/layout";
import { Card } from "@/components/ui";
import { PatientTransferModal, DischargeAuditModal, PatientTasksModal, TaskDetailModal } from "@/components/modals";
import {
  User,
  Search,
  Filter,
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
import { Patient, DiaryTask, PatientStatus, LegalStatus, PatientEntryMode, FieldVisibility } from "@/lib/types";

const LEGAL_STATUS_CONFIG: Record<LegalStatus, { label: string; color: string; bgColor: string }> = {
  informal: { label: "Informal", color: "text-green-700", bgColor: "bg-green-100" },
  section_2: { label: "Section 2", color: "text-amber-700", bgColor: "bg-amber-100" },
  section_3: { label: "Section 3", color: "text-orange-700", bgColor: "bg-orange-100" },
  section_37: { label: "Section 37", color: "text-red-700", bgColor: "bg-red-100" },
  section_17_leave: { label: "S17 Leave", color: "text-blue-700", bgColor: "bg-blue-100" },
  cto: { label: "CTO", color: "text-purple-700", bgColor: "bg-purple-100" },
};

const PATIENT_STATUS_CONFIG: Record<PatientStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  active: { label: "Active", color: "text-green-700", bgColor: "bg-green-100", icon: <UserCheck className="w-4 h-4" /> },
  pending_discharge: { label: "Pending Discharge", color: "text-amber-700", bgColor: "bg-amber-100", icon: <Home className="w-4 h-4" /> },
  on_leave: { label: "On Leave", color: "text-blue-700", bgColor: "bg-blue-100", icon: <Calendar className="w-4 h-4" /> },
  discharged: { label: "Discharged", color: "text-gray-500", bgColor: "bg-gray-100", icon: <Clock className="w-4 h-4" /> },
};

type StatusFilter = "all" | PatientStatus;

export default function PatientsPage() {
  const { user, hasFeature, activeWard } = useApp();
  const { getWardSettings } = useWardSettings();
  const wardSettings = getWardSettings(activeWard);

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

  // Add patient form state
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientRoom, setNewPatientRoom] = useState("");
  const [newPatientBed, setNewPatientBed] = useState("");
  const [newPatientLegalStatus, setNewPatientLegalStatus] = useState<LegalStatus>("informal");
  const [newPatientAlerts, setNewPatientAlerts] = useState<string[]>([]);

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
      patient.room.toLowerCase().includes(query) ||
      (patient.preferredName?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleTransfer = (patientId: string, newWard: string, transferTasks: boolean) => {
    // Update patient's ward
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, ward: newWard } : p
      )
    );

    // Update tasks if transferring
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
    const now = new Date().toISOString().split("T")[0];
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
    const now = new Date().toISOString().split("T")[0];
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
    const newPatient: Patient = {
      id: `p-${wardPrefix}-${Date.now()}`,
      name: newPatientName.trim(),
      room: newPatientRoom.trim() || "TBA",
      bed: newPatientBed.trim() || undefined,
      ward: activeWard.charAt(0).toUpperCase() + activeWard.slice(1),
      status: "active",
      legalStatus: newPatientLegalStatus,
      admissionDate: new Date().toISOString().split("T")[0],
      alerts: newPatientAlerts.length > 0 ? newPatientAlerts : undefined,
    };

    setPatients((prev) => [...prev, newPatient]);

    // Reset form
    setNewPatientName("");
    setNewPatientRoom("");
    setNewPatientBed("");
    setNewPatientLegalStatus("informal");
    setNewPatientAlerts([]);
    setIsAddPatientModalOpen(false);
  };

  const toggleAlert = (alert: string) => {
    setNewPatientAlerts((prev) =>
      prev.includes(alert)
        ? prev.filter((a) => a !== alert)
        : [...prev, alert]
    );
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

  // Feature gating
  if (!hasFeature("patient_list")) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient List</h1>
          <p className="text-gray-500 mb-4">
            This feature requires <span className="font-semibold text-purple-600">Max</span> version or higher.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Light and Medium versions provide viewable resources only (Bookmarks, Referrals, How-To Guides).
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium no-underline hover:shadow-lg"
            >
              Go Home
            </Link>
            <Link
              href="/versions"
              className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium no-underline hover:bg-gray-200"
            >
              Compare Versions
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Patient List</h1>
                <p className="text-gray-600">{activeWard} Ward</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddPatientModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Patient
              </button>
              <Link
                href="/reports"
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
              placeholder="Search patients by name or room..."
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
                  <p className="text-sm text-amber-600 mt-2 font-medium">
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

              return (
                <Card
                  key={patient.id}
                  className="p-4 hover:shadow-lg transition-shadow"
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
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">
                        {patient.room}
                        {patient.bed && ` (${patient.bed})`}
                      </p>
                    </div>
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

                  {/* Alerts */}
                  {patient.alerts && patient.alerts.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {patient.alerts.map((alert, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {alert}
                        </span>
                      ))}
                    </div>
                  )}

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
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Admitted: {new Date(patient.admissionDate).toLocaleDateString("en-GB")}
                    </p>
                    {patient.status !== "discharged" && patient.expectedDischargeDate && (
                      <p className="flex items-center gap-2 text-amber-600 font-medium">
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
                      className="flex items-center gap-2 mb-4 text-sm text-amber-600 hover:text-amber-800 transition-colors"
                      title="View all tasks for this patient"
                    >
                      <Clipboard className="w-4 h-4" />
                      <span className="font-medium">
                        {outstandingTasks} outstanding task{outstandingTasks !== 1 ? "s" : ""}
                      </span>
                    </button>
                  )}

                  {/* Actions */}
                  {patient.status !== "discharged" && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openTransferModal(patient)}
                        className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Transfer
                      </button>
                      <button
                        onClick={() => openDischargeConfirm(patient)}
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
                        onClick={() => openAuditModal(patient)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        View Audit Log
                      </button>
                      {!patient.dischargeConfirmed && user?.role === "ward_admin" && (
                        <button
                          onClick={() => openAuditModal(patient)}
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
        isMaxPlus={hasFeature("systemon_sync")}
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
      />

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
                  ? { ...t, claimedBy: user?.name || "Unknown User", claimedAt: new Date().toISOString().split("T")[0] }
                  : t
              ) as DiaryTask[]
            );
          }}
          onSteal={(taskId) => {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? { ...t, claimedBy: user?.name || "Unknown User", claimedAt: new Date().toISOString().split("T")[0] }
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
                  {selectedPatient.room}{selectedPatient.bed && ` (${selectedPatient.bed})`}
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
                  <strong>Note:</strong> In Max+ version, patients would be synced from SystemOne.
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
    </MainLayout>
  );
}
