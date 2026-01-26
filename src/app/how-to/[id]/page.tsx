"use client";

import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Lightbulb, BookOpen, Pencil, UserPlus } from "lucide-react";
import { useCanEdit } from "@/lib/hooks/useCanEdit";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import { PatientPickerModal } from "@/components/modals";
import { Patient } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

// Guide configurations with colors
const GUIDE_CONFIG: Record<string, { icon: string; gradient: string; category: string }> = {
  news2: { icon: "💪", gradient: "from-red-500 to-red-700", category: "Physical Health" },
  "blood-glucose": { icon: "🩸", gradient: "from-rose-500 to-rose-700", category: "Physical Health" },
  ecg: { icon: "💓", gradient: "from-pink-500 to-pink-700", category: "Physical Health" },
  "neuro-obs": { icon: "🧠", gradient: "from-purple-500 to-purple-700", category: "Observations" },
  "fluid-balance": { icon: "💧", gradient: "from-blue-500 to-blue-700", category: "Observations" },
  "pain-assessment": { icon: "📊", gradient: "from-orange-500 to-orange-700", category: "Observations" },
  choking: { icon: "🚨", gradient: "from-red-600 to-red-800", category: "Emergency Response" },
  "cardiac-arrest": { icon: "❤️‍🔥", gradient: "from-rose-600 to-rose-800", category: "Emergency Response" },
  "rapid-tranq": { icon: "💉", gradient: "from-amber-500 to-amber-700", category: "Emergency Response" },
  "section-17": { icon: "📋", gradient: "from-indigo-500 to-indigo-700", category: "MHA & Legal" },
  "capacity-assessment": { icon: "⚖️", gradient: "from-violet-500 to-violet-700", category: "MHA & Legal" },
  restraint: { icon: "🤝", gradient: "from-slate-500 to-slate-700", category: "MHA & Legal" },
  "admission-checklist": { icon: "✅", gradient: "from-emerald-500 to-emerald-700", category: "Admin" },
};

