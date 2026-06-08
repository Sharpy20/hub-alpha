"use client";

import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent, Badge, Breadcrumb } from "@/components/ui";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import { useCanEdit } from "@/lib/hooks/useCanEdit";
import { PatientPickerModal } from "@/components/modals";
import { Patient } from "@/lib/types";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useReferralLog } from "@/app/referral-log-provider";
import { useTour } from "@/app/tour-provider";
import {
  CheckCircle, FileText, Eye, BookOpen, Send, Clipboard, ClipboardList,
  Calendar, Shield, ArrowLeft, ArrowRight, Check, Copy, Download,
  ExternalLink, Phone, Mail, Pencil, UserPlus, AlertCircle, Lightbulb,
} from "lucide-react";
import {
  WORKFLOWS, DEFAULT_WORKFLOW, STEP_GRADIENTS, SECTION_OPTIONS, AREA_OPTIONS,
  type WorkflowData, type WorkflowStep,
} from "@/lib/data/guides/referral-workflows";
import {
  GUIDES, DEFAULT_GUIDE, GUIDE_CONFIG, GUIDE_WAGOLLS,
  type GuideData,
} from "@/lib/data/guides/howto-guides";
import { useIsV2, useV2Href } from "@/lib/hooks/useV2";

// Step icons for referral workflows
const STEP_ICONS: Record<string, typeof CheckCircle> = {
  criteria: CheckCircle, consent: CheckCircle, section: FileText, area: FileText,
  forms: FileText, submission: Send, casenote: Clipboard, reminder: Calendar, gdpr: Shield,
};

