// Shared "print this plan" for the clinical builders (MSE, care plan, risk/RMP).
// Renders the assembled output in a hidden iframe with its own clean, NHS-styled
// stylesheet, then prints just that iframe. Using an iframe (not window.open)
// avoids pop-up blockers and keeps the app's global print CSS out of the way.

interface PrintSection {
  heading?: string;
  text: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function printClinicalDoc(opts: { title: string; sections: PrintSection[] }) {
  const { title, sections } = opts;
  const body = sections
    .filter((s) => s.text && s.text.trim())
    .map((s) => `${s.heading ? `<h2>${esc(s.heading)}</h2>` : ""}<pre>${esc(s.text)}</pre>`)
    .join("\n");

  if (!body) return;

  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body{font-family:Arial,"Source Sans 3",sans-serif;color:#212B32;line-height:1.45;font-size:11pt;margin:0;}
  h1{color:#003087;font-size:16pt;margin:0 0 2mm;}
  .meta{font-size:9pt;color:#425563;margin:0 0 6mm;}
  h2{color:#003087;font-size:12pt;margin:6mm 0 1.5mm;border-bottom:2px solid #E8EDEE;padding-bottom:1mm;break-after:avoid;}
  pre{font-family:inherit;white-space:pre-wrap;font-size:10.5pt;margin:0 0 3mm;}
  footer{margin-top:8mm;padding-top:3mm;border-top:2px solid #E8EDEE;font-size:8.5pt;color:#425563;}
  @page{size:A4;margin:14mm;}
</style></head><body>
  <h1>${esc(title)}</h1>
  <p class="meta">wardHub - printed from an interactive tool. A draft to work from, not a final record.</p>
  ${body}
  <footer><strong>Information governance:</strong> this printout may contain patient-identifiable information. Handle it in line with Trust policy - keep it secure, do not leave it unattended, and dispose of it in confidential waste. wardHub does not store what you entered.</footer>
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) { iframe.remove(); return; }
  doc.open();
  doc.write(html);
  doc.close();

  // Give the iframe a moment to lay out, then print just its document.
  window.setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => iframe.remove(), 1000);
  }, 250);
}
