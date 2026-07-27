# Project Evaluation: 2026-07-28

> Run against `project-evaluation-template.md` **v2.0** (thirteen hats, evidence-first).
> Codebase as of commit `9dc40ef`, the end of Session 42 (task hand-back, service map rebuild, chase log retired).
> Supersedes `2026-06-21_project-evaluation.md`.

---

## Executive Summary

- **The build is in better shape than the last two evaluations suggested, and the content is in worse shape.** Code health is genuinely good now: clean build, 32 tests passing, and after this session's fixes a typecheck that returns zero errors for the first time. Content is where the risk has moved. Of 71 guides, exactly **one** has been explicitly signed off green. Twenty are red. The other fifty sit on the amber default, which means nobody has said yes to them.
- **The worst thing found this pass has been fixed.** Twelve referral guides carried invented contact details, three of them phone numbers like `01234 567890`, rendered at the same size, in the same green box, with the same one-tap copy button as the real, verified numbers next to them. A nurse following the PICU guide would have copied a fake direct line into a case note. Now replaced with the project's existing "Hidden in demo mode" convention, and the copy button is suppressed on the placeholder.
- **The privacy notice did not match the app.** The GDPR page told users their tasks were stored in localStorage (they are not stored anywhere), and that no cookies were in use (the password gate sets one). Both corrected. This matters more than it sounds: that page is the thing an IG officer will read first.
- **Nothing about a patient persists anywhere, and that is not written down as a feature.** All diary state lives in React memory and dies on refresh. For IG that is the strongest card in the deck. For the sponsor demo on the 30th it is a trap, because one accidental refresh resets the whole story mid-presentation.
- **One high-severity dependency advisory closed, three remain and cannot be closed by us.** Next went 16.2.9 to 16.2.12, which fixes an unauthenticated Server Function endpoint disclosure. The postcss and sharp advisories are vendored inside Next itself. Real-world exposure looks close to nil, and the reasoning is in the security section rather than left as a scary number.
- **The recommendation that has now failed to land three evaluations running is a regression test for the build split.** It matters more than it did in June, because `COLLAPSED_FOR_DEMO = true` has left all the limited-build logic dormant and unexercised. The day someone flips it back for a compliance demo, nothing will have tested it for a month.

---

## Since the last evaluation

**Landed** (recommended in June, done since):

| June recommendation | Status |
|---|---|
| Migrate `middleware.ts` to `proxy.ts` | Done, Session 24 |
| WCAG 2.1 AA audit | Done, Session 26, plus the end-to-end walkthrough that found the systemic modal gap |
| Purge `docs/` and audit comments for real contacts | Done. History rewritten 6 Jul, real values now live outside the repo in `E:\Hub\temp\internal-contacts.md` |
| Fill the three placeholder guides | Done, Session 32. No empty placeholder guides remain |
| Print for the builders | Done. Nine routes now support print |
| Decompose `tasks/page.tsx` | Partly. 2,600 to 2,240 lines. Still a god-component, but it stopped growing |

**Still open, and now on its third appearance:**

- **A regression test for the build split.** Recommended June, recommended April in substance, still absent. Test count has not moved: three files, 32 tests, against 50,470 lines.
- **`isV2` naming debt.** Sixty-two call sites where `true` means "limited". Untouched.
- **Clinical sign-off of the builder examples.** The reason twenty guides are red. This one is genuinely blocked on Mike, not on Claude, and it should stop being written as a recommendation and start being written as a decision he owes the project.

**Gone backwards:**

- **Placeholder form links have grown, not shrunk.** The long-standing figure was 86. The actual count of `url: "#"` in the data layer is now **131**. Some of that is new guides built since, each arriving with its own unwired form links. The wiring effort in BACKLOG Section A is losing ground to the build rate.
- **Dependency advisories moved from moderate to high.** Not through neglect; upstream reclassified. Acted on this pass.

---

## Scorecard

| # | Perspective | Score /5 | RAG | vs June | One-line reason |
|---|-------------|:--------:|:---:|:-------:|-----------------|
| 1 | Web Developer | 4 | Green | ↑ | Clean build, clean typecheck now, small deliberate dependency set. Lint backlog and thin tests hold it off 5 |
| 2 | Clinical User | 4 | Green | ↑ | Hand-back is the best thing in the product. Losing everything on refresh is the ceiling |
| 3 | Trust Senior Management | 3 | Amber | → | Strong story, real value, one unpaid nurse holding all of it |
| 4 | Information Governance | 4 | Green | ↑ | Nothing persists about a patient. Privacy notice now actually true |
| 5 | IT Security | 2 | Amber | → | Shared password with no rate limiting, all authz client-side. Fine for a demo, nowhere near live |
| 6 | UX Design | 4 | Green | → | Consistent and confident. The home page is doing too much |
| 7 | Accessibility | 3 | Amber | → | June's audit fixes hold, but nothing added since has been audited |
| 8 | NHS Digital Standards | 2 | Amber | → | No DCB0129 assessment, no named clinical safety officer, and the app now generates clinical text |
| 9 | Training | 4 | Green | ↑ | 942-question quiz bank, tour, intro guide, FAQ. Better resourced than most funded projects |
| 10 | Project Management | 3 | Amber | → | BACKLOG is genuinely maintained. 57 open items and a build rate that outruns the wiring rate |
| 11 | Clinical Content Editor | 2 | Red | new | One guide of 71 signed off. This is the project's real backlog |
| 12 | Deployment and Operations | 2 | Amber | new | Push to main goes straight to production with no gate and no monitoring |
| 13 | Patient and Carer | 4 | Green | new | Patient voice is designed in, not bolted on. Some generated text still reads like a form |

