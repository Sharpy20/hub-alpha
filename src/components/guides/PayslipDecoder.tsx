"use client";

import { useState } from "react";
import { Check, MousePointerClick } from "lucide-react";

// A fictional but internally-consistent NHS (ESR-style) payslip used to teach
// the layout. Figures reconcile on the two checks a nurse could actually do:
// each enhancement line PAID x RATE = AMOUNT, and Gross - Deductions = Net.
// STATIC on purpose - not wired to the band picker, so the slip stays
// self-consistent. All names and numbers are made up.
//
// Band 5 top of scale: £39,043 / 12 = £3,253.58 basic; rate £39,043 / 1955.357
// = £19.9672. Night +30% (12.00 paid hrs), Saturday +30% (3.30), Sunday +60%
// (6.60). Gross £3,690.86. Pension/tax/NI illustrative. Net £2,732.01.

interface Row {
  id: string;
  label: string;
  value: string;
  // Enhancement lines show the four ESR columns instead of a single value.
  cols?: { wkd: string; paid: string; rate: string; amount: string };
  explain: string;
  strong?: boolean;
}

interface Section {
  title: string;
  rows: Row[];
}

const SECTIONS: Section[] = [
  {
    title: "1. Your details",
    rows: [
      { id: "assignment", label: "Assignment no.", value: "12345678", explain: "The reference Payroll works from - not your payroll number for logging in, the one that identifies this specific post. Quote it in every query." },
      { id: "post", label: "Job title / Band", value: "Staff Nurse - Band 5 (top)", explain: "Your role and pay point. If the band or step is wrong here, every pay figure below it will be wrong too - so check this first." },
      { id: "hours", label: "Standard hours", value: "37.5 / week", explain: "Your contracted weekly hours. A part-time post would show fewer, and the basic pay would scale down to match." },
      { id: "taxcode", label: "Tax code", value: "1257L", explain: "Tells Payroll how much you can earn before tax. A wrong tax CODE will not fix itself - contact HMRC, not Payroll." },
    ],
  },
  {
    title: "2. Pay and allowances",
    rows: [
      { id: "basic", label: "Basic Pay", value: "£3,253.58", explain: "Your annual salary (£39,043) divided by 12. Everything else on the slip is built on top of this - if it is wrong, stop and query it before looking at anything else." },
      { id: "night", label: "Night Duty ENH", value: "", cols: { wkd: "40.00", paid: "12.00", rate: "19.9672", amount: "£239.61" }, explain: "Weekday nights at +30%, shown as 12 extra paid HOURS (not a higher rate). Self-check: 12.00 x £19.9672 = £239.61. WKD is the hours you worked; PAID is what the 30% turned into." },
      { id: "sat", label: "Saturday ENH", value: "", cols: { wkd: "11.00", paid: "3.30", rate: "19.9672", amount: "£65.89" }, explain: "All Saturday hours at +30%. 11.00 x 30% = 3.30 extra paid hours. Check: 3.30 x £19.9672 = £65.89." },
      { id: "sun", label: "Sunday ENH", value: "", cols: { wkd: "11.00", paid: "6.60", rate: "19.9672", amount: "£131.78" }, explain: "Sundays and bank holidays at +60% - double the night/Saturday rate. 11.00 x 60% = 6.60 extra hours. Check: 6.60 x £19.9672 = £131.78." },
      { id: "gross", label: "Gross Pay", value: "£3,690.86", strong: true, explain: "Everything you earned this month before anything is taken off. The four lines above add up to this: 3,253.58 + 239.61 + 65.89 + 131.78 = £3,690.86." },
    ],
  },
  {
    title: "3. Deductions",
    rows: [
      { id: "pension", label: "NHS Pension (9.8%)", value: "£318.85", explain: "Taken off BEFORE tax is worked out, so you get the tax relief automatically. The percentage is tiered by earnings and reviewed each April - a bigger figure is not automatically an error." },
      { id: "paye", label: "PAYE Tax", value: "£430.00", explain: "Income tax, driven by your tax code (1257L above). If it looks too high it often self-corrects over a month or two - the year-to-date block shows whether it has." },
      { id: "ni", label: "National Insurance", value: "£210.00", explain: "Your National Insurance contribution. Illustrative figure here - the real one depends on the current NI thresholds." },
      { id: "totded", label: "Total Deductions", value: "£958.85", strong: true, explain: "Everything taken off this month: 318.85 + 430.00 + 210.00 = £958.85." },
    ],
  },
  {
    title: "4. Year to date",
    rows: [
      { id: "ytd", label: "YTD gross / tax / pension", value: "£14,763 / £1,720 / £1,275", explain: "Running totals since 6 April. Useful for spotting an error building across the year rather than in one month, confirming arrears landed, and checking tax has self-corrected. Compare against your P60 in April." },
    ],
  },
  {
    title: "5. Net pay",
    rows: [
      { id: "net", label: "NET PAY", value: "£2,732.01", strong: true, explain: "What actually lands in your bank. Gross £3,690.86 minus deductions £958.85 = £2,732.01. That is the whole equation." },
    ],
  },
];

