"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Patient } from "@/lib/types";
import { PatientPickerModal } from "@/components/modals";
import { useIsV2 } from "@/lib/hooks/useV2";

// Reusable "Link to Patient" banner for the bespoke builder/checker guides.
// Controlled: the page owns the patient state and prefixes the linked name into
// its copy-out. Renders nothing in the limited/PII-free build (root), matching
// the guide viewer's own patient link.
export function PatientLink({
  patient,
  onChange,
  guideTitle,
}: {
  patient: Patient | null;
  onChange: (p: Patient | null) => void;
  guideTitle: string;
}) {
  const isV2 = useIsV2();
  const [showPicker, setShowPicker] = useState(false);
  if (isV2) return null;

  return (
    <>
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 flex items-center justify-between gap-3 flex-wrap">
        {patient ? (
          <>
            <span className="flex items-center gap-2 text-sm min-w-0">
              <UserPlus className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="font-semibold text-gray-800 truncate">{patient.name}</span>
              <span className="text-gray-400 truncate">
                {patient.ward} Ward{patient.room ? ` · Room ${patient.room}` : ""}
              </span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPicker(true)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                Change
              </button>
              <button
                onClick={() => onChange(null)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
              <UserPlus className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              Link this to a patient to add their name to the notes
            </span>
            <button
              onClick={() => setShowPicker(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
            >
              Link to Patient
            </button>
          </>
        )}
      </div>
      <PatientPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(p) => { onChange(p); setShowPicker(false); }}
        title={guideTitle}
        type="guide"
      />
    </>
  );
}
