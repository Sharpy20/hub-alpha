# Project Evaluation Template

> **What this is:** the standing brief for a multi-perspective review of wardHub. Thirteen viewpoints, each with its own criteria and its own project-specific things to actually go and check.
> **How to run it:** ask Claude to "run the project evaluation", or name a single hat ("put on the IG hat").
> **Output:** a dated report, `YYYY-MM-DD_project-evaluation.md`, in this folder. **It replaces every earlier report, so it has to contain everything worth keeping from them.**
> **Template version:** 2.1 (29 July 2026). See the change log at the bottom.

---

## Before you write a word

An evaluation that reads well and says nothing is worse than no evaluation, because it gets filed as if the work was done. Three rules keep this honest.

**1. Evidence first, prose second.** Every claim about the codebase names the file it came from, or it does not go in. If something could not be verified in the time available, say so in the report as "not verified this pass" rather than softening it into a confident sentence. Assertions about the Trust (policy currency, what a service actually does, whether a number is live) are not verifiable from this repo at all, and must be flagged for Mike rather than stated.

**2. Run the checks.** Before the first hat, run these and record the results in the Verification Log:

```bash
cd E:/Hub/inpatient-hub && npm run build && npm test && npx tsc --noEmit && npm run lint && npm audit
```

Also record: route count, rough line count of `src/`, current git author on the last few commits (must be Sharpy20), and the state of `COLLAPSED_FOR_DEMO` in `src/lib/config/build.ts`. Any hat that talks about build health, test coverage, or dependency risk is quoting these numbers, not guessing.

**3. Carry forward, do not restart.** Before writing anything, read **every** `*_project-evaluation.md` in this folder and in `archive/`, every `*-deep-dive.md`, and `docs/BACKLOG.md`. Not just the most recent one. The report opens with what moved, what is still open, and anything that has gone backwards. A recommendation that has appeared in two or more evaluations and is still open gets called out as stuck, with a guess at why. Repeating a recommendation as if it were new is the main failure mode of this document.

**4. The new report must stand alone.** Mike deletes superseded evaluations, and he should be able to. That only works if the newest file is a complete record on its own, so:

- **Never cite an older report as the only source for a claim.** "As noted in the June evaluation" is not evidence if June has been deleted. Restate the substance and the figure inline, then cite the older report as provenance if you want to.
- **Carry the ledgers, not just the narrative.** The three tables under "Carried forward" in the report structure below (recommendation ledger, metric history, standing decisions) are not optional. They are the mechanism that lets old files go.
- **Carry the unresolved, not the resolved detail.** A finding that was fixed two evaluations ago needs one line in the ledger saying it was fixed and when, so nobody re-raises it. It does not need its original write-up reproducing.
- **Carry the standing decisions,** especially the ones that stop wasted work: things deliberately parked, things blocked on a licence rather than an engineering problem, and positions Mike has settled and does not want re-argued. An evaluation that re-proposes a parked decision has cost him time, not saved it.
- **Test it before you finish:** if every other file in this folder vanished, would this report still tell someone the full story of where the project has been and what is outstanding? If not, it is not done.

**Style:** house rules apply (`lessAImoreHUMANprompt.md`). No em dashes. No banned words. Write it like a colleague explaining what they found, not like a consultancy deliverable.

---

## Scorecard

Open the report with this table so evaluations can be compared over time. RAG plus a 1 to 5, where 3 means "fine for a demo, not for live".

| # | Perspective | Score /5 | RAG | Direction vs last eval | One-line reason |
|---|-------------|:--------:|:---:|:----------------------:|-----------------|
| 1 | Web Developer | | | ↑ / → / ↓ | |
| 2 | Clinical User | | | | |
| 3 | Trust Senior Management | | | | |
| 4 | Information Governance | | | | |
| 5 | IT Security | | | | |
| 6 | UX Design | | | | |
| 7 | Accessibility | | | | |
| 8 | NHS Digital Standards | | | | |
| 9 | Training | | | | |
| 10 | Project Management | | | | |
| 11 | Clinical Content Editor | | | | |
| 12 | Deployment and Operations | | | | |
| 13 | Patient and Carer | | | | |

