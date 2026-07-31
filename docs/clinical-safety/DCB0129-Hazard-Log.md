# Clinical Safety Hazard Log

## wardHub - DCB0129

| Field | Detail |
|-------|--------|
| Document reference | wardHub-HL-003 |
| Version | 0.3 (Draft) |
| Date | 31 July 2026 |
| Author | Mike - Ward Nursing Informatics Coordinator |
| Organisation | Derbyshire Healthcare NHS Foundation Trust (proposed) |
| Status | **DRAFT - not valid until a qualified Clinical Safety Officer reviews and owns it** |
| Supersedes | wardHub-HL-001 (23 Mar 2026) and wardHub-HL-002 (4 Jul 2026), now merged into this document |

---

## Note for the Clinical Safety Officer

This log was written by a ward nurse, not a Clinical Safety Officer, and it does not
pretend otherwise. It exists because the questions were worth writing down while the
product was being built, not because the author is qualified to close them.

Under DCB0129 the hazard log must be owned by a named, suitably qualified CSO. Until that
happens this document has no formal standing. It is offered as a starting point to be
corrected, re-scored, extended or discarded - whichever costs the reviewer least time.

**Where a judgement is genuinely outside the author's competence it is marked
`[CSO DECISION]` rather than guessed at.** Those are the entries to look at first.

---

## What changed in version 0.3 (31 July 2026)

Versions 0.1 and 0.2 were separate documents, with corrections to the first buried inside
the second. They are merged here into one current log. Every entry has been re-checked
against the application as it actually stands today, verified in code rather than from
notes.

| Change | Detail |
|---|---|
| **HAZ-020 closed** | Its subject, the referral chase log, was retired entirely in July 2026. Confirmed absent from the codebase. It was previously recorded as a go-live blocker for a feature that no longer exists |
| **HAZ-014 re-scoped** | Describes a Nexus Assurance webhook. No such API route exists (`src/app/api/` contains only `auth`). Re-marked as a hazard of a *proposed* integration, not a current one |
| **HAZ-013 corrected twice** | The Light/Medium/Max version system it referenced was removed. The claim in v0.2 that the demo has "no authentication at all" is also now wrong - a site-wide shared password gate was restored in July |
| **HAZ-018 corrected** | Referenced the chase log (retired) and placeholder demo names of the form `Patient_BY_1` (replaced in July with an English-literature cast) |
| **HAZ-021 corrected** | Quiz bank has grown from 364 questions across 26 topics to 942 across 43 |
| **Patient record narrowed** | In July, `legalStatus`, `alerts`, `diagnoses`, `room` and `bed` were removed from the patient record entirely and guarded by an automated test. Several hazards are scored lower as a result. The record is now name, ward, status, admission date/time, named nurse, consultant, ward professional and discharge fields |
| **HAZ-024 added** | Medical device boundary. Raised at the sponsor session on 30 July and recorded nowhere until now |
| **HAZ-025 added** | Task hand-back and the "waiting on" state, built in July after v0.2 was written |
| **HAZ-026 added** | The authoring agent fabricating source material. Observed during the 25 July policy audit, not hypothetical |
| **HAZ-027 added** | 15 open content clashes between the application and Trust policy, 6 critical, identified in July and not yet resolved |

---

## Risk assessment scales

### Severity of harm (to patient)

| Level | Category | Description |
|-------|----------|-------------|
| 1 | Negligible | No injury or harm. Minor inconvenience only |
| 2 | Minor | Minor injury or illness not requiring intervention. Short-term impact |
| 3 | Moderate | Injury or illness requiring outpatient treatment. Moderate, recoverable impact |
| 4 | Major | Serious injury or illness requiring inpatient treatment. Long-term or permanent impact |
| 5 | Catastrophic | Death or permanent, life-changing injury |

### Likelihood of occurrence

| Level | Category | Description |
|-------|----------|-------------|
| 1 | Very Low | Highly unlikely to occur. No known precedent |
| 2 | Low | Could occur but unlikely. Isolated incidents known elsewhere |
| 3 | Medium | Might occur occasionally. Has happened in similar systems |
| 4 | High | Will probably occur in most circumstances |
| 5 | Very High | Expected to occur frequently or is already occurring |

### Risk matrix

| | Negligible (1) | Minor (2) | Moderate (3) | Major (4) | Catastrophic (5) |
|---|---|---|---|---|---|
| **Very High (5)** | 5 Low | 10 Moderate | 15 Significant | 20 High | 25 Very High |
| **High (4)** | 4 Low | 8 Moderate | 12 Significant | 16 High | 20 High |
| **Medium (3)** | 3 Low | 6 Low | 9 Moderate | 12 Significant | 15 Significant |
| **Low (2)** | 2 Low | 4 Low | 6 Low | 8 Moderate | 10 Moderate |
| **Very Low (1)** | 1 Low | 2 Low | 3 Low | 4 Low | 5 Low |

### Risk acceptability

| Risk level | Score | Action |
|------------|-------|--------|
| Very High | 20-25 | Unacceptable. Eliminate or reduce before deployment |
| High | 15-19 | Unacceptable without senior clinical review and additional controls |
| Significant | 9-14 | Tolerable with documented controls and ongoing monitoring |
| Moderate | 5-8 | Acceptable with standard controls in place |
| Low | 1-4 | Acceptable. Document and monitor |

---

## Category A - Clinical content and guidance

### HAZ-001: Outdated or incorrect clinical guidance displayed

