import {
  parseStore, isStoredGuide, saveStoredGuide, getStoredGuide, deleteStoredGuide,
  readStoredGuides, slugFromTitle, safeUrl, STORE_KEY, type StoredGuide,
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

describe("safeUrl", () => {
  it("keeps ordinary links", () => {
    ["https://example.org/a", "http://example.org", "mailto:a@b.org", "tel:0800000000", "/guides/news2", "#", ""].forEach((u) =>
      expect(safeUrl(u)).toBe(u)
    );
  });
  it("neutralises anything that can run code or leave the site oddly", () => {
    ["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,x", "vbscript:x", "//evil.example", "file:///c:/x"].forEach((u) =>
      expect(safeUrl(u)).toBe("#")
    );
  });
});

describe("cleaning links on the way in", () => {
  it("rewrites unsafe links anywhere in a stored guide", () => {
    const g = guide("g1") as StoredGuide & { data: { downloads?: { label: string; url: string }[]; focus?: { label: string; url: string }[] } };
    g.data.downloads = [{ label: "Form", url: "javascript:alert(1)" }, { label: "Ok", url: "https://example.org/f.pdf" }];
    g.data.focus = [{ label: "F", url: "data:text/html,x" }];
    const [back] = parseStore(JSON.stringify([g])) as unknown as (typeof g)[];
    expect(back.data.downloads?.map((d) => d.url)).toEqual(["#", "https://example.org/f.pdf"]);
    expect(back.data.focus?.[0].url).toBe("#");
  });
});
