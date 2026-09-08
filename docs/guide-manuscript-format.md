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
ratified_by: Mental Health Act Committee
ratification_date: 2026-09-12
ratified_issue: 4                 # which issue_no was ratified
review_group: Mental Health Act Committee

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
| `ratified_by` / `ratification_date` / `ratified_issue` | The record. A group, never a person. |
| `review_group` | Who owns it from here. Usually the same group. |
| `sources[]` with `issue_no` and `review_date` | Makes freshness checking possible. Without the source issue number there is nothing to compare against when a policy is reissued. |
| `last_source_check` | When a human or the Guide Auditor last confirmed the sources still say what we claim. |

**The load-bearing rule:** if `ratified_issue` does not equal `issue_no`, the guide is not
publishable. That one comparison stops a ratified guide being quietly edited afterwards, which
is the failure mode that would actually hurt.

## Where a guide gets ratified

**You do not need to invent an owner. The guide inherits its route from its sources.**

The Trust ratifies policies through fourteen groups. The ones that matter for this library:

| Ratification group | Policies |
|---|---|
| Quality and Safeguarding Committee | 32 |
| Mental Health Act Committee | 20 |
| Medicines Management Committee | 19 |
| Physical Health Care Committee | 17 |
| Adult Acute Care Group Performance Meeting | 11 |

A guide built from the Section 132 policy goes to the group that ratified the Section 132
policy. A NEWS2 guide follows its physical health sources. That is derivable from
`sources[]`, so the routing is a lookup rather than a negotiation.

This replaces the ten proposed shelves in `guide-signoff-shelves.md`. Instead of asking the
Trust to agree ten new owners, each guide arrives at the group that already owns that subject.
Far smaller ask, and it is the same governance everyone already follows.

Where a guide draws on sources ratified by different groups, it goes to the one covering its
primary clinical subject, and the others are listed in `sources[]` for anyone checking.

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
4. **Does a guide need its own ratification if it only restates a ratified policy?** Worth
   asking the Trust rather than assuming. If a guide is treated as a derived document rather
   than a new one, the route may be lighter than full ratification.