| Field | Detail |
|-------|--------|
| **Hazard** | A guide contains outdated, incorrect or misleading clinical information |
| **Cause** | Content not reviewed after policy change; source updated but guide not; editor enters incorrect information |
| **Effect** | Clinician follows incorrect process, uses wrong form, contacts wrong service, applies outdated criteria |
| **Harm** | Delayed or misdirected referral. Patient may not receive timely intervention |
| **Severity** | 3 Moderate |
| **Likelihood** | 2 Low |
| **Initial risk** | 6 Low |
| **Current controls** | 1. Every guide and link tile carries a traffic-light approval badge driven by one editable file (`src/lib/data/approval-status.ts`): green passed, amber built but awaiting sign-off, red in development. Amber is the default for anything unlisted, so the honest baseline is "not yet approved". 2. Guides link to their source policies so users can verify against the original. 3. "Report a problem" on every guide. 4. wardHub supplements existing referral processes - staff can always fall back |
| **Residual risk** | 3 Low |
| **Status** | **Open. This is the project's largest real risk.** Of 68 guides, 1 is green, 47 amber, 20 red. The controls are honest but the backlog is not cleared. See HAZ-015 |

### HAZ-002: User relies solely on a guide instead of clinical judgement

| Field | Detail |
|-------|--------|
| **Hazard** | Staff treat a guide as a definitive clinical instruction rather than a reference aid |
| **Cause** | Overreliance; misunderstanding of scope; new staff unfamiliar with when to seek supervision |
| **Effect** | Clinical decision made from a reference guide rather than proper assessment |
| **Harm** | Inappropriate or delayed clinical intervention |
| **Severity** | 4 Major |
| **Likelihood** | 1 Very Low |
| **Initial risk** | 4 Low |
| **Current controls** | 1. Guides present process steps - which form, which contact, which route - not diagnostic or treatment guidance. 2. No clinical recommendations, alerts or automated decisions are generated anywhere in the product. 3. Guidance-style tools carry a badge stating they are "pointers to think through, not a form to fill in". 4. Existing clinical supervision structures unchanged |
| **Residual risk** | 4 Low |
| **Status** | Open. Inherent residual risk accepted given controls. **Directly linked to HAZ-024** - the controls above are also what keeps the product outside medical device territory |

### HAZ-003: Incorrect contact details in a submission step

| Field | Detail |
|-------|--------|
| **Hazard** | An email address, phone number or portal link in a guide is wrong or outdated |
| **Cause** | External service changes details; data entry error; service reorganisation |
| **Effect** | Referral sent to the wrong recipient, not received, or delayed |
| **Harm** | Delayed access to service |
| **Severity** | 3 Moderate |
| **Likelihood** | 2 Low |
| **Initial risk** | 6 Low |
| **Current controls** | 1. "Report broken link" on all links and guides. 2. Submission details link to source where possible. 3. Trust-internal contacts that are not publicly findable display "Hidden in demo mode" rather than a value. 4. In July, 15 invented contact values that had been rendering as though real (fabricated `@example.nhs.net` addresses and `01234 5678xx` numbers, displayed in the same bold copyable style as verified ones) were replaced with the same placeholder. 5. Staff retain existing referral knowledge as fallback |
| **Residual risk** | 3 Low |
| **Status** | Open. See also HAZ-016 |

### HAZ-015: Approved content goes stale with no re-review trigger

| Field | Detail |
|-------|--------|
| **Hazard** | A guide signed off green stays green after the underlying policy, guidance or contact changes. The badge then actively misleads: staff trust it *because* it is marked as passed |
| **Cause** | Approval is a one-time manual edit with no recorded review date, no expiry and no scheduled re-review. Nothing prompts the owner when a source policy is updated |
| **Effect** | Staff follow a superseded process while believing it is verified |
| **Harm** | Delayed or misdirected referral; incorrect application of MHA or MCA process steps |
| **Severity** | 3 Moderate |
| **Likelihood** | 3 Medium - certain over a long enough horizon without a trigger |
| **Initial risk** | 9 Significant |
| **Current controls** | 1. Only one guide is currently green, so exposure today is minimal. 2. Guides link to source policies, which carry their own review dates. 3. "Report a problem" on every guide |
| **Proposed controls** | 1. Add a `reviewedOn` date to each approval entry and render it beside the badge. 2. Auto-demote green to amber after a set interval unless re-confirmed. 3. Maintain a register mapping each guide to its source policy and that policy's review date. 4. Make content review part of the named editor role, not a side task |
| **Residual risk** | 3 Low with proposed controls |
| **Owner** | Mike (build controls). `[CSO DECISION]` acceptable re-review interval |
| **Status** | Open. Proposed controls not built. **This is the hazard that makes the sign-off-by-specialty model necessary rather than merely tidy** |

### HAZ-016: Needed phone number hidden or wrong at the moment of use

