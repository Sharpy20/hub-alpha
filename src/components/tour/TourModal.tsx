"use client";

import { useTour, TourSection } from "@/app/tour-provider";
import { TourWelcome } from "./TourWelcome";
import { TourSlideshow } from "./TourSlideshow";
import {
  DiaryMockup,
  AddTaskMockup,
  AppointmentMockup,
  NexusBadgeMockup,
  KanbanMockup,
  GdprMockup,
} from "./TourVisuals";
import { X, ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const SECTION_ORDER: TourSection[] = [
  "welcome",
  "referrals",
  "task-diary",
  "daily-tasks",
  "nexus-sync",
  "claiming",
  "gdpr",
  "complete",
];

const SECTION_LABELS: Record<TourSection, string> = {
  welcome: "Welcome",
  referrals: "Referrals",
  "task-diary": "Task Diary",
  "daily-tasks": "Daily Tasks",
  "nexus-sync": "Nexus Sync",
  claiming: "Claiming",
  gdpr: "GDPR",
  complete: "Done",
};

export function TourModal() {
  const {
    isTourActive,
    endTour,
    currentSection,
    setCurrentSection,
    currentSlide,
    setCurrentSlide,
    nextSlide,
    prevSlide,
    setIsInLiveWalkthrough,
  } = useTour();
  const router = useRouter();

  if (!isTourActive) return null;

  // Don't show modal when in live walkthrough (user is on the referral page)
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

  const sectionIndex = SECTION_ORDER.indexOf(currentSection);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
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

          {/* REFERRALS */}
          {currentSection === "referrals" && (
            <div className="space-y-4 text-center">
              <div className="py-2">
                <h3 className="font-bold text-xl text-gray-900">Referral Workflows</h3>
                <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                  New staff don&apos;t know how to make referrals. The Hub provides interactive,
                  step-by-step SOPs — no more hunting through SharePoint or asking colleagues.
                </p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <p className="text-sm text-indigo-800 font-medium mb-3">
                  Try it yourself — walk through a real IMHA referral workflow:
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
                Click through the steps, then return here to continue the tour.
              </p>

              <button
                onClick={nextSection}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip to next section →
              </button>
            </div>
          )}

          {/* TASK DIARY */}
          {currentSection === "task-diary" && (
            <TourSlideshow
              slides={[
                {
                  title: "The Ward Diary",
                  narrative: "Coordinating jobs is the biggest challenge on the ward. The Hub gives every shift a shared, digital task board.",
                  visual: <DiaryMockup />,
                },
                {
                  title: "Link Tasks to Referrals",
                  narrative: "After making a referral, create a patient task linked to it. Staff can see at a glance what needs chasing.",
                  visual: <AddTaskMockup />,
                },
                {
                  title: "Schedule Appointments",
                  narrative: "Book follow-up appointments linked to referrals — like a Section 117 meeting after an IMHA referral.",
                  visual: <AppointmentMockup />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSlide}
              onPrev={prevSlide}
              onComplete={nextSection}
            />
          )}

          {/* DAILY TASKS */}
          {currentSection === "daily-tasks" && (
            <TourSlideshow
              slides={[
                {
                  title: "Daily Audit Tasks",
                  narrative: "Small daily jobs we lose track of — fridge temps, drug checks, walkarounds. Each one links to a guide showing how to complete it.",
                  visual: <NexusBadgeMockup completed={false} />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSlide}
              onPrev={prevSlide}
              onComplete={nextSection}
            />
          )}

          {/* NEXUS SYNC */}
          {currentSection === "nexus-sync" && (
            <TourSlideshow
              slides={[
                {
                  title: "Nexus Auto-Complete",
                  narrative: "Someone completed fridge temps on Nexus Assurance without logging into the Hub? No worries — it auto-completes the task here too.",
                  visual: <NexusBadgeMockup completed={true} />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSlide}
              onPrev={prevSlide}
              onComplete={nextSection}
            />
          )}

          {/* CLAIMING */}
          {currentSection === "claiming" && (
            <TourSlideshow
              slides={[
                {
                  title: "Claim & Track Tasks",
                  narrative: "What if someone else was already working on it? Staff claim tasks to prevent duplicate work. The Kanban board shows what you own.",
                  visual: <KanbanMockup />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSlide}
              onPrev={prevSlide}
              onComplete={nextSection}
            />
          )}

          {/* GDPR */}
          {currentSection === "gdpr" && (
            <TourSlideshow
              slides={[
                {
                  title: "Data Protection",
                  narrative: "Minimal data, maximum audit trail. On discharge, everything compiles into a single document for the patient record.",
                  visual: <GdprMockup />,
                },
              ]}
              currentSlide={currentSlide}
              onNext={nextSlide}
              onPrev={prevSlide}
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
                  You&apos;ve seen the key features. Explore the app yourself, or check the Dev Panel
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
