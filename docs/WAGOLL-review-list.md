# WAGOLL folder - review list

**Date:** 6 August 2026
**Source files:** `E:\Hub\WAGOLL` (12 files, moved out of `docs/` so they cannot reach a commit)
**Status:** all 12 placed. Nine built as printable HTML pages under `/forms/` and linked
from their guides. Tribunal report held back at Mike's request. Authoring metadata cleared
from all 12 source files. Three gates green, pushed.

## Update - HTML pages built

| Page | Linked from |
|------|-------------|
| `/forms/kingfisher-picu-blank.html` | PICU - blank form |
| `/forms/kingfisher-picu-wagoll.html` | PICU - worked example |
| `/forms/derby-social-care-blank.html` | Social Care - blank form |
| `/forms/derby-social-care-wagoll.html` | Social Care - worked example |
| `/forms/ei-psychosis-template.html` | CMHT / EI - blank template |
| `/forms/stepdown-referral-wagoll.html` | Step Down - worked example |
| `/forms/homelessness-referral-s1.html` | Housing / Duty to Refer - prep sheet |
| `/forms/peep-wagoll.html` | Seclusion Support Plan - worked example |
| `/forms/safeguarding-good-referral.html` | Safeguarding Adults - guidance |

All share `/forms/wagoll.css` (NHS colours, print stylesheet, banner and back link hidden
on print). Completed examples carry an amber "EXAMPLE ONLY - do not submit" banner.

**Metadata cleared.** The six `.docx` files had `docProps/core.xml` and `app.xml` replaced;
the four `.pdf` files only carried Canon scanner strings; `PEEP.rtf` had its `\author` and
`\operator` values emptied; the `.doc` carried **two** author strings in its legacy OLE
summary stream (a second name I had not spotted) - both blanked in place, and the file was
re-opened in Word afterwards to confirm it still parses.

**Not built:** the Nursing Tribunal Report, blank and completed, held pending your check.
The `tribunal-report` guide keeps the T134 question list, which came from the blank form -
that is the public HMCTS template, not the completed one.

**Still a gap:** there is no blank Step Down form in the folder, only the completed one, so
that entry still reads "Blank form to confirm".

Work through the numbered items when you have time. Each one says what I did, and the
last column is what I need from you. Nothing here is signed off - every guide touched is
amber or red.

---

## READ THIS FIRST

**File 10 (Nursing Tribunal Report - Completed) does not read as fictional to me.**

The patient is pseudonymised to "John Doe" / "JD", but question 12 says the incidents are
"taken directly from notes" and then carries: dated entries across 15/8/25 to 21/8/25,
verbatim quoted note text, staff referred to by initials (LN, RN, Cons SA), and what looks
like a Datix reference (W111022).

Inside the Trust, a ward + those dates + those initials + that Datix number identifies a
real person and real staff regardless of the name on the front. Same pattern, weaker, in
file 8 (Kingfisher completed - dated incidents 23/12/25 to 27/12/25) and file 5 (Generic
Stepdown - a 1996 conviction date).

I have **not** copied any of that narrative into the repo. What I took from those three
files is the *form structure* and the *authored guidance*, never the case content.

I am not overruling you - you said the data is fictional and you know these documents. But
I would not put file 10 in front of anyone outside the ward until someone has confirmed the
notes were rewritten rather than lifted. If you tell me they were rewritten, say so and
I will wire them in as-is.

Separately: **PEEP.rtf carries a real staff name in its document metadata** (author field).
It never entered the repo. Worth stripping before that file goes anywhere.

---

## What went where

