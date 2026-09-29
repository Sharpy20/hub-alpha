"use client";

import { ALL_GUIDES } from "@/lib/data/guides/catalog";
import type { GuideData } from "@/lib/data/guides/howto-guides";
import { checkGuide, type EditorStep } from "@/lib/data/guides/editor-model";
import { enumerateRoutes } from "@/lib/data/guides/branching";
import type { StoredGuide } from "@/lib/data/guides/guide-store";
import { BlockPanel, SelectField, TextAreaField, TextField, ToggleChip } from "./fields";
import { ListEditor } from "./ListEditor";

const ICONS = ["📖", "🗣️", "🏥", "🛡️", "👶", "🏠", "👥", "🥗", "🩹", "🦷", "🏃", "🧩", "💬", "📋", "⚖️", "💊", "🩺", "💉", "🧠", "❤️", "🔬", "🚪", "📝", "📊"];

const GRADIENTS = [
  { value: "from-blue-500 to-blue-700", label: "Blue" },
  { value: "from-indigo-500 to-indigo-700", label: "Indigo" },
  { value: "from-violet-500 to-violet-700", label: "Violet" },
  { value: "from-purple-500 to-purple-700", label: "Purple" },
  { value: "from-rose-500 to-rose-700", label: "Rose" },
  { value: "from-red-600 to-red-800", label: "Red" },
  { value: "from-orange-500 to-orange-700", label: "Orange" },
  { value: "from-amber-500 to-amber-700", label: "Amber" },
  { value: "from-emerald-500 to-emerald-700", label: "Green" },
  { value: "from-teal-500 to-teal-700", label: "Teal" },
  { value: "from-cyan-500 to-cyan-700", label: "Cyan" },
  { value: "from-sky-500 to-sky-700", label: "Sky" },
  { value: "from-slate-500 to-slate-700", label: "Grey" },
];

export const GUIDE_CATEGORIES = [...new Set(ALL_GUIDES.map((g) => g.category))];

export function DetailsPanel({ guide, onChange }: { guide: StoredGuide; onChange: (g: StoredGuide) => void }) {
  const icons = ICONS.includes(guide.look.icon) ? ICONS : [guide.look.icon, ...ICONS];
  const gradients = GRADIENTS.some((g) => g.value === guide.look.gradient)
    ? GRADIENTS
    : [{ value: guide.look.gradient, label: "Current" }, ...GRADIENTS];
  const categories = GUIDE_CATEGORIES.includes(guide.look.category) ? GUIDE_CATEGORIES : [guide.look.category, ...GUIDE_CATEGORIES];

  const setData = (patch: Partial<GuideData>) => onChange({ ...guide, data: { ...guide.data, ...patch } } as StoredGuide);
  const setLook = (patch: Partial<StoredGuide["look"]>) => {
    const look = { ...guide.look, ...patch };
    // A referral keeps its icon and colour on the guide itself as well.
    if (guide.kind === "workflow") onChange({ ...guide, look, data: { ...guide.data, icon: look.icon, gradient: look.gradient } });
    else onChange({ ...guide, look });
  };

  return (
    <section className="bg-white rounded-2xl border-2 border-gray-200 p-5 space-y-4">
      <h2 className="text-lg font-bold text-nhs-dark-blue">About this guide</h2>
      <TextField label="Title" value={guide.data.title} onChange={(title) => setData({ title })} />
      <TextField label="One line for the guides list" value={guide.data.description} onChange={(description) => setData({ description })} />
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Category" value={guide.look.category} onChange={(category) => setLook({ category })} options={categories.map((c) => ({ value: c, label: c }))} />
        <SelectField label="Icon" value={guide.look.icon} onChange={(icon) => setLook({ icon })} options={icons.map((i) => ({ value: i, label: i }))} />
        <SelectField label="Colour" value={guide.look.gradient} onChange={(gradient) => setLook({ gradient })} options={gradients} />
      </div>
      <p className="text-sm text-nhs-dark-grey">
        Web address: <code className="bg-gray-100 px-1.5 py-0.5 rounded">/guides/{guide.id}</code> (fixed once the guide exists, so links keep working)
      </p>
    </section>
  );
}

type CaseNoteMode = "default" | "custom" | "none";

