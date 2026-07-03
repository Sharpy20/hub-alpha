# wardHub — Homework To-Do (from Mike's answers)

> Built 3 July 2026 from Mike's marked-up homework doc.
> This is the master task list. We work through it in clusters; tick items as done.
> Status keys: `[ ]` todo · `[~]` in progress · `[x]` done · `[BLOCKED]` needs Mike · `[PARK]` deferred to own session

---

## ✅ Done in the 3 Jul quick-wins pass (verified in browser, typecheck clean)
- IMHA alignment (Decision 2) - dev panel + conflict audit marked resolved; app already correct.
- Risk tool: "Display clinical indicators" now shows on every domain (incl. physical health); questions gate off "no evidence".
- mha-statuses → Section 132 "Related guides" link.
- Consent buttons made per-guide: safeguarding-children now family-focused ("Family Discussed / Consents" / "Referring Without Family Consent"); adult safeguarding generic; IMHA wording preserved.
- Safeguarding S.42 stats text tweaked (referrals still logged / build a picture).
- arrange-mha-assessment: dropped the separate SystmOne step (folded into "send paperwork"), softened the nhs.net line.
- DAMA: added alternatives (short leave), out-of-hours discharge meeting, and the "unplanned = unsafe discharge → Datix" point.
- leave-discharge: Prenoxad consideration (leave + discharge) with a link to the Prenoxad guide; fire-board update item added to Day-of tasks.
- fridge-temps: "Mark completed for today" button at the end (works for any guide linked to a ward diary task).

