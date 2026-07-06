// Mental Health Understanding Guides - metadata for the 29 patient-facing guides
// Source: MH_Guides_Poster.html (Named Nurse Tools)

export interface PatientGuide {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  color: string;
}

export const PATIENT_GUIDES: PatientGuide[] = [
  { id: "medicines", number: 1, title: "How Mental Health Medicines Work", subtitle: "Understanding medication in a non-blaming way", color: "#1B4F72" },
  { id: "sleep", number: 2, title: "Sleep and Mental Health", subtitle: "A practical guide for patients and staff", color: "#1A3A5C" },
  { id: "survival", number: 3, title: "Living in Survival Mode", subtitle: "Chronic stress, hyperarousal and nervous system overload", color: "#7B341E" },
  { id: "anxiety", number: 4, title: "Understanding Anxiety and Panic", subtitle: "Why the body can feel unsafe and what can help", color: "#553C9A" },
  { id: "overwhelm", number: 5, title: "Managing Overwhelm and Emotional Flooding", subtitle: "When feelings arrive too fast or too strongly", color: "#5C4033" },
  { id: "depression", number: 6, title: "Understanding Low Mood and Depression", subtitle: "Why motivation and energy can disappear", color: "#2C5F8A" },
  { id: "trauma", number: 7, title: "How Trauma Can Affect the Brain and Body", subtitle: "A trauma-informed guide to understanding reactions", color: "#4A235A" },
  { id: "dissociation", number: 8, title: "Understanding Dissociation and Shutdown", subtitle: "When the mind or body disconnects to protect you", color: "#2D3748" },
  { id: "psychosis", number: 9, title: "Understanding Psychosis", subtitle: "What may be happening in your mind and body", color: "#1A5C3A" },
  { id: "selfharm", number: 10, title: "Understanding Self-Harm", subtitle: "A non-judgemental guide to understanding urges", color: "#742A2A" },
  { id: "suicidal", number: 11, title: "Understanding Suicidal Thoughts", subtitle: "When life feels too painful or too much", color: "#1A202C" },
  { id: "eating", number: 12, title: "Understanding Eating Difficulties and Eating Disorders", subtitle: "Why food, control and safety can become linked", color: "#3C366B" },
  { id: "emotional-intensity", number: 13, title: "Understanding Emotional Intensity and Relationship Patterns", subtitle: "Often associated with a diagnosis of personality disorder", color: "#553C9A" },
  { id: "sensory", number: 14, title: "Understanding Sensory Sensitivity", subtitle: "When noise, light or touch becomes too much", color: "#1A6B6B" },
  { id: "recovery", number: 15, title: "Recovery Is Not Linear", subtitle: "Why progress includes setbacks and what helps", color: "#1A5C2A" },
  { id: "care-planning", number: 16, title: "Care Planning Tips", subtitle: "Making your care plan meaningful and personal", color: "#2C5282" },
  { id: "autism", number: 17, title: "Understanding Autism", subtitle: "Neurodevelopmental differences and inpatient care", color: "#744210" },
  { id: "adhd", number: 18, title: "Understanding ADHD", subtitle: "Attention, impulse and energy differences", color: "#276749" },
  { id: "bipolar", number: 19, title: "Understanding Bipolar Disorder", subtitle: "Mood episodes and what can help", color: "#553C9A" },
  { id: "ocd", number: 20, title: "Understanding OCD", subtitle: "Obsessions, compulsions and the cycle", color: "#1A6B6B" },
  { id: "grief", number: 21, title: "Grief and Bereavement", subtitle: "Loss, adjustment and what helps", color: "#4A235A" },
  { id: "dual-diagnosis", number: 22, title: "Substance Use and Mental Health", subtitle: "When both are present at the same time", color: "#7B341E" },
  { id: "anger", number: 23, title: "Understanding Anger", subtitle: "Why anger happens and what can help", color: "#9B2335" },
  { id: "mindfulness", number: 24, title: "Mindfulness and Being Present", subtitle: "Practical ways to slow down and notice what is happening", color: "#2D6A4F" },
  { id: "mania", number: 25, title: "Understanding Mania and Hypomania", subtitle: "What is happening when everything speeds up", color: "#B5651D" },
  { id: "delirium", number: 26, title: "Understanding Delirium", subtitle: "When confusion comes on suddenly from a physical cause", color: "#5B4A3F" },
  { id: "infection-psychosis", number: 27, title: "When Infection Affects the Mind", subtitle: "Confusion or psychosis caused by physical illness", color: "#6B3A2A" },
  { id: "catatonia", number: 28, title: "Understanding Catatonia", subtitle: "When the body freezes, slows, or moves in unusual ways", color: "#3D3D5C" },
  { id: "stopping-substances", number: 29, title: "Stopping Substances and Mental Health", subtitle: "Brain changes after regular substance use - without blame", color: "#5C3A1E" },
];
