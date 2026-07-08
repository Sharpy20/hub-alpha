"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import {
  DEMO_PATIENTS,
  getTasksForPatient,
  getPatientsByWard,
} from "@/lib/data/tasks";
import { WARDS, Patient, DiaryTask, TaskPriority, PRIORITY_CONFIG } from "@/lib/types";
import { CareReviewRollup } from "@/components/reports/CareReviewRollup";
import {
  FileText,
  Users,
  Building2,
  UserCheck,
  Printer,
  Send,
  Clock,
  Mail,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Home,
  User,
  ListTodo,
  Zap,
  LayoutGrid,
  Table as TableIcon,
  Search,
  ArrowUpDown,
  X,
} from "lucide-react";

// Priority ranking + colours, shared by tiles and table so priority is visible
// everywhere in a report (Mike: priority colour was not carrying across).
const PRIORITY_RANK: Record<TaskPriority, number> = { urgent: 3, important: 2, routine: 1 };
const PRIORITY_DOT: Record<TaskPriority, string> = {
  urgent: "bg-red-500",
  important: "bg-amber-500",
  routine: "bg-emerald-400",
};
const PRIORITY_ROW: Record<TaskPriority, string> = {
  urgent: "bg-red-50 border-red-200",
  important: "bg-amber-50 border-amber-200",
  routine: "bg-slate-50 border-slate-200",
};

// Due date from any task type
const taskDueDate = (task: DiaryTask): string =>
  task.type === "appointment" ? task.appointmentDate : task.dueDate;

const isOutstanding = (t: DiaryTask) => t.status !== "completed" && t.status !== "cancelled";

interface PatientSummary {
  patient: Patient;
  tasks: DiaryTask[];
  total: number;
  completed: number;
  outstanding: number;
  overdue: number;
  inProgress: number;
  barriers: number;
  topPriority: TaskPriority | null;
}

function buildSummary(patient: Patient, tasks: DiaryTask[]): PatientSummary {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const outstandingTasks = tasks.filter(isOutstanding);
  const overdue = tasks.filter((t) => t.status === "overdue").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const barriers = outstandingTasks.filter((t) => t.blocksDischarge).length;
  let topPriority: TaskPriority | null = null;
  for (const t of outstandingTasks) {
    if (!topPriority || PRIORITY_RANK[t.priority] > PRIORITY_RANK[topPriority]) {
      topPriority = t.priority;
    }
  }
  return {
    patient,
    tasks,
    total: tasks.length,
    completed,
    outstanding: outstandingTasks.length,
    overdue,
    inProgress,
    barriers,
    topPriority,
  };
}

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

// Convert ward ID to ward name format used in patient data
// Types use lowercase id: "byron", but patient data uses capitalized: "Byron"
const getWardDataName = (wardId: string): string => {
  return wardId.charAt(0).toUpperCase() + wardId.slice(1);
};

