# wardHub - Master Backlog

> Single source of truth for outstanding work, so nothing is lost between sessions.
> Started 4 Jul 2026. Work happens in focused sessions that read this file first.
> Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[BLOCKED]` needs Mike · `[PARK]` deferred

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

## P. From the 30 Jul evaluation (Session 47) - open items

Full report: **`docs/evaluations/2026-07-30_project-evaluation.md`**. Read it before starting
work. Everything the 28 Jul pass left open is carried in its recommendation ledger, so Section O
below is now history rather than a live list - the live list is here.

**New findings, never raised in any previous evaluation:**
- [ ] **`main` has NO branch protection.** Confirmed via `gh api repos/Sharpy20/hub-alpha/branches/main/protection`
      (404, "Branch not protected"). CI runs typecheck, lint, test and build on every push but
      **does not gate the deploy**, and Vercel builds straight from `main`, so a red build still
      ships. The dev panel used to list "branch protection on main" as a CI/CD feature, which was
      simply untrue. **Do this on 31 Jul alongside the password hardening.**
- [ ] **`E:\Hub\temp\internal-contacts.md` exists exactly once, on one drive, with no backup.**
      It holds every real internal contact keyed by entry id and it is the only copy, by design,
      because the values were stripped out of the repo on 27 Jul. If that drive fails they are
      unrecoverable. Highest-consequence single file in the project. **Mike: put a copy somewhere
      else.** Same applies to `E:\Hub\printable-guides\`, `E:\Hub\wardhub-video\` (whose `src/`
      cannot reproduce the rendered reel) and the 483-document policy dump.
- [ ] **CLAUDE.md is materially stale and says so nowhere.** It still documents the
      Light/Medium/Max/Max+ version system as live (removed Session 9), claims 100 patients and
      100 staff (it is 5 patients and 20 staff per ward), and its snag list stops at #219. The
      BACKLOG has silently become the source of truth. **It is the first file a new session
      reads, so a new contributor would build the wrong thing.** Highest-value documentation fix
      available.
- [ ] **A scheduled GitHub Action queries Supabase daily.**
      `.github/workflows/supabase-keepalive.yml` runs a `SELECT id LIMIT 1` against
      `feedback_posts` with a **service key** from GitHub secrets, to stop the free tier being
      paused. The app itself never queries Supabase, so "wired but dormant" was true but not the
      whole picture. Now disclosed in the dev panel Q&A, the DPIA data flows and on `/gdpr`.
      Rotate the key once the keep-alive is no longer needed.
- [ ] **HAZ-020 in the hazard log is a go-live blocker for a feature that no longer exists.** Its
      subject is the chase log, retired entirely in Session 42. A hazard log carrying a blocker
      for a retired feature undermines the rest of it. ~5 minutes in
      `docs/nhs-ready/03b-clinical-safety-hazard-log.md`.
- [ ] **`overview/page.tsx` is now 2,228 lines** - the same size `tasks/page.tsx` was criticised
      for, and it grew without anyone noticing. Split it.
- [ ] **Task titles are free text attached to a named patient.** Nothing prevents a member of
      staff typing clinical or judgemental content into one, which is the single hole in the
      no-clinical-data position. The control is wording and training, not schema. **One sentence
      of guidance in the add-job modal, before any pilot.**
- [ ] **`package.json` pins `next: ^16.1.6`** while 16.2.12 is installed. The caret makes it
      harmless, but the declared floor sits below a security fix. Bump it.
- [ ] Basic uptime monitoring. Free, ten minutes, and right now nobody would know if the site
      broke overnight.

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
