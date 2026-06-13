// Local-date formatter - use this instead of toISOString().split("T")[0],
// which returns the UTC date and drifts a day behind UK time after midnight in summer (BST).
export function toLocalDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
