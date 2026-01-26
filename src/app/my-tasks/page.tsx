"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import Link from "next/link";
import { Users, UserSquare2, ClipboardList, CalendarDays, Info } from "lucide-react";
import { DiaryTask } from "@/lib/types";
import { KanbanBoard } from "@/components/kanban";
import {
  StaffManagementModal,
  PatientNamesModal,
  StaffTasksModal,
  TaskDetailModal,
} from "@/components/modals";

export default function MyTasksPage() {
  const { user, hasFeature } = useApp();
  const { tasks, updateTask, claimTask, toggleComplete } = useTasks();

  // Management modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showStaffTasksModal, setShowStaffTasksModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DiaryTask | null>(null);

  const hasTaskFeature = hasFeature("ward_tasks");

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

  // Handle task click to open detail modal
  const handleTaskClick = (task: DiaryTask) => {
    setSelectedTask(task);
  };

  // Count user's claimed tasks
  const myClaimedTasks = tasks.filter((t) => t.claimedBy === user?.name);
  const pendingCount = myClaimedTasks.filter(
    (t) => t.status === "pending" || t.status === "overdue"
  ).length;
  const inProgressCount = myClaimedTasks.filter((t) => t.status === "in_progress").length;
  const completedCount = myClaimedTasks.filter((t) => t.status === "completed").length;

  if (!hasTaskFeature) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <p className="text-6xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Tasks</h1>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600">
              {user.name} · {user.ward} Ward
            </p>
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
            href="/tasks"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all no-underline"
          >
            <CalendarDays className="w-5 h-5" />
            Ward Diary
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowStaffModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              title="Manage Staff Names"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Staff</span>
            </button>

            <button
              onClick={() => setShowPatientModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              title="Manage Patient Names"
            >
              <UserSquare2 className="w-5 h-5" />
              <span className="hidden sm:inline">Patients</span>
            </button>

            <button
              onClick={() => setShowStaffTasksModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              title="View Staff Tasks"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="hidden sm:inline">Staff Tasks</span>
            </button>
          </div>
        </div>

        {/* SystemOne tip banner */}
        <div className="overflow-hidden bg-red-50 border border-red-200 rounded-xl">
          <div className="animate-marquee whitespace-nowrap py-2 text-red-600 font-medium text-sm">
            <span className="mx-8">💡 Tip: Sync with SystemOne tasks only available in Max+ version of app</span>
            <span className="mx-8">💡 Tip: Sync with SystemOne tasks only available in Max+ version of app</span>
            <span className="mx-8">💡 Tip: Sync with SystemOne tasks only available in Max+ version of app</span>
          </div>
        </div>

        {/* Info banner */}
        {myClaimedTasks.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">No tasks claimed yet</p>
              <p className="text-sm text-blue-600 mt-1">
                Go to the <Link href="/tasks" className="underline font-medium">Ward Diary</Link> and
                click &quot;Claim&quot; on tasks to add them to your personal board. Claimed tasks will
                appear here where you can track your progress.
              </p>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <KanbanBoard
          tasks={tasks}
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
              <p className="text-gray-500">Tasks you&apos;ve claimed from the Ward Diary. These are your priorities for today.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">🔄 In Progress</p>
              <p className="text-gray-500">Drag tasks here when you start working on them. The Ward Diary shows &quot;{user.name} working on&quot;.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">✅ Completed</p>
              <p className="text-gray-500">Drop tasks here or click &quot;Done&quot; to mark them complete.</p>
            </div>
          </div>
        </div>
      </div>

      <StaffManagementModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        ward={user.ward}
      />

      <PatientNamesModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
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
