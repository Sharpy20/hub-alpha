# Clinical Safety Case Report

## wardHub — DCB 0129 Compliance

| Field | Detail |
|-------|--------|
| Document Reference | wardHub-CSCR-001 |
| Version | 0.1 (Draft) |
| Date | 23 March 2026 |
| Author | Mike — Ward Nursing Informatics Coordinator |
| Organisation | Derbyshire Healthcare NHS Foundation Trust |
| Status | DRAFT — Pending Clinical Safety Officer Review |

---

## 1. Executive Summary

This Clinical Safety Case Report (CSCR) documents the clinical risk management activities undertaken during the development of wardHub, a reference and task management tool for NHS inpatient wards.

wardHub has been assessed against 14 identified clinical hazards across five categories. All hazards have been evaluated using a 5x5 risk matrix (severity x likelihood) and appropriate controls have been applied.

**Summary of residual risk:**

| Risk Level | Count |
|------------|-------|
| Very High (20–25) | 0 |
| High (15–19) | 0 |
| Significant (9–14) | 0 |
| Moderate (5–8) | 0 |
| Low (1–4) | 14 |

All residual risks are rated Low after controls. No hazards require elimination or senior clinical escalation before deployment of the Light version.

**Key safety position:** wardHub is a reference and task coordination tool. It does not automate clinical decisions, generate clinical recommendations, interface with medical devices, or replace clinical systems. It supplements existing ward processes — staff can stop using it at any time with no impact on clinical care.

---

## 2. Introduction

### 2.1 Purpose

This report presents the clinical safety case for wardHub, providing evidence that the system is safe for its intended use. It summarises the clinical risk management process, identified hazards, applied controls, and residual risk positions.

This report has been prepared in accordance with DCB 0129: Clinical Risk Management — its Application in the Manufacture of Health IT Systems.

### 2.2 Intended Audience

- Trust Clinical Safety Officer
- Data Security and Protection Officer
- Cybersecurity Lead
- Digital Delivery Group
- Ward Managers and Matrons

### 2.3 Related Documents

| Document | Reference |
|----------|-----------|
| Clinical Risk Management Plan | wardHub-CRMP-001 |
| Hazard Log | wardHub-HL-001 |
| Data Protection Impact Assessment | wardHub-DPIA-001 (scaffold in Dev Panel) |

---

## 3. System Description

### 3.1 Overview

wardHub is a web-based reference and task management tool designed for use on NHS inpatient mental health wards at Derbyshire Healthcare NHS Foundation Trust.

It combines three functions:

1. **Interactive Guides** — Step-by-step walkthroughs for referrals (17), assessments (7), and ward tasks (7). Each guide follows a standard 8-step template linking official forms, Trust SOPs, worked examples, submission details, and case note templates.

2. **Electronic Jobs Diary** — Shared ward diary with automatic task carry-forward between shifts. Three views: Ward Diary (whole team), My Diary (filtered to assigned patients), My Jobs (personal Kanban board). Supports task claiming, handover, and priority grouping.

3. **Nexus Nudges (Max+ only)** — Inbound webhook integration with the Trust's Nexus Assurance platform. Receives completion events to auto-mark audit tasks as done. One-way inbound — wardHub does not send data to Nexus.

### 3.2 Intended Use

- Reference tool for clinical ward processes (referrals, assessments, SOPs)
- Operational coordination tool for shift task management
- Onboarding aid for new starters, bank staff, and agency nurses
- Supplementary audit reminder system (Max+ version)

### 3.3 Not Intended For

- Clinical decision-making or clinical assessment
- Diagnosis, treatment planning, or prescribing
- Replacement of SystmOne, FOCUS, Nexus, or any existing clinical system
- Storing clinical notes or care plans (case note templates are copied to SystmOne, not stored in wardHub)
- Medical device use or life-critical applications

### 3.4 Deployment Model

| Version | Features | PII | Hosting | Current Status |
|---------|----------|-----|---------|---------------|
| Light | Guides, bookmarks, referral workflows | None | Vercel (public) | Demo-ready with fictional data |
| Medium | + Internal Trust content | None | Behind FOCUS firewall | Planned |
| Max | + Ward Diary, Patient List, Tasks | Yes | Trust infrastructure | Planned |
| Max+ | + Nexus webhook integration | Yes | Trust infrastructure | Planned |

**The Light version is the current target for pilot.** It contains no patient-identifiable information and uses entirely fictional demo data.

### 3.5 Technical Architecture

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16 (TypeScript), Tailwind CSS, NHS colour tokens |
| Data (Light) | Browser localStorage — no server transmission |
| Data (Medium+) | Supabase (PostgreSQL) with Row-Level Security |
| Hosting (Light) | Vercel (auto-deploys from GitHub) |
| Hosting (Medium+) | Trust IT infrastructure |
| Authentication (Light) | Demo login (role picker — no real auth) |
| Authentication (Medium+) | Trust SSO (planned) |

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
- **Risk acceptability** per defined thresholds (see Hazard Log wardHub-HL-001)

Full scales, matrix, and acceptability criteria are documented in the Hazard Log.

### 4.3 Clinical Safety Officer

A Clinical Safety Officer has not yet been formally appointed for this project. The developer (Ward NIC) holds current NMC registration and clinical experience on the wards where the system will be used.

**This is identified as a required action** before Max/Max+ deployment. For the Light version pilot (no PII, reference tool only), the initial hazard identification has been conducted by the developer with this report submitted for CSO review.

---

## 5. Hazard Summary

### 5.1 Hazard Categories

14 hazards have been identified across 5 categories:

