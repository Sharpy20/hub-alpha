# wardHub clinical safety hazard log - extension

> Draft - 4 July 2026, prepared for trust review.
>
> This document EXTENDS the existing hazard log at
> docs/clinical-safety/DCB0129-Hazard-Log.md (wardHub-HL-001, v0.1, 23 Mar 2026).
> It does not replace it. HAZ-001 to HAZ-014 remain as recorded there, except
> where the "Corrections to existing entries" section below updates a control
> that has since changed in the application. Numbering continues at HAZ-015.
> The risk scales, matrix and acceptability thresholds are unchanged from
> wardHub-HL-001 and are not repeated in full here.
>
> Written against the application as it stands on 4 July 2026 (post the data
> governance fix pass - see docs/nhs-ready/01-data-governance-audit.md). Every
> "existing control" listed below is a real, shipped feature, verified in code.

| Field | Detail |
|-------|--------|
| Document reference | wardHub-HL-002 |
| Version | 0.1 (Draft) |
| Date | 4 July 2026 |
| Author | Mike - Ward Nursing Informatics Coordinator |
| Organisation | Derbyshire Healthcare NHS Foundation Trust (proposed) |
| Status | DRAFT - pending Clinical Safety Officer review |
| Parent document | wardHub-HL-001 (23 Mar 2026) |

Scales used (from wardHub-HL-001): severity 1 negligible to 5 catastrophic;
likelihood 1 very low to 5 very high; risk = severity x likelihood; acceptability
low 1-4, moderate 5-8, significant 9-14, high 15-19, very high 20-25.

---

## Corrections to existing entries (HAZ-001 to HAZ-014)

The application has moved on since March. Three entries cite controls that no
longer exist in the form described. The hazards and ratings stand; the control
wording needs these edits at the next revision of wardHub-HL-001:

| Entry | Correction |
|-------|-----------|
| HAZ-001 | Control 2 ("Verification badge system flags content review dates") is superseded. The current control is the traffic-light approval status on every guide and link tile, driven by a single editable file (`src/lib/data/approval-status.ts`): green = passed editorial sign-off, amber = built but awaiting approval (the default for anything unlisted), red = in development, do not trust yet. The honest baseline is amber. As of 4 July 2026 exactly one guide is green (s117-meeting); around 16 are red; everything else is amber. Control 3 ("Demo Content badges") has been replaced by the same system |
| HAZ-003 | Control 3: the placeholder text is now "Hidden in demo mode", not "[INTERNAL - See FOCUS]". See also new HAZ-016, which treats the hidden-number pattern as a hazard in its own right, not only a control |
| HAZ-013 | The Light/Medium/Max version system described in the controls was removed from the codebase. The current live demo has no authentication at all (all routes open, demo identity picked from dropdowns). The hazard remains valid for the proposed live build and is now also covered by DPIA measure M1 (trust auth) in 03a-dpia-draft.md |

---

## New hazards

### Category A (continued) - clinical content and guidance

#### HAZ-015: Approved content goes stale with no re-review trigger

| Field | Detail |
|-------|--------|
| **Hazard** | A guide signed off as green remains green after the underlying policy, national guidance or service contact changes. The badge then actively misleads: staff trust content precisely because it is marked as passed |
| **Cause** | Approval status is a one-time manual edit to `approval-status.ts` with no recorded review date, no expiry and no scheduled re-review. Nothing prompts the owner when a source policy is updated |
| **Effect** | Staff follow a superseded process or use superseded criteria while believing it is verified |
| **Harm** | Delayed or misdirected referral; incorrect application of MHA/MCA process steps |
| **Existing controls** | 1. Only one guide is currently green, so exposure today is minimal. 2. Guides link to their source policies on FOCUS, so users can verify. 3. Trust policies carry their own review dates. 4. "Report problem" available on every guide |
| **Proposed controls** | 1. Add a `reviewedOn` date to each approval entry and render it beside the badge ("Passed - reviewed 4 Jul 2026"). 2. Auto-demote green to amber after a set interval (proposal: 12 months) unless re-confirmed. 3. Maintain a source-policy register mapping each guide to its trust policy and that policy's review date. 4. Make content review part of the named editor role, not a side task |
| **Severity** | 3 - Moderate |
| **Likelihood** | 3 - Medium (certain over a long enough horizon without a trigger) |
| **Initial risk** | 9 - Significant |
| **Residual risk (with proposed controls)** | 3 - Low (severity 3 x likelihood 1) |
| **Owner** | Mike (build controls); [TRUST TO CONFIRM: CSO - acceptance of the re-review interval] |
| **Status** | Open - proposed controls not yet built |

