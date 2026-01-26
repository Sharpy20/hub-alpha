"use client";

import { MainLayout } from "@/components/layout";
import { Button, Badge } from "@/components/ui";
import { useApp } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Pencil,
  Save,
  ChevronDown,
  Shield,
  Workflow,
  AlertTriangle,
} from "lucide-react";
import { FlowchartEditor, WorkflowStep, WorkflowVersion } from "@/components/admin/FlowchartEditor";

// Workflow data - same structure as referrals page
const WORKFLOWS = [
  {
    id: "imha-advocacy",
    title: "IMHA / Advocacy",
    description: "Independent Mental Health Advocate for detained patients",
    icon: "🗣️",
    gradient: "from-indigo-500 to-indigo-700",
    category: "Legal & Advocacy",
    stepCount: 9,
  },
  {
    id: "picu",
    title: "PICU Referral",
    description: "Psychiatric Intensive Care Unit transfers",
    icon: "🏥",
    gradient: "from-rose-500 to-rose-700",
    category: "Urgent Care",
    stepCount: 6,
  },
  {
    id: "safeguarding",
    title: "Safeguarding Adults",
    description: "Report safeguarding concerns - Derby City or County",
    icon: "🛡️",
    gradient: "from-red-600 to-red-800",
    category: "Safeguarding",
    stepCount: 6,
  },
  {
    id: "safeguarding-children",
    title: "Safeguarding Children",
    description: "Starting Point referrals for child concerns",
    icon: "👶",
    gradient: "from-pink-500 to-pink-700",
    category: "Safeguarding",
    stepCount: 6,
  },
  {
    id: "homeless-discharge",
    title: "Housing / Duty to Refer",
    description: "Homeless discharge and accommodation support",
    icon: "🏠",
    gradient: "from-orange-500 to-orange-700",
    category: "Social & Housing",
    stepCount: 6,
  },
  {
    id: "social-care",
    title: "Social Care",
    description: "Adult social care assessments and support",
    icon: "👥",
    gradient: "from-amber-500 to-amber-700",
    category: "Social & Housing",
    stepCount: 6,
  },
  {
    id: "dietitian",
    title: "Dietitian Referral",
    description: "Nutritional assessment and support",
    icon: "🥗",
    gradient: "from-green-500 to-green-700",
    category: "Allied Health",
    stepCount: 6,
  },
  {
    id: "tissue-viability",
    title: "Tissue Viability",
    description: "Wound care and pressure ulcer concerns",
    icon: "🩹",
    gradient: "from-teal-500 to-teal-700",
    category: "Physical Health",
    stepCount: 6,
  },
  {
    id: "dental",
    title: "Dental Referral",
    description: "Dental care access for inpatients",
    icon: "🦷",
    gradient: "from-cyan-500 to-cyan-700",
    category: "Physical Health",
    stepCount: 6,
  },
  {
    id: "physio",
    title: "Physiotherapy",
    description: "Physical therapy and mobility assessment",
    icon: "🏃",
    gradient: "from-emerald-500 to-emerald-700",
    category: "Allied Health",
    stepCount: 6,
  },
  {
    id: "ot",
    title: "Occupational Therapy",
    description: "OT assessment and functional review",
    icon: "🧩",
    gradient: "from-violet-500 to-violet-700",
    category: "Allied Health",
    stepCount: 6,
  },
  {
    id: "speech-therapy",
    title: "Speech & Language",
    description: "SALT assessment and swallowing review",
    icon: "💬",
    gradient: "from-purple-500 to-purple-700",
    category: "Allied Health",
    stepCount: 6,
  },
];

// Icon options
const ICON_OPTIONS = ["🗣️", "🏥", "🛡️", "👶", "🏠", "👥", "🥗", "🩹", "🦷", "🏃", "🧩", "💬", "📋", "⚖️", "💊", "🩺", "💉", "🧠", "❤️", "🔬"];

interface EditingWorkflow {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  steps: WorkflowStep[];
  versions: WorkflowVersion[];
}

