"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { BookmarkCarousel } from "@/components/bookmarks";
import { TodayWidget } from "@/components/diary";
import { useApp } from "@/app/providers";
import { useTour } from "@/app/tour-provider";
import Link from "next/link";
import { ArrowRight, ChevronDown, X, Sparkles } from "lucide-react";

const QUICK_ACTIONS = [
  {
    icon: "\uD83D\uDCCB",
    label: "Guides",
    description: "Referrals, assessments and step-by-step ward procedures",
    href: "/guides",
    gradient: "from-indigo-500 to-indigo-700",
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
  const { startTour, hasBeenStarted } = useTour();
  const [bannerDismissed, setBannerDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("wardhub_onboarding_dismissed");
    setBannerDismissed(dismissed === "true");
  }, []);

  const isAdminRole = user?.role === "senior_admin" || user?.role === "ward_admin";
  const showOnboarding = user && !bannerDismissed && !hasBeenStarted && !isAdminRole;

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("wardhub_onboarding_dismissed", "true");
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Onboarding banner for new users */}
        {showOnboarding && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">New to wardHub?</p>
                <p className="text-sm text-gray-600">Take the 2-minute guided tour to see what it can do.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { startTour(); dismissBanner(); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all no-underline"
              >
                Start Tour
              </button>
              <Link
                href="/intro-guide"
                onClick={dismissBanner}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all no-underline"
              >
                Intro Guide
              </Link>
              <button
                onClick={dismissBanner}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition-colors"
                aria-label="Dismiss onboarding banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl px-6 py-4 text-center relative overflow-hidden">
          <div className="absolute top-2 right-3 text-white/10 text-xs font-bold tracking-widest select-none">NHS</div>
          <p className="text-white/60 text-xs font-medium tracking-wider uppercase mb-1">
            Derbyshire Healthcare NHS Foundation Trust
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {user ? `Welcome, ${user.name}` : "wardHub"}
          </h1>
          <p className="text-white/80 text-base max-w-xl mx-auto">
            Interactive guides, ward diary and quick access to the resources you need.
          </p>
          {user && (
            <div className="flex items-center justify-center gap-6 mt-2 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {user.ward.charAt(0).toUpperCase() + user.ward.slice(1)} Ward
              </span>
              <span className="capitalize">{user.role.replace("_", " ")}</span>
              {user.isContributor && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">Contributor</span>}
            </div>
          )}
          {!user && (
            <div className="flex justify-center mt-3">
              <ChevronDown className="w-6 h-6 text-white/60 animate-bounce" />
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
