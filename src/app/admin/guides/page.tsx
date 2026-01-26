"use client";

import { MainLayout } from "@/components/layout";
import { Button, Badge } from "@/components/ui";
import { useApp } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  Plus,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Shield,
  Lightbulb,
  GitBranch,
  ListTree,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
  Square,
  ArrowDown,
  Eye,
  FileText,
} from "lucide-react";

// Guide data - same structure as how-to page
const GUIDES = [
  {
    id: "news2",
    title: "NEWS2 Observations",
    description: "National Early Warning Score - recognising deterioration",
    icon: "📊",
    category: "Physical Health",
    gradient: "from-rose-500 to-rose-700",
    stepCount: 5,
  },
  {
    id: "blood-glucose",
    title: "Blood Glucose Monitoring",
    description: "BM testing and hypoglycaemia management",
    icon: "🩸",
    category: "Physical Health",
    gradient: "from-red-500 to-red-700",
    stepCount: 4,
  },
  {
    id: "mental-state-exam",
    title: "Mental State Examination",
    description: "10-point guide to MSE assessment",
    icon: "🧠",
    category: "Clinical Assessment",
    gradient: "from-purple-500 to-purple-700",
    stepCount: 10,
  },
  {
    id: "risk-assessment",
    title: "Risk Assessment",
    description: "Dynamic risk assessment and documentation",
    icon: "⚠️",
    category: "Clinical Assessment",
    gradient: "from-amber-500 to-amber-700",
    stepCount: 5,
  },
  {
    id: "seizure-management",
    title: "Managing a Seizure",
    description: "Emergency response and Buccal Midazolam administration",
    icon: "🚨",
    category: "Emergency",
    gradient: "from-red-600 to-red-800",
    stepCount: 6,
  },
  {
    id: "medical-emergency",
    title: "Medical Emergency",
    description: "2222 calls and emergency response",
    icon: "🏥",
    category: "Emergency",
    gradient: "from-rose-600 to-rose-800",
    stepCount: 5,
  },
  {
    id: "rapid-tranq",
    title: "Rapid Tranquillisation",
    description: "RT protocol and post-RT monitoring",
    icon: "💉",
    category: "Emergency",
    gradient: "from-orange-600 to-orange-800",
    stepCount: 7,
  },
  {
    id: "capacity-assessment",
    title: "Capacity Assessment",
    description: "Two-stage test and documentation requirements",
    icon: "⚖️",
    category: "Legal",
    gradient: "from-indigo-500 to-indigo-700",
    stepCount: 4,
  },
  {
    id: "dols",
    title: "DoLS Ward Guidance",
    description: "Deprivation of Liberty Safeguards - when to apply",
    icon: "🔒",
    category: "Legal",
    gradient: "from-violet-500 to-violet-700",
    stepCount: 5,
  },
  {
    id: "section-17",
    title: "Section 17 Leave",
    description: "Leave arrangements for detained patients",
    icon: "🚪",
    category: "Legal",
    gradient: "from-blue-500 to-blue-700",
    stepCount: 4,
  },
  {
    id: "named-nurse",
    title: "Named Nurse Checklist",
    description: "Weekly and monthly tasks for named nurses",
    icon: "📋",
    category: "Ward Procedures",
    gradient: "from-emerald-500 to-emerald-700",
    stepCount: 6,
  },
  {
    id: "admission-checklist",
    title: "Admission Checklist",
    description: "Complete admission process step-by-step",
    icon: "✅",
    category: "Ward Procedures",
    gradient: "from-green-500 to-green-700",
    stepCount: 8,
  },
  {
    id: "discharge-checklist",
    title: "Discharge Checklist",
    description: "Safe discharge planning and documentation",
    icon: "🏠",
    category: "Ward Procedures",
    gradient: "from-teal-500 to-teal-700",
    stepCount: 7,
  },
];

// Icon options
const ICON_OPTIONS = ["📊", "🩸", "🧠", "⚠️", "🚨", "🏥", "💉", "⚖️", "🔒", "🚪", "📋", "✅", "🏠", "💊", "🩺", "❤️", "🔬", "📝", "💡", "📖"];

