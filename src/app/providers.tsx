"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WARDS as WARD_DATA } from "@/lib/types";

const WARD_IDS = WARD_DATA.map(w => w.id);
const capitalizeWard = (ward: string): string => {
  return ward.charAt(0).toUpperCase() + ward.slice(1);
};

export type UserRole = "staff" | "lead" | "manager" | "ward_admin" | "senior_admin";

// Style themes
export type StyleTheme = "nhs" | "ios" | "material" | "fluent" | "oneui";

export const STYLE_THEMES: Record<StyleTheme, { label: string; icon: string; description: string }> = {
  nhs: { label: "NHS Default", icon: "🏥", description: "Clean NHS styling" },
  ios: { label: "iOS", icon: "🍎", description: "Apple Calendar feel" },
  material: { label: "Material", icon: "🤖", description: "Google Calendar feel" },
  fluent: { label: "Windows", icon: "🪟", description: "Windows Calendar feel" },
  oneui: { label: "Samsung", icon: "📱", description: "Samsung Calendar feel" },
};

interface User {
  name: string;
  role: UserRole;
  ward: string;
  isContributor?: boolean;
}

export type FeatureFlag =
  | "bookmarks"
  | "bookmarks_focus"
  | "workflows"
  | "workflows_internal"
  | "guides"
  | "guides_internal"
  | "ward_tasks"
  | "patient_tasks"
  | "patient_list"
  | "discharge_flow"
  | "nexus_sync"
  | "user_management"
  | "audit_logs";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasFeature: (feature: FeatureFlag) => boolean;
  gdprAccepted: boolean;
  setGdprAccepted: (accepted: boolean) => void;
  activeWard: string;
  setActiveWard: (ward: string) => void;
  allWards: readonly string[];
  styleTheme: StyleTheme;
  setStyleTheme: (theme: StyleTheme) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [activeWard, setActiveWardState] = useState<string>(capitalizeWard(WARD_IDS[0]));
  const [styleTheme, setStyleThemeState] = useState<StyleTheme>("nhs");

  useEffect(() => {
    const savedUser = localStorage.getItem("wardhub_user") || localStorage.getItem("inpatient_hub_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setActiveWardState(capitalizeWard(parsedUser.ward));
      if (!localStorage.getItem("wardhub_user")) {
        localStorage.setItem("wardhub_user", savedUser);
      }
    }
    const savedGdpr = localStorage.getItem("wardhub_gdpr") || localStorage.getItem("inpatient_hub_gdpr");
    if (savedGdpr === "true") {
      setGdprAccepted(true);
    }
    const savedActiveWard = localStorage.getItem("wardhub_active_ward") || localStorage.getItem("inpatient_hub_active_ward");
    if (savedActiveWard) {
      setActiveWardState(savedActiveWard);
    }
    const savedTheme = localStorage.getItem("wardhub_style_theme") as StyleTheme | null;
    if (savedTheme && savedTheme in STYLE_THEMES) {
      setStyleThemeState(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("wardhub_user", JSON.stringify(user));
      setActiveWardState(capitalizeWard(user.ward));
    } else {
      localStorage.removeItem("wardhub_user");
    }
  }, [user]);

  useEffect(() => {
    if (gdprAccepted) {
      localStorage.setItem("wardhub_gdpr", "true");
    }
  }, [gdprAccepted]);

  const setActiveWard = (ward: string) => {
    setActiveWardState(ward);
    localStorage.setItem("wardhub_active_ward", ward);
  };

  const setStyleTheme = (theme: StyleTheme) => {
    setStyleThemeState(theme);
    localStorage.setItem("wardhub_style_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  // All features always enabled – no version gating
  const hasFeature = (_feature: FeatureFlag): boolean => true;

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        hasFeature,
        gdprAccepted,
        setGdprAccepted,
        activeWard,
        setActiveWard,
        allWards: WARD_IDS.map(capitalizeWard),
        styleTheme,
        setStyleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within Providers");
  }
  return context;
}
