"use client";

import { useState } from "react";
import { Clock, Moon, Sun, AlertTriangle, CheckCircle } from "lucide-react";
import { HOURS_PER_YEAR, PAY_BANDS, gbp } from "@/lib/data/guides/pay-scales";
import { usePayBand } from "@/lib/hooks/usePayBand";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const NIGHT_START = 20 * 60; // 20:00
const NIGHT_END = 6 * 60;    // 06:00
const MIN_REST = 11 * 60;    // 11 hours

// One minute of the shift, categorised by the AfC Section 2 windows.
type MinuteCategory = "plain" | "night" | "sunday";

function toMinutes(t: string): number | null {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]), mm = Number(m[2]);
  if (h > 23 || mm > 59) return null;
  return h * 60 + mm;
}

function fmtHours(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m.toString().padStart(2, "0")}m`;
}

function fmtClock(mins: number): string {
  const h = Math.floor((mins % 1440) / 60), m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function ShiftChecker() {
  const { bandIdx, stepIdx, band, step, select } = usePayBand();
  const [dayIdx, setDayIdx] = useState(0);       // 0 = Monday
  const [isPH, setIsPH] = useState(false);       // start day is a public holiday
  const [start, setStart] = useState("19:30");
  const [end, setEnd] = useState("07:45");
  const [breakMins, setBreakMins] = useState(0);
  const [nextStart, setNextStart] = useState("");

  const startMin = toMinutes(start);
  const endMinRaw = toMinutes(end);
  const hourly = step ? step.annual / HOURS_PER_YEAR : 0;

  let result: null | {
    totalMins: number; paidMins: number;
    plain: number; night: number; sunday: number;
    wholeShift: boolean; crossesMidnight: boolean;
  } = null;

  if (startMin !== null && endMinRaw !== null && endMinRaw !== startMin) {
    const endMin = endMinRaw <= startMin ? endMinRaw + 1440 : endMinRaw;
    const totalMins = endMin - startMin;
    let plain = 0, night = 0, sunday = 0;
    for (let m = startMin; m < endMin; m++) {
      const dayOffset = m < 1440 ? 0 : 1;
      const tod = m % 1440;
      const dow = (dayIdx + dayOffset) % 7; // 5 = Saturday, 6 = Sunday
      const ph = isPH && dayOffset === 0;   // PH flag applies to the start day
      if (ph || dow === 6) sunday++;
      else if (dow === 5) night++;          // all Saturday hours take the night/Sat rate
      else if (tod >= NIGHT_START || tod < NIGHT_END) night++;
      else plain++;
    }
    // Whole-shift rule (TCS Section 2 para 2.11): a weekday shift with MORE
    // than half its time in the unsocial windows is enhanced for the whole
    // shift - so any remaining plain time is upgraded to the night rate.
    let wholeShift = false;
    if (plain > 0 && night + sunday > totalMins / 2) {
      night += plain;
      plain = 0;
      wholeShift = true;
    }
    const paidMins = Math.max(totalMins - breakMins, 0);
    result = { totalMins, paidMins, plain, night, sunday, wholeShift, crossesMidnight: endMinRaw <= startMin };
  }

  // Unpaid break: knocked off the plain-time share first (breaks on long days
  // usually fall in the daytime), then night, then Sunday/PH.
  let payablePlain = 0, payableNight = 0, payableSunday = 0;
  if (result) {
    let toRemove = Math.min(breakMins, result.totalMins);
    const takeFrom = (v: number) => { const t = Math.min(v, toRemove); toRemove -= t; return v - t; };
    payablePlain = takeFrom(result.plain);
    payableNight = takeFrom(result.night);
    payableSunday = takeFrom(result.sunday);
  }

  // Rest gap to the next shift: the next occurrence of nextStart after this
  // shift ends (same day if still ahead of the finish time, otherwise next day).
  const nextMin = toMinutes(nextStart);
  let rest: null | { gap: number; ok: boolean; earliest: number } = null;
  if (result && nextMin !== null) {
    const endAbs = startMin! + result.totalMins;
    const endTod = endAbs % 1440;
    const candidate = nextMin > endTod ? endAbs - endTod + nextMin : endAbs - endTod + 1440 + nextMin;
    const gap = candidate - endAbs;
    rest = { gap, ok: gap >= MIN_REST, earliest: endAbs + MIN_REST };
  }

  const extraNightHrs = band ? (payableNight / 60) * band.night : 0;
  const extraSundayHrs = band ? (payableSunday / 60) * band.sunday : 0;
  const basicPay = hourly * ((result?.paidMins ?? 0) / 60);
  const enhancementPay = hourly * (extraNightHrs + extraSundayHrs);

  return (
    <div className="mt-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-indigo-700" />
        <h3 className="font-bold text-indigo-900">Shift checker</h3>
      </div>
      <p className="text-sm text-indigo-800 mb-3">
        Enter a shift and see which enhancement windows it hits, whether the whole-shift
        rule applies, what it roughly pays at your band - and whether the gap to your next
        shift is legal.
      </p>
      <div className="flex items-start gap-2 px-3 py-2.5 mb-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
        <span className="font-bold flex-shrink-0" aria-hidden="true">!</span>
        <p>
          <strong>Payroll and HR do not use this checker.</strong> It is a good-faith estimate
          from the national rules - real payslips can differ (arrears, local agreements, break
          handling). Always check your own payslip and ask Payroll about anything that matters.
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Day the shift starts">
        {DAYS.map((d, i) => (
          <button key={d} onClick={() => setDayIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              dayIdx === i ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-indigo-800 border-indigo-200 hover:border-indigo-400"
            }`}>
            {d.slice(0, 3)}
          </button>
        ))}
        <label className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${isPH ? "bg-purple-600 text-white border-purple-600" : "bg-white text-purple-800 border-purple-200 hover:border-purple-400"}`}>
          <input type="checkbox" checked={isPH} onChange={(e) => setIsPH(e.target.checked)} className="sr-only" />
          Bank holiday
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Shift starts</span>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)}
            className="mt-0.5 w-full px-2 py-1.5 border border-indigo-200 rounded-lg text-sm bg-white" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Shift ends</span>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)}
            className="mt-0.5 w-full px-2 py-1.5 border border-indigo-200 rounded-lg text-sm bg-white" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Unpaid break</span>
          <select value={breakMins} onChange={(e) => setBreakMins(Number(e.target.value))}
            className="mt-0.5 w-full px-2 py-1.5 border border-indigo-200 rounded-lg text-sm bg-white">
            <option value={0}>None</option>
            {Array.from({ length: 24 }, (_, i) => (i + 1) * 5).map((m) => {
              const h = Math.floor(m / 60), mm = m % 60;
              const label = m < 60 ? `${m} minutes` : mm === 0 ? `${h} hour${h > 1 ? "s" : ""}` : `${h}h ${mm}m`;
              return <option key={m} value={m}>{label}</option>;
            })}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Next shift starts (optional)</span>
          <input type="time" value={nextStart} onChange={(e) => setNextStart(e.target.value)}
            className="mt-0.5 w-full px-2 py-1.5 border border-indigo-200 rounded-lg text-sm bg-white" />
        </label>
      </div>

      {result ? (
        <div className="space-y-3">
          {/* Enhancement split */}
          <div className="bg-white rounded-xl p-4 border border-indigo-100">
            <p className="font-bold text-gray-900 text-sm mb-2">
              {DAYS[dayIdx]} {start} to {end}{result.crossesMidnight ? ` (${DAYS[(dayIdx + 1) % 7]})` : ""} -
              {" "}{fmtHours(result.totalMins)} shift{breakMins ? `, ${fmtHours(result.paidMins)} paid` : ""}
            </p>
            <div className="space-y-1.5 text-sm text-gray-700">
              {payablePlain > 0 && (
                <p className="flex items-center gap-2"><Sun className="w-4 h-4 text-amber-500 flex-shrink-0" /> {fmtHours(payablePlain)} plain time</p>
              )}
              {payableNight > 0 && (
                <p className="flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-500 flex-shrink-0" /> {fmtHours(payableNight)} at the night/Saturday rate{band ? ` (+${Math.round(band.night * 100)}%)` : ""}</p>
              )}
              {payableSunday > 0 && (
                <p className="flex items-center gap-2"><Sun className="w-4 h-4 text-purple-500 flex-shrink-0" /> {fmtHours(payableSunday)} at the Sunday/bank holiday rate{band ? ` (+${Math.round(band.sunday * 100)}%)` : ""}</p>
              )}
            </div>
            {result.wholeShift && (
              <p className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                <strong>Whole-shift rule applies:</strong> more than half of this weekday shift falls in the
                unsocial windows, so the WHOLE shift is enhanced - including the daytime tail
                (Section 2 para 2.11).
              </p>
            )}
          </div>

          {/* Pay estimate */}
          <div className="bg-white rounded-xl p-4 border border-indigo-100">
            {band && step ? (
              <>
                <p className="font-bold text-gray-900 text-sm mb-1">Rough pay at Band {band.band}, {step.label.toLowerCase()}</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>{fmtHours(result.paidMins)} basic at {gbp(hourly, 4)} = <strong>{gbp(basicPay)}</strong></p>
                  {(extraNightHrs > 0 || extraSundayHrs > 0) && (
                    <p>Enhancements: {(extraNightHrs + extraSundayHrs).toFixed(2)} extra paid hours = <strong>{gbp(enhancementPay)}</strong></p>
                  )}
                  <p className="font-bold text-indigo-900">Shift total (before tax and deductions): {gbp(basicPay + enhancementPay)}</p>
                </div>
              </>
            ) : (
              <>
                <p className="font-bold text-gray-900 text-sm mb-2">Pick your band to see the money</p>
                <div className="flex flex-wrap gap-1.5">
                  {PAY_BANDS.map((b, i) => (
                    <button key={b.band} onClick={() => select(i, 0)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-white text-indigo-800 border-indigo-200 hover:border-indigo-400">
                      Band {b.band}
                    </button>
                  ))}
                </div>
              </>
            )}
            {band && band.steps.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {band.steps.map((s, i) => (
                  <button key={s.label} onClick={() => select(bandIdx as number, i)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      stepIdx === i ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-indigo-800 border-indigo-200 hover:border-indigo-400"
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rest check */}
          {rest && (
            <div className={`rounded-xl p-4 border ${rest.ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              {rest.ok ? (
                <p className="flex items-start gap-2 text-sm text-emerald-900">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                  <span><strong>{fmtHours(rest.gap)} rest before the next shift</strong> - meets the 11-hour minimum.</span>
                </p>
              ) : (
                <p className="flex items-start gap-2 text-sm text-red-900">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>
                    <strong>Only {fmtHours(rest.gap)} rest - below the 11-hour legal minimum.</strong>{" "}
                    The earliest compliant start after this shift is {fmtClock(rest.earliest)}. Daily rest
                    cannot be opted out of - as a routine pattern this needs raising with the roster lead.
                  </span>
                </p>
              )}
            </div>
          )}

          <p className="text-[11px] text-indigo-700/70">
            Estimate only. Assumes the bank holiday flag applies to the start day, unpaid breaks come
            out of daytime hours first, and enhancements show on the payslip as extra paid hours (not
            a boosted rate). Overtime and bank-shift rates are different - see the earlier steps.
          </p>
        </div>
      ) : (
        <p className="text-sm text-indigo-700 italic">Enter a start and end time to check a shift.</p>
      )}
    </div>
  );
}
