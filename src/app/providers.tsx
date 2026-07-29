"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WARDS as WARD_DATA } from "@/lib/types";
import { STAFF_NAMES } from "@/lib/data/staff";

const WARD_IDS = WARD_DATA.map(w => w.id);

// Every demo identity comes from the staff roster (the login picker is a dropdown
// off it), so a saved user whose name is no longer in it is stale - left over from
// an older demo cast, e.g. the "Staff_BY_D" placeholders replaced in July 2026.
// Self-heal rather than showing a name that exists nowhere in the app.
const KNOWN_STAFF_NAMES = new Set(Object.values(STAFF_NAMES).flat());
const isKnownStaffName = (name: unknown): boolean =>
  typeof name === "string" && KNOWN_STAFF_NAMES.has(name);
const capitalizeWard = (ward: string): string => {
  return ward.charAt(0).toUpperCase() + ward.slice(1);
};

export type UserRole = "staff" | "lead" | "manager" | "ward_admin" | "senior_admin";

// Style themes
export type StyleTheme = "nhs" | "ios" | "material" | "fluent" | "oneui";

export const STYLE_THEMES: Record<StyleTheme, { label: string; icon: string; description: string }> = {
  nhs: { label: "NHS Default", icon: "🏥", description: "Standard NHS styling" },
  ios: { label: "Apple", icon: "🍎", description: "Clean, airy Apple Calendar feel" },
  material: { label: "Google", icon: "🔵", description: "Google Calendar with left-border cards" },
  fluent: { label: "Fantastical", icon: "🌌", description: "Dark indigo premium look" },
  oneui: { label: "Notion", icon: "📋", description: "Minimal database-style layout" },
};

interface User {
  name: string;
  role: UserRole;
  ward: string;
  isContributor?: boolean;
}

export type FeatureFlag =
  | "links"
  | "links_focus"
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

export type ColorMode = "light" | "dark" | "system";

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
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  isDark: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [activeWard, setActiveWardState] = useState<string>(capitalizeWard(WARD_IDS[0]));
  const [styleTheme, setStyleThemeState] = useState<StyleTheme>("nhs");
  const [colorMode, setColorModeState] = useState<ColorMode>("light");
  const [isDark, setIsDark] = useState(false);

  // Declared before the mount effect below, which calls it (react-hooks/immutability)
  const applyColorMode = (mode: ColorMode) => {
    let dark = false;
    if (mode === "dark") {
      dark = true;
    } else if (mode === "system") {
      dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  };

  useEffect(() => {
    // Byron's plain-staff member, index 4 of STAFF_NAMES. Used when there is no
    // saved user (so visitors can use the diary straight away without logging
    // in - the login page is still there to switch user/ward) and when a saved
    // one turns out to be stale.
    const defaultUser: User = { name: "Anne Elliot", role: "staff", ward: "byron", isContributor: false };
    const savedUser = localStorage.getItem("wardhub_user") || localStorage.getItem("inpatient_hub_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (!isKnownStaffName(parsedUser?.name)) {
          throw new Error("stale demo user");
        }
        setUser(parsedUser);
        setActiveWardState(capitalizeWard(parsedUser.ward));
        if (!localStorage.getItem("wardhub_user")) {
          localStorage.setItem("wardhub_user", savedUser);
        }
      } catch {
        // Corrupt saved user would otherwise crash every page; a stale one shows
        // a name that exists nowhere else in the app. Drop either and carry on.
        localStorage.removeItem("wardhub_user");
        localStorage.removeItem("inpatient_hub_user");
        setUser(defaultUser);
      }
    } else {
      setUser(defaultUser);
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
    const savedColorMode = localStorage.getItem("wardhub_color_mode") as ColorMode | null;
    if (savedColorMode) {
      setColorModeState(savedColorMode);
      applyColorMode(savedColorMode);
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

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem("wardhub_color_mode", mode);
    applyColorMode(mode);
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
        colorMode,
        setColorMode,
        isDark,
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
