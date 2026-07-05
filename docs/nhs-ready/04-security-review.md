# wardHub security review

> Prompt 4 of the NHS-ready pack. Run 4 Jul 2026 against the code at E:\Hub\inpatient-hub
> and the live site at https://www.wardhub.live. Read-only review - no code was changed.
> Builds on the data governance audit (01-data-governance-audit.md); items that audit
> already covers (repo history, localStorage retention, privacy copy) are not repeated here.

## Scope and method

Four areas: (1) a full XSS and injection sweep of every place user input or a URL
parameter is rendered; (2) dependency audit (npm audit, interpreted); (3) the security
headers actually served by the live site right now; (4) an honest account of the
authentication position and what a live trust deployment needs. Plus anything material
spotted in passing (open redirects, localStorage parsing, window.open, print windows).

Context that shapes the whole review: the demo has **no server side at all**. There are
zero API routes under src/app/api (the dead logout route is gone), no database queries,
no cookies, and nothing user-entered leaves the browser. The attack surface is therefore
the client bundle itself, third-party dependencies, and the headers Vercel serves.

## Verified: the fix pass landed, and it is already live

All four fixes from the governance audit were checked rather than re-recommended:

| Fix | Evidence |
|---|---|
| CSP locked to 'self' | next.config.ts:14-22 (`default-src 'self'`, `connect-src 'self'`, `img-src 'self' data:`, `font-src 'self'`, `frame-ancestors 'none'`) |
| CSP deployed | The live site served the new CSP header on 4 Jul 2026 19:51 UTC - no deploy lag |
| Fonts self-hosted | src/app/layout.tsx:2 imports Source_Sans_3 and Lora via next/font (downloaded at build, served same-origin); no fonts.googleapis reference remains in src |
| Dead /api/auth/logout removed | Glob of src/app/api/**/route.ts returns nothing - the app has no API routes at all |
| Supabase client out of the bundle | The client lives only in src/lib/supabase/client.ts, deliberately excluded from the barrel export; a repo-wide grep finds zero importers, so it is tree-shaken out |

## Findings, ordered by severity

There are no high-severity findings. One medium, three low, and a set of informational
observations.

### Medium

**M1. Personal link URLs are never validated, so a `javascript:` URL becomes a stored
script sink.** Anyone can add a personal link with an arbitrary URL string:

- Save path: the add/edit modal accepts any non-empty string
  (src/app/links/page.tsx:516-517, plain text input at :565-568) and
  `addPersonalBookmark` stores it verbatim (src/app/ward-settings-provider.tsx:141-148).
  No scheme check anywhere.
- Open paths: the stored URL goes straight into `window.open(url, "_blank")` at
  src/app/links/page.tsx:222 (personal card click), :99 and :105 (bookmark click and
  FOCUS modal continue - these also serve personal links surfaced via My Favourites,
  see the `personalToBookmark` mapping at :78-79), and
  src/components/bookmarks/bookmark-carousel.tsx:34 (home wheel, which includes the
  My Personal category).

`window.open("javascript:...")` executes the script in a window that inherits the
opener's origin, and the CSP does not stop it because `script-src` carries
`'unsafe-inline'` (see L1). The same applies to the recommend-for-everyone flow: an
approved recommendation becomes a Bookmark with the unvalidated URL
(ward-settings-provider.tsx:174-194).

