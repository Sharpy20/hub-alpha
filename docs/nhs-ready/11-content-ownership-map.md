# wardHub Content Ownership Map

**Purpose:** for the clean-repo split, this says who owns each piece of wardHub content - Claude (generic scaffold, public-safe, in the code) or Copilot/tenant (trust or clinical content, never in the public repo) - and which Copilot agent maintains it. The rule of thumb: **Claude builds the machine; Copilot fills it with trust content; anything requiring completeness or a register is a SharePoint/Power Automate job, never an LLM.**

Last updated 8 Jul 2026.

## The split, content type by content type

| Content type | Nature | Owner | Maintained by |
|---|---|---|---|
| App code / scaffold (components, routing, styles, feature flags) | Generic, no trust data | **Claude** | Claude in the clean repo |
| Guide JSON schema + import pipeline | Generic contract | **Claude** | Claude (prerequisite build - see below) |
| **Guides** (clinical/referral content) | Trust + clinical | **Copilot** | Guide Builder -> Policy Checker -> Content Auditor, then human clinical sign-off |
| **Policy library** (the 435 downloaded docs) | Trust | **SharePoint** | SharePoint doc library (register); Policy Checker for Q&A |
| Policy review-date flagging | Deterministic | **Power Automate** | Monthly flow -> Governance Teams channel (NOT an agent) |
| **Links / bookmarks** directory | Mixed public + internal | **Copilot** | Directory Curator (verify), Guide Builder (harvest) |
| **Service Finder** (~109 services) | Local services, mostly public | **Copilot** | Directory Curator + Deep Researcher (verify currency) |
| **Quiz** (364 questions) | Policy-derived | **Copilot** | Quiz Writer (create), Content Auditor (check vs current policy) |
| Case-note templates | Trust wording | **Copilot** | Embedded in guides by Guide Builder |
| Risk builder chips / clinical indicators | Clinical | **Copilot** | Policy Checker verifies against policy |
| Ward diary / tasks | Structure only, no content | **Claude** | Claude scaffold (demo data fictional) |
| Patient list | Demo = fictional; real = trust infra | **Claude** (demo) / trust (live) | Claude scaffold; live data never in repo |
| Demo staff/patient/ward data | Fictional | **Claude** | Claude scaffold |

## The six Copilot agents (all built 8 Jul, private to Mike)

1. **wardHub Guide Builder** - policy/SOP -> wardHub guide (+ harvests bookmarks). BUILT.
2. **wardHub Deep Researcher** - national/international guidance, verbatim quotes, verified/unverified split. BUILT (web search on).
3. **wardHub Policy Checker** - what policy says + checks drafts; refuses to enumerate. BUILT. **Point Knowledge at the SharePoint policy library.**
4. **wardHub Content Auditor** - audits published guides vs current policy. BUILT. **Point Knowledge at SharePoint too.**
5. **wardHub Quiz Writer** - policy/guide -> quiz MCQs in wardHub JSON. BUILT.
6. **wardHub Directory Curator** - verifies + formats Links and Service Finder entries. **NOT BUILT** (Copilot Agent Builder went unresponsive) - instructions below, ~2 min to paste.

The pipeline: research -> (policy check) -> build guide/quiz -> tiered sign-off -> import to wardHub -> auditor loops back. Humans own the sign-off step; agents do everything either side.

## Prerequisite Claude-side work (blocks the whole plan)

Guides currently live as static TypeScript in the repo. For the clean-repo split to work, guides must move to an importable store. Two Claude jobs, in order:
1. **Guide JSON schema** - the contract every agent's output targets and wardHub imports. Nail this first; everything hangs off it.
2. **Publish pipeline** - Supabase or trust-hosted store + working admin import (the current admin editor is a dead mockup).

## Directory Curator - paste-ready agent instructions

Create agent -> Skip to configure. Name: `wardHub Directory Curator`. Description: "Verifies and formats Links and Service Finder entries in wardHub's format." Paste this into Instructions, then Create:

```
You are the wardHub Directory Curator for Derbyshire Healthcare NHS Foundation Trust. You maintain two signposting datasets: the Links directory (quick links and contacts staff use) and the Service Finder (local services patients can be referred or signposted to). You verify details and produce entries in wardHub's format.

STYLE: Plain prose around the output. No emoji except the single icon field. No decorative headers. Never restate the request. UK spelling. No em dashes - use hyphens.

Decide which the item is and use the matching format.

LINK / BOOKMARK (a phone number, website, or system staff use) - output as:
- title
- icon (one emoji)
- url (real, or [CHECK])
- category (one of: Crisis Support, Clinical Systems, HR & Pay, Training & Learning, Policies & Guidance, Communication, or say if none fit)
- requiresFocus (true only if it needs FOCUS/trust-network login, else false)
- phone (public number, or [INTERNAL - hidden in demo] for switchboard/extensions, or omit)
- description (one line)

SERVICE (something patients are referred or signposted to) - output as:
- name
- cluster (the kind of service, e.g. "Housing", "Substance misuse", "Advocacy", "Crisis")
- areas (which areas of RESIDENCE it accepts - "city", "county", or both; catchment is where the PERSON LIVES or their registered GP, not where the service building is)
- include (bullet criteria a person must meet)
- exclude (bullet criteria that rule a person out)
- contact (public phone and/or website, or [CHECK])
- catchmentNote (how catchment is decided - home address vs registered GP)

RULES:
- Verify every phone, email, and URL against a current public source before stating it. If you cannot verify, write [CHECK] and say what needs checking - never carry forward an old number as if confirmed.
- Public contact details only. Never put a patient-identifiable detail in a directory entry.
- For trust-internal numbers use [INTERNAL - hidden in demo], with the real number only in a note for the editor.
- Advocacy is IMHA only in the advocacy workflow. Derby City IMHA and Derbyshire County IMHA are different providers - keep them separate and never merge them.
- Flag anything that looks out of date, merged, or duplicated. Say plainly when a service's inclusion criteria are unclear rather than guessing them.
- You cannot output a complete/exhaustive directory from memory. If asked for "all services" or "every link", say you cannot guarantee completeness and work from a provided list instead.

Never invent a contact detail or a service. An entry marked [CHECK] is useful; a confidently wrong phone number sends a patient nowhere.
```

Turn on "Search all websites" for this one (it needs to verify live contact details), same as the Deep Researcher.
