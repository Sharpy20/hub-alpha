# Clinical Safety Case Report

## wardHub - DCB 0129 Compliance

| Field | Detail |
|-------|--------|
| Document Reference | wardHub-CSCR-001 |
| Version | 0.2 (Draft) |
| Date | 31 July 2026 |
| Author | Mike - Ward Nursing Informatics Coordinator |
| Organisation | Derbyshire Healthcare NHS Foundation Trust (proposed) |
| Status | **DRAFT - not valid until a qualified Clinical Safety Officer reviews and owns it** |
| Companion documents | Hazard Log wardHub-HL-003 v0.3 (31 Jul 2026), Clinical Risk Management Plan wardHub-CRMP-001 v0.2 |

---

## What changed in version 0.2 (31 July 2026)

Version 0.1 was written on 23 March 2026 and had gone materially out of date. It was
published in the dev panel on 30 July, at which point it disagreed with the hazard log
sitting next to it. That is corrected here.

| Change | Detail |
|---|---|
| **Hazard count** | v0.1 said 14 hazards. The current log (wardHub-HL-003 v0.3) holds **27, of which 26 are open and 1 is closed** |
| **"All residual risks are Low"** | **Withdrawn.** It was true of the 14 hazards known in March. It is not true now: one residual sits at Moderate and three are explicitly unscored because they need a Clinical Safety Officer's judgement, not the author's |
| **Light / Medium / Max / Max+ version model** | **Removed.** That model was deleted from the product in early 2026. There is one build. The safety case previously argued for the safety of a version that no longer exists |
| **Medical device boundary** | Added. Raised at the sponsor session on 30 July 2026 and recorded as HAZ-024. v0.1 said only that wardHub does not *interface with* medical devices, which does not answer the question that was asked |
| **Content backlog** | Added as a named safety position. Of 68 guides, 1 is signed off. v0.1 asserted content was sourced and badged and stopped there |
| **Open content clashes** | Added. 15 points where guide content may contradict Trust policy, 6 rated critical, all open (HAZ-027) |
| **Storage claim** | v0.1 said the pilot build stores data in browser localStorage. Jobs are not stored anywhere at all - they are page memory and a refresh wipes them (HAZ-022) |

---

## 1. Executive Summary

This Clinical Safety Case Report (CSCR) documents the clinical risk management activities undertaken during the development of wardHub, a reference and task management tool for NHS inpatient wards.

wardHub has been assessed against **27 identified clinical hazards** across five categories, of which 26 are open and 1 has been closed. All are recorded, scored and controlled in the Hazard Log (wardHub-HL-003 v0.3), which is the authoritative document. This report summarises it and argues the safety position; where the two differ, the Hazard Log wins.

**Summary of residual risk, with proposed controls implemented:**

| Risk Level | Count | Detail |
|------------|-------|--------|
| Very High (20-25) | 0 | - |
| High (15-19) | 0 | - |
| Significant (9-14) | 0 | - |
| Moderate (5-8) | 1 | HAZ-019 - printed and saved copies of guidance can never be fully controlled |
| Low (1-4) | 23 | - |
| **Not yet scored** | **3** | HAZ-013, HAZ-024, and the residual acceptability of HAZ-019 are marked `[CSO DECISION]` in the log. They are outside the author's competence and are deliberately left open rather than guessed at |

**One hazard is a go-live blocker in the current design:** HAZ-022, the absence of a shared server-side job store. It resolves with Trust-authenticated server-side storage. It does not block the demo continuing as a demo.

**Key safety position:** wardHub presents agreed process. It does not interpret patient information, score, threshold, alert, or recommend, and it holds no clinical fields about a patient. It does not replace clinical systems, and staff can stop using it at any time with no impact on clinical care.

**The safety position is not, however, that everything is closed.** Three things are open and named here rather than left for a reviewer to find:

1. **The medical device boundary (HAZ-024).** Raised by a Clinical Safety Officer at the sponsor session on 30 July 2026. The view in the room was that wardHub is not a medical device because it does not make clinical decisions. That is recorded as a view, reached in conversation, not as an assessment - and the person who raised it did not close it. It is the single most consequential open question in this safety case.
2. **The content backlog (HAZ-001, HAZ-015).** Of 68 guides, 1 is signed off, 47 await review and 20 are still in development. Every guide carries a visible traffic-light badge so nothing is presented as approved when it is not, but most of the clinical content has not yet been read by the department that owns it.
3. **15 open content clashes (HAZ-027).** Points where guide content may contradict Trust policy, 6 of them rated critical, identified and not yet resolved. They sit in guides a pilot would plausibly use.

