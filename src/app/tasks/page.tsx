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
  UserPlus,
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

// Helper functions – use local date to avoid UTC midnight timezone drift
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
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

// Theme-aware accent colour helper
function getTaskAccent(theme: string, taskType: string): { accent: string; tint: string; text: string; muted: string } {
  type T = Record<string, { accent: string; tint: string; text: string; muted: string }>;
  const MAP: Record<string, T> = {
    ios: {
      ward:        { accent: "#007AFF", tint: "#ffffff", text: "#000000", muted: "#8E8E93" },
      patient:     { accent: "#FF3B30", tint: "#ffffff", text: "#000000", muted: "#8E8E93" },
      appointment: { accent: "#FF9500", tint: "#ffffff", text: "#000000", muted: "#8E8E93" },
    },
    material: {
      ward:        { accent: "#1A73E8", tint: "#E8F0FE", text: "#3C4043", muted: "#70757A" },
      patient:     { accent: "#D93025", tint: "#FCE8E6", text: "#3C4043", muted: "#70757A" },
      appointment: { accent: "#E37400", tint: "#FEF7E0", text: "#3C4043", muted: "#70757A" },
    },
    fluent: {
      ward:        { accent: "#818CF8", tint: "#1E1B52", text: "#C7D2FE", muted: "#818CF8" },
      patient:     { accent: "#F472B6", tint: "#1E1B52", text: "#FBCFE8", muted: "#F472B6" },
      appointment: { accent: "#FBBF24", tint: "#1E1B52", text: "#FDE68A", muted: "#FBBF24" },
    },
    oneui: {
      ward:        { accent: "#6E8EBF", tint: "#ffffff", text: "#37352F", muted: "#9B9A97" },
      patient:     { accent: "#E16B55", tint: "#ffffff", text: "#37352F", muted: "#9B9A97" },
      appointment: { accent: "#C4994E", tint: "#ffffff", text: "#37352F", muted: "#9B9A97" },
    },
  };
  return MAP[theme]?.[taskType] ?? { accent: "#005EB8", tint: "#ffffff", text: "#212B32", muted: "#768692" };
}

