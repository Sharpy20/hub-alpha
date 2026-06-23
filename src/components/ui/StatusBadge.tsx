"use client";

// Certificate-style traffic-light approval badge shown on guide and link tiles.
// Status comes from the central map in src/lib/data/approval-status.ts (Mike's
// editorial sign-off). Purely visual - it tells the reader how far to trust the
// content: green = passed, amber = awaiting approval, red = in development.

import { BadgeCheck, Clock, Wrench } from "lucide-react";
import type { ApprovalStatus } from "@/lib/data/approval-status";

const META: Record<
  ApprovalStatus,
  { label: string; ring: string; bg: string; text: string; Icon: typeof BadgeCheck; tip: string }
> = {
  green: {
    label: "Passed",
    ring: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    Icon: BadgeCheck,
    tip: "Passed - checked and approved",
  },
  amber: {
    label: "Awaiting approval",
    ring: "border-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-700",
    Icon: Clock,
    tip: "Awaiting approval - built but not yet signed off",
  },
  red: {
    label: "In development",
    ring: "border-rose-300",
    bg: "bg-rose-50",
    text: "text-rose-700",
    Icon: Wrench,
    tip: "In development - do not rely on this yet",
  },
};

export function StatusBadge({ status }: { status: ApprovalStatus }) {
  const m = META[status];
  const Icon = m.Icon;
  return (
    <div
      title={m.tip}
      aria-label={m.tip}
      className={`flex flex-col items-center justify-center gap-0.5 w-[86px] flex-shrink-0 rounded-lg border-2 ${m.ring} ${m.bg} px-1.5 py-1.5 text-center`}
    >
      <Icon className={`w-5 h-5 ${m.text}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${m.text}`}>
        {m.label}
      </span>
    </div>
  );
}
