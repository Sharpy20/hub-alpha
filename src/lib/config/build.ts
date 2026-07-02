// -------------------------------------------------------------------------
// DEMO COLLAPSE (2 Jul 2026)
// -------------------------------------------------------------------------
// Mike's call: for the demo, show the WHOLE product at the root (Team Diary,
// Patients, Reports, My Jobs, Staff, Link-to-Patient, etc.) - the v1/v2 split
// is collapsed into one full build. Old shared links that contain /v2/ are
// redirected to the same page at the root.
//
// This flag is the ONLY switch. When true:
//   - useIsV2() always returns false  -> every `isV2` gate shows the full
//     feature / full copy (the limited-demo variants are bypassed),
//   - v2Href() never adds the /v2 prefix,
//   - src/proxy.ts stops blocking the full-build/PII routes at the root and
//     redirects /v2 and /v2/* to the equivalent root path.
//
// TO UNDO (restore the v1 [limited root] / v2 [full] split):
//   set COLLAPSED_FOR_DEMO = false.
// Nothing else was removed - all the split logic (useV2.ts, proxy.ts,
// the `!isV2 &&` gates and copy rewrites across the app) is intact and simply
// dormant while this is true. See [[session-23-url-swap]] for the split design.
export const COLLAPSED_FOR_DEMO = true;
