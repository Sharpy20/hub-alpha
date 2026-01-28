"use client";

import { MainLayout } from "@/components/layout";
import { BookmarkCarousel } from "@/components/bookmarks";
import { TodayWidget } from "@/components/diary";
import { useApp } from "@/app/providers";
import { useWardSettings } from "@/app/ward-settings-provider";
import Link from "next/link";
import { ArrowRight, ChevronDown, Star, Plus, ExternalLink } from "lucide-react";
import { bookmarks } from "@/lib/data/bookmarks";

const QUICK_ACTIONS = [
  {
    icon: "📋",
    label: "Make a Referral",
    description: "Step-by-step referral guides",
    href: "/referrals",
    gradient: "from-indigo-500 to-indigo-700",
  },
  {
    icon: "📖",
    label: "How-To Guides",
    description: "Clinical procedures & SOPs",
    href: "/how-to",
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    icon: "🆘",
    label: "Crisis Numbers",
    description: "Emergency contacts",
    href: "/bookmarks?category=Crisis%20Support",
    gradient: "from-red-500 to-red-700",
  },
];

const VERSION_OPTIONS = [
  { value: "light", label: "Light", description: "Public info only", icon: "🌱" },
  { value: "medium", label: "Medium", description: "Internal SOPs + Tasks", icon: "🌿" },
  { value: "max", label: "Max", description: "Full patient features", icon: "🌳" },
  { value: "max_plus", label: "Max+", description: "SystemOne integration", icon: "🚀" },
] as const;

export default function HomePage() {
  const { user, version, setVersion, hasFeature } = useApp();
  const { userFavoriteBookmarks, toggleFavoriteBookmark } = useWardSettings();
  const showTasks = hasFeature("ward_tasks");

  // Get favorite bookmark objects
  const favoriteBookmarks = bookmarks.filter((b) => userFavoriteBookmarks.includes(b.id));

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section - Full width, big and welcoming */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {user ? `Welcome, ${user.name}` : "🏥 Inpatient Hub"}
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Quick access to ward resources, referral workflows, and clinical guides.
          </p>
          {!showTasks && (
            <div className="flex justify-center mt-6">
              <ChevronDown className="w-8 h-8 text-white/60 animate-bounce" />
            </div>
          )}
        </section>

        {/* User Favorites Section */}
        {favoriteBookmarks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                My Favorites
              </h2>
              <Link
                href="/bookmarks"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                Manage
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {favoriteBookmarks.slice(0, 8).map((bookmark) => (
                <a
                  key={bookmark.id}
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-amber-300 hover:shadow-md transition-all no-underline"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{bookmark.icon}</span>
                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {bookmark.title}
                  </h3>
                  {bookmark.phone && (
                    <p className="text-xs text-gray-500 mt-1">{bookmark.phone}</p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Bookmark Carousel - Full width section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Links
          </h2>
          <BookmarkCarousel />
        </section>

        {/* Quick Actions - Full width, stacked, colorful */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            I need to...
          </h2>
          <div className="space-y-4">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href} className="block no-underline">
                <div className={`rounded-xl p-6 flex items-center gap-5 bg-gradient-to-r ${action.gradient} text-white hover:shadow-xl hover:scale-[1.02] transition-all`}>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">
                      {action.label}
                    </h3>
                    <p className="text-white/80 text-base">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/70 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Today's Tasks Widget - Only for Medium+ */}
        {showTasks && (
          <section>
            <TodayWidget />
          </section>
        )}

        {/* Version switcher - for demo */}
        <section className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
            ⚙️ Demo Version Switcher
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {VERSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setVersion(opt.value)}
                className={`p-4 rounded-xl text-left transition-all ${
                  version === opt.value
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-900 border-2 border-transparent hover:border-indigo-300"
                }`}
              >
                <p className="font-bold">{opt.icon} {opt.label}</p>
                <p className={`text-sm ${version === opt.value ? "text-white/80" : "text-gray-500"}`}>
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
          <Link
            href="/versions"
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
          >
            📊 Compare All Features
          </Link>
          <p className="text-center text-sm text-gray-500 mt-3">
            Current: <strong className="text-gray-900">{version.toUpperCase()}</strong>
            {" · "}
            <Link href="/gdpr" className="text-indigo-600 hover:text-indigo-800">
              GDPR & Privacy
            </Link>
          </p>
        </section>
      </div>
    </MainLayout>
  );
}
