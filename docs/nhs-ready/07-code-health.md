# wardHub code health pass

> Prompt 7 of the NHS-ready pack. Run 5 Jul 2026. Goal: handover quality - a trust
> developer can read this repo without asking Mike anything. Build clean, 32/32 tests pass.

## Lint: 135 problems to zero

`npm run lint` reported 135 problems (67 errors, 68 warnings) across ~37 files before this
pass. It now reports zero. Three rule adjustments were made in eslint.config.mjs, each with
a why-comment in the config:

- `@typescript-eslint/no-unused-vars` now accepts the `_`-prefix convention for
  deliberately unused bindings (standard practice, lets interface-shaped params exist).
- `react/no-unescaped-entities` no longer bans bare apostrophes and quotes in JSX. This
  app is copy-heavy NHS guidance prose; forcing `&apos;` onto every apostrophe makes
  clinical wording unreadable in source and invites typos. The rule still bans `>` and
  `}`, the characters that genuinely signal broken JSX.
- `react-hooks/set-state-in-effect` is off. The codebase deliberately hydrates client
  state from localStorage inside mount effects because localStorage does not exist during
  server render - the pattern this rule flags is the correct Next.js pattern here.
- Jest config files may use `require()` (they are CommonJS by design).

Everything else was fixed properly in code, not silenced: unused imports removed, unused
variables underscore-prefixed or deleted, a ref-during-render error resolved, and an
`as any` in the patient task templates replaced with a real type.

## Dead code removed (verified unreferenced before deletion)

- `src/components/admin/RoleGate.tsx` and `src/components/admin/index.ts` - nothing
  imported either (grep across src, scripts, .github).

## Deliberately kept (do not "tidy" these away)

- The v1/v2 split machinery: `useV2.ts`, `proxy.ts`, `COLLAPSED_FOR_DEMO` in
  `src/lib/config/build.ts` and every `isV2` gate. The split is dormant, not dead - one
  flag re-splits the builds.
- The Welcome tool (`src/app/welcome` + data) - parked by decision, plan is to store the
  code and remove it from live before launch.
- `PromptBuilder.tsx` + `builder.ts` - retired from use in Session 27 but kept on purpose.
- `src/lib/supabase/client.ts` - dormant by design and deliberately unexported from the
  module index so it stays out of the browser bundle (governance fix F12).
- No package.json dependency changes: every dependency is genuinely used (supabase-js by
  the dormant client, focus-trap-react by useModalA11y, axe-core as the a11y audit tool).

## Consistency and comment fixes

- Date formatting: no remaining `toISOString().split` date-string sites (the
  `toLocalDateStr()` rule from snag 149 still holds; re-verified by grep).
- localStorage keys: access goes through per-file constants where a constants pattern
  exists (ward-settings-provider). Key naming inconsistency (`wardhub_` vs `wardhub-` vs
  unprefixed feedback keys) is documented in 08a-architecture.md rather than renamed -
  renaming would orphan existing users' stored data for zero user benefit.
- Stale data-size comments corrected to reality (comments only, no generation changes):
  staff and patients are 25 each (5 per ward), not the "100 total" the comments claimed;
  ward tasks are 1 recurring per ward; appointments 4 per ward; patient-guides count is 29.
- What-comments deleted, why-comments kept, per the project style guide. The
  `// Real: ...` hidden-contact comments and the `E:\Hub\temp` pointers are a governance
  pattern and were not touched.

## For Mike

1. **Demo data size decision.** The code generates 25 staff / 25 patients (5 per ward),
   and with only 5 patients per ward every patient ends up status "active" - the demo has
   no pending-discharge, on-leave or discharged patients, so those UI states never show.
   If the demo should show them (nice for the trust walkthrough), grow the name pools past
   7 per ward or reorder the status distribution. One-line-ish change; your call because
   it changes what the demo shows.
2. The lint rule relaxations above are opinionated - if the trust has a house ESLint
   config one day, revisit.
3. CLAUDE.md and MEMORY.md still describe 100/100 demo data and 8 guide categories -
   worth a docs refresh sweep (reality: 25/25 and 12 categories; see 08a/08b).
