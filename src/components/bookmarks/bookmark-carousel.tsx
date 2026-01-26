"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { DynamicIcon } from "@/components/common";
import { bookmarks, getCategories } from "@/lib/data/bookmarks";
import type { Bookmark } from "@/lib/types";
import Link from "next/link";

interface WheelItemProps {
  bookmark: Bookmark;
  index: number;
  total: number;
  radius: number;
}

// Check if icon is an emoji (starts with non-ASCII character)
function isEmoji(str: string): boolean {
  return /^[\u{1F000}-\u{1FFFF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u.test(str);
}

function WheelItem({ bookmark, index, total, radius }: WheelItemProps) {
  const angle = (index * 360) / total - 90; // Start from top
  const angleRad = (angle * Math.PI) / 180;
  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;

  const handleClick = () => {
    if (bookmark.requiresFocus) {
      alert(
        "This link requires FOCUS login.\n\nYou must be connected to the Trust network to access this resource."
      );
    }
    if (bookmark.url !== "#") {
      window.open(bookmark.url, "_blank");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="absolute w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center text-center p-2 shadow-lg border-3 border-transparent hover:border-nhs-blue hover:scale-110 hover:shadow-xl transition-all z-10 group"
      style={{
        left: `calc(50% + ${x}px - 48px)`,
        top: `calc(50% + ${y}px - 48px)`,
      }}
      title={bookmark.description}
    >
      <span className="text-3xl mb-1">
        {isEmoji(bookmark.icon) ? (
          bookmark.icon
        ) : (
          <DynamicIcon name={bookmark.icon} className="w-7 h-7 text-nhs-blue" />
        )}
      </span>
      <span className="text-[11px] font-medium text-nhs-black leading-tight">
        {bookmark.title}
      </span>
      {bookmark.requiresFocus && (
        <span className="absolute -bottom-1 bg-nhs-yellow text-nhs-black text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
          <Lock className="w-2.5 h-2.5" />
          FOCUS
        </span>
      )}
    </button>
  );
}

function WheelConnector({ index, total }: { index: number; total: number }) {
  const angle = (index * 360) / total - 90;
  return (
    <div
      className="absolute top-1/2 left-1/2 h-0.5 bg-gradient-to-r from-nhs-blue to-nhs-pale-grey opacity-30"
      style={{
        width: "145px",
        transformOrigin: "left center",
        transform: `rotate(${angle}deg)`,
      }}
    />
  );
}

export function BookmarkCarousel() {
  const categories = getCategories();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const currentCategory = categories[currentCategoryIndex];

  const categoryBookmarks = bookmarks.filter(
    (b) => b.category === currentCategory
  );

  // Show max 8 bookmarks for the wheel
  const maxSpokes = 8;
  const visibleBookmarks = categoryBookmarks.slice(0, maxSpokes);
  const radius = 165;

  const prevCategory = () => {
    setCurrentCategoryIndex((prev) =>
      prev === 0 ? categories.length - 1 : prev - 1
    );
  };

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) =>
      prev === categories.length - 1 ? 0 : prev + 1
    );
  };

  // Get category icon based on category name
  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      "Clinical Systems": "Monitor",
      "Crisis Support": "Phone",
      "Trust Resources": "Building2",
      "External Services": "ExternalLink",
      "Training": "GraduationCap",
      "Guidelines": "FileText",
    };
    return iconMap[category] || "Folder";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-nhs-pale-grey p-6">
      {/* Wheel container */}
      <div className="relative w-[440px] h-[440px] mx-auto max-w-full">
        {/* Connector lines */}
        {Array.from({ length: maxSpokes }).map((_, i) => (
          <WheelConnector key={`conn-${i}`} index={i} total={maxSpokes} />
        ))}

        {/* Navigation buttons */}
        <button
          onClick={prevCategory}
          className="absolute top-1/2 -left-4 md:-left-14 -translate-y-1/2 w-11 h-11 bg-white border-2 border-nhs-blue rounded-full flex items-center justify-center text-nhs-blue hover:bg-nhs-blue hover:text-white hover:scale-110 transition-all z-20 shadow-md"
          aria-label="Previous category"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextCategory}
          className="absolute top-1/2 -right-4 md:-right-14 -translate-y-1/2 w-11 h-11 bg-white border-2 border-nhs-blue rounded-full flex items-center justify-center text-nhs-blue hover:bg-nhs-blue hover:text-white hover:scale-110 transition-all z-20 shadow-md"
          aria-label="Next category"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-br from-nhs-blue to-nhs-dark-blue rounded-full flex flex-col items-center justify-center text-white text-center shadow-xl z-10">
          <DynamicIcon
            name={getCategoryIcon(currentCategory)}
            className="w-8 h-8 mb-2"
          />
          <span className="text-sm font-bold leading-tight px-3">
            {currentCategory}
          </span>
        </div>

        {/* Wheel items */}
        <div key={currentCategoryIndex} className="animate-fade-in">
          {visibleBookmarks.map((bookmark, index) => (
            <WheelItem
              key={bookmark.id}
              bookmark={bookmark}
              index={index}
              total={Math.max(visibleBookmarks.length, 1)}
              radius={radius}
            />
          ))}
        </div>
      </div>

      {/* Category dots */}
      <div className="flex justify-center gap-2 mt-6">
        {categories.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setCurrentCategoryIndex(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentCategoryIndex
                ? "bg-nhs-blue scale-125"
                : "bg-nhs-pale-grey hover:bg-nhs-mid-grey"
            }`}
            aria-label={`Go to ${cat}`}
          />
        ))}
      </div>

      {/* View all link */}
      <div className="text-center mt-4">
        <Link
          href="/bookmarks"
          className="text-nhs-blue font-medium hover:text-nhs-dark-blue text-lg"
        >
          View all bookmarks →
        </Link>
      </div>
    </div>
  );
}
