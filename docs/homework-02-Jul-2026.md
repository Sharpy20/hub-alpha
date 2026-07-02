# wardHub - homework list (2 July 2026)

> Everything below is live on the site. This session was a big one: the risk tool
> was rebuilt, four guides were added/finished, and the v1/v2 split was collapsed
> into one full demo build. Nothing here is blocking - it's your review + a few
> decisions.

---

## 1. Decisions I need from you

- **v1/v2 collapse - happy with it?** The whole product now shows at the root for the demo (Diary, Patients, Reports, My Jobs, Staff, Link-to-Patient, all guides). Old links containing `/v2/` now redirect to the same page at the root, so anything you shared still works. It's one switch to undo (`COLLAPSED_FOR_DEMO` in `src/lib/config/build.ts` -> `false`).
- **IMHA Derby City - which is the source of truth?** The app uses **Disability Direct** (we switched deliberately in June). The current **S132 policy names One Advocacy Derby**. These disagree - tell me which is right and I'll align. (County = Cloverleaf matches on both.) This is the one genuine app-vs-policy clash from the audit.
- **Risk tool - do the 13 questions per risk read right?** Order and wording are the bit most likely to need your clinical eye.
- **Formulation output** - it now flows in short paragraphs (~3 sentences each). Confirm that reads well, or I can regroup.

---

## 2. Guides to review and sign off (flip red -> green)

Tell me "set <id> to green" (or amber) once you're happy. Built or reworked today:

| Guide | Status | Note |
|---|---|---|
| Risk Screen, Formulation & RMP (`risk-assessment`) | red | Rebuilt as the SystmOne risk-screen wizard. Biggest review. |
| HoNOS & Clustering (`honos`) | red | New written guide. |
| DoLS Ward Guidance (`dols`) | red | Now real content (was an empty placeholder) - built from the Trust DoLS policy + made practical (quick-decision, pitfalls, examples, FAQ). |
| Blanket Restrictions & Restrictive Practice (`blanket-restrictions`) | red | New, from the Blanket Restrictions policy. |
| Prenoxad (`prenoxad`) | red | Built + verified earlier; just needs your sign-off. |

Still awaiting your sign-off from earlier sessions (all red): seclusion-support-plan, debrief, safety-plan, restraint-monitoring, observation-engagement, leave-discharge-transfer, section-132, section-136, tribunal-report, dama, transfer-in, awol, arrange-mha-assessment, admission-note. (The master list is `src/lib/data/approval-status.ts`.)

There are **no empty placeholder guides left** - DoLS was the last one.

---

## 3. Policy defects to raise with the Trust (from the audit)

The full audit is `docs/policy-conflict-audit-02-Jul-2026.md` (also summarised in Dev Panel -> Data Sources -> "Conflicts in source material"). Headlines to raise:

- **S62 Urgent Treatment** - expired (~Dec 2025). Safety-critical.
- **Missing & Absent (AWOL)** - review date Jun 2026, overdue.
- **Observations - Level 3 review interval** - the policy says both 24h and 72h. The app uses 72h; the policy needs fixing.
- **S135/136** - the escape-retake window is written as "36 hours" in one place vs the correct 24h (+12h) rule; and the form still says "Hartington Unit" (renamed Derwent).
- Several "recommended vs must" and deadline mismatches across CTO / S132 / tribunal, and the safeguarding SOPs only give City/County routing in one of four docs.

---

## 4. What I did today (for your reference)

- **Risk tool** - rebuilt around the SystmOne risk screen: step-by-step domain wizard with green ticks; one merged question set per risk (no more WHY/WHAT split); add-your-own sub-domains and clinical indicators; dated examples (dropdown year, newest first); per-domain "Copy into S1" boxes; combined RMP + prose formulation; "no evidence" signs a domain off; links the patient's Care Review "done" (full build); intro/explainer with a flow visual and a Tips star.
- **New/finished guides** - HoNOS, DoLS (built out), Blanket Restrictions; Prenoxad + Quiz verified working (Quiz = 364 questions, still draft pending your proofread of `docs/quiz-question-bank.md`).
- **v1/v2 collapsed** into one full demo build (reversible), with `/v2` links redirecting.
- **Data Sources** - added the "Conflicts in source material" section + refreshed the source list.
- **Bookmarks** - you can now add your own links straight from the home wheel ("Add your own"), with a prompt to recommend useful ones for everyone (a creator/admin reviews them).

---

## 5. Deferred / future (not done, on purpose)

- **"Build your own landing page" in settings** - a bigger feature; parked for now (the personal bookmark wheel covers part of the need).
- **Lint backlog** - ~130 pre-existing lint issues in older files (task modals, tour, tasks data). Not touched today; a separate tidy-up job. Today's new/changed files are clean.
- **Home bookmark wheel** - still shows max 8 spokes with no "More" affordance when a category has more; minor.