---

## 2. Introduction

### 2.1 Purpose

This report presents the clinical safety case for wardHub, providing evidence that the system is safe for its intended use. It summarises the clinical risk management process, identified hazards, applied controls, and residual risk positions.

This report has been prepared in accordance with DCB 0129: Clinical Risk Management - its Application in the Manufacture of Health IT Systems.

### 2.2 Intended Audience

- Trust Clinical Safety Officer
- Data Security and Protection Officer
- Cybersecurity Lead
- Digital Delivery Group
- Ward Managers and Matrons

### 2.3 Related Documents

| Document | Reference |
|----------|-----------|
| Clinical Risk Management Plan | wardHub-CRMP-001 v0.2 |
| Hazard Log | **wardHub-HL-003 v0.3, 31 July 2026** - the current log. HL-001 (Mar 2026) and HL-002 (Jul 2026) are merged into it and should not be used |
| Data Protection Impact Assessment | Draft, published in full in the dev panel under Governance Documents |

---

## 3. System Description

### 3.1 Overview

wardHub is a web-based reference and task management tool designed for use on NHS inpatient mental health wards at Derbyshire Healthcare NHS Foundation Trust.

It combines three functions:

1. **Interactive guides.** 68 step-by-step walkthroughs covering referrals, assessments and
   ward processes. Each links official forms, Trust SOPs, worked examples and submission
   details, and produces a case note for the user to copy into SystmOne. Every guide
   carries a visible sign-off status: **1 green, 47 awaiting review, 20 in development.**

2. **Electronic jobs diary.** Shared ward diary with task carry-forward between shifts for
   the categories configured to carry. Three views: Team Diary (whole team), My Diary
   (filtered to assigned patients), My Jobs (personal board, To do / Waiting / Done).
   Supports claiming, structured hand-back with a waiting-on state, per-day completion of
   recurring jobs, and an append-only history.

3. **Assurance by-product.** Because the jobs live here, the oversight view builds itself:
   discharge barriers, waiting-on, review coverage. **Planned, not built:** a one-way
   inbound link from Nexus Assurance so that completing an audit there ticks the matching
   job here. No such API route exists today.

### 3.2 Intended Use

- Reference tool for clinical ward processes (referrals, assessments, SOPs)
- Operational coordination tool for shift task management
- Onboarding aid for new starters, bank staff, and agency nurses
- Supplementary audit reminder (link-only today; auto-completion is planned, not built)

### 3.3 Not Intended For

- Clinical decision-making or clinical assessment
- Diagnosis, treatment planning, or prescribing
- Replacement of SystmOne, FOCUS, Nexus, or any existing clinical system
- Storing clinical notes or care plans (case note templates are copied to SystmOne, not stored in wardHub)
- Medical device use or life-critical applications

### 3.4 Deployment Model

There is **one build**. The tiered Light / Medium / Max / Max+ model described in version 0.1
of this report was removed from the product in early 2026 and no longer exists in any form.
What differs is not the software but where it runs and what data it is allowed to hold.

| State | What it is | Patient data | Hosting | Status |
|-------|-----------|--------------|---------|--------|
| Demo (today) | The whole product, with a fictional cast. Jobs are not stored anywhere | None, all fictional | Vercel, behind one shared site password | Live |
| Pilot (proposed) | The same product, on two wards, with real jobs and real patients | Yes | Trust-hosted, Trust authentication | **The ask.** Gated on DPIA, hosting approval and CSO review |
| Nexus link | A completed audit on Nexus ticks the matching job here | None additional | As above | Not built |

**The pilot being asked for is the full build on two wards, not a guides-only trial.**
Version 0.1 of this report argued the safety of a "Light" pilot carrying no patient data.
That is not what is proposed, and this safety case must not be read as covering it.

