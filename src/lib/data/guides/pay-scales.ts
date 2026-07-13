// NHS Agenda for Change pay scales, England, effective 1 April 2026.
// Source: NHS Employers pay scales 2026/27. Scales change every April -
// update the figures (and EFFECTIVE_FROM) when the new pay circular lands.
// Shared by the band picker and the shift checker (payslip guide).
// Hourly rate uses the ESR divisor: 37.5 hrs x 52.143 weeks = 1955.36 hrs/year.

export const EFFECTIVE_FROM = "1 April 2026";
export const HOURS_PER_YEAR = 1955.357;

// Both widgets share the saved selection so a band picked in one is
// remembered by the other. Shape: {"b": bandIndex, "s": stepIndex}.
export const PAY_BAND_STORAGE_KEY = "wardhub_pay_band";

export interface PayStep {
  label: string;
  annual: number;
}

export interface PayBand {
  band: string;
  // Unsocial hours enhancement rates (AfC Section 2, England):
  // night = weekday nights 20:00-06:00 + all Saturday; sunday = all Sunday + public holidays.
  night: number;
  sunday: number;
  overtimeEligible: boolean;
  steps: PayStep[];
}

export const PAY_BANDS: PayBand[] = [
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

export const gbp = (n: number, dp = 2) =>
  n.toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: dp, maximumFractionDigits: dp });
