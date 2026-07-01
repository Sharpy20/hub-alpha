# wardHub Gap Audit - 1 July 2026

A content/coverage audit of the guides and links, done from the code (not guesswork).
Purpose: give Mike a clear "what still needs doing before launch" list.

---

## Headline numbers

| Metric | Count |
|---|---|
| Guides on the index (`ALL_GUIDES`) | 57 |
| Guides with real backing (content / workflow / bespoke tool) | 55 |
| **Pure placeholder guides (generic filler)** | **2** - `dols`, `named-nurse` |
| Referral workflows (step-by-step) | 17 |
| Bespoke interactive tools (builders/checkers) | 11 |
| How-to content guides (with real steps) | 28 |
| Dead "download form" links (`url: "#"`) | 82 (now shown as "Blocked in demo") |

## Approval traffic-light status

The honest baseline: **nothing is signed off yet.**

| Status | Count | Meaning |
|---|---|---|
| 🟢 Green (Passed) | **0** | Mike has checked it - safe to trust |
| 🟠 Amber (Awaiting approval) | ~43 | Built, not yet signed off (the default) |
| 🔴 Red (In development) | 16 | Being worked on - do not trust yet |

Red list now: prenoxad, dols, named-nurse, seclusion-support-plan, debrief, safety-plan,
restraint-monitoring, observation-engagement, leave-discharge-transfer, arrange-mha-assessment,
section-132, section-136, tribunal-report, dama, transfer-in, awol.

**Action for Mike:** the single biggest pre-launch job is a proofread pass to move
guides from amber to green. Until then every guide honestly reads "awaiting approval".

---

## Gap 1 - Two placeholder guides on the index

`dols` (DoLS Ward Guidance) and `named-nurse` (Named Nurse Checklist) are listed on the
guides index but have **no real content** - they render the generic 3-step fallback.

- Done today: both set to 🔴 red so the traffic light warns users they are not real yet.
- **Needs Mike:** the actual DoLS ward guidance and the named-nurse weekly/monthly checklist content.

## Gap 2 - Orphan content (built, not surfaced)

These how-to guides have full content but are **not on the index**, so nobody can find them
except by direct URL:

- `safeguarding-adults-referral` ("Making a Good Safeguarding Adults Referral")
- `safeguarding-children-referral` ("Safeguarding Children - Starting Point Referral")

The index instead links the *workflow* versions (`safeguarding`, `safeguarding-children`).
**Decision needed:** are these how-to versions superseded (delete them) or should they be
linked as companion reading? Low priority - not user-facing harm, just dead weight.

## Gap 3 - Empty config stubs (planned, never written)

These have a config entry (icon/colour/category) but no content and are not on the index -
someone planned them and stopped. Harmless (unreachable) but worth a decision:

`cardiac-arrest`, `choking`, `ecg`, `fluid-balance`, `neuro-obs`, `pain-assessment`, `restraint`

Mostly physical-health / emergency-response topics. **Decision:** build them out and add to
the index, or remove the stubs. Note `cardiac-arrest`/`choking` overlap the "Emergency
Response" category which is otherwise empty on the index.

## Gap 4 - 82 blocked form downloads

82 referral-workflow "download the blank form" / "view example" links are `#` placeholders
(the real forms live on FOCUS). Done today: these now render a greyed-out tile with a
**"Blocked in demo"** badge instead of a dead link, so it is obvious in the demo and honest
about what the live version will do. **Needs Mike (live version):** wire each to the real
FOCUS form URL.

## Gap 5 - Orphan topics with no guide at all

From the earlier doc-rescue audit, these topics have trust source material but no guide yet
(carried forward, not re-verified today): Red Folders, MAPPA, PD/psychoeducation, SAT autism,
136 leaflets. Lower priority than the approval pass.

---

## What is NOT a gap (verified healthy)

- All 17 referral workflows resolve to real step-by-step content.
- All 11 bespoke tools (MSE, risk, care-plan, MHA checker, admission checklist, seclusion,
  debrief, safety plan, restraint, observation, leave/discharge) have their own routes.
- `news2` is real content (it uses an unquoted object key, which tripped an earlier check -
  worth remembering when auditing this file).
- Global search covers every index guide + every link.

---

## Suggested pre-launch order

1. **Proofread pass** - amber -> green on the guides Mike trusts (biggest single job).
2. Write `dols` + `named-nurse` content (only two true placeholders).
3. Decide on Gap 2/3 (delete or build the orphans/stubs).
4. FOCUS form wiring (live version only - Gap 4).
5. FOCUS safety audit (needs Mike's login) + WCAG residuals (snag 192).
