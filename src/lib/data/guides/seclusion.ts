// Seclusion Support Plan - pure-guidance thinking tool.
//
// Field list is taken from the DHCFT "Seclusion Support Plan" (SystmOne) as set
// out in the Seclusion & Long-Term Segregation Policy (Nov 2024, v9). The
// per-field framing, "prompt yourself" questions, worked examples and tips are
// Mike's, written to push nurses past clone-y wording and keep the plan focused
// on getting the person OUT of seclusion safely, sooner.
//
// This is a guide to THINK with - it does not collect or store anything. The
// nurse reads it, thinks it through, then writes the entry in SystmOne in the
// patient's own specifics.

import type { GuidePromptConfig } from "./guideprompt";

export const SECLUSION_BUILDER: GuidePromptConfig = {
  id: "seclusion-support-plan",
  title: "Seclusion Support Plan",
  icon: "🚪",
  gradient: "from-rose-600 to-red-800",
  subtitle: "A guide to thinking through each part of the plan - not more paperwork.",
  breadcrumb: "Seclusion Support Plan",
  intro:
    "Work through each question below before you write the Seclusion Support Plan in SystmOne. The aim is not to write more - it is to keep the person safe and get them out of seclusion sooner. If you cannot answer a prompt clearly, the plan probably needs more thought - that is the point.",
  notice:
    "Guide only - it does not replace the SystmOne Seclusion Support Plan, the Seclusion Care Pathway, the reviews or the Datix.",
  principles: [
    "Start the plan as soon as seclusion commences and update it at every review.",
    "Involve the patient at the earliest opportunity; if they cannot engage, explain the plan and record why.",
    "Give the patient a copy unless it is not clinically safe - and record the reason if not.",
    "A patient in seclusion must never be deprived of their clothing.",
    "Do not duplicate the incident report or the general care plan - keep this operational.",
  ],
  focus: [
    { label: "Seclusion (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/9793/2454" },
    { label: "Seclusion & Long Term Segregation (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1858/2454" },
  ],
  sections: [
    {
      id: "risk",
      heading: "What is the risk?",
      why: "Keep it tight and specific to why seclusion is needed right now - not a rewrite of the whole incident. Focus on immediacy, harm to others, and why containment is needed.",
      think: [
        "What is happening right now that means this patient cannot safely be on the ward with others?",
        "What behaviour is presenting immediate risk to others?",
        "Who is at risk - staff, patients, or both?",
        "Is the behaviour predictable or escalating? Can the patient understand or control their actions right now?",
      ],
      examples: [
        "Risk of physical violence towards staff and other patients",
        "Risk of sexually disinhibited behaviour towards others",
        "High levels of agitation with unpredictable aggression",
        "Attempting to enter others' space, creating risk of harm",
        "Unable to maintain safe boundaries with others",
      ],
      tip: "State the current risk that requires containment - do not re-tell the whole incident.",
    },
    {
      id: "attempted",
      heading: "What was attempted to prevent seclusion?",
      why: "This is your least-restrictive evidence. Show effort, progression, and the failure of less restrictive options - what you genuinely tried, not what could have been tried.",
      think: [
        "If I had to justify this to CQC or a tribunal, what would I say we genuinely tried first?",
        "What support level or staffing changes were made?",
        "Was medication offered or given?",
        "Did we adapt the environment? What almost worked, even briefly?",
      ],
      examples: [
        "Increased observations (e.g. Level 2 / 1:1)",
        "Verbal de-escalation and reassurance",
        "Redirection to own space; reduced stimuli / moved away from others",
        "Gender-based staffing adjustments where indicated",
        "Engagement in distraction activities",
        "PRN medication offered / administered (oral offered first)",
        "Sensory strategies (quiet space, weighted blanket if appropriate)",
      ],
      tip: "Think in sequence: what we tried, in what order, and why each was not enough.",
    },
    {
      id: "ceasing",
      heading: "What steps should be in place when considering ceasing seclusion?",
      why: "This is the most important bit - it should link to exit criteria. Make it observable and measurable, not vague like 'settled'.",
      think: [
        "What would I need to SEE to feel safe opening that door?",
        "What behaviours need to reduce or stop?",
        "What would safe interaction look like?",
        "What can the patient realistically achieve in their current state?",
      ],
      examples: [
        "Patient engaging with staff without hostility",
        "Reduction in verbal / physical aggression",
        "Accepting oral medication if prescribed",
        "Remaining in own space without attempting to approach others",
        "Demonstrating ability to follow basic instructions",
        "Reduced agitation / restlessness",
        "Able to discuss the incident or current presentation (where appropriate)",
      ],
      tip: "Make it observable and measurable - what you would physically see, not 'settled'.",
    },
    {
      id: "peep",
      heading: "Patient Emergency Evacuation Plan (PEEP)",
      why: "Every patient in seclusion must have one. Keep it practical, not theoretical - how staff would actually get this person out safely in an emergency.",
      think: [
        "If the fire alarm went off right now, how do we get them out safely?",
        "Would the patient follow instruction or resist?",
        "How many staff would realistically be needed?",
        "Any mobility or physical health considerations, or risks that remain during evacuation?",
      ],
      examples: [
        "Patient to be escorted by a minimum of 3 trained staff if compliant",
        "If non-compliant, use Positive & Safe interventions as per training",
        "Consider known risks (violence / absconding / mobility)",
        "Ensure a clear route and use of the alarm",
        "Equipment required (e.g. wheelchair if mobility impaired)",
      ],
      tip: "Picture it really happening - who does what, the route, and how many staff.",
    },
    {
      id: "communication",
      heading: "Communication needs",
      why: "Think about what helps this patient understand and not escalate - tone, pace, clarity, consistency.",
      think: [
        "Do they process information slowly?",
        "Do they respond better to one staff member or several?",
        "Are they easily overwhelmed? Is there sensory overload happening?",
      ],
      examples: [
        "Clear, simple language required",
        "Allow time for processing information",
        "Avoid multiple staff giving instructions at once",
        "Use a calm tone and non-confrontational approach",
        "Interpreter required (if applicable)",
        "Hearing / visual impairment adjustments",
      ],
      tip: "Say what works for THIS person, and what to avoid.",
    },
    {
      id: "clothing",
      heading: "Clothing / bedding needs",
      why: "Balance dignity against risk. A patient in seclusion must never be deprived of their clothing.",
      think: [
        "What can they safely have that maintains dignity?",
        "Is there a self-harm or ligature risk?",
        "Is temperature or comfort a factor? Are we restricting unnecessarily?",
      ],
      examples: [
        "Standard clothing unless ligature / self-harm risk identified",
        "Consider anti-ligature clothing if high risk (individual MDT risk assessment)",
        "Ensure appropriate for dignity and temperature",
        "Blanket provided unless risk indicates otherwise",
      ],
      tip: "Any restriction must be justified by the current risk and reviewed each time.",
    },
    {
      id: "medication",
      heading: "Medication reviews needed",
      why: "Flag what the medic needs to look at - is medication helping, not helping, or making things worse?",
      think: [
        "Is the PRN effective?",
        "Is sedation too much or too little?",
        "Is there a gap in regular medication? Is urgent medical review needed?",
      ],
      examples: [
        "Review need for regular psychotropic medication",
        "Monitor effectiveness of PRN medication",
        "Consider side effects / over-sedation",
        "Medical review required if repeated PRN use",
        "Consider need for a rapid tranquillisation plan",
      ],
      tip: "Name the question the team needs to answer, and by when.",
    },
    {
      id: "hygiene",
      heading: "Personal hygiene / toilet facilities and needs",
      why: "Can they meet their own needs safely? Balance independence, supervision and dignity.",
      think: [
        "Do they need prompting?",
        "Do they need supervision (same gender)?",
        "Are there risks around privacy or vulnerability?",
      ],
      examples: [
        "Access to toilet facilities within the seclusion suite",
        "Staff support required or not, based on risk",
        "Same-gender staff where appropriate",
        "Regular prompts if disorganised mental state",
      ],
      tip: "Preserve privacy and dignity at all times, even where supervision is needed.",
    },
    {
      id: "utensils",
      heading: "Access to appropriate eating utensils",
      why: "What can they safely eat and with what? Restrict only what the risk requires.",
      think: [
        "Any risk of using utensils as weapons?",
        "Are simpler options needed?",
        "Is supervision required during eating?",
      ],
      examples: [
        "Standard utensils if low risk",
        "Adapted / safer utensils if risk identified",
        "Finger foods if necessary",
        "Supervision required during eating if risk present",
      ],
      tip: "Remove only what the risk demands - record why.",
    },
    {
      id: "reading",
      heading: "Restrictions to reading material",
      why: "What could help regulate them without increasing risk? Avoid restricting more than necessary.",
      think: [
        "Would access to reading calm them?",
        "Could the item be misused?",
        "Are we restricting more than necessary?",
      ],
      examples: [
        "Access to books / magazines where safe",
        "No hardback items if risk identified",
        "Remove materials that could be used to self-harm",
        "Access to a religious / spiritual text where requested and safe",
      ],
      tip: "Review the restriction at each review - it may no longer be needed.",
    },
    {
      id: "diet",
      heading: "Dietary & fluid requirements",
      why: "Keeping them physically safe during seclusion. Monitor intake and meet cultural / religious needs.",
      think: [
        "Are they eating and drinking enough?",
        "Do they need encouragement or prompting?",
        "Are there religious / cultural requirements?",
      ],
      examples: [
        "Encourage regular fluids (offer hourly)",
        "Monitor intake on the food & fluid chart",
        "Specific dietary requirements adhered to (e.g. halal, vegetarian)",
        "High-calorie options if not eating well",
      ],
      tip: "Record what is offered and taken, not just what is available.",
    },
    {
      id: "dysphagia",
      heading: "Dysphagia assessment",
      why: "Is there any risk they could choke or struggle to swallow? Risk increases if sedated.",
      think: [
        "Known SALT input?",
        "Need for a modified diet?",
        "Is the risk increased due to sedation?",
      ],
      examples: [
        "No known swallowing concerns",
        "Soft diet / thickened fluids if identified",
        "Follow SALT guidance if in place",
        "Increased monitoring if sedated",
      ],
      tip: "If sedation is on board, swallowing risk goes up - say how it is managed.",
    },
    {
      id: "trauma",
      heading: "Consideration of past history of trauma",
      why: "This is about not re-traumatising while keeping people safe.",
      think: [
        "Could anything we are doing make this worse for them?",
        "Gender sensitivities? Restraint triggers?",
        "Authority or confinement triggers?",
      ],
      examples: [
        "Avoid male / female staff where history indicates",
        "Minimise use of restraint where safe to do so",
        "Maintain clear communication about what is happening",
        "Avoid sudden entry / loud approaches",
      ],
      tip: "Name the known triggers and what staff should avoid where it is safe.",
    },
    {
      id: "pbs",
      heading: "Has a PBS plan or Advance Statement been considered?",
      why: "Reduces confusion - the care plan is a separate document. Do we already know what works for this person?",
      think: [
        "Is there an existing PBS plan or advance statement?",
        "Have we followed it?",
        "If not, why not?",
      ],
      examples: [
        "Existing PBS plan reviewed and followed",
        "Advance statement reviewed",
        "No current plan - to be developed post-incident",
        "Plan not followed - reason recorded",
      ],
      tip: "If a plan exists, say whether it was followed - and if not, why.",
    },
    {
      id: "gender",
      heading: "Gender-based considerations",
      why: "Does the gender of staff affect safety, dignity or distress - for personal care, trauma, or risk behaviours?",
      think: [
        "For dignity?",
        "For trauma reasons?",
        "For risk behaviours?",
      ],
      examples: [
        "Same-gender staff for personal care",
        "Consider past trauma relating to gender",
        "Balance preference with risk management needs",
      ],
      tip: "Where there is a preference, say how it is balanced against the risk.",
    },
    {
      id: "views",
      heading: "Patient involved / patient's views",
      why: "What have we told the patient, and what have they said back? Even 'unable to engage' is meaningful if justified.",
      think: [
        "Have we explained why they are here?",
        "Do they agree or disagree?",
        "Are they able to engage at all?",
      ],
      examples: [
        "Patient informed of the reasons for seclusion",
        "Patient expressed disagreement with the need for seclusion",
        "Patient able to discuss what would help them settle",
        "Patient currently unable / unwilling to engage - to revisit",
      ],
      tip: "Record the patient's own words where you can.",
    },
    {
      id: "copy",
      heading: "Copy given to patient",
      why: "Give a copy unless it is not clinically safe - and record the reason if withheld.",
      think: [
        "Would giving them this help, or confuse / escalate them right now?",
      ],
      examples: [
        "Copy given to patient",
        "To be offered when clinically appropriate",
        "Not given at this time due to mental state (reason recorded)",
      ],
      tip: "If you withhold it, the clinical reason must be recorded.",
    },
    {
      id: "family",
      heading: "Information about family / carer informed",
      why: "What would be helpful and appropriate at this stage? Check consent.",
      think: [
        "Do they consent to sharing?",
        "Is this the right time?",
        "Would it support care or increase distress?",
      ],
      examples: [
        "To be informed with patient consent",
        "Family / carer informed",
        "Not informed at this time (no consent / not appropriate currently)",
      ],
      tip: "Record the consent position and the timing.",
    },
    {
      id: "appearance",
      heading: "Patient appearance",
      why: "Keep it a snapshot, not a full MSE - what you would see if you glanced through the window.",
      think: [
        "Agitated / withdrawn / pacing / lying still?",
        "Kempt or dishevelled?",
        "Anything about posture or movement that stands out?",
      ],
      examples: [
        "Appears agitated / restless",
        "Pacing the room",
        "Lying still, withdrawn",
      ],
      tip: "A snapshot of right now - not a full mental state examination.",
    },
    {
      id: "mood",
      heading: "Mood",
      why: "How the patient comes across emotionally right now.",
      think: [
        "Distressed versus calm?",
        "Labile, irritable, angry, fearful or flat?",
      ],
      examples: [
        "Mood labile / irritable",
        "Appears frightened / distressed",
        "Calmer than at the point of seclusion",
      ],
      tip: "Describe what you observe, not a diagnosis.",
    },
    {
      id: "awareness",
      heading: "Level of awareness",
      why: "How alert and oriented the patient is - relevant to both risk and physical monitoring.",
      think: [
        "Alert versus drowsy?",
        "Aware of surroundings, or internally preoccupied?",
        "Any sign that sedation is affecting responsiveness?",
      ],
      examples: [
        "Alert but internally preoccupied",
        "Reduced awareness of surroundings",
        "Drowsy - baseline NEWS2 recorded",
      ],
      tip: "If awareness is reduced through sedation, make sure physical monitoring reflects it.",
    },
    {
      id: "physical",
      heading: "Physical health / frailty concerns including mobility",
      why: "Is there anything physically that makes this more risky?",
      think: [
        "Sedation?",
        "Falls risk or mobility issues?",
        "Chronic conditions to watch?",
      ],
      examples: [
        "No known physical health concerns",
        "Increased monitoring due to sedation (baseline NEWS2 recorded)",
        "Mobility independent / falls risk considered",
        "Chronic condition to monitor (e.g. diabetes, cardiac, respiratory)",
      ],
      tip: "Say what needs monitoring and how often.",
    },
    {
      id: "cultural",
      heading: "Cultural and spiritual needs",
      why: "What matters to this person beyond the immediate crisis?",
      think: [
        "Food, prayer, modesty, practices?",
      ],
      examples: [
        "Access to religious texts where safe",
        "Prayer times respected where possible",
        "Dietary needs linked to culture / religion",
        "Interpreter / cultural liaison where needed",
      ],
      tip: "Meet what you can safely, and say how.",
    },
  ],
  footer:
    "Guide only, grounded in the DHCFT Seclusion & Long-Term Segregation Policy (Nov 2024). Think it through, then write the plan in SystmOne in the patient's own specifics. Draft - to be verified against the live policy.",
};
