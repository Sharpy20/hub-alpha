"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/app/providers";
import { DEMO_PATIENTS } from "@/lib/data/tasks";
import { toLocalDateStr } from "@/lib/utils/date";
import {
  CareTracker, REVIEW_ITEMS, loadTracker, daysUntilDue, reviewStatus, admissionProgress,
} from "@/lib/data/care-review";
import { AlertTriangle, Clock, CheckCircle2, ClipboardCheck } from "lucide-react";

// Ward-level roll-up of the care-review board - the weekly audit at a glance.
// Reads the same localStorage tracker the patient tiles use. Full build only.
export function CareReviewRollup() {
  const { activeWard } = useApp();
  const [tracker, setTracker] = useState<CareTracker>({});
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(toLocalDateStr());
    setTracker(loadTracker());
  }, []);

  if (!today) return null;

  const rows = DEMO_PATIENTS
    .filter((p) => p.ward.toLowerCase() === activeWard.toLowerCase() && p.status !== "discharged")
    .map((p) => {
      const t = tracker[p.id];
      const adm = admissionProgress(t);
      let overdue = 0, due = 0;
      REVIEW_ITEMS.forEach((it) => {
        const s = reviewStatus(daysUntilDue(t?.reviews[it.id], it.intervalDays, today), it.intervalDays);
        if (s === "overdue") overdue++;
        else if (s === "due") due++;
      });
      return { p, adm, overdue, due };
    })
    .sort((a, b) => (b.overdue - a.overdue) || (b.due - a.due) || (Number(a.adm.complete) - Number(b.adm.complete)));

  if (!rows.length) return null;

  const overduePatients = rows.filter((r) => r.overdue > 0).length;
  const admIncomplete = rows.filter((r) => !r.adm.complete).length;
  const allGood = overduePatients === 0 && admIncomplete === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <ClipboardCheck className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-800 flex-1">Care Review Audit - {activeWard} Ward</h2>
        {allGood ? (
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> All up to date
          </span>
        ) : (
          <div className="flex items-center gap-2">
            {overduePatients > 0 && (
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> {overduePatients} with overdue
              </span>
            )}
            {admIncomplete > 0 && (
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                {admIncomplete} admission{admIncomplete !== 1 ? "s" : ""} incomplete
              </span>
            )}
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {rows.map(({ p, adm, overdue, due }) => (
          <div key={p.id} className="px-6 py-3 flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-gray-800 flex-1 min-w-[8rem]">{p.name}</span>

            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${adm.complete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
              {adm.complete ? "Admission ✓" : `Admission ${adm.done}/${adm.total}`}
            </span>

            {overdue > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {overdue} overdue
              </span>
            )}
            {due > 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {due} due soon
              </span>
            )}
            {overdue === 0 && due === 0 && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> reviews current
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="px-6 py-3 text-xs text-gray-400 border-t border-gray-50">
        Live from the Care Review board on each patient. New admissions (under 7 days) are still being worked through.
      </p>
    </div>
  );
}
