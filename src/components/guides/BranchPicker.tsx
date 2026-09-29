"use client";

import { Check } from "lucide-react";
import type { BranchBlock } from "@/lib/data/guides/branching";

interface BranchPickerProps {
  branch: BranchBlock;
  answer: string | undefined;
  onAnswer: (choiceId: string) => void;
}

export function BranchPicker({ branch, answer, onAnswer }: BranchPickerProps) {
  const required = branch.required !== false;
  return (
    <div className="mt-6" role="radiogroup" aria-label={branch.question}>
      <p className="text-lg font-bold text-nhs-black mb-1">{branch.question}</p>
      <p className="text-sm text-nhs-dark-grey mb-3">
        {required ? "Pick one to see the next steps." : "Optional. Pick one if it applies."}
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
                  : "bg-white text-nhs-black border-gray-300 hover:border-nhs-blue"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected ? "bg-white border-white" : "border-gray-400"
                }`}
                aria-hidden="true"
              >
                {selected && <Check className="w-4 h-4 text-nhs-blue" />}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{choice.label}</span>
                {choice.hint && (
                  <span className={`block text-sm ${selected ? "text-white/90" : "text-nhs-dark-grey"}`}>{choice.hint}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
