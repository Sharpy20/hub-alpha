"use client";

import { useState, useMemo } from "react";
import { X, Search, User, Calendar, AlertTriangle, Check } from "lucide-react";
import { DEMO_PATIENTS, WARDS } from "@/lib/data/tasks";
import { Patient } from "@/lib/types";

interface PatientPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patient: Patient) => void;
  title: string; // e.g., "IMHA / Advocacy Referral" or "NEWS2 Guide"
  type: "referral" | "guide";
}

export function PatientPickerModal({
  isOpen,
  onClose,
  onSelect,
  title,
  type,
}: PatientPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWard, setSelectedWard] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Filter patients based on search and ward
  const filteredPatients = useMemo(() => {
    return DEMO_PATIENTS.filter((patient) => {
      // Only show active patients (not discharged)
      if (patient.status === "discharged") return false;

      // Filter by ward
      if (selectedWard !== "all" && patient.ward !== selectedWard) return false;

      // Filter by search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          patient.name.toLowerCase().includes(search) ||
          patient.ward.toLowerCase().includes(search) ||
          patient.room?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [searchTerm, selectedWard]);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedPatient) {
      onSelect(selectedPatient);
      setShowConfirmation(false);
      setSelectedPatient(null);
      setSearchTerm("");
      onClose();
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedPatient(null);
  };

  if (!isOpen) return null;

  // Confirmation screen
  if (showConfirmation && selectedPatient) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={handleCancel}>
        <div
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Link Patient to {type === "referral" ? "Referral" : "Guide"}?</h2>
                <p className="text-white/80 text-sm">This action will create records</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Selected patient info */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <p className="text-sm text-indigo-600 font-medium mb-1">Selected Patient</p>
              <p className="text-lg font-bold text-gray-900">{selectedPatient.name}</p>
              <p className="text-sm text-gray-600">{selectedPatient.ward} Ward - Room {selectedPatient.room}</p>
            </div>

            {/* What will happen */}
            <div className="space-y-3">
              <p className="font-semibold text-gray-900">Linking this patient will:</p>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Create a Job Diary Task</p>
                  <p className="text-sm text-gray-600">
                    A new task will be added to your diary for "{title}" linked to this patient
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Create an Audit Log Entry</p>
                  <p className="text-sm text-gray-600">
                    An entry will be recorded for SystemOne showing this {type} was accessed for this patient
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="text-sm text-gray-500 italic">
              This helps track clinical activity and ensures proper documentation.
            </p>
          </div>

          {/* Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirm & Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Patient selection screen
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Link to Patient</h2>
              <p className="text-white/80 text-sm">{title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients by name, ward, or room..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedWard("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedWard === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Wards
            </button>
            {WARDS.map((ward) => (
              <button
                key={ward}
                onClick={() => setSelectedWard(ward)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedWard === ward
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {ward}
              </button>
            ))}
          </div>
        </div>

        {/* Patient list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No patients found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientClick(patient)}
                  className="w-full p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl text-left transition-colors border-2 border-transparent hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600">
                        {patient.ward} Ward - Room {patient.room}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        patient.status === "active"
                          ? "bg-green-100 text-green-700"
                          : patient.status === "pending_discharge"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {patient.status === "active" ? "Active" :
                         patient.status === "pending_discharge" ? "Pending Discharge" :
                         patient.status === "on_leave" ? "On Leave" : patient.status}
                      </span>
                    </div>
                  </div>
                  {patient.alerts && patient.alerts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {patient.alerts.slice(0, 3).map((alert, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                        >
                          {alert}
                        </span>
                      ))}
                      {patient.alerts.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{patient.alerts.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            Select a patient to link this {type} to their record
          </p>
        </div>
      </div>
    </div>
  );
}
