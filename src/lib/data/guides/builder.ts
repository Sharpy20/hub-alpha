// Shared "prompt builder" config types.
//
// These power the family of interactive documentation tools that all share the
// same shape: chip word-banks + free text + an "unable to establish" toggle +
// an optional patient-voice quote field, assembled into a plain-text block the
// nurse can copy into SystemOne / Datix.
//
// One generic component (src/components/guides/PromptBuilder.tsx) renders any
// config built with these types, so every tool stays consistent and the clinical
// content lives in small per-tool data files.
//
// Drafting aids only. Where exact Trust form wording was available it is used;
// where only the required content was known, prompts are clearly written as
// "source-aligned" guidance, not verbatim Trust text.

export interface BuilderChipGroup {
  label?: string;
  words: string[];
}

export interface BuilderSection {
  id: string;
  heading: string; // used as the section heading in the assembled output
  hint: string; // what this section is for (shown under the heading)
  gap?: string; // a nudge question to push past clone-y wording
  gapLabel?: string; // label before the gap question (default "Prompt yourself:")
  patientVoice?: boolean; // show a "patient's own words" quote field
  groups?: BuilderChipGroup[]; // suggestion chips (a starting point, not the answer)
  placeholder?: string;
  naLabel?: string; // toggle label (default "Not yet established")
  naOutput?: string; // what the toggle renders (default "Not yet established.")
}

export interface BuilderTeachingBlock {
  title: string;
  points: string[];
}

export interface BuilderExample {
  topic: string;
  weak: string;
  strong: string;
}

export interface BuilderConfig {
  id: string;
  title: string;
  icon: string; // emoji
  gradient: string; // header gradient, e.g. "from-rose-600 to-red-800"
  subtitle: string;
  breadcrumb: string; // breadcrumb label
  docHeading: string; // first line of the assembled output, e.g. "SECLUSION SUPPORT PLAN"
  outputLabel: string; // dark panel label, e.g. "Your seclusion support plan"
  emptyHint: string; // shown in the panel before anything is filled in
  dateLine?: boolean; // add a "Date: dd/mm/yyyy" line under the doc heading
  principles?: string[]; // the callout list at the top
  sections: BuilderSection[];
  teachingTitle?: string; // default "Learn: writing this well"
  teaching?: BuilderTeachingBlock[];
  example?: BuilderExample;
  footer?: string; // small-print line at the bottom
  /** Optional banner shown above everything, e.g. "Guidance only - not a validated calculator". */
  notice?: string;
}
