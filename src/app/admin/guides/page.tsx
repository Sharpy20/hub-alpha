"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, Plus, Shield } from "lucide-react";
import { MainLayout } from "@/components/layout";
import { Button, ConfirmDialog } from "@/components/ui";
import { useApp } from "@/app/providers";
import { useCanEdit } from "@/lib/hooks/useCanEdit";
import { useV2Href } from "@/lib/hooks/useV2";
import { useStoredGuides } from "@/lib/hooks/useStoredGuides";
import { ALL_GUIDES } from "@/lib/data/guides/catalog";
import { GUIDES, GUIDE_CONFIG } from "@/lib/data/guides/howto-guides";
import { WORKFLOWS } from "@/lib/data/guides/referral-workflows";
import {
  deleteStoredGuide, saveStoredGuide, slugFromTitle, type StoredGuide,
} from "@/lib/data/guides/guide-store";
import {
  blankGuide, copyOfBuiltIn, duplicateStep, moveStep, newStep, referralTemplate, uniqueGuideId,
  DEFAULT_LOOK, type EditorStep,
} from "@/lib/data/guides/editor-model";
import { hasLegacyQuestions, migrateWorkflow } from "@/lib/data/guides/legacy-steps";
import { GuideList } from "@/components/admin/guide-editor/GuideList";
import { StepEditor } from "@/components/admin/guide-editor/StepEditor";
import { DetailsPanel, ExtrasPanel, RouteCheck } from "@/components/admin/guide-editor/GuidePanels";
import { smallButton } from "@/components/admin/guide-editor/fields";

