"use client";

import { useState, useContext, createContext, type ReactNode } from "react";
import { Check, MousePointerClick, Info } from "lucide-react";

// A fictional but internally-consistent NHS (ESR) payslip used to teach the
// standard layout. Every teachable box is clickable; its explanation shows in
// the panel below. STATIC on purpose - not wired to the band picker, so the
// slip stays self-consistent. All names and numbers are made up.
//
// Band 5 top of scale £39,043. Basic = 39,043 / 12 = £3,253.58. Rate £19.9672.
// Night +30% (12.00 paid hrs), Saturday +30% (3.30), Sunday +60% (6.60).
// Total payments £3,690.86. NHS Pension 9.8% of pensionable pay = £361.70.
// Taxable pay = gross - pension = £3,329.16. Deductions £1,001.70. Net £2,689.16.

const EXPLAIN: Record<string, string> = {
  assignment: "Assignment Number - identifies this specific post. Your main post has no suffix (there is no -1); a second employment with the Trust - usually a bank contract - shows as -2. Quote it in every pay query.",
  jobtitle: "Your job title - it should match the role you actually do.",
  payscale: "Payscale Description - the band and pay point you are paid on. If this is wrong, the pay figures below will be wrong too, so check it first.",
  stdhrs: "Standard Hours - your contracted hours a week. Part-time shows fewer, and the pay scales down to match.",
  salwage: "Sal/Wage - your full-time annual salary. Part-timers see a pro-rata figure. Divide it by 12 to get Basic Pay.",
  taxcode: "Tax Code - tells Payroll how much you can earn before tax. A wrong tax CODE will not self-correct: contact HMRC, not Payroll.",
  ninumber: "Your National Insurance number - how HMRC and the pension scheme track your contributions.",
  taxoffref: "Tax Office Reference - identifies which HMRC office holds your record. Handy to have when you ring them.",
  basic: "Basic Pay = annual salary divided by 12 (£39,043 / 12 = £3,253.58). Everything else builds on it. Unlike the enhancements, it is a straight monthly slice, not hours x rate.",
  night: "Weekday nights at +30%, shown as 12 extra paid HOURS - not a higher rate. Self-check: PAID/DUE 12.00 x RATE £19.9672 = £239.61. WKD/EARNED is the hours you worked; PAID/DUE is what the 30% turned into.",
  sat: "All Saturday hours at +30%. 11.00 x 30% = 3.30 extra paid hours. Check: 3.30 x £19.9672 = £65.89.",
  sun: "Sundays and bank holidays at +60% - double the night rate. 11.00 x 60% = 6.60 extra hours. Check: 6.60 x £19.9672 = £131.78.",
  paye: "PAYE - income tax, set by your tax code. If it looks high it often self-corrects over a month or two; the Year To Date balances show whether it has.",
  ni: "National Insurance contribution. The 'A' is your NI category letter - it sets the rate you pay.",
  pension: "NHS Pension at 9.8% of pensionable pay (£3,690.86 x 9.8% = £361.70). Taken off BEFORE tax is worked out, so you get the tax relief automatically. The rate is tiered by earnings and reviewed each April.",
  ytdgross: "Year To Date GROSS PAY - everything earned since 6 April, this job only. Good for spotting an error building across the year rather than in one month.",
  ytdpen: "Year To Date pension contributions - what you have paid into the scheme so far this year. Check it against your annual benefit statement.",
  taxablepay: "Taxable Pay = gross minus your pension (£3,690.86 - £361.70 = £3,329.16). You are taxed AFTER pension comes off - that is the automatic tax relief in action.",
  totalpay: "Total Payments - your gross for the month. The four Pay and Allowance lines add up to this: 3,253.58 + 239.61 + 65.89 + 131.78 = £3,690.86.",
  totalded: "Total Deductions - pension + tax + NI: 361.70 + 430.00 + 210.00 = £1,001.70.",
  netpay: "Net Pay - what actually lands in your bank. Total Payments £3,690.86 minus Total Deductions £1,001.70 = £2,689.16.",
};

