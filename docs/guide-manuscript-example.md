# Worked example: imha-advocacy.md in the new format

**This is the real IMHA guide content**, taken from `E:\Hub\guide-manuscripts\imha-advocacy.md`
and reshaped into the format in `guide-manuscript-format.md`. Nothing has been invented.

> **The citations are the point of this example.** The existing manuscript has none, because
> nothing has ever required them. Every place a source quote is needed and missing is marked
> `NEEDS SOURCE` below. That is not a flaw in the example, it is what backfilling one guide
> actually looks like, and it is the honest answer to open question 4 in the format doc.
>
> Do not treat any quote here as verified. There are none.

---

```markdown
---
guide_id: imha-advocacy
title: IMHA / Advocacy
category: Legal & Advocacy
guide_type: step-by-step
summary: Independent Mental Health Advocate for all patients, informal and detained.

content_version: 1
status: draft
review_due: 2027-09-08

sources:
  - id: s132-pol
    title: Section 132 Rights Policy
    version: NEEDS SOURCE
    dated: NEEDS SOURCE
    held: Trust Policy Library
  - id: mha-cop
    title: MHA Code of Practice
    version: "2015"
    dated: 2015-04
    held: national

last_source_check: never
---

# IMHA / Advocacy

Independent Mental Health Advocate for all patients, informal and detained.

## 1. Confirm criteria

All patients have the right to access an Independent Mental Health Advocate, whether informal
or detained under the Mental Health Act.[^s132-pol]

Detained patients include those under Section 2, Section 3, Section 4, Section 5(2) or 5(4),
CTO (Section 17A), Section 37, Section 37/41, or Section 47/49.[^mha-cop]

Informal patients are not detained but still have access to advocacy services.[^s132-pol]

- [ ] I confirm the patient meets criteria for IMHA referral

[^s132-pol]: NEEDS SOURCE - quote from the Section 132 Rights Policy confirming IMHA access
for informal and detained patients.
[^mha-cop]: NEEDS SOURCE - quote listing the sections that qualify.

## 2. Patient consent

Have you asked the patient if they consent to an IMHA referral? This is asked on the referral
form, so this step is a reminder rather than a gate.

| Choice | Meaning |
|---|---|
| Patient consents | I have asked and the patient consents to IMHA referral |
| Patient does not consent | Patient has declined or cannot give consent. The referral can still proceed |

## 3. Legal status

What is the patient's current legal status under the Mental Health Act?

## 4. Select area

Which area is the patient from? This determines which advocacy service to use.

| Choice | Service | Form | Contact |
|---|---|---|---|
| Derby City | Disability Direct | DDA IMHA Referral Form 2026 | info@disabilitydirect.com / 01332 299449 |
| Derbyshire County | Cloverleaf | Cloverleaf online referral | referrals@cloverleaf-advocacy.co.uk / 01924 454875 |

## 5. Download forms and guides

Download the form for the area selected above.

**Blank forms**

- [Derby City IMHA Referral Form (Disability Direct)](https://disabilitydirect.com/wp-content/uploads/2026/01/DDA-IMHA-Referral-Form-2026.docx)
- [Derbyshire County IMHA Referral (Cloverleaf, online)](https://cloverleaf-advocacy.co.uk/referrals/)

**Worked examples**

- IMHA Referral Example (WAGOLL). Example only, do not submit. Link not yet wired.
```

---

## What this example tells you

**A reviewer can read it.** That was the test. The branching is a table, the claims are prose,
and the citations sit at the bottom of each section the way a person expects. Nobody has to
understand the format to check the content.

**The branch parses cleanly.** Step 4 has a `Choice` column, so it is a route. Step 3 has a
heading and no table, so it is linear. No other rule was needed for the guide with the most
branching in the library, which is a decent sign the rule is enough.

**The contacts are all public**, so they are inlined rather than referenced. Disability Direct
and Cloverleaf are both publishable. If this guide carried an internal extension it would
appear as `{{contact:...}}` instead.

**Three citations are missing on the first step alone.** That is the real cost of backfilling,
and it is worth seeing on the guide you know best before deciding whether to backfill 68 of
them or apply this to new and edited guides only.

**`status: draft` and `last_source_check: never` are correct here**, not pessimistic. The
content exists and has never been checked against a source document. Saying so is the format
working as intended.