// Demo guide content - multiple guides
const GUIDES: Record<string, GuideData> = {
  news2: {
    id: "news2",
    title: "NEWS2 Observations",
    description: "National Early Warning Score - recognising patient deterioration",
    steps: [
      {
        id: "1",
        title: "Introduction",
        content: "NEWS2 (National Early Warning Score 2) is a standardised approach to assessing acute illness severity. It tracks six physiological parameters to identify patients at risk of deterioration.",
        tip: "NEWS2 should be recorded at least every 12 hours for stable patients, or more frequently if clinically indicated.",
      },
      {
        id: "2",
        title: "The Six Parameters",
        content: "1. Respiration rate (breaths per minute)\n2. Oxygen saturation (%)\n3. Systolic blood pressure (mmHg)\n4. Pulse rate (beats per minute)\n5. Level of consciousness (ACVPU)\n6. Temperature (°C)",
        tip: "For patients on supplemental oxygen, there's an additional 2-point weighting for SpO2.",
      },
      {
        id: "3",
        title: "Scoring Thresholds",
        content: "Each parameter is scored 0-3 based on how far from normal the value is. The scores are then added together.\n\n• 0 = Normal range\n• 1-2 = Mild deviation\n• 3 = Severe deviation",
      },
      {
        id: "4",
        title: "Clinical Response",
        content: "• Score 0-4: Routine monitoring\n• Score 5-6 or single parameter 3: Urgent response\n• Score 7+: Emergency response - immediate clinical review",
        tip: "A score of 3 in any single parameter should trigger an urgent assessment, regardless of total score.",
      },
      {
        id: "5",
        title: "Documentation",
        content: "Record all observations on the NEWS2 chart. Document:\n• Time of observations\n• All six parameters\n• Total NEWS2 score\n• Actions taken if escalating\n• Name and signature",
      },
    ],
  },
  "capacity-assessment": {
    id: "capacity-assessment",
    title: "Capacity Assessment",
    description: "Mental Capacity Act 2005 - Assessing decision-making capacity",
    steps: [
      {
        id: "1",
        title: "The Two-Stage Test",
        content: "Stage 1: Is there an impairment of, or disturbance in, the functioning of the person's mind or brain?\n\nStage 2: Does that impairment or disturbance mean the person is unable to make the specific decision at the specific time?",
        tip: "Capacity is decision-specific and time-specific. A person may have capacity for some decisions but not others.",
      },
      {
        id: "2",
        title: "The Functional Test",
        content: "A person is unable to make a decision if they cannot:\n\n1. Understand information relevant to the decision\n2. Retain that information long enough to make the decision\n3. Use or weigh that information as part of decision-making\n4. Communicate their decision",
        tip: "Use all practicable steps to help the person make their own decision before concluding they lack capacity.",
      },
      {
        id: "3",
        title: "Best Interests",
        content: "If a person lacks capacity, any decision made on their behalf must be in their best interests. Consider:\n\n• Past and present wishes\n• Beliefs and values\n• Consultation with family/carers\n• Least restrictive option",
      },
      {
        id: "4",
        title: "Documentation",
        content: "Document your assessment including:\n\n• What decision is being assessed\n• Evidence of impairment/disturbance\n• How you applied the functional test\n• Steps taken to help the person decide\n• Your conclusion and reasoning",
        tip: "A clear, contemporaneous record protects both the patient and the assessor.",
      },
    ],
  },
  "section-17": {
    id: "section-17",
    title: "Section 17 Leave",
    description: "Mental Health Act - Leave of absence from hospital",
    steps: [
      {
        id: "1",
        title: "Who Can Grant Leave?",
        content: "Section 17 leave can only be granted by the Responsible Clinician (RC). The RC may grant leave:\n\n• For a specific period\n• For specific or indefinite occasions\n• Subject to conditions",
        tip: "Leave cannot be granted by anyone other than the RC, including covering consultants without proper handover.",
      },
      {
        id: "2",
        title: "Types of Leave",
        content: "Common leave types include:\n\n• Escorted (staff or family)\n• Unescorted\n• Ground leave\n• Community leave\n• Overnight leave\n• Extended leave (often pre-discharge)",
      },
      {
        id: "3",
        title: "Conditions & Risk Assessment",
        content: "The RC should specify:\n\n• Duration and destination\n• Escort arrangements\n• Contact requirements\n• Recall conditions\n\nA current risk assessment must support the leave decision.",
        tip: "Conditions must be reasonable and proportionate. The patient should understand and agree to them where possible.",
      },
      {
        id: "4",
        title: "Documentation",
        content: "Document in the patient's notes:\n\n• S17 leave form completed and signed by RC\n• Dates/times of leave\n• Any conditions\n• Risk assessment reviewed\n• Patient informed of conditions\n• Copy given to patient",
      },
    ],
  },
};

// Default guide for unmapped IDs
const DEFAULT_GUIDE: GuideData = {
  id: "default",
  title: "Guide",
  description: "Step-by-step guidance",
  steps: [
    {
      id: "1",
      title: "Introduction",
      content: "This guide will walk you through the process step by step.",
    },
    {
      id: "2",
      title: "Step 2",
      content: "Follow the instructions carefully.",
    },
    {
      id: "3",
      title: "Summary",
      content: "You have completed this guide. Remember to document your actions.",
    },
  ],
};

interface GuideStep {
  id: string;
  title: string;
  content: string;
  tip?: string;
}

interface GuideData {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
}

