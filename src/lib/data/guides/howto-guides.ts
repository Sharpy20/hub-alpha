import type { PatientTaskCategory, TaskPriority } from "@/lib/types";

// How-to guide data - extracted from how-to/[id]/page.tsx
//
// Rule 4: contacts that are not publicly findable display "Hidden in demo mode".
// The real values used to sit in comments beside them; they were stripped on
// 27 July 2026 and are held outside the repo in E:\Hub\temp\internal-contacts.md,
// keyed by guide id.

// A job a guide step can offer to put in the ward diary. The wording, the day
// and the order all come from the source pathway - nothing here is invented, so
// a step only carries these where the document itself sets out a task list with
// timescales attached.
export interface CommitTask {
  id: string;
  title: string;
  // Day of the admission the pathway puts this on (day 1 = admission day), used
  // to date the job from the patient's admission. Left off where the pathway
  // gives no timescale.
  day?: number;
  // What the pathway says about timing where it is not a plain day count, shown
  // on the tick sheet instead of a day badge.
  when?: string;
  category: PatientTaskCategory;
  priority?: TaskPriority;
  // Starts unticked. For items the pathway gives no timescale for, or that only
  // apply if something else happens (an internal transfer, a Hub referral).
  optional?: boolean;
}

export interface GuideStep {
  id: string;
  title: string;
  content: string;
  // Jobs this step can commit to the ward diary, ticked off individually. Adds
  // a "Commit these jobs to the diary" button to the top of the step.
  commitTasks?: CommitTask[];
  // One-line "in a hurry" summary shown in a banner above the step content.
  tldr?: string;
  tip?: string;
  // Optional interactive widget rendered below the step content in the viewer.
  // "pay-band-picker" = the AfC band/step salary picker (payslip guide).
  // "pay-faq" = the shared tagged FAQ accordion (pay-faq.ts) filtered to the
  //             current guide's topic.
  // "shift-checker" = enter a shift, see the enhancement split, whole-shift
  //                   rule, pay estimate and 11-hour rest verdict.
  // "payslip-decoder" = the clickable fictional payslip (payslip guide).
  widget?: "pay-band-picker" | "pay-faq" | "shift-checker" | "payslip-decoder";
  // Break this step into collapsible sections keyed off its "header:" lines.
  // Set it on reference and resource steps the reader dips into; leave it OFF
  // where hiding content would hurt - short DO / DO NOT safety guidance, and
  // sequential teaching steps where the worked example is the whole point.
  progressive?: boolean;
}

export interface GuideData {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
  // SystmOne how-to guides on FOCUS (trust login needed) shown under the guide.
  focus?: { label: string; url: string }[];
  // Optional custom case-note template for the end-of-guide orange copy box.
  // [DATE] is auto-filled; other [PLACEHOLDERS] are left for the nurse to edit.
  caseNote?: string;
  // Set true to hide the case-note box entirely - for staff-life guides (payslip,
  // roster) that will never be recorded against a patient.
  noCaseNote?: boolean;
  // Other in-app guides worth linking to from this one (internal /guides links).
  related?: { label: string; guideId: string }[];
  // Printable / downloadable blank forms (public HTML in /public, e.g. a blank
  // form the nurse prints). Rendered as a "Printable forms" section.
  downloads?: { label: string; url: string }[];
  // Numbered sources for the "Show references" toggle. Inline [#n] tokens in
  // step content and tips render as superscript reference markers when the
  // toggle is on (they are stripped when it is off, the default).
  sources?: { n: number; label: string; url?: string }[];
}

