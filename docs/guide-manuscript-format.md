# Guide manuscript format

**Draft, 8 September 2026.** For Mike's review before anything is built against it.

---

## Why this exists

A guide is approved by a clinician who is accountable for what it says. For that approval to
be worth anything, we have to be able to answer, at any point in the future:

- what the guide said on a given date
- which policy each clinical claim came from, and which version of it
- who approved which version, and when
- what changed between versions
- when it was last checked against its sources

None of that can live in the website, because the website only ever shows the current page.
It cannot live in a Copilot conversation either, because those disappear and one of them has
already produced a citation that did not exist. So it lives in the manuscript.

**The manuscript is the source of truth. Everything else renders it.**

That is an inversion of what we do now. Today `scripts/export-guide-manuscripts.mjs` dumps
the TypeScript out to markdown, so the code is the master and the manuscript is a snapshot.
Under this format the manuscript is the master and the site is built from it.

## The file

One markdown file per guide, named `<guide_id>.md`, held in the SharePoint **wardHub Guide
Manuscripts** library. SharePoint supplies version history and the approval column, so we are
not building an approval system, we are using the one the Trust already runs policies through.

Markdown rather than JSON on purpose. A clinical reviewer has to read this and put their name
to it, and nobody reviews JSON honestly. Everything a machine needs is either in the
frontmatter or in a table, both of which read fine to a person.

## Frontmatter

```yaml
---
guide_id: imha-advocacy
title: IMHA / Advocacy
category: Legal & Advocacy
guide_type: step-by-step          # step-by-step | how-to | checklist | tips | builder
summary: Independent Mental Health Advocate for all patients, informal and detained.

content_version: 4                # integer, bumps on ANY change to the body
status: approved                  # draft | in-review | approved | withdrawn
approved_by: Ward Manager, Radbourne   # role, or role and name
approved_on: 2026-09-12
approved_version: 4               # which content_version was approved
review_due: 2027-09-12

sources:
  - id: s132-pol
    title: Section 132 Rights Policy
    version: "04"
    dated: 2025-12
    held: Trust Policy Library
  - id: mha-cop
    title: MHA Code of Practice
    version: "2015"
    dated: 2015-04
    held: national

last_source_check: 2026-09-08
---
```

### The fields that carry the audit

| Field | Why it exists |
|---|---|
| `content_version` | The thing approval attaches to. Bump it on any body change, no exceptions. |
| `status` | Only `approved` publishes. Nothing else reaches the site. |
| `approved_by` / `approved_on` / `approved_version` | The record. If `approved_version` is behind `content_version`, the guide has been edited since sign-off and must not publish. |
| `sources[]` with `version` and `dated` | Makes the freshness check possible. Without the source version there is nothing to compare against when a policy is reissued. |
| `last_source_check` | When a human or the Guide Auditor last confirmed the sources still say what we claim. |
| `review_due` | Drives the chasing flow. |

**The single most useful rule in the whole format:** if `approved_version` does not equal
`content_version`, the guide is not publishable. That one comparison stops a signed-off guide
being quietly edited afterwards, which is the failure mode that would actually hurt.

## The body

Ordinary markdown. One `##` per step or section, in the order the user meets them.

**Every clinical claim carries its source as a footnote.** A clinical claim is anything a
nurse could act on: a time limit, an interval, a threshold, who to contact, what must happen
before what.

```markdown
## 1. Confirm criteria

All patients have the right to access an Independent Mental Health Advocate, whether
informal or detained.[^s132-pol]

[^s132-pol]: Section 132 Rights Policy v04 - "Every detained patient and every informal
patient shall have access to an Independent Mental Health Advocate."
```

The footnote id matches a `sources[]` id. The footnote text carries the **actual quote**, not
a paraphrase.

This is the rule that already runs the Guide Builder agent, and it is what turns auditing
from open-ended reading into simple verification: does the quote exist, does it say that, did
anything else say different. An uncited claim becomes visibly an invention rather than
something you have to go hunting for.

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
else is linear. That is the whole rule, and it is enough for every branching guide we have.

## Restricted content

Anything not publicly findable is referenced, never inlined:

```markdown
Contact the MHA office on {{contact:mha-office}}.
```

Real values stay in `E:\Hub\temp\internal-contacts.md`, keyed by the same id. The renderer
substitutes them, or shows "Hidden in demo mode" where it should not. This is the existing
Rule 4 pattern, generalised past phone numbers so it also covers FOCUS links and
trust-specific wording.

The point is that a manuscript can be handled, reviewed and moved between systems without
carrying restricted detail around with it.

## Builders are different

The interactive tools (risk assessment, the checkers, care plan, safety plan) are not step
lists, so their manuscripts document what a reviewer actually needs to check: the questions
asked, the chip banks offered, and the rules the tool holds itself to. The frontmatter is
identical. The body is not yet specified, and should not be until we have signed one off
manually and know what a reviewer asks for.

## What happens when

| Event | What changes |
|---|---|
| Agent drafts a guide | New file, `status: draft`, `content_version: 1` |
| Human edits | Bump `content_version` |
| Sent for sign-off | `status: in-review` |
| Clinician approves | `status: approved`, set `approved_by`, `approved_on`, `approved_version` |
| Anyone edits after approval | Bump `content_version`. It is now unpublishable until re-approved |
| Source policy reissued | Update `sources[].version`, clear `last_source_check`, flag for re-check |
| Guide retired | `status: withdrawn`. The file stays. Nothing is deleted |

## What this does not do yet

- **Does not specify the builder body.** Deliberate, see above.
- **Does not cover the 29 patient leaflets.** They need less: no branching, and their sources
  are mostly national. Same frontmatter, simpler body.
- **Does not say how content reaches the site.** On purpose. Build-time pull, runtime read or
  manual import all consume this format identically, so that decision can wait and can change
  later without redoing any of this.

## Open questions for Mike

1. **`approved_by`: role, or role and name?** Role alone survives staff turnover and avoids a
   named individual on every page. Name is more accountable. The S117 guide already has a
   version of this question open.
2. **Who bumps `content_version`?** Honest answer is it will get forgotten if it is manual.
   Worth considering whether the export tooling does it.
3. **Is `review_due` per guide, or inherited from the source policy's own review date?**
   Inheriting is less work and probably more correct.
4. **Do we backfill 68 guides, or apply this to new and edited ones only?** Backfilling
   sources for guides written months ago is a large job and may not be worth it before the
   pilot.
