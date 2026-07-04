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

- [ ] Autism assessment guide <- Autism Referral Form (`/download_file/view/9204/685`) + AQ50 (`/download_file/view/1124/685`)
- [ ] CAMHS <- CAMHS SPOA form (`/9315/685`) + Triage & Assessment Operational Policy (`/9478/685`)
- [ ] ERP / emotion-regulation <- ERP leaflet (`/9591/685`), referral form/flowchart/guidance v12 (`/9592/685`), checklist (`/9593/685`)
- [ ] Dietitian guide <- Referring to Dietetics via SystmOne (`/9465/685`)
- [ ] ECT (if/where referenced) <- policy (`/9238/685`), anaesthesia policy (`/9237/685`), consent form 1 (`/2059/685`), consent form 4 (`/2060/685`), how-to (`/9239/685`)
- [ ] Physiotherapy guide <- MH Physio external referral form (`/9363/685`) + leaflet (`/9364/685`)
- [ ] Perinatal <- community referral form (.docx, trust site), Beeches referrer guide (`/10045/685`), community referrer guide (`/10047/685`), referral portal (perinatal.cpms.necsu.nhs.uk)
- [ ] Specialist Day Services <- referral diagram (`/2411/685`) + 4 group leaflets (Living Well 1134, CST 1132, Lifestyle Matters 1133, Coping w/ Emotions 2410)
- [ ] Discharge Liaison / placement <- DLT referral form (`/9715/685`)
- [ ] Talking Therapies references -> https://derby-talk.co.uk/for-professionals/ (and confirm Vita/Everyturn wording everywhere)
- [ ] CMHT / Living Well references -> Living Well Operational Policy (.docx) + livingwellderbyshire.org.uk
- FOCUS base host to prepend: `https://focus.derbyshirehealthcareft.nhs.uk`
- Forensic links: EXCLUDED from demo per standing flag.
- Rule 4: internal `@nhs.net` team inboxes / mobiles / extensions stay OUT of the live build.

## B. Service map (/service-map) - status + follow-ups
Built this session: ~109 demo services, 12 type clusters, node-off-node branching + parent-closed
cutoff, public contacts in detail panel, search, and real FOCUS criteria folded in (CMHT/Living Well,
ERP in/exclusions, autism assessment, + new Day Services/DLT/MH Physio). Standalone page, not in nav.

- [ ] Tighten remaining criteria from FOCUS (perinatal, CAMHS pathways, others) - best-effort now, "verify".
- [ ] Decide real home: a button on the patient profile ("what's open to this person"), pulling approved dated facts instead of manual toggles (full-build/PII feature).
- [ ] Refinement idea: a child off an "unknown" (not just "closed") parent still shows open - consider inheriting parent state.
- [ ] Sweep other FOCUS sections for more services/links (Mike logged in; only did /clinical/referrals).
- [PARK] Real vs demo: criteria stay illustrative until the full research/sign-off pass.

