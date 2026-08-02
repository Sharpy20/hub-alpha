"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui";
import {
  CheckCircle, MapPin, Sparkles, Lightbulb, HelpCircle, Lock, FlaskConical,
  ShieldCheck, Circle,
} from "lucide-react";

// The roadmap is the answer to "where is this up to?", which is the question
// the project owner gets asked most often and by the most people. So it is
// built to be read once and pointed at afterwards: a track you can see your
// position on, and decision gates that say plainly what has been settled, what
// is still open, and what has been closed and should not be re-proposed.
//
// Honesty rule for this page: a stage is only "done" when its purpose was
// achieved, and a gate only reads "agreed" when someone actually agreed it on
// a date. An optimistic roadmap is worth less than no roadmap, because the
// first person who checks one claim stops believing the rest.

type StageStatus = "done" | "current" | "next" | "later";
type GateStatus = "agreed" | "open" | "closed";

interface Gate {
  question: string;
  status: GateStatus;
  on?: string;
  points: string[];
}

interface Item {
  title: string;
  description: string;
  gates?: Gate[];
}

interface Stage {
  id: string;
  phase: string;
  title: string;
  strap: string;
  status: StageStatus;
  gradient: string;
  items: Item[];
}

const STAGES: Stage[] = [
  {
    id: "poc",
    phase: "Phase 1",
    title: "Proof of concept",
    strap: "Does this work, and does anybody actually want it?",
    status: "done",
    gradient: "from-green-500 to-emerald-600",
    items: [
      {
        title: "Built, and put in front of real staff",
        description:
          "Online since January 2026. Six months of ward staff asking for the next thing they needed grew it to 68 step-by-step guides, a shared team diary, a 942-question quiz built from the Trust's own policy library, and a live view of what is blocking discharge. Nobody was assigned to write any of it, and that is the strongest evidence the project has.",
      },
      {
        title: "Sponsor session, 30 July 2026",
        description:
          "The Executive Director of Nursing, the Clinical Lead, Transformation, IG and clinical safety in one room. Booked for thirty minutes and ran to seventy. The ask was a two-ward pilot on the full build, a named IG contact, and a clinical sign-off route split by specialty.",
        gates: [
          {
            question: "Do we run a pilot, and how big?",
            status: "agreed",
            on: "30 Jul 2026",
            points: [
              "Two wards, not one. A single ward cannot tell you whether a change came from the tool or from the week it had.",
              "The project owner's own ward, plus one where the team does not know him. The second ward tests whether the tool works without its author standing next to it.",
            ],
          },
          {
            question: "Who signs off 68 guides? One person cannot read them all.",
            status: "agreed",
            on: "30 Jul 2026",
            points: [
              "Sign-off by specialty. Each guide belongs to the department that owns the subject, and that department signs its own shelf.",
              "The machinery already exists - every area has a lead and the SOPs already have owners. This connects to it rather than recreating it.",
            ],
          },
          {
            question: "Who owns the risk?",
            status: "agreed",
            on: "30 Jul 2026",
            points: [
              "Named leads agreed for clinical safety, for login and information governance, and for digital impact.",
            ],
          },
          {
            question: "Could AI-assisted guidance make this a medical device?",
            status: "open",
            points: [
              "Raised in the room by a Trust Clinical Safety Officer, and independently by a digital colleague. Talked down in under a minute and never formally closed.",
              "Nobody has assessed it, and this project does not claim an answer. Recorded as HAZ-024 in the hazard log.",
              "What keeps it on the safe side of the line is deliberate: no scoring, no thresholds, no alerts, no recommendations, and validated tools left with the system that owns them.",
            ],
          },
          {
            question: "Who owns it?",
            status: "open",
            points: [
              "Built on the author's own time. No ownership or intellectual property conversation has happened.",
              "Raised in the meeting, not resolved.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "approval",
    phase: "Phase 2",
    title: "Approval, data and authoring",
    strap: "What is the least this can hold, who signs the content, and where is it written?",
    status: "current",
    gradient: "from-blue-500 to-indigo-600",
    items: [
      {
        title: "What data is essential",
        description:
          "Every field stored is a governance question somebody has to answer, so the record has been cut back twice rather than grown. This one is largely settled, and settled downwards.",
        gates: [
          {
            question: "What is the minimum patient record?",
            status: "agreed",
            on: "28 Jul 2026",
            points: [
              "Name, ward, status, admission date and time, named nurse, consultant, ward professional, discharge fields. Nothing clinical.",
              "Still open: whether named nurse, consultant and admission date should follow the rest out. The 'who keeps this current' argument reaches them too.",
            ],
          },
          {
            question: "Diagnosis, MHA legal status, alerts, risks, room, bed",
            status: "closed",
            on: "28 Jul 2026",
            points: [
              "Removed entirely, and this one is closed rather than merely decided - please do not re-propose it.",
              "The reasoning is clinical safety before information governance: wardHub is not the clinical record, so nothing it held would have an owner keeping it current, and a member of staff could act on a stale value.",
              "A test in the codebase fails the build if these fields reappear.",
            ],
          },
          {
            question: "What staff data is needed?",
            status: "open",
            points: ["Job title and ward only, or shift patterns, or full rota integration."],
          },
        ],
      },
      {
        title: "Content sign-off by specialty",
        description:
          "The project's biggest open risk is the content, not the code. 68 guides exist; one is signed off. The next artefact is that list with a named owner against every line, so each specialty is asked for a quick expert eyeball rather than a rewrite.",
        gates: [
          {
            question: "Should a guide be allowed to go green with dead links in it?",
            status: "open",
            points: [
              "The one signed-off guide currently carries five dead links, so green does not yet mean complete.",
              "Either green requires working links, or the badge needs a second dimension.",
            ],
          },
        ],
      },
      {
        title: "Authoring moves inside the Trust tenant",
        description:
          "Guides are drafted from Trust policy, and the drafting is moving to where those policies already live: Copilot agents working directly on the Trust's own policy library, inside the tenant. The sign-off rule does not change. No agent output goes live unread, and nothing turns green without a named person in the owning specialty.",
        gates: [
          {
            question: "How does drafted content actually reach the site?",
            status: "open",
            points: [
              "The site cannot read a private SharePoint library without an app registration, and a Power Automate flow cannot call out to the site either: the HTTP action is a premium feature and the licence held is Office 365 standard connectors only.",
              "Surviving options, cheapest first: check whether the tenant permits anonymous link sharing; ask IT for the Power Automate premium add-on; publish manually through a gated form; or an app registration at production stage, which was always the real answer.",
              "The constraint is the licence, not the code. Worth knowing before anyone offers to solve it.",
            ],
          },
          {
            question: "Where does the drafting model run?",
            status: "open",
            points: [
              "Being explored: the Claude model inside Microsoft 365. If the Trust enables it, drafting happens in-tenant and the question of what leaves the Trust largely closes itself.",
              "No commitment, and it is a Trust licensing decision rather than a project one.",
            ],
          },
        ],
      },
      {
        title: "DPIA and clinical safety",
        description:
          "A DCB 0129 hazard log of 27 hazards, a clinical risk management plan and a safety case report are written and published in full in this panel, as the documents rather than as summaries. The safety case says wardHub is safe to continue as a demonstration. It deliberately does not claim a pilot is safe to start yet.",
        gates: [
          {
            question: "What has to be true before a pilot can start?",
            status: "open",
            points: [
              "A completed DPIA, a Trust-approved datastore and Trust authentication. The demo stores no jobs at all, so it is not yet an operational record.",
              "A named Clinical Safety Officer. Three residual risks are marked as needing their judgement rather than guessed at.",
              "The 15 clashes between guide content and Trust policy resolved or the affected guides withdrawn. Six are rated critical.",
              "Protected time for the project owner. Offered twice in the meeting and not yet taken up.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "build",
    phase: "Phase 3",
    title: "Trust build and security",
    strap: "Their hosting, their login, their database.",
    status: "next",
    gradient: "from-purple-500 to-violet-600",
    items: [
      {
        title: "Hosting and a security review",
        description:
          "Trust Digital Services provide the approved hosting framework and security baseline, and review the codebase, configuration and data flows. Anything found gets fixed before real content goes near a ward.",
      },
      {
        title: "Trust authentication",
        description:
          "The demo sits behind a single shared password, which is honest about what it is: a demo gate, not a login. Real use needs Trust authentication, and ideally smartcard, so that who did what is a fact rather than a claim.",
      },
      {
        title: "An approved datastore",
        description:
          "Today the diary is not stored anywhere at all - it lives in the page's memory and a refresh wipes it. That is deliberate for a demo and useless for a ward. The pilot needs a real store, in a confirmed UK region, that the Trust owns.",
      },
      {
        title: "Where the code lives",
        description:
          "The repository is a private personal GitHub account today, and hosting deploys straight from it. That is fine for one person and wrong for a Trust system.",
        gates: [
          {
            question: "Who holds the codebase?",
            status: "open",
            points: [
              "Being explored: a Trust-owned GitHub organisation, or a self-hosted repository inside the Trust.",
              "Either way the aim is the same - the project should not depend on one person's account, and it should be possible to hand the whole thing over without waiting on him.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "pilot",
    phase: "Phase 4",
    title: "Two-ward pilot",
    strap: "Does it help, on a ward where nobody knows the author?",
    status: "later",
    gradient: "from-amber-500 to-orange-600",
    items: [
      {
        title: "Two wards, four to six weeks, alongside existing process",
        description:
          "No disruption, no budget. If it helps, expand. If it does not, it cost almost nothing to find out.",
        gates: [
          {
            question: "Which second ward?",
            status: "open",
            points: ["An older adult ward has been suggested and not yet settled."],
          },
          {
            question: "Who runs the measures?",
            status: "open",
            points: [
              "Ward staff self-report is cheapest, and is marking your own homework.",
              "A QI project with the Transformation team's own measures is slower to set up and the only version an executive will act on. This is the ask being made.",
            ],
          },
        ],
      },
      {
        title: "The cold ward test",
        description:
          "This used to sit in Phase 1 as a separate demo to a ward that does not know the developer. It has been folded into the pilot, because the agreed second ward is exactly that test and running it twice would prove the same thing twice. The questions it has to answer are unchanged: is this actually needed, is it the right approach, and what could it do harm to as well as help.",
      },
    ],
  },
  {
    id: "after",
    phase: "Phase 5",
    title: "After the pilot",
    strap: "Only if the pilot earns it.",
    status: "later",
    gradient: "from-slate-500 to-slate-700",
    items: [
      {
        title: "More wards, and possibly other Trusts",
        description:
          "The architecture is Trust-agnostic and only the content is specific, so another Trust could point the same build at their own policies and contacts. The transferable asset is the content model and the sign-off structure, not the code. Scaling is a content-ownership question rather than a technical one.",
      },
      {
        title: "Integrations, in order of realism",
        description:
          "The Nexus Assurance webhook first, so a completed audit on Nexus ticks the matching job here and staff do not update two systems. A conversation with TPP about SystmOne after that. wardHub does not write to the clinical record and there is no plan for it to.",
      },
      {
        title: "Handover-ready throughout",
        description:
          "This panel is the handover document, which is why it is written in public and kept current. The test is whether somebody else could pick the project up without a conversation.",
      },
    ],
  },
];

// What is actually being worked on. Deliberately no dates: the moment a date
// appears somebody treats it as a commitment that was never agreed.
const BOARD: { heading: string; tone: string; note: string; items: string[] }[] = [
  {
    heading: "Now",
    tone: "border-green-300 bg-green-50",
    note: "In hand this week",
    items: [
      "Reading and colour-coding the 47 guides awaiting review",
      "The 15 clashes between guide content and Trust policy, six of them critical",
      "Branch protection, so a failing build cannot reach the live site",
      "Backing up the single copy of the internal contacts file",
      "Splitting the discharge overview page, which has quietly grown to 2,200 lines",
    ],
  },
  {
    heading: "Next",
    tone: "border-blue-300 bg-blue-50",
    note: "Queued, not started",
    items: [
      "The 68-guide list with a named owner against every line",
      "DPIA to Information Governance",
      "A named Clinical Safety Officer, and a position on the medical device question",
      "One line of guidance in the add-job box, because job titles are free text next to a patient name",
      "Basic uptime monitoring - free, ten minutes, and nobody would currently know if the site broke overnight",
    ],
  },
  {
    heading: "Exploring",
    tone: "border-violet-300 bg-violet-50",
    note: "No commitment, and some of it will not happen",
    items: [
      "The Claude model inside Microsoft 365, to bring drafting fully inside the tenant",
      "A Trust-owned or self-hosted code repository",
      "The Nexus Assurance webhook for audit jobs",
      "An exploratory conversation with TPP about SystmOne",
      "Postcode and GP-surgery lookup for the service map",
      "Making the capacity assessment guide interactive, so answers shape the case note",
    ],
  },
];

const STATUS_LABEL: Record<StageStatus, string> = {
  done: "Done",
  current: "We are here",
  next: "Next",
  later: "Later",
};

const GATE_STYLE: Record<GateStatus, { label: string; chip: string; box: string; Icon: typeof CheckCircle }> = {
  agreed: {
    label: "Agreed",
    chip: "bg-green-100 text-green-800 border-green-300",
    box: "border-green-200 bg-green-50/60",
    Icon: CheckCircle,
  },
  open: {
    label: "Open",
    chip: "bg-amber-100 text-amber-900 border-amber-300",
    box: "border-amber-200 bg-amber-50/60",
    Icon: HelpCircle,
  },
  closed: {
    label: "Closed",
    chip: "bg-slate-200 text-slate-700 border-slate-300",
    box: "border-slate-200 bg-slate-50",
    Icon: Lock,
  },
};

export function Roadmap() {
  const [selected, setSelected] = useState("approval");
  const currentIdx = STAGES.findIndex((s) => s.status === "current");
  const stage = STAGES.find((s) => s.id === selected) || STAGES[currentIdx];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-nhs-black">Roadmap</h1>
        <p className="text-nhs-dark-grey mt-1">
          Where this is up to, what has been decided, and what is still open. Nothing here carries a date it
          was not given.
        </p>
      </div>

      {/* How guides are made - the question asked more than any other */}
      <div className="rounded-2xl border-2 border-nhs-blue/20 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-nhs-blue flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-2 min-w-0">
            <h2 className="text-lg font-bold text-nhs-black">How a guide is made, and what stops one going live</h2>
            <p className="text-sm text-nhs-dark-grey">
              A guide is drafted from Trust policy, and it never goes live on the strength of that draft. Every
              guide carries a traffic-light badge, and it only turns green when a named person in the owning
              specialty has read it and signed it off. That is the control, and it is the same control whoever or
              whatever wrote the first draft.
            </p>
            <p className="text-sm text-nhs-dark-grey">
              The authoring route is moving inside the Trust tenant: Copilot agents working directly on the
              Trust&apos;s own policy library, so drafting happens where the policies already live. That work is
              Phase 2 below, and the sign-off rule does not change when it lands.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                1 signed off
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                47 awaiting review
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                20 in development
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-nhs-dark-grey border border-gray-300">
                68 guides
              </span>
            </div>
            <p className="text-xs text-nhs-mid-grey">
              Those numbers are counted from the codebase, not estimated. Content is the project&apos;s biggest
              open risk, and saying so is more useful than a flattering figure.
            </p>
          </div>
        </div>
      </div>

      {/* The track */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 pt-8 overflow-x-auto">
        <div
          className="flex items-start min-w-[720px]"
          role="tablist"
          aria-label="Roadmap phases"
          onKeyDown={(e) => {
            const i = STAGES.findIndex((s) => s.id === selected);
            if (e.key === "ArrowRight" && i < STAGES.length - 1) setSelected(STAGES[i + 1].id);
            if (e.key === "ArrowLeft" && i > 0) setSelected(STAGES[i - 1].id);
          }}
        >
          {STAGES.map((s, i) => {
            const isSelected = s.id === selected;
            const passed = i <= currentIdx;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center relative">
                {/* Connector to the next node, drawn behind the circle */}
                {i < STAGES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-[26px] left-1/2 w-full h-1 rounded-full ${
                      i < currentIdx ? "bg-nhs-blue" : "bg-gray-200"
                    }`}
                  />
                )}
                {s.status === "current" && (
                  <span className="absolute -top-7 flex items-center gap-1 px-2.5 py-1 rounded-full bg-nhs-blue text-white text-[11px] font-bold whitespace-nowrap shadow-sm">
                    <MapPin className="w-3 h-3" /> WE ARE HERE
                  </span>
                )}
                <button
                  role="tab"
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelected(s.id)}
                  className="relative z-10 flex flex-col items-center gap-2 px-2 group"
                >
                  <span
                    className={`w-[52px] h-[52px] rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${s.gradient} text-white border-white ring-4 ring-nhs-blue/30 shadow-lg`
                        : s.status === "done"
                        ? "bg-green-500 text-white border-white shadow"
                        : passed
                        ? "bg-nhs-blue text-white border-white shadow"
                        : "bg-white text-gray-400 border-gray-200 group-hover:border-gray-300"
                    }`}
                  >
                    {s.status === "done" ? <CheckCircle className="w-6 h-6" /> : i + 1}
                  </span>
                  <span className="text-center max-w-[130px]">
                    <span
                      className={`block text-sm font-bold leading-tight ${
                        isSelected ? "text-nhs-black" : passed ? "text-nhs-dark-grey" : "text-gray-400"
                      }`}
                    >
                      {s.title}
                    </span>
                    <span
                      className={`block text-[11px] font-semibold uppercase tracking-wide mt-0.5 ${
                        s.status === "current"
                          ? "text-nhs-blue"
                          : s.status === "done"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected stage */}
      <div className="space-y-4">
        <div className={`bg-gradient-to-r ${stage.gradient} rounded-2xl p-5 text-white`}>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm font-medium text-white/70">{stage.phase}</p>
              <h2 className="text-xl font-bold">{stage.title}</h2>
              <p className="text-white/85 text-sm mt-1">{stage.strap}</p>
            </div>
            {stage.status === "current" && (
              <span className="ml-auto px-3 py-1 bg-white/20 rounded-full text-xs font-bold whitespace-nowrap">
                WE ARE HERE
              </span>
            )}
            {stage.status === "done" && (
              <span className="ml-auto px-3 py-1 bg-white/20 rounded-full text-xs font-bold whitespace-nowrap">
                DONE
              </span>
            )}
          </div>
        </div>

        {stage.items.map((item, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${stage.gradient} text-white flex items-center justify-center font-bold text-sm flex-shrink-0`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <h3 className="font-bold text-nhs-black text-lg">{item.title}</h3>
                    <p className="text-sm text-nhs-dark-grey mt-1">{item.description}</p>
                  </div>

                  {item.gates?.map((gate, gi) => {
                    const style = GATE_STYLE[gate.status];
                    return (
                      <div key={gi} className={`rounded-xl border-2 p-4 ${style.box}`}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-2 min-w-0">
                            {/* A rotated square reads as a decision diamond without
                                needing an icon that means something else elsewhere */}
                            <span
                              aria-hidden="true"
                              className="w-3 h-3 mt-1 rotate-45 flex-shrink-0 border-2 border-current opacity-70"
                            />
                            <p className="font-semibold text-nhs-black text-sm">{gate.question}</p>
                          </div>
                          <span
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${style.chip}`}
                          >
                            <style.Icon className="w-3 h-3" />
                            {style.label}
                            {gate.on ? ` ${gate.on}` : ""}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {gate.points.map((p, pi) => (
                            <li key={pi} className="flex gap-2 text-sm text-nhs-dark-grey">
                              <Circle className="w-2 h-2 mt-1.5 flex-shrink-0 fill-current opacity-40" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Now / Next / Exploring */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5 text-nhs-blue" />
          <h2 className="text-lg font-bold text-nhs-black">What is actually being worked on</h2>
        </div>
        <p className="text-sm text-nhs-dark-grey mb-3">
          Deliberately without dates. If something here matters to you, say so and it moves - that is more use
          than a deadline nobody agreed to.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {BOARD.map((col) => (
            <div key={col.heading} className={`rounded-2xl border-2 p-4 ${col.tone}`}>
              <h3 className="font-bold text-nhs-black">{col.heading}</h3>
              <p className="text-xs text-nhs-mid-grey mb-3">{col.note}</p>
              <ul className="space-y-2">
                {col.items.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm text-nhs-dark-grey">
                    <span aria-hidden="true" className="text-nhs-mid-grey">&bull;</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Ideas that have not been through anybody yet */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-1">
        <div className="bg-white rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-nhs-black">Ideas, not plans</h2>
              <p className="text-xs text-nhs-mid-grey">
                AI-generated suggestions that have not been reviewed or approved by anybody
              </p>
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-sm text-violet-800">
            <strong>Read this first:</strong> these are a brainstorm, not a roadmap. Some are not feasible, some
            are not desirable, and none of them has been agreed. They are published so nobody has to ask whether
            a thing has been thought of.
          </div>

          {[
            {
              icon: "text-amber-500",
              heading: "Quick wins",
              items: [
                {
                  title: "Shift handover summary",
                  desc: "Generate a handover at shift end from what is already in the diary: outstanding jobs, what was completed, what is waiting on somebody. One click to copy or print.",
                },
                {
                  title: "New starter pack",
                  desc: "A guided first login that walks a new member of staff through the things their role actually uses. Bank and agency staff get a shorter version.",
                },
                {
                  title: "Ward dashboard",
                  desc: "One screen for the shift: outstanding jobs, upcoming appointments, what is blocking a discharge, and which audits are due.",
                },
                {
                  title: "Offline mode",
                  desc: "Cache links and guides for when the Wi-Fi drops. Ward areas have poor connectivity and reference material should not depend on it.",
                },
              ],
            },
            {
              icon: "text-blue-500",
              heading: "Medium term",
              items: [
                {
                  title: "Job analytics",
                  desc: "Which jobs are most often overdue, which shifts carry the most, which referrals take longest. Ward improvement from the ward's own data.",
                },
                {
                  title: "Cross-ward handover",
                  desc: "When a patient transfers, the receiving ward gets what is outstanding and who was involved, instead of phone tag.",
                },
                {
                  title: "Notifications through Teams",
                  desc: "Overdue jobs and approaching deadlines pushed into Teams or email, rather than building a notification system nobody asked for.",
                },
                {
                  title: "Template library",
                  desc: "One ward builds a good workflow, another adopts it. Sharing is the point of a shared tool.",
                },
              ],
            },
            {
              icon: "text-purple-500",
              heading: "Bigger conversations",
              items: [
                {
                  title: "CQC evidence pack",
                  desc: "Compile evidence from completed audit jobs and activity for any date range, rather than assembling it by hand when an inspection is announced.",
                },
                {
                  title: "Multi-Trust",
                  desc: "The build is Trust-agnostic and only the content is specific. The transferable asset is the content model and the sign-off structure.",
                },
                {
                  title: "A conversation with TPP",
                  desc: "SystmOne's developers have a clinical integration team. Even with no integration planned, thirty minutes would show what is possible - read-only job lists, patient context, event notifications.",
                },
                {
                  title: "Workflow builder from a document",
                  desc: "Upload a referral form, get a draft workflow back, review it, sign it off. Same sign-off gate as everything else.",
                },
              ],
            },
          ].map((group) => (
            <div key={group.heading}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className={`w-4 h-4 ${group.icon}`} />
                <h3 className="font-bold text-sm text-nhs-black">{group.heading}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {group.items.map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-sm text-nhs-black">{item.title}</p>
                    <p className="text-xs text-nhs-dark-grey mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
