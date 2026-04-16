# Project Evaluation: 14 April 2026

> **Evaluator:** Claude Code (10-hat framework)
> **Project:** wardHub - Inpatient Hub
> **Version:** Demo-ready (Light mode, all features enabled)
> **Codebase:** ~88 source files, ~14,000 LOC, Next.js 16.1.6 + React 19 + TypeScript
> **Live URL:** https://inpatient-hub-alpha.vercel.app

---

## Executive Summary

- **The project is demo-ready and impressive for a solo build** - 163 commits, 18 sessions, 125+ snag items tracked and mostly resolved. The breadth of features (diary, tasks, patients, guides, safeguarding, admin) is substantial.
- **3 npm vulnerabilities need fixing** (1 moderate, 2 high) - all fixable via `npm audit fix`. The `next` package has a known DoS vulnerability that should be patched before any trust-facing demo.
- **Two files are dangerously large** - `tasks/page.tsx` (3,044 lines) and `dev-panel/page.tsx` (2,832 lines). These are maintenance risks and will slow down any future developer.
- **Test coverage is minimal** - 3 test files for a 14,000 LOC project. No integration or e2e tests. This is fine for a prototype but would block any production deployment.
- **Accessibility and clinical safety documentation are started but incomplete** - both need finishing before trust approval.

---

## Evaluation Details

### 1. Web Developer Perspective

**Strengths**

The tech stack choices are solid. Next.js 16 with App Router, TypeScript strict mode, Tailwind CSS 4, and Lucide icons - that's a modern, maintainable foundation. The path aliases (`@/*`) and incremental builds are configured properly.

The type system is well-structured. 62 exported types covering wards, tasks, patients, bookmarks, workflows, roles - all in a single `types/index.ts` file. Union types for `DiaryTask` and `UserRole` are clean. The 5-role RBAC model with orthogonal `isContributor` flag is a good design decision.

Feature flags via environment variable is simple and effective. The version matrix (Light/Medium/Max/Max+) maps cleanly to feature gating.

Demo data is thorough - 100 staff, 100 patients, 500+ tasks across 5 wards. Enough to feel realistic without being overwhelming.

**Technical Debt / Flaws**

The elephant in the room: `tasks/page.tsx` at 3,044 lines and `dev-panel/page.tsx` at 2,832 lines. These files are doing too much. The tasks page handles the team diary, my diary, my jobs (kanban), day expansion, drag-drop, task creation, settings, and filtering - all in one file. This makes debugging painful and change risk high.

No dedicated config directory exists despite CLAUDE.md referencing `src/lib/config/`. Configuration is scattered across `providers.tsx`, `globals.css`, and inline constants.

The `src/lib/data/` directory mixes static reference data (bookmarks, guides) with dynamic demo data (tasks, patients). In production these would come from different sources, and the current structure doesn't make that boundary clear.

3 npm vulnerabilities (1 moderate `brace-expansion` DoS, 2 high - `next` DoS with Server Components, `picomatch` ReDoS). All fixable but shouldn't ship with known highs.

**Limitations**

- Only 3 test files. No component tests for the diary, kanban, patient list, or any modal. No integration tests. No e2e tests.
- No API routes beyond a basic logout handler. The Nexus webhook endpoint is specced in docs but not implemented.
- README.md is still Next.js boilerplate - not project-specific.
- No CI/CD pipeline (relying on Vercel auto-deploy from main, no pre-deploy checks).

**Recommendations (prioritised)**

