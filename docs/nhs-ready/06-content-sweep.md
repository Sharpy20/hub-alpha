# Content quality sweep

> Date: 5 July 2026
> Scope: link inventory, blocked-in-demo consistency, copy pass, guide consistency audit
> Build: clean. Tests: 32/32 pass. Badge changes verified in the browser (links page + home wheel).

## 1. Link inventory

All URLs extracted from `src/lib/data/` (bookmarks, guides, quiz JSONs, service-map, tasks).

| Class | Count | Notes |
|---|---|---|
| Unique URLs total | 289 | |
| FOCUS / intranet | 51 | 50 direct `focus.derbyshirehealthcareft.nhs.uk` + 1 officeapps viewer wrapping a FOCUS docx. Not checkable from outside the trust network. |
| External public | 238 | Includes a handful of login-gated-but-public hosts (portal.nhs.net, my.esr.nhs.uk, Teams, Allocate, ICE Chesterfield, Halo ITSM, e-LfH). |
| "#" placeholders | 131 | 80 in `guides/referral-workflows.ts` (form/wagoll/other-guide tiles - badge treatment in the viewer), 51 in `bookmarks/index.ts` (44 flagged `requiresFocus`, 7 plain phone-contact cards). |

### Spot checks (37 of the most important external URLs, via WebFetch)

| Result | Count | URLs |
|---|---|---|
| Live and correct | 27 | Samaritans (116 123 shown), CALM, NHS 111 online, Rethink, Trent PTS, Derbyshire SAB (home + professionals referrals), Starting Point (contact page + support form), DDSCP worried-about-child, Safer Derbyshire (DA + MARAC), Disability Direct advocacy page + IMHA referral docx (downloads fine), Cloverleaf referrals, stayingsafe.net, gov.uk MHA Code of Practice, gov.uk tribunal forms, myaccount.derby report-a-child, MCA Code PDF, legislation.gov.uk SI 2008/1184, NICE guidance, Karma Nirvana, Derbyshire SCP procedures, Derbyshire IASS, Derbyshire SEND contacts, e-LfH (normal 302 to portal) |
| Bot-blocked (403) - check manually in a browser | 6 | mind.org.uk, changegrowlive.org, mentalhealthlaw.co.uk statutory forms, bnf.nice.org.uk, nspcc.org.uk, derbys-fire.gov.uk hoarding framework PDF |
| Dead | 1 | `stayingsafe.net/stayalive` returns 404 (bookmark "StayAlive app" in `bookmarks/index.ts`). The site itself is fine, just this path. |
| Stale but reachable | 3 | Oxford cuckooing page 301-redirects to `/community-safety/cuckooing` (target loads fine); `secure.derby.gov.uk/forms/?formid=345` now shows "the safeguarding referral form has moved to myAccount"; `choiceandmedication.org/derbyshirehealthcare/` lands on the generic Choice and Medication site, not a trust-branded portal. |

Content note from the spot checks: Trent PTS's homepage now says it **no longer provides NHS Talking Therapies** and points to other providers - lines up with the backlog note that Talking Therapies references need moving to derby-talk.co.uk.

Per the brief, no link URLs were changed (report only). FOCUS placeholder wiring stays with its own backlog job (BACKLOG.md section A).

## 2. Blocked-in-demo consistency - fixed

Render paths for `"#"` links: guide viewer forms step (already badged), links page cards, home bookmark wheel, personal bookmarks (user-entered, guarded), admin links list (shows "FOCUS link" text - fine).

Gaps found and fixed:

| Fix | File | What changed |
|---|---|---|
| Silent dead cards on /links | `src/app/links/page.tsx` (badge block after the FOCUS badge, ~line 352) | The 7 non-FOCUS "#" bookmarks (Guardianship County/City, Health Assured EAP, Resolve Counselling, MoneyHelper, Patient Transport EMAS, GovWifi) rendered as clickable cards that did nothing on click. They now carry the same amber "Blocked in demo" pill used in the guide viewer, with a tooltip pointing at the phone number/details on the card. |
| FOCUS modal dead end | `src/app/links/page.tsx` (FOCUS modal, ~line 440) | For a FOCUS bookmark with url "#", "Open Anyway" silently did nothing. The modal now says the link itself is blocked in the demo and hides the Open Anyway button for "#" URLs. |
| Silent dead wheel spokes | `src/components/bookmarks/bookmark-carousel.tsx` (`WheelItem`) | Non-FOCUS "#" bookmarks on the home wheel now show a small "Blocked in demo" badge (same spot as the FOCUS badge). |

Verified in the browser: 3 badges show on the Wellbeing category on /links and on the home wheel; console clean.

## 3. Copy pass - fixed

- **Em dashes: zero found.** Swept `src/` and `public/` for the literal U+2014 character and the entities `&mdash;`, `&#8212;`, `&#x2014;`. Clean.
- **Double spaces in strings: zero found.**

