// The case note a referral hands back at the end, built from the answers the
// reader gave on the way through. Pulled out of the viewer so it can be tested:
// this is text that goes into a patient record, and a wrong word here is worse
// than a wrong colour on screen.

import { S117_OPTIONS, SECTION_OPTIONS, type WorkflowStep } from "./referral-workflows";
import { applyBranchTokens, type BranchAnswers } from "./branching";

// Answers from the fixed step types (consent, section, s117, area), which the
// viewer keeps in its own state. Questions added with the Question block are in
// branchAnswers instead.
export interface FixedAnswers {
  area: "city" | "county" | null;
  consent: "yes" | "no" | null;
  informed: "yes" | "no" | null;
  section: string;
  s117: string;
}

export interface CaseNoteInput {
  guideId: string;
  steps: WorkflowStep[];
  step: WorkflowStep;
  fixed: FixedAnswers;
  branch: BranchAnswers;
  today: string;
  patientName?: string;
  by?: string;
}

const titleCase = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

export function buildReferralCaseNote(input: CaseNoteInput): string {
  const { guideId, steps, step, fixed, today, patientName, by } = input;

  // Only the older IMHA copy, still built on fixed steps, is written here. The
  // current guide writes its note from its own text and questions.
  if (guideId === "imha-advocacy" && step.isDynamic) {
    const areaName = fixed.area === "city" ? "Derby City IMHA (Disability Direct)" : "Derbyshire County IMHA (Cloverleaf)";
    const areaEmail = fixed.area === "city" ? "info@disabilitydirect.com" : "referrals@cloverleaf-advocacy.co.uk";
    const patientText = patientName ? `Patient: ${patientName}. ` : "";
    const staffText = by ? ` Referral completed by ${by}.` : "";
    let statusText: string;
    if (fixed.section === "informal") {
      statusText = "Patient is informal (voluntary)";
    } else {
      const sectionLabel = SECTION_OPTIONS.find((o) => o.value === fixed.section)?.label || (fixed.section ? titleCase(fixed.section) : "") || "[SECTION]";
      statusText = `Patient is detained under ${sectionLabel}`;
    }
    const consentStep = steps.find((s) => s.type === "consent");
    const consentText = fixed.consent && consentStep
      ? ` ${fixed.consent === "yes" ? consentStep.consentYesNote : consentStep.consentNoNote}`
      : "";
    return `${patientText}Referral for IMHA sent to ${areaName} via email to ${areaEmail} on ${today}. ${statusText} and would benefit from independent advocacy support.${consentText}${staffText}`;
  }

  let text = step.clipboardText || "";
  text = applyBranchTokens(text, steps, input.branch);
  text = text.replace(/\[DATE\]/g, today);

  // Each step owns the wording it wants in the note, so the viewer never invents
  // clinical phrasing. An unanswered question leaves its placeholder showing:
  // a blank is obvious, a wrong assertion is not.
  const consentStep = steps.find((s) => s.type === "consent");
  if (fixed.consent && consentStep) {
    const note = fixed.consent === "yes" ? consentStep.consentYesNote : consentStep.consentNoNote;
    if (note) text = text.replace(/\[CONSENT\]/g, note);
  }
  if (fixed.informed && consentStep) {
    const note = fixed.informed === "yes" ? consentStep.informedYesNote : consentStep.informedNoNote;
    if (note) text = text.replace(/\[INFORMED\]/g, note);
  }
  if (fixed.s117) {
    const opt = S117_OPTIONS.find((o) => o.value === fixed.s117);
    if (opt) {
      text = text.replace(
        /\[S117\]/g,
        opt.entitled
          // Lowercase the first letter only - toLowerCase() on the whole label
          // turned "Previously on Section 3" into "section 3".
          ? `Patient has S117 aftercare entitlement (${opt.label.charAt(0).toLowerCase() + opt.label.slice(1)}) - a S117 aftercare meeting is required before discharge.`
          : "Patient has no qualifying section, so no S117 aftercare entitlement; standard Care Act route."
      );
    }
  }
  if (fixed.area) {
    const name = fixed.area === "city" ? "Derby City" : "Derbyshire County";
    text = text.replace(/\[DERBY CITY\/DERBYSHIRE COUNTY\]/g, name);
    text = text.replace(/\[DERBY\/COUNTY\]/g, name);
  }
  if (fixed.section) {
    const sectionLabel = SECTION_OPTIONS.find((o) => o.value === fixed.section)?.label || titleCase(fixed.section);
    text = text.replace(/\[SECTION\]/g, sectionLabel);
  }
  // A note that places the author itself, with [NURSE], is left as written.
  // Otherwise "Completed by" goes on the end.
  const placesAuthor = text.includes("[NURSE]");
  if (placesAuthor) text = text.replace(/\[NURSE\]/g, by || "[NURSE]");
  if (patientName) text = `Patient: ${patientName}. ${text}`;
  if (by && !placesAuthor) text = `${text} Completed by ${by}.`;
  return text;
}
