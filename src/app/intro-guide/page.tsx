"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { useIsV2 } from "@/lib/hooks/useV2";
import {
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Home,
  CalendarDays,
  ClipboardList,
  Users,
  Bookmark,
  FileText,
  BookOpen,
  User,
  CheckCircle2,
  MousePointer,
  Star,
  ArrowRight,
  Play,
  MessageSquare,
  Pencil,
} from "lucide-react";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  slides: {
    title: string;
    description: string;
    tips?: string[];
    visual: React.ReactNode;
  }[];
}

// Visual component for home page
function HomeVisual() {
  return (
    <div className="bg-gray-100 rounded-xl p-4 space-y-3">
      <div className="bg-white rounded-lg p-3 border-2 border-indigo-400">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="font-bold text-gray-800">Quick Actions</span>
        </div>
        <div className="grid grid-cols-2 gap-1 sm:gap-2">
          <div className="bg-indigo-50 rounded p-1.5 sm:p-2 text-xs font-medium text-indigo-700">Team Diary</div>
          <div className="bg-purple-50 rounded p-1.5 sm:p-2 text-xs font-medium text-purple-700">My Jobs</div>
          <div className="bg-amber-50 rounded p-1.5 sm:p-2 text-xs font-medium text-amber-700">Links</div>
          <div className="bg-rose-50 rounded p-1.5 sm:p-2 text-xs font-medium text-rose-700">Guides</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Today&apos;s Tasks Preview</div>
        <div className="space-y-1">
          <div className="bg-gray-50 rounded p-2 text-xs">Morning handover</div>
          <div className="bg-gray-50 rounded p-2 text-xs">Patient review 10:00</div>
        </div>
      </div>
    </div>
  );
}

// Visual component for navigation
function NavVisual() {
  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-2 flex items-center gap-2 border-b">
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white text-xs">H</div>
          <span className="text-sm font-bold">wardHub</span>
          <div className="flex-1" />
          <div className="flex gap-1">
            <div className="px-2 py-1 bg-indigo-50 rounded text-xs text-indigo-700 font-medium">Diary</div>
            <div className="px-2 py-1 bg-amber-50 rounded text-xs text-amber-700 font-medium">Links</div>
            <div className="px-2 py-1 bg-emerald-50 rounded text-xs text-emerald-700 font-medium">Guides</div>
            <div className="px-2 py-1 bg-teal-50 rounded text-xs text-teal-700 font-medium">Patients</div>
          </div>
        </div>
        <div className="p-3 text-center text-gray-400 text-sm">
          Page content here...
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <MousePointer className="w-4 h-4 text-indigo-500" />
        <span className="text-xs text-gray-600">Click any nav button to jump to that section</span>
      </div>
    </div>
  );
}

