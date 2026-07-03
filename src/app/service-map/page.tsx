"use client";

// Service "town map" - PROTOTYPE v2 (Mike's idea).
// Type CLUSTERS radiate from the service user; within a cluster, services branch
// off each other (node-off-node). Paths grey -> green as inclusion criteria are
// met, red when excluded or out of catchment, and a branch is cut off (faded,
// dashed) if its parent is closed. Filter to one cluster to see it clearly.
// Demo data only, no PII.

import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import {
  SERVICES, CLUSTERS, evaluate, AREA_LABEL, DIAGNOSIS_OPTIONS, FLAG_OPTIONS,
  EMPTY_FACTS, SAMPLE_PATIENTS,
  type Facts, type Area, type Evaluation,
} from "@/lib/data/service-map";
import { Info, RotateCcw, MapPin, CheckCircle2, XCircle, CircleDashed, Ban } from "lucide-react";

const CX = 550, CY = 500;
const BANDS = [175, 300, 400];
// Round SVG coords so server and client stringify identical values (no hydration mismatch).
const rnd = (n: number) => Math.round(n * 100) / 100;

type Effective = "open" | "partial" | "unknown" | "blocked" | "cutoff";
const GREY = [148, 163, 184], GREEN = [22, 163, 74];
function lerp(t: number) {
  const c = GREY.map((g, i) => Math.round(g + (GREEN[i] - g) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
const EFF_META: Record<Effective, { label: string; badge: string; fill: string; border: string }> = {
  open: { label: "Open", badge: "bg-green-100 text-green-800", fill: "#dcfce7", border: "#16a34a" },
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
    return ev.state;
  };

  const counts = useMemo(() => {
    const c: Record<Effective, number> = { open: 0, partial: 0, unknown: 0, blocked: 0, cutoff: 0 };
    for (const s of SERVICES) c[effective(s.id)]++;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evals, reach]);

  // layout for the visible clusters
  const visClusters = clusterFilter === "all" ? CLUSTERS : CLUSTERS.filter((c) => c.id === clusterFilter);
  const pos = useMemo(() => {
    const pos: Record<string, { x: number; y: number; depth: number }> = {};
    const N = visClusters.length;
    visClusters.forEach((cl, ci) => {
      const svs = SERVICES.filter((s) => s.cluster === cl.id);
      if (!svs.length) return;
      const ids = new Set(svs.map((s) => s.id));
      const childrenOf = (id: string) => svs.filter((s) => s.parent === id && ids.has(s.parent!));
      const roots = svs.filter((s) => !s.parent || !ids.has(s.parent));
      const totalLeaves = svs.filter((s) => childrenOf(s.id).length === 0).length || 1;
      const tc = -Math.PI / 2 + (ci + 0.5) * ((2 * Math.PI) / N);
      const half = N === 1 ? Math.PI * 0.94 : ((2 * Math.PI) / N) * 0.44;
      const step = (2 * half) / totalLeaves;
      let cursor = 0;
      const ang: Record<string, number> = {}, dep: Record<string, number> = {};
      const assign = (s: (typeof svs)[number], depth: number) => {
        const ch = childrenOf(s.id);
        dep[s.id] = depth;
        if (!ch.length) { ang[s.id] = tc - half + (cursor + 0.5) * step; cursor++; return; }
        ch.forEach((c) => assign(c, depth + 1));
        ang[s.id] = ch.reduce((a, c) => a + ang[c.id], 0) / ch.length;
      };
      roots.forEach((r) => assign(r, 0));
      svs.forEach((s) => {
        const r = BANDS[Math.min(dep[s.id], BANDS.length - 1)];
        pos[s.id] = { x: rnd(CX + r * Math.cos(ang[s.id])), y: rnd(CY + r * Math.sin(ang[s.id])), depth: dep[s.id] };
      });
    });
    return pos;
  }, [visClusters]);

  const visServices = SERVICES.filter((s) => pos[s.id]);
  const selSvc = SERVICES.find((s) => s.id === selected) || null;
  const selEv = selSvc ? evals[selSvc.id] : null;
  const selEff = selSvc ? effective(selSvc.id) : null;
  const parentName = selSvc?.parent ? SERVICES.find((s) => s.id === selSvc.parent)?.name : null;
  const nodeR = (depth: number) => (clusterFilter === "all" ? [26, 20, 16] : [32, 25, 20])[Math.min(depth, 2)];

  return (
    <MainLayout>
      <div className="space-y-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Service map (prototype)" }]} />

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Prototype v2.</strong> Services are grouped into <strong>type clusters</strong> and branch off each other where you reach one via another
            (e.g. Trent PTS via Talking Therapies). A branch <strong>cuts off</strong> if its parent closes. Set the profile on the left; filter to one cluster to see it clearly.
            Services + criteria are <strong>illustrative demo data</strong> (widened from the Derbyshire MH Helpline pack) - real criteria come from the research session.
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

        <div className="grid lg:grid-cols-[320px_1fr] gap-4">
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
                  <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Area (postcode)</p>
                  <Seg value={facts.area} onChange={(v) => set("area", v as Area)} options={[{ v: "city", label: "City" }, { v: "county", label: "County" }, { v: "out", label: "Out of area" }]} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-500">Age</span>
                  <input type="number" min={0} max={110} value={facts.age} onChange={(e) => set("age", Number(e.target.value))} className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1" />
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
              {(["open", "partial", "unknown", "blocked", "cutoff"] as Effective[]).map((k) => (
                <div key={k} className="rounded-xl border border-gray-200 bg-white py-2">
                  <p className="text-lg font-bold text-gray-800">{counts[k]}</p>
                  <p className="text-[11px] font-semibold text-gray-500">{EFF_META[k].label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* map */}
          <div className="space-y-3">
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-gray-200 p-2">
              <svg viewBox="0 0 1100 1000" className="w-full h-auto" role="img" aria-label="Service town map">
                {/* band rings */}
                {BANDS.map((r) => <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#eef2f7" strokeDasharray="3 7" />)}

                {/* cluster labels (only in all view) */}
                {clusterFilter === "all" && visClusters.map((cl, ci) => {
                  const tc = -Math.PI / 2 + (ci + 0.5) * ((2 * Math.PI) / visClusters.length);
                  const lx = rnd(CX + 452 * Math.cos(tc)), ly = rnd(CY + 452 * Math.sin(tc));
                  return <text key={cl.id} x={lx} y={ly} textAnchor="middle" fontSize="11" fontWeight="700" fill={cl.color}>{wrap(cl.label, 18).map((ln, i) => <tspan key={i} x={lx} dy={i ? 12 : 0}>{ln}</tspan>)}</text>;
                })}

                {/* paths */}
                {visServices.map((s) => {
                  const p = pos[s.id];
                  const from = s.parent && pos[s.parent] ? pos[s.parent] : { x: CX, y: CY };
                  const eff = effective(s.id);
                  const color = eff === "blocked" ? "#dc2626" : eff === "cutoff" ? "#cbd5e1" : lerp(evals[s.id].score);
                  return (
                    <line key={"p" + s.id} x1={from.x} y1={from.y} x2={p.x} y2={p.y}
                      stroke={color} strokeWidth={eff === "open" ? 4.5 : eff === "partial" ? 3.2 : 2}
                      strokeDasharray={eff === "blocked" || eff === "cutoff" ? "4 5" : undefined}
                      opacity={eff === "unknown" || eff === "cutoff" ? 0.5 : 1}
                      strokeLinecap="round" style={{ transition: "stroke 0.35s, stroke-width 0.35s, opacity 0.35s" }} />
                  );
                })}

                {/* centre */}
                <circle cx={CX} cy={CY} r={46} fill="#005EB8" />
                <text x={CX} y={CY - 4} textAnchor="middle" className="fill-white" fontSize="13" fontWeight="700">Service</text>
                <text x={CX} y={CY + 12} textAnchor="middle" className="fill-white" fontSize="13" fontWeight="700">user</text>
                <text x={CX} y={CY + 30} textAnchor="middle" className="fill-white" fontSize="10" opacity={0.85}>{AREA_LABEL[facts.area]}</text>

                {/* nodes */}
                {visServices.map((s) => {
                  const p = pos[s.id];
                  const eff = effective(s.id);
                  const meta = EFF_META[eff];
                  const r = nodeR(p.depth);
                  const isSel = selected === s.id;
                  const lines = wrap(s.name, clusterFilter === "all" ? 15 : 18);
                  return (
                    <g key={s.id} onClick={() => setSelected(s.id)} style={{ cursor: "pointer" }} tabIndex={0} role="button"
                      aria-label={`${s.name}: ${meta.label}`} opacity={eff === "cutoff" ? 0.55 : 1}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(s.id); } }}>
                      <circle cx={p.x} cy={p.y} r={r} fill={meta.fill} stroke={meta.border} strokeWidth={isSel ? 4 : 2.5} style={{ transition: "fill 0.35s, stroke 0.35s" }} />
                      {eff === "blocked" && <line x1={p.x - r * 0.6} y1={p.y - r * 0.6} x2={p.x + r * 0.6} y2={p.y + r * 0.6} stroke="#dc2626" strokeWidth={2.5} />}
                      {eff === "open" && <text x={p.x} y={p.y - r - 3} textAnchor="middle" fontSize="13">{"✅"}</text>}
                      <text textAnchor="middle" fontSize={clusterFilter === "all" ? 8.5 : 10} fontWeight="600" className="fill-gray-700" pointerEvents="none">
                        {lines.map((ln, i) => <tspan key={i} x={p.x} y={p.y + (lines.length === 1 ? 3 : i === 0 ? -2 : 9)}>{ln}</tspan>)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* legend */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 rounded bg-green-600" /> Open</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 rounded bg-lime-500" /> Partly open</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 rounded bg-slate-300" /> Not eligible yet</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 rounded bg-red-600" style={{ backgroundImage: "repeating-linear-gradient(90deg,#dc2626 0 4px,transparent 4px 8px)" }} /> Closed</span>
              <span className="inline-flex items-center gap-1.5"><Ban className="w-3.5 h-3.5 text-slate-400" /> Cut off (parent closed)</span>
            </div>

            {/* selected detail */}
            {selSvc && selEv && selEff ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-800">{selSvc.name}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${EFF_META[selEff].badge}`}>{EFF_META[selEff].label}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {CLUSTERS.find((c) => c.id === selSvc.cluster)?.label} - serves {selSvc.areas.map((a) => AREA_LABEL[a]).join(", ")}
                  {parentName ? ` - reached via ${parentName}` : ""}. {selSvc.note || ""}
                </p>
                {selEff === "cutoff" && <p className="flex items-start gap-1.5 text-sm text-gray-500 mb-1"><Ban className="w-4 h-4 mt-0.5 flex-shrink-0" /> Cut off - you reach this via {parentName}, which is currently closed.</p>}
                {selEv.blockedReason && <p className="flex items-start gap-1.5 text-sm text-red-700 mb-1"><XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {selEv.blockedReason}</p>}
                {selEv.met.map((c) => <p key={c} className="flex items-start gap-1.5 text-sm text-green-700"><CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</p>)}
                {selEv.unmet.map((c) => <p key={c} className="flex items-start gap-1.5 text-sm text-gray-400"><CircleDashed className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</p>)}
                {selSvc.include.length === 0 && !selEv.blockedReason && selEff !== "cutoff" && <p className="text-sm text-green-700">Open to anyone in catchment - no eligibility criteria.</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">Click a service to see its criteria and why it is open, closed or cut off.</p>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Prototype of Mike&apos;s service-map idea. Demo services + illustrative criteria (widened from the Derbyshire MH Helpline signposting pack). No PII.
          The real version is driven by approved, dated profile facts and the actual service directory.
        </p>
      </div>
    </MainLayout>
  );
}
