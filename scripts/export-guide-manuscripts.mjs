// Guide manuscript export.
//
// Dumps every wardHub guide's content out of the TypeScript data files into one
// markdown file per guide. That folder is the upload set for the SharePoint
// "wardHub Guide Manuscripts" library, which becomes the authoring home going
// forward (BACKLOG Section K).
//
// Run:  node scripts/export-guide-manuscripts.mjs [outDir]
// Default outDir: E:\Hub\guide-manuscripts  (deliberately OUTSIDE the repo)
//
// The guide data is TypeScript, so this shells out to the repo's own tsc to
// transpile the data files to CommonJS in a temp dir, then requires them. No new
// dependencies. Pure data files only - nothing here imports React.

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.argv[2] || "E:\\Hub\\guide-manuscripts";
const tmpDir = path.join(os.tmpdir(), "wardhub-guide-export");

// ---------------------------------------------------------------------------
// 1. Transpile the guide data to plain JS
// ---------------------------------------------------------------------------

function compileData() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  const dataFiles = fs
    .readdirSync(path.join(repoRoot, "src/lib/data/guides"))
    .filter((f) => f.endsWith(".ts"))
    .map((f) => `src/lib/data/guides/${f}`);
  dataFiles.push("src/lib/data/approval-status.ts", "src/lib/data/patient-guides.ts");

  // Call tsc's JS entry point with node directly - avoids a shell, so this works
  // the same on Windows and POSIX.
  const tsc = path.join(repoRoot, "node_modules", "typescript", "bin", "tsc");
  execFileSync(
    process.execPath,
    [tsc, ...dataFiles, "--outDir", tmpDir, "--rootDir", "src", "--module", "commonjs",
     "--target", "es2020", "--skipLibCheck", "--esModuleInterop", "--moduleResolution", "node"],
    { cwd: repoRoot, stdio: "inherit" },
  );
}

// ---------------------------------------------------------------------------
// 2. Markdown helpers
// ---------------------------------------------------------------------------

const out = [];
const w = (s = "") => out.push(s);
const heading = (level, text) => w(`${"#".repeat(level)} ${text}\n`);
const para = (text) => { if (text) w(`${text}\n`); };
const bullets = (items, prefix = "-") => {
  if (!items || !items.length) return;
  items.forEach((i) => w(`${prefix} ${i}`));
  w();
};
const quoteBlock = (label, text) => {
  if (!text) return;
  w(`> **${label}**`);
  String(text).split("\n").forEach((line) => w(`> ${line}`));
  w();
};
const linkList = (label, links) => {
  if (!links || !links.length) return;
  w(`**${label}**\n`);
  links.forEach((l) => {
    const url = l.url && l.url !== "#" ? l.url : null;
    const bits = [];
    if (l.area) bits.push(`${l.area === "city" ? "Derby City" : "Derbyshire County"} only`);
    if (l.note) bits.push(l.note);
    if (l.requiresFocus) bits.push("FOCUS login needed");
    if (l.isForm) bits.push("blank form");
    if (!url) bits.push(l.url === "#" ? "LINK NOT YET WIRED" : "link to confirm");
    const suffix = bits.length ? ` - _${bits.join("; ")}_` : "";
    w(url ? `- [${l.label}](${url})${suffix}` : `- ${l.label}${suffix}`);
  });
  w();
};

// ---------------------------------------------------------------------------
// 3. Renderers - one per content shape
// ---------------------------------------------------------------------------

const STEP_TYPE_LABEL = {
  info: "Information", criteria: "Criteria check", consent: "Consent",
  section: "Legal status choice", area: "Area choice (City / County)",
  forms: "Forms and downloads", submission: "Where to send it",
  casenote: "Case note", reminder: "Diary reminder", gdpr: "Data protection",
};

