import {
  parseStore, isStoredGuide, saveStoredGuide, getStoredGuide, deleteStoredGuide,
  readStoredGuides, slugFromTitle, STORE_KEY, type StoredGuide,
} from "@/lib/data/guides/guide-store";

const guide = (id: string, title = "A guide"): StoredGuide => ({
  kind: "guide",
  id,
  look: { icon: "x", gradient: "from-blue-500 to-blue-700", category: "Nurse Tools" },
  updatedAt: "2026-09-29T10:00:00.000Z",
  data: { id, title, description: "d", steps: [{ id: "s1", title: "One", content: "Text" }] },
});

beforeEach(() => localStorage.clear());

describe("parseStore", () => {
  it("returns nothing for empty, broken or non-array input", () => {
    expect(parseStore(null)).toEqual([]);
    expect(parseStore("")).toEqual([]);
    expect(parseStore("{not json")).toEqual([]);
    expect(parseStore('{"id":"x"}')).toEqual([]);
  });

  it("keeps good guides and skips malformed ones instead of failing", () => {
    const good = guide("good");
    const bad = { id: "bad", kind: "guide", look: {}, data: { steps: "nope" } };
    expect(parseStore(JSON.stringify([bad, good, null, 4]))).toEqual([good]);
  });

  it("skips a guide whose steps are missing text", () => {
    const broken = guide("broken");
    (broken.data.steps[0] as unknown as Record<string, unknown>).content = undefined;
    expect(isStoredGuide(broken)).toBe(false);
  });
});

describe("saving and reading", () => {
  it("round-trips a guide through the browser", () => {
    expect(saveStoredGuide(guide("g1"))).toBe(true);
    expect(getStoredGuide("g1")?.data.title).toBe("A guide");
  });

  it("replaces a guide with the same id rather than duplicating it", () => {
    saveStoredGuide(guide("g1", "First"));
    saveStoredGuide(guide("g1", "Second"));
    const all = readStoredGuides();
    expect(all).toHaveLength(1);
    expect(all[0].data.title).toBe("Second");
  });

  it("stamps the save time", () => {
    saveStoredGuide(guide("g1"));
    expect(getStoredGuide("g1")?.updatedAt).not.toBe("2026-09-29T10:00:00.000Z");
  });

  it("deletes one guide and leaves the others", () => {
    saveStoredGuide(guide("g1"));
    saveStoredGuide(guide("g2"));
    deleteStoredGuide("g1");
    expect(readStoredGuides().map((g) => g.id)).toEqual(["g2"]);
  });

  it("survives corrupted storage", () => {
    localStorage.setItem(STORE_KEY, "garbage");
    expect(readStoredGuides()).toEqual([]);
    expect(saveStoredGuide(guide("g1"))).toBe(true);
    expect(readStoredGuides()).toHaveLength(1);
  });
});

describe("slugFromTitle", () => {
  it("makes a tidy url-safe id", () => {
    expect(slugFromTitle("  Section 17: Leave & Recall!  ")).toBe("section-17-leave-recall");
  });
  it("copes with an empty title", () => {
    expect(slugFromTitle("!!!")).toBe("");
  });
});
