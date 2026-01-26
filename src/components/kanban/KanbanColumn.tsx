"use client";

import { DiaryTask } from "@/lib/types";
import { KanbanTaskCard } from "./KanbanTaskCard";

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
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId);
    }
  };

  return (
    <div
      className="flex-1 min-w-[260px] sm:min-w-[280px] max-w-full sm:max-w-[350px] bg-white rounded-2xl border-2 border-gray-200 overflow-hidden flex flex-col snap-start"
      onDragOver={onDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <span className="bg-white/30 text-white px-2 py-0.5 rounded-full text-sm font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] max-h-[60vh]">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center px-4">
              <p className="text-4xl mb-2">
                {title === "Today" ? "📋" : title === "In Progress" ? "🔄" : "🎉"}
              </p>
              <p className="text-sm font-medium">
                {title === "Today"
                  ? "No tasks claimed"
                  : title === "In Progress"
                  ? "Nothing in progress"
                  : "Nothing completed yet"}
              </p>
              <p className="text-xs mt-1 text-gray-300">
                {title === "Today"
                  ? "Claim tasks from the Ward Diary"
                  : title === "In Progress"
                  ? "Drag tasks here when working"
                  : "Complete tasks to see them here"}
              </p>
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onUnclaim={onUnclaim}
              onComplete={onComplete}
              onReopen={onReopen}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
