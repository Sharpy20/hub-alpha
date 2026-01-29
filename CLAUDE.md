# INPATIENT HUB - Claude Code Project File

> **Last Updated:** 29 January 2026
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

- **Live URL:** https://inpatient-hub-alpha.vercel.app
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
- Password: `Eft3&d3` (demo only - production uses Trust key vault)
- In-memory session token (clears on page refresh)

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
- `alerts` - Clinical alerts (handled via SystemOne)

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
| **Max+** | + SystemOne API integration | Trust auth | Yes | Trust infra, API approval |

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
| Push to SystemOne notes | - | - | - | Y |
| **HOW-TO GUIDES** |||||
| Public guides (generic clinical) | Y | Y | Y | Y |
| Internal SOPs (trust-specific) | - | Y | Y | Y |
| **WARD DIARY & TASKS** |||||
| Ward tasks | - | - | Y | Y |
| Patient tasks | - | - | Y | Y |
| Appointments | - | - | Y | Y |
| My Tasks view | - | - | Y | Y |
| Calendar view | - | - | Y | Y |
| Sync with SystemOne Tasks | - | - | - | Y |
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
| SystemOne patient lookup | - | - | - | Y |
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
| SystemOne API | - | - | - | Y |

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
│   ├── api/systemon/                # Max+ only
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
│   └── api/systemon/                # Max+ API client
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
   - [If via SystemOne] → Link to SystemOne guide
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
  submissionMethod: 'email' | 'phone' | 'portal' | 'systemon' | 'mixed';
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

## SYSTEMONE API (Max+)

### Planned Integration Points

1. **Task Sync** - Bidirectional sync between Hub and S1 Tasks
2. **Patient Lookup** - Pull patient list from S1
3. **Case Notes Push** - After workflow completion

### Workflow Completion Modal

When a referral workflow completes in Max+ version:

```
+------------------------------------------+
| Referral Complete                        |
|                                          |
| Add to patient case notes?               |
|                                          |
| "Referred to City Advocacy (POhWER)      |
|  on 24/01/2026. Contact: 01onal..."      |
|                                          |
| [ Copy to Clipboard ] [ Push to S1 ]     |
|                                          |
| Patient: [Dropdown]                      |
+------------------------------------------+
```

### API Endpoints (Placeholder)

```
GET  /api/systemon/tasks?patient_id={id}
POST /api/systemon/tasks
PUT  /api/systemon/tasks/{id}
GET  /api/systemon/patients?ward={ward}
POST /api/systemon/notes
```

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

### Phase 8: SystemOne (Max+) ← PLANNED
- [ ] API client structure
- [ ] Task sync UI
- [ ] Case notes modal
- [x] API integration research document (docs/progress reviews/)

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
| 36 | [x] | Ward diary - SystemOne sync tip banner now hidden in Max+ version (only shows for Light/Medium/Max) |
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
| 50 | [x] | SystemOne sync banner - ONLY show in Max+ version (currently showing in wrong versions) |
| 51 | [x] | Ward diary - remove ability to add patients to patient list from diary view (never existed/already removed) |
| 52 | [x] | Add patient modal - make room, bed, and MHA status all optional fields |
| 53 | [x] | Add patient modal - include alerts selection (ligature risk, absconding risk, etc.) |
| 54 | [x] | Add patient modal - Simple/Advanced toggle with ward admin override settings (3 states: simple only, advanced only, toggle enabled) |

## DEV PANEL & GOVERNANCE (29 Jan 2026)

| # | Status | Description |
|---|--------|-------------|
| 55 | [x] | Dev Panel route created with password gate (`Eft3&d3`) |
| 56 | [x] | Dev Panel left nav with 11 sections (Overview, Technical, Data Catalogue, RBAC, User Flows, DPIA, Clinical Safety, Schemas, Webhooks, SystmOne, References) |
| 57 | [x] | Schema Status Widget showing DRAFT status |
| 58 | [x] | DPIA draft scaffold with 7 sections |
| 59 | [x] | Clinical Safety section with hazard log starter |
| 60 | [x] | Dev Panel link added to GDPR page |
| 61 | [x] | Documentation Sync Workflow added to CLAUDE.md |
| 62 | [ ] | Complete remaining Dev Panel sections (expand content) |
| 63 | [ ] | Add "Export to PDF" buttons |
| 64 | [ ] | Add Q&A Pack for stakeholders |
| 65 | [ ] | Add Role-specific Evaluations section |

---

## CURRENT FOCUS

**Immediate Next Steps:**
1. ~~Complete Phase 5: Admin features~~ → Dev Panel now priority for IT meeting
2. Expand Dev Panel content for stakeholder meeting (1 week)
3. Mobile responsiveness pass
4. Prepare for user testing

