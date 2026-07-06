# wardHub 10-minute demo script

> Prompt 10 of the NHS-ready pack. Written 6 July 2026 and rehearsed for real: every stop
> below was clicked through on the app (same code as live), and the live deploy was checked
> for /about and /guides on the day. Run it against https://www.wardhub.live.

## Setup, five minutes before you start

- Open the site in a **fresh private/incognito window**, or clear localStorage first
  (F12 > Application > Local Storage > right-click > Clear). This does two things: the
  GDPR notice pops for the room to see, and the site signs you in as a fictional Byron
  ward staff member automatically. No login screen to fumble.
- Check the profile menu (top right, "Demo Mode") says a Byron ward name with the Staff
  role. If it picked another ward, switch it there.
- Know your IMHA answers in advance so the referral flows: consent = yes,
  legal status = **Section 3**, area = **Derby City**. Derby City is the better pick
  because the provider, email and phone number that appear are all real and public.
- Quiz plan: topic **Mental Health Act & Legal**, **5 questions**. Skim the first two
  questions beforehand so you are not reading them cold.
- Have the Team Diary page glanced at: today's column should have at least one
  unclaimed task (the fridge temperature check is reliably there).
- Phone or tablet in your pocket with the site open, in case someone asks "does it work
  on mobile". It does; show them rather than telling them.

Timings below add up to about nine and a half minutes, which leaves you slack.

## The click path

### Stop 1 - Home (1 min)

**Click:** nothing yet. When the GDPR notice appears, read its first line out loud, then
click **I Understand**.

**Say:** "Before you see anything, the site tells you what it is: fictional data only, a
demo, not for clinical use. That honesty is baked in everywhere, you'll see it again.
This is the home page - quick links for the ward, arranged how a nurse actually reaches
for them: crisis numbers first."

**Wow beat:** the Quick Links wheel. Click the arrow once so a new category swings in,
then point at the safeguarding section lower down: "999 strip, referral routes, and a
'help me decide' flow for the 3am moments."

### Stop 2 - The IMHA referral, end to end (2.5 min)

**Click:** Guides in the top nav, then the **IMHA / Advocacy Referral** card. Walk the
steps with the Next arrow: tick the criteria box, pick **Patient Consents**, pick
**Section 3 (Treatment)**, pick **Derby City**, pause on the forms step, then the
submission step, then stop dead on **Case Note Entry**.

**Say:** "This is the heart of it. Nine steps, and you can't skip ahead - criteria first,
consent second, because that's the order the referral form asks for them. Watch what it
does with my answers." On the forms step: "Some links say 'blocked in demo' - that's
deliberate. Anything not yet verified is labelled, not left to fail." On submission:
"Derby City means Disability Direct - real provider, real email, real phone number."

**Wow beat:** the case note step. Read it out: provider, email, today's date, the section
status and the staff name are all filled in from the choices just made. Click
**Copy to Clipboard**. "The case note wrote itself. Paste it into SystmOne and the
documentation is done. That's ten minutes of hunting and typing gone from every referral."
Click Next twice through the follow-up and GDPR steps to show it even reminds you to
delete the downloaded form.

### Stop 3 - Guides index (1 min)

**Click:** Back to Guides (top left of the guide).

**Say:** "Sixty-four of these, one per process - MHA paperwork, safeguarding, seclusion,
discharge. But look at the corner of each card."

**Wow beat:** the traffic lights. "Every guide carries its approval status on its face:
green passed, amber awaiting review, red in development. Right now exactly one is green,
because I can write content but I can't sign it off - that's the trust's job, and the
site says so rather than pretending. Nothing here fakes authority it doesn't have."
Optionally tap **Ctrl+K** and type "seclusion" to show search finding it instantly.

### Stop 4 - Quiz (1.5 min)

**Click:** More menu > Quiz. Pick **Mental Health Act & Legal**, set questions to **5**,
click **Start**. Answer two questions - get one wrong on purpose if you can.

**Say:** "Quiet night shift, an HCA wants to sharpen up. 364 questions, and none of it is
tracked or scored - no logins, nothing sent anywhere, nobody ever knows you got one wrong."

**Wow beat:** the answer screen. "Every single answer comes back with the reasoning and
the source - NICE, the BNF, the MHA Code of Practice. It's not trivia, it's referenced
revision."

### Stop 5 - Service map (1 min)

**Click:** More menu > Service Map. Click **Jordan, 34 (County)** under "Load a sample".

**Say:** "A hundred and nine local services - crisis, housing, addiction, advocacy -
mapped with their real referral criteria. Set the patient's situation and watch which
doors are open." Scroll-zoom once so the room sees it move.

**Wow beat:** the paths updating live as the profile changes. "Discharge planning
usually means knowing whose criteria the patient fits. This shows you."

### Stop 6 - Team diary (1 min)

**Click:** Diary in the top nav. Find today's column, click **Claim** on the fridge
temperature check (or any unclaimed task).

**Say:** "The ward's jobs, one shared screen, so handover isn't a paper list. I claim a
task, my name goes on it instantly, and everyone can see it's covered - and if I go off
sick, someone can take it over."