Scores are for trend spotting, not for the Board. Do not average them into a single number.

Carry the **whole score history** in this table, one column per evaluation, oldest on the left. That is what makes the trend readable after the older files are gone.

| # | Perspective | 25 Jan | 22 Mar | 14 Apr | 21 Jun | 28 Jul | This pass | RAG | Direction |
|---|-------------|:------:|:------:|:------:|:------:|:------:|:---------:|:---:|:---------:|
| 1 | Web Developer | | | | | 4 | | | |

Fill the historic columns from the reports you read. Where a hat did not exist yet, leave the cell blank rather than guessing a score for it.

---

## Carried forward

Three tables, always present, always complete. These exist so that deleting every older report costs nothing.

### 1. Recommendation ledger

Every recommendation ever made that is not yet done, plus every one closed since the last pass. Sorted open-first.

| Recommendation | First raised | Times raised | Owner | Status | Note |
|---|---|:---:|---|---|---|
| Proxy regression test | 14 Apr 2026 | 4 | Claude | Open | Stuck. Dormant code while `COLLAPSED_FOR_DEMO` is true, so nothing forces it |
| Fill the placeholder guides | 21 Jun 2026 | 1 | Claude | Done, Session 32 | No empty placeholder guides remain |

Rules: **nothing leaves this table by being forgotten.** A recommendation is removed only after it has appeared once as Done, or once as Dropped with a reason. "Times raised" is the honest measure of a stuck item, and a number that keeps climbing is itself a finding worth writing about.

**Cross-check the ledger against `docs/BACKLOG.md` in both directions, every pass, and report the mismatches.** Every open item in the ledger should exist in the BACKLOG, and every open BACKLOG item that this evaluation would recommend should already be in the ledger. Name specifically: items marked done in one and open in the other, evaluation findings that never reached the BACKLOG, and BACKLOG items no evaluation has ever looked at. The two documents drift silently, and a finding that lives only in an evaluation is a finding nobody will action, because the BACKLOG is what gets read at the start of a session.

### 2. Metric history

The numbers that only mean something as a trend. One row per metric, one column per evaluation.

| Metric | 21 Jun | 28 Jul | This pass |
|---|---|---|---|
| Guides in `ALL_GUIDES` | | 71 | |
| Approval split (green / amber / red) | | 1 / 50 / 20 | |
| Placeholder `#` form links | 86 | 131 | |
| WAGOLLs live / dead | | 0 / 16 | |
| Quiz questions | | 942 | |
| Test files / tests | 3 / 32 | 3 / 32 | |
| Lines in `src/` | | 50,470 | |
| Page routes | | 49 | |
| Production dependencies | | 7 | |
| Open advisories (prod / dev) | | 3 / 32 | |
| `[confirm]` markers | | 4 | |

Add rows as new things become worth tracking. Do not drop a row because the number stopped moving, that is exactly when it matters.

### 3. Standing decisions and parked items

Positions already settled, so no future evaluation reopens them or proposes work that has already been ruled out. Each needs the decision, who made it, and enough of the reasoning to stop it being re-argued from scratch.

| Decision | Date | Who | Why it stays settled |
|---|---|---|---|
| No special category data in the patient record. MHA status, alerts, diagnoses, room and bed removed | 28 Jul 2026 | Mike | Clinical safety as much as IG: every clinical field invites "who keeps it current" and "what if someone acts on it when it is stale". wardHub is not the clinical record. Guarded by `src/__tests__/no-special-category-data.test.ts` |
| Never run `npm audit fix --force` | 13 Jun 2026 | Claude | Downgrades Next to 9.x |
| Publish pipeline parked | 27 Jul 2026 | - | Power Automate is standard-connectors-only, HTTP is premium. The blocker is a licence, not code. Do not re-propose it as an engineering task |
| Advocacy means IMHA only. Derby City is Disability Direct, County is Cloverleaf | 27 Jun 2026 | Mike | POhWER removed. Settled content decision |
| No referral tracking, no shift-based handover screen | 27 Jul 2026 | Mike | Some services track their own referrals, others go silent. Tracking both makes work for the first and still misses the second |

