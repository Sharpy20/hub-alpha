// Mental State Examination (MSE) word banks - UK standard.
//
// The MSE is documented under set domains. This tool lets staff pick the
// descriptors that fit and assembles a written MSE they can copy into the EPR.
// It is a drafting aid, not a clinical record - the examiner stays responsible
// for what they write.
//
// UK note: the UK MSE differs slightly from the US version (e.g. the UK keeps
// Insight & Judgement together and uses "affect" for observed emotion). This is
// the UK ordering: Appearance, Behaviour, Speech, Mood, Affect, Thought,
// Perception, Cognition, Insight & Judgement.

export interface MseGroup {
  // Optional sub-heading shown above a cluster of chips (not in the output).
  label?: string;
  words: string[];
}

export interface MseDomain {
  id: string;
  title: string; // heading used in the generated note
  hint: string;  // plain-English "what this domain captures"
  // Optional lead-in so the sentence reads naturally, e.g. mood -> "as".
  prefix?: string;
  groups: MseGroup[];
}

export const MSE_DOMAINS: MseDomain[] = [
  {
    id: "appearance",
    title: "Appearance",
    hint: "What you see before anyone speaks - dress, hygiene, physical state, how they look.",
    groups: [
      {
        label: "Self-care & dress",
        words: [
          "well-kempt", "clean and tidy", "appropriately dressed",
          "casually dressed", "dressed in night clothes", "dishevelled",
          "unkempt", "evidence of poor self-care", "malodorous",
          "wearing multiple layers", "wearing sunglasses indoors",
        ],
      },
      {
        label: "Physical",
        words: [
          "appears their stated age", "appears older than their stated age",
          "appears physically well", "appears physically unwell",
          "appears underweight", "evidence of self-harm (scarring)",
          "visibly tremulous", "flushed",
        ],
      },
    ],
  },
  {
    id: "behaviour",
    title: "Behaviour",
    hint: "What they do during the assessment - manner towards you, eye contact, movement, rapport.",
    groups: [
      {
        label: "Manner",
        words: [
          "cooperative", "engaged", "polite", "guarded", "suspicious",
          "hostile", "irritable", "disinhibited", "overfamiliar",
          "withdrawn", "preoccupied",
        ],
      },
      {
        label: "Eye contact",
        words: ["good eye contact", "reduced eye contact", "intermittent eye contact", "no eye contact", "intense / staring"],
      },
      {
        label: "Movement",
        words: [
          "calm", "settled", "restless", "agitated", "pacing", "fidgety",
          "psychomotor retardation", "psychomotor agitation", "tremor",
          "appeared to respond to unseen stimuli",
        ],
      },
      {
        label: "Rapport",
        words: ["rapport easily established", "rapport difficult to establish", "hard to engage"],
      },
    ],
  },
  {
    id: "speech",
    title: "Speech",
    hint: "How they talk, not what they say - rate, volume, tone, amount.",
    groups: [
      { label: "Amount", words: ["normal amount", "minimal", "monosyllabic", "talkative", "spontaneous", "hyperverbal", "paucity of speech"] },
      { label: "Rate", words: ["normal rate", "slow", "hesitant", "rapid", "pressured"] },
      { label: "Volume", words: ["normal volume", "quiet", "whispered", "loud"] },
      { label: "Tone", words: ["normal tone", "flat / monotone", "bright", "animated", "tremulous"] },
      { label: "Form", words: ["clear and coherent", "relevant", "hard to follow at times", "tangential"] },
    ],
  },
  {
    id: "mood",
    title: "Mood",
    hint: "In the patient's OWN words - what they say their mood is (subjective).",
    prefix: "subjectively described as",
    groups: [
      {
        words: [
          "\"fine\"", "\"okay\"", "\"low\"", "\"depressed\"", "\"anxious\"",
          "\"stressed\"", "\"angry\"", "\"empty\"", "\"numb\"", "\"hopeless\"",
          "\"up and down\"", "\"better than before\"",
        ],
      },
      {
        label: "Or describe it",
        words: ["denied any low mood", "denied any difficulties", "unable to describe their mood", "reluctant to discuss mood"],
      },
    ],
  },
  {
    id: "affect",
    title: "Affect",
    hint: "What YOU observe of their emotion - range, and whether it matches the mood (objective).",
    groups: [
      { label: "Range", words: ["euthymic", "reactive", "full range", "restricted", "blunted", "flat", "labile", "elevated"] },
      { label: "Quality", words: ["anxious", "irritable", "tearful", "subdued", "congruent with stated mood", "incongruent with stated mood", "appropriate to context"] },
    ],
  },
  {
    id: "thought",
    title: "Thought",
    hint: "FORM = how thoughts flow. CONTENT = what the thoughts are about. Always record any thoughts of harm.",
    groups: [
      {
        label: "Form (how it flows)",
        words: [
          "linear and goal-directed", "logical", "circumstantial", "tangential",
          "flight of ideas", "loosening of associations", "thought blocking",
          "perseveration", "slowed",
        ],
      },
      {
        label: "Content (what about)",
        words: [
          "no abnormal beliefs elicited", "ruminations", "preoccupations",
          "persecutory ideas", "paranoid ideation", "grandiose ideas",
          "ideas of reference", "obsessional thoughts", "overvalued ideas",
          "delusional beliefs",
        ],
      },
      {
        label: "Risk thoughts",
        words: [
          "no thoughts of self-harm or suicide expressed", "thoughts of hopelessness",
          "passive thoughts of death", "suicidal ideation expressed",
          "thoughts of harm to others expressed", "denied any intent or plan",
        ],
      },
    ],
  },
  {
    id: "perception",
    title: "Perception",
    hint: "Hallucinations or other changes in how they sense the world.",
    groups: [
      {
        words: [
          "no perceptual abnormalities elicited", "denied any hallucinations",
          "appeared to respond to unseen stimuli", "appeared distracted as if hearing voices",
          "reported auditory hallucinations", "reported command hallucinations",
          "reported visual hallucinations", "described derealisation",
          "described depersonalisation",
        ],
      },
    ],
  },
  {
    id: "cognition",
    title: "Cognition",
    hint: "Are they alert and oriented? Attention and memory, in broad terms.",
    groups: [
      {
        words: [
          "alert", "orientated to time, place and person", "disorientated to time",
          "disorientated to place", "disorientated to person", "attention well-sustained",
          "poor concentration", "easily distracted", "no gross memory impairment",
          "appeared confused", "drowsy",
        ],
      },
    ],
  },
  {
    id: "insight",
    title: "Insight & Judgement",
    hint: "Do they recognise they are unwell, and can they make sound decisions about it?",
    groups: [
      {
        label: "Insight",
        words: [
          "good insight", "partial insight", "limited insight", "no insight",
          "accepts they are unwell", "does not believe they are unwell",
          "agreeable to treatment", "ambivalent about treatment",
          "declining treatment", "recognises the need for admission",
          "does not see the need for admission",
        ],
      },
      {
        label: "Judgement",
        words: ["judgement intact", "judgement impaired", "decision-making appears sound", "decision-making affected by current presentation"],
      },
    ],
  },
];