**Recently Completed (28 Jan 2026 - Session 6):**
- ✅ Patient tasks modal now opens TaskDetailModal for viewing/editing
- ✅ Add task modal patient field changed to searchable dropdown
- ✅ SystemOne sync banner hidden in Max+ version
- ✅ Removed non-functional PatientNamesModal
- ✅ Added "Add Patient" feature to Patients page with Simple/Advanced toggle
- ✅ Created comprehensive Ward Admin Settings page with 6 configuration tabs
- ✅ Added WardSettingsProvider for ward-scoped settings
- ✅ User bookmark favorites on home page (My Favorites section)
- ✅ Star toggle on bookmarks page to manage favorites
- ✅ Ran full 10-perspective project evaluation
- ✅ Fixed Next.js security vulnerability (16.1.4 → 16.1.6)
- ✅ Fixed failing unit tests (40/40 now pass)

**Recently Completed (27 Jan 2026 - Session 5):**
- ✅ Assurance Dashboard integration designed (Light-Max: link-only, Max+: auto-sync)
- ✅ Added AuditType to types (fridge_temps, water_temps, walkaround, controlled_drugs, resus_check, fire_safety, ligature_check)
- ✅ Added AUDIT_TYPE_CONFIG with icons and dashboard paths
- ✅ Extended WardTask with isAuditTask, auditType, assuranceDashboardUrl fields
- ✅ Updated ward task templates with audit tasks linked to Assurance Dashboard
- ✅ Created "Fridge Temperature Recording" how-to guide (6 steps)
- ✅ Documented Assurance Dashboard webhook spec in API research doc
- ✅ Updated version comparison page with Assurance Dashboard feature (Link vs Sync)
- ✅ Updated feature matrix in CLAUDE.md
- ✅ Created Patient Progress Reports page (/reports)
- ✅ Report scope selection: All wards, single ward, or pick patients
- ✅ Engaging report card design with patient info, task stats, alerts
- ✅ Max+ scheduled delivery: Email or MS Teams (daily/weekly/on-demand)
- ✅ Added Reports link to header navigation (Max/Max+ only)
- ✅ Updated version comparison with Progress Reports feature

**Recently Completed (26 Jan 2026 - Session 4):**
- ✅ Expanded day view in ward diary with shift filters
- ✅ Compact task cards (shift labels as tooltips)
- ✅ Data sources link added to Settings dropdown
- ✅ Renamed "Ward Diary" to "Diary" and "My Tasks" to "Tasks" in header
- ✅ Fixed footer text contrast issues
- ✅ Bookmark management for contributors (new admin page)
- ✅ Derbyshire MH Helpline moved to top of Crisis Support
- ✅ Project evaluation document created (10 perspectives)
- ✅ Error boundaries added
- ✅ Accessibility improvements (focus indicators, ARIA labels, reduced motion)
- ✅ Security headers added
- ✅ FAQ page created
- ✅ GDPR data retention section added
- ✅ Custom 404 page
- ✅ Page meta titles
- ✅ Back to top button
- ✅ Print styles
- ✅ Confirmation dialogs component
- ✅ Loading skeleton components
- ✅ Empty state improvements
- ✅ "Request a Feature" category in community feedback with "is related to..." dropdown
- ✅ Task cards: referral/guide links moved to right side (same row as claim/steal)

**Previously Completed (26 Jan 2026 - Earlier):**
- ✅ Login flow now uses staff dropdown per ward instead of free text name entry
- ✅ Each ward has "Ward Admin" as first staff member at top of list
- ✅ Role is determined by staff selection (read-only display)
- ✅ Ward diary "Quick Guide" renamed to "Diary Key"
- ✅ Add task modal enhanced with one-off vs repeating task toggle
- ✅ One-off tasks get date picker, repeating tasks get day selection
- ✅ Leadership approval checkbox only shows for repeating tasks
- ✅ New "View repeat ward tasks" modal with Mon-Sun weekly overview and edit/delete

**Previously Completed (25 Jan 2026):**
- ✅ All 20 snag list items completed
- Ward task system with cross-ward viewing
- Patient list with transfer and discharge workflows
- Discharge audit log with ward admin confirmation
- SystemOne API research document
- Version compare modal
- Patient tasks modal (click patient name)
- Enhanced patient transfer with per-task options
- Repeating ward tasks with day selection and approval toggle

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
- [x] SystemOne API research document created
- [x] CLAUDE.md roadmap updated

**New Components:**
- `src/components/modals/TaskDetailModal.tsx`
- `src/components/modals/PatientTransferModal.tsx`
- `src/components/modals/DischargeAuditModal.tsx`
- `src/app/patients/page.tsx`

**New Documents:**
- `docs/progress reviews/SystemOne-API-Guide.md`

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
- [x] SystmOne (MAX+) preview section with approval checklist
- [x] References section (Trust policies, external standards)
- [x] Dev Panel link on GDPR page
- [x] Documentation Sync Workflow added to CLAUDE.md

**New Files Created:**
- `src/app/dev-panel/page.tsx` - Complete Dev Panel with all sections

**Access:**
- Navigate to GDPR & Privacy page → small "dev panel" link at bottom
- Password: `Eft3&d3`

**Build Status:** Pending verification

---

*This file is maintained by Claude Code during development sessions.*
