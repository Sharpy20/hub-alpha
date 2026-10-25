# Can the editor build every guide in 3.0? (25 Oct 2026)

BACKLOG Section AA, item 2. Mike asked: for every guide in wardHub 3.0, could an author
build it in the guide editor, starting from a blank guide, so it looks and behaves the same
for a reader? Three answers per guide: builds as it is, could with an editor change, or
impossible. Every guide here was drafted by Claude. This audit changes no guide, no traffic
light and no editor code.

**Scope.** Everything a 3.0 reader can open from the guides list: `ALL_GUIDES` in
`src/lib/data/guides/catalog.ts` minus the eight tools in `V3_TOOLS_OUT`
(`src/lib/config/editions.ts`). That is 62 guides (40 read-through guides, 19 referrals,
3 checklists) plus the patient leaflets card. 63 rows.

**How it was checked.** Not from the coverage test. I dumped every field each guide uses,
then read what the editor can author (`editor-model.ts`, `components/admin/guide-editor/`)
against what the viewer actually draws (`app/guides/[id]/page.tsx`), including the
behaviour the viewer switches on by guide id rather than by data. Then I built a referral
from blank in the 3.0 editor in the browser to prove the worst gap (below), and deleted it.

## The answer

| Verdict | Count |
|---|---|
| Builds as it is | 49 |
| Could with an editor change | 12 |
| Impossible as it stands | 2 (the Section Papers checker and the patient leaflets) |

Most guides are text, tips, collapsible sections, references, links, forms and a case
note, and the editor does all of that. The gaps cluster in three places: referrals that ask
Derby City or County, anything with a widget or a walk-through, and the checklists.

"Looks and behaves the same" here means the guide's own pages: steps, questions, forms,
contacts, extras and the case note. The card in the guides list and the guide's icon and
colour are in a separate column, because one small change (or one decision) fixes all of
them at once. See "Card and colour" below.

## Editor changes, ranked by how many guides need them

| # | Change | Size | Needed by | Fully buildable once this and the rows above are done |
|---|---|---|---|---|
| 1 | **Step look for question steps.** Offer Consent, MHA section, S117 and Area again as step kinds when the step has a Question block. The type no longer does anything there; it only sets the badge, colour and icon. Today a new step can only be Information, Criteria, Forms, Where to send it, Case note, Diary reminder or Data protection, so a question step shows an INFO badge. | Small | 6: imha-advocacy, safeguarding, safeguarding-children, homeless-discharge, social-care, ctr-dsp | social-care, ctr-dsp |
| 2 | **City or County that actually filters.** Forms and contacts tagged "Shown for: Derby City" only appear when a question with the id `area` is answered `city` or `county`. The editor numbers every question `q1, q2...` and every choice `c1, c2...`, even with the "Derby City or Derbyshire County" preset, so on a referral built from blank the tagged forms and contacts never show for anyone. Simplest fix: make that preset write `area` / `city` / `county`. Add a check that warns when anything is tagged to an area and no `area` question exists. | Small | 4: imha-advocacy, safeguarding, safeguarding-children, homeless-discharge (and any new City/County referral) | + imha-advocacy, safeguarding, safeguarding-children, homeless-discharge |
| 3 | **Widget picker.** A "Widget" choice on a step, listing the four built-in widgets (payslip decoder, band picker, shift checker, pay FAQ with its topic). The widgets stay code; the editor only places them. | Small | 2: payslip, pay-roster-faq | + payslip, pay-roster-faq |
| 4 | **Checklist block.** Tick items in named groups, each with optional sub-points, links (FOCUS and form chips), a "document this" badge, a note, a red flag and a guidance line, plus progress, reset and a case note listing what was done and what is outstanding. The Leave, Discharge & Transfer list also needs "only for" answers on each item, so one list can serve all three pathways. | Large | 2: admission-checklist, leave-discharge-transfer (and part of any Section Papers rebuild) | + admission-checklist, leave-discharge-transfer |
| 5 | **Worked examples on read-through guides.** A WAGOLL list like the one referrals have. The ABC chart's example lives in code, keyed by guide id (`GUIDE_WAGOLLS` in `howto-guides.ts`). | Small | 1: abc-chart | + abc-chart |
| 6 | **Criteria walk editor.** The S117 "Who qualifies" walk-through (two questions, five outcomes, drawn as one flowchart in a pop-up inside a section) has no editor control. | Medium | 1: s117-meeting | + s117-meeting |

