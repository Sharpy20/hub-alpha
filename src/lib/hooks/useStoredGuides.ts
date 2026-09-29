"use client";

import { useEffect, useState } from "react";
import { readStoredGuides, STORE_EVENT, STORE_KEY, type StoredGuide } from "@/lib/data/guides/guide-store";

// Authored guides, kept in step with the store. `ready` is false until the
// first read from the browser, so a page can tell "not found" from "not loaded
// yet" and avoid flashing the wrong guide.
export function useStoredGuides(): { guides: StoredGuide[]; ready: boolean } {
  const [guides, setGuides] = useState<StoredGuide[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => setGuides(readStoredGuides());
    refresh();
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORE_KEY || e.key === null) refresh();
    };
    window.addEventListener(STORE_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(STORE_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { guides, ready };
}
