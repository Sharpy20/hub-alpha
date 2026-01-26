"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, UserRole } from "@/app/providers";
import { MainLayout } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";
import { WARDS } from "@/lib/types";
import { getStaffByWard, DEMO_STAFF } from "@/lib/data/staff";
import { User, Building2, Shield, Info, Sparkles, ChevronDown } from "lucide-react";

const ROLES: { value: UserRole; label: string; description: string; icon: string; gradient: string }[] = [
  {
    value: "normal",
    label: "Normal User",
    description: "View content, add tasks, suggest links",
    icon: "👤",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    value: "ward_admin",
    label: "Ward Admin",
    description: "Manage ward, approve discharges, view logs",
    icon: "🏥",
    gradient: "from-purple-500 to-purple-700",
  },
  {
    value: "contributor",
    label: "Contributor",
    description: "Create and edit workflows and guides",
    icon: "✍️",
    gradient: "from-amber-500 to-amber-700",
  },
  {
    value: "senior_admin",
    label: "Senior Admin",
    description: "Full access, user management, approvals",
    icon: "👑",
    gradient: "from-rose-500 to-rose-700",
  },
];

// Helper to get role icon
const getRoleIcon = (role: UserRole): string => {
  switch (role) {
    case "ward_admin":
      return "🏥";
    case "senior_admin":
      return "👑";
    case "contributor":
      return "✍️";
    default:
      return "👤";
  }
};

const WARD_ICONS: Record<string, string> = {
  byron: "📝",
  shelley: "🌊",
  keats: "🌹",
  wordsworth: "🏔️",
  dickinson: "🦋",
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useApp();
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [ward, setWard] = useState("byron");

  // Get staff for selected ward - capitalize ward name for lookup
  // Staff data uses "Byron", "Shelley" etc., but WARDS uses lowercase IDs
  const capitalizedWard = ward.charAt(0).toUpperCase() + ward.slice(1);

  // Get staff directly - no useMemo needed for this small dataset
  const wardStaff = getStaffByWard(capitalizedWard);

  // Get selected staff member
  const selectedStaff = selectedStaffId
    ? DEMO_STAFF.find((s) => s.id === selectedStaffId)
    : undefined;

  // Reset staff selection when ward changes
  const handleWardChange = (newWard: string) => {
    setWard(newWard);
    setSelectedStaffId(""); // Clear selection when ward changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff) {
      setUser({
        name: selectedStaff.name,
        role: selectedStaff.role,
        ward: ward,
      });
      router.push("/");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto mt-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Demo Login
                <Sparkles className="w-5 h-5" />
              </h1>
              <p className="text-white/80">Enter your details to explore the demo</p>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ward selection - FIRST */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  1. Select Your Ward
                </label>
                <p className="text-xs text-gray-500 mb-3">Just pick one - it&apos;s only a demo!</p>
                <div className="grid grid-cols-5 gap-2">
                  {WARDS.map((w) => (
                    <label
                      key={w.id}
                      className={`flex flex-col items-center gap-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        ward === w.id
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ward"
                        value={w.id}
                        checked={ward === w.id}
                        onChange={(e) => handleWardChange(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{WARD_ICONS[w.id] || "🏥"}</span>
                      <p className={`text-xs font-bold text-center ${ward === w.id ? "text-purple-700" : "text-gray-600"}`}>
                        {w.name.replace(" Ward", "")}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Staff selection - SECOND */}
              <div>
                <label
                  htmlFor="staffSelect"
                  className="block text-sm font-bold text-gray-800 mb-2"
                >
                  <User className="w-4 h-4 inline mr-1" />
                  2. Select Your Name
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Just pick one - it&apos;s only a demo! ({wardStaff.length} staff on {capitalizedWard} Ward)
                </p>
                <div className="relative">
                  <select
                    id="staffSelect"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg appearance-none bg-white pr-10"
                    required
                  >
                    <option value="">Choose a staff member...</option>
                    {wardStaff.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {getRoleIcon(staff.role)} {staff.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {/* Show selected staff info */}
                {selectedStaff && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getRoleIcon(selectedStaff.role)}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedStaff.name}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {selectedStaff.role.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Role info - THIRD (read-only, based on selected staff) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  <Shield className="w-4 h-4 inline mr-1" />
                  3. Your Role (based on staff selection)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => {
                    const isSelected = selectedStaff?.role === r.value;
                    return (
                      <div
                        key={r.value}
                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                          isSelected
                            ? `border-transparent bg-gradient-to-br ${r.gradient} text-white shadow-lg scale-[1.02]`
                            : "border-gray-200 bg-gray-50 opacity-50"
                        }`}
                      >
                        <span className="text-3xl">{r.icon}</span>
                        <div className="text-center">
                          <p className="font-bold text-sm">{r.label}</p>
                          <p className={`text-xs mt-1 ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                            {r.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Role is determined by the staff member you select
                </p>
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  In the live version, access will require approval from your ward administrator.
                </p>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={!selectedStaff}
                className="w-full py-4 text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Enter Demo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