---

## Verification Log

| Check | Result |
|---|---|
| `npm run build` | Clean. Compiled in 3.8s, 49 static pages generated |
| `npm test` | 32 passed, 3 suites, 0 failed |
| `npx tsc --noEmit` | **0 errors** (was 26 at the start of this pass, all in test files) |
| `npm run lint` | 44 problems: 37 errors, 7 warnings. 36 of the 44 are a single rule, `react-hooks/static-components` |
| `npm audit` | Next bumped 16.2.9 to 16.2.12 this pass. 3 high remaining in production deps, all vendored inside Next (postcss x2, sharp x1). 32 further advisories are dev tooling only (eslint, jest, babel chains via `brace-expansion` and `js-yaml`) |
| Routes | 49 page routes, 1 API route (`/api/auth/verify-password`) |
| Size | 50,470 lines across 182 TypeScript/TSX files |
| Dependencies | 7 production, 13 dev. Next 16.2.12, React 19.2.3 |
| Git author, last 15 commits | Sharpy20 on all 15. Clean |
| `COLLAPSED_FOR_DEMO` | `true`. Full product served at the root, the limited-build logic dormant |
| Em dashes in `src/` | 0 |
| Guides | 71 in `ALL_GUIDES`. Approval: 1 green, 20 red, 50 amber (7 explicit, 43 on the default) |
| Links | 113, all amber except one |
| Quiz | 942 questions across 32 batch files |
| Placeholder form links | 131 instances of `url: "#"` in the data layer |
| `[confirm]` markers | 4 |
| Task persistence | None. `tasks-provider.tsx` holds `useState(ALL_DEMO_TASKS)` and writes nothing |

---

## Evaluation Details

### 1. Web Developer

**Strengths**

The dependency surface is the thing to praise first. Seven production dependencies for an app this size is discipline, not luck. Build is fast (3.8s), all 49 routes prerender, and the data-versus-logic separation in `src/lib/data/**` is holding up under real weight, `howto-guides.ts` at 2,178 lines and `referral-workflows.ts` at 1,462 are big files but they are *content* files, which is the right place for bulk.

Typecheck is now a usable gate. It was not before: 26 errors sat in the test files because `jest.setup.js` pulls in `@testing-library/jest-dom` at runtime and, being plain JS, never reached the TypeScript program. Added `types/testing-library.d.ts` and fixed a closure-narrowing pattern in `providers.test.tsx` that TypeScript was resolving to `never`. Zero errors now, so `tsc --noEmit` can go in a pre-push hook and mean something.

**Technical debt and flaws**

The lint result is misleading at a glance. Thirty-six of the 44 problems are one rule, `react-hooks/static-components`, firing on components declared inside a render body (`PayslipDecoder.tsx` is the clearest case). That is a real pattern worth fixing, but it is one afternoon of mechanical work in a handful of files, not 44 separate problems.

`src/app/dev-panel/page.tsx` is now the largest file in the repo at 2,934 lines, having overtaken `tasks/page.tsx`. That is worth naming as its own problem, because of what is inside it: the DPIA, the hazard log, the RBAC matrix and the data catalogue are all hand-written JSX. Governance documents that only exist inside a React component cannot be reviewed, redlined or version-compared by the IG officer or the clinical safety officer who needs to sign them. `docs/nhs-ready/` has markdown versions of some of this, which means there are now two copies that will drift.

Test coverage against the risk profile is the standing weakness. Three test files cover a button, a modal and the providers. Nothing covers the diary logic, the hand-back state machine, the guide viewer, or the proxy. The hand-back feature in particular is append-only history plus a waiting-on state plus generated case-note text, which is exactly the shape of thing that a test would pin down and a manual click-through will not.

**Limitations**

No backend, no CI. Quality gates are whatever gets run by hand in a session.

**Recommendations**

1. Write the proxy test. Not because it is elegant but because it has been recommended three times and the logic it protects is currently dormant and unwatched.
2. Clear the `react-hooks/static-components` rule in one mechanical pass.
3. Move the DPIA, hazard log and data catalogue out of `dev-panel/page.tsx` into markdown, and have the page render from that. One source, reviewable by non-developers.
4. Add a test around the hand-back reducer before it grows a fourth state.

---

### 2. Clinical User (Nurse)

**What works well**

