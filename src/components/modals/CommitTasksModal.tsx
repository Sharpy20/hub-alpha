"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Check, CalendarDays, UserPlus, AlertCircle } from "lucide-react";
import {
  DiaryTask,
  Patient,
  TASK_CATEGORY_CONFIG,
} from "@/lib/types";
import type { CommitTask } from "@/lib/data/guides/howto-guides";
import { getActivePatientsByWard } from "@/lib/data/tasks";
import { toLocalDateStr } from "@/lib/utils/date";

// Commit a guide step's task list to the ward diary in one go.
//
// The pathway guides set out a sequence of jobs with the days attached, and
// re-typing that into the diary one job at a time is the reason it does not get
// done. This turns the step into a tick sheet: confirm who it is for, choose
// whether the ward or you picks it up, untick anything that does not apply, and
// commit the rest.
//
// Dates are counted from the patient's admission where there is one, because
// that is what the pathway counts from. Every date stays editable per row, and
// anything already in the diary is shown as such rather than added twice.

interface Row extends CommitTask {
  checked: boolean;
  date: string;
  already: boolean;
}

// Day 1 of the pathway is the day of admission, so day N is admission + (N-1).
const dateForDay = (basis: string, day?: number): string => {
  if (!day) return toLocalDateStr();
  const d = new Date(basis + "T12:00:00");
  if (isNaN(d.getTime())) return toLocalDateStr();
  d.setDate(d.getDate() + (day - 1));
  return toLocalDateStr(d);
};