Changes 1, 2, 3 and 5 are small and between them make 9 of the 12 buildable. Change 4 is a
new kind of block and worth a design conversation before anyone builds it.

Not ranked because it changes no verdict, but it touches the most guides: **let the author
pick any icon and colour.** The pickers offer 24 icons and 13 colours. Of the 59 guides the
editor opens, 26 use an icon and 39 a colour outside those lists (43 miss one or the other),
so started from blank they cannot look the same. Editing a copy keeps the current ones, so this only bites a guide started from blank.

## The two that look impossible

**Section Papers - Receipt & Scrutiny (`mha-checker`).** It is a small program, not a page
of steps. Pick one of seven detention pathways and it shows the statutory form tiles you
should have, including "either this form or two of that one" choices (A3, or 2 x A4), the
form the nurse completes, pathway notes, and whichever of four scrutiny tick lists apply to
that pathway, then a case-note summary. The nearest editor version would be a Question for
the pathway, a step per pathway shown only for that answer, more Questions for the
either/or forms, and checklist blocks (change 4) for the scrutiny. That is a longer guide
that reads differently. Mike's call: keep it as a fixed tool, reviewed as code like the
eight tools already out, or drop it from 3.0.

**Patient leaflets (`/patient-guides`).** 29 designed leaflets in one 196 KB static file,
`public/patient-guides.html`, with speech bubbles, analogy callouts, a breathing animation,
grounding exercises, care-plan boxes and their own print layout. The editor writes guides a
nurse steps through; nothing in it makes a leaflet. Rebuilt as read-through guides they
would lose the layout and print design that make them leaflets. Keep them as fixed content
(one static file for IT to read once), or drop them.

## Every guide

Look column, for a guide started from blank: **icon** / **colour** = not in the editor's
picker; **card title** / **card line** = the guides-list card says something different from
the guide itself (see below); **page colour** = the guide page uses a different colour or
icon from its card.

