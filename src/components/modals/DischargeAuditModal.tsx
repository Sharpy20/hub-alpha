"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Send,
  Download,
  AlertTriangle,
  Clipboard,
} from "lucide-react";
import { Patient, DiaryTask, TASK_CATEGORY_CONFIG, SHIFT_CONFIG } from "@/lib/types";
import { toasts } from "@/lib/utils/toast";

interface DischargeAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  patientTasks: DiaryTask[];
  isWardAdmin: boolean;
  isMaxPlus: boolean;
  onConfirmDischarge: (patientId: string) => void;
}

export function DischargeAuditModal({
  isOpen,
  onClose,
  patient,
  patientTasks,
  isWardAdmin,
  isMaxPlus,
  onConfirmDischarge,
}: DischargeAuditModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showS1Prompt, setShowS1Prompt] = useState(false);
  const [s1Uploaded, setS1Uploaded] = useState(false);

  const handleS1Complete = () => {
    setShowS1Prompt(false);
    setS1Uploaded(false);
    onClose();
  };

  // Early returns BEFORE any conditional renders that need data
  if (!isOpen || !patient) return null;

  // Group tasks by status (needed for generateAuditText)
  const completedTasks = patientTasks.filter((t) => t.status === "completed");
  const incompleteTasks = patientTasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  );
  const cancelledTasks = patientTasks.filter((t) => t.status === "cancelled");

  const generateAuditText = () => {
    const lines: string[] = [];
    lines.push(`DISCHARGE AUDIT LOG - ${patient.name}`);
    lines.push(`Ward: ${patient.ward}`);
    lines.push(`Admission Date: ${patient.admissionDate}`);
    lines.push(`Discharge Date: ${patient.dischargeDate || "Not recorded"}`);
    lines.push("");
    lines.push("=== COMPLETED TASKS ===");
    completedTasks.forEach((task) => {
      lines.push(
        `[DONE] ${task.title} - Completed by ${task.completedBy || "Unknown"} on ${task.completedAt || "Unknown date"}`
      );
    });
    if (completedTasks.length === 0) {
      lines.push("No completed tasks recorded.");
    }
    lines.push("");
    if (incompleteTasks.length > 0) {
      lines.push("=== INCOMPLETE TASKS ===");
      incompleteTasks.forEach((task) => {
        lines.push(`[PENDING] ${task.title}`);
      });
      lines.push("");
    }
    lines.push(`Generated: ${new Date().toLocaleString("en-GB")}`);
    return lines.join("\n");
  };

  // SystemOne upload prompt after discharge confirmation
  if (showS1Prompt) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={handleS1Complete}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Upload to SystemOne</h2>
                <p className="text-sm text-white/80">Discharge confirmed</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Discharge confirmed for {patient.name}</p>
                <p className="text-sm text-green-700 mt-1">
                  The audit log has been generated and is ready for upload.
                </p>
              </div>
            </div>

            <div className="text-center py-2">
              <p className="text-gray-700 font-medium mb-2">
                Upload audit log to SystemOne attachments?
              </p>
              <p className="text-sm text-gray-500">
                This will add the discharge summary to the patient&apos;s electronic record.
              </p>
            </div>

            {/* Download reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="text-amber-800">
                <strong>Tip:</strong> Download a copy of the audit log before uploading for your records.
              </p>
            </div>

            {/* Upload checkbox */}
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={s1Uploaded}
                onChange={(e) => setS1Uploaded(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">
                I have uploaded the audit log to SystemOne
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const blob = new Blob([generateAuditText()], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `discharge-audit-${patient.name.replace(/\s+/g, "-")}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Audit Log
              </button>
              <button
                onClick={() => {
                  window.open("https://systmone.tpp-uk.com", "_blank");
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Open SystemOne
              </button>
            </div>
            <button
              onClick={handleS1Complete}
              disabled={!s1Uploaded}
              className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                s1Uploaded
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {s1Uploaded ? "Complete" : "Confirm upload to continue"}
            </button>
            <button
              onClick={handleS1Complete}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    if (confirmed) {
      onConfirmDischarge(patient.id);
      toasts.dischargeConfirmed(patient.name);
      setConfirmed(false);
      // Show S1 upload prompt instead of closing
      if (isMaxPlus) {
        setShowS1Prompt(true);
      } else {
        onClose();
      }
    }
  };

  const copyAuditLog = async () => {
    const text = generateAuditText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toasts.copiedToClipboard();
    setTimeout(() => setCopied(false), 2000);
  };

  const getTaskIcon = (task: DiaryTask) => {
    if (task.type === "ward") {
      return SHIFT_CONFIG[task.shift].icon;
    } else if (task.type === "patient") {
      return TASK_CATEGORY_CONFIG[task.category].icon;
    } else {
      return "📅";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div>
                <h2 className="text-lg font-bold">Discharge Audit Log</h2>
                <p className="text-sm text-white/80">{patient.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Patient Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Ward:</span>
                <span className="ml-2 font-medium">{patient.ward}</span>
              </div>
              <div>
                <span className="text-gray-500">Room:</span>
                <span className="ml-2 font-medium">
                  {patient.room}
                  {patient.bed && ` (${patient.bed})`}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Admitted:</span>
                <span className="ml-2 font-medium">
                  {new Date(patient.admissionDate).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Discharged:</span>
                <span className="ml-2 font-medium">
                  {patient.dischargeDate
                    ? new Date(patient.dischargeDate).toLocaleDateString("en-GB")
                    : "Not recorded"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Named Nurse:</span>
                <span className="ml-2 font-medium">
                  {patient.namedNurse || "Not assigned"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Consultant:</span>
                <span className="ml-2 font-medium">
                  {patient.consultant || "Not assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Task counts summary */}
          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                {completedTasks.length}
              </p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
            <div className="flex-1 bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">
                {incompleteTasks.length}
              </p>
              <p className="text-sm text-amber-600">Incomplete</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-500">
                {cancelledTasks.length}
              </p>
              <p className="text-sm text-gray-400">Cancelled</p>
            </div>
          </div>

          {/* Warning if incomplete tasks */}
          {incompleteTasks.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">
                  Incomplete tasks detected
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  There are {incompleteTasks.length} task
                  {incompleteTasks.length !== 1 ? "s" : ""} that were not
                  completed before discharge. Review before confirming.
                </p>
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Completed Tasks ({completedTasks.length})
            </h3>
            {completedTasks.length === 0 ? (
              <p className="text-gray-400 text-sm italic">
                No completed tasks recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-green-50 border border-green-100 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getTaskIcon(task)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.completedBy || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.completedAt || "Unknown date"}
                          </span>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incomplete Tasks */}
          {incompleteTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Incomplete Tasks ({incompleteTasks.length})
              </h3>
              <div className="space-y-2">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-amber-50 border border-amber-100 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getTaskIcon(task)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        {task.claimedBy && (
                          <p className="text-sm text-gray-600 mt-1">
                            Claimed by {task.claimedBy}
                          </p>
                        )}
                      </div>
                      <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Tasks */}
          {cancelledTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-400" />
                Cancelled Tasks ({cancelledTasks.length})
              </h3>
              <div className="space-y-2">
                {cancelledTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 border border-gray-100 rounded-lg p-3 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getTaskIcon(task)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-500 line-through">
                          {task.title}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation checkbox (for ward admin) */}
          {isWardAdmin && !patient.dischargeConfirmed && (
            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <p className="font-medium text-gray-900">
                  I confirm that I have reviewed all tasks and the patient is
                  ready for full discharge
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  This will mark the discharge as confirmed and remove the
                  patient from the pending list.
                </p>
              </div>
            </label>
          )}

          {/* Already confirmed message */}
          {patient.dischargeConfirmed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Discharge confirmed</p>
                <p className="text-sm text-green-700 mt-1">
                  Confirmed by {patient.dischargeConfirmedBy || "Admin"} on{" "}
                  {patient.dischargeConfirmedAt
                    ? new Date(patient.dischargeConfirmedAt).toLocaleDateString("en-GB")
                    : "Unknown date"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={copyAuditLog}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" />
                  Copy Audit Log
                </>
              )}
            </button>
            <button
              onClick={() => {
                const blob = new Blob([generateAuditText()], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `discharge-audit-${patient.name.replace(/\s+/g, "-")}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* Max+ only: Send to SystemOne */}
          {isMaxPlus && (
            <button
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={() => alert("SystemOne integration coming in Max+ version")}
            >
              <Send className="w-4 h-4" />
              Send to SystemOne Attachments
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            {isWardAdmin && !patient.dischargeConfirmed && (
              <button
                onClick={handleConfirm}
                disabled={!confirmed}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  confirmed
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Discharge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
