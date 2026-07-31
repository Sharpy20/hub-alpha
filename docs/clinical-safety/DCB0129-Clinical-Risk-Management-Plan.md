# Clinical Risk Management Plan

## wardHub - DCB 0129 Compliance

| Field | Detail |
|-------|--------|
| Document Reference | wardHub-CRMP-001 |
| Version | 0.2 (Draft) |
| Date | 31 July 2026 |
| Author | Mike - Ward Nursing Informatics Coordinator |
| Organisation | Derbyshire Healthcare NHS Foundation Trust (proposed) |
| Status | **DRAFT - not valid until a qualified Clinical Safety Officer reviews and owns it** |
| Companion documents | Hazard Log wardHub-HL-003 v0.3, Clinical Safety Case Report wardHub-CSCR-001 v0.2 |

---

## What changed in version 0.2 (31 July 2026)

| Change | Detail |
|---|---|
| **Medical device claim withdrawn** | v0.1 stated flatly that wardHub "is not classified as a medical device under MHRA guidance". **Nobody had assessed that.** The question was formally raised by a Trust Clinical Safety Officer on 30 July 2026 and is recorded as HAZ-024, open. Section 2.2 now states the position honestly and section 3.6 makes it a standing design constraint |
| **Light / Medium / Max / Max+ tiers removed** | That model was deleted from the product in early 2026. There is one build; what changes is where it runs and what data it may hold |
| **Storage description corrected** | Jobs are not stored in localStorage or anywhere else. They are page memory and a refresh wipes them (HAZ-022) |
| **Hazard log reference updated** | The current log is wardHub-HL-003 v0.3, which merges HL-001 and HL-002 |

---

## 1. Introduction

### 1.1 Purpose

This Clinical Risk Management Plan describes the processes and procedures used to identify, assess, and control clinical risks associated with the development and maintenance of wardHub.

This plan has been prepared in accordance with DCB 0129: Clinical Risk Management - its Application in the Manufacture of Health IT Systems.

### 1.2 Scope

This plan covers wardHub across its full lifecycle, from development through pilot
deployment, Trust-wide rollout, and ongoing maintenance.

**There is one build.** Version 0.1 of this plan described four deployment tiers (Light,
Medium, Max, Max+); that model was removed from the product in early 2026 and no longer
exists in any form. What changes between states is not the software but where it runs and
what data it is permitted to hold:

| State | Scope | Patient data present |
|-------|-------|----------------------|
| Demo (today) | The whole product, on a fictional cast. Jobs are not stored anywhere | No |
| Pilot (proposed) | The same product, on two wards, with real jobs and real patients | Yes |
| Trust-wide (later) | As above, plus the proposed inbound Nexus Assurance link | Yes |

**Current state:** demo only, on fictional data, behind one shared site password on
hosting outside the Trust. No patient-identifiable information is processed and no jobs are
stored. **The pilot being asked for is the full build on two wards, not a guides-only
trial** - so the clinical risk work in this plan must be read against a build that holds
real patient data, not against the demo.

### 1.3 Definitions

| Term | Definition |
|------|-----------|
| Hazard | A potential source of harm to a patient |
| Clinical Risk | The combination of the likelihood of a hazard occurring and the severity of harm that could result |
| CSO | Clinical Safety Officer - a registered clinician with clinical risk management training |
| CSCR | Clinical Safety Case Report |
| CRM | Clinical Risk Management |

---

## 2. System Description

### 2.1 What wardHub Does

wardHub is a reference and task management tool built for NHS inpatient wards. It brings together:

1. **Interactive guides** - step-by-step walkthroughs for referrals, assessments and ward
   processes. Each guide bundles the official form, the Trust SOP, a worked example,
   submission instructions, and a case note template with clipboard copy. 68 guides, of
   which 1 is signed off, 47 await review and 20 are in development.

2. **Electronic jobs diary** - a shared ward diary replacing paper-based task tracking.
   Tasks carry forward between shifts for the categories configured to carry. Staff can
   claim a job, hand it back with a structured reason and a waiting-on state, or take it
   over. Every transition appends to an audit history.

3. **Assurance as a by-product** - discharge barriers, waiting-on and review coverage build
   themselves from the jobs. **Planned but not built:** an inbound link so that completing
   an audit on Nexus Assurance ticks the matching job here. There is no such API route in
   the application today.

### 2.2 What wardHub Does NOT Do

- It does **not** replace clinical systems (SystmOne, Nexus, FOCUS), and it never writes to
  the clinical record