## C. Guides - review + edits (from homework, condensed - see homework-remaining doc for detail)
- [ ] Review-only sign-offs: ~47 amber guides for Mike to read + colour (green needs dept sign-off).
- [~] Items needing Mike's docs/photos: **MOSTLY SUPPLIED 4 Jul** in `docs 1\` - see Sections F-I. Still blocked: MHA office email; social-care secure-email name; restraint holds images (Mike to photograph).
- [ ] mh-talking-points: reorder/group + add alternative grounding/distraction techniques (needs Mike's steer on grouping).
- [ ] OT Tools: confirm the local OT form (MOHOST vs local); improve MOHOST examples.
- [ ] section-136: expand with FAQ vs leave (Mike's call).

## D. Bigger builds (each its own session)
- [PARK] Named Nurse Checklist -> schedulable tasks ticking off on the patient job list.
- [PARK] Tribunal / DST / OT-report combined builder (ties to the DLT/CHC funding finding in A/B).
- [PARK] Formulation output rethink.
- [PARK] Risk tool rethink (beyond the quick fixes done).
- [PARK] DoLS - more visual/interactive.
- [PARK] Service "town map" -> full patient-profile integration (see B).

## E. Side quests / smaller
- [ ] Quiz: add "report an issue" per question (feeds feedback board).
- [ ] Printable guide "clue cards" (title + 1 line, 4/A4, per group) for physical re-grouping.
- [ ] Diary-task audit: which other guides map to a ward diary task (like fridge-temps) -> add "mark done" buttons.
- [ ] New guides Mike flagged: informal patient contract; no-smoking-in-the-trust (Mike has material somewhere).

---

## MIKE'S HOMEWORK DUMP (4 Jul 2026 - captured, organised into A-E below)
Full verbatim capture + per-guide notes + source-doc inventory: **`docs/homework-04-Jul-2026-dump.md`**.
Source files on disk (outside repo): `E:\Hub\temp\dump july\` (doc, 6 screenshots, 2 HoNOS videos, `docs 1\` set).

**Big win:** Mike supplied the docs that were blocking guides. `docs 1\` unblocks section-132,
capacity-assessment, blanket-restrictions, abc-chart, no-smoking, informal-patient-contract (see table in the dump doc).

### F. Homework - now-actionable (unblocked by Mike's `docs 1\` docs)
- [ ] **section-132** (RED) - build from `S132_policy.docx` + `SystmOne_-_Recording_Section_132_Rights_Conversation_V1.2.pdf`; add 132 forms link + MHA office email (email still needed from Mike).
- [ ] **capacity-assessment** (amber, needs expanding) - add S1 capacity questionnaire (screenshots image1-3) + police form (`MCA - Police Capacity Ax.docx`); link S1 guide + external capacity + trust policy.
- [ ] **blanket-restrictions** (RED) - add trust guide/leaflet links from `Blanket_Restrictions_Policy_...Feb_2026_v2.docx` + FOCUS brief-guide PDF.
- [ ] **abc-chart** (amber) - better example from `completed ABC chart example.pdf`; link blank; consider builder using `ABC charts - Copy to add to.pptx`.
- [ ] **honos** (RED) - use image6 (New Cluster box) + `waa honos.mp4` / `waa honos hist.mp4`; note WAA/secure/CAMHS formats differ.
- [ ] **NEW guide: no-smoking-in-the-trust** - from `Staff legal warning. Smoking on NHS Wards.docx` (enforce; paraphernalia only returned on discharge, not for fresh air/leave).
- [ ] **NEW guide: informal patient contract** - from `SystmOne_-_Gatekeeping_Assessment_v1.pdf` + `Informal_Admission_Questionnaire_v1.pdf` (new Informal Admissions Checklist, live 9 Dec).
- [ ] **debrief** (RED->amber?) - confirm headers vs the real tool text (in dump doc); likely just a header check.
- [ ] **admission-checklist** (amber) - swap any `Michael.sharpe4` personal-SharePoint links; link built wardHub guides.
- [ ] Review **`odds and sods.pdf`** - Mike: "loads of stuff here, work through and grab it all."

### G. Homework - quick edits (small, mostly no doc needed)
- [ ] **leave-discharge-transfer** - add "Has Prenoxad been considered? y/n" + prenoxad link under substance/intoxication-on-return; add "update fire board" to day-of nurse-in-charge tasks.
- [ ] **dama** - out-of-hours: offer discharge meeting w/ regular medics + MDT; state unplanned = unsafe discharge, needs Datix; suggest short leave alternative.
- [ ] **fridge-temps** - "Mark completed for today" button that ticks the linked diary task (feeds Section E diary-task audit).
- [ ] **observation-engagement** - care-plan specifics (shower/toilet obs closeness); note lvl 1/2 rarely leave ward, MDT-agreed - fact-check + quote policy.
- [ ] **safeguarding** - reword the 39%/54% line (referrals logged + build a picture even if not taken up).
- [ ] **safeguarding-children** - the two consent press-options are about patient not family - fix.
- [ ] **domestic-abuse-guide** - make URLs clickable; source/link the CADDA-DASH; reduce text density.
- [ ] **mha-statuses** - add link to section-132 guide.
- [ ] **arrange-mha-assessment** - drop step 5 (S1 doc, covered by step 6); fix "nhs.net to nhs.net" (social care use their own secure email, name TBC from Mike).
- [ ] **admission-note** - add ward/unit names; make interactive (click a line -> pop-up suggestions, e.g. body-map/tattoos prompt for AWOL risk).
- [ ] **Flip to amber if happy:** `prenoxad`, `transfer-in`, `awol` (complete drafts - await Mike's word).

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
