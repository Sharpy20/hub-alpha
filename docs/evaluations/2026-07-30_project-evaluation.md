# Project Evaluation: 2026-07-30

> Run against template **v2.1**. Full 13-hat pass, written overnight before the sponsor
> session on 30 July 2026 at 1:30pm.
> **This report supersedes** `2026-04-14_project-evaluation.md`, `2026-06-21_project-evaluation.md`
> and `2026-07-28_project-evaluation.md`. It carries everything from them that is still
> live, so all three can be deleted. `2026-07-28_placeholder-links-deep-dive.md` is a deep
> dive and should be kept.

---

## Executive Summary

- **The code is now the healthy part of this project and the documentation was the sick part.** Two days ago the finding was that content had overtaken code as the risk. That still holds, but this pass found a third category: the governance pack itself. A full read of `dev-panel/page.tsx` turned up **nine claims that were not true**, including a promise to store MHA legal status in a live build, two statements that real internal phone numbers sit in code comments, and a "nothing the user enters is transmitted" line that was the third surviving copy of a falsehood already corrected twice elsewhere. All nine are fixed. None were malicious; all were the residue of a product that changed faster than its own paperwork.

- **The pilot ask contradicted itself in the two places the sponsor will meet it.** The presentation plan asks for two wards in its ask, its recommendation and its closing sentence, then answers "what do you want from us today?" with "One ward". The dev panel said one ward in five places. Fixed everywhere, and the exec deck (`docs/nhs-ready/09-wardHub-exec-deck.pptx`, 6 Jul) is flagged as wrong on the ask rather than rebuilt, because it is not in the kit and not used on the day.

- **The gates went from decorative to real, and the numbers moved a long way in two days.** Tests 32 to **71**, test files 3 to **7**, lint errors 37 to **0**, and a CI workflow now runs typecheck, lint, test and build on every push. The recommendation for a proxy regression test, open across four evaluations, is finally closed. Set against that: `main` has **no branch protection** and Vercel deploys straight from it, so CI can be red and a deploy still ships. That was previously documented as a benefit.

- **The headline content number was wrong in the last evaluation, and the true one is slightly better.** The 28 July report said 71 guides. Counted from `src/lib/data/guides/catalog.ts` it is **68**: 1 green, 47 amber, 20 red. That matches the presentation plan's own cheat sheet. The substance is unchanged and unflattering: **one guide in sixty-eight has been signed off**, and the badge cannot distinguish the 47 nobody has read from the handful considered and parked.

- **One thing nobody had written down anywhere: a scheduled GitHub Action talks to Supabase every day.** `.github/workflows/supabase-keepalive.yml` runs a daily `SELECT` against a `feedback_posts` table using a service key, purely to stop the free-tier project being paused. "Wired but dormant" was true of the app and not the whole picture. Now disclosed in the Q&A, the DPIA data flows and on `/gdpr`.

- **Only one team job was reaching the demo.** `generateWardTasks` looped `i < 1`, so fridge temps was the only team job in the entire product and the other eleven templates were dead data, including the one route to the observation-engagement guide. Now five, covering all three shifts and all three priorities.

---

## Since the last evaluation

The 28 July pass was two days ago, so this is an unusually short interval with an unusually large delta. Sessions 46, 46b and 46c ran in between and cleared most of the "no input needed" list.

### Closed since 28 July

| 28 July recommendation | Status |
|---|---|
| CI on push: build, test, tsc, lint | **Done.** `.github/workflows/ci.yml`, green |
| Clear the 36 `react-hooks/static-components` lint errors | **Done.** `npx eslint src` exits 0. All 36 were `PayslipDecoder.tsx` declaring components inside its own render, which could wipe text as a user typed |
| Proxy regression test, and a test around the hand-back reducer | **Done, on its fourth appearance.** `proxy.test.ts` (16 tests, both routing modes via a faked `COLLAPSED_FOR_DEMO`), `handback.test.tsx` (11) |
| Re-run axe over everything built since June | **Done.** Hand-back modal, `/overview` and its pop-out, service map, quiz, payslip decoder. Every failure was contrast. Four service-map category colours failed against white text in their own right |
| Audit the remaining placeholder links | **Done** in the deep dive. The badge wording was the real defect, not the links |
| Realistic demo names before Thursday | **Done.** English literature cast throughout |
| A visible "nothing is saved here" line in the diary | **Rejected by Mike, 29 Jul.** By design, not worth cluttering the site for; he says it out loud when demoing. Do not re-propose |
| Move the DPIA, hazard log and data catalogue out of `dev-panel/page.tsx` | **Not done, deliberately.** See the ledger. Needs Mike's call on which copy wins |
| Rate-limit and log the password endpoint | **Deferred by Mike until after 30 Jul.** It touches the only thing between a visitor and the whole site, and a mistake locks the sponsor out mid-demo |

### Still open and getting older

- **Sign off the 20 red guides, and decide what amber means for the 47 unreviewed.** Raised in April, June, 28 July and again here. It is not a Claude task and should stop being written as a recommendation. It is a decision the project is owed.
- **`isV2` naming debt.** Still 62 call sites where `true` means "limited". Untouched across three evaluations. Genuinely low priority while `COLLAPSED_FOR_DEMO` is true, but the count is not falling.
- **WAGOLLs.** Zero of sixteen referral guides has a worked example. Needs no FOCUS URL and no Trust permission, just Mike writing one good version six times. Highest value per hour of anything on his list, and it has never been started.

### Gone backwards

- **`dev-panel/page.tsx` grew from 2,956 to 3,203 lines during this very review.** Correcting the document made the case for moving it out of JSX stronger, not weaker. It is now the largest file in the repository.
- **Nothing else.** Placeholder links are down slightly (131 to 128), advisories are static, and no metric worsened.

---

## Scorecard

June used a 10-hat framework with no numeric scores and April used the NHS Service Standard's own Good/Partial scale, so those columns are blank rather than invented. That is the honest position and it will fill in from here.

| # | Perspective | 14 Apr | 21 Jun | 28 Jul | This pass | RAG | Direction |
|---|-------------|:------:|:------:|:------:|:---------:|:---:|:---------:|
| 1 | Web Developer | - | - | 4 | **5** | Green | ↑ |
| 2 | Clinical User | - | - | 4 | **4** | Green | → |
| 3 | Trust Senior Management | - | - | 3 | **3** | Amber | → |
| 4 | Information Governance | - | - | 4 | **4** | Green | → |
| 5 | IT Security | - | - | 2 | **2** | Amber | → |
| 6 | UX Design | - | - | 4 | **4** | Green | → |
| 7 | Accessibility | - | - | 3 | **4** | Green | ↑ |
| 8 | NHS Digital Standards | - | - | 2 | **2** | Amber | → |
| 9 | Training | - | - | 4 | **4** | Green | → |
| 10 | Project Management | - | - | 3 | **4** | Green | ↑ |
| 11 | Clinical Content Editor | - | - | 2 | **2** | Red | → |
| 12 | Deployment and Operations | - | - | 2 | **3** | Amber | ↑ |
| 13 | Patient and Carer | - | - | 4 | **4** | Green | → |

