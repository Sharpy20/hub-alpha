"use client";

import { useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import {
  MHA_PATHWAYS, MHA_SCRUTINY, MHA_RECTIFY_NOTE,
  type MhaForm, type MhaPathway,
} from "@/lib/data/guides/admission";
import { useV2Href } from "@/lib/hooks/useV2";
import { FocusLinks } from "@/components/guides/FocusLinks";
import { PatientLink } from "@/components/guides/PatientLink";
import { Patient } from "@/lib/types";
import {
  ArrowLeft, Check, Printer, ScrollText, AlertTriangle, Info, Plus, ClipboardList, Download,
} from "lucide-react";

// A single statutory-form tile.
function FormTile({ form, tone = "blue" }: { form: MhaForm; tone?: "blue" | "green" }) {
  const tones = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-300 text-green-900",
  };
  return (
    <div className={`rounded-xl border-2 px-3 py-2 text-center min-w-[92px] ${tones[tone]}`}>
      <div className="text-xl font-extrabold leading-tight">{form.code}</div>
      <div className="text-[11px] font-medium leading-snug mt-0.5">{form.name}</div>
      <div className="text-[10px] opacity-70 mt-0.5">{form.who}</div>
    </div>
  );
}

export default function MhaCheckerPage() {
  const v2Href = useV2Href();
  const [pathwayId, setPathwayId] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  // Per-requirement chosen alternative (for OR options like A3 vs 2x A4).
  const [choice, setChoice] = useState<Record<number, number>>({});
  const [showScrutiny, setShowScrutiny] = useState(false);
  const [ticks, setTicks] = useState<Record<string, boolean>>({});

  const pathway: MhaPathway | undefined = MHA_PATHWAYS.find((p) => p.id === pathwayId);

  const selectPathway = (id: string) => {
    setPathwayId(id);
    setChoice({});
    setShowScrutiny(false);
    setTicks({});
  };

  const scrutinySets = pathway ? pathway.scrutiny.map((k) => MHA_SCRUTINY[k]) : [];

  return (
    <MainLayout>
      <div className="space-y-6 print:space-y-3">
        <div className="print:hidden">
          <Breadcrumb
            items={[
              { label: "Guides", href: v2Href("/guides") },
              { label: "Section Papers - Receipt & Scrutiny" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">
                ⚖️
              </div>
              <div>
                <h1 className="text-3xl font-bold">Section Papers</h1>
                <p className="text-white/80 mt-1">
                  Receiving a detained patient? Check which MHA forms you should have, then scrutinise them.
                </p>
              </div>
            </div>
            <Link
              href={v2Href("/guides")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline print:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              All guides
            </Link>
          </div>
          <PatientLink patient={patient} onChange={setPatient} guideTitle="Section Papers" note="Links this check to a patient for your reference" />
        </div>

        {/* Trust MHA policies on FOCUS */}
        <FocusLinks links={[
          { label: "Receipt & Scrutiny of Section Papers (policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1825/2454" },
          { label: "Section 4 (policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1826/2454" },
          { label: "Section 5(2) (policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1827/2454" },
          { label: "Section 5(4) (policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1831/2454" },
          { label: "CTO (policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1822/2454" },
          { label: "MHA Documents SOP", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/3481/2456" },
        ]} />

        {/* Step 1: pick the pathway */}
        <div className="print:hidden">
          <h2 className="font-bold text-gray-800 mb-3">
            1. What is happening?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {MHA_PATHWAYS.map((p) => {
              const active = p.id === pathwayId;
              return (
                <button
                  key={p.id}
                  onClick={() => selectPathway(p.id)}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${
                    active
                      ? "border-indigo-500 bg-indigo-50 shadow-md"
                      : "border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-1">{p.icon}</div>
                  <div className="font-bold text-gray-800 leading-tight">{p.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{p.detail}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: required paperwork */}
        {pathway && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-xl">{pathway.icon}</span>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-800">{pathway.label}</h2>
                  <p className="text-xs text-gray-500">{pathway.detail}</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors print:hidden"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>

              <div className="p-5 space-y-5">
                {pathway.verify && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      This pathway is not in the trust admission checklist - confirm the exact local process with your MHA office.
                    </p>
                  </div>
                )}

                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Paperwork you should have
                </p>

                {/* Requirement blocks */}
                <div className="space-y-4">
                  {pathway.requirements.map((req, ri) => {
                    const selected = choice[ri] ?? 0;
                    const hasAlternatives = req.options.length > 1;
                    return (
                      <div key={ri} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                        <div className="text-sm font-bold text-gray-700 mb-2">{req.label}</div>
                        <div className="flex flex-wrap items-center gap-3">
                          {req.options.map((set, oi) => {
                            const isSel = !hasAlternatives || oi === selected;
                            return (
                              <div key={oi} className="flex items-center gap-3">
                                {oi > 0 && (
                                  <span className="text-xs font-bold text-gray-400 uppercase">or</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => hasAlternatives && setChoice((c) => ({ ...c, [ri]: oi }))}
                                  className={`flex items-center gap-2 rounded-xl p-1 transition-all ${
                                    hasAlternatives
                                      ? isSel
                                        ? "ring-2 ring-indigo-400"
                                        : "opacity-50 hover:opacity-80"
                                      : ""
                                  } ${hasAlternatives ? "cursor-pointer" : "cursor-default"}`}
                                >
                                  {set.map((form, fi) => (
                                    <div key={fi} className="flex items-center gap-2">
                                      {fi > 0 && <Plus className="w-4 h-4 text-gray-400" />}
                                      <FormTile form={form} />
                                    </div>
                                  ))}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        {(() => {
                          const sel = req.options[selected] ?? req.options[0];
                          const withUrls = sel.filter((f) => f.url);
                          if (withUrls.length === 0) return null;
                          return (
                            <div className="mt-2 flex flex-wrap gap-3">
                              {withUrls.map((f, i) => (
                                <a
                                  key={i}
                                  href={f.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 no-underline"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Blank {f.code}
                                </a>
                              ))}
                            </div>
                          );
                        })()}
                        {req.note && (
                          <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            {req.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Nurse completes */}
                {pathway.nurseCompletes && (
                  <div className="rounded-xl border-2 border-green-200 bg-green-50/60 p-3">
                    <div className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      You complete
                    </div>
                    <FormTile form={pathway.nurseCompletes} tone="green" />
                    {pathway.nurseCompletes.url && (
                      <a
                        href={pathway.nurseCompletes.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-800 hover:text-green-900 no-underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Blank {pathway.nurseCompletes.code}
                      </a>
                    )}
                  </div>
                )}

                {/* Notes */}
                {pathway.notes && pathway.notes.length > 0 && (
                  <ul className="space-y-2">
                    {pathway.notes.map((n, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Step 3: scrutiny checklist */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowScrutiny((s) => !s)}
                className="w-full flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left print:hidden"
              >
                <ScrollText className="w-5 h-5 text-indigo-500" />
                <span className="font-bold text-gray-800 flex-1">Scrutiny checklist</span>
                <span className="text-xs font-semibold text-indigo-600">
                  {showScrutiny ? "Hide" : "Show"}
                </span>
              </button>

              <div className={showScrutiny ? "block" : "hidden print:block"}>
                <div className="p-5 space-y-5">
                  {scrutinySets.map((set) => (
                    <div key={set.title}>
                      <h3 className="font-bold text-gray-700 mb-2">{set.title}</h3>
                      <ul className="space-y-1.5">
                        {set.items.map((item, i) => {
                          const key = `${set.title}-${i}`;
                          const on = !!ticks[key];
                          return (
                            <li key={key}>
                              <button
                                onClick={() => setTicks((t) => ({ ...t, [key]: !t[key] }))}
                                className="flex items-start gap-3 text-left w-full group"
                              >
                                <span
                                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    on
                                      ? "bg-indigo-500 border-indigo-500 text-white"
                                      : "border-gray-300 group-hover:border-indigo-400 bg-white"
                                  }`}
                                >
                                  {on && <Check className="w-3.5 h-3.5" />}
                                </span>
                                <span className={`text-sm ${on ? "text-gray-400 line-through" : "text-gray-700"}`}>
                                  {item}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}

                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{MHA_RECTIFY_NOTE}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-link: what the section means */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 print:hidden">
              <h3 className="font-bold text-indigo-900">Not sure about the section itself?</h3>
              <p className="text-sm text-indigo-700 mt-1 mb-3">
                Mental Health Act Statuses Explained covers what each section means, the timescales, and the patient&apos;s rights.
              </p>
              <Link
                href={v2Href("/guides/mha-statuses")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors no-underline"
              >
                <ScrollText className="w-4 h-4" />
                Open MHA Statuses Explained
              </Link>
            </div>

            {/* Cross-link */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 print:hidden">
              <h3 className="font-bold text-emerald-900">New admission?</h3>
              <p className="text-sm text-emerald-700 mt-1 mb-3">
                The admission checklist covers everything else - assessments, care plan, rights and observations.
              </p>
              <Link
                href={v2Href("/guides/admission-checklist")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors no-underline"
              >
                <ClipboardList className="w-4 h-4" />
                Open the admission checklist
              </Link>
            </div>
          </div>
        )}

        {!pathway && (
          <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-500 print:hidden">
            <ScrollText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Pick a scenario above to see the paperwork.</p>
            <Link
              href={v2Href("/guides/mha-statuses")}
              className="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800 no-underline"
            >
              Or read what each MHA section means
            </Link>
          </div>
        )}

        {/* Source note */}
        <p className="text-xs text-gray-400 text-center print:hidden">
          Based on the MHA 1983 statutory forms and the national receipt &amp; scrutiny process. Always defer to your MHA office and trust policy.
        </p>
      </div>
    </MainLayout>
  );
}