---

## HAT 1: Web Developer

**Perspective:** technical quality, architecture, code standards, maintainability

### Criteria
- **Code Quality:** clean, consistent, organised?
- **Architecture:** does the structure still fit what the app has become?
- **Performance:** obvious bottlenecks, oversized client bundles, god-components?
- **Best Practices:** React/Next.js/TypeScript idiom, Rules of Hooks, server vs client boundaries
- **Dependencies:** current, appropriate, and not carrying known holes?
- **Error Handling:** does a corrupt localStorage value or a missing guide id take a page down?
- **Testing:** what is actually covered, and what would a regression slip through?
- **Build Health:** clean build, clean `tsc`, clean lint?

### Project-specific checks
- `src/lib/config/build.ts` (`COLLAPSED_FOR_DEMO`): is the limited/full split still reversible, or has drift set in while it has been collapsed?
- `src/proxy.ts`: password gate, route blocking, legacy redirects. This file carries a lot of behaviour for its size.
- The `isV2` naming debt (true means "limited") is a known foot-gun. Still worth the rename?
- Known god-components, `src/app/tasks/page.tsx` in particular. Has it grown again?
- Test count against feature count. Three test files against this surface area is the honest headline.

### Output
1. Strengths
2. Technical debt and flaws
3. Limitations
4. Recommendations, prioritised

---

## HAT 2: Nurse (Clinical User)

**Perspective:** day-to-day usability for frontline staff on a real shift

### Criteria
- **Workflow Efficiency:** does it speed the job up or add a step?
- **Information Access:** can staff find the thing in under a minute?
- **Task Management:** does the diary survive a busy shift?
- **Patient Safety:** does it support safe practice, and could it mislead?
- **Interruption Tolerance:** can a half-finished piece of work be picked up again?
- **Mobile Use:** usable on a tablet, on the move?
- **Shift Handover:** does it support handover, including handing work back?

### Evaluate for each real role
The five roles are `staff`, `lead`, `manager`, `ward_admin`, `senior_admin`, with `isContributor` as a separate flag on top of any of them. Ward Admin and Senior Admin are the IT side, not ward professionals. Do not evaluate against the old "Normal User / Contributor" role names.

### Project-specific checks
- Task hand-back: structured dropdowns, no free text, case note generated even when the job is not finished. Does the flow hold up if someone hands back a job they never really started?
- Waiting-on state and chase dates: does the ward see the age of a wait?
- The guide builders (risk, care plan, MSE, seclusion): would a nurse mid-shift finish one, or bail out?
- Copy-to-SystmOne output: does it survive a paste into a plain notepad field that strips blank rows?
- Anything that stores nothing and so loses a draft on interruption.

### Output
1. What works well for clinical staff
2. Pain points and frustrations
3. Missing features staff would expect
4. Recommendations, ordered by patient-care impact

---

## HAT 3: Trust Senior Management

**Perspective:** strategic fit, risk, business case, feasibility

### Criteria
- **Strategic Alignment:** Trust objectives, CQC themes, digital strategy
- **Risk Assessment:** operational, clinical, reputational
- **Cost-Benefit:** what it costs to take on, against time saved
- **Implementation Complexity:** how disruptive is rollout?
- **Staff Acceptance:** will they use it without being told to?
- **Scalability:** does it extend past one ward?
- **Governance:** are the controls real or documented?

### Project-specific checks
- Single-maintainer risk. One nurse built this in his own time. Say plainly what happens if he stops.
- Where it sits against the Trust's existing platforms rather than competing with them.
- What is being asked of the Trust right now, and what is being asked for later. These get conflated in demos.

### Output
1. Strategic value assessment
2. Risk register with mitigations
3. Resource requirements
4. Implementation considerations
5. Recommendations for the Board

---

## HAT 4: Information Governance Officer

