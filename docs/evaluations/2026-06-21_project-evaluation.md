# Project Evaluation: 2026-06-21

> Generated against the 10-hat framework in `project-evaluation-template.md`.
> Reflects the codebase as of Session 23 (the `/v2` <-> full URL swap, formulation
> personalisation, and RMP copy-format change made this session).

---

## Executive Summary

- **wardHub is demo-ready and feature-rich.** 39 page routes, ~35k lines of TypeScript/React, a clean NHS-themed design system, and a coherent single-codebase model that serves two audiences from one build.
- **The headline change this session:** the public root (e.g. wardhub.live) now serves the **stripped, PII-free** experience, and the **full build** (Team Diary, Patients, Reports, My Jobs, Staff) lives under `/v2`. This is the right shape for sharing a link publicly while keeping the data-heavy product one click away for internal demos.
- **Clinical tooling is maturing into genuine value.** The Risk Formulation + RMP builder is now risk-personalised on **both** stages, with a free-text "other" risk that surfaces every prompt, and an RMP output format engineered for SystemOne's plain-text paste (no blank rows, scannable headers).
- **The main gaps are non-functional, not functional:** no real authentication, localStorage-only persistence, thin automated test coverage, an outstanding WCAG 2.1 AA audit, and several content items awaiting Mike's clinical sign-off. None of these block a demo; all of them block a live deployment with real patient data.
- **Governance scaffolding exists** (Dev Panel, DPIA draft, hazard log, data classification) but is still draft. The product is correctly positioned as a prototype pending Trust IG/DCB approval.

---

## Evaluation Details

### 1. Web Developer Perspective

**Strengths**
- Modern, current stack: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind 4, Lucide icons. Dependency surface is small and deliberate (Supabase client, focus-trap-react, sonner).
- Single-codebase / dual-experience model is elegant: middleware rewrites `/v2/*` to the real routes and a `useIsV2()` flag drives what each experience hides. After this session's swap, the limited experience is the default and the full build is prefixed - achieved by inverting **two** files (`useV2.ts`, `middleware.ts`) rather than touching 124 call sites, which kept the diff small and reviewable.
- Data is well-separated into `src/lib/data/**` (guides, risk, careplan, staff, tasks, bookmarks). The risk builder's content (`risk.ts`) is now ~900 lines of structured, hand-tuned clinical word-banks - data, not logic.
- Build is healthy: `next build` compiles cleanly in ~4.5s; no type errors across the session's changes.
- Shared date helper (`toLocalDateStr`) fixed a real class of UTC-midnight drift bugs; corrupt-localStorage guards prevent whole-app crashes.

**Technical Debt / Flaws**
- **`isV2` now reads as "true when NOT under /v2"** after the swap. The behaviour is correct and heavily commented, but the name is a future foot-gun. A later rename to `isLimited` would pay down the confusion (tracked, low priority).
- `tasks/page.tsx` is ~2,600 lines - a god-component that should be decomposed (diary, my-diary, kanban toggle, modals).
- A few legacy redirect stubs (`/diary`, `/my-diary`, `/tasks/my-tasks`) use absolute server `redirect()` and would bounce a `/v2` user back to the limited root on direct navigation. All generated links now avoid them, so this is a hand-typed-URL edge case only.
- Test coverage is minimal (3 test files: providers, button, modal). No coverage of the diary/task logic, the guide builders, or the v2 middleware.
- `next build` warns that the `middleware.ts` convention is deprecated in favour of `proxy.ts` (Next 16.2+). The `/v2` split depends on it; must migrate before Next 17.

**Limitations**
- No backend: all state is localStorage. No data layer, no API contracts exercised (Nexus is a documented spec only).
- No CI pipeline visible; quality gates are manual (`npm run build`, `npm test`).

**Recommendations (prioritised)**
1. Add a regression test for the v2 middleware (root blocks PII routes, `/v2/*` renders) - the swap is exactly the kind of thing that silently breaks.
2. Decompose `tasks/page.tsx`.
3. Migrate `middleware.ts` -> `proxy.ts` ahead of any Next 17 bump.
4. Plan the rename `isV2` -> `isLimited` as a single mechanical PR.

---

### 2. Clinical User (Nurse) Perspective

