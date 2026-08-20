// The risk tool's proofreading pack.
//
// Everything the risk tool says, in one printable document, so it can actually be
// signed off. It renders from the SAME data the tool uses, so it can never drift
// out of date - change a question or a chip and the pack changes with it.
//
// The whole point is the provenance split:
//   TRUST   - transcribed from the SystmOne WAA Inpatient Risk Screening Tool.
//             Checking it means checking the transcription, word for word.
//   WARDHUB - written for wardHub. Nobody has approved it. This is the part that
//             needs a clinician's judgement, not just proofreading.

import { printHtml, esc, IG_FOOTER } from "./printDoc";
import { RISK_DOMAINS, CLINICAL_INDICATORS, SUBTYPE_RISK, SCREEN_TAIL } from "@/lib/data/welcome/risk-screen";
import { questionsForDomain } from "@/lib/data/guides/risk-questions";
import {
  FORMULATION_SECTIONS, RMP_SECTIONS, MANDATORY_MDT_LINE,
  RMP_RISK_CHIPS, FORMULATION_RISK_CHIPS, RISK_TYPES,
  RISK_TEACHING, RISK_EXAMPLES,
  type RiskChipGroup,
} from "@/lib/data/guides/risk";

const CSS = `
  h3{color:#425563;font-size:11pt;margin:4mm 0 1mm;break-after:avoid;}
  h4{color:#212B32;font-size:10pt;margin:3mm 0 1mm;break-after:avoid;}
  ul{margin:0 0 2mm;padding-left:6mm;}
  li{margin:0 0 0.8mm;}
  .badge{display:inline-block;font-size:7.5pt;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;padding:0.5mm 1.5mm;border-radius:2mm;vertical-align:middle;}
  .trust{background:#E8EDEE;color:#003087;border:1px solid #768692;}
  .wh{background:#F3E8FF;color:#330072;border:1px solid #330072;}
  .lead{font-size:9.5pt;color:#425563;margin:0 0 3mm;}
  .q{margin:0 0 2mm;padding-left:4mm;border-left:2px solid #E8EDEE;}
  .q .hint{font-size:9pt;color:#425563;}
  .chips{font-size:9.5pt;color:#212B32;margin:0 0 1.5mm;}
  .signoff{border:1.5px solid #768692;border-radius:2mm;padding:2mm 3mm;margin:3mm 0 5mm;font-size:9.5pt;break-inside:avoid;}
  .signoff .row{margin-bottom:1.5mm;}
  .box{display:inline-block;width:4mm;height:4mm;border:1.5px solid #425563;vertical-align:middle;margin-right:1.5mm;}
  .rule{border:0;border-top:1px solid #E8EDEE;margin:2mm 0;}
  .note{background:#FFF8E1;border-left:3px solid #FFB81C;padding:2mm 3mm;font-size:9.5pt;margin:0 0 4mm;}
  .gap{font-size:9pt;color:#425563;font-style:italic;}
  table{border-collapse:collapse;width:100%;font-size:9.5pt;margin:0 0 3mm;}
  td,th{border:1px solid #E8EDEE;padding:1mm 2mm;text-align:left;vertical-align:top;}
  th{background:#E8EDEE;color:#003087;}
  .missing{color:#DA291C;font-weight:bold;}
  h2{break-before:auto;}
`;

const TRUST = `<span class="badge trust">Trust form</span>`;
const WH = `<span class="badge wh">wardHub</span>`;

const signoff = (what: string) => `
  <div class="signoff">
    <div class="row"><strong>${esc(what)}</strong></div>
    <div class="row"><span class="box"></span>Approved as it stands &nbsp;&nbsp; <span class="box"></span>Change needed (write below) &nbsp;&nbsp; <span class="box"></span>Not my call</div>
    <div class="row">Notes: ______________________________________________________________________</div>
    <div class="row">_____________________________________________________________________________</div>
  </div>`;

const chipList = (groups: RiskChipGroup[] | undefined): string => {
  if (!groups || !groups.length) return `<p class="chips missing">No chips - falls back to the generic bank.</p>`;
  return groups.map((g) =>
    `<p class="chips">${g.label ? `<em>${esc(g.label)}:</em> ` : ""}${esc(g.words.join(" &middot; ")).replace(/&amp;middot;/g, "&middot;")}</p>`
  ).join("");
};

