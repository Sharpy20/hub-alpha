"use client";

// Append-only task history (BACKLOG Section M, item 4). The events already
// fired in tasks-provider - they were simply never kept, which is why Reopen
// used to wipe completedBy/completedAt with no trace.
//
// `detail` is always assembled from structured choices, so nothing a user typed
// can appear here.

import { useState } from "react";
import { ChevronDown, ChevronRight, History } from "lucide-react";
import type { TaskEvent, TaskEventType } from "@/lib/types";

const VERB: Record<TaskEventType, string> = {
  claimed: "Claimed",
  handed_back: "Handed back",
  taken_over: "Taken over",
  dropped: "Dropped",
  completed: "Completed",
  reopened: "Reopened",
  rescheduled: "Rescheduled",
  in_error: "Marked in error",
  restored: "Restored",
};

const DOT: Record<TaskEventType, string> = {
  claimed: "bg-blue-400",
  handed_back: "bg-amber-500",
  taken_over: "bg-purple-400",
  dropped: "bg-gray-300",
  completed: "bg-emerald-500",
  reopened: "bg-orange-400",
  rescheduled: "bg-sky-400",
  in_error: "bg-rose-400",
  restored: "bg-emerald-400",
};

const stamp = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function TaskHistory({ history }: { history?: TaskEvent[] }) {
  const [open, setOpen] = useState(false);
  if (!history || history.length === 0) return null;

  // Newest first - what happened last is what you want when you pick a job up.
  const events = [...history].reverse();

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <History className="w-4 h-4 text-gray-500" />
        <span className="font-bold text-gray-800 text-sm flex-1">
          History ({history.length})
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && (
        <ul className="px-4 pb-4 space-y-3">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${DOT[e.type]}`} />
              <div className="min-w-0">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{VERB[e.type]}</span> by {e.by}
                </p>
                {e.detail && <p className="text-xs text-gray-500">{e.detail}</p>}
                <p className="text-[11px] text-gray-400">{stamp(e.at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
