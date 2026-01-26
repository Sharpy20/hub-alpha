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
  GripVertical,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Shield,
  Lightbulb,
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

interface GuideStep {
  id: string;
  title: string;
  content: string;
  tip?: string;
}

interface EditingGuide {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  steps: GuideStep[];
}

export default function GuidesAdminPage() {
  const { user } = useApp();
  const router = useRouter();
  const [editingGuide, setEditingGuide] = useState<EditingGuide | null>(null);
  const [editingStep, setEditingStep] = useState<GuideStep | null>(null);
  const [stepPanelOpen, setStepPanelOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

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
    // Load guide data (in real app, would fetch from storage)
    const guide = GUIDES.find((g) => g.id === guideId);
    if (guide) {
      // Create a sample set of steps for editing
      const sampleSteps: GuideStep[] = [
        { id: "1", title: "Introduction", content: "This guide covers the basics of the procedure.", tip: "Read through completely before starting." },
        { id: "2", title: "Step 1", content: "Begin by gathering necessary equipment." },
        { id: "3", title: "Step 2", content: "Follow the standard procedure.", tip: "Document as you go." },
        { id: "4", title: "Summary", content: "Remember to document your actions in the patient notes." },
      ];

      setEditingGuide({
        id: guide.id,
        title: guide.title,
        description: guide.description,
        icon: guide.icon,
        category: guide.category,
        steps: sampleSteps,
      });
    }
  };

  const handleSaveGuide = () => {
    if (!editingGuide) return;

    // In real app, would save to localStorage/database
    console.log("Saving guide:", editingGuide);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleAddStep = () => {
    if (!editingGuide) return;

    const newStep: GuideStep = {
      id: Date.now().toString(),
      title: "New Step",
      content: "Step content goes here.",
    };

    setEditingGuide({
      ...editingGuide,
      steps: [...editingGuide.steps, newStep],
    });
  };

  const handleDeleteStep = (stepId: string) => {
    if (!editingGuide) return;

    setEditingGuide({
      ...editingGuide,
      steps: editingGuide.steps.filter((s) => s.id !== stepId),
    });
  };

  const handleEditStep = (step: GuideStep) => {
    setEditingStep({ ...step });
    setStepPanelOpen(true);
  };

  const handleSaveStep = () => {
    if (!editingGuide || !editingStep) return;

    setEditingGuide({
      ...editingGuide,
      steps: editingGuide.steps.map((s) =>
        s.id === editingStep.id ? editingStep : s
      ),
    });
    setStepPanelOpen(false);
    setEditingStep(null);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (!editingGuide) return;

    const newSteps = [...editingGuide.steps];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newSteps.length) return;

    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];

    setEditingGuide({
      ...editingGuide,
      steps: newSteps,
    });
  };

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
                  <h1 className="text-2xl font-bold">Edit: {editingGuide.title}</h1>
                  <p className="text-white/80">{editingGuide.category}</p>
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Guide Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Guide Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingGuide.title}
                  onChange={(e) => setEditingGuide({ ...editingGuide, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingGuide.description}
                  onChange={(e) => setEditingGuide({ ...editingGuide, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingGuide.category}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Category cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Guide Steps</h2>
              <Button onClick={handleAddStep} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>

            <div className="space-y-2">
              {editingGuide.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveStep(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveStep(index, "down")}
                      disabled={index === editingGuide.steps.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-500 truncate">{step.content.substring(0, 60)}...</p>
                  </div>
                  {step.tip && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Tip
                    </Badge>
                  )}
                  <button
                    onClick={() => handleEditStep(step)}
                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {user.role === "senior_admin" && (
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Editor Panel */}
          {stepPanelOpen && editingStep && (
            <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
              <div className="w-full max-w-lg bg-white h-full overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Edit Step</h3>
                  <button
                    onClick={() => {
                      setStepPanelOpen(false);
                      setEditingStep(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingStep.title}
                      onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={editingStep.content}
                      onChange={(e) => setEditingStep({ ...editingStep, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use line breaks to separate paragraphs
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Tip (optional)
                      </span>
                    </label>
                    <textarea
                      value={editingStep.tip || ""}
                      onChange={(e) => setEditingStep({ ...editingStep, tip: e.target.value })}
                      rows={3}
                      placeholder="Add a helpful tip for this step..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tips are displayed in a highlighted box below the step content
                    </p>
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                  <Button
                    onClick={handleSaveStep}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Step
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
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
