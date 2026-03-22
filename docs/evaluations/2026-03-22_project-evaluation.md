# Project Evaluation: 22 March 2026

## Executive Summary

- **wardHub is demo-ready for Trust pilot** with strong clinical workflows, clear business case, and comprehensive governance documentation
- **Code quality is solid** (TypeScript strict, NHS colour compliance, good error handling) but monolithic page files (2800+ lines) need refactoring before scaling
- **Security is demo-appropriate** but not production-ready: client-side auth only, unencrypted localStorage, no server-side route protection
- **Accessibility foundations are strong** (skip links, ARIA labels, reduced motion, focus indicators) with footer contrast and drag-drop keyboard access as main gaps
- **Training burden is minimal** thanks to interactive tour, intro guide, and FAQ — the tool teaches itself

---

## Evaluation Details

### 1. Web Developer Perspective

#### Strengths
- TypeScript strict mode enabled with comprehensive type definitions (497 lines in types/index.ts)
- Clean discriminated unions for task types (DiaryTask = WardTask | PatientTask | Appointment)
- Error boundary component with dev-only error details and recovery buttons
- No dangerouslySetInnerHTML, eval(), or XSS vectors found
- Build passes 100% of the time across all sessions
- Well-organised directory structure: app/ (routes), components/ (UI), lib/ (data/types/hooks)

#### Technical Debt / Flaws
- **Monolithic pages:** tasks/page.tsx (2807 lines), dev-panel/page.tsx (2406 lines), referrals/[id]/page.tsx (2036 lines) — these should be split into 4-6 components each
- **Minimal test coverage:** Only 3 test files (~20 tests) across 104 source files — critical task logic, patient transfer, and discharge flows untested
- **npm vulnerabilities:** 4 active (Next.js HTTP smuggling, flatted DoS, ajv ReDoS, minimatch ReDoS) — fixable via npm audit fix
- **Nested component definitions:** Components defined inside page files rather than extracted — hurts testability and reusability

#### Limitations
- No E2E or integration tests
- No performance benchmarks or Lighthouse scores documented
- No database schema versioning (Supabase schemas are draft-only in Dev Panel)
- localStorage as sole data store limits concurrent use and data durability

#### Recommendations
1. **Critical:** Run `npm audit fix` to resolve known vulnerabilities
2. **High:** Extract tasks/page.tsx into TaskCard, DayColumn, DiaryControls, TaskDetailModal components
3. **High:** Add 20-30 tests covering task claim/steal/drop, patient transfer, discharge flow
4. **Medium:** Set up Lighthouse CI for performance monitoring
5. **Low:** Add JSDoc to exported functions in monolithic files

---

### 2. Clinical User Perspective

#### What works well for clinical staff
- **Ward Diary** with priority-based colour coding (red=urgent, amber=important, green=routine) surfaces critical tasks immediately
- **Claim/Take Over/Drop** workflow with tooltips eliminates confusion about task ownership during shift handover
- **8-step referral templates** (criteria, form, WAGOLL, guides, submit, case note, diary reminder, GDPR) ensure referrals are complete and consistent
- **Case note clipboard** with auto-date saves documentation time
- **Guides page** with tab filtering (Referrals/Assessments/Tasks) puts everything in one searchable place
- **Linked referrals/guides on task cards** mean staff can access procedure guidance without leaving the diary

#### Pain points and frustrations
- Simple diary view hides too much — staff must click through to see linked referrals or task duration
- Patient name dropdown in task creation lists all ward patients unsorted — needs alphabetical/room grouping
- No visual countdown on overdue tasks — they just sit as "Overdue" badges without urgency escalation
- Guides are demo-only and not evidence-reviewed against current Trust protocols

#### Missing features staff would expect
- Patient alerts surface (falls risk, absconding, allergens) — currently removed from patient list, not visible on diary
- Overdue task escalation with countdown timer and line manager notification
- Auto-generated follow-up tasks when a referral is completed (e.g., "Chase IMHA response in 5 days")
- Shift handover summary view showing outstanding tasks, new admissions, and upcoming appointments

#### Recommendations
1. **High (patient safety):** Surface clinical alerts on diary task cards where patient is involved
2. **High (efficiency):** Add overdue countdown badge (e.g., "2 days overdue") with red pulsing indicator
3. **Medium:** Auto-create chase task when referral logged (configurable delay: 3/5/7 days)
4. **Medium:** Add shift handover summary page (filter diary by shift period, highlight changes)
5. **Low:** Sort patient dropdown alphabetically with ward grouping