The hand-back flow is the best-designed thing in the product. Three dropdowns, no free text anywhere, and a case note generated whether or not the job got finished. The no-free-text decision is what makes it defensible: you cannot write something unguarded into a record through it, and every hand-back produces the same shape of evidence. The waiting-on state with a chase date and a visible age is the bit ward staff will actually feel, because "who are we waiting on and how long has it been" is the question nobody can currently answer at handover.

Splitting Drop into "claimed by mistake" (silent) and "hand back" (structured) respects how wards really work. People do misclick, and forcing a reason for a misclick would have trained everyone to lie to the form.

The referral guides are consistently shaped, criteria then form then example then submit then case note then reminder, so the second guide you ever open is already familiar.

**Pain points**

Nothing survives a refresh. Claim a job, hand one back, complete three, hit F5, and it is all back to the seeded demo state. For a nurse trying the app on a break this reads as broken rather than as a design decision, and there is no message anywhere in the UI that says so. The GDPR page now says it plainly, but nobody reads that first.

The submission contacts problem found this pass is worth restating from the nurse's chair, because it is the sharpest example of how a content defect outranks a code defect. The PICU guide displayed a phone number in bold, at `text-xl`, in a green bordered box with a phone icon and a copy button. Everything about that presentation said "this is the number, dial it". It was `01234 567890`. Nothing in the interface distinguished it from Call Derbyshire's real number two guides away. Fixed, but the class of defect is still live: 131 form links still resolve to `#`.

**Missing features staff would expect**

Save and resume on the builders. A risk formulation takes real time and one interruption loses it. This is the same finding as June and it has not moved.

**Recommendations, by patient-care priority**

1. Put a visible "nothing here is saved, refreshing resets the demo" line in the diary itself, not only on the GDPR page.
2. Audit the remaining 131 placeholder links the way the contacts were audited this pass. A dead `#` is honest; a plausible-looking wrong value is not.
3. Save and resume for the builders, even if it is only sessionStorage cleared on logout.

---

### 3. Trust Senior Management

**Strategic value**

The value proposition is narrow and real: staff spend less time hunting for the right form and write more consistent records, and the documentation prompts encode the trust rules people forget (the mandatory MDT line, the S117 two-meetings distinction, the barrier-to-discharge flag). Those are recurrent CQC and coroner themes and this is a credible answer to them.

The discharge-barrier and waiting-on features are the ones to lead with at Board level, because they answer a question the Trust already knows it cannot answer: what is actually holding up this discharge, and how long has it been held up.

**Risk register**

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Single maintainer. One nurse, own time, no cover | High | High | The documentation is unusually good (CLAUDE.md, BACKLOG, memory files, nhs-ready pack). That mitigates knowledge loss, not capacity loss. Nothing currently mitigates capacity loss |
| Content wrong or out of date, copied into a record | Medium | High | Traffic-light system exists. It is 1 green of 71, so the control is present but not yet operating |
| Demo mistaken for an approved tool | Medium | High | Development banner on every guide, password gate on the site, no real patient data anywhere |
| Staff adopt it, then it is withdrawn on governance grounds | Medium | Medium | Do not widen access before the DPIA and DCB0129 land |
| Dependencies outside the repo (`E:\Hub\temp`, printable guides) vanish | Medium | Medium | Bring anything load-bearing into a backed-up location |

**Resource requirements**

To go live with real data: Trust SSO, server-side authorisation, a real datastore, a DPIA, a DCB0129 clinical risk assessment with a named clinical safety officer, and a small clinical group to sign off content. The content sign-off is the one that cannot be bought or delegated to a developer, and it is the long pole.

**Recommendations for the Board**

1. Fund the clinical reference group before anything else. It is the only thing that turns 50 amber guides green, and every other approval waits behind it.
2. Approve continued prototype work. Do not approve live PII use yet.
3. Treat the single-maintainer position as a resourcing decision rather than a risk to note. Either give it protected time or accept that it stops when he does.

---

### 4. Information Governance

**Compliance status:** appropriate for a prototype, and better than the last evaluation credited. Not ready for live PII.

**Data flow**

The finding that reframes this whole hat: **task state is not persisted anywhere.** `src/app/tasks-provider.tsx` seeds `useState` from `ALL_DEMO_TASKS` and never writes. No localStorage key, no backend, no session storage. Every claim, hand-back, completion, waiting-on and history entry exists in page memory and is gone on refresh. Combined with the builders, which also store nothing, the position is that **no patient-shaped data is written to disk anywhere in the app, on the server or on the device.**

The nineteen `wardhub_*` localStorage keys hold preferences, the login choice, feedback, personal links, the care review tracker and the pay-band picker. `wardhub_user` holds a chosen demo identity. None of it is patient data.

**Risk areas and what was fixed**

The GDPR page was wrong in three ways and is now corrected:

1. It listed "tasks" among the things stored in localStorage. They are not stored at all.
2. It claimed "no cookies in use". The password gate sets `site_access`. It is a strictly necessary cookie needing no consent, but a privacy notice that says "no cookies" when there is a cookie is the kind of thing that costs credibility in an IG review for no reason.
3. It still referenced the referral chase log, retired on 27 July.

Remaining items:

