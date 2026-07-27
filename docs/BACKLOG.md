# wardHub - Master Backlog

> Single source of truth for outstanding work, so nothing is lost between sessions.
> Started 4 Jul 2026. Work happens in focused sessions that read this file first.
> Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[BLOCKED]` needs Mike · `[PARK]` deferred

Related task docs (roll findings into here over time):
- `docs/homework-remaining-03-Jul-2026.md` - guide reviews, blocked-on-Mike items, big builds
- `docs/homework-todo-03-Jul-2026.md` - the worked-through homework detail
- `E:\Hub\temp\focus-referral-links-04Jul2026.md` - real FOCUS URLs behind the friendly link text
- `E:\Hub\temp\focus-referral-criteria-notes-04Jul2026.md` - FOCUS internal referral criteria

---

## ✅ DONE 27 Jul 2026 - Trust-policy quiz batch (was NEXT UP)
The `/quiz` bank was ~95% national guidance. It is now **942 questions across 43 topics, 574 of them
(61%) mined from 117 distinct Derbyshire Healthcare documents** in `E:\Hub\Policy dump not for git hub\`
(483 files). 17 `research-trust-*.json` batches, all wired into `src/lib/data/quiz/index.ts` and live.
Trust topics lead the topic picker. Questions whose source copy was near or past its stated review
date show a quiet "check FOCUS for the current version" line after you answer (`reviewFlag`).
**Mike's steer 27 Jul: do NOT chase the overdue-review questions** - the offline policy dump is a
snapshot, so "overdue" reflects our copy, not necessarily the live document. Revisit after the
refresh, see Section L.
- **Reusable pipeline:** `scratchpad/docx2txt.js` (zero-dep docx extractor - no Python on this box),
  `scratchpad/TRUST-QUIZ-BRIEF.md` (agent brief - mine LOCAL detail only), `scratchpad/gen-quiz-md.js`
  (regenerates `docs/quiz-question-bank.md`). Add a batch file, rerun the generator, add an import.
- **5 questions deliberately omitted** where two trust documents give different answers, plus one
  overtaken by a system change (the Brigid app now does amend/remove observation levels).
- **⚠ FOR MIKE:** `E:\Hub\quiz-policy-conflicts.md` (kept OUTSIDE the repo) lists every conflict, stale
  document and gap found while reading the library - including **no flumazenil / benzodiazepine
  reversal pathway anywhere in the 5 rapid tranquillisation documents**. Worth raising with pharmacy.
- **Still to do:** Mike to proofread `docs/quiz-question-bank.md`. No sign-off badge on /quiz yet -
  decide whether it should carry the traffic-light status like the guides do.

---

## A. FOCUS form-link wiring (NEW, 4 Jul - high value, don't lose)
Real FOCUS URLs now captured (temp link map). These fill the long-standing "86 placeholder
`#` form links" in the referral guides. Wire each as an "On FOCUS (login needed)" chip
(existing FocusLinks pattern). Public ones (derby-talk, Living Well, perinatal portal) show openly.

> **4 Jul progress (commit 65e24a8):** wired the 3 referral guides that already exist -
> **dietitian, physio, ERP** - with their real FOCUS URLs. Also enhanced the guide viewer so
> blank-form + other-guide tiles render `form.note` and show a "Blocked in demo" badge for
> dead `#` links (was only blank forms + wagoll). The rest below need the guide BUILDING first
> (they have no workflow yet) - that's a bigger job (full referral template + criteria), left for Mike to prioritise.

- [ ] **NEW GUIDE needed** Autism assessment <- Autism Referral Form (`/download_file/view/9204/685`) + AQ50 (`/download_file/view/1124/685`)
- [ ] **NEW GUIDE needed** CAMHS <- CAMHS SPOA form (`/9315/685`) + Triage & Assessment Operational Policy (`/9478/685`)
- [x] ERP / emotion-regulation <- leaflet (`/9591/685`), referral form/flowchart/guidance v12 (`/9592/685`), checklist (`/9593/685`) - WIRED
- [x] Dietitian guide <- Referring to Dietetics via SystmOne (`/9465/685`) - WIRED
- [ ] **NEW GUIDE needed** ECT <- policy (`/9238/685`), anaesthesia policy (`/9237/685`), consent form 1 (`/2059/685`), consent form 4 (`/2060/685`), how-to (`/9239/685`) [ECT fasting/post-ECT content also in `_DIGEST.md` odds p3-5]
- [x] Physiotherapy guide <- MH Physio external referral form (`/9363/685`) + leaflet (`/9364/685`) - WIRED
- [ ] **NEW GUIDE needed** Perinatal <- community referral form (.docx, trust site), Beeches referrer guide (`/10045/685`), community referrer guide (`/10047/685`), referral portal (perinatal.cpms.necsu.nhs.uk)
- [ ] **NEW GUIDE needed** Specialist Day Services <- referral diagram (`/2411/685`) + 4 group leaflets (Living Well 1134, CST 1132, Lifestyle Matters 1133, Coping w/ Emotions 2410)
- [ ] **NEW GUIDE needed** Discharge Liaison / placement <- DLT referral form (`/9715/685`) (NB: distinct from the existing EDT guide - do not merge)
- [ ] Talking Therapies references -> https://derby-talk.co.uk/for-professionals/ (and confirm Vita/Everyturn wording everywhere)
- [ ] CMHT / Living Well references -> Living Well Operational Policy (.docx) + livingwellderbyshire.org.uk
- FOCUS base host to prepend: `https://focus.derbyshirehealthcareft.nhs.uk`
- Forensic links: EXCLUDED from demo per standing flag.
- Rule 4: internal `@nhs.net` team inboxes / mobiles / extensions stay OUT of the live build.

## B. Service map (/service-map) - status + follow-ups
Built this session: ~109 demo services, 12 type clusters, node-off-node branching + parent-closed
cutoff, public contacts in detail panel, search, and real FOCUS criteria folded in (CMHT/Living Well,
ERP in/exclusions, autism assessment, + new Day Services/DLT/MH Physio). Standalone page, not in nav.

- [x] **Zoom + pan added** (4 Jul eve, commit 6999d8f) - wheel-to-cursor zoom, zoom buttons, drag-to-pan.
- [x] **Area = where the person LIVES made explicit** (commit c3ab1c5) - `areas[]` documented as residence-catchment (not service location); new `catchmentNote` per service (home address vs registered GP); UI reworded. New "Pregnant/<24m postpartum" profile flag.
- [~] **Per-service research** - key ~11 local services now researched from their own sites + criteria/catchment corrected (Talking Therapies, Living Well/CMHT, Eating Disorder, Cranstoun/DRP substance, Perinatal, Safe Havens, Adult Autism, Op COURAGE, Age UK). REMAINING ~90 services still illustrative demo - need further research rounds; each still marked "to be clinically verified".
- [ ] Tighten remaining criteria from FOCUS (CAMHS pathways, condition charities, etc.) - best-effort now, "verify".
- [ ] Decide real home: a button on the patient profile ("what's open to this person"), pulling approved dated facts instead of manual toggles (full-build/PII feature).
- [ ] Refinement idea: a child off an "unknown" (not just "closed") parent still shows open - consider inheriting parent state.
- [ ] Sweep other FOCUS sections for more services/links (Mike logged in; only did /clinical/referrals).
- [PARK] Real vs demo: criteria stay illustrative until the full research/sign-off pass.
- [ ] **Postcode / GP-surgery lookup (Mike, 4 Jul)** - some teams allocate by **GP surgery location**, others by **home address**; build a checker that takes a postcode (and/or GP surgery) and tells you: Derby **City vs County**, which **AMHP team** to call, which **CMHT**, and the **S117 responsible authority**. Build it into the "which services are accessible" tool (this service map / town-map). **Data now fully in hand** (Part 1 of `_CONTACTS-INVENTORY.md`): every CMHT's complete GP-surgery list + numbers, the Derby City Team B/C split, and the city/county AMHP + social-care split. KEY RULE captured: CMHTs route by **registered GP surgery**; AMHP + social care route by **home address** (city vs county); S117 by authority-of-residence-when-sectioned. GP-surgery -> CMHT is a clean static table; city/county needs a postcode -> local-authority resolver (static boundary table for demo, or postcode API live - Rule: check before sending anything out).

