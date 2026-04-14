"use client";

import { ArrowRight } from "lucide-react";

interface TourWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
}

export function TourWelcome({ onStart, onSkip }: TourWelcomeProps) {
  return (
    <div className="text-center space-y-6 py-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">
          Your ward&apos;s go-to guide
        </h2>
        <p className="text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
          Referrals, clinical guides, useful links
          &ndash; all in one place.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onStart}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Take a look <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onSkip}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip tour
        </button>
      </div>
    </div>
  );
}
