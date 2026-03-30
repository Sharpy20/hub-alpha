# Clinical Safety Hazard Log

## wardHub — DCB 0129 Compliance

| Field | Detail |
|-------|--------|
| Document Reference | wardHub-HL-001 |
| Version | 0.1 (Draft) |
| Date | 23 March 2026 |
| Author | Mike — Ward Nursing Informatics Coordinator |
| Organisation | Derbyshire Healthcare NHS Foundation Trust |
| Status | DRAFT — Pending Clinical Safety Officer Review |

---

## Risk Assessment Scales

### Severity of Harm (to patient)

| Level | Category | Description |
|-------|----------|-------------|
| 1 | Negligible | No injury or harm. Minor inconvenience only |
| 2 | Minor | Minor injury or illness not requiring intervention. Short-term impact |
| 3 | Moderate | Injury or illness requiring outpatient treatment. Moderate, recoverable impact |
| 4 | Major | Serious injury or illness requiring inpatient treatment. Long-term or permanent impact |
| 5 | Catastrophic | Death or permanent, life-changing injury |

### Likelihood of Occurrence

| Level | Category | Description |
|-------|----------|-------------|
| 1 | Very Low | Highly unlikely to occur. No known precedent |
| 2 | Low | Could occur but unlikely. Isolated incidents known elsewhere |
| 3 | Medium | Might occur occasionally. Has happened in similar systems |
| 4 | High | Will probably occur in most circumstances |
| 5 | Very High | Expected to occur frequently or is already occurring |

### Risk Matrix

| | Negligible (1) | Minor (2) | Moderate (3) | Major (4) | Catastrophic (5) |
|---|---|---|---|---|---|
| **Very High (5)** | 5 — Low | 10 — Moderate | 15 — Significant | 20 — High | 25 — Very High |
| **High (4)** | 4 — Low | 8 — Moderate | 12 — Significant | 16 — High | 20 — High |
| **Medium (3)** | 3 — Low | 6 — Low | 9 — Moderate | 12 — Significant | 15 — Significant |
| **Low (2)** | 2 — Low | 4 — Low | 6 — Low | 8 — Moderate | 10 — Moderate |
| **Very Low (1)** | 1 — Low | 2 — Low | 3 — Low | 4 — Low | 5 — Low |

### Risk Acceptability

| Risk Level | Score | Action |
|------------|-------|--------|
| Very High | 20–25 | Unacceptable. Eliminate or reduce before deployment |
| High | 15–19 | Unacceptable without senior clinical review and additional controls |
| Significant | 9–14 | Tolerable with documented controls and ongoing monitoring |
| Moderate | 5–8 | Acceptable with standard controls in place |
| Low | 1–4 | Acceptable. Document and monitor |

---

## Hazard Log

### Category A — Clinical Content & Guidance

#### HAZ-001: Outdated or incorrect clinical guidance displayed

| Field | Detail |
|-------|--------|
| **Hazard** | Referral workflow, how-to guide, or assessment guide contains outdated, incorrect, or misleading clinical information |
| **Cause** | Content not reviewed after policy change; source document updated but wardHub guide not; contributor enters incorrect information |
| **Effect** | Clinician follows incorrect process, uses wrong form, contacts wrong service, or applies outdated criteria |
| **Clinical Impact** | Delayed or misdirected referral. Patient may not receive timely intervention |
| **Severity** | 3 — Moderate |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 6 — Low |
| **Controls** | 1. All guides display source links so users can verify against originals. 2. Verification badge system flags content review dates. 3. "Demo Content" badges clearly mark unverified material. 4. Built-in "Report Problem" button on every guide. 5. Contributor role allows ward staff to update content with approval workflow. 6. wardHub supplements (not replaces) existing referral processes — staff can always fall back to standard methods |
| **Residual Severity** | 3 — Moderate |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 3 — Low |
| **Status** | Open — controls in place, monitoring |

#### HAZ-002: User relies solely on wardHub guide instead of clinical judgement

| Field | Detail |
|-------|--------|
| **Hazard** | Staff member treats a wardHub guide as a definitive clinical instruction rather than a reference aid |
| **Cause** | Overreliance on the tool; misunderstanding of its purpose; new staff unfamiliar with when to seek clinical supervision |
| **Effect** | Clinical decision made based on a reference guide rather than proper clinical assessment |
| **Clinical Impact** | Inappropriate or delayed clinical intervention |
| **Severity** | 4 — Major |
| **Likelihood** | 1 — Very Low |
| **Initial Risk** | 4 — Low |
| **Controls** | 1. wardHub is explicitly positioned as a reference/task aid — not a clinical decision-making tool. 2. Guides present process steps (forms, contacts, submission routes) — not diagnostic or treatment guidance. 3. No clinical recommendations, alerts, or automated decisions are generated. 4. Onboarding materials and intro guide clarify the tool's scope. 5. Existing clinical supervision structures remain unchanged |
| **Residual Severity** | 4 — Major |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 4 — Low |
| **Status** | Open — inherent residual risk accepted given controls |

