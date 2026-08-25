# wardHub - Master Backlog

> Single source of truth for outstanding work, so nothing is lost between sessions.
> Started 4 Jul 2026. Work happens in focused sessions that read this file first.
> Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[BLOCKED]` needs Mike · `[PARK]` deferred

> **⭐ THE LIVE LIST IS SECTION R (2 Aug).** Section P is the 30 Jul evaluation's open items and
> is still valid, but R sits above it: it carries the medical device question, the Tier A/B guide
> split, the trust-account handover and Mike's 2 Aug job list. Read R first.
>
> **⭐ SECTION V (6 Aug) is the hosting/trial/handover direction - the sandbox plan.** Read it
> before any work on hosting, persistence, guide data formats or the SSO application. It
> supersedes R4's "same stack on trust accounts" assumption: the destination is the Trust's
> ASP.NET / Azure standard, reached by Mike porting the app inside Cris's pipeline.
>
> **SECTION Y (22 Aug) is theory only and BLOCKED on its own first item.** Community
> signposting directory. Do not start design or tagging until Y1 is answered: does Derbyshire
> already commission a social prescribing directory we should read rather than rebuild?

Related task docs (roll findings into here over time):
- **⭐ `docs/evaluations/2026-07-30_project-evaluation.md`** - 13-hat review, 30 Jul, run against
  template v2.1. **This is THE evaluation record.** It carries the recommendation ledger, the
  metric history and the standing decisions, so the April, June and 28 Jul reports can be deleted
  (Mike's call, git holds them either way). Open items are **Section P** below.
- `docs/evaluations/2026-07-28_project-evaluation.md` - superseded by the above. Kept only until
  Mike deletes it.
- `docs/evaluations/2026-07-28_placeholder-links-deep-dive.md` - the `#` link audit. **KEEP** -
  deep dives are not superseded by full evaluations.
- `docs/homework-remaining-03-Jul-2026.md` - guide reviews, blocked-on-Mike items, big builds
- `docs/homework-todo-03-Jul-2026.md` - the worked-through homework detail
- `E:\Hub\temp\focus-referral-links-04Jul2026.md` - real FOCUS URLs behind the friendly link text
- `E:\Hub\temp\focus-referral-criteria-notes-04Jul2026.md` - FOCUS internal referral criteria

**⛔ Standing rule (28 Jul):** the patient record holds name, ward, status, admission date/time,
named nurse, consultant, ward professional and discharge fields. **Nothing clinical.** MHA status,
alerts, diagnoses, room and bed were removed and a test fails if they return. See CLAUDE.md
Session 43 for the reasoning, which is Mike's and should be quoted rather than re-argued.

---

## ✅ DONE 6 Aug 2026 - Session 55: the "Claude can do alone" list (Mike away)

Four commits pushed as Sharpy20 (3e80b2c, e73a141, 9ad907b, 06a6f18), gates green at every
step (tsc 0, eslint 0, 71 tests). Mike was not available; anything needing his input was
skipped and is flagged below.

### R5 glitch: "Print all" patient leaflets - fixed what was reproducible
- **What reproduced:** print dialogs default to "Background graphics off", which stripped
  the coloured header behind every leaflet's white title - titles printed as faint grey on
  white, so leaflets were unidentifiable in the printed stack (breathing step numbers and
  grounding circles vanished the same way). Fixed with `print-color-adjust: exact` on
  those elements in `public/patient-guides.html` - the same technique `printDoc.ts` already
  uses for checklist tick boxes. Verified by printing to PDF via CDP with
  printBackground:false, before and after: all 29 leaflets, 104 A4 pages, headers legible.
- **What did NOT reproduce:** whole leaflets missing. Chromium prints all 29 from both the
  "Print all guides" link and the tick sheet's "Print N selected" (verified headless AND
  the app wiring in-browser - select-all passes all 29 ids). The live file is
  byte-identical to the repo copy. ⚠ **If Mike still sees whole leaflets missing:** ask
  for his exact route and browser. Prime suspect is Edge's "clutter-free printing" toggle,
  which reader-modes the page and can drop most of a multi-article document - not fixable
  from our side, just turn it off in the print dialog.

### Follow-up (Mike, same evening): the BLANK tick sheet printed empty
The mechanism the morning fix missed: the tick sheet rows are `<button>`s, and the global
print CSS (`globals.css`) hides every button not marked `.print-include` - so "Print blank
tick sheet" printed the card header and zero rows. Rows now carry `.print-include`; their
`print:` classes (compact spacing, ticks always hidden so the sheet prints blank) were
already in place waiting. "Print blank tick sheet" also moved to the top control row
beside Select all / Clear all, per Mike - no more scrolling past 29 rows to reach it.
Verified via CDP print of the open tick sheet: 29 rows, empty boxes, two A4 pages.

### R5 glitch: expanded day view task click - fixed and verified
- Session 46c regression, mechanism confirmed: the shared `Modal` and `TaskDetailModal`
  both sit at z-50, so DOM order decides who paints on top. In `/tasks` the detail modal
  rendered BEFORE the expanded-day pop-out, so clicking a task opened the detail modal
  invisibly BEHIND it. `TaskDetailModal` now renders last (the ordering `/overview`
  already used for the identical pairing). Verified in the browser: expanded a day,
  clicked a task, the detail dialog is the topmost element. Comment left in the JSX so
  the next reshuffle does not undo it.

