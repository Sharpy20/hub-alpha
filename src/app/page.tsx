"use client";

import { MainLayout } from "@/components/layout";
import { BookmarkCarousel } from "@/components/bookmarks";
import { TodayWidget } from "@/components/diary";
import { useApp } from "@/app/providers";
import Link from "next/link";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";

const QUICK_ACTIONS = [
  {
    icon: "\uD83D\uDCCB",
    label: "Interactive Guides",
    description: "Step-by-step guides for referrals, processes and ward tasks",
    href: "/referrals",
    gradient: "from-indigo-500 to-indigo-700",
  },
  {
    icon: "\uD83D\uDCD6",
    label: "How-To Articles",
    description: "Clinical procedures, observations and practical guides",
    href: "/how-to",
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    icon: "\uD83C\uDD98",
    label: "Crisis Numbers",
    description: "Emergency contacts",
    href: "/bookmarks?category=Crisis%20Support",
    gradient: "from-red-500 to-red-700",
  },
];

export default function HomePage() {
  const { user } = useApp();

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-3 right-4 text-white/10 text-xs font-bold tracking-widest select-none">NHS</div>
          <p className="text-white/60 text-xs font-medium tracking-wider uppercase mb-3">
            Derbyshire Healthcare NHS Foundation Trust
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {user ? `Welcome, ${user.name}` : "wardHub"}
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Interactive guides, ward diary and quick access to the resources you need.
          </p>
          {user && (
            <div className="flex items-center justify-center gap-6 mt-5 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {user.ward.charAt(0).toUpperCase() + user.ward.slice(1)} Ward
              </span>
              <span className="capitalize">{user.role.replace("_", " ")}</span>
              {user.isContributor && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">Contributor</span>}
            </div>
          )}
          {!user && (
            <div className="flex justify-center mt-6">
              <ChevronDown className="w-8 h-8 text-white/60 animate-bounce" />
            </div>
          )}
        </section>

        {/* Bookmark Carousel */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Links
          </h2>
          <BookmarkCarousel />
        </section>

        {/* Quick Actions */}
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
                    <h3 className="text-xl font-bold">{action.label}</h3>
                    <p className="text-white/80 text-base">{action.description}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-white/70 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Today's Tasks Widget */}
        <section>
          <TodayWidget />
        </section>

        {/* What's New */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            What&apos;s New
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <div className="p-4 flex items-start gap-3">
              <span className="text-lg">&#x2B50;</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Personal Bookmarks</p>
                <p className="text-xs text-gray-500 mt-0.5">Add your own quick links, star favourites, and recommend bookmarks for the whole team.</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-3">
              <span className="text-lg">&#x1F50D;</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Search Everything</p>
                <p className="text-xs text-gray-500 mt-0.5">Quickly find bookmarks, guides and how-to articles with the new search bars.</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-3">
              <span className="text-lg">&#x1F3AC;</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Interactive Demo Tour</p>
                <p className="text-xs text-gray-500 mt-0.5">New to wardHub? Try the guided tour from the header button.</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-3">
              <span className="text-lg">&#x1F4CB;</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Business Case</p>
                <p className="text-xs text-gray-500 mt-0.5">Full business case and governance documentation available in the Dev Panel.</p>
              </div>
            </div>
          </div>
        </section>

        {/* GDPR link */}
        <section className="text-center">
          <Link href="/gdpr" className="text-sm text-indigo-600 hover:text-indigo-800">
            GDPR &amp; Privacy
          </Link>
        </section>
      </div>
    </MainLayout>
  );
}
