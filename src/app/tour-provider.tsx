"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type TourSection = "welcome" | "referrals" | "task-diary" | "daily-tasks" | "nexus-sync" | "claiming" | "gdpr" | "complete";

interface TourContextType {
  isTourActive: boolean;
  startTour: () => void;
  endTour: () => void;
  currentSection: TourSection;
  setCurrentSection: (section: TourSection) => void;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  // Track whether user is in live referral walkthrough
  isInLiveWalkthrough: boolean;
  setIsInLiveWalkthrough: (v: boolean) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentSection, setCurrentSection] = useState<TourSection>("welcome");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInLiveWalkthrough, setIsInLiveWalkthrough] = useState(false);

  const startTour = () => {
    setIsTourActive(true);
    setCurrentSection("welcome");
    setCurrentSlide(0);
    setIsInLiveWalkthrough(false);
  };

  const endTour = () => {
    setIsTourActive(false);
    setCurrentSection("welcome");
    setCurrentSlide(0);
    setIsInLiveWalkthrough(false);
  };

  const nextSlide = () => setCurrentSlide((s) => s + 1);
  const prevSlide = () => setCurrentSlide((s) => Math.max(0, s - 1));

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        startTour,
        endTour,
        currentSection,
        setCurrentSection,
        currentSlide,
        setCurrentSlide,
        nextSlide,
        prevSlide,
        isInLiveWalkthrough,
        setIsInLiveWalkthrough,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within TourProvider");
  }
  return context;
}
