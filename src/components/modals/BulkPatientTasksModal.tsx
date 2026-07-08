"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Users } from "lucide-react";
import {
  DiaryTask,
  PatientTaskCategory,
  TaskPriority,
  TASK_CATEGORY_CONFIG,
  PRIORITY_CONFIG,
} from "@/lib/types";
import { getActivePatientsByWard } from "@/lib/data/tasks";
import { toLocalDateStr } from "@/lib/utils/date";
import { GuideSelect } from "@/components/ui/GuideSelect";

interface Row {
  title: string;
  category: PatientTaskCategory;
  priority: TaskPriority;
  guideId: string;
  blocksDischarge: boolean;
}

const emptyRow = (): Row => ({ title: "", category: "referral", priority: "routine", guideId: "", blocksDischarge: false });

// Bulk patient-task entry: pick one patient, then add several tasks for them in a
// table. Shared by the diary Add Task flow ("Add several") and the Patients page.
export function BulkPatientTasksModal({
  isOpen,
  onClose,
  onAdd,
  activeWard,
  currentUserName,
  initialPatientName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Partial<DiaryTask>) => void;
  activeWard: string;
  currentUserName?: string;
  initialPatientName?: string;
}) {
  const [patientName, setPatientName] = useState(initialPatientName || "");
  const [patientSearch, setPatientSearch] = useState(initialPatientName || "");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [dueDate, setDueDate] = useState(toLocalDateStr());
  const [assignTo, setAssignTo] = useState<"ward" | "myself">("ward");
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);

  const wardCap = activeWard.charAt(0).toUpperCase() + activeWard.slice(1);
  const wardPatients = getActivePatientsByWard(wardCap);

  useEffect(() => {
    if (isOpen) {
      setPatientName(initialPatientName || "");
      setPatientSearch(initialPatientName || "");
      setShowPatientDropdown(false);
      setDueDate(toLocalDateStr());
      setAssignTo("ward");
      setRows([emptyRow(), emptyRow(), emptyRow()]);
    }
  }, [isOpen, initialPatientName]);

  if (!isOpen) return null;

  const selectedPatient = wardPatients.find((p) => p.name === patientName);
  const validRows = rows.filter((r) => r.title.trim());
  const canSubmit = !!patientName && validRows.length > 0;

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, emptyRow()]);
  const removeRow = (i: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));

  const handleSubmit = () => {
    if (!canSubmit) return;
    const today = toLocalDateStr();
    const claim =
      assignTo === "myself" && currentUserName
        ? { claimedBy: currentUserName, claimedAt: today, status: "in_progress" as const }
        : { status: "pending" as const };
    validRows.forEach((r) => {
      onAdd({
        type: "patient",
        title: r.title.trim(),
        category: r.category,
        priority: r.priority,
        patientName,
        patientId: selectedPatient?.id,
        ward: selectedPatient?.ward || wardCap,
        dueDate,
        carryOver: true,
        linkedGuideId: r.guideId || undefined,
        blocksDischarge: r.blocksDischarge || undefined,
        createdAt: today,
        createdBy: currentUserName || "Current User",
        ...claim,
      });
    });
    onClose();
  };

  const n = validRows.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add several patient tasks"
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-white border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add tasks for a patient</h2>
            <p className="text-sm text-gray-500 mt-0.5">Pick a patient, then add as many tasks as you need.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <div className="relative">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setShowPatientDropdown(true);
                  if (patientName && e.target.value !== patientName) setPatientName("");
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Search patients..."
                className={`w-full p-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none ${
                  patientName ? "border-green-400 bg-green-50" : "border-gray-200"
                }`}
              />
              {patientName && (
                <button
                  type="button"
                  onClick={() => {
                    setPatientName("");
                    setPatientSearch("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showPatientDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {wardPatients
                  .filter((p) => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
                  .slice(0, 10)
                  .map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => {
                        setPatientName(patient.name);
                        setPatientSearch(patient.name);
                        setShowPatientDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-indigo-50 flex items-center justify-between ${
                        patientName === patient.name ? "bg-indigo-100" : ""
                      }`}
                    >
                      <span className="font-medium text-gray-900">{patient.name}</span>
                      <span className="text-xs text-gray-500">Room {patient.room}</span>
                    </button>
                  ))}
                {wardPatients.filter((p) => p.name.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">No patients found</div>
                )}
              </div>
            )}
            {patientName && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Selected: {patientName}
              </p>
            )}
          </div>

          {/* Shared date + assignee */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date (all tasks)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAssignTo("ward")}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                    assignTo === "ward" ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  🏥 Ward
                </button>
                <button
                  onClick={() => setAssignTo("myself")}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                    assignTo === "myself" ? "bg-purple-100 text-purple-800 ring-2 ring-purple-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  🙋 Myself
                </button>
              </div>
            </div>
          </div>

          {/* Task table */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Tasks</span>
              <span className="text-xs text-gray-400">one row per task</span>
            </div>

            {/* Column headers (desktop) */}
            <div className="hidden sm:grid grid-cols-[1fr_130px_110px_150px_52px_36px] gap-2 px-1 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Task</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Category</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Priority</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Guide (optional)</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 text-center" title="Barrier to discharge">🚧</span>
              <span />
            </div>

            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_130px_110px_150px_52px_36px] gap-2 items-center">
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => updateRow(i, { title: e.target.value })}
                    placeholder={`Task ${i + 1}, e.g. Complete capacity assessment`}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={row.category}
                    onChange={(e) => updateRow(i, { category: e.target.value as PatientTaskCategory })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    {(Object.keys(TASK_CATEGORY_CONFIG) as PatientTaskCategory[]).map((key) => (
                      <option key={key} value={key}>
                        {TASK_CATEGORY_CONFIG[key].icon} {TASK_CATEGORY_CONFIG[key].label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={row.priority}
                    onChange={(e) => updateRow(i, { priority: e.target.value as TaskPriority })}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    {(["routine", "important", "urgent"] as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                      </option>
                    ))}
                  </select>
                  <GuideSelect
                    value={row.guideId}
                    onChange={(id) => updateRow(i, { guideId: id })}
                    suggestFrom={row.title}
                    placeholder="Link guide..."
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateRow(i, { blocksDischarge: !row.blocksDischarge })}
                    aria-pressed={row.blocksDischarge}
                    aria-label={`Barrier to discharge for task ${i + 1}`}
                    title="Barrier to discharge"
                    className={`justify-self-center sm:justify-self-stretch p-2.5 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                      row.blocksDischarge
                        ? "bg-amber-50 border-amber-400 text-amber-800"
                        : "border-gray-200 text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sm:hidden">🚧 Barrier to discharge</span>
                    <span className="hidden sm:inline">{row.blocksDischarge ? "🚧" : "○"}</span>
                  </button>
                  <button
                    onClick={() => removeRow(i)}
                    disabled={rows.length <= 1}
                    aria-label={`Remove task ${i + 1}`}
                    className="justify-self-center p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addRow}
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add another row
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-4 sticky bottom-0 bg-white border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 p-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {!patientName ? "Pick a patient" : n === 0 ? "Add a task" : n === 1 ? "Add 1 Task" : `Add ${n} Tasks`}
          </button>
        </div>
      </div>
    </div>
  );
}
