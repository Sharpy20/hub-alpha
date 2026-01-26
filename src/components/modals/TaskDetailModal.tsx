"use client";

import { useState, useEffect } from "react";
import { X, Hand, Check, Clock, AlertTriangle, Calendar, User, FileText, Link as LinkIcon, Save } from "lucide-react";
import { DiaryTask, SHIFT_CONFIG, TASK_CATEGORY_CONFIG, PRIORITY_CONFIG } from "@/lib/types";
import Link from "next/link";
import { toasts, showInfo } from "@/lib/utils/toast";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DiaryTask | null;
  currentUserName: string;
  onClaim: (taskId: string) => void;
  onSteal: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<DiaryTask>) => void;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  currentUserName,
  onClaim,
  onSteal,
  onToggleComplete,
  onUpdate,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedPriority, setEditedPriority] = useState<"routine" | "important" | "urgent">("routine");
  const [editedDate, setEditedDate] = useState("");
  const [editedTime, setEditedTime] = useState("");
  const [editedPatientName, setEditedPatientName] = useState("");

  // Reset edit state when task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || "");
      setEditedPriority(task.priority);
      // Set date based on task type
      if (task.type === "appointment") {
        setEditedDate(task.appointmentDate);
        setEditedTime(task.appointmentTime || "");
      } else {
        setEditedDate(task.dueDate);
        setEditedTime("");
      }
      // Set patient name
      setEditedPatientName((task.type === "patient" || task.type === "appointment") ? (task.patientName || "") : "");
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";
  const isInProgress = task.status === "in_progress";
  const isClaimed = !!task.claimedBy;
  const isClaimedByMe = task.claimedBy === currentUserName;

  let gradient = "from-gray-400 to-gray-600";
  let icon = "📌";
  let typeLabel = "Task";

  if (task.type === "ward") {
    const shiftConfig = SHIFT_CONFIG[task.shift];
    gradient = shiftConfig.gradient;
    icon = shiftConfig.icon;
    typeLabel = `${shiftConfig.label} Shift Task`;
  } else if (task.type === "patient") {
    const catConfig = TASK_CATEGORY_CONFIG[task.category];
    gradient = catConfig.gradient;
    icon = catConfig.icon;
    typeLabel = catConfig.label;
  } else if (task.type === "appointment") {
    gradient = "from-blue-500 to-blue-700";
    icon = "📅";
    typeLabel = "Appointment";
  }

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const handleSave = () => {
    if (editedTitle.trim() && task) {
      const updates: Partial<DiaryTask> = {
        title: editedTitle.trim(),
        description: editedDescription.trim() || undefined,
        priority: editedPriority,
      };

      // Add date/time updates based on task type
      if (task.type === "appointment") {
        if (editedDate) {
          (updates as Partial<typeof task>).appointmentDate = editedDate;
        }
        if (editedTime) {
          (updates as Partial<typeof task>).appointmentTime = editedTime;
        }
      } else {
        if (editedDate) {
          (updates as Partial<typeof task>).dueDate = editedDate;
        }
      }

      // Add patient name updates
      if (task.type === "patient" || task.type === "appointment") {
        (updates as Partial<typeof task>).patientName = editedPatientName.trim() || undefined;
      }

      onUpdate(task.id, updates);
      toasts.taskSaved();
      setIsEditing(false);
    }
  };

  const handleClaim = () => {
    if (isClaimedByMe) {
      onClaim(task.id);
      toasts.taskUnclaimed();
    } else {
      onClaim(task.id);
      toasts.taskClaimed(task.title);
    }
  };

  const handleSteal = () => {
    onSteal(task.id);
    toasts.taskStolen(task.title);
  };

  const handleToggleComplete = () => {
    onToggleComplete(task.id);
    if (!isCompleted) {
      toasts.taskCompleted();
    } else {
      showInfo("Task reopened");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="text-sm text-white/80">{typeLabel}</p>
                <p className="text-xs text-white/60">{task.ward} Ward</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOverdue && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
              )}
              <span className="text-2xl" title={priorityConfig.label}>{priorityConfig.icon}</span>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</label>
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className={`text-xl font-bold text-gray-900 mt-1 ${isCompleted ? "line-through text-gray-500" : ""}`}>
                {task.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-600 mt-1">{task.description || "No description"}</p>
            )}
          </div>

          {/* Priority (editable) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</label>
            {isEditing ? (
              <div className="flex gap-2 mt-1">
                {(["routine", "important", "urgent"] as const).map((p) => {
                  const config = PRIORITY_CONFIG[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setEditedPriority(p)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                        editedPriority === p
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span>{priorityConfig.icon}</span>
                <span className="text-gray-900 font-medium">{priorityConfig.label}</span>
              </div>
            )}
          </div>

          {/* Patient Name (if applicable) */}
          {(task.type === "patient" || task.type === "appointment") && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPatientName}
                  onChange={(e) => setEditedPatientName(e.target.value)}
                  placeholder="Enter patient name..."
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-900 mt-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {task.patientName || "No patient specified"}
                </p>
              )}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {task.type === "appointment" ? "Appointment Date & Time" : "Due Date"}
            </label>
            {isEditing ? (
              <div className="flex gap-2 mt-1">
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {task.type === "appointment" && (
                  <input
                    type="text"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                    placeholder="e.g., 14:00 or AM"
                    className="w-28 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
              </div>
            ) : (
              <p className="text-gray-900 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(task.type === "appointment" ? task.appointmentDate : task.dueDate)}
                {task.type === "appointment" && task.appointmentTime && (
                  <span className="ml-2 text-gray-500">at {task.appointmentTime}</span>
                )}
              </p>
            )}
          </div>

          {/* Appointment Details */}
          {task.type === "appointment" && task.location && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
              <p className="text-gray-900 mt-1">{task.location}</p>
            </div>
          )}
          {task.type === "appointment" && task.attendees && task.attendees.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendees</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.attendees.map((attendee, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded">
                    {attendee}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Claimed Status */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Check className="w-4 h-4" /> Completed
                  </span>
                ) : isInProgress ? (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" /> In Progress
                  </span>
                ) : isOverdue ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Overdue
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Pending
                  </span>
                )}
              </div>
              {isClaimed && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Hand className="w-4 h-4" />
                  {isClaimedByMe ? "Claimed by you" : `Claimed by ${task.claimedBy}`}
                  {task.claimedAt && <span className="text-gray-400">on {task.claimedAt}</span>}
                </p>
              )}
              {isCompleted && task.completedBy && (
                <p className="text-sm text-gray-600">
                  Completed by {task.completedBy}
                  {task.completedAt && <span className="text-gray-400"> on {task.completedAt}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Linked Resources */}
          {(task.type === "patient" && (task.linkedReferralId || task.linkedGuideId)) && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked Resources</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {task.linkedReferralId && (
                  <Link
                    href={`/referrals/${task.linkedReferralId}`}
                    className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors no-underline"
                  >
                    <LinkIcon className="w-3 h-3" />
                    View Referral Guide
                  </Link>
                )}
                {task.linkedGuideId && (
                  <Link
                    href={`/how-to/${task.linkedGuideId}`}
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors no-underline"
                  >
                    <FileText className="w-3 h-3" />
                    View How-To Guide
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Created Info */}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Created by {task.createdBy} on {task.createdAt}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              {/* Edit button */}
              {!isCompleted && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Edit
                </button>
              )}

              {/* Claim/Unclaim/Steal buttons */}
              {!isCompleted && !isClaimed && (
                <button
                  onClick={handleClaim}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors flex items-center gap-2"
                >
                  <Hand className="w-4 h-4" />
                  Claim Task
                </button>
              )}
              {!isCompleted && isClaimedByMe && (
                <button
                  onClick={handleClaim}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Hand className="w-4 h-4" />
                  Unclaim
                </button>
              )}
              {!isCompleted && isClaimed && !isClaimedByMe && (
                <button
                  onClick={handleSteal}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  <Hand className="w-4 h-4" />
                  Steal Task
                </button>
              )}

              {/* Complete/Reopen button */}
              <button
                onClick={handleToggleComplete}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isCompleted
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                }`}
              >
                <Check className="w-4 h-4" />
                {isCompleted ? "Reopen Task" : "Mark Complete"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
