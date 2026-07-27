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

DATA-HEAVY SAFETY NET (check before writing): if the source is data heavy - a long policy, many sections, lots of tables, numbers or worked examples - do not write the guide straight away. First ask the user: "This source is data heavy. Would you like a standard guide (5 to 9 short steps), a more comprehensive guide, or both?" and wait for the answer. Standard = the format above. Comprehensive = Template C below. Both = produce the standard guide first, then Template C.

TEMPLATE C - Explainer / Learning guide (use only when the user chooses comprehensive): same header block as Template A but GUIDE TYPE: Explainer / Learning Guide. Up to 15 steps, and longer bodies are allowed where the content earns it. Keep every worked example from the source with its numbers, clearly labelled as an example. Add a glossary step near the end (one line per term) and a common-questions step (3 to 6 real questions a nurse would ask, each answered in plain English). Include a case note only if the topic genuinely touches the patient record - otherwise leave it out. All Style Rules, the [CHECK] rule, the BOOKMARKS FOUND harvest and REVIEWER NOTES still apply.

STRUCTURE FOR PROGRESSIVE DISCLOSURE (applies to every template): wardHub collapses long steps into click-to-open sections automatically, but only if you write to the shape it looks for. A header line is a SHORT label on its own line ending in a colon, 70 characters or fewer, not a bullet - for example "Signs to look for:". Put bullets underneath it, each starting with "- ". Anything written before the first header stays permanently visible, so put the "why you are reading this" sentence there. A step needs TWO OR MORE headers to become collapsible; if a step covers one idea, leave it as plain prose and do not invent headers to force the feature. CRITICAL: a line that applies to the WHOLE step - above all an emergency line such as "If a child is in immediate danger, call 999." - must be the LAST line of the step, after the final header's bullets. Written there it stays visible; written anywhere else it gets filed under whatever header came before it and hidden behind a click. Never bury a 999 line, a legal deadline, or a safety warning under a header.

DECISION FLOW (add one whenever a "who qualifies", "does this apply", "which level is this" or "meets criteria" section is really a DECISION rather than a description): do not write the rules as prose and leave the nurse to apply them to their patient. After the step, add a block in exactly this format and wardHub renders it as a clickable flowchart:
DECISION FLOW:
ATTACH TO SECTION: (exact header text it sits under, without the colon)
BUTTON: (short label, e.g. "Does my patient qualify?")
TITLE: (the question the whole flow answers)
Q1: (one short line, answerable yes or no)
HELP: (what counts and what does not - all the detail goes here, never in the question)
YES -> OUTCOME: <name>  or  -> Q2
NO -> Q2  or  -> OUTCOME: <name>
NOT SURE -> OUTCOME: <name>
Q2: (same shape)
OUTCOME <name>: TONE: yes | no | unsure / SHORT: (2 to 4 words for the flowchart box, e.g. "S117 applies") / TITLE: / DETAIL: / ACTIONS: (bullets - what to do next)

DECISION FLOW RULES: keep it to two or three questions - more than that and prose was the right answer after all. Every question must be answerable yes or no by someone holding the notes. The question is a box on a diagram, so it must fit on one line; the qualifying detail belongs in HELP. Ask about what HAS HAPPENED, not what is true at this moment, wherever a status can lapse or be rescinded - "has the patient been detained under Section 3 at any point during this admission" is right, "is the patient on Section 3 now" is wrong, because the section may have been rescinded and the patient may be informal by the time anyone plans the discharge. Every question needs a NOT SURE route pointing at an outcome that tells the nurse where to go and check: an unknown must never be allowed to read as a no.

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

## What a LONG step should look like (so it collapses properly)

When a step has to carry a lot, the header-and-bullets shape is what turns it into click-to-open sections in wardHub. Note where the 999 line goes - last, on its own, after everything else:

```
3. TITLE: Signs and what to do
   BODY:
   Abuse rarely arrives as a disclosure. Most of the time you notice a pattern first.

   Physical signs:
   - Injuries that do not match the explanation
   - Repeat attendances for minor injury

   Behavioural signs:
   - Withdrawal, or a partner who answers for them
   - Reluctance to go home before a visit

   If the person is in immediate danger, call 999.
```

Two headers, so it collapses. The opening line stays visible as the intro. The 999 line sits at the very end, so it stays visible too - had it been written under "Behavioural signs" it would be hidden until someone clicked.

## What a DECISION FLOW looks like

Use one where a section is really "does this apply to my patient", not a description. This is the live S117 one:

```
DECISION FLOW:
ATTACH TO SECTION: Who qualifies
BUTTON: Does my patient qualify?
TITLE: Does my patient qualify for S117 aftercare?
Q1: Has the patient been detained under Section 3 at ANY point during this admission?
HELP: It counts even if the section has since been rescinded and they are informal now.
  Sections 37, 45A, 47 and 48 count too, including 37/41 and 47/49. Section 2, Section 4
  and the holding powers do not create the duty on their own.
YES -> OUTCOME: applies
NO -> Q2
NOT SURE -> OUTCOME: check-section
Q2: Was the patient detained under Section 3 in a PREVIOUS admission?
HELP: Any earlier admission counts, however long ago - entitlement survives readmission.
YES -> OUTCOME: still-applies
NO -> OUTCOME: no-duty
NOT SURE -> OUTCOME: check-history
OUTCOME applies: TONE: yes / SHORT: S117 applies / TITLE: ... / DETAIL: ... / ACTIONS: ...
OUTCOME no-duty: TONE: no / SHORT: No S117 duty / TITLE: ... / DETAIL: ... / ACTIONS: ...
OUTCOME check-history: TONE: unsure / SHORT: Check the history / TITLE: ... / DETAIL: ... / ACTIONS: ...
```

Two things to copy from that. The questions ask what **has happened**, not what is true right now - a rescinded section still counts, and asking "is the patient on Section 3 now" would send exactly the wrong patient down the no-duty branch. And every question has a NOT SURE route, so an unknown history can never quietly read as a no.

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
- **Long steps came back as one block of prose:** tell it "break the long steps into short header lines ending in a colon with bullets underneath, so they collapse in wardHub".
- **It buried a 999 or safety line under a header:** tell it "move any line that applies to the whole step to the very end, after the last set of bullets".
- **A "who qualifies" section is still prose:** tell it "turn that section into a DECISION FLOW block".
- **A decision-flow question asks about right now:** tell it "ask whether it has EVER happened during the admission, not whether it is true today - the status may have been rescinded".