export const GUIDE_CONFIG: Record<string, { icon: string; gradient: string; category: string }> = {
  news2: { icon: "💪", gradient: "from-red-500 to-red-700", category: "Physical Health" },
  ecg: { icon: "💓", gradient: "from-pink-500 to-pink-700", category: "Physical Health" },
  "neuro-obs": { icon: "🧠", gradient: "from-purple-500 to-purple-700", category: "Observations" },
  "fluid-balance": { icon: "💧", gradient: "from-blue-500 to-blue-700", category: "Observations" },
  "pain-assessment": { icon: "📊", gradient: "from-orange-500 to-orange-700", category: "Observations" },
  choking: { icon: "🚨", gradient: "from-red-600 to-red-800", category: "Emergency Response" },
  "cardiac-arrest": { icon: "❤️‍🔥", gradient: "from-rose-600 to-rose-800", category: "Emergency Response" },
  mohost: { icon: "🧩", gradient: "from-violet-500 to-purple-700", category: "OT Tools" },
  "ot-pathway": { icon: "🗓️", gradient: "from-violet-600 to-indigo-800", category: "OT Tools" },
  "mha-statuses": { icon: "⚖️", gradient: "from-indigo-600 to-purple-800", category: "Legal & Advocacy" },
  "section-17": { icon: "📋", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy" },
  "arrange-mha-assessment": { icon: "⚖️", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy" },
  "section-132": { icon: "📋", gradient: "from-indigo-600 to-purple-800", category: "Legal & Advocacy" },
  "section-136": { icon: "🚓", gradient: "from-indigo-600 to-blue-800", category: "Legal & Advocacy" },
  "tribunal-report": { icon: "⚖️", gradient: "from-indigo-600 to-purple-800", category: "Legal & Advocacy" },
  "dama": { icon: "🚪", gradient: "from-orange-500 to-red-700", category: "Nurse Tools" },
  "transfer-in": { icon: "🔄", gradient: "from-cyan-500 to-blue-700", category: "Physical Health" },
  "awol": { icon: "🏃", gradient: "from-red-600 to-orange-700", category: "Urgent Care" },
  "capacity-assessment": { icon: "⚖️", gradient: "from-violet-500 to-violet-700", category: "Legal & Advocacy" },
  restraint: { icon: "🤝", gradient: "from-slate-500 to-slate-700", category: "MHA & Legal" },
  "admission-checklist": { icon: "✅", gradient: "from-emerald-500 to-emerald-700", category: "Nurse Tools" },
  "fridge-temps": { icon: "🌡️", gradient: "from-cyan-500 to-cyan-700", category: "Nurse Tools" },
  "safeguarding-adults-referral": { icon: "🛡️", gradient: "from-red-600 to-red-800", category: "Safeguarding" },
  "safeguarding-children-referral": { icon: "👶", gradient: "from-pink-600 to-pink-800", category: "Safeguarding" },
  "domestic-abuse-guide": { icon: "🏠", gradient: "from-purple-600 to-purple-800", category: "Safeguarding" },
  "peer-conflict-guide": { icon: "⚠️", gradient: "from-amber-600 to-amber-800", category: "Safeguarding" },
  "information-sharing": { icon: "🔗", gradient: "from-blue-600 to-blue-800", category: "Safeguarding" },
  "escalation-pathway": { icon: "📈", gradient: "from-orange-600 to-orange-800", category: "Safeguarding" },
  "online-safety-children": { icon: "🌐", gradient: "from-cyan-600 to-cyan-800", category: "Safeguarding" },
  "honour-based-abuse": { icon: "🛡️", gradient: "from-rose-700 to-rose-900", category: "Safeguarding" },
  "modern-slavery-radicalisation": { icon: "⛓️", gradient: "from-gray-600 to-gray-800", category: "Safeguarding" },
  "faith-belief-abuse": { icon: "🙏", gradient: "from-violet-600 to-violet-800", category: "Safeguarding" },
  "send-safeguarding": { icon: "📚", gradient: "from-teal-600 to-teal-800", category: "Safeguarding" },
  "non-recent-abuse": { icon: "🕰️", gradient: "from-slate-600 to-slate-800", category: "Safeguarding" },
  "special-guardianship": { icon: "👨‍👧", gradient: "from-emerald-600 to-emerald-800", category: "Safeguarding" },
  "child-in-need": { icon: "🤲", gradient: "from-sky-600 to-sky-800", category: "Safeguarding" },
  "abc-chart": { icon: "📋", gradient: "from-amber-500 to-orange-700", category: "Nurse Tools" },
  prenoxad: { icon: "💉", gradient: "from-teal-500 to-emerald-700", category: "Physical Health" },
  "named-nurse": { icon: "📋", gradient: "from-emerald-500 to-emerald-700", category: "Nurse Tools" },
  "admission-note": { icon: "📝", gradient: "from-sky-500 to-blue-700", category: "Nurse Tools" },
  honos: { icon: "📊", gradient: "from-cyan-600 to-teal-800", category: "Nurse Tools" },
  dols: { icon: "🔒", gradient: "from-violet-500 to-violet-700", category: "Legal & Advocacy" },
  "blanket-restrictions": { icon: "⛔", gradient: "from-orange-600 to-red-700", category: "Restrictive Practice" },
  "student-placement": { icon: "🎓", gradient: "from-blue-500 to-indigo-700", category: "Learning & Development" },
  "no-smoking": { icon: "🚭", gradient: "from-red-600 to-orange-700", category: "Restrictive Practice" },
  "informal-patient-contract": { icon: "🤝", gradient: "from-sky-500 to-blue-700", category: "Nurse Tools" },
  payslip: { icon: "💷", gradient: "from-emerald-600 to-teal-800", category: "Learning & Development" },
  roster: { icon: "📅", gradient: "from-teal-600 to-cyan-800", category: "Learning & Development" },
  "leave-absence": { icon: "🛌", gradient: "from-indigo-600 to-blue-800", category: "Learning & Development" },
  "pay-roster-faq": { icon: "❓", gradient: "from-slate-600 to-slate-800", category: "Learning & Development" },
};

// WAGOLL links for guides that have completed examples
export const GUIDE_WAGOLLS: Record<string, { label: string; url: string }[]> = {
  "abc-chart": [
    { label: "Completed ABC Chart Example", url: "/abc-wagoll.html" },
  ],
};

export const GUIDES: Record<string, GuideData> = {
  // Split 13 Jul 2026: the combined pay-roster guide became three guides
  // (payslip / roster / leave-absence). Old /guides/pay-roster links redirect
  // to the payslip guide (LEGACY map in /guides/[id]/page.tsx).
  payslip: {
    id: "payslip",
    title: "Understanding Your NHS Payslip",
    description: "Where the money in your bank comes from - the payslip layout, enhancements as extra hours, the whole-shift rule, deductions and the payday self-check",
    noCaseNote: true,
    sources: [
      { n: 1, label: "NHS Terms and Conditions of Service Handbook (Agenda for Change), Section 2 - unsocial hours, England", url: "https://www.nhsemployers.org/publications/tchandbook" },
      { n: 2, label: "NHS Employers - Unsocial hours payments (rates and the whole-shift rule)", url: "https://www.nhsemployers.org/articles/unsocial-hours-payments" },
      { n: 3, label: "NHS Terms and Conditions Handbook, Section 3 - overtime payments", url: "https://www.nhsemployers.org/publications/tchandbook" },
      { n: 4, label: "NHS Terms and Conditions Handbook, Section 13 - annual leave (13.9: pay during leave includes enhancements)", url: "https://www.nhsemployers.org/publications/tchandbook" },
      { n: 5, label: "NHS Employers - Agenda for Change pay scales 2026/27, England (effective 1 April 2026)", url: "https://www.nhsemployers.org/articles/pay-scales-202627" },
      { n: 6, label: "NHS Pension Scheme - tiered member contribution rates (reviewed each April)" },
    ],
    related: [
      { label: "Roster Survival Guide", guideId: "roster" },
      { label: "Leave, Absence & Rest Rules", guideId: "leave-absence" },
      { label: "Pay & Roster FAQ and Jargon Buster", guideId: "pay-roster-faq" },
    ],
    steps: [
      {
        id: "golden-rule",
        title: "The golden rule",
        tldr: "Query pay problems the month they happen - overpayments get clawed back, so early is cheap.",
        content: `If something does not look right, ask. Pay issues are easiest to fix early - and errors cut both ways: if you have been OVERPAID, the Trust is within its rights to ask for that money back, so the earlier it is spotted the smaller the correction.\n\nFive minutes with your payslip every payday prevents most problems.\n\nAll figures in this guide are examples with made-up round numbers - or your own band's rates once you use the picker on the "Your numbers" step. Rates, tax thresholds and pension bands change (usually each April), so always go by your own payslip and contract.`,
      },
      {
        id: "layout",
        title: "The payslip layout - five sections, top to bottom",
        tldr: "Five sections - and if the top one is wrong, everything below it is wrong too.",
        content: `Nearly every NHS payslip follows the same pattern:\n\n1. Your details - name, assignment number, job title, pay band, contracted hours, tax code, NI number.\n2. Pay and allowances - Basic Pay, plus a separate line for each enhancement, overtime and arrears payment.\n3. Deductions - tax, National Insurance, pension, and anything else taken off.\n4. Year to date - running totals since April.\n5. Net pay - what actually reaches your bank.\n\nIf the top section is wrong (hours, band, tax code), everything below it will be wrong too, so start there.`,
        tip: "Your assignment number is the reference Payroll works from - quote it in every query.",
      },
      {
        id: "decoder",
        title: "Decode a payslip line by line",
        tldr: "Tap each line of a real-looking payslip to see what it means.",
        content: `Here is a whole payslip for a made-up Band 5 nurse. Tap any line and it tells you what that line is - and because the figures all add up, you can follow the self-checks (PAID x RATE = AMOUNT, and Gross minus Deductions = Net) as you go.\n\nWork down it in order the first time - the top section drives everything below it.`,
        widget: "payslip-decoder",
        tip: "Then dig your own payslip out and find the same lines on it - they will be in the same order.",
      },
      {
        id: "basic-pay",
        title: "Basic Pay - the anchor line",
        tldr: "Basic Pay = annual salary divided by 12. Check it first.",
        content: `Basic Pay is your contracted annual salary divided by 12, before any enhancements or deductions. Everything else on the payslip is built on top of it.\n\nCheck it first. If your band, pay point or contracted hours changed recently, this is the line where it shows up - and where mistakes creep in.`,
        tip: "Annual salary divided by 12. If that sum does not match the Basic Pay line, stop and query it before looking at anything else.",
      },
      {
        id: "enhancements",
        title: "Enhancements - the bit everyone finds confusing",
        tldr: "Enhancements do not boost your RATE - they add extra paid HOURS.",
        content: `Unsocial hours enhancements under Agenda for Change. The percentage depends on your band:\n\n- Weekday nights (20:00 to 06:00) and all Saturday hours: Band 2 = time plus 41%, Band 3 = time plus 35%, Bands 4 to 9 = time plus 30%\n- All Sunday and public holiday hours (midnight to midnight): Band 2 = time plus 83%, Band 3 = time plus 69%, Bands 4 to 9 = time plus 60%[#1]\n\nSo a Band 3 HCA gets 35% and 69%; a Band 5 nurse gets 30% and 60%. Bank holiday hours get their rate on its own - enhancements are not stacked on top of each other.\n\nThe formula: hours worked x enhancement rate = extra paid hours.\n\nHere is the catch: the payslip does NOT show a higher hourly rate.\n\nWhat staff expect to see: "£20 an hour plus 30% = £26 an hour."\nWhat ESR actually does: it converts the percentage into extra paid HOURS, then pays all of them at your normal rate.[#2]\n\nThe money works out the same. It just looks completely different on paper, and that difference causes more payslip queries than anything else.`,
        tip: "Say it to yourself: enhancements do not boost your rate, they boost your hours.",
      },
      {
        id: "your-numbers",
        title: "Your numbers - pick your band",
        tldr: "Pick your band once and the examples use your real rates.",
        content: `Everything so far used easy round numbers. This step uses YOURS.\n\nPick your band and pay step below and the guide works out your hourly rate, your enhancement rates and a worked example with your actual figures. The selection is only remembered on this device - nothing is sent anywhere.[#5]`,
        widget: "pay-band-picker",
        tip: "Your exact hourly rate is printed on your payslip as RATE - compare it with the figure here. If they differ, your pay step may have changed (or be wrong).",
      },
      {
        id: "worked-example",
        title: "Worked example and the self-check",
        tldr: "PAID/DUE x RATE = AMOUNT - the check that works on every enhancement line.",
        content: `Say you work 10 night hours, the night enhancement is 30%, and your normal rate is £20:\n\n- 30% of 10 hours = 3 extra hours\n- 3 hours x £20 = £60 enhancement pay\n\nOn the payslip that line reads something like:\n\n- WKD/EARNED: 10.00 (the hours you actually worked)\n- PAID/DUE: 3.00 (the extra hours the percentage turned into)\n- RATE: £20.0000 (your normal rate - unchanged)\n- AMOUNT: £60.00\n\nThe rate never moved. The hours grew. That is the whole trick.\n\nThe self-check: PAID/DUE x RATE = AMOUNT.\nReal payslips are messier than round numbers, but the same check always works. Take any enhancement line and multiply PAID/DUE by RATE - it should match AMOUNT to within a penny or two of rounding. Realistic example: 45.50 night hours at 30% gives 13.65 in PAID/DUE, and 13.65 x £20.00 = £273.00 in AMOUNT.\n\nTwo different problems, two different fixes:\n- The multiplication does not match the AMOUNT: that is a genuine calculation query for Payroll.\n- The multiplication matches but the HOURS look wrong: check your worked shifts against the roster first - the calculation is fine, the input might not be.`,
        tip: "Enhancements are usually paid a month in arrears - this month's payslip often carries last month's shifts. Check the right month's roster before reporting hours as missing.",
      },
      {
        id: "whole-shift-rule",
        title: "The whole-shift rule - the ward myth that is actually true",
        tldr: "More than half a weekday shift after 8pm? The WHOLE shift is enhanced.",
        content: `You may have heard "if most of your shift is at night, the whole shift gets the night rate". That is not folklore - it is paragraph 2.11 of Section 2 (England) of the NHS Terms and Conditions Handbook:\n\n"Where a continuous night shift or evening shift on a weekday (other than a public holiday) includes hours outside the period of 8 pm to 6 am, the enhancements... should be applied to the whole shift if more than half of the time falls between 8 pm and 6 am."[#1][#2]\n\nIn plain English, for a WEEKDAY shift:\n- More than half of the shift falls between 20:00 and 06:00 - the WHOLE shift is enhanced, including the hours outside the window.\n- Half or less falls in the window - only the hours inside the window are enhanced.\n\nTwo examples:\n- Night shift 20:45 to 07:45 (10.5 paid hours): about 9 hours fall inside 20:00-06:00, well over half. All 10.5 hours are paid at the night rate, including 06:00-07:45.\n- Long day 07:30 to 20:30: only 30 minutes falls after 20:00, much less than half. Only 20:00-20:30 is enhanced; the rest is plain time.\n\nSaturdays, Sundays and public holidays do not need this rule - every hour of those days is enhanced anyway.`,
        tip: "Night workers: your total enhanced hours for the month should equal your total worked hours - no plain-time slice at the start or end of a qualifying night shift. If a chunk shows as unenhanced, query it.",
      },
      {
        id: "shift-checker",
        title: "Try it - check one of your shifts",
        tldr: "Type in a real shift and let the tool do the last four steps for you.",
        content: `Everything the last few steps explained, in one tool. Put in a real shift from your roster and it shows the enhancement split, whether the whole-shift rule fires, a rough pay figure at your band - and, if you add your next start time, whether the gap between shifts is legal.`,
        widget: "shift-checker",
        tip: "Try your own worst case: a late finish followed by an early start, or the night shift you were not sure got fully enhanced.",
      },
      {
        id: "two-lines",
        title: "Two lines from one shift - and why a Saturday night pays more",
        tldr: "Nights split at midnight - so a Saturday night is worth more than a Sunday night, for the same hours.",
        content: `Enhancement lines are split by day type, and the day changes at midnight. So a single night shift usually lands on two lines:\n\n- Friday night - hours before midnight to Night Duty EN, hours after midnight to Saturday EN\n- Saturday night - before midnight to Saturday EN, after midnight to Sunday EN\n- Sunday night - before midnight to Sunday EN, after midnight to Night Duty EN\n\nThat midnight split has a payslip consequence worth knowing: a SATURDAY night is worth more than a SUNDAY night, for the exact same hours. Most of a night shift falls after midnight, so:\n\n- Saturday night - a few hours of Saturday (+30%) before midnight, then the big after-midnight chunk is Sunday (+60%).\n- Sunday night - a few hours of Sunday (+60%) before midnight, then the big chunk drops back to weekday-night (+30%).\n\nWorked example - a 12-hour night, 4 hours before midnight and 8 after, at £20 an hour:\n- Saturday night: 4h at +30% plus 8h at +60% = 6.00 extra paid hours = £120 enhancement.\n- Sunday night: 4h at +60% plus 8h at +30% = 4.80 extra paid hours = £96 enhancement.\n\nSame shift, same 12 hours - the Saturday night pays £24 more, purely because the bigger, after-midnight half lands on Sunday. (A common ward belief is that a Saturday night is paid at 60% the whole way through - it is not; only the after-midnight part is. It just feels that way because that is the larger half.)\n\nThis midnight split is also why the hours on each enhancement line rarely match "number of shifts x shift length" line by line - but the TOTAL across all the lines still adds up to your enhanced hours for the month.`,
        tip: "Try it in the shift checker above: enter the same night as a Saturday, then as a Sunday, and watch the split flip. The Saturday night is the sweet spot - mostly 60%.",
      },
      {
        id: "deductions",
        title: "Deductions - why net pay is lower than you expect",
        tldr: "Gross pay minus pension, tax, NI and the rest = net pay.",
        content: `Gross pay is what you earned. Net pay is what lands in the bank. In between:\n\n- NHS Pension - taken off BEFORE tax is calculated, so it costs you less than the figure suggests\n- PAYE (income tax) - driven by your tax code\n- National Insurance\n- Student loan, union subs and salary sacrifice schemes, where they apply\n\nGross pay minus deductions = net pay. That is the whole equation.`,
        tip: "Because pension comes off before tax is worked out, you get the tax relief automatically - no claiming needed.",
      },
      {
        id: "pension",
        title: "Pension - why the deduction changes on its own",
        tldr: "Pension is tiered - a bigger deduction is not automatically an error.",
        content: `NHS Pension contributions are tiered: your percentage depends on which pensionable pay band you fall into, and the bands are reviewed each April.[#6]\n\nA pay rise, a jump in enhancement earnings, or an April band review can all move you into a higher tier - so the pension line can grow even though nothing has gone wrong. A bigger deduction is not automatically an error.`,
        tip: "Take-home dropped and you cannot see why? Compare the pension percentage on this payslip with last month's before ringing Payroll.",
      },
      {
        id: "overtime-leave",
        title: "Overtime, extra hours and annual leave pay",
        tldr: "Overtime is time and a half (double on public holidays); leave pay includes your usual enhancements.",
        content: `Overtime basics:\n- Overtime (beyond full-time hours) is paid at time and a half, and double time on public holidays. Bands 8a to 9 are not eligible for overtime payments.[#3]\n- Part-time staff get plain time for extra hours (plus any unsocial hours enhancement that applies) until they go over 37.5 hours in the week - the overtime premium only starts past that point.\n- Time off in lieu can be taken instead of overtime pay - and if it cannot be taken within three months, it must be paid at the overtime rate.\n\nAnnual leave pay includes your enhancements:\nPay during annual leave is calculated on what you would have received had you been at work - so it includes an average of your usual enhancements, not just basic pay.[#4] On many payslips this top-up shows as an "AfC Absence" line. If you work a lot of nights and weekends, that line doing its job is why your pay does not crash in a month with leave in it.`,
      },
      {
        id: "four-ways",
        title: "Plain, enhanced, overtime or bank - know which shift you are working",
        tldr: "Plain, enhanced, overtime or bank - same hour, four different price tags.",
        content: `An hour of work can be paid four different ways, and mixing them up causes no end of payslip confusion:\n\n1. Contracted (plain) hours - your rostered hours at your basic rate, paid through Basic Pay.\n2. Unsocial hours enhancements - the SAME contracted hours when they fall at night, on a weekend or on a bank holiday. Not extra work - extra pay for when the work happens.\n3. Overtime - hours BEYOND full time (37.5 a week) agreed as overtime: time and a half, double on public holidays, bands up to 7 only.[#3] Part-timers get plain time until they pass 37.5 hours.\n4. Bank shifts - extra shifts picked up through the staff bank, which is a SEPARATE registration. Paid separately from your contracted pay, at the band rate for the shift plus any unsocial enhancement for when it falls - NOT at overtime rates. Booked through Loop.\n\nThe two things about bank shifts people learn the hard way:\n\n- They do NOT count toward your contracted hours - you can work bank shifts all month and still owe hours on the roster (the Roster guide explains why)\n- They DO count toward your working time - the 48-hour average and the 11-hour rest rule look at ALL your NHS work, bank included\n\nExact bank arrangements (rates, when it pays, pension treatment) are set by the Trust bank - check with the bank team when you register.`,
        tip: "Same Saturday, different price tags: a Saturday BANK shift pays band rate plus the Saturday enhancement; Saturday OVERTIME pays time and a half. Know which one you agreed to before you work it.",
      },
      {
        id: "ytd",
        title: "Year to date - the section everyone skips",
        tldr: "The year-to-date block shows whether errors are building up or fixing themselves.",
        content: `The year-to-date block shows running totals since 6 April: gross pay, taxable pay, tax paid, pensionable pay, pension contributions.\n\nWhat it is actually for:\n- Spotting errors building up across the year rather than in one month\n- Confirming arrears or back pay really landed\n- Checking whether tax has self-corrected (it often does over a couple of months - the YTD figures show whether it actually has)\n- Comparing against your P60 in April`,
      },
      {
        id: "payday-check",
        title: "The five-minute payday check",
        tldr: "Five minutes every payday: top section, Basic Pay, hours, the self-check, pension, net.",
        content: `Every payday:\n\n1. Top section right? Job title, contracted hours, tax code, assignment number.\n2. Basic Pay matches your band and hours (annual salary divided by 12).\n3. Enhancement hours match the shifts you actually worked (right month - remember the arrears lag).\n4. On any line that looks odd: PAID/DUE x RATE = AMOUNT.\n5. Night workers: whole-shift rule applied? Enhanced hours should cover whole qualifying shifts, not stop at 06:00.\n6. Pension percentage is the same as last month, or the change is explainable.\n7. Net pay roughly makes sense against last month.\n\nMost problems are found by staff doing these checks, not by the system flagging them.`,
        tip: "Write down the exact payslip line and figures before raising a query - specific questions get quick answers.",
      },
      {
        id: "something-wrong",
        title: "If something looks wrong",
        tldr: "Give Payroll the exact line and its four figures - and report overpayments too.",
        content: `Before you contact Payroll, write down:\n\n- The pay date\n- Your assignment number\n- The exact payslip line name (for example "Night Duty EN")\n- The four figures on that line: WKD/EARNED, PAID/DUE, RATE, AMOUNT\n- Why you think it is wrong\n\nA vague query gets a slow answer. An exact line with figures gets checked quickly.\n\nErrors cut both ways: if you have been OVERPAID, the Trust is within its rights to ask for that money back. Caught in month one the correction is small; left for six months, you are paying back six months' worth. The earlier it is raised, the easier it is on you.\n\nStuck on a term, or have a question this guide did not answer? The Pay & Roster FAQ and Jargon Buster (linked below) collects the common questions and translates every payslip and roster word in one place.`,
        tip: "Raise it in the same pay period if you can - same-month corrections are the easiest kind.",
      },
    ],
  },
  roster: {
    id: "roster",
    title: "Roster Survival Guide",
    description: "Your shifts, your hours balance, TOIL and the weekly Loop habit - and how the roster feeds your pay",
    noCaseNote: true,
    sources: [
      { n: 1, label: "NHS Terms and Conditions Handbook, Section 27 - working time and rest", url: "https://www.nhsemployers.org/publications/tchandbook" },
      { n: 2, label: "Working Time Regulations 1998", url: "https://www.legislation.gov.uk/uksi/1998/1833/contents" },
      { n: 3, label: "NHS England - e-rostering good practice guidance (nursing and midwifery)" },
      { n: 4, label: "NHS TCS Handbook Section 2 + NHS Employers unsocial hours payments (rates, arrears, whole-shift rule)", url: "https://www.nhsemployers.org/articles/unsocial-hours-payments" },
      { n: 5, label: "DHcFT Health and Attendance Policy and FAQs (FOCUS - trust login needed)" },
    ],
    related: [
      { label: "Understanding Your NHS Payslip", guideId: "payslip" },
      { label: "Leave, Absence & Rest Rules", guideId: "leave-absence" },
      { label: "Pay & Roster FAQ and Jargon Buster", guideId: "pay-roster-faq" },
    ],
    steps: [
      {
        id: "golden-rule",
        title: "The golden rule",
        tldr: "Roster errors are easiest to fix the week they happen - do not wait for payday.",
        content: `If something does not look right, ask. Roster issues are easiest to fix early.\n\nDo not wait for:\n- Payday - by then a roster error has already reached your pay\n- The end of the leave year - balances get much harder to unpick\n- Several months down the line - small errors grow into big ones\n\nFive minutes checking your roster each week prevents most problems, and the sooner something is raised, the easier it is to put right.`,
      },
      {
        id: "more-than-timetable",
        title: "The roster is more than a timetable",
        tldr: "The roster drives your pay, leave, hours and the staffing record - keep it accurate.",
        content: `The roster feeds almost everything about your working life:\n\n- Pay - your shifts drive what you are paid, including night and weekend enhancements\n- Leave - your annual leave balance lives here\n- Sickness - absence is recorded against it\n- Hours - your running balance of hours worked vs contracted\n- Staffing - it is the factual record of who was on shift\n\nThat last one matters more than people realise. If an incident happens and someone asks "was the ward fully staffed that night?", the roster is the evidence. If shifts, swaps or moves to other wards were never recorded, the picture is incomplete.`,
        tip: "If a shift changed on the day - a swap, a move to another ward, extra hours - make sure the change actually got recorded.",
      },
      {
        id: "hours-balance",
        title: "Your hours balance - a running account",
        tldr: "MINUS means the Trust owes YOU time (TOIL); PLUS means you owe hours.",
        content: `One bit of jargon first: TOIL means Time Off In Lieu - time the Trust owes you back because you worked over your contracted hours.\n\nYour hours balance changes as shifts are worked, leave is taken and sickness is recorded. The plus and minus signs trip everyone up, because minus is the good one for you. Plainly:\n\n- MINUS (for example -7:30): you have worked MORE than your contracted hours. The Trust owes you time back - that is TOIL.\n- PLUS (for example +7:30): you have worked LESS than your contracted hours. You owe hours to the Trust.\n- 0:00 is the target - contracted and rostered hours in line.`,
        tip: "If you owe hours, agree with your manager how to work them back before booking extra paid shifts on top.",
      },
      {
        id: "balance-changes",
        title: "Why did my balance change?",
        tldr: "Balances move with amendments, leave, sickness, bank shifts and contract changes.",
        content: `The usual reasons:\n\n- Shifts were amended after publication\n- Additional hours were worked\n- Annual leave was added or changed\n- Sickness was recorded\n- Bank or overtime shifts were added\n- Your contracted hours changed\n\nContract changes are the tricky one. Roster weeks run Sunday to Saturday, so if your new hours start part-way through a week (say, a Wednesday), that split week may need a manual check. If your balance looks odd right after a contract change, that is almost certainly why - ask your manager or roster lead to walk through it.`,
      },
      {
        id: "owe-hours",
        title: "Why do I owe hours when I am always at work?",
        tldr: "Bank and overtime shifts never reduce owed contracted hours.",
        content: `A question staff ask a lot - and the answer is that additional paid hours, overtime shifts and bank shifts do NOT count towards your contracted hours, because those shifts are paid separately. So you can be working extra shifts and still owe contracted hours if your rostered hours have not been completed.\n\n- Check your hours balance regularly\n- Review your roster each week\n- Remember: bank and overtime shifts do not reduce owed contracted hours\n\nBeing busy at work does not always mean your contracted hours balance is correct - a quick check avoids surprises later.\n\nAnd do not take TOIL for granted either: a balance can change after the event if a shift was input wrong and gets corrected later. If you have already taken TOIL that turns out to be a roster error, you can be asked to work the time back. Query anything odd BEFORE using the time, not after.`,
        tip: "Speak to your manager early if the balance does not look right - early queries are easy ones.",
      },
      {
        id: "loop-habit",
        title: "Loop - the roster in your pocket",
        tldr: "Five minutes in Loop each week - checking backwards as well as forwards.",
        content: `Loop shows your roster, leave balances and hours balance, lets you request leave, and lists available bank shifts so you can pick them up without ringing round wards.\n\nThe real value is not the app - it is the habit. Five minutes a week:\n\n- Shifts correct for the next fortnight?\n- LAST fortnight recorded right? (Shifts can be amended after the event if they were input wrong)\n- Leave balance accurate?\n- Sickness recorded properly?\n- Hours balance makes sense?\n\nAnything off, raise it that week while it is easy to trace.`,
      },
      {
        id: "sickness",
        title: "Sickness - what happens to your hours",
        tldr: "Short sickness is recorded against shifts; long sickness maintains your hours.",
        content: `Short sickness (under 7 days): recorded against the shifts you were due to work, so the roster shows which duties were missed.\n\nLonger sickness (7 days or more): your contracted hours are usually maintained instead.[#5] That stops TOIL or owed hours silently building up while you are off.\n\nWhen you come back, check five things: your future shifts, your hours balance, your leave balance, the recorded sickness dates, and your return-to-work date.`,
        tip: "The focus after sickness is recovery. Extra paid shifts straight after an absence should not normally happen unless agreed as appropriate.",
      },
      {
        id: "roster-to-payslip",
        title: "The bridge - from roster to payslip",
        tldr: "Enhancements pay a month behind, split at midnight, and follow the whole-shift rule.",
        content: `Three things worth knowing before you ever compare the roster to a payslip:\n\n- Enhancements usually pay a month in arrears. This month's payslip often carries last month's shifts, so compare against the right month's roster.\n- Days change at midnight, so one night shift can feed two payslip lines. A Friday night puts its pre-midnight hours on the Night line and its post-midnight hours on the Saturday line. The per-line hours look odd; the total still adds up.\n- The whole-shift rule (weekdays): if more than half of a weekday shift falls between 20:00 and 06:00, the WHOLE shift attracts the night enhancement - including the early-morning tail after 06:00. That is national Agenda for Change terms (Section 2 para 2.11), not ward folklore.[#4]`,
        tip: "The rates, worked examples and the line-by-line self-check are all in the payslip guide - linked below the steps.",
      },
      {
        id: "weekly-check",
        title: "The five-minute weekly check",
        tldr: "Six checks, five minutes - most problems are caught by staff, not systems.",
        content: `1. Shifts match what you actually worked\n2. LAST fortnight recorded right? Shifts can be amended after the event if input wrong\n3. Swaps and moves to other wards are recorded\n4. Leave balance is right\n5. Sickness dates are right\n6. Hours balance makes sense - and is heading towards 0:00\n\nMost problems are found by staff doing these checks, not by the system flagging them.`,
        tip: "Write down the exact date and shift before raising a query - specific questions get quick answers.",
      },
    ],
  },
  "leave-absence": {
    id: "leave-absence",
    title: "Leave, Absence & Rest Rules",
    description: "Annual leave, public holidays and sickness, carers and bereavement leave, phased returns - and the rest rules that protect you between shifts",
    noCaseNote: true,
    sources: [
      { n: 1, label: "NHS Terms and Conditions Handbook (Agenda for Change) - Sections 13 (annual leave), 14 (sickness), 23 (child bereavement) and 27 (rest)", url: "https://www.nhsemployers.org/publications/tchandbook" },
      { n: 2, label: "NHS Employers - public holidays and TOIL guidance (Section 14.9: no additional day off if sick on a statutory holiday)" },
      { n: 3, label: "Working Time Regulations 1998 - reg 10 (11-hour daily rest), reg 21(c) (special-case exception for hospitals and continuity-of-care services) and reg 24 (equivalent compensatory rest)", url: "https://www.legislation.gov.uk/uksi/1998/1833/contents" },
      { n: 4, label: "NHS England - e-rostering good practice guidance (nursing and midwifery)" },
      { n: 5, label: "RCN advice - working time, rest breaks, on-call and night work", url: "https://www.rcn.org.uk/Get-Help/RCN-advice/working-time-rest-breaks-on-call-and-night-work" },
      { n: 6, label: "DHcFT Special Leave Policy v7, issued 10 July 2024 with interim reviews to September 2025 (FOCUS - trust login needed)" },
      { n: 7, label: "DHcFT Health and Attendance Policy and FAQs (FOCUS - trust login needed)" },
      { n: 8, label: "Carer's Leave Act 2023" },
    ],
    related: [
      { label: "Roster Survival Guide", guideId: "roster" },
      { label: "Understanding Your NHS Payslip", guideId: "payslip" },
      { label: "Pay & Roster FAQ and Jargon Buster", guideId: "pay-roster-faq" },
    ],
    steps: [
      {
        id: "what-this-covers",
        title: "What this guide covers",
        tldr: "Leave, sick pay, special leave and rest rules - with the trust-policy bits marked.",
        content: `Annual leave, public holidays, sick pay, carers and bereavement leave, phased returns - and the rest rules that protect you between shifts.\n\nTwo ground rules up front:\n\n- Entitlements here are the national NHS Terms and Conditions (Agenda for Change) baseline. Where the Trust's own policy sets the exact detail, the guide says so - check the policy on FOCUS or ask your manager for the local figures.\n- If a balance or a rota pattern does not look right, raise it early. Leave and rest problems are far easier to fix before the leave year ends or the pattern becomes routine.`,
      },
      {
        id: "entitlement",
        title: "Annual leave - what you are owed",
        tldr: "27, 29 or 33 days plus bank holidays, by length of service - usually counted in hours.",
        content: `NHS annual leave under Agenda for Change grows with your length of NHS service:\n\n- On appointment: 27 days plus 8 public holidays\n- After 5 years' service: 29 days plus 8 public holidays\n- After 10 years' service: 33 days plus 8 public holidays[#1]\n\nFor rostered staff this is usually converted into HOURS (a full-time year at 10+ years' service works out around 247 hours of annual leave plus 60 hours of public holiday entitlement). Working in hours is fairer for people on long shifts - a 12.5-hour shift costs 12.5 hours of leave, not "a day".\n\nCheck your leave entitlement after any of these:\n\n- Long-term sickness\n- Sickness on a public holiday\n- A contract change\n- Carried-over leave\n- Service milestones (5 and 10 years bring extra entitlement)\n- Any manual amendment`,
        tip: "If the entitlement calculation does not make sense, ask your manager to walk you through it - small adjustments are easy to miss.",
      },
      {
        id: "public-holidays-sickness",
        title: "Sick on a public holiday - what actually happens",
        tldr: "Sick on a bank holiday: pay unaffected, but the public holiday hours come off.",
        content: `If you are off sick on a public holiday, you still receive sickness absence pay in line with NHS terms and conditions. But you do NOT build up public holiday hours for that day - so if public holiday entitlement forms part of your annual leave allowance, those hours come off your balance.[#2]\n\nExample: full-time with more than 10 years' service might be 247 hours annual leave plus 60 hours public holiday (307 total). Off sick on two bank holidays, the public holiday entitlement drops from 60 to 45 hours. Sickness pay itself is not affected - only the public holiday hours.\n\nIt is worth checking your leave balance in Loop after any sickness that includes a bank holiday, so you understand how it has affected your overall entitlement.\n\n(One footnote: your ordinary annual leave still accrues during sickness, and the legal minimum of 5.6 weeks always accrues - NHS entitlement sits well above that floor, so in practice only the public holiday hours are affected.)`,
        tip: "Being off sick on a bank holiday does not affect your sickness pay - but it can quietly shrink your leave balance. Check it.",
      },
      {
        id: "sick-pay",
        title: "Sick pay - how much, for how long",
        tldr: "Sick pay runs from 1+2 months in year one to 6+6 after five years, on a rolling year.",
        content: `NHS sick pay grows with your length of service (national terms Section 14, mirrored in the Trust's Health and Attendance FAQs):\n\n- During your 1st year: 1 month full pay, then 2 months half pay\n- 2nd year: 2 months full, 2 months half\n- 3rd year: 4 months full, 4 months half\n- 4th and 5th years: 5 months full, 5 months half\n- After 5 years: 6 months full, 6 months half[#1]\n\nThe entitlement is calculated on a ROLLING 12 months - it looks back at all your sickness over the previous year, not each absence on its own.[#7] Lots of short episodes eat into the same allowance as one long one.\n\nThe practical rules:\n\n- Self-certify for up to 7 days; after that you need a GP fit note\n- Long-term sickness = over 4 weeks\n- Sick while ON annual leave? With your manager's agreement the leave can be reclaimed and taken later (fit note needed if it was more than 7 days)\n- Routine GP and dental appointments are in your own time - arrange a shift change or work the time back. A DEPENDANT'S hospital appointment is different: that can come under the 10 days of paid domestic leave (next step).`,
        tip: "If a long absence is coming (planned surgery, say), it is worth knowing where you sit on the scale before it starts - ask HR for your current entitlement.",
      },
      {
        id: "planned-absences",
        title: "Bereavement, carers leave and other special leave",
        tldr: "Bereavement 5 days paid, end-of-life care up to 6 weeks, emergencies 10 days, carers 1 week unpaid.",
        content: `Life happens, and the Trust's Special Leave Policy provides for it - and is more generous than most people expect.[#6] The headline entitlements (all agreed with your manager first, then recorded through the Absence Manager App):\n\nBereavement leave: FIVE DAYS PAID leave on the death of a relative or someone you had a close personal relationship with. In some circumstances up to two weeks paid - for example funeral delays or travel to attend one. Child bereavement is separate and stronger: two weeks' paid leave under national terms (Section 23)[#1] - see the Pregnancy and Baby Loss Guidance.\n\nCompassionate leave for end-of-life care: up to SIX WEEKS PAID leave to care for a dependant (spouse, partner, child, grandchild or parent) nearing the end of their life. It can be taken as consecutive days, single days or partial days, and your job is protected.\n\nDomestic leave (emergencies): up to 10 DAYS PAID (pro rata) in a rolling 12 months for emergencies and unforeseen needs - a child ill at school, a dependant's hospital appointment, a care arrangement falling through. A pet emergency or pet bereavement can use 2 to 5 of those days.\n\nCarer leave: ON TOP of domestic leave, one week UNPAID every 12 months (pro rata) if you care for someone with a long-term care need.[#8] Half days, full days or a whole week - notice runs on a sliding scale from 3 days' notice (for up to a day) to 10 days' notice (for a full week).\n\nUnpaid parental leave: 18 weeks unpaid per child up to their 18th birthday, capped at 4 weeks per child per year, normally taken in whole weeks with 21 days' notice.\n\nVolunteering: one day paid leave in a rolling 12 months for a local community group or charity, with written proof.\n\nAlso in the policy: jury service and court-witness leave (paid); public positions such as magistrate (up to 10 days paid a year); Reserve or Cadet Forces duties (up to 3 weeks paid); up to 15 days job-protected leave if an immediate family member is called to active duty; paid interview leave if your post is at risk of redundancy; and disability leave - a separate category from sick leave, arranged case by case with Employee Relations.\n\nPhased return after long-term sickness sits under a different policy (Health and Attendance): a gradual return is arranged with your manager and Occupational Health - agree in writing how the reduced hours are paid before you start back.\n\nTwo cautions: entitlements are pro rata if you are part time, and leave taken beyond your entitlement can be treated as a counter-fraud matter - so track what you have used.`,
        tip: "Figures from the Trust Special Leave Policy (v7, reviewed Sept 2025). Policies change - the FOCUS copy is always the live version, and jury service, military and disability leave have their own sections in it.",
      },
      {
        id: "rest-11-hour",
        title: "Rest between shifts - how it works on a ward",
        tldr: "11 hours between shifts is the general rule; hospitals are a recognised exception, with compensatory rest as the safeguard.",
        content: `The general Working Time Regulations rule is 11 hours' rest in each 24-hour period.[#3] After a 20:00 finish, a 07:00 start the next day meets it exactly.\n\nBut wards run around the clock, and the same regulations account for that. Hospitals and care services are a named exception[#3] - because patients need continuous cover, the daily rest rule can be adjusted. So the familiar late-then-early turnaround (finish 21:30, back for 07:00) is not automatically unlawful; it is one of the patterns that exception is there for.\n\nWhere a turnaround gives you less than the full 11 hours, the safeguard is compensatory rest - equivalent rest given back wherever possible[#3] - rather than the shift being banned. That is the legal basis most wards roster on, and why the pattern is so common.\n\nThe point of all this is fatigue and recovery, not paperwork. An occasional tight turnaround, balanced out by proper rest, is normal and fine. Good rosters also try to build in recovery after a run of nights and avoid long strings of consecutive shifts - again for fatigue, not compliance. What is worth raising is a relentless pattern with no recovery built in.\n\nRest means time off duty, so a long commute either side eats into your recovery.`,
        tip: "If tight turnarounds are your normal week after week with no let-up, mention it to your roster lead - not because one turnaround is a breach, but because the recovery between them is what keeps you and patients safe. The shift checker in the payslip guide works out the gap for any two shifts.",
      },
      {
        id: "48-hour-rule",
        title: "The 48-hour rule, made easy",
        tldr: "48 hours is an AVERAGE over 17 weeks - the opt-out covers the average, never your rest.",
        content: `The law limits working time to an AVERAGE of 48 hours a week, measured over a rolling 17-week reference period.[#3] There is no separate single-week cap - one heavy week is not a breach on its own, no paperwork needed.\n\nHow the averaging works (using 4 weeks to keep the maths simple - the real review period is 17 weeks):\n\n- Week 1: 55 hours\n- Week 2: 40 hours\n- Week 3: 34 hours\n- Week 4: 37.5 hours\n\nTotal 166.5 hours, divided by 4 = an average of 41.6 hours a week. Under 48, so no concern - even though week 1 on its own looked heavy.\n\nThe opt-out, straightened out (the wording trips everyone up, including official emails):\n\n- What you CAN opt out of: the 48-hour AVERAGE itself. The opt-out is voluntary, in writing, and you can cancel it later.\n- What the opt-out does NOT touch: your rest. Daily and weekly rest are handled separately - on a ward through the compensatory-rest arrangements in the rest section above - not through this opt-out.\n- Opt-out or not, keep an eye on your own hours - fatigue is a safe-working issue, not just a legal one, and all your NHS work (bank included) counts toward the average.`,
      },
      {
        id: "raising-it",
        title: "If something looks wrong",
        tldr: "Exact dates and figures get answers - vague queries do not.",
        content: `For LEAVE queries, before you contact your manager or Payroll write down:\n\n- Your entitlement at the start of the leave year (from Loop)\n- The balance you can see now\n- The specific dates you think are wrong (sickness dates, bank holidays, amendments)\n\nFor REST and rota-pattern concerns:\n\n- The exact dates and shift times, and the gap between them\n- How often the pattern happens\n- Whether compensatory rest was given\n\nRaise it with your manager or roster lead first - most issues are input errors, fixed in minutes. If a pattern keeps repeating, escalate in writing.\n\nA vague query gets a slow answer. Exact dates and figures get checked quickly.`,
        tip: "Raise leave-balance queries well before the end of the leave year - carried-over problems are much harder to unpick.",
      },
    ],
  },
  "pay-roster-faq": {
    id: "pay-roster-faq",
    title: "Pay & Roster FAQ and Jargon Buster",
    description: "The questions staff ask most about pay, rostering and leave - plus every payslip and roster word translated, all in one place",
    noCaseNote: true,
    related: [
      { label: "Understanding Your NHS Payslip", guideId: "payslip" },
      { label: "Roster Survival Guide", guideId: "roster" },
      { label: "Leave, Absence & Rest Rules", guideId: "leave-absence" },
    ],
    steps: [
      {
        id: "faq",
        title: "Common questions",
        tldr: "Tap a question to open the answer.",
        content: `Every question from the payslip, roster and leave guides, gathered in one place. Tap any question to open the answer.`,
        widget: "pay-faq",
      },
      {
        id: "jargon",
        title: "Jargon buster - every pay and roster word",
        tldr: "Payslip and roster words, all translated in one list.",
        content: `PAYSLIP words\n- Basic Pay - your contracted salary for the month (annual divided by 12)\n- Night Duty EN / Saturday EN / Sunday EN / Bank Holiday ENH - enhancements, shown as extra paid hours at your normal rate\n- WKD/EARNED - the hours you actually worked on that line\n- PAID/DUE - the extra paid hours the enhancement percentage turned into\n- RATE - your normal hourly rate (never boosted by enhancements)\n- Arrears - backdated pay or a correction from an earlier month\n- AfC Absence - usually the average-enhancements top-up that keeps leave and absence days paid at your normal level\n- HCAS - high cost area supplement (London and fringe areas)\n- PAYE / NI - income tax / National Insurance\n- NHS Pension x% - your pension contribution at your current tier\n- Taxable Pay - your pay after pension is taken off; the figure your tax is worked out on\n- Net Pay - what reaches your bank\n- Assignment number - the reference Payroll works from; quote it in every query\n\nROSTER words\n- TOIL - Time Off In Lieu: time the Trust owes you for hours worked over contract\n- Contracted (substantive) hours - the hours your permanent contract says you work\n- Hours balance / net hours - the running difference between contracted and rostered hours\n- Bank shift - an extra shift worked on top of your contract, paid separately\n- Overtime - hours beyond full time agreed as overtime, paid at time and a half\n- WTD - Working Time Directive: the safe-working law behind the 48-hour rule and rest rules\n- Roster week - runs Sunday to Saturday\n- Unsocial hours window - weekdays 20:00 to 06:00, plus all of Saturday, Sunday and public holidays: the times that attract pay enhancements\n- Loop - the app for viewing your roster, leave and hours on your phone`,
      },
    ],
  },
  "no-smoking": {
    id: "no-smoking",
    title: "Smoke-Free Ward - Your Legal Duty",
    description: "Why smoking on the ward is a staff accountability issue, not just a patient one, and exactly what to do when you see it",
    related: [
      { label: "Blanket Restrictions & Restrictive Practice", guideId: "blanket-restrictions" },
    ],
    steps: [
      {
        id: "bottom-line",
        title: "The bottom line",
        content:
          "The whole Trust is smoke-free. Allowing or ignoring smoking on NHS premises breaches UK law and Trust policy, and the accountability sits with staff, not only the patient.\n\nIf you see it and do nothing, you are accountable.\n\nThis is not about being hard on patients. It is about fire safety, everyone's health, and your own professional registration. A cigarette on an inpatient ward is a genuine fire risk in a building full of vulnerable people.",
        tip: "Smoking is not a grey area to leave for the next shift. See it, act on it, record it.",
      },
      {
        id: "law",
        title: "The law and standards behind it",
        content:
          "Several duties apply at once:\n\n- Regulatory Reform (Fire Safety) Order 2005 - failing to prevent or report smoking is a breach of statutory duty. If a fire follows, staff can face criminal investigation under fire safety law.\n- Health Act 2006 (smoke-free legislation) - it is illegal to smoke, or to permit smoking, in enclosed NHS spaces. Allowing it is a criminal offence.\n- Health and Safety at Work Act 1974, section 7 - you have a legal duty to protect others from harm. Not acting when a patient smokes puts lives at risk.\n- NMC / HCPC / GMC codes - ignoring dangerous behaviour breaches your duty of care and can lead to a fitness-to-practise investigation.\n- The Trust Fire Safety and Smoke-Free Policy - staff must intervene, escalate and document every smoking incident. Non-compliance is a policy breach and may result in disciplinary action.",
      },
      {
        id: "what-to-do",
        title: "What to do when you see it",
        content:
          "Three things, every time:\n\n1. Intervene - explain the smoke-free policy, ask the patient to stop, and remove the smoking materials and any ignition source.\n2. Escalate - tell the nurse in charge.\n3. Datix - complete an incident report.\n\nIf safety is compromised, place the patient on Level 2 observations.\n\nRecord what you saw, what you did and what was removed on SystmOne.",
        tip: "Removing the lighter or matches matters as much as stopping the cigarette - the ignition source is the fire risk.",
      },
      {
        id: "smoke-free-ward",
        title: "How this fits the smoke-free ward",
        content:
          "No smoking, and no ignition sources on the ward, are authorised Trust-wide blanket restrictions - so this applies to every patient, detained or informal, without needing an individual risk assessment (see the Blanket Restrictions guide).\n\nSmoking materials, lighters and matches are contraband. They are held for the patient and returned on discharge - not handed back for leave or a trip outside for fresh air.\n\nSupport, not just enforcement: the Trust manages this as a health issue too. Offer nicotine replacement therapy (NRT) under the nicotine management arrangements, so patients are supported to cope while they cannot smoke.",
        tip: "Framing it as 'we will help you manage the cravings' lands far better than a flat 'no' - and it is Trust policy to offer NRT.",
      },
    ],
    caseNote:
      "Smoking incident on [DATE] at [TIME]. [PATIENT] observed smoking / in possession of smoking materials in [LOCATION]. Action: intervened, explained the smoke-free policy, removed [MATERIALS / IGNITION SOURCE] and held for return on discharge. Escalated to nurse in charge. Datix completed. Observation level reviewed: [UNCHANGED / RAISED TO LEVEL 2 - SAFETY COMPROMISED]. Nicotine replacement offered: [YES / NO - REASON]. Recorded by [NURSE].",
  },
  "informal-patient-contract": {
    id: "informal-patient-contract",
    title: "Informal Admission - Gatekeeping & the Patient Agreement",
    description: "The gatekeeping assessment before a bed is requested, and the informal admission questionnaire that sets shared expectations with the patient",
    related: [
      { label: "Admission Checklist", guideId: "admission-checklist" },
      { label: "Section 132 - Reading Patient Rights", guideId: "section-132" },
      { label: "Capacity Assessment", guideId: "capacity-assessment" },
    ],
    downloads: [
      { label: "Informal Admission Questionnaire - blank form to print", url: "/informal-admission-agreement.html" },
    ],
    steps: [
      {
        id: "what",
        title: "Two forms, two jobs",
        content:
          "Both live in the Gatekeeping Launch Pad on the SystmOne Clinical Tree, and both went live in December 2025:\n\n- The Gatekeeping Assessment is completed BEFORE a bed is requested. It is a mandatory part of the admission process and gives assurance that admission is the right call.\n- The Informal Inpatient Admission Questionnaire is completed WITH the patient once they arrive as an informal (voluntary) patient. It is a shared reference point - a plain agreement about rights, ward rules and leave, so nobody is unclear on what to expect.\n\nThis guide walks through both. Save each as a Final Version when done (that locks it).",
      },
      {
        id: "gatekeeping",
        title: "Gatekeeping Assessment - before you request a bed",
        content:
          "18 mandatory questions (plus up to 2 optional), grouped like this:\n\n- Date/time and the clinicians/teams involved.\n- Clinical need - severity, functional impairment, trauma, and previous response to community interventions.\n- Risk - risk to self, risk to others, and vulnerability. This is NOT a substitute for the Risk Screening Tool, which must also be completed.\n- Legal status - Mental Health Act criteria, and consent and capacity.\n- Social context - support networks, carer/family involvement, housing stability, and pets.\n- Alternatives tried - treatment started in the community, whether a medication review has happened, and whether Crisis (and any open community teams) have increased visits and treated at home.\n- Status - right to reside in the UK and registration with a Derbyshire GP; ASD / learning disability; and the decision outcome (Admit / Divert / Escalate).\n- Optional - the patient's own views and comments.",
        tip: "If you tick Yes to ASD / learning disability, a further question appears: has the Neurodevelopmental Team been contacted and a LEAP done? Sort that before you finalise.",
      },
      {
        id: "informal-questionnaire",
        title: "Informal Admission Questionnaire - the agreement with the patient",
        content:
          "This is a questionnaire the patient agrees to, statement by statement - not a list you read out. Record the date of admission (question 1), then take each section in turn, discuss it, and tick each statement once the patient has understood and agreed it. These are the actual statements on the form:\n\n2. Your Rights as an Informal Patient\n- I understand I am free to leave the hospital at any time unless assessed otherwise under the Mental Health Act.\n- I will be involved in decisions about my care and treatment.\n- My confidentiality and privacy will be maintained, subject to safety requirements.\n\n3. Leaving the Ward\n- I will discuss any leave from the ward with staff in advance.\n- I will inform staff before leaving and return by the agreed time.\n- I understand leave may be restricted for my safety.\n\n4. Safety and Security Rules\n- I will not bring alcohol or illicit substances onto the ward.\n- I will not engage in violence, threats, or aggression.\n- I will inform staff immediately if I feel unsafe.\n- I will not bring restricted items (e.g., lighters, sharp objects) onto the ward.\n\n5. Smoking\n- I cannot smoke on the wards or the hospital grounds.\n- I cannot keep lighters, matches, cigarettes or tobacco in my belongings - anything brought on will be disposed of.\n- I can only vape the Trust-purchased vapes (a fire-safety measure).\n\n6. Searching\n- I understand safety checks and searches will be carried out.\n- ALL parcels and deliveries, including food deliveries, will be searched (or have them sent to family/friends instead).\n\n7. Respect and Behaviour\n- I will treat everyone with kindness and respect.\n- I will not use discriminatory, racial or abusive language, and this will be reported as a criminal act.\n- I will respect other patients' privacy and space.\n- I will keep noise to a minimum, especially during quiet hours.\n\n8. Treatment and Care Planning\n- I will participate in care planning and treatment decisions.\n- I will discuss any concerns about medication or therapy with staff.\n- I will attend regular reviews with my care team.\n\n9. Mobile Phones and Devices\n- I will follow the ward policy regarding device use.\n- I will not record or photograph other patients or staff.\n- I understand I may not have my own room (some wards are dormitories with shared bathrooms). I am agreeing to an informal admission and will adhere to Trust policies.\n\nThen you confirm you have discussed these points with the patient, enter your name (question 10) and the date (question 11).",
        tip: "Print the blank form (link below the steps) to work through it with the patient. Tick each statement only once they genuinely agree it. It pairs with the Section 132 rights an informal patient is also owed.",
      },
      {
        id: "finish",
        title: "Finishing up",
        content:
          "For each form: once complete, click Save Final Version and confirm at the lock dialogue. The screen returns to the Launch Pad.\n\nWhen you have finished in the patient record, save using the appropriate Activity Template and Event Details.\n\nRemember the informal questionnaire is about clarity and safety - it is a good moment to cover restricted items, search procedures and the smoke-free rule while you have the patient's attention.",
      },
    ],
    caseNote:
      "Informal admission process completed on [DATE]. Gatekeeping Assessment completed and saved as final version before the bed request; Risk Screening Tool also completed. Decision outcome: [ADMIT / DIVERT / ESCALATE]. Informal Inpatient Admission Questionnaire completed with the patient - rights, leaving the ward, safety and security rules, smoking, searching, respect and behaviour, treatment and care planning, and mobile phones/devices all discussed and agreed. Section 132 rights also explained. Completed by [NURSE].",
  },
  "student-placement": {
    id: "student-placement",
    title: "Student Nurse Placement Guide",
    description: "Your welcome, first-day setup, the ward routine, emergencies and what's expected - a starting point for a mental health inpatient placement",
    related: [
      { label: "Observation & Engagement Plan", guideId: "observation-engagement" },
      { label: "Restraint & Rapid Tranq Monitoring", guideId: "restraint-monitoring" },
      { label: "MHA Statuses Explained", guideId: "mha-statuses" },
      { label: "Capacity Assessment", guideId: "capacity-assessment" },
      { label: "Safeguarding Adults - Making a Referral", guideId: "safeguarding" },
      { label: "NEWS2 Observations", guideId: "news2" },
    ],
    steps: [
      {
        id: "welcome",
        title: "Welcome to your placement",
        content:
          "We hope you enjoy your time on the ward and get the most out of it - you get out of a placement what you put in.\n\nA few things that make placements go well:\n\n- Ask questions. People love to share what they know, and asking shows you are keen to learn.\n- Speak up early. If anything is difficult - the shifts, the work, or how you are feeling - tell your supervisor, assessor or the senior nursing team as soon as possible, so there is plenty of time to sort it out.\n- Say if something affects your placement (for example pregnancy or an injury) so the team can support you safely.\n- This ward links to lots of other services, so ask about insight visits.\n- Mark your university days clearly in the duty book so they count towards your hours.",
        tip: "Nobody minds a question. The only mistake is staying quiet when you are unsure.",
      },
      {
        id: "first-day",
        title: "Your first day - get set up",
        content:
          "Work through this on day one (your own student booklet has the full orientation checklist):\n\n- Collect your key card and personal safety (SAS) alarm from reception - these are signed in and out each shift.\n- Be shown the fire points and equipment, and find the fire key on your alarm.\n- Be shown how the personal alarm system works.\n- Learn the emergency procedures, medical and non-medical.\n- Be orientated to the ward.\n- Meet your allocated supervisor (mentor) and assessor (associate mentor).\n- Self-roster so you work with your supervisor a good chunk of the time - aim for at least 40%, ideally around 60% of shifts.",
        tip: "Collect your key card and alarm at the START of every shift, and sign them back in at the end.",
      },
      {
        id: "ward",
        title: "About the ward",
        content:
          "You are on an acute admission mental health ward. Wards care for people through a spell of acute mental illness - conditions vary, and can include psychosis, bipolar affective disorder, depression, OCD, schizoaffective disorder and personality disorder. Acute wards generally do not care for organic conditions such as dementia or acquired brain injury.\n\nMany acute wards are 'open' rather than secure, though doors may be access-controlled in line with policy.\n\nNursing runs 24 hours a day, 365 days a year, across early, late, long-day and night shifts.",
        tip: "Ward layouts, patient groups and shift times differ between wards - treat the specifics here as typical, and confirm the detail on your own ward.",
      },
      {
        id: "team",
        title: "Who's who in the team",
        content:
          "You will work alongside a wide team. Roles you will come across:\n\n- Nurse Consultant and Senior Nurse\n- Lead Nurses / bleep holders - a lead nurse each shift who supports and co-ordinates the unit (out of hours there is a duty doctor)\n- Doctors, including junior doctors on training rotations\n- Registered nurses and nursing assistants\n- Occupational therapists (OTs) and OT assistants, and the recreation team\n- Psychologists, advocates and housekeepers\n- Community teams - CPNs and social workers\n\nRespect and listen to every member of the team. Nursing assistants, OTs and housekeepers often spend time with patients that busy qualified staff cannot, and notice things about someone's mental state that others miss.",
      },
      {
        id: "expected",
        title: "What's expected of you",
        content:
          "- Be enthusiastic - this is your opportunity, so make the most of it.\n- Be safe - if you are unsure of anything, ask. You will never be told off for being over-cautious, but brushing off something that seems small can be dangerous.\n- Spend time with patients. Nursing is not all paperwork. Sitting and chatting, a 1:1, a walk or a board game all build the therapeutic relationship - just check it out with the regular staff first.\n- Work towards your outcomes, and gather evidence of your learning early, with time to spare, so your assessor can see you are meeting the level.\n- Be proactive - look for learning opportunities, ways to help colleagues, and ways to improve patient care.",
        tip: "Get your evidence together well before the deadline - it takes the pressure off you and your assessor.",
      },
      {
        id: "day",
        title: "A typical ward day",
        content:
          "No two days are identical, but the shape is usually:\n\n- Morning: shift handover; personal physical observations (blood pressure, temperature, pulse, respirations) for those due them, and weekly weights; breakfast; medication.\n- Mid-morning: a daily planning meeting or walkaround, where patients can make requests and say what they want from the day. On most weekdays, ward round / MDM runs through the morning - each patient has a meeting about once a week with the whole team.\n- Lunchtime: lunch, then a medication round.\n- Afternoon: handover to the afternoon staff; visiting; ward round may continue.\n- Evening: dinner, medication, visiting and ward activities, then a wind-down towards bed.\n- Overnight: night staff take over, and observations continue.\n\nThis is the basic structure only - many more activities and meetings happen around it.",
        tip: "The ward round diary in the office shows each patient's MDM time - a good place to look if you want to sit in (with the patient's agreement).",
      },
      {
        id: "obs",
        title: "Observation levels - quick reference",
        content:
          "Every patient is on a level of observation matched to their risk. In this Trust the levels run from Level 1 (most restrictive) to Level 4 (general):\n\n- Level 1 - continuous observation within arm's length. For a serious and imminent risk of suicide or self-harm with impulsivity, or a significant risk to others.\n- Level 2 - continuous observation within clear eyesight at all times. For a serious short-term risk of suicide, self-harm or other significant risk.\n- Level 3 - observation at least every 15 minutes. Where there is a risk of self-harm or unpredictability, risks are unclear, or as a step down from a higher level.\n- Level 4 - general awareness of the patient's whereabouts and wellbeing. The baseline for everyone unless a higher level is needed (typically checked hourly by day and half-hourly at night).\n\nThe person 'on the door' does the Level 3 and 4 checks and keeps an eye on who comes and goes.",
        tip: "Levels step up and down as risk changes - always check the current level before assuming, and the Observation & Engagement guide explains the thinking behind each one.",
      },
      {
        id: "emergency",
        title: "In an emergency - your role",
        content:
          "If you see something worrying - a patient absconding, self-harm, a suicide attempt, or you feel unsafe - activate your personal alarm and tell the staff who respond what is happening. Responders include colleagues on the ward, the unit bleep holder and response staff from other wards. You will not get into trouble for pulling your alarm when you were being cautious.\n\nAs a student you will not be expected to lead. The nurse in charge will give you instruction - your job is usually to support the other patients, help staff, or wait at the door to let the ambulance crew in.\n\n- Fire: if you find a fire, activate your alarm and use the fire key on it in the nearest fire point. Keep yourself safe. If you only hear the alarm, find the nearest staff member and await instruction. Be extra aware of patients with hearing or mobility needs.\n- Medical emergency (for example a cardiac arrest): activate your alarm. Staff will call the unit's internal emergency number and then 999 for an ambulance. You will learn these numbers on your induction.",
        tip: "Familiarise yourself with the emergency procedures even though you are unlikely to lead - the full procedure is usually displayed by the office phone.",
      },
      {
        id: "distress",
        title: "Distress, conflict and restrictive practice",
        content:
          "Despite everyone's best efforts at prevention and de-escalation, there will be times of high distress or conflict on the ward - someone very agitated, self-harming, or needing medication against their wishes. It is not frequent, but you may see it.\n\nStaff are trained by the Positive and Proactive (Safe) team in a clear, least-restrictive hierarchy:\n\n- Primary - no physical contact - verbal de-escalation.\n- Secondary - supportive or fixed holds, needing a trained team.\n- Tertiary - taking a patient safely to the floor, only when everything else has failed. This is always a last resort, and can include enforced IM medication or nursing in seclusion.\n\nYou will NEVER be expected to take part in physical restraint. If you see it used, it is because other attempts have not worked. In an incident, your role is to clear the corridor for responders, protect the privacy and dignity of the person in distress, support the other patients, and follow the team's direction (for example taking over Level 3 or 4 observations).\n\nIt can be upsetting to watch restraint - trained staff still find it hard. A debrief is arranged for staff after serious incidents, and you can ask for that support too.",
        tip: "If anything you see leaves you worried or upset, talk to your supervisor, the nurse in charge or the Positive and Proactive team - none of them will mind.",
      },
      {
        id: "terms",
        title: "Terms you'll hear",
        content:
          "- Emergency / red trolley - holds the equipment for a medical emergency.\n- Levels of observation - the four levels of monitoring, matched to risk.\n- On the door - the person doing the Level 3 and 4 checks and watching who enters and leaves.\n- Section patient - detained under the Mental Health Act 1983.\n- Informal patient - in hospital voluntarily, with no legal restrictions.\n- Section 17 - leave from the ward, authorised and signed by the consultant.\n- MDM / ward round - the weekly multidisciplinary meeting with the patient and the team, sometimes with family.\n- Bleep holder - the lead nurse co-ordinating the unit that shift.\n- Duty doctor - the doctor covering the unit out of hours.\n- Response - the alarm response; trained staff carry a response bleep that sounds when someone activates their alarm.",
      },
      {
        id: "research",
        title: "Things to read up on",
        content:
          "Good areas to research during your placement:\n\n- The Recovery Approach, and the Care Programme Approach (CPA)\n- Psychotropic medication - antipsychotics, antidepressants, benzodiazepines - and their complications (for example clozapine toxicity, lithium toxicity, neuroleptic malignant syndrome)\n- The Mental Health Act 1983 (and the 2007 changes)\n- The Mental Capacity Act and Deprivation of Liberty Safeguards\n- Safeguarding - spotting concerns, procedures and care planning\n- Electroconvulsive therapy (ECT)\n- Managing physical health in a mental health setting\n\nResources on and off the ward: your student resource folder and information leaflets, the clinical team, the Trust intranet, NICE, the NHS website, the BNF, and clinical experts (infection control, tissue viability, Positive and Proactive, the resus officer, dietitian, pharmacists and psychologists).\n\nMany of these have their own guide here in wardHub - see the related guides below.",
        tip: "Pick two or three of these to go deep on rather than skimming all of them - depth impresses assessors more than breadth.",
      },
    ],
  },
  "admission-note": {
    id: "admission-note",
    title: "Admission Note Template",
    description: "The nine points to cover when you write up an admission - copy the skeleton into SystmOne",
    caseNote: "ADMISSION NOTE ([DATE], by [NURSE])\nAdmitted to: [WARD], [UNIT]\n1. Reason for admission: [ ]\n2. Presentation on admission; patient welcomed and orientated (recorded as a 1:1): [ ]\n3. Physical observations, including height and weight: [ ]\n4. Level of observations and rationale: [ ]\n5. Patient description: [ ]\n6. Patient informed of named nurse; named nurse emailed: [ ]\n7. Carers informed - consent to share obtained, family/friend contacted (recorded as carer's contact): [ ]\n8. Section 132 rights: [READ / patient lacks capacity - documented on the S132 form]\n9. Outstanding admission documentation handed over to next shift; named nurse emailed: [ ]",
    steps: [
      {
        id: "cover",
        title: "What to cover in the admission note",
        content:
          "Start by recording which ward and unit the patient has been admitted to. Ward and unit names change over the years, so stating them at the top keeps the note clear to anyone reading it back later.\n\nThen work through these nine points when you write up an admission:\n\n1. Reason for admission\n2. Presentation on admission, and the patient being welcomed and orientated (document this as a 1:1)\n3. Physical observations, including height and weight\n4. Level of observations and the rationale for it\n5. Patient description\n6. Inform the patient of their named nurse (check the named nurse is working over the next few days and email them)\n7. Carers to be informed - obtain consent to share, then contact family/friend if the patient consents; document as a carer's contact\n8. Section 132 rights to be completed - if the patient does not have capacity, document this on the S132 rights form (completing it shows you attempted to explain their rights)\n9. Hand over any outstanding admission documentation to the next shift and email the named nurse",
        tip: "Use the Copy button below to drop the numbered skeleton straight into your SystmOne note, then fill it in.",
      },
      {
        id: "reminders",
        title: "Three easy-to-miss details",
        content:
          "- The welcome and orientation counts as a 1:1 - record it as one.\n- Carer's contact needs the patient's consent to share first; if you cannot reach the carer, record that you tried.\n- If the patient lacks capacity to understand their rights, you still complete the S132 form - it evidences that you attempted to explain them.",
        tip: "This is the note you type up. The Admission Checklist guide is the tick-list of the tasks themselves.",
      },
    ],
  },
  "named-nurse": {
    id: "named-nurse",
    title: "Named Nurse Checklist",
    description: "The weekly and monthly rhythm for keeping your named patients' records current - and dated",
    caseNote: "Named nurse review completed on [DATE] by [NURSE]. Named nurse 1:1 done and recorded as 'named nurse 1:1': [DONE]. Carer's contact done and recorded as 'carer's contact': [DONE / UNABLE - REASON]. My Care Plan updated with patient voice and offered: [DONE / DECLINED]. Risk screening tool reviewed: [DONE]. Consent to share re-asked (recorded in care plan and daily notes): [OUTCOME]. Red folder / ward round sheet updated: [DONE]. Outstanding this week: [ITEMS]. Recorded by [NURSE].",
    steps: [
      {
        id: "role",
        title: "Your job, and the one golden rule",
        content:
          "As named nurse you hold overall responsibility for your patients' core records and keep them current, contacting other professionals where needed to do so.\n\nThe single most important habit, and the one the weekly audit checks for, is this: DATE everything you update. If you add or change any information, put the date against it. Without dates it is impossible to tell whether an entry is this week's work or months old, and it looks like nothing has moved on. Continuity is shown by dated, weekly updates, not by how much text there is.\n\nIf there are ANY changes, update the paperwork (care plans, safety assessment) immediately. If you cannot do it yourself, hand it over to another qualified nurse, even if it is not their patient. If you are on annual leave, agree cover with the other named nurse and tell them when things need updating. Any concerns, seek support from your B6/B7.",
        tip: "If you touch a record, date it. That one habit is what the audit is looking for.",
      },
      {
        id: "admission",
        title: "On admission (do once)",
        content:
          "Complete these once, when the patient is admitted:\n\n- My Care Plan - commence it with all the details you have to hand (or continue the community one). Document 'unable to establish on admission' rather than leaving sections blank\n- Risk Management Plan (RMP)\n- Physical health assessment - completed fully, including height and weight\n- Advocacy (IMHA) referral - offered\n- Rights read to the patient (Section 132) - if the patient lacks capacity, document this on the S132 rights form (it shows you attempted to explain their rights)\n- Consent to share information - asked\n- Start the safety plan and record a baseline HONOS\n- Inform the patient of their named nurse and email the named nurse; inform carers if the patient consents\n\nIf the physical health assessment identifies any need, create an interventions care plan for that need.",
        tip: "New admissions are the busiest point - the Admission Checklist guide walks the full arrival list.",
      },
      {
        id: "weekly",
        title: "Every week",
        content:
          "Refresh these weekly (unless there is a change or something new to add), and put the date on each update:\n\n- My Care Plan - update it, or start a new one if there is none. Complete the 'intervention and support' section. Make sure the patient's voice is updated, importantly in the mental health and level-of-observations sections\n- Offer the care plan to the patient (print a paper copy if they would rather complete it outside the 1:1)\n- Risk screening tool\n- Named nurse 1:1 - have it and record it on SystmOne as 'named nurse 1:1'\n- Carer's contact - contact the carer/family and offer them support too; record on SystmOne as 'carer's contact'. If you cannot reach them, record that too\n- Red folder contents, including the ward round sheet, and print off new care plans\n- Capacity assessment in relation to their care/care plans if anything has changed (you can do this in the 1:1)\n- Consent to share information - update in the care plan and document the discussion in the notes\n- MUST (unless indicated otherwise, e.g. already being seen by a dietitian)",
        tip: "Care plans are updated WITH the patient, not just about them - record their input and the date.",
      },
      {
        id: "monthly",
        title: "Every month",
        content:
          "Refresh these monthly, unless something changes sooner:\n\n- Waterlow (if necessary - if no need identified, review when there is a change)\n- Physical health assessment\n- Falls assessment\n- HONOS\n\nMonthly items still get a date each time, even if little has changed.",
        tip: "A dated 'reviewed, no change' entry is still evidence the review happened.",
      },
      {
        id: "triggers",
        title: "Triggered by an event (not the calendar)",
        content:
          "Some things are driven by a change rather than a timer:\n\n- Safety plan - completed on admission, updated on any change, and again on discharge\n- After ANY incident - update the risk screening tool and the Risk Management Plan (a post-incident debrief feeds these)\n- Read rights again (Section 132) on: transfer between wards, change of Responsible Clinician (RC), or any change in the patient's capacity\n- Physical health assessment - update if there is a significant change\n- If a physical health need is identified at any point, create an interventions care plan for it",
        tip: "An incident with no matching risk/RMP update stands out in the audit - do it the same day where you can.",
      },
      {
        id: "care-plan-how",
        title: "How the My Care Plan works",
        content:
          "My Care Plan should already exist from the community for known patients. On admission the admitting nurse commences it with the details to hand.\n\n- The named nurse, OT and psychology all input into it using the agreed template; the named nurse holds overall responsibility for keeping it up to date\n- Complete all aspects of the agreed template to meet the AIMS standards\n- The weekly MDT is a prompt to update it; OTs feed in their goals after their 1-2 day initial contact and 72-hour assessment\n- Keep the patient's voice throughout - use the patient prompt sheet to support them\n- For a complex, lengthy plan, use 1:1 time to make a short bullet-point summary (helpful for bank/agency staff too)\n- Keep the office white board up to date with the traffic-light system: red = not complete, green = complete and up to date",
        tip: "Document 'unable to establish on admission' rather than leaving a section blank.",
      },
      {
        id: "audit",
        title: "The weekly audit (why dates matter)",
        content:
          "The ward runs a weekly audit across all patients, checking the above is current. The recurring feedback is simple: put dates on everything you update, so it is clear what is new and what is old. Care-plan completion is also monitored via the 72-hour audits and the ward leadership care-plan reports, which are there to support you.\n\nNew admissions are excluded from that week's audit while they settle in.\n\nIf your entries are dated and kept to the cadence above, the audit shows continuity and active, patient-centred care.",
        tip: "If in doubt: date it, and note the patient's input.",
      },
    ],
  },
  dols: {
    id: "dols",
    title: "DoLS Ward Guidance",
    description: "Deprivation of Liberty Safeguards - when they apply, DoLS vs the MHA, and how the ward applies for authorisation",
    steps: [
      {
        id: "what",
        title: "What DoLS is, and who it covers",
        content: `The Deprivation of Liberty Safeguards (DoLS) are part of the Mental Capacity Act 2005. They give legal protection (Article 5, the right to liberty) to people who are deprived of their liberty in a hospital or care home when they:\n\n- are aged 18 or over,\n- lack the capacity to consent to their care / accommodation arrangements, and\n- are being kept there in their own best interests.\n\nDoLS do NOT apply to anyone detained under the Mental Health Act.\n\nWho does what:\n- Managing Authority = the Trust (in practice, the ward manager) - applies for authorisation.\n- Supervisory Body = the Local Authority (Derby City Council or Derbyshire County Council) - assesses and authorises.`,
        tip: "On a psychiatric ward, a patient who lacks capacity to consent to being there is very likely being deprived of their liberty - so this needs actively considering, not assuming.",
      },
      {
        id: "quick-decision",
        title: "Quick decision: MHA, DoLS, or neither?",
        content: `A fast way to orient yourself (then check the detail below):\n\n1. Does the person have CAPACITY to consent to being here and to their treatment? If yes and they consent - no MHA, no DoLS needed. If they have capacity and REFUSE, you cannot use DoLS; if they need to be kept for treatment of a mental disorder, that is the MHA.\n\n2. They LACK capacity. Are they being deprived of their liberty (the acid test: continuous supervision and control + not free to leave)? If no - act in their best interests under the MCA, no DoLS needed. If yes, keep going.\n\n3. Is the deprivation mainly to give treatment for a MENTAL DISORDER, and are they OBJECTING? Use the MHA.\n\n4. Otherwise - lacks capacity, not objecting, and the deprivation is for their broader care (often physical health or frailty) and they are not detainable under the MHA - that is DoLS.`,
        tip: "The safest error is to ASK. An unauthorised deprivation of liberty is unlawful - a quick conversation with the responsible clinician and senior nurse settles which route applies.",
      },
      {
        id: "acid-test",
        title: "Is it a deprivation of liberty? (the acid test)",
        content: `From the Supreme Court in Cheshire West (2014), a person is deprived of their liberty if ALL three are true:\n\n1. They are under continuous (complete) supervision and control, AND\n2. They are not free to leave (they would be stopped if they tried), AND\n3. They lack capacity to consent to these arrangements.\n\nThese things do NOT change the answer:\n- whether the person is compliant or not objecting,\n- the reason or purpose of the placement,\n- how "normal" the placement is.\n\nSigns that "control" is happening: preventing attempts to leave; controlling movement, assessments, residence or social contacts for a significant period; refusing to discharge the person to carers; using restraint or regular medication to control behaviour.`,
      },
      {
        id: "dols-or-mha",
        title: "DoLS or the Mental Health Act?",
        content: `This is the key ward decision:\n\n- If the person needs treatment for a mental disorder and is OBJECTING to being in hospital or to that treatment, treat them as you would a person WITH capacity who is refusing - use the Mental Health Act, not DoLS.\n- DoLS is for a person who lacks capacity, is NOT objecting, and is not liable to be detained under the MHA (often where the deprivation is about broader care needs, e.g. physical health or frailty).\n- A person is NOT eligible for DoLS if they are detained, or liable to be detained / recalled, under the MHA.\n- DoLS cannot be used if admission is SOLELY to protect other people.\n\nDoLS covers whatever care is in the person's best interests; the MHA covers treatment for mental disorder. If you are unsure which applies, raise it urgently with the responsible clinician and the senior nurse.`,
      },
      {
        id: "least-restrictive",
        title: "Try the least restrictive option first",
        content: `Before anyone applies for an authorisation, consider how the care could be given WITHOUT depriving the person of their liberty. If a deprivation genuinely cannot be avoided, it must be for no longer than necessary.\n\nThe care plan must show that the restrictions are in the person's best interests, are a proportionate response to the likelihood and seriousness of harm, and that there is no less restrictive way to achieve the same aim.`,
      },
      {
        id: "apply",
        title: "Applying: urgent vs standard authorisation",
        content: `STANDARD - apply to the Local Authority BEFORE the deprivation starts (e.g. when a care plan is agreed that would deprive the person of liberty). The Local Authority commissions the assessments and must complete them within 21 days. The maximum authorisation is 12 months.\n\nURGENT - if the deprivation is already happening or is needed straight away, the ward (managing authority) can grant ITSELF an urgent authorisation. It makes the deprivation lawful for up to 7 days, and a standard authorisation must be requested at the same time. If more time is genuinely needed, the Local Authority can extend the urgent authorisation by up to a further 7 days (ask before it expires).\n\nA DoLS authorisation does NOT authorise treatment - treatment is still given with consent or under the MCA best-interests process.`,
        tip: "Urgent authorisations are for sudden, unforeseen needs - not a substitute for planning ahead with a standard application.",
      },
      {
        id: "assessments",
        title: "The 6 assessments the Local Authority makes",
        content: `When the ward applies, the Local Authority checks six things:\n\n1. Age - 18 or over.\n2. Mental health - has a mental disorder (within the meaning of the MHA).\n3. Mental capacity - lacks capacity to consent to being in hospital.\n4. Eligibility - not detained or subject to recall under the MHA.\n5. Best interests - the deprivation is in their best interests, necessary to prevent harm, and proportionate.\n6. No refusals - it does not conflict with a valid advance decision, or a decision by an attorney (LPA) or a Court-appointed deputy.\n\nIf any is not met, the application is refused and a less restrictive way of providing care must be found.`,
      },
      {
        id: "duties",
        title: "What the ward has to do",
        content: `Ward staff:\n- Make sure a capacity assessment (for admission and treatment) is done on admission - escalate urgently if not.\n- Make sure the care plan reflects best interests, proportionality and least restriction.\n- Complete the standard forms fully, upload them to the electronic record, and send them to the Local Authority DoLS team.\n- Notify the Mental Health Act Office, and notify the CQC of new authorisations.\n- Keep a record of DoLS patients and authorisation expiry dates, and remind clinicians of key dates.\n\nSenior nurse:\n- Tell the patient AND their representative about their rights - to request a review, to challenge at the Court of Protection, to an IMCA, and to complain - both verbally and in writing, and record this on the electronic record.\n- Notify family / carers when an urgent authorisation is requested, so they can offer support.`,
      },
      {
        id: "rights-review-transfer",
        title: "Rights, IMCA, reviews and transfers",
        content: `- IMCA: if there is no-one appropriate to consult about the person's best interests, an Independent Mental Capacity Advocate must be requested. The patient or their representative can also ask for one.\n- Review / challenge: the patient, their representative, attorney, deputy or IMCA can ask the Local Authority for a review, or challenge the deprivation at the Court of Protection.\n- Transfers: a DoLS authorisation STOPS being valid if the person moves to another hospital or care home. The receiving place must apply for a fresh authorisation - so flag it when arranging any transfer, in or out of the Trust.`,
      },
      {
        id: "pitfalls",
        title: "Common pitfalls and myths",
        content: `- "They're not complaining, so it's fine." Compliance or not objecting does NOT stop it being a deprivation of liberty (Cheshire West was explicit).\n- "DoLS lets me treat them." It does not. DoLS only makes the deprivation lawful - treatment is separate, under consent or the MCA best-interests process.\n- "They can leave any time." If they would be stopped or brought back, they are not free to leave - that is the test, whether or not they have tried.\n- "It's only for a few days, so leave it." Any deprivation needs a legal basis from the start - use an urgent authorisation on day one and request the standard at the same time.\n- "Once it's authorised we're done." Keep reviewing - if capacity returns, a less restrictive option appears, or the person becomes detainable under the MHA, the basis may need to change. DoLS also lapses on transfer.\n- "It covers under-18s." DoLS is 18+. For 16-17s a different route applies (Court of Protection; parental responsibility does not stretch to a deprivation of liberty).`,
      },
      {
        id: "examples",
        title: "Worked examples",
        content: `1. Older adult with dementia, informal, not objecting, needs constant supervision and would be brought back if they left, lacks capacity to consent to being on the ward. -> A deprivation of liberty; not objecting to / not detainable for mental-disorder treatment -> DoLS (urgent now + standard requested).\n\n2. Person with psychosis who lacks capacity, is actively trying to leave, and is refusing the antipsychotic they need. -> Objecting + needs treatment for a mental disorder -> MHA assessment, not DoLS.\n\n3. Person with a learning disability admitted for physical treatment, lacks capacity, settled and compliant, but under continuous supervision and not free to leave. -> Compliance is irrelevant; still a deprivation -> DoLS.\n\n4. Person WITH capacity who consents to admission and treatment. -> Neither DoLS nor MHA; document the capacitous consent.`,
      },
      {
        id: "faq",
        title: "Quick answers",
        content: `- Do I need DoLS if they're happy to stay? Possibly yes - if they lack capacity and are under continuous supervision and not free to leave, being content does not remove the need.\n- Does DoLS authorise medication or treatment? No - that is consent or the MCA best-interests process.\n- What if they regain capacity? The DoLS no longer applies - tell the Local Authority (suspend) and review.\n- What if they need the MHA instead? DoLS is not available while someone is detained or liable to be detained under the MHA - switch to the MHA route.\n- How long does an urgent authorisation last? Up to 7 days (the Local Authority can extend by up to 7 more). Request the standard at the same time.\n- Who authorises? The Local Authority (supervisory body) authorises; the ward (managing authority) applies and can self-grant the urgent authorisation.`,
      },
      {
        id: "forms",
        title: "Forms and where to get them",
        content: `Managing-authority forms:\n- Form 1 - request a standard authorisation and/or grant an urgent authorisation (also used to extend an urgent authorisation).\n- Form 2 - request a further standard authorisation (when the current one is ending).\n- Form 7 / Form 10 - suspension (eligibility no longer met) or review of a current authorisation.\n- Form 12 - notification to the coroner of a death.\n\nThe Local Authority replies on Form 5 (authorisation granted) or Form 6 (refused).\n\nDownload the standard forms from GOV.UK ("Deprivation of Liberty Safeguards: resources"). The Trust DoLS Policy and the DoLS office contacts are on FOCUS; the MHA Office / MCA-MHA team can help.`,
      },
      {
        id: "lps",
        title: "A note on LPS",
        content: `The Liberty Protection Safeguards (LPS) were passed to replace DoLS, but their implementation has been shelved with no confirmed date. So DoLS remains the law and the process to follow.`,
      },
    ],
    focus: [{ label: "Deprivation of Liberty (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1794/2454" }],
    caseNote: `Possible deprivation of liberty considered for [PATIENT] on [DATE]: lacks capacity to consent to admission / care, under continuous supervision and control, and not free to leave. Not detained or liable to be detained under the MHA. Discussed with the responsible clinician and senior nurse. [Urgent authorisation granted by the ward at [TIME] on [DATE], valid 7 days; standard authorisation requested from the Local Authority the same day.] Least-restrictive options considered; care plan updated. Patient and representative informed of their rights (review, Court of Protection, IMCA, complaints) verbally and in writing. MHA Office and CQC notified. Recorded by [NURSE].`,
  },
  "blanket-restrictions": {
    id: "blanket-restrictions",
    title: "Blanket Restrictions & Restrictive Practice",
    description: "What counts as a restrictive practice or a blanket restriction, which are allowed, and how to justify and review a restriction",
    focus: [
      { label: "Brief guide - blanket restrictions on mental health wards (Trust)", url: "https://focus.derbyshirehealthcareft.nhs.uk/application/files/5815/6595/2361/Brief_guide_blanket_restrictions_mental_health_wards.pdf" },
    ],
    steps: [
      {
        id: "what",
        title: "What this is about",
        content: `The Trust must use the LEAST restrictive practice necessary at all times (Positive and Proactive Care, 2014; the Mental Health Act Code of Practice, 2015; and a CQC-regulated expectation).\n\nThis applies to detained AND informal patients. A restriction is only ever a proportionate, measured response to an identified risk - never used to punish or humiliate, and for no longer than necessary.`,
      },
      {
        id: "three-types",
        title: "Three things that get confused",
        content: `- Restrictive INTERVENTIONS - deliberate acts to take control of a dangerous situation: physical intervention, rapid tranquillisation, seclusion. (Each covered by its own Trust policy.)\n- Restrictive PRACTICES - things that limit liberty to keep people safe: room / rub-down searches, restricting access to courtyards / kitchens / calm rooms, monitoring communications and visits, locking ward doors, observations.\n- BLANKET restrictions - rules applied to ALL patients (or a class of patients) routinely, WITHOUT an individual risk assessment.`,
      },
      {
        id: "blanket",
        title: "Blanket restrictions - the rule",
        content: `A blanket restriction is a rule applied to everyone without an individual risk assessment. The MHA Code of Practice only allows them in very specific circumstances.\n\nThey should be avoided unless they are a necessary and proportionate response to identified risk, applied for no longer than can be shown to be necessary, with their impact on each patient considered and documented.\n\nExamples of blanket restrictions to AVOID (unless individually justified): forbidding takeaway food, banning mobile phones / chargers, locking the ward door just because it is busy, no snacks or drinks.`,
      },
      {
        id: "individual",
        title: "The individualised approach",
        content: `A patient would normally have access to all the activities of the unit. Removing access, for a clinical or risk reason, must be:\n\n- based on a multidisciplinary risk assessment,\n- with a clear rationale for why it is not appropriate right now, and\n- with a review date.\n\nTell the patient why the decision was made, and how and when it will be reviewed. Document the decision, and its impact on the patient, on the electronic record.`,
      },
      {
        id: "authorised",
        title: "Trust-authorised blanket restrictions (these ARE allowed)",
        content: `These are agreed across all inpatient services as necessary and proportionate:\n\n- No smoking (smoke-free Trust) and no ignition sources (lighters / matches) on the ward.\n- No alcohol, illicit drugs, or new psychoactive substances (NPS) on Trust premises.\n- No illegal pornographic material, and no material that incites violence or racial / cultural / religious / gender hatred.\n- No weapons (firearms are never allowed, even if legally held; a knife held for religious reasons is individually risk-assessed).\n- Doors into inpatient units are access-controlled; on Adults of Working Age wards, patients are escorted to the door to leave.\n- Access to courtyards / outdoor spaces is restricted at night (opened on an individual or group basis when staffing allows).\n- Quiet rooms on the Carsington and Derwent units are locked (no door-alarm fitted), so patients access them when escorted by staff.`,
      },
      {
        id: "not-blanket",
        title: "What must NOT be a blanket restriction",
        content: `These should NOT be applied to everyone - they need individual justification, documented (possible exceptions in the Low Secure Unit):\n\n- Access to (or banning) mobile phones and chargers.\n- Random searches without due cause.\n- Food restrictions, or buying takeaway food.\n- Monitoring telephone calls.\n- Access to the internet.`,
      },
      {
        id: "authorise-review",
        title: "Authorising and reviewing a ward-level restriction",
        content: `If a ward needs a blanket restriction over and above the Trust-wide list:\n\n- explore less restrictive alternatives first,\n- get it authorised by the Ward Manager or above,\n- keep it proportionate and for the shortest reasonable time,\n- tell every affected patient why, and document it,\n- review it at the ward Clinical Meeting and in the daily huddle / handover, and\n- have the Ward Manager record it on the ward's register of blanket restrictions.\n\nIf it needs to run indefinitely, agree it with the Hospital Managers and take it to the Reducing Restrictive Practice Group for oversight. Communicate it clearly to patients and visitors (for example, signage in reception).`,
      },
      {
        id: "contraband",
        title: "Prohibited and restricted items",
        content: `The ward contraband list (the Working Age Adult Acute Inpatient Services Contraband List) sorts items into three groups. Always check the current list on your ward - it is kept in step with the Trust Smoke Free policy and updated from time to time.\n\nBANNED outright (no patient may have them): ignition sources (lighters, matches), alcohol, illicit drugs, new psychoactive substances, illegal pornography, material inciting violence or hatred, weapons, coat hangers, plastic bags, vapes bought outside the hospital, tobacco and cigarettes, chewing gum.\n\nRESTRICTED - allowed only after an individual risk assessment: glass items, mirrors and bottles, scissors, clippers and files, razors, aerosols, essential oils, metal cans.\n\nADVISORY - discouraged but a personal choice: more than £20 in cash, expensive jewellery, watches or clothing.`,
      },
    ],
    caseNote: `Individual restriction agreed for [PATIENT] on [DATE] following MDT risk assessment: [RESTRICTION]. Rationale: [RISK]. Less restrictive options considered. Discussed with the patient, including the impact and how / when it will be reviewed (review date [DATE]). Documented on the electronic record. Agreed by [MDT / lead].`,
  },
  honos: {
    id: "honos",
    title: "HoNOS & Clustering explained",
    description: "What the Health of the Nation Outcome Scales are, how to score them, and how they drive clustering - written guidance, not the SystmOne tool",
    steps: [
      {
        id: "what",
        title: "What HoNOS is",
        content: `HoNOS (Health of the Nation Outcome Scales) is a set of 12 scales that rate a person's mental health and social functioning. Each scale is scored 0 (no problem) to 4 (severe), based on the last 2 weeks.\n\nIt is an OUTCOME measure: you repeat it over time (admission, review, discharge) to see whether the person is getting better.\n\nIt is not a diagnosis and not a risk assessment - it is a snapshot of how someone is doing across behaviour, symptoms, physical/cognitive health and social life.\n\nThe adult version is used here. There are variants for other groups (HoNOS 65+ for older adults, HoNOSCA for children and adolescents, HoNOS-Secure for forensic settings).`,
        tip: "Rate what has actually been seen or reported in the rating period - from the notes, your own observations and the MDT - not a general impression.",
      },
      {
        id: "when",
        title: "When you complete it",
        content: `On our wards, complete HoNOS:\n\n- as a BASELINE on admission (so there is a starting point),\n- at review (monthly), and\n- at discharge.\n\nDoing it at these points lets you compare scores and show whether care is working. Also repeat it after any significant change. The Care Review here reminds you when the next HoNOS is due.`,
      },
      {
        id: "scales",
        title: "The 12 scales",
        content: `The 12 scales fall into four groups:\n\nBEHAVIOUR\n1. Overactive, aggressive, disruptive or agitated behaviour\n2. Non-accidental self-injury\n3. Problem drinking or drug-taking\n\nIMPAIRMENT\n4. Cognitive problems (memory, orientation, understanding)\n5. Physical illness or disability problems\n\nSYMPTOMS\n6. Problems with hallucinations and delusions\n7. Problems with depressed mood\n8. Other mental and behavioural problems (e.g. anxiety, phobic, OCD, eating, sleep - specify which)\n\nSOCIAL\n9. Problems with relationships\n10. Problems with activities of daily living\n11. Problems with living conditions\n12. Problems with occupation and activities`,
      },
      {
        id: "score",
        title: "How to score each scale (0-4)",
        content: `Every scale uses the same anchor points:\n\n- 0 - no problem\n- 1 - minor problem, needs no action\n- 2 - mild problem, definitely present\n- 3 - moderately severe problem\n- 4 - severe to very severe problem\n\nUse 9 only if the rating is genuinely not known.\n\nRating rules:\n- Rate the MOST SEVERE occurrence in the period (usually the last 2 weeks).\n- Work through the scales in order, 1 to 12.\n- Do not count the same problem twice - if you rated it on an earlier scale, do not rate it again on a later one.\n- Rate a behaviour on the behaviour scale (1 or 2) even when a symptom is driving it - the symptom itself is rated separately on 6, 7 or 8.`,
        tip: "Use the HoNOS glossary / rating guide for each scale's anchor points - it gives worked examples of what a 2 vs a 3 looks like, which keeps ratings consistent between different raters.",
      },
      {
        id: "clustering",
        title: "How clustering works",
        content: `HoNOS is the backbone of the Mental Health Clustering Tool (MHCT). The MHCT is the 12 HoNOS scales PLUS a Summary Assessment of historical and risk items. Together these scores group the person into one of the care CLUSTERS (0-21).\n\nThe clusters sit in three broad super-classes:\n- Non-psychotic (clusters 1-8)\n- Psychotic (clusters 10-17)\n- Organic (clusters 18-21)\n\nA cluster describes NEED, not a diagnosis. It is used to plan care and, historically, to set the care 'currency' / funding. Because the cluster is driven by the HoNOS scores, rating HoNOS accurately matters - a wrong score can put someone in the wrong cluster.`,
        tip: "The tool SUGGESTS a cluster from the scores, but clinical judgement decides the final one - the MDT can override the suggested cluster with a documented reason.",
      },
      {
        id: "tips",
        title: "Getting the ratings right",
        content: `- Base each rating on evidence (observations, notes, MDT discussion), not a gut feeling.\n- When you are unsure between two scores, discuss it in the MDT.\n- Do not leave scales blank - score 0 if there is no problem, or 9 only if it is genuinely not known.\n- Remember it is a snapshot of the rating period, not the person's whole history.\n- Look at the previous HoNOS to see the direction of travel (better, the same, or worse).`,
      },
      {
        id: "s1",
        title: "Where it goes on SystmOne",
        content: `Record HoNOS on SystmOne (see the how-to below). Complete it at admission (baseline), each monthly review, and at discharge, so the outcome can be tracked. It shows on the patient's Care Review here.\n\nThis is a scored SystmOne tool with a lot of clicks - this guide explains WHAT to score and WHY; do the scoring itself on SystmOne.`,
      },
    ],
    focus: [
      { label: "HoNOS & Clustering on SystmOne (Trust how-to)", url: "https://focus.derbyshirehealthcareft.nhs.uk/application/files/4217/3633/9115/SystmOne_-_Honos_and_Clustering_v1.1.pdf" },
      { label: "HoNOS SOP", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/3479/2456" },
      { label: "About HoNOS (RCPsych)", url: "https://www.rcpsych.ac.uk/improving-care/ccqi/health-of-nation-outcome-scales" },
    ],
    caseNote: `HoNOS completed on [DATE] ([baseline on admission / monthly review / discharge]). Scores recorded on SystmOne; total [X]. Scales of note: [e.g. 1 Agitated behaviour 3, 7 Depressed mood 3]. Compared with previous HoNOS ([DATE], total [Y]): [improved / unchanged / deteriorated]. Suggested cluster [N] - agreed / amended by MDT. Discussed at MDT.`,
  },
  // Built 2 Aug 2026 from ONE document - the Occupational Therapy Service
  // Pathway for The Radbourne Unit, supplied by the ward OT team via Georgia.
  // Deliberately a faithful restructure of that document: no synthesis across
  // policies, no interpretation, no scoring. See BACKLOG Section S.
  // The source carries no version, review date or owner, and names one unit,
  // so the provenance caveats in step 1 are load-bearing - do not remove them
  // until a controlled copy turns up on FOCUS.
  "ot-pathway": {
    id: "ot-pathway",
    title: "OT Pathway (inpatient)",
    description: "What occupational therapy does across an admission and when - contact by day 2, screening by day 7, care plan by day 10, then Hub referral, transfer and discharge",
    steps: [
      {
        id: "what",
        title: "What this is",
        tldr: "The OT timeline across an admission, with the timescales attached.",
        content: "This is the occupational therapy pathway for an inpatient admission, laid out in order with the timescales attached.\n\nIt is written for the OT and the OT assistant working the pathway, and for the ward team who need to know what OT is doing, by when, and what OT needs from them.\n\nRead the timescales as the service's own standard. What you do at each stage is a clinical decision, and the source pathway says so itself: 'What you choose to do will be based upon own clinical judgment. There is no right or wrong way of achieving this.'\n\nWhere this came from:\n- One document: the Occupational Therapy Service Pathway for The Radbourne Unit, supplied by the ward OT team.\n- That document names one unit. [confirm] whether it applies to your ward before you rely on the timings.\n- It carries no version number, review date or owner, so treat it as a team working document rather than a ratified Trust SOP until a controlled copy turns up on FOCUS.",
        tip: "If this does not match how your ward actually runs, say so. This guide is only as good as the document behind it, and that document has not been signed off yet.",
      },
      {
        id: "timeline",
        title: "The pathway at a glance",
        // Every job below is a line from the pathway document, with the day the
        // document puts it on. The four with no day are the ones the pathway
        // writes as "throughout" or ties to an event that may never happen, so
        // they start unticked and carry the pathway's own wording instead.
        commitTasks: [
          { id: "contact", title: "OT initial contact - meet, greet and record on SystmOne", day: 2, category: "other", priority: "important" },
          { id: "reqol", title: "ReQoL initiated (OTA)", day: 2, category: "assessment" },
          { id: "physical", title: "Physical health and equipment needs checked", day: 2, category: "assessment", priority: "important" },
          { id: "home", title: "Accommodation, home and equipment details gathered", day: 2, category: "discharge_planning", priority: "important" },
          { id: "screening", title: "OT priority checklist, or OT initial assessment where need is high", day: 7, category: "assessment" },
          { id: "signoff", title: "Screening signed off by a registered OT, level of intervention set", day: 7, category: "assessment", priority: "important" },
          { id: "ward-round", title: "OT needs formulated for the first ward review", day: 7, category: "documentation" },
          { id: "recreation", title: "Recreation team service introduced and leaflet offered", day: 7, category: "other" },
          { id: "care-plan", title: "OT care plan completed with the patient", day: 10, category: "documentation", priority: "important" },
          { id: "interventions", title: "Intervention planning and implementation begun", day: 10, category: "other" },
          { id: "hub-referral", title: "Hope and Resilience Hub referral, based on identified need", when: "when the person is ready - Hub groups can be accessed at any point", category: "referral", optional: true },
          { id: "transfer-review", title: "OT review after an internal ward transfer", when: "within 3 working days of the transfer", category: "assessment", priority: "important", optional: true },
          { id: "discharge", title: "Review goals, support discharge planning, discharge report as appropriate", when: "at readiness for discharge", category: "discharge_planning", optional: true },
          { id: "reqol-followup", title: "Follow-up ReQoL completed", when: "at discharge, timing at your discretion", category: "assessment", optional: true },
        ],
        content: "Day 1 - ward admission.\n\nWithin 1-2 days:\n- Initial OT contact made\n- ReQoL initiated by the OTA\n- Physical health and equipment needs checked\n\nDays 3 to 7:\n- OT priority checklist, or an OT initial assessment where the need is clearly high\n- A registered OT signs off the screening and sets the level: high, medium or low\n\nDay 7:\n- OT attends the ward round, formulation of OT needs\n- The recreation team has introduced its service\n\nBy day 10 at the latest:\n- OT care plan completed at ward level, with the patient or as a best interests plan\n- Intervention planning and implementation\n\nThen, throughout:\n- Hub OTs review care plans and assessments and amend accordingly\n- Ward OTs review the needs of internal ward transfers, within 3 working days\n- Review goals, support discharge planning, discharge report as appropriate, ReQoL repeated",
        tip: "Only one timescale in the whole pathway is stated in working days: the 3 days after an internal ward transfer. The rest are written as plain days.",
      },
      {
        id: "who",
        title: "Who does what",
        tldr: "The OTA gathers, the registered OT decides. That line runs through the whole pathway.",
        progressive: true,
        content: "The pathway draws one boundary very clearly, and it is worth reading before the rest.\n\nThe OT assistant (OTA):\n- Makes initial contact and explains their role\n- Initiates the ReQoL\n- Completes the OT priority checklist: gathering information, observing, speaking to the patient, reading the notes, speaking to carers and others\n- Completes the follow-up ReQoL at discharge\n\nThe pathway's own wording is that the OTA is gathering facts, not formulating. It adds that it is helpful to have the formulation discussion together.\n\nThe registered OT:\n- Signs off the screening and decides the level of intervention: high, medium or low\n- May initiate a formal OT initial assessment instead of the checklist where the need is clearly high\n- Formulates OT needs and takes them to the ward round\n- Completes the care plan with the patient\n\nThe ward team:\n- Can support the ReQoL - the pathway is explicit that it is not an OT measure\n- Makes referrals to physiotherapy, the manual handling lead and the tissue viability nurse\n- Shares responsibility for maintaining routine and structure where the care plan asks for it\n- Provides the evidence OT asks for: has this person been washing and dressing on the ward?",
        tip: "The level of intervention is a registered OT's decision. Nothing here, and nothing in wardHub, sets it for them.",
      },
      {
        id: "contact",
        title: "Within 1-2 days: making contact",
        content: "Within 1-2 days of admission, someone from OT makes contact. It might be the OT or the OTA.\n\nMeet and greet:\n- Explain who you are and what your role is. Say whether you are the OT or the OTA.\n- Offer the information leaflet.\n- Put it in the patient's red folder, if they have one.\n- Record this as the initial contact on SystmOne. This is auditable.\n\nReQoL:\n- The OTA initiates the ReQoL, a patient reported outcome measure.\n- It is not an OT measure. The whole MDT can support its completion.\n- It is repeated at discharge as a follow up.",
        tip: "'Record this as the initial contact on SystmOne. This will be auditable.' That sentence is the document's, not ours. The contact only counts if it is written down.",
      },
      {
        id: "physical",
        title: "Within 1-2 days: physical health and the home",
        tldr: "Longest lead times in the pathway. Start the paperwork while the admission is still young.",
        progressive: true,
        content: "The pathway red-flags this stage, and it is the one with the longest lead times. Anything involving a landlord, a housing association or a repair takes weeks, so the reason for doing it in the first two days is that the paperwork is moving early.\n\nEquipment:\n- Does the patient need equipment while they are in hospital? Assess the need and order it to the ward.\n- Will equipment need to be provided at home? Planning for installation starts now.\n\nTheir accommodation:\n- Do they have their own accommodation? Is it rented, owned, or housing association?\n- Where there is a landlord or a housing association, you will need to write for permission before equipment goes in. Make contact early.\n- Is a home visit needed? Start planning it.\n\nThe state of the property:\n- Does it need repair? Is there a fire risk, hoarding, or general disrepair?\n- Will quotes be needed to make it habitable and safe? Contact the housing hub for quotes.\n\nReferrals the ward team may need to make:\n- Physiotherapy\n- Manual handling lead\n- Tissue viability nurse\n\nGather the details even where you cannot act on them yet. The pathway's own reasoning: this will take time, therefore gathering details will be time efficient.",
        tip: "These are the items that turn into discharge barriers six weeks later. If your ward uses wardHub jobs, this is the stage worth logging as a barrier while it is still just a phone call.",
      },
      {
        id: "screening",
        title: "Days 3 to 7: the priority checklist",
        progressive: true,
        content: "Between days 3 and 7 the patient is screened. Which route is taken depends on how much OT need is already obvious.\n\nThe OT priority checklist:\n- The OTA completes it: gathering information, observation, speaking to the patient.\n- It can be used informally too - from the notes, from carers, from others who know the person.\n- Its job is to screen, so the registered OT can decide whether OT intervention is needed at all.\n- There is a separate prompt sheet that walks it: motivation, routine, performance skills and environment.\n\nSetting the level:\n- The screening is signed off by a registered OT, who decides high, medium or low priority.\n- They may ask for more information before they decide.\n- Where there is no OT need, for example a low level one: signpost to recreation and encourage routine, so function does not decline.\n- Where there are high OT needs: see the next step.\n\nIf the person is too unwell to engage:\n- If at day 7 the person is not engaging and is unwell, it is acceptable to use the screening tool to help the OT with formulation.\n\nAlso in the first seven days:\n- The recreation team introduces its service, and its leaflet is offered.",
        tip: "The prompt sheet is being built into wardHub as its own guide. Until it lands, work from your team's copy.",
      },
      {
        id: "assessment",
        title: "Days 3 to 7: when a full assessment is used instead",
        content: "Where there is clearly a high level of need, the OT may choose to complete a formal OT assessment rather than the priority checklist. You may already know the need is high from records, from rapid reviews, or from a ward handover.\n\nHow the information gets gathered:\n- OCAIRS (the Occupational Circumstances Assessment Interview and Rating Scale), if the individual engages\n- The OT inpatient initial assessment form\n- MOHOST, as an observation tool\n- A practical assessment group\n\nThe purpose is to establish clear OT needs and set an initial plan with the individual. Where they cannot take part, it may be a best interests care plan at this stage.",
        tip: "MOHOST has its own explainer in wardHub if you want to know what the OT is looking at.",
      },
      {
        id: "ward-round",
        title: "Day 7: the first ward review",
        content: "From day 7 the OT initial assessment information feeds into the patient's first ward review. It helps the team with formulation and with the purpose of the admission.\n\nWard review schedules vary, so treat day 7 as a guide rather than a fixture.\n\nIf the person is unwell and not engaging, this is where you may be discussing a best interests plan.",
      },
      {
        id: "care-plan",
        title: "By day 10: the OT care plan",
        tldr: "An agreed plan, made with the patient, from the OT assessment. SMART goals.",
        content: "By day 10 at the latest, an initial care plan is completed with the patient. The information feeding it comes from your OT assessment.\n\nIt is an agreed plan, and the service user has been involved in creating it. Where they cannot be involved, it is a best interests care plan.\n\nThink SMART goals.\n\nCare plans evolve and change, and so will the individual's needs. The day 10 plan is a starting point, not a finished document.\n\nThe plan may be as simple as maintaining routine and structure and preventing a decline in skills - and the ward team have a responsibility to support that too.\n\nIt may also involve referral to Hub based groups or ward based groups. That is where intervention planning and implementation begin.",
      },
      {
        id: "interventions",
        title: "Interventions: ward level and the Hub",
        progressive: true,
        content: "Interventions occur at every level and they are not linear.\n\nAt ward level:\n- Support self-soothing, using sensory modulation, to change how the person feels through the senses\n- Help manage distressing symptoms\n- Build confidence and motivation, add structure and routine\n- Ward level groups are not necessarily focused on psychoeducation at this initial stage\n- Access to ward based activity groups, and to the recreation team\n\nThrough the Hope and Resilience Hub:\n- Referral and access to groups supporting self-care, productivity and leisure\n- Also skills, psychoeducation and moving on groups\n- Hub groups can be accessed at any point, when the person is ready\n- See the Hub programme for the purpose of each group\n\nWhat the Hub does with a referral:\n- Hub OT staff review any group referral and meet the person, to make sure the group meets their needs\n- At that point they can review the assessment and the goals, and add to them if the care plan has changed\n- Hub OT staff update the care plan and add an end review date as appropriate",
      },
      {
        id: "hub-referral",
        title: "Referring to the Hope and Resilience Hub",
        tldr: "Made on SystmOne, by ward or Hub staff. Every group needs a referral based on identified need.",
        content: "A referral to the Hub is made on SystmOne. It can be completed by ward or Hub staff.\n\nAll groups referred into the Hub need a referral based on the individual's identified needs, unless stated otherwise - a drop in group, for example.\n\nOn the referral screen:\n- Recipient: HUB, Hope & Resilience\n- Read code: Referral to mental health team\n- Type: Secondary care\n- Urgency: Routine\n- Task recipient: User group\n- Then write the referral narrative\n\n[confirm] Those field settings come from a screenshot of the referral screen supplied by the OT team. A worked example of the narrative has been asked for and is not here yet, so write it in your own words for now: what the person's identified need is, and which group you think meets it.",
        tip: "This is a candidate for its own step-by-step guide once there is a worked example to show. Ask your ward OT if you want one sooner.",
      },
      {
        id: "transfer",
        title: "Internal ward transfer",
        content: "Transfers may take place from one ward to another at any point in an admission. Some are planned - the pathway names ECW. [confirm] what ECW stands for on your unit.\n\nOnce a transfer is made:\n- The ward OT aims to review the patient's needs within 3 working days, to keep care continuous.\n- If further assessments are required, they are completed as per ward review.\n- Hub OTs review care plans and assessments, and amend them accordingly.",
        tip: "This is the one stage with a working-days clock on it, and the one most easily lost when a patient moves.",
      },
      {
        id: "discharge",
        title: "Discharge planning",
        progressive: true,
        content: "At readiness for discharge:\n- The ward or Hub OT may attend a discharge planning meeting if required, and liaise with the relevant people.\n- That meeting may happen a week before formal discharge, so make yourself familiar with when it is likely to take place.\n- Review goals, and sign them off if they have been met. That is the Hub OT if they set the goals, otherwise ward staff.\n\nThe follow-up ReQoL:\n- Completed by the ward OTA or the Hub team as a follow up.\n- When you complete it is at your own discretion - in the last session of their group, for example.\n\nOn the way out:\n- Signpost to other services, and offer the information pack that supports signposting.\n- Complete a discharge summary report where it is needed to support access to other services, or to refer to community OT staff.\n- Optional: complete a practical activity session as an outcome measure, to show change in function.",
      },
      {
        id: "aims",
        title: "What each stage evidences",
        tldr: "The pathway exists to evidence AIMS accreditation. Your record is the evidence.",
        progressive: true,
        content: "The pathway quotes AIMS standard numbers against each stage. AIMS is the Royal College of Psychiatrists' Accreditation for Inpatient Mental Health Services, run through its College Centre for Quality Improvement.\n\nThat is worth knowing for two reasons: it explains why the timings exist, and it means the record you leave at each stage is part of what the ward is assessed on.\n\n[confirm] The numbers below are the pathway document's own references. They have not been checked against the published AIMS standards, so treat them as a pointer rather than a citation.\n\nWithin 1-2 days:\n- AIMS 3, 7, 194\n\nDays 3 to 7:\n- AIMS 2\n\nBy day 10:\n- AIMS 21, 22, 42\n\nIntervention planning and implementation:\n- AIMS 31, 33, 34, 39, 40, 42, 45, 57, 195\n\nDischarge planning:\n- AIMS 76, 79, 194",
      },
    ],
    caseNote: "OT initial contact made [DATE]. Role explained ([OT / OTA]) and information leaflet offered. Leaflet [added to red folder / patient has no red folder]. ReQoL [initiated / to follow]. Physical health and equipment needs [checked, see below / none identified]. Next step: [OT priority checklist / OT initial assessment] by day 7.",
    related: [
      { label: "MOHOST (OT screening) explained", guideId: "mohost" },
      { label: "My Care Plan", guideId: "care-plan" },
      { label: "Admission Checklist", guideId: "admission-checklist" },
    ],
    sources: [
      { n: 1, label: "Occupational Therapy Service Pathway, The Radbourne Unit - ward OT team document, supplied 2 August 2026. No version number, review date or owner on the copy held" },
      { n: 2, label: "Priority Screening Prompt Sheet - ward OT team document, supplied 2 August 2026" },
      { n: 3, label: "AIMS (Accreditation for Inpatient Mental Health Services), Royal College of Psychiatrists College Centre for Quality Improvement. The standard numbers quoted in this guide are the pathway document's own references and have not been checked against the published standards" },
    ],
  },
  mohost: {
    id: "mohost",
    title: "MOHOST (OT screening) explained",
    description: "What the MOHOST occupational-therapy screen covers, how it is rated, and where it feeds - an explainer, not the licensed tool",
    steps: [
      {
        id: "what",
        title: "What MOHOST is (in one line)",
        content: "MOHOST - the Model of Human Occupation Screening Tool - is the occupational therapist's screen of how well someone is functioning in everyday occupation: their motivation, routines, communication, thinking, movement and environment.\n\nIt is based on the Model of Human Occupation (MOHO) and is one of the most widely used OT screens in UK inpatient mental health. It gives the team a shared, structured picture of what the patient can do, what is getting in the way, and where OT input will help.\n\nThis guide explains WHAT MOHOST looks at and WHY, so the whole team understands the OT assessment. It is not the scoring form itself.",
        tip: "Think of MOHOST as the OT equivalent of a structured overview - like HoNOS is for symptoms, MOHOST is for day-to-day functioning and occupation.",
      },
      {
        id: "why",
        title: "Why OTs use it (and why it suits mental health)",
        content: "MOHOST can be completed largely from observation and everyday contact, so it works well for patients who are unwell, withdrawn, suspicious, or who find formal question-and-answer assessments hard. The OT does not need the patient to sit a test.\n\nIt is designed to be repeated over time, so it shows change - improvement or deterioration - across an admission, and it feeds directly into goals, the care plan and discharge/placement planning.",
        tip: "Because it is unobtrusive and repeatable, it is often redone at reviews (for example around CPA / MDT review points) to track progress.",
      },
      {
        id: "areas",
        title: "The six areas it covers",
        content: "MOHOST screens occupational functioning across six areas (24 items in total):\n\n1. Motivation for occupation - how the person appraises their own ability, expects to succeed, shows interest, and makes choices.\n2. Pattern of occupation - their routine, roles, responsibility and adaptability.\n3. Communication & interaction skills - non-verbal skills, conversation, vocal expression and relationships.\n4. Process skills - knowledge, timing, organisation and problem-solving when doing a task.\n5. Motor skills - posture, mobility, coordination, strength and energy.\n6. Environment - the physical space and resources, social groups, and the demands of their occupations.",
        tip: "It is deliberately broad - person, their doing, and their environment - because occupation depends on all three.",
      },
      {
        id: "rating",
        title: "How it is rated",
        content: "Each item is rated on a simple four-point scale describing how much that area helps or hinders the person's occupational participation:\n\n- F = Facilitates participation (a strength)\n- A = Allows participation (okay, no real problem)\n- I = Inhibits participation (a difficulty)\n- R = Restricts participation (a major difficulty)\n\n(These are often recorded as 4 / 3 / 2 / 1.) The ratings are guided by clear criteria in the manual - it is a structured professional judgement, not a tick-box.",
        tip: "The point is the pattern across the areas, not one total number - it shows WHERE support is needed.",
      },
      {
        id: "uses",
        title: "What it is used for",
        content: "The MOHOST picture feeds into:\n\n- OT goals and the OT part of the care plan - specific, functional goals (routine, activity, self-care, social confidence).\n- MDT understanding - a shared view of day-to-day functioning, not just symptoms.\n- Discharge and placement planning - what level of support the person is likely to need at home or in a placement.\n- Tracking change - repeated over the admission to show progress.",
      },
      {
        id: "s1",
        title: "Where it fits - and a note on the tool itself",
        content: "MOHOST is a licensed, copyrighted tool (from the MOHO Clearinghouse / MOHO Web) with its own manual and forms - so the actual rating is done on the official MOHOST form / your OT recording system, not reproduced here.\n\nCheck your local OT process: your team may use MOHOST, a MOHOST-based initial assessment, or a local OT initial-assessment form. If you are not an OT, you do not complete MOHOST - but understanding it helps you read the OT notes and support the goals that come out of it.\n\nRecord the OT assessment and goals on SystmOne so the MDT and the care plan stay aligned.",
        tip: "Not sure what your ward OT actually uses? Ask them - and tell us, so we can point this guide at the right local form.",
      },
      {
        id: "resources",
        title: "Resources",
        content: "- Model of Human Occupation (MOHO) and MOHOST information: https://www.moho.uic.edu\n- Royal College of Occupational Therapists: https://www.rcot.co.uk\n\nMOHOST was developed by Sue Parkinson, Kirsty Forsyth and Gary Kielhofner.",
      },
    ],
  },
  prenoxad: {
    id: "prenoxad",
    title: "Prenoxad (take-home naloxone injection)",
    description: "Nurse-led supply of take-home naloxone under the PGD - for patients at risk of opioid overdose on leave or discharge",
    steps: [
      {
        id: "overview",
        title: "What Prenoxad is (in one line)",
        content: `Prenoxad is a take-home naloxone injection you can give a patient to take out on leave or discharge, so that if they (or someone near them) overdoses on opioids, a bystander can reverse it while the ambulance is on its way.\n\nNurse-led. No prescription. No doctor needed - supplied under a Patient Group Direction (PGD) by a trained, authorised registered nurse.\n\nWritten from the Trust PGD guidance (Feb 2024, v1; PGD valid to 30/10/2026). Nothing here overrides the PGD - if in doubt, read the PGD or ask Pharmacy / ward leadership.`,
        tip: "Offer it at extended leave or discharge - that is the danger point, because tolerance drops after a spell as an inpatient and an old 'normal' dose can now be fatal.",
      },
      {
        id: "name",
        title: "First, clear up the name",
        content: `- Prenoxad = take-home naloxone. It goes home with the patient, in the community, for emergency use by whoever is there.\n- This is NOT the emergency naloxone kept in the clinic room for use on the ward.\n- Same drug (naloxone), different job.\n\nWhen you talk to patients or colleagues, call it "Prenoxad, the take-home naloxone injection" so nobody mixes the two up.`,
      },
      {
        id: "can-issue",
        title: "Can I issue this?",
        content: `You can supply Prenoxad under the PGD only if ALL of these are true about you:\n\n- You are a registered nurse employed by DHCFT\n- You have read the PGD\n- You have watched the "How to administer naloxone (injectable)" training video\n- Your ILS / resuscitation and overdose-management training is in date (annual)\n- Your name is on your ward's PGD authorisation register, signed by you and a member of the leadership team\n\nIf any of these is missing, you are not yet signed off - see "Getting yourself signed off" below. It is quick.`,
      },
      {
        id: "when-who",
        title: "When do I offer it, and to whom?",
        content: `Offer Prenoxad at extended leave or discharge.\n\nThe patient is eligible when ALL of these are met (from the PGD):\n\n- DHCFT inpatient, aged 18 or over\n- At risk of a future opioid overdose, agreed at MDM/MDT\n- Valid consent given\n- Has completed the overdose-awareness + Prenoxad training (you deliver it, 5-10 min; a carer can be trained too)\n\n"At risk of opioid overdose" - flag at MDM if the patient has any of:\n\n- History of opioid dependence\n- Currently on OST (e.g. methadone, buprenorphine) or other prescription opioids\n- Injecting opioids\n- Recent detox, discharge, or any period of abstinence (tolerance lost)\n- Using opioids on top of alcohol, benzodiazepines or other sedatives\n- High-dose opioids (over ~100 mg morphine equivalent daily)\n- Co-existing HIV, liver or lung disease\n\nHigher risk still: male, older, lower socio-economic status. Not exhaustive - MDT judgement decides.`,
      },
      {
        id: "exclusions",
        title: "When I must NOT supply (exclusions)",
        content: `- Under 18\n- Not a DHCFT inpatient\n- No valid consent\n- Declines the training, or won't / can't complete it\n- MDT has reviewed and decided it is not appropriate\n- Known hypersensitivity to naloxone or any component of the pack`,
        tip: "In an opioid-dependent person, naloxone can trigger acute withdrawal - that is expected and is NOT a reason to withhold it in an overdose. Prenoxad does not reverse non-opioid (e.g. benzo or alcohol) respiratory depression.",
      },
      {
        id: "declines",
        title: "If the patient declines",
        content: `- Acknowledge their right to decline. Make sure they understand the risk.\n- Offer harm-reduction info anyway (overdose / heroin / fentanyl leaflets, or the video).\n- Refer on / seek advice where appropriate (Substance Misuse Services).\n- Document the decline and the alternatives discussed on SystmOne.`,
      },
      {
        id: "signoff",
        title: "Getting yourself signed off",
        content: `1. Read the PGD (in the PGD folder in the clinic room / on FOCUS).\n2. Watch "How to administer naloxone (injectable)".\n3. Make sure your ILS / resus + overdose training is current.\n4. Leadership adds you to the ward PGD register; you both sign. Sign-off can come from the manager, deputy, a senior staff member or the bleep holder.\n\nThat is it - you can now supply take-home Prenoxad.\n\nStaying signed off: annual resus + overdose-management update, plus an annual refresher on the product information, the Prenoxad protocol and the PGD requirements.`,
      },
      {
        id: "supply",
        title: "How to supply it",
        content: `- Supplied as a pre-packed Prenoxad kit once the MDT has agreed.\n- Ordered from Pharmacy; Pharmacy technicians track expiry and re-order stock. If you dispense one, note it in the Pharmacy diary.\n- Stored in the patient's own drugs (POD) cupboard. Keep the syringe in its original box (protects it from light).\n- Give one kit to take home. Further supplies after discharge come from Derbyshire Recovery Partnership.\n\nWhat's in the kit:\n\n- 1 x 2ml pre-filled syringe - naloxone 1mg/ml (2mg total), marked in 5 x 0.4mg doses (0.4mg = the minimum effective dose)\n- 2 x 23G 1 1/4" needles for intramuscular injection\n- Product instruction sheet\n- Opioid-overdose emergency flow-chart in the front pocket of the pack`,
      },
      {
        id: "train",
        title: "Train the patient (5-10 minutes)",
        content: `Cover these before you hand the pack over. Do it every time a pack is issued or replaced. Show them the "How to administer naloxone (injectable)" video, demonstrate, check understanding, invite questions.\n\nIf you think someone has overdosed on opioids:\n\n1. Personal safety first.\n2. Call an ambulance (999).\n3. Put them in the recovery position.\n4. Inject Prenoxad into a muscle - thigh or upper arm. Dose: 0.4mg (one mark) every 2-3 minutes, repeat until they are breathing normally, wake up, help arrives, or the syringe is empty.\n5. Stay with them until the ambulance arrives, and hand the used pack safely to the paramedics.\n\nAlso cover: CPR principles where appropriate, safe storage at home, and safe disposal of used needles.`,
        tip: "Naloxone wears off faster than opioids, so the person can slip back under - that is why the ambulance and staying with them both matter. Keep the pack out of reach of children and pets. Return for a replacement if used, lost or expired, and dispose of needles safely.",
      },
      {
        id: "record",
        title: "Record it on SystmOne",
        content: `Record:\n\n- The identified risk of future opioid overdose (as agreed by MDT / substance misuse)\n- That valid, informed consent was given\n- Date the DHCFT training was completed, and with which nurse\n- Medication supplied, date, quantity, batch number and expiry\n- Advice given\n- "Supplied via Patient Group Direction (PGD)" - record the supply itself on SystmOne ePMA\n\nAdd it to the patient's leave and discharge plans too.\n\nA ready-to-paste case note is in the orange box at the end of this guide - copy it and fill in the [brackets].`,
      },
      {
        id: "legal",
        title: "The legal bit (why no prescription)",
        content: `Since the Human Medicines (Amendment) (No. 3) Regulations 2015, naloxone can be supplied without a prescription when it is being made available to save a life in an emergency. Here it is supplied under a Patient Group Direction (PGD) by a trained, authorised registered nurse. That is what keeps medics out of the loop and makes this genuinely nurse-led.`,
      },
      {
        id: "resources",
        title: "Resources",
        content: `- "How to administer naloxone (injectable)" training video\n- Prenoxad client's guide, and harm-reduction / overdose / heroin / fentanyl leaflets\n- Product SPC / PIL: www.medicines.org.uk - BNF: bnf.nice.org.uk\n- Report adverse reactions via the MHRA Yellow Card scheme: yellowcard.mhra.gov.uk\n- Full PGD and protocol: on FOCUS (Medicine Management folder)`,
      },
    ],
    caseNote: `Take-home Prenoxad (naloxone injection) supplied under PGD on [DATE]. Patient identified at risk of opioid overdose and agreed at MDT. Informed consent obtained. Overdose-awareness and Prenoxad administration training completed with patient [+/- carer] on [DATE] by [NURSE]. Kit supplied: 1 x Prenoxad, batch [BATCH], expiry [EXPIRY]. Advised: call 999, IM injection, recovery position, stay until ambulance arrives, naloxone is short-acting. Added to leave/discharge plan. Further supplies via Derbyshire Recovery Partnership.`,
  },
  "arrange-mha-assessment": {
    id: "arrange-mha-assessment",
    title: "Arranging an MHA Assessment",
    description: "The eight steps to set up a Mental Health Act assessment when the medics ask for one",
    related: [
      { label: "MHA Statuses Explained", guideId: "mha-statuses" },
      { label: "Section 132 - Reading Patient Rights", guideId: "section-132" },
    ],
    steps: [
      {
        id: "1",
        title: "Liaise with the medical team",
        content: "It usually starts when the patient is already held under Section 5(2), or is informal but appears to lack the capacity to stay voluntarily, and the medical team wants a full MHA assessment (for example for a Section 2 or Section 3).\n\nAgree with the medical team that an assessment is needed before you set anything in motion.",
        tip: "The doctors provide the medical recommendation; your job is to pull the assessing team together and get the paperwork to them.",
      },
      {
        id: "2",
        title: "Doctors complete the medical recommendation",
        content: "One of the doctors completes a medical recommendation. They email it to the nursing team on shift and print a copy for the assessing team.\n\nMake sure you actually have it before you contact the AMHP - the whole assessment hangs on this document.",
      },
      {
        id: "3",
        title: "Call switchboard for the right AMHP",
        content: "Call switchboard and ask for the City or County AMHP. Which one depends on where the patient usually lives - check the address on SystmOne and go by their usual home address, not where they are now.\n\n- City AMHP: Hidden in demo mode\n- County AMHP: Hidden in demo mode\n\nOut of hours, call the AMHP team via reception and ask for either the City or County AMHP.",
        tip: "If you are not sure which team, the patient's usual home address decides it - city vs county.",
      },
      {
        id: "4",
        title: "Hand over to the AMHP and send the paperwork",
        content: "Give the AMHP a handover and the referral form. The AMHP may ask you to email supporting documents across:\n\n- The medical recommendation\n- The current risk assessment\n- The care plan\n- Any other supporting documentation\n\nSend it securely. Ask the AMHP which secure email address to use - social care use their own secure email system, not nhs.net, so check with them rather than assuming.\n\nRecord on SystmOne what you sent, to whom, and when.",
      },
      {
        id: "5",
        title: "The assessing team attend the ward",
        content: "The assessing team (the AMHP and the doctors) come to the ward to carry out the assessment. Have the patient, the paperwork and a quiet space ready.",
      },
      {
        id: "6",
        title: "After the assessment",
        content: "If the patient is detained, complete a Section 3 record (H3) if required. The assessing team email their application and the medical recommendation to the MHA office.",
      },
      {
        id: "7",
        title: "Read the patient their rights (Section 132)",
        content: "Complete the Section 132 rights on SystmOne and make sure the patient understands them - repeat it if they do not. Check an advocacy (IMHA) referral has been done.\n\nSee the Section 132 guide for exactly how to record this.",
        tip: "Rights within 24 hours is a legal duty and it is audited - do not let it slip while the paperwork is fresh.",
      },
      {
        id: "8",
        title: "Update the risk assessment and care plan",
        content: "Update the risk assessment and care plan to reflect the patient's current MHA status.\n\nIf the assessment is not completed on your shift, make sure the next shift can access the medical recommendation - email it to them or print a copy and hand it over as an ongoing task.",
      },
    ],
  },
  "section-132": {
    id: "section-132",
    title: "Section 132 - Reading Patient Rights",
    description: "When and how to read detained and informal patients their rights",
    focus: [
      { label: "Recording S132 Rights Conversation (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/10491/2454" },
      { label: "S132 Patients' Rights (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1829/2454" },
    ],
    steps: [
      {
        id: "1",
        title: "Read rights within 24 hours",
        content: "A member of the nursing team must explain the patient's rights verbally within 24 hours of detention. Then:\n\n- Record it in the EPR and complete the Section 132/132A rights questionnaire on SystmOne (date read, and whether understood)\n- Give the patient a copy of the information and the correct patient's-rights leaflet\n\nThe MHA office is notified. If no Section 132 record is received within 24 hours, the Nurse in Charge is chased to follow it up.",
        tip: "It is a legal duty and it is audited - do not let it slip past 24 hours.",
      },
      {
        id: "2",
        title: "If the patient cannot take it in",
        content: "If the patient is too unwell to understand at first:\n\n- Record this in the EPR and try again when they are more settled\n- Keep repeating the explanation until they fully understand\n\nUnderstanding can fluctuate, so rights-reading is ongoing throughout detention, not a one-off tick-box.",
        tip: "Record the attempts, not just success - 'unable to understand, will re-attempt' is a valid and important entry.",
      },
      {
        id: "3",
        title: "What detained patients must be told",
        content: "Cover, briefly and in plain language:\n\n- The section they are under and what it means\n- That they can appeal to the Mental Health Tribunal, and how to apply\n- How to get free legal representation\n- How to contact an Independent Mental Health Advocate (IMHA)\n- Treatment rules, including treatment without consent, SOADs and ECT\n- The nearest relative's discharge rights\n- The role of the Hospital Managers and the CQC",
      },
      {
        id: "4",
        title: "Informal patients have rights too",
        content: "Informal (voluntary) patients must also be told their rights as soon as possible after admission:\n\n- They can leave the ward at any time\n- Treatment needs their consent, which can be withdrawn\n- They can have advocate support\n- Confidentiality and the complaints process\n\nAssess their capacity to consent at this point.",
        tip: "Informal does not mean 'no rights' - they get their own version of the rights conversation.",
      },
      {
        id: "5",
        title: "IMHA and interpreters",
        content: "IMHA: give information about an Independent Mental Health Advocate orally and in writing as soon as practicable. If the patient lacks capacity, an IMHA should be instructed to act on their behalf.\n\nInterpreters: use Language Line if needed. There is a 'Know Your Rights' DVD (28 languages) on every ward, and easy-read and translated leaflets are available from the MHA administration office.",
      },
      {
        id: "6",
        title: "Re-reading: reminders and triggers",
        content: "Remind patients of their rights regularly - good practice is at least every 3 months for inpatients (every 6 months for CTO patients). The EPR sends automated reminders. Complete a fresh questionnaire each time.\n\nAlways re-explain when something changes:\n\n- The patient becomes eligible for, or requests, a Tribunal or Hospital Managers' hearing\n- Treatment rules change (e.g. 3 months since first medication) or capacity changes\n- The detention or CTO is renewed\n- Recall to hospital, or a CTO is revoked\n- A change of legal status, RC, ward or hospital",
        tip: "For community (CTO) patients the duty is Section 132A, which covers the same rights plus information about recall to hospital - use the S132A questionnaire for them.",
      },
      {
        id: "7",
        title: "Nearest relative and recording",
        content: "During the rights conversation, record the patient's views on sharing information with relatives or carers on the SystmOne questionnaire. The MHA administration team writes to the nearest relative unless the patient objects - your job is to capture the patient's wishes accurately.\n\nThe MHA office also has a duty under Section 133 to tell the nearest relative before the patient is discharged, again unless the patient objects, so the wishes you record here carry through to discharge.\n\nA failure to ensure the patient understands their rights can be referred to the CQC, so keep your records clear.",
      },
      {
        id: "8",
        title: "Record it on SystmOne",
        content: "Record the conversation on the right SystmOne questionnaire:\n\n- \"MHA S132 Explanation of rights - detained patients\" for sectioned patients\n- \"MHA S132A ... community patients\" for CTO patients\n\nThe green speech-bubble fields are where you record the patient's own choices. When you Save the Final Version, SystmOne auto-generates a pre-filled task to the MHA team, so you do not have to notify them separately.\n\nPrint the rights leaflet from the launchpad \"Patient Rights Information Leaflet\" page. If you hand over a leaflet in another language from the web link, add a note in the record - that one will not log automatically. The MHA 1983 Patient Information tab sits on the Working Age Adult, Older Adult and Inpatient launchpads.",
        tip: "Saving the Final Version is what fires the task to the MHA office - if you leave it as a draft, nobody downstream is notified.",
      },
    ],
  },
  "dama": {
    id: "dama",
    title: "Discharge Against Medical Advice",
    description: "The process and form when a patient self-discharges against advice",
    steps: [
      {
        id: "1",
        title: "When this applies",
        content: "A patient who has capacity and is not detainable under the Mental Health Act can choose to leave against medical advice. This is the process and the form to use.",
        tip: "Always consider whether the MHA or MCA applies before treating it as a simple self-discharge - the form requires the doctor to confirm they have.",
      },
      {
        id: "2",
        title: "Talk first - many are avoidable",
        content: "Before anything formal, talk with the patient: why do they want to leave, what are their concerns, what would help them stay? Involve the doctor early. A calm conversation resolves many would-be self-discharges.\n\nOffer alternatives before a full self-discharge - for example a short period of leave or agreed time off the ward can defuse the situation and keep the admission open.\n\nOut of hours, offer to arrange a discharge meeting with the ward's regular medics and the MDT so the discharge can be planned properly - take-home medication, a safety plan and community follow-up - rather than leaving abruptly overnight.",
      },
      {
        id: "3",
        title: "Doctor assessment - MHA / MCA first",
        content: "The doctor must advise the patient to remain for further treatment and must consider whether detention under the Mental Health Act or the Mental Capacity Act is warranted, consulting senior colleagues if needed. Only if neither applies does self-discharge proceed.",
      },
      {
        id: "4",
        title: "Complete the DAMA form",
        content: "Use the trust Discharge Against Medical Advice form. It records:\n\n- The patient's declaration that they are discharging against advice and accept responsibility\n- The doctor's certification that they advised staying and considered the MHA / MCA\n- A witness who was present when the advice was given\n- That the patient was advised to contact their GP or another professional, with the contact number given\n- Whether the named professional / care team was informed",
        tip: "If the patient refuses to sign, the doctor and witness still sign and note on the form that the patient was unwilling to sign.",
      },
      {
        id: "5",
        title: "Record, Datix, and make the safety net clear",
        content: "Record the discharge and the conversation in the medical notes and the nursing communication sheet. Inform the named professional / care coordinator if involved, and make sure the patient leaves with GP and crisis contact details.\n\nAn unplanned discharge is an unsafe discharge regardless of medical advice - complete a Datix. Where possible still arrange follow-up (GP, care coordinator, crisis team) and any take-home medication, so the person is not left without a plan.",
        tip: "The person is leaving against advice - a clear crisis plan and follow-up matter more here, not less.",
      },
    ],
  },
  "transfer-in": {
    id: "transfer-in",
    title: "Accepting a Transfer from a General Ward",
    description: "Pre-transfer checklist for a patient coming back after physical treatment",
    steps: [
      {
        id: "1",
        title: "When this applies",
        content: "A medical or general ward (for example Royal Derby) is asking to transfer a patient back to the unit after physical treatment. Use this checklist before agreeing - we are not an acute medical hospital and have limited equipment and medication.",
        tip: "The medical team, not our doctors, are responsible for reviewing bloods and declaring the patient medically fit.",
      },
      {
        id: "2",
        title: "First question: are they fit?",
        content: "Ask the referring ward: is the patient fit to go home? If they are not fit for home, they are not fit to come back to us - explain we are not an acute medical hospital and the ward team must declare them fit before transfer. If yes, work through the checklist below.",
      },
      {
        id: "3",
        title: "Pre-transfer checklist (can be done by phone)",
        content: "Confirm:\n\n- IV access / cannula removed (we cannot accept a cannula in situ or anyone on IV medication)\n- Not requiring oxygen or a nasogastric tube\n- Blood tests reviewed by the medical team\n- Observations within their normal ranges\n- Pain adequately controlled, with an ongoing plan\n- No diarrhoea & vomiting or hospital-acquired infection (infection control)\n- Discharge summary completed and a copy sent with the patient",
        tip: "Document the name and role of the person you spoke to.",
      },
      {
        id: "4",
        title: "Not reasons to refuse",
        content: "A catheter, a wound dressing or stitches are NOT reasons to prevent transfer - but there must be a plan for the medics to review them.",
      },
      {
        id: "5",
        title: "Why it matters",
        content: "We need an accurate discharge summary to prescribe correctly (we use different systems) and to understand the diagnosis and investigations. Lines and tubing are a ligature risk unless it is long-term oxygen. If observations are acutely abnormal we cannot accept the patient - we do not have the equipment or medication to manage it.",
      },
      {
        id: "6",
        title: "If in doubt",
        content: "Contact the patient's regular doctor, or the duty doctor bleep holder out of hours (bleep number hidden in demo mode).",
      },
    ],
  },
  "tribunal-report": {
    id: "tribunal-report",
    title: "Mental Health Tribunal - Nursing Report",
    description: "Writing the nursing report and attending the hearing",
    focus: [{ label: "Mental Health Tribunal (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1832/2454" }],
    steps: [
      {
        id: "1",
        title: "What the Tribunal is",
        content: "An independent judicial body that reviews a detained, CTO or conditionally-discharged patient's detention and can direct discharge. It sits like a mobile court, usually at the hospital. The burden is on those arguing for continued detention - not on the patient to disprove it.",
      },
      {
        id: "2",
        title: "Your job: the nursing report",
        content: "For in-patients the Trust must provide a nursing report describing the patient's presentation on the ward. It should be written by the named nurse, or a nurse with good knowledge of the patient.",
        tip: "Four reports go in: a factual statement (MHA team), the RC's report, a social circumstances report (care coordinator), and the nursing report (you, for in-patients).",
      },
      {
        id: "3",
        title: "The deadline",
        content: "Reports must reach the MHA Administrator in time to be submitted to the Tribunal within 3 weeks of the application. The exception is Section 2 hearings - those reports are needed 48 hours before the hearing. If you genuinely cannot meet the deadline, a CMR1 extension form must be submitted early. Missing it can lead to a Tribunal Order, a summons or a fine.",
      },
      {
        id: "4",
        title: "Write it on the correct template",
        content: "Use the current nursing report template (on the MHA intranet page), written in line with the Senior President's Practice Direction (2013). Keep it clear, concise and up to date - cover the patient's presentation, engagement, risk and progress on the ward.",
      },
      {
        id: "5",
        title: "Non-disclosure (rarely)",
        content: "If part of the report should not be seen by the patient, submit it separately, clearly marked 'Not to be disclosed to the patient', with a CMR1 giving the reason. The Tribunal only withholds where disclosure is likely to cause serious harm. Seek the trust legal team's guidance early.",
      },
      {
        id: "6",
        title: "Attending the hearing",
        content: "Someone who knows the patient well must attend to give up-to-date information and answer questions on the report. Failure to attend is treated as a serious matter and can lead to directions or a subpoena. Never assume a hearing is cancelled until the MHA office confirms it.",
        tip: "A brief decision is given on the day and confirmed in writing about 7 days later; the MHA office uploads it to SystmOne.",
      },
    ],
  },
  "section-136": {
    id: "section-136",
    title: "Section 136 - Place of Safety",
    description: "Receiving a person brought in by police under Section 136",
    focus: [
      { label: "Operation of Section 136 (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1995/2454" },
      { label: "136 Suite Process Map (pathway)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/4694/1270" },
    ],
    steps: [
      {
        id: "1",
        title: "What Section 136 is",
        content: "Section 136 lets the police remove a person who appears to have a mental disorder, from a place the public can access, to a place of safety (the unit's 136 suite) to be assessed under the Mental Health Act. Under Right Care Right Person, the police response to mental health is changing - work to the current multi-agency agreement.",
      },
      {
        id: "2",
        title: "The clock: 24 hours (+12)",
        content: "Detention under Section 136 lasts up to 24 hours from arrival at the place of safety. In limited circumstances a doctor can extend it by up to a further 12 hours (36 in total). The MHA assessment must be completed within that window.",
        tip: "Record the arrival time accurately - the 24 hours runs from it.",
      },
      {
        id: "3",
        title: "Receiving the person into the 136 suite",
        content: "Confirm the Section 135/136 form is completed. Settle the person, attend to immediate physical and mental health needs, and start engaging with them - a 136 is frightening and disorienting. Begin the SystmOne Section 136 assessment record.",
      },
      {
        id: "4",
        title: "Arrange the assessment without delay",
        content: "An MHA assessment (AMHP plus doctor(s)) must be arranged so it is completed within the 24 hours. Escalate early if assessors are not yet arranged - do not let the clock run down.",
      },
      {
        id: "5",
        title: "Forms and leaflets",
        content: "Section 135 and 136 form; Authorisation for extension of period of detention (only if extended); give the patient the Section 136 patient-information leaflet; complete the SystmOne Section 136 assessment.",
      },
      {
        id: "6",
        title: "Outcomes",
        content: "After assessment the person may be detained under Section 2 or 3, admitted informally, or released. If they are then detained, read their rights (Section 132).",
        tip: "Section 136 itself gives no power to treat without consent - treat an incapacitous person under the MCA if needed.",
      },
    ],
  },
  "awol": {
    id: "awol",
    title: "Absent & Missing Patients (AWOL)",
    description: "What to do when a patient is absent or missing, under Right Care Right Person",
    focus: [
      { label: "Missing & Absent Patients (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1833/2454" },
      { label: "AWOL SOP", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/3467/2456" },
    ],
    steps: [
      {
        id: "1",
        title: "Absent or Missing? (the RCRP split)",
        content: "Right Care Right Person sets two categories:\n\n- Absent / AWOL: the patient is not where they should be (absconded, escaped, AWOL, or failed to return from leave). Healthcare does the checks and searches. Police are only called if there is an immediate risk to harm or life.\n- Missing: their whereabouts cannot be established AND they may be a victim of crime, or at risk of harm to self / others, or it is out of character. If a patient is Missing, contact the police immediately.\n\nClinical capacity is NOT used to decide the response - it changes too quickly.",
        tip: "Police only respond to a 'Critical Concern' (their term for High Risk): a real, immediate risk to life or serious harm, or suspected serious crime.",
      },
      {
        id: "2",
        title: "First minutes on the ward",
        content: "Whoever notices tells the Nurse in Charge, who follows the escalation process and starts a thorough search, widening in sequence:\n\nWard → toilets → offices → corridors → departments → storerooms → locked rooms → wider hospital and grounds.\n\nInform security (where available) to help search the grounds and check CCTV. If a patient is seen leaving and it is safe to do so, staff may follow to the site boundary and note their direction of travel.",
      },
      {
        id: "3",
        title: "Risk assess, contact, record",
        content: "The named nurse carries out an immediate risk assessment. Then:\n\n- Check the care plan and risk management plan\n- Try to contact the patient on any number you have\n- Contact next of kin, family / friends and known professionals (Social Worker, CPN)\n- Inform the doctor / consultant in charge\n- Complete a Datix incident form\n\nThe RC / duty RC coordinates an MDT (inpatients + crisis, and CMHT in hours) to agree the level of risk and who responds.",
      },
      {
        id: "4",
        title: "Detained vs informal",
        content: "A detained patient can only be off-site with Section 17 leave - off-site without it is AWOL. An informal patient may leave at will, but where there are concerns about safety or capacity a nurse can use Section 5(4) (up to 6 hours) or a doctor Section 5(2) (up to 72 hours) to hold them - but only while they are still on hospital grounds.\n\nA patient on DoLS who goes missing should be treated as Missing, and the risk reported to police as high.",
      },
      {
        id: "5",
        title: "Off-site search and outcomes",
        content: "If High Risk, the police must be contacted immediately. If not high risk, healthcare carries out checks at the last known address or likely places, coordinated with Crisis and (in hours) CMHT, balancing safe staffing.\n\nOutcomes:\n- Located and willing to return → facilitate a safe return\n- Located and refusing to return → consider requesting a Section 135 warrant\n- Not located → report to the police under the Missing Persons process",
      },
      {
        id: "6",
        title: "On return",
        content: "A detained patient who is AWOL can be retaken under Section 18 of the MHA. On return: check the patient over, complete / close the Datix, debrief, and update the care plan, risk management plan and observation level to reflect what happened.",
        tip: "Feed what you learn back into the risk and care plans - an AWOL is a prompt to review the plan, not just an incident to close.",
      },
    ],
  },
  news2: {
    id: "news2",
    title: "NEWS2 Observations",
    description: "National Early Warning Score - recognising patient deterioration",
    focus: [
      { label: "Schedule NEWS2 (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/4336/2454" },
      { label: "Recording NEWS2 Obs", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/4335/2454" },
    ],
    steps: [
      {
        id: "1",
        title: "Introduction",
        content: "NEWS2 (National Early Warning Score 2) is a standardised approach to assessing acute illness severity. It tracks six physiological parameters to identify patients at risk of deterioration.",
        tip: "NEWS2 should be recorded at least every 12 hours for stable patients, or more frequently if clinically indicated.",
      },
      {
        id: "2",
        title: "The Six Parameters",
        content: "1. Respiration rate (breaths per minute)\n2. Oxygen saturation (%)\n3. Systolic blood pressure (mmHg)\n4. Pulse rate (beats per minute)\n5. Level of consciousness (ACVPU)\n6. Temperature (°C)",
        tip: "For patients on supplemental oxygen, there's an additional 2-point weighting for SpO2.",
      },
      {
        id: "3",
        title: "Scoring Thresholds",
        content: "Each parameter is scored 0-3 based on how far from normal the value is. The scores are then added together.\n\n• 0 = Normal range\n• 1-2 = Mild deviation\n• 3 = Severe deviation",
      },
      {
        id: "4",
        title: "Clinical Response",
        content: "• Score 0-4: Routine monitoring\n• Score 5-6 or single parameter 3: Urgent response\n• Score 7+: Emergency response - immediate clinical review",
        tip: "A score of 3 in any single parameter should trigger an urgent assessment, regardless of total score.",
      },
      {
        id: "5",
        title: "Documentation",
        content: "Record all observations on the NEWS2 chart. Document:\n• Time of observations\n• All six parameters\n• Total NEWS2 score\n• Actions taken if escalating\n• Name and signature",
      },
    ],
  },
  "mha-statuses": {
    id: "mha-statuses",
    title: "Mental Health Act Statuses Explained",
    description: "Understanding the legal framework for patient care under the MHA",
    related: [
      { label: "Section 132 - Reading Patient Rights", guideId: "section-132" },
    ],
    steps: [
      {
        id: "1",
        title: "Overview",
        content: "The Mental Health Act (MHA) defines the legal framework for a patient's care, classifying them as either informal (voluntary) or formally detained for compulsory assessment or treatment.\n\nKey points:\n\n- A person cannot be detained simply for drug or alcohol addiction, but can be for drug-induced psychosis\n- All patients (informal and detained) have rights to access an Independent Mental Health Advocate (IMHA)\n- Detained patients have additional rights to appeal their detention and have it reviewed by a tribunal\n- 'Mental disorder' under the Act covers conditions including schizophrenia, depression, bipolar disorder, and severe personality disorders",
        tip: "Informal patients are not detained under the MHA. They have voluntarily consented to hospital treatment and can leave at any time (unless a holding power is applied).",
      },
      {
        id: "2",
        title: "Informal (Voluntary)",
        content: "Not formally detained under the MHA. The patient has voluntarily consented to hospital treatment.\n\nKey rights:\n- Free to leave the hospital at any time\n- Can refuse treatment (subject to capacity)\n- Entitled to IMHA support\n- Should be informed of their rights on admission\n\nImportant: informal does not mean 'no rights' or 'no concerns'. Informal patients still have access to advocacy and complaints processes. If an informal patient tries to leave and there are concerns, a Section 5 holding power may be considered.",
        tip: "Informal/voluntary is not a type of detention. These patients have their own set of rights and access to advocacy services.",
      },
      {
        id: "3",
        title: "Section 2 - Assessment",
        content: "Allows detention for up to 28 days for assessment (and treatment during assessment). Usually for a first-time assessment where the diagnosis or treatment plan is not yet clear.\n\nRequirements:\n- Two medical recommendations (one from a Section 12 approved doctor)\n- Application by an Approved Mental Health Professional (AMHP) or nearest relative\n- Patient must have a mental disorder warranting assessment\n- Detention must be in the interests of the patient's health/safety or the protection of others\n\nDuration: Up to 28 days. Cannot be renewed - if further detention is needed, a Section 3 application must be made.\n\nAppeals: Patient can appeal to the Mental Health Tribunal within the first 14 days.",
      },
      {
        id: "4",
        title: "Section 3 - Treatment",
        content: "Allows detention for treatment. Typically used when assessment has already occurred and a treatment plan is in place.\n\nRequirements:\n- Two medical recommendations (one from a Section 12 approved doctor)\n- Application by an AMHP or nearest relative\n- Appropriate treatment must be available\n- Treatment must be necessary for the patient's health/safety or protection of others\n\nDuration: Up to 6 months initially. Can be renewed for a further 6 months, then annually.\n\nAppeals: Patient can appeal to the Mental Health Tribunal once in each detention period. The hospital must also refer to the tribunal if no appeal is made within 6 months.",
      },
      {
        id: "5",
        title: "Section 4 - Emergency Admission",
        content: "An emergency, one-doctor assessment section. Used when there is urgent necessity and waiting for a second medical recommendation would cause undesirable delay.\n\nRequirements:\n- One medical recommendation (ideally from a doctor who knows the patient)\n- Application by an AMHP or nearest relative\n- Urgent necessity for admission\n\nDuration: Up to 72 hours. During this time, a second medical recommendation should be obtained to convert to a Section 2.\n\nNote: Section 4 should only be used in genuine emergencies. If possible, a Section 2 with two doctors is always preferred.",
        tip: "Section 4 is relatively rare. If used, the second medical recommendation should be arranged as soon as possible to convert to Section 2.",
      },
      {
        id: "6",
        progressive: true,
        title: "Section 5(2) and 5(4) - Holding Powers",
        content: "Allow staff to detain a voluntary patient already in hospital for a short period.\n\nSection 5(2) - Doctor's Holding Power:\n- Applied by the doctor in charge of the patient's treatment (or their nominated deputy)\n- Lasts up to 72 hours\n- Used when a voluntary inpatient needs to be prevented from leaving\n- During this time, an AMHP assessment should be arranged\n\nSection 5(4) - Nurse's Holding Power:\n- Applied by a registered mental health nurse or learning disability nurse\n- Lasts up to 6 hours\n- Used when a doctor is not immediately available\n- The doctor must be contacted immediately to attend\n\nThese holding powers can only be used for patients already receiving inpatient treatment - not for patients in A&E or outpatient settings.",
        tip: "Section 5 cannot be renewed. If further detention is needed, a full MHA assessment under Section 2 or 3 must be arranged during the holding period.",
      },
      {
        id: "7",
        progressive: true,
        title: "Section 17A - Community Treatment Order (CTO)",
        content: "A patient is discharged from hospital but remains subject to conditions and can be recalled if they stop treatment or their health deteriorates.\n\nRequirements:\n- Patient must be detained under Section 3 (or equivalent)\n- Responsible Clinician and AMHP must agree the CTO is appropriate\n- Treatment must be available in the community\n\nConditions may include:\n- Attending appointments\n- Taking medication\n- Living at a specified address\n- Allowing access to clinical staff\n\nRecall: The Responsible Clinician can recall the patient to hospital if conditions are breached or there is a deterioration.\n\nDuration: Initially 6 months, renewable for 6 months then annually.\n\nAppeals: Patient can appeal to the tribunal once per CTO period.",
      },
      {
        id: "8",
        progressive: true,
        title: "Forensic Sections (37, 37/41, 47/49)",
        content: "Section 37 - Hospital Order:\nA court orders detention for treatment instead of a prison sentence. Requirements are similar to Section 3 but the order comes from the court.\n\nSection 37/41 - Restricted Hospital Order:\nA Section 37 with restrictions imposed by the Crown Court for public safety. The patient cannot be given leave, transferred, or discharged without the consent of the Secretary of State (via the Ministry of Justice). These patients require enhanced security oversight.\n\nSection 47/49 - Transfer Direction:\nTransfer from prison to hospital with restrictions. The Secretary of State directs that a prisoner be transferred to hospital for treatment. Section 49 adds restrictions similar to Section 41.\n\nNote: Patients under restricted orders have additional governance requirements. Always check with the MHA Office before making any changes to their care plan, leave arrangements, or ward moves.",
        tip: "Forensic sections involve the Ministry of Justice. Never arrange leave or transfer for patients under Section 41 or 49 restrictions without MHA Office approval.",
      },
      {
        id: "9",
        progressive: true,
        title: "Patient Rights Summary",
        content: "All patients (informal and detained) are entitled to:\n- Access to an Independent Mental Health Advocate (IMHA)\n- Information about their rights (in a language they understand)\n- Access to complaints procedures\n- Respect for dignity and privacy\n\nDetained patients additionally have:\n- Right to appeal to the Mental Health Tribunal\n- Right to have their detention reviewed\n- Right to a second opinion on treatment (SOAD)\n- Right to have their nearest relative informed\n- Right to receive written information about their section\n\nNursing responsibilities:\n- Ensure patients are informed of their rights on admission and at regular intervals\n- Document that rights have been explained\n- Refer to IMHA if the patient requests or would benefit from advocacy\n- Ensure Section papers are correctly completed and filed",
        tip: "Rights must be re-explained at each renewal or change of section. Use the trust's rights leaflets and document that the discussion took place.",
      },
    ],
  },
  "capacity-assessment": {
    id: "capacity-assessment",
    title: "Capacity Assessment",
    description: "Mental Capacity Act 2005 - Assessing decision-making capacity",
    focus: [
      { label: "Combined Capacity to Consent (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/11045/2454" },
      { label: "Mental Capacity (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1820/2454" },
      { label: "Capacity & Competency SOP", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/3468/2456" },
    ],
    downloads: [
      { label: "Capacity Request (Police) - blank form to print", url: "/police-capacity-form.html" },
    ],
    steps: [
      {
        id: "1",
        title: "The Two-Stage Test",
        content: "Stage 1: Is there an impairment of, or disturbance in, the functioning of the person's mind or brain?\n\nStage 2: Does that impairment or disturbance mean the person is unable to make the specific decision at the specific time?",
        tip: "Capacity is decision-specific and time-specific. A person may have capacity for some decisions but not others.",
      },
      {
        id: "2",
        title: "The Functional Test",
        content: "A person is unable to make a decision if they cannot:\n\n1. Understand information relevant to the decision\n2. Retain that information long enough to make the decision\n3. Use or weigh that information as part of decision-making\n4. Communicate their decision",
        tip: "Use all practicable steps to help the person make their own decision before concluding they lack capacity.",
      },
      {
        id: "3",
        title: "Best Interests",
        content: "If a person lacks capacity, any decision made on their behalf must be in their best interests. Consider:\n\n• Past and present wishes\n• Beliefs and values\n• Consultation with family/carers\n• Least restrictive option",
      },
      {
        id: "4",
        title: "Documentation",
        content: "Document your assessment including:\n\n• What decision is being assessed\n• Evidence of impairment/disturbance\n• How you applied the functional test\n• Steps taken to help the person decide\n• Your conclusion and reasoning",
        tip: "A clear, contemporaneous record protects both the patient and the assessor.",
      },
      {
        id: "5",
        title: "On SystmOne - the Combined Capacity form",
        content: "The Trust records capacity on the Combined Capacity to Consent form on SystmOne (see the how-to below). It walks the same two-stage test:\n\n• First, state the decision, and how you supported the person to make it themselves\n• Say whether you are confident about their capacity (Yes/No)\n• Stage 1 - functional test: can they understand, retain, use and weigh, and communicate the decision? Each is Yes/No with your reasoning\n• Stage 2 - diagnostic test: is there a disturbance or impairment of the mind or brain, and is it the reason they fail the functional test?\n\nSave it as the Final Version. On admission it is routine to record capacity to consent to admission and capacity to consent to treatment separately.",
        tip: "The functional and diagnostic tests must connect - lacking capacity means the impairment is WHY the person cannot make this decision, not just that the two happen to coincide.",
      },
      {
        id: "6",
        title: "Police capacity request after an incident",
        content: "If the police are involved after a reportable incident on the ward (always linked to a Datix), they may ask the Responsible Clinician or a mental health nurse to complete a Capacity Request form. Using your professional judgement, it asks whether, in your opinion:\n\n• at the time of the alleged offence, the person was capable of understanding their actions\n• at the time, they were capable of controlling their actions\n• they are capable of understanding the legal process if a prosecution is sought\n• they are fit to be interviewed by the police (Y/N)\n• they need an appropriate adult (Y/N)\n• a prosecution would be detrimental to their care plan\n\nRecord the service-user details, section and Datix number, then sign and date it.",
        tip: "This is your clinical opinion for the police, not a formal MCA assessment of a treatment decision - keep the two separate in your records.",
      },
    ],
  },
  "section-17": {
    id: "section-17",
    title: "Section 17 Leave",
    description: "Mental Health Act - Leave of absence from hospital",
    focus: [
      { label: "Section 17 Leave (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/3431/2454" },
      { label: "Amending Section 17 Leave", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/8172/2454" },
      { label: "Section 17 Leave (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1828/2454" },
      { label: "Section 17 SOP", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/3490/2456" },
    ],
    steps: [
      {
        id: "1",
        title: "Who Can Grant Leave?",
        content: "Section 17 leave can only be granted by the Responsible Clinician (RC). The RC may grant leave:\n\n• For a specific period\n• For specific or indefinite occasions\n• Subject to conditions",
        tip: "Leave cannot be granted by anyone other than the RC, including covering consultants without proper handover.",
      },
      {
        id: "2",
        title: "Types of Leave",
        content: "Common leave types include:\n\n• Escorted (staff or family)\n• Unescorted\n• Ground leave\n• Community leave\n• Overnight leave\n• Extended leave (often pre-discharge)",
      },
      {
        id: "3",
        title: "Conditions & Risk Assessment",
        content: "The RC should specify:\n\n• Duration and destination\n• Escort arrangements\n• Contact requirements\n• Recall conditions\n\nA current risk assessment must support the leave decision.",
        tip: "Conditions must be reasonable and proportionate. The patient should understand and agree to them where possible.",
      },
      {
        id: "4",
        title: "Documentation",
        content: "Document in the patient's notes:\n\n• S17 leave form completed and signed by RC\n• Dates/times of leave\n• Any conditions\n• Risk assessment reviewed\n• Patient informed of conditions\n• Copy given to patient",
      },
      {
        id: "5",
        title: "What it applies to (and what it doesn't)",
        content: "Section 17 leave applies to patients detained under Sections 2, 3, 37 and 47.\n\nIt does NOT apply to Section 4, 5(2), 5(4), 135, 136 or CTO patients. Sections 35, 36 and 38 need the court's permission, and restricted patients need the permission of the Secretary of State for Justice.",
        tip: "Section 17 is the only lawful way a detained patient can leave the hospital site.",
      },
      {
        id: "6",
        title: "The nurse's role each time",
        content: "Only the RC grants the leave, but before each period of leave the nurse in charge must check the S17 form is completed and assess the patient's current mental state. You may withhold leave only if the patient has deteriorated - not for other reasons.\n\nRecord every departure, return and the outcome of each leave on SystmOne. If the RC authorises leave by phone, document the conversation and have the RC complete the form at the earliest opportunity. If a patient fails to return, follow the Missing & Absent Patients policy.",
        tip: "Leave of more than 7 consecutive days should prompt the RC to consider whether a CTO is more appropriate - record that discussion.",
      },
    ],
  },
  "fridge-temps": {
    id: "fridge-temps",
    title: "Fridge Temperature Recording",
    description: "Daily medication fridge monitoring and Assurance Dashboard recording",
    steps: [
      {
        id: "1",
        title: "When to Check",
        content: "Medication fridge temperatures must be checked and recorded:\n\n• Once daily (Early shift)\n• At approximately the same time each day\n• Before the first medication round if possible\n\nThis is a regulatory requirement for safe medication storage.",
        tip: "Set a reminder or include this as a standing item in your early shift handover.",
      },
      {
        id: "2",
        title: "Acceptable Range",
        content: "The medication fridge must be maintained between:\n\n• Minimum: 2°C\n• Maximum: 8°C\n• Target: 4-5°C\n\nMost medications requiring refrigeration (e.g., insulin, some antibiotics, vaccines) require this range to remain effective.",
        tip: "If the fridge has a min/max thermometer, check both current AND min/max readings since last reset.",
      },
      {
        id: "3",
        title: "Recording on Assurance Dashboard",
        content: "1. Log into FOCUS and navigate to Assurance Dashboard\n2. Select 'Fridge Temperature' audit\n3. Select your ward\n4. Enter the current temperature reading\n5. If min/max available, enter those too\n6. Add any notes if temperature was out of range\n7. Submit the audit\n\nThe dashboard will flag any out-of-range readings automatically.",
        tip: "In Max+ version, completing on the dashboard will auto-complete this task in the Team Diary.",
      },
      {
        id: "4",
        title: "Out of Range - Immediate Actions",
        content: "If temperature is outside 2-8°C:\n\n• Do NOT use medications until resolved\n• Check fridge door seal and closure\n• Check fridge is plugged in and running\n• Check nothing is blocking the vents\n• Do not overcrowd the fridge\n\nIf still out of range after 30 minutes, escalate.",
        tip: "Never store medications in the fridge door compartments - temperature is less stable there.",
      },
      {
        id: "5",
        title: "Escalation",
        content: "If temperature remains out of range:\n\n1. Inform the Nurse in Charge immediately\n2. Contact Pharmacy for medication assessment\n3. Log an incident on Datix if medications may be compromised\n4. Estates may need to repair/replace the fridge\n5. Document all actions in the ward communication book\n\nPharmacy will advise whether affected medications can still be used.",
      },
      {
        id: "6",
        title: "Documentation Summary",
        content: "For each check, record:\n\n• Date and time\n• Current temperature\n• Min/Max readings (if available)\n• Your name/signature\n• Any actions taken if out of range\n\nThe Assurance Dashboard maintains an audit trail for CQC inspections and Trust governance.",
        tip: "Keep a backup paper log on the fridge as well - useful if dashboard is temporarily unavailable.",
      },
    ],
  },
  "safeguarding-adults-referral": {
    id: "safeguarding-adults-referral",
    title: "Making a Good Safeguarding Adults Referral",
    description: "Section 42 Care Act 2014 – when and how to refer",
    steps: [
      {
        id: "1",
        title: "Check the Criteria",
        content: "Section 42 of the Care Act 2014 sets out three conditions – all must apply:\n\n1. The adult has care and support needs (whether or not met by the Local Authority)\n2. The adult is experiencing, or at risk of, abuse or neglect\n3. As a result of those needs, is unable to protect themselves\n\nThere is no 'significant harm' threshold. Action should be proportionate to the risk and wherever possible in line with the person's wishes.",
        tip: "If unsure, ring the DHCFT Safeguarding Advice Line to talk it through. You won't be judged for asking.",
      },
      {
        id: "2",
        title: "10 Categories of Abuse",
        content: "The Care Act recognises these categories:\n\n1. Physical abuse\n2. Emotional/psychological abuse\n3. Sexual abuse\n4. Neglect and acts of omission\n5. Financial or material abuse\n6. Discriminatory abuse\n7. Organisational abuse\n8. Self-neglect\n9. Domestic abuse\n10. Modern slavery\n\nNeglect is the most commonly reported category. Remember: pressure ulcers can be a safeguarding concern.",
      },
      {
        id: "3",
        title: "What to Include",
        content: "Read the referral form questions carefully and answer as fully as possible:\n\n• What have you seen? Where, when?\n• What have you heard? When, who from?\n• Basic info about the adult – what care needs do they have? Why can't they protect themselves?\n• Basic info about the person causing harm – do they have care needs? Position of trust?\n• Why are you worried? What type of abuse?\n• What is the impact now? What if agencies don't get involved?\n• What have you tried already? What protective factors are in place?\n• Separate facts from opinions – state your professional opinion clearly with evidence\n• Does the adult have capacity for this decision?\n• What does the adult want to happen?",
        tip: "You're not telling a story – you're sharing concerns about an adult at risk. Keep them at the centre: what is a day in their life?",
      },
      {
        id: "4",
        title: "Common Pitfalls",
        content: "Avoid these mistakes:\n\nUsing 'Unknown' or leaving answers blank – explain why you don't know.\n\nSanitising language – when quoting someone, use their actual words including swearing. This could become court evidence.\n\nNot enough detail – don't write 'chaotic lifestyle'. Instead: missed last 4 appointments, homeless (sleeping rough? with friends?), 1 litre vodka per day, witnessed X threatening Y.\n\nVictim-blaming language – never imply the adult is responsible for the abuse. Reflect coercion and lack of control.\n\nDelays – if you're worried, refer now. Timely referrals save lives.",
      },
      {
        id: "5",
        title: "Consent",
        content: "Best practice is to get consent before referring. However:\n\n• Don't let consent stop you if you're genuinely worried\n• You can override consent if there's immediate risk of harm or risk to your own safety\n• If you can't get consent, explain why in the referral\n• Always try to inform the person you're making a referral, even if consent wasn't obtained\n• Consider whether the person has capacity to consent",
        tip: "Having consent is ideal but not essential. A referral without consent is better than no referral at all.",
      },
      {
        id: "6",
        progressive: true,
        title: "Submit the Referral",
        content: "Ring and discuss the case first, then submit the form.\n\nDerbyshire County:\n• Office hours (Mon-Fri 8am-8pm, Sat 9:30am-4pm): Hidden in demo mode\n• Out of hours: Hidden in demo mode\n• Online form: derbyshiresab.org.uk/professionals/safeguarding-adult-referrals\n\nDerby City:\n• MASH (Mon-Fri 9am-5pm): Hidden in demo mode\n• Out of hours (Careline): Hidden in demo mode\n• Email: AdultsMASH@derby.gov.uk\n• Online form: secure.derby.gov.uk/forms/?formid=345",
      },
      {
        id: "7",
        title: "After the Referral",
        content: "Safeguarding is everybody's responsibility – submitting the referral is not the finish line.\n\n• Document the referral in patient notes\n• Log on Datix if required (see criteria in guide)\n• Add a follow-up task to your diary\n• The S.42 enquiry may task your team with further actions\n• If the same concerns keep being raised without resolution, escalate to the Assistant Director of Safeguarding",
        tip: "39% of Derby City and 54% of Derbyshire County referrals become S.42 enquiries. That means many referrals don't meet threshold – but it's always better to refer than to stay silent.",
      },
    ],
  },
  "safeguarding-children-referral": {
    id: "safeguarding-children-referral",
    title: "Safeguarding Children - Starting Point Referral",
    description: "When you're worried about a child (under 18)",
    steps: [
      {
        id: "1",
        title: "When to Refer",
        content: "You should refer when you have concerns about a child (under 18) who may be at risk of:\n\n- Physical abuse or harm\n- Emotional abuse or neglect\n- Sexual abuse or exploitation\n- Neglect (basic needs not met)\n- Domestic abuse in the household\n- Online harm, exploitation or grooming\n- Honour-based abuse, FGM or forced marriage\n- Radicalisation or extremism\n- Modern slavery or trafficking\n\nThis includes children of your patients where parenting capacity may be affected by mental illness, substance use, or domestic abuse.\n\nIf there is immediate risk of harm, call 999 first. If the child is already open to Children's Social Care, contact the allocated worker directly.",
        tip: "Think Family - always consider whether your adult patient has dependent children. Their mental health can directly affect those children's safety.",
      },
      {
        id: "2",
        title: "Think Family",
        content: "On a mental health ward, children's safeguarding often starts with the adult patient:\n\n- Does your patient have children or regular contact with children?\n- Is their mental health affecting their ability to parent safely?\n- Is there domestic abuse in the home?\n- Are there substance misuse concerns?\n- Is there a partner or family member who can keep the children safe?\n- Could the child be a young carer?\n\nYou don't need to be certain harm is happening. Professional concern is enough to refer.\n\nFor children with complexity of need (including mental health, neurodiversity, physical disability and intellectual disability), consider the escalation pathway for additional multi-agency support.",
      },
      {
        id: "3",
        title: "Get Advice First",
        content: "Not sure if the threshold is met? Use the consultation lines before making a formal referral:\n\nDHCFT Safeguarding Unit: Hidden in demo mode\n- Option 1 - Safeguarding Team / Advice Line\n- Option 2 - Child Protection Medicals\n- Option 3 - Child Death Overview Panel\n\nChildren's Social Care consultation:\n- Derbyshire - Starting Point Consultation: Hidden in demo mode (Mon-Fri 10am-4pm)\n- Derby City - Professional Consultation Line: Hidden in demo mode (Mon-Fri 10am-4pm)\n\nRefer to the Threshold Document for guidance on levels of need and when social care involvement is appropriate. Assessment tools (EHA, GCP, DVRIM) are available on the DDSCP Documents Library.",
        tip: "The Threshold Document helps you understand levels of need: universal services, early help, child in need, or child protection. Available on the DDSCP website.",
      },
      {
        id: "4",
        title: "Discuss with Family",
        content: "Best practice is to discuss concerns with the family and gain consent before referring.\n\nHowever, do NOT seek consent if:\n- Doing so would put the child at greater risk\n- Doing so would put you or others at risk\n- It would compromise a police investigation\n- The alleged perpetrator is a family member and may destroy evidence\n\nIf you refer without consent, record your reasons clearly in the referral.\n\nSee 'Making a Referral to Social Care' guidance on the DDSCP website for detailed advice on when consent is and isn't appropriate.",
      },
      {
        id: "5",
        title: "Make the Referral - Urgent",
        content: "For urgent referrals, telephone first then follow up in writing within 48 hours.\n\nDerby City - Initial Response Team (Mon-Fri 9am-5pm): Hidden in demo mode\nDerby City - Out of Hours (Careline): Hidden in demo mode\n\nDerbyshire - Starting Point (Mon-Fri 9am-5pm): Hidden in demo mode\nDerbyshire - Out of Hours: Hidden in demo mode\n\nSave a copy of the referral in the child's health record.\n\nIn your referral include:\n- Child's name, DOB, address, school\n- Parent/carer details\n- Nature of concern - be specific about what you have seen, heard and observed\n- How long concerns have been present\n- Any assessment tools used (EHA, GCP, DVRIM)\n- Whether the family were informed\n- Other agencies involved\n- Your details and contact number\n\nRemember to follow up all telephone referrals within 48 hours using the online referral form. Ensure it is recorded on the clinical system (in Comms & Letters).",
        tip: "Tick 'Referral to Social Services department duty team' on the clinical system when making the referral.",
      },
      {
        id: "6",
        progressive: true,
        title: "Make the Referral - Written",
        content: "For non-urgent referrals (or as follow-up to a phone call), submit written referrals:\n\nDerby City:\nmyaccount.derby.gov.uk/en/service/report_concerns_about_a_child\n\nDerbyshire:\nDerbyshire Starting Point Referral Form (online)\n\nCases closed within the last three months should also be referred through these links.\n\nDocument in the patient's records and inform relevant agencies. Include all essential information and any assessments that may support the quality of the referral.",
      },
      {
        id: "7",
        title: "After the Referral",
        content: "Children's Social Care should respond within 24 hours of receiving your referral.\n\n- Chase up any outstanding referrals after three working days\n- Document the outcome and update relevant agencies\n- Add a follow-up task to your diary\n- Be prepared for Social Care to contact you for more information\n- If concerns escalate before you hear back, call again\n\nIf you disagree with the decision made by Social Care, use the multi-agency dispute resolution escalation protocol to challenge it. Don't let it go - escalation is your professional responsibility.\n\nRemember: safeguarding children overrides normal patient confidentiality. You do not need the parent's consent to refer if a child may be at risk.",
        tip: "The escalation protocol is available on the DDSCP website. If the same concerns keep being raised without resolution, escalate formally.",
      },
    ],
  },
  "domestic-abuse-guide": {
    id: "domestic-abuse-guide",
    title: "Recognising and Responding to Domestic Abuse",
    description: "Guidance for identifying and supporting patients affected by domestic abuse",
    steps: [
      {
        id: "1",
        title: "What is Domestic Abuse?",
        content: "The Domestic Abuse Act 2021 defines it as behaviour by a person aged 16+ towards someone they are personally connected to, that is:\n\n• Physical or sexual abuse\n• Violent or threatening behaviour\n• Controlling or coercive behaviour\n• Economic abuse\n• Psychological, emotional or other abuse\n\nIt includes behaviour between current or former partners, and between family members. It is not limited to physical violence.",
        tip: "In the year ending March 2019, an estimated 2.4 million people experienced domestic abuse – 1.6 million women and 786,000 men.",
      },
      {
        id: "2",
        title: "Professional Curiosity",
        content: "Professional curiosity means actively trying to understand what's happening, rather than accepting things at face value.\n\n• Test your assumptions about families\n• Consider information from multiple sources\n• See past the obvious\n• Question what you observe and hear\n• Look, listen, ask direct questions, check, and reflect on ALL information\n\nSafeguarding reviews repeatedly highlight failures of professional curiosity. If something doesn't feel right, dig deeper.",
        tip: "Every patient contact is an opportunity to consider domestic abuse – face to face, virtual or phone. The type of contact should not define whether you ask.",
      },
      {
        id: "3",
        progressive: true,
        title: "Signs to Look For",
        content: "Physical signs:\n• Unexplained injuries or injuries inconsistent with explanation\n• Multiple injuries at different stages of healing\n• Injuries during pregnancy\n\nBehavioural signs:\n• Low self-confidence, withdrawn, submissive\n• Always checking with partner, letting partner speak for them\n• Frequent missed or cancelled appointments\n\nTelephone indicators:\n• Short one-word responses\n• Sense someone is listening on speakerphone\n• Tense discussion of home environment\n\nIn older people:\n• May not identify abuse as abuse\n• Rely on perpetrator for care\n• Injuries attributed to age rather than abuse",
      },
      {
        id: "4",
        title: "Questions You Can Ask",
        content: "These are starting points, not a script – use professional judgement:\n\n• What's life like for you at home?\n• Are there times when you've felt unsafe?\n• Does your partner/family member ever frighten or threaten you?\n• Have you been hurt?\n• All couples argue – how do you resolve conflict?\n• You seem worried about your partner. Can you tell me more?\n• Do you have support from family or friends?\n• Do you have access to money for food, clothes, bills?\n\nIf on the phone: first check if anyone is present or within earshot. Use closed yes/no questions if the patient isn't safe to talk freely.",
        tip: "Concerns that asking about DA may increase risk should never prevent the conversation. Not asking prevents identification of risk entirely.",
      },
      {
        id: "5",
        title: "Responding to Disclosure",
        content: "It can be extremely difficult for someone to disclose. Your response matters.\n\nDO:\n• Be sensitive, non-judgemental, practical, supportive, discreet\n• Prioritise safety over work efficiency\n• Allocate private time and space to listen\n• Recognise that hearing disclosures can be traumatic – seek support yourself\n\nDO NOT:\n• Seek proof of abuse\n• Contact the abuser\n• Promise you can fix it\n• Judge their choices",
      },
      {
        id: "6",
        progressive: true,
        title: "DASH Risk Assessment",
        content: "If domestic abuse is suspected or disclosed, consider using the DASH risk assessment - even when the victim may not recognise it as abuse.\n\nThe DASH (Domestic Abuse, Stalking and Harassment) risk checklist is a nationally recognised tool developed by SafeLives (formerly CAADA - hence 'CAADA-DASH'). It helps identify high-risk cases that may need a MARAC (Multi-Agency Risk Assessment Conference) referral.\n\nSafeLives (the DASH source):\nhttps://safelives.org.uk\n\nMARAC referral forms (multiple languages) - Safer Derbyshire:\nhttps://www.saferderbyshire.gov.uk/what-we-do/domestic-abuse/marac/\n\nGeneral domestic abuse information and support:\nhttps://www.saferderbyshire.gov.uk/what-we-do/domestic-abuse/",
      },
      {
        id: "7",
        progressive: true,
        title: "Where to Get Help",
        content: "For the patient:\n• National DA Helpline: 0808 2000 247 (24hr, free)\n• Safer Derbyshire website for local services\n\nFor professional advice:\n• DHCFT Safeguarding Team: Hidden in demo mode\n• MASH Health Advisors: Hidden in demo mode\n\nIf children are in the household:\n• Always consider a children's safeguarding referral\n• Starting Point: Hidden in demo mode\n\nIn immediate danger: call 999",
        tip: "Document your concerns and actions in the patient's notes. If you suspect DA but the patient doesn't disclose, record your professional concerns and revisit at future contacts. When you save the record on SystmOne, tick 'Safeguarding relevant' at the bottom so it is flagged correctly.",
      },
    ],
  },
  "peer-conflict-guide": {
    id: "peer-conflict-guide",
    title: "Peer-on-Peer Conflict – When to Escalate",
    description: "Managing patient conflict on the ward and knowing when to make a safeguarding referral",
    steps: [
      {
        id: "1",
        title: "Levels of Conflict",
        content: "Not all conflict is safeguarding. Consider the level:\n\nLow level:\nArguments, irritability, verbal disputes – manage therapeutically through de-escalation and the ward environment.\n\nEscalating:\nThreats, intimidation, persistent bullying – impacting wellbeing and safety. Keep records. Ask yourself: what am I doing to protect this patient?\n\nHigh risk:\nPhysical assault, coercion, sexualised behaviours, targeting of vulnerable patients – these are safeguarding and/or criminal matters.",
        tip: "Rule of thumb: ward-level conflict = manage therapeutically. Conflict causing risk of serious harm = escalate via safeguarding.",
      },
      {
        id: "2",
        title: "When to Make a Referral",
        content: "Escalate to safeguarding when:\n\n• There is risk of significant harm – a patient has been, or is at risk of being, seriously harmed by another patient\n• Power imbalance – a patient lacking capacity is being targeted or exploited (consider a capacity assessment)\n• Repeated incidents – conflict persists despite staff interventions, suggesting a pattern of abuse\n• Sexual safety concerns – any sexual activity on a ward needs careful scrutiny around capacity, consent and risk\n• Neglect – if staff response has been inadequate, raise internally and consider safeguarding\n• Systematic failure – raise internally but consider safeguarding for external scrutiny",
      },
      {
        id: "3",
        title: "Immediate Steps",
        content: "Before or alongside a safeguarding referral:\n\n• Separate the patients immediately\n• Medical review if required\n• Review bed spaces – move patients if necessary\n• Consider observation levels\n• Update risk plans\n• Document the incident factually in EPR and Datix\n• Bring to MDT, ward round, and handover\n• Involve HoN, medics, and Safeguarding Team as needed\n• Open and transparent conversation with family/carers (with consent or best interests)\n• Does the patient have an advocate?\n• Do Police need to be informed?",
        tip: "A risk strategy meeting can be helpful for complex situations before deciding on the referral.",
      },
      {
        id: "4",
        title: "Staff Responsibilities",
        content: "Nursing staff:\n• Immediate response, documentation, de-escalation\n\nWard Manager / Lead Nurse:\n• Lead the review, ensure MDT discussion, coordinate safeguarding referral\n\nSafeguarding Link Nurse/Practitioner:\n• Liaise with Safeguarding Team, support staff with the referral\n\nMedical staff:\n• Review patients, assess capacity, amend risk plans",
      },
      {
        id: "5",
        progressive: true,
        title: "Making the Referral",
        content: "When making a peer-on-peer safeguarding referral:\n\n• Use patients' full names - not initials\n• Include Police incident number if Police have been informed\n• If consent was not obtained, justify why it was overridden\n• If stating the patient lacks capacity, ensure a referral to advocacy is also made\n• Include what immediate measures have been put in place to prevent further harm\n\nContact:\n• DHCFT Safeguarding Team: Hidden in demo mode\n• MASH Health Advisors: Hidden in demo mode",
      },
    ],
  },
  "information-sharing": {
    id: "information-sharing",
    title: "Information Sharing in Safeguarding",
    description: "Seven golden rules and GDPR guidance for sharing information to protect children and adults",
    steps: [
      {
        id: "1",
        title: "Why Information Sharing Matters",
        content: "Information sharing is essential for effective safeguarding. Poor or absent information sharing is a factor repeatedly identified in Serious Case Reviews where children or adults have been harmed.\n\nFears about sharing information must not stand in the way of safeguarding. Every practitioner must take responsibility for sharing the information they hold - you cannot assume someone else will pass it on.\n\nSharing information can be the difference between life and death.",
        tip: "The GDPR and Data Protection Act 2018 are not barriers to sharing information for safeguarding purposes. They provide a framework to ensure personal information is shared appropriately.",
      },
      {
        id: "2",
        title: "The Seven Golden Rules",
        content: "1. GDPR is not a barrier - it provides a framework for appropriate sharing, not a reason to withhold\n\n2. Be open and honest - tell the individual from the outset why, what, how and with whom information will be shared (unless unsafe to do so)\n\n3. Seek advice - if in doubt, ask your information governance lead or another practitioner without identifying the individual\n\n4. Share with consent where possible - but you may share without consent if there is a lawful basis, such as where safety is at risk\n\n5. Consider safety and wellbeing - base your decisions on the safety of the individual and others affected\n\n6. Necessary, proportionate, relevant, adequate, accurate, timely and secure - only share what is needed, with people who need it\n\n7. Record your decision - whether you share or not, record what you decided and why",
      },
      {
        id: "3",
        title: "When You Can Share Without Consent",
        content: "Under the Data Protection Act 2018, you may share information without consent when:\n\n- There is a lawful basis (e.g. safety may be at risk)\n- You cannot reasonably be expected to gain consent\n- Gaining consent could place a child or adult at risk\n- Safeguarding of children and individuals at risk is a specific condition that allows sharing without consent\n\nRelevant personal information can be shared lawfully if it is to keep a child or individual at risk safe from neglect or physical, emotional or mental harm, or to protect their wellbeing.",
        tip: "If you are sharing without consent, be mindful that the individual may not expect their information to be shared. Record your reasoning clearly.",
      },
      {
        id: "4",
        title: "The Principles in Practice",
        content: "When deciding what to share, apply these principles:\n\nNecessary - only share what is needed, no more\nProportionate - match the level of sharing to the level of risk\nRelevant - only share with people who need the information to act\nAdequate - share enough for the recipient to do their job\nAccurate - clearly distinguish fact from opinion; flag historical information\nTimely - don't delay, especially in emergencies where seeking consent could increase risk\nSecure - follow your organisation's policy on handling personal information",
      },
      {
        id: "5",
        title: "Recording Your Decisions",
        content: "Always record:\n\n- Whether you decided to share or not\n- Your reasons for the decision\n- What information was shared (if sharing)\n- Who it was shared with\n- The purpose of sharing\n\nIf you decided not to share, record why and discuss with the requester.\n\nKeep records in line with your organisation's retention policy. In some rare circumstances information may need to be kept indefinitely, but schedule regular reviews.",
        tip: "A clear record protects you professionally and helps others understand the reasoning if concerns resurface later.",
      },
    ],
  },
  "escalation-pathway": {
    id: "escalation-pathway",
    title: "Escalation Pathway - Complex Children's Cases",
    description: "Bronze, Silver and Gold escalation levels for young people with complex needs",
    steps: [
      {
        id: "1",
        title: "What is the Escalation Pathway?",
        content: "The Derby and Derbyshire Escalation Pathway enables community teams from Social Care, Health and Education to access additional support when formulating care packages for young people with complex histories or presentations.\n\nUse this pathway when:\n- A young person is at risk of admission to Tier 4 services\n- There is severe deterioration of mental health\n- There are frequent attendances at the Children's Emergency Department\n- There are complexities within the care package requiring a joined-up, creative approach\n\nThis pathway works alongside existing CETR (Care, Education and Treatment Review) and LAEP processes - it does not replace them.",
        tip: "Open assessments from community teams should be completed before requesting escalation, where possible.",
      },
      {
        id: "2",
        title: "How to Refer",
        content: "Submit a referral to the Escalation Pathway team via email.\n\nEmail: Hidden in demo mode\nWorking hours: Monday to Friday, 09:00-17:00\n\nThe team will check referrals daily and respond:\n- If appropriate: the team will contact you and allocate an escalation level\n- If not appropriate or incomplete: you will be contacted with a decision or request for further information\n\nConsultation will be booked within 2 weeks of referral received.",
      },
      {
        id: "3",
        title: "Bronze Level",
        content: "Bronze is the initial escalation level for community-referred cases.\n\nWhat happens:\n- Daily discussion with CAMHS Leads and Discharge Coordinators for Acute Hospitals\n- Weekly attendance at CAP for Tier 4 Collaborative\n- Management of referrals by community teams\n- Monitoring of frequent attendance at CED\n- Joint working clarified with agreed action log\n- Enhanced MDMs chaired by Escalation Manager\n\nTimeline: MDM established within 5 working days\nEscalation: To Silver as needed\nAcute referrals: Via discharge coordinator (UHDB/CRH/Tier 4 Collaborative)",
      },
      {
        id: "4",
        title: "Silver Level",
        content: "Silver is for cases requiring strategic facilitation and cross-system coordination.\n\nWhat happens:\n- Cases supported by Complex Case Strategic Facilitator (EMDM)\n- Actions escalated to Head of Service, Area Service Manager CAMHS, General Manager, Commissioner, NHS case manager as required\n- Weekly Silver system meeting\n- Clinical Escalations Group representation for Tier 4 Collaborative\n- Head of Service meetings within local authority as needed\n\nTimeline: EMDM convened within 2 working days\nStep down: To Bronze when stabilised\nEscalation: To Gold as needed",
      },
      {
        id: "5",
        title: "Gold Level",
        content: "Gold is the highest escalation - executive-level oversight.\n\nWhat happens:\n- Weekly (or as-required) Executive Escalation meeting\n- Actions escalated to Directors, General Manager, Collaborative Directors, COO, CEO, Chief Nurse across the system\n- Shadow invitations to partnership agencies from neighbouring localities as needed\n- Email updates given to Executive team across the system for any complex young person\n- Clarification of current system gaps and pressures reported to ICB\n\nDischarge: Informed by Escalation Manager / Complex Case Strategic Facilitator",
        tip: "The escalation pathway team are there to help you navigate the system. Don't hesitate to contact them early - consultation is available before formal escalation.",
      },
    ],
  },
  "online-safety-children": {
    id: "online-safety-children",
    title: "Online Safety and Children",
    description: "Recognising online harms including nudes/semi-nudes, cyberbullying, sextortion and screen time",
    steps: [
      {
        id: "1",
        title: "Online Harms Overview",
        content: "Online harms are a priority area for the Derby and Derbyshire Safeguarding Children Partnership (DDSCP). Key concerns include:\n\n- Sharing of nudes and semi-nude images\n- Online bullying and harassment\n- Sexual exploitation and sextortion\n- Grooming by adults\n- Exposure to harmful or extremist content\n- Excessive screen time affecting development\n- Gaming-related risks\n\nAs a mental health professional, you may be the first person a young person or parent discloses to. Be alert to signs of online harm during every contact with families.",
        tip: "The online landscape changes rapidly. The types of platforms, apps and risks evolve constantly - stay curious about what young people are telling you.",
      },
      {
        id: "2",
        progressive: true,
        title: "Nudes and Semi-Nudes",
        content: "Sharing nudes or semi-nudes (previously called 'sexting') is when someone shares sexual or naked images of themselves or others electronically.\n\nKey points for practitioners:\n- It is illegal for anyone to possess, share or create indecent images of under-18s, even if the young person consented or created the image themselves\n- Young people may not understand the legal implications\n- Coercion, pressure or manipulation may be involved\n- Images shared once can be re-shared without control\n- The impact on mental health can be severe and long-lasting\n\nIf a young person discloses:\n- Do not view, copy or share the image\n- Do not ask to see it\n- Record what the young person tells you\n- Follow your safeguarding reporting process\n- Consider whether police involvement is needed",
      },
      {
        id: "3",
        progressive: true,
        title: "Online Bullying",
        content: "Online bullying can include:\n- Sending threatening or abusive messages\n- Deliberately excluding someone from online groups\n- Sharing embarrassing photos or information\n- Creating fake profiles to humiliate someone\n- Persistent negative comments\n- 'Doxxing' (publishing private information)\n\nImpact on young people:\n- Anxiety, depression and self-harm\n- Social withdrawal and school avoidance\n- Sleep disturbance\n- Loss of confidence and self-esteem\n- In severe cases, suicidal thoughts\n\nUnlike face-to-face bullying, online bullying can happen 24/7, can reach a wide audience instantly, and content can be permanent. Always take it seriously.",
        tip: "Ask young people about their online experiences as part of routine mental health assessments. Many won't volunteer this information unless directly asked.",
      },
      {
        id: "4",
        progressive: true,
        title: "Sextortion",
        content: "Sextortion is when someone threatens to share sexual images or information unless the victim complies with demands - often for money, more images, or sexual acts.\n\nWarning signs:\n- Sudden anxiety or distress, especially when using devices\n- Withdrawal from family and friends\n- Unexplained requests for money\n- Secretive behaviour around devices\n- Signs of distress after using social media\n\nIf a young person is being sextorted:\n- Reassure them it is not their fault\n- Advise them not to pay or send further images\n- Report to the police (101 or 999 if immediate risk)\n- Report to CEOP (ceop.police.uk)\n- Support their mental health - this is traumatic\n- Contact the platform to request removal of content",
      },
      {
        id: "5",
        title: "Screen Time and Development",
        content: "There are clear links between excessive screen time and development problems:\n\n- Delayed speech and language development\n- Communication difficulties\n- Reduced concentration spans\n- Poor sleep\n- Poor mental health\n\nAge-appropriate guidance:\n- Ages 0-5: Limit screen time significantly; prioritise face-to-face interaction\n- Ages 6-10: Set clear boundaries; no screens in bedrooms; screen-free mealtimes\n- Ages 11-17: Agree boundaries together; encourage balance with offline activities\n\nFor parents and carers, the key message is quality over quantity - what children are doing on screens matters as much as how long they spend on them.",
        tip: "Use the 'Top Tips for a Healthier Screen Time' infographic from NHS Leicester Children's Hospital - it is split by age group with practical tips for families.",
      },
      {
        id: "6",
        progressive: true,
        title: "Resources and Support",
        content: "Key resources for online safety:\n\n- UK Safer Internet Centre (saferinternet.org.uk) - advice for professionals and families\n- CEOP (ceop.police.uk) - report online child sexual exploitation\n- NSPCC (nspcc.org.uk) - guidance on all forms of online abuse\n- Childnet International - resources for young people\n- Internet Watch Foundation - reporting illegal content\n- DDSCP Online Safety resources (ddscp.org.uk)\n\nFor professional advice:\n- DHCFT Safeguarding Unit: Hidden in demo mode\n\nIf a child is in immediate danger, call 999.",
      },
    ],
  },
  "honour-based-abuse": {
    id: "honour-based-abuse",
    title: "Honour-Based Abuse, FGM and Forced Marriage",
    description: "Recognising and responding to honour-based abuse, female genital mutilation and forced marriage",
    steps: [
      {
        id: "1",
        title: "Honour-Based Abuse (HBA)",
        content: "Honour-based abuse is a collection of practices used to control behaviour within families or communities to protect perceived cultural or religious honour.\n\nIt can include:\n- Physical violence (assault, kidnapping, murder)\n- Emotional abuse (threats, isolation, disownment)\n- Forced marriage\n- Female genital mutilation (FGM)\n- Forced abortion or forced pregnancy\n- Restrictions on movement, education or employment\n- Being taken abroad against their will\n\nHBA can affect people of any gender, though women and girls are disproportionately affected. It may involve multiple family members or community figures acting together.\n\nKarma Nirvana (karmanirvana.org.uk) provides specialist support for victims of HBA.",
        tip: "HBA is not a 'cultural issue' to be handled sensitively - it is abuse. Do not attempt family mediation or inform the family of disclosures, as this can increase risk significantly.",
      },
      {
        id: "2",
        progressive: true,
        title: "Female Genital Mutilation (FGM)",
        content: "FGM involves the partial or total removal of external female genitalia for non-medical reasons. It is illegal in the UK.\n\nKey points:\n- FGM is a criminal offence under the Female Genital Mutilation Act 2003\n- There is a mandatory duty to report FGM in under-18s to the police (since 2015)\n- It is often carried out on girls aged 0-15, frequently before puberty\n- It may be performed abroad during school holidays\n- There is no medical justification for FGM\n\nSigns to look for:\n- Prolonged absence from school or services\n- Behavioural changes - withdrawal, anxiety\n- Difficulty walking, sitting or standing\n- Reluctance to undergo medical examinations\n- Talk of a 'special procedure' or holiday\n\nIf you suspect FGM has occurred or is planned, this is a safeguarding referral and must be reported to the police.",
        tip: "The mandatory reporting duty means you MUST report to the police if you discover FGM has been carried out on a girl under 18. This is a legal requirement, not optional.",
      },
      {
        id: "3",
        title: "Forced Marriage",
        content: "A forced marriage is one where one or both parties do not (or cannot) consent. It is different from an arranged marriage, where both parties freely agree.\n\nForced marriage is illegal in the UK under the Anti-social Behaviour, Crime and Policing Act 2014.\n\nSigns to look for:\n- Absence from services or education\n- Family-related depression, anxiety or self-harm\n- Feeling they are under surveillance by family\n- Talk of an upcoming 'celebration' or 'holiday' abroad\n- Fear of an upcoming school holiday\n- Sudden engagement to a stranger\n- Decline in behaviour or achievement\n\nForced marriage can happen to anyone regardless of gender, age, disability, ethnicity or sexuality. People with learning disabilities are particularly vulnerable.",
      },
      {
        id: "4",
        title: "How to Respond",
        content: "If someone discloses HBA, FGM or forced marriage:\n\nDO:\n- See them alone in a safe, private space\n- Take the disclosure seriously\n- Record their exact words\n- Explain you will need to share this information\n- Make a safeguarding referral\n- Contact the police if there is immediate risk\n\nDO NOT:\n- Contact or inform the family\n- Attempt mediation or family counselling\n- Share information with community members\n- Send the person away to 'think about it'\n- Assume it is a cultural practice to be respected\n- Wait - delays can be dangerous\n\nKey contacts:\n- Karma Nirvana helpline: 0800 5999 247\n- Forced Marriage Unit: 020 7008 0151\n- National FGM Centre: nationalfgmcentre.org.uk\n- Police: 999 (emergency) or 101 (non-emergency)",
        tip: "In HBA cases, the risk often increases after disclosure. Act quickly and do not inform family members under any circumstances.",
      },
    ],
  },
  "modern-slavery-radicalisation": {
    id: "modern-slavery-radicalisation",
    title: "Modern Slavery and Radicalisation",
    description: "Spotting the signs and making referrals for modern slavery and extremism concerns",
    steps: [
      {
        id: "1",
        title: "Modern Slavery",
        content: "Modern slavery includes human trafficking, forced labour, domestic servitude and sexual exploitation. It affects both adults and children in the UK.\n\nSigns to look for:\n- Appears malnourished, unkempt or withdrawn\n- Has injuries that appear to be from assault or restraint\n- Shows signs of being controlled by another person\n- Is not in possession of their own passport, ID or documents\n- Has few or no personal possessions\n- Is not free to come and go\n- Appears frightened or unable to speak for themselves\n- Is collected and dropped off at work by the same person\n- Lives and works at the same address\n- Is reluctant to seek help or disclose information\n\nModern slavery affects people of all ages, nationalities and backgrounds. Mental health patients may be particularly vulnerable.",
        tip: "People who have been trafficked or enslaved may not identify themselves as victims. Approach with professional curiosity and compassion.",
      },
      {
        id: "2",
        title: "Referring Modern Slavery Concerns",
        content: "If you suspect modern slavery:\n\n1. Ensure the person's immediate safety\n2. Make a safeguarding referral (adults or children as appropriate)\n3. Contact the police if there is immediate risk (999) or non-emergency (101)\n4. Consider referring to the National Referral Mechanism (NRM) - the UK framework for identifying and supporting victims\n\nThe NRM referral is made by a 'First Responder' organisation. The Safeguarding Team can support you with this.\n\nLocal guidance: Derby and Derbyshire Modern Slavery Guidance (available on the Safer Derbyshire website)\n\nModern Slavery Helpline: 08000 121 700 (24hr)",
      },
      {
        id: "3",
        title: "Radicalisation and Prevent",
        content: "Radicalisation is the process by which a person comes to support extremism and potentially terrorism. It can happen to anyone regardless of age, gender, ethnicity or background.\n\nSigns to look for:\n- Expressing sympathy for extremist causes or ideologies\n- Glorifying violence\n- Becoming increasingly isolated from friends, family or community\n- Accessing extremist material online\n- Using language or symbols associated with extremist groups\n- Sudden changes in behaviour, friendship groups or appearance\n- Secretive behaviour, especially online\n\nPrevent is the government's strategy to stop people becoming terrorists or supporting terrorism. It is a safeguarding duty, not a surveillance or intelligence function.",
        tip: "Prevent is a pre-criminal space - you are trying to protect someone from being drawn into harm, not report them as a criminal. Approach it like any other safeguarding concern.",
      },
      {
        id: "4",
        title: "Making a Prevent Referral",
        content: "If you have concerns about radicalisation:\n\n1. Discuss with your line manager or safeguarding lead\n2. Contact the DHCFT Safeguarding Team for advice: Hidden in demo mode\n3. If appropriate, make a Prevent referral to the local authority\n4. In an emergency, call 999\n\nA Prevent referral will be reviewed by a multi-agency Channel panel who will assess the level of risk and decide what support is needed.\n\nRemember: you do not need to be certain that someone is being radicalised. If you have concerns, share them. Early intervention is key.\n\nFor more information, see the DDSCP guidance on safeguarding children and young people against radicalisation and violent extremism.",
      },
    ],
  },
  "faith-belief-abuse": {
    id: "faith-belief-abuse",
    title: "Child Abuse Linked to Faith or Belief",
    description: "Recognising abuse linked to faith, belief, spirit possession or witchcraft",
    steps: [
      {
        id: "1",
        title: "What is CALFB?",
        content: "Child Abuse Linked to Faith or Belief (CALFB) is when a belief in concepts like spirit possession, witchcraft, black magic, the evil eye or juju is used to harm a child.\n\nIt can include:\n- Physical abuse (beating, burning, cutting, starvation)\n- Emotional abuse (isolation, blaming the child for misfortune)\n- Neglect (withholding food, medical treatment or education)\n- Sexual abuse\n- Attempts to 'exorcise' the child\n\nThis is not about any one religion, faith or culture. It occurs across many different backgrounds and communities.\n\nChildren may be singled out because of a disability, behavioural difference, illness, bed-wetting, nightmares, or disobedience. A child who is 'different' in any way may be labelled as possessed.",
        tip: "A child will not necessarily recognise that what is happening to them is abuse. They may believe the label given to them and feel responsible for family problems.",
      },
      {
        id: "2",
        title: "Signs to Look For",
        content: "Warning signs that a child may be experiencing CALFB:\n\n- A child described as being 'possessed' or 'evil'\n- The family blaming a child for problems like illness, financial difficulty or relationship breakdown\n- A child being isolated from the rest of the family or community\n- Changes in behaviour following involvement with faith groups or healers\n- Unexplained injuries, particularly burns or marks\n- A child appearing frightened of a parent, carer or religious/community leader\n- Reports of deliverance or exorcism rituals\n- Sudden changes in the child's demeanour or wellbeing\n\nBe professionally curious: if a family talks about a child being cursed or possessed, explore what this means in practice for the child's daily life.",
      },
      {
        id: "3",
        progressive: true,
        title: "How to Respond",
        content: "If you suspect CALFB:\n\n1. Follow your normal safeguarding procedures - this is child abuse\n2. Record your concerns clearly, including the language used by the family\n3. Contact the DHCFT Safeguarding Team for advice: Hidden in demo mode\n4. Make a referral to Children's Social Care\n5. Do not attempt to challenge or debate the belief directly\n6. Do not dismiss concerns as 'cultural' or 'religious'\n\nChildren's Social Care will work with specialist agencies if needed.\n\nFor more information:\n- National FGM Centre (nationalfgmcentre.org.uk) covers CALFB\n- DDSCP chapter on CALFB (available on the DDSCP website)\n\nIf a child is in immediate danger, call 999.",
        tip: "You do not need to understand or agree with a family's belief system to recognise that a child is being harmed. Focus on the impact on the child.",
      },
    ],
  },
  "send-safeguarding": {
    id: "send-safeguarding",
    title: "SEND and Safeguarding",
    description: "Special Educational Needs and Disability - safeguarding considerations and local resources",
    steps: [
      {
        id: "1",
        title: "Why SEND Matters for Safeguarding",
        content: "Children and young people with special educational needs and disabilities (SEND) are disproportionately vulnerable to abuse and neglect.\n\nThey may:\n- Have difficulty communicating what is happening to them\n- Not recognise abuse or understand it is wrong\n- Be more dependent on caregivers, increasing vulnerability to abuse within the care relationship\n- Have behaviours that mask or are attributed to their disability rather than abuse\n- Be isolated from peers who might otherwise notice and report concerns\n- Be subject to bullying, discrimination or hate crime\n\nSEND covers conditions affecting a child's ability to learn, including learning difficulties, physical disabilities, sensory impairments, communication needs, autism, ADHD, and mental health conditions.",
        tip: "Never attribute signs of abuse to a child's disability without considering whether there could be another explanation. Professional curiosity applies here too.",
      },
      {
        id: "2",
        title: "Trust SEND Policy",
        content: "DHCFT has a SEND policy available on FOCUS that outlines the Trust's responsibilities.\n\nKey principles:\n- All staff should be aware that children with SEND may face additional safeguarding risks\n- Reasonable adjustments should be made when communicating with children and families\n- Consider the child's communication needs when assessing risk or taking disclosures\n- Work collaboratively with education, social care and health services\n- Ensure the child's voice is heard - use appropriate communication methods\n\nThe policy covers the Trust's duties under the Children and Families Act 2014, which reformed the SEND system to give families greater choice and control.",
      },
      {
        id: "3",
        progressive: true,
        title: "Local SEND Offers",
        content: "Derby and Derbyshire both publish a 'Local Offer' setting out the support available for children and young people with SEND:\n\nDerby City:\n- Derby's SEND Local Offer (derby.gov.uk)\n- Information on education, health and social care services\n\nDerbyshire County:\n- SEND Service Contact Details (localoffer.derbyshire.gov.uk)\n- Derbyshire Information, Advice and Support Service for SEND (derbyshireiass.co.uk)\n\nNational guidance:\n- GOV.UK overview of SEND (gov.uk/children-with-special-educational-needs)\n- NHS England SEND pages (england.nhs.uk)",
      },
      {
        id: "4",
        title: "Making Safeguarding Referrals for Children with SEND",
        content: "When making a safeguarding referral for a child with SEND:\n\n- Clearly describe the child's needs and how they communicate\n- Explain what adaptations may be needed for any assessment or interview\n- Include information about the child's EHCP (Education, Health and Care Plan) if known\n- Note any professionals already involved (SENCO, Educational Psychologist, specialist health services)\n- Describe the child's daily experience - what does life look like for them?\n- Consider whether the child's behaviour changes are related to abuse, not just their condition\n\nUse the standard safeguarding referral pathways. The Safeguarding Team can advise on any additional considerations.",
        tip: "Children with SEND often have multiple professionals involved. Information sharing between agencies is especially important - see the Information Sharing guide.",
      },
    ],
  },
  "non-recent-abuse": {
    id: "non-recent-abuse",
    title: "Non-Recent Abuse Disclosures",
    description: "Responding when adults disclose abuse that happened in childhood",
    steps: [
      {
        id: "1",
        title: "What is Non-Recent Abuse?",
        content: "Non-recent abuse (previously called 'historical abuse') refers to abuse that was experienced in the past, often during childhood. Adults may disclose for the first time during mental health treatment.\n\nImportant principles:\n- There is no time limit for reporting abuse to the police\n- A disclosure of non-recent abuse should be treated with the same seriousness as current abuse\n- The perpetrator may still pose a risk to children or adults now\n- The disclosure may be the first time the person has ever spoken about their experience\n\nA young person under 18 who discloses non-recent abuse should be treated under children's safeguarding procedures.",
        tip: "Many survivors of non-recent abuse have carried their experience for decades. Receiving a disclosure with sensitivity and belief is crucial.",
      },
      {
        id: "2",
        progressive: true,
        title: "Responding to a Disclosure",
        content: "When an adult discloses non-recent abuse:\n\n- Listen without judgement\n- Believe them - false disclosures are extremely rare\n- Thank them for telling you\n- Do not press for details beyond what they choose to share\n- Explain what will happen next (you may need to share the information)\n- Record their words accurately\n- Consider their current mental health and safety\n\nAsk yourself:\n- Is the alleged perpetrator still alive and potentially in contact with children or vulnerable adults?\n- Are there current safeguarding concerns?\n- Does the person need mental health support for the impact of the abuse?",
      },
      {
        id: "3",
        title: "When to Refer",
        content: "You must consider a safeguarding referral if:\n\n- The alleged perpetrator may still pose a risk to children or vulnerable adults\n- The abuse occurred in an institutional setting (care home, school, hospital)\n- The person wishes to report to the police\n- There are current children in contact with the alleged perpetrator\n\nRefer to the DDSCP guidance: 'Adults who Disclose Non-Recent Abuse' (available on the DDSCP website).\n\nThe Derby and Derbyshire Strategy for Survivors of Non-Recent Abuse in Childhood provides a multi-agency framework for supporting survivors.\n\nFor advice: DHCFT Safeguarding Team - Hidden in demo mode",
        tip: "Even if the perpetrator is deceased, consider whether there may be other victims who could benefit from support, or institutional failures that need addressing.",
      },
      {
        id: "4",
        progressive: true,
        title: "Supporting the Survivor",
        content: "After a disclosure:\n\n- Offer follow-up support and ensure continuity of care\n- Consider referral to specialist trauma services\n- Share the 'Talking About Non-Recent Abuse' leaflet (available on DDSCP website)\n- Provide information about reporting options - the person should feel in control\n- Document the disclosure and any actions taken\n- Consider your own wellbeing - hearing disclosures can be distressing\n\nPractitioner wellbeing support:\n- Staff Wellbeing and Recognition Team\n- Health Assured (EAP): 0800 028 0199 (24/7)\n- Resolve counselling: Hidden in demo mode\n- Samaritans: 116 123 (24/7)",
      },
    ],
  },
  "special-guardianship": {
    id: "special-guardianship",
    title: "Special Guardianship Orders",
    description: "Best practice guide for achieving permanence through Special Guardianship Orders",
    steps: [
      {
        id: "1",
        title: "What is a Special Guardianship Order?",
        content: "A Special Guardianship Order (SGO) is a legal order that gives a person (the 'special guardian') parental responsibility for a child until they turn 18. It provides permanence without fully severing the legal relationship with the birth parents.\n\nSGOs are typically used when:\n- A child cannot safely live with their birth parents\n- Adoption is not appropriate or desired\n- The child has a strong connection with a relative or family friend\n- Stability and permanence are needed outside the care system\n\nFollowing serious case reviews in Derby and Derbyshire (2023), the DDSCP produced best practice guidance to strengthen SGO assessment and support.",
        tip: "SGOs give the special guardian day-to-day decision-making power, but birth parents retain some parental responsibility. This shared responsibility can create complexity.",
      },
      {
        id: "2",
        progressive: true,
        title: "Why This Matters on the Ward",
        content: "You may encounter SGOs when:\n- A patient's child is subject to an SGO (the child lives with a special guardian)\n- A patient IS a special guardian and their mental health is affecting their ability to care\n- Family dynamics around an SGO are contributing to a patient's distress\n- A young person under an SGO is admitted or known to services\n\nAs a mental health practitioner, consider:\n- Does the child's placement remain safe and stable?\n- Is the special guardian receiving adequate support?\n- Are there emerging concerns about the child's wellbeing?\n- Should Children's Social Care be informed of changes?",
      },
      {
        id: "3",
        title: "Best Practice Principles",
        content: "The DDSCP best practice guide (October 2024) emphasises:\n\n- Thorough assessment of the prospective special guardian's suitability, capacity and support network\n- Financial support plans should be clear and agreed before the order is made\n- Support should not end when the order is granted - ongoing access to advice and services is essential\n- Regular reviews of the child's welfare\n- Clear contingency planning if the SGO breaks down\n- Multi-agency collaboration between health, education and social care\n\nIf you have concerns about a child under an SGO, follow the standard safeguarding referral process.",
      },
    ],
  },
  "child-in-need": {
    id: "child-in-need",
    title: "Child in Need",
    description: "Multi-agency best practice for meeting the needs of children through CIN arrangements",
    steps: [
      {
        id: "1",
        title: "What is Child in Need?",
        content: "Under Section 17 of the Children Act 1989, a child is 'in need' if:\n- They are unlikely to achieve or maintain a reasonable standard of health or development without provision of services\n- Their health or development is likely to be significantly impaired without services\n- They are disabled\n\nA Child in Need (CIN) plan is a voluntary arrangement - it requires family engagement. It sits below child protection on the continuum of need but still requires active multi-agency involvement.\n\nFollowing serious case reviews in Derby and Derbyshire (2023), the DDSCP produced best practice guidance to strengthen CIN planning and review.",
        tip: "CIN is not 'lower risk' child protection - it is a different framework. Children on CIN plans can still be at significant risk if the plan is not implemented effectively.",
      },
      {
        id: "2",
        progressive: true,
        title: "Your Role in CIN",
        content: "As a mental health practitioner, you play a key role in CIN arrangements when your patient is a parent or carer.\n\nYour responsibilities:\n- Attend CIN meetings when invited - your input on the parent's mental health is essential\n- Share relevant information about parenting capacity, risk and protective factors\n- Contribute to the CIN plan with clear, measurable actions\n- Provide updates to the allocated social worker on progress or deterioration\n- Alert social care immediately if concerns escalate\n\nConsider:\n- How does the parent's mental health affect their day-to-day parenting?\n- What does life look like for the child when the parent is unwell?\n- What support would help the parent maintain safe parenting?",
      },
      {
        id: "3",
        title: "Best Practice",
        content: "The DDSCP best practice guide (October 2024) highlights:\n\n- CIN plans must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)\n- Reviews should happen at least every 6 weeks\n- The child's voice must be captured - use age-appropriate methods\n- All agencies must be clear about their specific contributions\n- Step-up to child protection or step-down to early help should be timely and evidence-based\n- Drift and delay are the biggest risks in CIN work\n\nIf a CIN plan is not reducing risk effectively, escalate your concerns. Use the DDSCP multi-agency dispute resolution protocol if you disagree with decisions.",
      },
      {
        id: "4",
        progressive: true,
        title: "Resources",
        content: "Key resources:\n\n- DDSCP Threshold Document - guidance on levels of need\n- DDSCP Assessment Tools Library (Early Help Assessment, GCP, DVRIM, CRE)\n- DDSCP Best Practice Guide: Child in Need (October 2024)\n- DHCFT Safeguarding Team for advice: Hidden in demo mode\n\nConsultation lines:\n- Derbyshire Starting Point: Hidden in demo mode (Mon-Fri 10am-4pm)\n- Derby City Professional Consultation Line: Hidden in demo mode (Mon-Fri 10am-4pm)\n\nEscalation:\n- Multi-agency dispute resolution protocol available on DDSCP website",
        tip: "If you feel a CIN plan is drifting or not reducing risk, you have a professional duty to escalate. The child's wellbeing is everyone's responsibility.",
      },
    ],
  },
  "abc-chart": {
    id: "abc-chart",
    title: "ABC Charts - Antecedent, Behaviour, Consequence",
    description: "Recording and analysing challenging behaviour to identify triggers, patterns and functions",
    downloads: [
      { label: "Blank ABC chart to print", url: "/abc-chart-blank.html" },
    ],
    steps: [
      {
        id: "1",
        title: "What is an ABC Chart?",
        content: "An ABC chart is a structured observation tool for recording incidents of behaviour that challenges. It captures three elements:\n\nA - Antecedent: what was happening before the behaviour - determines triggers and setting conditions\nB - Behaviour: an exact description of the behaviour itself\nC - Consequence: what happened after - gives an indicator of possible reinforcers\n\nABC charts should be completed for:\n- Verbal aggression\n- Violence or physical aggression\n- Self-harm\n- Agitation or behaviour that challenges\n\nComplete them alongside the session note and Datix. They are frequently requested at panel as supportive evidence to accompany the NPA, so it is crucial they are completed as required.",
        tip: "ABC charts support care planning, risk assessment, future placement decisions and funding applications. Good quality charts make a real difference at panel.\n\nSee a completed example: open the WAGOLL from the link below the guide steps.",
      },
      {
        id: "2",
        title: "Why Do We Use Them?",
        content: "ABC charts help the team to:\n\n- Monitor patterns of behaviour to understand triggers\n- Identify times when behaviour is absent vs present\n- Distinguish fast triggers (immediate provocation) from slow triggers (building over time - sleep, pain, medication, family events)\n- Identify factors that increase and decrease behaviour\n- Understand the possible function of the behaviour\n- Review how staff respond and what works\n\nExample: Barry is noticeably more irritable when supported by male staff compared to female staff when getting up in the morning.\n\nExample: Mary often seeks 1:1 time from staff and when she doesn't feel this need is being met, she begins to express that she wants to harm herself.\n\nExample: Bill de-escalates better with one familiar staff member. He is very sensitive to noise and crowding.",
        tip: "Look for what is different on good days vs bad days. The absence of behaviour is just as important as the behaviour itself.",
      },
      {
        id: "3",
        title: "A - Antecedent (Before)",
        content: "Record what was happening before the incident. On Datix this maps to the Description field.\n\nEnter facts only, not opinions. Include:\n- Where the person was and what they were doing\n- Who else was present\n- What had just happened or been asked of them\n- Any environmental factors (noise, crowding, time of day)\n- The person's apparent mood or state beforehand\n\nExample:\n\"Dale was sitting in the lounge with peer Greg. They appeared to be chatting. Greg's family arrived to visit him, and Dale turned away from him.\"\n\nAlso consider slow triggers:\n- Changes in medication or routine\n- Poor sleep the night before\n- Family visit (or cancelled visit)\n- Staffing changes\n- Pain or physical discomfort",
        tip: "Stick to facts. 'Dale turned away' is observable. 'Dale was jealous' is an interpretation. Record what you saw and heard, not what you think it meant.",
      },
      {
        id: "4",
        title: "B - Behaviour (During)",
        content: "Record exactly what the person did. On Datix this maps to the Immediate Action field.\n\nBe specific and observable - avoid labels or judgements:\n\nGood: \"Dale turned away from Greg and crossed his arms. After a few minutes he got up and started banging on the lounge doors shouting 'it's not fair'\"\n\nNot helpful: \"Dale kicked off\" or \"Dale was aggressive\"\n\nInclude:\n- What the person said (use their actual words)\n- What they physically did, step by step\n- How long the behaviour lasted\n- The intensity (volume, force)\n- Whether it escalated or de-escalated\n- Whether anyone else was affected",
        tip: "Write it so someone who wasn't there can picture exactly what happened. If this ends up as evidence at panel or in court, precision matters.",
      },
      {
        id: "5",
        title: "C - Consequence (After)",
        content: "Record what happened after the behaviour. On Datix this maps to the Contributing Factors field.\n\nInclude:\n- How staff responded and what approach was used\n- De-escalation techniques tried\n- Whether PRN medication was offered or given\n- How the person reacted to the response\n- What the outcome was\n\nExample:\n\"Staff member RN Bean calmly approached Dale and asked if he could help. RN Bean spoke softly and asked if something had upset him. He then made him a cup of tea and sat calmly talking about the Wimbledon final. Dale appeared to relax and spoke about the tennis. He appeared to appreciate the company.\"\n\nAsk yourself: did the behaviour result in the person gaining attention, escaping a task, accessing something they wanted, or sensory stimulation? This helps identify the function.",
        tip: "It's OK to add a reflective thought at the end - e.g. 'I wonder if Dale was feeling left out?' - but clearly separate observation from interpretation.",
      },
      {
        id: "6",
        title: "Functions of Behaviour (SEAT)",
        content: "When analysing ABC data, consider the four common functions of behaviour:\n\nS - Sensory: the behaviour feels good or provides sensory input (rocking, head-banging, skin-picking)\n\nE - Escape: the behaviour helps avoid or escape something unpleasant (a task, a person, a noisy environment)\n\nA - Attention: the behaviour gets a response from others (staff attention, peer reaction, 1:1 time)\n\nT - Tangible: the behaviour results in access to something desired (food, items, activities, a preferred location)\n\nA single behaviour can serve more than one function, and the function may differ depending on the context. Look across multiple ABC records for patterns - the same consequence following the same behaviour often points to the function.",
      },
      {
        id: "7",
        progressive: true,
        title: "The Datix to S1 Workflow",
        content: "How ABC charts get from Datix into the patient record:\n\n1. Complete the Datix as normal after an incident\n2. Ensure the Description, Immediate Action and Contributing Factors fields are completed with ABC-quality detail\n3. Ward leadership brings the Datix to handover and discusses with staff to ensure all contributing factors are documented\n4. Ward leadership converts the Datix into an ABC chart via the Datix system\n5. The ABC chart is attached to the patient record on the clinical system under Attached Documents\n\nWhat happens with this information:\n- Analysed by the team, looking for patterns\n- Formulating the underlying need that drives the behaviour\n- Meeting that need in other ways to reduce frequency and intensity\n- Trialling more helpful ways of responding\n- Used as evidence at panel for placement and funding decisions",
        tip: "If you're unsure about completing the ABC detail on Datix, raise it in group or individual supervision. Ward leadership can support you.",
      },
    ],
  },
};

export const DEFAULT_GUIDE: GuideData = {
  id: "default",
  title: "Guide",
  description: "Step-by-step guidance",
  steps: [
    {
      id: "1",
      title: "Introduction",
      content: "This guide will walk you through the process step by step.",
    },
    {
      id: "2",
      title: "Step 2",
      content: "Follow the instructions carefully.",
    },
    {
      id: "3",
      title: "Summary",
      content: "You have completed this guide. Remember to document your actions.",
    },
  ],
};

// Descriptive "Copy to the patient's notes" templates, one per how-to guide.
// [DATE] and [NURSE] are auto-filled by the guide viewer; the other [BRACKETS]
// are quick fill-ins the nurse completes. Written to describe the task actually
// done, not just "guide reviewed". No em dashes.
const GUIDE_CASE_NOTES: Record<string, string> = {
  "capacity-assessment":
    "Mental capacity assessment completed on [DATE] regarding [SPECIFIC DECISION]. Two-stage test applied: (1) impairment or disturbance of the mind or brain identified: [YES/NO - CAUSE]; (2) patient able to understand, retain, weigh up and communicate the decision: [YES/NO - DETAIL]. Conclusion: patient [HAS/LACKS] capacity for this decision. Where capacity lacking, a best-interests decision was made and recorded, least-restrictive option considered. Assessment by [NURSE].",
  "section-132":
    "Section 132 rights read to patient on [DATE] by [NURSE]. Detention under [SECTION] explained, including the reason for detention, right of appeal to the Tribunal and Hospital Managers, access to an IMHA, consent to treatment provisions and discharge arrangements. Patient's understanding: [FULLY UNDERSTOOD / PARTIALLY / DID NOT UNDERSTAND - REASON]. Rights leaflet provided. To be re-read if not understood, on request, or if status changes.",
  "section-17":
    "Section 17 leave taken on [DATE]. Leave type: [ESCORTED / UNESCORTED, GROUNDS / COMMUNITY]. Authorised by the RC on the current S17 form. Agreed times: [OUT / EXPECTED BACK]. Conditions and risk reviewed and explained to patient beforehand. Patient departed [TIME], returned [TIME]. Presentation and any incidents on return: [DETAILS]. Recorded by [NURSE].",
  "news2":
    "NEWS2 physical observations recorded on [DATE] at [TIME]. Aggregate score [SCORE] (RR [ ], SpO2 [ ], O2 [ ], BP [ ], HR [ ], consciousness [ ], temp [ ]). Trigger: [LOW / LOW-MEDIUM / MEDIUM / HIGH]. Action taken: [CONTINUE ROUTINE MONITORING / INCREASED FREQUENCY / ESCALATED TO - WHO AND WHEN]. Recorded by [NURSE].",
  "fridge-temps":
    "Medication fridge temperature checked on [DATE] at [TIME]. Current [ ]C, minimum [ ]C, maximum [ ]C (acceptable range 2-8C). Reading: [IN RANGE / OUT OF RANGE - ACTION TAKEN AND PHARMACY INFORMED]. Min/max reset after reading. Logged on the Assurance Dashboard by [NURSE].",
  "abc-chart":
    "ABC chart completed on [DATE] for behaviour observed at [TIME]. Antecedent (what was happening before): [DETAILS]. Behaviour (objective description): [DETAILS]. Consequence (what happened after, including staff response): [DETAILS]. Possible function or pattern: [DETAILS]. Shared with the MDT and reflected in the PBS / care plan. Recorded by [NURSE].",
  "awol":
    "Patient absent from the ward identified on [DATE] at [TIME]. Status: [ABSENT WITHOUT LEAVE (detained) / MISSING (informal)]. Legal status: [SECTION / INFORMAL]. Ward and grounds searched immediately. Actions: nurse in charge informed, [RC / DUTY DOCTOR / FAMILY / POLICE via 101 or 999 - REFERENCE], risk level [DETAILS]. RCRP threshold considered. Recorded by [NURSE]. (Add update note on return or when located.)",
  "dama":
    "Patient expressed a wish to self-discharge against medical advice on [DATE] at [TIME]. Legal status: [INFORMAL - free to leave / DETAINED - holding power under s5(2)/s5(4) considered]. Capacity for the decision: [ASSESSED - OUTCOME]. Risks discussed with patient: [DETAILS]. Nurse in charge, RC and duty doctor informed: [WHO]. Outcome: [REMAINED ON WARD / LEFT AT (TIME)]. DAMA form completed and safety-netting given. Recorded by [NURSE].",
  "transfer-in":
    "Patient accepted back to the ward on [DATE] from [GENERAL WARD / HOSPITAL] following physical health treatment for [REASON]. Handover received from [WHO]. On return: NEWS2 [SCORE], medications reconciled, wounds / lines / devices [DETAILS], mobility [LEVEL], outstanding investigations or follow-up [DETAILS], VTE and pressure care reviewed. MHA status [SECTION]. Room/bed [ ]. Received by [NURSE].",
  "tribunal-report":
    "Mental Health Tribunal nursing report prepared on [DATE] for the hearing on [HEARING DATE]. Covers presentation and engagement on the ward, risk, use of leave, progress against the care plan and discharge planning. Submitted to [MHA OFFICE / TRIBUNAL] on [DATE]. Nurse attending the hearing: [NAME]. Prepared by [NURSE].",
  "arrange-mha-assessment":
    "MHA assessment requested on [DATE] following medical review. Reason: [PRESENTATION / RISK]. [DERBY CITY / DERBYSHIRE COUNTY] AMHP service contacted via [PHONE / EMAIL]. Doctors arranged: [SECTION 12 DOCTOR / GP / RC]. Nearest relative and AMHP duties considered. Status: awaiting assessment. Arranged by [NURSE].",
  "section-136":
    "Person received under Section 136 at the health-based place of safety on [DATE] at [TIME], brought in by police (reference [IF GIVEN]). 24-hour assessment clock started at [TIME] (extendable once by 12 hours). MHA assessment arranged with [AMHP / SECTION 12 DOCTOR]. Physical and mental state on arrival: [DETAILS]. Any medical concerns escalated. Recorded by [NURSE].",
  "safeguarding-adults-referral":
    "Adult safeguarding concern raised on [DATE] under s.42 of the Care Act 2014. Person at risk: [PATIENT]. Nature of concern: [TYPE OF ABUSE OR NEGLECT AND DETAIL]. Referred to [DERBY CITY / DERBYSHIRE COUNTY] Adult Social Care via [PHONE / EMAIL]. Consent: [OBTAINED / OVERRIDDEN - PUBLIC INTEREST OR LACK OF CAPACITY]. Immediate safety actions: [DETAILS]. Reference: [IF GIVEN]. Raised by [NURSE].",
  "safeguarding-children-referral":
    "Child safeguarding concern raised on [DATE]. Child: [NAME / DOB / RELATIONSHIP TO PATIENT]. Nature of concern: [DETAILS]. Referred to [DERBY CITY / DERBYSHIRE COUNTY] Starting Point / Children's MASH via [PHONE / EMAIL]. Think Family applied. Parental awareness: [WAS / WAS NOT INFORMED - REASON]. Reference: [IF GIVEN]. Raised by [NURSE].",
  "peer-conflict-guide":
    "Peer-on-peer incident on [DATE] at [TIME] involving [PATIENT] and [OTHER PARTY - INITIALS]. What happened: [DESCRIPTION]. Harm or impact: [DETAILS]. Immediate action: [SEPARATION / SUPPORT / MEDICAL REVIEW]. Escalation: [LEVEL / SAFEGUARDING REFERRAL - REFERENCE]. Incident (Datix) form completed. Recorded by [NURSE].",
  "domestic-abuse-guide":
    "Domestic abuse concern identified on [DATE] regarding [PATIENT]. Indicators or disclosure: [DETAILS]. Enquiry made with professional curiosity; risk (DASH) considered: [OUTCOME]. Immediate safety planning: [DETAILS]. Onward action: [MARAC / SAFEGUARDING / IDVA REFERRAL - REFERENCE]. Consent: [OBTAINED / OVERRIDDEN]. Recorded by [NURSE].",
  "non-recent-abuse":
    "Disclosure of non-recent (historical) abuse made by patient on [DATE]. Response: listened, did not investigate or ask leading questions, reassured. Any current risk to the patient or to children or adults now: [DETAILS]. Onward action: [SAFEGUARDING REFERRAL / POLICE IF CURRENT RISK - REFERENCE]. Patient's wishes: [DETAILS]. Emotional support offered: [DETAILS]. Recorded by [NURSE].",
  "honour-based-abuse":
    "Concern regarding honour-based abuse, FGM or forced marriage identified on [DATE] for [PATIENT / FAMILY MEMBER]. Indicators: [DETAILS]. One-chance rule considered; not discussed with family. Discussed with safeguarding lead. Action: [SAFEGUARDING REFERRAL / POLICE / FORCED MARRIAGE UNIT - REFERENCE]. Recorded by [NURSE].",
  "modern-slavery-radicalisation":
    "Concern regarding [MODERN SLAVERY / RADICALISATION] identified on [DATE] for [PATIENT]. Indicators: [DETAILS]. Discussed with safeguarding / Prevent lead. Action: [NATIONAL REFERRAL MECHANISM / PREVENT REFERRAL / SAFEGUARDING - REFERENCE]. Recorded by [NURSE].",
  "faith-belief-abuse":
    "Concern regarding abuse linked to faith or belief identified on [DATE] for [PATIENT / CHILD]. Indicators: [DETAILS]. Discussed with safeguarding lead. Action: [SAFEGUARDING REFERRAL - REFERENCE]. Recorded by [NURSE].",
  "send-safeguarding":
    "Safeguarding consideration for a child or young person with SEND on [DATE]. Child: [NAME / DOB]. Additional vulnerability and communication needs: [DETAILS]. Reasonable adjustments made: [DETAILS]. Action: [SAFEGUARDING REFERRAL / MDT - REFERENCE]. Recorded by [NURSE].",
  "child-in-need":
    "Child in Need (s.17 Children Act 1989) consideration on [DATE]. Child: [NAME / DOB]. Needs identified: [DETAILS]. Onward action: [REFERRAL TO CHILDREN'S SOCIAL CARE / MULTI-AGENCY PLAN - REFERENCE]. Think Family applied. Recorded by [NURSE].",
  "special-guardianship":
    "Special Guardianship considered or discussed on [DATE] regarding [CHILD]. Context: [DETAILS]. Onward action: [CHILDREN'S SOCIAL CARE / LEGAL - REFERENCE]. Recorded by [NURSE].",
  "information-sharing":
    "Information-sharing decision recorded on [DATE] regarding [PATIENT]. Information shared: [WHAT] with [WHO] for [PURPOSE]. Basis: [CONSENT / SAFEGUARDING / VITAL INTERESTS - seven golden rules applied]. Sharing judged necessary and proportionate. Recorded by [NURSE].",
  "online-safety-children":
    "Online safety concern regarding a child identified on [DATE]. Nature: [NUDES / CYBERBULLYING / SEXTORTION / GROOMING]. Child: [NAME / DOB]. Action: [SAFEGUARDING REFERRAL / POLICE / CEOP REPORT - REFERENCE]. Evidence preserved as advised. Recorded by [NURSE].",
  "escalation-pathway":
    "Safeguarding escalation (children) on [DATE] for [CHILD]. Level: [BRONZE / SILVER / GOLD]. Reason for escalation: [DETAILS]. Escalated to: [WHO]. Outcome or plan: [DETAILS]. Recorded by [NURSE].",
  "mha-statuses":
    "Patient's Mental Health Act status discussed and explained on [DATE]. Current status: [SECTION / INFORMAL]. Key points covered with patient: reason for status, rights, appeal routes and discharge provisions (formal s.132 rights recorded separately where detained). Patient's understanding: [DETAILS]. Recorded by [NURSE].",
};

for (const [id, note] of Object.entries(GUIDE_CASE_NOTES)) {
  if (GUIDES[id]) GUIDES[id].caseNote = note;
}
