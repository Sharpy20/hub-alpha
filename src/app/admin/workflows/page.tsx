"use client";

import { MainLayout } from "@/components/layout";
import { Button, Badge } from "@/components/ui";
import { useApp } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  FileText,
  Pencil,
  Plus,
  Save,
  ChevronDown,
  Shield,
  Workflow,
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import { FlowchartEditor, WorkflowStep, WorkflowVersion } from "@/components/admin/FlowchartEditor";
import { WORKFLOWS as REAL_WORKFLOWS } from "@/lib/data/guides/referral-workflows";

// Catalogue metadata for the workflow cards. Step counts and titles come
// from the real data file at render time so this is just gradient + category.
const WORKFLOW_META: Record<string, { gradient: string; category: string }> = {
  "imha-advocacy": { gradient: "from-indigo-500 to-indigo-700", category: "Legal & Advocacy" },
  "picu": { gradient: "from-rose-500 to-rose-700", category: "Urgent Care" },
  "safeguarding": { gradient: "from-red-600 to-red-800", category: "Safeguarding" },
  "safeguarding-children": { gradient: "from-pink-500 to-pink-700", category: "Safeguarding" },
  "homeless-discharge": { gradient: "from-orange-500 to-orange-700", category: "Social & Housing" },
  "social-care": { gradient: "from-amber-500 to-amber-700", category: "Social & Housing" },
  "dietitian": { gradient: "from-green-500 to-green-700", category: "Allied Health" },
  "tissue-viability": { gradient: "from-teal-500 to-teal-700", category: "Physical Health" },
  "dental": { gradient: "from-cyan-500 to-cyan-700", category: "Physical Health" },
  "physio": { gradient: "from-emerald-500 to-emerald-700", category: "Allied Health" },
  "ot": { gradient: "from-violet-500 to-violet-700", category: "Allied Health" },
  "speech-therapy": { gradient: "from-purple-500 to-purple-700", category: "Allied Health" },
  "edt": { gradient: "from-sky-500 to-sky-700", category: "Discharge Planning" },
  "erp": { gradient: "from-fuchsia-500 to-fuchsia-700", category: "Psychology" },
  "ctr-dsp": { gradient: "from-lime-600 to-lime-800", category: "Specialist Pathways" },
  "benefits-review": { gradient: "from-yellow-600 to-yellow-800", category: "Social & Housing" },
};

const DEFAULT_META = { gradient: "from-slate-500 to-slate-700", category: "Uncategorised" };