- Rule 4 held up under a full sweep. 54 "Hidden in demo mode" placeholders, and every phone number left in `src/` traces to a genuinely public source (Call Derbyshire, Derby City social care, Disability Direct, Cloverleaf, Samaritans, the crisis lines). No named individuals: the Head of Service name is gone from the S117 content, replaced with the role.
- Two sets I would still have Mike confirm rather than assume: the crisis and home treatment direct numbers (`01332 623900`, `01246 293284`) and the perinatal team numbers (`01332 623911`, `01246 216523`). They are almost certainly on a public DHCFT page, which is the test, but I cannot verify that from the repo.
- The DPIA and hazard log remain drafts, and they live inside a React component (see hat 1).

**Required actions**

1. Complete the DPIA. It has been a draft scaffold across three evaluations.
2. Answer the hosting region question. Still not knowable from the repo, still on the chase list.
3. Settle the lawful-basis wording before it goes in front of anyone.

---

### 5. IT Security

**Strengths**

The attack surface is genuinely small: one API route in the entire app, no database, no write-back, no user-supplied content reaching a server, no file uploads. Route blocking for the limited build is enforced in `proxy.ts`, server-side, which is the right place even while it is dormant.

**Vulnerabilities**

- **The password gate has no rate limiting.** `POST /api/auth/verify-password` will compare an unlimited number of guesses against one shared ten-character password, with no lockout, no delay and no logging. Nobody would ever know it had been brute-forced. For a gate whose job is to keep a demo off search engines that is arguably proportionate, but it should be a decision rather than an oversight, and it is a five-line fix.
- **The password is hard-coded as the fallback** (`DEFAULT_PASSWORD` in the route) and `SITE_PASSWORD` is not set. So the gate protects against strangers, not against anyone with repo access, and the value also sits in the project notes. Fine today. Not fine if the audience widens.
- **The gate exempts any path containing a dot** (`pathname.includes(".")`), a broad heuristic for letting static assets through. Nothing exploits it today because no route contains a dot, but any future route that does becomes public without anyone touching the auth code.
- **All role checks are client-side.** Forty-eight references to `senior_admin` across the app, all in components. There is no server to enforce against, so this is a statement about the architecture rather than a bug, but it must not survive into a build that holds real data.
- Password comparison is a plain `===` rather than a timing-safe compare. Theoretical over a network, worth fixing while you are adding the rate limit.

**Dependencies**

Bumped Next 16.2.9 to 16.2.12 this pass, closing an unauthenticated Server Function endpoint disclosure. That mattered: it is a live, publicly reachable site.

Three high advisories remain in production dependencies, all vendored inside Next and not fixable without `--force` (which downgrades Next to 9.x and must never be run here):

- **postcss** (two high, one moderate): unescaped `</style>` XSS and sourceMappingURL path traversal. Both need attacker-controlled CSS. All CSS here is authored in-repo. Exposure: effectively nil.
- **sharp / libvips** (four CVEs): needs attacker-supplied images through image optimisation. The app does not use `next/image` anywhere and configures no remote patterns. Exposure: nil.

The other 32 advisories are dev tooling only, reached through eslint, jest and babel depending on vulnerable `brace-expansion` and `js-yaml`. They never ship. Note honestly that the headline count went **up** from 6 to 35 after the fix, purely because npm now expands those dev chains per-package.

**Threat model**

Today's worst case is defacement or unauthorised viewing of a demo containing no real data. That changes completely the moment real PII and auth arrive, and needs a fresh review at that point rather than an update to this one.

**Remediation priorities**

- **High:** rate-limit and log the password endpoint.
- **Medium:** set `SITE_PASSWORD` in the Vercel environment so the value leaves the source. Replace the dot heuristic with an explicit static-asset match. Timing-safe compare.
- **Critical, pre-live:** Trust SSO, server-side authorisation, encrypted datastore.

---

### 6. UX Design

**Strengths**

Five themes plus dark mode, all driven from CSS variables, and the product still reads as one product in each of them. That is unusual discipline. The guide viewer's shape (progress rail, one step at a time, copy boxes with one tap) is the right pattern for "draft it here, paste it into SystmOne", and the traffic-light badge on every tile is a small piece of honesty most prototypes would hide.

The service map rebuild was the right call. Categories first, twelve of them, then drill in. The previous flat view had six national services unreachable when out of area, which is the kind of bug that only shows up when you stop trusting the layout to encode the logic. Splitting `parent` (real dependency) from `near` (layout only) is the fix at the correct level of abstraction.

**Usability issues**

The home page is carrying too much: hero, development disclaimer, onboarding banner, safeguarding block with its own 999 strip and decision helper, bookmark wheel, today widget, favourites. Every piece earned its place in some session, and collectively they have turned the front door into a lobby. The bookmark wheel shrink has been on the list since before June.

Copy previews still render auto-filled placeholders ("Not yet established.") identically to text the user typed. Third evaluation for that one. It is a one-line styling change and it prevents someone pasting a plan they think they finished.

**Recommendations**