| id | Title | Kind | Verdict | What is missing | Look |
|---|---|---|---|---|---|
| mha-statuses | MHA Statuses Explained | Guide | Builds as it is | - | colour, card title, card line |
| mha-checker | Section Papers - Receipt & Scrutiny | Checklist | **Impossible as it stands** | Fixed tool: pathway picker, form tiles with either/or choices, per-pathway scrutiny lists. See above | colour |
| imha-advocacy | IMHA / Advocacy | Referral | Could with changes 1 + 2 | Area question cannot filter the two area forms, two area links and four contacts. Consent, legal status and area steps show as INFO. The ten legal statuses are typed by hand, which works | card title |
| s117-meeting | S117 Meeting Request | Referral | Could with change 6 | The "Who qualifies" walk-through. Today's workaround is Question blocks with "message once picked" outcomes on separate steps, which reads differently | colour, card line |
| capacity-assessment | Capacity Assessment | Guide | Builds as it is | - | card line, page colour |
| dols | DoLS Ward Guidance | Guide | Builds as it is | - | icon, card line |
| section-17 | Section 17 Leave | Guide | Builds as it is | - | card line, page colour |
| arrange-mha-assessment | Arranging an MHA Assessment | Guide | Builds as it is | - | card line |
| section-132 | Section 132 - Reading Patient Rights | Guide | Builds as it is | - | colour |
| section-136 | Section 136 - Place of Safety | Guide | Builds as it is | - | icon, colour |
| tribunal-report | Mental Health Tribunal - Nursing Report | Guide | Builds as it is | - | colour |
| mh-talking-points | Named Nurse Talking Points (patient leaflets) | Leaflets | **Impossible** | Designed HTML leaflets, not guides. See above | colour |
| abc-chart | ABC Charts | Guide | Could with change 5 | The completed-example (WAGOLL) box is keyed by id in code. Putting it under Printable forms works but looks different | colour, card title, card line |
| honos | HoNOS & Clustering explained | Guide | Builds as it is | - | colour, card line |
| named-nurse | Named Nurse Checklist | Guide | Builds as it is | - (a read-through guide, not a tick list) | card line |
| admission-checklist | Admission Checklist | Checklist | Could with change 4 | Tick list: 2 groups, 25 items, sub-points, help links on 16 items, "document this" badges, progress, print, FOCUS links panel | icon, colour, page colour |
| admission-note | Admission Note Template | Guide | Builds as it is | - | colour, card line |
| informal-patient-contract | Informal Admission - Gatekeeping & Agreement | Guide | Builds as it is | - | icon, colour, card title, card line |
| leave-discharge-transfer | Leave, Discharge & Transfer | Checklist | Could with change 4 (plus "only for" on items) | One tick list of 48 items in 9 sections, filtered by a Leave / Discharge / Transfer toggle, 24 red flags, guidance per item, progress, reset, print, done/outstanding case note | colour |
| dama | Discharge Against Medical Advice | Guide | Builds as it is | - | colour |
| fridge-temps | Fridge Temperature Recording | Guide | Builds as it is | - | icon, card line |
| ot-pathway | OT Pathway (inpatient) | Guide | Builds as it is | Builds for 3.0. Its 14 diary jobs can only be written in the full-build editor (3.0 hides that block), see "Publishing" below | icon, colour, card line |
| mohost | MOHOST (OT screening) explained | Guide | Builds as it is | - | colour, card line |
| blanket-restrictions | Blanket Restrictions & Restrictive Practice | Guide | Builds as it is | - | icon, colour, card line |
| no-smoking | Smoke-Free Ward - Your Legal Duty | Guide | Builds as it is | - | icon, colour, card line |
| safeguarding | Safeguarding Adults - Making a Referral | Referral | Could with changes 1 + 2 | Area question cannot filter the two forms and five contacts. Consent and area steps show as INFO. Two questions on one step works | card line |
| safeguarding-children | Safeguarding Children - Making a Referral | Referral | Could with changes 1 + 2 | Area question cannot filter the two forms and four contacts. Consent and area steps show as INFO | colour, card line |
| domestic-abuse-guide | Domestic Abuse | Guide | Builds as it is | - | colour, card title, card line |
| peer-conflict-guide | Peer-on-Peer Conflict | Guide | Builds as it is | - | icon, colour, card title, card line |
| non-recent-abuse | Non-Recent Abuse Disclosures | Guide | Builds as it is | - | icon, colour, card line |
| escalation-pathway | Escalation Pathway (Children) | Guide | Builds as it is | - | icon, colour, card title, card line |
| online-safety-children | Online Safety and Children | Guide | Builds as it is | - | icon, colour, card line |
| honour-based-abuse | HBA, FGM and Forced Marriage | Guide | Builds as it is | - | colour, card title, card line |
| modern-slavery-radicalisation | Modern Slavery and Radicalisation | Guide | Builds as it is | - | icon, colour, card line |
| faith-belief-abuse | Abuse Linked to Faith or Belief | Guide | Builds as it is | - | icon, colour, card title, card line |
| send-safeguarding | SEND and Safeguarding | Guide | Builds as it is | - | icon, colour, card line |
| special-guardianship | Special Guardianship Orders | Guide | Builds as it is | - | icon, colour, card line |
| child-in-need | Child in Need | Guide | Builds as it is | - | icon, colour, card line |
| information-sharing | Information Sharing | Guide | Builds as it is | - | icon, colour, card title, card line |
| picu | PICU Kingfisher Referral | Referral | Builds as it is | - | card title, card line |
| awol | Absent & Missing Patients (AWOL) | Guide | Builds as it is | - | colour, card line |
| homeless-discharge | Housing / Duty to Refer | Referral | Could with changes 1 + 2 | Area question cannot filter the two forms and three contacts. Consent and area steps show as INFO | - |
| social-care | Social Care (Derby City) | Referral | Could with change 1 | The S117 step shows as INFO. Its amber and grey messages are authorable. (Also see "Found in passing") | card line |
| stepdown-referral | Step Down Referral | Referral | Builds as it is | - | icon, card line |
| benefits-review | Benefits Review | Referral | Builds as it is | - | icon, colour |
| dietitian | Dietitian Referral | Referral | Builds as it is | - | colour |
| physio | Physiotherapy | Referral | Builds as it is | - | - |
| ot | Occupational Therapy | Referral | Builds as it is | - | - |
| speech-therapy | Speech & Language | Referral | Builds as it is | - | - |
| news2 | NEWS2 Observations | Guide | Builds as it is | - | card line, page colour |
| prenoxad | Prenoxad (take-home naloxone) | Guide | Builds as it is | - | colour, card title, card line |
| transfer-in | Accepting a Transfer from a General Ward | Guide | Builds as it is | - | icon, colour |
| tissue-viability | Tissue Viability | Referral | Builds as it is | - | - |
| dental | Dental Referral | Referral | Builds as it is | - | - |
| edt | Early Discharge Team | Referral | Builds as it is | - | - |
| cmht-referral | CMHT / EI Referral | Referral | Builds as it is | - | icon |
| erp | Emotional Regulation (ERP/DBT) | Referral | Builds as it is | - | colour |
| ctr-dsp | CTR / DSP Review | Referral | Could with change 1 | The consent step shows as INFO | colour, card line |
| student-placement | Student Nurse Placement Guide | Guide | Builds as it is | - | icon, colour, card line |
| payslip | Understanding Your NHS Payslip | Guide | Could with change 3 | Three widgets (payslip decoder, band picker, shift checker). The "Your figures" print box is keyed to the id `payslip` | icon, colour, card line |
| roster | Roster Survival Guide | Guide | Builds as it is | - | icon, colour |
| leave-absence | Leave, Absence & Rest Rules | Guide | Builds as it is | - | icon, colour, card line |
| pay-roster-faq | Pay & Roster FAQ and Jargon Buster | Guide | Could with change 3 | The FAQ widget. Its 16 questions live in `pay-faq.ts` and stay uneditable in the editor even with the picker; making them editable is a bigger FAQ block | icon, colour, card line |