const ALL_IDS = SECTIONS.flatMap((s) => s.rows.map((r) => r.id));

export function PayslipDecoder() {
  const [open, setOpen] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const clickRow = (id: string) => {
    setOpen((cur) => (cur === id ? null : id));
    setVisited((v) => (v.has(id) ? v : new Set(v).add(id)));
  };

  const done = visited.size;
  const total = ALL_IDS.length;

  return (
    <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-slate-50 to-emerald-50 p-5">
      <div className="flex items-center gap-2 mb-1">
        <MousePointerClick className="w-5 h-5 text-emerald-700" />
        <h3 className="font-bold text-emerald-900">Payslip decoder</h3>
      </div>
      <p className="text-sm text-emerald-800 mb-3">
        A made-up payslip for a Band 5 nurse. Tap any line to find out what it means - the
        figures all reconcile, so you can follow the self-checks as you go.
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-2 bg-emerald-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-emerald-800 whitespace-nowrap">{done} of {total} decoded</span>
      </div>

      {/* Payslip card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden font-mono text-sm">
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
          <span className="font-bold tracking-wide">PAYSLIP</span>
          <span className="text-xs text-slate-300">Sam Taylor &bull; July 2026 &bull; fictional</span>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{section.title}</p>
            {section.rows.map((row) => {
              const isOpen = open === row.id;
              const seen = visited.has(row.id);
              return (
                <div key={row.id} className="border-t border-slate-100 first:border-t-0">
                  <button
                    onClick={() => clickRow(row.id)}
                    aria-expanded={isOpen}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${isOpen ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                  >
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${seen ? "bg-emerald-500" : "border border-slate-300"}`}>
                      {seen && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className={`flex-1 ${row.strong ? "font-bold text-slate-900" : "text-slate-700"}`}>{row.label}</span>
                    {row.cols ? (
                      <span className="text-right text-xs text-slate-600 tabular-nums hidden sm:block">
                        <span className="inline-block w-14">{row.cols.paid}</span>
                        <span className="inline-block w-16">{row.cols.rate}</span>
                        <span className="inline-block w-16 font-semibold text-slate-800">{row.cols.amount}</span>
                      </span>
                    ) : (
                      <span className={`text-right tabular-nums ${row.strong ? "font-bold text-slate-900" : "text-slate-700"}`}>{row.value}</span>
                    )}
                  </button>
                  {row.cols && (
                    <div className="px-4 pb-1 -mt-1 flex justify-end gap-3 text-[10px] uppercase tracking-wide text-slate-400 sm:hidden">
                      <span>Paid {row.cols.paid}</span>
                      <span>Rate {row.cols.rate}</span>
                      <span className="font-semibold text-slate-600">{row.cols.amount}</span>
                    </div>
                  )}
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 text-sm font-sans text-slate-600 leading-relaxed bg-emerald-50/50">
                      {row.cols && (
                        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                          WKD {row.cols.wkd} &bull; PAID/DUE {row.cols.paid} &bull; RATE £{row.cols.rate} &bull; AMOUNT {row.cols.amount}
                        </p>
                      )}
                      <p>{row.explain}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {done === total && (
        <p className="mt-3 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" /> Whole payslip decoded. Now the self-check on your own: PAID/DUE x RATE = AMOUNT on every enhancement line.
        </p>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Fictional example - made-up person and figures. Pension, tax and NI are illustrative;
        your own payslip is the source of truth. Payroll and HR do not use this tool.
      </p>
    </div>
  );
}