**Perspective:** data protection, UK GDPR, information security, audit trails

### Criteria
- **Data Classification:** classified by sensitivity, and does the UI respect it?
- **UK GDPR:** all principles addressed, lawful basis identified
- **Consent:** appropriate mechanisms, and does the app claim consent it has not got?
- **Data Minimisation:** only what is needed, displayed and stored
- **Retention:** defined and enforceable
- **Subject Rights:** could a SAR or erasure request be answered?
- **DPIA:** needed, started, finished?
- **Audit Trails:** can access and change be reconstructed?

### Project-specific checks
- Rule 4: contacts that are not publicly findable must render "Hidden in demo mode". Real values live outside the repo in `E:\Hub\temp\internal-contacts.md` and must never come back into code or comments.
- Sweep for real internal numbers, emails and named individuals in `src/` and `docs/`. Check leftover comments, not just rendered output.
- Git history, not just the working tree. `docs/nhs-ready/01-data-governance-audit.md` records the history rewrite; confirm nothing trust-sourced has been added since.
- Demo data must stay obviously fictional. Poet wards, placeholder names.
- Where the data would live if it were real, including hosting region. Flag it as a question if the answer is not in the repo.
- The DPIA and hazard log in `docs/nhs-ready/` and the Dev Panel: draft or signed?

### Output
1. Compliance status
2. Data flow analysis
3. Risk areas
4. Required actions for compliance
5. Recommendations

---

## HAT 5: IT Security Analyst

**Perspective:** vulnerability assessment, access control, threat modelling

### Criteria
- **Authentication:** robust enough for the data it holds?
- **Authorisation:** is role-based access enforced, or only drawn?
- **Data at Rest / In Transit:** encryption, HTTPS, cookie flags
- **Input Validation:** injection and XSS surface
- **Session Management:** cookie scope, lifetime, logout
- **Dependency Security:** known advisories and whether they are reachable
- **Infrastructure:** deployment and secrets

### Project-specific checks
- The site password gate in `src/proxy.ts` and `src/app/api/auth/verify-password/route.ts`. One shared password, server-verified, httpOnly cookie. Be blunt about what that does and does not protect.
- Every role check is currently client-side. Say so once, clearly, rather than repeating it per finding.
- `npm audit` output: separate advisories that are reachable from ones vendored inside Next or postcss. Never recommend `npm audit fix --force`, it downgrades Next to 9.x.
- Any webhook or API surface (`/api/**`), including specced-but-unbuilt endpoints and their shared-secret assumptions.
- Project isolation: confirm Sharpy20 on recent commits. Another account name anywhere is a stop-work finding.

### Output
1. Security strengths
2. Vulnerabilities identified
3. Threat model summary
4. Remediation priorities
5. Recommendations, rated Critical / High / Medium / Low

---

## HAT 6: UX Designer

**Perspective:** experience, interface, journeys

### Criteria
- **Visual Hierarchy:** is the important thing the loudest thing?
- **Consistency:** does it feel like one product?
- **Navigation:** findable without a tour?
- **Feedback:** does the system say what just happened?
- **Error Recovery:** can a mistake be undone?
- **Cognitive Load:** how much is on screen at once?
- **Screen sizes that matter:** ward desktops and Trust laptops, at the resolutions actually
  on the ward. Small screens are explicitly not a goal - do not score against them.
- **NHS Identity:** aligned with the NHS design system

### Project-specific checks
- The five style themes plus dark mode. Does a component look right in all six, or only in NHS light?
- Progressive disclosure on long guides: does it reduce load or hide the thing people need?
- The home page. It has accumulated a lot (safeguarding block, bookmark wheel, today widget, disclaimer). Is it still a front door?
- Chip and word-bank density in the builders. Where does helpful become overwhelming?

### Output
1. UX strengths
2. Usability issues
3. User journey analysis
4. Recommendations

---

## HAT 7: Accessibility Specialist

**Perspective:** WCAG 2.1 AA, inclusive design, assistive tech

