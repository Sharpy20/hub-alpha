# NHS-Ready Prompt Pack

> Built 4 Jul 2026. Goal: get wardHub to trust sign-off standard in 3 days of Fable sessions.
> Run ONE prompt per fresh session. Each one writes its findings to `docs/nhs-ready/`, so
> nothing is lost when the session ends and later prompts can read earlier reports.

## How to use this

1. Start a fresh Claude Code session in `E:\Hub`.
2. Copy one prompt block below, paste it, walk away (auto-accept mode is fine for audit
   prompts; stay nearby for fix prompts that touch code).
3. When it finishes, tick it off in `00-TRACKER.md` and skim the report it wrote.
4. Next session, next prompt. Order matters within a day but the days can swap.

Why this works where "review the whole project" didn't: each prompt covers one dimension,
sends subagents out for the wide file sweeps (subagent context is disposable), and keeps the
main session for judgement and writing. The reports in this folder become the shared memory
between sessions - and at the end they double as your evidence pack for the trust.

Rule for every session: no em dashes in anything written, follow `lessAImoreHUMANprompt.md`
for all copy, and never touch git credentials (Sharpy20 only).

---

## DAY 1 - Governance and assurance

This is the day that gets you sign-off. The Optica lesson: the trust's real bar is the
governance wrapper (DPIA, clinical safety, data honesty), not the code.

### Prompt 1 - Data map and governance audit (read-only)

```
Read CLAUDE.md, then do a data governance audit of wardHub (E:\Hub\inpatient-hub). This is
READ-ONLY - write findings, change nothing. I am preparing this project for NHS trust
sign-off and need to be able to answer "what data does it hold, where, and who can see it"
with total confidence.

Use Explore subagents for the wide sweeps so you don't run out of context. Cover:

1. DATA MAP - every place the app stores or reads data: all localStorage keys (grep
   wardhub_), sessionStorage, cookies, Supabase usage (wired? live? what tables?), any
   fetch/POST to external services, and any data baked into the bundle. For each: what data,
   how long it lives, who can read it.
2. PII REALITY CHECK - the claim is "no real PII, demo data only". Verify it. Sweep
   src/lib/data/ for anything that looks like a real person, real internal phone number, or
   real email. Check code comments too (I know some hold real trust-internal numbers behind
   "Hidden in demo mode" - list every instance so I have an inventory).
3. REPO HYGIENE - docs/ holds raw FOCUS dumps with real contacts. Confirm exactly what
   .gitignore excludes vs what is actually committed (git ls-files is the truth, not the
   folder). Flag anything committed that could not go public. Check git history too - a file
   deleted later is still in history.
4. THIRD PARTIES - what leaves the user's machine? Vercel, fonts, analytics, CDN scripts,
   anything. NHS DPIA needs this list.
5. CLAIMS VS REALITY - compare what the GDPR page and any in-app privacy copy SAYS with
   what the code DOES. Mismatches are the most embarrassing thing an IG reviewer can find.

Write the report to docs/nhs-ready/01-data-governance-audit.md with: a plain-English data
map table, a numbered findings list ordered by how badly each would land in front of an IG
officer, and a "fix list" section of concrete actions. Update docs/nhs-ready/00-TRACKER.md.
```

### Prompt 2 - Governance fix pass

```
Read CLAUDE.md, then docs/nhs-ready/01-data-governance-audit.md. Work through its fix list
top to bottom and apply the fixes: purge or gitignore anything that shouldn't be committed,
correct any in-app privacy copy that doesn't match reality, redact real internal numbers
from code comments into a single gitignored reference file (E:\Hub\temp\internal-contacts.md)
so the data isn't lost, and anything else the report calls for.

Rules: don't rewrite git history without asking me first (list what WOULD need history
rewriting and stop there). Run npm run build after code changes. Follow
lessAImoreHUMANprompt.md for any copy you write. No em dashes. When done, mark each finding
fixed/deferred in the audit report, update 00-TRACKER.md, commit with a clear message, and
push (Sharpy20 account, gh auth switch --user Sharpy20 first).
```

### Prompt 3 - DPIA and clinical safety starter pack

