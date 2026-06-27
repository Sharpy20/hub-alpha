"use client";

// Pure-guidance renderer for the clinical documentation guides.
//
// Each section is a collapsible question showing: why it matters, prompts to
// think through, worked examples (to spark thinking, not to copy), and a tip.
// No chips, no assembled output, no copy button - it is a thinking guide that
// helps the nurse write a better, individual entry in SystmOne themselves.

import { useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import { useV2Href } from "@/lib/hooks/useV2";
import type { GuidePromptConfig, GuidePromptSection } from "@/lib/data/guides/guideprompt";
import {
  ArrowLeft, ChevronDown, ChevronRight, AlertTriangle, Sparkles, Check, Lightbulb,
} from "lucide-react";

function Section({ section, defaultOpen }: { section: GuidePromptSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-800 flex-1">{section.heading}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {section.why && (
            <div className="rounded-lg bg-sky-50 border border-sky-100 p-3 text-sm text-sky-900">
              {section.why}
            </div>
          )}

          {section.think && section.think.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-700 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Prompt yourself
              </p>
              <ul className="space-y-1.5">
                {section.think.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-sky-400 mt-0.5 flex-shrink-0">&bull;</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.examples && section.examples.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 mb-1.5">
                Examples - to spark thinking, not to copy
              </p>
              <ul className="space-y-1.5">
                {section.examples.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.tip && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3 text-sm text-amber-800">
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{section.tip}</span>
            </div>
          )}

          {section.note && <p className="text-xs text-gray-500">{section.note}</p>}
        </div>
      )}
    </div>
  );
}

export function GuidePrompts({ config }: { config: GuidePromptConfig }) {
  const v2Href = useV2Href();
  const [allOpen, setAllOpen] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-5">
        <div>
          <Breadcrumb items={[{ label: "Guides", href: v2Href("/guides") }, { label: config.breadcrumb }]} />
        </div>

        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">{config.icon}</div>
              <div>
                <h1 className="text-3xl font-bold">{config.title}</h1>
                <p className="text-white/80 mt-1">{config.subtitle}</p>
                <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  <Lightbulb className="w-3.5 h-3.5" /> Pointers to think through, not a form to fill in
                </span>
              </div>
            </div>
            <Link href={v2Href("/guides")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" /> All guides
            </Link>
          </div>
        </div>

        {/* Notice */}
        {config.notice && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{config.notice}</span>
          </div>
        )}

        {/* Intro */}
        {config.intro && (
          <p className="text-gray-600 text-sm leading-relaxed">{config.intro}</p>
        )}

        {/* Principles */}
        {config.principles && config.principles.length > 0 && (
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
            <ul className="space-y-1">
              {config.principles.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-sky-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expand all toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setAllOpen((o) => !o)}
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          {config.sections.map((sec, i) => (
            // key includes allOpen so toggling expand/collapse-all remounts with the new default
            <Section key={`${sec.id}-${allOpen}`} section={sec} defaultOpen={allOpen || i === 0} />
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center">
          {config.footer || "Guidance aid only. Think it through, then write the entry in the patient's own specifics."}
        </p>
      </div>
    </MainLayout>
  );
}
