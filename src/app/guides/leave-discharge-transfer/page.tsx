"use client";

// Leave / Discharge / Transfer checklist - admission-checklist style with a
// 3-way pathway toggle. Items filter to the selected pathway; high-risk items
// are flagged; each item can expand for "why this matters" guidance. Tick-off,
// progress bar and print, like the admission checklist. No PII, nothing stored.

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import { useV2Href } from "@/lib/hooks/useV2";
import { ChecklistSummary } from "@/components/guides/ChecklistSummary";
import { PatientLink } from "@/components/guides/PatientLink";
import { Patient } from "@/lib/types";
import { FocusLinks } from "@/components/guides/FocusLinks";
import { LDT_SECTIONS, LDT_PATHWAYS, type LdtPathway } from "@/lib/data/guides";
import {
  ArrowLeft, Printer, RotateCcw, ChevronDown, ChevronRight, Flag, Info, AlertTriangle,
} from "lucide-react";

export default function LeaveDischargeTransferPage() {
  const v2Href = useV2Href();
  const [pathway, setPathway] = useState<LdtPathway>("leave");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [patient, setPatient] = useState<Patient | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const toggleExpand = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));
  const reset = () => setChecked({});

  // Sections with only the items that apply to the active pathway.
  const visibleSections = useMemo(
    () =>
      LDT_SECTIONS.map((s) => ({
        ...s,
        items: s.items.filter((i) => i.pathways.includes(pathway)),
      })).filter((s) => s.items.length > 0),
    [pathway]
  );

  const { done, total } = useMemo(() => {
    const items = visibleSections.flatMap((s) => s.items);
    return { done: items.filter((i) => checked[i.id]).length, total: items.length };
  }, [visibleSections, checked]);

  const pct = total ? Math.round((done / total) * 100) : 0;
  const activePathway = LDT_PATHWAYS.find((p) => p.id === pathway)!;

  return (
    <MainLayout>
      <div className="space-y-5">
        <div>
          <Breadcrumb items={[{ label: "Guides", href: v2Href("/guides") }, { label: "Leave / Discharge / Transfer" }]} />
        </div>
        <PatientLink patient={patient} onChange={setPatient} guideTitle="Leave / Discharge / Transfer" />
        <FocusLinks links={[
          { label: "Discharge Care Plan (SystmOne)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/4829/2454" },
          { label: "Discharge, Transfers & Leave (Trust policy)", url: "https://focus.derbyshirehealthcareft.nhs.uk/download_file/1795/2454" },
        ]} />

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">🚪</div>
              <div>
                <h1 className="text-3xl font-bold">Leave, Discharge & Transfer</h1>
                <p className="text-white/80 mt-1">One safety checklist, three pathways - pick yours and work down the list.</p>
              </div>
            </div>
            <Link href={v2Href("/guides")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Checklist aid only - it does not replace the SystmOne records, the S17 leave form, or the discharge summary. Red-flagged items are safety-critical.
          </span>
        </div>

        {/* Pathway toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LDT_PATHWAYS.map((p) => {
            const on = p.id === pathway;
            return (
              <button
                key={p.id}
                onClick={() => setPathway(p.id)}
                aria-pressed={on}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                  on ? "border-teal-500 bg-teal-50 shadow-sm" : "border-gray-200 bg-white hover:border-teal-300"
                }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <span>
                  <span className={`block font-bold ${on ? "text-teal-800" : "text-gray-800"}`}>{p.label}</span>
                  <span className="block text-xs text-gray-500">{p.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress + actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>{activePathway.label} checklist</span>
              <span>{done} / {total} done</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors print:hidden">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        {/* High-risk legend */}
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <Flag className="w-3.5 h-3.5" /> Red flag = safety-critical, do not skip.
        </p>

        {/* Sections */}
        <div className="space-y-4">
          {visibleSections.map((section) => (
            <div key={section.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <span className="text-lg">{section.icon}</span>
                <h2 className="font-bold text-gray-800 text-sm">{section.title}</h2>
              </div>
              <ul className="divide-y divide-gray-50">
                {section.items.map((item) => {
                  const isChecked = !!checked[item.id];
                  const isOpen = !!expanded[item.id];
                  return (
                    <li
                      key={item.id}
                      className={`${item.highRisk ? "border-l-4 border-rose-400 bg-rose-50/40" : "border-l-4 border-transparent"}`}
                    >
                      <div className="flex items-start gap-3 px-3.5 py-2.5">
                        <button
                          onClick={() => toggleCheck(item.id)}
                          aria-pressed={isChecked}
                          aria-label={isChecked ? "Mark not done" : "Mark done"}
                          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            isChecked ? "bg-teal-600 border-teal-600 text-white" : "border-gray-300 bg-white hover:border-teal-400"
                          }`}
                        >
                          {isChecked && <span className="text-xs leading-none">&#10003;</span>}
                        </button>

                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => toggleCheck(item.id)}
                            className={`text-left text-sm ${isChecked ? "text-gray-400 line-through" : "text-gray-800"}`}
                          >
                            {item.highRisk && <Flag className="inline w-3.5 h-3.5 text-rose-500 mr-1 -mt-0.5" />}
                            {item.label}
                          </button>
                        </div>

                        {item.guidance && (
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
                            aria-label={isOpen ? "Hide guidance" : "Show guidance"}
                          >
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                      </div>

                      {item.guidance && isOpen && (
                        <div className="px-3.5 pb-3 pl-11">
                          <p className="flex items-start gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5">
                            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                            {item.guidance}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Case note entry (optional, low priority) */}
        <ChecklistSummary
          title={`${activePathway.label} checklist`}
          patientName={patient?.name}
          completed={visibleSections.flatMap((s) => s.items).filter((i) => checked[i.id]).map((i) => i.label)}
          outstanding={visibleSections.flatMap((s) => s.items).filter((i) => !checked[i.id]).map((i) => i.label)}
        />

        <p className="text-xs text-gray-400 text-center">
          Checklist aid only, source-aligned with NHS leave / discharge standards and the Trust workflow. Draft - to be verified.
        </p>
      </div>
    </MainLayout>
  );
}
