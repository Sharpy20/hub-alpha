// Shared printing for the clinical tools. Everything renders in a hidden iframe
// with its own clean, NHS-styled stylesheet, then prints just that iframe. Using
// an iframe (not window.open) avoids pop-up blockers and keeps the app's global
// print CSS - which hides all <button>s and strips colour - out of the way.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Write `innerHtml` (a full <body> content) into a throwaway iframe and print it.
function printHtml(title: string, headExtra: string, innerHtml: string) {
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body{font-family:Arial,"Source Sans 3",sans-serif;color:#212B32;line-height:1.45;font-size:11pt;margin:0;}
  h1{color:#003087;font-size:16pt;margin:0 0 2mm;}
  .meta{font-size:9pt;color:#425563;margin:0 0 5mm;}
  h2{color:#003087;font-size:12pt;margin:6mm 0 1.5mm;border-bottom:2px solid #E8EDEE;padding-bottom:1mm;break-after:avoid;}
  pre{font-family:inherit;white-space:pre-wrap;font-size:10.5pt;margin:0 0 3mm;}
  footer{margin-top:8mm;padding-top:3mm;border-top:2px solid #E8EDEE;font-size:8.5pt;color:#425563;}
  @page{size:A4;margin:14mm;}
  ${headExtra}
</style></head><body>${innerHtml}</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) { iframe.remove(); return; }
  doc.open();
  doc.write(html);
  doc.close();

  window.setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => iframe.remove(), 1000);
  }, 250);
}

const IG_FOOTER =
  `<footer><strong>Information governance:</strong> this printout may contain patient-identifiable information. Handle it in line with Trust policy - keep it secure, do not leave it unattended, and dispose of it in confidential waste. wardHub does not store what you entered.</footer>`;

// ---- Free-text clinical documents (MSE, care plan, risk/RMP) ----

interface PrintSection {
  heading?: string;
  text: string;
}

export function printClinicalDoc(opts: { title: string; sections: PrintSection[] }) {
  const { title, sections } = opts;
  const body = sections
    .filter((s) => s.text && s.text.trim())
    .map((s) => `${s.heading ? `<h2>${esc(s.heading)}</h2>` : ""}<pre>${esc(s.text)}</pre>`)
    .join("\n");
  if (!body) return;
  printHtml(
    title,
    "",
    `<h1>${esc(title)}</h1><p class="meta">wardHub - printed from an interactive tool. A draft to work from, not a final record.</p>${body}${IG_FOOTER}`
  );
}

// ---- Tick-list checklists (admission, leave/discharge) ----

interface ChecklistPrintItem {
  text: string;
  done: boolean;
  note?: string;
  sub?: { text: string; done: boolean }[];
}
interface ChecklistPrintGroup {
  title: string;
  icon?: string;
  items: ChecklistPrintItem[];
}

const CHECKLIST_CSS = `
  ul.items{list-style:none;margin:0 0 4mm;padding:0;}
  ul.items>li{margin:0 0 2.2mm;padding:0;font-size:10.5pt;}
  ul.items ul{list-style:none;margin:1mm 0 1.5mm 22px;padding:0;}
  ul.items ul li{margin:0 0 1.2mm;font-size:9.5pt;}
  .box{display:inline-block;width:13px;height:13px;border:1.5px solid #333;border-radius:2px;margin-right:7px;text-align:center;line-height:12px;font-size:11px;font-weight:bold;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .done-txt{color:#666;text-decoration:line-through;}
  .note{color:#666;font-size:9pt;}
  section{break-inside:avoid;}
  .handover{margin-top:6mm;padding:3mm 0;border-top:1px dashed #99a;font-size:9.5pt;color:#333;}
  .handover span{display:inline-block;border-bottom:1px solid #333;min-width:120px;margin:0 4px;}`;

export function printChecklist(opts: {
  title: string;
  patientName?: string;
  progress?: string;
  groups: ChecklistPrintGroup[];
}) {
  const { title, patientName, progress, groups } = opts;
  const box = (done: boolean) => `<span class="box">${done ? "&#10003;" : ""}</span>`;

  const groupsHtml = groups
    .map((g) => {
      const items = g.items
        .map((it) => {
          const sub = it.sub && it.sub.length
            ? `<ul>${it.sub.map((s) => `<li>${box(s.done)}<span class="${s.done ? "done-txt" : ""}">${esc(s.text)}</span></li>`).join("")}</ul>`
            : "";
          const note = it.note ? `<span class="note"> - ${esc(it.note)}</span>` : "";
          return `<li>${box(it.done)}<span class="${it.done ? "done-txt" : ""}">${esc(it.text)}</span>${note}${sub}</li>`;
        })
        .join("");
      return `<section><h2>${g.icon ? esc(g.icon) + " " : ""}${esc(g.title)}</h2><ul class="items">${items}</ul></section>`;
    })
    .join("");

  let printedOn = "";
  try { printedOn = new Date().toLocaleDateString("en-GB"); } catch { /* ignore */ }

  const metaBits = [
    patientName ? `Patient: <strong>${esc(patientName)}</strong>` : "",
    progress ? esc(progress) : "",
    printedOn ? `printed ${printedOn}` : "",
  ].filter(Boolean).join(" &bull; ");

  const handover =
    `<div class="handover">Handed over by <span></span> to <span></span> at <span></span> (time/date). Tick the empty boxes as each outstanding item is completed.</div>`;

  printHtml(
    title,
    CHECKLIST_CSS,
    `<h1>${esc(title)}</h1><p class="meta">${metaBits} &bull; wardHub</p>${groupsHtml}${handover}${IG_FOOTER}`
  );
}
