"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  FileText,
  Send,
  Clipboard,
  Calendar,
  Shield,
  Users,
  MapPin,
  MessageSquare,
  ChevronDown,
  ArrowDown,
  X,
  Save,
  Eye,
  Pencil,
  Link as LinkIcon,
  Download,
  BookOpen,
  ExternalLink,
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
  },
  consent: {
    label: "Patient Consent",
    icon: Users,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    description: "Record patient consent for referral",
  },
  section: {
    label: "Legal Status",
    icon: Shield,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    description: "Select MHA section or legal status",
  },
  area: {
    label: "Area Selection",
    icon: MapPin,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-300",
    description: "Choose City or County pathway",
  },
  forms: {
    label: "Forms & Guides",
    icon: FileText,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    description: "Download forms and view guides",
  },
  submission: {
    label: "Submit Referral",
    icon: Send,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    description: "Send referral via email/phone/portal",
  },
  casenote: {
    label: "Case Note",
    icon: Clipboard,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    description: "Copy text to patient notes",
  },
  reminder: {
    label: "Job Diary",
    icon: Calendar,
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-300",
    description: "Reminder to update diary",
  },
  gdpr: {
    label: "GDPR Reminder",
    icon: Shield,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    description: "Data protection reminder",
  },
};

export interface WorkflowStep {
  id: string;
  type: keyof typeof STEP_TYPE_CONFIG;
  title: string;
  content: string;
  checkboxLabel?: string;
  clipboardText?: string;
  forms?: {
    blank?: { label: string; url: string }[];
    wagoll?: { label: string; url: string; note?: string }[];
    systemOne?: { label: string; url: string }[];
    otherGuides?: { label: string; url: string }[];
  };
  methods?: { type: "email" | "phone" | "portal"; label: string; value: string }[];
}

interface FlowchartEditorProps {
  steps: WorkflowStep[];
  onChange: (steps: WorkflowStep[]) => void;
  canDelete?: boolean;
}

