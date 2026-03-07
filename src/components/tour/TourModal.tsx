"use client";

import { useTour, TourSection } from "@/app/tour-provider";
import { TourWelcome } from "./TourWelcome";
import { TourSlideshow } from "./TourSlideshow";
import {
  DiaryMockup,
  NexusBadgeMockup,
  KanbanMockup,
} from "./TourVisuals";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const SECTION_ORDER: TourSection[] = [
  "welcome",
  "referrals",
  "task-diary",
  "diary-integration",
  "nexus-nudge",
  "nexus-detail",
  "kanban",
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

const TOTAL_PAGES = Object.values(SECTION_SLIDE_COUNTS).reduce((a, b) => a + b, 0);

function getPageNumber(section: TourSection, slide: number): number {
  let page = 0;
  for (const s of SECTION_ORDER) {
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
  } = useTour();
  const router = useRouter();

  if (!isTourActive) return null;

  const { isInLiveWalkthrough } = useTour();
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
  const currentPage = getPageNumber(currentSection, currentSlide);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Page number badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg">
            <span className="text-sm font-bold">{currentPage}</span>
            <span className="text-xs text-indigo-200">/ {TOTAL_PAGES}</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={endTour}
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
              onSkip={endTour}
            />
          )}

          {/* REFERRALS - "wardHub is packed full of interactive guides" */}
          {currentSection === "referrals" && (
            <div className="space-y-4 text-center">
              <div className="py-2">
                <h3 className="font-bold text-xl text-gray-900">Interactive Guides</h3>
                <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                  wardHub is packed full of interactive guides &mdash; try one for yourself!
                </p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <p className="text-sm text-indigo-800 font-medium mb-3">
                  Walk through a real IMHA referral, step by step:
                </p>
                <button
                  onClick={() => {
                    setIsInLiveWalkthrough(true);
                    router.push("/referrals/imha-advocacy?tour=true");
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

          {/* TASK DIARY - "more than a set of interactive guides" */}
          {currentSection === "task-diary" && (
            <TourSlideshow
              slides={[
                {
                  title: "More Than Guides",
                  narrative: "wardHub is more than a set of interactive guides \u2014 a simple electronic diary helps you and your ward stay organised.",
                  visual: <DiaryMockup />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSection}
              onPrev={prevSection}
              onComplete={nextSection}
            />
          )}

          {/* DIARY INTEGRATION - seamless integration */}
          {currentSection === "diary-integration" && (
            <TourSlideshow
              slides={[
                {
                  title: "Everything Connected",
                  narrative: "Diary items seamlessly integrate between patient, staff member and step-by-step guide. Leaving a full auditable log for the patient electronic records on discharge.",
                  visual: (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-md mx-auto">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 text-white text-center">
                        <p className="font-bold text-sm">Linked Task Example</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <p className="text-xs font-semibold text-indigo-500 uppercase">Guide</p>
                          <p className="text-sm font-bold text-indigo-800">IMHA / Advocacy Referral</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-500 uppercase">Patient</p>
                          <p className="text-sm font-bold text-blue-800">Alex Morgan &mdash; Room 4, Byron Ward</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-semibold text-purple-500 uppercase">Assigned To</p>
                          <p className="text-sm font-bold text-purple-800">Sarah Chen (Named Nurse)</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs font-semibold text-green-500 uppercase">Audit Trail</p>
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

          {/* NEXUS NUDGE - audit compliance */}
          {currentSection === "nexus-nudge" && (
            <TourSlideshow
              slides={[
                {
                  title: "Improve Audit Compliance",
                  narrative: "Gentle nudges to complete those daily assurance dashboard items on Nexus. Nudges stop when Nexus reports the job completed.",
                  visual: <NexusBadgeMockup completed={false} />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSection}
              onPrev={prevSection}
              onComplete={nextSection}
            />
          )}

          {/* NEXUS DETAIL - fridge temp with links */}
          {currentSection === "nexus-detail" && (
            <TourSlideshow
              slides={[
                {
                  title: "Linked to Guides & Nexus",
                  narrative: "Each job tile holds direct links to the Nexus audit and links to a guide showing how to complete the real-world task. Great for new starters.",
                  visual: <NexusBadgeMockup completed={true} />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSection}
              onPrev={prevSection}
              onComplete={nextSection}
            />
          )}

          {/* KANBAN - your own diary view */}
          {currentSection === "kanban" && (
            <TourSlideshow
              slides={[
                {
                  title: "Your Own Diary View",
                  narrative: "See jobs you have picked up and track your progress. Shared with the ward diary view \u2014 team communication done for you.",
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

          {/* COMPLETE */}
          {currentSection === "complete" && (
            <div className="text-center space-y-6 py-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Tour Complete!</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  You&apos;ve seen the key features. Explore wardHub yourself, or check the Dev Panel
                  for the full technical documentation and business case.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={endTour}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Start Exploring
                </button>
                <button
                  onClick={() => {
                    endTour();
                    router.push("/dev-panel");
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  View Dev Panel
                </button>
              </div>
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