```
Read CLAUDE.md, docs/nhs-ready/01-data-governance-audit.md, and my memory notes on Optica
if present. wardHub needs a governance wrapper to get NHS trust approval: a DPIA and a
DCB0129 clinical safety case. I want draft documents good enough that the trust's IG officer
and Clinical Safety Officer are editing, not writing from scratch.

Create in docs/nhs-ready/:
1. 03a-dpia-draft.md - a DPIA draft following the standard NHS DPIA structure (use
   WebSearch to confirm the current template sections). Fill every answer you can from the
   data audit; mark the ones only the trust can answer with [TRUST TO CONFIRM] and a note on
   who owns it. Be honest - "demo build stores nothing server-side, full build would use
   trust-hosted Supabase" is the story.
2. 03b-clinical-safety-hazard-log.md - a DCB0129-style hazard log. Think like a Clinical
   Safety Officer: what could this tool get WRONG that harms a patient? Stale guideline
   content, a wrong phone number, a task marked done that wasn't, copy-paste into the wrong
   patient's notes, staff trusting the demo data. For each hazard: description, cause,
   effect, existing controls in the app, proposed controls, initial risk rating.
3. 03c-data-flow-diagram.md - a Mermaid diagram of data flows (user, browser storage,
   Vercel, future Supabase, future SystmOne) for the demo build and the proposed trust
   build, side by side.

Keep the writing plain and honest per lessAImoreHUMANprompt.md - IG people are allergic to
marketing language. No em dashes. Update 00-TRACKER.md when done.
```

### Prompt 4 - Security sweep

```
Read CLAUDE.md, then do a security review of wardHub (E:\Hub\inpatient-hub) aimed at the
questions an NHS IT security reviewer would ask. Use subagents for wide sweeps. Cover:

1. Secrets: any keys, tokens, or credentials in the repo or git history (git log -p grep,
   .env files, hardcoded strings).
2. Dependencies: npm audit results, but interpret them - I know ~20 moderate/low findings
   are vendored inside Next/postcss and that npm audit fix --force would downgrade Next and
   break the build, so NEVER run it. Say which findings are real vs noise.
3. Headers and config: what security headers does the Vercel deployment send
   (Content-Security-Policy, X-Frame-Options, etc.)? Check next.config and suggest a header
   set appropriate for an internal NHS tool. Check https://www.wardhub.live directly with
   WebFetch if reachable.
4. Auth honesty: the demo has open routes by design. Document exactly what the full build
   would need (trust SSO, route protection, session expiry) so the gap is a stated plan,
   not a surprise.
5. XSS/injection surface: anywhere user input is rendered (task titles, personal links,
   suggest-a-link modal, free-text fields). dangerouslySetInnerHTML sweep.

Apply low-risk fixes directly (headers, obvious sanitisation); list anything bigger as
findings only. npm run build after changes. Write the report to
docs/nhs-ready/04-security-review.md, update 00-TRACKER.md, commit and push (Sharpy20).
```

---

## DAY 2 - Quality and rebuildability

### Prompt 5 - Accessibility re-audit and fix

```
Read CLAUDE.md. A WCAG 2.1 AA audit was done in a previous session (Session 26) and most
items were fixed; snag 192 noted residual contrast, theme, and focus-trap work. Re-audit
wardHub now against WCAG 2.1 AA and fix what you find, because the app has grown a lot
since (quiz, service map, risk wizard, new guides).

Start the dev server with the preview tools and test for real, don't just read code:
keyboard-only navigation through the main flows (home, links, a guide, ward diary, add
task, quiz), focus trapping in modals, visible focus indicators, contrast in ALL five style
themes plus dark mode (preview_inspect for computed colours, not screenshots), form labels,
heading order, alt text, aria on the custom widgets (bookmark wheel, kanban board, Ctrl+K
search palette). Test at mobile width too.

Fix issues as you find them, re-verify in the preview after each fix, and keep a log. NHS
theme is the one that must be flawless; note but deprioritise cosmetic issues in the other
themes. Write results to docs/nhs-ready/05-accessibility.md with a claimed conformance
statement I can show the trust (what passes, what has known exceptions). npm run build,
update 00-TRACKER.md, commit and push (Sharpy20).
```

### Prompt 6 - Content and dead-link sweep

```
Read CLAUDE.md and docs/BACKLOG.md section A. Do a full content quality sweep of wardHub:

1. LINK HEALTH - extract every URL in src/lib/data/ (links, guides, quiz sources). Check
   external ones with WebFetch in batches (throttle, and treat 403s from bot-blocking sites
   as "check manually" not "dead"). FOCUS/intranet URLs can't be checked from here - just
   inventory them. List every remaining "#" placeholder link and where it appears; I know
   there are ~86 form links awaiting FOCUS URLs (real URLs are captured in
   E:\Hub\temp\focus-referral-*.md - wire any that match cleanly, list the rest).
2. BLOCKED-IN-DEMO consistency - every dead/placeholder link should carry the
   blocked-in-demo badge treatment. Find ones that don't.
3. COPY PASS - sweep user-facing copy against lessAImoreHUMANprompt.md: banned words,
   corporate tone, em dashes (hard ban), Title Case Headers That Should Be Sentence Case.
   Fix what you find. Do not touch trust-approved form wording (exact-wording rule - if a
   guide reproduces a trust form, the form text is untouchable).
4. Spelling/consistency: British English throughout, "wardHub" casing, ward name casing.
5. GUIDE CONSISTENCY - all 60+ guides should feel like they came from the same place.
   Audit across every guide: same step-type usage for the same job (criteria, form,
   WAGOLL, submission, case note, GDPR tip), consistent heading and label wording,
   consistent case-note template format, consistent phone/email formatting, consistent
   related-links treatment, and every guide has an approval-status entry. Build a per-guide
   conformance table, fix the mechanical inconsistencies, list judgement calls for Mike.

Write docs/nhs-ready/06-content-sweep.md with the link inventory (live / dead / FOCUS /
placeholder counts) and what you fixed. npm run build, update 00-TRACKER.md, commit and
push (Sharpy20).
```

