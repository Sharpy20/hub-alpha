"use client";

import { ALL_GUIDES } from "@/lib/data/guides/catalog";

// A <select> listing every guide, grouped by category (optgroups). Used by the
// task modals so a task can link to any guide, not a short hardcoded list.
export function GuideSelect({
  value,
  onChange,
  placeholder = "No linked guide",
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}) {
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
