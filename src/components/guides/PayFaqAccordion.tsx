"use client";

import { ChevronDown } from "lucide-react";
import { PAY_FAQ, type PayFaqTopic } from "@/lib/data/guides/pay-faq";

const TOPIC_LABELS: Record<PayFaqTopic, string> = {
  payslip: "Payslip",
  roster: "Roster",
  leave: "Leave & rest",
};

// Click-to-expand FAQ list for the staff-life pay guides. Questions live in
// one shared pool (pay-faq.ts) tagged by topic; each guide renders its slice,
// so cross-topic questions appear in every guide they belong to.
export function PayFaqAccordion({ topic }: { topic: PayFaqTopic }) {
  const items = PAY_FAQ.filter((f) => f.topics.includes(topic));

  return (
    <div className="mt-4 space-y-2">
      {items.map((f) => (
        <details key={f.q} className="group bg-slate-50 border border-slate-200 rounded-xl open:bg-white open:shadow-sm">
          <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none font-semibold text-gray-800 text-sm [&::-webkit-details-marker]:hidden">
            <span>{f.q}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
            <p>{f.a}</p>
            {f.topics.length > 1 && (
              <p className="mt-2 text-[11px] text-gray-400">
                Also relevant to: {f.topics.filter((t) => t !== topic).map((t) => TOPIC_LABELS[t]).join(", ")}
              </p>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
