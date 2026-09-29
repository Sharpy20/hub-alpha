"use client";

import { useId, type ReactNode } from "react";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-nhs-blue";

export function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900 mb-1">{label}</label>
      {children(id)}
      {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
    </div>
  );
}

export function TextField({
  label, value, onChange, hint, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <input id={id} type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </Field>
  );
}

export function TextAreaField({
  label, value, onChange, hint, rows = 6, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number; placeholder?: string }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputClass} leading-relaxed`} />
      )}
    </Field>
  );
}

export function SelectField({
  label, value, onChange, options, hint,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </Field>
  );
}

export function CheckField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-2">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 w-4 h-4 accent-nhs-blue" />
      <label htmlFor={id} className="text-sm text-gray-900">
        {label}
        {hint && <span className="block text-xs text-gray-600">{hint}</span>}
      </label>
    </div>
  );
}

// A panel for one optional block, with its own remove button.
export function BlockPanel({ title, onRemove, children }: { title: string; onRemove?: () => void; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-300 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-blue-900">{title}</h4>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-sm font-semibold text-nhs-red hover:underline">
            Remove
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

// The on/off chips in "Add to this step".
export function ToggleChip({ label, on, onClick, title }: { label: string; on: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${
        on ? "bg-nhs-blue text-white border-nhs-blue" : "bg-white text-blue-700 border-nhs-blue/40 hover:border-nhs-blue"
      }`}
    >
      {on ? "✓ " : "+ "}{label}
    </button>
  );
}

export const smallButton =
  "px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed";