export function printRiskProofreadPack() {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const parts: string[] = [];

  parts.push(`<h1>Risk tool - proofreading pack</h1>`);
  parts.push(`<p class="meta">wardHub &middot; /guides/risk-assessment &middot; printed ${esc(today)}</p>`);
  parts.push(`<div class="note">
    <p style="margin:0 0 2mm"><strong>Two different jobs in this pack.</strong></p>
    <p style="margin:0 0 2mm">${TRUST} means it was transcribed from the SystmOne risk screen. Checking it means checking the transcription word for word, including the form's own typos, which are kept deliberately.</p>
    <p style="margin:0">${WH} means wardHub wrote it and nobody has approved it. That needs clinical judgement, not proofreading. The guide stays RED until this half is signed off.</p>
  </div>`);

  // ---- Part 1: the form itself -------------------------------------------
  parts.push(`<h2>Part 1. The risk screen, domain by domain ${TRUST}</h2>`);
  parts.push(`<p class="lead">Every line below should match the SystmOne screen exactly. Mark anything that does not.</p>`);

  for (const dm of RISK_DOMAINS) {
    parts.push(`<h3>${dm.number}. ${esc(dm.title)}</h3>`);
    parts.push(`<h4>Sub-domains (tick boxes)</h4><ul>${dm.subtypes.map((s) => `<li>${esc(s)}</li>`).join("")}<li>${esc(dm.noEvidence)}</li></ul>`);
    if (dm.safetyPrompt) parts.push(`<h4>${dm.number}a</h4><p>${esc(dm.safetyPrompt)} &nbsp; Yes / No</p>`);
    parts.push(`<h4>${dm.number}${dm.safetyPrompt ? "b" : "a"} - required</h4><p>${esc(dm.indicatorsPrompt)} &nbsp; Yes / No</p>`);
    const inds = CLINICAL_INDICATORS[dm.id] || [];
    parts.push(`<h4>Clinical indicators (${inds.length})</h4>`);
    parts.push(inds.length
      ? `<ul>${inds.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
      : `<p class="missing">No indicator list held for this domain.</p>`);
    parts.push(`<h4>Narrative - current concerns</h4><p>${esc(dm.currentPrompt)}</p>`);
    parts.push(`<h4>Narrative - historical</h4><p>${esc(dm.historicalPrompt)}</p>`);
    if (dm.historicalSubPrompts) parts.push(`<ul>${dm.historicalSubPrompts.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`);
    parts.push(signoff(`Domain ${dm.number} - is every line above word for word what SystmOne shows?`));
  }

  // ---- Part 2: the tail ---------------------------------------------------
  parts.push(`<h2>Part 2. Questions 8 and 9 ${TRUST}</h2>`);
  parts.push(`<ul>
    <li><strong>8.</strong> ${esc(SCREEN_TAIL.q8)} &nbsp; Yes / No</li>
    <li><strong>9.</strong> ${esc(SCREEN_TAIL.q9Label)} (free text - the tool's Formulation pastes here)</li>
    <li>${esc(SCREEN_TAIL.rmpGate)} &nbsp; Yes / No</li>
    <li>${esc(SCREEN_TAIL.rmpLabel)} (free text - the tool's Management Plans paste here)</li>
  </ul>`);
  parts.push(signoff("Questions 8 and 9 - wording and order correct?"));

  // ---- Part 3: wardHub's questions ---------------------------------------
  parts.push(`<h2>Part 3. The questions the tool asks ${WH}</h2>`);
  parts.push(`<p class="lead">The SystmOne screen asks nothing beyond a/b/c per domain. Everything here was written for wardHub to build a formulation and a management plan from one pass. Each question feeds one named output section - that mapping is shown so you can see where an answer ends up.</p>`);

  for (const dm of RISK_DOMAINS) {
    parts.push(`<h3>${dm.number}. ${esc(dm.title)}</h3>`);
    for (const q of questionsForDomain(dm.id)) {
      const dest = q.writes.doc === "f"
        ? FORMULATION_SECTIONS.find((s) => s.id === q.writes.id)?.heading
        : RMP_SECTIONS.find((s) => s.id === q.writes.id)?.heading;
      parts.push(`<div class="q">
        <p style="margin:0"><strong>${esc(q.question)}</strong></p>
        <p class="hint" style="margin:0">${esc(q.hint)}</p>
        ${q.gap ? `<p class="gap" style="margin:0">Gap prompt: ${esc(q.gap)}</p>` : ""}
        <p class="hint" style="margin:0">Goes to: ${esc(dest || q.writes.id)} (${q.writes.doc === "f" ? "Formulation" : "Management Plan"})</p>
      </div>`);
    }
    parts.push(signoff(`Domain ${dm.number} questions - do these fit this domain, and is anything missing?`));
  }

  // ---- Part 4: where each sub-domain gets its chips from -------------------
  parts.push(`<h2>Part 4. Which chip bank each sub-domain uses ${WH}</h2>`);
  parts.push(`<p class="lead">Ticking a sub-domain pulls in a bank of suggestion words. Sub-domains shown in red have no bank of their own and fall back to generic wording.</p>`);
  parts.push(`<table><tr><th>Domain</th><th>Sub-domain</th><th>Chip bank</th></tr>`);
  for (const dm of RISK_DOMAINS) {
    for (const s of dm.subtypes) {
      const mapped = SUBTYPE_RISK[`${dm.id}::${s}`];
      parts.push(`<tr><td>${dm.number}</td><td>${esc(s)}</td><td>${mapped ? esc(mapped) : `<span class="missing">none - generic</span>`}</td></tr>`);
    }
  }
  parts.push(`</table>`);
  parts.push(signoff("Sub-domain to chip-bank mapping - are these the right pairings, and which gaps matter?"));

  // ---- Part 5: the chip banks --------------------------------------------
  parts.push(`<h2>Part 5. The suggestion words ${WH}</h2>`);
  parts.push(`<p class="lead">None of this is trust wording. It is clinical vocabulary written to save typing, and it shows on screen with a purple ring so nobody mistakes it for the form. Strike out anything wrong or unsafe.</p>`);

  parts.push(`<h3>Generic banks (used when a risk has no tailored set)</h3>`);
  for (const sec of [...FORMULATION_SECTIONS, ...RMP_SECTIONS]) {
    if (!sec.groups.length) continue;
    parts.push(`<h4>${esc(sec.heading)}</h4>${chipList(sec.groups)}`);
  }
  parts.push(signoff("Generic suggestion words - safe and appropriate?"));

  for (const risk of RISK_TYPES) {
    parts.push(`<h3>${esc(risk)}</h3>`);
    const f = FORMULATION_RISK_CHIPS[risk];
    const r = RMP_RISK_CHIPS[risk];
    for (const sec of FORMULATION_SECTIONS) {
      const g = f?.[sec.id as keyof typeof f];
      if (g) parts.push(`<h4>Formulation - ${esc(sec.heading)}</h4>${chipList(g)}`);
    }
    for (const sec of RMP_SECTIONS) {
      const g = r?.[sec.id as keyof typeof r];
      if (g) parts.push(`<h4>Plan - ${esc(sec.heading)}</h4>${chipList(g)}`);
    }
    parts.push(`<hr class="rule">`);
  }
  parts.push(signoff("Risk-specific suggestion words - anything wrong, unsafe or missing?"));

  // ---- Part 6: output templates ------------------------------------------
  parts.push(`<h2>Part 6. What comes out ${WH}</h2>`);
  parts.push(`<h3>Formulation headings, in order</h3><ul>${FORMULATION_SECTIONS.map((s) => `<li><strong>${esc(s.heading)}</strong> - ${esc(s.hint)}</li>`).join("")}</ul>`);
  parts.push(`<h3>Management plan headings, in order</h3><ul>${RMP_SECTIONS.map((s) => `<li><strong>${esc(s.heading)}</strong> - ${esc(s.hint)}</li>`).join("")}</ul>`);
  parts.push(`<h3>Mandatory closing line, added to every plan</h3><p>${esc(MANDATORY_MDT_LINE)}</p>`);
  parts.push(`<p class="lead">An unanswered section prints as "Not yet established." rather than being left blank, per the trust care planning guidance.</p>`);
  parts.push(signoff("Output structure and the mandatory line - correct?"));

  // ---- Part 7: teaching ---------------------------------------------------
  parts.push(`<h2>Part 7. The teaching content ${WH}</h2>`);
  for (const blk of [RISK_TEACHING.formulationVsPlan, RISK_TEACHING.ideationVsAction, RISK_TEACHING.commonMistakes, RISK_TEACHING.whatGoodLooks, RISK_TEACHING.gapMethod]) {
    parts.push(`<h3>${esc(blk.title)}</h3><ul>${blk.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`);
  }
  parts.push(`<h3>Weak vs strong examples (${RISK_EXAMPLES.length} held)</h3>`);
  for (const ex of RISK_EXAMPLES) {
    parts.push(`<h4>${esc(ex.risk)}</h4>`);
    parts.push(`<p><strong>${esc(ex.weak.label)}</strong></p><p>Formulation: ${esc(ex.weak.formulation)}</p><pre>${esc(ex.weak.rmp)}</pre>`);
    parts.push(`<p><strong>${esc(ex.strong.label)}</strong></p><p>Formulation: ${esc(ex.strong.formulation)}</p><pre>${esc(ex.strong.rmp)}</pre>`);
  }
  parts.push(signoff("Teaching content and examples - accurate and safe to publish?"));

  parts.push(`<h2>Sign-off</h2>`);
  parts.push(`<div class="signoff">
    <div class="row">Reviewed by: _________________________________  Role: _____________________</div>
    <div class="row">Date: ______________  Signature: _________________________________</div>
    <div class="row" style="margin-top:2mm"><span class="box"></span>Trust-transcribed content confirmed accurate</div>
    <div class="row"><span class="box"></span>wardHub-authored content approved for use</div>
    <div class="row"><span class="box"></span>Ready to move off RED</div>
  </div>`);

  printHtml("Risk tool - proofreading pack", CSS, parts.join("\n") + IG_FOOTER);
}
