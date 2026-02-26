"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { Badge, VerificationBadge } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, ClipboardList, Clock, Filter, Pencil } from "lucide-react";
import { useReferralLog } from "@/app/referral-log-provider";
import { useApp } from "@/app/providers";
import { useCanEdit } from "@/lib/hooks/useCanEdit";

const REFERRALS = [
  {
    id: "imha-advocacy",
    title: "IMHA / Advocacy",
    description: "Independent Mental Health Advocate for detained patients",
    icon: "🗣️",
    gradient: "from-indigo-500 to-indigo-700",
    category: "Legal & Advocacy",
  },
  {
    id: "picu",
    title: "PICU Referral",
    description: "Psychiatric Intensive Care Unit transfers",
    icon: "🏥",
    gradient: "from-rose-500 to-rose-700",
    category: "Urgent Care",
  },
  {
    id: "safeguarding",
    title: "Safeguarding Adults",
    description: "Report safeguarding concerns - Derby City or County",
    icon: "🛡️",
    gradient: "from-red-600 to-red-800",
    category: "Safeguarding",
  },
  {
    id: "safeguarding-children",
    title: "Safeguarding Children",
    description: "Starting Point referrals for child concerns",
    icon: "👶",
    gradient: "from-pink-500 to-pink-700",
    category: "Safeguarding",
  },
  {
    id: "homeless-discharge",
    title: "Housing / Duty to Refer",
    description: "Homeless discharge and accommodation support",
    icon: "🏠",
    gradient: "from-orange-500 to-orange-700",
    category: "Social & Housing",
  },
  {
    id: "social-care",
    title: "Social Care (Derby City)",
    description: "Care Act assessment, S117 referrals & Enablement — Derby City MH Social Care",
    icon: "👥",
    gradient: "from-amber-500 to-amber-700",
    category: "Social & Housing",
  },
  {
    id: "s117-meeting",
    title: "S117 Meeting Request",
    description: "Request Social Care attendance at S117 discharge meeting (7 days notice)",
    icon: "⚖️",
    gradient: "from-purple-600 to-purple-800",
    category: "Legal & Advocacy",
  },
  {
    id: "dietitian",
    title: "Dietitian Referral",
    description: "Nutritional assessment and support",
    icon: "🥗",
    gradient: "from-green-500 to-green-700",
    category: "Allied Health",
  },
  {
    id: "tissue-viability",
    title: "Tissue Viability",
    description: "Wound care and pressure ulcer concerns",
    icon: "🩹",
    gradient: "from-teal-500 to-teal-700",
    category: "Physical Health",
  },
  {
    id: "dental",
    title: "Dental Referral",
    description: "Dental care access for inpatients",
    icon: "🦷",
    gradient: "from-cyan-500 to-cyan-700",
    category: "Physical Health",
  },
  {
    id: "physio",
    title: "Physiotherapy",
    description: "Physical therapy and mobility assessment",
    icon: "🏃",
    gradient: "from-emerald-500 to-emerald-700",
    category: "Allied Health",
  },
  {
    id: "ot",
    title: "Occupational Therapy",
    description: "OT assessment and functional review",
    icon: "🧩",
    gradient: "from-violet-500 to-violet-700",
    category: "Allied Health",
  },
  {
    id: "speech-therapy",
    title: "Speech & Language",
    description: "SALT assessment and swallowing review",
    icon: "💬",
    gradient: "from-purple-500 to-purple-700",
    category: "Allied Health",
  },
  {
    id: "edt",
    title: "Early Discharge Team",
    description: "EDT referral for discharge planning support",
    icon: "🚪",
    gradient: "from-sky-500 to-sky-700",
    category: "Discharge Planning",
  },
  {
    id: "erp",
    title: "Emotional Regulation (ERP/DBT)",
    description: "DBT skills and emotional regulation pathway",
    icon: "🧠",
    gradient: "from-fuchsia-500 to-fuchsia-700",
    category: "Psychology",
  },
  {
    id: "ctr-dsp",
    title: "CTR / DSP Review",
    description: "Care Treatment Review for ASD/LD patients (mandatory)",
    icon: "📋",
    gradient: "from-lime-600 to-lime-800",
    category: "Specialist Pathways",
  },
  {
    id: "benefits-review",
    title: "Benefits Review",
    description: "DWP benefits review and welfare rights support",
    icon: "💷",
    gradient: "from-yellow-600 to-yellow-800",
    category: "Social & Housing",
  },
];

