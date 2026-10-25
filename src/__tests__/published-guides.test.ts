/**
 * The 3.0 publishing route (25 Oct 2026).
 *
 * 3.0 has no database: an author downloads a guide from the editor, the
 * publisher merges the file into published.json, and the guide goes live on
 * the next deploy. This test is the gate on that file. A published guide that
 * is malformed, has broken branching, or would be mistaken for the other kind
 * of guide fails the build here, before a reader can see it.
 *
 * It also proves the plumbing: a published guide really does replace the
 * built-in with the same id, everywhere the site reads guides.
 */
import raw from "@/lib/data/guides/published.json";
import { readPublished, withPublished } from "@/lib/data/guides/published";
import { validateBranching } from "@/lib/data/guides/branching";
import type { GuideItem } from "@/lib/data/guides/catalog";
import type { StoredGuide } from "@/lib/data/guides/guide-store";

const entries = raw as unknown[];

describe("published.json, the file that goes live", () => {
  const published = readPublished(entries);

  it("holds only valid guides - none is silently dropped", () => {
    // readPublished skips anything malformed, so a shorter list means a bad
    // entry that would otherwise just not appear.
    expect(published).toHaveLength(entries.length);
  });

  it("has each guide once", () => {
    const ids = published.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps each guide's data id the same as its id", () => {
    for (const g of published) expect(g.data.id).toBe(g.id);
  });

  it("has no broken branching in any published guide", () => {
    for (const g of published) {
      expect({ id: g.id, errors: validateBranching(g.data.steps) }).toEqual({ id: g.id, errors: [] });
    }
  });

  it("never publishes a how-to over a referral, or a referral over a how-to", () => {
    // The viewer decides how to show a guide by which list holds its id, so
    // one id in both lists would show the wrong kind of guide.
    jest.isolateModules(() => {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { GUIDES } = require("@/lib/data/guides/howto-guides");
      const { WORKFLOWS } = require("@/lib/data/guides/referral-workflows");
      /* eslint-enable @typescript-eslint/no-require-imports */
      for (const g of published) {
        if (g.kind === "guide") expect(WORKFLOWS[g.id]).toBeUndefined();
        else expect(GUIDES[g.id]).toBeUndefined();
      }
    });
  });
});

// Two fixtures standing in for downloaded files: an edited copy of a built-in
// guide (news2) and a brand new guide.
const look = { icon: "📘", gradient: "from-blue-500 to-blue-700", category: "Physical Health" };
const editedNews2: StoredGuide = {
  id: "news2",
  kind: "guide",
  look,
  updatedAt: "2026-10-25T10:00:00.000Z",
  basedOn: "news2",
  data: {
    id: "news2",
    title: "NEWS2 Observations (edited)",
    description: "An edited copy",
    steps: [{ id: "s1", title: "Only step", content: "Edited text." }],
  },
};
const brandNew: StoredGuide = {
  id: "brand-new-guide",
  kind: "guide",
  look,
  updatedAt: "2026-10-25T10:00:00.000Z",
  data: {
    id: "brand-new-guide",
    title: "A brand new guide",
    description: "Written in the editor",
    steps: [{ id: "s1", title: "Step one", content: "Text." }],
  },
};

describe("withPublished, the guides index", () => {
  const builtIn: GuideItem[] = [
    { id: "news2", title: "NEWS2 Observations", description: "Old", icon: "x", gradient: "g", category: "Physical Health", viewerPath: "/guides/news2" },
    { id: "mha-checker", title: "Section Papers", description: "Static route", icon: "y", gradient: "g", category: "Legal & Advocacy", viewerPath: "/guides/mha-checker" },
  ];

  it("updates an edited guide's card in place and adds a new guide at the end", () => {
    const out = withPublished(builtIn, [editedNews2, brandNew]);
    expect(out.map((g) => g.id)).toEqual(["news2", "mha-checker", "brand-new-guide"]);
    expect(out[0].title).toBe("NEWS2 Observations (edited)");
    expect(out[1]).toEqual(builtIn[1]);
    expect(out[2].viewerPath).toBe("/guides/brand-new-guide");
  });

  it("changes nothing when nothing is published", () => {
    expect(withPublished(builtIn, [])).toEqual(builtIn);
  });
});

describe("a published guide goes live everywhere guides are read", () => {
  function loadWith(published: StoredGuide[]) {
    let mods!: { GUIDES: Record<string, { title: string }>; ALL_GUIDES: GuideItem[] };
    jest.isolateModules(() => {
      jest.doMock("@/lib/data/guides/published.json", () => published);
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { GUIDES } = require("@/lib/data/guides/howto-guides");
      const { ALL_GUIDES } = require("@/lib/data/guides/catalog");
      /* eslint-enable @typescript-eslint/no-require-imports */
      mods = { GUIDES, ALL_GUIDES };
    });
    return mods;
  }

  it("replaces the built-in guide with the same id, in the data and the index", () => {
    const { GUIDES, ALL_GUIDES } = loadWith([editedNews2]);
    expect(GUIDES.news2.title).toBe("NEWS2 Observations (edited)");
    expect(ALL_GUIDES.find((g) => g.id === "news2")?.title).toBe("NEWS2 Observations (edited)");
  });

  it("adds a new guide to the data and the index", () => {
    const { GUIDES, ALL_GUIDES } = loadWith([brandNew]);
    expect(GUIDES["brand-new-guide"].title).toBe("A brand new guide");
    expect(ALL_GUIDES.some((g) => g.id === "brand-new-guide")).toBe(true);
  });

  it("neutralises an unsafe link in a published file, as the editor does", () => {
    const risky = {
      ...brandNew,
      data: { ...brandNew.data, focus: [{ label: "Bad", url: "javascript:alert(1)" }] },
    } as StoredGuide;
    const [clean] = readPublished([risky]);
    expect((clean.data as { focus: { url: string }[] }).focus[0].url).toBe("#");
  });
});
