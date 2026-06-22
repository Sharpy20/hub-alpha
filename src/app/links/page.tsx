"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { Badge, VerificationBadge } from "@/components/ui";
import { DynamicIcon } from "@/components/common";
import { bookmarks, getCategories } from "@/lib/data/bookmarks";
import { useWardSettings, PersonalBookmark } from "@/app/ward-settings-provider";
import { useApp } from "@/app/providers";
import { Lock, ExternalLink, Link2, Filter, Star, Check, X, Shield, Plus, Pencil, Trash2, Send, User, Search } from "lucide-react";

// Check if icon is an emoji
function isEmoji(str: string): boolean {
  return /^[\u{1F000}-\u{1FFFF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u.test(str);
}

// Category colors and icons
const CATEGORY_CONFIG: Record<string, { gradient: string; icon: string }> = {
  "all": { gradient: "from-slate-600 to-slate-800", icon: "📚" },
  "My Favourites": { gradient: "from-amber-400 to-orange-500", icon: "⭐" },
  "My Personal": { gradient: "from-violet-500 to-purple-700", icon: "👤" },
  "Crisis Support": { gradient: "from-red-500 to-red-700", icon: "🚨" },
  "Clinical Systems": { gradient: "from-blue-500 to-blue-700", icon: "💻" },
  "HR & Pay": { gradient: "from-green-500 to-green-700", icon: "💰" },
  "Training & Learning": { gradient: "from-purple-500 to-purple-700", icon: "📖" },
  "Policies & Guidance": { gradient: "from-amber-500 to-amber-700", icon: "📋" },
  "Communication": { gradient: "from-pink-500 to-pink-700", icon: "💬" },
  "External Services": { gradient: "from-teal-500 to-teal-700", icon: "🔗" },
  "Safeguarding": { gradient: "from-red-600 to-rose-700", icon: "🛡️" },
  "Safeguarding Children": { gradient: "from-pink-600 to-rose-700", icon: "👶" },
  "Mental Health Act": { gradient: "from-indigo-600 to-violet-700", icon: "⚖️" },
  "Patient Safety": { gradient: "from-rose-500 to-red-600", icon: "🛟" },
  "Infection Control": { gradient: "from-emerald-500 to-green-700", icon: "🦠" },
  "Pharmacy": { gradient: "from-cyan-500 to-blue-600", icon: "💊" },
  "Wellbeing": { gradient: "from-orange-400 to-rose-500", icon: "❤️" },
  "Chaplaincy": { gradient: "from-violet-400 to-purple-600", icon: "🙏" },
  "Estates & Facilities": { gradient: "from-gray-500 to-gray-700", icon: "🏗️" },
  "IT Support": { gradient: "from-sky-500 to-blue-700", icon: "🖥️" },
};

const COMMON_EMOJIS = ["🔗", "📞", "💚", "🧠", "🏥", "💻", "📧", "📝", "💰", "📅", "📚", "📋", "💊", "⚖️", "🗣️", "💜", "🛡️", "👶", "📹", "🏠", "☎️"];

function BookmarksContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusModalUrl, setFocusModalUrl] = useState<string | null>(null);
  const [showAddPersonal, setShowAddPersonal] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState<PersonalBookmark | null>(null);
  const [recommendModal, setRecommendModal] = useState<PersonalBookmark | null>(null);
  const { user } = useApp();
  const {
    userFavoriteBookmarks, toggleFavoriteBookmark,
    defaultBookmarkCategory, setDefaultBookmarkCategory,
    personalBookmarks, addPersonalBookmark, updatePersonalBookmark, removePersonalBookmark,
    recommendBookmark,
  } = useWardSettings();

  const hasPersonal = personalBookmarks.length > 0;
  const categories = [
    "all",
    ...(userFavoriteBookmarks.length > 0 ? ["My Favourites"] : []),
    "My Personal",
    ...getCategories(),
  ];

  // Build filtered list - for "all", include personal bookmarks too
  const categoryFiltered =
    selectedCategory === "all"
      ? bookmarks
      : selectedCategory === "My Favourites"
      ? [...bookmarks.filter((b) => userFavoriteBookmarks.includes(b.id)),
         ...personalBookmarks.filter((b) => userFavoriteBookmarks.includes(b.id)).map(personalToBookmark)]
      : selectedCategory === "My Personal"
      ? []  // handled separately below
      : bookmarks.filter((b) => b.category === selectedCategory);

  const filteredBookmarks = searchQuery.trim()
    ? categoryFiltered.filter((b) => {
        const q = searchQuery.toLowerCase();
        return b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q));
      })
    : categoryFiltered;

  const isPersonalView = selectedCategory === "My Personal";

  const handleBookmarkClick = (bookmark: typeof bookmarks[0]) => {
    if (bookmark.requiresFocus) {
      setFocusModalUrl(bookmark.url);
      return;
    }
    if (bookmark.url !== "#") {
      window.open(bookmark.url, "_blank");
    }
  };

  const handleFocusContinue = () => {
    if (focusModalUrl && focusModalUrl !== "#") {
      window.open(focusModalUrl, "_blank");
    }
    setFocusModalUrl(null);
  };

  const currentConfig = CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG["all"];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentConfig.gradient} rounded-2xl p-4 sm:p-6 text-white`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-4xl">{currentConfig.icon}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
                <Link2 className="w-5 h-5 sm:w-7 sm:h-7" />
                Links
              </h1>
              <p className="text-white/80 mt-1 text-sm sm:text-base">
                Quick links to clinical systems and resources
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search links"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-bold text-gray-700">Filter by Category</span>
            </div>
            {selectedCategory !== "all" && selectedCategory !== "My Personal" && (
              <button
                onClick={() => setDefaultBookmarkCategory(selectedCategory)}
                className={`text-xs px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  defaultBookmarkCategory === selectedCategory
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {defaultBookmarkCategory === selectedCategory ? (
                  <>
                    <Check className="w-3 h-3" />
                    Default on home
                  </>
                ) : (
                  "Set as home default"
                )}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG["all"];
              const isDefault = category !== "all" && category !== "My Personal" && defaultBookmarkCategory === category;
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
                  {category === "all" ? "All Links" : category}
                  {isDefault && <Check className="w-3 h-3" />}
                  {category === "My Personal" && hasPersonal && (
                    <span className="bg-white/30 text-xs px-1.5 rounded-full">{personalBookmarks.length}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* My Personal section */}
        {isPersonalView && (
          <div className="space-y-3">
            {/* Add button */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Your personal links - only visible to you
              </p>
              <button
                onClick={() => { setEditingPersonal(null); setShowAddPersonal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>

            {/* Personal bookmark cards */}
            {personalBookmarks.map((pb) => (
              <div
                key={pb.id}
                className="bg-white rounded-xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => {
                  if (pb.url !== "#") window.open(pb.url, "_blank");
                }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-700">
                  <span className="text-2xl">{pb.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {pb.title}
                  </h3>
                  {pb.description && (
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{pb.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-700 text-white border-0 text-xs">
                      <User className="w-3 h-3 mr-1" />
                      Personal
                    </Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecommendModal(pb);
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 hover:underline"
                    >
                      <Send className="w-3 h-3" />
                      Recommend for everyone
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteBookmark(pb.id);
                    }}
                    className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
                    title={userFavoriteBookmarks.includes(pb.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        userFavoriteBookmarks.includes(pb.id)
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300 hover:text-amber-400"
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPersonal(pb);
                      setShowAddPersonal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePersonalBookmark(pb.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {personalBookmarks.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <span className="text-6xl mb-4 block">👤</span>
                <p className="text-lg font-medium text-gray-700">No personal links yet</p>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  Add your own links for quick access to the sites you use most.
                </p>
                <button
                  onClick={() => { setEditingPersonal(null); setShowAddPersonal(true); }}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  Add Your First Link
                </button>
              </div>
            )}
          </div>
        )}

        {/* Regular bookmarks list (non-personal view) */}
        {!isPersonalView && (
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
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={`bg-gradient-to-r ${categoryConfig.gradient} text-white border-0 text-xs`}>
                        {bookmark.category}
                      </Badge>
                      {bookmark.requiresFocus && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          FOCUS
                        </Badge>
                      )}
                      <VerificationBadge
                        contentType="link"
                        contentId={bookmark.id}
                        contentTitle={bookmark.title}
                      />
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
        )}

        {!isPersonalView && filteredBookmarks.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-lg font-medium text-gray-700">No links found</p>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              No links match this category. Try selecting a different category above or view all links.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              View All Links
            </button>
          </div>
        )}

        {/* Count */}
        {!isPersonalView && (
          <div className="text-center text-sm text-gray-500">
            Showing {filteredBookmarks.length} of {bookmarks.length} links
          </div>
        )}
      </div>

      {/* FOCUS Login Required Modal */}
      {focusModalUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setFocusModalUrl(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">FOCUS Login Required</h3>
              </div>
              <button onClick={() => setFocusModalUrl(null)} className="text-white/80 hover:text-white" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Trust Network Access</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This link requires FOCUS login. You must be connected to the Trust network to access this resource.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setFocusModalUrl(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFocusContinue}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Open Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Personal Bookmark Modal */}
      {showAddPersonal && (
        <PersonalBookmarkModal
          bookmark={editingPersonal}
          onSave={(data) => {
            if (editingPersonal) {
              updatePersonalBookmark(editingPersonal.id, data);
            } else {
              addPersonalBookmark(data);
            }
            setShowAddPersonal(false);
            setEditingPersonal(null);
          }}
          onClose={() => { setShowAddPersonal(false); setEditingPersonal(null); }}
        />
      )}

      {/* Recommend for Everyone Modal */}
      {recommendModal && (
        <RecommendModal
          bookmark={recommendModal}
          userName={user?.name || "Unknown"}
          onSubmit={(category) => {
            recommendBookmark(recommendModal, category, user?.name || "Unknown");
            setRecommendModal(null);
          }}
          onClose={() => setRecommendModal(null)}
        />
      )}
    </MainLayout>
  );
}

// Convert PersonalBookmark to Bookmark shape for display in Favourites
function personalToBookmark(pb: PersonalBookmark): typeof bookmarks[0] {
  return {
    id: pb.id,
    title: pb.title,
    icon: pb.icon,
    url: pb.url,
    category: "My Personal",
    requiresFocus: false,
    description: pb.description,
    phone: undefined,
  };
}

// Add/Edit Personal Bookmark Modal
function PersonalBookmarkModal({
  bookmark,
  onSave,
  onClose,
}: {
  bookmark: PersonalBookmark | null;
  onSave: (data: Omit<PersonalBookmark, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(bookmark?.title || "");
  const [url, setUrl] = useState(bookmark?.url || "");
  const [icon, setIcon] = useState(bookmark?.icon || "🔗");
  const [description, setDescription] = useState(bookmark?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onSave({ title: title.trim(), url: url.trim(), icon, description: description.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">
            {bookmark ? "Edit Personal Link" : "Add Personal Link"}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 text-lg rounded-lg border-2 transition-colors ${
                    icon === emoji ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. My Payslip Portal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Brief description"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              {bookmark ? "Save Changes" : "Add Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Recommend for Everyone Modal
function RecommendModal({
  bookmark,
  userName,
  onSubmit,
  onClose,
}: {
  bookmark: PersonalBookmark;
  userName: string;
  onSubmit: (category: string) => void;
  onClose: () => void;
}) {
  const categories = getCategories();
  const [selectedCategory, setSelectedCategory] = useState("Not sure / Other");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-lg">Recommend for Everyone</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-900">{bookmark.title}</p>
            <p className="text-sm text-gray-500 truncate">{bookmark.url}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Which category fits best?
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Which category fits best?"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Not sure / Other">Not sure / Other</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-gray-500">
            Your suggestion will be reviewed by a creator or senior admin before being added for everyone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(selectedCategory)}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LinksPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="text-center py-12">
          <span className="text-4xl animate-pulse">📚</span>
          <p className="text-gray-500 mt-2">Loading links...</p>
        </div>
      </MainLayout>
    }>
      <BookmarksContent />
    </Suspense>
  );
}
