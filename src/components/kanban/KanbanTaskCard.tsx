"use client";

import { DiaryTask, PRIORITY_CONFIG, TASK_CATEGORY_CONFIG, SHIFT_CONFIG } from "@/lib/types";
import { Hand, Check, RotateCcw } from "lucide-react";
import Link from "next/link";

interface KanbanTaskCardProps {
  task: DiaryTask;
  onDragStart: (e: React.DragEvent, task: DiaryTask) => void;
  onUnclaim: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onReopen?: (taskId: string) => void;
  onClick?: (task: DiaryTask) => void;
}

export function KanbanTaskCard({ task, onDragStart, onUnclaim, onComplete, onReopen, onClick }: KanbanTaskCardProps) {
  const isCompleted = task.status === "completed";

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
    subtitle = task.patientName || "No patient assigned";
  } else if (task.type === "appointment") {
    gradient = "from-blue-500 to-blue-700";
    icon = "📅";
    subtitle = `${task.appointmentTime} · ${task.patientName || "Ward"}`;
  }

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick?.(task)}
      className={`rounded-xl overflow-hidden transition-all cursor-grab active:cursor-grabbing ${
        isCompleted ? "opacity-70 hover:opacity-100" : "hover:shadow-lg hover:scale-[1.02]"
      }`}
    >
      <div className={`bg-gradient-to-r ${gradient} p-3`}>
        <div className="flex items-start gap-2">
          <span className="text-xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <h4
              className={`font-semibold text-white text-sm ${
                isCompleted ? "line-through" : ""
              }`}
            >
              {task.title}
            </h4>
            <p className="text-white/70 text-xs mt-0.5 truncate">{subtitle}</p>
          </div>
          <span title={priorityConfig.label}>{priorityConfig.icon}</span>
        </div>

        {/* Due date indicator */}
        {task.type !== "appointment" && (
          <p className="text-white/60 text-xs mt-2">
            Due: {task.type === "ward" ? task.dueDate : task.dueDate}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-2 flex items-center gap-2">
          {!isCompleted ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnclaim(task.id);
                }}
                className="flex items-center gap-1 text-white/90 text-xs bg-white/20 hover:bg-white/30 active:bg-white/40 rounded px-3 py-1.5 transition-colors min-h-[32px]"
              >
                <Hand className="w-3.5 h-3.5" />
                Unclaim
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(task.id);
                }}
                className="flex items-center gap-1 text-white/90 text-xs bg-white/20 hover:bg-white/30 active:bg-white/40 rounded px-3 py-1.5 transition-colors min-h-[32px]"
              >
                <Check className="w-3.5 h-3.5" />
                Done
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReopen?.(task.id);
                }}
                className="flex items-center gap-1 text-white/90 text-xs bg-white/20 hover:bg-white/30 active:bg-white/40 rounded px-3 py-1.5 transition-colors min-h-[32px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen
              </button>
            </>
          )}

          {task.type === "patient" && task.linkedReferralId && (
            <Link
              href={`/referrals/${task.linkedReferralId}`}
              className="flex items-center gap-1 text-white/80 text-xs hover:text-white no-underline ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              📋
            </Link>
          )}
          {(task.type === "ward" || task.type === "patient") && task.linkedGuideId && (
            <Link
              href={`/how-to/${task.linkedGuideId}`}
              className="flex items-center gap-1 text-white/80 text-xs hover:text-white no-underline ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              📖
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
