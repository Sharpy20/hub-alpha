# Clinical Risk Management Plan

## wardHub — DCB 0129 Compliance

| Field | Detail |
|-------|--------|
| Document Reference | wardHub-CRMP-001 |
| Version | 0.1 (Draft) |
| Date | 23 March 2026 |
| Author | Mike — Ward Nursing Informatics Coordinator |
| Organisation | Derbyshire Healthcare NHS Foundation Trust |
| Status | DRAFT — Pending Clinical Safety Officer Review |

---

## 1. Introduction

### 1.1 Purpose

This Clinical Risk Management Plan describes the processes and procedures used to identify, assess, and control clinical risks associated with the development and maintenance of wardHub.

This plan has been prepared in accordance with DCB 0129: Clinical Risk Management — its Application in the Manufacture of Health IT Systems.

### 1.2 Scope

This plan covers all versions of wardHub across its full lifecycle, from initial development through pilot deployment, Trust-wide rollout, and ongoing maintenance.

The system operates in four deployment tiers:

| Version | Scope | PII Present |
|---------|-------|-------------|
| Light | Bookmarks, referral guides, how-to guides (public info only) | No |
| Medium | + Internal Trust content (SOPs, internal contacts) | No |
| Max | + Ward Diary, Patient List, My Tasks | Yes |
| Max+ | + Nexus Assurance webhook integration | Yes |

**Current state:** The system is in Light version (demo) using fictional test data. No patient-identifiable information is processed.

### 1.3 Definitions

| Term | Definition |
|------|-----------|
| Hazard | A potential source of harm to a patient |
| Clinical Risk | The combination of the likelihood of a hazard occurring and the severity of harm that could result |
| CSO | Clinical Safety Officer — a registered clinician with clinical risk management training |
| CSCR | Clinical Safety Case Report |
| CRM | Clinical Risk Management |

---

## 2. System Description

### 2.1 What wardHub Does

wardHub is a reference and task management tool built for NHS inpatient wards. It brings together:

1. **Interactive Guides** — Step-by-step walkthroughs for referrals, assessments, and ward processes. Each guide bundles the official form, Trust SOP, a worked example, submission instructions, and a case note template with clipboard copy.

2. **Electronic Jobs Diary** — A shared ward diary replacing paper-based task tracking. Tasks carry forward automatically between shifts. Staff can claim tasks, hand them over, or take them back.

3. **Nexus Nudges (Max+ only)** — Gentle reminders for daily audit tasks (fridge temps, controlled drugs, walkarounds) that auto-complete when the Trust's Nexus Assurance platform confirms completion via one-way inbound webhook.

### 2.2 What wardHub Does NOT Do

- It does **not** replace clinical systems (SystmOne, Nexus, FOCUS)
- It does **not** automate clinical decision-making
- It does **not** generate clinical recommendations or alerts based on patient data
- It does **not** interface with medical devices
- It is **not** classified as a medical device under MHRA guidance
- It does **not** push data to external systems (Nexus integration is inbound only)

### 2.3 Intended Users

- Ward nursing staff (all bands)
- Ward administrators
- Bank and agency staff
- Students and preceptees
- Ward managers and matrons

### 2.4 Clinical Context

The system is used in adult inpatient mental health wards. It supports operational coordination and reference — not clinical assessment, diagnosis, or treatment planning.

### 2.5 Technical Architecture

- **Frontend:** Next.js 16 (TypeScript, Tailwind CSS)
- **Data (Light):** Browser localStorage — no server-side data storage
- **Data (Medium+):** Supabase (PostgreSQL) with Row-Level Security
- **Data (Max+):** + Nexus webhook receiver (inbound only)
- **Hosting (Light):** Vercel public cloud
- **Hosting (Medium+):** Trust IT infrastructure behind FOCUS firewall

---

## 3. Clinical Risk Management Process

### 3.1 Approach

