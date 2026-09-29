"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Download, Upload } from "lucide-react";
import { ALL_GUIDES } from "@/lib/data/guides/catalog";
import { WORKFLOWS } from "@/lib/data/guides/referral-workflows";
import { GUIDES } from "@/lib/data/guides/howto-guides";
import type { StoredGuide } from "@/lib/data/guides/guide-store";
import { parseStore } from "@/lib/data/guides/guide-store";
import { Button } from "@/components/ui";
import { TextField, smallButton } from "./fields";

export function GuideList({
  stored, onCreate, onOpenStored, onOpenBuiltIn, onDeleteStored, onImport, onExportAll, link,
}: {
  stored: StoredGuide[];
  onCreate: (title: string, kind: "guide" | "workflow") => void;
  onOpenStored: (g: StoredGuide) => void;
  onOpenBuiltIn: (id: string) => void;
  onDeleteStored: (g: StoredGuide) => void;
  onImport: (guides: StoredGuide[]) => void;
  onExportAll: () => void;
  link: (path: string) => string;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"guide" | "workflow">("guide");
  const [filter, setFilter] = useState("");
  const [importNote, setImportNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const q = filter.trim().toLowerCase();
  const builtIn = ALL_GUIDES.filter((g) => g.viewerPath.startsWith("/guides/") && (!q || g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)));

  const readFile = async (file: File) => {
    const parsed = parseStore(await file.text());
    if (parsed.length === 0) {
      setImportNote("That file has no guides in it that the editor can read.");
      return;
    }
    onImport(parsed);
    setImportNote(`Imported ${parsed.length} ${parsed.length === 1 ? "guide" : "guides"}.`);
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border-2 border-gray-200 p-5 space-y-4">
        <h2 className="text-lg font-bold text-nhs-dark-blue">Start a new guide</h2>
        <TextField label="Title" value={title} onChange={setTitle} placeholder="Managing a missed depot injection" />
        <fieldset>
          <legend className="text-sm font-semibold text-nhs-black mb-2">What sort of guide?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["guide", "Read-through guide", "Steps of text, with tips, questions and branching where you want them."],
              ["workflow", "Referral", "Starts with the standard steps: criteria, forms, where to send it, case note, diary, data protection."],
            ] as ["guide" | "workflow", string, string][]).map(([value, label, help]) => (
              <button
                key={value}
                type="button"
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
                className={`text-left p-4 rounded-xl border-2 ${kind === value ? "border-nhs-blue bg-blue-50" : "border-gray-300 bg-white hover:border-nhs-blue"}`}
              >
                <span className="block font-bold text-nhs-black">{label}</span>
                <span className="block text-sm text-nhs-dark-grey">{help}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <Button onClick={() => onCreate(title.trim(), kind)} disabled={!title.trim()}>Create guide</Button>
      </section>

      <section className="bg-white rounded-2xl border-2 border-gray-200 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-nhs-dark-blue">Your guides on this browser</h2>
          <div className="flex gap-2">
            <button type="button" className={`${smallButton} inline-flex items-center gap-1.5`} onClick={onExportAll} disabled={stored.length === 0}>
              <Download className="w-4 h-4" /> Download all
            </button>
            <button type="button" className={`${smallButton} inline-flex items-center gap-1.5`} onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import guides from a file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void readFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <p className="text-sm text-nhs-dark-grey">
          Saved in this browser only, until the shared store is connected. Download a copy if you want to keep one or move it to another computer.
        </p>
        {importNote && <p role="status" className="text-sm font-semibold text-nhs-dark-blue">{importNote}</p>}
        {stored.length === 0 ? (
          <p className="text-sm text-nhs-dark-grey">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {stored.map((g) => (
              <li key={g.id} className="py-3 flex flex-wrap items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{g.look.icon}</span>
                <div className="flex-1 min-w-[12rem]">
                  <p className="font-bold text-nhs-black">{g.data.title}</p>
                  <p className="text-xs text-nhs-dark-grey">
                    {g.kind === "workflow" ? "Referral" : "Guide"} · {g.data.steps.length} steps
                    {g.basedOn ? " · edited copy of a built-in guide" : ""}
                  </p>
                </div>
                <Link href={link(`/guides/${g.id}`)} className={`${smallButton} no-underline`}>View</Link>
                <button type="button" className={smallButton} onClick={() => onOpenStored(g)}>Edit</button>
                <button type="button" className={`${smallButton} text-nhs-red`} onClick={() => onDeleteStored(g)}>
                  {g.basedOn ? "Put the built-in back" : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-2xl border-2 border-gray-200 p-5 space-y-3">
        <h2 className="text-lg font-bold text-nhs-dark-blue">Built-in guides</h2>
        <p className="text-sm text-nhs-dark-grey">
          Editing one saves a copy that replaces it in this browser. The built-in version is never changed.
        </p>
        <TextField label="Find a guide" value={filter} onChange={setFilter} />
        <ul className="divide-y divide-gray-200 max-h-[28rem] overflow-y-auto">
          {builtIn.map((g) => {
            const id = g.viewerPath.replace("/guides/", "");
            // The interactive tools (risk, care plan, the checkers) have their own screens
            // and are not in howto-guides.ts, so there is nothing here to edit.
            const editable = !!WORKFLOWS[id] || !!GUIDES[id];
            const hasCopy = stored.some((s) => s.id === id);
            return (
              <li key={g.id} className="py-2.5 flex flex-wrap items-center gap-3">
                <span className="text-xl" aria-hidden="true">{g.icon}</span>
                <div className="flex-1 min-w-[12rem]">
                  <p className="font-semibold text-nhs-black">{g.title}</p>
                  <p className="text-xs text-nhs-dark-grey">{g.category}{hasCopy ? " · you have an edited copy" : ""}</p>
                </div>
                {editable ? (
                  <button type="button" className={smallButton} onClick={() => onOpenBuiltIn(id)}>
                    {hasCopy ? "Open my copy" : "Edit a copy"}
                  </button>
                ) : (
                  <span className="text-xs text-nhs-dark-grey">Interactive tool, not editable here</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
