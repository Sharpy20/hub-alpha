"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { MainLayout } from "@/components/layout";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { PATIENT_GUIDES } from "@/lib/data/patient-guides";

export default function PatientGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const containerRef = useRef<HTMLDivElement>(null);
  const [guideHtml, setGuideHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const guide = PATIENT_GUIDES.find((g) => g.id === id);
  const guideIndex = PATIENT_GUIDES.findIndex((g) => g.id === id);
  const prevGuide = guideIndex > 0 ? PATIENT_GUIDES[guideIndex - 1] : null;
  const nextGuide = guideIndex < PATIENT_GUIDES.length - 1 ? PATIENT_GUIDES[guideIndex + 1] : null;

  // Fetch and extract the guide HTML from the static file
  useEffect(() => {
    setLoading(true);
    fetch("/patient-guides.html")
      .then((r) => r.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const section = doc.getElementById(id);
        if (section) {
          setGuideHtml(section.outerHTML);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Initialise bubble animations + breathing label after content renders
  useEffect(() => {
    if (!guideHtml || !containerRef.current) return;

    // Set guide color CSS variable
    const guideEl = containerRef.current.querySelector(".guide") as HTMLElement;
    if (guideEl) {
      const color = guideEl.dataset.color;
      const body = guideEl.querySelector(".guide-body") as HTMLElement;
      if (body && color) body.style.setProperty("--guide-color", color);
    }

    // Bubble entrance via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );
    containerRef.current.querySelectorAll(".bubble").forEach((b) => observer.observe(b));

    // Breathing phase label
    function updateBreathLabel() {
      const t = (Date.now() / 1000) % 16;
      let label: string;
      if (t < 4) label = "Breathe in\u2026";
      else if (t < 8) label = "Hold\u2026";
      else if (t < 12) label = "Breathe out\u2026";
      else label = "Hold\u2026";
      containerRef.current
        ?.querySelectorAll(".breath-phase-label")
        .forEach((el) => (el.textContent = label));
    }
    const interval = setInterval(updateBreathLabel, 200);
    updateBreathLabel();

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [guideHtml]);

  const handlePrint = useCallback(() => {
    // Open the static HTML in single-guide mode for printing
    const printWin = window.open(`/patient-guides.html?guide=${id}`, "_blank");
    if (printWin) {
      printWin.addEventListener("load", () => {
        setTimeout(() => printWin.print(), 300);
      });
    }
  }, [id]);

  if (!guide) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-lg text-gray-500">Guide not found.</p>
          <Link href="/patient-guides" className="text-indigo-600 mt-4 inline-block">
            Back to all guides
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/patient-guides"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            All MH guides
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print this guide
          </button>
        </div>

        {/* Guide title bar */}
        <div
          className="rounded-xl p-4 text-white flex items-center gap-3"
          style={{ background: guide.color }}
        >
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
            {guide.number}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{guide.title}</h1>
            <p className="text-white/80 text-sm">{guide.subtitle}</p>
          </div>
        </div>

        {/* Guide content */}
        <div className="patient-guide-container" ref={containerRef}>
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="animate-pulse text-gray-400">Loading guide...</div>
            </div>
          ) : guideHtml ? (
            <div dangerouslySetInnerHTML={{ __html: guideHtml }} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Could not load guide content.</p>
            </div>
          )}
        </div>

        {/* Prev/Next navigation */}
        <div className="flex items-center justify-between gap-4">
          {prevGuide ? (
            <Link
              href={`/patient-guides/${prevGuide.id}`}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all no-underline group flex-1 min-w-0"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Previous</p>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-600 truncate">
                  {prevGuide.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextGuide ? (
            <Link
              href={`/patient-guides/${nextGuide.id}`}
              className="flex items-center justify-end gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all no-underline group flex-1 min-w-0 text-right"
            >
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Next</p>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-600 truncate">
                  {nextGuide.title}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 flex-shrink-0" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
