# Trust Policy Conflict Audit — DHCFT / wardHub

> **Audit date:** 2 July 2026
> **Auditor:** Claude Code (research-only pass, no code or policy files changed)
> **Corpus:** 19 FOCUS policy/SOP extracts in `E:\Hub\tmp-mha\`, 4 safeguarding SOP Word docs in `docs\data dump from work to sort\Safeguarding updater 2026\`, and the wardHub app guide content in `src\lib\data\guides\`.
> **Method:** four parallel deep-reads (MHA detention cluster, MHA community/leave/rights cluster, clinical + safeguarding SOPs, app-vs-policy clash), plus direct verification of the highest-stakes items.

---

## Headline

The policies are broadly sound and the wardHub app encodes them accurately. However the audit found **two expired/overdue policies, one safety-relevant self-contradiction, several cross-policy mismatches, and one live app-vs-policy clash.** Items are ranked by severity: 🔴 high (safety/legal/expired), 🟠 medium, 🟡 low/cosmetic.

Two working lists are given at the end:
- **List 1 — Policy defects to raise with the Trust** (regardless of whether the app uses them).
- **List 2 — Project fixes for the dev chat.**

---

## A. Currency & governance (expired / overdue / missing metadata)

| Policy | Issue | Review date | Status |
|---|---|---|---|
| 🔴 **S62 Urgent Treatment** | Aug 2022 v03 | Jul 2025 → RAM-extended to *Dec 2025* | **EXPIRED ~7 months.** Even the extension has lapsed. Safety-critical (emergency treatment of detained patients). `urgent-treatment-s62.txt:28-31` |
| 🔴 **Missing & Absent (AWOL / RCRP)** | Jun 2025 v02 | **Jun 2026** | **OVERDUE ~1 month.** `awol.txt:37-39` |
| 🟠 **CPA** | May 2023 v06 | Oct 2026 | On its **stated maximum extension** ("cannot extend again") — needs full re-ratification within ~3 months; governs a framework (CPA) NHS England has been retiring since the 2019 Community MH Framework / July 2021 position statement. `cpa.txt:65` |
| 🟠 **Joint S135/136** | Sep 2023 v03 | **Sep 2026** | Due for review in ~2 months — and carries substantive errors (see B3, C1). `s135-136.txt` |
| 🟡 **Scheme of Delegation** | **Oct 2025** | Mar 2028 | Metadata oddity: **ratified 21 Mar 2025, i.e. 7 months *before* its Oct 2025 issue date.** Likely a version-control carryover — worth a query. `scheme-of-delegation.txt:18,26` |
| ⚠️ **Transfer-in SOP**, **DAMA form**, **care-plan/risk guide**, **all 4 safeguarding SOPs** | — | — | **No governance block at all** (no version, issue date, review date, or ratifying committee). Cannot be assured as current/approved documents. |

**In date, but note:** the Observations policy (Feb 2025 v10, review Feb 2028) is current — but its **06/10/2025 minor amendment specifically updated the "Review Schedule for Observations" section, yet left the Level 3 contradiction (B1) unfixed.** The section most recently touched still self-contradicts.

Also in date: S4 (Mar 2025, review Mar 2028), S5(2) (Sep 2024 v06, review Sep 2027), S17 Leave (Mar 2025 v10, review Mar 2028), S132 Rights (Mar 2025 v6, review Mar 2028), Tribunal (Sep 2025 v04, review Sep 2028), CTO (Jun 2024 v06, review Jun 2027).

---

## B. Internal contradictions (a single policy disagreeing with itself)

### B1. 🔴 Observations — Level 3 (Intermittent) review interval stated as BOTH 24h and 72h (four times)
- §5: "reviewed **as a minimum every 72 hours**" — `observations-policy.txt:296`
- §6.2: "must be **formally reviewed every 24 hours**" — `:353`
- Appendix 3 contradicts *itself in one box* — label "**Every 24 hours**" over body text "must be formal reviewed **every 72 hours**" — `:640-644`
- **Impact:** a nurse following §6.2 reviews Level 3 twice as often as one following §5. Flagship known conflict, confirmed still live. The app resolved it to 72h (see D2).

### B2. 🟠 Observations — 72-hour escalation review names two different sets of senior roles
- §6.1: "**Head of Nursing, Area Service Manager or Matron**" — `:339`
- Appendix 3: "**Divisional Nurse, Nurse Consultant or Deputy/Associate Director of Nursing**" — `:655,666`
- (Related, minor) escalation-of-disagreement route also differs: §4.8 names "Matron/Head of Nursing and/or Area Service Manager" `:246` vs §6.1 "Head of Nursing/Nurse Consultant and/or Area Service Manager" `:347`.

### B3. 🔴 S135/136 — the s135(1) escape-retake window is described two conflicting ways
- `:393` ties retake to a detention period "extended up to a **maximum period of 36 hours**".
- `:507` correctly states s138(3): retakeable only during liability or "**the 24 hours** starting with the time they escaped, whichever expires first" (extendable +12h). The line-393 framing conflates the place-of-safety extension with the escape clock.

### B4. 🟡 S135/136 — broken appendix cross-references
Body cites "Appendices **5–8**" `:454` and mismatched appendix numbers `:278,299`, but the appendix index only runs to Appendix 5.

### B5. 🟡 Observations — broken cross-reference
Appendix 1 footnote points to "Section 6.10 for more detail" `:604`, but §6 stops at 6.3 (rehab provision is actually §4.11).

### B6. 🟡 CPA — review frequency stated two ways
"at least **annually**" `:237` vs "recommended… every **9 months**" `:423`.

---

## C. Cross-policy conflicts

### C1. 🟠 Stale unit name — "Hartington Unit" vs "Derwent Unit"
The S5(2) policy records the rename (Hartington → Derwent, `s52.txt:96`) and uses "Derwent" in its body, but the **S135/136 form still lists "Hartington Unit" as a place of safety** `s136-form.txt:21`. The form is out of date.

### C2. 🟠 CTO 6-monthly rights re-read — "recommended" vs "must"
CTO policy: "**recommended**… every 6 months" `cto.txt:442`; S132 policy: the team "**must** ensure a further explanation… every 6 months" `s132-rights.txt:284`.

### C3. 🟠 Who obtains the S135(2) warrant differs
CTO policy: "responsibility of the **Care Co-ordinator or community care team**" `cto.txt:589`; S17 Leave policy: "responsibility of the **hospital**" `s17-leave.txt:222`. Context differs (community vs ward AWOL) but a front-line reader could be misled about who acts.

### C4. 🟠 Tribunal report deadlines use different anchors/numbers
Tribunal policy: "**within 3 weeks of the date of application**" `tribunal-mht.txt:168`; CTO managers'-hearing: reports "**at least 4 weeks prior to the section expiry date**" `cto.txt:985`. Different triggers, but both govern overlapping reports and invite error.

### C5. 🟡 S17 ">7-day → consider CTO" trigger worded differently
"more than 7 days **and each subsequent 7-day period**" `cto.txt:222` vs "more than seven **consecutive** days **in total**" `s17-leave.txt:186`.

### C6. 🟡 Role/name inconsistencies for the same person
Arun Chidambaram is "**MHA Lead**" in `s132-rights.txt:325` but "**Medical Director**" in cto/s17/tribunal. Email typo a personal nhs.net address with a "chrstine" typo `s132-rights.txt:322` vs correct the correct spelling elsewhere (same typo also in `s4.txt:240`); address held outside the repo.

### C7. 🟡 Observations Appendix 3 cites legacy "FACE Risk Assessment"
`:634` still says "FACE Risk Assessment/Safety Plan" while the policy body and the care-plan/risk guide use the current "Risk Screen / Risk Management Plan / Safety Plan" terminology.

### Safeguarding SOP cluster (the 4 Word docs)

### C8. 🟠 City/County referral routing exists in only 1 of 4 docs
Only `Safeguarding referrals info.docx` gives the actual local-authority routes:
- **County:** Call Derbyshire **01629 533190** (Mon–Fri 8am–8pm, Sat 9:30am–4pm); out-of-hours **01629 532600**; form at derbyshiresab.org.uk.
- **Derby City:** Safeguarding Adults Team **01332 642855** / **AdultsMASH@derby.gov.uk** / e-form myaccount.derby.gov.uk.

The other three docs (including "Making a good safeguarding referral") route staff only to the internal DHCFT advice line **01332 623730 opt 1** and never say where the referral actually goes. A nurse using only that doc would not know the City-vs-County routes.

### C9. 🟡 "MASH" used to mean two different bodies
The internal DHCFT advice inbox (the internal DHCFT safeguarding advice inbox) in two docs, vs the Derby City council MASH (`AdultsMASH@derby.gov.uk`) in another — risk of mis-routing.

### C10. 🟡 Domestic-abuse terminology currency
The DA-recognition SOP references "CAADA-DASH" (pre-2014 branding; now "SafeLives Dash"). No numeric DASH tick-count / MARAC threshold is stated in the text.

---

## D. Project (wardHub) clashes

### D1. ✅ IMHA provider for Derby City — RESOLVED (Mike, 3 Jul 2026)
- **App:** Derby City = **Disability Direct (DDA)**, 01332 299449 — `src/lib/data/guides/referral-workflows.ts:106-128`
- **Live S132 policy (Mar 2025):** Derby City = "**One Advocacy Derby – 01332 228748**" — `s132-rights.txt:203`

**Resolution:** Disability Direct is the source of truth; One Advocacy Derby is no longer used. The app is correct. The only outstanding action is at source — the S132 trust policy PDF still names One Advocacy Derby and needs the MHA office to update it. County (Cloverleaf, 01924 454875) matches on both sides.

### D2. ℹ️ Observation Level 3 — app is defensible, policy is the defect
The app uses **72h** (`src/lib/data/guides/observation.ts:26,113`), matching the policy body/appendix quick-reference. The policy's own **24h** figure (B1) is the internal defect, not the app. The app's in-code comment already acknowledges the self-contradiction. Feed B1 back to the policy owners.

### D3. 🟡 Soft imprecision
`mha-statuses` (howto-guides.ts:625) says S4's single recommendation is "ideally from a doctor who knows the patient" — the S4 policy does not state that preference (prior acquaintance is a S2/S3 value). Harmless but slightly imprecise.

### Everything else the app encodes checks out against current policy
Verified correct with no clash: S4 (72h; forms A10/A9 + A11 → H3; 24h "seen within" / 24h "admit within"; convert-to-S2 rules), S5(2)/5(4) (H1 receipt, no Part-4 treatment → MCA, cannot renew), CTO recall (72h from CTO4, transfer allowed within 72h via CTO6, CTO5 revocation, S62 only post-revocation), S62 applicability, S2/S3 scrutiny timings, S132 (24h + reminder cadence), S17 (applies to 2/3/37/47 only, RC-only, >7-day CTO trigger), S136 (24h + 12h), AWOL/RCRP (Absent-vs-Missing, no security team, S18/S135(2)), tribunal (3 weeks / 48h for S2), DAMA (mirrors the Trust form), and the full statutory forms register (H1–H4, A2–A11, CTO3/4). No wrong time limits or holding powers found.

---

## E. Data-safety observations (for the demo / no-PII rule)

- `awol.txt:274-302` contains **real security-team direct dials and mobiles** (numbers redacted from this committed copy - see the source extract). Acceptable in the source docs, but must not surface in the public demo.
- `transfer-in.txt:7` references the live "**291 bleep** holder out of hours" — an internal identifier to keep out of the demo.
- Reminder: `docs/` holds raw FOCUS dumps with real internal contacts — purge/gitignore before any public release (tracked separately as snag 148).

---

## List 1 — Policy defects to raise with the Trust

1. 🔴 **Re-ratify S62 Urgent Treatment** — expired since Dec 2025 (RAM extension lapsed).
2. 🔴 **Review Missing & Absent (AWOL)** — review date Jun 2026, now overdue.
3. 🔴 **Fix Observations Level 3 review interval** — decide 24h *or* 72h and make §5, §6.2 and Appendix 3 agree (B1).
4. 🔴 **Fix the S135/136 "36 hours" escape wording** to the correct s138(3) 24h (+12h) rule (B3).
5. 🟠 **Reissue the S135/136 form** — "Hartington Unit" → "Derwent Unit" and add a governance block (C1).
6. 🟠 **Re-ratify CPA before Oct 2026** (on maximum extension) and decide its future given national CPA retirement (A).
7. 🟠 **Harmonise the Observations 72h-escalation role list** (§6.1 vs Appendix 3) (B2).
8. 🟠 **Reconcile CTO "recommended" vs S132 "must"** 6-monthly rights re-read (C2).
9. 🟠 **Reconcile tribunal 3-week vs CTO 4-week** report deadlines / clarify the cross-reference (C4).
10. 🟠 **Clarify who obtains the S135(2) warrant** across CTO and S17 policies (C3).
11. 🟠 **Add City/County routing to all safeguarding SOPs**, not just one; disambiguate "MASH" (C8, C9).
12. 🟡 **Query the Scheme of Delegation** ratification-before-issue dates (A).
13. 🟡 **Add governance blocks** to transfer-in, DAMA, care-plan/risk guide and the 4 safeguarding SOPs.
14. 🟡 **Tidy** the S135/136 appendix cross-references (B4), the Observations "§6.10" reference (B5), CPA annual-vs-9-month (B6), the name/title/email inconsistencies (C6), the legacy "FACE Risk Assessment" wording (C7), and "CAADA-DASH" → "SafeLives Dash" (C10).

## List 2 — Project fixes for the dev chat

1. ✅ **D1 — IMHA Derby City provider:** RESOLVED (Mike, 3 Jul 2026) - Disability Direct is the source of truth (One Advocacy Derby no longer used); app is correct. Only outstanding action is the MHA office updating the S132 policy PDF at source. County (Cloverleaf) already matches.
2. 🟡 **D3 — mha-statuses S4 wording:** drop or soften "ideally from a doctor who knows the patient" (not in the S4 policy).
3. ℹ️ **D2 — Observation Level 3:** no change needed; the app's 72h is correct. Keep the in-code comment flagging the policy self-contradiction until the policy is fixed.
4. ⚠️ Pre-launch: confirm no real internal numbers (AWOL security lines, "291 bleep") leak into the public build; keep `docs/` FOCUS dumps out of any public repo.

---

## Addendum - 25 July 2026

### D5 - DCC S117 flowchart: misleading "even if admitted on S2, informal or S3" line (RESOLVED in app)

- **Source:** `E:\Hub\temp\CARE ACT AND S117 REFERRAL PROCESS NEW.pptx` (Derby City Council MH Social Care, supplied 26 Feb 2026) states: *"S117 meetings MUST be conducted even if patient was admitted on S2, informal or S3."*
- **Intended meaning (Mike's reading, 25 Jul 2026, agreed):** the line sits AFTER the flowchart's START gate ("Is the patient under section 3? Or have they been on a S3 in this or previous admission?"), so it means: for a patient who already holds S117 entitlement from a previous Section 3, do not skip the S117 meeting just because the CURRENT admission is informal or S2 - S117 status survives readmission and only ends when the ICB and Local Authority jointly end it. Legally sound.
- **Problem:** read in isolation (the flowchart is printed and displayed on wards), the line implies EVERY S2/informal patient gets a S117 aftercare meeting - they do not; only patients with a qualifying section (s3/37/45A/47/48) in this or any previous admission. It also conflates the S117 aftercare meeting with the discharge planning meeting every patient gets. The app briefly imported the wrong reading verbatim ("MUST take place regardless of section", Feb 2026 - Jul 2026).
- **App fix (25 Jul 2026, two passes):** the s117-meeting and social-care guides in `referral-workflows.ts` now spell out both halves - the two-meetings distinction, AND that S117 entitlement can come from a previous admission and survives informal/S2 readmission. A code comment above the criteria step explains the flowchart line so it doesn't get re-imported either way.
- **To raise with DCC (optional):** suggest rewording the poster line, e.g. "A patient with existing S117 status still needs their S117 meeting even if this admission was informal or under S2."

*All findings are drawn directly from the quoted source extracts; nothing is inferred beyond the text. File:line references point to the extracts in `E:\Hub\tmp-mha\` and the app source under `E:\Hub\inpatient-hub\src\`.*
