"use client";

import { X, Check, Clock, AlertTriangle, BookOpen } from "lucide-react";
import { Patient } from "@/lib/types";
import { toLocalDateStr } from "@/lib/utils/date";
import { useV2Href } from "@/lib/hooks/useV2";
import {
  ADMISSION_ITEMS,
  REVIEW_ITEMS,
  PatientTracker,
  daysUntilDue,
  reviewStatus,
  admissionProgress,
} from "@/lib/data/care-review";

const STATUS_STYLE: Record<string, { chip: string; text: string }> = {
  ok: { chip: "bg-green-100 text-green-800", text: "text-green-700" },
  due: { chip: "bg-amber-100 text-amber-800", text: "text-amber-700" },
  overdue: { chip: "bg-red-100 text-red-800", text: "text-red-700" },
  none: { chip: "bg-gray-100 text-gray-500", text: "text-gray-500" },
};

function dueLabel(days: number | null): string {
  if (days === null) return "not started";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "due today";
  return `due in ${days}d`;
}

export function CareReviewModal({
  isOpen,
  onClose,
  patient,
  tracker,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  tracker: PatientTracker;
  onUpdate: (next: PatientTracker) => void;
}) {
  const v2Href = useV2Href();
  if (!isOpen || !patient) return null;

  const today = toLocalDateStr();
  const adm = admissionProgress(tracker);

  const toggleAdmission = (id: string) => {
    const admission = { ...tracker.admission };
    if (admission[id]) delete admission[id];
    else admission[id] = today;
    onUpdate({ ...tracker, admission });
  };

  const markReviewed = (id: string) => {
    onUpdate({ ...tracker, reviews: { ...tracker.reviews, [id]: today } });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Care review for ${patient.name}`}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3 sticky top-0 bg-white border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Care Review</h2>
            <p className="text-sm text-gray-500">{patient.name} · {patient.ward} Ward</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Admission tasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800">Admission tasks</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${adm.complete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                {adm.complete ? "Complete" : `${adm.done}/${adm.total}`}
              </span>
            </div>
            <div className="space-y-1.5">
              {ADMISSION_ITEMS.map((it) => {
                const done = tracker.admission[it.id];
                return (
                  <div key={it.id} className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleAdmission(it.id)}
                      className={`flex-1 flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        done ? "bg-green-50 hover:bg-green-100" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${done ? "bg-green-600 text-white" : "border-2 border-gray-300"}`}>
                        {done && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span className={`flex-1 text-sm ${done ? "text-green-900" : "text-gray-700"}`}>{it.label}</span>
                      {done && <span className="text-[11px] text-green-600">{new Date(done).toLocaleDateString("en-GB")}</span>}
                    </button>
                    {it.guideId && (
                      <a
                        href={v2Href(`/guides/${it.guideId}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open the relevant guide"
                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg flex-shrink-0"
                      >
                        <BookOpen className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">Tap to tick. Goes green on the tile when all are done.</p>
          </div>

          {/* Recurring reviews */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Recurring reviews</h3>
            <div className="space-y-1.5">
              {REVIEW_ITEMS.map((it) => {
                const last = tracker.reviews[it.id];
                const days = daysUntilDue(last, it.intervalDays, today);
                const status = reviewStatus(days, it.intervalDays);
                const style = STATUS_STYLE[status];
                return (
                  <div key={it.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800 block truncate">{it.label}</span>
                      <span className="text-[11px] text-gray-400">
                        every {it.intervalDays >= 30 ? "month" : `${it.intervalDays} days`}
                        {last ? ` · last ${new Date(last).toLocaleDateString("en-GB")}` : ""}
                      </span>
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${style.chip}`}>
                      {status === "overdue" && <AlertTriangle className="w-3 h-3" />}
                      {status !== "overdue" && status !== "none" && <Clock className="w-3 h-3" />}
                      {dueLabel(days)}
                    </span>
                    {it.guideId && (
                      <a
                        href={v2Href(`/guides/${it.guideId}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open the relevant guide"
                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg flex-shrink-0"
                      >
                        <BookOpen className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => markReviewed(it.id)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                      Done today
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">&ldquo;Done today&rdquo; stamps the date and restarts the countdown.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
