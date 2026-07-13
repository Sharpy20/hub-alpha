"use client";

import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";

// NHS Agenda for Change pay scales, England, effective 1 April 2026.
// Source: NHS Employers pay scales 2026/27. Scales change every April -
// update the figures (and EFFECTIVE_FROM) when the new pay circular lands.
// Hourly rate uses the ESR divisor: 37.5 hrs x 52.143 weeks = 1955.36 hrs/year.
const EFFECTIVE_FROM = "1 April 2026";
const HOURS_PER_YEAR = 1955.357;

interface PayStep {
  label: string;
  annual: number;
}

interface PayBand {
  band: string;
  // Unsocial hours enhancement rates (AfC Section 2, England):
  // night = weekday nights 20:00-06:00 + all Saturday; sunday = all Sunday + public holidays.
  night: number;
  sunday: number;
  overtimeEligible: boolean;
  steps: PayStep[];
}

const PAY_BANDS: PayBand[] = [
  { band: "2", night: 0.41, sunday: 0.83, overtimeEligible: true, steps: [
    { label: "All steps (single pay point)", annual: 25272 },
  ]},
  { band: "3", night: 0.35, sunday: 0.69, overtimeEligible: true, steps: [
    { label: "Entry (first 2 years)", annual: 25760 },
    { label: "Top (2+ years)", annual: 27476 },
  ]},
  { band: "4", night: 0.30, sunday: 0.60, overtimeEligible: true, steps: [
    { label: "Entry (first 3 years)", annual: 28392 },
    { label: "Top (3+ years)", annual: 31157 },
  ]},
  { band: "5", night: 0.30, sunday: 0.60, overtimeEligible: true, steps: [
    { label: "Entry (first 2 years)", annual: 32073 },
    { label: "Intermediate (2-4 years)", annual: 34592 },
    { label: "Top (4+ years)", annual: 39043 },
  ]},
  { band: "6", night: 0.30, sunday: 0.60, overtimeEligible: true, steps: [
    { label: "Entry (first 2 years)", annual: 39959 },
    { label: "Intermediate (2-5 years)", annual: 42170 },
    { label: "Top (5+ years)", annual: 48117 },
  ]},
  { band: "7", night: 0.30, sunday: 0.60, overtimeEligible: true, steps: [
    { label: "Entry (first 2 years)", annual: 49387 },
    { label: "Intermediate (2-5 years)", annual: 51932 },
    { label: "Top (5+ years)", annual: 56515 },
  ]},
  { band: "8a", night: 0.30, sunday: 0.60, overtimeEligible: false, steps: [
    { label: "Entry (first 2 years)", annual: 57528 },
    { label: "Intermediate (2-5 years)", annual: 60417 },
    { label: "Top (5+ years)", annual: 64750 },
  ]},
];

const STORAGE_KEY = "wardhub_pay_band";

const gbp = (n: number, dp = 2) =>
  n.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: dp, maximumFractionDigits: dp });

export function PayBandPicker() {
  const [bandIdx, setBandIdx] = useState<number | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  // Remember the selection per device so revisits (and other steps) keep it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { b, s } = JSON.parse(saved);
        if (typeof b === "number" && PAY_BANDS[b] && typeof s === "number" && PAY_BANDS[b].steps[s]) {
          setBandIdx(b);
          setStepIdx(s);
        }
      }
    } catch { /* corrupt value - start fresh */ }
  }, []);

  const select = (b: number, s: number) => {
    setBandIdx(b);
    setStepIdx(s);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ b, s })); } catch { /* private mode */ }
  };

  const band = bandIdx !== null ? PAY_BANDS[bandIdx] : null;
  const step = band ? band.steps[Math.min(stepIdx, band.steps.length - 1)] : null;
  const hourly = step ? step.annual / HOURS_PER_YEAR : 0;
  const nightExtraHours = band ? 10 * band.night : 0;
  const sundayExtraHours = band ? 10 * band.sunday : 0;

  return (
    <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-5 h-5 text-emerald-700" />
        <h3 className="font-bold text-emerald-900">Your band, your numbers</h3>
      </div>
      <p className="text-sm text-emerald-800 mb-4">
        Pick your band and pay step and the examples below recalculate with your rates.
        Full-time figures, England, effective {EFFECTIVE_FROM} - part-time staff have the
        same hourly rate, so everything except the monthly basic still applies. Always go
        by your own payslip and contract.
      </p>

      <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Choose your pay band">
        {PAY_BANDS.map((b, i) => (
          <button key={b.band} onClick={() => select(i, 0)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
              bandIdx === i
                ? "bg-emerald-600 text-white border-emerald-600 shadow"
                : "bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400"
            }`}>
            Band {b.band}
          </button>
        ))}
      </div>

      {band && (
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Choose your pay step">
          {band.steps.map((s, i) => (
            <button key={s.label} onClick={() => select(bandIdx as number, i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                stepIdx === i || (band.steps.length === 1 && i === 0)
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-teal-800 border-teal-200 hover:border-teal-400"
              }`}>
              {s.label} - {gbp(s.annual, 0)}
            </button>
          ))}
        </div>
      )}

      {band && step ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Annual salary</p>
              <p className="text-lg font-bold text-gray-900">{gbp(step.annual, 0)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Basic pay / month</p>
              <p className="text-lg font-bold text-gray-900">{gbp(step.annual / 12)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Hourly rate</p>
              <p className="text-lg font-bold text-gray-900">{gbp(hourly, 4)}</p>
              <p className="text-[11px] text-gray-500">the RATE on your payslip</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Your enhancement rates</p>
              <p className="text-sm font-bold text-gray-900">+{Math.round(band.night * 100)}% nights &amp; Sat</p>
              <p className="text-sm font-bold text-gray-900">+{Math.round(band.sunday * 100)}% Sun &amp; bank hol</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-100">
            <p className="font-bold text-gray-900 text-sm mb-2">Worked example: 10 night hours at your rate</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>10 hours x {Math.round(band.night * 100)}% = <strong>{nightExtraHours.toFixed(2)} extra paid hours</strong> (the PAID/DUE figure)</p>
              <p>{nightExtraHours.toFixed(2)} hours x {gbp(hourly, 4)} = <strong>{gbp(nightExtraHours * hourly)}</strong> enhancement on top of the 10 hours of basic pay ({gbp(10 * hourly)})</p>
              <p className="text-gray-500">Same 10 hours on a Sunday or bank holiday: 10 x {Math.round(band.sunday * 100)}% = {sundayExtraHours.toFixed(2)} extra hours = <strong className="text-gray-700">{gbp(sundayExtraHours * hourly)}</strong> enhancement.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-100">
            <p className="font-bold text-gray-900 text-sm mb-1">Your self-check</p>
            <p className="text-sm text-gray-700">
              On any enhancement line: PAID/DUE x {gbp(hourly, 4)} should match AMOUNT to within a
              penny or two. If it does not, that line is worth a query.
            </p>
            {band.overtimeEligible ? (
              <p className="text-sm text-gray-500 mt-2">
                Overtime at your band: time and a half = {gbp(hourly * 1.5, 4)}/hr, double time on
                public holidays = {gbp(hourly * 2, 4)}/hr (once you are over 37.5 hours that week).
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Bands 8a to 9 are not eligible for overtime payments.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-emerald-700 italic">Pick a band above to see your numbers.</p>
      )}
    </div>
  );
}
