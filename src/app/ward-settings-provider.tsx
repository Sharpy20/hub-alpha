"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { WardSettings, DEFAULT_WARD_SETTINGS, Bookmark } from "@/lib/types";

export interface PersonalBookmark {
  id: string;
  title: string;
  url: string;
  icon: string;
  description?: string;
  createdAt: string;
}

export interface BookmarkRecommendation {
  id: string;
  bookmark: PersonalBookmark;
  suggestedCategory: string; // existing category or "Not sure / Other"
  recommendedBy: string; // user name
  recommendedAt: string;
  status: "pending" | "approved" | "dismissed";
}

interface WardSettingsContextType {
  settings: Record<string, WardSettings>; // keyed by wardId
  getWardSettings: (wardId: string) => WardSettings;
  updateWardSettings: (wardId: string, updates: Partial<WardSettings>) => void;
  userFavoriteBookmarks: string[];
  toggleFavoriteBookmark: (bookmarkId: string) => void;
  defaultBookmarkCategory: string;
  setDefaultBookmarkCategory: (category: string) => void;
  personalBookmarks: PersonalBookmark[];
  addPersonalBookmark: (bookmark: Omit<PersonalBookmark, "id" | "createdAt">) => void;
  updatePersonalBookmark: (id: string, updates: Partial<PersonalBookmark>) => void;
  removePersonalBookmark: (id: string) => void;
  pendingRecommendations: BookmarkRecommendation[];
  recommendBookmark: (bookmark: PersonalBookmark, suggestedCategory: string, userName: string) => void;
  approveRecommendation: (id: string, finalCategory: string) => Bookmark;
  dismissRecommendation: (id: string) => void;
}

const WardSettingsContext = createContext<WardSettingsContextType | null>(null);

// Storage keys
const WARD_SETTINGS_KEY = "wardhub-ward-settings";
const USER_FAVORITES_KEY = "wardhub-user-favorites";
const DEFAULT_BOOKMARK_CATEGORY_KEY = "wardhub-default-bookmark-category";
const PERSONAL_BOOKMARKS_KEY = "wardhub-personal-bookmarks";
const RECOMMENDATIONS_KEY = "wardhub-bookmark-recommendations";

export function WardSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, WardSettings>>({});
  const [userFavoriteBookmarks, setUserFavoriteBookmarks] = useState<string[]>([]);
  const [defaultBookmarkCategory, setDefaultBookmarkCategoryState] = useState<string>("Crisis Support");
  const [personalBookmarks, setPersonalBookmarks] = useState<PersonalBookmark[]>([]);
  const [pendingRecommendations, setPendingRecommendations] = useState<BookmarkRecommendation[]>([]);

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
      const savedDefaultCategory = localStorage.getItem(DEFAULT_BOOKMARK_CATEGORY_KEY);
      if (savedDefaultCategory) {
        setDefaultBookmarkCategoryState(savedDefaultCategory);
      }
      const savedPersonal = localStorage.getItem(PERSONAL_BOOKMARKS_KEY);
      if (savedPersonal) {
        setPersonalBookmarks(JSON.parse(savedPersonal));
      }
      const savedRecs = localStorage.getItem(RECOMMENDATIONS_KEY);
      if (savedRecs) {
        setPendingRecommendations(JSON.parse(savedRecs));
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

  const setDefaultBookmarkCategory = useCallback((category: string) => {
    setDefaultBookmarkCategoryState(category);
    localStorage.setItem(DEFAULT_BOOKMARK_CATEGORY_KEY, category);
  }, []);

  // Save personal bookmarks
  useEffect(() => {
    localStorage.setItem(PERSONAL_BOOKMARKS_KEY, JSON.stringify(personalBookmarks));
  }, [personalBookmarks]);

  // Save recommendations
  useEffect(() => {
    localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(pendingRecommendations));
  }, [pendingRecommendations]);

  const addPersonalBookmark = useCallback((bookmark: Omit<PersonalBookmark, "id" | "createdAt">) => {
    const newBookmark: PersonalBookmark = {
      ...bookmark,
      id: `personal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPersonalBookmarks((prev) => [...prev, newBookmark]);
  }, []);

  const updatePersonalBookmark = useCallback((id: string, updates: Partial<PersonalBookmark>) => {
    setPersonalBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const removePersonalBookmark = useCallback((id: string) => {
    setPersonalBookmarks((prev) => prev.filter((b) => b.id !== id));
    // Also remove from favorites if it was there
    setUserFavoriteBookmarks((prev) => prev.filter((fid) => fid !== id));
  }, []);

  const recommendBookmark = useCallback((bookmark: PersonalBookmark, suggestedCategory: string, userName: string) => {
    const rec: BookmarkRecommendation = {
      id: `rec-${Date.now()}`,
      bookmark,
      suggestedCategory,
      recommendedBy: userName,
      recommendedAt: new Date().toISOString(),
      status: "pending",
    };
    setPendingRecommendations((prev) => [...prev, rec]);
  }, []);

  const approveRecommendation = useCallback((id: string, finalCategory: string): Bookmark => {
    let approvedBookmark: Bookmark | null = null;
    setPendingRecommendations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          approvedBookmark = {
            id: `bookmark-${Date.now()}`,
            title: r.bookmark.title,
            icon: r.bookmark.icon,
            url: r.bookmark.url,
            category: finalCategory,
            requiresFocus: false,
            description: r.bookmark.description,
          };
          return { ...r, status: "approved" as const };
        }
        return r;
      })
    );
    return approvedBookmark!;
  }, []);

  const dismissRecommendation = useCallback((id: string) => {
    setPendingRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "dismissed" as const } : r))
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
        defaultBookmarkCategory,
        setDefaultBookmarkCategory,
        personalBookmarks,
        addPersonalBookmark,
        updatePersonalBookmark,
        removePersonalBookmark,
        pendingRecommendations,
        recommendBookmark,
        approveRecommendation,
        dismissRecommendation,
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