### 3.5 Technical Architecture

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16 (TypeScript), Tailwind CSS, NHS colour tokens |
| Data (demo) | Jobs are React state and do not survive a page refresh. Only preferences reach browser localStorage. See HAZ-022 |
| Data (proposed) | Trust-approved datastore. The Supabase project in the repository is configured but dormant - no feature queries it |
| Hosting (demo) | Vercel, auto-deploys from GitHub. Outside Trust infrastructure |
| Hosting (proposed) | Trust IT infrastructure |
| Authentication (demo) | One shared site password, no individual accounts, so no per-user audit trail. The role picker is a demo control, not authentication. See HAZ-013 |
| Authentication (proposed) | Trust SSO |
| Clinical system interface | None, in either state. Case notes are copied into SystmOne by a human. wardHub never writes to the clinical record |

---

## 4. Clinical Risk Management Process

### 4.1 Approach

Clinical risk management has been integrated into the development lifecycle as described in the Clinical Risk Management Plan (wardHub-CRMP-001).

Hazards were identified through:
- Functional analysis of each system feature
- Failure mode analysis (what happens if a feature fails or shows incorrect data)
- Review of similar systems and known ward workflow risks
- Structured what-if analysis of clinical scenarios

### 4.2 Risk Assessment Methodology

Each hazard was assessed using a 5x5 matrix:
- **Severity** rated 1 (Negligible) to 5 (Catastrophic)
- **Likelihood** rated 1 (Very Low) to 5 (Very High)
- **Risk score** = Severity x Likelihood
- **Risk acceptability** read off the matrix, not from the raw score alone (see Hazard Log wardHub-HL-003)

Full scales, matrix, and acceptability criteria are documented in the Hazard Log.

### 4.3 Clinical Safety Officer

**A Clinical Safety Officer has not been appointed for this project.** The developer (Ward
NIC) holds current NMC registration and clinical experience on the wards where the system
would be used, which is not the same thing and is not offered as a substitute.

A Trust Clinical Safety Officer attended the sponsor session on 30 July 2026 and raised the
medical device question recorded as HAZ-024. That is engagement, not appointment, and the
question raised there remains open.

**Appointing a named CSO is a precondition of the proposed pilot**, not of continuing the
demonstration. Until it happens, this report and the Hazard Log have no formal standing
under DCB 0129 and should be read as a starting point offered for correction.

---

## 5. Hazard Summary

### 5.1 Hazard Categories

27 hazards have been identified across 5 categories. 26 are open, 1 is closed.

| Category | Hazards | Description |
|----------|---------|-------------|
| A - Clinical content and guidance | HAZ-001 to 003, 015, 016, 019, 021, 024, 026, 027 | Accuracy and currency of guides, SOPs and contact details; the medical device boundary; fabricated source material; open clashes with Trust policy |
| B - Task management | HAZ-004 to 007, 022, 025 | Assignment, visibility, completion, hand-over and hand-back; the absence of a shared store |
| C - Patient management | HAZ-008 to 010, 017 | Discharge, patient transfer, Ward Professional assignment, case notes reaching the wrong record |
| D - System availability, data and defects | HAZ-011 to 013, 018, 023 | Downtime, software defects, unauthorised access, demo mistaken for the real thing, clipboard persistence |
| E - Proposed integrations (not built) | HAZ-014 | Falsely marking an audit task complete via the proposed Nexus link |
| Closed | HAZ-020 | Referral chase log lost at logout. Closed 31 July 2026 - the feature was retired |

### 5.2 Risk Profile

**Initial risk, before proposed controls:**

| Risk Level | Count | Hazard IDs |
|------------|-------|------------|
| Very High (20-25) | 0 | - |
| High (15-19) | 0 as deployed, 1 conditional | HAZ-022 reaches 16 if deployed operationally without a shared store |
| Significant (9-14) | 5 | HAZ-015, HAZ-018, HAZ-019, HAZ-025, HAZ-026 |
| Moderate (5-8) | 7 | HAZ-008, HAZ-017, HAZ-021, HAZ-022 (as demo), HAZ-023, HAZ-024, HAZ-027 |
| Low (1-4) | 14 | All others |

**Residual risk, with proposed controls implemented:**

| Risk Level | Count | Hazard IDs |
|------------|-------|------------|
| Significant or above | 0 | - |
| Moderate (5-8) | 1 | HAZ-019 - printed copies can never be fully controlled |
| Low (1-4) | 23 | - |
| Not yet scored | 3 | HAZ-013, HAZ-024, and the residual acceptability of HAZ-019 are `[CSO DECISION]` |

