"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface TourWelcomeProps {
  onStart: () => void;
  onSkip: () => void;
}

export function TourWelcome({ onStart, onSkip }: TourWelcomeProps) {
  return (
    <div className="text-center space-y-6 py-4">
      {/* Animated icon */}
      <div className="relative inline-block">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-gray-900">Welcome to wardHub</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Interactive walkthroughs for many of the tasks ward staff regularly work on.
          Pulled together into a simple electronic jobs diary to improve communication flow.
        </p>
      </div>

      {/* Feature preview cards */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-sm font-bold text-indigo-800">Interactive Guides</p>
          <p className="text-xs text-indigo-600">Step-by-step walkthroughs</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm font-bold text-purple-800">Jobs Diary</p>
          <p className="text-xs text-purple-600">Stay organised as a team</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm font-bold text-amber-800">Audit Nudges</p>
          <p className="text-xs text-amber-600">Gentle reminders, auto-complete</p>
        </div>
        <div className="p-3 bg-green-50 rounded-xl border border-green-200">
          <p className="text-sm font-bold text-green-800">No Training Needed</p>
          <p className="text-xs text-green-600">Just log in and go</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onStart}
          className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Start Tour <ArrowRight className="w-5 h-5" />
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