export default function GuidePage() {
  const params = useParams();
  const router = useRouter();
  const { canEdit } = useCanEdit();
  const { user } = useApp();
  const { addTask } = useTasks();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Patient linking state
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [linkedPatient, setLinkedPatient] = useState<Patient | null>(null);

  const guideId = params.id as string;
  const guide = GUIDES[guideId] || DEFAULT_GUIDE;
  const config = GUIDE_CONFIG[guideId] || { icon: "📖", gradient: "from-blue-500 to-blue-700", category: "Guide" };
  const step = guide.steps[currentStep];

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    setLinkedPatient(patient);

    // Create a task in the job diary
    const today = new Date().toISOString().split("T")[0];
    addTask({
      id: `task-guide-${Date.now()}`,
      type: "patient",
      title: `${guide.title} - ${patient.name}`,
      category: "other",
      patientName: patient.name,
      ward: patient.ward,
      priority: "routine",
      status: "pending",
      dueDate: today,
      createdAt: today,
      createdBy: user?.name || "Unknown",
      carryOver: true,
      linkedGuideId: guideId,
    });

    // Log to console (would be audit log in production)
    console.log(`[AUDIT LOG] ${new Date().toISOString()} - User: ${user?.name} - Accessed guide "${guide.title}" for patient ${patient.name} (${patient.ward} Ward)`);
  };

  const handleNext = () => {
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id]);
    }
    if (currentStep < guide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isComplete = currentStep === guide.steps.length - 1;
  const progress = ((currentStep + 1) / guide.steps.length) * 100;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/how-to")}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Guides</span>
            </button>
            {canEdit && (
              <Link
                href="/admin/guides"
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors no-underline"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{config.icon}</span>
            </div>
            <div className="flex-1">
              <Badge className="bg-white/20 text-white border-0 mb-1">{config.category}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold">{guide.title}</h1>
              <p className="text-white/80 text-lg">{guide.description}</p>
            </div>
          </div>

          {/* Link to Patient button */}
          <div className="mt-4 pt-4 border-t border-white/20">
            {linkedPatient ? (
              <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{linkedPatient.name}</p>
                    <p className="text-white/70 text-sm">{linkedPatient.ward} Ward - Room {linkedPatient.room}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPatientPicker(true)}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPatientPicker(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Link to Patient
              </button>
            )}
            <p className="text-white/60 text-xs text-center mt-2">
              Linking creates a job diary task and audit log entry
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {guide.steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step navigation pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {guide.steps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                index === currentStep
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                  : completedSteps.includes(s.id)
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {completedSteps.includes(s.id) ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {index + 1}
                </span>
              )}
              {s.title}
            </button>
          ))}
        </div>

        {/* Step content */}
        <Card className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
          <CardContent className="py-8 px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                {currentStep + 1}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {step.title}
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              {step.content.split("\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 text-lg mb-4 leading-relaxed whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>

            {step.tip && (
              <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl flex items-start gap-4 border border-amber-200">
                <Lightbulb className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 mb-1">Tip</p>
                  <p className="text-amber-700">{step.tip}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 py-4 text-lg border-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          {isComplete ? (
            <Button
              onClick={() => {
                setCompletedSteps([...completedSteps, step.id]);
                router.push("/how-to");
              }}
              className={`flex-1 py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700`}
            >
              <Check className="w-5 h-5 mr-2" />
              Complete Guide
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className={`flex-1 py-4 text-lg bg-gradient-to-r ${config.gradient} hover:opacity-90`}
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Related Resources
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GUIDE_CONFIG)
              .filter(([id]) => id !== guideId && GUIDE_CONFIG[id]?.category === config.category)
              .slice(0, 3)
              .map(([id, cfg]) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentStep(0);
                    setCompletedSteps([]);
                    router.push(`/how-to/${id}`);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gradient-to-r hover:${cfg.gradient} hover:text-white transition-all border border-gray-200`}
                >
                  {cfg.icon} {id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Patient Picker Modal */}
      <PatientPickerModal
        isOpen={showPatientPicker}
        onClose={() => setShowPatientPicker(false)}
        onSelect={handlePatientSelect}
        title={guide.title}
        type="guide"
      />
    </MainLayout>
  );
}
