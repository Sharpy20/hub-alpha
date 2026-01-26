"use client";

import { useState, useMemo } from "react";
import { X, Clock, AlertTriangle, Play } from "lucide-react";
import { DiaryTask, PRIORITY_CONFIG, TASK_CATEGORY_CONFIG, SHIFT_CONFIG } from "@/lib/types";
import { DEMO_STAFF } from "@/lib/data/staff";

interface StaffTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DiaryTask[];
  ward: string;
}

export function StaffTasksModal({ isOpen, onClose, tasks, ward }: StaffTasksModalProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>("");

  const staffList = useMemo(() =>
    DEMO_STAFF.filter((s) => s.ward === ward && s.isActive),
    [ward]
  );

  // Get tasks claimed by selected staff member
  const staffTasks = useMemo(() => {
    if (!selectedStaff) return [];
    return tasks.filter(
      (t) => t.claimedBy === selectedStaff && t.status !== "completed" && t.status !== "cancelled"
    );
  }, [tasks, selectedStaff]);

  // Group by status
  const overdueTasks = staffTasks.filter((t) => t.status === "overdue");
  const inProgressTasks = staffTasks.filter((t) => t.status === "in_progress");
  const pendingTasks = staffTasks.filter((t) => t.status === "pending");

  if (!isOpen) return null;

  const getTaskIcon = (task: DiaryTask) => {
    if (task.type === "ward") {
      return SHIFT_CONFIG[task.shift].icon;
    } else if (task.type === "patient") {
      return TASK_CATEGORY_CONFIG[task.category].icon;
    }
    return "📅";
  };

  const renderTaskList = (taskList: DiaryTask[], title: string, icon: React.ReactNode, bgColor: string) => {
    if (taskList.length === 0) return null;

    return (
      <div className="mb-4">
        <div className={`flex items-center gap-2 px-2 py-1 ${bgColor} rounded-t-lg`}>
          {icon}
          <span className="font-semibold text-sm">{title}</span>
          <span className="ml-auto text-xs bg-white/50 px-1.5 py-0.5 rounded">{taskList.length}</span>
        </div>
        <div className="border-x border-b border-gray-200 rounded-b-lg divide-y divide-gray-100">
          {taskList.map((task) => (
            <div key={task.id} className="p-2 flex items-center gap-2">
              <span>{getTaskIcon(task)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{task.title}</p>
                {task.type === "patient" && task.patientName && (
                  <p className="text-xs text-gray-500">{task.patientName}</p>
                )}
              </div>
              <span title={PRIORITY_CONFIG[task.priority].label}>
                {PRIORITY_CONFIG[task.priority].icon}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📋</span> View Staff Tasks
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Staff selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff Member</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none"
            >
              <option value="">-- Select Staff --</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tasks display */}
          {selectedStaff ? (
            <div className="max-h-80 overflow-y-auto">
              {staffTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">✨</p>
                  <p className="text-sm">No outstanding tasks for {selectedStaff}</p>
                </div>
              ) : (
                <>
                  {renderTaskList(
                    overdueTasks,
                    "Overdue",
                    <AlertTriangle className="w-4 h-4 text-red-700" />,
                    "bg-red-100 text-red-800"
                  )}
                  {renderTaskList(
                    inProgressTasks,
                    "In Progress",
                    <Play className="w-4 h-4 text-blue-700" />,
                    "bg-blue-100 text-blue-800"
                  )}
                  {renderTaskList(
                    pendingTasks,
                    "Pending",
                    <Clock className="w-4 h-4 text-amber-700" />,
                    "bg-amber-100 text-amber-800"
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm">Select a staff member to view their tasks</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
