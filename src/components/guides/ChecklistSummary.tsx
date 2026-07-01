"use client";

// Optional, low-priority "case note entry" for the tick-list checklists.
// Collapsed by default. Builds a copyable summary of completed vs outstanding
// tasks from whatever is ticked, to paste into the record if useful.

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check, ClipboardList } from "lucide-react";

export function ChecklistSummary({
  title,
  completed,
  outstanding,
  patientName,
}: {
  title: string;
  completed: string[];
  outstanding: string[];
  patientName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const d = new Date();
  const date = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const text =
    (patientName ? `Patient: ${patientName}\n` : "") +
    `${title} - ${date}\n\n` +
    `Completed tasks: ${completed.length ? completed.join("; ") + "." : "none yet."}\n\n` +
    `Outstanding tasks: ${outstanding.length ? outstanding.join("; ") + "." : "none - all done."}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden print:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <ClipboardList className="w-4 h-4 text-gray-500" />
        <span className="font-bold text-gray-800 flex-1">Case note entry (optional)</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3">
          <p className="text-xs text-gray-500">
            A quick summary of what is ticked, to paste into the record if useful. It updates as you tick.
          </p>
          <div className="rounded-lg bg-slate-800 text-slate-100 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
            {text}
          </div>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-500 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
