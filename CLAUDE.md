# wardHub - Claude Code Project File

> **Project Owner:** Mike (Ward NIC)
> **Trust:** Derbyshire Healthcare NHS Foundation Trust
> **Rewritten:** 6 August 2026. The old version of this file described a four-tier version
> system, 100 patients and a snag list - all long dead. If something here contradicts the
> code, trust the code and fix this file.

---

## READ FIRST, EVERY SESSION

1. **`docs/BACKLOG.md` is the source of truth for outstanding work.** Start there. The live
   sections are named at the top of that file.
2. **`docs/evaluations/2026-07-30_project-evaluation.md`** is the evaluation record - it
   carries the recommendation ledger, metric history and standing decisions.
3. This file holds the things that do not change between sessions: security rules, styling,
   conventions and gotchas.

---

## 🚨 CRITICAL SECURITY - PROJECT ISOLATION 🚨

**THIS PROJECT MUST REMAIN 100% ISOLATED FROM ALL OTHER PROJECTS**

- **GitHub Account:** Sharpy20 (ONLY - never Dafttvlive or any other account)
- **Vercel Account:** Must be linked ONLY to Sharpy20 GitHub
- **No cross-references** to any other repositories, projects, or accounts
- **No shared credentials** between this and any other project

**If you see "Dafttvlive" or any other account name in** git commits, Vercel deployment
logs, package.json, or any documentation: **STOP IMMEDIATELY** and alert the user.

Note: BACKLOG Section R4 plans a handover to trust accounts. When that happens this rule
gets rewritten in the same pass - until then it stands.

---

## LIVE DEPLOYMENT AND GIT

The project deploys LIVE from `main` - do not treat localhost as the finish line.

- **Live URL (canonical):** https://www.wardHub.live
- **Vercel URL (same deploy):** https://inpatient-hub-alpha.vercel.app
- **Repo:** https://github.com/Sharpy20/hub-alpha (private). Vercel deploys automatically
  on push to `main` (~2 mins).
- **Site password gate is ON** (`src/proxy.ts` + `/password`). One shared password, 7-day
  `site_access` cookie - the ONLY cookie the site sets. Never claim "no cookies".

**Before pushing, all three gates must be green:**

```bash
npx tsc --noEmit    # 0 errors
npx eslint src      # 0 errors
npm test            # all pass
```

