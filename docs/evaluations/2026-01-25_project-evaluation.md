# Project Evaluation: 25 January 2026

> **Project:** Inpatient Hub
> **Version:** Light (Demo)
> **Evaluator:** Multi-perspective AI Review
> **Status:** Phase 7 Complete, Phase 5 Complete | Phase 8-9 Pending

---

## Executive Summary

- **Project Status:** 75% complete (7.5/10 phases); demo-ready but NOT production-ready
- **Code Quality:** Well-structured TypeScript/React codebase with successful builds; feature-flag system exemplary
- **Critical Blockers:** No authentication, no testing framework, security vulnerabilities, WCAG non-compliance
- **Strengths:** Clean architecture, comprehensive feature matrix, NHS styling, intuitive clinical workflows
- **Timeline Forecast:** Medium version pilot feasible by June 2026 with focused effort on security/compliance

---

## 1. Web Developer Perspective

### Strengths

1. **Clean Architecture** - Well-organized Next.js 16 App Router structure with clear separation of concerns
2. **Feature Flag System** - Exemplary implementation in `src/app/providers.tsx` (lines 49-97) with comprehensive version matrix
3. **Type Safety** - Strict TypeScript configuration; 267-line type definitions in `src/lib/types/index.ts`
4. **Modern Stack** - React 19.2, Next.js 16.1.4, Tailwind CSS 4, all dependencies current
5. **Build Health** - Compiles successfully with zero errors or warnings

### Technical Debt & Flaws

1. **No Testing Framework** - Zero tests exist; package.json has no testing dependencies
2. **Security Gaps** - No input validation, XSS vulnerabilities, unencrypted localStorage
3. **Error Handling** - No try-catch blocks, no error boundaries, no fallback UI
4. **Performance** - 100+ items loaded into state without pagination or virtualization
5. **State Management** - No persistence; all changes lost on refresh

### Recommendations

| Priority | Item | Effort |
|----------|------|--------|
| Critical | Add Jest + React Testing Library; target 50% coverage | 3-4 days |
| Critical | Input validation with Zod schemas | 1-2 days |
| Critical | Error boundaries around major sections | 1 day |
| High | Pagination for patient/task lists | 1 day |
| High | Move to Supabase for persistence | 2-3 days |

---

## 2. Clinical User Perspective (Nurse)

### What Works Well

1. **Quick Reference** - Crisis contacts via bookmark carousel; one-click access to vital numbers
2. **Task Management** - Kanban board with claim/unclaim/steal matches ward operations
3. **Patient List** - Legal status, named nurse, alerts visible at glance - good for safety
4. **Referral Workflows** - Standardized 8-step flow with case note copy reduces manual documentation
5. **Role Recognition** - Different permissions for HCA, Band 5/6, Ward Admin

### Pain Points

1. **No Persistence** - Task updates lost on refresh; critical for handovers
2. **Limited Shift Awareness** - No "current shift" filter; no handover notes field
3. **Missing Notifications** - Patient transfers don't alert receiving ward
4. **Mobile Issues** - Kanban board not optimized for iPad use
5. **No Audit Trail** - Staff can't see who claimed/changed tasks

### Recommendations

| Priority | Item | Impact |
|----------|------|--------|
| Critical | Implement persistence layer | Patient safety (handovers) |
| Critical | Add audit trail visibility | Accountability |
| High | Add handover notes field to patient cards | Shift communication |
| High | Mobile optimization for iPad | On-the-move use |
| High | Current shift filter toggle | Reduce cognitive load |

---

## 3. Trust Senior Management Perspective

### Strategic Value

- Aligns with NHS Digital-first agenda and Patient Safety Framework
- Potential to reduce referral processing from 2-3 hours to 15 minutes
- Standardized workflows reduce errors and support CQC compliance
- Scalable architecture could extend to other wards/services

### Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Staff Adoption Failure | High | Critical | Early engagement; ward champions; training |
| Clinical Safety Incident | Low | Critical | DCB0129 assessment before live deployment |
| IG Breach | Medium | Critical | DPIA completion; encryption; audit logs |
| SystemOne Integration Delay | High | High | Engage vendor now; define API requirements |
| Scope Creep | High | Medium | Define hard Phase 9 cutoff; defer features |

### Resource Requirements

**For Medium Version Pilot (4-5 months):**
- 1 FTE Developer (ongoing)
- 1 FTE IG Officer (DPIA, 2-3 weeks)
- 1 FTE IT Security (assessment, 2-3 weeks)
- 0.5 FTE Training Coordinator
- 1 FTE Ward Project Lead

