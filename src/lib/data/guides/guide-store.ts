// Where guides written in the editor live.
//
// This is the seam the real back end plugs into. Everything that reads or writes
// an authored guide goes through the functions here, so swapping localStorage
// for Azure SQL later means rewriting this file and nothing else. Until then a
// guide saved in the editor exists in this browser only.

import type { GuideData } from "./howto-guides";
import type { WorkflowData } from "./referral-workflows";

export interface GuideLook {
  icon: string;
  gradient: string;
  category: string;
}

interface StoredBase {
  id: string;
  look: GuideLook;
  updatedAt: string;
  // The built-in guide this was copied from, so the editor can offer "put it back".
  basedOn?: string;
}

export interface StoredHowTo extends StoredBase {
  kind: "guide";
  data: GuideData;
}

export interface StoredWorkflow extends StoredBase {
  kind: "workflow";
  data: WorkflowData;
}

export type StoredGuide = StoredHowTo | StoredWorkflow;

export const STORE_KEY = "wardhub_custom_guides";
export const STORE_EVENT = "wardhub-guides-changed";

const isString = (v: unknown): v is string => typeof v === "string";
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

// A saved guide from an older build, or a hand-edited one, must never take the
// viewer down. Anything that does not have the bones of a guide is skipped.
export function isStoredGuide(v: unknown): v is StoredGuide {
  if (!isObject(v) || !isString(v.id) || !isObject(v.look) || !isObject(v.data)) return false;
  if (v.kind !== "guide" && v.kind !== "workflow") return false;
  const look = v.look;
  if (!isString(look.icon) || !isString(look.gradient) || !isString(look.category)) return false;
  const data = v.data;
  if (!isString(data.id) || !isString(data.title) || !Array.isArray(data.steps)) return false;
  return data.steps.every((s) => isObject(s) && isString(s.id) && isString(s.title) && isString(s.content));
}

export function parseStore(raw: string | null): StoredGuide[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isStoredGuide) : [];
  } catch {
    return [];
  }
}

export function readStoredGuides(): StoredGuide[] {
  try {
    return parseStore(localStorage.getItem(STORE_KEY));
  } catch {
    return [];
  }
}

function write(list: StoredGuide[]): boolean {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(STORE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function saveStoredGuide(guide: StoredGuide): boolean {
  const others = readStoredGuides().filter((g) => g.id !== guide.id);
  return write([...others, { ...guide, updatedAt: new Date().toISOString() }]);
}

export function deleteStoredGuide(id: string): boolean {
  return write(readStoredGuides().filter((g) => g.id !== id));
}

export function getStoredGuide(id: string): StoredGuide | undefined {
  return readStoredGuides().find((g) => g.id === id);
}

// A URL-safe id from a title. The editor locks it once the guide is saved, so
// links to a guide do not break when its title is tidied up.
export function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