function renderWorkflow(wf) {
  para(wf.description);
  wf.steps.forEach((step, i) => {
    heading(2, `${i + 1}. ${step.title}`);
    const label = STEP_TYPE_LABEL[step.type];
    if (label && step.type !== "info") para(`_Step type: ${label}._`);
    para(step.content);
    if (step.checkboxLabel) para(`- [ ] ${step.checkboxLabel}`);
    if (step.consentYesLabel) {
      w(`- **${step.consentYesLabel}** - ${step.consentYesDesc || ""}`.trimEnd());
      w(`- **${step.consentNoLabel}** - ${step.consentNoDesc || ""}`.trimEnd());
      w();
    }
    if (step.forms) {
      linkList("Blank forms", step.forms.blank);
      linkList("Worked examples (WAGOLL)", step.forms.wagoll);
      linkList("Other guides", step.forms.otherGuides);
    }
    if (step.methods) {
      w("**Submission routes**\n");
      step.methods.forEach((m) => {
        const area = m.area ? ` (${m.area === "city" ? "Derby City" : "Derbyshire County"})` : "";
        w(`- ${m.type}: **${m.label}**${area} - ${m.value}`);
      });
      w();
    }
    if (step.clipboardText) quoteBlock("Case note text (copied to the clipboard)", step.clipboardText);
    if (step.isDynamic) para("_This step's content is generated at runtime from the nurse's earlier choices._");
  });
}

function renderHowTo(g) {
  para(g.description);
  g.steps.forEach((step, i) => {
    heading(2, `${i + 1}. ${step.title}`);
    if (step.tldr) quoteBlock("In a hurry", step.tldr);
    para(step.content);
    if (step.tip) quoteBlock("Tip", step.tip);
    if (step.widget) para(`_Interactive widget in the app: \`${step.widget}\`._`);
  });
  if (g.caseNote) { heading(2, "Case note template"); quoteBlock("Copied to the clipboard", g.caseNote); }
  if (g.noCaseNote) para("_No case-note box on this guide (staff-life guide, never recorded against a patient)._");
  linkList("Printable forms", g.downloads);
  if (g.sources && g.sources.length) {
    heading(2, "References");
    g.sources.forEach((s) => w(s.url ? `${s.n}. [${s.label}](${s.url})` : `${s.n}. ${s.label}`));
    w();
  }
  if (g.related && g.related.length) {
    heading(2, "Related guides");
    g.related.forEach((r) => w(`- ${r.label} (\`${r.guideId}\`)`));
    w();
  }
}

function renderPromptGuide(c) {
  para(c.subtitle);
  para(c.intro);
  if (c.notice) quoteBlock("Notice shown on the page", c.notice);
  if (c.principles && c.principles.length) { heading(2, "Key principles"); bullets(c.principles); }
  c.sections.forEach((s, i) => {
    heading(2, `${i + 1}. ${s.heading}`);
    para(s.why);
    if (s.think && s.think.length) { w("**Prompt yourself**\n"); bullets(s.think); }
    if (s.examples && s.examples.length) {
      w("**Worked examples** (to spark thinking, not to copy)\n");
      bullets(s.examples);
    }
    if (s.tip) quoteBlock("Tip", s.tip);
    if (s.note) quoteBlock("Note", s.note);
  });
  if (c.footer) { heading(2, "Grounding"); para(c.footer); }
}

function renderChecklist(groups) {
  groups.forEach((g) => {
    heading(2, `${g.icon || ""} ${g.title}`.trim());
    g.items.forEach((item) => {
      w(`- [ ] ${item.text}${item.documentThis ? " _(document this)_" : ""}`);
      (item.subItems || []).forEach((s) => w(`  - ${s}`));
      if (item.note) w(`  - _Note: ${item.note}_`);
      (item.links || []).forEach((l) => {
        const bits = [];
        if (l.requiresFocus) bits.push("FOCUS login needed");
        if (l.isForm) bits.push("blank form");
        if (!l.url) bits.push("link to confirm");
        const suffix = bits.length ? ` _(${bits.join("; ")})_` : "";
        w(`  - Link: ${l.url ? `[${l.label}](${l.url})` : l.label}${suffix}`);
      });
    });
    w();
  });
}