1. Cut the home page to three things and let the rest live one click away.
2. Visually distinguish auto-filled text in every copy preview.
3. Chunk or make searchable the largest chip palettes.

---

### 7. Accessibility

**Compliance summary:** the June work holds. Everything built since is unaudited, which is now two months of new surface.

June's axe pass cleared the pages it covered and the walkthrough caught the systemic modal gap (roughly twenty inline overlays with no dialog semantics, all fixed). Focus-trap is in place on the base `Modal`, `confirm-dialog` and the shared `useModalA11y` hook.

**Not audited this pass, and it should be said plainly:** I did not re-run axe. Since the last audit the app has gained the hand-back flow with its dropdowns and history, the overview page (1,933 lines), the rebuilt service map with zoom and pan, the quiz, the pay band picker and the payslip decoder. None of those existed when the audit ran.

**Known open barriers, unchanged:**

- Drag-and-drop task reordering has no keyboard equivalent.
- Contrast in the four non-NHS themes and dark mode was never measured.
- Custom overlay modals still lack focus trap and Escape, against the compliant base `Modal`.
- The approval traffic light carries meaning by colour. `StatusBadge` needs checking for a text alternative.

**Recommendations**

1. Re-run axe over the pages built since June, especially the service map (a pan-and-zoom canvas is the hardest thing here to make keyboard-accessible) and the hand-back modal.
2. Give the custom modals the base `Modal` treatment or replace them with it.
3. Measure contrast in dark mode and the four alternative themes.

---

### 8. NHS Digital Standards

**Compliance matrix**

- NHS visual identity: strong. Colour tokens, Source Sans, layout conventions all followed.
- NHS Service Standard: partially evidenced, never formally assessed. Accessibility work, iteration and a clear user need are all demonstrable.
- **Clinical safety (DCB0129 / DCB0160): not done.** This is the largest single gap in the project and it has been unchanged across three evaluations.
- Interoperability: the Nexus webhook is a documented spec, nothing built. No FHIR, no SNOMED. Appropriate at this stage.

**Clinical safety assessment**

The hazard that matters is not the code failing, it is the content being wrong and being trusted. The app now generates clinical text: risk management plans, formulations, care plan sections, hand-back case notes, S117 wording. That text gets pasted into a patient's record, where it becomes the clinical record. That is a DCB0129 concern whatever the disclaimers say.

Two things blunt it today. Every guide carries a development banner, and the traffic light exposes approval state on the tile. Two things sharpen it. Fifty guides sit on an amber default that means "nobody has said yes", and the fake-contacts defect found this pass proves that a plausible-looking wrong value can survive in a guide for months without anyone noticing.

The safety-by-design touches are real and worth crediting in any submission: the auto-appended mandatory MDT line, "Not yet established" instead of a silent blank, no free text in hand-back, guidance instead of scoring on the physical health tools, and the deliberate refusal to build MUST and Waterlow calculators.

**Recommendations**

1. Commission the DCB0129 assessment now, scoped to the content-generation features. It does not need the app to be finished.
2. Name a clinical safety officer. Without one, none of the rest counts.
3. Log the content hazard explicitly, with the fake-contacts incident as the worked example of how it materialises.

---

### 9. Training

**Learning curve**

Someone who has used any ward system will be productive in the guides immediately: the shape repeats, and the language matches the ward ("Claim", "Take Over", "Drop", "Hand back"). The diary needs more, mostly because the three-way toggle (Team Diary / My Diary / My Jobs) is a genuine concept to learn rather than a label to read.

**What is unusually strong**

942 quiz questions across 43 topics, 61% mined from real trust documents, is a training asset most funded projects do not have. The tour, intro guide and FAQ cover the ground. The printable one-pagers are a good instinct for a ward that will not read a web page.

**Gaps**

The quiz has no sign-off badge while every guide does. It draws on trust policy and it is the one place the app makes assertions and marks the user wrong. It should carry the same traffic light, and the inconsistency currently reads as an oversight rather than a decision.

Training materials will need a pass for the same reason the tour did last time: the app changed. The hand-back flow, the rebuilt service map and the retired chase log are all new since the intro guide was last reviewed.

**Support model**

There is no support model. Questions go to one person's NHS email, which is also the feedback route in the limited build. That is honest for a prototype and untenable past a handful of wards.

**Recommendations**

1. Put the traffic light on the quiz.
2. Refresh the tour and intro guide for hand-back, the service map and the retired chase log.
3. Write down the support model, even if the answer is "one person, best effort, no SLA". An unstated answer reads as an assumed one.

---

### 10. Project Management

**Progress**

Session 42 delivered 27 commits with a clean build throughout, and the work matched a written plan (BACKLOG Sections N then M). That is real project discipline for a solo evening project.

**Scope**

`docs/BACKLOG.md` is a genuine single source of truth: sections A to N, 57 open items, 5 blocked, 13 parked. Very few projects this size have that.

The scope risk is measurable now rather than felt. Placeholder form links went from 86 to 131 while the wiring effort in Section A stayed roughly still. New guides arrive faster than existing guides get finished. That is the scope-creep signal, and it is a build-rate problem rather than a laziness problem: every new guide is individually justified.

