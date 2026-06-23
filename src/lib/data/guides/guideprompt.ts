// Pure-guidance "prompt guide" config types.
//
// These power the clinical documentation guides as THINKING TOOLS, not form
// fillers. Each section is a question the nurse must answer in the real record,
// presented with: why it matters, prompts to think through, worked examples to
// spark ideas (not to copy verbatim), and a tip to avoid vague wording.
//
// No chips, no assembled output, no copy button - the nurse reads, thinks, then
// writes the entry themselves in SystmOne in the patient's own specifics.

export interface GuidePromptSection {
  id: string;
  heading: string; // the question / form field, e.g. "What is the risk?"
  why?: string; // why this section matters / how to frame it
  think?: string[]; // "prompt yourself" sub-questions to explore
  examples?: string[]; // worked example answers (to spark thinking, not to copy)
  tip?: string; // the observable/measurable nudge
  note?: string; // optional extra note (e.g. policy point)
}

export interface GuidePromptConfig {
  id: string;
  title: string;
  icon: string; // emoji
  gradient: string; // header gradient, e.g. "from-rose-600 to-red-800"
  subtitle: string;
  breadcrumb: string;
  intro?: string; // short page intro under the header
  notice?: string; // amber banner (e.g. "guidance only")
  principles?: string[]; // key rules callout
  sections: GuidePromptSection[];
  footer?: string; // small-print grounding line
}
