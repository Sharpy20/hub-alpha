# wardHub data flow diagrams

> Draft - 4 July 2026, prepared for trust review.
>
> Companion to 03a-dpia-draft.md (Step 2.5). Two diagrams: the current public
> demo as it actually behaves after the 4 July fix pass, and the proposed live
> ward deployment. Facts verified against the codebase and live site on
> 4 July 2026 (see 01-data-governance-audit.md).

---

## Diagram 1 - current public demo (Scope A)

```mermaid
flowchart LR
    subgraph ward["Ward staff member"]
        U["User"]
    end

    subgraph browser["User's browser (the only place user data lives)"]
        APP["wardHub app<br/>(static pages + client-side code)"]
        LS[("localStorage<br/>chase log / care tracker /<br/>feedback / links / prefs<br/>unencrypted, this device only")]
        MEM[("In-memory diary data<br/>wiped on refresh")]
    end

    subgraph os["Operating system"]
        CLIP[("OS clipboard<br/>+ Win+V history<br/>+ possible cloud sync")]
    end

    S1["SystmOne<br/>(separate system,<br/>no integration)"]

    subgraph vercel["Vercel (processor, US company, edge in London)"]
        CDN["Static hosting<br/>request logs: IP + user agent only"]
    end

    subgraph github["GitHub (processor, private repo)"]
        REPO["Source code<br/>+ history incl. trust-docs dump<br/>(finding F1, rewrite pending)"]
    end

    U -->|"types, clicks, picks demo identity"| APP
    APP -->|"saves locally only"| LS
    APP -->|"demo diary (never saved)"| MEM
    APP -->|"user clicks Copy:<br/>patient name + case note text"| CLIP
    CLIP -->|"user pastes manually"| S1
    U -->|"page/asset requests<br/>(IP + user agent)"| CDN
    CDN -->|"HTML, JS, CSS, self-hosted fonts"| U
    REPO -->|"deploy on push (code only,<br/>no user data ever)"| CDN

    subgraph blocked["Cannot happen - blocked by CSP connect-src 'self' (and verified absent from code)"]
        GF["Google Fonts<br/>(removed 4 Jul)"]
        AN["Analytics / tracking<br/>(none installed)"]
        SB["Supabase<br/>(configured, zero queries,<br/>client removed from bundle)"]
        X["Any other host"]
    end

    APP -.->|"blocked"| GF
    APP -.->|"blocked"| AN
    APP -.->|"blocked"| SB
    APP -.->|"blocked"| X

    style blocked fill:#f5f5f5,stroke:#999,stroke-dasharray: 5 5
    style GF fill:#eee,color:#888
    style AN fill:#eee,color:#888
    style SB fill:#eee,color:#888
    style X fill:#eee,color:#888
```

### Walkthrough - current demo

There are exactly three flows, and only one of them ever carries anything a
user typed.

1. **Browser to Vercel and back.** The user's browser requests pages and assets;
   Vercel serves static files and logs the request (IP address, user agent) as
   any web host does. No form data, no localStorage content, nothing user-entered
   is ever in these requests, because there is no backend to send it to. Fonts
   are self-hosted, so no request goes to Google.

2. **Inside the browser.** Everything the user enters - demo identity, referral
   chase log, care review tracker, feedback posts, personal links, preferences -
   is written to localStorage on that device and read back on the next visit.
   It never leaves the machine. Logout clears the two patient-identifying stores
   (chase log, care tracker); the GDPR page's "clear my data" wipes everything.
   Demo diary data is held in memory only and disappears on refresh.

3. **The clipboard, by design.** The one deliberate egress. When the user clicks
   a copy button, the case note text (prefixed with the linked patient's name -
   fictional in the demo) goes to the OS clipboard, and the user pastes it into
   SystmOne themselves. There is no integration: wardHub and SystmOne never
   communicate. The clipboard is OS territory - Windows keeps a history (Win+V)
   and can sync to other devices, which is why the DPIA treats this pathway as
   the main risk to manage in live use (DPIA risk B2, hazard HAZ-023).

