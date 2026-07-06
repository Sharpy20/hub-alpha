"use client";

import { useTour, TourSection } from "@/app/tour-provider";
import { TourWelcome } from "./TourWelcome";
import { TourSlideshow } from "./TourSlideshow";
import {
  DiaryMockup,
  NexusBadgeMockup,
  KanbanMockup,
} from "./TourVisuals";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsV2, useV2Href } from "@/lib/hooks/useV2";

const FULL_SECTION_ORDER: TourSection[] = [
  "welcome",
  "referrals",
  "task-diary",
  "diary-integration",
  "nexus-nudge",
  "nexus-detail",
  "kanban",
  "complete",
];

// v2 strips out diary, nexus and kanban (those features don't exist in /v2).
const V2_SECTION_ORDER: TourSection[] = [
  "welcome",
  "referrals",
  "complete",
];

const SECTION_LABELS: Record<TourSection, string> = {
  welcome: "Welcome",
  referrals: "Guides",
  "task-diary": "Diary",
  "diary-integration": "Integration",
  "nexus-nudge": "Audits",
  "nexus-detail": "Nexus",
  kanban: "Your Tasks",
  complete: "Done",
};

const SECTION_SLIDE_COUNTS: Record<TourSection, number> = {
  welcome: 1,
  referrals: 1,
  "task-diary": 1,
  "diary-integration": 1,
  "nexus-nudge": 1,
  "nexus-detail": 1,
  kanban: 1,
  complete: 1,
};

function getPageNumber(section: TourSection, slide: number, sectionOrder: TourSection[]): number {
  let page = 0;
  for (const s of sectionOrder) {
    if (s === section) {
      page += slide + 1;
      break;
    }
    page += SECTION_SLIDE_COUNTS[s];
  }
  return page;
}