// Visual component for ward diary
function WardDiaryVisual() {
  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-indigo-500 text-white p-2 text-sm font-bold flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Team Diary
        </div>
        <div className="p-3">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-gray-50 rounded p-2 text-center border-2 border-gray-200">
              <div className="text-xs text-gray-500">Yesterday</div>
            </div>
            <div className="flex-1 bg-indigo-50 rounded p-2 text-center border-2 border-indigo-400">
              <div className="text-xs font-bold text-indigo-700">Today</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded p-2 text-center border-2 border-gray-200">
              <div className="text-xs text-gray-500">Tomorrow</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 bg-amber-50 rounded p-2 text-xs">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span>Team Task: Morning checks</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 rounded p-2 text-xs">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Patient Task: Review J. Smith</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual component for My Tasks
function MyTasksVisual() {
  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-purple-500 text-white p-2 text-sm font-bold flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          My Jobs (Kanban Board)
        </div>
        <div className="p-3 flex gap-2">
          <div className="flex-1 bg-gray-50 rounded p-2">
            <div className="text-xs font-bold text-gray-700 mb-2">Not Started</div>
            <div className="bg-white rounded p-2 text-xs border shadow-sm mb-1">Task 1</div>
            <div className="bg-white rounded p-2 text-xs border shadow-sm">Task 2</div>
          </div>
          <div className="flex-1 bg-blue-50 rounded p-2">
            <div className="text-xs font-bold text-blue-700 mb-2">In Progress</div>
            <div className="bg-white rounded p-2 text-xs border shadow-sm border-blue-300">Task 3</div>
          </div>
          <div className="flex-1 bg-green-50 rounded p-2">
            <div className="text-xs font-bold text-green-700 mb-2">Done</div>
            <div className="bg-white rounded p-2 text-xs border shadow-sm border-green-300 line-through text-gray-400">Task 4</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual component for profile dropdown
function ProfileVisual() {
  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="flex justify-end">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-56 overflow-hidden">
          <div className="bg-indigo-500 text-white p-3">
            <div className="font-bold">Sarah Johnson</div>
            <div className="text-xs text-indigo-200">Staff Nurse</div>
          </div>
          <div className="p-2 border-b">
            <div className="text-xs text-gray-500 mb-1">Viewing Ward</div>
            <div className="flex gap-1">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">Byron</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Shelley</span>
            </div>
          </div>
          <div className="p-2 border-b">
            <div className="text-xs text-gray-500 mb-1">Demo Role</div>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Staff</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Ward Admin</span>
            </div>
          </div>
          <div className="p-2 text-xs text-red-600 flex items-center gap-1">
            Log out
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual for referrals
function ReferralsVisual() {
  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-rose-500 text-white p-2 text-sm font-bold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Referral Workflow
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">1</div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">2</div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">3</div>
            <ArrowRight className="w-4 h-4 text-gray-300" />
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs">4</div>
          </div>
          <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-3">
            <div className="font-bold text-sm text-indigo-800 mb-1">Step 3: Submit</div>
            <div className="text-xs text-gray-600">Complete the form and click Next to continue...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual for settings
function SettingsVisual() {
  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-64 mx-auto overflow-hidden">
        <div className="p-3 border-b flex items-center gap-3 hover:bg-gray-50">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">Intro Guide</div>
            <div className="text-xs text-gray-500">Learn how to use the app</div>
          </div>
        </div>
        <div className="p-3 border-b flex items-center gap-3 hover:bg-gray-50">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">Feedback</div>
            <div className="text-xs text-gray-500">Share ideas and issues</div>
          </div>
        </div>
        <div className="p-3 flex items-center gap-3 hover:bg-gray-50">
          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
            <Pencil className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">Editor</div>
            <div className="text-xs text-gray-500">Edit workflows & guides</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const guideSections: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Play className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500",
    slides: [
      {
        title: "Welcome to wardHub",
        description: "Your central resource for ward tasks, referrals, and clinical guides. This quick guide will show you around.",
        tips: [
          "Works on desktop, tablet, and mobile",
          "All data is demo data - explore freely!",
          "Find this guide again via Help in the top nav"
        ],
        visual: <HomeVisual />,
      },
      {
        title: "Navigation",
        description: "The top navigation bar gives you quick access to all main areas. Click any button to jump to that section.",
        tips: [
          "Diary - Team Diary, My Diary, and My Jobs views",
          "Links - Quick links to useful resources",
          "Guides - Referral workflows and clinical how-to guides",
          "Patients - Patient list, transfers, and discharge",
          "Search - press Ctrl+K (or the search box) to jump to any guide or link",
          "More/Help/Demo Mode - Extra tools and settings"
        ],
        visual: <NavVisual />,
      },
    ],
  },
  {
    id: "ward-diary",
    title: "Team Diary",
    icon: <CalendarDays className="w-5 h-5" />,
    color: "from-indigo-500 to-purple-500",
    slides: [
      {
        title: "Three Views in One",
        description: "The Diary page has a three-way toggle at the top: Team Diary, My Diary, and My Jobs. Team Diary shows everything for the ward. My Diary filters to your tasks. My Jobs gives you a Kanban board.",
        tips: [
          "Team Diary - all tasks for the ward, all staff",
          "My Diary - your claimed tasks plus your patients",
          "My Jobs - Kanban board (Not Started / In Progress / Done)",
          "Drag and drop tasks between days to reschedule"
        ],
        visual: <WardDiaryVisual />,
      },
      {
        title: "Task Types",
        description: "Three task types, colour-coded so you can tell them apart at a glance:",
        tips: [
          "Team Tasks (amber) - shift tasks like checks, handovers, audits",
          "Patient Tasks (purple) - tasks for individual patients (can repeat weekly/fortnightly)",
          "Appointments (blue) - scheduled meetings, tribunals, ward rounds"
        ],
        visual: <WardDiaryVisual />,
      },
    ],
  },
  {
    id: "my-tasks",
    title: "My Jobs",
    icon: <ClipboardList className="w-5 h-5" />,
    color: "from-purple-500 to-pink-500",
    slides: [
      {
        title: "Your Personal Kanban Board",
        description: "My Jobs shows only the tasks you have claimed, laid out as a Kanban board with three columns: Not Started, In Progress, and Done.",
        tips: [
          "Claim tasks from the Team Diary to add them here",
          "Drag tasks between columns to update their status",
          "Click a task to edit details, mark complete, or drop it"
        ],
        visual: <MyTasksVisual />,
      },
    ],
  },
  {
    id: "profile",
    title: "Your Profile",
    icon: <User className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-500",
    slides: [
      {
        title: "Demo Mode Menu",
        description: "Click 'Demo Mode' in the top-right to open the profile menu. Switch wards, roles, pick a specific staff member, and change the visual theme.",
        tips: [
          "Switch wards to view another ward's tasks",
          "Change demo role to see different permissions",
          "Specific User - log in as any staff member on the ward",
          "Style Theme - try iOS, Material, Windows, or Samsung looks"
        ],
        visual: <ProfileVisual />,
      },
    ],
  },
  {
    id: "referrals",
    title: "Referrals",
    icon: <FileText className="w-5 h-5" />,
    color: "from-rose-500 to-orange-500",
    slides: [
      {
        title: "Step-by-Step Workflows",
        description: "Referral workflows guide you through each step of making a referral, from criteria check to completion.",
        tips: [
          "Follow each step in order",
          "Download forms and view examples",
          "Copy case note text to clipboard",
          "Link to a patient to create a job diary task"
        ],
        visual: <ReferralsVisual />,
      },
    ],
  },
  {
    id: "settings",
    title: "Help & More",
    icon: <HelpCircle className="w-5 h-5" />,
    color: "from-slate-500 to-slate-700",
    slides: [
      {
        title: "Help & More Menus",
        description: "The top nav has a Help button and a More dropdown with extra features:",
        tips: [
          "Help - Interactive Demo, this Intro Guide, FAQ, and Feedback",
          "More - Editor (create/edit guides), Staff list, Reports, Data Sources",
          "Editor is open to everyone, but only Contributors can publish changes",
          "Safeguarding resources are on the home page - scroll down"
        ],
        visual: <SettingsVisual />,
      },
    ],
  },
];

export default function IntroGuidePage() {
  const isV2 = useIsV2();
  // In v2 we drop the diary/jobs/profile-ward sections and rewrite the
  // navigation tips so nothing mentions features that aren't there.
  const sections = isV2
    ? guideSections
        .filter((s) => s.id !== "ward-diary" && s.id !== "my-tasks")
        .map((s) => {
          if (s.id === "getting-started") {
            return {
              ...s,
              slides: s.slides.map((sl) => {
                if (sl.title === "Navigation") {
                  return {
                    ...sl,
                    description: "The top navigation bar gives you quick access to all main areas. Click any button to jump to that section.",
                    tips: [
                      "Links - Quick links to useful resources",
                      "Guides - Referral workflows and clinical how-to guides",
                      "Search - press Ctrl+K (or the search box) to jump to any guide or link",
                      "More - Staff list and Editor",
                      "Help - Interactive Demo, this Intro Guide, FAQ, and Feedback",
                    ],
                  };
                }
                if (sl.title === "Welcome to wardHub") {
                  return {
                    ...sl,
                    description: "Your reference for ward referrals, links and clinical guides. This quick guide will show you around.",
                  };
                }
                return sl;
              }),
            };
          }
          if (s.id === "referrals") {
            return {
              ...s,
              slides: s.slides.map((sl) => ({
                ...sl,
                tips: (sl.tips || []).filter((t: string) =>
                  !/job diary|patient task/i.test(t)
                ),
              })),
            };
          }
          if (s.id === "settings") {
            return {
              ...s,
              slides: s.slides.map((sl) => ({
                ...sl,
                tips: (sl.tips || []).map((t: string) =>
                  t.replace(/, Reports, Data Sources/i, "").replace(/Reports, /i, "")
                ),
              })),
            };
          }
          return s;
        })
    : guideSections;

  const [activeSection, setActiveSection] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const currentSection = sections[activeSection];
  const currentSlide = currentSection.slides[activeSlide];

  const handleNext = () => {
    if (activeSlide < currentSection.slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else if (activeSection < sections.length - 1) {
      // Mark current section as complete
      setCompletedSections(prev => new Set(prev).add(currentSection.id));
      setActiveSection(activeSection + 1);
      setActiveSlide(0);
    }
  };

  const handlePrev = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    } else if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      setActiveSlide(sections[activeSection - 1].slides.length - 1);
    }
  };

  const handleSectionClick = (index: number) => {
    setActiveSection(index);
    setActiveSlide(0);
  };

  const isFirstSlide = activeSection === 0 && activeSlide === 0;
  const isLastSlide = activeSection === sections.length - 1 && activeSlide === currentSection.slides.length - 1;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Intro Guide</h1>
              <p className="text-white/80">Learn how to use wardHub</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Your Progress</span>
            <span className="text-sm text-gray-500">
              {completedSections.size} of {sections.length} sections complete
            </span>
          </div>
          <div className="flex gap-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(index)}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index === activeSection
                    ? "bg-indigo-500"
                    : completedSections.has(section.id)
                    ? "bg-emerald-500"
                    : "bg-gray-200"
                }`}
                title={section.title}
              />
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Section list */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700 text-sm">Sections</h3>
              </div>
              <div className="p-2">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(index)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      index === activeSection
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {completedSections.has(section.id) ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        section.icon
                      )}
                    </div>
                    <span className="text-sm font-medium truncate">{section.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Slide content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Section header */}
              <div className={`bg-gradient-to-r ${currentSection.color} p-4 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                    {currentSection.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{currentSection.title}</h2>
                    <p className="text-white/80 text-sm">
                      Slide {activeSlide + 1} of {currentSection.slides.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Slide content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{currentSlide.title}</h3>
                <p className="text-gray-600 mb-4">{currentSlide.description}</p>

                {/* Visual */}
                <div className="mb-4">
                  {currentSlide.visual}
                </div>

                {/* Tips */}
                {currentSlide.tips && currentSlide.tips.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-amber-600" />
                      <span className="font-semibold text-amber-800 text-sm">Tips</span>
                    </div>
                    <ul className="space-y-1">
                      {currentSlide.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-amber-900">
                          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={isFirstSlide}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isFirstSlide
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                {/* Slide dots */}
                <div className="flex gap-1">
                  {currentSection.slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === activeSlide ? "bg-indigo-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={isLastSlide}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isLastSlide
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
                  }`}
                >
                  {isLastSlide ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick reference */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Quick Reference</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Team Diary</p>
                <p className="text-xs text-gray-500">View all team tasks by day</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">My Jobs</p>
                <p className="text-xs text-gray-500">Your claimed tasks (Kanban board)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Patients</p>
                <p className="text-xs text-gray-500">Patient list and details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bookmark className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Links</p>
                <p className="text-xs text-gray-500">Quick links to resources</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Guides</p>
                <p className="text-xs text-gray-500">Referral workflows and how-to guides</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Safeguarding</p>
                <p className="text-xs text-gray-500">Home page hub with decision helper</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
