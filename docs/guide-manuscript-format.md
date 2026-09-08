# Guide manuscript format

**Draft, 8 September 2026.** For Mike's review before anything is built against it.

Revised the same day: the approval fields now mirror the Trust's own policy front sheet
rather than a vocabulary wardHub invented, because guides will follow the existing policy
approval route. The site will hold no staff records, so nothing here identifies an individual.

---

## Why this exists

A guide is ratified by a group that is accountable for what it says. For that to be worth
anything, we have to be able to answer, at any point in the future:

- what the guide said on a given date
- which policy each clinical claim came from, and which issue of it
- which group ratified which issue, and when
- what changed between issues
- when it was last checked against its sources

None of that can live in the website, because a website only shows the current page. It cannot
live in a Copilot conversation either, because those disappear and one of them has already
produced a citation that did not exist. So it lives in the manuscript.

**The manuscript is the source of truth. Everything else renders it.**

That inverts what we do now. Today `scripts/export-guide-manuscripts.mjs` dumps the TypeScript
out to markdown, so the code is master and the manuscript is a snapshot. Under this format the
manuscript is master and the site is built from it.

## The file

One markdown file per guide, named `<guide_id>.md`, in the SharePoint **wardHub Guide
Manuscripts** library. SharePoint supplies version history and the approval column, so we are
not building an approval system, we are using the one the Trust already runs policies through.

Markdown rather than JSON on purpose. Someone has to read this and ratify it, and nobody
reviews JSON honestly. Everything a machine needs is either in the frontmatter or in a table,
both of which read fine to a person.

## Frontmatter

The field names are the Trust's, taken from the policy front sheet: Service area, Issue date,
Issue no., Review date, Ratified by, Ratification date, and Committee/Group responsible for
review.

```yaml
---
guide_id: imha-advocacy
title: IMHA / Advocacy
category: Legal & Advocacy
guide_type: step-by-step          # step-by-step | how-to | checklist | tips | builder
summary: Independent Mental Health Advocate for all patients, informal and detained.

service_area: Trust-wide
issue_no: 4                       # increments on ANY change to the body
issue_date: 2026-09-12
review_date: 2029-09-12
ratification:
  lead_group: Mental Health Act Committee
  contributing_groups: [Quality and Safeguarding Committee]
ratification_date: 2026-09-12
ratified_issue: 4                 # which issue_no was ratified
review_group: Mental Health Act Committee

conflicts:
  - ref: CR-17                    # id in CONFLICT-REGISTER.md
    between: [s132-pol, mha-cop]
    guide_follows: s132-pol       # a source id, or: unresolved
    note: Policy is more specific than the Code on timing. Both quoted in the body.

sources:
  - id: s132-pol
    title: Section 132 Rights Policy
    issue_no: "04"
    issue_date: 2025-12
    review_date: 2028-12
    ratified_by: Mental Health Act Committee
    held: Trust Policy Library

last_source_check: 2026-09-08
---
```

### The fields that carry the audit

| Field | Why it exists |
|---|---|
| `issue_no` | The thing ratification attaches to. Increments on any change to the body, no exceptions. |
| `ratification.lead_group` / `ratification_date` / `ratified_issue` | The record. Groups, never people. |
| `ratification.contributing_groups` | Every other group whose policy this guide draws on. They may want sight of it. |
| `conflicts[]` | Where sources disagree: which conflict, which source the guide follows, or that it is unresolved. |
| `review_group` | Who owns it from here. Usually the same group. |
| `sources[]` with `issue_no` and `review_date` | Makes freshness checking possible. Without the source issue number there is nothing to compare against when a policy is reissued. |
| `last_source_check` | When a human or the Guide Auditor last confirmed the sources still say what we claim. |

**The load-bearing rule:** if `ratified_issue` does not equal `issue_no`, the guide is not
publishable. That one comparison stops a ratified guide being quietly edited afterwards, which
is the failure mode that would actually hurt.

## Where a guide gets ratified