Do not average these. Hat 11 at Red is the one that matters.

**Why 1 moved to 5:** clean build, zero typecheck errors, zero lint errors, 71 tests, CI gating on every push, seven production dependencies. For a solo project this is better than most funded ones. It is not 5 because `dev-panel/page.tsx`, `tasks/page.tsx` and `overview/page.tsx` are all over 2,200 lines.

**Why 7 moved to 4:** the axe re-run in Session 46b covered everything built since the June audit and every failure was fixed. Held off 5 by the untested non-NHS themes and the missing keyboard alternative for drag-and-drop.

**Why 10 moved to 4:** the BACKLOG is not just maintained, it is now the thing that catches its own gaps. Session 45's note that a verbally agreed job "reached this file nowhere and was therefore lost" is the kind of process finding most projects never write down.

**Why 12 moved to 3:** CI exists now. Still amber because there is no staging step, no monitoring, and no branch protection.

**Why 11 stays at 2 and Red:** one guide of sixty-eight. Nothing else in this report matters as much.

---

## Carried forward

### 1. Recommendation ledger

| Recommendation | First raised | Times raised | Owner | Status | Note |
|---|---|:---:|---|---|---|
| Sign off or reject the 20 red guides | 14 Apr 2026 | 5 | **Mike** | Open | The project's biggest single item. Not actionable by anyone else |
| Decide what amber means: 47 unreviewed vs a handful parked | 28 Jul 2026 | 2 | **Mike** | Open | The badge cannot currently tell them apart, so amber means nothing |
| Write ~6 WAGOLLs | 28 Jul 2026 | 2 | **Mike** | Open | Never started. Needs no FOCUS access. Can be static HTML like `public/abc-wagoll.html` |
| Trust SSO and server-side authorisation | 14 Apr 2026 | 4 | Trust | Open | Blocks live use. Every role check is client-side |
| DPIA completed, DCB0129 case, named clinical safety officer | 14 Apr 2026 | 4 | Trust | Open | Drafts exist in `docs/nhs-ready/`. Needs Trust owners |
| Encrypted datastore with defined retention | 14 Apr 2026 | 4 | Trust | Open | Currently "nothing is stored", which is a demo property, not an architecture |
| Rate-limit and log `/api/auth/verify-password` | 28 Jul 2026 | 2 | Claude | **Deferred by Mike** | Explicitly held until after 30 Jul. Not rejected |
| Move governance docs out of `dev-panel/page.tsx` into markdown | 28 Jul 2026 | 2 | Mike decides, Claude does | Open | Needs his call on whether the JSX or `docs/nhs-ready/` wins. File grew to 3,203 lines this pass |
| Traffic light on `/quiz` | 27 Jul 2026 | 3 | Mike | Open | 942 questions marking staff right or wrong against Trust policy, with no sign-off state |
| `isV2` to `isLimited` rename | 21 Jun 2026 | 4 | Claude | Open | 62 call sites. Low priority while collapsed, but never falls |
| Decompose `tasks/page.tsx` | 21 Jun 2026 | 3 | Claude | Open | 2,600 to 2,278. Stopped growing, still a god-component |
| `SITE_PASSWORD` into Vercel env; replace the `pathname.includes(".")` exemption | 28 Jul 2026 | 2 | Claude | Open | Bundled with the password hardening Mike deferred |
| Save and resume in the guide builders | 21 Jun 2026 | 3 | Claude | Open | A long builder loses everything on interruption, which is a real ward scenario |
| Keyboard alternative for diary drag-and-drop | 22 Jun 2026 | 4 | Claude | Open | WCAG 2.1.1. Known since the June audit |
| Contrast sweep of the four non-NHS themes and dark mode | 22 Jun 2026 | 4 | Claude | Open | Every audit so far has covered NHS light only |
| Focus trap and Escape on the remaining custom overlays | 22 Jun 2026 | 4 | Claude | Open | The base `Modal` is compliant. Roughly 20 inline overlays are not |
| Cut the home page back | 28 Jul 2026 | 2 | Mike | Open | Safeguarding block, bookmark wheel, today widget, disclaimer, quick links |
| Loading skeletons, print stylesheet, diary keyboard nav | 26 Jan 2026 | 5 | Claude | Open | Snags 75, 76, 79. Genuinely low priority, honestly stale |
| Only one team job seeded | 29 Jul 2026 | 1 | Claude | **Done 30 Jul** | Now five, covering three shifts and three priorities |
| Proxy regression test | 14 Apr 2026 | 4 | Claude | **Done, Session 46b** | 16 tests, both routing modes |
| CI on push | 28 Jul 2026 | 1 | Claude | **Done, Session 46b** | `.github/workflows/ci.yml` |
| Clear the 36 lint errors | 28 Jul 2026 | 1 | Claude | **Done, Session 46b** | `PayslipDecoder.tsx` components hoisted |
| Re-run axe on post-June work | 28 Jul 2026 | 1 | Claude | **Done, Session 46b** | All failures were contrast, all fixed |
| Audit the 131 placeholder links | 28 Jul 2026 | 1 | Claude | **Done, deep dive** | Badge wording was the real defect |
| Realistic demo names | 22 Jun 2026 | 2 | Claude | **Done, Session 43** | English literature cast |
| Fill the placeholder guides | 21 Jun 2026 | 1 | Claude | **Done, Session 32** | None remain |
| Migrate `middleware.ts` to `proxy.ts` | 21 Jun 2026 | 1 | Claude | **Done, Session 24** | - |
| WCAG 2.1 AA audit | 14 Apr 2026 | 2 | Claude | **Done, Session 26** | Plus the walkthrough that found the systemic modal gap |
| Purge `docs/` of real contacts | 14 Apr 2026 | 2 | Claude | **Done** | History rewritten 6 Jul; values now outside the repo |
| Print for the builders | 21 Jun 2026 | 1 | Claude | **Done** | Nine routes support print |
| A visible "nothing is saved" line in the diary | 28 Jul 2026 | 1 | Mike | **Dropped 29 Jul** | By design, said out loud instead. Do not re-propose |
| Dev panel and GDPR currency review | 29 Jul 2026 | 1 | Claude | **Done 30 Jul** | Nine false claims fixed. See this report's Hat 4 and Hat 12 |
| Make the pilot ask two wards everywhere | 30 Jul 2026 | 1 | Claude | **Done 30 Jul** | Plan, dev panel, demo script, prompt pack, PDFs, kit zip |

### 2. BACKLOG cross-check