---

### 3. Trust Management Perspective

#### Strategic Value Assessment
- **Addresses known gaps:** FOCUS covers Trust systems but fails on external workflows (referrals, community services, external agencies). wardHub fills this gap.
- **Reduces onboarding time:** New starters/agency staff can follow interactive guides immediately — estimated 2-4 weeks saved per hire
- **Delayed discharge impact:** Referral workflows prompt early action (housing, social care, S117) that currently gets missed at admission
- **No budget barrier:** Open-source stack, built by ward staff in role, Trust IT infrastructure

#### Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Low staff adoption | Medium | High | Ward champion model, iterative feedback, pilot-first approach |
| Data security concerns | Low | Critical | Pilot has zero PII; phased controls aligned with data sensitivity |
| Technical failure | Low | Low | Paper diary remains as fallback; tool supplements, not replaces |
| Scope creep | Medium | Medium | Clear governance; changes require approval before deployment |
| Out-of-date content | Medium | Medium | Verification badges, contributor editing, broken link reporting |
| Clinical safety | Low | High | Reference/task aid only; no clinical decisions automated; DCB review planned |

#### Resource Requirements
- **Pilot:** Zero budget. Ward NIC time (already in role). Trust IT awareness only.
- **Rollout:** Minimal hosting costs (Trust infrastructure). 30-min orientation per ward. DPIA completion (IG team, 2-4 weeks).
- **Integration:** Digital Services involvement for Nexus webhook (1-2 weeks). Clinical safety review (2-4 weeks).

#### Implementation Considerations
- Phased approach (pilot one ward, then expand) minimises risk
- "Easy to stop" model — nothing irreplaceable if pilot fails
- Governance pathway mapped (DPIA, DCB 0129/0160, IG review)
- No dependency on external vendors or procurement

#### Recommendation for Board
PROCEED WITH PILOT. Low risk, clear problem statement, strong governance pathway. Success measured by: staff adoption rate, onboarding time reduction, referral completion rates.

---

### 4. Information Governance Perspective

#### Compliance Status
- **Pilot (Light version):** COMPLIANT — no PII, fictional demo data, browser-only storage
- **Future (Max version):** REQUIRES DPIA COMPLETION before launch

#### Data Flow Analysis
- Light: User actions stored in browser localStorage only. No external data transmission. Cleared on logout or browser cache clear.
- Medium+: Would use Supabase (PostgreSQL) with RLS policies. Draft schemas in Dev Panel but untested.
- Max+: Nexus webhook (inbound only, shared secret auth). Power Automate integration spec documented.

#### Risk Areas
1. **localStorage PII exposure:** Unencrypted browser storage accessible via DevTools. Acceptable for demo (no real PII); unacceptable for production with patient data.
2. **DPIA incomplete:** 7 sections scaffolded but consultation, sign-off, and formal risk matrix missing.
3. **Consent model undefined:** No Article 13 GDPR notice for staff data processing. No withdrawal mechanism designed.
4. **RLS policies untested:** Supabase row-level security drafted but not validated.

#### Required Actions for Compliance
1. Complete DPIA with NHS Digital risk matrix before Medium/Max deployment
2. Design consent model (staff login consent + Article 13 notice)
3. Test RLS policies with Trust IT security team
4. Define incident response process (data breach escalation path)
5. Confirm Supabase data residency (EU hosting requirement)

#### Recommendations
- **Pilot:** GO — add "Test Data Only" disclaimer if not present (already done)
- **Rollout:** Complete DPIA, consent flow, RLS testing, and incident response plan first
- **Integration:** Confirm Nexus webhook sub-processor agreement meets GDPR Article 28

---

### 5. IT Security Perspective

#### Security Strengths
- No hardcoded secrets, API keys, or credentials in source code
- CSP headers configured (Content-Security-Policy in next.config.ts)
- No dangerouslySetInnerHTML or eval() — XSS vectors minimised
- React auto-escaping prevents injection via user input
- Cookie handling uses httpOnly + Secure + SameSite flags
- No PII in console.log statements (cleaned in Session 8)

#### Vulnerabilities Identified
1. **Client-side auth only:** Users pick role from dropdown — no server verification. localStorage can be modified to escalate privileges.
2. **CSP too permissive:** `unsafe-inline` and `unsafe-eval` in script-src weaken XSS protection.
3. **No server-side route protection:** /admin, /patients, /dev-panel accessible without middleware role checks.
4. **No rate limiting:** API endpoints (auth routes) have no request throttling.
5. **npm vulnerabilities:** 4 active CVEs including HTTP smuggling in Next.js.