**What works well for clinical staff**
- The Risk Formulation + RMP builder is now genuinely useful at the point of care: pick the patient's risks once at the top and **both** the formulation prompts and the per-risk RMP chips tailor themselves (falls shows frailty/postural-drop prompts, self-harm shows ligature/concealment prompts, diet shows intake/refeeding prompts). This was the previous tool's biggest weakness and it is now fixed.
- The new "other (unlisted risk)" option means a nurse is never stuck: name the risk and every prompt from every risk appears as a starting palette.
- The RMP output is now built for the real target system. SystemOne's risk screen is a plain notepad that strips blank rows; the new format heads each plan with its risk name between `===` bars and separates sections with `---` dividers, so a pasted plan stays scannable. The mandatory MDT escalation line is auto-appended - a safety-critical trust rule that staff routinely forget.
- Guides, referrals, and links are fast to reach and consistently structured (criteria -> form -> WAGOLL -> submit -> case note -> reminder).
- "Take Over"/"Claim"/"Drop" task language with tooltips matches ward reality.

**Pain points and frustrations**
- The "other" risk palette shows ~196 chips (the full union). It is comprehensive by design but visually heavy; some staff may find it overwhelming versus a searchable list.
- Empty RMP sections auto-render "Not yet established." in the copy box. This aligns with trust guidance (never leave blank) but could let a rushed nurse paste an under-completed plan.
- The diary/Today view only appears in the full build (`/v2`); staff who land on the public link will not see their jobs. This is intentional but needs clear signposting so it is not read as "missing".

**Missing features staff would expect**
- No print/export of a completed formulation or RMP (copy-to-clipboard only).
- No save/resume - the builder explicitly stores nothing, so an interruption loses the draft.

**Recommendations (by patient-care priority)**
1. Sign off (or replace) the draft weak-vs-strong examples in the Risk and Care Plan builders - clinicians will anchor on them.
2. Consider a "search risks" affordance for the "other" palette.
3. Add print for the RMP/formulation so it can be checked on paper before pasting.

---

### 3. Trust Senior Management Perspective

**Strategic Value Assessment**
- Directly supports safer, more consistent documentation (RMP within 24h, MDT escalation, structured formulation) - a recurrent CQC and coroner theme in inpatient MH.
- The dual experience is a smart adoption play: a no-PII public link for stakeholder buy-in, plus a full internal demo, from one codebase with no drift.
- Low marginal cost to extend to other wards (poet-pseudonym demo data already models 5 wards).

**Risk Register (with mitigations)**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Staff paste an incomplete RMP | Medium | High | "Not yet established" default + reviewer guidance; add a completeness nudge |
| Public link mistaken for the live clinical tool | Medium | Medium | Prominent "demo / no patient data" banners already present; keep them |
| Clinical content inaccurate (draft examples) | Medium | High | Hold for Mike's sign-off before any rollout |
| Dependence on one developer/owner | High | Medium | Documentation is strong (CLAUDE.md, MEMORY, Dev Panel); formalise handover |

**Resource Requirements**
- To go live: IG/DCB clinical-safety case, real auth + hosting on Trust infrastructure, a database, and a named clinical-safety officer (DCB0129/0160).

**Implementation Considerations**
- Phased: keep the public limited build as the engagement/training tool now; gate the full PII build behind Trust SSO before it touches real data.

**Recommendations for Board**
1. Approve continued prototype investment; do **not** approve live PII use until IG/DCB sign-off.
2. Fund a small clinical reference group to validate the risk/care-plan content.

---

### 4. Information Governance Perspective

**Compliance Status:** Appropriate for a prototype; **not** yet compliant for live PII.

**Data Flow Analysis**
- The public root build is now genuinely PII-free: middleware blocks `/diary`, `/tasks`, `/patients`, `/reports`, `/my-tasks`, `/my-diary`, `/data-sources`, `/referrals/log`, `/staff` and redirects them home. Verified this session (root returns redirects; `/v2/*` renders).
- The risk/care-plan builders explicitly persist nothing - drafts live in component state only and are lost on navigation. This is a strong data-minimisation posture for a drafting aid.
- Demo data is fictional throughout (poet wards, generated staff/patients).

**Risk Areas**
- Editor chip overrides and diary/view preferences sit in `localStorage` (`wardhub_*`) - fine for demo, but on a shared Trust device this is per-browser and unmanaged.
- `docs/` in the repo still contains raw FOCUS dumps with real internal contacts; some real numbers also live in source code comments. Must be purged/ignored before any public repo exposure.