// Patient Report Card Component - Minimal PII version (ward + name only)
const PatientReportCard = ({ patient, tasks }: { patient: Patient; tasks: DiaryTask[] }) => {
  const s = useMemo(() => buildSummary(patient, tasks), [patient, tasks]);

  // Sort tasks: outstanding first (highest priority, then due date), then completed
  const sortedTasks = useMemo(() => {
    const outstandingTasks = tasks
      .filter(isOutstanding)
      .sort((a, b) => {
        const p = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
        if (p !== 0) return p;
        return new Date(taskDueDate(a) || "").getTime() - new Date(taskDueDate(b) || "").getTime();
      });
    const completedTasks = tasks
      .filter((t) => t.status === "completed")
      .sort((a, b) => new Date(b.completedAt || "").getTime() - new Date(a.completedAt || "").getTime());
    return [...outstandingTasks, ...completedTasks];
  }, [tasks]);

  // Status color based on outstanding tasks
  const statusColor = s.barriers > 0
    ? "from-amber-500 to-orange-600"
    : s.outstanding > 3
      ? "from-blue-500 to-indigo-600"
      : s.outstanding > 0
        ? "from-blue-500 to-indigo-600"
        : "from-emerald-500 to-green-600";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow print-patient-card">
      {/* Header - Minimal: Name and Ward only */}
      <div className={`bg-gradient-to-r ${statusColor} p-4 text-white print-report-header`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center print-hide">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold">{patient.name}</h3>
            <p className="text-white/80 text-sm">{patient.ward} Ward</p>
          </div>
          {s.barriers > 0 && (
            <span className="flex-shrink-0 bg-white/25 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
              🚧 {s.barriers} barrier{s.barriers > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 border-b border-gray-100 print-stats-row">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <ListTodo className="w-4 h-4 print-hide" />
            <span className="text-xl font-bold">{s.total}</span>
          </div>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600">
            <Clock className="w-4 h-4 print-hide" />
            <span className="text-xl font-bold">{s.outstanding}</span>
          </div>
          <p className="text-xs text-gray-500">Outstanding</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-red-600">
            <span className="text-xl font-bold">{s.overdue}</span>
          </div>
          <p className="text-xs text-gray-500">Overdue</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-4 h-4 print-hide" />
            <span className="text-xl font-bold">{s.completed}</span>
          </div>
          <p className="text-xs text-gray-500">Done</p>
        </div>
      </div>

      {/* All Tasks List */}
      <div className="p-4 print-task-list">
        <div className="space-y-2">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => {
              const done = task.status === "completed";
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border print-task-item ${
                    done ? "bg-emerald-50 border-emerald-100" : PRIORITY_ROW[task.priority]
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 print-hide" />
                  ) : (
                    <span
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`}
                      title={`${PRIORITY_CONFIG[task.priority].label} priority`}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 print-truncate">
                      {done ? "✓ " : "○ "}{task.title}
                      {!done && task.blocksDischarge && (
                        <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 align-middle">
                          🚧 blocks discharge
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {done ? (
                        <>Done: {task.completedBy || "Unknown"}</>
                      ) : (
                        <>
                          {PRIORITY_CONFIG[task.priority].label} · Due:{" "}
                          {taskDueDate(task) ? new Date(taskDueDate(task)).toLocaleDateString("en-GB") : "No date"}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No tasks recorded</p>
          )}
        </div>

        {/* Status Summary */}
        <div className={`mt-4 p-3 rounded-xl print-summary ${
          s.outstanding > 3
            ? "bg-amber-50 border border-amber-100"
            : s.outstanding > 0
              ? "bg-blue-50 border border-blue-100"
              : "bg-emerald-50 border border-emerald-100"
        }`}>
          <p className={`text-sm font-medium ${
            s.outstanding > 3
              ? "text-amber-700"
              : s.outstanding > 0
                ? "text-blue-700"
                : "text-emerald-700"
          }`}>
            {s.outstanding > 0
              ? `${s.outstanding} task${s.outstanding > 1 ? "s" : ""} outstanding${s.barriers > 0 ? ` · ${s.barriers} blocking discharge` : ""}`
              : "All tasks completed"}
          </p>
        </div>
      </div>
    </div>
  );
};

// Sortable column keys for the table overview
type SortKey = "name" | "ward" | "priority" | "total" | "outstanding" | "overdue" | "barriers" | "completed";

// Table overview row - patient summary, expandable to the task list
const PatientTableRow = ({
  summary,
  expanded,
  onToggle,
}: {
  summary: PatientSummary;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const s = summary;
  const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
  const sortedTasks = useMemo(() => {
    const out = s.tasks.filter(isOutstanding).sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
    const done = s.tasks.filter((t) => t.status === "completed");
    return [...out, ...done];
  }, [s.tasks]);

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-violet-50/40">
        <td className="py-2.5 px-3">
          <button onClick={onToggle} className="flex items-center gap-2 text-left" aria-expanded={expanded}>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform print-hide ${expanded ? "rotate-180" : ""}`} />
            <span className="font-semibold text-gray-900">{s.patient.name}</span>
          </button>
        </td>
        <td className="py-2.5 px-3 text-gray-600">{s.patient.ward}</td>
        <td className="py-2.5 px-3">
          {s.topPriority ? (
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT[s.topPriority]}`} />
              <span className="text-gray-700">{PRIORITY_CONFIG[s.topPriority].label}</span>
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="py-2.5 px-3 text-center text-gray-700">{s.total}</td>
        <td className="py-2.5 px-3 text-center font-medium text-amber-700">{s.outstanding}</td>
        <td className="py-2.5 px-3 text-center font-medium text-red-600">{s.overdue || <span className="text-gray-300">0</span>}</td>
        <td className="py-2.5 px-3 text-center">
          {s.barriers > 0 ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              🚧 {s.barriers}
            </span>
          ) : (
            <span className="text-gray-300">0</span>
          )}
        </td>
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2 min-w-[90px]">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-9 text-right">{pct}%</span>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/60">
          <td colSpan={8} className="px-3 pb-3 pt-1">
            <div className="space-y-1.5">
              {sortedTasks.length === 0 && <p className="text-sm text-gray-400 py-1">No tasks recorded</p>}
              {sortedTasks.map((task) => {
                const done = task.status === "completed";
                return (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
                    )}
                    <span className={done ? "text-gray-500 line-through" : "text-gray-800"}>{task.title}</span>
                    {!done && task.blocksDischarge && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        🚧 blocks discharge
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {done ? (task.completedBy || "done") : taskDueDate(task) ? new Date(taskDueDate(task)).toLocaleDateString("en-GB") : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
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
      <div role="dialog" aria-modal="true" aria-label="Schedule delivery" className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
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
                      ? "ward.reports@example.nhs.net"
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
  const { activeWard } = useApp();
  const { tasks } = useTasks();
  const isMaxPlus = true;

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

  const reportPatients = useMemo(() => {
    if (scope === "all_wards") {
      return DEMO_PATIENTS.filter(p => p.status !== "discharged");
    } else if (scope === "single_ward") {
      return getPatientsByWard(getWardDataName(selectedWard)).filter(p => p.status !== "discharged");
    } else {
      return DEMO_PATIENTS.filter(p => selectedPatients.includes(p.id) && p.status !== "discharged");
    }
  }, [scope, selectedWard, selectedPatients]);

  const allActivePatients = useMemo(() => {
    return DEMO_PATIENTS.filter(p => p.status !== "discharged");
  }, []);

  // View + filters for the generated report (tiles vs table overview)
  const [viewMode, setViewMode] = useState<"tiles" | "table">("tiles");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "outstanding" | "done">("all");
  const [barriersOnly, setBarriersOnly] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [wardFilter, setWardFilter] = useState<string[]>([]); // empty = all wards in scope
  const [sortKey, setSortKey] = useState<SortKey>("outstanding");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Build a summary for every patient in the report scope
  const summaries = useMemo(
    () => reportPatients.map((p) => buildSummary(p, getTasksForPatient(p.id, tasks))),
    [reportPatients, tasks]
  );

  // Wards present in this report (for the ward chips)
  const scopeWards = useMemo(() => {
    const set = new Set(summaries.map((s) => s.patient.ward));
    return WARDS.filter((w) => set.has(getWardDataName(w.id)));
  }, [summaries]);

  // Apply filters
  const filtered = useMemo(() => {
    return summaries.filter((s) => {
      if (search && !s.patient.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (wardFilter.length > 0 && !wardFilter.includes(s.patient.ward.toLowerCase())) return false;
      if (barriersOnly && s.barriers === 0) return false;
      if (overdueOnly && s.overdue === 0) return false;
      if (statusFilter === "outstanding" && s.outstanding === 0) return false;
      if (statusFilter === "done" && s.outstanding > 0) return false;
      if (priorityFilter !== "all" && !s.tasks.some((t) => isOutstanding(t) && t.priority === priorityFilter)) return false;
      return true;
    });
  }, [summaries, search, wardFilter, barriersOnly, overdueOnly, statusFilter, priorityFilter]);

  // Sort (used by both views; tiles follow the same order)
  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const val = (s: PatientSummary): number | string => {
      switch (sortKey) {
        case "name": return s.patient.name.toLowerCase();
        case "ward": return s.patient.ward.toLowerCase();
        case "priority": return s.topPriority ? PRIORITY_RANK[s.topPriority] : 0;
        case "total": return s.total;
        case "outstanding": return s.outstanding;
        case "overdue": return s.overdue;
        case "barriers": return s.barriers;
        case "completed": return s.completed;
      }
    };
    return [...filtered].sort((a, b) => {
      const av = val(a); const bv = val(b);
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "ward" ? "asc" : "desc");
    }
  };

  const toggleRow = (id: string) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const activeFilterCount =
    (search ? 1 : 0) + wardFilter.length + (barriersOnly ? 1 : 0) + (overdueOnly ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearch(""); setWardFilter([]); setBarriersOnly(false); setOverdueOnly(false);
    setStatusFilter("all"); setPriorityFilter("all");
  };

  // Roll-up stats reflect what is shown (after filters)
  const rollup = useMemo(() => {
    return filtered.reduce(
      (acc, s) => {
        acc.completed += s.completed;
        acc.inProgress += s.inProgress;
        acc.pending += s.tasks.filter((t) => t.status === "pending").length;
        acc.overdue += s.overdue;
        acc.barriers += s.barriers;
        return acc;
      },
      { completed: 0, inProgress: 0, pending: 0, overdue: 0, barriers: 0 }
    );
  }, [filtered]);

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
                  Generate full patient status audits
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
            {/* Care review roll-up (weekly audit at a glance) */}
            <CareReviewRollup />

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
                          {getPatientsByWard(getWardDataName(selectedWard)).filter(p => p.status !== "discharged").length} patients
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
                            .flatMap(ward => getPatientsByWard(getWardDataName(ward.id)).filter(p => p.status !== "discharged"))
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
                              .flatMap(wardId => getPatientsByWard(getWardDataName(wardId)).map(p => p.id));
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
                          const wardPatients = getPatientsByWard(getWardDataName(ward.id)).filter(p => p.status !== "discharged");
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
                  <p className="text-white/70">
                    {filtered.length}{filtered.length !== reportPatients.length ? ` of ${reportPatients.length}` : ""} patients
                  </p>
                </div>
              </div>

              {/* Summary Stats (reflect current filters) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-3xl font-bold">{rollup.completed}</p>
                  <p className="text-white/70 text-sm">Completed</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-3xl font-bold">{rollup.inProgress}</p>
                  <p className="text-white/70 text-sm">In Progress</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-3xl font-bold">{rollup.pending}</p>
                  <p className="text-white/70 text-sm">Pending</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-3xl font-bold text-red-400">{rollup.overdue}</p>
                  <p className="text-white/70 text-sm">Overdue</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-3xl font-bold text-amber-300">🚧 {rollup.barriers}</p>
                  <p className="text-white/70 text-sm">Barriers to discharge</p>
                </div>
              </div>
            </div>

            {/* Toolbar: view toggle + filters (hidden on print) */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3 print-hide">
              <div className="flex flex-wrap items-center gap-3">
                {/* View toggle */}
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setViewMode("tiles")}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === "tiles" ? "bg-violet-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" /> Tiles
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === "table" ? "bg-violet-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <TableIcon className="w-4 h-4" /> Table
                  </button>
                </div>

                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search patient..."
                    aria-label="Search patient"
                    className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* Priority filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as "all" | TaskPriority)}
                  aria-label="Filter by priority"
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="all">Any priority</option>
                  <option value="urgent">🔴 Urgent</option>
                  <option value="important">🟡 Important</option>
                  <option value="routine">🟢 Routine</option>
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "outstanding" | "done")}
                  aria-label="Filter by status"
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-violet-500 focus:outline-none"
                >
                  <option value="all">All patients</option>
                  <option value="outstanding">Has outstanding</option>
                  <option value="done">All done</option>
                </select>

                {/* Toggles */}
                <button
                  onClick={() => setBarriersOnly((v) => !v)}
                  aria-pressed={barriersOnly}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    barriersOnly ? "bg-amber-50 border-amber-400 text-amber-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  🚧 Barriers only
                </button>
                <button
                  onClick={() => setOverdueOnly((v) => !v)}
                  aria-pressed={overdueOnly}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    overdueOnly ? "bg-red-50 border-red-400 text-red-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Overdue only
                </button>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" /> Clear ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Ward chips (only when the report spans more than one ward) */}
              {scopeWards.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ward</span>
                  {scopeWards.map((w) => {
                    const on = wardFilter.includes(w.id);
                    return (
                      <button
                        key={w.id}
                        onClick={() => setWardFilter((prev) => (on ? prev.filter((x) => x !== w.id) : [...prev, w.id]))}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          on ? "bg-violet-600 text-white border-violet-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {w.name.replace(" Ward", "")}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Priority legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                <span className="font-medium text-gray-400 uppercase tracking-wider">Priority</span>
                {(["urgent", "important", "routine"] as TaskPriority[]).map((p) => (
                  <span key={p} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT[p]}`} />
                    {PRIORITY_CONFIG[p].label}
                  </span>
                ))}
                <span className="flex items-center gap-1">🚧 Barrier to discharge</span>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
                No patients match the current filters.
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="ml-2 text-violet-600 font-medium hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : viewMode === "tiles" ? (
              /* Patient Cards Grid */
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-2">
                {sorted.map((s) => (
                  <PatientReportCard key={s.patient.id} patient={s.patient} tasks={s.tasks} />
                ))}
              </div>
            ) : (
              /* Table overview */
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-gray-400 border-b border-gray-200">
                      {([
                        { key: "name", label: "Patient", align: "left" },
                        { key: "ward", label: "Ward", align: "left" },
                        { key: "priority", label: "Top priority", align: "left" },
                        { key: "total", label: "Total", align: "center" },
                        { key: "outstanding", label: "Outstanding", align: "center" },
                        { key: "overdue", label: "Overdue", align: "center" },
                        { key: "barriers", label: "Barriers", align: "center" },
                        { key: "completed", label: "Progress", align: "left" },
                      ] as { key: SortKey; label: string; align: string }[]).map((col) => (
                        <th key={col.key} className={`py-2.5 px-3 ${col.align === "center" ? "text-center" : "text-left"}`}>
                          <button
                            onClick={() => toggleSort(col.key)}
                            className={`inline-flex items-center gap-1 hover:text-gray-700 ${sortKey === col.key ? "text-violet-600" : ""}`}
                          >
                            {col.label}
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((s) => (
                      <PatientTableRow
                        key={s.patient.id}
                        summary={s}
                        expanded={expandedRows.has(s.patient.id)}
                        onToggle={() => toggleRow(s.patient.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Report Footer */}
            <div className="text-center text-sm text-gray-500 py-4 print:py-2">
              <p>
                Report generated by wardHub - {new Date().toLocaleString("en-GB")}
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
