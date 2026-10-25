/**
 * @jest-environment node
 *
 * Routing and the password gate.
 *
 * proxy.ts runs before every page and is the ONLY thing between a visitor and
 * the whole site - there are no user accounts. It also owns the limited/full
 * build split, which is currently dormant: COLLAPSED_FOR_DEMO is true, so
 * nothing exercises that half in normal use. Flipping it back for a compliance
 * conversation would mean trusting logic that has not run in weeks. So both
 * modes are tested here, not just the one that is live.
 *
 * The flag is read at module load, so each mode re-imports the module with the
 * config faked.
 */
import { NextRequest } from "next/server";

type ProxyFn = (req: NextRequest) => { status: number; headers: Headers };

function loadProxy(collapsed: boolean): ProxyFn {
  let proxy!: ProxyFn;
  jest.isolateModules(() => {
    jest.doMock("@/lib/config/build", () => ({ COLLAPSED_FOR_DEMO: collapsed }));
    // Required, not imported: the module has to be re-evaluated inside the mock
    // so it picks up the faked flag, which it reads once at load.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    proxy = (require("@/proxy") as { proxy: ProxyFn }).proxy;
  });
  return proxy;
}

function request(path: string, { authed = true } = {}): NextRequest {
  const req = new NextRequest(new URL(`https://wardhub.live${path}`));
  if (authed) req.cookies.set("site_access", "granted");
  return req;
}

/** Where a redirect or rewrite actually points, ignoring the origin. */
const target = (res: { headers: Headers }) => {
  const loc = res.headers.get("location") ?? res.headers.get("x-middleware-rewrite");
  return loc ? new URL(loc).pathname : null;
};

const isRedirect = (res: { status: number }) => res.status === 307 || res.status === 308;
const isRewrite = (res: { headers: Headers }) => !!res.headers.get("x-middleware-rewrite");

describe("password gate", () => {
  const proxy = loadProxy(true);

  it("sends a visitor with no cookie to the password page", () => {
    const res = proxy(request("/tasks", { authed: false }));
    expect(isRedirect(res)).toBe(true);
    expect(target(res)).toBe("/password");
  });

  it("guards the home page too, not just the deep links", () => {
    expect(target(proxy(request("/", { authed: false })))).toBe("/password");
  });

  it("lets a visitor with the cookie through", () => {
    const res = proxy(request("/tasks"));
    expect(target(res)).not.toBe("/password");
  });

  it("rejects a cookie that is present but not granted", () => {
    const req = new NextRequest(new URL("https://wardhub.live/tasks"));
    req.cookies.set("site_access", "nope");
    expect(target(proxy(req))).toBe("/password");
  });

  it("lets the gate page and its verify API through unauthenticated", () => {
    expect(target(proxy(request("/password", { authed: false })))).not.toBe("/password");
    expect(
      target(proxy(request("/api/auth/verify-password", { authed: false })))
    ).not.toBe("/password");
  });

  it("lets build assets through unauthenticated", () => {
    expect(target(proxy(request("/_next/static/chunk.js", { authed: false })))).not.toBe("/password");
    expect(target(proxy(request("/favicon.ico", { authed: false })))).not.toBe("/password");
  });

  /**
   * Documents today's behaviour rather than endorsing it. Any path containing a
   * dot skips the gate, which is wider than "static assets" - /tasks.x would too.
   * BACKLOG has replacing this with an explicit match, deferred past the 30 Jul
   * demo. If that lands, this expectation should flip, deliberately.
   */
  it("currently lets ANY path containing a dot skip the gate", () => {
    expect(target(proxy(request("/anything.txt", { authed: false })))).not.toBe("/password");
  });
});

describe("parked routes", () => {
  const proxy = loadProxy(true);

  it("redirects the parked Welcome tool home", () => {
    expect(target(proxy(request("/welcome")))).toBe("/");
    expect(target(proxy(request("/welcome/step-2")))).toBe("/");
  });
});