**Required Actions for Compliance**
1. Complete the DPIA (currently a draft scaffold).
2. Define retention/rights handling once a real datastore exists.
3. Purge/gitignore `docs/` and audit code comments for real contacts before the repo could ever be public.

---

### 5. IT Security Perspective

**Security Strengths**
- Attack surface for the public build is small: static-ish content, no patient data, no write-back.
- Route-level blocking of PII paths is enforced server-side in middleware, not just hidden client-side - the right place for it.

**Vulnerabilities Identified**
- **No authentication.** Login is a demo role-picker; anyone can assume any role. Acceptable for demo, unacceptable for live.
- `npm audit` reports 20 advisories (1 low, 19 moderate), predominantly vendored inside Next/postcss. Per project history, **do not** `npm audit fix --force` (it downgrades Next). Track upstream fixes.
- localStorage trust: corrupt values are now guarded, but client-controlled state drives UI gating - never rely on it for real authz.

**Threat Model Summary**
- Today's worst case (public build) is defacement of a no-data demo. Once real PII and auth are added, the model changes entirely and needs a fresh review.

**Remediation Priorities**
- Critical (for live): real auth (Trust SSO), server-side authz, encrypted datastore, security headers review.
- Medium: dependency-advisory monitoring; migrate off deprecated middleware convention.

---

### 6. UX Design Perspective

**UX Strengths**
- Strong, consistent NHS visual identity; the 5 style themes + dark mode show real polish.
- The risk builder's new top-level "Which risks are you covering?" picker creates a clear mental model: choose once, everything below adapts. Tailored-prompt hint text reassures the user the personalisation happened.
- Copy boxes with one-tap clipboard and live preview are excellent for the "draft then paste" workflow.

**Usability Issues**
- The 196-chip "other" palette is a wall of options; chunking or search would help.
- Two stages plus teaching collapsibles plus examples make the risk page long; an in-page jump/sticky nav would aid orientation.
- Auto-"Not yet established" is correct but visually identical to user-entered text in the preview - consider a subtle marker.

**User Journey Analysis**
- Public visitor -> Links/Guides -> a builder -> clipboard. Clean and short.
- Internal user -> `/v2` -> Diary/Patients/Reports. The handoff between the two builds is currently URL-only; a visible "open full build" affordance for authorised users would smooth it.

**Recommendations**
1. Add search/chunking to large chip palettes.
2. Sticky section nav on the long builder pages.
3. Visually distinguish auto-filled placeholders in copy previews.

---

### 7. Accessibility Perspective