| Field | Detail |
|-------|--------|
| **Hazard** | Staff reach for wardHub in an urgent situation and the number they need shows "Hidden in demo mode" |
| **Cause** | Deliberate demo-safety design: trust-internal numbers are suppressed. Residual cause is staff using the public demo as if it were the approved live tool |
| **Effect** | Delay while falling back to FOCUS, switchboard or a colleague |
| **Harm** | Delayed safeguarding response or referral. Genuine emergencies are out of scope by design - 999 and 2222 procedures are unchanged and the app never presents itself as an emergency resource, which caps severity |
| **Severity** | 3 Moderate |
| **Likelihood** | 2 Low |
| **Initial risk** | 6 Low |
| **Current controls** | 1. Real, publicly listed numbers (Samaritans, NHS 111, MASH, IMHA providers) display genuinely and are safe to use. 2. "Hidden in demo mode" says why the number is missing and implies where the real one lives. 3. Fabricated addresses removed entirely in July rather than left as undeliverable examples |
| **Proposed controls** | 1. Live build: replace every hidden placeholder with the verified internal number, and make "zero remaining placeholders" a go-live gate. 2. Until then, add one line to the demo disclaimer: "Internal numbers are hidden in this demo - use FOCUS or switchboard" |
| **Residual risk** | 3 Low |
| **Owner** | Mike. `[CSO DECISION]` who owns verification of internal numbers at go-live |
| **Status** | Open. Controls partly in place |

### HAZ-019: Printed or saved copies go stale after the app updates

| Field | Detail |
|-------|--------|
| **Hazard** | A guide is printed or saved as PDF, pinned to a noticeboard or filed, and the app content is later corrected. The paper copy keeps circulating with the old process |
| **Cause** | Paper has no update mechanism. Ward culture reasonably favours printed crib sheets. The app's correction model - edit once, everyone sees the fix - is defeated by printing |
| **Effect** | Staff follow superseded guidance from a printout that looks identical to the current version |
| **Harm** | As HAZ-001 and HAZ-015, but immune to in-app controls, so it earns its own entry |
| **Severity** | 3 Moderate |
| **Likelihood** | 3 Medium - printing is expected behaviour and several guides are designed to print |
| **Initial risk** | 9 Significant |
| **Current controls** | 1. Print output is a snapshot of current content, correct on the day. 2. Approval badges appear on screen, though not currently in print output |
| **Proposed controls** | 1. Print footer on every page: "Printed from wardHub on [date] - printed copies are uncontrolled, check wardHub for the current version", plus the guide's approval status. 2. Ward guidance discouraging pinned-up printouts of process guides. 3. Periodic walk-round to pull stale printouts during pilot |
| **Residual risk** | 6 Low-Moderate. Paper can never be fully controlled; the dated footer mitigates but does not eliminate |
| **Owner** | Mike (footer). `[CSO DECISION]` acceptability of the residual |
| **Status** | Open. **Print footer confirmed not built as of 31 July 2026** |

### HAZ-021: Quiz teaches an out-of-date or wrong answer

| Field | Detail |
|-------|--------|
| **Hazard** | The training quiz contains an answer that is wrong, or becomes wrong when guidance changes. Staff internalise it precisely because the format asserts a single correct option |
| **Cause** | Static bank of **942 questions across 43 topics**, roughly 61% mined from trust policy, verified at authoring but with no re-verification schedule. Pharmacology and emergency-threshold questions age fastest |
| **Effect** | Staff carry an outdated dose, threshold or legal timing into practice |
| **Harm** | Up to major if a medication answer is wrong and acted on. Mitigated by the quiz being a learning aid with no competency sign-off and no tracking - it never gates practice |
| **Severity** | 4 Major |
| **Likelihood** | 2 Low |
| **Initial risk** | 8 Moderate |
| **Current controls** | 1. Each question carries its source and a difficulty tag. 2. Bank marked DRAFT pending clinical proofread. 3. No score tracking, no certification claim. 4. Results are not visible to anyone else |
| **Proposed controls** | 1. Do not present the quiz in the trust build until clinically proofread. 2. Consider excluding medication-dose questions unless a pharmacist reviews them. 3. Show a "verified [date]" line. 4. Annual re-verification, prioritising pharmacology |
| **Residual risk** | 4 Low |
| **Owner** | Mike (proofread). `[CSO DECISION]` whether the quiz is in pilot scope at all; pharmacy review of medication questions |
| **Status** | Open. Bank is DRAFT, proofread outstanding. **The policy source is a snapshot - the quiz must never be treated as evidence that a trust policy is current** |

### HAZ-024: Functionality drifts across the medical device boundary *(new, 31 July 2026)*

| Field | Detail |
|-------|--------|
| **Hazard** | wardHub adds a feature that interprets patient information and indicates what should be done for that patient, rather than presenting an agreed process. At that point it may meet the UK definition of a medical device and require regulatory assessment it has not had |
| **Cause** | Incremental feature growth. Each individual step looks small: a guide that helps differentiate two presentations, a prompt that suggests an observation level, a checklist that scores. The boundary is crossed by accumulation, not by decision |
| **Effect** | The product operates outside its assessed scope. Regulatory exposure, and clinically a tool that staff reasonably read as authoritative when nobody has assured it to that standard |
| **Harm** | Potentially major. A patient-specific recommendation acted on without the assurance such a recommendation requires |
| **Severity** | 4 Major |
| **Likelihood** | 2 Low as currently designed |
| **Initial risk** | 8 Moderate |
| **Current controls** | 1. Guides present process, not clinical decisions - the same control as HAZ-002. 2. No patient data is interpreted anywhere; the patient record holds no clinical fields at all since the July strip. 3. No scoring, no thresholds, no alerts, no recommendations. 4. Validated tools are explicitly deferred to their host system rather than reimplemented |
| **Proposed controls** | 1. Treat this as a design constraint on every new feature, not a one-time assessment. 2. Any proposal that interprets patient information goes to the CSO before it is built, not after. 3. Record the assessment and its reasoning formally |
| **Residual risk** | `[CSO DECISION]` |
| **Owner** | `[CSO DECISION]` - this is not the author's call to make |
| **Status** | **Open, and the most important open item in this log.** Raised by the Clinical Safety Officer at the sponsor session on 30 July 2026. The room's view was that the product is not a medical device because it does not make clinical decisions. That view is recorded here as a view, not as a determination - it was reached in conversation, not by assessment, and the CSO who raised the question did not close it. A named individual was suggested as the right person to advise; that name should be captured and this entry completed |