Two-way check against `docs/BACKLOG.md`, as the template requires.

**In this ledger, missing from the BACKLOG:**
- Nothing material. The BACKLOG's NEXT UP block (added 29 Jul) now carries the same priorities in the same order, which is the first time the two documents have agreed.

**In the BACKLOG, never looked at by any evaluation:**
- **Section A, the FOCUS form-link wiring.** Eight "NEW GUIDE needed" items (autism, CAMHS, ECT, perinatal, day services, discharge liaison) have sat unstarted since 4 July. No evaluation has ever assessed whether these guides are actually wanted, or whether the list is aspirational. Worth a decision rather than indefinite carrying.
- **Section B, the postcode / GP-surgery lookup.** The data is described as "fully in hand" since 4 July. Never evaluated, never started.
- **Section D, the contacts directory.** A genuine architectural item, specified in detail, parked without a decision. It is the correct fix for the "one edit propagates everywhere" problem and it needs persistence, so it is really a full-build item. No evaluation has said so.
- **Section E, the bed-management ranking.** Seven ranked items with a decision for Mike at number 7 (estimated discharge date). This is the closest thing the project has to a product roadmap for the sponsor's own interest area, and no evaluation has scored it.

**Marked done in one, open in the other:**
- **BACKLOG Section C claims the pay-guide printables are done** while item (b), confirming Trust absence figures behind the `[confirm]` markers, is still open. Four `[confirm]` markers remain in `src/`. Consistent, but easy to misread as finished.
- **CLAUDE.md is materially stale** and says so nowhere: it still describes the Light/Medium/Max/Max+ version system as live (removed Session 9), 100 patients and 100 staff (it is 5 patients and 20 staff per ward), and a SNAG LIST that stops at #219. The BACKLOG has been the real source of truth for months. **This is a documentation risk, not a code one, but it is the file a new session reads first.**

### 3. Metric history

| Metric | 21 Jun | 28 Jul | This pass | Note |
|---|---|---|---|---|
| Guides in `ALL_GUIDES` | - | 71 | **68** | 28 Jul figure was wrong. Counted from `catalog.ts` |
| Approval split (green / amber / red) | - | 1 / 50 / 20 | **1 / 47 / 20** | Green has not moved since it first appeared |
| Placeholder `#` form links | 86 | 131 | **128** | Two wired in the deep dive, one removed with the SV2 link |
| WAGOLLs live / dead | - | 0 / 16 | **0 / 16** | Not re-counted this pass, carried from the deep dive |
| Quiz questions | - | 942 | **942** | - |
| Test files / tests | 3 / 32 | 3 / 32 | **7 / 71** | Largest single improvement in the project's history |
| Lint errors / warnings | - | 37 / 7 | **0 / 7** | - |
| `tsc --noEmit` errors | - | 0 | **0** | - |
| Lines in `src/` | ~35,000 | 50,470 | **51,482** | - |
| Page routes | 39 | 49 | **51** | - |
| Production dependencies | - | 7 | **7** | - |
| Open advisories (prod / dev) | - | 3 / 32 | **3 / 32** | All 3 prod are vendored inside Next |
| `[confirm]` markers | - | 4 | **4** | - |
| Largest file (lines) | 2,600 | 2,240 | **3,203** | `dev-panel/page.tsx` overtook `tasks/page.tsx` this pass |
| `isV2` call sites | - | 62 | **62** | - |
| Task persistence | localStorage | None | **None** | React state only |

### 4. Standing decisions and parked items

| Decision | Date | Who | Why it stays settled |
|---|---|---|---|
| No special category data in the patient record. MHA status, alerts, diagnoses, room and bed removed | 28 Jul 2026 | Mike | Clinical safety as much as IG: every clinical field invites "who keeps it current" and "what if someone acts on it when stale". wardHub is not the clinical record. Guarded by `src/__tests__/no-special-category-data.test.ts`. **Returns only if the Trust asks for far more than is being offered** |
| wardHub does not claim to work on a phone | 29 Jul 2026 | Mike | It renders but is close to unusable, and personal phones are banned on the ward, so the claim only invites a demo that looks bad. **Do not add a mobile criterion to any review** |
| No in-app "nothing is saved here" notice | 29 Jul 2026 | Mike | By design. He demos it live and says it out loud. The fact stays documented on `/gdpr` |
| "Staff nurse", not "Ward NIC", in all pitch material | 29 Jul 2026 | Mike | NIC is a rotating role that confuses a mixed room, and "from the floor, not a title" is the stronger framing. Commented in `dev-panel/page.tsx` so reviews stop flagging it |
| The pilot ask is two wards on the full build (option C) | 30 Jul 2026 | Mike | One ward cannot separate the tool from the week. Every measure worth having needs the whole funnel to exist |
| Never run `npm audit fix --force` | 13 Jun 2026 | Claude | Downgrades Next to 9.x |
| Publish pipeline parked | 27 Jul 2026 | - | Power Automate is standard-connectors-only, HTTP is premium. **The blocker is a licence, not code.** Do not re-propose as engineering work |
| Advocacy means IMHA only. Derby City is Disability Direct, County is Cloverleaf | 27 Jun 2026 | Mike | POhWER removed |
| No referral tracking, no shift-based handover screen | 27 Jul 2026 | Mike | Some services track their own referrals, others go silent. Tracking both makes work for the first and still misses the second |
| Do not chase the quiz's overdue-review flags | 27 Jul 2026 | Mike | The offline policy dump is a snapshot. "Overdue" reflects our copy, not necessarily the live document |
| Do not re-render the explainer video from `wardhub-video/src/` | 29 Jul 2026 | Claude | That tree has no chapter rail and no IG board; the rendered reel has both. Re-rendering would quietly produce a worse film |
| Splitting the reel for `/gdpr` was tried and reverted | 29 Jul 2026 | Mike | Loses the chapter rail and the closing board, which is most of what makes it land |
| Forensic content excluded from the demo | 27 Jun 2026 | Mike | Standing flag. MAPPA and forensic-adjacent material is not surfaced |
| Trust-approved forms use exact wording, never paraphrase | Jun 2026 | Mike | Add around them, do not alter them |

---

## Verification Log

