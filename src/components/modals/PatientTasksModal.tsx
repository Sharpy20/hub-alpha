"use client";

import { Modal } from "@/components/ui";
import { DiaryTask, Patient } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  BookOpen,
  User as UserIcon,
} from "lucide-react";

interface PatientTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  tasks: DiaryTask[];
  onTaskClick?: (task: DiaryTask) => void;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-100", icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-100", icon: Clock },
  completed: { label: "Completed", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "text-red-700", bgColor: "bg-red-100", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "text-gray-500", bgColor: "bg-gray-100", icon: Clock },
};

export function PatientTasksModal({ isOpen, onClose, patient, tasks, onTaskClick }: PatientTasksModalProps) {
  if (!patient) return null;

  // Separate tasks by type
  const patientTasks = tasks.filter((t) => t.type === "patient");
  const appointments = tasks.filter((t) => t.type === "appointment");

  // Sort: overdue first, then pending/in_progress, then completed
  const sortTasks = (a: DiaryTask, b: DiaryTask) => {
    const statusOrder = { overdue: 0, pending: 1, in_progress: 2, completed: 3, cancelled: 4 };
    return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
  };

  const sortedTasks = [...patientTasks].sort(sortTasks);
  const sortedAppointments = [...appointments].sort(sortTasks);

  const overdueCount = tasks.filter((t) => t.status === "overdue").length;
  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tasks for ${patient.name}`}>
      <div className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
            <p className="text-xs text-red-600 font-medium">Overdue</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            <p className="text-xs text-amber-600 font-medium">Pending</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{completedCount}</p>
            <p className="text-xs text-green-600 font-medium">Completed</p>
          </div>
        </div>

        {/* Patient info */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Room:</span>{" "}
              <span className="font-medium text-gray-900">{patient.room} {patient.bed && `(${patient.bed})`}</span>
            </div>
            <div>
              <span className="text-gray-500">Named Nurse:</span>{" "}
              <span className="font-medium text-gray-900">{patient.namedNurse || "—"}</span>
            </div>
          </div>
        </div>

        {/* Tasks list */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Patient Tasks */}
          {sortedTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Tasks ({sortedTasks.length})
              </h3>
              <div className="space-y-2">
                {sortedTasks.map((task) => {
                  const statusConfig = STATUS_CONFIG[task.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick?.(task)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        task.status === "overdue"
                          ? "border-red-200 bg-red-50 hover:border-red-300"
                          : task.status === "completed"
                          ? "border-green-200 bg-green-50 hover:border-green-300"
                          : "border-gray-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{task.title}</p>
                          {task.type === "patient" && task.category && (
                            <p className="text-xs text-gray-500 capitalize mt-0.5">
                              {task.category.replace(/_/g, " ")}
                            </p>
                          )}
                        </div>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate || task.createdAt).toLocaleDateString("en-GB")}
                        </span>
                        {task.claimedBy && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {task.claimedBy}
                          </span>
                        )}
                        {task.type === "patient" && task.linkedReferralId && (
                          <span className="flex items-center gap-1 text-indigo-600">
                            <FileText className="w-3 h-3" />
                            Linked referral
                          </span>
                        )}
                        {task.type === "patient" && task.linkedGuideId && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <BookOpen className="w-3 h-3" />
                            Linked guide
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Appointments */}
          {sortedAppointments.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Appointments ({sortedAppointments.length})
              </h3>
              <div className="space-y-2">
                {sortedAppointments.map((appt) => {
                  const statusConfig = STATUS_CONFIG[appt.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div
                      key={appt.id}
                      onClick={() => onTaskClick?.(appt)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        appt.status === "completed"
                          ? "border-green-200 bg-green-50 hover:border-green-300"
                          : "border-blue-200 bg-blue-50 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{appt.title}</p>
                          {appt.type === "appointment" && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {appt.location && `${appt.location} • `}
                              {appt.appointmentTime}
                            </p>
                          )}
                        </div>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {appt.type === "appointment" && new Date(appt.appointmentDate).toLocaleDateString("en-GB")}
                        </span>
                        {appt.type === "appointment" && appt.attendees && appt.attendees.length > 0 && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {appt.attendees.slice(0, 2).join(", ")}
                            {appt.attendees.length > 2 && ` +${appt.attendees.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No tasks */}
          {tasks.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">No tasks or appointments for this patient</p>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
