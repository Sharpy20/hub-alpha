"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TourSection = "welcome" | "referrals" | "task-diary" | "diary-integration" | "nexus-nudge" | "nexus-detail" | "kanban" | "complete";

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
  isInLiveWalkthrough: boolean;
  setIsInLiveWalkthrough: (v: boolean) => void;
  /**
   * True once this browser has run the tour at all. The amber Interactive Demo
   * button in the header is a prompt for new visitors, so it hides from here on
   * and Help becomes the tour's permanent home. Starting the tour is enough -
   * the "don't show again" tick at the end is not required, because someone who
   * closes the tour early has still seen it.
   */
  tourSeen: boolean;
  hasBeenStarted: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentSection, setCurrentSection] = useState<TourSection>("welcome");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInLiveWalkthrough, setIsInLiveWalkthrough] = useState(false);
  const [hasBeenStarted, setHasBeenStarted] = useState(false);
  // Starts true (button hidden) and is corrected after mount, so the server and
  // the first client render agree. A new visitor sees the button appear a frame
  // in, which is the same trade the home page onboarding banner already makes.
  const [tourSeen, setTourSeen] = useState(true);

  useEffect(() => {
    // wardhub_tour_dismissed is the older key, written by the "don't show again"
    // tick. Still honoured so anyone who ticked it stays hidden.
    const seen =
      localStorage.getItem("wardhub_tour_seen") === "true" ||
      localStorage.getItem("wardhub_tour_dismissed") === "true";
    setTourSeen(seen);
  }, []);

  const startTour = () => {
    setIsTourActive(true);
    setCurrentSection("welcome");
    setCurrentSlide(0);
    setIsInLiveWalkthrough(false);
    setHasBeenStarted(true);
    setTourSeen(true);
    localStorage.setItem("wardhub_tour_seen", "true");
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
        tourSeen,
        hasBeenStarted,
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
