"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, Check, AlertTriangle, Hand, User } from "lucide-react";
import { Patient, DiaryTask } from "@/lib/types";
import { WARDS } from "@/lib/data/staff";
import { toasts } from "@/lib/utils/toast";

// Task action types for transfer
type TaskAction = "move" | "leave" | "unclaim" | "claim";

interface TaskTransferOption {
  taskId: string;
  action: TaskAction;
}

interface PatientTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  patientTasks: DiaryTask[];
  currentUserName?: string;
  onTransfer: (patientId: string, newWard: string, transferTasks: boolean, taskOptions?: TaskTransferOption[]) => void;
}

export function PatientTransferModal({
  isOpen,
  onClose,
  patient,
  patientTasks,
  currentUserName = "Current User",
  onTransfer,
}: PatientTransferModalProps) {
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);
  const [taskOptions, setTaskOptions] = useState<Record<string, TaskAction>>({});

  const incompleteTasks = patientTasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  );

  // Initialize task options when tasks change
  useEffect(() => {
    if (incompleteTasks.length > 0) {
      const initialOptions: Record<string, TaskAction> = {};
      incompleteTasks.forEach((task) => {
        initialOptions[task.id] = "move"; // Default to move all tasks
      });
      setTaskOptions(initialOptions);
    }
  }, [patientTasks]);

  if (!isOpen || !patient) return null;

  const availableWards = WARDS.filter((w) => w !== patient.ward);

  const handleTaskOptionChange = (taskId: string, action: TaskAction) => {
    setTaskOptions((prev) => ({ ...prev, [taskId]: action }));
  };

  const handleTransfer = () => {
    if (selectedWard && confirmed) {
      const taskOptionsArray = Object.entries(taskOptions).map(([taskId, action]) => ({
        taskId,
        action,
      }));
      // Check if any tasks should be moved
      const anyTasksToMove = taskOptionsArray.some((opt) => opt.action === "move");
      onTransfer(patient.id, selectedWard, anyTasksToMove, taskOptionsArray);
      toasts.patientTransferred(patient.name, selectedWard);
      // Reset state
      setSelectedWard("");
      setTaskOptions({});
      setConfirmed(false);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedWard("");
    setTaskOptions({});
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowRight className="w-8 h-8" />
              <div>
                <h2 className="text-lg font-bold">Transfer Patient</h2>
                <p className="text-sm text-white/80">{patient.name}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Ward */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Current Ward
            </label>
            <p className="text-lg font-bold text-gray-900 mt-1 flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              {patient.ward} Ward
            </p>
          </div>

          {/* Select Destination */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Transfer To
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableWards.map((ward) => (
                <button
                  key={ward}
                  onClick={() => setSelectedWard(ward)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    selectedWard === ward
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <span className="text-xl">🏥</span>
                  <span className="font-medium">{ward}</span>
                  {selectedWard === ward && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Section */}
          {incompleteTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <p className="font-medium text-gray-900">
                  {incompleteTasks.length} outstanding task{incompleteTasks.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {task.title}
                        </p>
                        {task.claimedBy && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Hand className="w-3 h-3" />
                            Claimed by {task.claimedBy}
                          </p>
                        )}
                      </div>
                      {task.status === "overdue" && (
                        <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded font-medium">
                          Overdue
                        </span>
                      )}
                    </div>

                    {/* Task transfer options */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleTaskOptionChange(task.id, "move")}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          taskOptions[task.id] === "move"
                            ? "bg-amber-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        Move to new ward
                      </button>
                      <button
                        onClick={() => handleTaskOptionChange(task.id, "leave")}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          taskOptions[task.id] === "leave"
                            ? "bg-gray-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        Leave on old ward
                      </button>
                      {task.claimedBy && (
                        <button
                          onClick={() => handleTaskOptionChange(task.id, "unclaim")}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            taskOptions[task.id] === "unclaim"
                              ? "bg-purple-500 text-white"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          Unclaim
                        </button>
                      )}
                      {task.claimedBy !== currentUserName && (
                        <button
                          onClick={() => handleTaskOptionChange(task.id, "claim")}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            taskOptions[task.id] === "claim"
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          Claim for me
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick action buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    const newOptions: Record<string, TaskAction> = {};
                    incompleteTasks.forEach((t) => (newOptions[t.id] = "move"));
                    setTaskOptions(newOptions);
                  }}
                  className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                >
                  Move all
                </button>
                <button
                  onClick={() => {
                    const newOptions: Record<string, TaskAction> = {};
                    incompleteTasks.forEach((t) => (newOptions[t.id] = "leave"));
                    setTaskOptions(newOptions);
                  }}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  Leave all
                </button>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {selectedWard && (
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="font-medium text-gray-900">
                  Confirm transfer to {selectedWard} Ward
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {incompleteTasks.length > 0 ? (
                    <>
                      {patient.name} will be transferred.{" "}
                      {Object.values(taskOptions).filter((a) => a === "move").length} task
                      {Object.values(taskOptions).filter((a) => a === "move").length !== 1 ? "s" : ""} will move,{" "}
                      {Object.values(taskOptions).filter((a) => a === "leave").length} will stay.
                    </>
                  ) : (
                    `${patient.name} will be transferred.`
                  )}
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedWard || !confirmed}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              selectedWard && confirmed
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            Transfer Patient
          </button>
        </div>
      </div>
    </div>
  );
}
