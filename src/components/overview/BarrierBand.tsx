"use client";

// The barriers band on /overview: what is holding discharges up, split by who
// the ward is waiting on, with a 14-day shape.
//
// Deliberately NOT the trust-wide roll-up that was dropped on 27 Jul. That one
// was a league table of wards above the patient list, and it buried the useful
// bit. This sits inside whatever scope is already selected and answers one
// question - "what is stopping people leaving, and is it ours or theirs?" -
// then gets out of the way. Every chip is a filter into the list below, so it
// is a way IN to the work rather than a separate report to read.

import { Building2, Hospital } from "lucide-react";
import type { DiaryTask } from "@/lib/types";
import {
  BARRIER_CATEGORIES,
  type BarrierCategory,
} from "@/lib/data/barrier-categories";
import { summariseBarriers, barrierTrend } from "@/lib/utils/barriers";

/**
 * A 14-day shape, not a precise chart - no axis, no gridlines, no numbers on
 * the line. It answers "getting better or worse?" at a glance and nothing more,
 * which is all a sparkline should ever claim to do.
 */
function Sparkline({ points }: { points: { date: string; count: number }[] }) {
  if (points.length < 2) return null;
  const w = 108;
  const h = 30;
  const counts = points.map((p) => p.count);
  const max = Math.max(...counts, 1);
  const min = Math.min(...counts);
  // Flat data would otherwise divide by zero and collapse to the top edge.
  const span = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p.count - min) / span) * (h - 4) - 2;
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Barrier count over the last ${points.length} days, ending at ${
        counts[counts.length - 1]
      }`}
      className="overflow-visible"
    >
      <polygon points={area} fill="rgba(255,255,255,0.15)" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="2.75" fill="currentColor" />
    </svg>
  );
}

export function BarrierBand({
  tasks,
  categoryFilter,
  onCategoryFilter,
  today,
}: {
  /** Every job in the current scope, filtered or not - the band re-counts. */
  tasks: DiaryTask[];
  categoryFilter: BarrierCategory | null;
  onCategoryFilter: (next: BarrierCategory | null) => void;
  today?: string;
}) {
  const summary = summariseBarriers(tasks, today);
  const trend = barrierTrend(tasks, 14, today);

  if (summary.total === 0) {
    return (
      <div className="bg-white/10 rounded-xl p-4 mt-3 text-center">
        <p className="text-white/80 text-sm">
          No open barriers to discharge in this view.
        </p>
      </div>
    );
  }

  const pct = Math.round((summary.external / summary.total) * 100);

  return (
    <div className="bg-white/10 rounded-xl p-4 mt-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-white/70 text-xs uppercase tracking-wider font-semibold">
            What is holding discharges up
          </p>
          {/* The sponsor line. Said as a sentence rather than as two numbers in
              boxes, because "waiting on someone else" is the point being made. */}
          <p className="text-xl font-bold mt-1">
            {summary.external} of {summary.total} barrier{summary.total === 1 ? "" : "s"} waiting on
            someone outside the ward
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> {summary.external} external ({pct}%)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Hospital className="w-3.5 h-3.5" /> {summary.ward} ours to shift
            </span>
            {summary.uncategorised > 0 && (
              <span className="text-white/60">{summary.uncategorised} not categorised</span>
            )}
          </div>
        </div>

        <div className="text-white/90">
          <p className="text-white/70 text-xs uppercase tracking-wider font-semibold text-right">
            Last 14 days
          </p>
          <Sparkline points={trend} />
          {/* Say what it is. There is no persistence in wardHub, so a real trend
              cannot exist yet - this replays when today's barriers were raised.
              Better to label it than to let someone read it as live history. */}
          <p className="text-[10px] text-white/50 text-right mt-0.5">
            Demo shape, from when each was raised
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {summary.byCategory.map(({ category, label, count }) => {
          const selected = categoryFilter === category;
          const owner = category ? BARRIER_CATEGORIES[category].owner : null;
          return (
            <button
              key={category ?? "none"}
              type="button"
              aria-pressed={selected}
              // Uncategorised is shown but not filterable - there is nothing
              // useful to drill into, and it should read as a gap to close.
              disabled={!category}
              onClick={() => category && onCategoryFilter(selected ? null : category)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selected
                  ? "bg-white text-gray-900 border-white font-semibold"
                  : category
                    ? "bg-white/10 border-white/25 text-white hover:bg-white/20"
                    : "bg-white/5 border-white/15 text-white/50 cursor-default"
              }`}
            >
              {label} {count}
              {owner === "ward" && <span className="ml-1 opacity-70">·ours</span>}
            </button>
          );
        })}
        {categoryFilter && (
          <button
            type="button"
            onClick={() => onCategoryFilter(null)}
            className="text-xs px-2.5 py-1 rounded-full border border-white/25 text-white/80 hover:bg-white/10"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