function renderLdt(sections, pathways) {
  heading(2, "Pathways");
  pathways.forEach((p) => w(`- **${p.label}** - ${p.blurb}`));
  w();
  para("Each item below lists the pathways it applies to. The app shows only the items for the selected pathway.");
  sections.forEach((s) => {
    heading(2, `${s.icon || ""} ${s.title}`.trim());
    s.items.forEach((item) => {
      w(`- [ ] ${item.label} _(${item.pathways.join(", ")})_${item.highRisk ? " **SAFETY-CRITICAL**" : ""}`);
      if (item.guidance) w(`  - ${item.guidance}`);
      if (item.guideLink) w(`  - See: ${item.guideLink.label} (\`${item.guideLink.guideId}\`)`);
    });
    w();
  });
}

function renderMhaChecker(pathways, scrutiny, rectifyNote) {
  para("Interactive checker. The nurse picks a pathway; the app shows the statutory forms required. A requirement can be satisfied by any ONE of the listed option sets - within a set, every form is needed.");
  if (rectifyNote) quoteBlock("Rectifiable errors", rectifyNote);

  const form = (f) => `${f.code} - ${f.name} (completed by ${f.who})${f.url ? ` - [blank form](${f.url})` : ""}`;

  heading(2, "Pathways");
  pathways.forEach((p) => {
    heading(3, `${p.icon || ""} ${p.label}`.trim());
    para(p.detail);
    if (p.verify) para("_Not taken from the trust document - shown with a 'confirm' hint in the app._");
    (p.requirements || []).forEach((req) => {
      w(`**${req.label}**`);
      if (req.note) w(`_${req.note}_`);
      (req.options || []).forEach((set, i) => {
        if ((req.options || []).length > 1) w(`- _Option ${i + 1}:_`);
        set.forEach((f) => w(`${(req.options || []).length > 1 ? "  " : ""}- ${form(f)}`));
      });
      w();
    });
    if (p.nurseCompletes) { w(`**The receiving nurse completes**\n`); w(`- ${form(p.nurseCompletes)}\n`); }
    if (p.notes && p.notes.length) { w("**Remember**\n"); bullets(p.notes); }
    if (p.scrutiny && p.scrutiny.length) para(`_Scrutiny sets that apply: ${p.scrutiny.join(", ")}._`);
  });

  heading(2, "Scrutiny checklists");
  Object.entries(scrutiny || {}).forEach(([key, set]) => {
    heading(3, `${set.title} (\`${key}\`)`);
    set.items.forEach((i) => w(`- [ ] ${i}`));
    w();
  });
}

function renderChipBank(title, sections, opts = {}) {
  heading(2, title);
  para(opts.blurb);
  sections.forEach((s) => {
    heading(3, s.heading || s.title);
    para(s.hint);
    if (s.gap) quoteBlock("Ask the patient", s.gap);
    if (s.patientVoice) para("_Has a 'patient's own words' quote field._");
    if (s.linkRmp) para("_Cross-links to the Risk Management Plan rather than duplicating it._");
    if (s.placeholder) para(`_Free-text placeholder: \u201c${s.placeholder}\u201d_`);
    (s.groups || []).forEach((g) => {
      if (g.label) w(`**${g.label}**`);
      w((g.words || []).map((x) => `\`${x}\``).join(" \u00b7 "));
      w();
    });
  });
}

// ---------------------------------------------------------------------------
// 3b. Patient leaflets - the 29 patient-facing guides
//
// Their bodies are not in the data layer: they live as <section class="guide">
// blocks in public/patient-guides.html, which the viewer fetches and slices by
// id. Converted to markdown here so they can be authored alongside everything
// else. Semantic HTML, so a small tag-to-markdown pass is enough - no new deps.
// ---------------------------------------------------------------------------