### HAZ-026: The authoring agent fabricates source material *(new, 31 July 2026)*

| Field | Detail |
|-------|--------|
| **Hazard** | The AI agent used to build guides and audit policy produces text that looks like a verbatim quotation from a Trust policy, complete with a citation, but which appears in no document. That invented text is then used to justify a step in a guide, or to conclude that two policies agree when they do not |
| **Cause** | Inherent to the technology. Confabulation is most likely where a document is long, where an answer is expected, and where agreeing is the smoother output than disagreeing |
| **Effect** | A guide carries a process step with no basis in policy, or a genuine contradiction between two policies is silently dissolved and never surfaces for a human to resolve |
| **Harm** | Same profile as HAZ-001 - staff follow a process that is not the Trust's - but worse in one respect: the fabricated citation makes the content *look* verified, so the normal cue to check the source is removed |
| **Severity** | 3 Moderate |
| **Likelihood** | 3 Medium. **This is not theoretical. It happened during the 25 July 2026 policy audit** and was caught only by manual copy-paste of the whole source document |
| **Initial risk** | 9 Significant |
| **Current controls** | 1. The agent instructions require both sides of any claimed conflict to be quoted, which makes fabrication visible when the source is checked. 2. Guides link to their source policies, so a reader can verify. 3. Nothing reaches the site without editorial approval, and one guide of 68 is currently signed off. 4. The incident is recorded at the top of the conflict register so anyone using it is warned |
| **Proposed controls** | 1. **Quote verification as a required step in the agent instructions, not a convention** - every quoted line confirmed against the source document before the guide is accepted. This is the control that was missing when it happened. 2. Bias the instruction against agreement: an agent that cannot find a conflict must say it could not find one, never that none exists. 3. Spot-check quotations during clinical sign-off, and tell each shelf owner this is a known failure mode so they know to look for it |
| **Residual risk** | 3 Low with proposed controls |
| **Owner** | Mike (agent instructions). `[CSO DECISION]` whether quote verification should be evidenced per guide at sign-off |
| **Status** | Open. **The direction of the observed error is the point: the fabricated quote made two documents agree.** For a tool whose purpose is surfacing contradictions, inventing text that dissolves one is the most dangerous failure available to it. Any claim that the build process "flags contradictions automatically" has to be stated alongside this |

### HAZ-027: Known content clashes remain open in guides offered to a pilot *(new, 31 July 2026)*

| Field | Detail |
|-------|--------|
| **Hazard** | The July 2026 audit identified 15 points where application content may contradict Trust policy, 6 rated critical. They remain open. A pilot ward could use a guide whose defect is already documented |
| **Cause** | The audit produced leads faster than they could be verified and fixed. Verification needs a human to open each policy and confirm the wording, which has not yet happened |
| **Effect** | Staff follow a documented process step that the Trust's own policy contradicts |
| **Harm** | Varies by item, and the critical ones are not trivial: signing the wrong part of a statutory transfer form; rejecting a valid admission because the app says only original section papers are accepted; applying a rectification window to CTO recall where the Act provides none; stopping post-rapid-tranquillisation monitoring earlier than policy requires; an out-of-hours safeguarding number that may reach a children's line |
| **Severity** | 4 Major |
| **Likelihood** | 2 Low today - the affected guides are amber or red, none is signed off, and no ward is using them operationally |
| **Initial risk** | 8 Moderate now. **Higher if a pilot started before these are resolved** |
| **Current controls** | 1. No affected guide is signed off green. 2. Each item is recorded with the app text and the policy text side by side, so verification is a reading job. 3. Guides link to source policies. 4. The traffic-light badge tells staff the content is not approved |
| **Proposed controls** | 1. **Resolve or withdraw every critical item before any guide in its group goes to a shelf owner.** A reviewer whose first guide contains a known defect is unlikely to return. 2. Verify each against the source before changing anything - see HAZ-026, these are leads and not all will survive contact with the policy. 3. Treat "zero open critical clashes" as a precondition for that guide entering pilot scope |
| **Residual risk** | 4 Low once resolved |
| **Owner** | Mike (verify and fix). `[CSO DECISION]` whether zero open critical clashes should be a formal pilot gate |
| **Status** | Open. **This is the most actionable item in this log** - the work is identified, scoped and sitting in a register |

---

## Category B - Task management

### HAZ-004: Task recorded against the wrong patient

| Field | Detail |
|-------|--------|
| **Hazard** | A patient task or appointment is created against the wrong patient |
| **Cause** | Wrong selection from dropdown; similar names; user error during a busy shift |
| **Effect** | Task completed for the wrong patient, or the correct patient's task missed |
| **Harm** | Delayed care for the correct patient |
| **Severity** | 3 Moderate |
| **Likelihood** | 2 Low |
| **Initial risk** | 6 Low |
| **Current controls** | 1. Patient selection is a searchable dropdown, never free text. 2. Patient name displayed prominently on task cards. 3. Tasks viewable per patient. 4. Tasks editable after creation. 5. SystmOne remains the authoritative record |
| **Residual risk** | 3 Low |
| **Status** | Open |

