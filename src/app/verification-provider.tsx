"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VerificationInfo, VerificationStatus } from "@/lib/types";

// Content types that can be verified
export type VerifiableContentType = "bookmark" | "workflow" | "guide";

// Key format: "bookmark:samaritans", "workflow:imha", "guide:news2"
type ContentKey = `${VerifiableContentType}:${string}`;

interface VerificationStore {
  [key: ContentKey]: VerificationInfo;
}

interface VerificationContextType {
  getVerification: (type: VerifiableContentType, id: string) => VerificationInfo;
  verifyContent: (type: VerifiableContentType, id: string, verifiedBy: string) => void;
  getUnverifiedCount: (type?: VerifiableContentType) => number;
  getAllUnverified: (type?: VerifiableContentType) => { type: VerifiableContentType; id: string }[];
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

const STORAGE_KEY = "inpatient-hub-verification";

// Default: all content starts as AI generated
const DEFAULT_VERIFICATION: VerificationInfo = {
  status: "ai_generated" as VerificationStatus,
};

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<VerificationStore>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setStore(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse verification store:", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when store changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  }, [store, isLoaded]);

  const getKey = (type: VerifiableContentType, id: string): ContentKey => {
    return `${type}:${id}` as ContentKey;
  };

  const getVerification = (type: VerifiableContentType, id: string): VerificationInfo => {
    const key = getKey(type, id);
    return store[key] || DEFAULT_VERIFICATION;
  };

  const verifyContent = (type: VerifiableContentType, id: string, verifiedBy: string) => {
    const key = getKey(type, id);
    setStore((prev) => ({
      ...prev,
      [key]: {
        status: "verified" as VerificationStatus,
        verifiedBy,
        verifiedAt: new Date().toISOString(),
      },
    }));
  };

  const getUnverifiedCount = (type?: VerifiableContentType): number => {
    const entries = Object.entries(store);
    if (type) {
      return entries.filter(
        ([key, info]) => key.startsWith(`${type}:`) && info.status !== "verified"
      ).length;
    }
    return entries.filter(([, info]) => info.status !== "verified").length;
  };

  const getAllUnverified = (type?: VerifiableContentType): { type: VerifiableContentType; id: string }[] => {
    const entries = Object.entries(store);
    return entries
      .filter(([key, info]) => {
        if (info.status === "verified") return false;
        if (type && !key.startsWith(`${type}:`)) return false;
        return true;
      })
      .map(([key]) => {
        const [contentType, id] = key.split(":") as [VerifiableContentType, string];
        return { type: contentType, id };
      });
  };

  return (
    <VerificationContext.Provider
      value={{
        getVerification,
        verifyContent,
        getUnverifiedCount,
        getAllUnverified,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error("useVerification must be used within a VerificationProvider");
  }
  return context;
}