function htmlToMarkdown(html) {
  return html
    // Site chrome, not leaflet content.
    .replace(/<div class="feedback-box"[\s\S]*?<\/div>\s*<\/div>/g, "")
    .replace(/<h2[^>]*>/g, "\n## ").replace(/<\/h2>/g, "\n")
    .replace(/<h3[^>]*>/g, "\n### ").replace(/<\/h3>/g, "\n")
    .replace(/<h4[^>]*>/g, "\n#### ").replace(/<\/h4>/g, "\n")
    .replace(/<li[^>]*>/g, "- ").replace(/<\/li>/g, "\n")
    .replace(/<\/?(ul|ol)[^>]*>/g, "\n")
    .replace(/<p[^>]*>/g, "\n").replace(/<\/p>/g, "\n")
    .replace(/<\/?(strong|b)>/g, "**").replace(/<\/?(em|i)>/g, "*")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/?(div|span|section|figure)[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    // Numeric entities - mostly decorative icons (&#9998; etc).
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .split("\n").map((l) => l.trim()).join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function exportPatientLeaflets(leaflets, dir, stamp) {
  const htmlPath = path.join(repoRoot, "public/patient-guides.html");
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, "utf8");
  fs.mkdirSync(dir, { recursive: true });

  const done = [];
  for (const g of leaflets) {
    const m = html.match(new RegExp(`<section class="guide" id="${g.id}"[\\s\\S]*?</section>`));
    if (!m) { done.push({ ...g, missing: true }); continue; }
    const body = m[0].match(/<div class="guide-body">([\s\S]*)<\/section>/);
    const md = htmlToMarkdown(body ? body[1] : m[0]);
    const file = frontMatter({
      title: slugTitle(g.title),
      leaflet_id: g.id,
      number: g.number,
      subtitle: slugTitle(g.subtitle),
      audience: "patients and families",
      code_source: "public/patient-guides.html",
      exported: stamp,
    }) + `# ${g.title}\n\n_${g.subtitle}_\n\n${md}\n`;
    fs.writeFileSync(path.join(dir, `${String(g.number).padStart(2, "0")}-${g.id}.md`), file, "utf8");
    done.push({ ...g, words: md.split(/\s+/).length });
  }
  return done;
}

// ---------------------------------------------------------------------------
// 4. Assemble
// ---------------------------------------------------------------------------

function slugTitle(s) { return String(s).replace(/\s+/g, " ").trim(); }

function frontMatter(meta) {
  const lines = ["---"];
  Object.entries(meta).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    lines.push(`${k}: ${typeof v === "string" && /[:#]/.test(v) ? JSON.stringify(v) : v}`);
  });
  lines.push("---", "");
  return lines.join("\n");
}

