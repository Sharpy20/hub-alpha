"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { Badge } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, BookOpen, Filter, Pencil } from "lucide-react";
import { useCanEdit } from "@/lib/hooks/useCanEdit";

const GUIDES = [
  {
    id: "news2",
    title: "NEWS2 Observations",
    description: "National Early Warning Score - recognising deterioration",
    icon: "📊",
    category: "Physical Health",
    gradient: "from-rose-500 to-rose-700",
  },
  {
    id: "blood-glucose",
    title: "Blood Glucose Monitoring",
    description: "BM testing and hypoglycaemia management",
    icon: "🩸",
    category: "Physical Health",
    gradient: "from-red-500 to-red-700",
  },
  {
    id: "mental-state-exam",
    title: "Mental State Examination",
    description: "10-point guide to MSE assessment",
    icon: "🧠",
    category: "Clinical Assessment",
    gradient: "from-purple-500 to-purple-700",
  },
  {
    id: "risk-assessment",
    title: "Risk Assessment",
    description: "Dynamic risk assessment and documentation",
    icon: "⚠️",
    category: "Clinical Assessment",
    gradient: "from-amber-500 to-amber-700",
  },
  {
    id: "seizure-management",
    title: "Managing a Seizure",
    description: "Emergency response and Buccal Midazolam administration",
    icon: "🚨",
    category: "Emergency",
    gradient: "from-red-600 to-red-800",
  },
  {
    id: "medical-emergency",
    title: "Medical Emergency",
    description: "2222 calls and emergency response",
    icon: "🏥",
    category: "Emergency",
    gradient: "from-rose-600 to-rose-800",
  },
  {
    id: "rapid-tranq",
    title: "Rapid Tranquillisation",
    description: "RT protocol and post-RT monitoring",
    icon: "💉",
    category: "Emergency",
    gradient: "from-orange-600 to-orange-800",
  },
  {
    id: "capacity-assessment",
    title: "Capacity Assessment",
    description: "Two-stage test and documentation requirements",
    icon: "⚖️",
    category: "Legal",
    gradient: "from-indigo-500 to-indigo-700",
  },
  {
    id: "dols",
    title: "DoLS Ward Guidance",
    description: "Deprivation of Liberty Safeguards - when to apply",
    icon: "🔒",
    category: "Legal",
    gradient: "from-violet-500 to-violet-700",
  },
  {
    id: "section-17",
    title: "Section 17 Leave",
    description: "Leave arrangements for detained patients",
    icon: "🚪",
    category: "Legal",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    id: "named-nurse",
    title: "Named Nurse Checklist",
    description: "Weekly and monthly tasks for named nurses",
    icon: "📋",
    category: "Ward Procedures",
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    id: "admission-checklist",
    title: "Admission Checklist",
    description: "Complete admission process step-by-step",
    icon: "✅",
    category: "Ward Procedures",
    gradient: "from-green-500 to-green-700",
  },
  {
    id: "discharge-checklist",
    title: "Discharge Checklist",
    description: "Safe discharge planning and documentation",
    icon: "🏠",
    category: "Ward Procedures",
    gradient: "from-teal-500 to-teal-700",
  },
];

// Category config with icons and colors
const CATEGORY_CONFIG: Record<string, { icon: string; gradient: string }> = {
  "all": { icon: "📖", gradient: "from-indigo-500 to-purple-600" },
  "Physical Health": { icon: "💪", gradient: "from-rose-500 to-rose-600" },
  "Clinical Assessment": { icon: "🔍", gradient: "from-purple-500 to-purple-600" },
  "Emergency": { icon: "🚨", gradient: "from-red-600 to-red-700" },
  "Legal": { icon: "⚖️", gradient: "from-indigo-500 to-indigo-600" },
  "Ward Procedures": { icon: "📋", gradient: "from-emerald-500 to-emerald-600" },
};

export default function HowToPage() {
  const { canEdit } = useCanEdit();
  const allCategories = [...new Set(GUIDES.map((g) => g.category))];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredGuides = selectedCategory === "all"
    ? GUIDES
    : GUIDES.filter((g) => g.category === selectedCategory);

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
                  <BookOpen className="w-7 h-7" />
                  How-To Guides
                </h1>
                <p className="text-white/80 mt-1">
                  Step-by-step guides for clinical procedures, assessments, and ward tasks
                </p>
              </div>
            </div>
            {canEdit && (
              <Link
                href="/admin/guides"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline"
              >
                <Pencil className="w-4 h-4" />
                Edit Guides
              </Link>
            )}
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
              <span>📖</span>
              All Guides
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

        {/* Guides list - White bordered cards like bookmarks */}
        <div className="space-y-3">
          {filteredGuides.map((guide) => {
            const categoryConfig = CATEGORY_CONFIG[guide.category] || CATEGORY_CONFIG["all"];
            return (
              <Link
                key={guide.id}
                href={`/how-to/${guide.id}`}
                className="block no-underline"
              >
                <div className="bg-white rounded-xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${guide.gradient}`}
                  >
                    <span className="text-2xl">{guide.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`bg-gradient-to-r ${categoryConfig.gradient} text-white border-0 text-xs`}>
                        {guide.category}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-lg text-gray-500">No guides found in this category.</p>
          </div>
        )}

        {/* Count */}
        <div className="text-center text-sm text-gray-500">
          Showing {filteredGuides.length} of {GUIDES.length} guides
        </div>

        {/* Coming soon notice */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-8 text-center">
          <p className="text-nhs-dark-grey text-lg">
            More guides coming soon. Contributors can add new guides via the admin panel.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
