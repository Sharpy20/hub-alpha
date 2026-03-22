"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { Badge, VerificationBadge } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, Clock, Filter, FileText, Pencil, Search } from "lucide-react";
import { useReferralLog } from "@/app/referral-log-provider";
import { useCanEdit } from "@/lib/hooks/useCanEdit";

// Guide types for tab filtering
type GuideType = "all" | "referrals" | "assessments" | "tasks";

interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  category: string;
  guideType: GuideType;
  viewerPath: string; // /referrals/[id] or /how-to/[id]
}

// Referral guides (from referrals page)
const REFERRAL_GUIDES: GuideItem[] = [
  { id: "imha-advocacy", title: "IMHA / Advocacy", description: "Independent Mental Health Advocate for detained patients", icon: "\uD83D\uDDE3\uFE0F", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy", guideType: "referrals", viewerPath: "/referrals/imha-advocacy" },
  { id: "picu", title: "PICU Referral", description: "Psychiatric Intensive Care Unit transfers", icon: "\uD83C\uDFE5", gradient: "from-rose-500 to-rose-700", category: "Urgent Care", guideType: "referrals", viewerPath: "/referrals/picu" },
  { id: "safeguarding", title: "Safeguarding Adults", description: "Report safeguarding concerns - Derby City or County", icon: "\uD83D\uDEE1\uFE0F", gradient: "from-red-600 to-red-800", category: "Safeguarding", guideType: "referrals", viewerPath: "/referrals/safeguarding" },
  { id: "safeguarding-children", title: "Safeguarding Children", description: "Starting Point referrals for child concerns", icon: "\uD83D\uDC76", gradient: "from-pink-500 to-pink-700", category: "Safeguarding", guideType: "referrals", viewerPath: "/referrals/safeguarding-children" },
  { id: "homeless-discharge", title: "Housing / Duty to Refer", description: "Homeless discharge and accommodation support", icon: "\uD83C\uDFE0", gradient: "from-orange-500 to-orange-700", category: "Social & Housing", guideType: "referrals", viewerPath: "/referrals/homeless-discharge" },
  { id: "social-care", title: "Social Care (Derby City)", description: "Care Act assessment, S117 referrals & Enablement", icon: "\uD83D\uDC65", gradient: "from-amber-500 to-amber-700", category: "Social & Housing", guideType: "referrals", viewerPath: "/referrals/social-care" },
  { id: "s117-meeting", title: "S117 Meeting Request", description: "Request Social Care attendance at S117 discharge meeting", icon: "\u2696\uFE0F", gradient: "from-purple-600 to-purple-800", category: "Legal & Advocacy", guideType: "referrals", viewerPath: "/referrals/s117-meeting" },
  { id: "dietitian", title: "Dietitian Referral", description: "Nutritional assessment and support", icon: "\uD83E\uDD57", gradient: "from-green-500 to-green-700", category: "Allied Health", guideType: "referrals", viewerPath: "/referrals/dietitian" },
  { id: "tissue-viability", title: "Tissue Viability", description: "Wound care and pressure ulcer concerns", icon: "\uD83E\uDE79", gradient: "from-teal-500 to-teal-700", category: "Physical Health", guideType: "referrals", viewerPath: "/referrals/tissue-viability" },
  { id: "dental", title: "Dental Referral", description: "Dental care access for inpatients", icon: "\uD83E\uDDB7", gradient: "from-cyan-500 to-cyan-700", category: "Physical Health", guideType: "referrals", viewerPath: "/referrals/dental" },
  { id: "physio", title: "Physiotherapy", description: "Physical therapy and mobility assessment", icon: "\uD83C\uDFC3", gradient: "from-emerald-500 to-emerald-700", category: "Allied Health", guideType: "referrals", viewerPath: "/referrals/physio" },
  { id: "ot", title: "Occupational Therapy", description: "OT assessment and functional review", icon: "\uD83E\uDDE9", gradient: "from-violet-500 to-violet-700", category: "Allied Health", guideType: "referrals", viewerPath: "/referrals/ot" },
  { id: "speech-therapy", title: "Speech & Language", description: "SALT assessment and swallowing review", icon: "\uD83D\uDCAC", gradient: "from-purple-500 to-purple-700", category: "Allied Health", guideType: "referrals", viewerPath: "/referrals/speech-therapy" },
  { id: "edt", title: "Early Discharge Team", description: "EDT referral for discharge planning support", icon: "\uD83D\uDEAA", gradient: "from-sky-500 to-sky-700", category: "Discharge Planning", guideType: "referrals", viewerPath: "/referrals/edt" },
  { id: "erp", title: "Emotional Regulation (ERP/DBT)", description: "DBT skills and emotional regulation pathway", icon: "\uD83E\uDDE0", gradient: "from-fuchsia-500 to-fuchsia-700", category: "Psychology", guideType: "referrals", viewerPath: "/referrals/erp" },
  { id: "ctr-dsp", title: "CTR / DSP Review", description: "Care Treatment Review for ASD/LD patients (mandatory)", icon: "\uD83D\uDCCB", gradient: "from-lime-600 to-lime-800", category: "Specialist Pathways", guideType: "referrals", viewerPath: "/referrals/ctr-dsp" },
  { id: "benefits-review", title: "Benefits Review", description: "DWP benefits review and welfare rights support", icon: "\uD83D\uDCB7", gradient: "from-yellow-600 to-yellow-800", category: "Social & Housing", guideType: "referrals", viewerPath: "/referrals/benefits-review" },
];

// Assessment & clinical guides (from how-to page)
const ASSESSMENT_GUIDES: GuideItem[] = [
  { id: "news2", title: "NEWS2 Observations", description: "National Early Warning Score - recognising deterioration", icon: "\uD83D\uDCCA", gradient: "from-rose-500 to-rose-700", category: "Physical Health", guideType: "assessments", viewerPath: "/how-to/news2" },
  { id: "blood-glucose", title: "Blood Glucose Monitoring", description: "BM testing and hypoglycaemia management", icon: "\uD83E\uDE78", gradient: "from-red-500 to-red-700", category: "Physical Health", guideType: "assessments", viewerPath: "/how-to/blood-glucose" },
  { id: "mental-state-exam", title: "Mental State Examination", description: "10-point guide to MSE assessment", icon: "\uD83E\uDDE0", gradient: "from-purple-500 to-purple-700", category: "Clinical Assessment", guideType: "assessments", viewerPath: "/how-to/mental-state-exam" },
  { id: "risk-assessment", title: "Risk Assessment", description: "Dynamic risk assessment and documentation", icon: "\u26A0\uFE0F", gradient: "from-amber-500 to-amber-700", category: "Clinical Assessment", guideType: "assessments", viewerPath: "/how-to/risk-assessment" },
  { id: "capacity-assessment", title: "Capacity Assessment", description: "Two-stage test and documentation requirements", icon: "\u2696\uFE0F", gradient: "from-indigo-500 to-indigo-700", category: "Legal", guideType: "assessments", viewerPath: "/how-to/capacity-assessment" },
  { id: "dols", title: "DoLS Ward Guidance", description: "Deprivation of Liberty Safeguards - when to apply", icon: "\uD83D\uDD12", gradient: "from-violet-500 to-violet-700", category: "Legal", guideType: "assessments", viewerPath: "/how-to/dols" },
  { id: "section-17", title: "Section 17 Leave", description: "Leave arrangements for detained patients", icon: "\uD83D\uDEAA", gradient: "from-blue-500 to-blue-700", category: "Legal", guideType: "assessments", viewerPath: "/how-to/section-17" },
];

// Task/procedure guides (from how-to page)
const TASK_GUIDES: GuideItem[] = [
  { id: "fridge-temps", title: "Fridge Temperature Recording", description: "Medication fridge monitoring and Assurance Dashboard recording", icon: "\uD83C\uDF21\uFE0F", gradient: "from-cyan-500 to-cyan-700", category: "Ward Procedures", guideType: "tasks", viewerPath: "/how-to/fridge-temps" },
  { id: "seizure-management", title: "Managing a Seizure", description: "Emergency response and Buccal Midazolam administration", icon: "\uD83D\uDEA8", gradient: "from-red-600 to-red-800", category: "Emergency", guideType: "tasks", viewerPath: "/how-to/seizure-management" },
  { id: "medical-emergency", title: "Medical Emergency", description: "2222 calls and emergency response", icon: "\uD83C\uDFE5", gradient: "from-rose-600 to-rose-800", category: "Emergency", guideType: "tasks", viewerPath: "/how-to/medical-emergency" },
  { id: "rapid-tranq", title: "Rapid Tranquillisation", description: "RT protocol and post-RT monitoring", icon: "\uD83D\uDC89", gradient: "from-orange-600 to-orange-800", category: "Emergency", guideType: "tasks", viewerPath: "/how-to/rapid-tranq" },
  { id: "named-nurse", title: "Named Nurse Checklist", description: "Weekly and monthly tasks for named nurses", icon: "\uD83D\uDCCB", gradient: "from-emerald-500 to-emerald-700", category: "Ward Procedures", guideType: "tasks", viewerPath: "/how-to/named-nurse" },
  { id: "admission-checklist", title: "Admission Checklist", description: "Complete admission process step-by-step", icon: "\u2705", gradient: "from-green-500 to-green-700", category: "Ward Procedures", guideType: "tasks", viewerPath: "/how-to/admission-checklist" },
  { id: "discharge-checklist", title: "Discharge Checklist", description: "Safe discharge planning and documentation", icon: "\uD83C\uDFE0", gradient: "from-teal-500 to-teal-700", category: "Ward Procedures", guideType: "tasks", viewerPath: "/how-to/discharge-checklist" },
];

const ALL_GUIDES = [...REFERRAL_GUIDES, ...ASSESSMENT_GUIDES, ...TASK_GUIDES];

const TAB_CONFIG: { key: GuideType; label: string; icon: string; count: number }[] = [
  { key: "all", label: "All", icon: "\uD83D\uDCDA", count: ALL_GUIDES.length },
  { key: "referrals", label: "Referrals", icon: "\uD83D\uDCCB", count: REFERRAL_GUIDES.length },
  { key: "assessments", label: "Assessments", icon: "\uD83D\uDD0D", count: ASSESSMENT_GUIDES.length },
  { key: "tasks", label: "Tasks", icon: "\u2705", count: TASK_GUIDES.length },
];

export default function GuidesPage() {
  const { canEdit } = useCanEdit();
  const { getPendingCount } = useReferralLog();
  const [activeTab, setActiveTab] = useState<GuideType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const pendingCount = getPendingCount();

  // Filter by tab
  const tabFiltered = activeTab === "all"
    ? ALL_GUIDES
    : ALL_GUIDES.filter((g) => g.guideType === activeTab);

  // Get categories for current tab
  const tabCategories = [...new Set(tabFiltered.map((g) => g.category))];

  // Filter by category
  const categoryFiltered = selectedCategory === "all"
    ? tabFiltered
    : tabFiltered.filter((g) => g.category === selectedCategory);

  // Filter by search
  const filteredGuides = searchQuery.trim()
    ? categoryFiltered.filter((g) => {
        const q = searchQuery.toLowerCase();
        return g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
      })
    : categoryFiltered;

  // Reset category when tab changes
  const handleTabChange = (tab: GuideType) => {
    setActiveTab(tab);
    setSelectedCategory("all");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Guides</h1>
                <p className="text-white/80 mt-1">
                  Referrals, assessments and step-by-step ward procedures
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/referrals/log"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline"
              >
                <Clock className="w-4 h-4" />
                Chase Log
                {pendingCount > 0 && (
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
              {canEdit && (
                <Link
                  href="/admin/workflows"
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/20" : "bg-gray-200"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Category filter */}
        {tabCategories.length > 1 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-bold text-gray-700">Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  selectedCategory === "all"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {tabCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guides list */}
        <div className="space-y-3">
          {filteredGuides.map((guide) => (
            <Link
              key={`${guide.guideType}-${guide.id}`}
              href={guide.viewerPath}
              className="block no-underline"
            >
              <div className="bg-white rounded-xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${guide.gradient}`}>
                  <span className="text-2xl">{guide.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                    {guide.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                      {guide.category}
                    </Badge>
                    <Badge className={`text-xs border-0 ${
                      guide.guideType === "referrals" ? "bg-rose-100 text-rose-700" :
                      guide.guideType === "assessments" ? "bg-purple-100 text-purple-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {guide.guideType === "referrals" ? "Referral" : guide.guideType === "assessments" ? "Assessment" : "Task"}
                    </Badge>
                    <VerificationBadge
                      contentType={guide.guideType === "referrals" ? "workflow" : "guide"}
                      contentId={guide.id}
                      contentTitle={guide.title}
                    />
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <span className="text-6xl mb-4 block">{searchQuery ? "\uD83D\uDD0D" : "\uD83D\uDCDA"}</span>
            <p className="text-lg text-gray-500">
              {searchQuery ? "No guides match your search." : "No guides in this category."}
            </p>
          </div>
        )}

        {/* Count */}
        <div className="text-center text-sm text-gray-500">
          {filteredGuides.length} of {ALL_GUIDES.length} guides
        </div>
      </div>
    </MainLayout>
  );
}