#### HAZ-003: Incorrect contact details in referral submission step

| Field | Detail |
|-------|--------|
| **Hazard** | Email address, phone number, or portal link in a referral guide's submission step is wrong or outdated |
| **Cause** | External service changes contact details; initial data entry error; service reorganisation |
| **Effect** | Referral sent to wrong recipient, not received, or delayed |
| **Clinical Impact** | Delayed access to service for patient |
| **Severity** | 3 — Moderate |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 6 — Low |
| **Controls** | 1. "Report broken link" button on all bookmarks and guides. 2. Submission details link to source where possible. 3. Internal contacts display "[INTERNAL — See FOCUS]" placeholder until verified. 4. Verification badges flag last-reviewed date. 5. Staff retain existing referral knowledge as fallback |
| **Residual Severity** | 3 — Moderate |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 3 — Low |
| **Status** | Open — controls in place |

---

### Category B — Task Management

#### HAZ-004: Task assigned to wrong patient

| Field | Detail |
|-------|--------|
| **Hazard** | A patient task or appointment is created against the wrong patient record |
| **Cause** | User selects wrong patient from dropdown; patients with similar names; user error during busy shift |
| **Effect** | Task completed for wrong patient, or correct patient's task missed |
| **Clinical Impact** | Wrong patient receives intervention, or correct patient's care is delayed |
| **Severity** | 3 — Moderate |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 6 — Low |
| **Controls** | 1. Patient selection uses searchable dropdown (not free text) — reduces typo risk. 2. Patient name prominently displayed on task cards. 3. Tasks viewable per-patient (click patient name to see all their tasks). 4. Task detail modal shows full patient information. 5. Tasks can be edited after creation (reassign patient). 6. wardHub tasks supplement clinical records (SystmOne remains authoritative) |
| **Residual Severity** | 3 — Moderate |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 3 — Low |
| **Status** | Open — controls in place |

#### HAZ-005: Important task not completed because it was not visible

| Field | Detail |
|-------|--------|
| **Hazard** | A clinically relevant task is created in wardHub but not seen by the responsible staff member |
| **Cause** | Task created on wrong day; staff member viewing different ward; "hide completed" setting conceals active tasks; task lost in long list |
| **Effect** | Patient task or referral not actioned in timely manner |
| **Clinical Impact** | Delayed care, missed referral, or incomplete discharge process |
| **Severity** | 3 — Moderate |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 6 — Low |
| **Controls** | 1. Priority-based visual grouping — urgent (red), important (amber), routine (green). 2. Urgent tasks always display at top of each day column. 3. Tasks carry forward automatically — they don't disappear. 4. "My Diary" view filters to user's assigned patients. 5. "My Jobs" Kanban shows all personally claimed/assigned tasks across all days. 6. Overdue tasks remain visible and cannot be hidden. 7. wardHub supplements existing handover processes — verbal handover continues |
| **Residual Severity** | 3 — Moderate |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 3 — Low |
| **Status** | Open — controls in place |

#### HAZ-006: Task marked complete but action not actually carried out

| Field | Detail |
|-------|--------|
| **Hazard** | Staff member marks a task as completed in wardHub without actually performing the action |
| **Cause** | Accidental tap; intentional false completion; misunderstanding of task scope |
| **Effect** | Clinical record shows task done when it hasn't been. False assurance |
| **Clinical Impact** | Patient care action missed. Potential harm if time-sensitive (e.g. observations, medication-related) |
| **Severity** | 3 — Moderate |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 6 — Low |
| **Controls** | 1. Completed tasks can be reopened and moved back to active status. 2. Audit trail records who completed and when. 3. wardHub does not replace clinical documentation (SystmOne remains the legal record). 4. Ward Professional oversight of patient tasks via "My Diary" view. 5. This risk exists equally with paper diaries — wardHub adds visibility, not removes it |
| **Residual Severity** | 3 — Moderate |
| **Residual Likelihood** | 2 — Low |
| **Residual Risk** | 6 — Low |
| **Status** | Open — inherent operational risk, mitigated by audit trail |

#### HAZ-007: Task "Take Over" (reassignment) causes confusion about responsibility

