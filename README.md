# wardHub

One place for the stuff an inpatient mental health ward actually needs mid-shift:
referral workflows that walk you to a finished case note, how-to guides built from trust
policy, a links directory that replaces the laminated phone list, a team task diary, and
a training quiz. Built by a Ward NIC at Derbyshire Healthcare NHS Foundation Trust as a
personal development project.

**Live demo:** https://www.wardhub.live

## The important bit for reviewers

This demo holds no real patient data. All patients and staff are fictional, wards use
poet pseudonyms, trust-internal phone numbers show as "Hidden in demo mode", and nothing
a user enters ever leaves their browser (localStorage only - no accounts, no analytics,
no external requests; the Content-Security-Policy enforces it). The in-app GDPR page and
the Developer & Governance Panel (linked from it) carry the detail: data map, draft DPIA,
clinical safety hazard log, RBAC and technical spec.

It is not yet a trust-approved system. Content approval status is shown honestly on every
guide tile (green approved / amber awaiting approval / red in development).

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build - must stay clean
npm test
```

Deploys automatically to Vercel on push to `main`.

## Where things live

| What | Where |
|---|---|
| Guide content (referrals + how-to) | `src/lib/data/guides/` |
| Links directory | `src/lib/data/bookmarks/` |
| Quiz question bank | `src/lib/data/quiz/` |
| Demo staff/patients | `src/lib/data/staff/`, `src/lib/data/tasks/` |
| Guide approval traffic lights | `src/lib/data/approval-status.ts` |
| Routing / demo-build switches | `src/proxy.ts`, `src/lib/config/build.ts` |
| Project instructions + history | `CLAUDE.md`, `docs/BACKLOG.md` |
| Governance pack | `docs/clinical-safety/`, `docs/nhs-ready/` |

Content is plain TypeScript data - a future rebuild on trust infrastructure can lift the
datasets wholesale (see `docs/nhs-ready/` for the portability pack).