## Card and colour

**Card text.** The built-in guides carry two titles and two one-liners: one on the guides-list
card (`catalog.ts`) and one on the guide itself. The editor has one of each. 42 of the 59
guides behind the viewer differ: 41 card lines and 12 card titles. When a guide is published,
its card takes the guide's own title and line (`withPublished` in `published.ts`), so
**publishing even an untouched copy changes its card text**. The 12 titles:

| id | Card says | Guide says |
|---|---|---|
| mha-statuses | MHA Statuses Explained | Mental Health Act Statuses Explained |
| imha-advocacy | IMHA / Advocacy | IMHA / Advocacy Referral |
| abc-chart | ABC Charts | ABC Charts - Antecedent, Behaviour, Consequence |
| informal-patient-contract | Informal Admission - Gatekeeping & Agreement | Informal Admission - Gatekeeping & the Patient Agreement |
| domestic-abuse-guide | Domestic Abuse | Recognising and Responding to Domestic Abuse |
| peer-conflict-guide | Peer-on-Peer Conflict | Peer-on-Peer Conflict – When to Escalate |
| escalation-pathway | Escalation Pathway (Children) | Escalation Pathway - Complex Children's Cases |
| honour-based-abuse | HBA, FGM and Forced Marriage | Honour-Based Abuse, FGM and Forced Marriage |
| faith-belief-abuse | Abuse Linked to Faith or Belief | Child Abuse Linked to Faith or Belief |
| information-sharing | Information Sharing | Information Sharing in Safeguarding |
| picu | PICU Kingfisher Referral | PICU Referral |
| prenoxad | Prenoxad (take-home naloxone) | Prenoxad (take-home naloxone injection) |