| Field | Detail |
|-------|--------|
| **Hazard** | Staff member uses "Take Over" to claim a task from another user, but the original owner believes they are still responsible |
| **Cause** | Original assignee not notified of reassignment; shift handover gap; simultaneous claiming |
| **Effect** | Both or neither staff member action the task |
| **Clinical Impact** | Duplicated effort (low impact) or missed task (moderate impact) |
| **Severity** | 2 — Minor |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 4 — Low |
| **Controls** | 1. Task cards clearly show current assignee name. 2. "Take Over" action has descriptive tooltip explaining what happens. 3. Task detail modal shows assignment history. 4. Original assignee's "My Jobs" view removes the task when taken over. 5. Verbal handover practices continue alongside digital diary |
| **Residual Severity** | 2 — Minor |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 2 — Low |
| **Status** | Open — low risk, monitoring |

---

### Category C — Patient Management

#### HAZ-008: Discharge without completing safety-critical tasks

| Field | Detail |
|-------|--------|
| **Hazard** | Patient discharged from wardHub while outstanding tasks remain incomplete |
| **Cause** | Discharge initiated before all tasks reviewed; urgent discharge situation; human error |
| **Effect** | Patient leaves ward with incomplete care actions (e.g. referrals not made, follow-up not arranged) |
| **Clinical Impact** | Patient safety risk post-discharge. Potential gap in community follow-up |
| **Severity** | 4 — Major |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 8 — Moderate |
| **Controls** | 1. Discharge flow shows all outstanding tasks with completion status. 2. Ward Admin confirmation required for discharge. 3. Discharge audit log records task states at point of discharge. 4. wardHub does not control actual discharge — SystmOne and clinical decision remain authoritative. 5. 72-hour admission audit tasks auto-generated to prompt early referrals |
| **Residual Severity** | 4 — Major |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 4 — Low |
| **Status** | Open — controls in place, CSO review recommended |

#### HAZ-009: Patient transferred between wards with tasks lost or orphaned

| Field | Detail |
|-------|--------|
| **Hazard** | When a patient is transferred to another ward in wardHub, associated tasks are not properly migrated |
| **Cause** | Transfer modal options misunderstood; user selects "leave on old ward" for tasks that should follow patient |
| **Effect** | Receiving ward unaware of outstanding patient tasks |
| **Clinical Impact** | Continuity of care disrupted. Tasks may not be completed post-transfer |
| **Severity** | 3 — Moderate |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 6 — Low |
| **Controls** | 1. Patient transfer modal explicitly shows all tasks with per-task options (move / leave / remove assignee / claim). 2. Receiving ward can view transferred patient and all migrated tasks. 3. Clinical handover between wards continues as normal — wardHub supplements this. 4. SystmOne transfer remains the authoritative record |
| **Residual Severity** | 3 — Moderate |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 3 — Low |
| **Status** | Open — controls in place |

#### HAZ-010: Incorrect Ward Professional assignment

| Field | Detail |
|-------|--------|
| **Hazard** | Patient's Ward Professional (named nurse/lead) is incorrectly assigned or not updated after staff change |
| **Cause** | Staff reassignment not reflected in wardHub; admin error; staff member leaves ward |
| **Effect** | "My Diary" view shows tasks for wrong staff member. Named nurse not aware of their patients |
| **Clinical Impact** | Accountability gap — tasks for a patient visible to wrong Ward Professional |
| **Severity** | 2 — Minor |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 4 — Low |
| **Controls** | 1. Ward Professional editable inline on patient cards (Lead+ role). 2. Only Staff/Lead/Manager roles selectable as WP (not admin roles). 3. Ward Diary "Ward" view shows all patients regardless of WP assignment. 4. SystmOne named nurse assignment remains authoritative |
| **Residual Severity** | 2 — Minor |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 2 — Low |
| **Status** | Open — low risk |

---

### Category D — System Availability & Data

#### HAZ-011: System unavailable — tasks not accessible

| Field | Detail |
|-------|--------|
| **Hazard** | wardHub is unavailable due to hosting outage, network issue, or deployment failure |
| **Cause** | Server downtime; network connectivity loss; failed deployment; browser issue |
| **Effect** | Staff cannot view or update tasks. Reference guides not accessible |
| **Clinical Impact** | Temporary loss of task visibility. Referral guides not available (but processes existed before wardHub) |
| **Severity** | 2 — Minor |
| **Likelihood** | 2 — Low |
| **Initial Risk** | 4 — Low |
| **Controls** | 1. Paper diary remains as fallback — wardHub supplements, does not replace. 2. Referral forms and SOPs remain available on FOCUS and shared drives. 3. Clinical systems (SystmOne) unaffected by wardHub availability. 4. Staff can always phone services directly for referrals. 5. Trust hosting (Medium+) subject to standard Trust IT uptime SLAs |
| **Residual Severity** | 2 — Minor |
| **Residual Likelihood** | 2 — Low |
| **Residual Risk** | 4 — Low |
| **Status** | Open — acceptable given fallback processes |

