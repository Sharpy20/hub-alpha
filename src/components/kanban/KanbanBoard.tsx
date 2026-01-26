"use client";

import { useState } from "react";
import { DiaryTask } from "@/lib/types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  tasks: DiaryTask[];
  currentUserName: string;
  onUpdateTask: (taskId: string, updates: Partial<DiaryTask>) => void;
  onTaskClick?: (task: DiaryTask) => void;
}

export function KanbanBoard({ tasks, currentUserName, onUpdateTask, onTaskClick }: KanbanBoardProps) {
  const [draggingTask, setDraggingTask] = useState<DiaryTask | null>(null);

  // Filter tasks claimed by current user
  const myTasks = tasks.filter((t) => t.claimedBy === currentUserName);

  // Separate into columns
  // "Today" = claimed tasks that are pending (not in_progress or completed)
  const todayTasks = myTasks.filter(
    (t) => t.status === "pending" || t.status === "overdue"
  );
  // "In Progress" = tasks with in_progress status
  const inProgressTasks = myTasks.filter((t) => t.status === "in_progress");
  // "Completed" = completed tasks (show recent ones)
  const completedTasks = myTasks.filter((t) => t.status === "completed");

  const handleDragStart = (e: React.DragEvent, task: DiaryTask) => {
    e.dataTransfer.setData("taskId", task.id);
    setDraggingTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToday = (taskId: string) => {
    // Move to "Today" (pending status)
    onUpdateTask(taskId, { status: "pending" });
    setDraggingTask(null);
  };

  const handleDropInProgress = (taskId: string) => {
    // Move to "In Progress"
    onUpdateTask(taskId, { status: "in_progress" });
    setDraggingTask(null);
  };

  const handleDropCompleted = (taskId: string) => {
    // Move to "Completed"
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    onUpdateTask(taskId, {
      status: "completed",
      completedAt: formatDate(new Date()),
      completedBy: currentUserName,
    });
    setDraggingTask(null);
  };

  const handleUnclaim = (taskId: string) => {
    onUpdateTask(taskId, {
      claimedBy: undefined,
      claimedAt: undefined,
    });
  };

  const handleComplete = (taskId: string) => {
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    onUpdateTask(taskId, {
      status: "completed",
      completedAt: formatDate(new Date()),
      completedBy: currentUserName,
    });
  };

  const handleReopen = (taskId: string) => {
    // Reopen a completed task - set back to pending
    onUpdateTask(taskId, {
      status: "pending",
      completedAt: undefined,
      completedBy: undefined,
    });
  };

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory sm:snap-none">
      <KanbanColumn
        title="Today"
        icon="📋"
        tasks={todayTasks}
        gradient="from-amber-500 to-orange-600"
        onDrop={handleDropToday}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onUnclaim={handleUnclaim}
        onComplete={handleComplete}
        onReopen={handleReopen}
        onTaskClick={onTaskClick}
      />
      <KanbanColumn
        title="In Progress"
        icon="🔄"
        tasks={inProgressTasks}
        gradient="from-blue-500 to-indigo-600"
        onDrop={handleDropInProgress}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onUnclaim={handleUnclaim}
        onComplete={handleComplete}
        onReopen={handleReopen}
        onTaskClick={onTaskClick}
      />
      <KanbanColumn
        title="Completed"
        icon="✅"
        tasks={completedTasks}
        gradient="from-green-500 to-emerald-600"
        onDrop={handleDropCompleted}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onUnclaim={handleUnclaim}
        onComplete={handleComplete}
        onReopen={handleReopen}
        onTaskClick={onTaskClick}
      />
    </div>
  );
}
