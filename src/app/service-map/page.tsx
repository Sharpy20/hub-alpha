"use client";

// Service "town map" - PROTOTYPE (Mike's idea, 3 Jul 2026).
// Set a patient's profile facts on the left; the town lights up on the right -
// paths go grey -> green as inclusion criteria are met, and close off (red) on an
// exclusion or when the patient is outside a service's catchment. Demo data only.

import { useMemo, useState } from "react";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import {
  SERVICES, evaluate, AREA_LABEL, DIAGNOSIS_OPTIONS, EMPTY_FACTS, SAMPLE_PATIENTS,
  type Facts, type Area, type Evaluation, type ServiceState,
} from "@/lib/data/service-map";
import { Info, RotateCcw, MapPin, CheckCircle2, XCircle, CircleDashed } from "lucide-react";

// ---- geometry -------------------------------------------------------------
const CX = 480, CY = 380, R1 = 190, R2 = 325;
const primary = SERVICES.filter((s) => s.ring === "primary");
const charity = SERVICES.filter((s) => s.ring === "charity");

function ring(list: typeof SERVICES, r: number, offset: number) {
  return list.map((s, i) => {
    const theta = -Math.PI / 2 + offset + (i * 2 * Math.PI) / list.length;
    return { s, x: CX + r * Math.cos(theta), y: CY + r * Math.sin(theta) };
  });
}
const NODES = [...ring(primary, R1, 0), ...ring(charity, R2, Math.PI / charity.length)];

