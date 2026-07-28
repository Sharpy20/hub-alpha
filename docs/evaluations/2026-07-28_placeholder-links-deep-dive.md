# Placeholder link audit

> Follow-up to the High Priority item in `2026-07-28_project-evaluation.md`: "audit the remaining 131 placeholder links the way the contacts were audited".
> Run 28 July 2026 against commit `a0ad65c`.

---

## The short version

The 131 figure overstates the problem, and I should correct my own report: **none of these is the dangerous class the fake phone numbers were.** Every one of the 131 already renders as a non-clickable, greyed, dashed-border tile with a badge. Nothing silently pretends to work. The handling was built in an earlier session and it holds up on every render path I checked, including print.

What the audit did find is different and smaller:

1. **The badge said the wrong thing.** "Blocked in demo" asserts the link works in the live version and is merely switched off here. For all 131, no URL was ever captured. There is nothing to switch on. That wording turned a content backlog into what looked like a deliberate demo limitation, which is why the count has been quietly growing for a month.
2. **Two were wirable and are now wired**, with the URLs verified rather than guessed.
3. **Zero of the remaining 129 can be wired from the existing link map.** Everything the 4 July FOCUS capture covers, for a guide that exists, was already wired. The rest genuinely has no source.
4. **WAGOLL is 0 for 16.** Not one referral guide has a worked example. More on that below, because it is the most interesting thing here.

Count now 129. Wording fixed everywhere.

---

## What the 131 actually were

| Location | Count | Renders as |
|---|---|---|
| `src/lib/data/guides/referral-workflows.ts` | 80 | Greyed dashed tile, not clickable, badge + explanatory tooltip |
| `src/lib/data/bookmarks/index.ts` | 51 | Badge on the tile and on the home wheel spoke; FOCUS ones route through the FOCUS modal with the "open anyway" button suppressed |

No other placeholder shapes exist. I checked for `url: ""`, `href="#"` in components, and `TODO` / `TBC` / `placeholder` values: all zero. `ResourceLinks` (used by the admission checklist) already handles a missing url with a disabled "Link to confirm" chip. `FocusLinks` has no placeholder handling but also has no placeholder data, so nothing reaches it.

### Render paths checked

| Path | Handles a dead link? |
|---|---|
| Guide viewer, blank forms | Yes |
| Guide viewer, WAGOLL | Yes |
| Guide viewer, other guides | Yes |
| `/links` page tile | Yes |
| Home bookmark wheel spoke | Yes |
| FOCUS modal | Yes, and it hides "Open Anyway" so you cannot click through to nothing |
| Print | Yes. The badge is a `span`, not a `button`, so the print rule that hides buttons leaves it in. It prints as plain black text, unstyled but present |
| Guide editor / FlowchartEditor preview | Does not render form URLs as links at all, so nothing to leak |

That is a better result than my evaluation assumed, and worth saying plainly.

---

## The guide side: 80 placeholders across 17 referral guides

| Bucket | Total entries | Live | Dead | Live % |
|---|---|---|---|---|
| Blank forms | 29 | 7 | 22 | 24% |
| WAGOLL (worked examples) | 16 | **0** | 16 | **0%** |
| Other guides | 48 | 6 | 42 | 13% |

### WAGOLL is empty in every single guide

This is the finding worth acting on. "What A Good One Looks Like" is step 3 of the eight-step standard workflow template in CLAUDE.md, and it is the step that does the actual teaching. A new band 5 does not need the blank form explained, they need to see a completed one. Sixteen guides advertise the step, sixteen guides show a greyed placeholder.

It is also the easiest gap to close, because a WAGOLL does not need a trust URL. It needs someone to write a good example once, which Mike can do from memory for most of these, and it can live in the repo as static HTML the way `abc-wagoll.html` already does. That existing file proves the pattern works.

My recommendation: treat WAGOLLs as content to write, not links to source. Half a dozen of them would lift the guides more than wiring the other 42 links.

### Per guide

| Guide | Dead | What is missing |
|---|---|---|
| `social-care` | 8 | 3 blank forms (Derby City S117, S117 meeting request, County ASC), example, Care Act eligibility, 2 flowcharts, carers assessment |
| `ctr-dsp` | 7 | JUCD CTR/DSP form, DSP consent, DSP consent easy-read, example, consent guidance, CTR process, keyworking |
| `safeguarding` | 6 | Derby City + County SAR forms, example, types of abuse, DHCFT policy, Making Safeguarding Personal |
| `benefits-review` | 6 | Duplicated stub labels, see the note below |
| `picu` | 5 | Bed request form, DHCFT PICU referral, example, admission criteria, transfer checklist |
| `homeless-discharge` | 5 | City + County Duty to Refer forms, example, DTR guidance, housing options leaflet |
| `s117-meeting` | 5 | DCC meeting request form, example, aftercare flowchart, Care Act & S117 process, social care workflow |
| `tissue-viability` | 5 | TV form, example, pressure ulcer classification, Waterlow guide, wound photography policy |
| `speech-therapy` | 5 | SALT form, example, dysphagia screening, modified textures, choking signs |
| `erp` | 5 | SV2 form, example, DBT leaflet, SCM leaflet, Coping with Emotions leaflet |
| `dietitian` | 4 | Referral form, example, MUST guide, nutrition screening (SystmOne guide already wired) |
| `dental` | 4 | Special care dentistry referral, example, emergency dental access, oral health guide |
| `ot` | 4 | OT form, example, functional assessment, OT services overview |
| `physio` | 3 | Example, falls risk, mobility guide (form + leaflet already wired) |
| `safeguarding-children` | 3 | Example, DDSCP threshold document, Think Family policy |
| `edt` | 3 | Referral prompt, flow chart, discharge planning checklist |
| `imha-advocacy` | 2 | Example, IMHA service information |

