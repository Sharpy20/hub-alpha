# 08d - Performance pass (bundle size and perceived speed)

> Date: 6 July 2026
> Scope: client bundle weight per route, code splitting, perceived-speed basics
> Build: Next.js 16.2.9 (Turbopack), production `npm run build`
> Status after pass: build clean, 32/32 tests pass, all key journeys re-verified in the browser

## How the numbers were measured

Next 16 with Turbopack no longer prints per-route size columns in the build
output, so the figures below are computed directly from the build artefacts:
for each prerendered route, every `/_next/static/chunks/*.js` file referenced
by its HTML is summed (raw bytes and gzip level 6). This is the JavaScript a
first-time visitor downloads for that route - the same thing the old
"First Load JS" column measured. The measurement script is reproducible and
was run identically before and after.

## Headline

| Metric | Before | After | Change |
|---|---|---|---|
| Biggest route (/links before, /tasks after) | 1,458 kB raw / 405 kB gzip | 1,017 kB raw / 287 kB gzip | -30% raw |
| Home page / | 1,391 kB / 390 kB | 850 kB / 250 kB | -39% raw |
| Shared floor (every route, incl. 404) | 882 kB / 256 kB | 791 kB / 233 kB | -10% raw |
| /quiz | 1,189 kB / 332 kB | 803 kB / 236 kB | -32% raw |
| Typical static guide page (/guides/debrief) | 1,162 kB / 342 kB | 815 kB / 240 kB | -30% raw |

Roughly 570 kB of the remaining floor is React, Next runtime and polyfills,
which every route needs and which caches after the first page view.

## Route table - top 15 routes by first-load JS

Raw kB / gzip kB per route.

| Route | Before | After |
|---|---|---|
| /links | 1,458 / 405 | 893 / 259 |
| / (home) | 1,391 / 390 | 850 / 250 |
| /guides/risk-assessment | 1,292 / 379 | 962 / 283 |
| /welcome | 1,199 / 356 | 928 / 272 |
| /quiz | 1,189 / 332 | 803 / 236 |
| /guides/seclusion-support-plan | 1,171 / 345 | 824 / 243 |
| /guides/leave-discharge-transfer | 1,170 / 344 | 823 / 243 |
| /guides/care-plan | 1,170 / 345 | 822 / 243 |
| /guides/admission-checklist | 1,166 / 342 | 835 / 246 |
| /guides/observation-engagement | 1,162 / 342 | 815 / 240 |
| /guides/debrief | 1,162 / 342 | 815 / 240 |
| /guides/safety-plan | 1,162 / 342 | 815 / 240 |
| /guides/restraint-monitoring | 1,162 / 342 | 815 / 240 |
| /guides/mha-checker | 1,162 / 341 | 829 / 244 |
| /tasks | 1,044 / 292 | 1,017 / 287 |

After the pass the heaviest route is /tasks (the Team Diary - a genuinely
large page with the full task system, modals and demo data, all of which it
really uses). Every other route is under 1 MB raw; the bulk of the site sits
at the ~791 kB shared floor plus a small page-specific slice.

## What changed and why

### 1. The full lucide icon set is no longer bundled (biggest single win, ~550 kB)

`src/components/common/dynamic-icon.tsx` did `import { icons } from
"lucide-react"`, which pulls the entire icon map (1,500+ icons) into any page
that renders a DynamicIcon - the home bookmark wheel and /links. Audit showed
every bookmark icon in the data is an emoji; the only lucide names ever passed
in are the ~20 category icons in the wheel hub plus the Link fallback.
DynamicIcon now uses an explicit named-import registry of exactly those icons
(tree-shakeable), with the same Link fallback for unknown names. If a new
category icon is added to `getCategoryIcon` in bookmark-carousel.tsx it must
also be added to the registry - there is a comment in both places.

Effect: home -541 kB, /links -566 kB.

### 2. Global search no longer ships its index on every page (~120 kB off every route)

The Ctrl+K palette (`src/components/layout/global-search.tsx`) sits in the
header, which renders on every page. It imported the full guide catalog
(which drags the referral-workflows data in behind `guideType`) and every
bookmark at module scope. The index is now dynamic-imported the first time
the palette opens. The trigger button and the Ctrl+K hotkey are unchanged and
instant; the index chunk (a few kB gzipped over the wire) arrives in
milliseconds on first open, with a brief "Loading..." state if someone types
faster than it loads. Verified in the browser: open, type, results with
correct type labels, keyboard navigation.

### 3. Two poisoned barrel files fixed (~65 kB off every route, ~230 kB off guide pages)

Two accidental barrel-import chains were dragging guide and workflow data into
pages that never use it:

