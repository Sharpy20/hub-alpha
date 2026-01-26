"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Clock, Plus } from "lucide-react";
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
  ALL_DEMO_TASKS,
} from "@/lib/data/tasks";
import { useApp } from "@/app/providers";

// Helper
const formatDate = (date: Date) => date.toISOString().split("T")[0];

// Mini Task Card for widget
function MiniTaskCard({
  task,
  onToggleComplete,
}: {
  task: DiaryTask;
  onToggleComplete: (id: string) => void;
}) {
  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";

  let gradient = "from-gray-400 to-gray-600";
  let icon = "📌";

  if (task.type === "ward") {
    const shiftConfig = SHIFT_CONFIG[task.shift];
    gradient = shiftConfig.gradient;
    icon = shiftConfig.icon;
  } else if (task.type === "patient") {
    const catConfig = TASK_CATEGORY_CONFIG[task.category];
    gradient = catConfig.gradient;
    icon = catConfig.icon;
  } else if (task.type === "appointment") {
    gradient = "from-blue-500 to-blue-700";
    icon = "📅";
  }

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className={`rounded-lg overflow-hidden transition-all ${
        isCompleted ? "opacity-50" : "hover:shadow-md"
      }`}
    >
      <div className={`bg-gradient-to-r ${gradient} p-2`}>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center transition-all ${
              isCompleted ? "bg-white/30" : "hover:bg-white/20"
            }`}
          >
            {isCompleted && <Check className="w-3 h-3 text-white" />}
          </button>
          <span className="text-sm">{icon}</span>
          <h4
            className={`text-xs font-medium text-white truncate flex-1 ${
              isCompleted ? "line-through" : ""
            }`}
          >
            {task.title}
          </h4>
          <div className="flex items-center gap-1">
            {isOverdue && (
              <span className="bg-red-500 text-white text-[10px] px-1 rounded">!</span>
            )}
            <span className="text-xs">{priorityConfig.icon}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Column component
function TaskColumn({
  title,
  icon,
  tasks,
  gradient,
  onToggleComplete,
  emptyMessage,
}: {
  title: string;
  icon: string;
  tasks: DiaryTask[];
  gradient: string;
  onToggleComplete: (id: string) => void;
  emptyMessage: string;
}) {
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} p-3 text-white`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <h3 className="font-bold text-sm">{title}</h3>
            <p className="text-xs text-white/70">{tasks.length} total</p>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-2 flex-1 overflow-y-auto max-h-64 space-y-1.5">
        {pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-2xl mb-1">✨</p>
            <p className="text-xs">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {pendingTasks.map((task) => (
              <MiniTaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
              />
            ))}
            {completedTasks.length > 0 && (
              <div className="pt-2 border-t border-gray-100 mt-2">
                <p className="text-xs text-gray-400 mb-1.5 px-1">
                  Completed ({completedTasks.length})
                </p>
                {completedTasks.slice(0, 2).map((task) => (
                  <MiniTaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                  />
                ))}
                {completedTasks.length > 2 && (
                  <p className="text-xs text-gray-400 text-center mt-1">
                    +{completedTasks.length - 2} more
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function TodayWidget() {
  const { activeWard } = useApp();
  const [tasks, setTasks] = useState<DiaryTask[]>(ALL_DEMO_TASKS);
  const todayStr = formatDate(new Date());

  // Get today's tasks with carry-over logic, filtered by active ward
  const getTodayTasks = (): DiaryTask[] => {
    return tasks.filter((task) => {
      // Filter by active ward
      if (task.ward !== activeWard) return false;
      if (task.type === "ward") {
        return task.dueDate === todayStr;
      } else if (task.type === "patient") {
        // Carry over incomplete past tasks to today
        if (task.carryOver && task.status !== "completed" && task.status !== "cancelled") {
          const taskDate = new Date(task.dueDate);
          const today = new Date(todayStr);
          if (taskDate <= today) {
            return true;
          }
        }
        return task.dueDate === todayStr;
      } else if (task.type === "appointment") {
        return task.appointmentDate === todayStr;
      }
      return false;
    });
  };

  const todayTasks = getTodayTasks();
  const wardTasks = todayTasks.filter((t) => t.type === "ward") as WardTask[];
  const patientTasks = todayTasks.filter((t) => t.type === "patient") as PatientTask[];
  const appointments = todayTasks.filter((t) => t.type === "appointment") as Appointment[];

  const pendingCount = todayTasks.filter(
    (t) => t.status === "pending" || t.status === "overdue" || t.status === "in_progress"
  ).length;
  const completedCount = todayTasks.filter((t) => t.status === "completed").length;

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "completed" ? "pending" : "completed",
              completedAt: task.status === "completed" ? undefined : formatDate(new Date()),
              completedBy: task.status === "completed" ? undefined : "Current User",
            }
          : task
      )
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 border border-indigo-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📋 Today&apos;s Tasks
            <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {activeWard} Ward
            </span>
          </h2>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            {pendingCount}
          </div>
          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            <Check className="w-3 h-3" />
            {completedCount}
          </div>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <TaskColumn
          title="Ward Tasks"
          icon="🏥"
          tasks={wardTasks}
          gradient="from-amber-500 to-orange-600"
          onToggleComplete={handleToggleComplete}
          emptyMessage="No ward tasks"
        />
        <TaskColumn
          title="Patient Tasks"
          icon="👤"
          tasks={patientTasks}
          gradient="from-indigo-500 to-purple-600"
          onToggleComplete={handleToggleComplete}
          emptyMessage="No patient tasks"
        />
        <TaskColumn
          title="Appointments"
          icon="📅"
          tasks={appointments}
          gradient="from-blue-500 to-cyan-600"
          onToggleComplete={handleToggleComplete}
          emptyMessage="No appointments"
        />
      </div>

      {/* Footer links - matching lighter button styles */}
      <div className="flex gap-3">
        <Link
          href="/tasks"
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border-2 border-indigo-200 rounded-xl text-indigo-700 font-medium hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          Ward Diary
          <ChevronRight className="w-4 h-4" />
        </Link>
        <Link
          href="/my-tasks"
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border-2 border-indigo-200 rounded-xl text-indigo-700 font-medium hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          My Tasks
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