| Check | Result |
|---|---|
| `npm run build` | Clean. 51 page routes generated |
| `npx jest` | **71 passed, 7 suites, 0 failed** (was 32 / 3) |
| `npx tsc --noEmit` | **0 errors** |
| `npx eslint src` | **0 errors**, 7 warnings (unused vars in older files) |
| `npm audit` | 3 high in production, all vendored inside Next (postcss x2, sharp x1). `sharp` exposure is nil, there is no `next/image` in the codebase. 32 further advisories are dev tooling only |
| Routes | 51 page routes, **1 API route** (`/api/auth/verify-password`) |
| Size | 51,482 lines of TypeScript and TSX |
| Dependencies | 7 production, 13 dev |
| Git author, last 12 commits | **Sharpy20 on all 12.** Clean |
| `COLLAPSED_FOR_DEMO` | `true`. Full product at the root, limited-build logic dormant but intact |
| Guides | **68** in `catalog.ts`. Approval: 1 green, 47 amber (default), 20 red |
| Quiz | 942 questions, 43 topics |
| Placeholder `#` links in the data layer | 128 |
| `[confirm]` markers in `src/` | 4 |
| Task persistence | None. `tasks-provider.tsx` is `useState` and writes nothing |
| Branch protection on `main` | **None.** `gh api .../branches/main/protection` returns 404 |
| CI | `.github/workflows/ci.yml` runs tsc, lint, test, build on push and PR |
| Scheduled jobs | `.github/workflows/supabase-keepalive.yml`, daily `SELECT` against Supabase with a service key |
| Live site | `wardhub.live` serving the 4m00s explainer reel (13,662,204 bytes), verified by HTTP HEAD |

---

## Evaluation Details

### 1. Web Developer

**Strengths.** This is the best the codebase has been. `tsc` returns zero, `eslint src` returns zero errors, 71 tests pass across 7 suites, and CI runs all four gates on every push. Seven production dependencies for a 51,000-line app is genuinely disciplined. The data layer in `src/lib/data/**` is well separated from logic, which is why content edits stay cheap. `toLocalDateStr()` in `src/lib/utils/date.ts` fixed a real class of UTC-midnight bug and is now used consistently.

The two newest pieces of engineering are the best. `completedDates` on a recurring job (`src/lib/utils/task-completion.ts`) is the right model: a recurring job is one record rendered on many days, so completion cannot live in `status`, and the fix came with eight tests. The `parent` / `near` split on `service-map.ts` is a genuine modelling fix rather than a patch, and it resolved seven unreachable-service bugs at once.

**Technical debt.** Three files are over 2,200 lines: `dev-panel/page.tsx` (3,203, and it grew during this review), `tasks/page.tsx` (2,278) and `overview/page.tsx` (2,228). `tasks/page.tsx` has at least stopped growing. `dev-panel/page.tsx` is now the largest file in the repository and is documentation rather than product, which is exactly why it should not be JSX.

`isV2` still means "is this the limited build" and is still true at the root: 62 call sites, four evaluations, no movement. It is heavily commented and currently dormant, so the practical risk is low, but it is the kind of debt that costs an hour of confusion the day someone flips `COLLAPSED_FOR_DEMO` back.

`package.json` pins `next: ^16.1.6` while the installed version is 16.2.12. The caret makes that harmless, but the declared floor is now three patch releases behind a security fix and would be worth raising.

**Recommendations.** (1) Move the governance sections of the dev panel into markdown the page renders. It is now the biggest file and the least code-like. (2) Split `overview/page.tsx`, which has quietly reached the same size `tasks/page.tsx` was criticised for. (3) Bump the `next` floor in `package.json` to 16.2.12.

### 2. Clinical User (Nurse)

**What works.** Hand-back remains the best thing in the product, and it is better than it was two days ago because the diary now has enough in it to show off. Three dropdowns, no free text, a waiting-on state with a chase date and an age, and a case note generated **whether or not the job is finished**. That last property is the one a nurse will actually value: an unfinished job that has been chased is still a documented action, and every paper system loses that.

Two fixes from Session 46c matter more on a real shift than they sound. A recurring job now completes **one day at a time**, so ticking today's fridge check no longer strikes through the whole week (eight completions from one tap, previously). And the expanded day view is a proper modal with Escape and a focus trap, rather than a full-screen overlay that pushed no history and left the browser Back button landing somewhere unrelated.

The team column is now populated: five jobs across early, late and night, with one urgent, two important and two routine, so priority grouping is visible rather than theoretical.

**Pain points.** The ceiling is unchanged and it is a hard one: **nothing survives a refresh.** A nurse who claims six jobs, hands two back and completes three has produced exactly nothing if the tab reloads. Mike has decided against an in-app warning and that decision stands, but this is the single feature gap between a good demo and a usable tool, and the hazard log correctly scores it as a go-live blocker (HAZ-022).

Second: the long builders (risk formulation, care plan, seclusion support plan) have no save and resume. A risk formulation is a twenty-minute job on a ward where twenty uninterrupted minutes do not exist. This has been recommended three times.

Third, and new this pass: **the "mark it done" button that closes the loop from a guide back to the diary only exists in the `/guides/[id]` viewer.** Four guides now linked to diary jobs are static routes that override it, so they can be reached from a job but cannot close it.

**Recommendations.** (1) Save and resume in the builders, keyed per browser. It is localStorage-shaped and does not need the backend. (2) Lift the linked-job panel into a shared component the static guide routes can use.

### 3. Trust Senior Management

**Strategic value.** The pitch is now coherent in a way it was not two days ago, because the dev panel argues the same case as the presentation plan. The thesis is good and it is honest: every previous tool for this problem could only watch the work, so someone had to go and collect the information, which is why band 6s lose days to audit. Putting the tool where the work happens makes the oversight a by-product. "Same assurance, fewer audits" is a line an exec can repeat, and it commits the project to nothing it has not already demonstrated.

The growth evidence is the strongest card and it is underused. The app went live in January; six months of staff asking for what they needed produced 68 guides, a 942-question quiz built from the Trust's own policy library, and a live discharge-barrier view. Nobody was assigned to write any of it. That is a genuine signal of demand.

**Risk register.**

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Single maintainer. One nurse, own time, no cover | High | High | Documentation is unusually good and mitigates knowledge loss. **Nothing mitigates capacity loss.** State this plainly rather than letting the Board discover it |
| Content wrong or out of date, copied into a record | Medium | High | Traffic light exists on every guide. At 1 green of 68, the control is present but not operating |
| Demo mistaken for an approved tool | Low | High | Site password, development banner on guides, fictional cast, no real patient data |
| Staff adopt it, then it is withdrawn on governance grounds | Medium | Medium | Do not widen access before the DPIA and DCB0129 land |
| Pilot approved, then stalls on hosting | Medium | Medium | New this pass. The ask is option C, which needs a datastore and authentication before a single real patient name is entered. Approval without a hosting owner produces a stalled project, not a pilot |
| Dependencies outside the repo vanish (`E:\Hub\temp`, printable guides, `wardhub-video`) | Medium | Medium | Bring anything load-bearing into a backed-up location |

**What is being asked, and what is not.** Worth separating because demos conflate them. Being asked for now: two wards, a named IG contact, a clinical sign-off route split by specialty, a hosting conversation. No money. Not being asked for now, but implied by option C: a DPIA, a Trust datastore, Trust authentication, and a DCB0129 safety case. If the Board says yes to the first list without owning the second, the pilot cannot legally start.