**Estimated Budget (12-month go-live):** £500-650k total

### Board Recommendations

1. Define whether this is long-term system or temporary pending SystemOne upgrade
2. Secure IG/Security review timeline commitment
3. Identify budget for pilot ward support
4. Green-light requirements: DPIA signed off, clinical safety assessed, 75%+ pilot adoption

---

## 4. Information Governance Perspective

### Compliance Status

| Criterion | Status | Risk |
|-----------|--------|------|
| GDPR Article 5 (Data Principles) | NON-COMPLIANT | Critical |
| Data Minimisation | NON-COMPLIANT | Critical |
| DPIA Required | NOT COMPLETED | Critical |
| Audit Trails | NOT IMPLEMENTED | Critical |
| Data At Rest Encryption | NON-COMPLIANT | Critical |
| Lawful Basis Documented | UNDEFINED | Critical |

### Critical Issues

1. **Patient data stored in unencrypted localStorage** - Accessible via DevTools
2. **No audit logging** - Cannot track who accessed/modified data
3. **No consent mechanism** - GDPR modal is notification only
4. **Retention undefined** - No policy for data deletion

### Required Actions (Before Medium Rollout)

- [ ] Complete DPIA with external IG review
- [ ] Move patient data to server-side storage
- [ ] Implement audit logging for all data access
- [ ] Document lawful basis (employment vs healthcare)
- [ ] Define retention schedule by data type
- [ ] Create Privacy Notice document

---

## 5. IT Security Perspective

### Critical Vulnerabilities

| Vulnerability | Attack Vector | Impact |
|---------------|---------------|--------|
| No Authentication | Anyone can claim any identity | Impersonation; non-repudiation failure |
| XSS Risk | User names rendered without sanitization | Session hijacking; data theft |
| No Input Validation | Unlimited form inputs | Data integrity; DOS |
| Feature Gating Bypassable | Change localStorage version flag | Unauthorized feature access |
| Data Exposure | localStorage unencrypted | Full patient data accessible |
| No Session Timeout | Shared devices | Unauthorized access |

### Remediation Priorities

| Priority | Item | Effort |
|----------|------|--------|
| MUST DO | Implement Supabase Auth + httpOnly cookies | 2-3 days |
| MUST DO | Input validation with Zod/DOMPurify | 1-2 days |
| MUST DO | Server-side feature gating (Next.js middleware) | 1 day |
| MUST DO | Session timeout (15-min idle logout) | 1 day |
| MUST DO | Encrypt/move patient data server-side | 2-3 days |
| Should Do | Security headers (CSP, X-Frame-Options) | Few hours |
| Should Do | Rate limiting on forms | 1 day |

---

## 6. UX Design Perspective

### Strengths

1. **Clear Visual Hierarchy** - Bold gradients, color-coded quick actions, consistent badges
2. **Consistent Component Language** - Uniform buttons, cards, modals throughout
3. **Effective Whitespace** - Good spacing prevents cognitive overload
4. **Information Scannability** - Patient cards show key info at glance
5. **NHS Color Compliance** - Follows NHS Identity guidelines

### Usability Issues

1. **Cards Not Obviously Clickable** - No hover states or chevron indicators
2. **No Action Feedback** - No toast notifications for claim/discharge
3. **Ward Switcher Unclear** - "Active Ward" meaning not obvious
4. **Kanban Not Responsive** - Cards full-width on mobile
5. **Task Date Grouping Missing** - No Today/Tomorrow/This Week filters

### Recommendations

| Priority | Item |
|----------|------|
| High | Add click indicators (hover shadow, chevron) to cards |
| High | Toast notifications for all actions |
| High | Label ward switcher as "View Ward:" |
| High | Test/fix Kanban on iPad landscape |
| Medium | Group tasks by date instead of just shift |

---

## 7. Accessibility Perspective

### WCAG 2.1 AA Compliance

**Status:** NOT COMPLIANT - Would fail audit

| Criterion | Status |
|-----------|--------|
| 2.1 Keyboard Operable | FAIL - Kanban requires mouse |
| 2.4 Navigable | FAIL - Skip link not functional |
| 1.3 Adaptable | PARTIAL - Some divs instead of semantic HTML |
| 4.1 Compatible | PARTIAL - ARIA roles missing |

### Critical Barriers

