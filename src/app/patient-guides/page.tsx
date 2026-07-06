"use client";

import { useState, useCallback } from "react";
import { MainLayout } from "@/components/layout";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Printer, ClipboardList, Check } from "lucide-react";
import { PATIENT_GUIDES } from "@/lib/data/patient-guides";
import { useV2Href } from "@/lib/hooks/useV2";

export default function PatientGuidesIndex() {
  const link = useV2Href();
  const [showTickSheet, setShowTickSheet] = useState(false);
  const [selectedGuides, setSelectedGuides] = useState<Set<string>>(new Set());

  const toggleGuide = (id: string) => {
    setSelectedGuides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedGuides(new Set(PATIENT_GUIDES.map((g) => g.id)));
  const selectNone = () => setSelectedGuides(new Set());

  const handlePrintSelected = useCallback(() => {
    const ids = Array.from(selectedGuides);
    if (ids.length === 0) return;
    const printWin = window.open(`/patient-guides.html?guides=${ids.join(",")}`, "_blank");
    if (printWin) {
      printWin.addEventListener("load", () => {
        setTimeout(() => printWin.print(), 400);
      });
    }
  }, [selectedGuides]);

  const handlePrintTickSheet = useCallback(() => {
    window.print();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back to Guides */}
        <Link
          href={link("/guides")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guides
        </Link>

        {/* Header */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #2D3748 100%)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-3xl">🧠</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Named Nurse Talking Points</h1>
              <p className="text-white/80 mt-1">
                {PATIENT_GUIDES.length} patient-facing guides - print as leaflets for patients and families
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowTickSheet(!showTickSheet)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors text-sm"
            >
              <ClipboardList className="w-4 h-4" />
              {showTickSheet ? "Close tick sheet" : "Patient tick sheet"}
            </button>
            <a
              href="/patient-guides.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors text-sm no-underline"
            >
              <Printer className="w-4 h-4" />
              Print all guides
            </a>
          </div>
        </div>

        {/* Demo disclaimer */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800">
          <strong>Demo mode:</strong> These guides have not been vetted by the Trust communications team.
          Content is for demonstration purposes only and must not be used in clinical practice without formal review and approval.
        </div>

        {/* Info bar */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Named Nurse tip:</strong> Each guide can be printed as a standalone A4 leaflet.
          Use the print button on any guide, or use the tick sheet to let patients choose which ones they want.
        </div>

        {/* Tick sheet mode */}
        {showTickSheet && (
          <div className="bg-white rounded-2xl border-2 border-indigo-200 overflow-hidden print:border-gray-300">
            {/* Tick sheet header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-5 text-white print:bg-gray-800 print:text-black">
              <h2 className="text-xl font-bold print:text-lg">Which guides would you like?</h2>
              <p className="text-white/80 text-sm mt-1 print:text-gray-600">
                Tick the ones you are interested in and give this sheet to your named nurse.
              </p>
            </div>

            {/* Select all / none buttons (hidden on print) */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 print:hidden">
              <div className="flex items-center gap-2">
                <button onClick={selectAll} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium">Select all</button>
                <button onClick={selectNone} className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">Clear all</button>
              </div>
              <span className="text-xs text-gray-500">{selectedGuides.size} of {PATIENT_GUIDES.length} selected</span>
            </div>

            {/* Tick list */}
            <div className="divide-y divide-gray-100 print:divide-gray-300">
              {PATIENT_GUIDES.map((guide) => {
                const isSelected = selectedGuides.has(guide.id);
                return (
                  <button
                    key={guide.id}
                    onClick={() => toggleGuide(guide.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                      isSelected ? "bg-indigo-50" : "hover:bg-gray-50"
                    } print:bg-transparent print:py-1.5`}
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors print:w-5 print:h-5 ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white print:bg-transparent print:border-gray-800"
                          : "border-gray-300 print:border-gray-500"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 print:hidden" />}
                    </div>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold print:w-6 print:h-6 print:text-xs"
                      style={{ background: guide.color }}
                    >
                      {guide.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm print:text-xs">{guide.title}</p>
                      <p className="text-gray-500 text-xs print:text-[10px] print:text-gray-600">{guide.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action buttons (hidden on print) */}
            <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-200 bg-gray-50 print:hidden">
              <button
                onClick={handlePrintTickSheet}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                <Printer className="w-4 h-4" />
                Print blank tick sheet
              </button>
              <button
                onClick={handlePrintSelected}
                disabled={selectedGuides.size === 0}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  selectedGuides.size > 0
                    ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Printer className="w-4 h-4" />
                Print {selectedGuides.size} selected guide{selectedGuides.size !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}

        {/* Guide cards */}
        <div className="space-y-3 print:hidden">
          {PATIENT_GUIDES.map((guide) => (
            <Link
              key={guide.id}
              href={link(`/patient-guides/${guide.id}`)}
              className="block no-underline"
            >
              <div className="bg-white rounded-xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer group">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                  style={{ background: guide.color }}
                >
                  {guide.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {guide.subtitle}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Count */}
        <div className="text-center text-sm text-gray-500 print:hidden">
          {PATIENT_GUIDES.length} guides
        </div>
      </div>
    </MainLayout>
  );
}