// Validation function (same as in FlowchartEditor)
function validateWorkflow(steps: WorkflowStep[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validEndingTypes = ["endpoint", "gdpr", "reminder", "casenote"];

  function checkPath(stepList: WorkflowStep[], pathName: string): boolean {
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

    if (!validEndingTypes.includes(lastStep.type)) {
      const hasDecision = stepList.some(s => s.type === "decision_yesno" || s.type === "decision_multi");
      if (hasDecision) {
        errors.push(`${pathName}: Branch must end with an endpoint or completion step`);
        return false;
      }
    }

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

export default function WorkflowsAdminPage() {
  const { user } = useApp();
  const router = useRouter();
  const [editingWorkflow, setEditingWorkflow] = useState<EditingWorkflow | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);
  const [validationError, setValidationError] = useState<string[] | null>(null);

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

  const handleEditWorkflow = (workflowId: string) => {
    // Load workflow data (in real app, would fetch from storage)
    const workflow = WORKFLOWS.find((w) => w.id === workflowId);
    if (workflow) {
      // Create a sample set of steps for editing
      const sampleSteps: WorkflowStep[] = [
        { id: "1", type: "criteria", title: "Confirm Criteria", content: "Verify the patient meets the referral criteria.", checkboxLabel: "I confirm the criteria are met" },
        { id: "2", type: "consent", title: "Patient Consent", content: "Confirm you have discussed the referral with the patient." },
        { id: "3", type: "forms", title: "Download Forms", content: "Download the required referral form.", forms: { blank: [], wagoll: [], systemOne: [], otherGuides: [] } },
        { id: "4", type: "submission", title: "Submit Referral", content: "Send the completed referral.", methods: [{ type: "email", label: "Referral Team", value: "referrals@example.nhs.net" }] },
        { id: "5", type: "casenote", title: "Case Note", content: "Add to patient notes.", clipboardText: "Referral submitted on [DATE]." },
        { id: "6", type: "reminder", title: "Job Diary", content: "Update your job diary.", checkboxLabel: "I have updated my diary" },
        { id: "7", type: "gdpr", title: "GDPR Reminder", content: "Delete local copies of patient data." },
      ];

      setEditingWorkflow({
        id: workflow.id,
        title: workflow.title,
        description: workflow.description,
        icon: workflow.icon,
        category: workflow.category,
        steps: sampleSteps,
        versions: [],
      });
      setValidationError(null);
    }
  };

  const handleSaveWorkflow = () => {
    if (!editingWorkflow) return;

    // Validate workflow before saving
    const validation = validateWorkflow(editingWorkflow.steps);
    if (!validation.valid) {
      setValidationError(validation.errors);
      return;
    }

    // Save version history
    const newVersion: WorkflowVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      steps: JSON.parse(JSON.stringify(editingWorkflow.steps)),
      savedBy: user?.name || "Unknown",
      note: "Manual save",
    };

    const updatedVersions = [newVersion, ...editingWorkflow.versions].slice(0, 20);
    setEditingWorkflow({ ...editingWorkflow, versions: updatedVersions });

    // In real app, would save to localStorage/database
    console.log("Saving workflow:", editingWorkflow);
    setValidationError(null);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleVersionsChange = (versions: WorkflowVersion[]) => {
    if (editingWorkflow) {
      setEditingWorkflow({ ...editingWorkflow, versions });
    }
  };

  // Editing view - Visual Flowchart Editor
  if (editingWorkflow) {
    return (
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-rose-700 rounded-2xl p-6 text-white">
            <button
              onClick={() => setEditingWorkflow(null)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors mb-4 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Workflows</span>
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <span className="text-4xl">{editingWorkflow.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5" />
                    <span className="text-sm font-medium text-white/80">Visual Workflow Builder</span>
                  </div>
                  <h1 className="text-2xl font-bold">{editingWorkflow.title}</h1>
                  <p className="text-white/80">{editingWorkflow.category} · {editingWorkflow.steps.length} steps</p>
                </div>
              </div>
              <Button
                onClick={handleSaveWorkflow}
                className={`${savedMessage ? "bg-green-600" : "bg-white text-rose-700 hover:bg-rose-50"}`}
              >
                {savedMessage ? (
                  <>Saved!</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Workflow
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Workflow Details - Collapsed */}
          <details className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <summary className="p-4 cursor-pointer hover:bg-gray-50 font-semibold text-gray-900 flex items-center gap-2">
              <ChevronDown className="w-5 h-5" />
              Workflow Settings (Title, Icon, Description)
            </summary>
            <div className="p-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setEditingWorkflow({ ...editingWorkflow, icon })}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
                          editingWorkflow.icon === icon
                            ? "bg-rose-100 border-2 border-rose-500"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingWorkflow.title}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingWorkflow.description}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
                  <h3 className="font-bold text-red-800">Cannot Save - Workflow Invalid</h3>
                  <p className="text-red-700 text-sm mt-1">
                    All decision tree paths must reach an endpoint before saving.
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

          {/* Visual Flowchart Editor */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <FlowchartEditor
              steps={editingWorkflow.steps}
              onChange={(newSteps) => {
                setEditingWorkflow({ ...editingWorkflow, steps: newSteps });
                setValidationError(null);
              }}
              canDelete={user?.role === "senior_admin"}
              versions={editingWorkflow.versions}
              onVersionsChange={handleVersionsChange}
              currentUser={user?.name || "Unknown"}
            />
          </div>

          {/* Help text */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <h3 className="font-semibold text-indigo-800 mb-2">How to use the Visual Workflow Builder</h3>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• <strong>Drag blocks</strong> from the toolbox on the left onto the canvas</li>
              <li>• <strong>Drop into zones</strong> between steps to insert new blocks</li>
              <li>• <strong>Click any block</strong> to edit its content</li>
              <li>• <strong>Use arrow buttons</strong> to reorder steps</li>
              <li>• <strong>Toggle Preview</strong> to see how users will view the workflow</li>
            </ul>
          </div>
        </div>
      </MainLayout>
    );
  }

  // List view
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-rose-700 rounded-2xl p-6 text-white">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-white/20 transition-colors mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Workflow Editor</h1>
              <p className="text-white/80 mt-1">
                Edit and manage referral workflows
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
              In this demo, workflow edits are shown in the editor but not persisted to the actual workflow pages.
              In the full version, edits would save to the database.
            </p>
          </div>
        </div>

        {/* Workflows list */}
        <div className="space-y-3">
          {WORKFLOWS.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white rounded-xl border-2 border-gray-100 p-5 flex items-center gap-4 hover:border-rose-200 transition-colors"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${workflow.gradient}`}
              >
                <span className="text-2xl">{workflow.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900">
                  {workflow.title}
                </h3>
                <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                  {workflow.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                    {workflow.category}
                  </Badge>
                  <Badge className="bg-rose-100 text-rose-700 border-0 text-xs">
                    {workflow.stepCount} steps
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => handleEditWorkflow(workflow.id)}
                className="bg-rose-600 hover:bg-rose-700"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          ))}
        </div>

        {/* Count */}
        <div className="text-center text-sm text-gray-500">
          {WORKFLOWS.length} workflows available
        </div>
      </div>
    </MainLayout>
  );
}
