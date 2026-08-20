// Suggestion words the user adds themselves.
//
// Mike's rule (20 Aug 2026): anything that is not lifted from the trust form has
// to be clearly separated from the trust wording, and people must be able to add
// their own words - which, on the live site, should follow the user around.
//
// Today there are no accounts, so this is per device via localStorage. The shape
// is deliberately flat and boring so it can move to a user profile row later
// without a migration: one string array per chip bank.
//
// A bank key is `${risk}::${questionId}` - so a word you add under "early warning
// signs" while planning violence comes back the next time you plan violence, but
// does not leak into an unrelated risk.

const KEY = "wardhub_user_chips";

export type UserChipStore = Record<string, string[]>;

export const bankKey = (risk: string, questionId: string) => `${risk || "generic"}::${questionId}`;

export function loadUserChips(): UserChipStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as UserChipStore) : {};
  } catch {
    return {}; // corrupt or unavailable storage is not worth breaking the tool over
  }
}

export function saveUserChips(store: UserChipStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* private mode / quota - the chip still works for this session */
  }
}

export function addUserChip(risk: string, questionId: string, word: string): UserChipStore {
  const w = word.trim();
  const store = loadUserChips();
  if (!w) return store;
  const k = bankKey(risk, questionId);
  const existing = store[k] || [];
  if (existing.some((x) => x.toLowerCase() === w.toLowerCase())) return store;
  const next = { ...store, [k]: [...existing, w] };
  saveUserChips(next);
  return next;
}

export function removeUserChip(risk: string, questionId: string, word: string): UserChipStore {
  const store = loadUserChips();
  const k = bankKey(risk, questionId);
  const next = { ...store, [k]: (store[k] || []).filter((x) => x !== word) };
  if (!next[k].length) delete next[k];
  saveUserChips(next);
  return next;
}