- `@/components/ui/index.ts` re-exported `GuideSelect`, which imports the
  guide catalog (and through it the referral-workflows data). The root layout
  and MainLayout import from that barrel (ErrorBoundary, BackToTop), so the
  catalog landed in the root layout bundle of every page, including the 404.
  GuideSelect is no longer re-exported from the barrel (comment left
  explaining why); its two real users (/tasks page, BulkPatientTasksModal)
  import it directly.
- `@/components/modals/index.ts`: `PatientLink` (rendered by GuidePrompts on
  every clinical tips guide) imported `PatientPickerModal` via the modals
  barrel, which drags in TaskDetailModal, BulkPatientTasksModal (and its
  GuideSelect), the staff modals and their demo data. PatientLink and the
  guide viewer now import `PatientPickerModal` from its own file. The three
  pages that genuinely use many modals (/tasks, /my-tasks, /patients) still
  use the barrel.

### 4. Static guide pages import their own data module, not the guides barrel (~280 kB off each)

The ten static guide tools (debrief, care-plan, mha-checker, seclusion,
safety-plan, restraint, observation, MSE, admission checklist,
leave-discharge-transfer, plus risk-assessment, /welcome and risk-capture)
imported their data from the `@/lib/data/guides` barrel, which re-exports
howto-guides.ts (~200 kB source) and risk.ts (~96 kB source). Each page now
imports only its own data file (e.g. `@/lib/data/guides/debrief`). No data
file was touched - only import specifiers changed, so guides render
identically.

### 5. /quiz loads its 364-question bank lazily (-386 kB on the route)

`src/app/quiz/page.tsx` imported the whole question bank (15 JSON batches,
~300 kB) at module scope. The bank is now dynamic-imported on mount: the route
ships only the page shell, and the questions arrive as their own chunk with a
brief "Loading the question bank..." state on the setup screen. Types are
imported type-only (erased at build). Confirmed the bank does not leak into
any shared chunk - /quiz's page module is its only importer, and the global
search index does not touch quiz data. Verified in the browser: 364 questions,
category counts, full round played through with rationale display.

### 6. Home page TodayWidget got a same-shape loading placeholder

TodayWidget was already code-split (confirmed - the dynamic() call was in
place). It had no loading placeholder though, so the sections below it jumped
down when the chunk arrived. It now renders a fixed-height skeleton while
loading, so there is no layout shift.

## Perceived-speed checks (report)

- Home bookmark wheel: the wheel container is a fixed 440x440 px box, so it
  reserves its space and causes no layout shift. No change needed.
- Provider localStorage reads: `providers.tsx` (user, GDPR flag, active ward,
  theme, colour mode) and the other five providers all read localStorage
  inside `useEffect`, i.e. after first paint - they do not block rendering.
  Reported only, not refactored, as agreed.
- `tasks-provider.tsx` imports the full demo task dataset (~26 kB source,
  ~46 kB in the bundle) at module scope in the root layout, so it ships on
  every route. Deferring it would need the diary pages to tolerate an empty
  first frame (visible flicker) - deliberately left alone before the demo.
  If the shared floor needs to come down further, this and dynamic-loading
  TourModal (~30 kB, also in the root layout) are the next candidates.

## Deliberately left alone

- Guide data files (howto-guides.ts, risk.ts, referral-workflows.ts etc.) -
  untouched; only import paths to them changed. Guides work identically.
- next.config - no changes at all.
- No new dependencies.
- Fonts - already self-hosted via next/font; not touched.
- public/patient-guides.html (196 kB) - fetched on demand by its viewer, fine.
  public/ has no large unoptimised images (largest other asset is tiny).
- /tasks, /my-tasks, /patients - still the heaviest routes, but their weight
  is the feature (full diary/kanban/patient system plus the demo data they
  actually render). Splitting those would be restructuring, not trimming.
- /dev-panel (~153 kB source) - already route-local, only paid by /dev-panel.
- The remaining ~220 kB of shared app code above the framework floor
  (providers, header/nav, footer, GDPR modal, tour, toaster) - each is used
  on effectively every page view; no single safe win left there beyond the
  two report-only items above.
- Pre-existing lint backlog and the jest-dom type noise under `npx tsc` on
  test files (excluded from the build's TS pass) - out of scope.

## Verification

- `npm run build` - clean (compiled successfully, TypeScript pass clean).
- `npm test` - 32/32 pass.
- Browser (dev server, all with zero console errors/warnings and no failed
  network requests): home + wheel icons render (lucide registry), Ctrl+K
  search opens and returns typed results, /quiz setup shows all 364 questions
  and a full round plays through, /guides index lists 64 guide cards,
  /guides/debrief (static tool) and /guides/imha-advocacy (dynamic workflow)
  render, /tasks opens with the add-task modal working including the
  "link a referral workflow" guide picker (65 options), /service-map renders
  the prototype map, /links renders all categories and link cards.
