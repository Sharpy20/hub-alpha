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
  // New pure-guidance tools - being reworked, not ready to trust.
  "seclusion-support-plan": "red",
  "debrief": "red",
  "safety-plan": "red",
  "restraint-monitoring": "red",
  "observation-engagement": "red",
  "leave-discharge-transfer": "red",
  // Session 28b: new draft guide, awaiting Mike's clinical sign-off.
  "arrange-mha-assessment": "red",
  "section-132": "red",
  "section-136": "red",
  "tribunal-report": "red",
  "dama": "red",
  "transfer-in": "red",
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