### T4 and T6: found ALREADY DONE, not re-done
Both were built 3 Aug in commit 747fe59 ("Close the checklist dead end, surface the care
review audit on /overview") - after the Section T list was drafted. Verified live this
session rather than trusted: the checklist arrives with `?patient=<id>` and both exits
("Back to patient list", top and bottom) return to `/patients?care=<id>`; the Care Review
Audit tile renders on `/overview` scoped to the filtered patient set. Section T's table is
right that they were "Claude alone" jobs - they were just already finished.

### Section P housekeeping
- **Branch protection on `main` is ON** (GitHub API): the CI `checks` run is a required
  status check, force pushes and branch deletion blocked. ⚠ `enforce_admins` is OFF,
  deliberately: with it on, every direct push to main is rejected until CI passes on that
  exact SHA, which bricks the solo push-to-main workflow this project runs on. So today it
  protects against non-admin pushes and gates any PR, but an owner push still deploys red.
  **Decision for Mike:** flip `enforce_admins` on and move to a PR-or-wait flow, or accept
  the current halfway house.
- **HAZ-020 was already closed** - Session 50 (31 Jul) closed it in the current hazard log
  (`docs/clinical-safety/DCB0129-Hazard-Log.md`, HL-003 v0.3, "verified absent from the
  codebase") and the superseded 03b file's banner says so. The P item predates that. No
  edit made: 03b is kept for traceability, so rewriting its historical body would be wrong.
- **`package.json` next floor bumped** `^16.1.6` -> `^16.2.12` to match installed.
- **Job title guidance sentence added** to the add-task modal, under the Title field:
  "Keep titles factual - what needs doing, not clinical details or opinions about a
  patient." ⚠ This consciously reverses Session 48's "do not re-propose it" note - Mike's
  6 Aug job list asked for it explicitly, citing P's "the control is wording and training,
  not schema". No new fields; the PII scope (name, job title, ward, date) is untouched.

### CLAUDE.md rewritten (P item)
231 lines, was ~1,600. Version system, 100-patient claims, snag lists and session notes
gone; project isolation, gates, NHS styling, workflow template, placeholder conventions,
demo-data shape and the recurring gotchas kept and corrected; BACKLOG.md named as the
source of truth. The stale-warning table at the top went with the staleness.

### Skipped, and why
- **`overview/page.tsx` split (P):** everything above was done and verified, but an
  extraction-only split of a 2,228-line file deserves a fresh session with a full context
  budget, and the instruction was not to rush it. Untouched.
- **Uptime monitoring (P):** needs an account, so per instruction nothing was signed up
  for. Options to pick from, all with a free tier that covers one site: UptimeRobot
  (5-min checks, simplest), Better Stack (30-s checks, nicer alerts), or a GitHub Actions
  scheduled curl (no new account at all, but alerts are just email from a failed run).
  One decision + ten minutes whenever Mike picks.
- [x] **The stray guides state-of-play docx is out of the repo** (20 Aug, Mike's call).
  Moved to `E:\Hub\All guides state of play 31-07-26.docx`. It had been committed once
  (a9b120c) and untracked again (a4b7f1a) but left sitting in the working tree, so this
  finishes the job off. Note it still exists in git history from that first commit.

### ⚠ Do not chase: no CI runs on today's pushes
None of this session's pushes triggered a CI run - because **GitHub had a critical Actions
incident live at the time** (started 15:22 UTC, 6 Aug), not because anything here broke.
Verified: push events registered, workflow active, and a manual `gh workflow run ci.yml`
dispatch ran and PASSED on HEAD (3ef4121), so the required `checks` status is green. If
push-triggered runs are still absent next session after the incident resolves, then it
becomes worth investigating.

---

## ✅ DONE 2 Aug 2026 - Session 49: commit pathway jobs to the diary, roadmap rebuilt

Three commits, pushed as Sharpy20, verified on the live site. Gates green throughout
(tsc 0, eslint 0, 71 tests).

### Commit a guide step's jobs to the diary (new pattern, reusable)
- New optional `commitTasks` on `GuideStep` (`src/lib/data/guides/howto-guides.ts`). Any step
  that sets out a dated task list gets a **"Commit these jobs to the diary"** button top right,
  opening `src/components/modals/CommitTasksModal.tsx`.
- The sheet: confirms the patient (uses the guide's linked patient, or pick one there),
  asks **ward or me**, then a tick sheet of every job. Tick all or some.
- **Dates count from the patient's admission date**, the way a pathway counts, with a switch to
  today and a per-row date. Jobs the source gives no timescale for start unticked and show the
  source's own wording instead of a day number.
- Jobs already in that patient's diary from that guide read "Already in the diary" and cannot be
  added twice (matched on title + patientId + linkedGuideId).
- **First user: OT pathway step 2**, carrying the 14 jobs the Radbourne OT document lists.
  Nothing invented - every title and day is from the document.
- **Next candidates:** admission checklist, leave/discharge/transfer. Ask Mike before adding.

### Roadmap rebuilt (dev panel)
- Extracted from `dev-panel/page.tsx` (3,385 lines, 425 of them roadmap) into
  `src/components/dev-panel/Roadmap.tsx`.
- Five-stage track with a filled progress line and a "we are here" pin. Decision gates now read
  **Agreed** + date, **Open**, or **Closed** with the reason not to re-propose.
- **Phase 1 is done** (its purpose was proving it works and finding a sponsor; 30 Jul did that).
  **Phase 2 = approval, data and authoring = where we are.** New Phase 5 for after the pilot.
  The cold-ward demo moved from Phase 1 into the pilot - the agreed second ward IS that test.
- New **"How a guide is made"** panel at the top: drafted from Trust policy, never live on the
  draft, green only when a named person in the owning specialty signs it, and the live counts.
- **⚠️ Deliberate wording, do not "fix" it back.** Mike asked for the page to say guides are made
  with SharePoint agents. It does not say that, because it is not true of the existing guides and
  this panel is read by IG and clinical safety - Sessions 43 and 47 both had to remove false
  claims from it. What it says instead is that the **authoring route is moving inside the tenant
  onto Copilot agents**, and that the sign-off gate is the same whoever wrote the draft. Claude is
  not mentioned. If the M365 Claude item lands, the original sentence becomes true and can go in.
- New in Exploring: **the Claude model inside Microsoft 365** (worded as stronger context
  reasoning during draft building, NOT as relocating the work) and a **Trust-owned or self-hosted
  repository**.
- **Guide counts are now derived** from `ALL_GUIDES` + `GUIDE_APPROVAL` at module load, in all
  five places they appear. They were hardcoded at 68/1/47/20 and already wrong. Now 69 guides:
  1 signed off, 47 awaiting review, 21 in development.

### Found, not fixed
- The dev panel's own header row overflows slightly at 375px. Predates this session.
- Mike counts 70 guides, the catalogue counts 69. Likely the roster guide, which is commented out
  of `catalog.ts` (Session 36) so it renders nowhere. Worth confirming which number is right.

---

## ✅ DONE 30 Jul 2026 - Session 48: free text out of jobs, bed-management barriers in

Morning of the sponsor demo. Gates green throughout (tsc 0, eslint 0, 71 tests). **Nothing in
the presentation pack was touched** - `src/` only, confirmed against `git status`. Mike's
standing instruction: **tell him before anything in the pack changes, it has been printed
three times.**

### ⛔ Free text removed from the job path (Mike, 30 Jul)

Mike could not find these and thought they had been dropped long ago. They had not - they were
behind the **Edit** button on any job, which is why view mode looked clean. Driven in the
browser to confirm before changing anything. Three fields, all live, all saved:

- **Description** - a `<textarea>` in `TaskDetailModal`, placeholder "Add a description...",
  saved to `description`. An open notes box against a named patient. **Now read-only** - the
  seeded text still displays, it cannot be written to. `description` removed from `handleSave`.
- **Patient** - a free-text `input` ("Enter patient name...") in the same modal, so you could
  invent, misspell, or park a note in it. **Now a `<select>`** of the ward's active patients,
  the same list Add Task has always used. The job's current patient is folded in even if they
  have since left the ward, so opening Edit can never silently blank it.
- **Appointment "Add more details"** - a `<textarea>` inviting "notes, attendees, location
  details, etc" that wrote into the appointment's description (snag 4c, January). **Removed.**
  Duration still carries through, because that is a structured value.

**The only free text left on a job is the Title**, which has to be typed. The control there is
wording and training, not schema - Mike's position, and unchanged.

**Worth knowing why the confusion happened:** "structured only, no free text" was true of the
**hand-back sheet** and of the **retired chase log** (both Session 42). It was never true of
job creation. The two landed in the same session, which is what merged them in memory.

**⛔ STANDING DECISION - the PII scope is FIXED (Mike, 30 Jul).** Patient **name**, **job
title**, **ward**, **date**. That is the ask, do not widen it and do not keep re-opening it.
Ward professional, consultant and named nurse are generic role assignments across patient
groups - linked to a patient but not identifying of one - and they stay. This supersedes the
30 Jul evaluation's suggestion of a guidance line in the add-job modal; **do not re-propose it**.

**⛔ STANDING DECISION - guide sign-off is DEMO-ONLY for now (Mike, 30 Jul).** Part of the ask
in the sponsor presentation is who owns content sign-off; until that is answered he cannot
sign guides off, and the traffic lights stay as they are. **Stop listing "sign off the 20 red
guides" as blocked-on-Mike** - it is blocked on the sponsor's answer, not on him.

### Section E bed-management barriers - items 1-6 BUILT

Item 7 (estimated discharge date) deliberately **left out** - it is genuinely new input and
breaks the no-double-entry promise. Kept as a talking point for the meeting instead.

- [x] **1. Barrier categories.** New `src/lib/data/barrier-categories.ts` - 8 categories worded
      close to national delayed-discharge reason language, each carrying an `owner` of `ward` or
      `external`. `barrierCategory?` added to `BaseTask`. Picker (`BarrierCategoryPicker`) shows
      only once a job is flagged, is **optional**, and is chips not a `<select>` so it is one tap
      - making it mandatory would put a dropdown between a nurse and flagging something urgent.
      Wired into Add Task and the detail modal. Uncategorised barriers still count everywhere.
      **Two of the demo barrier types are deliberately ward-owned** (`mdtDecision`, `tto`),
      swapped in place of three existing entries so ward totals are unchanged - without them
      every barrier would be external and the split would read 25 of 25, which says nothing.
- [x] **2. Days blocked.** Derived in `src/lib/utils/barriers.ts` from the **oldest** open
      barrier's `createdAt` (not the newest, which would reset the clock every time somebody
      flagged something else). Shows on both patient card variants and as a **sortable column**,
      amber past 7 days, red past 14. Zero extra input from anyone.
- [x] **3. Ours vs theirs.** New `BarrierBand` on `/overview`: *"22 of 25 barriers waiting on
      someone outside the ward"*, said as a sentence rather than two numbers in boxes. Reads the
      **filtered** set, so it always describes what is on screen. Verified live at 22 external /
      3 ours / 88%.
- [x] **4. Drill-down - REINTERPRETED, read this before "fixing" it.** The original item said
      "/overview ward rows -> /reports pre-filtered". Both halves are gone: `/reports` is a
      redirect stub since Session 41, and the trust-wide ward roll-up was **deliberately dropped
      27 Jul** for burying the useful bit. So the drill-down is now the **category chips**, which
      are filters - tap "Housing 4" and the list narrows to those patients (verified: 4 patients,
      9 barriers). Turning one on implies barriers-only. **Do not resurrect the ward league table.**
- [x] **5. Bed-meeting print sheet.** `src/lib/utils/bedMeetingSheet.ts` - one page, worst-first
      by days blocked, category tag and age per barrier, IG footer. Deliberately NOT "print the
      /overview screen": filters, counters and stamps mean nothing on paper. `printHtml`, `esc`
      and `IG_FOOTER` exported from `printDoc.ts` so there is still ONE iframe implementation.
      Sits beside the existing Print button, which is unchanged.
- [x] **6. Trend sparkline.** 14 days, in the band. **Demo data and labelled as such on screen**
      ("Demo shape, from when each was raised"). There is no persistence in wardHub, so a real
      trend cannot exist - instead it replays when today's open barriers were raised, which is
      real data read backwards rather than an invented curve. No randomness, so it is stable
      across renders and identical for everyone in the room.
- [x] **`+ Add a job` on the `/overview` patient pop-out** (Mike, 30 Jul). Ward round throws up
      new jobs as you work down the list; the alternative was closing the pop-out, going to the
      diary and finding your place again. Opens the same `AddTaskModal` the diary uses,
      pre-filled with that patient.

**Verified in the browser end to end**, not just built: free-text fields gone and the patient
picker populated, band and chips at both single-ward and all-wards scope, the housing
drill-down, days-blocked badges, the print sheet's rendered output, and the pre-filled Add Task.
⚠ **Gotcha for next time:** stubbing `Window.prototype.print` in the parent does NOT reach the
print iframe - it is a different realm, and a native print dialog will hang the whole browser
pane. Grab the iframe straight after the click and stub `iframe.contentWindow.print` instead.

---

## ✅ DONE 29 Jul 2026 - no more "works on your phone", anywhere

**Standing decision (Mike, 29 Jul):** wardHub does not claim to work on a phone. It *renders*
on one but is close to unusable, it is not a feature we need, and personal phones are not
permitted on the ward - so the claim only invites a demo that looks bad. **Do not reintroduce
it, and do not add a mobile check to any review.** Screens that matter: ward desktops and
Trust laptops.

- [x] **30 Jul handout** (`E:\Hub\presentation-scripts\handout_pdf.py`) - page 2 deleted, live
      URL + password panel added, "works on your phone" and the tour line both dropped.
- [x] **`src/app/intro-guide/page.tsx`** - "Works on desktop, tablet, and mobile" ->
      "Built for ward desktops and Trust devices". Was the strongest claim in the product.
- [x] **`src/app/faq/page.tsx`** - the whole "Can I use this on my phone?" entry REMOVED
      (with its now-unused `Smartphone` import). Its answer was already honest ("not a
      priority, personal phones are not permitted on the ward"), so restoring it is a
      reasonable call if the question keeps coming up - it just no longer raises the topic
      unprompted.
- [x] **`takeaway_pdf.py`** - "works on any device, phone included" -> "best on a desktop or
      laptop browser".
- [x] **`PRESENTATION-PLAN-30JUL.md`** - lift line -> "have a play at your desk later";
      "see it fail" now invites them onto their own PC; **the scripted answer to "does it work
      on mobile" is rewritten** as a tablet/small-screen answer that explicitly says do NOT
      offer a small-screen demo (the old script said "Yes - mobile-first with Tailwind. Try it
      on your phone now", which was the one wrong claim that would have been said out loud);
      "phone in pocket" setup item deleted and the list renumbered.
- [x] **`PRESENTATION-CUECARD-30JUL.md`** + **`cuecard_pdf.py`** - "One-pager, phones, tour"
      -> "One-pager, live link, tour"; "Phone in pocket" checkbox gone.
- [x] **`detailed_pdf.py`** - "Phones: wardhub.live + tour" -> follow along on their PCs;
      "Phone in pocket, site open" setup line gone.
- [x] **`docs/nhs-ready/10b-demo-script.md`** - phone-in-pocket prep line deleted; the closing
      "on any device - try it on your phone in the lift" rewritten.
- [x] **`docs/evaluations/project-evaluation-template.md`** - the UX hat's "Mobile Experience"
      criterion replaced with ward-screen sizes plus an explicit "small screens are not a goal,
      do not score against them", so a future evaluation stops re-raising it.
- [x] All five PDFs regenerated and **`wardHub-presentation-kit-30JUL.zip` refreshed** (it had
      been serving the old two-page handout and every pre-fix PDF). Verified by extracting the
      zip and re-reading each file, including `10a-one-pager.docx`. tsc + eslint clean.

**Left alone deliberately:** `howto-guides.ts` ~436 ("Loop - the app for viewing your roster
on your phone") is about the Trust roster app, not wardHub. Service and dev-panel phone
*numbers* are contacts, not device claims. `03b-clinical-safety-hazard-log.md` "publicly
reachable from any device" is a true risk statement.

---

## ✅ DONE 29 Jul 2026 - Session 46c: per-day completion + the day view pops out

Two of Mike's, both pushed, gates green (tsc 0, eslint 0 errors, 71 tests).

- [x] **A recurring job completes one day at a time.** It is ONE record rendered on every day it
      falls due, and completion was written to `status` - so ticking today's fridge check marked
      the whole week done, eight struck-through copies from one tap. Completion now lives in
      **`completedDates`** (one entry per day) with `status` left alone, and everything asks
      `isCompleteOn(task, date)` (`src/lib/utils/task-completion.ts`) so one-off jobs are
      untouched. `toggleComplete` takes an optional date; the diary passes the column's own
      date, every other caller means today and gets it by default. Hide-completed filters ask
      per day. My Jobs asks "done today" for its Done column, or a recurring job would sit in To
      do forever. History records the day - "completed" alone is meaningless on a job that
      recurs. **8 new tests** (`recurring-completion.test.tsx`).
      ⚠ One existing hand-back test was picking whichever task came first, which happened to be
      the recurring one, so it now asks for a patient job explicitly.
- [x] **The expanded day view is a pop-out.** It was a full-screen `fixed` overlay that looked
      like a page but pushed no history, so Back skipped it and landed wherever you were before
      the diary; the only exit was a minimise icon buried in the filter row. Now the same shared
      `Modal` as the `/overview` patient pop-out - backdrop, titled header, close button, Escape,
      focus trap. Minimise icon gone. Add Task moved from a floating corner button (which
      hovered over the backdrop) to the foot of the content.
      **Found while verifying:** `handleToggleComplete` was dropping its date argument, so
      ticking a recurring job inside the pop-out recorded it against today rather than the day
      on screen - the same bug one layer up. Fixed and confirmed against the history line.

---

## ✅ DONE 29 Jul 2026 - Session 46b: the "no input needed" list, worked through

Mike went for dinner and asked for the whole list. Everything below is pushed, with tsc, eslint
and the tests green at each step. **Item 8 (governance docs out of the dev panel) was NOT done -
see the bottom of this block for why.**

- [x] **Retire Drop.** Six call sites gone (five card variants, one modal). The card's Hand back
      opens the detail modal straight into the sheet via a new `openHandBack` prop.
- [x] **Mark in error moved behind Edit** in the modal, and the red bin dropped from the
      repeating-task row (its pencil opens the same modal). Killed the bespoke confirm dialog and
      its handlers. **Kept in the row for COMPLETED jobs only** - they have no Edit button, so it
      was that or lose the route entirely.
- [x] **CI workflow** (`.github/workflows/ci.yml`) - tsc, lint, test, build on every push to main
      and every PR. Does not gate deployment; Vercel is independent. First run green.
- [x] **Lint clean: 37 errors to 0.** All 36 static-components errors were PayslipDecoder
      declaring four components inside its own render; hoisted to module scope, state passed by
      context so no call site changed. `npx eslint src` now exits 0, which is what let CI gate on
      it.
- [x] **Tests: 36 to 63.** `proxy.test.ts` (16) covers the password gate and BOTH routing modes by
      re-importing with `COLLAPSED_FOR_DEMO` faked. `handback.test.tsx` (11) covers the hand-back
      rules. Checked they bite by breaking the status rule and watching it go red.
- [x] **axe re-run** over the hand-back modal, /overview + pop-out, service map, quiz and the
      payslip decoder. Every failure was contrast; all fixed. **Four service-map category colours
      failed against white text in their own right** and were darkened - the rule is now written
      above `CLUSTERS`.
- [x] **Talking Therapies** repointed from Trent PTS (a former IAPT provider) to
      derby-talk.co.uk, providers named. **Living Well** gained livingwellderbyshire.org.uk.
      Both URLs fetched and checked first. **SV2 form link removed** from the ERP guide.
- [x] **Quiz: report a problem** per question - five fixed reasons, no free text, lands on the
      feedback board carrying the question, its source and its id.
- [x] **Diary jobs linked to their guides** - 8 added, including the discharge barriers, which
      had none.

**⛔ NOT DONE - item 8, governance docs out of `dev-panel/page.tsx`.** Three reasons, all
deliberate. Mike's own instruction is that **dev-panel work runs LAST**, after the other
session's changes land (see the QUEUED block below). It is a 2,900-line restructure the night
before the sponsor demo, on a page he may well show. And it carries a decision only he can make:
`docs/nhs-ready/` already holds partial markdown copies that have drifted from the JSX, so
something has to win. Left for after Thursday.

**FIXED 29 Jul - the fridge-temps mark-done button never showed.** Root cause: the panel was
inside `{!isReferral && isComplete && ...}` in `guides/[id]/page.tsx`, so it needed you to click
through to the LAST step first. A ward diary job is not like that - you read the fridge, not
eight steps - so the ward panel moved to the top of the guide and is visible on load. The
patient panel stays at the end, where "did you actually finish it" is the real question. Both
now share a module-scope `LinkedJobPanel`. Verified end to end with client-side navigation
(a full page load resets task state, which is what made this hard to see).

**Two things spotted while fixing it:**
- [ ] **Only ONE ward task is ever generated.** `generateWardTasks` runs `for (let i = 0; i < 1;
      i++)`, so only `WARD_TASK_TEMPLATES[0]` (fridge temps) reaches the demo. Every other ward
      template - controlled drugs, water temps, resus, ligature, walkaround, the lot - is dead
      data. The **Night observation round -> observation-engagement** link added the same day
      can therefore never produce a task. Decide whether the demo should seed more ward jobs.
- [x] **DONE 29 Jul - a completed recurring task read as complete on every day column.** See
      the Session 46c block at the top of this file.

**New follow-up found while doing item 12:**
- [ ] **The "mark it done" button only exists in the `/guides/[id]` viewer.** Four guides now
      linked to diary jobs are static routes that override it -
      `observation-engagement`, `care-plan`, `leave-discharge-transfer`, `mha-checker` - so they
      get the job-to-guide link but cannot close the loop back. Either lift the linked-job block
      into a shared component the static routes can drop in, or accept the split and say so.
      Note also that the button renders at the END of a guide: `fridge-temps`, the case that has
      worked since it was built, does not surface it on a fresh page load either, so the
      condition is worth re-reading while in there.

---

## ⏰ NEXT UP (overnight 29/30 Jul) - read this first

Session 47 ran overnight before the demo. The dev-panel/GDPR review is **DONE**, the pilot ask
is two wards everywhere, the demo seeds five team jobs, and a fresh 13-hat evaluation is
written. What is left, in the order it matters:

1. **JOB 1 FOR THE NEXT SESSION: read `docs/evaluations/2026-07-30_project-evaluation.md`.**
   It is the evaluation record and it carries the ledger, metrics and standing decisions from
   every prior report. Its open items are **Section P** below. Do not start work without
   reading it - three of its findings are new and none of them were in this BACKLOG before.
2. **Sponsor demo Thu 30 Jul, 1:30pm.** Everything that had to be true is true: site behind the
   password, the 4m00s reel live on `/about`, paper kit refreshed with the two-ward ask, diary
   populated. Nothing below needs doing before it.
3. **31 Jul, first thing:** the deferred **password-endpoint hardening** (Section O) plus
   **branch protection on `main`** (new, Section P). CI runs four gates but does not gate the
   deploy, so a red build still ships today.
4. **[BLOCKED on Mike] Sign off the 20 red guides**, and decide what amber means for the 47
   never-reviewed ones. Fifth time of asking. Still the single biggest thing in the project.
   The evaluation reframes the ask: do not ask him to review 68 guides, ask for **one content
   owner per specialty**.
5. **Then:** item 8 (governance docs out of `dev-panel/page.tsx`, now **3,203 lines** and the
   largest file in the repo - the review grew it. Needs Mike's call on which copy wins vs
   `docs/nhs-ready/`).
6. **Smaller, no input needed:** the four static guide routes that cannot show the mark-done
   panel (Session 46b block); `/about` review stamp; **CLAUDE.md is materially stale** (P).

---

## ⏰ QUEUED (Mike, 29 Jul) - task actions

- [x] **Retire Drop - hand back becomes the only way to let a job go** (Mike, 29 Jul).
      Session 42 deliberately split them: Drop for "claimed this by mistake", silent, no state
      recorded; Hand back for the structured version that leaves a case note. **Mike is
      reversing that split** - one route out, always recorded. The argument for the original
      split (a mis-claim should not have to explain itself) is what changed, so do not re-argue
      it from the old comments, which say the opposite and will need rewriting.
      **Where Drop lives:** `src/app/tasks/page.tsx` lines **250, 349, 398, 482, 519** (one per
      style theme - all call `onClaim(task.id)`, which toggles the claim off) and
      `src/components/modals/TaskDetailModal.tsx` **~533-545**, whose comment explains the split
      being undone. `my-tasks/page.tsx:223` says "Drop jobs here", but that is drag-and-drop
      wording, not this feature - leave it.
      **Open question for Mike:** a genuine mis-claim (wrong patient, fat finger) now has to go
      through the hand-back sheet. Does hand-back gain a "claimed by mistake" reason that skips
      the case note, or does every release generate one?

- [x] **Move "Mark in error" inside Edit** (Mike, 29 Jul - restated 29 Jul, still not done).
      Currently a top-level control in two places: a red trash icon beside the Edit pencil on
      the repeating-task row (`src/app/tasks/page.tsx` **~1074**), and a button in the action
      row next to Take Over and Complete (`src/components/modals/TaskDetailModal.tsx` **~572**,
      two-tap confirm). An audit-affecting action sits as close to hand as completing a job.
      `/overview` needs no separate work - it has no control of its own, it opens
      TaskDetailModal, so fixing the modal fixes it. Keep the two-tap confirm and the Reports
      restore path exactly as they are.

---

## ✅ DONE 30 Jul 2026 - Session 47: two wards, seeded jobs, dev-panel review, evaluation

Ran overnight before the demo, unattended after Mike went to bed. Four commits, all pushed as
Sharpy20, gates green at every step (tsc 0, eslint 0 errors, 71 tests).

- [x] **The explainer reel deployed.** Another session left a re-rendered `merged.mp4` in the
      working tree, uncommitted. Verified it byte-for-byte against
      `wardhub-video/out/merged.mp4`, checked the mp4 atom structure was complete rather than
      trusting the copy, pushed, then polled the live site until it flipped. **4m00s /
      13,662,204 bytes** now serving from `wardhub.live/video/wardhub-full-reel.mp4`, replacing
      the 3m42s / 10.1MB cut.
- [x] **The pilot ask is TWO WARDS everywhere** (Mike, 30 Jul). It contradicted itself in the
      two places the sponsor meets it: the plan asked two wards in its ask, recommendation and
      close but answered *"what do you want from us today?"* with **"One ward"**, and the dev
      panel said one ward in five places. Fixed in `PRESENTATION-PLAN-30JUL.md` (417, 428),
      `dev-panel/page.tsx` (business case, implementation phase, roadmap, Q&A, RBAC),
      `10b-demo-script.md`, `PROMPT-PACK.md`. The roadmap's *"which ward pilots first?"* is now
      *"which two wards?"* with Mike's ward plus one other as the recommended pairing, and a
      second decision on who runs the measures.
      **⚠ `docs/nhs-ready/09-wardHub-exec-deck.pptx` (6 Jul) is wrong on the ask** - it says one
      ward with the *no-patient-data* build, where the ask is two wards on the full build. It is
      not in the kit zip and not used on the day, so it is flagged in the plan's cheat-sheet
      caveat rather than rebuilt. **Rebuild it before it is ever shown.**
      All four PDFs regenerated (`py -3`) and `wardHub-presentation-kit-30JUL.zip` refreshed,
      every entry hash-verified against its source file.
- [x] **The demo seeds five team jobs, not one.** `generateWardTasks` looped `for (i = 0; i < 1;
      i++)`, so fridge temps was the only team job in the whole product and the other eleven
      templates were dead data - including **Night observation round, the only route to the
      observation-engagement guide link**. Now five via `SEEDED_WARD_TEMPLATES`, covering all
      three shifts, all three priorities and both templates carrying a linked guide. All stay
      pending and unclaimed: the demo script claims one live, and a job pre-claimed by someone
      else would change what My Diary filters out. Water temps deliberately excluded, it recurs
      on Sundays only and would read as a bug on a Thursday.
- [x] **Dev panel + GDPR review DONE** (the item that used to live here). Read all 2,956 lines
      against the plan, the standing decisions and the actual code. **Nine claims were false,
      not merely stale.** Full list in the evaluation's Hat 4; the worst three:
      the Q&A promised a live build would store **patient legal status** and the roadmap offered
      *"add diagnosis and legal status"* as an option (both contradict the 28 Jul removal); two
      places said trust-sensitive contacts **live in code comments** and a single `requiresFocus`
      flip reveals them (stripped out 27 Jul); and the DPIA said *"nothing the user enters is
      transmitted"*, the **third** surviving copy of a claim already fixed on `/gdpr` and
      `/about`. Also removed the whole Light/Medium/Max/Max+ framing (dead since Session 9) from
      eight sections, rebuilt both C4 diagrams (misaligned by the rename, and listing three API
      routes and two workers that do not exist - there is **one** API route), brought the jobs
      schema in line with hand-back / barriers / mark-in-error / per-day completion, rewrote
      Flow 2 to include hand-back at all, and replaced the four invented hazards with the real
      23-hazard summary. Added Q&A entries for the **sign-off-by-specialty model** and the
      **three data types**, both absent. Added the quiz to Data Sources, which had never
      recorded the largest block of sourced content in the app.
      **"Staff nurse" was checked and KEPT** - the plan gives the reasoning (NIC is a rotating
      role, "from the floor, not a title" is stronger). Commented in place so reviews stop
      flagging it.
- [x] **New 13-hat evaluation** written against template v2.1:
      `docs/evaluations/2026-07-30_project-evaluation.md`. It carries the ledger, the metric
      history and the standing decisions, so April, June and 28 Jul can be deleted. Open items
      are **Section P**.
- [x] **Guide count corrected: 68, not 71.** The 28 Jul evaluation was wrong. Counted from
      `catalog.ts`: **1 green / 47 amber / 20 red**, which matches the plan's own cheat sheet.

**⛔ NOT done, deliberately:** item 8 (governance docs out of `dev-panel/page.tsx` into
markdown). Needs Mike's call on whether the JSX or `docs/nhs-ready/` wins. Note the review
grew that file from 2,956 to **3,203 lines**, making it the largest in the repo - the case for
moving it is stronger now, not weaker.

---

## ✅ DONE 29 Jul 2026 - Session 46: menu split by purpose, stale demo user self-heal

**The rule, now written down: Tools holds things you DO, Help holds what wardHub IS plus the
demo controls.** Session 45 made the two dropdowns the same shape but nothing decided what went
in which, so About and Data Sources - the two pages written for the person asking "what is this
and where did the information come from" - sat in More, where a governance reader never looks.
That matters for the 30 Jul sponsor demo.

- **More renamed to Tools** (desktop dropdown, mobile section heading, aria-label). Once About
  and Data Sources left, everything inside is something you do, so the label earns its place.
  Contents: Overview, Quiz, Service Map, Staff, Editor.
- **About moved to Help**, above Feedback. Help is now: Interactive Demo, Intro Guide, FAQ,
  About, Feedback, Demo selector. Six rows, 467px measured, still clears a laptop viewport.
- **Data Sources dropped as a menu row** and given a prominent card on `/about` inside "How
  content is checked" - the same conversation, and it keeps Help from growing to a seventh row.
  Still linked from the footer.
- Intro Guide nav copy updated in both the full and limited-build versions.
- **Stale demo user self-heal** (`providers.tsx`): the Demo selector was showing `Staff_BY_D`,
  a name from the pre-28-Jul cast, restored from a `wardhub_user` saved in localStorage before
  the rename. A saved user whose name is not in `STAFF_NAMES` is now discarded and replaced with
  the default. Anyone still carrying an old name self-heals on next load.
- **Bug found alongside it:** `isViewingOtherWard` compared the capitalised active ward
  ("Byron") to the lowercase ward id ("byron"), so it was **always true**. The amber
  other-ward cue on the Help button - added in Session 45 as the only signal you are off your
  own ward - had therefore never switched off. Now case-insensitive.

**Interactive Demo now appears in two places on purpose, and they have different jobs.** The
amber header button is the prompt for a new visitor; the Help row is the permanent home. Mike
kept both on the understanding that the button "only shows when new to the site then vanishes".
It did not - it rendered on every page forever, and only its *pulse* responded to anything, and
even that only if the user ticked "don't show again" on the last screen of the tour. Close the
tour early, refresh, and it pulsed at you again. Now made true: `tour-provider.tsx` writes
`wardhub_tour_seen` when the tour **starts** (starting it is enough - someone who closed it
early has still seen it) and the header hides both button variants from then on. The older
`wardhub_tour_dismissed` key is still honoured so anyone who already ticked the box stays
hidden. `tourDismissed` left the context; `tourSeen` replaced it.

**Checked, no action:** `/reports` is a deliberate 12-line redirect to `/overview` with a
comment explaining the 27 Jul merge, not an orphan.

### `/overview` patient tile split in two (Mike, 29 Jul)

Three faults, all fixed. **"Complete" read as a status** - filled green tick, green pill, the
word "Complete" - so an outstanding job looked done. Now **"Mark complete"** with a hollow
circle, matching the wording `/guides` already uses. **Outstanding jobs had no heading** while
completed ones sat under "Done", so state was carried only by row styling; both groups are now
headed and counted. And **the tile carried the entire working surface**, which put about one
and a half patients on a screen.

- **Tile scans:** name, ward, barrier/waiting badges, the four counters (still filters), then
  one line per outstanding job - dot, title, barrier chip, one-click tick. ~360px, was ~700px.
  Grid now goes to 4 columns on a wide screen.
- **Pop-out works:** clicking the patient name opens `PatientFocusPanel` (the old card body) in
  a modal - counters, barrier/waiting switches, review stamps, due dates, all job actions, Done
  expanded. Held by patient **id** so counters update live as jobs are ticked.
- **Print kept whole:** the tile is what prints, so each compact row carries a print-only
  priority + due date and the Done list is print-only on the tile.
- `Modal` gained `size="xl"` (max-w-4xl) and scrolls past 80vh. Both additive.
- ⚠ **Watch the file casing:** `src/components/ui/modal.tsx` is lowercase in git. Editing it via
  a capitalised path renames it on disk and `tsc` then fails with TS1149/TS1261 (two casings in
  one program). Import it from `@/components/ui`, not by path.

**Open - table view at real scale.** Kept deliberately: redundant with 2 wards and 5 patients,
but the real thing is **15+ wards at 20 patients each**, where sorting and filtering by column
is the only way through. Mike expects it will **need work of its own** before then - it has not
been designed for that volume (paging, sticky header, per-ward grouping all unconsidered).

---

## ✅ DONE 29 Jul 2026 - Session 45: Help is a dropdown, and it holds the demo selector

Mike's ask, and a reminder that a job agreed in conversation never reached this file - it was
**not** in Section M or anywhere else, so it was lost until he asked again. Anything agreed
verbally goes in here the same session from now on.

- **Help was a "pop out"**: clicking it replaced the entire nav bar with a toolbar, plus a
  bouncing "Try different roles!" arrow pointing at the Demo Mode button. It is now a
  **dropdown in the same shape as More** - same width, same icon-plus-description rows -
  so the two menus behave identically and the nav never disappears.
- **The standalone "Demo Mode" button is gone from the header.** It is now the last row of
  the Help dropdown, renamed **Demo selector**, and opens the same panel (ward, role,
  specific user, appearance, style theme, log out) with a "Back to Help" row above it.
  The row's subtitle carries the current state, e.g. "Anne Elliot · Staff · viewing Dickinson".
- **The viewing-another-ward signal was preserved**, which mattered: it used to turn the
  Demo Mode button amber, and that is the only cue you are not on your own ward. The Help
  button now turns amber instead.
- Mobile: the ward and role blocks are grouped under a **Demo selector** heading, with
  sub-labels "Viewing ward" and "Role".
- Copy updated where it named the old menu: intro guide navigation tips, the "Help & More"
  slide (both the full and limited-build versions), and a comment in `login/page.tsx`.
- Verified in the browser: dropdown opens, demo view opens and returns, ward switch applies
  and turns Help amber, mobile menu reads correctly, zero console errors.

**Evaluation template -> 2.1, same session.** Mike deletes superseded evaluations, which only
works if the newest file is a complete record. It was not: the 28 Jul report cites the June one
by name and scores findings as "third appearance", and both claims die with the file. 2.1 now
reads **every** prior evaluation and deep dive, and carries three tables forward - a
**recommendation ledger** (nothing leaves it by being forgotten, only by appearing once as Done
or Dropped), **metric history** (one column per evaluation), and **standing decisions and parked
items** (so settled calls and licence-blocked work are never re-proposed). The scorecard carries
every past score. Added a **two-way cross-check against this BACKLOG**, reported as mismatches,
because a finding that lives only in an evaluation is a finding nobody actions. Archiving policy
flipped: the newest report is the record, older full evaluations can be deleted, deep dives are
kept. **Write the new report before deleting the old ones.**

**Open follow-up:** moved to the QUEUED section at the top of this file (29 Jul), with the
`/overview` half resolved: there is no separate control there, it opens TaskDetailModal.

---

## ✅ DONE 29 Jul 2026 - Session 44: explainer video + two accuracy fixes

Short session. The explainer video is now in the product, and two pages were saying things
that were not true.

**The video.** `E:\Hub\wardhub-video\out\merged.mp4` is in the repo as
`public/video/wardhub-full-reel.mp4` (10MB, 1920x1080, 3m42s, **no audio track** - every word
is on screen). It plays on **`/about`** under the heading **"Understanding the data flow"**.
Heading and player, nothing else: no description, no transcript, no runtime note. Mike's steer,
and it is the right one - the film exists to explain the thing, so wrapping it in text that
explains the film is waffle.

**What the reel actually is** (worth knowing before anyone edits round it): five chapters with
a nav rail down the right-hand side - 1 the problem (0:00), 2 what wardHub is (0:15), 3 where
the data goes (1:22), 4 the ask for a two-ward pilot (2:52), IG the whole model on one board
(3:10). The closing IG board is the only frame that shows the whole argument at once.

**Also fixed:**
- **`/about` said "no cookies"** and "nothing is sent to any server". Both untrue since the
  password gate returned (Session 35): `verify-password/route.ts` sets `site_access` (httpOnly,
  7 days, holds nothing but "the password was right"), and the password itself is POSTed. The
  same claim was corrected on `/gdpr` in Session 43; this was the last copy of it. The CSP
  claims in that paragraph were checked and do hold up (`connect-src 'self'`, `font-src 'self'`).
- **Dev panel notice** said "No password needed currently" - stale for the same reason. Now says
  there is no *separate* panel password because the site-wide one covers it.

**Tried and reverted, do not redo:** splitting the reel so `/gdpr` got only the 90-second data
chapter (`out/3.mp4`). It loses the chapter rail and the closing IG board, which is most of what
makes the film land. `/gdpr` is byte-identical to its pre-session state.

**Open follow-ups.** ⛔ **OWNED BY ANOTHER SESSION (Mike, 29 Jul) - do not touch `/about`, the
video, or `E:\Hub\wardhub-video`.** A separate session is working on the explainer video. These
stay listed for the record only; leave them to that session, including the `/about` review stamp
below, which that session will be editing the same page for.
- [ ] **The rendered reel does not match its own source.** `E:\Hub\wardhub-video\src\` is dated
      22 Jul and contains **no chapter rail and no IG board** - `grep` for "rail"/"chapter"/"IG"
      finds nothing. `merged.mp4` (29 Jul) has both. So whatever produced the reel is not in that
      tree. **Re-rendering from `src/` as it stands would silently produce a worse film.** Find
      the real source before touching it.
- [ ] **No text alternative for the video** (WCAG 2.1 1.2.1). A transcript was built and then
      removed on Mike's steer. Deliberate, and defensible while this is a demo - everything the
      film argues is written out in the cards below it on the same page. Revisit if wardHub ever
      faces a formal accessibility assessment; the deleted transcript is recoverable from git
      (commit `39ce1dd`, `src/lib/data/video/transcripts.ts`).
- [ ] **10MB of video now lives in the repo**, and the 8.7MB 90-second cut stays in git history
      even though the file is deleted. Fine for Vercel. Decide whether video belongs in the repo
      at all long-term, or should be hosted outside it.
- [ ] **`/about` still stamps "Page last reviewed: 5 July 2026"** while the page changed today.
      Bump it next time the page is genuinely reviewed, not just edited.

**For the demo (Thu 30 Jul, 1:30pm):** the film is at `wardHub.live/about` - behind the site
password like everything else. If the network is unreliable, play the local copy at
`E:\Hub\wardhub-video\out\merged.mp4` instead. It is silent by design, so a room with no sound
loses nothing.

---

## ✅ DONE 27 Jul 2026 - Trust-policy quiz batch (was NEXT UP)
The `/quiz` bank was ~95% national guidance. It is now **942 questions across 43 topics, 574 of them
(61%) mined from 117 distinct Derbyshire Healthcare documents** in `E:\Hub\Policy dump not for git hub\`
(483 files). 17 `research-trust-*.json` batches, all wired into `src/lib/data/quiz/index.ts` and live.
Trust topics lead the topic picker. Questions whose source copy was near or past its stated review
date show a quiet "check FOCUS for the current version" line after you answer (`reviewFlag`).
**Mike's steer 27 Jul: do NOT chase the overdue-review questions** - the offline policy dump is a
snapshot, so "overdue" reflects our copy, not necessarily the live document. Revisit after the
refresh, see Section L.
- **Reusable pipeline:** `scratchpad/docx2txt.js` (zero-dep docx extractor - no Python on this box),
  `scratchpad/TRUST-QUIZ-BRIEF.md` (agent brief - mine LOCAL detail only), `scratchpad/gen-quiz-md.js`
  (regenerates `docs/quiz-question-bank.md`). Add a batch file, rerun the generator, add an import.
- **5 questions deliberately omitted** where two trust documents give different answers, plus one
  overtaken by a system change (the Brigid app now does amend/remove observation levels).
- **⚠ FOR MIKE:** `E:\Hub\quiz-policy-conflicts.md` (kept OUTSIDE the repo) lists every conflict, stale
  document and gap found while reading the library - including **no flumazenil / benzodiazepine
  reversal pathway anywhere in the 5 rapid tranquillisation documents**. Worth raising with pharmacy.
- **Still to do:** Mike to proofread `docs/quiz-question-bank.md`. No sign-off badge on /quiz yet -
  decide whether it should carry the traffic-light status like the guides do.

---

## A. FOCUS form-link wiring (NEW, 4 Jul - high value, don't lose)
Real FOCUS URLs now captured (temp link map). These fill the long-standing "86 placeholder
`#` form links" in the referral guides. Wire each as an "On FOCUS (login needed)" chip
(existing FocusLinks pattern). Public ones (derby-talk, Living Well, perinatal portal) show openly.

> **4 Jul progress (commit 65e24a8):** wired the 3 referral guides that already exist -
> **dietitian, physio, ERP** - with their real FOCUS URLs. Also enhanced the guide viewer so
> blank-form + other-guide tiles render `form.note` and show a badge for
> dead `#` links (was only blank forms + wagoll). The rest below need the guide BUILDING first
> (they have no workflow yet) - that's a bigger job (full referral template + criteria), left for Mike to prioritise.

> **28 Jul: full audit done** - `docs/evaluations/2026-07-28_placeholder-links-deep-dive.md`.
> Accurate split of what was "86 placeholder links" (really **131, now 129**):
> - **80 in the referral guides.** Blank forms 7 live / 22 dead. Other guides 6 live / 42 dead.
>   **WAGOLL 0 live / 16 dead - not one referral guide has a worked example.**
> - **49 in the links data.** 44 are FOCUS-gated (Mike can collect these in one FOCUS session,
>   no decisions needed); 5 are phone-first entries where the phone IS the content.
> - **Nothing further can be wired from the 4 Jul link map** - every entry in it that has a
>   matching guide is already wired. The rest needs the guide built first (the items below).
> - All 131 already rendered as non-clickable with a badge, so this was never the same risk as
>   the invented phone numbers. But the badge SAID "Blocked in demo", which claims the link
>   works live and is merely switched off. Reworded to **"Link to confirm"** (and
>   **"Example to add"** on WAGOLLs) so the gap reads as unsourced content, not a demo setting.
> - Wired 2 verified public URLs: GovWifi, EMAS Patient Transport. (First guess at the EMAS
>   path 404'd - verify every one, never construct a plausible path.)
> - **Highest-value item is NOT link wiring: write ~6 WAGOLLs.** A worked example needs no
>   FOCUS URL, just Mike writing one good version, and can be static HTML in the repo like
>   the existing `public/abc-wagoll.html`. Step 3 of the standard workflow template is empty
>   in all 16 guides.
> - Also spotted: `benefits-review` reads like an unfinished template (duplicate stub labels
>   "Benefits Review Referral" + "Blank Referral Form", and "Additional Guidance").
>   And `s117-meeting`, the only green guide, has 5 dead links - decide whether green should
>   require working links.

- [ ] **NEW GUIDE needed** Autism assessment <- Autism Referral Form (`/download_file/view/9204/685`) + AQ50 (`/download_file/view/1124/685`)
- [ ] **NEW GUIDE needed** CAMHS <- CAMHS SPOA form (`/9315/685`) + Triage & Assessment Operational Policy (`/9478/685`)
- [x] ERP / emotion-regulation <- leaflet (`/9591/685`), referral form/flowchart/guidance v12 (`/9592/685`), checklist (`/9593/685`) - WIRED
- [x] Dietitian guide <- Referring to Dietetics via SystmOne (`/9465/685`) - WIRED
- [ ] **NEW GUIDE needed** ECT <- policy (`/9238/685`), anaesthesia policy (`/9237/685`), consent form 1 (`/2059/685`), consent form 4 (`/2060/685`), how-to (`/9239/685`) [ECT fasting/post-ECT content also in `_DIGEST.md` odds p3-5]
- [x] Physiotherapy guide <- MH Physio external referral form (`/9363/685`) + leaflet (`/9364/685`) - WIRED
- [ ] **NEW GUIDE needed** Perinatal <- community referral form (.docx, trust site), Beeches referrer guide (`/10045/685`), community referrer guide (`/10047/685`), referral portal (perinatal.cpms.necsu.nhs.uk)
- [ ] **NEW GUIDE needed** Specialist Day Services <- referral diagram (`/2411/685`) + 4 group leaflets (Living Well 1134, CST 1132, Lifestyle Matters 1133, Coping w/ Emotions 2410)
- [ ] **NEW GUIDE needed** Discharge Liaison / placement <- DLT referral form (`/9715/685`) (NB: distinct from the existing EDT guide - do not merge)
- [x] DONE 29 Jul (Session 46b). Talking Therapies references -> https://derby-talk.co.uk/for-professionals/ (and confirm Vita/Everyturn wording everywhere)
- [x] DONE 29 Jul (Session 46b). CMHT / Living Well references -> Living Well Operational Policy (.docx) + livingwellderbyshire.org.uk
- FOCUS base host to prepend: `https://focus.derbyshirehealthcareft.nhs.uk`
- Forensic links: EXCLUDED from demo per standing flag.
- Rule 4: internal `@nhs.net` team inboxes / mobiles / extensions stay OUT of the live build.

## B. Service map (/service-map) - status + follow-ups
Built this session: ~109 demo services, 12 type clusters, node-off-node branching + parent-closed
cutoff, public contacts in detail panel, search, and real FOCUS criteria folded in (CMHT/Living Well,
ERP in/exclusions, autism assessment, + new Day Services/DLT/MH Physio). Standalone page, not in nav.

- [x] **Zoom + pan added** (4 Jul eve, commit 6999d8f) - wheel-to-cursor zoom, zoom buttons, drag-to-pan.
- [x] **Area = where the person LIVES made explicit** (commit c3ab1c5) - `areas[]` documented as residence-catchment (not service location); new `catchmentNote` per service (home address vs registered GP); UI reworded. New "Pregnant/<24m postpartum" profile flag.
- [~] **Per-service research** - key ~11 local services now researched from their own sites + criteria/catchment corrected (Talking Therapies, Living Well/CMHT, Eating Disorder, Cranstoun/DRP substance, Perinatal, Safe Havens, Adult Autism, Op COURAGE, Age UK). REMAINING ~90 services still illustrative demo - need further research rounds; each still marked "to be clinically verified".
- [ ] Tighten remaining criteria from FOCUS (CAMHS pathways, condition charities, etc.) - best-effort now, "verify".
- [ ] Decide real home: a button on the patient profile ("what's open to this person"), pulling approved dated facts instead of manual toggles (full-build/PII feature).
- [ ] Refinement idea: a child off an "unknown" (not just "closed") parent still shows open - consider inheriting parent state.
- [x] **DONE 27 Jul - map rebuilt category-first with focus-on-node.** Hub shows the 12 categories
      only (service count + how many open), click to drop into a category, click a service with its own
      branch to recentre again, breadcrumb buttons back out. `parent`/`near` split shipped with it, which
      fixed the seven unreachable-service cases. Original note: Right now
      every service radiates off the hub, so 115 nodes compete for the same ring. Make the first
      node out from the hub the **category** (the same 12 cluster labels the list uses), then branch
      the services off their category node. Same data, one more level of hierarchy; the existing
      node-off-node parent chain hangs below that unchanged. Should also make the cluster filter
      feel like a zoom rather than a hide.
- [x] **DONE in Session 42, never ticked (verified 29 Jul).** `near?: string` exists on `Service`
      (`src/lib/data/service-map.ts:103`) and all six named services carry it: `shelter`,
      `citizens-advice`, `turn2us`, `rape-crisis`, `carers-direct`, `switchboard-lgbt`. The
      original write-up is kept below because the modelling reasoning is worth having.
- [x] **⚠️ BUG found by audit 27 Jul: 6 national services are unreachable out of area, 1 in the city.**
      Mike: "some services don't seem reachable regardless what filter options I use." He was right -
      it is not the filters, it is the parent chain. A child is cut off when its parent is closed
      (`reach[]` in `/service-map/page.tsx`), and six services that serve the WHOLE COUNTRY hang off
      a parent that only serves Derbyshire, so out-of-area they can never open:
      `shelter` (via housing-dtr), `citizens-advice` and `turn2us` (via welfare), `rape-crisis`
      (via sv2), `switchboard-lgbt` (via derbyshire-lgbt), `carers-direct` (via carers-derbyshire).
      **`carers-direct` is worse** - its parent is county-only, so it is unreachable for Derby City
      residents too. Everything else checks out: all 115 services are reachable for some combination
      of filters, no duplicate ids, no unknown clusters, no missing parents, every service in a
      real cluster.
      **The cause is a modelling one:** `parent` is being used for two different things - a genuine
      dependency ("you reach Crisis via the Helpline") and a display convenience ("Shelter sits near
      housing"). You do not need a Duty to Refer to phone Shelter. Options, cheapest first:
      (1) drop the `parent` on those six so they sit on their own; (2) keep the visual link but stop
      cutting a child off when the child's own `areas` already cover the current area; (3) split the
      field into `parent` (true dependency) and `near` (layout only) - the honest fix, and it pairs
      naturally with the category-first rework above.
      **DECIDED (Mike, 27 Jul): option 3 - split `parent` and `near`.** Only a true dependency cuts a
      child off; `near` is layout only and never gates access. The six above become `near`, since you
      do not need a Duty to Refer to phone Shelter. Do it in the same pass as the category-first
      layout - they touch the same code.
- [x] **DONE in Session 42, never ticked (verified 29 Jul):** clicking a node with its own branch
      recentres on it (`src/app/service-map/page.tsx:688`).
- [x] **Re-centre the map on a node (Mike, 27 Jul).** Click a service (or its category) to make it
      the centre and push the rest out of the way, so one branch can be read without the other 100
      nodes competing. Plus a **Recentre button** back to the hub view. Pairs with the category-first
      layout: the category becomes a natural first-level focus target, so the journey is
      hub -> category -> service without ever losing your place.
- [ ] Sweep other FOCUS sections for more services/links (Mike logged in; only did /clinical/referrals).
- [PARK] Real vs demo: criteria stay illustrative until the full research/sign-off pass.
- [ ] **Postcode / GP-surgery lookup (Mike, 4 Jul)** - some teams allocate by **GP surgery location**, others by **home address**; build a checker that takes a postcode (and/or GP surgery) and tells you: Derby **City vs County**, which **AMHP team** to call, which **CMHT**, and the **S117 responsible authority**. Build it into the "which services are accessible" tool (this service map / town-map). **Data now fully in hand** (Part 1 of `_CONTACTS-INVENTORY.md`): every CMHT's complete GP-surgery list + numbers, the Derby City Team B/C split, and the city/county AMHP + social-care split. KEY RULE captured: CMHTs route by **registered GP surgery**; AMHP + social care route by **home address** (city vs county); S117 by authority-of-residence-when-sectioned. GP-surgery -> CMHT is a clean static table; city/county needs a postcode -> local-authority resolver (static boundary table for demo, or postcode API live - Rule: check before sending anything out).

## C. Guides - review + edits (from homework, condensed - see homework-remaining doc for detail)
- [x] **Update live payslip guide + hidden roster guide with the verified AfC facts (10 Jul)** - DONE same day (commit e8a7833): payslip guide now 15 steps incl. para 2.11 whole-shift rule; roster guide data updated while hidden. Spec below kept for reference. -
  mirror what the offline printables in `E:\Hub\printable-guides\` now have: the Band 5 rate
  windows table (nights 20:00-06:00 + all Sat = +30%; all Sun + public holidays = +60%, not
  stacked; lower bands higher), a new "whole-shift rule" step (TCS Handbook Section 2 England
  para 2.11 - more than half a weekday shift in 20:00-06:00 = whole shift enhanced, verified
  real + current), why one night shift feeds two payslip lines (midnight split), enhancements
  pay ~a month in arrears, "AfC Absence" = average-enhancements top-up on leave (S13.9), and
  overtime basics (1.5x / 2x public holidays, bands 1-7, part-time plain time to 37.5h, TOIL
  3-month rule). Fictional figures ONLY. Roster guide is hidden (catalog line commented) but
  update its data anyway so it is current whenever it returns.
- [ ] **Pay/roster split follow-ups (13 Jul):** pay-roster split into 3 live guides (payslip 17 steps + band picker / roster 11 / leave-absence 9, all RED). Outstanding: (a) Mike sign off all three; (b) confirm Trust absence figures for the leave-absence "[confirm]" markers via Copilot Policy Checker (carers leave, bereavement days, phased-return pay); (c) tell Tess the band picker is now actually built (he told her it existed on 10 Jul); (d) 48h opt-out legal reading still to settle with Tess (guide keeps her safe wording); (e) ~~printables outdated~~ DONE 13 Jul: new `leave-absence-rest-survival-guide.html`, roster + combined patched (corrected 48h + full rest limits), disclaimers on all four; (f) band picker salaries hard-coded to 1 Apr 2026 scales - update each April (`PayBandPicker.tsx`); (g) **obtain the DHcFT Health and Attendance Policy** (phased-return terms) from FOCUS or the Trust Teams policy collection - the guide's phased-return line is still generic; (h) **48h step now uses the corrected legal wording** (opt-out = the 17-week AVERAGE itself; no single-week cap; rest rights never waivable) - this supersedes Tess's email version, Mike to square it with her when signing off; (i) **make the pay guides less text-heavy** (Mike, 13 Jul) - delivered: band picker, rates-at-a-glance table, shared FAQ accordions (pay-faq.ts), SHIFT CHECKER (enhancement split + whole-shift rule + pay estimate + 11h rest verdict, payslip guide step 9). Also delivered: TL;DR "In a hurry" banners on every step + a "Show references" toggle (Harvard superscripts, off by default) with numbered sources. Also DONE: **interactive "payslip decoder"** (commit 0d677a0) - fictional Band 5 payslip, 15 clickable rows, explanations + ticks + progress counter, self-consistent figures. The whole pay-guide interactivity suite is now built. Remaining optional: pay/roster topic added to /quiz (364-question infra already exists).
- [ ] **Pay/roster session 37 wrap (14 Jul) - what happened + what's left:** DONE this session - 4th guide `/guides/pay-roster-faq` (FAQ+jargon extracted, payslip trimmed to 17); TL;DRs + "Show references" toggle; **rest content REFRAMED** (was over-claiming "breach"/"can't opt out" - now WTR reg 21(c) hospital exception + reg 24 compensatory rest, kept light); **SATURDAY-NIGHT PAY SETTLED** - Mike was sure Sat nights pay 60% whole-shift; his anonymised bank payslips PROVED clock-split at midnight (Sat night = ~3h @30% + ~7.5h @60%), shift checker was already correct, added a Sat-vs-Sun worked example; **band selectable in the shift checker** (was stuck on picker's band); **print system** - guide viewer Simple/Full-colour/Choose-sections with **band figures in the payslip printout**; new `src/lib/utils/printDoc.ts` (`printClinicalDoc` + `printChecklist`, hidden-iframe, NHS-styled, IG footer) wired to MSE/care-plan/risk-RMP "Print" and the **admission checklist paper-handover print** (fixed a bug where the old window.print hid all the tick boxes). STILL OPEN (my side): leave-discharge-transfer checklist print (1-line `printChecklist` call), shift-checker result in the payslip printout, pay/roster /quiz topic. MIKE'S HOMEWORK: sign off ALL red pay guides (payslip/roster/leave-absence/pay-roster-faq); tell Tess band picker is real + the 48h wording change; upload Special_Leave_Policy.docx to SharePoint (Section J4); get the Health & Attendance Policy (phased-return); bin the anon payslip CSVs in Temp.
- [ ] Review-only sign-offs: ~47 amber guides for Mike to read + colour (green needs dept sign-off).
- [~] Items needing Mike's docs/photos: **MOSTLY SUPPLIED 4 Jul** in `docs 1\` - see Sections F-I. Still blocked: MHA office email; social-care secure-email name; restraint holds images (Mike to photograph).
- [ ] **Capacity assessment guide - make interactive (Mike, 25 Jul)** - choices made while working through the guide should alter the final case-note output (same family as the shift checker / payslip decoder interactivity).
- [x] DONE 29 Jul (Session 46b). **ERP referral - swap the SV2 form link (Mike, 25 Jul)** - remove the "SV2 Referral Form" link from the ERP workflow's forms step (`referral-workflows.ts` ~line 1104, currently a `#` placeholder) and replace with a link to refer to ERP itself.
- [ ] **SV2 own guide? (checked 25 Jul: NO)** - SV2 has no guide; it only exists as a service-map entry ("SV2 (Sexual Violence, Derbyshire)", 01773 746115) plus the stray form link in the ERP workflow above. Decide whether SV2 deserves its own referral guide when doing the ERP edit.
- [ ] mh-talking-points: reorder/group + add alternative grounding/distraction techniques (needs Mike's steer on grouping).
- [ ] OT Tools: confirm the local OT form (MOHOST vs local); improve MOHOST examples.
- [ ] section-136: expand with FAQ vs leave (Mike's call).

## D. Bigger builds (each its own session)
- [ ] **Contacts directory - single source of truth (Mike, 4 Jul)** - one central contacts store; an **editor-role** edit to a contact updates it **everywhere it appears** (guides, service map, links, CMHT lists, referral submission steps). Design notes:
  - Data model per contact: `id`, `name`, `type` (CMHT/crisis/social-care/AMHP/IMHA/MHA-office/ward/team...), `phone`, `email`, `area` (city/county/all), `public` vs `internal` flag (Rule 4: internal = "Hidden in demo mode", real value in a protected field), optional `focus`/notes, `lastReviewed`.
  - Everything references contacts **by id**, not inline copies, so one edit propagates. (Same pattern as approval-status / RMP-chips maps.)
  - For edits to show for **everyone** (not just one device), needs a persistent store = full-build/Supabase; localStorage-only would be per-device. Note this when scoping.
  - **Seed inventory ready:** `E:\Hub\temp\dump july\extracted\_CONTACTS-INVENTORY.md` (kept out of repo - holds internal numbers). Compiled 4 Jul from today's docs + the `MH Helpline Pack` (`E:\Hub\temp\MH Helpline Pack - Great for signposting.pdf`). Has ~60 contacts: 8 CMHTs, crisis teams, AMHP, social care, MHA office, IMHA, ECT, chaplaincy, IAPT, + national helplines by category (MH/dementia/abuse-DV/addiction/bereavement/crime/eating/LD/parenting/carers). Each tagged [PUB]/[INT]/[VERIFY].
  - **Reconcile with existing /links** - many [PUB] helplines are probably already bookmarks; directory should be the single source, not a duplicate. Audit links data when building.
  - **[VERIFY]:** the helpline pack is V29 (Jun 2020) - confirm pack-only numbers before live; Talking Therapies is now derby-talk.co.uk.
  - Pairs with the postcode lookup (Section B) which reads from this directory.
- [PARK] Named Nurse Checklist -> schedulable tasks ticking off on the patient job list.
- [PARK] Tribunal / DST / OT-report combined builder (ties to the DLT/CHC funding finding in A/B).
- [PARK] Formulation output rethink.
- [PARK] Risk tool rethink (beyond the quick fixes done).
- [PARK] DoLS - more visual/interactive.
- [PARK] Service "town map" -> full patient-profile integration (see B).

## E. Side quests / smaller
- [ ] **Guide freshness vs source policy (Mike, 25 Jul - EXPLORE, no action yet)** - flag a guide when the policy it was written from is due for renewal, or better, detect that the policy has been UPDATED since the guide was written and request a review. Ideas to explore when we pick this up: store `sourcePolicyName` + `policyVersion`/`policyReviewDate` + `guideWrittenDate` per guide (could live alongside the approval-status map); compare against the 472-policy SharePoint Trust Policy Library (Copilot Policy Checker / Content Auditor agents could do the periodic check since Claude can't reach the tenant); surface as a badge on the guide tile ("source policy updated - review needed") and/or auto-flip the traffic-light status back to amber. Pairs naturally with the contacts directory's `lastReviewed` idea (Section D).
- [x] **Print on guides** (4 Jul eve, commits 7c4f9c1 + be77d18) - Print button on every how-to guide, referral workflow and thinking-guide, rendering all steps/sections from the SAME data so future edits flow through. Reusable `downloads` field + printable blank forms (police capacity, ABC chart). Builders (risk/care-plan) skipped - they already copy out.
- [x] DONE 29 Jul (Session 46b). Quiz: add "report an issue" per question (feeds feedback board).
- [ ] Printable guide "clue cards" (title + 1 line, 4/A4, per group) for physical re-grouping.
- [x] DONE 29 Jul (Session 46b). Diary-task audit: which other guides map to a ward diary task (like fridge-temps) -> add "mark done" buttons.
- [ ] New guides Mike flagged: informal patient contract; no-smoking-in-the-trust (Mike has material somewhere).
- [x] **Student Nurse Placement guide** (side quest, 4 Jul, commit 9f09614) - new "Learning & Development" category, built demo-safe from `dump july\Student Information Pack.docx` (real ward/staff names + internal numbers stripped). RED pending Mike's review. New category has one guide for now; move to Nurse Tools if a dedicated category feels heavy.
- [x] **Discharge-barrier flag on tasks (Optica-inspired, Mike 4 Jul)** - BUILT Session 35 (8 Jul): `blocksDischarge` on patient tasks + appointments, set via add-task/bulk/detail modals, surfaced in PatientTasksModal, patient cards, /reports and the /overview trust roll-up (22 Jul). STRATEGIC: this is the bridge that makes wardHub the ward-level capture layer feeding discharge-flow tools (e.g. Optica) upward - positions wardHub as complementary, not a rival.
- [ ] **Bed-management upgrades to /overview + /reports (explored 25 Jul, ranked)** - core pitch confirmed: a barrier = an outstanding flagged task, so the data is a live byproduct of the diary where jobs get done (no SystmOne feed, no double-entry; completing the task clears the barrier automatically). Gaps found, in build order:
  1. **Barrier categories** - "most common barriers" groups by free-text task title, which will be mush with real data ("Chase social care" vs "chase SW"). Add a small optional dropdown at flag time (housing / social care-package / funding-DST / family-legal / internal clinical / transport-equipment / other), ideally mapped to national delayed-discharge reason language.
  2. **Days blocked** - derive "blocked N days" per patient from oldest open flagged task's `createdAt` (zero input); show on /overview blocked list + sortable /reports column, worst first.
  3. **Ours vs theirs** - derive internal/external from category (1): headline "X of Y barriers waiting on external partners". Strong sponsor line.
  4. **Drill-down** - /overview ward rows -> /reports pre-filtered (ward + barriers only).
  5. **Bed-meeting print sheet** - one-page printable /overview via `printDoc.ts`.
  6. **Trend sparkline** - needs persistence; demo could passively tally daily counts in localStorage (per-device only), real answer = Supabase full build. Be honest about the limitation.
  7. **[DECISION for Mike] Estimated discharge date** - real bed management wants EDD vs barriers, but EDD is genuinely NEW input (breaks the no-double-entry constraint). Only if it's a date already stated at ward round, entered once.
- [ ] **Read-only MDT / external task view (Optica-inspired, Mike 4 Jul)** - give the wider MDT read-only visibility of a patient's tasks, and (with consent) external partners like social care/family - potentially via links to the patient's existing MS Teams MDT workspace (reuses infra, avoids building an auth layer). Full-build/PII; consent + lawful basis required (real PII sharing).
- Strategic context for both: [[optica-governance-insight]] - the Optica demo showed the org WILL accept data-outside-S1 + external access when it is governance-wrapped (DCB0129, data-controller, DPIA). wardHub's approval path is the wrapper, not "store no data".
- [x] **Tasks: replace Delete with "Mark in error" (Mike, 10 Jul) - DONE same day (commit 06bec8a).**
  `inError`/`markedInErrorBy`/`markedInErrorAt` on BaseTask; provider's `tasks` excludes in-error
  (every view/count skips them automatically) + `allTasks` for audit; two-tap "Mark in error"
  button in TaskDetailModal; repeating-task Delete now marks in error; Reports page gained a
  collapsible "Tasks marked in error" audit section with one-click Restore. Verified end-to-end.

### Full E:\Hub source sweep (4 Jul) - gap check vs the 66 guides
Cross-referenced every .docx/.pdf/.pptx across E:\Hub against the current guide catalogue. **Coverage is strong** - almost every clinical topic already has a guide, is tracked in Section A (referral form-wiring / new-guide-needed: autism, CAMHS, ECT, perinatal, day-services, DLT), or is a parked build (Red Folders, DST). Psychoeducation docs (PD types, Window of Tolerance, Abandonment) are already covered by the 23 patient-guides. **Genuine gaps found (source in hand, no guide):**
- [ ] **STOP AND WATCH** (`temp/wardhub docs/STOP_AND_WATCH_Poster_Word (2).docx`) - early physical-deterioration soft-signs tool (S/T/O/P + AND + W/A/T/C/H), sits *before* NEWS2 triggers. Strong small Physical Health guide; full content captured. Complements news2.
- [ ] **Bowel monitoring / chart** (`temp/wardhub docs/Bowel-chart.doc`) - bowel-chart tool; real safety issue (clozapine/antipsychotic constipation; STOP-AND-WATCH flags "no bowel movement in 3 days"). Small Physical Health guide.
- [ ] **Nearest Relative (MHA s26-30)** (`temp/wardhub docs/Nearest_Relative.pdf`) - who the NR is, their rights, county-court displacement. Fold into `mha-statuses` or small standalone Legal & Advocacy guide.
- [ ] (Optional) **CTO guide** - `Community_Treatment_Order_Policy_MHA_1983.docx` exists; CTO currently only partial in mha-checker/mha-statuses. Dedicated guide is optional (lower priority).
- Note: `Nurses_checklist.docx` (MHA papers acceptance checklist) = already covered by `mha-checker`, and is the source for the **rectifiable-vs-invalid errors** enhancement (papers-complete? = invalid if No; names/addresses = rectifiable; med recs <=5 clear days apart; joint rec both doctors present). Feeds mha-checker snag 196.
- Excluded (Mike's standing flag): **MAPPA** (`MAPPA_Policy...2025.docx`) - forensic-adjacent, parked/do-not-surface. Not guide material: AI policy, CQC leaflet, business-case/demo/dev-panel docs, DCB0129 clinical-safety docs, `from trust other example projects`.

---

## J. Copilot agents - work-side queue (Mike, 10 Jul 2026)
All done AT WORK in M365 Copilot / Teams, not in this repo. Context: [[focus-download-and-copilot-agents]] has the agent inventory + the Policy Checker retest that gates item 1.

1. [x] **DONE 10 Jul (Claude via Mike's browser):** Policy Checker RETEST PASSED (2 questions,
   verbatim quotes + citations from the Trust Policy Library - the 9 Jul zero-results were
   ingestion lag as suspected). Content Auditor Knowledge pointed at the library and updated.
   Duplicate "wardHub Directory Curator" draft DELETED. Old Dec "Policy Navigator" DELETED.
   All 6 agents published and settled - no SharePoint-native fallback agent needed.
   NOTE for Mike: wH Quiz Writer shows "Pending changes" in Agent Builder (an unfinished edit
   of yours?) - open it and Update or discard.
2. [x] **DONE 10 Jul:** Guide Builder safety net + TEMPLATE C (Explainer / Learning guide) added
   to the LIVE agent instructions and published; same text added to
   `E:\Hub\Copilot-Guide-Builder-Kit.md` so the take-to-work kit matches.
3. [x] **DONE 10 Jul:** "Meet the wardHub AI agents" page PUBLISHED on the wardHub SharePoint
   site: `https://nhs.sharepoint.com/sites/msteams_af07eb/SitePages/Meet-the-wardHub-AI-agents.aspx`
   - what an agent is, where Agent Builder lives, 8-step build walkthrough, every toggle,
   knowledge sources, ingestion-lag warning, and FULL verbatim instructions for all 6 agents.
   Source of truth kept in repo: `docs/nhs-ready/12-meet-the-agents.md`.
   STILL FOR MIKE: pin the page as a tab in a Teams channel if wanted (page is on the site,
   not yet a tab), and give it a skim before pointing stakeholders at it.
3b. [ ] ⏰ **Re-paste the Guide Builder instructions (Mike, at work, 2 minutes).** Updated 27 Jul with
   the progressive-disclosure structure rules and the DECISION FLOW block - see Section N item 3.6
   for what changed and why. Verbatim text: `docs/nhs-ready/12-meet-the-agents.md`, section
   "1. wH Guide Builder", the whole fenced block. Paste into the agent's Instructions box in Agent
   Builder and Update. No other setting changes. The "Meet the wardHub AI agents" SharePoint page
   carries the old text too, so refresh that page's Guide Builder block at the same time.
4. [ ] **Upload Special_Leave_Policy.docx to the SharePoint Trust Policy Library (Mike, at work).**
   Missed in the big FOCUS auto-download; Mike found it 13 Jul and saved it to
   `E:\Hub\Policy dump not for git hub\Special_Leave_Policy.docx` (v7, issued 10 Jul 2024,
   review 31 Jul 2027). Until it is in the library, the Policy Checker / Content Auditor
   agents cannot see it. Its figures are ALREADY baked into `/guides/leave-absence`
   (bereavement 5 days paid, end-of-life 6 weeks, domestic 10 days, carers 1 week unpaid) -
   after upload, ask the Policy Checker to verify that step as a test.
5. [ ] **CONFIRM mode for the content agents (do NOT start before 30 Jul).** The wH Quiz Writer and
   Guide Builder both only CREATE - neither can check whether existing content still matches the
   current policy, so every refresh means re-reading by hand. Add a confirm mode that returns
   CONFIRMED / CHANGED / NOT FOUND against the document in front of it. Full instruction sketch,
   the guide-side blocker and the traffic-light payoff: **Section L, items 3 and 4**.

## K. Repo clean + publish pipeline + SharePoint handover readiness (DEADLINE: meeting Thu 30 Jul, 1:30pm)
Agreed 21 Jul (extended same evening). Goal: all raw trust material out of GitHub and onto
SharePoint, the guide publish pipeline LIVE and demonstrable, repo ready to hand to the
data team the moment traction lands - "no waiting on Mike".

### The three-stage model (Mike's framing, confirmed)
1. **Current** - Claude did the heavy lifting and saw everything; guides are demo-safe by
   discipline (Rule 4), not by architecture.
2. **Presentation (target for 30 Jul)** - mimic full production: SharePoint = authoring
   home, Supabase = stand-in for the trust's own datastore, pipeline live. No placeholders
   on screen, nothing sensitive actually leaked.
3. **Production** - up to the trust: their hosting, their auth, their database (or a direct
   SharePoint/Graph wire once IT grants an app registration).

### Architecture decisions (21 Jul)
- **SharePoint cannot serve the public site directly** - needs an Azure AD app registration
  + trust IT admin consent = a Production-stage decision. Same applies to upgrading the
  site gate to NHS auth. Neither can/should happen by the 30th.
- **⛔ AND THE PUSH ROUTE IS ALSO CLOSED (checked 27 Jul).** The site cannot PULL from a
  private SharePoint library without credentials, so the obvious workaround was to have
  SharePoint PUSH instead: a Power Automate flow runs inside the tenant as Mike, already has
  permission to read the library, and needs no app registration. **Mike's licence is "Power
  Automate for Office 365" - Standard connectors only. Premium and Custom connectors are both
  unavailable, and the HTTP action is premium.** So a flow cannot call out to wardHub or
  Supabase at all. No standard connector reaches an arbitrary web endpoint.
  - **Surviving options, cheapest first, all deferred:** (1) check whether the tenant permits
    **anonymous "anyone with the link" sharing** - if it does, the site can fetch a published
    file directly with no auth and no licence (free, but NHS tenants usually disable it, and
    it is a governance conversation in its own right); (2) ask IT for the **Power Automate
    premium add-on** - a per-user licence ask, far smaller than an app registration;
    (3) **manual publish** - Mike pastes into a gated form in wardHub (the original plan);
    (4) full app registration at Production stage, which was always the real answer.
  - **Do NOT re-derive this.** The constraint is the licence, not the code.
- **Pipeline = SharePoint (authoring) -> Mike presses publish -> Supabase (site datastore)
  -> site renders server-side.** Repo holds ONLY scaffold/fetch code, zero guide content.
  Supabase write keys live in Vercel env settings, never in the repo or Claude's workspace.
  **The pipeline IS the privacy boundary** - internal-only content may only enter guides
  once it exists (until then Rule 4 holds).
- **Scope control:** the 66 existing guides STAY static (migrate later, on a schedule).
  Pipeline goes live for NEW guides; demo it end-to-end with 1-3 guides.
- **Fictional-detail rule (NOT cosmetic - load-bearing):** until trust auth + approval,
  anything published through the pipeline uses realistic-but-FICTIONAL internal details
  (e.g. a plausible fake nhs.net inbox). Keeps "no placeholders" AND "nothing leaked" both
  true, and keeps the Supabase governance answer bulletproof.
- **Supabase region:** verify the project is pinned to a UK/EU region (AWS London
  available); note it for the "where does the data live?" question.

### The "who gave you permission for policy info in Supabase?" answer (add to dev panel Q&A pack)
Supabase holds only: (1) derived publishable guide content - the same classification
already on the gated public site via Vercel/GitHub; (2) fictional demo data; (3) nothing
else. No policy documents, no PII, no internal contacts - policies stay on FOCUS/SharePoint,
Copilot reads them inside the tenant, only publishable output crosses out. Judo answer:
"No one - the demo is deliberately built so nothing in it needs permission. Real internal
detail and real patient data only enter when the trust approves hosting, signs the DPIA
and takes data-controller ownership. Getting through that gate properly is exactly what
I'm here to ask for." (Optica lesson: the wrapper before the data.) This collapses the
moment ONE genuinely internal item is actually in there - hence the fictional-detail rule.

### Claude-side (run early week of 21 Jul - Mike's SharePoint upload must land ~Mon 27/Tue 28 to beat ingestion lag)
- [x] **Audit - DONE 27 Jul.** Full write-up: `docs/nhs-ready/13-section-k-audit.md`.
      Result: **no trust-sourced file is tracked at all** (the dumps are already untracked,
      moved to `E:\Hub\temp\` and purged from history); all 41 tracked `docs/` files are
      Claude-authored. What remains is 4 blank forms in `public/` (no branding, no contacts -
      Mike's keep-or-pull call, my read is keep) and **33 real internal contact values in
      source comments** across bookmarks/index.ts (27), referral-workflows.ts (5),
      howto-guides.ts (1). Nothing renders live - the two "renders live" findings from the
      6 Jul audit are both confirmed fixed.
      - **⚠ Caught a trap:** this plan said the comment values were "already preserved in
        `_CONTACTS-INVENTORY.md`, outside repo". That file never existed;
        `E:\Hub\temp\internal-contacts.md` held only 3 of the 33. Running the purge against it
        would have destroyed 30 values. **Now rebuilt as a complete 33-value inventory** with
        file, line and owning entry - so the strip below is safe to run.
- [x] **Guide manuscript export script - DONE 27 Jul.** `scripts/export-guide-manuscripts.mjs`
      (`node scripts/export-guide-manuscripts.mjs`). Writes **68 staff guides + 29 patient
      leaflets** as markdown to `E:\Hub\guide-manuscripts\` (outside the repo) plus a
      `_MANIFEST.md`. Zero new deps - it shells out to the repo's own tsc to transpile the
      guide data, then renders each content shape (workflow / how-to / prompt guide /
      checklist / MHA checker / chip-bank builder). Patient leaflets are converted from
      `public/patient-guides.html`. Frontmatter carries category, guide type, traffic-light
      approval and the code path, so SharePoint can filter on them. **Re-runnable** - it
      overwrites the folder, so never hand-edit there; once uploaded, SharePoint is the
      authoring home. **MIKE: upload this folder** (see Mike-side below).
      - Two content gaps it surfaced: risk domain 6 ("Risk to a foetus, infant or child
        under 18") has an EMPTY risk list in `risk.ts` so it offers nothing in the app; and
        the patient-leaflet card still says "23 patient-facing guides" when there are 29.
- [x] **Purge - DONE 27 Jul.** No manifest files to delete (see audit - none tracked). All
      **33 Rule-4 comments stripped** from bookmarks/index.ts, referral-workflows.ts and
      howto-guides.ts; each file gained a header note saying what the pattern is and that the
      values live in `E:\Hub\temp\internal-contacts.md`, keyed by entry id (not line number,
      so it stays correct as files move). **No internal contact detail remains in the repo** -
      what is left is public: council lines, charities, IMHA providers, crisis numbers, which
      are real and meant to be used. Build clean, 32/32 tests pass.
      - Mike's decisions, 27 Jul: **keep the 4 public/ blank forms**; **no second history
        rewrite** for the stripped comments (internal extensions in a private repo, not PII).
      - **RESOLVED 27 Jul:** the S117 meeting request criteria named an individual in visible
        content as the provenance for the 7-day notice rule - the only named person rendered
        anywhere in the app. Mike's call: **soften to "approved by the Head of Service"**.
        Done. The name is preserved in `E:\Hub\temp\internal-contacts.md` (outside the repo)
        so the provenance is not lost. **No named individual now appears on screen.**
- [x] **History verify - DONE 27 Jul. Clean, no rewrite needed.** Checked all 91 commits since the
      6 Jul F1 rewrite: no dump/FOCUS/policy/contact folders added (the only new file matching those
      patterns is `src/components/ui/ContactText.tsx`, ours); no `@nhs.net` or trust-domain
      addresses introduced; none in the working tree either apart from the deliberate
      `michael.sharpe4` feedback mailto. Rule-4 placeholders are in place and intact - 50
      "Hidden in demo mode" entries across bookmarks, how-to guides and referral workflows, with
      **zero** leftover real-value comments beside them.
      **Known and accepted:** the 33 internal contact values stripped on 27 Jul (commit 73f22dd) are
      still in pre-27-Jul history. Mike decided against a second rewrite for those (finding E of
      `docs/nhs-ready/13-section-k-audit.md`) - the repo is private and the values are Trust-internal
      phone numbers, not patient data. Revisit only if the repo is ever made public.
- [PARK] **BUILD: mini publish pipeline** - **deferred past the 30 Jul demo (Mike, 27 Jul).**
      Two reasons: the automatic route needs a Power Automate licence he does not have (see
      Architecture decisions above), and **the site must behave on the day exactly as it does
      now** - no new wiring, nothing to fail on stage. The pipeline story is already told by
      the security/architecture video ("AI builds the shelves, the Trust writes the books"),
      and the 30th is a pilot pitch, not a technical acceptance test. Pick this up after,
      with the licence question answered. Original spec below.
      (1-2 sessions) - guide content JSON schema; server-side
      fetch + render path in the guide viewer for pipeline guides (static guides untouched);
      publish mechanism for Mike (gated publish form or Supabase dashboard paste); seed with
      1-3 new guides carrying fictional internal detail. Keys via Vercel env only.
- [x] **Supabase permission Q&A added to the dev panel - DONE 27 Jul (commit a31c632).** The judo
      answer was written up here but never reached the pack where it is needed. Q13-Q15 now cover:
      who gave permission (no one, and nothing in the demo needs it); where the data actually lives
      today (Vercel + a wired-but-dormant Supabase, keys in Vercel env only); and what internal
      Trust detail is in the demo (none - Rule 4 placeholders, real values outside the repo).
- [ ] **Verify/report the Supabase project region. ⏰ MIKE - cannot be done from the repo.** The
      project ref in `.env.local` does not encode the region. Supabase dashboard -> Project Settings
      -> General -> Region. Needed for the "where does the data live?" question and it is a
      `[confirm]` marker in the run-sheet; the answer needs to be UK/EU (AWS London is available).

### Mike-side (at work, by ~Tue 28 to beat ingestion lag)
- [ ] Upload manuscript folder + remaining source docs to SharePoint.
- [ ] Point Guide Builder + Policy Checker at the new manuscripts library.
- [ ] Rehearse demo end-to-end: policy -> Guide Builder draft -> SharePoint -> publish ->
      appears on live site (never touched GitHub/Claude) -> site editor -> traffic-light
      sign-off. Line to use: "Pipeline is live; back catalogue migrates on a schedule."

Related (parked for a quiet day, agreed 21 Jul - do NOT build yet):
- [ ] **Remotion explainer video** (~90s, for the 30 Jul meeting) - storyboard agreed:
      (1) Claude builds the empty scaffold, sees no patient data / trust docs, replaceable
      by any tool; (2) inside the Trust M365 boundary, Copilot agents read Policy Library /
      SOPs / partner forms -> draft guide slots into a shelf -> edited in the site editor ->
      traffic-light red-to-green sign-off; (3) all entered data stays inside the trust
      boundary (demo: Supabase; live: Trust infra), copy-out to SystmOne, NO arrow ever
      back out to Claude/any AI; (4) close: "AI builds the shelves. The Trust writes the
      books, checks them, and keeps them." Text-on-screen, no voiceover, NHS tokens,
      1080p mp4 played offline. Project lives at E:\Hub\wardhub-video (NOT in this repo).
      Frame as "the model at full build", not "running today".

## L. Content confirm pipeline: quiz + guides (agreed 27 Jul - AFTER the 30 Jul green light)
Do not start this before the sponsor meeting. If the pilot is approved on Thu 30 Jul, this becomes
the follow-up work on the quiz. Context: [[session-31-quiz]].

**Why it exists:** the 942-question bank was mined from an OFFLINE SNAPSHOT of the policy library
(`E:\Hub\Policy dump not for git hub\`, 483 files). Mike is updating the real policies. Once that
lands, the snapshot is stale and some answers may be wrong - not because the questions were badly
written, but because the source moved.

1. [ ] **Re-run the quiz sources against the refreshed library.** For each of the 117 documents
   cited in `src/lib/data/quiz/research-trust-*.json`, check whether the issue number or review date
   has changed. Where it has, re-read that section and confirm or correct every question citing it.
   Update `sourceDate`, and clear `reviewFlag` where the document has been reissued.
   Cheap way in: the `source` string on every question names its document, so group by source first
   and only re-read the documents that actually moved.
2. [ ] **Re-check the 5 omitted questions** (listed in `E:\Hub\quiz-policy-conflicts.md`). If the
   refresh resolves the seclusion debrief clock, the independent-review window, or the post-discharge
   follow-up contradiction, those questions can go back in.
3. [ ] **Change the wH Quiz Writer agent so it CONFIRMS as well as CREATES** (work-side, M365 Agent
   Builder - see Section J for how the agents are managed). Right now it only generates new questions.
   It needs a second mode: given an existing question plus its cited document, say whether the stated
   fact is still exactly what the current document says, and if not, quote the new wording. Without
   this, every policy refresh means re-reading everything by hand.
   Sketch of the added instruction: *"You have two jobs. CREATE: write new questions from the
   document. CONFIRM: when given an existing question and its source document, find the passage the
   question rests on and answer CONFIRMED (quote it verbatim), CHANGED (quote the new wording and say
   what the answer should now be), or NOT FOUND (say where you looked). Never guess a number. Never
   mark CONFIRMED from memory - only from the document in front of you."*
4. [ ] **Point the same CONFIRM mode at GUIDE content (Mike, 27 Jul: "great idea").** Bigger prize
   than the quiz. A wrong quiz answer is a bad revision session; a wrong guide is someone doing the
   job wrong at 3am. Same staleness problem, same fix, but the guides need one thing built first:
   - **Blocker: guides do not record which document each fact came from.** `GuideData` has
     `focus?: {label,url}[]` (a link to the policy on FOCUS) and some guides carry `[#n]` inline
     reference markers, but there is no machine-readable "this fact came from document X, issue Y,
     review Z". The quiz has exactly that (`source` + `sourceDate`), which is why a confirm pass on
     the quiz is straightforward and on the guides is not.
   - **Do first:** add a `sources?: { doc: string; issue?: string; reviewDate?: string; steps?: number[] }[]`
     field to `GuideData` mirroring the quiz shape, and backfill it for the trust-sourced guides
     (the `focus` links already name most of the documents, so it is a fill-in not a research job).
     `steps` lets a CHANGED verdict point at the step that needs editing rather than the whole guide.
   - **Then:** run the agent guide by guide - it reads the current policy, checks each step's factual
     claims, and returns CONFIRMED / CHANGED (with the new wording) / NOT FOUND per step.
   - **Best bit - wire it to the traffic light.** `GUIDE_APPROVAL` in `src/lib/data/approval-status.ts`
     is a manual green/amber/red map. A CHANGED verdict on a green guide should knock it back to
     amber automatically with a note saying which step and which document moved. That turns the
     traffic light from "Mike checked this once" into "checked, and still true as of the current
     policy" - which is the thing that makes the sign-off meaningful to a sponsor.
   - Guides most worth doing first (heaviest trust-policy content): seclusion-support-plan,
     restraint-monitoring, observation-engagement, section-132, section-17, dols, awol,
     leave-discharge-transfer, admission-checklist.
5. [ ] **Decide the sign-off model for /quiz** - it carries no traffic-light StatusBadge yet, unlike
   the guides. If a nurse can be told "this is what our policy says", it probably needs one. Falls
   out naturally if item 4 lands, since the same confirm verdicts can drive it.

---

## M. Task handover + Overview review screen (SPEC, designed 27 Jul 2026 - not built)

Design session with Mike, 27 Jul. Nothing built yet. This section is the agreed spec.
Trigger: Tess Martin (QI lead) asked for a comments/update field on tasks so staff can say
what is happening. Mike's two objections, both right: (1) the update becomes a record that
never reaches SystmOne, (2) nobody follows up from the note. So the answer is NOT a notes box.

### The problem in one paragraph
There is no supported way to hand a half-done job back. Walk it as a band 5 at 21:15 with a
part-finished referral: **Mark Complete** lies (and falsely clears a discharge barrier);
**leave it claimed** hides it (My Diary hides ward tasks claimed by others, so the next shift
never sees it); **Drop** forgets it (no trace it was ever started); **edit the description**
is the PII leak; **make a new task** loses the barrier's age. Every route lies, hides or forgets.

### Decisions locked
- **Structured only. No free text anywhere in the handover.** Not a compromise - it is the
  reason the feature is defensible. Nothing to type means nothing clinical can land in the
  wrong record.
- **No separate list, no new place.** Jobs stay in the diary. Waiting is a badge and a filter,
  exactly like `blocksDischarge` is today (which also has no page of its own).
- **No referral tracking.** Mike's call, and correct: on a ward some services track their own
  referrals and just turn up (dietitian), others go silent forever (housing). Trying to track
  both makes work for the first and still misses the second. Replaced by the ward-round review
  below, which rides a ritual that already happens daily instead of inventing a new one.
- **No shift-based handover screen.** Tasks are a continuous 24h pool people dive in and out of.
  Handover fires when the person leaves the job, not when the clock says so.
- **Take over stays silent.** The person losing it is not notified. The history line is the record.
- **Patient tasks + appointments only** for this work. Team/ward shift tasks are a separate
  question - see "Open" below.
- **Drop the `in_progress` status entirely** (27 Jul). It only ever meant "I claimed this and
  dragged it to a column" - self-declared, no use to anyone else, and wiped at handover anyway.
  The hand-back states replace it and say far more. Two things now cover everything it did:
  *claimed by someone* = they are on it right now, do not duplicate; *handed back with a state*
  = someone has been on it and left it in a known condition. The badge on the card is the hint
  that this is not a brand new job.
- **"Chase" is the waiting subset only, not the umbrella.** It means one thing - waiting on
  someone, needs a nudge - and does not describe a half-filled form or a job blocked on a
  consultant decision. Right word for the action button and the waiting badge, wrong word as a
  collective noun. No umbrella name needed: the card shows the actual state, which is more
  specific than any collective noun.
- **My Jobs kanban columns become To do / Waiting / Done** (was Not Started / In Progress /
  Completed). Your own "in progress" column was never information anyone needed; splitting out
  what you are waiting on declutters the list and shows what to chase.

### 1. Hand-back sheet (the core build)
Split today's Drop into two actions: **Drop** (claimed by mistake, silent, as now) and
**Hand back**, which asks three things, all dropdowns, all one tap:

1. **What state is it in?** Not started / Part done / Waiting on someone / Blocked / Done but needs checking
2. **What's next?** Chase it / Send the form / Make the call / Needs a decision / Just carry on
3. **Where does it go?** Back into today's pool / Schedule for a day / Keep it with me
   (Mike: let the user decide. This is free - they are already answering it.)

Reached from two doors, one component: the job diary, and the end of a patient-linked guide
(alongside "mark complete", add "not finished" opening the same sheet).

### 2. Waiting on
- Picking "waiting on someone" asks **who**, then schedules the job forward to a chase date.
  So waiting needs no machinery of its own: it is a reason plus a date, reusing the scheduling
  from question 3. Keeps un-actionable jobs out of today's pool while staying visible.
- Same weight as barrier to discharge (Mike): badge on the job, count on the patient, filter
  and column in Overview. Shows age, e.g. "waiting on housing, 11 days".
- **The dropdown** (grouped; six most-used pinned; ward-editable in the same way ward settings
  already does `customAlerts`). Mike's ten plus the services the guide catalogue refers to:
  - *Ward and trust:* doctor/consultant, named nurse, MDT/ward round, pharmacy, bed management,
    MHA office, safeguarding team, estates, IT
  - *Therapies and physical health:* OT, physiotherapy, dietitian, SALT, psychology/DBT,
    tissue viability, dental, GP or acute hospital
  - *Community and social:* social care/MASH, housing, CPN/care coordinator, CMHT, Early
    Discharge Team, placement or care home, funding panel/CHC, benefits/DWP
  - *People and logistics:* family/next of kin, the patient, advocacy (IMHA), transport,
    interpreter, police
  - *Other* -> prompt "Document this in SystmOne" (the one case that cannot generate a
    specific case note, so it hands the writing back to the person)
  - Forensic/probation deliberately excluded (Mike's parked decision).

### 3. Case note out, even when incomplete (Mike's requirement)
The structured answers generate a copy-paste SystmOne line **whether or not the job is done**.
Nobody types anything and a progress update still reaches the clinical record. Reuses the
existing guide clipboard machinery (auto-fills date, patient name, staff name - snag 94).
- *Part done:* "Housing / Duty to Refer: form started, not yet sent. Returned to the ward jobs
  list for completion. S Johnson, 27/07/2026."
- *Waiting:* "CPN invited to ward round. Called 27/07/2026, no answer. Awaiting response from
  CPN, to chase 29/07/2026. S Johnson."
- *Blocked:* "Social care referral cannot proceed, needs a consultant decision. Escalated to
  MDT. S Johnson, 27/07/2026."

**The IG answer, have it ready:** prose in SystmOne for the clinical record, structured state in
wardHub for the workflow. Different shapes, not duplication. The job history keeps the state
even if the paste never happens.

### 4. Task history (append-only)
Every claim, hand back, take over, state change, reopen and reschedule writes who / when /
what / structured reason. Small timeline in the task detail modal. The events already fire
(see `tasks-provider.tsx`), they are simply not kept. Also makes Reopen non-lossy - it
currently wipes `completedBy`/`completedAt` outright.

**Hand-back count on the card** (27 Jul, cheap once history exists). A job handed back four
times is going round in circles - exactly the failure in Tess's "no answer, try again tomorrow"
example. Surfacing "4th time round" on the card makes it visible in ward round, and it demos well.

### 5. `/overview` becomes the one place - BUILT 27 Jul (session 41)
**Mike's verdict on the 22 Jul `/overview` + the reports page: "buries the useful bit, and it is
not clear it offers any of the features we discussed - the daily review / MDT feels like an
afterthought."** Rebuilt this session. What shipped:
- **Menu:** "Trust Overview" -> **Overview**, now FIRST in the More dropdown (desktop + mobile).
  "Progress Reports" removed from both menus; `/reports` is a redirect stub to `/overview`.
  Patients page button relabelled Reports -> Overview.
- **Lands on the work, not a wizard.** The old two-stage "pick a scope -> Generate Report" gate
  is gone; the screen opens on the patient list with the default scope already applied.
- **Trust-wide barriers roll-up DROPPED ENTIRELY** (Mike's call, 27 Jul - it was the thing doing
  the burying). The ward league table, "most common barriers" and blocked-patient list from the
  22 Jul build are gone. Barrier data survives everywhere it is actually useful: the headline
  strip, the per-patient count, the per-job badge, the barriers-only filter and the new
  barrier-flag toggle. `CareReviewRollup` also dropped from this screen (still used on /patients).
- **Scope:** the three pickers kept, compacted into one bar. Defaults to **single ward with the
  user's own ward preselected**; when the ward is unknown nothing is preselected and the screen
  asks for one rather than silently showing Byron (the old code defaulted to `activeWard ||
  "Byron"` AND mismatched the select's lowercase option values, so the dropdown lied).
- **Three review stamps per patient** - MDT / rapid review / named nurse. One tap each, records
  who and when, tap again same-day to undo. Chips age green -> amber past each stamp's interval
  (MDT 7d, rapid 1d, named nurse 14d). New `src/lib/data/patient-review.ts` (localStorage,
  same pattern as `care-review.ts`). New **"Stamp all shown"** row for the rapid-review case, a
  **"Not reviewed today"** filter to work down to an empty list, a **Reviewed** column in the
  table (sortable) and a **reviewed-today** headline counter. This is the assurance metric
  falling out for free - no extra data entry.
- **Inline job actions, one tap, no modals.** Outstanding: Complete, Flag/unflag barrier to
  discharge. Completed: Reopen (keeps the date), Redo (expands a date picker in place and
  reopens with the new date - Mike's "reopen the old job with a new date", not a new linked job).
  All route through the existing provider so the diary, kanban and every count stay in step.
- **Counters are filters.** Tapping Total / Outstanding / Overdue / Done on a patient tile
  narrows that patient's job list; tapping the same count in the table opens the row already
  filtered. Plus a one-tap "N jobs blocking discharge - show just these" on any blocked patient.
- **Governance fix caught on the way:** `/overview` was never in `FULL_ONLY_PREFIXES` in
  `src/proxy.ts` despite rendering patient names since 22 Jul. Added. Dormant either way while
  `COLLAPSED_FOR_DEMO=true`, but it would have leaked PII into the limited build the moment the
  v1/v2 split was restored.
- Verified in-browser end to end (stamp persists + headline recount, complete, redo with a new
  date, counter filters in both views, /reports redirect, menu order). Build clean, 32/32 tests.
- **Still open from the spec below:** the hand-back sheet (section 1), waiting-on (2), case note
  out (3), task history (4), retire the chase log (6). The stamps landing makes 4 more valuable -
  hand-back count on the card needs history.

**Original spec kept below for reference.**

Merge `/reports` into `/overview` and retire the reports page as a separate thing. Reports
already has the right bones (patient rows expandable to jobs, filters, sort, priority colours,
barrier badges, tile/table toggle) - it needs a scope selector and the rows need to become
actionable. `/overview` today is only a read-only trust-wide barriers roll-up.

- **Scope, all filter-based:** one patient / one ward / one ward professional's patients /
  whole trust. Tile-card and table toggle as now.
- **Modes:** ward round (one patient at a time), rapid review (all patients, compact rows),
  meeting. Same screen, same actions - the mode changes density and which stamp is offered.
- **Entry point** from the patient card ("Review this patient") deep-links into the same screen
  scoped to one patient. Two doors, one screen.
- **Inline actions on each job row. Speed is make-or-break** - ward round is fast and someone is
  already typing into SystmOne. One tap, no modals, no confirmations; anything needing a
  follow-up choice expands in place.
  - *On completed jobs:* reopen, redo, chase, confirm completed
  - *On outstanding jobs:* no longer needed, mark urgent, mark barrier to discharge
  - *On waiting jobs:* still waiting, chase again, it has come back (close), escalate
  - **Chase = the waiting state**, reached from ward round instead of the hand-back. Same state,
    same badge, same column. These are one feature with two doors, not two features.
  - **Redo** = reopen the old job with a new date (Mike), not a new linked job.
  - **Anyone can do any of it** (Mike). Optional reason dropdown, skippable in one tap:
    *no longer needed* (done elsewhere / patient discharged / MDT decision / duplicate / no
    longer indicated); *reopen* (wasn't actually done / needs doing again / new information).
- **Three stamps**, per patient not per job, worded as an attestation rather than a tick:
  MDT, rapid review, named nurse review. E.g. "Jobs list agreed as current. MDT, 27 Jul."
  Free by-product: a report of patients not seen by their named nurse in two weeks, or not
  through rapid review since Friday. Real assurance metric, one tap.
- **"Reviewed, no changes"** single tap when nothing needs doing, so the stamp still lands.

### 6. Retire the chase log - DONE 27 Jul (session 41)
`/referrals/log` + `referral-log-provider.tsx` + the "Log to Chase Log" button on the referral
completion screen all go. It was built early, has one entry point (a button in the `/guides`
header), only fills if someone opts in, and is per-browser localStorage - which is why neither
of us remembered it existed. Its one useful behaviour ("referral sent to X on date Y") becomes
a job in the waiting state. Its three free-text fields die with it, which is what makes the
structured-only rule true across the whole product.
Types to remove or repurpose: `ReferralLog`, `ReferralChase`, `ReferralLogStatus`.

### 7. Demo data top-up for `/overview` - DONE 27 Jul
Built and verified. `/overview` now reads: **25 active patients, 12 blocked, 25 open barriers,
3 overdue** - Dickinson 9 (2 overdue) / Keats 7 (1 overdue) / Shelley 4 / Wordsworth 3 / Byron 2.
Nine realistic blocker types (housing, placement search, funding panel, social care assessment,
care home visit, transport, S117 aftercare, CMHT allocation, package of care), reused across wards
so the "most common barriers trust-wide" list ranks properly instead of showing all 1s. Barriers
stack on a few patients (Bernard Lowe has 4), so blocked-patient count differs from barrier count
on every ward. Dated 3-14 days out plus 3 deliberately overdue, so today's diary stays clear;
`createdAt` runs back up to 26 days so age is there when the screen wants it.
- **One knob:** `BARRIER_PLAN` in `src/lib/data/tasks/index.ts`. `blocksDischarge` was removed
  from `PATIENT_TASK_TEMPLATES` so that plan is the ONLY source of barriers and the numbers stay
  exactly what it says.
- **Worth knowing:** the wards hold 5 patients each (25 total), not the 100 this spec assumed -
  `PATIENT_NAMES` was cut to 5 per ward ("Mike: 5 max per ward"). So 12 blocked is roughly half
  the demo trust. It reads fine as "a trust with a discharge problem", which is the story the
  screen is for, but drop a few rows from `BARRIER_PLAN` if it looks overstated in the room.

**Original spec kept below for reference.**

Wanted for the **Thu 30 Jul** sponsor demo. Standalone: touches only the generator in
`src/lib/data/tasks/index.ts`, so it can ship on its own without any of Section M being built.

**Current state (why it looks thin):** two of the ~20 `PATIENT_TASK_TEMPLATES` carry
`blocksDischarge` ("Discharge planning meeting", "Social worker referral") and may or may not be
reached, plus `generatePatientTasks` guarantees exactly one extra barrier per ward, dated
tomorrow with `createdAt` = today. Result: five wards showing near-identical small numbers, all
created today. Flat and young, the least interesting version of that screen.

**What to change:**
1. **Make the wards uneven.** One ward clearly worst, e.g. Dickinson 9 / Keats 7 / Shelley 4 /
   Wordsworth 3 / Byron 2. "Dickinson 9, Byron 2" prompts the question you want asked in the
   room; five wards on 2 each prompts nothing. Exact spread is one line to change.
2. **Use real blockers, not just "discharge planning meeting".** Housing referral, placement
   search, funding panel / CHC decision, social care assessment, transport, care home
   assessment. These are what actually holds discharges up and they land with a sponsor audience.
3. **Spread across more patients** (target roughly 12-15 of the 100 blocked) so the
   blocked-patient count means something rather than tracking the barrier count.
4. **Date them 3-14 days out**, so they populate `/overview` without filling today's diary
   (Mike's constraint). Deliberately make **two or three overdue** so that column is not zero.
5. **Vary `createdAt`** back a few weeks on the older ones, so age is available to the screen
   later without regenerating anything.

**Limit to be aware of:** `/overview` can only show what is built. Today that is barrier count,
blocked-patient count and overdue per ward. The waiting ages ("waiting on housing, 11 days")
need the Section M work, so if none of that ships by Thursday the data cannot show it.

### Bugs this exposes (fix as part of the build)
- **Drop does not touch status** (`tasks-provider.tsx` claimTask): a dropped job keeps
  `in_progress`, so an unclaimed job can sit in the pool displaying as in progress.
- **Claim and Take Over reset `in_progress` -> `pending`**: the one signal that someone got part
  way is deleted at the exact moment of handover.
- **Tasks do not persist at all.** `tasks-provider.tsx` is plain `useState` seeded from
  `ALL_DEMO_TASKS`, so the diary resets on every refresh. The retiring chase log was the only
  work record that survived a reload. Decide persistence before any of this is demo-able.

Note: dropping `in_progress` (see Decisions locked) dissolves the first two rather than fixing
them - but only if the kanban, `TodayWidget`, `PatientTasksModal`, `StaffTasksModal`, `/reports`
and the demo generator are all migrated off the status at the same time. Grep `in_progress`
before starting: it is referenced in about a dozen places.

### Open
- [ ] **Team/ward shift tasks: what happens when one is not completed that shift?** Mike thinks
  something was already built. There is a `carryOver` flag on `WardTask` and a per-category
  carry-over setting in ward settings, so a mechanism exists - check whether it actually works.
  Separate session.
- [ ] Confirm the exact stamp wording ("current state of play" vs the draft above).
- [ ] Sponsor demo is Thu 30 Jul. This is a multi-session build. **Before Thursday, do section 7
  (demo data) only** - it is standalone and it is the one thing that visibly improves the demo.
  Everything else here is post-meeting work. If there is time beyond that, the smallest useful
  slice is the rapid-review screen with a few actions live.
- [ ] Follow-up line to Tess once agreed - the generated case note answers her original ask
  better than the reply already sent.

---

## N. Session 41 job list (Mike, 27 Jul 2026 - evening)

Mike's list for the session, merged with the outstanding items it overlaps. Status as at the
end of the session.

### Overview (was "the big issue")
- [x] **Rebuilt** - see Section M item 5 above for the full write-up. Renamed to Overview, first
      in the More menu, Progress Reports retired, roll-up dropped, scope defaults to the user's
      ward, review stamps, inline job actions, clickable counters.
- [x] **Follow-up niggles (same session):** standing Barriers-only YES/NO switch on the tile
      counter row and in the expanded table row (was only a banner once filtered, so you could
      not tell which state you were in); acting on a job no longer makes it vanish from under
      you (`useStickyActions` pins anything you touch, and a cleared barrier stays visible with
      a "barrier cleared" tick); clicking a job opens the full `TaskDetailModal`, same as the diary.
- [x] **Barriers-only filter drives the per-patient toggles. DONE 27 Jul.** Page-level Barriers-only
      (and Waiting-only) now sets every patient tile to the same lens via a `pageLens` prop; each tile
      stays individually overridable afterwards. Original note:
      Turning the page-level Barriers-only filter ON should also switch ON the barriers-only toggle
      on each patient, rather than leaving the two controls out of step. Currently the page filter
      and the per-patient switches are independent, so you can be filtered to barriers at the top
      while individual patients still show everything. Presumably the per-patient toggles should
      follow the page filter and stay individually overridable afterwards - confirm that reading
      with Mike before building.

### Site-wide
- [x] **Copy-to-clipboard on every phone number and email address.** New `CopyChip` +
      `ContactText`/`renderWithContacts` in `src/components/ui/`. Done by DETECTION, not by
      tagging contacts in the data, so guides written later or edited in the site editor get it
      for free. Covers how-to step content and tips, referral step content, referral submission
      methods, `/links` bookmark phones and service-map contacts. Detected contacts also become
      `tel:` / `mailto:` links. Detection is strict (UK 10-11 digit starting 0, or 116 123);
      audited across all of `src/lib/data` - **87 distinct real numbers, zero false positives**
      from dates, doses, policy or section numbers. Side benefit: referral step content now runs
      through the same renderer, so bare URLs are clickable there too (wanted in Section C for
      the domestic abuse guide).

### Guides
- [x] **Case-note copy confirmation.** Both case-note boxes (referral casenote step and the
      how-to completion card) now change state on copy - amber to emerald, a "Copied" badge on
      the box, header text changes to "Copied - paste it into the patient's notes", `aria-live`
      for screen readers. The box is what you are about to paste, so that is where the
      confirmation belongs; the button alone was not enough.
- [x] **"+ Add follow-up task" now opens the real Add Task screen, pre-filled.** It used to
      silently create a task 7 days out that you never saw and could not change (Mike: "doesn't
      visually do anything on the screen"). **`AddTaskModal` was extracted out of
      `src/app/tasks/page.tsx` (~900 lines) into `src/components/modals/AddTaskModal.tsx`** so
      the diary and the guides share ONE Add Task screen rather than growing a second one. New
      optional `prefill` prop (`AddTaskPrefill`) carries what the guide already knows: linked
      patient, "Follow up: <guide title>", category, linked guide, date +7 days. Everything stays
      editable before saving. If no patient is linked yet, the patient picker asks first and then
      hands straight over. Confirmation line on save. Diary Add Task verified unchanged.
      - Note: `formatDate` in `tasks/page.tsx` was a duplicate of `toLocalDateStr`; the extracted
        file uses the shared util.
- [x] **Guide question answers must reach the case note. AUDIT DONE + ALL FIVE FIXED 27 Jul.**
      Every guide that asks a question with answer options was traced from
      the answer through to the end-of-guide clipboard text. Snag 92-95 was only half true: the
      **area** answer works everywhere, the **consent** answer works nowhere.

      **Where the answers are captured:** `src/app/guides/[id]/page.tsx` holds four bits of state -
      `criteriaConfirmed`, `patientConsent`, `patientSection`, `selectedArea` (lines 224-227), and
      `generateCaseNote()` (line 279) is the only place they can reach the clipboard.

      **WORKING (no action):**
      - **Area (city/county) - 4 of 4 workflows.** `imha-advocacy` builds a bespoke note naming the
        right provider and email; `safeguarding`, `safeguarding-children` substitute
        `[DERBY CITY/DERBYSHIRE COUNTY]`, `homeless-discharge` substitutes `[DERBY/COUNTY]`.
      - **Legal status in `imha-advocacy`** - bespoke branch writes "Patient is informal (voluntary)"
        or "Patient is detained under <section>".
      - **`leave-discharge-transfer`** - the 3-way pathway choice titles the ChecklistSummary.
      - The builders (MSE, care plan, risk assessment, admission checklist) assemble their output
        from the selections themselves, so they cannot drift. The 6 pure-guidance `GuidePrompts`
        tools have no output by design (Session 27) - out of scope.

      **BROKEN - N1. Consent answer never reaches any case note (4 workflows).** `patientConsent`
      is used only to colour the buttons and to unlock Next (`canProceed`, line 313). It is never
      read by `generateCaseNote()`. So:
      - `imha-advocacy` - note has no consent sentence at all, despite asking.
      - `safeguarding` - `Patient [WAS/WAS NOT] informed of referral.` left literal.
      - `safeguarding-children` - `Parent [WAS/WAS NOT] informed.` left literal.
      - `ctr-dsp` - `DSP consent [OBTAINED/PENDING].` left literal.
      - ⚠️ **Needs Mike's call before the fix:** in the two safeguarding guides the question asked is
        *"did you get consent"* but the placeholder records *"was the patient/parent informed"*.
        Those are different facts - a straight substitution would put something untrue in the record.
        Consent and informing need either two questions or a reworded note.
      - ⚠️ `ctr-dsp`'s consent step defines no yes/no labels, so it falls back to the generic
        "Consent Obtained" / "No Consent", which does not map onto Obtained/Pending.

      **BROKEN - N2. `social-care` throws its answer away.** It asks the S117 question but its case
      note has no `[SECTION]` placeholder - in fact `[SECTION]` appears in **zero** clipboard strings
      repo-wide, so the substitution at line 301 is dead code outside the IMHA bespoke branch. Two
      further problems with the same step: it asks a yes/no-shaped question ("is the patient under
      S3, **or have they been in a previous admission**") but renders the generic 10-option MHA
      status list, so "previously on S3" cannot be expressed at all - and that is exactly the case
      S117 entitlement turns on (see memory `s117-two-meetings-rule`). The S117-vs-standard pathway
      described in the step content drives nothing: no forms, contacts or note text change.

      **BROKEN - N3. `homeless-discharge` asserts a fact it never asked for.** Its note hardcodes
      "Patient consent obtained." and the workflow has no consent step.

      **BROKEN - N4. Chase log ignores the area answer.** `handleLogReferral` (line 368) takes
      `sub.methods[0].label` regardless of `selectedArea`, so a county safeguarding referral is
      logged as sent to the Derby City team. 28 area-tagged submission methods are affected.

      **GAP - N5. `mha-checker` has no case-note output at all.** The pathway choice and the whole
      scrutiny checklist are ticked and then lost. Obvious candidate for a ChecklistSummary.

      **WHAT WAS BUILT (Mike picked both recommended options):**
      - **New pattern: the step owns its case-note wording.** New `consentYesNote` / `consentNoNote`
        on the consent step, swapped into a `[CONSENT]` placeholder. The viewer never invents
        clinical phrasing, and an unanswered question leaves its placeholder visible rather than
        guessing - a blank is obvious in a note, a wrong assertion is not. Documented in the guide
        editor's consent panel so editors can use it.
      - **N1 consent (two questions).** Consent and informing are now asked separately, on the same
        screen (`informedQuestion` + `[INFORMED]`), so the note can say both truthfully. Next is
        gated on both. Applied to `safeguarding` and `safeguarding-children`; `imha-advocacy` gained
        a consent sentence in its bespoke note; `ctr-dsp` got real Obtained/Pending labels feeding
        `DSP consent [CONSENT]`.
      - **N2 social-care.** New `s117` step type with three options (on S3 now / previously on S3 /
        no qualifying section) plus `S117_OPTIONS` and an `entitled` flag. Picking one shows a
        pathway callout that spells out the aftercare meeting vs the discharge planning meeting, and
        `[S117]` writes a full sentence into the note. The old generic MHA picker could not express
        "previously on S3", the case entitlement actually turns on.
      - **N3 homeless-discharge.** Consent split out of the criteria tick into its own step. The
        note no longer opens with "referral submitted" - that clause moved into the consent wording,
        because a declined Duty to Refer means no referral went in at all. Declining now reads
        "Patient declined, so no referral was made. Housing contact details were given..." instead
        of contradicting itself.
      - **N4 chase log.** `handleLogReferral` filters submission methods by the chosen area.
      - **N5 mha-checker.** ChecklistSummary added - pathway name plus ticked/outstanding scrutiny
        items.
      - Verified in the browser end to end on all five guides (safeguarding no-consent-but-informed,
        social-care previously-on-S3, IMHA declined consent, ctr-dsp pending, homeless declined) and
        the chase-log entry confirmed as "Derbyshire County". Build clean, 32/32 tests pass.

      Overlaps Section C "capacity assessment guide - make interactive" (choices should alter the
      case-note output).
- [ ] **⚠️ CONFIRM WITH MIKE - can a Duty to Refer go in WITHOUT consent?** Mike (27 Jul): "I
      thought we send in their best interest but need to check." The N3 fix above assumes it cannot,
      and the guide now tells staff that a declined referral means no referral is made. **If that is
      wrong it is wrong in a live guide, so this is the first thing to settle.** What is (fairly)
      certain: s.213B Housing Act 1996, inserted by the Homelessness Reduction Act 2017, frames the
      duty to refer around the person's consent - they must agree to the referral and to which
      housing authority it goes to. What is NOT settled and needs Mike/the trust to confirm: whether
      a best-interests referral under the MCA is made where the patient **lacks capacity** to
      consent (a refusal by someone with capacity is a different thing from an inability to
      consent), and whether local practice refers anyway on safeguarding or vital-interests grounds.
      If best-interests referrals do happen, the consent step needs a third option
      ("Patient lacks capacity - referred in their best interests") with its own case-note wording,
      not just yes/no. Do not flip the guide wording on my reading alone - Mike to check against
      trust policy / the housing team.
- [x] **Break up text-heavy guides with progressive disclosure. DONE 27 Jul on the S117 guide,
      built as a reusable pattern so 3.5 is cheap.**
      - **`ProgressiveContent`** (`src/components/guides/ProgressiveContent.tsx`) splits a step's
        content into collapsible sections: header always visible, first line as a one-line teaser,
        full body on click, plus Expand all / Collapse all. **Sections are derived from the text,
        not from new data fields** - the guides already write headers as a short line ending in a
        colon with bullets underneath, so the splitter keys off that. Anything before the first
        header stays visible as an intro (it is the "why you are reading this" paragraph). Switching
        it on for a step is one flag, `progressive: true`. A step whose content has no headers falls
        back to the old flat rendering, so the flag is always safe to set.
      - **`CriteriaWalker`** (`src/components/guides/CriteriaWalker.tsx`) + the `CriteriaWalk` type
        (`src/lib/data/guides/criteria-walk.ts`): a data-driven question tree in the accessible base
        Modal, with Back, Start over, and colour-toned outcomes (yes / no / go and check). Attaches
        to a named section via `walk.section`, so the trigger button renders inside that section.
      - **`S117_QUALIFY_WALK`** wires "Does my patient qualify?" into the *Who qualifies* section of
        the S117 guide. Two questions: qualifying section in THIS admission, then in ANY previous
        admission. Five outcomes, including the two "I am not sure" routes which send you to the MHA
        Office rather than letting an unknown history be treated as a no. The previous-admission
        outcome states both halves of the two-meetings rule (see memory `s117-two-meetings-rule`).
      - Deliberately NOT persisted and NOT part of the case note - it is a thinking aid, and the
        entitlement decision belongs to the MHA Office.
      - **REDONE as a flowchart (Mike, same evening): "the pop up doesn't make it any clearer -
        just took the earlier text and asked the same again".** He was right: v1 asked the questions
        one at a time and revealed an answer at the end, which restated the rules instead of showing
        them. It is now a diagram, visible in full the moment it opens - both questions, every
        branch, and the landing box under each branch before you pick it (Yes -> "S117 applies",
        No -> "Go to question 2"). Answering rings your choice and fades the rest so the path is
        visible; question 2 stays dimmed until question 1 is answered No. Visual language matches
        the section-papers checker (`/guides/mha-checker`) as Mike asked - bordered tiles, ring on
        the live choice, muted everything else. Question wording cut to one line each
        ("Is the patient on Section 3 in THIS admission?"), with the fuller section list as help
        text. New `CriteriaAnswer.minor` keeps the "I am not sure" escape hatches off the spine as
        small links so they survive without cluttering a yes/no diagram, and `CriteriaOutcome.short`
        carries the box label.
      - Verified in browser: four sections split correctly, walker reachable, both qualifying
        outcomes and the no-duty outcome correct, Back/Start over work, non-progressive guides
        unchanged. Build clean, 32/32 tests pass.
      Overlaps Section C (`domestic-abuse-guide` text density).
- [x] **Sweep all guides for the same opportunity. DONE 27 Jul - 23 steps across 13 guides.**
      Scanned all 282 steps with content (120 referral-workflow, 162 how-to) for the
      "header + bullets" shape at 350+ characters with 2+ headers.
      - **Referral workflows: only ONE candidate repo-wide** (the S117 step, already done in 3.4).
        Their steps are short and single-purpose, so there is nothing to sweep there. The density
        problem is entirely in the how-to guides.
      - **How-to guides: 29 candidates, 23 flagged.** `progressive?: boolean` added to `GuideStep`
        and wired into the how-to branch of the viewer (`size="base"` so it renders at body size,
        and the splitter now treats both `•` and `- ` as bullets).
      - **Flagged:** mha-statuses (4 - holding powers, CTO, forensic sections, patient rights),
        domestic-abuse-guide (3), online-safety-children (4), abc-chart (1 - the Datix workflow),
        peer-conflict-guide (1), honour-based-abuse (1 - FGM), non-recent-abuse (2), child-in-need
        (2), safeguarding-adults-referral (1), safeguarding-children-referral (1), faith-belief-abuse
        (1), send-safeguarding (1), special-guardianship (1).
      - **Deliberately NOT flagged (6)** - hiding these would cost more than the tidiness is worth:
        `domestic-abuse-guide` step 5 and `honour-based-abuse` step 4 are short DO / DO NOT safety
        guidance; `abc-chart` steps 3, 4 and 5 are sequential teaching where the worked example is
        the entire point of the step; `peer-conflict-guide` step 1 (Levels of Conflict) is a
        comparison you need to scan side by side - **it is a better candidate for a CriteriaWalker
        ("which level is this?") than for collapsing**, worth doing when the walker gets reused.
      - **Bug caught by the sweep, fixed in the component:** guides often close with a standalone
        line belonging to the whole step, not to the last header - three of them were
        **"call 999" lines**, which the naive split filed inside a collapsed section. `splitIntoSections`
        now peels trailing prose off the last section into an `outro` rendered in the open. Verified
        across all 23 steps: 7 outros correctly kept open (including all three 999 lines), 0 steps
        left with an empty or single section. Build clean, 32/32 tests pass.
- [~] **Update the guide-building agents. REPO SIDE DONE 27 Jul - ⏰ ONE PASTE JOB LEFT FOR MIKE.**
      Two new blocks written into the Guide Builder prompt so new guides arrive in the shape the
      new components need, instead of as long prose someone has to restructure by hand:
      - **STRUCTURE FOR PROGRESSIVE DISCLOSURE** - what a header line is (short, own line, ends in a
        colon, 70 chars max, not a bullet), bullets underneath, intro before the first header stays
        visible, two headers minimum or leave it as prose. **And the rule the sweep taught us:** any
        line that applies to the whole step - above all a 999 line, a legal deadline or a safety
        warning - must be the LAST line, after the final bullets, or it gets filed under the
        preceding header and hidden behind a click.
      - **DECISION FLOW** - a paste-ready block format (ATTACH TO SECTION / BUTTON / TITLE / Q1 with
        HELP and YES / NO / NOT SURE routes / OUTCOME with TONE, SHORT, TITLE, DETAIL, ACTIONS) that
        maps straight onto `CriteriaWalk`, so a "who qualifies" or "meets criteria" section comes
        back as a flowchart rather than rules the nurse has to apply themselves. Rules baked in:
        max 3 questions, question fits one line with the detail in HELP, **ask what HAS HAPPENED not
        what is true now** (the S117 "on Section 3 now" error - a rescinded section still counts),
        and every question needs a NOT SURE route so an unknown can never read as a no.
      - The take-to-work kit also gained two worked examples (a long step showing where the 999 line
        goes, and the live S117 decision flow) and four new troubleshooting lines.
      - **Fixed pre-existing drift:** `docs/copilot-guide-builder-kit.md` was missing the DATA-HEAVY
        SAFETY NET and TEMPLATE C that Section J item 2 recorded as added on 10 Jul - only
        `E:\Hub\Copilot-Guide-Builder-Kit.md` had them. The repo copy is now a byte-for-byte copy of
        the take-to-work file. **Keep the two in sync - they drift silently.**
      - ⏰ **STILL FOR MIKE (at work, 2 minutes):** paste the updated Guide Builder instructions into
        M365 Agent Builder and Update. Verbatim text is in
        `docs/nhs-ready/12-meet-the-agents.md` under "1. wH Guide Builder" - copy the whole fenced
        block. Nothing else about the agent changes (no knowledge source, all toggles off).

### After the above
- [ ] **Guide walkthrough with Mike, approving one by one** - each currently in development or
      awaiting approval; Mike moves each past development. This is the big Section C item
      ("~47 amber guides for Mike to read + colour").

### For a later date (Mike, 27 Jul - not this session)
- [ ] **Guide-building agents must READ and EDIT existing guides, preserving site-editor
      changes.** Guides may have been altered in the wardHub guide editor by people with editor
      rights; an agent regenerating a guide must not clobber those edits. Relates directly to
      Section L item 4 (CONFIRM mode for guide content) and to the publish-pipeline question in
      Section K - if SharePoint becomes the authoring home, "who owns the current text" needs
      answering before an agent can safely rewrite a guide.
- [ ] **Guide editor: branches can only ever go FORWARD into new cells - no jump, no loop
      (Mike, 27 Jul).** After a decision cell you can add cells to each branch and finish with
      "+ endpoint", but there is no way to point a branch at a cell that already exists. His example:
      *"Want to add a family member? Y/N - on Yes repeat until N is chosen, but on N where do I
      jump?"* Today the only answers are to duplicate the following steps into every branch, or to
      end the branch there.
      **Cause is the data model, not the UI.** `WorkflowStep.branches` is `{ label, steps: WorkflowStep[] }[]`
      (`src/components/admin/FlowchartEditor.tsx`) - each branch OWNS a nested array, so a step can
      only ever be reached from one place. A strict tree cannot express a loop or a merge.
      **Proposed fix: a `goto` step type** carrying `targetStepId`, offered as a branch terminator
      alongside "+ endpoint". Picker lists every step in the flow by title (ids already exist; needs a
      flattener over the nested arrays). Covers both cases with one concept - "repeat until N" is a
      goto back to the decision itself, "on N carry on" is a goto forward to the shared step. Viewer
      renders it as "continue at X"; validation already demands branches end in a terminator, so
      `goto` just becomes another valid one. Needs a visited-set guard so a loop cannot hang the
      viewer, and the editor should refuse a goto that points at a step inside a different branch.
      **Not a quick fix - own session.** Pairs with the review below.
- [ ] **Review the guide editor with Mike.**

---

## O. From the 28 Jul evaluation (Session 43) - open items

> **SUPERSEDED 30 Jul by Section P.** Everything still open here is carried in the 30 Jul
> evaluation's recommendation ledger, which is now the authoritative list. Kept for the
> reasoning in the individual entries, especially the deferred password hardening. Note the
> guide figures below are wrong: it is **68 guides, 1 green / 47 amber / 20 red**, not 71/50.

Full report: `docs/evaluations/2026-07-28_project-evaluation.md` (read its **addendum** first,
several findings were actioned the same night).

**Claude can do these, no decision needed from Mike:**
- [ ] **CI workflow** - GitHub Action running `build` + `test` + `tsc` + `lint` on push. Highest
      value per hour in the whole report: the gates only run today when someone remembers, which
      is exactly why 26 typecheck errors sat in the repo for months. ~30 min.
- [ ] **Rate-limit + log `POST /api/auth/verify-password`** - unlimited guesses at one shared
      password today, no lockout, no delay, no logging, so a brute-force would be invisible.
      ~10 min. While there: timing-safe compare, and replace the `pathname.includes(".")` gate
      exemption in `proxy.ts` with an explicit static-asset match.
      **⏸ DEFERRED UNTIL AFTER THU 30 JUL (Mike, 29 Jul):** it touches the only thing standing
      between a visitor and the whole site, and a mistake locks the sponsor out mid-demo. Not
      rejected - do it once the demo is done.
- [REJECTED] ~~"Nothing is saved here" notice in the diary~~ - **Mike, 29 Jul: this is by design
      and not worth cluttering the site for. He demos it live and says it out loud.** The
      underlying fact is unchanged and stays documented on `/gdpr`: task state is React memory
      only (`tasks-provider.tsx` is `useState`), so a refresh wipes every claim, hand-back and
      completion. **Do not re-propose an in-app notice** - if a later evaluation raises it, this
      is the answer.
- [x] DONE 29 Jul (Session 46b). **Re-run axe** over everything built since the June audit: hand-back modal, `/overview`,
      rebuilt service map (pan/zoom is the hard one for keyboard), quiz, pay band picker,
      payslip decoder. None of it has ever been machine-tested.
- [ ] **Move the governance docs out of `dev-panel/page.tsx`** (2,900+ lines) into markdown that
      the page renders. The DPIA, hazard log, RBAC matrix and data catalogue currently only exist
      as JSX, so the IG officer and clinical safety officer who must sign them cannot redline or
      version-compare them. There are already partial markdown copies in `docs/nhs-ready/`, so
      today there are two sets that will drift.
- [x] DONE 29 Jul (Session 46b). **Clear the 36 `react-hooks/static-components` lint errors** in one mechanical pass. Real
      user-visible consequence, not pedantry: a component declared inside a render gets remounted,
      so text someone has typed into a field can vanish while they type (`PayslipDecoder.tsx` is
      the clearest case).
- [x] DONE 29 Jul (Session 46b). **Tests for the proxy split and the hand-back reducer.** The proxy test has now been
      recommended in three consecutive evaluations and still does not exist. It matters more now
      that `COLLAPSED_FOR_DEMO = true` leaves all the limited-build logic dormant and unexercised.

**Needs Mike:**
- [ ] Sign off or reject the **20 red guides**. Nothing else moves the project as much.
- [ ] Decide what **amber** means for the 43 guides that have never been reviewed, versus the 7
      considered and parked. The badge cannot currently tell them apart.
- [ ] Collect the **44 FOCUS addresses** in one sitting on the trust network (Section A).
- [ ] Write **~6 WAGOLLs**. Zero of 16 referral guides has a worked example. Needs no FOCUS URL,
      can be static HTML in the repo like `public/abc-wagoll.html`.
- [ ] Confirm the crisis and perinatal direct numbers are publicly findable: `01332 623900`,
      `01246 293284`, `01332 623911`, `01246 216523`.
- [ ] Supply the real referral contacts now reading "Hidden in demo mode" (PICU, dietetics,
      dental, tissue viability, physio, OT, SALT, EDT, ERP, JUCD keyworking, welfare rights).
- [ ] Decide whether **`/quiz` carries the traffic-light badge**. 942 questions marking people
      right or wrong against trust policy, with no sign-off state at all.
- [ ] Answer the **DTR consent** question (still `[confirm]` in live content) and read the
      **Supabase region** off the dashboard.
- [ ] Should **named nurse, consultant and admission date** follow MHA status out of the patient
      record? Left in deliberately, but the "who keeps this current" argument reaches them too.

---

## Q. Policy conflicts + agent trust (31 Jul 2026, Session 49)

Raised while merging the hazard logs. The register lives OUTSIDE the repo in
`E:\Hub\policy-audit-full\` - `CONFLICT-REGISTER.md` (the working register, IDs `CR-nn`),
`WARDHUB-CLASHES.md` (the app-facing subset, IDs `WH-nn`), `POLICY-CONFLICT-AUDIT-25-Jul-2026.md`
(the full 483-document audit). Nothing there is backed up.

- [ ] **⭐ NEXT TIME WE TOUCH THE COPILOT AGENTS: build in quote verification.**
      During the 25 Jul audit an agent produced a **verbatim-looking quote with a citation that
      exists in no document**, and used it to conclude a conflict was not a conflict. The
      fabrication ran in the direction of making two documents AGREE, which for a
      conflict-finder is the worst possible failure. Caught only by manual copy-paste of the
      whole source.
      Two instruction changes needed, in BOTH copies of the kit (the repo copy and the live
      M365 agent - they drift, see [[chase-guide-builder-repaste]]):
      1. **Every quoted line must be confirmed present in the source before the guide or
         finding is accepted.** Quoting both sides is already required and was not enough,
         because the quote itself can be invented.
      2. **Bias the instruction against agreement.** An agent that cannot find a conflict must
         report that it could not find one, never that none exists.
      Recorded as **HAZ-026** in the hazard log. This also has to be built into the A/B test
      comparing a Claude-built guide against a Copilot-agent-built one - score quote fidelity,
      not just readability, or the test proves the wrong thing.

- [ ] **15 open app-vs-policy clashes, 6 CRITICAL** (`WARDHUB-CLASHES.md`, all still `OPEN`).
      Recorded as **HAZ-027**. Each is a LEAD needing a human to open the policy and confirm
      the wording - see the item above, not all will survive contact with the source. The
      critical six: `WH-01` Form H4 Part 1/2 inverted · `WH-02` app says only original section
      papers accepted (policy accepts copies) · `WH-03` s15 rectification note renders on CTO
      recall where the Act provides none · `WH-04` IMHA entitlement over-claimed · `WH-05`
      post-RT monitoring stops too early · `WH-06` Derby City safeguarding out-of-hours number
      may be a children's line. **Resolve or withdraw these before the affected guides go to a
      shelf owner** - a reviewer whose first guide carries a known defect does not come back.

- [x] **Dev panel conflicts card corrected (31 Jul).** It was citing
      `docs/policy-conflict-audit-02-Jul-2026.md`, deleted from the repo in `84f447c` and
      superseded. Worse, it displayed as fact that **S62 Urgent Treatment had expired** - the
      25 Jul full-corpus audit shows the Trust issued a replacement (issue 04, Dec 2025, review
      Dec 2028) exactly as the extension lapsed. The card now leads with the corrections to the
      earlier audit, carries the fabrication warning, and no longer claims the app "was verified
      clean".

- [ ] **Decide whether the conflict register becomes a Trust artefact.** The pitch says wardHub
      surfaces contradictions between sources. The evidence for that claim is a 483-document
      audit sitting on one laptop with no backup, invisible to the Trust. Options: hand it to
      the MHA Office and safeguarding leads as a gift, publish a summary in the dev panel, or
      keep it internal. Currently only a summary is visible.

- [ ] **Back up `E:\Hub\policy-audit-full\`.** Same exposure as
      `E:\Hub\temp\internal-contacts.md` - one drive, no copy.

---

## P. From the 30 Jul evaluation (Session 47) - open items

Full report: **`docs/evaluations/2026-07-30_project-evaluation.md`**. Read it before starting
work. Everything the 28 Jul pass left open is carried in its recommendation ledger, so Section O
below is now history rather than a live list - the live list is here.

**New findings, never raised in any previous evaluation:**
- [x] **DONE 6 Aug (Session 55).** `main` now requires the CI `checks` status; force pushes and
      deletion blocked. `enforce_admins` left OFF so the solo push-to-main flow still works -
      an owner push still deploys red. Tightening that (PR-or-wait flow) is Mike's decision;
      see the Session 55 block at the top.
- [ ] **`E:\Hub\temp\internal-contacts.md` exists exactly once, on one drive, with no backup.**
      It holds every real internal contact keyed by entry id and it is the only copy, by design,
      because the values were stripped out of the repo on 27 Jul. If that drive fails they are
      unrecoverable. Highest-consequence single file in the project. **Mike: put a copy somewhere
      else.** Same applies to `E:\Hub\printable-guides\`, `E:\Hub\wardhub-video\` (whose `src/`
      cannot reproduce the rendered reel) and the 483-document policy dump.
- [x] **DONE 6 Aug (Session 55).** CLAUDE.md rewritten - 231 lines of current fact, stale
      version system / demo-data claims / snag lists gone, BACKLOG.md named as source of truth.
- [ ] **A scheduled GitHub Action queries Supabase daily.**
      `.github/workflows/supabase-keepalive.yml` runs a `SELECT id LIMIT 1` against
      `feedback_posts` with a **service key** from GitHub secrets, to stop the free tier being
      paused. The app itself never queries Supabase, so "wired but dormant" was true but not the
      whole picture. Now disclosed in the dev panel Q&A, the DPIA data flows and on `/gdpr`.
      Rotate the key once the keep-alive is no longer needed.
- [x] **Was already done - Session 50 (31 Jul) closed HAZ-020** in the current hazard log
      (HL-003 v0.3, "verified absent from the codebase"); the superseded 03b file's banner
      records the closure. Confirmed 6 Aug, no further edit needed.
- [ ] **`overview/page.tsx` is now 2,228 lines** - the same size `tasks/page.tsx` was criticised
      for, and it grew without anyone noticing. Split it.
- [x] **DONE 6 Aug (Session 55).** One sentence under the add-task Title field: "Keep titles
      factual - what needs doing, not clinical details or opinions about a patient." Requested
      explicitly by Mike's 6 Aug list, which supersedes Session 48's "do not re-propose" note.
      No new fields, PII scope untouched.
- [x] **DONE 6 Aug (Session 55).** next floor bumped to `^16.2.12`.
- [ ] Basic uptime monitoring. Free, ten minutes, and right now nobody would know if the site
      broke overnight. **Needs an account, so it waits for Mike** - options flagged in the
      Session 55 block (UptimeRobot / Better Stack / a scheduled-curl Action).

**BACKLOG items no evaluation has ever assessed** (raised by the v2.1 cross-check):
- [ ] **Section A's eight "NEW GUIDE needed" items** (autism, CAMHS, ECT, perinatal, day
      services, discharge liaison) have sat unstarted since 4 Jul. Decide whether the list is
      wanted or aspirational, rather than carrying it indefinitely.
- [ ] **Section B's postcode / GP-surgery lookup** - data described as "fully in hand" since
      4 Jul, never started.
- [ ] **Section D's contacts directory** - correctly specified, needs persistence, so it is
      really a full-build item. No evaluation has said so out loud.
- [ ] **Section E's bed-management ranking** - the closest thing to a product roadmap for the
      sponsor's own interest area, and no evaluation has scored it.

**Also flagged:** `s117-meeting` is the only green guide and it has **5 dead links**. Decide
whether green should require working links, because at the moment green does not mean complete.

---

## MIKE'S HOMEWORK DUMP (4 Jul 2026 - captured, organised into A-E below)
Full verbatim capture + per-guide notes + source-doc inventory: **`docs/homework-04-Jul-2026-dump.md`**.
Source files on disk (outside repo): `E:\Hub\temp\dump july\` (doc, 6 screenshots, 2 HoNOS videos, `docs 1\` set).

**Big win:** Mike supplied the docs that were blocking guides. `docs 1\` unblocks section-132,
capacity-assessment, blanket-restrictions, abc-chart, no-smoking, informal-patient-contract (see table in the dump doc).

> **Source extraction done 4 Jul** - all 17 docs + odds-and-sods read; mapped digest at
> `E:\Hub\temp\dump july\extracted\_DIGEST.md`. Bonus finds: 8-step arrange-MHA flowchart (odds p13),
> ECT fasting/post-ECT content (odds p3-5), public CMHT directory (odds p6-8), "A CARE PLAN!" case-note
> mnemonic, seclusion review timings, red-folders + ward-roles content. Rule-4: odds pp9-10 internal
> @nhs.net inboxes/managers stay OUT of live.

### F. Homework - now-actionable (unblocked by Mike's `docs 1\` docs)
- [x] **section-132** (RED, enriched 4 Jul, commit 4152ca1) - added "Record it on SystmOne" step (S132/S132A questionnaires, Save-Final-Version auto-tasks MHA team, leaflet printing), S133 discharge duty, S132A/CTO recall note. FOCUS recording + policy links already wired. STILL BLOCKED: MHA office email (add when Mike supplies).
- [x] **capacity-assessment** (RED, enriched 4 Jul, commit 99f6f02) - added the SystmOne Combined Capacity form (functional + diagnostic stages) and the police Capacity Request form. FOCUS S1 + policy links already wired.
- [x] **blanket-restrictions** (RED, enriched 4 Jul, commit add0a44) - added FOCUS brief-guide link, three-tier contraband list (banned/risk-assessed/advisory), ward-level authorisation aligned to policy (Ward Manager sign-off + register + Clinical Meeting/daily-huddle review).
- [~] **abc-chart** (amber) - blank ABC chart to print now added (`/abc-chart-blank.html`, 4 Jul eve, commit 1f11591) alongside the existing completed-example WAGOLL. Still open: a fuller worked example + an optional builder from `ABC charts - Copy to add to.pptx`.
- [ ] **honos** (RED) - use image6 (New Cluster box) + `waa honos.mp4` / `waa honos hist.mp4`; note WAA/secure/CAMHS formats differ. (Left - needs the video/image processing, Mike's eye.)
- [x] **NEW guide: no-smoking** (RED, 4 Jul, commit 99f6f02) - "Smoke-Free Ward - Your Legal Duty", from the staff legal-warning doc; legal framework + what-to-do + ties to blanket restrictions. Restrictive Practice category.
- [x] **NEW guide: informal-patient-contract** (RED, 4 Jul, commit 99f6f02) - Gatekeeping Assessment (18 mandatory Qs) + Informal Admission Questionnaire, from the two Dec-2025 SystmOne guides. Nurse Tools category.
- [ ] **debrief** (already amber) - confirm headers vs the real tool text (in dump doc); likely just a header check. (Left - Mike's eye on exact headers.)
- [x] **admission-checklist** (4 Jul, commit d15addb) - the 3 personal michael.sharpe4 OneDrive links swapped for in-app builders (risk-assessment, care-plan) + MHLO statutory-forms index for blank H3. PERSONAL block removed.
- [x] Reviewed **`odds and sods.pdf`** - digested in `_DIGEST.md`; ECT/CMHT/arrange-MHA content pulled (arrange-mha rebuilt from the 8-step flowchart, commit d15addb). Remaining ECT/CMHT/day-services content needs NEW guides (see Section A).

### G. Homework - quick edits (small, mostly no doc needed)
> **Most of Section G was ALREADY done in a prior session** (the BACKLOG was stale). Confirmed 4 Jul.
- [x] **leave-discharge-transfer** - Prenoxad consideration + guide link AND "Fire board / evacuation list updated" in day-of tasks BOTH already present.
- [x] **dama** - out-of-hours discharge meeting, "unplanned = unsafe discharge -> Datix", and short-leave alternative all already present.
- [ ] **fridge-temps** - "Mark completed for today" button that ticks the linked diary task (feeds Section E diary-task audit). (Interactive/code feature - bigger, left.)
- [x] **observation-engagement** - shower/toilet intimate-care obs closeness AND "L1/L2 rarely leave ward, MDT-agreed" already present.
- [x] **safeguarding** - the 39%/54% line already reworded ("even those not taken up are still logged... build a picture").
- [ ] **safeguarding-children** - the two consent press-options are about patient not family - fix. (Left - the consent step is family-consent; needs Mike's eye on exact intent.)
- [ ] **domestic-abuse-guide** - make URLs clickable; source/link the CADDA-DASH; reduce text density. (Left - subjective density call for Mike.)
- [x] **mha-statuses** - already has the related link to section-132.
- [x] **arrange-mha-assessment** - REBUILT from the 8-step flowchart (commit d15addb); nhs.net line already reflects "social care use their own secure email". Still RED: secure-email name TBC from Mike.
- [ ] **admission-note** - add ward/unit names; make interactive (click a line -> pop-up suggestions). (Interactive = bigger, left.)
- [ ] **Flip to amber if happy:** `prenoxad`, `transfer-in`, `awol` (complete drafts - await Mike's word). [Claude won't self-flip approval status - that's Mike's editorial call.]

### H. Homework - decisions still on Mike
- [BLOCKED] **section-136** - expand with FAQ (force treatment / seclude / out-of-area / child in 136) or drop? Research FOCUS+external first, then decide.
- [BLOCKED] **mh-talking-points** - grouping steer + which extra grounding/distraction techniques.
- [BLOCKED] **arrange-mha-assessment** / **section-132** - social care secure-email name; MHA office email address.
- [x] **HoNOS group** = Nurse Tools (Mike decided). **IMHA** = Disability Direct (confirmed, One Advocacy dropped). **v1/v2 merge** = keep.

### I. Homework - bigger builds (own sessions, parked - overlaps Section D)
- [PARK] Named Nurse Checklist -> schedulable ticking tasks (also D). Red Folder content in `Red folders - set up.docx`.
- [PARK] Tribunal/DST/OT-report combined builder - write tribunal on the new gov.uk template (also D).
- [PARK] Formulation output rethink; Risk tool rethink; DoLS visual/interactive (also D).
- [PARK] restraint-monitoring - reasonable-force image + law; core-skills hold images (Mike to supply); clickable "monitoring ceased" workflow that greens out.

---

## R. THE LIVE LIST (2 Aug 2026) - sessions 50-52 plus Mike's own job list

**Why this section exists:** sessions 50, 51 and 52 (31 Jul to 2 Aug) never reached this file.
The medical device question, the NHSmail SSO route, the Anthropic ask and the tiered-guide
split lived only in memory files, which is the exact failure Session 45 wrote a rule about.
Merged here with Mike's 2 Aug list so there is one place again.

Context memories: `session-49-meeting-debrief-hazards`, `session-50-devpanel-governance-audit`,
`session-51-anthropic-toggle-ai-policy-sso`, `session-52-full-transcript-roadmap`,
`competitor-scan-and-mhra-test`.

### R1. Medical device - open, and it gates the pilot

Anne Munnien (Clinical Safety Officer) raised it on 30 Jul and never closed it. **Mike cannot
close it and cannot self-certify** - MHRA p11: *"A manufacturer's stated view of their product
is not solely determinative."* A withdrawn classification claim already cost a governance
document its credibility (Session 50), so do not write another one.

- [ ] **⭐ Anne asked for the hazard log to be rebuilt FROM SCRATCH** (missed from the meeting
      notes, surfaced by Mike 2 Aug). HL-003 v0.3 exists but it was written by the software's
      author and grew by accretion; Anne wants it built properly. Treat as a facilitated hazard
      workshop, not a document edit - the point is who is in the room, not the file. Ask her what
      format and what participation she expects before starting, and whether the existing 27
      hazards are an input or are being set aside.
- [ ] **Ask for Karina at the table yourself.** Anne asked at 49:39 whether Karina needs to be
      involved, two people talked over it and it was never answered.
- [ ] **Give Andy Wall the parameters he asked for** (53:40 "could bleed into decision support",
      55:05 "put some parameters about functionality that you're deploying"). The boundary rule
      is: **no calculation, no interpretation, source policy always visible.** Delivering this is
      responsive to his request, not a confession.
- [ ] **Audit the promotional surfaces, not just the guides.** MHRA p11: medical purpose is
      determined by labelling, instructions for use and promotional materials, *"the landing
      page"* named explicitly. So home, `/about`, the video script and the presentation pack are
      all in scope. Same page: *"General disclaimers... are not acceptable if medical claims are
      made or implied elsewhere"* - a disclaimer cannot fix wording elsewhere.
- [ ] **Tighten the loose claims** (same family as the "no cookies" fix). 32:09 *"AI doesn't
      touch that bit"* is not accurate; the true narrow version is **no patient data passes
      through any AI system at runtime**.

### R2. The Tier A / Tier B guide split - the biggest lever on the pilot date

Mike's own idea, 2 Aug. Where a clear SOP already exists, build the guide from it **manually,
no AI interpretation, no cross-referencing across policies** - a drag-and-drop restructure of
one approved document.

- [ ] **Sort the 68 guides into A and B.** Tier A = one approved SOP, restructured. Review is
      "is this faithful?", which is minutes rather than an evening, and the provenance is clean
      for the classification question. Tier B = synthesised across policies, needs real clinical
      reading. **Do the sort before asking anyone to review anything.**
- [ ] **Build the drag-and-drop SOP builder.** Paste or upload one SOP, drag its sections into
      guide steps, no model in the loop. It is also the succession answer: someone who is not
      Mike and not an AI can build guides with it.
- [ ] This maps onto the MHRA safe side verbatim - p12: *"It just reproduces a paper document in
      digital format. It is down to the health care professional to make the decisions based on
      the advice displayed."* Worth quoting when the builder is described.
- [ ] **Agent guardrail block (Mike, 6 Aug - deliberately deferred).** Draft a clinical-boundary
      block for the wH agent instructions (the R1 parameters: no calculation, no interpretation,
      source policy always visible) so future guides cannot drift into decision support. NOT
      written yet on Mike's call: nobody can access the live agents at the moment, and if the
      Anthropic/Claude toggle is approved the agents get rebuilt anyway, so the text would be
      written twice. Write it when agent access returns or the toggle decision lands, and fold it
      into the standing Guide Builder re-paste chase ([[chase-guide-builder-repaste]]) so both
      land in one paste.

### R3. Emails and chases (Mike, 2 Aug)

- [ ] **Email Andy Wall.** The apology/reframe: aimed high on purpose, better to be pulled back
      than to crawl up, and he had lost track of what stage the last conversation left things at.
      Pair it with R1's parameters so the mail carries an action, not just an apology.
- [ ] **Email Cris.** The offer was only ever "build it internally because people are scared of
      AI". If risk tolerance on AI is improving he is happy to keep it AI-built. Ask: **2-3 Claude
      Code seats for his team, £90/month to start, £20/month to maintain**, co-authoring through
      a shared project file. No tenant change, no subprocessor question, no data boundary
      argument - which is why this is the easier ask than the Anthropic toggle.
- [ ] **Claude-in-Copilot request, framed as shoring up guide building.** Send it **after**
      Anne's, because it asserts the guide work is non-clinical and that is the question under
      assessment. Expect a no on EU Data Boundary grounds. Two toggles are needed (M365 admin
      centre + Power Platform), and the six wH agents would need rebuilding, not upgrading.
      ⚠ Note from the Session 51 test: **the gap in the Guide Builder is the prompt, not the
      model** - retrieval was excellent and it invented nothing. So this is a nice-to-have.
- [ ] **Chase Maria on the SOP builder she named** (transcript "Sephia" = **SOPHIA**, Carradale
      Futures). Ask for a sales pitch or demo to watch. Known before you ask: **£60k-£120k/yr**,
      live at **West London MH and Essex Partnership University Trust**, G-Cloud listed with a
      3-month free trial. Its G-Cloud listing carries no clinical safety or medical device
      statement, which is not evidence either way and not a precedent to lean on.
- [ ] **Chase Lucy for the WAGOLL.** Folds into the standing "zero of 16 referral guides has a
      worked example" item (Section A / Section O).
- [ ] **Libby and Charlie - sort a time.**
- [ ] **Send Maria the 68-guide list** so she can assign names (she said 58:32 all 68 must be
      signed off before a pilot, 1:00:17 send the list). Ask for **one content owner per
      specialty**, not one person reading 68 guides.
- [ ] **NHSmail SSO.** Pre-populate the form (Mike changes only Application Name, Scope/Purpose,
      Contact, Redirect URIs), send to **azeez.aina@nhs.net**, he raises a Stores Request, then a
      call with Cris. **Register multiple redirect URIs** (production + Vercel + localhost) - the
      queue ran two months for Cris's own request, so a second one is expensive.
      **Cris is off in September**, so push the review to **w/c 31 Aug**.

### R4. Handover to trust accounts - SEQUENCE MATTERS

- [ ] **⛔ IP FIRST. Get the ownership position named in writing BEFORE transferring the domain,
      the repo or the hosting.** Maria 1:03:04 *"keen to keep this in House"*; Mike replied the
      Trust could one day sell it; it was left unresolved. Built on his own time, own
      subscription, own hardware, outside employed nursing duties - arguable, but it needs
      stating, not assuming. **The comparable number is £60k-£120k/yr per organisation** and it
      is public on the Digital Marketplace, so the conversation is not hypothetical.
- [ ] **Transfer the domain.** After the above.
- [ ] **Set up GitHub and Supabase under trust accounts.** Note this ends the Sharpy20-only
      isolation rule that CLAUDE.md currently states in bold, so that rule needs rewriting in the
      same pass rather than left to contradict reality.
- [ ] ⚠ **Terminology, and it matters in front of governance people: it is FICTIONAL DEMO DATA,
      never "demo PII".** Fictional data is not personal data and is out of DPIA scope entirely,
      which is precisely what makes a no-patient-data first phase possible with no IG sign-off.
      Writing "demo PII" throws that unlock away in a sentence. Alex Rose proposed the
      no-patient-data-first phasing himself (37:15), so agreeing with him costs nothing.

### R5. Site glitches (Mike, 2 Aug)

- [x] **DONE 6 Aug (Session 55), with a caveat.** The reproducible defect was leaflet headers
      printing white-on-white when the print dialog's "background graphics" default stripped
      them; fixed with `print-color-adjust: exact`. Whole-leaflet loss did NOT reproduce in
      Chromium (all 29 print, both routes, live file matches repo). If Mike still sees missing
      leaflets, ask his route + browser - suspect Edge's "clutter-free printing". Details in
      the Session 55 block.
- [x] **DONE 6 Aug (Session 55).** Session 46c confirmed as the culprit, but not via a lost
      handler: `TaskDetailModal` and the shared `Modal` both sit at z-50 and the detail modal
      rendered first in the DOM, so it opened invisibly BEHIND the expanded-day pop-out. It now
      renders last, matching `/overview`. Verified in the browser.

### R6. To build (Mike, 2 Aug)

- [ ] **Assign a job to a ROLE, not just a person: OT, Nursing, Medical, Admin.** Fits the
      existing claim model (unclaimed jobs are already a pool) - a role tag narrows whose pool it
      sits in without forcing a named owner. Decide whether role is a filter on My Diary, a
      badge, or both, and whether a job can carry more than one.
      ⚠ **Mike is exploring issues on this at work first (2 Aug) - do not build until he reports
      back.** It also turned out to be bigger than a job tag: see **Section S4**, because the same
      question lands on the guides index and the login, not just the diary.
- [ ] **72-hour audit and weekly audit reports.** The 72-hour admission audit tasks already
      generate; what is missing is the report. Depends on R7 being answered honestly.

### R7. Overview and tasks - built, but not landing (Mike, 2 Aug)

All three shipped in the last fortnight and all three read as unclear to the person they were
built for. That is the finding, not the features.

- [ ] **The waiting-only flag is not clear what it does.** Mike wants to think it through further
      before it is changed - do not redesign it unprompted, ask him what he expected it to do.
- [ ] **MDT / Rapid / Named nurse review stamps are not clear.** Section M item 5 predicted the
      assurance metric would "fall out for free"; on screen it does not read that way. Likely a
      wording and placement problem rather than a logic one - the spec itself left the exact stamp
      wording open (Section M, "Open").
- [ ] **The bed meeting print sheet is pretty useless as it stands. Needs exploring.** Built 30
      Jul deliberately as "not a screenshot of /overview" - worst-first by days blocked, category
      tag, age per barrier. Worth sitting with an actual bed meeting agenda before rebuilding it.

### R8. ⚠ The audit-completeness risk (Mike, 2 Aug) - acknowledge it in writing

If someone does not need the guide and does the job without logging it, the job is invisible to
the audit. **Gaps then read as "work not done" rather than "work not logged"**, which is worse
than having no report at all.

- [ ] **Put the claim on the report itself, in writing:** *a record of tasks logged in wardHub,
      not a complete record of ward activity.* One sentence, and it stops the report over-claiming.
- [ ] **Then make wardHub the only route for 2-3 task types**, so those specific ones are complete
      by construction and can be audited honestly. Mike's own framing: this is a big ask, it means
      recording in wardHub as business as usual rather than a tool to dip in and out of.
- [ ] **The payoff to lead with:** a named nurse seeing every one of their patients' documentation
      reviews in one place, with reminders when they fall due. That is the reason to adopt it,
      and the audit is the by-product.

### R9. Explore: pull patient names from SystmOne instead of holding them (Mike, 2 Aug)

**The question to test, not assume: is reading names from S1 at runtime a SMALLER ask than the
one Alex is already worried about?** The pitch writes itself if it is - wardHub would hold no
patient identifier at all, just a pointer, so there is nothing in it to leak, retain, or keep
current. That answers Alex's concern and the "who keeps this up to date" objection in one move,
and it is the same argument that got MHA status, alerts and diagnoses removed on 28 Jul.

- [ ] **Establish what the integration would actually be**, before selling it. Start from
      `docs/progress reviews/SystemOne-API-Guide.md` (the existing research doc) and check it
      against reality - it predates the Nexus rename and may describe a route that was never
      real. TPP integration options, what a read-only patient-list call needs, and whether the
      Trust already has an S1 integration route that other tools ride on.
- [ ] **Cost it in the currency governance actually spends.** The honest read is that this trades
      an **IG ask** (store names, DPIA, retention, data controller) for a **vendor and access ask**
      (TPP, an information sharing agreement, an interface request, IT ownership). Those queues
      are measured in months and are not Mike's to expedite - the NHSmail SSO request has been
      sitting since June. **It may well be a smaller governance ask and a much longer calendar
      ask.** Say both when presenting it.
- [ ] **Ask Cris first** - he owns Nexus and the integration relationships, so he will know
      whether an S1 read route exists before anyone writes a form. One conversation probably
      settles it either way.
- [ ] ⚠ **Do not let this stall Phase 0.** Alex proposed the no-patient-data-first phasing
      himself, and fictional demo data needs no approval from anyone. This explores what comes
      *after* Phase 0; it is not a reason to wait before starting it.

## S. Occupational Therapy guides (2 Aug 2026, Session 53)

**Where this came from:** Mike emailed **Georgia (OT)** asking for referral forms, assessments and
"things you have to teach new starters" that SystmOne does not already cover well. She replied
with a summary of the OT pathway and three files, now in `E:\Hub\temp\OT\` (outside the repo):

| File | What it actually is |
|---|---|
| `OT Pathway 1.pdf` | 4 pages. p1 is a flowchart, p2-4 are the written pathway with AIMS standard numbers cited against each stage. Titled **"Occupational Therapy Service Pathway - The Radbourne Unit"** |
| `Priority Screening Prompt Sheet.docx` | A MOHO-shaped prompt sheet: Motivation, Routine, Performance skills, Environment. Questions only, no scoring |
| `Hub referral example.docx` | **NOT a worked example.** One screenshot of the SystmOne New Electronic Referral dialog showing the correct field settings, narrative box empty |

She also offered to review whatever gets built. That review offer is the valuable half.

### S1. Before any of this touches the repo

- [ ] **`Hub referral example.docx` contains a real staff name** in the Referrer field
      (`GRESHAM-VARNEY, Victoria (Miss)`), captured from a live S1 session. It must be redacted or
      re-shot before it goes anywhere near git, the guides or a screenshot in a guide. Replace with
      a name from the Jane Austen staff cast if a mock-up is wanted.
- [ ] **The pathway document is unit-specific, not trust-wide** - it says The Radbourne Unit on its
      face. Confirm it applies to the two pilot wards before building a guide that implies it does.
- [ ] **It carries no version, review date, owner or ratification mark.** On the strict Section R2
      test that makes it a **team working document, not a ratified SOP**, so it is not Tier A as
      written. It is still single-source with no cross-policy synthesis, which is the safe part.
      Ask Georgia for provenance: is there a controlled copy on FOCUS?
- [ ] **Her email is a simplification of her own pathway doc** and several things in the doc are
      missing from it. Build from the document, and check the differences with her (list in S2).

### S2. What the pathway document says that the email did not

Worth knowing because these are the parts with the most wardHub value.

- **Physical health check inside 1-2 days, red-flagged in the doc.** Equipment ordering, home
  visit planning, accommodation type, landlord or housing association permission, repairs, fire
  risk, hoarding, quotes from the housing hub. The doc's own reason: *"This will take time,
  therefore gathering details will be time efficient."* **This is the highest-value item in the
  pack** - long lead times, started on day 1, invisible until it blocks a discharge. It maps
  straight onto the existing `blocksDischarge` barrier flag.
- **ReQoL appears twice** (initiated by the OTA at day 1-2, repeated at discharge) and is absent
  from the email. The doc is explicit that it is **not an OT measure** - all MDT can support it,
  the OTA initiates it. So it is a ward job, not an OT-only job.
- **The 3-7 day step branches.** OTA completes the priority checklist (gathering facts), a
  **registered OT signs it off and sets high / medium / low**, and that decision routes the
  patient: low = signpost recreation, high = the OT may initiate a formal OT assessment instead of
  the checklist. The email flattened this to "a Priority Screening is completed within 7 days".
- **Day 7 ward round.** OT information feeds the first ward review, formulation of OT needs,
  recreation team introduces its service inside the first seven days.
- **Internal ward transfer: the ward OT reviews within 3 working days.** Not in the email, and it
  hooks the existing patient-transfer feature directly.
- **Named tools:** OCAIRS, MOHOST, the OT inpatient initial assessment form, practical assessment
  group. The email's assessment list instead (Washing and Dressing, PADL, DADL, Road safety,
  Shopping skills, Kitchen skills) appears nowhere in the pathway doc - that is her own addition
  from the S1 OT node.
- **AIMS standard numbers are cited against every stage** (3, 7, 194 / 2 / 21, 22, 42 / 31, 33, 34,
  39, 40, 42, 45, 57, 195 / 76, 79, 194). The document exists to evidence AIMS accreditation. That
  is the strongest governance hook in the whole pack: **the diary jobs would generate the audit
  trail for named accreditation standards**, which is a better pitch to Maria than "it helps staff".

### S3. Proposed build (confirm with Georgia before starting)

- [x] **OT pathway overview guide - BUILT 2 Aug.** `/guides/ot-pathway`, 14 steps, category **OT
      Tools** (which already held only `mohost`), status **red**. Faithful restructure of the one
      document: no synthesis, no interpretation, no scoring. The provenance caveats are in step 1
      and are load-bearing - do not strip them until a controlled copy turns up on FOCUS.
      Progressive disclosure on the four reference-heavy steps. Case note covers the initial
      contact, which is the document's only explicit "record this, it is auditable" instruction.
      Carries three `[confirm]` markers: whether it applies beyond Radbourne, what ECW stands for,
      and the AIMS numbers. **Georgia has not seen it yet.**
- [ ] **Priority Screening thinking guide** from the prompt sheet, straight into the existing
      `GuidePrompts` component (why it matters / prompt yourself / examples / tip). Two things to
      carry **verbatim**: *"Check orientation first (document under cognition)"*, and the sensory
      question's audit rule - *"we must note 'Sensory pre-screen asked' in a case note on
      SystemOne for audit purposes"*. That exact string is a perfect fit for the case-note copy
      feature and is the single best wardHub hook in the pack.
- [ ] **Hope and Resilience Hub referral guide**, standard referral template. The S1 field settings
      are known from the screenshot: Recipient `HUB, Hope & Resilience`, Read code `Referral to
      mental health team`, Type `Secondary care`, Urgency `Routine`, Task recipient `User group`.
      **Ask Georgia for a fictionalised referral narrative** - the screenshot's narrative box is
      empty, so there is still no WAGOLL.
- [ ] **Day 1-2 physical health and environment checklist.** Equipment, home visit, accommodation,
      permissions, repairs. Tick-list shape like the admission checklist, with the long-lead items
      flagged as discharge barriers.
- [ ] **Seed the OT pathway as diary jobs on admission**, the way the 72-hour admission audit jobs
      already generate. This is the demo moment for an OT and it is the thing S1 does not do.
      Blocked on the role tag (Section R6 / S4).
- [ ] **Do NOT build six ADL assessment guides.** The templates live in the S1 OT node and Georgia
      says which are used varies by individual. Ask her which three she actually teaches new
      starters, and build those as "what to observe and where to record it".

### S4. The role question is bigger than a job tag

Mike's ask this session was role-scoped views for OT / nursing / medical. Section R6 covers only
the diary half. The OT pack shows it also lands on:

- **The guides index.** An OT should not wade through 68 nurse guides to find four. Filter, or a
  role-chosen default view.
- **The login.** wardHub currently asks ward then name. Profession is not captured at all.
- **Scope inside a single guide.** The pathway draws a real professional boundary the product would
  have to respect: *"OTA is gathering facts, not formulating"*, and the priority level is set by a
  **registered** OT. A role tag that lets an OTA tick "priority set" would misrepresent the pathway.

**Mike is exploring issues on this at work first. Do not build until he reports back.**

### S5. Device boundary note for this content

- The prompt sheet gathers, the **registered OT decides** high / medium / low. wardHub must never
  compute, suggest or nudge that level. Keep the split visible in the guide, since it is also the
  OTA/OT scope boundary.
- Road safety, kitchen skills and shopping skills are functional **risk** assessments in all but
  name. A guide that helps somebody conclude "safe to use a hob" is what Andy Wall meant by
  bleeding into decision support. Observation prompts and where to record them, never a pass/fail.
- **Useful for the R1 parameters note to Andy:** the pathway document says of itself *"What you
  choose to do will be based upon own clinical judgment. There is no right or wrong way of
  achieving this."* The source document is stating that it does not determine the decision.
- **Hope and Resilience Hub** needs a Rule 4 check. It is referred to on S1 rather than by phone or
  email, so there may be no contact value to hide, but confirm.

### S6. Reply to Georgia

Thank her, then ask:

- [ ] Is there a controlled version of the pathway on FOCUS, with a version and review date?
- [ ] Does it apply beyond Radbourne, to the pilot wards?
- [ ] Are the 1-2 / 7 / 10 day clocks working days or calendar days, and do they run from admission
      or from OT pickup? The doc says "3 working days" for transfers but is silent on the rest.
- [ ] A fictionalised Hub referral narrative, so the guide can ship with a worked example.
- [ ] Which three assessments do you spend the most time teaching new starters?
- [ ] What can an OTA do alone versus what needs the registered OT? (Feeds S4.)
- [ ] Does OT pick up every admission automatically, or is there a referral in?

---

## T. Mike's job list, 3 Aug 2026 (Session 54) - VERIFIED BEFORE PLANNING

**Mike's instruction:** do not run these off independently. Plan collectively, split what needs
Mike at a computer from what Claude can safely run alone. Live task list mirrors this section.

**Numbering note:** Mike's original list had duplicate labels (two 2c, two 2d). Renumbered T1-T15
here, original labels kept in brackets.

### ⭐ Six things checked first, because they change the list

1. **Patient status filters ARE built** (T5 / his item 6). `PatientStatus`, the filter counts and
   `expectedDischargeDate` all exist. The reason Mike never sees them is in a code comment already:
   `src/lib/data/tasks/index.ts` lines 65-70 - `PATIENT_STATUSES` is a 10-slot round-robin and with
   only 5 patients per ward `i % 10` never reaches the non-active slots. **The comment even ends
   "Mike's call."** So this is a one-line choice, not a build.
2. **`CareReviewRollup` already exists and is imported NOWHERE.**
   `src/components/reports/CareReviewRollup.tsx` calls itself *"Ward-level roll-up of the
   care-review board - the weekly audit at a glance."* The component T7 asks for is built and
   orphaned.
3. **The CQC cadences are mostly already encoded.** `REVIEW_ITEMS` in
   `src/lib/data/care-review.ts` has care plan 7d, care plan offered 7d, risk ax 7d, consent
   re-ask 7d, HONOS 30d, safety plan 30d - six of Mike's list, correct. Admission-once items
   (RMP, physical health, advocacy, read rights) are in `ADMISSION_GUIDE_MAP`.
   **The real gaps are triggers, not intervals** - see T9.
4. **9a is already done.** `STAFF_NAMES` holds full first and last names for all 25 staff.
5. **Consultants are deliberately NOT a role.** `UserRole` is staff|lead|manager|ward_admin|
   senior_admin; consultants are a separate name-per-ward map, and the code comment says
   *"Consultants are separate so the ward staff list stays nurse/leadership only."* T13 reverses
   a deliberate decision, so it needs a call not a patch.
6. **The T4 dead end is navigation, not data loss.** `admission-checklist/page.tsx` offers only
   `href={v2Href("/guides")}` as an exit, but `PatientLink` does persist ticks against the
   patient. Less urgent than it looks, still a real break.

### The split

| # | Job | Who | Blocked by |
|---|---|---|---|
| T1 | Annotation / comment layer (2a) | Claude, after ONE storage decision | Mike |
| T2 | Email Nat, housing pathway flow (2b) | **Mike at work** | - |
| T3 | Email safeguarding lead re gaps (2c) | **Mike at work** | - |
| T4 | Fix checklist navigation dead end (5) | **DONE 3 Aug** (747fe59), verified 6 Aug | - |
| T5 | Consolidate patient list filter row (6) | Claude, one-line choice | Mike confirms |
| T6 | Wire orphaned CareReviewRollup into /overview (4b) | **DONE 3 Aug** (747fe59), verified 6 Aug | - |
| T7 | Care review reviews into diary (4a) | Claude | Mike decides auto vs manual |
| T8 | 72hr + named nurse audit tool, CQC gaps (2e) | Claude, biggest build | design session |
| T9 | SystmOne prompt + link audit across guides (2f) | **Claude audits alone**, Mike fills gaps | part-blocked |
| T10 | "Add all to tasks" on checklists (2d) | Claude proposes, Mike confirms | - |
| T11 | Walk-round printout per ward (2g) | Claude | **Mike supplies example** |
| T12 | Interim Excel ward diary (3) | **DONE 3 Aug** | - |
| T13 | Consultant role + unward-linked staff (7a, 7b) | Claude | **Mike decides model** |
| T14 | Consultant selector on ward allocation (8) | Claude | T13 |
| T15 | Staff records linked to email (9b) | PARKED | NHSmail SSO (R3) |

### T1. Annotation / comment layer (his 2a) - the centrepiece

Admin-gated overlay: click any tile, text block or graphic, attach numbered prompts 1-2-3 plus
notes, `(A)` marker changes colour once an element carries comments. Purpose is Mike commenting at
work, then working through them with Claude at home.

- **Do NOT hand-tag elements.** 197 files. Use a dev-mode overlay that derives a stable
  selector plus a text fingerprint from whatever is clicked, so the feature costs zero edits
  across the app and survives minor reshuffles.
- ⛔ **Storage is the decision, and localStorage alone FAILS the actual use case** - he comments at
  work and reads at home, different machines. Three options:
  - **Recommended: localStorage + a "Copy all comments" button** that puts JSON on the clipboard.
    He pastes it into chat at home. Zero infrastructure, zero governance change.
  - Supabase. Would work, but it would be the **first live database use**, which falsifies
    "there is no database in use" in `docs/assurance-sheet.md` and touches the DPIA. Not worth it
    for UI comments.
  - Export/import a JSON file. Same as option 1 with more friction.

### T8. Audit tool + the CQC cadence gaps (his 2e)

Six intervals already encoded (see finding 3). **What has no model at all:**

- **Event-triggered reviews.** Risk ax and RMP "after any incident". Rights re-read on transfer
  between wards, change of RC, or any change in capacity. The tracker only understands
  `intervalDays`, so an event trigger is a new concept.
- **One conditional.** *"If any needs are identified on the physical health ax, an interventions
  care plan should be created."* A review that only exists if another one found something.
- **A two-place requirement.** Consent to share must be documented **in both the care plan and the
  SystmOne daily notes**. A single tick cannot express that honestly.
- Plus: join up `DEMO_AUDIT_72HR_TASKS` so completed tasks sit with the patient and the audit
  carries week to week.

⚠ **Device-boundary note for this one.** An audit tool that says "this is overdue against the
Trust's stated cadence" is reproducing a policy requirement - the safe side of the line. A tool
that infers *clinical* priority, or interprets whether a review was adequate, is not. Keep it to
dates against stated intervals.

### The CQC / Trust cadence list as supplied (3 Aug, verbatim - do not paraphrase into a guide)

- Care plans updated weekly with patient input
- Risk assessments updated weekly minimum, or after any incidents
- Care plans offered weekly
- HONOS updated monthly unless significant changes
- Safety plans updated monthly
- Risk management plans completed on admission, updated after any incidents
- Physical health assessment completed fully on admission, updated if significant changes
- If needs identified on the physical health assessment, an interventions care plan created
- Advocacy referrals completed once on admission
- Rights read on admission, transfer from wards, change of RC, or changes in capacity
- Consent to share asked on admission and re-asked weekly, documented in **both** the care plan
  and SystmOne daily notes

### T12. Interim Excel ward diary (his 3)

⭐ **Identifier SETTLED 3 Aug: initials + NHS number. Mike's decision, and his reasoning is right -
do not re-litigate.** Claude first argued an NHS number is *more* identifying than a name; Mike
corrected it from IG training and won the point. **NHS number is the canonical pseudonymous key:**
anyone able to resolve one already has legitimate record access, and a sheet found on a bus cannot
be resolved by the finder, whereas a name identifies instantly. It is also the clinically safer
identifier (the two-John-Smiths problem), which is why it is on wristbands and pathology requests.

Two refinements that survive, and are worth **saying** rather than acting on:

1. **Pseudonymised is still personal data** (UK GDPR Art 4(5) / Recital 26 - re-identification is
   possible with the lookup). So the file is handled as a patient list, and **"not personal data"
   is not a claim to make to IG.** Same discipline as the cookie and no-database lines.
2. **The sensitive combination may not be the NHS number.** `initials + ward` on a five-bed ward is
   often uniquely identifying to anyone who knows the ward, and because this is a mental health
   unit the dataset discloses health status *by inference* even when nobody can be named. Task text
   does the same work ("Section 3 papers due").

Mitigation is deliberately cheap: **no ward name in the filename, one header line saying what the
file is.** No warning sheet - he asked for quick and dirty.

The realistic failure mode is not the bus. It is that the sheet never gets deleted, gets emailed
on, and drifts - the exact scatter wardHub replaces. Worth saying out loud when it is retired.

Build in `E:\Hub`, outside the repo, so it cannot deploy.

**BUILT 3 Aug 2026.** `E:\Hub\interim-diary\ward-task-diary.xlsx` (outside the repo, cannot deploy).
Rebuild script kept beside it: `build_diary.py` (needs `py -3 -m pip install openpyxl`).

Seven sheets: **Read me · Jobs · Dashboard · Patients · Staff · Repeats · Lists.** Opens on Jobs.

**Features carried over from wardHub:** claim (Claimed by, dropdown off the Staff sheet) · take
over (overwrite the name) · drop (clear it) · hand-back (Status "Handed back" + a 7-option reason
dropdown) · waiting-on + chase date, with a live "chase in (days)" that goes red when it passes ·
priority (4 levels, Urgent and High colour their own cell) · shift · type (Team/Patient/Appointment)
· barrier-to-discharge flag (amber, and its own Dashboard block) · age in days, freezing when done ·
an OVERDUE flag that tints the whole row · Done and Handed back grey the row out · autofilter on all
20 columns · patient initials and NHS number driven off a Patients sheet so nothing is retyped ·
a Repeats sheet holding the weekly team-job pattern · a Dashboard of 20 counters including a
pick-your-name "My jobs" block.

**Deliberately NOT faked:** append-only task history. Excel cannot do it, so when a job is taken
over the previous owner is simply overwritten. **That is the honest argument for wardHub** and the
Read me sheet says so in as many words - it is also why Excel cannot generate the repeats, warn on
concurrent edits, or keep free text out of the wrong column.

**Verified, not assumed:** opened through Excel COM, full rebuild, **1,220 formulas and 0 error
cells**; every dropdown, defined name and conditional-format rule confirmed present after a native
Excel re-save; and a live test (claim a job, pick the name) moved "My open jobs" to 1 and dropped
"Unclaimed" from 3 to 2. Formulas are deliberately pre-2010 only (COUNTIFS / IF / TODAY) - no
FILTER, XLOOKUP or dynamic arrays.

Three example rows are marked EXAMPLE and use the **999 000 0000 NHS test range**, which is
reserved nationally and cannot belong to a real patient. Read me tells the user to delete them.
The print header on every sheet carries the "contains patient identifiers" warning, since the
printout is the actual exposure route.

**Still open for Mike:** add your real staff to Staff and current patients to Patients (both feed
the dropdowns). Tune the Repeats list to the ward's actual pattern - it is currently seeded from
wardHub's team-job templates.

### Open questions for Mike (all in the live task list too)

1. T1 storage - clipboard-copy, or Supabase and accept the governance consequence?
2. T5 - remove the two filters as proposed, or reorder `PATIENT_STATUSES` so the demo shows them?
3. T7 - manual "add review to diary" button, or automatic? Auto is 25 patients x 6 items = 150 tasks.
4. T13 - consultant as a `UserRole`, or a separate directory section? Reverses a deliberate call.
5. T12 - which task features carry into Excel? (Identifier SETTLED: initials + NHS number.)

### T9 AUDIT RESULT (done 3 Aug, Session 54) - SystmOne prompts across the 68 guides

Counted in code, including the builder guides and the static routes that call `FocusLinks`
inline (an earlier per-id scan missed both, so the first number was too low - recount before
trusting any figure here).

**12 of 68 carry a "record it on SystmOne" how-to link:**
`capacity-assessment` · `honos` · `news2` · `section-132` · `section-17` ·
`seclusion-support-plan` · `restraint-monitoring` · `observation-engagement` · `safety-plan` ·
`care-plan` · `risk-assessment` · `leave-discharge-transfer`

**7 have a FOCUS block but POLICY ONLY, no S1 how-to:**
`awol` · `blanket-restrictions` · `dols` · `section-136` · `tribunal-report` ·
`admission-checklist` · `mha-checker`

**49 have no FOCUS block at all** - and these are disproportionately the light guides and the
referral workflows, which is exactly the group Mike named as the priority.

⛔ **Why the remaining 49 were NOT filled in overnight.** The missing piece is *where in
SystmOne* each task is recorded, which is ward knowledge held by Mike, not something in any
document Claude can read. Inventing plausible FOCUS `download_file` URLs is the same failure
mode as the 15 invented contact values fixed on 28 Jul - they rendered indistinguishably from
the verified ones. **A fabricated S1 link is worse than no link**, because a nurse who follows
it and finds nothing stops trusting the ones that are real.

**Two separable jobs, and only the first needs Mike:**
1. **Needs Mike:** the S1 location per task for the 49. Fastest route is probably the FOCUS
   SystmOne user-guide map already harvested at `E:\Hub\tmp-mha\systmone-clinical-guides.txt`
   (264 guides) - Claude can match them to guides where the name is unambiguous, and Mike
   confirms. That is a session, not an overnight job.
2. **Claude alone, safe:** a link-free prompt ("record this on SystmOne") where a guide has no
   link at all. Deliberately NOT done unsupervised - it is a wording change across 49 guides,
   and several referral workflows already say it in prose in their case-note or diary-reminder
   step, so it would duplicate. Needs one pass with Mike to agree the wording and skip the
   guides that already cover it.

Feed the outcome back into the Guide Builder agent instructions so new guides arrive with it.

---

## U. WAGOLL folder (6 Aug 2026, Session 57)

Twelve source documents from `E:\Hub\WAGOLL` (kept OUTSIDE the repo - Mike's call). Full
placement table and the reasoning are in `docs/WAGOLL-review-list.md`. Nine are now
printable HTML pages under `public/forms/`, linked from their guides.

**Built and pushed:**
- **NEW** `/guides/cmht-referral` (Specialist Pathways) - CMHT + EI, worked example printed
  in full, real EI criteria and the 10 template questions.
- **NEW** `/guides/stepdown-referral` (Social & Housing) - from the Step Down form V2 May 2023.
- New content steps on `picu` (NAPICU inclusion/exclusion), `safeguarding` (pointers, the
  fact-vs-opinion rule, the five pitfalls), `homeless-discharge` (SystmOne questionnaire),
  `social-care` (the eight outcome areas), `tribunal-report` (the 16 T134 questions).
- `GuidePromptConfig` gained an optional `downloads` field; used by the seclusion support plan.
- Authoring metadata cleared from all 12 source files (the legacy `.doc` held two staff names
  in its OLE summary stream).

**Open, needs Mike:**
- [BLOCKED] **Nursing Tribunal Report - Completed.pdf.** Mike is digging into whether the
  narrative was rewritten or lifted from real notes (dated entries, staff initials, a Datix-
  looking ref). Neither tribunal file is built. Nothing from it is in the repo.
- [BLOCKED] Submission routes for `cmht-referral` and `stepdown-referral` - both say
  "Submission route to confirm [confirm]". Both guides are RED until these land.
- [BLOCKED] Kingfisher House email + phone are printed on the referral form. The guide and
  the HTML page both show "Hidden in demo mode". If they are publicly listed they can go in;
  if not they belong in `E:\Hub\temp\internal-contacts.md` keyed to `picu`.
- [ ] **No blank Step Down form exists** in the folder, only the completed one. That entry
  reads "Blank form to confirm".
- [ ] EI: Mike's CMHT doc says EI hold someone 2 years then hand to CMHT; the EI service
  template says "prior treatment not exceeding 12 months in secondary care or 3 years post
  initial treatment". Read as caseload duration vs entry window - both are printed, sitting
  next to each other. Worth one line confirming.
- [ ] PEEP currently lives inside the seclusion support plan, the only place a PEEP exists.
  If PEEPs are written for mobility as often as for seclusion it wants its own small guide.
- [ ] Two typos corrected in the CMHT worked example ("ever 4 weeks" to "every", "route cause"
  to "root cause"). Revert if Mike wants it verbatim.

---

## V. THE SANDBOX PLAN (6 Aug 2026, Session 56) - hosting, trial and handover direction

**Where it came from:** the post-presentation reply-all (roadmap, SENT 6 Aug) led to a direct
thread with Cris, who put his team's standard stack in writing and agreed the phased approach.
Full context in memory `session-56-replyall-and-claude-request`.

### The Trust standard stack (Cris, 6 Aug, in writing)

ASP.NET Core MVC · Azure App Service · Azure SQL Database · UK Azure regions · NHSmail
authentication + app-level access controls · custom domain purchased through Azure (Web Team
managed, auto-renewing TLS) · Git · CI/CD with dev/test vs production separation · logging,
monitoring, backup and retention as standard practice · internal governance approval before
ANY app goes live · **DPIA required for EVERY application - fictional-data demos included.**
The DPIA for a no-personal-data app will be short, but stop claiming the hosted phase needs
no sign-off; the process runs regardless.

Cris also stated plainly: his team cannot adopt or maintain the existing Next.js codebase.
For them to ever own it, it has to be on their stack. That is what makes the plan below the
plan.

### The plan - FINAL SEQUENCE (settled 17 Aug 2026)

1. [ ] **Send Cris the sandbox proposal** (redrafted and polished 17 Aug, ready). Send it
      BEFORE the group catch-up email, so Cris isn't introduced to his own starring role via
      the group. The ask: his team stands up a **"sandbox"** (their standard setup - App
      Service, Azure SQL, UK regions - dev/test only, nothing live) with Git access for
      Mike. Env settings via their secrets process, never email. Cris may monitor PRs as
      much or little as he likes; development and maintenance stay with Mike, no commitment
      from his team beyond the setup.
2. [ ] **Mike ports wardHub from Next.js to ASP.NET Core MVC** (Claude-assisted, evenings),
      inside THEIR pipeline from day one - so the eventual handover is a hardening pass and
      a change of maintainer, not a third build. The sandbox's job is to prove the
      infrastructure works.
3. [ ] **In the sandbox:** DPIA and governance paperwork completed WITH Cris against the
      real target system (written once, never redone); **guides REBUILT through the agent
      pipeline, THEN signed off** - sign-offs attach to the rebuilt generation only, since
      signing the old generation first would be invalidated by the rebuild; the NHSmail SSO
      application goes in once the Azure domain exists (the redirect URI needs it).
4. [ ] **Promote sandbox -> live environment, still on fictional data.** The PII decision
      does NOT gate this move - the live environment stands up and soaks with fictional
      data.
5. [ ] **The PII decision gates WARD ACCESS, not the build.** Decision lands (full name /
      initials + NHS number / SystmOne sync) -> the two wards get access -> the trial
      starts, on the ported app in the live environment. Nothing to rebuild between a
      successful trial and rolling out. The September line, verbatim: *"The trial runs on
      the same build, on the same infrastructure, that would carry on afterwards."*
6. [ ] **After a successful trial the two wards keep access** (Mike maintains, with agreed
      limits - say so before Cris has to raise his operational-reliance point). No decision
      on if or how his team takes over unless the trial proves a success.

### Build implications - read before ANY session touches hosting, persistence or guide data

- [ ] ⭐ **Highest-leverage prep job: export guide content to a stack-neutral data format**
      that both apps consume. Sign-offs then attach to content versions and SURVIVE the port
      (otherwise porting invalidates all 68 signatures and nobody re-reads them twice), and
      the automated Guide Builder's target becomes "produce valid guide-data" - testable the
      moment the M365 agents are accessible again, independent of the port.
- ⛔ **Feature-freeze the Next.js build once the port starts.** Content changes are fine.
      Two diverging codebases is the failure mode.
- **Persistence targets Azure SQL, never Supabase.** Nothing is built on Supabase (dormant,
      no DB in use), so switching the target costs nothing today. On this path the
      Supabase-region chase is moot.
- **Do not transfer wardhub.live.** The Trust buys its own domain through Azure per their
      standard, which keeps the domain - and the IP question (Section R4) - untangled.
- Terminology: **"sandbox"** = the fictional-data-on-Trust-infra stage. Never "fake PII" in
      writing; fictional demo data is not personal data.
- The Claude Code seats / AI-tooling-in-their-repo conversation belongs at the moment port
      work starts inside their pipeline, not before.
- [ ] ⭐ **Prep that waits for nobody: schema -> validator -> agent instruction block** (output
      format + guardrails), all buildable and testable against the CURRENT Next.js site
      before the port exists or Cris replies - both generations consume the same guide-data.
      The agent pipeline is the least-proven link in the whole pitch (session 51 test:
      retrieval excellent, output format unusable and resistant to correction) and is
      blocked on agent access - prove it early, not after the port.
- **The existing 68 guides are the MARK SCHEME** for agent rebuilds: compare every rebuild
      against the known-good version (the session-51 blind test, designed and still unrun).
- **Pitch honesty:** uniform LOOK comes free from rendering guide-data - the rebuild buys
      PROVENANCE (source doc -> tenant agent -> valid data -> render -> sign-off, no "Mike
      at home" link). Agents cover Tier A (single-SOP restructure); Tier B synthesis stays a
      human+AI editorial job outputting the same format.

---

## W. Risk tool rebuild (20 Aug 2026, Session 58)

`/guides/risk-assessment` reworked against the SystmOne risk screen screenshots Mike
supplied on the day. All seven domains, their sub-domains, the `Display clinical
indicators for ...?` prompts and the `No evidence ...` lines were already verbatim and
were re-verified against the source. Three real deltas fixed, plus the layout rebuild.

### Done
- **Domain 5 clinical indicators added (27 items).** Physical health / frailty was the
  only domain with no `5a.i` list in the app. Now transcribed verbatim, including the
  form's own `Crital meds (warfarin, Parkinson's)` typo and the open-ended `High BMI >`
  (Rule 7 - trust wording is not tidied up).
- **Question 8 wording corrected.** Was "Do you, or has anyone else, expressed concerns?";
  the form says **"Do you have or has anyone else expressed concerns?"**. It was wrong in
  the generated risk-screen text too, which is what gets pasted into a case note.
- **The tail of the form is now modelled** (`SCREEN_TAIL` in `risk-screen.ts`): field 9 is
  the single **Risk Formulation** free-text box, followed by the mandatory gate *"If any
  Risks have been identified you must select YES below and complete a Risk Management
  Plan"* and the single **Risk Management Plan** box. The tool's two documents paste into
  exactly those two fields - shown on screen so people know where the output goes.
- **Wizard replaced by a top-down accordion.** Seven domain rows, always visible, each
  showing its own state (Not started / in progress / n risks, n indicators, n/13 answered
  / No evidence confirmed). Click to open, others collapse. No Back/Next march - jump in
  and out in any order, which is how the job is actually done.
- **Quick capture.** Paste a line spotted in an old risk tool, AMHP report, section papers
  or case notes, pick the domain, add a date if known, and it lands in that domain's
  examples. Undated lines sink to the bottom, the rest sort most recent first. Anything
  dated before this year defaults to Historical unless you say otherwise.
- **Generate guard.** A domain nobody opened is not the same as a domain with no risks.
  Generating with untouched domains opens a modal listing them, each with "Confirm no
  risks known in this domain"; confirming writes that domain's exact "No evidence ..."
  line into the risk screen output. Nothing generates until every one is confirmed.
- **Chip provenance, three tiers** (Mike's call, 20 Aug). Trust wording is plain; anything
  wardHub wrote carries a **purple ring**; words the user adds carry the ring plus a
  marker. `ChipSource` on `RiskChipGroup`; a legend sits under every chip bank. This is
  what lets the trust layer and the wardHub layer be signed off separately.
- **Add your own words**, per chip bank, keyed `${risk}::${questionId}` so a word added
  under "early warning signs" for violence comes back next time violence is planned, and
  does not leak into unrelated risks. `src/lib/data/guides/user-chips.ts`, localStorage
  `wardhub_user_chips`. Deliberately a flat string-array-per-bank so it moves to a user
  profile row when accounts exist, with no migration.

Gates green: `tsc` 0 errors, `eslint src` 0 errors (7 pre-existing warnings in older
files), 71 tests pass. Verified in the browser: all 27 domain-5 indicators render, capture
routes and date-sorts, guard blocks and writes the right lines, user chip persists.

### Open - needs Mike
- [x] **Domain 5 indicator list is complete** - Mike confirmed 20 Aug that "Hospital
      admission linked to eating disorder" is the last one. 27 items, all in.
- [ ] **Spot-check the domain 5 indicator routing.** `INDICATOR_BACKGROUND["physical-health"]`
      decides which ticked indicators read as background (into the formulation) and which
      are things you watch for (into the plan). Standing conditions and long-term
      medication factors were put on the background side; delirium, vomiting, swallowing
      and concordance on the watch-for side. This joins the same open spot-check from
      8 Jul for the other six domains.
- [x] **The 13 questions now fit their domain** (20 Aug, second pass). They are still
      wardHub authoring, not form wording - the proofreading pack labels them as such.
- [ ] **11 of the 36 sub-domains still map to no tailored chip bank** - all nine of domain
      6 (children) plus "Domestic appliance issues" and "Lack of social stimulation /
      activities". They fall back to generic chips. Needs new chip banks, which is content
      Mike has to approve. (Part 4 of the proofreading pack lists them in red.)
- [ ] **Tailored chips cover only 4 of the 9 formulation sections** (predisposing,
      precipitating, perpetuating, dynamic). Protective factors, pattern, engagement and
      judgement are generic for all 28 risks. Protective is the one NICE NG225 leans on.
- [ ] **Still RED.** Nothing here flips it - that is Mike's editorial call, and the
      proofreading pack (every domain, question, chip and template in one printable
      document) is the thing that would make the sign-off doable.

### W2. Second pass, same day (Mike's three notes + the pack)

- **The questions now fit the domain they sit under.** They were one generic run of 13
  shown identically under all seven domains, which read as though the patient is the
  source of every risk. Wrong for half of them: in domain 4 the patient is the one being
  harmed, in domain 6 the person at risk is a child, and in domain 7 the risk is a
  situation rather than a behaviour. Those three are reworded throughout, the other four
  sharpened so each question names the actual risk. Routing is untouched, so an answer
  still lands in the same output section whichever domain asked for it.
  New file `src/lib/data/guides/risk-questions.ts` - the question set moved out of the
  page component, which also serves the stack-neutral export job in Section V.
- **"Display clinical indicators ...?" is out of the grey box and required.** It has its
  own bordered card per domain, amber with a "Needs an answer" badge until answered. The
  generate guard now blocks on any worked domain where it is still blank, and offers the
  Yes/No inline so it can be answered without leaving the modal. Domain 1's `1a` safety
  question got the same treatment.
- **Current and historical no longer look identical.** Two distinct cards: rose "Now -
  current concerns / What is happening at the moment", slate "Before - historical risk /
  What has happened in the past". Separate gap prompts, and the dated-example boxes are
  headed "Recent examples" and "Past events" in matching colours.
- ⭐ **The proofreading pack is built** - `src/lib/utils/riskProofreadPack.ts`, printed
  from the "Proofreading pack" button on the tool. Seven parts and a sign-off sheet,
  ~17,800 words, 21 tick-box sign-off blocks, rendered from the SAME data the tool uses
  so it cannot drift. Every section is badged **Trust form** or **wardHub**, because they
  need two different jobs doing to them: the trust half is a word-for-word transcription
  check, the wardHub half needs clinical judgement and has never been approved by anyone.
  Part 4 is the sub-domain to chip-bank table with the 11 unmapped ones in red.
  **This is the thing that makes the RED sign-off doable - it is now on Mike.**

### W3. Tester feedback, 20 Aug (evening)

Fed back by someone else using it on the ward, not Mike.

- **Captured events could not be removed, and only fitted one domain.** Technically each
  example always had an X, but only inside the domain, buried in the right narrative card
  - from the capture box where you added it there was no record, no trace and no undo.
  Now: the domain picker is multi-select (one event files under as many domains as it
  fits, in a single add), and a **Captured so far** list sits under the box showing every
  captured event with its date and which domains it went to. Removing asks which domains
  to take it out of - Mike's call over removing everywhere - so a copy can be kept in one
  domain and dropped from another.
  The list is **derived** from the domains rather than tracked alongside them, so deleting
  an example inside a domain can never leave a stale row behind. Captured examples carry
  an `id`; ones typed straight into a domain do not, and never appear in the list.
- **Found while testing:** the capture panel spread stale state (`{...capture}`), so two
  quick clicks on different domain chips lost one. Switched to functional updates.
- **"Not yet established" came out as a bare repeated sentence.** The formulation runs as
  prose with no section headings (deliberate), so every unanswered section dropped in the
  literal words with nothing to say WHAT was not established - four in a row was real.
  Now the gaps come out of the prose and are named once at the end:
  *"Not yet established: pattern over time, predisposing factors, perpetuating factors and
  protective factors."* Still meets the trust rule about recording what could not be
  established rather than leaving a blank, and it tells the reader which gaps are open.
  The management plan is unchanged - each section has a heading above it, so
  "Not yet established." reads correctly there.

Checked and NOT a bug: the plan's WHAT IS THE RISK carries the `q_seen` answer as well as
the formulation's presenting risk. That is deliberate and commented in `deriveRmp`.

### W4. Answering the trust RMP guidance (20 Aug, fourth pass)

Mike supplied **"RISK MANAGEMENT PLANS 18/04/24"** - the only trust document written for
this task. Checked the tool against it line by line.

**What the guide says, and what it does not.** It is entirely about the *management plan*:
the title, the six content requirements, the five template headings, the mandatory MDT
closing line, the 24-hour rule. **It says nothing about a formulation.** The formulation
exists only as field 9 on SystmOne with no template and no content rules.

That is why people did not know why they were answering the questions: **six of them build
the document the trust mandates and eight build a field with no trust template**, and they
were presented as one undifferentiated run.

- **The manage / prevent split.** The guide lists "how we should manage this risk when it
  occurs" and "how to try to prevent or reduce it" as two separate content requirements
  under the one heading HOW TO PREVENT / REDUCE. We asked them as one question, and the
  manage half kept getting missed. Now two questions - "What do we do when it happens?"
  and "What prevents it, or reduces how often it happens?" - each showing only its own
  chips, printing as two labelled lines under the one heading:
  `When it happens: ...` / `To prevent or reduce: ...`. `writes.part` on the question and
  `prevent__manage` / `prevent__reduce` in the derived state carry it.
- **Every question is badged Plan, Formulation or Both**, with a "Why you are answering
  these" panel at the top of each question set that says plainly which half is the
  mandated document and which is best practice with no trust template.
- **The plan is named after the risks ticked, not the domain.** The guide's own examples
  are "self harm / risk to others / violence and aggression" - that last one is a domain 3
  sub-domain. The plan now heads `VIOLENCE AND AGGRESSION, DAMAGE TO PROPERTY, FIRE
  SETTING` instead of `RISK OF HARM OR NEGLECT TO OTHERS`, and the on-screen header reads
  "Build the plan for: ..." instead of the meaningless "whole-domain plan".
- ⚠ **Bug found while testing: the same stale-state pattern as the capture panel, across
  every domain handler.** Ticking three sub-domains quickly registered one. Every write to
  a domain now goes through `updateDomain(id, fn)` using the functional form - 16 call
  sites converted, `setDomain` deleted. This was silently losing ward staff's clicks.

Still open from this pass: the chip deep dive (Mike chose the full scope - the 11 unmapped
sub-domains, the four missing formulation sections across all risks, and a specificity
pass over the existing banks).

### W5. The chip deep dive (20 Aug) - Mike chose the full scope

**1. The 11 sub-domains with no bank.** All nine of domain 6 (foetus, infant, child
under 18) plus "Domestic appliance issues" and "Lack of social stimulation/activities".
Domain 6 offered nothing tailored at all, which is the worst place for it. Eleven new
risk types with full RMP and formulation banks. The child set holds one line throughout:
**the person at risk is the CHILD, not the patient** - so the plan is about what we
observe, what we restrict (contact, leave, discharge home) and who we refer to, and the
formulation is about the adult's history and circumstances. Referral routes are named,
because "make a referral" is not a plan.
**All 36 sub-domains now map, and all 39 risks have both banks.**

**2. The four missing formulation sections.** Pattern, protective and engagement were
generic for every risk, so planning child protection offered self-harm's protective
factors ("no current access to means", "future-oriented thinking"). Now tailored across
all 39 - seven formulation banks each instead of four.

⭐ **Judgement was deliberately left generic, and the reason is in the file.** Its chips
are severity labels (low / moderate / high, short and medium term) that the clinician
picks for themselves. Writing per-risk versions would mean the tool suggesting a risk
LEVEL for a named risk. The tool offers vocabulary; it never rates or stratifies risk,
and that line is what keeps it a drafting aid rather than something that interprets.

**3. The specificity pass - what the audit actually found.** Mike asked for a rewrite of
the existing banks. Auditing first rather than rewriting blind: across **429 risk/section
banks and 2,591 distinct chip words, only 8 words appear under five or more risk/section
pairs** - and every one is a genuinely cross-cutting action ("inform the ward safeguarding
lead", "increase observation level", "refer to children's social care", "MDT review",
"offer PRN"). Sixteen banks hold fewer than five words, and fifteen of those are the rare
child sub-domains written today, where four honest options beats padding.

**So the banks were already specific and a blanket rewrite would have been churn.** The
one real fault found was inconsistent phrasing: `MDT / risk strategy review` in ten places
against `MDT review` in seven, for what the trust guide treats as two separate actions.
Normalised to the guide's own words - "MDT review" and "arrange a risk strategy meeting"
as distinct chips. No duplicate words within any single bank.

**All of it is wardHub wording carrying the purple ring, and none of it is approved.** It
lands in Part 5 of the proofreading pack, which is now considerably longer.

### W6. MDT review vs risk strategy meeting (Mike, 20 Aug) - they are different processes

Mike's correction. Acting on it turned up more than the one phrasing already fixed.

- **The bare "MDT review" chip duplicated the mandatory line.** It sat in 17 NEXT STEPS
  banks, where the trust's closing line is appended automatically. Picking it made the
  plan say the same thing twice. Removed; the specific variants that say something
  different ("MDT review of observation level", "MDT review before discharge home") stay.
- **More combined chips found.** The first normalisation only caught one word order.
  Also present: `risk strategy / MDT review` (x2), `urgent MDT / risk strategy review`,
  and the same fault in three other pairs - `MDT / duty doctor review`,
  `MDT / discharge planning review`, `MDT / behavioural review`. All nine split into
  separately named actions. **No combined phrasing remains.**
- ⚠ **A third meeting was being confused.** The domain 6 banks written earlier used
  "strategy meeting" for the statutory s47 safeguarding strategy discussion - a different
  process again from a trust risk strategy meeting. Renamed to
  **"safeguarding strategy meeting"** (5 chips) so the two cannot be read as the same.
- **Placement: Mike's call was "both, because it is genuinely both."** A risk strategy
  meeting can be called while managing an incident (where the trust guide lists it) or as
  escalation when the plan is not holding. It now appears in **both** slots for the 15
  risks where it applies, and in neither for the rest. Before this it was in NEXT only for
  12 risks, MANAGE for none, and - the giveaway that the distribution was arbitrary -
  **suicide, violence and aggression and risk to others had it in neither**, which are the
  three where it is most obviously indicated.
- Wording: the escalation question now says the two are different processes and asks which
  one you mean; the manage question notes it is the same meeting reached either way.

**Set widened to 18 on Mike's instruction (20 Aug): falls, hoarding and discharge risk
added.** The remaining 21 do not carry it - including all the child sub-domains, which
carry the safeguarding strategy meeting instead. Widen further if it does not match the
ward.

### W7. Softening the palette + widening the risk strategy set (20 Aug, late)

**Risk strategy meeting set widened to 23** on Mike's instruction: self-neglect / ADLs
(his call), then continued on my judgement to medication non-concordance, refusal to
engage, boundary violations and observations / refusal of obs - all cases where
persistent, escalating risk is a plausible reason to convene one. Both slots as always.

Deliberately **not** added, for review: physical health deterioration, cognitive
impairment / confusion, infection / delirium (medical escalation is the route, not a risk
meeting); homelessness / housing instability and unsafe home / appliances (discharge
planning); sleep disturbance and social isolation (not the right forum); and the nine
child sub-domains, which carry the **safeguarding strategy meeting** instead.

**The palette.** Mike: "lots of bright red on this - makes the viewer jump to the red bits
thinking they are more important when actually sometimes it's just a heading." True: 62
red/rose usages in the page, most of them structural. The rule now applied:

- **RED means "this needs your attention", and nothing else may use it.** What kept it:
  the page header (the guide's identity, one element), the Generate button (the primary
  action), the destructive Remove button, the weak-example label, and the amber warnings.
- **SKY** = chosen or active: selected chips, the "Now - current concerns" narrative.
- **SLATE** = structure: open panels, sticky headers, section labels, borders, tints.

99 replacements in the page, plus the SectionEditor's rose accent in `risk-capture.tsx`
(a selected chip is "chosen", not "urgent"). Focus rings moved from rose to sky, which
also reads better as a focus indicator. The Now/Before distinction is preserved - sky for
now, muted slate for the past - including in their dated-example boxes.

⚠ **Not visually confirmed:** the open-domain accordion header. The CSS is provably
correct (an identical clone in the same parent, same position, same attributes paints
`bg-slate-700` correctly) but the live node would not repaint in the automated browser
session even after reloads - a style-recalc artefact of that environment. **Worth an
eyeball on a real browser.** Everything else was measured on the live page.

### W8. Proofreading pack brought up to date (20 Aug, session close)

The pack renders from the same data as the tool, so today's content was already in it
automatically - the 27 domain 5 indicators, the 11 new chip banks, the three new
formulation sections, the reworded per-domain questions, the manage/prevent split. What it
did **not** carry was the *reasoning* behind three decisions, which is exactly what a
reviewer needs in order to sign off rather than just proofread. Added:

- **Why the overall risk judgement has no per-risk words.** Flagged in Part 5 as a
  deliberate decision, not an oversight: per-risk versions would mean the tool suggesting
  a risk level for a named risk, and it offers vocabulary rather than rating risk.
- **The three meetings, named and separated** - MDT review, risk strategy meeting,
  safeguarding strategy meeting - so nobody reading the banks merges them again.
- **The two places output differs from input** (Part 6): HOW TO PREVENT / REDUCE printing
  as two labelled lines, and the plan being named after the risks ticked rather than the
  domain. Plus how unanswered sections print differently in the plan and the formulation.

**Pack is now ~26,500 words, 21 sign-off blocks, every part badged Trust form or wardHub.**
Verified end to end: all 27 domain 5 indicators, zero unmapped sub-domains in the Part 4
table, the child banks, the new sections, and all three new explanations render.

~~This is where the session ends. RED is blocked on Mike reading the pack, nothing else.~~ **SUPERSEDED 25 Aug: the pack is gone and the guide is amber, signed off the normal way (Y9).**

---

## SECTION X - The RMP breakthrough (22 Aug 2026)

**⭐ This is the live section for the risk tool. It supersedes Section W's question design.**

Mike opened the session with three complaints and a written spec. All three are fixed and
most of the spec is built. Commits `b0be86d` and `2df4759`, pushed, all gates green.

### X1. The three complaints - all fixed

1. **The screen jumped and he lost his place** when clicking "display clinical indicators"
   or "done with this section". Cause: toggling a panel changes the height of the page
   around where you are looking, and the browser keeps its scroll offset. Fixed with a
   `useScrollKeeper` hook - `keepInPlace(id)` holds an element still across a state change,
   `scrollToTop(id)` parks a header under the sticky bar when the content collapses away.
   Wired to the domain accordion, "done with this domain", the indicators Yes/No, the
   sub-domain row and the plan-question headers.
2. **The chips were the same regardless of domain**, so plans came out repetitive. Now three
   tiers per question: the ticked clinical indicators first (trust wording), then the ticked
   sub-domains' own banks, then a universal library folded behind "show all options". The
   generic fallback only appears when something ticked genuinely has no bank of its own.
3. **Twelve questions took ages.** Now six.

### X2. ⭐⭐ The breakthrough: the formulation is assembled, not asked

The run was doing two jobs. Six questions built the mandated Risk Management Plan; the rest
built the SystmOne Risk Formulation field, **for which the trust publishes no template at
all** - so wardHub had invented a formulation framework and was asking staff to fill it in.

Field 9 is now generated from the ticked sub-domains: one bullet per domain, always all
seven, naming the sub-domains selected or that domain's own exact "No evidence" wording.
It draws on nothing else - no indicators, no narratives, no dated events, no inferred
causes, triggers, protective factors or overall judgement.

**Why this is the right call and not just a shortcut:** every word in it is either the
trust's own wording or a sub-domain the nurse chose, so it is a transcription of their
selections rather than an interpretation of the patient. It is faster AND it removes the
part of the tool that came closest to clinical reasoning. `q_judgement` is gone entirely.

It is editable; regenerating warns first that manual edits will be lost.

### X3. Ticked indicators are now offered, never inserted

They used to fold themselves into the plan's "how does this present". An indicator records
why a domain was considered relevant, not what is true of this person, so it now appears as
a suggested chip on question 2 and only reaches the plan if selected. Context-only
indicators (`INDICATOR_BACKGROUND`, e.g. "Male gender, under 35 years") are not offered as
warning signs at all.

### X4. Other changes made

- New `src/lib/data/guides/rmp-chips.ts` - the four universal banks, the named
  "not established" options, and `WHAT_IS_THE_RISK` (question 1's outcomes, keyed per
  sub-domain).
- An empty section prints "This section has not yet been completed."; a deliberate
  not-established choice prints its own wording. Two different things, never merged. The
  named options sit apart on screen, styled as gaps, with "This records a gap for review.
  It does not say there is nothing to find."
- `WHAT IS THE RISK` no longer repeats the plan title ("Fire Setting. Risk of deliberate
  fire setting." -> "Risk of deliberate fire setting.").
- **The stale-state bug, found for the THIRD time.** `SectionEditor` built its next value
  from the `state` prop, so chips clicked in the same tick overwrote each other - three
  fast clicks landed one. Every mutator now passes an updater (`SecUpdate` / `applySec`),
  and `/welcome` was migrated too. **If a fourth instance turns up, the rule is: any
  handler that spreads current state into a setter is suspect.**
- Domain 3's "what do staff do" hint said "when they become aggressive or unsafe" - wrong
  for fire setting, damage to property and the sexual-offences sub-domains. Made neutral.
- New `src/__tests__/risk-screen-inventory.test.ts` - 36 tests locking 7 domains,
  36 sub-domains, 125 indicators, per-domain totals, no duplicates, every sub-domain mapped
  to a bank that has chips, plus guards on the form's own "Crital meds" typo and the
  open-ended "High BMI >". **All passed as written - the transcription was already right.**
- Proofreading pack rewritten to match, including why the formulation changed.

### X5. [BLOCKED] Questions for Mike before this goes further

1. **The spec paste was cut off.** Section 14 (domain 2 chips) stops mid-sentence at
   "Contact relevant", and domains 3-7 chips were never sent. Domain 1's question-1 chips
   are in verbatim; **domains 3-7 were drafted here and have NOT been through Mike.** They
   are flagged in red in the pack. Send the rest, or review what is there.
2. ⭐ **One plan per domain contradicts the trust guidance already in the code.**
   `SEPARATE_PLANS_NOTE` quotes it: "Write a SEPARATE risk management plan for every current
   and historical risk - do not combine them into one big plan." The spec says one builder
   per domain. Current behaviour is the compromise: one plan per domain by default, named
   after the risks ticked, with the existing "Requires own RMP" toggle to spin any
   sub-domain out. **Mike to confirm that is the right default.**
3. **Domain titles and "no evidence" wording.** The spec's example text differs slightly
   from what SystmOne actually says (e.g. "foetus, infants or children under 18" vs the
   form's "foetus, infant or children (under 18 years old)"). Rule 7 applied - the code's
   transcribed wording is used, not the spec's paraphrase.
4. **Bullets are hyphens, not "•", in the copied text** - plain text is safer for SystmOne.
   On screen they render as proper rows. Say if the bullet character matters.

### X6. [ ] Copilot's suggestions - Mike said explore these AFTER the build

Not started. In his own order: honest "summary not formulation" labelling (already done in
X2), review responsibility and timing, provenance tags on events (observed / reported by
patient / reported by others / not established), qualifiers kept on conditional actions,
patient preferences as a chip category, "patient involved in this plan?" field, timeframes
on the signs-of-reduction chips, contradiction checks before copying, distinguishing
"not assessed" from "not yet established", and a setting filter (inpatient / community /
discharge). Plus his deliberately difficult test set.

### X7. [ ] Still open from Section W

- Spot-check `INDICATOR_BACKGROUND["physical-health"]` routing (and the other six).
- Whether the 23-risk "risk strategy meeting" set is right (W7).
- ~~Still RED, and still blocked on Mike reading the proofreading pack.~~ **SUPERSEDED 25 Aug: the pack is deleted and the guide is signed off like every other guide. Now AMBER - see Y5 and Y9.**

### X8. Mike's second pass, same day (commit `6dc7762`)

1. ⭐ **Ticked clinical indicators are now named in the formulation summary.** Mike pushed
   back on "Male gender, under 35 years": it is a recognised higher-risk group and the trust
   listed it deliberately. He is right. The distinction is **static vs dynamic** - it raises
   the baseline and does not change, so it cannot answer "what would staff notice when the
   risk is increasing", but it absolutely belonged in the old formulation's "what raises the
   baseline risk" section. With that gone the tool was **discarding something the form asks
   you to identify**. Each domain bullet now carries a second line:
   `Clinical indicators recorded: X; Y; Z.` Still pure transcription - trust wording, the
   nurse's ticks, nothing weighted, ordered or interpreted. Nil domains carry none.
2. **General options are no longer behind a collapse toggle** - a dashed rule and their own
   heading separate them from the tailored words.
3. ⭐⭐ **FIXED, and Mike found it: the self-harm chip leak.** Tick "Arson" and "Accidental
   fire setting" on domain 3 (both are INDICATORS, not sub-domains) and question 5 opened
   with *"reduced incidents of self-harm"*. Cause: no sub-domain ticked means no tailored
   bank, so the code fell back to `RMP_SECTIONS`' own default chips - **which were written
   for self-harm**. That fallback is deleted. If nothing ticked has a bank, no tailored
   words show and the general library carries the question alone (it is domain-neutral; the
   old defaults never were), with the hint saying why.
   **Audited: all 39 banks have all four RMP sections, so this was the only hole.**
   ⛔ `RMP_SECTIONS[].groups` is still used by `/welcome` - leave it, but never reintroduce
   it as a per-domain fallback in the risk tool.
4. Nine new tests pin the formulation summary, including one that strips every allowed
   string and asserts only punctuation remains - so no prose can creep into the one document
   the tool assembles on its own. **116 tests pass.**

### X9. [DECIDED] One plan per domain (Mike, 22 Aug)

**One RMP per domain is right, and the "Requires own RMP" toggle stays.** This settles X5.2.

The trust guidance quoted in `SEPARATE_PLANS_NOTE` ("write a SEPARATE risk management plan
for every current and historical risk") is met by the toggle rather than by forcing a split:
the default is one plan per domain, titled by the sub-domains actually ticked, and anything
that needs its own plan gets flagged and spun out. **Do not re-open this.**

### X10. Read the source design in Teams (22 Aug, late) - commit `7c43eb7`

Mike opened the M365 Copilot chat "Risk Management Plan Review" and asked for the whole
thing to be read. **His original paste had been cut off mid domain 2, and domains 3-7 never
arrived** - so those question-1 chips had been drafted by Claude and flagged unreviewed.
The source has everything. All invented content is now REPLACED.

**Now implemented from the source:**
- **Per-domain banks for questions 2-5, all seven domains** (`DOMAIN_RMP_CHIPS` in
  `rmp-chips.ts`). This is the design's actual mechanism for fixing "the same chips
  regardless of domain", and it is better than the sub-domain-only layer that was there.
- **Question 1 outcomes for domains 3-7**, replacing the drafts. Domain 3's are materially
  different from what was guessed.
- The rest of domain 2, which the paste cut off at "Contact relevant".

⛔ **Two governance instructions in the source that were NOT in the paste:**
1. **Sexual Offences stays high-level and non-graphic** - "In view of the sensitivity of
   this sub-domain, use only high-level, non-graphic documentation options." Three options
   only. **Guarded by a test.** Do not add detail.
2. **Domain 6 is conservative and safeguarding-led** - "It must not attempt to resolve
   safeguarding concerns through routine ward interventions." Its question-1 bank is
   deliberately **NOT per sub-domain**: one high-level list (`WHAT_IS_THE_RISK_CHILD`) for
   all nine, because splitting it would name what was done to a child. **Guarded by a test.**
Both, plus domain 5's "the sub-domains are broad so the indicators should steer this", now
show on the questions.

**Chips resolve in three visible tiers, deduped:** what the ticked sub-domain adds on top,
then the domain's reviewed bank, then the universal library.

**Confirmed against the source, no change needed:** one RMP per domain (X9 matches the
design), the six questions and their exact wording, the manage/prevent split, the universal
libraries, and the mandatory MDT line. Also found Mike's own framing, which the build
already follows: *"We cant use AI to interpret - has to be words from the nurse hence the
chips idea - the guide was just helping the nurse organise what they know so it falls in to
the correct format."*

Eleven new tests (54 in the file, 116 across the suite), including one asserting no
question-1 chip carries a severity word.

### X11. ⛔⛔ URGENT FOR MIKE - patient data in M365 Copilot

While reading that chat I had to read the patient example it was built around. **It reads
like a real patient, not fictional test data**: a first and full name, ward, section, dated
admissions, a named police station, prison and burns-unit episodes, an assault on named
family members including a child's age, arrest and drug-supply detail, and quoted speech.

Nothing from it has gone anywhere near the repo and none of it is recorded here. But it has
been typed into M365 Copilot, and the Anthropic-subprocessor question aside, that is a
processing route that has not been assessed for identifiable patient data.

**Mike to decide:** whether this was a real patient, and if so whether the chat should be
deleted and an IG incident raised. If it was constructed, it is still detailed enough that
it would read as real to an auditor - worth rebuilding it against the fictional demo cast
before it is used in any pack or demo. See also the earlier finding that the completed
tribunal WAGOLL "reads like real notes" (BACKLOG Section U).

### X12. Copilot's review worked through (22 Aug, late) - commit `9459ee1`

Mike: "rebuild as you suggest". **The two suggestions that would have added questions were
folded into what is already there**, because he cut thirteen questions to six that morning
precisely because it took too long.

- **"What the person says helps, or does not help"** = a chip group inside questions 3 and
  4, not a seventh question. The unhelpful half matters as much as the helpful half.
- **"Was the person involved in this plan?"** = one dropdown beside the plan title, printed
  in the plan's **header, above the bar** - deliberately outside the five Trust headings.
  ⛔ Six options, NOT a "patient agreed" tick: a plan the person disagreed with, or could
  not take part in, is a normal recordable outcome and a binary tick makes it unsayable.

**The rest, none of which adds a question:**
- **Three reasons a section is empty, kept apart** - "not yet established" / "not assessed
  at this time" / "not applicable to this risk". The domain's own "No evidence ... reported
  during assessment" is a **fourth and different thing** - that one IS a finding and lives
  on the risk screen.
- **Timeframes on question 5**, so "no further incidents" can say over what period.
- **Provenance on every event** (`EVENT_SOURCES`) - observed by staff / reported by the
  person / by family / by police / recorded in a previous assessment / not established.
  Prints in brackets after the event so it qualifies the account rather than joining it.
  ⭐ This is what stops "recorded allegation of assault" reading later as "assaulted a care
  worker". Asked in the quick-capture panel too, which is where provenance gets lost.
- **Consistency checks before copying** - new `src/lib/utils/riskChecks.ts`. Six checks.
  ⛔ **Every one POINTS AT the pair and hands it back. A test asserts none of them says
  which entry is right** - a tool that resolved the contradiction would be making a clinical
  judgement, and that is a different product.

⭐ **Conditional actions now stay conditional, and the tests found more than expected:**
**17** chips said "increase observation level" (the tool may ask staff to REVIEW a level,
never to raise one - that is a clinical decision with its own policy and authoriser),
**7** said "complete a search" with no mention of policy, one "review and restrict leave",
one "suspend contact and leave", two bare PRN. All qualified; four tests keep them that way.

**25 new tests, 140 across the suite.**

### X13. [ ] Still open from Copilot's list

Deliberately not done, with reasons:
- **Setting filter (inpatient / community / discharge)** - Copilot itself said defer to
  phase two, and wardHub is a ward tool. Do not delay anything for it.
- **"Sexual Offenses" spelling** - it is the Trust's own spelling on SystmOne, so Rule 7
  applies and it stays. Worth confirming against the live screen once, then closing.
- **"High BMI >"** - already guarded by a test; still needs the threshold from the Trust.
- **His deliberately difficult test set** (16 scenarios: no evidence everywhere, indicators
  with no sub-domain, historical with no current, very long custom chips, duplicate dates,
  saved data from before the update). Several are now covered by unit tests; a manual pass
  through the rest is worth a session.
- ✅ **Review responsibility and timing (his #3) - DONE 22 Aug, commit `6dbaf88`.** Mike chose the plan header. See X14.

### X14. Review responsibility and timing (Mike's call) - commit `6dbaf88`

Three controls join involvement in the **plan header**, above the bar and outside the five
Trust headings. A plan can be sound when written and out of date within a shift, and the
Trust template has nowhere to say so.

```
========================================
FIRE SETTING
Person involved in this plan: Involved and agreed
Review: The named nurse, At the next MDT
Review sooner if: Any relevant incident; A change in observation level
========================================
```

⛔ **WHO is a ROLE, never a name.** wardHub holds no staff names in a plan, and a role
survives the person going on annual leave in a way a name does not.
⛔ **WHEN is an INTERVAL, not a date picker.** A date typed here is stale the moment the
plan is pasted, and the ward speaks in shifts and MDTs.
⭐ **WHAT BRINGS IT FORWARD is the one that matters** - most plans go stale between
scheduled reviews, and it is an event that does it rather than the calendar.

- Seventh consistency check: a plan with answers and **no** review arrangement at all. Any
  one of the three counts - triggers alone are a real arrangement, not half of one.
- Spun-off sub-domain plans **inherit** the domain's header.
- `buildOneRmp`'s trailing involvement argument became a `PlanHeader` object, so the next
  thing that belongs above the bar does not need another positional parameter.
- Proofreading pack updated: the header, the person's own preferences, the timeframes and
  **all four ways a section can be empty** are in it for sign-off. **26 sign-off blocks,
  ~17,200 words** (down from ~26,500 because the seven formulation questions and their chip
  banks are gone - less content because there is less content).

**143 tests. Copilot's list is now done bar X13's four parked items.**

### X15. Five UI and content jobs (Mike, 22 Aug) - commit `6a2b252`

1. ✅ **"Sexual Offenses" spelling - LEFT AS IS and locked with a test.** It is the American
   spelling and it looks like our slip; it is what the SystmOne screen says, verified
   against Mike's screenshots on 20 and 22 Aug. Rule 7, same reason "Crital meds" survives.
   ⛔ **Three places key off that exact string** (`RISK_DOMAINS.subtypes`, `SUBTYPE_RISK`,
   `WHAT_IS_THE_RISK`) - correcting it quietly would break the sub-domain's chip banks. The
   comment in `risk-screen.ts` says how to change it if the live form is ever fixed.
2. ✅ **BMI threshold - still not guessed, but no longer left looking finished.** New
   `INDICATOR_NOTES` puts a footnote under the indicator list: the form leaves the threshold
   blank, use the figure in the Trust's own guidance, say which you used, wardHub will not
   guess one. Carries `[confirm]`. ⭐ **A test asserts the note contains no digits**, so
   nobody can helpfully fill one in.
3. ✅ **One `EventEditor` everywhere.** The in-domain version was a stacked block per event;
   it is now the quick-capture pattern - list first so you can see what you have recorded,
   then one compact add row. Replaces the page's own `DatedExamples` AND the copy inside
   `SectionEditor`; **53 lines of near-duplicate deleted.**
4. ✅ **Edit as well as remove, in both places.** A pencil loads the row back into the add
   row. ⭐ On the **top capture list** it also removes the event from every domain it was
   filed under first, so re-adding cannot leave a stale copy behind - and the note says so.
5. ✅ **The six questions open expanded** - Mike does not want them truncated out of sight.
   `/welcome` keeps them collapsed (`startOpen` prop); it has far more of them.
6. ✅ **Question 1 now has a general library** (`UNIVERSAL_WHAT_IS_THE_RISK`, 11 options). It
   only had the per-sub-domain outcomes, so a nurse who named their own sub-domain got
   nothing. Like every other question-1 chip, not one carries a likelihood, a severity or a
   risk level - the existing test covers them.

**146 tests.** X13 is now down to the setting filter (deferred by Copilot itself) and a
manual pass through his 16 difficult scenarios.

---

## SECTION Y - Community signposting directory (22 Aug 2026, Session 60) - THEORY, NOT BUILT

**Status: design only. Nothing built, nothing scheduled. Do not start until Y1 is answered.**

Mike ran a Copilot prompt at work that produced a 10-20 page discharge resource booklet for
one patient in South Normanton: 40-80 real named local clubs, groups, volunteering roles and
family activities, each with a verified phone number, address, cost and first step. The
question is whether wardHub can do that for a wider audience, given two barriers he named
himself:

1. it cannot become clinical decision making
2. it cannot mean embedding AI into wardHub

The source prompt is worth keeping - it is the best statement of the taxonomy we have.

### Y1. BLOCKING CHASE - does this already exist?

**Answer this before any tagging or build work. Raise it at the start of every session that
touches Section Y.**

- What do Derbyshire social prescribing link workers actually use day to day? (Commissioned
  products in this space: Elemental, Joy, Access Elemental, Connect Well.) Ask a link worker
  or the social prescribing lead, not IT.
- Joined Up Care Derbyshire directory - export, API or open data feed?
- Community Directory Derbyshire - same question.
- Amber Valley CVS volunteer listings - same question.

**Two reasons this blocks everything.** Duplicating a system the Trust already pays for is
the fastest way to lose the room. And if someone else already maintains the list, the right
build is wardHub *reading* theirs and tagging on top, which means wardHub never owns
currency at all. That turns a directory you maintain into a view over somebody else's.

### Y2. The split that makes it work

The Copilot output is two jobs stuck together:

1. **Research and verify** a real organisation. Expensive, needs the web, needs checking.
   Done ONCE per organisation, by a human.
2. **Select and assemble** the ones matching a search, then print. Done once per patient.

If job 1 is done properly, job 2 needs no intelligence at all - it is tick boxes over tagged
data. The Rightmove model: nobody thinks Rightmove recommends you a house.

### Y3. Staying out of clinical decision making - the input schema IS the boundary

Not the output, and not a disclaimer (per the MHRA work in the competitor scan: marketing
copy counts, disclaimers do not, and you cannot self-certify).

The Copilot prompt fed in formulation - "recently required hospital and crisis support",
"significant decline in motivation and concentration", "found peer groups unhelpful because
conversations became competitive around self-harm". **If wardHub takes those as inputs it is
a device.** So it never sees them. The staff member does that translation in their head and
the app only ever receives facts about the SEARCH:

- towns / area they can get to
- travel: bus, lift, car, walking, online only
- budget: free / a few pounds / can pay a membership
- when: weekday daytime, evenings, weekends, school holidays
- bringing children, age band
- activity type: making, moving, outdoors, precision, gaming, learning, helping
- avoid licensed venues: yes/no
- talking: happy to chat / rather be doing something / wants to watch first
- commitment: one-off, drop-in, weekly, seasonal
- entry route: turn up, phone first, beginner course, register online, DBS needed

Every one is a lifestyle preference a leisure centre booking form would ask. And every tag on
the directory side is **a verifiable fact about the club**, checkable by ringing them - not a
judgement about a person.

Rules that follow:

- **Drop the "Fit: strong match / worth considering" field** from the Copilot prompt. It is
  the one field that is an inference about a person. Replace with "matches 6 of your 7
  filters", which is arithmetic.
- **No ranking by predicted benefit.** Sort by distance, cost or alphabetically. Ordering by
  "how much this will help" is device territory.
- Nothing persists. Session only, no name, no data subject, no DPIA delta.
- Marketing copy: "search local activities by area, cost and day". NEVER "finds the right
  support for your patient".
- Free text is a risk (profiling drift, PII typed into a box, and it breaks Mike's
  dropdowns-over-free-text rule). If there is one it is a keyword box for the ACTIVITY and
  must say so.

### Y4. Two tiers, visibly different

Same three-state pattern as the risk tool chips (trust plain / wardHub ring / user-added) -
use that as precedent, it is what got the risk tool moving.

**Tier 1 - verified.** Human checked, phone rung, `lastChecked` date. House entry format.
**Tier 2 - found online.** Machine gathered, unverified. The "advanced" mode.

Tier 2 rules, all hard:

- **Never render it in the house entry format.** The moment it has "What it is / Why it might
  suit / Cost" it reads as endorsed. Show it raw: page title, full domain, snippet, date
  found, link. It must look like search results.
- **No facet tags on tier 2.** Nobody has made those judgements yet. An empty tag row is the
  honest signal.
- **Staff view, separate route.** Not a toggle widening the same list. Different page,
  different chrome, no Trust branding on that view.
- **It cannot reach the patient booklet.** Print builds from tier 1 only. If unverified
  results can land in a printed pack carrying a Trust logo, the separation has failed however
  well it is labelled. The failure mode is a staff member printing a screenshot - design
  against the copy-paste, not against the lawyer.
- **Promotion tier 2 to tier 1 is one-way and goes through a phone call.**

### Y5. Maintenance: what the automated job is allowed to do

Mike's ask: a monthly job, adoptable by the Trust, that does NOT require a human to confirm
every result. Solved by splitting "verify" into two questions:

1. **Does this club still exist and is this detail right?** No human needed. It needs a
   SOURCE. Checking = "does the source still say this".
2. **Is this appropriate to hand a patient, and how do we describe it?** Human - but ONCE, at
   admission. Never again on a schedule.

The monthly job only ever does question 1, and **only ever moves things in the safe
direction**, so it can act unilaterally:

| Finding | Automatic action | Human needed? |
|---|---|---|
| Source 404 / page gone | Auto-suspend, drops out of results | No - removing is always safe |
| Source changed materially | Flag "details may have changed", harder confirm-before-travelling on print | No |
| Source unchanged | `lastChecked` rolls forward automatically | No - if nothing changed, a human confirming changes nothing |
| New candidate found | Lands in tier 2 | No - unverified is what it IS |

**The headline job is re-checking, not discovering.** A directory dies from rot, not from
being small. On a ~300 entry list a typical month outputs "4 suspended, 11 flagged" and that
is already correct with nobody involved.

**Review happens by use, not by rota.** A staff member searching for archery sees a tier 2
result and rings the club *because they were going to ring them anyway*; filling in the
fields IS the promotion. If nobody ever promotes anything the tool still works - smaller
verified list, bigger unverified one. It degrades gracefully instead of silently going wrong.

Candidates also need an **expiry** (unreviewed after 3 months, dropped) and a **dismissed**
state, so the same closed club does not resurface every month.

### Y6. Where it runs at go-live

**Not on Mike's laptop.** Per Section V the Trust stack is ASP.NET Core / Azure App Service /
Azure SQL, so this is a **timer-triggered Azure Function or WebJob in the Trust tenant**, on
their pipeline, owned by whoever owns the app.

Note what Y5 has reduced it to: **a link checker.** Fetch URL, compare against last time, set
a status. No model, no API key, no supplier, no DPIA delta, and any Trust dev recognises it
in five minutes. That is a far stronger governance position than "a Copilot agent proposes
entries monthly".

Discovery should hit a **fixed source list**, not blind search (blind monthly Googling
returns dead 2019 Facebook events): the local directories from Y1, council what's-on pages,
and national governing body club finders (Archery GB, Ramblers, parkrun, Men's Sheds
Association, England Athletics, Wildlife Trust). Structured queries, real coverage - the same
finders the Copilot prompt used as fallbacks.

The only step that ever wanted a model is drafting prose for a NEW entry. That happens once,
at promotion, with a person present - keep it as an authoring aid OUTSIDE the runtime (same
shape as the Guide Builder agent) and it never becomes the Trust's problem.

### Y7. Output

The wow is the booklet, not the search. Reuse the existing print pipeline
(`src/lib/utils/printDoc.ts`, the WAGOLL HTML forms). Tick filters, get a shortlist, print:
personal directory, weekly planner, checkboxes, crisis box front AND back, "checked on
(date), please check before travelling".

Three modes: staff and patient filtering together on screen; print a personal pack; print a
whole category as a ward noticeboard "what's on".

### Y8. Honest limits - do not let these get sold away

- **No cron keeps a community directory current.** It controls HOW it rots (quietly
  disappearing rather than confidently wrong). Worth having, not the same as up to date.
- **Somebody has to own the list.** If that is wardHub, the Trust has quietly acquired an
  uncosted maintenance job. See Y1.
- Scope to the catchment the wards actually discharge into (Derbyshire + adjacent Notts). Use
  national club finders as a named per-category fallback rather than faking coverage.
- Seeding from an existing dataset beats hand-typing several hundred entries. Again Y1.

### Y9. Sequencing - respects the feature freeze

Section V feature-freezes the Next.js build (content edits fine), so a new tool with new UI
is the wrong thing to start.

But **the tagging IS the product, and it is stack-neutral.** A facet schema plus a few
hundred verified tagged entries survives the ASP.NET port intact, same as the guide content
export job in V. Order of work:

1. Answer Y1.
2. Facet schema + entry template + candidates-file schema + promotion checklist (docs only).
3. Tag the existing directory-builder entries.
4. UI in Cris's sandbox, on the ported build.

### X16. Copilot's difficult test set, run (23 Aug) - commit `ad24863`

⚠ **His list is 15 scenarios, not the 16 previously recorded here.** New
`src/__tests__/risk-scenarios.test.ts` - 30 tests, one describe() per scenario, named as he
wrote them. The two purely visual ones were driven in the browser.

**TWO REAL FAULTS, both in scenarios I expected to pass:**

1. ⭐⭐ **Scenario 10 - the event source never reached the plan.** `buildContent` still used
   the old format, so an event added under question 2 arrived in the management plan with
   its provenance stripped: *"Recorded as deliberate"* with nothing to say it came from an
   old assessment rather than from staff. **Exactly what the source field was added to
   prevent, and it was half-wired** - the domain narrative carried it, the plan did not.
   ⛔ Lesson: `withExamples` in the page and `buildContent` in risk-capture are two separate
   formatters over the same data. Change one, check the other.
2. ⭐ **Scenario 12 - `loadUserChips` trusted localStorage.** The question ids changed on
   22 Aug when 13 questions became 6, so every device already holds old-shape keys. Orphaned
   keys are harmless (they never match a live bank); a stored **string** where an array
   belongs reached `.map()` in the editor and would have **taken the page down on open**.
   Now coerces. Verified for real by planting old-shape data before loading the page.

Plus a wording fix: a nurse who names their own sub-domain was told to "tick a sub-domain
above", which they had just done.

**What the rest confirmed rather than changed:** nil in all seven domains never says "not
yet completed"; a custom sub-domain borrows no other sub-domain's words; indicators with no
sub-domain still name the indicators; **duplicate events on one date are both kept** (two
identical entries are far more likely to be two real incidents than a mistake, and removing
one would be the tool editing the record); undated events sink to the bottom; the mandatory
MDT line survives every combination; a 500-character custom chip wraps in place with no
sideways page scroll; and seven domains at once generates seven plans with no errors and
seven accurate "this plan would be empty" warnings.

**176 tests. X13 is now down to the setting filter alone, which Copilot deferred himself.**

---

## SECTION Y - Mike's job list after testing (25 Aug 2026) - DONE

> Written after he used the rebuilt tool properly. **Several items REVERSED work done
> on 22 Aug** - that is him testing it and finding it wrong in use, not a change of mind
> to argue with. All seven built 25 Aug; item 8 was blank and he confirmed there was
> nothing behind it.
>
> **Nothing from this list is outstanding.** Sign-off is the normal guide route (Y9) and
> the tool is now amber rather than red.
>
> ⭐ **The standing lesson: Mike reverses things after using them, and he is usually
> right.** The source field, the involvement dropdown and the review fields were all
> built to his spec on 22 Aug and all three are now gone. Anything that adds a field or
> a click loses to speed. Weight new UI against "does this slow a nurse down at 3am"
> BEFORE building it.

### Y1. [x] The event source field is gone

`EVENT_SOURCES`, the dropdown in both the quick-capture panel and `EventEditor`,
`DatedExample.source`, the bracketed suffix in both formatters, and the "events with no
source" check. "It doesn't read well and adds a layer of effort for the user which slows
people down too much."

**Its concern, answered:** an allegation must not read later as a finding. Mike's call -
**staff word it in the narrative themselves** ("police reported that..."), which is how
they write it on SystmOne anyway. Scenario 10 in `risk-scenarios.test.ts` now proves the
tool keeps two conflicting accounts verbatim without a source field to lean on.
⛔ **Do not quietly reintroduce a field for it.**

### Y2/Y3/Y4. [x] One box per domain, three time choices, "Today (25 August 2026)"

The Now card and the Before card - two narratives, two event lists - are one box in the
quick-capture style. The three choices are offered up front in Mike's order: **Today
(with today's date on the button) / A date / Historic**, and the date does the sorting:
**older than three months = before**, everything else = now. Two green Copy-into-S1 boxes
below it, because SystmOne still has two fields - the split is done for the nurse rather
than asked of them.

`useToday()` fills the date after mount; nothing reads `new Date()` at render. Free-text
domain narratives went with the two cards: one line per thing that happened is what the
S1 field ends up holding anyway.

### Y5. [x] The proofreading pack is deleted

`riskProofreadPack.ts` and its button.

⛔⛔ **CONSEQUENCE, RAISED AND ANSWERED: Mike parked the sign-off route.** The pack was
the only path off RED - every note since 20 Aug said the guide was "blocked on Mike
reading the pack". He chose *"delete it, park sign-off for now"*, so:
**`/guides/risk-assessment` stays RED with no route to green, deliberately, and there is
no document to read.** Picking that route back up is the open item below.

### Y6. [x] The formulation is in one box

Per-domain summary rows, the generated `<pre>` and the green copy box were three
renderings of the same text stacked on top of each other. Now one editable box: it
arrives generated, typing in it makes it yours, Rebuild puts the generated wording back
(still behind the confirm modal), and the copy control sits on the box.

### Y7. [x] The plan header is gone

Involvement, who reviews it, when, and what brings the review forward. With it went the
seventh check in `riskChecks.ts`, the `PlanHeader` argument on `buildOneRmp`, its header
lines, and the `PATIENT_INVOLVEMENT` / `REVIEW_*` banks. A test now asserts the plan
prints the five Trust headings and nothing else, so this cannot creep back unnoticed.

### Y8. [x] Nothing behind it - Mike confirmed there was no item 8

### Y9. [x] Sign-off: the same route as every other guide

Mike, 25 Aug, after being told the pack was the only path off RED: **"sign off will be
treated like all the other guides - don't worry about the proof pack, not needed now."**

So there is no bespoke sign-off artefact for the risk tool and there does not need to be.
It goes through the normal traffic light in `src/lib/data/approval-status.ts` and, when
Section L4 lands, the same CONFIRM pass against the source policy as the rest.

**`risk-assessment` moved red -> amber**: the rebuild and this job list are finished, so
"in development, do not trust yet" is no longer true. Amber is the honest state - built,
awaiting his clinical sign-off - and it is what the other finished-but-unsigned guides
carry (seclusion-support-plan, debrief, safety-plan, dama...). Green stays reserved for
formal department sign-off.

⛔ **Do not rebuild the proofreading pack.** If the tool needs explaining to an approver,
it is explained the same way the other guides are.

### Y10. [x] A blank plan template, at the end with the finished plans

Mike, 25 Aug. `buildBlankRmp()` in `risk-capture.tsx` - the five Trust headings in order,
both halves of prevent / reduce, and the mandatory MDT line, with nothing filled in.

It sits under the real plans on the Management Plan tab, closed by default, so it is an
extra rather than an alternative to what the nurse just built. For a plan written by hand,
or a risk the tool does not cover.

⛔ **It suggests nothing about a patient** - a blank form, not a draft. The only words in
it are the Trust's own, and a test asserts that (no "not yet completed", no
"not yet established", just `[NAME THE RISK]`).

### Y11. [x] The capture panel clears fully after an add

The domain chips stayed lit, so either the next event went in wherever the last one did,
or a click meant to pick a domain silently un-picked it. Text, chips and the time choice
all reset now.