### 4. Information Governance

**Compliance status.** Strong for a pre-approval demo, and stronger than the paperwork claimed until tonight. Nothing about a patient persists anywhere: `tasks-provider.tsx` is `useState`, so a refresh wipes every claim, hand-back and completion. No special category data exists in the patient record, guarded by a test that has been shown to bite. Real internal contacts live outside the repository entirely and render as "Hidden in demo mode".

**Data flow, corrected.** Three separate things, and the pack was previously collapsing them into one wrong sentence. The diary is stored nowhere. Preferences are device-only localStorage under `wardhub_*` keys. And exactly one thing is transmitted: the shared password, POSTed to `/api/auth/verify-password`, which returns a `site_access` cookie (httpOnly, 7 days) holding nothing but the fact the password was right.

**The nine corrections.** All in `dev-panel/page.tsx` unless noted.

1. Q&A promised a live build would store patient **legal status**. Contradicts the 28 July removal.
2. The roadmap offered "add diagnosis and legal status" as a live data option. Same. Now marked CLOSED with the reasoning inline.
3. The data catalogue said trust-sensitive values are **stored in code comments** and a single `requiresFocus` flip reveals them. Stripped out 27 July.
4. The IG role evaluation repeated the same claim as a benefit.
5. The DPIA said "nothing the user enters is transmitted". Third surviving copy of a falsehood already fixed on `/gdpr` and `/about`.
6. `/gdpr` itself said localStorage data is "never sent to a server" two bullets above correctly disclosing the cookie. Narrowed.
7. The business case risk table said "pilot has zero PII". The pilot being asked for holds real patient data.
8. The DPIA claimed Article 9(2)(h) for special category health data it no longer holds. Now states none is held, with the honest caveat that a task title is free text and being on a mental health ward is itself health data.
9. The DPIA data-flow section did not mention the daily Supabase keep-alive.

**New finding: the Supabase keep-alive.** `.github/workflows/supabase-keepalive.yml` runs a daily `SELECT id LIMIT 1` against `feedback_posts` using a service key held in GitHub secrets, to stop the free-tier project being paused. It reads nothing and writes nothing, and the app itself never queries Supabase (`src/lib/supabase/client.ts` is deliberately excluded from the barrel export so its URL and keys never reach the browser bundle). But "no data is sent to it" was being said without this qualification, and an IG officer who found it independently would reasonably question everything else on the page. Now disclosed in three places.

**Still open.** The **Supabase region** cannot be read from the repository and remains unconfirmed as UK. It has been an open chase since 27 July and is a one-minute dashboard lookup. It is also the answer to the most predictable question a governance reader will ask.

**Recommendations.** (1) Read the Supabase region and record it. (2) Decide whether named nurse, consultant and admission date should follow MHA status out of the record; the "who keeps this current" argument reaches them too. (3) Task titles are the residual special-category route and the control is wording, not schema. That belongs in the training material, not the code.

### 5. IT Security

**Strengths.** The Content-Security-Policy is real and restrictive (`connect-src 'self'`, `font-src 'self'`, `frame-ancestors 'none'`), fonts are self-hosted, and there are no external scripts. The password check is server-side, not a client-side string comparison, and the cookie is httpOnly. Seven production dependencies is a small attack surface. Git author is Sharpy20 on every recent commit, so project isolation holds.

**Vulnerabilities.** Stated once rather than repeated per finding: **every authorisation check in this app is client-side.** Roles are chosen from a demo picker and held in React context. That is correct for a demo with no real data and completely inadequate for anything else, and it is the reason Trust SSO sits at the top of the Critical list.

The password endpoint still has no rate limiting, no lockout, no delay and no logging, so a brute-force attempt against one shared password would be invisible. Mike has deliberately deferred this until after the demo, and that is a defensible call: the fix touches the only thing between a visitor and the whole site, and breaking it locks the sponsor out mid-presentation. It should be the first thing done on 31 July.

The gate exemption in `src/proxy.ts` still uses `pathname.includes(".")` to let static assets through, which is broader than it needs to be. Bundled with the same hardening.

**New this pass.** `main` has **no branch protection** (confirmed via the GitHub API) and Vercel deploys straight from it. CI can fail and the deploy still ships. The dev panel previously listed "branch protection on main" as a CI/CD feature, which was false; it now appears as a concern. A **service key** for Supabase lives in GitHub Actions secrets for the keep-alive job. That is the correct place for it, but it is a production credential in a repository whose CI has no protected branch.

**Remediation priorities.** Critical: Trust SSO and server-side authorisation before any real data. High: rate-limit and log the password endpoint (31 July); enable branch protection on `main` so CI actually gates. Medium: replace the dot-path exemption; move `SITE_PASSWORD` fully into environment configuration. Low: rotate the Supabase service key once the keep-alive is no longer needed.

### 6. UX Design

**Strengths.** It reads as one product, which is not a given for something assembled over six months. The Session 45 and 46 menu work settled a real question: Tools holds things you do, Help holds what wardHub is plus the demo controls. That rule is now written down, which is why About and Data Sources stopped being buried where a governance reader would never look.

The `/overview` tile split is the best UX decision of the last week. The tile went from about 700px to 360px by moving the whole working surface into a pop-out, so a wide screen now shows four patients instead of one and a half. And "Complete" as a status label became "Mark complete" with a hollow circle, which fixed a genuine misread: an outstanding job looked done.

**Issues.** The home page is still doing too much: hero, disclaimer, quick-links wheel, "I need to" cards, safeguarding banner with its own decision helper and bookmark strip, and the today widget. Every element earns its place individually. Together they are not a front door. This has been raised twice.

The five style themes plus dark mode remain the untested surface. Every accessibility pass has covered NHS light. A component can look right there and wrong in the other five, and nobody has checked.

**Recommendation.** Cut the home page to the hero, the today widget and one row of entry points, and let the safeguarding block live on its own page reached from a prominent card. This is Mike's call, not a technical one.

### 7. Accessibility

**Compliance summary.** Better than the last pass, and the improvement is real rather than a scoring adjustment. Session 46b re-ran axe over everything built since the June audit: the hand-back modal, `/overview` and its pop-out, the rebuilt service map, the quiz and the payslip decoder. Every failure was contrast and every one was fixed. Notably, four service-map category colours failed against white text in their own right, and the rule is now written above `CLUSTERS` so the next person adding a category does not reintroduce it.

The June foundations hold: skip link, landmarks, global `:focus-visible`, `prefers-reduced-motion`, `lang`, and an accessible base `Modal` with focus trap and Escape. The expanded day view moving onto that shared `Modal` in Session 46c was an accessibility win as much as a UX one.

