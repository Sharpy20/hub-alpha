"use client";

import { useState } from "react";
import { X, Plus, Pencil, Trash2, Check } from "lucide-react";
import { Patient } from "@/lib/types";
import { DEMO_PATIENTS } from "@/lib/data/tasks";

interface PatientNamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ward: string;
}

export function PatientNamesModal({ isOpen, onClose, ward }: PatientNamesModalProps) {
  const [patients, setPatients] = useState<Patient[]>(DEMO_PATIENTS.filter((p) => p.ward === ward));
  const [newName, setNewName] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      room: newRoom.trim() || "TBD",
      ward,
      status: "active",
      legalStatus: "informal",
      admissionDate: new Date().toISOString().split("T")[0],
    };
    setPatients((prev) => [...prev, newPatient]);
    setNewName("");
    setNewRoom("");
  };

  const handleEdit = (id: string) => {
    if (!editName.trim()) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: editName.trim() } : p))
    );
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const startEdit = (patient: Patient) => {
    setEditingId(patient.id);
    setEditName(patient.name);
  };

  const activePatients = patients.filter((p) => p.status !== "discharged");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>👥</span> Manage Patient Names
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Add new patient */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Patient name..."
              className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
            <input
              type="text"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              placeholder="Room"
              className="w-20 p-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              aria-label="Add patient"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Patient list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activePatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                {editingId === patient.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 p-1 border-2 border-teal-300 rounded focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleEdit(patient.id)}
                    />
                    <button
                      onClick={() => handleEdit(patient.id)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      aria-label="Save changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-gray-400 hover:bg-gray-200 rounded"
                      aria-label="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800">{patient.name}</span>
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-200 rounded">
                      {patient.room}
                    </span>
                    <button
                      onClick={() => startEdit(patient)}
                      className="p-1 text-gray-400 hover:bg-gray-200 rounded"
                      aria-label="Edit patient"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="p-1 text-red-400 hover:bg-red-100 rounded"
                      aria-label="Delete patient"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}

            {activePatients.length === 0 && (
              <p className="text-center text-gray-400 py-4">No patients on ward</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
