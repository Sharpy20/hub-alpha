"use client";

import { useState } from "react";
import { Check, MousePointerClick, Info } from "lucide-react";

// A fictional but internally-consistent NHS (ESR-style) payslip used to teach
// the layout. Figures reconcile on the two checks a nurse could actually do:
// each enhancement line PAID x RATE = AMOUNT, and Total Payments - Total
// Deductions = Net Pay. STATIC on purpose - not wired to the band picker, so
// the slip stays self-consistent. All names and numbers are made up.
//
// Band 5 top of scale: £39,043 / 12 = £3,253.58 basic; rate £39,043 / 1955.357
// = £19.9672. Night +30% (12.00 paid hrs), Saturday +30% (3.30), Sunday +60%
// (6.60). Total payments £3,690.86; deductions £958.85; net £2,732.01.

interface Info { id: string; explain: string; }

interface Detail extends Info { label: string; value: string; }
interface Payment extends Info { label: string; wkd?: string; paid?: string; rate?: string; amount: string; total?: boolean; }
interface Deduction extends Info { label: string; amount: string; total?: boolean; }
interface Ytd extends Info { label: string; value: string; }

const DETAILS: Detail[] = [
  { id: "name", label: "Employee", value: "Sam Taylor", explain: "The name on the post. A fictional nurse - this whole payslip is made up." },
  { id: "assignment", label: "Assignment no.", value: "12345678", explain: "The reference Payroll works from - the one that identifies this specific post. Quote it in every query." },
  { id: "post", label: "Position", value: "Staff Nurse", explain: "Your job title. Should match the role you actually do." },
  { id: "band", label: "Band / point", value: "Band 5 - top", explain: "Your pay band and the point within it. If this is wrong, every pay figure below it will be wrong too - check it first." },
  { id: "hours", label: "Std hours", value: "37.50", explain: "Your contracted weekly hours. Part-time would show fewer, and Basic Pay would scale down to match." },
  { id: "salary", label: "Annual salary", value: "£39,043", explain: "Your full-time yearly salary. Divide by 12 to get the Basic Pay figure below." },
  { id: "taxcode", label: "Tax code", value: "1257L", explain: "Tells Payroll how much you can earn before tax. A wrong tax CODE will not fix itself - contact HMRC, not Payroll." },
  { id: "ni", label: "NI number", value: "AB 12 34 56 C", explain: "Your National Insurance number - how HMRC and the pension scheme track your contributions." },
];

const PAYMENTS: Payment[] = [
  { id: "basic", label: "Basic Pay", wkd: "162.50", amount: "3,253.58", explain: "Your annual salary (£39,043) divided by 12. Everything else on the slip builds on this - if it is wrong, stop and query it before looking at anything else. The 162.50 is your standard monthly hours." },
  { id: "night", label: "Night Duty ENH", wkd: "40.00", paid: "12.00", rate: "19.9672", amount: "239.61", explain: "Weekday nights at +30%, shown as 12 extra paid HOURS (not a higher rate). Self-check: 12.00 x £19.9672 = £239.61. WkD is the hours you worked; Paid is what the 30% turned into." },
  { id: "sat", label: "Saturday ENH", wkd: "11.00", paid: "3.30", rate: "19.9672", amount: "65.89", explain: "All Saturday hours at +30%. 11.00 x 30% = 3.30 extra paid hours. Check: 3.30 x £19.9672 = £65.89." },
  { id: "sun", label: "Sunday ENH", wkd: "11.00", paid: "6.60", rate: "19.9672", amount: "131.78", explain: "Sundays and bank holidays at +60% - double the night/Saturday rate. 11.00 x 60% = 6.60 extra hours. Check: 6.60 x £19.9672 = £131.78." },
  { id: "totpay", label: "Total Payments", amount: "3,690.86", total: true, explain: "Everything you earned this month before anything is taken off (your gross pay). The four lines above add up to this: 3,253.58 + 239.61 + 65.89 + 131.78 = £3,690.86." },
];

