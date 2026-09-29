"use client";

import type { WorkflowForm, WorkflowStep, SubmissionMethod } from "@/lib/data/guides/referral-workflows";
import { BlockPanel, SelectField, TextAreaField, TextField } from "./fields";
import { ListEditor, type Column } from "./ListEditor";

export const STEP_TYPES: { value: WorkflowStep["type"]; label: string; help: string }[] = [
  { value: "info", label: "Information", help: "Plain text the reader works through." },
  { value: "criteria", label: "Criteria check", help: "The reader ticks a box to confirm the criteria are met." },
  { value: "consent", label: "Consent", help: "Yes or no, and the answer can go into the case note." },
  { value: "section", label: "MHA section", help: "Uses the built-in list of Mental Health Act sections." },
  { value: "s117", label: "Section 117 status", help: "Uses the built-in section 117 options." },
  { value: "area", label: "Derby City or County", help: "Uses the built-in area options." },
  { value: "forms", label: "Forms and guides", help: "Blank forms, worked examples and related guides." },
  { value: "submission", label: "Where to send it", help: "Email, phone or portal, optionally by area." },
  { value: "casenote", label: "Case note", help: "Text the reader copies into the patient record." },
  { value: "reminder", label: "Diary reminder", help: "A prompt to update the ward diary." },
  { value: "gdpr", label: "Data protection reminder", help: "Delete downloaded forms." },
];

const AREA_OPTIONS = [
  { value: "", label: "Both areas" },
  { value: "city", label: "Derby City" },
  { value: "county", label: "Derbyshire County" },
];

const FORM_COLUMNS: Column[] = [
  { key: "label", label: "Name" },
  { key: "url", label: "Link", placeholder: "https://... or # until you have it" },
  { key: "note", label: "Note (optional)", optional: true },
  { key: "icon", label: "Icon (optional)", optional: true },
  { key: "area", label: "Shown for", kind: "select", options: AREA_OPTIONS, optional: true },
];

const METHOD_COLUMNS: Column[] = [
  { key: "type", label: "How", kind: "select", options: [{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }, { value: "portal", label: "Portal" }] },
  { key: "label", label: "Name" },
  { key: "value", label: "Address or number", placeholder: "Hidden in demo mode if not public" },
  { key: "area", label: "Shown for", kind: "select", options: AREA_OPTIONS, optional: true },
];

export function WorkflowFields({ step, onChange }: { step: WorkflowStep; onChange: (s: WorkflowStep) => void }) {
  const type = STEP_TYPES.find((t) => t.value === step.type);
  const patch = (p: Partial<WorkflowStep>) => onChange({ ...step, ...p });
  const forms = step.forms ?? { blank: [], wagoll: [], otherGuides: [] };
  const setForms = (key: "blank" | "wagoll" | "otherGuides", list: WorkflowForm[]) => patch({ forms: { ...forms, [key]: list } });
  const newForm = (): WorkflowForm => ({ label: "", url: "#" });
  const newMethod = (): SubmissionMethod => ({ type: "email", label: "", value: "" });

  return (
    <div className="space-y-3">
      <SelectField
        label="What kind of step is this?"
        value={step.type}
        onChange={(v) => patch({ type: v as WorkflowStep["type"] })}
        options={STEP_TYPES.map((t) => ({ value: t.value, label: t.label }))}
        hint={type?.help}
      />

      {(step.type === "criteria" || step.type === "reminder") && (
        <TextField
          label={step.type === "criteria" ? "Words next to the tick box" : "Words next to the tick box (leave empty for none)"}
          value={step.checkboxLabel ?? ""}
          onChange={(checkboxLabel) => patch({ checkboxLabel })}
        />
      )}

      {step.type === "consent" && (
        <BlockPanel title="Consent wording">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Yes button" value={step.consentYesLabel ?? ""} onChange={(v) => patch({ consentYesLabel: v || undefined })} />
            <TextField label="No button" value={step.consentNoLabel ?? ""} onChange={(v) => patch({ consentNoLabel: v || undefined })} />
            <TextField label="Under the yes button" value={step.consentYesDesc ?? ""} onChange={(v) => patch({ consentYesDesc: v || undefined })} />
            <TextField label="Under the no button" value={step.consentNoDesc ?? ""} onChange={(v) => patch({ consentNoDesc: v || undefined })} />
            <TextField label="Case note wording for yes" value={step.consentYesNote ?? ""} onChange={(v) => patch({ consentYesNote: v || undefined })} hint="Replaces [CONSENT] in the case note." />
            <TextField label="Case note wording for no" value={step.consentNoNote ?? ""} onChange={(v) => patch({ consentNoNote: v || undefined })} />
          </div>
          <TextField
            label="Second question: was the person told? (optional)"
            value={step.informedQuestion ?? ""}
            onChange={(v) => patch({ informedQuestion: v || undefined })}
            hint="Replaces [INFORMED] in the case note."
          />
          {step.informedQuestion !== undefined && (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Yes button" value={step.informedYesLabel ?? ""} onChange={(v) => patch({ informedYesLabel: v || undefined })} />
              <TextField label="No button" value={step.informedNoLabel ?? ""} onChange={(v) => patch({ informedNoLabel: v || undefined })} />
              <TextField label="Case note wording for yes" value={step.informedYesNote ?? ""} onChange={(v) => patch({ informedYesNote: v || undefined })} />
              <TextField label="Case note wording for no" value={step.informedNoNote ?? ""} onChange={(v) => patch({ informedNoNote: v || undefined })} />
            </div>
          )}
        </BlockPanel>
      )}

      {step.type === "forms" && (
        <>
          <BlockPanel title="Blank forms">
            <ListEditor items={forms.blank} columns={FORM_COLUMNS} onChange={(l) => setForms("blank", l)} makeNew={newForm} addLabel="Add a blank form" empty="No blank forms yet." />
          </BlockPanel>
          <BlockPanel title="Worked examples (WAGOLL)">
            <ListEditor items={forms.wagoll} columns={FORM_COLUMNS} onChange={(l) => setForms("wagoll", l)} makeNew={newForm} addLabel="Add an example" empty="No examples yet." />
          </BlockPanel>
          <BlockPanel title="Other guides and links">
            <ListEditor items={forms.otherGuides} columns={FORM_COLUMNS} onChange={(l) => setForms("otherGuides", l)} makeNew={newForm} addLabel="Add a link" empty="Nothing here yet." />
          </BlockPanel>
        </>
      )}

      {step.type === "submission" && (
        <BlockPanel title="Where to send it">
          <ListEditor items={step.methods ?? []} columns={METHOD_COLUMNS} onChange={(methods) => patch({ methods })} makeNew={newMethod} addLabel="Add a way to send it" empty="No methods yet." />
        </BlockPanel>
      )}

      {step.type === "casenote" && (
        <TextAreaField
          label="Case note text"
          rows={5}
          value={step.clipboardText ?? ""}
          onChange={(clipboardText) => patch({ clipboardText })}
          hint="[DATE] fills in today. [CONSENT], [INFORMED], [S117] and [SECTION] fill from the earlier answers. [BRANCH:q1] fills from a question you added."
        />
      )}
    </div>
  );
}
