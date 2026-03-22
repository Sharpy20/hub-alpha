"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import Link from "next/link";
import { Users, ClipboardList, CalendarDays, Info, UserSquare2, Filter } from "lucide-react";
import { DiaryTask } from "@/lib/types";
import { KanbanBoard } from "@/components/kanban";
import {
  StaffManagementModal,
  StaffTasksModal,
  TaskDetailModal,
} from "@/components/modals";
import { DEMO_PATIENTS } from "@/lib/data/tasks";
import { getStaffByWard } from "@/lib/data/staff";

export default function MyTasksPage() {
  const { user, hasFeature, activeWard } = useApp();
  const { tasks, updateTask, claimTask, toggleComplete } = useTasks();

  // Management modal states
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showStaffTasksModal, setShowStaffTasksModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DiaryTask | null>(null);

  // My Patients toggle
  const [showMyPatients, setShowMyPatients] = useState(false);

  // Lead/Manager staff filter
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string[]>([]);
  const [showStaffFilterDropdown, setShowStaffFilterDropdown] = useState(false);

  // Check if user is lead or manager
  const isLeadOrManager = user?.role === "lead" || user?.role === "manager";

  // Get patients where current user is ward professional
  const myPatientIds = showMyPatients && user
    ? DEMO_PATIENTS
        .filter(p => p.wardProfessional === user.name && p.ward === activeWard)
        .map(p => p.id)
    : [];

  // Get staff for filter
  const wardStaffList = isLeadOrManager ? getStaffByWard(activeWard) : [];

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

  // Apply My Patients and staff filters
  const filteredTasks = tasks.filter((task) => {
    // My Patients filter
    if (showMyPatients && myPatientIds.length > 0) {
      if (task.type === "patient" || task.type === "appointment") {
        if (!task.patientId || !myPatientIds.includes(task.patientId)) return false;
      }
    }
    // Staff filter (Lead/Manager)
    if (selectedStaffFilter.length > 0) {
      if (task.claimedBy && !selectedStaffFilter.includes(task.claimedBy)) return false;
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
        {/* View toggle: Ward Diary / My Tasks */}
        <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 w-fit">
          <Link href="/tasks" className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-colors no-underline">
            Ward Diary
          </Link>
          <div className="px-4 py-2 rounded-lg bg-nhs-blue text-white font-semibold text-sm">
            My Tasks
          </div>
        </div>

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

          {/* My Patients toggle */}
          <button
            onClick={() => setShowMyPatients(!showMyPatients)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
              showMyPatients
                ? "bg-teal-100 text-teal-800 ring-2 ring-teal-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title="Filter to patients where you are the ward professional"
          >
            <UserSquare2 className="w-5 h-5" />
            <span className="hidden sm:inline">My Patients</span>
          </button>

          {/* Lead/Manager staff filter */}
          {isLeadOrManager && (
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
                  {selectedStaffFilter.length > 0 ? `Staff (${selectedStaffFilter.length})` : "Staff Filter"}
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
            <button
              onClick={() => setShowStaffModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              title="Manage Staff Names"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Staff</span>
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
