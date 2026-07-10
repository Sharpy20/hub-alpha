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
- [ ] Review-only sign-offs: ~47 amber guides for Mike to read + colour (green needs dept sign-off).
- [~] Items needing Mike's docs/photos: **MOSTLY SUPPLIED 4 Jul** in `docs 1\` - see Sections F-I. Still blocked: MHA office email; social-care secure-email name; restraint holds images (Mike to photograph).
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
- [x] **Print on guides** (4 Jul eve, commits 7c4f9c1 + be77d18) - Print button on every how-to guide, referral workflow and thinking-guide, rendering all steps/sections from the SAME data so future edits flow through. Reusable `downloads` field + printable blank forms (police capacity, ABC chart). Builders (risk/care-plan) skipped - they already copy out.
- [ ] Quiz: add "report an issue" per question (feeds feedback board).
- [ ] Printable guide "clue cards" (title + 1 line, 4/A4, per group) for physical re-grouping.
- [ ] Diary-task audit: which other guides map to a ward diary task (like fridge-temps) -> add "mark done" buttons.
- [ ] New guides Mike flagged: informal patient contract; no-smoking-in-the-trust (Mike has material somewhere).
- [x] **Student Nurse Placement guide** (side quest, 4 Jul, commit 9f09614) - new "Learning & Development" category, built demo-safe from `dump july\Student Information Pack.docx` (real ward/staff names + internal numbers stripped). RED pending Mike's review. New category has one guide for now; move to Nurse Tools if a dedicated category feels heavy.
- [ ] **Discharge-barrier flag on tasks (Optica-inspired, Mike 4 Jul)** - let staff mark a patient task "is this a discharge barrier? yes/no". Surfaces barriers clearly. STRATEGIC: this is the bridge that makes wardHub the ward-level capture layer feeding discharge-flow tools (e.g. Optica) upward - positions wardHub as complementary, not a rival. Full-build feature.
- [ ] **Read-only MDT / external task view (Optica-inspired, Mike 4 Jul)** - give the wider MDT read-only visibility of a patient's tasks, and (with consent) external partners like social care/family - potentially via links to the patient's existing MS Teams MDT workspace (reuses infra, avoids building an auth layer). Full-build/PII; consent + lawful basis required (real PII sharing).
- Strategic context for both: [[optica-governance-insight]] - the Optica demo showed the org WILL accept data-outside-S1 + external access when it is governance-wrapped (DCB0129, data-controller, DPIA). wardHub's approval path is the wrapper, not "store no data".
- [ ] **Tasks: replace Delete with "Mark in error" (Mike, 10 Jul)** - remove the option to
  delete a task entirely; instead a task can be marked "in error" (kept, flagged, excluded
  from active views/counts). Audit-friendly: nothing silently disappears from the record.
  Touches TaskDetailModal, diary/kanban actions, reports (exclude in-error), and needs an
  `inError`/`markedInErrorBy` field on BaseTask. Full-build feature.

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
