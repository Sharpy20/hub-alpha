"use client";

import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";
import type { GuideStep, CommitTask } from "@/lib/data/guides/howto-guides";
import type { WorkflowStep } from "@/lib/data/guides/referral-workflows";
import {
  addBlock, dependantsOf, hasBlock, questionsBefore, removeBlock,
  type BlockName, type EditorStep,
} from "@/lib/data/guides/editor-model";
import { describeConditions } from "@/lib/data/guides/branching";
import { BlockPanel, TextAreaField, TextField, ToggleChip, smallButton } from "./fields";
import { ConditionPanel, QuestionPanel } from "./BranchEditors";
import { ListEditor, type Column } from "./ListEditor";
import { STEP_TYPES, WorkflowFields } from "./WorkflowFields";

interface BlockInfo {
  name: BlockName;
  label: string;
  help: string;
}

const GUIDE_BLOCKS: BlockInfo[] = [
  { name: "branch", label: "Question", help: "Ask the reader something. Later steps can depend on the answer." },
  { name: "showIf", label: "Only show if", help: "Show this step only for certain answers." },
  { name: "tldr", label: "In a hurry", help: "A one-line summary above the step." },
  { name: "tip", label: "Tip", help: "A highlighted tip under the step." },
  { name: "progressive", label: "Collapsible sections", help: "Short lines ending in a colon become headings the reader can open." },
  { name: "commitTasks", label: "Diary jobs", help: "Let the reader put a task list into the ward diary." },
];

const WORKFLOW_BLOCKS: BlockInfo[] = GUIDE_BLOCKS.filter((b) => ["branch", "showIf", "progressive"].includes(b.name));

const JOB_COLUMNS: Column[] = [
  { key: "title", label: "Job" },
  { key: "day", label: "Day of admission", kind: "number", optional: true },
  { key: "when", label: "Or, in words (optional)", optional: true },
  {
    key: "category", label: "Type", kind: "select",
    options: ["referral", "assessment", "phone_call", "documentation", "family_contact", "discharge_planning", "medical_review", "other"]
      .map((v) => ({ value: v, label: v.replace(/_/g, " ") })),
  },
  {
    key: "priority", label: "Priority", kind: "select", optional: true,
    options: [{ value: "", label: "Routine" }, { value: "important", label: "Important" }, { value: "urgent", label: "Urgent" }],
  },
  { key: "optional", label: "Starts unticked", kind: "check", optional: true },
];