### Criteria
- **Perceivable:** alt text, contrast, text sizing
- **Operable:** keyboard, focus management, timing
- **Understandable:** plain language, consistent navigation, error identification
- **Robust:** semantic HTML, ARIA, screen reader behaviour
- **Colour independence:** does the UI work without colour cues?
- **Motor:** target sizes
- **Cognitive:** clarity and simplicity

### Project-specific checks
- Contrast in the four non-NHS themes and dark mode. The audited pass covered NHS light only.
- Custom overlay modals: focus trap and Escape-to-close were the known residual gap, against the compliant base `Modal`.
- Drag-and-drop task reordering has no keyboard equivalent.
- The traffic-light approval badges carry meaning by colour. Is the text alternative there?
- Re-run axe on pages added since the last audit, not the ones already cleared.

### Output
1. Compliance summary by criterion
2. Barriers identified
3. Assistive technology notes
4. Remediation priorities
5. Recommendations

---

## HAT 8: NHS Digital Standards Reviewer

**Perspective:** NHS Service Standard, interoperability, clinical safety

### Criteria
- **NHS Service Standard:** the 14 points
- **NHS Design System:** patterns and components
- **Clinical Safety (DCB0129 / DCB0160):** has clinical risk been assessed, by a named CSO?
- **Interoperability:** FHIR and HL7 readiness, realistically
- **Terminology:** SNOMED CT, dm+d where relevant
- **Care Quality:** does it support CQC standards?

### Project-specific checks
- Hazard log in `docs/nhs-ready/03b-clinical-safety-hazard-log.md`: are the hazards specific to what the app actually does, and is anything new unlogged?
- The biggest live hazard class is content: a guide that is wrong, or right but out of date, gets copied into a patient record. Trace how that risk is controlled today.
- Where wardHub deliberately stops short of being a clinical tool (guidance not scoring, no calculators) and whether the UI makes that boundary obvious.

### Output
1. NHS standards compliance matrix
2. Clinical safety assessment
3. Interoperability readiness
4. Gaps and recommendations

---

## HAT 9: Training Coordinator

**Perspective:** onboarding, learning curve, documentation, support

### Criteria
- **Intuitive Design:** usable with minimal training?
- **Learning Curve:** how long to proficiency?
- **Documentation:** is the user-facing documentation any good?
- **Help Features:** in-app help, tour, tooltips, FAQ
- **Training Materials:** what is still needed
- **Support Model:** who answers the questions on a Sunday night?
- **Change Management:** moving off the current paper and Word-doc habits

### Project-specific checks
- The interactive tour, intro guide and FAQ. Do they describe the app as it is now, or as it was two sessions ago?
- `/quiz` as a training asset rather than a toy. Should it carry the same sign-off badge the guides do?
- `docs/user-guides/` and the printable handouts outside the repo: current?

### Output
1. Learning curve assessment
2. Training needs analysis
3. Documentation gaps
4. Support model recommendations
5. Rollout strategy

---

## HAT 10: Project Manager

**Perspective:** scope, progress, deliverables, risk, stakeholders

### Criteria
- **Scope:** defined and controlled, or expanding every session?
- **Progress:** where against the plan?
- **Quality:** are deliverables actually finished?
- **Risks:** identified and mitigated?
- **Dependencies:** external things being waited on
- **Stakeholders:** needs being met
- **Documentation:** adequate for a handover
- **Next Steps:** critical path

### Project-specific checks
- `docs/BACKLOG.md` is the single source of truth. Is it current, and is anything being worked outside it?
- Items blocked on Mike specifically, separated from items blocked on the Trust. These are different waits and get muddled.
- Scope creep is the standing risk here. Count what got added this period against what got finished.
- Any deadline in play (sponsor meetings, demos) and what genuinely has to be true by then.

### Output
1. Progress summary
2. Scope assessment
3. Risk register
4. Dependency analysis
5. Recommendations and next actions

---

## HAT 11: Clinical Content Editor

**Perspective:** is the content right, is it current, and can you prove where it came from?