const shortDate = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export function CommitTasksModal({
  isOpen,
  onClose,
  commitTasks,
  guideId,
  guideTitle,
  patient,
  onPatientChange,
  activeWard,
  currentUserName,
  existingTasks,
  onCommit,
}: {
  isOpen: boolean;
  onClose: () => void;
  commitTasks: CommitTask[];
  guideId: string;
  guideTitle: string;
  patient: Patient | null;
  onPatientChange: (patient: Patient) => void;
  activeWard: string;
  currentUserName?: string;
  existingTasks: DiaryTask[];
  onCommit: (tasks: Partial<DiaryTask>[]) => void;
}) {
  const [assignTo, setAssignTo] = useState<"ward" | "myself">("ward");
  const [countFrom, setCountFrom] = useState<"admission" | "today">("admission");
  const [rows, setRows] = useState<Row[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const wardCap = activeWard.charAt(0).toUpperCase() + activeWard.slice(1);
  const wardPatients = getActivePatientsByWard(patient?.ward || wardCap);

  // Jobs already in the diary for this patient from this guide. Matched on
  // title so a re-commit does not silently duplicate the sheet.
  const alreadyTitles = useMemo(() => {
    if (!patient) return new Set<string>();
    return new Set(
      existingTasks
        .filter(
          (t) =>
            (t.type === "patient" || t.type === "appointment") &&
            t.patientId === patient.id &&
            t.linkedGuideId === guideId &&
            t.status !== "completed" &&
            t.status !== "cancelled"
        )
        .map((t) => t.title)
    );
  }, [existingTasks, patient, guideId]);

  const basis = countFrom === "admission" && patient?.admissionDate ? patient.admissionDate : toLocalDateStr();

  // Rebuild the sheet whenever the patient, the counting basis or the modal
  // opening changes - all three move every date on it.
  useEffect(() => {
    if (!isOpen) return;
    setRows(
      commitTasks.map((t) => {
        const already = alreadyTitles.has(t.title);
        return {
          ...t,
          already,
          checked: !t.optional && !already,
          date: dateForDay(basis, t.day),
        };
      })
    );
  }, [isOpen, commitTasks, basis, alreadyTitles]);

  useEffect(() => {
    if (isOpen) {
      setAssignTo("ward");
      setCountFrom("admission");
      setPatientSearch("");
      setShowPatientDropdown(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const setRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const selected = rows.filter((r) => r.checked);
  const today = toLocalDateStr();
  const pastCount = selected.filter((r) => r.date < today).length;

  const handleCommit = () => {
    if (!patient || selected.length === 0) return;
    const stamp = toLocalDateStr();
    const claim =
      assignTo === "myself" && currentUserName
        ? { claimedBy: currentUserName, claimedAt: stamp, status: "in_progress" as const }
        : { status: "pending" as const };
    onCommit(
      selected.map((r) => ({
        type: "patient" as const,
        title: r.title,
        category: r.category,
        priority: r.priority || "routine",
        patientName: patient.name,
        patientId: patient.id,
        ward: patient.ward,
        dueDate: r.date,
        carryOver: true,
        linkedGuideId: guideId,
        createdAt: stamp,
        createdBy: currentUserName || "Current User",
        ...claim,
      }))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Commit ${guideTitle} jobs to the diary`}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4 sticky top-0 bg-white border-b border-gray-100 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Commit these jobs to the diary</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Straight from {guideTitle}. Untick anything that does not apply - you do not have to take it all.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Who it is for */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            {patient ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-green-400 bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-500">
                      {patient.ward} Ward
                      {patient.admissionDate ? ` - admitted ${shortDate(patient.admissionDate)}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPatientSearch("");
                    setShowPatientDropdown(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-900">
                <UserPlus className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                <p>No patient linked yet. Pick one below - these jobs go in their diary, so they need an owner.</p>
              </div>
            )}

            {(!patient || showPatientDropdown) && (
              <div className="relative mt-2">
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  placeholder={`Search ${patient?.ward || wardCap} patients...`}
                  aria-label="Search patients"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
                {showPatientDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {wardPatients
                      .filter((p) => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
                      .slice(0, 10)
                      .map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onPatientChange(p);
                            setShowPatientDropdown(false);
                            setPatientSearch("");
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-indigo-50 font-medium text-gray-900"
                        >
                          {p.name}
                        </button>
                      ))}
                    {wardPatients.filter((p) => p.name.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">No patients found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assign + date basis */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAssignTo("ward")}
                  aria-pressed={assignTo === "ward"}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                    assignTo === "ward" ? "bg-blue-100 text-blue-800 ring-2 ring-blue-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  🏥 The ward
                </button>
                <button
                  onClick={() => setAssignTo("myself")}
                  aria-pressed={assignTo === "myself"}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                    assignTo === "myself" ? "bg-purple-100 text-purple-800 ring-2 ring-purple-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  🙋 Me
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {assignTo === "ward"
                  ? "Left unclaimed so anyone on shift can pick them up."
                  : "Claimed in your name and dropped straight into My Jobs."}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Count the days from</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCountFrom("admission")}
                  disabled={!patient?.admissionDate}
                  aria-pressed={countFrom === "admission"}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all disabled:opacity-40 ${
                    countFrom === "admission" ? "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Admission
                </button>
                <button
                  onClick={() => setCountFrom("today")}
                  aria-pressed={countFrom === "today"}
                  className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                    countFrom === "today" ? "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Today
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {countFrom === "admission" && patient?.admissionDate
                  ? `Day 1 is ${shortDate(patient.admissionDate)}, the way the pathway counts.`
                  : "Day 1 is today. Every date stays editable below."}
              </p>
            </div>
          </div>

          {pastCount > 0 && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-900">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
              <p>
                {pastCount === 1 ? "One ticked job is" : `${pastCount} ticked jobs are`} dated in the past. That is what the pathway
                says for this admission - change the dates below, or switch to counting from today.
              </p>
            </div>
          )}

          {/* The tick sheet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Jobs</span>
                <span className="text-xs text-gray-400">{selected.length} of {rows.length} ticked</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRows((rs) => rs.map((r) => (r.already ? r : { ...r, checked: true })))}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Tick all
                </button>
                <span className="text-xs text-gray-300">|</span>
                <button
                  onClick={() => setRows((rs) => rs.map((r) => ({ ...r, checked: false })))}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-colors ${
                    r.already
                      ? "border-gray-100 bg-gray-50"
                      : r.checked
                      ? "border-indigo-200 bg-indigo-50/40"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={r.checked}
                    disabled={r.already}
                    onChange={(e) => setRow(r.id, { checked: e.target.checked })}
                    aria-label={r.title}
                    className="mt-1 w-4 h-4 accent-indigo-600 flex-shrink-0 disabled:opacity-40"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${r.already ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      <span className="mr-1.5" aria-hidden="true">{TASK_CATEGORY_CONFIG[r.category].icon}</span>
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.already
                        ? "Already in the diary"
                        : r.day
                        ? `Pathway: by day ${r.day}`
                        : `Pathway: ${r.when}`}
                    </p>
                  </div>
                  <input
                    type="date"
                    value={r.date}
                    disabled={r.already || !r.checked}
                    onChange={(e) => setRow(r.id, { date: e.target.value })}
                    aria-label={`Due date for ${r.title}`}
                    className={`w-[9.5rem] flex-shrink-0 p-2 border-2 rounded-lg text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-40 disabled:bg-gray-50 ${
                      r.checked && !r.already && r.date < today ? "border-amber-400 text-amber-800" : "border-gray-200"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-4 sticky bottom-0 bg-white border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 p-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCommit}
            disabled={!patient || selected.length === 0}
            className="flex-1 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {!patient
              ? "Pick a patient"
              : selected.length === 0
              ? "Tick at least one job"
              : `Commit ${selected.length} ${selected.length === 1 ? "job" : "jobs"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