Banned-word fixes (user-facing copy only):

| File:line | Before | After |
|---|---|---|
| `src/lib/data/guides/referral-workflows.ts:560` | discharge plan remains robust | discharge plan is solid |
| `src/lib/data/guides/referral-workflows.ts:630` | a robust discharge meeting | a thorough discharge meeting |
| `src/lib/data/guides/referral-workflows.ts:636` | discharge plan remains robust | discharge plan is solid |
| `src/lib/data/guides/risk.ts:204` | how robust is it... | how steady is it... |
| `src/app/guides/risk-assessment/page.tsx:92` | how robust is it? | how steady is it? (kept matched to risk.ts) |
| `src/lib/data/guides/howto-guides.ts:923` | starts a comprehensive search | starts a thorough search |
| `src/app/dev-panel/page.tsx:2432` | comprehensive handover documentation | full handover documentation |
| `src/app/dev-panel/page.tsx:2729` | Comprehensive guide to all MHA... | Full guide to all MHA... |
| `src/app/reports/page.tsx:449` | Generate comprehensive patient status audits | Generate full patient status audits |
| `src/lib/data/quiz/research-suicide.json:25` | robust follow-up | assertive follow-up |

American spelling fixes (user-facing only):

| File | What changed |
|---|---|
| `src/app/links/page.tsx` (2 tooltips, lines ~260 and ~375) | "Add to favorites" / "Remove from favorites" -> "favourites" |

Left alone deliberately (not user-facing copy, or correct as-is): code identifiers (`userFavoriteBookmarks`, `sanitizeExternalUrl`, `capitalize`, `scrollIntoView behavior`), CSS class names, code comments ("bespoke builder", "Specialized toast"), "World Health Organization" (proper noun in a quiz question), clinical uses of "elevated" (elevated mood/risk, elevate legs in first aid), and the NHS `unlock-authenticator` URL.

## 4. Guide consistency audit

### (a) Step order - all 17 referral workflows conform

Standard order: criteria -> (consent / section / area where used) -> forms -> submission -> casenote -> reminder -> gdpr.

| Workflow | Steps | Conforms |
|---|---|---|
| imha-advocacy | criteria, consent, section, area, forms, submission, casenote, reminder, gdpr | Yes |
| picu | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| safeguarding | criteria, consent, area, forms, submission, casenote, reminder, gdpr | Yes |
| dietitian | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| safeguarding-children | criteria, consent, area, forms, submission, casenote, reminder, gdpr | Yes |
| homeless-discharge | criteria, area, forms, submission, casenote, reminder, gdpr | Yes |
| social-care | criteria, section, forms, submission, casenote, reminder, gdpr | Yes |
| s117-meeting | **info**, criteria, forms, submission, casenote, reminder, gdpr | Yes (leading info step is the signed-off S117 aftercare explainer) |
| tissue-viability | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| dental | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| physio | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| ot | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| speech-therapy | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| edt | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| erp | criteria, forms, submission, casenote, reminder, gdpr | Yes |
| ctr-dsp | criteria, consent, forms, submission, casenote, reminder, gdpr | Yes |
| benefits-review | criteria, forms, submission, casenote, reminder, gdpr | Yes |

No step-order fixes needed.

### (b) Step labels

Consistent everywhere: "Case Note Entry", "Follow-up Task", "GDPR Reminder". Variants that look intentional (content-specific), left unchanged:

- Criteria: "Confirm Criteria" (15) vs "Check the Criteria (S.42)" (safeguarding) vs "When to Refer" (safeguarding-children)
- Forms: "Download Forms & Guides" (15) vs "Referral Forms & Advice" (safeguarding-children) vs "Meeting Request Form" (s117-meeting)
- Submission: "Submit Referral" (16) vs "Submit Meeting Request" (s117-meeting)
- Consent: "Patient Consent" / "Consent" / "Discuss with Family" / "Patient/Carer Consent"

### (c) Case-note templates

All 16 static templates follow the same shape: "[Service] referral submitted on [DATE]... via [METHOD]." with UPPERCASE square-bracket placeholders (auto-filled by the smart clipboard). imha-advocacy is dynamic (isDynamic). Consistent - no changes.

### (d) Phone formatting - fixed

- Mixed "01332 640 777" (3x) vs "01332 640777" (3x) for the same Derby City MH Social Care number in `referral-workflows.ts` - normalised all to **01332 640777** (matches the dominant "01332 623700" style). Fixed at the s117-meeting criteria content, submission method and case-note template.
- Freephone/non-geographic numbers (0800 / 0808 / 0300 / 0330) keep each organisation's published grouping (e.g. CALM "0800 58 58 58", Refuge "0808 2000 247", NHSCFA "0800 028 40 60") - deliberately not normalised.

### (e) Approval-status coverage

23 of 64 catalog guide ids have an explicit entry in `src/lib/data/approval-status.ts`; no orphan entries. **41 ids have no entry and are silently amber** (which the file says is the intended default, but listing them so nothing hides):

