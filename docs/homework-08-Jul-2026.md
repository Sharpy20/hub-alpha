# Homework - 8 July 2026

## What shipped this session (pushed, live)

**Risk tool reworked: one RMP per domain, not one per sub-domain.**

You flagged that the tool was over-complicated - it built a whole formulation +
RMP question set (and a separate plan) for **every ticked sub-domain**. It now
works the way you described:

- The formulation + RMP questions attach at **domain level** - **one RMP per
  domain** (up to 7), one formulation block per domain.
- Sub-domains and clinical indicators are tick-and-move-on flags. Each **selected**
  one gets a **"Requires own RMP"** toggle (in the amber "Separate plans (optional)"
  box). Off = folds into the domain plan. On = spins off its **own** separate RMP.
  The formulation always stays one block per domain (a spin-off splits the RMP only).
- When a domain has several ticked sub-domains, their suggestion chips are **merged
  into the one domain question set, kept as separate labelled groups**.
- **Nothing is lost:** every ticked clinical indicator now flows into the
  deliverables. Previously they only landed in the risk-screen text block (which you
  said is dead - you tick S1 live as you go). Now:
  - **presentation-type** indicators -> the RMP "how does this present / early
    warning signs"
  - **background-type** indicators -> the formulation "history"
- **RMP formatting untouched** - still the risk name in UPPER CASE sandwiched between
  two `====` rows, no "RISK MANAGEMENT PLAN" label (that was already the house style;
  the earlier chat mock-up drifted, the code did not).

## ★ Your spot-check (5 mins)

I had to decide **which clinical indicators are "background" (-> formulation) vs
"presentation" (-> RMP early-warning-signs)**, because the S1 indicator lists are a
mixed bag (e.g. "Considered / planned intent" is a warning sign; "Trauma" is
background history).

**The list to eyeball is `INDICATOR_BACKGROUND` in
`src/lib/data/welcome/risk-screen.ts`.** Anything listed there routes to the
**formulation**; anything **not** listed routes to the **RMP**. To move one, just
add/remove it from its domain's array. My tagging in brief:

- **self-harm:** background = criminal-justice involvement, major psych diagnosis,
  no-control/helplessness, bereaved-by-suicide, marital/employment status, life
  events, trauma, physical illness, chronic pain, financial worries. Everything else
  (suicidal ideas, planned intent, overdose, violent methods, voices, substance use)
  -> RMP.
- **self-neglect:** background = accommodation/amenities/eviction/finances/social
  contacts. Rest (not eating, hygiene, absconding, etc.) -> RMP.
- **harm-to-others:** background = demographic/historical/insight items (male <35,
  known triggers, previous impulsive acts, criminal-justice, secure settings,
  denial/minimising, contact with children, is-a-carer). Rest -> RMP.
- **harm-by-others:** background = carer stress, is-a-carer. Rest -> RMP.
- **children:** background = admission/looked-after/family-psych-illness/history.
  Rest -> RMP.
- **environmental:** most are environmental circumstances -> background/formulation;
  only "Hoarding" and "Behaviour that prevents access to service" -> RMP.
- **physical-health:** no S1 indicator list, so nothing to tag.

If any read wrong to you, tell me "move X to RMP/formulation" and it's a one-line change.

## Open / decisions for you

1. **Indicator routing UX.** Right now folded indicators are added **at generate
   time** and shown in a blue transparency note ("Flagged indicators are folded in
   automatically... into the plan / into the formulation"). They are **not** yet
   shown as pre-ticked, removable chips inside the questions. That was the safe build
   (guarantees nothing lost, no state-sync bugs). If you'd rather they appear as
   editable chips in the question itself, say so and I'll wire that as a follow-up.
2. **Still RED** in the approval status - it stays a draft until you sign it off.
   Say "set risk-assessment to green" when you're happy.
3. **Browser click-through not done this session** - another chat's dev server was
   holding the local port, so I verified via a clean production build (the page
   prerenders without error) + type-check + lint. Worth a quick play on live
   (https://www.wardhub.live/guides/risk-assessment) to confirm the flow feels right.

## Example (what "one per domain + a spin-off" produces)

Patient with self-harm/suicide + harm-to-others + physical-health engaged, and
"Considered / planned intent" toggled to its own plan:
- **Formulation:** 3 blocks (one per domain), background indicators woven into each.
- **RMPs:** 4 plans - the 3 domain plans + the standalone "Considered / planned
  intent" plan following its domain.
