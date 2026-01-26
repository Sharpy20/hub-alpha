"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  EyeOff,
  CalendarDays,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Users,
  UserSquare2,
  ClipboardList,
  Hand,
  Repeat,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DiaryTask,
  WardTask,
  PatientTask,
  Appointment,
  SHIFT_CONFIG,
  TASK_CATEGORY_CONFIG,
  PRIORITY_CONFIG,
} from "@/lib/types";
import {
  StaffManagementModal,
  PatientNamesModal,
  StaffTasksModal,
  TaskDetailModal,
} from "@/components/modals";

// Helper functions
const formatDate = (date: Date) => date.toISOString().split("T")[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDisplayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};

const isPast = (dateStr: string) => {
  // Compare date strings directly to avoid timezone issues
  const todayStr = formatDate(new Date());
  return dateStr < todayStr;
};

// Task Card Component
function TaskCard({
  task,
  onToggleComplete,
  onClaim,
  onSteal,
  onClick,
  currentUserName,
  compact = false,
}: {
  task: DiaryTask;
  onToggleComplete: (id: string) => void;
  onClaim?: (id: string) => void;
  onSteal?: (id: string) => void;
  onClick?: (task: DiaryTask) => void;
  currentUserName?: string;
  compact?: boolean;
}) {
  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";
  const isInProgress = task.status === "in_progress";
  const isClaimed = !!task.claimedBy;
  const isClaimedByMe = task.claimedBy === currentUserName;

  let gradient = "from-gray-400 to-gray-600";
  let icon = "📌";
  let subtitle = "";

  if (task.type === "ward") {
    const shiftConfig = SHIFT_CONFIG[task.shift];
    gradient = shiftConfig.gradient;
    icon = shiftConfig.icon;
    subtitle = `${shiftConfig.label} Shift`;
  } else if (task.type === "patient") {
    const catConfig = TASK_CATEGORY_CONFIG[task.category];
    gradient = catConfig.gradient;
    icon = catConfig.icon;
    subtitle = ""; // Patient name shown separately for larger display
  } else if (task.type === "appointment") {
    gradient = "from-blue-500 to-blue-700";
    icon = "📅";
    subtitle = task.appointmentTime || "";
  }

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  // Claimed status message
  let claimedMessage = "";
  if (isClaimed && !isCompleted) {
    if (isInProgress) {
      claimedMessage = `${task.claimedBy} working on`;
    } else {
      claimedMessage = `Claimed by ${task.claimedBy}`;
    }
  }

  return (
    <div
      onClick={() => onClick?.(task)}
      className={`rounded-xl overflow-hidden transition-all cursor-pointer ${
        isCompleted ? "opacity-60" : "hover:shadow-lg hover:scale-[1.02]"
      } ${compact ? "text-sm" : ""}`}
    >
      <div className={`bg-gradient-to-r ${gradient} p-3 ${compact ? "p-2" : "p-3"}`}>
        <div className="flex items-start gap-2">
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center transition-all ${
              isCompleted ? "bg-white/30" : "hover:bg-white/20"
            }`}
          >
            {isCompleted && <Check className="w-4 h-4 text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={compact ? "text-lg" : "text-xl"}>{icon}</span>
              <h4
                className={`font-semibold text-white truncate ${
                  isCompleted ? "line-through" : ""
                } ${compact ? "text-sm" : ""}`}
              >
                {task.title}
              </h4>
            </div>
            {subtitle && <p className="text-white/70 text-xs mt-0.5 truncate">{subtitle}</p>}

            {/* Patient name - larger display */}
            {(task.type === "patient" || task.type === "appointment") && task.patientName && (
              <p className={`text-white font-medium mt-0.5 truncate ${compact ? "text-xs" : "text-sm"}`}>
                👤 {task.patientName}
              </p>
            )}

            {/* Claimed status */}
            {claimedMessage && (
              <p className="text-white/90 text-xs mt-1 flex items-center gap-1 bg-white/20 rounded px-1.5 py-0.5 inline-flex">
                <Hand className="w-3 h-3" />
                {claimedMessage}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isOverdue && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                Overdue
              </span>
            )}
            <span title={priorityConfig.label}>{priorityConfig.icon}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-2 flex items-center gap-2">
          {/* Claim button - only show if not completed and not claimed by someone else */}
          {!isCompleted && !isClaimed && onClaim && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClaim(task.id);
              }}
              className="flex items-center gap-1 text-white/90 text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
            >
              <Hand className="w-3 h-3" />
              Claim
            </button>
          )}

          {/* Unclaim button - only if claimed by current user and not completed */}
          {!isCompleted && isClaimedByMe && onClaim && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClaim(task.id); // Toggle - will unclaim
              }}
              className="flex items-center gap-1 text-white/90 text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
            >
              <Hand className="w-3 h-3" />
              Unclaim
            </button>
          )}

          {/* Steal button - only if claimed by someone else and not completed */}
          {!isCompleted && isClaimed && !isClaimedByMe && onSteal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSteal(task.id);
              }}
              className="flex items-center gap-1 text-white/90 text-xs bg-amber-500/50 hover:bg-amber-500/70 rounded px-2 py-1 transition-colors"
              title="Take over this task from the current owner"
            >
              <Hand className="w-3 h-3" />
              Steal
            </button>
          )}

          {(task.type === "patient" || task.type === "appointment") && task.linkedReferralId && (
            <Link
              href={`/referrals/${task.linkedReferralId}`}
              className="flex items-center gap-1 text-white/80 text-xs hover:text-white no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span>📋</span>
              <span className="underline">Referral</span>
            </Link>
          )}
          {(task.type === "ward" || task.type === "patient" || task.type === "appointment") && task.linkedGuideId && (
            <Link
              href={`/how-to/${task.linkedGuideId}`}
              className="flex items-center gap-1 text-white/80 text-xs hover:text-white no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span>📖</span>
              <span className="underline">Guide</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  count,
  children,
  expanded,
  onToggle,
}: {
  title: string;
  icon: string;
  count: number;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {title}
          </span>
          <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
            {count}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && <div className="space-y-2 mt-2">{children}</div>}
    </div>
  );
}

// Type for section expand state
interface SectionExpandState {
  wardTasks: boolean;
  patientTasks: boolean;
  appointments: boolean;
}

// Day Column Component
function DayColumn({
  date,
  tasks,
  isFocused,
  hideCompleted,
  onToggleComplete,
  onClaim,
  onSteal,
  onTaskClick,
  currentUserName,
  showAddButton,
  onAddTask,
  onClick,
  onHeaderClick,
}: {
  date: string;
  tasks: DiaryTask[];
  isFocused: boolean;
  hideCompleted: boolean;
  onToggleComplete: (id: string) => void;
  onClaim?: (id: string) => void;
  onSteal?: (id: string) => void;
  onTaskClick?: (task: DiaryTask) => void;
  currentUserName?: string;
  showAddButton?: boolean;
  onAddTask?: () => void;
  onClick?: () => void;
  onHeaderClick?: () => void;
}) {
  const todayDate = formatDate(new Date());
  const isPastDay = isPast(date) && date !== todayDate;
  const isFutureDay = !isPastDay && date !== todayDate;
  const isToday = date === todayDate;

  // Compute default expanded states based on day type
  // Past days: appointments only
  // Today: all sections
  // Future: patient tasks + appointments
  const getDefaultExpanded = (): SectionExpandState => ({
    wardTasks: isToday,
    patientTasks: isToday || isFutureDay,
    appointments: true, // Always expanded for all days
  });

  // Use state to allow user toggling, initialized with smart defaults
  const [expandedState, setExpandedState] = useState<SectionExpandState>(getDefaultExpanded);

  // Toggle function that actually works
  const toggleSection = (section: keyof SectionExpandState) => {
    setExpandedState(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const wardTasksExpanded = expandedState.wardTasks;
  const patientTasksExpanded = expandedState.patientTasks;
  const appointmentsExpanded = expandedState.appointments;

  const wardTasks = tasks.filter((t) => t.type === "ward") as WardTask[];
  const patientTasks = tasks.filter((t) => t.type === "patient") as PatientTask[];
  const appointments = tasks.filter((t) => t.type === "appointment") as Appointment[];

  const filterCompleted = (items: DiaryTask[]) =>
    hideCompleted ? items.filter((t) => t.status !== "completed") : items;

  // Only show ward tasks for today
  const showWardTasks = isToday;
  const visibleWardTasks = showWardTasks ? filterCompleted(wardTasks) : [];
  const visiblePatientTasks = filterCompleted(patientTasks);
  const visibleAppointments = filterCompleted(appointments);

  const totalVisible =
    visibleWardTasks.length + visiblePatientTasks.length + visibleAppointments.length;

  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 transition-all duration-300 cursor-pointer ${
        isFocused ? "w-80" : "w-52"
      } bg-white rounded-xl border-2 ${
        isFocused
          ? "border-indigo-400 shadow-xl"
          : isToday
          ? "border-indigo-200"
          : "border-gray-200 hover:border-gray-300"
      } overflow-hidden`}
    >
      {/* Day header - clickable to open full screen */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onHeaderClick?.();
        }}
        className={`p-3 text-center transition-all cursor-pointer hover:opacity-90 ${
          isFocused
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            : isToday
            ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
            : isPastDay
            ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
        }`}
        title="Click to open full-screen view"
      >
        <p className={`font-bold ${isFocused ? "text-lg" : "text-sm"}`}>
          {formatDisplayDate(date)}
        </p>
        <p className={`text-xs ${isFocused ? "text-white/70" : "opacity-70"}`}>
          {new Date(date).toLocaleDateString("en-GB", { weekday: "long" })}
        </p>
        {!isFocused && totalVisible > 0 && (
          <p className="text-xs mt-1 font-medium">{totalVisible} task{totalVisible !== 1 ? 's' : ''}</p>
        )}
        <p className={`text-xs mt-1 ${isFocused ? "text-white/50" : "text-gray-400"}`}>
          📺 tap for full view
        </p>
      </div>

      {/* Tasks content - always show, with compact mode for non-focused */}
      <div className={`${isFocused ? "p-3" : "p-2"} max-h-[65vh] overflow-y-auto`}>
        {/* Ward Tasks */}
        <CollapsibleSection
          title="Ward Tasks"
          icon="🏥"
          count={visibleWardTasks.length}
          expanded={wardTasksExpanded}
          onToggle={() => toggleSection("wardTasks")}
        >
          {visibleWardTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onClaim={onClaim}
              onSteal={onSteal}
              onClick={onTaskClick}
              currentUserName={currentUserName}
              compact={!isFocused}
              />
            ))}
          </CollapsibleSection>

          {/* Patient Tasks */}
        <CollapsibleSection
          title="Patient Tasks"
          icon="👤"
          count={visiblePatientTasks.length}
          expanded={patientTasksExpanded}
          onToggle={() => toggleSection("patientTasks")}
        >
          {visiblePatientTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onClaim={onClaim}
              onSteal={onSteal}
              onClick={onTaskClick}
              currentUserName={currentUserName}
              compact={!isFocused}
            />
          ))}
        </CollapsibleSection>

        {/* Appointments */}
        <CollapsibleSection
          title="Appointments"
          icon="📅"
          count={visibleAppointments.length}
          expanded={appointmentsExpanded}
          onToggle={() => toggleSection("appointments")}
        >
          {visibleAppointments.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onClaim={onClaim}
              onSteal={onSteal}
              onClick={onTaskClick}
              currentUserName={currentUserName}
              compact={!isFocused}
            />
          ))}
        </CollapsibleSection>

        {/* Empty state */}
        {totalVisible === 0 && (
          <div className={`text-center ${isFocused ? "py-8" : "py-4"} text-gray-400`}>
            <p className={isFocused ? "text-3xl mb-2" : "text-xl mb-1"}>✨</p>
            <p className={isFocused ? "text-sm" : "text-xs"}>No tasks</p>
          </div>
        )}

        {/* Add task button - only on focused day */}
        {showAddButton && isFocused && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddTask?.();
            }}
            className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Task</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Add Task Modal
