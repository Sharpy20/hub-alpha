"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WARDS as WARD_DATA } from "@/lib/types";

// Extract ward IDs for validation and display
const WARD_IDS = WARD_DATA.map(w => w.id);
// Convert ward ID to display name (capitalize first letter)
const capitalizeWard = (ward: string): string => {
  return ward.charAt(0).toUpperCase() + ward.slice(1);
};

// Version types
export type AppVersion = "light" | "medium" | "max" | "max_plus";
export type UserRole = "normal" | "ward_admin" | "contributor" | "senior_admin";

// User context
interface User {
  name: string;
  role: UserRole;
  ward: string;
}

interface AppContextType {
  version: AppVersion;
  setVersion: (version: AppVersion) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  hasFeature: (feature: FeatureFlag) => boolean;
  gdprAccepted: boolean;
  setGdprAccepted: (accepted: boolean) => void;
  // Active ward for viewing (separate from user's home ward)
  activeWard: string;
  setActiveWard: (ward: string) => void;
  allWards: readonly string[];
}

// Feature flags
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
  | "systemon_sync"
  | "systemon_notes"
  | "user_management"
  | "audit_logs";

// Feature availability by version
const featureMatrix: Record<AppVersion, FeatureFlag[]> = {
  light: [
    "bookmarks",
    "bookmarks_focus",
    "workflows",
    "guides",
  ],
  medium: [
    "bookmarks",
    "bookmarks_focus",
    "workflows",
    "workflows_internal",
    "guides",
    "guides_internal",
    "ward_tasks",
    "user_management",
    "audit_logs",
  ],
  max: [
    "bookmarks",
    "bookmarks_focus",
    "workflows",
    "workflows_internal",
    "guides",
    "guides_internal",
    "ward_tasks",
    "patient_tasks",
    "patient_list",
    "discharge_flow",
    "user_management",
    "audit_logs",
  ],
  max_plus: [
    "bookmarks",
    "bookmarks_focus",
    "workflows",
    "workflows_internal",
    "guides",
    "guides_internal",
    "ward_tasks",
    "patient_tasks",
    "patient_list",
    "discharge_flow",
    "systemon_sync",
    "systemon_notes",
    "user_management",
    "audit_logs",
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  // Get version from env or localStorage, default to light
  const envVersion = (process.env.NEXT_PUBLIC_APP_VERSION as AppVersion) || "light";
  const [version, setVersionState] = useState<AppVersion>(envVersion);

  const [user, setUser] = useState<User | null>(null);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  // Active ward state - defaults to user's ward or first ward (capitalized)
  const [activeWard, setActiveWardState] = useState<string>(capitalizeWard(WARD_IDS[0]));

  // Load version override from localStorage
  useEffect(() => {
    const savedVersion = localStorage.getItem("inpatient_hub_version");
    if (savedVersion && ["light", "medium", "max", "max_plus"].includes(savedVersion)) {
      setVersionState(savedVersion as AppVersion);
    }
  }, []);

  const setVersion = (newVersion: AppVersion) => {
    setVersionState(newVersion);
    localStorage.setItem("inpatient_hub_version", newVersion);
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("inpatient_hub_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Set active ward to user's ward when loading user (capitalize for display)
      setActiveWardState(capitalizeWard(parsedUser.ward));
    }
    const savedGdpr = localStorage.getItem("inpatient_hub_gdpr");
    if (savedGdpr === "true") {
      setGdprAccepted(true);
    }
    // Also try to load saved active ward (already capitalized in storage)
    const savedActiveWard = localStorage.getItem("inpatient_hub_active_ward");
    if (savedActiveWard) {
      setActiveWardState(savedActiveWard);
    }
  }, []);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("inpatient_hub_user", JSON.stringify(user));
      // When user logs in, set active ward to their ward (capitalize for display)
      setActiveWardState(capitalizeWard(user.ward));
    } else {
      localStorage.removeItem("inpatient_hub_user");
    }
  }, [user]);

  // Save GDPR acceptance
  useEffect(() => {
    if (gdprAccepted) {
      localStorage.setItem("inpatient_hub_gdpr", "true");
    }
  }, [gdprAccepted]);

  // Save active ward to localStorage
  const setActiveWard = (ward: string) => {
    setActiveWardState(ward);
    localStorage.setItem("inpatient_hub_active_ward", ward);
  };

  const hasFeature = (feature: FeatureFlag): boolean => {
    return featureMatrix[version].includes(feature);
  };

  return (
    <AppContext.Provider
      value={{
        version,
        setVersion,
        user,
        setUser,
        hasFeature,
        gdprAccepted,
        setGdprAccepted,
        activeWard,
        setActiveWard,
        allWards: WARD_IDS.map(capitalizeWard),
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