Two things stand out from that list beyond the link count.

**`benefits-review` looks like an unfinished stub, not a sourced guide.** Its blank-forms bucket holds both "Benefits Review Referral" and "Blank Referral Form", and its guides bucket ends with "Additional Guidance". Those are template labels, not real document names. Worth a look on its own merits rather than as a link problem.

**`s117-meeting` is the one guide signed off green** and it carries 5 dead links. Sign-off is currently about the clinical wording, which is the right priority, but it means a green badge does not imply the resources behind it exist. Worth deciding whether green should require the links.

---

## The links side: 51 placeholders, now 49

| | Count | Assessment |
|---|---|---|
| `requiresFocus: true` | 44 | Honest. FOCUS badge, and the modal now says the address has not been captured rather than implying one exists |
| `requiresFocus: false`, has a phone | 5 | Fine in practice. The phone is the usable content (Guardianship City and County, Health Assured EAP, Resolve counselling, MoneyHelper) |
| `requiresFocus: false`, wirable | 2 | **Now wired** |

### Wired this pass, both verified before use

| Entry | URL | How verified |
|---|---|---|
| GovWifi Setup | `https://www.wifi.service.gov.uk/` | Fetched. Official GDS service page confirmed |
| Patient Transport (EMAS) | `https://www.emas.nhs.uk/your-service/patient-transport-service` | Fetched. Confirmed as the EMAS non-emergency PTS page, names Derbyshire, and the booking number on the page matches the 0300 300 3434 already in the app |

Worth recording that my first guess at the EMAS URL (`/our-services/patient-transport-service`) returned a 404. That is the argument for verifying every one of these rather than constructing plausible paths, which is the same mistake as the invented phone numbers in a different costume.

The 44 FOCUS ones are all things Mike can collect in one pass on the trust network: Datix, Spine, Assurance Dashboard, Oracle/ESR, HealthRoster, the training portal, Care Identity, Trust Policies, the safeguarding advice lines, MHA admin, patient safety, IPC, pharmacy, chaplaincy, estates, IT. None needs judgement, they just need someone logged into FOCUS with the app open beside them.

---

## Can anything else be wired from the 4 July link map?

No. I cross-referenced every entry in `E:\Hub\temp\focus-referral-links-04Jul2026.md` against the 80 guide placeholders.

- Six URLs from that map are already wired: dietetics via SystmOne, MH physio form, physio leaflet, ERP form/flowchart/guidance v12, ERP checklist, ERP patient leaflet.
- Everything else in the map belongs to a guide **that does not exist yet**: autism assessment, CAMHS, ECT, perinatal, specialist day services, discharge liaison. Those are guide-building jobs, already listed in BACKLOG Section A. They are not placeholder-link work and counting them together has been muddling two different tasks.
- One near-match I deliberately did not wire: ERP's "Coping with Emotions Leaflet" against the map's "Day Services - Coping With Emotions Group" (`/2410/685`). The map itself flags uncertainty about whether 2410 or 1131 is current, and a day-services group leaflet may not be the same document as the ERP one. Needs Mike, not a guess.

---

## Changes made

| Change | Files |
|---|---|
| "Blocked in demo" to "Link to confirm" on blank forms and other guides, with tooltips that say no trust URL has been captured yet | `src/app/guides/[id]/page.tsx` |
| "Blocked in demo" to "Example to add" on WAGOLL tiles, since the gap there is content to write, not a URL to find | `src/app/guides/[id]/page.tsx` |
| Same wording change on the `/links` tile badge and the home wheel spoke | `src/app/links/page.tsx`, `src/components/bookmarks/bookmark-carousel.tsx` |
| FOCUS modal no longer claims the live version opens the page | `src/app/links/page.tsx` |
| GovWifi and EMAS Patient Transport wired to verified public URLs | `src/lib/data/bookmarks/index.ts` |

Build clean, 32/32 tests, `tsc` zero errors. No instance of "Blocked in demo" remains in `src/`.

---

## For Mike

1. **Collect the 44 FOCUS addresses in one sitting.** Log into FOCUS with the app open, work down the Links page, copy each address across. No decisions needed, and it clears a third of the total.
2. **Write six WAGOLLs.** Pick the six referrals you send most (my guess: social care/S117, safeguarding adults, Duty to Refer, PICU, dietitian, OT) and write one good worked example each. They can be static HTML in the repo like `abc-wagoll.html`, so they need no FOCUS URL at all. This is the highest-value item in the audit.
3. **Confirm the ERP "Coping with Emotions" leaflet** is or is not the day services group leaflet at `/2410/685`.
4. **Look at `benefits-review`.** The labels read like an unfinished template rather than a sourced guide.
5. **Decide whether a green sign-off should require the links to work.** `s117-meeting` is green with 5 dead links today.

---

## Correction to the main evaluation

The evaluation listed "audit the remaining 131 placeholder links" as High Priority on the assumption they carried the same risk as the invented contacts. They do not. The handling was already honest, just badly worded. The residual work is content sourcing, which belongs in BACKLOG Section A at normal priority, not in the High Priority band. Section A has been updated with the accurate split.

*Run 28 July 2026 against `project-evaluation-template.md` v2.0.*
