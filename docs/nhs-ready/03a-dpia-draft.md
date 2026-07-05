# wardHub data protection impact assessment (DPIA)

> Draft - 4 July 2026, prepared for trust review.
>
> Prompt 3 of the NHS-ready pack. Written to the ICO's DPIA structure (screening,
> describe the processing, consultation, necessity and proportionality, risk
> assessment, measures, sign-off). If the trust has its own DPIA form, this document
> holds every answer needed to fill it in - it is organised so an IG officer can lift
> sections across rather than start again. Facts about data flows come from the
> data governance audit (01-data-governance-audit.md, 4 Jul 2026) and reflect the
> fix pass applied the same day.

| Field | Detail |
|-------|--------|
| Document reference | wardHub-DPIA-002 |
| Version | 0.1 (Draft) |
| Date | 4 July 2026 |
| Author | Mike - Ward Nursing Informatics Coordinator (Ward NIC) |
| Organisation | Derbyshire Healthcare NHS Foundation Trust (proposed) |
| Status | DRAFT - for IG officer / DPO review |
| Supersedes | The DPIA scaffold in the wardHub dev panel (wardHub-DPIA-001), which is out of date and should be treated as withdrawn |

---

## How to read this document

wardHub exists in two distinct states, and they need separate assessments:

- **Scope A - the current public demo** (live at wardhub.live). Contains no real
  patient data. Everything is fictional or self-entered by the visitor, and nothing
  the user types leaves their browser. Section 1 argues a full DPIA is probably not
  required for this scope, but the assessment is completed anyway.
- **Scope B - the proposed live ward deployment.** Real patient identifiers would be
  processed, either in browser localStorage on ward machines or in a trust-hosted
  database. This is the assessment that matters, and it is the one that needs trust
  decisions before anything goes live.

Anything only the trust can answer is marked **[TRUST TO CONFIRM: owner]**.

---

## Step 1 - Identify the need for a DPIA (screening)

### Screening questions

| # | Question | Scope A (demo) | Scope B (live) |
|---|----------|----------------|----------------|
| 1 | Does the project use new or innovative technology? | Standard web technology (Next.js, static hosting). Nothing novel | Same |
| 2 | Does it process personal data? | Marginal - see below | Yes - patient and staff identifiers |
| 3 | Does it process special category data (health)? | No - all patients fictional | Yes - clinical narrative about identifiable patients |
| 4 | Does it process data about vulnerable individuals? | No | Yes - detained and informal mental health inpatients |
| 5 | Large scale processing? | No | No - ward level, tens of patients |
| 6 | Systematic monitoring, profiling, or automated decision-making? | No - no analytics, no tracking, no accounts | No |
| 7 | Data matching or combining datasets? | No | No |
| 8 | Data transferred outside the UK? | Hosting metadata only (see processors) | Depends on hosting decision - see Step 4 |
| 9 | Could the processing result in denial of a service or opportunity to individuals? | No | No - the tool supplements, never gates, clinical care |

### Scope A - is a DPIA required at all?

Honestly, probably not. The demo processes:

- **No patient personal data.** All 100 patients and 100 staff are fictional
  (placeholder names like Patient_BY_1 on poet-pseudonym wards).
- **Minimal, self-entered visitor data** that never leaves the visitor's own
  browser: a picked demo identity, optional free-text feedback posts, personal
  links, and preferences. There are no accounts, no cookies in use, and no
  analytics of any kind.
- **Ordinary hosting metadata** (IP address and user agent in Vercel's request
  logs) - the same processing as visiting any website.

None of the ICO's high-risk triggers are met. The assessment is completed anyway
for two reasons: it demonstrates the governance habit the trust will want to see
before Scope B, and free-text fields mean a visitor *could* type real information
into their own browser, which deserves a documented position (see risk A3).

### Scope B - DPIA required

