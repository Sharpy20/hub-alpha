# INPATIENT HUB - Claude Code Project File

> **Last Updated:** 23 June 2026
> **Project Owner:** Mike (Ward NIC)
> **Trust:** Derbyshire Healthcare NHS Foundation Trust

---

## 🚨 CRITICAL SECURITY - PROJECT ISOLATION 🚨

**THIS PROJECT MUST REMAIN 100% ISOLATED FROM ALL OTHER PROJECTS**

- **GitHub Account:** Sharpy20 (ONLY - never Dafttvlive or any other account)
- **Vercel Account:** Must be linked ONLY to Sharpy20 GitHub
- **No cross-references** to any other repositories, projects, or accounts
- **No shared credentials** between this and any other project
- **Deployment logs** must show "Sharpy20" only - if another name appears, DELETE the Vercel project and recreate

**If you see "Dafttvlive" or any other account name in:**
- Git commits
- Vercel deployment logs
- Package.json author
- Any documentation

**STOP IMMEDIATELY** and alert the user. This is a security breach.

---

## 🚀 LIVE DEPLOYMENT - ALWAYS PUSH TO VERCEL

**This project is deployed LIVE on Vercel. Do NOT just run locally.**

- **Live URL (canonical):** https://www.wardHub.live
- **Vercel URL (underlying deploy, also live):** https://inpatient-hub-alpha.vercel.app
- **GitHub Repo:** https://github.com/Sharpy20/hub-alpha
- **Deployment:** Automatic via Vercel on push to `main` branch

**After making changes:**
1. `git add <files>`
2. `git commit -m "message"`
3. `git push origin main`
4. Vercel deploys automatically (takes ~2 mins)

**Do NOT** rely on `npm run dev` / localhost for testing - always push and verify on live.

---

## GIT CREDENTIALS - LOCAL REPO SETUP

This project uses repo-specific GitHub credentials to avoid conflicts with Windows Credential Manager when multiple GitHub accounts are in use.

**Remote URL format (already configured):**
```
https://Sharpy20@github.com/Sharpy20/hub-alpha.git
```

**To verify setup:**
```bash
git remote -v
```

**If push fails with permission error:**
1. Check you're logged into Sharpy20 GitHub account in browser
2. Run: `git remote set-url origin https://Sharpy20@github.com/Sharpy20/hub-alpha.git`
3. Try push again - enter Sharpy20 credentials when prompted

**NEVER use global credential changes** - this could affect other projects.

---

## CRITICAL RULES

1. **100% Standalone Project** - No references to other projects, build everything fresh
2. **Version-Aware Development** - All features must respect the version flag system
3. **No Real PII** - Demo data only, fictional names, placeholder contacts for internal numbers
4. **Public Info Check** - If a phone number/email isn't Google-able, use placeholder: [INTERNAL - See FOCUS]
5. **NHS Styling** - Follow NHS Identity guidelines (colours, typography, accessibility)
6. **Project Isolation** - NEVER reference, import from, or link to any other projects (see Security section above)
7. **Documentation Sync** - After ANY feature change, follow the Documentation Sync Workflow (update CLAUDE.md → Dev Panel → GDPR if needed)
8. **No Em Dashes** - Never use em dashes (—) anywhere in code or content. Use hyphens (-) or en dashes (–) instead

---

## 📚 DOCUMENTATION SYNC WORKFLOW

**After any feature change, update documentation in this order:**

1. **CLAUDE.md** → Update Snag List, Feature Matrix, or relevant sections
2. **Dev Panel** → Update affected sections:
   - `/app/dev-panel/page.tsx` → Technical Spec, Data Catalogue, RBAC, User Flows
   - If data handling changed → Update DPIA section
   - If new hazards identified → Update Clinical Safety section
3. **GDPR Page** → If data collection/storage changed
4. **User-facing content** → FAQ, intro guides if affected

**Currency Stamps:**
- Add `Last reviewed: YYYY-MM-DD` to documentation sections
- Mark sections: ✅ current | ⚠️ review due | 🔄 updating

**Dev Panel Access:**
- Entry: Small link on GDPR page ("dev panel")
- No password required (removed Session 11) — dismissible "test data" notice shown instead
- Production will use Trust key vault authentication

---

## ⚠️ VARIABLE NAMING - KNOWN INCONSISTENCIES

**IMPORTANT:** The codebase has some naming inconsistencies between modules. Be aware of these when working with data:

### Ward Identifiers

| Source | Format | Example |
|--------|--------|---------|
| `src/lib/types/index.ts` → `WARDS[].id` | lowercase | `"byron"` |
| `src/lib/types/index.ts` → `WARDS[].name` | Title + "Ward" | `"Byron Ward"` |
| `src/lib/data/staff/index.ts` → `WARDS` | Capitalized | `"Byron"` |
| Patient data → `patient.ward` | Capitalized | `"Byron"` |
| Task data → `task.ward` | Capitalized | `"Byron"` |

**Solution:** Use helper function to convert:
```typescript
const getWardDataName = (wardId: string): string => {
  return wardId.charAt(0).toUpperCase() + wardId.slice(1);
};
// getWardDataName("byron") → "Byron"
```

### Task Date Fields

| Task Type | Date Field | Example |
|-----------|------------|---------|
| `WardTask` | `dueDate` | `"2026-01-27"` |
| `PatientTask` | `dueDate` | `"2026-01-27"` |
| `Appointment` | `appointmentDate` | `"2026-01-27"` |

**Solution:** Use helper function for `DiaryTask` union type:
```typescript
const getTaskDueDate = (task: DiaryTask): string => {
  if (task.type === "appointment") return task.appointmentDate;
  return task.dueDate;
};
```

### Patient Data - PII Considerations

The following fields exist on `Patient` but are **commented out in reports** to minimise PII:
- `legalStatus` - MHA status (Section 2/3, Informal, CTO, etc.)
- `admissionDate` - When admitted
- `room`, `bed` - Location details
- `namedNurse`, `consultant` - Staff assignments
- `alerts` - Clinical alerts (handled via clinical systems)

Reports currently show only: **ward** and **name**

---

## VERSION SYSTEM

Environment variable controls version:
NEXT_PUBLIC_APP_VERSION = light | medium | max | max_plus

### Version Definitions

**Light & Medium = Viewable Resources Only** (Bookmarks, Referrals, How-To Guides)
**Max & Max+ = Full Features** (Ward Diary, Patient List, My Tasks)

| Version | Description | Auth | PII | Hosting |
|---------|-------------|------|-----|---------|
| **Light** | Public resources only | Demo login | None | Public Vercel |
| **Medium** | + Internal content (non-public phones, emails, SOPs) | Trust auth | None | FOCUS/restricted |
| **Max** | + Ward Diary, Patient List, My Tasks | Trust auth | Yes | Trust infra, DIPA |
| **Max+** | + Nexus Assurance integration | Trust auth | Yes | Trust infra, webhook |

### Feature Matrix

| Feature | Light | Medium | Max | Max+ |
|---------|:-----:|:------:|:---:|:----:|
| **BOOKMARKS** |||||
| Public bookmarks | Y | Y | Y | Y |
| Internal bookmarks (FOCUS required) | - | Y | Y | Y |
| Suggest new bookmark | Y | Y | Y | Y |
| Report broken link | Y | Y | Y | Y |
| **REFERRAL WORKFLOWS** |||||
| Public workflows (public forms) | Y | Y | Y | Y |
| Internal workflows (internal SOPs) | - | Y | Y | Y |
| Clipboard copy for notes | Y | Y | Y | Y |
| Referral tracking log | - | - | - | Y |
| **HOW-TO GUIDES** |||||
| Public guides (generic clinical) | Y | Y | Y | Y |
| Internal SOPs (trust-specific) | - | Y | Y | Y |
| **WARD DIARY & TASKS** |||||
| Ward tasks | - | - | Y | Y |
| Patient tasks | - | - | Y | Y |
| Appointments | - | - | Y | Y |
| My Tasks view | - | - | Y | Y |
| Calendar view | - | - | Y | Y |
| Nexus Assurance auto-sync | - | - | - | Y |
| **ASSURANCE DASHBOARD** |||||
| Audit tasks (fridge temps, etc.) | Link | Link | Link | Auto-sync |
| Dashboard link on tasks | Y | Y | Y | Y |
| Webhook auto-completion | - | - | - | Y |
| **PATIENT PROGRESS REPORTS** |||||
| Generate reports | - | - | Y | Y |
| All wards / single ward / pick patients | - | - | Y | Y |
| Print reports | - | - | Y | Y |
| Schedule delivery (Email/Teams) | - | - | - | Y |
| Daily/weekly auto-send | - | - | - | Y |
| **PATIENT LIST** |||||
| View patients | - | - | Y | Y |
| Activity log | - | - | Y | Y |
| Discharge flow | - | - | Y | Y |
| Nexus compliance dashboard | - | - | - | Y |
| **ADMIN** |||||
| Content editing (workflows/guides) | Y | Y | Y | Y |
| User management | - | - | Y | Y |
| Audit logs | - | - | Y | Y |
| **AUTH** |||||
| Demo login (name/role picker) | Y | - | - | - |
| Trust authentication | - | Y | Y | Y |
| **DATA** |||||
| Local storage only | Y | - | - | - |
| Supabase persistence | - | Y | Y | Y |
| Nexus webhook | - | - | - | Y |

---

## TECH STACK

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + NHS colour tokens
- **Icons:** Lucide React
- **Hosting:** Vercel (Light), Trust infrastructure (Medium+)
- **Database:** LocalStorage (Light), Supabase (Medium+)
- **Auth:** Demo login (Light), Supabase Auth or Trust SSO (Medium+)

---

## PROJECT STRUCTURE

```
inpatient-hub/
├── app/
│   ├── (public)/                    # ALL versions
│   │   ├── page.tsx                 # Home
│   │   ├── bookmarks/page.tsx
│   │   ├── referrals/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── how-to/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── sources/page.tsx
│   │   └── gdpr/page.tsx
│   │
│   ├── (ward-tasks)/                # Medium+ (no PII)
│   │   └── tasks/page.tsx
│   │
│   ├── (pii)/                       # Max+ only
│   │   ├── patients/page.tsx
│   │   └── full-diary/page.tsx
│   │
│   ├── admin/                       # Role-gated
│   │   ├── page.tsx
│   │   ├── workflows/page.tsx
│   │   ├── guides/page.tsx
│   │   ├── users/page.tsx           # Medium+
│   │   └── logs/page.tsx            # Medium+
│   │
│   ├── api/nexus/                   # Max+ only
│   │   ├── tasks/route.ts
│   │   ├── patients/route.ts
│   │   └── notes/route.ts
│   │
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                          # Base UI
│   ├── layout/                      # Header, nav, footer
│   ├── bookmarks/                   # Bookmark components
│   ├── workflows/                   # Workflow viewer/editor
│   ├── guides/                      # Guide components
│   ├── tasks/                       # Medium+
│   ├── patients/                    # Max+
│   ├── admin/
│   ├── auth/
│   └── common/
│
├── lib/
│   ├── config/
│   │   ├── features.ts              # Feature flags
│   │   ├── versions.ts
│   │   └── nhs-theme.ts
│   ├── data/
│   │   ├── bookmarks/               # public.ts, internal.ts
│   │   ├── workflows/               # public/, internal/
│   │   ├── guides/
│   │   └── demo/                    # Fictional test data
│   ├── types/
│   ├── hooks/
│   ├── utils/
│   └── api/nexus/                   # Max+ Nexus webhook
│
├── public/images/
├── CLAUDE.md
└── README.md
```

---

## NHS STYLING

### Colours (Tailwind tokens)

| Token | Hex |
|-------|-----|
| nhs-blue | #005EB8 |
| nhs-dark-blue | #003087 |
| nhs-bright-blue | #0072CE |
| nhs-light-blue | #41B6E6 |
| nhs-aqua | #00A9CE |
| nhs-black | #212B32 |
| nhs-dark-grey | #425563 |
| nhs-mid-grey | #768692 |
| nhs-pale-grey | #E8EDEE |
| nhs-white | #FFFFFF |
| nhs-green | #007F3B |
| nhs-warm-yellow | #FFB81C |
| nhs-orange | #ED8B00 |
| nhs-red | #DA291C |
| nhs-purple | #330072 |
| nhs-pink | #AE2573 |

### Typography
- **Primary Font:** Source Sans 3 (Arial fallback)
- **Headings:** Bold, NHS Blue
- **Body:** Regular, NHS Black

---

## USER ROLES

| Role | Light | Medium | Max | Max+ |
|------|-------|--------|-----|------|
| **Normal User** | View, suggest | + Ward tasks | + Patient tasks, discharge | + S1 view |
| **Ward Admin** | - | Approve, invite | + Approve discharge, logs | + S1 edit |
| **Contributor** | Edit content | + Submit for review | Same | Same |
| **Senior Admin** | Approve content | + User mgmt, audit | Same | + API settings |

---

## CONTENT CLASSIFICATION

### PUBLIC (Light+)

**Bookmarks:**
- Samaritans: 116 123
- Mind Infoline: 0300 123 3393
- CALM: 0800 58 58 58
- NHS 111
- Derbyshire MH Helpline: 0800 028 0077
- IAPT Services (Trent PTS, Insight Healthcare)
- Rethink Derby, DRP
- All charity websites

**Workflows:**
- IMHA/Advocacy (City vs County branching)
- PICU Referral overview
- Homeless Discharge (Duty to Refer)
- Social Care Referral (public MASH numbers)
- Safeguarding Adults
- Dental, Dietitian referrals

**Guides:**
- NEWS2 Observations
- Mental State Examination
- Seizure Management
- Refeeding Syndrome
- Capacity Assessment principles
- DoLS overview

### INTERNAL (Medium+)

**Bookmarks:**
- FOCUS intranet links
- Trust switchboard
- Internal extensions
- Safeguarding internal lines
- MHA Office contacts

**Workflows:**
- Seclusion Process
- Named Nurse Responsibilities
- EDT Referral
- Section 117
- Complex Case Panel

**Guides:**
- Seclusion review timings
- Named Nurse weekly checklist
- Care Planning templates
- Patient Red Folders
- Trust-specific forms

---

## STANDARD WORKFLOW TEMPLATE

All referral workflows follow this consistent structure:

### Step Flow
```
1. CRITERIA CHECK
   "Confirm referral criteria met"
   [Checkbox] I confirm the patient meets criteria for this referral
   [Link to criteria document if available]

2. BLANK FORM
   "Download the referral form"
   [Download button] → Links to form
   [Note about where form is saved/how to complete]

3. WAGOLL (What A Good One Looks Like)
   "View an example completed form"
   [View Example button] → Opens example
   [May be marked "Example only - do not submit"]

4. RELATED GUIDES
   "Helpful resources"
   [Links to any related How-To guides]
   [Links to relevant bookmarks]

5. SUBMISSION INSTRUCTIONS
   "Where to send this referral"
   - Email: example@service.org.uk
   - Phone: 01234 567890
   - [If via clinical system] → Link to relevant guide
   - Portal/website link if applicable

6. CASE NOTE PROMPT
   "Copy this to patient notes"
   ┌─────────────────────────────────────────┐
   │ Referral for [Service] sent to [Org]   │
   │ via email to example@email.com on      │
   │ [auto-date]. Reference: [if applicable]│
   └─────────────────────────────────────────┘
   [Copy to Clipboard] button

7. JOB DIARY REMINDER
   "Don't forget!"
   → Ensure task marked complete in Job Diary
   [Link to Job Diary if Medium+ version]

8. GDPR TIP
   "Data protection reminder"
   → Delete completed referral form from your
     computer if no longer needed
   → Do not store patient data locally
```

### Workflow Data Structure
```typescript
interface Workflow {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  steps: WorkflowStep[];
  // Linked resources
  blankFormUrl?: string;
  wagollUrl?: string;
  criteriaUrl?: string;
  relatedGuides?: string[];
  relatedBookmarks?: string[];
  // Submission details
  submissionMethod: 'email' | 'phone' | 'portal' | 'mixed';
  submissionDetails: {
    email?: string;
    phone?: string;
    portalUrl?: string;
    instructions?: string;
  };
  // Case note template
  caseNoteTemplate: string; // With placeholders like {service}, {date}
}
```

---

## HOME PAGE BOOKMARK CAROUSEL

### Design
```
┌──────────────────────────────────────────────────────┐
│                    QUICK LINKS                        │
│                                                       │
│         ┌─────┐                                       │
│    ┌────┤     ├────┐                                 │
│    │    └──┬──┘    │                                 │
│ ┌──┴──┐   │    ┌──┴──┐                              │
│ │     │───●───│     │     ← Links on spokes         │
│ └──┬──┘   │    └──┬──┘                              │
│    │    ┌──┴──┐    │                                 │
│    └────┤     ├────┘                                 │
│         └─────┘                                       │
│              │                                        │
│         [ MORE ]  ← Last spoke when >5 links        │
│                                                       │
│   [ ◄ ]  Clinical Systems  [ ► ]                    │
│          ↑ Category name, arrows change category    │
└──────────────────────────────────────────────────────┘
```

### Behaviour
- Each category shows up to 5-6 bookmarks on wheel spokes
- If more bookmarks in category, final spoke is "More..." → goes to full Bookmarks page filtered to that category
- Left/right arrows cycle through categories
- Clicking a spoke opens the bookmark (new tab for external, same tab + warning for FOCUS)
- Mobile: May simplify to horizontal scroll cards

### Bookmark Display
```typescript
interface BookmarkDisplay {
  title: string;
  icon: string;        // Emoji or Lucide icon
  url: string;
  requiresFocus: boolean;  // If true, show "FOCUS login needed" badge
  category: string;
}
```

### FOCUS Badge
When `requiresFocus: true`:
- Show small badge/indicator on the spoke
- On click, show brief modal: "This link requires FOCUS login. You must be connected to the Trust network."
- Then open link

---

## NEXUS ASSURANCE INTEGRATION (Max+)

### Overview
Nexus Assurance is the Trust's internal compliance platform. The Hub integration uses a one-way inbound webhook (Nexus → Hub) to auto-complete audit tasks when completed on Nexus.

### Integration Model
- **Direction:** One-way inbound (Nexus → Hub)
- **Mechanism:** Webhook (`POST /api/nexus/task-complete`)
- **Scope:** Audit tasks only (fridge temps, controlled drugs, walkarounds, etc.)
- **Auth:** Shared secret via `X-Nexus-Token` header
- **Owner:** Trust tech team builds the webhook on the Nexus side

### Linked Task Types
- Fridge temperature checks
- Water temperature checks
- Controlled drugs count
- Shift walkarounds
- Resus equipment checks
- Fire safety checks
- Ligature point checks

### Feature Flag
- `nexus_sync` — enabled in Max+ mode only

---

## BUILD PHASES

### Phase 1: Skeleton & Theming (COMPLETE)
- [x] Next.js project setup
- [x] Tailwind + NHS theme
- [x] Version/feature flag system
- [x] Base UI components
- [x] Layout (header, nav, footer)
- [x] Demo login page
- [x] GDPR modal
- [x] Home page structure

### Phase 2: Bookmarks (COMPLETE)
- [x] Bookmark data + components
- [x] Category wheel (home)
- [x] Full bookmarks page
- [x] Suggest/report modals

### Phase 3: Workflows (COMPLETE)
- [x] Workflow data structure
- [x] Step type components
- [x] Workflow viewer
- [x] IMHA workflow complete
- [x] Clipboard copy

### Phase 4: How-To Guides (COMPLETE)
- [x] Guide viewer
- [x] NEWS2, Seizure guides
- [x] Guides index

### Phase 5: Admin Features
- [ ] Workflow/guide editors
- [ ] Admin log
- [ ] Sources page

### Phase 6: Ward Tasks (Medium+) (COMPLETE)
- [x] Task system
- [x] Calendar view (week view with day columns)
- [x] My Tasks view (Kanban board)
- [x] Ward toggle for cross-ward viewing
- [x] Task detail modal with edit capability
- [x] Claim/Unclaim/Steal functionality

### Phase 7: Patient Features (Max+) (COMPLETE)
- [x] Patient list with filtering
- [x] Patient transfer between wards
- [x] Recent discharges list
- [x] Discharge audit log modal
- [x] Ward admin discharge confirmation

### Phase 8: Nexus Integration (Max+) (COMPLETE)
- [x] Nexus feature flag (`nexus_sync`)
- [x] Nexus-linked audit tasks in demo data
- [x] Dev Panel Nexus section with webhook spec
- [x] Version pages updated (SystemOne → Nexus)

### Phase 8b: Business Case & Demo Tour (COMPLETE)
- [x] Business Case section in Dev Panel (10 accordion sections)
- [x] Interactive Demo Tour with tour provider
- [x] Tour button in header (gradient, pulsing)
- [x] Live IMHA referral walkthrough in tour mode
- [x] Visual mockups (diary, tasks, Nexus, Kanban, GDPR)

### Phase 9: Polish
- [ ] Mobile responsive
- [ ] Error handling
- [ ] Accessibility

---

## PLACEHOLDER CONVENTIONS

For internal/non-public contacts:

| Scenario | Format |
|----------|--------|
| Internal phone | [INTERNAL - See FOCUS] |
| Demo display | 01onal XXX XXXX |
| UI note | "Live version will have real numbers" |

---

## DEMO DATA

### Wards (Poet-themed pseudonyms)
| Ward ID | Name | Notes |
|---------|------|-------|
| byron | Byron Ward | Lord Byron |
| shelley | Shelley Ward | Percy Bysshe Shelley |
| keats | Keats Ward | John Keats |
| wordsworth | Wordsworth Ward | William Wordsworth |
| dickinson | Dickinson Ward | Emily Dickinson |

### Staff Data
- **100 total staff** (20 per ward)
- Role distribution: 10% senior_admin, 15% ward_admin, 15% contributor, 60% normal
- Unique names per ward with realistic NHS role mix
- Data in: `src/lib/data/staff/index.ts`

### Fictional Patients (Max version)
- **100 total patients** (20 per ward)
- Each patient has: room, bed, named nurse, consultant, legal status, admission date
- Status distribution: 70% active, 10% pending_discharge, 10% on_leave, 10% discharged
- Legal status mix: Section 2/3, Informal, CTO, S17 Leave
- Some patients have alerts (falls risk, allergens, observations level)
- Data in: `src/lib/data/tasks/index.ts`

### Demo Users
- Demo Normal User
- Demo Ward Admin
- Demo Contributor
- Demo Senior Admin

---

## DECISIONS LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| 24/01/2026 | Single codebase + feature flags | Easier maintenance than separate repos |
| 24/01/2026 | Version via env var | Simple deployment configuration |
| 24/01/2026 | Route groups for gating | Clean Next.js App Router pattern |
| 24/01/2026 | Start with Light skeleton | Get deployable demo fastest |

---

## SNAG LIST (25 Jan 2026)

Working through in order. Marking complete as fixed.

| # | Status | Description |
|---|--------|-------------|
| 1 | [x] | Ward diary - Steal Task doesn't update "Claimed by" text on tile immediately |
| 2 | [x] | Add task modal - reorder tabs: Ward Task, Patient Task, Appointment (match Today view) |
| 3 | [x] | Ward tasks - Add "Repeats" toggle with day selection (Mon-Sun), shift/time picker, leadership approval prompt |
| 4a | [x] | Appointments - Add "Link a referral" toggle with dropdown, show icon on tile |
| 4b | [x] | Appointments - Add "Link how-to guide" toggle with dropdown, show icon on tile |
| 4c | [x] | Appointments - Add "More details" toggle with free text, hidden on tile until expanded |
| 5 | [x] | Task editing - Allow changing date, time, duration, and patient |
| 6 | [x] | Ward diary - Show full day info for yesterday/tomorrow (undo "click to view" hide) |
| 7 | [x] | Demo version switcher - Add compare versions popup with feature table, demo limitations, sources link |
| 8 | [x] | First open - Default select user's login ward in ward dropdown |
| 9 | [x] | Claimed tasks not showing in My Tasks - investigate and fix |
| 10 | [x] | Populate staff (Staff_A-T) and patients (Patient_1-20) per ward, each with at least 1 assigned + 1 unassigned task |
| 11 | [x] | Login flow - Ask ward first, then name (with "just pick one, it's only a demo" note) |
| 12 | [x] | Add role switcher next to username (demo mode only) |
| 13 | [x] | Patient list/task tiles - Click patient name to show all their tasks |
| 14 | [x] | Patient transfer - Show tasks with assignees, options: leave on old ward / move / remove assignee / claim for self |
| 15 | [x] | Home "I need to..." links - Remove underlines |
| 16 | [x] | Referrals and How-to guides - Remove underlines from links |
| 17 | [x] | Site-wide - Remove underscores/underlines from all links |
| 18a | [x] | Header - Remove Home link, embed in "Inpatient Hub" title |
| 18b | [x] | Header - Make title bar white/clear background |
| 18c | [x] | Header - Break nav links into separate tiles with gaps, combine version/role/user/ward into "My Profile" menu |
| 19 | [x] | Home page Today's Tasks - Make "My Tasks" button same color as "Ward Diary" button |
| 20 | [x] | Ward diary & My Tasks - Make patient name larger (but smaller than task title) |
| 21 | [x] | Claiming task (new or steal) - put in Claimed/Todo list, not In Progress |
| 22 | [x] | My Tasks Kanban - allow opening completed tasks to view/edit, mark in progress/assigned, drag-drop back |
| 23 | [x] | Ward diary defaults: Yesterday - appointments expanded, ward tasks hidden, patient tasks truncated. Future days - patient tasks & appointments expanded, ward tasks hidden |

## SNAG LIST (26 Jan 2026)

| # | Status | Description |
|---|--------|-------------|
| 24 | [x] | **URGENT SECURITY** - RESOLVED: Fresh git repo created with clean history. All commits now attributed to Sharpy20. New repo: hub-alpha |
| 25 | [x] | Ward diary sections - user unable to minimize tasks (toggle button not working) |
| 26 | [x] | Login flow - user's selected ward not being set as activeWard when going to ward diary |
| 27 | [x] | Login flow - changed from free text to dropdown selection from staff list per ward |
| 28 | [x] | Staff data - added "Ward Admin" as first staff member at top of each ward's staff list |
| 29 | [x] | Ward diary - changed "Quick Guide" text to "Diary Key" |
| 30 | [x] | Add task modal - leadership approval checkbox now only shows for repeating tasks |
| 31 | [x] | Add task modal - added toggle between one-off and repeating tasks |
| 32 | [x] | Add task modal - added date picker for one-off ward tasks (future date selection) |
| 33 | [x] | Ward diary - added "View repeat ward tasks" button with Mon-Sun weekly overview modal |

## SNAG LIST (28 Jan 2026)

| # | Status | Description |
|---|--------|-------------|
| 34 | [x] | Patient tasks modal - clicking tasks/appointments now opens TaskDetailModal for viewing/editing |
| 35 | [x] | Add task modal - patient name field changed from free text to searchable dropdown of active ward patients |
| 36 | [x] | Ward diary - Sync tip banner updated (now shows Nexus sync in Max+ version) |
| 37 | [x] | Removed PatientNamesModal from Ward Diary and My Tasks (was not persisting changes) |
| 38 | [x] | Added "Add Patient" button and modal to Patients page (name, room, bed, legal status) |
| 39 | [x] | Add Patient modal - Simple/Advanced toggle with alerts selection from ALERTS_POOL |
| 40 | [x] | Ward Admin Settings page (/admin/ward-settings) - 6 tabs: Patients, Tasks, Shifts, Layout, Discharge, Content |
| 41 | [x] | WardSettingsProvider - ward-scoped settings context with localStorage persistence |
| 42 | [x] | User bookmark favorites - "My Favorites" section on home page displays starred bookmarks |
| 43 | [x] | Bookmarks page - star toggle on each bookmark to add/remove from favorites |
| 44 | [x] | Project evaluation - comprehensive 10-perspective review generated (docs/evaluations/2026-01-28_project-evaluation.md) |
| 45 | [x] | Security fix - Updated Next.js 16.1.4 → 16.1.6 to fix moderate DoS vulnerability (GHSA-9g9p-9gw9-jx7f) |
| 46 | [x] | Fixed failing provider tests - updated feature matrix expectations (medium no longer has ward_tasks/audit_logs) |

## SNAG LIST (29 Jan 2026)

| # | Status | Description |
|---|--------|-------------|
| 47 | [x] | Patient list - clicking a task/appointment in patient modal should open TaskDetailModal |
| 48 | [x] | Add task modal - ensure patient name is ALWAYS a searchable dropdown (not free text) across all entry points |
| 49 | [x] | Ward diary - group tasks by priority with colored borders, urgent tasks at top of each group |
| 50 | [x] | Nexus sync banner - ONLY show in Max+ version |
| 51 | [x] | Ward diary - remove ability to add patients to patient list from diary view (never existed/already removed) |
| 52 | [x] | Add patient modal - make room, bed, and MHA status all optional fields |
| 53 | [x] | Add patient modal - include alerts selection (ligature risk, absconding risk, etc.) |
| 54 | [x] | Add patient modal - Simple/Advanced toggle with ward admin override settings (3 states: simple only, advanced only, toggle enabled) |