function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Partial<DiaryTask>) => void;
}) {
  const [taskType, setTaskType] = useState<"ward" | "patient" | "appointment">("ward");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("referral");
  const [patientName, setPatientName] = useState("");
  const [priority, setPriority] = useState<"routine" | "important" | "urgent">("routine");
  const [linkedReferral, setLinkedReferral] = useState("");
  const [linkedGuide, setLinkedGuide] = useState("");

  // Ward task specific - repeating vs one-off
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Default all days
  const [selectedShift, setSelectedShift] = useState<"early" | "late" | "night">("early");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [wardTaskDate, setWardTaskDate] = useState(formatDate(new Date())); // Date for one-off ward tasks

  // Appointment specific
  const [appointmentDate, setAppointmentDate] = useState(formatDate(new Date()));
  const [timeType, setTimeType] = useState<"preset" | "exact">("preset");
  const [presetTime, setPresetTime] = useState<"morning" | "afternoon" | "evening" | "night">("morning");
  const [exactTime, setExactTime] = useState("09:00");
  const [duration, setDuration] = useState("");

  // Appointment enhancements - linked referral, guide, and details
  const [apptLinkedReferral, setApptLinkedReferral] = useState("");
  const [apptLinkedGuide, setApptLinkedGuide] = useState("");
  const [apptMoreDetails, setApptMoreDetails] = useState("");
  const [showApptReferral, setShowApptReferral] = useState(false);
  const [showApptGuide, setShowApptGuide] = useState(false);
  const [showApptDetails, setShowApptDetails] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;

    const baseTask = {
      title,
      priority,
      status: "pending" as const,
      dueDate: formatDate(new Date()),
      createdAt: formatDate(new Date()),
      createdBy: "Current User",
      ward: "Byron",
    };

    if (taskType === "patient") {
      onAdd({
        ...baseTask,
        type: "patient",
        category: category as any,
        patientName: patientName || undefined,
        linkedReferralId: category === "referral" ? (linkedReferral || undefined) : undefined,
        linkedGuideId: category !== "referral" ? (linkedGuide || undefined) : undefined,
        carryOver: true,
      });
    } else if (taskType === "appointment") {
      const timeValue = timeType === "preset"
        ? ({ morning: "AM", afternoon: "PM", evening: "Evening", night: "Night" }[presetTime])
        : exactTime;
      // Build description from duration and more details
      const descParts = [];
      if (duration) descParts.push(`Duration: ${duration}`);
      if (apptMoreDetails.trim()) descParts.push(apptMoreDetails.trim());
      const description = descParts.length > 0 ? descParts.join("\n") : undefined;

      onAdd({
        ...baseTask,
        type: "appointment",
        patientName: patientName || undefined,
        appointmentDate: appointmentDate,
        appointmentTime: timeValue,
        description,
        linkedReferralId: showApptReferral && apptLinkedReferral ? apptLinkedReferral : undefined,
        linkedGuideId: showApptGuide && apptLinkedGuide ? apptLinkedGuide : undefined,
      });
    } else {
      // Ward task - use wardTaskDate for one-off, today for recurring
      const taskDueDate = isRecurring ? formatDate(new Date()) : wardTaskDate;
      onAdd({
        ...baseTask,
        type: "ward",
        dueDate: taskDueDate,
        shift: selectedShift,
        isRecurring,
        recurringDays: isRecurring ? recurringDays : undefined,
        carryOver: false,
        linkedGuideId: linkedGuide || undefined,
        // If requiresApproval is set for repeating tasks, add a note to the description
        description: isRecurring && requiresApproval ? "✅ Leadership approved" : undefined,
      });
    }

    // Reset form
    setTitle("");
    setPatientName("");
    setLinkedReferral("");
    setLinkedGuide("");
    setAppointmentDate(formatDate(new Date()));
    setTimeType("preset");
    setPresetTime("morning");
    setExactTime("09:00");
    setDuration("");
    onClose();
  };

  const REFERRAL_OPTIONS = [
    { id: "imha-advocacy", label: "IMHA / Advocacy" },
    { id: "picu", label: "PICU" },
    { id: "safeguarding", label: "Safeguarding Adults" },
    { id: "dietitian", label: "Dietitian" },
    { id: "social-care", label: "Social Care" },
    { id: "homeless-discharge", label: "Housing / DTR" },
  ];

  const GUIDE_OPTIONS = [
    { id: "fridge-temps", label: "Fridge Temperature Check" },
    { id: "capacity-assessment", label: "Capacity Assessment" },
    { id: "news2", label: "NEWS2 Observations" },
    { id: "section-17", label: "Section 17 Leave" },
    { id: "rapid-tranq", label: "Rapid Tranquillisation" },
    { id: "discharge-planning", label: "Discharge Planning" },
  ];

  // Get placeholder based on task type
  const getPlaceholder = () => {
    switch (taskType) {
      case "appointment":
        return "e.g., CPN visiting";
      case "ward":
        return "e.g., Record fridge temps";
      default:
        return "e.g., Complete capacity assessment";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Task</h2>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { type: "ward" as const, icon: "🏥", label: "Ward Task" },
            { type: "patient" as const, icon: "👤", label: "Patient Task" },
            { type: "appointment" as const, icon: "📅", label: "Appointment" },
          ].map((opt) => (
            <button
              key={opt.type}
              onClick={() => setTaskType(opt.type)}
              className={`p-3 rounded-xl text-center transition-all ${
                taskType === opt.type
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-2xl block mb-1">{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {(taskType === "patient" || taskType === "appointment") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g., John Smith"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {/* Appointment specific fields */}
        {taskType === "appointment" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setTimeType("preset")}
                  className={`flex-1 p-2 rounded-lg text-sm transition-all ${
                    timeType === "preset"
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Time of Day
                </button>
                <button
                  onClick={() => setTimeType("exact")}
                  className={`flex-1 p-2 rounded-lg text-sm transition-all ${
                    timeType === "exact"
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Exact Time
                </button>
              </div>
              {timeType === "preset" ? (
                <div className="grid grid-cols-4 gap-2">
                  {(["morning", "afternoon", "evening", "night"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setPresetTime(t)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        presetTime === t
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="block text-lg">
                        {t === "morning" ? "🌅" : t === "afternoon" ? "☀️" : t === "evening" ? "🌇" : "🌙"}
                      </span>
                      <span className="text-xs capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="time"
                  value={exactTime}
                  onChange={(e) => setExactTime(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (optional)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option value="">No duration specified</option>
                <option value="15 mins">15 minutes</option>
                <option value="30 mins">30 minutes</option>
                <option value="45 mins">45 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="1.5 hours">1.5 hours</option>
                <option value="2 hours">2 hours</option>
                <option value="Half day">Half day</option>
                <option value="Full day">Full day</option>
              </select>
            </div>

            {/* Appointment enhancements - toggleable options */}
            <div className="mb-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Additional Options</p>

              {/* Link a referral toggle */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowApptReferral(!showApptReferral)}
                  className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                    showApptReferral ? "bg-indigo-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>📄</span>
                    <span>Link a referral workflow</span>
                  </span>
                  <span className={`text-lg ${showApptReferral ? "text-indigo-600" : "text-gray-400"}`}>
                    {showApptReferral ? "−" : "+"}
                  </span>
                </button>
                {showApptReferral && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <select
                      value={apptLinkedReferral}
                      onChange={(e) => setApptLinkedReferral(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select referral...</option>
                      {REFERRAL_OPTIONS.map((ref) => (
                        <option key={ref.id} value={ref.id}>
                          {ref.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Link a how-to guide toggle */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowApptGuide(!showApptGuide)}
                  className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                    showApptGuide ? "bg-emerald-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>📚</span>
                    <span>Link a how-to guide</span>
                  </span>
                  <span className={`text-lg ${showApptGuide ? "text-emerald-600" : "text-gray-400"}`}>
                    {showApptGuide ? "−" : "+"}
                  </span>
                </button>
                {showApptGuide && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <select
                      value={apptLinkedGuide}
                      onChange={(e) => setApptLinkedGuide(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Select guide...</option>
                      {GUIDE_OPTIONS.map((guide) => (
                        <option key={guide.id} value={guide.id}>
                          {guide.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* More details toggle */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowApptDetails(!showApptDetails)}
                  className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                    showApptDetails ? "bg-amber-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>📝</span>
                    <span>Add more details</span>
                  </span>
                  <span className={`text-lg ${showApptDetails ? "text-amber-600" : "text-gray-400"}`}>
                    {showApptDetails ? "−" : "+"}
                  </span>
                </button>
                {showApptDetails && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <textarea
                      value={apptMoreDetails}
                      onChange={(e) => setApptMoreDetails(e.target.value)}
                      placeholder="Add notes, attendees, location details, etc..."
                      rows={3}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Ward task specific fields */}
        {taskType === "ward" && (
          <>
            {/* Shift selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <div className="grid grid-cols-3 gap-2">
                {(["early", "late", "night"] as const).map((shift) => {
                  const config = SHIFT_CONFIG[shift];
                  return (
                    <button
                      key={shift}
                      onClick={() => setSelectedShift(shift)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        selectedShift === shift
                          ? `bg-gradient-to-r ${config.gradient} text-white`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-xl block">{config.icon}</span>
                      <span className="text-xs font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Task type toggle - One-off vs Repeating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Schedule</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsRecurring(false)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    !isRecurring
                      ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xl block">📌</span>
                  <span className="text-xs font-medium">One-off Task</span>
                </button>
                <button
                  onClick={() => setIsRecurring(true)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    isRecurring
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xl block">🔄</span>
                  <span className="text-xs font-medium">Repeating Task</span>
                </button>
              </div>
            </div>

            {/* One-off task date picker */}
            {!isRecurring && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={wardTaskDate}
                  onChange={(e) => setWardTaskDate(e.target.value)}
                  min={formatDate(new Date())} // Can't schedule in the past
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Repeating task settings */}
            {isRecurring && (
              <div className="mb-4 space-y-3">
                <div className="p-3 border border-indigo-200 rounded-xl bg-indigo-50">
                  <p className="text-xs font-medium text-indigo-800 mb-2">Repeats on:</p>
                  <div className="flex gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                      <button
                        key={day}
                        onClick={() => {
                          setRecurringDays((prev) =>
                            prev.includes(idx)
                              ? prev.filter((d) => d !== idx)
                              : [...prev, idx].sort()
                          );
                        }}
                        className={`flex-1 py-2 text-xs rounded transition-colors ${
                          recurringDays.includes(idx)
                            ? "bg-indigo-500 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setRecurringDays([0, 1, 2, 3, 4, 5, 6])}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      All days
                    </button>
                    <button
                      onClick={() => setRecurringDays([1, 2, 3, 4, 5])}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Weekdays
                    </button>
                    <button
                      onClick={() => setRecurringDays([0, 6])}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Weekends
                    </button>
                  </div>
                </div>

                {/* Leadership approval toggle - only for repeating tasks */}
                <label className="flex items-center gap-3 p-3 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 bg-amber-50/50">
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Has ward leadership approved this repeating task?</p>
                    <p className="text-xs text-gray-500">Mark if this task has been signed off by senior staff</p>
                  </div>
                </label>
              </div>
            )}
          </>
        )}

        {taskType === "patient" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TASK_CATEGORY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`p-2 rounded-lg text-left flex items-center gap-2 transition-all ${
                    category === key
                      ? `bg-gradient-to-r ${config.gradient} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{config.icon}</span>
                  <span className="text-sm capitalize">{key.replace("_", " ")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Referral guide link - only for referral category */}
        {taskType === "patient" && category === "referral" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Referral Guide (optional)
            </label>
            <select
              value={linkedReferral}
              onChange={(e) => setLinkedReferral(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="">No linked guide</option>
              {REFERRAL_OPTIONS.map((ref) => (
                <option key={ref.id} value={ref.id}>
                  {ref.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* How-to guide link - for non-referral patient tasks and ward tasks */}
        {((taskType === "patient" && category !== "referral") || taskType === "ward") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to How-To Guide (optional)
            </label>
            <select
              value={linkedGuide}
              onChange={(e) => setLinkedGuide(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            >
              <option value="">No linked guide</option>
              {GUIDE_OPTIONS.map((guide) => (
                <option key={guide.id} value={guide.id}>
                  {guide.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <div className="flex gap-2">
            {(["routine", "important", "urgent"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  priority === p
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{PRIORITY_CONFIG[p].icon}</span>
                <span className="text-sm capitalize">{p}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || (taskType === "appointment" && !appointmentDate)}
            className="flex-1 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

// Repeat Ward Tasks Modal - shows Mon-Sun overview
function RepeatWardTasksModal({
  isOpen,
  onClose,
  tasks,
  onEditTask,
  onDeleteTask,
}: {
  isOpen: boolean;
  onClose: () => void;
  tasks: WardTask[];
  onEditTask: (task: WardTask) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  if (!isOpen) return null;

  // Filter only recurring ward tasks
  const recurringTasks = tasks.filter((t) => t.isRecurring);

  // Days of the week
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get tasks for a specific day
  const getTasksForDay = (dayIndex: number): WardTask[] => {
    return recurringTasks.filter((t) => t.recurringDays?.includes(dayIndex));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Repeat className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Repeating Ward Tasks</h2>
              <p className="text-white/70 text-sm">{recurringTasks.length} recurring task{recurringTasks.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {recurringTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔄</p>
              <p className="text-gray-600 font-medium">No repeating ward tasks</p>
              <p className="text-gray-400 text-sm mt-1">Create a repeating task to see it here</p>
            </div>
          ) : (
            <>
              {/* All recurring tasks list - NOW ON TOP */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">All Repeating Tasks</h3>
                <div className="space-y-2">
                  {recurringTasks.map((task) => {
                    const shiftConfig = SHIFT_CONFIG[task.shift];
                    const activeDays = task.recurringDays?.map((d) => DAY_ABBREVS[d]).join(", ") || "None";
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${shiftConfig.gradient} flex items-center justify-center text-white`}>
                          <span className="text-lg">{shiftConfig.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            {shiftConfig.label} · {activeDays}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.description?.includes("✅") && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Approved
                            </span>
                          )}
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Grid - NOW ON BOTTOM, WIDER COLUMNS */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Weekly Schedule</h3>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-7 gap-3 min-w-[900px]">
                    {/* Day headers */}
                    {DAY_ABBREVS.map((day, idx) => (
                      <div
                        key={day}
                        className={`text-center p-3 font-semibold text-sm rounded-lg ${
                          idx === 0 || idx === 6
                            ? "bg-gray-100 text-gray-600"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {DAYS[idx]}
                      </div>
                    ))}

                    {/* Day columns */}
                    {DAY_ABBREVS.map((_, dayIndex) => {
                      const dayTasks = getTasksForDay(dayIndex);
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-[180px] bg-gray-50 rounded-lg p-3 space-y-2"
                        >
                          {dayTasks.length === 0 ? (
                            <p className="text-gray-300 text-xs text-center mt-8">No tasks</p>
                          ) : (
                            dayTasks.map((task) => {
                              const shiftConfig = SHIFT_CONFIG[task.shift];
                              return (
                                <div
                                  key={task.id}
                                  className={`bg-gradient-to-r ${shiftConfig.gradient} text-white rounded-lg p-3 text-sm`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold">{task.title}</p>
                                      <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                                        {shiftConfig.icon} {shiftConfig.label}
                                      </p>
                                      {task.description?.includes("✅") && (
                                        <p className="text-xs text-white/80 mt-1">✅ Approved</p>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <button
                                        onClick={() => onEditTask(task)}
                                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                                        title="Edit task"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteTask(task.id)}
                                        className="p-1.5 hover:bg-red-500/50 rounded transition-colors"
                                        title="Delete task"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Day Full Screen Modal - shows all tasks for a specific day
function DayFullScreenModal({
  isOpen,
  onClose,
  date,
  tasks,
  onToggleComplete,
  onClaim,
  onSteal,
  onTaskClick,
  currentUserName,
  hideCompleted,
}: {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  tasks: DiaryTask[];
  onToggleComplete: (id: string) => void;
  onClaim?: (id: string) => void;
  onSteal?: (id: string) => void;
  onTaskClick?: (task: DiaryTask) => void;
  currentUserName?: string;
  hideCompleted: boolean;
}) {
  if (!isOpen) return null;

  const todayStr = formatDate(new Date());
  const isToday = date === todayStr;
  const isPastDay = isPast(date) && !isToday;

  const wardTasks = tasks.filter((t) => t.type === "ward") as WardTask[];
  const patientTasks = tasks.filter((t) => t.type === "patient") as PatientTask[];
  const appointments = tasks.filter((t) => t.type === "appointment") as Appointment[];

  const filterCompleted = (items: DiaryTask[]) =>
    hideCompleted ? items.filter((t) => t.status !== "completed") : items;

  // Only show ward tasks for today
  const visibleWardTasks = isToday ? filterCompleted(wardTasks) : [];
  const visiblePatientTasks = filterCompleted(patientTasks);
  const visibleAppointments = filterCompleted(appointments);

  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "overdue" || t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white w-full h-full md:w-[95%] md:h-[95%] md:rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 ${
          isToday
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            : isPastDay
            ? "bg-gray-200 text-gray-700"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{formatDisplayDate(date)}</h2>
              <p className={`text-lg ${isToday || !isPastDay ? "text-white/80" : "text-gray-500"}`}>
                {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isToday || !isPastDay ? "bg-white/20 text-white" : "bg-gray-300 text-gray-700"
              }`}>
                <Clock className="w-4 h-4" />
                {pendingCount} pending
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isToday || !isPastDay ? "bg-white/20 text-white" : "bg-gray-300 text-gray-700"
              }`}>
                <Check className="w-4 h-4" />
                {completedCount} done
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isToday || !isPastDay ? "hover:bg-white/20 text-white" : "hover:bg-gray-300 text-gray-700"
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ward Tasks - only for today */}
            {isToday && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏥</span>
                  <h3 className="text-xl font-bold text-gray-900">Ward Tasks</h3>
                  <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-sm font-medium">
                    {visibleWardTasks.length}
                  </span>
                </div>
                {visibleWardTasks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                    <p className="text-3xl mb-2">✨</p>
                    <p>No ward tasks</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleWardTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onClaim={onClaim}
                        onSteal={onSteal}
                        onClick={onTaskClick}
                        currentUserName={currentUserName}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Patient Tasks */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <h3 className="text-xl font-bold text-gray-900">Patient Tasks</h3>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-sm font-medium">
                  {visiblePatientTasks.length}
                </span>
              </div>
              {visiblePatientTasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                  <p className="text-3xl mb-2">✨</p>
                  <p>No patient tasks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visiblePatientTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onClaim={onClaim}
                      onSteal={onSteal}
                      onClick={onTaskClick}
                      currentUserName={currentUserName}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Appointments */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <h3 className="text-xl font-bold text-gray-900">Appointments</h3>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-sm font-medium">
                  {visibleAppointments.length}
                </span>
              </div>
              {visibleAppointments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                  <p className="text-3xl mb-2">✨</p>
                  <p>No appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleAppointments.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onClaim={onClaim}
                      onSteal={onSteal}
                      onClick={onTaskClick}
                      currentUserName={currentUserName}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* If not today, show ward tasks note */}
            {!isToday && (
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏥</span>
                  <h3 className="text-xl font-bold text-gray-900">Ward Tasks</h3>
                </div>
                <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400">
                  <p className="text-3xl mb-2">📋</p>
                  <p>Ward tasks only show for today</p>
                  <p className="text-sm mt-1">They reset each day by shift</p>
                </div>
              </div>
            )}
          </div>

          {/* Empty state if no tasks at all */}
          {visibleWardTasks.length === 0 && visiblePatientTasks.length === 0 && visibleAppointments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">🎉</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">No tasks for this day</p>
              <p className="text-gray-500">Enjoy the clear schedule!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Click a task card to view details or edit
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Tasks Page
export default function TasksPage() {
  const { user, hasFeature, activeWard } = useApp();
  const { tasks, setTasks, claimTask, toggleComplete, updateTask, addTask } = useTasks();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [hideCompleted, setHideCompleted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusedDate, setFocusedDate] = useState<string>("");
  const [fullScreenDate, setFullScreenDate] = useState<string | null>(null);

  // Management modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showStaffTasksModal, setShowStaffTasksModal] = useState(false);
  const [showRepeatTasksModal, setShowRepeatTasksModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DiaryTask | null>(null);

  // Generate dates array (7 days back, today, 7 days forward)
  const today = new Date();
  const dates = Array.from({ length: 15 }, (_, i) => formatDate(addDays(today, i - 7)));
  const todayStr = formatDate(today);

  // Initialize focused date to today
  useEffect(() => {
    if (!focusedDate) {
      setFocusedDate(todayStr);
    }
  }, [focusedDate, todayStr]);

  const hasTaskFeature = hasFeature("ward_tasks");

  // Scroll to a specific date
  const scrollToDate = useCallback((date: string) => {
    const container = scrollContainerRef.current;
    const columnEl = columnRefs.current.get(date);
    if (container && columnEl) {
      const scrollLeft = columnEl.offsetLeft - container.offsetWidth / 2 + columnEl.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
    setFocusedDate(date);
  }, []);

  // Scroll to today on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToDate(todayStr);
    }, 100);
    return () => clearTimeout(timer);
  }, [todayStr, scrollToDate]);

  const handleToggleComplete = (taskId: string) => {
    toggleComplete(taskId, user?.name || "Unknown");
  };

  // Handle claim/unclaim/steal - use shared context
  const handleClaim = (taskId: string, steal: boolean = false) => {
    claimTask(taskId, user?.name || "Unknown", steal);
  };

  // Handle steal - take over task from another staff member
  const handleSteal = (taskId: string) => {
    claimTask(taskId, user?.name || "Unknown", true);
  };

  // Handle clicking on a task to open details modal
  const handleTaskClick = (task: DiaryTask) => {
    setSelectedTask(task);
  };

  // Handle updating task from modal - use shared context
  const handleUpdateTask = (taskId: string, updates: Partial<DiaryTask>) => {
    updateTask(taskId, updates);
    // Update selected task if it's the one being updated
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => prev ? { ...prev, ...updates } as DiaryTask : null);
    }
  };

  const handleAddTask = (newTask: Partial<DiaryTask>) => {
    const task = {
      ...newTask,
      id: `task-${Date.now()}`,
    } as DiaryTask;
    addTask(task);
  };

  // Handle editing a repeat task - open it in the task detail modal
  const handleEditRepeatTask = (task: WardTask) => {
    setSelectedTask(task);
    setShowRepeatTasksModal(false);
  };

  // Handle deleting a repeat task
  const handleDeleteRepeatTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this repeating task?")) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Get ward tasks for repeat modal
  const wardTasks = tasks.filter((t) => t.type === "ward" && t.ward === activeWard) as WardTask[];

  // Get tasks for a specific date, filtered by activeWard
  const getTasksForDate = (date: string): DiaryTask[] => {
    const isTargetToday = date === todayStr;

    return tasks.filter((task) => {
      // Filter by active ward
      if (task.ward !== activeWard) return false;

      if (task.type === "ward") {
        return task.dueDate === date;
      } else if (task.type === "patient") {
        if (isTargetToday && task.carryOver && task.status !== "completed" && task.status !== "cancelled") {
          const taskDate = new Date(task.dueDate);
          const targetDate = new Date(date);
          if (taskDate <= targetDate) {
            return true;
          }
        }
        return task.dueDate === date;
      } else if (task.type === "appointment") {
        return task.appointmentDate === date;
      }
      return false;
    });
  };

  if (!hasTaskFeature) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tasks Feature</h1>
          <p className="text-gray-500 mb-4">
            This feature requires Medium version or higher.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium no-underline hover:shadow-lg"
          >
            Go Home
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Count stats for focused day
  const focusedTasks = getTasksForDate(focusedDate || todayStr);
  const pendingCount = focusedTasks.filter((t) => t.status === "pending" || t.status === "overdue" || t.status === "in_progress").length;
  const completedCount = focusedTasks.filter((t) => t.status === "completed").length;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Ward Diary</h1>
            <p className="text-gray-600">
              {activeWard} Ward · {formatDisplayDate(focusedDate || todayStr)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              {pendingCount} pending
            </div>
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <Check className="w-4 h-4" />
              {completedCount} done
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => scrollToDate(todayStr)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <CalendarDays className="w-5 h-5" />
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const currentIndex = dates.indexOf(focusedDate);
                if (currentIndex > 0) {
                  scrollToDate(dates[currentIndex - 1]);
                }
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const currentIndex = dates.indexOf(focusedDate);
                if (currentIndex < dates.length - 1) {
                  scrollToDate(dates[currentIndex + 1]);
                }
              }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              hideCompleted
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {hideCompleted ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            {hideCompleted ? "Active only" : "Hide done"}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowRepeatTasksModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200 transition-all"
              title="View Repeating Ward Tasks"
            >
              <Repeat className="w-5 h-5" />
              <span className="hidden sm:inline">Repeat Tasks</span>
            </button>

            <button
              onClick={() => setShowStaffModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              title="Manage Staff Names"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Staff</span>
            </button>

            <button
              onClick={() => setShowPatientModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              title="Manage Patient Names"
            >
              <UserSquare2 className="w-5 h-5" />
              <span className="hidden sm:inline">Patients</span>
            </button>

            <button
              onClick={() => setShowStaffTasksModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              title="View Staff Tasks"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="hidden sm:inline">Staff Tasks</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </div>

        {/* SystemOne tip banner */}
        <div className="overflow-hidden bg-red-50 border border-red-200 rounded-xl">
          <div className="animate-marquee whitespace-nowrap py-2 text-red-600 font-medium text-sm">
            <span className="mx-8">💡 Tip: Sync with SystemOne tasks only available in Max+ version of app</span>
            <span className="mx-8">💡 Tip: Sync with SystemOne tasks only available in Max+ version of app</span>
            <span className="mx-8">💡 Tip: Sync with SystemOne tasks only available in Max+ version of app</span>
          </div>
        </div>

        {/* Scrollable diary */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth px-4 -mx-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {dates.map((date) => (
            <div
              key={date}
              ref={(el) => {
                if (el) columnRefs.current.set(date, el);
              }}
              style={{ scrollSnapAlign: "center" }}
            >
              <DayColumn
                date={date}
                tasks={getTasksForDate(date)}
                isFocused={date === focusedDate}
                hideCompleted={hideCompleted}
                onToggleComplete={handleToggleComplete}
                onClaim={handleClaim}
                onSteal={handleSteal}
                onTaskClick={handleTaskClick}
                currentUserName={user?.name}
                showAddButton={true}
                onAddTask={() => setShowAddModal(true)}
                onClick={() => scrollToDate(date)}
                onHeaderClick={() => setFullScreenDate(date)}
              />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">📚 Diary Key</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="font-medium text-gray-900 mb-1">🏥 Ward Tasks</p>
              <p className="text-gray-500">Shift-based (today only)</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">👤 Patient Tasks</p>
              <p className="text-gray-500">Carry over if incomplete</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">📅 Appointments</p>
              <p className="text-gray-500">Shown on all days</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Priority</p>
              <p className="text-gray-500">🟢 Routine · 🟡 Important · 🔴 Urgent</p>
            </div>
          </div>
        </div>
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
      />

      <StaffManagementModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        ward={activeWard}
      />

      <PatientNamesModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        ward={activeWard}
      />

      <StaffTasksModal
        isOpen={showStaffTasksModal}
        onClose={() => setShowStaffTasksModal(false)}
        tasks={tasks}
        ward={activeWard}
      />

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        currentUserName={user?.name || "Unknown"}
        onClaim={handleClaim}
        onSteal={handleSteal}
        onToggleComplete={handleToggleComplete}
        onUpdate={handleUpdateTask}
      />

      <RepeatWardTasksModal
        isOpen={showRepeatTasksModal}
        onClose={() => setShowRepeatTasksModal(false)}
        tasks={wardTasks}
        onEditTask={handleEditRepeatTask}
        onDeleteTask={handleDeleteRepeatTask}
      />

      <DayFullScreenModal
        isOpen={!!fullScreenDate}
        onClose={() => setFullScreenDate(null)}
        date={fullScreenDate || todayStr}
        tasks={fullScreenDate ? getTasksForDate(fullScreenDate) : []}
        onToggleComplete={handleToggleComplete}
        onClaim={handleClaim}
        onSteal={handleSteal}
        onTaskClick={handleTaskClick}
        currentUserName={user?.name}
        hideCompleted={hideCompleted}
      />
    </MainLayout>
  );
}