### HAZ-005: A task is not completed because it was not visible

| Field | Detail |
|-------|--------|
| **Hazard** | A clinically relevant task exists but is not seen by the responsible staff member |
| **Cause** | Created on the wrong day; viewing a different ward; "hide completed" conceals active items; lost in a long list |
| **Effect** | Task or referral not actioned in time |
| **Harm** | Delayed care, missed referral, incomplete discharge process |
| **Severity** | 3 Moderate |
| **Likelihood** | 2 Low |
| **Initial risk** | 6 Low |
| **Current controls** | 1. Priority grouping, urgent items at the top of each day. 2. Tasks carry forward - they do not disappear. 3. "My Diary" filters to the user's patients; "My Jobs" shows everything personally claimed. 4. Overdue tasks stay visible and cannot be hidden. 5. Verbal handover continues alongside |
| **Residual risk** | 3 Low |
| **Status** | Open. See HAZ-025 for the specific case of tasks parked in "waiting" |

### HAZ-006: Task marked complete but the action was not carried out

| Field | Detail |
|-------|--------|
| **Hazard** | A task is marked done without the action being performed |
| **Cause** | Accidental tap; misunderstanding of scope; intentional false completion |
| **Effect** | False assurance that a care action happened |
| **Harm** | Missed care action, potentially time-sensitive |
| **Severity** | 3 Moderate |
| **Likelihood** | 2 Low |
| **Initial risk** | 6 Low |
| **Current controls** | 1. Completed tasks can be reopened. 2. Append-only history records who did what and when. 3. wardHub is not the clinical record. 4. Ward Professional oversight via "My Diary". 5. The same risk exists with a paper diary - wardHub adds visibility rather than removing it |
| **Residual risk** | 6 Low |
| **Status** | Open. Inherent operational risk, mitigated by the audit trail |

### HAZ-007: Confusion over who is responsible after a task changes hands

| Field | Detail |
|-------|--------|
| **Hazard** | A task moves between staff and both, or neither, believe they own it |
| **Cause** | Original assignee not notified; shift handover gap; simultaneous claiming |
| **Effect** | Duplicated effort or a missed task |
| **Harm** | Low if duplicated, moderate if missed |
| **Severity** | 2 Minor |
| **Likelihood** | 2 Low |
| **Initial risk** | 4 Low |
| **Current controls** | 1. Task cards show the current assignee by name. 2. Actions carry explanatory tooltips. 3. Append-only history shows every handover. 4. Tasks cannot be assigned *to* another person - only claimed, taken over or handed back. This is a deliberate design decision: it prevents work being pushed onto an absent colleague and then going undone. 5. Hand-back is structured, with no free text, and produces a case note whether or not the job was finished |
| **Residual risk** | 2 Low |
| **Status** | Open. Low risk |

### HAZ-025: A task parked as "waiting on" is never picked back up *(new, 31 July 2026)*

| Field | Detail |
|-------|--------|
| **Hazard** | A task handed back with a "waiting on" state and a chase date moves out of the active list. If nobody owns the chase, it sits in the waiting column indefinitely while the team believes it is progressing |
| **Cause** | The waiting state is deliberately restful - it exists so a half-finished job stops nagging. That same property means it can be forgotten. There is no owner on a waiting task by design, because the point is that anyone can pick it up |
| **Effect** | A referral believed to be in progress is not being chased by anyone |
| **Harm** | The exact failure the product exists to prevent: a housing or social care referral that blocks discharge, waiting on a third party, with nobody chasing. Directly extends length of stay |
| **Severity** | 3 Moderate |
| **Likelihood** | 3 Medium - this is the pre-existing ward failure mode, and the feature does not automatically remove it |
| **Initial risk** | 9 Significant |
| **Current controls** | 1. Waiting tasks display their age, so a stale one looks stale. 2. A chase date is captured at hand-back, not optional. 3. The "waiting on" lens on the overview page surfaces every waiting task across the ward in one view. 4. Hand-back generates a SystmOne case note even when the job is unfinished, so the trail exists outside the app |
| **Proposed controls** | 1. Escalate a waiting task visually once its chase date passes, rather than only showing age. 2. Make the waiting lens part of an agreed daily or shift routine during pilot, so review is a habit rather than an option. 3. Measure it: number and age of waiting tasks is one of the more meaningful pilot metrics |
| **Residual risk** | 4 Low with proposed controls |
| **Owner** | Mike (escalation display). `[CSO DECISION]` whether a chase-date breach warrants a harder prompt |
| **Status** | Open. Feature shipped July 2026, after the previous revision of this log |

### HAZ-022: Diary data is not shared between devices and does not survive refresh