const DEDUCTIONS: Deduction[] = [
  { id: "pension", label: "NHS Pension 9.8%", amount: "318.85", explain: "Taken off BEFORE tax is worked out, so you get the tax relief automatically. The percentage is tiered by earnings and reviewed each April - a bigger figure is not automatically an error." },
  { id: "paye", label: "PAYE Tax", amount: "430.00", explain: "Income tax, driven by your tax code (1257L above). If it looks too high it often self-corrects over a month or two - the YTD box shows whether it has." },
  { id: "nic", label: "National Insurance", amount: "210.00", explain: "Your National Insurance contribution. Illustrative figure here - the real one depends on the current NI thresholds." },
  { id: "totded", label: "Total Deductions", amount: "958.85", total: true, explain: "Everything taken off this month: 318.85 + 430.00 + 210.00 = £958.85." },
];

const YTD: Ytd[] = [
  { id: "ytd-gross", label: "Gross pay", value: "14,763.44", explain: "Total earned since 6 April - useful for spotting errors building across the year rather than one month." },
  { id: "ytd-tax", label: "Tax paid", value: "1,720.00", explain: "Total tax since April. Watch this to check a high tax month has self-corrected." },
  { id: "ytd-pen", label: "Pension", value: "1,275.40", explain: "Your pension contributions so far this year." },
  { id: "ytd-nic", label: "NI", value: "840.00", explain: "Your National Insurance so far this year. Compare all four against your P60 in April." },
];

const NET = { id: "net", label: "NET PAY", value: "2,732.01", explain: "What actually lands in your bank. Total Payments £3,690.86 minus Total Deductions £958.85 = £2,732.01. That is the whole equation." };

const ALL: Info[] = [...DETAILS, ...PAYMENTS, ...DEDUCTIONS, ...YTD, NET];
const findInfo = (id: string) => ALL.find((r) => r.id === id);