### Prompt 7 - Code health pass

```
Read CLAUDE.md. Tidy wardHub's code for handover quality - a trust developer should be able
to read this repo without asking me anything. Known debt: ~130 lint issues in older files.

1. Run the linter, fix everything auto-fixable, then work through the rest by hand. If any
   rule is wrong for this project, change the config and say why in the report.
2. Dead code: the project has parked features kept deliberately dormant - the v1/v2 split
   (COLLAPSED_FOR_DEMO in src/lib/config/build.ts), the Welcome tool, the risk tool
   redirect. DO NOT delete these. Do delete genuinely orphaned code: unused components,
   unused exports, commented-out blocks, unused deps in package.json (verify with grep
   before removing anything).
3. Consistency: toLocalDateStr() everywhere dates become YYYY-MM-DD strings (never
   toISOString().split - known UTC bug), ward id casing, localStorage key naming.
4. Comment hygiene per lessAImoreHUMANprompt.md: kill "what" comments, keep "why" comments.
   Keep the real-contact comments flagged in the governance audit only if prompt 2 hasn't
   already moved them out.

Work in batches, npm run build between batches, never let the build stay red. Write
docs/nhs-ready/07-code-health.md (lint count before/after, what was removed, what was
deliberately kept and why). Update 00-TRACKER.md, commit per batch, push (Sharpy20).
```

### Prompt 8 - Rebuild pack (portability)

```
Read CLAUDE.md. If the trust says "we like it, rebuild it on our platform", I need to hand
over a pack that makes that possible without me in the room. Create in docs/nhs-ready/:

1. 08a-architecture.md - how wardHub actually works: route map, data layer (static TS
   modules today, Supabase wired but dormant), state (React context + localStorage), the
   guide system (unified viewer, static-route overrides, approval-status traffic lights),
   the theme system, proxy.ts routing, the COLLAPSED_FOR_DEMO switch. Mermaid diagrams
   where they help. Write for a developer who has never seen the repo.
2. 08b-data-inventory.md - every content dataset (guides, links, quiz, staff, patients,
   service map): file, shape, row count, and how it would map to database tables or a CMS.
   This is the migration spec.
3. 08c-rebuild-options.md - an opinionated comparison of realistic trust deployment paths
   (keep Next.js on trust infra / static export behind the firewall / rebuild in the
   trust's stack / SharePoint-ish fallback), with effort estimates and what's lost in each.
   Recommend one. Note which parts are plain data that survive ANY rebuild - that's the
   reassurance the trust needs.

Ground everything in the actual code - read it, don't guess from CLAUDE.md. Plain language
per lessAImoreHUMANprompt.md, no em dashes. Update 00-TRACKER.md, commit and push.
```

### Prompt 8b - Fast loading (performance)

```
Read CLAUDE.md. Make wardHub feel instant - a slow demo in front of executives undoes
everything. Audit then fix:

1. Run npm run build and read the route-size table Next.js prints. List the heaviest
   routes and first-load JS per route. Anything over ~200kB first-load needs a reason.
2. Find the weight: big data modules imported at module scope (the quiz bank, staff and
   patient demo data, service map, guide catalog), components that should be dynamic
   imports, images without next/image or oversized, fonts loading badly.
3. Fix the safe wins: dynamic import for heavy below-the-fold or modal components,
   lazy-load the quiz question bank so it only ships on /quiz, code-split per-route data,
   compress any large images. Do NOT restructure data files in ways that break guides.
4. Verify with the preview tools: home, /guides, a guide page, /tasks, /quiz all load fast
   and error-free; re-run npm run build and show before/after route sizes.

Write docs/nhs-ready/08d-performance.md with the before/after table and what changed.
Update 00-TRACKER.md, commit and push (Sharpy20).
```

---

## DAY 3 - The pitch

### Prompt 9 - Executive deck