This hat did not exist in v1.0, which was a gap. wardHub is now mostly content. Around 100 guides, a 900-plus question quiz bank, and hundreds of links. The code is in decent shape; the content is where the real risk sits.

### Criteria
- **Provenance:** can each guide be traced to a policy, SOP or public source?
- **Currency:** is the source still in date, and does the app know when it was last checked?
- **Approval state:** the traffic light in `src/lib/data/approval-status.ts` is Mike's editorial sign-off. What is the green / amber / red split, and is it moving?
- **Open markers:** `[confirm]` and `verify` flags waiting on an answer
- **Exact wording:** trust-approved forms must be reproduced exactly, never paraphrased. Add around them, do not alter them.
- **Conflicts:** where two trust documents disagree, is that surfaced or silently resolved?
- **Broken and placeholder links:** the long tail of `#` placeholder form links
- **Named individuals:** should a person's name be in the content at all?

### Project-specific checks
- Count the guides by approval colour and compare with the last evaluation. A red count that never falls is the real backlog.
- The policy dump is a snapshot. Never assert that a live trust policy is out of date on the basis of an offline copy.
- Guides that generate a case note: does the generated text hold up if the staff member answered nothing?
- Consistency of the settled content decisions, for example advocacy meaning IMHA only, and the correct provider per area.

### Output
1. Content inventory and approval split
2. Provenance and currency findings
3. Content risks, worst first
4. Items needing Mike or a subject expert, as a list he can work through
5. Recommendations

---

## HAT 12: Deployment and Operations

**Perspective:** what happens after the demo ends

### Criteria
- **Environments:** what exists, and what the URLs actually serve
- **Release process:** how a change reaches users, and what gates it
- **Configuration:** environment variables, secrets, defaults, hard-coded values
- **Monitoring:** would anyone know if it broke?
- **Backup and recovery:** what is recoverable, and from where
- **Data lifecycle:** what happens to stored data on rollback or teardown
- **Support and continuity:** who runs it, and the bus factor
- **Cost:** hosting and licence assumptions

### Project-specific checks
- Push to `main` deploys straight to production with no staging step and no automated gate. Say whether that is fine for now, and when it stops being fine.
- Hard-coded values with an expiry: pay scales that need updating each April, the shared site password, dated content.
- Blocked pipeline work and whether the blocker is technical or a licence. Do not re-propose something already parked for licensing reasons.
- Anything living outside the repo that the project depends on, and what happens if that drive goes.

### Output
1. Current deployment picture
2. Operational gaps
3. Continuity and bus-factor risk
4. Recommendations

---

## HAT 13: Patient and Carer

**Perspective:** the person on the receiving end of all this

### Criteria
- **Dignity:** how does it feel to be described by this app?
- **Transparency:** would a patient understand what is recorded and why?
- **Patient-facing content:** are the leaflets readable, accurate, not patronising?
- **Rights:** are advocacy, S132 rights and complaint routes easy for staff to act on?
- **Voice:** where does the patient's own wording survive into the record?
- **Equity:** does anything assume a patient who reads English, has a phone, or has family?
- **Indirect benefit:** does a staff member using this spend more time with patients or less?

### Project-specific checks
- Patient-voice quote fields in the care plan and safety plan builders. Are they real, or decoration?
- Read a generated case note as if you were the patient reading your own notes back. Does it sound like a person or a form?
- The patient-facing leaflet routes, checked for reading level and tone.

### Output
1. What a patient would value
2. What would concern them
3. Content and tone findings
4. Recommendations

---

## Closing section: Devil's Advocate

Not a hat, a required section. Argue the other side in plain terms:

- What is the strongest honest case that this should not be adopted?
- Which of our own claims would not survive a hostile question?
- What are we all quietly avoiding?
- If this failed twelve months after rollout, what would the post-mortem say?

Three to six blunt paragraphs. No hedging, no rebuttal. If this section reads comfortably, it has not been written properly.

---

## Report structure

