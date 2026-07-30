// ---------------------------------------------------------------------------
// BARRIER CATEGORIES
//
// A barrier to discharge is just an outstanding job with `blocksDischarge` set,
// so the data is a by-product of the diary rather than a second thing to keep
// up to date. What was missing was a way to GROUP them: /overview used to rank
// "most common barriers" by job title, which is fine on demo data where the
// titles are reused on purpose, and mush on real data where one nurse types
// "Chase social care" and the next types "chase SW".
//
// So barriers carry a category, picked from a short list when the flag is set.
// It is OPTIONAL - a job flagged without one still counts everywhere, it just
// lands in "not categorised". Making it mandatory would put a dropdown between
// a nurse and flagging something urgent, which is the wrong trade.
//
// The wording follows national delayed-discharge reason language closely enough
// that a bed manager recognises it, without pretending to be an exact mapping.
// ---------------------------------------------------------------------------

/**
 * Who the ward is actually waiting on.
 *
 * `external` means the next move belongs to someone outside the ward - the
 * local authority, a funding panel, a placement, a family. `ward` means it is
 * ours to shift. That split is the whole point of the categories: "21 of 25
 * barriers are waiting on someone outside the ward" is a very different
 * conversation to "21 of 25 are ours".
 *
 * Family and patient choice counts as `external`. It is not the ward's to fix,
 * and lumping it in with internal decisions would overstate what the ward can
 * do about its own numbers.
 */
export type BarrierOwner = "ward" | "external";

export type BarrierCategory =
  | "housing"
  | "social-care"
  | "funding"
  | "placement"
  | "transport-equipment"
  | "family-legal"
  | "internal-clinical"
  | "other";

export interface BarrierCategoryMeta {
  /** Full label, used in the picker and the print sheet. */
  label: string;
  /** Short label for chips and table cells, where space is tight. */
  short: string;
  owner: BarrierOwner;
  /** Tailwind classes for the chip. Kept here so every surface matches. */
  chip: string;
  /** Solid dot colour, for the print sheet and compact rows. */
  dot: string;
}

export const BARRIER_CATEGORIES: Record<BarrierCategory, BarrierCategoryMeta> = {
  housing: {
    label: "Housing",
    short: "Housing",
    owner: "external",
    chip: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "#c2410c",
  },
  "social-care": {
    label: "Social care assessment or package",
    short: "Social care",
    owner: "external",
    chip: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "#7e22ce",
  },
  funding: {
    label: "Funding or DST decision",
    short: "Funding",
    owner: "external",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "#be123c",
  },
  placement: {
    label: "Placement search",
    short: "Placement",
    owner: "external",
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "#a16207",
  },
  "transport-equipment": {
    label: "Transport or equipment",
    short: "Transport",
    owner: "external",
    chip: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "#0f766e",
  },
  "family-legal": {
    label: "Family, patient choice or legal",
    short: "Family or legal",
    owner: "external",
    chip: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "#0369a1",
  },
  "internal-clinical": {
    label: "Internal clinical decision",
    short: "Internal",
    owner: "ward",
    chip: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "#4338ca",
  },
  other: {
    label: "Other",
    short: "Other",
    owner: "ward",
    chip: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "#4b5563",
  },
};

/** Picker order. `other` sits last so it reads as the fallback it is. */
export const BARRIER_CATEGORY_ORDER: BarrierCategory[] = [
  "housing",
  "social-care",
  "funding",
  "placement",
  "transport-equipment",
  "family-legal",
  "internal-clinical",
  "other",
];

export function barrierCategoryMeta(
  category: BarrierCategory | undefined
): BarrierCategoryMeta | null {
  if (!category) return null;
  return BARRIER_CATEGORIES[category] ?? null;
}

/** How a barrier with no category set should read. */
export const UNCATEGORISED_LABEL = "Not categorised";