#### Threat Model Summary
- **Demo environment:** Low threat — no real data, public access acceptable
- **Production environment:** Medium-High threat — patient data, staff data, clinical workflows require robust auth + encryption + audit logging

#### Remediation Priorities
1. **Critical (production):** Implement backend authentication (Trust SSO/SAML/OAuth)
2. **Critical (production):** Add server-side middleware route protection with role validation
3. **High:** Run npm audit fix for known vulnerabilities
4. **High:** Tighten CSP — remove unsafe-eval, restrict connect-src to known domains
5. **Medium:** Implement session timeout (15-min inactivity)
6. **Low:** Add CSRF tokens to state-changing operations

#### Recommendations
- **For demo:** Acceptable security posture. No sensitive data at risk.
- **For production:** Full security review needed. Backend auth, encrypted storage, penetration testing, and middleware route gating are prerequisites.

---

### 6. UX Design Perspective

#### UX Strengths
- Clear navigation hierarchy: primary tiles (Diary, Bookmarks, Guides, Patients) with secondary items in More dropdown
- Consistent visual language: NHS colour palette, gradient cards, rounded corners throughout
- Three-way diary toggle (Ward Diary / My Diary / My Jobs) provides clear mental model for different views
- Drag-and-drop task rescheduling between day columns is intuitive
- Interactive tour builds understanding progressively (8 screens, live walkthrough capability)
- Print styles implemented for reports and business case

#### Usability Issues
- Diary page on mobile may be overwhelming — horizontal scroll with 15 day columns
- No global search — each page (bookmarks, guides, referrals) has its own search bar
- Task cards in simple view are too compact — lose context needed for quick decisions
- No undo mechanism for destructive actions (task deletion, discharge)
- Toast notifications for ward/role changes are brief (800ms) and easy to miss

#### User Journey Analysis
- **Login → Diary:** 2 clicks (login → auto-redirect). Clean.
- **Find a referral:** 2 clicks (Guides → filter → click). Clean.
- **Claim a task:** 1 click on task card claim button. Clean.
- **Reschedule a task:** Drag and drop between day columns. Intuitive.
- **Create new guide:** Guides → More → Editor → New Guide → Template. 4 clicks — could be shorter.

#### Recommendations
1. **High:** Add global search across all content types (bookmarks, guides, tasks, patients)
2. **Medium:** Implement undo toast for destructive actions ("Task deleted. Undo?")
3. **Medium:** Test and optimise mobile experience at 375px width
4. **Low:** Add contextual "Create new" shortcuts on empty states

---

### 7. Accessibility Perspective

#### Compliance Summary
| WCAG Criterion | Status | Notes |
|---------------|--------|-------|
| 1.1.1 Non-text Content | Partial | Emoji icons used without alt text (mostly decorative) |
| 1.3.1 Info and Relationships | Pass | Semantic HTML: header, nav, main, footer, headings hierarchy |
| 1.4.3 Contrast (AA) | Partial | Footer text at 60-70% opacity fails AA (3-4:1 ratio) |
| 2.1.1 Keyboard | Partial | Navigation keyboard-accessible; Kanban drag-drop not keyboard-accessible |
| 2.4.1 Bypass Blocks | Pass | Skip link implemented |
| 2.4.3 Focus Order | Pass | Logical tab order through navigation and content |
| 2.5.1 Pointer Gestures | Partial | Drag-drop has no keyboard alternative |
| 3.3.1 Error Identification | Fail | No visible form validation error messages |
| 4.1.2 Name, Role, Value | Partial | aria-expanded on dropdowns; missing on some interactive elements |

#### Accessibility Barriers Identified
1. **Footer contrast:** `text-white/60` and `text-white/70` on dark blue background fail WCAG AA (3-4.2:1 vs required 4.5:1)
2. **Kanban drag-drop:** No keyboard alternative for moving tasks between columns
3. **Form validation:** No aria-invalid, aria-errormessage, or visible error text on task/patient creation forms
4. **Toast notifications:** No aria-live region — screen readers don't announce ward change confirmations
5. **Diary day columns:** No keyboard shortcut for expanding/collapsing days

