# NHS-Ready Tracker

One row per prompt from [PROMPT-PACK.md](./PROMPT-PACK.md). Whoever finishes a prompt
updates their row: status (done / partial / blocked), date, and a one-line result.

## Day 1 - Governance and assurance

| # | Prompt | Status | Date | Result |
|---|--------|--------|------|--------|
| 1 | Data map and governance audit | done | 4 Jul | 12 findings in 01-data-governance-audit.md. Big one: 110 MB trust-docs dump still in GitHub history (needs Mike-approved history rewrite, F1). Also live ext 33333 in a guide, tracked FOCUS harvests, privacy copy contradicting code. |
| 2 | Governance fix pass | done | 4 Jul | F3-F12 applied + browser-verified (commits f39322f, a70a072, 7ad07bf): internal contacts hidden/redacted/moved out, fonts self-hosted (zero external requests), CSP locked to 'self', Supabase client out of bundle, logout clears patient stores, FOCUS harvests untracked, stale docs deleted, README rewritten. OPEN FOR MIKE: F1 history rewrite (110 MB dump still in GitHub history), F2 footer trust-name wording. |
| 3 | DPIA + clinical safety starter pack | done | 4 Jul | 03a DPIA (ICO structure, demo + live scopes, 20 [TRUST TO CONFIRM] items), 03b hazard log extending the existing DCB0129 set (9 new hazards, HAZ-020/022 flagged go-live blockers), 03c data flow diagrams. |
| 4 | Security sweep | done | 4 Jul | 04-security-review.md: 0 high, 1 medium, 3 low. Medium (link URL schemes) + noopener fixed same day. Live site already serving the locked CSP. Auth plan for trust build documented (Entra ID via Auth.js). |

## Day 2 - Quality and rebuildability

| # | Prompt | Status | Date | Result |
|---|--------|--------|------|--------|
| 5 | Accessibility re-audit and fix | done | 5 Jul | 05-accessibility.md: axe-core live audit, 10 pages, light+dark - 32 issues fixed, now ZERO A/AA violations on all audited pages. Snag 192 closed: contrast sweep, theme fixes, new useModalA11y hook (Escape + focus trap) on 8 top modals, keyboard drag-drop equivalent documented. Exceptions listed honestly (secondary admin pages, ~20 low-traffic modals). Trust-facing conformance statement included. |
| 6 | Content and dead-link sweep (+ guide consistency) | done | 5 Jul | 06-content-sweep.md: 289 URLs inventoried (51 FOCUS, 131 placeholders), 1 dead + 3 stale links found, 12 copy fixes, 19 consistency fixes (badge gaps closed, stale viewer categories aligned). All 17 workflows follow the standard step order. 41/64 guides missing approval-status entries (silently amber). 12-item judgement list for Mike incl. 7 orphan how-to guides. |
| 7 | Code health pass | done | 5 Jul | Lint 135 problems to ZERO (3 justified rule adjustments, rest fixed in code). Dead RoleGate removed; parked features deliberately kept. Stale data-size comments corrected (25/25 demo data reality). For Mike: demo shows no discharged/on-leave patients with 5/ward - grow name pools if the walkthrough needs those states. 07-code-health.md. |
| 8 | Rebuild pack (portability) | done | 5 Jul | 08a architecture (verified route map, 24 localStorage keys, 12 gotchas), 08b data inventory (measured counts: 64 guides, 113 links, 364 quiz Qs, 109 services), 08c options - recommends keep-Next.js-on-trust-infra (~1-2 dev-weeks). Flags: static export would re-expose parked /welcome (proxy-blocked only); docs say 100/100 demo staff/patients but code generates 25/25, all "active". |
| 8b | Fast loading (performance) | done | 5 Jul | 08d-performance.md: home 1391 to 850 kB, quiz 1189 to 803, guide pages 1162 to 815, shared floor 882 to 791 kB. Root causes: lucide icon map bundled site-wide, search index in the header, two poisoned barrels. Quiz bank + search index now lazy. Browser-verified, zero console errors. Next candidates documented (tasks-provider demo data, TourModal). |

## Day 3 - The pitch

| # | Prompt | Status | Date | Result |
|---|--------|--------|------|--------|
| 9 | Executive deck | done | 5 Jul | 09-wardHub-exec-deck.pptx: 14 slides, 5 real screenshots (2800px), speaker notes in Mike voice on every slide, NHS Identity styling. Story: 3am problem, what it is (real counts), traffic-light governance, no-data-leaves slide, homework-already-written slide, GBP 0 cost, three asks, roadmap. Visual QA pass fixed 5 defects; opens cleanly in PowerPoint. |
| 10 | One-pager and demo script | not started | | |
| 11 | In-product governance page | done | 5 Jul | /about live: what it is, data position (every claim cross-checked vs the audit), LIVE traffic-light counts computed from approval-status (1 green / 47 amber / 16 red of 64 - matches the index exactly), what the demo is not. Linked from footer + More menu (desktop and mobile). Dark-mode readable. |
| 12 | Dress rehearsal | not started | | |

## Notes between sessions

(Anything a later session needs to know that doesn't fit a report goes here.)
