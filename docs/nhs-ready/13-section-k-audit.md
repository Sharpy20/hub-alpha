# Section K audit: what trust-sourced material is still in the repo

**Run 27 July 2026.** The first of the Claude-side Section K tasks (BACKLOG Section K):
manifest every tracked trust-sourced file and every real internal contact value held in
code, so the purge can happen against a list rather than a guess.

Read-only. Nothing was deleted. Two items below need Mike's decision before anything is.

---

## Headline

**The repo is in better shape than the plan assumed.** The raw FOCUS and policy dumps are
already gone - untracked, gitignored, moved to `E:\Hub\temp\`, and purged from history by the
6 July rewrite. Of 41 tracked files under `docs/`, every one is a Claude-authored governance,
homework or evaluation document. No trust document, policy or harvest file is tracked.

What is left is narrower than expected: **four blank forms in `public/`** and **33 real
internal contact values sitting in source comments**.

**One thing had to be fixed before the purge could safely run** - see finding D.

---

## A. Tracked trust-sourced files: none

`git ls-files docs/` returns 41 files: BACKLOG, the `nhs-ready/` evidence pack, clinical-safety
DCB0129 documents, evaluations, homework docs, the quiz question bank, the business case and the
quick-start guide. All written for wardHub, none lifted from the Trust.

The two gitignore rules that matter still hold and the directories they cover no longer exist
locally under `docs/`:

```
docs/data dump from work to sort/     # snag 148
docs/focus-data-collection/           # raw FOCUS harvests
```

**No action.**

## B. Four blank forms in `public/` - MIKE'S CALL

| File | What it is |
|---|---|
| `public/police-capacity-form.html` | Capacity Request (Police) - blank |
| `public/informal-admission-agreement.html` | Informal Inpatient Admission Questionnaire - blank |
| `public/abc-chart-blank.html` | ABC chart - blank |
| `public/abc-wagoll.html` | ABC chart - completed example |

Checked for exposure: **no trust branding, no logo, no internal contacts, no patient data.**
They reproduce the *wording and structure* of trust-approved forms, which is deliberate - the
rule is that trust forms use exact wording and we add around them rather than altering them.

So the question is not a leak risk, it is an ownership one: is it acceptable for the Trust's
form wording to sit in a private GitHub repo and be served from a public (password-gated) site?

**Decision needed:** keep as-is, or pull them and serve them through the SharePoint pipeline
once it exists. My read is keep - they carry nothing identifying, and pulling them breaks the
"Printable forms" blocks in four guides before Thursday.

## C. 33 real internal contact values in source comments

The Rule-4 pattern: the UI shows "Hidden in demo mode" and the real value sits in a comment
on the line above.

| File | Values |
|---|---|
| `src/lib/data/bookmarks/index.ts` | 27 |
| `src/lib/data/guides/referral-workflows.ts` | 5 |
| `src/lib/data/guides/howto-guides.ts` | 1 |

They include internal extensions, `@nhs.net` team inboxes, named pharmacy and safeguarding
staff, and both AMHP direct dials. This is the remaining exposure in the repo, and it is the
purge target.

**Nothing renders live.** Spot-checked the two findings from the 6 July governance audit that
said otherwise - the MHA Office extension at `referral-workflows.ts:552` and `:592`, and the
"291 bleep" in `howto-guides.ts` - both now display "Hidden in demo mode" with the value in a
comment. Fixed as intended.

## D. The purge safety net was incomplete - now rebuilt

**This is the finding that mattered.** The plan says the comment values can be stripped because
they are "already preserved in `E:\Hub\temp\..._CONTACTS-INVENTORY.md`, outside repo".

That file does not exist. `E:\Hub\temp\internal-contacts.md` does, but it held **three** values -
the ones escalated on 4 July for going beyond the hidden-in-demo pattern - plus two doc
redactions. Stripping the comments against that file would have destroyed 30 of the 33 values,
recoverable only from git history, which is the other thing Section K is purging.

**Fixed:** `E:\Hub\temp\internal-contacts.md` has been rebuilt as a complete inventory - all 33
code-comment values with file, line and which bookmark or workflow step they belong to, plus the
earlier escalated and doc-redaction sections preserved. Outside the repo, as it must be.

The purge can now run safely.

## E. History

The 6 July rewrite (finding F1) purged the FOCUS dumps; backup bundle at
`E:\Hub\backup-hub-alpha-pre-rewrite-06Jul2026.bundle`. Nothing trust-sourced has been committed
since - the only additions to `docs/` are Claude-authored.

The comment values in finding C **are** in history in earlier commits of the three files named.
Stripping them from HEAD does not remove them from the repository. Whether that needs a second
rewrite is a judgement call: these are internal switchboard extensions and team inboxes in a
**private** repo, not patient data. My read is that it does not justify a second history rewrite
before Thursday, but it should be stated plainly rather than left implied if anyone asks where
the repo stands.

---

## What happens next

| Step | Status |
|---|---|
| Rebuild the contacts inventory outside the repo | **Done** (finding D) |
| Decide on the four blank forms | **Needs Mike** (finding B) |
| Strip the 33 comment values from source | Ready to run - safe now the inventory is complete |
| Second history rewrite for the comment values | **Needs Mike** - my read is no (finding E) |
| Mini publish pipeline build | Not started - the remaining big Section K item |

The strip is mechanical and reversible through git. It is not done yet because those comments
are also working notes - once they are gone, the only place the numbers exist is the inventory
file and the Trust's own systems. Say the word and it runs.
