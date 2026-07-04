# wardHub data governance audit

> Prompt 1 of the NHS-ready pack. Run 4 Jul 2026, four parallel sweeps over src/, the git
> repo, and the live site. Read-only - fixes are listed at the end and applied by Prompt 2.
> Raw sweep outputs behind this summary are in the session scratchpad; everything material
> is in this file.

## The one-paragraph verdict

The "no real patient data" claim holds up: demo patients and staff are fictional, nothing
the user types is sent to any server, there is no analytics or tracking of any kind, and
the quiz and builder tools genuinely store nothing. The problems are around the edges: the
full raw trust-docs dump (~110 MB) is still downloadable from GitHub history even though
the files were deleted; six raw FOCUS harvest files with named staff and one personal
mobile number are tracked in the repo right now; one real internal phone extension renders
live in a guide, breaking the project's own rule; and the privacy copy makes two claims
("no external transmission", "all contacts are for demonstration only") that the code
contradicts. All of it is fixable, most of it this week.

## Data map - what the app stores and where

Everything the user enters stays in the browser. There is no server-side storage at all in
the demo build. Two external parties receive data automatically on every page view: Google
(one font file request, which carries the visitor's IP and user agent) and Vercel (the
host, which logs requests like any host does).

### Browser localStorage (device-local, unencrypted, no expiry)

| What | Keys | PII risk |
|---|---|---|
| Login identity (picked from dropdowns, no free text) | `wardhub_user` | Medium - staff name/role/ward |
| Referral chase log | `wardhub-referral-logs` | **High - holds patient name, patient id and free-text notes by design, and survives logout** |
| Care review tracker | `wardhub_care_tracker_v2` | Medium - dates keyed by patient id (demo ids today) |
| Feedback board posts/comments | `wardhub_feedback`, `feedback_user_id`, `feedback_username` | Medium-high - free text could contain patient details |
| Personal links + recommendations | `wardhub-personal-bookmarks`, `wardhub-bookmark-recommendations` | Medium - free text and arbitrary URLs |
| Preferences, flags, content config | ~15 further keys (theme, diary view, guide order, tour flags, verification map, editor link overrides) | Low |

Notable good news: diary/task data, the biggest free-text surface, is in-memory only and
wiped on refresh. The Welcome tool and all guide builders store nothing. The GDPR page's
"clear my data" button genuinely wipes everything (`localStorage.clear()`).

Notable gap: **logout clears only the login keys.** Referral logs, feedback and the care
tracker survive logout on a shared ward computer.

### Data leaving the app boundary

| Channel | What | Assessment |
|---|---|---|
| Clipboard (the copy-to-SystmOne mechanism) | Case notes prepend the linked patient's name ([guides/[id]/page.tsx:200](../../src/app/guides/[id]/page.tsx)); risk/MSE/care-plan builders copy clinician-typed narrative | By design, but Windows clipboard history (Win+V) and cloud clipboard sync can persist/sync it. Needs a line in the DPIA and "paste then clear" user guidance |
| Google Fonts | Lora loaded at runtime from fonts.googleapis.com in [layout.tsx:45](../../src/app/layout.tsx) and again via CSS @import inside public/patient-guides.html | The only genuine third-party data flow. Source Sans 3 is already self-hosted via next/font in the same file, so the fix pattern exists |
| Vercel | Hosting; request logs, IPs, edge caching | Inherent; must be named as a processor in the DPIA. No Vercel Analytics installed |
| Supabase | Client instantiated in the bundle with URL + anon key, but **zero queries anywhere in src** | Dormant. Splitting the type exports from client.ts would remove it from the bundle entirely |
| Everything else | No sessionStorage, no cookies in use (one dead legacy cookie-clearing route), no analytics, no external scripts or iframes, no IndexedDB | Clean |

## Findings, ordered by how badly each lands in front of an IG officer

1. **The raw trust-docs dump is still downloadable from GitHub.** `docs/data dump from
   work to sort/` (~110 MB, 118 files: real referral forms, seclusion guides, safeguarding
   packs, tribunal templates) was in the repo from the first commit (26 Jan) until deleted
   27 Jun. Deleting in a commit does not remove it from history - anyone with access to
   Sharpy20/hub-alpha can retrieve every file today. Only a history rewrite + force push
   fixes this. Bonus: it shrinks clones from 117 MB to ~7 MB.
