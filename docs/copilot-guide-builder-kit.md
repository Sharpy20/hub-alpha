# wardHub Guide Builder - Copilot Kit

**Take this to work. Use it with Microsoft 365 Copilot (full version). No Claude needed.**

It turns a trust policy or SOP into a draft ward guide in wardHub's format, and harvests any useful contacts/links at the same time. You bring the output home, we drop it into the site.

---

## What you need

- A policy, SOP, email, or any document you want turned into a guide (open it in Word, or have the text ready to paste).
- Microsoft 365 Copilot - the **full** version (the trial one in the sidebar of Word / Edge / Teams). The basic "Rewrite" tool inside Office is not enough.

## How to use it (3 steps)

1. Open Copilot. If your document is a Word file, open it and tell Copilot to use it (or just paste the text in).
2. Copy **the whole prompt block below** (everything between the two lines) and paste it into Copilot. Add the document if you have not already.
3. When Copilot replies, **copy the entire reply** and save it - paste into a blank Word doc, or email it to yourself. That is what you bring home.

That is it. Do not worry about the format looking technical - the layout is what lets us slot it straight into the site.

---

## THE PROMPT (copy everything between the lines)

------------------------------------------------------------

You are helping convert a document into a structured "ward guide" for **wardHub**, a staff intranet app used by nurses on mental-health inpatient wards at Derbyshire Healthcare NHS Foundation Trust.

I will give you a policy, SOP, or note. Read all of it, then produce a guide using the exact format below.

**First, decide the guide TYPE:**
- **A - How-To / Clinical Guide:** explains how to do something or understand something (e.g. NEWS2 observations, reading a patient their rights, a piece of law, a ward procedure).
- **B - Referral Workflow:** a step-by-step process to refer a patient to a service or complete a formal pathway (e.g. IMHA referral, safeguarding referral, housing duty to refer).

State the type and one line of reasoning, then produce the matching template.

**Rules - follow all of these:**
- Write for a busy ward nurse. Short, plain, punchy sentences. UK spelling.
- **No em dashes anywhere.** Use hyphens or brackets.
- If the document gives the **exact wording of an official form field or legal phrase, keep it word for word.** Do not paraphrase official wording.
- **Never invent a phone number, email, URL, or fact.** If something is needed but not in the document, write `[CHECK]` in its place.
- No patient-identifiable information. If you need an example name, use an obviously fictional one.
- Trust-internal / switchboard numbers: include them but tag `[INTERNAL - hidden in demo]`.
- Aim for **5 to 9 steps**. Each step has a short title and a short body. Add a "Tip" line only where it genuinely helps. Do not pad.

---

**TEMPLATE A - How-To / Clinical Guide** (use only if type A)

```
GUIDE TYPE: How-To / Clinical Guide
TITLE:
CATEGORY: (pick the closest from: Nurse Tools, Medics Tools, OT Tools, Physical Health,
  Observations, Emergency Response, MHA & Legal, Legal & Advocacy, Restrictive Practice,
  Safeguarding, Social & Housing, Urgent Care, Allied Health, Specialist Pathways,
  Ward Procedures, Clinical Assessment, Admin, Learning & Development)
ICON: (one emoji that fits)
DESCRIPTION: (one sentence, what the guide is for)

STEPS:
1. TITLE:
   BODY:
   TIP: (optional)
2. TITLE:
   BODY:
   TIP: (optional)
(continue for all steps)

CASE NOTE (optional - a block the nurse can copy into the patient record):
(write it with [PLACEHOLDERS] the nurse fills in, and use [DATE] where today's date goes)

SYSTMONE / FOCUS LINKS (any trust-system how-to or policy the doc points to):
- label | URL or [CHECK]

RELATED GUIDES (other wardHub guides worth linking):
- name
```

---

**TEMPLATE B - Referral Workflow** (use only if type B - this is the standard 8-step wardHub flow)

