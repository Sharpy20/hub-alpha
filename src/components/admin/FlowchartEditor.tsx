"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Send,
  Clipboard,
  Calendar,
  Shield,
  Users,
  MapPin,
  ChevronDown,
  ArrowDown,
  X,
  Save,
  Eye,
  Pencil,
  GitBranch,
  ListTree,
  Square,
  History,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// Step type configurations with visual styling
const STEP_TYPE_CONFIG = {
  criteria: {
    label: "Criteria Check",
    icon: CheckCircle,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "Confirm patient meets referral criteria",
    category: "basic",
  },
  consent: {
    label: "Patient Consent",
    icon: Users,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    description: "Record patient consent for referral",
    category: "basic",
  },
  section: {
    label: "Legal Status",
    icon: Shield,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    description: "Select MHA section or legal status",
    category: "basic",
  },
  s117: {
    label: "S117 Status",
    icon: Shield,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    description: "On S3 now / previously on S3 / no qualifying section",
    category: "basic",
  },
  area: {
    label: "Area Selection",
    icon: MapPin,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-300",
    description: "Choose City or County pathway",
    category: "basic",
  },
  forms: {
    label: "Forms & Guides",
    icon: FileText,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    description: "Download forms and view guides",
    category: "basic",
  },
  submission: {
    label: "Submit Referral",
    icon: Send,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    description: "Send referral via email/phone/portal",
    category: "basic",
  },
  casenote: {
    label: "Case Note",
    icon: Clipboard,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    description: "Copy text to patient notes",
    category: "basic",
  },
  reminder: {
    label: "Job Diary",
    icon: Calendar,
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-300",
    description: "Reminder to update diary",
    category: "basic",
  },
  gdpr: {
    label: "GDPR Reminder",
    icon: Shield,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    description: "Data protection reminder",
    category: "basic",
  },
  // New step types
  other: {
    label: "Custom Block",
    icon: Square,
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
    description: "Blank customizable step",
    category: "other",
  },
  decision_yesno: {
    label: "Yes/No Decision",
    icon: GitBranch,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    description: "Branch based on Yes or No answer",
    category: "decision",
  },
  decision_multi: {
    label: "Multiple Choice",
    icon: ListTree,
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-300",
    description: "Branch based on multiple options",
    category: "decision",
  },
  endpoint: {
    label: "End Point",
    icon: CheckCircle2,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    description: "Marks the end of a branch path",
    category: "other",
  },
};

export type StepType = keyof typeof STEP_TYPE_CONFIG;

export interface WorkflowFormEntry {
  label: string;
  url: string;
  icon?: string;
  note?: string;
  area?: "city" | "county";
}

export interface WorkflowMethodEntry {
  type: "email" | "phone" | "portal";
  label: string;
  value: string;
  area?: "city" | "county";
}

export interface WorkflowStep {
  id: string;
  type: StepType;
  title: string;
  content: string;
  checkboxLabel?: string;
  clipboardText?: string;
  isDynamic?: boolean;
  forms?: {
    blank?: WorkflowFormEntry[];
    wagoll?: WorkflowFormEntry[];
    otherGuides?: WorkflowFormEntry[];
  };
  methods?: WorkflowMethodEntry[];
  // Decision tree fields
  decisionQuestion?: string;
  branches?: {
    label: string;
    steps: WorkflowStep[];
  }[];
}

export interface WorkflowVersion {
  id: string;
  timestamp: string;
  steps: WorkflowStep[];
  savedBy: string;
  note?: string;
}

interface FlowchartEditorProps {
  steps: WorkflowStep[];
  onChange: (steps: WorkflowStep[]) => void;
  canDelete?: boolean;
  versions?: WorkflowVersion[];
  onVersionsChange?: (versions: WorkflowVersion[]) => void;
  currentUser?: string;
}