// ---- colour ---------------------------------------------------------------
const GREY = [148, 163, 184], GREEN = [22, 163, 74];
function pathColor(ev: Evaluation): string {
  if (ev.state === "blocked") return "#dc2626";
  const t = ev.score;
  const c = GREY.map((g, i) => Math.round(g + (GREEN[i] - g) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
const STATE_META: Record<ServiceState, { label: string; badge: string; fill: string; border: string }> = {
  open: { label: "Open", badge: "bg-green-100 text-green-800", fill: "#dcfce7", border: "#16a34a" },
  partial: { label: "Partly open", badge: "bg-lime-100 text-lime-800", fill: "#ecfccb", border: "#65a30d" },
  unknown: { label: "Not eligible yet", badge: "bg-gray-100 text-gray-600", fill: "#ffffff", border: "#cbd5e1" },
  blocked: { label: "Closed", badge: "bg-red-100 text-red-700", fill: "#fef2f2", border: "#dc2626" },
};

function wrap(text: string, max = 15): string[] {
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

// ---- small UI helpers -----------------------------------------------------
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

  const set = <K extends keyof Facts>(k: K, v: Facts[K]) => setFacts((f) => ({ ...f, [k]: v }));
  const toggleDx = (d: string) =>
    setFacts((f) => ({ ...f, diagnoses: f.diagnoses.includes(d) ? f.diagnoses.filter((x) => x !== d) : [...f.diagnoses, d] }));

  const evals = useMemo(() => {
    const m: Record<string, Evaluation> = {};
    for (const s of SERVICES) m[s.id] = evaluate(s, facts);
    return m;
  }, [facts]);

  const counts = useMemo(() => {
    const c = { open: 0, partial: 0, unknown: 0, blocked: 0 };
    for (const s of SERVICES) c[evals[s.id].state]++;
    return c;
  }, [evals]);

  const selSvc = SERVICES.find((s) => s.id === selected) || null;
  const selEv = selSvc ? evals[selSvc.id] : null;

  return (
    <MainLayout>
      <div className="space-y-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Service map (prototype)" }]} />

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Prototype.</strong> Set a service user&apos;s profile on the left and watch the town light up. Paths turn green as
            each service&apos;s criteria are met, and close (red) on an exclusion or if they are outside the catchment. Services and criteria
            here are <strong>illustrative demo data</strong> - the real ones come from the service-directory research session.
          </span>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-4">
          {/* ---- Profile panel ---- */}
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
                  <input type="number" min={16} max={110} value={facts.age} onChange={(e) => set("age", Number(e.target.value))} className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1" />
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
                  <Seg value={facts.substance} onChange={(v) => set("substance", v as Facts["substance"])} options={[{ v: "none", label: "None" }, { v: "using", label: "Using" }, { v: "recovery", label: "In recovery" }]} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">PIP</p>
                  <Seg value={facts.pip} onChange={(v) => set("pip", v as Facts["pip"])} options={[{ v: "none", label: "None" }, { v: "applied", label: "Applied" }, { v: "awarded", label: "Awarded" }]} />
                </div>
                <div className="flex gap-2 pt-0.5">
                  <button onClick={() => set("veteran", !facts.veteran)} aria-pressed={facts.veteran}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${facts.veteran ? "bg-nhs-blue text-white border-nhs-blue" : "bg-white text-gray-600 border-gray-200"}`}>Veteran</button>
                  <button onClick={() => set("carer", !facts.carer)} aria-pressed={facts.carer}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${facts.carer ? "bg-nhs-blue text-white border-nhs-blue" : "bg-white text-gray-600 border-gray-200"}`}>Carer</button>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Diagnoses / history</p>
                  <div className="flex flex-wrap gap-1">
                    {DIAGNOSIS_OPTIONS.map((d) => {
                      const on = facts.diagnoses.includes(d);
                      return (
                        <button key={d} onClick={() => toggleDx(d)} aria-pressed={on}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${on ? "bg-nhs-blue text-white border-nhs-blue" : "bg-white text-gray-600 border-gray-200 hover:border-nhs-blue"}`}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* counts */}
            <div className="grid grid-cols-2 gap-2 text-center">
              {([["open", counts.open], ["partial", counts.partial], ["unknown", counts.unknown], ["blocked", counts.blocked]] as const).map(([k, n]) => (
                <div key={k} className="rounded-xl border border-gray-200 bg-white py-2">
                  <p className="text-lg font-bold text-gray-800">{n}</p>
                  <p className="text-[11px] font-semibold text-gray-500">{STATE_META[k].label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Map ---- */}
          <div className="space-y-3">
            <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-gray-200 p-2">
              <svg viewBox="0 0 960 760" className="w-full h-auto" role="img" aria-label="Service town map">
                {/* rings */}
                <circle cx={CX} cy={CY} r={R1} fill="none" stroke="#e2e8f0" strokeDasharray="3 6" />
                <circle cx={CX} cy={CY} r={R2} fill="none" stroke="#e2e8f0" strokeDasharray="3 6" />

                {/* paths */}
                {NODES.map(({ s, x, y }) => {
                  const ev = evals[s.id];
                  return (
                    <line key={"p" + s.id} x1={CX} y1={CY} x2={x} y2={y}
                      stroke={pathColor(ev)} strokeWidth={ev.state === "open" ? 5 : ev.state === "partial" ? 3.5 : 2}
                      strokeDasharray={ev.state === "blocked" ? "4 5" : undefined}
                      opacity={ev.state === "unknown" ? 0.5 : 1}
                      style={{ transition: "stroke 0.4s, stroke-width 0.4s, opacity 0.4s" }}
                      strokeLinecap="round" />
                  );
                })}

                {/* centre hub */}
                <circle cx={CX} cy={CY} r={46} fill="#005EB8" />
                <text x={CX} y={CY - 4} textAnchor="middle" className="fill-white" fontSize="13" fontWeight="700">Service</text>
                <text x={CX} y={CY + 12} textAnchor="middle" className="fill-white" fontSize="13" fontWeight="700">user</text>
                <text x={CX} y={CY + 30} textAnchor="middle" className="fill-white" fontSize="10" opacity={0.85}>{AREA_LABEL[facts.area]}</text>

                {/* nodes */}
                {NODES.map(({ s, x, y }) => {
                  const ev = evals[s.id];
                  const meta = STATE_META[ev.state];
                  const r = s.ring === "primary" ? 34 : 28;
                  const lines = wrap(s.name);
                  const isSel = selected === s.id;
                  return (
                    <g key={s.id} onClick={() => setSelected(s.id)} style={{ cursor: "pointer" }} tabIndex={0} role="button"
                      aria-label={`${s.name}: ${meta.label}`}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(s.id); } }}>
                      <circle cx={x} cy={y} r={r} fill={meta.fill} stroke={meta.border} strokeWidth={isSel ? 4 : 2.5}
                        style={{ transition: "fill 0.4s, stroke 0.4s" }} />
                      {ev.state === "blocked" && (
                        <line x1={x - r * 0.6} y1={y - r * 0.6} x2={x + r * 0.6} y2={y + r * 0.6} stroke="#dc2626" strokeWidth={2.5} />
                      )}
                      {ev.state === "open" && (
                        <text x={x} y={y - r - 4} textAnchor="middle" fontSize="14">{"✅"}</text>
                      )}
                      <text textAnchor="middle" fontSize="10" fontWeight="600" className="fill-gray-700" pointerEvents="none">
                        {lines.map((ln, i) => (
                          <tspan key={i} x={x} y={y + (lines.length === 1 ? 3 : i === 0 ? -3 : 10)}>{ln}</tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 rounded bg-green-600" /> Open</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 rounded bg-lime-500" /> Partly open (criteria being met)</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 rounded bg-slate-300" /> Not eligible yet</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1 rounded bg-red-600" style={{ backgroundImage: "repeating-linear-gradient(90deg,#dc2626 0 4px,transparent 4px 8px)" }} /> Closed (exclusion / catchment)</span>
              <span className="ml-auto text-gray-400">Inner ring = primary services, outer ring = charity / third sector</span>
            </div>

            {/* selected detail */}
            {selSvc && selEv ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-800">{selSvc.name}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATE_META[selEv.state].badge}`}>{STATE_META[selEv.state].label}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{selSvc.ring === "primary" ? "Primary service" : "Charity / third sector"} - serves {selSvc.areas.map((a) => AREA_LABEL[a]).join(", ")}. {selSvc.note}</p>
                {selEv.blockedReason && (
                  <p className="flex items-start gap-1.5 text-sm text-red-700 mb-2"><XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {selEv.blockedReason}</p>
                )}
                {selEv.met.map((c) => (
                  <p key={c} className="flex items-start gap-1.5 text-sm text-green-700"><CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</p>
                ))}
                {selEv.unmet.map((c) => (
                  <p key={c} className="flex items-start gap-1.5 text-sm text-gray-400"><CircleDashed className="w-4 h-4 mt-0.5 flex-shrink-0" /> {c}</p>
                ))}
                {selSvc.include.length === 0 && !selEv.blockedReason && (
                  <p className="text-sm text-green-700">Open to anyone in catchment - no eligibility criteria.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">Click a service to see its criteria and why it is open or closed.</p>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Prototype of Mike&apos;s service-map idea. Demo services and criteria only - no PII. The real version is driven by approved,
          dated profile facts and the actual service directory (admission + exclusion + catchment per service).
        </p>
      </div>
    </MainLayout>
  );
}