```
Read CLAUDE.md, then every report in docs/nhs-ready/ (they exist from earlier sessions),
plus docs/BACKLOG.md. Build the board/CEO presentation deck for wardHub as a .pptx using the
pptx skill. Audience: NHS trust executives and the IG/clinical safety people who advise
them. 12-15 slides, ten minutes of talking.

The story arc: the problem on the ward (information scattered across FOCUS, paper, memory;
time lost; risk of stale guidance) -> what wardHub is (one place, built BY a ward NIC ON
the ward, show real screenshots) -> what it already contains (66 guides, 364-question
training quiz, service directory, ward diary - real numbers from the repo) -> the
governance story (demo holds no real data; DPIA draft and hazard log already written -
reference the day-1 docs; complements SystmOne rather than competing) -> the ask (pilot on
two wards, IG review of the prepared pack, a named clinical safety officer) -> roadmap.

Take real screenshots: run the dev server with the preview tools, capture the home page, a
guide, the ward diary, and the quiz, and embed them. NHS Identity styling: NHS Blue
#005EB8, Source Sans/Arial, white backgrounds, no gradients, no clip-art, no cliché emoji.
Honest and plain per lessAImoreHUMANprompt.md - executives smell hype. No em dashes.
Include speaker notes on every slide. Save to docs/nhs-ready/09-wardHub-exec-deck.pptx and
update 00-TRACKER.md.
```

### Prompt 10 - One-pager and demo script

```
Read CLAUDE.md and the reports in docs/nhs-ready/. Two deliverables:

1. docs/nhs-ready/10a-one-pager.docx (docx skill) - a single A4 page to leave behind after
   the meeting: what wardHub is, three concrete ward scenarios where it saves time or
   reduces risk (e.g. new starter finds the seclusion SOP in 10 seconds; nurse runs a
   referral end-to-end with the case note written for them; HCA revises MHA basics on the
   quiz), the governance position in two sentences, the ask, and my contact line. NHS
   styling, one page, no smaller than 10pt to make it fit - cut words instead.
2. docs/nhs-ready/10b-demo-script.md - a 10-minute guided demo walkthrough of
   https://www.wardhub.live for me to rehearse: exact click path, what to SAY at each stop,
   the one wow moment per section, and a "if they ask X, answer Y" section covering the
   sharp questions (where's the data? what if content goes stale? what about SystmOne?
   what does it cost? who maintains it?). Verify the click path actually works on the live
   site with the browser tools before writing it down.

lessAImoreHUMANprompt.md tone throughout, no em dashes. Update 00-TRACKER.md.
```

### Prompt 11 - In-product governance page

```
Read CLAUDE.md, docs/nhs-ready/01-data-governance-audit.md, and 03a-dpia-draft.md. Build an
"About and governance" page in wardHub itself, so when a trust reviewer pokes around the
live site the governance answers are IN the product. That's the wow: a demo that
anticipates the IG questions.

The page (suggest /about, linked from the footer and the More menu) should cover, in plain
sentence-case copy: what wardHub is and who built it, the data position (no real patient
data, everything demo, what localStorage holds and how to clear it), the content approval
system (explain the green/amber/red traffic lights that already exist on guide tiles, with
live counts pulled from approval-status.ts), how content gets reviewed and by whom, version
of the build, and how to report a problem. Add a small "content status" summary block
(x approved, y in review, z draft) computed from the real data - reviewers love seeing
that honesty surfaced.

Match the existing UI components and NHS theme, keep it working in all five style themes,
mobile-friendly. lessAImoreHUMANprompt.md rules, no em dashes, no cliché emoji. Verify with
the preview tools, npm run build, update 00-TRACKER.md, commit and push (Sharpy20).
```

### Prompt 12 - Dress rehearsal

```
Read CLAUDE.md, docs/nhs-ready/00-TRACKER.md, and 10b-demo-script.md. Final check before I
present. Using the preview tools against a local dev server AND spot-checking
https://www.wardhub.live:

1. Walk the demo script click-by-click. Anything broken, slow, misspelled, or awkward on
   that path gets fixed NOW - the demo path must be perfect even if other corners aren't.
2. Walk the same path at mobile width and in dark mode.
3. Check the browser console stays clean (no errors) along the whole path.
4. Confirm every day-1/day-2 report's "deferred" items are still accurately listed - then
   write docs/nhs-ready/12-known-limitations.md: a short honest list of what wardHub does
   NOT yet do, phrased the way I'd say it out loud if asked. Walking in with that list is
   stronger than being caught without it.
5. Finish 00-TRACKER.md with a final status line per prompt and a one-paragraph summary of
   the whole pack I can read the night before.

Fix, verify, npm run build, commit and push (Sharpy20). If the live site differs from local
in any way that matters for the demo, say so loudly at the top of your summary.
```

---

## If you only have time for half of this

Run 1, 3, 9, 10 in that order. Governance audit + DPIA draft + deck + demo script is the
minimum set that changes the meeting. Everything else makes the project better; those four
get it approved.
