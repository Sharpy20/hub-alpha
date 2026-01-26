# Project Review v2: Nurse Perspective

> **Document Version:** 1.0
> **Last Updated:** 25 January 2026
> **Project:** Inpatient Hub
> **Reviewer Role:** Senior Mental Health Nurse / Ward NIC

---

## Executive Summary

This review assesses the Inpatient Hub application from the perspective of nurses working on inpatient mental health wards. The focus is on usability, workflow fit, missing features, and practical considerations for daily clinical use.

---

## User Roles Assessed

| Role | Access Level | Primary Use Case |
|------|--------------|------------------|
| Healthcare Assistant | Normal | Task viewing, bookmarks, guides |
| Staff Nurse | Normal | Full task management, referrals |
| Ward Admin/NIC | Ward Admin | Task oversight, discharge confirmation |
| Clinical Lead | Senior Admin | Cross-ward visibility, reporting |

---

## Feature Assessment by Role

### Healthcare Assistant (Normal User)

**What Works Well:**
- Quick access to bookmarks for crisis lines
- How-to guides for common procedures
- Simple, clean interface
- Ward diary visible for shift awareness

**Pain Points:**
- Cannot view patient details (appropriate restriction)
- Limited to claiming tasks, cannot create
- No observation charting integration

**Missing Features:**
- Quick timer for observations
- Escalation button for urgent concerns
- Handover summary view

**Usability Score: 7/10**

### Staff Nurse (Normal User)

**What Works Well:**
- Referral workflows with step-by-step guidance
- Clipboard copy for case notes (reduces double-entry)
- Task claiming prevents duplication of effort
- "My Tasks" view across all wards
- Patient task linking to specific patients

**Pain Points:**
- No way to add patient tasks directly (only ward tasks)
- Cannot see other nurses' workload at a glance
- Date picker not intuitive on mobile
- Task priority not visible on main diary view

**Missing Features:**
- Add patient-specific task from patient profile
- Staff workload visualization (who has capacity?)
- Medication round tracker
- Section 17 leave management
- Care plan quick access

**Usability Score: 7/10**

### Ward Admin/NIC (Ward Admin Role)

**What Works Well:**
- Discharge audit log with completion tracking
- Confirmation workflow for discharges
- Cross-ward viewing capability
- Staff task distribution visible

**Pain Points:**
- No way to assign tasks to specific staff
- Cannot override task claims
- No bulk task operations
- Audit log not exportable to clinical record format

**Missing Features:**
- Task assignment by name (not just claiming)
- Staff roster integration
- Shift handover summary generator
- Incident report linkage
- Capacity/acuity tracker
- CQC inspection evidence generator

**Usability Score: 6/10**

### Clinical Lead/Matron (Senior Admin Role)

**What Works Well:**
- All-ward visibility
- Discharge confirmation oversight
- Version feature controls

**Pain Points:**
- No aggregate reporting
- Cannot see trends over time
- No KPI dashboards

**Missing Features:**
- Ward comparison dashboard
- Task completion metrics
- Overdue task alerts
- Staff training compliance tracker
- Quality improvement indicators

**Usability Score: 5/10**

---

## Workflow Analysis

### Referral Workflow (IMHA/Advocacy Example)

**Current Flow:**
1. Open referral workflow
2. Confirm criteria
3. Download form
4. View example
5. Check related guides
6. Submit externally
7. Copy case note
8. Mark task complete

**Nurse Feedback:**
- "The step-by-step is really helpful for new staff"
- "WAGOLL examples are brilliant - wish we had these for everything"
- "Copying to clipboard saves time but I still have to paste into SystemOne manually"
- "Would be nice if it auto-added a task to follow up"

**Improvements Suggested:**
1. Auto-create follow-up task when referral submitted
2. Track referral status (sent, acknowledged, accepted)
3. Template library for common referral types
4. Direct SystemOne integration for Max+ (planned)

### Task Management Workflow

**Current Flow:**
1. View ward diary
2. Identify unclaimed task
3. Claim task
4. Complete work
5. Mark complete

**Nurse Feedback:**
- "Claiming works well - stops duplication"
- "Steal button is a good safety net"
- "Can't easily see what my colleagues have"
- "Would like to add quick tasks without full form"

**Improvements Suggested:**
1. Quick-add task button (title + priority only)
2. Staff avatar view showing claimed tasks
3. Bulk claim for shift handover
4. Recurring task patterns (daily checks)

### Discharge Workflow

**Current Flow:**
1. View patient in list
2. Open audit modal
3. Review completed/incomplete tasks
4. Confirm (ward admin only)

**Nurse Feedback:**
- "Good to see what's outstanding"
- "Confirmation step adds accountability"
- "Need to see what notes were added, not just tasks"
- "Would help to have Section 117 checklist built in"