// Validation function to check all paths reach an endpoint
function validateWorkflow(steps: WorkflowStep[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  function checkPath(stepList: WorkflowStep[], pathName: string): boolean {
    if (stepList.length === 0) {
      errors.push(`${pathName} has no steps`);
      return false;
    }

    const lastStep = stepList[stepList.length - 1];

    // Check if it's a decision node
    if (lastStep.type === "decision_yesno" || lastStep.type === "decision_multi") {
      if (!lastStep.branches || lastStep.branches.length === 0) {
        errors.push(`${pathName}: Decision "${lastStep.title}" has no branches defined`);
        return false;
      }

      let allBranchesValid = true;
      for (const branch of lastStep.branches) {
        if (!checkPath(branch.steps, `${pathName} > ${branch.label}`)) {
          allBranchesValid = false;
        }
      }
      return allBranchesValid;
    }

    // Check if last step is an endpoint or valid ending step
    const validEndingTypes: StepType[] = ["endpoint", "gdpr", "reminder", "casenote"];
    if (!validEndingTypes.includes(lastStep.type)) {
      // Check if there's a decision node before the end
      const hasDecision = stepList.some(s => s.type === "decision_yesno" || s.type === "decision_multi");
      if (hasDecision) {
        // For branches, we need explicit endpoints
        errors.push(`${pathName}: Branch must end with an endpoint or completion step (currently ends with "${lastStep.title}")`);
        return false;
      }
    }

    // Recursively check any decision nodes in the middle
    for (let i = 0; i < stepList.length - 1; i++) {
      const step = stepList[i];
      if (step.type === "decision_yesno" || step.type === "decision_multi") {
        if (!step.branches || step.branches.length === 0) {
          errors.push(`${pathName}: Decision "${step.title}" has no branches defined`);
          return false;
        }
        for (const branch of step.branches) {
          if (!checkPath(branch.steps, `${pathName} > ${branch.label}`)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  const valid = checkPath(steps, "Main workflow");
  return { valid, errors };
}

export function FlowchartEditor({
  steps,
  onChange,
  canDelete = false,
  versions = [],
  onVersionsChange,
  currentUser = "Unknown"
}: FlowchartEditorProps) {
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const [justSavedStepId, setJustSavedStepId] = useState<string | null>(null);

  // Validate on steps change
  useEffect(() => {
    const result = validateWorkflow(steps);
    setValidation(result);
  }, [steps]);

  // Handle drag from toolbox
  const handleToolboxDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
    setDragOverIndex(null);
  };

  const handleDropZoneDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDropZoneDragLeave = () => {
    setDragOverIndex(null);
  };

  const createNewStep = (type: string): WorkflowStep => {
    const config = STEP_TYPE_CONFIG[type as StepType];
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as StepType,
      title: config.label,
      content: config.description,
    };

    // Add type-specific defaults
    if (type === "criteria" || type === "reminder") {
      newStep.checkboxLabel = "I confirm this step is complete";
    }
    if (type === "casenote") {
      newStep.clipboardText = "Referral submitted on [DATE].";
    }
    if (type === "forms") {
      newStep.forms = { blank: [], wagoll: [], otherGuides: [] };
    }
    if (type === "submission") {
      newStep.methods = [];
    }
    if (type === "decision_yesno") {
      newStep.decisionQuestion = "Does the patient meet the criteria?";
      newStep.branches = [
        { label: "Yes", steps: [] },
        { label: "No", steps: [] },
      ];
    }
    if (type === "decision_multi") {
      newStep.decisionQuestion = "Select the appropriate option:";
      newStep.branches = [
        { label: "Option A", steps: [] },
        { label: "Option B", steps: [] },
        { label: "Option C", steps: [] },
      ];
    }

    return newStep;
  };

  const handleDrop = (index: number) => {
    if (!draggedType) return;

    const newStep = createNewStep(draggedType);
    const newSteps = [...steps];
    newSteps.splice(index, 0, newStep);
    onChange(newSteps);
    handleDragEnd();
  };

  const handleDropIntoBranch = (stepId: string, branchIndex: number, insertIndex: number, preCreatedStep?: WorkflowStep) => {
    const newStep = preCreatedStep || (draggedType ? createNewStep(draggedType) : null);
    if (!newStep) return;

    const updateStepBranch = (stepList: WorkflowStep[]): WorkflowStep[] => {
      return stepList.map(step => {
        if (step.id === stepId && step.branches) {
          const newBranches = step.branches.map((branch, idx) => {
            if (idx === branchIndex) {
              const newBranchSteps = [...branch.steps];
              newBranchSteps.splice(insertIndex, 0, newStep);
              return { ...branch, steps: newBranchSteps };
            }
            return branch;
          });
          return { ...step, branches: newBranches };
        }
        if (step.branches) {
          return {
            ...step,
            branches: step.branches.map(b => ({
              ...b,
              steps: updateStepBranch(b.steps)
            }))
          };
        }
        return step;
      });
    };

    onChange(updateStepBranch(steps));
    handleDragEnd();
  };

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length) return;
    const newSteps = [...steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    onChange(newSteps);
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onChange(newSteps);
  };

  const handleSaveStep = (updatedStep: WorkflowStep) => {
    const updateStepInList = (stepList: WorkflowStep[]): WorkflowStep[] => {
      return stepList.map(step => {
        if (step.id === updatedStep.id) {
          return updatedStep;
        }
        if (step.branches) {
          return {
            ...step,
            branches: step.branches.map(b => ({
              ...b,
              steps: updateStepInList(b.steps)
            }))
          };
        }
        return step;
      });
    };

    onChange(updateStepInList(steps));
    setEditingStep(null);
    // Show "step saved" toast
    setJustSavedStepId(updatedStep.id);
    setTimeout(() => setJustSavedStepId(null), 3000);
  };

  const handleSaveVersion = (note?: string) => {
    if (onVersionsChange) {
      const newVersion: WorkflowVersion = {
        id: `v-${Date.now()}`,
        timestamp: new Date().toISOString(),
        steps: JSON.parse(JSON.stringify(steps)),
        savedBy: currentUser,
        note,
      };
      onVersionsChange([newVersion, ...versions].slice(0, 20)); // Keep last 20 versions
    }
  };

  const handleRestoreVersion = (version: WorkflowVersion) => {
    // Save current as a version first
    handleSaveVersion("Auto-saved before restore");
    onChange(JSON.parse(JSON.stringify(version.steps)));
    setShowVersionHistory(false);
  };

  // Group step types by category
  const basicSteps = Object.entries(STEP_TYPE_CONFIG).filter(([_, c]) => c.category === "basic");
  const decisionSteps = Object.entries(STEP_TYPE_CONFIG).filter(([_, c]) => c.category === "decision");
  const otherSteps = Object.entries(STEP_TYPE_CONFIG).filter(([_, c]) => c.category === "other");

  return (
    <div className="flex gap-6">
      {/* Toolbox */}
      <div className="w-72 flex-shrink-0">
        <div className="sticky top-4 space-y-4">
          {/* Main Toolbox */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
              <h3 className="font-bold">Step Toolbox</h3>
              <p className="text-xs text-white/70 mt-1">Drag blocks to the canvas</p>
            </div>
            <div className="p-3 space-y-4 max-h-[50vh] overflow-y-auto">
              {/* Basic Steps */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Basic Steps</p>
                <div className="space-y-2">
                  {basicSteps.map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={type}
                        draggable
                        onDragStart={() => handleToolboxDragStart(type)}
                        onDragEnd={handleDragEnd}
                        className={`p-2 rounded-lg border-2 ${config.borderColor} ${config.bgColor} cursor-grab active:cursor-grabbing hover:shadow-md transition-all`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-gray-800">{config.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Decision Trees */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Decision Trees</p>
                <div className="space-y-2">
                  {decisionSteps.map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={type}
                        draggable
                        onDragStart={() => handleToolboxDragStart(type)}
                        onDragEnd={handleDragEnd}
                        className={`p-2 rounded-lg border-2 ${config.borderColor} ${config.bgColor} cursor-grab active:cursor-grabbing hover:shadow-md transition-all`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-gray-800">{config.label}</p>
                            <p className="text-xs text-gray-500">{config.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Other */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Other</p>
                <div className="space-y-2">
                  {otherSteps.map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={type}
                        draggable
                        onDragStart={() => handleToolboxDragStart(type)}
                        onDragEnd={handleDragEnd}
                        className={`p-2 rounded-lg border-2 ${config.borderColor} ${config.bgColor} cursor-grab active:cursor-grabbing hover:shadow-md transition-all`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-gray-800">{config.label}</p>
                            <p className="text-xs text-gray-500">{config.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Pinned End Point - always visible */}
            <div className="p-3 border-t-2 border-dashed border-gray-300 bg-gray-50">
              {(() => {
                const endpointConfig = STEP_TYPE_CONFIG["endpoint"];
                const EndIcon = endpointConfig.icon;
                return (
                  <div
                    draggable
                    onDragStart={() => handleToolboxDragStart("endpoint")}
                    onDragEnd={handleDragEnd}
                    className={`p-2 rounded-lg border-2 ${endpointConfig.borderColor} ${endpointConfig.bgColor} cursor-grab active:cursor-grabbing hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${endpointConfig.color} flex items-center justify-center`}>
                        <EndIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-gray-800">End Point</p>
                        <p className="text-xs text-gray-500">Finish a branch</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Validation Status */}
          <div className={`rounded-xl border-2 overflow-hidden ${
            validation.valid
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}>
            <div className={`p-3 ${validation.valid ? "text-emerald-800" : "text-red-800"}`}>
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="font-semibold text-sm">
                  {validation.valid ? "Workflow Valid" : "Validation Errors"}
                </span>
              </div>
              {!validation.valid && (
                <ul className="mt-2 text-xs space-y-1">
                  {validation.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              )}
              {validation.valid && (
                <p className="text-xs mt-1">All paths reach valid endpoints</p>
              )}
            </div>
          </div>

          {/* Version History Button */}
          {onVersionsChange && (
            <button
              onClick={() => setShowVersionHistory(true)}
              className="w-full p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center gap-2 text-gray-700"
            >
              <History className="w-5 h-5" />
              <span className="font-semibold text-sm">Version History</span>
              {versions.length > 0 && (
                <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {versions.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Workflow Canvas</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                previewMode
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              {previewMode ? "Exit Preview" : "Preview"}
            </button>
          </div>
        </div>

        {/* Preview mode banner */}
        {previewMode && (
          <div className="mb-4 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 text-sm font-medium text-center">
            Preview mode – this is how users will see the workflow
          </div>
        )}

        {/* Just-saved toast */}
        {justSavedStepId && (
          <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium text-center animate-pulse">
            Step saved. Drop another step below, or add an End Point to finish.
          </div>
        )}

        {/* Start node */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">START</span>
          </div>
          <div className="w-0.5 h-8 bg-gray-300" />
        </div>

        {/* Drop zone at start */}
        {!previewMode && (
          <DropZone
            index={0}
            isActive={dragOverIndex === 0}
            onDragOver={(e) => handleDropZoneDragOver(e, 0)}
            onDragLeave={handleDropZoneDragLeave}
            onDrop={() => handleDrop(0)}
          />
        )}

        {/* Steps */}
        {steps.map((step, index) => (
          <StepBlock
            key={step.id}
            step={step}
            index={index}
            totalSteps={steps.length}
            previewMode={previewMode}
            canDelete={canDelete}
            dragOverIndex={dragOverIndex}
            onEdit={() => setEditingStep(step)}
            onMove={handleMoveStep}
            onDelete={() => handleDeleteStep(index)}
            onDragOver={handleDropZoneDragOver}
            onDragLeave={handleDropZoneDragLeave}
            onDrop={handleDrop}
            onDropIntoBranch={handleDropIntoBranch}
            onEditBranchStep={(s) => setEditingStep(s)}
            onCreateStep={createNewStep}
          />
        ))}

        {/* End node */}
        <div className="flex flex-col items-center">
          {steps.length > 0 && <div className="w-0.5 h-8 bg-gray-300" />}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">END</span>
          </div>
        </div>

        {/* Empty state */}
        {steps.length === 0 && !previewMode && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium">No steps yet</p>
            <p className="text-sm">Drag blocks from the toolbox to build your workflow</p>
          </div>
        )}
      </div>

      {/* Step Editor Panel */}
      {editingStep && (
        <StepEditorPanel
          step={editingStep}
          onSave={handleSaveStep}
          onClose={() => setEditingStep(null)}
        />
      )}

      {/* Version History Panel */}
      {showVersionHistory && (
        <VersionHistoryPanel
          versions={versions}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
}

// Step Block Component
function StepBlock({
  step,
  index,
  totalSteps,
  previewMode,
  canDelete,
  dragOverIndex,
  onEdit,
  onMove,
  onDelete,
  onDragOver,
  onDragLeave,
  onDrop,
  onDropIntoBranch,
  onEditBranchStep,
  onCreateStep,
}: {
  step: WorkflowStep;
  index: number;
  totalSteps: number;
  previewMode: boolean;
  canDelete: boolean;
  dragOverIndex: number | null;
  onEdit: () => void;
  onMove: (from: number, to: number) => void;
  onDelete: () => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (index: number) => void;
  onDropIntoBranch: (stepId: string, branchIndex: number, insertIndex: number, preCreatedStep?: WorkflowStep) => void;
  onEditBranchStep: (step: WorkflowStep) => void;
  onCreateStep: (type: string) => WorkflowStep;
}) {
  const config = STEP_TYPE_CONFIG[step.type];
  const Icon = config.icon;
  const isDecision = step.type === "decision_yesno" || step.type === "decision_multi";

  return (
    <div className="flex flex-col items-center">
      {/* Connection line */}
      {index > 0 && <div className="w-0.5 h-4 bg-gray-300" />}

      {/* Step block */}
      <div
        className={`w-full max-w-md rounded-xl border-2 ${config.borderColor} ${config.bgColor} shadow-sm transition-all ${
          previewMode ? "" : "hover:shadow-lg cursor-pointer"
        }`}
        onClick={() => !previewMode && onEdit()}
      >
        <div className={`bg-gradient-to-r ${config.color} text-white p-3 rounded-t-lg flex items-center gap-3`}>
          {!previewMode && (
            <div className="flex flex-col gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(index, index - 1);
                }}
                disabled={index === 0}
                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30"
              >
                <ChevronDown className="w-3 h-3 rotate-180" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(index, index + 1);
                }}
                disabled={index === totalSteps - 1}
                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold">{step.title}</p>
            <p className="text-xs text-white/80">{config.label}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {index + 1}
            </span>
            {!previewMode && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-red-500/50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700">{step.content}</p>
          {step.checkboxLabel && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-400 rounded" />
              <span>{step.checkboxLabel}</span>
            </div>
          )}
          {step.clipboardText && (
            <div className="mt-3 p-2 bg-white rounded border border-gray-200 text-xs font-mono text-gray-600">
              {step.clipboardText}
            </div>
          )}
          {isDecision && step.decisionQuestion && (
            <div className="mt-3 p-2 bg-white rounded border-2 border-dashed border-gray-300 text-sm font-medium text-gray-700">
              {step.decisionQuestion}
            </div>
          )}
          {!previewMode && (
            <button
              onClick={onEdit}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Click to edit
            </button>
          )}
        </div>
      </div>

      {/* Decision branches */}
      {isDecision && step.branches && (
        <div className="w-full mt-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px flex-1 bg-gray-300" />
            <GitBranch className="w-5 h-5 text-gray-400" />
            <div className="h-px flex-1 bg-gray-300" />
          </div>
          <div className={`grid gap-4 ${step.branches.length === 2 ? 'grid-cols-2' : step.branches.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {step.branches.map((branch, branchIdx) => (
              <div key={branchIdx} className="flex flex-col items-center">
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  branchIdx === 0 ? 'bg-green-100 text-green-700' :
                  branchIdx === 1 ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {branch.label}
                </div>
                <div className="w-0.5 h-4 bg-gray-300" />

                {/* Branch drop zone */}
                {!previewMode && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.stopPropagation();
                      onDropIntoBranch(step.id, branchIdx, 0);
                    }}
                    className="w-full max-w-[200px] h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors mb-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Drop step here
                  </div>
                )}

                {/* Branch steps */}
                <div className="space-y-2">
                  {branch.steps.map((branchStep) => {
                    const bConfig = STEP_TYPE_CONFIG[branchStep.type];
                    const BIcon = bConfig.icon;
                    return (
                      <div
                        key={branchStep.id}
                        onClick={() => !previewMode && onEditBranchStep(branchStep)}
                        className={`w-full max-w-[200px] rounded-lg border ${bConfig.borderColor} ${bConfig.bgColor} p-2 cursor-pointer hover:shadow-md transition-all`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded bg-gradient-to-br ${bConfig.color} flex items-center justify-center`}>
                            <BIcon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-800 truncate">{branchStep.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {branch.steps.length === 0 && !previewMode && (
                  <div className="text-center py-2 space-y-1">
                    <p className="text-xs text-gray-400">Drop a step here, or:</p>
                    <button
                      onClick={() => {
                        const endpointStep = onCreateStep("endpoint");
                        onDropIntoBranch(step.id, branchIdx, 0, endpointStep);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors font-medium"
                    >
                      + Add Endpoint
                    </button>
                  </div>
                )}
                {branch.steps.length === 0 && previewMode && (
                  <div className="text-xs text-gray-400 py-2">(empty)</div>
                )}
              </div>
            ))}
          </div>
          {/* Branch reconnection label */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-xs text-gray-400 font-medium px-2">All paths continue below</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>
        </div>
      )}

      {/* Connection line + drop zone */}
      <div className="w-0.5 h-4 bg-gray-300" />
      <ArrowDown className="w-5 h-5 text-gray-400 -my-1" />
      <div className="w-0.5 h-4 bg-gray-300" />

      {/* Drop zone after step */}
      {!previewMode && (
        <DropZone
          index={index + 1}
          isActive={dragOverIndex === index + 1}
          onDragOver={(e) => onDragOver(e, index + 1)}
          onDragLeave={onDragLeave}
          onDrop={() => onDrop(index + 1)}
        />
      )}
    </div>
  );
}

// Drop zone component
function DropZone({
  isActive,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  index: number;
  isActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`w-full max-w-md h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-all mx-auto ${
        isActive
          ? "border-indigo-500 bg-indigo-50 scale-105"
          : "border-gray-300 bg-gray-50 opacity-50"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <Plus className={`w-5 h-5 ${isActive ? "text-indigo-500" : ""}`} />
        <span>{isActive ? "Drop here to add step" : "Drop zone"}</span>
      </div>
    </div>
  );
}

// Version History Panel
function VersionHistoryPanel({
  versions,
  onRestore,
  onClose,
}: {
  versions: WorkflowVersion[];
  onRestore: (version: WorkflowVersion) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div role="dialog" aria-modal="true" aria-label="Step editor" className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6" />
              <div>
                <h3 className="font-bold">Version History</h3>
                <p className="text-sm text-white/80">{versions.length} saved versions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No versions saved yet</p>
              <p className="text-sm">Versions are saved automatically when you save the workflow</p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(version.timestamp).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-gray-500">by {version.savedBy}</p>
                  </div>
                  <button
                    onClick={() => onRestore(version)}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                </div>
                {version.note && (
                  <p className="text-sm text-gray-600 bg-white rounded p-2 border">
                    {version.note}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {version.steps.length} steps
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Step editor panel
function StepEditorPanel({
  step,
  onSave,
  onClose,
}: {
  step: WorkflowStep;
  onSave: (step: WorkflowStep) => void;
  onClose: () => void;
}) {
  const [editedStep, setEditedStep] = useState<WorkflowStep>({ ...step });
  const config = STEP_TYPE_CONFIG[editedStep.type];
  const isDecision = editedStep.type === "decision_yesno" || editedStep.type === "decision_multi";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div role="dialog" aria-modal="true" aria-label="Workflow editor" className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.color} text-white p-4 sticky top-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                {(() => {
                  const Icon = config.icon;
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
              <div>
                <h3 className="font-bold">Edit Step</h3>
                <p className="text-sm text-white/80">{config.label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step type selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Step Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(STEP_TYPE_CONFIG).map(([type, typeConfig]) => {
                const Icon = typeConfig.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setEditedStep({ ...editedStep, type: type as StepType })}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      editedStep.type === type
                        ? `${typeConfig.borderColor} ${typeConfig.bgColor}`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded bg-gradient-to-br ${typeConfig.color} flex items-center justify-center mx-auto mb-1`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 text-center truncate">{typeConfig.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Step Title
            </label>
            <input
              type="text"
              value={editedStep.title}
              onChange={(e) => setEditedStep({ ...editedStep, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter step title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={editedStep.content}
              onChange={(e) => setEditedStep({ ...editedStep, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter instructions for this step..."
            />
          </div>

          {/* Decision Question */}
          {isDecision && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Decision Question
              </label>
              <input
                type="text"
                value={editedStep.decisionQuestion || ""}
                onChange={(e) => setEditedStep({ ...editedStep, decisionQuestion: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What question should the user answer?"
              />
            </div>
          )}

          {/* Branch Labels (for multi-choice) */}
          {editedStep.type === "decision_multi" && editedStep.branches && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choice Options
              </label>
              <div className="space-y-2">
                {editedStep.branches.map((branch, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={branch.label}
                      onChange={(e) => {
                        const newBranches = [...(editedStep.branches || [])];
                        newBranches[idx] = { ...branch, label: e.target.value };
                        setEditedStep({ ...editedStep, branches: newBranches });
                      }}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                      placeholder={`Option ${idx + 1}`}
                    />
                    {editedStep.branches && editedStep.branches.length > 2 && (
                      <button
                        onClick={() => {
                          const newBranches = editedStep.branches?.filter((_, i) => i !== idx);
                          setEditedStep({ ...editedStep, branches: newBranches });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newBranches = [...(editedStep.branches || []), { label: `Option ${(editedStep.branches?.length || 0) + 1}`, steps: [] }];
                    setEditedStep({ ...editedStep, branches: newBranches });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          {/* Type-specific fields */}
          {(editedStep.type === "criteria" || editedStep.type === "reminder") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Checkbox Label
              </label>
              <input
                type="text"
                value={editedStep.checkboxLabel || ""}
                onChange={(e) => setEditedStep({ ...editedStep, checkboxLabel: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="I confirm..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Users must check this box before proceeding
              </p>
            </div>
          )}

          {editedStep.type === "casenote" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Clipboard Text
              </label>
              <textarea
                value={editedStep.clipboardText || ""}
                onChange={(e) => setEditedStep({ ...editedStep, clipboardText: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                placeholder="Text to copy to clipboard..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use [DATE] for auto-inserted date, [SERVICE] for service name
              </p>
            </div>
          )}

          {editedStep.type === "submission" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Submission Methods
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Each method can be filtered by area (City / County) so only the relevant one shows after the user picks.
              </p>
              <div className="space-y-3">
                {(editedStep.methods || []).map((method, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={method.type}
                        onChange={(e) => {
                          const newMethods = [...(editedStep.methods || [])];
                          newMethods[idx] = { ...method, type: e.target.value as "email" | "phone" | "portal" };
                          setEditedStep({ ...editedStep, methods: newMethods });
                        }}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="portal">Portal</option>
                      </select>
                      <select
                        value={method.area || ""}
                        onChange={(e) => {
                          const newMethods = [...(editedStep.methods || [])];
                          const val = e.target.value;
                          newMethods[idx] = { ...method, area: val === "" ? undefined : (val as "city" | "county") };
                          setEditedStep({ ...editedStep, methods: newMethods });
                        }}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white"
                        title="Show only when this area is selected"
                      >
                        <option value="">All areas</option>
                        <option value="city">Derby City</option>
                        <option value="county">Derbyshire County</option>
                      </select>
                      <button
                        onClick={() => {
                          const newMethods = editedStep.methods?.filter((_, i) => i !== idx);
                          setEditedStep({ ...editedStep, methods: newMethods });
                        }}
                        className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={method.label}
                      onChange={(e) => {
                        const newMethods = [...(editedStep.methods || [])];
                        newMethods[idx] = { ...method, label: e.target.value };
                        setEditedStep({ ...editedStep, methods: newMethods });
                      }}
                      placeholder="Label (e.g. Referral Team)"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={method.value}
                      onChange={(e) => {
                        const newMethods = [...(editedStep.methods || [])];
                        newMethods[idx] = { ...method, value: e.target.value };
                        setEditedStep({ ...editedStep, methods: newMethods });
                      }}
                      placeholder="Value (email / phone / URL)"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newMethods = [...(editedStep.methods || []), { type: "email" as const, label: "", value: "" }];
                    setEditedStep({ ...editedStep, methods: newMethods });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Method
                </button>
              </div>
            </div>
          )}

          {/* Forms editor (blank / WAGOLL / other guides) */}
          {editedStep.type === "forms" && (
            <FormsEditor
              forms={editedStep.forms || { blank: [], wagoll: [], otherGuides: [] }}
              onChange={(forms) => setEditedStep({ ...editedStep, forms })}
            />
          )}

          {/* Read-only info for fixed-picker step types */}
          {editedStep.type === "section" && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800">
              This step shows a fixed picker of MHA legal statuses (Informal, S2, S3, S4, S5(2), S5(4), CTO, S37, S37/41, S47/49). The user&apos;s choice is available in case-note templates as <code className="px-1 bg-white rounded">[SECTION]</code>.
            </div>
          )}
          {editedStep.type === "area" && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800">
              This step shows a Derby City / Derbyshire County picker. Forms and submission methods with a matching <strong>area filter</strong> will be the only ones shown after this step. Case-note tokens <code className="px-1 bg-white rounded">[DERBY CITY/DERBYSHIRE COUNTY]</code> are also filled.
            </div>
          )}
          {editedStep.type === "s117" && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800">
              This step shows a three-way S117 picker (on S3 now / previously on S3 / no qualifying section). The choice is available in case-note templates as <code className="px-1 bg-white rounded">[S117]</code>, which expands to a full sentence naming the entitlement and the aftercare-meeting requirement.
            </div>
          )}
          {editedStep.type === "consent" && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
              This step records the patient&apos;s consent (Yes / No). The next step runs either way – consent is captured for the audit trail. Put <code className="px-1 bg-white rounded">[CONSENT]</code> in the case-note template and it is replaced by whichever wording this step carries for the answer given. If the step also asks whether the person was told about the referral, <code className="px-1 bg-white rounded">[INFORMED]</code> is filled the same way.
            </div>
          )}
          {editedStep.type === "gdpr" && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
              Standard GDPR reminder shown at the end of the workflow. No extra fields needed.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedStep)}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${config.color} text-white rounded-xl font-semibold hover:opacity-90`}
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save Step
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Forms editor -----
// Edits the three buckets on a `forms` step: blank, wagoll, otherGuides.
// Each row has label + url + optional icon, note and area filter.

function FormsEditor({
  forms,
  onChange,
}: {
  forms: { blank?: WorkflowFormEntry[]; wagoll?: WorkflowFormEntry[]; otherGuides?: WorkflowFormEntry[] };
  onChange: (forms: { blank: WorkflowFormEntry[]; wagoll: WorkflowFormEntry[]; otherGuides: WorkflowFormEntry[] }) => void;
}) {
  const blank = forms.blank || [];
  const wagoll = forms.wagoll || [];
  const otherGuides = forms.otherGuides || [];

  const update = (key: "blank" | "wagoll" | "otherGuides", next: WorkflowFormEntry[]) => {
    onChange({ blank, wagoll, otherGuides, [key]: next });
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        Add the blank referral form, an example completed copy (WAGOLL) and any supporting guides for this step.
        Set <strong>Area</strong> to City or County to make a form only appear after the user picks that area.
      </div>

      <FormsBucket
        title="Blank Forms"
        subtitle="Forms users download to complete"
        accent="blue"
        rows={blank}
        onChange={(next) => update("blank", next)}
        showNote={false}
      />

      <FormsBucket
        title="Example (WAGOLL)"
        subtitle="Completed example – &ldquo;What A Good One Looks Like&rdquo;"
        accent="amber"
        rows={wagoll}
        onChange={(next) => update("wagoll", next)}
        showNote={true}
        showArea={false}
      />

      <FormsBucket
        title="Other Guides"
        subtitle="Reference documents, leaflets and service info"
        accent="teal"
        rows={otherGuides}
        onChange={(next) => update("otherGuides", next)}
        showNote={false}
      />
    </div>
  );
}

function FormsBucket({
  title,
  subtitle,
  accent,
  rows,
  onChange,
  showNote,
  showArea = true,
}: {
  title: string;
  subtitle: string;
  accent: "blue" | "amber" | "teal";
  rows: WorkflowFormEntry[];
  onChange: (rows: WorkflowFormEntry[]) => void;
  showNote: boolean;
  showArea?: boolean;
}) {
  const tint =
    accent === "blue"
      ? "bg-blue-50 border-blue-200"
      : accent === "amber"
      ? "bg-amber-50 border-amber-200"
      : "bg-teal-50 border-teal-200";

  const setRow = (idx: number, patch: Partial<WorkflowFormEntry>) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  };

  const remove = (idx: number) => onChange(rows.filter((_, i) => i !== idx));
  const add = () => onChange([...rows, { label: "", url: "" }]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <span className="text-xs text-gray-500">{rows.length} {rows.length === 1 ? "entry" : "entries"}</span>
      </div>
      <p className="text-xs text-gray-500 mb-2" dangerouslySetInnerHTML={{ __html: subtitle }} />
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className={`rounded-lg border p-3 space-y-2 ${tint}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={row.label}
                onChange={(e) => setRow(idx, { label: e.target.value })}
                placeholder="Label shown to the user"
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm"
              />
              <button
                onClick={() => remove(idx)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={row.url}
              onChange={(e) => setRow(idx, { url: e.target.value })}
              placeholder="https://... or /forms/foo.pdf"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm font-mono"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={row.icon || ""}
                onChange={(e) => setRow(idx, { icon: e.target.value || undefined })}
                placeholder="Icon (emoji, optional)"
                className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm"
                maxLength={4}
              />
              {showArea && (
                <select
                  value={row.area || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRow(idx, { area: val === "" ? undefined : (val as "city" | "county") });
                  }}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm"
                  title="Only show this entry after the user picks this area"
                >
                  <option value="">All areas</option>
                  <option value="city">Derby City only</option>
                  <option value="county">Derbyshire County only</option>
                </select>
              )}
            </div>
            {showNote && (
              <input
                type="text"
                value={row.note || ""}
                onChange={(e) => setRow(idx, { note: e.target.value || undefined })}
                placeholder="Note (e.g. &ldquo;Example only – do not submit&rdquo;)"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm italic"
              />
            )}
          </div>
        ))}
        <button
          onClick={add}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 text-sm"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Add {title.toLowerCase().replace(/s$/, "")}
        </button>
      </div>
    </div>
  );
}
