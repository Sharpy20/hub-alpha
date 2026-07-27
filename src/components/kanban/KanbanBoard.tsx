"use client";

import { DiaryTask } from "@/lib/types";
import { showInfo } from "@/lib/utils/toast";
import { KanbanColumn } from "./KanbanColumn";
import { toLocalDateStr } from "@/lib/utils/date";

interface KanbanBoardProps {
  tasks: DiaryTask[];
  currentUserName: string;
  onUpdateTask: (taskId: string, updates: Partial<DiaryTask>) => void;
  onTaskClick?: (task: DiaryTask) => void;
}

export function KanbanBoard({ tasks, currentUserName, onUpdateTask, onTaskClick }: KanbanBoardProps) {
  // Filter tasks claimed by current user
  const myTasks = tasks.filter((t) => t.claimedBy === currentUserName);

  // Columns are To do / Waiting / Done (BACKLOG Section M). The old "In
  // Progress" column was self-declared - you dragged a card into it and nobody
  // else learned anything. What you are WAITING on is the useful split: it
  // declutters the list and shows what actually needs chasing.
  const waitingTasks = myTasks.filter(
    (t) => t.status !== "completed" && t.handback?.state === "waiting"
  );
  const todoTasks = myTasks.filter(
    (t) => t.status !== "completed" && t.handback?.state !== "waiting"
  );
  const completedTasks = myTasks.filter((t) => t.status === "completed");

  const handleDragStart = (e: React.DragEvent, task: DiaryTask) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Dragging out of Waiting clears the waiting state - you are back on it.
  const handleDropTodo = (taskId: string) => {
    onUpdateTask(taskId, { status: "pending", handback: undefined });
  };

  // You cannot drag INTO waiting: waiting means waiting on someone, and the
  // "who" is the whole point. Hand back is where that gets recorded.
  const handleDropWaiting = () => {
    showInfo("Use Hand back on the job to say who you are waiting on.");
  };

  const handleDropCompleted = (taskId: string) => {
    onUpdateTask(taskId, {
      status: "completed",
      completedAt: toLocalDateStr(),
      completedBy: currentUserName,
    });
  };

  const handleUnclaim = (taskId: string) => {
    onUpdateTask(taskId, {
      claimedBy: undefined,
      claimedAt: undefined,
    });
  };

  const handleComplete = (taskId: string) => {
    onUpdateTask(taskId, {
      status: "completed",
      completedAt: toLocalDateStr(),
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
    <div tabIndex={0} role="group" aria-label="Task board columns" className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory sm:snap-none">
      <KanbanColumn
        title="To do"
        icon="📋"
        tasks={todoTasks}
        gradient="from-amber-500 to-orange-600"
        onDrop={handleDropTodo}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onUnclaim={handleUnclaim}
        onComplete={handleComplete}
        onReopen={handleReopen}
        onTaskClick={onTaskClick}
      />
      <KanbanColumn
        title="Waiting"
        icon="⏳"
        tasks={waitingTasks}
        gradient="from-sky-500 to-blue-600"
        onDrop={handleDropWaiting}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onUnclaim={handleUnclaim}
        onComplete={handleComplete}
        onReopen={handleReopen}
        onTaskClick={onTaskClick}
      />
      <KanbanColumn
        title="Done"
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
