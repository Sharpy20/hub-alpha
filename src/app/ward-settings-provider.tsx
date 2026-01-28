"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { WardSettings, DEFAULT_WARD_SETTINGS } from "@/lib/types";

interface WardSettingsContextType {
  settings: Record<string, WardSettings>; // keyed by wardId
  getWardSettings: (wardId: string) => WardSettings;
  updateWardSettings: (wardId: string, updates: Partial<WardSettings>) => void;
  userFavoriteBookmarks: string[];
  toggleFavoriteBookmark: (bookmarkId: string) => void;
}

const WardSettingsContext = createContext<WardSettingsContextType | null>(null);

// Storage keys
const WARD_SETTINGS_KEY = "inpatient-hub-ward-settings";
const USER_FAVORITES_KEY = "inpatient-hub-user-favorites";

export function WardSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, WardSettings>>({});
  const [userFavoriteBookmarks, setUserFavoriteBookmarks] = useState<string[]>([]);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WARD_SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
      const savedFavorites = localStorage.getItem(USER_FAVORITES_KEY);
      if (savedFavorites) {
        setUserFavoriteBookmarks(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error("Failed to load ward settings:", e);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      localStorage.setItem(WARD_SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem(USER_FAVORITES_KEY, JSON.stringify(userFavoriteBookmarks));
  }, [userFavoriteBookmarks]);

  const getWardSettings = useCallback((wardId: string): WardSettings => {
    const normalizedId = wardId.toLowerCase();
    if (settings[normalizedId]) {
      return settings[normalizedId];
    }
    // Return default settings with the ward ID
    return { ...DEFAULT_WARD_SETTINGS, wardId: normalizedId };
  }, [settings]);

  const updateWardSettings = useCallback((wardId: string, updates: Partial<WardSettings>) => {
    const normalizedId = wardId.toLowerCase();
    setSettings((prev) => {
      const current = prev[normalizedId] || { ...DEFAULT_WARD_SETTINGS, wardId: normalizedId };
      return {
        ...prev,
        [normalizedId]: { ...current, ...updates },
      };
    });
  }, []);

  const toggleFavoriteBookmark = useCallback((bookmarkId: string) => {
    setUserFavoriteBookmarks((prev) =>
      prev.includes(bookmarkId)
        ? prev.filter((id) => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  }, []);

  return (
    <WardSettingsContext.Provider
      value={{
        settings,
        getWardSettings,
        updateWardSettings,
        userFavoriteBookmarks,
        toggleFavoriteBookmark,
      }}
    >
      {children}
    </WardSettingsContext.Provider>
  );
}

export function useWardSettings() {
  const context = useContext(WardSettingsContext);
  if (!context) {
    throw new Error("useWardSettings must be used within a WardSettingsProvider");
  }
  return context;
}