Clinical risk management activities are integrated into the development lifecycle. The approach follows:

1. **Hazard identification** at each development phase
2. **Risk assessment** using a 5x5 severity/likelihood matrix
3. **Risk control** through design, process, and procedural measures
4. **Documentation** in the Hazard Log (wardHub-HL-001)
5. **Review** at each significant change or version increment

### 3.2 Hazard Identification Methods

Hazards are identified through:

- **Functional analysis** — reviewing each system function for potential clinical impact
- **Failure mode analysis** — considering what happens if a feature fails, shows incorrect data, or is unavailable
- **User feedback** — capturing concerns raised during pilot use
- **Incident review** — reviewing any reported issues or near-misses
- **Structured What-If Technique (SWIFT)** — scenario-based analysis of ward workflows

### 3.3 Risk Assessment

Each identified hazard is assessed against two dimensions:

**Severity of Harm (to patient)**

| Level | Category | Description |
|-------|----------|-------------|
| 1 | Negligible | No injury or harm. Minor inconvenience only |
| 2 | Minor | Minor injury or illness not requiring intervention. Short-term impact |
| 3 | Moderate | Injury or illness requiring outpatient treatment. Moderate, recoverable impact |
| 4 | Major | Serious injury or illness requiring inpatient treatment. Long-term or permanent impact |
| 5 | Catastrophic | Death or permanent, life-changing injury |

**Likelihood of Occurrence**

| Level | Category | Description |
|-------|----------|-------------|
| 1 | Very Low | Highly unlikely to occur. No known precedent |
| 2 | Low | Could occur but unlikely. Isolated incidents known elsewhere |
| 3 | Medium | Might occur occasionally. Has happened in similar systems |
| 4 | High | Will probably occur in most circumstances |
| 5 | Very High | Expected to occur frequently or is already occurring |

**Risk Matrix**

| | Negligible (1) | Minor (2) | Moderate (3) | Major (4) | Catastrophic (5) |
|---|---|---|---|---|---|
| **Very High (5)** | 5 — Low | 10 — Moderate | 15 — Significant | 20 — High | 25 — Very High |
| **High (4)** | 4 — Low | 8 — Moderate | 12 — Significant | 16 — High | 20 — High |
| **Medium (3)** | 3 — Low | 6 — Low | 9 — Moderate | 12 — Significant | 15 — Significant |
| **Low (2)** | 2 — Low | 4 — Low | 6 — Low | 8 — Moderate | 10 — Moderate |
| **Very Low (1)** | 1 — Low | 2 — Low | 3 — Low | 4 — Low | 5 — Low |

**Risk Acceptability**

| Risk Level | Score Range | Action Required |
|------------|-------------|-----------------|
| Very High | 20–25 | Unacceptable. Must be eliminated or reduced before deployment |
| High | 15–19 | Unacceptable without senior clinical review and additional controls |
| Significant | 9–14 | Tolerable with documented controls and ongoing monitoring |
| Moderate | 5–8 | Acceptable with standard controls in place |
| Low | 1–4 | Acceptable. Document and monitor |

### 3.4 Risk Control

Where risks are identified, controls are applied in the following priority order:

1. **Eliminate** — remove the hazardous feature or function
2. **Design out** — change the design to prevent the hazard
3. **Protect** — add safeguards (confirmation dialogs, validation, audit trails)
4. **Inform** — provide warnings, training materials, or guidance
5. **Accept** — document the residual risk with justification

### 3.5 Clinical Safety Officer

**Current position:** A Clinical Safety Officer has not yet been formally appointed for this project. This is identified as a required action before Max/Max+ deployment.

**Requirements for CSO appointment:**
- Must hold current registration with a professional body (NMC, GMC, or equivalent)
- Must have completed training in clinical risk management
- Will be responsible for reviewing and approving hazard assessments, the Hazard Log, and the Clinical Safety Case Report