#### HAZ-016: Needed phone number hidden or wrong at the moment of use

| Field | Detail |
|-------|--------|
| **Hazard** | Staff member reaches for wardHub in an urgent situation (safeguarding concern, crisis referral, MHA office query) and the number they need displays "Hidden in demo mode", or is a fabricated example address/number they do not recognise as fake |
| **Cause** | Deliberate demo-safety design: trust-internal numbers are suppressed and seven referral inboxes were fabricated (now harmonised to the visibly fake @example.nhs.net pattern, fix F4). One real internal extension that leaked into visible content was re-hidden on 4 July (fix F3). The residual cause is staff using the public demo as if it were the approved live tool |
| **Effect** | Delay while the staff member falls back to FOCUS, switchboard or a colleague; or, worst case, a referral emailed to a fabricated address and assumed sent |
| **Harm** | Delayed safeguarding response or delayed referral. Genuine emergencies are out of scope by design (999/2222 procedures are unchanged and the app never presents itself as an emergency resource), which caps severity |
| **Existing controls** | 1. Real, publicly listed numbers (Samaritans, NHS 111, MASH, IMHA providers) display genuinely and are safe to use. 2. Fabricated addresses use @example.nhs.net, which is undeliverable - a misdirected referral bounces rather than disappearing. 3. "Hidden in demo mode" wording says why the number is missing and implies where the real one lives (FOCUS). 4. The GDPR modal no longer claims all contacts are demonstration-only (fixed 4 Jul - the previous wording was dangerous in the opposite direction, telling staff not to trust real crisis lines) |
| **Proposed controls** | 1. In the live trust build, replace every hidden placeholder with the verified internal number before launch - make "zero remaining placeholders" a go-live gate. 2. Until then, add one line to the demo disclaimer: "Internal numbers are hidden in this demo - use FOCUS or switchboard". 3. Link-health checking for external numbers/URLs (already on the backlog) |
| **Severity** | 3 - Moderate |
| **Likelihood** | 2 - Low |
| **Initial risk** | 6 - Low |
| **Residual risk (with proposed controls)** | 3 - Low |
| **Owner** | Mike; [TRUST TO CONFIRM: service owner for verifying internal numbers at go-live] |
| **Status** | Open - controls partly in place |

#### HAZ-017: Case note pasted into the wrong patient's record

| Field | Detail |
|-------|--------|
| **Hazard** | A case note copied from wardHub (guide completion note, risk screen output, MSE, care plan text) is pasted into the wrong patient's SystmOne record |
| **Cause** | The clipboard is a single global buffer. Staff member copies a note for patient A, is interrupted, opens patient B in SystmOne, pastes. Or copies for two patients in sequence and pastes the stale one. Busy shift, shared machine, similar names |
| **Effect** | Patient B's legal record contains patient A's clinical narrative. Two records are now wrong: B has false information, A is missing the entry. Also a confidentiality breach of patient A (cross-referenced as DPIA risk B4) |
| **Harm** | Clinical decisions made on false information in the record; missed referral follow-up for the correct patient. Amplified in mental health where risk narratives drive leave, observation and discharge decisions |
| **Existing controls** | 1. Copied case notes prepend the linked patient's name as the first words of the text (`src/app/guides/[id]/page.tsx`), so a wrong paste is visibly wrong at the point of paste - the strongest available control given SystmOne cannot be modified. 2. Patient selection in the app is by searchable dropdown, not typed name. 3. SystmOne's own record-open context shows the patient banner. 4. This failure mode already exists with every copy-paste into SystmOne; wardHub's name-prefix arguably improves on the status quo |
| **Proposed controls** | 1. Add a one-line reminder under every copy button: "Check the name at the top of the pasted note matches the open record". 2. Trust-side: include wrong-record paste in Datix categories monitored during pilot. 3. Consider a confirmation step showing the patient name in large text at the moment of copy |
| **Severity** | 4 - Major (false risk information in an MH record can drive leave/discharge decisions) |
| **Likelihood** | 2 - Low |
| **Initial risk** | 8 - Moderate |
| **Residual risk (with proposed controls)** | 4 - Low |
| **Owner** | Mike (UI controls); [TRUST TO CONFIRM: CSO - pilot monitoring route via Datix] |
| **Status** | Open - primary control shipped, reminder line not yet built |