#### HAZ-012: Data displayed incorrectly due to software bug

| Field | Detail |
|-------|--------|
| **Hazard** | A software defect causes patient data, task information, or clinical guidance to display incorrectly |
| **Cause** | Coding error; data corruption; browser compatibility issue; state management bug |
| **Effect** | Staff see incorrect patient details, wrong task assignments, or corrupted guide content |
| **Clinical Impact** | Potential for wrong action taken based on incorrect information |
| **Severity** | 3 — Moderate |
| **Likelihood** | 1 — Very Low |
| **Initial Risk** | 3 — Low |
| **Controls** | 1. TypeScript strict mode catches many data type errors at compile time. 2. All patient/task data sourced from single state provider — reduces inconsistency. 3. Source links on guides allow verification against originals. 4. SystmOne remains the authoritative clinical record — wardHub is supplementary. 5. Bug reporting via feedback mechanism. 6. Code version control with automated deployment checks |
| **Residual Severity** | 3 — Moderate |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 3 — Low |
| **Status** | Open — standard software risk, mitigated by controls |

#### HAZ-013: Unauthorised access to patient information (Max/Max+ only)

| Field | Detail |
|-------|--------|
| **Hazard** | Unauthorised user gains access to patient-identifiable information in wardHub |
| **Cause** | Inadequate authentication; session not terminated; shared device left logged in; client-side auth bypassed |
| **Effect** | Patient data viewed by unauthorised person |
| **Clinical Impact** | Confidentiality breach. Not direct patient harm, but governance and trust impact |
| **Severity** | 3 — Moderate |
| **Likelihood** | 2 — Low (Light version: N/A — no PII) |
| **Initial Risk** | 6 — Low |
| **Controls** | 1. Light version has zero PII — fictional demo data only. 2. Medium+ requires Trust SSO authentication (not yet implemented). 3. Role-Based Access Control with 5 levels. 4. Session timeout planned. 5. Row-Level Security on Supabase database. 6. Trust hosting behind FOCUS firewall (Medium+). 7. This hazard only applies to Max/Max+ versions — not the current pilot |
| **Residual Severity** | 3 — Moderate |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 3 — Low |
| **Status** | Open — N/A for Light pilot; controls planned for Max deployment |

---

### Category E — Nexus Integration (Max+ Only)

#### HAZ-014: Nexus webhook falsely marks audit task as complete

| Field | Detail |
|-------|--------|
| **Hazard** | A Nexus webhook message incorrectly marks a wardHub audit task as completed when it hasn't been done |
| **Cause** | Webhook data error; mapping mismatch between Nexus and wardHub task IDs; replay of old webhook |
| **Effect** | Ward believes audit task is done when it isn't. Compliance gap |
| **Clinical Impact** | Missed audit (e.g. fridge temperature, controlled drugs count). Generally low direct patient risk but governance concern |
| **Severity** | 2 — Minor |
| **Likelihood** | 1 — Very Low |
| **Initial Risk** | 2 — Low |
| **Controls** | 1. Nexus remains the authoritative compliance record — wardHub nudges are supplementary. 2. Webhook uses shared secret authentication (X-Nexus-Token). 3. One-way inbound only — wardHub cannot modify Nexus data. 4. Trust tech team responsible for webhook implementation on Nexus side. 5. This feature only exists in Max+ version (not pilot) |
| **Residual Severity** | 2 — Minor |
| **Residual Likelihood** | 1 — Very Low |
| **Residual Risk** | 2 — Low |
| **Status** | Open — Max+ only, low risk |

---

## Summary

| Risk Level | Count | Hazard IDs |
|------------|-------|------------|
| Very High (20–25) | 0 | — |
| High (15–19) | 0 | — |
| Significant (9–14) | 0 | — |
| Moderate (5–8) | 1 | HAZ-008 (initial, reduced to Low after controls) |
| Low (1–4) | 14 | All residual risks |

**All identified hazards have residual risk ratings of Low (1–4) after controls are applied.**

No hazards are rated Significant, High, or Very High after controls.

---

## Review History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 23/03/2026 | Mike (Ward NIC) | Initial hazard identification — 14 hazards across 5 categories |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Author / Project Owner | Mike (Ward NIC) | 23/03/2026 | ___________________ |
| Clinical Safety Officer | _Pending appointment_ | ___/___/______ | ___________________ |

---

*This hazard log is a living document. New hazards will be added as features develop and user feedback is received. All entries require CSO review before formal acceptance.*