**Dependencies**

Worth separating cleanly, because they get muddled:

- **Blocked on Mike** (he can clear these alone): Supabase region, Guide Builder re-paste, DTR consent question, red guide sign-off, the amber guide walkthrough, IMHA Derby City source of truth.
- **Blocked on the Trust** (he cannot): DPIA approval, DCB0129 and a named CSO, PII storage approval, the Power Automate licence blocking the publish pipeline.

The second list is the critical path to anything real. The first list is the critical path to the content going green.

**Recommendations**

1. Stop starting new guides until the placeholder-link count starts falling. One session of wiring, no new content.
2. Split the BACKLOG's blocked items into the two lists above, so the Trust-blocked ones can be chased as a single ask.
3. Before Thursday's meeting, decide what genuinely has to be true on the day, and treat everything else as after.

---

### 11. Clinical Content Editor

**Inventory and approval split**

| | Count |
|---|---|
| Guides in `ALL_GUIDES` | 71 |
| Explicitly green | **1** (`s117-meeting`) |
| Explicitly red | 20 |
| Explicitly amber | 7 |
| Amber by default (never touched) | 43 |
| Links | 113 (1 green, 112 amber by default) |
| Quiz questions | 942, no approval status at all |
| Placeholder `#` form links | 131 |
| `[confirm]` markers | 4 |

**The finding this hat exists for**

One guide out of 71 has been signed off. The traffic-light system was built in Session 27 precisely so that editorial sign-off would be visible and tracked, and it works, and it is telling us the content is almost entirely unapproved. The default is amber, which was the honest choice, but it means 43 guides have never been looked at by the approval process at all and are indistinguishable from the 7 that were considered and left amber.

That is not a criticism of the content, which is well sourced and often better than what it replaces. It is a statement that the control is not operating, and that no amount of code quality compensates for it.

**Provenance and currency**

Provenance is generally good. Guides trace to named trust policies, SOPs or public sources, and the FOCUS blocks carry both the SystmOne how-to and the source policy. The policy dump behind the quiz is a snapshot and the app is careful about that: questions from copies near or past their review date show a quiet "check FOCUS for the current version" rather than asserting staleness. That restraint is correct and should be preserved.

**Content risks, worst first**

1. **Invented values presented with the authority of verified ones.** Found and fixed this pass: 12 fake emails and 3 fake phone numbers in referral submission steps, rendered bold, large, and copyable. The fix uses the existing "Hidden in demo mode" convention and suppresses the copy chip on it. The residual risk is that 131 `#` links are the same class of defect in a milder form.
2. **43 guides nobody has reviewed**, visually identical to 7 that were reviewed and parked.
3. **The quiz marks people wrong with no sign-off at all.** 942 questions, no badge, no review state.
4. **Content with an expiry date and no reminder.** The AfC pay scales are hard-coded and need replacing every April. Nothing in the repo will prompt that.
5. **Four `[confirm]` markers** sitting in live content, including whether a Duty to Refer can proceed without consent, which is a consent question rather than a formatting one.

**For Mike or a subject expert**

- Sign off, or reject, the 20 red guides. That single act moves the whole scorecard.
- Decide what amber means for the 43 untouched guides: is it "not looked at" or "looked at and waiting"? If it is both, the badge is not saying anything.
- Confirm the crisis and perinatal direct numbers are on a public page.
- Answer the DTR consent question.
- Decide whether the quiz carries the traffic light.

**Recommendations**

1. Run the amber walkthrough as its own sessions, in category order, and record the date each guide was reviewed rather than only its colour.
2. Add a `lastReviewed` date next to the status. Colour without a date cannot tell you whether the sign-off is current.
3. Wire or visibly mark the 131 placeholder links. A "Blocked in demo" badge exists for dead `#` links; apply it consistently.

---

### 12. Deployment and Operations

**Current picture**

One environment. Push to `main`, Vercel builds, it is live at wardHub.live roughly two minutes later. No staging, no preview gate, no automated check between a commit and production. The site password is the only access control.

For a solo prototype that is a reasonable trade: the feedback loop is fast and the blast radius is a demo. It stops being reasonable the moment a ward is using it during a shift, because at that point a bad push is an outage during clinical work and there is no rollback rehearsal.

**Operational gaps**

- **No monitoring.** No uptime check, no error reporting, no log review. If the site broke tonight, the discovery mechanism is Mike opening it.
- **No quality gate on deploy.** The build passes locally because someone remembers to run it. A GitHub Action running `build`, `test`, `tsc` and `lint` on push would cost an hour to set up and would have caught the typecheck errors months ago.
- **Configuration.** `SITE_PASSWORD` is unset, so the hard-coded fallback is in force. Pay scales are hard-coded with an annual expiry.
- **Off-repo dependencies.** `E:\Hub\temp\internal-contacts.md` holds the real contact values, and the printable handouts live outside the repo deliberately. Both are correct decisions for governance and both mean the project is not self-contained. If that drive goes, the real values go with it.
- **The publish pipeline is parked on a licence, not a bug.** Power Automate is standard-connectors-only and HTTP is premium. Do not re-propose it as an engineering task.