| Category | Hazards | Description |
|----------|---------|-------------|
| A — Clinical Content & Guidance | HAZ-001 to HAZ-003 | Risks relating to accuracy and currency of referral guides, SOPs, and contact details |
| B — Task Management | HAZ-004 to HAZ-007 | Risks relating to task assignment, visibility, completion, and handover |
| C — Patient Management | HAZ-008 to HAZ-010 | Risks relating to discharge, patient transfer, and Ward Professional assignment |
| D — System Availability & Data | HAZ-011 to HAZ-013 | Risks relating to downtime, software bugs, and unauthorised access |
| E — Nexus Integration | HAZ-014 | Risks relating to webhook-based audit task completion (Max+ only) |

### 5.2 Risk Profile

**Initial risk (before controls):**

| Risk Level | Count | Hazard IDs |
|------------|-------|------------|
| Very High | 0 | — |
| High | 0 | — |
| Significant | 0 | — |
| Moderate | 1 | HAZ-008 |
| Low | 13 | HAZ-001 to HAZ-007, HAZ-009 to HAZ-014 |

**Residual risk (after controls):**

| Risk Level | Count | Hazard IDs |
|------------|-------|------------|
| Very High | 0 | — |
| High | 0 | — |
| Significant | 0 | — |
| Moderate | 0 | — |
| Low | 14 | All |

### 5.3 Highest-Severity Hazards

Two hazards have a severity rating of 4 (Major), both with residual risk of Low:

**HAZ-002 — User relies solely on wardHub guide instead of clinical judgement**
- Severity 4, Likelihood 1, Residual Risk 4 (Low)
- Controlled by: tool explicitly positioned as reference aid; no clinical decisions automated; existing supervision structures unchanged

**HAZ-008 — Discharge without completing safety-critical tasks**
- Severity 4, Likelihood 1, Residual Risk 4 (Low)
- Controlled by: discharge flow shows outstanding tasks; Ward Admin confirmation required; audit log; SystmOne discharge remains authoritative

### 5.4 Hazards Not Applicable to Light Pilot

The following hazards apply only to Max/Max+ versions and are not present in the Light pilot:

- HAZ-013 (unauthorised access to patient information) — Light version has no PII
- HAZ-014 (Nexus webhook false completion) — Max+ feature only

---

## 6. Safety Claims

### 6.1 Primary Safety Claim

**wardHub is safe for deployment in its intended use as a reference and task coordination tool for NHS inpatient wards.**

### 6.2 Supporting Arguments

| # | Argument | Evidence |
|---|----------|----------|
| 1 | wardHub does not replace clinical decision-making | System design: no diagnostic features, no treatment recommendations, no automated clinical alerts. Guides present process steps only (forms, contacts, submission routes) |
| 2 | wardHub does not replace existing clinical systems | SystmOne remains the authoritative clinical record. FOCUS remains the Trust intranet. Nexus remains the compliance platform. wardHub supplements all three |
| 3 | All identified hazards have been assessed and controlled | Hazard Log (wardHub-HL-001): 14 hazards identified, all with residual risk of Low |
| 4 | Guidance content is sourced from authoritative sources | All guides include source links. Verification badge system tracks review dates. "Demo Content" badges flag unverified material |
| 5 | Task management supplements (not replaces) existing ward processes | Paper diary remains as fallback. Verbal handover continues. Ward-level processes unchanged. Staff can stop using wardHub at any time |
| 6 | The Light pilot version contains no patient data | All data is fictional. No PII processed, stored, or transmitted. Browser localStorage only — no server-side data in Light version |
| 7 | Users can report problems through built-in mechanisms | "Report Problem" button on every guide. Feedback page. Verification modal with role-based options |

### 6.3 Assumptions

1. Staff will use wardHub alongside (not instead of) existing clinical systems and supervision
2. Content will be reviewed and updated by contributors with appropriate clinical knowledge
3. Trust IT will manage hosting and infrastructure for Medium+ versions
4. A Clinical Safety Officer will review this safety case before Max/Max+ deployment
5. Staff training needs are minimal due to intuitive design, but ward champions will support adoption

### 6.4 Limitations

1. This safety case has been prepared by the developer (Ward NIC, NMC registered) — not by a formally trained Clinical Safety Officer
2. The hazard log represents initial identification — additional hazards may be identified during pilot use, user feedback, or CSO review
3. The safety case for Max/Max+ versions (with PII) will require more detailed analysis, DPIA completion, and CSO sign-off
4. No formal usability testing has been conducted beyond the developer and ward colleagues

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

wardHub has been assessed against 14 identified clinical hazards. All residual risks are rated Low after controls are applied. No hazards are rated Significant, High, or Very High.

The system's fundamental safety position rests on its role as a **supplementary reference and coordination tool** — it does not automate clinical decisions, replace clinical systems, or process patient data in its pilot form.

The Light version proposed for pilot contains no patient-identifiable information, uses fictional demo data, and stores data only in the user's browser. It presents no clinical safety risks beyond those already present in existing ward processes (paper diaries, verbal handovers, manual referral processes).

**Recommendation:** wardHub Light is suitable for pilot deployment subject to Clinical Safety Officer review of this safety case and the associated Hazard Log.

---

## 9. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author / Project Owner | Mike (Ward NIC) | 23/03/2026 | ___________________ |
| Clinical Safety Officer | _Pending appointment_ | ___/___/______ | ___________________ |
| Ward Manager | _Pending_ | ___/___/______ | ___________________ |

---

*This report will be updated as the system progresses through its lifecycle. Version 1.0 will be produced following CSO review and before Max/Max+ deployment.*
