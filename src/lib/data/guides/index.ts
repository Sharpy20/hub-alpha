export { WORKFLOWS, DEFAULT_WORKFLOW, STEP_GRADIENTS, SECTION_OPTIONS, AREA_OPTIONS } from "./referral-workflows";
export type { WorkflowForm, WorkflowForms, SubmissionMethod, WorkflowStep, WorkflowData } from "./referral-workflows";

export { GUIDES, DEFAULT_GUIDE, GUIDE_CONFIG, GUIDE_WAGOLLS } from "./howto-guides";
export type { GuideStep, GuideData } from "./howto-guides";

export { MSE_DOMAINS } from "./mse";
export type { MseGroup, MseDomain } from "./mse";

export {
  CAREPLAN_SECTIONS, CAREPLAN_PRINCIPLES, CAREPLAN_TEACHING, CAREPLAN_EXAMPLE,
} from "./careplan";
export type { CareChipGroup, CareSection } from "./careplan";

export {
  RISK_TYPES, S1_STEPS, FORMULATION_SECTIONS, RMP_SECTIONS,
  MANDATORY_MDT_LINE, RISK_TEACHING, RISK_EXAMPLES, SEPARATE_PLANS_NOTE,
  RMP_RISK_CHIPS, FORMULATION_RISK_CHIPS, BLANK_RISK,
} from "./risk";
export type { RiskChipGroup, RiskSection, RmpSectionId, FormulationSectionId } from "./risk";

export { ADMISSION_CHECKLIST, MHA_PATHWAYS, MHA_SCRUTINY, MHA_RECTIFY_NOTE } from "./admission";
export type {
  GuideLink, ChecklistItem, ChecklistGroup, MhaForm, MhaRequirement, MhaPathway,
} from "./admission";

// Pure-guidance clinical documentation tools (seclusion, debrief, safety plan, etc.)
export type { GuidePromptConfig, GuidePromptSection } from "./guideprompt";
export { SECLUSION_BUILDER } from "./seclusion";
export { DEBRIEF_BUILDER } from "./debrief";
export { SAFETY_PLAN_BUILDER } from "./safety-plan";
export { RESTRAINT_BUILDER } from "./restraint";
export { OBSERVATION_BUILDER } from "./observation";
export { FALLS_BUILDER } from "./falls";
export { PHYSICAL_HEALTH_BUILDER } from "./physical-health";
export { HANDLING_BUILDER } from "./personal-handling";
export { NUTRITION_BUILDER } from "./nutrition";
export { PRESSURE_BUILDER } from "./pressure";

export { LDT_SECTIONS, LDT_PATHWAYS } from "./leave-discharge";
export type { LdtPathway, LdtItem, LdtSection } from "./leave-discharge";
