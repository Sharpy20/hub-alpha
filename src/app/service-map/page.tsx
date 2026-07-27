"use client";

// Service "town map" - PROTOTYPE v2 (Mike's idea).
// Type CLUSTERS radiate from the service user; within a cluster, services branch
// off each other (node-off-node). Paths grey -> green as inclusion criteria are
// met, red when excluded or out of catchment, and a branch is cut off (faded,
// dashed) if its parent is closed. Filter to one cluster to see it clearly.
// Demo data only, no PII.

import { useMemo, useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { Breadcrumb, renderWithContacts } from "@/components/ui";
import {
  SERVICES, CLUSTERS, evaluate, AREA_LABEL, DIAGNOSIS_OPTIONS, FLAG_OPTIONS,
  GENDER_OPTIONS, EMPTY_FACTS, SAMPLE_PATIENTS,
  type Facts, type Area, type Gender, type Evaluation,
} from "@/lib/data/service-map";
import { Info, RotateCcw, MapPin, CheckCircle2, XCircle, CircleDashed, Ban, Search, Phone, ZoomIn, ZoomOut, Maximize2, List, Map as MapIcon, ChevronDown, Printer, GripVertical, Home, CornerUpLeft } from "lucide-react";

const CX = 550, CY = 500;
// Where the 12 category nodes sit in the hub view, and the bands services use
// once you are inside a category. Wider than BANDS because a focused view has
// far fewer nodes to fit, so they can breathe and the labels stay readable.
const CATEGORY_R = 300;
const FOCUS_BANDS = [230, 360, 470];
// Round SVG coords so server and client stringify identical values (no hydration mismatch).
const rnd = (n: number) => Math.round(n * 100) / 100;

// Zoom / pan: we drive the SVG viewBox. FULL is the fully-zoomed-out frame.
const FULL_VIEW = { x: 0, y: 0, w: 1100, h: 1000 };
const VIEW_ASPECT = 1000 / 1100;
type ViewBox = { x: number; y: number; w: number; h: number };
function clampView(v: ViewBox): ViewBox {
  const w = Math.max(260, Math.min(1100, v.w)); // up to ~4x zoom in
  const h = w * VIEW_ASPECT;
  const x = Math.max(-220, Math.min(1100 - w + 220, v.x));
  const y = Math.max(-220, Math.min(1000 - h + 220, v.y));
  return { x, y, w, h };
}

type Effective = "open" | "everyone" | "partial" | "unknown" | "blocked" | "cutoff";
const GREY = [148, 163, 184], GREEN = [22, 163, 74];
function lerp(t: number) {
  const c = GREY.map((g, i) => Math.round(g + (GREEN[i] - g) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
const EVERYONE_COLOR = "#0d9488"; // teal - open to anyone in catchment, no eligibility criteria
// Directory list sort: things the person can actually use first
const STATE_ORDER: Record<Effective, number> = { everyone: 0, open: 0, partial: 1, unknown: 2, blocked: 3, cutoff: 4 };

// Patient leaflet: strip researcher notes ("To verify: ...") - they are for us, not the patient.
const leafletNote = (note?: string) => {
  if (!note) return "";
  return note.split(/To verify\b/i)[0].replace(/[\s-]+$/, "").trim();
};
const EFF_META: Record<Effective, { label: string; badge: string; fill: string; border: string }> = {
  open: { label: "Open (meets criteria)", badge: "bg-green-100 text-green-800", fill: "#dcfce7", border: "#16a34a" },
  everyone: { label: "Open to everyone", badge: "bg-teal-100 text-teal-800", fill: "#ccfbf1", border: EVERYONE_COLOR },
  partial: { label: "Partly open", badge: "bg-lime-100 text-lime-800", fill: "#ecfccb", border: "#65a30d" },
  unknown: { label: "Not eligible yet", badge: "bg-gray-100 text-gray-600", fill: "#ffffff", border: "#cbd5e1" },
  blocked: { label: "Closed", badge: "bg-red-100 text-red-700", fill: "#fef2f2", border: "#dc2626" },
  cutoff: { label: "Cut off (parent closed)", badge: "bg-gray-100 text-gray-500", fill: "#f8fafc", border: "#cbd5e1" },
};

function wrap(text: string, max = 16): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

// global depth (parent-chain length) for reachability ordering
const depthOf = (id: string): number => {
  let d = 0, cur = SERVICES.find((s) => s.id === id);
  const seen = new Set<string>();
  while (cur?.parent && !seen.has(cur.parent)) { seen.add(cur.parent); d++; cur = SERVICES.find((s) => s.id === cur!.parent); }
  return d;
};

function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} aria-pressed={value === o.v}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${value === o.v ? "bg-nhs-blue text-white border-nhs-blue" : "bg-white text-gray-600 border-gray-200 hover:border-nhs-blue"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function ServiceMapPage() {
  const [facts, setFacts] = useState<Facts>({ ...EMPTY_FACTS });
  const [selected, setSelected] = useState<string | null>(null);
  const [clusterFilter, setClusterFilter] = useState<string>("all");
  // Directory list is the default - the map is a visual extra behind a toggle.
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");
  // What the map is centred on. null = the hub, showing the 12 CATEGORIES only.
  // Otherwise a cluster id (that category at the centre with its services around
  // it) or a service id (that service at the centre with its branch).
  //
  // Before this, all 115 services radiated straight off the hub onto one ring
  // and collapsed into an unreadable spiral (Mike, 27 Jul: "unusable"). Showing
  // one level at a time is the fix, not zooming.
  const [focus, setFocus] = useState<string | null>(null);

  // Collapsible cluster sections + drag-to-reorder (order persists per browser,
  // self-heals if the cluster list changes - same pattern as wardhub_guide_order).
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [clusterOrder, setClusterOrder] = useState<string[]>(() => CLUSTERS.map((c) => c.id));
  const dragCluster = useRef<string | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wardhub_servicemap_cluster_order");
      if (!saved) return;
      const ids: string[] = JSON.parse(saved);
      const valid = ids.filter((id) => CLUSTERS.some((c) => c.id === id));
      const missing = CLUSTERS.map((c) => c.id).filter((id) => !valid.includes(id));
      if (valid.length) setClusterOrder([...valid, ...missing]);
    } catch { /* corrupt value - keep the default order */ }
  }, []);
  const toggleCollapsed = (id: string) =>
    setCollapsed((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const dropOnCluster = (targetId: string) => {
    const from = dragCluster.current;
    dragCluster.current = null;
    if (!from || from === targetId) return;
    setClusterOrder((order) => {
      const next = order.filter((id) => id !== from);
      next.splice(next.indexOf(targetId), 0, from);
      localStorage.setItem("wardhub_servicemap_cluster_order", JSON.stringify(next));
      return next;
    });
  };
  const searchLc = search.trim().toLowerCase();

  // Zoom + pan (drives the SVG viewBox)
  const [view, setView] = useState<ViewBox>({ ...FULL_VIEW });
  const viewRef = useRef(view); viewRef.current = view;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const panRef = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null);
  const draggedRef = useRef(false);

  const toSvg = (clientX: number, clientY: number) => {
    const el = svgRef.current; const v = viewRef.current;
    if (!el) return { x: v.x + v.w / 2, y: v.y + v.h / 2 };
    const r = el.getBoundingClientRect();
    return { x: v.x + ((clientX - r.left) / r.width) * v.w, y: v.y + ((clientY - r.top) / r.height) * v.h };
  };
  const zoomAt = (factor: number, fx: number, fy: number) =>
    setView((v) => {
      const nw = Math.max(260, Math.min(1100, v.w * factor));
      const nh = nw * VIEW_ASPECT;
      return clampView({ x: fx - (fx - v.x) * (nw / v.w), y: fy - (fy - v.y) * (nh / v.h), w: nw, h: nh });
    });
  const zoomCentre = (factor: number) => { const v = viewRef.current; zoomAt(factor, v.x + v.w / 2, v.y + v.h / 2); };
  const resetView = () => setView({ ...FULL_VIEW });

  // Moving the map clears the detail panel. Without this the last service you
  // tapped sat under the map forever, describing something no longer on screen
  // (Mike: "why does the CALM tile sit under the map at all times?"). Focusing a
  // SERVICE keeps it selected, because then the panel is describing the centre.
  const goTo = (next: string | null) => {
    setFocus(next);
    setSelected(next && SERVICES.some((s) => s.id === next) ? next : null);
    resetView();
  };

  // Wheel-to-cursor zoom (non-passive so we can preventDefault the page scroll).
  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); const p = toSvg(e.clientX, e.clientY); zoomAt(e.deltaY > 0 ? 1.12 : 0.89, p.x, p.y); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Re-fit when the cluster filter changes (layout changes).
  useEffect(() => { setView({ ...FULL_VIEW }); }, [clusterFilter]);

  const onPointerDown = (e: React.PointerEvent) => {
    panRef.current = { px: e.clientX, py: e.clientY, vx: viewRef.current.x, vy: viewRef.current.y };
    draggedRef.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = panRef.current; if (!p) return;
    const el = svgRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    if (Math.abs(e.clientX - p.px) + Math.abs(e.clientY - p.py) > 4) draggedRef.current = true;
    const dx = ((e.clientX - p.px) / r.width) * viewRef.current.w;
    const dy = ((e.clientY - p.py) / r.height) * viewRef.current.h;
    setView((v) => clampView({ ...v, x: p.vx - dx, y: p.vy - dy }));
  };
  const endPan = () => { panRef.current = null; };
  const isZoomed = view.w < 1099;

  // Show/hide paths by their effective state (e.g. hide Closed, hide Not-eligible-yet).
  const [hiddenStates, setHiddenStates] = useState<Set<Effective>>(() => new Set());
  const toggleState = (k: Effective) =>
    setHiddenStates((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const set = <K extends keyof Facts>(k: K, v: Facts[K]) => setFacts((f) => ({ ...f, [k]: v }));
  const toggleArr = (k: "diagnoses" | "flags", v: string) =>
    setFacts((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  // evaluate every service + reachability (a child is cut off if its parent is closed)
  const { evals, reach } = useMemo(() => {
    const evals: Record<string, Evaluation> = {};
    for (const s of SERVICES) evals[s.id] = evaluate(s, facts);
    const reach: Record<string, boolean> = {};
    for (const s of [...SERVICES].sort((a, b) => depthOf(a.id) - depthOf(b.id))) {
      reach[s.id] = !s.parent ? true : (reach[s.parent] ?? true) && evals[s.parent]?.state !== "blocked";
    }
    return { evals, reach };
  }, [facts]);

  const effective = (id: string): Effective => {
    const ev = evals[id];
    if (ev.state === "blocked") return "blocked";
    if (!reach[id]) return "cutoff";
    // Open with no eligibility criteria = open to anyone in catchment.
    if (ev.state === "open" && (SERVICES.find((s) => s.id === id)?.include.length ?? 0) === 0) return "everyone";
    return ev.state;
  };

  const counts = useMemo(() => {
    const c: Record<Effective, number> = { open: 0, everyone: 0, partial: 0, unknown: 0, blocked: 0, cutoff: 0 };
    for (const s of SERVICES) c[effective(s.id)]++;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evals, reach]);

  // layout for the visible clusters (in the user's saved order)
  const orderedClusters = [...CLUSTERS].sort((a, b) => clusterOrder.indexOf(a.id) - clusterOrder.indexOf(b.id));
  const visClusters = clusterFilter === "all" ? orderedClusters : orderedClusters.filter((c) => c.id === clusterFilter);

  // The cluster currently at the centre, if any. A service focus implies its own
  // cluster, so picking a service from the list drops you into the right branch.
  const focusCluster = useMemo(() => {
    if (!focus) return null;
    if (CLUSTERS.some((c) => c.id === focus)) return focus;
    return SERVICES.find((s) => s.id === focus)?.cluster ?? null;
  }, [focus]);
  const focusService = focus && !CLUSTERS.some((c) => c.id === focus) ? focus : null;

  // Layout. Three modes, one level of detail each - that is the whole point.
  //   hub      -> the 12 category nodes, nothing else
  //   cluster  -> that category at the centre, its services branching off it
  //   service  -> that service at the centre, its own branch around it
  const { pos, clusterPos } = useMemo(() => {
    const pos: Record<string, { x: number; y: number; depth: number }> = {};
    const clusterPos: Record<string, { x: number; y: number }> = {};

    // Layout a set of services radially around the centre, honouring the real
    // parent chains so "reached via" still reads as a branch.
    const radial = (svs: typeof SERVICES, rootIds: Set<string>) => {
      const ids = new Set(svs.map((s) => s.id));
      const childrenOf = (id: string) => svs.filter((s) => s.parent === id && ids.has(id));
      const roots = svs.filter((s) => rootIds.has(s.id));
      const leaves = svs.filter((s) => childrenOf(s.id).length === 0).length || 1;
      const step = (2 * Math.PI) / leaves;
      let cursor = 0;
      const ang: Record<string, number> = {}, dep: Record<string, number> = {};
      const assign = (s: (typeof svs)[number], depth: number) => {
        const ch = childrenOf(s.id);
        dep[s.id] = depth;
        if (!ch.length) { ang[s.id] = -Math.PI / 2 + (cursor + 0.5) * step; cursor++; return; }
        ch.forEach((c) => assign(c, depth + 1));
        ang[s.id] = ch.reduce((a, c) => a + ang[c.id], 0) / ch.length;
      };
      roots.forEach((r) => assign(r, 0));
      svs.forEach((s) => {
        if (ang[s.id] === undefined) return;
        const r = FOCUS_BANDS[Math.min(dep[s.id], FOCUS_BANDS.length - 1)];
        pos[s.id] = { x: rnd(CX + r * Math.cos(ang[s.id])), y: rnd(CY + r * Math.sin(ang[s.id])), depth: dep[s.id] };
      });
    };

    if (focusService) {
      const svc = SERVICES.find((s) => s.id === focusService);
      if (svc) {
        pos[svc.id] = { x: CX, y: CY, depth: 0 };
        const branch = SERVICES.filter((s) => {
          let cur: (typeof SERVICES)[number] | undefined = s;
          const seen = new Set<string>();
          while (cur && !seen.has(cur.id)) { seen.add(cur.id); if (cur.id === svc.id) return true; cur = cur.parent ? SERVICES.find((x) => x.id === cur!.parent) : undefined; }
          return false;
        }).filter((s) => s.id !== svc.id);
        if (branch.length) {
          const kids = branch.filter((s) => s.parent === svc.id);
          radial(branch, new Set(kids.map((k) => k.id)));
        }
      }
    } else if (focusCluster) {
      clusterPos[focusCluster] = { x: CX, y: CY };
      const svs = SERVICES.filter((s) => s.cluster === focusCluster);
      const ids = new Set(svs.map((s) => s.id));
      const roots = svs.filter((s) => !s.parent || !ids.has(s.parent));
      radial(svs, new Set(roots.map((r) => r.id)));
    } else {
      // Hub: categories only, evenly spaced on one readable ring.
      const N = visClusters.length || 1;
      visClusters.forEach((cl, ci) => {
        const a = -Math.PI / 2 + (ci + 0.5) * ((2 * Math.PI) / N);
        clusterPos[cl.id] = { x: rnd(CX + CATEGORY_R * Math.cos(a)), y: rnd(CY + CATEGORY_R * Math.sin(a)) };
      });
    }
    return { pos, clusterPos };
  }, [visClusters, focusCluster, focusService]);

  const visServices = SERVICES.filter((s) => pos[s.id]);

  // Patient leaflet shortlist: fully open services only (no partial/maybe), and ONLY
  // those with a public contact - a service with no printed contact is a referral
  // route for staff, not something to hand to a patient. Grouped in cluster order.
  const leaflet = CLUSTERS.map((cl) => ({
    cluster: cl,
    services: SERVICES.filter((s) => {
      const eff = effective(s.id);
      return s.cluster === cl.id && (eff === "open" || eff === "everyone") && !!s.contact;
    }),
  })).filter((g) => g.services.length > 0);
  const leafletCount = leaflet.reduce((n, g) => n + g.services.length, 0);
  const printedOn = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const selSvc = SERVICES.find((s) => s.id === selected) || null;
  const selEv = selSvc ? evals[selSvc.id] : null;
  const selEff = selSvc ? effective(selSvc.id) : null;
  const parentName = selSvc?.parent ? SERVICES.find((s) => s.id === selSvc.parent)?.name : null;
  const nodeR = (depth: number) => (clusterFilter === "all" ? [26, 20, 16] : [32, 25, 20])[Math.min(depth, 2)];

  return (
    <MainLayout>
      {/* Print-only take-home leaflet: eligible services with PUBLIC contacts only.
          Deliberately prints NO profile details - just the services and numbers. */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-black">Support services for you</h1>
        <p className="text-sm mt-1">
          Services picked with you on the ward. You can contact these yourself unless the note says a referral is needed.
        </p>
        <div className="border-2 border-black rounded-lg p-3 my-3 text-sm font-bold">
          In an emergency call 999. For urgent mental health help, call NHS 111 and choose option 2 (24 hours a day).
        </div>
        {leaflet.map((g) => (
          <section key={g.cluster.id}>
            <h2 className="text-base font-bold border-b border-black mt-4 mb-1.5 pb-0.5">{g.cluster.label}</h2>
            {g.services.map((s) => (
              <div key={s.id} className="mb-2" style={{ breakInside: "avoid" }}>
                <p className="text-sm font-bold">{s.name}</p>
                <p className="text-sm">{s.contact}</p>
                {leafletNote(s.note) && <p className="text-xs">{leafletNote(s.note)}</p>}
              </div>
            ))}
          </section>
        ))}
        <p className="text-xs mt-5" suppressHydrationWarning>
          Printed on {printedOn}. Numbers were correct when printed. This is a signposting list, not a referral -
          each service decides who it can help. More services may be open to you with a referral: ask the ward team.
          Prepared with wardHub.
        </p>
      </div>

      <div className="space-y-4 print:hidden">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Service map (prototype)" }]} />

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Prototype v3.</strong> Set the profile on the left and the directory shows which services are open to that person, grouped by type with the usable ones first.
            Click a service for its criteria and contact. The <strong>Map</strong> toggle shows the same thing as a visual - services branch off each other where you reach one via another, and a branch cuts off if its parent closes.
            <strong> Area means where the person LIVES</strong>, not where the service is based - most Derbyshire services set catchment by home address or registered GP (shown per service).
            Criteria are being researched from each service&apos;s own site and are still <strong>to be clinically verified</strong>.
          </span>
        </div>

        {/* cluster filter */}
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setClusterFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${clusterFilter === "all" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200"}`}>All clusters</button>
          {CLUSTERS.map((c) => (
            <button key={c.id} onClick={() => setClusterFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${clusterFilter === c.id ? "text-white" : "bg-white text-gray-600 border-gray-200"}`}
              style={clusterFilter === c.id ? { background: c.color, borderColor: c.color } : { borderLeft: `4px solid ${c.color}` }}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* profile */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-800">Service user profile</h2>
                <button onClick={() => { setFacts({ ...EMPTY_FACTS }); setSelected(null); }} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Load a sample</p>
                <div className="flex flex-col gap-1.5">
                  {SAMPLE_PATIENTS.map((p) => (
                    <button key={p.name} onClick={() => { setFacts({ ...p.facts }); setSelected(null); }}
                      className="text-left rounded-lg border border-gray-200 hover:border-nhs-blue px-2.5 py-1.5 transition-colors">
                      <span className="block text-sm font-semibold text-gray-800">{p.name}</span>
                      <span className="block text-[11px] text-gray-500">{p.blurb}</span>
                    </button>
                  ))}
                </div>
              </div>
              <hr className="border-gray-100" />

              <div className="space-y-2.5 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Where the person lives</p>
                  <Seg value={facts.area} onChange={(v) => set("area", v as Area)} options={[{ v: "city", label: "City" }, { v: "county", label: "County" }, { v: "out", label: "Out of area" }]} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-500">Age</span>
                  <input type="number" min={0} max={110} value={facts.age} onChange={(e) => set("age", Number(e.target.value))} aria-label="Age" className="w-20 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Gender</p>
                  <Seg value={facts.gender} onChange={(v) => set("gender", v as Gender)} options={GENDER_OPTIONS} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Risk</p>
                  <Seg value={facts.risk} onChange={(v) => set("risk", v as Facts["risk"])} options={[{ v: "low", label: "Low" }, { v: "elevated", label: "Elevated" }, { v: "acute", label: "Acute" }]} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Housing</p>
                  <Seg value={facts.housing} onChange={(v) => set("housing", v as Facts["housing"])} options={[{ v: "settled", label: "Settled" }, { v: "at-risk", label: "At risk" }, { v: "homeless", label: "Homeless" }]} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Substance use</p>
                  <Seg value={facts.substance} onChange={(v) => set("substance", v as Facts["substance"])} options={[{ v: "none", label: "None" }, { v: "using", label: "Using" }, { v: "recovery", label: "Recovery" }]} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">PIP</p>
                  <Seg value={facts.pip} onChange={(v) => set("pip", v as Facts["pip"])} options={[{ v: "none", label: "None" }, { v: "applied", label: "Applied" }, { v: "awarded", label: "Awarded" }]} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Other flags</p>
                  <div className="flex flex-wrap gap-1">
                    {FLAG_OPTIONS.map((o) => {
                      const on = facts.flags.includes(o.v);
                      return (
                        <button key={o.v} onClick={() => toggleArr("flags", o.v)} aria-pressed={on}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${on ? "bg-nhs-blue text-white border-nhs-blue" : "bg-white text-gray-600 border-gray-200 hover:border-nhs-blue"}`}>
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Diagnoses / history</p>
                  <div className="flex flex-wrap gap-1">
                    {DIAGNOSIS_OPTIONS.map((d) => {
                      const on = facts.diagnoses.includes(d);
                      return (
                        <button key={d} onClick={() => toggleArr("diagnoses", d)} aria-pressed={on}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${on ? "bg-nhs-blue text-white border-nhs-blue" : "bg-white text-gray-600 border-gray-200 hover:border-nhs-blue"}`}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              {(["open", "everyone", "partial", "unknown", "blocked", "cutoff"] as Effective[]).map((k) => (
                <div key={k} className="rounded-xl border border-gray-200 bg-white py-2">
                  <p className="text-lg font-bold text-gray-800">{counts[k]}</p>
                  <p className="text-[11px] font-semibold text-gray-500">{EFF_META[k].label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* directory list + map */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services by name..." aria-label="Search services"
                  className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-nhs-blue focus:border-nhs-blue" />
                {searchLc && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">{visServices.filter((s) => s.name.toLowerCase().includes(searchLc)).length} match</span>}
              </div>
              <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                <button onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === "list" ? "bg-nhs-blue text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                  <List className="w-4 h-4" /> List
                </button>
                <button onClick={() => setViewMode("map")} aria-pressed={viewMode === "map"}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${viewMode === "map" ? "bg-nhs-blue text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                  <MapIcon className="w-4 h-4" /> Map
                </button>
              </div>
              <button onClick={() => window.print()} disabled={leafletCount === 0}
                title="Print a take-home list of the services this person can use (public contacts only)"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-nhs-blue hover:text-nhs-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Printer className="w-4 h-4" /> Print for the patient
                <span className="text-[10px] font-bold rounded-full bg-nhs-blue text-white px-1.5 py-0.5">{leafletCount}</span>
              </button>
            </div>
            {viewMode === "map" && (
            <div className="relative bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-gray-200 p-2">
              {/* Zoom controls */}
              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                <button onClick={() => zoomCentre(0.8)} aria-label="Zoom in" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => zoomCentre(1.25)} aria-label="Zoom out" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={resetView} aria-label="Reset zoom" disabled={!isZoomed} className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm text-gray-700 ${isZoomed ? "hover:bg-gray-50" : "opacity-40 cursor-default"}`}><Maximize2 className="w-4 h-4" /></button>
              </div>

              {/* Where am I, and how do I get back out. */}
              {focus && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                  <button onClick={() => goTo(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm text-xs font-semibold text-gray-700 hover:border-nhs-blue hover:text-nhs-blue">
                    <Home className="w-3.5 h-3.5" /> All categories
                  </button>
                  {focusService && focusCluster && (
                    <button onClick={() => goTo(focusCluster)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm text-xs font-semibold text-gray-700 hover:border-nhs-blue hover:text-nhs-blue">
                      <CornerUpLeft className="w-3.5 h-3.5" />
                      {CLUSTERS.find((c) => c.id === focusCluster)?.label}
                    </button>
                  )}
                </div>
              )}
              {isZoomed && <span className="absolute top-3 left-3 z-10 text-[11px] font-semibold text-gray-500 bg-white/80 rounded px-2 py-0.5 border border-gray-200">Drag to pan - scroll to zoom</span>}
              <svg ref={svgRef} viewBox={`${rnd(view.x)} ${rnd(view.y)} ${rnd(view.w)} ${rnd(view.h)}`} className="w-full h-auto touch-none select-none" style={{ cursor: panRef.current ? "grabbing" : "grab" }} role="group" aria-label="Service town map"
                onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPan} onPointerLeave={endPan}>
                {/* band rings */}
                {(focus ? FOCUS_BANDS : [CATEGORY_R]).map((r) => <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#eef2f7" strokeDasharray="3 7" />)}

                {/* Hub view: a spoke and a node per CATEGORY, and nothing else.
                    Click one to drop into it. */}
                {!focus && visClusters.map((cl) => {
                  const cp = clusterPos[cl.id];
                  if (!cp) return null;
                  const svs = SERVICES.filter((s) => s.cluster === cl.id);
                  const openCount = svs.filter((s) => { const e = effective(s.id); return e === "open" || e === "everyone"; }).length;
                  const lines = wrap(cl.label, 16);
                  // Stub spokes fanning out behind each category - you cannot read
                  // anything from them, and that is the point: they show there is
                  // more here and invite the click (Mike, 27 Jul).
                  const outward = Math.atan2(cp.y - CY, cp.x - CX);
                  const stubCount = Math.min(5, svs.length);
                  const stubs = Array.from({ length: stubCount }, (_, k) => {
                    const spread = 1.15;
                    const a = outward + (stubCount === 1 ? 0 : -spread / 2 + (k * spread) / (stubCount - 1));
                    const len = 34 + (k % 2) * 14;
                    return {
                      x1: rnd(cp.x + 62 * Math.cos(a)), y1: rnd(cp.y + 62 * Math.sin(a)),
                      x2: rnd(cp.x + (62 + len) * Math.cos(a)), y2: rnd(cp.y + (62 + len) * Math.sin(a)),
                    };
                  });
                  return (
                    <g key={cl.id} onClick={() => { if (draggedRef.current) { draggedRef.current = false; return; } goTo(cl.id); }}
                      style={{ cursor: "pointer" }} tabIndex={0} role="button"
                      aria-label={`${cl.label}: ${svs.length} services, ${openCount} open. Open this category.`}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(cl.id); } }}>
                      <line x1={CX} y1={CY} x2={cp.x} y2={cp.y} stroke={cl.color} strokeWidth={openCount ? 4 : 2} opacity={openCount ? 0.75 : 0.3} strokeLinecap="round" />
                      {/* behind the node, so it reads as "this opens up" */}
                      {stubs.map((st, k) => (
                        <g key={k} opacity={0.3}>
                          <line x1={st.x1} y1={st.y1} x2={st.x2} y2={st.y2} stroke={cl.color} strokeWidth={2} strokeLinecap="round" />
                          <circle cx={st.x2} cy={st.y2} r={7} fill="#fff" stroke={cl.color} strokeWidth={2} />
                        </g>
                      ))}
                      <circle cx={cp.x} cy={cp.y} r={62} fill="#fff" stroke={cl.color} strokeWidth={3} />
                      <text textAnchor="middle" fontSize="11.5" fontWeight="700" fill={cl.color} pointerEvents="none">
                        {lines.map((ln, i) => <tspan key={i} x={cp.x} y={cp.y - 10 + i * 13}>{ln}</tspan>)}
                      </text>
                      <text x={cp.x} y={cp.y + 10 + (lines.length - 1) * 13} textAnchor="middle" fontSize="10" className="fill-gray-500" pointerEvents="none">
                        {svs.length} services
                      </text>
                      <text x={cp.x} y={cp.y + 24 + (lines.length - 1) * 13} textAnchor="middle" fontSize="10" fontWeight="700" className="fill-green-700" pointerEvents="none">
                        {openCount ? `${openCount} open` : ""}
                      </text>
                    </g>
                  );
                })}

                {/* paths */}
                {visServices.map((s) => {
                  const p = pos[s.id];
                  const from = s.parent && pos[s.parent] ? pos[s.parent] : { x: CX, y: CY };
                  const eff = effective(s.id);
                  if (hiddenStates.has(eff)) return null;
                  const color = eff === "blocked" ? "#dc2626" : eff === "cutoff" ? "#cbd5e1" : eff === "everyone" ? EVERYONE_COLOR : lerp(evals[s.id].score);
                  return (
                    <line key={"p" + s.id} x1={from.x} y1={from.y} x2={p.x} y2={p.y}
                      stroke={color} strokeWidth={eff === "open" ? 4.5 : eff === "partial" ? 3.2 : 2}
                      strokeDasharray={eff === "blocked" || eff === "cutoff" ? "4 5" : undefined}
                      opacity={eff === "unknown" || eff === "cutoff" ? 0.5 : 1}
                      strokeLinecap="round" style={{ transition: "stroke 0.35s, stroke-width 0.35s, opacity 0.35s" }} />
                  );
                })}

                {/* centre - the service user at the hub, otherwise whatever is
                    in focus, so you always know where you are standing */}
                {(() => {
                  if (!focus) {
                    return (
                      <g>
                        <circle cx={CX} cy={CY} r={46} fill="#005EB8" />
                        <text x={CX} y={CY - 4} textAnchor="middle" className="fill-white" fontSize="13" fontWeight="700">Service</text>
                        <text x={CX} y={CY + 12} textAnchor="middle" className="fill-white" fontSize="13" fontWeight="700">user</text>
                        <text x={CX} y={CY + 30} textAnchor="middle" className="fill-white" fontSize="10" opacity={0.85}>{AREA_LABEL[facts.area]}</text>
                      </g>
                    );
                  }
                  const cl = CLUSTERS.find((c) => c.id === focusCluster);
                  const svc = focusService ? SERVICES.find((s) => s.id === focusService) : null;
                  const label = svc ? svc.name : cl?.label || "";
                  const colour = cl?.color || "#005EB8";
                  const lines = wrap(label, 15);
                  return (
                    <g>
                      <circle cx={CX} cy={CY} r={66} fill={colour} />
                      <text textAnchor="middle" className="fill-white" fontSize="12.5" fontWeight="700" pointerEvents="none">
                        {lines.map((ln, i) => <tspan key={i} x={CX} y={CY - 6 + i * 14}>{ln}</tspan>)}
                      </text>
                      <text x={CX} y={CY + 14 + (lines.length - 1) * 14} textAnchor="middle" className="fill-white" fontSize="9.5" opacity={0.85} pointerEvents="none">
                        {AREA_LABEL[facts.area]}
                      </text>
                    </g>
                  );
                })()}

                {/* nodes */}
                {visServices.map((s) => {
                  const p = pos[s.id];
                  const eff = effective(s.id);
                  if (hiddenStates.has(eff)) return null;
                  const meta = EFF_META[eff];
                  const r = nodeR(p.depth);
                  const isSel = selected === s.id;
                  const hit = !searchLc || s.name.toLowerCase().includes(searchLc);
                  const lines = wrap(s.name, clusterFilter === "all" ? 15 : 18);
                  return (
                    <g key={s.id} onClick={() => {
                        if (draggedRef.current) { draggedRef.current = false; return; }
                        setSelected(s.id);
                        // Clicking a node that has its own branch recentres on it,
                        // so you can keep walking down without the rest in the way.
                        if (SERVICES.some((x) => x.parent === s.id)) goTo(s.id);
                      }} style={{ cursor: "pointer" }} tabIndex={0} role="button"
                      aria-label={`${s.name}: ${meta.label}`} opacity={eff === "cutoff" ? 0.5 : hit ? 1 : 0.15}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(s.id); } }}>
                      {searchLc && hit && <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke="#f59e0b" strokeWidth={3} />}
                      <circle cx={p.x} cy={p.y} r={r} fill={meta.fill} stroke={meta.border} strokeWidth={isSel ? 4 : 2.5} style={{ transition: "fill 0.35s, stroke 0.35s" }} />
                      {eff === "blocked" && <line x1={p.x - r * 0.6} y1={p.y - r * 0.6} x2={p.x + r * 0.6} y2={p.y + r * 0.6} stroke="#dc2626" strokeWidth={2.5} />}
                      {(eff === "open" || eff === "everyone") && <text x={p.x} y={p.y - r - 3} textAnchor="middle" fontSize="13">{"✅"}</text>}
                      <text textAnchor="middle" fontSize={clusterFilter === "all" ? 8.5 : 10} fontWeight="600" className="fill-gray-700" pointerEvents="none">
                        {lines.map((ln, i) => <tspan key={i} x={p.x} y={p.y + (lines.length === 1 ? 3 : i === 0 ? -2 : 9)}>{ln}</tspan>)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            )}

            {/* legend = show/hide toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="diary-muted text-xs mr-1">Show / hide:</span>
              {([
                { k: "open" as Effective, label: "Open (meets criteria)", swatch: <span className="w-4 h-1 rounded bg-green-600" /> },
                { k: "everyone" as Effective, label: "Open to everyone", swatch: <span className="w-4 h-1 rounded" style={{ background: EVERYONE_COLOR }} /> },
                { k: "partial" as Effective, label: "Partly open", swatch: <span className="w-4 h-1 rounded bg-lime-500" /> },
                { k: "unknown" as Effective, label: "Not eligible yet", swatch: <span className="w-4 h-1 rounded bg-slate-300" /> },
                { k: "blocked" as Effective, label: "Closed", swatch: <span className="w-4 h-1 rounded" style={{ backgroundImage: "repeating-linear-gradient(90deg,#dc2626 0 4px,transparent 4px 8px)" }} /> },
                { k: "cutoff" as Effective, label: "Cut off", swatch: <Ban className="w-3.5 h-3.5 text-slate-400" /> },
              ]).map(({ k, label, swatch }) => {
                const hidden = hiddenStates.has(k);
                return (
                  <button key={k} onClick={() => toggleState(k)} aria-pressed={!hidden}
                    title={hidden ? `Show ${label}` : `Hide ${label}`}
                    className={`inline-flex items-center gap-1.5 text-xs border rounded-lg px-2 py-1 transition-colors ${hidden ? "border-gray-200 bg-gray-50 text-gray-500 line-through" : "border-gray-200 bg-white text-gray-600 hover:border-nhs-blue"}`}>
                    <span className={hidden ? "opacity-30" : ""}>{swatch}</span> {label} ({counts[k]})
                  </button>
                );
              })}
              {hiddenStates.size > 0 && (
                <button onClick={() => setHiddenStates(new Set())} className="text-xs font-semibold text-nhs-blue hover:text-nhs-dark-blue ml-1">Show all</button>
              )}
            </div>

            {/* directory list, grouped by cluster, eligible first */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {visClusters.map((cl) => {
                  const rows = SERVICES.filter((s) => s.cluster === cl.id)
                    .filter((s) => !hiddenStates.has(effective(s.id)))
                    .filter((s) => !searchLc || s.name.toLowerCase().includes(searchLc))
                    .sort((a, b) => STATE_ORDER[effective(a.id)] - STATE_ORDER[effective(b.id)] || a.name.localeCompare(b.name));
                  if (!rows.length) return null;
                  // Searching auto-expands so a collapsed section can't hide matches.
                  const isCollapsed = collapsed.has(cl.id) && !searchLc;
                  return (
                    <section key={cl.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                      onDragOver={(e) => { if (dragCluster.current) e.preventDefault(); }}
                      onDrop={() => dropOnCluster(cl.id)}>
                      <div className="flex items-center text-white" style={{ background: cl.color }}>
                        <span draggable onDragStart={() => { dragCluster.current = cl.id; }}
                          title="Drag to reorder sections" className="pl-2.5 py-2.5 cursor-grab active:cursor-grabbing opacity-70 hover:opacity-100">
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <button onClick={() => toggleCollapsed(cl.id)} aria-expanded={!isCollapsed}
                          className="flex-1 flex items-center justify-between gap-2 pl-1.5 pr-4 py-2.5 text-left text-sm font-bold">
                          <span>{cl.label} <span className="text-xs font-semibold opacity-80">({rows.length})</span></span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                        </button>
                      </div>
                      {!isCollapsed && (
                      <div className="divide-y divide-gray-100">
                        {rows.map((s) => {
                          const eff = effective(s.id);
                          const ev = evals[s.id];
                          const open = selected === s.id;
                          const via = s.parent ? SERVICES.find((p) => p.id === s.parent)?.name : null;
                          return (
                            <div key={s.id}>
                              <button onClick={() => setSelected(open ? null : s.id)} aria-expanded={open}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                <span className="flex items-start justify-between gap-3">
                                  <span className="min-w-0">
                                    <span className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-semibold text-gray-800">{s.name}</span>
                                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${EFF_META[eff].badge}`}>{EFF_META[eff].label}</span>
                                    </span>
                                    <span className="block text-xs text-gray-500 mt-0.5 truncate">
                                      {s.include.length ? s.include.map((c) => c.label).join(" · ") : "Open to anyone in catchment"}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500 pt-0.5">
                                    <span className="hidden sm:inline">{s.areas.length === 3 ? "National" : s.areas.map((a) => AREA_LABEL[a]).join(", ")}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
                                  </span>
                                </span>
                              </button>
                              {open && (
                                <div className="px-4 pb-3 pt-1 text-sm space-y-1.5 bg-gray-50/70">
                                  {via && <p className="text-xs text-gray-500">Reached via {via}.</p>}
                                  {s.note && <p className="text-xs text-gray-600">{s.note}</p>}
                                  {s.catchmentNote && <p className="flex items-start gap-1.5 text-xs text-gray-600"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" /> Catchment: {s.catchmentNote}</p>}
                                  {s.contact && <p className="flex items-start gap-1.5 font-medium text-gray-700"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-nhs-blue" /> {renderWithContacts(s.contact)}</p>}
                                  {eff === "cutoff" && <p className="flex items-start gap-1.5 text-gray-500"><Ban className="w-4 h-4 mt-0.5 flex-shrink-0" /> Cut off - you reach this via {via}, which is currently closed.</p>}
                                  {ev.blockedReason && <p className="flex items-start gap-1.5 text-red-700"><XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {ev.blockedReason}</p>}
                                  {ev.met.map((c) => <p key={c} className="flex items-start gap-1.5 text-green-700"><CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</p>)}
                                  {ev.unmet.map((c) => <p key={c} className="flex items-start gap-1.5 text-gray-500"><CircleDashed className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</p>)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}

            {/* selected detail (map view) */}
            {viewMode === "map" && (selSvc && selEv && selEff ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-800">{selSvc.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${EFF_META[selEff].badge}`}>{EFF_META[selEff].label}</span>
                    {/* It is a panel about one thing you tapped - let it be dismissed. */}
                    <button onClick={() => setSelected(null)} aria-label={`Close ${selSvc.name} details`}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {CLUSTERS.find((c) => c.id === selSvc.cluster)?.label} - accepts people living in {selSvc.areas.map((a) => AREA_LABEL[a]).join(", ")}
                  {parentName ? ` - reached via ${parentName}` : ""}. {selSvc.note || ""}
                </p>
                {selSvc.catchmentNote && (
                  <p className="flex items-start gap-1.5 text-xs text-gray-600 mb-2"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" /> Catchment: {selSvc.catchmentNote}</p>
                )}
                {selSvc.contact && <p className="flex items-start gap-1.5 text-sm text-gray-700 mb-2 font-medium"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-nhs-blue" /> {renderWithContacts(selSvc.contact)}</p>}
                {selEff === "cutoff" && <p className="flex items-start gap-1.5 text-sm text-gray-500 mb-1"><Ban className="w-4 h-4 mt-0.5 flex-shrink-0" /> Cut off - you reach this via {parentName}, which is currently closed.</p>}
                {selEv.blockedReason && <p className="flex items-start gap-1.5 text-sm text-red-700 mb-1"><XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {selEv.blockedReason}</p>}
                {selEv.met.map((c) => <p key={c} className="flex items-start gap-1.5 text-sm text-green-700"><CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</p>)}
                {selEv.unmet.map((c) => <p key={c} className="flex items-start gap-1.5 text-sm text-gray-500"><CircleDashed className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</p>)}
                {selSvc.include.length === 0 && !selEv.blockedReason && selEff !== "cutoff" && <p className="text-sm text-green-700">Open to anyone in catchment - no eligibility criteria.</p>}
              </div>
            ) : (
              <p className="diary-muted text-sm text-center py-2">Click a service to see its criteria and why it is open, closed or cut off.</p>
            ))}
          </div>
        </div>

        <p className="diary-muted text-xs text-center">
          Prototype of Mike&apos;s service-map idea. Demo services + illustrative criteria (widened from the Derbyshire MH Helpline signposting pack). No PII.
          The real version is driven by approved, dated profile facts and the actual service directory.
        </p>
      </div>
    </MainLayout>
  );
}
