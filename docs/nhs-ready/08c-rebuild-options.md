# wardHub rebuild options for the trust

> Rebuild pack, part 3 of 3. Written 4 July 2026. This one is opinionated on purpose:
> it compares the realistic deployment paths and recommends one. Facts about the code
> (what is server-side, what would break) were checked against the repo, not assumed.

## The one fact that shapes everything

wardHub has almost no server. There are no API routes, no database calls, no auth
backend. The only server-side code is `src/proxy.ts` (a Next.js middleware doing
redirects for the collapsed v1/v2 split) and the security headers in
`next.config.ts`. Everything else - all 60+ pages - is client-side JavaScript over
static TypeScript data files.

Two consequences:

- Hosting it is trivially easy. It will run anywhere that can serve files.
- The current build stores nothing server-side, so today's governance surface is
  "a website plus the user's own browser". The moment the trust wants the diary to
  actually share tasks between staff, a backend appears and the governance surface
  changes. Plan for that fork in the road now, not later.

## Option A: keep Next.js, host on trust infrastructure or NHS-assured cloud

Run the existing codebase as-is (Node server or container) on trust infra, or on an
NHS-assured cloud tenancy (e.g. the trust's Azure UK tenancy; the app currently runs
happily on Vercel, which is the thing governance will want gone).

- **Effort: 1-2 developer-weeks.** Containerise (`next build` + `next start`, or the
  standalone output), stand up CI from the trust's Git host, move DNS, re-point the
  deploy. No code changes required. Add ~1 week if the trust wants SSO bolted on at
  the reverse proxy (the app itself has no auth to integrate - a header-based
  identity shim would slot into the existing user provider).
- **What is lost: nothing.** Every feature works, including the proxy split (so the
  limited/full experiment can be revived with one flag).
- **What governance it simplifies:** removes the third-party host (Vercel) from the
  DPIA, puts request logs inside the trust boundary, and lets the site sit behind the
  firewall or an SSO gate. The "no data leaves the device" claim becomes "no data
  leaves the trust".
- **What it keeps open:** the upgrade path. When patient-identifying features get
  approval, you add a database and API routes to the same codebase - the Supabase
  client is already wired and deliberately dormant, and the DPIA groundwork
  (docs/nhs-ready/) is written against this architecture.

## Option B: static export behind the firewall

Export the site to plain HTML/JS/CSS (`output: "export"`) and serve it from any
intranet web server - IIS, nginx, even a SharePoint-adjacent file host. No Node, no
runtime, no patching surface beyond a folder of files.

I checked what actually blocks this, because the app is fully client-side except the
proxy:

- **`src/proxy.ts` is not supported in a static export** (Next middleware needs a
  server). With `COLLAPSED_FOR_DEMO = true` the proxy only does redirects, so losing
  it costs: old `/v2/*` links stop redirecting (they 404), the `/password` redirect
  goes, and - the one that matters - **the parked `/welcome` tool becomes reachable
  again**, because only the proxy blocks it. Fix: delete the `/welcome` route (the
  code stays in git) before exporting. The other legacy redirects (`/bookmarks`,
  `/how-to`, `/referrals`) survive, because in-app client/server redirect stubs exist
  for them - though the server-side `redirect()` stubs need converting to client
  stubs for export.
- **Dynamic routes need `generateStaticParams`**: `/guides/[id]` and
  `/patient-guides/[id]`. Both id sets are fully known at build time (they come from
  the data files), so this is a few lines each.
- **`headers()` in next.config does not apply to an export** - the CSP and security
  headers move to the web server config instead. Straightforward on IIS/nginx.
- **Permanently lost while static:** the v1/v2 split (needs the middleware) and any
  future server feature. A static export can never do shared diaries, logins or
  SystmOne integration. Everything the site does today keeps working, because today
  it all runs in the browser anyway.
- **Effort: 0.5-1 developer-week** for the export changes above, plus whatever the
  trust's intranet publishing process costs.
- **Governance simplification: the biggest of any option.** No server-side
  processing at all, no host processor in the DPIA, unpatchable-server class risks
  gone. It is the easiest possible thing for IG to say yes to.

