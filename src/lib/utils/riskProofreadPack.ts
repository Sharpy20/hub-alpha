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
import {
  RISK_DOMAINS, CLINICAL_INDICATORS, SUBTYPE_RISK, SCREEN_TAIL,
  FORMULATION_SUMMARY_TITLE, FORMULATION_SUMMARY_NOTE, FORMULATION_NOT_COMPLETED,
} from "@/lib/data/welcome/risk-screen";
import { questionsForDomain } from "@/lib/data/guides/risk-questions";
import {
  WHAT_IS_THE_RISK, INCOMPLETE_OPTIONS,
  UNIVERSAL_IMMEDIATE, UNIVERSAL_PREVENTION, UNIVERSAL_REDUCTION_SIGNS, UNIVERSAL_ESCALATION,
} from "@/lib/data/guides/rmp-chips";
import {
  RMP_SECTIONS, MANDATORY_MDT_LINE,
  RMP_RISK_CHIPS, RISK_TYPES,
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
  parts.push(`<p class="lead">The SystmOne screen asks nothing beyond a/b/c per domain. The six questions below were written for wardHub, and they build one thing: the Risk Management Plan the trust mandates within 24 hours of admission. Each one feeds a named heading of that plan.</p>`);
  parts.push(`<div class="note">
    <p style="margin:0 0 2mm"><strong>This used to be thirteen questions, and seven of them are gone.</strong> Six built the plan; the other seven built the SystmOne Risk Formulation field, for which the trust publishes no template at all - so wardHub had invented a formulation framework and was asking staff to fill it in. It was slow, the output read as repetitive, and the tool was effectively proposing causes, triggers, protective factors and an overall judgement of the risk.</p>
    <p style="margin:0"><strong>The Risk Formulation field is now assembled, not asked.</strong> It lists one bullet per domain naming the sub-domains the nurse ticked, or that domain's own "no evidence" wording - see Part 6. It draws on nothing else: not the clinical indicators, not the narratives, not the dated events, not the plan. Every word in it is either the trust's own wording or a sub-domain the nurse selected. That is a transcription of their choices rather than an interpretation of the patient.</p>
  </div>`);

  for (const dm of RISK_DOMAINS) {
    parts.push(`<h3>${dm.number}. ${esc(dm.title)}</h3>`);
    for (const q of questionsForDomain(dm.id)) {
      parts.push(`<div class="q">
        <p style="margin:0"><strong>${q.n}. ${esc(q.question)}</strong></p>
        <p class="hint" style="margin:0">${esc(q.hint)}</p>
        ${q.gap ? `<p class="gap" style="margin:0">Gap prompt: ${esc(q.gap)}</p>` : ""}
        <p class="hint" style="margin:0">Goes to: ${esc(q.populates)} (Management Plan)</p>
        ${q.incomplete ? `<p class="hint" style="margin:0">If it cannot be established: "${esc(q.incomplete)}"</p>` : ""}
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
  parts.push(`<div class="note">
    <p style="margin:0 0 2mm"><strong>Two deliberate decisions to check, not oversights.</strong></p>
    <p style="margin:0 0 2mm"><strong>The overall risk judgement has no per-risk words.</strong> Its only chips are the short and medium term severity labels the clinician picks for themselves. Writing risk-specific versions would mean the tool suggesting a risk <em>level</em> for a named risk. The tool offers vocabulary; it does not rate or stratify risk, and that is what keeps it a drafting aid.</p>
    <p style="margin:0"><strong>Three different meetings appear below and must not be merged.</strong> An <strong>MDT review</strong> is the trust's mandatory closing line on every plan. A <strong>risk strategy meeting</strong> is the trust's own risk process, and can be called either while managing an incident or as escalation. A <strong>safeguarding strategy meeting</strong> is the statutory discussion for children, and appears only in the domain 6 banks.</p>
  </div>`);

  parts.push(`<div class="note">
    <p style="margin:0"><strong>Three tiers, and the order matters.</strong> Words that the ticked sub-domains and clinical indicators point at are offered first. The general library below that is folded away behind a "show all options" toggle. Nothing is ever pre-ticked, and a ticked clinical indicator is <em>offered</em> as a suggestion - it never writes itself into a plan, because an indicator records why the domain was considered relevant, not what is true of this person.</p>
  </div>`);

  parts.push(`<h3>Question 1 - which specific outcome are you trying to prevent?</h3>`);
  parts.push(`<p class="lead">Keyed to the sub-domain the nurse ticked, so the outcome named is the one they actually selected. Domains 1 and 2 are Mike's own wording; <strong>domains 3 to 7 were drafted by Claude and have not been through him</strong>. None of these carry a likelihood, a severity or a risk level.</p>`);
  for (const dm of RISK_DOMAINS) {
    parts.push(`<h4>${dm.number}. ${esc(dm.title)}</h4>`);
    for (const s of dm.subtypes) {
      const bank = WHAT_IS_THE_RISK[`${dm.id}::${s}`];
      parts.push(`<p style="margin:0 0 1mm"><strong>${esc(s)}</strong></p>`);
      parts.push(bank ? chipList([{ words: bank }]) : `<p class="missing">no bank - falls back to the generic list</p>`);
    }
  }
  parts.push(signoff("Question 1 outcomes - is each one the right thing to be preventing, and is the wording safe?"));

  parts.push(`<h3>The general library (questions 3 to 6)</h3>`);
  parts.push(`<p class="lead">Shown on every domain behind the "show all options" toggle. Question 2 deliberately has no general library: a generic list of what a risk looks like was exactly the fault this rebuild fixed.</p>`);
  parts.push(`<h4>3. What should staff do when the risk is present or increasing?</h4>${chipList([{ words: UNIVERSAL_IMMEDIATE }])}`);
  parts.push(`<h4>4. What can staff and the patient do to reduce the likelihood?</h4>${chipList([{ words: UNIVERSAL_PREVENTION }])}`);
  parts.push(`<h4>5. What observable changes would show the plan is working?</h4>${chipList([{ words: UNIVERSAL_REDUCTION_SIGNS }])}`);
  parts.push(`<h4>6. What further action, and when should the plan be escalated?</h4>${chipList([{ words: UNIVERSAL_ESCALATION }])}`);
  parts.push(signoff("The general library - safe and appropriate on any domain?"));

  parts.push(`<h3>Recording a gap honestly</h3>`);
  parts.push(`<p class="lead">A section with nothing in it prints "This section has not yet been completed." The options below are different: the nurse chose them deliberately to record that the patient-specific detail is not established yet. Neither is reassurance, and neither should be read as "there is nothing to find".</p>`);
  parts.push(`<ul>${Object.entries(INCOMPLETE_OPTIONS).map(([, v]) => `<li>${esc(v)}</li>`).join("")}</ul>`);
  parts.push(signoff("The not-established options - do these read as gaps rather than findings?"));

  parts.push(`<h3>The tailored banks, per risk (questions 2 to 6)</h3>`);
  parts.push(`<p class="lead">Ticking a sub-domain pulls in the bank named for it in Part 4. These are the words offered first, before the general library.</p>`);
  for (const risk of RISK_TYPES) {
    const r = RMP_RISK_CHIPS[risk];
    if (!r) continue;
    parts.push(`<h4>${esc(risk)}</h4>`);
    for (const sec of RMP_SECTIONS) {
      const g = r[sec.id as keyof typeof r];
      if (g) parts.push(`<p style="margin:0 0 1mm"><strong>${esc(sec.heading)}</strong></p>${chipList(g)}`);
    }
    parts.push(`<hr class="rule">`);
  }
  parts.push(signoff("Risk-specific suggestion words - anything wrong, unsafe or missing?"));

  // ---- Part 6: output templates ------------------------------------------
  parts.push(`<h2>Part 6. What comes out ${WH}</h2>`);
  parts.push(`<h3>The Risk Formulation field (field 9)</h3>`);
  parts.push(`<p class="lead">Assembled, not asked. One bullet per domain, always all seven, in SystmOne order. A domain with sub-domains ticked lists them; a domain confirmed nil carries its own exact "No evidence ..." wording from the form; a domain neither worked nor confirmed reads "${esc(FORMULATION_NOT_COMPLETED)}" so a gap cannot pass for a negative finding.</p>`);
  parts.push(`<pre>${esc(FORMULATION_SUMMARY_TITLE)}

- Risk of self harm or suicide: Current thoughts of self-harm; Currently experiencing high levels of distress and/or hopelessness.
- Risk to self, including self-neglect: Associated with Activities of Daily Living (ADL's).
- Risk of harm or neglect to others: No evidence of risk of harm or neglect to others reported during assessment.
- ... one line for each of the seven domains ...</pre>`);
  parts.push(`<p>On screen it carries this note: "${esc(FORMULATION_SUMMARY_NOTE)}" It is editable, and regenerating it warns first that manual edits will be lost.</p>`);
  parts.push(`<div class="note"><p style="margin:0">This is a <strong>summary of which risk types were identified</strong>, not a psychological formulation and not a predictive judgement - which is why the heading says SUMMARY. It is the one place the tool assembles text without the nurse selecting each part, and it can do that safely precisely because every word in it is either the trust's own wording or a sub-domain the nurse ticked.</p></div>`);
  parts.push(`<h3>Management plan headings, in order</h3><ul>${RMP_SECTIONS.map((s) => `<li><strong>${esc(s.heading)}</strong> - ${esc(s.hint)}</li>`).join("")}</ul>`);
  parts.push(`<h3>Mandatory closing line, added to every plan</h3><p>${esc(MANDATORY_MDT_LINE)}</p>`);
  parts.push(`<h3>Two things print differently from how they are asked</h3>
    <p><strong>HOW TO PREVENT / REDUCE holds two answers.</strong> The trust guide lists managing the risk when it occurs and preventing it as separate content requirements, under this one heading. They are asked as two questions and print as two labelled lines:</p>
    <pre>HOW TO PREVENT / REDUCE
When it happens: ...
To prevent or reduce: ...</pre>
    <p><strong>The plan is named after the risks that were ticked</strong>, not the SystmOne domain, because the guide's own examples name the risk itself ("self harm / risk to others / violence and aggression"). So a plan heads <em>VIOLENCE AND AGGRESSION, DAMAGE TO PROPERTY</em> rather than <em>Risk of harm or neglect to others</em>.</p>`);
  parts.push(`<h3>An empty section and an unestablished one are not the same</h3>`);
  parts.push(`<p class="lead">A section nobody answered prints "This section has not yet been completed." A section where the nurse deliberately chose one of the not-established options prints their choice. Both are visible gaps for review; neither is filled with generic text to make the plan look finished.</p>`);
  parts.push(signoff("Output structure, the formulation summary and the mandatory line - correct?"));

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