**Barriers remaining.** Three, all carried and all known. The four non-NHS themes and dark mode have never been contrast-audited. Roughly twenty inline overlay modals have `role="dialog"` and `aria-modal` but not the focus trap and Escape the base `Modal` provides. Diary drag-and-drop has no keyboard alternative, which is a straight 2.1.1 failure and has been open since June.

**Not verified this pass.** No new axe run was done tonight; this hat rests on the Session 46b results, which were 24 hours old and covered the relevant surfaces. The pages I changed are text-only edits to existing structures.

**Recommendation.** The theme contrast sweep is the one to do next, because it is mechanical, it has been carried four times, and it affects every page rather than one component.

### 8. NHS Digital Standards

**Clinical safety.** Still the weakest hat and the score does not move. There is no DCB0129 assessment and no named Clinical Safety Officer, and the app now generates clinical text that a nurse pastes into a patient record. The hazard log in `docs/nhs-ready/03b-clinical-safety-hazard-log.md` is genuinely good work: 23 hazards, scored, with controls and a review history, and two formally identified go-live blockers.

**But the dev panel was showing four invented hazards on a different numbering scheme,** with no scores and no blockers, under the heading "Hazard Log (Starter)". A Clinical Safety Officer reading the panel would have concluded the analysis had barely begun. Fixed tonight: the panel now summarises the real log, names it as authoritative, and states the go-live blockers.

**One stale hazard found.** HAZ-020 in the markdown log is "chase log cleared at logout" and is recorded as a go-live blocker. The chase log was **retired entirely** in Session 42, so the hazard has no subject. A hazard log carrying a blocker for a feature that no longer exists undermines confidence in the rest of it, and closing it out is a five-minute job.

**The boundary is well drawn and worth defending.** wardHub deliberately offers guidance rather than scoring: the MUST and Waterlow calculators were removed on purpose, the physical-health tools carry an amber "run the validated tool on SystmOne" notice, and Flow 1 now says explicitly that a human pastes the case note because wardHub never writes to the clinical record. That restraint is the strongest clinical-safety argument the project has.

**The largest live hazard is content.** One guide of 68 signed off. The traffic light means the risk is visible, not that it is controlled.

### 9. Training

**Assessment.** Better resourced than most funded projects. The interactive tour, intro guide and FAQ all exist and were updated in Session 45 and 46 when the menus changed, so they describe the app as it is rather than as it was. Session 46 also made the tour prompt behave as Mike had always believed it did: the header button now genuinely disappears once someone has started the tour, rather than pulsing at them forever.

`/quiz` is a serious asset: 942 questions across 43 topics, 574 of them from 117 Trust documents, with a per-question "report a problem" route that lands on the feedback board carrying the question and its source.

**Gaps.** The quiz carries **no sign-off badge** while every guide does, which is the wrong way round: it is the thing marking staff right or wrong against Trust policy. Raised three times. And `docs/quiz-question-bank.md` has never been proofread.

**Support model.** Unaddressed and worth stating: nobody answers a question about this tool on a Sunday night. For a two-ward pilot that is survivable because Mike is on one of them. It is not a rollout model.

### 10. Project Management

**Progress.** Sessions 44, 45, 46, 46b and 46c in three days, all pushed, all with gates green. The 46b session in particular cleared a whole "no input needed" list while Mike was out, and documented the one item it deliberately did not do, with reasons. That is the behaviour you want.

**Scope.** Controlled, and better controlled than in June. The BACKLOG is now the real source of truth and it audits itself: the Session 45 note that a verbally agreed job "reached this file nowhere and was therefore lost" is a process finding most projects never make, and the NEXT UP block added on 29 July fixed the prioritisation problem the previous evaluations complained about.

**The documentation risk is CLAUDE.md.** It is the file a new session reads first, and it is materially out of date: it describes the removed version system as live, states 100 patients and 100 staff when it is 5 and 20 per ward, and its snag list stops at #219. The BACKLOG has silently taken over. A new contributor following CLAUDE.md would build the wrong thing. This is the highest-value documentation fix available and nobody has flagged it before.

**Dependencies, separated.** Blocked on **Mike**: 20 red guides, what amber means, 6 WAGOLLs, quiz badge, the Supabase region, the DTR consent question, the Guide Builder re-paste, and which copy of the governance docs wins. Blocked on the **Trust**: DPIA owner, named CSO, hosting decision, IG contact, the 44 FOCUS addresses. These are different waits and the second list cannot start until the sponsor session lands.

**Deadline.** Sponsor session today at 1:30pm. Everything that had to be true is true: the site is behind its password, the 4m00s reel is live on `/about`, the paper kit is refreshed with the two-ward ask, and the diary has enough in it to demonstrate.

### 11. Clinical Content Editor

**Inventory.**

| | Count |
|---|---|
| Guides in `catalog.ts` | **68** |
| Explicitly green | **1** (`s117-meeting`) |
| Explicitly red | 20 |
| Amber on the default (never reviewed) | 47 |
| Quiz questions | 942, across 43 topics |
| Placeholder `#` form links | 128 |
| WAGOLLs | 0 of 16 referral guides |
| `[confirm]` markers | 4 |

**This is the project's real backlog and it has not moved.** One guide in sixty-eight. The green count has not increased since it first appeared. Twenty red guides are complete drafts waiting for a yes or a no, and forty-seven amber guides are amber because nobody has ever looked at them, which is not what a reader assumes amber means. The badge cannot distinguish "reviewed and parked" from "never opened", and until it can, amber conveys nothing.

**Provenance is strong, which makes the sign-off gap more frustrating.** Guides are traceable: `docs/evaluations/`, the FOCUS policy links wired into 11 guides, the conflict audit surfaced in the dev panel rather than silently resolved, and 61% of the quiz mined from named Trust documents. The project can show its working. It just cannot show approval.

**Content risks, worst first.**

1. **Forty-seven guides nobody has read.** A nurse follows one, copies its case note into a record, and the only thing standing behind it is that it was written from the right policy by someone who is not a subject expert in that area.
2. **Zero WAGOLLs.** Step 3 of the standard workflow template is empty in all sixteen referral guides. A worked example is the single most useful thing on a referral guide and it needs no Trust permission at all.
3. **128 placeholder form links.** Now honestly labelled "Link to confirm" rather than "Blocked in demo", which was the real defect. Still 128 places where the form is named and not reachable.
4. **The quiz has no sign-off state.** 942 questions telling staff they are wrong.
5. **Four `[confirm]` markers live in published content,** including the DTR consent question Mike asked to be chased on.
6. **`s117-meeting`, the only green guide, has five dead links.** Worth deciding whether green should require working links, because at the moment green does not mean complete.

**Recommendation.** The sign-off-by-specialty model is the right answer and it is now properly written up in the dev panel Q&A. The thing to ask for today is not "please review 68 guides" but "please name one owner per specialty". Six named owners would unblock more than any amount of engineering.

### 12. Deployment and Operations