- It does **not** automate clinical decision-making
- It does **not** interpret patient information. It holds no clinical fields about a
  patient at all: MHA legal status, alerts and diagnoses were removed from the record on
  28 July 2026 and an automated test fails if they reappear
- It does **not** score, threshold, alert, or recommend. Validated tools are deferred to
  their host system rather than reimplemented
- It does **not** interface with medical devices
- It does **not** push data to external systems (the proposed Nexus link is inbound only)

### 2.2.1 Medical device status - OPEN

**wardHub has not been assessed against the UK definition of a medical device, and this
plan makes no claim about its classification.**

Version 0.1 of this document stated that wardHub "is not classified as a medical device
under MHRA guidance". That sentence was withdrawn on 31 July 2026. No assessment had been
carried out, by anyone, at the point it was written.

The question was raised formally by a Trust Clinical Safety Officer at the sponsor session
on 30 July 2026, and independently by a digital colleague in the same meeting, who observed
that guidance of this kind could "bleed into decision support". The view expressed in the
room was that the product is not a medical device because it prompts rather than decides.
**That is recorded here as a view reached in conversation, not as a determination.** The
person who raised it did not close it, a named individual was suggested as the right person
to advise, and neither the assessment nor the advice has yet happened.

This is tracked as **HAZ-024**, initial risk 8 (Moderate), residual `[CSO DECISION]`. The
controls that keep the product on the safe side of the line are listed in 2.2 above and are
the reason the risk is scored where it is. The hazard is drift: each new feature looks
small, and the boundary would be crossed by accumulation rather than by decision. Section
3.6 therefore makes it a standing constraint on new work rather than a one-off question.

### 2.3 Intended Users

- Ward nursing staff (all bands)
- Ward administrators
- Bank and agency staff
- Students and preceptees
- Ward managers and matrons

### 2.4 Clinical Context

The system is used in adult inpatient mental health wards. It supports operational coordination and reference - not clinical assessment, diagnosis, or treatment planning.

### 2.5 Technical Architecture

- **Frontend:** Next.js 16 (TypeScript, Tailwind CSS)
- **Data today:** jobs are React state and do not survive a page refresh, so there is no
  operational record of any kind. Only preferences reach browser localStorage. A Supabase
  project exists but is dormant - no feature in the application queries it
- **Data proposed:** a Trust-approved datastore with row-level access control. Resolving
  HAZ-022 (no shared store) is a precondition of operational use
- **Hosting today:** Vercel public cloud, outside Trust infrastructure, behind one shared
  site password with no individual accounts
- **Hosting proposed:** Trust IT infrastructure with Trust authentication
- **Integrations:** none. One API route exists in the whole application and it verifies the
  site password. The Nexus receiver is proposed, not built

---

## 3. Clinical Risk Management Process

### 3.1 Approach

Clinical risk management activities are integrated into the development lifecycle. The approach follows:

1. **Hazard identification** at each development phase
2. **Risk assessment** using a 5x5 severity/likelihood matrix
3. **Risk control** through design, process, and procedural measures
4. **Documentation** in the Hazard Log (**wardHub-HL-003 v0.3** - the current log, merging
   HL-001 and HL-002)
5. **Review** at each significant change or version increment

### 3.2 Hazard Identification Methods

Hazards are identified through:

- **Functional analysis** - reviewing each system function for potential clinical impact
- **Failure mode analysis** - considering what happens if a feature fails, shows incorrect data, or is unavailable
- **User feedback** - capturing concerns raised during pilot use
- **Incident review** - reviewing any reported issues or near-misses
- **Structured What-If Technique (SWIFT)** - scenario-based analysis of ward workflows

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
| **Very High (5)** | 5 - Low | 10 - Moderate | 15 - Significant | 20 - High | 25 - Very High |
| **High (4)** | 4 - Low | 8 - Moderate | 12 - Significant | 16 - High | 20 - High |
| **Medium (3)** | 3 - Low | 6 - Low | 9 - Moderate | 12 - Significant | 15 - Significant |
| **Low (2)** | 2 - Low | 4 - Low | 6 - Low | 8 - Moderate | 10 - Moderate |
| **Very Low (1)** | 1 - Low | 2 - Low | 3 - Low | 4 - Low | 5 - Low |

**Risk Acceptability**

| Risk Level | Score Range | Action Required |
|------------|-------------|-----------------|
| Very High | 20-25 | Unacceptable. Must be eliminated or reduced before deployment |
| High | 15-19 | Unacceptable without senior clinical review and additional controls |
| Significant | 9-14 | Tolerable with documented controls and ongoing monitoring |
| Moderate | 5-8 | Acceptable with standard controls in place |
| Low | 1-4 | Acceptable. Document and monitor |

