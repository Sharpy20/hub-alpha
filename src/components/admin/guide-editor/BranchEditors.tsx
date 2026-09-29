"use client";

import { addChoice, applyQuestionPreset, QUESTION_PRESETS, questionsBefore, removeChoice, setConditionBranch, toggleConditionChoice, removeCondition, addCondition, updateChoice, type EditorStep } from "@/lib/data/guides/editor-model";
import type { BranchBlock } from "@/lib/data/guides/branching";
import { BlockPanel, CheckField, TextField, smallButton } from "./fields";

export function QuestionPanel({
  branch, onChange, onRemove, dependants, onInsertToken,
}: {
  branch: BranchBlock;
  onChange: (b: BranchBlock) => void;
  onRemove: () => void;
  dependants: number;
  onInsertToken: (token: string) => void;
}) {
  const token = `[BRANCH:${branch.id}]`;
  return (
    <BlockPanel title="Question" onRemove={onRemove}>
      {dependants > 0 && (
        <p className="text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          {dependants} later {dependants === 1 ? "step changes" : "steps change"} with this answer. If you remove the question, {dependants === 1 ? "it needs" : "they need"} fixing, and the checks below will say which.
        </p>
      )}
      <TextField
        label="What are you asking the reader?"
        value={branch.question}
        onChange={(question) => onChange({ ...branch, question })}
        placeholder="Which area is the patient from?"
      />
      {!branch.question.trim() && branch.choices.every((c) => !c.label.trim()) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Start from:</span>
          {QUESTION_PRESETS.map((p) => (
            <button key={p.key} type="button" className={smallButton} onClick={() => onChange(applyQuestionPreset(branch, p.key))}>
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900">Choices</p>
        {branch.choices.map((choice, i) => (
          <div key={choice.id} className="rounded-lg border border-gray-300 bg-white p-3 space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <TextField
                  label={`Choice ${i + 1}`}
                  value={choice.label}
                  onChange={(label) => onChange(updateChoice(branch, choice.id, { label }))}
                />
              </div>
              <button
                type="button"
                className={smallButton}
                disabled={branch.choices.length <= 2}
                onClick={() => onChange(removeChoice(branch, choice.id))}
                aria-label={`Remove choice ${i + 1}`}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <TextField
                label="One line under it (optional)"
                value={choice.hint ?? ""}
                onChange={(hint) => onChange(updateChoice(branch, choice.id, { hint: hint || undefined }))}
              />
              <TextField
                label="Wording for the case note (optional)"
                value={choice.note ?? ""}
                onChange={(note) => onChange(updateChoice(branch, choice.id, { note: note || undefined }))}
                hint="Falls back to the choice text."
              />
            </div>
          </div>
        ))}
        <button type="button" className={smallButton} onClick={() => onChange(addChoice(branch))}>Add a choice</button>
      </div>
      <CheckField
        label="The reader has to answer before moving on"
        checked={branch.required !== false}
        onChange={(yes) => onChange({ ...branch, required: yes ? undefined : false })}
      />
      <p className="text-xs text-gray-600">
        To write the answer into the case note, use <code className="bg-white px-1 rounded border border-gray-300">{token}</code>.{" "}
        <button type="button" className="font-semibold text-blue-700 hover:underline" onClick={() => onInsertToken(token)}>
          Add it to the case note
        </button>
      </p>
    </BlockPanel>
  );
}

export function ConditionPanel({
  step, steps, onChange, onRemove,
}: {
  step: EditorStep;
  steps: EditorStep[];
  onChange: (s: EditorStep) => void;
  onRemove: () => void;
}) {
  const index = steps.findIndex((s) => s.id === step.id);
  const options = questionsBefore(steps, index);
  const conditions = step.showIf ?? [];

  return (
    <BlockPanel title="Only show this step if" onRemove={onRemove}>
      {options.length === 0 && (
        <p className="text-sm text-gray-600">There is no question on an earlier step yet. Add one to an earlier step first.</p>
      )}
      {conditions.map((cond, at) => {
        const branch = options.find((o) => o.branch.id === cond.branch)?.branch;
        return (
          <div key={at} className="rounded-lg border border-gray-300 bg-white p-3 space-y-2">
            {at > 0 && <p className="text-xs font-bold uppercase tracking-wide text-gray-600">and</p>}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-1" htmlFor={`cond-${step.id}-${at}`}>The answer to</label>
                <select
                  id={`cond-${step.id}-${at}`}
                  value={cond.branch}
                  onChange={(e) => {
                    const picked = options.find((o) => o.branch.id === e.target.value)?.branch;
                    if (picked) onChange(setConditionBranch(step, at, picked));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {!branch && <option value={cond.branch}>{cond.branch} (missing)</option>}
                  {options.map((o) => (
                    <option key={o.branch.id} value={o.branch.id}>
                      {o.branch.question || "Untitled question"} (on {o.stepTitle || "untitled step"})
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className={smallButton} onClick={() => onChange(removeCondition(step, at))}>Remove</button>
            </div>
            {branch && (
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 mb-1">is any of</legend>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {branch.choices.map((c) => (
                    <CheckField
                      key={c.id}
                      label={c.label || "Untitled choice"}
                      checked={cond.is.includes(c.id)}
                      onChange={() => onChange(toggleConditionChoice(step, at, c.id))}
                    />
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        );
      })}
      {options.length > 0 && (
        <button type="button" className={smallButton} onClick={() => onChange(addCondition(step, steps))}>
          {conditions.length === 0 ? "Add a condition" : "Add another condition (both must hold)"}
        </button>
      )}
    </BlockPanel>
  );
}