Note that "with proposed controls implemented" is a forward statement. Several of the
proposed controls do not exist yet, most obviously the shared server-side store that
resolves HAZ-022 and the content sign-off route that clears HAZ-001 and HAZ-015.

### 5.3 Highest-Severity Hazards

**HAZ-024 - functionality drifts across the medical device boundary.** Severity 4, initial
risk 8 Moderate, residual `[CSO DECISION]`. The hazard is accumulation: each individual
feature looks small, and the boundary is crossed by drift rather than by decision. Current
controls are that guides present process rather than clinical decisions, no patient
information is interpreted anywhere, the patient record holds no clinical fields at all,
and validated tools are deferred to their host system rather than reimplemented. **This is
the entry a reviewing CSO should read first.**

**HAZ-002 - user relies solely on a wardHub guide instead of clinical judgement.** Severity
4, residual Low. Controlled by positioning, by the absence of any automated clinical
decision, and by existing supervision structures being unchanged.

**HAZ-008 - discharge with safety-critical tasks outstanding.** Severity 4, initial risk 8
Moderate. Controlled by the discharge flow showing outstanding jobs, the discharge-barrier
flag, Ward Admin confirmation, the audit log, and SystmOne remaining authoritative on
discharge.

**HAZ-022 - the diary is not shared between devices and does not survive a refresh.**
8 Moderate as a demo, **16 High and unacceptable if deployed operationally unchanged.**
This is the go-live blocker.

### 5.4 Hazards that apply only to the proposed pilot

- **HAZ-013** (unauthorised access to patient information) is scored against the demo,
  which holds no real patient data and no individual accounts. A pilot holding real data
  changes it completely, and its residual is `[CSO DECISION]` for that reason.
- **HAZ-014** (Nexus falsely marking an audit complete) describes an integration that has
  never been built. There is exactly one API route in the application and it verifies the
  site password.

---

## 6. Safety Claims

### 6.1 Primary Safety Claim

**wardHub is safe to continue as a demonstration holding no real patient data, and the
residual clinical risk of the proposed two-ward pilot is capable of being reduced to an
acceptable level - subject to the three open items in section 1 being closed by a
qualified Clinical Safety Officer.**

Version 0.1 of this report claimed the stronger position that wardHub "is safe for
deployment". A safety case written by the author of the software, without a CSO, cannot
make that claim. This one deliberately does not.

### 6.2 Supporting Arguments

| # | Argument | Evidence |
|---|----------|----------|
| 1 | wardHub does not replace clinical decision-making | System design: no diagnostic features, no treatment recommendations, no scoring, no thresholds, no automated clinical alerts. Guides present process steps only (forms, contacts, submission routes). Validated tools are deferred to their host system rather than reimplemented. **This claim is the whole basis of the medical device position and is why HAZ-024 treats it as a standing design constraint rather than a one-time assessment** |
| 2 | wardHub does not replace existing clinical systems | SystmOne remains the authoritative clinical record and wardHub never writes to it. FOCUS remains the Trust intranet. Nexus remains the compliance platform |
| 3 | All identified hazards have been assessed, and controlled or explicitly left open | Hazard Log (wardHub-HL-003 v0.3): 27 hazards, 26 open. One residual at Moderate, three unscored and marked `[CSO DECISION]`, one go-live blocker named. **Not all controlled - and the log says so rather than rounding it off** |
| 4 | Guidance content is derived from Trust policy and national guidance, and its review status is visible | Every guide carries a traffic-light badge driven by a single editorial file. Source links on each guide. **The honest position is that 1 of 68 is signed off** (HAZ-001, HAZ-015), and 15 possible clashes with Trust policy are open (HAZ-027) |
| 5 | Task management supplements, and does not replace, existing ward processes | Paper diary remains as fallback. Verbal handover continues. Ward-level processes unchanged. Staff can stop using wardHub at any time |
| 6 | The demo holds no patient data, and stores nothing | All data is fictional. Jobs are page memory and are wiped by a refresh - which is a hazard in itself for operational use (HAZ-022), not a safety feature to rely on. Only preferences reach localStorage |
| 7 | Users can report problems through built-in mechanisms | "Report Problem" button on every guide. Feedback page. Verification modal with role-based options |
| 8 | The material this safety case rests on was checked by a human, not accepted from a tool | HAZ-026 records an occasion where an authoring agent produced a verbatim-looking quote, with a citation, that exists in no document - and used it to conclude a conflict was not a conflict. It was caught by manual comparison. The control that would catch it systematically does not yet exist |

