// Editorial approval status for guides and links (traffic-light "certificate").
//
// This is the single source of truth Mike controls. To change a status, edit the
// maps below (Claude does this on request - "set seclusion to green" etc.):
//
//   green = Passed             (Mike has checked it - safe to trust)
//   amber = Awaiting approval  (built, not yet signed off - default)
//   red   = In development     (being worked on - do not trust yet)
//
// Anything not listed falls back to DEFAULT_APPROVAL (amber), so the honest
// baseline is "awaiting approval" until Mike signs something off.

export type ApprovalStatus = "green" | "amber" | "red";

export const DEFAULT_APPROVAL: ApprovalStatus = "amber";

// Keyed by guide id (the id in ALL_GUIDES on the guides page).
export const GUIDE_APPROVAL: Record<string, ApprovalStatus> = {
  // Mike signed off the S117 aftercare & funding content (2 Jul).
  "s117-meeting": "green",
  "prenoxad": "red",
  "admission-note": "red",
  // Rebuilt / new on 2 Jul - red until Mike signs each off.
  "risk-assessment": "red",
  "honos": "red",
  "dols": "red",
  "blanket-restrictions": "red",
  // named-nurse now has real content (from the ward audit cadence) - amber until Mike signs it off.
  // Mike's homework verdict "good"/"fine"/"passable" = amber (built, awaiting
  // clinical sign-off), and guides whose requested edits are now done also move to
  // amber. Green is reserved for formal department sign-off, which can't happen
  // until all guides are ready to go for review. section-17, care-plan,
  // admission-checklist, mh-talking-points already fall back to amber by default.
  "seclusion-support-plan": "amber", // Mike: "good"
  "debrief": "amber",                // Mike: "fine" (headers still to confirm)
  "safety-plan": "amber",            // Mike: "passable" (same as care-plan)
  "dama": "amber",                   // requested edits done
  "leave-discharge-transfer": "amber", // requested edits done
  "observation-engagement": "amber", // requested edits done (policy wording to verify)
  // Still genuinely in development / blocked on docs or a bigger rework.
  "restraint-monitoring": "red",     // needs images + clickable workflow
  "arrange-mha-assessment": "red",   // social-care secure-email wording unresolved
  "section-132": "red",              // needs 132 forms URL + MHA office email
  "section-136": "red",              // expand-with-FAQ vs drop - your call
  "tribunal-report": "red",          // fact-check + new gov.uk template
  "transfer-in": "red",
  "awol": "red",
  "student-placement": "red",        // new 4 Jul from the Student Information Pack - generic/demo-safe, awaiting Mike's review
  "no-smoking": "red",               // new 4 Jul from the smoking staff-legal-warning doc
  "informal-patient-contract": "red", // new 4 Jul from the Gatekeeping + Informal Admission SystmOne guides
  "payslip": "red",                  // 13 Jul: pay-roster split back into three; Tess (payroll) reviewed the pay content but Mike has not signed off
  "roster": "red",                   // 13 Jul: split from pay-roster; Tess reviewed
  "leave-absence": "red",            // 13 Jul: new - absences section drafted from national baseline, trust-policy figures still to confirm
  "pay-roster-faq": "red",           // 14 Jul: new - FAQ + jargon pulled out of the 3 pay guides
  "ot-pathway": "red",               // 2 Aug: new - restructure of the Radbourne Unit OT pathway. Georgia (OT) to review; source doc is unversioned and names one unit
  // Everything else falls back to "amber" (awaiting approval) until signed off.
};

// Keyed by bookmark id (the id in the bookmarks data).
export const LINK_APPROVAL: Record<string, ApprovalStatus> = {
  // Add overrides here as Mike signs links off, e.g. "samaritans": "green".
};

export function guideApproval(id: string): ApprovalStatus {
  return GUIDE_APPROVAL[id] ?? DEFAULT_APPROVAL;
}

export function linkApproval(id: string): ApprovalStatus {
  return LINK_APPROVAL[id] ?? DEFAULT_APPROVAL;
}