**Improvements Suggested:**
1. Discharge checklist template
2. Section 117 eligibility check
3. GP letter generator
4. Pharmacy TTAs tracker
5. Property return confirmation

---

## Usability Observations

### Positive

| Aspect | Observation |
|--------|-------------|
| Navigation | Clear, minimal clicks to key features |
| Visual Design | Clean, not cluttered |
| Mobile | Works on phone for quick checks |
| Speed | Fast, no waiting for pages |
| Terminology | Uses familiar NHS language |

### Needs Improvement

| Aspect | Observation | Suggestion |
|--------|-------------|------------|
| Task visibility | Priority buried in details | Show priority badge on card |
| Patient search | No search on patient list | Add search/filter |
| Shift context | No shift time awareness | Filter by current shift |
| Notifications | No alerts for overdue | Add toast/badge alerts |
| Help | No in-app guidance | Add tooltips/tutorial |

---

## Missing Features (Prioritized)

### Critical (Needed for Core Use)

1. **Quick task creation** - Add task without full form
2. **Patient task from patient view** - Link directly from patient profile
3. **Overdue notifications** - Visual alerts for missed tasks
4. **Shift filtering** - View only current shift tasks

### Important (Significantly Improves Workflow)

5. **Staff workload view** - See who has capacity
6. **Task assignment** - NIC assigns rather than claim-only
7. **Handover summary** - Generate shift handover document
8. **Medication round tracker** - Drug round checklist

### Nice to Have (Future Enhancement)

9. **Section 17 leave tracker** - Manage S17 documentation
10. **Care plan links** - Quick access to care plan documents
11. **Incident linkage** - Connect tasks to Datix incidents
12. **Training tracker** - Staff competency visibility
13. **Observation timer** - Count-up for obs frequency

---

## Ease of Use Assessment

### Learning Curve

| User Type | Time to Basic Competency | Notes |
|-----------|-------------------------|-------|
| Tech-comfortable nurse | 10-15 minutes | Intuitive enough |
| Less tech-confident | 30-45 minutes | Needs walkthrough |
| Agency/bank staff | 20-30 minutes | Would need quick guide |

### Common Friction Points

1. **Finding the right workflow** - Search would help
2. **Understanding version differences** - Confusion about Light vs Max
3. **Task status meaning** - What's the difference between pending and in_progress?
4. **Who can do what** - Role permissions not obvious

### Suggested Training Approach

1. 15-minute video walkthrough
2. A4 quick reference card for each ward
3. Superuser per shift for first month
4. Built-in tooltips for first-time users

---

## Integration Gaps

### Currently Missing Integrations

| System | Impact | Priority |
|--------|--------|----------|
| SystemOne/SystmOne | High - double entry | Phase 2 |
| Rio (if applicable) | Medium | Phase 3 |
| Datix | Medium - incident links | Phase 3 |
| E-Roster | Low - nice to have | Phase 4 |
| Pharmacy systems | Medium - TTAs | Phase 3 |

### Workarounds Required

1. **Case notes**: Copy/paste from clipboard (acceptable)
2. **Patient demographics**: Manual lookup (acceptable for now)
3. **Incidents**: Record Datix number in task notes (workable)

---

## Recommendations

### Immediate (Before Ward Pilot)

1. Add quick task creation
2. Add shift filter to diary
3. Add priority badges to task cards
4. Create 15-minute training video
5. Create A4 quick reference guide

### Short-term (First 3 Months)

6. Build patient task creation from patient view
7. Add staff workload visualization
8. Create handover summary generator
9. Add overdue task notifications
10. Implement task assignment (NIC feature)

### Medium-term (6-12 Months)

11. SystemOne integration (Max+)
12. Medication round tracking
13. Section 17 leave management
14. Discharge checklist templates
15. KPI dashboard for ward managers

---

## Overall Assessment

**Would nurses use this daily?**

| Version | Verdict |
|---------|---------|
| Light | Yes - as a reference tool alongside existing processes |
| Medium | Yes - for ward task coordination (with training) |
| Max | Potentially - if patient features are complete |
| Max+ | Yes - if SystemOne integration works well |

**Key Strengths:**
- Reduces referral confusion with guided workflows
- Task claiming prevents duplication
- Clean, fast interface
- Good foundation for future features

**Key Weaknesses:**
- Limited task creation flexibility
- No staff workload visibility
- Missing some clinical safety features
- No integration with existing systems (yet)

**Overall Usability Score: 6.5/10**
*Good prototype with strong foundation. Needs polish and additional features before replacing existing processes.*

---

*This review represents potential user feedback and should be validated with actual nursing staff before finalizing priorities.*