## Option C: rebuild in another stack

If trust standards mandate a different platform (.NET, Java, a different frontend),
the honest assessment:

- **What carries over cleanly: the data.** Everything in 08b tagged CONTENT - 64
  guides, 17 workflows with their typed step model, 113 links, 364 quiz questions,
  109 services, 29 leaflets, the approval-status model - is plain TypeScript/JSON
  data with documented shapes. A day of scripting turns it into SQL inserts or CMS
  imports. The clinical wording, which is the part that took months and needs
  sign-off, moves without loss.
- **What carries over as a spec, not code:** the type definitions
  (`src/lib/types/index.ts` is effectively a reviewed schema for tasks, patients,
  roles), the workflow step-type vocabulary, the approval traffic-light model, and
  the NHS theme tokens.
- **What has to be rebuilt by hand:** the unified guide viewer with its per-step-type
  UI, the 11 bespoke interactive tools (risk wizard, MSE and care-plan builders,
  checklists, MHA checker), the diary/kanban, the service-map SVG, and the theme
  system. That is where the effort lives.
- **Effort: 8-16 developer-weeks** to reach feature parity for the content side
  (guides, links, quiz, map) in a new stack; more like 16-24 including the diary and
  patient features done properly against real backends. Assume a multiple of that if
  the team is also learning the clinical domain.
- **Governance:** no simpler than option A - you still have an app to assure, plus a
  long rebuild during which the working product sits idle. Only worth it if platform
  policy forces it.

## Option D: SharePoint or intranet pages fallback

Paste the guide content into FOCUS/SharePoint pages.

- **What survives:** the read-only text of guides and links. That is genuinely worth
  something - the content is the value - and 08b tells you exactly which files hold
  it.
- **What dies: every interactive part**, which is most of what makes staff actually
  use it. The referral workflows stop being guided step-throughs with area filtering
  and copy-to-notes case notes; the risk wizard, MSE and care-plan builders, the MHA
  checker and the checklists become static text; the diary, kanban, patient list,
  quiz and service map simply do not exist in this world. You also lose the approval
  traffic lights, search, and the single-source data model - content forks into
  hand-edited pages that drift.
- **Effort: 2-4 weeks** of content porting and formatting, recurring forever as
  content maintenance.
- **Governance:** trivially easy (it is the intranet), which is exactly why it is
  tempting and exactly why it should be resisted as an endpoint. Acceptable only as
  an interim signposting layer that links to the real app.

## Recommendation

**Do option A: keep Next.js and move the hosting inside the trust boundary (trust
infra or the trust's NHS-assured cloud tenancy).** Reasoning:

1. It is the only option that costs almost nothing now AND keeps the roadmap alive.
   The product's endgame - a shared ward diary, editor workflows, SystmOne/Nexus
   integration - needs a backend. Option B can never get there and option C spends
   months rebuilding what already works.
2. The codebase is unusually easy to assure: one middleware file of server code, a
   CSP locked to self, no external requests, fonts self-hosted, a dormant database
   client that is provably out of the bundle. An assurance review has a small,
   readable surface.
3. The governance work already done (DPIA draft, hazard log, data-flow diagram in
   docs/nhs-ready/) describes this architecture. Changing stack invalidates it.

If IG wants an even smaller first step, **option B is a fine interim**: ship the
static export to the intranet this month (half a week of changes), let staff use the
guides and builders behind the firewall, and treat option A as phase 2 when the
diary needs to become real. A into B is not a fork - it is the same codebase with a
flag and a build target - so nothing is wasted by starting with B.

Do not choose C unless platform policy forces it. Do not accept D as anything more
than signposting.

## The reassurance line

Whatever path the trust picks - including ones not on this list - the part that
matters survives. The clinical content is not trapped in the app: the 64 guides, 17
referral workflows, 113 links, 364 quiz questions, 109-service directory, 29 patient
leaflets and the sign-off status of every one of them are plain, typed data files
(section-by-section inventory in 08b) that can be exported to a database, a CMS or a
document pack in a day. The app is a shell around that data. Rebuild the shell as
many times as you like; the ward knowledge inside it is portable and permanent.
