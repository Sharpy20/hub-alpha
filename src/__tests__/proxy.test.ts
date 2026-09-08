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