// Step types for guides
const STEP_TYPE_CONFIG = {
  content: {
    label: "Content Step",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "Standard guide content with optional tip",
    category: "basic",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    description: "Important warning or caution",
    category: "basic",
  },
  checklist: {
    label: "Checklist",
    icon: CheckCircle2,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    description: "List of items to check off",
    category: "basic",
  },
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

type GuideStepType = keyof typeof STEP_TYPE_CONFIG;

interface GuideStep {
  id: string;
  type: GuideStepType;
  title: string;
  content: string;
  tip?: string;
  checklistItems?: string[];
  // Decision tree fields
  decisionQuestion?: string;
  branches?: {
    label: string;
    steps: GuideStep[];
  }[];
}

interface GuideVersion {
  id: string;
  timestamp: string;
  steps: GuideStep[];
  savedBy: string;
  note?: string;
}

interface EditingGuide {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  steps: GuideStep[];
  versions: GuideVersion[];
}

// Validation function
function validateGuide(steps: GuideStep[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validEndingTypes: GuideStepType[] = ["endpoint", "content", "checklist", "warning", "other"];

  function checkPath(stepList: GuideStep[], pathName: string): boolean {
    if (stepList.length === 0) {
      errors.push(`${pathName} has no steps`);
      return false;
    }

    const lastStep = stepList[stepList.length - 1];

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

    // For guides, any content step can be an endpoint, but decision nodes need their branches resolved
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

  const valid = checkPath(steps, "Main guide");
  return { valid, errors };
}

export default function GuidesAdminPage() {
  const { user } = useApp();
  const router = useRouter();
  const [editingGuide, setEditingGuide] = useState<EditingGuide | null>(null);
  const [editingStep, setEditingStep] = useState<GuideStep | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);
  const [validationError, setValidationError] = useState<string[] | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Redirect if not contributor or senior_admin
  useEffect(() => {
    if (user && user.role !== "contributor" && user.role !== "senior_admin") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || (user.role !== "contributor" && user.role !== "senior_admin")) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500">
            You need Creator Admin or Senior Admin permissions to access this page.
          </p>
        </div>
      </MainLayout>
    );
  }

  const handleEditGuide = (guideId: string) => {
    const guide = GUIDES.find((g) => g.id === guideId);
    if (guide) {
      const sampleSteps: GuideStep[] = [
        { id: "1", type: "content", title: "Introduction", content: "This guide covers the basics of the procedure.", tip: "Read through completely before starting." },
        { id: "2", type: "content", title: "Step 1", content: "Begin by gathering necessary equipment." },
        { id: "3", type: "checklist", title: "Pre-checks", content: "Ensure the following items are ready:", checklistItems: ["Equipment checked", "Patient consented", "Documentation ready"] },
        { id: "4", type: "content", title: "Summary", content: "Remember to document your actions in the patient notes." },
      ];

      setEditingGuide({
        id: guide.id,
        title: guide.title,
        description: guide.description,
        icon: guide.icon,
        category: guide.category,
        steps: sampleSteps,
        versions: [],
      });
      setValidationError(null);
    }
  };

  const handleSaveGuide = () => {
    if (!editingGuide) return;

    // Validate before saving
    const validation = validateGuide(editingGuide.steps);
    if (!validation.valid) {
      setValidationError(validation.errors);
      return;
    }

    // Save version history
    const newVersion: GuideVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      steps: JSON.parse(JSON.stringify(editingGuide.steps)),
      savedBy: user?.name || "Unknown",
      note: "Manual save",
    };

    const updatedVersions = [newVersion, ...editingGuide.versions].slice(0, 20);
    setEditingGuide({ ...editingGuide, versions: updatedVersions });

    console.log("Saving guide:", editingGuide);
    setValidationError(null);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleRestoreVersion = (version: GuideVersion) => {
    if (!editingGuide) return;

    // Save current as auto-save before restore
    const autoSaveVersion: GuideVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      steps: JSON.parse(JSON.stringify(editingGuide.steps)),
      savedBy: user?.name || "Unknown",
      note: "Auto-saved before restore",
    };

    const updatedVersions = [autoSaveVersion, ...editingGuide.versions].slice(0, 20);
    setEditingGuide({
      ...editingGuide,
      steps: JSON.parse(JSON.stringify(version.steps)),
      versions: updatedVersions,
    });
    setShowVersionHistory(false);
  };

  const createNewStep = (type: string): GuideStep => {
    const config = STEP_TYPE_CONFIG[type as GuideStepType];
    const newStep: GuideStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as GuideStepType,
      title: config.label,
      content: config.description,
    };

    if (type === "checklist") {
      newStep.checklistItems = ["Item 1", "Item 2"];
    }
    if (type === "decision_yesno") {
      newStep.decisionQuestion = "Does this apply?";
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
    if (!draggedType || !editingGuide) return;

    const newStep = createNewStep(draggedType);
    const newSteps = [...editingGuide.steps];
    newSteps.splice(index, 0, newStep);
    setEditingGuide({ ...editingGuide, steps: newSteps });
    setDraggedType(null);
    setDragOverIndex(null);
  };

  const handleDropIntoBranch = (stepId: string, branchIndex: number, insertIndex: number) => {
    if (!draggedType || !editingGuide) return;

    const newStep = createNewStep(draggedType);

    const updateStepBranch = (stepList: GuideStep[]): GuideStep[] => {
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

    setEditingGuide({ ...editingGuide, steps: updateStepBranch(editingGuide.steps) });
    setDraggedType(null);
    setDragOverIndex(null);
  };

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    if (!editingGuide || toIndex < 0 || toIndex >= editingGuide.steps.length) return;
    const newSteps = [...editingGuide.steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    setEditingGuide({ ...editingGuide, steps: newSteps });
  };

  const handleDeleteStep = (index: number) => {
    if (!editingGuide) return;
    const newSteps = editingGuide.steps.filter((_, i) => i !== index);
    setEditingGuide({ ...editingGuide, steps: newSteps });
  };

  const handleSaveStep = (updatedStep: GuideStep) => {
    if (!editingGuide) return;

    const updateStepInList = (stepList: GuideStep[]): GuideStep[] => {
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

    setEditingGuide({ ...editingGuide, steps: updateStepInList(editingGuide.steps) });
    setEditingStep(null);
    setValidationError(null);
  };

  // Group step types by category
  const basicSteps = Object.entries(STEP_TYPE_CONFIG).filter(([_, c]) => c.category === "basic");
  const decisionSteps = Object.entries(STEP_TYPE_CONFIG).filter(([_, c]) => c.category === "decision");
  const otherSteps = Object.entries(STEP_TYPE_CONFIG).filter(([_, c]) => c.category === "other");

  // Editing view
  if (editingGuide) {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white">
            <button
              onClick={() => setEditingGuide(null)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors mb-4 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Guides</span>
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <span className="text-4xl">{editingGuide.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-medium text-white/80">Visual Guide Builder</span>
                  </div>
                  <h1 className="text-2xl font-bold">{editingGuide.title}</h1>
                  <p className="text-white/80">{editingGuide.category} · {editingGuide.steps.length} steps</p>
                </div>
              </div>
              <Button
                onClick={handleSaveGuide}
                className={`${savedMessage ? "bg-green-600" : "bg-white text-emerald-700 hover:bg-emerald-50"}`}
              >
                {savedMessage ? (
                  <>Saved!</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Guide
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Guide Details - Collapsed */}
          <details className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <summary className="p-4 cursor-pointer hover:bg-gray-50 font-semibold text-gray-900 flex items-center gap-2">
              <ChevronDown className="w-5 h-5" />
              Guide Settings (Title, Icon, Description)
            </summary>
            <div className="p-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setEditingGuide({ ...editingGuide, icon })}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
                          editingGuide.icon === icon
                            ? "bg-emerald-100 border-2 border-emerald-500"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingGuide.title}
                    onChange={(e) => setEditingGuide({ ...editingGuide, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingGuide.description}
                    onChange={(e) => setEditingGuide({ ...editingGuide, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-800">Cannot Save - Guide Invalid</h3>
                  <p className="text-red-700 text-sm mt-1">
                    All decision tree paths must have content before saving.
                  </p>
                  <ul className="mt-2 text-sm text-red-600 space-y-1">
                    {validationError.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Visual Editor */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
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
                                onDragStart={() => setDraggedType(type)}
                                onDragEnd={() => { setDraggedType(null); setDragOverIndex(null); }}
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
                                onDragStart={() => setDraggedType(type)}
                                onDragEnd={() => { setDraggedType(null); setDragOverIndex(null); }}
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
                                onDragStart={() => setDraggedType(type)}
                                onDragEnd={() => { setDraggedType(null); setDragOverIndex(null); }}
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
                  </div>

                  {/* Version History Button */}
                  <button
                    onClick={() => setShowVersionHistory(true)}
                    className="w-full p-3 bg-white rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors flex items-center gap-2 text-gray-700"
                  >
                    <History className="w-5 h-5" />
                    <span className="font-semibold text-sm">Version History</span>
                    {editingGuide.versions.length > 0 && (
                      <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        {editingGuide.versions.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Guide Canvas</h3>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      previewMode
                        ? "bg-emerald-100 text-emerald-700"
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
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(0); }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={() => handleDrop(0)}
                  />
                )}

                {/* Steps */}
                {editingGuide.steps.map((step, index) => (
                  <StepBlock
                    key={step.id}
                    step={step}
                    index={index}
                    totalSteps={editingGuide.steps.length}
                    previewMode={previewMode}
                    canDelete={user?.role === "senior_admin"}
                    dragOverIndex={dragOverIndex}
                    onEdit={() => setEditingStep(step)}
                    onMove={handleMoveStep}
                    onDelete={() => handleDeleteStep(index)}
                    onDragOver={(e, idx) => { e.preventDefault(); setDragOverIndex(idx); }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={handleDrop}
                    onDropIntoBranch={handleDropIntoBranch}
                    onEditBranchStep={(s) => setEditingStep(s)}
                  />
                ))}

                {/* End node */}
                <div className="flex flex-col items-center">
                  {editingGuide.steps.length > 0 && <div className="w-0.5 h-8 bg-gray-300" />}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">END</span>
                  </div>
                </div>

                {/* Empty state */}
                {editingGuide.steps.length === 0 && !previewMode && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg font-medium">No steps yet</p>
                    <p className="text-sm">Drag blocks from the toolbox to build your guide</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Help text */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h3 className="font-semibold text-emerald-800 mb-2">How to use the Visual Guide Builder</h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• <strong>Drag blocks</strong> from the toolbox on the left onto the canvas</li>
              <li>• <strong>Drop into zones</strong> between steps to insert new blocks</li>
              <li>• <strong>Click any block</strong> to edit its content</li>
              <li>• <strong>Use arrow buttons</strong> to reorder steps</li>
              <li>• <strong>Toggle Preview</strong> to see how users will view the guide</li>
            </ul>
          </div>
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
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 sticky top-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-6 h-6" />
                    <div>
                      <h3 className="font-bold">Version History</h3>
                      <p className="text-sm text-white/80">{editingGuide.versions.length} saved versions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVersionHistory(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {editingGuide.versions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No versions saved yet</p>
                    <p className="text-sm">Versions are saved automatically when you save the guide</p>
                  </div>
                ) : (
                  editingGuide.versions.map((version) => (
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
                          onClick={() => handleRestoreVersion(version)}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 flex items-center gap-1"
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
        )}
      </MainLayout>
    );
  }

  // List view
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-white/20 transition-colors mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Guide Editor</h1>
              <p className="text-white/80 mt-1">
                Edit and manage how-to guides
              </p>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-amber-800">Demo Mode</p>
            <p className="text-amber-700 text-sm">
              In this demo, guide edits are shown in the editor but not persisted to the actual guide pages.
              In the full version, edits would save to the database.
            </p>
          </div>
        </div>

        {/* Guides list */}
        <div className="space-y-3">
          {GUIDES.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-emerald-200 transition-colors"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${guide.gradient}`}
              >
                <span className="text-2xl">{guide.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">
                  {guide.title}
                </h3>
                <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                  {guide.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                    {guide.category}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                    {guide.stepCount} steps
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => handleEditGuide(guide.id)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          ))}
        </div>

        {/* Count */}
        <div className="text-center text-sm text-gray-500">
          {GUIDES.length} guides available
        </div>
      </div>
    </MainLayout>
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
}: {
  step: GuideStep;
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
  onDropIntoBranch: (stepId: string, branchIndex: number, insertIndex: number) => void;
  onEditBranchStep: (step: GuideStep) => void;
}) {
  const config = STEP_TYPE_CONFIG[step.type];
  const Icon = config.icon;
  const isDecision = step.type === "decision_yesno" || step.type === "decision_multi";

  return (
    <div className="flex flex-col items-center">
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
                onClick={(e) => { e.stopPropagation(); onMove(index, index - 1); }}
                disabled={index === 0}
                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMove(index, index + 1); }}
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
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 hover:bg-red-500/50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700">{step.content}</p>
          {step.tip && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{step.tip}</p>
            </div>
          )}
          {step.checklistItems && step.checklistItems.length > 0 && (
            <div className="mt-3 space-y-2">
              {step.checklistItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
          {isDecision && step.decisionQuestion && (
            <div className="mt-3 p-2 bg-white rounded border-2 border-dashed border-gray-300 text-sm font-medium text-gray-700">
              {step.decisionQuestion}
            </div>
          )}
          {!previewMode && (
            <button className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
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

                {!previewMode && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.stopPropagation(); onDropIntoBranch(step.id, branchIdx, 0); }}
                    className="w-full max-w-[200px] h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 hover:border-emerald-400 hover:bg-emerald-50 transition-colors mb-2"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Drop step here
                  </div>
                )}

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

                {branch.steps.length === 0 && (
                  <div className="text-xs text-gray-400 py-2">
                    No steps in this branch
                  </div>
                )}
              </div>
            ))}
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
          ? "border-emerald-500 bg-emerald-50 scale-105"
          : "border-gray-300 bg-gray-50 opacity-50"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <Plus className={`w-5 h-5 ${isActive ? "text-emerald-500" : ""}`} />
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
  step: GuideStep;
  onSave: (step: GuideStep) => void;
  onClose: () => void;
}) {
  const [editedStep, setEditedStep] = useState<GuideStep>({ ...step });
  const config = STEP_TYPE_CONFIG[editedStep.type];
  const isDecision = editedStep.type === "decision_yesno" || editedStep.type === "decision_multi";

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
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(STEP_TYPE_CONFIG).map(([type, typeConfig]) => {
                const Icon = typeConfig.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setEditedStep({ ...editedStep, type: type as GuideStepType })}
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
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter step title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={editedStep.content}
              onChange={(e) => setEditedStep({ ...editedStep, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter step content..."
            />
          </div>

          {/* Tip (for content/other types) */}
          {(editedStep.type === "content" || editedStep.type === "other") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Tip (optional)
                </span>
              </label>
              <textarea
                value={editedStep.tip || ""}
                onChange={(e) => setEditedStep({ ...editedStep, tip: e.target.value })}
                rows={3}
                placeholder="Add a helpful tip..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Checklist items */}
          {editedStep.type === "checklist" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Checklist Items
              </label>
              <div className="space-y-2">
                {(editedStep.checklistItems || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(editedStep.checklistItems || [])];
                        newItems[idx] = e.target.value;
                        setEditedStep({ ...editedStep, checklistItems: newItems });
                      }}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                      placeholder={`Item ${idx + 1}`}
                    />
                    <button
                      onClick={() => {
                        const newItems = editedStep.checklistItems?.filter((_, i) => i !== idx);
                        setEditedStep({ ...editedStep, checklistItems: newItems });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newItems = [...(editedStep.checklistItems || []), ""];
                    setEditedStep({ ...editedStep, checklistItems: newItems });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Item
                </button>
              </div>
            </div>
          )}

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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