function download(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// The look a built-in guide has today, so an edited copy starts out identical.
function lookOfBuiltIn(id: string) {
  const item = ALL_GUIDES.find((g) => g.viewerPath === `/guides/${id}`);
  if (item) return { icon: item.icon, gradient: item.gradient, category: item.category };
  const cfg = GUIDE_CONFIG[id];
  return cfg ? { icon: cfg.icon, gradient: cfg.gradient, category: cfg.category } : DEFAULT_LOOK;
}

function Editor() {
  const { user } = useApp();
  const { canEdit } = useCanEdit();
  const router = useRouter();
  const search = useSearchParams();
  const link = useV2Href();
  const { guides: stored, ready } = useStoredGuides();

  const [working, setWorking] = useState<StoredGuide | null>(null);
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [stepToDelete, setStepToDelete] = useState<number | null>(null);
  const [toRemove, setToRemove] = useState<StoredGuide | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  const wanted = search.get("edit");

  // A link such as /admin/guides?edit=news2 opens that guide straight away.
  useEffect(() => {
    if (!ready || !wanted || working) return;
    const mine = stored.find((g) => g.id === wanted);
    if (mine) {
      setWorking(mine);
      return;
    }
    if (WORKFLOWS[wanted]) setWorking(copyOfBuiltIn("workflow", WORKFLOWS[wanted], lookOfBuiltIn(wanted)));
    else if (GUIDES[wanted]) setWorking(copyOfBuiltIn("guide", GUIDES[wanted], lookOfBuiltIn(wanted)));
  }, [ready, wanted, stored, working]);

  useEffect(() => {
    if (user && !canEdit) router.push("/");
  }, [user, canEdit, router]);

  if (!user || !canEdit) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-nhs-black mb-2">Access denied</h1>
          <p className="text-nhs-dark-grey">You need editor or admin permissions to use the guide editor.</p>
        </div>
      </MainLayout>
    );
  }

  const takenIds = () => [...stored.map((g) => g.id), ...Object.keys(GUIDES), ...Object.keys(WORKFLOWS), ...ALL_GUIDES.map((g) => g.viewerPath.replace("/guides/", ""))];

  // Every change is written to the store straight away. A built-in guide only
  // gets a saved copy once something in it has actually changed.
  const change = (next: StoredGuide) => {
    setWorking(next);
    const ok = saveStoredGuide(next);
    setSaveFailed(!ok);
    if (ok) setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
  };

  const setSteps = (steps: EditorStep[]) => {
    if (!working) return;
    change({ ...working, data: { ...working.data, steps } } as StoredGuide);
  };

  const create = (title: string, kind: "guide" | "workflow") => {
    const id = uniqueGuideId(slugFromTitle(title), takenIds());
    const made = kind === "workflow" ? referralTemplate(id, title) : blankGuide(id, title);
    change(made);
    setOpenStep(made.data.steps[0]?.id ?? null);
  };

  const insertToken = (token: string) => {
    if (!working) return;
    if (working.kind === "guide") {
      const existing = working.data.caseNote;
      const text = existing === undefined
        ? `${working.data.title} reviewed on [DATE]. ${token} Completed by [NURSE].`
        : `${existing}${existing && !existing.endsWith(" ") ? " " : ""}${token}`;
      const { noCaseNote: _drop, ...rest } = working.data;
      void _drop;
      change({ ...working, data: { ...rest, caseNote: text } });
      setNotice(`Added ${token} to the case note.`);
      return;
    }
    const at = working.data.steps.findIndex((s) => s.type === "casenote");
    if (at < 0) {
      setNotice("This referral has no case note step to add it to.");
      return;
    }
    const steps = working.data.steps.map((s, i) => {
      if (i !== at) return s;
      const cur = s.clipboardText ?? "";
      return { ...s, clipboardText: `${cur}${cur && !cur.endsWith(" ") ? " " : ""}${token}` };
    });
    change({ ...working, data: { ...working.data, steps } });
    setNotice(`Added ${token} to the case note step.`);
  };

  const removeStored = (g: StoredGuide) => {
    deleteStoredGuide(g.id);
    if (working?.id === g.id) setWorking(null);
    setToRemove(null);
  };

  if (!working) {
    return (
      <MainLayout>
        <div className="space-y-6 max-w-4xl">
          <div>
            <Link href={link("/admin")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-nhs-blue hover:underline">
              <ArrowLeft className="w-4 h-4" /> Admin
            </Link>
            <h1 className="text-3xl font-bold text-nhs-dark-blue mt-2">Guide editor</h1>
            <p className="text-nhs-dark-grey mt-1">Write a guide, add questions and branching where it needs them, and see the routes a reader can take.</p>
          </div>
          <GuideList
            stored={stored}
            onCreate={create}
            onOpenStored={(g) => { setWorking(g); setOpenStep(null); }}
            onOpenBuiltIn={(id) => {
              const mine = stored.find((g) => g.id === id);
              if (mine) { setWorking(mine); return; }
              if (WORKFLOWS[id]) setWorking(copyOfBuiltIn("workflow", WORKFLOWS[id], lookOfBuiltIn(id)));
              else if (GUIDES[id]) setWorking(copyOfBuiltIn("guide", GUIDES[id], lookOfBuiltIn(id)));
              setOpenStep(null);
            }}
            onDeleteStored={setToRemove}
            onImport={(guides) => guides.forEach((g) => saveStoredGuide(g))}
            onExportAll={() => download("wardhub-guides.json", stored)}
            link={link}
          />
        </div>
        <ConfirmDialog
          isOpen={toRemove !== null}
          title={toRemove?.basedOn ? "Put the built-in guide back?" : "Delete this guide?"}
          message={toRemove?.basedOn ? "Your edited copy is removed and the built-in version shows again." : "This guide is removed from this browser. Download it first if you may want it back."}
          variant="danger"
          confirmLabel={toRemove?.basedOn ? "Put it back" : "Delete"}
          onConfirm={() => toRemove && removeStored(toRemove)}
          onCancel={() => setToRemove(null)}
        />
      </MainLayout>
    );
  }

  const steps = working.data.steps as EditorStep[];
  const isStored = stored.some((g) => g.id === working.id);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => { setWorking(null); setNotice(""); router.replace("/admin/guides"); }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-nhs-blue hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> All guides
            </button>
            <h1 className="text-3xl font-bold text-nhs-dark-blue mt-2">{working.data.title || "Untitled guide"}</h1>
            <p className="text-sm text-nhs-dark-grey mt-1" role="status">
              {saveFailed
                ? "Could not save. The browser's storage may be full or switched off."
                : savedAt ? `Saved on this browser at ${savedAt}.` : isStored ? "Saved on this browser." : "Not saved yet. It saves as soon as you change something."}
              {working.basedOn && " This is an edited copy of a built-in guide."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={link(`/guides/${working.id}`)} target="_blank" className={`${smallButton} inline-flex items-center gap-1.5 no-underline`}>
              <ExternalLink className="w-4 h-4" /> View guide
            </Link>
            <button type="button" className={`${smallButton} inline-flex items-center gap-1.5`} onClick={() => download(`${working.id}.json`, [working])}>
              <Download className="w-4 h-4" /> Download
            </button>
            {isStored && (
              <button type="button" className={`${smallButton} text-nhs-red`} onClick={() => setToRemove(working)}>
                {working.basedOn ? "Put the built-in back" : "Delete"}
              </button>
            )}
          </div>
        </div>

        {working.kind === "workflow" && hasLegacyQuestions(working.data.steps) && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-wrap items-center gap-3">
            <p className="flex-1 min-w-[16rem] text-sm text-amber-900">
              This referral still uses the older fixed question steps (consent, legal status, S117, area). Question blocks do the same job and can be edited like any other step. Converting keeps every answer, every case note word and every form and contact filter exactly as they are.
            </p>
            <Button
              onClick={() => {
                change({ ...working, data: migrateWorkflow(working.data) });
                setNotice("Converted to Question blocks.");
              }}
            >
              Convert to Question blocks
            </Button>
          </div>
        )}

        {notice && <p role="status" className="text-sm font-semibold text-nhs-dark-blue bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">{notice}</p>}

        <DetailsPanel guide={working} onChange={change} />

        <section aria-label="Steps" className="space-y-3">
          <h2 className="text-lg font-bold text-nhs-dark-blue">Steps</h2>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <StepEditor
                key={step.id}
                step={step}
                index={index}
                steps={steps}
                kind={working.kind}
                open={openStep === step.id}
                onToggle={() => setOpenStep(openStep === step.id ? null : step.id)}
                onChange={(s) => setSteps(steps.map((x, i) => (i === index ? s : x)))}
                onMove={(dir) => setSteps(moveStep(steps, index, index + dir))}
                onDuplicate={() => {
                  const copy = duplicateStep(step, steps);
                  const next = steps.slice();
                  next.splice(index + 1, 0, copy);
                  setSteps(next);
                  setOpenStep(copy.id);
                }}
                onDelete={() => setStepToDelete(index)}
                onInsertToken={insertToken}
              />
            ))}
          </ol>
          <Button
            variant="outline"
            onClick={() => {
              const added = newStep(working.kind, steps);
              setSteps([...steps, added]);
              setOpenStep(added.id);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add a step
          </Button>
        </section>

        <ExtrasPanel guide={working} onChange={change} />
        <RouteCheck guide={working} />
      </div>

      <ConfirmDialog
        isOpen={stepToDelete !== null}
        title="Delete this step?"
        message={
          stepToDelete !== null && steps[stepToDelete]?.branch
            ? "This step asks a question. Steps that depend on its answer will be left waiting on something that no longer exists, and the checks will flag them."
            : "The step and its text are removed. There is no undo."
        }
        variant="danger"
        confirmLabel="Delete step"
        onConfirm={() => {
          if (stepToDelete !== null) setSteps(steps.filter((_, i) => i !== stepToDelete));
          setStepToDelete(null);
        }}
        onCancel={() => setStepToDelete(null)}
      />
      <ConfirmDialog
        isOpen={toRemove !== null}
        title={toRemove?.basedOn ? "Put the built-in guide back?" : "Delete this guide?"}
        message={toRemove?.basedOn ? "Your edited copy is removed and the built-in version shows again." : "This guide is removed from this browser. Download it first if you may want it back."}
        variant="danger"
        confirmLabel={toRemove?.basedOn ? "Put it back" : "Delete"}
        onConfirm={() => toRemove && removeStored(toRemove)}
        onCancel={() => setToRemove(null)}
      />
    </MainLayout>
  );
}

export default function GuideEditorPage() {
  return (
    <Suspense fallback={null}>
      <Editor />
    </Suspense>
  );
}