2. **Six raw FOCUS harvest files are tracked right now**: `docs/focus-data-collection/
   session-1..6` contain named staff, internal extensions, personal nhs.net addresses and
   one personal mobile number (the safeguarding named lead's). Same class of material the
   gitignore rule was created for.
3. **One real internal contact renders live in the demo UI.** "01332 623700 ext 33333"
   (MHA Office) appears in visible step content of the Adult Social Care (Derby City)
   workflow (referral-workflows.ts:552, 591) - the same number is correctly hidden at
   bookmarks/index.ts:672. Also minor: "the 291 bleep holder" in a guide (howto-guides.ts:817).
4. **Two tracked docs repeat internal numbers despite saying they shouldn't**:
   `docs/policy-conflict-audit-02-Jul-2026.md` (the committed "redacted" copy still holds
   both AMHP direct dials, named staff and a personal email) and
   `docs/homework-04-Jul-2026-dump.md` (AMHP dials printed alongside "keep OUT of live").
5. **Privacy copy contradicts the code in two places.** The GDPR page and FAQ claim "no
   data is sent to external servers" - false while the Lora font loads from Google. The
   GDPR modal claims "all phone numbers and contacts are for demonstration only" - false
   and dangerous the other way, since Samaritans, IMHA providers and MASH numbers are real
   and meant to be used.
6. **Stale privacy copy.** The GDPR page still describes the removed Light/Medium/Max
   version system, OpenAthens plans, and the old "FOCUS login needed" badge label. The
   dev-panel DPIA names the trust as Data Controller, which the trust has not agreed to,
   and asserts an unverified "Supabase UK region".
7. **Personal data in code comments beyond the agreed pattern.** The hidden-in-demo
   comment inventory (21 blocks, ~30 values, complete list held in the fix plan) is
   deliberate and fine while the repo is private, but three items go further than
   trust-internal numbers: a named individual's personal nhs.net email
   (bookmarks/index.ts:1116), a named telecoms manager with direct dial (:1052), and a
   bare mobile number for the Derby City consultation line (:484).
8. **Seven fabricated referral addresses use the real nhs.net domain** (picu.referrals@
   nhs.net etc, referral-workflows.ts) and display as live submission contacts. Later
   workflows correctly use @example.nhs.net. A real referral sent to a guessed-at address
   is the failure mode; harmonise on @example.nhs.net.
9. **Patient-name persistence that survives logout** (`wardhub-referral-logs`, plus
   free-text feedback and personal links). Demo-safe today; the DPIA for any real-data
   build must treat this store as a patient record, and logout should arguably clear it.
10. **The footer names the trust on an unapproved public site.** Reads as endorsement.
    Recommend "Built for use at Derbyshire Healthcare NHS Foundation Trust - not yet
    trust-approved" or similar until sign-off.
11. **CSP allows any HTTPS host** (`connect-src https:`, `img-src https:`). Tightening to
    'self' once the font is self-hosted turns "no data leaves" from an assertion into a
    technically enforced guarantee - a strong DPIA line.
12. Housekeeping: dead `site_access` cookie route + logout fetch; pointless
    `fetch("/guides")` in admin/workflows; inconsistent localStorage key naming (wardhub_
    vs wardhub- vs unprefixed); legacy inpatient_hub_* migration keys; stock
    create-next-app README; `.vercel-trigger` junk file; `docs/clinical-safety/files.zip`
    duplicating adjacent docx; superseded Project-Review-v1/2/3 and old homework docs;
    old vercel.app domain hardcoded in patient-guides.html; commit message c372f21
    references "DafttvLive/ToDo repo" (history rewrite only).

Identity check that comes out clean: all 339 commits are authored by Sharpy20 (10 early
ones used the nhs.net email), zero DafttvLive commits, no author field in package.json,
and no .env, key or credential was ever committed.

## Fix list

### Needs Mike's decision (not applied by Prompt 2)

- **F1. History rewrite + force push** to purge the docs dump (finding 1), ideally also
  removing the focus-data-collection files from history, mapping the 10 nhs.net-authored
  commits to the noreply address, and scrubbing the DafttvLive commit message. This is
  destructive (force push, anyone's old clones diverge) so it is Mike's call. After the
  rewrite: delete any stale clones and ask GitHub support to drop cached views. Until
  then, treat the private repo as containing the full dump.
- **F2. Trust-name wording** in the footer and the "Data Controller" line in the
  dev-panel DPIA: agree the honest interim wording.

### Applied by Prompt 2 (fix pass) - ALL DONE 4 Jul except noted, browser-verified

- F3. Hide the live MHA Office extension at referral-workflows.ts:552,591 (use the
  hidden-in-demo pattern) and reword the bleep-291 reference.
- F4. Change the seven fake @nhs.net submission addresses to @example.nhs.net.
- F5. Move `docs/focus-data-collection/` out of the repo to E:\Hub\temp\, gitignore the
  path (removes from HEAD; history needs F1).
- F6. Redact the AMHP dials, personal emails and named individuals from the two tracked
  docs in finding 4 (full values already live in E:\Hub\temp\ source files).
- F7. Move the three beyond-pattern comment items (Kelly Sims email, Rob Mason direct
  dial, the bare consultation-line mobile) out of src comments into
  E:\Hub\temp\internal-contacts.md.
- F8. Self-host Lora via next/font and remove the @import from patient-guides.html; then
  tighten CSP connect-src/img-src.
- F9. Correct the privacy copy: "no external transmission" wording (gdpr page, FAQ,
  dev-panel), the modal's "demonstration only" claim, the stale Light/Medium/Max and
  FOCUS-badge references, and add: named processors (Vercel, none-after-F8), a contact
  route, a last-reviewed date, and a note that Supabase is configured but unused.
- F10. DONE as: logout now clears `wardhub-referral-logs` + `wardhub_care_tracker_v2`
  (the two patient-identifying stores). Feedback board deliberately persists - it is a
  community board holding staff free text, not patient records, and wiping it on every
  logout would empty the demo. GDPR page documents this.
- F11. Delete stale files: Project-Review-v1/2/3, processed homework docs (01-03 Jul),
  clinical-safety/files.zip, .vercel-trigger. Rewrite README for a trust audience.
- F12. Remove the dead site_access route + logout fetch and the no-op fetch("/guides");
  split Supabase types from client instantiation so the dormant client leaves the bundle.

### For the DPIA (Prompt 3 inputs)

- Processors: Vercel (hosting, request logs); Google Fonts until F8 lands; Supabase
  configured-but-unused; GitHub (private repo, including history until F1).
- Clipboard pathway: patient name + narrative to OS clipboard; Win+V history and cloud
  clipboard sync; mitigation is user guidance.
- The strong lines: no accounts, no tracking, nothing user-entered leaves the device,
  storage clearable in one click, CSP-enforced after F8, and the existing
  docs/clinical-safety/ DCB0129 set (Hazard Log, CRMP, CSCR) already started - Prompt 3
  builds on those, not from scratch.
