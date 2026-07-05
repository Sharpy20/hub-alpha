# wardHub data inventory and migration spec

> Rebuild pack, part 2 of 3. Written 4 July 2026. Every count below was measured
> against the code on that date (grep/node over `src/lib/data/`), not copied from
> docs - several older docs are wrong about scale, and those cases are flagged.

## How to read this

Everything the app shows lives in TypeScript files under `src/lib/data/` and gets
compiled into the bundle. There is no database. That means the "migration" question
is really two separate questions:

1. **Content** - the clinical guides, workflows, links, quiz, service directory.
   This is the accumulated value of the project. It is plain data, already structured,
   and survives any rebuild: move it into database tables, a CMS, or keep it as files.
2. **App-state** - demo staff/patients/tasks and per-browser localStorage. None of it
   should be migrated as-is. Demo data gets replaced by real integrations; localStorage
   state becomes per-user server state if and when accounts exist.

Each dataset below is tagged **CONTENT** (survives any rebuild) or **APP-STATE**
(scaffolding, replace not migrate).

## 1. Guides catalog - CONTENT

**File:** `src/lib/data/guides/catalog.ts`
**Count:** 64 catalog entries in 12 categories, plus a 13-entry `GUIDE_TYPE` label map.

```ts
interface GuideItem {
  id: string; title: string; description: string;
  icon: string;           // emoji
  gradient: string;       // tailwind gradient classes
  category: string;       // 12 values, first-seen order drives the index page
  viewerPath: string;     // usually /guides/{id}; 11 ids resolve to bespoke static routes
}
```

**Proposed mapping:** table `guides` (id PK, title, description, icon, category,
display_order, guide_kind). `guide_kind` derives from `guideType()`:
how-to / step-by-step / builder / checklist / tips. `gradient` and `viewerPath` are
presentation, not content - drop or regenerate them.

## 2. How-to guide bodies - CONTENT

**File:** `src/lib/data/guides/howto-guides.ts` (1,800 lines)
**Count:** 37 guides in `GUIDES`, each with ordered steps; plus `GUIDE_CONFIG`
(icon/gradient/category presentation map) and `GUIDE_WAGOLLS` (1 entry: the ABC chart
worked example).

```ts
interface GuideData {
  id: string; title: string; description: string;
  steps: { id: string; title: string; content: string; tip?: string }[];
  focus?: { label: string; url: string }[];      // SystmOne how-tos on FOCUS (trust intranet)
  caseNote?: string;                             // copy-to-notes template, [DATE] auto-filled
  related?: { label: string; guideId: string }[];
  downloads?: { label: string; url: string }[];  // printable blanks in /public
}
```

**Proposed mapping:** `guides` (as above) + `guide_steps` (guide_id FK, position,
title, content markdown/text, tip) + `guide_resources` (guide_id FK, kind:
focus_link | download | related | wagoll, label, url_or_guide_id). Step `content` is
plain text with newlines; bare URLs are auto-linked at render time. In a CMS this maps
cleanly to one content type with a repeating step block.

## 3. Referral workflows - CONTENT

**File:** `src/lib/data/guides/referral-workflows.ts` (1,359 lines)
**Count:** 17 workflows in `WORKFLOWS`; plus `SECTION_OPTIONS` (10 MHA statuses) and
`AREA_OPTIONS` (Derby City / Derbyshire County).

```ts
interface WorkflowData {
  id: string; title: string; description: string; icon: string; gradient: string;
  steps: WorkflowStep[];
}
interface WorkflowStep {
  id: string;
  type: "info" | "criteria" | "consent" | "section" | "area" | "forms"
      | "submission" | "casenote" | "reminder" | "gdpr";
  title: string; content: string;
  checkboxLabel?: string;                          // criteria steps
  forms?: { blank: WorkflowForm[]; wagoll: WorkflowForm[]; otherGuides: WorkflowForm[] };
  methods?: { type: "email"|"phone"|"portal"; label: string; value: string; area?: "city"|"county" }[];
  clipboardText?: string;                          // case-note template with [PLACEHOLDERS]
  consentYesLabel?: string; /* + 3 more consent overrides */
}
// WorkflowForm: { label, url, icon?, note?, area?: "city"|"county" }
```