export function TourModal() {
  const {
    isTourActive,
    endTour,
    currentSection,
    setCurrentSection,
    currentSlide,
    setCurrentSlide,
    setIsInLiveWalkthrough,
    isInLiveWalkthrough,
  } = useTour();
  const router = useRouter();
  const isV2 = useIsV2();
  const link = useV2Href();
  const SECTION_ORDER = isV2 ? V2_SECTION_ORDER : FULL_SECTION_ORDER;
  const TOTAL_PAGES = SECTION_ORDER.reduce((sum, s) => sum + SECTION_SLIDE_COUNTS[s], 0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleEndTour = () => {
    if (dontShowAgain) {
      localStorage.setItem("wardhub_tour_dismissed", "true");
    }
    endTour();
  };

  if (!isTourActive) return null;
  if (isInLiveWalkthrough) return null;

  const advanceToSection = (section: TourSection) => {
    setCurrentSection(section);
    setCurrentSlide(0);
  };

  const nextSection = () => {
    const idx = SECTION_ORDER.indexOf(currentSection);
    if (idx < SECTION_ORDER.length - 1) {
      advanceToSection(SECTION_ORDER[idx + 1]);
    }
  };

  const prevSection = () => {
    const idx = SECTION_ORDER.indexOf(currentSection);
    if (idx > 0) {
      advanceToSection(SECTION_ORDER[idx - 1]);
    }
  };

  const sectionIndex = SECTION_ORDER.indexOf(currentSection);
  const currentPage = getPageNumber(currentSection, currentSlide, SECTION_ORDER);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div role="dialog" aria-modal="true" aria-label="Interactive demo tour" className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Page number badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg">
            <span className="text-sm font-bold">{currentPage}</span>
            <span className="text-xs text-indigo-200">/ {TOTAL_PAGES}</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleEndTour}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Section progress bar */}
        {currentSection !== "welcome" && currentSection !== "complete" && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-1">
              {SECTION_ORDER.filter((s) => s !== "welcome" && s !== "complete").map((s) => {
                const idx = SECTION_ORDER.indexOf(s);
                const isActive = idx === sectionIndex;
                const isPast = idx < sectionIndex;
                return (
                  <div key={s} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`h-1 w-full rounded-full transition-all ${
                        isPast ? "bg-green-400" : isActive ? "bg-indigo-500" : "bg-gray-200"
                      }`}
                    />
                    <span className={`text-[9px] font-medium ${isActive ? "text-indigo-600" : isPast ? "text-green-600" : "text-gray-400"}`}>
                      {SECTION_LABELS[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* WELCOME */}
          {currentSection === "welcome" && (
            <TourWelcome
              onStart={() => advanceToSection("referrals")}
              onSkip={handleEndTour}
            />
          )}

          {/* REFERRALS - walk through a common referral */}
          {currentSection === "referrals" && (
            <div className="space-y-4 text-center">
              <div className="py-2">
                <h3 className="font-bold text-xl text-gray-900">
                  Walk through a referral
                </h3>
                <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto leading-relaxed">
                  Step by step. Forms, examples,
                  who to contact. One click, done.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <p className="text-sm text-indigo-800 font-medium mb-3">
                  Try a real IMHA referral:
                </p>
                <button
                  onClick={() => {
                    setIsInLiveWalkthrough(true);
                    router.push(link("/guides/imha-advocacy?tour=true"));
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Open IMHA Referral <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-400">
                Hit &ldquo;Return to Tour&rdquo; when you&apos;re done.
              </p>

              <div className="flex items-center justify-between px-2 pt-2">
                <button
                  onClick={prevSection}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={nextSection}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip to next &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TASK DIARY - a simple electronic diary */}
          {currentSection === "task-diary" && (
            <TourSlideshow
              slides={[
                {
                  title: "A simple diary for the ward",
                  narrative: "If you let it, wardHub keeps your team organised too. One shared diary, everyone on the same page.",
                  visual: <DiaryMockup />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSection}
              onPrev={prevSection}
              onComplete={nextSection}
            />
          )}

          {/* DIARY INTEGRATION - diary to guide in one tap */}
          {currentSection === "diary-integration" && (
            <TourSlideshow
              slides={[
                {
                  title: "Diary to guide in one tap",
                  narrative: "A task in the diary links straight to the referral you need. No searching, no guessing.",
                  visual: (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm mx-auto">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 text-white text-center">
                        <p className="font-bold text-sm">Linked task</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <p className="text-xs font-semibold text-indigo-500 uppercase">Guide</p>
                          <p className="text-sm font-bold text-indigo-800">IMHA / Advocacy Referral</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-500 uppercase">Patient</p>
                          <p className="text-sm font-bold text-blue-800">Alex Morgan &ndash; Room 4</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-semibold text-purple-500 uppercase">Assigned to</p>
                          <p className="text-sm font-bold text-purple-800">Sarah Chen (Named Nurse)</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs font-semibold text-green-500 uppercase">Audit trail</p>
                          <p className="text-sm text-green-800">Created &rarr; Claimed &rarr; In Progress &rarr; Complete</p>
                          <p className="text-xs text-green-600 mt-1">Full log compiled on discharge</p>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSection}
              onPrev={prevSection}
              onComplete={nextSection}
            />
          )}

          {/* NEXUS NUDGE - never miss an audit */}
          {currentSection === "nexus-nudge" && (
            <TourSlideshow
              slides={[
                {
                  title: "Never miss an audit",
                  narrative: "Connected to the Trust's assurance dashboards. Overdue? You'll know.",
                  visual: <NexusBadgeMockup completed={false} />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSection}
              onPrev={prevSection}
              onComplete={nextSection}
            />
          )}

          {/* NEXUS DETAIL - guides help you finish it */}
          {currentSection === "nexus-detail" && (
            <TourSlideshow
              slides={[
                {
                  title: "Guides help you finish it",
                  narrative: "Links and step-by-step guides to complete the audit there and then. Great for new starters.",
                  visual: <NexusBadgeMockup completed={true} />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSection}
              onPrev={prevSection}
              onComplete={nextSection}
            />
          )}

          {/* KANBAN - your own space */}
          {currentSection === "kanban" && (
            <TourSlideshow
              slides={[
                {
                  title: "Your own space",
                  narrative: "Minimal on the surface. Behind the scenes, your team sees what you're working on. No duplication.",
                  visual: <KanbanMockup />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSection}
              onPrev={prevSection}
              onComplete={nextSection}
              completeLabel="Finish Tour"
            />
          )}

          {/* COMPLETE - have a play */}
          {currentSection === "complete" && (
            <div className="text-center space-y-6 py-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Have a play</h2>
                <p className="text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
                  Demo mode. Fake data. Everything resets
                  when you close the page. You can&apos;t break anything.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleEndTour}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Start exploring
                </button>
                {!isV2 && (
                  <button
                    onClick={() => {
                      handleEndTour();
                      router.push("/dev-panel");
                    }}
                    className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    View Dev Panel
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 justify-center text-sm text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Don&apos;t show this again
              </label>
              <button
                onClick={prevSection}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                &larr; Go back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