interface WorkflowCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  category: string;
  stepCount: number;
}

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
  const [showNewModal, setShowNewModal] = useState(false);

  // Build the workflow list directly from the real data so the editor
  // always reflects what users actually see on /guides/[id].
  const WORKFLOWS: WorkflowCard[] = Object.values(REAL_WORKFLOWS).map((wf) => {
    const meta = WORKFLOW_META[wf.id] || DEFAULT_META;
    return {
      id: wf.id,
      title: wf.title,
      description: wf.description,
      icon: wf.icon,
      gradient: meta.gradient,
      category: meta.category,
      stepCount: wf.steps.length,
    };
  });

  const TEMPLATE_STEPS: WorkflowStep[] = [
    { id: "t1", type: "criteria", title: "Confirm Criteria", content: "Verify the patient meets the referral criteria.", checkboxLabel: "I confirm the criteria are met" },
    { id: "t2", type: "consent", title: "Patient Consent", content: "Confirm you have discussed the referral with the patient." },
    { id: "t3", type: "forms", title: "Download Forms", content: "Download the required referral form.", forms: { blank: [], wagoll: [], otherGuides: [] } },
    { id: "t4", type: "submission", title: "Submit Referral", content: "Send the completed referral.", methods: [] },
    { id: "t5", type: "casenote", title: "Case Note", content: "Add to patient notes.", clipboardText: "Referral submitted on [DATE]." },
    { id: "t6", type: "reminder", title: "Job Diary", content: "Update your job diary.", checkboxLabel: "I have updated my diary" },
    { id: "t7", type: "gdpr", title: "GDPR Reminder", content: "Delete local copies of patient data." },
    { id: "t8", type: "endpoint", title: "Complete", content: "Referral workflow complete." },
  ];

  const handleCreateNew = (useTemplate: boolean) => {
    setEditingWorkflow({
      id: `new-${Date.now()}`,
      title: "New Workflow",
      description: "Description of this workflow",
      icon: "\uD83D\uDCCB",
      category: "Uncategorised",
      steps: useTemplate ? TEMPLATE_STEPS : [],
      versions: [],
    });
    setShowNewModal(false);
    setValidationError(null);
  };

  // Redirect if not a content admin
  const hasContentAccess = user && (
    user.isContributor ||
    user.role === "manager" ||
    user.role === "senior_admin"
  );
  useEffect(() => {
    if (user && !hasContentAccess) {
      router.push("/");
    }
  }, [user, router, hasContentAccess]);

  if (!user || !hasContentAccess) {
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
    const workflowMeta = WORKFLOWS.find((w) => w.id === workflowId);
    if (!workflowMeta) return;

    // Pull the REAL step list from the workflow data file, then deep clone
    // so edits don't mutate the source data. Falls back to a one-step stub
    // for any workflow that has no data yet.
    const realData = REAL_WORKFLOWS[workflowId];
    const steps: WorkflowStep[] = realData
      ? JSON.parse(JSON.stringify(realData.steps))
      : [{ id: "1", type: "criteria", title: "Confirm Criteria", content: "Verify the patient meets the referral criteria.", checkboxLabel: "I confirm the criteria are met" }];

    setEditingWorkflow({
      id: workflowMeta.id,
      title: realData?.title || workflowMeta.title,
      description: realData?.description || workflowMeta.description,
      icon: realData?.icon || workflowMeta.icon,
      category: workflowMeta.category,
      steps,
      versions: [],
    });
    setValidationError(null);
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
    // Save workflow to storage
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
              <button
                onClick={handleSaveWorkflow}
                className={`inline-flex items-center justify-center font-semibold rounded-lg px-4 py-2 transition-colors ${savedMessage ? "bg-green-600 text-white" : "bg-white text-rose-700 hover:bg-rose-50"}`}
              >
                {savedMessage ? (
                  <>Saved!</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Workflow
                  </>
                )}
              </button>
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
          <div className="flex items-center justify-between">
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
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Workflow
            </button>
          </div>
        </div>

        {/* New workflow modal */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewModal(false)}>
            <div role="dialog" aria-modal="true" aria-label="Create new workflow" className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900">Create New Workflow</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleCreateNew(false)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-200 hover:border-rose-300 transition-all"
                >
                  <p className="font-semibold text-gray-900">Start blank</p>
                  <p className="text-sm text-gray-500 mt-1">Empty canvas – drag in steps from scratch</p>
                </button>
                <button
                  onClick={() => handleCreateNew(true)}
                  className="w-full p-4 text-left bg-rose-50 hover:bg-rose-100 rounded-xl border-2 border-rose-200 hover:border-rose-400 transition-all"
                >
                  <p className="font-semibold text-gray-900">Start from template</p>
                  <p className="text-sm text-gray-500 mt-1">Standard 8-step referral flow pre-populated</p>
                </button>
              </div>
              <button onClick={() => setShowNewModal(false)} className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

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

        {/* Guide Display Order */}
        <GuideOrderEditor />
      </div>
    </MainLayout>
  );
}

// ---- Guide Order Editor ----
const GUIDE_CATEGORIES = [
  "Legal & Advocacy", "Nurse Tools", "Restrictive Practice", "Safeguarding", "Urgent Care",
  "Social & Housing", "Allied Health", "Physical Health", "Specialist Pathways",
];

