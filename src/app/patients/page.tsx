"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/providers";
import { MainLayout } from "@/components/layout";
import { Card } from "@/components/ui";
import { PatientTransferModal, DischargeAuditModal, PatientTasksModal } from "@/components/modals";
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
} from "lucide-react";
import {
  DEMO_PATIENTS,
  getTasksForPatient,
  ALL_DEMO_TASKS,
} from "@/lib/data/tasks";
import { Patient, DiaryTask, PatientStatus, LegalStatus } from "@/lib/types";

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState<DiaryTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);

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
        <div className="max-w-4xl mx-auto py-12 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Patient List Not Available
          </h1>
          <p className="text-gray-600">
            The patient list feature requires Max or Max+ version.
          </p>
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient List</h1>
              <p className="text-gray-600">{activeWard} Ward</p>
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
      />
    </MainLayout>
  );
}
