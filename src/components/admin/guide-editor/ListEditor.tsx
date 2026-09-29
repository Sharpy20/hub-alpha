"use client";

import { smallButton } from "./fields";

export interface Column {
  key: string;
  label: string;
  kind?: "text" | "number" | "select" | "check";
  options?: { value: string; label: string }[];
  // Leaving an optional field empty removes it rather than saving "".
  optional?: boolean;
  placeholder?: string;
}

const cell = "w-full px-2 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-nhs-blue";

// A small table-style editor for a list of flat records: form links, submission
// methods, diary jobs, sources. One shape, so the screens that need a list all
// look and behave the same.
export function ListEditor<T extends object>({
  items, columns, onChange, makeNew, addLabel, empty,
}: {
  items: T[];
  columns: Column[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
  addLabel: string;
  empty?: string;
}) {
  const set = (index: number, key: string, raw: unknown) => {
    const next = items.map((item, i) => {
      if (i !== index) return item;
      const copy = { ...item } as Record<string, unknown>;
      const col = columns.find((c) => c.key === key);
      if (raw === "" || raw === undefined || (col?.kind === "check" && raw === false)) {
        if (col?.optional) delete copy[key];
        else copy[key] = raw;
      } else {
        copy[key] = raw;
      }
      return copy as T;
    });
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && empty && <p className="text-sm text-gray-600">{empty}</p>}
      {items.map((item, index) => {
        const rec = item as Record<string, unknown>;
        return (
          <div key={index} className="rounded-lg border border-gray-300 bg-white p-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((col) => (
                <label key={col.key} className="block text-xs font-semibold text-gray-600">
                  {col.label}
                  {col.kind === "select" ? (
                    <select
                      className={`${cell} mt-1`}
                      value={String(rec[col.key] ?? "")}
                      onChange={(e) => set(index, col.key, e.target.value)}
                    >
                      {col.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : col.kind === "check" ? (
                    <span className="mt-1 flex items-center gap-2 text-sm font-normal text-gray-900">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-nhs-blue"
                        checked={rec[col.key] === true}
                        onChange={(e) => set(index, col.key, e.target.checked)}
                      />
                      Yes
                    </span>
                  ) : col.kind === "number" ? (
                    <input
                      type="number"
                      className={`${cell} mt-1`}
                      value={typeof rec[col.key] === "number" ? (rec[col.key] as number) : ""}
                      onChange={(e) => set(index, col.key, e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  ) : (
                    <input
                      type="text"
                      className={`${cell} mt-1`}
                      value={String(rec[col.key] ?? "")}
                      placeholder={col.placeholder}
                      onChange={(e) => set(index, col.key, e.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-2 text-right">
              <button type="button" className={smallButton} onClick={() => onChange(items.filter((_, i) => i !== index))}>
                Remove
              </button>
            </div>
          </div>
        );
      })}
      <button type="button" className={smallButton} onClick={() => onChange([...items, makeNew()])}>{addLabel}</button>
    </div>
  );
}
