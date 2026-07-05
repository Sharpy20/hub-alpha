# 05 - Accessibility (WCAG 2.1 AA re-audit)

> Date: 5 July 2026
> Method: runtime audit with axe-core 4.11 injected into the running app (dev server), plus manual keyboard walkthroughs, computed-colour contrast checks and a 375 px mobile pass. This re-audit builds on the Session 26 audit (snags 185-193) and covers the surfaces added since (quiz, service map, risk wizard, global search, print buttons) plus the residuals in snag 192.
> Status after this pass: every page listed below returns ZERO axe-core violations (WCAG 2.0/2.1 A + AA rulesets) in the NHS theme, light and dark mode. Build clean, 32/32 tests pass.

## What was tested, page by page

| Page | axe (light) | axe (dark) | Keyboard | Notes |
|---|---|---|---|---|
| Home `/` | 0 violations | 0 violations | Tab, search palette, wheel links | 2 issues found and fixed |
| Links `/links` | 0 | 0 | FOCUS modal, add-personal-link modal | 3 issues fixed |
| Guides index `/guides` | 0 | 0 | Filters, search input | 2 issues fixed |
| Guide viewer `/guides/prenoxad` | 0 | 0 | Step nav, print button (labelled) | dark-mode fixes to shared Breadcrumb, progress bar, feedback strip |
| Team Diary `/tasks` | 0 | 0 | Task cards (Enter opens detail), add-task modal, detail modal | several fixes, see below |
| My Jobs `/my-tasks` | 0 | 0 | Kanban cards | 2 dark-mode fixes |
| Patients `/patients` | 0 | 0 | Patient cards (Enter opens tasks) | nested-interactive + contrast fixes |
| Quiz `/quiz` (setup, question, feedback states) | 0 | 0 | Topic/difficulty/length pickers, answer buttons, next - all real buttons | added status announcement |
| Service map `/service-map` | 0 | 0 | Map nodes focusable, Enter/Space selects; zoom buttons labelled | 4 issue groups fixed |
| Risk wizard `/guides/risk-assessment` | 0 | 0 (inherits fixes) | Domain steps, chips, dated examples | ~12 nodes fixed |

Dark mode was tested by toggling the `.dark` class at runtime and re-running axe. The Team Diary was additionally audited under all five style themes (NHS, iOS, Material, Fantastical, Notion) - all now return zero violations.

## Issues found and fixed in this pass

### New surfaces

- Quiz (`src/app/quiz/page.tsx`): answer feedback ("Correct" / "Not quite" + rationale) now has `role="status"` so screen readers announce it (WCAG 4.1.3); the correct/incorrect icons on answer options got aria-labels; page title, subtitle and progress text made dark-mode aware (`text-foreground` / `diary-muted`).
- Service map (`src/app/service-map/page.tsx`): SVG `role="img"` conflicted with its focusable node descendants (axe nested-interactive) - changed to `role="group"` (line ~353); Age number input had no label - added `aria-label="Age"` and explicit text/bg colours so dark mode does not render light-on-white (line ~278); "Show / hide", empty-state hint, footer note and unmet-criteria text lifted from gray-400 (2.5:1) to passing greys; hidden-state legend toggles lifted from gray-300.
- Risk wizard (`src/app/guides/risk-assessment/page.tsx`): the two free-text answer boxes per domain had visible labels but no programmatic association - added aria-labels from the domain prompts (lines ~647, ~658); "what happened" dated-example input labelled; rose-500 mono section labels (3.75:1) lifted to rose-700; gray-400 body text and icon-only remove buttons lifted to passing greys.
- Global search palette (`src/components/layout/global-search.tsx`): input given an aria-label (was placeholder-only); trigger label, kbd hints, result subtitles and footer hints lifted from slate-400/gray-400 to passing greys; focus trap + Escape + focus return wired (see below). Verified live: Ctrl+K opens, focus lands in the input, Tab cycles inside, Escape closes, focus returns to the trigger.
- Guide print buttons: already labelled (`aria-label="Print this guide"`) - verified, no change needed.

### Snag 192(c) - modal focus trap and Escape

New shared hook `src/lib/hooks/useModalA11y.ts`: Escape-to-close, a manual Tab/Shift+Tab focus trap, initial focus into the dialog, and focus return to the opener on close. It reads `ref.current` live so it works for modals that swap screens without unmounting (patient picker -> confirmation). Wired into the highest-traffic custom modals:

- Add-task modal - `src/app/tasks/page.tsx` (AddTaskModal)
- TaskDetailModal - `src/components/modals/TaskDetailModal.tsx`
- PatientPickerModal (both screens; Escape on the confirmation steps back rather than closing) - `src/components/modals/PatientPickerModal.tsx`
- FOCUS link warning modal - `src/app/links/page.tsx` and the shared `src/components/guides/ResourceLinks.tsx`
- Add/edit personal link modal and Recommend-for-everyone modal - `src/app/links/page.tsx`
- Global search palette - `src/components/layout/global-search.tsx`

All verified live in the browser: focus lands inside on open, Tab cannot leave, Escape closes, focus returns to the opener.

Custom modals NOT yet wired (they have correct dialog semantics from Session 26b but no trap/Escape): PatientTransferModal, DischargeAuditModal, StaffTasksModal, StaffManagementModal, BulkPatientTasksModal, CareReviewModal, the discharge/add-patient/edit-alerts modals on `/patients`, the repeating-tasks modal on `/tasks`, feedback/reports/staff/chase-log inline modals, TourModal, VerificationBadge modal, and the admin editors (guides/links/workflows/FlowchartEditor). The hook makes each remaining wire-up a three-line change. The base `Modal` component and ConfirmDialog already had focus-trap-react + Escape.

### Snag 192(a) - contrast sweep (NHS theme, light + dark)

Light mode fixes:

- `src/components/layout/footer.tsx`: trust name white/40 (3.1:1) and quick links white/50 (4.0:1) on NHS dark blue -> white/70.
- `src/components/diary/TodayWidget.tsx`: "Completed (n)" and empty-state gray-400 -> gray-600; the circular complete toggle also had NO accessible name (missed by the Session 26 sweep, which only fixed the tasks-page copy) - added state-aware aria-label + aria-pressed.
- `src/app/links/page.tsx`: phone numbers emerald-600 bold 18 px (3.65:1, not "large text" under WCAG) -> emerald-700; "Showing x of y" counter.
- `src/app/guides/page.tsx`: type-help caption gray-400 -> gray-600; guide counter.
- `src/app/tasks/page.tsx`: "Overdue" badge white on red-500 (3.5:1) -> red-700; empty-state greys; diary section headings moved to a CSS variable (`--diary-section-text`, gray-600) so themes/dark mode can adjust them.
- `src/app/patients/page.tsx`: "Care review" caption and not-started review chips gray-400/500-on-gray-100 -> gray-600; patient cards dropped `role="button"` (kept tabIndex + Enter/Space + aria-label) because a button role must not contain the nested WP dropdown / transfer / discharge controls (axe nested-interactive) - same pattern as the Session 26 task-card fix.

Dark mode fixes (all in `src/app/globals.css` unless noted):

- New `.diary-muted` helper class: gray-600 in light, #9aa5b1 in dark. A blanket dark-mode grey override is NOT safe in this codebase because many light surfaces (header, banners, white cards) persist in dark mode - the class is applied only where text sits on the themed dark surfaces. Applied in: tasks (page subtitle, empty states, priority labels), my-tasks, patients, links, guides index, guide viewer progress bar, Breadcrumb, GuideFeedback, quiz, service map.
- Dark `--theme-col-header-past-text` #6B7280 (3.7:1) -> #9CA3AF.
- Priority group bands (translucent light tints) re-tinted dark in dark mode via `.priority-band`.
- Dark footer: white/70 on the lightened dark-mode NHS blue was 3.9:1 -> white/88 via a scoped rule.
- Dark `.bg-nhs-blue.text-white` elements (e.g. the active nav pill): --nhs-blue lightens to #41B6E6 in dark where white text is 2.3:1 -> flipped to dark text (7.7:1).
- Page titles that sit directly on the page background (`text-gray-900`, invisible at 1.04:1 in dark) -> `text-foreground` on home, patients, my-tasks, quiz; home GDPR link indigo-600 -> nhs-blue (adapts per mode); My Jobs banner "Team Diary" link given an explicit blue-700 (it inherited the dark-mode light blue on a light banner).
- Service map Age input given explicit `text-gray-900 bg-white` (inherited light-on-white in dark).
- Header mobile menu toggle: added `aria-expanded`.

### Snag 192(b) - non-NHS themes

