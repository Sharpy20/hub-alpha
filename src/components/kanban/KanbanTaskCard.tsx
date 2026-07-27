"use client";

import { DiaryTask, PRIORITY_CONFIG, TASK_CATEGORY_CONFIG, SHIFT_CONFIG } from "@/lib/types";
import { Hand, Check, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/app/providers";
import { HandbackBadge } from "@/components/tasks/HandbackBadge";

function getKanbanAccent(theme: string, taskType: string) {
  type T = Record<string, { accent: string; tint: string; text: string; muted: string }>;
  const MAP: Record<string, T> = {
    ios:      { ward: { accent:"#007AFF",tint:"#fff",text:"#000",muted:"#8E8E93" }, patient:{accent:"#FF3B30",tint:"#fff",text:"#000",muted:"#8E8E93"}, appointment:{accent:"#FF9500",tint:"#fff",text:"#000",muted:"#8E8E93"} },
    material: { ward: { accent:"#1A73E8",tint:"#E8F0FE",text:"#3C4043",muted:"#70757A" }, patient:{accent:"#D93025",tint:"#FCE8E6",text:"#3C4043",muted:"#70757A"}, appointment:{accent:"#E37400",tint:"#FEF7E0",text:"#3C4043",muted:"#70757A"} },
    fluent:   { ward: { accent:"#818CF8",tint:"#1E1B52",text:"#C7D2FE",muted:"#818CF8" }, patient:{accent:"#F472B6",tint:"#1E1B52",text:"#FBCFE8",muted:"#F472B6"}, appointment:{accent:"#FBBF24",tint:"#1E1B52",text:"#FDE68A",muted:"#FBBF24"} },
    oneui:    { ward: { accent:"#6E8EBF",tint:"#fff",text:"#37352F",muted:"#9B9A97" }, patient:{accent:"#E16B55",tint:"#fff",text:"#37352F",muted:"#9B9A97"}, appointment:{accent:"#C4994E",tint:"#fff",text:"#37352F",muted:"#9B9A97"} },
  };
  return MAP[theme]?.[taskType] ?? { accent:"#005EB8", tint:"#fff", text:"#212B32", muted:"#768692" };
}

interface KanbanTaskCardProps {
  task: DiaryTask;
  onDragStart: (e: React.DragEvent, task: DiaryTask) => void;
  onUnclaim: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onReopen?: (taskId: string) => void;
  onClick?: (task: DiaryTask) => void;
}

export function KanbanTaskCard({ task, onDragStart, onUnclaim, onComplete, onReopen, onClick }: KanbanTaskCardProps) {
  const { styleTheme } = useApp();
  const isCompleted = task.status === "completed";

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const gradient = priorityConfig.gradient;

  let icon = "📌";
  let subtitle = "";
  let typeTag = "";

  if (task.type === "ward") {
    const shiftConfig = SHIFT_CONFIG[task.shift];
    icon = shiftConfig.icon;
    subtitle = `${shiftConfig.label} Shift`;
    typeTag = `${shiftConfig.label} · Team`;
  } else if (task.type === "patient") {
    const catConfig = TASK_CATEGORY_CONFIG[task.category];
    icon = catConfig.icon;
    subtitle = task.patientName || "No patient assigned";
    typeTag = catConfig.label;
  } else if (task.type === "appointment") {
    icon = "📅";
    subtitle = `${task.appointmentTime} · ${task.patientName || "Ward"}`;
    typeTag = "Appointment";
  }

  // NHS: existing gradient render
  if (styleTheme === "nhs") {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, task)}
        onClick={() => onClick?.(task)}
        className={`rounded-xl overflow-hidden transition-all cursor-grab active:cursor-grabbing ${isCompleted ? "opacity-70 hover:opacity-100" : "hover:shadow-lg hover:scale-[1.02]"}`}
      >
        <div className={`bg-gradient-to-r ${gradient} p-3`}>
          <div className="flex items-start gap-2">
            <span className="text-xl">{icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-white text-sm ${isCompleted ? "line-through" : ""}`}>{task.title}</h4>
              <p className="text-white/70 text-xs mt-0.5 truncate">{subtitle}</p>
            </div>
          </div>
          {typeTag && <span className="inline-block text-white/70 text-[10px] bg-white/15 rounded px-1.5 py-0.5 mt-1">{typeTag}</span>}
          {task.type !== "appointment" && <p className="text-white/60 text-xs mt-2">Due: {task.dueDate}</p>}
          <div className="mt-2 flex items-center gap-2">
            {!isCompleted ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); onUnclaim(task.id); }} className="flex items-center gap-1 text-white/90 text-xs bg-white/20 hover:bg-white/30 rounded px-3 py-1.5 transition-colors min-h-[32px]"><Hand className="w-3.5 h-3.5" /> Unclaim</button>
                <button onClick={(e) => { e.stopPropagation(); onComplete(task.id); }} className="flex items-center gap-1 text-white/90 text-xs bg-white/20 hover:bg-white/30 rounded px-3 py-1.5 transition-colors min-h-[32px]"><Check className="w-3.5 h-3.5" /> Done</button>
              </>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); onReopen?.(task.id); }} className="flex items-center gap-1 text-white/90 text-xs bg-white/20 hover:bg-white/30 rounded px-3 py-1.5 transition-colors min-h-[32px]"><RotateCcw className="w-3.5 h-3.5" /> Reopen</button>
            )}
            {task.type === "patient" && task.linkedReferralId && <Link href={`/guides/${task.linkedReferralId}`} className="text-white/80 text-xs no-underline ml-auto" onClick={(e) => e.stopPropagation()}>📋</Link>}
            {task.linkedGuideId && <Link href={`/guides/${task.linkedGuideId}`} className="text-white/80 text-xs no-underline ml-auto" onClick={(e) => e.stopPropagation()}>📖</Link>}
          </div>
        </div>
      </div>
    );
  }

  // Non-NHS: theme-aware render
  const { accent, tint, text: textPrimary, muted: textMuted } = getKanbanAccent(styleTheme, task.type);
  const isFantastical = styleTheme === "fluent";
  const isNotion = styleTheme === "oneui";

  const cardStyle: React.CSSProperties = isNotion
    ? { background: "#ffffff", borderBottom: "1px solid #E9E9E7", borderRadius: 0, padding: "12px 4px" }
    : isFantastical
    ? { background: "#1E1B52", borderLeft: `3px solid ${accent}`, borderTop: "0.5px solid rgba(255,255,255,0.05)", borderRadius: 0, padding: "12px" }
    : styleTheme === "material"
    ? { background: tint, borderLeft: `4px solid ${accent}`, borderRadius: "0.25rem", padding: "12px" }
    : /* ios */ { background: "#ffffff", borderLeft: `5px solid ${accent}`, borderRadius: "0.875rem", overflow: "hidden", padding: "12px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" };

  const btnStyle: React.CSSProperties = { border: `1px solid ${accent}`, color: accent, background: "transparent", borderRadius: "0.375rem", padding: "4px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick?.(task)}
      className={`transition-all cursor-grab active:cursor-grabbing overflow-hidden ${isCompleted ? "opacity-60" : ""}`}
      style={cardStyle}
    >
      {isNotion ? (
        <div className="flex items-start gap-2">
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, marginTop: 6, flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm ${isCompleted ? "line-through" : ""}`} style={{ color: isCompleted ? "#9B9A97" : "#37352F", fontWeight: 400 }}>{task.title}</h4>
            <p style={{ color: "#9B9A97", fontSize: 11, fontFamily: '"Courier New", monospace' }}>{subtitle}</p>
            {task.type !== "appointment" && <p style={{ color: "#9B9A97", fontSize: 11 }}>{task.dueDate}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              {!isCompleted ? (
                <>
                  <button onClick={(e) => { e.stopPropagation(); onUnclaim(task.id); }} style={{ color: textMuted, fontSize: 11, cursor: "pointer" }}>Unclaim</button>
                  <button onClick={(e) => { e.stopPropagation(); onComplete(task.id); }} style={{ color: accent, fontSize: 11, cursor: "pointer" }}>Mark done</button>
                </>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); onReopen?.(task.id); }} style={{ color: textMuted, fontSize: 11, cursor: "pointer" }}>Reopen</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-2 mb-2">
            <span className="text-xl">{icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${isCompleted ? "line-through" : ""}`} style={{ color: textPrimary }}>{task.title}</h4>
              <p className="text-xs mt-0.5 truncate" style={{ color: textMuted }}>{subtitle}</p>
            </div>
          </div>
          {typeTag && <span className="inline-block text-[10px] rounded px-1.5 py-0.5 mb-1" style={{ color: accent, background: `${accent}20` }}>{typeTag}</span>}
          {/* The badge is the hint that this is not a brand new job. */}
          {task.handback && !isCompleted && (
            <div className="mb-1.5">
              <HandbackBadge handback={task.handback} count={task.handbackCount} size="xs" />
            </div>
          )}
          {task.type !== "appointment" && <p className="text-xs mb-2" style={{ color: textMuted }}>Due: {task.dueDate}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            {!isCompleted ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); onUnclaim(task.id); }} style={{ ...btnStyle, borderColor: textMuted, color: textMuted }}><Hand className="w-3 h-3" /> Unclaim</button>
                <button onClick={(e) => { e.stopPropagation(); onComplete(task.id); }} style={btnStyle}><Check className="w-3 h-3" /> Done</button>
              </>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); onReopen?.(task.id); }} style={{ ...btnStyle, borderColor: textMuted, color: textMuted }}><RotateCcw className="w-3 h-3" /> Reopen</button>
            )}
            {task.type === "patient" && task.linkedReferralId && <Link href={`/guides/${task.linkedReferralId}`} className="text-xs no-underline ml-auto" style={{ color: accent }} onClick={(e) => e.stopPropagation()}>📋</Link>}
            {task.linkedGuideId && <Link href={`/guides/${task.linkedGuideId}`} className="text-xs no-underline" style={{ color: accent }} onClick={(e) => e.stopPropagation()}>📖</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