const LABELS: Record<string, string> = {
  assignment: "Assignment Number", jobtitle: "Job Title", payscale: "Payscale Description",
  stdhrs: "Standard Hours", salwage: "Sal / Wage", taxcode: "Tax Code", ninumber: "NI Number",
  taxoffref: "Tax Office Ref", basic: "Basic Pay", night: "Night Duty 30%", sat: "Saturday EN",
  sun: "Sunday EN", paye: "PAYE", ni: "NI A", pension: "NHS Pension 9.8%",
  ytdgross: "YTD Gross Pay", ytdpen: "YTD Pension", taxablepay: "Taxable Pay",
  totalpay: "Total Payments", totalded: "Total Deductions", netpay: "Net Pay",
};

const TOTAL = Object.keys(EXPLAIN).length;

// The four building blocks below live at module scope on purpose. They used to
// be declared inside PayslipDecoder, which gave them a fresh identity on every
// render, so React threw away and rebuilt every box each time state changed
// instead of updating it (eslint: react-hooks/static-components).
//
// They need the decoder's state, and threading it through 36 call sites would
// bury the payslip layout in plumbing, so it arrives by context instead. Call
// sites read exactly as they did.
interface DecoderCtx {
  selected: string | null;
  visited: Set<string>;
  pick: (id: string) => void;
  boxCls: (id: string) => string;
}

const DecoderContext = createContext<DecoderCtx | null>(null);

function useDecoder(): DecoderCtx {
  const ctx = useContext(DecoderContext);
  if (!ctx) throw new Error("Payslip decoder parts must render inside PayslipDecoder");
  return ctx;
}

// A clickable/teachable header cell (label on top, value below). Static cells
// (no id) pass their own label; teachable cells take it from LABELS.
const Cell = ({ id, value, label: staticLabel, cls = "" }: { id?: string; value: ReactNode; label?: string; cls?: string }) => {
  const { selected, visited, pick, boxCls } = useDecoder();
  const teach = id && EXPLAIN[id];
  const label = id ? LABELS[id] : staticLabel ?? "";
  const inner = (
    <>
      {label && <span className="block text-[9px] uppercase tracking-wide text-slate-600 leading-tight">{label}</span>}
      <span className="block text-[13px] font-semibold tabular-nums leading-tight flex items-center gap-1">
        {id && visited.has(id) && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}{value}
      </span>
    </>
  );
  if (!teach) return <div className={`px-2 py-1.5 ${cls}`}>{inner}</div>;
  return (
    <button onClick={() => pick(id!)} aria-pressed={selected === id} className={`px-2 py-1.5 text-left w-full transition-colors ${boxCls(id!)} ${cls}`}>{inner}</button>
  );
};

// A clickable Pay and Allowance line (5 columns).
const PayLine = ({ id, wkd, paid, rate, amount, strong }: { id: string; wkd?: string; paid?: string; rate?: string; amount: string; strong?: boolean }) => {
  const { selected, visited, pick, boxCls } = useDecoder();
  return (
    <button onClick={() => pick(id)} aria-pressed={selected === id}
      className={`w-full grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] px-2 py-1 text-[12px] tabular-nums border-t border-slate-200 transition-colors ${boxCls(id)} ${strong ? "font-bold bg-slate-50" : ""}`}>
      <span className="text-left flex items-center gap-1">{visited.has(id) && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}{LABELS[id]}</span>
      <span className="text-right text-slate-500">{wkd ?? ""}</span>
      <span className="text-right text-slate-500">{paid ?? ""}</span>
      <span className="text-right text-slate-500">{rate ?? ""}</span>
      <span className="text-right">{amount}</span>
    </button>
  );
};

// A clickable Deductions line (3 columns: description / amount / balance c/f).
const DedLine = ({ id, amount, strong }: { id: string; amount: string; strong?: boolean }) => {
  const { selected, visited, pick, boxCls } = useDecoder();
  return (
    <button onClick={() => pick(id)} aria-pressed={selected === id}
      className={`w-full grid grid-cols-[1.4fr_1fr_1fr] px-2 py-1 text-[12px] tabular-nums border-t border-slate-200 transition-colors ${boxCls(id)} ${strong ? "font-bold bg-slate-50" : ""}`}>
      <span className="text-left flex items-center gap-1">{visited.has(id) && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}{LABELS[id]}</span>
      <span className="text-right">{amount}</span>
      <span className="text-right text-slate-600"></span>
    </button>
  );
};