#### HAZ-018: Staff mistake demo data for real, or treat the demo as the approved tool

| Field | Detail |
|-------|--------|
| **Hazard** | Two directions. (a) A staff member treats fictional demo content - patients, tasks, the demo diary - as real ward data. (b) A staff member starts doing real work in the public demo: logging real chases, tracking real care reviews, believing colleagues can see what they enter |
| **Cause** | The demo is deliberately realistic; it is publicly reachable from any device; nothing technically stops real use. Direction (b) is the likelier failure: the chase log and care tracker are useful, and localStorage means entries are invisible to everyone else and lost on logout |
| **Effect** | (a) Confusion, wasted effort. (b) Real coordination data siloed in one browser: a "chased" referral no colleague can see, a care review date that vanishes on logout |
| **Harm** | A referral believed chased and visible to the team is neither; follow-up falls through the gap |
| **Existing controls** | 1. All patient/staff names are obvious placeholders (Patient_BY_1, Staff_BY_D) - hard to mistake for real people. 2. Home page carries a live-demo disclaimer; the dev panel shows a dismissible test-data notice. 3. Demo diary data is in-memory and resets on refresh, which makes sustained real use self-defeating. 4. Logout clears the two patient-identifying stores, limiting how much real data can accumulate |
| **Proposed controls** | 1. Add a persistent visual marker distinguishing demo from any future live deployment (banner colour or watermark) so the two can never be confused side by side. 2. Chase log and care tracker pages: one-line notice "This log lives only in this browser and clears on logout - it is not shared with your team". 3. At go-live, retire or clearly fence the public demo |
| **Severity** | 3 - Moderate |
| **Likelihood** | 3 - Medium (colleagues are already using the demo at work) |
| **Initial risk** | 9 - Significant |
| **Residual risk (with proposed controls)** | 3 - Low |
| **Owner** | Mike |
| **Status** | Open - proposed notices not yet built |

#### HAZ-019: Printed or saved copies of guides go stale after the app updates