mha-statuses, mha-checker, imha-advocacy, capacity-assessment, section-17, mh-talking-points, abc-chart, care-plan, named-nurse, admission-checklist, fridge-temps, mental-state-exam, mohost, safeguarding, safeguarding-children, domestic-abuse-guide, peer-conflict-guide, non-recent-abuse, escalation-pathway, online-safety-children, honour-based-abuse, modern-slavery-radicalisation, faith-belief-abuse, send-safeguarding, special-guardianship, child-in-need, information-sharing, picu, homeless-discharge, social-care, benefits-review, dietitian, physio, ot, speech-therapy, news2, tissue-viability, dental, edt, erp, ctr-dsp

No statuses guessed or added.

### (f) Category names - fixed the mechanical drift

The guides index (ALL_GUIDES in `src/lib/data/guides/catalog.ts`) now carries **12** categories, not 8 (Medics Tools, OT Tools and Learning & Development have been added since the "8 categories" note): Legal & Advocacy, Nurse Tools, Medics Tools, OT Tools, Restrictive Practice, Safeguarding, Urgent Care, Social & Housing, Allied Health, Physical Health, Specialist Pathways, Learning & Development.

Fixed:

- `src/lib/data/guides/howto-guides.ts` GUIDE_CONFIG carried **stale category names that render in the guide viewer header** (and drive the "related guides" grouping). Aligned 12 entries to the index: mha-statuses, section-17, arrange-mha-assessment, section-132, section-136, tribunal-report, capacity-assessment ("MHA & Legal" -> "Legal & Advocacy"); awol ("MHA & Legal" -> "Urgent Care"); dama, admission-checklist ("Admin" -> "Nurse Tools"); fridge-temps ("Ward Procedures" -> "Nurse Tools"); abc-chart ("Clinical Assessment" -> "Nurse Tools").
- `src/app/admin/workflows/page.tsx:539` GUIDE_CATEGORIES editor dropdown was missing "Learning & Development" - added.

Not fixed (orphans, see For Mike): 7 how-to guides exist in howto-guides.ts but not in the index, still carrying old category names (Observations, Emergency Response, MHA & Legal).

## For Mike - judgement calls

1. **Dead link:** `stayingsafe.net/stayalive` is a 404. Either drop the StayAlive bookmark or point it at the StayAlive app's own site (prevent-suicide.org.uk territory - needs your pick of canonical URL).
2. **Moved form:** the Derby safeguarding referral bookmark `secure.derby.gov.uk/forms/?formid=345` now shows a "moved to myAccount" holding page. Worth swapping to the myAccount URL when you next confirm the destination.
3. **Stale redirect:** Oxford cuckooing bookmark 301s to `oxford.gov.uk/community-safety/cuckooing` (works, but the URL could be updated). Also worth asking whether an Oxford City page is the best source for a Derbyshire tool at all.
4. **Choice and Medication:** `/derbyshirehealthcare/` lands on the generic vendor site, not a trust-branded portal. Check whether the trust subscription URL changed (or needs login).
5. **Trent PTS:** their site now says they no longer provide NHS Talking Therapies - ties into the existing backlog job to re-point Talking Therapies references at derby-talk.co.uk and confirm Vita/Everyturn wording.
6. **Check-manually list (bot-blocked, probably fine):** mind.org.uk, changegrowlive.org, mentalhealthlaw.co.uk statutory forms index, bnf.nice.org.uk, nspcc.org.uk, derbys-fire.gov.uk hoarding PDF.
7. **The 7 phone-contact bookmarks now badged "Blocked in demo":** a few have real public websites that could simply be wired instead (MoneyHelper, Health Assured, EMAS patient transport, GovWifi signup page) - one small linking job would clear most of the non-FOCUS placeholders on /links.
8. **Orphan how-to guides** (in howto-guides.ts, reachable at /guides/<id>, but not listed in the index and not linked from anywhere): ecg, neuro-obs, fluid-balance, pain-assessment, choking, cardiac-arrest, restraint. Decide: re-list, or delete (choking/cardiac-arrest look like survivors of the Session 21 Emergency-category removal).
9. **Near-duplicate safeguarding content:** the referral workflows `safeguarding` / `safeguarding-children` are the listed guides, but the older how-to versions `safeguarding-adults-referral` / `safeguarding-children-referral` still exist and are linked from the parked /welcome page. Decide which is canonical before launch so they cannot drift apart.
10. **Carousel FOCUS behaviour:** on the home wheel, FOCUS bookmarks with a real URL open directly in a new tab without the FOCUS warning modal that /links shows. Behaviour difference, not fixed here.
11. **Criteria/forms label variants** (section b above) look intentional - flag only if you want strict uniformity.
12. **41 guides silently amber** (section e) - expected by design, but that's two-thirds of the catalogue with no explicit editorial decision recorded.