// Category config with icons and colors
const CATEGORY_CONFIG: Record<string, { gradient: string; icon: string }> = {
  "all": { gradient: "from-indigo-500 to-purple-600", icon: "📋" },
  "Safeguarding": { gradient: "from-red-500 to-red-700", icon: "🛡️" },
  "Urgent Care": { gradient: "from-rose-500 to-rose-700", icon: "🚨" },
  "Legal & Advocacy": { gradient: "from-indigo-500 to-indigo-700", icon: "⚖️" },
  "Social & Housing": { gradient: "from-orange-500 to-orange-700", icon: "🏠" },
  "Allied Health": { gradient: "from-emerald-500 to-emerald-700", icon: "🩺" },
  "Physical Health": { gradient: "from-teal-500 to-teal-700", icon: "💪" },
  "Discharge Planning": { gradient: "from-sky-500 to-sky-700", icon: "🚪" },
  "Psychology": { gradient: "from-fuchsia-500 to-fuchsia-700", icon: "🧠" },
  "Specialist Pathways": { gradient: "from-lime-600 to-lime-800", icon: "📋" },
};

export default function ReferralsPage() {
  const { canEdit } = useCanEdit();
  const { getPendingCount } = useReferralLog();
  const allCategories = [...new Set(REFERRALS.map((r) => r.category))];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const pendingCount = getPendingCount();

  const filteredReferrals = selectedCategory === "all"
    ? REFERRALS
    : REFERRALS.filter((r) => r.category === selectedCategory);

  const currentConfig = CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG["all"];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentConfig.gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-4xl">{currentConfig.icon}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <ClipboardList className="w-7 h-7" />
                  Referral Hub
                </h1>
                <p className="text-white/80 mt-1">
                  Step-by-step workflows for common referrals
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
                  Edit Workflows
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-bold text-gray-700">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>📋</span>
              All Referrals
            </button>
            {allCategories.map((category) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["all"];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === category
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{config.icon}</span>
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Referrals list - White bordered cards like bookmarks */}
        <div className="space-y-3">
          {filteredReferrals.map((referral) => {
            const categoryConfig = CATEGORY_CONFIG[referral.category] || CATEGORY_CONFIG["all"];
            return (
              <Link
                key={referral.id}
                href={`/referrals/${referral.id}`}
                className="block no-underline"
              >
                <div className="bg-white rounded-xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${referral.gradient}`}
                  >
                    <span className="text-2xl">{referral.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {referral.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                      {referral.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={`bg-gradient-to-r ${categoryConfig.gradient} text-white border-0 text-xs`}>
                        {referral.category}
                      </Badge>
                      <VerificationBadge
                        contentType="workflow"
                        contentId={referral.id}
                        contentTitle={referral.title}
                      />
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredReferrals.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-lg text-gray-500">No referrals found in this category.</p>
          </div>
        )}

        {/* Count */}
        <div className="text-center text-sm text-gray-500">
          Showing {filteredReferrals.length} of {REFERRALS.length} referrals
        </div>

        {/* Info box */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-8">
          <h2 className="text-xl font-bold text-nhs-black mb-3">📋 About Workflows</h2>
          <p className="text-nhs-dark-grey text-base leading-relaxed">
            Each workflow guides you through: confirming criteria, downloading forms,
            viewing examples (WAGOLL), finding related guides, submitting the referral,
            and copying case note text. At the end, you&apos;ll get reminders about the job
            diary and GDPR.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
