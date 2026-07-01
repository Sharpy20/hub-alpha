"use client";

// Simple per-guide usage feedback - "Was this helpful?" 👍/👎.
// Stored per-device in localStorage (wardhub_guide_feedback). No PII, no backend.
// In the full/live build this is where a real feedback counter would report to the
// team; for now it captures the signal locally and thanks the user.

import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const KEY = "wardhub_guide_feedback";
type Vote = "up" | "down" | null;

export function GuideFeedback({ guideId }: { guideId: string }) {
  const [vote, setVote] = useState<Vote>(null);

  useEffect(() => {
    try {
      const m = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (m[guideId] === "up" || m[guideId] === "down") setVote(m[guideId]);
    } catch { /* ignore corrupt value */ }
  }, [guideId]);

  const choose = (v: "up" | "down") => {
    const next: Vote = vote === v ? null : v;
    setVote(next);
    try {
      const m = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (next) m[guideId] = next; else delete m[guideId];
      localStorage.setItem(KEY, JSON.stringify(m));
    } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-5 border-t border-gray-100 mt-4">
      <span className="text-sm text-gray-500">Was this guide helpful?</span>
      <button
        onClick={() => choose("up")}
        aria-pressed={vote === "up"}
        aria-label="Helpful"
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
          vote === "up" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50"
        }`}
      >
        <ThumbsUp className="w-4 h-4" /> Yes
      </button>
      <button
        onClick={() => choose("down")}
        aria-pressed={vote === "down"}
        aria-label="Not helpful"
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
          vote === "down" ? "bg-rose-600 border-rose-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:bg-rose-50"
        }`}
      >
        <ThumbsDown className="w-4 h-4" /> No
      </button>
      {vote && <span className="text-xs text-gray-400">Thanks for the feedback</span>}
    </div>
  );
}
