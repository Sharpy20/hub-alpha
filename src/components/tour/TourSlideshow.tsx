"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TourSlideshowProps {
  slides: {
    title: string;
    narrative: string;
    visual: React.ReactNode;
  }[];
  currentSlide: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  completeLabel?: string;
}

export function TourSlideshow({ slides, currentSlide, onNext, onPrev, onComplete, completeLabel = "Continue Tour" }: TourSlideshowProps) {
  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  if (!slide) return null;

  return (
    <div className="space-y-4">
      {/* Slide indicator */}
      <div className="flex items-center justify-center gap-1.5">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "w-8 bg-indigo-500" : "w-1.5 bg-gray-300"}`}
          />
        ))}
      </div>

      {/* Title & narrative */}
      <div className="text-center px-4">
        <h3 className="font-bold text-lg text-gray-900">{slide.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{slide.narrative}</p>
      </div>

      {/* Visual */}
      <div className="py-2">
        {slide.visual}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={onPrev}
          disabled={currentSlide === 0}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentSlide === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={isLast ? onComplete : onNext}
          className="flex items-center gap-1 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
        >
          {isLast ? completeLabel : "Next"} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