**A guide built from one policy inherits that policy's route.** The register at
`E:\Hub\policy-audit-full\POLICY-REGISTER.csv` records a `RatificationGroup` for every
policy, across fourteen groups. The ones that matter for this library:

| Ratification group | Policies |
|---|---|
| Quality and Safeguarding Committee | 32 |
| Mental Health Act Committee | 20 |
| Medicines Management Committee | 19 |
| Physical Health Care Committee | 17 |
| Adult Acute Care Group Performance Meeting | 11 |

So a Section 132 guide goes to the Mental Health Act Committee, because that is who ratified
the Section 132 policy. Nobody has to agree an owner for it.

### But most guides are not built from one policy

This is the part that does not resolve neatly, and it should not be papered over.

The whole point of a wardHub guide is that it pulls together what several documents say so a
nurse does not have to read five policies at 3am. The July audit found what that means in
practice: 60 conflicts across the corpus, a rapid tranquillisation interval that appears in
only one document, a NEWS2 escalation ladder that cannot be followed as written because two
documents disagree on frequency, and two ratified policies contradicting each other on
olanzapine monitoring.

So there are three cases, and they are not equally hard.

| Case | What the guide is | Route |
|---|---|---|
| One source | A restatement | That source's group |
| Several sources, all agreeing | Still a restatement, just gathered up | Lead group, others listed |
| Several sources, disagreeing | **A new clinical statement** | Needs deciding, see below |

**The third case is the one to be careful about.** If policy A says fifteen minutes and policy
B says thirty, a guide that says "fifteen" has made a clinical decision that neither committee
made. Whoever ratifies that guide is ratifying the choice, not just the wording. That is a
much bigger ask than signing off a restatement, and it is worth knowing before walking into a
committee expecting the light route.

### The rule that keeps this safe

**A guide may not state a resolution that no source states.**

Where sources disagree, the guide does one of two things, and never a third:

1. **Follows one source and says so**, with both quoted in the body, so the reader can see
   there is another position and which one this guide takes. Record it in `conflicts[]` with
   `guide_follows` set.
2. **Says the position is unresolved**, names the conflict, and tells the reader who to ask.
   `guide_follows: unresolved`.

What it must never do is pick silently. A guide that quietly resolves a contradiction between
two ratified policies is doing exactly the thing we have said all along the tools do not do,
which is interpret. It is also the failure the agent already demonstrated: the fabricated
quote it produced in July made two documents agree, and dissolving a conflict is the most
dangerous error available to a tool whose job is surfacing them.

### Conflicts are a finding, not a wardHub problem

Those 60 conflicts exist whether or not wardHub does. Building guides is simply the activity
that makes them visible, one clinical subject at a time.

That is arguably the most valuable thing the project produces, but it needs somewhere to go.
`CONFLICT-REGISTER.md` already holds them with ids, severity and status, so a guide can cite
`CR-17` rather than inventing its own account. What is missing is a Trust-side owner for the
register. Worth asking for, because without it every guide that surfaces a contradiction stops
dead at ratification with nobody able to settle it.

## The body

Ordinary markdown. One `##` per step or section, in the order the user meets them.

**Every clinical claim carries its source as a footnote.** A clinical claim is anything a
nurse could act on: a time limit, an interval, a threshold, who to contact, what must happen
before what.

```markdown
## 1. Confirm criteria

All patients have the right to access an Independent Mental Health Advocate, whether
informal or detained.[^s132-pol]

[^s132-pol]: Section 132 Rights Policy, issue 04 - "Every detained patient and every
informal patient shall have access to an Independent Mental Health Advocate."
```

The footnote id matches a `sources[]` id, and the footnote carries the **actual quote**, not a
paraphrase.

This is the rule the Guide Builder agent already runs on, and it is what turns auditing from
open-ended reading into simple verification: does the quote exist, does it say that, did
anything else say different. An uncited claim becomes visibly an invention rather than
something you have to hunt for.

Prose that is not a clinical claim needs no footnote. Do not decorate.

