# What wardHub does not do yet

> Written 5 Jul 2026 as part of the dress rehearsal. Say these out loud before someone
> asks. Walking in with this list is stronger than being caught without it.

## Content

- Most content is awaiting my clinical sign-off: of 64 guides, 1 is green (approved),
  47 amber (awaiting review) and 16 red (in development). The traffic lights on every
  tile say exactly this, and /about shows the live counts.
- 131 form links are placeholders awaiting FOCUS URL wiring; each carries a
  "blocked in demo" badge. The real URLs are captured and wiring is routine work.
- One dead external link (stayingsafe.net) and three stale ones are known and listed
  in the content sweep; 7 older how-to guides exist but are not listed on the index.
- The 364-question quiz is web-sourced and referenced, but still draft pending my
  proofread.

## Data and infrastructure

- No trust authentication yet - the demo is deliberately open because it holds no real
  data. A live build needs trust login before anything real touches it.
- Everything lives in the browser on each device. Tasks in the team diary do not sync
  between computers - a live build needs a server-side store, and the hazard log marks
  that as a go-live blocker, not a nice-to-have.
- Not connected to SystmOne or any clinical system. The copy-to-clipboard case note is
  the bridge, by design, until an integration is approved.
- The private GitHub repository's history still contains an early upload of raw trust
  documents; the fix (a history rewrite) is prepared and waiting on my go-ahead.

## Product

- The demo ward data shows only active patients - no discharged or on-leave examples,
  so those screens' filters have nothing to show.
- Accessibility: all ten main pages pass WCAG 2.1 AA checks with zero automated
  violations; secondary admin pages and about twenty low-traffic dialogs are listed
  exceptions still to be brought up to the same standard.
- The footer names the trust; the wording pending sign-off is my decision to settle
  before the meeting.

None of these are hidden. Each one is documented, has an owner (mostly me), and most
have the fix already scoped in the docs/nhs-ready pack.