**Where the matrix and the score range disagree, the matrix governs.** The score ranges
above are indicative only. A score of 6 reached as Medium likelihood x Minor severity sits
in a Low cell, and a 9 reached as Medium x Moderate sits in a Moderate cell, so a reader
comparing an individual hazard's band against the range table will occasionally find them
one level apart. Every hazard in the log is banded from the matrix cell.

### 3.4 Risk Control

Where risks are identified, controls are applied in the following priority order:

1. **Eliminate** - remove the hazardous feature or function
2. **Design out** - change the design to prevent the hazard
3. **Protect** - add safeguards (confirmation dialogs, validation, audit trails)
4. **Inform** - provide warnings, training materials, or guidance
5. **Accept** - document the residual risk with justification

### 3.5 Clinical Safety Officer

**Current position:** no Clinical Safety Officer has been appointed for this project.
**Appointing one is a precondition of the proposed pilot**, which holds real patient data.

A Trust Clinical Safety Officer attended the sponsor session on 30 July 2026 and raised the
medical device question now recorded as HAZ-024. That is engagement, not appointment.

**Requirements for CSO appointment:**
- Must hold current registration with a professional body (NMC, GMC, or equivalent)
- Must have completed training in clinical risk management
- Will be responsible for reviewing and approving hazard assessments, the Hazard Log, and
  the Clinical Safety Case Report

**Note:** the developer (Ward NIC, NMC registered) has carried out the hazard
identification to date. That is not a substitute for a CSO and is not offered as one.
Judgements genuinely outside the author's competence are marked `[CSO DECISION]` in the
Hazard Log rather than guessed at; there are currently three.

### 3.6 Standing constraint: the medical device boundary

HAZ-024 is a hazard of drift, not of a single decision, so it is controlled by a rule about
how work is chosen rather than by a feature.

**Any proposed feature that would interpret patient information, or indicate what should be
done for a particular patient, goes to the Clinical Safety Officer before it is built - not
after.** That includes scoring, thresholds, alerts, differentiating one presentation from
another, and recommending an observation level or an intervention.

Examples of the line as currently drawn, and deliberately so:

- Validated tools (MUST, Waterlow, falls prediction) are **not** reimplemented. The guide
  points at the host system that owns the validated instrument
- Clinical builders produce prompts to think through, never a score or a conclusion
- Guides on differentiating clinical presentations are written as **process and escalation
  only**, never as "how to tell"
- The patient record holds no clinical field, so there is nothing for the product to
  interpret even if a future feature tried to

The assessment and its reasoning are to be recorded formally once a CSO owns the log.

---

## 4. Integration with Development Lifecycle

### 4.1 Phase Gates

| Phase | CRM Activity | Output |
|-------|-------------|--------|
| Design | Initial hazard identification | Hazard Log (starter) |
| Build | Functional analysis of each feature | Updated Hazard Log |
| Pre-pilot | Risk assessment review | CSCR v0.1 |
| Demo | User feedback, incident monitoring | Updated Hazard Log |
| Pre-pilot with real data | Full hazard review with an appointed CSO, position taken on HAZ-024 | CSCR v1.0, CSO sign-off |
| Live service | Ongoing monitoring, change assessment | Maintained Hazard Log |

### 4.2 Change Management

Any significant change to wardHub triggers a clinical risk review:

- New features that interact with patient data
- Changes to data flows or storage
- Changes to task management logic (assignment, completion, handover)
- Changes to referral workflow content
- Integration changes (the proposed Nexus link)
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

wardHub is designed to require no formal training - the interactive guides serve as embedded training. However:

- An interactive demo tour is built into the application
- An intro guide and FAQ are available
- Ward champions will support adoption during pilot

---

## 7. Document Management

### 7.1 Related Documents

| Document | Reference | Status |
|----------|-----------|--------|
| Clinical Risk Management Plan | wardHub-CRMP-001 v0.2 | This document (Draft) |
| Hazard Log | **wardHub-HL-003 v0.3** | Draft, 31 Jul 2026. The current log. HL-001 and HL-002 are merged into it and must not be used separately |
| Clinical Safety Case Report | wardHub-CSCR-001 v0.2 | Draft, 31 Jul 2026 |
| Data Protection Impact Assessment | Draft | Published in full in the dev panel under Governance Documents |

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
