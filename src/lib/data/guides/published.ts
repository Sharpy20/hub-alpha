// Guides PUBLISHED from the editor (25 Oct 2026, the 3.0 publishing route).
//
// 3.0 has no database. An author writes a guide in the editor, downloads it,
// and sends the file to the publisher. The publisher runs
//   npm run publish-guide -- <downloaded file>
// which merges it into published.json, and the guide is live on the next
// deploy. Nothing else changes: a published guide replaces the built-in guide
// with the same id, or adds a new one, everywhere the site shows guides.
//
// published.json holds exactly what the editor downloads (StoredGuide records),
// so the file that was sent IS the record of what went live. To take a
// published guide down, delete its entry and the built-in version returns.
//
// src/__tests__/published-guides.test.ts fails the build if an entry is not a
// valid guide, has broken branching, or collides with the other kind, so a
// bad file cannot reach a reader.

import raw from "./published.json";
import { parseStore, type StoredGuide } from "./guide-store";
import type { GuideItem } from "./catalog";

// Same checks and link cleaning as a guide loaded from the editor's store.
export function readPublished(value: unknown): StoredGuide[] {
  return parseStore(JSON.stringify(value));
}

export const PUBLISHED: StoredGuide[] = readPublished(raw);

// The guides index with published guides applied: a published copy of a
// built-in guide updates its card in place, a new guide is added at the end.
export function withPublished(builtIn: GuideItem[], published: StoredGuide[] = PUBLISHED): GuideItem[] {
  const byId = new Map(published.map((g) => [g.id, g] as const));
  const card = (g: StoredGuide): GuideItem => ({
    id: g.id,
    title: g.data.title,
    description: g.data.description,
    icon: g.look.icon,
    gradient: g.look.gradient,
    category: g.look.category,
    viewerPath: `/guides/${g.id}`,
  });
  const updated = builtIn.map((item) => {
    const pub = byId.get(item.id);
    // Keep the built-in viewer path: a static-route guide stays on its route.
    return pub ? { ...card(pub), viewerPath: item.viewerPath } : item;
  });
  const added = published.filter((g) => !builtIn.some((b) => b.id === g.id)).map(card);
  return [...updated, ...added];
}