| Field | Detail |
|-------|--------|
| **Hazard** | A guide is printed (several guides and checklists are designed to print) or saved as PDF, pinned to the ward noticeboard or slipped into the Red Folder, and the app content is later corrected. The paper copy keeps circulating with the old process, old number or old form |
| **Cause** | Paper has no update mechanism. Ward culture reasonably favours printed crib sheets. The app's whole correction model (edit once, everyone sees the fix) is defeated by printing |
| **Effect** | Staff follow superseded guidance from a printout that looks identical to the current version |
| **Harm** | Same harm profile as HAZ-001/HAZ-015 (misdirected referral, superseded process) but immune to in-app controls, so it deserves its own entry |
| **Existing controls** | 1. Print output is a snapshot of current content, which is at least correct on the day of printing. 2. Approval badges appear on screen (not currently in print output) |
| **Proposed controls** | 1. Print stylesheet footer on every printed page: "Printed from wardHub on [date] - printed copies are uncontrolled, check wardHub for the current version" plus the guide's approval status. 2. Ward-level guidance discouraging pinned-up printouts of process guides (checklists intended for single-episode use are fine). 3. Periodic ward walk-round to pull stale printouts during pilot |
| **Severity** | 3 - Moderate |
| **Likelihood** | 3 - Medium (printing is expected behaviour) |
| **Initial risk** | 9 - Significant |
| **Residual risk (with proposed controls)** | 6 - Low-Moderate (paper copies can never be fully controlled; the dated-footer control mitigates but does not eliminate) |
| **Owner** | Mike (print footer); [TRUST TO CONFIRM: ward manager - local printout practice] |
| **Status** | Open - print footer not yet built (relates to backlog item #79, print stylesheet) |

#### HAZ-020: Referral chase log lost at logout - staff believe a tracked referral is still tracked

| Field | Detail |
|-------|--------|
| **Hazard** | The chase log (which holds patient name, id and free-text chase notes by design) is deliberately cleared when the user logs out - a privacy control added 4 July 2026 (fix F10). A staff member who logged chases and later logs out loses the record, possibly without realising, and the team's memory of "who chased what, when" goes with it |
| **Cause** | Direct tension between the IG control (clear patient-identifying data from shared machines) and the clinical function (a persistent chase record). The privacy fix resolved the tension in favour of privacy - correctly for a public demo, but it creates this clinical hazard |
| **Effect** | Chase history destroyed; a pending referral that looked tracked is no longer tracked anywhere except memory |
| **Harm** | Referral never chased to completion; delayed treatment. In the demo the harm is nil (fictional patients); this entry exists because the same design decision must NOT carry unmodified into live use |
| **Existing controls** | 1. Demo-only exposure today. 2. Guide completion flow prompts staff to copy the case note into SystmOne, so the referral event itself should exist in the legal record even if the chase log is wiped. 3. The GDPR page documents the logout-clear behaviour |
| **Proposed controls** | 1. Live build: chase log moves server-side with auth (DPIA measure M2) - the logout-clear then applies only to the local cache, not the record. 2. Until then, add a confirmation at logout when the chase log is non-empty: "Your chase log has N entries and will be cleared - copy anything you need into SystmOne first". 3. Chase log page notice per HAZ-018 proposed control 2 |
| **Severity** | 3 - Moderate |
| **Likelihood** | 2 - Low (demo); would be 4 - High if the current design shipped to live unchanged |
| **Initial risk** | 6 - Low (demo) / 12 - Significant (if unchanged at go-live) |
| **Residual risk (with proposed controls)** | 3 - Low |
| **Owner** | Mike; [TRUST TO CONFIRM: CSO - sign-off that server-side chase log is a go-live precondition] |
| **Status** | Open - logout warning not yet built. Flagged as a go-live blocker in current form |

#### HAZ-021: Quiz teaches an out-of-date or wrong answer

| Field | Detail |
|-------|--------|
| **Hazard** | The training quiz (364 multiple-choice questions across 26 topics, each with a confidently worded rationale) contains an answer that is wrong, or becomes wrong when NICE/BNF/MHA guidance changes. Staff internalise the wrong answer precisely because the quiz format asserts a single correct option |
| **Cause** | Static question bank; questions were web-verified against NICE/BNF/NMC and trust policy at authoring (2 Jul 2026) but have no re-verification schedule. The whole bank is still DRAFT pending clinical proofread. Pharmacology and emergency-threshold questions age fastest |
| **Effect** | Staff member carries an outdated dose, threshold or legal timing into practice |
| **Harm** | Up to major if a medication or emergency-response answer is wrong and acted on. Mitigated by the quiz being a learning aid with no link to competency sign-off and no tracking - it never gates practice |
| **Existing controls** | 1. Every question carries its source (NICE/BNF/policy reference) and a difficulty tag. 2. The bank is marked DRAFT pending Mike's proofread. 3. No score tracking, no certification claim - explicitly informal. 4. Trust policies referenced were confirmed in-date at authoring |
| **Proposed controls** | 1. Do not present the quiz in the trust build until clinically proofread; consider excluding drug-dose questions entirely unless a pharmacist reviews them. 2. Show a "questions verified [date]" line on the quiz landing page. 3. Annual re-verification pass, prioritising pharmacology/emergency topics. 4. Per-question "report this question" link feeding the existing feedback route |
| **Severity** | 4 - Major (worst case: medication-related) |
| **Likelihood** | 2 - Low |
| **Initial risk** | 8 - Moderate |
| **Residual risk (with proposed controls)** | 4 - Low |
| **Owner** | Mike (proofread + controls); [TRUST TO CONFIRM: pharmacy review of medication questions] |
| **Status** | Open - bank is DRAFT; proofread outstanding |

### Category B (continued) - task management

#### HAZ-022: Diary and task data is not shared between devices and does not survive refresh

| Field | Detail |
|-------|--------|
| **Hazard** | Staff believe the ward diary is a shared team record. In the current build it is not: demo diary data is in-memory only (wiped on page refresh), and even if persisted to localStorage it would be per-browser, per-machine. A task added at the nurses' station PC does not exist on the clinic room machine or a colleague's phone |
| **Cause** | Architecture: no server-side store. The demo intentionally resets, but the UI presents a convincing multi-user diary (claim, take over, drop), inviting the mental model of a shared system |
| **Effect** | Task created and mentally ticked off as "in the diary" is invisible to the rest of the team and vanishes on refresh |
| **Harm** | Missed patient task or appointment; false assurance that handover information was recorded |
| **Existing controls** | 1. In-memory reset makes sustained real use quickly self-evident (everything disappears), limiting how long the wrong mental model can survive. 2. Paper diary and verbal handover remain the ward's actual processes - the demo has never been positioned as the operational diary. 3. Home page demo disclaimer |
| **Proposed controls** | 1. Go-live gate: the diary must sit on a shared server-side store with auth (DPIA measure M2) before any ward uses it operationally - this hazard is the clinical twin of DPIA risks B1/B6. 2. Until then, a diary-page notice: "Demo diary - entries are not saved and are not visible to colleagues". 3. Cross-device smoke test as part of pilot acceptance |
| **Severity** | 4 - Major (missed time-critical patient task) |
| **Likelihood** | 2 - Low today (demo self-corrects); 4 - High if a localStorage-only build were deployed as the operational diary |
| **Initial risk** | 8 - Moderate (demo) / 16 - High (localStorage-only live deployment - unacceptable) |
| **Residual risk (with proposed controls)** | 4 - Low |
| **Owner** | Mike; [TRUST TO CONFIRM: CSO + IT - server-side store as go-live precondition] |
| **Status** | Open - flagged as a go-live blocker in current form |

#### HAZ-023: Clipboard contents persist beyond the intended paste

| Field | Detail |
|-------|--------|
| **Hazard** | After the intended paste into SystmOne, the copied case note (patient name + clinical narrative) remains on the OS clipboard, in Windows clipboard history (Win+V), and - where a staff member is signed into a Microsoft account with cloud clipboard enabled - synced to their other devices, including personal ones |
| **Cause** | Operating system behaviour outside the app's control. The app can write to the clipboard but cannot clear history or prevent sync |
| **Effect** | Patient-identifiable clinical text readable later by anyone at the shared machine (Win+V), or resident on a staff member's personal phone/laptop |
| **Harm** | Confidentiality breach rather than direct clinical harm - logged here because the pathway is clinical by design and the CSO should own the mitigation jointly with IG. Cross-referenced as DPIA risk B2 |
| **Existing controls** | 1. Demo data is fictional, so today's exposure is nil. 2. The pathway is deliberate and documented (it is the app's core value: structured note into SystmOne) |
| **Proposed controls** | 1. UI guidance at the copy button: paste promptly, then copy something innocuous or clear the clipboard. 2. Trust decision on disabling clipboard history and cloud clipboard sync on ward machines via group policy - the only complete control. 3. Include in pilot training one-liner |
| **Severity** | 2 - Minor (confidentiality, not direct harm) |
| **Likelihood** | 4 - High (default Windows behaviour) |
| **Initial risk** | 8 - Moderate |
| **Residual risk (with proposed controls)** | 4 - Low |
| **Owner** | [TRUST TO CONFIRM: IT - group policy on clipboard history/sync]; Mike (UI guidance) |
| **Status** | Open |

