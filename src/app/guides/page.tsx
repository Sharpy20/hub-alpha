"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { Badge, StatusBadge } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, Filter, FileText, Pencil, Search } from "lucide-react";
import { guideApproval } from "@/lib/data/approval-status";
import { ALL_GUIDES, TYPE_STYLE, guideType } from "@/lib/data/guides/catalog";
import { useCanEdit } from "@/lib/hooks/useCanEdit";
import { useV2Href } from "@/lib/hooks/useV2";


export default function GuidesPage() {
  const { canEdit } = useCanEdit();
  const link = useV2Href();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [customOrder, setCustomOrder] = useState<{ id: string; category: string }[] | null>(null);

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

  const allCategories = [...new Set(orderedGuides.map((g) => g.category))];

  const categoryFiltered = selectedCategory === "all"
    ? orderedGuides
    : orderedGuides.filter((g) => g.category === selectedCategory);

  // Filter by guide type (Builder / Checklist / Step-by-step / Tips / How-to)
  const typeFiltered = selectedType === "all"
    ? categoryFiltered
    : categoryFiltered.filter((g) => guideType(g.id) === selectedType);

  const filteredGuides = searchQuery.trim()
    ? typeFiltered.filter((g) => {
        const q = searchQuery.toLowerCase();
        return g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
      })
    : typeFiltered;

  // Types present, in a sensible order, for the type filter row
  const TYPE_ORDER = ["How-to", "Step-by-step", "Builder", "Checklist", "Tips"];
  const presentTypes = TYPE_ORDER.filter((t) => orderedGuides.some((g) => guideType(g.id) === t));
  const TYPE_HELP: Record<string, string> = {
    "How-to": "Read-through reference",
    "Step-by-step": "Follow the steps in order",
    "Builder": "Fill in and copy to notes",
    "Checklist": "Tick items off",
    "Tips": "Points to think through",
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

        {/* Type filter - makes it clear how each guide works */}
        {presentTypes.length > 1 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="font-bold text-gray-700">Type</span>
              <span className="text-xs text-gray-600">
                {selectedType === "all" ? "How each guide works" : TYPE_HELP[selectedType]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  selectedType === "all"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {presentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  title={TYPE_HELP[type]}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    selectedType === type
                      ? `${TYPE_STYLE[type]} ring-2 ring-offset-1 ring-current`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type}
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
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${TYPE_STYLE[guideType(guide.id)]}`}>
                      {guideType(guide.id)}
                    </span>
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
        <div className="diary-muted text-center text-sm">
          {filteredGuides.length} of {ALL_GUIDES.length} guides
        </div>
      </div>
    </MainLayout>
  );
}