describe("collapsed for the demo (COLLAPSED_FOR_DEMO = true, dormant since 8 Sept)", () => {
  const proxy = loadProxy(true);

  it("serves the full build at the root - no PII route is blocked", () => {
    for (const path of ["/tasks", "/patients", "/overview", "/reports", "/staff", "/my-tasks"]) {
      const res = proxy(request(path));
      expect(target(res)).not.toBe("/");
    }
  });

  it("sends an old /v2 link to the same page at the root", () => {
    expect(target(proxy(request("/v2/guides/imha-advocacy")))).toBe("/guides/imha-advocacy");
    expect(target(proxy(request("/v2")))).toBe("/");
  });

  it("resolves legacy names on the way, so an old /v2 bookmark still lands", () => {
    expect(target(proxy(request("/v2/bookmarks")))).toBe("/links");
    expect(target(proxy(request("/v2/referrals/imha-advocacy")))).toBe("/guides/imha-advocacy");
  });
});

// Inverted 8 Sept 2026: the FULL product is now the root and the stripped,
// PII-free build lives under /v2. Before that it was the other way round, so
// these assertions read backwards against anything written earlier.
describe("the split (COLLAPSED_FOR_DEMO = false, the live setting since 8 Sept)", () => {
  const proxy = loadProxy(false);

  // Keep in sync with FULL_ONLY_PREFIXES in src/proxy.ts.
  const PII_ROUTES = [
    "/diary",
    "/tasks",
    "/my-diary",
    "/my-tasks",
    "/patients",
    "/overview",
    "/reports",
    "/data-sources",
    "/staff",
  ];

  it("serves the full build at the root - no PII route is blocked", () => {
    for (const path of PII_ROUTES) {
      expect(target(proxy(request(path)))).not.toBe("/");
    }
  });

  // The one that matters: /v2 is what gets handed to people who must not see
  // patient data, so every PII route has to bounce, and bounce to /v2 rather
  // than the root - landing them on the root would drop them into the full build.
  it("blocks every PII route under /v2 and keeps the user inside /v2", () => {
    for (const path of PII_ROUTES) {
      const res = proxy(request("/v2" + path));
      expect(isRedirect(res)).toBe(true);
      expect(target(res)).toBe("/v2");
    }
  });

  it("leaves the shared routes reachable under /v2", () => {
    for (const path of ["/guides", "/links", "/about", "/patient-guides"]) {
      const res = proxy(request("/v2" + path));
      expect(isRewrite(res)).toBe(true);
      expect(target(res)).toBe(path);
    }
  });

  it("keeps the /v2 prefix on legacy redirects, so the prefix is not silently dropped", () => {
    expect(target(proxy(request("/v2/bookmarks")))).toBe("/v2/links");
    expect(target(proxy(request("/v2/referrals/imha-advocacy")))).toBe("/v2/guides/imha-advocacy");
  });

  it("maps bare /v2 to the root page", () => {
    expect(target(proxy(request("/v2")))).toBe("/");
  });
});