export function StepEditor({
  step, index, steps, kind, open, onToggle, onChange, onMove, onDuplicate, onDelete, onInsertToken,
}: {
  step: EditorStep;
  index: number;
  steps: EditorStep[];
  kind: "guide" | "workflow";
  open: boolean;
  onToggle: () => void;
  onChange: (s: EditorStep) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertToken: (token: string) => void;
}) {
  const blocks = kind === "guide" ? GUIDE_BLOCKS : WORKFLOW_BLOCKS;
  const noEarlierQuestion = questionsBefore(steps, index).length === 0;
  const guideStep = step as GuideStep;
  const typeLabel = kind === "workflow" ? STEP_TYPES.find((t) => t.value === (step as WorkflowStep).type)?.label : undefined;

  const toggle = (name: BlockName) => {
    if (hasBlock(step, name)) onChange(removeBlock(step, name));
    else onChange(addBlock(step, name, steps));
  };

  const summary: string[] = [];
  if (typeLabel) summary.push(typeLabel);
  if (step.branch) summary.push("Question");
  if (step.showIf?.length) summary.push(`Only if ${describeConditions(step, steps)}`);
  if (guideStep.tldr !== undefined) summary.push("In a hurry");
  if (guideStep.tip !== undefined) summary.push("Tip");

  return (
    <li className="rounded-xl border-2 border-gray-200 bg-white">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-center gap-3 text-left"
        >
          <span className="w-8 h-8 rounded-full bg-nhs-blue text-white font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
          <span className="min-w-0">
            <span className="block font-bold text-nhs-black truncate">{step.title.trim() || "Untitled step"}</span>
            {summary.length > 0 && <span className="block text-xs text-nhs-dark-grey truncate">{summary.join(" · ")}</span>}
          </span>
        </button>
        <button type="button" className={smallButton} onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move step ${index + 1} up`}><ChevronUp className="w-4 h-4" /></button>
        <button type="button" className={smallButton} onClick={() => onMove(1)} disabled={index === steps.length - 1} aria-label={`Move step ${index + 1} down`}><ChevronDown className="w-4 h-4" /></button>
        <button type="button" className={smallButton} onClick={onDuplicate} aria-label={`Duplicate step ${index + 1}`}><Copy className="w-4 h-4" /></button>
        <button type="button" className={`${smallButton} text-nhs-red`} onClick={onDelete} aria-label={`Delete step ${index + 1}`}><Trash2 className="w-4 h-4" /></button>
      </div>

      {open && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <TextField label="Step title" value={step.title} onChange={(title) => onChange({ ...step, title })} />

          {kind === "workflow" && <WorkflowFields step={step as WorkflowStep} onChange={onChange} />}

          <TextAreaField
            label="Text"
            rows={kind === "guide" ? 9 : 5}
            value={step.content}
            onChange={(content) => onChange({ ...step, content })}
            hint="Start a line with - for a bullet. Leave a blank line between paragraphs. [#1] adds a reference marker."
          />

          <div className="space-y-3">
            {guideStep.tldr !== undefined && kind === "guide" && (
              <BlockPanel title="In a hurry" onRemove={() => toggle("tldr")}>
                <TextField label="One-line summary" value={guideStep.tldr} onChange={(tldr) => onChange({ ...step, tldr } as EditorStep)} />
              </BlockPanel>
            )}

            {step.branch && (
              <QuestionPanel
                branch={step.branch}
                onChange={(branch) => onChange({ ...step, branch })}
                onRemove={() => toggle("branch")}
                dependants={dependantsOf(steps, step.branch.id).length}
                onInsertToken={onInsertToken}
              />
            )}

            {hasBlock(step, "showIf") && (
              <ConditionPanel step={step} steps={steps} onChange={onChange} onRemove={() => toggle("showIf")} />
            )}

            {guideStep.tip !== undefined && kind === "guide" && (
              <BlockPanel title="Tip" onRemove={() => toggle("tip")}>
                <TextAreaField label="Tip text" rows={3} value={guideStep.tip} onChange={(tip) => onChange({ ...step, tip } as EditorStep)} />
              </BlockPanel>
            )}

            {step.progressive && (
              <BlockPanel title="Collapsible sections" onRemove={() => toggle("progressive")}>
                <p className="text-sm text-nhs-dark-grey">
                  Short lines ending in a colon become headings. Everything under a heading folds away until the reader opens it.
                </p>
              </BlockPanel>
            )}

            {guideStep.commitTasks && kind === "guide" && (
              <BlockPanel title="Diary jobs" onRemove={() => toggle("commitTasks")}>
                <ListEditor<CommitTask>
                  items={guideStep.commitTasks}
                  columns={JOB_COLUMNS}
                  onChange={(commitTasks) => onChange({ ...step, commitTasks } as EditorStep)}
                  makeNew={() => ({
                    id: `t${guideStep.commitTasks!.length + 1}-${Date.now().toString(36)}`,
                    title: "",
                    category: "other",
                  })}
                  addLabel="Add a job"
                  empty="No jobs yet."
                />
              </BlockPanel>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-nhs-black mb-2">Add to this step</p>
            <div className="flex flex-wrap gap-2">
              {blocks.map((b) => (
                <ToggleChip
                  key={b.name}
                  label={b.label}
                  on={hasBlock(step, b.name)}
                  title={b.name === "showIf" && noEarlierQuestion && !hasBlock(step, "showIf") ? "Add a question to an earlier step first." : b.help}
                  onClick={() => {
                    if (b.name === "showIf" && noEarlierQuestion && !hasBlock(step, "showIf")) return;
                    toggle(b.name);
                  }}
                />
              ))}
            </div>
            {noEarlierQuestion && <p className="text-xs text-nhs-dark-grey mt-2">Only show if becomes available once an earlier step has a question.</p>}
          </div>
        </div>
      )}
    </li>
  );
}