### 6.3 Assumptions

1. Staff will use wardHub alongside (not instead of) existing clinical systems and supervision
2. Content will be reviewed and updated by contributors with appropriate clinical knowledge
3. Trust IT will manage hosting and infrastructure for Medium+ versions
4. A named Clinical Safety Officer will review and own this safety case before any pilot holding real patient data begins
5. Staff training needs are minimal due to intuitive design, but ward champions will support adoption

### 6.4 Limitations

1. This safety case has been prepared by the developer (Ward NIC, NMC registered), not by a formally trained Clinical Safety Officer. Under DCB 0129 it has **no formal standing** until a named, suitably qualified CSO reviews and owns it
2. The hazard log is a working identification, not a closed set. Four hazards were added on 31 July 2026 alone, one of them from a question asked in a meeting the day before
3. The proposed pilot holds real patient data and requires a completed DPIA, a Trust decision on hosting and authentication, and CSO sign-off before it can start
4. No formal usability testing has been conducted beyond the developer and ward colleagues
5. Three residual risks are unscored. This report does not estimate them, because guessing at a CSO judgement and recording it as an assessment would be worse than leaving the gap visible

---

## 7. Risk Management in Live Service

### 7.1 Monitoring

During pilot and live service, clinical safety will be monitored through:

- Built-in feedback mechanism (accessible to all users)
- "Report Problem" function on all guides and bookmarks
- Regular review of reported issues by project owner
- CSO review at agreed intervals (once appointed)

### 7.2 Incident Management

Clinical safety incidents will be:

1. Reported via Trust incident reporting system (Datix or equivalent)
2. Logged in the Hazard Log with new or updated entries
3. Assessed for severity and root cause
4. Addressed with appropriate controls
5. Escalated per the Clinical Risk Management Plan

### 7.3 Change Control

Any significant change to wardHub triggers a clinical risk review per the Clinical Risk Management Plan. Changes that affect clinical content, data flows, task management logic, or integration points require Hazard Log update and CSO review.

---

## 8. Conclusion

wardHub has been assessed against 27 identified clinical hazards, 26 of them open. With the
proposed controls implemented, one residual sits at Moderate, twenty-three at Low, and
three are unscored pending a Clinical Safety Officer's judgement.

The system's fundamental safety position rests on its role as a **supplementary reference
and coordination tool**. It does not interpret patient information, automate clinical
decisions, score, threshold, alert, recommend, or replace clinical systems, and it holds no
clinical fields about a patient.

That position is strong but it is not self-certifying, and three things are open:

1. **The medical device boundary (HAZ-024)** was raised by a Clinical Safety Officer on
   30 July 2026 and has not been closed by an assessment.
2. **The content backlog (HAZ-001, HAZ-015)**: 1 of 68 guides is signed off. The controls
   in place are honest but none of them clears the backlog.
3. **Fifteen open clashes between guide content and Trust policy (HAZ-027)**, six critical.

One technical precondition also stands in the way of operational use: **HAZ-022**, the
absence of a shared server-side store.

**Recommendation:** the demonstration is safe to continue as a demonstration. The proposed
two-ward pilot on the full build should proceed only after a qualified Clinical Safety
Officer has reviewed this report and the Hazard Log, taken a position on HAZ-024, and
either resolved or withdrawn the guides affected by HAZ-027; and after the shared store,
the DPIA and Trust authentication are in place.

---

## 9. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author / Project Owner | Mike (Ward NIC) | 31/07/2026 | ___________________ |
| Clinical Safety Officer | _Pending appointment_ | ___/___/______ | ___________________ |
| Ward Manager | _Pending_ | ___/___/______ | ___________________ |

---

*This report will be updated as the system progresses through its lifecycle. Version 1.0 will be produced following review by a named Clinical Safety Officer, and before any pilot holding real patient data begins.*