// 3.0, the guides-only edition (25 Oct 2026). An allowlist rather than a
// blocklist, so these tests check both what is in and that a route nobody has
// listed stays out. It runs the same whichever way the demo collapse is set.
describe("3.0, the guides-only edition", () => {
  for (const collapsed of [false, true]) {
    describe(`with COLLAPSED_FOR_DEMO = ${collapsed}`, () => {
      const proxy = loadProxy(collapsed);

      // The dot in "3.0" would otherwise let every 3.0 page skip the password.
      it("is behind the password gate despite the dot in its name", () => {
        for (const path of ["/3.0", "/3.0/guides", "/3.0/guides/imha-advocacy"]) {
          expect(target(proxy(request(path, { authed: false })))).toBe("/password");
        }
      });

      it("serves the guides, links, leaflets, editor and its own pages", () => {
        for (const path of [
          "/guides",
          "/guides/imha-advocacy",
          "/guides/news2",
          "/guides/admission-checklist",
          "/guides/leave-discharge-transfer",
          "/guides/mha-checker",
          "/links",
          "/patient-guides",
          "/patient-guides/anxiety",
          "/admin/guides",
          "/about",
          "/feedback",
        ]) {
          const res = proxy(request("/3.0" + path));
          expect(isRewrite(res)).toBe(true);
          expect(target(res)).toBe(path);
        }
      });

      // The full privacy page talks about the diary and patients. 3.0 answers
      // the same question on its own About page.
      it("answers the privacy page from the 3.0 About page", () => {
        const res = proxy(request("/3.0/gdpr"));
        expect(isRedirect(res)).toBe(true);
        expect(target(res)).toBe("/3.0/about");
        expect(res.headers.get("location")).toContain("#privacy");
      });

      it("maps bare /3.0 to the root page", () => {
        const res = proxy(request("/3.0"));
        expect(isRewrite(res)).toBe(true);
        expect(target(res)).toBe("/");
      });

      it("sends every diary, patient and staff route back to the 3.0 home", () => {
        for (const path of [
          "/diary", "/tasks", "/my-diary", "/my-tasks", "/patients", "/overview",
          "/reports", "/data-sources", "/staff", "/login",
        ]) {
          const res = proxy(request("/3.0" + path));
          expect(isRedirect(res)).toBe(true);
          expect(target(res)).toBe("/3.0");
        }
      });

      it("keeps out everything that is not on the list, including the extras", () => {
        for (const path of [
          "/quiz", "/service-map", "/dev-panel", "/admin", "/admin/links",
          "/admin/ward-settings", "/faq", "/intro-guide", "/welcome", "/something-new",
        ]) {
          expect(target(proxy(request("/3.0" + path)))).toBe("/3.0");
        }
      });

      it("sends the eight tools that are not in 3.0 to the guides list", () => {
        for (const id of [
          "risk-assessment", "care-plan", "safety-plan", "mental-state-exam",
          "debrief", "observation-engagement", "restraint-monitoring", "seclusion-support-plan",
        ]) {
          const res = proxy(request(`/3.0/guides/${id}`));
          expect(isRedirect(res)).toBe(true);
          expect(target(res)).toBe("/3.0/guides");
        }
      });

      it("keeps the /3.0 prefix on legacy redirects", () => {
        expect(target(proxy(request("/3.0/bookmarks")))).toBe("/3.0/links");
        expect(target(proxy(request("/3.0/referrals/imha-advocacy")))).toBe("/3.0/guides/imha-advocacy");
      });

      it("sends /v3 and /3 to /3.0", () => {
        expect(target(proxy(request("/v3")))).toBe("/3.0");
        expect(target(proxy(request("/3")))).toBe("/3.0");
      });
    });
  }
});

// The link helper keeps a reader inside whichever edition they are in.
describe("edition links", () => {
  // jest.doMock outlives isolateModules, so the flag the tests above faked is
  // still in force. Pin it to the live setting.
  let v2Href!: typeof import("@/lib/hooks/useV2").v2Href;
  let isV3Route!: typeof import("@/lib/config/editions").isV3Route;
  jest.isolateModules(() => {
    jest.doMock("@/lib/config/build", () => ({ COLLAPSED_FOR_DEMO: false }));
    /* eslint-disable @typescript-eslint/no-require-imports */
    v2Href = (require("@/lib/hooks/useV2") as typeof import("@/lib/hooks/useV2")).v2Href;
    isV3Route = (require("@/lib/config/editions") as typeof import("@/lib/config/editions")).isV3Route;
    /* eslint-enable @typescript-eslint/no-require-imports */
  });

  it("prefixes internal links with /3.0 inside 3.0, and leaves the rest alone", () => {
    expect(v2Href("/guides/news2", "/3.0")).toBe("/3.0/guides/news2");
    expect(v2Href("/", "/3.0")).toBe("/3.0");
    expect(v2Href("/3.0/links", "/3.0")).toBe("/3.0/links");
    expect(v2Href("https://www.nhs.uk", "/3.0")).toBe("https://www.nhs.uk");
    expect(v2Href("#top", "/3.0")).toBe("#top");
  });

  it("still prefixes /v2, and adds nothing at the root", () => {
    expect(v2Href("/guides", "/v2")).toBe("/v2/guides");
    expect(v2Href("/guides", null)).toBe("/guides");
  });

  it("does not double up when a link already carries the other edition", () => {
    expect(v2Href("/v2/guides", "/3.0")).toBe("/v2/guides");
  });

  it("treats the guides tree as 3.0 except for the eight tools", () => {
    expect(isV3Route("/guides/imha-advocacy")).toBe(true);
    expect(isV3Route("/guides/risk-assessment")).toBe(false);
    expect(isV3Route("/guides-and-more")).toBe(false);
  });
});