1. **Fix npm vulnerabilities now** - run `npm audit fix` before next demo
2. **Split tasks/page.tsx** - extract DiaryView, MyDiaryView, KanbanView, DayColumn, and TaskCreation into separate components
3. **Split dev-panel/page.tsx** - each section (Business Case, DPIA, Clinical Safety, etc.) should be its own component
4. **Add at least smoke tests** for diary rendering, task claiming, and patient list filtering
5. **Create src/lib/config/** with dedicated files for feature flags, theme tokens, and ward configuration
6. **Update README.md** to reflect the actual project

---

### 2. Clinical User Perspective (Nurse)

**What works well for clinical staff**

The three-way diary toggle (Team Diary / My Diary / My Jobs) maps directly to how nurses think about their shift. Team Diary shows what's happening on the ward. My Diary shows what I'm responsible for. My Jobs is my personal kanban. That's intuitive.

The safeguarding hub on the home page is genuinely useful. The decision helper ("Not sure? Help me decide") walks staff through to the right pathway - that's the kind of thing that prevents mistakes at 3am when you're tired and unsure whether this is an adults or children's concern.

Smart clipboard copy on guide completion (auto-filling date, patient name, staff name, area) removes friction from documentation. Nurses hate typing the same boilerplate into notes repeatedly.

Task claiming/dropping with "Take Over" for reassignment reflects real ward dynamics - tasks get passed between staff constantly.

Links with FOCUS badges and the styled modal warning ("This needs Trust network access") prevents confusion about why a link won't work from home.

**Pain points and frustrations**

The diary page is dense. 3,044 lines of logic means the UI is trying to do a lot at once. For a nurse mid-shift who just needs to check one thing, the cognitive load is high.

No notifications or alerts system. If a task is overdue or a patient needs attention, there's no way to push that information to the user. They have to actively check.

The simple diary view is a good start but could go further - a "just show me what's overdue" filter would be high value.

Patient tasks don't currently link back to the guide that generated them. If I created a follow-up task from a safeguarding referral, I should be able to trace back to the original workflow.

**Missing features staff would expect**

- Handover summary - a printable or copyable summary of today's key events, outstanding tasks, and patient updates for the incoming shift
- Shift-specific task filtering beyond the current view
- Read receipts or acknowledgement for important tasks (e.g., "ward round notes updated - please review")
- Quick-add from the home page without navigating to the diary
- Patient timeline view showing all tasks, appointments, and events for one patient chronologically

**Recommendations (by patient care impact)**

1. **Handover summary generator** - high impact, directly supports safe care transitions
2. **Overdue task alerts** - visual indicators on the home page for anything past due
3. **Patient timeline** - consolidate all activity for one patient in one view
4. **Quick-add task from home** - reduce navigation friction during busy periods

---

### 3. Trust Senior Management Perspective

**Strategic Value Assessment**

This project addresses a real gap. Ward staff currently rely on a mix of paper lists, whiteboards, shared drives, and institutional memory to manage daily tasks. wardHub consolidates that into one digital tool. The version system (Light through Max+) provides a sensible rollout path - start with the safe, no-PII version and escalate as governance approvals land.

The business case section in the Dev Panel is well-structured with 12 stakeholder Q&A responses ready. The 10-hat evaluation framework shows mature thinking about governance.

The Nexus Assurance integration (Max+) is strategically smart - linking audit compliance tasks to the ward's daily workflow means compliance becomes part of the routine rather than a separate burden.

**Risk Register**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Staff resistance to adoption | Medium | High | Demo-first approach, familiar NHS styling, role-based complexity |
| Data breach via demo mode | Low | Critical | No real PII in demo, version gating for production |
| Single developer dependency | High | High | Well-documented CLAUDE.md, clean code structure |
| Scope creep beyond ward use | Medium | Medium | Version system constrains features by deployment tier |
| Integration failure with Nexus | Medium | Medium | One-way webhook keeps complexity low |
| Accessibility non-compliance | Medium | Medium | Started but needs completion before go-live |

**Resource Requirements**

- **Current:** 1 developer (Mike) + AI tooling
- **For production:** Trust IT support for Supabase hosting, IG sign-off for DPIA, clinical safety officer for DCB 0129
- **Training:** Minimal - the demo tour and intro guide handle onboarding. Ward champions would accelerate adoption.
- **Ongoing:** Content maintenance (bookmarks, guides) needs a contributor workflow

**Implementation Considerations**

The Light version could deploy tomorrow on Vercel with zero infrastructure changes. It's a resource directory with no PII. Medium requires Supabase setup and Trust auth integration. Max requires DPIA approval and clinical safety sign-off.

Recommend a phased rollout: Light to one ward as a pilot, gather feedback for 4-6 weeks, then propose Medium.

**Recommendations for Board**

1. Approve Light version pilot on one ward (low risk, high learning value)
2. Assign IG officer to begin DPIA review now (it's scaffolded, just needs completing)
3. Identify clinical safety lead for DCB 0129 assessment
4. Budget for Supabase hosting if Medium version is approved post-pilot

---

### 4. Information Governance Perspective

**Compliance Status**

The version system is the centrepiece of the IG approach, and it's well-designed. Light version has zero PII - fictional names, placeholder phone numbers, no real patient data. This is the right starting point.

The GDPR page exists and covers data collection, storage, and user rights. The Dev Panel has a DPIA scaffold with 7 sections and a sign-off checklist. The data catalogue classifies entities by PII sensitivity.

Contact data is properly classified: public numbers shown live, trust-internal numbers shown as "Hidden in demo mode" with real data stored only in code comments for later activation.

**Data Flow Analysis**

| Data Type | Light | Medium+ | Storage | Retention |
|-----------|-------|---------|---------|-----------|
| User preferences | Yes | Yes | localStorage | Session/browser clear |
| Task data | Demo only | Real | localStorage / Supabase | Configurable |
| Patient data | Fictional | Real PII | localStorage / Supabase | Trust policy |
| Staff data | Fictional | Real | localStorage / Supabase | Trust policy |
| Audit logs | No | Yes | Supabase | 7 years (NHS standard) |

**Risk Areas**

localStorage is not encrypted. In Light mode this contains only demo data and preferences, which is acceptable. In Max mode it would contain real patient information - that's a problem. The transition from localStorage to Supabase must happen before any real PII enters the system.

No data retention automation. The DPIA scaffold mentions retention but there's no mechanism to auto-delete or archive old data.

No consent mechanism beyond the GDPR modal. For Medium+ with real data, legitimate basis (likely "official authority" under GDPR Article 6(1)(e) for NHS) needs documenting.

**Required Actions for Compliance**

1. Complete the DPIA scaffold - fill in all 7 sections, get IG officer sign-off
2. Document the lawful basis for processing (likely public task under Article 6(1)(e))
3. Ensure localStorage is not used for PII in Max version
4. Add data retention automation to Supabase schema
5. Add audit logging for all data access in Max version

**Recommendations**

- Light version: Compliant as-is for deployment (no PII, no consent issues)
- Medium version: Needs completed DPIA and lawful basis documentation
- Max version: Needs full IG review, encryption at rest, audit logging, retention policies

---

### 5. IT Security Perspective

**Security Strengths**

- TypeScript strict mode prevents common type-related bugs
- React JSX auto-escapes output (XSS protection)
- No `dangerouslySetInnerHTML` usage found
- Next.js App Router handles CSRF automatically
- Demo mode has no real credentials or PII to leak
- Git history clean - single contributor (Sharpy20), no credential leaks
- Remote URL uses account-specific format (`https://Sharpy20@github.com/...`)

**Vulnerabilities Identified**

3 npm vulnerabilities as of today:

| Package | Severity | Type | Fix |
|---------|----------|------|-----|
| `brace-expansion` | Moderate | DoS via zero-step sequences | `npm audit fix` |
| `next` 16.0.0-beta.0 to 16.2.2 | High | DoS with Server Components | Upgrade to 16.2.3+ |
| `picomatch` | High | ReDoS via extglob quantifiers | `npm audit fix` |

**Threat Model Summary**

| Threat | Current Risk | Notes |
|--------|-------------|-------|
| XSS | Low | React escaping, no raw HTML injection |
| CSRF | Low | Next.js App Router handles this |
| Authentication bypass | N/A (demo) | No auth enforced in Light mode |
| Data exfiltration | Low | No real data to exfiltrate |
| DoS | Medium | Known Next.js vulnerability (fixable) |
| Supply chain | Low | Minimal dependencies, all mainstream |
| Session hijacking | N/A (demo) | No real sessions |

**Remediation Priorities**

1. **Critical:** Run `npm audit fix` to resolve the 3 known vulnerabilities
2. **High:** Before Medium+ deployment, implement proper session management with Supabase Auth
3. **Medium:** Add Content Security Policy headers
4. **Medium:** Implement rate limiting on any API routes
5. **Low:** Add Subresource Integrity (SRI) for external resources

**Recommendations**

- Fix npm vulnerabilities immediately (5-minute fix)
- The demo version is low-risk from a security perspective - no real data, no real auth
- Production deployment (Medium+) needs a proper security review covering auth, session management, input validation on API routes, and CSP headers

---

### 6. UX Design Perspective

**UX Strengths**

The NHS colour system is applied consistently. Blue headers, green success states, red for urgent/safeguarding - users will recognise NHS visual language immediately.

Five style themes (NHS, iOS, Material, Fluent, OneUI) is a clever demo feature. It shows stakeholders the platform is flexible and lets users feel at home with familiar visual patterns.

The safeguarding decision helper is excellent UX. Instead of expecting staff to know which pathway to follow, it asks simple yes/no questions and routes them. That's reducing cognitive load where it matters most.

The unified guide viewer (one route for referral workflows and how-to guides) simplifies navigation. Users don't need to know the internal taxonomy to find what they need.

**Usability Issues**

The diary page tries to do too much in one view. Three modes (Team/My/Jobs), day expansion, task creation, settings, filtering - it's powerful but overwhelming on first encounter.

The Dev Panel at 2,832 lines is a wall of information. For governance reviewers, a table of contents with jump links would help. The 12-section left nav helps but the sections themselves are dense.

No breadcrumb navigation on the diary or patient pages. Users can get deep into task details and lose their place.

Dark mode is functional but some elements may have contrast issues that need checking against WCAG standards.

**User Journey Analysis**

*Referral workflow journey:* Home -> Guides -> Select guide -> Step through -> Clipboard copy -> Done. This is clean and linear. The side navigation arrows let users move between guides without going back to the index. Good.

*Task creation journey:* Home -> Diary -> Expanded day -> + button -> Modal -> Fill form -> Save. The floating + button in expanded view is discoverable. The "Assign to Ward / Assign to Myself" toggle is clear.

*Patient lookup journey:* Nav -> Patients -> Filter -> Click patient -> See tasks. Straightforward but could benefit from a search-first approach rather than browse-and-filter.

**Recommendations**

1. **Add a diary onboarding overlay** on first visit explaining the three modes
2. **Add breadcrumbs** to diary and patient detail views
3. **Patient search** - make the primary interaction a search box, not a filtered list
4. **Dev Panel table of contents** with anchor links for each section

---

### 7. Accessibility Perspective

**Compliance Summary**

| WCAG Principle | Status | Notes |
|---------------|--------|-------|
| **Perceivable** | Partial | NHS colours meet AA contrast for most combinations. Dark mode needs verification. Alt text coverage unknown. |
| **Operable** | Partial | 49+ aria-labels, focus-trap on modals, keyboard nav started but incomplete |
| **Understandable** | Good | Clear language, consistent navigation, NHS-standard terminology |
| **Robust** | Partial | Semantic HTML used in most places, ARIA roles on dialogs/menus |

**Accessibility Features Present**

- `focus-trap-react` for modal focus containment
- 49+ `aria-label` attributes across 18 files
- `role` attributes on dialogs, navigation, and listboxes
- `tabIndex` management for focus flow
- Error boundary with fallback UI
- Reduced motion support in CSS

**Accessibility Barriers Identified**

- Drag-and-drop task rescheduling has no keyboard alternative. Screen reader users cannot move tasks between days.
- The bookmark carousel (spoke wheel) is visually creative but likely inaccessible to screen readers. The spatial metaphor doesn't translate to linear navigation.
- The kanban board drag-and-drop similarly needs keyboard alternatives.
- Colour-coded priority borders (routine/important/urgent) rely on colour alone without text labels in some views.
- No skip-to-content link on the main layout.
- Form validation error messages may not be announced to screen readers.

**Assistive Technology Testing Notes**

No screen reader testing has been performed. The project has not been tested with:
- NVDA or JAWS (Windows screen readers)
- VoiceOver (Mac/iOS)
- TalkBack (Android)
- Switch access or voice control

**Remediation Priorities**

1. **High:** Add keyboard alternatives for drag-and-drop (up/down arrow keys to reorder, keyboard shortcut to move between columns)
2. **High:** Add skip-to-content link in main layout
3. **High:** Ensure colour is never the only indicator (add text labels or icons alongside colour-coded priorities)
4. **Medium:** Test with NVDA screen reader and fix any announced content issues
5. **Medium:** Verify dark mode contrast ratios meet AA (4.5:1 for text, 3:1 for UI components)
6. **Low:** Add visible focus indicators on all interactive elements (check Tailwind's ring utility)

**Recommendations**

A proper WCAG 2.1 AA audit is needed before trust deployment. The foundation is decent (ARIA labels, focus traps, semantic HTML) but the interactive components (drag-drop, carousel, kanban) need keyboard alternatives. NHS Digital mandates AA compliance for all new digital services.

---

### 8. NHS Digital Standards Perspective

**NHS Service Standard Alignment**

| # | Standard | Status | Notes |
|---|---------|--------|-------|
| 1 | Understand users and their needs | Partial | Built by a ward NIC with direct clinical experience. No formal user research sessions documented. |
| 2 | Solve a whole problem for users | Good | Covers the full referral-to-documentation workflow. Safeguarding decision helper addresses a complete user need. |
| 3 | Provide a joined up experience | Good | Unified guide viewer, linked resources, clipboard copy to clinical notes all create continuity. |
| 4 | Make the service simple to use | Good | Three-way diary, search, category filters. Could be simpler on the diary page. |
| 5 | Make sure everyone can use the service | Partial | Accessibility started but not complete. See Hat 7. |
| 6 | Create a team that includes multidisciplinary skills | Partial | Solo developer with AI tooling. Would benefit from UX and clinical safety input. |
| 7 | Use agile ways of working | Good | 18 sessions, 125+ snag items tracked, iterative development with stakeholder feedback. |
| 8 | Iterate and improve frequently | Good | Continuous deployment via Vercel, frequent updates. |
| 9 | Create a secure service | Partial | Demo is low-risk. Production needs security review. See Hat 5. |
| 10 | Define what success looks like | Partial | No defined KPIs or success metrics documented. |
| 11 | Choose the right tools and technology | Good | Next.js, TypeScript, Tailwind - all mainstream, well-supported choices. |
| 12 | Make new source code open | Partial | GitHub repo is private. Would need decision on open-sourcing. |
| 13 | Use and contribute to open standards | Partial | No FHIR or HL7 implementation yet. Nexus webhook is custom format. |
| 14 | Operate a reliable service | Partial | Vercel hosting is reliable. No monitoring, alerting, or SLA defined. |

**Clinical Safety Assessment (DCB 0129/0160)**

The Dev Panel includes a clinical safety section with a hazard log starter. This is a good beginning but needs:

- Formal Clinical Safety Officer (CSO) appointment
- Clinical risk management plan
- Hazard workshop with clinical staff
- Safety case report before go-live

The project doesn't make clinical decisions or provide clinical advice - it's primarily a workflow tool and information directory. This limits the clinical risk profile, but DCB 0129 assessment is still required for any NHS digital tool.

**Interoperability Readiness**

- No FHIR resources implemented
- No SNOMED CT or dm+d terminology mapping
- Nexus integration is custom webhook (not standards-based)
- No HL7 messaging

For the current scope (ward workflow tool, not clinical record system), full interoperability standards aren't immediately needed. But if Max+ ever connects to clinical systems, FHIR readiness would be expected.

**Gaps and Recommendations**

1. **Document formal user research** - even informal feedback sessions with ward staff count, just write them up
2. **Define success metrics** - time saved per shift, referral completion rate, staff satisfaction score
3. **Appoint a Clinical Safety Officer** and begin DCB 0129 assessment
4. **Consider open-sourcing** the Light version (NHS Service Standard 12 encourages open source)
5. **Add FHIR awareness** to the Nexus integration design (future-proofing)

---

### 9. Training Perspective

**Learning Curve Assessment**

The app uses familiar patterns (cards, tabs, filters, modals) that any computer-literate staff member will recognise. The NHS colour scheme adds familiarity. Estimated time to basic proficiency:

| Feature | Time to Learn | Notes |
|---------|--------------|-------|
| Browsing links/guides | 2-3 minutes | Immediately intuitive |
| Following a referral workflow | 5 minutes | Step-by-step, hard to go wrong |
| Using the team diary | 10-15 minutes | Three modes need explaining |
| Managing tasks (claim/drop/complete) | 5-10 minutes | Tooltips help but need initial explanation |
| Kanban board | 5 minutes | Familiar pattern from other tools |
| Admin features | 15-20 minutes | More complex, needs role-specific training |

**Training Needs Analysis**

The interactive demo tour (8 screens) provides a good introduction. The intro guide covers navigation and key features. The FAQ handles common questions.

Missing:
- Role-specific quick-start cards (what does a Band 5 nurse need to know vs. a ward admin?)
- Video walkthroughs (even 60-second screen recordings would help)
- "Cheat sheet" - a one-page PDF with the 10 most common actions
- Training completion tracking (did the user finish the tour?)

**Documentation Gaps**

- README.md is still boilerplate Next.js content
- No user-facing documentation beyond the in-app intro guide and FAQ
- The Dev Panel is developer/governance documentation, not user documentation
- No troubleshooting guide ("I can't find X", "My task disappeared", "Link doesn't work")

**Support Model Recommendations**

For a Light version pilot:
- **Self-service:** Tour + intro guide + FAQ covers most needs
- **Ward champion:** One tech-confident staff member per ward to help colleagues
- **Feedback mechanism:** Already exists (feedback page with localStorage)

For Medium+ production:
- **Dedicated support channel** (MS Teams channel or similar)
- **Monthly content review** by contributors (links, guides stay current)
- **Quarterly training refresh** for new starters

**Rollout Strategy Suggestions**

1. **Week 1:** Install on one ward's shared computer, show the demo tour to 2-3 keen staff
2. **Weeks 2-4:** Let them use it naturally, collect feedback via the feedback page
3. **Week 5:** Review feedback, fix top issues, brief the wider ward team
4. **Week 6+:** Open to other wards based on first ward's experience

---

### 10. Project Management Perspective

**Progress Summary**

| Metric | Value |
|--------|-------|
| **Development sessions** | 18 |
| **Git commits** | 163 |
| **Snag items logged** | 129 |
| **Snag items resolved** | ~120 (93%) |
| **Build phases complete** | 8 of 9 |
| **Outstanding to-do items** | 5 |

The project has moved from concept to demo-ready in 18 sessions. That's fast for a solo developer. The snag list methodology (log everything, work through in order) has been effective.

**Scope Assessment**

The original scope (CLAUDE.md Session 1) defined a 4-tier ward information tool. The project has grown to include:
- Safeguarding hub with decision helper (added Session 13)
- 5 style themes and dark mode (added Session 14-15)
- Staff management page (added Session 12)
- Dev Panel with governance documentation (added Session 7)
- Interactive demo tour (added Session 11)
- Patient progress reports (added Session 5)

Scope has expanded but in a controlled way - each addition was discussed and tracked. The version system prevents feature overload in production deployments.

**Risk Register**

| Risk | Status | Mitigation |
|------|--------|------------|
| Single developer | Active | CLAUDE.md is thorough, code is typed, AI-assisted development reduces bus factor |
| No automated testing | Active | 3 test files only. Production would need more. |
| npm vulnerabilities | Active | 3 known, all fixable |
| Trust approval timeline | Unknown | Demo-ready, waiting for meeting |
| DPIA not complete | Active | Scaffold exists, needs IG officer input |
| Clinical safety not assessed | Active | Hazard log started, needs CSO |

**Dependency Analysis**

| Dependency | Type | Status | Risk |
|-----------|------|--------|------|
| Vercel hosting | Infrastructure | Working | Low (Light version) |
| Supabase | Database (Medium+) | Not set up | Medium (blocks Medium deployment) |
| Trust SSO | Auth (Medium+) | Not started | Medium (blocks Medium deployment) |
| Nexus API | Integration (Max+) | Specced only | Low (webhook from Trust IT) |
| IG approval | Governance | Scaffold ready | Medium (blocks production) |
| Clinical safety | Governance | Started | Medium (blocks production) |

**Recommendations and Next Actions**

| # | Action | Priority | Owner | Target |
|---|--------|----------|-------|--------|
| 1 | Run `npm audit fix` | Critical | Developer | This week |
| 2 | Complete DPIA sections | High | Developer + IG Officer | Before pilot |
| 3 | Begin DCB 0129 assessment | High | Clinical Safety Officer | Before pilot |
| 4 | Split large page files (tasks, dev-panel) | High | Developer | Next 2 sessions |
| 5 | Add keyboard alternatives for drag-drop | High | Developer | Next 2 sessions |
| 6 | Screen reader testing (NVDA) | Medium | Developer + Accessibility | Before pilot |
| 7 | Write role-specific quick-start cards | Medium | Developer + Ward Staff | Before pilot |
| 8 | Define success metrics for pilot | Medium | Project Owner | Before pilot |
| 9 | Set up Supabase for Medium version | Medium | Developer + Trust IT | Post-pilot |
| 10 | Create user troubleshooting guide | Low | Developer | Post-pilot |

---

## Consolidated Recommendations

### Critical (Must Do)

1. **Fix 3 npm vulnerabilities** - `npm audit fix` resolves all. The `next` DoS vulnerability is the most concerning.
2. **Complete DPIA** - the scaffold is there, it needs filling in and signing off.
3. **Appoint Clinical Safety Officer** for DCB 0129 assessment.

### High Priority

4. **Split large files** - `tasks/page.tsx` (3,044 lines) and `dev-panel/page.tsx` (2,832 lines) into smaller components.
5. **Keyboard alternatives** for drag-and-drop interactions (diary task rescheduling, kanban board).
6. **Skip-to-content link** and colour-independent priority indicators (accessibility).
7. **Screen reader testing** with NVDA before any trust-facing deployment.
8. **Define pilot success metrics** (what does "this worked" look like?).

### Medium Priority

9. **Handover summary generator** - high clinical value, supports safe shift transitions.
10. **Breadcrumb navigation** on diary and patient detail views.
11. **Role-specific quick-start documentation** for different staff types.
12. **Dark mode contrast audit** against WCAG AA standards.
13. **Patient search** as primary interaction (search box, not browse-and-filter).
14. **Add smoke tests** for diary rendering, task claiming, and patient list filtering.

### Low Priority / Nice to Have

15. **Video walkthroughs** (60-second screen recordings of common tasks).
16. **Content Security Policy headers** for production deployment.
17. **Update README.md** to reflect the actual project.
18. **Consider open-sourcing** the Light version per NHS Service Standard 12.
19. **FHIR awareness** in integration design for future clinical system connections.
20. **Cheat sheet PDF** - one-page printable reference for ward staff.

---

## Action Items

| Item | Owner | Priority | Target Date |
|------|-------|----------|-------------|
| Run npm audit fix | Developer | Critical | 14 Apr 2026 |
| Complete DPIA sections 1-7 | Developer + IG Officer | High | Before pilot |
| Appoint Clinical Safety Officer | Trust Management | High | Before pilot |
| Split tasks/page.tsx into components | Developer | High | Next 2 sessions |
| Split dev-panel/page.tsx into components | Developer | High | Next 2 sessions |
| Add keyboard drag-drop alternatives | Developer | High | Next 2 sessions |
| Skip-to-content link | Developer | High | Next session |
| NVDA screen reader testing | Developer | Medium | Before pilot |
| Define pilot success metrics | Mike (Project Owner) | Medium | Before pilot |
| Write quick-start cards (by role) | Developer + Ward Staff | Medium | Before pilot |
| Dark mode contrast audit | Developer | Medium | Before pilot |
| Add smoke tests for key flows | Developer | Medium | Next 3 sessions |
| Handover summary feature | Developer | Medium | Post-pilot feedback |
| Update README.md | Developer | Low | Next session |
| CSP headers for production | Developer | Low | Before Medium deploy |

---

*Evaluation generated by Claude Code using the 10-hat project evaluation framework.*
*Previous evaluation: 2026-03-22 (Session 12). This is the Session 18 evaluation.*
*Template: docs/evaluations/project-evaluation-template.md v1.0*
