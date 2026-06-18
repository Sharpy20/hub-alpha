"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { Badge, VerificationBadge } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, Clock, Filter, FileText, Pencil, Search } from "lucide-react";
import { useReferralLog } from "@/app/referral-log-provider";
import { useCanEdit } from "@/lib/hooks/useCanEdit";
import { useIsV2, useV2Href } from "@/lib/hooks/useV2";

interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  category: string;
  viewerPath: string;
}

// All guides in one flat list - pinned order for "All" view, reorderable via editor
const ALL_GUIDES: GuideItem[] = [
  // Pinned top 4 (most developed guides for demo)
  { id: "imha-advocacy", title: "IMHA / Advocacy", description: "Independent Mental Health Advocate for all patients (informal and detained)", icon: "\uD83D\uDDE3\uFE0F", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy", viewerPath: "/guides/imha-advocacy" },
  { id: "mh-talking-points", title: "Named Nurse Talking Points", description: "23 patient-facing mental health guides - print as leaflets for patients and families", icon: "\uD83E\uDDE0", gradient: "from-gray-800 to-gray-900", category: "Named Nurse Tools", viewerPath: "/patient-guides" },
  { id: "safeguarding", title: "Safeguarding Adults - Making a Referral", description: "S.42 referral - report concerns, Derby City or County", icon: "\uD83D\uDEE1\uFE0F", gradient: "from-red-600 to-red-800", category: "Safeguarding", viewerPath: "/guides/safeguarding" },
  { id: "safeguarding-children", title: "Safeguarding Children - Making a Referral", description: "Starting Point referral for child concerns", icon: "\uD83D\uDC76", gradient: "from-pink-500 to-pink-700", category: "Safeguarding", viewerPath: "/guides/safeguarding-children" },
  // Referrals
  { id: "picu", title: "PICU Referral", description: "Psychiatric Intensive Care Unit transfers", icon: "\uD83C\uDFE5", gradient: "from-rose-500 to-rose-700", category: "Urgent Care", viewerPath: "/guides/picu" },
  { id: "homeless-discharge", title: "Housing / Duty to Refer", description: "Homeless discharge and accommodation support", icon: "\uD83C\uDFE0", gradient: "from-orange-500 to-orange-700", category: "Social & Housing", viewerPath: "/guides/homeless-discharge" },
  { id: "social-care", title: "Social Care (Derby City)", description: "Care Act assessment, S117 referrals & Enablement", icon: "\uD83D\uDC65", gradient: "from-amber-500 to-amber-700", category: "Social & Housing", viewerPath: "/guides/social-care" },
  { id: "s117-meeting", title: "S117 Meeting Request", description: "Request Social Care attendance at S117 discharge meeting", icon: "\u2696\uFE0F", gradient: "from-purple-600 to-purple-800", category: "Legal & Advocacy", viewerPath: "/guides/s117-meeting" },
  { id: "dietitian", title: "Dietitian Referral", description: "Nutritional assessment and support", icon: "\uD83E\uDD57", gradient: "from-green-500 to-green-700", category: "Allied Health", viewerPath: "/guides/dietitian" },
  { id: "tissue-viability", title: "Tissue Viability", description: "Wound care and pressure ulcer concerns", icon: "\uD83E\uDE79", gradient: "from-teal-500 to-teal-700", category: "Physical Health", viewerPath: "/guides/tissue-viability" },
  { id: "dental", title: "Dental Referral", description: "Dental care access for inpatients", icon: "\uD83E\uDDB7", gradient: "from-cyan-500 to-cyan-700", category: "Physical Health", viewerPath: "/guides/dental" },
  { id: "physio", title: "Physiotherapy", description: "Physical therapy and mobility assessment", icon: "\uD83C\uDFC3", gradient: "from-emerald-500 to-emerald-700", category: "Allied Health", viewerPath: "/guides/physio" },
  { id: "ot", title: "Occupational Therapy", description: "OT assessment and functional review", icon: "\uD83E\uDDE9", gradient: "from-violet-500 to-violet-700", category: "Allied Health", viewerPath: "/guides/ot" },
  { id: "speech-therapy", title: "Speech & Language", description: "SALT assessment and swallowing review", icon: "\uD83D\uDCAC", gradient: "from-purple-500 to-purple-700", category: "Allied Health", viewerPath: "/guides/speech-therapy" },
  { id: "edt", title: "Early Discharge Team", description: "EDT referral for discharge planning support", icon: "\uD83D\uDEAA", gradient: "from-sky-500 to-sky-700", category: "Discharge Planning", viewerPath: "/guides/edt" },
  { id: "erp", title: "Emotional Regulation (ERP/DBT)", description: "DBT skills and emotional regulation pathway", icon: "\uD83E\uDDE0", gradient: "from-fuchsia-500 to-fuchsia-700", category: "Psychology", viewerPath: "/guides/erp" },
  { id: "ctr-dsp", title: "CTR / DSP Review", description: "Care Treatment Review for ASD/LD patients (mandatory)", icon: "\uD83D\uDCCB", gradient: "from-lime-600 to-lime-800", category: "Specialist Pathways", viewerPath: "/guides/ctr-dsp" },
  { id: "benefits-review", title: "Benefits Review", description: "DWP benefits review and welfare rights support", icon: "\uD83D\uDCB7", gradient: "from-yellow-600 to-yellow-800", category: "Social & Housing", viewerPath: "/guides/benefits-review" },
  // Clinical assessments
  { id: "news2", title: "NEWS2 Observations", description: "National Early Warning Score - recognising deterioration", icon: "\uD83D\uDCCA", gradient: "from-rose-500 to-rose-700", category: "Physical Health", viewerPath: "/guides/news2" },
  { id: "blood-glucose", title: "Blood Glucose Monitoring", description: "BM testing and hypoglycaemia management", icon: "\uD83E\uDE78", gradient: "from-red-500 to-red-700", category: "Physical Health", viewerPath: "/guides/blood-glucose" },
  { id: "mental-state-exam", title: "Mental State Examination", description: "10-point guide to MSE assessment", icon: "\uD83E\uDDE0", gradient: "from-purple-500 to-purple-700", category: "Clinical Assessment", viewerPath: "/guides/mental-state-exam" },
  { id: "risk-assessment", title: "Risk Assessment", description: "Dynamic risk assessment and documentation", icon: "\u26A0\uFE0F", gradient: "from-amber-500 to-amber-700", category: "Clinical Assessment", viewerPath: "/guides/risk-assessment" },
  { id: "abc-chart", title: "ABC Charts", description: "Recording and analysing challenging behaviour - antecedent, behaviour, consequence", icon: "\uD83D\uDCCB", gradient: "from-amber-500 to-orange-700", category: "Clinical Assessment", viewerPath: "/guides/abc-chart" },
  { id: "capacity-assessment", title: "Capacity Assessment", description: "Two-stage test and documentation requirements", icon: "\u2696\uFE0F", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy", viewerPath: "/guides/capacity-assessment" },
  { id: "dols", title: "DoLS Ward Guidance", description: "Deprivation of Liberty Safeguards - when to apply", icon: "\uD83D\uDD12", gradient: "from-violet-500 to-violet-700", category: "Legal & Advocacy", viewerPath: "/guides/dols" },
  { id: "mha-statuses", title: "MHA Statuses Explained", description: "All Mental Health Act sections and patient rights", icon: "\u2696\uFE0F", gradient: "from-indigo-600 to-purple-800", category: "Legal & Advocacy", viewerPath: "/guides/mha-statuses" },
  { id: "section-17", title: "Section 17 Leave", description: "Leave arrangements for detained patients", icon: "\uD83D\uDEAA", gradient: "from-blue-500 to-blue-700", category: "Legal & Advocacy", viewerPath: "/guides/section-17" },
  { id: "mha-checker", title: "Section Papers - Receipt & Scrutiny", description: "Interactive checker - which MHA forms you need and how to scrutinise them", icon: "\u2696\uFE0F", gradient: "from-indigo-600 to-purple-700", category: "Legal & Advocacy", viewerPath: "/guides/mha-checker" },
  // Safeguarding (educational)
  { id: "domestic-abuse-guide", title: "Domestic Abuse", description: "Recognising and responding to domestic abuse", icon: "\uD83C\uDFE0", gradient: "from-purple-600 to-purple-800", category: "Safeguarding", viewerPath: "/guides/domestic-abuse-guide" },
  { id: "peer-conflict-guide", title: "Peer-on-Peer Conflict", description: "When to escalate patient conflict to safeguarding", icon: "\u26A0\uFE0F", gradient: "from-amber-600 to-amber-800", category: "Safeguarding", viewerPath: "/guides/peer-conflict-guide" },
  { id: "information-sharing", title: "Information Sharing", description: "Seven golden rules and GDPR guidance for safeguarding", icon: "\uD83D\uDD17", gradient: "from-blue-600 to-blue-800", category: "Safeguarding", viewerPath: "/guides/information-sharing" },
  { id: "escalation-pathway", title: "Escalation Pathway (Children)", description: "Bronze, Silver and Gold levels for complex YP cases", icon: "\uD83D\uDCC8", gradient: "from-orange-600 to-orange-800", category: "Safeguarding", viewerPath: "/guides/escalation-pathway" },
  { id: "online-safety-children", title: "Online Safety and Children", description: "Nudes, cyberbullying, sextortion and screen time", icon: "\uD83C\uDF10", gradient: "from-cyan-600 to-cyan-800", category: "Safeguarding", viewerPath: "/guides/online-safety-children" },
  { id: "honour-based-abuse", title: "HBA, FGM and Forced Marriage", description: "Honour-based abuse, female genital mutilation and forced marriage", icon: "\uD83D\uDEE1\uFE0F", gradient: "from-rose-700 to-rose-900", category: "Safeguarding", viewerPath: "/guides/honour-based-abuse" },
  { id: "modern-slavery-radicalisation", title: "Modern Slavery and Radicalisation", description: "Spotting the signs and making Prevent referrals", icon: "\u26D3\uFE0F", gradient: "from-gray-600 to-gray-800", category: "Safeguarding", viewerPath: "/guides/modern-slavery-radicalisation" },
  { id: "faith-belief-abuse", title: "Abuse Linked to Faith or Belief", description: "Recognising abuse linked to spirit possession, witchcraft or cultural practices", icon: "\uD83D\uDE4F", gradient: "from-violet-600 to-violet-800", category: "Safeguarding", viewerPath: "/guides/faith-belief-abuse" },
  { id: "send-safeguarding", title: "SEND and Safeguarding", description: "Safeguarding children with special educational needs and disabilities", icon: "\uD83D\uDCDA", gradient: "from-teal-600 to-teal-800", category: "Safeguarding", viewerPath: "/guides/send-safeguarding" },
  { id: "non-recent-abuse", title: "Non-Recent Abuse Disclosures", description: "Responding when adults disclose childhood abuse", icon: "\uD83D\uDD70\uFE0F", gradient: "from-slate-600 to-slate-800", category: "Safeguarding", viewerPath: "/guides/non-recent-abuse" },
  { id: "special-guardianship", title: "Special Guardianship Orders", description: "Permanence through SGOs - best practice guidance", icon: "\uD83D\uDC68\u200D\uD83D\uDC67", gradient: "from-emerald-600 to-emerald-800", category: "Safeguarding", viewerPath: "/guides/special-guardianship" },
  { id: "child-in-need", title: "Child in Need", description: "Multi-agency CIN arrangements and best practice", icon: "\uD83E\uDD32", gradient: "from-sky-600 to-sky-800", category: "Safeguarding", viewerPath: "/guides/child-in-need" },
  // Tasks & procedures
  { id: "fridge-temps", title: "Fridge Temperature Recording", description: "Medication fridge monitoring and Assurance Dashboard recording", icon: "\uD83C\uDF21\uFE0F", gradient: "from-cyan-500 to-cyan-700", category: "Ward Procedures", viewerPath: "/guides/fridge-temps" },
  { id: "named-nurse", title: "Named Nurse Checklist", description: "Weekly and monthly tasks for named nurses", icon: "\uD83D\uDCCB", gradient: "from-emerald-500 to-emerald-700", category: "Ward Procedures", viewerPath: "/guides/named-nurse" },
  { id: "admission-checklist", title: "Admission Checklist", description: "Interactive tick-list of every admission task, with help links", icon: "\u2705", gradient: "from-green-500 to-green-700", category: "Ward Procedures", viewerPath: "/guides/admission-checklist" },
  { id: "discharge-checklist", title: "Discharge Checklist", description: "Safe discharge planning and documentation", icon: "\uD83C\uDFE0", gradient: "from-teal-500 to-teal-700", category: "Ward Procedures", viewerPath: "/guides/discharge-checklist" },
];

export default function GuidesPage() {
  const { canEdit } = useCanEdit();
  const { getPendingCount } = useReferralLog();
  const isV2 = useIsV2();
  const link = useV2Href();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customOrder, setCustomOrder] = useState<{ id: string; category: string }[] | null>(null);
  const pendingCount = getPendingCount();

  // Load custom order from localStorage (set via editor)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wardhub_guide_order");
      if (saved) setCustomOrder(JSON.parse(saved));
    } catch { /* use default */ }
  }, []);

  // Apply custom order if available
  const orderedGuides = customOrder
    ? customOrder
        .map(co => {
          const guide = ALL_GUIDES.find(g => g.id === co.id);
          return guide ? { ...guide, category: co.category } : null;
        })
        .filter((g): g is GuideItem => g !== null)
        // Append any new guides not in the saved order
        .concat(ALL_GUIDES.filter(g => !customOrder.some(co => co.id === g.id)))
    : ALL_GUIDES;

  // Get all categories
  const allCategories = [...new Set(orderedGuides.map((g) => g.category))];

  // Filter by category
  const categoryFiltered = selectedCategory === "all"
    ? orderedGuides
    : orderedGuides.filter((g) => g.category === selectedCategory);

  // Filter by search
  const filteredGuides = searchQuery.trim()
    ? categoryFiltered.filter((g) => {
        const q = searchQuery.toLowerCase();
        return g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
      })
    : categoryFiltered;

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
              {!isV2 && (
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
              )}
              {canEdit && (
                <Link
                  href={link("/admin/workflows")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              )}
            </div>
          </div>
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
        {allCategories.length > 1 && (
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
              {allCategories.map((category) => (
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
              key={guide.id}
              href={link(guide.viewerPath)}
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
                    <VerificationBadge
                      contentType="guide"
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