// A small labelled figure in the bottom summary grids.
const Fig = ({ id, label, value }: { id?: string; label: string; value: string }) => {
  const { selected, visited, pick, boxCls } = useDecoder();
  const teach = id && EXPLAIN[id];
  const body = (
    <>
      <span className="text-slate-500">{label}</span>
      <span className="text-right tabular-nums font-medium flex items-center justify-end gap-1">{id && visited.has(id) && <Check className="w-3 h-3 text-emerald-500" />}{value}</span>
    </>
  );
  if (!teach) return <div className="grid grid-cols-[1fr_auto] gap-x-2 px-2 py-0.5">{body}</div>;
  return <button onClick={() => pick(id!)} aria-pressed={selected === id} className={`grid grid-cols-[1fr_auto] gap-x-2 px-2 py-0.5 w-full text-left transition-colors ${boxCls(id!)}`}>{body}</button>;
};

export function PayslipDecoder() {
  const [selected, setSelected] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const pick = (id: string) => {
    setSelected(id);
    setVisited((v) => (v.has(id) ? v : new Set(v).add(id)));
  };

  const done = visited.size;

  const boxCls = (id: string) =>
    selected === id ? "bg-nhs-blue/10 ring-1 ring-inset ring-nhs-blue" : visited.has(id) ? "bg-emerald-50" : "hover:bg-slate-100";

  const sel = selected;

  return (
    <DecoderContext.Provider value={{ selected, visited, pick, boxCls }}>
    <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-1">
        <MousePointerClick className="w-5 h-5 text-nhs-blue" />
        <h3 className="font-bold text-slate-900">Payslip decoder</h3>
      </div>
      <p className="text-sm text-slate-600 mb-3">
        A made-up payslip for a Band 5 nurse, in the standard NHS layout. Tap any box to find
        out what it means - the figures all reconcile, so you can follow the self-checks.
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(done / TOTAL) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{done} of {TOTAL} decoded</span>
      </div>

      {/* Payslip - ESR layout, scrolls sideways on narrow screens */}
      <div className="overflow-x-auto">
        <div className="min-w-[660px] bg-white border border-slate-400 text-slate-800 shadow-sm">

          {/* Header rows */}
          <div className="grid grid-cols-3 divide-x divide-slate-300 border-b border-slate-300">
            <Cell id="assignment" value="12345678" />
            <Cell label="Employee Name" value="SAM TAYLOR" />
            <Cell label="Location" value="St Example Hospital" />
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-300 border-b border-slate-300">
            <Cell label="Department" value="Byron Ward" />
            <Cell id="jobtitle" value="Staff Nurse" />
            <Cell id="payscale" value="Nurse Band 5" />
          </div>
          <div className="flex divide-x divide-slate-300 border-b border-slate-300">
            <div className="w-24 flex items-center justify-center bg-nhs-blue flex-shrink-0">
              <span className="text-white font-extrabold italic text-xl tracking-tight">NHS</span>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-4 divide-x divide-slate-300 border-b border-slate-300">
                <Cell id="salwage" value="39043.00" />
                <Cell label="Inc. Date" value="-" />
                <Cell id="stdhrs" value="37.50" />
                <Cell label="Sal / Wage" value="39043.00" />
              </div>
              <div className="grid grid-cols-4 divide-x divide-slate-300">
                <Cell label="Tax Office Name" value="SUSSEX AREA" />
                <Cell id="taxoffref" value="334/CW2054" />
                <Cell id="taxcode" value="1257L" />
                <Cell id="ninumber" value="AB123456A" />
              </div>
            </div>
          </div>

          {/* Pay + Deductions */}
          <div className="grid grid-cols-2 border-b border-slate-400 divide-x-2 divide-slate-400">
            {/* Pay and allowance */}
            <div>
              <div className="px-2 py-1 bg-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Pay and Allowance <span className="normal-case font-normal">(- = minus amount)</span></div>
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] px-2 py-0.5 text-[8.5px] uppercase text-slate-600 font-semibold tracking-wide">
                <span>Description</span><span className="text-right">Wkd/Earned</span><span className="text-right">Paid/Due</span><span className="text-right">Rate</span><span className="text-right">Amount</span>
              </div>
              <PayLine id="basic" wkd="162.95" paid="162.95" amount="3253.58" />
              <PayLine id="night" wkd="40.00" paid="12.00" rate="19.9672" amount="239.61" />
              <PayLine id="sat" wkd="11.00" paid="3.30" rate="19.9672" amount="65.89" />
              <PayLine id="sun" wkd="11.00" paid="6.60" rate="19.9672" amount="131.78" />
              <PayLine id="totalpay" amount="3690.86" strong />
            </div>
            {/* Deductions */}
            <div>
              <div className="px-2 py-1 bg-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Deductions <span className="normal-case font-normal">(R indicates refund)</span></div>
              <div className="grid grid-cols-[1.4fr_1fr_1fr] px-2 py-0.5 text-[8.5px] uppercase text-slate-600 font-semibold tracking-wide">
                <span>Description</span><span className="text-right">Amount</span><span className="text-right">Balance C/F</span>
              </div>
              <DedLine id="pension" amount="361.70" />
              <DedLine id="paye" amount="430.00" />
              <DedLine id="ni" amount="210.00" />
              <DedLine id="totalded" amount="1001.70" strong />
            </div>
          </div>

          {/* Year to date + This period summary */}
          <div className="grid grid-cols-2 divide-x-2 divide-slate-400 text-[11px]">
            <div>
              <div className="px-2 py-1 bg-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-600">Year To Date Balances (this employment only)</div>
              <Fig id="ytdgross" label="Gross Pay" value="18,454.30" />
              <Fig label="Taxable Pay" value="16,645.80" />
              <Fig label="Tax Paid" value="2,150.00" />
              <Fig label="Pensionable Pay" value="18,454.30" />
              <Fig id="ytdpen" label="Pension Conts" value="1,808.52" />
              <Fig label="NI Conts" value="1,050.00" />
              <Fig label="SD Ref Number" value="87654321" />
            </div>
            <div>
              <div className="px-2 py-1 bg-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-600">This Period Summary</div>
              <Fig label="Pensionable Pay" value="3,690.86" />
              <Fig id="taxablepay" label="Taxable Pay" value="3,329.16" />
              <Fig label="Tax Period" value="5 (Monthly)" />
              <Fig label="Period End Date" value="31 Jul 2026" />
              <Fig label="Pay Date" value="25 Jul 2026" />
              <Fig label="Pay Method" value="BACS" />
              <button onClick={() => pick("netpay")} aria-pressed={selected === "netpay"}
                className={`w-full flex items-center justify-between px-2 py-2 mt-0.5 border-t-2 border-slate-400 transition-colors ${selected === "netpay" ? "bg-nhs-blue/10 ring-1 ring-inset ring-nhs-blue" : visited.has("netpay") ? "bg-emerald-50" : "bg-slate-800 hover:bg-slate-700"}`}>
                <span className={`font-bold tracking-wide flex items-center gap-1.5 ${selected === "netpay" || visited.has("netpay") ? "text-slate-900" : "text-white"}`}>
                  {visited.has("netpay") && <Check className="w-4 h-4 text-emerald-500" />}NET PAY
                </span>
                <span className={`font-bold text-base tabular-nums ${selected === "netpay" || visited.has("netpay") ? "text-slate-900" : "text-white"}`}>£2,689.16</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation panel */}
      <div className="mt-3 rounded-xl border border-nhs-blue/30 bg-nhs-blue/5 p-4 min-h-[76px]">
        {sel ? (
          <>
            <p className="font-bold text-nhs-dark-blue text-sm mb-1">{LABELS[sel]}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{EXPLAIN[sel]}</p>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-slate-600 italic">
            <Info className="w-4 h-4 flex-shrink-0" /> Tap any box on the payslip above to see what it means.
          </p>
        )}
      </div>

      {done === TOTAL && (
        <p className="mt-3 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4" /> Whole payslip decoded. Now try the same on your own: PAID/DUE x RATE = AMOUNT on every enhancement line.
        </p>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Fictional example - made-up person and figures. Pension, tax and NI are illustrative;
        your own payslip is the source of truth. Payroll and HR do not use this tool.
      </p>
    </div>
    </DecoderContext.Provider>
  );
}