export function ExtrasPanel({ guide, onChange }: { guide: StoredGuide; onChange: (g: StoredGuide) => void }) {
  if (guide.kind !== "guide") return null;
  const data = guide.data;
  const set = (next: GuideData) => onChange({ ...guide, data: next });
  const patch = (p: Partial<GuideData>) => set({ ...data, ...p });
  const drop = (key: keyof GuideData) => {
    const copy = { ...data } as Record<string, unknown>;
    delete copy[key];
    set(copy as unknown as GuideData);
  };

  const mode: CaseNoteMode = data.noCaseNote ? "none" : data.caseNote !== undefined ? "custom" : "default";
  const setMode = (m: CaseNoteMode) => {
    const copy = { ...data } as Record<string, unknown>;
    delete copy.caseNote;
    delete copy.noCaseNote;
    if (m === "custom") copy.caseNote = data.caseNote ?? "";
    if (m === "none") copy.noCaseNote = true;
    set(copy as unknown as GuideData);
  };

  const options = [...ALL_GUIDES].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <section className="bg-white rounded-2xl border-2 border-gray-200 p-5 space-y-4">
      <h2 className="text-lg font-bold text-nhs-dark-blue">Around the whole guide</h2>

      <fieldset>
        <legend className="text-sm font-semibold text-nhs-black mb-2">Case note at the end</legend>
        <div className="flex flex-wrap gap-2">
          {([
            ["default", "Standard sentence"],
            ["custom", "My own wording"],
            ["none", "No case note"],
          ] as [CaseNoteMode, string][]).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${mode === m ? "bg-nhs-blue text-white border-nhs-blue" : "bg-white text-nhs-blue border-nhs-blue/40 hover:border-nhs-blue"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "custom" && (
          <div className="mt-3">
            <TextAreaField
              label="Case note text"
              rows={4}
              value={data.caseNote ?? ""}
              onChange={(caseNote) => patch({ caseNote })}
              hint="[DATE] and [NURSE] fill in automatically. [BRANCH:q1] writes in the answer to a question."
            />
          </div>
        )}
      </fieldset>

      <div>
        <p className="text-sm font-semibold text-nhs-black mb-2">Add to this guide</p>
        <div className="flex flex-wrap gap-2">
          <ToggleChip label="Related guides" on={!!data.related} onClick={() => (data.related ? drop("related") : patch({ related: [] }))} />
          <ToggleChip label="Printable forms" on={!!data.downloads} onClick={() => (data.downloads ? drop("downloads") : patch({ downloads: [] }))} />
          <ToggleChip label="FOCUS links" on={!!data.focus} onClick={() => (data.focus ? drop("focus") : patch({ focus: [] }))} />
          <ToggleChip label="References" on={!!data.sources} onClick={() => (data.sources ? drop("sources") : patch({ sources: [] }))} />
        </div>
      </div>

      {data.related && (
        <BlockPanel title="Related guides" onRemove={() => drop("related")}>
          <ListEditor
            items={data.related}
            columns={[
              { key: "guideId", label: "Guide", kind: "select", options: [{ value: "", label: "Choose a guide" }, ...options.map((o) => ({ value: o.id, label: o.title }))] },
              { key: "label", label: "Button text" },
            ]}
            onChange={(related) => patch({ related })}
            makeNew={() => ({ guideId: "", label: "" })}
            addLabel="Add a related guide"
          />
        </BlockPanel>
      )}

      {data.downloads && (
        <BlockPanel title="Printable forms" onRemove={() => drop("downloads")}>
          <ListEditor
            items={data.downloads}
            columns={[{ key: "label", label: "Name" }, { key: "url", label: "Link" }]}
            onChange={(downloads) => patch({ downloads })}
            makeNew={() => ({ label: "", url: "" })}
            addLabel="Add a form"
          />
        </BlockPanel>
      )}

      {data.focus && (
        <BlockPanel title="FOCUS links" onRemove={() => drop("focus")}>
          <ListEditor
            items={data.focus}
            columns={[{ key: "label", label: "Name" }, { key: "url", label: "Link" }]}
            onChange={(focus) => patch({ focus })}
            makeNew={() => ({ label: "", url: "" })}
            addLabel="Add a FOCUS link"
          />
        </BlockPanel>
      )}

      {data.sources && (
        <BlockPanel title="References" onRemove={() => drop("sources")}>
          <ListEditor
            items={data.sources}
            columns={[
              { key: "n", label: "Number", kind: "number" },
              { key: "label", label: "Reference" },
              { key: "url", label: "Link (optional)", optional: true },
            ]}
            onChange={(sources) => patch({ sources })}
            makeNew={() => ({ n: data.sources!.length + 1, label: "" })}
            addLabel="Add a reference"
          />
        </BlockPanel>
      )}
    </section>
  );
}

export function RouteCheck({ guide }: { guide: StoredGuide }) {
  const steps = guide.data.steps as EditorStep[];
  const findings = checkGuide(guide);
  const { routes, truncated } = enumerateRoutes(steps);
  const titleOf = (id: string) => steps.find((s) => s.id === id)?.title.trim() || "Untitled step";
  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warning");

  return (
    <section className="bg-white rounded-2xl border-2 border-gray-200 p-5 space-y-4" aria-label="Checks">
      <h2 className="text-lg font-bold text-nhs-dark-blue">Checks</h2>

      {errors.length === 0 ? (
        <p className="text-sm text-nhs-green font-semibold">No errors.</p>
      ) : (
        <ul className="space-y-1">
          {errors.map((f, i) => (
            <li key={i} className="text-sm text-nhs-red bg-red-50 border border-red-200 rounded-lg px-3 py-2">{f.text}</li>
          ))}
        </ul>
      )}
      {warnings.length > 0 && (
        <ul className="space-y-1">
          {warnings.map((f, i) => (
            <li key={i} className="text-sm text-amber-900 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">{f.text}</li>
          ))}
        </ul>
      )}

      <div>
        <h3 className="text-sm font-bold text-nhs-black mb-2">
          {routes.length === 1 && !routes[0].label ? "Everyone sees the same steps" : `${routes.length}${truncated ? "+" : ""} routes through this guide`}
        </h3>
        <ul className="space-y-2">
          {routes.map((r, i) => (
            <li key={i} className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              {r.label && <p className="font-semibold text-nhs-black">{r.label}</p>}
              <p className="text-nhs-dark-grey">{r.steps.map(titleOf).join("  →  ")}</p>
            </li>
          ))}
        </ul>
        {truncated && <p className="text-xs text-nhs-dark-grey mt-2">Showing the first 64. A guide with this many routes is worth splitting in two.</p>}
      </div>
    </section>
  );
}
