# wardHub: technical and information governance assurance sheet

**Version 1.0 - 2 August 2026**
**Every claim below was verified against the code on the date above. Re-verify before reissuing.**

> **How to use this.** Hand it over, or read from it, when someone asks how wardHub handles data.
> It answers the questions raised at the sponsor meeting on 30 July once, so they do not have to be
> answered again from memory. Section D lists what wardHub does **not** have. That section is not an
> oversight; it is the reason the rest of the sheet can be believed.
>
> **Do not add a claim to this sheet that you have not checked in the code.** Two claims in earlier
> wardHub documents ("no cookies", "nothing is sent to any server") had to be withdrawn because they
> were written from memory of how the app used to work. A withdrawn claim costs more credibility
> than an admitted gap.

---

## A. What wardHub is

A web application holding **ward reference material** (guides, referral workflows, service links)
and a **shared ward jobs diary**. It is not a clinical record and does not replace one. Where a job
or a referral needs recording clinically, wardHub prompts the user to record it on SystmOne and
generates the case note text to paste.

- **Built by** a registered mental health nurse employed by the Trust.
- **Current status:** demonstration build with **fictional data only**. No real patient or staff
  data exists in it.
- **Live at** https://www.wardHub.live behind a shared password. Search engine indexing is disabled
  (`robots: noindex`).
- **Repository:** private.

---

## B. Data: what is held, and where

### B1. In the demonstration build: no personal data at all

All patients, staff and consultants are **fictional characters from English literature**. This is a
deliberate choice so that the data cannot be mistaken for a real roster or patient list. Fictional
data is not personal data, so the demonstration build is out of scope for a DPIA entirely.

### B2. The proposed pilot data scope, which is fixed

If and when real data is used, the scope is **four fields and no more**:

| Field | Why |
|---|---|
| First name and surname | To know whose job it is |
| Job title | To know who can do it |
| Ward | To scope the diary |
| Date | To sequence the work |

**Nothing clinical is held.** Mental Health Act status, clinical alerts, diagnoses, room and bed
were all present in an earlier build and were **removed entirely** in July 2026. This is enforced by
an automated test (`src/__tests__/no-special-category-data.test.ts`) which fails the build if any of
those fields reappear.

The reasoning, which is clinical safety rather than only information governance: wardHub is not the
clinical record, so any clinical field it held would have no owner, nobody accountable for keeping it
current, and no answer to the question of what happens when someone acts on a stale value.

The patient record is now: **name, ward, status, admission date and time, named nurse, consultant,
ward professional, discharge fields.** That is the complete list.

### B3. Where data physically sits

| Store | What is in it | Persists? |
|---|---|---|
| **Browser `localStorage`** | User preferences, chosen ward, theme, guide ordering, personal links. 22 keys, all prefixed `wardhub_` | Yes, on that device only. Never leaves the browser |
| **Ward jobs and tasks** | Nothing | **No.** Tasks are held in React component state and are lost on page refresh. Nothing is written anywhere |
| **Server-side database** | Nothing | **There is no database in use.** See D2 |
| **Server logs** | Standard hosting request logs | Per hosting provider |

### B4. What leaves the browser

**One request, to one endpoint, on this site's own origin:**

`POST /api/auth/verify-password` - sends the site password typed at the gate, and nothing else.

That is the only API route in the application. The only other network request the application makes
is for a static file on the same origin (`/patient-guides.html`).

**There are no third-party requests at runtime.** Verified: no analytics, no telemetry, no error
reporting, no tag manager, no session recording. Fonts are self-hosted (downloaded at build time and
served from this origin), so no request is made to Google or any font CDN when a page loads.

### B5. Cookies

**Exactly one cookie:** `site_access`.

| Property | Value |
|---|---|
| Value stored | `granted` - i.e. "the password entered was correct", nothing else |
| `httpOnly` | Yes - not readable by JavaScript |
| `secure` | Yes in production |
| `sameSite` | `lax` |
| Lifetime | 7 days |

No tracking cookies, no advertising cookies, no third-party cookies.

### B6. Artificial intelligence

**wardHub makes zero AI calls at runtime.** There is no AI in the running application: no API key,
no model endpoint, no per-use cost, no data sent to any AI service by any user action.

AI was used as a **development tool** to help write code and draft guide content, in the same way a
developer uses an IDE or a search engine. Every guide is reviewed by a clinician before it is
published, and the traffic-light status on each guide records where it is in that review.

The accurate form of this statement, which should be used in preference to looser versions: **no
patient data passes through any AI system at runtime.**

---

## C. Security controls in place

### C1. HTTP security headers

Set for every route in `next.config.ts`:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

`connect-src 'self'` is the important one for an IG reader: the browser is **prevented** from making
network requests to any other host, so data cannot be exfiltrated to a third party even in error.

**Stated plainly because a penetration test would find it:** `script-src` includes `'unsafe-inline'`
and `'unsafe-eval'`, and `style-src` includes `'unsafe-inline'`. These are required by the framework
(Next.js) as currently configured and they weaken the CSP against cross-site scripting. Tightening
them with a nonce-based policy is a known piece of work, not a solved problem.

### C2. Accessibility

Audited against **WCAG 2.1 AA** with axe-core. All audited pages return zero violations. Skip link,
landmarks, keyboard navigation, focus indicators, `prefers-reduced-motion` and accessible dialogs are
implemented. Residual items are recorded in the project backlog: a contrast sweep across pages not in
the audited set, the four non-NHS visual themes, dark mode, and focus-trap on some custom modals.