export function PayslipDecoder() {
  const [selected, setSelected] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const pick = (id: string) => {
    setSelected(id);
    setVisited((v) => (v.has(id) ? v : new Set(v).add(id)));
  };

  const done = visited.size;
  const total = ALL.length;
  const sel = selected ? findInfo(selected) : null;
  const selLabel = sel && "label" in sel ? (sel as { label: string }).label : "";

  // Shared classes for a clickable payslip cell.
  const cell = (id: string, extra = "") =>
    `text-left transition-colors cursor-pointer ${selected === id ? "bg-nhs-blue/10 ring-1 ring-nhs-blue" : visited.has(id) ? "bg-emerald-50" : "hover:bg-slate-100"} ${extra}`;

  return (
    <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2 mb-1">
        <MousePointerClick className="w-5 h-5 text-nhs-blue" />
        <h3 className="font-bold text-slate-900">Payslip decoder</h3>
      </div>
      <p className="text-sm text-slate-600 mb-3">
        A made-up payslip for a Band 5 nurse, laid out like a real one. Tap any box to find
        out what it means - the figures all reconcile, so you can follow the self-checks.
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{done} of {total} decoded</span>
      </div>

      {/* Payslip - ESR style */}
      <div className="overflow-x-auto">
        <div className="min-w-[320px] bg-white border border-slate-300 rounded-lg overflow-hidden text-slate-800 shadow-sm">
          {/* Masthead */}
          <div className="bg-slate-800 text-white px-3 py-2 flex items-center justify-between">
            <span className="font-bold tracking-wide text-sm">PAYSLIP</span>
            <span className="text-[11px] text-slate-300">Example NHS Foundation Trust &bull; Pay date 25 Jul 2026 &bull; Month 04</span>
          </div>

          {/* Employee details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200">
            {DETAILS.map((d) => (
              <button key={d.id} onClick={() => pick(d.id)} aria-pressed={selected === d.id}
                className={cell(d.id, "px-3 py-2 border-r border-b border-slate-100")}>
                <span className="block text-[10px] uppercase tracking-wide text-slate-400">{d.label}</span>
                <span className="block text-sm font-semibold tabular-nums">{d.value}</span>
              </button>
            ))}
          </div>

          {/* Payments + deductions */}
          <div className="grid md:grid-cols-2 md:divide-x divide-slate-200">
            {/* Payments */}
            <div>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 px-3 py-1.5 bg-slate-100 text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                <span>Payments</span><span className="text-right">WkD</span><span className="text-right">Paid</span><span className="text-right">Amount</span>
              </div>
              {PAYMENTS.map((p) => (
                <button key={p.id} onClick={() => pick(p.id)} aria-pressed={selected === p.id}
                  className={cell(p.id, `w-full grid grid-cols-[1fr_auto_auto_auto] gap-x-2 px-3 py-1.5 text-sm border-t border-slate-100 tabular-nums ${p.total ? "font-bold bg-slate-50" : ""}`)}>
                  <span className="text-left flex items-center gap-1">
                    {visited.has(p.id) && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}{p.label}
                  </span>
                  <span className="text-right text-slate-500 w-12">{p.wkd ?? ""}</span>
                  <span className="text-right text-slate-500 w-12">{p.paid ?? ""}</span>
                  <span className="text-right w-20">£{p.amount}</span>
                </button>
              ))}
            </div>
            {/* Deductions */}
            <div>
              <div className="grid grid-cols-[1fr_auto] gap-x-2 px-3 py-1.5 bg-slate-100 text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                <span>Deductions</span><span className="text-right">Amount</span>
              </div>
              {DEDUCTIONS.map((d) => (
                <button key={d.id} onClick={() => pick(d.id)} aria-pressed={selected === d.id}
                  className={cell(d.id, `w-full grid grid-cols-[1fr_auto] gap-x-2 px-3 py-1.5 text-sm border-t border-slate-100 tabular-nums ${d.total ? "font-bold bg-slate-50" : ""}`)}>
                  <span className="text-left flex items-center gap-1">
                    {visited.has(d.id) && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}{d.label}
                  </span>
                  <span className="text-right w-20">£{d.amount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Year to date strip */}
          <div className="border-t border-slate-200">
            <div className="px-3 py-1.5 bg-slate-100 text-[10px] uppercase tracking-wide text-slate-500 font-semibold">Year to date (since 6 April)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {YTD.map((y) => (
                <button key={y.id} onClick={() => pick(y.id)} aria-pressed={selected === y.id}
                  className={cell(y.id, "px-3 py-2 border-r border-t border-slate-100")}>
                  <span className="block text-[10px] uppercase tracking-wide text-slate-400">{y.label}</span>
                  <span className="block text-sm font-semibold tabular-nums">£{y.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Net pay bar */}
          <button onClick={() => pick(NET.id)} aria-pressed={selected === NET.id}
            className={`w-full flex items-center justify-between px-3 py-3 border-t-2 border-slate-300 transition-colors ${selected === NET.id ? "bg-nhs-blue/10 ring-1 ring-nhs-blue" : visited.has(NET.id) ? "bg-emerald-50" : "bg-slate-800 hover:bg-slate-700"}`}>
            <span className={`font-bold tracking-wide flex items-center gap-1.5 ${selected === NET.id || visited.has(NET.id) ? "text-slate-900" : "text-white"}`}>
              {visited.has(NET.id) && <Check className="w-4 h-4 text-emerald-500" />}NET PAY
            </span>
            <span className={`font-bold text-lg tabular-nums ${selected === NET.id || visited.has(NET.id) ? "text-slate-900" : "text-white"}`}>£{NET.value}</span>
          </button>
        </div>
      </div>

      {/* Explanation panel */}
      <div className="mt-3 rounded-xl border border-nhs-blue/30 bg-nhs-blue/5 p-4 min-h-[76px]">
        {sel ? (
          <>
            <p className="font-bold text-nhs-dark-blue text-sm mb-1">{selLabel}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{sel.explain}</p>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-slate-500 italic">
            <Info className="w-4 h-4 flex-shrink-0" /> Tap any box on the payslip above to see what it means.
          </p>
        )}
      </div>

      {done === total && (
        <p className="mt-3 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" /> Whole payslip decoded. Now try the same on your own: PAID x RATE = AMOUNT on every enhancement line.
        </p>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Fictional example - made-up person and figures. Pension, tax and NI are illustrative;
        your own payslip is the source of truth. Payroll and HR do not use this tool.
      </p>
    </div>
  );
}