**Proposed mapping:** `workflows` + `workflow_steps` (typed, position-ordered) +
`workflow_forms` (step FK, bucket: blank|wagoll|other, label, url, area) +
`workflow_submission_methods` (step FK, type, label, value, area). The step `type`
enum is load-bearing: the viewer renders different UI per type, so any rebuild keeps
it as a controlled vocabulary. Known data caveat: roughly 80+ form `url` values are
still `#` placeholders awaiting real FOCUS links, and demo email addresses use
`@example.nhs.net` - do not treat submission details as verified until each workflow
is signed off green.

## 4. Interactive builder datasets - CONTENT

One file per bespoke tool. All are self-contained exports consumed by the 11 static
guide routes.

| File | What | Measured size |
|---|---|---|
| `guides/mse.ts` | MSE builder: descriptor chips per domain | 9 domains |
| `guides/careplan.ts` | My Care Plan builder: sections, principles, teaching, example | 9 sections + supporting text |
| `guides/risk.ts` (855 lines) | Risk wizard: 28 risk types bucketed into the 7 SystmOne risk-screen domains, per-risk chip sets for RMP and formulation, S1 copy-out formats, mandatory MDT line, worked examples | 28 risks, 7 domains |
| `guides/admission.ts` (498 lines) | Admission checklist + MHA pathways (`MHA_PATHWAYS`) + scrutiny tick-sheet + rectify note | 34 ids across checklist items, forms and pathways |
| `guides/leave-discharge.ts` (338 lines) | Leave/Discharge/Transfer checklist, items tagged by pathway | 60 ids across sections/items |
| `guides/seclusion.ts` | Seclusion support plan prompt guide | 23 prompt sections |
| `guides/debrief.ts` | Post-incident debrief prompt guide | 8 sections |
| `guides/safety-plan.ts` | Safety plan prompt guide | 8 sections |
| `guides/restraint.ts` | Restraint and rapid tranq monitoring prompt guide | 6 sections |
| `guides/observation.ts` | Observation and engagement prompt guide | 5 sections |
| `guides/guideprompt.ts` | The shared `GuidePromptConfig` / `GuidePromptSection` types | types only |
| `guides/builder.ts` | RETIRED chip-builder types, no longer imported | dead code, do not migrate |

```ts
interface GuidePromptSection {
  id: string; heading: string;
  why?: string; think?: string[]; examples?: string[]; tip?: string; note?: string;
}
```

**Proposed mapping:** these are structured editorial content, not config. A generic
`prompt_guides` + `prompt_sections` pair covers the five GuidePrompt tools. The MSE,
care plan, risk and checklist datasets each earn their own tables (or JSON columns) -
they are genuinely different shapes and the risk dataset in particular encodes trust
template wording that must not be paraphrased (hard project rule: trust-approved form
wording is reproduced exactly). If a CMS cannot model them, keep these as versioned
JSON assets; they change rarely and only via clinical sign-off.

## 5. Links (bookmarks) - CONTENT

**File:** `src/lib/data/bookmarks/index.ts` (1,133 lines)
**Count:** 113 links across the 16 categories defined in `BOOKMARK_CATEGORIES`
(`src/lib/types/index.ts`).

```ts
interface Bookmark {
  id: string; title: string; icon: string; url: string;
  category: string; requiresFocus: boolean;
  description?: string; phone?: string;
}
```

**Proposed mapping:** `links` table, one row each, plus a `link_categories` lookup.
Two data-handling notes carry into any migration: (a) `requiresFocus` drives the
"trust login needed" warning modal - keep it; (b) several `phone` values render as
"Hidden in demo mode" with the real number in an adjacent code comment. On migration,
move real internal numbers into the database behind the trust firewall and delete the
comments (see governance audit findings).

## 6. Quiz bank - CONTENT

**Files:** `src/lib/data/quiz/index.ts` + 15 `research-*.json` files
**Count:** 364 live questions = 16 seed questions inline in `index.ts` + 348 across
the 14 imported JSON batches (23-26 each). Trap: `research-seed.json` (16 questions)
exists on disk but is **not imported** - it duplicates the inline seed. 26 topics,
3 difficulty levels.

