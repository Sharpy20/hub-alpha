"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout";
import { Breadcrumb } from "@/components/ui";
import { ResourceLinks } from "@/components/guides/ResourceLinks";
import { ADMISSION_CHECKLIST } from "@/lib/data/guides";
import { useV2Href } from "@/lib/hooks/useV2";
import { ArrowLeft, Check, Printer, RotateCcw, ClipboardList, Info } from "lucide-react";

export default function AdmissionChecklistPage() {
  const v2Href = useV2Href();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const allItems = useMemo(
    () => ADMISSION_CHECKLIST.flatMap((g) => g.items.map((i) => i.id)),
    []
  );
  const doneCount = allItems.filter((id) => checked[id]).length;
  const total = allItems.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const reset = () => setChecked({});

  return (
    <MainLayout>
      <div className="space-y-6 print:space-y-3">
        <div className="print:hidden">
          <Breadcrumb
            items={[
              { label: "Guides", href: v2Href("/guides") },
              { label: "Admission Checklist" },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-3xl">
                ✅
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admission Checklist</h1>
                <p className="text-white/80 mt-1">
                  Everything to do when a patient is admitted. Work through it in any order.
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
        </div>

        {/* Progress + actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700">
                  {doneCount} of {total} done
                </span>
                <span className="text-gray-400">{pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800 print:hidden">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Ticks are just for you and reset when you leave the page - this is a memory aid, not a patient record.
            Record completed tasks in SystemOne. Links marked{" "}
            <span className="font-semibold text-amber-800">FOCUS</span> only open on a Trust computer.
          </p>
        </div>

        {/* Groups */}
        {ADMISSION_CHECKLIST.map((group) => {
          const groupDone = group.items.filter((i) => checked[i.id]).length;
          return (
            <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-xl">{group.icon}</span>
                <h2 className="font-bold text-gray-800 flex-1">{group.title}</h2>
                <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                  {groupDone}/{group.items.length}
                </span>
              </div>
              <ul className="divide-y divide-gray-50">
                {group.items.map((item) => {
                  const isDone = !!checked[item.id];
                  return (
                    <li key={item.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggle(item.id)}
                          aria-pressed={isDone}
                          aria-label={`Mark "${item.text}" ${isDone ? "not done" : "done"}`}
                          className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isDone
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-green-400 bg-white"
                          }`}
                        >
                          {isDone && <Check className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isDone ? "text-gray-400 line-through" : "text-gray-800"}`}>
                            {item.text}
                            {item.documentThis && (
                              <span className="ml-2 align-middle text-[10px] uppercase tracking-wide bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded no-underline">
                                document this
                              </span>
                            )}
                          </p>
                          {item.note && (
                            <p className="text-sm text-gray-500 mt-1">{item.note}</p>
                          )}
                          {item.subItems && (
                            <ul className="mt-2 space-y-1">
                              {item.subItems.map((sub, si) => (
                                <li key={si} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="text-gray-300 mt-1.5 w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                  <span>{sub}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {item.links && (
                            <div className="mt-2">
                              <ResourceLinks links={item.links} />
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* Footer cross-link */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 print:hidden">
          <h3 className="font-bold text-indigo-900">Detained patient?</h3>
          <p className="text-sm text-indigo-700 mt-1 mb-3">
            Use the detention papers checker to confirm exactly which MHA forms you should have, and scrutinise them.
          </p>
          <Link
            href={v2Href("/guides/mha-checker")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors no-underline"
          >
            <ClipboardList className="w-4 h-4" />
            Open the detention papers checker
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
