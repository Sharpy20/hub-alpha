# wardHub Homework - 4 July 2026 (evening / overnight autonomous session)

Mike went to sleep and asked Claude to work through the backlog autonomously.
This is the handover: what got done, what needs your eye, and what's left.

---

## 1. What shipped this session (all live on wardhub.live, pushed as Sharpy20)

**New guides (all RED, pending your sign-off):**
- **Section 132** - enriched: "Record it on SystmOne" step, S133 discharge duty, S132A/CTO recall.
- **Blanket Restrictions** - enriched: FOCUS brief-guide link, 3-tier contraband list, ward-level authorisation.
- **Student Nurse Placement Guide** (NEW, `/guides/student-placement`) - new "Learning & Development" category, built demo-safe from your Student Information Pack (ward/staff names + internal numbers stripped).
- **Smoke-Free Ward - Your Legal Duty** (NEW, `/guides/no-smoking`) - from the staff legal-warning doc.
- **Informal Admission - Gatekeeping & the Patient Agreement** (NEW, `/guides/informal-patient-contract`) - the two Dec-2025 SystmOne forms.
- **Capacity Assessment** - enriched: SystmOne Combined Capacity form (functional + diagnostic) + police Capacity Request form.
- **Arranging an MHA Assessment** - rebuilt to the trust's 8-step flowchart (still RED - social-care secure-email name TBC).

**Features:**
- **Print on guides** - every how-to guide, referral workflow and thinking-guide now has a **Print** button that prints all steps/sections from the SAME data, so future edits flow through automatically (no second copy to maintain). The interactive builders/checklists (admission, leave-discharge, MHA checker, MSE) already had print.
- **Printable blank forms** (new reusable `downloads` field):
  - Capacity Assessment -> **blank Police Capacity Request form** (`/police-capacity-form.html`).
  - ABC Charts -> **blank ABC chart** (`/abc-chart-blank.html`), alongside the existing completed example.
- **FOCUS links wired** into the 3 existing referral guides that matched: **dietitian, physio, ERP**. Viewer now shows the "on FOCUS" note and a "Blocked in demo" badge on dead links.
- **admission-checklist** - your 3 personal `michael.sharpe4` OneDrive links swapped for the in-app builders + the MHLO statutory-forms index.

---

## 2. Needs YOUR sign-off (read + flip the traffic light)
Everything I built is **RED** ("in development") on purpose - I don't self-promote guides. Read each and tell me "set X to amber/green":
- section-132, blanket-restrictions, capacity-assessment, arrange-mha-assessment, no-smoking, informal-patient-contract, student-placement.
- Also waiting on your word to flip to amber (you said they were complete drafts): **prenoxad, transfer-in, awol**.
- Check the two new **printable forms** read correctly (police + ABC) - they use the exact field wording from your docs, with a "reference copy" disclaimer.
- Glance at the **Print** output on a couple of guides (header -> Print) to confirm the layout suits you.

---

## 3. BLOCKED on you (I genuinely can't proceed without these)
- **MHA office email address** - to finish section-132 + arrange-mha submission steps.
- **Social-care secure-email system name** - the "not nhs.net" secure email for arrange-mha step 4.
- **Restraint hold photos** - core-skills hold images for restraint-monitoring.
- **HoNOS** - the New Cluster box image + the two `waa honos` videos need your eye; I left honos as-is.

---

## 4. YOUR decisions (I stopped rather than guess)
- **section-136** - expand with an FAQ (force treatment / seclude / out-of-area / child in 136) or leave it? Your call.
- **mh-talking-points** - how you want the grounding/distraction techniques grouped.
- **safeguarding-children consent step** - your note said "the two consent options are about patient not family". They currently read as *family* consent, which looks correct to me - can you confirm what you meant? I left it untouched rather than break it.
- **domestic-abuse-guide** - URLs are already clickable (the viewer auto-links them). Still open: sourcing/linking the CADDA-DASH, and reducing text density (your editorial call).
- **OT Tools** - confirm the local OT form (MOHOST vs a local form) and improve the MOHOST examples.
- **IMHA Derby City source of truth** - app uses Disability Direct; the live S132 policy names One Advocacy Derby (stale). Confirm.

---

## 5. NOT built - each needs a dedicated session (mostly needs your steer first)
**New referral guides for the remaining FOCUS links** (Section A). These don't exist yet - each needs the full referral template + criteria verified against FOCUS, so I didn't want to guess clinical pathways unsupervised:
- Autism assessment, CAMHS, ECT, Perinatal, Specialist Day Services, Discharge Liaison Team (DLT).
- The FOCUS URLs are all captured in `docs/BACKLOG.md` Section A, ready to wire once each guide exists.

**Bigger builds (parked, need scoping with you):**
- **Contacts directory** - single source of truth; edit once, updates everywhere (BACKLOG D). Seed inventory ready.
- **Postcode / GP-surgery lookup** - City vs County, AMHP, CMHT, S117 authority (BACKLOG B). Data in hand.
- **fridge-temps "mark done" button** (ticks the linked diary task) and **admission-note interactive** (click a line for prompts) - both small-ish code features, left as they're interactive not content.
- Named Nurse checklist -> schedulable tasks; Tribunal/DST/OT-report combined builder; risk/formulation rethink; DoLS more visual - all still PARKED in BACKLOG D/I.

---

## 6. Notes / housekeeping
- The BACKLOG's **Section G was mostly already done** in a prior session (it was stale) - I've corrected it. Section F is now mostly ticked.
- The two builder guides (risk-assessment, care-plan) don't have a Print button - they already produce copy-out text, so print felt redundant. Say the word if you want it added.
- One thing I couldn't eyeball on live: the referral **forms-step** FOCUS tiles (the demo's step-gate wouldn't advance under automation). The code is typecheck-clean and copies an already-working render block - low risk, but give a referral guide's "Download Forms & Guides" step a glance.

*Written by Claude, overnight 4 Jul 2026. All work committed + pushed to Sharpy20/hub-alpha; Vercel auto-deployed.*
