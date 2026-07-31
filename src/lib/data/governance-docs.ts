// Governance documents surfaced in full inside the dev panel.
//
// These render straight from the markdown files in docs/ at build time, so the
// document in the repo is the single source of truth and the page can never
// drift from it. To publish a new one, add an entry here - do not paste content
// into a component.
//
// DELIBERATELY NOT LISTED: docs/nhs-ready/04-security-review.md. It describes
// weaknesses and how to reach them, which is not something to publish on a site
// behind a single shared password. Send it to IM&T directly instead.

export interface GovernanceDoc {
  slug: string;
  title: string;
  /** One line for the index card. */
  description: string;
  /** Path relative to the repo root. */
  path: string;
  /** Shown as a badge - these are all drafts and should say so. */
  status: string;
  /** Grouping on the index page. */
  group: "Clinical safety" | "Data protection";
}

export const GOVERNANCE_DOCS: GovernanceDoc[] = [
  {
    slug: "hazard-log",
    title: "DCB0129 Hazard Log",
    description:
      "25 identified hazards with severity, likelihood, controls and residual risk. The entries marked CSO DECISION are the ones outside a ward nurse's competence.",
    path: "docs/clinical-safety/DCB0129-Hazard-Log.md",
    status: "Draft v0.3 - awaiting Clinical Safety Officer",
    group: "Clinical safety",
  },
  {
    slug: "clinical-risk-management-plan",
    title: "DCB0129 Clinical Risk Management Plan",
    description:
      "How clinical risk is identified, scored and reviewed across the product lifecycle.",
    path: "docs/clinical-safety/DCB0129-Clinical-Risk-Management-Plan.md",
    status: "Draft - awaiting Clinical Safety Officer",
    group: "Clinical safety",
  },
  {
    slug: "clinical-safety-case-report",
    title: "DCB0129 Clinical Safety Case Report",
    description:
      "The argument that the product is acceptably safe for its intended use, and the evidence behind it.",
    path: "docs/clinical-safety/DCB0129-Clinical-Safety-Case-Report.md",
    status: "Draft - awaiting Clinical Safety Officer",
    group: "Clinical safety",
  },
  {
    slug: "dpia",
    title: "Data Protection Impact Assessment",
    description:
      "Draft DPIA covering what data is processed, the lawful basis question, identified risks and the measures proposed against each.",
    path: "docs/nhs-ready/03a-dpia-draft.md",
    status: "Draft - awaiting Data Protection Officer",
    group: "Data protection",
  },
  {
    slug: "data-flow-diagram",
    title: "Data Flow Diagram",
    description:
      "Where every piece of data enters, where it rests, and where it leaves. Companion to the DPIA.",
    path: "docs/nhs-ready/03c-data-flow-diagram.md",
    status: "Draft",
    group: "Data protection",
  },
  {
    slug: "data-governance-audit",
    title: "Data Governance Audit",
    description:
      "The audit that drove the data minimisation work, including what was removed from the patient record and why.",
    path: "docs/nhs-ready/01-data-governance-audit.md",
    status: "Complete - findings actioned",
    group: "Data protection",
  },
];

export function getGovernanceDoc(slug: string): GovernanceDoc | undefined {
  return GOVERNANCE_DOCS.find((d) => d.slug === slug);
}
