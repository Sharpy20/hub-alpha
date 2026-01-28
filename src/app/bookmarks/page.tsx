"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Badge } from "@/components/ui";
import { DynamicIcon } from "@/components/common";
import { bookmarks, getCategories } from "@/lib/data/bookmarks";
import { useWardSettings } from "@/app/ward-settings-provider";
import { Lock, ExternalLink, Bookmark, Filter, Star } from "lucide-react";

// Check if icon is an emoji
function isEmoji(str: string): boolean {
  return /^[\u{1F000}-\u{1FFFF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u.test(str);
}

// Category colors and icons
const CATEGORY_CONFIG: Record<string, { gradient: string; icon: string }> = {
  "all": { gradient: "from-slate-600 to-slate-800", icon: "📚" },
  "Crisis Support": { gradient: "from-red-500 to-red-700", icon: "🚨" },
  "Clinical Systems": { gradient: "from-blue-500 to-blue-700", icon: "💻" },
  "HR & Pay": { gradient: "from-green-500 to-green-700", icon: "💰" },
  "Training & Learning": { gradient: "from-purple-500 to-purple-700", icon: "📖" },
  "Policies & Guidance": { gradient: "from-amber-500 to-amber-700", icon: "📋" },
  "Communication": { gradient: "from-pink-500 to-pink-700", icon: "💬" },
  "External Services": { gradient: "from-teal-500 to-teal-700", icon: "🔗" },
};

function BookmarksContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const { userFavoriteBookmarks, toggleFavoriteBookmark } = useWardSettings();

  const categories = ["all", ...getCategories()];
  const filteredBookmarks =
    selectedCategory === "all"
      ? bookmarks
      : bookmarks.filter((b) => b.category === selectedCategory);

  const handleBookmarkClick = (bookmark: typeof bookmarks[0]) => {
    if (bookmark.requiresFocus) {
      alert(
        "This link requires FOCUS login.\n\nYou must be connected to the Trust network to access this resource."
      );
    }
    if (bookmark.url !== "#") {
      window.open(bookmark.url, "_blank");
    }
  };

  const currentConfig = CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG["all"];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentConfig.gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-4xl">{currentConfig.icon}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bookmark className="w-7 h-7" />
                Bookmarks
              </h1>
              <p className="text-white/80 mt-1">
                Quick links to clinical systems, resources, and external services
              </p>
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
            {categories.map((category) => {
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
                  {category === "all" ? "All Bookmarks" : category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookmarks list */}
        <div className="space-y-3">
          {filteredBookmarks.map((bookmark) => {
            const categoryConfig = CATEGORY_CONFIG[bookmark.category] || CATEGORY_CONFIG["all"];
            return (
              <div
                key={bookmark.id}
                className="bg-white rounded-xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleBookmarkClick(bookmark)}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${categoryConfig.gradient}`}
                >
                  {isEmoji(bookmark.icon) ? (
                    <span className="text-2xl">{bookmark.icon}</span>
                  ) : (
                    <DynamicIcon name={bookmark.icon} className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {bookmark.title}
                  </h3>
                  {bookmark.description && (
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                      {bookmark.description}
                    </p>
                  )}
                  {bookmark.phone && (
                    <p className="text-lg font-bold text-emerald-600 mt-1">
                      {bookmark.phone}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`bg-gradient-to-r ${categoryConfig.gradient} text-white border-0 text-xs`}>
                      {bookmark.category}
                    </Badge>
                    {bookmark.requiresFocus && (
                      <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        FOCUS
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteBookmark(bookmark.id);
                    }}
                    className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
                    title={userFavoriteBookmarks.includes(bookmark.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        userFavoriteBookmarks.includes(bookmark.id)
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300 hover:text-amber-400"
                      }`}
                    />
                  </button>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-lg font-medium text-gray-700">No bookmarks found</p>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              No bookmarks match this category. Try selecting a different category above or view all bookmarks.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              View All Bookmarks
            </button>
          </div>
        )}

        {/* Count */}
        <div className="text-center text-sm text-gray-500">
          Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks
        </div>
      </div>
    </MainLayout>
  );
}

export default function BookmarksPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="text-center py-12">
          <span className="text-4xl animate-pulse">📚</span>
          <p className="text-gray-500 mt-2">Loading bookmarks...</p>
        </div>
      </MainLayout>
    }>
      <BookmarksContent />
    </Suspense>
  );
}
