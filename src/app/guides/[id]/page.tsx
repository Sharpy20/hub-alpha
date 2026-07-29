"use client";

import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent, Badge, Breadcrumb, CopyChip, renderWithContacts } from "@/components/ui";
import { GuideFeedback } from "@/components/guides/GuideFeedback";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/app/providers";
import { useTasks } from "@/app/tasks-provider";
import { useCanEdit } from "@/lib/hooks/useCanEdit";
import { PatientPickerModal } from "@/components/modals/PatientPickerModal";
import { AddTaskModal, type AddTaskPrefill } from "@/components/modals";
import { Patient, DiaryTask } from "@/lib/types";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTour } from "@/app/tour-provider";
import {
  CheckCircle, FileText, Eye, BookOpen, Send, Clipboard, ClipboardList,
  Calendar, Shield, ArrowLeft, ArrowRight, Check, Copy, Download,
  ExternalLink, Phone, Mail, Pencil, UserPlus, AlertCircle, Lightbulb, Info, Printer, Undo2,
} from "lucide-react";
import {
  WORKFLOWS, DEFAULT_WORKFLOW, STEP_GRADIENTS, SECTION_OPTIONS, S117_OPTIONS, AREA_OPTIONS,
  type WorkflowData, type WorkflowStep,
} from "@/lib/data/guides/referral-workflows";
import { ProgressiveContent } from "@/components/guides/ProgressiveContent";
import { HandBackModal } from "@/components/modals/HandBackModal";
import { HandbackBadge } from "@/components/tasks/HandbackBadge";
import { CriteriaWalker } from "@/components/guides/CriteriaWalker";
import {
  GUIDES, DEFAULT_GUIDE, GUIDE_CONFIG, GUIDE_WAGOLLS,
  type GuideData,
} from "@/lib/data/guides/howto-guides";
import { PayBandPicker } from "@/components/guides/PayBandPicker";
import { PayFaqAccordion } from "@/components/guides/PayFaqAccordion";
import { ShiftChecker } from "@/components/guides/ShiftChecker";
import { PayslipDecoder } from "@/components/guides/PayslipDecoder";
import { usePayBand } from "@/lib/hooks/usePayBand";
import { HOURS_PER_YEAR, EFFECTIVE_FROM, gbp } from "@/lib/data/guides/pay-scales";
import { useIsV2, useV2Href } from "@/lib/hooks/useV2";
import { toLocalDateStr } from "@/lib/utils/date";

// Step icons for referral workflows
const STEP_ICONS: Record<string, typeof CheckCircle> = {
  info: Info, criteria: CheckCircle, consent: CheckCircle, section: FileText, s117: FileText, area: FileText,
  forms: FileText, submission: Send, casenote: Clipboard, reminder: Calendar, gdpr: Shield,
};

// Guide text can carry inline [#n] reference tokens pointing at the guide's
// numbered sources. With the "Show references" toggle on they render as
// superscript markers linking to the References panel; off (the default)
// they are stripped so the text reads clean.
function renderGuideText(text: string, showRefs: boolean) {
  const parts = text.split(/(\[#\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[#(\d+)\]$/);
    if (m) {
      if (!showRefs) return null;
      return (
        <sup key={i}>
          <a href="#guide-references" className="text-nhs-blue font-bold text-[0.7em] hover:text-nhs-dark-blue no-underline" aria-label={`Reference ${m[1]}`}>
            {m[1]}
          </a>
        </sup>
      );
    }
    return <span key={i}>{renderWithLinks(part)}</span>;
  });
}

// Turn bare URLs in guide step text into clickable links (trailing punctuation
// like a full stop or bracket is kept out of the link).
function renderWithLinks(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+|www\.[^\s]+)/g);
  return parts.map((part, i) => {
    if (/^(https?:\/\/|www\.)/.test(part)) {
      const trail = part.match(/[.,;:)\]]+$/)?.[0] ?? "";
      const url = trail ? part.slice(0, -trail.length) : part;
      const href = url.startsWith("http") ? url : `https://${url}`;
      return (
        <span key={i}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-nhs-blue font-medium hover:text-nhs-dark-blue break-words">{url}</a>
          {trail}
        </span>
      );
    }
    // Anything that is not a URL still gets scanned for phone numbers and
    // email addresses, each of which picks up a copy button.
    return <span key={i}>{renderWithContacts(part)}</span>;
  });
}

