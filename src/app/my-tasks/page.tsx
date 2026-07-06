"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import { useV2Href } from "@/lib/hooks/useV2";
import Link from "next/link";
import { CalendarDays, Info, UserPlus } from "lucide-react";
import { DiaryTask } from "@/lib/types";
import { KanbanBoard } from "@/components/kanban";
import {
  StaffManagementModal,
  StaffTasksModal,
  TaskDetailModal,
} from "@/components/modals";
import { DEMO_PATIENTS } from "@/lib/data/tasks";

export default function MyTasksPage() {
  const link = useV2Href();
  const { user, activeWard } = useApp();
  const { tasks, updateTask, claimTask, toggleComplete } = useTasks();

  // Management modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showStaffTasksModal, setShowStaffTasksModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DiaryTask | null>(null);

  // My Patients toggle
  const [showMyPatients, setShowMyPatients] = useState(false);

  // Get patients where current user is ward professional
  const myPatientIds = showMyPatients && user
    ? DEMO_PATIENTS
        .filter(p => p.wardProfessional === user.name && p.ward === activeWard)
        .map(p => p.id)
    : [];

  // Handle task updates from Kanban - use shared context
  const handleUpdateTask = (taskId: string, updates: Partial<DiaryTask>) => {
    updateTask(taskId, updates);
    // Update selected task if it's the one being updated
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => prev ? { ...prev, ...updates } as DiaryTask : null);
    }
  };

  // Handle claim/unclaim - use shared context
  const handleClaim = (taskId: string) => {
    claimTask(taskId, user?.name || "Unknown");
  };

  // Handle steal
  const handleSteal = (taskId: string) => {
    claimTask(taskId, user?.name || "Unknown", true);
  };

  // Handle toggle complete
  const handleToggleComplete = (taskId: string) => {
    toggleComplete(taskId, user?.name || "Unknown");
  };

  const handleTaskClick = (task: DiaryTask) => {
    setSelectedTask(task);
  };

  const dischargedPatientIds = DEMO_PATIENTS
    .filter(p => p.status === "discharged")
    .map(p => p.id);

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    // Remove completed tasks for discharged patients
    if (task.status === "completed" && (task.type === "patient" || task.type === "appointment") && task.patientId && dischargedPatientIds.includes(task.patientId)) {
      return false;
    }
    // My Patients filter (additive – shows WP patient tasks alongside claimed tasks)
    if (showMyPatients && myPatientIds.length > 0) {
      if (task.type === "patient" || task.type === "appointment") {
        // Include if it's a WP patient task OR if it's claimed by the user
        const isMyPatientTask = task.patientId && myPatientIds.includes(task.patientId);
        const isClaimedByMe = task.claimedBy === user?.name;
        if (!isMyPatientTask && !isClaimedByMe) return false;
      }
    }
    return true;
  });

  // Count user's claimed tasks
  const myClaimedTasks = filteredTasks.filter((t) => t.claimedBy === user?.name);
  const pendingCount = myClaimedTasks.filter(
    (t) => t.status === "pending" || t.status === "overdue"
  ).length;
  const inProgressCount = myClaimedTasks.filter((t) => t.status === "in_progress").length;
  const completedCount = myClaimedTasks.filter((t) => t.status === "completed").length;

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <p className="text-6xl mb-4">👤</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-500 mb-4">
            Please log in to view your personal task board.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium no-underline hover:shadow-lg"
          >
            Log In
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Jobs</h1>
              <p className="diary-muted">
                {user.name} · {user.ward} Ward
              </p>
            </div>
            {/* View toggle */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
              <Link href={link("/tasks")} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors no-underline">
                Team Diary
              </Link>
              <Link href={link("/tasks?view=my-diary")} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors no-underline">
                My Diary
              </Link>
              <div className="px-4 py-2 rounded-lg bg-nhs-blue text-white font-semibold text-sm">
                My Jobs
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>📋</span>
              {pendingCount} to do
            </div>
            <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>🔄</span>
              {inProgressCount} in progress
            </div>
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>✅</span>
              {completedCount} done
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={link("/tasks")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all no-underline"
          >
            <CalendarDays className="w-5 h-5" />
            Team Diary
          </Link>

          {/* Add my patients tasks toggle */}
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

          <div className="flex items-center gap-2 ml-auto" />
        </div>

        {/* Info banner */}
        {myClaimedTasks.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">No tasks claimed yet</p>
              <p className="text-sm text-blue-600 mt-1">
                Go to the <Link href={link("/tasks")} className="underline font-medium text-blue-700">Team Diary</Link> and
                click &quot;Claim&quot; on tasks to add them to your personal board. Claimed tasks will
                appear here where you can track your progress.
              </p>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <KanbanBoard
          tasks={filteredTasks}
          currentUserName={user.name}
          onUpdateTask={handleUpdateTask}
          onTaskClick={handleTaskClick}
        />

        {/* Legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900 mb-1">📋 Today</p>
              <p className="text-gray-500">Tasks you&apos;ve claimed from the Team Diary. These are your priorities for today.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">🔄 In Progress</p>
              <p className="text-gray-500">Drag tasks here when you start working on them. The Team Diary shows &quot;{user.name} working on&quot;.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">✅ Completed</p>
              <p className="text-gray-500">Drop tasks here or click &quot;Done&quot; to mark them complete. Completed tasks will be removed when a patient is discharged.</p>
            </div>
          </div>
        </div>
      </div>

      <StaffManagementModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        ward={user.ward}
      />

      <StaffTasksModal
        isOpen={showStaffTasksModal}
        onClose={() => setShowStaffTasksModal(false)}
        tasks={tasks}
        ward={user.ward}
      />

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        currentUserName={user.name}
        onClaim={handleClaim}
        onSteal={handleSteal}
        onToggleComplete={handleToggleComplete}
        onUpdate={handleUpdateTask}
      />
    </MainLayout>
  );
}