```
GUIDE TYPE: Referral Workflow
TITLE:
CATEGORY: (as above)
ICON: (one emoji)
DESCRIPTION: (one sentence)

STEP 1 - CRITERIA:
   CONTENT: (who this referral is for / when to use it)
   CHECKBOX LABEL: "I confirm ..."

STEP 2 - CONSENT (only if consent is relevant):
   QUESTION:
   YES LABEL / NO LABEL:

STEP 3 - FORMS:
   BLANK FORM: label | URL or [CHECK]
   EXAMPLE (WAGOLL), if any: label | URL or [CHECK]

STEP 4 - RELATED GUIDES & LINKS:
   - name or URL

STEP 5 - SUBMISSION (where the referral goes):
   EMAIL: or [CHECK]
   PHONE: or [CHECK] or [INTERNAL - hidden in demo]
   PORTAL / WEBSITE: or [CHECK]
   INSTRUCTIONS:

STEP 6 - CASE NOTE (copy into patient record):
   (text with [PLACEHOLDERS] and [DATE])

STEP 7 - DIARY REMINDER:
   (one line - what to mark done in the ward diary)

STEP 8 - GDPR TIP:
   (one line - e.g. delete the completed form from your computer when done)

BRANCHES (only if the pathway changes by area or legal status):
   AREA: does it differ for Derby City vs Derbyshire County? If so, give each one's forms/contacts.
   LEGAL STATUS: does it differ by MHA section vs informal? If so, note how.
```

---

**AFTER the guide, always add these two sections:**

```
BOOKMARKS FOUND (every contact, service, or link in the document - even if not used above):
- Title | URL or [CHECK] | Phone or [INTERNAL - hidden in demo] | Email | Needs FOCUS login? yes/no | Category | One-line description

REVIEWER NOTES (be honest here):
- Anything you had to guess
- Every [CHECK] you left and what is needed to fill it
- Anything in the document that seemed out of date, contradictory, or unclear
```

Do not add anything outside this structure. If the document is thin, produce a shorter guide rather than padding it, and say so in Reviewer Notes.

------------------------------------------------------------

## If you only want the bookmarks

Some documents are just a list of services, not a guide. To pull only the useful links out, paste this shorter prompt instead:

------------------------------------------------------------

Read this document and list every service, contact, phone number, email, and web link in it, for a nurse's quick-links directory. For each one give:

Title | URL or [CHECK] | Phone (tag trust-internal numbers as [INTERNAL - hidden in demo]) | Email | Needs FOCUS/intranet login? yes/no | Category | One-line description of when a nurse would use it

Do not invent anything. If a detail is missing, write [CHECK]. No patient-identifiable information.

------------------------------------------------------------

## What "good" looks like (worked mini-example)

If you fed in a short smoke-free ward policy, a good Copilot reply would start like this:

```
GUIDE TYPE: How-To / Clinical Guide
Reasoning: it explains a ward rule and what staff must do, not a referral pathway.

TITLE: Smoke-Free Ward - Your Legal Duty
CATEGORY: Restrictive Practice
ICON: 🚭
DESCRIPTION: Why smoking on the ward is a staff accountability issue and exactly what to do when you see it.

STEPS:
1. TITLE: The bottom line
   BODY: The whole trust is smoke-free. Allowing or ignoring smoking on NHS premises
   breaches UK law and trust policy, and the accountability sits with staff, not only
   the patient. If you see it and do nothing, you are accountable.
   TIP: See it, act on it, record it - do not leave it for the next shift.

2. TITLE: What to do when you see it
   BODY: Three things, every time. 1) Intervene - explain the policy, ask them to stop,
   remove the smoking materials and any ignition source. 2) Escalate - tell the nurse in
   charge. 3) Datix - complete an incident report. Record it on SystmOne.
   TIP: Removing the lighter matters as much as stopping the cigarette - the ignition
   source is the fire risk.

CASE NOTE:
Smoking incident on [DATE] at [TIME]. [PATIENT] observed [smoking / in possession of
materials] in [LOCATION]. Action: intervened, explained the policy, removed [ITEM] and
held for return on discharge. Escalated to nurse in charge. Datix completed. Recorded by [NURSE].

SYSTMONE / FOCUS LINKS:
- Trust Fire Safety and Smoke-Free Policy | [CHECK]

BOOKMARKS FOUND:
- (none in this document)

REVIEWER NOTES:
- I left the policy link as [CHECK] - the document referenced it but gave no URL.
```

That is exactly the shape we want. Titles, short bodies, honest [CHECK]s, a copyable case note, and the bookmarks pulled out.

## Bring home

- Copy Copilot's **whole** reply.
- Save it: paste into a blank Word doc, or email it to yourself, or drop it on a USB.
- Bring it home and we build the live guide from it - and I will build my own version from the same source document so we can compare which reads better.

## Quick troubleshooting

- **Reply is too long / cut off:** ask Copilot "continue from where you stopped".
- **Reply is vague or padded:** tell it "shorter, plainer, fewer steps - write for a busy nurse".
- **It paraphrased an official form:** tell it "keep the exact wording of the form fields, do not reword them".
- **It made up a phone number or link:** tell it "replace anything you are not certain came from the document with [CHECK]".
- **It ignored the format:** paste the prompt again on its own first, then the document.