The greyed-out box is the point IG reviewers usually have to take on trust, but
here it is enforced: the Content Security Policy restricts `connect-src` and
`img-src` to `'self'`, so the browser itself refuses any connection from the app
to any other host. No analytics exists to be blocked; the dormant Supabase
client was removed from the shipped bundle on 4 July. GitHub appears on the
diagram because it holds the source code (and, until the pending history rewrite,
the historical trust-docs dump) - it never sees application user data.

---

## Diagram 2 - proposed live ward deployment (Scope B)

```mermaid
flowchart LR
    subgraph ward["Ward"]
        U2["Ward staff member"]
        PC["Shared ward computer<br/>(trust-managed, trust network)"]
    end

    AUTH["Trust authentication<br/>(SSO / trust accounts)<br/>+ session timeout"]

    subgraph browser2["Browser on ward machine"]
        APP2["wardHub app"]
        LS2[("localStorage<br/>preferences only -<br/>no patient data at rest here")]
    end

    subgraph store["Server-side store - UK only (decision pending)"]
        DB[("Trust infrastructure<br/>OR Supabase UK region<br/>row-level security,<br/>per-user audit log,<br/>defined retention")]
    end

    subgraph os2["Operating system"]
        CLIP2[("OS clipboard<br/>clipboard history / cloud sync<br/>to be restricted by group policy")]
    end

    subgraph s1b["SystmOne boundary (unchanged)"]
        S1B["SystmOne<br/>remains the legal record.<br/>No API, no integration -<br/>manual paste only"]
    end

    HOST["Hosting<br/>trust infrastructure preferred;<br/>public Vercel only with<br/>explicit IG acceptance"]

    U2 --> PC --> APP2
    APP2 <-->|"login required"| AUTH
    APP2 -->|"prefs only"| LS2
    APP2 <-->|"diary tasks, chase log,<br/>care tracker - authenticated,<br/>audited, UK-resident"| DB
    APP2 -->|"Copy: patient name +<br/>case note"| CLIP2
    CLIP2 -->|"staff member pastes,<br/>checks name matches record"| S1B
    HOST -->|"serves app"| APP2
```

### Walkthrough - proposed live build

The shape stays deliberately similar to the demo - same app, same manual
SystmOne boundary - with three structural changes, each of which is a go-live
condition rather than an option:

1. **Authentication in front of everything.** Trust SSO (or equivalent) with a
   session timeout suited to shared ward machines. The demo's open access does
   not carry over (DPIA measure M1).

2. **Patient data moves off the device.** The chase log, care tracker and diary
   move to a server-side store - trust infrastructure or Supabase on a verified
   UK region - with row-level security, a per-user audit trail and a defined
   retention rule. localStorage is demoted to preferences. This single change
   resolves the two go-live blockers in the hazard log (HAZ-020 chase log lost
   at logout, HAZ-022 diary not shared between devices) and the DPIA's high
   risks B1 and B6 (shared-machine exposure, no audit trail). The choice between
   trust hosting and Supabase UK is the trust's (DPIA measure M2, [TRUST TO
   CONFIRM: IT]).

3. **The SystmOne boundary stays manual.** Copy, paste, check the name. No API,
   no background sync. The pasted note still leads with the patient's name so a
   wrong-record paste is visible at the point of paste (HAZ-017). The clipboard
   residue risk is managed by group policy on clipboard history and cloud sync
   plus in-app guidance (HAZ-023, DPIA measure M3) - the app cannot control the
   OS, so this control belongs to trust IT.

Hosting is drawn as a decision point: patient data should not sit behind public
Vercel without an explicit, documented IG acceptance (DPIA measure M7). Nothing
else changes - there is still no analytics, no tracking, and no third party in
the data path.
