"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Maximize2,
  Minimize2,
  ArrowLeft,
  Filter,
  Sun,
  Moon,
  Sunset,
  Settings2,
} from "lucide-react";
import {
  DiaryTask,
  WardTask,
  PatientTask,
  Appointment,
  SHIFT_CONFIG,
  TASK_CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  Patient,
} from "@/lib/types";
import { getActivePatientsByWard, DEMO_PATIENTS } from "@/lib/data/tasks";
import { getStaffByWard } from "@/lib/data/staff";
import {
  StaffManagementModal,
  StaffTasksModal,
  TaskDetailModal,
} from "@/components/modals";
import { ConfirmDialog } from "@/components/ui";

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
  onDragStart,
}: {
  task: DiaryTask;
  onToggleComplete: (id: string) => void;
  onClaim?: (id: string) => void;
  onSteal?: (id: string) => void;
  onClick?: (task: DiaryTask) => void;
  currentUserName?: string;
  compact?: boolean;
  onDragStart?: (e: React.DragEvent, taskId: string, taskType: string) => void;
}) {
  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";
  const isInProgress = task.status === "in_progress";
  const isClaimed = !!task.claimedBy;
  const isClaimedByMe = task.claimedBy === currentUserName;

  // Priority-based gradient colors
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const gradient = priorityConfig.gradient;

  // Type-based icon and info
  let icon = "📌";
  let iconTooltip = "";
  let subtitle = "";
  let typeTag = "";

  if (task.type === "ward") {
    const shiftConfig = SHIFT_CONFIG[task.shift];
    icon = shiftConfig.icon;
    iconTooltip = `${shiftConfig.label} Shift`;
    typeTag = `${shiftConfig.label} · Ward`;
  } else if (task.type === "patient") {
    const catConfig = TASK_CATEGORY_CONFIG[task.category];
    icon = catConfig.icon;
    iconTooltip = catConfig.label;
    typeTag = catConfig.label;
  } else if (task.type === "appointment") {
    icon = "📅";
    iconTooltip = "Appointment";
    subtitle = task.appointmentTime || "";
    typeTag = "Appointment";
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task.id, task.type)}
      onClick={() => onClick?.(task)}
      className={`rounded-xl overflow-hidden transition-all cursor-grab active:cursor-grabbing ${
        isCompleted ? "opacity-60" : "hover:shadow-lg hover:scale-[1.02]"
      } ${compact ? "text-sm" : ""}`}
    >
      <div className={`bg-gradient-to-r ${gradient} ${compact ? "p-2" : "p-2.5"}`}>
        <div className="flex items-start gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center transition-all ${
              isCompleted ? "bg-white/30" : "hover:bg-white/20"
            }`}
          >
            {isCompleted && <Check className="w-3 h-3 text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={compact ? "text-base" : "text-lg"} title={iconTooltip}>{icon}</span>
              <h4
                className={`font-semibold text-white truncate ${
                  isCompleted ? "line-through" : ""
                } ${compact ? "text-xs" : "text-sm"}`}
              >
                {task.title}
              </h4>
              {isOverdue && (
                <span className="bg-red-500 text-white text-[10px] px-1 py-0.5 rounded font-medium flex-shrink-0">
                  Overdue
                </span>
              )}
            </div>

            {/* Appointment time subtitle */}
            {subtitle && <p className="text-white/70 text-xs truncate">{subtitle}</p>}

            {/* Type tag */}
            {typeTag && (
              <span className="inline-block text-white/70 text-[10px] bg-white/15 rounded px-1.5 py-0.5 mt-0.5 w-fit">
                {typeTag}
              </span>
            )}

            {/* Patient name */}
            {(task.type === "patient" || task.type === "appointment") && task.patientName && (
              <p className={`text-white font-medium truncate ${compact ? "text-xs" : "text-sm"}`}>
                👤 {task.patientName}
              </p>
            )}

            {/* Claimed status row with steal/unclaim buttons inline + linked resources on right */}
            {isClaimed && !isCompleted && (
              <div className="flex items-center justify-between gap-1.5 mt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Steal button - if claimed by someone else */}
                  {!isClaimedByMe && onSteal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSteal(task.id);
                      }}
                      className="flex items-center gap-1 text-white text-[10px] bg-amber-500/60 hover:bg-amber-500/80 rounded px-1.5 py-0.5 transition-colors"
                      title={`Assigned to ${task.claimedBy} — reassign to yourself`}
                    >
                      <Hand className="w-2.5 h-2.5" />
                      Take Over
                    </button>
                  )}
                  {/* Drop button - if claimed by me */}
                  {isClaimedByMe && onClaim && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClaim(task.id);
                      }}
                      className="flex items-center gap-1 text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors"
                      title="Release this task so others can pick it up"
                    >
                      <Hand className="w-2.5 h-2.5" />
                      Drop
                    </button>
                  )}
                  <span className="text-white/80 text-[10px] flex items-center gap-1">
                    <Hand className="w-2.5 h-2.5" />
                    {isInProgress ? `${task.claimedBy} working` : task.claimedBy}
                  </span>
                </div>
                {/* Linked resources - right side */}
                {((task.type === "patient" || task.type === "appointment") && task.linkedReferralId) ||
                 ((task.type === "ward" || task.type === "patient" || task.type === "appointment") && task.linkedGuideId) ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(task.type === "patient" || task.type === "appointment") && task.linkedReferralId && (
                      <Link
                        href={`/referrals/${task.linkedReferralId}`}
                        className="flex items-center gap-0.5 text-white/80 text-[10px] hover:text-white no-underline"
                        onClick={(e) => e.stopPropagation()}
                        title="View linked referral"
                      >
                        <span>📋</span>
                      </Link>
                    )}
                    {(task.type === "ward" || task.type === "patient" || task.type === "appointment") && task.linkedGuideId && (
                      <Link
                        href={`/how-to/${task.linkedGuideId}`}
                        className="flex items-center gap-0.5 text-white/80 text-[10px] hover:text-white no-underline"
                        onClick={(e) => e.stopPropagation()}
                        title="View linked guide"
                      >
                        <span>📖</span>
                      </Link>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Claim button row - only if not claimed + linked resources on right */}
            {!isCompleted && !isClaimed && (onClaim ||
              ((task.type === "patient" || task.type === "appointment") && task.linkedReferralId) ||
              ((task.type === "ward" || task.type === "patient" || task.type === "appointment") && task.linkedGuideId)) && (
              <div className="flex items-center justify-between gap-1.5 mt-1">
                {onClaim ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim(task.id);
                    }}
                    className="flex items-center gap-1 text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors"
                    title="Assign this task to yourself"
                  >
                    <Hand className="w-2.5 h-2.5" />
                    Claim
                  </button>
                ) : <div />}
                {/* Linked resources - right side */}
                {((task.type === "patient" || task.type === "appointment") && task.linkedReferralId) ||
                 ((task.type === "ward" || task.type === "patient" || task.type === "appointment") && task.linkedGuideId) ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(task.type === "patient" || task.type === "appointment") && task.linkedReferralId && (
                      <Link
                        href={`/referrals/${task.linkedReferralId}`}
                        className="flex items-center gap-0.5 text-white/80 text-[10px] hover:text-white no-underline"
                        onClick={(e) => e.stopPropagation()}
                        title="View linked referral"
                      >
                        <span>📋</span>
                      </Link>
                    )}
                    {(task.type === "ward" || task.type === "patient" || task.type === "appointment") && task.linkedGuideId && (
                      <Link
                        href={`/how-to/${task.linkedGuideId}`}
                        className="flex items-center gap-0.5 text-white/80 text-[10px] hover:text-white no-underline"
                        onClick={(e) => e.stopPropagation()}
                        title="View linked guide"
                      >
                        <span>📖</span>
                      </Link>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Linked resources only - when completed and has links */}
            {isCompleted && (
              ((task.type === "patient" || task.type === "appointment") && task.linkedReferralId) ||
              ((task.type === "ward" || task.type === "patient" || task.type === "appointment") && task.linkedGuideId)
            ) && (
              <div className="flex items-center justify-end gap-2 mt-1">
                {(task.type === "patient" || task.type === "appointment") && task.linkedReferralId && (
                  <Link
                    href={`/referrals/${task.linkedReferralId}`}
                    className="flex items-center gap-0.5 text-white/80 text-[10px] hover:text-white no-underline"
                    onClick={(e) => e.stopPropagation()}
                    title="View linked referral"
                  >
                    <span>📋</span>
                  </Link>
                )}
                {(task.type === "ward" || task.type === "patient" || task.type === "appointment") && task.linkedGuideId && (
                  <Link
                    href={`/how-to/${task.linkedGuideId}`}
                    className="flex items-center gap-0.5 text-white/80 text-[10px] hover:text-white no-underline"
                    onClick={(e) => e.stopPropagation()}
                    title="View linked guide"
                  >
                    <span>📖</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple (compact) Task Card - 2-line view
function SimpleTaskCard({
  task,
  onClaim,
  onSteal,
  onClick,
  currentUserName,
  onDragStart,
}: {
  task: DiaryTask;
  onClaim?: (id: string) => void;
  onSteal?: (id: string) => void;
  onClick?: (task: DiaryTask) => void;
  currentUserName?: string;
  onDragStart?: (e: React.DragEvent, taskId: string, taskType: string) => void;
}) {
  const isClaimed = !!task.claimedBy;
  const isClaimedByMe = task.claimedBy === currentUserName;
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const gradient = priorityConfig.gradient;

  let icon = "📌";
  if (task.type === "ward") {
    icon = SHIFT_CONFIG[task.shift].icon;
  } else if (task.type === "patient") {
    icon = TASK_CATEGORY_CONFIG[task.category].icon;
  } else if (task.type === "appointment") {
    icon = "📅";
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task.id, task.type)}
      onClick={() => onClick?.(task)}
      className="rounded-lg overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.01] transition-all"
    >
      <div className={`bg-gradient-to-r ${gradient} px-2.5 py-1.5 flex items-center gap-2`}>
        <span className="text-sm flex-shrink-0">{icon}</span>
        <h4 className="font-semibold text-white text-xs truncate flex-1 min-w-0">
          {task.title}
        </h4>
        {(task.type === "patient" || task.type === "appointment") && task.patientName && (
          <span className="text-white/80 text-[10px] flex-shrink-0 truncate max-w-[120px]">
            👤 {task.patientName}
          </span>
        )}
        {!isClaimed && onClaim && (
          <button
            onClick={(e) => { e.stopPropagation(); onClaim(task.id); }}
            className="flex items-center gap-0.5 text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors flex-shrink-0"
            title="Assign this task to yourself"
          >
            <Hand className="w-2.5 h-2.5" />
            Claim
          </button>
        )}
        {isClaimed && !isClaimedByMe && onSteal && (
          <button
            onClick={(e) => { e.stopPropagation(); onSteal(task.id); }}
            className="flex items-center gap-0.5 text-white text-[10px] bg-amber-500/60 hover:bg-amber-500/80 rounded px-1.5 py-0.5 transition-colors flex-shrink-0"
            title={`Assigned to ${task.claimedBy} — reassign to yourself`}
          >
            <Hand className="w-2.5 h-2.5" />
            Take Over
          </button>
        )}
        {isClaimed && isClaimedByMe && onClaim && (
          <button
            onClick={(e) => { e.stopPropagation(); onClaim(task.id); }}
            className="flex items-center gap-0.5 text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors flex-shrink-0"
            title="Release this task so others can pick it up"
          >
            <Hand className="w-2.5 h-2.5" />
            Drop
          </button>
        )}
      </div>
    </div>
  );
}

// Priority order: urgent first, then important, then routine
const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  important: 1,
  routine: 2,
};

// Priority border colors
const PRIORITY_BORDER_CONFIG: Record<string, { borderColor: string; bgColor: string; label: string; icon: string }> = {
  urgent: { borderColor: "border-red-400", bgColor: "bg-red-50", label: "Urgent", icon: "🔴" },
  important: { borderColor: "border-amber-400", bgColor: "bg-amber-50", label: "Important", icon: "🟡" },
  routine: { borderColor: "border-green-300", bgColor: "bg-green-50/50", label: "Routine", icon: "🟢" },
};

// Priority Grouped Tasks Component
function PriorityGroupedTasks({
  tasks,
  onToggleComplete,
  onClaim,
  onSteal,
  onTaskClick,
  currentUserName,
  compact,
  diaryView = "detailed",
  onTaskDragStart,
}: {
  tasks: DiaryTask[];
  onToggleComplete: (id: string) => void;
  onClaim?: (id: string) => void;
  onSteal?: (id: string) => void;
  onTaskClick?: (task: DiaryTask) => void;
  currentUserName?: string;
  compact?: boolean;
  diaryView?: "simple" | "detailed";
  onTaskDragStart?: (e: React.DragEvent, taskId: string, taskType: string) => void;
}) {
  // Sort tasks by priority (urgent first)
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority] ?? 2;
    const priorityB = PRIORITY_ORDER[b.priority] ?? 2;
    return priorityA - priorityB;
  });

  // Group tasks by priority
  const groupedTasks = sortedTasks.reduce((acc, task) => {
    const priority = task.priority || "routine";
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(task);
    return acc;
  }, {} as Record<string, DiaryTask[]>);

  // Render order: urgent, important, routine
  const priorityKeys = ["urgent", "important", "routine"].filter(
    (p) => groupedTasks[p] && groupedTasks[p].length > 0
  );

  // Render function for a single task based on view mode
  const renderTask = (task: DiaryTask) => {
    if (diaryView === "simple") {
      return (
        <SimpleTaskCard
          key={task.id}
          task={task}
          onClaim={onClaim}
          onSteal={onSteal}
          onClick={onTaskClick}
          currentUserName={currentUserName}
          onDragStart={onTaskDragStart}
        />
      );
    }
    return (
      <TaskCard
        key={task.id}
        task={task}
        onToggleComplete={onToggleComplete}
        onClaim={onClaim}
        onSteal={onSteal}
        onClick={onTaskClick}
        currentUserName={currentUserName}
        compact={compact}
        onDragStart={onTaskDragStart}
      />
    );
  };

  // If only one priority or no tasks, render without grouping borders
  if (priorityKeys.length <= 1) {
    return (
      <div className={diaryView === "simple" ? "space-y-1" : "space-y-2"}>
        {sortedTasks.map(renderTask)}
      </div>
    );
  }

  // Simple view skips priority grouping borders
  if (diaryView === "simple") {
    return (
      <div className="space-y-1">
        {sortedTasks.map(renderTask)}
      </div>
    );
  }

  // Multiple priorities - render with group borders (detailed view)
  return (
    <div className="space-y-3">
      {priorityKeys.map((priority) => {
        const config = PRIORITY_BORDER_CONFIG[priority];
        const priorityTasks = groupedTasks[priority];
        return (
          <div
            key={priority}
            className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-2`}
          >
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <span className="text-sm">{config.icon}</span>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {config.label}
              </span>
              <span className="text-xs text-gray-500">({priorityTasks.length})</span>
            </div>
            <div className="space-y-2">
              {priorityTasks.map(renderTask)}
            </div>
          </div>
        );
      })}
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
      {expanded && <div className="mt-2">{children}</div>}
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
  diaryView = "detailed",
  showWardTasksSetting = true,
  onToggleComplete,
  onClaim,
  onSteal,
  onTaskClick,
  currentUserName,
  showAddButton,
  onAddTask,
  onClick,
  onExpand,
  isDragOver,
  onTaskDragStart,
  onDayDragOver,
  onDayDragLeave,
  onDayDrop,
}: {
  date: string;
  tasks: DiaryTask[];
  isFocused: boolean;
  hideCompleted: boolean;
  diaryView?: "simple" | "detailed";
  showWardTasksSetting?: boolean;
  onToggleComplete: (id: string) => void;
  onClaim?: (id: string) => void;
  onSteal?: (id: string) => void;
  onTaskClick?: (task: DiaryTask) => void;
  currentUserName?: string;
  showAddButton?: boolean;
  onAddTask?: () => void;
  onClick?: () => void;
  onExpand?: () => void;
  isDragOver?: boolean;
  onTaskDragStart?: (e: React.DragEvent, taskId: string, taskType: string) => void;
  onDayDragOver?: (e: React.DragEvent) => void;
  onDayDragLeave?: () => void;
  onDayDrop?: (e: React.DragEvent) => void;
}) {
  const todayDate = formatDate(new Date());
  const isPastDay = isPast(date) && date !== todayDate;
  const isFutureDay = !isPastDay && date !== todayDate;
  const isToday = date === todayDate;

  // Section expanded/collapsed rules:
  // PAST:   ward tasks=hidden, patient tasks=collapsed, appointments=expanded
  // TODAY:  ward tasks=expanded, patient tasks=expanded, appointments=expanded
  // FUTURE: ward tasks=collapsed, patient tasks=collapsed, appointments=expanded
  // FOCUSED (any day): all sections expanded
  const getExpandedForState = (): SectionExpandState => {
    if (isFocused) return { wardTasks: true, patientTasks: true, appointments: true };
    if (isToday) return { wardTasks: true, patientTasks: true, appointments: true };
    if (isPastDay) return { wardTasks: false, patientTasks: false, appointments: true };
    // Future
    return { wardTasks: false, patientTasks: false, appointments: true };
  };

  const [expandedState, setExpandedState] = useState<SectionExpandState>(getExpandedForState);
  const [prevFocused, setPrevFocused] = useState(isFocused);

  // Re-compute when focus changes (expand all on focus, restore defaults on unfocus)
  if (isFocused !== prevFocused) {
    setPrevFocused(isFocused);
    setExpandedState(getExpandedForState());
  }

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

  const shouldHideCompleted = hideCompleted || diaryView === "simple";
  const filterCompleted = (items: DiaryTask[]) =>
    shouldHideCompleted ? items.filter((t) => t.status !== "completed") : items;

  // Ward tasks visible on: today (always), future days (show section but maybe collapsed),
  // past days (hidden entirely — no section shown)
  const showWardTasksSection = (isToday || isFutureDay) && showWardTasksSetting;
  const visibleWardTasks = showWardTasksSection ? filterCompleted(wardTasks) : [];
  const visiblePatientTasks = filterCompleted(patientTasks);
  const visibleAppointments = filterCompleted(appointments);

  const totalVisible =
    visibleWardTasks.length + visiblePatientTasks.length + visibleAppointments.length;

  return (
    <div
      onClick={onClick}
      onDragOver={onDayDragOver}
      onDragLeave={onDayDragLeave}
      onDrop={onDayDrop}
      className={`flex-shrink-0 transition-all duration-300 cursor-pointer ${
        isFocused ? "w-80" : "w-52"
      } bg-white rounded-xl border-2 ${
        isDragOver
          ? "border-nhs-blue border-dashed shadow-xl bg-blue-50/50"
          : isFocused
          ? "border-indigo-400 shadow-xl"
          : isToday
          ? "border-indigo-200"
          : "border-gray-200 hover:border-gray-300"
      } overflow-hidden`}
    >
      {/* Day header */}
      <div
        className={`p-3 transition-all relative ${
          isFocused
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            : isToday
            ? "bg-indigo-100 text-indigo-800"
            : isPastDay
            ? "bg-gray-100 text-gray-500"
            : "bg-gray-50 text-gray-700"
        }`}
      >
        {/* Expand/Collapse button */}
        {onExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors ${
              isFocused
                ? "hover:bg-white/20 text-white/80 hover:text-white"
                : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            }`}
            title={isFocused ? "Collapse day view" : "Expand day view"}
            aria-label={isFocused ? "Collapse day view" : "Expand day view"}
          >
            {isFocused ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
        <div className="text-center">
          <p className={`font-bold ${isFocused ? "text-lg" : "text-sm"}`}>
            {formatDisplayDate(date)}
          </p>
          <p className={`text-xs ${isFocused ? "text-white/70" : "opacity-70"}`}>
            {new Date(date).toLocaleDateString("en-GB", { weekday: "long" })}
          </p>
          {!isFocused && totalVisible > 0 && (
            <p className="text-xs mt-1 font-medium">{totalVisible} task{totalVisible !== 1 ? 's' : ''}</p>
          )}
        </div>
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
          <PriorityGroupedTasks
            tasks={visibleWardTasks}
            onToggleComplete={onToggleComplete}
            onClaim={onClaim}
            onSteal={onSteal}
            onTaskClick={onTaskClick}
            currentUserName={currentUserName}
            compact={!isFocused}
            diaryView={diaryView}
            onTaskDragStart={onTaskDragStart}
          />
        </CollapsibleSection>

        {/* Patient Tasks */}
        <CollapsibleSection
          title="Patient Tasks"
          icon="👤"
          count={visiblePatientTasks.length}
          expanded={patientTasksExpanded}
          onToggle={() => toggleSection("patientTasks")}
        >
          <PriorityGroupedTasks
            tasks={visiblePatientTasks}
            onToggleComplete={onToggleComplete}
            onClaim={onClaim}
            onSteal={onSteal}
            onTaskClick={onTaskClick}
            currentUserName={currentUserName}
            compact={!isFocused}
            diaryView={diaryView}
            onTaskDragStart={onTaskDragStart}
          />
        </CollapsibleSection>

        {/* Appointments */}
        <CollapsibleSection
          title="Appointments"
          icon="📅"
          count={visibleAppointments.length}
          expanded={appointmentsExpanded}
          onToggle={() => toggleSection("appointments")}
        >
          <PriorityGroupedTasks
            tasks={visibleAppointments}
            onToggleComplete={onToggleComplete}
            onClaim={onClaim}
            onSteal={onSteal}
            onTaskClick={onTaskClick}
            currentUserName={currentUserName}
            compact={!isFocused}
            diaryView={diaryView}
            onTaskDragStart={onTaskDragStart}
          />
        </CollapsibleSection>

        {/* Empty state */}
        {totalVisible === 0 && (
          <div className={`text-center ${isFocused ? "py-8" : "py-4"} text-gray-400`}>
            <p className={isFocused ? "text-4xl mb-2" : "text-2xl mb-1"}>
              {hideCompleted ? "🎉" : "📋"}
            </p>
            <p className={`font-medium ${isFocused ? "text-sm" : "text-xs"}`}>
              {hideCompleted ? "All done!" : "No tasks scheduled"}
            </p>
            {isFocused && (
              <p className="text-xs mt-1 text-gray-300">
                {hideCompleted
                  ? "Show completed tasks to see your progress"
                  : "Click 'Add Task' to create one"}
              </p>
            )}
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
  activeWard,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Partial<DiaryTask>) => void;
  activeWard: string;
}) {
  const [taskType, setTaskType] = useState<"ward" | "patient" | "appointment">("ward");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("referral");
  const [patientName, setPatientName] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Get patients for current ward
  const wardPatients = getActivePatientsByWard(activeWard.charAt(0).toUpperCase() + activeWard.slice(1));
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
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <div className="relative">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setShowPatientDropdown(true);
                  // Clear selection if user types something different
                  if (patientName && e.target.value !== patientName) {
                    setPatientName("");
                  }
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Search patients..."
                className={`w-full p-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                  patientName ? "border-green-400 bg-green-50" : "border-gray-200"
                }`}
              />
              {patientName && (
                <button
                  type="button"
                  onClick={() => {
                    setPatientName("");
                    setPatientSearch("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showPatientDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {wardPatients
                  .filter((p) =>
                    p.name.toLowerCase().includes(patientSearch.toLowerCase())
                  )
                  .slice(0, 10)
                  .map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => {
                        setPatientName(patient.name);
                        setPatientSearch(patient.name);
                        setShowPatientDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-indigo-50 flex items-center justify-between ${
                        patientName === patient.name ? "bg-indigo-100" : ""
                      }`}
                    >
                      <span className="font-medium text-gray-900">{patient.name}</span>
                      <span className="text-xs text-gray-500">Room {patient.room}</span>
                    </button>
                  ))}
                {wardPatients.filter((p) =>
                  p.name.toLowerCase().includes(patientSearch.toLowerCase())
                ).length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No patients found
                  </div>
                )}
              </div>
            )}
            {patientName && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Selected: {patientName}
              </p>
            )}
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
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {recurringTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">🔄</p>
              <p className="text-gray-700 font-semibold text-lg">No repeating ward tasks yet</p>
              <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                Repeating tasks help ensure routine ward activities happen every shift.
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Create a ward task and toggle &quot;Repeating Task&quot; to add it here
              </p>
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
                            aria-label="Edit task"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete task"
                            aria-label="Delete task"
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
                            <div className="text-center mt-6">
                              <p className="text-gray-300 text-lg mb-1">-</p>
                              <p className="text-gray-300 text-xs">Rest day</p>
                            </div>
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
                                        aria-label="Edit task"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteTask(task.id)}
                                        className="p-1.5 hover:bg-red-500/50 rounded transition-colors"
                                        title="Delete task"
                                        aria-label="Delete task"
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