## Branching

Routes go in a table, because a table reads fine to a reviewer and parses fine to a renderer.

```markdown
## 4. Select area

Which area is the patient from? This determines which advocacy service to use.

| Choice | Service | Form | Contact |
|---|---|---|---|
| Derby City | Disability Direct | DDA IMHA Referral Form 2026 | info@disabilitydirect.com |
| Derbyshire County | Cloverleaf | Cloverleaf online referral | referrals@cloverleaf-advocacy.co.uk |
```

Any step whose heading is followed by a table with a `Choice` column is a branch. Everything
else is linear. That is the whole rule, and it was enough for the most heavily branching guide
in the library.

## Restricted content

Anything not publicly findable is referenced, never inlined:

```markdown
Contact the MHA office on {{contact:mha-office}}.
```

Real values stay in `E:\Hub\temp\internal-contacts.md`, keyed by the same id. The renderer
substitutes them, or shows "Hidden in demo mode" where it should not. This is the existing
Rule 4 pattern, generalised past phone numbers so it also covers FOCUS links and
trust-specific wording.

A manuscript can then be handled, reviewed and moved between systems without carrying
restricted detail with it.

## No personal data

The site holds no staff records and no patient records, so nothing in a manuscript identifies
anyone. `ratified_by` and `review_group` are groups. Contacts are either publicly published
service details or a `{{contact:...}}` reference.

Worth stating in the format rather than leaving as an assumption, because it is the reason
this content can move between SharePoint, a website and SystmOne without a fresh assessment
each time.

## Builders are different

The interactive tools (risk assessment, the checkers, care plan, safety plan) are not step
lists, so their manuscripts document what a reviewer actually needs to check: the questions
asked, the chip banks offered, and the rules the tool holds itself to. The frontmatter is
identical. The body is not yet specified, and should not be until one has been through
ratification manually and we know what the group asks for.

## What happens when

| Event | What changes |
|---|---|
| Agent drafts a guide | New file, `issue_no: 1`, no ratification fields |
| Human edits | Increment `issue_no` |
| Sent for ratification | Goes to the group its sources point at |
| Group ratifies | Set `ratified_by`, `ratification_date`, `ratified_issue`, `issue_date`, `review_date`, `review_group` |
| Anyone edits after ratification | Increment `issue_no`. Now unpublishable until re-ratified |
| Source policy reissued | Update `sources[].issue_no`, clear `last_source_check`, flag for re-check |
| Guide retired | Mark withdrawn. The file stays. Nothing is deleted |

## What this does not do yet

- **Does not specify the builder body.** Deliberate, see above.
- **Does not cover the 29 patient leaflets.** They need less: no branching, and their sources
  are mostly national. Same frontmatter, simpler body.
- **Does not say how content reaches the site.** On purpose. Build-time pull, runtime read and
  manual import all consume this format identically, so that decision can wait and can change
  later without redoing any of this.

## Open questions for Mike

1. **Who increments `issue_no`?** Honest answer is it will get forgotten if it is manual.
   Worth considering whether the tooling does it on export.
2. **Does `review_date` follow the Trust's three-year default, or the source policy's own
   review date?** Inheriting from the source is less work and probably more correct, because
   a guide goes stale when its policy does, not on its own clock.
3. **Do we backfill 68 guides, or apply this to new and edited ones only?** Backfilling
   sources for guides written months ago is a large job and may not be worth it before the
   pilot. Look at the worked example before deciding.
4. **Does a single-source guide need its own ratification, or is it a derived document?**
   Worth asking the Trust rather than assuming, and the answer sets the whole timeline. If
   restatements take a light route and only the synthesising guides need full ratification,
   most of the library can move quickly and the slow queue is small. That is the same split
   as the Tier A / Tier B idea, with a test you can actually apply: count the sources, then
   check whether they agree.
5. **Who owns the conflict register?** A guide that surfaces a contradiction between two
   ratified policies cannot be signed off by either committee alone. Without an owner, those
   guides stall.