**Note:** For the Light version pilot (no PII, reference tool only), the developer (Ward NIC, NMC registered) has conducted initial hazard identification. Formal CSO review is required before any version handling patient data is deployed.

---

## 4. Integration with Development Lifecycle

### 4.1 Phase Gates

| Phase | CRM Activity | Output |
|-------|-------------|--------|
| Design | Initial hazard identification | Hazard Log (starter) |
| Build | Functional analysis of each feature | Updated Hazard Log |
| Pre-pilot | Risk assessment review | CSCR v0.1 |
| Pilot (Light) | User feedback, incident monitoring | Updated Hazard Log |
| Pre-rollout (Max) | Full hazard review with CSO | CSCR v1.0, CSO sign-off |
| Live service | Ongoing monitoring, change assessment | Maintained Hazard Log |

### 4.2 Change Management

Any significant change to wardHub triggers a clinical risk review:

- New features that interact with patient data
- Changes to data flows or storage
- Changes to task management logic (assignment, completion, handover)
- Changes to referral workflow content
- Integration changes (Nexus webhook modifications)
- Infrastructure or hosting changes

Minor changes (UI styling, non-clinical content updates, accessibility improvements) do not require clinical risk review unless they affect information presentation in a way that could cause clinical misinterpretation.

---

## 5. Incident Management

### 5.1 Reporting

Any clinical safety incident or near-miss related to wardHub should be reported through:

1. The Trust's existing incident reporting system (Datix or equivalent)
2. The wardHub feedback mechanism (built into the application)
3. Direct communication with the project owner

### 5.2 Investigation

Reported incidents will be:

1. Logged in the Hazard Log with a new hazard entry or updated existing entry
2. Assessed for severity and likelihood
3. Investigated for root cause
4. Addressed with appropriate controls
5. Reviewed by the CSO (once appointed)

### 5.3 Escalation

Incidents assessed as High or Very High risk will be escalated to:

- Ward Manager (immediate)
- Matron (within 24 hours)
- Trust Clinical Safety Officer (within 24 hours)
- Digital Services (within 48 hours)

---

## 6. Training and Competency

### 6.1 Developer Competency

The developer (Ward NIC) has:

- Current NMC registration
- Clinical experience on the wards where the system will be used
- Understanding of the clinical workflows the system supports
- Experience with the Trust's existing systems (FOCUS, SystmOne, Nexus)

### 6.2 Clinical Risk Management Training

**Current position:** The developer has not completed formal clinical safety officer training (e.g., NHS Digital Clinical Safety training course).

**Planned action:** Explore available CSO training options, or work with the Trust's appointed Clinical Safety Officer to ensure appropriate oversight.

### 6.3 User Training

wardHub is designed to require no formal training — the interactive guides serve as embedded training. However:

- An interactive demo tour is built into the application
- An intro guide and FAQ are available
- Ward champions will support adoption during pilot

---

## 7. Document Management

### 7.1 Related Documents

| Document | Reference | Status |
|----------|-----------|--------|
| Clinical Risk Management Plan | wardHub-CRMP-001 | This document (Draft) |
| Hazard Log | wardHub-HL-001 | Draft — see separate document |
| Clinical Safety Case Report | wardHub-CSCR-001 | Draft — see separate document |
| Data Protection Impact Assessment | wardHub-DPIA-001 | Scaffold (in Dev Panel) |

### 7.2 Review Schedule

This plan will be reviewed:

- Before each significant version release
- After any clinical safety incident
- At minimum annually during live service
- When requested by the CSO or Trust governance

---

## 8. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author / Project Owner | Mike (Ward NIC) | 23/03/2026 | ___________________ |
| Clinical Safety Officer | _Pending appointment_ | ___/___/______ | ___________________ |
| Ward Manager | _Pending_ | ___/___/______ | ___________________ |

---

*This document is a living document and will be updated as the project progresses through its lifecycle.*
