"use client";

import { DiaryTask } from "@/lib/types";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { useApp } from "@/app/providers";

interface KanbanColumnProps {
  title: string;
  icon: string;
  tasks: DiaryTask[];
  gradient: string;
  onDrop: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: DiaryTask) => void;
  onDragOver: (e: React.DragEvent) => void;
  onUnclaim: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onReopen?: (taskId: string) => void;
  onTaskClick?: (task: DiaryTask) => void;
}

export function KanbanColumn({
  title,
  icon,
  tasks,
  gradient,
  onDrop,
  onDragStart,
  onDragOver,
  onUnclaim,
  onComplete,
  onReopen,
  onTaskClick,
}: KanbanColumnProps) {
  const { styleTheme } = useApp();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) onDrop(taskId);
  };

  // Theme-aware column styling
  const isNHS = styleTheme === "nhs";
  const isFantastical = styleTheme === "fluent";
  const isNotion = styleTheme === "oneui";

  const colBg = isFantastical ? "#1A1845" : "#ffffff";
  const colBorder = isFantastical ? "rgba(99,102,241,0.2)" : isNotion ? "#E9E9E7" : "#E5E7EB";
  const colRadius = isNotion || isFantastical ? "0" : undefined;

  const headerStyle: React.CSSProperties = isNHS
    ? {}
    : isFantastical
    ? { background: "#0F0E2E", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "16px" }
    : isNotion
    ? { background: "#ffffff", borderBottom: "2px solid #37352F", padding: "16px" }
    : styleTheme === "ios"
    ? { background: "#F2F2F7", padding: "16px" }
    : /* material */ { background: "#1A73E8", padding: "16px" };

  const headerTextColor = isFantastical ? "#818CF8" : isNotion ? "#37352F" : styleTheme === "ios" ? "#007AFF" : isNHS ? "#ffffff" : "#ffffff";
  const badgeBg = isFantastical ? "rgba(99,102,241,0.3)" : isNotion ? "#E9E9E7" : styleTheme === "ios" ? "rgba(0,122,255,0.15)" : "rgba(255,255,255,0.3)";
  const badgeText = isFantastical ? "#818CF8" : isNotion ? "#37352F" : styleTheme === "ios" ? "#007AFF" : "#ffffff";

  return (
    <div
      className="flex-1 min-w-[260px] sm:min-w-[280px] max-w-full sm:max-w-[350px] overflow-hidden flex flex-col snap-start"
      style={{ background: colBg, border: `2px solid ${colBorder}`, borderRadius: colRadius ?? "1rem" }}
      onDragOver={onDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div style={isNHS ? undefined : headerStyle} className={isNHS ? `bg-gradient-to-r ${gradient} p-4 text-white` : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-bold text-lg" style={isNHS ? undefined : { color: headerTextColor }}>{title}</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-sm font-medium" style={{ background: badgeBg, color: badgeText }}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[60vh]" style={isNotion ? { padding: "8px 4px" } : undefined}>
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4" style={{ color: isFantastical ? "#818CF8" : "#6b7280" }}>
              <p className="text-4xl mb-2">{title === "Not Started" ? "📋" : title === "In Progress" ? "🔄" : "🎉"}</p>
              <p className="text-sm font-medium">{title === "Not Started" ? "No tasks claimed" : title === "In Progress" ? "Nothing in progress" : "Nothing completed yet"}</p>
              <p className="text-xs mt-1">{title === "Not Started" ? "Claim tasks from the Team Diary" : title === "In Progress" ? "Drag tasks here when working" : "Complete tasks to see them here"}</p>
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} onDragStart={onDragStart} onUnclaim={onUnclaim} onComplete={onComplete} onReopen={onReopen} onClick={onTaskClick} />
          ))
        )}
      </div>
    </div>
  );
}