### C3. Automated checks

71 automated tests, TypeScript type checking with zero errors, and linting run before release. One
test exists specifically to prevent special category clinical data being reintroduced (B2).

### C4. Code and content provenance

Guide content carries a visible **traffic light**: green (clinically signed off), amber (awaiting
approval), red (in development). Guides built from a single approved Trust policy are restructured
from that policy without interpretation, and the source policy is linked from the guide so the reader
can always reach the original.

---

## D. What wardHub does NOT have

This section is deliberate. These are the gaps a supplier assurance process would find, stated here
so nobody has to find them.

### D1. There is no user authentication

Access is controlled by **one shared site password**, with no user accounts, no email verification
and no multi-factor authentication. The identity picker on the login screen selects which fictional
demonstration user you would like to be; it does not authenticate anyone.

Roles exist (staff, lead, manager, ward admin, senior admin) but they **control the user interface
only**. There is no server-side authorisation, because there is no server-side state to protect. A
user could change their own role in their browser.

**This is appropriate for a fictional-data demonstration and is not appropriate for real data.**
NHSmail single sign-on / Entra ID is the required next step and a request has been raised.

### D2. There is no database and no audit trail

Nothing is stored server-side. Supabase is installed as a dependency but is **dormant** - there is not
a single database query anywhere in the application. Ward jobs exist only in the browser tab you are
looking at.

Consequence that must be stated in any report produced from wardHub: it can only ever be **a record
of jobs logged in wardHub, not a complete record of ward activity.** Work done but not logged will
read as work not done.

### D3. Data residency is not yet confirmed

Hosting is on Vercel. **The hosting region has not been confirmed and no claim of UK data residency
should be made until it has been.** This is an open item.

### D4. No independent security testing

No penetration test has been carried out. No CHECK-scheme test, no vulnerability scan beyond
dependency auditing. Dependencies are monitored and patched; around twenty low and moderate
advisories remain, all vendored inside the framework and awaiting upstream fixes.

### D5. Medical device classification is not settled

**wardHub has not been classified under the UK medical devices regime, and no claim either way should
be made.** The question was raised at the sponsor meeting on 30 July and referred for assessment. The
Trust's Clinical Safety Officer, not the author, is the person who can close it.

The design position while it is open: **no calculation, no interpretation of clinical data, and the
source policy always visible** so the clinician reads the original and makes the decision.

Note that under MHRA guidance a manufacturer's own statement is not determinative, and general
disclaimers do not help if claims are made elsewhere. This is why the sheet does not claim it.

### D6. Release process

The `main` branch has no branch protection and the site deploys automatically from it, so a failing
test does not block a release. Improving this is a known item.

### D7. Content review is incomplete

Of 68 guides, **1 is signed off green, 47 are amber, 20 are red.** Fifteen conflicts between guide
content and current Trust policy are open and recorded. No guide should be relied on clinically until
its shelf owner has signed it off. The list of guides and proposed sign-off owners has been provided
to the Head of Nursing.

---

## E. The governance documents that exist

Held in the repository as the single source of truth and rendered in the application's developer panel:

| Document | Status |
|---|---|
| DCB0129 hazard log (wardHub-HL-003 v0.3, 27 hazards) | Draft. Judgements beyond the author's competence are explicitly marked as requiring a Clinical Safety Officer decision |
| Clinical risk management plan | Draft. **A claim that wardHub is not a medical device was withdrawn from it** as unassessed |
| Safety case report | Draft |
| DPIA | Draft |
| Data flow diagram | Draft |
| Governance audit | Draft |

All are drafts authored by a registered nurse, not by a qualified clinical safety officer, and all
require Trust review.

---

## F. Answers to the questions actually asked on 30 July

**"Is there a per-use cost for the AI?"**
No. The running application makes no AI calls. There is no usage-based cost of any kind.

**"Is the AI free for a reason - do you pay through the data?"**
The development tooling is a paid subscription funded personally by the author, and its commercial
terms exclude training on customer inputs and outputs. The terms can be provided. Separately, and
more importantly: no patient data reaches any AI system at runtime, because the application makes no
AI calls.

**"Could this bleed into decision support?"**
That is the right question and it is open. See D5. The boundary being held is no calculation, no
interpretation, source policy always visible. Setting the parameters formally is the requested action
and it needs the Clinical Safety Officer.

**"Who keeps the content up to date?"**
Not resolved by software, and it should not be. Each guide gets a named shelf owner from the existing
policy ownership structure, and the traffic light shows the reader where a guide stands. Guides built
from a single approved policy link to that policy so the reader can always check the source.

**"What happens if Mike leaves?"**
The Trust can hold a complete copy of the source code and is licensed to run and modify it
independently, with no dependence on the author's continued involvement.

---

## G. What a supplier assurance process would ask for next

Recorded here so the gap is visible rather than discovered later. wardHub currently has the last item
only.

Cyber Essentials Plus · ISO 27001 · Data Security and Protection Toolkit · named UK data residency ·
annual CHECK-scheme penetration test · multi-factor authentication and Entra ID · defined support
response times · documented data export on exit · DTAC pack · DCB0129 safety case signed by a
qualified Clinical Safety Officer · **WCAG 2.1 AA**.

---

*Prepared by Michael Sharpe. Claims verified against the codebase on 2 August 2026. This sheet
describes a demonstration build holding fictional data only.*
