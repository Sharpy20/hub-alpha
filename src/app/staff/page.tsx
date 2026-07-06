"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import { DEMO_STAFF, WARDS } from "@/lib/data/staff";
import { StaffMember, UserRole } from "@/lib/types";
import { Search, Plus, X, Shield } from "lucide-react";

const ROLE_LABELS: Record<UserRole, string> = {
  staff: "Staff",
  lead: "Lead",
  manager: "Manager",
  ward_admin: "Ward Admin",
  senior_admin: "Senior Admin",
};

const ROLE_COLORS: Record<UserRole, string> = {
  staff: "bg-gray-100 text-gray-700",
  lead: "bg-blue-100 text-blue-700",
  manager: "bg-purple-100 text-purple-700",
  ward_admin: "bg-amber-100 text-amber-700",
  senior_admin: "bg-red-100 text-red-700",
};

export default function StaffPage() {
  const { user } = useApp();
  const canEdit = user && (user.role === "lead" || user.role === "manager" || user.role === "ward_admin" || user.role === "senior_admin");

  const [staffList, setStaffList] = useState<StaffMember[]>(DEMO_STAFF.filter(s => s.isActive));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWard, setFilterWard] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWards, setEditingWards] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("staff");
  const [newWards, setNewWards] = useState<string[]>([]);

  // Filter staff
  const filtered = staffList.filter(s => {
    const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = filterWard === "all" || s.ward === filterWard;
    return matchesSearch && matchesWard;
  });

  // Group by ward
  const groupedByWard: Record<string, StaffMember[]> = {};
  for (const s of filtered) {
    if (!groupedByWard[s.ward]) groupedByWard[s.ward] = [];
    groupedByWard[s.ward].push(s);
  }

  const handleStartEditWards = (staff: StaffMember) => {
    setEditingId(staff.id);
    // Find all wards this staff member appears in
    const memberWards = staffList.filter(s => s.name === staff.name).map(s => s.ward);
    setEditingWards(memberWards);
  };

  const handleSaveWards = (staff: StaffMember) => {
    const currentWards = staffList.filter(s => s.name === staff.name).map(s => s.ward);
    const wardsToAdd = editingWards.filter(w => !currentWards.includes(w));
    const wardsToRemove = currentWards.filter(w => !editingWards.includes(w));

    let updated = [...staffList];

    updated = updated.filter(s => !(s.name === staff.name && wardsToRemove.includes(s.ward)));

    for (const ward of wardsToAdd) {
      updated.push({
        // eslint-disable-next-line react-hooks/purity -- onClick handler, not render; the analyser cannot tell
        id: `s-new-${Date.now()}-${ward}`,
        name: staff.name,
        role: staff.role,
        ward,
        isActive: true,
        isContributor: staff.isContributor,
      });
    }

    setStaffList(updated);
    setEditingId(null);
  };

  const toggleEditWard = (ward: string) => {
    setEditingWards(prev =>
      prev.includes(ward) ? prev.filter(w => w !== ward) : [...prev, ward]
    );
  };

  const handleAddStaff = () => {
    if (!newName.trim() || newWards.length === 0) return;
    const updated = [...staffList];
    for (const ward of newWards) {
      updated.push({
        id: `s-new-${Date.now()}-${ward}`,
        name: newName.trim(),
        role: newRole,
        ward,
        isActive: true,
      });
    }
    setStaffList(updated);
    setNewName("");
    setNewRole("staff");
    setNewWards([]);
    setShowAddModal(false);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-500">Please log in to view the staff directory.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Staff Directory</h1>
              <p className="text-white/80 mt-1">
                {staffList.length} staff across {WARDS.length} wards
              </p>
            </div>
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Staff
              </button>
            )}
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-medium"
          >
            <option value="all">All Wards</option>
            {WARDS.map(w => (
              <option key={w} value={w}>{w} Ward</option>
            ))}
          </select>
        </div>

        {/* Staff list grouped by ward */}
        {Object.entries(groupedByWard).sort(([a], [b]) => a.localeCompare(b)).map(([ward, members]) => (
          <div key={ward} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">{ward} Ward</h2>
              <p className="text-xs text-gray-500">{members.length} staff</p>
            </div>
            <div className="divide-y divide-gray-100">
              {members.sort((a, b) => {
                const roleOrder: Record<UserRole, number> = { senior_admin: 0, ward_admin: 1, manager: 2, lead: 3, staff: 4 };
                return (roleOrder[a.role] ?? 5) - (roleOrder[b.role] ?? 5);
              }).map((staff) => (
                <div key={`${staff.id}-${ward}`} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{staff.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[staff.role]}`}>
                        {ROLE_LABELS[staff.role]}
                      </span>
                      {staff.isContributor && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Contributor
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ward assignment (editable) */}
                  {canEdit && editingId === staff.id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-wrap">
                        {WARDS.map(w => (
                          <button
                            key={w}
                            onClick={() => toggleEditWard(w)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              editingWards.includes(w)
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleSaveWards(staff)}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : canEdit ? (
                    <button
                      onClick={() => handleStartEditWards(staff)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Edit wards
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No staff found matching your search.</p>
          </div>
        )}

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <div role="dialog" aria-modal="true" aria-label="Add staff member" className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900">Add Staff Member</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  {(["staff", "lead", "manager", "ward_admin", "senior_admin"] as UserRole[]).map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward(s)</label>
                <div className="flex gap-2 flex-wrap">
                  {WARDS.map(w => (
                    <button
                      key={w}
                      onClick={() => setNewWards(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        newWards.includes(w)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStaff}
                  disabled={!newName.trim() || newWards.length === 0}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  Add Staff
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