// Linked resources (shared between NHS and non-NHS renders)
function TaskLinkedResources({ task, accent }: { task: DiaryTask; accent?: string }) {
  const hasReferral = (task.type === "patient" || task.type === "appointment") && task.linkedReferralId;
  const hasGuide = !!task.linkedGuideId;
  if (!hasReferral && !hasGuide) return null;
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {hasReferral && (
        <Link href={`/guides/${task.linkedReferralId}`} className="text-[10px] no-underline" style={accent ? { color: accent } : { color: "rgba(255,255,255,0.8)" }} onClick={(e) => e.stopPropagation()} title="View linked referral">📋</Link>
      )}
      {hasGuide && (
        <Link href={`/guides/${task.linkedGuideId}`} className="text-[10px] no-underline" style={accent ? { color: accent } : { color: "rgba(255,255,255,0.8)" }} onClick={(e) => e.stopPropagation()} title="View linked guide">📖</Link>
      )}
    </div>
  );
}

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
  const { styleTheme } = useApp();
  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";
  const isInProgress = task.status === "in_progress";
  const isClaimed = !!task.claimedBy;
  const isClaimedByMe = task.claimedBy === currentUserName;

  // Priority-based gradient colors (NHS default)
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
    typeTag = `${shiftConfig.label} · Team`;
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

  // ── NHS DEFAULT: existing gradient card, unchanged ──────────────────────────
  if (styleTheme === "nhs") {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart?.(e, task.id, task.type)}
        onClick={() => onClick?.(task)}
        className={`overflow-hidden transition-all cursor-grab active:cursor-grabbing theme-card ${
          isCompleted ? "opacity-60" : "hover:shadow-lg hover:scale-[1.02]"
        } ${compact ? "text-sm" : ""}`}
        style={{ borderRadius: "var(--theme-card-radius)", boxShadow: "var(--theme-card-shadow)" }}
      >
        <div className={`bg-gradient-to-r ${gradient} ${compact ? "p-2" : "p-2.5"}`} style={{ borderRadius: "var(--theme-card-radius)" }}>
          <div className="flex items-start gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center transition-all ${
                isCompleted ? "bg-white/30" : "hover:bg-white/20"
              }`}
            >
              {isCompleted && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={compact ? "text-base" : "text-lg"} title={iconTooltip}>{icon}</span>
                <h4 className={`font-semibold text-white truncate ${isCompleted ? "line-through" : ""} ${compact ? "text-xs" : "text-sm"}`}>
                  {task.title}
                </h4>
                {isOverdue && <span className="bg-red-500 text-white text-[10px] px-1 py-0.5 rounded font-medium flex-shrink-0">Overdue</span>}
                {task.type === "patient" && task.repeatIntervalDays && <span className="text-white/70 text-[10px] flex-shrink-0" title={`Repeats every ${task.repeatIntervalDays} days`}>🔄</span>}
                {task.type === "ward" && task.isRecurring && <span className="text-white/70 text-[10px] flex-shrink-0" title="Repeating team task">🔄</span>}
              </div>
              {subtitle && <p className="text-white/70 text-xs truncate">{subtitle}</p>}
              {typeTag && <span className="inline-block text-white/70 text-[10px] bg-white/15 rounded px-1.5 py-0.5 mt-0.5 w-fit">{typeTag}</span>}
              {(task.type === "patient" || task.type === "appointment") && task.patientName && (
                <p className={`text-white font-medium truncate ${compact ? "text-xs" : "text-sm"}`}>👤 {task.patientName}</p>
              )}
              {isClaimed && !isCompleted && (
                <div className="flex items-center justify-between gap-1.5 mt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!isClaimedByMe && onSteal && (
                      <button onClick={(e) => { e.stopPropagation(); onSteal(task.id); }} className="flex items-center gap-1 text-white text-[10px] bg-amber-500/60 hover:bg-amber-500/80 rounded px-1.5 py-0.5 transition-colors" title={`Assigned to ${task.claimedBy} – reassign to yourself`}>
                        <Hand className="w-2.5 h-2.5" /> Take Over
                      </button>
                    )}
                    {isClaimedByMe && onClaim && (
                      <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} className="flex items-center gap-1 text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors" title="Release this task so others can pick it up">
                        <Hand className="w-2.5 h-2.5" /> Drop
                      </button>
                    )}
                    <span className="text-white/80 text-[10px] flex items-center gap-1"><Hand className="w-2.5 h-2.5" />{isInProgress ? `${task.claimedBy} working` : task.claimedBy}</span>
                  </div>
                  <TaskLinkedResources task={task} />
                </div>
              )}
              {!isCompleted && !isClaimed && (onClaim || ((task.type === "patient" || task.type === "appointment") && task.linkedReferralId) || task.linkedGuideId) && (
                <div className="flex items-center justify-between gap-1.5 mt-1">
                  {onClaim ? (
                    <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} className="flex items-center gap-1 text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors" title="Assign this task to yourself">
                      <Hand className="w-2.5 h-2.5" /> Claim
                    </button>
                  ) : <div />}
                  <TaskLinkedResources task={task} />
                </div>
              )}
              {isCompleted && (((task.type === "patient" || task.type === "appointment") && task.linkedReferralId) || task.linkedGuideId) && (
                <div className="flex items-center justify-end gap-2 mt-1"><TaskLinkedResources task={task} /></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NON-NHS THEMES: theme-aware renders ─────────────────────────────────────
  const { accent, tint, text: textPrimary, muted: textMuted } = getTaskAccent(styleTheme, task.type);
  const isNotion = styleTheme === "oneui";
  const isFantastical = styleTheme === "fluent";

  const wrapperStyle: React.CSSProperties = isFantastical
    ? { borderRadius: 0 }
    : isNotion
    ? { borderRadius: 0, borderBottom: "1px solid #E9E9E7" }
    : { borderRadius: "var(--theme-card-radius)", overflow: "hidden", boxShadow: "var(--theme-card-shadow)" };

  const innerStyle: React.CSSProperties = isNotion
    ? { background: "#ffffff", padding: compact ? "6px 4px" : "8px 4px" }
    : isFantastical
    ? { background: "#1E1B52", borderLeft: `2px solid ${accent}`, borderTop: "0.5px solid rgba(255,255,255,0.05)", padding: compact ? "8px 10px" : "10px 12px" }
    : styleTheme === "material"
    ? { background: tint, borderLeft: `3px solid ${accent}`, padding: compact ? "8px 10px" : "10px 12px" }
    : /* ios */ { background: "#ffffff", borderLeft: `4px solid ${accent}`, padding: compact ? "8px 10px" : "10px 12px", borderRadius: "var(--theme-card-radius)" };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, task.id, task.type)}
      onClick={() => onClick?.(task)}
      className={`overflow-hidden transition-all cursor-grab active:cursor-grabbing ${isCompleted ? "opacity-60" : ""}`}
      style={wrapperStyle}
    >
      <div style={innerStyle}>
        {isNotion ? (
          // ── Notion: flat database row ────────────────────────────────────────
          <div className="flex items-start gap-2 w-full">
            <div className="flex-shrink-0 mt-1.5" style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
              className="flex-shrink-0 w-4 h-4 border flex items-center justify-center mt-0.5"
              style={{ borderColor: isCompleted ? "#2EAADC" : "#D1D1D1", borderRadius: 3, background: isCompleted ? "#2EAADC" : "#ffffff" }}
            >
              {isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className={`truncate ${compact ? "text-xs" : "text-sm"}`}
                  style={{ color: isCompleted ? "#9B9A97" : "#37352F", fontWeight: 400 }}
                >
                  {task.title}
                </h4>
                {isOverdue && <span className="text-[10px] px-1 py-0.5 rounded" style={{ background: "#FCE8E6", color: "#D93025" }}>Overdue</span>}
                {(task.type === "patient" && task.repeatIntervalDays) || (task.type === "ward" && task.isRecurring) ? <span className="text-[10px]" style={{ color: "#9B9A97" }}>🔄</span> : null}
              </div>
              {(task.type === "patient" || task.type === "appointment") && task.patientName && (
                <p style={{ color: "#9B9A97", fontSize: "11px", fontFamily: '"Courier New", monospace' }}>👤 {task.patientName}</p>
              )}
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {!isCompleted && !isClaimed && onClaim && (
                  <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} style={{ color: accent, fontSize: 10 }} title="Assign this task to yourself">+ Claim</button>
                )}
                {isClaimed && !isClaimedByMe && onSteal && (
                  <button onClick={(e) => { e.stopPropagation(); onSteal(task.id); }} style={{ color: "#D97706", fontSize: 10 }} title={`Assigned to ${task.claimedBy}`}>Take Over</button>
                )}
                {isClaimed && isClaimedByMe && onClaim && (
                  <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} style={{ color: "#9B9A97", fontSize: 10 }}>Drop</button>
                )}
                {isClaimed && <span style={{ color: "#9B9A97", fontSize: 10 }}>{isInProgress ? `${task.claimedBy} working` : task.claimedBy}</span>}
                <TaskLinkedResources task={task} accent={accent} />
              </div>
            </div>
          </div>
        ) : (
          // ── iOS / Google Material / Fantastical: card structure ──────────────
          <div className="flex items-start gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
              className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
              style={{ borderColor: isCompleted ? accent : `${accent}80`, background: isCompleted ? `${accent}30` : "transparent" }}
            >
              {isCompleted && <Check className="w-3 h-3" style={{ color: accent }} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={compact ? "text-sm" : "text-base"} title={iconTooltip}>{icon}</span>
                <h4
                  className={`font-semibold truncate ${compact ? "text-xs" : "text-sm"} ${isCompleted ? "line-through" : ""}`}
                  style={{ color: textPrimary }}
                >
                  {task.title}
                </h4>
                {isOverdue && <span className="text-[10px] px-1 py-0.5 rounded font-medium flex-shrink-0" style={{ background: "#ef444420", color: "#ef4444" }}>Overdue</span>}
                {task.type === "patient" && task.repeatIntervalDays && <span className="text-[10px] flex-shrink-0" style={{ color: textMuted }}>🔄</span>}
                {task.type === "ward" && task.isRecurring && <span className="text-[10px] flex-shrink-0" style={{ color: textMuted }}>🔄</span>}
              </div>
              {subtitle && <p className="text-xs truncate" style={{ color: textMuted }}>{subtitle}</p>}
              {typeTag && (
                <span className="inline-block text-[10px] rounded px-1.5 py-0.5 mt-0.5 w-fit" style={{ color: accent, background: `${accent}20` }}>{typeTag}</span>
              )}
              {(task.type === "patient" || task.type === "appointment") && task.patientName && (
                <p className={`font-medium truncate ${compact ? "text-xs" : "text-sm"}`} style={{ color: textPrimary }}>👤 {task.patientName}</p>
              )}
              {isClaimed && !isCompleted && (
                <div className="flex items-center justify-between gap-1.5 mt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!isClaimedByMe && onSteal && (
                      <button onClick={(e) => { e.stopPropagation(); onSteal(task.id); }} className="flex items-center gap-0.5 text-[10px] rounded px-1.5 py-0.5 transition-colors" style={{ border: "1px solid #F59E0B", color: "#D97706" }} title={`Assigned to ${task.claimedBy} – reassign to yourself`}>
                        <Hand className="w-2.5 h-2.5" /> Take Over
                      </button>
                    )}
                    {isClaimedByMe && onClaim && (
                      <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} className="flex items-center gap-0.5 text-[10px] rounded px-1.5 py-0.5 transition-colors" style={{ border: `1px solid ${textMuted}`, color: textMuted }} title="Release this task so others can pick it up">
                        <Hand className="w-2.5 h-2.5" /> Drop
                      </button>
                    )}
                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: textMuted }}>
                      <Hand className="w-2.5 h-2.5" />{isInProgress ? `${task.claimedBy} working` : task.claimedBy}
                    </span>
                  </div>
                  <TaskLinkedResources task={task} accent={accent} />
                </div>
              )}
              {!isCompleted && !isClaimed && (onClaim || ((task.type === "patient" || task.type === "appointment") && task.linkedReferralId) || task.linkedGuideId) && (
                <div className="flex items-center justify-between gap-1.5 mt-1">
                  {onClaim ? (
                    <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} className="flex items-center gap-0.5 text-[10px] rounded px-1.5 py-0.5 transition-colors" style={{ border: `1px solid ${accent}`, color: accent }} title="Assign this task to yourself">
                      <Hand className="w-2.5 h-2.5" /> Claim
                    </button>
                  ) : <div />}
                  <TaskLinkedResources task={task} accent={accent} />
                </div>
              )}
              {isCompleted && (((task.type === "patient" || task.type === "appointment") && task.linkedReferralId) || task.linkedGuideId) && (
                <div className="flex items-center justify-end gap-2 mt-1"><TaskLinkedResources task={task} accent={accent} /></div>
              )}
            </div>
          </div>
        )}
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
  const { styleTheme } = useApp();
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

  // NHS: gradient card
  if (styleTheme === "nhs") {
    return (
      <div draggable onDragStart={(e) => onDragStart?.(e, task.id, task.type)} onClick={() => onClick?.(task)} className="rounded-lg overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-md hover:scale-[1.01] transition-all">
        <div className={`bg-gradient-to-r ${gradient} px-2.5 py-1.5 flex items-center gap-2`}>
          <span className="text-sm flex-shrink-0">{icon}</span>
          <h4 className="font-semibold text-white text-xs truncate flex-1 min-w-0">{task.title}</h4>
          {(task.type === "patient" || task.type === "appointment") && task.patientName && (
            <span className="text-white/80 text-[10px] flex-shrink-0 truncate max-w-[120px]">👤 {task.patientName}</span>
          )}
          {!isClaimed && onClaim && (
            <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} className="flex items-center gap-0.5 text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors flex-shrink-0" title="Assign this task to yourself"><Hand className="w-2.5 h-2.5" /> Claim</button>
          )}
          {isClaimed && !isClaimedByMe && onSteal && (
            <button onClick={(e) => { e.stopPropagation(); onSteal(task.id); }} className="flex items-center gap-0.5 text-white text-[10px] bg-amber-500/60 hover:bg-amber-500/80 rounded px-1.5 py-0.5 transition-colors flex-shrink-0" title={`Assigned to ${task.claimedBy} – reassign to yourself`}><Hand className="w-2.5 h-2.5" /> Take Over</button>
          )}
          {isClaimed && isClaimedByMe && onClaim && (
            <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} className="flex items-center gap-0.5 text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors flex-shrink-0" title="Release this task so others can pick it up"><Hand className="w-2.5 h-2.5" /> Drop</button>
          )}
        </div>
      </div>
    );
  }

  // Non-NHS: theme-aware simple card
  const { accent, tint, text: textColor } = getTaskAccent(styleTheme, task.type);
  const isFantastical = styleTheme === "fluent";
  const isNotion = styleTheme === "oneui";

  const rowStyle: React.CSSProperties = isNotion
    ? { borderBottom: "1px solid #E9E9E7", padding: "5px 0", display: "flex", alignItems: "center", gap: "8px" }
    : isFantastical
    ? { background: "#1E1B52", borderLeft: `2px solid ${accent}`, padding: "5px 8px", display: "flex", alignItems: "center", gap: "6px" }
    : { background: tint, borderLeft: `${styleTheme === "material" ? 3 : 4}px solid ${accent}`, padding: "5px 8px", display: "flex", alignItems: "center", gap: "6px", borderRadius: "var(--theme-card-radius)" };

  return (
    <div draggable onDragStart={(e) => onDragStart?.(e, task.id, task.type)} onClick={() => onClick?.(task)} className="cursor-grab active:cursor-grabbing transition-all overflow-hidden">
      <div style={rowStyle}>
        {isNotion && <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent, flexShrink: 0 }} />}
        {!isNotion && <span className="text-sm flex-shrink-0">{icon}</span>}
        <h4 className="text-xs truncate flex-1 min-w-0" style={{ color: textColor, fontWeight: isNotion ? 400 : 600 }}>{task.title}</h4>
        {(task.type === "patient" || task.type === "appointment") && task.patientName && (
          <span className="text-[10px] flex-shrink-0 truncate max-w-[100px]" style={{ color: isNotion ? "#9B9A97" : `${textColor}90` }}>👤 {task.patientName}</span>
        )}
        {!isClaimed && onClaim && (
          <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} className="text-[10px] flex-shrink-0 rounded px-1.5 py-0.5 transition-colors" style={{ border: `1px solid ${accent}`, color: accent }} title="Assign this task to yourself">Claim</button>
        )}
        {isClaimed && !isClaimedByMe && onSteal && (
          <button onClick={(e) => { e.stopPropagation(); onSteal(task.id); }} className="text-[10px] flex-shrink-0 rounded px-1.5 py-0.5 transition-colors" style={{ border: "1px solid #F59E0B", color: "#D97706" }} title={`Assigned to ${task.claimedBy}`}>Take Over</button>
        )}
        {isClaimed && isClaimedByMe && onClaim && (
          <button onClick={(e) => { e.stopPropagation(); onClaim(task.id); }} className="text-[10px] flex-shrink-0 rounded px-1.5 py-0.5 transition-colors" style={{ border: "1px solid #9B9A97", color: "#9B9A97" }} title="Release this task">Drop</button>
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

  const { styleTheme } = useApp();
  const isFantastical = styleTheme === "fluent";
  const isNotion = styleTheme === "oneui";
  const sectionTextColor = isFantastical ? "#818CF8" : isNotion ? "#9B9A97" : "#6B7280";
  const sectionBadgeBg = isFantastical ? "rgba(99,102,241,0.2)" : isNotion ? "#F7F7F5" : "#F3F4F6";

  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1 rounded-lg transition-colors group"
        style={{ color: sectionTextColor }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: sectionTextColor }}>
            {title}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center" style={{ background: sectionBadgeBg, color: sectionTextColor }}>
            {count}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} style={{ color: sectionTextColor }} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${expanded ? "max-h-[2000px] opacity-100 mt-1.5" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
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
  // PAST:   team tasks=hidden, patient tasks=collapsed, appointments=expanded
  // TODAY:  team tasks=expanded, patient tasks=expanded, appointments=expanded
  // FUTURE: team tasks=collapsed, patient tasks=collapsed, appointments=expanded
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
  // past days (hidden entirely – no section shown)
  const showWardTasksSection = (isToday || isFutureDay) && showWardTasksSetting;
  const visibleWardTasks = showWardTasksSection ? filterCompleted(wardTasks) : [];
  const visiblePatientTasks = filterCompleted(patientTasks);
  const visibleAppointments = filterCompleted(appointments);

  const { styleTheme } = useApp();
  const totalVisible =
    visibleWardTasks.length + visiblePatientTasks.length + visibleAppointments.length;

  // Theme-aware column styling
  const isFantastical = styleTheme === "fluent";
  const colBorderColor = isDragOver
    ? "#005EB8"
    : isFocused
    ? "var(--theme-col-border-focused)"
    : isToday
    ? "var(--theme-col-border-today)"
    : "var(--theme-col-border-default)";
  const colBgColor = isDragOver ? (isFantastical ? "#1E1B4B" : "rgba(219,234,254,0.3)") : "var(--theme-col-bg)";

  // Header styles per state
  const headerStyle: React.CSSProperties = isFocused
    ? { background: `linear-gradient(to right, var(--theme-col-header-focused-from), var(--theme-col-header-focused-to))`, color: "#ffffff" }
    : isToday
    ? { backgroundColor: "var(--theme-col-header-today-bg)", color: "var(--theme-col-header-today-text)" }
    : isPastDay
    ? { backgroundColor: "var(--theme-col-header-past-bg)", color: "var(--theme-col-header-past-text)" }
    : { backgroundColor: "var(--theme-col-header-future-bg)", color: "var(--theme-col-header-future-text)" };

  return (
    <div
      onClick={onClick}
      onDragOver={onDayDragOver}
      onDragLeave={onDayDragLeave}
      onDrop={onDayDrop}
      className={`flex-shrink-0 transition-all duration-300 cursor-pointer ${
        isFocused ? "w-80 sm:w-96" : "w-48 sm:w-52"
      } rounded-xl border-2 ${isDragOver ? "border-dashed shadow-xl" : isFocused ? "shadow-xl" : ""} overflow-hidden`}
      style={{ borderColor: colBorderColor, backgroundColor: colBgColor }}
    >
      {/* Day header */}
      <div className="px-3 py-2.5 transition-all" style={headerStyle}>
        <div className="flex items-center justify-between">
          <div className={isFocused ? "text-left" : "text-center flex-1"}>
            <p className={`font-bold ${isFocused ? "text-base" : "text-sm"}`}>
              {formatDisplayDate(date)}
            </p>
            <p className="text-[11px] opacity-70">
              {new Date(date).toLocaleDateString("en-GB", { weekday: "short" })}
              {!isFocused && totalVisible > 0 && ` · ${totalVisible}`}
            </p>
          </div>
          {onExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="p-1 rounded-md transition-colors hover:bg-white/20 opacity-70 hover:opacity-100"
              title={isFocused ? "Collapse" : "Expand"}
              aria-label={isFocused ? "Collapse day view" : "Expand day view"}
            >
              {isFocused ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Tasks content - always show, with compact mode for non-focused */}
      <div className={`${isFocused ? "p-3" : "p-2"} max-h-[65vh] overflow-y-auto`}>
        {/* Team Tasks */}
        <CollapsibleSection
          title="Team Tasks"
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
  defaultDate,
  currentUserName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Partial<DiaryTask>) => void;
  activeWard: string;
  defaultDate?: string;
  currentUserName?: string;
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

  // Patient task repeating
  const [patientRepeat, setPatientRepeat] = useState(false);
  const [repeatIntervalDays, setRepeatIntervalDays] = useState(7);

  // Ward task specific - repeating vs one-off
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Default all days
  const [selectedShift, setSelectedShift] = useState<"early" | "late" | "night">("early");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const effectiveDefault = defaultDate || formatDate(new Date());
  const [wardTaskDate, setWardTaskDate] = useState(effectiveDefault);
  const [taskDate, setTaskDate] = useState(effectiveDefault);
  const [appointmentDate, setAppointmentDate] = useState(effectiveDefault);

  // Reset dates when defaultDate changes (e.g. opening modal from a different day)
  useEffect(() => {
    setWardTaskDate(effectiveDefault);
    setTaskDate(effectiveDefault);
    setAppointmentDate(effectiveDefault);
  }, [effectiveDefault]);

  // Appointment specific
  const [timeType, setTimeType] = useState<"preset" | "exact">("preset");
  const [presetTime, setPresetTime] = useState<"morning" | "afternoon" | "evening" | "night">("morning");
  const [exactTime, setExactTime] = useState("09:00");
  const [duration, setDuration] = useState("");

  // Assignment toggle: "myself" or "ward"
  const [assignTo, setAssignTo] = useState<"ward" | "myself">("ward");

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

    const claimFields = assignTo === "myself" && currentUserName
      ? { claimedBy: currentUserName, claimedAt: formatDate(new Date()), status: "in_progress" as const }
      : { status: "pending" as const };

    const baseTask = {
      title,
      priority,
      ...claimFields,
      dueDate: taskType === "ward" ? (isRecurring ? effectiveDefault : wardTaskDate) : taskDate,
      createdAt: formatDate(new Date()),
      createdBy: currentUserName || "Current User",
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
        repeatIntervalDays: patientRepeat ? repeatIntervalDays : undefined,
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
    setPatientRepeat(false);
    setRepeatIntervalDays(7);
    setLinkedReferral("");
    setLinkedGuide("");
    setAppointmentDate(formatDate(new Date()));
    setTimeType("preset");
    setPresetTime("morning");
    setExactTime("09:00");
    setDuration("");
    setAssignTo("ward");
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
            { type: "ward" as const, icon: "🏥", label: "Team Task" },
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {/* Patient task repeat toggle */}
        {taskType === "patient" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Repeats?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPatientRepeat(false)}
                className={`p-3 rounded-xl text-center transition-all ${
                  !patientRepeat
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-xl block">📌</span>
                <span className="text-xs font-medium">One-off</span>
              </button>
              <button
                onClick={() => setPatientRepeat(true)}
                className={`p-3 rounded-xl text-center transition-all ${
                  patientRepeat
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-xl block">🔄</span>
                <span className="text-xs font-medium">Repeating</span>
              </button>
            </div>
            {patientRepeat && (
              <div className="mt-3 p-3 border border-indigo-200 rounded-xl bg-indigo-50">
                <p className="text-xs font-medium text-indigo-800 mb-2">Repeat every:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { days: 7, label: "Weekly" },
                    { days: 14, label: "Fortnightly" },
                    { days: 28, label: "4 weeks" },
                    { days: 1, label: "Daily" },
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      onClick={() => setRepeatIntervalDays(opt.days)}
                      className={`p-2 rounded-lg text-center text-xs font-medium transition-all ${
                        repeatIntervalDays === opt.days
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-indigo-600 mt-2">
                  Task will appear every {repeatIntervalDays} day{repeatIntervalDays > 1 ? "s" : ""} from {taskDate}
                </p>
              </div>
            )}
          </div>
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

        {/* How-to guide link - for non-referral patient tasks and team tasks */}
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

        {/* Assign to toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAssignTo("ward")}
              className={`p-3 rounded-xl text-center transition-all ${
                assignTo === "ward"
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-xl block">🏥</span>
              <span className="text-xs font-medium">Ward</span>
              <span className="text-[10px] block opacity-75">Anyone can claim</span>
            </button>
            <button
              onClick={() => setAssignTo("myself")}
              className={`p-3 rounded-xl text-center transition-all ${
                assignTo === "myself"
                  ? "bg-gradient-to-r from-green-500 to-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-xl block">👤</span>
              <span className="text-xs font-medium">Myself</span>
              <span className="text-[10px] block opacity-75">Claim it straight away</span>
            </button>
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

// Repeat Team Tasks Modal - shows Mon-Sun overview
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

  // Filter only recurring team tasks
  const recurringTasks = tasks.filter((t) => t.isRecurring);

  // Days of the week
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get tasks for a specific day (defensive array check)
  const getTasksForDay = (dayIndex: number): WardTask[] => {
    return recurringTasks.filter((t) => {
      const days = Array.isArray(t.recurringDays) ? t.recurringDays : [];
      return days.includes(dayIndex);
    });
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
              <h2 className="text-xl font-bold">Repeating Team Tasks</h2>
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
              <p className="text-gray-700 font-semibold text-lg">No repeating team tasks yet</p>
              <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                Repeating tasks help ensure routine ward activities happen every shift.
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Create a team task and toggle &quot;Repeating Task&quot; to add it here
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
  diaryView,
  onDiaryViewChange,
  onHideCompletedChange,
  showWardTasksSetting,
  onShowWardTasksChange,
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
  diaryView: "simple" | "detailed";
  onDiaryViewChange: (view: "simple" | "detailed") => void;
  onHideCompletedChange: (val: boolean) => void;
  showWardTasksSetting: boolean;
  onShowWardTasksChange: (val: boolean) => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
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

    // Filter team tasks by shift
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

  // Group team tasks by shift
  const earlyTasks = wardTasks.filter(t => t.shift === "early");
  const lateTasks = wardTasks.filter(t => t.shift === "late");
  const nightTasks = wardTasks.filter(t => t.shift === "night");

  const totalFiltered = wardTasks.length + patientTasks.length + appointments.length;

  return (
    <div className="fixed top-[57px] left-0 right-0 bottom-0 bg-gray-50 z-20 overflow-hidden flex flex-col">
      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          {/* Filter controls + day navigation on same row */}
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
                  🏥 Team Tasks
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

            {/* Day navigation – far right */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  const idx = dates.indexOf(date);
                  if (idx > 0 && onChangeDate) onChangeDate(dates[idx - 1]);
                }}
                disabled={dates.indexOf(date) <= 0}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <span className="font-semibold text-gray-900 text-sm min-w-[70px] text-center">
                {formatDisplayDate(date)}
              </span>
              <button
                onClick={() => {
                  const idx = dates.indexOf(date);
                  if (idx < dates.length - 1 && onChangeDate) onChangeDate(dates[idx + 1]);
                }}
                disabled={dates.indexOf(date) >= dates.length - 1}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next day"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
              <div className="w-px h-5 bg-gray-300" />
              <button
                onClick={onClose}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Back to overview"
                aria-label="Back to overview"
              >
                <Minimize2 className="w-4 h-4 text-gray-700" />
              </button>
              <div className="w-px h-5 bg-gray-300" />
              <input
                type="date"
                value={date}
                onChange={(e) => onChangeDate?.(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="w-px h-5 bg-gray-300" />
              {/* Settings cog */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg transition-colors ${showSettings ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                  title="Diary settings"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                {showSettings && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-56 py-2">
                    <div className="px-3 py-1.5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">View</p>
                    </div>
                    <div className="px-2 py-1.5">
                      <div className="flex gap-1">
                        <button onClick={() => onDiaryViewChange("simple")} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${diaryView === "simple" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>Simple</button>
                        <button onClick={() => onDiaryViewChange("detailed")} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${diaryView === "detailed" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>Detailed</button>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 border-t border-gray-100 mt-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</p>
                    </div>
                    <label className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                      <span className="text-xs text-gray-700">Hide completed</span>
                      <input type="checkbox" checked={hideCompleted} onChange={(e) => onHideCompletedChange(e.target.checked)} className="rounded border-gray-300 text-indigo-600 w-3.5 h-3.5" />
                    </label>
                    <label className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                      <span className="text-xs text-gray-700">Show team tasks</span>
                      <input type="checkbox" checked={showWardTasksSetting} onChange={(e) => onShowWardTasksChange(e.target.checked)} className="rounded border-gray-300 text-indigo-600 w-3.5 h-3.5" />
                    </label>
                    <div className="px-3 pt-2 pb-1 border-t border-gray-100 mt-1">
                      <button onClick={() => setShowSettings(false)} className="w-full py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">Done</button>
                    </div>
                  </div>
                )}
              </div>
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
              {/* Team Tasks Column – always show header */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  🏥 Team Tasks
                  <span className="text-sm font-normal text-gray-500">
                    ({wardTasks.length})
                  </span>
                </h2>
                {showWardTasks && (earlyTasks.length > 0 || lateTasks.length > 0 || nightTasks.length > 0) ? (
                  <>
                    {showEarly && earlyTasks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                            <Sun className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800">Early Shift</h3>
                          <span className="text-xs text-gray-500">({earlyTasks.length})</span>
                        </div>
                        <PriorityGroupedTasks tasks={earlyTasks} onToggleComplete={onToggleComplete} onClaim={onClaim} onSteal={onSteal} onTaskClick={onTaskClick} currentUserName={currentUserName} />
                      </div>
                    )}
                    {showLate && lateTasks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                            <Sunset className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800">Late Shift</h3>
                          <span className="text-xs text-gray-500">({lateTasks.length})</span>
                        </div>
                        <PriorityGroupedTasks tasks={lateTasks} onToggleComplete={onToggleComplete} onClaim={onClaim} onSteal={onSteal} onTaskClick={onTaskClick} currentUserName={currentUserName} />
                      </div>
                    )}
                    {showNight && nightTasks.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center">
                            <Moon className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800">Night Shift</h3>
                          <span className="text-xs text-gray-500">({nightTasks.length})</span>
                        </div>
                        <PriorityGroupedTasks tasks={nightTasks} onToggleComplete={onToggleComplete} onClaim={onClaim} onSteal={onSteal} onTaskClick={onTaskClick} currentUserName={currentUserName} />
                      </div>
                    )}
                  </>
                ) : (
                  <button onClick={onAddTask} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-sm font-medium">
                    None scheduled – tap to add team task
                  </button>
                )}
              </div>

              {/* Patient Tasks Column – always show header */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  👤 Patient Tasks
                  <span className="text-sm font-normal text-gray-500">
                    ({patientTasks.length})
                  </span>
                </h2>
                {showPatientTasks && patientTasks.length > 0 ? (
                  <PriorityGroupedTasks tasks={patientTasks} onToggleComplete={onToggleComplete} onClaim={onClaim} onSteal={onSteal} onTaskClick={onTaskClick} currentUserName={currentUserName} />
                ) : (
                  <button onClick={onAddTask} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-sm font-medium">
                    None scheduled – tap to add patient task
                  </button>
                )}
              </div>

              {/* Appointments Column – always show header */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                  📅 Appointments
                  <span className="text-sm font-normal text-gray-500">
                    ({appointments.length})
                  </span>
                </h2>
                {showAppointments && appointments.length > 0 ? (
                  <PriorityGroupedTasks tasks={appointments} onToggleComplete={onToggleComplete} onClaim={onClaim} onSteal={onSteal} onTaskClick={onTaskClick} currentUserName={currentUserName} />
                ) : (
                  <button onClick={onAddTask} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-sm font-medium">
                    None scheduled – tap to add appointment
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Task button */}
      {onAddTask && (
        <button
          onClick={onAddTask}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
          title="Add Task"
          aria-label="Add Task"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
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
  const { user, activeWard } = useApp();
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
  const [focusedDate, setFocusedDate] = useState<string>(() => formatDate(new Date()));
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

  // Get team tasks for repeat modal
  const wardTasks = tasks.filter((t) => t.type === "ward" && t.ward === activeWard) as WardTask[];

  // Get tasks for a specific date, filtered by activeWard + optional filters
  const getTasksForDate = (date: string): DiaryTask[] => {
    const isTargetToday = date === todayStr;

    return tasks.filter((task) => {
      // Filter by active ward
      if (task.ward !== activeWard) return false;

      // My Diary mode - filter to "my stuff" only
      if (isMyDiaryMode) {
        if (task.type === "patient" || task.type === "appointment") {
          const isClaimedByMe = task.claimedBy === user?.name;
          if (showMyPatients && myPatientIds.length > 0) {
            // Show tasks I claimed OR tasks for my WP patients (even if claimed by others)
            const isMyPatient = task.patientId && myPatientIds.includes(task.patientId);
            if (!isMyPatient && !isClaimedByMe) return false;
          } else {
            // My tasks only - only show tasks I personally claimed
            if (!isClaimedByMe) return false;
          }
        }
        if (task.type === "ward") {
          // Only show team tasks I claimed or unclaimed ones I could pick up
          if (task.claimedBy && task.claimedBy !== user?.name) return false;
        }
      } else if (showMyPatients && myPatientIds.length > 0) {
        // Team Diary with My Patients toggle on
        if (task.type === "patient" || task.type === "appointment") {
          if (!task.patientId || !myPatientIds.includes(task.patientId)) return false;
        }
      }

      // Lead/Manager staff filter - show only tasks claimed by selected staff
      if (selectedStaffFilter.length > 0) {
        if (task.claimedBy && !selectedStaffFilter.includes(task.claimedBy)) return false;
        // Show unclaimed tasks too
      }

      if (task.type === "ward") {
        // Recurring team tasks show on every matching day of the week
        const days = Array.isArray(task.recurringDays) ? task.recurringDays : [];
        if (task.isRecurring && days.length > 0) {
          const targetDayOfWeek = new Date(date + "T12:00:00").getDay();
          return days.includes(targetDayOfWeek);
        }
        return task.dueDate === date;
      } else if (task.type === "patient") {
        // Repeating patient tasks show on interval dates
        if (task.repeatIntervalDays && task.repeatIntervalDays > 0) {
          const startDate = new Date(task.dueDate + "T12:00:00");
          const targetDate = new Date(date + "T12:00:00");
          if (targetDate < startDate) return false;
          // Check if repeatUntil is set and target is past it
          if (task.repeatUntil) {
            const untilDate = new Date(task.repeatUntil + "T12:00:00");
            if (targetDate > untilDate) return false;
          }
          const diffDays = Math.round((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays % task.repeatIntervalDays === 0;
        }
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

  // Count stats for focused day
  const focusedTasks = getTasksForDate(focusedDate || todayStr);
  const pendingCount = focusedTasks.filter((t) => t.status === "pending" || t.status === "overdue" || t.status === "in_progress").length;
  const completedCount = focusedTasks.filter((t) => t.status === "completed").length;

  return (
    <MainLayout>
      <div className="space-y-4 theme-page min-h-screen -m-4 p-4" style={{ backgroundColor: "var(--theme-page-bg)" }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 theme-heading">{isMyDiaryMode ? "📋 My Diary" : "📋 Team Diary"}</h1>
              <p className="text-gray-600">
                {isMyDiaryMode ? `${user?.name} · ` : ""}{activeWard} Ward · {formatDisplayDate(focusedDate || todayStr)}
              </p>
            </div>
            {/* View toggle */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
              {isMyDiaryMode ? (
                <Link href="/tasks" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors no-underline">
                  Team Diary
                </Link>
              ) : (
                <div className="px-4 py-2 rounded-lg bg-nhs-blue text-white font-semibold text-sm">
                  Team Diary
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

          {/* My Diary: patient tasks toggle */}
          {isMyDiaryMode && (
            <button
              onClick={() => setShowMyPatients(!showMyPatients)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                showMyPatients
                  ? "bg-purple-100 text-purple-800 ring-2 ring-purple-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={showMyPatients ? "Showing tasks for your patients too (claimed by anyone)" : "Showing only tasks you personally claimed"}
            >
              <UserPlus className="w-4 h-4" />
              {showMyPatients ? "My tasks + my patients" : "My tasks only"}
            </button>
          )}

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

          {/* Staff Tasks filter - Lead/Manager/Ward Admin only, Team Diary only */}
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
                    <span className="text-xs text-gray-700">Show team tasks</span>
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
              <p className="font-medium text-gray-900 mb-1">🏥 Team Tasks</p>
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
        defaultDate={expandedDay || focusedDate || todayStr}
        currentUserName={user?.name}
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
          diaryView={diaryView}
          onDiaryViewChange={setDiaryView}
          onHideCompletedChange={setHideCompleted}
          showWardTasksSetting={showWardTasksSetting}
          onShowWardTasksChange={setShowWardTasksSetting}
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
