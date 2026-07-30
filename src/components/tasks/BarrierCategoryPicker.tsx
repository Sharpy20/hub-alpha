"use client";

import {
  BARRIER_CATEGORIES,
  BARRIER_CATEGORY_ORDER,
  type BarrierCategory,
} from "@/lib/data/barrier-categories";

/**
 * The "what kind of barrier is this?" picker, shown only once a job has been
 * flagged as blocking discharge.
 *
 * Chips rather than a `<select>` on purpose: it is one tap instead of three,
 * and every option is readable at a glance, which matters because the whole
 * point is that people actually use it. It is OPTIONAL - tapping the selected
 * chip again clears it, and a job with nothing picked still counts as a
 * barrier everywhere, it just lands in "not categorised".
 */
export function BarrierCategoryPicker({
  value,
  onChange,
  className = "",
}: {
  value: BarrierCategory | undefined;
  onChange: (next: BarrierCategory | undefined) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-amber-800 mb-1.5">
        What is it waiting on? <span className="font-normal text-amber-700">(optional)</span>
      </p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Barrier category">
        {BARRIER_CATEGORY_ORDER.map((key) => {
          const meta = BARRIER_CATEGORIES[key];
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              // Tapping the live chip clears it, so a mis-tap costs one tap to
              // undo rather than needing a separate "none" option.
              onClick={() => onChange(selected ? undefined : key)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selected
                  ? `${meta.chip} font-semibold ring-2 ring-offset-1 ring-amber-400`
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {meta.short}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-amber-700 mt-1.5">
        Groups the barrier on Overview, and works out whether the ward is waiting on itself or on
        someone outside it.
      </p>
    </div>
  );
}

/** Read-only chip, for cards, rows and anywhere a barrier is shown but not edited. */
export function BarrierCategoryChip({
  category,
  className = "",
}: {
  category: BarrierCategory | undefined;
  className?: string;
}) {
  if (!category) return null;
  const meta = BARRIER_CATEGORIES[category];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta.chip} ${className}`}
    >
      {meta.short}
    </span>
  );
}
