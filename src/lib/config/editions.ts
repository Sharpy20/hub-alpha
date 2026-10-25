// -------------------------------------------------------------------------
// 3.0 - THE GUIDES-ONLY EDITION (25 Oct 2026, Mike's call)
// -------------------------------------------------------------------------
// The Trust's IT team want to review wardHub like a product being bought. 3.0
// is the version that is easiest to say yes to: guides, links, patient
// leaflets and three checklists. No diary, no patients, no staff, no logins,
// nothing stored anywhere but the reader's own browser.
//
// It lives at wardhub.live/3.0, served by the same codebase as the root and
// /v2. /v2 hides a list of routes; 3.0 works the other way round and only
// serves the routes listed here, so anything new added to the site stays out
// of 3.0 until someone decides it belongs.
//
// The proxy and the pages both read this file, so the list is kept once.
// -------------------------------------------------------------------------

export const V3_PREFIX = "/3.0";

// Interactive tools that are NOT in 3.0. The editor cannot build them, and the
// medical device question (HAZ-024) sits on tools that assemble clinical text.
// The three checklists (admission, leave/discharge/transfer, MHA papers) stay.
export const V3_TOOLS_OUT: readonly string[] = [
  "risk-assessment",
  "care-plan",
  "safety-plan",
  "mental-state-exam",
  "debrief",
  "observation-engagement",
  "restraint-monitoring",
  "seclusion-support-plan",
];

// Routes reachable under /3.0. A prefix entry covers its sub-pages too.
const V3_PREFIX_ROUTES = ["/guides", "/patient-guides"];
const V3_EXACT_ROUTES = ["/", "/links", "/admin/guides", "/about", "/feedback"];

// The full site's privacy page is about the diary and patient records, none of
// which 3.0 has. Inside 3.0 it is answered by the privacy section of the 3.0
// About page instead.
export const V3_PRIVACY = "/about#privacy";

export function isV3ToolOut(guideId: string): boolean {
  return V3_TOOLS_OUT.includes(guideId);
}

/** Is this in-site link (e.g. "/guides/care-plan") a tool that 3.0 leaves out? */
export function isV3ToolLink(href: string): boolean {
  if (!href.startsWith("/guides/")) return false;
  return isV3ToolOut(href.slice("/guides/".length).split(/[/?#]/)[0]);
}

/** Is this route (with the /3.0 prefix already removed) part of 3.0? */
export function isV3Route(subpath: string): boolean {
  if (subpath.startsWith("/guides/")) {
    const id = subpath.slice("/guides/".length).split("/")[0];
    if (isV3ToolOut(id)) return false;
  }
  if (V3_EXACT_ROUTES.includes(subpath)) return true;
  return V3_PREFIX_ROUTES.some((p) => subpath === p || subpath.startsWith(p + "/"));
}
