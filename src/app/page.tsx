"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { BookmarkCarousel } from "@/components/bookmarks";
import { TodayWidget } from "@/components/diary";
import { useApp } from "@/app/providers";
import { useTour } from "@/app/tour-provider";
import Link from "next/link";
import { ArrowRight, ChevronDown, X, Sparkles, Shield, Phone, ChevronRight } from "lucide-react";
import { bookmarks } from "@/lib/data/bookmarks";

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

const SG_QUICK_LINKS = [
  { icon: "🛡️", label: "Safeguarding Adults", description: "S.42 referral — step by step", href: "/how-to/safeguarding-adults-referral" },
  { icon: "👶", label: "Worried About a Child", description: "Starting Point referral", href: "/how-to/safeguarding-children-referral" },
  { icon: "🏠", label: "Domestic Abuse", description: "Recognise, respond, refer", href: "/how-to/domestic-abuse-guide" },
  { icon: "⚠️", label: "Patient Conflict", description: "When to escalate", href: "/how-to/peer-conflict-guide" },
];

function SafeguardingDecisionHelper() {
  const [step, setStep] = useState(0);
  const reset = () => setStep(0);

  if (step === 0) {
    return (
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700 mb-3">Not sure where to start?</p>
        <button onClick={() => setStep(1)} className="px-5 py-2.5 bg-white text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm border border-red-200">
          Help me decide
        </button>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm font-semibold text-gray-800">Is the person you're worried about 18 or over?</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setStep(2)} className="px-5 py-2 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 border border-gray-200 text-sm">Yes — adult</button>
          <button onClick={() => setStep(5)} className="px-5 py-2 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 border border-gray-200 text-sm">No — child</button>
        </div>
        <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-700">Start over</button>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm font-semibold text-gray-800">Do they have care and support needs?</p>
        <p className="text-xs text-gray-500">Think: mental health, learning disability, physical illness, substance misuse, age-related needs</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setStep(3)} className="px-5 py-2 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 border border-gray-200 text-sm">Yes</button>
          <button onClick={() => setStep(4)} className="px-5 py-2 bg-white text-gray-800 font-semibold rounded-xl hover:bg-gray-50 border border-gray-200 text-sm">Not sure</button>
        </div>
        <button onClick={reset} className="text-xs text-gray-500 hover:text-gray-700">Start over</button>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-xl font-semibold text-sm">
          <Shield className="w-4 h-4" /> This is likely a safeguarding concern
        </div>
        <p className="text-xs text-gray-600">Use the Safeguarding Adults guide to make a referral</p>
        <div className="flex gap-3 justify-center">
          <Link href="/how-to/safeguarding-adults-referral" className="px-5 py-2 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 text-sm no-underline">
            Open the guide
          </Link>
          <button onClick={reset} className="px-5 py-2 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 text-sm">Start over</button>
        </div>
      </div>
    );
  }
  if (step === 4) {
    return (
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-semibold text-sm">
          <Phone className="w-4 h-4" /> Ring the advice line to talk it through
        </div>
        <p className="text-xs text-gray-600">DHCFT Safeguarding Advice Line — they'll help you decide</p>
        <div className="flex gap-3 justify-center">
          <Link href="/how-to/safeguarding-adults-referral" className="px-5 py-2 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 text-sm no-underline">
            Open the guide anyway
          </Link>
          <button onClick={reset} className="px-5 py-2 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 text-sm">Start over</button>
        </div>
      </div>
    );
  }
  // step === 5 (child)
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 px-4 py-2 rounded-xl font-semibold text-sm">
        <Shield className="w-4 h-4" /> Contact Starting Point
      </div>
      <p className="text-xs text-gray-600">24-hour children's safeguarding referral service</p>
      <div className="flex gap-3 justify-center">
        <Link href="/how-to/safeguarding-children-referral" className="px-5 py-2 bg-pink-700 text-white font-semibold rounded-xl hover:bg-pink-800 text-sm no-underline">
          Open the guide
        </Link>
        <button onClick={reset} className="px-5 py-2 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 text-sm">Start over</button>
      </div>
    </div>
  );
}

function SafeguardingSection() {
  const sgBookmarks = bookmarks.filter(b => b.category === "Safeguarding" && !b.requiresFocus);

  return (
    <section className="space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Safeguarding Hub</h2>
              <p className="text-white/70 text-sm">Recognise. Respond. Refer.</p>
            </div>
          </div>

          {/* Emergency strip */}
          <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2.5 mb-5 flex items-center gap-3">
            <span className="text-lg">🚨</span>
            <p className="text-sm font-medium">If someone is in <span className="font-bold">immediate danger</span>, call <span className="font-bold text-lg">999</span></p>
          </div>

          {/* Quick link cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {SG_QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="no-underline">
                <div className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl p-3 text-center transition-all hover:scale-105 h-full">
                  <span className="text-2xl block mb-1">{link.icon}</span>
                  <p className="text-sm font-bold text-white leading-tight">{link.label}</p>
                  <p className="text-[11px] text-white/60 mt-0.5">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Decision helper */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <SafeguardingDecisionHelper />
          </div>
        </div>
      </div>

      {/* Safeguarding bookmarks strip */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600" />
            Safeguarding Links
          </h3>
          <Link href="/bookmarks?category=Safeguarding" className="text-xs text-indigo-600 hover:text-indigo-800 no-underline flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sgBookmarks.slice(0, 8).map((bm) => (
            <a
              key={bm.id}
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-red-50 rounded-lg border border-gray-100 hover:border-red-200 transition-colors no-underline"
              title={bm.description}
            >
              <span className="text-lg">{bm.icon}</span>
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{bm.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

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

        {/* Safeguarding Hub */}
        <SafeguardingSection />

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