export function FlowchartEditor({ steps, onChange, canDelete = false }: FlowchartEditorProps) {
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

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

  const handleDrop = (index: number) => {
    if (!draggedType) return;

    const config = STEP_TYPE_CONFIG[draggedType as keyof typeof STEP_TYPE_CONFIG];
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type: draggedType as keyof typeof STEP_TYPE_CONFIG,
      title: config.label,
      content: config.description,
    };

    // Add type-specific defaults
    if (draggedType === "criteria" || draggedType === "reminder") {
      newStep.checkboxLabel = "I confirm this step is complete";
    }
    if (draggedType === "casenote") {
      newStep.clipboardText = "Referral submitted on [DATE].";
    }
    if (draggedType === "forms") {
      newStep.forms = { blank: [], wagoll: [], systemOne: [], otherGuides: [] };
    }
    if (draggedType === "submission") {
      newStep.methods = [];
    }

    const newSteps = [...steps];
    newSteps.splice(index, 0, newStep);
    onChange(newSteps);
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
    const newSteps = steps.map((s) => (s.id === updatedStep.id ? updatedStep : s));
    onChange(newSteps);
    setEditingStep(null);
  };

  return (
    <div className="flex gap-6">
      {/* Toolbox */}
      <div className="w-64 flex-shrink-0">
        <div className="sticky top-4 bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
            <h3 className="font-bold">Step Toolbox</h3>
            <p className="text-xs text-white/70 mt-1">Drag blocks to the canvas</p>
          </div>
          <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
            {Object.entries(STEP_TYPE_CONFIG).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={type}
                  draggable
                  onDragStart={() => handleToolboxDragStart(type)}
                  onDragEnd={handleDragEnd}
                  className={`p-3 rounded-lg border-2 ${config.borderColor} ${config.bgColor} cursor-grab active:cursor-grabbing hover:shadow-md transition-all`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{config.label}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{config.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Linked Documents Summary */}
        <div className="mt-4 bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4">
            <h3 className="font-bold flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Linked Documents
            </h3>
            <p className="text-xs text-white/70 mt-1">Forms & guides in this workflow</p>
          </div>
          <div className="p-3 space-y-3 max-h-[30vh] overflow-y-auto">
            {/* Collect all forms from steps */}
            {(() => {
              const formsStep = steps.find(s => s.type === "forms");
              const allForms = formsStep?.forms;

              if (!allForms || (
                (!allForms.blank || allForms.blank.length === 0) &&
                (!allForms.wagoll || allForms.wagoll.length === 0) &&
                (!allForms.systemOne || allForms.systemOne.length === 0) &&
                (!allForms.otherGuides || allForms.otherGuides.length === 0)
              )) {
                return (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No documents linked yet. Add a Forms & Guides step to manage documents.
                  </p>
                );
              }

              return (
                <>
                  {allForms.blank && allForms.blank.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        <Download className="w-3 h-3 inline mr-1" />
                        Blank Forms ({allForms.blank.length})
                      </p>
                      {allForms.blank.map((f, i) => (
                        <div key={i} className="text-xs text-gray-700 pl-4 py-0.5 truncate">
                          • {f.label}
                        </div>
                      ))}
                    </div>
                  )}
                  {allForms.wagoll && allForms.wagoll.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        <Eye className="w-3 h-3 inline mr-1" />
                        Examples/WAGOLL ({allForms.wagoll.length})
                      </p>
                      {allForms.wagoll.map((f, i) => (
                        <div key={i} className="text-xs text-gray-700 pl-4 py-0.5 truncate">
                          • {f.label}
                        </div>
                      ))}
                    </div>
                  )}
                  {allForms.systemOne && allForms.systemOne.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        <FileText className="w-3 h-3 inline mr-1" />
                        SystemOne ({allForms.systemOne.length})
                      </p>
                      {allForms.systemOne.map((f, i) => (
                        <div key={i} className="text-xs text-gray-700 pl-4 py-0.5 truncate">
                          • {f.label}
                        </div>
                      ))}
                    </div>
                  )}
                  {allForms.otherGuides && allForms.otherGuides.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        <BookOpen className="w-3 h-3 inline mr-1" />
                        Other Guides ({allForms.otherGuides.length})
                      </p>
                      {allForms.otherGuides.map((f, i) => (
                        <div key={i} className="text-xs text-gray-700 pl-4 py-0.5 truncate">
                          • {f.label}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Workflow Canvas</h3>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              previewMode
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            {previewMode ? "Editing" : "Preview"}
          </button>
        </div>

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
        {steps.map((step, index) => {
          const config = STEP_TYPE_CONFIG[step.type];
          const Icon = config.icon;

          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Connection line */}
              {index > 0 && <div className="w-0.5 h-4 bg-gray-300" />}

              {/* Step block */}
              <div
                className={`w-full max-w-md rounded-xl border-2 ${config.borderColor} ${config.bgColor} shadow-sm transition-all ${
                  previewMode ? "" : "hover:shadow-lg cursor-pointer"
                }`}
                onClick={() => !previewMode && setEditingStep(step)}
              >
                <div className={`bg-gradient-to-r ${config.color} text-white p-3 rounded-t-lg flex items-center gap-3`}>
                  {!previewMode && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveStep(index, index - 1);
                        }}
                        disabled={index === 0}
                        className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30"
                      >
                        <ChevronDown className="w-3 h-3 rotate-180" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveStep(index, index + 1);
                        }}
                        disabled={index === steps.length - 1}
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
                          handleDeleteStep(index);
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
                  {!previewMode && (
                    <button
                      onClick={() => setEditingStep(step)}
                      className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      Click to edit
                    </button>
                  )}
                </div>
              </div>

              {/* Connection line + drop zone */}
              <div className="w-0.5 h-4 bg-gray-300" />
              <ArrowDown className="w-5 h-5 text-gray-400 -my-1" />
              <div className="w-0.5 h-4 bg-gray-300" />

              {/* Drop zone after step */}
              {!previewMode && (
                <DropZone
                  index={index + 1}
                  isActive={dragOverIndex === index + 1}
                  onDragOver={(e) => handleDropZoneDragOver(e, index + 1)}
                  onDragLeave={handleDropZoneDragLeave}
                  onDrop={() => handleDrop(index + 1)}
                />
              )}
            </div>
          );
        })}

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
    </div>
  );
}

// Drop zone component
function DropZone({
  index,
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
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
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STEP_TYPE_CONFIG).map(([type, typeConfig]) => {
                const Icon = typeConfig.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setEditedStep({ ...editedStep, type: type as keyof typeof STEP_TYPE_CONFIG })}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      editedStep.type === type
                        ? `${typeConfig.borderColor} ${typeConfig.bgColor}`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeConfig.color} flex items-center justify-center mx-auto mb-1`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 text-center">{typeConfig.label}</p>
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
              <div className="space-y-2">
                {(editedStep.methods || []).map((method, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={method.type}
                      onChange={(e) => {
                        const newMethods = [...(editedStep.methods || [])];
                        newMethods[idx] = { ...method, type: e.target.value as "email" | "phone" | "portal" };
                        setEditedStep({ ...editedStep, methods: newMethods });
                      }}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="portal">Portal</option>
                    </select>
                    <input
                      type="text"
                      value={method.label}
                      onChange={(e) => {
                        const newMethods = [...(editedStep.methods || [])];
                        newMethods[idx] = { ...method, label: e.target.value };
                        setEditedStep({ ...editedStep, methods: newMethods });
                      }}
                      placeholder="Label"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={method.value}
                      onChange={(e) => {
                        const newMethods = [...(editedStep.methods || [])];
                        newMethods[idx] = { ...method, value: e.target.value };
                        setEditedStep({ ...editedStep, methods: newMethods });
                      }}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        const newMethods = editedStep.methods?.filter((_, i) => i !== idx);
                        setEditedStep({ ...editedStep, methods: newMethods });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

          {/* Forms & Guides editor */}
          {editedStep.type === "forms" && (
            <div className="space-y-6">
              {/* Blank Forms */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Download className="w-4 h-4 inline mr-1" />
                  Blank Forms (Downloadable)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Forms users can download and complete
                </p>
                <div className="space-y-2">
                  {(editedStep.forms?.blank || []).map((form, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={form.label}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.blank = [...(newForms.blank || [])];
                            newForms.blank[idx] = { ...form, label: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="Form name (e.g., IMHA Referral Form)"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={form.url}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.blank = [...(newForms.blank || [])];
                            newForms.blank[idx] = { ...form, url: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="URL or file path"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono text-xs"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newForms = { ...editedStep.forms };
                          newForms.blank = newForms.blank?.filter((_, i) => i !== idx);
                          setEditedStep({ ...editedStep, forms: newForms });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newForms = { ...editedStep.forms };
                      newForms.blank = [...(newForms.blank || []), { label: "", url: "#" }];
                      setEditedStep({ ...editedStep, forms: newForms });
                    }}
                    className="w-full py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-500 hover:border-blue-400 hover:bg-blue-50 text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Blank Form
                  </button>
                </div>
              </div>

              {/* WAGOLL Examples */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Eye className="w-4 h-4 inline mr-1" />
                  Examples (WAGOLL - What A Good One Looks Like)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Completed examples to show users the expected standard
                </p>
                <div className="space-y-2">
                  {(editedStep.forms?.wagoll || []).map((form, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={form.label}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.wagoll = [...(newForms.wagoll || [])];
                            newForms.wagoll[idx] = { ...form, label: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="Example name"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={form.url}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.wagoll = [...(newForms.wagoll || [])];
                            newForms.wagoll[idx] = { ...form, url: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="URL or file path"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono text-xs"
                        />
                        <input
                          type="text"
                          value={form.note || ""}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.wagoll = [...(newForms.wagoll || [])];
                            newForms.wagoll[idx] = { ...form, note: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="Note (e.g., 'Example only - do not submit')"
                          className="w-full px-3 py-2 border-2 border-amber-200 bg-amber-50 rounded-lg text-sm"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newForms = { ...editedStep.forms };
                          newForms.wagoll = newForms.wagoll?.filter((_, i) => i !== idx);
                          setEditedStep({ ...editedStep, forms: newForms });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newForms = { ...editedStep.forms };
                      newForms.wagoll = [...(newForms.wagoll || []), { label: "", url: "#", note: "Example only - do not submit" }];
                      setEditedStep({ ...editedStep, forms: newForms });
                    }}
                    className="w-full py-2 border-2 border-dashed border-amber-300 rounded-lg text-amber-600 hover:border-amber-400 hover:bg-amber-50 text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Example (WAGOLL)
                  </button>
                </div>
              </div>

              {/* SystemOne Guides */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  SystemOne Guides
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Links to SystemOne templates or guides
                </p>
                <div className="space-y-2">
                  {(editedStep.forms?.systemOne || []).map((form, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={form.label}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.systemOne = [...(newForms.systemOne || [])];
                            newForms.systemOne[idx] = { ...form, label: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="Guide name"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={form.url}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.systemOne = [...(newForms.systemOne || [])];
                            newForms.systemOne[idx] = { ...form, url: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="URL"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono text-xs"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newForms = { ...editedStep.forms };
                          newForms.systemOne = newForms.systemOne?.filter((_, i) => i !== idx);
                          setEditedStep({ ...editedStep, forms: newForms });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newForms = { ...editedStep.forms };
                      newForms.systemOne = [...(newForms.systemOne || []), { label: "", url: "#" }];
                      setEditedStep({ ...editedStep, forms: newForms });
                    }}
                    className="w-full py-2 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:bg-green-50 text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add SystemOne Guide
                  </button>
                </div>
              </div>

              {/* Other Guides */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Other Guides & Resources
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Additional helpful resources and links
                </p>
                <div className="space-y-2">
                  {(editedStep.forms?.otherGuides || []).map((form, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={form.label}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.otherGuides = [...(newForms.otherGuides || [])];
                            newForms.otherGuides[idx] = { ...form, label: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="Resource name"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={form.url}
                          onChange={(e) => {
                            const newForms = { ...editedStep.forms };
                            newForms.otherGuides = [...(newForms.otherGuides || [])];
                            newForms.otherGuides[idx] = { ...form, url: e.target.value };
                            setEditedStep({ ...editedStep, forms: newForms });
                          }}
                          placeholder="URL"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono text-xs"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newForms = { ...editedStep.forms };
                          newForms.otherGuides = newForms.otherGuides?.filter((_, i) => i !== idx);
                          setEditedStep({ ...editedStep, forms: newForms });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newForms = { ...editedStep.forms };
                      newForms.otherGuides = [...(newForms.otherGuides || []), { label: "", url: "#" }];
                      setEditedStep({ ...editedStep, forms: newForms });
                    }}
                    className="w-full py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Other Guide
                  </button>
                </div>
              </div>
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