**Continuity**

The bus factor is one. The documentation is genuinely good enough that another developer could pick up the code. What they could not pick up is the clinical judgement behind the content, which is the part that makes the project worth anything.

**Recommendations**

1. Add the CI workflow. Highest value per hour of anything in this report.
2. Move the site password into a Vercel environment variable.
3. Put an uptime check on it. A free ping service and an email is enough.
4. Add an April reminder for the pay scales, in the BACKLOG with a date rather than in someone's head.

---

### 13. Patient and Carer

**What a patient would value**

The patient-voice quote fields in the care plan and safety plan builders are real, not decoration: a distinct field per section, and an explicit "unable to establish" toggle instead of silently leaving the patient's words blank. That toggle is the honest choice, and a patient reading their own care plan back would notice the difference between their words being recorded and their words being paraphrased by a nurse in a hurry.

The rights content is easy for staff to act on, which is the thing that actually reaches the patient: S132 rights, IMHA with the correct provider per area, the S117 two-meetings distinction that decides whether someone gets aftercare planning at all. Getting that right is worth more to a patient than any interface decision in the product.

The refusal to build MUST and Waterlow calculators deserves credit here too. A patient is better served by a nurse thinking than by a number generated from a half-filled form.

**What would concern them**

Generated case-note text still reads institutionally in places. "Referral type: [CARE ACT ASSESSMENT / S117 MEETING REQUEST / ENABLEMENT]. Awaiting triage outcome from duty team." is efficient and it is also what someone reads about themselves when they request their records. There is a version of that sentence that is equally precise and sounds like one person telling another what happened.

The demo staff and patient names (`Staff_BY_D`, `Patient_BY_1`) remain placeholders. That is a presentation problem in the sponsor demo, but there is a dignity angle too: a room full of managers looking at patients rendered as serial numbers sets a tone, even in a demo.

**Recommendations**

1. Read three generated case notes aloud and rewrite whichever sounds least like a person.
2. Replace the placeholder demo names with realistic fictional ones before Thursday.
3. Check the patient-facing leaflets for reading level. Not done this pass.

---

## Devil's Advocate

The strongest honest case against wardHub is that it is a single unfunded nurse's side project that has grown to 50,000 lines and 71 clinical guides without a single clinical sign-off beyond his own, and the Trust is being asked to take on the governance liability for content it has not reviewed. Everything good in this report about code quality is beside the point next to that sentence. A well-built app that tells a nurse the wrong thing is worse than a badly built one nobody uses.

The fake phone numbers are the uncomfortable proof. They sat in twelve referral guides, formatted to look exactly as authoritative as the real numbers, through multiple sessions and two prior evaluations that both scored content risk as "medium, mitigated by sign-off pending". Neither evaluation found them because neither went looking at rendered values. The mitigation everyone has been relying on, "it is all draft until Mike signs it off", did not catch a class of error that a nurse could have acted on. If that got through, the reasonable prior is that other things have too.

The thing being avoided is that the sign-off bottleneck is not a scheduling problem, it is a capacity problem, and it is unsolvable in its current shape. Fifty amber guides, each needing clinical reading against current trust policy, by one person doing it around shifts. At a realistic pace that is a year. Meanwhile the build rate keeps adding to the pile: placeholder links went from 86 to 131 in the same period the wiring effort barely moved. The project is generating unapproved content faster than it can approve it, and no session plan has yet acknowledged that as the central constraint rather than a backlog item.

The demo itself carries a quieter risk. It looks finished. The themes, the tour, the polish and the traffic lights all signal a mature product, and sponsors respond to that signal by asking when it can go live rather than what it needs first. The very quality that wins the meeting is what makes "this is a prototype with no clinical sign-off" hard to hear in the same room. And the demo can break in a way that reads as amateur rather than as designed: one refresh at the wrong moment wipes every claimed job on screen, and there is currently nothing in the interface that explains why.

If this failed twelve months after rollout, the post-mortem would most likely not mention code. It would say a guide was out of date because the trust policy behind it changed and nothing connected the two, and that staff had come to trust the guides precisely because they were good, so nobody double-checked. The second most likely finding is that it ran fine until the one person maintaining it moved job, and eighteen months later people were still using content nobody owned.

---

## Consolidated Recommendations

### Critical (before any live use with real data)
- Trust SSO and server-side authorisation. Every role check today is client-side.
- DPIA completed, DCB0129 clinical safety case, named clinical safety officer.
- Encrypted datastore with defined retention, replacing "nothing is stored".
- Clinical sign-off of the content, or an accepted risk position on the unsigned parts.

### High Priority
- Sign off or reject the 20 red guides, and decide what amber means for the 43 untouched ones.
- Rate-limit and log the password endpoint.
- CI on push: build, test, tsc, lint.
- Audit the remaining 131 placeholder links the way the contacts were audited this pass.
- Re-run axe over everything built since June.
- A visible "nothing is saved here" line in the diary.