**Compliance Summary:** Partial; a full WCAG 2.1 AA audit (#78) is still outstanding.

**Likely Strengths**
- Semantic headings, `aria-pressed` on chip toggles, `aria-label`s on icon buttons, focus-trap on modals, reduced-motion handling noted in prior sessions.

**Barriers to Confirm**
- Colour contrast of rose/amber chips on white and of muted helper text needs measuring.
- Keyboard navigation of the diary (drag-drop columns) is a known gap (#76).
- Large chip grids need a sensible tab order and possibly grouping semantics for screen readers.
- The plain-text RMP separators (`===`, `---`) are decorative; ensure they are not read character-by-character in any read-aloud context (they live in a textarea-style preview, so generally fine).

**Remediation Priorities**
1. Run the AA audit (axe + manual keyboard + screen-reader pass).
2. Provide keyboard equivalents for diary drag-drop.
3. Verify contrast tokens meet 4.5:1.

---

### 8. NHS Digital Standards Perspective

**Compliance Matrix (summary)**
- NHS visual identity: strong adherence (colour tokens, Source Sans, layout).
- NHS Service Standard: partially evidenced (accessibility, iterate-from-research) but not formally assessed.
- **Clinical Safety (DCB0129/0160): not yet completed.** A hazard log scaffold exists in the Dev Panel; the RMP auto-MDT-line and "never leave blank" defaults are good safety-by-design touches, but a formal clinical-safety case and named CSO are required before live use.
- Interoperability: Nexus integration is a documented one-way webhook spec only; no FHIR/SNOMED yet (appropriate at this stage).

**Gaps and Recommendations**
1. Commission the DCB0129 clinical risk assessment (the risk/care-plan builders are clinical-content features and need it).
2. Map terminology to SNOMED CT if/when content feeds clinical records directly.

---

### 9. Training Coordinator Perspective

**Learning Curve Assessment**
- The product is largely self-explanatory; the builders teach as they go (formulation-vs-plan explainer, gap prompts, weak-vs-strong examples, "where this goes in SystemOne" steps). The risk tool doubles as a documentation-training system.

**Training Needs Analysis**
- Minimal for navigation; the real training value is clinical (what good formulation/RMP/care-plan writing looks like), which the tool itself scaffolds.
- One concept needs explaining in onboarding: the public (limited) build vs the full `/v2` build - which to use and why.

**Documentation Gaps**
- In-app help (Intro Guide, FAQ, Tour) is strong and v2-aware. Update it to reflect that the limited experience is now the default URL and the full build is at `/v2`.

**Support Model / Rollout**
1. Use the public build for awareness sessions and the SystemOne paste workflow.
2. Add a one-line note in the Intro Guide about the two builds post-swap.

---

### 10. Project Management Perspective

**Progress Summary**
- Phases 1-8 complete (skeleton, bookmarks/links, workflows, guides, ward tasks, patient features, Nexus spec, business case/tour). Phase 9 (polish: skeletons, keyboard nav, WCAG, print) is the live backlog.
- This session delivered: the `/v2` <-> full swap (verified), formulation personalisation with a free-text catch-all risk, and a SystemOne-friendly RMP copy format - all building cleanly.

**Scope Assessment**
- Scope is well-controlled and clearly demo-bounded. The version/feature-flag history shows disciplined decisions.

**Risk Register (project)**
| Item | Status |
|------|--------|
| 3 empty placeholder guides (DoLS, Named Nurse, Discharge checklists) | Open - awaiting content |
| Draft weak/strong examples need clinical sign-off | Open - Mike |
| WCAG 2.1 AA audit (#78), keyboard nav (#76), loading skeletons (#75) | Open |
| middleware -> proxy migration (#147) | Open (pre Next 17) |
| docs/ purge before any public repo (#148) | Open |

**Dependency Analysis**
- External: Vercel (Sharpy20 only), GitHub (Sharpy20/hub-alpha). Live PII path depends on Trust infra + IG/DCB approval - outside the dev's control.

**Recommendations and Next Actions**
1. Get clinical sign-off on the builder examples and fill the 3 placeholder guides.
2. Schedule the accessibility audit as the next polish sprint.
3. Add the middleware regression test and migrate to `proxy.ts`.
4. Update in-app help copy for the URL swap.

---

## Consolidated Recommendations

### Critical (Must Do before any live PII use)
- Real authentication + server-side authz (Trust SSO).
- DPIA completion + DCB0129/0160 clinical-safety case with a named CSO.
- Encrypted datastore replacing localStorage; defined retention/rights.
- Purge/gitignore `docs/` and audit source comments for real contacts.

### High Priority
- Clinical sign-off of the Risk/Care-Plan builder examples; fill 3 placeholder guides.
- WCAG 2.1 AA audit (#78) + diary keyboard navigation (#76).
- Middleware regression test for the v2 split; migrate `middleware.ts` -> `proxy.ts`.

### Medium Priority
- Decompose `tasks/page.tsx`; rename `isV2` -> `isLimited`.
- Search/chunking for large chip palettes; print/export for builders.
- Loading skeletons (#75); expand print stylesheet (#79).

### Low Priority / Nice to Have
- Save/resume drafts in the builders.
- Visible "open full build" affordance for authorised users.
- Broader automated test coverage of diary/task logic.

## Action Items
| Item | Owner | Priority | Target Date |
|------|-------|----------|-------------|
| Clinical sign-off of builder examples | Mike + clinical group | High | Next session |
| Fill 3 placeholder guides | Mike (content) + Claude | High | TBC |
| Middleware regression test | Claude | High | Next session |
| WCAG 2.1 AA audit | Claude | High | Next polish sprint |
| middleware -> proxy migration | Claude | Medium | Before Next 17 |
| Update Intro Guide/FAQ for URL swap | Claude | Medium | Next session |
| DPIA + DCB clinical-safety case | Trust IG/CSO | Critical | Pre-live |

---

*Generated 2026-06-21 against `project-evaluation-template.md` v1.0. Supersedes `2026-03-22_project-evaluation.md`.*
