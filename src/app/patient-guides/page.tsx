"use client";

import { MainLayout } from "@/components/layout";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Printer } from "lucide-react";
import { PATIENT_GUIDES } from "@/lib/data/patient-guides";

export default function PatientGuidesIndex() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back to Guides */}
        <Link
          href="/guides"
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
                23 patient-facing guides - print as leaflets for patients and families
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
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

        {/* Info bar */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Named Nurse tip:</strong> Each guide can be printed as a standalone A4 leaflet.
          Use the print button on any guide to create a patient-friendly handout.
        </div>

        {/* Guide cards */}
        <div className="space-y-3">
          {PATIENT_GUIDES.map((guide) => (
            <Link
              key={guide.id}
              href={`/patient-guides/${guide.id}`}
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
        <div className="text-center text-sm text-gray-500">
          {PATIENT_GUIDES.length} guides
        </div>
      </div>
    </MainLayout>
  );
}