| # | File | Guide | What I did |
|---|------|-------|-----------|
| 1 | CMHT Referral.docx | **NEW** `/guides/cmht-referral` (Specialist Pathways) | New guide. Your six headings expanded, "John" printed in full as the worked example, EI section with the eligibility rule |
| 2 | Derby City Social Care Referral - Blank.docx | `/guides/social-care` | Structure feeds the new "What the form asks for" step |
| 3 | Derby City Social Care Referral - Completed.docx | `/guides/social-care` | New progressive step covering all eight outcome areas, the routing questions and the risk grid. WAGOLL entry relabelled |
| 4 | Early Interventions for Psychosis Template.pdf | `/guides/cmht-referral` | Real EI criteria added (age 14-64, the first-episode window, the non-exclusions) plus a new step listing all 10 template questions |
| 5 | Generic Stepdown Referral - Completed.doc | **NEW** `/guides/stepdown-referral` (Social & Housing) | New guide built from the form (V2 May 2023) - presentation grid, programme of care, goal based outcomes, exit plan |
| 6 | Homelessness Referral S1 - Completed.pdf | `/guides/homeless-discharge` | New step listing the SystmOne questionnaire, both sections, plus why each answer matters to the council |
| 7 | Kingfisher House Referral - Blank.docx | `/guides/picu` | New "Inclusion and exclusion criteria" step from the NAPICU criteria on the form. Blank-form entry relabelled to the real form name |
| 8 | Kingfisher House Referral - Completed.docx | `/guides/picu` | WAGOLL entry relabelled. Case narrative NOT copied in - see above |
| 9 | Nursing Tribunal Report - Blank.docx | `/guides/tribunal-report` | Identified as **form T134, HMCTS, Crown copyright 2018**. New step listing all 16 questions, plus the form's own note about sources and not reciting records |
| 10 | Nursing Tribunal Report - Completed.pdf | `/guides/tribunal-report` | Held back - see above |
| 11 | PEEP.rtf | `/guides/seclusion-support-plan` (PEEP section) | Added the three-part structure (alerting / clear instructions / safe transfer) as examples, plus a tip for the mobility case |
| 12 | What a 'Good' Safeguarding Referral Looks Like.pdf | `/guides/safeguarding` | New "Writing a good referral" step - the full pointers, the fact-vs-opinion rule, all five pitfalls and the top tip |

---

## Things I need from you

1. **Submission routes.** Two new guides say "Submission route to confirm" because I do not
   know them and will not invent one: `cmht-referral` and `stepdown-referral`.

2. **File 10 - see the box above.** Fictional or rewritten? If rewritten, I will wire it in.

3. **Do you want the documents themselves served as downloads?** Right now every blank and
   WAGOLL entry reads "Held locally - to be wired in", because you said keep them local and
   they are binaries. Two options:
   - Convert each to an HTML page in `public/` (the pattern the ABC chart and the police
     capacity form already use). Printable, versioned as text, no binaries in git.
   - Leave them local and keep the placeholders.
   The HTML route is more work but it is the only one where a nurse can actually open the
   WAGOLL from the guide.

4. **Kingfisher contacts.** The referral form carries a direct email and phone for the ward.
   The guide still shows "Hidden in demo mode" under Rule 4. If those are publicly listed
   they can go in; if not, they belong in `E:\Hub\temp\internal-contacts.md` keyed to `picu`.

5. **EI: two different numbers.** Your CMHT doc says EI hold someone for 2 years then hand
   to CMHT. The EI service template says "prior treatment not exceeding 12 months in
   secondary care or 3 years post initial treatment". I read those as caseload duration vs
   entry window, and I have printed both, but they sit next to each other in the guide and
   a reader could take them as contradictory. Worth a line confirming.

6. **PEEP - is a section enough?** I put it inside the seclusion support plan because that is
   the only place a PEEP currently lives. If PEEPs are written for mobility as often as for
   seclusion, it wants its own small guide instead. Your call.

7. **Two typos corrected in the CMHT worked example** ("ever 4 weeks" to "every", "route
   cause" to "root cause"). Staff will copy that text, so I fixed them. Say if you want it
   verbatim.

---

## Approval statuses set

Both new guides are **red** (in development), because their submission routes are
unconfirmed. Everything else stays where it was - I have not moved any existing guide's
traffic light. Green remains yours.