function GuideOrderEditor() {
  const [guideOrder, setGuideOrder] = useState<{ id: string; title: string; icon: string; category: string }[]>([]);
  const [savedMsg, setSavedMsg] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load from localStorage or use default from the guides page data
    const saved = localStorage.getItem("wardhub_guide_order");
    if (saved) {
      try { setGuideOrder(JSON.parse(saved)); return; } catch { /* fall through */ }
    }
    // Default order - fetch from the page (we'll use an import-free approach by hardcoding the IDs)
    fetch("/guides")
      .then(() => {
        // Use the default order from ALL_GUIDES
        setGuideOrder(DEFAULT_GUIDE_ORDER);
      })
      .catch(() => setGuideOrder(DEFAULT_GUIDE_ORDER));
  }, []);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...guideOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setGuideOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === guideOrder.length - 1) return;
    const newOrder = [...guideOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setGuideOrder(newOrder);
  };

  const changeCategory = (index: number, newCategory: string) => {
    const newOrder = [...guideOrder];
    newOrder[index] = { ...newOrder[index], category: newCategory };
    setGuideOrder(newOrder);
  };

  const handleSave = () => {
    localStorage.setItem("wardhub_guide_order", JSON.stringify(guideOrder));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-200 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 transition-colors">
        <div className="flex items-center gap-3">
          <GripVertical className="w-6 h-6 text-indigo-500" />
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-900">Guide Display Order</h2>
            <p className="text-sm text-gray-500">Reorder guides and change categories for the /guides page</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="border-t border-indigo-200">
          <div className="p-4 bg-indigo-50 flex items-center justify-between">
            <p className="text-sm text-indigo-700">{guideOrder.length} guides - use arrows to reorder, dropdown to recategorise</p>
            <button onClick={handleSave} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${savedMsg ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
              {savedMsg ? "Saved!" : "Save Order"}
            </button>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
            {guideOrder.map((guide, index) => (
              <div key={guide.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                <span className="text-xs text-gray-400 w-6 text-right font-mono">{index + 1}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(index)} disabled={index === 0} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed"><ArrowUp className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button onClick={() => moveDown(index)} disabled={index === guideOrder.length - 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed"><ArrowDown className="w-3.5 h-3.5 text-gray-500" /></button>
                </div>
                <span className="text-lg">{guide.icon}</span>
                <span className="font-medium text-gray-900 text-sm flex-1 truncate">{guide.title}</span>
                <select value={guide.category} onChange={(e) => changeCategory(index, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 max-w-[160px]">
                  {GUIDE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Default guide order (matches ALL_GUIDES in guides/page.tsx)
const DEFAULT_GUIDE_ORDER = [
  { id: "imha-advocacy", title: "IMHA / Advocacy", icon: "\uD83D\uDDE3\uFE0F", category: "Legal & Advocacy" },
  { id: "mh-talking-points", title: "Named Nurse Talking Points", icon: "\uD83E\uDDE0", category: "Named Nurse Tools" },
  { id: "safeguarding", title: "Safeguarding Adults - Making a Referral", icon: "\uD83D\uDEE1\uFE0F", category: "Safeguarding" },
  { id: "safeguarding-children", title: "Safeguarding Children - Making a Referral", icon: "\uD83D\uDC76", category: "Safeguarding" },
  { id: "picu", title: "PICU Referral", icon: "\uD83C\uDFE5", category: "Urgent Care" },
  { id: "homeless-discharge", title: "Housing / Duty to Refer", icon: "\uD83C\uDFE0", category: "Social & Housing" },
  { id: "social-care", title: "Social Care (Derby City)", icon: "\uD83D\uDC65", category: "Social & Housing" },
  { id: "s117-meeting", title: "S117 Meeting Request", icon: "\u2696\uFE0F", category: "Legal & Advocacy" },
  { id: "dietitian", title: "Dietitian Referral", icon: "\uD83E\uDD57", category: "Allied Health" },
  { id: "tissue-viability", title: "Tissue Viability", icon: "\uD83E\uDE79", category: "Physical Health" },
  { id: "dental", title: "Dental Referral", icon: "\uD83E\uDDB7", category: "Physical Health" },
  { id: "physio", title: "Physiotherapy", icon: "\uD83C\uDFC3", category: "Allied Health" },
  { id: "ot", title: "Occupational Therapy", icon: "\uD83E\uDDE9", category: "Allied Health" },
  { id: "speech-therapy", title: "Speech & Language", icon: "\uD83D\uDCAC", category: "Allied Health" },
  { id: "edt", title: "Early Discharge Team", icon: "\uD83D\uDEAA", category: "Discharge Planning" },
  { id: "erp", title: "Emotional Regulation (ERP/DBT)", icon: "\uD83E\uDDE0", category: "Psychology" },
  { id: "ctr-dsp", title: "CTR / DSP Review", icon: "\uD83D\uDCCB", category: "Specialist Pathways" },
  { id: "benefits-review", title: "Benefits Review", icon: "\uD83D\uDCB7", category: "Social & Housing" },
  { id: "news2", title: "NEWS2 Observations", icon: "\uD83D\uDCCA", category: "Physical Health" },
  { id: "mental-state-exam", title: "Mental State Examination", icon: "\uD83E\uDDE0", category: "Clinical Assessment" },
  { id: "risk-assessment", title: "Risk Assessment", icon: "\u26A0\uFE0F", category: "Clinical Assessment" },
  { id: "abc-chart", title: "ABC Charts", icon: "\uD83D\uDCCB", category: "Clinical Assessment" },
  { id: "capacity-assessment", title: "Capacity Assessment", icon: "\u2696\uFE0F", category: "Legal" },
  { id: "dols", title: "DoLS Ward Guidance", icon: "\uD83D\uDD12", category: "Legal" },
  { id: "mha-statuses", title: "MHA Statuses", icon: "\u2696\uFE0F", category: "Legal" },
  { id: "section-17", title: "Section 17 Leave", icon: "\uD83D\uDEAA", category: "Legal" },
  { id: "domestic-abuse-guide", title: "Domestic Abuse", icon: "\uD83C\uDFE0", category: "Safeguarding" },
  { id: "peer-conflict-guide", title: "Peer-on-Peer Conflict", icon: "\u26A0\uFE0F", category: "Safeguarding" },
  { id: "information-sharing", title: "Information Sharing", icon: "\uD83D\uDD17", category: "Safeguarding" },
  { id: "escalation-pathway", title: "Escalation Pathway (Children)", icon: "\uD83D\uDCC8", category: "Safeguarding" },
  { id: "online-safety-children", title: "Online Safety and Children", icon: "\uD83C\uDF10", category: "Safeguarding" },
  { id: "honour-based-abuse", title: "HBA, FGM and Forced Marriage", icon: "\uD83D\uDEE1\uFE0F", category: "Safeguarding" },
  { id: "modern-slavery-radicalisation", title: "Modern Slavery and Radicalisation", icon: "\u26D3\uFE0F", category: "Safeguarding" },
  { id: "faith-belief-abuse", title: "Abuse Linked to Faith or Belief", icon: "\uD83D\uDE4F", category: "Safeguarding" },
  { id: "send-safeguarding", title: "SEND and Safeguarding", icon: "\uD83D\uDCDA", category: "Safeguarding" },
  { id: "non-recent-abuse", title: "Non-Recent Abuse Disclosures", icon: "\uD83D\uDD70\uFE0F", category: "Safeguarding" },
  { id: "special-guardianship", title: "Special Guardianship Orders", icon: "\uD83D\uDC68\u200D\uD83D\uDC67", category: "Safeguarding" },
  { id: "child-in-need", title: "Child in Need", icon: "\uD83E\uDD32", category: "Safeguarding" },
  { id: "fridge-temps", title: "Fridge Temperature Recording", icon: "\uD83C\uDF21\uFE0F", category: "Ward Procedures" },
  { id: "named-nurse", title: "Named Nurse Checklist", icon: "\uD83D\uDCCB", category: "Ward Procedures" },
  { id: "admission-checklist", title: "Admission Checklist", icon: "\u2705", category: "Ward Procedures" },
  { id: "discharge-checklist", title: "Discharge Checklist", icon: "\uD83C\uDFE0", category: "Ward Procedures" },
];