---

## Updated summary (HAZ-001 to HAZ-023)

Initial risk, before proposed controls:

| Risk level | Count | Hazard IDs |
|------------|-------|------------|
| Very high (20-25) | 0 | - |
| High (15-19) | 0 as deployed; 1 conditional | HAZ-022 would be 16 if a localStorage-only build were deployed as the operational diary - recorded as a go-live blocker, not a current exposure |
| Significant (9-14) | 3 | HAZ-015, HAZ-018, HAZ-019 (+ HAZ-020 at 12 if shipped to live unchanged) |
| Moderate (5-8) | 5 | HAZ-008 (parent log), HAZ-017, HAZ-021, HAZ-022 (demo), HAZ-023 |
| Low (1-4) | 15 | All others |

Residual risk, with proposed controls implemented:

| Risk level | Count |
|------------|-------|
| Significant or above | 0 |
| Moderate (5-8) | 1 (HAZ-019 - printed copies can never be fully controlled) |
| Low (1-4) | 22 |

Two hazards are formally flagged as **go-live blockers** in their current design:
HAZ-020 (chase log cleared at logout) and HAZ-022 (no shared server-side diary
store). Both resolve with DPIA measure M2 (trust-authenticated server-side
storage). Neither blocks the demo continuing as a demo.

---

## Review history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 04/07/2026 | Mike (Ward NIC) | Extension log: 9 new hazards (HAZ-015 to HAZ-023), corrections to 3 parent-log entries, updated combined summary |

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author / project owner | Mike (Ward NIC) | 04/07/2026 | ___________________ |
| Clinical Safety Officer | [TRUST TO CONFIRM: CSO appointment] | ___/___/______ | ___________________ |

*Living document. New hazards will be added as features develop, during pilot,
and on CSO review. All entries require CSO review before formal acceptance.*