export default function UnifiedGuidePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, activeWard } = useApp();
  const { addTask, tasks, toggleComplete, handBackTask, claimTask } = useTasks();
  const { canEdit } = useCanEdit();
  const { isTourActive, setIsInLiveWalkthrough, setCurrentSection, setCurrentSlide } = useTour();
  const isTourMode = searchParams.get("tour") === "true";
  const isV2 = useIsV2();
  const link = useV2Href();

  // In the limited (PII-free) build, case notes must not show a staff name -
  // show the role instead (Staff / Editor). The full build keeps the name.
  const caseNoteBy = isV2 ? (user?.isContributor ? "Editor" : "Staff") : user?.name;

  const guideId = params.id as string;

  // Legacy ids: the combined pay-roster guide split back into three guides
  // (13 Jul 2026) - old /guides/pay-roster links land on the payslip guide,
  // which cross-links the roster and leave-absence halves.
  const legacyTarget = ({ "pay-roster": "payslip" } as Record<string, string>)[guideId];
  useEffect(() => {
    if (legacyTarget) router.replace(link(`/guides/${legacyTarget}`));
  }, [legacyTarget, router, link]);

  // Determine guide type
  const isReferral = !!WORKFLOWS[guideId];
  const workflow: WorkflowData = isReferral ? (WORKFLOWS[guideId] || DEFAULT_WORKFLOW) : DEFAULT_WORKFLOW;
  const guide: GuideData = !isReferral ? (GUIDES[guideId] || DEFAULT_GUIDE) : DEFAULT_GUIDE;
  const config = isReferral
    ? { icon: workflow.icon, gradient: workflow.gradient, category: "Referral" }
    : (GUIDE_CONFIG[guideId] || { icon: "\uD83D\uDCD6", gradient: "from-blue-500 to-blue-700", category: "Guide" });

  // Some how-to guides are the write-up for a recurring ward diary task (e.g.
  // fridge temps). If one of today's ward tasks for the active ward is linked to
  // this guide, offer a "Mark completed for today" button at the end - so the job
  // gets ticked off in the diary however the nurse reached the guide.
  const linkedWardTask = (() => {
    if (isReferral) return undefined;
    const today = toLocalDateStr();
    const dow = new Date(today + "T12:00:00").getDay();
    return tasks.find(
      (t) =>
        t.type === "ward" &&
        t.linkedGuideId === guideId &&
        t.ward === activeWard &&
        ((t.isRecurring && Array.isArray(t.recurringDays) && t.recurringDays.includes(dow)) || t.dueDate === today)
    );
  })();

  // "Show references" toggle - off by default, remembered per device.
  const [showRefs, setShowRefs] = useState(false);
  useEffect(() => {
    try { setShowRefs(localStorage.getItem("wardhub_show_refs") === "1"); } catch { /* private mode */ }
  }, []);
  const toggleRefs = () => {
    setShowRefs((v) => {
      try { localStorage.setItem("wardhub_show_refs", v ? "0" : "1"); } catch { /* private mode */ }
      return !v;
    });
  };

  // Print options: Simple (plain, ink-friendly), Full (colour, closer to the
  // screen), or a chosen set of sections. printMode defaults to "simple" so a
  // plain browser Ctrl+P still gives the clean version.
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [printMode, setPrintMode] = useState<"simple" | "full">("simple");
  const [printSteps, setPrintSteps] = useState<Set<string> | null>(null);
  const [showPrintPicker, setShowPrintPicker] = useState(false);
  const [pickerSel, setPickerSel] = useState<Set<string>>(new Set());

  const runPrint = (mode: "simple" | "full", steps: Set<string> | null) => {
    setPrintMode(mode);
    setPrintSteps(steps);
    setPrintMenuOpen(false);
    setShowPrintPicker(false);
    // Let React paint the chosen print layout before the dialog opens.
    setTimeout(() => window.print(), 80);
  };

  // The steps available to print, normalised across guide + referral types.
  const printableSteps: { id: string; title: string; content: string; tldr?: string; tip?: string }[] =
    isReferral ? workflow.steps.map((s) => ({ id: s.id, title: s.title, content: s.content })) : guide.steps;
  const inPrint = (id: string) => printSteps === null || printSteps.has(id);

  // Personalised print: the payslip guide carries the user's saved band, so its
  // printout can show their own rates instead of the generic examples.
  const { band: myBand, step: myStep } = usePayBand();
  const showMyBand = guideId === "payslip" && myBand && myStep;
  const myHourly = myStep ? myStep.annual / HOURS_PER_YEAR : 0;
  const myNight = myBand ? Math.round(myBand.night * 100) : 0;
  const mySunday = myBand ? Math.round(myBand.sunday * 100) : 0;
  const myBandBox = showMyBand ? (
    printMode === "full" ? (
      <div className="pc-card">
        <div className="pc-head"><span style={{ fontSize: "13px", fontWeight: 700 }}>Your figures - Band {myBand!.band}, {myStep!.label}</span></div>
        <div className="pc-body" style={{ fontSize: "12px", lineHeight: 1.4 }}>
          <p style={{ margin: "0 0 3px" }}>Hourly rate (the RATE on your payslip): <strong>{gbp(myHourly, 4)}</strong>. Basic pay a month: <strong>{gbp(myStep!.annual / 12)}</strong>.</p>
          <p style={{ margin: "0 0 3px" }}>Your enhancement rates: nights &amp; Saturdays <strong>+{myNight}%</strong>; Sundays &amp; bank holidays <strong>+{mySunday}%</strong>.</p>
          <p style={{ margin: 0 }}>10 night hours = {(10 * myBand!.night).toFixed(2)} extra paid hours = <strong>{gbp(10 * myBand!.night * myHourly)}</strong> on top of {gbp(10 * myHourly)} basic.</p>
          <p style={{ fontSize: "9px", color: "#64748b", marginTop: "3px" }}>Rates as at {EFFECTIVE_FROM}. Estimate - check your own payslip.</p>
        </div>
      </div>
    ) : (
      <section className="mb-4" style={{ breakInside: "avoid" }}>
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-1">Your figures - Band {myBand!.band}, {myStep!.label}</h2>
        <div className="text-sm leading-snug">
          <p>Hourly rate: {gbp(myHourly, 4)}. Basic pay a month: {gbp(myStep!.annual / 12)}.</p>
          <p>Enhancements: nights &amp; Saturdays +{myNight}%; Sundays &amp; bank holidays +{mySunday}%.</p>
          <p>10 night hours = {(10 * myBand!.night).toFixed(2)} extra paid hours = {gbp(10 * myBand!.night * myHourly)} on top of {gbp(10 * myHourly)} basic. Rates as at {EFFECTIVE_FROM}.</p>
        </div>
      </section>
    )
  ) : null;

  // Shared state
  const [currentStep, setCurrentStep] = useState(0);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [linkedPatient, setLinkedPatient] = useState<Patient | null>(null);

  // The patient job this guide is being worked through for, if there is one.
  // This is the second door onto the hand-back sheet (BACKLOG Section M): you
  // get to the end of a guide, it is not finished, and "mark complete" would be
  // a lie - so offer "not finished" right where the decision is made.
  const linkedPatientTask = (() => {
    if (!linkedPatient) return undefined;
    return tasks.find(
      (t) =>
        (t.type === "patient" || t.type === "appointment") &&
        t.status !== "completed" &&
        t.patientId === linkedPatient.id &&
        (isReferral ? t.linkedReferralId === guideId : t.linkedGuideId === guideId)
    );
  })();

  // Whichever job this guide is standing in for - patient job first, since a
  // patient-linked guide is the case the spec cares about.
  const linkedJob = linkedPatientTask || linkedWardTask;

  const [showFireworks, setShowFireworks] = useState(false);
  const [copied, setCopied] = useState(false);
  // Randomised once per mount (lazy initialiser) so re-renders don't reshuffle
  // the confetti mid-fall
  const [confettiPieces] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      color: ["#DA291C", "#005EB8", "#007F3B", "#FFB81C", "#330072", "#AE2573"][i % 6],
      animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in forwards`,
      delay: `${Math.random() * 0.5}s`,
    }))
  );

  // Referral-specific state
  const [criteriaConfirmed, setCriteriaConfirmed] = useState(false);
  const [patientConsent, setPatientConsent] = useState<"yes" | "no" | null>(null);
  // Separate from consent: was the person actually told the referral is going in.
  // Only asked where the step sets informedQuestion (the two safeguarding guides).
  const [patientInformed, setPatientInformed] = useState<"yes" | "no" | null>(null);
  const [patientSection, setPatientSection] = useState<string>("");
  const [s117Status, setS117Status] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<"city" | "county" | null>(null);
  const [pendingFollowUp, setPendingFollowUp] = useState(false);

  // Follow-up task. Used to silently create a task 7 days out that you never
  // saw and could not change (Mike, 27 Jul: "doesn't visually do anything on
  // the screen"). Now it opens the real Add Task screen, pre-filled with what
  // the guide already knows, and you save it yourself.
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [showHandBack, setShowHandBack] = useState(false);
  const [followUpAdded, setFollowUpAdded] = useState(false);

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
    const today = toLocalDateStr();
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
    // The follow-up was waiting on "who is this for?" - now we know, open the
    // Add Task screen pre-filled rather than creating one behind their back.
    if (pendingFollowUp) {
      setPendingFollowUp(false);
      setShowAddFollowUp(true);
    }
  };

  // Referral: case note generation
  const todayDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const generateCaseNote = () => {
    if (!rStep) return "";
    if (guideId === "imha-advocacy") {
      const areaName = selectedArea === "city" ? "Derby City IMHA (Disability Direct)" : "Derbyshire County IMHA (Cloverleaf)";
      const areaEmail = selectedArea === "city" ? "info@disabilitydirect.com" : "referrals@cloverleaf-advocacy.co.uk";
      const patientText = linkedPatient ? `Patient: ${linkedPatient.name}. ` : "";
      const staffText = caseNoteBy ? ` Referral completed by ${caseNoteBy}.` : "";
      let statusText: string;
      if (patientSection === "informal") {
        statusText = "Patient is informal (voluntary)";
      } else {
        const sectionLabel = SECTION_OPTIONS.find(o => o.value === patientSection)?.label || patientSection?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "[SECTION]";
        statusText = `Patient is detained under ${sectionLabel}`;
      }
      const consentStep = workflow.steps.find(s => s.type === "consent");
      const consentText = patientConsent && consentStep
        ? ` ${patientConsent === "yes" ? consentStep.consentYesNote : consentStep.consentNoNote}`
        : "";
      return `${patientText}Referral for IMHA sent to ${areaName} via email to ${areaEmail} on ${todayDate}. ${statusText} and would benefit from independent advocacy support.${consentText}${staffText}`;
    }
    let text = rStep.clipboardText || "";
    text = text.replace(/\[DATE\]/g, todayDate);
    // Answers the user gave earlier in the wizard. Each step owns the wording it
    // wants in the note (consentYesNote etc) so the viewer never invents clinical
    // phrasing. An unanswered question leaves its placeholder visible rather than
    // guessing - a blank is obvious, a wrong assertion is not.
    const consentStep = workflow.steps.find(s => s.type === "consent");
    if (patientConsent && consentStep) {
      const note = patientConsent === "yes" ? consentStep.consentYesNote : consentStep.consentNoNote;
      if (note) text = text.replace(/\[CONSENT\]/g, note);
    }
    if (patientInformed && consentStep) {
      const note = patientInformed === "yes" ? consentStep.informedYesNote : consentStep.informedNoNote;
      if (note) text = text.replace(/\[INFORMED\]/g, note);
    }
    if (s117Status) {
      const opt = S117_OPTIONS.find(o => o.value === s117Status);
      if (opt) {
        text = text.replace(
          /\[S117\]/g,
          opt.entitled
            // Lowercase the first letter only - toLowerCase() on the whole label
            // turned "Previously on Section 3" into "section 3".
            ? `Patient has S117 aftercare entitlement (${opt.label.charAt(0).toLowerCase() + opt.label.slice(1)}) - a S117 aftercare meeting is required before discharge.`
            : "Patient has no qualifying section, so no S117 aftercare entitlement; standard Care Act route."
        );
      }
    }
    if (selectedArea) {
      text = text.replace(/\[DERBY CITY\/DERBYSHIRE COUNTY\]/g, selectedArea === "city" ? "Derby City" : "Derbyshire County");
      text = text.replace(/\[DERBY\/COUNTY\]/g, selectedArea === "city" ? "Derby City" : "Derbyshire County");
    }
    if (patientSection) {
      const sectionLabel = SECTION_OPTIONS.find(o => o.value === patientSection)?.label || patientSection.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      text = text.replace(/\[SECTION\]/g, sectionLabel);
    }
    if (linkedPatient) text = `Patient: ${linkedPatient.name}. ${text}`;
    if (caseNoteBy) text = `${text} Completed by ${caseNoteBy}.`;
    return text;
  };

  const canProceed = () => {
    if (!isReferral || !rStep) return true;
    if (rStep.type === "criteria") return criteriaConfirmed;
    if (rStep.type === "consent") return patientConsent !== null && (!rStep.informedQuestion || patientInformed !== null);
    if (rStep.type === "section") return patientSection !== "";
    if (rStep.type === "s117") return s117Status !== "";
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

  // A follow-up needs a patient. If the guide has one linked, go straight to
  // the Add Task screen; if not, ask who it is for first (the picker then
  // re-enters here via handlePatientSelect).
  const openFollowUp = () => {
    if (linkedPatient) {
      setShowAddFollowUp(true);
    } else {
      setPendingFollowUp(true);
      setShowPatientPicker(true);
    }
  };

  // What the guide already knows, handed to the Add Task screen as a starting
  // point. Everything stays editable before saving.
  const followUpPrefill: AddTaskPrefill = {
    taskType: "patient",
    title: `Follow up: ${title}`,
    patientName: linkedPatient?.name,
    category: isReferral ? "referral" : "other",
    linkedGuide: guideId,
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return toLocalDateStr(d);
    })(),
  };

  const isComplete = currentStep === totalSteps - 1;

  // Tour mode
  const handleReturnToTour = () => {
    setIsInLiveWalkthrough(false);
    setCurrentSection("task-diary");
    setCurrentSlide(0);
    router.push(link("/"));
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

      {/* Print-only full guide. Renders EVERY step from the same GUIDES / WORKFLOWS
          data the interactive view uses, so any future edit to a guide automatically
          flows through to its printout - there is no separate copy to keep in sync. */}
      <div className={`hidden print:block text-black ${printMode === "full" ? "print-full-colour" : ""}`}>
        {printMode === "full" ? (
          <>
            <div className="pc-card">
              <div className="pc-head"><span style={{ fontSize: "17px", fontWeight: 800 }}>{title}</span></div>
              <div className="pc-body">
                <p style={{ fontSize: "12px", margin: 0 }}>{description}</p>
                <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginTop: "4px" }}>
                  wardHub{!isReferral ? ` - ${config.category}` : " - Referral workflow"}{printSteps ? " - selected sections" : ""} - printed reference, verify against the live guide
                </p>
              </div>
            </div>
            {myBandBox}
            {printableSteps.map((s, i) => inPrint(s.id) && (
              <div key={s.id} className="pc-card">
                <div className="pc-head"><span style={{ fontSize: "13px", fontWeight: 700 }}>{i + 1}. {s.title}</span></div>
                <div className="pc-body">
                  {s.tldr && <div className="pc-tldr" style={{ fontSize: "11px" }}><strong>In a hurry:</strong> {s.tldr}</div>}
                  <div style={{ fontSize: "12px", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{s.content.replace(/\[#\d+\]/g, "")}</div>
                  {s.tip && <div className="pc-tip" style={{ fontSize: "11px" }}><strong>Tip:</strong> {s.tip}</div>}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-gray-700 mb-1">{description}</p>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-4">
              wardHub{!isReferral ? ` - ${config.category}` : " - Referral workflow"}{printSteps ? " - selected sections" : ""} - printed reference, verify against the live guide
            </p>

            {myBandBox}
            {!isReferral && guide.steps.map((s, i) => inPrint(s.id) && (
              <section key={s.id} className="mb-4" style={{ breakInside: "avoid" }}>
                <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-1">{i + 1}. {s.title}</h2>
                <div className="text-sm whitespace-pre-wrap leading-snug">{renderWithLinks(s.content.replace(/\[#\d+\]/g, ""))}</div>
                {s.tip && <p className="text-sm italic text-gray-600 mt-1">Tip: {s.tip}</p>}
              </section>
            ))}

            {isReferral && workflow.steps.map((s, i) => {
              if (!inPrint(s.id)) return null;
              const links = s.forms ? [...s.forms.blank, ...s.forms.wagoll, ...s.forms.otherGuides].filter((f) => f.url && f.url !== "#") : [];
              return (
                <section key={s.id} className="mb-4" style={{ breakInside: "avoid" }}>
                  <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-1">{i + 1}. {s.title}</h2>
                  <div className="text-sm whitespace-pre-wrap leading-snug">{renderWithLinks(s.content)}</div>
                  {links.length > 0 && (
                    <ul className="text-sm list-disc ml-5 mt-1">
                      {links.map((f) => <li key={f.label}>{f.label}: {f.url}</li>)}
                    </ul>
                  )}
                  {s.methods && s.methods.length > 0 && (
                    <ul className="text-sm list-disc ml-5 mt-1">
                      {s.methods.map((m) => <li key={m.label + m.value}>{m.label}: {m.value}</li>)}
                    </ul>
                  )}
                  {s.clipboardText && (
                    <pre className="text-sm whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-2 mt-1">{s.clipboardText}</pre>
                  )}
                </section>
              );
            })}
          </>
        )}

        {!isReferral && guide.caseNote && (
          <section className="mt-4" style={{ breakInside: "avoid" }}>
            <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-1">Case note</h2>
            <pre className="text-sm whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-2">{guide.caseNote}</pre>
          </section>
        )}

        {!isReferral && guide.focus && guide.focus.length > 0 && (
          <section className="mt-4">
            <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-1">On FOCUS (trust login needed)</h2>
            <ul className="text-sm list-disc ml-5">{guide.focus.map((f) => <li key={f.url}>{f.label}: {f.url}</li>)}</ul>
          </section>
        )}

        {!isReferral && guide.downloads && guide.downloads.length > 0 && (
          <section className="mt-4">
            <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-1">Printable forms</h2>
            <ul className="text-sm list-disc ml-5">{guide.downloads.map((d) => <li key={d.url}>{d.label}: {d.url}</li>)}</ul>
          </section>
        )}
      </div>

      {/* Personalised print - pick the sections to include */}
      {showPrintPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 print:hidden" role="dialog" aria-modal="true" aria-label="Choose sections to print" onClick={() => setShowPrintPicker(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Choose sections to print</h3>
              <p className="text-sm text-gray-500 mt-0.5">Tick the sections that apply to you. We have pre-ticked the ones you have already opened - the printout keeps them in order and adds a splash of colour.</p>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-1">
              <div className="flex gap-2 mb-2">
                <button onClick={() => setPickerSel(new Set(printableSteps.map((s) => s.id)))} className="text-xs font-medium text-nhs-blue hover:underline">Select all</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setPickerSel(new Set())} className="text-xs font-medium text-nhs-blue hover:underline">Clear</button>
              </div>
              {printableSteps.map((s, i) => (
                <label key={s.id} className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={pickerSel.has(s.id)} onChange={(e) => {
                    setPickerSel((prev) => { const n = new Set(prev); if (e.target.checked) n.add(s.id); else n.delete(s.id); return n; });
                  }} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-nhs-blue focus:ring-nhs-blue" />
                  <span className="text-sm text-gray-700"><span className="text-gray-500">{i + 1}.</span> {s.title}</span>
                </label>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowPrintPicker(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => pickerSel.size > 0 && runPrint("full", new Set(pickerSel))} disabled={pickerSel.size === 0}
                className="px-4 py-2 text-sm font-semibold text-white bg-nhs-blue hover:bg-nhs-dark-blue rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
                Print {pickerSel.size} section{pickerSel.size === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 print:hidden">
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
            <div className="flex items-center gap-2">
              <div className="relative print:hidden">
                <button
                  onClick={() => setPrintMenuOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={printMenuOpen}
                  aria-label="Print this guide"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                {printMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setPrintMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden text-left">
                      <button onClick={() => runPrint("simple", null)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                        <span className="block font-semibold text-gray-800 text-sm">Simple print</span>
                        <span className="block text-xs text-gray-500">Plain text, easy on ink</span>
                      </button>
                      <button onClick={() => runPrint("full", null)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                        <span className="block font-semibold text-gray-800 text-sm">Full colour</span>
                        <span className="block text-xs text-gray-500">Styled like the screen{showMyBand ? ", with your band's figures" : ""}</span>
                      </button>
                      <button
                        onClick={() => {
                          const done = printableSteps.filter((s) => completedSteps.includes(s.id)).map((s) => s.id);
                          setPickerSel(new Set(done.length ? done : printableSteps.map((s) => s.id)));
                          setPrintMenuOpen(false);
                          setShowPrintPicker(true);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50"
                      >
                        <span className="block font-semibold text-gray-800 text-sm">Choose sections</span>
                        <span className="block text-xs text-gray-500">Pick which parts to print</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              {canEdit && (
                <Link href={link("/admin/workflows")} className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors no-underline">
                  <Pencil className="w-4 h-4" /> Edit
                </Link>
              )}
            </div>
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

          {/* Patient link - hidden in v2 (PII-free) and on staff-life guides
              (guide.noCaseNote) that are never recorded against a patient */}
          {!isV2 && !guide.noCaseNote && (
            <div className="mt-4 pt-4 border-t border-white/20">
              {linkedPatient ? (
                <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center"><UserPlus className="w-5 h-5" /></div>
                    <div>
                      <p className="font-semibold">{linkedPatient.name}</p>
                      <p className="text-white/70 text-sm">{linkedPatient.ward} Ward</p>
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
            <p className="diary-muted text-sm text-center font-medium">Step {currentStep + 1} of {totalSteps}: {rStep?.title}</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 diary-muted text-sm font-medium">
            <span>Step <strong className="text-foreground">{currentStep + 1}</strong> of <strong className="text-foreground">{totalSteps}</strong></span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
            </div>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% complete</span>
          </div>
        )}

        {/* Development disclaimer - shown on every guide. DELETE THIS BLOCK AT LAUNCH. */}
        <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-300 rounded-xl text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
          <p>
            <strong>wardHub is still in development.</strong> Guides are still being built and
            confirmed - treat everything as draft until this notice disappears at launch.
          </p>
        </div>

        {/* Step navigation pills/grid */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-4">
          <div className={isReferral ? "grid grid-cols-2 md:grid-cols-3 gap-2" : "flex flex-wrap gap-2"}>
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
                <button key={s.id} onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    index === currentStep ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                      : completedSteps.includes(s.id) ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}>
                  {completedSteps.includes(s.id) && <Check className="w-3 h-3" />}
                  <span>{index + 1}</span>
                  <span className="truncate max-w-[200px]">{s.title}</span>
                </button>
              ))
            )}
          </div>
          <div className={`flex ${!isReferral && guide?.sources ? "justify-between" : "justify-end"} mt-2`}>
            {!isReferral && guide?.sources && (
              <button onClick={toggleRefs} aria-pressed={showRefs}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  showRefs ? "bg-nhs-blue text-white" : "text-nhs-blue hover:bg-blue-50"
                }`}>
                <BookOpen className="w-3.5 h-3.5" /> {showRefs ? "Hide references" : "Show references"}
              </button>
            )}
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
                  <Badge className={`bg-gradient-to-r ${STEP_GRADIENTS[rStep.type]} text-white border-0`}>{rStep.type === "casenote" ? "CASE NOTE" : rStep.type.toUpperCase()}</Badge>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{rStep.title}</h2>
                </div>
              </div>
              <div className="mb-6">
                {rStep.progressive ? (
                  <ProgressiveContent
                    content={rStep.content}
                    renderLine={renderWithLinks}
                    extras={rStep.walk ? { [rStep.walk.section]: <CriteriaWalker walk={rStep.walk} /> } : undefined}
                  />
                ) : (
                  rStep.content.split("\n").map((line, i) => (
                    <p key={i} className={`text-gray-600 text-lg ${line.startsWith("•") ? "ml-4" : ""} ${line === "" ? "h-3" : "mb-1.5"}`}>{renderWithLinks(line)}</p>
                  ))
                )}
              </div>

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
                    <div><p className="font-bold text-lg">{rStep.consentYesLabel || "Consent Obtained"}</p><p className={patientConsent === "yes" ? "text-white/80" : "text-gray-500"}>{rStep.consentYesDesc || "I have asked and consent has been given"}</p></div>
                  </button>
                  <button onClick={() => setPatientConsent("no")} className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all border-2 ${patientConsent === "no" ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500" : "bg-amber-50 text-gray-800 border-amber-200 hover:border-amber-400"}`}>
                    <span className="text-3xl">{"\u26A0\uFE0F"}</span>
                    <div><p className="font-bold text-lg">{rStep.consentNoLabel || "No Consent"}</p><p className={patientConsent === "no" ? "text-white/80" : "text-gray-500"}>{rStep.consentNoDesc || "Consent declined or could not be obtained (referral can still proceed)"}</p></div>
                  </button>

                  {/* Second question on the same screen. Consent and informing are
                      different facts and the case note needs both, so asking them
                      together beats an extra step in the wizard. */}
                  {rStep.informedQuestion && (
                    <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
                      <p className="font-semibold text-gray-800">{rStep.informedQuestion}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setPatientInformed("yes")} className={`p-4 rounded-xl text-center transition-all border-2 ${patientInformed === "yes" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500" : "bg-green-50 text-gray-800 border-green-200 hover:border-green-400"}`}>
                          <p className="font-bold">{rStep.informedYesLabel || "Informed"}</p>
                        </button>
                        <button onClick={() => setPatientInformed("no")} className={`p-4 rounded-xl text-center transition-all border-2 ${patientInformed === "no" ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-500" : "bg-amber-50 text-gray-800 border-amber-200 hover:border-amber-400"}`}>
                          <p className="font-bold">{rStep.informedNoLabel || "Not informed"}</p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* S117 status. Its own three options rather than the 10-way MHA list -
                  entitlement turns on whether a qualifying section was EVER held, and
                  "previously on S3" cannot be said with the generic picker. */}
              {rStep.type === "s117" && (
                <div className="space-y-3">
                  {S117_OPTIONS.map((option) => (
                    <button key={option.value} onClick={() => setS117Status(option.value)} className={`w-full p-5 rounded-xl text-left flex items-center gap-4 transition-all border-2 ${s117Status === option.value ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500" : "bg-indigo-50 text-gray-800 border-indigo-200 hover:border-indigo-400"}`}>
                      <span className="text-3xl">{option.entitled ? "⚖️" : "➖"}</span>
                      <div><p className="font-bold text-lg">{option.label}</p><p className={s117Status === option.value ? "text-white/80" : "text-gray-500"}>{option.description}</p></div>
                    </button>
                  ))}
                  {s117Status && (
                    <div className={`rounded-xl p-4 border-2 ${S117_OPTIONS.find(o => o.value === s117Status)?.entitled ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-200"}`}>
                      <p className="font-semibold text-gray-800">
                        {S117_OPTIONS.find(o => o.value === s117Status)?.entitled
                          ? "S117 pathway - a S117 aftercare meeting is required before discharge (7 days notice), as well as this referral."
                          : "Standard Care Act pathway - no S117 aftercare meeting needed."}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {S117_OPTIONS.find(o => o.value === s117Status)?.entitled
                          ? "This is separate from the discharge planning meeting every patient should have. The two are often held together."
                          : "The patient should still have a discharge planning meeting before they leave."}
                      </p>
                    </div>
                  )}
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
                          <div key={form.label}>
                            {!form.url || form.url === "#" ? (
                              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300" title="No trust URL has been captured for this form yet. Get it from FOCUS in the meantime.">
                                <span className="text-2xl opacity-50">{form.icon || "\uD83D\uDCC4"}</span>
                                <span className="font-semibold text-gray-500 flex-1">{form.label}</span>
                                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full whitespace-nowrap">Link to confirm</span>
                              </div>
                            ) : (
                              <a href={form.url} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors no-underline border border-blue-200">
                                <span className="text-2xl">{form.icon || "\uD83D\uDCC4"}</span>
                                <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                                <Download className="w-5 h-5 text-blue-600" />
                              </a>
                            )}
                            {form.note && <p className="text-sm text-blue-700 mt-1 ml-12 italic">{form.note}</p>}
                          </div>
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
                            {!form.url || form.url === "#" ? (
                              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300" title="No completed example has been linked for this referral yet.">
                                <span className="text-2xl opacity-50">{"\u2728"}</span>
                                <span className="font-semibold text-gray-500 flex-1">{form.label}</span>
                                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full whitespace-nowrap">Example to add</span>
                              </div>
                            ) : (
                              <a href={form.url} className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl hover:from-amber-100 hover:to-yellow-100 transition-colors no-underline border border-amber-200">
                                <span className="text-2xl">{"\u2728"}</span>
                                <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                                <Eye className="w-5 h-5 text-amber-600" />
                              </a>
                            )}
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
                          <div key={form.label}>
                            {!form.url || form.url === "#" ? (
                              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300" title="No trust URL has been captured for this guide yet.">
                                <span className="text-2xl opacity-50">{"\uD83D\uDCDA"}</span>
                                <span className="font-semibold text-gray-500 flex-1">{form.label}</span>
                                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full whitespace-nowrap">Link to confirm</span>
                              </div>
                            ) : (
                              <a href={form.url} className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl hover:from-teal-100 hover:to-cyan-100 transition-colors no-underline border border-teal-200">
                                <span className="text-2xl">{"\uD83D\uDCDA"}</span>
                                <span className="font-semibold text-gray-800 flex-1">{form.label}</span>
                                <ExternalLink className="w-5 h-5 text-teal-600" />
                              </a>
                            )}
                            {form.note && <p className="text-sm text-teal-700 mt-1 ml-12 italic">{form.note}</p>}
                          </div>
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
                        <div>
                          <p className="text-sm text-gray-500 font-medium">{method.label}</p>
                          <p className="font-bold text-gray-900 text-xl flex items-center gap-1.5">
                            {method.value}
                            {(method.type === "email" || method.type === "phone") && method.value !== "Hidden in demo mode" && (
                              <CopyChip
                                value={method.value}
                                label={method.type === "email" ? "email address" : "phone number"}
                                className="!p-1.5"
                              />
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case note */}
              {rStep.type === "casenote" && (rStep.clipboardText || rStep.isDynamic) && (
                <div className="space-y-4">
                  {/* The box itself changes state on copy, not just the button -
                      the text is what you are about to paste, so that is where
                      the confirmation needs to land (Mike, 27 Jul). */}
                  <div
                    aria-live="polite"
                    className={`relative p-5 rounded-xl font-mono text-base leading-relaxed border-2 transition-colors duration-200 ${
                      copied
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400"
                        : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
                    }`}
                  >
                    {copied && (
                      <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    )}
                    {generateCaseNote()}
                  </div>
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
                        <button onClick={openFollowUp} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm">
                          <Calendar className="w-4 h-4" /> + Add Follow-up Task
                        </button>
                        {followUpAdded && (
                          <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1.5">
                            <Check className="w-4 h-4" /> Follow-up task added to the diary.
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Opens the Add Task screen{linkedPatient ? `, already filled in for ${linkedPatient.name}` : ""} so you can adjust it before saving.
                        </p>
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
              {hStep.tldr && (
                <div className="mb-5 px-4 py-2.5 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg text-sm text-indigo-900">
                  <strong>In a hurry:</strong> {hStep.tldr}
                </div>
              )}
              <div className="prose prose-gray max-w-none">
                {hStep.progressive ? (
                  <ProgressiveContent
                    content={hStep.content}
                    renderLine={(line) => renderGuideText(line, showRefs)}
                    size="base"
                  />
                ) : (
                  hStep.content.split("\n").map((line, i) => (
                    <p key={i} className={`${line.startsWith("- ") ? "ml-4" : ""} ${line === "" ? "h-2" : "mb-2"} text-gray-700 leading-relaxed`}>{renderGuideText(line, showRefs)}</p>
                  ))
                )}
              </div>
              {hStep.widget === "pay-band-picker" && <PayBandPicker />}
              {hStep.widget === "shift-checker" && <ShiftChecker />}
              {hStep.widget === "payslip-decoder" && <PayslipDecoder />}
              {hStep.widget === "pay-faq" && (
                <PayFaqAccordion topic={guideId === "pay-roster-faq" ? "all" : guideId === "payslip" ? "payslip" : guideId === "roster" ? "roster" : "leave"} />
              )}
              {hStep.tip && (
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900 leading-relaxed">
                      {hStep.tip.split("\n").map((line, i) => (<p key={i} className="mb-1">{renderGuideText(line, showRefs)}</p>))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* References panel - only when the toggle is on */}
        {!isReferral && guide?.sources && showRefs && (
          <div id="guide-references" className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-1">References</h3>
            <p className="text-xs text-slate-500 mb-3">The numbered markers in the text point here. National terms are the source of truth for pay; trust policies live on FOCUS.</p>
            <ol className="space-y-1.5 text-sm text-slate-600">
              {guide.sources.map((s) => (
                <li key={s.n} className="flex gap-2">
                  <span className="font-bold text-slate-600 flex-shrink-0">{s.n}.</span>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-nhs-blue hover:text-nhs-dark-blue break-words">{s.label}</a>
                  ) : (
                    <span>{s.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* SystmOne FOCUS how-to links for this guide */}
        {!isReferral && guide?.focus && guide.focus.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <h3 className="font-bold text-indigo-900 text-sm mb-1">On FOCUS (trust login needed)</h3>
            <p className="text-xs text-indigo-700 mb-3">SystmOne how-tos and the source trust policy - log into FOCUS on the trust network.</p>
            <div className="flex flex-wrap gap-2">
              {guide.focus.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 no-underline">
                  <ClipboardList className="w-4 h-4" /> {f.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Related in-app guides */}
        {!isReferral && guide?.related && guide.related.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="font-bold text-blue-900 text-sm mb-3">Related guides</h3>
            <div className="flex flex-wrap gap-2">
              {guide.related.map((r, i) => (
                <Link key={i} href={link(`/guides/${r.guideId}`)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 no-underline">
                  <BookOpen className="w-4 h-4" /> {r.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Side navigation arrows */}
        {currentStep > 0 && (
          <button onClick={handlePrev} style={{ left: "max(0px, calc(50vw - 672px))" }} className="fixed top-1/2 -translate-y-1/2 z-40 w-14 h-48 bg-nhs-blue/80 hover:bg-nhs-blue backdrop-blur-sm rounded-r-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:w-16" aria-label="Previous step">
            <ArrowLeft className="w-7 h-7 text-white" />
          </button>
        )}
        {!isComplete && (
          <button onClick={handleNext} disabled={!canProceed()} style={{ right: "max(0px, calc(50vw - 672px))" }} className="fixed top-1/2 -translate-y-1/2 z-40 w-14 h-48 bg-nhs-blue/80 hover:bg-nhs-blue backdrop-blur-sm rounded-l-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:w-16 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:w-14" aria-label="Next step">
            <ArrowRight className="w-7 h-7 text-white" />
          </button>
        )}
        {!isReferral && isComplete && (
          <button onClick={handleNext} style={{ right: "max(0px, calc(50vw - 672px))" }} className="fixed top-1/2 -translate-y-1/2 z-40 w-14 h-48 bg-green-600/80 hover:bg-green-700 backdrop-blur-sm rounded-l-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:w-16" aria-label="Next step">
            <Check className="w-7 h-7 text-white" />
          </button>
        )}

        {/* Referral completion actions */}
        {isReferral && isComplete && (
          <div className="flex gap-3">
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
              {confettiPieces.map((piece, i) => (
                <div key={i} className="absolute w-3 h-3 rounded-full" style={{ left: piece.left, top: `-5%`, backgroundColor: piece.color, animation: piece.animation, animationDelay: piece.delay }} />
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
            {/* Case note copy - suppressed for staff-life guides that are never
                recorded against a patient (guide.noCaseNote) */}
            {!guide.noCaseNote && (
            <div className={`bg-white rounded-xl border-2 overflow-hidden transition-colors duration-200 ${copied ? "border-emerald-400" : "border-amber-200"}`}>
              <div className={`px-6 py-3 border-b transition-colors duration-200 ${copied ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200" : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"}`}>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Clipboard className="w-5 h-5 text-amber-600" />}
                  Case Note Entry
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{copied ? "Copied - paste it into the patient's notes" : "Copy to the patient's notes"}</p>
              </div>
              <div className="p-6">
                {/* The text block itself confirms the copy, not just the button */}
                <div
                  aria-live="polite"
                  className={`relative p-4 rounded-xl font-mono text-sm leading-relaxed border whitespace-pre-wrap transition-colors duration-200 ${
                    copied
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400"
                      : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
                  }`}
                >
                  {copied && (
                    <span className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  )}
                  {(linkedPatient ? `Patient: ${linkedPatient.name}. ` : "") + (guide.caseNote ? guide.caseNote.replace(/\[DATE\]/g, todayDate).replace(/\[NURSE\]/g, caseNoteBy || "[NURSE]") : `${title} reviewed on ${todayDate}.${caseNoteBy ? ` Completed by ${caseNoteBy}.` : ""}`)}
                </div>
                <Button onClick={() => {
                  const text = `${linkedPatient ? `Patient: ${linkedPatient.name}. ` : ""}` + (guide.caseNote ? guide.caseNote.replace(/\[DATE\]/g, todayDate).replace(/\[NURSE\]/g, caseNoteBy || "[NURSE]") : `${title} reviewed on ${todayDate}.${caseNoteBy ? ` Completed by ${caseNoteBy}.` : ""}`);
                  handleCopy(text);
                }} className={`w-full mt-3 py-3 ${copied ? "bg-green-600 hover:bg-green-700" : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"}`}>
                  {copied ? <><Check className="w-5 h-5 mr-2" /> Copied!</> : <><Copy className="w-5 h-5 mr-2" /> Copy to Clipboard</>}
                </Button>
              </div>
            </div>
            )}

            {/* The linked job - mark it done, or say it is not finished and
                leave a state behind. "Mark complete" on a half-done job lies,
                and on a discharge barrier it lies expensively. */}
            {!isV2 && linkedJob && (
              <div className="bg-white rounded-xl border-2 border-teal-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-3 border-b border-teal-200">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-teal-600" /> {linkedJob.type === "ward" ? "Ward diary task" : "Linked job"}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {linkedJob.type === "ward"
                      ? `This guide is linked to a task in today's ${activeWard} diary`
                      : `${linkedJob.title}${linkedJob.patientName ? ` - ${linkedJob.patientName}` : ""}`}
                  </p>
                </div>
                <div className="p-6 space-y-3">
                  {linkedJob.status === "completed" ? (
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><Check className="w-5 h-5" /> Marked complete for today in the {activeWard} diary.</p>
                  ) : (
                    <>
                      {linkedJob.handback && (
                        <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2">
                          <HandbackBadge handback={linkedJob.handback} count={linkedJob.handbackCount} size="xs" />
                        </div>
                      )}
                      <Button onClick={() => toggleComplete(linkedJob.id, user?.name || "Unknown")} className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700">
                        <CheckCircle className="w-5 h-5 mr-2" /> {linkedJob.type === "ward" ? "Mark completed for today" : "Mark complete"}
                      </Button>
                      {/* Hidden when someone else holds it - it is not yours to
                          hand back. If it is unclaimed, you have just done the
                          work on it, so claim it on the way through. */}
                      {(!linkedJob.claimedBy || linkedJob.claimedBy === user?.name) && (
                        <>
                          <button
                            onClick={() => {
                              if (!linkedJob.claimedBy) {
                                claimTask(linkedJob.id, user?.name || "Unknown");
                              }
                              setShowHandBack(true);
                            }}
                            className="w-full py-2.5 rounded-lg border-2 border-indigo-300 text-indigo-800 font-semibold hover:bg-indigo-50 transition-colors inline-flex items-center justify-center gap-2"
                          >
                            <Undo2 className="w-4 h-4" />
                            Not finished - hand it back
                          </button>
                          <p className="text-xs text-gray-500 text-center">
                            Leaves a state on the job and builds a case note, so the next person is not guessing.
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Follow-up task - hidden in v2 (no job diary) and on staff-life
                guides (noCaseNote): the follow-up is a patient task */}
            {!isV2 && !guide.noCaseNote && (
              <div className="bg-white rounded-xl border-2 border-indigo-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b border-indigo-200">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600" /> Follow-up Task</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Add a reminder to your job diary</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">e.g. &ldquo;Chase outcome in 7 days&rdquo; or &ldquo;Revisit assessment in 14 days&rdquo;</p>
                  <button onClick={openFollowUp} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm">
                    <Calendar className="w-4 h-4" /> + Add Follow-up Task
                  </button>
                  {followUpAdded && (
                    <p className="text-green-600 text-sm font-medium mt-3 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Follow-up task added to the diary.
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Opens the Add Task screen{linkedPatient ? `, already filled in for ${linkedPatient.name}` : ""} so you can change the wording and date before saving. Optional - skip if not needed.
                  </p>
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

        {/* How-to: Printable / downloadable blank forms */}
        {!isReferral && guide.downloads && guide.downloads.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Download className="w-5 h-5 text-blue-600" /> Printable forms</h3>
            <div className="flex flex-wrap gap-2">
              {guide.downloads.map((d, i) => (
                <a key={i} href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-blue-800 hover:bg-blue-100 border border-blue-300 transition-colors no-underline">
                  <FileText className="w-4 h-4" /> {d.label}
                </a>
              ))}
            </div>
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
        <GuideFeedback guideId={guideId} />
      </div>

      {!isV2 && (
        <>
        <PatientPickerModal isOpen={showPatientPicker} onClose={() => setShowPatientPicker(false)} onSelect={handlePatientSelect} title={title} type={isReferral ? "referral" : "guide"} />

        {/* Follow-up task: the real Add Task screen, pre-filled from the guide */}
        <AddTaskModal
          isOpen={showAddFollowUp}
          onClose={() => setShowAddFollowUp(false)}
          activeWard={linkedPatient?.ward || activeWard}
          currentUserName={user?.name}
          defaultDate={followUpPrefill.date}
          prefill={followUpPrefill}
          onAdd={(task) => {
            addTask({
              ...task,
              id: task.id || `task-followup-${Date.now()}`,
              createdAt: task.createdAt || toLocalDateStr(),
              createdBy: task.createdBy || user?.name || "Unknown",
            } as DiaryTask);
            setShowAddFollowUp(false);
            setFollowUpAdded(true);
            setTimeout(() => setFollowUpAdded(false), 5000);
          }}
        />

        {/* Second door onto the hand-back sheet - same component as the diary */}
        {linkedJob && (
          <HandBackModal
            isOpen={showHandBack}
            onClose={() => setShowHandBack(false)}
            task={linkedJob}
            taskTitle={linkedJob.title}
            patientName={linkedJob.type === "ward" ? undefined : linkedJob.patientName}
            staffName={caseNoteBy || user?.name}
            onConfirm={(handback) => handBackTask(linkedJob.id, user?.name || "Unknown", handback)}
          />
        )}
        </>
      )}
    </MainLayout>
  );
}
