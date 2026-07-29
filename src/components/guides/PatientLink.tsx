"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Patient } from "@/lib/types";
import { PatientPickerModal } from "@/components/modals/PatientPickerModal";
import { useIsV2 } from "@/lib/hooks/useV2";

// "Link to Patient" block, styled to sit at the bottom of a guide's gradient
// header - matches the how-to/referral guide viewer exactly, so every guide
// looks the same. Controlled: the page owns the patient state and prefixes the
// linked name into its copy-out. Renders nothing in the limited/PII-free build.
export function PatientLink({
  patient,
  onChange,
  guideTitle,
  note,
}: {
  patient: Patient | null;
  onChange: (p: Patient | null) => void;
  guideTitle: string;
  note?: string;
}) {
  const isV2 = useIsV2();
  const [showPicker, setShowPicker] = useState(false);
  if (isV2) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/20">
      {patient ? (
        <div className="flex items-center justify-between bg-white/20 rounded-xl p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{patient.name}</p>
              <p className="text-white/70 text-sm truncate">
                {patient.ward} Ward
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
        >
          <UserPlus className="w-5 h-5" /> Link to Patient
        </button>
      )}
      <p className="text-white/80 text-sm text-center mt-2 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
        {note || "Adds the patient's name to the notes below"}
      </p>
      <PatientPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(p) => { onChange(p); setShowPicker(false); }}
        title={guideTitle}
        type="guide"
      />
    </div>
  );
}