This is a wording decision more than an editor gap. Either Mike picks one wording per guide
(no code), or the editor gets a separate "card title" and "card line". I'd pick one wording:
two titles for the same guide is how a nurse ends up unsure they opened the right one.

**Page colour.** Capacity Assessment, Section 17 and NEWS2 draw their guide page in a
different colour or icon from their card (`GUIDE_CONFIG` vs `catalog.ts`). Publishing
gives them the card's look. Harmless, but it is a visible change.

## Publishing, worth knowing before anyone does it

- **A guide started from blank cannot take a built-in guide's address.** The address comes
  from the title, is locked once saved, and a clash with a built-in id gets a number added
  (`news2-2`). To replace a built-in
  guide the author uses "Edit a copy", which keeps the id. Anything keyed to the id (the
  traffic light in `approval-status.ts`, the ABC example, the payslip print box, the FAQ
  topic) survives an edited copy and is lost on a new address. A new address starts amber.
- **Publishing from the 3.0 editor publishes everywhere.** `published.json` applies to the
  root, `/v2` and 3.0 alike. The OT Pathway's 14 diary jobs ride through an edited copy
  untouched, but a 3.0 rebuild from blank would drop them from the full site when published.
- **The Checks panel does not notice area-tagged forms with no area question.** It warns
  "Nothing changes with the answer" about a City/County question that does not filter
  (seen in the browser), but says nothing about the forms that will never show.

## Found in passing (not changed)

- **Social Care (Derby City) has two entries nobody can see.** The "Derbyshire County ASC
  Referral" form and the "Derbyshire County ASC" phone number are tagged County, and the
  guide has no area question, so they never show. Walked in the browser to the forms and
  contact steps to confirm. Either they go, or the guide gets an area question. Mike's call.
- ✅ **Fixed 25 Oct (7947ad8): the links now stay in 3.0.** **Two referrals link out of 3.0.** Step Down (3 links) and CMHT / EI (2 links) list other
  wardHub guides under "Other guides" as typed `/guides/...` addresses. The viewer draws them
  as plain links, so in 3.0 they open the full site instead of the 3.0 page. A guide picker
  for these (like Related guides on read-through guides) would fix it and stop typos.
- ✅ **Fixed 25 Oct (7947ad8): no longer listed.** **The 3.0 editor lists the eight tools that are out of 3.0**, as "Interactive tool, not
  editable here". They do not open, but they should not be listed in 3.0.
- **The leaflets card says 23 leaflets; there are 29** (`patient-guides.ts`).

## Method notes

- Proof of the area gap, 25 Oct, in the 3.0 editor at `localhost:3025/3.0/admin/guides`:
  new referral, Question on step 1 from the "Derby City or Derbyshire County" preset (saved as
  `q1` with choices `c1`/`c2`), two blank forms tagged City and County on step 2. Draft
  preview, ticked the criteria, picked Derby City: neither tagged form showed. The test guide
  was deleted from that browser afterwards.
- The step kinds a new referral step can pick were read off the live editor: Information,
  Criteria check, Forms and guides, Where to send it, Case note, Diary reminder, Data
  protection reminder.
- Every built-in guide still opens in the editor with no errors (`checkGuide`), and every
  field it uses is either editable or carried through (`EDITOR_COVERAGE`). That is what the
  existing test proves. It does not prove an author could build the guide, which is why this
  audit exists: `widget` and `walk` are carried, never authored, and behaviour keyed to the
  guide id or to fixed question ids sits outside the test's view.