export default function UnifiedGuidePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();
  const { addTask } = useTasks();
  const { addReferralLog } = useReferralLog();
  const { canEdit } = useCanEdit();
  const { isTourActive, setIsInLiveWalkthrough, setCurrentSection, setCurrentSlide } = useTour();
  const isTourMode = searchParams.get("tour") === "true";
  const isV2 = useIsV2();
  const link = useV2Href();

  const guideId = params.id as string;

  // Determine guide type
  const isReferral = !!WORKFLOWS[guideId];
  const workflow: WorkflowData = isReferral ? (WORKFLOWS[guideId] || DEFAULT_WORKFLOW) : DEFAULT_WORKFLOW;
  const guide: GuideData = !isReferral ? (GUIDES[guideId] || DEFAULT_GUIDE) : DEFAULT_GUIDE;
  const config = isReferral
    ? { icon: workflow.icon, gradient: workflow.gradient, category: "Referral" }
    : (GUIDE_CONFIG[guideId] || { icon: "\uD83D\uDCD6", gradient: "from-blue-500 to-blue-700", category: "Guide" });

  // Shared state
  const [currentStep, setCurrentStep] = useState(0);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [linkedPatient, setLinkedPatient] = useState<Patient | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [copied, setCopied] = useState(false);

  // Referral-specific state
  const [criteriaConfirmed, setCriteriaConfirmed] = useState(false);
  const [patientConsent, setPatientConsent] = useState<"yes" | "no" | null>(null);
  const [patientSection, setPatientSection] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<"city" | "county" | null>(null);
  const [referralLogged, setReferralLogged] = useState(false);
  const [pendingFollowUp, setPendingFollowUp] = useState(false);

  // How-to specific state
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Current step data
  const totalSteps = isReferral ? workflow.steps.length : guide.steps.length;
  const title = isReferral ? workflow.title : guide.title;
  const description = isReferral ? workflow.description : guide.description;
  const rStep: WorkflowStep | undefined = isReferral ? workflow.steps[currentStep] : undefined;
  const hStep = !isReferral ? guide.steps[currentStep] : undefined;
  const StepIcon = isReferral && rStep ? (STEP_ICONS[rStep.type] || CheckCircle) : BookOpen;

  // Handle patient selection (shared)
  const handlePatientSelect = (patient: Patient) => {
    setLinkedPatient(patient);
    const today = new Date().toISOString().split("T")[0];
    addTask({
      id: `task-${isReferral ? "referral" : "guide"}-${Date.now()}`,
      type: "patient",
      title: `${title} - ${patient.name}`,
      category: isReferral ? "referral" : "other",
      patientName: patient.name,
      ward: patient.ward,
      priority: "routine",
      status: "pending",
      dueDate: today,
      createdAt: today,
      createdBy: user?.name || "Unknown",
      carryOver: true,
      ...(isReferral ? { linkedReferralId: guideId } : { linkedGuideId: guideId }),
    });
    if (pendingFollowUp && isReferral) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      addTask({
        id: `task-followup-${Date.now()}`,
        type: "patient",
        title: `Follow up: ${title}`,
        category: "referral",
        patientName: patient.name,
        ward: patient.ward,
        priority: "routine",
        status: "pending",
        dueDate: futureDate.toISOString().split("T")[0],
        createdAt: today,
        createdBy: user?.name || "Unknown",
        carryOver: true,
        linkedReferralId: guideId,
      });
      setPendingFollowUp(false);
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 3000);
    }
  };

  // Referral: case note generation
  const todayDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const generateCaseNote = () => {
    if (!rStep) return "";
    if (guideId === "imha-advocacy") {
      const areaName = selectedArea === "city" ? "Derby City Advocacy (POhWER)" : "Derbyshire County (Cloverleaf)";
      const areaEmail = selectedArea === "city" ? "derbyadvocacy@pohwer.net" : "referrals@cloverleaf-advocacy.co.uk";
      const patientText = linkedPatient ? `Patient: ${linkedPatient.name}. ` : "";
      const staffText = user?.name ? ` Referral completed by ${user.name}.` : "";
      let statusText: string;
      if (patientSection === "informal") {
        statusText = "Patient is informal (voluntary)";
      } else {
        const sectionLabel = SECTION_OPTIONS.find(o => o.value === patientSection)?.label || patientSection?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "[SECTION]";
        statusText = `Patient is detained under ${sectionLabel}`;
      }
      return `${patientText}Referral for IMHA sent to ${areaName} via email to ${areaEmail} on ${todayDate}. ${statusText} and would benefit from independent advocacy support.${staffText}`;
    }
    let text = rStep.clipboardText || "";
    text = text.replace(/\[DATE\]/g, todayDate);
    if (selectedArea) {
      text = text.replace(/\[DERBY CITY\/DERBYSHIRE COUNTY\]/g, selectedArea === "city" ? "Derby City" : "Derbyshire County");
      text = text.replace(/\[DERBY\/COUNTY\]/g, selectedArea === "city" ? "Derby City" : "Derbyshire County");
    }
    if (patientSection) {
      const sectionLabel = SECTION_OPTIONS.find(o => o.value === patientSection)?.label || patientSection.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      text = text.replace(/\[SECTION\]/g, sectionLabel);
    }
    if (linkedPatient) text = `Patient: ${linkedPatient.name}. ${text}`;
    if (user?.name) text = `${text} Completed by ${user.name}.`;
    return text;
  };

  const canProceed = () => {
    if (!isReferral || !rStep) return true;
    if (rStep.type === "criteria") return criteriaConfirmed;
    if (rStep.type === "consent") return patientConsent !== null;
    if (rStep.type === "section") return patientSection !== "";
    if (rStep.type === "area") return selectedArea !== null;
    return true;
  };

  const handleNext = () => {
    if (!isReferral && hStep && !completedSteps.includes(hStep.id)) {
      setCompletedSteps([...completedSteps, hStep.id]);
    }
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isComplete = currentStep === totalSteps - 1;

  const handleLogReferral = () => {
    let sentTo = "External Service";
    if (guideId === "imha-advocacy") {
      sentTo = selectedArea === "city" ? "Derby City Advocacy (POhWER)" : "Derbyshire County (Cloverleaf)";
    } else {
      const sub = workflow.steps.find(s => s.type === "submission");
      if (sub?.methods && sub.methods.length > 0) sentTo = sub.methods[0].label;
    }
    addReferralLog({
      workflowId: guideId,
      workflowTitle: workflow.title,
      patientName: linkedPatient?.name,
      sentDate: new Date().toISOString(),
      sentBy: user?.name || "Unknown",
      sentTo,
      status: "sent",
      notes: linkedPatient ? `Referral for ${linkedPatient.name}` : undefined,
    });
    setReferralLogged(true);
  };

  // Tour mode
  const handleReturnToTour = () => {
    setIsInLiveWalkthrough(false);
    setCurrentSection("task-diary");
    setCurrentSlide(0);
    router.push("/");
  };
  const isLastStep = currentStep === totalSteps - 1;
  const [tourCompleteShown, setTourCompleteShown] = useState(false);
  useEffect(() => {
    if (isTourMode && isLastStep && !tourCompleteShown) setTourCompleteShown(true);
  }, [isTourMode, isLastStep, tourCompleteShown]);

  return (
    <MainLayout>
      {/* Tour mode floating guide */}
      {isTourMode && isTourActive && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {tourCompleteShown && (
            <div className="bg-white rounded-xl shadow-2xl border-2 border-green-300 p-4 max-w-xs animate-bounce">
              <p className="font-bold text-green-800 mb-1">Nice work!</p>
              <p className="text-sm text-gray-600">You&apos;ve walked through a real referral. Ready to continue the tour?</p>
              <button onClick={handleReturnToTour} className="mt-2 w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm">
                Continue Tour &rarr;
              </button>
            </div>
          )}
          {!tourCompleteShown && (
            <button onClick={handleReturnToTour} className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              &larr; Return to Tour
            </button>
          )}
        </div>
      )}

      <div className="space-y-6">
        <Breadcrumb items={[
          { label: "Guides", href: link("/guides") },
          { label: title },
        ]} />

        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.push(link("/guides"))} className="p-2 rounded-lg hover:bg-white/20 transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Guides</span>
            </button>
            {canEdit && (
              <Link href={link("/admin/workflows")} className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors no-underline">
                <Pencil className="w-4 h-4" /> Edit
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{config.icon}</span>
            </div>
            <div className="flex-1">
              {!isReferral && <span className="text-white/70 text-sm font-medium">{config.category}</span>}
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              <p className="text-white/80 text-lg">{description}</p>
            </div>
          </div>

          {/* Patient link - hidden in v2 (PII-free) */}
          {!isV2 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              {linkedPatient ? (
                <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center"><UserPlus className="w-5 h-5" /></div>
                    <div>
                      <p className="font-semibold">{linkedPatient.name}</p>
                      <p className="text-white/70 text-sm">{linkedPatient.ward} Ward - Room {linkedPatient.room}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPatientPicker(true)} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">Change</button>
                </div>
              ) : (
                <button onClick={() => setShowPatientPicker(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors">
                  <UserPlus className="w-5 h-5" /> Link to Patient
                </button>
              )}
              <p className="text-white/80 text-sm text-center mt-2 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Linking creates a job diary task and audit log entry
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {isReferral ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1 mb-2">
              {workflow.steps.map((s, index) => (
                <div key={s.id} className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                  index < currentStep ? "bg-green-500" : index === currentStep ? `bg-gradient-to-r ${STEP_GRADIENTS[s.type]}` : "bg-gray-200"
                }`} />
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center font-medium">Step {currentStep + 1} of {totalSteps}: {rStep?.title}</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
            <span>Step <strong className="text-gray-800">{currentStep + 1}</strong> of <strong className="text-gray-800">{totalSteps}</strong></span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
            </div>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% complete</span>
          </div>
        )}

        {/* Step navigation pills/grid */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-4">
          <div className={isReferral ? "grid grid-cols-2 md:grid-cols-3 gap-2" : "flex overflow-x-auto gap-2 pb-1"}>
            {isReferral ? (
              workflow.steps.map((s, index) => {
                const Icon = STEP_ICONS[s.type] || CheckCircle;
                return (
                  <button key={s.id} onClick={() => { if (index <= currentStep) setCurrentStep(index); }} disabled={index > currentStep}
                    className={`flex items-center gap-2 p-3 rounded-lg text-left transition-all ${
                      index === currentStep ? `bg-gradient-to-r ${STEP_GRADIENTS[s.type]} text-white shadow-md`
                        : index < currentStep ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-white text-gray-400"
                    }`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{s.title}</span>
                  </button>
                );
              })
            ) : (
              guide.steps.map((s, index) => (
                <button key={s.id} onClick={() => { if (index <= currentStep) setCurrentStep(index); }} disabled={index > currentStep}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    index === currentStep ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                      : completedSteps.includes(s.id) ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-white text-gray-400"
                  }`}>
                  {completedSteps.includes(s.id) && <Check className="w-3 h-3" />}
                  <span>{index + 1}</span>
                  <span className="truncate max-w-[200px]">{s.title}</span>
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end mt-2">
            <Link href={link(`/feedback?category=${isReferral ? "referrals" : "guides"}&sub=${guideId}&title=${encodeURIComponent("Problem with: " + title)}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
              <AlertCircle className="w-3.5 h-3.5" /> Report a problem
            </Link>
          </div>
        </div>

        {/* Step content */}
        {isReferral && rStep ? (
          <Card className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${STEP_GRADIENTS[rStep.type]}`} />
            <CardContent className="py-8 px-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${STEP_GRADIENTS[rStep.type]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <StepIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <Badge className={`bg-gradient-to-r ${STEP_GRADIENTS[rStep.type]} text-white border-0`}>{rStep.type.toUpperCase()}</Badge>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{rStep.title}</h2>
                </div>
              </div>
              <p className="text-gray-600 text-lg mb-6">{rStep.content}</p>

              {/* Criteria */}
              {rStep.type === "criteria" && (
                <label className="flex items-start gap-4 p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                  <input type="checkbox" checked={criteriaConfirmed} onChange={(e) => setCriteriaConfirmed(e.target.checked)} className="mt-1 w-6 h-6 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-gray-800 font-medium text-lg">{rStep.checkboxLabel}</span>
                </label>
              )}

              {/* Consent */}
              {rStep.type === "consent" && (
                <div className="space-y-3">
                  <button onClick={() => setPatientConsent("yes")} className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all border-2 ${patientConsent === "yes" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500" : "bg-green-50 text-gray-800 border-green-200 hover:border-green-400"}`}>
                    <span className="text-3xl">{"\u2705"}</span>
                    <div><p className="font-bold text-lg">Patient Consents</p><p className={patientConsent === "yes" ? "text-white/80" : "text-gray-500"}>I have asked and the patient consents to IMHA referral</p></div>
                  </button>
                  <button onClick={() => setPatientConsent("no")} className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all border-2 ${patientConsent === "no" ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500" : "bg-amber-50 text-gray-800 border-amber-200 hover:border-amber-400"}`}>
                    <span className="text-3xl">{"\u26A0\uFE0F"}</span>
                    <div><p className="font-bold text-lg">Patient Does Not Consent</p><p className={patientConsent === "no" ? "text-white/80" : "text-gray-500"}>Patient has declined or cannot give consent (referral can still proceed)</p></div>
                  </button>
                </div>
              )}

              {/* Section selection */}
              {rStep.type === "section" && (
                <div className="grid grid-cols-2 gap-3">
                  {SECTION_OPTIONS.map((option) => (
                    <button key={option.value} onClick={() => setPatientSection(option.value)} className={`p-5 rounded-xl text-center transition-all border-2 ${patientSection === option.value ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500" : "bg-indigo-50 text-gray-800 border-indigo-200 hover:border-indigo-400"}`}>
                      <p className="font-bold text-lg">{option.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Area selection */}
              {rStep.type === "area" && (
                <div className="space-y-3">
                  {AREA_OPTIONS.map((option) => (
                    <button key={option.value} onClick={() => setSelectedArea(option.value as "city" | "county")} className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all border-2 ${selectedArea === option.value ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-500" : "bg-violet-50 text-gray-800 border-violet-200 hover:border-violet-400"}`}>
                      <span className="text-3xl">{option.value === "city" ? "\uD83C\uDFD9\uFE0F" : "\uD83C\uDF33"}</span>
                      <div><p className="font-bold text-lg">{option.label}</p><p className={selectedArea === option.value ? "text-white/80" : "text-gray-500"}>{option.description}</p></div>
                    </button>
                  ))}
                </div>
              )}

              {/* Forms */}
              {rStep.type === "forms" && rStep.forms && (
                <div className="space-y-6">
                  {rStep.forms.blank.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Download className="w-5 h-5 text-blue-600" /> Blank Forms</h3>
                      <div className="space-y-2">
                        {rStep.forms.blank.filter((form) => !form.area || form.area === selectedArea).map((form) => (
                          <a key={form.label} href={form.url} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors no-underline border border-blue-200">
                            <span className="text-2xl">{form.icon || "\uD83D\uDCC4"}</span>
                            <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                            <Download className="w-5 h-5 text-blue-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {rStep.forms.wagoll.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Eye className="w-5 h-5 text-amber-600" /> Example (WAGOLL)</h3>
                      <div className="space-y-2">
                        {rStep.forms.wagoll.map((form) => (
                          <div key={form.label}>
                            <a href={form.url} className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl hover:from-amber-100 hover:to-yellow-100 transition-colors no-underline border border-amber-200">
                              <span className="text-2xl">{"\u2728"}</span>
                              <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                              <Eye className="w-5 h-5 text-amber-600" />
                            </a>
                            {form.note && <p className="text-sm text-amber-700 mt-1 ml-12 italic">{form.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rStep.forms.otherGuides.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-teal-600" /> Other Guides</h3>
                      <div className="space-y-2">
                        {rStep.forms.otherGuides.filter((form) => !form.area || form.area === selectedArea).map((form) => (
                          <a key={form.label} href={form.url} className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl hover:from-teal-100 hover:to-cyan-100 transition-colors no-underline border border-teal-200">
                            <span className="text-2xl">{"\uD83D\uDCDA"}</span>
                            <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                            <ExternalLink className="w-5 h-5 text-teal-600" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submission */}
              {rStep.type === "submission" && rStep.methods && (
                <div className="space-y-3">
                  {rStep.methods.filter((method) => !method.area || method.area === selectedArea).map((method) => (
                    <div key={method.label} className={`p-5 rounded-xl border-2 ${method.type === "email" ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200" : method.type === "phone" ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" : "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200"}`}>
                      <div className="flex items-center gap-3">
                        {method.type === "email" ? <Mail className="w-6 h-6 text-blue-600" /> : method.type === "phone" ? <Phone className="w-6 h-6 text-green-600" /> : <ExternalLink className="w-6 h-6 text-purple-600" />}
                        <div><p className="text-sm text-gray-500 font-medium">{method.label}</p><p className="font-bold text-gray-900 text-xl">{method.value}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case note */}
              {rStep.type === "casenote" && (rStep.clipboardText || rStep.isDynamic) && (
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl font-mono text-base leading-relaxed border-2 border-amber-200">{generateCaseNote()}</div>
                  <Button onClick={() => handleCopy(generateCaseNote())} className={`w-full py-4 text-lg ${copied ? "bg-green-600 hover:bg-green-700" : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"}`}>
                    {copied ? <><Check className="w-5 h-5 mr-2" /> Copied to Clipboard!</> : <><Copy className="w-5 h-5 mr-2" /> Copy to Clipboard</>}
                  </Button>
                </div>
              )}

              {/* Reminder */}
              {rStep.type === "reminder" && (
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <div className="flex items-center gap-3 mb-3"><Calendar className="w-6 h-6 text-indigo-600" /><span className="text-gray-800 font-semibold text-lg">Schedule a follow-up task?</span></div>
                    <p className="text-gray-600 text-sm mb-4">e.g. &ldquo;Chase by telephone if no response in 7 days&rdquo;<br />e.g. &ldquo;Revisit assessment in 14 days&rdquo;</p>
                    {isV2 ? (
                      <p className="text-sm text-gray-500 italic">Set a reminder in your team's job diary or task tracker.</p>
                    ) : (
                      <>
                        <button onClick={() => {
                          if (linkedPatient) {
                            const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 7);
                            addTask({ id: `task-followup-${Date.now()}`, type: "patient", title: `Follow up: ${title}`, category: "referral", patientName: linkedPatient.name, ward: linkedPatient.ward, priority: "routine", status: "pending", dueDate: futureDate.toISOString().split("T")[0], createdAt: new Date().toISOString().split("T")[0], createdBy: user?.name || "Unknown", carryOver: true, linkedReferralId: guideId });
                            setShowFireworks(true); setTimeout(() => setShowFireworks(false), 3000);
                          } else { setPendingFollowUp(true); setShowPatientPicker(true); }
                        }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm">
                          <Calendar className="w-4 h-4" /> + Add Follow-up Task
                        </button>
                        {showFireworks && !isComplete && <p className="text-green-600 text-sm font-medium mt-2">Follow-up task added to diary!</p>}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 text-center">This is optional &ndash; skip ahead if not needed.</p>
                </div>
              )}

              {/* GDPR */}
              {rStep.type === "gdpr" && (
                <div className="p-5 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl border-2 border-slate-200">
                  <div className="flex items-center gap-3 text-slate-700 font-semibold text-lg"><Shield className="w-6 h-6" /> Data Protection Reminder</div>
                  <p className="text-slate-600 mt-2">Remember to delete any downloaded forms containing patient data once submitted.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : hStep ? (
          /* How-to guide step content */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <span className="text-white font-bold text-lg">{currentStep + 1}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{hStep.title}</h2>
              </div>
              <div className="prose prose-gray max-w-none">
                {hStep.content.split("\n").map((line, i) => (
                  <p key={i} className={`${line.startsWith("- ") ? "ml-4" : ""} ${line === "" ? "h-2" : "mb-2"} text-gray-700 leading-relaxed`}>{line}</p>
                ))}
              </div>
              {hStep.tip && (
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900 leading-relaxed">
                      {hStep.tip.split("\n").map((line, i) => (<p key={i} className="mb-1">{line}</p>))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Side navigation arrows */}
        {currentStep > 0 && (
          <button onClick={handlePrev} className="fixed left-0 top-1/2 -translate-y-1/2 z-40 w-14 h-48 bg-nhs-blue/80 hover:bg-nhs-blue backdrop-blur-sm rounded-r-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:w-16" aria-label="Previous step">
            <ArrowLeft className="w-7 h-7 text-white" />
          </button>
        )}
        {!isComplete && (
          <button onClick={handleNext} disabled={!canProceed()} className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-14 h-48 bg-nhs-blue/80 hover:bg-nhs-blue backdrop-blur-sm rounded-l-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:w-16 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:w-14" aria-label="Next step">
            <ArrowRight className="w-7 h-7 text-white" />
          </button>
        )}
        {!isReferral && isComplete && (
          <button onClick={handleNext} className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-14 h-48 bg-green-600/80 hover:bg-green-700 backdrop-blur-sm rounded-l-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:w-16" aria-label="Next step">
            <Check className="w-7 h-7 text-white" />
          </button>
        )}

        {/* Referral completion actions */}
        {isReferral && isComplete && (
          <div className="flex gap-3">
            {!isV2 && !referralLogged && (
              <Button onClick={handleLogReferral} className="flex-1 py-4 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <ClipboardList className="w-5 h-5 mr-2" /> Log to Chase Log
              </Button>
            )}
            {!isV2 && referralLogged && (
              <Button disabled className="flex-1 py-4 text-lg bg-amber-100 text-amber-700 cursor-not-allowed">
                <Check className="w-5 h-5 mr-2" /> Logged
              </Button>
            )}
            <Button onClick={() => { setShowFireworks(true); setTimeout(() => router.push(link("/guides")), 2500); }} className="flex-1 py-4 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 relative overflow-hidden">
              <Check className="w-5 h-5 mr-2" /> Complete
            </Button>
          </div>
        )}

        {/* Fireworks */}
        {showFireworks && isReferral && isComplete && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-center animate-bounce">
              <div className="text-6xl mb-2">{"\uD83C\uDF89"}</div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl border-2 border-green-300">
                <p className="text-2xl font-black text-green-600">Well done!</p>
                <p className="text-sm text-gray-500 mt-1">Referral complete</p>
              </div>
            </div>
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="absolute w-3 h-3 rounded-full" style={{ left: `${Math.random() * 100}%`, top: `-5%`, backgroundColor: ["#DA291C", "#005EB8", "#007F3B", "#FFB81C", "#330072", "#AE2573"][i % 6], animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in forwards`, animationDelay: `${Math.random() * 0.5}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* How-to: Safeguarding referral prompt (last step of safeguarding guides) */}
        {!isReferral && isComplete && config.category === "Safeguarding" && (
          <div className="bg-white rounded-2xl border-2 border-red-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-200">
              <h3 className="text-lg font-bold text-gray-900">Do you need to make a referral?</h3>
              <p className="text-sm text-gray-600 mt-1">If you have concerns, start a safeguarding referral now</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => router.push(link("/guides/safeguarding"))} className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-md transition-all text-left">
                <span className="text-3xl">{"\uD83D\uDEE1\uFE0F"}</span>
                <div>
                  <p className="font-bold text-gray-900">Safeguarding Adults</p>
                  <p className="text-sm text-gray-500">S.42 referral - Derby City or County</p>
                </div>
              </button>
              <button onClick={() => router.push(link("/guides/safeguarding-children"))} className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200 hover:border-pink-400 hover:shadow-md transition-all text-left">
                <span className="text-3xl">{"\uD83D\uDC76"}</span>
                <div>
                  <p className="font-bold text-gray-900">Safeguarding Children</p>
                  <p className="text-sm text-gray-500">Starting Point referral</p>
                </div>
              </button>
            </div>
            <div className="px-6 pb-4">
              <p className="text-xs text-gray-400 text-center">Or scroll down to add a case note and schedule a follow-up task</p>
            </div>
          </div>
        )}

        {/* How-to: Completion actions (last step) */}
        {!isReferral && isComplete && (
          <div className="space-y-4">
            {/* Case note copy */}
            <div className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-3 border-b border-amber-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Clipboard className="w-5 h-5 text-amber-600" /> Case Note Entry</h3>
                <p className="text-sm text-gray-500 mt-0.5">Copy to the patient's notes</p>
              </div>
              <div className="p-6">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl font-mono text-sm leading-relaxed border border-amber-200">
                  {linkedPatient ? `Patient: ${linkedPatient.name}. ` : ""}{title} reviewed on {todayDate}.{user?.name ? ` Completed by ${user.name}.` : ""}
                </div>
                <Button onClick={() => {
                  const text = `${linkedPatient ? `Patient: ${linkedPatient.name}. ` : ""}${title} reviewed on ${todayDate}.${user?.name ? ` Completed by ${user.name}.` : ""}`;
                  handleCopy(text);
                }} className={`w-full mt-3 py-3 ${copied ? "bg-green-600 hover:bg-green-700" : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"}`}>
                  {copied ? <><Check className="w-5 h-5 mr-2" /> Copied!</> : <><Copy className="w-5 h-5 mr-2" /> Copy to Clipboard</>}
                </Button>
              </div>
            </div>

            {/* Follow-up task - hidden in v2 (no job diary) */}
            {!isV2 && (
              <div className="bg-white rounded-xl border-2 border-indigo-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b border-indigo-200">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600" /> Follow-up Task</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Add a reminder to your job diary</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">e.g. &ldquo;Chase outcome in 7 days&rdquo; or &ldquo;Revisit assessment in 14 days&rdquo;</p>
                  <button onClick={() => {
                    if (linkedPatient) {
                      const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 7);
                      addTask({ id: `task-followup-${Date.now()}`, type: "patient", title: `Follow up: ${title}`, category: "other", patientName: linkedPatient.name, ward: linkedPatient.ward, priority: "routine", status: "pending", dueDate: futureDate.toISOString().split("T")[0], createdAt: new Date().toISOString().split("T")[0], createdBy: user?.name || "Unknown", carryOver: true, linkedGuideId: guideId });
                      setShowFireworks(true); setTimeout(() => setShowFireworks(false), 3000);
                    } else {
                      setPendingFollowUp(true); setShowPatientPicker(true);
                    }
                  }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm">
                    <Calendar className="w-4 h-4" /> + Add Follow-up Task (7 days)
                  </button>
                  {showFireworks && !isReferral && <p className="text-green-600 text-sm font-medium mt-3">Follow-up task added to diary!</p>}
                  <p className="text-xs text-gray-400 mt-2">Optional - skip if not needed.</p>
                </div>
              </div>
            )}

            {/* GDPR reminder */}
            <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-gray-100 px-6 py-3 border-b border-slate-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Shield className="w-5 h-5 text-slate-600" /> Data Protection Reminder</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 text-sm">Delete any downloaded forms or documents containing patient data from your computer once submitted. Do not store patient-identifiable information locally.</p>
              </div>
            </div>
          </div>
        )}

        {/* How-to: WAGOLL section */}
        {!isReferral && GUIDE_WAGOLLS[guideId] && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-600" /> What a Good One Looks Like (WAGOLL)</h3>
            <p className="text-sm text-gray-600 mb-3">See a completed example to understand the expected level of detail.</p>
            <div className="flex flex-wrap gap-2">
              {GUIDE_WAGOLLS[guideId].map((w, i) => (
                <a key={i} href={w.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-amber-800 hover:bg-amber-100 border border-amber-300 transition-colors no-underline">
                  {"\uD83D\uDCC4"} {w.label}
                </a>
              ))}
            </div>
            <p className="text-xs text-amber-700 mt-2 italic">Example only - do not submit. Fictional data.</p>
          </div>
        )}

        {/* How-to: Related Resources */}
        {!isReferral && (
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Related Resources</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(GUIDE_CONFIG)
                .filter(([id]) => id !== guideId && GUIDE_CONFIG[id]?.category === config.category)
                .slice(0, 3)
                .map(([id, cfg]) => (
                  <button key={id} onClick={() => { setCurrentStep(0); setCompletedSteps([]); router.push(link(`/guides/${id}`)); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gradient-to-r hover:${cfg.gradient} hover:text-white transition-all border border-gray-200`}>
                    {cfg.icon} {id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {!isV2 && (
        <PatientPickerModal isOpen={showPatientPicker} onClose={() => setShowPatientPicker(false)} onSelect={handlePatientSelect} title={title} type={isReferral ? "referral" : "guide"} />
      )}
    </MainLayout>
  );
}
