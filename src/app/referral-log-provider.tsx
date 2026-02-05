"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { ReferralLog, ReferralChase, ReferralLogStatus } from "@/lib/types";

interface ReferralLogContextType {
  referralLogs: ReferralLog[];
  addReferralLog: (log: Omit<ReferralLog, "id" | "chaseHistory">) => void;
  updateReferralLog: (id: string, updates: Partial<ReferralLog>) => void;
  addChaseToLog: (logId: string, chase: Omit<ReferralChase, "id">) => void;
  deleteReferralLog: (id: string) => void;
  getLogsByStatus: (status: ReferralLogStatus) => ReferralLog[];
  getPendingCount: () => number;
}

const ReferralLogContext = createContext<ReferralLogContextType | null>(null);

const STORAGE_KEY = "inpatient-hub-referral-logs";

export function ReferralLogProvider({ children }: { children: ReactNode }) {
  const [referralLogs, setReferralLogs] = useState<ReferralLog[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReferralLogs(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load referral logs:", e);
    }
  }, []);

  // Save to localStorage when logs change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(referralLogs));
  }, [referralLogs]);

  const addReferralLog = useCallback((log: Omit<ReferralLog, "id" | "chaseHistory">) => {
    const newLog: ReferralLog = {
      ...log,
      id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chaseHistory: [],
    };
    setReferralLogs((prev) => [newLog, ...prev]);
  }, []);

  const updateReferralLog = useCallback((id: string, updates: Partial<ReferralLog>) => {
    setReferralLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
    );
  }, []);

  const addChaseToLog = useCallback((logId: string, chase: Omit<ReferralChase, "id">) => {
    const newChase: ReferralChase = {
      ...chase,
      id: `chase-${Date.now()}`,
    };
    setReferralLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              chaseHistory: [...log.chaseHistory, newChase],
              status: "chased" as ReferralLogStatus,
            }
          : log
      )
    );
  }, []);

  const deleteReferralLog = useCallback((id: string) => {
    setReferralLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  const getLogsByStatus = useCallback(
    (status: ReferralLogStatus) => {
      return referralLogs.filter((log) => log.status === status);
    },
    [referralLogs]
  );

  const getPendingCount = useCallback(() => {
    return referralLogs.filter(
      (log) => log.status === "sent" || log.status === "awaiting_response" || log.status === "chased"
    ).length;
  }, [referralLogs]);

  return (
    <ReferralLogContext.Provider
      value={{
        referralLogs,
        addReferralLog,
        updateReferralLog,
        addChaseToLog,
        deleteReferralLog,
        getLogsByStatus,
        getPendingCount,
      }}
    >
      {children}
    </ReferralLogContext.Provider>
  );
}

export function useReferralLog() {
  const context = useContext(ReferralLogContext);
  if (!context) {
    throw new Error("useReferralLog must be used within a ReferralLogProvider");
  }
  return context;
}