## C. Guides - review + edits (from homework, condensed - see homework-remaining doc for detail)
- [x] **Update live payslip guide + hidden roster guide with the verified AfC facts (10 Jul)** - DONE same day (commit e8a7833): payslip guide now 15 steps incl. para 2.11 whole-shift rule; roster guide data updated while hidden. Spec below kept for reference. -
  mirror what the offline printables in `E:\Hub\printable-guides\` now have: the Band 5 rate
  windows table (nights 20:00-06:00 + all Sat = +30%; all Sun + public holidays = +60%, not
  stacked; lower bands higher), a new "whole-shift rule" step (TCS Handbook Section 2 England
  para 2.11 - more than half a weekday shift in 20:00-06:00 = whole shift enhanced, verified
  real + current), why one night shift feeds two payslip lines (midnight split), enhancements
  pay ~a month in arrears, "AfC Absence" = average-enhancements top-up on leave (S13.9), and
  overtime basics (1.5x / 2x public holidays, bands 1-7, part-time plain time to 37.5h, TOIL
  3-month rule). Fictional figures ONLY. Roster guide is hidden (catalog line commented) but
  update its data anyway so it is current whenever it returns.
- [ ] **Pay/roster split follow-ups (13 Jul):** pay-roster split into 3 live guides (payslip 17 steps + band picker / roster 11 / leave-absence 9, all RED). Outstanding: (a) Mike sign off all three; (b) confirm Trust absence figures for the leave-absence "[confirm]" markers via Copilot Policy Checker (carers leave, bereavement days, phased-return pay); (c) tell Tess the band picker is now actually built (he told her it existed on 10 Jul); (d) 48h opt-out legal reading still to settle with Tess (guide keeps her safe wording); (e) ~~printables outdated~~ DONE 13 Jul: new `leave-absence-rest-survival-guide.html`, roster + combined patched (corrected 48h + full rest limits), disclaimers on all four; (f) band picker salaries hard-coded to 1 Apr 2026 scales - update each April (`PayBandPicker.tsx`); (g) **obtain the DHcFT Health and Attendance Policy** (phased-return terms) from FOCUS or the Trust Teams policy collection - the guide's phased-return line is still generic; (h) **48h step now uses the corrected legal wording** (opt-out = the 17-week AVERAGE itself; no single-week cap; rest rights never waivable) - this supersedes Tess's email version, Mike to square it with her when signing off; (i) **make the pay guides less text-heavy** (Mike, 13 Jul) - delivered: band picker, rates-at-a-glance table, shared FAQ accordions (pay-faq.ts), SHIFT CHECKER (enhancement split + whole-shift rule + pay estimate + 11h rest verdict, payslip guide step 9). Also delivered: TL;DR "In a hurry" banners on every step + a "Show references" toggle (Harvard superscripts, off by default) with numbered sources. Also DONE: **interactive "payslip decoder"** (commit 0d677a0) - fictional Band 5 payslip, 15 clickable rows, explanations + ticks + progress counter, self-consistent figures. The whole pay-guide interactivity suite is now built. Remaining optional: pay/roster topic added to /quiz (364-question infra already exists).
- [ ] **Pay/roster session 37 wrap (14 Jul) - what happened + what's left:** DONE this session - 4th guide `/guides/pay-roster-faq` (FAQ+jargon extracted, payslip trimmed to 17); TL;DRs + "Show references" toggle; **rest content REFRAMED** (was over-claiming "breach"/"can't opt out" - now WTR reg 21(c) hospital exception + reg 24 compensatory rest, kept light); **SATURDAY-NIGHT PAY SETTLED** - Mike was sure Sat nights pay 60% whole-shift; his anonymised bank payslips PROVED clock-split at midnight (Sat night = ~3h @30% + ~7.5h @60%), shift checker was already correct, added a Sat-vs-Sun worked example; **band selectable in the shift checker** (was stuck on picker's band); **print system** - guide viewer Simple/Full-colour/Choose-sections with **band figures in the payslip printout**; new `src/lib/utils/printDoc.ts` (`printClinicalDoc` + `printChecklist`, hidden-iframe, NHS-styled, IG footer) wired to MSE/care-plan/risk-RMP "Print" and the **admission checklist paper-handover print** (fixed a bug where the old window.print hid all the tick boxes). STILL OPEN (my side): leave-discharge-transfer checklist print (1-line `printChecklist` call), shift-checker result in the payslip printout, pay/roster /quiz topic. MIKE'S HOMEWORK: sign off ALL red pay guides (payslip/roster/leave-absence/pay-roster-faq); tell Tess band picker is real + the 48h wording change; upload Special_Leave_Policy.docx to SharePoint (Section J4); get the Health & Attendance Policy (phased-return); bin the anon payslip CSVs in Temp.
- [ ] Review-only sign-offs: ~47 amber guides for Mike to read + colour (green needs dept sign-off).
- [~] Items needing Mike's docs/photos: **MOSTLY SUPPLIED 4 Jul** in `docs 1\` - see Sections F-I. Still blocked: MHA office email; social-care secure-email name; restraint holds images (Mike to photograph).
- [ ] **Capacity assessment guide - make interactive (Mike, 25 Jul)** - choices made while working through the guide should alter the final case-note output (same family as the shift checker / payslip decoder interactivity).
- [ ] **ERP referral - swap the SV2 form link (Mike, 25 Jul)** - remove the "SV2 Referral Form" link from the ERP workflow's forms step (`referral-workflows.ts` ~line 1104, currently a `#` placeholder) and replace with a link to refer to ERP itself.
- [ ] **SV2 own guide? (checked 25 Jul: NO)** - SV2 has no guide; it only exists as a service-map entry ("SV2 (Sexual Violence, Derbyshire)", 01773 746115) plus the stray form link in the ERP workflow above. Decide whether SV2 deserves its own referral guide when doing the ERP edit.
- [ ] mh-talking-points: reorder/group + add alternative grounding/distraction techniques (needs Mike's steer on grouping).
- [ ] OT Tools: confirm the local OT form (MOHOST vs local); improve MOHOST examples.
- [ ] section-136: expand with FAQ vs leave (Mike's call).

## D. Bigger builds (each its own session)
- [ ] **Contacts directory - single source of truth (Mike, 4 Jul)** - one central contacts store; an **editor-role** edit to a contact updates it **everywhere it appears** (guides, service map, links, CMHT lists, referral submission steps). Design notes:
  - Data model per contact: `id`, `name`, `type` (CMHT/crisis/social-care/AMHP/IMHA/MHA-office/ward/team...), `phone`, `email`, `area` (city/county/all), `public` vs `internal` flag (Rule 4: internal = "Hidden in demo mode", real value in a protected field), optional `focus`/notes, `lastReviewed`.
  - Everything references contacts **by id**, not inline copies, so one edit propagates. (Same pattern as approval-status / RMP-chips maps.)
  - For edits to show for **everyone** (not just one device), needs a persistent store = full-build/Supabase; localStorage-only would be per-device. Note this when scoping.
  - **Seed inventory ready:** `E:\Hub\temp\dump july\extracted\_CONTACTS-INVENTORY.md` (kept out of repo - holds internal numbers). Compiled 4 Jul from today's docs + the `MH Helpline Pack` (`E:\Hub\temp\MH Helpline Pack - Great for signposting.pdf`). Has ~60 contacts: 8 CMHTs, crisis teams, AMHP, social care, MHA office, IMHA, ECT, chaplaincy, IAPT, + national helplines by category (MH/dementia/abuse-DV/addiction/bereavement/crime/eating/LD/parenting/carers). Each tagged [PUB]/[INT]/[VERIFY].
  - **Reconcile with existing /links** - many [PUB] helplines are probably already bookmarks; directory should be the single source, not a duplicate. Audit links data when building.
  - **[VERIFY]:** the helpline pack is V29 (Jun 2020) - confirm pack-only numbers before live; Talking Therapies is now derby-talk.co.uk.
  - Pairs with the postcode lookup (Section B) which reads from this directory.
- [PARK] Named Nurse Checklist -> schedulable tasks ticking off on the patient job list.
- [PARK] Tribunal / DST / OT-report combined builder (ties to the DLT/CHC funding finding in A/B).
- [PARK] Formulation output rethink.
- [PARK] Risk tool rethink (beyond the quick fixes done).
- [PARK] DoLS - more visual/interactive.
- [PARK] Service "town map" -> full patient-profile integration (see B).

## E. Side quests / smaller
- [ ] **Guide freshness vs source policy (Mike, 25 Jul - EXPLORE, no action yet)** - flag a guide when the policy it was written from is due for renewal, or better, detect that the policy has been UPDATED since the guide was written and request a review. Ideas to explore when we pick this up: store `sourcePolicyName` + `policyVersion`/`policyReviewDate` + `guideWrittenDate` per guide (could live alongside the approval-status map); compare against the 472-policy SharePoint Trust Policy Library (Copilot Policy Checker / Content Auditor agents could do the periodic check since Claude can't reach the tenant); surface as a badge on the guide tile ("source policy updated - review needed") and/or auto-flip the traffic-light status back to amber. Pairs naturally with the contacts directory's `lastReviewed` idea (Section D).
- [x] **Print on guides** (4 Jul eve, commits 7c4f9c1 + be77d18) - Print button on every how-to guide, referral workflow and thinking-guide, rendering all steps/sections from the SAME data so future edits flow through. Reusable `downloads` field + printable blank forms (police capacity, ABC chart). Builders (risk/care-plan) skipped - they already copy out.
- [ ] Quiz: add "report an issue" per question (feeds feedback board).
- [ ] Printable guide "clue cards" (title + 1 line, 4/A4, per group) for physical re-grouping.
- [ ] Diary-task audit: which other guides map to a ward diary task (like fridge-temps) -> add "mark done" buttons.
- [ ] New guides Mike flagged: informal patient contract; no-smoking-in-the-trust (Mike has material somewhere).
- [x] **Student Nurse Placement guide** (side quest, 4 Jul, commit 9f09614) - new "Learning & Development" category, built demo-safe from `dump july\Student Information Pack.docx` (real ward/staff names + internal numbers stripped). RED pending Mike's review. New category has one guide for now; move to Nurse Tools if a dedicated category feels heavy.
- [x] **Discharge-barrier flag on tasks (Optica-inspired, Mike 4 Jul)** - BUILT Session 35 (8 Jul): `blocksDischarge` on patient tasks + appointments, set via add-task/bulk/detail modals, surfaced in PatientTasksModal, patient cards, /reports and the /overview trust roll-up (22 Jul). STRATEGIC: this is the bridge that makes wardHub the ward-level capture layer feeding discharge-flow tools (e.g. Optica) upward - positions wardHub as complementary, not a rival.
- [ ] **Bed-management upgrades to /overview + /reports (explored 25 Jul, ranked)** - core pitch confirmed: a barrier = an outstanding flagged task, so the data is a live byproduct of the diary where jobs get done (no SystmOne feed, no double-entry; completing the task clears the barrier automatically). Gaps found, in build order:
  1. **Barrier categories** - "most common barriers" groups by free-text task title, which will be mush with real data ("Chase social care" vs "chase SW"). Add a small optional dropdown at flag time (housing / social care-package / funding-DST / family-legal / internal clinical / transport-equipment / other), ideally mapped to national delayed-discharge reason language.
  2. **Days blocked** - derive "blocked N days" per patient from oldest open flagged task's `createdAt` (zero input); show on /overview blocked list + sortable /reports column, worst first.
  3. **Ours vs theirs** - derive internal/external from category (1): headline "X of Y barriers waiting on external partners". Strong sponsor line.
  4. **Drill-down** - /overview ward rows -> /reports pre-filtered (ward + barriers only).
  5. **Bed-meeting print sheet** - one-page printable /overview via `printDoc.ts`.
  6. **Trend sparkline** - needs persistence; demo could passively tally daily counts in localStorage (per-device only), real answer = Supabase full build. Be honest about the limitation.
  7. **[DECISION for Mike] Estimated discharge date** - real bed management wants EDD vs barriers, but EDD is genuinely NEW input (breaks the no-double-entry constraint). Only if it's a date already stated at ward round, entered once.
- [ ] **Read-only MDT / external task view (Optica-inspired, Mike 4 Jul)** - give the wider MDT read-only visibility of a patient's tasks, and (with consent) external partners like social care/family - potentially via links to the patient's existing MS Teams MDT workspace (reuses infra, avoids building an auth layer). Full-build/PII; consent + lawful basis required (real PII sharing).
- Strategic context for both: [[optica-governance-insight]] - the Optica demo showed the org WILL accept data-outside-S1 + external access when it is governance-wrapped (DCB0129, data-controller, DPIA). wardHub's approval path is the wrapper, not "store no data".
- [x] **Tasks: replace Delete with "Mark in error" (Mike, 10 Jul) - DONE same day (commit 06bec8a).**
  `inError`/`markedInErrorBy`/`markedInErrorAt` on BaseTask; provider's `tasks` excludes in-error
  (every view/count skips them automatically) + `allTasks` for audit; two-tap "Mark in error"
  button in TaskDetailModal; repeating-task Delete now marks in error; Reports page gained a
  collapsible "Tasks marked in error" audit section with one-click Restore. Verified end-to-end.

### Full E:\Hub source sweep (4 Jul) - gap check vs the 66 guides
Cross-referenced every .docx/.pdf/.pptx across E:\Hub against the current guide catalogue. **Coverage is strong** - almost every clinical topic already has a guide, is tracked in Section A (referral form-wiring / new-guide-needed: autism, CAMHS, ECT, perinatal, day-services, DLT), or is a parked build (Red Folders, DST). Psychoeducation docs (PD types, Window of Tolerance, Abandonment) are already covered by the 23 patient-guides. **Genuine gaps found (source in hand, no guide):**
- [ ] **STOP AND WATCH** (`temp/wardhub docs/STOP_AND_WATCH_Poster_Word (2).docx`) - early physical-deterioration soft-signs tool (S/T/O/P + AND + W/A/T/C/H), sits *before* NEWS2 triggers. Strong small Physical Health guide; full content captured. Complements news2.
- [ ] **Bowel monitoring / chart** (`temp/wardhub docs/Bowel-chart.doc`) - bowel-chart tool; real safety issue (clozapine/antipsychotic constipation; STOP-AND-WATCH flags "no bowel movement in 3 days"). Small Physical Health guide.
- [ ] **Nearest Relative (MHA s26-30)** (`temp/wardhub docs/Nearest_Relative.pdf`) - who the NR is, their rights, county-court displacement. Fold into `mha-statuses` or small standalone Legal & Advocacy guide.
- [ ] (Optional) **CTO guide** - `Community_Treatment_Order_Policy_MHA_1983.docx` exists; CTO currently only partial in mha-checker/mha-statuses. Dedicated guide is optional (lower priority).
- Note: `Nurses_checklist.docx` (MHA papers acceptance checklist) = already covered by `mha-checker`, and is the source for the **rectifiable-vs-invalid errors** enhancement (papers-complete? = invalid if No; names/addresses = rectifiable; med recs <=5 clear days apart; joint rec both doctors present). Feeds mha-checker snag 196.
- Excluded (Mike's standing flag): **MAPPA** (`MAPPA_Policy...2025.docx`) - forensic-adjacent, parked/do-not-surface. Not guide material: AI policy, CQC leaflet, business-case/demo/dev-panel docs, DCB0129 clinical-safety docs, `from trust other example projects`.

---

## J. Copilot agents - work-side queue (Mike, 10 Jul 2026)
All done AT WORK in M365 Copilot / Teams, not in this repo. Context: [[focus-download-and-copilot-agents]] has the agent inventory + the Policy Checker retest that gates item 1.

1. [x] **DONE 10 Jul (Claude via Mike's browser):** Policy Checker RETEST PASSED (2 questions,
   verbatim quotes + citations from the Trust Policy Library - the 9 Jul zero-results were
   ingestion lag as suspected). Content Auditor Knowledge pointed at the library and updated.
   Duplicate "wardHub Directory Curator" draft DELETED. Old Dec "Policy Navigator" DELETED.
   All 6 agents published and settled - no SharePoint-native fallback agent needed.
   NOTE for Mike: wH Quiz Writer shows "Pending changes" in Agent Builder (an unfinished edit
   of yours?) - open it and Update or discard.
2. [x] **DONE 10 Jul:** Guide Builder safety net + TEMPLATE C (Explainer / Learning guide) added
   to the LIVE agent instructions and published; same text added to
   `E:\Hub\Copilot-Guide-Builder-Kit.md` so the take-to-work kit matches.
3. [x] **DONE 10 Jul:** "Meet the wardHub AI agents" page PUBLISHED on the wardHub SharePoint
   site: `https://nhs.sharepoint.com/sites/msteams_af07eb/SitePages/Meet-the-wardHub-AI-agents.aspx`
   - what an agent is, where Agent Builder lives, 8-step build walkthrough, every toggle,
   knowledge sources, ingestion-lag warning, and FULL verbatim instructions for all 6 agents.
   Source of truth kept in repo: `docs/nhs-ready/12-meet-the-agents.md`.
   STILL FOR MIKE: pin the page as a tab in a Teams channel if wanted (page is on the site,
   not yet a tab), and give it a skim before pointing stakeholders at it.
4. [ ] **Upload Special_Leave_Policy.docx to the SharePoint Trust Policy Library (Mike, at work).**
   Missed in the big FOCUS auto-download; Mike found it 13 Jul and saved it to
   `E:\Hub\Policy dump not for git hub\Special_Leave_Policy.docx` (v7, issued 10 Jul 2024,
   review 31 Jul 2027). Until it is in the library, the Policy Checker / Content Auditor
   agents cannot see it. Its figures are ALREADY baked into `/guides/leave-absence`
   (bereavement 5 days paid, end-of-life 6 weeks, domestic 10 days, carers 1 week unpaid) -
   after upload, ask the Policy Checker to verify that step as a test.
5. [ ] **CONFIRM mode for the content agents (do NOT start before 30 Jul).** The wH Quiz Writer and
   Guide Builder both only CREATE - neither can check whether existing content still matches the
   current policy, so every refresh means re-reading by hand. Add a confirm mode that returns
   CONFIRMED / CHANGED / NOT FOUND against the document in front of it. Full instruction sketch,
   the guide-side blocker and the traffic-light payoff: **Section L, items 3 and 4**.

## K. Repo clean + publish pipeline + SharePoint handover readiness (DEADLINE: meeting Thu 30 Jul, 1:30pm)
Agreed 21 Jul (extended same evening). Goal: all raw trust material out of GitHub and onto
SharePoint, the guide publish pipeline LIVE and demonstrable, repo ready to hand to the
data team the moment traction lands - "no waiting on Mike".

### The three-stage model (Mike's framing, confirmed)
1. **Current** - Claude did the heavy lifting and saw everything; guides are demo-safe by
   discipline (Rule 4), not by architecture.
2. **Presentation (target for 30 Jul)** - mimic full production: SharePoint = authoring
   home, Supabase = stand-in for the trust's own datastore, pipeline live. No placeholders
   on screen, nothing sensitive actually leaked.
3. **Production** - up to the trust: their hosting, their auth, their database (or a direct
   SharePoint/Graph wire once IT grants an app registration).

### Architecture decisions (21 Jul)
- **SharePoint cannot serve the public site directly** - needs an Azure AD app registration
  + trust IT admin consent = a Production-stage decision. Same applies to upgrading the
  site gate to NHS auth. Neither can/should happen by the 30th.
- **⛔ AND THE PUSH ROUTE IS ALSO CLOSED (checked 27 Jul).** The site cannot PULL from a
  private SharePoint library without credentials, so the obvious workaround was to have
  SharePoint PUSH instead: a Power Automate flow runs inside the tenant as Mike, already has
  permission to read the library, and needs no app registration. **Mike's licence is "Power
  Automate for Office 365" - Standard connectors only. Premium and Custom connectors are both
  unavailable, and the HTTP action is premium.** So a flow cannot call out to wardHub or
  Supabase at all. No standard connector reaches an arbitrary web endpoint.
  - **Surviving options, cheapest first, all deferred:** (1) check whether the tenant permits
    **anonymous "anyone with the link" sharing** - if it does, the site can fetch a published
    file directly with no auth and no licence (free, but NHS tenants usually disable it, and
    it is a governance conversation in its own right); (2) ask IT for the **Power Automate
    premium add-on** - a per-user licence ask, far smaller than an app registration;
    (3) **manual publish** - Mike pastes into a gated form in wardHub (the original plan);
    (4) full app registration at Production stage, which was always the real answer.
  - **Do NOT re-derive this.** The constraint is the licence, not the code.
- **Pipeline = SharePoint (authoring) -> Mike presses publish -> Supabase (site datastore)
  -> site renders server-side.** Repo holds ONLY scaffold/fetch code, zero guide content.
  Supabase write keys live in Vercel env settings, never in the repo or Claude's workspace.
  **The pipeline IS the privacy boundary** - internal-only content may only enter guides
  once it exists (until then Rule 4 holds).
- **Scope control:** the 66 existing guides STAY static (migrate later, on a schedule).
  Pipeline goes live for NEW guides; demo it end-to-end with 1-3 guides.
- **Fictional-detail rule (NOT cosmetic - load-bearing):** until trust auth + approval,
  anything published through the pipeline uses realistic-but-FICTIONAL internal details
  (e.g. a plausible fake nhs.net inbox). Keeps "no placeholders" AND "nothing leaked" both
  true, and keeps the Supabase governance answer bulletproof.
- **Supabase region:** verify the project is pinned to a UK/EU region (AWS London
  available); note it for the "where does the data live?" question.

### The "who gave you permission for policy info in Supabase?" answer (add to dev panel Q&A pack)
Supabase holds only: (1) derived publishable guide content - the same classification
already on the gated public site via Vercel/GitHub; (2) fictional demo data; (3) nothing
else. No policy documents, no PII, no internal contacts - policies stay on FOCUS/SharePoint,
Copilot reads them inside the tenant, only publishable output crosses out. Judo answer:
"No one - the demo is deliberately built so nothing in it needs permission. Real internal
detail and real patient data only enter when the trust approves hosting, signs the DPIA
and takes data-controller ownership. Getting through that gate properly is exactly what
I'm here to ask for." (Optica lesson: the wrapper before the data.) This collapses the
moment ONE genuinely internal item is actually in there - hence the fictional-detail rule.

### Claude-side (run early week of 21 Jul - Mike's SharePoint upload must land ~Mon 27/Tue 28 to beat ingestion lag)
- [x] **Audit - DONE 27 Jul.** Full write-up: `docs/nhs-ready/13-section-k-audit.md`.
      Result: **no trust-sourced file is tracked at all** (the dumps are already untracked,
      moved to `E:\Hub\temp\` and purged from history); all 41 tracked `docs/` files are
      Claude-authored. What remains is 4 blank forms in `public/` (no branding, no contacts -
      Mike's keep-or-pull call, my read is keep) and **33 real internal contact values in
      source comments** across bookmarks/index.ts (27), referral-workflows.ts (5),
      howto-guides.ts (1). Nothing renders live - the two "renders live" findings from the
      6 Jul audit are both confirmed fixed.
      - **⚠ Caught a trap:** this plan said the comment values were "already preserved in
        `_CONTACTS-INVENTORY.md`, outside repo". That file never existed;
        `E:\Hub\temp\internal-contacts.md` held only 3 of the 33. Running the purge against it
        would have destroyed 30 values. **Now rebuilt as a complete 33-value inventory** with
        file, line and owning entry - so the strip below is safe to run.
- [x] **Guide manuscript export script - DONE 27 Jul.** `scripts/export-guide-manuscripts.mjs`
      (`node scripts/export-guide-manuscripts.mjs`). Writes **68 staff guides + 29 patient
      leaflets** as markdown to `E:\Hub\guide-manuscripts\` (outside the repo) plus a
      `_MANIFEST.md`. Zero new deps - it shells out to the repo's own tsc to transpile the
      guide data, then renders each content shape (workflow / how-to / prompt guide /
      checklist / MHA checker / chip-bank builder). Patient leaflets are converted from
      `public/patient-guides.html`. Frontmatter carries category, guide type, traffic-light
      approval and the code path, so SharePoint can filter on them. **Re-runnable** - it
      overwrites the folder, so never hand-edit there; once uploaded, SharePoint is the
      authoring home. **MIKE: upload this folder** (see Mike-side below).
      - Two content gaps it surfaced: risk domain 6 ("Risk to a foetus, infant or child
        under 18") has an EMPTY risk list in `risk.ts` so it offers nothing in the app; and
        the patient-leaflet card still says "23 patient-facing guides" when there are 29.
- [x] **Purge - DONE 27 Jul.** No manifest files to delete (see audit - none tracked). All
      **33 Rule-4 comments stripped** from bookmarks/index.ts, referral-workflows.ts and
      howto-guides.ts; each file gained a header note saying what the pattern is and that the
      values live in `E:\Hub\temp\internal-contacts.md`, keyed by entry id (not line number,
      so it stays correct as files move). **No internal contact detail remains in the repo** -
      what is left is public: council lines, charities, IMHA providers, crisis numbers, which
      are real and meant to be used. Build clean, 32/32 tests pass.
      - Mike's decisions, 27 Jul: **keep the 4 public/ blank forms**; **no second history
        rewrite** for the stripped comments (internal extensions in a private repo, not PII).
      - **RESOLVED 27 Jul:** the S117 meeting request criteria named an individual in visible
        content as the provenance for the 7-day notice rule - the only named person rendered
        anywhere in the app. Mike's call: **soften to "approved by the Head of Service"**.
        Done. The name is preserved in `E:\Hub\temp\internal-contacts.md` (outside the repo)
        so the provenance is not lost. **No named individual now appears on screen.**
- [ ] History verify: F1 rewrite (6 Jul) already purged the FOCUS dumps - check nothing
      trust-sourced was committed since; targeted rewrite if needed (bundle playbook exists).
- [PARK] **BUILD: mini publish pipeline** - **deferred past the 30 Jul demo (Mike, 27 Jul).**
      Two reasons: the automatic route needs a Power Automate licence he does not have (see
      Architecture decisions above), and **the site must behave on the day exactly as it does
      now** - no new wiring, nothing to fail on stage. The pipeline story is already told by
      the security/architecture video ("AI builds the shelves, the Trust writes the books"),
      and the 30th is a pilot pitch, not a technical acceptance test. Pick this up after,
      with the licence question answered. Original spec below.
      (1-2 sessions) - guide content JSON schema; server-side
      fetch + render path in the guide viewer for pipeline guides (static guides untouched);
      publish mechanism for Mike (gated publish form or Supabase dashboard paste); seed with
      1-3 new guides carrying fictional internal detail. Keys via Vercel env only.
- [ ] Add the Supabase permission Q&A to the dev panel stakeholder Q&A pack.
- [ ] Verify/report the Supabase project region.

### Mike-side (at work, by ~Tue 28 to beat ingestion lag)
- [ ] Upload manuscript folder + remaining source docs to SharePoint.
- [ ] Point Guide Builder + Policy Checker at the new manuscripts library.
- [ ] Rehearse demo end-to-end: policy -> Guide Builder draft -> SharePoint -> publish ->
      appears on live site (never touched GitHub/Claude) -> site editor -> traffic-light
      sign-off. Line to use: "Pipeline is live; back catalogue migrates on a schedule."

Related (parked for a quiet day, agreed 21 Jul - do NOT build yet):
- [ ] **Remotion explainer video** (~90s, for the 30 Jul meeting) - storyboard agreed:
      (1) Claude builds the empty scaffold, sees no patient data / trust docs, replaceable
      by any tool; (2) inside the Trust M365 boundary, Copilot agents read Policy Library /
      SOPs / partner forms -> draft guide slots into a shelf -> edited in the site editor ->
      traffic-light red-to-green sign-off; (3) all entered data stays inside the trust
      boundary (demo: Supabase; live: Trust infra), copy-out to SystmOne, NO arrow ever
      back out to Claude/any AI; (4) close: "AI builds the shelves. The Trust writes the
      books, checks them, and keeps them." Text-on-screen, no voiceover, NHS tokens,
      1080p mp4 played offline. Project lives at E:\Hub\wardhub-video (NOT in this repo).
      Frame as "the model at full build", not "running today".

## L. Content confirm pipeline: quiz + guides (agreed 27 Jul - AFTER the 30 Jul green light)
Do not start this before the sponsor meeting. If the pilot is approved on Thu 30 Jul, this becomes
the follow-up work on the quiz. Context: [[session-31-quiz]].

**Why it exists:** the 942-question bank was mined from an OFFLINE SNAPSHOT of the policy library
(`E:\Hub\Policy dump not for git hub\`, 483 files). Mike is updating the real policies. Once that
lands, the snapshot is stale and some answers may be wrong - not because the questions were badly
written, but because the source moved.

1. [ ] **Re-run the quiz sources against the refreshed library.** For each of the 117 documents
   cited in `src/lib/data/quiz/research-trust-*.json`, check whether the issue number or review date
   has changed. Where it has, re-read that section and confirm or correct every question citing it.
   Update `sourceDate`, and clear `reviewFlag` where the document has been reissued.
   Cheap way in: the `source` string on every question names its document, so group by source first
   and only re-read the documents that actually moved.
2. [ ] **Re-check the 5 omitted questions** (listed in `E:\Hub\quiz-policy-conflicts.md`). If the
   refresh resolves the seclusion debrief clock, the independent-review window, or the post-discharge
   follow-up contradiction, those questions can go back in.
3. [ ] **Change the wH Quiz Writer agent so it CONFIRMS as well as CREATES** (work-side, M365 Agent
   Builder - see Section J for how the agents are managed). Right now it only generates new questions.
   It needs a second mode: given an existing question plus its cited document, say whether the stated
   fact is still exactly what the current document says, and if not, quote the new wording. Without
   this, every policy refresh means re-reading everything by hand.
   Sketch of the added instruction: *"You have two jobs. CREATE: write new questions from the
   document. CONFIRM: when given an existing question and its source document, find the passage the
   question rests on and answer CONFIRMED (quote it verbatim), CHANGED (quote the new wording and say
   what the answer should now be), or NOT FOUND (say where you looked). Never guess a number. Never
   mark CONFIRMED from memory - only from the document in front of you."*
4. [ ] **Point the same CONFIRM mode at GUIDE content (Mike, 27 Jul: "great idea").** Bigger prize
   than the quiz. A wrong quiz answer is a bad revision session; a wrong guide is someone doing the
   job wrong at 3am. Same staleness problem, same fix, but the guides need one thing built first:
   - **Blocker: guides do not record which document each fact came from.** `GuideData` has
     `focus?: {label,url}[]` (a link to the policy on FOCUS) and some guides carry `[#n]` inline
     reference markers, but there is no machine-readable "this fact came from document X, issue Y,
     review Z". The quiz has exactly that (`source` + `sourceDate`), which is why a confirm pass on
     the quiz is straightforward and on the guides is not.
   - **Do first:** add a `sources?: { doc: string; issue?: string; reviewDate?: string; steps?: number[] }[]`
     field to `GuideData` mirroring the quiz shape, and backfill it for the trust-sourced guides
     (the `focus` links already name most of the documents, so it is a fill-in not a research job).
     `steps` lets a CHANGED verdict point at the step that needs editing rather than the whole guide.
   - **Then:** run the agent guide by guide - it reads the current policy, checks each step's factual
     claims, and returns CONFIRMED / CHANGED (with the new wording) / NOT FOUND per step.
   - **Best bit - wire it to the traffic light.** `GUIDE_APPROVAL` in `src/lib/data/approval-status.ts`
     is a manual green/amber/red map. A CHANGED verdict on a green guide should knock it back to
     amber automatically with a note saying which step and which document moved. That turns the
     traffic light from "Mike checked this once" into "checked, and still true as of the current
     policy" - which is the thing that makes the sign-off meaningful to a sponsor.
   - Guides most worth doing first (heaviest trust-policy content): seclusion-support-plan,
     restraint-monitoring, observation-engagement, section-132, section-17, dols, awol,
     leave-discharge-transfer, admission-checklist.
5. [ ] **Decide the sign-off model for /quiz** - it carries no traffic-light StatusBadge yet, unlike
   the guides. If a nurse can be told "this is what our policy says", it probably needs one. Falls
   out naturally if item 4 lands, since the same confirm verdicts can drive it.

---

## M. Task handover + Overview review screen (SPEC, designed 27 Jul 2026 - not built)

Design session with Mike, 27 Jul. Nothing built yet. This section is the agreed spec.
Trigger: Tess Martin (QI lead) asked for a comments/update field on tasks so staff can say
what is happening. Mike's two objections, both right: (1) the update becomes a record that
never reaches SystmOne, (2) nobody follows up from the note. So the answer is NOT a notes box.

### The problem in one paragraph
There is no supported way to hand a half-done job back. Walk it as a band 5 at 21:15 with a
part-finished referral: **Mark Complete** lies (and falsely clears a discharge barrier);
**leave it claimed** hides it (My Diary hides ward tasks claimed by others, so the next shift
never sees it); **Drop** forgets it (no trace it was ever started); **edit the description**
is the PII leak; **make a new task** loses the barrier's age. Every route lies, hides or forgets.

### Decisions locked
- **Structured only. No free text anywhere in the handover.** Not a compromise - it is the
  reason the feature is defensible. Nothing to type means nothing clinical can land in the
  wrong record.
- **No separate list, no new place.** Jobs stay in the diary. Waiting is a badge and a filter,
  exactly like `blocksDischarge` is today (which also has no page of its own).
- **No referral tracking.** Mike's call, and correct: on a ward some services track their own
  referrals and just turn up (dietitian), others go silent forever (housing). Trying to track
  both makes work for the first and still misses the second. Replaced by the ward-round review
  below, which rides a ritual that already happens daily instead of inventing a new one.
- **No shift-based handover screen.** Tasks are a continuous 24h pool people dive in and out of.
  Handover fires when the person leaves the job, not when the clock says so.
- **Take over stays silent.** The person losing it is not notified. The history line is the record.
- **Patient tasks + appointments only** for this work. Team/ward shift tasks are a separate
  question - see "Open" below.
- **Drop the `in_progress` status entirely** (27 Jul). It only ever meant "I claimed this and
  dragged it to a column" - self-declared, no use to anyone else, and wiped at handover anyway.
  The hand-back states replace it and say far more. Two things now cover everything it did:
  *claimed by someone* = they are on it right now, do not duplicate; *handed back with a state*
  = someone has been on it and left it in a known condition. The badge on the card is the hint
  that this is not a brand new job.
- **"Chase" is the waiting subset only, not the umbrella.** It means one thing - waiting on
  someone, needs a nudge - and does not describe a half-filled form or a job blocked on a
  consultant decision. Right word for the action button and the waiting badge, wrong word as a
  collective noun. No umbrella name needed: the card shows the actual state, which is more
  specific than any collective noun.
- **My Jobs kanban columns become To do / Waiting / Done** (was Not Started / In Progress /
  Completed). Your own "in progress" column was never information anyone needed; splitting out
  what you are waiting on declutters the list and shows what to chase.

### 1. Hand-back sheet (the core build)
Split today's Drop into two actions: **Drop** (claimed by mistake, silent, as now) and
**Hand back**, which asks three things, all dropdowns, all one tap:

1. **What state is it in?** Not started / Part done / Waiting on someone / Blocked / Done but needs checking
2. **What's next?** Chase it / Send the form / Make the call / Needs a decision / Just carry on
3. **Where does it go?** Back into today's pool / Schedule for a day / Keep it with me
   (Mike: let the user decide. This is free - they are already answering it.)

Reached from two doors, one component: the job diary, and the end of a patient-linked guide
(alongside "mark complete", add "not finished" opening the same sheet).

### 2. Waiting on
- Picking "waiting on someone" asks **who**, then schedules the job forward to a chase date.
  So waiting needs no machinery of its own: it is a reason plus a date, reusing the scheduling
  from question 3. Keeps un-actionable jobs out of today's pool while staying visible.
- Same weight as barrier to discharge (Mike): badge on the job, count on the patient, filter
  and column in Overview. Shows age, e.g. "waiting on housing, 11 days".
- **The dropdown** (grouped; six most-used pinned; ward-editable in the same way ward settings
  already does `customAlerts`). Mike's ten plus the services the guide catalogue refers to:
  - *Ward and trust:* doctor/consultant, named nurse, MDT/ward round, pharmacy, bed management,
    MHA office, safeguarding team, estates, IT
  - *Therapies and physical health:* OT, physiotherapy, dietitian, SALT, psychology/DBT,
    tissue viability, dental, GP or acute hospital
  - *Community and social:* social care/MASH, housing, CPN/care coordinator, CMHT, Early
    Discharge Team, placement or care home, funding panel/CHC, benefits/DWP
  - *People and logistics:* family/next of kin, the patient, advocacy (IMHA), transport,
    interpreter, police
  - *Other* -> prompt "Document this in SystmOne" (the one case that cannot generate a
    specific case note, so it hands the writing back to the person)
  - Forensic/probation deliberately excluded (Mike's parked decision).

### 3. Case note out, even when incomplete (Mike's requirement)
The structured answers generate a copy-paste SystmOne line **whether or not the job is done**.
Nobody types anything and a progress update still reaches the clinical record. Reuses the
existing guide clipboard machinery (auto-fills date, patient name, staff name - snag 94).
- *Part done:* "Housing / Duty to Refer: form started, not yet sent. Returned to the ward jobs
  list for completion. S Johnson, 27/07/2026."
- *Waiting:* "CPN invited to ward round. Called 27/07/2026, no answer. Awaiting response from
  CPN, to chase 29/07/2026. S Johnson."
- *Blocked:* "Social care referral cannot proceed, needs a consultant decision. Escalated to
  MDT. S Johnson, 27/07/2026."

**The IG answer, have it ready:** prose in SystmOne for the clinical record, structured state in
wardHub for the workflow. Different shapes, not duplication. The job history keeps the state
even if the paste never happens.

### 4. Task history (append-only)
Every claim, hand back, take over, state change, reopen and reschedule writes who / when /
what / structured reason. Small timeline in the task detail modal. The events already fire
(see `tasks-provider.tsx`), they are simply not kept. Also makes Reopen non-lossy - it
currently wipes `completedBy`/`completedAt` outright.

**Hand-back count on the card** (27 Jul, cheap once history exists). A job handed back four
times is going round in circles - exactly the failure in Tess's "no answer, try again tomorrow"
example. Surfacing "4th time round" on the card makes it visible in ward round, and it demos well.

### 5. `/overview` becomes the one place - BUILT 27 Jul (session 41)
**Mike's verdict on the 22 Jul `/overview` + the reports page: "buries the useful bit, and it is
not clear it offers any of the features we discussed - the daily review / MDT feels like an
afterthought."** Rebuilt this session. What shipped:
- **Menu:** "Trust Overview" -> **Overview**, now FIRST in the More dropdown (desktop + mobile).
  "Progress Reports" removed from both menus; `/reports` is a redirect stub to `/overview`.
  Patients page button relabelled Reports -> Overview.
- **Lands on the work, not a wizard.** The old two-stage "pick a scope -> Generate Report" gate
  is gone; the screen opens on the patient list with the default scope already applied.
- **Trust-wide barriers roll-up DROPPED ENTIRELY** (Mike's call, 27 Jul - it was the thing doing
  the burying). The ward league table, "most common barriers" and blocked-patient list from the
  22 Jul build are gone. Barrier data survives everywhere it is actually useful: the headline
  strip, the per-patient count, the per-job badge, the barriers-only filter and the new
  barrier-flag toggle. `CareReviewRollup` also dropped from this screen (still used on /patients).
- **Scope:** the three pickers kept, compacted into one bar. Defaults to **single ward with the
  user's own ward preselected**; when the ward is unknown nothing is preselected and the screen
  asks for one rather than silently showing Byron (the old code defaulted to `activeWard ||
  "Byron"` AND mismatched the select's lowercase option values, so the dropdown lied).
- **Three review stamps per patient** - MDT / rapid review / named nurse. One tap each, records
  who and when, tap again same-day to undo. Chips age green -> amber past each stamp's interval
  (MDT 7d, rapid 1d, named nurse 14d). New `src/lib/data/patient-review.ts` (localStorage,
  same pattern as `care-review.ts`). New **"Stamp all shown"** row for the rapid-review case, a
  **"Not reviewed today"** filter to work down to an empty list, a **Reviewed** column in the
  table (sortable) and a **reviewed-today** headline counter. This is the assurance metric
  falling out for free - no extra data entry.
- **Inline job actions, one tap, no modals.** Outstanding: Complete, Flag/unflag barrier to
  discharge. Completed: Reopen (keeps the date), Redo (expands a date picker in place and
  reopens with the new date - Mike's "reopen the old job with a new date", not a new linked job).
  All route through the existing provider so the diary, kanban and every count stay in step.
- **Counters are filters.** Tapping Total / Outstanding / Overdue / Done on a patient tile
  narrows that patient's job list; tapping the same count in the table opens the row already
  filtered. Plus a one-tap "N jobs blocking discharge - show just these" on any blocked patient.
- **Governance fix caught on the way:** `/overview` was never in `FULL_ONLY_PREFIXES` in
  `src/proxy.ts` despite rendering patient names since 22 Jul. Added. Dormant either way while
  `COLLAPSED_FOR_DEMO=true`, but it would have leaked PII into the limited build the moment the
  v1/v2 split was restored.
- Verified in-browser end to end (stamp persists + headline recount, complete, redo with a new
  date, counter filters in both views, /reports redirect, menu order). Build clean, 32/32 tests.
- **Still open from the spec below:** the hand-back sheet (section 1), waiting-on (2), case note
  out (3), task history (4), retire the chase log (6). The stamps landing makes 4 more valuable -
  hand-back count on the card needs history.

**Original spec kept below for reference.**

Merge `/reports` into `/overview` and retire the reports page as a separate thing. Reports
already has the right bones (patient rows expandable to jobs, filters, sort, priority colours,
barrier badges, tile/table toggle) - it needs a scope selector and the rows need to become
actionable. `/overview` today is only a read-only trust-wide barriers roll-up.

- **Scope, all filter-based:** one patient / one ward / one ward professional's patients /
  whole trust. Tile-card and table toggle as now.
- **Modes:** ward round (one patient at a time), rapid review (all patients, compact rows),
  meeting. Same screen, same actions - the mode changes density and which stamp is offered.
- **Entry point** from the patient card ("Review this patient") deep-links into the same screen
  scoped to one patient. Two doors, one screen.
- **Inline actions on each job row. Speed is make-or-break** - ward round is fast and someone is
  already typing into SystmOne. One tap, no modals, no confirmations; anything needing a
  follow-up choice expands in place.
  - *On completed jobs:* reopen, redo, chase, confirm completed
  - *On outstanding jobs:* no longer needed, mark urgent, mark barrier to discharge
  - *On waiting jobs:* still waiting, chase again, it has come back (close), escalate
  - **Chase = the waiting state**, reached from ward round instead of the hand-back. Same state,
    same badge, same column. These are one feature with two doors, not two features.
  - **Redo** = reopen the old job with a new date (Mike), not a new linked job.
  - **Anyone can do any of it** (Mike). Optional reason dropdown, skippable in one tap:
    *no longer needed* (done elsewhere / patient discharged / MDT decision / duplicate / no
    longer indicated); *reopen* (wasn't actually done / needs doing again / new information).
- **Three stamps**, per patient not per job, worded as an attestation rather than a tick:
  MDT, rapid review, named nurse review. E.g. "Jobs list agreed as current. MDT, 27 Jul."
  Free by-product: a report of patients not seen by their named nurse in two weeks, or not
  through rapid review since Friday. Real assurance metric, one tap.
- **"Reviewed, no changes"** single tap when nothing needs doing, so the stamp still lands.

### 6. Retire the chase log
`/referrals/log` + `referral-log-provider.tsx` + the "Log to Chase Log" button on the referral
completion screen all go. It was built early, has one entry point (a button in the `/guides`
header), only fills if someone opts in, and is per-browser localStorage - which is why neither
of us remembered it existed. Its one useful behaviour ("referral sent to X on date Y") becomes
a job in the waiting state. Its three free-text fields die with it, which is what makes the
structured-only rule true across the whole product.
Types to remove or repurpose: `ReferralLog`, `ReferralChase`, `ReferralLogStatus`.

### 7. Demo data top-up for `/overview` - DONE 27 Jul
Built and verified. `/overview` now reads: **25 active patients, 12 blocked, 25 open barriers,
3 overdue** - Dickinson 9 (2 overdue) / Keats 7 (1 overdue) / Shelley 4 / Wordsworth 3 / Byron 2.
Nine realistic blocker types (housing, placement search, funding panel, social care assessment,
care home visit, transport, S117 aftercare, CMHT allocation, package of care), reused across wards
so the "most common barriers trust-wide" list ranks properly instead of showing all 1s. Barriers
stack on a few patients (Bernard Lowe has 4), so blocked-patient count differs from barrier count
on every ward. Dated 3-14 days out plus 3 deliberately overdue, so today's diary stays clear;
`createdAt` runs back up to 26 days so age is there when the screen wants it.
- **One knob:** `BARRIER_PLAN` in `src/lib/data/tasks/index.ts`. `blocksDischarge` was removed
  from `PATIENT_TASK_TEMPLATES` so that plan is the ONLY source of barriers and the numbers stay
  exactly what it says.
- **Worth knowing:** the wards hold 5 patients each (25 total), not the 100 this spec assumed -
  `PATIENT_NAMES` was cut to 5 per ward ("Mike: 5 max per ward"). So 12 blocked is roughly half
  the demo trust. It reads fine as "a trust with a discharge problem", which is the story the
  screen is for, but drop a few rows from `BARRIER_PLAN` if it looks overstated in the room.

**Original spec kept below for reference.**

Wanted for the **Thu 30 Jul** sponsor demo. Standalone: touches only the generator in
`src/lib/data/tasks/index.ts`, so it can ship on its own without any of Section M being built.

**Current state (why it looks thin):** two of the ~20 `PATIENT_TASK_TEMPLATES` carry
`blocksDischarge` ("Discharge planning meeting", "Social worker referral") and may or may not be
reached, plus `generatePatientTasks` guarantees exactly one extra barrier per ward, dated
tomorrow with `createdAt` = today. Result: five wards showing near-identical small numbers, all
created today. Flat and young, the least interesting version of that screen.

**What to change:**
1. **Make the wards uneven.** One ward clearly worst, e.g. Dickinson 9 / Keats 7 / Shelley 4 /
   Wordsworth 3 / Byron 2. "Dickinson 9, Byron 2" prompts the question you want asked in the
   room; five wards on 2 each prompts nothing. Exact spread is one line to change.
2. **Use real blockers, not just "discharge planning meeting".** Housing referral, placement
   search, funding panel / CHC decision, social care assessment, transport, care home
   assessment. These are what actually holds discharges up and they land with a sponsor audience.
3. **Spread across more patients** (target roughly 12-15 of the 100 blocked) so the
   blocked-patient count means something rather than tracking the barrier count.
4. **Date them 3-14 days out**, so they populate `/overview` without filling today's diary
   (Mike's constraint). Deliberately make **two or three overdue** so that column is not zero.
5. **Vary `createdAt`** back a few weeks on the older ones, so age is available to the screen
   later without regenerating anything.

**Limit to be aware of:** `/overview` can only show what is built. Today that is barrier count,
blocked-patient count and overdue per ward. The waiting ages ("waiting on housing, 11 days")
need the Section M work, so if none of that ships by Thursday the data cannot show it.

### Bugs this exposes (fix as part of the build)
- **Drop does not touch status** (`tasks-provider.tsx` claimTask): a dropped job keeps
  `in_progress`, so an unclaimed job can sit in the pool displaying as in progress.
- **Claim and Take Over reset `in_progress` -> `pending`**: the one signal that someone got part
  way is deleted at the exact moment of handover.
- **Tasks do not persist at all.** `tasks-provider.tsx` is plain `useState` seeded from
  `ALL_DEMO_TASKS`, so the diary resets on every refresh. The retiring chase log was the only
  work record that survived a reload. Decide persistence before any of this is demo-able.

Note: dropping `in_progress` (see Decisions locked) dissolves the first two rather than fixing
them - but only if the kanban, `TodayWidget`, `PatientTasksModal`, `StaffTasksModal`, `/reports`
and the demo generator are all migrated off the status at the same time. Grep `in_progress`
before starting: it is referenced in about a dozen places.

### Open
- [ ] **Team/ward shift tasks: what happens when one is not completed that shift?** Mike thinks
  something was already built. There is a `carryOver` flag on `WardTask` and a per-category
  carry-over setting in ward settings, so a mechanism exists - check whether it actually works.
  Separate session.
- [ ] Confirm the exact stamp wording ("current state of play" vs the draft above).
- [ ] Sponsor demo is Thu 30 Jul. This is a multi-session build. **Before Thursday, do section 7
  (demo data) only** - it is standalone and it is the one thing that visibly improves the demo.
  Everything else here is post-meeting work. If there is time beyond that, the smallest useful
  slice is the rapid-review screen with a few actions live.
- [ ] Follow-up line to Tess once agreed - the generated case note answers her original ask
  better than the reply already sent.

---

## N. Session 41 job list (Mike, 27 Jul 2026 - evening)

Mike's list for the session, merged with the outstanding items it overlaps. Status as at the
end of the session.

### Overview (was "the big issue")
- [x] **Rebuilt** - see Section M item 5 above for the full write-up. Renamed to Overview, first
      in the More menu, Progress Reports retired, roll-up dropped, scope defaults to the user's
      ward, review stamps, inline job actions, clickable counters.
- [x] **Follow-up niggles (same session):** standing Barriers-only YES/NO switch on the tile
      counter row and in the expanded table row (was only a banner once filtered, so you could
      not tell which state you were in); acting on a job no longer makes it vanish from under
      you (`useStickyActions` pins anything you touch, and a cleared barrier stays visible with
      a "barrier cleared" tick); clicking a job opens the full `TaskDetailModal`, same as the diary.
- [ ] **Barriers-only filter should drive the per-patient toggles (Mike, 27 Jul - not started).**
      Turning the page-level Barriers-only filter ON should also switch ON the barriers-only toggle
      on each patient, rather than leaving the two controls out of step. Currently the page filter
      and the per-patient switches are independent, so you can be filtered to barriers at the top
      while individual patients still show everything. Presumably the per-patient toggles should
      follow the page filter and stay individually overridable afterwards - confirm that reading
      with Mike before building.

### Site-wide
- [x] **Copy-to-clipboard on every phone number and email address.** New `CopyChip` +
      `ContactText`/`renderWithContacts` in `src/components/ui/`. Done by DETECTION, not by
      tagging contacts in the data, so guides written later or edited in the site editor get it
      for free. Covers how-to step content and tips, referral step content, referral submission
      methods, `/links` bookmark phones and service-map contacts. Detected contacts also become
      `tel:` / `mailto:` links. Detection is strict (UK 10-11 digit starting 0, or 116 123);
      audited across all of `src/lib/data` - **87 distinct real numbers, zero false positives**
      from dates, doses, policy or section numbers. Side benefit: referral step content now runs
      through the same renderer, so bare URLs are clickable there too (wanted in Section C for
      the domestic abuse guide).

### Guides
- [x] **Case-note copy confirmation.** Both case-note boxes (referral casenote step and the
      how-to completion card) now change state on copy - amber to emerald, a "Copied" badge on
      the box, header text changes to "Copied - paste it into the patient's notes", `aria-live`
      for screen readers. The box is what you are about to paste, so that is where the
      confirmation belongs; the button alone was not enough.
- [x] **"+ Add follow-up task" now opens the real Add Task screen, pre-filled.** It used to
      silently create a task 7 days out that you never saw and could not change (Mike: "doesn't
      visually do anything on the screen"). **`AddTaskModal` was extracted out of
      `src/app/tasks/page.tsx` (~900 lines) into `src/components/modals/AddTaskModal.tsx`** so
      the diary and the guides share ONE Add Task screen rather than growing a second one. New
      optional `prefill` prop (`AddTaskPrefill`) carries what the guide already knows: linked
      patient, "Follow up: <guide title>", category, linked guide, date +7 days. Everything stays
      editable before saving. If no patient is linked yet, the patient picker asks first and then
      hands straight over. Confirmation line on save. Diary Add Task verified unchanged.
      - Note: `formatDate` in `tasks/page.tsx` was a duplicate of `toLocalDateStr`; the extracted
        file uses the shared util.
- [x] **Guide question answers must reach the case note. AUDIT DONE + ALL FIVE FIXED 27 Jul.**
      Every guide that asks a question with answer options was traced from
      the answer through to the end-of-guide clipboard text. Snag 92-95 was only half true: the
      **area** answer works everywhere, the **consent** answer works nowhere.

      **Where the answers are captured:** `src/app/guides/[id]/page.tsx` holds four bits of state -
      `criteriaConfirmed`, `patientConsent`, `patientSection`, `selectedArea` (lines 224-227), and
      `generateCaseNote()` (line 279) is the only place they can reach the clipboard.

      **WORKING (no action):**
      - **Area (city/county) - 4 of 4 workflows.** `imha-advocacy` builds a bespoke note naming the
        right provider and email; `safeguarding`, `safeguarding-children` substitute
        `[DERBY CITY/DERBYSHIRE COUNTY]`, `homeless-discharge` substitutes `[DERBY/COUNTY]`.
      - **Legal status in `imha-advocacy`** - bespoke branch writes "Patient is informal (voluntary)"
        or "Patient is detained under <section>".
      - **`leave-discharge-transfer`** - the 3-way pathway choice titles the ChecklistSummary.
      - The builders (MSE, care plan, risk assessment, admission checklist) assemble their output
        from the selections themselves, so they cannot drift. The 6 pure-guidance `GuidePrompts`
        tools have no output by design (Session 27) - out of scope.

      **BROKEN - N1. Consent answer never reaches any case note (4 workflows).** `patientConsent`
      is used only to colour the buttons and to unlock Next (`canProceed`, line 313). It is never
      read by `generateCaseNote()`. So:
      - `imha-advocacy` - note has no consent sentence at all, despite asking.
      - `safeguarding` - `Patient [WAS/WAS NOT] informed of referral.` left literal.
      - `safeguarding-children` - `Parent [WAS/WAS NOT] informed.` left literal.
      - `ctr-dsp` - `DSP consent [OBTAINED/PENDING].` left literal.
      - ⚠️ **Needs Mike's call before the fix:** in the two safeguarding guides the question asked is
        *"did you get consent"* but the placeholder records *"was the patient/parent informed"*.
        Those are different facts - a straight substitution would put something untrue in the record.
        Consent and informing need either two questions or a reworded note.
      - ⚠️ `ctr-dsp`'s consent step defines no yes/no labels, so it falls back to the generic
        "Consent Obtained" / "No Consent", which does not map onto Obtained/Pending.

      **BROKEN - N2. `social-care` throws its answer away.** It asks the S117 question but its case
      note has no `[SECTION]` placeholder - in fact `[SECTION]` appears in **zero** clipboard strings
      repo-wide, so the substitution at line 301 is dead code outside the IMHA bespoke branch. Two
      further problems with the same step: it asks a yes/no-shaped question ("is the patient under
      S3, **or have they been in a previous admission**") but renders the generic 10-option MHA
      status list, so "previously on S3" cannot be expressed at all - and that is exactly the case
      S117 entitlement turns on (see memory `s117-two-meetings-rule`). The S117-vs-standard pathway
      described in the step content drives nothing: no forms, contacts or note text change.

      **BROKEN - N3. `homeless-discharge` asserts a fact it never asked for.** Its note hardcodes
      "Patient consent obtained." and the workflow has no consent step.

      **BROKEN - N4. Chase log ignores the area answer.** `handleLogReferral` (line 368) takes
      `sub.methods[0].label` regardless of `selectedArea`, so a county safeguarding referral is
      logged as sent to the Derby City team. 28 area-tagged submission methods are affected.

      **GAP - N5. `mha-checker` has no case-note output at all.** The pathway choice and the whole
      scrutiny checklist are ticked and then lost. Obvious candidate for a ChecklistSummary.

      **WHAT WAS BUILT (Mike picked both recommended options):**
      - **New pattern: the step owns its case-note wording.** New `consentYesNote` / `consentNoNote`
        on the consent step, swapped into a `[CONSENT]` placeholder. The viewer never invents
        clinical phrasing, and an unanswered question leaves its placeholder visible rather than
        guessing - a blank is obvious in a note, a wrong assertion is not. Documented in the guide
        editor's consent panel so editors can use it.
      - **N1 consent (two questions).** Consent and informing are now asked separately, on the same
        screen (`informedQuestion` + `[INFORMED]`), so the note can say both truthfully. Next is
        gated on both. Applied to `safeguarding` and `safeguarding-children`; `imha-advocacy` gained
        a consent sentence in its bespoke note; `ctr-dsp` got real Obtained/Pending labels feeding
        `DSP consent [CONSENT]`.
      - **N2 social-care.** New `s117` step type with three options (on S3 now / previously on S3 /
        no qualifying section) plus `S117_OPTIONS` and an `entitled` flag. Picking one shows a
        pathway callout that spells out the aftercare meeting vs the discharge planning meeting, and
        `[S117]` writes a full sentence into the note. The old generic MHA picker could not express
        "previously on S3", the case entitlement actually turns on.
      - **N3 homeless-discharge.** Consent split out of the criteria tick into its own step. The
        note no longer opens with "referral submitted" - that clause moved into the consent wording,
        because a declined Duty to Refer means no referral went in at all. Declining now reads
        "Patient declined, so no referral was made. Housing contact details were given..." instead
        of contradicting itself.
      - **N4 chase log.** `handleLogReferral` filters submission methods by the chosen area.
      - **N5 mha-checker.** ChecklistSummary added - pathway name plus ticked/outstanding scrutiny
        items.
      - Verified in the browser end to end on all five guides (safeguarding no-consent-but-informed,
        social-care previously-on-S3, IMHA declined consent, ctr-dsp pending, homeless declined) and
        the chase-log entry confirmed as "Derbyshire County". Build clean, 32/32 tests pass.

      Overlaps Section C "capacity assessment guide - make interactive" (choices should alter the
      case-note output).
- [ ] **⚠️ CONFIRM WITH MIKE - can a Duty to Refer go in WITHOUT consent?** Mike (27 Jul): "I
      thought we send in their best interest but need to check." The N3 fix above assumes it cannot,
      and the guide now tells staff that a declined referral means no referral is made. **If that is
      wrong it is wrong in a live guide, so this is the first thing to settle.** What is (fairly)
      certain: s.213B Housing Act 1996, inserted by the Homelessness Reduction Act 2017, frames the
      duty to refer around the person's consent - they must agree to the referral and to which
      housing authority it goes to. What is NOT settled and needs Mike/the trust to confirm: whether
      a best-interests referral under the MCA is made where the patient **lacks capacity** to
      consent (a refusal by someone with capacity is a different thing from an inability to
      consent), and whether local practice refers anyway on safeguarding or vital-interests grounds.
      If best-interests referrals do happen, the consent step needs a third option
      ("Patient lacks capacity - referred in their best interests") with its own case-note wording,
      not just yes/no. Do not flip the guide wording on my reading alone - Mike to check against
      trust policy / the housing team.
- [x] **Break up text-heavy guides with progressive disclosure. DONE 27 Jul on the S117 guide,
      built as a reusable pattern so 3.5 is cheap.**
      - **`ProgressiveContent`** (`src/components/guides/ProgressiveContent.tsx`) splits a step's
        content into collapsible sections: header always visible, first line as a one-line teaser,
        full body on click, plus Expand all / Collapse all. **Sections are derived from the text,
        not from new data fields** - the guides already write headers as a short line ending in a
        colon with bullets underneath, so the splitter keys off that. Anything before the first
        header stays visible as an intro (it is the "why you are reading this" paragraph). Switching
        it on for a step is one flag, `progressive: true`. A step whose content has no headers falls
        back to the old flat rendering, so the flag is always safe to set.
      - **`CriteriaWalker`** (`src/components/guides/CriteriaWalker.tsx`) + the `CriteriaWalk` type
        (`src/lib/data/guides/criteria-walk.ts`): a data-driven question tree in the accessible base
        Modal, with Back, Start over, and colour-toned outcomes (yes / no / go and check). Attaches
        to a named section via `walk.section`, so the trigger button renders inside that section.
      - **`S117_QUALIFY_WALK`** wires "Does my patient qualify?" into the *Who qualifies* section of
        the S117 guide. Two questions: qualifying section in THIS admission, then in ANY previous
        admission. Five outcomes, including the two "I am not sure" routes which send you to the MHA
        Office rather than letting an unknown history be treated as a no. The previous-admission
        outcome states both halves of the two-meetings rule (see memory `s117-two-meetings-rule`).
      - Deliberately NOT persisted and NOT part of the case note - it is a thinking aid, and the
        entitlement decision belongs to the MHA Office.
      - Verified in browser: four sections split correctly, walker reachable, both qualifying
        outcomes and the no-duty outcome correct, Back/Start over work, non-progressive guides
        unchanged. Build clean, 32/32 tests pass.
      Overlaps Section C (`domestic-abuse-guide` text density).
- [x] **Sweep all guides for the same opportunity. DONE 27 Jul - 23 steps across 13 guides.**
      Scanned all 282 steps with content (120 referral-workflow, 162 how-to) for the
      "header + bullets" shape at 350+ characters with 2+ headers.
      - **Referral workflows: only ONE candidate repo-wide** (the S117 step, already done in 3.4).
        Their steps are short and single-purpose, so there is nothing to sweep there. The density
        problem is entirely in the how-to guides.
      - **How-to guides: 29 candidates, 23 flagged.** `progressive?: boolean` added to `GuideStep`
        and wired into the how-to branch of the viewer (`size="base"` so it renders at body size,
        and the splitter now treats both `•` and `- ` as bullets).
      - **Flagged:** mha-statuses (4 - holding powers, CTO, forensic sections, patient rights),
        domestic-abuse-guide (3), online-safety-children (4), abc-chart (1 - the Datix workflow),
        peer-conflict-guide (1), honour-based-abuse (1 - FGM), non-recent-abuse (2), child-in-need
        (2), safeguarding-adults-referral (1), safeguarding-children-referral (1), faith-belief-abuse
        (1), send-safeguarding (1), special-guardianship (1).
      - **Deliberately NOT flagged (6)** - hiding these would cost more than the tidiness is worth:
        `domestic-abuse-guide` step 5 and `honour-based-abuse` step 4 are short DO / DO NOT safety
        guidance; `abc-chart` steps 3, 4 and 5 are sequential teaching where the worked example is
        the entire point of the step; `peer-conflict-guide` step 1 (Levels of Conflict) is a
        comparison you need to scan side by side - **it is a better candidate for a CriteriaWalker
        ("which level is this?") than for collapsing**, worth doing when the walker gets reused.
      - **Bug caught by the sweep, fixed in the component:** guides often close with a standalone
        line belonging to the whole step, not to the last header - three of them were
        **"call 999" lines**, which the naive split filed inside a collapsed section. `splitIntoSections`
        now peels trailing prose off the last section into an `outro` rendered in the open. Verified
        across all 23 steps: 7 outros correctly kept open (including all three 999 lines), 0 steps
        left with an empty or single section. Build clean, 32/32 tests pass.
- [ ] **Update the guide-building agents (not started)** - `docs/copilot-guide-builder-kit.md`
      plus the LIVE agent instructions in M365 Agent Builder (Mike-side, see Section J), so new
      guides use collapsible sections and criteria pop-ups by default instead of long prose.

### After the above
- [ ] **Guide walkthrough with Mike, approving one by one** - each currently in development or
      awaiting approval; Mike moves each past development. This is the big Section C item
      ("~47 amber guides for Mike to read + colour").

### For a later date (Mike, 27 Jul - not this session)
- [ ] **Guide-building agents must READ and EDIT existing guides, preserving site-editor
      changes.** Guides may have been altered in the wardHub guide editor by people with editor
      rights; an agent regenerating a guide must not clobber those edits. Relates directly to
      Section L item 4 (CONFIRM mode for guide content) and to the publish-pipeline question in
      Section K - if SharePoint becomes the authoring home, "who owns the current text" needs
      answering before an agent can safely rewrite a guide.
- [ ] **Review the guide editor with Mike.**

---

## MIKE'S HOMEWORK DUMP (4 Jul 2026 - captured, organised into A-E below)
Full verbatim capture + per-guide notes + source-doc inventory: **`docs/homework-04-Jul-2026-dump.md`**.
Source files on disk (outside repo): `E:\Hub\temp\dump july\` (doc, 6 screenshots, 2 HoNOS videos, `docs 1\` set).

**Big win:** Mike supplied the docs that were blocking guides. `docs 1\` unblocks section-132,
capacity-assessment, blanket-restrictions, abc-chart, no-smoking, informal-patient-contract (see table in the dump doc).

> **Source extraction done 4 Jul** - all 17 docs + odds-and-sods read; mapped digest at
> `E:\Hub\temp\dump july\extracted\_DIGEST.md`. Bonus finds: 8-step arrange-MHA flowchart (odds p13),
> ECT fasting/post-ECT content (odds p3-5), public CMHT directory (odds p6-8), "A CARE PLAN!" case-note
> mnemonic, seclusion review timings, red-folders + ward-roles content. Rule-4: odds pp9-10 internal
> @nhs.net inboxes/managers stay OUT of live.

### F. Homework - now-actionable (unblocked by Mike's `docs 1\` docs)
- [x] **section-132** (RED, enriched 4 Jul, commit 4152ca1) - added "Record it on SystmOne" step (S132/S132A questionnaires, Save-Final-Version auto-tasks MHA team, leaflet printing), S133 discharge duty, S132A/CTO recall note. FOCUS recording + policy links already wired. STILL BLOCKED: MHA office email (add when Mike supplies).
- [x] **capacity-assessment** (RED, enriched 4 Jul, commit 99f6f02) - added the SystmOne Combined Capacity form (functional + diagnostic stages) and the police Capacity Request form. FOCUS S1 + policy links already wired.
- [x] **blanket-restrictions** (RED, enriched 4 Jul, commit add0a44) - added FOCUS brief-guide link, three-tier contraband list (banned/risk-assessed/advisory), ward-level authorisation aligned to policy (Ward Manager sign-off + register + Clinical Meeting/daily-huddle review).
- [~] **abc-chart** (amber) - blank ABC chart to print now added (`/abc-chart-blank.html`, 4 Jul eve, commit 1f11591) alongside the existing completed-example WAGOLL. Still open: a fuller worked example + an optional builder from `ABC charts - Copy to add to.pptx`.
- [ ] **honos** (RED) - use image6 (New Cluster box) + `waa honos.mp4` / `waa honos hist.mp4`; note WAA/secure/CAMHS formats differ. (Left - needs the video/image processing, Mike's eye.)
- [x] **NEW guide: no-smoking** (RED, 4 Jul, commit 99f6f02) - "Smoke-Free Ward - Your Legal Duty", from the staff legal-warning doc; legal framework + what-to-do + ties to blanket restrictions. Restrictive Practice category.
- [x] **NEW guide: informal-patient-contract** (RED, 4 Jul, commit 99f6f02) - Gatekeeping Assessment (18 mandatory Qs) + Informal Admission Questionnaire, from the two Dec-2025 SystmOne guides. Nurse Tools category.
- [ ] **debrief** (already amber) - confirm headers vs the real tool text (in dump doc); likely just a header check. (Left - Mike's eye on exact headers.)
- [x] **admission-checklist** (4 Jul, commit d15addb) - the 3 personal michael.sharpe4 OneDrive links swapped for in-app builders (risk-assessment, care-plan) + MHLO statutory-forms index for blank H3. PERSONAL block removed.
- [x] Reviewed **`odds and sods.pdf`** - digested in `_DIGEST.md`; ECT/CMHT/arrange-MHA content pulled (arrange-mha rebuilt from the 8-step flowchart, commit d15addb). Remaining ECT/CMHT/day-services content needs NEW guides (see Section A).

### G. Homework - quick edits (small, mostly no doc needed)
> **Most of Section G was ALREADY done in a prior session** (the BACKLOG was stale). Confirmed 4 Jul.
- [x] **leave-discharge-transfer** - Prenoxad consideration + guide link AND "Fire board / evacuation list updated" in day-of tasks BOTH already present.
- [x] **dama** - out-of-hours discharge meeting, "unplanned = unsafe discharge -> Datix", and short-leave alternative all already present.
- [ ] **fridge-temps** - "Mark completed for today" button that ticks the linked diary task (feeds Section E diary-task audit). (Interactive/code feature - bigger, left.)
- [x] **observation-engagement** - shower/toilet intimate-care obs closeness AND "L1/L2 rarely leave ward, MDT-agreed" already present.
- [x] **safeguarding** - the 39%/54% line already reworded ("even those not taken up are still logged... build a picture").
- [ ] **safeguarding-children** - the two consent press-options are about patient not family - fix. (Left - the consent step is family-consent; needs Mike's eye on exact intent.)
- [ ] **domestic-abuse-guide** - make URLs clickable; source/link the CADDA-DASH; reduce text density. (Left - subjective density call for Mike.)
- [x] **mha-statuses** - already has the related link to section-132.
- [x] **arrange-mha-assessment** - REBUILT from the 8-step flowchart (commit d15addb); nhs.net line already reflects "social care use their own secure email". Still RED: secure-email name TBC from Mike.
- [ ] **admission-note** - add ward/unit names; make interactive (click a line -> pop-up suggestions). (Interactive = bigger, left.)
- [ ] **Flip to amber if happy:** `prenoxad`, `transfer-in`, `awol` (complete drafts - await Mike's word). [Claude won't self-flip approval status - that's Mike's editorial call.]

### H. Homework - decisions still on Mike
- [BLOCKED] **section-136** - expand with FAQ (force treatment / seclude / out-of-area / child in 136) or drop? Research FOCUS+external first, then decide.
- [BLOCKED] **mh-talking-points** - grouping steer + which extra grounding/distraction techniques.
- [BLOCKED] **arrange-mha-assessment** / **section-132** - social care secure-email name; MHA office email address.
- [x] **HoNOS group** = Nurse Tools (Mike decided). **IMHA** = Disability Direct (confirmed, One Advocacy dropped). **v1/v2 merge** = keep.

### I. Homework - bigger builds (own sessions, parked - overlaps Section D)
- [PARK] Named Nurse Checklist -> schedulable ticking tasks (also D). Red Folder content in `Red folders - set up.docx`.
- [PARK] Tribunal/DST/OT-report combined builder - write tribunal on the new gov.uk template (also D).
- [PARK] Formulation output rethink; Risk tool rethink; DoLS visual/interactive (also D).
- [PARK] restraint-monitoring - reasonable-force image + law; core-skills hold images (Mike to supply); clickable "monitoring ceased" workflow that greens out.
