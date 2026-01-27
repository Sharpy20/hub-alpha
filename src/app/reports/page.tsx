"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import {
  DEMO_PATIENTS,
  getTasksForPatient,
  getPatientsByWard,
} from "@/lib/data/tasks";
import { WARDS, Patient, DiaryTask } from "@/lib/types";
import {
  FileText,
  Users,
  Building2,
  UserCheck,
  Download,
  Printer,
  Send,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Activity,
  Shield,
  Home,
  User,
  Stethoscope,
  CalendarDays,
  ListTodo,
  Bell,
  Zap,
} from "lucide-react";
import Link from "next/link";

// Report scope options
type ReportScope = "all_wards" | "single_ward" | "selected_patients";

// Delivery frequency options (Max+ only)
type DeliveryFrequency = "on_demand" | "daily" | "weekly";
type DeliveryMethod = "email" | "teams";

interface DeliveryConfig {
  enabled: boolean;
  method: DeliveryMethod;
  frequency: DeliveryFrequency;
  email?: string;
  teamsWebhook?: string;
  time?: string;
  dayOfWeek?: number;
}

// Calculate days since admission
const getDaysSinceAdmission = (admissionDate: string): number => {
  const admission = new Date(admissionDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - admission.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get legal status display
const getLegalStatusDisplay = (status: string): { label: string; color: string; icon: string } => {
  const statusMap: Record<string, { label: string; color: string; icon: string }> = {
    informal: { label: "Informal", color: "bg-green-100 text-green-800", icon: "🟢" },
    section_2: { label: "Section 2", color: "bg-amber-100 text-amber-800", icon: "🟡" },
    section_3: { label: "Section 3", color: "bg-orange-100 text-orange-800", icon: "🟠" },
    section_37: { label: "Section 37", color: "bg-red-100 text-red-800", icon: "🔴" },
    section_17_leave: { label: "S17 Leave", color: "bg-blue-100 text-blue-800", icon: "🔵" },
    cto: { label: "CTO", color: "bg-purple-100 text-purple-800", icon: "🟣" },
  };
  return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: "⚪" };
};

// Patient Report Card Component
const PatientReportCard = ({ patient, tasks }: { patient: Patient; tasks: DiaryTask[] }) => {
  const [expanded, setExpanded] = useState(false);
  const legalStatus = getLegalStatusDisplay(patient.legalStatus);
  const daysSinceAdmission = getDaysSinceAdmission(patient.admissionDate);

  // Task statistics
  const taskStats = useMemo(() => {
    const completed = tasks.filter(t => t.status === "completed").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const inProgress = tasks.filter(t => t.status === "in_progress").length;
    const overdue = tasks.filter(t => t.status === "overdue").length;
    return { completed, pending, inProgress, overdue, total: tasks.length };
  }, [tasks]);

  // Recent tasks (last 5)
  const recentTasks = useMemo(() => {
    return tasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  // Status color based on overdue tasks
  const statusColor = taskStats.overdue > 0
    ? "from-red-500 to-rose-600"
    : taskStats.pending > 3
      ? "from-amber-500 to-orange-600"
      : "from-emerald-500 to-green-600";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${statusColor} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{patient.name}</h3>
              <p className="text-white/80 text-sm">
                {patient.ward} Ward - Room {patient.room}{patient.bed ? `, Bed ${patient.bed}` : ""}
              </p>
            </div>
          </div>
          <Badge className={`${legalStatus.color} border-0 font-semibold`}>
            {legalStatus.icon} {legalStatus.label}
          </Badge>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xl font-bold">{taskStats.completed}</span>
          </div>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-600">
            <Timer className="w-4 h-4" />
            <span className="text-xl font-bold">{taskStats.inProgress}</span>
          </div>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600">
            <Clock className="w-4 h-4" />
            <span className="text-xl font-bold">{taskStats.pending}</span>
          </div>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xl font-bold">{taskStats.overdue}</span>
          </div>
          <p className="text-xs text-gray-500">Overdue</p>
        </div>
      </div>

      {/* Patient Details */}
      <div className="p-4 space-y-4">
        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Admitted</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(patient.admissionDate).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
            <Activity className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Length of Stay</p>
              <p className="text-sm font-semibold text-gray-800">{daysSinceAdmission} days</p>
            </div>
          </div>
          {patient.namedNurse && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs text-gray-500">Named Nurse</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{patient.namedNurse}</p>
              </div>
            </div>
          )}
          {patient.consultant && (
            <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500">Consultant</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{patient.consultant}</p>
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">Active Alerts</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {patient.alerts.map((alert, i) => (
                <Badge key={i} className="bg-red-100 text-red-700 border-0 text-xs">
                  {alert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Recent Tasks */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-700">Recent Tasks ({taskStats.total})</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expanded && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-lg"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : task.status === "overdue" ? (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  ) : task.status === "in_progress" ? (
                    <Timer className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      {task.type === "appointment" ? "Appointment" : task.type === "patient" ? "Patient Task" : "Ward Task"}
                    </p>
                  </div>
                  <Badge
                    className={`text-xs border-0 ${
                      task.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : task.status === "overdue"
                        ? "bg-red-100 text-red-700"
                        : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No tasks recorded</p>
            )}
          </div>
        )}

        {/* Status Summary */}
        <div className={`p-3 rounded-xl ${
          taskStats.overdue > 0
            ? "bg-red-50 border border-red-100"
            : taskStats.pending > 3
              ? "bg-amber-50 border border-amber-100"
              : "bg-emerald-50 border border-emerald-100"
        }`}>
          <p className={`text-sm font-medium ${
            taskStats.overdue > 0
              ? "text-red-700"
              : taskStats.pending > 3
                ? "text-amber-700"
                : "text-emerald-700"
          }`}>
            {taskStats.overdue > 0
              ? `Attention needed: ${taskStats.overdue} overdue task${taskStats.overdue > 1 ? "s" : ""}`
              : taskStats.pending > 3
                ? `${taskStats.pending} tasks pending completion`
                : "All tasks on track"}
          </p>
        </div>
      </div>
    </div>
  );
};

// Delivery Configuration Modal (Max+ only)
const DeliveryConfigModal = ({
  isOpen,
  onClose,
  config,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  config: DeliveryConfig;
  onSave: (config: DeliveryConfig) => void;
}) => {
  const [localConfig, setLocalConfig] = useState(config);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Schedule Delivery</h2>
              <p className="text-white/80 text-sm">Max+ Feature</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Enable Toggle */}
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
            <span className="font-medium text-gray-700">Enable Scheduled Reports</span>
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
              className="w-5 h-5 rounded accent-amber-500"
            />
          </label>

          {localConfig.enabled && (
            <>
              {/* Delivery Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLocalConfig({ ...localConfig, method: "email" })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      localConfig.method === "email"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </button>
                  <button
                    onClick={() => setLocalConfig({ ...localConfig, method: "teams" })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      localConfig.method === "teams"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    MS Teams
                  </button>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "on_demand", label: "On Demand" },
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                  ].map((freq) => (
                    <button
                      key={freq.value}
                      onClick={() =>
                        setLocalConfig({ ...localConfig, frequency: freq.value as DeliveryFrequency })
                      }
                      className={`p-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        localConfig.frequency === freq.value
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email/Teams Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {localConfig.method === "email" ? "Email Address" : "Teams Webhook URL"}
                </label>
                <input
                  type={localConfig.method === "email" ? "email" : "url"}
                  placeholder={
                    localConfig.method === "email"
                      ? "ward.reports@nhs.net"
                      : "https://outlook.office.com/webhook/..."
                  }
                  value={localConfig.method === "email" ? localConfig.email || "" : localConfig.teamsWebhook || ""}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      [localConfig.method === "email" ? "email" : "teamsWebhook"]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Time Selection (for daily/weekly) */}
              {localConfig.frequency !== "on_demand" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send Time
                  </label>
                  <input
                    type="time"
                    value={localConfig.time || "08:00"}
                    onChange={(e) => setLocalConfig({ ...localConfig, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Day Selection (for weekly) */}
              {localConfig.frequency === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={localConfig.dayOfWeek || 1}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, dayOfWeek: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                      (day, i) => (
                        <option key={day} value={i}>
                          {day}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function ReportsPage() {
  const { version, activeWard } = useApp();
  const { tasks } = useTasks();
  const isMaxPlus = version === "max_plus";

  // State
  const [scope, setScope] = useState<ReportScope>("single_ward");
  const [selectedWard, setSelectedWard] = useState(activeWard || "Byron");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [patientFilterWards, setPatientFilterWards] = useState<string[]>([]); // Filter for patient picker (empty = all wards)
  const [showReport, setShowReport] = useState(false);
  const [showDeliveryConfig, setShowDeliveryConfig] = useState(false);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>({
    enabled: false,
    method: "email",
    frequency: "daily",
    time: "08:00",
    dayOfWeek: 1,
  });

  // Get patients based on scope
  const reportPatients = useMemo(() => {
    if (scope === "all_wards") {
      return DEMO_PATIENTS.filter(p => p.status !== "discharged");
    } else if (scope === "single_ward") {
      return getPatientsByWard(selectedWard).filter(p => p.status !== "discharged");
    } else {
      return DEMO_PATIENTS.filter(p => selectedPatients.includes(p.id) && p.status !== "discharged");
    }
  }, [scope, selectedWard, selectedPatients]);

  // Get all active patients for selection
  const allActivePatients = useMemo(() => {
    return DEMO_PATIENTS.filter(p => p.status !== "discharged");
  }, []);

  // Toggle patient selection
  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  // Generate report
  const generateReport = () => {
    setShowReport(true);
  };

  // Print report
  const printReport = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Patient Progress Reports
                </h1>
                <p className="text-white/80 mt-1">
                  Generate comprehensive patient status audits
                </p>
              </div>
            </div>
            {isMaxPlus && (
              <button
                onClick={() => setShowDeliveryConfig(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
              >
                <Zap className="w-5 h-5" />
                Schedule Delivery
              </button>
            )}
          </div>

          {/* Max+ Badge */}
          {isMaxPlus && deliveryConfig.enabled && (
            <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center gap-3">
              <Send className="w-5 h-5" />
              <span className="text-sm">
                Scheduled: {deliveryConfig.frequency === "on_demand" ? "On demand" : deliveryConfig.frequency}{" "}
                via {deliveryConfig.method === "email" ? "Email" : "MS Teams"}
                {deliveryConfig.frequency !== "on_demand" && ` at ${deliveryConfig.time}`}
              </span>
            </div>
          )}
        </div>

        {!showReport ? (
          <>
            {/* Report Scope Selection */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  Select Report Scope
                </h2>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* All Wards */}
                  <button
                    onClick={() => setScope("all_wards")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      scope === "all_wards"
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          scope === "all_wards" ? "bg-violet-500 text-white" : "bg-gray-100"
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">All Wards</p>
                        <p className="text-sm text-gray-500">
                          {allActivePatients.length} patients
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Single Ward */}
                  <button
                    onClick={() => setScope("single_ward")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      scope === "single_ward"
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          scope === "single_ward" ? "bg-violet-500 text-white" : "bg-gray-100"
                        }`}
                      >
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Single Ward</p>
                        <p className="text-sm text-gray-500">
                          {getPatientsByWard(selectedWard).filter(p => p.status !== "discharged").length} patients
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Selected Patients */}
                  <button
                    onClick={() => setScope("selected_patients")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      scope === "selected_patients"
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          scope === "selected_patients" ? "bg-violet-500 text-white" : "bg-gray-100"
                        }`}
                      >
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Select Patients</p>
                        <p className="text-sm text-gray-500">
                          {selectedPatients.length} selected
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Ward Selector (for single ward) */}
                {scope === "single_ward" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Ward
                    </label>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {WARDS.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Patient Selector (for selected patients) */}
                {scope === "selected_patients" && (
                  <div className="mt-4 space-y-3">
                    {/* Ward filter buttons */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Ward (click to toggle)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setPatientFilterWards([])}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            patientFilterWards.length === 0
                              ? "bg-violet-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          All Wards
                        </button>
                        {WARDS.map((ward) => (
                          <button
                            key={ward.id}
                            onClick={() => {
                              setPatientFilterWards(prev =>
                                prev.includes(ward.id)
                                  ? prev.filter(id => id !== ward.id)
                                  : [...prev, ward.id]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              patientFilterWards.includes(ward.id)
                                ? "bg-violet-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {ward.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Select all / clear buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const wardsToUse = patientFilterWards.length === 0 ? WARDS : WARDS.filter(w => patientFilterWards.includes(w.id));
                          const patientsToAdd = wardsToUse
                            .flatMap(ward => getPatientsByWard(ward.id).filter(p => p.status !== "discharged"))
                            .map(p => p.id);
                          setSelectedPatients(prev => [...new Set([...prev, ...patientsToAdd])]);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                      >
                        Select All Shown
                      </button>
                      <button
                        onClick={() => {
                          if (patientFilterWards.length === 0) {
                            setSelectedPatients([]);
                          } else {
                            const patientsToRemove = patientFilterWards
                              .flatMap(wardId => getPatientsByWard(wardId).map(p => p.id));
                            setSelectedPatients(prev => prev.filter(id => !patientsToRemove.includes(id)));
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        Clear {patientFilterWards.length > 0 ? "Selected Wards" : "All"}
                      </button>
                    </div>

                    {/* Patient list */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Click patients to toggle selection
                      </label>
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                        {(patientFilterWards.length === 0 ? WARDS : WARDS.filter(w => patientFilterWards.includes(w.id))).map((ward) => {
                          const wardPatients = getPatientsByWard(ward.id).filter(p => p.status !== "discharged");
                          return (
                            <div key={ward.id}>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 bg-gray-50 rounded sticky top-0">
                                {ward.name} ({wardPatients.length} patients)
                              </p>
                              {wardPatients.map((patient) => (
                                <button
                                  key={patient.id}
                                  onClick={() => togglePatientSelection(patient.id)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                                    selectedPatients.includes(patient.id)
                                      ? "bg-violet-100 text-violet-800"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                      selectedPatients.includes(patient.id)
                                        ? "bg-violet-500 border-violet-500 text-white"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {selectedPatients.includes(patient.id) && (
                                      <CheckCircle2 className="w-3 h-3" />
                                    )}
                                  </div>
                                  <span className="text-sm">{patient.name}</span>
                                  <span className="text-xs text-gray-500 ml-auto">
                                    Room {patient.room}
                                  </span>
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                      {selectedPatients.length > 0 && (
                        <p className="text-sm text-violet-600 mt-2">
                          {selectedPatients.length} patient{selectedPatients.length > 1 ? "s" : ""} selected
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={generateReport}
                disabled={scope === "selected_patients" && selectedPatients.length === 0}
                className="px-8 py-4 text-lg bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 disabled:opacity-50"
              >
                <FileText className="w-5 h-5 mr-2" />
                Generate Report ({reportPatients.length} patients)
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Report Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <button
                onClick={() => setShowReport(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronUp className="w-5 h-5" />
                Back to Selection
              </button>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={printReport} className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                {isMaxPlus && (
                  <Button
                    onClick={() => setShowDeliveryConfig(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    <Send className="w-4 h-4" />
                    Send Now
                  </Button>
                )}
              </div>
            </div>

            {/* Report Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white print:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Patient Progress Report</h2>
                  <p className="text-white/70 mt-1">
                    Generated: {new Date().toLocaleString("en-GB")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {scope === "all_wards"
                      ? "All Wards"
                      : scope === "single_ward"
                      ? `${WARDS.find(w => w.id === selectedWard)?.name || selectedWard}`
                      : "Selected Patients"}
                  </p>
                  <p className="text-white/70">{reportPatients.length} patients</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                {(() => {
                  const allTasks = reportPatients.flatMap(p => getTasksForPatient(p.id, tasks));
                  const completed = allTasks.filter(t => t.status === "completed").length;
                  const pending = allTasks.filter(t => t.status === "pending").length;
                  const inProgress = allTasks.filter(t => t.status === "in_progress").length;
                  const overdue = allTasks.filter(t => t.status === "overdue").length;

                  return (
                    <>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-3xl font-bold">{completed}</p>
                        <p className="text-white/70 text-sm">Completed</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-3xl font-bold">{inProgress}</p>
                        <p className="text-white/70 text-sm">In Progress</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-3xl font-bold">{pending}</p>
                        <p className="text-white/70 text-sm">Pending</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-3xl font-bold text-red-400">{overdue}</p>
                        <p className="text-white/70 text-sm">Overdue</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Patient Cards Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-2">
              {reportPatients.map((patient) => (
                <PatientReportCard
                  key={patient.id}
                  patient={patient}
                  tasks={getTasksForPatient(patient.id, tasks)}
                />
              ))}
            </div>

            {/* Report Footer */}
            <div className="text-center text-sm text-gray-500 py-4 print:py-2">
              <p>
                Report generated by Inpatient Hub - {new Date().toLocaleString("en-GB")}
              </p>
              <p className="text-xs mt-1">
                This report contains patient information - handle according to Trust data protection policies
              </p>
            </div>
          </>
        )}
      </div>

      {/* Delivery Config Modal (Max+ only) */}
      <DeliveryConfigModal
        isOpen={showDeliveryConfig}
        onClose={() => setShowDeliveryConfig(false)}
        config={deliveryConfig}
        onSave={setDeliveryConfig}
      />
    </MainLayout>
  );
}