#### Assistive Technology Testing Notes
- Reduced motion: Excellent support via `prefers-reduced-motion` media query
- Focus indicators: Consistent 2px indigo outline with offset on all interactive elements
- Screen reader landmarks: header, nav, main, footer all properly marked
- Skip link: Present and functional

#### Remediation Priorities
1. **High:** Fix footer contrast (upgrade text-white/60 to text-white/80 minimum)
2. **High:** Add keyboard alternative for Kanban drag-drop (arrow keys or button-based move)
3. **Medium:** Add aria-live region for toast notifications
4. **Medium:** Implement form validation with aria-invalid and visible error messages
5. **Low:** Add aria-label to settings cog, diary expand/collapse buttons

---

### 8. NHS Standards Perspective

#### NHS Standards Compliance Matrix
| Standard | Status | Notes |
|---------|--------|-------|
| NHS Identity colours | Pass | All 16 colour tokens match NHS guidelines exactly |
| NHS Typography | Pass | Source Sans 3 primary, Arial fallback |
| NHS Trust branding | Pass | "Derbyshire Healthcare NHS Foundation Trust" in hero + footer |
| DCB 0129 (Manufacture) | Partial | Hazard log started in Dev Panel; formal assessment not complete |
| DCB 0160 (Deployment) | Not started | Deferred to rollout phase |
| DSPT alignment | Partial | Audit logs planned; data classification documented |
| FHIR readiness | Not applicable | No clinical data exchange in pilot; noted for Max+ |
| SNOMED CT / dm+d | Not applicable | Tool is reference/task aid; no clinical coding required |

#### Clinical Safety Assessment
- **Hazard log:** 8 hazards identified in Dev Panel (missed referrals, data breach, task duplication, system unavailability, incorrect guidance, user confusion, improper access, Nexus sync failure)
- **Gap:** Severity/likelihood scoring not completed. Should use ICTSPA format (Risk = Severity x Likelihood).
- **Gap:** No residual risk assessment after mitigations applied.
- **Gap:** No post-deployment monitoring plan (incident detection, reporting thresholds).

#### Interoperability Readiness
- Nexus Assurance webhook spec documented (inbound only, shared secret auth)
- No FHIR or HL7 interfaces planned for pilot
- Supabase schema designed for future API layer

#### Gaps and Recommendations
1. Complete DCB 0129 clinical risk assessment with formal severity/likelihood matrix
2. Plan DCB 0160 deployment safety case before Trust-wide rollout
3. Add clinical disclaimer badges on all guide content ("Demo content - verify against Trust protocols")
4. Consider FHIR wrapper for Max+ version if clinical data exchange needed

---

### 9. Training Perspective

#### Learning Curve Assessment
- **Time to basic proficiency:** 5-10 minutes (login + tour)
- **Time to full competency:** 1-2 hours of use (all features explored)
- **Critical finding:** The interactive tour + intro guide mean **zero classroom training needed** for pilot

#### Training Needs Analysis
| User Group | Training Need | Method | Duration |
|-----------|--------------|--------|----------|
| Staff (pilot) | Self-service tour + explore | In-app tour + FAQ | 10 min |
| Staff (rollout) | Orientation + task workflow | 30-min session per ward | 30 min |
| Ward Admin | Permissions + settings | Role-specific guide | 15 min |
| Contributors | Content editing workflow | Editor walkthrough | 20 min |

#### Documentation Gaps
- No downloadable PDF user guide for offline/print reference
- No video tutorials (text + images only)
- No role-specific guides (Staff vs Ward Admin permissions differ but guides are identical)
- No shift handover checklist showing how to use diary between shifts

#### Support Model Recommendations
1. Pilot: Self-service (tour + FAQ + feedback page). Ward NIC as local champion.
2. Rollout: Monthly 30-min Teams drop-in for Q&A. Email support for bugs.
3. Ongoing: Quarterly training updates for new features. New hire onboarding via tour.

#### Rollout Strategy Suggestions
1. Week 1: Email ward staff with link to /intro-guide, encourage exploration
2. Week 2: 30-min orientation session (live demo + Q&A)
3. Weeks 3-8: Active pilot — staff use guides + diary for real (non-critical) tasks
4. Week 8: Pilot evaluation survey + retrospective with ward team

---

### 10. Project Management Perspective

#### Progress Summary
- **8 of 9 build phases complete** (89% delivery)
- **87 of 93 snag items resolved** (94% completion rate)
- **Timeline:** 7 weeks elapsed against 8-week estimate (+1 week buffer)
- **Budget:** Zero (built in role using open-source stack)
- **Build quality:** 100% pass rate across all sessions