```ts
interface QuizQuestion {
  id: string; category: string; difficulty: "Easy"|"Medium"|"Hard";
  scenario?: string; question: string;
  options: string[];        // exactly 4
  correctIndex: number;     // 0-3
  rationale: string; source: string; sourceUrl?: string; sourceDate?: string;
}
```

**Proposed mapping:** single `quiz_questions` table, columns as above (options as
JSON or a child table). Already effectively database-shaped - the JSON batches import
almost unchanged. Keep `source`/`sourceDate`: they are the audit trail for clinical
currency. Status: content is draft pending the owner's proofread.

## 7. Service map - CONTENT (with a caveat)

**File:** `src/lib/data/service-map.ts`
**Count:** 109 services, 12 clusters, 4 sample patient profiles.

```ts
interface Service {
  id: string; name: string; cluster: string;
  parent?: string;                       // reached via this service (tree layout)
  areas: ("city"|"county"|"out")[];      // catchment by residence
  include: Criterion[]; exclude: Criterion[];   // Criterion = { label, test: (Facts) => boolean }
  contact?: string; note?: string; catchmentNote?: string;
}
```

**Proposed mapping:** the names, contacts, notes, clusters and catchments migrate to a
`services` table directly. The `include`/`exclude` criteria are **functions**, not
data - a rebuild either re-expresses them as a small rule DSL (field, operator, value:
that covers every rule currently used - age ranges, diagnosis membership, flag
membership, enum equality) or accepts them as code. The source file itself marks
criteria "best-effort, to be verified", so budget a verification pass before this
drives anything real. Contacts are public numbers only.

## 8. Patient leaflets - CONTENT

**File:** `src/lib/data/patient-guides.ts`
**Count:** 29 leaflet metadata records (the file's own comment says 28 - stale; the
guides catalog card says 23 - also stale).
Shape: `{ id, number, title, subtitle, color }`. The leaflet bodies live in
`public/patient-guides.html` and the `/patient-guides/[id]` viewer.

**Proposed mapping:** `patient_leaflets` table for the metadata; the long-form bodies
belong in the same guide/CMS pipeline as everything else rather than a static HTML
poster file, which is the current weak point.

## 9. Approval status - CONTENT (governance-critical)

**File:** `src/lib/data/approval-status.ts`
**Count:** 23 guide overrides (1 green, 6 amber, 16 red) + 0 link overrides; anything
unlisted defaults to amber ("awaiting approval").

**Proposed mapping:** `approval_status` (content_type, content_id, status, signed_off_by,
signed_off_at). Today the sign-off audit trail is git history on this one file; a
rebuild should make it explicit columns. This tiny file is the clinical-governance
control surface - migrate it first-class, not as an afterthought.

## 10. Care review config - CONTENT/APP-STATE hybrid

**File:** `src/lib/data/care-review.ts`
**Count:** 6 tracked item definitions (admission tasks + recurring review cadences).
The definitions are content; the per-patient tick state lives in localStorage
(`wardhub_care_tracker_v2`, cleared on logout) and is demo-only.

## 11. Demo staff - APP-STATE (replace, do not migrate)

**File:** `src/lib/data/staff/index.ts`
**Count measured:** 25 staff = 5 named fictional staff per ward x 5 wards, roles
assigned by index (ward_admin, senior_admin, lead, manager, staff). **The code
comment claims "100 total: 20 x 5 wards" - it is wrong**, as is CLAUDE.md. Ward names
here are the capitalised data form ("Byron").

**Proposed mapping:** none. In a trust build this becomes the staff directory /
AD-ESR integration. The `StaffMember` shape (`id, name, role, ward, isActive,
isContributor`) is a reasonable starting schema for a `users` table with the
`isContributor` flag kept orthogonal to role.

## 12. Demo patients and tasks - APP-STATE (replace, do not migrate)

**File:** `src/lib/data/tasks/index.ts` (648 lines)
**Counts measured (generated at build):**