## DEV PANEL & GOVERNANCE (29 Jan 2026)

| # | Status | Description |
|---|--------|-------------|
| 55 | [x] | Dev Panel route created (password gate removed Session 11) |
| 56 | [x] | Dev Panel left nav with 12 sections (Overview, Business Case, Technical, Data Catalogue, RBAC, User Flows, DPIA, Clinical Safety, Schemas, Webhooks, Nexus, References) |
| 57 | [x] | Schema Status Widget showing DRAFT status |
| 58 | [x] | DPIA draft scaffold with 7 sections |
| 59 | [x] | Clinical Safety section with hazard log starter |
| 60 | [x] | Dev Panel link added to GDPR page |
| 61 | [x] | Documentation Sync Workflow added to CLAUDE.md |
| 62 | [ ] | Complete remaining Dev Panel sections (expand content) |
| 63 | [ ] | Add "Export to PDF" buttons |
| 64 | [ ] | Add Q&A Pack for stakeholders |
| 65 | [ ] | Add Role-specific Evaluations section |
| 66 | [x] | Content verification system - VerificationProvider + VerificationBadge |
| 67 | [x] | Verification badges on Bookmarks, Referrals, and How-To Guides |
| 68 | [x] | Role-based verification modal (Report Problem, Feedback, Verify Now) |
| 69 | [x] | Dev Panel link styled as prominent button on GDPR page |
| 70 | [x] | Documentation Sync added to CRITICAL RULES (#7) |

## SNAG LIST (12 Mar 2026 - Session 11)

| # | Status | Description |
|---|--------|-------------|
| 83 | [x] | Interactive tour rewrite — shorter punchier copy, centred balanced text, Mike's tone |
| 84 | [x] | Search on referrals + how-to pages — confirmed already existed, no changes needed |
| 85 | [x] | Claim/Steal/Drop wording — "Steal" renamed to "Take Over", tooltips on all action buttons |
| 86 | [x] | Editor admin page reordered to match header nav: Bookmarks → Guides → How-To |
| 87 | [x] | Diary settings cog — unified view controls (simple/detailed, hide completed, show ward tasks) with localStorage |
| 88 | [x] | Simple diary view — 2-line compact task cards, completed hidden automatically, no priority borders |
| 89 | [x] | Site-wide password removed — middleware passes everyone through, /password redirects to home |
| 90 | [x] | Dev panel password removed — replaced with dismissible "test data" notice banner |
| 91 | [x] | Logout redirects to /login instead of /password |

## SNAG LIST (29 Mar 2026 - Session 13)

| # | Status | Description |
|---|--------|-------------|
| 92 | [x] | Guide choice-flow: Safeguarding Adults now has area selection step (city/county) with filtered forms and contacts |
| 93 | [x] | Guide choice-flow: Housing / Duty to Refer now has area selection step with filtered forms and contacts |
| 94 | [x] | Clipboard copy: all guides now auto-fill [DATE] with today, patient name (if linked), and staff name |
| 95 | [x] | Clipboard copy: area placeholders ([DERBY CITY/DERBYSHIRE COUNTY]) auto-replaced based on user choice |
| 96 | [x] | Water temperature check now Sunday-only recurring task (was every day) |
| 97 | [x] | Removed "Medication round (AM)" from ward task templates |
| 98 | [x] | My Diary: ward tasks claimed by other staff no longer show (only your claims + unclaimed) |
| 99 | [x] | Add Task modal: "Assign to Ward" / "Assign to Myself" toggle (auto-claims when Myself selected) |
| 100 | [x] | Safeguarding Hub banner on home page with 999 emergency strip, 4 quick-link cards, decision helper |
| 101 | [x] | 15 safeguarding bookmarks (new "Safeguarding" category) — FOCUS placeholders for internal numbers |
| 102 | [x] | Safeguarding Adults Referral guide (S.42 Care Act, 7 steps, content from trust training docs) |
| 103 | [x] | Safeguarding Children guide (Starting Point referral, Think Family, 5 steps) |
| 104 | [x] | Domestic Abuse Recognition guide (DA Act 2021, professional curiosity, DASH, 7 steps) |
| 105 | [x] | Peer-on-Peer Conflict guide (levels, when to escalate, staff responsibilities, 5 steps) |
| 106 | [x] | Interactive decision helper on home page ("Not sure? Help me decide" — yes/no flow to correct pathway) |
| 107 | [x] | Safeguarding bookmark strip on home page (horizontal scroll, public links only) |

## SNAG LIST (8 Jun 2026 - Session 19)

| # | Status | Description |
|---|--------|-------------|
| 130 | [x] | **/v2 PII-free clone** - route prefix that shares the codebase. Middleware rewrites /v2/* to /* and redirects blocked paths to /v2. `useIsV2()` + `v2Href()` helpers in `src/lib/hooks/useV2.ts`. |
| 131 | [x] | v2: Diary, Patients, Reports, Data Sources, Chase Log all hidden from header, mobile menu, More dropdown and footer; Today widget hidden from home. |
| 132 | [x] | v2: `+Link to Patient` button hidden in guide viewer. Follow-up Task block hidden. Patient picker modal not rendered. Log to Chase Log button hidden. |
| 133 | [x] | v2: Login + Demo Mode role picker restricted to Staff + Senior Admin only. Specific User picker filters to those two roles. |
| 134 | [x] | v2: Tour reduced to 3 sections (welcome, referrals, complete). Diary/Nexus/Kanban slides skipped. Dev Panel button hidden on complete screen. |
| 135 | [x] | v2: Intro Guide filters out Diary + My Jobs sections, rewrites Navigation tips, strips patient/job-diary mentions from Referrals. FAQ rewords "What is wardHub?" and "Who can edit" for v2. |
| 136 | [x] | Editor (Task C): root cause was `handleEditWorkflow` rendering a hardcoded 7-step stub instead of loading the real workflow. Now imports `WORKFLOWS` from `referral-workflows.ts` and deep-clones the real steps. |
| 137 | [x] | Editor: Forms step type now has a full editor - blank forms, WAGOLLs, other guides, each with label, URL, optional icon, optional note, optional area filter (City/County). `FormsEditor` + `FormsBucket` components in FlowchartEditor.tsx. |
| 138 | [x] | Editor: Submission methods now have an area filter dropdown so each method can be City-only / County-only / All areas. Read-only info panels added for section, area, consent, GDPR step types. |
| 139 | [x] | Editor: WORKFLOWS list now derived from real data file (17 workflows, was 12 hardcoded). Step counts auto-derived. |
| 140 | [x] | TourModal Rules-of-Hooks bug fixed (hook called after early return). |

## SNAG LIST (27 Jun 2026 - Session 28b: MHA build + live fixes, autonomous pass)

Mike dropped a big folder (E:\Hub\temp\wardhub docs) + prompts.md backlog and asked Claude to work through it solo. Done + pushed (commits fcdef52, c6e85b4). Build clean.

| # | Status | Description |
|---|--------|-------------|
| 202 | [x] | **Helpline number** - Derbyshire MH Helpline 0800 028 0077 switched off 1 Jul 2026; replaced with "111 (option 2)" in the crisis bookmark + Safety Plan guide. |
| 203 | [x] | **mha-checker corrections** - S4 de-flagged (now confirmed trust policy) + A9 nearest-relative option + H3 Part 1/2 + scrutiny timings; S5(2) enriched (detention starts on receipt of H1, Part 2 validity, same/next-day review + weekend Duty Consultant, 5(4) clock, no Part 4 treatment); CTO recall corrected (72h from CTO4, S62 only post-revocation, initial hospital must match but transfer allowed, CTO11/CTO12). |
| 204 | [x] | **MHL form links** - per-form fillable-PDF deep links are dead (MHLO restructured mid-2026); all now fall back to the MHLO statutory-forms index. TODO re-source stable per-form blanks. |
| 205 | [x] | **New guide: Arranging an MHA Assessment** (`/guides/arrange-mha-assessment`, red) - City/County AMHP steps from Mike's email; AMHP numbers hidden per Rule 4 (real numbers in code comment). |
| 206 | [x] | **New guide: Section 132 - Reading Patient Rights** (`/guides/section-132`, red) - from the S132 policy digest. |
| 207 | [x] | **Add-task wording** - "Link to How-To Guide" -> "Optionally match to a guide". (Dynamic/grouped guide picker still TODO - Mike's "dealers choice".) |
| 208 | [x] | **Seclusion guide** - split "appearance, mood & level of awareness" into 3 separate sections (matches live S1 form). |
| 209 | [x] | **Guidance tools** - header now shows a "pointers to think through, not a form to fill in" badge (reframes debrief etc. per Mike). |
| 210 | [ ] | **Forensic sections: PARKED + DO NOT MENTION** in paperwork-access guides (Mike's decision). |
| 211 | [ ] | **Still queued:** Home bookmark-wheel resize for 15in laptops (needs browser verify). The 86 placeholder referral-form links (link-to-source - needs per-form verification). `links task.docx` -> SystmOne FOCUS guide URLs (FOCUS login-gated; parsed: ~850 unique links, only ~20 are direct `download_file` PDFs, rest are pages/nav - saved to E:\Hub\tmp-mha\links-parsed.txt). Deepen Section 136 from its PDFs. See memory `session-28-*`. |
| 219 | [x] | **Trust policy links wired** - harvested 171 FOCUS policies; the FOCUS block (now "On FOCUS") carries both the SystmOne how-to AND the source trust policy. Policy links added to S132, S17, Capacity, Tribunal, Section 136 (S135 policy), Leave/Discharge/Transfer, + bespoke Care Plan/Risk via shared `FocusLinks` component. Maps: `tmp-mha/systmone-clinical-guides.txt` + `tmp-mha/focus-policies.txt`. Not on the corporate list (harvest separately if needed): Seclusion/LTS, Therapeutic Observations, Absent & Missing, Restraint/MoVA policies. |
| 218 | [x] | **SystmOne FOCUS links wired** - harvested the FOCUS SystmOne user-guides (264) via Chrome MCP on Mike's logged-in browser; added a `focus` field to GuideData + GuidePromptConfig and a "Record it on SystmOne" links block. Wired S132, S17, NEWS2, Capacity, Seclusion, Restraint/RT, Observation, Safety Plan. To wire next: care-plan + risk-assessment (bespoke routes), leave-discharge-transfer, admission HoNOS. Map in `E:\Hub\tmp-mha\systmone-clinical-guides.txt`. |
| 217 | [x] | **AWOL guide built** (`/guides/awol`, red) from the re-saved `.docx` - RCRP Absent vs Missing, search sequence, police Critical-Concern threshold, S135 warrant / S18 retake. |
| 216 | [x] | **Built this session (all red drafts, pushed):** `dama` (Discharge Against Medical Advice), `transfer-in` (Accepting a Transfer from a General Ward), `tribunal-report` (MHT Nursing Report), `section-136` (Place of Safety). **Section 17 guide enriched** (applies-to list, per-leave nurse duty, >7-day CTO trigger, fail-to-return) - stays amber. |
| 212 | [x] | **IMHA rewired** - Derby City provider is now Disability Direct (was POhWER), County = Cloverleaf; both wired to source (verified live), public contacts shown. |
| 213 | [x] | **Observation guide** - real DHCFT levels baked in from the Inpatient Therapeutic Observations & Engagement Policy (Feb 2025 v10): L1 arm's length (most restrictive) to L4 general; review cadence. (Policy self-contradicts on L3 review interval - used 72h.) |
| 214 | [x] | **Physical-health 5 helper tools REMOVED** (Mike: kill) - Physical Health Assessment, Falls, Personal Handling, Nutrition (MUST), Pressure (Waterlow): routes + data files + index exports + ALL_GUIDES + approval entries deleted. news2 / tissue-viability / dental remain in the category. |
| 215 | [x] | **snag 148 (data dump)** - `docs/data dump from work to sort/` untracked from git + gitignored (a `git add -A` had started tracking it). Local copies kept. UPDATE 4 Jul: `docs/focus-data-collection/*.md` untracked + gitignored (moved to E:Hub	empocus-data-collection). Both dumps remain in git HISTORY until the history rewrite (see docs/nhs-ready/01-data-governance-audit.md finding F1). |

## SNAG LIST (25 Jun 2026 - Session 28: MHA forms + v1 governance split)

Mike supplied 9 trust MHA policies (digested - see memory `session-28-mha-policies`).
Built the form-blank links + cross-ref now; split staff-identity features to v2.
Pushed live (commits 1f6e296 + 0f4c379). Build clean.

| # | Status | Description |
|---|--------|-------------|
| 197 | [x] | **mha-checker blank forms** - `MhaForm.url` added; every statutory form tile now offers a blank-form download from Mental Health Law Online fillable PDFs (the trust uses these). A2/H1/H3/H4/CTO3/CTO4 are confirmed-exact URLs; the other A/H forms follow MHL's verified short `Form_<code>_fillable.pdf` pattern (Mike to spot-check). Links render outside the OR-selector buttons to avoid nested-interactive a11y fails. H3 switched from Mike's OneDrive to MHL (admission checklist H3 left on OneDrive). |
| 198 | [x] | **mha-checker cross-ref** - companion card + empty-state link to `/guides/mha-statuses` (MHA Statuses Explained). |
| 199 | [x] | **v1 governance split** - v1 (limited build, `isV2===true`) stores no staff identity, so `/feedback` and the admin "request editor rights" button are now **mailto michael.sharpe4@nhs.net** (was localStorage board / demo toggle). Home disclaimer adds "This is v1 (guides only); v2 will add the team task diary, staff editor rights and an interactive feedback system." Real feedback board + editor approval flow stay v2 (full build). |
| 200 | [ ] | **Granular editor permissions (v2, designed not built)** - per-category editing (e.g. safeguarding lead edits Safeguarding only). Plan: add `editScope: "all" | CategoryKey[]` to the user record + a `canEditGuide(user, guide)` helper keyed on the existing guide `category`; senior-admin assigns scope + approves requests; needs the v2 backend user table. |
| 201 | [ ] | **Mike's MHA worklist (sent, pending his shift)** - source S136 policy; forensic/court receiving process; resolve IMHA City provider (One Advocacy Derby vs POhWER); show/hide AMHP + MHA numbers; confirm S62 policy currency (review date passed); spot-check MHL form links; S17 FOCUS record/amend links; pick build order for new guides (S132, S17, S62, S135(2)); Hartington->Derwent sweep; decide "arrange an MHA assessment" mini-guide. Buildable next from the policies: S4 de-flag, S5(2) enrich, CTO recall corrections, + new S132/S17/S62/S135(2) guides. See memory `session-28-mha-policies`. |

## SNAG LIST (23 Jun 2026 - Session 27: Guidance rework + status badges)

Mike's feedback on Session 25: the 10 tools shipped as chip-builders with thin
prompts, which was NOT what he wanted. He wanted the rich Copilot "prompt-as-guide"
style (why it matters + prompt-yourself questions + worked examples + tip per
question). Reworked all 10, plus added an editorial traffic-light badge system.
Pushed live (commit 4a05e03), build clean, both verified in browser.

| # | Status | Description |
|---|--------|-------------|
| 185 | [x] | **Pure-guidance rework** - all 10 clinical tools converted from chip-builders to THINKING GUIDES. New `GuidePrompts` component (`src/components/guides/GuidePrompts.tsx`) + `GuidePromptConfig` type (`src/lib/data/guides/guideprompt.ts`). Each question shows: why it matters, "prompt yourself" sub-questions, a fuller worked-examples list ("to spark thinking, not to copy"), and a tip. Collapsible, first question open, expand-all toggle. NO chips, NO assembled output, NO copy button. All 10 data files rewritten (seclusion uses Mike's full per-field prompt set incl. the exit-criteria example). |
| 186 | [x] | **Old note-builder retired** - `PromptBuilder.tsx` + `builder.ts` now unused (kept in repo, not imported). The 10 `*_BUILDER` consts kept their names but are now `GuidePromptConfig`. |
| 187 | [x] | **Traffic-light StatusBadge** (`src/components/ui/StatusBadge.tsx`) - certificate-style badge on every guide + link tile (right, mid-height): green Passed / amber Awaiting approval / red In development. Driven by central editable map `src/lib/data/approval-status.ts` (`GUIDE_APPROVAL` / `LINK_APPROVAL`, default amber). **This is Mike's editorial sign-off - to change a status, edit that file ("set X to green").** The 10 new tools are set red. Replaced the inline community `VerificationBadge` on those tiles (provider kept). |
| 188 | [x] | **Guides index self-heal** - a stale `wardhub_guide_order` in localStorage (from old editor reordering) was scattering/burying guides and resurfacing old category names. The index now drops a saved order covering <70% of current guides and always reads each guide's category from `ALL_GUIDES`. |
| 189 | [ ] | **Mike to proofread** the reworked guidance (all 10) and flip statuses to green as he signs each off. Tell Claude "set <id> to green/amber". |
| 195 | [x] | **mha-checker** - removed "(optional)" from the "Scrutiny checklist" heading (scrutiny should not read as optional). |
| 196 | [ ] | **LATER / FUTURE WORK - MHA rectifiable vs non-rectifiable errors.** Build out proper guidance in the mha-checker on which paperwork errors are rectifiable under Section 15 (minor errors, 14-day window) vs fundamental/non-rectifiable defects (e.g. missing recommendation, unqualified doctor). There is a one-line `MHA_RECTIFY_NOTE` in `src/lib/data/guides/admission.ts` already - expand into a clear section / examples list. Mike to supply Trust receipt-and-scrutiny detail. |
| 191 | [x] | **Admission checklist** - the physical-health sub-tasks (`subItems`) are now individually tickable (key `${item.id}-s${i}`, not counted in the headline progress). |
| 192 | [x] | **RMP / formulation "specific examples"** - incident date is now PARTIAL-friendly. `DatedExample` changed from `{date}` to `{day,month,year}` (Day + Month selects + Year number input); `formatPartialDate()` renders "2025", "March 2025" or "14 March 2025" and only when filled. |
| 193 | [x] | **All tick-list checklists** (admission, leave/discharge/transfer) get an optional collapsed **"Case note entry"** at the bottom (new `src/components/guides/ChecklistSummary.tsx`) building a Completed / Outstanding summary from the ticks. Low priority by design. |
| 194 | [x] | **PII fix** - guide case notes ("Completed by ...") showed `user.name`. In the limited PII-free build they now show the role (`caseNoteBy = isV2 ? (isContributor?"Editor":"Staff") : user.name`) in `src/app/guides/[id]/page.tsx`. Diary/patient modals keep names (full-build only). |
| 190 | [x] | **Leave / Discharge / Transfer checklist** (`/guides/leave-discharge-transfer`, `src/lib/data/guides/leave-discharge.ts`). Admission-checklist style + a 3-way pathway toggle: each item tagged with the pathways it applies to (`LdtItem.pathways`), filters to the selected one. 9 sections, safety-critical items red-flagged, per-item expandable guidance, tick-off + progress + print. SIRI-informed mandatory safety content. Replaces the empty "Discharge Checklist" placeholder (id now `leave-discharge-transfer`). Status: red. |

## SNAG LIST (22 Jun 2026 - Session 25: Clinical documentation builders)

Salvaged from Copilot chats (Copilot can read the Trust tenant; Claude cannot).
Kept the clinical content + the new tools; dropped Copilot's "rebuild the site as
a Clinical Prompt Engine" framing, the AI rewrite buttons (no backend) and the
MUST/Waterlow calculators (clinical-safety - Mike chose guidance-only). All new
tools follow the Session 21 "builder" family and slot into the existing /guides
index, not a new nav. Pushed live (commit c823407), build clean, flagship verified.

| # | Status | Description |
|---|--------|-------------|
| 176 | [x] | **Shared `PromptBuilder` component** (`src/components/guides/PromptBuilder.tsx`) + `BuilderConfig`/`BuilderSection` types (`src/lib/data/guides/builder.ts`). Mirrors the care-plan builder exactly (chips + free text + patient-voice quote + "not yet established" toggle + plain-text copyable output, dateLine option, notice banner). One component drives all 10 new tools so they stay consistent. No PII, no backend, renders on / and /v2. |
| 177 | [x] | **Seclusion Support Plan** (`/guides/seclusion-support-plan`, `seclusion.ts`) - FLAGSHIP. 21 exact Trust fields from the Seclusion & LTS Policy (Nov 2024 v9) + Mike's per-field "prompt yourself" questions + PEEP section. Exit-criteria section emphasised (observable, not "settled"). |
| 178 | [x] | **Post-Incident Debrief** (`/guides/debrief`, `debrief.ts`) - patient/staff/witness accounts + learning + update-loop nudges (update care plan/RMP/safety plan/PBS). Source-aligned (exact SystmOne debrief wording not available). |
| 179 | [x] | **Safety Plan** (`/guides/safety-plan`, `safety-plan.ts`) - Stanley-Brown 6 steps + Trust risk-screen alignment; cross-links to the Risk formulation builder (does not duplicate it). Nurse Tools category. |
| 180 | [x] | **Restraint & Rapid Tranq Monitoring** (`/guides/restraint-monitoring`, `restraint.ts`) - clinical monitoring / intervention monitoring / monitoring-ceased prompts, additional-risk-factors must-not-be-blank. Source-aligned with the MoVA / Positive & Safe workflow. |
| 181 | [x] | **Observation & Engagement Plan** (`/guides/observation-engagement`, `observation.ts`) - level rationale, what it means in practice per setting, what to watch for, engagement (not just surveillance), step-up/step-down triggers. |
| 182 | [x] | **Physical Health tools** (all guidance-only, NO scoring per Mike): Physical Health Assessment Helper (`physical-health.ts`), Falls Assessment Helper (`falls.ts`, NICE NG249 - no prediction score), Personal Handling Helper (`personal-handling.ts`), Nutrition (MUST) Helper (`nutrition.ts`), Pressure Area (Waterlow) Helper (`pressure.ts`). Each carries an amber "guidance only - run the validated tool on SystmOne" notice. |
| 183 | [x] | New **"Restrictive Practice"** guides category (Seclusion, Restraint/RT, Observation, Debrief) added to ALL_GUIDES + the editor's GUIDE_CATEGORIES dropdown. Safety Plan in Nurse Tools; 5 physical-health tools in Physical Health. 10 new cards total. |
| 184 | [ ] | **Mike to proofread (tonight):** clinical accuracy of every tool's prompts/chips; sign off the weak-vs-strong draft examples in each; confirm Trust field wording for the Seclusion Support Plan matches the live SystmOne form; check the Restraint/RT monitoring detail against current policy; confirm observation level names match the ward. See the numbered proofreading list handed over. |

## SNAG LIST (22 Jun 2026 - Session 26: WCAG 2.1 AA audit)

Review 3 from the Fable 5 project review (snag #78). Audited with axe-core 4.11
at runtime across home, guides, links, Team Diary, Patients, Kanban, guide viewer
and the interactive builders. App was already strong (skip link, landmarks,
global :focus-visible, prefers-reduced-motion, lang, accessible base Modal). Fixed
the concrete failures; all audited pages now return ZERO axe violations. Build
clean, 32/32 tests pass.

| # | Status | Description |
|---|--------|-------------|
| 185 | [x] | **button-name (critical):** added aria-labels to icon-only buttons - header demo-tour buttons (desktop+mobile, header.tsx), the two diary settings cogs and the ~120 task-card complete toggles (tasks/page.tsx, state-aware label + aria-pressed). Cleared 62 axe violations on Team Diary. |
| 186 | [x] | **link-name (serious):** shared Breadcrumb home link was icon-only - added aria-label="Home" (Breadcrumb.tsx). Fixes every guide/referral page. |
| 187 | [x] | **keyboard access (2.1.1):** the 4 draggable task-card roots (tasks/page.tsx) are now focusable (tabIndex + Enter/Space -> open detail, aria-label). Deliberately NOT role="button" - that wrapped the nested toggle/resource buttons and tripped axe nested-interactive. |
| 188 | [x] | **scrollable-region-focusable (serious):** day-column scroll body, Kanban board (KanbanBoard.tsx) and all 4 builder output panels (PromptBuilder.tsx + mse/risk/care-plan own panels) given tabIndex={0} + role + aria-label so keyboard users can scroll them when content is collapsed/empty. |
| 189 | [x] | **color-contrast (serious, AA 1.4.3):** NHS-theme past-day header text #9ca3af -> #6b7280 + removed compounding opacity on the weekday subtitle (globals.css + tasks/page.tsx); green "Add Task"/"Add Patient" buttons #00c950 white (2.21) -> bg-green-700/800; patients amber-600 status text -> amber-700; Kanban empty-state #9CA3AF -> #6b7280 + dropped opacity-60 hint. |
| 190 | [x] | **input labels (1.3.1):** placeholder-only search inputs (guides, links) + category select (links suggest modal) given aria-labels. |
| 191 | [x] | **dialog semantics (4.1.2):** 6 custom modals bypassed the accessible base Modal - added role="dialog" aria-modal="true" aria-label to TaskDetail, PatientPicker (both roots), PatientTransfer, StaffManagement, StaffTasks, DischargeAudit. (Base Modal + ConfirmDialog were already compliant.) |
| 192 | [ ] | **Remaining (reported, design-touching - needs Mike's eye):** (a) the broad `text-amber-600`/`text-gray-400`-on-light contrast sweep across ~24 files not on the audited pages; (b) the 4 non-NHS themes (iOS/Google/Fantastical/Notion) + dark mode have their own muted past-day greys that likely fail AA - same fix pattern; (c) custom modals still lack focus-trap + Escape-to-close (base Modal has both) - usability, not a strict AA fail. (d) keyboard drag-drop alternative for task reordering. |

## SNAG LIST (22 Jun 2026 - Session 26b: end-to-end walkthrough)

Review 5 / final item of the Fable 5 project review (snag #77). Drove the main
journeys in a real browser: login (ward/name/role + GDPR), limited build at root
(PII features correctly hidden, no console errors), full build at /v2, claim a
task (name shows, Drop/Take Over appear), My Jobs Kanban (claimed task flows
through), Patients (filters, patient tasks modal, discharge flow with correct
RBAC messaging), and the MSE builder (chips assemble live, date correct, Copy
works). Build clean, 32/32 tests pass.

| # | Status | Description |
|---|--------|-------------|
| 193 | [x] | **Walkthrough found a SYSTEMIC a11y gap the static + axe passes missed:** ~20 inline overlay modals across 13 files render with no role="dialog"/aria-modal/aria-label (they only mount on interaction, so the static DOM scan never saw them). Fixed ALL of them: patients (discharge/add-patient/edit-alerts), tasks (add-task/repeating), links (FOCUS/personal-link/recommend), feedback (display-name/discussion), reports (schedule-delivery), referrals/log (chase), staff (add), ResourceLinks (FOCUS), TourModal, VerificationBadge, admin guides (×3) + workflows + links editor + FlowchartEditor (×2). Each got role="dialog" aria-modal="true" + a descriptive aria-label. Verified discharge modal live. (Same focus-trap/Escape caveat as snag 192c still applies.) |
| 194 | [ ] | **Observation (not a bug):** demo staff/patient names are placeholders (Staff_BY_D, Dr. BY_F, Patient_BY_1). Functional, but not presentation-polished - consider realistic fictional names for the wow-factor demo. Mike's call. |
| 195 | [x] | **Checked, false alarm:** header mobile menu briefly read "Log In" in a pre-hydration DOM scan; once hydrated it correctly shows the profile / "Demo Mode" with Log out inside. No fix needed. |

| # | Status | Description |
|---|--------|-------------|
| 171 | [x] | **`/v2` <-> full build SWAP** - root is now the stripped PII-free build; the full build (Diary/Patients/Reports/My Jobs/Staff) is now under `/v2`. Inverted `useV2.ts` (`useIsV2()` true at root) + `middleware.ts` (block PII routes at root, full access under `/v2`). Wrapped bare PII-route links in the `link()` helper across header/tasks/my-tasks/TodayWidget/patients/guides. Verified: root redirects `/tasks` & `/patients`, `/v2/*` renders. See the "/v2 <-> FULL BUILD SWAP" section. |
| 172 | [x] | **Formulation builder personalised** (Risk Assessment guide). Risk picker moved to a shared top section that drives BOTH stages. New `FORMULATION_RISK_CHIPS` in `risk.ts` gives all 28 risks their own predisposing/precipitating/perpetuating/dynamic chips; "presenting" reuses each risk's RMP "present" chips; pattern/protective/engagement/judgement stay generic. |
| 173 | [x] | **"Other (unlisted risk)" free-text risk** added to the picker (`BLANK_RISK` in `risk.ts`). When picked it surfaces EVERY prompt from EVERY risk (full union, ~196 chips per section) in both the formulation and the RMP, and a "name this risk" field titles its plan. |
| 174 | [x] | **RMP copy format rebuilt for SystemOne** (Mike's feedback - S1 risk screen is a plain notepad that strips blank rows). `buildOneRmp` now heads each plan `=== RISK MANAGEMENT PLAN: <RISK> ===` and separates the 5 sections with `---` divider lines (no blank rows). Empty sections render "Not yet established."; the mandatory MDT line is still auto-appended. Same header/divider format applied to the formulation output. |
| 175 | [x] | Project evaluation run -> `docs/evaluations/2026-06-21_project-evaluation.md` (10-hat, reflects this session). |

## SNAG LIST (18 Jun 2026 - Session 22: v2 simplification)

Mike: v2 is for compliance/no-PII demos. Strip it back further.

| # | Status | Description |
|---|--------|-------------|
| 165 | [x] | **v2: Staff section removed** - Staff link hidden from More dropdown (desktop + mobile); `/staff` added to `V2_BLOCKED_PREFIXES` so `/v2/staff` redirects to `/v2`. |
| 166 | [x] | **v2: Demo roles are now Staff + Editor** (was Staff + Senior Admin). "Editor" = `staff` role + `isContributor` flag, set by new `handleEditorChange()` in header.tsx. Profile header shows "Editor"/"Staff". Login picker dropped senior_admin (staff-only; contributors keep pen badge); role grid is single-column in v2. |
| 167 | [x] | **v2: "Request Creator Privileges" repurposed** - admin page button + Editor nav stay, but in v2 the button pops "This is demo mode - change your role to Editor in the Demo Mode menu (top right)" instead of the v1 "request submitted" message. |
| 168 | [x] | **v2: ward views ditched** - "Viewing Ward" switcher hidden in Demo Mode menu (desktop + mobile). activeWard stays on the user's home ward. Specific User picker now filters to staff role only. |
| 169 | [x] | **RMP builder: risk-specific chips** (Mike's feedback). Every risk used to show the SAME "how does this present / prevent / evaluate / next steps" chips (diet got self-harm's ligature chips). New `RMP_RISK_CHIPS` in `src/lib/data/guides/risk.ts` gives all 28 risk types their own clinically-tailored chips across the 4 RMP sections (WHAT keeps the generic context box). Page merges: editor override -> risk-specific default -> generic fallback. Gap prompts + free-text + "add patient-specific detail" nudge all stay, so chips are a starting point, not the answer. |
| 170 | [x] | **RMP builder: editor can change chips.** Editors (isContributor) get an "Edit chips" toggle on Stage 2. Per risk: add/remove chips per section + "Reset to default". Saved per-device to localStorage `wardhub_rmp_chips` (shape `{[risk]:{[sectionId]:RiskChipGroup[]}}`, only edited risk/sections stored). Plain staff don't see the toggle but do see the risk-specific chips. Works on / and /v2 (v2 "Editor" role = isContributor). |

## SNAG LIST (18 Jun 2026 - Session 21: Guide builders + restructure)

Five new interactive guide tools built this session (all in the same "builder"
family: chip word-banks + free-text + assembled copyable output, render on / and
/v2, no PII, static routes overriding /guides/[id]). All grounded in trust docs.

| # | Status | Description |
|---|--------|-------------|
| 157 | [x] | **MSE builder** (`/guides/mental-state-exam`) - UK Mental State Exam. Pick descriptors per domain (Appearance...Insight), headed MSE assembles in a sticky panel, copy. Data: `src/lib/data/guides/mse.ts`. Modelled on Mike's `nocte_notes_prototype_v2_1.html` (the "notes writer"). |
| 158 | [x] | **Risk Formulation + RMP builder** (`/guides/risk-assessment`). Stage 1 formulation (best-practice framework). Stage 2: SEPARATE RMP per risk (trust rule - 28-risk picker from Mike's "RMP Mega Pack"), exact 5-heading DHCFT template, mandatory MDT line auto-locked. "HOW DOES THIS PRESENT" has a dated specific-examples sub-section. Data: `src/lib/data/guides/risk.ts`. |
| 159 | [x] | **My Care Plan builder** (`/guides/care-plan`). 9 sections from the real "My Care Plan" S1 template, patient-voice quote field per section, GAP prompts from patient prompt sheet, "unable to establish" button. Links to (does not duplicate) the RMP. Data: `src/lib/data/guides/careplan.ts`. |
| 160 | [x] | Removed placeholders: Blood Glucose + 3 Emergency guides (Seizure, Medical Emergency, Rapid Tranq) + the whole "Emergency" category (avoids needing medical-guidance approval - re-add later). |
| 161 | [x] | Category tidy: merged "Legal" into "Legal & Advocacy"; "MHA Statuses" -> "MHA Statuses Explained"; "Detention Papers" -> "Section Papers - Receipt & Scrutiny". |
| 162 | [x] | **Guide restructure** (Mike's spec): 12 categories -> 8. "Named Nurse Tools" -> "Nurse Tools" (now holds MSE/Risk/ABC/Care Plan/Named Nurse/Admission/Discharge checklists + Fridge Temps). Clinical Assessment, Ward Procedures, Discharge Planning, Psychology categories removed (contents merged; EDT+ERP -> Specialist Pathways). Safeguarding reordered (referrals, adult, children, general). "PICU Referral" -> "PICU Kingfisher Referral". Editor category dropdown updated. |
| 163 | [ ] | **Mike to verify/supply:** (a) draft weak-vs-strong examples in BOTH the Risk and Care Plan builders need sign-off. (b) Fridge Temps parked in Nurse Tools (was orphaned) - confirm home. (c) Safeguarding adult/child split borderline on Non-Recent Abuse + Information Sharing. (d) "External providers" to be added under Urgent Care. (e) Mike sourcing up-to-date info for the 3 remaining placeholders. |
| 164 | [ ] | **3 EMPTY PLACEHOLDERS REMAIN** (render generic default shell): DoLS Ward Guidance, Named Nurse Checklist, Discharge Checklist. Named Nurse + Discharge are natural Word-doc builds (crib sheet already in repo docs; Discharge could be interactive like Admission). |

## SNAG LIST (17 Jun 2026 - Session 21a: MHA + admission)

| # | Status | Description |
|---|--------|-------------|
| 153 | [x] | **MHA Detention Papers checker** - new interactive guide at `/guides/mha-checker`. Nurse picks the pathway (S2, S3, S4, Transfer in/out, CTO recall, 5(2), 5(4)); shows required statutory forms as tiles with OR logic (S2 = A2 + [A3 *or* 2xA4] + AMHP report -> complete H3) plus an optional, printable scrutiny tick-sheet. Content from Mike's admission docx + RDaSH receipt-and-scrutiny policy + 2008 Regs statutory forms (national framework, trust-agnostic). S4 flagged `verify:true` (not in trust doc). |
| 154 | [x] | **Admission Checklist** - rebuilt `/guides/admission-checklist` (was an empty stub) from Mike's "Admission checklist with help links.docx". Two grouped tick-lists (arrival/admin + assessments), any order, progress counter, print. Each item carries its embedded help links via new `ResourceLinks` chip component (FOCUS = login modal, public = open, blank form = "Form" badge). |
| 155 | [x] | New data file `src/lib/data/guides/admission.ts` (ADMISSION_CHECKLIST + MHA_PATHWAYS + MHA_SCRUTINY) exported from guides index. New `src/components/guides/ResourceLinks.tsx` (reuses FOCUS-login modal pattern). Both pages are static routes that override `/guides/[id]`, render identically on `/` and `/v2`, build clean, no PII. |
| 156 | [x] | 3 links in the source doc point to Mike's *personal* NHS OneDrive (Blank H3, Risk Management Plan, care-plan Help guides). Mike asked to wire them as-is, so they now open his OneDrive directly (see `PERSONAL` constant in admission.ts). They rely on OneDrive share permissions - swap for Trust URLs if those change. Advocacy step still points at the in-app IMHA guide ("advocacy = IMHA only"). FOCUS form links may be out of date - check as we go. |

## SNAG LIST (13 Jun 2026 - Session 20: Architecture & Security Review)

| # | Status | Description |
|---|--------|-------------|
| 141 | [x] | **SECURITY** - 3 trust-internal phone numbers were rendering live on /links (Guardianship County 01629..., Needlestick OH 01332..., Resolve 01246...). None are Google-able, so per Rule 4 they now show "Hidden in demo mode" with real numbers preserved in code comments. Verified on rendered page. |
| 142 | [x] | npm audit: 13 Next.js advisories (1 high - middleware bypass, cache poisoning, DoS) + ws fixed via `npm audit fix` (Next now 16.2.9, latest stable). Remaining moderate postcss advisory is vendored inside Next itself - waiting on upstream, do NOT run `npm audit fix --force` (it downgrades Next to 9.x). |
| 143 | [x] | Dead version-system code removed: /versions page (orphaned, only linked from unreachable lock screens), VersionCompareModal (never imported), and the always-false `hasFeature()` lock-screen gates in tasks, my-tasks, patients, admin/ward-settings. `hasFeature()` itself kept in providers (tested, always true). Removing the ward-settings gate also fixed a latent Rules-of-Hooks bug (useState after early return - same class as #140). |
| 144 | [x] | Em dash sweep: 3 in FlowchartEditor.tsx, 1 `&mdash;` in public/abc-wagoll.html - all now en dashes. |
| 145 | [x] | POhWER Advocacy bookmark removed from Links data (rule: advocacy = IMHA workflow only). Restorable from git if wanted. |
| 146 | [x] | /my-tasks meta title corrected: "My Tasks" → "My Jobs". |
| 147 | [x] | Next 16.2 deprecation resolved (Session 24): `middleware.ts` -> `proxy.ts`, exported function `middleware` -> `proxy`. `config.matcher` unchanged. Deprecation warning gone, build clean, 32/32 tests pass, routing re-probed live (root blocks /tasks & /patients, /v2/* renders, /v2/bookmarks -> /v2/links). |
| 148 | [ ] | If repo ever goes public: gitignore/purge docs/ (raw FOCUS data with real internal contacts) and note real numbers also live in src code comments. Old dev panel password also sits in CLAUDE.md history. |
| 149 | [x] | UTC date drift fixed: new shared `toLocalDateStr()` (src/lib/utils/date.ts) replaces 15 `toISOString().split("T")[0]` call sites (demo data generation, tasks-provider claim stamps, follow-up task creation in guide viewer, patients page, kanban completion). Those returned yesterday's date between midnight and 1am during BST. |
| 150 | [x] | Crash guard: corrupt `wardhub_user` in localStorage crashed every page (unguarded JSON.parse in root provider). Now wrapped in try/catch; bad value cleared, app continues logged out. |
| 151 | [x] | v2 navigation leaks fixed: (a) middleware now resolves legacy routes inside v2 (/v2/bookmarks→/v2/links, /v2/referrals[/id] and /v2/how-to[/id]→/v2/guides[/id]) - previously the v1 redirect stubs silently dropped the /v2 prefix; (b) v2Href wrapping added to GDPR page (feedback + dev panel links), 404 page, patient-guides index + viewer prev/next/back nav, and tour-return router.push("/") in guide viewer. Header /tasks links were already correctly !isV2-gated (audit false positive). |
| 152 | [x] | 404 page: stale Referrals + How-To quick-link cards (pointed at redirect stubs) merged into one Guides card. |

## SNAG LIST (30 Mar 2026 - Session 14)

| # | Status | Description |
|---|--------|-------------|
| 108 | [x] | Follow-up task bug: button now creates task after patient picker selection (was silently failing) |
| 109 | [x] | Follow-up task: added second example "Revisit assessment in 14 days" |
| 110 | [x] | TodayWidget: replaced 2 footer links with 3 top-row nav buttons (Team Diary, My Diary, My Jobs) |
| 111 | [x] | Safeguarding: merged Hub banner + Links strip into one clean white card |
| 112 | [x] | My Diary: visible toggle "My tasks only" / "My tasks + my patients" with filter logic fix |
| 113 | [x] | Kanban: "Today" column renamed to "Not Started" |
| 114 | [x] | Repeat tasks: defensive Array.isArray() checks on recurringDays |
| 115 | [x] | Date hardening: formatDate() uses local date components (fixes midnight UTC drift) |
| 116 | [x] | Full rename: "Ward Diary" to "Team Diary", "Ward Tasks" to "Team Tasks" across 15 files (~70 replacements) |
| 117 | [x] | Demo mode: "Specific User" picker shows 20 staff from current ward with name + role |
| 118 | [x] | Editor: merged Guides + How-To cards into one, removed Ward Settings card |
| 119 | [x] | Repeatable patient tasks (daily/weekly/fortnightly/4-weekly) with interval picker in Add Task modal |
| 120 | [x] | Style themes (NHS Default, iOS, Material, Windows Fluent, Samsung OneUI) in Demo Mode dropdown |
| 121 | [x] | Em dash removal - zero em dashes remaining in src/, 39 HTML entities fixed in Dev Panel |
| 122 | [x] | Intro guide deep review - updated nav, renamed My Jobs, added three-way toggle, safeguarding, themes |
| 123 | [x] | Diary UX declutter - animated sections, compact headers, inline expand button |
| 124 | [x] | Changed "[INTERNAL - See FOCUS]" to "Hidden in demo mode" across bookmarks, guides, and dev panel |
| 125 | [x] | Live demo disclaimer on home page ("This site is under active development") |
| 126 | [x] | FOCUS data integrated: 52 new bookmarks (89 total) across 8 new categories |
| 127 | [x] | Diary scroll fix: today centred on load (focusedDate initialised to today) |
| 128 | [x] | Diary width fix: focused column wider (w-80/w-96) so tasks are readable |
| 129 | [x] | Removed Weekly Schedule grid from Repeat Team Tasks modal (cluttered duplicate) |

---

## MIGRATION NOTE (30 Mar 2026)

**Mike is moving E:\Hub to a cloud drive and switching computers.**

On first session on the new machine:
1. Copy `E:\Hub\tmp-migration\MEMORY.md` to `~/.claude/projects/<project-path>/memory/MEMORY.md`
   - The `<project-path>` is based on the repo's absolute path with separators replaced (e.g. `E--Hub` or similar)
   - Claude creates this folder structure on first run - check `~/.claude/projects/` after launching once
2. Run `gh auth login` as **Sharpy20** and then `gh auth setup-git`
3. Run `npm install` in the repo
4. Delete `E:\Hub\tmp-migration/` once MEMORY.md is in place
5. Remove this migration note from CLAUDE.md

---

## /v2 <-> FULL BUILD SWAP (21 Jun 2026, Session 23)

**THE SWAP:** the two experiences traded URLs. The **root domain (wardhub.live) is now the stripped, PII-free build**; the **full build (Team Diary, Patients, Reports, My Jobs, Staff) now lives under `/v2`**. Mike wanted the public link to be the limited version and the full feature set one click away at `/v2`.

**Implemented by inverting just two files (the 124 `isV2` call sites were left untouched):**
- `src/lib/hooks/useV2.ts`: `useIsV2()` still means "is this the stripped/limited experience" but now returns **true at root** and **false under `/v2`**. The link helper (`useV2Href`/`v2Href`) prefixes `/v2` only when under the `/v2` prefix (the full build), so navigation stays inside whichever build you are in.
- `src/proxy.ts` (was `middleware.ts` until Session 24): under `/v2`, rewrite to the real route with **no blocking** (full access); at root, **block** the full-build/PII routes (redirect home).
- Bare `<Link href="/tasks|/patients|/reports|...">` in full-only features (header, tasks, my-tasks, TodayWidget, patients, guides chase-log) were wrapped in the `link()` helper so they keep the `/v2` prefix. My-Diary links now point at `/tasks?view=my-diary` directly (the `/my-diary` server-redirect stub would otherwise drop the prefix).
- **Naming debt:** `isV2 === true` now means "limited" and is true when NOT under `/v2`. Documented heavily in `useV2.ts`. Consider renaming to `isLimited` later.

**Purpose (unchanged):** Mike is awaiting PII storage approval, so the limited build is a stripped demo with no patient data anywhere. Lives in the same codebase to avoid drift.

**How it works (post-swap):**
- `src/proxy.ts` (the Next 16.2 rename of `middleware.ts`) detects `/v2` and `/v2/*`, rewrites them to `/` and `/*` so the existing pages render with FULL access. At the root, the full-build/PII routes (diary/patients/reports/data-sources/chase log/staff) redirect to `/`.
- `src/lib/hooks/useV2.ts` exposes `useIsV2()` (reads `usePathname()`) and `useV2Href()` (returns a function that prefixes `/v2` to internal hrefs when in v2).
- Components that touch v1-only features check `isV2` and either hide the UI or rewrite copy.

**v2 hides:** Diary tab, Patients tab, Staff section (More menu + /staff route blocked), Today widget on home, Data Sources menu item, Progress Reports menu item, Chase Log link on Guides, Link to Patient button on guide viewer, Follow-up Task block on completion, Add Follow-up button on Reminder step, Log to Chase Log button on referral completion, Patient picker modal, the "Viewing Ward" switcher in Demo Mode (no cross-ward views).

**v2 restricts:** Demo roles to **Staff + Editor** (Session 22). "Editor" is not a real role - it is the `staff` role with the `isContributor` flag set, toggled by the Staff/Editor buttons in the Demo Mode menu (`handleEditorChange` in header.tsx). Login picker shows plain staff only (contributors carry a pen badge). The "Request Creator Privileges" button (admin page) and the Editor nav item stay visible, but in v2 the request button just pops "This is demo mode - change your role to Editor in the Demo Mode menu" instead of the v1 "request submitted" copy.

**v2 rewrites:** Hero subtitle, footer tagline, Tour (3 sections only), Intro Guide sections + tips, FAQ answers.

**v2 keeps everything else as-is:** GDPR page untouched. /patient-guides (educational leaflets, no PII) accessible.

**Audit notes:**
- `/dev-panel?section=data-sources` is reachable inside the dev panel even in v2 — only the route `/data-sources` is blocked, and the dev panel content is metadata about data classification, not actual patient data.
- The chase log (`/referrals/log`) is route-blocked in v2.
- If you add a new PII-touching feature later, add the route to `V2_BLOCKED_PREFIXES` in middleware AND wrap any links to it in `link(...)`.

## CURRENT FOCUS

**PROJECT REVIEW COMPLETE (23 Jun 2026 - Sessions 24/26/26b).** All 5 parts of the
Fable 5 project review are done and pushed (Sharpy20): (1) correctness, (2)
architecture/dead-code, (4) security/PII - all from Session 20; (3) WCAG 2.1 AA
audit - snags 185-192; (5) end-to-end walkthrough - snags 193-195. Also done:
middleware.ts -> proxy.ts migration (snag 147). Build clean, 32/32 tests pass.

**Open follow-ups for next session:**
- Snag 192 (a11y, design-touching, needs Mike's eye): broad contrast sweep beyond
  audited pages; non-NHS themes + dark mode contrast; modal focus-trap + Escape.
- Snag 194: demo placeholder names (Staff_BY_D / Patient_BY_1) - polish call.
- Snags 184 / 163-164: Mike to proofread the clinical builder tools + 3 empty
  placeholder guides.
- #75 loading skeletons, #76 diary keyboard nav, #79 print stylesheet.
- npm audit: ~20 moderate/low, all vendored in Next/postcss. Do NOT run
  `npm audit fix --force` (downgrades Next to 9.x).

**TO-DO LIST:**

### UX & Visual Customisation
| # | Status | Description |
|---|--------|-------------|
| 71 | [x] | **Light/Dark mode toggle** - Light/Dark/Auto in Demo Mode dropdown, persisted to localStorage |
| 72 | [x] | **Style themes** - 5 themes (NHS, iOS, Material, Windows Fluent, Samsung OneUI) via CSS custom properties |
| 73 | [x] | **Appearance settings** - Dark mode CSS overrides for all key elements |

### Dev Panel & Governance
| # | Status | Description |
|---|--------|-------------|
| 62 | [x] | Dev Panel sections expanded (content + em dash cleanup) |
| 63 | [x] | Print buttons on Q&A Pack and Evaluations sections |
| 64 | [x] | Q&A Pack - 12 stakeholder questions with answers |
| 65 | [x] | Role-specific Evaluations - 5 perspectives (Staff, Manager, IT, IG, Patient) |

### Polish & Quality
| # | Status | Description |
|---|--------|-------------|
| 74 | [x] | Mobile responsiveness pass (quick actions, bookmarks, diary, safeguarding grid, intro guide) |
| 75 | [ ] | Loading skeletons on data-heavy pages (patients, tasks, diary) |
| 76 | [ ] | Keyboard navigation for ward diary |
| 77 | [x] | End-to-end walkthrough testing (Session 26b) - drove main journeys in-browser; found + fixed a systemic modal a11y gap (snag 193). |
| 78 | [x] | WCAG 2.1 AA accessibility audit (Session 26) - axe-core runtime audit, all audited pages now clean. Residual design-touching contrast + theme work tracked in snags 185-192. |
| 79 | [ ] | Expand print stylesheet for reports |

### Phase 8: Nexus Integration & Business Case — COMPLETE
| # | Status | Description |
|---|--------|-------------|
| 80 | [x] | Nexus Assurance integration (replaced SystemOne) |
| 81 | [x] | Business Case section in Dev Panel |
| 82 | [x] | Interactive Demo Tour with live walkthrough |

---

**Recently Completed (30 Mar 2026 - Session 15b - FOCUS Integration):**
- ✅ Live demo disclaimer added to home page (friendly dev note below hero)
- ✅ Footer em dash fixed (&mdash; to &ndash;)
- ✅ FOCUS data integrated: 52 new bookmarks across 8 new categories (89 total, up from 37)
- ✅ New categories: Mental Health Act, Patient Safety, Infection Control, Pharmacy, Wellbeing, Chaplaincy, Estates & Facilities, IT Support
- ✅ Category configs and carousel icons updated for all new categories
- ✅ Trust-internal numbers shown as "Hidden in demo mode" with real data in code comments

**Previously Completed (30 Mar 2026 - Session 14 — Bug Fixes, Rename & UX):**
- ✅ Follow-up task bug fixed (created task after patient picker, added second example)
- ✅ TodayWidget: 3 nav buttons (Team Diary / My Diary / My Jobs) replacing footer links
- ✅ Safeguarding section merged into one clean white card (dropped heavy red gradient)
- ✅ My Diary toggle: visible "My tasks only" vs "My tasks + my patients" with working filter
- ✅ Kanban "Not Started" column (was "Today")
- ✅ Repeat tasks display: defensive Array.isArray() checks prevent ghost tasks
- ✅ Date hardening: local date components prevent midnight UTC timezone drift
- ✅ Full rename: "Ward Diary/Tasks" to "Team Diary/Tasks" across 15 files (~70 replacements)
- ✅ Demo mode: Specific User picker (20 staff from current ward, name + role)
- ✅ Editor: merged Guides + How-To cards, removed Ward Settings
- ✅ Contact data classification table added to Dev Panel
- ✅ FOCUS data collection: 300+ entries across 6 Chrome Claude sessions saved to docs/

**Recently Completed (30 Mar 2026 - Session 15 - Overnight Batch):**
- ✅ #124: "[INTERNAL - See FOCUS]" replaced with "Hidden in demo mode" across bookmarks, guides, dev panel
- ✅ #121: Em dash removal - zero em dashes in src/, 39 HTML entities fixed in dev panel
- ✅ #119: Repeatable patient tasks - daily/weekly/fortnightly/4-weekly with interval picker and repeat icon
- ✅ #120: Style themes - 5 themes (NHS, iOS, Material, Windows Fluent, Samsung OneUI) with CSS variables
- ✅ #122: Intro guide deep review - updated nav, My Jobs, three-way toggle, safeguarding, themes
- ✅ #123: Diary UX declutter - animated expand/collapse, compact headers, inline minimize button
- ✅ #71-73: Light/Dark mode toggle (Light/Dark/Auto) with dark CSS overrides
- ✅ #74: Mobile responsiveness - quick actions, bookmarks header, diary columns, safeguarding grid
- ✅ #62-65: Dev Panel expansion - Q&A Pack (12 questions), Role Evaluations (5 perspectives), print buttons

**Previously Completed (29 Mar 2026 - Session 13 — Diary Fixes + Safeguarding Hub):**
- ✅ **Safeguarding Hub** on home page: bold red banner, 999 strip, 4 quick-link cards, decision helper
- ✅ Interactive "Not sure? Help me decide" flow — walks staff through to correct pathway
- ✅ 15 safeguarding bookmarks (new category) — DHCFT advice, MASH, referral forms, DASH, MCA, cuckooing
- ✅ 4 safeguarding how-to guides: Adults Referral, Children/Starting Point, Domestic Abuse, Peer Conflict
- ✅ Content sourced from DHCFT Level 3 training PowerPoint + 4 trust guidance documents
- ✅ Guide choice-flow expanded: Safeguarding Adults + Housing/DTR now have area step (city/county filtering)
- ✅ Smart clipboard: all guide case notes auto-fill date, patient name, staff name, and area choices
- ✅ My Diary filter fixed: only shows ward tasks you claimed or unclaimed ones (not other people's)
- ✅ Water temperature check changed to Sunday-only recurring task
- ✅ Medication round (AM) removed from ward task templates
- ✅ Add Task modal: new "Assign to Ward" / "Assign to Myself" toggle

**Previously Completed (22 Mar 2026 - Session 12 — Pre-Demo Overhaul):**
- ✅ Nav restructured: [Diary] [Bookmarks] [Guides] [Patients] + [More] + [Help] + [Demo Mode]
- ✅ Unified /guides page merging referrals + how-to with tab filters (Referrals/Assessments/Tasks)
- ✅ Three-way diary toggle: Ward Diary / My Diary / My Jobs
- ✅ Drag-and-drop tasks between day columns in ward diary
- ✅ Recurring ward tasks show on all matching days (not just today)
- ✅ Expanded day view: header stays visible, settings cog, day nav with date picker, floating + button
- ✅ Expand/collapse icon toggle on day columns (Maximize2/Minimize2)
- ✅ All three column headers always visible in expanded view (empty = "None scheduled — tap to add")
- ✅ Add Task date defaults to viewed day, not today
- ✅ Day column expand rules fixed: past=collapsed, today=expanded, future=collapsed, focused=all expanded
- ✅ Help button with toolbar mode (Interactive Demo, Intro Guide, FAQ, Feedback + "Try different roles!" arrow)
- ✅ New Staff management page (/staff) — directory with multi-ward assignment, Lead+ editable
- ✅ Patient list: removed alerts and room/bed, kept name/ward/WP/Dr/tasks
- ✅ Side nav arrows on guide viewers (NHS blue, tall, fixed to viewport edges)
- ✅ Editor improvements: Create New with templates, branch empty states, preview fix, pinned End Point
- ✅ Dev panel: priority dot legend, clickable external links, RBAC discharge wording, print button, accessibility
- ✅ Feedback page: fixed Supabase error, switched to localStorage-based storage
- ✅ Onboarding banner for new users (dismissible, not shown to Admin roles)
- ✅ "AI Generated" badges → "Demo Content" (muted grey)
- ✅ Removed Max+ ticker, What's New section, shrunk home banner
- ✅ Demo diary items reduced ~50% for cleaner presentation
- ✅ Daily clinic checks added to ward task templates (early shift, daily)
- ✅ Full code audit: npm audit fix (0 vulnerabilities), dead code removed, .claude/ gitignored
- ✅ 10-hat project evaluation completed (docs/evaluations/2026-03-22_project-evaluation.md)

**Status: DEMO-READY.** Trust approval meeting pending.

**Previously Completed (12 Mar 2026 - Session 11):**
- ✅ Interactive tour rewritten with Mike's tone (8 screens, shorter punchier copy)
- ✅ "Steal" renamed to "Take Over" with descriptive tooltips on Claim/Take Over/Drop
- ✅ Editor admin reordered: Bookmarks → Guides → How-To (matches header nav)
- ✅ Diary settings cog: simple/detailed view toggle, hide completed, show ward tasks — all persisted to localStorage
- ✅ Simple diary view: 2-line compact cards, completed tasks auto-hidden
- ✅ Site-wide password protection removed (open for testing)
- ✅ Dev panel password gate removed, replaced with dismissible "test data" notice

**Previously Completed (28 Feb 2026 - Session 8):**
- ✅ Renamed "Normal User" role to "Staff" across entire codebase (7+ files)
- ✅ Changed "Contributor" from standalone role to orthogonal `isContributor` flag on any role
- ✅ Added Lead and Manager roles (5 roles: Staff, Lead, Manager, Ward Admin, Senior Admin)
- ✅ Ward Professional field on patients — selectable from Staff/Lead/Manager only
- ✅ WP changeable via inline dropdown on patient cards + Add Patient modal
- ✅ Creator privileges request flow on admin page (visible to all logged-in users)
- ✅ Editor link now visible to all users (non-contributors see "Request creator privileges")
- ✅ Priority-based task tile colors across diary and My Tasks
- ✅ My Patients toggle and Lead staff filter in diary/task views
- ✅ 72-hour admission audit tasks auto-generated for new patients
- ✅ Removed console.log statements with PII (4 files)
- ✅ Replaced browser alert() for FOCUS bookmarks with styled modal
- ✅ Updated Dev Panel: RBAC, permissions matrix, data catalogue, schemas (5 roles + contributor flag)
- ✅ Dynamic admin dashboard bookmark count from actual data
- ✅ ARIA labels on header dropdown buttons
- ✅ NHS trust branding in hero section and footer
- ✅ Breadcrumb component on referral and how-to detail pages
- ✅ Enhanced version switcher with descriptive sublabels
- ✅ Quick footer links (Privacy | Data Sources | Feedback)

**Previously Completed (29 Jan 2026 - Session 7):**
- ✅ Dev Panel with password gate, 11 sections, governance docs
- ✅ Content verification system with VerificationBadge
- ✅ Priority-grouped tasks in ward diary

**Previously Completed (28 Jan 2026 - Session 6):**
- ✅ Patient tasks modal, searchable patient dropdown, Add Patient with Simple/Advanced
- ✅ Ward Admin Settings page (6 tabs), WardSettingsProvider
- ✅ Bookmark favorites on home page, star toggle

**Previously Completed (27 Jan 2026 - Session 5):**
- ✅ Assurance Dashboard integration, Patient Progress Reports page
- ✅ Audit task types, fridge temp guide, scheduled report delivery

**Previously Completed (26 Jan 2026 - Session 4):**
- ✅ Major polish pass: error boundaries, accessibility, FAQ, 404, skeletons, print styles
- ✅ Login flow rework, bookmark management, community feedback

**Previously Completed (25 Jan 2026 - Session 3):**
- ✅ Ward tasks, patient list, transfers, discharge, 20 snag items

---

## QUESTIONS FOR MIKE

*All initial questions answered - see Session Notes*

---

## SESSION NOTES

### 24 January 2026 - Session 1
- Created CLAUDE.md project file
- Defined 4-tier version system (Light/Medium/Max/Max+)
- Mapped feature matrix across versions
- Outlined project structure

**Clarifications from Mike:**
- [x] Fictional patient names approved (Alex Morgan, Jordan Taylor, etc.)
- [x] Wards: Use poet pseudonyms - Byron, Shelley, Keats, Wordsworth, Dickinson
- [x] Workflows: Don't need real-world accuracy yet, use standard template
- [x] Standard workflow flow defined (criteria → form → WAGOLL → guides → submit → case note → diary reminder → GDPR tip)
- [x] Bookmarks: No version restrictions currently, use "FOCUS login needed" badge for internal links
- [x] Home page: Bookmark carousel with spokes, category arrows, "More" spoke when needed

### 24 January 2026 - Session 2 (Build Started)
**Completed:**
- [x] Next.js 16 project initialized with TypeScript + Tailwind
- [x] NHS colour theme configured in globals.css
- [x] Version/feature flag system in providers.tsx
- [x] Base UI components: Button, Card, Badge, Modal
- [x] Layout components: Header, Footer, MainLayout
- [x] Demo login page with role/ward selection
- [x] GDPR modal (shows once per session)
- [x] Home page with quick actions and bookmark carousel
- [x] Bookmarks page with category filtering
- [x] Referrals hub page with workflow cards
- [x] Referral workflow viewer (8-step standard template)
- [x] How-To guides index and guide viewer
- [x] GDPR information page
- [x] Build passes successfully

**To run locally:**
```bash
cd E:\Hub\inpatient-hub
npm run dev
```
Then open http://localhost:3000

**Project folder:** E:\Hub\inpatient-hub

### 25 January 2026 - Session 3 (Major Feature Build)
**Completed:**
- [x] Expanded demo data: 100 staff (20 per ward), 100 patients (20 per ward)
- [x] Matched bookmarks filter/styling across referrals and how-to guides
- [x] Ward toggle in header for cross-ward viewing
- [x] Active ward state separate from user's home ward
- [x] Cross-ward My Tasks view (Kanban board)
- [x] "Steal" functionality for taking over claimed tasks
- [x] Task detail modal with full view, edit, and action capabilities
- [x] Patient list page with status filtering
- [x] Patient transfer modal with task migration
- [x] Recent discharges list with confirmation status
- [x] Discharge audit modal with task completion log
- [x] Ward admin discharge confirmation workflow
- [x] Nexus integration research completed
- [x] CLAUDE.md roadmap updated

**New Components:**
- `src/components/modals/TaskDetailModal.tsx`
- `src/components/modals/PatientTransferModal.tsx`
- `src/components/modals/DischargeAuditModal.tsx`
- `src/app/patients/page.tsx`

**New Documents:**
- Dev Panel: Nexus Assurance section

**Build Status:** All builds pass successfully

### 26 January 2026 - Session 4 (Polish & Quality)
**Completed:**
- [x] Expanded day view in ward diary with shift filters
- [x] Compact task cards (shift labels as tooltips)
- [x] Data sources link added to Settings dropdown
- [x] Renamed "Ward Diary" to "Diary" and "My Tasks" to "Tasks" in header
- [x] Fixed footer text contrast issues
- [x] Bookmark management for contributors (new admin page)
- [x] Derbyshire MH Helpline moved to top of Crisis Support
- [x] Project evaluation document created (10 perspectives)
- [x] Error boundaries added
- [x] Accessibility improvements (focus indicators, ARIA labels, reduced motion)
- [x] Security headers added
- [x] FAQ page created
- [x] GDPR data retention section added
- [x] Custom 404 page
- [x] Page meta titles
- [x] Back to top button
- [x] Print styles
- [x] Confirmation dialogs component
- [x] Loading skeleton components
- [x] Empty state improvements
- [x] "Request a Feature" category in community feedback with "is related to..." dropdown
- [x] Task cards: referral/guide links moved to right side (same row as claim/steal)

**New Files Created:**
- `src/app/not-found.tsx` - Custom 404 page
- `src/app/faq/page.tsx` - FAQ page with 8 questions
- `src/components/ui/error-boundary.tsx` - Error boundary component
- `src/components/ui/Skeleton.tsx` - Loading skeleton component
- `src/components/ui/back-to-top.tsx` - Back to top button
- `src/components/ui/confirm-dialog.tsx` - Confirmation dialog component
- Layout files with meta titles for all routes

**Build Status:** All builds pass successfully

### 29 January 2026 - Session 7 (Dev Panel & Governance)
**Completed:**
- [x] Dev Panel route with password gate (access code: `Eft3&d3`)
- [x] 11-section left navigation with priority indicators
- [x] Schema Status Widget (DRAFT/LIVE/UNKNOWN states)
- [x] Overview section with 60-sec pitch and 5-min deep dive
- [x] Technical Spec with stack inventory and C4 diagrams (ASCII)
- [x] Data Catalogue with entity overview and PII classification
- [x] RBAC Matrix with role definitions and permissions table
- [x] User Flows for referral workflow, task lifecycle, discharge
- [x] DPIA Draft scaffold (7 sections with sign-off checklist)
- [x] Clinical Safety section (DCB 0129/0160, hazard log starter)
- [x] Supabase Schemas section (draft tables, RLS policies)
- [x] Assurance Webhooks spec with Power Automate example
- [x] Nexus Assurance (MAX+) section with webhook spec and linked task types
- [x] References section (Trust policies, external standards)
- [x] Dev Panel link on GDPR page
- [x] Documentation Sync Workflow added to CLAUDE.md

**New Files Created:**
- `src/app/dev-panel/page.tsx` - Complete Dev Panel with all sections

**Access:**
- Navigate to GDPR & Privacy page → small "dev panel" link at bottom
- Password: `Eft3&d3`

**Build Status:** All builds pass successfully

### 28 February 2026 - Session 8 (Roles Rework & Audit Polish)
**Completed:**
- [x] Renamed "Normal User" role to "Staff" across 7+ files
- [x] Changed "Contributor" from standalone role to `isContributor` boolean flag on any role
- [x] Added Lead and Manager roles (5 roles total: Staff, Lead, Manager, Ward Admin, Senior Admin)
- [x] Added Ward Professional field to patients — selectable from Staff/Lead/Manager (not admin roles)
- [x] WP changeable via inline dropdown on patient cards and in Add Patient modal
- [x] `getWardProfessionalCandidates()` helper function in staff data
- [x] Creator privileges request flow on admin dashboard (accessible to all logged-in users)
- [x] Editor link visible to all users in header (non-contributors see "Request creator privileges")
- [x] Priority-based task tile colors across ward diary and My Tasks
- [x] My Patients toggle and Lead staff filter in diary/task views
- [x] 72-hour admission audit tasks auto-generated for new patients
- [x] Full product audit: security, accessibility, UX, governance
- [x] Removed all console.log with PII (4 files)
- [x] Replaced FOCUS badge browser alert() with styled modal dialog
- [x] Updated Dev Panel: RBAC roles/permissions, data catalogue, Supabase schemas, RLS policies
- [x] Dynamic bookmark count on admin dashboard
- [x] ARIA labels on header dropdowns
- [x] NHS trust branding in hero section and footer
- [x] Breadcrumb component on referral/how-to detail pages
- [x] Enhanced version switcher with sublabels
- [x] Quick footer links row (Privacy | Data Sources | Feedback)

**Key Files Modified:**
- `src/lib/types/index.ts` — UserRole union, DEMO_USERS, dischargeInitiateRoles
- `src/app/providers.tsx` — UserRole type
- `src/lib/data/staff/index.ts` — Role generation, getWardProfessionalCandidates
- `src/lib/data/tasks/index.ts` — WP generation from candidates
- `src/components/layout/header.tsx` — Editor link for all users, ARIA labels
- `src/app/admin/page.tsx` — Creator request flow, dynamic counts
- `src/app/patients/page.tsx` — WP editing, WP in Add Patient
- `src/app/bookmarks/page.tsx` — FOCUS styled modal
- `src/app/dev-panel/page.tsx` — RBAC, schemas, data catalogue updates
- `src/app/page.tsx` — NHS branding, version switcher
- `src/components/layout/footer.tsx` — Trust branding, quick links
- `src/components/ui/Breadcrumb.tsx` — New component

**Commits:**
- `1bfa660` — Lead/Manager roles, contributor flag, My Patients filter, priority tile colors
- `910207b` — Rename normal to staff, changeable ward professional, creator request flow
- `ee2036e` — Audit: security fixes, ARIA labels, NHS branding, breadcrumbs, dev panel updates
- `be25560` — Fix: Editor link visible to all users for creator privilege requests

**Build Status:** All builds pass successfully

### 12 March 2026 - Session 11 (Design Refresh & Password Removal)
**Completed:**
- [x] Interactive tour rewritten — 8 screens with Mike's tone: "Your ward's go-to guide", "Walk through a referral", "A simple diary for the ward", "Diary to guide in one tap", "Never miss an audit", "Guides help you finish it", "Your own space", "Have a play"
- [x] Tour text centred with balanced word wrap (CSS `text-wrap: balance`, `max-w-xs/sm`)
- [x] "Steal" → "Take Over" across diary, my-tasks, and task detail modal
- [x] Tooltips added: Claim ("Assign this task to yourself"), Take Over ("Assigned to {name} — reassign to yourself"), Drop ("Release this task so others can pick it up")
- [x] Editor admin page cards reordered: Bookmarks → Guides → How-To (matches header nav)
- [x] Editor card labels updated: "Workflows" → "Guides", "Guides" → "How-To"
- [x] Diary settings cog (Settings2 icon) replacing scattered toggles
- [x] Settings popover: Simple/Detailed view toggle, Hide completed checkbox, Show ward tasks checkbox
- [x] All diary settings persisted to localStorage (`wardhub_diary_view`, `wardhub_hide_completed`, `wardhub_show_ward_tasks`)
- [x] SimpleTaskCard component: single-row compact cards (icon + title + patient + action button)
- [x] Simple view: completed tasks auto-hidden, no priority group borders, tighter spacing
- [x] Site-wide password middleware removed — all routes open
- [x] /password page redirects to home
- [x] Dev panel password gate removed, dismissible amber "test data" notice added
- [x] Logout redirects to /login (was /password)
- [x] Unused imports cleaned up (Lock, Button, useEffect from dev-panel)

**Key Files Modified:**
- `src/components/tour/TourWelcome.tsx` — Rewritten welcome screen
- `src/components/tour/TourModal.tsx` — All 8 tour screens rewritten
- `src/components/tour/TourSlideshow.tsx` — Centred text with balanced wrap
- `src/app/tasks/page.tsx` — SimpleTaskCard, diary settings cog, Take Over wording, settings persistence
- `src/components/modals/TaskDetailModal.tsx` — Take Over wording + tooltips
- `src/app/admin/page.tsx` — Reordered cards: Bookmarks → Guides → How-To
- `src/middleware.ts` — Password protection removed
- `src/app/password/page.tsx` — Redirects to home
- `src/app/dev-panel/page.tsx` — Password gate removed, test data notice added
- `src/components/layout/header.tsx` — Logout goes to /login

**Commits:**
- `2c6146f` — Design refresh: tour rewrite, claim wording, editor order, diary settings cog
- `e3cb85e` — Remove password gates from site and dev panel

**Build Status:** All builds pass successfully

### 22 March 2026 - Session 12 (Pre-Demo Overhaul)
**Completed:**
- [x] Full nav restructure: merged Diary+Tasks, merged Guides+How-To, moved Patients to main nav
- [x] Three-way diary toggle: Ward Diary / My Diary (WP filter) / My Jobs (kanban)
- [x] Drag-and-drop task rescheduling between day columns
- [x] Recurring ward tasks display on all matching days
- [x] Expanded day view overhaul: header stays visible, settings cog, day nav, floating + button
- [x] Day column expand/collapse rules fixed (persistent bug from multiple sessions)
- [x] Help toolbar with Interactive Demo, Intro Guide, FAQ, Feedback tabs
- [x] Staff management page (/staff) with multi-ward assignment
- [x] Patient list cleanup (removed alerts, room/bed)
- [x] Side navigation arrows on guide/workflow viewers
- [x] Editor improvements (Create New, branch UX, preview fix)
- [x] Dev panel improvements (priority dots, links, RBAC, print, accessibility)
- [x] Feedback page fixed (localStorage instead of Supabase)
- [x] New user onboarding banner
- [x] Demo polish (badges, ticker removal, banner shrink, diary item reduction)
- [x] Daily clinic checks ward task added
- [x] Full code audit + npm audit fix (0 vulnerabilities)
- [x] 10-hat project evaluation generated

**Key Files Modified:**
- `src/app/tasks/page.tsx` — Major diary restructure (3-way toggle, drag-drop, expand rules, settings in expanded view)
- `src/app/my-tasks/page.tsx` — Renamed to My Jobs, removed staff controls
- `src/app/my-diary/page.tsx` — NEW: My Diary redirect
- `src/app/guides/page.tsx` — NEW: Unified guides page
- `src/app/staff/page.tsx` — NEW: Staff management page
- `src/app/feedback/page.tsx` — Fixed: localStorage instead of Supabase
- `src/components/layout/header.tsx` — Nav restructure, Help toolbar, Demo Mode
- `src/components/admin/FlowchartEditor.tsx` — Editor improvements
- `src/app/dev-panel/page.tsx` — Accessibility, print, RBAC, links
- `src/app/page.tsx` — Onboarding banner, shrunk banner, removed What's New

**New Documents:**
- `docs/evaluations/2026-03-22_project-evaluation.md` — Full 10-hat evaluation

**Build Status:** All builds pass. 0 npm vulnerabilities. Git clean (Sharpy20 only).

### 29 March 2026 - Session 13 (Diary & Guide Improvements)
**Completed:**
- [x] Guide choice-flow: Safeguarding Adults and Housing/DTR now have area selection step (city/county)
- [x] Area selection filters forms, guides, and submission contacts automatically
- [x] Smart clipboard copy: all guide case notes auto-fill [DATE], patient name, staff name, area choices
- [x] IMHA clipboard now also includes patient and staff names
- [x] My Diary filter fixed: ward tasks claimed by other staff no longer appear
- [x] My Diary shows: unclaimed ward tasks + ward tasks you claimed + your WP patient tasks
- [x] Water temperature check changed from daily to Sunday-only (recurringDays: [0])
- [x] Removed "Medication round (AM)" from ward task templates
- [x] Add Task modal: "Assign to Ward" / "Assign to Myself" toggle
- [x] Assign to Myself auto-claims the task with current user name

**Key Design Decisions:**
- Guide choice-flow uses simple React state scoped to the workflow viewer — forgotten on navigate away
- Clipboard text replacement is additive: fills what it can, leaves [PLACEHOLDER] brackets for anything not answered
- Patient name prepended, staff name appended to case note text
- My Diary ward task rule: show if unclaimed OR claimedBy === current user

**Key Files Modified:**
- `src/app/referrals/[id]/page.tsx` — Smart clipboard, area steps for safeguarding + housing
- `src/app/tasks/page.tsx` — My Diary filter fix, task assignment toggle
- `src/lib/data/tasks/index.ts` — Water temps Sunday-only, removed Medication AM, per-template recurringDays

**Commits:**
- `77104d9` — Diary & guide improvements: smart clipboard, My Diary filter, task assignment

**Build Status:** All builds pass. Pushed to Vercel via Sharpy20.

### 29 March 2026 - Session 13b (Safeguarding Hub)
**Completed:**
- [x] Safeguarding Hub banner on home page — bold red gradient, shield icon, "Recognise. Respond. Refer."
- [x] 999 emergency strip always visible in the banner
- [x] 4 quick-link cards: Adults Referral, Worried About a Child, Domestic Abuse, Patient Conflict
- [x] Interactive decision helper: "Not sure? Help me decide" — yes/no flow to correct guide
- [x] Horizontal safeguarding bookmark strip below banner (public links only)
- [x] 15 new safeguarding bookmarks in new "Safeguarding" category
- [x] Internal numbers stored with real data in comments, displayed as [INTERNAL - See FOCUS]
- [x] 4 safeguarding how-to guides with content from trust training materials:
  - Making a Good Safeguarding Adults Referral (7 steps, S.42 criteria, pitfalls, consent)
  - Safeguarding Children — Starting Point Referral (5 steps, Think Family)
  - Recognising and Responding to Domestic Abuse (7 steps, DA Act, professional curiosity, DASH)
  - Peer-on-Peer Conflict — When to Escalate (5 steps, levels, responsibilities)
- [x] Safeguarding category icon added to bookmark carousel ("Shield")

**Source Documents Used:**
- `E:\Hub\temp\Presentation.pptx` — DHCFT Level 3 Safeguarding training (60+ slides)
- `docs/data dump from work to sort/Safeguarding updater 2026/`:
  - Making a good safeguarding referral.docx
  - Guidance for Identifying when Domestic Abuse may be a Concern.docx
  - Peer on Peer Conflict and Safeguarding final.docx
  - Safeguarding referrals info.docx

**Key Design Decisions:**
- Safeguarding is NOT a new nav item — it's a prominent banner section on the home page
- Phone numbers use FOCUS placeholders but real numbers stored in code comments for later switch
- Decision helper uses local state, resets on "Start over" — no persistence needed
- Bookmarks show in both the safeguarding strip and main /bookmarks page under Safeguarding filter

**Key Files Modified:**
- `src/app/page.tsx` — SafeguardingSection component with banner, cards, decision helper, bookmark strip
- `src/lib/data/bookmarks/index.ts` — 15 new safeguarding bookmarks
- `src/app/how-to/[id]/page.tsx` — 4 new guide definitions + GUIDE_CONFIG entries
- `src/components/bookmarks/bookmark-carousel.tsx` — Added "Safeguarding" to icon map

**Commits:**
- `4db6fcd` — Add Safeguarding Hub: home page banner, 15 bookmarks, 4 guides

**Build Status:** All builds pass. Pushed to Vercel via Sharpy20.

### 30 March 2026 - Session 14 (Bug Fixes, Rename & UX Tweaks)
**Completed (6 commits):**
- [x] `56852ce` - Follow-up task bug: pendingFollowUp flag, second example text
- [x] `3e2d61c` - TodayWidget nav, safeguarding merge, My Diary patient toggle
- [x] `057ba73` - Kanban "Not Started", repeat tasks fix, date hardening
- [x] `9d407f3` - Full rename Ward to Team across 15 files + docs
- [x] `40690c6` - Specific User picker in Demo Mode
- [x] `6593947` - Editor: merge Guides/How-To, remove Ward Settings

**FOCUS Data Collection (Chrome Claude):**
- 6 sessions, 300+ structured entries saved to docs/focus-data-collection/
- Covers: safeguarding, clinical referrals (all CMHTs), IT, estates, HR, pharmacy, IPC, MHA, restrictive practices, wellbeing, chaplaincy, counter fraud
- Data classified: public (show live) vs trust-sensitive (FOCUS placeholder)
- Contact Data Classification table added to Dev Panel

**Deferred Items:**
- Repeatable patient tasks (7/14/28 day intervals)
- Style themes (iPhone/Android/Windows feel)
- Em dash removal + full content audit
- Intro guide update (post-rename)
- Diary UX declutter

**Key Design Decisions:**
- "Team Diary/Tasks" replaces "Ward Diary/Tasks" everywhere in UI (types stay WardTask)
- My Diary toggle: "My tasks only" vs "My tasks + my patients" (shows WP patient tasks from any claimant)
- Safeguarding section: single white card, not heavy red gradient
- Specific User picker: collapsible, current ward staff only, shows role in italic
- formatDate() now uses local date components to prevent midnight UTC drift

**Build Status:** All builds pass. Pushed to Vercel via Sharpy20.

### 2 July 2026 - Session 32 (Risk tool rebuild, guides, v2 collapse)
**Completed (all pushed, build clean, 32/32 tests pass):**
- [x] **Risk tool rebuilt** (`/guides/risk-assessment`) - SystmOne risk-screen wizard (one domain per step + green ticks), ONE merged question set per risk (dropped the WHY/WHAT split), add-your-own sub-domains + clinical indicators, dated examples (year dropdown, newest-first), per-domain "Copy into S1" narrative boxes, combined RMP + prose formulation in == bars, "no evidence" signs a domain off, links the patient Care Review "done", intro/explainer + Tips star. Status red pending sign-off.
- [x] **New/finished guides:** HoNOS & Clustering, DoLS Ward Guidance (was the last empty placeholder - built from the Trust DoLS policy + made practical), Blanket Restrictions & Restrictive Practice. Prenoxad + Quiz (364 Qs) verified working. All red pending sign-off. No empty placeholder guides remain.
- [x] **v1/v2 collapsed into one full demo build** via a single reversible switch `src/lib/config/build.ts` `COLLAPSED_FOR_DEMO=true` (undo = set false). Root now serves all features; `/v2/*` redirects to the same page at the root. useIsV2()->false, v2Href no prefix, proxy redirects + stops root blocking.
- [x] **Data Sources** (Dev Panel) - new "Conflicts in source material" card from `docs/policy-conflict-audit-02-Jul-2026.md`; source list refreshed + dated.
- [x] **Bookmarks** - "Add your own" on the home wheel -> `/links?add=1` opens the Add Personal Link modal; prompt to Recommend useful ones for everyone (creator/admin review). Feature reused the existing /links personal-bookmark + recommend flow.
- Homework: `docs/homework-02-Jul-2026.md`. Key decisions for Mike: IMHA Derby City source of truth (app DDA vs policy One Advocacy Derby), confirm v2 collapse, sign off the red guides.

**Build Status:** All builds pass, 32/32 tests pass. Pushed to Vercel via Sharpy20.

### 8 July 2026 - Session 35 (Password gate, discharge barriers, reports overhaul)
**Completed (all pushed, builds clean):**
- [x] **Site-wide password gate restored** (was removed Session 11). One shared password, no accounts. `src/proxy.ts` redirects to `/password` without the `site_access` cookie; `src/app/password/page.tsx` + `src/app/api/auth/verify-password/route.ts` verify server-side and set a 7-day httpOnly cookie. **Password = `fintralobe`** (`DEFAULT_PASSWORD` in the route; `SITE_PASSWORD` env overrides). Lift the gate by deleting the gate block in proxy.ts.
- [x] **Barrier-to-discharge task flag** - new `blocksDischarge?: boolean` on `BaseTask` (patient tasks + appointments only). Set via add-task modal toggle, the "Add several" bulk modal (per-row toggle), editable in TaskDetailModal. Surfaces: badge + banner in PatientTasksModal, count badge on patient card, and throughout reports. Demo seeds one blocker per ward.
- [x] **Patient Progress Reports overhaul** (`src/app/reports/page.tsx`) - was weak for sign-off. Task priority now carries across (coloured dot + row border + legend, both views); barriers surface (per-task badge, per-patient count, headline stat); **Tile / Table view toggle**; table = sortable columns (patient/ward/top priority/total/outstanding/overdue/barriers/progress) with expandable rows + Expand-all/Collapse-all; **filters** (search, priority, status, ward chips, barriers-only, overdue-only) apply to both views; headline stats recompute to the filtered set.
- [x] **Add-task title auto-fill** - picking a guide when the Task Title is blank pre-fills it with the guide name (still editable, never overwrites a typed title). Applies to the add-task modal + the bulk "Add several" rows. New `guideLabel(id)` in `src/lib/data/guides/catalog.ts`.
- [x] **Tumi sponsor email drafted** (not code) - meeting Thu 30 Jul 1:30pm. Name correction (wardHub not WardBoard), demo-only/DPIA-ready framing, Copilot builder + tiered sign-off, discharge barriers, live link + password.

**Open for Mike:** sign off the red guides; IMHA Derby City source of truth (DDA vs One Advocacy Derby). Idea parked: a flat task-level table (one row per task) as a third reports view for audits/rapid reviews.

**Build Status:** All builds pass. Pushed to Vercel via Sharpy20.

---

### 10 July 2026 - Session 36 (Payslip + Roster guides)
Two new staff-life guides in Learning & Development, both red pending Mike's sign-off:
- [x] **Understanding Your NHS Payslip** (`/guides/payslip`, 12 steps) - ESR layout, Basic Pay,
  the enhancements-as-extra-hours explanation (PAID/DUE x RATE = AMOUNT self-check), deductions,
  tiered pension, YTD, glossary, 5-minute monthly check, how to raise a query. **Fictional round
  numbers only** - Mike's real payslip figures deliberately kept out.
- [x] **Roster Survival Guide** (`/guides/roster`, 11 steps) - built from the Roster Survival
  Guide booklet PLUS Mike's feedback list: TOIL defined at first use, hours-balance sign
  convention spelled plainly (minus = Trust owes YOU), Loop pages merged into one weekly-habit
  step, WTD 4-week example labelled as simplified (real period 17 weeks), public-holiday
  sickness explained in plain outcome terms, glossary added, jargon removed.
- Both cross-link via `related`. Registered in GUIDE_CONFIG + GUIDES (howto-guides.ts),
  catalog.ts ALL_GUIDES, approval-status.ts (red).

### 8 July 2026 - Session 35b (Risk tool: one RMP per domain) [parallel session]
Reworked `/guides/risk-assessment` after Mike said it was over-complicated (it built
a full question set + separate plan for **every ticked sub-domain**). Pushed, build
clean (commit 75e1f94).

- **One RMP per DOMAIN** now (up to 7), one formulation block per domain. The
  13-question set attaches at domain level (`capByRisk[dm.id]`), not per sub-domain.
- **"Requires own RMP" toggle** on each selected sub-domain AND clinical indicator
  (amber "Separate plans (optional)" box). Off = folds into the domain plan; on =
  spins its own RMP (formulation stays one-per-domain). New `DomainState.ownRmp[]`;
  spin-off units keyed `${dm.id}::own::${label}`, reuse the single-risk capture.
- **Merged, spaced chips:** a domain's ticked sub-domains' chip banks merge into one
  question set as separate labelled groups (`mergeGroupsForRisks` +
  `questionSectionForDomain`).
- **Indicators now reach the deliverables** (they only hit the dead risk-screen block
  before): `INDICATOR_BACKGROUND` map + `indicatorRoute()` in
  `src/lib/data/welcome/risk-screen.ts` route **background** indicators -> formulation
  "history", the rest -> RMP "early warning signs". Folded at generate time
  (`foldChips`), shown in a blue transparency note (`renderFoldNote`).
- **Formatting untouched** - reuses `buildOneRmp` (UPPERCASE name between two `====`
  bars, no "RISK MANAGEMENT PLAN" label). New component-scoped
  `buildFormulationText`/`buildRmpText`; old module-level `buildCombined*` deleted.
- **Open for Mike** (`docs/homework-08-Jul-2026.md`): spot-check the
  `INDICATOR_BACKGROUND` tag map; decide if folded indicators should be editable chips
  vs the note; still RED, sign off to go green. Browser click-through not done (another
  chat held the dev port) - verified via clean build + tsc + eslint.

**Build Status:** All builds pass, tsc + eslint clean. Pushed to Vercel via Sharpy20.

---

*This file is maintained by Claude Code during development sessions.*

## Git & Deployment
- **GitHub:** Sharpy20/hub-alpha (private)
- **Auth:** Uses gh CLI credential helper. If push fails, run: `gh auth switch --user Sharpy20 && gh auth setup-git`
