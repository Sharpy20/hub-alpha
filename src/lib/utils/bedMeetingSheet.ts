// The bed-meeting sheet: one page you can carry into the meeting, print-only.
//
// Deliberately NOT "print the /overview screen". That screen has filters,
// counters, review stamps and job actions, none of which mean anything on
// paper. This is the subset a bed meeting actually reads out - who is blocked,
// how long for, and what by - ordered worst first so the conversation starts
// where it should.

import { printHtml, esc, IG_FOOTER } from "@/lib/utils/printDoc";
import { BARRIER_CATEGORIES } from "@/lib/data/barrier-categories";
import type { BarrierCategory } from "@/lib/data/barrier-categories";

export interface BedMeetingBarrier {
  title: string;
  category: BarrierCategory | undefined;
  ageDays: number;
  overdue: boolean;
}

export interface BedMeetingPatient {
  name: string;
  ward: string;
  blockedDays: number | null;
  barriers: BedMeetingBarrier[];
}

export function printBedMeetingSheet(opts: {
  scopeLabel: string;
  dateLabel: string;
  patients: BedMeetingPatient[];
  totals: { total: number; external: number; ward: number; uncategorised: number };
}) {
  const { scopeLabel, dateLabel, patients, totals } = opts;

  // Worst first: longest blocked at the top. A patient with no open barrier
  // should not be on this sheet at all - they are not what the meeting is for.
  const blocked = patients
    .filter((p) => p.barriers.length > 0)
    .sort((a, b) => (b.blockedDays ?? 0) - (a.blockedDays ?? 0));

  if (blocked.length === 0) {
    printHtml(
      "Bed meeting sheet",
      "",
      `<h1>Bed meeting sheet</h1><p class="meta">${esc(scopeLabel)} &middot; ${esc(dateLabel)}</p>
       <p>No open barriers to discharge in this view.</p>${IG_FOOTER}`
    );
    return;
  }

  const rows = blocked
    .map((p) => {
      const items = p.barriers
        .map((b) => {
          const meta = b.category ? BARRIER_CATEGORIES[b.category] : null;
          const tag = meta
            ? `<span class="tag" style="border-color:${meta.dot};color:${meta.dot}">${esc(meta.short)}</span>`
            : `<span class="tag tag-none">Not categorised</span>`;
          return `<li>${b.overdue ? '<span class="od">OVERDUE</span> ' : ""}${esc(b.title)} ${tag} <span class="age">${b.ageDays}d</span></li>`;
        })
        .join("");
      const days = p.blockedDays === null ? "" : `${p.blockedDays}`;
      return `<tr>
        <td class="pt"><strong>${esc(p.name)}</strong><br><span class="ward">${esc(p.ward)}</span></td>
        <td class="days">${days}<span class="dl">days</span></td>
        <td><ul class="barriers">${items}</ul></td>
      </tr>`;
    })
    .join("");

  const style = `
    table{width:100%;border-collapse:collapse;}
    th{text-align:left;font-size:8.5pt;text-transform:uppercase;letter-spacing:.04em;color:#425563;border-bottom:2px solid #E8EDEE;padding:0 0 1.5mm;}
    td{border-bottom:1px solid #E8EDEE;padding:2mm 0;vertical-align:top;}
    tr{break-inside:avoid;}
    .pt{width:38mm;}
    .ward{font-size:9pt;color:#425563;}
    .days{width:16mm;text-align:center;font-size:15pt;font-weight:bold;color:#003087;}
    .dl{display:block;font-size:7.5pt;font-weight:normal;color:#768692;}
    ul.barriers{margin:0;padding-left:4mm;}
    ul.barriers li{margin:0 0 1mm;font-size:10pt;}
    .tag{display:inline-block;border:1px solid;border-radius:2mm;padding:0 1.5mm;font-size:8pt;margin-left:1.5mm;}
    .tag-none{border-color:#768692;color:#768692;}
    .age{color:#768692;font-size:8.5pt;margin-left:1.5mm;}
    .od{background:#DA291C;color:#fff;font-size:7.5pt;padding:0 1mm;border-radius:1mm;}
    .summary{background:#E8EDEE;padding:3mm;border-radius:2mm;margin:0 0 4mm;font-size:10pt;}
    .summary strong{color:#003087;font-size:12pt;}
  `;

  const body = `
    <h1>Bed meeting - barriers to discharge</h1>
    <p class="meta">${esc(scopeLabel)} &middot; ${esc(dateLabel)}</p>
    <div class="summary">
      <strong>${totals.external} of ${totals.total}</strong> barriers waiting on someone outside the ward
      &middot; ${totals.ward} ours to shift${
        totals.uncategorised > 0 ? ` &middot; ${totals.uncategorised} not categorised` : ""
      }
      &middot; ${blocked.length} patient${blocked.length === 1 ? "" : "s"} blocked
    </div>
    <table>
      <thead><tr><th>Patient</th><th>Blocked</th><th>Barriers</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${IG_FOOTER}`;

  printHtml("Bed meeting sheet", style, body);
}