| Export | Actual | What the comments claim |
|---|---|---|
| `DEMO_PATIENTS` | 25 (5/ward, all generated as `active`) | "100 total: 20 x 5 wards" |
| `DEMO_WARD_TASKS` | 5 (1 recurring fridge-temp task/ward) | "60 total" |
| `DEMO_PATIENT_TASKS` | 25 (5/ward, spread over an 8-day window) | "~90 total" |
| `DEMO_APPOINTMENTS` | 20 (4/ward) | "35 total" |
| `DEMO_AUDIT_72HR_TASKS` | 10 (2/ward) | - |
| `ALL_DEMO_TASKS` | 60 | - |

Also here: `ALERTS_POOL` (15 clinical alert strings), `CONSULTANTS` (1/ward),
`PATIENT_TASK_TEMPLATES` (20 task templates) and `WARD_TASK_TEMPLATES` (12 templates,
7 of them audit tasks with Assurance Dashboard URLs) - the template lists are worth
keeping as seed content for a real task system.

**Proposed mapping:** the **types** are the valuable artefact, not the rows. The
`Patient`, `WardTask`, `PatientTask`, `Appointment` interfaces in
`src/lib/types/index.ts` are a worked-through schema for the real thing: tasks with
claim/complete audit fields (`claimedBy/At`, `completedBy/At`), recurrence
(`recurringDays` for ward tasks, `repeatIntervalDays` for patient tasks), carry-over
semantics, priority/status/shift enums, and patients with legal status, named nurse,
ward professional and alerts. A trust rebuild turns these into `patients`, `tasks`
and `appointments` tables (or SystmOne/Nexus integrations) and deletes the generators.
Remember the union quirk: appointments use `appointmentDate`, tasks use `dueDate`.

## 13. Parked: welcome tool data - CONTENT (dormant)

**Files:** `src/lib/data/welcome/admission.ts` (52 lines), `welcome/risk-screen.ts`
(266 lines). The admission co-production tool they feed is blocked at the proxy. Keep
or drop with the feature decision; do not migrate silently.

## 14. Browser localStorage - APP-STATE

Full key list and risk ratings are in `01-data-governance-audit.md` (reused here
rather than re-derived) plus the mechanical inventory in `08a-architecture.md`. For
migration purposes, three groups:

- **Becomes per-user server state** once accounts exist: referral chase log
  (patient-identifying by design), feedback board, personal links + recommendations,
  favourites, care tracker, guide feedback, verification map, ward settings.
- **Stays client-side happily:** theme, colour mode, diary view settings, dismissed
  banners/tour.
- **Dies with the demo:** `wardhub_user` (replaced by real auth),
  `wardhub_guide_order` and `wardhub_bookmarks` (replaced by a real editor backend),
  legacy `inpatient_hub_*` keys.

## Summary table

| Dataset | File(s) | Records | Class | Target |
|---|---|---|---|---|
| Guide catalog | `guides/catalog.ts` | 64 | CONTENT | `guides` |
| How-to bodies | `guides/howto-guides.ts` | 37 guides | CONTENT | `guides` + `guide_steps` + `guide_resources` |
| Referral workflows | `guides/referral-workflows.ts` | 17 workflows | CONTENT | `workflows` + `workflow_steps` + forms/methods |
| Builder/prompt datasets | 10 files under `guides/` | see section 4 | CONTENT | `prompt_guides` + bespoke tables or versioned JSON |
| Links | `bookmarks/index.ts` | 113 | CONTENT | `links` |
| Quiz | `quiz/index.ts` + 14 JSON | 364 | CONTENT | `quiz_questions` |
| Service map | `service-map.ts` | 109 services | CONTENT | `services` + rule DSL |
| Patient leaflets | `patient-guides.ts` (+ public HTML) | 29 | CONTENT | `patient_leaflets` |
| Approval lights | `approval-status.ts` | 23 overrides | CONTENT | `approval_status` |
| Care review defs | `care-review.ts` | 6 | CONTENT | config table |
| Demo staff | `staff/index.ts` | 25 (not 100) | APP-STATE | replace with directory integration |
| Demo patients/tasks | `tasks/index.ts` | 25 patients, 60 tasks | APP-STATE | replace; keep the types as schema |
| Welcome tool data | `welcome/*.ts` | parked | CONTENT (dormant) | decide with the feature |
| localStorage | ~24 keys | - | APP-STATE | per-user tables or stay client-side |