### Medium Priority
- Move the DPIA, hazard log and data catalogue out of `dev-panel/page.tsx` into markdown.
- Proxy regression test, and a test around the hand-back reducer.
- `SITE_PASSWORD` into the Vercel environment; replace the dot-path exemption.
- Clear the 36 `react-hooks/static-components` lint errors in one pass.
- Traffic light on the quiz; `lastReviewed` dates alongside approval colour.
- Cut the home page back; distinguish auto-filled text in copy previews.
- Realistic demo names before Thursday.

### Low Priority
- `isV2` to `isLimited` rename.
- Save and resume in the builders.
- Keyboard alternative for diary drag-and-drop.
- Loading skeletons, expanded print stylesheet, diary keyboard navigation.

---

## Fixed during this evaluation

| Fix | Files |
|---|---|
| 15 invented contact values (12 emails, 3 phone numbers) replaced with the "Hidden in demo mode" convention | `src/lib/data/guides/referral-workflows.ts` |
| Copy button suppressed on placeholder contacts, so a placeholder cannot be copied into a case note | `src/app/guides/[id]/page.tsx` |
| GDPR page corrected: tasks are not stored, the password cookie is disclosed, retired chase log reference removed | `src/app/gdpr/page.tsx` |
| Typecheck brought from 26 errors to 0 (jest-dom matcher types, closure-narrowing in a test) | `types/testing-library.d.ts`, `src/__tests__/providers.test.tsx` |
| Next 16.2.9 to 16.2.12, closing a high-severity unauthenticated Server Function endpoint disclosure | `package-lock.json` |

All verified after the fact: build clean, 32/32 tests, `tsc` zero errors.

---

## For Mike

Only the things that need you. Everything else above is either done or something Claude can do.

1. **Sign off or reject the 20 red guides.** Nothing else in this report moves the project as much.
2. **Decide what amber means** for the 43 guides that have never been reviewed, versus the 7 considered and parked. Right now the badge cannot tell them apart.
3. **Confirm the crisis and perinatal direct numbers are publicly findable**: `01332 623900`, `01246 293284`, `01332 623911`, `01246 216523`. If any are not, they need the Rule 4 treatment.
4. **Supply the real referral contacts** for PICU, dietetics, dental, tissue viability, physio, OT, SALT, EDT, ERP, JUCD keyworking and welfare rights, or confirm they should stay hidden. They now read "Hidden in demo mode" instead of a fake number.
5. **Answer the DTR consent question.** Still marked `[confirm]` in live content.
6. **Decide whether the quiz carries the traffic light.** It asserts answers against trust policy with no sign-off state at all.
7. **Supabase region**, still unreadable from the repo, still needed for "where does the data live?".
8. **Before Thursday:** is the site password typed on stage, and do you want realistic demo names instead of `Patient_BY_1`?

---

## Action Items

| Item | Owner | Priority | Target | New or carried |
|---|---|---|---|---|
| Sign off / reject 20 red guides | Mike | Critical | Rolling | Carried, 3rd eval |
| DPIA completion | Trust IG + Mike | Critical | Pre-live | Carried, 3rd eval |
| DCB0129 + named CSO | Trust | Critical | Pre-live | Carried, 3rd eval |
| Rate-limit password endpoint | Claude | High | Next session | New |
| CI workflow (build/test/tsc/lint) | Claude | High | Next session | New |
| Audit 131 placeholder links | Claude | High | 1 session | New (grew from 86) |
| Re-run axe on post-June pages | Claude | High | Next polish | New |
| "Nothing is saved" notice in diary | Claude | High | Next session | New |
| Governance docs out of dev-panel into markdown | Claude | Medium | TBC | New |
| Proxy + hand-back tests | Claude | Medium | Next session | Carried, 3rd eval |
| Amber guide walkthrough with review dates | Mike + Claude | Medium | Rolling | Carried |
| Demo names before the sponsor meeting | Claude | Medium | 30 Jul | Carried |
| April reminder for pay scales | Mike | Low | Apr 2027 | New |

---

## Not verified this pass

Said plainly, because the template requires it.

- **No axe run.** The accessibility hat reports June's audit plus reasoning about what has been added since. The pages built in the last two months have not been machine-tested.
- **No browser click-through of the fixed contacts.** The fix is verified in the data (zero fake values remain), in the build and in the typecheck, but the submission step renders client-side several clicks into a guide and I did not drive it there. Worth thirty seconds of Mike's eyes on the PICU guide.
- **Nothing about the Trust verified.** Policy currency, whether the crisis and perinatal numbers are public, whether the AMHP arrangements still hold. Not knowable from this repo, and flagged rather than assumed throughout.
- **No performance measurement.** No Lighthouse, no bundle analysis. `dev-panel` at 2,934 lines and `overview` at 1,933 are the obvious candidates and neither was measured.
- **Patient-facing leaflet reading levels** not assessed.
- **Only three of the five themes** were reasoned about; no theme was measured for contrast.

---

*Generated 2026-07-28 against `project-evaluation-template.md` v2.0. Supersedes `2026-06-21_project-evaluation.md`.*