| Field | Detail |
|-------|--------|
| **Hazard** | Staff believe the diary is a shared team record. It is not. Task data is held in memory only and is lost on refresh; it is not stored anywhere, on any device |
| **Cause** | Architecture: there is no server-side store. The demo resets intentionally, but the interface presents a convincing multi-user diary - claim, take over, hand back - which invites the mental model of a shared system |
| **Effect** | A task created and mentally ticked off as "in the diary" is invisible to everyone else and gone on refresh |
| **Harm** | Missed patient task or appointment; false assurance that handover information was recorded |
| **Severity** | 4 Major |
| **Likelihood** | 2 Low today, because the reset makes sustained real use self-defeating. **4 High if a build without a shared store were deployed operationally** |
| **Initial risk** | 8 Moderate as a demo. **16 High if deployed operationally unchanged - unacceptable** |
| **Current controls** | 1. In-memory reset makes the wrong mental model short-lived. 2. Paper diary and verbal handover remain the ward's actual process. 3. Home page demo disclaimer |
| **Proposed controls** | 1. **Go-live gate: the diary must sit on a shared, authenticated, server-side store before any ward uses it operationally.** 2. Until then, a diary-page notice: "Demo diary - entries are not saved and are not visible to colleagues". 3. Cross-device check as part of pilot acceptance |
| **Residual risk** | 4 Low with proposed controls |
| **Owner** | Mike. `[CSO DECISION]` + IT: server-side store as a go-live precondition |
| **Status** | **Open. Go-live blocker in the current design.** Does not block the demo continuing as a demo |

---

## Category C - Patient management

### HAZ-008: Discharge with safety-critical tasks outstanding

| Field | Detail |
|-------|--------|
| **Hazard** | A patient is discharged while outstanding tasks remain incomplete |
| **Cause** | Discharge initiated before tasks reviewed; urgent discharge; human error |
| **Effect** | Patient leaves with incomplete care actions - referrals not made, follow-up not arranged |
| **Harm** | Post-discharge safety risk; gap in community follow-up |
| **Severity** | 4 Major |
| **Likelihood** | 2 Low |
| **Initial risk** | 8 Moderate |
| **Current controls** | 1. Discharge flow lists every outstanding task with its status. 2. Ward Admin confirmation required. 3. Discharge audit log records task states at the point of discharge. 4. Tasks can be flagged as a **barrier to discharge**, which surfaces them on the patient card, in the overview and throughout reports - a discharge with an open barrier is visible before it happens. 5. wardHub does not control actual discharge; the clinical decision and SystmOne remain authoritative |
| **Residual risk** | 4 Low |
| **Status** | Open. `[CSO DECISION]` whether an open barrier should hard-block the discharge action or remain advisory |

### HAZ-009: Tasks lost or orphaned when a patient transfers ward

| Field | Detail |
|-------|--------|
| **Hazard** | On transfer, associated tasks are not properly migrated |
| **Cause** | Transfer options misunderstood; "leave on old ward" selected for tasks that should follow |
| **Effect** | Receiving ward unaware of outstanding tasks |
| **Harm** | Continuity of care disrupted |
| **Severity** | 3 Moderate |
| **Likelihood** | 2 Low |
| **Initial risk** | 6 Low |
| **Current controls** | 1. Transfer shows every task with per-task options - move, leave, remove assignee, claim. 2. Receiving ward sees the patient and migrated tasks. 3. Clinical handover between wards continues as normal |
| **Residual risk** | 3 Low |
| **Status** | Open |

### HAZ-010: Incorrect Ward Professional assignment

| Field | Detail |
|-------|--------|
| **Hazard** | A patient's Ward Professional is wrong or not updated after a staff change |
| **Cause** | Reassignment not reflected in the app; staff member leaves the ward |
| **Effect** | "My Diary" shows tasks to the wrong person; the named nurse is unaware of their patients |
| **Harm** | Accountability gap |
| **Severity** | 2 Minor |
| **Likelihood** | 2 Low |
| **Initial risk** | 4 Low |
| **Current controls** | 1. Ward Professional editable inline. 2. Only clinical roles selectable. 3. The team view shows all patients regardless of assignment. 4. SystmOne named-nurse assignment remains authoritative |
| **Residual risk** | 2 Low |
| **Status** | Open. Low risk |

### HAZ-017: Case note pasted into the wrong patient's record

| Field | Detail |
|-------|--------|
| **Hazard** | A case note copied from wardHub is pasted into the wrong patient's SystmOne record |
| **Cause** | The clipboard is a single global buffer. Copy for patient A, interruption, open patient B, paste. Busy shift, shared machine, similar names |
| **Effect** | Patient B's legal record contains patient A's narrative. Two records are now wrong, and it is a confidentiality breach of patient A |
| **Harm** | Clinical decisions made on false information. Amplified in mental health, where risk narratives drive leave, observation and discharge decisions |
| **Severity** | 4 Major |
| **Likelihood** | 2 Low |
| **Initial risk** | 8 Moderate |
| **Current controls** | 1. Copied notes prepend the linked patient's name as the first words of the text, so a wrong paste is visibly wrong at the point of paste. This is the strongest available control given SystmOne cannot be modified. 2. Patient selection is by dropdown, not typed name. 3. SystmOne's own record banner shows the open patient. 4. This failure mode already exists with every copy-paste into SystmOne; the name prefix arguably improves on the status quo |
| **Proposed controls** | 1. A one-line reminder under every copy button: "Check the name at the top of the pasted note matches the open record". 2. Include wrong-record paste in the incident categories monitored during pilot |
| **Residual risk** | 4 Low |
| **Owner** | Mike (UI). `[CSO DECISION]` pilot monitoring route |
| **Status** | Open. Primary control shipped, reminder line not built |

---

## Category D - System availability, data and defects

### HAZ-011: System unavailable, tasks not accessible