// Expanded Day View - Full page view for a single day
function ExpandedDayView({
  date,
  tasks,
  hideCompleted,
  onToggleComplete,
  onClaim,
  onSteal,
  onTaskClick,
  currentUserName,
  onClose,
  onAddTask,
  onChangeDate,
  dates = [],
}: {
  date: string;
  tasks: DiaryTask[];
  hideCompleted: boolean;
  onToggleComplete: (id: string) => void;
  onClaim?: (id: string) => void;
  onSteal?: (id: string) => void;
  onTaskClick?: (task: DiaryTask) => void;
  currentUserName?: string;
  onClose: () => void;
  onAddTask?: () => void;
  onChangeDate?: (date: string) => void;
  dates?: string[];
}) {
  // Shift filter state - which shifts to show
  const [showEarly, setShowEarly] = useState(true);
  const [showLate, setShowLate] = useState(true);
  const [showNight, setShowNight] = useState(true);

  // Task type filter state
  const [showWardTasks, setShowWardTasks] = useState(true);
  const [showPatientTasks, setShowPatientTasks] = useState(true);
  const [showAppointments, setShowAppointments] = useState(true);

  const todayDate = formatDate(new Date());
  const isPastDay = isPast(date) && date !== todayDate;
  const isToday = date === todayDate;

  // Filter tasks based on settings
  const filterTasks = (taskList: DiaryTask[]) => {
    let filtered = taskList;

    // Filter completed if needed
    if (hideCompleted) {
      filtered = filtered.filter(t => t.status !== "completed");
    }

    // Filter by task type
    filtered = filtered.filter(t => {
      if (t.type === "ward" && !showWardTasks) return false;
      if (t.type === "patient" && !showPatientTasks) return false;
      if (t.type === "appointment" && !showAppointments) return false;
      return true;
    });

    // Filter ward tasks by shift
    filtered = filtered.filter(t => {
      if (t.type === "ward") {
        const wardTask = t as WardTask;
        if (wardTask.shift === "early" && !showEarly) return false;
        if (wardTask.shift === "late" && !showLate) return false;
        if (wardTask.shift === "night" && !showNight) return false;
      }
      return true;
    });

    return filtered;
  };

  const wardTasks = filterTasks(tasks.filter(t => t.type === "ward")) as WardTask[];
  const patientTasks = filterTasks(tasks.filter(t => t.type === "patient")) as PatientTask[];
  const appointments = filterTasks(tasks.filter(t => t.type === "appointment")) as Appointment[];

  // Group ward tasks by shift
  const earlyTasks = wardTasks.filter(t => t.shift === "early");
  const lateTasks = wardTasks.filter(t => t.shift === "late");
  const nightTasks = wardTasks.filter(t => t.shift === "night");

  const totalFiltered = wardTasks.length + patientTasks.length + appointments.length;

  return (
    <div className="fixed inset-0 bg-gray-50 z-40 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Minimize button — mirrors the expand icon */}
            <button
              onClick={onClose}
              className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title="Collapse back to overview"
              aria-label="Collapse back to overview"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            {/* Day navigation */}
            <button
              onClick={() => {
                const idx = dates.indexOf(date);
                if (idx > 0 && onChangeDate) onChangeDate(dates[idx - 1]);
              }}
              disabled={dates.indexOf(date) <= 0}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center min-w-[160px]">
              <h1 className="text-2xl font-bold">{formatDisplayDate(date)}</h1>
              <p className="text-white/70 text-sm">
                {new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" })}
              </p>
            </div>

            <button
              onClick={() => {
                const idx = dates.indexOf(date);
                if (idx < dates.length - 1 && onChangeDate) onChangeDate(dates[idx + 1]);
              }}
              disabled={dates.indexOf(date) >= dates.length - 1}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Today jump */}
            {date !== todayDate && (
              <button
                onClick={() => onChangeDate?.(todayDate)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
              >
                <CalendarDays className="w-4 h-4" />
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
              {totalFiltered} task{totalFiltered !== 1 ? "s" : ""} showing
            </span>
            {onAddTask && (
              <button
                onClick={onAddTask}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl font-medium hover:bg-white/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            {/* Shift filters - only show for today */}
            {isToday && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Shifts:</span>
                <button
                  onClick={() => setShowEarly(!showEarly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    showEarly
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                      : "bg-gray-100 text-gray-400 line-through"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Early
                </button>
                <button
                  onClick={() => setShowLate(!showLate)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    showLate
                      ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                      : "bg-gray-100 text-gray-400 line-through"
                  }`}
                >
                  <Sunset className="w-4 h-4" />
                  Late
                </button>
                <button
                  onClick={() => setShowNight(!showNight)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    showNight
                      ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white"
                      : "bg-gray-100 text-gray-400 line-through"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Night
                </button>
              </div>
            )}

            {/* Task type filters */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
              <span className="text-sm font-medium text-gray-700">Show:</span>
              {isToday && (
                <button
                  onClick={() => setShowWardTasks(!showWardTasks)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    showWardTasks
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-400 line-through"
                  }`}
                >
                  🏥 Ward Tasks
                </button>
              )}
              <button
                onClick={() => setShowPatientTasks(!showPatientTasks)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showPatientTasks
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-400 line-through"
                }`}
              >
                👤 Patient Tasks
              </button>
              <button
                onClick={() => setShowAppointments(!showAppointments)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showAppointments
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-400 line-through"
                }`}
              >
                📅 Appointments
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {totalFiltered === 0 ? (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">
                {hideCompleted || !showEarly || !showLate || !showNight || !showWardTasks || !showPatientTasks || !showAppointments
                  ? "🔍"
                  : "📋"}
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {hideCompleted || !showEarly || !showLate || !showNight || !showWardTasks || !showPatientTasks || !showAppointments
                  ? "No matching tasks"
                  : "No tasks scheduled"}
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                {hideCompleted || !showEarly || !showLate || !showNight || !showWardTasks || !showPatientTasks || !showAppointments
                  ? "Try adjusting your filters above to see more tasks, or toggle 'Hide done' to show completed tasks."
                  : "This day has no scheduled tasks. Click 'Add Task' to create one."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ward Tasks Column - only show for today */}
              {isToday && showWardTasks && (earlyTasks.length > 0 || lateTasks.length > 0 || nightTasks.length > 0) && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🏥 Ward Tasks
                    <span className="text-sm font-normal text-gray-500">
                      ({wardTasks.length})
                    </span>
                  </h2>

                  {/* Early Shift */}
                  {showEarly && earlyTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                          <Sun className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Early Shift</h3>
                        <span className="text-xs text-gray-500">({earlyTasks.length})</span>
                      </div>
                      <PriorityGroupedTasks
                        tasks={earlyTasks}
                        onToggleComplete={onToggleComplete}
                        onClaim={onClaim}
                        onSteal={onSteal}
                        onTaskClick={onTaskClick}
                        currentUserName={currentUserName}
                      />
                    </div>
                  )}

                  {/* Late Shift */}
                  {showLate && lateTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                          <Sunset className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Late Shift</h3>
                        <span className="text-xs text-gray-500">({lateTasks.length})</span>
                      </div>
                      <PriorityGroupedTasks
                        tasks={lateTasks}
                        onToggleComplete={onToggleComplete}
                        onClaim={onClaim}
                        onSteal={onSteal}
                        onTaskClick={onTaskClick}
                        currentUserName={currentUserName}
                      />
                    </div>
                  )}

                  {/* Night Shift */}
                  {showNight && nightTasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center">
                          <Moon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-800">Night Shift</h3>
                        <span className="text-xs text-gray-500">({nightTasks.length})</span>
                      </div>
                      <PriorityGroupedTasks
                        tasks={nightTasks}
                        onToggleComplete={onToggleComplete}
                        onClaim={onClaim}
                        onSteal={onSteal}
                        onTaskClick={onTaskClick}
                        currentUserName={currentUserName}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Patient Tasks Column */}
              {showPatientTasks && patientTasks.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                    👤 Patient Tasks
                    <span className="text-sm font-normal text-gray-500">
                      ({patientTasks.length})
                    </span>
                  </h2>
                  <PriorityGroupedTasks
                    tasks={patientTasks}
                    onToggleComplete={onToggleComplete}
                    onClaim={onClaim}
                    onSteal={onSteal}
                    onTaskClick={onTaskClick}
                    currentUserName={currentUserName}
                  />
                </div>
              )}

              {/* Appointments Column */}
              {showAppointments && appointments.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                    📅 Appointments
                    <span className="text-sm font-normal text-gray-500">
                      ({appointments.length})
                    </span>
                  </h2>
                  <PriorityGroupedTasks
                    tasks={appointments}
                    onToggleComplete={onToggleComplete}
                    onClaim={onClaim}
                    onSteal={onSteal}
                    onTaskClick={onTaskClick}
                    currentUserName={currentUserName}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer with keyboard hint */}
      <div className="bg-white border-t border-gray-200 p-3 text-center">
        <p className="text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Esc</kbd> or click Back to return to overview
        </p>
      </div>
    </div>
  );
}

// Main Tasks Page
export default function TasksPage() {
  return (
    <Suspense>
      <TasksPageInner />
    </Suspense>
  );
}

function TasksPageInner() {
  const searchParams = useSearchParams();
  const isMyDiaryMode = searchParams.get("view") === "my-diary";
  const { user, hasFeature, activeWard } = useApp();
  const { tasks, setTasks, claimTask, toggleComplete, updateTask, addTask } = useTasks();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Diary view settings - persisted to localStorage
  const [diaryView, setDiaryView] = useState<"simple" | "detailed">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("wardhub_diary_view") as "simple" | "detailed") || "detailed";
    }
    return "detailed";
  });
  const [hideCompleted, setHideCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wardhub_hide_completed") === "true";
    }
    return false;
  });
  const [showWardTasksSetting, setShowWardTasksSetting] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wardhub_show_ward_tasks") !== "false";
    }
    return true;
  });
  const [showDiarySettings, setShowDiarySettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusedDate, setFocusedDate] = useState<string>("");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // My Patients toggle - forced on in My Diary mode
  const [showMyPatients, setShowMyPatients] = useState(isMyDiaryMode);

  // Sync showMyPatients with mode changes (same component, different query param)
  useEffect(() => {
    setShowMyPatients(isMyDiaryMode);
  }, [isMyDiaryMode]);

  // Lead/Manager staff filter - pick staff to view their tasks
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string[]>([]);
  const [showStaffFilterDropdown, setShowStaffFilterDropdown] = useState(false);

  // Management modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showStaffTasksModal, setShowStaffTasksModal] = useState(false);
  const [showRepeatTasksModal, setShowRepeatTasksModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DiaryTask | null>(null);

  // Drag and drop between days
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dragToast, setDragToast] = useState<string | null>(null);

  const handleTaskDragStart = (e: React.DragEvent, taskId: string, taskType: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("taskType", taskType);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDayDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(date);
  };

  const handleDayDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDayDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const taskId = e.dataTransfer.getData("taskId");
    const taskType = e.dataTransfer.getData("taskType");
    if (!taskId) return;

    const dateField = taskType === "appointment" ? "appointmentDate" : "dueDate";
    updateTask(taskId, { [dateField]: targetDate });

    const dayLabel = new Date(targetDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    setDragToast(`Task moved to ${dayLabel}`);
    setTimeout(() => setDragToast(null), 2000);
  };
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null,
  });

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

  // Persist diary settings to localStorage
  useEffect(() => {
    localStorage.setItem("wardhub_diary_view", diaryView);
  }, [diaryView]);
  useEffect(() => {
    localStorage.setItem("wardhub_hide_completed", String(hideCompleted));
  }, [hideCompleted]);
  useEffect(() => {
    localStorage.setItem("wardhub_show_ward_tasks", String(showWardTasksSetting));
  }, [showWardTasksSetting]);

  // Handle escape key to close expanded view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expandedDay) {
        setExpandedDay(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedDay]);

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
    setDeleteConfirm({ isOpen: true, taskId });
  };

  const confirmDeleteRepeatTask = () => {
    if (deleteConfirm.taskId) {
      setTasks((prev) => prev.filter((t) => t.id !== deleteConfirm.taskId));
    }
    setDeleteConfirm({ isOpen: false, taskId: null });
  };

  // Check if user is lead or manager
  const isLeadOrManager = user?.role === "lead" || user?.role === "manager";

  // Get patients where current user is ward professional
  const myPatientIds = showMyPatients && user
    ? DEMO_PATIENTS
        .filter(p => p.wardProfessional === user.name && p.ward === activeWard)
        .map(p => p.id)
    : [];

  // Get staff for lead/manager staff filter
  const wardStaffList = isLeadOrManager ? getStaffByWard(activeWard) : [];

  // Get ward tasks for repeat modal
  const wardTasks = tasks.filter((t) => t.type === "ward" && t.ward === activeWard) as WardTask[];

  // Get tasks for a specific date, filtered by activeWard + optional filters
  const getTasksForDate = (date: string): DiaryTask[] => {
    const isTargetToday = date === todayStr;

    return tasks.filter((task) => {
      // Filter by active ward
      if (task.ward !== activeWard) return false;

      // "My Patients" filter - only show patient tasks/appointments for my patients
      if (showMyPatients && myPatientIds.length > 0) {
        if (task.type === "patient" || task.type === "appointment") {
          if (!task.patientId || !myPatientIds.includes(task.patientId)) return false;
        }
        // Ward tasks still show (not patient-specific)
      }

      // Lead/Manager staff filter - show only tasks claimed by selected staff
      if (selectedStaffFilter.length > 0) {
        if (task.claimedBy && !selectedStaffFilter.includes(task.claimedBy)) return false;
        // Show unclaimed tasks too
      }

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ward Diary</h1>
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

  // Count stats for focused day
  const focusedTasks = getTasksForDate(focusedDate || todayStr);
  const pendingCount = focusedTasks.filter((t) => t.status === "pending" || t.status === "overdue" || t.status === "in_progress").length;
  const completedCount = focusedTasks.filter((t) => t.status === "completed").length;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{isMyDiaryMode ? "📋 My Diary" : "📋 Ward Diary"}</h1>
              <p className="text-gray-600">
                {isMyDiaryMode ? `${user?.name} · ` : ""}{activeWard} Ward · {formatDisplayDate(focusedDate || todayStr)}
              </p>
            </div>
            {/* View toggle */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
              {isMyDiaryMode ? (
                <Link href="/tasks" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors no-underline">
                  Ward Diary
                </Link>
              ) : (
                <div className="px-4 py-2 rounded-lg bg-nhs-blue text-white font-semibold text-sm">
                  Ward Diary
                </div>
              )}
              {isMyDiaryMode ? (
                <div className="px-4 py-2 rounded-lg bg-nhs-blue text-white font-semibold text-sm">
                  My Diary
                </div>
              ) : (
                <Link href="/my-diary" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors no-underline">
                  My Diary
                </Link>
              )}
              <Link href="/my-tasks" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors no-underline">
                My Jobs
              </Link>
            </div>
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
              aria-label="Previous day"
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
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Repeat Tasks - Manager/Senior Admin only */}
          {(user?.role === "manager" || user?.role === "senior_admin") && !isMyDiaryMode && (
            <button
              onClick={() => setShowRepeatTasksModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200 transition-all"
              title="Edit scheduled repeating tasks"
            >
              <Repeat className="w-5 h-5" />
              <span className="hidden sm:inline">Repeat Tasks</span>
            </button>
          )}

          {/* Staff Tasks filter - Lead/Manager/Ward Admin only, Ward Diary only */}
          {(user?.role === "lead" || user?.role === "manager" || user?.role === "ward_admin") && !isMyDiaryMode && (
            <div className="relative">
              <button
                onClick={() => setShowStaffFilterDropdown(!showStaffFilterDropdown)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
                  selectedStaffFilter.length > 0
                    ? "bg-purple-100 text-purple-800 ring-2 ring-purple-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Filter by staff member's tasks"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {selectedStaffFilter.length > 0 ? `Staff (${selectedStaffFilter.length})` : "Staff Tasks"}
                </span>
              </button>
              {showStaffFilterDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-64 max-h-72 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100">
                    <button
                      onClick={() => setSelectedStaffFilter([])}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  {wardStaffList.map((staff) => (
                    <label
                      key={staff.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStaffFilter.includes(staff.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStaffFilter((prev) => [...prev, staff.name]);
                          } else {
                            setSelectedStaffFilter((prev) => prev.filter((n) => n !== staff.name));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600"
                      />
                      <span className="text-sm text-gray-700">{staff.name}</span>
                      <span className="text-xs text-gray-400 ml-auto capitalize">{staff.role.replace("_", " ")}</span>
                    </label>
                  ))}
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => setShowStaffFilterDropdown(false)}
                      className="w-full py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {/* Diary settings cog */}
            <div className="relative">
              <button
                onClick={() => setShowDiarySettings(!showDiarySettings)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
                  showDiarySettings
                    ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Diary settings"
              >
                <Settings2 className="w-5 h-5" />
              </button>
              {showDiarySettings && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-56 py-2">
                  <div className="px-3 py-1.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">View</p>
                  </div>
                  <div className="px-2 py-1.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setDiaryView("simple")}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          diaryView === "simple"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Simple
                      </button>
                      <button
                        onClick={() => setDiaryView("detailed")}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          diaryView === "detailed"
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        Detailed
                      </button>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 border-t border-gray-100 mt-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</p>
                  </div>
                  <label className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                    <span className="text-xs text-gray-700">Hide completed</span>
                    <input
                      type="checkbox"
                      checked={hideCompleted}
                      onChange={(e) => setHideCompleted(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 w-3.5 h-3.5"
                    />
                  </label>
                  <label className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                    <span className="text-xs text-gray-700">Show ward tasks</span>
                    <input
                      type="checkbox"
                      checked={showWardTasksSetting}
                      onChange={(e) => setShowWardTasksSetting(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 w-3.5 h-3.5"
                    />
                  </label>
                  <div className="px-3 pt-2 pb-1 border-t border-gray-100 mt-1">
                    <button
                      onClick={() => setShowDiarySettings(false)}
                      className="w-full py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </div>

        {/* Drag toast */}
        {dragToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-nhs-blue text-white px-4 py-2 rounded-xl shadow-lg font-medium text-sm animate-pulse">
            {dragToast}
          </div>
        )}

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
                diaryView={diaryView}
                showWardTasksSetting={showWardTasksSetting}
                onToggleComplete={handleToggleComplete}
                onClaim={handleClaim}
                onSteal={handleSteal}
                onTaskClick={handleTaskClick}
                currentUserName={user?.name}
                showAddButton={true}
                onAddTask={() => setShowAddModal(true)}
                onClick={() => scrollToDate(date)}
                onExpand={() => setExpandedDay(expandedDay === date ? null : date)}
                isDragOver={dragOverDate === date}
                onTaskDragStart={handleTaskDragStart}
                onDayDragOver={(e) => handleDayDragOver(e, date)}
                onDayDragLeave={handleDayDragLeave}
                onDayDrop={(e) => handleDayDrop(e, date)}
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
        activeWard={activeWard}
      />

      <StaffManagementModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
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

      {/* Expanded Day View */}
      {expandedDay && (
        <ExpandedDayView
          date={expandedDay}
          tasks={getTasksForDate(expandedDay)}
          hideCompleted={hideCompleted}
          onToggleComplete={handleToggleComplete}
          onClaim={handleClaim}
          onSteal={handleSteal}
          onTaskClick={handleTaskClick}
          currentUserName={user?.name}
          onClose={() => setExpandedDay(null)}
          onAddTask={() => setShowAddModal(true)}
          onChangeDate={(newDate) => setExpandedDay(newDate)}
          dates={dates}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Repeating Task?"
        message="This will permanently remove this repeating task from all future dates. This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteRepeatTask}
        onCancel={() => setDeleteConfirm({ isOpen: false, taskId: null })}
      />
    </MainLayout>
  );
}
