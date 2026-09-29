"use client";

import { Check } from "lucide-react";
import type { BranchBlock } from "@/lib/data/guides/branching";

interface BranchPickerProps {
  branch: BranchBlock;
  answer: string | undefined;
  onAnswer: (choiceId: string) => void;
  // For a question that repeats the step's own title. Still labelled for
  // screen readers.
  hideQuestion?: boolean;
}

export function BranchPicker({ branch, answer, onAnswer, hideQuestion }: BranchPickerProps) {
  const required = branch.required !== false;
  const picked = branch.choices.find((c) => c.id === answer);
  return (
    <div className="mt-6" role="radiogroup" aria-label={branch.question}>
      {!hideQuestion && <p className="text-lg font-bold text-gray-900 mb-1">{branch.question}</p>}
      <p className="text-sm text-gray-600 mb-3">
        {required ? "Pick one to continue." : "Optional. Pick one if it applies."}
      </p>
      <div className="space-y-2">
        {branch.choices.map((choice) => {
          const selected = answer === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onAnswer(choice.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left border-2 transition-colors ${
                selected
                  ? "bg-nhs-blue text-white border-nhs-blue"
                  : "bg-white text-gray-900 border-gray-300 hover:border-nhs-blue"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected ? "bg-white border-white" : "border-gray-400"
                }`}
                aria-hidden="true"
              >
                {selected && <Check className="w-4 h-4 text-blue-700" />}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{choice.label}</span>
                {choice.hint && (
                  <span className={`block text-sm ${selected ? "opacity-90" : "text-gray-600"}`}>{choice.hint}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {picked?.explain && <Explain text={picked.explain} tone={picked.explainTone} />}
    </div>
  );
}

function Explain({ text, tone }: { text: string; tone?: "caution" | "neutral" }) {
  const [headline, ...detail] = text.split("\n").filter((l) => l.trim() !== "");
  return (
    <div
      role="status"
      className={`mt-3 rounded-xl p-4 border-2 ${tone === "caution" ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-200"}`}
    >
      <p className="font-semibold text-gray-900">{headline}</p>
      {detail.map((line, i) => (
        <p key={i} className="text-sm text-gray-600 mt-1">{line}</p>
      ))}
    </div>
  );
}