| Field | Detail |
|-------|--------|
| **Hazard** | wardHub is unavailable due to hosting outage, network issue or failed deployment |
| **Cause** | Downtime; connectivity loss; bad deploy; browser issue |
| **Effect** | Staff cannot view or update tasks; guides not reachable |
| **Harm** | Temporary loss of task visibility. Referral processes existed before wardHub and still do |
| **Severity** | 2 Minor |
| **Likelihood** | 2 Low |
| **Initial risk** | 4 Low |
| **Current controls** | 1. Paper diary remains as fallback - wardHub supplements, it does not replace. 2. Forms and SOPs remain on FOCUS. 3. SystmOne is unaffected. 4. Staff can always phone services directly |
| **Residual risk** | 4 Low |
| **Status** | Open. Acceptable given fallback processes. **Note for the CSO:** the current deployment has no branch protection on the main branch, so a red build can still ship. That is a deployment-practice gap rather than a clinical control, but it raises the likelihood of this hazard |

### HAZ-012: Data displayed incorrectly due to a software defect

| Field | Detail |
|-------|--------|
| **Hazard** | A defect causes patient data, task information or guidance to display incorrectly |
| **Cause** | Coding error; state management bug; browser compatibility |
| **Effect** | Staff see incorrect details or corrupted content |
| **Harm** | Wrong action taken on incorrect information |
| **Severity** | 3 Moderate |
| **Likelihood** | 1 Very Low |
| **Initial risk** | 3 Low |
| **Current controls** | 1. TypeScript strict mode, with a clean typecheck used as a build gate. 2. An automated test suite, including a guard test that fails the build if special-category patient fields reappear anywhere outside an allow-list. 3. All task data flows through a single state provider. 4. Source links allow verification against originals. 5. SystmOne remains authoritative. 6. Version control with automated deployment |
| **Residual risk** | 3 Low |
| **Status** | Open. Standard software risk |

### HAZ-013: Unauthorised access to patient information

| Field | Detail |
|-------|--------|
| **Hazard** | An unauthorised person views patient-identifiable information |
| **Cause** | Inadequate authentication; session not terminated; shared device left logged in |
| **Effect** | Patient data seen by someone who should not see it |
| **Harm** | Confidentiality breach. Governance and trust impact rather than direct clinical harm |
| **Severity** | 3 Moderate |
| **Likelihood** | 2 Low |
| **Initial risk** | 6 Low |
| **Current controls** | 1. **The demo holds no real patient data at all** - the entire cast is fictional and recognisably literary. 2. A site-wide shared password gate is in force; there are no individual accounts. 3. Role-based access control exists in the interface across five roles. 4. **The patient record was deliberately narrowed in July**: legal status, alerts, diagnoses, room and bed were removed entirely, leaving name, ward, status, admission and discharge dates and staff assignments. Nothing clinical. This materially reduces what a breach could expose |
| **Proposed controls** | 1. **Trust authentication before any real patient data is entered - this is a hard precondition, not an improvement.** 2. Server-side authorisation, not interface-level role checks. 3. Session timeout |
| **Residual risk** | `[CSO DECISION]` in conjunction with IG |
| **Status** | **Open. The shared password protects against strangers, not against anyone with access to the source, where it is currently stored.** Adequate for a demo with fictional data. Not adequate for anything else |

### HAZ-018: Demo mistaken for the real thing, in either direction

| Field | Detail |
|-------|--------|
| **Hazard** | (a) Staff treat fictional demo content as real ward data. (b) Staff start doing real work in the demo, believing colleagues can see it |
| **Cause** | The demo is deliberately realistic and reachable from any device. Direction (b) is the likelier failure - the tool is useful, and nothing technically stops real use |
| **Effect** | (a) Confusion and wasted effort. (b) Real coordination data siloed in one browser and lost on refresh |
| **Harm** | A task believed recorded and visible to the team is neither |
| **Severity** | 3 Moderate |
| **Likelihood** | 3 Medium - colleagues are already using the demo at work |
| **Initial risk** | 9 Significant |
| **Current controls** | 1. The cast is drawn from English literature - staff are Austen characters, patients are other classic novels. The theme is recognisable enough to read as fiction, which is why it replaced the previous realistic names. 2. Home page demo disclaimer; dev panel test-data notice. 3. Task data resets on refresh, which makes sustained real use self-defeating. 4. The password gate limits who can reach it at all |
| **Proposed controls** | 1. A persistent visual marker distinguishing demo from any future live deployment, so the two can never be confused side by side. 2. At go-live, retire or clearly fence the public demo |
| **Residual risk** | 3 Low with proposed controls |
| **Owner** | Mike |
| **Status** | Open |

### HAZ-023: Clipboard contents persist beyond the intended paste

| Field | Detail |
|-------|--------|
| **Hazard** | After the intended paste, the copied case note remains on the OS clipboard, in Windows clipboard history, and where cloud clipboard is enabled, synced to the staff member's other devices including personal ones |
| **Cause** | Operating system behaviour outside the app's control. The app can write to the clipboard but cannot clear history or prevent sync |
| **Effect** | Patient-identifiable clinical text readable later at the shared machine, or resident on a personal device |
| **Harm** | Confidentiality breach rather than direct clinical harm. Logged here because the pathway is clinical by design and the mitigation should be owned jointly by the CSO and IG |
| **Severity** | 2 Minor |
| **Likelihood** | 4 High - default Windows behaviour |
| **Initial risk** | 8 Moderate |
| **Current controls** | 1. Demo data is fictional, so today's exposure is nil. 2. The pathway is deliberate and documented - it is the app's core value, a structured note into SystmOne |
| **Proposed controls** | 1. Guidance at the copy button: paste promptly, then copy something innocuous. 2. **Trust decision on disabling clipboard history and cloud sync on ward machines via group policy - the only complete control.** 3. Include in pilot training |
| **Residual risk** | 4 Low |
| **Owner** | Trust IT (group policy); Mike (UI guidance) |
| **Status** | Open |