#### Scope Assessment
- Initial scope: Light version MVP with bookmarks, referrals, guides
- Delivered: Full-featured demo including ward diary, patient management, Nexus integration spec, business case, governance documentation
- Scope expanded intentionally by product owner — documented and approved
- Feature flags removed (Session 9) — all features enabled for demo simplicity

#### Risk Register
| Risk | Status | Action |
|------|--------|--------|
| Staff adoption | Open | Pilot will test; champion model planned |
| IG approval delay | Open | DPIA scaffold ready; needs IG team input |
| Clinical safety sign-off | Open | Hazard log started; needs Clinical Safety Officer review |
| Test coverage gap | Open | 3 test files for 104 source files; needs expansion |
| Performance at scale | Unknown | No load testing done; needed before rollout |

#### Dependency Analysis
| Dependency | Owner | Status | Impact if Delayed |
|-----------|-------|--------|-------------------|
| Trust IT hosting approval | Digital Services | Not started | Blocks Medium+ deployment |
| DPIA completion | IG Team | Scaffold ready | Blocks patient data features |
| DCB 0129 review | Clinical Safety Officer | Draft hazard log | Blocks Max+ deployment |
| Nexus webhook build | Digital Services | Spec documented | Blocks audit auto-sync |

#### Recommendations and Next Actions
1. **Immediate:** Launch Byron Ward pilot (Light version, no approvals needed)
2. **Week 1-2:** Define pilot success criteria (adoption %, referral completion, onboarding time)
3. **Week 2-4:** Submit DPIA to IG team for review
4. **Week 4-6:** Schedule DCB 0129 review with Clinical Safety Officer
5. **Week 6-8:** Pilot evaluation — decide rollout timeline
6. **Ongoing:** Add automated tests for critical flows before each phase

---

## Consolidated Recommendations

### Critical (Must Do)
- Run `npm audit fix` to resolve 4 known npm vulnerabilities
- Fix footer text contrast (upgrade from white/60 to white/80 minimum) for WCAG AA
- Add clinical disclaimer on all guide content for demo ("Demo content - verify against Trust protocols")

### High Priority
- Refactor tasks/page.tsx (2807 lines) into smaller components before adding features
- Add 20-30 unit tests for task claim/steal/drop, patient transfer, and discharge logic
- Complete DPIA consultation and sign-off sections before Medium version rollout
- Add keyboard alternative for Kanban drag-drop
- Implement backend authentication for production deployment

### Medium Priority
- Add form validation feedback (aria-invalid, visible error messages)
- Add aria-live regions for toast notifications
- Create role-specific training guides (Staff vs Ward Admin)
- Add overdue task escalation UI (countdown badge, line manager notification)
- Record 5-minute video tour for ward orientation sessions
- Add global search across all content types

### Low Priority / Nice to Have
- Dark/light mode toggle (#71)
- Font size customisation (#72)
- High contrast mode (#73)
- Auto-generate chase tasks when referrals are logged
- Shift handover summary view
- Laminated quick-reference cards for ward use

---

## Action Items

| Item | Owner | Priority | Target Date |
|------|-------|----------|-------------|
| npm audit fix | Developer | Critical | Immediate |
| Footer contrast fix | Developer | Critical | Before demo |
| Clinical disclaimer badges | Developer | Critical | Before demo |
| Launch Byron Ward pilot | Mike (Ward NIC) | High | April 2026 |
| Define pilot success criteria | Mike + Ward Manager | High | Week 1 |
| Submit DPIA to IG team | Mike → IG Lead | High | April 2026 |
| Refactor monolithic pages | Developer | High | Before Phase 2 |
| Add test suite (20+ tests) | Developer | High | Before Phase 2 |
| Schedule DCB 0129 review | Mike → Clinical Safety Officer | High | May 2026 |
| Create role-specific guides | Mike / Training | Medium | Before rollout |
| Record video tour | Mike | Medium | Before rollout |
| Backend auth implementation | Developer + Trust IT | Medium | Before Max version |
| Pilot evaluation survey | Mike + Ward Manager | Medium | Week 8 of pilot |

---

*Evaluation conducted: 22 March 2026*
*Framework: 10-Hat Evaluation Template v1.0*
*Project: wardHub (Inpatient Hub) — Alpha Demo*