**Wow beat:** the name appearing on the tile the moment you click. Mention, don't
demonstrate: "All fictional patients - poets' names for the wards, made-up staff."

### Stop 7 - About and governance (1.5 min)

**Click:** the **About & Governance** link in the footer (or More menu > About).

**Say:** "This page exists because I knew what you'd ask. Where does the data live? In
the browser, on the device, and nowhere else - no accounts, no tracking, no cookies, and
the site's security policy physically blocks it from talking to any other server, so
that's enforced, not promised. And it says, in plain sight: not yet trust-approved,
treat it as a demo."

**Wow beat:** the live traffic-light counts. "These numbers - one passed, forty-seven
awaiting review, sixteen in development - are computed from the same data the guide
badges use. The site audits itself in public."

### Stop 8 - Close on the tour (30 sec)

**Click:** the tour button in the header (next to the logo). Let the first screen appear:
"Your ward's go-to guide."

**Say:** "There's a built-in two-minute tour, so you don't need me. It's live at
wardhub.live right now, on any device - try it on your phone in the lift on the way
out. What I need from you is on the one-pager: an IG contact, one ward, and a decision
path for hosting."

Leave the one-pager on the table. Stop talking.

## If they ask X, say Y

**Where does the data live?**
"On the device, in the browser, full stop. There is no server, no database, no accounts
and no analytics - the data governance audit confirmed nothing typed ever leaves the
machine, and the site's content security policy blocks outbound connections so it can't
change quietly. Even the fonts are self-hosted; a page view makes zero third-party
requests."

**What if the content goes out of date?**
"That's what the traffic lights are for. Every guide has a status - passed, awaiting
review, in development - held in one central file, and the About page publishes the live
counts. There's a 'report a problem' link on every guide, and a content sweep already
inventoried every one of the 289 external links so dead ones get caught. Stale content
gets flagged amber, not silently trusted."

**Who checked the clinical content?**
"It's built from the trust's own policies, and most guides link straight to the source
document on FOCUS so staff can verify. But honestly: one guide has passed review, and
the rest are marked amber or red on their face. Nobody has signed them off because
there's been nobody to sign them off - that review is exactly what I'm asking the trust
for. The quiz is different: all 364 questions already carry a source, NICE, BNF, NMC,
the MHA Code."

**What about SystmOne?**
"Deliberately not connected. wardHub never touches patient records - the case notes it
writes are copy-and-paste by design, so the clinical record stays in SystmOne where it
belongs. Integration is a possible later phase, on trust infrastructure with trust
approval, and the architecture pack already sketches what that would need."

**What does it cost?**
"So far, nothing - built in my own time, hosted on a free tier. The rebuild options
paper costs the realistic path at roughly one to two developer-weeks to move the same
app inside the trust boundary. No licences, no per-seat fees; the content is ours."

**Who maintains it when you're on shift?**
"Right now, me, which is exactly the single-point-of-failure a pilot should test. The
content is structured data - not code - so trust editors can own it without a developer,
and the plan includes editor roles with senior sign-off. Part of the ask is agreeing
where maintenance should live long-term."

**What happens if you leave?**
"The trust loses nothing. Every piece of content - 64 guides, 113 links, the quiz, the
service map - is plain structured data, and the rebuild pack documents it line by line
with a migration mapping. Its own words: the content survives any rebuild. Move it to a
database, a CMS, or keep the app; the accumulated ward knowledge is portable either way."

**Is it accessible?**
"Audited against WCAG 2.1 AA with axe-core and manual keyboard testing across the main
pages, light and dark mode, desktop and mobile widths - zero automated A or AA
violations on every audited page, and there's a written conformance statement including
the honest exceptions, like some low-traffic admin modals. The full report is in the
pack."

**Why should we trust a side project?**
"Don't trust it - review it. That's the point of the pack: a data governance audit with
its fixes applied, a DPIA draft in ICO structure, a DCB0129-style hazard log, a security
review that found nothing high-severity, an accessibility statement and a rebuild plan.
A side project built like it expects inspection is a different thing from a spreadsheet
under someone's login. And the app never claims approval it doesn't have - it labels
itself a demo on its own About page."

## What changed against the planned path

Verified by walking every stop in the running app on 6 July 2026, plus live checks of
wardhub.live/about and /guides:

- **No login step needed.** Clearing localStorage auto-signs you in as a fictional Byron
  staff member and pops the GDPR notice, so the demo opens clean without a login detour.
  Setup notes reflect that.
- **You cannot jump between referral steps.** The step tabs stay locked until earlier
  steps are done, so the script walks the Next button in order - which is actually the
  better story ("it won't let you skip consent").
- **Forms step shows "blocked in demo" badges** on the example form and one info link.
  Rather than route around it, the script turns it into the honesty beat - unverified
  links are labelled, not broken.
- **Diary demo data is sparse on past days** (empty columns early in the week). The
  script keeps the claim on today's column, where the recurring fridge check reliably
  sits.
- Minor niggle spotted, not blocking: the quiz topic list says "1 questions" for the
  single-question Nutrition topic. Don't linger there; worth a one-line fix some time.