Honest impact assessment: in the demo this is **self-XSS only** - personal links and
recommendations live in the attacker's own localStorage on their own device, so the only
person they can attack is themselves. It is not remotely exploitable today. It becomes a
genuine stored XSS the day links are shared between users (the planned Supabase backend,
or an admin approving another user's recommendation on a shared build). Fix now while it
is one function: allowlist `http:` and `https:` at save time and again at open time,
and reject everything else. Not urgent, but it should land before any shared storage does.

### Low

**L1. CSP `script-src` includes `'unsafe-inline'` and `'unsafe-eval'`**
(next.config.ts:16). Next.js needs inline scripts for hydration unless a nonce-based CSP
is wired up, so `'unsafe-inline'` is a known framework trade-off. `'unsafe-eval'` is
usually only needed in dev; it is worth testing a production build without it. Practical
effect: the otherwise-strong CSP does not currently block inline script injection, which
is why M1 matters more than it otherwise would. For the live build, move to a nonce-based
CSP (Next.js supports this via middleware-generated nonces) and drop both keywords.

**L2. `window.open` calls without `noopener` allow reverse tabnabbing.** The opened page
receives `window.opener` and can navigate the wardHub tab to a look-alike page while the
user's back is turned:

- src/components/bookmarks/bookmark-carousel.tsx:34
- src/app/links/page.tsx:99, :105, :222

The global search already does it right - `window.open(r.url, "_blank",
"noopener,noreferrer")` at src/components/layout/global-search.tsx:90 - so the fix is
copying that third argument to the other four call sites. Low because almost all link
targets are static, curated NHS/charity sites; it matters most for the same personal-link
URLs as M1.

**L3. npm audit: 4 findings (1 low, 3 moderate), of which one is real-ish and none are
runtime-exploitable.** Run on 4 Jul 2026 against next 16.2.9 / react 19.2.3
(a marked improvement on the ~20 findings noted in June):

| Package | Advisory | Real or noise | Action |
|---|---|---|---|
| @babel/core <=7.29.0 | Arbitrary file read via sourceMappingURL (GHSA-4x5r-pxfx-6jf8) | Build/test tooling only, never ships to users | `npm audit fix` (semver-safe) |
| js-yaml (two paths, incl. the jest coverage chain) | Quadratic-complexity DoS (GHSA-h67p-54hq-rp68) | Dev dependency chain only; wardHub never parses YAML at runtime | `npm audit fix` (semver-safe) |
| postcss <8.5.10 vendored inside node_modules/next | XSS via unescaped `</style>` in stringify output (GHSA-qx2v-qp2m-jg93) | Noise for this app: it is a build-time CSS tool, the app feeds it no user input, and the fix is pinned inside Next itself | Wait for upstream Next. **Never run `npm audit fix --force`** - it "fixes" this by downgrading Next to 9.3.3, which would break the app |

A plain `npm audit fix` (no --force) is safe to recommend: it only touches the two
dev-chain advisories within their semver ranges. It was not run as part of this
read-only review.

### Informational

**I1. Both `dangerouslySetInnerHTML` uses were traced and are safe as written.**
There are exactly two in the whole of src:

- src/app/patient-guides/[id]/page.tsx:150 injects `guideHtml`. That HTML comes from
  `fetch("/patient-guides.html")` (:25) - a static file in public/ on the same origin -
  and the route param `id` is only used as a `getElementById` lookup key (:30), never
  concatenated into the HTML. The now-live `connect-src 'self'` CSP additionally makes
  the same-origin property technically enforced, not just a code convention. The static
  file's own `?guide=` / `?guides=` params are only used for Set-membership show/hide
  (public/patient-guides.html:2444-2451), not rendered. Keep it this way: if that fetch
  URL or the injection source ever becomes dynamic, this line becomes the site's biggest
  hole.
- src/components/admin/FlowchartEditor.tsx:1540 renders `subtitle` as raw HTML, but all
  three call sites pass hardcoded string literals (:1473, :1482, :1492) - it exists only
  to render an `&ldquo;` entity. Unnecessary risk-pattern; replace with a plain JSX
  string when convenient so the grep for dangerouslySetInnerHTML stays one line long.

**I2. Everything else user-typed is React-escaped.** Task titles/descriptions and patient
names (tasks page, kanban, TaskDetailModal), feedback board posts and comments
(src/app/feedback/page.tsx - the only href in the file is a static mailto), personal link
titles/descriptions, suggest-a-link and recommendation review cards
(src/app/admin/links/page.tsx:213-221 renders the URL as text, not a link), quiz content,
all builder free-text fields (rendered as text and copied to clipboard, never as HTML),
and the Ctrl+K search (query used only for filtering; results come from static data, and
result URLs are static-data URLs). No `innerHTML`, `insertAdjacentHTML`,
`document.write`, `srcDoc` or hardcoded `javascript:` anywhere in src (repo-wide grep).

**I3. URL parameters never reach a dangerous sink.** All `useSearchParams` reads were
traced: `?section` (dev panel, state key), `?category`/`?sub`/`?title` (feedback form
pre-fill into controlled inputs - escaped), `?add=1` and `?category` (links page, state),
`?tour` and `?view` (booleans). The legacy /bookmarks page redirects to a fixed path
(`/links` + passthrough query, src/app/bookmarks/page.tsx:13) and proxy.ts only ever
redirects to fixed internal paths - **no open redirects**.

**I4. localStorage parsing is consistently defensive.** Every `JSON.parse` of a
localStorage value in the app sits inside try/catch (providers.tsx, ward-settings,
verification, referral-log, feedback, guides order, care-review), so a corrupt value
degrades to defaults instead of white-screening. Prototype pollution via `__proto__` keys
in stored JSON is not a live risk: parsed objects are set into React state or spread
shallowly; nothing recursively merges untrusted objects into shared prototypes.

**I5. Print windows are clean.** Both print paths open the static
/patient-guides.html with ids in the query string (src/app/patient-guides/[id]/page.tsx:85,
src/app/patient-guides/page.tsx:30) and call `.print()`; no dynamic HTML is written into
them.

**I6. Live header observations.** As served on 4 Jul 2026:

| Header | Value | Assessment |
|---|---|---|
| Content-Security-Policy | the new 'self' policy | Good (see L1 for the script-src caveat) |
| Strict-Transport-Security | max-age=63072000 | Present (Vercel-managed). No includeSubDomains/preload - acceptable; add if the domain will only ever serve this app |
| X-Frame-Options / frame-ancestors | DENY / 'none' | Good - no clickjacking, belt and braces |
| X-Content-Type-Options | nosniff | Good |
| Referrer-Policy | strict-origin-when-cross-origin | Good |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | Good for an internal tool |
| Access-Control-Allow-Origin | * | Harmless on a public read-only demo (CORS with * cannot carry credentials), but remove it for any authenticated build - find where it is set (likely Vercel project config, it is not in next.config.ts) |

Nothing an internal NHS tool needs is missing from the header set.

## Auth honesty - the current position, stated plainly

The demo deliberately has no authentication: the password gate was removed by design so
reviewers can explore, and all data is fictional. What an IT reviewer should understand
about what exists today:

- The "login" is a picker. Choosing a ward/name/role writes a JSON blob to
  localStorage (`wardhub_user`, src/app/providers.tsx). There is no credential, no
  session, no server.
- **Roles are client-side only.** The five roles (staff, lead, manager, ward_admin,
  senior_admin) and the isContributor flag gate what the UI shows, but anyone can grant
  themselves senior_admin in browser devtools in one line. In the demo this is a feature
  (the role switcher does exactly that on purpose). It means the current RBAC is a UX
  model and a design artefact - not a security control, and it is not presented as one.
- Route "protection" (src/proxy.ts) blocks paths, not people: it redirects PII routes in
  the split build and handles legacy URLs. It checks nothing about who is asking.

## For the live build

The good news is the enforcement point already exists: proxy.ts runs on every matched
request, which is exactly where a session check belongs.

1. **Identity provider - use Microsoft Entra ID.** The trust already has it via M365, every
   staff member already has an account, and it brings MFA and conditional access for
   free. Wire it as OIDC using Auth.js (next-auth v5) or MSAL; session in an httpOnly,
   Secure, SameSite=Lax cookie - never a token in localStorage. NHS CIS2 Authentication
   is the alternative if the app ever needs smartcard-linked identity or national
   onboarding, but it is a heavier process (NHS England onboarding, connection
   agreement) and is not needed for an intranet ward tool; Entra ID is the pragmatic
   recommendation and what trust IT will already know how to run.
2. **Enforce in proxy.ts.** Unauthenticated requests to anything but the sign-in route
   get redirected server-side. This converts the existing path-blocking into real access
   control with minimal restructuring.
3. **Sessions sized for shared ward computers.** Short idle timeout (15-30 minutes),
   an absolute session lifetime (e.g. 12 hours), and sign-out that also clears the
   patient-identifying localStorage stores (logout already clears
   `wardhub-referral-logs` and `wardhub_care_tracker_v2` - keep that behaviour).
4. **Move RBAC server-side.** Map Entra security groups to the five existing roles in the
   token claims; enforce them in proxy.ts / any future route handlers on every request.
   The client-side role state stays, but only to decide what to render. Any future API
   (Supabase or otherwise) must re-check the role per request - with Supabase that means
   row-level security policies keyed on the authenticated user, never trust in the anon key.
5. **Housekeeping that comes with auth:** remove `Access-Control-Allow-Origin: *`; move
   to a nonce-based CSP and drop 'unsafe-inline'/'unsafe-eval' (L1); add the Supabase
   host to connect-src only when it actually goes live (the comment in next.config.ts
   already says this); validate personal-link URL schemes before any link storage is
   shared (M1); add `npm audit --omit=dev` to CI so runtime advisories surface on push.

## Verdict

wardHub's demo build presents an unusually small attack surface for a web app: it has no
server-side code, no API routes, no database traffic and no third-party scripts, and it
now serves a same-origin-locked Content-Security-Policy together with a full set of
standard security headers, verified live on 4 Jul 2026. A sweep of every point where user
input or a URL parameter is rendered found no exploitable cross-site scripting: all free
text is escaped by the framework, both uses of raw HTML injection draw from static
same-origin content, and there are no open redirects. The one code weakness worth fixing
- unvalidated URL schemes on user-added personal links - is self-affecting only in the
current architecture and has a one-function fix that should land before any shared
storage is introduced. Dependency audit shows four advisories, none exploitable at
runtime, two trivially fixable. The absence of authentication is a deliberate and clearly
documented property of the fictional-data demo, not an oversight; the current roles
system should be read as a design model, and the report above sets out a conventional
Entra ID / server-enforced path for a live deployment, for which the enforcement point
(proxy.ts) already exists in the codebase.