Yes, clearly. Health data about vulnerable individuals (mental health inpatients,
many detained under the MHA), processed by a new tool. Screening questions 2, 3
and 4 are all met. This DPIA must be completed and signed off before any version
handling real patient data is deployed. **[TRUST TO CONFIRM: DPO - whether the
trust's own DPIA form must be used, and who convenes the review]**

---

## Step 2 - Describe the processing

### 2.1 Nature of the processing - Scope A (current demo)

wardHub is a reference and task-coordination tool for inpatient mental health
wards: interactive referral guides, how-to guides, a links directory, a training
quiz, and a demo ward diary. It is a static Next.js site served by Vercel. There
is no application server holding user data, no database in use, and no user
accounts.

**Where user-entered data lives.** Everything the user enters stays in their own
browser's localStorage, unencrypted, on that device only:

| Data | localStorage keys | Notes |
|------|-------------------|-------|
| Picked demo identity (name/role/ward from dropdowns) | `wardhub_user` | Cleared on logout |
| Referral chase log - patient name, patient id, free-text notes, by design | `wardhub-referral-logs` | Cleared on logout (fix applied 4 Jul) |
| Care review tracker - dates keyed by patient id | `wardhub_care_tracker_v2` | Cleared on logout (fix applied 4 Jul) |
| Feedback board posts and comments (free text) | `wardhub_feedback` and related | Deliberately survives logout - a community board of staff free text, not patient records |
| Personal links and recommendations | `wardhub-personal-bookmarks` and related | Free text and URLs |
| Preferences and flags (theme, diary view, tour flags) | ~15 further keys | No personal data |

Diary and task data - the biggest free-text surface - is held in memory only and
wiped on page refresh. The guide builders and the quiz store nothing. The GDPR
page's "clear my data" button runs `localStorage.clear()` and genuinely removes
everything.

**What leaves the browser.** Two things, and only two:

1. **Hosting requests to Vercel** - page and asset requests carrying IP address
   and user agent, logged by Vercel as any host logs requests. No Vercel
   Analytics is installed.
2. **The clipboard pathway, by design.** When a user copies a case note or a
   builder output for pasting into SystmOne, the text (which prepends the linked
   patient's name) goes to the operating system clipboard. In the demo the
   patient is fictional; the pathway itself is assessed under Scope B because it
   is the intended live behaviour. Windows clipboard history (Win+V) and cloud
   clipboard sync can persist and sync clipboard contents beyond the machine.

**What cannot leave the browser.** Since the 4 July fix pass, all fonts are
self-hosted and the Content Security Policy restricts `connect-src` and `img-src`
to `'self'`. The browser will refuse any request from the app to any other host.
"Nothing user-entered leaves the device" is technically enforced, not just
asserted. There is no sessionStorage use, no cookies, no external scripts,
no iframes, no IndexedDB.

### 2.2 Nature of the processing - Scope B (proposed live deployment)

The same application, deployed for real ward use. Two candidate architectures:

- **B1 - localStorage-only on trust machines.** No server-side storage; each ward
  computer holds its own copy of chase logs, tracker dates and (if enabled) diary
  data. Simplest, but data is unencrypted, device-bound, un-audited, and readable
  by anyone at the machine. This DPIA treats B1 as acceptable only for short-lived
  scratchpad data, not for anything relied on as a record.
- **B2 - trust-authenticated with a server-side store** (trust infrastructure, or
  Supabase on a UK region with row-level security). Required before the diary or
  chase log is used for real coordination. **[TRUST TO CONFIRM: IT/Digital -
  hosting decision, and verification of Supabase region if Supabase is chosen]**

Personal data processed in Scope B:

| Category | Items | Data subjects |
|----------|-------|---------------|
| Patient identifiers | Name, local patient id, ward | Inpatients (vulnerable; many detained under MHA) |
| Patient health data (special category) | Task descriptions, referral chase notes, care review dates, clinical narrative in copied case notes | Inpatients |
| Staff data | Name, role, ward, task claims/completions, feedback posts | Ward staff |

The clipboard pathway becomes a live patient-data egress: patient name plus
clinical narrative to the OS clipboard of a ward machine, exposed to Windows
clipboard history and, where enabled, Microsoft cloud clipboard sync.

### 2.3 Scope, context and purposes

- **Purpose.** Help ward staff complete referrals correctly, coordinate shift
  tasks, and find approved guidance quickly. The tool supplements SystmOne (the
  legal clinical record), FOCUS (the intranet) and existing ward processes. It
  replaces none of them and staff can stop using it at any time.
- **Scale.** One trust, initially one or a small number of adult inpatient mental
  health wards. Roughly 20 patients and 20-30 staff per ward.
- **Retention.** Scope A: until the user clears it (logout clears the two
  patient-identifying stores; "clear my data" clears all). Scope B: to be set -
  see Step 4. **[TRUST TO CONFIRM: IG - retention period for chase log and care
  tracker entries in the live build]**
- **Context.** Built by a serving ward nurse (Ward NIC) as a personal project,
  currently outside trust governance, seeking trust adoption. The trust has not
  yet agreed to act as Data Controller for anything; the demo footer wording
  acknowledging this is under review (audit item F2).

### 2.4 Controller and processors

| Role | Scope A (demo) | Scope B (live) |
|------|----------------|----------------|
| Data controller | Mike (project owner), as a private individual running a public demo | **[TRUST TO CONFIRM: DPO - the trust must formally accept controllership before go-live]** |
| Processor - Vercel Inc. | Hosting and request logs. US company; content served from edge locations including London. Processes IP addresses and user agents only - no application data reaches Vercel because there is no backend | Only if the live build remains Vercel-hosted, which this DPIA does not recommend for patient data |
| Processor - GitHub Inc. (Microsoft) | Holds the private source repository. No application user data. **Honest disclosure:** the repository history still contains a raw dump of internal trust documents (~110 MB, deleted from the current tree 27 Jun but retrievable from history by anyone with repo access). A history rewrite is planned (audit finding F1) and should be a precondition of trust sign-off | Same repo would build the live version |
| Processor - Supabase | Named for completeness: a client was configured but no query has ever been made and, since the 4 July fix pass, the dormant client is removed from the shipped bundle. Supabase currently receives nothing | Candidate store for B2. Region and UK data residency to be verified before use |
| Removed | Google Fonts received visitor IPs until 4 July 2026; fonts are now self-hosted and the CSP blocks the request | Not applicable |

### 2.5 Data flows

See 03c-data-flow-diagram.md for the current-demo and proposed-live diagrams.

---

## Step 3 - Consultation

| Who | Status |
|-----|--------|
| Ward staff (intended users) | Informal, ongoing - colleagues have used the demo and fed back via the built-in feedback board and in person. No formal consultation exercise yet |
| Data Protection Officer | Not yet consulted. This draft is the input to that conversation. **[TRUST TO CONFIRM: DPO - review of this DPIA]** |
| Caldicott Guardian | Not yet consulted. Required for Scope B given patient confidential data in a new tool. **[TRUST TO CONFIRM: Caldicott Guardian]** |
| SIRO / information asset owner | Not identified. The live build needs an entry on the information asset register with a named owner. **[TRUST TO CONFIRM: SIRO]** |
| Clinical Safety Officer | Not yet appointed for this project - see the DCB0129 set in docs/clinical-safety/ and the extended hazard log (03b). **[TRUST TO CONFIRM: CSO appointment]** |
| Patients | Not consulted. Scope A holds no patient data. For Scope B, patient-facing transparency (privacy notice covering the ward's use of the tool) is a Step 6 measure |
| ICO | Not required unless residual risk remains high after measures - current position is that it does not |

---

## Step 4 - Necessity and proportionality

### 4.1 Lawful basis

**Scope A.** The demo's marginal personal data (visitor's own free text in their
own browser; hosting logs) is processed on legitimate interests (UK GDPR Article
6(1)(f)) - running a demonstration website. No special category data is processed.

**Scope B.** Proposed bases, for the DPO to confirm:

- Article 6(1)(e) - public task (provision of NHS care).
- Article 9(2)(h) - health and social care provision, with the safeguard of
  processing by or under the responsibility of staff owing a duty of
  confidentiality.
- Common law duty of confidentiality: use is within the direct care team, which
  ordinarily carries implied consent for direct care purposes.

**[TRUST TO CONFIRM: DPO - lawful basis sign-off and whether the trust privacy
notice needs amendment]**

### 4.2 Is the processing necessary and proportionate?

The purpose - fewer failed referrals, fewer lost ward tasks - could in principle
be met with paper and the intranet, because that is the status quo. The case for
the tool is that the status quo demonstrably loses referrals and tasks (the
problem that prompted the build). The processing proposed is the minimum that
delivers the purpose:

- **Data minimisation.** No demographics, no diagnosis fields, no document
  uploads. Patient identifiers are limited to name, local id and ward. The
  patient list deliberately dropped room/bed and alerts from earlier versions.
  Reports show ward and name only. Dropdown selection is preferred over free
  text throughout to limit what can be entered.
- **No new copies of the record.** Case notes are composed in the tool and pasted
  into SystmOne; the tool does not retain them (the chase log retains a short
  reference by design, which is why it is classed as a patient record in Scope B).
- **Storage limitation.** Scope A enforces clearing at logout for the two
  patient-identifying stores. Scope B needs a defined retention rule (proposal:
  chase log entries auto-expire 90 days after the referral is closed).
  **[TRUST TO CONFIRM: IG - retention rule]**
- **No profiling, no analytics, no secondary use.**

### 4.3 Individual rights

Scope A: the visitor holds their own data; the GDPR page provides a one-click
"clear my data". Nothing exists server-side to be the subject of a SAR.

Scope B: rights of access, rectification and erasure need a workable route. This
is a genuine weakness of architecture B1 (data scattered across ward machines
with no central index) and a further reason to require B2 for anything relied
upon. SystmOne remains the legal record, so most SAR content lives there, but
chase-log free text about a patient is still that patient's personal data.

### 4.4 International transfers

Scope A: Vercel is a US company; edge delivery for UK visitors is from London,
but request logs and support access are subject to Vercel's global operations
(covered by Vercel's Data Processing Addendum with UK/EU standard contractual
clauses). Only IP/user-agent metadata is involved. GitHub (US, Microsoft) holds
source code and repository history, not application user data - though see the
F1 disclosure in 2.4.

Scope B: patient data must stay in the UK. Trust hosting satisfies this by
default; Supabase would need a verified UK region and a signed DPA. Vercel
should not host the patient-data build unless the trust's IG team explicitly
accepts the transfer analysis. **[TRUST TO CONFIRM: DPO/IT - transfer position
for the chosen architecture]**

---

## Step 5 - Identify and assess risks

Likelihood and severity scored 1-3 (low/medium/high) for readability; overall =
the higher of the two unless mitigations change the picture.

### Scope A risks (current demo)

| Ref | Risk to individuals | Likelihood | Severity | Overall |
|-----|--------------------|------------|----------|---------|
| A1 | Visitor types real patient details into a free-text field (feedback, personal links, chase log) believing the demo is an approved tool. Data then sits unencrypted in that browser | Medium | Medium | Medium |
| A2 | Shared or public computer: a later user reads the previous user's localStorage entries (feedback drafts, chase log before logout) | Medium | Low | Medium |
| A3 | Clipboard: copied demo case note lingers in Windows clipboard history or syncs via cloud clipboard to a personal device. Fictional data today, but the habit carries into live use | Medium | Low | Low |
| A4 | Trust-internal information exposure via the GitHub repository history (staff names, internal extensions, one personal mobile number in the historical dump - audit finding F1). Not application users' data, but real individuals' data held on a US processor without their knowledge | Medium | Medium | Medium |
| A5 | Vercel request logs identify visitors by IP (ordinary web hosting risk) | High | Low | Low |

### Scope B risks (proposed live deployment)

| Ref | Risk to individuals | Likelihood | Severity | Overall |
|-----|--------------------|------------|----------|---------|
| B1 | Shared ward computer: patient names, chase notes and tracker data in localStorage readable by anyone at the machine - other staff, students, contractors, or (on an unattended terminal) patients and visitors | High | High | High |
| B2 | Clipboard exposure: patient name + clinical narrative in Windows clipboard history (Win+V) on a shared machine, or synced to a staff member's personal device via cloud clipboard | High | Medium | High |
| B3 | Data loss as a confidentiality inverse: localStorage cleared by IT policy, browser reset or the app's own logout-clear destroys chase records staff relied on (clinical risk cross-referenced to hazard log HAZ-020) | Medium | Medium | Medium |
| B4 | Wrong-record contamination: clipboard note pasted into the wrong patient's SystmOne record (clinical risk - hazard log HAZ-017; also a confidentiality breach of the named patient) | Medium | High | High |
| B5 | Patient data hosted or logged outside the UK if the live build stays on public Vercel | Medium | Medium | Medium |
| B6 | No per-user audit trail in architecture B1 - cannot establish who viewed or edited patient entries | High | Medium | High |
| B7 | Staff free text (feedback board) accumulating patient details outside the record | Medium | Medium | Medium |
| B8 | SAR/erasure requests cannot be reliably fulfilled for device-scattered data (B1 architecture) | Medium | Medium | Medium |
| B9 | Repository history dump (F1) still unresolved at go-live, undermining the trust's assurance position | Medium | Medium | Medium |

---

## Step 6 - Measures to reduce risk

### Already in place (verified 4 July 2026)

| Measure | Addresses |
|---------|-----------|
| No server-side storage of anything user-entered; no accounts; no analytics; no cookies | A1, A2, A5 |
| CSP locked to 'self' - the browser refuses any outbound connection from the app; fonts self-hosted | A1, A5, B5 (for the demo) |
| Logout clears the two patient-identifying stores (`wardhub-referral-logs`, `wardhub_care_tracker_v2`) | A2, B1 |
| GDPR page one-click "clear my data" (full localStorage wipe) plus honest, updated privacy copy naming processors and the Supabase configured-but-unused position | A1, A2 |
| Dropdowns preferred over free text; patient pickers are searchable dropdowns, not typed names | A1, B4 |
| Copied case notes prepend the patient's name, so a paste into the wrong record is visibly wrong at the point of paste | B4 |
| Demo data all fictional; internal trust numbers display "Hidden in demo mode"; fabricated referral addresses use the undeliverable @example.nhs.net pattern | A1 |
| Supabase dormant client removed from the shipped bundle | B5 |

### Required before Scope B go-live

| # | Measure | Addresses | Owner |
|---|---------|-----------|-------|
| M1 | Trust authentication (SSO or equivalent) with session timeout on shared machines | B1, B6 | [TRUST TO CONFIRM: IT] |
| M2 | Server-side store (trust infrastructure or verified-UK Supabase) with row-level security and per-user audit logging for anything relied on as a record; localStorage demoted to preferences only | B1, B3, B6, B8 | Mike + [TRUST TO CONFIRM: IT] |
| M3 | Clipboard guidance baked into the UI: "paste, verify the patient name, then copy something innocuous or clear the clipboard". Plus a trust decision on disabling Windows clipboard history / cloud clipboard sync on ward machines via group policy | B2, B4 | Mike (UI); [TRUST TO CONFIRM: IT - group policy position on clipboard history] |
| M4 | GitHub history rewrite and force push to purge the trust-docs dump; GitHub support asked to drop cached views; confirmation recorded here | A4, B9 | Mike |
| M5 | Defined retention and auto-expiry for chase log and tracker entries | B3, B8 | Mike (build); [TRUST TO CONFIRM: IG - period] |
| M6 | Feedback board policy: banner forbidding patient identifiers in posts, plus periodic moderation by editors | B7 | Mike |
| M7 | Hosting migration off public Vercel for the patient-data build, or a documented IG acceptance if it stays | B5 | [TRUST TO CONFIRM: IT/DPO] |
| M8 | Ward privacy notice update covering the tool | Transparency | [TRUST TO CONFIRM: DPO] |
| M9 | Entry on the information asset register with named information asset owner | Governance | [TRUST TO CONFIRM: SIRO] |
| M10 | DCB0129 clinical safety sign-off (see 03b and docs/clinical-safety/) and DTAC/DSPT position confirmed | Governance | [TRUST TO CONFIRM: CSO / IG - whether DTAC applies to an internally developed tool] |

### Residual risk position

Scope A: low across the board once M4 (history rewrite) lands; A1 is accepted
with the existing warnings and the one-click clear.

Scope B: with M1-M7 implemented, B1/B2/B4/B6 reduce to medium-low. Without M1 and
M2, risks B1 and B6 remain high and this DPIA's recommendation is **do not
deploy** with real patient data. No residual risk is assessed as requiring prior
consultation with the ICO, provided the required measures are conditions of
go-live.

---

## Step 7 - Sign-off and outcomes

| Item | Name / decision | Date |
|------|-----------------|------|
| Measures approved by | [TRUST TO CONFIRM: DPO] | |
| Residual risks accepted by | [TRUST TO CONFIRM: SIRO] | |
| Caldicott review | [TRUST TO CONFIRM: Caldicott Guardian] | |
| DPO advice provided | [TRUST TO CONFIRM: DPO] | |
| DPO advice accepted or overruled by | [TRUST TO CONFIRM] | |
| ICO consultation | Not required on current assessment | |
| Review date | Before Scope B go-live, then annually, and on any change to data flows | |

### Author's declaration

This draft was prepared by the project owner, who is not an IG professional. It
is intended to be edited by the trust's IG team, not treated as final. Every
factual claim about the application's behaviour was verified against the codebase
and live site on 4 July 2026 (see 01-data-governance-audit.md for the method and
raw findings).

---

## Change history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 04/07/2026 | Mike (Ward NIC) | First full draft, both scopes, post fix-pass. Replaces the dev-panel DPIA scaffold |