---

## Category E - Proposed integrations (not built)

### HAZ-014: An integration falsely marks an audit task complete

| Field | Detail |
|-------|--------|
| **Hazard** | An inbound message from an external compliance system incorrectly marks a wardHub audit task as done |
| **Cause** | Data error; identifier mismatch; replay of an old message |
| **Effect** | The ward believes an audit task is done when it is not |
| **Harm** | Missed audit. Governance concern more than direct patient risk |
| **Severity** | 2 Minor |
| **Likelihood** | 1 Very Low |
| **Initial risk** | 2 Low |
| **Current controls** | **None required: this integration does not exist.** Verified 31 July 2026 - the application has exactly one API route, for password verification. No webhook, no external integration, no SystmOne connection |
| **Proposed controls** | If the integration is ever built: authenticated inbound only; the external system remains the authoritative compliance record; one-way, so wardHub can never modify it |
| **Residual risk** | Not applicable |
| **Status** | **Not a current hazard.** Retained so the assessment exists before anyone builds it. Any integration work should re-open this entry first |

---

## Closed hazards

### HAZ-020: Referral chase log lost at logout - **CLOSED 31 July 2026**

Recorded in the previous revision as a go-live blocker. The referral chase log was retired
in full in July 2026, along with its three free-text fields. Verified absent from the
codebase on 31 July 2026.

The hazard is closed because the feature no longer exists, not because it was mitigated.
Retained here for traceability. If a chase-tracking feature returns, this entry should be
re-opened rather than rewritten - the original tension it recorded, between clearing
patient data from shared machines and keeping a persistent chase record, will return with it.

---

## Summary

**Initial risk, before proposed controls:**

| Risk level | Count | Hazard IDs |
|------------|-------|------------|
| Very High (20-25) | 0 | - |
| High (15-19) | 0 as deployed, 1 conditional | HAZ-022 reaches 16 if deployed operationally without a shared store |
| Significant (9-14) | 5 | HAZ-015, HAZ-018, HAZ-019, HAZ-025, HAZ-026 |
| Moderate (5-8) | 7 | HAZ-008, HAZ-017, HAZ-021, HAZ-022 (as demo), HAZ-023, HAZ-024, HAZ-027 |
| Low (1-4) | 13 | All others |

**Residual risk, with proposed controls implemented:**

| Risk level | Count |
|------------|-------|
| Significant or above | 0 |
| Moderate (5-8) | 1 - HAZ-019, printed copies can never be fully controlled |
| Low (1-4) | 23 |
| Not yet scored | 3 - HAZ-013, HAZ-024 and HAZ-019 residual acceptability are all `[CSO DECISION]` |

**One hazard remains a go-live blocker in its current design:** HAZ-022, no shared
server-side store. It resolves with trust-authenticated server-side storage. It does not
block the demo continuing as a demo.

---

## The things a reviewing CSO should look at first

1. **HAZ-024, the medical device boundary.** Raised at the sponsor session, closed by nobody. The most consequential open question in this document, and explicitly outside the author's competence.
2. **HAZ-027, the 15 open content clashes.** Six are rated critical and they sit in guides a pilot would plausibly use. The most actionable item here: the work is already identified and scoped, it just has not been done.
3. **HAZ-026, the agent fabricating source material.** It happened, it was caught by hand, and the control that would have caught it systematically does not yet exist. It also qualifies every claim about contradictions being flagged automatically.
4. **HAZ-001 and HAZ-015 together, the content backlog.** One guide of 68 is signed off. Every control is honest but none of them clears the backlog. This is a content problem, not a software one.
5. **HAZ-022, the absence of a shared store.** The single technical precondition for operational use.
6. **HAZ-013, authentication.** Fine for fictional data. Nothing more.
7. **HAZ-025, waiting tasks.** New, and it is the exact ward failure the product exists to fix - worth checking whether the design actually fixes it or merely relocates it.

---

## Review history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 23/03/2026 | Mike (Ward NIC) | Initial identification, 14 hazards across 5 categories (wardHub-HL-001) |
| 0.2 | 04/07/2026 | Mike (Ward NIC) | Extension log, 9 new hazards and corrections to 3 parent entries (wardHub-HL-002) |
| 0.3 | 31/07/2026 | Mike (Ward NIC) | Merged 0.1 and 0.2 into one current log. Re-verified every entry against the code. Closed HAZ-020 (feature retired), re-scoped HAZ-014 (never built), corrected HAZ-013, HAZ-018 and HAZ-021. Added HAZ-024 (medical device boundary) and HAZ-025 (waiting tasks). Marked CSO decisions explicitly |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author / project owner | Mike (Ward NIC) | 31/07/2026 | ___________________ |
| Clinical Safety Officer | _Pending appointment_ | ___/___/______ | ___________________ |

*Living document. New hazards will be added as features develop, during pilot, and on CSO
review. No entry in this log is accepted until a qualified Clinical Safety Officer has
reviewed it.*