**Still blocked on you (couldn't do without real values):** section-132 forms URL + MHA office email (Rule 4 - not Google-able); arrange-mha-assessment final wording for social care's secure email system name.

### Third batch - autonomous pass (3 Jul, browser-verified) - REVIEW THESE
You said "do anything you can, a little guessing is fine, I'll review later." All amber/red pending your check.
- **MOHOST explainer built** (`/guides/mohost`, new "OT Tools" group - now live, 61 guides). HoNOS-style: what MOHOST covers (6 areas/24 items), the F/A/I/R rating, why it suits MH, where it feeds; clearly flagged as an explainer, not the licensed tool. **You wanted better examples + to confirm the local OT form - still open.** Status amber.
- **Status rule applied:** seclusion-support-plan "good" → amber. section-17 already amber. (Green stays reserved for department sign-off once everything's ready.)
- **care-plan:** added word-bank prompts to the four thin sections (What matters / Keeping well / Risks / Review) so each box now suggests "what can go here".
- **observation-engagement:** added intimate-care observation guidance (shower/toilet - put specifics in the care plan) and a principle that patients on Level 1/2 rarely leave the ward and any leave needs MDT agreement. **Both flagged "verify against policy" - please check the exact wording.**
- **admission-note:** added an "Admitted to: [WARD], [UNIT]" line to the note + a prompt to record ward/unit (since names change over time). Placeholders, not guessed names.
- **safeguarding guides:** added the "tick 'Safeguarding relevant' on the SystmOne record" reminder to Safeguarding Adults, Safeguarding Children and Domestic Abuse. (The link to an S1 how-to is still to wire when we have it.)

### Second batch (also 3 Jul, pushed + browser-verified)
- **Medics Tools group created** - Mental State Examination moved there (filter shows it sitting between Nurse Tools and Restrictive Practice). "Medics Tools" and "OT Tools" both added to the editor's category dropdown.
  - **OT Tools note:** the group won't appear on the guides index until it has at least one guide (the index only shows categories that contain a guide). Tell me which OT tool(s) to seed it with, or I can draft a starter.
  - Only MSE moved (as you asked). HoNOS/clustering is a candidate for Medics Tools too if you want - say the word.
- **domestic-abuse-guide** - URLs are now clickable (added a general linkifier to how-to step content, so bare URLs in any how-to guide now link out). Answered "where's the DASH from": attributed to SafeLives (formerly CAADA) with a link; MARAC + support URLs made full clickable links. (Deeper spacing/related-resources polish still open if you want it.)

---

## 0. How we'll work
- Build list first (this doc), then work clusters to avoid drift.
- "Review-only" guides = Mike reads + tells us a colour; no code unless he flags a change.
- Colour changes go in `src/lib/data/approval-status.ts`.

---

## 1. Decisions (from Mike)

| # | Decision | Outcome | Action |
|---|----------|---------|--------|
| 1 | Merged builds (one address for demo) | **KEEP** | None — leave `COLLAPSED_FOR_DEMO = true` |
| 2 | IMHA Derby City source of truth | **Disability Direct** (One Advocacy no longer used) | `[x]` App already uses DDA everywhere; conflict-audit D1 + dev panel marked resolved. Only "One Advocacy" left is at source (the S132 policy PDF - MHA office to update) |
| 3 | Risk tool questions | Messy, big rethink needed — but 2 quick fixes below | see §2 risk-assessment |
| 4 | Formulation output | **Big rethink** — still 2 text boxes (one line-breaks, one big chunk), painful with a real patient | `[PARK]` dedicated session |

### 1a. Risk tool — quick fixes (do now, separate from the big rethink)
- `[x]` "Display clinical indicators" now shows on every domain (was hidden on physical health + only after a risk was picked).
- `[x]` Questions now gate off "no evidence" (nothing shows once a domain is signed off no-evidence); indicator chips only appear when answered Yes. **NB:** I read your note this way - please confirm it matches, as the risk tool still needs the bigger rethink.

---

## 2. Guides — actionable changes (code work)

### Legal & Advocacy
- `[ ]` **mha-statuses** — add link to Section 132 (reading patient rights) guide.
- `[ ]` **imha-advocacy** — confirm Disability Direct throughout (ties to Decision 2).
- `[BLOCKED]` **capacity-assessment** — needs expanding. Mike to share S1 questionnaire + police incident form.
- `[ ]` **dols** — make more user-appealing: flow chart / graphics / more interactive. (Open to ideas — propose options.)
- `[ ]` **arrange-mha-assessment** —
  - Fix "Send it securely (nhs.net to nhs.net)" — social care don't use nhs.net; they have their own secure email system. `[BLOCKED]` Mike to confirm which system, then reword.
  - Drop step 5 (document on SystemOne) — already covered by step 6.
- `[ ]` **section-132** — add link to the 132 forms + MHA office email address.
- `[ ]` **section-136** — currently basic. Decide: expand with FAQ section (force treatment? seclude? accept out-of-area? child/teenager?) or drop. Lean: expand well or leave.
- `[PARK]` **tribunal-report** — fact-check + rebuild on correct template (new version on gov.uk). Part of the big DST/tribunal/nursing-report/OT-report merged builder — its own session. **Keep reminding Mike.**

### Nurse Tools
- `[BLOCKED]` **NEW guide: Informal Patient Contract** — Mike to share info.
- `[ ]` **mh-talking-points** — rethink order/grouping; add alternative grounding/distraction techniques (currently all reuse the same 2, e.g. A-Z grounding). Propose options.
- `[ ]` **mental-state-exam** — move into a **new "Medics Tools" group** (next to Nurse Tools). Also create an **"OT Tools" group**. Broader goal: build up medics + OT representation.
- `[ ]` **abc-chart** — better example doc; link to blank; more interactive/fun (currently wall of text); consider a builder. `[BLOCKED]` Mike to find a current ABC chart to confirm builder viability.
- `[ ]` **care-plan** — add more prompting on what goes in each box.
- `[ ]` **honos** — add a screenshot showing how to make the S1 tool suggest a cluster. `[BLOCKED]` Mike to supply screenshot.
- `[ ]` **named-nurse** — big build: tile out each task in the weekly/monthly lists; each task → open its guide (if one exists) + let user schedule it as a task; mark done on the patient's job list (cross-reference patient task list).
- `[ ]` **admission-checklist** — fix links: some go to Mike's personal SharePoint (bad for go-live); some should link to wardHub guides we've built but aren't wired yet.
- `[ ]` **admission-note** — add details of the ward/unit being admitted to (names change over the years — future readers get lost). Content-heavy/boring — brainstorm how to improve.
- `[ ]` **leave-discharge-transfer** —
  - Under leave & discharge: add "Substance use / intoxication risk on return considered — has Prenoxad been considered? yes/no" → offer link to Prenoxad guide.
  - Under Day-of tasks (nurse in charge): add "update fire board as out, and when due back".
- `[ ]` **dama** — if out of hours, offer to arrange a discharge meeting with the ward's regular medics + MDT for proper discharge planning (meds + community follow-up). State: an unplanned discharge = an unsafe discharge regardless of medical advice → needs a Datix. Suggest alternatives (e.g. short period of leave).
- `[ ]` **fridge-temps** — relates to a ward diary task. Add a "Mark completed for today" button at the end of the guide that marks the job off in the diary, regardless of how the guide was reached.

### Restrictive Practice
- `[ ]` **restraint-monitoring** —
  - Under "why was it necessary & proportionate": add an image (right of text) explaining the definition of reasonable force + the law it relates to.
  - Confirm post-restraint monitoring is correct (currently in example text — get it right). `[BLOCKED]` verify against policy.
  - "What holds/positions were used" — add images explaining core skills. `[BLOCKED]` Mike to dig out images.
  - "Monitoring ceased" — build a clickable workflow; once all steps are green, the output becomes green.
- `[ ]` **observation-engagement** — add advice to include specifics in the care plan (e.g. how closely to observe during showering/toilet). Add: per policy it's rare for level 2 or 1 to leave the ward and must be agreed with MDT first. `[BLOCKED]` fact-check + quote the policy.
- `[ ]` **debrief** — check the section headers match the real debrief tool. `[BLOCKED]` Mike to confirm correct headers.
- `[ ]` **blanket-restrictions** — add links to the trust guides / patient leaflets.

### Safeguarding
- `[ ]` **Cross-guide note** — on all safeguarding guides: after documenting anything safeguarding-related on S1, remind to click "safeguarding relevant" at the bottom of the record → link to an S1 how-to for this.
- `[ ]` **safeguarding** — tweak the S.42 threshold stats text: even if a referral isn't taken up this time, it's logged and helps services build a picture / spot other risk factors.
- `[ ]` **safeguarding-children** — "explore/discuss with family": copy talks about family consent but the two buttons are about *patient* consenting. Fix the mismatch.
- `[ ]` **domestic-abuse-guide** — make URLs clickable; the CADDA-DASH risk assessment — source it + link if possible; text-heavy — improve spacing + related resources. `[BLOCKED]` confirm DASH source.

### Physical Health
- (prenoxad, transfer-in — IN DEV, review; no specific change requested yet)

---

## 3. Guides — review-only (Mike reads, then we set a colour)

No code unless Mike flags something. He signs off by telling us `set <id> to <colour>`.

**Already approved:** s117-meeting (green).
**Marked "good" / "fine" (candidates for green on his word):** section-17, seclusion-support-plan.

**Awaiting his read:** mha-checker, mental-state-exam*, mh-talking-points*, care-plan*, named-nurse*, admission-checklist*, fridge-temps*, safeguarding*, safeguarding-children*, domestic-abuse-guide*, peer-conflict-guide, non-recent-abuse, escalation-pathway, online-safety-children, honour-based-abuse, modern-slavery-radicalisation, faith-belief-abuse, send-safeguarding, special-guardianship, child-in-need, information-sharing, picu, homeless-discharge, social-care, benefits-review, dietitian, physio, ot, speech-therapy, news2, tissue-viability, dental, edt, erp, ctr-dsp.

(* = also has a code change listed in §2; do the change, then he reviews.)

**Note for later:** once Legal & Advocacy guides are agreed, Mike sends them to the MHA office for official sign-off.

---

## 4. Side quests
- `[ ]` **Diary-task audit** — look through all guides; which others relate to diary tasks (non-patient ward tasks, like fridge-temps)? Wire "mark done" buttons where it fits.
- `[ ]` **Printable clue cards** — one card per guide (header + 1 sentence), 4 per A4, one A4 sheet per group. So Mike can physically lay them on a table to re-group/re-order.
- `[BLOCKED]` **NEW guide: No smoking in the trust** — why staff must enforce; smoking paraphernalia returned only on discharge, not for fresh air/leave. Mike has some existing work for this somewhere.

---

## 5. Quiz
- `[ ]` Add a "report issue" option to each question's feedback → generates an item in the (reddit-style) feedback section when live.
- Still DRAFT until Mike proofreads the question bank.

---

## 6. Parked ideas (remind Mike, don't action)
- `[PARK]` **Combined builder** — DST/CHC funding assessment + nursing placement assessment + tribunal nursing report (+ OT report). Shared domains → capture evidence once, copy each document out. Big; its own session. Ties to tribunal-report above.
- `[PARK]` **Formulation output rethink** (Decision 4).
- `[PARK]` **"Build your own landing page"** option in settings (personal bookmark wheel covers part of this for now).

---

## 7. New groups to create (from mental-state-exam note)
- `[ ]` "Medics Tools" group.
- `[ ]` "OT Tools" group.
- Move mental-state-exam → Medics Tools. Populate both over time.