1. **Kanban board not keyboard accessible** - Users with motor impairments blocked
2. **Modal focus management broken** - Focus doesn't move to modal on open
3. **Skip link not in DOM** - Defined in CSS but not implemented
4. **ARIA labels missing** - Custom components not identified to screen readers
5. **Heading hierarchy inconsistent** - h1→h3 skips (no h2)

### Remediation Priorities

| Priority | Item | Effort |
|----------|------|--------|
| Must Do | Focus management in modals (useEffect pattern) | 1-2 days |
| Must Do | Implement skip link in Header | 2 hours |
| Must Do | Make Kanban keyboard accessible (Arrow keys) | 1-2 days |
| Must Do | Add ARIA labels to custom components | 3-4 hours |
| Should Do | Semantic HTML (button, nav, main, article) | 1-2 days |
| Should Do | Heading hierarchy audit and fix | 4 hours |

---

## 8. NHS Standards Perspective

### NHS Service Standard Compliance

**Score: 6/14 (43%) - NON-COMPLIANT**

| Standard | Status |
|----------|--------|
| 4. Use appropriate open standards | FAIL - No FHIR/HL7 |
| 8. Protect user privacy | FAIL - GDPR gaps |
| 9. Secure information | FAIL - No encryption/auth |
| 11. Use data to improve service | NO - No analytics |
| 14. Operate reliable service | NO - No monitoring |

### Clinical Safety (DCB0129)

**Status:** Not Started - Required before Max version

Hazards to assess:
- Incorrect patient data (wrong name)
- Task assigned to wrong staff
- Referral sent to wrong service
- Premature discharge

### FHIR Readiness

**Status:** NOT READY

Current patient data structure doesn't map to FHIR resources. Work required:
- Map to FHIR Patient, Task, Appointment
- Add SNOMED CT codes for diagnoses
- Implement FHIR API endpoints
- Estimate: 3-4 weeks

---

## 9. Training Perspective

### Learning Curve Assessment

| Role | Time to Proficiency | Complexity |
|------|---------------------|-----------|
| Normal User | 30 mins - 1 hour | Low |
| Band 5/6 Nurse | 2-3 hours | Medium |
| Ward Admin | 4-6 hours | Medium-High |

### Documentation Gaps

**Currently Available:** CLAUDE.md (project spec only)

**Needed:**
- [ ] Quick Start Guide (1-page visual)
- [ ] Feature Guides by role (2-3 pages each)
- [ ] FAQ document
- [ ] Video tutorials (3-5 mins each)
- [ ] Administrator handbook

### Support Model Required

**Pilot Phase:**
- 1 project lead in ward for first 2 weeks
- Ward champions (2-3 super-users) as first-line support
- Email support channel

**Roll-out Phase:**
- 0.5 FTE central support
- Self-service knowledge base
- Monthly user group meetings

---

## 10. Project Management Perspective

### Progress Summary

**Completion: 75%** (7.5 of 10 phases)

| Phase | Status |
|-------|--------|
| 1. Skeleton & Theming | COMPLETE |
| 2. Bookmarks | COMPLETE |
| 3. Workflows | COMPLETE |
| 4. How-To Guides | COMPLETE |
| 5. Admin Features | COMPLETE |
| 6. Ward Tasks | COMPLETE |
| 7. Patient Features | COMPLETE |
| 8. SystemOne Integration | NOT STARTED |
| 9. Polish | NOT STARTED |

### Phase 5 Admin Features (Completed 25 Jan 2026)

- Role switching in profile dropdown menu (desktop and mobile)
- Admin nav link visible for contributors/senior_admins
- Admin dashboard at `/admin` with links to workflow/guide editors
- Workflow editor with drag-drop step reordering, step type editing
- Guide editor with step management
- RoleGate component for permission-based UI
- useCanEdit hook for permission checks
- Edit buttons on referrals and how-to pages (contributor+ only)

### Recent Bug Fixes (Snag List #21-23)

- #21: Claiming a task now places it in "Todo" column, not "In Progress"
- #22: Completed tasks can now be opened, edited, and dragged back to other columns
- #23: Ward diary sections expand correctly based on day type (today/past/future)

### Quality Assessment

| Dimension | Status |
|-----------|--------|
| Code Quality | GOOD |
| Feature Completeness | GOOD |
| Testing | POOR (0% coverage) |
| Accessibility | POOR |
| Security | CRITICAL (not production-ready) |