**Current picture.** One environment. Push to `main`, Vercel builds, `wardhub.live` serves it, behind one shared password. CI now runs four gates on every push, which is new and good, but it **does not gate the deploy** and `main` has no branch protection, so a red build still ships. There is no staging step and no monitoring: if the site broke at 2am nobody would know until someone opened it.

**Hard-coded values with an expiry.** Carried and still true. AfC pay scales in `PayBandPicker.tsx` are pinned to 1 April 2026 and need updating every April. The site password is a constant in the verify-password route with an environment override. Dated content across the guides has no automated freshness check, which is what BACKLOG Section E's guide-freshness idea is for.

**Things outside the repo that the project depends on.** `E:\Hub\temp\internal-contacts.md` holds every real internal contact keyed by entry id, and it is the only copy. `E:\Hub\printable-guides\` holds four printable handouts deliberately kept out of the repository. `E:\Hub\wardhub-video\` holds the explainer reel, and its `src/` does not match the rendered film. `E:\Hub\Policy dump not for git hub\` holds the 483 documents the quiz was mined from. **None of this is backed up anywhere described.** If that drive fails, the internal contacts are unrecoverable and the reel cannot be re-rendered.

**Continuity.** Bus factor one. The documentation is unusually thorough and would let a competent developer pick the code up. It would not replace the clinical judgement that decided what to build, and it would not replace the relationships that got the sponsor meeting.

**Recommendations.** (1) Branch protection on `main` requiring CI to pass, so the gate actually gates. (2) Back up `E:\Hub\temp\internal-contacts.md` somewhere that is not one drive; it is the highest-consequence single file in the project and it exists once. (3) Basic uptime monitoring, which is free and takes ten minutes.

### 13. Patient and Carer

**What a patient would value.** The patient voice is designed in rather than bolted on. The care plan builder has a quote field per section and an explicit "unable to establish" button, which is more honest than leaving a blank that reads as if nobody asked. The safety plan follows Stanley-Brown properly. The S117 content states both halves of the two-meetings rule, so a patient is less likely to be told the wrong thing about their own entitlement.

The strongest patient-facing decision is one they would never see: the patient record holds nothing clinical. No MHA status, no alerts, no diagnoses. A patient reading a list of what this system knows about them would find their name, their ward, who is looking after them, and the jobs outstanding. That is a defensible answer to "what does this app say about me".

Twenty-nine patient leaflets and the IMHA guides being correct on provider by area both mean a patient is more likely to get accurate information about their rights.

**What would concern them.** Task titles are free text, so a member of staff can type anything into a field attached to a named patient. Nothing prevents "won't engage, likely PD" appearing as a job title. The control is wording and training, and it is not written down anywhere yet. That is the one place where the no-clinical-data position has a hole in practice rather than in schema.

Generated case notes still read like forms in places. Better than they were, since Session 41 made question answers reach the note and Session 42 removed the free-text fields, but a patient reading their own record back would find some of it stilted.

**Recommendation.** Write the task-title guidance before the pilot, not after. One sentence in the add-job modal would do more than any schema change.

---

## Devil's Advocate

**The strongest honest case against adopting this:** it is one nurse's unpaid side project holding sixty-eight pieces of clinical guidance, one of which has been approved. The Trust would be taking on a system whose content nobody has validated, whose author has no contractual obligation to maintain it, and which stores nothing today so has never been tested with real data under real load. Every impressive thing about it, the breadth, the polish, the documentation, makes the dependency worse rather than better, because it raises what would be lost if he stopped. A cautious director would say: this is excellent, it should exist, and it should be built by people whose job it is.

**Which of our own claims would not survive a hostile question?** "No training needed" is asserted repeatedly and has never been tested on anyone who did not have Mike standing next to them. The cold demo to an unknown ward is still marked "planned" on the roadmap, four months after it was written down. Until that happens, "intuitive" is a designer's opinion about their own work. Similarly, "same assurance, fewer audits" is a good line and an untested hypothesis: nobody has measured a band 6's audit hours before and after, because there is no before and after yet.

**What are we all quietly avoiding?** That the sign-off problem may not be solvable at the pace the project is growing. Content is being produced faster than anyone can approve it, and the sign-off-by-specialty model, which is the right answer, requires six or more busy departments to take on work they did not ask for, for a tool they have not adopted. If each of them takes three months, the guide count will have grown again by the time the first shelf is signed. There is a real possibility that the honest end state is a smaller wardHub with forty approved guides rather than a larger one with sixty-eight unapproved ones, and nobody has said that out loud.

**If this failed twelve months after rollout, what would the post-mortem say?** Most likely: it was adopted on two wards, staff liked it, and then it quietly stopped being maintained because the one person who understood it went back to full-time clinical work and no successor was funded. The content drifted out of date without anyone noticing, because the freshness-checking idea stayed in Section E of the BACKLOG. Six months later a staff member followed a guide that referenced a superseded policy. The Datix would name the guide, not the model, and the conclusion would be that ward-built tools need an owner with time, which is exactly what nobody was willing to fund at the start.

The second most likely post-mortem is shorter: the pilot was approved, the hosting conversation never concluded, and nothing happened at all.

---

## Consolidated Recommendations

### Critical (before any live use with real data)
- Trust SSO and server-side authorisation. Every role check today is client-side.
- DPIA completed, DCB0129 clinical safety case, named Clinical Safety Officer.
- Encrypted datastore with defined retention. "Nothing is stored" is a demo property, not an architecture.
- Clinical sign-off of the content, or a written accepted-risk position on the unsigned parts.

### High Priority
- **Sign off or reject the 20 red guides; decide what amber means for the 47 unreviewed.** Fifth appearance. Mike only.
- **Rate-limit and log `/api/auth/verify-password`,** on 31 July, as agreed.
- **Branch protection on `main` requiring CI to pass.** The gates exist but do not gate.
- **Back up `E:\Hub\temp\internal-contacts.md`.** One copy, one drive, unrecoverable.
- **Update CLAUDE.md.** It describes a removed version system and the wrong demo data counts, and it is the first file a new session reads.
- **Write six WAGOLLs.** Needs no Trust permission and has never been started.
- **Close out HAZ-020** in the hazard log; its subject was retired in Session 42.

### Medium Priority
- Move the governance sections out of `dev-panel/page.tsx` into markdown. Needs Mike's call on which copy wins.
- Traffic light on `/quiz`, and `lastReviewed` alongside approval colour on guides.
- Save and resume in the guide builders.
- Contrast sweep of the four non-NHS themes and dark mode. Fourth appearance.
- Lift the linked-job "mark done" panel into a shared component the four static guide routes can use.
- Split `overview/page.tsx`, now as large as the god-component it was built to avoid.
- Task-title wording guidance in the add-job modal, before the pilot.
- Bump the `next` floor in `package.json` from ^16.1.6 to ^16.2.12.
- Basic uptime monitoring.

### Low Priority
- `isV2` to `isLimited` rename. 62 sites, fourth appearance, still dormant.
- Keyboard alternative for diary drag-and-drop.
- Focus trap and Escape on the remaining inline overlays.
- Cut the home page back.
- Loading skeletons, expanded print stylesheet, diary keyboard navigation.
- Rotate the Supabase service key when the keep-alive is no longer needed.

---

## Fixed during this evaluation session

| Fix | Files |
|---|---|
| Pilot ask made two wards everywhere: plan, dev panel (5 places), demo script, prompt pack | `PRESENTATION-PLAN-30JUL.md`, `dev-panel/page.tsx`, `docs/nhs-ready/10b-demo-script.md`, `docs/nhs-ready/PROMPT-PACK.md` |
| Four presentation PDFs regenerated and the kit zip rebuilt, every entry hash-verified against source | `Read before.pdf`, `Handout.pdf`, `Prompts.pdf`, `Post presentation pack.pdf`, `wardHub-presentation-kit-30JUL.zip` |
| Five team jobs seeded instead of one, covering three shifts, three priorities and both guide-linked templates | `src/lib/data/tasks/index.ts` |
| Nine false claims in the governance pack corrected (see Hat 4) | `src/app/dev-panel/page.tsx`, `src/app/gdpr/page.tsx` |
| Light/Medium/Max/Max+ version framing removed from the technical spec, data catalogue, DPIA, schemas, webhooks, user flows, Q&A and role evaluations | `src/app/dev-panel/page.tsx` |
| Jobs schema brought in line with the app: hand-back, `blocks_discharge`, `in_error`, `completed_dates`, `task_history`, and a priority default the app actually uses | `src/app/dev-panel/page.tsx` |
| Both C4 diagrams replaced. They were misaligned by the wardHub rename and listed three API routes and two workers that do not exist | `src/app/dev-panel/page.tsx` |
| Flow 2 rewritten to include hand-back, waiting-on, per-day recurring completion, append-only history and mark-in-error | `src/app/dev-panel/page.tsx` |
| Hazard log card replaced with the real 23-hazard summary and the go-live blockers | `src/app/dev-panel/page.tsx` |
| Quiz added to the Data Sources record with both its limitations stated | `src/app/dev-panel/page.tsx` |
| Guide count corrected from 71 to 68 and the approval split recounted from source | this report, `dev-panel/page.tsx` |
| Daily Supabase keep-alive disclosed | `dev-panel/page.tsx`, `src/app/gdpr/page.tsx` |
| Review stamps bumped from February and 2 July to 30 July; roadmap emoji removed per house style | `src/app/dev-panel/page.tsx` |

All verified after the fact: build clean, `tsc` 0, `eslint src` 0 errors, 71 tests, both pages rendering with no console errors.

---

## For Mike

Only the things nobody else can do.

1. **Name one content owner per specialty.** Not "review 68 guides". Six names would unblock more than any engineering on this list.
2. **Sign off or reject the 20 red guides.** Fifth time of asking.
3. **Decide what amber means.** Forty-seven guides nobody has read currently look identical to a handful considered and parked.
4. **Read the Supabase region** off the dashboard. One minute, and it is the most predictable governance question you will be asked.
5. **Answer the DTR consent question:** can a Duty to Refer go in without consent, in best interests? It is live content with a `[confirm]` marker.
6. **Decide which copy of the governance docs wins,** the dev panel JSX or `docs/nhs-ready/`. Until you do, they keep drifting and this report keeps saying so.
7. **Should the quiz carry a traffic light?** 942 questions marking staff against Trust policy with no sign-off state.
8. **Should named nurse, consultant and admission date follow MHA status out of the patient record?** The "who keeps this current" argument reaches them too.
9. **Write six WAGOLLs** when you have an hour. Highest value per hour on your whole list.
10. **Re-paste the Guide Builder instructions** into the live M365 agent. Two minutes at work, still open since 27 July.

---

## Action Items

| Item | Owner | Priority | Target | New or carried |
|---|---|---|---|---|
| Rate-limit and log the password endpoint | Claude | High | 31 Jul | Carried, deferred |
| Branch protection on `main` | Mike / Claude | High | 31 Jul | **New** |
| Back up `internal-contacts.md` off the single drive | Mike | High | This week | **New** |
| Update CLAUDE.md to match reality | Claude | High | Next session | **New** |
| Name content owners per specialty | Mike | High | Post-demo | Carried |
| Close out HAZ-020 in the hazard log | Claude | High | Next session | **New** |
| Governance docs out of the dev panel | Mike decides | Medium | Post-demo | Carried |
| Traffic light on the quiz | Mike | Medium | Post-demo | Carried x3 |
| Theme and dark-mode contrast sweep | Claude | Medium | Post-demo | Carried x4 |
| Save and resume in the builders | Claude | Medium | Post-demo | Carried x3 |
| Shared linked-job panel for static guide routes | Claude | Medium | Post-demo | Carried |
| Split `overview/page.tsx` | Claude | Medium | Post-demo | **New** |
| Task-title wording guidance | Claude | Medium | Before pilot | **New** |
| Bump `next` floor in package.json | Claude | Medium | Next session | **New** |
| `isV2` to `isLimited` | Claude | Low | When uncollapsed | Carried x4 |

---

## Not verified this pass

Stated plainly rather than softened.

- **No new axe run.** Hat 7 rests on the Session 46b results, 24 hours old, which covered the relevant surfaces. My own changes were text edits to existing structures.
- **WAGOLL count not re-counted.** Carried as 0 of 16 from the 28 July deep dive.
- **The four non-NHS themes and dark mode were not opened.** Same gap the last four evaluations reported.
- **No screenshot verification.** The browser pane was not displayed, so verification was text-based via `read_page` and `get_page_text`. Sufficient for content and structure, not for visual regression.
- **Nothing about the Trust was verified and nothing could be.** Policy currency, whether a phone number is live, whether a service still exists: none of that is checkable from this repository. Anything in the content that depends on it is flagged for Mike, not asserted here.
- **The 47 amber guides were not read.** Reading them is the work this report says needs a subject expert, and doing it badly and quickly would be worse than leaving it.
- **`docs/quiz-question-bank.md` not proofread.** Still Mike's.
- **The exec deck (`09-wardHub-exec-deck.pptx`) was inspected for the ward count but not otherwise reviewed.** It is stale on guide counts too and is flagged as do-not-use rather than fixed.

---

*Run against template v2.1. Supersedes `2026-04-14_project-evaluation.md`, `2026-06-21_project-evaluation.md` and `2026-07-28_project-evaluation.md`, all of which can now be deleted. Keep `2026-07-28_placeholder-links-deep-dive.md`.*
