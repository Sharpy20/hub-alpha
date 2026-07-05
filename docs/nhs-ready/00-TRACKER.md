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
| 5 | Accessibility re-audit and fix | not started | | |
| 6 | Content and dead-link sweep (+ guide consistency) | not started | | |
| 7 | Code health pass | not started | | |
| 8 | Rebuild pack (portability) | not started | | |
| 8b | Fast loading (performance) | not started | | |

## Day 3 - The pitch

| # | Prompt | Status | Date | Result |
|---|--------|--------|------|--------|
| 9 | Executive deck | not started | | |
| 10 | One-pager and demo script | not started | | |
| 11 | In-product governance page | not started | | |
| 12 | Dress rehearsal | not started | | |

## Notes between sessions

(Anything a later session needs to know that doesn't fit a report goes here.)