```markdown
# Project Evaluation: [DATE]

## Executive Summary
[5 or 6 bullets. The findings, not the process.]

## Since the last evaluation
[Moved / still open / gone backwards. Name the stuck items.]

## Scorecard
[The full history table, one column per evaluation, plus RAG and direction.]

## Carried forward
### Recommendation ledger
[Every open recommendation ever raised, plus those closed since last pass.]
### BACKLOG cross-check
[Mismatches in both directions between the ledger and docs/BACKLOG.md.]
### Metric history
[One row per metric, one column per evaluation.]
### Standing decisions and parked items
[Settled positions, so nothing already ruled out gets re-proposed.]

## Verification Log
| Check | Command | Result |
[Build, tests, tsc, lint, audit, route count, git author, build flags.]

## Evaluation Details
### 1. Web Developer
### 2. Clinical User
### 3. Trust Senior Management
### 4. Information Governance
### 5. IT Security
### 6. UX Design
### 7. Accessibility
### 8. NHS Digital Standards
### 9. Training
### 10. Project Management
### 11. Clinical Content Editor
### 12. Deployment and Operations
### 13. Patient and Carer

## Devil's Advocate

## Consolidated Recommendations
### Critical (must do before any live use with real data)
### High Priority
### Medium Priority
### Low Priority

## For Mike
[Only the decisions and answers that need a human. Nothing Claude could have done itself.]

## Action Items
| Item | Owner | Priority | Target | New or carried over |
|------|-------|----------|--------|---------------------|

## Not verified this pass
[Honest list of what was skipped and why.]
```

Anything that Claude can just fix should be fixed in the same session and logged as done, not written up as a recommendation. An evaluation that generates fifty recommendations and zero fixes has failed.

---

## Running it in less than full

A thirteen-hat pass is expensive and only worth doing every few months. Smaller modes:

- **Focused pass:** three or four hats, usually 1, 4, 5, 11. Same evidence rules, same carry-forward.
- **Single hat:** "put on the IG hat". Write it as a deep dive, not a mini evaluation.
- **Delta check:** scorecard plus "since the last evaluation" only. Useful before a stakeholder meeting.

Deep dives get their own file: `YYYY-MM-DD_[hat-name]-deep-dive.md`.

---

## Files and archiving

- Full evaluation: `YYYY-MM-DD_project-evaluation.md`
- Deep dive: `YYYY-MM-DD_security-deep-dive.md`
- **The newest full evaluation is the record.** Because it carries the ledgers, older full evaluations can be deleted outright once it is written. Nothing in this folder needs keeping for continuity, only for provenance, and git holds that anyway.
- Deep dives are the exception worth keeping longer. They hold detail no summary table can carry, and no later evaluation reproduces them in full.
- Each report ends by naming every report it supersedes and the template version it was run against.
- If an older report is deleted before the new one has carried its content, that content is gone. Write the new report first.

---

## Change log

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 25 Jan 2026 | Original 10-hat framework |
| 2.1 | 29 Jul 2026 | **Each report now stands alone, so superseded ones can be deleted.** Read every prior evaluation and deep dive, not only the most recent. New ground rule 4 (self-containment, with a test to apply before finishing). New "Carried forward" section carrying three mandatory tables: the recommendation ledger (nothing leaves it by being forgotten), metric history, and standing decisions and parked items (so settled calls and licence-blocked work are not re-proposed). Scorecard now carries the full score history, one column per evaluation. Added a two-way cross-check against `docs/BACKLOG.md`, reported as mismatches. Archiving policy replaced: the newest report is the record, older full evaluations can go, deep dives are kept. |
| 2.0 | 27 Jul 2026 | Added the evidence and carry-forward ground rules, the verification log, and the scorecard. Three new hats: Clinical Content Editor, Deployment and Operations, Patient and Carer. Added the Devil's Advocate section, the "For Mike" and "Not verified this pass" report sections, and the reduced-scope run modes. Fixed stale references: project is wardHub not Inpatient Hub, roles are the current five plus the contributor flag, and there is no `/evaluate` command. Added project-specific checks to every hat so the framework points at this codebase rather than any codebase. |
