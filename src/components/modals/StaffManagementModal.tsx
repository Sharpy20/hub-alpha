"use client";

import { useState } from "react";
import { X, Plus, Pencil, Trash2, Check } from "lucide-react";
import { StaffMember } from "@/lib/types";
import { DEMO_STAFF } from "@/lib/data/staff";

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  ward: string;
}

export function StaffManagementModal({ isOpen, onClose, ward }: StaffManagementModalProps) {
  const [staff, setStaff] = useState<StaffMember[]>(DEMO_STAFF.filter((s) => s.ward === ward));
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newName.trim(),
      role: "normal",
      ward,
      isActive: true,
    };
    setStaff((prev) => [...prev, newStaff]);
    setNewName("");
  };

  const handleEdit = (id: string) => {
    if (!editName.trim()) return;
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: editName.trim() } : s))
    );
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const startEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setEditName(member.name);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>👥</span> Manage Staff Names
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
          {/* Add new staff */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add staff name..."
              className="flex-1 p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              aria-label="Add staff member"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Staff list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {staff.filter((s) => s.isActive).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                {editingId === member.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 p-1 border-2 border-indigo-300 rounded focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleEdit(member.id)}
                    />
                    <button
                      onClick={() => handleEdit(member.id)}
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
                    <span className="flex-1 font-medium text-gray-800">{member.name}</span>
                    <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-gray-200 rounded">
                      {member.role.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => startEdit(member)}
                      className="p-1 text-gray-400 hover:bg-gray-200 rounded"
                      aria-label="Edit staff member"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1 text-red-400 hover:bg-red-100 rounded"
                      aria-label="Delete staff member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}

            {staff.filter((s) => s.isActive).length === 0 && (
              <p className="text-center text-gray-400 py-4">No staff members added yet</p>
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