### Recommended Timeline

**Light Version (Demo):** READY NOW - Deploy to Vercel for stakeholder demos

**Medium Version (Pilot):** Target June 2026
- Feb: Phase 8 starts; auth + persistence
- Mar: Testing + accessibility fixes
- Apr: Security review; training prep
- May: Deploy to FOCUS
- Jun: Pilot go-live (1 ward)

**Max Version:** Target September 2026 (depends on pilot success)

---

## Consolidated Recommendations

### Critical (Must Do Before Any Live Deployment)

1. Implement real authentication system (Supabase Auth)
2. Add input validation and sanitization (Zod + DOMPurify)
3. Encrypt patient data; move from localStorage to server
4. Implement audit logging for all data access
5. Complete DPIA with IG officer approval
6. Complete DCB0129 clinical safety assessment
7. Conduct IT security assessment
8. Fix WCAG 2.1 AA critical accessibility barriers

### High Priority (Before Wider Rollout)

9. Implement testing framework (Jest); target 50% coverage
10. Add error boundaries and error handling
11. Implement session timeout (15-min idle)
12. Performance optimization: pagination
13. Complete NHS DSPT assessment
14. Secure IT infrastructure commitments
15. Create end-user documentation
16. Conduct user research with ward staff
17. Identify pilot ward champion

### Medium Priority (Before Full Rollout)

18. FHIR API structure for SystemOne
19. SNOMED CT terminology
20. Complete admin editors (Phase 5)
21. Mobile optimization pass
22. Visual feedback (toast notifications)
23. External audit

---

## Action Items

| Item | Owner | Priority | Target |
|------|-------|----------|--------|
| Schedule security assessment | IT Lead | CRITICAL | 26 Jan |
| Schedule DPIA review | IG Officer | CRITICAL | 26 Jan |
| Implement authentication | Developer | CRITICAL | 15 Feb |
| Input validation | Developer | CRITICAL | 15 Feb |
| Move data server-side | Developer | CRITICAL | 28 Feb |
| Implement audit logging | Developer | CRITICAL | 28 Feb |
| User research interviews | PM | High | 28 Feb |
| Testing framework setup | Developer | High | 31 Mar |
| Quick Start Guide | Training | High | 28 Feb |
| Accessibility audit | Specialist | High | 15 Mar |
| Phase 8 SystemOne spec | Tech Lead | High | 9 Feb |
| Identify ward champion | PM | High | 28 Feb |

---

## Summary

**Inpatient Hub is a well-structured demonstration project with strong foundations.** The codebase is clean, feature-complete for phases 1-7, and successfully implements a sophisticated version-gating system.

**However, it is NOT production-ready.** Critical gaps in authentication, data security, audit logging, and accessibility must be addressed before any live deployment with real patient data.

**Recommended path forward:**
1. Deploy Light version now for demos/stakeholder engagement
2. Focus February-March on security/compliance/testing (Phase 8-9)
3. Target June 2026 for Medium version pilot with 1 ward
4. Scale to Max version by September 2026 pending pilot success

---

*Evaluation conducted 25 January 2026*
*Updated 25 January 2026 - Phase 5 Complete, Snag List #21-23 Fixed*

---

## Recent Additions (25 January 2026)

### Admin Features (Phase 5)

**New Components:**
- `src/components/admin/RoleGate.tsx` - Permission wrapper component
- `src/lib/hooks/useCanEdit.ts` - Permission check hook

**New Pages:**
- `src/app/admin/page.tsx` - Admin dashboard
- `src/app/admin/workflows/page.tsx` - Workflow list and editor
- `src/app/admin/guides/page.tsx` - Guide list and editor

**Modified:**
- `src/components/layout/header.tsx` - Role switcher, Admin nav link
- `src/app/referrals/[id]/page.tsx` - Edit button for contributors
- `src/app/how-to/[id]/page.tsx` - Edit button for contributors

### Kanban Improvements

**Fixed:**
- `src/app/tasks-provider.tsx` - claimTask sets status to "pending" not "in_progress"
- `src/components/kanban/KanbanTaskCard.tsx` - Completed tasks now draggable/clickable
- `src/components/kanban/KanbanBoard.tsx` - handleReopen and onTaskClick support
- `src/app/my-tasks/page.tsx` - TaskDetailModal integration

### Ward Diary Defaults

**Fixed:**
- `src/app/tasks/page.tsx` - getDefaultExpandState returns correct defaults per day type
