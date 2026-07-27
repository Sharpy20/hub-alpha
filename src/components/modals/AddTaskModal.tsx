"use client";

// The Add Task screen. Lived inside src/app/tasks/page.tsx until 27 Jul 2026,
// when the guides needed it too - finishing a guide now offers "Add follow-up
// task", which opens THIS screen pre-filled with what the guide already knows
// (the linked patient, the guide itself, a sensible title and date) rather than
// silently creating a task you never see. Extracted unchanged apart from the
// new optional `prefill` prop, so the diary and the guides stay one screen.

import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import {
  DiaryTask,
  PatientTask,
  SHIFT_CONFIG,
  TASK_CATEGORY_CONFIG,
  PRIORITY_CONFIG,
} from "@/lib/types";
import { getActivePatientsByWard } from "@/lib/data/tasks";
import { GuideSelect } from "@/components/ui/GuideSelect";
import { guideLabel } from "@/lib/data/guides/catalog";
import { useModalA11y } from "@/lib/hooks/useModalA11y";
import { toLocalDateStr as formatDate } from "@/lib/utils/date";

/** What a caller already knows, used to pre-fill the form. All optional. */
export interface AddTaskPrefill {
  taskType?: "ward" | "patient" | "appointment";
  title?: string;
  patientName?: string;
  category?: string;
  priority?: "routine" | "important" | "urgent";
  linkedGuide?: string;
  linkedReferral?: string;
  date?: string;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
  activeWard,
  defaultDate,
  currentUserName,
  onBulkPatient,
  prefill,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Partial<DiaryTask>) => void;
  activeWard: string;
  defaultDate?: string;
  currentUserName?: string;
  onBulkPatient?: () => void;
  /** Values a caller already knows (e.g. a guide's linked patient). Applied
   *  each time the modal opens; everything stays editable afterwards. */
  prefill?: AddTaskPrefill;
}) {
  const [taskType, setTaskType] = useState<"ward" | "patient" | "appointment">("ward");
  const [title, setTitle] = useState("");
  // Bulk mode (team tasks only) - one task per line
  const [bulkMode, setBulkMode] = useState(false);
  const [category, setCategory] = useState<string>("referral");
  const [patientName, setPatientName] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Get patients for current ward
  const wardPatients = getActivePatientsByWard(activeWard.charAt(0).toUpperCase() + activeWard.slice(1));
  const [priority, setPriority] = useState<"routine" | "important" | "urgent">("routine");
  const [linkedReferral, setLinkedReferral] = useState("");
  const [linkedGuide, setLinkedGuide] = useState("");

  // Patient task repeating
  const [patientRepeat, setPatientRepeat] = useState(false);
  const [repeatIntervalDays, setRepeatIntervalDays] = useState(7);

  // Discharge planning: does this task block the patient's discharge?
  const [blocksDischarge, setBlocksDischarge] = useState(false);

  // Ward task specific - repeating vs one-off
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Default all days
  const [selectedShift, setSelectedShift] = useState<"early" | "late" | "night">("early");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const effectiveDefault = defaultDate || formatDate(new Date());
  const [wardTaskDate, setWardTaskDate] = useState(effectiveDefault);
  const [taskDate, setTaskDate] = useState(effectiveDefault);
  const [appointmentDate, setAppointmentDate] = useState(effectiveDefault);

  // Reset dates when defaultDate changes (e.g. opening modal from a different day)
  useEffect(() => {
    setWardTaskDate(effectiveDefault);
    setTaskDate(effectiveDefault);
    setAppointmentDate(effectiveDefault);
  }, [effectiveDefault]);

  // Appointment specific
  const [timeType, setTimeType] = useState<"preset" | "exact">("preset");
  const [presetTime, setPresetTime] = useState<"morning" | "afternoon" | "evening" | "night">("morning");
  const [exactTime, setExactTime] = useState("09:00");
  const [duration, setDuration] = useState("");

  // Assignment toggle: "myself" or "ward"
  const [assignTo, setAssignTo] = useState<"ward" | "myself">("ward");

  // Apply a caller's prefill each time the modal opens. Only fields the caller
  // actually supplied are touched, so an unfilled form still behaves exactly as
  // it always did when opened from the diary.
  useEffect(() => {
    if (!isOpen || !prefill) return;
    if (prefill.taskType) setTaskType(prefill.taskType);
    if (prefill.title) setTitle(prefill.title);
    if (prefill.patientName) {
      setPatientName(prefill.patientName);
      setPatientSearch(prefill.patientName);
    }
    if (prefill.category) setCategory(prefill.category);
    if (prefill.priority) setPriority(prefill.priority);
    if (prefill.linkedGuide) setLinkedGuide(prefill.linkedGuide);
    if (prefill.linkedReferral) setLinkedReferral(prefill.linkedReferral);
    if (prefill.date) {
      setTaskDate(prefill.date);
      setWardTaskDate(prefill.date);
      setAppointmentDate(prefill.date);
    }
    // `prefill` is rebuilt by callers on every render, so key the effect on its
    // contents rather than its identity or this loops.
  }, [isOpen, JSON.stringify(prefill)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Appointment enhancements - linked referral, guide, and details
  const [apptLinkedReferral, setApptLinkedReferral] = useState("");
  const [apptLinkedGuide, setApptLinkedGuide] = useState("");
  const [apptMoreDetails, setApptMoreDetails] = useState("");
  const [showApptReferral, setShowApptReferral] = useState(false);
  const [showApptGuide, setShowApptGuide] = useState(false);
  const [showApptDetails, setShowApptDetails] = useState(false);

  // Keyboard support: focus trap + Escape-to-close (WCAG 2.1.2)
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalA11y(dialogRef, onClose, isOpen);

  if (!isOpen) return null;

  // Pick a guide; if the Task Title is still blank, pre-fill it from the guide
  // name (still editable) as a time saver.
  const pickGuide = (setter: (id: string) => void) => (id: string) => {
    setter(id);
    if (id && !title.trim()) {
      const label = guideLabel(id);
      if (label) setTitle(label);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const claimFields = assignTo === "myself" && currentUserName
      ? { claimedBy: currentUserName, claimedAt: formatDate(new Date()), status: "in_progress" as const }
      : { status: "pending" as const };

    const baseTask = {
      title,
      priority,
      ...claimFields,
      dueDate: taskType === "ward" ? (isRecurring ? effectiveDefault : wardTaskDate) : taskDate,
      createdAt: formatDate(new Date()),
      createdBy: currentUserName || "Current User",
      ward: "Byron",
    };

    if (taskType === "patient") {
      onAdd({
        ...baseTask,
        type: "patient",
        category: category as PatientTask["category"],
        patientName: patientName || undefined,
        linkedReferralId: category === "referral" ? (linkedReferral || undefined) : undefined,
        linkedGuideId: category !== "referral" ? (linkedGuide || undefined) : undefined,
        carryOver: true,
        repeatIntervalDays: patientRepeat ? repeatIntervalDays : undefined,
        blocksDischarge: blocksDischarge || undefined,
      });
    } else if (taskType === "appointment") {
      const timeValue = timeType === "preset"
        ? ({ morning: "AM", afternoon: "PM", evening: "Evening", night: "Night" }[presetTime])
        : exactTime;
      // Build description from duration and more details
      const descParts = [];
      if (duration) descParts.push(`Duration: ${duration}`);
      if (apptMoreDetails.trim()) descParts.push(apptMoreDetails.trim());
      const description = descParts.length > 0 ? descParts.join("\n") : undefined;

      onAdd({
        ...baseTask,
        type: "appointment",
        patientName: patientName || undefined,
        appointmentDate: appointmentDate,
        appointmentTime: timeValue,
        description,
        linkedReferralId: showApptReferral && apptLinkedReferral ? apptLinkedReferral : undefined,
        linkedGuideId: showApptGuide && apptLinkedGuide ? apptLinkedGuide : undefined,
        blocksDischarge: blocksDischarge || undefined,
      });
    } else {
      // Ward task - use wardTaskDate for one-off, today for recurring
      const taskDueDate = isRecurring ? formatDate(new Date()) : wardTaskDate;
      const wardBase = {
        ...baseTask,
        type: "ward" as const,
        dueDate: taskDueDate,
        shift: selectedShift,
        isRecurring,
        recurringDays: isRecurring ? recurringDays : undefined,
        carryOver: false,
        linkedGuideId: linkedGuide || undefined,
        // If requiresApproval is set for repeating tasks, add a note to the description
        description: isRecurring && requiresApproval ? "✅ Leadership approved" : undefined,
      };
      if (bulkMode) {
        // One task per line - each becomes its own team task with these settings
        const lines = title.split("\n").map((l) => l.trim()).filter(Boolean);
        lines.forEach((line) => onAdd({ ...wardBase, title: line }));
      } else {
        onAdd(wardBase);
      }
    }

    // Reset form
    setTitle("");
    setBulkMode(false);
    setPatientName("");
    setPatientRepeat(false);
    setRepeatIntervalDays(7);
    setLinkedReferral("");
    setLinkedGuide("");
    setAppointmentDate(formatDate(new Date()));
    setTimeType("preset");
    setPresetTime("morning");
    setExactTime("09:00");
    setDuration("");
    setAssignTo("ward");
    onClose();
  };

  // Get placeholder based on task type
  const getPlaceholder = () => {
    switch (taskType) {
      case "appointment":
        return "e.g., CPN visiting";
      case "ward":
        return "e.g., Record fridge temps";
      default:
        return "e.g., Complete capacity assessment";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add new task"
        className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Task</h2>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { type: "ward" as const, icon: "🏥", label: "Team Task" },
            { type: "patient" as const, icon: "👤", label: "Patient Task" },
            { type: "appointment" as const, icon: "📅", label: "Appointment" },
          ].map((opt) => (
            <button
              key={opt.type}
              onClick={() => setTaskType(opt.type)}
              className={`p-3 rounded-xl text-center transition-all ${
                taskType === opt.type
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-2xl block mb-1">{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              {bulkMode && taskType === "ward" ? "Task Titles *" : "Task Title *"}
            </label>
            {taskType === "ward" && (
              <button
                type="button"
                onClick={() => setBulkMode((b) => !b)}
                className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                  bulkMode ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {bulkMode ? "Single task" : "Add several"}
              </button>
            )}
            {taskType === "patient" && onBulkPatient && (
              <button
                type="button"
                onClick={onBulkPatient}
                className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                Add several
              </button>
            )}
          </div>
          {bulkMode && taskType === "ward" ? (
            <>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={5}
                placeholder={"One task per line, e.g.\nRecord fridge temps\nFire door check\nStock resus trolley"}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">
                Each line becomes its own team task with the date, shift and priority set below.
              </p>
            </>
          ) : (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          )}
        </div>

        {(taskType === "patient" || taskType === "appointment") && (
          <div className="mb-4 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <div className="relative">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setShowPatientDropdown(true);
                  // Clear selection if user types something different
                  if (patientName && e.target.value !== patientName) {
                    setPatientName("");
                  }
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
                  .filter((p) =>
                    p.name.toLowerCase().includes(patientSearch.toLowerCase())
                  )
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
                {wardPatients.filter((p) =>
                  p.name.toLowerCase().includes(patientSearch.toLowerCase())
                ).length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No patients found
                  </div>
                )}
              </div>
            )}
            {patientName && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Selected: {patientName}
              </p>
            )}
          </div>
        )}

        {/* Appointment specific fields */}
        {taskType === "appointment" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setTimeType("preset")}
                  className={`flex-1 p-2 rounded-lg text-sm transition-all ${
                    timeType === "preset"
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Time of Day
                </button>
                <button
                  onClick={() => setTimeType("exact")}
                  className={`flex-1 p-2 rounded-lg text-sm transition-all ${
                    timeType === "exact"
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Exact Time
                </button>
              </div>
              {timeType === "preset" ? (
                <div className="grid grid-cols-4 gap-2">
                  {(["morning", "afternoon", "evening", "night"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setPresetTime(t)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        presetTime === t
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="block text-lg">
                        {t === "morning" ? "🌅" : t === "afternoon" ? "☀️" : t === "evening" ? "🌇" : "🌙"}
                      </span>
                      <span className="text-xs capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="time"
                  value={exactTime}
                  onChange={(e) => setExactTime(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (optional)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option value="">No duration specified</option>
                <option value="15 mins">15 minutes</option>
                <option value="30 mins">30 minutes</option>
                <option value="45 mins">45 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="1.5 hours">1.5 hours</option>
                <option value="2 hours">2 hours</option>
                <option value="Half day">Half day</option>
                <option value="Full day">Full day</option>
              </select>
            </div>

            {/* Appointment enhancements - toggleable options */}
            <div className="mb-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Additional Options</p>

              {/* Link a referral toggle */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowApptReferral(!showApptReferral)}
                  className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                    showApptReferral ? "bg-indigo-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>📄</span>
                    <span>Link a referral workflow</span>
                  </span>
                  <span className={`text-lg ${showApptReferral ? "text-indigo-600" : "text-gray-400"}`}>
                    {showApptReferral ? "−" : "+"}
                  </span>
                </button>
                {showApptReferral && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <GuideSelect
                      value={apptLinkedReferral}
                      onChange={pickGuide(setApptLinkedReferral)}
                      suggestFrom={title}
                      placeholder="Select referral..."
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Link a how-to guide toggle */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowApptGuide(!showApptGuide)}
                  className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                    showApptGuide ? "bg-emerald-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>📚</span>
                    <span>Link a how-to guide</span>
                  </span>
                  <span className={`text-lg ${showApptGuide ? "text-emerald-600" : "text-gray-400"}`}>
                    {showApptGuide ? "−" : "+"}
                  </span>
                </button>
                {showApptGuide && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <GuideSelect
                      value={apptLinkedGuide}
                      onChange={pickGuide(setApptLinkedGuide)}
                      suggestFrom={title}
                      placeholder="Select guide..."
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* More details toggle */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowApptDetails(!showApptDetails)}
                  className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                    showApptDetails ? "bg-amber-50" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>📝</span>
                    <span>Add more details</span>
                  </span>
                  <span className={`text-lg ${showApptDetails ? "text-amber-600" : "text-gray-400"}`}>
                    {showApptDetails ? "−" : "+"}
                  </span>
                </button>
                {showApptDetails && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <textarea
                      value={apptMoreDetails}
                      onChange={(e) => setApptMoreDetails(e.target.value)}
                      placeholder="Add notes, attendees, location details, etc..."
                      rows={3}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Ward task specific fields */}
        {taskType === "ward" && (
          <>
            {/* Shift selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <div className="grid grid-cols-3 gap-2">
                {(["early", "late", "night"] as const).map((shift) => {
                  const config = SHIFT_CONFIG[shift];
                  return (
                    <button
                      key={shift}
                      onClick={() => setSelectedShift(shift)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        selectedShift === shift
                          ? `bg-gradient-to-r ${config.gradient} text-white`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-xl block">{config.icon}</span>
                      <span className="text-xs font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Task type toggle - One-off vs Repeating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Schedule</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsRecurring(false)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    !isRecurring
                      ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xl block">📌</span>
                  <span className="text-xs font-medium">One-off Task</span>
                </button>
                <button
                  onClick={() => setIsRecurring(true)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    isRecurring
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xl block">🔄</span>
                  <span className="text-xs font-medium">Repeating Task</span>
                </button>
              </div>
            </div>

            {/* One-off task date picker */}
            {!isRecurring && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={wardTaskDate}
                  onChange={(e) => setWardTaskDate(e.target.value)}
                  min={formatDate(new Date())} // Can't schedule in the past
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Repeating task settings */}
            {isRecurring && (
              <div className="mb-4 space-y-3">
                <div className="p-3 border border-indigo-200 rounded-xl bg-indigo-50">
                  <p className="text-xs font-medium text-indigo-800 mb-2">Repeats on:</p>
                  <div className="flex gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                      <button
                        key={day}
                        onClick={() => {
                          setRecurringDays((prev) =>
                            prev.includes(idx)
                              ? prev.filter((d) => d !== idx)
                              : [...prev, idx].sort()
                          );
                        }}
                        className={`flex-1 py-2 text-xs rounded transition-colors ${
                          recurringDays.includes(idx)
                            ? "bg-indigo-500 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setRecurringDays([0, 1, 2, 3, 4, 5, 6])}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      All days
                    </button>
                    <button
                      onClick={() => setRecurringDays([1, 2, 3, 4, 5])}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Weekdays
                    </button>
                    <button
                      onClick={() => setRecurringDays([0, 6])}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Weekends
                    </button>
                  </div>
                </div>

                {/* Leadership approval toggle - only for repeating tasks */}
                <label className="flex items-center gap-3 p-3 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 bg-amber-50/50">
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Has ward leadership approved this repeating task?</p>
                    <p className="text-xs text-gray-500">Mark if this task has been signed off by senior staff</p>
                  </div>
                </label>
              </div>
            )}
          </>
        )}

        {taskType === "patient" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {/* Patient task repeat toggle */}
        {taskType === "patient" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Repeats?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPatientRepeat(false)}
                className={`p-3 rounded-xl text-center transition-all ${
                  !patientRepeat
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-xl block">📌</span>
                <span className="text-xs font-medium">One-off</span>
              </button>
              <button
                onClick={() => setPatientRepeat(true)}
                className={`p-3 rounded-xl text-center transition-all ${
                  patientRepeat
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-xl block">🔄</span>
                <span className="text-xs font-medium">Repeating</span>
              </button>
            </div>
            {patientRepeat && (
              <div className="mt-3 p-3 border border-indigo-200 rounded-xl bg-indigo-50">
                <p className="text-xs font-medium text-indigo-800 mb-2">Repeat every:</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { days: 7, label: "Weekly" },
                    { days: 14, label: "Fortnightly" },
                    { days: 28, label: "4 weeks" },
                    { days: 1, label: "Daily" },
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      onClick={() => setRepeatIntervalDays(opt.days)}
                      className={`p-2 rounded-lg text-center text-xs font-medium transition-all ${
                        repeatIntervalDays === opt.days
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-indigo-600 mt-2">
                  Task will appear every {repeatIntervalDays} day{repeatIntervalDays > 1 ? "s" : ""} from {taskDate}
                </p>
              </div>
            )}
          </div>
        )}

        {taskType === "patient" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TASK_CATEGORY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`p-2 rounded-lg text-left flex items-center gap-2 transition-all ${
                    category === key
                      ? `bg-gradient-to-r ${config.gradient} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{config.icon}</span>
                  <span className="text-sm capitalize">{key.replace("_", " ")}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Barrier to discharge - patient tasks and appointments only */}
        {(taskType === "patient" || taskType === "appointment") && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setBlocksDischarge(!blocksDischarge)}
              aria-pressed={blocksDischarge}
              className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-all border-2 ${
                blocksDischarge
                  ? "bg-amber-50 border-amber-400"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2 text-sm">
                <span>🚧</span>
                <span className={blocksDischarge ? "font-medium text-amber-800" : "text-gray-700"}>
                  Barrier to discharge
                </span>
              </span>
              <span
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                  blocksDischarge ? "bg-amber-500 justify-end" : "bg-gray-300 justify-start"
                }`}
              >
                <span className="w-5 h-5 bg-white rounded-full shadow" />
              </span>
            </button>
            {blocksDischarge && (
              <p className="text-xs text-amber-700 mt-1">
                Flags this task as holding up the patient&apos;s discharge, so the MDT can see blockers at a glance.
              </p>
            )}
          </div>
        )}

        {/* Referral guide link - only for referral category */}
        {taskType === "patient" && category === "referral" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Referral Guide (optional)
            </label>
            <GuideSelect
              value={linkedReferral}
              onChange={pickGuide(setLinkedReferral)}
              suggestFrom={title}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        {/* How-to guide link - for non-referral patient tasks and team tasks */}
        {((taskType === "patient" && category !== "referral") || taskType === "ward") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Optionally match to a guide
            </label>
            <GuideSelect
              value={linkedGuide}
              onChange={pickGuide(setLinkedGuide)}
              suggestFrom={title}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <div className="flex gap-2">
            {(["routine", "important", "urgent"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  priority === p
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{PRIORITY_CONFIG[p].icon}</span>
                <span className="text-sm capitalize">{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Assign to toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAssignTo("ward")}
              className={`p-3 rounded-xl text-center transition-all ${
                assignTo === "ward"
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-xl block">🏥</span>
              <span className="text-xs font-medium">Ward</span>
              <span className="text-[10px] block opacity-75">Anyone can claim</span>
            </button>
            <button
              onClick={() => setAssignTo("myself")}
              className={`p-3 rounded-xl text-center transition-all ${
                assignTo === "myself"
                  ? "bg-gradient-to-r from-green-500 to-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="text-xl block">👤</span>
              <span className="text-xs font-medium">Myself</span>
              <span className="text-[10px] block opacity-75">Claim it straight away</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || (taskType === "appointment" && !appointmentDate)}
            className="flex-1 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {bulkMode && taskType === "ward"
              ? (() => {
                  const n = title.split("\n").map((l) => l.trim()).filter(Boolean).length;
                  return n > 1 ? `Add ${n} Tasks` : "Add Task";
                })()
              : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
