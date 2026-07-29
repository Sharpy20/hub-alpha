// Text alternatives for the two explainer films (WCAG 2.1 1.2.1). Both are
// silent and entirely text-on-screen, so a transcript of the cards IS the whole
// alternative - there is no narration to describe. Times are from the rendered
// files in E:\Hub\wardhub-video\out. If a film is re-rendered, re-check these.
//
//   where-the-data-goes.mp4  = out/3.mp4      (90s, no chapter rail)
//   wardhub-full-reel.mp4    = out/merged.mp4 (3m42s, 5 chapters + rail)
//
// The reel contains the short film as its chapter 3, so the two transcripts
// overlap on purpose - each page gets the transcript of the file it plays.

export type TranscriptChapter = {
  /** Timestamp the chapter starts, as shown to the reader. */
  time: string;
  title: string;
  /** One entry per card or beat, in the order it appears. */
  lines: string[];
};

const BUILD_SCAFFOLD =
  "01 - The build: “AI builds the scaffold”. An AI (labelled “AI, e.g. Claude - builds the structure”) draws three empty shelves. Two badges appear: “No patient data · No trust documents” and “Replaceable by any tool”. Caption: “The AI builds an empty structure - the shelves and the frame. It never sees patient data or trust documents.”";

const TRUST_FILLS_IT =
  "02 - The Trust fills it: “Inside the Trust boundary”. Within a box marked “Trust M365 boundary”, three sources - Policy Library, SOPs, Partner forms - feed Copilot agents, which “read policy, draft a guide”. A guide card, “Emotion Regulation referral”, turns from “In development” (red) to “Signed off” (green) and is stamped “Approved for the ward”. Caption: “Copilot agents draft a guide from Trust policy, SOPs and partner forms. A person edits it and signs it off. Red to green.”";

const BOUNDARY_HOLDS =
  "03 - The boundary holds: “The data stays inside”. Inside a box marked “Trust boundary”, “Entered on the ward - tasks, notes, sign-off” flows into the “Trust datastore - Supabase (demo) · Trust infra (live)”, which copies out to SystmOne, “the record”. A red line from “Any AI outside the boundary” is blocked at the wall. Caption: “Everything entered stays inside the Trust boundary. It copies out to SystmOne. Nothing flows back to any AI.”";

const CLOSING_CARD =
  "Closing card: “wardHub. AI builds the shelves. The Trust writes the books, checks them, and keeps them.” Footer badge: “Illustration of the full build. Not running today.”";

/** The 90-second data film shown on the GDPR page. */
export const DATA_FILM_TRANSCRIPT: TranscriptChapter[] = [
  { time: "0:00", title: "The build", lines: [BUILD_SCAFFOLD] },
  { time: "0:22", title: "The Trust fills it", lines: [TRUST_FILLS_IT] },
  { time: "0:54", title: "The boundary holds", lines: [BOUNDARY_HOLDS] },
  { time: "1:15", title: "Close", lines: [CLOSING_CARD] },
];

/** The full 3m42s pitch reel shown on the About page. */
export const FULL_REEL_TRANSCRIPT: TranscriptChapter[] = [
  {
    time: "0:00",
    title: "Chapter 1 - the problem",
    lines: [
      "Labels drift across the screen: Intranet. Email chains. Policy PDFs. Sticky notes. A filing cabinet. Shared drive. The person who just left. That one folder.",
      "“A ward runs on knowledge.”",
      "“But it is scattered - and new starters are left to hunt for it.”",
      "“It should be in one place, and always current.”",
    ],
  },
  {
    time: "0:15",
    title: "Chapter 2 - this is wardHub",
    lines: [
      "Title card: “This is wardHub. A framework for turning knowledge into action. wardHub.live”",
      "The idea - “Built to be built on”. Three cards: Any ward. Any clinic. Any team that runs on procedures. Caption: “wardHub is a framework teams build on - not a finished, fixed app. The same platform fits any team that works to set procedures.”",
      "How it works - “Feed it your SOPs”. An SOP document converts into an interactive guide, “Rapid tranquillisation”, whose four steps tick off one by one: Check the criteria. Complete the form. Monitor and record. Where to send it. Caption: “Feed in a policy or SOP. Your procedures become interactive digital guides.”",
      "Real content, today - “Not a mock-up”. Three live guides: MHA detention papers (Pick the pathway, Check each form, Scrutiny checklist); Safeguarding referral (Confirm the concern, Complete the form, Where to send it); Leave and discharge (Plan the leave, Safety checks, Update the record). Caption: “This demo is populated with real SOPs from Derbyshire Healthcare NHS Foundation Trust.”",
      "In practice - “Two ways to use them”. On its own: the Section 17 leave guide. In the team diary: a day list reading Depot clinic - bay 2, Section 17 leave review (with a Guide badge), Fridge temperature check - the two linked by a line marked “linked to the task”. Caption: “Open a guide on its own when you need it. Or reach it from a task in a simple team diary.”",
      "“Let's take a look. wardHub.live”",
    ],
  },
  {
    time: "1:22",
    title: "Chapter 3 - where the data goes",
    lines: [BUILD_SCAFFOLD, TRUST_FILLS_IT, BOUNDARY_HOLDS, CLOSING_CARD],
  },
  {
    time: "2:52",
    title: "Chapter 4 - the ask",
    lines: [
      "“Back a two-ward pilot. My ward, plus one where the team doesn't know me - for honest feedback.”",
      "Low-effort start - keep building on today's scaffold.",
      "NHS login, with the data on Trust infrastructure.",
      "Every guide authored and signed off by named Trust approvers.",
      "“It needs a senior sponsor to carry it forward.”",
    ],
  },
  {
    time: "3:10",
    title: "Chapter IG - the whole thing on one board",
    lines: [
      "A single diagram headed “Inside the Trust”.",
      "Outside the box: External build tools - marked “never reaches the policies or the data”.",
      "Inside the box: The Library - 470 policies, SOPs, guidance. M365 Copilot - agents read the Trust's own library. The Guides - published in the Trust's own system.",
      "The Data: “Everything staff enter. Every name. Every record. Stored inside the Trust. Never sent anywhere else.”",
      "Out: SystmOne, the patient record - the arrow is marked “copies out”, and back the other way, “nothing comes back”.",
      "Key: Structure - built with external tools. Guides - written inside the Trust, checked by a person. Data - never leaves the Trust.",
    ],
  },
];