- Fantastical (`data-theme="fluent"`, always dark): past-day header #4B5563 (2.5:1) -> #9CA3AF; `.diary-muted`, the diary h1 and the priority bands given fluent-scoped overrides. Diary now passes axe under Fantastical.
- iOS: past-day header #8E8E93 (2.9:1) -> #636366. Passes.
- Notion (oneui): past-day header #9B9A97 (2.8:1) -> #6f6e6b. Passes.
- Material: already passed.

### Snag 192(d) - keyboard alternative to drag-and-drop

Position (verified live, not built new): task rescheduling does not require drag-and-drop. Task cards are keyboard-focusable and open the Task Detail modal on Enter (aria-label "Open task: ..."); the modal's Edit mode exposes native date and time inputs, so a keyboard-only user can reschedule any non-completed task. Kanban status changes are likewise available through the detail modal's action buttons (claim, complete, reopen). Drag-and-drop is therefore an enhancement, not the only path, which satisfies WCAG 2.1.1. Focus returns to the originating card when the modal closes (verified).

## Mobile pass (375 px)

Checked `/`, `/links`, `/guides`, `/tasks`, `/quiz`, `/service-map`, `/patients`: no horizontal scroll on any of them (document scrollWidth == viewport width). The hamburger opens the full nav (Diary, Links, Guides, Patients, Staff, Reports), is labelled "Toggle menu" and now reports `aria-expanded`. Wide content (diary columns, service map) scrolls inside its own container. Touch targets in the mobile menu are full-width rows; no overlapping targets observed.

## What remains (honest exceptions)

1. Remaining custom modals without focus trap/Escape - listed above under 192(c). Dialog semantics are present; trapping is a usability gap rather than a hard AA failure, and the shared hook makes each fix trivial.
2. Pages outside the audited set (admin editors, dev panel, reports, staff, feedback, referrals chase log, intro guide, FAQ, patient-guides) have not had this pass's dark-mode/axe treatment. Light-mode NHS theme on those pages was clean at the Session 26 audit but they have grown since.
3. Non-NHS themes beyond the diary: only the Team Diary was audited under iOS/Material/Fantastical/Notion. Other pages under those themes are unaudited (the themes mainly restyle the diary).
4. Dark mode is a demo convenience: the audited pages pass, but unaudited pages likely contain more `text-gray-*`-on-dark instances of the pattern fixed here. The `.diary-muted` helper is the fix pattern.
5. Disabled/unwired link chips ("to confirm" placeholders in ResourceLinks, 86 known placeholder form links) use muted grey below 4.5:1; treated as inactive UI components, which WCAG 1.4.3 exempts.
6. Service map panning is pointer-only; keyboard users can reach every node by Tab and the zoom controls are buttons, so content is not locked away, but arrow-key panning would be a nice-to-have.
7. axe-core cannot judge everything: manual checks covered keyboard order, focus visibility (global `:focus-visible` ring) and names/roles on the new surfaces, but a full manual AA audit item-by-item (e.g. 1.3.5 input purpose, 1.4.10 reflow at 400% zoom) has not been formally recorded.
8. `prefers-reduced-motion` support and the skip link were verified present in Session 26 and remain in place; not retested in depth.

## Conformance statement (for the trust)

wardHub has been tested against WCAG 2.1 AA using automated runtime scanning (axe-core 4.11) and manual keyboard testing on its main user-facing pages: home, links, guides index, guide viewer, Team Diary, My Jobs, patient list, quiz, service map and the risk assessment wizard, in the NHS theme in both light and dark mode, at desktop and 375 px mobile widths. All scanned pages return zero automated WCAG A/AA violations, and the primary interactive flows (search, modals, task management, quiz, map) are fully keyboard operable with visible focus, correct dialog semantics, focus trapping and Escape-to-close on the main modals. Known exceptions: a set of lower-traffic modals have correct dialog semantics but no focus trap yet; admin/editor screens and some secondary pages have not had the dark-mode contrast pass; the alternative style themes are audited on the diary only; and reflow/zoom criteria have been checked informally rather than formally recorded. These are tracked in `docs/nhs-ready/05-accessibility.md` and snag 192.

## How to re-run this audit

1. `npm run dev`, then in the browser console inject axe from `node_modules/axe-core/axe.min.js` (copy it into `public/` temporarily) and run `axe.run(document, { runOnly: { type: "tag", values: ["wcag2a","wcag2aa","wcag21a","wcag21aa"] } })`.
2. Toggle dark mode by adding the `dark` class to `<html>`; themes via `data-theme="ios|material|fluent|oneui"`.
3. Keyboard: Ctrl+K for search; Tab to a task card and press Enter; Escape in any wired modal.
