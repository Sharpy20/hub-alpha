"use client";

import { useEffect, useState } from "react";
import { PAY_BANDS, PAY_BAND_STORAGE_KEY } from "@/lib/data/guides/pay-scales";

// Shared band/step selection for the pay widgets (band picker + shift
// checker). Persisted per device so a band picked in one widget is
// remembered by the other - and on the next visit.
export function usePayBand() {
  const [bandIdx, setBandIdx] = useState<number | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PAY_BAND_STORAGE_KEY);
      if (saved) {
        const { b, s } = JSON.parse(saved);
        if (typeof b === "number" && PAY_BANDS[b] && typeof s === "number" && PAY_BANDS[b].steps[s]) {
          setBandIdx(b);
          setStepIdx(s);
        }
      }
    } catch { /* corrupt value - start fresh */ }
  }, []);

  const select = (b: number, s: number) => {
    setBandIdx(b);
    setStepIdx(s);
    try { localStorage.setItem(PAY_BAND_STORAGE_KEY, JSON.stringify({ b, s })); } catch { /* private mode */ }
  };

  const band = bandIdx !== null ? PAY_BANDS[bandIdx] : null;
  const step = band ? band.steps[Math.min(stepIdx, band.steps.length - 1)] : null;

  return { bandIdx, stepIdx, band, step, select };
}
