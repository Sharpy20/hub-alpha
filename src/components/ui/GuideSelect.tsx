"use client";

import { useMemo } from "react";
import { ALL_GUIDES } from "@/lib/data/guides/catalog";

// Words too common to be useful for matching a guide to a task title.
const STOPWORDS = new Set([
  "the", "and", "for", "with", "patient", "this", "that", "task", "please",
  "complete", "completed", "new", "add", "get", "done", "from", "into", "your",
]);

// Suggest up to 5 guides whose title/description/category best match the task
// wording (simple keyword overlap; title hits weigh more).
function suggestGuides(text: string): typeof ALL_GUIDES {
  const tokens = (text || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
  if (!tokens.length) return [];
  const scored = ALL_GUIDES.map((g) => {
    const title = g.title.toLowerCase();
    const hay = `${title} ${g.description} ${g.category}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (title.includes(t)) score += 2;
      else if (hay.includes(t)) score += 1;
    }
    return { g, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return scored.map((x) => x.g);
}

// A <select> listing every guide, grouped by category (optgroups). Used by the
// task modals so a task can link to any guide, not a short hardcoded list.
// When `suggestFrom` is passed (the task wording), the best 4-5 matches are
// shown in a "Suggested" group at the top.
export function GuideSelect({
  value,
  onChange,
  placeholder = "No linked guide",
  className,
  suggestFrom,
}: {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
  suggestFrom?: string;
}) {
  const suggestions = useMemo(() => suggestGuides(suggestFrom || ""), [suggestFrom]);

  // Group guides by category, preserving first-seen category order.
  const order: string[] = [];
  const byCategory = new Map<string, typeof ALL_GUIDES>();
  for (const g of ALL_GUIDES) {
    if (!byCategory.has(g.category)) {
      byCategory.set(g.category, []);
      order.push(g.category);
    }
    byCategory.get(g.category)!.push(g);
  }

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value="">{placeholder}</option>
      {suggestions.length > 0 && (
        <optgroup label="Suggested for this task">
          {suggestions.map((g) => (
            <option key={`sug-${g.id}`} value={g.id}>
              {g.title}
            </option>
          ))}
        </optgroup>
      )}
      {order.map((cat) => (
        <optgroup key={cat} label={cat}>
          {byCategory.get(cat)!.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