CI (`.github/workflows/ci.yml`) runs the same gates plus a build on every push, and since
6 Aug 2026 the `checks` run is a **required status check on `main`** (force pushes and
deletion blocked; admin direct pushes still bypass - tightening that is Mike's call).

**Auth:** uses the gh CLI credential helper. If push fails:
`gh auth switch --user Sharpy20 && gh auth setup-git`. NEVER change global credentials.

---

## CRITICAL RULES

1. **No real PII, ever.** Demo data is fictional and must stay obviously fictional (see
   naming theme below). Say "fictional demo data", never "demo PII".
2. **Rule 4 - contact details:** if a phone number / email is not publicly Google-able, the
   UI shows **"Hidden in demo mode"**. The real values are NOT in code comments - they live
   only in `E:\Hub\temp\internal-contacts.md`, keyed by entry id. Never paste one into the
   repo.
3. **The patient record is non-clinical, guarded by a test.** It holds name, ward, status,
   admission date/time, named nurse, consultant, ward professional and discharge fields.
   MHA status, alerts, diagnoses, room and bed were removed 28 Jul 2026;
   `src/__tests__/no-special-category-data.test.ts` fails if they return. Mike's reasoning
   (quote it, do not re-argue): wardHub is not the clinical record, so nothing clinical in
   it would have an owner keeping it current - that is clinical safety, not just IG.
4. **No em dashes** anywhere in code or content. Use hyphens or en dashes.
5. **NHS styling** - follow NHS Identity guidelines (colours below).
6. **Never claim wardHub works on a phone** (standing decision, 29 Jul). Screens that
   matter: ward desktops and Trust laptops. Do not add a mobile check to any review.
7. **Trust forms keep their EXACT wording** - add around them, never alter.
8. **Never run `npm audit fix --force`** (downgrades Next). Remaining advisories are
   vendored inside Next/postcss.
9. **Approval statuses are Mike's editorial call** - guide traffic lights live in
   `src/lib/data/approval-status.ts`; Claude never self-flips one to green.

---

## WHAT WARDHUB IS NOW (one build)

The Light/Medium/Max version system is long gone (`hasFeature()` always returns true).
What replaced it, the root vs `/v2` split (root = limited PII-free build, `/v2` = full
build), is itself currently **collapsed for demo**: `COLLAPSED_FOR_DEMO = true` in
`src/lib/config/build.ts` serves every feature at the root. Set it false to restore the
split - the machinery (`src/proxy.ts` routing + `useIsV2()`) is intact but dormant.
⚠ Naming debt: `useIsV2() === true` means "limited build", and that is the ROOT when the
split is live.

**Main surfaces:** unified guide viewer at `/guides/[id]` (static-route builder/checker
guides override it) · Team Diary `/tasks` · My Jobs kanban `/my-tasks` · Patients
`/patients` · `/overview` (barriers, waiting, care-review audit) · `/links` ·
`/service-map` · `/quiz` (942 MCQs) · `/patient-guides` (printable patient leaflets) ·
dev panel `/dev-panel` (governance pack, reached from the GDPR page).

**Data:** everything is demo data in code + localStorage (`wardhub_*` keys). Tasks persist
NOWHERE (React state only - they die on refresh). Supabase is wired but dormant: the app
never queries it; a daily keep-alive GitHub Action does. There is NO auth library - the
password gate is the only door.

**Roles:** `staff`, `lead`, `manager`, `ward_admin`, `senior_admin`, plus an orthogonal
`isContributor` flag ("Editor" = staff + flag, not a role). Consultants are deliberately
NOT a role. Ward Professional comes from staff/lead/manager only.

---

## DEMO DATA - CURRENT SHAPE

- **5 wards** (poets): byron, shelley, keats, wordsworth, dickinson.
- **5 patients per ward (25 total, all active), 20 staff per ward.**
- **Naming theme is English literature, and new names must stay inside it:** staff are
  Jane Austen characters, patients are characters from other classic novels, consultants
  are doctors from novels. The theme is the point - names must read as fiction at a
  glance. Pools: `STAFF_NAMES` (`src/lib/data/staff/index.ts`), `PATIENT_NAMES` +
  `CONSULTANTS` (`src/lib/data/tasks/index.ts`).
- Discharge barriers come from `BARRIER_PLAN` in `src/lib/data/tasks/index.ts`.

---

## GOTCHAS THAT KEEP BITING

- **Dates:** always use `toLocalDateStr()` from `src/lib/utils/date.ts` for YYYY-MM-DD.
  `toISOString().split("T")[0]` drifts a day during BST after midnight.
- **Ward casing:** ward IDs are lowercase (`"byron"`), ward names in data are capitalised
  (`"Byron"`). Compare case-insensitively.
- **Task date fields:** `WardTask`/`PatientTask` use `dueDate`; `Appointment` uses
  `appointmentDate`.
- **`src/components/ui/modal.tsx` is lowercase in git.** Import via `@/components/ui`,
  never by a capitalised path - Windows renames the file and tsc fails with TS1149.
- **Modal stacking:** the shared `Modal` and `TaskDetailModal` both sit at z-50, so DOM
  order decides who paints on top. Render `TaskDetailModal` last (see `/tasks` and
  `/overview`).
- **Recurring jobs complete per-day** via `completedDates` + `isCompleteOn(task, date)`
  (`src/lib/utils/task-completion.ts`) - never write completion to `status`.
- **Printing** goes through ONE iframe implementation: `src/lib/utils/printDoc.ts`
  (`printHtml`/`printClinicalDoc`/`printChecklist`). Backgrounds that must survive the
  print dialog's "background graphics off" default need `print-color-adjust: exact`.
- **FOCUS links** (trust intranet) need the styled warning modal, not `alert()`, and only
  open on the Trust network.
- **Guides index data** lives in `catalog.ts` (`ALL_GUIDES`); `howto-guides.ts` uses
  unquoted object keys - keep the style.
- Task actions are "Claim" / "Take Over" / "Hand back" (Drop was retired 29 Jul - hand
  back is the only way to release a job, and it generates a case note).

---

## NHS STYLING

### Colours (CSS vars in globals.css)

| Token | Hex | | Token | Hex |
|-------|-----|-|-------|-----|
| nhs-blue | #005EB8 | | nhs-green | #007F3B |
| nhs-dark-blue | #003087 | | nhs-warm-yellow | #FFB81C |
| nhs-bright-blue | #0072CE | | nhs-orange | #ED8B00 |
| nhs-light-blue | #41B6E6 | | nhs-red | #DA291C |
| nhs-aqua | #00A9CE | | nhs-purple | #330072 |
| nhs-black | #212B32 | | nhs-pink | #AE2573 |
| nhs-dark-grey | #425563 | | nhs-pale-grey | #E8EDEE |
| nhs-mid-grey | #768692 | | nhs-white | #FFFFFF |

### Typography
- **Primary Font:** Source Sans 3 (self-hosted; Arial fallback). Headings bold NHS Blue,
  body NHS Black.
- 5 style themes (NHS, iOS, Material, Fluent, OneUI) via CSS vars (`--theme-col-*`);
  dark mode overrides the NHS vars.

### Copy tone
Short, punchy, conversational - not corporate. Follow `E:\Hub\lessAImoreHUMANprompt.md`.

---

## STANDARD WORKFLOW TEMPLATE (referral guides)

Every referral workflow keeps this shape:

```
1. CRITERIA CHECK     - confirm the patient meets criteria (link criteria doc if held)
2. BLANK FORM         - download the referral form
3. WAGOLL             - a worked example of a good completed form
4. RELATED GUIDES     - linked how-to guides and links
5. SUBMISSION         - where to send it (email / phone / portal), Rule 4 applies
6. CASE NOTE PROMPT   - pre-built "copy to patient notes" text with auto-date
7. JOB DIARY REMINDER - mark the task complete in the diary
8. GDPR TIP           - delete the completed form from your computer
```

Dead links render as non-clickable badges: **"Link to confirm"** (never "blocked in
demo", which claims a working link exists). Missing WAGOLLs read "Example to add".

When building a NEW guide, ask Mike whether it needs a printable blank form (+ WAGOLL).

---

## PLACEHOLDER CONVENTIONS

| Scenario | Format |
|----------|--------|
| Internal/non-public contact | "Hidden in demo mode" |
| Unverified fact from a source doc | `[confirm]` marker in the guide text |
| FOCUS-gated document | "On FOCUS (login needed)" chip |

Never invent a plausible URL, phone number or email - a fabricated value that renders
like a verified one is worse than a gap (28 Jul: 15 invented contacts had to be stripped).

---

## KEY ADVOCACY / CONTACT FACTS (public, safe to show)

- **Advocacy = IMHA only**, and only in the imha-advocacy workflow. Derby City =
  **Disability Direct** (info@disabilitydirect.com, 01332 299449); Derbyshire County =
  **Cloverleaf** (referrals@cloverleaf-advocacy.co.uk, 01924 454875). POhWER is removed.
- Crisis line: **111 (option 2)** - the old 0800 028 0077 helpline is switched off.

---

*Maintained by Claude Code. If a session changes something this file states, update this
file in the same session - and log the work in `docs/BACKLOG.md`, not here.*
