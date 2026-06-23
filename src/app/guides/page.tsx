"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { Badge, StatusBadge } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, Clock, Filter, FileText, Pencil, Search } from "lucide-react";
import { guideApproval } from "@/lib/data/approval-status";
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

// All guides grouped by category - this order drives the page (when no custom
// editor order is saved). Categories render in first-seen order.
const ALL_GUIDES: GuideItem[] = [
  // Legal & Advocacy
  { id: "mha-statuses", title: "MHA Statuses Explained", description: "All Mental Health Act sections and patient rights", icon: "\u2696\uFE0F", gradient: "from-indigo-600 to-purple-800", category: "Legal & Advocacy", viewerPath: "/guides/mha-statuses" },
  { id: "mha-checker", title: "Section Papers - Receipt & Scrutiny", description: "Interactive checker - which MHA forms you need and how to scrutinise them", icon: "\u2696\uFE0F", gradient: "from-indigo-600 to-purple-700", category: "Legal & Advocacy", viewerPath: "/guides/mha-checker" },
  { id: "imha-advocacy", title: "IMHA / Advocacy", description: "Independent Mental Health Advocate for all patients (informal and detained)", icon: "\ud83d\uDDE3\uFE0F", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy", viewerPath: "/guides/imha-advocacy" },
  { id: "s117-meeting", title: "S117 Meeting Request", description: "Request Social Care attendance at S117 discharge meeting", icon: "\u2696\uFE0F", gradient: "from-purple-600 to-purple-800", category: "Legal & Advocacy", viewerPath: "/guides/s117-meeting" },
  { id: "capacity-assessment", title: "Capacity Assessment", description: "Two-stage test and documentation requirements", icon: "\u2696\uFE0F", gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy", viewerPath: "/guides/capacity-assessment" },
  { id: "dols", title: "DoLS Ward Guidance", description: "Deprivation of Liberty Safeguards - when to apply", icon: "\ud83d\uDD12", gradient: "from-violet-500 to-violet-700", category: "Legal & Advocacy", viewerPath: "/guides/dols" },
  { id: "section-17", title: "Section 17 Leave", description: "Leave arrangements for detained patients", icon: "\ud83d\uDEAA", gradient: "from-blue-500 to-blue-700", category: "Legal & Advocacy", viewerPath: "/guides/section-17" },
  // Nurse Tools
  { id: "mh-talking-points", title: "Named Nurse Talking Points", description: "23 patient-facing mental health guides - print as leaflets for patients and families", icon: "\uD83E\uDDE0", gradient: "from-gray-800 to-gray-900", category: "Nurse Tools", viewerPath: "/patient-guides" },
  { id: "mental-state-exam", title: "Mental State Examination", description: "Interactive MSE builder - pick words per domain, copy to notes", icon: "\uD83E\uDDE0", gradient: "from-purple-500 to-purple-700", category: "Nurse Tools", viewerPath: "/guides/mental-state-exam" },
  { id: "risk-assessment", title: "Risk Formulation & Management Plan", description: "Interactive builder - write a personalised formulation and RMP for SystemOne", icon: "\u26A0\uFE0F", gradient: "from-rose-500 to-red-700", category: "Nurse Tools", viewerPath: "/guides/risk-assessment" },
  { id: "abc-chart", title: "ABC Charts", description: "Recording and analysing challenging behaviour - antecedent, behaviour, consequence", icon: "\ud83d\uDCCB", gradient: "from-amber-500 to-orange-700", category: "Nurse Tools", viewerPath: "/guides/abc-chart" },
  { id: "care-plan", title: "My Care Plan", description: "Interactive builder - write a personalised, patient-voice care plan for SystemOne", icon: "\ud83d\udcdd", gradient: "from-sky-500 to-blue-700", category: "Nurse Tools", viewerPath: "/guides/care-plan" },
  { id: "safety-plan", title: "Safety Plan", description: "Think-it-through guide for a collaborative, patient-voice safety plan", icon: "\ud83d\udedf", gradient: "from-emerald-500 to-green-700", category: "Nurse Tools", viewerPath: "/guides/safety-plan" },
  { id: "named-nurse", title: "Named Nurse Checklist", description: "Weekly and monthly tasks for named nurses", icon: "\ud83d\uDCCB", gradient: "from-emerald-500 to-emerald-700", category: "Nurse Tools", viewerPath: "/guides/named-nurse" },
  { id: "admission-checklist", title: "Admission Checklist", description: "Interactive tick-list of every admission task, with help links", icon: "\u2705", gradient: "from-green-500 to-green-700", category: "Nurse Tools", viewerPath: "/guides/admission-checklist" },
  { id: "discharge-checklist", title: "Discharge Checklist", description: "Safe discharge planning and documentation", icon: "\uD83C\uDFE0", gradient: "from-teal-500 to-teal-700", category: "Nurse Tools", viewerPath: "/guides/discharge-checklist" },
  { id: "fridge-temps", title: "Fridge Temperature Recording", description: "Medication fridge monitoring and Assurance Dashboard recording", icon: "\uD83C\uDF21\uFE0F", gradient: "from-cyan-500 to-cyan-700", category: "Nurse Tools", viewerPath: "/guides/fridge-temps" },
  // Restrictive Practice
  { id: "seclusion-support-plan", title: "Seclusion Support Plan", description: "Think-it-through guide for the seclusion support plan - safer, sooner out of seclusion", icon: "\uD83D\uDEAA", gradient: "from-rose-600 to-red-800", category: "Restrictive Practice", viewerPath: "/guides/seclusion-support-plan" },
  { id: "restraint-monitoring", title: "Restraint & Rapid Tranq Monitoring", description: "Draft a defensible monitoring narrative for restraint or rapid tranquillisation", icon: "\uD83E\uDE7A", gradient: "from-orange-600 to-red-700", category: "Restrictive Practice", viewerPath: "/guides/restraint-monitoring" },
  { id: "observation-engagement", title: "Observation & Engagement Plan", description: "Write a clear rationale for the observation level and how staff engage", icon: "\uD83D\uDC41\uFE0F", gradient: "from-blue-600 to-indigo-800", category: "Restrictive Practice", viewerPath: "/guides/observation-engagement" },
  { id: "debrief", title: "Post-Incident Debrief", description: "Capture the patient's account and the learning after restraint, RT or seclusion", icon: "\uD83D\uDCAC", gradient: "from-teal-600 to-cyan-800", category: "Restrictive Practice", viewerPath: "/guides/debrief" },
  // Safeguarding - referrals, then adult, then children, then general
  { id: "safeguarding", title: "Safeguarding Adults - Making a Referral", description: "S.42 referral - report concerns, Derby City or County", icon: "\ud83d\uDEE1\uFE0F", gradient: "from-red-600 to-red-800", category: "Safeguarding", viewerPath: "/guides/safeguarding" },
  { id: "safeguarding-children", title: "Safeguarding Children - Making a Referral", description: "Starting Point referral for child concerns", icon: "\ud83d\uDC76", gradient: "from-pink-500 to-pink-700", category: "Safeguarding", viewerPath: "/guides/safeguarding-children" },
  { id: "domestic-abuse-guide", title: "Domestic Abuse", description: "Recognising and responding to domestic abuse", icon: "\uD83C\uDFE0", gradient: "from-purple-600 to-purple-800", category: "Safeguarding", viewerPath: "/guides/domestic-abuse-guide" },
  { id: "peer-conflict-guide", title: "Peer-on-Peer Conflict", description: "When to escalate patient conflict to safeguarding", icon: "\u26A0\uFE0F", gradient: "from-amber-600 to-amber-800", category: "Safeguarding", viewerPath: "/guides/peer-conflict-guide" },
  { id: "non-recent-abuse", title: "Non-Recent Abuse Disclosures", description: "Responding when adults disclose childhood abuse", icon: "\ud83d\uDD70\uFE0F", gradient: "from-slate-600 to-slate-800", category: "Safeguarding", viewerPath: "/guides/non-recent-abuse" },
  { id: "escalation-pathway", title: "Escalation Pathway (Children)", description: "Bronze, Silver and Gold levels for complex YP cases", icon: "\ud83d\uDCC8", gradient: "from-orange-600 to-orange-800", category: "Safeguarding", viewerPath: "/guides/escalation-pathway" },
  { id: "online-safety-children", title: "Online Safety and Children", description: "Nudes, cyberbullying, sextortion and screen time", icon: "\uD83C\uDF10", gradient: "from-cyan-600 to-cyan-800", category: "Safeguarding", viewerPath: "/guides/online-safety-children" },
  { id: "honour-based-abuse", title: "HBA, FGM and Forced Marriage", description: "Honour-based abuse, female genital mutilation and forced marriage", icon: "\ud83d\uDEE1\uFE0F", gradient: "from-rose-700 to-rose-900", category: "Safeguarding", viewerPath: "/guides/honour-based-abuse" },
  { id: "modern-slavery-radicalisation", title: "Modern Slavery and Radicalisation", description: "Spotting the signs and making Prevent referrals", icon: "\u26D3\uFE0F", gradient: "from-gray-600 to-gray-800", category: "Safeguarding", viewerPath: "/guides/modern-slavery-radicalisation" },
  { id: "faith-belief-abuse", title: "Abuse Linked to Faith or Belief", description: "Recognising abuse linked to spirit possession, witchcraft or cultural practices", icon: "\ud83d\uDE4F", gradient: "from-violet-600 to-violet-800", category: "Safeguarding", viewerPath: "/guides/faith-belief-abuse" },
  { id: "send-safeguarding", title: "SEND and Safeguarding", description: "Safeguarding children with special educational needs and disabilities", icon: "\ud83d\uDCDA", gradient: "from-teal-600 to-teal-800", category: "Safeguarding", viewerPath: "/guides/send-safeguarding" },
  { id: "special-guardianship", title: "Special Guardianship Orders", description: "Permanence through SGOs - best practice guidance", icon: "\ud83d\uDC68\u200D\ud83d\uDC67", gradient: "from-emerald-600 to-emerald-800", category: "Safeguarding", viewerPath: "/guides/special-guardianship" },
  { id: "child-in-need", title: "Child in Need", description: "Multi-agency CIN arrangements and best practice", icon: "\uD83E\uDD32", gradient: "from-sky-600 to-sky-800", category: "Safeguarding", viewerPath: "/guides/child-in-need" },
  { id: "information-sharing", title: "Information Sharing", description: "Seven golden rules and GDPR guidance for safeguarding", icon: "\ud83d\uDD17", gradient: "from-blue-600 to-blue-800", category: "Safeguarding", viewerPath: "/guides/information-sharing" },
  // Urgent Care
  { id: "picu", title: "PICU Kingfisher Referral", description: "Psychiatric Intensive Care Unit transfers", icon: "\uD83C\uDFE5", gradient: "from-rose-500 to-rose-700", category: "Urgent Care", viewerPath: "/guides/picu" },
  // Social & Housing
  { id: "homeless-discharge", title: "Housing / Duty to Refer", description: "Homeless discharge and accommodation support", icon: "\uD83C\uDFE0", gradient: "from-orange-500 to-orange-700", category: "Social & Housing", viewerPath: "/guides/homeless-discharge" },
  { id: "social-care", title: "Social Care (Derby City)", description: "Care Act assessment, S117 referrals & Enablement", icon: "\ud83d\uDC65", gradient: "from-amber-500 to-amber-700", category: "Social & Housing", viewerPath: "/guides/social-care" },
  { id: "benefits-review", title: "Benefits Review", description: "DWP benefits review and welfare rights support", icon: "\ud83d\uDCB7", gradient: "from-yellow-600 to-yellow-800", category: "Social & Housing", viewerPath: "/guides/benefits-review" },
  // Allied Health
  { id: "dietitian", title: "Dietitian Referral", description: "Nutritional assessment and support", icon: "\uD83E\uDD57", gradient: "from-green-500 to-green-700", category: "Allied Health", viewerPath: "/guides/dietitian" },
  { id: "physio", title: "Physiotherapy", description: "Physical therapy and mobility assessment", icon: "\uD83C\uDFC3", gradient: "from-emerald-500 to-emerald-700", category: "Allied Health", viewerPath: "/guides/physio" },
  { id: "ot", title: "Occupational Therapy", description: "OT assessment and functional review", icon: "\uD83E\uDDE9", gradient: "from-violet-500 to-violet-700", category: "Allied Health", viewerPath: "/guides/ot" },
  { id: "speech-therapy", title: "Speech & Language", description: "SALT assessment and swallowing review", icon: "\ud83d\uDCAC", gradient: "from-purple-500 to-purple-700", category: "Allied Health", viewerPath: "/guides/speech-therapy" },
  // Physical Health
  { id: "news2", title: "NEWS2 Observations", description: "National Early Warning Score - recognising deterioration", icon: "\ud83d\uDCCA", gradient: "from-rose-500 to-rose-700", category: "Physical Health", viewerPath: "/guides/news2" },
  { id: "tissue-viability", title: "Tissue Viability", description: "Wound care and pressure ulcer concerns", icon: "\uD83E\uDE79", gradient: "from-teal-500 to-teal-700", category: "Physical Health", viewerPath: "/guides/tissue-viability" },
  { id: "dental", title: "Dental Referral", description: "Dental care access for inpatients", icon: "\uD83E\uDDB7", gradient: "from-cyan-500 to-cyan-700", category: "Physical Health", viewerPath: "/guides/dental" },
  { id: "physical-health-assessment", title: "Physical Health Assessment Helper", description: "Turn the physical health questions into a person-centred summary", icon: "\u2764\uFE0F\u200D\uD83E\uDE79", gradient: "from-rose-600 to-pink-700", category: "Physical Health", viewerPath: "/guides/physical-health-assessment" },
  { id: "falls", title: "Falls Assessment Helper", description: "Think through the factors that raise falls risk and the plan to reduce it", icon: "\uD83E\uDDAF", gradient: "from-amber-600 to-orange-700", category: "Physical Health", viewerPath: "/guides/falls" },
  { id: "personal-handling", title: "Personal Handling Helper", description: "Plan the safest way to assist a person to move, and the emergency plan", icon: "\uD83E\uDD1D", gradient: "from-cyan-600 to-blue-700", category: "Physical Health", viewerPath: "/guides/personal-handling" },
  { id: "nutrition-screening", title: "Nutrition (MUST) Care Plan Helper", description: "Turn a MUST screen into a clear nutrition plan (guidance only, no scoring)", icon: "\uD83E\uDD57", gradient: "from-lime-600 to-green-700", category: "Physical Health", viewerPath: "/guides/nutrition-screening" },
  { id: "pressure-areas", title: "Pressure Area (Waterlow) Helper", description: "Turn a Waterlow assessment into a prevention plan (guidance only, no scoring)", icon: "\uD83E\uDE79", gradient: "from-teal-600 to-emerald-800", category: "Physical Health", viewerPath: "/guides/pressure-areas" },
  // Specialist Pathways
  { id: "edt", title: "Early Discharge Team", description: "EDT referral for discharge planning support", icon: "\ud83d\uDEAA", gradient: "from-sky-500 to-sky-700", category: "Specialist Pathways", viewerPath: "/guides/edt" },
  { id: "erp", title: "Emotional Regulation (ERP/DBT)", description: "DBT skills and emotional regulation pathway", icon: "\uD83E\uDDE0", gradient: "from-fuchsia-500 to-fuchsia-700", category: "Specialist Pathways", viewerPath: "/guides/erp" },
  { id: "ctr-dsp", title: "CTR / DSP Review", description: "Care Treatment Review for ASD/LD patients (mandatory)", icon: "\ud83d\uDCCB", gradient: "from-lime-600 to-lime-800", category: "Specialist Pathways", viewerPath: "/guides/ctr-dsp" },
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

  // Apply custom order if available - but IGNORE a stale saved order (one that is
  // missing a lot of current guides), and always take each guide (including its
  // category) from ALL_GUIDES so old category names cannot resurface. This
  // self-heals browsers that saved a guide order before later restructures, which
  // could otherwise scatter or bury guides.
  const orderedGuides = (() => {
    if (!customOrder) return ALL_GUIDES;
    const byId = new Map(ALL_GUIDES.map((g) => [g.id, g] as const));
    const savedKnown = customOrder.filter((co) => byId.has(co.id));
    // If the saved order covers fewer than 70% of current guides it is stale - drop it.
    if (savedKnown.length < ALL_GUIDES.length * 0.7) return ALL_GUIDES;
    const seen = new Set(savedKnown.map((co) => co.id));
    return savedKnown
      .map((co) => byId.get(co.id)!)
      .concat(ALL_GUIDES.filter((g) => !seen.has(g.id)));
  })();

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
                  href={link("/referrals/log")}
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
            aria-label="Search guides"
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
                  </div>
                </div>
                <StatusBadge status={guideApproval(guide.id)} />
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
