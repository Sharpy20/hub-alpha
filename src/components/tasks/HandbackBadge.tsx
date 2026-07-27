"use client";

// The badge that says a job has been round the loop before. Same weight as the
// discharge-barrier badge (Mike): the card shows the actual state, which is more
// specific than any collective noun - hence no umbrella name for these.

import { Clock, RotateCw } from "lucide-react";
import type { TaskHandback } from "@/lib/types";
import { stateLabel, stateTone, TONE_CLASSES } from "@/lib/data/tasks/handback";

const daysSince = (iso?: string) => {
  if (!iso) return 0;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const then = new Date(y, m - 1, d);
  const now = new Date();
  // Floor, not round: handed back this afternoon is 0 days old, not 1.
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / 86_400_000));
};

/** Plain-text version for compact views that cannot fit the badge. */
export function handbackTooltip(handback: TaskHandback): string {
  const age = daysSince(handback.at);
  const base =
    handback.state === "waiting" && handback.waitingOn
      ? `Waiting on ${handback.waitingOn}`
      : stateLabel(handback.state);
  const aged = age > 0 ? `${base}, ${age} day${age === 1 ? "" : "s"}` : base;
  return `${aged} - left by ${handback.by}`;
}

export function HandbackBadge({
  handback,
  count,
  size = "sm",
}: {
  handback: TaskHandback;
  count?: number;
  size?: "sm" | "xs";
}) {
  const tone = TONE_CLASSES[stateTone(handback.state)];
  const age = daysSince(handback.at);
  // "waiting on housing, 11 days" - the age is the bit that makes it chaseable.
  const label =
    handback.state === "waiting" && handback.waitingOn
      ? `Waiting on ${handback.waitingOn.toLowerCase()}${age > 0 ? `, ${age} day${age === 1 ? "" : "s"}` : ""}`
      : stateLabel(handback.state);

  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 rounded-md border font-bold ${tone} ${
          size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
        }`}
      >
        <Clock className={size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        {label}
      </span>
      {/* A job handed back four times is going round in circles - exactly the
          "no answer, try again tomorrow" failure. Make it visible. */}
      {!!count && count > 2 && (
        <span
          className={`inline-flex items-center gap-1 rounded-md border border-orange-300 bg-orange-100 text-orange-800 font-bold ${
            size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
          }`}
          title={`Handed back ${count} times`}
        >
          <RotateCw className={size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5"} />
          {count}
          {size === "sm" && "th time"}
        </span>
      )}
    </span>
  );
}