function main() {
  compileData();
  const require = createRequire(import.meta.url);
  const load = (m) => require(path.join(tmpDir, "lib/data", m));

  const { ALL_GUIDES, guideType } = load("guides/catalog.js");
  const { GUIDES } = load("guides/howto-guides.js");
  const { WORKFLOWS } = load("guides/referral-workflows.js");
  const { GUIDE_APPROVAL, DEFAULT_APPROVAL } = load("approval-status.js");
  const { ADMISSION_CHECKLIST, MHA_PATHWAYS, MHA_SCRUTINY, MHA_RECTIFY_NOTE } = load("guides/admission.js");
  const { LDT_SECTIONS, LDT_PATHWAYS } = load("guides/leave-discharge.js");
  const { MSE_DOMAINS } = load("guides/mse.js");
  const careplan = load("guides/careplan.js");
  const risk = load("guides/risk.js");
  const { PAY_FAQ } = load("guides/pay-faq.js");
  const { PATIENT_GUIDES } = load("patient-guides.js");

  const PROMPT_GUIDES = {
    "seclusion-support-plan": load("guides/seclusion.js").SECLUSION_BUILDER,
    debrief: load("guides/debrief.js").DEBRIEF_BUILDER,
    "safety-plan": load("guides/safety-plan.js").SAFETY_PLAN_BUILDER,
    "restraint-monitoring": load("guides/restraint.js").RESTRAINT_BUILDER,
    "observation-engagement": load("guides/observation.js").OBSERVATION_BUILDER,
  };

  const APPROVAL_LABEL = { green: "green - signed off", amber: "amber - awaiting approval", red: "red - in development" };
  const stamp = new Date().toISOString().slice(0, 10);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const manifest = [];

  for (const g of ALL_GUIDES) {
    out.length = 0;
    let source = null;
    let focusLinks = [];

    if (WORKFLOWS[g.id]) {
      source = "src/lib/data/guides/referral-workflows.ts";
      renderWorkflow(WORKFLOWS[g.id]);
    } else if (GUIDES[g.id]) {
      source = "src/lib/data/guides/howto-guides.ts";
      focusLinks = GUIDES[g.id].focus || [];
      renderHowTo(GUIDES[g.id]);
    } else if (PROMPT_GUIDES[g.id]) {
      const c = PROMPT_GUIDES[g.id];
      source = `src/lib/data/guides/${g.id === "debrief" ? "debrief" : g.id === "safety-plan" ? "safety-plan" : g.id === "restraint-monitoring" ? "restraint" : g.id === "observation-engagement" ? "observation" : "seclusion"}.ts`;
      focusLinks = c.focus || [];
      renderPromptGuide(c);
    } else if (g.id === "admission-checklist") {
      source = "src/lib/data/guides/admission.ts";
      para(g.description);
      renderChecklist(ADMISSION_CHECKLIST);
    } else if (g.id === "leave-discharge-transfer") {
      source = "src/lib/data/guides/leave-discharge.ts";
      para(g.description);
      renderLdt(LDT_SECTIONS, LDT_PATHWAYS);
    } else if (g.id === "mha-checker") {
      source = "src/lib/data/guides/admission.ts";
      renderMhaChecker(MHA_PATHWAYS, MHA_SCRUTINY, MHA_RECTIFY_NOTE);
    } else if (g.id === "mental-state-exam") {
      source = "src/lib/data/guides/mse.ts";
      para(g.description);
      renderChipBank("Domains and word banks", MSE_DOMAINS, {
        blurb: "The nurse picks descriptors per domain and the app assembles a written MSE to copy into the EPR.",
      });
    } else if (g.id === "care-plan") {
      source = "src/lib/data/guides/careplan.ts";
      para(g.description);
      heading(2, "Principles");
      bullets(careplan.CAREPLAN_PRINCIPLES);
      renderChipBank("Sections and word banks", careplan.CAREPLAN_SECTIONS);
    } else if (g.id === "risk-assessment") {
      source = "src/lib/data/guides/risk.ts";
      para(g.description);
      heading(2, "SystmOne risk-screen steps");
      bullets(risk.S1_STEPS);
      heading(2, "Risk domains and the risks under each");
      risk.RISK_DOMAINS.forEach((d) => {
        w(`- **${d.title}**: ${d.risks.length ? d.risks.join(", ") : "_no risks defined yet - this domain is empty in the app_"}`);
      });
      w();
      quoteBlock("Mandatory line appended to every RMP", risk.MANDATORY_MDT_LINE);
      quoteBlock("Separate plans note", risk.SEPARATE_PLANS_NOTE);
      renderChipBank("Formulation sections", risk.FORMULATION_SECTIONS);
      renderChipBank("Risk Management Plan sections", risk.RMP_SECTIONS);
      heading(2, "Risk types covered by the risk-specific chip banks");
      bullets(risk.RISK_TYPES);
    } else if (g.id === "mh-talking-points") {
      source = "public/patient-guides.html + src/lib/data/patient-guides.ts";
      para("Index card on the guides page. It opens the patient leaflet library - the leaflets themselves are exported to the `patient-leaflets/` folder alongside this file.");
      heading(2, "The leaflets");
      PATIENT_GUIDES.forEach((p) => w(`${p.number}. **${p.title}** - ${p.subtitle}`));
      w();
    } else {
      // Content lives in a React route, not in the data layer.
      manifest.push({ ...g, status: "NOT EXPORTED", source: `route: src/app${g.viewerPath}`, focus: 0 });
      continue;
    }

    // Guides that share the pay FAQ pool get their tagged questions appended.
    const payTopic = { payslip: "payslip", roster: "roster", "leave-absence": "leave" }[g.id];
    if (payTopic) {
      const qs = PAY_FAQ.filter((f) => f.topics.includes(payTopic));
      if (qs.length) {
        heading(2, "FAQ (from the shared pay FAQ pool)");
        para("_Edit these in `src/lib/data/guides/pay-faq.ts` - they are shared across the pay guides._");
        qs.forEach((f) => { w(`**${f.q}**\n`); w(`${f.a}\n`); });
      }
    }

    if (focusLinks.length) { heading(2, "On FOCUS (trust login needed)"); linkList("Links", focusLinks); }

    const approval = GUIDE_APPROVAL[g.id] || DEFAULT_APPROVAL;
    const body = frontMatter({
      title: slugTitle(g.title),
      guide_id: g.id,
      category: g.category,
      guide_type: guideType(g.id),
      approval: APPROVAL_LABEL[approval],
      viewer_path: g.viewerPath,
      code_source: source,
      exported: stamp,
    }) + `# ${g.title}\n\n` + out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

    fs.writeFileSync(path.join(outDir, `${g.id}.md`), body, "utf8");
    manifest.push({
      ...g, status: "exported", source, approval, type: guideType(g.id),
      focus: focusLinks.length, words: body.split(/\s+/).length,
    });
  }

  const leaflets = exportPatientLeaflets(PATIENT_GUIDES, path.join(outDir, "patient-leaflets"), stamp);

  // -------------------------------------------------------------------------
  // Manifest
  // -------------------------------------------------------------------------
  const exported = manifest.filter((m) => m.status === "exported");
  const skipped = manifest.filter((m) => m.status !== "exported");
  const withFocus = exported.filter((m) => m.focus > 0);

  const md = [
    "# wardHub Guide Manuscripts - export manifest",
    "",
    `Exported ${stamp} from the wardHub codebase by \`scripts/export-guide-manuscripts.mjs\`.`,
    "",
    `**${exported.length} staff guides exported**${skipped.length ? `, ${skipped.length} not exported (content lives in a React route, see below)` : ""}.`,
    `**${leaflets.filter((l) => !l.missing).length} patient leaflets exported** to \`patient-leaflets/\`.`,
    "",
    "Upload the `.md` files to the SharePoint **wardHub Guide Manuscripts** library. From that point the",
    "SharePoint copy is the authoring home: edit there, and the publish pipeline carries changes to the site.",
    "Re-running this export overwrites the folder, so do not hand-edit files here.",
    "",
    `**${withFocus.length} guides carry FOCUS links** (trust-network URLs). Those are the ones to look at first`,
    "when deciding what is safe to hold outside the tenant.",
    "",
    "## Exported",
    "",
    "| Guide | Category | Type | Approval | FOCUS links | File |",
    "|---|---|---|---|---|---|",
    ...exported.map((m) => `| ${m.title} | ${m.category} | ${m.type} | ${m.approval} | ${m.focus || ""} | \`${m.id}.md\` |`),
    "",
    "## Patient leaflets (`patient-leaflets/`)",
    "",
    "Patient-facing, written in plain language - a different audience and a different reviewer to the staff guides.",
    "Converted from `public/patient-guides.html`, so check the formatting survived the conversion before publishing.",
    "",
    "| # | Leaflet | Subtitle | File |",
    "|---|---|---|---|",
    ...leaflets.map((l) => `| ${l.number} | ${l.title} | ${l.subtitle} | ${l.missing ? "**NOT FOUND in the HTML**" : `\`patient-leaflets/${String(l.number).padStart(2, "0")}-${l.id}.md\``} |`),
    "",
    ...(skipped.length ? [
      "## Not exported - content lives in a React route",
      "",
      "Interactive pages whose text is written into the component, not the data layer.",
      "They need a manual manuscript or a data-layer extraction before they can be authored in SharePoint.",
      "",
      "| Guide | Category | Where the content lives |",
      "|---|---|---|",
      ...skipped.map((m) => `| ${m.title} | ${m.category} | \`${m.source}\` |`),
      "",
    ] : []),
  ].join("\n");

  fs.writeFileSync(path.join(outDir, "_MANIFEST.md"), md, "utf8");
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\nExported ${exported.length} guide manuscripts + ${leaflets.filter((l) => !l.missing).length} patient leaflets to ${outDir}`);
  if (skipped.length) console.log(`Not exported (React routes): ${skipped.map((s) => s.id).join(", ")}`);
  const missing = leaflets.filter((l) => l.missing);
  if (missing.length) console.log(`Leaflets not found in the HTML: ${missing.map((l) => l.id).join(", ")}`);
}

main();
