# Homework - review on site (1 July 2026)

Things for Mike to check on the live site. Mostly the guides worked on today.
None of this is signed off - every guide is still amber ("awaiting approval") or
red ("in development"). Flip a guide to green by telling Claude "set <id> to green".

---

## 1. Named Nurse guide  ← PRIORITY (rebuilt today from your crib sheet)
`/guides/named-nurse`

Built from your **Named nurse crib sheet - S1** + **Care Planning Guidance** (scraped
from your OneDrive today). Please read all 7 steps for clinical accuracy. **Three cadence
conflicts between your audit email and the crib sheet need your decision** - I followed the
crib sheet where they differ:

- **Safety plan** - your audit email said *monthly*; the crib sheet says *on admission, on any
  change, and on discharge*. I moved it to the "triggered by an event" step (crib sheet). **Which is right?**
- **Physical health assessment** - audit email said *on admission + significant change*; the crib
  sheet lists it under *monthly*. I currently show it in BOTH (monthly + on-change). **Keep both, or pick one?**
- **HONOS** - audit email said *monthly*; not in the crib sheet's monthly list. I kept it monthly. **Confirm.**
- Newly added from the crib sheet (confirm these are right): **MUST weekly** (unless dietitian involved),
  **Waterlow / falls monthly**, **named nurse 1:1** (recorded as "named nurse 1:1"), **carer's contact**
  (recorded as "carer's contact"), **Red Folder / ward round sheet**, escalate concerns to **B6/B7**,
  annual-leave handover to the other named nurse.
- New step "How the My Care Plan works" (AIMS standards, OT/psychology input, weekly MDT prompt,
  patient prompt sheet, office white-board red/green traffic light). Check it matches practice.

## 2. Admission Note Template  ← NEW today
`/guides/admission-note`

New guide from your **Admission note template** doc (the 9-point admission note). The "Copy" button
drops a numbered skeleton into SystmOne. Check the 9 points + wording. **Decide: keep it as its own
guide, or fold it into the Admission Checklist?** (It is the note you type; the checklist is the tasks.)

## 3. Case notes on the how-to guides  ← added today
Every how-to guide now has a filled-in "Copy to the patient's notes" box (was generic before).
Spot-check the wording on the ones you use most: Section 132, NEWS2, Capacity, Section 17, Fridge
Temps, AWOL, DAMA, Transfer-in, Tribunal report, Arrange MHA assessment, Section 136, ABC chart,
and the safeguarding referral guides. Tell me any that read wrong.

## 4. Prenoxad guide  (built earlier today, still red)
`/guides/prenoxad` - PGD-derived take-home naloxone guide. Needs your clinical sign-off before green.

## 5. Quiz  (now fully live - 364 questions)
`/quiz` (in the More menu). All 10 research batches are wired in. It is DRAFT / just-for-fun / nothing
tracked. You are already proofreading `docs/quiz-question-bank.md` - flag any wrong answers there
(edit the JSON, not the .md, then it regenerates).

## 6. Care Review + Admission cross-reference  (patient tiles)
`/v2/patients` - each tile shows an Admission badge (green only when the WHOLE admission checklist is
done) + review countdowns. Opening the Admission Checklist for a linked patient now saves ticks to
their record. **One gap to decide:** "Consent to share" is a care-review admission item but there is
no matching item on the Admission Checklist, so it will not sync. Add a consent item to the checklist?

## 7. HONOS guide  (still to build - on the list)
Physical-health and HONOS care-review items have no guide to link to yet. HONOS guide (what it is +
how clustering works, written guidance only) is queued - I may scan FOCUS for the S1 HoNOS how-to.

---

### Not done here (need you)
- **Proofread pass to green** - 0 guides are green right now; the whole site reads "awaiting approval".
- DoLS Ward Guidance is still the generic placeholder.
- Merge v1/v2 for the demo (architectural - scope with me first).
- Risk picker regroup under the 7 SystmOne domains (open design question).
